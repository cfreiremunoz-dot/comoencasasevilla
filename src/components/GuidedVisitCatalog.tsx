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

export function GuidedVisitCatalog() {
  const query = useQuery({
    queryKey: ["guided-visits"],
    queryFn: () => publicApiRequest<{ visits: PublicGuidedVisit[] }>("/api/visits"),
  });

  const visits = query.data?.visits ?? [];

  return (
    <section className="container-page pb-16 sm:pb-20" aria-labelledby="visitas-locales-title">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracota-600">
            Hechas por gente de aquí
          </p>
          <h2
            id="visitas-locales-title"
            className="mt-2 font-serif text-3xl font-semibold tracking-tight text-tinta-800 sm:text-4xl"
          >
            Visitas con sabor local
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-tinta-500 sm:text-base">
            Paseos en grupos pequeños, creados y guiados por personas que conocen Sevilla de verdad.
          </p>
        </div>
        <Link
          to="/guia"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-terracota-200 px-5 py-2.5 text-sm font-semibold text-terracota-700 transition-colors hover:bg-terracota-50"
        >
          Soy guía <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {query.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando visitas">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <p role="status" className="card-surface p-6 text-sm text-tinta-600">
          No pudimos cargar las visitas ahora. Vuelve a intentarlo en unos minutos.
        </p>
      ) : visits.length === 0 ? (
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visits.map((visit) => {
            const nextSlot = visit.slots[0];
            return (
              <Link
                key={visit.id}
                to={`/visitas/${visit.slug}`}
                className="group card-surface flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-tinta-900/5"
              >
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
                  <div className="flex aspect-[16/10] items-end bg-gradient-to-br from-oliva-100 via-crema-100 to-albero-100 p-5">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-oliva-800">
                      {visit.category}
                    </span>
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
                    {nextSlot && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users aria-hidden="true" className="size-3.5" />
                        {nextSlot.available} plazas
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-tinta-100 pt-4 mt-5">
                    <div>
                      <p className="text-xs text-tinta-400">Desde</p>
                      <p className="font-semibold text-tinta-800">
                        {formatPrice(visit.pricePerPersonCents)}{" "}
                        <span className="text-xs font-normal text-tinta-500">/ persona</span>
                      </p>
                      {nextSlot && (
                        <p className="mt-1 text-xs text-tinta-400">
                          Próxima: {formatDate(nextSlot.startsAt)}
                        </p>
                      )}
                    </div>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-5 shrink-0 text-terracota-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
