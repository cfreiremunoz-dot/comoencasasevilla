import { useParams, Link, Navigate } from "@/lib/router-compat";
import { ArrowLeft, Clock, Check } from "lucide-react";
import { useExperiences } from "@/lib/editable-content";
import { getPlaceById } from "@/data/content";
import { DemoBadge } from "@/components/DemoBadge";
import { EditorialSources } from "@/components/EditorialSources";

const typeLabels: Record<string, string> = {
  gastronomica: "Gastronómica",
  cultural: "Cultural",
  cotidiana: "Cotidiana",
};

export function ExperienceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { items, isLoading } = useExperiences();
  const exp = items.find((e) => e.slug === slug);

  if (!exp && isLoading) return <div className="container-page pt-32">Cargando…</div>;
  if (!exp) return <Navigate to="/experiencias" replace />;

  return (
    <article className="animate-fade-in pt-16">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[380px] w-full overflow-hidden sm:h-[55vh]">
        <img src={exp.image} alt={exp.imageAlt} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-tinta-900/80 via-tinta-900/20 to-tinta-900/30" />
        <div className="absolute inset-0 container-page flex flex-col justify-end pb-10">
          <Link
            to="/experiencias"
            className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-crema-200 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Experiencias
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-terracota-500 px-3 py-1.5 text-xs font-semibold text-crema-100">
              {typeLabels[exp.type]}
            </span>
            {exp.isDemo && <DemoBadge />}
          </div>
          <p className="mt-3 text-sm font-medium uppercase tracking-wider text-crema-200/90">
            {exp.subtitle}
          </p>
          <h1 className="mt-1 max-w-3xl font-serif text-4xl font-semibold leading-tight text-white text-shadow-soft sm:text-5xl text-balance">
            {exp.title}
          </h1>
        </div>
      </div>

      {/* Contenido */}
      <div className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="flex items-center gap-2 text-sm text-tinta-600 border-b border-tinta-100 pb-6">
              <Clock className="h-4 w-4 text-terracota-500" />
              <span>{exp.duration}</span>
            </div>

            <div className="mt-8">
              <h2 className="font-serif text-2xl font-semibold text-tinta-800">De qué se trata</h2>
              <p className="mt-4 text-base leading-relaxed text-tinta-600">{exp.description}</p>
            </div>

            <div className="mt-10">
              <h2 className="font-serif text-2xl font-semibold text-tinta-800">Lo que la define</h2>
              <ul className="mt-4 space-y-3">
                {exp.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl bg-crema-200/50 p-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-oliva-100 text-oliva-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm leading-relaxed text-tinta-600">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
            {exp.locations && exp.locations.length > 0 && (
              <section className="mt-10" aria-labelledby="experience-locations-title">
                <h2
                  id="experience-locations-title"
                  className="font-serif text-2xl font-semibold text-tinta-800"
                >
                  Lugares para situar la experiencia
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tinta-600">
                  Son referencias concretas para organizar el recorrido, no una garantía de
                  apertura, acceso o disponibilidad. Comprueba las condiciones actuales antes de ir.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {exp.locations.map((location) => {
                    const place = getPlaceById(location.placeId);
                    if (!place) return null;

                    return (
                      <Link
                        key={location.placeId}
                        to={`/lugar/${place.slug}`}
                        className="group overflow-hidden rounded-2xl border border-tinta-100 bg-white transition-colors hover:border-terracota-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota-600"
                      >
                        <img
                          src={place.image}
                          alt={place.imageAlt}
                          loading="lazy"
                          className="h-40 w-full object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-serif text-lg font-semibold text-tinta-800 group-hover:text-terracota-700">
                            {place.name}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-tinta-600">
                            {place.excerpt}
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-tinta-500">
                            {location.note}
                          </p>
                          <span className="mt-3 inline-block text-xs font-semibold text-terracota-700">
                            Ver ficha del lugar
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
            <EditorialSources sources={exp.sources ?? []} />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <Link to="/experiencias" className="btn-secondary w-full justify-center">
              <ArrowLeft className="h-4 w-4" />
              Ver más experiencias
            </Link>
          </aside>
        </div>
      </div>
    </article>
  );
}
