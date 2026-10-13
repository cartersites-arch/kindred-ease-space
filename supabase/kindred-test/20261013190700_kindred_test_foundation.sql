-- Created with Supabase CLI migration new. Test-only reconstruction of the
-- workspace contract in src/integrations/supabase/types.ts and workspace.functions.ts.
-- Apply after the archived schema definitions and before the active migrations.
-- The original workspace DDL is absent; these defaults and policies are deliberate
-- test choices, not a claim to reproduce the production database exactly.

CREATE TYPE public.app_plan AS ENUM ('starter', 'growth', 'scale', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM
  ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused');
CREATE TYPE public.workspace_role AS ENUM ('owner', 'editor');

CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  marketplace_domain text,
  brand_color text,
  brand_name text,
  logo_url text,
  domain_verified_at timestamptz,
  plan public.app_plan NOT NULL DEFAULT 'starter',
  subscription_status public.subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'editor',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX workspace_members_user_id_idx ON public.workspace_members(user_id);
CREATE INDEX workspace_members_workspace_id_idx ON public.workspace_members(workspace_id);

-- Definer helpers avoid recursion through membership RLS. They only return a
-- boolean; row access still requires the caller's auth.uid() in each policy.
CREATE FUNCTION public.is_workspace_member(_workspace_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.workspace_members
                    WHERE workspace_id = _workspace_id AND user_id = _user_id) $$;
CREATE FUNCTION public.is_workspace_owner(_workspace_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.workspace_members
                    WHERE workspace_id = _workspace_id AND user_id = _user_id AND role = 'owner') $$;
REVOKE ALL ON FUNCTION public.is_workspace_member(uuid, uuid), public.is_workspace_owner(uuid, uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid), public.is_workspace_owner(uuid, uuid)
  TO authenticated, service_role;

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own workspace" ON public.workspaces FOR SELECT TO authenticated
  USING (public.is_workspace_member(id, (SELECT auth.uid())));
CREATE POLICY "Owners update own workspace" ON public.workspaces FOR UPDATE TO authenticated
  USING (public.is_workspace_owner(id, (SELECT auth.uid())))
  WITH CHECK (public.is_workspace_owner(id, (SELECT auth.uid())));
CREATE POLICY "Members read workspace membership" ON public.workspace_members FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, (SELECT auth.uid())));
CREATE POLICY "Owners manage workspace membership" ON public.workspace_members FOR ALL TO authenticated
  USING (public.is_workspace_owner(workspace_id, (SELECT auth.uid())))
  WITH CHECK (public.is_workspace_owner(workspace_id, (SELECT auth.uid())));

CREATE TRIGGER workspaces_updated_at BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.workspaces (name, slug, is_internal, plan, subscription_status)
VALUES ('Kindred test internal reference', 'kindred-test-internal', true, 'starter', 'paused');

-- Generated reference identifier: migrations resolve by slug, never by a
-- copied production workspace or user UUID. Not exposed to client API roles.
CREATE FUNCTION public.kindred_test_internal_workspace_id()
RETURNS uuid LANGUAGE sql STABLE SET search_path = public
AS $$ SELECT id FROM public.workspaces WHERE slug = 'kindred-test-internal' $$;
REVOKE ALL ON FUNCTION public.kindred_test_internal_workspace_id() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kindred_test_internal_workspace_id() TO service_role;

-- The May BYOK help migration references this category, but the fork never
-- seeds it. This is static help configuration, with no copied customer rows.
INSERT INTO public.help_categories (slug, name, sort_order, is_published)
VALUES ('billing', 'Billing', 6, true) ON CONFLICT (slug) DO NOTHING;
