import assert from 'node:assert/strict';
import vm from 'node:vm';
import {subscriptionGroup,overviewCounts,companyMatches} from './business-view.mjs';
import {businessPage} from './business-page.mjs';
const company=(id,status,extra={})=>({id,name:'Customer '+id,status:'active',billing_required:1,product_plan:'combined',record:{label:'',notes:''},billing:status?{status,price:{state:'verified'}}:null,...extra});
const fixtures=[company('main','active'),company('paid','active'),company('trial','trialing'),company('overdue','past_due'),company('unpaid','unpaid'),company('ended','canceled'),company('new',null,{status:'owner_setup'}),company('unverified','active',{billing:{status:'active',price:{state:'unavailable'}}}),company('exempt',null,{billing_required:0})];
assert.deepEqual(overviewCounts(fixtures),{total:8,active:2,trial:1,attention:4});
assert.deepEqual(fixtures.filter(co=>companyMatches(co,'','trial')).map(co=>co.id),['trial']);
assert.deepEqual(fixtures.filter(co=>companyMatches(co,'','attention')).map(co=>co.id),['overdue','unpaid','new','unverified']);
assert.equal(companyMatches(company('one','active',{record:{label:'Fleet team',notes:'secret-support-text'}}),' FLEET ','active'),true);
assert.equal(companyMatches(company('one','active',{record:{label:'',notes:'secret-support-text'}}),'secret-support-text','all'),false);
assert.equal(companyMatches(fixtures[0],'','all'),false);
assert.equal(subscriptionGroup(company('unknown','future_status')),'attention');
assert.equal(subscriptionGroup(company('unstarted',null)),'none');
const page=businessPage(),html=await page.text();
const source=html.match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/)[1];
new vm.Script(source); // Parse the exact script emitted into the response.
assert.match(page.headers.get('content-security-policy'),/default-src 'none'/);
assert.equal(page.headers.get('cache-control'),'private,no-store');
assert.match(html,/noindex,nofollow/);
assert.doesNotMatch(html,/innerHTML/); // Customer labels and notes must remain text, not HTML.
assert.match(html,/An active subscription is not proof that an invoice was paid/);
console.log('PASS: status classification, overlapping attention states, owner exclusion, search privacy, output script syntax and protected response headers.');
