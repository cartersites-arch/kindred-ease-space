-- Created with Supabase CLI migration new. Supabase's default function ACLs
-- grant anon/authenticated explicitly, so revoking PUBLIC alone is insufficient.
-- This RPC decrypts an integration secret and must remain server-only.
REVOKE ALL ON FUNCTION public.tenant_get_integration_secret(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_get_integration_secret(uuid) TO service_role;
