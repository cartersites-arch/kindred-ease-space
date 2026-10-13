"""Prepare an isolated schema chain from the fork; does not connect to a database.

Requires pglast. Archived data rows and outbound schedules are excluded. The
active migration chain is retained, with project references adapted to the test.
"""
import argparse
import json
import re
from pathlib import Path
from pglast import parse_sql
from pglast.stream import RawStream

ROOT = Path(__file__).resolve().parents[1]
PROJECT = 'jwqldxatoyeobnoibdvl'
ORIGIN = 'https://kindred-ease-space-test.pms-chat.workers.dev'
BLOCKED = re.compile(r'\b(?:pg_read_file|pg_read_binary_file|pg_ls_dir|lo_import)\s*\(|\bCOPY\b.*\b(?:PROGRAM|FROM\s+\')', re.I | re.S)
OFF = '''DO $$ DECLARE j record; BEGIN
  FOR j IN SELECT jobid FROM cron.job LOOP
    PERFORM cron.alter_job(job_id := j.jobid, active := false);
  END LOOP;
END $$;'''

def statements(path, archived=False):
    retained, excluded = [], []
    for raw in parse_sql(path.read_text()):
        kind = type(raw.stmt).__name__
        sql = RawStream()(raw.stmt)
        reason = None
        if archived and path.name == '20260502233000_a1b2c3d4-e5f6-7890-abcd-ef1234567890.sql' and re.search(r'\bcontent_pages\b', sql):
            reason = 'superseded_pool_directory_content_model'
        elif BLOCKED.search(sql):
            reason = 'server_filesystem_operation'
        elif kind == 'CreateExtensionStmt' or (kind == 'DoStmt' and re.search(r'CREATE\s+EXTENSION', sql, re.I)):
            reason = 'extensions_enabled_separately'
        elif archived and kind == 'InsertStmt' and raw.stmt.relation.schemaname == 'storage' and raw.stmt.relation.relname == 'buckets':
            pass  # Bucket definitions are resource configuration, not customer data.
        elif archived and kind == 'InsertStmt' and raw.stmt.relation.schemaname == 'public' and raw.stmt.relation.relname == 'help_categories':
            pass  # Static category slugs are required by later help-article migrations.
        elif archived and kind in ('InsertStmt', 'UpdateStmt', 'DeleteStmt', 'SelectStmt'):
            reason = 'legacy_data_or_scheduled_job'
        elif archived and kind == 'DoStmt' and re.search(r'cron\.(?:schedule|unschedule)', sql, re.I):
            reason = 'legacy_scheduled_job'
        if reason:
            excluded.append({'kind': kind, 'reason': reason})
            continue
        if kind == 'ViewStmt' and not re.search(r'security_invoker', sql, re.I):
            sql = re.sub(r'\bAS\s+SELECT\b', 'WITH (security_invoker = true) AS SELECT', sql, count=1, flags=re.I)
        # Extension functions/operators must also resolve from fixed search paths.
        sql = re.sub(r'SET\s+search_path\s+(?:TO|=)\s+(?:\'public\'|"public"|public)(?=\s+(?:AS|LANGUAGE|STABLE|SECURITY))',
                     'SET search_path TO public, extensions', sql, flags=re.I)
        if not archived:
            sql = sql.replace("'6501e018-473c-4c09-a834-a0bdb59aa0ee'", 'public.kindred_test_internal_workspace_id()')
            sql = sql.replace('https://xbxhzinnfhosoztqaaao.supabase.co', 'https://' + PROJECT + '.supabase.co')
            sql = re.sub(r'https://(?:www\.)?founders\.click|https://project--[a-z0-9-]+\.lovable\.app', ORIGIN, sql)
            # Old anon JWTs are not valid test credentials; jobs stay disabled.
            sql = re.sub(r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', 'TEST_CRON_CREDENTIAL_NOT_CONFIGURED', sql)
        retained.append(sql.rstrip(';') + ';')
    return '\n'.join(retained), excluded

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    cfg = (ROOT / 'supabase/config.toml').read_text()
    if 'project_id = "' + PROJECT + '"' not in cfg:
        raise SystemExit('Refusing to prepare a chain for any other project')
    chain, report = [], []
    extensions = '''CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgmq;
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;'''
    chain.append({'name': 'kindred_test_extensions', 'query': extensions, 'source': 'test prerequisites'})
    archived = []
    for path in sorted((ROOT / '.lovable/wave-c-bundle/supabase/migrations').glob('*.sql')):
        sql, exclusions = statements(path, archived=True)
        report.append({'source': str(path.relative_to(ROOT)), 'excluded': exclusions})
        if sql:
            archived.append('-- ' + path.name + '\n' + sql)
    chain.append({'name': 'kindred_archived_schema', 'query': '\n'.join(archived), 'source': '103 archived setup migrations; schema only'})
    foundation = ROOT / 'supabase/kindred-test/20261013190700_kindred_test_foundation.sql'
    chain.append({'name': 'kindred_test_foundation', 'query': foundation.read_text(), 'source': str(foundation.relative_to(ROOT))})
    for path in sorted((ROOT / 'supabase/migrations').glob('*.sql')):
        if path.name == '20260925000930_founder_internal_unlimited.sql':
            report.append({'source': str(path.relative_to(ROOT)), 'excluded': ['production-specific founder grant']})
            continue
        sql, exclusions = statements(path)
        if sql:
            chain.append({'name': 'kindred_' + path.stem.replace('-', '_').lower(), 'query': sql + '\n' + OFF, 'source': str(path.relative_to(ROOT))})
        report.append({'source': str(path.relative_to(ROOT)), 'excluded': exclusions})
    hardening = '''
DROP POLICY IF EXISTS "authenticated insert own membership" ON public.workspace_members;
CREATE POLICY "authenticated insert own membership" ON public.workspace_members
FOR INSERT TO authenticated WITH CHECK
 (user_id = (SELECT auth.uid()) AND public.is_workspace_owner(workspace_id, (SELECT auth.uid())));
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users read their own profile" ON public.profiles FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));
DO $$ DECLARE t record; BEGIN
 FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
          WHERE n.nspname='public' AND c.relkind IN ('r','p') AND NOT c.relrowsecurity
          AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid=c.oid AND d.deptype='e')
 LOOP EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.relname); END LOOP;
END $$;
''' + OFF + '\nNOTIFY pgrst, \'reload schema\';'
    chain.append({'name': 'kindred_test_access_hardening', 'query': hardening, 'source': 'test-only access checks'})
    for item in chain:
        if BLOCKED.search(item['query']):
            raise SystemExit('Unsafe SQL remains in ' + item['name'])
        parse_sql(item['query'])
    args.output.write_text(json.dumps({'project_id': PROJECT, 'chain': chain, 'report': report}, indent=2))
    print(json.dumps({'project_id': PROJECT, 'stages': len(chain), 'archived_migrations': 103,
                      'active_migrations': len(chain) - 4, 'sql_bytes': sum(len(i['query']) for i in chain)}))

if __name__ == '__main__':
    main()
