import {translateMaintenance} from './maintenance-translation-v3.mjs';
import {pipeline,env} from './transformers.js';
env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;env.useWasmCache=true;
let active,activePair;
const publicDownloads=[];
let cacheOnly=false;
const safetyPhrases={en:{'do not operate this equipment.':'No opere este equipo.','do not start the motor.':'No encienda el motor.'},es:{'no opere este equipo.':'Do not operate this equipment.','no encienda el motor.':'Do not start the motor.'}};
const revisions={en:{model:'Xenova/opus-mt-en-es',revision:'4b002a4c7edd54a7ced58877258b87f7efd3f892'},es:{model:'Xenova/opus-mt-es-en',revision:'eadfd7c658a9d8929ac3b8e996b68a68e2c7d480'}};
const originalFetch=self.fetch.bind(self);
self.fetch=async(input,options={})=>{const request=new Request(input,options),url=new URL(request.url);if(request.method!=='GET'||url.search||url.origin!==self.location.origin&&!['https://huggingface.co','https://cdn.jsdelivr.net'].includes(url.origin))throw Error('Private translator only downloads public model files');if(cacheOnly){const cached=await caches.match(request);if(!cached)throw Error('Offline model not cached');return cached;}publicDownloads.push({method:'GET',host:url.hostname,kind:'public model/runtime file'});return originalFetch(new Request(request,{credentials:'omit',referrerPolicy:'no-referrer'}));};
let queue=Promise.resolve();
self.onmessage=({data})=>{queue=queue.then(async()=>{const {id,text,source}=data;cacheOnly=data.cacheOnly===true;try{if(!['en','es'].includes(source)||typeof text!=='string'||text.length>6000)throw Error('Invalid text');if(activePair!==source){await active?.dispose();const spec=revisions[source];active=await pipeline('translation',spec.model,{revision:spec.revision,device:'wasm',dtype:'q8'});activePair=source;}
 const prefix=text.match(/^(?:TEST ONLY|SOLO PRUEBA)(?:\s*[—:-]\s*(?:[A-Z]+[-_]\d+)?\s*:?\s*)?/i)?.[0]||'';
 const body=text.slice(prefix.length),sentences=body.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÜÑ¿¡])/u);let output=[];
 for(const sentence of sentences){if(!sentence.trim())continue;const known=safetyPhrases[source][sentence.trim().toLowerCase()];if(known){output.push(known);continue;}let translated=await translateMaintenance(sentence.trim(),source,async value=>{const result=await active(value,{max_new_tokens:Math.min(2048,value.length+128)});return result[0]?.translation_text;});
  if(!translated.trim())throw Error('Empty translation');
  if(source==='en'&&/\bworn belts\b/i.test(sentence))translated=translated.replace(/cinturones\s+(?:usados|desgastados)/gi,'correas desgastadas');
  if(source==='es'&&/correas desgastadas/i.test(sentence))translated=translated.replace(/worn straps/gi,'worn belts');
  if(source==='es'&&/\beste equipo\b/i.test(sentence))translated=translated.replace(/this team/gi,'this equipment');
  if(source==='en'&&sentence.includes('TEST ONLY')){translated=translated.replace(/TEST SOLO|SOLO PRUEBA|SÓLO PRUEBA|PRUEBA SOLAMENTE/gi,'TEST ONLY');if((translated.match(/TEST ONLY/g)||[]).length!==(sentence.match(/TEST ONLY/g)||[]).length)throw Error('Test marker changed');}
  const identifiers=sentence.match(/\b[A-Z]+[-_]\d+\b|\b\d{4}-\d{2}-\d{2}\b|\b\d+(?:[.,]\d+)?\b/g)||[];if(identifiers.some(v=>!translated.includes(v)))throw Error('Identifier changed');
  if(source==='en'&&/\b(?:not|never|no|don't|doesn't|hasn't|haven't)\b/i.test(sentence)&&!(/\b(?:no|nunca|ninguna|ningún|sin)\b/i.test(translated)))throw Error('Negation changed');
  if(source==='es'&&/\b(?:no|nunca|ninguna|ningún)\b/i.test(sentence)&&!(/\b(?:not|never|no|don't|doesn't|hasn't|haven't)\b/i.test(translated)))throw Error('Negation changed');
  output.push(translated);
 }
 self.postMessage({id,translation:prefix+output.join(' '),publicDownloads});
 }catch{self.postMessage({id,error:'Translation unavailable'});}});};

