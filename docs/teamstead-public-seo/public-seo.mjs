const origin='https://teamsteadcrew.com';
const guides='https://seo-test.teamsteadcrew.com/a/';
export function marketingRequest(request){const u=new URL(request.url);return ['GET','HEAD'].includes(request.method)&&u.origin===origin&&u.pathname==='/'&&!u.search&&!request.headers.get('cookie');}
async function correctDatabase(env){try{const r=await env.DB?.prepare('SELECT product,database_id,active FROM product_identity WHERE id=1').first();return r?.product==='teamstead-sales'&&r.database_id==='24543c2f-3d1f-4313-b46f-0708b6db28a1'&&r.active===1;}catch{return false;}}
export async function publicSeoRoute(request,env){
 const u=new URL(request.url);
 if(!['GET','HEAD'].includes(request.method)||u.origin!==origin||u.search||!['/robots.txt','/sitemap.xml'].includes(u.pathname))return null;
 if(!await correctDatabase(env))return null;
 const headers={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
 const robots='User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /site-admin\nDisallow: /company-admin\nDisallow: /billing\nDisallow: /?company=\n\nSitemap: '+origin+'/sitemap.xml\n';
 const sitemap='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+origin+'/</loc></url></urlset>';
 return new Response(request.method==='HEAD'?null:u.pathname==='/robots.txt'?robots:sitemap,{headers:{...headers,'content-type':u.pathname==='/robots.txt'?'text/plain;charset=utf-8':'application/xml;charset=utf-8'}});
}
export async function publicLandingSeo(request,env,response){
 const headers=new Headers(response.headers);
 headers.set('X-Robots-Tag','noindex, nofollow');
 if(!marketingRequest(request)||response.status!==200||!response.headers.get('content-type')?.includes('text/html')||!await correctDatabase(env))return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 let html=await response.text();
 const robots=/<meta\b[^>]*\bname=["']robots["'][^>]*>/i;
 if(!robots.test(html))return new Response(html,{status:response.status,headers});
 html=html.replace(robots,'<meta name="robots" content="index,follow" />');
 html=html.replace(/<meta\b[^>]*\bname=["']description["'][^>]*>/i,'<meta name="description" content="Teamstead Crew brings company chat and Maintenance Hub together for team communication, equipment records and work-order tracking." />');
 html=html.replace('</head>','<link rel="canonical" href="'+origin+'/" /></head>');
 const footer='<footer style="padding:24px;max-width:1120px;margin:auto;font:16px/1.6 system-ui;color:#244335;background:#f4f7f1"><h2>Explore Teamstead Chat and Maintenance Hub</h2><p>Learn how company conversations and equipment work orders fit together in Teamstead Crew.</p><p><a href="'+guides+'teamstead-chat">Teamstead Chat: team messaging</a> · <a href="'+guides+'maintenance-hub">Maintenance Hub: equipment and work orders</a></p></footer>';
 html=html.replace('</body>',footer+'</body>');
 headers.set('X-Robots-Tag','index, follow');headers.delete('content-length');headers.delete('etag');headers.delete('content-encoding');
 return new Response(request.method==='HEAD'?null:html,{status:response.status,headers});
}
