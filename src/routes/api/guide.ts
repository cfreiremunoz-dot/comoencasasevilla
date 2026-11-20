import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  bio: z.string().trim().min(20).max(600),
});

export const Route = createFileRoute("/api/guide")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getGuideContext, isGuideContext } = await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const context = await getGuideContext(request);
        if (!isGuideContext(context)) return context;

        if (!context.profile) {
          return Response.json({ profile: null, visit: null, slots: [] });
        }

        const { data: visit, error: visitError } = await supabaseAdmin
          .from("guided_visits")
          .select(
            "id,slug,title,summary,description,category,neighborhood,meeting_point,duration_minutes,price_per_person_cents,image_url,status",
          )
          .eq("guide_id", context.profile.id)
          .maybeSingle();
        if (visitError)
          return Response.json({ error: "No se pudo cargar el panel de guía." }, { status: 500 });

        const { safeImageUrl } = await import("@/lib/guide-server.server");

        const { data: slots, error: slotsError } = visit
          ? await supabaseAdmin
              .from("visit_slots")
              .select("id,starts_at,capacity,active")
              .eq("visit_id", visit.id)
              .order("starts_at", { ascending: true })
          : { data: [], error: null };
        if (slotsError)
          return Response.json({ error: "No se pudieron cargar las fechas." }, { status: 500 });

        return Response.json(
          {
            profile: {
              id: context.profile.id,
              displayName: context.profile.display_name,
              bio: context.profile.bio,
              verificationStatus: context.profile.verification_status,
              verificationNotes: context.profile.verification_notes,
            },

            visit: visit
              ? {
                  id: visit.id,
                  slug: visit.slug,
                  title: visit.title,
                  summary: visit.summary,
                  description: visit.description,
                  category: visit.category,
                  neighborhood: visit.neighborhood,
                  meetingPoint: visit.meeting_point,
                  durationMinutes: visit.duration_minutes,
                  pricePerPersonCents: visit.price_per_person_cents,
                  imageUrl: safeImageUrl(visit.image_url) ?? "",
                  status: visit.status,
                }
              : null,
            slots: (slots ?? []).map((slot) => ({
              id: slot.id,
              startsAt: slot.starts_at,
              capacity: slot.capacity,
              active: slot.active,
            })),
          },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      },
      POST: async ({ request }) => {
        const { getGuideContext, isGuideContext } = await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const context = await getGuideContext(request);
        if (!isGuideContext(context)) return context;
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Revisa los datos del perfil." }, { status: 400 });
        }
        const parsed = profileSchema.safeParse(raw);
        if (!parsed.success)
          return Response.json(
            { error: "Escribe un nombre y una presentación válidos." },
            { status: 400 },
          );
        if (context.profile)
          return Response.json({ error: "Ya tienes un perfil de guía." }, { status: 409 });

        const { data: profile, error } = await supabaseAdmin
          .from("guide_profiles")
          .insert({
            user_id: context.user.id,
            display_name: parsed.data.displayName,
            bio: parsed.data.bio,
          })
          .select("id,display_name,bio,verification_status,verification_notes")
          .single();
        if (error || !profile)
          return Response.json(
            { error: "No se pudo crear el perfil. Inténtalo de nuevo." },
            { status: 500 },
          );
        return Response.json(
          {
            profile: {
              id: profile.id,
              displayName: profile.display_name,
              bio: profile.bio,
              verificationStatus: profile.verification_status,
              verificationNotes: profile.verification_notes,
            },
          },
          { status: 201 },
        );
      },
      PATCH: async ({ request }) => {
        const { getGuideContext, isGuideContext } = await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const context = await getGuideContext(request);
        if (!isGuideContext(context)) return context;
        if (!context.profile)
          return Response.json({ error: "Crea primero tu perfil de guía." }, { status: 409 });
        if (context.profile.verification_status !== "rejected")
          return Response.json(
            { error: "Solo puedes enviar cambios cuando la revisión solicita correcciones." },
            { status: 409 },
          );

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Revisa los datos del perfil." }, { status: 400 });
        }
        const parsed = profileSchema.safeParse(raw);
        if (!parsed.success)
          return Response.json(
            { error: "Escribe un nombre y una presentación válidos." },
            { status: 400 },
          );

        const { data: profile, error } = await supabaseAdmin
          .from("guide_profiles")
          .update({
            display_name: parsed.data.displayName,
            bio: parsed.data.bio,
            verification_status: "pending",
            verification_notes: null,
            verified_at: null,
            verified_by: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", context.profile.id)
          .eq("verification_status", "rejected")
          .select("id,display_name,bio,verification_status,verification_notes")
          .maybeSingle();
        if (error)
          return Response.json({ error: "No se pudieron enviar los cambios." }, { status: 500 });
        if (!profile)
          return Response.json(
            { error: "El perfil ya cambió; actualiza la página." },
            { status: 409 },
          );

        return Response.json({
          profile: {
            id: profile.id,
            displayName: profile.display_name,
            bio: profile.bio,
            verificationStatus: profile.verification_status,
            verificationNotes: profile.verification_notes,
          },
        });
      },
    },
  },
});
