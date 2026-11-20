import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { streamText } from "ai";
import { helpArticles } from "@/data/help";
import { places, routes, experiences, categories, zones } from "@/data/content";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(4000) }))
    .min(1)
    .max(40),
});

function buildInstructions() {
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? id;
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;
  const placeList = places
    .map(
      (p) =>
        `- ${p.name} (${catName(p.category)}, ${zoneName(p.zone)}): ${p.excerpt} → /lugar/${p.slug}`,
    )
    .join("\n");
  const routeList = routes
    .map((r) => `- ${r.title} (${r.duration}, ${r.distance}): ${r.subtitle} → /rutas/${r.slug}`)
    .join("\n");
  const expList = experiences
    .map((e) => `- ${e.title}: ${e.subtitle} → /experiencias/${e.slug}`)
    .join("\n");
  return `Eres Azahar, el asistente de ComoEnCasa, una web de turismo local en Sevilla que muestra barrios con alma, pequeños comercios y rincones auténticos.
Responde en el idioma del usuario (por defecto español), con tono cercano, breve y práctico. Usa markdown sencillo.
Recomienda primero lugares, rutas y experiencias de ComoEnCasa cuando encajen, enlazándolos con su ruta relativa (por ejemplo [Nombre](/lugar/slug)).
Secciones de la web: Explora (/explora), Rutas (/rutas), Experiencias (/experiencias), Comunidad (/comunidad, donde la gente comparte reseñas, rutas y lugares favoritos), Sobre el proyecto (/sobre).
No inventes horarios, precios ni teléfonos; si no los sabes, dilo y sugiere confirmarlo con el sitio.

También eres el soporte de la web. Para dudas sobre cómo funciona ComoEnCasa usa SOLO la documentación de ayuda de abajo.
Si la pregunta es de soporte y no está cubierta por la documentación, si el usuario tiene un problema que no puedes resolver, si pide hablar con una persona, o si no estás seguro de la respuesta: no inventes. Di brevemente que vas a pasar la conversación a una persona del equipo y termina tu mensaje EXACTAMENTE con la marca [[PERSONA]] en una línea aparte.

Documentación de ayuda:
${helpArticles.map((a) => `### ${a.title}\n${a.body}`).join("\n\n")}

Lugares:
${placeList}

Rutas:
${routeList}

Experiencias:
${expList}`;
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) return undefined;
  return typeof error.statusCode === "number" ? error.statusCode : undefined;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Petición no válida", { status: 400 });

        let streamFailed = false;
        let failureStatus: number | undefined;
        const result = streamText({
          model: "openai/gpt-6-astra",
          system: buildInstructions(),
          messages: parsed.data.messages.map((message) => ({
            role: message.role,
            content: message.text,
          })),
          abortSignal: request.signal,
          onError: ({ error }) => {
            streamFailed = true;
            failureStatus = getErrorStatus(error);
            console.error(
              "[azahar] response stream failed",
              error instanceof Error ? error.name : "unknown error",
              failureStatus,
            );
          },
        });
        const encoder = new TextEncoder();
        const body = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              for await (const text of result.textStream) {
                controller.enqueue(encoder.encode(text));
              }
            } catch (error) {
              if (!request.signal.aborted) {
                streamFailed = true;
                failureStatus = getErrorStatus(error);
                console.error(
                  "[azahar] response stream failed",
                  error instanceof Error ? error.name : "unknown error",
                  failureStatus,
                );
              }
            }
            if (streamFailed && !request.signal.aborted) {
              const message =
                failureStatus === 403
                  ? "\n\n_Azahar está temporalmente fuera de servicio. El responsable debe completar la verificación de la cuenta y añadir un método de pago en Vercel AI Gateway para reactivarlo._"
                  : "\n\n_Azahar no ha podido responder. Inténtalo de nuevo en unos minutos._";
              controller.enqueue(encoder.encode(message));
            }
            controller.close();
          },
        });
        return new Response(body, {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        });
      },
    },
  },
});
