import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const createSlotSchema = z.object({
  startsAt: z.string().datetime({ offset: true }),
  capacity: z.number().int().min(1).max(20),
});
const updateSlotSchema = z.object({
  slotId: z.string().uuid(),
  active: z.boolean(),
});

export const Route = createFileRoute("/api/guide/slots")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getGuideContext, isGuideContext } = await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const context = await getGuideContext(request);
        if (!isGuideContext(context)) return context;
        if (!context.profile)
          return Response.json({ error: "Crea primero tu perfil de guía." }, { status: 409 });
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Revisa la fecha y el aforo." }, { status: 400 });
        }
        const parsed = createSlotSchema.safeParse(raw);
        if (
          !parsed.success ||
          new Date(parsed.data.startsAt).getTime() < Date.now() + 60 * 60 * 1000
        ) {
          return Response.json(
            { error: "Elige una fecha futura con al menos una hora de antelación." },
            { status: 400 },
          );
        }
        const { data: visit, error: visitError } = await supabaseAdmin
          .from("guided_visits")
          .select("id")
          .eq("guide_id", context.profile.id)
          .maybeSingle();
        if (visitError)
          return Response.json({ error: "No se pudo cargar la visita." }, { status: 500 });
        if (!visit)
          return Response.json(
            { error: "Guarda primero los datos de tu visita." },
            { status: 409 },
          );
        const { data: slot, error } = await supabaseAdmin
          .from("visit_slots")
          .insert({
            visit_id: visit.id,
            starts_at: parsed.data.startsAt,
            capacity: parsed.data.capacity,
            active: true,
          })
          .select("id,starts_at,capacity,active")
          .single();
        if (error || !slot)
          return Response.json({ error: "No se pudo añadir la fecha." }, { status: 500 });
        return Response.json(
          {
            slot: {
              id: slot.id,
              startsAt: slot.starts_at,
              capacity: slot.capacity,
              active: slot.active,
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
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Revisa el estado de la fecha." }, { status: 400 });
        }
        const parsed = updateSlotSchema.safeParse(raw);
        if (!parsed.success)
          return Response.json({ error: "No se pudo actualizar la fecha." }, { status: 400 });
        const { data: visit, error: visitError } = await supabaseAdmin
          .from("guided_visits")
          .select("id")
          .eq("guide_id", context.profile.id)
          .maybeSingle();
        if (visitError)
          return Response.json({ error: "No se pudo cargar la visita." }, { status: 500 });
        if (!visit)
          return Response.json(
            { error: "Guarda primero los datos de tu visita." },
            { status: 409 },
          );
        const { data: slot, error } = await supabaseAdmin
          .from("visit_slots")
          .update({ active: parsed.data.active })
          .eq("id", parsed.data.slotId)
          .eq("visit_id", visit.id)
          .select("id")
          .maybeSingle();
        if (error)
          return Response.json({ error: "No se pudo actualizar la fecha." }, { status: 500 });
        if (!slot) return Response.json({ error: "No se encontró esa fecha." }, { status: 404 });
        return Response.json({ ok: true });
      },
    },
  },
});
