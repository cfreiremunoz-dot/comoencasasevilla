CREATE TABLE public.news_articles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL,
 genre text NOT NULL DEFAULT 'noticia' CHECK (genre IN ('noticia','cronica','reportaje')),
 neighborhood text NOT NULL,
 summary text NOT NULL DEFAULT '',
 body text NOT NULL,
 author_name text NOT NULL,
 image_path text,
 image_caption text NOT NULL DEFAULT '',
 sources text NOT NULL DEFAULT '',
 published boolean NOT NULL DEFAULT false,
 published_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_articles TO authenticated;
GRANT ALL ON public.news_articles TO service_role;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published journalism" ON public.news_articles FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins read drafts" ON public.news_articles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create journalism" ON public.news_articles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins edit journalism" ON public.news_articles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete journalism" ON public.news_articles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));