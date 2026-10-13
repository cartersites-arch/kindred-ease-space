// Local integration check. Supabase-only extensions use stand-ins here; the
// isolated hosted database must also validate the real extensions afterwards.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";

const manifest = JSON.parse(readFileSync(process.argv[2], "utf8"));
assert.equal(manifest.project_id, "jwqldxatoyeobnoibdvl");
const db = new PGlite({ extensions: { pg_trgm } });
await db.exec(`
 CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
 CREATE ROLE service_role NOLOGIN BYPASSRLS;
 CREATE SCHEMA auth; CREATE SCHEMA extensions; CREATE SCHEMA cron;
 CREATE SCHEMA pgmq; CREATE SCHEMA vault; CREATE SCHEMA net; CREATE SCHEMA storage;
 CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean DEFAULT false,
 file_size_limit bigint,allowed_mime_types text[],owner uuid,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
 CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text REFERENCES storage.buckets(id),
 name text,owner uuid,owner_id text,metadata jsonb,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
 ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
 CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql IMMUTABLE
 AS $$ SELECT (string_to_array($1,'/'))[1:(array_length(string_to_array($1,'/'),1)-1)] $$;
 CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
   SELECT nullif(nullif(current_setting('request.jwt.claims', true),'')::jsonb->>'sub','')::uuid $$;
 CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
   SELECT nullif(current_setting('request.jwt.claims', true),'')::jsonb->>'role' $$;
 CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
   SELECT coalesce(nullif(current_setting('request.jwt.claims', true),'')::jsonb,'{}'::jsonb) $$;
 GRANT USAGE ON SCHEMA public, auth, extensions TO anon, authenticated, service_role;
 GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role;
 ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
 ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
 ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
 CREATE TABLE cron.job(jobid bigserial PRIMARY KEY, jobname text UNIQUE, schedule text, command text, active boolean DEFAULT true);
 CREATE FUNCTION cron.schedule(text,text,text) RETURNS bigint LANGUAGE sql AS $$
  INSERT INTO cron.job(jobname,schedule,command) VALUES ($1,$2,$3)
  ON CONFLICT(jobname) DO UPDATE SET schedule=$2,command=$3 RETURNING jobid $$;
 CREATE FUNCTION cron.unschedule(text) RETURNS boolean LANGUAGE sql AS $$
  DELETE FROM cron.job WHERE jobname=$1 RETURNING true $$;
 CREATE FUNCTION cron.unschedule(bigint) RETURNS boolean LANGUAGE sql AS $$
  DELETE FROM cron.job WHERE jobid=$1 RETURNING true $$;
 CREATE FUNCTION cron.alter_job(job_id bigint,schedule text DEFAULT NULL,command text DEFAULT NULL,
  database text DEFAULT NULL,username text DEFAULT NULL,active boolean DEFAULT NULL)
 RETURNS void LANGUAGE sql AS $$ UPDATE cron.job SET active=coalesce($6,cron.job.active) WHERE jobid=$1 $$;
 CREATE TABLE vault.secrets(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text,secret text);
 CREATE VIEW vault.decrypted_secrets AS SELECT id,name,secret AS decrypted_secret FROM vault.secrets;
 CREATE FUNCTION pgmq.create(text) RETURNS void LANGUAGE sql AS $$ SELECT $$;
 CREATE FUNCTION pgmq.send(text,jsonb) RETURNS bigint LANGUAGE sql AS $$ SELECT 1::bigint $$;
 CREATE FUNCTION pgmq.read(text,int,int) RETURNS TABLE(msg_id bigint,read_ct int,message jsonb)
 LANGUAGE sql AS $$ SELECT 1::bigint,1::int,'{}'::jsonb WHERE false $$;
 CREATE FUNCTION pgmq.delete(text,bigint) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
 CREATE FUNCTION net.http_post(url text,body jsonb DEFAULT '{}',params jsonb DEFAULT '{}',
  headers jsonb DEFAULT '{}',timeout_milliseconds int DEFAULT 1000) RETURNS bigint LANGUAGE sql AS $$ SELECT 1::bigint $$;
 CREATE FUNCTION extensions.test_vector_distance(real[],real[]) RETURNS double precision
 LANGUAGE sql IMMUTABLE AS $$ SELECT 0::double precision $$;
 CREATE OPERATOR extensions.<=> (LEFTARG=real[],RIGHTARG=real[],FUNCTION=extensions.test_vector_distance);
 CREATE EXTENSION pg_trgm SCHEMA extensions;
 SET search_path=public,extensions;
`);

let completed = 0;
for (const stage of manifest.chain) {
  if (stage.name === "kindred_test_extensions") continue;
  // The vector binary is not shipped in this local runtime. Real vector DDL
  // remains intact in the hosted chain; only this local validation uses arrays.
  const sql = stage.query
    .replace(/CREATE\s+(?:UNIQUE\s+)?INDEX[^;]*(?:ivfflat|hnsw|vector_[a-z_]+_ops)[^;]*;/gi, "")
    .replace(/\bvector\s*(?:\(\s*\d+\s*\))?/gi, "real[]");
  try {
    await db.exec("BEGIN;\n" + sql + "\nCOMMIT;");
    completed++;
  } catch (error) {
    await db.exec("ROLLBACK;");
    console.error(
      JSON.stringify({
        stage: stage.name,
        source: stage.source,
        message: error.message,
        detail: error.detail,
        position: error.position,
        completed,
      }),
    );
    process.exitCode = 1;
    await db.close();
    process.exit(1);
  }
}

const ids = (await db.query("SELECT gen_random_uuid() AS a, gen_random_uuid() AS b")).rows[0];
await db.query(
  `INSERT INTO auth.users(id,email,raw_user_meta_data)
 VALUES ($1,'owner-a@example.invalid','{"role":"admin"}'),($2,'owner-b@example.invalid','{}')`,
  [ids.a, ids.b],
);
async function asUser(id, query, params = []) {
  await db.exec("BEGIN; SET LOCAL ROLE authenticated;");
  await db.query("SELECT set_config('request.jwt.claims',$1,true)", [
    JSON.stringify({ sub: id, role: "authenticated" }),
  ]);
  try {
    const result = await db.query(query, params);
    await db.exec("COMMIT;");
    return result;
  } catch (error) {
    await db.exec("ROLLBACK;");
    throw error;
  }
}
const a = (
  await asUser(
    ids.a,
    "SELECT public.provision_workspace_for_user('Owner A',NULL,NULL,true) AS result",
  )
).rows[0].result.workspace_id;
const b = (
  await asUser(
    ids.b,
    "SELECT public.provision_workspace_for_user('Owner B',NULL,NULL,true) AS result",
  )
).rows[0].result.workspace_id;
assert.notEqual(a, b);
assert.equal(
  (await asUser(ids.a, "SELECT count(*)::int AS n FROM public.workspaces")).rows[0].n,
  1,
);
assert.equal(
  (await asUser(ids.b, "SELECT count(*)::int AS n FROM public.workspaces WHERE id=$1", [a])).rows[0]
    .n,
  0,
);
assert.equal(
  (
    await asUser(
      ids.b,
      "SELECT count(*)::int AS n FROM public.workspace_members WHERE workspace_id=$1",
      [a],
    )
  ).rows[0].n,
  0,
);
await assert.rejects(() =>
  asUser(
    ids.b,
    "INSERT INTO public.workspace_members(workspace_id,user_id,role) VALUES ($1,$2,'owner')",
    [a, ids.b],
  ),
);
assert.equal(
  (await asUser(ids.a, "SELECT public.has_role($1,'admin') AS allowed", [ids.a])).rows[0].allowed,
  false,
);
assert.equal(
  (await asUser(ids.b, "SELECT count(*)::int AS n FROM public.profiles WHERE user_id=$1", [ids.a]))
    .rows[0].n,
  0,
);
assert.equal((await db.query("SELECT count(*)::int AS n FROM cron.job WHERE active")).rows[0].n, 0);
const secretAcl = (await db.query(`SELECT
 has_function_privilege('anon','public.tenant_get_integration_secret(uuid)','EXECUTE') AS anon,
 has_function_privilege('authenticated','public.tenant_get_integration_secret(uuid)','EXECUTE') AS authenticated,
 has_function_privilege('service_role','public.tenant_get_integration_secret(uuid)','EXECUTE') AS server`)).rows[0];
assert.deepEqual(secretAcl, { anon: false, authenticated: false, server: true });
const unprotected = (
  await db.query(`SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relkind IN ('r','p') AND NOT c.relrowsecurity
 AND NOT EXISTS(SELECT 1 FROM pg_depend d WHERE d.objid=c.oid AND d.deptype='e')`)
).rows;
assert.deepEqual(unprotected, []);
console.log(
  JSON.stringify({
    completed_stages: completed,
    workspace_provisioning: "passed",
    cross_workspace_reads: "blocked",
    self_join_takeover: "blocked",
    metadata_admin_claim: "ignored",
    private_profile_reads: "blocked",
    active_jobs: 0,
    unprotected_tables: 0,
    extension_limit:
      "vector, pg_cron, pg_net, pgmq, and Vault use local stand-ins; hosted validation still required",
  }),
);
await db.close();
