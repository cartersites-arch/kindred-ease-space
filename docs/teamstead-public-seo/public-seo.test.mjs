import assert from 'node:assert/strict';
import {publicSeoRoute,publicLandingSeo} from './public-seo.mjs';
const identity={product:'teamstead-sales',database_id:'24543c2f-3d1f-4313-b46f-0708b6db28a1',active:1};
const env={DB:{prepare:()=>({first:async()=>identity})}};
const html='<html><head><meta name="robots" content="noindex,nofollow"><meta name="description" content="Private workspace"></head><body><div id="root"></div><script src="/app.js"></script></body></html>';
const response=()=>new Response(html,{headers:{'content-type':'text/html','etag':'old','cache-control':'no-store'}});
const req=(path='/',options={})=>new Request('https://teamsteadcrew.com'+path,options);
const publicPage=await publicLandingSeo(req(),env,response());const text=await publicPage.text();
assert.equal(publicPage.headers.get('X-Robots-Tag'),'index, follow');assert.ok(text.includes('content="index,follow"'));assert.ok(text.includes('rel="canonical" href="https://teamsteadcrew.com/"'));assert.ok(text.includes('https://seo-test.teamsteadcrew.com/a/teamstead-chat'));assert.ok(text.includes('https://seo-test.teamsteadcrew.com/a/maintenance-hub'));assert.ok(text.includes('<script src="/app.js">'));assert.equal(publicPage.headers.get('etag'),null);
for(const path of ['/?company=c_1111111111111111','/?section=maintenance','/company-admin/','/billing/','/api/chat','/signup','/unknown']){const r=await publicLandingSeo(req(path),env,response());assert.equal(r.headers.get('X-Robots-Tag'),'noindex, nofollow');assert.equal(await r.text(),html);}
for(const request of [req('/',{headers:{cookie:'session=fixture'}}),new Request('https://teamstead-crew.pages.dev/')]){const r=await publicLandingSeo(request,env,response());assert.equal(r.headers.get('X-Robots-Tag'),'noindex, nofollow');assert.equal(await r.text(),html);}
identity.active=0;assert.equal((await publicLandingSeo(req(),env,response())).headers.get('X-Robots-Tag'),'noindex, nofollow');identity.active=1;
const robots=await publicSeoRoute(req('/robots.txt'),env);assert.ok(robots.headers.get('content-type').includes('text/plain'));assert.ok((await robots.text()).includes('Sitemap: https://teamsteadcrew.com/sitemap.xml'));
const sitemap=await publicSeoRoute(req('/sitemap.xml'),env);const xml=await sitemap.text();assert.equal((xml.match(/<loc>/g)||[]).length,1);assert.ok(!/company|billing|site-admin/.test(xml));
const head=await publicLandingSeo(req('/',{method:'HEAD'}),env,response());assert.equal(head.headers.get('X-Robots-Tag'),'index, follow');assert.equal(await head.text(),'');
console.log('PASS: public-only indexing, private/query/cookie exclusion, pinned identity, actual robots/sitemap, existing app retained and HEAD parity.');
