import {readFile,writeFile,cp,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parse} from 'acorn';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=fileURLToPath(new URL('.',import.meta.url)),base=path.resolve(here,'../teamstead-branding-upload'),out=path.join(here,'hub-upload-hf');
const html=await readFile(path.join(base,'index.html'),'utf8'),entry=html.match(/_expo\/static\/js\/web\/entry-[a-f0-9]+\.js/)[0],original=await readFile(path.join(base,entry),'utf8');
if(!original.includes('fhqmnlpgqslllzrovxbp')||/vakgonahbkpapgwnfuqe/.test(original))throw Error('Wrong commercial backend');
const live=await (await fetch('https://pms-company-hub.pages.dev/'+entry)).text();
const hash=s=>createHash('sha256').update(s).digest('hex');
if(hash(live)!==hash(original))throw Error('Live Hub differs from reviewed baseline');
await mkdir(out,{recursive:true});await cp(base,out,{recursive:true});
const reference=await readFile('C:/Users/jarhe/Documents/Codex/work/pms-photo-test-1008/live-release/upload/_expo/static/js/web/entry-ecdb6655d982a57fafbab5712bfbccce.js','utf8');
function walk(node,fn){if(!node||typeof node!=='object')return;fn(node);for(const value of Object.values(node)){if(Array.isArray(value))value.forEach(n=>walk(n,fn));else if(value&&typeof value==='object')walk(value,fn);}}
const property=(n,k)=>n?.properties?.find(p=>(p.key?.name||p.key?.value)===k)?.value;
const dict=new Map();walk(parse(reference,{ecmaVersion:'latest'}),n=>{if(n.type!=='ArrayExpression')return;const pairs={};for(const x of n.elements||[]){if(x?.type!=='CallExpression')continue;const props=x.arguments[1],lang=property(props,'data-hub-language'),text=property(props,'children');if(lang?.type==='Literal'&&text?.type==='Literal'&&['en','es'].includes(lang.value))pairs[lang.value]=text.value;}if(typeof pairs.en==='string'&&typeof pairs.es==='string'){dict.set(pairs.en,'en');dict.set(pairs.es,'es');}});
for(const [en,es] of [['Home','Inicio'],['Sign out','Cerrar sesión'],['Teamstead Assistant','Asistente'],['Job details','Detalles del trabajo'],['Progress timeline','Cronología del progreso'],['Clear','Borrar'],['Required','Obligatorio'],['Company Maintenance Hub','Centro de Mantenimiento'],['Help','Ayuda'],['Out','Salir']]){dict.set(en,'en');dict.set(es,'es');}
const preferred=await readFile('C:/Users/jarhe/Documents/Codex/work/pms-photo-test-1008/live-release/preferred-description.js','utf8');
const description=preferred.replace("const {translateDescription,currentUser}=context.useMaintenance(),", "const {currentUser}=context.useMaintenance(),translateDescription=window.TeamsteadOffline.translate,").replace("const [lang,setLang]", "window.TeamsteadOffline.setUser(user);const [lang,setLang]").replace('[text,user,translateDescription,attempt]','[text,user,translateDescription,attempt,lang]').replace('result.source!==lang','result.source!==lang&&result.target===lang').replace("Automatic translation", "On-device translation").replace("Traducción automática", "Traducción en este dispositivo");
const ast=parse(original,{ecmaVersion:'latest'}),changes=[],fields=new Set(['problem','completionNotes','managerNotes','manager_notes','instructions','denialReason','denial_reason','helpReason','help_reason','workPerformed','partDescription','reasonNeeded','description','reason','notes','detail','detailEs','photoUnavailableReason']);
const contentModules=new Set([853,856,862,877,888,894,900,902]);const coverage={};let labels=0;
const dataExpression=n=>n.property?.name==='detailEs'?`(${original.slice(n.object.start,n.object.end)}.detail?'':${original.slice(n.start,n.end)})`:original.slice(n.start,n.end);
for(const node of ast.body){const call=node.expression;if(call?.callee?.name!=='__d')continue;const id=call.arguments[1].value;let source=original.slice(node.start,node.end);if(id===858){changes.push({start:node.start,end:node.end,text:description});continue;}if(id===843){changes.push({start:node.start,end:node.end,text:"__d(function(g,r,i,a,m,e,d){'use strict';e.clearDescriptionTranslations=function(){window.TeamsteadOffline?.clear();};e.translateDescriptionText=function(text){return window.TeamsteadOffline.translate(text);};},843,[]);"});continue;}
 if(id<769)continue;const edits=[],fn=call.arguments[0],deps=call.arguments[2];let wrapped=0;const aliases=new Map(),fallbacks=new Map();
 walk(fn,n=>{if(n.type==='VariableDeclarator'&&n.id.type==='Identifier'&&n.init?.type==='LogicalExpression'&&n.init.right?.type==='Literal'&&typeof n.init.right.value==='string'&&n.init.right.value.includes(' · '))fallbacks.set(n.id.name,n.init.right.value);});
 walk(fn,n=>{if(n.type!=='ObjectPattern')return;for(const p of n.properties){const key=p.key?.name;if(!key)continue;if(key==='en'||key==='es')aliases.set(p.value.name,key);if(key.endsWith('Es')){aliases.set(p.value.name,'es');const pair=n.properties.find(x=>x.key?.name===key.slice(0,-2));if(pair)aliases.set(pair.value.name,'en');}}});
 walk(fn,n=>{if(n.type!=='CallExpression')return;const callee=n.callee.type==='SequenceExpression'?n.callee.expressions.at(-1):n.callee;if(callee?.type!=='MemberExpression'||!['jsx','jsxs'].includes(callee.property.name))return;const props=n.arguments[1],child=property(props,'children'),jsx=original.slice(callee.object.start,callee.object.end);const value=property(props,'value');if(property(props,'labelEs')&&value?.type==='LogicalExpression'&&value.right?.type==='Literal'&&typeof value.right.value==='string'&&value.right.value.includes(' · ')){const [en,es]=value.right.value.split(' · ');edits.push({start:value.right.start-node.start,end:value.right.end-node.start,text:`[${jsx}.jsx('span',{'data-hub-language':'en',children:${JSON.stringify(en)}}),${jsx}.jsx('span',{'data-hub-language':'es',children:${JSON.stringify(es)}})]`});labels++;}
 if(property(props,'labelEs')&&contentModules.has(id)&&value){function wrapValue(x){if(!x)return;if(x.type==='MemberExpression'&&fields.has(x.property?.name)){edits.push({start:x.start-node.start,end:x.end-node.start,text:`${jsx}.jsx(_hubTranslated,{original:${dataExpression(x)}})`});wrapped++;}else if(x.type==='ConditionalExpression'){wrapValue(x.consequent);wrapValue(x.alternate);}else if(x.type==='LogicalExpression'){wrapValue(x.left);wrapValue(x.right);}}wrapValue(value);}if(!child)return;
  if(child.type==='Literal'&&typeof child.value==='string'){
   const value=child.value;let text;
   if((value.includes(' / ')||value.includes(' · '))&&value.split(/ \/ | · /).length===2){const [en,es]=value.split(/ \/ | · /);text=`[${jsx}.jsx('span',{'data-hub-language':'en',children:${JSON.stringify(en)}}),${jsx}.jsx('span',{'data-hub-language':'es',children:${JSON.stringify(es)}})]`;}
   else if(dict.has(value))text=`${jsx}.jsx('span',{'data-hub-language':${JSON.stringify(dict.get(value))},children:${JSON.stringify(value)}})`;
   if(text){edits.push({start:child.start-node.start,end:child.end-node.start,text});labels++;}
  }else if(child.type==='ArrayExpression'&&child.elements.length===4&&child.elements[0]?.value==='Next: '&&child.elements[2]?.value===' / Siguiente: '){
   const left=child.elements.slice(0,2).map(n=>original.slice(n.start,n.end)).join(','),right=[JSON.stringify('Siguiente: '),original.slice(child.elements[3].start,child.elements[3].end)].join(',');edits.push({start:child.start-node.start,end:child.end-node.start,text:`[${jsx}.jsx('span',{'data-hub-language':'en',children:[${left}]}),${jsx}.jsx('span',{'data-hub-language':'es',children:[${right}]})]`});labels++;
  }else if(child.type==='ArrayExpression'&&child.elements.length===3&&child.elements[1]?.type==='Literal'&&[' / ',' · '].includes(child.elements[1].value)){
   const [en,,es]=child.elements;edits.push({start:child.start-node.start,end:child.end-node.start,text:`[${jsx}.jsx('span',{'data-hub-language':'en',children:${original.slice(en.start,en.end)}}),${jsx}.jsx('span',{'data-hub-language':'es',children:${original.slice(es.start,es.end)}})]`});labels++;
  }else if(child.type==='Identifier'&&fallbacks.has(child.name)){
   const [en,es]=fallbacks.get(child.name).split(' · ');edits.push({start:child.start-node.start,end:child.end-node.start,text:`${child.name}===${JSON.stringify(fallbacks.get(child.name))}?[${jsx}.jsx('span',{'data-hub-language':'en',children:${JSON.stringify(en)}}),${jsx}.jsx('span',{'data-hub-language':'es',children:${JSON.stringify(es)}})]:${child.name}`});labels++;
  }else if(child.type==='Identifier'&&aliases.has(child.name)){
   edits.push({start:child.start-node.start,end:child.end-node.start,text:`${jsx}.jsx('span',{'data-hub-language':${JSON.stringify(aliases.get(child.name))},children:${child.name}})`});labels++;
  }else if(contentModules.has(id)&&child.type==='MemberExpression'&&fields.has(child.property?.name)){
   edits.push({start:child.start-node.start,end:child.end-node.start,text:`${jsx}.jsx(_hubTranslated,{original:${dataExpression(child)}})`});wrapped++;
  }else if(id===902&&child.type==='MemberExpression'&&['title','titleEs'].includes(child.property?.name)){
   edits.push({start:child.start-node.start,end:child.end-node.start,text:`${jsx}.jsx('span',{'data-hub-language':${JSON.stringify(child.property.name==='titleEs'?'es':'en')},children:${original.slice(child.start,child.end)}})`});labels++;
  }else{
   function fragment(n){if(!n)return;let replacement;
    if(n.type==='Literal'&&typeof n.value==='string'){
     const value=n.value,pieces=value.split(/ \/ | · /);if(pieces.length===2)replacement=`[${jsx}.jsx('span',{'data-hub-language':'en',children:${JSON.stringify(pieces[0])}}),${jsx}.jsx('span',{'data-hub-language':'es',children:${JSON.stringify(pieces[1])}})]`;
     else if(value==='Updated ')replacement=`[${jsx}.jsx('span',{'data-hub-language':'en',children:'Updated '}),${jsx}.jsx('span',{'data-hub-language':'es',children:'Actualizada '})]`;
     else if(value==='Next: ')replacement=`${jsx}.jsx('span',{'data-hub-language':'en',children:'Next: '})`;
     else if(value===' / Siguiente: ')replacement=`${jsx}.jsx('span',{'data-hub-language':'es',children:'Siguiente: '})`;
    }else if(n.type==='MemberExpression'&&['en','es'].includes(n.property?.name))replacement=`${jsx}.jsx('span',{'data-hub-language':${JSON.stringify(n.property.name)},children:${original.slice(n.start,n.end)}})`;
    else if(n.type==='MemberExpression'&&contentModules.has(id)&&fields.has(n.property?.name)){replacement=`${jsx}.jsx(_hubTranslated,{original:${dataExpression(n)}})`;wrapped++;}
    if(replacement){edits.push({start:n.start-node.start,end:n.end-node.start,text:replacement});labels++;return;}
    if(n.type==='ArrayExpression')n.elements.forEach(fragment);else if(n.type==='ConditionalExpression'){fragment(n.consequent);fragment(n.alternate);}else if(n.type==='LogicalExpression'){fragment(n.left);fragment(n.right);}
   }
   fragment(child);
  }
 });
 if(wrapped){coverage[id]=wrapped;edits.push({start:deps.end-node.start-1,end:deps.end-node.start-1,text:',858'});edits.push({start:fn.body.start-node.start+1,end:fn.body.start-node.start+1,text:`const _hubTranslated=${fn.params[1].name}(d[${deps.elements.length}]).MaintenanceDescription;`});}
 for(const edit of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
 if(edits.length){parse(source,{ecmaVersion:'latest'});changes.push({start:node.start,end:node.end,text:source});}
}
let bundle=original;for(const edit of changes.sort((a,b)=>b.start-a.start))bundle=bundle.slice(0,edit.start)+edit.text+bundle.slice(edit.end);
// Offline inspections can contain operational details and photos. Keep that
// queue in tab-scoped storage so it is not left behind on a shared browser.
const queueMarker='pms_offline_inspections_queue',queueAt=bundle.indexOf(queueMarker),queueStart=bundle.lastIndexOf('__d(',queueAt),queueEnd=bundle.indexOf('__d(',queueAt+queueMarker.length);
if(queueAt<0||queueStart<0)throw Error('Offline inspection queue module not found');
const queueStop=queueEnd<0?bundle.length:queueEnd,queueModule=bundle.slice(queueStart,queueStop),tabScopedQueue=queueModule.replaceAll('window.localStorage','window.sessionStorage');
if(tabScopedQueue===queueModule||!tabScopedQueue.includes('window.sessionStorage'))throw Error('Offline inspection queue storage was not hardened');
bundle=bundle.slice(0,queueStart)+tabScopedQueue+bundle.slice(queueStop);parse(bundle,{ecmaVersion:'latest'});
const name='entry-'+hash(bundle).slice(0,32)+'.js';await writeFile(path.join(out,'_expo/static/js/web',name),bundle);
await mkdir(path.join(out,'offline'),{recursive:true});for(const file of ['transformers.js','hf-worker.js'])await cp(path.join(here,'offline',file),path.join(out,'offline',file));await cp(path.join(here,'client-bundle.js'),path.join(out,'offline/client.js'));
const styles='<style>#hub-language-picker{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:8px 16px;background:#202628;color:white;font:600 14px system-ui;flex-shrink:0}#hub-language-picker select{min-height:44px;padding:6px 10px;border-radius:8px;font:16px system-ui}html[data-hub-language="en"] [data-hub-language="es"],html[data-hub-language="es"] [data-hub-language="en"]{display:none!important}body{display:flex;flex-direction:column;min-height:0}#root{flex:1 1 0;height:auto;min-height:0}</style><script src="/offline/client.js"></script>';
const oldBoot=`(function(){var u=new URL(location.href),h=new URLSearchParams(u.hash.slice(1));if(h.has('hub')){window.__pmsHubToken=h.get('hub');u.hash='';history.replaceState(null,'',u.pathname+u.search);}})();`;
const newBoot=`(function(){var k='pms_offline_inspections_queue';try{var q=localStorage.getItem(k);if(q&&!sessionStorage.getItem(k))sessionStorage.setItem(k,q);localStorage.removeItem(k);}catch{}var u=new URL(location.href),h=new URLSearchParams(u.hash.slice(1));if(h.has('hub')){window.__pmsHubToken=h.get('hub');u.hash='';history.replaceState(null,'',u.pathname+u.search);}})();`;
const oldBootHash=`'sha256-${createHash('sha256').update(oldBoot).digest('base64')}'`,newBootHash=`'sha256-${createHash('sha256').update(newBoot).digest('base64')}'`;
const updated=html.replace(entry,'_expo/static/js/web/'+name).replace(oldBoot,newBoot).replace(oldBootHash,newBootHash).replace("script-src 'self'", "script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net blob:").replace("connect-src 'self'", "connect-src 'self' https://huggingface.co https://*.hf.co https://*.huggingface.co https://cdn.jsdelivr.net").replace("object-src 'none'", "worker-src 'self'; object-src 'none'").replace('</head>',styles+'</head>');await writeFile(path.join(out,'index.html'),updated);
await writeFile(path.join(here,'hub-manifest.json'),JSON.stringify({project:'pms-company-hub',backend:'fhqmnlpgqslllzrovxbp',baseline:hash(original),bundle:name,sha256:hash(bundle),labels,coverage,changedModules:changes.map(c=>parse(c.text,{ecmaVersion:'latest'}).body[0].expression.arguments[1].value)},null,2));console.log(JSON.stringify({bundle:name,labels,coverage,modules:changes.length}));
