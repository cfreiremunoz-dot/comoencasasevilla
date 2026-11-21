import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { toGuideVerificationMessage } from "@/lib/guide-verification-messages";

const messageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const Route = createFileRoute("/api/guide/messages")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getGuideContext, isGuideContext } = await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const context = await getGuideContext(request);
        if (!isGuideContext(context)) return context;
        if (!context.profile) {
          return Response.json({ error: "Crea primero tu perfil de guía." }, { status: 409 });
        }

        const { data, error } = await supabaseAdmin
          .from("guide_verification_messages")
          .select("id,guide_id,sender_user_id,body,created_at")
          .eq("guide_id", context.profile.id)
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) {
          return Response.json({ error: "No se pudo cargar la conversación." }, { status: 500 });
        }

        return Response.json(
          {
            viewerId: context.user.id,
            messages: [...(data ?? [])].reverse().map(toGuideVerificationMessage),
          },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      },
      POST: async ({ request }) => {
        const { getGuideContext, isGuideContext } = await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const context = await getGuideContext(request);
        if (!isGuideContext(context)) return context;
        if (!context.profile) {
          return Response.json({ error: "Crea primero tu perfil de guía." }, { status: 409 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Escribe un mensaje válido." }, { status: 400 });
        }
        const parsed = messageSchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { error: "El mensaje no puede estar vacío ni superar los 2000 caracteres." },
            { status: 400 },
          );
        }

        const { data: message, error } = await supabaseAdmin
          .from("guide_verification_messages")
          .insert({
            guide_id: context.profile.id,
            sender_user_id: context.user.id,
            body: parsed.data.body,
          })
          .select("id,guide_id,sender_user_id,body,created_at")
          .single();
        if (error || !message) {
          return Response.json({ error: "No se pudo enviar el mensaje." }, { status: 500 });
        }

        return Response.json(
          { message: toGuideVerificationMessage(message) },
          { status: 201, headers: { "Cache-Control": "private, no-store" } },
        );
      },
    },
  },
});
