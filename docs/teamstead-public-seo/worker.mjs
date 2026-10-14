import original from '../upload/_worker.js';
import {siteRoute} from './service.mjs';
import {publicSeoRoute,publicLandingSeo,marketingRequest} from './public-seo.mjs';
export default {async fetch(request,env,context){const seo=await publicSeoRoute(request,env);if(seo)return seo;const response=await siteRoute(request,env,{chatProbe:async()=>{const result=await original.fetch(new Request('https://teamsteadcrew.com/api/access'),env,context);const value=await result.json();return {ok:result.status===200&&value.level==='signed_out'};}});if(response)return response;const appRequest=request.method==='HEAD'&&marketingRequest(request)?new Request(request,{method:'GET'}):request;return publicLandingSeo(request,env,await original.fetch(appRequest,env,context));}};
