import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { toGuideVerificationMessage } from "@/lib/guide-verification-messages";

const guideIdSchema = z.string().uuid();
const messageSchema = z.object({
  guideId: guideIdSchema,
  body: z.string().trim().min(1).max(2000),
});

export const Route = createFileRoute("/api/admin/guides/messages")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getAdminUser, isAdminUser } = await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const actor = await getAdminUser(request);
        if (!isAdminUser(actor)) return actor;

        const guideId = guideIdSchema.safeParse(new URL(request.url).searchParams.get("guideId"));
        if (!guideId.success) {
          return Response.json({ error: "La solicitud de guía no es válida." }, { status: 400 });
        }

        const { data: profile, error: profileError } = await supabaseAdmin
          .from("guide_profiles")
          .select("id")
          .eq("id", guideId.data)
          .maybeSingle();
        if (profileError) {
          return Response.json(
            { error: "No se pudo cargar la solicitud de guía." },
            { status: 500 },
          );
        }
        if (!profile)
          return Response.json({ error: "No se encontró la solicitud." }, { status: 404 });

        const { data, error } = await supabaseAdmin
          .from("guide_verification_messages")
          .select("id,guide_id,sender_user_id,body,created_at")
          .eq("guide_id", guideId.data)
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) {
          return Response.json({ error: "No se pudo cargar la conversación." }, { status: 500 });
        }

        return Response.json(
          {
            viewerId: actor.id,
            messages: [...(data ?? [])].reverse().map(toGuideVerificationMessage),
          },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      },
      POST: async ({ request }) => {
        const { getAdminUser, isAdminUser } = await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const actor = await getAdminUser(request);
        if (!isAdminUser(actor)) return actor;

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

        const { data: profile, error: profileError } = await supabaseAdmin
          .from("guide_profiles")
          .select("id")
          .eq("id", parsed.data.guideId)
          .maybeSingle();
        if (profileError) {
          return Response.json(
            { error: "No se pudo cargar la solicitud de guía." },
            { status: 500 },
          );
        }
        if (!profile)
          return Response.json({ error: "No se encontró la solicitud." }, { status: 404 });

        const { data: message, error } = await supabaseAdmin
          .from("guide_verification_messages")
          .insert({
            guide_id: parsed.data.guideId,
            sender_user_id: actor.id,
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
