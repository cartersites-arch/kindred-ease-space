import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<html><body></body></html>',{url:'https://pms-chat.fixture'});
for(const key of ['window','document','HTMLElement','localStorage'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const React=await import('react');
const {render,fireEvent,cleanup,waitFor}=await import('@testing-library/react');
async function bundle(entry,name,mocks){
 const file=new URL('.'+name+'.mjs',import.meta.url);
 await build({entryPoints:[entry],outfile:file.pathname,bundle:true,platform:'node',format:'esm',jsx:'automatic',external:['react','react/jsx-runtime'],alias:{'@':new URL('./',import.meta.url).pathname},plugins:[{name:'fixtures',setup(b){b.onResolve({filter:/.*/},a=>mocks[a.path]?{path:a.path,namespace:'fixture'}:undefined);b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:mocks[a.path],loader:'js'}));}}]});
 const result=await import(file.href);await fs.unlink(file);return result;
}
afterEach(()=>{cleanup();localStorage.clear();});
const team=await bundle(new URL('./app/chat-language.tsx',import.meta.url).pathname,'team-ui',{
 '@/lib/local-translator':`export const deviceLanguage=()=> 'en';export const resetScope=()=>{};export const detect=()=> 'es';export const translate=(...args)=>globalThis.teamTranslation(...args);`,
});
test('Teamstead provider restores preferences on an unkeyed company/person switch',async()=>{
 globalThis.teamTranslation=async()=>null;
 function Tree({scope}){return React.createElement(team.ChatLanguageProvider,{scope},React.createElement(team.ChatLanguagePicker));}
 const view=render(React.createElement(Tree,{scope:'company-a:person-a'}));
 fireEvent.change(view.getByRole('combobox'),{target:{value:'es'}});
 view.rerender(React.createElement(Tree,{scope:'company-b:person-b'}));assert.equal(view.getByRole('combobox').value,'en');
 view.rerender(React.createElement(Tree,{scope:'company-a:person-a'}));assert.equal(view.getByRole('combobox').value,'es');
});
test('Teamstead short-message translation failures show the original and retry',async()=>{
 globalThis.teamTranslation=async()=>null;
 const view=render(React.createElement(team.ChatLanguageProvider,{scope:'short-test'},React.createElement(team.ChatMessageText,{body:'Atascado'})));
 await waitFor(()=>assert.ok(view.getByRole('button',{name:'Retry translation'})));assert.ok(view.getByText('Atascado'));
});
