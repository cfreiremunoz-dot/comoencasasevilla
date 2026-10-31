import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { categories, places, routes as staticRoutes, experiences as staticExperiences } from '@/data/content';
import type { Experience, Route, RouteStop, StopType } from '@/data/types';
import { STORAGE_PREFIX, slugify, useExperiences, useRoutes } from '@/lib/editable-content';
import { uploadPhoto } from '@/lib/recommendations';

const btn = 'rounded-full px-4 py-1.5 text-xs font-semibold';
const input = 'w-full rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm';
const stopTypes: [StopType, string][] = [
  ['barrio', 'Barrio'], ['mercado', 'Mercado'], ['gastronomia', 'Gastronomía'], ['comercio', 'Comercio'],
  ['cultural', 'Cultural'], ['naturaleza', 'Naturaleza'], ['encuentro', 'Lugar de encuentro'], ['historia', 'Historia'],
];
const sortedPlaces = [...places].sort((a, b) => a.name.localeCompare(b.name));

type Table = 'site_routes' | 'site_experiences';

function useSaver(table: Table) {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: [table] });
  return {
    async save(slug: string, data: object, hidden = false) {
      const { error } = await supabase.from(table).upsert({ slug, data: data as never, hidden, updated_at: new Date().toISOString() });
      if (error) throw error;
      refresh();
    },
    async setHidden(item: { slug: string; hidden?: boolean }, data: object) {
      const { error } = await supabase.from(table).upsert({ slug: item.slug, data: data as never, hidden: !item.hidden });
      if (error) return void toast.error('No se ha podido guardar');
      refresh();
    },
    async reset(slug: string) {
      const { error } = await supabase.from(table).delete().eq('slug', slug);
      if (error) return void toast.error('No se ha podido borrar');
      refresh();
    },
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-tinta-600">{label}</span>
      {children}
    </label>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const isStored = value.startsWith(STORAGE_PREFIX);
  return (
    <Field label="Foto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input className={input} placeholder="Enlace a una foto (https://…)" value={isStored ? '' : value} onChange={(e) => onChange(e.target.value)} />
        <span className="text-xs text-tinta-500">o</span>
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          className="text-xs"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            try {
              onChange(STORAGE_PREFIX + (await uploadPhoto(f)));
              toast.success('Foto subida');
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'No se ha podido subir');
            }
            setBusy(false);
          }}
        />
      </div>
      {isStored && <p className="text-xs text-oliva-700">Foto subida ✓</p>}
      {!isStored && value && <img src={value} alt="" className="mt-2 h-24 rounded-lg object-cover" />}
    </Field>
  );
}

const emptyRoute = (): Route => ({
  id: '', slug: '', title: '', subtitle: '', image: '', imageAlt: '', category: 'barrios', duration: '', distance: '',
  difficulty: 'facil', description: '', stops: [], isDemo: false,
});
const emptyExperience = (): Experience => ({
  id: '', slug: '', title: '', subtitle: '', image: '', imageAlt: '', type: 'cultural', duration: '', description: '', highlights: [], isDemo: false,
});

function RouteForm({ initial, onDone }: { initial: Route; onDone: () => void }) {
  const [r, setR] = useState<Route>(initial);
  const [saving, setSaving] = useState(false);
  const { save } = useSaver('site_routes');
  const set = <K extends keyof Route>(k: K, v: Route[K]) => setR((p) => ({ ...p, [k]: v }));
  const setStop = (i: number, patch: Partial<RouteStop>) => set('stops', r.stops.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!r.title.trim() || !r.description.trim()) return void toast.error('Pon al menos título y descripción');
    const slug = initial.slug || slugify(r.title);
    if (!initial.slug && staticRoutes.some((x) => x.slug === slug)) return void toast.error('Ya hay una ruta con ese título');
    setSaving(true);
    try {
      await save(slug, { ...r, slug, id: r.id || `r-${slug}`, stops: r.stops.map((s, i) => ({ ...s, order: i + 1 })) });
      toast.success('Ruta guardada');
      onDone();
    } catch {
      toast.error('No se ha podido guardar');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título"><input className={input} maxLength={120} value={r.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Subtítulo"><input className={input} maxLength={160} value={r.subtitle} onChange={(e) => set('subtitle', e.target.value)} /></Field>
        <Field label="Categoría">
          <select className={input} value={r.category} onChange={(e) => set('category', e.target.value as Route['category'])}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Dificultad">
          <select className={input} value={r.difficulty} onChange={(e) => set('difficulty', e.target.value as Route['difficulty'])}>
            <option value="facil">Fácil</option><option value="moderado">Moderado</option><option value="intenso">Intenso</option>
          </select>
        </Field>
        <Field label="Duración"><input className={input} placeholder="3-4 horas" value={r.duration} onChange={(e) => set('duration', e.target.value)} /></Field>
        <Field label="Distancia"><input className={input} placeholder="3,5 km" value={r.distance} onChange={(e) => set('distance', e.target.value)} /></Field>
        <Field label="Punto de salida"><input className={input} value={r.startPoint ?? ''} onChange={(e) => set('startPoint', e.target.value)} /></Field>
        <Field label="Punto de llegada"><input className={input} value={r.endPoint ?? ''} onChange={(e) => set('endPoint', e.target.value)} /></Field>
      </div>
      <ImageField value={r.image} onChange={(v) => set('image', v)} />
      <Field label="Descripción de la foto"><input className={input} value={r.imageAlt} onChange={(e) => set('imageAlt', e.target.value)} /></Field>
      <Field label="Descripción"><textarea className={input} rows={4} maxLength={3000} value={r.description} onChange={(e) => set('description', e.target.value)} /></Field>
      <Field label="Presupuesto (opcional)"><input className={input} value={r.budgetNote ?? ''} onChange={(e) => set('budgetNote', e.target.value)} /></Field>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-tinta-800">Paradas</p>
        {r.stops.map((s, i) => (
          <div key={i} className="space-y-2 rounded-xl bg-crema-100 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{i + 1}.</span>
              <select className={`${input} flex-1`} value={s.placeId} onChange={(e) => setStop(i, { placeId: e.target.value })}>
                {sortedPlaces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select className={`${input} w-auto`} value={s.stopType} onChange={(e) => setStop(i, { stopType: e.target.value as StopType })}>
                {stopTypes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button type="button" disabled={i === 0} onClick={() => { const st = [...r.stops]; [st[i - 1], st[i]] = [st[i]!, st[i - 1]!]; set('stops', st); }} className={`${btn} bg-white`}>↑</button>
              <button type="button" onClick={() => set('stops', r.stops.filter((_, j) => j !== i))} className={`${btn} bg-white text-terracota-700`}>Quitar</button>
            </div>
            <input className={input} placeholder="Qué hacer aquí" value={s.note} onChange={(e) => setStop(i, { note: e.target.value, whatToDo: e.target.value })} />
            <input className={input} placeholder="Qué tiene de especial (opcional)" value={s.whatSpecial ?? ''} onChange={(e) => setStop(i, { whatSpecial: e.target.value })} />
            <div className="flex gap-2">
              <input className={input} placeholder="Consejo (opcional)" value={s.tip ?? ''} onChange={(e) => setStop(i, { tip: e.target.value })} />
              <input className={`${input} w-32`} type="number" min={0} placeholder="Min. andando" value={s.walkMinutesFromPrevious ?? ''} onChange={(e) => setStop(i, { walkMinutesFromPrevious: Number(e.target.value) || 0 })} />
            </div>
          </div>
        ))}
        <button type="button" onClick={() => set('stops', [...r.stops, { order: r.stops.length + 1, placeId: sortedPlaces[0]!.id, stopType: 'barrio', note: '' }])} className={`${btn} bg-crema-200`}>+ Añadir parada</button>
        <p className="text-xs text-tinta-500">Las paradas usan los lugares que ya hay en la web, para poder mostrarlos en el mapa.</p>
      </div>

      <div className="flex gap-2">
        <button disabled={saving} className={`${btn} bg-terracota-500 text-white`}>{saving ? 'Guardando…' : 'Guardar ruta'}</button>
        <button type="button" onClick={onDone} className={`${btn} bg-crema-200`}>Cancelar</button>
      </div>
    </form>
  );
}

function ExperienceForm({ initial, onDone }: { initial: Experience; onDone: () => void }) {
  const [x, setX] = useState<Experience>(initial);
  const [highlights, setHighlights] = useState(initial.highlights.join('\n'));
  const [saving, setSaving] = useState(false);
  const { save } = useSaver('site_experiences');
  const set = <K extends keyof Experience>(k: K, v: Experience[K]) => setX((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!x.title.trim() || !x.description.trim()) return void toast.error('Pon al menos título y descripción');
    const slug = initial.slug || slugify(x.title);
    if (!initial.slug && staticExperiences.some((s) => s.slug === slug)) return void toast.error('Ya hay una experiencia con ese título');
    setSaving(true);
    try {
      await save(slug, { ...x, slug, id: x.id || `e-${slug}`, highlights: highlights.split('\n').map((h) => h.trim()).filter(Boolean) });
      toast.success('Experiencia guardada');
      onDone();
    } catch {
      toast.error('No se ha podido guardar');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título"><input className={input} maxLength={120} value={x.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Subtítulo"><input className={input} maxLength={160} value={x.subtitle} onChange={(e) => set('subtitle', e.target.value)} /></Field>
        <Field label="Tipo">
          <select className={input} value={x.type} onChange={(e) => set('type', e.target.value as Experience['type'])}>
            <option value="gastronomica">Gastronómica</option><option value="cultural">Cultural</option><option value="cotidiana">Cotidiana</option>
          </select>
        </Field>
        <Field label="Duración"><input className={input} placeholder="2 horas" value={x.duration} onChange={(e) => set('duration', e.target.value)} /></Field>
      </div>
      <ImageField value={x.image} onChange={(v) => set('image', v)} />
      <Field label="Descripción de la foto"><input className={input} value={x.imageAlt} onChange={(e) => set('imageAlt', e.target.value)} /></Field>
      <Field label="Descripción"><textarea className={input} rows={4} maxLength={3000} value={x.description} onChange={(e) => set('description', e.target.value)} /></Field>
      <Field label="Lo más destacado (uno por línea)"><textarea className={input} rows={3} value={highlights} onChange={(e) => setHighlights(e.target.value)} /></Field>
      <div className="flex gap-2">
        <button disabled={saving} className={`${btn} bg-terracota-500 text-white`}>{saving ? 'Guardando…' : 'Guardar experiencia'}</button>
        <button type="button" onClick={onDone} className={`${btn} bg-crema-200`}>Cancelar</button>
      </div>
    </form>
  );
}

function ItemList<T extends { slug: string; title: string; subtitle: string; hidden?: boolean; edited?: boolean }>({
  title, addLabel, items, isStatic, onEdit, onNew, table,
}: { title: string; addLabel: string; items: T[]; isStatic: (slug: string) => boolean; onEdit: (i: T) => void; onNew: () => void; table: Table }) {
  const { setHidden, reset } = useSaver(table);
  return (
    <section className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-crema-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-semibold text-tinta-800">{title}</h2>
        <button onClick={onNew} className={`${btn} bg-terracota-500 text-white`}>{addLabel}</button>
      </div>
      <ul className="mt-4 divide-y divide-crema-200">
        {items.map((i) => (
          <li key={i.slug} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div className={i.hidden ? 'opacity-50' : ''}>
              <p className="text-sm font-semibold text-tinta-800">{i.title}{i.hidden && ' · oculta'}</p>
              <p className="text-xs text-tinta-500">{i.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => onEdit(i)} className={`${btn} bg-crema-200`}>Editar</button>
              <button onClick={() => setHidden(i, i)} className={`${btn} bg-crema-200`}>{i.hidden ? 'Mostrar' : 'Ocultar'}</button>
              {isStatic(i.slug) && i.edited && (
                <button onClick={() => confirm('¿Volver a la versión original?') && reset(i.slug)} className={`${btn} bg-crema-200`}>Restaurar original</button>
              )}
              {!isStatic(i.slug) && (
                <button onClick={() => confirm(`¿Borrar "${i.title}"?`) && reset(i.slug)} className={`${btn} bg-crema-200 text-terracota-700`}>Borrar</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ContentEditor() {
  const routes = useRoutes({ includeHidden: true, raw: true });
  const experiences = useExperiences({ includeHidden: true, raw: true });
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);

  if (editingRoute)
    return (
      <section className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-crema-300">
        <h2 className="mb-4 font-serif text-2xl font-semibold">{editingRoute.slug ? `Editar ruta: ${editingRoute.title}` : 'Nueva ruta'}</h2>
        <RouteForm initial={editingRoute} onDone={() => setEditingRoute(null)} />
      </section>
    );
  if (editingExp)
    return (
      <section className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-crema-300">
        <h2 className="mb-4 font-serif text-2xl font-semibold">{editingExp.slug ? `Editar experiencia: ${editingExp.title}` : 'Nueva experiencia'}</h2>
        <ExperienceForm initial={editingExp} onDone={() => setEditingExp(null)} />
      </section>
    );

  return (
    <>
      <ItemList title="Rutas" addLabel="+ Nueva ruta" table="site_routes" items={routes.items}
        isStatic={(s) => staticRoutes.some((r) => r.slug === s)}
        onEdit={(r) => setEditingRoute(r)} onNew={() => setEditingRoute(emptyRoute())} />
      <ItemList title="Experiencias" addLabel="+ Nueva experiencia" table="site_experiences" items={experiences.items}
        isStatic={(s) => staticExperiences.some((e) => e.slug === s)}
        onEdit={(e) => setEditingExp(e)} onNew={() => setEditingExp(emptyExperience())} />
    </>
  );
}
