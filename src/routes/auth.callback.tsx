import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Confirmando correo · ComoEnCasa" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const nextPath = params.get("next") === "/admin" ? "/admin" : "/guia";
    if (!code) {
      void navigate({ to: nextPath, replace: true });
      return () => {
        active = false;
      };
    }
    void supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (!active) return;
      if (exchangeError)
        setError("No se pudo confirmar el correo. Solicita un enlace nuevo o inicia sesión.");
      else void navigate({ to: "/guia", replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="container-page flex min-h-[60vh] items-center justify-center pb-16 pt-28">
      <p
        role={error ? "alert" : "status"}
        className="card-surface max-w-lg p-6 text-center text-sm leading-6 text-tinta-600"
      >
        {error || "Confirmando tu correo de forma segura…"}
      </p>
    </main>
  );
}
