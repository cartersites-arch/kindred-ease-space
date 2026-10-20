// Fictional data only. This preview has no production database/storage bindings.
export async function previewAPI(request){
 const u=new URL(request.url),now=Date.now();
 const cookie=request.headers.get('cookie')||'';
 const language=/(?:^|;\s*)preview-language=es(?:;|$)/.test(cookie)?'es':'en';
 const person={id:'fictional-reader',name:'Alex Test',role:'owner',active:1,joined_at:now,language,automatic_translation:true};
 const room={id:'fictional-room',name:'translation-test',description:'TEST ONLY — fictional messages; no work performed.',kind:'channel',visibility:'private',created_by:person.id,unread:0,memberIds:[person.id,'fictional-author'],last_at:now};
 const bodies=['Atascado','Stuck!','El motor no arranca.','The motor does not start.'];
 const messages=bodies.map((body,i)=>({id:'fictional-message-'+i,room_id:room.id,user_id:'fictional-author',parent_id:null,body,created_at:now-5000+i,edited_at:null,deleted:0,pinned:0,author:'Sam Example',reply_count:0,attachments:[],saved:0,reactions:[]}));
 const headers={'cache-control':'no-store','x-robots-tag':'noindex,nofollow'};
 const json=(value,extra={})=>Response.json(value,{headers:{...headers,...extra}});
 if(u.pathname==='/api/access')return json({level:'passkey',user:{id:person.id,name:person.name}});
 if(u.pathname==='/api/crew-call')return json({peers:[],signals:[]});
 if(u.pathname==='/api/chat'){
  if(request.method==='POST'){
   const data=await request.json().catch(()=>({}));
   if(data.action==='language'&&['en','es'].includes(data.language))return json({ok:true},{'set-cookie':`preview-language=${data.language}; Path=/; Secure; HttpOnly; SameSite=Strict`});
   return Response.json({error:'Read-only fictional preview. Message writes are disabled.'},{status:405,headers});
  }
  const action=u.searchParams.get('action');
  if(action==='state')return json({me:person,workspace:{id:'main',name:'TEST ONLY — PMS Translation',owner_id:person.id,ai_enabled:0},members:[person,{...person,id:'fictional-author',name:'Sam Example',role:'member'}],rooms:[room],invitations:[],products:{plan:'chat',chat:true,hub:false},companyReady:true});
  if(action==='messages')return json({messages,parent:null,hasMore:false,serverTime:now});
  if(['saved','files','search','pins'].includes(action))return json({messages});
 }
 return Response.json({error:'Fictional preview only.'},{status:404,headers});
}
