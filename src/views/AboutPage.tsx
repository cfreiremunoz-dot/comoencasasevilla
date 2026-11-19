import { Link } from '@/lib/router-compat';
import { PageHeader } from '@/components/PageHeader';
import { ArrowRight, Heart, Users, MapPin, ShoppingBag, Sparkles } from 'lucide-react';
import { ABOUT_PAGE_DEFAULTS, useAboutPageContent } from '@/lib/about-page-content';

const summaryIcons = { heart: Heart, map: MapPin, users: Users, bag: ShoppingBag };

export function AboutPage() {
  const { data: content = ABOUT_PAGE_DEFAULTS } = useAboutPageContent();

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
      />

      <div className="container-page pb-20">
        {/* Propuesta */}
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl font-semibold text-tinta-800 sm:text-3xl">
              {content.missionTitle}
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-tinta-600">
              {content.missionParagraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph}`}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="card-surface p-6 self-start">
            <h3 className="font-serif text-base font-semibold text-tinta-800">
              {content.summaryTitle}
            </h3>
            <ul className="mt-4 space-y-3">
              {content.summaryItems.map((item, index) => {
                const Icon = summaryIcons[item.icon];
                return (
                  <li key={`${item.icon}-${index}`} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terracota-50 text-terracota-500">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-relaxed text-tinta-600">{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Valores */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl font-semibold text-tinta-800 sm:text-3xl">
            {content.valuesTitle}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {content.values.map((item) => (
              <div key={item.title} className="card-surface p-6">
                <h3 className="font-serif text-lg font-semibold text-tinta-800">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-tinta-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contexto académico */}
        <div className="mt-16 card-surface p-6 sm:p-8 bg-oliva-50/40 ring-oliva-200/50">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-oliva-100 text-oliva-600">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-serif text-xl font-semibold text-tinta-800">
                {content.projectTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-tinta-600">
                {content.projectText}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="font-serif text-2xl font-semibold text-tinta-800 sm:text-3xl text-balance">
            {content.ctaTitle}
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/explora" className="btn-primary">
              {content.exploreLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/rutas" className="btn-secondary">
              {content.routesLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
