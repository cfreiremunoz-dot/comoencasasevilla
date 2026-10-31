import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { routes as staticRoutes, experiences as staticExperiences } from '@/data/content';
import type { Experience, Route } from '@/data/types';
import { BUCKET } from '@/lib/recommendations';

// Fotos subidas al almacenamiento privado se guardan como "storage:<ruta>".
export const STORAGE_PREFIX = 'storage:';

type Row = { slug: string; data: unknown; hidden: boolean };

async function resolveImages<T extends { image: string }>(items: T[]): Promise<T[]> {
  const paths = items.map((i) => i.image).filter((p) => p?.startsWith(STORAGE_PREFIX)).map((p) => p.slice(STORAGE_PREFIX.length));
  if (!paths.length) return items;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 24);
  const map = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return items.map((i) => (i.image?.startsWith(STORAGE_PREFIX) ? { ...i, image: map.get(i.image.slice(STORAGE_PREFIX.length)) ?? '' } : i));
}

function merge<T extends { slug: string; image: string }>(base: T[], rows: Row[], includeHidden: boolean): (T & { hidden?: boolean; edited?: boolean })[] {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const out: (T & { hidden?: boolean; edited?: boolean })[] = base.map((b) => {
    const r = bySlug.get(b.slug);
    return r ? { ...b, ...(r.data as T), slug: b.slug, hidden: r.hidden, edited: true } : b;
  });
  for (const r of rows) if (!base.some((b) => b.slug === r.slug)) out.push({ ...(r.data as T), slug: r.slug, hidden: r.hidden, edited: true });
  return includeHidden ? out : out.filter((i) => !i.hidden);
}

function useMerged<T extends { slug: string; image: string }>(table: 'site_routes' | 'site_experiences', base: T[], includeHidden: boolean, raw: boolean) {
  const q = useQuery({
    queryKey: [table, includeHidden, raw],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select('slug,data,hidden');
      if (error) throw error;
      const merged = merge(base, (data ?? []) as Row[], includeHidden);
      return raw ? merged : resolveImages(merged);
    },
  });
  return { items: q.data ?? merge(base, [], includeHidden), isLoading: q.isLoading };
}

export const useRoutes = (opts: { includeHidden?: boolean; raw?: boolean } = {}) =>
  useMerged<Route>('site_routes', staticRoutes, !!opts.includeHidden, !!opts.raw);
export const useExperiences = (opts: { includeHidden?: boolean; raw?: boolean } = {}) =>
  useMerged<Experience>('site_experiences', staticExperiences, !!opts.includeHidden, !!opts.raw);

export function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}
