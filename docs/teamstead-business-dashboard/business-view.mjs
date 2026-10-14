export function subscriptionGroup(co){
 if(co.id==='main')return 'internal';
 const s=co.billing?.status;
 if(s==='active')return 'active';
 if(s==='trialing')return 'trial';
 if(['past_due','unpaid','incomplete','incomplete_expired','paused'].includes(s))return 'attention';
 if(s==='canceled')return 'canceled';
 if(!s&&!co.billing_required)return 'exempt';
 if(!s)return 'none';
 return 'attention';
}
export function overviewCounts(companies){
 const customers=companies.filter(co=>co.id!=='main');
 return {total:customers.length,active:customers.filter(co=>subscriptionGroup(co)==='active').length,trial:customers.filter(co=>subscriptionGroup(co)==='trial').length,attention:customers.filter(co=>subscriptionGroup(co)==='attention'||['building','owner_setup','suspended'].includes(co.status)||co.billing?.price?.state==='unavailable').length};
}
export function companyMatches(co,query,filter){
 if(co.id==='main')return false;
 const group=subscriptionGroup(co);
 const attention=group==='attention'||['building','owner_setup','suspended'].includes(co.status)||co.billing?.price?.state==='unavailable';
 const matches=filter==='all'||(filter==='attention'?attention:group===filter);
 return matches&&[co.name,co.record?.label,co.product_plan].join(' ').toLowerCase().includes(query.trim().toLowerCase());
}
