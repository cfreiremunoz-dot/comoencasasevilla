import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const checkoutSchema = z.object({
  slotId: z.string().uuid(),
  guestCount: z.number().int().min(1).max(20),
  idempotencyKey: z.string().uuid(),
});

export const Route = createFileRoute("/api/bookings/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getRequestOrigin, getStripeClient } = await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const stripe = getStripeClient();
        if (!stripe)
          return Response.json({ error: "Los pagos aún no están disponibles." }, { status: 503 });
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Revisa la reserva." }, { status: 400 });
        }
        const parsed = checkoutSchema.safeParse(raw);
        if (!parsed.success)
          return Response.json(
            { error: "Revisa la fecha y el número de personas." },
            { status: 400 },
          );

        const { data: holds, error: holdError } = await supabaseAdmin.rpc(
          "create_visit_booking_hold",
          {
            p_slot_id: parsed.data.slotId,
            p_guest_count: parsed.data.guestCount,
            p_idempotency_key: parsed.data.idempotencyKey,
          },
        );
        if (holdError || !holds?.[0]) {
          const unavailable = holdError?.message.includes("slot_unavailable");
          const conflict = holdError?.message.includes("idempotency_key_conflict");
          return Response.json(
            {
              error: unavailable
                ? "Esa fecha ya no tiene plazas suficientes."
                : conflict
                  ? "La reserva ha cambiado; vuelve a intentarlo."
                  : "No se pudo bloquear la plaza.",
            },
            { status: unavailable || conflict ? 409 : 500 },
          );
        }
        const hold = holds[0];
        const { data: existingBooking, error: bookingError } = await supabaseAdmin
          .from("visit_bookings")
          .select("stripe_session_id,status,total_amount_cents,platform_fee_cents")
          .eq("id", hold.booking_id)
          .maybeSingle();
        if (bookingError || !existingBooking)
          return Response.json({ error: "No se pudo preparar el pago." }, { status: 500 });
        if (existingBooking.status === "paid")
          return Response.json({ error: "Esta reserva ya está pagada." }, { status: 409 });
        if (existingBooking.status !== "pending_payment")
          return Response.json(
            { error: "La reserva ha caducado. Elige la fecha de nuevo." },
            { status: 409 },
          );

        const managementFeeCents = Math.round((existingBooking.total_amount_cents * 15) / 100);
        const cashDueCents = existingBooking.total_amount_cents - managementFeeCents;
        if (existingBooking.platform_fee_cents !== managementFeeCents) {
          const { error: feeUpdateError } = await supabaseAdmin
            .from("visit_bookings")
            .update({ platform_fee_cents: managementFeeCents })
            .eq("id", hold.booking_id)
            .eq("status", "pending_payment");
          if (feeUpdateError)
            return Response.json(
              { error: "No se pudo preparar el importe de la reserva." },
              { status: 500 },
            );
        }

        if (existingBooking.stripe_session_id) {
          try {
            const existingSession = await stripe.checkout.sessions.retrieve(
              existingBooking.stripe_session_id,
            );
            const isCurrentPaymentModel =
              existingSession.metadata?.["payment_model"] === "management_fee_15_cash_85" &&
              existingSession.amount_total === managementFeeCents;
            if (existingSession.status === "open" && existingSession.url && isCurrentPaymentModel)
              return Response.json({ checkoutUrl: existingSession.url });
            if (existingSession.payment_status === "paid") {
              const paymentIntentId =
                typeof existingSession.payment_intent === "string"
                  ? existingSession.payment_intent
                  : (existingSession.payment_intent?.id ?? null);
              await supabaseAdmin
                .from("visit_bookings")
                .update({ status: "paid", stripe_payment_intent_id: paymentIntentId })
                .eq("id", hold.booking_id)
                .eq("stripe_session_id", existingSession.id)
                .eq("status", "pending_payment");
              return Response.json({
                checkoutUrl: `${getRequestOrigin(request)}/reserva/resultado?session_id=${encodeURIComponent(existingSession.id)}`,
              });
            }
            if (existingSession.status === "complete")
              return Response.json({
                checkoutUrl: `${getRequestOrigin(request)}/reserva/resultado?session_id=${encodeURIComponent(existingSession.id)}`,
              });
            if (existingSession.status === "open")
              await stripe.checkout.sessions.expire(existingSession.id);
          } catch {
            return Response.json(
              { error: "No se pudo recuperar el enlace de pago." },
              { status: 503 },
            );
          }
        }

        const { data: slot, error: slotError } = await supabaseAdmin
          .from("visit_slots")
          .select("id,visit_id,starts_at,active")
          .eq("id", parsed.data.slotId)
          .maybeSingle();
        if (slotError || !slot || !slot.active || new Date(slot.starts_at).getTime() <= Date.now())
          return Response.json({ error: "Esa fecha ya no está disponible." }, { status: 409 });
        const { data: visit, error: visitError } = await supabaseAdmin
          .from("guided_visits")
          .select("id,slug,title,summary,price_per_person_cents,status")
          .eq("id", slot.visit_id)
          .eq("status", "published")
          .maybeSingle();
        if (visitError || !visit)
          return Response.json({ error: "No se pudo cargar la visita." }, { status: 500 });

        const expiresAt = Math.floor(Date.now() / 1000) + 31 * 60;
        if (new Date(hold.hold_expires_at).getTime() <= (expiresAt + 30) * 1000) {
          return Response.json(
            { error: "La reserva ha caducado. Elige la fecha de nuevo." },
            { status: 409 },
          );
        }
        const origin = getRequestOrigin(request);
        try {
          const session = await stripe.checkout.sessions.create(
            {
              mode: "payment",
              expires_at: expiresAt,
              customer_creation: "always",
              line_items: [
                {
                  quantity: 1,
                  price_data: {
                    currency: "eur",
                    unit_amount: managementFeeCents,
                    product_data: {
                      name: `Señal de gestión (15 %) · ${visit.title}`,
                      description: `${parsed.data.guestCount} ${parsed.data.guestCount === 1 ? "persona" : "personas"}. Señal online: ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(managementFeeCents / 100)}. El 85 % restante (${new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cashDueCents / 100)}) se paga en efectivo directamente al guía el día de la visita.`,
                    },
                  },
                },
              ],
              metadata: {
                booking_id: hold.booking_id,
                slot_id: slot.id,
                guest_count: String(parsed.data.guestCount),
                payment_model: "management_fee_15_cash_85",
                total_amount_cents: String(existingBooking.total_amount_cents),
                management_fee_cents: String(managementFeeCents),
                cash_due_cents: String(cashDueCents),
              },
              success_url: `${origin}/reserva/resultado?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${origin}/visitas/${encodeURIComponent(visit.slug)}?cancelled=1`,
            },
            { idempotencyKey: `visit-checkout-15pct-${hold.booking_id}` },
          );
          if (!session.url)
            return Response.json(
              { error: "Stripe no devolvió un enlace de pago." },
              { status: 503 },
            );
          await supabaseAdmin
            .from("visit_bookings")
            .update({ stripe_session_id: session.id })
            .eq("id", hold.booking_id);
          return Response.json({ checkoutUrl: session.url });
        } catch {
          return Response.json(
            { error: "No se pudo iniciar el pago. Puedes volver a intentarlo." },
            { status: 503 },
          );
        }
      },
    },
  },
});
