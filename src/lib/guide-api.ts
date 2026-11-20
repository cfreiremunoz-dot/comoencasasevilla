import { supabase } from "@/integrations/supabase/client";

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);

  const response = await fetch(path, { ...init, headers });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload ? payload.error : null;
    throw new Error(typeof message === "string" ? message : "No se pudo completar la solicitud.");
  }
  return payload as T;
}

export async function publicApiRequest<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { accept: "application/json" } });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload ? payload.error : null;
    throw new Error(typeof message === "string" ? message : "No se pudo cargar la información.");
  }
  return payload as T;
}
