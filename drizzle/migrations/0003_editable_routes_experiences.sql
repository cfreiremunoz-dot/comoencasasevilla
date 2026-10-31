CREATE TABLE public.site_routes (
  slug text PRIMARY KEY,
  data jsonb NOT NULL,
  hidden boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.site_experiences (
  slug text PRIMARY KEY,
  data jsonb NOT NULL,
  hidden boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_routes, public.site_experiences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_routes, public.site_experiences TO authenticated;
GRANT ALL ON public.site_routes, public.site_experiences TO service_role;
ALTER TABLE public.site_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads routes" ON public.site_routes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin writes routes" ON public.site_routes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "public reads experiences" ON public.site_experiences FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin writes experiences" ON public.site_experiences FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));