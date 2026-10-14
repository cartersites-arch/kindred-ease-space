import assert from 'node:assert/strict';
import {subscriptionAmount,revenueSummary,stripeBillingReader} from './revenue.mjs';
const row={subscription_id:'sub_fixture',customer_id:'cus_fixture',price_id:'price_fixture'};
const fixture=()=>({id:row.subscription_id,object:'subscription',customer:row.customer_id,metadata:{company_id:'c_1111111111111111'},livemode:true,status:'active',trial_end:null,cancel_at_period_end:false,items:{has_more:false,data:[{quantity:1,price:{id:row.price_id,currency:'usd',billing_scheme:'per_unit',unit_amount:3900,recurring:{interval:'month',interval_count:1,usage_type:'licensed'}}}]}});
const amount=s=>subscriptionAmount(s,row,'c_1111111111111111','live');
assert.equal(amount(fixture()).price.monthlyAmount,3900);
const annual=fixture();annual.items.data[0].price.unit_amount=39000;annual.items.data[0].price.recurring.interval='year';assert.equal(amount(annual).price.monthlyAmount,3250);
const quantity=fixture();quantity.items.data[0].quantity=2;assert.equal(amount(quantity).price.amount,7800);
const quarterly=fixture();quarterly.items.data[0].price.recurring.interval_count=3;assert.equal(amount(quarterly).price.monthlyAmount,1300);
for(const mutate of [s=>s.customer='other',s=>s.metadata.company_id='other',s=>s.livemode=false,s=>s.items.has_more=true,s=>s.discounts=['discount'],s=>s.discount={},s=>s.items.data[0].discounts=['discount'],s=>s.pause_collection={},s=>s.pending_update={},s=>s.schedule='schedule',s=>s.items.data[0].price.currency='eur',s=>s.items.data[0].price.tax_behavior='inclusive',s=>s.items.data[0].price.unit_amount=null,s=>s.items.data[0].price.billing_scheme='tiered',s=>s.items.data[0].price.recurring.usage_type='metered',s=>s.items.data[0].quantity=0]){const s=fixture();mutate(s);assert.throws(()=>amount(s));}
const co=(id,status,monthlyAmount=3900,extra={})=>({id,billing_required:1,billing:{status,price:{state:'verified',monthlyAmount},...extra}});
const result=revenueSummary([co('main','active'),co('monthly','active'),co('annual','active',3250),co('trial','trialing'),co('cancelingTrial','trialing',3900,{cancel_at_period_end:1}),co('overdue','past_due'),co('unpaid','unpaid'),co('canceled','canceled'),{id:'unknown',billing_required:1,billing:{status:'active',price:{state:'unavailable'}}}]);
assert.deepEqual(result,{currency:'usd',monthlyAmount:7150,trialMonthlyAmount:3900,payingCompanies:2,trialCompanies:2,unavailableCompanies:1});
const reader=stripeBillingReader({STRIPE_MODE:'live',STRIPE_SECRET_KEY:'sk_live_fixture_only'},{fetcher:async(url,options)=>{assert.equal(url,'https://api.stripe.com/v1/subscriptions/sub_fixture');assert.equal(options.method,'GET');return Response.json(fixture());}});
const read=await reader(row,'c_1111111111111111');assert.equal(read.price.amount,3900);for(const k of ['subscription_id','customer_id','price_id','metadata','default_payment_method'])assert.equal(k in read,false);
const failed=stripeBillingReader({STRIPE_MODE:'live',STRIPE_SECRET_KEY:'sk_live_fixture_only'},{fetcher:async()=>new Response('',{status:500})});assert.equal((await failed(row,'c_1111111111111111')).price.state,'unavailable');
console.log('PASS: monthly/yearly/quantity totals, trial exclusions, identity checks, unsupported discounts and GET-only provider reads.');
