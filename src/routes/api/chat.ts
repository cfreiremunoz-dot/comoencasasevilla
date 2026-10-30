import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { GatewayError, streamResponse } from '@lovable.dev/ai-gateway';
import { helpArticles } from '@/data/help';
import { places, routes, experiences, categories, zones } from '@/data/content';

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(4000) }))
    .min(1)
    .max(40),
});

function buildInstructions() {
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? id;
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;
  const placeList = places.map((p) => `- ${p.name} (${catName(p.category)}, ${zoneName(p.zone)}): ${p.excerpt} → /lugar/${p.slug}`).join('\n');
  const routeList = routes.map((r) => `- ${r.title} (${r.duration}, ${r.distance}): ${r.subtitle} → /rutas/${r.slug}`).join('\n');
  const expList = experiences.map((e) => `- ${e.title}: ${e.subtitle} → /experiencias/${e.slug}`).join('\n');
  return `Eres Azahar, el asistente de ComoEnCasa, una web de turismo local en Sevilla que muestra barrios con alma, pequeños comercios y rincones auténticos.
Responde en el idioma del usuario (por defecto español), con tono cercano, breve y práctico. Usa markdown sencillo.
Recomienda primero lugares, rutas y experiencias de ComoEnCasa cuando encajen, enlazándolos con su ruta relativa (por ejemplo [Nombre](/lugar/slug)).
Secciones de la web: Explora (/explora), Rutas (/rutas), Experiencias (/experiencias), Comunidad (/comunidad, donde la gente comparte reseñas, rutas y lugares favoritos), Sobre el proyecto (/sobre).
No inventes horarios, precios ni teléfonos; si no los sabes, dilo y sugiere confirmarlo con el sitio.

También eres el soporte de la web. Para dudas sobre cómo funciona ComoEnCasa usa SOLO la documentación de ayuda de abajo.
Si la pregunta es de soporte y no está cubierta por la documentación, si el usuario tiene un problema que no puedes resolver, si pide hablar con una persona, o si no estás seguro de la respuesta: no inventes. Di brevemente que vas a pasar la conversación a una persona del equipo y termina tu mensaje EXACTAMENTE con la marca [[PERSONA]] en una línea aparte.

Documentación de ayuda:
${helpArticles.map((a) => `### ${a.title}\n${a.body}`).join('\n\n')}

Lugares:
${placeList}

Rutas:
${routeList}

Experiencias:
${expList}`;
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response('Petición no válida', { status: 400 });

        try {
          const stream = await streamResponse(
            {
              model: 'openai/gpt-6-astra',
              instructions: buildInstructions(),
              input: parsed.data.messages.map((m) => ({ role: m.role, content: m.text })),
            },
            { signal: request.signal },
          );
          const encoder = new TextEncoder();
          const body = new ReadableStream<Uint8Array>({
            async start(controller) {
              try {
                for await (const event of stream) {
                  if (event.type === 'response.output_text.delta') controller.enqueue(encoder.encode(event.delta));
                }
              } catch (err) {
                console.error('chat stream error', err instanceof GatewayError ? err.code : err);
                controller.enqueue(encoder.encode('\n\n_Lo siento, se ha cortado la respuesta. Inténtalo de nuevo._'));
              }
              controller.close();
            },
          });
          return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
        } catch (err) {
          console.error('chat error', err instanceof GatewayError ? err.code : err);
          const status = err instanceof GatewayError && err.httpStatus === 429 ? 429 : err instanceof GatewayError && err.httpStatus === 402 ? 402 : 500;
          const msg = status === 429 ? 'Hay muchas preguntas ahora mismo. Prueba en un momento.' : status === 402 ? 'El asistente no está disponible ahora mismo.' : 'No he podido responder. Inténtalo de nuevo.';
          return new Response(msg, { status });
        }
      },
    },
  },
});
