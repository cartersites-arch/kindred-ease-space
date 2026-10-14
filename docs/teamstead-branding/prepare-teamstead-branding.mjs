import { readFile, writeFile, cp, rm, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const source='C:/Users/jarhe/Documents/Codex/2026-10-06/continue-my-existing-project-room-company/isolated-products/teamstead/hub-prepared-upload';
const output=fileURLToPath(new URL('./teamstead-branding-upload',import.meta.url));
const entry='_expo/static/js/web/entry-424e77e2084620e12d48119fa8b2a55e.js';
const hash=s=>createHash('sha256').update(s).digest('hex');
for(const file of ['index.html','company-brand.js','hub-chat-return.js',entry]){
  const local=await readFile(source+'/'+file);
  const response=await fetch('https://pms-company-hub.pages.dev/'+file);
  if(!response.ok||hash(Buffer.from(await response.arrayBuffer()))!==hash(local)) throw Error('Current live file differs from reviewed Teamstead snapshot: '+file);
}
await mkdir(output,{recursive:true});
await cp(source,output,{recursive:true});
const returnLink=await readFile(output+'/hub-chat-return.js','utf8');
await writeFile(output+'/hub-chat-return.js',returnLink.replaceAll('https://teamstead-crew.pages.dev/','https://teamsteadcrew.com/'));
const before=await readFile(output+'/'+entry,'utf8');
if(!before.includes('fhqmnlpgqslllzrovxbp')||/vakgonahbkpapgwnfuqe|pms-maintenance-hub\.pages\.dev|project-room-ekn/.test(before))throw Error('Incorrect backend target');
let after=before.replaceAll('PMS-','TS-').replaceAll('PMS Assistant','Teamstead Assistant').replaceAll('PMS MAINTENANCE HUB','TEAMSTEAD MAINTENANCE HUB').replaceAll('PMS TEST HUB','TEAMSTEAD TEST HUB').replaceAll('PMS Hub','Teamstead Hub').replaceAll('PMS number','work-order number').replaceAll('n\\xfamero PMS','n\\xfamero de orden').replaceAll('children:"PMS"','children:"Teamstead"').replaceAll('%PMS local report','%Teamstead local report');
if(after===before||after.includes('PMS-'))throw Error('Branding replacement incomplete');
// Safety-policy citations and internal module names retain their original meaning.
const newEntry='_expo/static/js/web/entry-'+hash(after).slice(0,32)+'.js';
await writeFile(output+'/'+newEntry,after);
await rm(output+'/'+entry);
let html=await readFile(output+'/index.html','utf8');
if(!html.includes(entry))throw Error('Entry reference missing');
await writeFile(output+'/index.html',html.replaceAll(entry,newEntry));
await writeFile(fileURLToPath(new URL('./teamstead-branding-manifest.json',import.meta.url)),JSON.stringify({project:'pms-company-hub',backend:'fhqmnlpgqslllzrovxbp',prefix:'TS-',oldEntry:entry,newEntry,beforeHash:hash(before),afterHash:hash(after),changes:{workOrderPrefix:(before.match(/PMS-/g)||[]).length,assistant:(before.match(/PMS Assistant/g)||[]).length},safetyPolicyCitationsPreserved:true},null,2)+'\n');
console.log(JSON.stringify({verifiedLiveSnapshot:true,newEntry,prefix:'TS-',backend:'fhqmnlpgqslllzrovxbp'}));
