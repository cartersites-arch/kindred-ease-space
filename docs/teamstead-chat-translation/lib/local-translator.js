import {francAll} from 'franc-min';
import {shortPhrase} from './short-phrases.js';

let scope='',generation=0,worker,serial=0;
const pending=new Map(),cache=new Map(),inflight=new Map();
export function deviceLanguage(){return navigator.language.toLowerCase().startsWith('es')?'es':'en';}
export function resetScope(next){
  generation++;scope=next;worker?.terminate();worker=undefined;
  for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Account changed'));}
  pending.clear();cache.clear();inflight.clear();
}
export function detect(text){
  const known=shortPhrase(text);if(known)return known.source;
  const clean=text.replace(/https?:\/\/\S+|@[\w.-]+|TEST ONLY|SOLO PRUEBA|\b[A-Z]+[-_]\d+\b|\d+/g,' ').trim();
  const cleanedKnown=shortPhrase(clean);if(cleanedKnown)return cleanedKnown.source;
  const first=francAll(clean,{only:['eng','spa'],minLength:10})[0]?.[0];
  return first==='eng'?'en':first==='spa'?'es':null;
}
function infer(text,source){
  if(!worker){
    worker=new Worker('/offline/hf-worker-quality-v3.js',{type:'module'});
    worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);clearTimeout(p.timer);data.error?p.reject(Error('Translation unavailable')):p.resolve(data.translation);};
    worker.onerror=()=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Translation unavailable'));}pending.clear();worker?.terminate();worker=undefined;};
  }
  return new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error('Translation timeout'));},180000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,text,source});});
}
export async function translate(original,target){
  if(!scope||!['en','es'].includes(target)||typeof original!=='string'||original.length>6000)return null;
  const source=detect(original);if(!source)return null;if(source===target)return original;
  const key=target+'\0'+original,current=generation;
  if(cache.has(key))return cache.get(key);if(inflight.has(key))return inflight.get(key);
  const operation=(async()=>{
    // Links, mentions and code stay exact. Unsupported code blocks use the original.
    if(original.includes('```'))return null;
    const parts=original.split(/(https?:\/\/[^\s<>]+|@[\w.-]+|`[^`]*`|\n+)/g);
    const result=[];
    for(let i=0;i<parts.length;i++){
      if(current!==generation)return null;
      const part=parts[i];if(!part||i%2||!/[a-záéíóúñü]/i.test(part)){result.push(part);continue;}
      const known=shortPhrase(part);
      if(known){result.push(known.source===target?part:known.translation);continue;}
      const lead=part.match(/^\s*/)[0],tail=part.match(/\s*$/)[0];
      const translated=await infer(part.trim(),source);
      result.push(lead+translated+tail);
    }
    if(current!==generation)return null;
    const value=result.join('');cache.set(key,value);if(cache.size>200)cache.delete(cache.keys().next().value);return value;
  })().catch(()=>null);
  inflight.set(key,operation);
  try{return await operation;}finally{if(current===generation)inflight.delete(key);}
}
