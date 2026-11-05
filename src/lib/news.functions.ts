import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export const getPublicNews = createServerFn({ method: 'GET' }).handler(async () => {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  const client = createClient<Database>(process.env['SUPABASE_URL']!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.from('news_articles')
    .select('id,title,genre,neighborhood,summary,body,author_name,image_path,image_caption,sources,published_at,updated_at')
    .eq('published', true).order('published_at', { ascending: false });
  if (error) throw new Error('No se pudieron cargar las noticias');
  return Promise.all((data ?? []).map(async (article) => {
    const photo = article.image_path ? await client.storage.from('recommendation-photos').createSignedUrl(article.image_path, 3600) : null;
    return { ...article, photo: photo?.data?.signedUrl ?? null };
  }));
});