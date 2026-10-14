-- Test-only repair for jwqldxatoyeobnoibdvl. Created using Supabase CLI.
-- The archived empty legacy table omitted the current workspace contract.
-- Never assign archived/global pages to a test workspace automatically.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.content_pages) THEN
    RAISE EXCEPTION 'Test legacy workspace repair requires an empty content_pages table';
  END IF;
END $$;

ALTER TABLE public.content_pages
  ADD COLUMN IF NOT EXISTS workspace_id uuid NOT NULL
  REFERENCES public.workspaces(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS content_pages_workspace_id_id_idx
  ON public.content_pages(workspace_id, id);
NOTIFY pgrst, 'reload schema';
