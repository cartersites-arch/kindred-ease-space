import {members,state,messages,snapshot} from './marketing-demo-fixtures.mjs';
export default {async fetch(request,env){
 const u=new URL(request.url);let response;
 if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/functions/')){
  let value={};
  if(u.pathname==='/api/access')value={level:'passkey',user:{id:members[0].id,name:members[0].name}};
  else if(u.pathname==='/api/chat')value=u.searchParams.get('action')==='messages'?{messages,parent:null,hasMore:false,serverTime:messages.at(-1).created_at}:state;
  else if(u.pathname==='/api/maintenance')value={connected:false};
  else if(u.pathname==='/api/notifications')value={enabled:false,permission:'default'};
  else if(u.pathname==='/api/crew-call')value={peers:[],signals:[]};
  else if(u.pathname.endsWith('/hub-read'))value=snapshot;
  else if(u.pathname.endsWith('/assignees'))value=members.map(m=>({id:m.id,name:m.name}));
  else if(['/assets','/drafts','/employees','/parts','/pickups'].some(path=>u.pathname.endsWith(path)))value=[];
  else if(u.pathname.endsWith('/list'))value={photos:[],can_upload:false,can_complete:false};
  response=Response.json(value);
  if(u.pathname.endsWith('/hub-read')){response.headers.set('X-Company-Id','demo');response.headers.set('X-Company-Name','Northfield%20Demo%20Company');}
 }else{
  const asset=new URL(u);if(u.pathname==='/'||u.pathname==='/chat')asset.pathname='/chat-index';if(['/manager','/available','/status'].includes(u.pathname))asset.pathname='/hub-index';
  response=await env.ASSETS.fetch(new Request(asset,request));
 }
 const headers=new Headers(response.headers);headers.set('X-Robots-Tag','noindex, nofollow');headers.set('cache-control','no-store');headers.set('content-security-policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob: data:; object-src 'none'; base-uri 'self'; form-action 'none'");
 return new Response(response.body,{status:response.status,headers});
}};
