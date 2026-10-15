const now=Date.now();
const person={id:'demo-a',name:'Alex Demo',role:'owner',active:1,joined_at:now};
const room={id:'demo-room',name:'translation-demo',description:'Fictional translation test. No customer data.',kind:'channel',visibility:'private',created_by:person.id,unread:0,memberIds:['demo-a','demo-b'],last_at:now};
const bodies=['TEST ONLY — CHAT-1: The motor does not start. Check the power cable.','SOLO PRUEBA — CHAT-2: La puerta está atascada. No opere este equipo.','TEST ONLY — CHAT-3: Replace 2 worn belts. No repair has been completed.','TEST ONLY — CHAT-4: Check the power cable. https://example.com/test?id=123 @Jerry'];
const messages=bodies.map((body,i)=>({id:'demo-message-'+i,room_id:room.id,user_id:'demo-b',parent_id:null,body,created_at:now+i,edited_at:null,deleted:0,pinned:0,author:'Sam Example',reply_count:1,attachments:[],saved:1,reactions:[]}));
const headers={'cache-control':'no-store','x-robots-tag':'noindex,nofollow'};
function json(x){return Response.json(x,{headers});}
export default {async fetch(request,env){
  const u=new URL(request.url);
  if(u.pathname==='/api/access')return json({level:'passkey',user:{id:person.id,name:person.name}});
  if(u.pathname==='/api/crew-call')return json({peers:[],signals:[]});
  if(u.pathname==='/api/chat'){
    const action=u.searchParams.get('action');
    if(action==='state')return json({me:person,workspace:{id:'demo',name:'TEST ONLY — Fictional Company',owner_id:person.id,ai_enabled:0},members:[person,{...person,id:'demo-b',name:'Sam Example',role:'member'}],rooms:[room],invitations:[],products:{plan:'chat',chat:true,hub:false},companyReady:true});
    if(action==='messages'){const parent=u.searchParams.get('parentId');return json({messages:parent?[{...messages[1],id:'demo-reply',parent_id:parent}]:messages,parent:parent?messages.find(m=>m.id===parent):null,hasMore:false,serverTime:Date.now()});}
    if(['saved','files','search','pins'].includes(action))return json({messages});
    if(request.method==='POST')return json({ok:true});
  }
  if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/maintenance/'))return Response.json({error:'Fictional preview only'},{status:404,headers});
  return env.ASSETS.fetch(request);
}};
