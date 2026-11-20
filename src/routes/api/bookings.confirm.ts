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
          if (session.payment_status === "paid") {
            const paymentIntentId =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : (session.payment_intent?.id ?? null);
            await supabaseAdmin
              .from("visit_bookings")
              .update({ status: "paid", stripe_payment_intent_id: paymentIntentId })
              .eq("id", bookingId)
              .eq("stripe_session_id", session.id)
              .eq("status", "pending_payment");
            return Response.json(
              { status: "paid" },
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
