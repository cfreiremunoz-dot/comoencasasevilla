import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { newsDate, newsQueryOptions } from '@/lib/news';
import { newsGenres } from '@/lib/news-schema';

export const Route = createFileRoute('/noticias/$articleId')({
  loader: async ({ context, params }) => {
    const articles = await context.queryClient.ensureQueryData(newsQueryOptions);
    const article = articles.find((item) => item.id === params.articleId);
    if (!article) throw notFound();
    return { title: article.title, summary: article.summary };
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? 'Artículo'} · Noticias ComoEnCasa` },
    { name: 'description', content: loaderData?.summary || 'Periodismo local sobre los barrios de Sevilla en ComoEnCasa.' },
    { property: 'og:title', content: `${loaderData?.title ?? 'Artículo'} · Noticias ComoEnCasa` },
    { property: 'og:description', content: loaderData?.summary || 'Periodismo local sobre los barrios de Sevilla en ComoEnCasa.' },
    { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  pendingComponent: () => <div className="container-page py-32">Cargando artículo…</div>,
  errorComponent: () => <div className="container-page py-32" role="alert">No se pudo cargar el artículo.</div>,
  notFoundComponent: () => <div className="container-page py-32"><h1 className="text-3xl">Artículo no disponible</h1><Link to="/noticias" className="mt-4 inline-block text-primary">Volver a Noticias</Link></div>,
  component: ArticlePage,
});

function ArticlePage() {
  const { articleId } = Route.useParams();
  const { data } = useSuspenseQuery(newsQueryOptions);
  const article = data.find((item) => item.id === articleId);
  if (!article) return <div className="container-page py-32">Artículo no disponible.</div>;
  return <article className="container-page pb-24 pt-28 sm:pt-36">
    <div className="mx-auto max-w-3xl">
      <Link to="/noticias" className="mb-8 inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft className="h-4 w-4" />Noticias</Link>
      <p className="text-sm font-semibold uppercase text-terracota-700">{newsGenres[article.genre as keyof typeof newsGenres]} · {article.neighborhood}</p>
      <h1 className="mt-4 break-words font-serif text-4xl font-semibold leading-tight sm:text-5xl">{article.title}</h1>
      {article.summary && <p className="mt-6 text-xl leading-relaxed text-tinta-600">{article.summary}</p>}
      <p className="mt-6 border-y border-border py-4 text-sm text-muted-foreground">Por <span className="font-semibold text-foreground">{article.author_name}</span> · {newsDate(article.published_at)}</p>
      {article.photo && <figure className="mt-8"><img src={article.photo} alt={article.image_caption || article.title} className="max-h-[600px] w-full object-contain" />{article.image_caption && <figcaption className="mt-2 text-sm text-muted-foreground">{article.image_caption}</figcaption>}</figure>}
      <div className="mt-8 space-y-6 break-words text-lg leading-relaxed">{article.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index} className="whitespace-pre-wrap">{paragraph}</p>)}</div>
      {article.sources && <aside className="mt-12 border-t border-border pt-6"><h2 className="text-xl font-semibold">Fuentes</h2><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{article.sources}</p></aside>}
    </div>
  </article>;
}