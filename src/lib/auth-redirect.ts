export function getAuthRedirectUrl(nextPath: "/guia" | "/admin" = "/guia") {
  const redirectProxy = (
    import.meta.env as ImportMetaEnv & { NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL?: string }
  ).NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL;
  const redirectUrl = new URL(
    redirectProxy || `${window.location.origin}/auth/callback`,
    window.location.origin,
  );
  redirectUrl.searchParams.set("next", nextPath);
  return redirectUrl.toString();
}
