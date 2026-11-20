import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";

export const Route = createFileRoute("/api/bookings/confirm")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getStripeClient } = await import("@/lib/guide-server.server");
        const stripe = getStripeClient();
        if (!stripe) return Response.json({ status: "unavailable" }, { status: 503 });
        const sessionId = new URL(request.url).searchParams.get("session_id");
        if (!sessionId || !sessionId.startsWith("cs_"))
          return Response.json({ status: "invalid" }, { status: 400 });
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          const bookingId = session.metadata?.["booking_id"];
          if (!bookingId) return Response.json({ status: "invalid" }, { status: 404 });
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: booking, error: bookingError } = await supabaseAdmin
            .from("visit_bookings")
            .select("id,status,total_amount_cents,guest_count,slot_id,stripe_session_id")
            .eq("id", bookingId)
            .eq("stripe_session_id", session.id)
            .maybeSingle();
          if (bookingError || !booking)
            return Response.json({ status: "invalid" }, { status: 404 });

          if (session.payment_status === "paid") {
            const isCurrentPaymentModel =
              session.metadata?.["payment_model"] === "management_fee_15_cash_85";
            const managementFeeCents = Math.round((booking.total_amount_cents * 15) / 100);
            const cashDueCents = booking.total_amount_cents - managementFeeCents;
            if (
              isCurrentPaymentModel &&
              (session.amount_total !== managementFeeCents ||
                session.metadata?.["total_amount_cents"] !== String(booking.total_amount_cents) ||
                session.metadata?.["cash_due_cents"] !== String(cashDueCents))
            )
              return Response.json({ status: "invalid" }, { status: 409 });

            const paymentIntentId =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : (session.payment_intent?.id ?? null);
            const { error: updateError } = await supabaseAdmin
              .from("visit_bookings")
              .update({ status: "paid", stripe_payment_intent_id: paymentIntentId })
              .eq("id", bookingId)
              .eq("stripe_session_id", session.id)
              .eq("status", "pending_payment");
            if (updateError) return Response.json({ status: "unavailable" }, { status: 503 });
            return Response.json(
              {
                status: "paid",
                paymentModel: isCurrentPaymentModel ? "management_fee_15_cash_85" : "legacy",
                totalAmountCents: booking.total_amount_cents,
                paidOnlineCents: session.amount_total ?? booking.total_amount_cents,
                cashDueCents: isCurrentPaymentModel ? cashDueCents : 0,
                guestCount: booking.guest_count,
              },
              { headers: { "Cache-Control": "private, no-store" } },
            );
          }
          if (session.status === "expired") {
            await supabaseAdmin
              .from("visit_bookings")
              .update({ status: "expired" })
              .eq("id", bookingId)
              .eq("stripe_session_id", session.id)
              .eq("status", "pending_payment");
            return Response.json({ status: "expired" });
          }
          return Response.json(
            { status: "pending" },
            { headers: { "Cache-Control": "private, no-store" } },
          );
        } catch (error) {
          if (error instanceof Stripe.errors.StripeInvalidRequestError)
            return Response.json({ status: "invalid" }, { status: 404 });
          return Response.json({ status: "unavailable" }, { status: 503 });
        }
      },
    },
  },
});
