import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const bodySchema = z.object({
  name: z.string().trim().max(100).default(''),
  email: z.string().trim().email().max(255),
  question: z.string().trim().max(2000).default(''),
  transcript: z.array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(4000) })).max(40),
});

export const Route = createFileRoute('/api/handoff')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: 'Revisa el correo.' }, { status: 400 });
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { error } = await supabaseAdmin.from('support_handoffs').insert(parsed.data);
        if (error) {
          console.error('handoff insert', error.message);
          return Response.json({ error: 'No se ha podido enviar.' }, { status: 500 });
        }
        // TODO: enviar aviso por correo cuando haya un dominio de correo configurado.
        return Response.json({ ok: true });
      },
    },
  },
});
