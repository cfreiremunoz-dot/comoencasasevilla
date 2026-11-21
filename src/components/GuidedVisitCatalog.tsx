import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Clock3, MapPin, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/lib/router-compat";
import { publicApiRequest } from "@/lib/guide-api";
import type { PublicGuidedVisit } from "@/lib/guide-types";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getSampleVisits = (): PublicGuidedVisit[] => {
  const futureDate = (daysAhead: number, hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };

  return [
    {
      id: "sample-triana",
      slug: "muestra-triana-ceramica",
      title: "Triana a fuego lento: cerámica y mercado",
      summary: "Talleres artesanos, historias alfareras y un tentempié junto al mercado.",
      description:
        "Un paseo tranquilo por el barrio de Triana para descubrir sus talleres de cerámica, el mercado y las historias del Guadalquivir. La visita termina con recomendaciones locales para seguir explorando por tu cuenta.",
      category: "Barrios y oficios",
      neighborhood: "Triana",
      meetingPoint: "Puente de Triana",
      durationMinutes: 150,
      pricePerPersonCents: 3200,
      imageUrl: null,
      guide: {
        displayName: "Lucía Romero",
        bio: "Ceramista y trianera. Me encanta enseñar el barrio a través de sus oficios y sabores.",
      },
      slots: [
        {
          id: "sample-slot-triana",
          startsAt: futureDate(2, 10),
          capacity: 8,
          available: 5,
        },
      ],
    },
    {
      id: "sample-patios",
      slug: "muestra-patios-santa-cruz",
      title: "Patios secretos y leyendas de Santa Cruz",
      summary: "Puertas entreabiertas, plazas escondidas y relatos del antiguo barrio judío.",
      description:
        "Recorre los callejones de Santa Cruz a primera hora, conoce la historia de sus patios y escucha leyendas sevillanas en pequeñas plazas lejos del bullicio.",
      category: "Historia y leyendas",
      neighborhood: "Santa Cruz",
      meetingPoint: "Plaza del Triunfo",
      durationMinutes: 90,
      pricePerPersonCents: 2400,
      imageUrl: null,
      guide: {
        displayName: "Mateo Jiménez",
        bio: "Historiador local, apasionado por las leyendas y la arquitectura de Sevilla.",
      },
      slots: [
        {
          id: "sample-slot-patios",
          startsAt: futureDate(1, 18),
          capacity: 8,
          available: 4,
        },
      ],
    },
    {
      id: "sample-mujeres",
      slug: "muestra-sevilla-mujeres",
      title: "La Sevilla de las mujeres que hicieron historia",
      summary: "Un paseo por el centro siguiendo las huellas de sevillanas extraordinarias.",
      description:
        "Conoce las historias de escritoras, artistas y vecinas que dejaron su marca en la ciudad. Una ruta a pie por el centro con paradas para conversar y mirar Sevilla desde otra perspectiva.",
      category: "Cultura e historias",
      neighborhood: "Centro histórico",
      meetingPoint: "Plaza Nueva",
      durationMinutes: 120,
      pricePerPersonCents: 2800,
      imageUrl: null,
      guide: {
        displayName: "Inés Valdés",
        bio: "Guía cultural. Me gusta contar la historia de Sevilla desde las vidas cotidianas.",
      },
      slots: [
        {
          id: "sample-slot-mujeres",
          startsAt: futureDate(3, 11),
          capacity: 10,
          available: 7,
        },
      ],
    },
  ];
};

export function GuidedVisitCatalog({
  showExamplesWhenEmpty = false,
  compact = false,
}: {
  showExamplesWhenEmpty?: boolean;
  compact?: boolean;
} = {}) {
  const [expandedSample, setExpandedSample] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["guided-visits"],
    queryFn: () => publicApiRequest<{ visits: PublicGuidedVisit[] }>("/api/visits"),
  });

  const visits = query.data?.visits ?? [];
  const showingSamples =
    showExamplesWhenEmpty && !query.isPending && !query.isError && visits.length === 0;
  const displayVisits = showingSamples ? getSampleVisits() : visits;

  return (
    <section
      className={compact ? "min-w-0" : "container-page pb-16 sm:pb-20"}
      aria-labelledby={compact ? "guia-visitas-title" : "visitas-locales-title"}
    >
      <div
        className={`mb-6 flex flex-col gap-3 ${compact ? "" : "sm:mb-10 sm:flex-row sm:items-end sm:justify-between"}`}
      >
        <div className={compact ? "" : "max-w-2xl"}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracota-600">
            {showingSamples ? "Catálogo de muestra" : "Hechas por gente de aquí"}
          </p>
          <h2
            id={compact ? "guia-visitas-title" : "visitas-locales-title"}
            className={`mt-2 font-serif font-semibold tracking-tight text-tinta-800 ${compact ? "text-2xl" : "text-3xl sm:text-4xl"}`}
          >
            Visitas con sabor local
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-tinta-500 sm:text-base">
            {showingSamples
              ? "Así podría verse una visita creada por un guía local. Los ejemplos no están publicados ni admiten reservas."
              : "Paseos en grupos pequeños, creados y guiados por personas que conocen Sevilla de verdad."}
          </p>
        </div>
        {!compact && (
          <Link
            to="/guia"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-terracota-200 px-5 py-2.5 text-sm font-semibold text-terracota-700 transition-colors hover:bg-terracota-50"
          >
            Soy guía <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </div>

      {query.isLoading ? (
        <div
          className={`grid gap-5 ${compact ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}
          aria-label="Cargando visitas"
        >
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <p role="status" className="card-surface p-6 text-sm text-tinta-600">
          No pudimos cargar las visitas ahora. Vuelve a intentarlo en unos minutos.
        </p>
      ) : displayVisits.length === 0 ? (
        <div className="card-surface flex flex-col items-start gap-3 p-6 sm:p-8">
          <p className="font-serif text-xl font-semibold text-tinta-800">
            Pronto habrá nuevos paseos
          </p>
          <p className="max-w-xl text-sm leading-6 text-tinta-500">
            Estamos preparando experiencias con guías locales. Si conoces Sevilla como la palma de
            tu mano, puedes publicar la primera.
          </p>
          <Link
            to="/guia"
            className="mt-1 rounded-full bg-terracota-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terracota-700"
          >
            Publica una visita
          </Link>
        </div>
      ) : (
        <div className={`grid gap-5 ${compact ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {displayVisits.map((visit) => {
            const nextSlot = visit.slots[0];
            const isSample = visit.id.startsWith("sample-");
            const cardContent = (
              <>
                {visit.imageUrl ? (
                  <div className="aspect-[16/10] overflow-hidden bg-crema-200">
                    <img
                      src={visit.imageUrl}
                      alt={`Vista de ${visit.title}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-between gap-3 bg-gradient-to-br from-oliva-100 via-crema-100 to-albero-100 ${isSample ? "min-h-16 px-5 py-3" : "aspect-[16/10] items-end p-5"}`}
                  >
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-oliva-800">
                      {visit.category}
                    </span>
                    {isSample && (
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-tinta-600">
                        Ejemplo
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-terracota-600">
                    {visit.neighborhood}
                  </p>
                  <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-tinta-800 group-hover:text-terracota-700">
                    {visit.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-tinta-500">
                    {visit.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-tinta-500">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin aria-hidden="true" className="size-3.5" />
                      {visit.guide.displayName}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 aria-hidden="true" className="size-3.5" />
                      {visit.durationMinutes} min
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users aria-hidden="true" className="size-3.5" />
                      {nextSlot ? `${nextSlot.available} plazas` : "Sin plazas disponibles"}
                    </span>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-tinta-100 pt-4">
                    <div>
                      <p className="text-xs text-tinta-400">Desde</p>
                      <p className="font-semibold text-tinta-800">
                        {formatPrice(visit.pricePerPersonCents)}{" "}
                        <span className="text-xs font-normal text-tinta-500">/ persona</span>
                      </p>
                      <p className="mt-1 text-xs text-tinta-400">
                        {nextSlot
                          ? `Próxima: ${formatDate(nextSlot.startsAt)}`
                          : "Sin próxima fecha"}
                      </p>
                    </div>
                    {isSample ? (
                      <button
                        type="button"
                        aria-expanded={expandedSample === visit.id}
                        aria-controls={`detalle-${visit.id}`}
                        onClick={() =>
                          setExpandedSample(expandedSample === visit.id ? null : visit.id)
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-terracota-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-terracota-700"
                      >
                        {expandedSample === visit.id ? "Ocultar" : "Ver visita"}
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </button>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-terracota-600 px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-terracota-700">
                        Ver / reservar
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </span>
                    )}
                  </div>
                  {isSample && expandedSample === visit.id && (
                    <div
                      id={`detalle-${visit.id}`}
                      className="mt-4 border-t border-tinta-100 pt-4 text-sm leading-6 text-tinta-600"
                    >
                      <p>{visit.description}</p>
                      <p className="mt-3 rounded-xl bg-albero-100 p-3 text-xs leading-5 text-tinta-600">
                        Visita de ejemplo: no está publicada y todavía no admite reservas.
                      </p>
                    </div>
                  )}
                </div>
              </>
            );

            return isSample ? (
              <article
                key={visit.id}
                className="card-surface group flex h-full flex-col overflow-hidden"
              >
                {cardContent}
              </article>
            ) : (
              <Link
                key={visit.id}
                to={`/visitas/${visit.slug}`}
                className="group card-surface flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-tinta-900/5"
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
