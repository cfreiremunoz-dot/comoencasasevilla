import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Send, Pencil, EyeOff, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { uploadPhoto } from '@/lib/recommendations';
import { newsGenres, newsSchema, type NewsInput } from '@/lib/news-schema';

type Article = Database['public']['Tables']['news_articles']['Row'];
const empty: NewsInput = { title: '', genre: 'noticia', neighborhood: '', summary: '', body: '', author_name: '', image_path: null, image_caption: '', sources: '' };
const fieldClass = 'mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground';

export function NewsEditor() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['news', 'admin'], queryFn: async () => {
    const { data, error } = await supabase.from('news_articles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } });
  const [editing, setEditing] = useState<Article | 'new' | null>(null);
  const [values, setValues] = useState<NewsInput>(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ['news'] });
  const edit = (article: Article | 'new') => { setEditing(article); setValues(article === 'new' ? { ...empty } : newsSchema.parse(article)); };
  const set = <K extends keyof NewsInput>(key: K, value: NewsInput[K]) => setValues((previous) => ({ ...previous, [key]: value }));
  async function save(published: boolean) {
    const parsed = newsSchema.safeParse(values);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? 'Revisa el artículo'); return; }
    setBusy(true);
    const now = new Date().toISOString();
    const row = { ...parsed.data, published, published_at: published ? (editing && editing !== 'new' ? editing.published_at ?? now : now) : null, updated_at: now };
    const result = editing === 'new' ? await supabase.from('news_articles').insert(row) : editing ? await supabase.from('news_articles').update(row).eq('id', editing.id) : null;
    setBusy(false);
    if (result?.error) { toast.error('No se pudo guardar el artículo'); return; }
    toast.success(published ? 'Artículo publicado' : 'Borrador guardado');
    setEditing(null); await refresh();
  }
  async function hide(article: Article) {
    const { error } = await supabase.from('news_articles').update({ published: false, updated_at: new Date().toISOString() }).eq('id', article.id);
    if (error) toast.error('No se pudo retirar'); else { toast.success('Artículo retirado'); await refresh(); }
  }
  async function remove(article: Article) {
    if (!confirm(`¿Borrar «${article.title}»?`)) return;
    const { error } = await supabase.from('news_articles').delete().eq('id', article.id);
    if (error) toast.error('No se pudo borrar'); else await refresh();
  }
  return <section className="mt-12 border-t border-border pt-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Noticias</h2>
      {!editing && <Button onClick={() => edit('new')}><Plus />Nuevo artículo</Button>}
    </div>
    {editing ? <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); void save(false); }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold sm:col-span-2">Titular<input className={fieldClass} value={values.title} onChange={(e) => set('title', e.target.value)} maxLength={200} required /></label>
        <label className="text-sm font-semibold">Género<select className={fieldClass} value={values.genre} onChange={(e) => set('genre', e.target.value as NewsInput['genre'])}>{Object.entries(newsGenres).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label className="text-sm font-semibold">Barrio<input className={fieldClass} value={values.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} maxLength={120} required /></label>
        <label className="text-sm font-semibold sm:col-span-2">Entradilla<textarea className={fieldClass} rows={2} value={values.summary} onChange={(e) => set('summary', e.target.value)} maxLength={500} /></label>
        <label className="text-sm font-semibold sm:col-span-2">Artículo<textarea className={fieldClass} rows={14} value={values.body} onChange={(e) => set('body', e.target.value)} maxLength={50000} required /></label>
        <label className="text-sm font-semibold">Firma<input className={fieldClass} value={values.author_name} onChange={(e) => set('author_name', e.target.value)} maxLength={120} required /></label>
        <label className="text-sm font-semibold">Foto<input type="file" accept="image/*" disabled={uploading} className={fieldClass} onChange={async (event) => {
          const file = event.target.files?.[0]; if (!file) return;
          setUploading(true); try { set('image_path', await uploadPhoto(file)); toast.success('Foto subida'); } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo subir'); } finally { setUploading(false); }
        }} />{values.image_path && <span className="font-normal text-oliva-700">Foto adjunta <Button type="button" variant="ghost" size="sm" onClick={() => set('image_path', null)}>Quitar</Button></span>}</label>
        <label className="text-sm font-semibold sm:col-span-2">Pie de foto y crédito<input className={fieldClass} value={values.image_caption} onChange={(e) => set('image_caption', e.target.value)} maxLength={300} /></label>
        <label className="text-sm font-semibold sm:col-span-2">Fuentes<textarea className={fieldClass} rows={3} value={values.sources} onChange={(e) => set('sources', e.target.value)} maxLength={5000} /></label>
      </div>
      <div className="flex flex-wrap gap-2"><Button type="submit" variant="outline" disabled={busy || uploading}><Save />Guardar borrador</Button><Button type="button" disabled={busy || uploading} onClick={() => save(true)}><Send />Publicar artículo</Button><Button type="button" variant="ghost" onClick={() => setEditing(null)}><X />Cancelar</Button></div>
    </form> : <div className="mt-5">
      {q.isError && <p role="alert">No se pudieron cargar los artículos.</p>}
      {q.data?.length === 0 && <p className="text-muted-foreground">No hay artículos todavía.</p>}
      <ul className="divide-y divide-border">{q.data?.map((article) => <li key={article.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div><h3 className="font-semibold">{article.title}</h3><p className="text-sm text-muted-foreground">{article.neighborhood} · {newsGenres[article.genre as keyof typeof newsGenres]} · {article.published ? 'Publicado' : 'Borrador'}</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => edit(article)}><Pencil />Editar</Button>{article.published && <Button variant="outline" size="sm" onClick={() => hide(article)}><EyeOff />Retirar</Button>}<Button variant="ghost" size="icon" aria-label={`Borrar ${article.title}`} title="Borrar artículo" onClick={() => remove(article)}><Trash2 /></Button></div>
      </li>)}</ul>
    </div>}
  </section>;
}