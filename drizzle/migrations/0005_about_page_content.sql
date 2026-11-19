BEGIN;
CREATE TABLE public.site_pages (
  slug text PRIMARY KEY,
  content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_pages TO authenticated;
GRANT ALL ON public.site_pages TO service_role;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads page content" ON public.site_pages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage page content" ON public.site_pages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
COMMIT;
