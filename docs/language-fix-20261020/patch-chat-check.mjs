import {patchChatBundle} from './patch-chat-bundle.mjs';
import {readFile,readdir} from 'node:fs/promises';
import {francAll} from 'franc-min';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=process.argv[2];if(!root)throw Error('Pass the downloaded live-baselines directory');
for(const kind of ['team-chat','pms-chat']){
 const dir=root+'/'+kind+'/assets/';
 const filename=(await readdir(dir)).find(x=>x.endsWith('.js'));
 const input=await readFile(dir+filename,'utf8'),patched=patchChatBundle(input,kind);
 assert.throws(()=>patchChatBundle(input+'\n',kind),/Live bundle changed/);
 const helper=patched.slice(0,patched.indexOf(input.slice(0,200)));
 const detector=patched.slice(patched.indexOf('function ye(e){'),patched.indexOf('function be(e,t){'));
 const start=patched.indexOf('function xe(e,t){');
 const end=kind==='team-chat'?patched.indexOf('var Se=',start):patched.indexOf('function Se(',start);
 const context=vm.createContext({R:francAll,de:'fictional-account',V:0,fe:0,he:new Map(),ge:new Map(),be(){throw Error('Unexpected inference for an exact phrase');}});
 vm.runInContext(helper+detector+'async '+patched.slice(start,end)+';globalThis.translate=xe;',context);
 assert.equal(await context.translate('Atascado','en'),'Stuck');
 assert.equal(await context.translate('Stuck!','es'),'Atascado!');
 assert.equal(await context.translate('Atascado https://example.com/part?id=23 @Jerry','en'),'Stuck https://example.com/part?id=23 @Jerry');
 assert.equal(await context.translate('  ATASCADO!  ','en'),'  STUCK!  ');
 console.log(kind+': actual patched live translation functions pass both directions, exact URL/mention/whitespace preservation, and changed-baseline rejection. No inference or backend used.');
}
