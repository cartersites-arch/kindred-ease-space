// Surgical frontend patch for the two confirmed LIVE Chat bundles. It does not
// deploy, change a backend, or replace the old source assembly over a newer app.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const baselines=JSON.parse(await readFile(new URL('./live-chat-baselines.json',import.meta.url),'utf8'));
const phrases=await readFile(new URL('../teamstead-chat-translation/lib/short-phrases.js',import.meta.url),'utf8');
export function patchChatBundle(input,kind){
  if(!baselines[kind]||createHash('sha256').update(input).digest('hex')!==baselines[kind].sha256)throw Error('Live bundle changed; reconcile before patching');
  let output=input;
  function once(from,to){if(output.split(from).length!==2)throw Error('Expected exactly one translation binding');output=output.replace(from,to);}
  once('function ye(e){let t=R(', 'function ye(e){let known=__crewShortPhrase20261020(e.replace(/https?:\\/\\/\\S+|@[\\w.-]+/g,` `).trim());if(known)return known.source;let t=R(');
  once('||r.trim().length<10','');
  once('let o=r.match(/^\\s*/)[0],s=r.match(/\\s*$/)[0],c=await be(r.trim(),n);', 'let known=__crewShortPhrase20261020(r);if(known){a.push(known.source===n?known.translation:r);continue}let o=r.match(/^\\s*/)[0],s=r.match(/\\s*$/)[0],c=await be(r.trim(),n);');
  const helper='const __crewShortPhrase20261020=(()=>{'+phrases.replace('export function shortPhrase','function shortPhrase')+';return shortPhrase;})();\n';
  return helper+output;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const [kind,input,output]=process.argv.slice(2);
  if(!output)throw Error('Usage: node patch-chat-bundle.mjs <team-chat|pms-chat> <input.js> <output.js>');
  await writeFile(output,patchChatBundle(await readFile(input,'utf8'),kind));
  console.log('Patched translation only. No deployment made.');
}
