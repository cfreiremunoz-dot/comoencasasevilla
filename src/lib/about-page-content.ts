import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const summaryIconSchema = z.enum(["heart", "map", "users", "bag"]);

export const aboutPageContentSchema = z.object({
  eyebrow: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
  missionTitle: z.string().trim().min(1).max(160),
  missionParagraphs: z.array(z.string().trim().min(1).max(3000)).min(1).max(8),
  summaryTitle: z.string().trim().min(1).max(120),
  summaryItems: z
    .array(z.object({ icon: summaryIconSchema, text: z.string().trim().min(1).max(300) }))
    .min(1)
    .max(12),
  valuesTitle: z.string().trim().min(1).max(160),
  values: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        text: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(8),
  projectTitle: z.string().trim().min(1).max(160),
  projectText: z.string().trim().min(1).max(1500),
  ctaTitle: z.string().trim().min(1).max(160),
  exploreLabel: z.string().trim().min(1).max(80),
  routesLabel: z.string().trim().min(1).max(80),
});

export type AboutPageContent = z.infer<typeof aboutPageContentSchema>;
export type AboutSummaryIcon = z.infer<typeof summaryIconSchema>;

export const ABOUT_PAGE_DEFAULTS: AboutPageContent = {
  eyebrow: "Sobre el proyecto",
  title: "ComoEnCasa",
  description:
    "Una plataforma de turismo local para descubrir Sevilla como la viven sus habitantes, dar visibilidad a los pequeños comercios y acercar visitantes y vecinos.",
  missionTitle: "Por qué existe este proyecto",
  missionParagraphs: [
    "Sevilla es una de las ciudades más visitadas de España, pero la mayoría de turistas recorre las mismas rutas: la Catedral, la Giralda, el Alcázar, la Plaza de España. Son lugares extraordinarios, pero dejan fuera la mayor parte de la ciudad —la que sus habitantes viven a diario.",
    "ComoEnCasa nace para cambiar ese enfoque. No queremos competir con las guías tradicionales: queremos complementarlas mostrando otra Sevilla. La de los barrios con identidad propia, la de los mercados de abastos donde se hace la compra, la de los pequeños comercios que mantienen viva la memoria de la ciudad, la de las plazas donde se toma el fresco en verano.",
    "Creemos que el turismo local no es solo una forma de viajar: es una forma de cuidar la ciudad. Cuando los visitantes se acercan a los barrios, consumen en los pequeños negocios y conocen las tradiciones, se genera una relación más justa entre quienes visitan y quienes habitan.",
  ],
  summaryTitle: "En pocas palabras",
  summaryItems: [
    { icon: "heart", text: "No es una agencia ni una web de reservas" },
    { icon: "map", text: "Es una guía editorial + una comunidad" },
    { icon: "users", text: "Conecta visitantes y habitantes" },
    { icon: "bag", text: "Da visibilidad al pequeño comercio" },
  ],
  valuesTitle: "Lo que nos diferencia",
  values: [
    {
      title: "Lejos del folclore facilón",
      text: "Mostramos tradiciones y costumbres con respeto, sin reducir la ciudad a tópicos. Sevilla es mucho más que flamenco y Semana Santa: es vida cotidiana.",
    },
    {
      title: "Pequeños negocios primero",
      text: "Priorizamos comercios de barrio, talleres artesanos y bares tradicionales sobre grandes cadenas. Ellos son los que dan carácter a la ciudad.",
    },
    {
      title: "Comunidad y editorial",
      text: "Combinamos la curaduría del equipo editorial con las recomendaciones de la comunidad. Las dos voces son necesarias y se complementan.",
    },
  ],
  projectTitle: "Un proyecto universitario",
  projectText:
    "Esta plataforma forma parte de un trabajo de segundo curso del Grado de Periodismo y Comunicación. Nace con la idea de mostrar la ciudad que viven sus habitantes: lugares, rutas y experiencias cotidianas lejos de las rutas masificadas, con la comunidad como protagonista.",
  ctaTitle: "Empieza a descubrir la otra Sevilla",
  exploreLabel: "Explorar lugares",
  routesLabel: "Ver rutas locales",
};

export function useAboutPageContent() {
  return useQuery({
    queryKey: ["site_pages", "sobre"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_pages")
        .select("content")
        .eq("slug", "sobre")
        .maybeSingle();
      if (error) throw error;
      const parsed = aboutPageContentSchema.safeParse(data?.content);
      return parsed.success ? parsed.data : ABOUT_PAGE_DEFAULTS;
    },
  });
}
