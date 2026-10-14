// Read-only Stripe summaries. Runtime credentials and provider IDs never leave this module.
export function subscriptionAmount(s,row,company,mode){
 if(s?.object!=='subscription'||s.id!==row.subscription_id||s.customer!==row.customer_id||s.metadata?.company_id!==company||s.livemode!==(mode==='live'))throw Error('Subscription identity mismatch');
 const items=s.items?.data;
 if(s.items?.has_more||items?.length!==1)throw Error('Unsupported price');
 const item=items[0],p=item.price,r=p?.recurring,q=item.quantity;
 if(p?.id!==row.price_id||p.currency!=='usd'||p.tax_behavior==='inclusive'||p.billing_scheme!=='per_unit'||r?.usage_type!=='licensed'||p.transform_quantity||!Number.isSafeInteger(p.unit_amount)||p.unit_amount<0||!Number.isSafeInteger(q)||q<1||!['month','year'].includes(r.interval)||!Number.isSafeInteger(r.interval_count)||r.interval_count<1)throw Error('Unsupported price');
 // Do not guess discounted, paused or scheduled pricing.
 if(s.discount||s.discounts?.length||item.discounts?.length||s.pause_collection||s.pending_update||s.schedule)throw Error('Price needs review');
 const amount=p.unit_amount*q;
 if(!Number.isSafeInteger(amount))throw Error('Invalid amount');
 return {status:s.status,billing_interval:r.interval,trial_ends_at:s.trial_end?s.trial_end*1000:null,cancel_at_period_end:!!s.cancel_at_period_end,price:{state:'verified',currency:'usd',amount,interval:r.interval,intervalCount:r.interval_count,monthlyAmount:amount/(r.interval==='year'?12*r.interval_count:r.interval_count),checkedAt:Date.now()}};
}
export function stripeBillingReader(env,{fetcher=fetch}={}){
 const mode=env.STRIPE_MODE==='live'?'live':'test',deadline=AbortSignal.timeout(12000);
 return async (row,company)=>{
  if(!row.subscription_id)return {price:{state:'none'}};
  try{
   if(!/^sub_[A-Za-z0-9]+$/.test(row.subscription_id)||!env.STRIPE_SECRET_KEY?.startsWith(mode==='live'?'sk_live_':'sk_test_')&&!env.STRIPE_SECRET_KEY?.startsWith(mode==='live'?'rk_live_':'rk_test_'))throw Error('Billing unavailable');
   const r=await fetcher('https://api.stripe.com/v1/subscriptions/'+encodeURIComponent(row.subscription_id),{method:'GET',headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY},signal:AbortSignal.any([deadline,AbortSignal.timeout(6000)])});
   if(!r.ok)throw Error('Billing unavailable');
   return subscriptionAmount(await r.json(),row,company,mode);
  }catch{return {price:{state:'unavailable'}};}
 };
}
export function revenueSummary(companies){
 let monthlyAmount=0,trialMonthlyAmount=0,payingCompanies=0,trialCompanies=0,unavailableCompanies=0;
 for(const co of companies){
  if(co.id==='main'||!co.billing_required||!co.billing)continue;
  const b=co.billing;if(b.price?.state!=='verified'){if(b.price?.state==='unavailable')unavailableCompanies++;continue;}
  if(b.status==='active'){monthlyAmount+=b.price.monthlyAmount;payingCompanies++;}
  else if(b.status==='trialing'){trialCompanies++;if(!b.cancel_at_period_end)trialMonthlyAmount+=b.price.monthlyAmount;}
 }
 return {currency:'usd',monthlyAmount:Math.round(monthlyAmount),trialMonthlyAmount:Math.round(trialMonthlyAmount),payingCompanies,trialCompanies,unavailableCompanies};
}
