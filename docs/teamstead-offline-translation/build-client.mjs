import {build} from 'esbuild';
await build({entryPoints:[new URL('./client.js',import.meta.url).pathname],outfile:new URL('./client-bundle.js',import.meta.url).pathname,bundle:true,format:'iife',platform:'browser',minify:true});
