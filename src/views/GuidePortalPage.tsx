import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CalendarDays,
  CircleAlert,
  Clock3,
  LogOut,
  Plus,
  WalletCards,
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { apiRequest } from "@/lib/guide-api";
import type { GuideDashboard } from "@/lib/guide-types";
import { getAuthRedirectUrl } from "@/lib/auth-redirect";
import { GuidedVisitCatalog } from "@/components/GuidedVisitCatalog";
import { GuideVerificationChat } from "@/components/GuideVerificationChat";

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];
const inputClass =
  "w-full rounded-xl border border-crema-300 bg-white px-4 py-3 text-sm text-tinta-700 outline-none transition focus:border-terracota-500 focus:ring-2 focus:ring-terracota-500/20";
const labelClass = "mb-2 block text-sm font-semibold text-tinta-700";
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
const money = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);

export function GuidePortalPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [pending, setPending] = useState("");
  const sessionQuery = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });
  const session = sessionQuery.data ?? null;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      queryClient.setQueryData(["auth-session"], nextSession);
      void queryClient.invalidateQueries({ queryKey: ["guide-dashboard"] });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const dashboardQuery = useQuery({
    queryKey: ["guide-dashboard", session?.user.id],
    queryFn: () => apiRequest<GuideDashboard>("/api/guide"),
    enabled: Boolean(session),
  });

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    setAuthError("");
    setAuthMessage("");
    setPending("auth");

    if (mode === "in") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setPending("");
      if (error) {
        const emailNotConfirmed = error.message.toLowerCase().includes("email not confirmed");
        if (emailNotConfirmed) {
          setConfirmationEmail(email);
          setAuthError("Tu correo todavía no está confirmado. Puedes solicitar otro enlace.");
        } else {
          setAuthError("Correo o contraseña incorrectos.");
        }
        return;
      }
      queryClient.setQueryData(["auth-session"], data.session);
      return;
    }

    const displayName = String(formData.get("displayName") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();
    setConfirmationEmail(email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: { display_name: displayName, bio },
      },
    });
    setPending("");
    if (error) {
      setAuthError(
        error.message.toLowerCase().includes("password")
          ? "La contraseña debe tener al menos 8 caracteres."
          : "No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.",
      );
      return;
    }
    if (data.session) {
      queryClient.setQueryData(["auth-session"], data.session);
    } else {
      setAuthMessage(
        "Tu cuenta está pendiente de confirmación. Revisa tu bandeja de entrada y spam; si no aparece, puedes pedir que te enviemos otro enlace.",
      );
      setMode("in");
    }
  }

  async function resendConfirmation() {
    if (!confirmationEmail) return;
    setPending("resend");
    setAuthError("");
    setAuthMessage("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: confirmationEmail,
      options: { emailRedirectTo: getAuthRedirectUrl() },
    });
    setPending("");
    if (error) {
      setAuthError(
        error.message.toLowerCase().includes("rate")
          ? "Has solicitado varios correos seguidos. Espera un momento antes de volver a intentarlo."
          : "No se pudo reenviar el enlace. Comprueba el correo e inténtalo de nuevo más tarde.",
      );
      return;
    }
    setAuthMessage(
      "Si esta cuenta necesita confirmación, enviaremos un nuevo enlace. Revisa también la carpeta de spam.",
    );
  }

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.setQueryData(["auth-session"], null);
    void queryClient.invalidateQueries({ queryKey: ["guide-dashboard"] });
  }

  return (
    <main className="animate-fade-in pb-20 pt-24 sm:pt-28">
      <div className="container-page">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracota-600">
            Para quienes hacen Sevilla
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-tinta-800 sm:text-5xl">
            Comparte tu Sevilla. <span className="text-terracota-600">A tu manera.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-tinta-500">
            Crea una visita, abre fechas para grupos pequeños y recibe tus pagos de forma segura.
          </p>
        </header>

        {sessionQuery.isPending ? (
          <p className="mt-10 text-sm text-tinta-500" role="status">
            Comprobando sesión…
          </p>
        ) : !session ? (
          <section className="mt-8 grid items-start gap-8 md:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
            <GuidedVisitCatalog showExamplesWhenEmpty compact />

            <form
              id="registro-guia"
              onSubmit={submitAuth}
              className="card-surface grid content-start gap-4 p-6 sm:p-8"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-terracota-600">
                  Área de guías
                </p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-tinta-800">
                  {mode === "up" ? "Crea tu cuenta de guía" : "Qué alegría verte"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-tinta-500">
                  El alta es gratuita. Comparte tu propuesta, elige tus fechas y recibe reservas.
                </p>
              </div>
              {mode === "up" && (
                <>
                  <div>
                    <label className={labelClass} htmlFor="guide-display-name">
                      Nombre público
                    </label>
                    <input
                      id="guide-display-name"
                      name="displayName"
                      className={inputClass}
                      required
                      minLength={2}
                      maxLength={80}
                      autoComplete="name"
                      placeholder="Cómo te llamarán tus visitantes"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="guide-bio">
                      Cuéntanos quién eres
                    </label>
                    <textarea
                      id="guide-bio"
                      name="bio"
                      className={`${inputClass} min-h-24 resize-y`}
                      required
                      minLength={20}
                      maxLength={600}
                      placeholder="Tu historia y qué te hace conocer Sevilla de una forma especial"
                    />
                  </div>
                </>
              )}
              <div>
                <label className={labelClass} htmlFor="guide-email">
                  Correo electrónico
                </label>
                <input
                  id="guide-email"
                  name="email"
                  className={inputClass}
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="guide-password">
                  Contraseña
                </label>
                <input
                  id="guide-password"
                  name="password"
                  className={inputClass}
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                />
              </div>
              {authError && (
                <p role="alert" className="text-sm text-red-700">
                  {authError}
                </p>
              )}
              {authMessage && (
                <p
                  role="status"
                  className="rounded-xl bg-oliva-50 p-3 text-sm leading-6 text-oliva-800"
                >
                  {authMessage}
                </p>
              )}
              {mode === "in" && confirmationEmail && (
                <button
                  type="button"
                  onClick={() => void resendConfirmation()}
                  disabled={Boolean(pending)}
                  className="w-fit text-left text-sm font-semibold text-terracota-700 underline underline-offset-2 disabled:opacity-60"
                >
                  {pending === "resend" ? "Enviando enlace…" : "Reenviar correo de confirmación"}
                </button>
              )}
              {mode === "up" && (
                <p className="text-xs leading-5 text-tinta-400">
                  Al crear una cuenta aceptas nuestro{" "}
                  <Link to="/aviso-legal" className="underline underline-offset-2">
                    aviso legal
                  </Link>{" "}
                  y nuestra{" "}
                  <Link to="/privacidad" className="underline underline-offset-2">
                    política de privacidad
                  </Link>
                  .
                </p>
              )}
              <button
                disabled={Boolean(pending)}
                className="rounded-full bg-terracota-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracota-700 disabled:opacity-60"
              >
                {pending === "auth"
                  ? "Un momento…"
                  : mode === "up"
                    ? "Crear cuenta de guía"
                    : "Entrar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "up" ? "in" : "up");
                  setAuthError("");
                  setAuthMessage("");
                }}
                className="text-sm font-medium text-terracota-700 hover:underline"
              >
                {mode === "up" ? "Ya tengo una cuenta" : "Crear una cuenta nueva"}
              </button>
            </form>
          </section>
        ) : (
          <section className="mt-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-tinta-400">Panel de guía</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-tinta-800">
                  Hola, {session.user.user_metadata?.["display_name"] || session.user.email}
                </h2>
              </div>
              <button
                onClick={signOut}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-tinta-200 px-4 py-2 text-sm font-medium text-tinta-600 hover:bg-crema-100"
              >
                <LogOut aria-hidden="true" className="size-4" /> Cerrar sesión
              </button>
            </div>
            {dashboardQuery.isPending ? (
              <p role="status" className="text-sm text-tinta-500">
                Cargando tu panel…
              </p>
            ) : dashboardQuery.isError ? (
              <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                {dashboardQuery.error.message}
              </p>
            ) : dashboardQuery.data.profile ? (
              <GuideDashboardPanel
                data={dashboardQuery.data}
                email={session.user.email ?? ""}
                onRefresh={() =>
                  void queryClient.invalidateQueries({ queryKey: ["guide-dashboard"] })
                }
              />
            ) : (
              <ProfileSetup
                session={session}
                onCreated={() =>
                  void queryClient.invalidateQueries({ queryKey: ["guide-dashboard"] })
                }
              />
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function ProfileSetup({
  session,
  onCreated,
}: {
  session: NonNullable<Session>;
  onCreated: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await apiRequest("/api/guide", {
        method: "POST",
        body: JSON.stringify({
          displayName: String(form.get("displayName") ?? ""),
          bio: String(form.get("bio") ?? ""),
        }),
      });
      onCreated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el perfil.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="card-surface grid max-w-2xl gap-4 p-6 sm:p-8">
      <div>
        <h3 className="font-serif text-2xl font-semibold text-tinta-800">Termina tu perfil</h3>
        <p className="mt-2 text-sm leading-6 text-tinta-500">
          Así podrán conocerte antes de reservar una visita contigo.
        </p>
      </div>
      <div>
        <label className={labelClass} htmlFor="profile-display-name">
          Nombre público
        </label>
        <input
          id="profile-display-name"
          name="displayName"
          className={inputClass}
          defaultValue={session.user.user_metadata?.["display_name"] ?? ""}
          minLength={2}
          maxLength={80}
          required
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="profile-bio">
          Presentación
        </label>
        <textarea
          id="profile-bio"
          name="bio"
          className={`${inputClass} min-h-28 resize-y`}
          defaultValue={session.user.user_metadata?.["bio"] ?? ""}
          minLength={20}
          maxLength={600}
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="w-fit rounded-full bg-terracota-600 px-5 py-3 text-sm font-semibold text-white hover:bg-terracota-700 disabled:opacity-60"
      >
        {busy ? "Guardando…" : "Guardar perfil"}
      </button>
    </form>
  );
}

function ProfileCorrectionForm({
  profile,
  onSaved,
}: {
  profile: { id: string; displayName: string; bio: string };
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await apiRequest("/api/guide", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: String(form.get("displayName") ?? ""),
          bio: String(form.get("bio") ?? ""),
        }),
      });
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron enviar los cambios.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-3 rounded-xl border border-crema-200 p-4">
      <h4 className="font-semibold text-tinta-800">Actualiza tu perfil para una nueva revisión</h4>
      <div>
        <label className={labelClass} htmlFor="correction-display-name">
          Nombre público
        </label>
        <input
          id="correction-display-name"
          name="displayName"
          className={inputClass}
          defaultValue={profile.displayName}
          required
          minLength={2}
          maxLength={80}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="correction-bio">
          Presentación
        </label>
        <textarea
          id="correction-bio"
          name="bio"
          className={`${inputClass} min-h-24 resize-y`}
          defaultValue={profile.bio}
          required
          minLength={20}
          maxLength={600}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="w-fit rounded-full bg-terracota-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-terracota-700 disabled:opacity-60"
      >
        {busy ? "Enviando…" : "Enviar para revisión"}
      </button>
    </form>
  );
}

function GuideDashboardPanel({
  data,
  email,
  onRefresh,
}: {
  data: GuideDashboard;
  email: string;
  onRefresh: () => void;
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const visitMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest("/api/guide/visit", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      setError("");
      setSuccess("Visita guardada.");
      onRefresh();
    },
    onError: (cause) => {
      setSuccess("");
      setError(cause.message);
    },
  });
  const slotMutation = useMutation({
    mutationFn: (body: { startsAt: string; capacity: number }) =>
      apiRequest("/api/guide/slots", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      setError("");
      setSuccess("Fecha añadida.");
      onRefresh();
    },
    onError: (cause) => setError(cause.message),
  });
  const toggleMutation = useMutation({
    mutationFn: (body: { slotId: string; active: boolean }) =>
      apiRequest("/api/guide/slots", { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => onRefresh(),
    onError: (cause) => setError(cause.message),
  });

  function saveVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const form = submitter
      ? new FormData(event.currentTarget, submitter)
      : new FormData(event.currentTarget);
    const rawPrice = Number(form.get("price"));
    visitMutation.mutate({
      title: form.get("title"),
      summary: form.get("summary"),
      description: form.get("description"),
      category: form.get("category"),
      neighborhood: form.get("neighborhood"),
      meetingPoint: form.get("meetingPoint"),
      durationMinutes: Number(form.get("durationMinutes")),
      pricePerPersonCents: Math.round(rawPrice * 100),
      imageUrl: form.get("imageUrl"),
      status: form.get("status"),
    });
  }

  function addSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const localDate = String(form.get("startsAt") ?? "");
    const date = new Date(localDate);
    if (!localDate || Number.isNaN(date.getTime())) {
      setError("Elige una fecha válida.");
      return;
    }
    slotMutation.mutate({ startsAt: date.toISOString(), capacity: Number(form.get("capacity")) });
    event.currentTarget.reset();
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="grid gap-6">
        <section className="card-surface p-5 sm:p-6" aria-labelledby="guide-payout-title">
          <h3 id="guide-payout-title" className="font-serif text-xl font-semibold text-tinta-800">
            Cobro de las visitas
          </h3>
          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-tinta-600">
            <WalletCards aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-oliva-700" />
            <span>
              El viajero paga online el 15 % de gestión. El resto se paga directamente al guía el
              día de la visita. No necesitas conectar Stripe para publicar.
            </span>
          </p>
        </section>

        <section className="card-surface p-5 sm:p-6" aria-labelledby="guide-profile-title">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3
                id="guide-profile-title"
                className="font-serif text-xl font-semibold text-tinta-800"
              >
                Tu perfil
              </h3>
              <p className="mt-1 text-sm text-tinta-500">Visible en las visitas que publiques.</p>
            </div>
            <span className="text-xs text-tinta-400">{email}</span>
          </div>
          <p className="mt-4 font-semibold text-tinta-800">{data.profile?.displayName}</p>
          <p className="mt-2 text-sm leading-6 text-tinta-500">{data.profile?.bio}</p>
          <div
            className={`mt-4 rounded-xl p-4 text-sm leading-6 ${
              data.profile?.verificationStatus === "approved"
                ? "bg-oliva-50 text-oliva-800"
                : data.profile?.verificationStatus === "rejected"
                  ? "bg-red-50 text-red-800"
                  : "bg-crema-50 text-tinta-700"
            }`}
            role="status"
          >
            <p className="font-semibold">
              {data.profile?.verificationStatus === "approved"
                ? "Perfil aprobado"
                : data.profile?.verificationStatus === "rejected"
                  ? "Necesitamos algunos cambios"
                  : "Perfil pendiente de revisión"}
            </p>
            <p className="mt-1">
              {data.profile?.verificationStatus === "approved"
                ? "Ya puedes publicar tus visitas en el catálogo."
                : data.profile?.verificationStatus === "rejected"
                  ? data.profile.verificationNotes ||
                    "Actualiza tu perfil siguiendo las indicaciones y escríbenos por el chat si necesitas aclarar algo."
                  : "Revisaremos tu perfil antes de que tus visitas aparezcan en el catálogo."}
            </p>
          </div>
          {data.profile?.verificationStatus === "rejected" && (
            <ProfileCorrectionForm profile={data.profile} onSaved={onRefresh} />
          )}
          <GuideVerificationChat
            endpoint="/api/guide/messages"
            heading="Chat con el equipo de verificación"
            counterpartLabel="el equipo de ComoEnCasa"
            emptyDescription="Comparte aquí la información necesaria para completar tu solicitud, como los enlaces a tus redes sociales. Solo tú y el equipo de verificación podéis ver esta conversación."
            placeholder="Escribe un mensaje o comparte enlaces a tus redes sociales…"
          />
        </section>
      </div>

      <div className="grid gap-6">
        <form onSubmit={saveVisit} className="card-surface grid gap-4 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-serif text-xl font-semibold text-tinta-800">
                {data.visit ? "Tu visita" : "Crea tu primera visita"}
              </h3>
              <p className="mt-1 text-sm text-tinta-500">
                Define el plan que te gustaría compartir.
              </p>
            </div>
            {data.visit && (
              <span className="w-fit rounded-full bg-crema-100 px-3 py-1 text-xs font-semibold capitalize text-tinta-600">
                {data.visit.status}
              </span>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="visit-title">
              Título
            </label>
            <input
              id="visit-title"
              name="title"
              className={inputClass}
              defaultValue={data.visit?.title ?? ""}
              required
              minLength={6}
              maxLength={90}
              placeholder="Un paseo por la Sevilla que no sale en las guías"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="visit-summary">
              Resumen
            </label>
            <input
              id="visit-summary"
              name="summary"
              className={inputClass}
              defaultValue={data.visit?.summary ?? ""}
              required
              minLength={24}
              maxLength={180}
              placeholder="Una frase para que se imaginen el paseo"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="visit-description">
              Descripción
            </label>
            <textarea
              id="visit-description"
              name="description"
              className={`${inputClass} min-h-32 resize-y`}
              defaultValue={data.visit?.description ?? ""}
              required
              minLength={80}
              maxLength={4000}
              placeholder="Cuenta qué descubrirán y cómo será la experiencia."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="visit-category">
                Categoría
              </label>
              <select
                id="visit-category"
                name="category"
                className={inputClass}
                defaultValue={data.visit?.category ?? "cultura"}
              >
                <option value="gastronomia">Gastronomía</option>
                <option value="cultura">Cultura</option>
                <option value="barrios">Barrios</option>
                <option value="tradiciones">Tradiciones</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="visit-neighborhood">
                Barrio
              </label>
              <input
                id="visit-neighborhood"
                name="neighborhood"
                className={inputClass}
                defaultValue={data.visit?.neighborhood ?? ""}
                required
                minLength={2}
                maxLength={80}
                placeholder="Triana"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="visit-duration">
                Duración (minutos)
              </label>
              <input
                id="visit-duration"
                name="durationMinutes"
                className={inputClass}
                type="number"
                min={30}
                max={480}
                step={15}
                defaultValue={data.visit?.durationMinutes ?? 120}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="visit-price">
                Precio por persona (€)
              </label>
              <input
                id="visit-price"
                name="price"
                className={inputClass}
                type="number"
                min={5}
                max={2000}
                step="0.50"
                defaultValue={data.visit ? (data.visit.pricePerPersonCents / 100).toFixed(2) : ""}
                required
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="visit-meeting-point">
              Punto de encuentro
            </label>
            <input
              id="visit-meeting-point"
              name="meetingPoint"
              className={inputClass}
              defaultValue={data.visit?.meetingPoint ?? ""}
              required
              minLength={3}
              maxLength={180}
              placeholder="Plaza del Altozano, junto al puente"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="visit-image">
              Imagen (URL https, opcional)
            </label>
            <input
              id="visit-image"
              name="imageUrl"
              type="url"
              className={inputClass}
              defaultValue={data.visit?.imageUrl ?? ""}
              placeholder="https://…"
            />
          </div>
          {error && (
            <p role="alert" className="inline-flex items-start gap-2 text-sm text-red-700">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="text-sm text-oliva-800">
              {success}
            </p>
          )}
          <div className="flex flex-wrap gap-2 border-t border-tinta-100 pt-4">
            <button
              name="status"
              value="draft"
              disabled={visitMutation.isPending}
              className="rounded-full border border-tinta-200 px-4 py-2.5 text-sm font-semibold text-tinta-700 hover:bg-crema-50 disabled:opacity-60"
            >
              Guardar borrador
            </button>
            <button
              name="status"
              value="published"
              disabled={visitMutation.isPending || data.profile?.verificationStatus !== "approved"}
              className="rounded-full bg-terracota-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-terracota-700 disabled:cursor-not-allowed disabled:opacity-50"
              title={
                data.profile?.verificationStatus !== "approved"
                  ? "La publicación estará disponible cuando se apruebe tu perfil."
                  : undefined
              }
            >
              {visitMutation.isPending
                ? "Guardando…"
                : data.profile?.verificationStatus === "approved"
                  ? "Publicar visita"
                  : "Pendiente de aprobación"}
            </button>
            {data.visit?.status === "published" && (
              <button
                name="status"
                value="paused"
                disabled={visitMutation.isPending}
                className="rounded-full border border-tinta-200 px-4 py-2.5 text-sm font-semibold text-tinta-700 hover:bg-crema-50 disabled:opacity-60"
              >
                Pausar
              </button>
            )}
          </div>
          {data.visit?.status === "published" && (
            <Link
              to={`/visitas/${data.visit.slug}`}
              className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-terracota-700 hover:underline"
            >
              Ver visita publicada <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          )}
        </form>

        <section className="card-surface p-5 sm:p-6" aria-labelledby="guide-schedule-title">
          <div>
            <h3
              id="guide-schedule-title"
              className="font-serif text-xl font-semibold text-tinta-800"
            >
              Fechas y aforo
            </h3>
            <p className="mt-1 text-sm text-tinta-500">Abre plazas para tu próxima visita.</p>
          </div>
          {data.visit ? (
            <form
              onSubmit={addSlot}
              className="mt-4 grid gap-3 sm:grid-cols-[1fr_130px_auto] sm:items-end"
            >
              <div>
                <label className={labelClass} htmlFor="slot-start">
                  Día y hora
                </label>
                <input
                  id="slot-start"
                  name="startsAt"
                  type="datetime-local"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="slot-capacity">
                  Plazas
                </label>
                <input
                  id="slot-capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  max={20}
                  defaultValue={8}
                  className={inputClass}
                  required
                />
              </div>
              <button
                disabled={slotMutation.isPending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-oliva-700 px-4 text-sm font-semibold text-white hover:bg-oliva-800 disabled:opacity-60"
              >
                <Plus aria-hidden="true" className="size-4" />
                Añadir
              </button>
            </form>
          ) : (
            <p className="mt-4 rounded-xl bg-crema-50 p-4 text-sm text-tinta-500">
              Guarda primero los datos de tu visita para añadir fechas.
            </p>
          )}
          {data.slots.length ? (
            <ul className="mt-5 divide-y divide-tinta-100">
              {data.slots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-tinta-800">
                      <Clock3 aria-hidden="true" className="size-4 text-terracota-600" />
                      {formatDate(slot.startsAt)}
                    </p>
                    <p className="mt-1 text-xs text-tinta-400">
                      Aforo: {slot.capacity} · {slot.active ? "Visible en el catálogo" : "Oculta"}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={slot.active}
                    disabled={toggleMutation.isPending}
                    onClick={() => toggleMutation.mutate({ slotId: slot.id, active: !slot.active })}
                    className={`w-fit rounded-full px-4 py-2 text-xs font-semibold ${slot.active ? "bg-oliva-100 text-oliva-800" : "bg-crema-100 text-tinta-600"}`}
                  >
                    {slot.active ? "Desactivar fecha" : "Activar fecha"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            data.visit && (
              <p className="mt-5 rounded-xl bg-crema-50 p-4 text-sm text-tinta-500">
                Todavía no has añadido fechas.
              </p>
            )
          )}
          <div className="mt-5 flex items-start gap-2 border-t border-tinta-100 pt-4 text-xs leading-5 text-tinta-400">
            <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            Una reserva pendiente bloquea sus plazas hasta 40 minutos; el enlace de pago de Stripe
            caduca antes.
          </div>
        </section>
      </div>
    </div>
  );
}
