import type { User } from "@supabase/supabase-js";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Tables } from "@/integrations/supabase/types";

export type GuideProfile = Tables<"guide_profiles">;
export type GuideContext = { user: User; profile: GuideProfile | null };

export async function getGuideContext(request: Request): Promise<GuideContext | Response> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return Response.json({ error: "La sesión ha caducado. Vuelve a entrar." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("guide_profiles")
    .select(
      "id,user_id,display_name,bio,created_at,updated_at,stripe_account_id,stripe_charges_enabled,stripe_details_submitted,stripe_payouts_enabled,verification_status,verification_notes,verified_at,verified_by",
    )
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return Response.json({ error: "No se pudo cargar el perfil." }, { status: 500 });
  }

  return { user: data.user, profile };
}

let stripeClient: Stripe | null = null;
export function getStripeClient(): Stripe | null {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) return null;
  stripeClient ??= new Stripe(key);
  return stripeClient;
}

export function getRequestOrigin(request: Request): string {
  return new URL(request.url).origin;
}

export function isGuideContext(value: GuideContext | Response): value is GuideContext {
  return !(value instanceof Response);
}

export async function getAdminUser(request: Request): Promise<User | Response> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return Response.json({ error: "La sesión ha caducado. Vuelve a entrar." }, { status: 401 });
  }

  const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
    _user_id: data.user.id,
    _role: "admin",
  });
  if (roleError) {
    return Response.json(
      { error: "No se pudo comprobar el permiso de administrador." },
      { status: 500 },
    );
  }
  if (!isAdmin)
    return Response.json({ error: "No tienes permiso para esta acción." }, { status: 403 });
  return data.user;
}

export function isAdminUser(value: User | Response): value is User {
  return !(value instanceof Response);
}

export function guideRequired(context: GuideContext): Response | null {
  if (!context.profile)
    return Response.json({ error: "Crea primero tu perfil de guía." }, { status: 409 });
  return null;
}

export function slugifyGuideTitle(title: string, guideId: string) {
  const titleSlug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${titleSlug || "visita"}-${guideId.slice(0, 8)}`;
}

export function safeImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
