import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Newspaper, ArrowUpRight } from 'lucide-react';
import { newsDate, newsQueryOptions } from '@/lib/news';
import { newsGenres } from '@/lib/news-schema';

export const Route = createFileRoute('/noticias/')({
  head: () => ({ meta: [
    { title: 'Noticias de los barrios de Sevilla · ComoEnCasa' },
    { name: 'description', content: 'Noticias, crónicas y reportajes con mirada local sobre los barrios de Sevilla.' },
    { property: 'og:title', content: 'Noticias de los barrios de Sevilla · ComoEnCasa' },
    { property: 'og:description', content: 'Noticias, crónicas y reportajes con mirada local sobre los barrios de Sevilla.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(newsQueryOptions); },
  pendingComponent: () => <div className="container-page py-32">Cargando noticias…</div>,
  errorComponent: () => <div className="container-page py-32" role="alert">No se pudieron cargar las noticias. Vuelve a intentarlo.</div>,
  notFoundComponent: () => <div className="container-page py-32">No encontramos esta página.</div>,
  component: NewsPage,
});

function NewsPage() {
  const { data: articles } = useSuspenseQuery(newsQueryOptions);
  return <div className="container-page pb-24 pt-28 sm:pt-36">
    <header className="border-b-2 border-tinta-800 pb-8">
      <p className="mb-3 text-sm font-semibold uppercase text-terracota-700">ComoEnCasa · Periodismo local</p>
      <h1 className="font-serif text-5xl font-semibold sm:text-6xl">Noticias</h1>
      <p className="mt-4 text-lg text-tinta-600">La vida de los barrios de Sevilla, contada desde dentro.</p>
    </header>
    {!articles.length ? <div className="flex items-center gap-4 border-b border-border py-12 text-muted-foreground"><Newspaper className="h-8 w-8 shrink-0" /><p>No hay artículos publicados todavía.</p></div> :
      <div className="grid gap-x-8 gap-y-10 pt-8 md:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <article key={article.id} className="border-b border-border pb-6">
        <Link to="/noticias/$articleId" params={{ articleId: article.id }} className="group block">
          {article.photo && <img src={article.photo} alt={article.image_caption || article.title} className="mb-5 aspect-[3/2] w-full rounded-md object-cover" loading="lazy" />}
          <p className="text-xs font-semibold uppercase text-terracota-700">{newsGenres[article.genre as keyof typeof newsGenres]} · {article.neighborhood}</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug group-hover:text-terracota-700">{article.title}</h2>
          {article.summary && <p className="mt-3 text-tinta-600">{article.summary}</p>}
          <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{article.author_name} · {newsDate(article.published_at)}</span><ArrowUpRight className="h-4 w-4 shrink-0" /></div>
        </Link>
      </article>)}</div>}
  </div>;
}