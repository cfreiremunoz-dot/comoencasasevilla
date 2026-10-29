import { useState } from 'react';
import { PenLine, X } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { RecommendationCard } from '@/components/RecommendationCard';
import { RecommendationForm } from '@/components/RecommendationForm';
import { supabase } from '@/integrations/supabase/client';
import { POST_TYPES, useRecommendations } from '@/lib/recommendations';

export function CommunityPage() {
  const { data, isLoading } = useRecommendations('approved');
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [filter, setFilter] = useState<string>('todas');
  const list = (data ?? []).filter((p) => filter === 'todas' || p.post_type === filter);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Espacio participativo"
        title="Comunidad"
        description="Sevillanos y visitantes comparten sus reseñas, sus rutas y sus lugares favoritos."
      />
      <div className="container-page pb-20">
        <div className="mb-10 card-surface p-6">
          {sent ? (
            <div>
              <p className="text-tinta-700">¡Gracias por compartir! Lo revisaremos y aparecerá pronto aquí.</p>
              <button onClick={() => { setSent(false); setOpen(true); }} className="mt-3 text-sm font-semibold text-terracota-600">Compartir otra cosa</button>
            </div>
          ) : open ? (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold text-tinta-800">Comparte con la comunidad</h2>
                <button onClick={() => setOpen(false)} aria-label="Cerrar"><X className="h-5 w-5 text-tinta-500" /></button>
              </div>
              <RecommendationForm
                submitLabel="Publicar"
                onSubmit={async (values) => {
                  const { error } = await supabase.from('recommendations').insert({ ...values, status: 'pending' });
                  if (error) throw error;
                  setOpen(false);
                  setSent(true);
                }}
              />
            </>
          ) : (
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold text-tinta-800">¿Tienes algo que contar?</h2>
                <p className="mt-1 text-sm text-tinta-500">Escribe una reseña, comparte una ruta o tu lugar favorito de Sevilla.</p>
              </div>
              <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-terracota-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracota-600">
                <PenLine className="h-4 w-4" /> Compartir
              </button>
            </div>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[{ id: 'todas', label: 'Todo' }, ...POST_TYPES].map((t) => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === t.id ? 'bg-terracota-500 text-white' : 'bg-crema-200 text-tinta-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-tinta-500">Cargando…</p>
        ) : list.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => <RecommendationCard key={r.id} r={r} />)}
          </div>
        ) : (
          <p className="text-tinta-500">Todavía no hay publicaciones aquí. ¡Sé la primera persona en compartir!</p>
        )}
      </div>
    </div>
  );
}
