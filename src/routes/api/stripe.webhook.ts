import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getStripeClient } = await import("@/lib/guide-server.server");
        const stripe = getStripeClient();
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        const signature = request.headers.get("stripe-signature");
        if (!stripe || !secret)
          return Response.json({ error: "Webhook no configurado." }, { status: 503 });
        if (!signature)
          return Response.json({ error: "Falta la firma del webhook." }, { status: 400 });

        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
        } catch {
          return Response.json({ error: "Firma de webhook no válida." }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        try {
          if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
          ) {
            const session = event.data.object as Stripe.Checkout.Session;
            const bookingId = session.metadata?.["booking_id"];
            if (bookingId && session.payment_status === "paid") {
              const paymentIntentId =
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : (session.payment_intent?.id ?? null);
              const { error } = await supabaseAdmin
                .from("visit_bookings")
                .update({ status: "paid", stripe_payment_intent_id: paymentIntentId })
                .eq("id", bookingId)
                .eq("stripe_session_id", session.id)
                .eq("status", "pending_payment");
              if (error) throw error;
            }
          } else if (
            event.type === "checkout.session.expired" ||
            event.type === "checkout.session.async_payment_failed"
          ) {
            const session = event.data.object as Stripe.Checkout.Session;
            const bookingId = session.metadata?.["booking_id"];
            if (bookingId) {
              const { error } = await supabaseAdmin
                .from("visit_bookings")
                .update({ status: "expired" })
                .eq("id", bookingId)
                .eq("stripe_session_id", session.id)
                .eq("status", "pending_payment");
              if (error) throw error;
            }
          } else if (event.type === "account.updated") {
            const account = event.data.object as Stripe.Account;
            const { error } = await supabaseAdmin
              .from("stripe_connected_accounts")
              .update({
                details_submitted: account.details_submitted,
                transfers_enabled: account.capabilities?.transfers === "active",
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_account_id", account.id);
            if (error) throw error;
          }

          const { error: eventError } = await supabaseAdmin
            .from("stripe_webhook_events")
            .insert({ event_id: event.id, event_type: event.type });
          if (eventError && eventError.code !== "23505") throw eventError;
          return Response.json({ received: true });
        } catch {
          return Response.json({ error: "No se pudo procesar el evento." }, { status: 500 });
        }
      },
    },
  },
});
