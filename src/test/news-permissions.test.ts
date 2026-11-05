import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { createClient } from '@supabase/supabase-js';
import { afterAll, describe, expect, it } from 'vitest';

const enabled = process.env['NEWS_INTEGRATION_TEST'] === '1';
describe.skipIf(!enabled)('Noticias: permisos reales', () => {
  const url = import.meta.env['VITE_SUPABASE_URL'];
  const key = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const visitor = createClient(url, key, options);
  const session = enabled ? JSON.parse(readFileSync(`${homedir()}/.cache/lovable-auth/session.json`, 'utf8')).session : null;
  const admin = createClient(url, key, { ...options, global: { headers: { Authorization: `Bearer ${session?.access_token ?? ''}` } } });
  const ids: string[] = [];
  const article = { title: 'Prueba de permisos de Noticias', neighborhood: 'Triana', body: 'Artículo temporal para comprobar permisos.', author_name: 'Prueba', genre: 'noticia', published: false };
  afterAll(async () => { if (ids.length) await admin.from('news_articles').delete().in('id', ids); });

  it('solo las administradoras pueden crear artículos', async () => {
    const role = await admin.rpc('has_role', { _user_id: session.user.id, _role: 'admin' });
    expect(role.data).toBe(true);
    const denied = await visitor.from('news_articles').insert(article);
    expect(denied.error).not.toBeNull();
    const created = await admin.from('news_articles').insert(article).select('id').single();
    expect(created.error).toBeNull();
    expect(created.data?.id).toBeTruthy();
    if (created.data) ids.push(created.data.id);
  });
  it('los borradores son privados y los artículos publicados son públicos', async () => {
    const id = ids[0]; expect(id).toBeTruthy();
    const draft = await visitor.from('news_articles').select('id').eq('id', id);
    expect(draft.data).toEqual([]);
    const published = await admin.from('news_articles').update({ published: true, published_at: new Date().toISOString() }).eq('id', id);
    expect(published.error).toBeNull();
    const visible = await visitor.from('news_articles').select('id').eq('id', id);
    expect(visible.data).toEqual([{ id }]);
  });
  it('los visitantes no pueden editar ni borrar artículos publicados', async () => {
    const id = ids[0]; expect(id).toBeTruthy();
    await visitor.from('news_articles').update({ title: 'Cambio no autorizado' }).eq('id', id);
    await visitor.from('news_articles').delete().eq('id', id);
    const unchanged = await admin.from('news_articles').select('title').eq('id', id).single();
    expect(unchanged.data?.title).toBe(article.title);
  });
});