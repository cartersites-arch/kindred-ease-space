import assert from 'node:assert/strict';
const root='https://fhqmnlpgqslllzrovxbp.supabase.co/functions/v1/company-hub/';
const fake='11111111-1111-4111-8111-111111111111';
const results=[];
for(const [name,route,headers,expected] of [['anonymous read','hub-read',{Origin:'https://pms-company-hub.pages.dev'},401],['invalid company access','hub-read',{Origin:'https://pms-company-hub.pages.dev',Authorization:'Bearer '+fake},401],['anonymous write','hub-workflow/create',{Origin:'https://pms-company-hub.pages.dev'},401],['untrusted origin','hub-read',{Origin:'https://untrusted.example',Authorization:'Bearer '+fake},403]]){const response=await fetch(root+route,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{}'});assert.equal(response.status,expected,name);const data=await response.json();assert.ok(!data.work_requests&&!data.employee&&!data.items);results.push({name,status:response.status,privateDataReturned:false});}
console.log(JSON.stringify(results,null,2));
