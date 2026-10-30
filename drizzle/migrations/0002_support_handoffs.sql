CREATE TABLE public.support_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL,
  question text NOT NULL DEFAULT '',
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.support_handoffs TO authenticated;
GRANT ALL ON public.support_handoffs TO service_role;
ALTER TABLE public.support_handoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read handoffs" ON public.support_handoffs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update handoffs" ON public.support_handoffs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete handoffs" ON public.support_handoffs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));