import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/visits")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { safeImageUrl } = await import("@/lib/guide-server.server");
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");

        let visitsQuery = supabaseAdmin
          .from("guided_visits")
          .select(
            "id,slug,title,summary,description,category,neighborhood,meeting_point,duration_minutes,price_per_person_cents,image_url,guide_id",
          )
          .eq("status", "published")
          .order("created_at", { ascending: false });
        if (slug) visitsQuery = visitsQuery.eq("slug", slug);

        const { data: visits, error } = await visitsQuery;
        if (error)
          return Response.json({ error: "No se pudieron cargar las visitas." }, { status: 500 });
        if (!visits?.length) return Response.json(slug ? { visit: null } : { visits: [] });

        const guideIds = [...new Set(visits.map((visit) => visit.guide_id))];
        const visitIds = visits.map((visit) => visit.id);
        const [{ data: guides, error: guidesError }, { data: slots, error: slotsError }] =
          await Promise.all([
            supabaseAdmin
              .from("guide_profiles")
              .select("id,display_name,bio,verification_status")
              .in("id", guideIds),
            supabaseAdmin
              .from("visit_slots")
              .select("id,visit_id,starts_at,capacity")
              .in("visit_id", visitIds)
              .eq("active", true)
              .gt("starts_at", new Date().toISOString())
              .order("starts_at", { ascending: true }),
          ]);

        if (guidesError || slotsError) {
          return Response.json(
            { error: "No se pudieron cargar las fechas disponibles." },
            { status: 500 },
          );
        }

        const approvedGuideIds = new Set(
          (guides ?? [])
            .filter((guide) => guide.verification_status === "approved")
            .map((guide) => guide.id),
        );
        const approvedVisits = visits.filter((visit) => approvedGuideIds.has(visit.guide_id));
        if (!approvedVisits.length) {
          return Response.json(slug ? { visit: null } : { visits: [] }, {
            status: slug ? 404 : 200,
            headers: { "Cache-Control": "private, no-store" },
          });
        }

        const slotIds = (slots ?? []).map((slot) => slot.id);
        const { data: bookings, error: bookingsError } = slotIds.length
          ? await supabaseAdmin
              .from("visit_bookings")
              .select("slot_id,guest_count,status,hold_expires_at")
              .in("slot_id", slotIds)
              .in("status", ["paid", "pending_payment"])
          : { data: [], error: null };

        if (bookingsError) {
          return Response.json(
            { error: "No se pudieron calcular las plazas disponibles." },
            { status: 500 },
          );
        }

        const now = Date.now();
        const reservedBySlot = new Map<string, number>();
        for (const booking of bookings ?? []) {
          if (booking.status === "paid" || new Date(booking.hold_expires_at).getTime() > now) {
            reservedBySlot.set(
              booking.slot_id,
              (reservedBySlot.get(booking.slot_id) ?? 0) + booking.guest_count,
            );
          }
        }

        const guideById = new Map((guides ?? []).map((guide) => [guide.id, guide]));
        const slotsByVisit = new Map<
          string,
          Array<{ id: string; startsAt: string; capacity: number; available: number }>
        >();
        for (const slot of slots ?? []) {
          const available = Math.max(0, slot.capacity - (reservedBySlot.get(slot.id) ?? 0));
          if (!available) continue;
          const list = slotsByVisit.get(slot.visit_id) ?? [];
          list.push({ id: slot.id, startsAt: slot.starts_at, capacity: slot.capacity, available });
          slotsByVisit.set(slot.visit_id, list);
        }

        const publicVisits = approvedVisits.map((visit) => {
          const guide = guideById.get(visit.guide_id);
          return {
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
            imageUrl: safeImageUrl(visit.image_url),
            guide: { displayName: guide?.display_name ?? "Guía local", bio: guide?.bio ?? "" },
            slots: slotsByVisit.get(visit.id) ?? [],
          };
        });

        if (slug) {
          const visit = publicVisits[0];
          if (!visit) return Response.json({ visit: null }, { status: 404 });
          return Response.json({ visit }, { headers: { "Cache-Control": "private, no-store" } });
        }
        return Response.json(
          { visits: publicVisits },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      },
    },
  },
});
