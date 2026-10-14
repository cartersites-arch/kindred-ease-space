CREATE OR REPLACE FUNCTION public.company_setup(p_company text, p_action text, p_owner_id text, p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE config public.company_workspaces%rowtype; employee uuid; token uuid; asset uuid; item jsonb; result jsonb; count_saved integer:=0; name text;
BEGIN
 IF (p_company NOT IN ('demo','pilot') AND p_company !~ '^c_[a-f0-9]{16}$') OR length(p_owner_id)>100 OR p_owner_id IS NULL THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='28000'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('company-setup:'||p_company,0));
 SELECT * INTO config FROM public.company_workspaces WHERE id=p_company;
 IF config.id IS NOT NULL AND config.owner_chat_id<>p_owner_id AND config.platform_owner_chat_id<>p_owner_id THEN RAISE EXCEPTION 'Owner access required' USING ERRCODE='42501'; END IF;
 IF p_action='provision' THEN
 IF p_company ~ '^c_[a-f0-9]{16}$' AND config.id IS NULL THEN
 IF p_owner_id<>p_data->>'ownerChatId' THEN RAISE EXCEPTION 'Owner mismatch' USING ERRCODE='42501'; END IF;
 IF to_regclass('public.'||p_company||'_employees') IS NULL THEN
  IF p_data->>'ownerChatId' IS NULL OR p_owner_id IS DISTINCT FROM p_data->>'ownerChatId' THEN RAISE EXCEPTION 'Owner mismatch' USING ERRCODE='42501'; END IF;
  IF p_data->>'name' IS NULL OR length(trim(p_data->>'name')) NOT BETWEEN 1 AND 60 OR p_data->>'ownerName' IS NULL OR length(p_data->>'ownerName') NOT BETWEEN 1 AND 60 THEN RAISE EXCEPTION 'Check company information' USING ERRCODE='22023'; END IF;
  INSERT INTO teamstead_provision.jobs(company,owner_id) VALUES(p_company,p_owner_id::uuid) ON CONFLICT(company) DO NOTHING;
  IF NOT EXISTS(SELECT 1 FROM teamstead_provision.jobs WHERE company=p_company AND owner_id=p_owner_id::uuid) THEN RAISE EXCEPTION 'Owner mismatch' USING ERRCODE='42501'; END IF;
  IF EXISTS(SELECT 1 FROM teamstead_provision.jobs WHERE company=p_company AND state='failed' AND attempts>=3) THEN RAISE EXCEPTION 'Company setup needs support' USING ERRCODE='55000'; END IF;
  RETURN jsonb_build_object('pending',true);
 END IF;
 END IF;
  name:=trim(p_data->>'name'); IF name IS NULL OR length(name) NOT BETWEEN 1 AND 60 OR length(p_data->>'ownerName') NOT BETWEEN 1 AND 60 THEN RAISE EXCEPTION 'Check company information' USING ERRCODE='22023'; END IF;
  IF p_data->>'ownerChatId' IS NULL OR (p_data->>'ownerChatId') !~ '^[0-9a-f-]{36}$' THEN RAISE EXCEPTION 'Owner account required' USING ERRCODE='22023'; END IF;
  employee:=coalesce(config.owner_employee_id,(p_data->>'ownerChatId')::uuid);
  EXECUTE format('INSERT INTO public.%I_employees(id,full_name,employee_name,role,hub_approval_enabled) VALUES($1,$2,$2,''manager'',true) ON CONFLICT(id) DO UPDATE SET full_name=excluded.full_name RETURNING hub_token',p_company) INTO token USING employee,p_data->>'ownerName';
  INSERT INTO public.company_workspaces(id,name,owner_chat_id,owner_employee_id,platform_owner_chat_id) VALUES(p_company,name,p_data->>'ownerChatId',employee,p_owner_id) ON CONFLICT(id) DO UPDATE SET name=excluded.name;
  IF config.id IS NULL AND p_company='demo' THEN
   FOR item IN SELECT value FROM jsonb_array_elements('[{"name":"Sample Ferris Wheel","number":"DEMO-001","type":"ride","manufacturer":"Sample manufacturer"},{"name":"Sample Service Vehicle","number":"DEMO-002","type":"vehicle","manufacturer":"Sample manufacturer"}]'::jsonb) LOOP
    asset:=gen_random_uuid(); EXECUTE format('INSERT INTO public.%I_assets(id,asset_name,asset_number,asset_type,manufacturer) VALUES($1,$2,$3,$4,$5)',p_company) USING asset,item->>'name',item->>'number',item->>'type',item->>'manufacturer';
    EXECUTE format('INSERT INTO public.%I_ops_manual_sources(source_file,ride_name) VALUES($1,$2)',p_company) USING 'asset:'||asset,item->>'name';
    IF item->>'type'='ride' THEN EXECUTE format('INSERT INTO public.%I_rides(id,slug,name,manufacturer) VALUES($1,$2,$3,$4)',p_company) USING asset,'asset-'||asset,item->>'name',item->>'manufacturer'; END IF;
   END LOOP;
  END IF;
  RETURN jsonb_build_object('token',token,'employee',employee,'name',name);
 END IF;
 IF config.id IS NULL THEN RAISE EXCEPTION 'Activate company first' USING ERRCODE='22023'; END IF;
 IF p_action='assets' THEN EXECUTE format('SELECT coalesce(jsonb_agg(jsonb_build_object(''id'',id,''name'',asset_name,''number'',asset_number,''type'',asset_type,''manufacturer'',manufacturer,''model'',model,''serial'',serial_number) ORDER BY asset_name),''[]''::jsonb) FROM public.%I_assets WHERE active',p_company) INTO result; RETURN jsonb_build_object('assets',result,'name',config.name); END IF;
 IF p_action='save_assets' THEN
  IF jsonb_typeof(p_data->'assets')<>'array' OR jsonb_array_length(p_data->'assets') NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Add 1 to 100 assets' USING ERRCODE='22023'; END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(p_data->'assets') LOOP
   IF jsonb_typeof(item)<>'object' OR length(trim(item->>'name')) NOT BETWEEN 1 AND 100 OR item->>'name' IS NULL OR coalesce(length(item->>'number'),0)>60 OR coalesce(length(item->>'type'),0)>40 OR coalesce(length(item->>'manufacturer'),0)>100 OR coalesce(length(item->>'model'),0)>100 OR coalesce(length(item->>'serial'),0)>100 THEN RAISE EXCEPTION 'Check asset fields' USING ERRCODE='22023'; END IF;
   EXECUTE format('SELECT id FROM public.%I_assets WHERE active AND lower(asset_name)=lower($1) AND coalesce(asset_number,'''')=coalesce($2,'''') LIMIT 1',p_company) INTO asset USING trim(item->>'name'),item->>'number';
   IF asset IS NOT NULL THEN CONTINUE; END IF;
   asset:=gen_random_uuid(); EXECUTE format('INSERT INTO public.%I_assets(id,asset_name,asset_number,asset_type,manufacturer,model,serial_number) VALUES($1,$2,$3,$4,$5,$6,$7)',p_company) USING asset,trim(item->>'name'),item->>'number',coalesce(item->>'type','equipment'),item->>'manufacturer',item->>'model',item->>'serial';
   EXECUTE format('INSERT INTO public.%I_ops_manual_sources(source_file,ride_name) VALUES($1,$2)',p_company) USING 'asset:'||asset,trim(item->>'name');
   IF lower(item->>'type')='ride' THEN EXECUTE format('INSERT INTO public.%I_rides(id,slug,name,manufacturer,serial_number) VALUES($1,$2,$3,$4,$5)',p_company) USING asset,'asset-'||asset,trim(item->>'name'),item->>'manufacturer',item->>'serial'; END IF;
   count_saved:=count_saved+1;
  END LOOP;
  RETURN jsonb_build_object('ok',true,'saved',count_saved);
 END IF;
 RAISE EXCEPTION 'Invalid action' USING ERRCODE='22023';
END $function$
;
REVOKE ALL ON FUNCTION public.company_setup(text,text,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_setup(text,text,text,jsonb) TO service_role;
