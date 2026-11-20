import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/guide/connect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getGuideContext, getRequestOrigin, getStripeClient, isGuideContext } =
          await import("@/lib/guide-server.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const context = await getGuideContext(request);
        if (!isGuideContext(context)) return context;
        if (!context.profile)
          return Response.json({ error: "Crea primero tu perfil de guía." }, { status: 409 });
        const stripe = getStripeClient();
        if (!stripe)
          return Response.json({ error: "Los pagos aún no están disponibles." }, { status: 503 });

        const { data: existing, error: lookupError } = await supabaseAdmin
          .from("stripe_connected_accounts")
          .select("stripe_account_id")
          .eq("guide_id", context.profile.id)
          .maybeSingle();
        if (lookupError)
          return Response.json(
            { error: "No se pudo cargar la conexión de cobro." },
            { status: 500 },
          );
        let accountId = existing?.stripe_account_id;
        if (!accountId) {
          try {
            const account = await stripe.accounts.create(
              {
                type: "express",
                country: "ES",
                ...(context.user.email ? { email: context.user.email } : {}),
                business_type: "individual",
                capabilities: {
                  card_payments: { requested: true },
                  transfers: { requested: true },
                },
                metadata: { guide_id: context.profile.id },
              },
              { idempotencyKey: `guide-connect-${context.profile.id}` },
            );
            accountId = account.id;
            const { error: insertError } = await supabaseAdmin
              .from("stripe_connected_accounts")
              .insert({
                guide_id: context.profile.id,
                stripe_account_id: accountId,
                details_submitted: account.details_submitted,
                transfers_enabled: account.capabilities?.transfers === "active",
                updated_at: new Date().toISOString(),
              });
            if (insertError) throw insertError;
          } catch {
            return Response.json(
              { error: "No se pudo preparar la cuenta de cobro. Inténtalo de nuevo." },
              { status: 503 },
            );
          }
        }

        const origin = getRequestOrigin(request);
        try {
          const link = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${origin}/guia?connect=refresh`,
            return_url: `${origin}/guia?connect=return`,
            type: "account_onboarding",
          });
          return Response.json({ url: link.url });
        } catch {
          return Response.json(
            { error: "No se pudo abrir el formulario seguro de Stripe." },
            { status: 503 },
          );
        }
      },
    },
  },
});
