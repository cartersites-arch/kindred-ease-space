-- Test fixtures only. No production resources or customer inventory.
-- Execute only against project jwqldxatoyeobnoibdvl. The account/workspace
-- guards below intentionally prevent replay on a fresh or unrelated database.
DO $$
BEGIN
  IF (SELECT count(*) FROM auth.users WHERE
    (id='897fa94a-2731-474c-a2c0-ceb5055a998f' AND email='cartersites@yahoo.com') OR
    (id='ddbc30e7-8d2a-4549-82f4-9188d416730e' AND email='jarhead4zoe@gmail.com')) <> 2 THEN
    RAISE EXCEPTION 'Expected isolated test accounts are missing';
  END IF;
  IF EXISTS (SELECT 1 FROM workspaces WHERE id IN
    ('0d787190-6320-49f5-b04e-25bd548cb03b','d588a61c-a6cc-45f0-89ca-0135ab6bc9ad')
    AND owner_user_id NOT IN ('897fa94a-2731-474c-a2c0-ceb5055a998f','ddbc30e7-8d2a-4549-82f4-9188d416730e')) THEN
    RAISE EXCEPTION 'Unexpected workspace owner';
  END IF;
END $$;
INSERT INTO public.tenant_listings (
 workspace_id,sharetribe_listing_id,title,slug,description,marketplace_url,
 price_amount,price_currency,price_unit,city,state,country,category,
 country_key,region_key,city_key,category_key,state_published,custom_fields)
SELECT w.id, gen_random_uuid(),
 'Isolated Test ' || c.category || ' ' || n,
 'isolated-e2e-' || c.key || '-' || n,
 'Dummy inventory for isolated AI generation testing. No real booking or service is offered.',
 'https://example.com/isolated-test/' || c.key || '/' || n,
 1000*n,'USD','day',c.city,'California','United States',c.category,
 'us','ca',c.city_key,c.key,true,'{"isolated_e2e":true,"run":"20261013"}'::jsonb
FROM public.workspaces w
CROSS JOIN (VALUES
 ('Test Garden Tools','test-garden-tools','Test Cedar City','test-cedar-city'),
 ('Test Camping Gear','test-camping-gear','Test Pine City','test-pine-city'),
 ('Test Party Supplies','test-party-supplies','Test Maple City','test-maple-city')
) c(category,key,city,city_key)
CROSS JOIN generate_series(1,3) n
WHERE w.id IN ('0d787190-6320-49f5-b04e-25bd548cb03b','d588a61c-a6cc-45f0-89ca-0135ab6bc9ad')
AND NOT EXISTS (SELECT 1 FROM public.tenant_listings l
 WHERE l.workspace_id=w.id AND l.slug='isolated-e2e-' || c.key || '-' || n);
SELECT workspace_id,count(*) AS dummy_listings FROM public.tenant_listings
WHERE custom_fields->>'isolated_e2e'='true' GROUP BY workspace_id;
