export function publicPrice(price,id,interval){
 if(price?.object!=='price'||price.id!==id||price.active!==true||price.livemode!==true||price.currency!=='usd'||price.billing_scheme!=='per_unit'||price.tax_behavior==='inclusive'||price.transform_quantity||price.recurring?.usage_type!=='licensed'||price.recurring.interval!==interval||price.recurring.interval_count!==1||!Number.isSafeInteger(price.unit_amount)||price.unit_amount<0)throw Error('Unsupported public price');
 return price.unit_amount;
}
export async function marketingPrices(env,{fetcher=fetch,cache=globalThis.caches?.default}={}){
 if(env.STRIPE_MODE!=='live'||!/^([sr]k)_live_/.test(env.STRIPE_SECRET_KEY||''))return {};
 const configs=['chat','hub','combined'].flatMap(plan=>['month','year'].map(interval=>({plan,interval,id:env['STRIPE_PRICE_'+plan.toUpperCase()+'_'+interval.toUpperCase()]})));
 if(configs.some(c=>!/^price_[A-Za-z0-9]+$/.test(c.id||'')))return {};
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(configs.map(c=>c.id).join(',')));
 const key=new Request('https://teamsteadcrew.com/_public-price-cache/'+Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join(''));
 try{const cached=await cache?.match(key);if(cached)return await cached.json();}catch{}
 const deadline=AbortSignal.timeout(4500),prices={};
 await Promise.all(configs.map(async c=>{try{const r=await fetcher('https://api.stripe.com/v1/prices/'+encodeURIComponent(c.id),{method:'GET',headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY},signal:deadline});if(!r.ok)return;const amount=publicPrice(await r.json(),c.id,c.interval);prices[c.plan]??={};prices[c.plan][c.interval]=amount;}catch{}}));
 // This cache contains public catalog amounts only; never customers, sessions or keys.
 if(configs.every(c=>Number.isSafeInteger(prices[c.plan]?.[c.interval])))try{await cache?.put(key,Response.json(prices,{headers:{'cache-control':'public,max-age=300'}}));}catch{}
 return prices;
}
