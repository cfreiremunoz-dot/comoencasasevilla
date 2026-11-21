import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const reviewSchema = z.object({
  guideId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  notes: z.string().trim().max(2000).optional(),
});

export const Route = createFileRoute("/api/admin/guides")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getAdminUser, isAdminUser } = await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const actor = await getAdminUser(request);
        if (!isAdminUser(actor)) return actor;

        const { data: profiles, error } = await supabaseAdmin
          .from("guide_profiles")
          .select(
            "id,display_name,bio,created_at,updated_at,verification_status,verification_notes,verified_at",
          )
          .order("created_at", { ascending: false })
          .limit(100);
        if (error)
          return Response.json(
            { error: "No se pudieron cargar los perfiles de guía." },
            { status: 500 },
          );

        return Response.json(
          {
            profiles: (profiles ?? []).map((profile) => ({
              id: profile.id,
              displayName: profile.display_name,
              bio: profile.bio,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
              verificationStatus: profile.verification_status,
              verificationNotes: profile.verification_notes,
              verifiedAt: profile.verified_at,
            })),
          },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      },
      PATCH: async ({ request }) => {
        const { getAdminUser, isAdminUser } = await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const actor = await getAdminUser(request);
        if (!isAdminUser(actor)) return actor;

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Revisa la decisión de verificación." }, { status: 400 });
        }
        const parsed = reviewSchema.safeParse(raw);
        if (!parsed.success)
          return Response.json({ error: "Revisa el estado y las observaciones." }, { status: 400 });

        const { data: current, error: currentError } = await supabaseAdmin
          .from("guide_profiles")
          .select("id,verification_status,verification_notes,verified_at,verified_by,updated_at")
          .eq("id", parsed.data.guideId)
          .maybeSingle();
        if (currentError)
          return Response.json({ error: "No se pudo cargar el perfil de guía." }, { status: 500 });
        if (!current) return Response.json({ error: "No se encontró el perfil." }, { status: 404 });
        if (current.verification_status !== "pending")
          return Response.json({ error: "Este perfil ya ha sido revisado." }, { status: 409 });

        const notes = parsed.data.notes?.trim() || null;
        const reviewedAt = new Date().toISOString();
        const { data: profile, error: updateError } = await supabaseAdmin
          .from("guide_profiles")
          .update({
            verification_status: parsed.data.status,
            verification_notes: notes,
            verified_at: parsed.data.status === "approved" ? reviewedAt : null,
            verified_by: actor.id,
            updated_at: reviewedAt,
          })
          .eq("id", parsed.data.guideId)
          .eq("verification_status", "pending")
          .select(
            "id,display_name,bio,created_at,updated_at,verification_status,verification_notes,verified_at",
          )
          .maybeSingle();
        if (updateError)
          return Response.json({ error: "No se pudo guardar la decisión." }, { status: 500 });
        if (!profile)
          return Response.json({ error: "Este perfil ya ha sido revisado." }, { status: 409 });

        const { error: eventError } = await supabaseAdmin.from("guide_verification_events").insert({
          guide_id: profile.id,
          actor_user_id: actor.id,
          status: parsed.data.status,
          notes,
        });
        if (eventError) {
          const { error: rollbackError } = await supabaseAdmin
            .from("guide_profiles")
            .update({
              verification_status: current.verification_status,
              verification_notes: current.verification_notes,
              verified_at: current.verified_at,
              verified_by: current.verified_by,
              updated_at: current.updated_at,
            })
            .eq("id", profile.id)
            .eq("verification_status", parsed.data.status);
          if (rollbackError)
            console.error("[guides] Could not roll back failed verification audit", rollbackError);
          return Response.json(
            { error: "No se pudo registrar la auditoría de la revisión." },
            { status: 500 },
          );
        }

        return Response.json(
          {
            profile: {
              id: profile.id,
              displayName: profile.display_name,
              bio: profile.bio,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
              verificationStatus: profile.verification_status,
              verificationNotes: profile.verification_notes,
              verifiedAt: profile.verified_at,
            },
          },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      },
    },
  },
});
