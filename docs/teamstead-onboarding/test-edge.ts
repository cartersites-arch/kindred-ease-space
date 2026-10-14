// isolated-products/teamstead/hub-backend-source/backend-boundary.mjs
var TEAMSTEAD_URL = "https://dkcfampfxyydioksrtrl.supabase.co";
async function backendReady({ url, key, fetcher = fetch }) {
  if (url !== TEAMSTEAD_URL || !key) return false;
  try {
    const result = await fetcher(url + "/rest/v1/product_identity?id=eq.1&select=product,project_id,active", { headers: { apikey: key, Authorization: "Bearer " + key }, signal: AbortSignal.timeout(1e4) });
    if (!result.ok) return false;
    const rows = await result.json();
    return rows.length === 1 && rows[0].product === "teamstead-capacity-test" && rows[0].project_id === "dkcfampfxyydioksrtrl" && rows[0].active === true;
  } catch {
    return false;
  }
}

// isolated-products/teamstead/hub-backend-source/company-setup/company-setup-edge.mjs
var root = "https://dkcfampfxyydioksrtrl.supabase.co";
var chat = "https://teamstead-capacity-chat.pages.dev";
var hash = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), (x) => x.toString(16).padStart(2, "0")).join("");
function createSetupHandler({ key, fetcher = fetch }) {
  return async (request) => {
    const reply = (status, data) => Response.json(data, { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
    if (request.method !== "POST" || request.headers.get("origin")) return reply(403, { error: "Open company setup in Chat." });
    if (!await backendReady({ url: root, key, fetcher })) return reply(503, { error: "Teamstead is being prepared. Please continue using your current company link." });
    try {
      if (Number(request.headers.get("content-length")) > 1e5) return reply(413, { error: "Company setup is too large." });
      const reader = request.body?.getReader(), chunks = [];
      let size = 0;
      if (reader) while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.length;
        if (size > 1e5) {
          await reader.cancel();
          return reply(413, { error: "Company setup is too large." });
        }
        chunks.push(part.value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      const raw = new TextDecoder().decode(bytes);
      const data = JSON.parse(raw);
      if (!(/^(main|demo|pilot)$/.test(data.scope) || /^c_[a-f0-9]{16}$/.test(data.scope)) || !(/^(main|demo|pilot)$/.test(data.company) || /^c_[a-f0-9]{16}$/.test(data.company)) || typeof data.cookie !== "string" || data.cookie.length > 8e3 || typeof data.viewer !== "string" || data.viewer.length > 100) return reply(400, { error: "Check company selection." });
      const auth = { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" };
      const config = await fetcher(root + "/rest/v1/hub_r2_configuration?id=eq.1&select=private_key", { headers: auth });
      if (!config.ok) throw Error();
      const rows = await config.json();
      const signing = await crypto.subtle.importKey("jwk", rows[0].private_key, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
      const body = JSON.stringify({ company: data.company }), at = String(Date.now());
      const signature = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, signing, new TextEncoder().encode(["pms-company-v1", at, await hash(data.cookie), await hash(body)].join("\n"))));
      const sig = btoa(String.fromCharCode(...signature)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const check = await fetcher(chat + "/api/workspace-attestation?company=" + data.scope, { method: "POST", headers: { "Content-Type": "application/json", Cookie: data.cookie, "X-Project-User": data.viewer, "x-signed-at": at, "x-signature": sig }, body, signal: AbortSignal.timeout(15e3) });
      const actor = await check.json();
      if (!check.ok) return reply(check.status, { error: actor.error || "Confirm owner access in Chat." });
      if (data.action?.startsWith("roster_") && data.scope !== data.company) return reply(403, { error: "Open this company\u2019s own administration." });
      if (!actor.ok || actor.company !== data.company) return reply(403, { error: "Owner access required." });
      if (!["roster_list", "roster_link", "provision", "assets", "save_assets", "company_info", "member_invite", "member_revoke", "platform_status", "delete_begin", "delete_files", "delete_records"].includes(data.action)) return reply(400, { error: "Invalid setup action." });
      if ((data.action === "platform_status" || data.action.startsWith("delete_")) && !actor.platform) return reply(403, { error: "Platform owner access required." });
      const rpc = data.action.startsWith("roster_") ? "company_roster" : data.action.startsWith("delete_") ? "company_delete" : data.action === "platform_status" ? "company_platform_status" : data.action.startsWith("member_") ? "company_member_setup" : "company_setup";
      const deadline=Date.now()+14000;
      let content;
      for(;;){
        const result=await fetcher(root+"/rest/v1/rpc/"+rpc,{method:"POST",headers:auth,body:JSON.stringify({p_company:data.company,p_action:data.action,p_owner_id:actor.actor.id,p_data:data}),signal:AbortSignal.timeout(8000)});
        content=await result.json();
        if(!result.ok)return reply(content.code==="42501"?403:400,{error:content.message||"Check company information."});
        if(!content.pending)break;
        if(data.action!=="provision")return reply(503,{error:"Company setup is unavailable."});
        if(Date.now()>=deadline)return reply(503,{error:"Your new company is being prepared. Retry company setup shortly; your account is saved."});
        await new Promise(resolve=>setTimeout(resolve,1000));
      }
      if (data.action === "provision") return reply(200, { name: content.name, url: "https://teamstead-capacity-hub.pages.dev/#hub=" + encodeURIComponent(content.token) });
      return reply(200, content);
    } catch {
      return reply(503, { error: "Company setup could not finish. Your saved information is safe; try again." });
    }
  };
}

// isolated-products/teamstead/hub-backend-source/company-setup/index.ts
const testRoot='https://dkcfampfxyydioksrtrl.supabase.co';
const runtimeKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(Deno.env.get('SUPABASE_URL')!==testRoot||!runtimeKey)throw Error('Wrong capacity test runtime');
const runtimeHeaders={apikey:runtimeKey,Authorization:'Bearer '+runtimeKey,'Content-Type':'application/json'};
const current=await fetch(testRoot+'/rest/v1/hub_r2_configuration?id=eq.1&select=id',{headers:runtimeHeaders});
if(!current.ok)throw Error('Test signing configuration unavailable');
if((await current.json()).length===0){
 const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
 const private_key=await crypto.subtle.exportKey('jwk',pair.privateKey),public_key=await crypto.subtle.exportKey('jwk',pair.publicKey);
 const saved=await fetch(testRoot+'/rest/v1/hub_r2_configuration?on_conflict=id',{method:'POST',headers:{...runtimeHeaders,Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({id:1,private_key,public_key})});
 if(!saved.ok)throw Error('Test signing initialization failed');
}
const allowed=new Set([testRoot,'https://teamstead-capacity-chat.pages.dev']);
const guardedFetch=(input,options)=>{const u=new URL(typeof input==='string'?input:input.url);if(!allowed.has(u.origin))throw Error('Outbound target outside capacity test');return fetch(input,options);};
Deno.serve(createSetupHandler({key:runtimeKey,fetcher:guardedFetch}));
