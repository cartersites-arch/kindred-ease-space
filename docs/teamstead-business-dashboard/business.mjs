const json=(value,status=200)=>Response.json(value,{status,headers:{'cache-control':'private,no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'}});
const validCompany=id=>typeof id==='string'&&/^(main|demo|pilot|c_[a-f0-9]{16})$/.test(id);
export async function businessState(database,{chatProbe,hubFetch=fetch,billingMode='live'}={}){
 const companies=(await database.prepare('SELECT id,name,status,hub_ready,product_plan,billing_required,created_at FROM company_registry ORDER BY created_at').all()).results;
 const records=(await database.prepare('SELECT company_id,label,notes,version FROM teamstead_business_company').all()).results;
 const summaries=[];
 for(const co of companies){
  if(!validCompany(co.id))continue;
  const prefix=co.id==='main'?'':co.id+'_';let usage=null;
  if(co.status!=='building'&&co.status!=='deleting')try{
   const summary=await database.prepare('SELECT (SELECT COUNT(*) FROM '+prefix+'people WHERE active=1) AS active_people,(SELECT COUNT(*) FROM '+prefix+'maintenance_links) AS connected_links,(SELECT used_bytes FROM '+prefix+'photo_budget WHERE id=1) AS used_bytes,(SELECT limit_bytes FROM '+prefix+'photo_budget WHERE id=1) AS limit_bytes').first();
   usage={activePeople:summary.active_people,connectedHubLinks:summary.connected_links,photoBytes:summary.used_bytes??null,photoLimitBytes:summary.limit_bytes??null};
  }catch{usage=null;}
  const billing=await database.prepare('SELECT status,billing_interval,trial_ends_at,cancel_at_period_end,updated_at FROM company_billing WHERE company_id=? AND billing_mode=?').bind(co.id,billingMode).first();
  summaries.push({...co,billing:billing?{...billing,mode:billingMode}:null,record:records.find(r=>r.company_id===co.id)||{label:'',notes:'',version:0},usage,chatPath:co.id==='main'?'/':'/?company='+encodeURIComponent(co.id),maintenancePath:'/?'+(co.id==='main'?'':'company='+encodeURIComponent(co.id)+'&')+'section=maintenance'});
 }
 const settings=await database.prepare('SELECT signup_enabled,company_limit FROM platform_settings WHERE id=1').first();
 const control=await database.prepare('SELECT version FROM teamstead_business_state WHERE id=1').first();
 const history=(await database.prepare('SELECT action,actor,company_id,created_at FROM teamstead_business_audit ORDER BY created_at DESC LIMIT 20').all()).results;
 let chat={state:'not_checked',detail:'Chat sign-in endpoint has not been checked.'};
 try{if(chatProbe){const result=await chatProbe();chat=result.ok?{state:'available',detail:'The Chat sign-in handler responded normally.'}:{state:'attention',detail:'The Chat sign-in handler did not respond normally.'};}}catch{chat={state:'attention',detail:'Chat sign-in check could not complete.'};}
 let hub={state:'not_checked',detail:'Customer Maintenance Hub entry has not been checked.'};
 try{const result=await hubFetch('https://pms-company-hub.pages.dev/',{method:'GET',redirect:'manual',signal:AbortSignal.timeout(5000)});hub=result.status===200?{state:'available',detail:'The customer Maintenance Hub entry returned HTTP 200.'}:{state:'attention',detail:'The customer Maintenance Hub entry returned HTTP '+result.status+'.'};if(result.body)await result.body.cancel();}catch{hub={state:'attention',detail:'Customer Maintenance Hub entry check could not complete.'};}
 return {version:control.version,settings,companies:summaries,customerCount:summaries.filter(c=>c.id!=='main').length,history,health:{checkedAt:Date.now(),chat,hub,scope:'Entry-point availability only. Customer sign-in, messages, and maintenance workflows are not tested by these checks.'}};
}
export async function businessApi(request,env,actor,options={}){
 if(request.method==='GET')return json(await businessState(env.DB,{...options,billingMode:env.STRIPE_MODE==='live'?'live':'test'}));
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 if(request.headers.get('origin')!=='https://teamsteadcrew.com'||request.headers.get('content-type')?.split(';')[0].trim()!=='application/json'||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Use the business owner dashboard.'},403);
 if(Number(request.headers.get('content-length')||0)>12000)return json({error:'This update is too large.'},413);
 const reader=request.body?.getReader();if(!reader)return json({error:'Enter the update.'},400);let total=0,parts=[];for(;;){const next=await reader.read();if(next.done)break;total+=next.value.length;if(total>12000){await reader.cancel();return json({error:'This update is too large.'},413);}parts.push(next.value);}const bytes=new Uint8Array(total);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
 let data;try{data=JSON.parse(new TextDecoder().decode(bytes));}catch{return json({error:'Invalid update.'},400);}
 if(!Number.isSafeInteger(data?.version)||data.version<1)return json({error:'Reload the dashboard before saving.'},400);
 const event=crypto.randomUUID(),at=Date.now();let update,company=null;
 if(data.action==='signup_settings'){
  if(typeof data.enabled!=='boolean'||!Number.isInteger(data.companyLimit)||data.companyLimit<1||data.companyLimit>20)return json({error:'Choose a company capacity from 1 to 20.'},400);
  const count=await env.DB.prepare("SELECT COUNT(*) AS n FROM company_registry WHERE id<>'main'").first();if(data.companyLimit<count.n)return json({error:'Capacity cannot be below the number of registered companies.'},409);
  update=env.DB.prepare('UPDATE platform_settings SET signup_enabled=?,company_limit=? WHERE id=1 AND EXISTS(SELECT 1 FROM teamstead_business_state WHERE id=1 AND last_event=?)').bind(data.enabled?1:0,data.companyLimit,event);
 }else if(data.action==='company_record'){
  if(!validCompany(data.company)||typeof data.label!=='string'||data.label.trim().length>80||typeof data.notes!=='string'||data.notes.length>2000)return json({error:'Check the company label and notes.'},400);
  const co=await env.DB.prepare('SELECT id FROM company_registry WHERE id=?').bind(data.company).first();if(!co)return json({error:'Company not found.'},404);
  company=data.company;
  update=env.DB.prepare('INSERT INTO teamstead_business_company(company_id,label,notes,version,updated_at,updated_by) SELECT ?,?,?,1,?,? WHERE EXISTS(SELECT 1 FROM teamstead_business_state WHERE id=1 AND last_event=?) ON CONFLICT(company_id) DO UPDATE SET label=excluded.label,notes=excluded.notes,version=teamstead_business_company.version+1,updated_at=excluded.updated_at,updated_by=excluded.updated_by').bind(company,data.label.trim(),data.notes.trim(),at,actor,event);
 }else{return json({error:'Choose a supported business action.'},400);}
 const gateSql='UPDATE teamstead_business_state SET version=version+1,updated_at=?,updated_by=?,last_event=? WHERE id=1 AND version=?'+(data.action==='signup_settings'?" AND (SELECT COUNT(*) FROM company_registry WHERE id<>'main')<=?":'');
 const gate=env.DB.prepare(gateSql).bind(at,actor,event,data.version,...(data.action==='signup_settings'?[data.companyLimit]:[]));
 const audit=env.DB.prepare('INSERT INTO teamstead_business_audit(id,action,actor,company_id,created_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM teamstead_business_state WHERE id=1 AND last_event=?)').bind(event,data.action,actor,company,at,event);
 const results=await env.DB.batch([gate,update,audit]);if(!results[0].meta.changes)return json({error:'Another window changed the business settings. Reload before saving.'},409);
 return json({ok:true,version:data.version+1});
}
