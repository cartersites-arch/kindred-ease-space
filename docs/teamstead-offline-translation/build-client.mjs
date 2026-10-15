import {createRequire} from 'node:module';
const require=createRequire(new URL('../../package.json',import.meta.url));
const esbuild=require('esbuild');
await esbuild.build({entryPoints:[new URL('./client.js',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')],outfile:new URL('./client-bundle.js',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),bundle:true,format:'iife',platform:'browser',external:['node:worker_threads'],define:{'import.meta.url':'__offlineEngineURL'},banner:{js:"const __offlineEngineURL=new URL('/offline/translator.js',location.origin).href;"},minify:true});
