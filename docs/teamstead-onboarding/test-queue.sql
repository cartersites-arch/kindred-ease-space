CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE SCHEMA IF NOT EXISTS teamstead_provision;
REVOKE ALL ON SCHEMA teamstead_provision FROM PUBLIC,anon,authenticated;
GRANT USAGE ON SCHEMA teamstead_provision TO service_role;
CREATE TABLE teamstead_provision.jobs(
 company text PRIMARY KEY CHECK(company ~ '^c_[a-f0-9]{16}$'),
 owner_id uuid NOT NULL,
 state text NOT NULL DEFAULT 'queued' CHECK(state IN ('queued','ready','failed')),
 attempts integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 finished_at timestamptz,
 next_attempt_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 error_code text
);
ALTER TABLE teamstead_provision.jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON teamstead_provision.jobs FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON teamstead_provision.jobs TO service_role;
GRANT INSERT(company,owner_id) ON teamstead_provision.jobs TO service_role;

CREATE FUNCTION teamstead_provision.run_jobs() RETURNS integer
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $worker$
DECLARE job record; processed integer:=0;
BEGIN
 IF current_user <> 'postgres' THEN RAISE EXCEPTION 'Provisioner access required' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.product_identity WHERE id=1 AND project_id='dkcfampfxyydioksrtrl' AND active) THEN RAISE EXCEPTION 'Wrong provisioning database' USING ERRCODE='42501'; END IF;
 FOR job IN SELECT company FROM teamstead_provision.jobs
  WHERE state IN ('queued','failed') AND attempts<3 AND next_attempt_at<=clock_timestamp()
  ORDER BY created_at LIMIT 2 FOR UPDATE SKIP LOCKED
 LOOP
  BEGIN
   PERFORM public.company_ensure_schema(job.company);
   UPDATE teamstead_provision.jobs SET state='ready',attempts=attempts+1,finished_at=clock_timestamp(),error_code=NULL WHERE company=job.company;
  EXCEPTION WHEN others THEN
   UPDATE teamstead_provision.jobs SET state='failed',attempts=attempts+1,next_attempt_at=clock_timestamp()+interval '15 seconds',error_code=SQLSTATE WHERE company=job.company;
  END;
  processed:=processed+1;
 END LOOP;
 RETURN processed;
END $worker$;
REVOKE ALL ON FUNCTION teamstead_provision.run_jobs() FROM PUBLIC,anon,authenticated,service_role;
SELECT cron.schedule('teamstead-test-company-provisioner','5 seconds','SELECT teamstead_provision.run_jobs();');
ALTER FUNCTION public.company_ensure_schema(text) SET search_path='';
REVOKE EXECUTE ON FUNCTION public.company_ensure_schema(text) FROM service_role;
