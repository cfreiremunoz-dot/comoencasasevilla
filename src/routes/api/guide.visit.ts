import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const visitSchema = z.object({
  title: z.string().trim().min(6).max(90),
  summary: z.string().trim().min(24).max(180),
  description: z.string().trim().min(80).max(4000),
  category: z.enum(["gastronomia", "cultura", "barrios", "tradiciones"]),
  neighborhood: z.string().trim().min(2).max(80),
  meetingPoint: z.string().trim().min(3).max(180),
  durationMinutes: z.number().int().min(30).max(480),
  pricePerPersonCents: z.number().int().min(500).max(200000),
  imageUrl: z
    .union([
      z.literal(""),
      z
        .string()
        .url()
        .refine((value) => value.startsWith("https://")),
    ])
    .optional(),
  status: z.enum(["draft", "published", "paused"]).optional(),
});

export const Route = createFileRoute("/api/guide/visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getGuideContext, isGuideContext, slugifyGuideTitle } =
          await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const context = await getGuideContext(request);
        if (!isGuideContext(context)) return context;
        if (!context.profile)
          return Response.json({ error: "Crea primero tu perfil de guía." }, { status: 409 });

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Revisa los datos de la visita." }, { status: 400 });
        }
        const parsed = visitSchema.safeParse(raw);
        if (!parsed.success)
          return Response.json(
            { error: "Completa todos los campos con valores válidos." },
            { status: 400 },
          );

        const { data: existing, error: existingError } = await supabaseAdmin
          .from("guided_visits")
          .select("id,slug,status")
          .eq("guide_id", context.profile.id)
          .maybeSingle();
        if (existingError)
          return Response.json({ error: "No se pudo guardar la visita." }, { status: 500 });
        const status = parsed.data.status ?? existing?.status ?? "draft";

        const values = {
          title: parsed.data.title,
          summary: parsed.data.summary,
          description: parsed.data.description,
          category: parsed.data.category,
          neighborhood: parsed.data.neighborhood,
          meeting_point: parsed.data.meetingPoint,
          duration_minutes: parsed.data.durationMinutes,
          price_per_person_cents: parsed.data.pricePerPersonCents,
          image_url: parsed.data.imageUrl || null,
          status,
          updated_at: new Date().toISOString(),
        };
        const result = existing
          ? await supabaseAdmin
              .from("guided_visits")
              .update(values)
              .eq("id", existing.id)
              .select("id,slug,status")
              .single()
          : await supabaseAdmin
              .from("guided_visits")
              .insert({
                ...values,
                guide_id: context.profile.id,
                slug: slugifyGuideTitle(parsed.data.title, context.profile.id),
              })
              .select("id,slug,status")
              .single();

        if (result.error || !result.data)
          return Response.json({ error: "No se pudo guardar la visita." }, { status: 500 });
        return Response.json({ visit: result.data }, { status: 200 });
      },
    },
  },
});
