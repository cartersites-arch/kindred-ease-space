import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {patchChatBundle} from './patch-chat-bundle.mjs';
const control=await readFile(new URL('./pms-reader-control.js',import.meta.url),'utf8');
export function integratePMSReader(input){
  let output=patchChatBundle(input,'pms-chat');
  function once(from,to){if(output.split(from).length!==2)throw Error('Current PMS integration binding changed');output=output.replace(from,to);}
  once('function Jv({initial:e,onSignOut:t,onSessionLost:n}){','function Jv({initial:e,onSignOut:t,onSessionLost:n}){(0,_.useEffect)(()=>__pmsMountReaderControl(e.me),[e.me.id,e.me.language]);');
  once('new Worker(`/offline/hf-worker.js`','new Worker(`/offline/hf-worker-quality-v3.js`');
  once('`Se muestra el original.`:`Showing original.`','`Traducción no disponible. Se muestra el original.`:`Translation unavailable. Showing original.`');
  return control+'\n'+output;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const [input,output]=process.argv.slice(2);if(!output)throw Error('Pass input.js and output.js');
  await writeFile(output,integratePMSReader(await readFile(input,'utf8')));
}
