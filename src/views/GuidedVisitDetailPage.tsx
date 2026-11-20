import { useRef, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, MapPin, Users } from "lucide-react";
import { publicApiRequest, apiRequest } from "@/lib/guide-api";
import type { PublicGuidedVisit } from "@/lib/guide-types";

const money = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
const longDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function GuidedVisitDetailPage() {
  const { slug } = useParams({ from: "/visitas/$slug" });
  const [slotId, setSlotId] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const checkoutWindowRef = useRef<Window | null>(null);
  const visitQuery = useQuery({
    queryKey: ["guided-visit", slug],
    queryFn: () =>
      publicApiRequest<{ visit: PublicGuidedVisit | null }>(
        `/api/visits?slug=${encodeURIComponent(slug)}`,
      ),
  });
  const bookingMutation = useMutation({
    mutationFn: (input: { slotId: string; guestCount: number; idempotencyKey: string }) =>
      apiRequest<{ checkoutUrl: string }>("/api/bookings/checkout", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: ({ checkoutUrl }) => {
      const checkoutWindow = checkoutWindowRef.current;
      checkoutWindowRef.current = null;
      if (checkoutWindow) {
        if (checkoutWindow.closed) {
          setCheckoutError("La pestaña de pago se cerró. Vuelve a intentarlo.");
          return;
        }
        checkoutWindow.opener = null;
        checkoutWindow.location.replace(checkoutUrl);
        return;
      }
      window.location.assign(checkoutUrl);
    },
    onError: () => {
      checkoutWindowRef.current?.close();
      checkoutWindowRef.current = null;
    },
  });

  const visit = visitQuery.data?.visit;
  const selectedSlot = visit?.slots.find((slot) => slot.id === slotId);
  const availableSlots = visit?.slots ?? [];
  const total = visit ? visit.pricePerPersonCents * guestCount : 0;
  const managementFee = Math.round((total * 15) / 100);
  const cashDue = total - managementFee;

  function startCheckout() {
    if (!slotId || !acceptedTerms) return;
    setCheckoutError("");

    if (window.self !== window.top) {
      const checkoutWindow = window.open("about:blank", "_blank");
      if (!checkoutWindow) {
        setCheckoutError(
          "El navegador ha bloqueado la pestaña de pago. Permite las ventanas emergentes e inténtalo de nuevo.",
        );
        return;
      }
      checkoutWindowRef.current = checkoutWindow;
    }

    bookingMutation.mutate({ slotId, guestCount, idempotencyKey: crypto.randomUUID() });
  }

  if (visitQuery.isLoading)
    return (
      <main className="container-page pb-20 pt-32">
        <p role="status">Cargando visita…</p>
      </main>
    );
  if (visitQuery.isError || !visit)
    return (
      <main className="container-page pb-20 pt-32">
        <Link
          to="/experiencias"
          className="inline-flex items-center gap-2 text-sm font-medium text-terracota-700"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Volver a experiencias
        </Link>
        <h1 className="mt-8 font-serif text-3xl font-semibold text-tinta-800">
          No encontramos esta visita
        </h1>
        <p className="mt-2 text-tinta-500">Puede que ya no esté disponible.</p>
      </main>
    );

  return (
    <main className="animate-fade-in pb-20 pt-24 sm:pt-28">
      <div className="container-page">
        <Link
          to="/experiencias"
          className="inline-flex items-center gap-2 text-sm font-medium text-terracota-700 transition-colors hover:text-terracota-800"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Todas las experiencias
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:gap-12">
          <section>
            {visit.imageUrl && (
              <img
                src={visit.imageUrl}
                alt={`Vista de ${visit.title}`}
                className="aspect-[16/9] w-full rounded-3xl object-cover"
              />
            )}
            <div
              className={`${visit.imageUrl ? "mt-7" : "rounded-3xl bg-gradient-to-br from-oliva-100 via-crema-100 to-albero-100 p-7 sm:p-10"}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracota-600">
                {visit.category} · {visit.neighborhood}
              </p>
              <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight text-tinta-800 sm:text-5xl">
                {visit.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-tinta-600 sm:text-lg">
                {visit.summary}
              </p>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="card-surface p-5">
                <h2 className="font-serif text-xl font-semibold text-tinta-800">El paseo</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-tinta-600">
                  {visit.description}
                </p>
              </div>
              <div className="card-surface p-5">
                <h2 className="font-serif text-xl font-semibold text-tinta-800">Tu guía local</h2>
                <p className="mt-2 font-medium text-tinta-800">{visit.guide.displayName}</p>
                <p className="mt-2 text-sm leading-6 text-tinta-500">{visit.guide.bio}</p>
                <div className="mt-5 flex flex-col gap-3 border-t border-tinta-100 pt-4 text-sm text-tinta-600">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 aria-hidden="true" className="size-4 text-terracota-600" />{" "}
                    {visit.durationMinutes} minutos
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin aria-hidden="true" className="size-4 text-terracota-600" />{" "}
                    {visit.meetingPoint}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-tinta-100 bg-white p-5 shadow-lg shadow-tinta-900/5 sm:p-7 lg:sticky lg:top-28">
            <p className="text-sm text-tinta-500">Por persona</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-tinta-800">
              {money(visit.pricePerPersonCents)}
            </p>
            <p className="mt-2 text-sm leading-6 text-tinta-500">
              Reserva tu plaza en el grupo. El pago se completa de forma segura en Stripe.
            </p>

            {availableSlots.length ? (
              <div className="mt-6 grid gap-4">
                <div>
                  <label
                    htmlFor="visit-slot"
                    className="mb-2 block text-sm font-semibold text-tinta-700"
                  >
                    Elige día y hora
                  </label>
                  <select
                    id="visit-slot"
                    value={slotId}
                    onChange={(event) => setSlotId(event.target.value)}
                    className="w-full rounded-xl border border-crema-300 bg-white px-3 py-3 text-sm text-tinta-700 outline-none focus:border-terracota-500 focus:ring-2 focus:ring-terracota-500/20"
                  >
                    <option value="">Selecciona una fecha</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {longDate(slot.startsAt)} · {slot.available}{" "}
                        {slot.available === 1 ? "plaza" : "plazas"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="guest-count"
                    className="mb-2 block text-sm font-semibold text-tinta-700"
                  >
                    Personas
                  </label>
                  <select
                    id="guest-count"
                    value={guestCount}
                    onChange={(event) => setGuestCount(Number(event.target.value))}
                    className="w-full rounded-xl border border-crema-300 bg-white px-3 py-3 text-sm text-tinta-700 outline-none focus:border-terracota-500 focus:ring-2 focus:ring-terracota-500/20"
                  >
                    {Array.from(
                      { length: Math.min(20, selectedSlot?.available ?? 20) },
                      (_, index) => index + 1,
                    ).map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? "persona" : "personas"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-2xl bg-crema-50 p-4">
                  <div className="flex items-center justify-between text-sm text-tinta-600">
                    <span>
                      {guestCount} × {money(visit.pricePerPersonCents)}
                    </span>
                    <span>{money(total)}</span>
                  </div>
                  <div className="mt-3 grid gap-2 border-t border-tinta-100 pt-3 text-sm">
                    <div className="flex items-center justify-between font-semibold text-tinta-800">
                      <span>Pagas ahora · gestión (15 %)</span>
                      <span>{money(managementFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-tinta-600">
                      <span>En efectivo al guía · (85 %)</span>
                      <span>{money(cashDue)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-tinta-100 pt-2 font-medium text-tinta-700">
                      <span>Precio total de la visita</span>
                      <span>{money(total)}</span>
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-3 text-xs leading-5 text-tinta-500">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    className="mt-0.5 size-4 rounded border-crema-400 accent-terracota-600"
                  />
                  <span>
                    Acepto el{" "}
                    <Link to="/aviso-legal" className="underline underline-offset-2">
                      aviso legal
                    </Link>{" "}
                    y la{" "}
                    <Link to="/privacidad" className="underline underline-offset-2">
                      política de privacidad
                    </Link>
                    .
                  </span>
                </label>
                {(bookingMutation.isError || checkoutError) && (
                  <p role="alert" className="text-sm text-red-700">
                    {checkoutError ||
                      bookingMutation.error?.message ||
                      "No se pudo iniciar el pago."}
                  </p>
                )}
                <button
                  type="button"
                  disabled={!slotId || !acceptedTerms || bookingMutation.isPending}
                  onClick={startCheckout}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-terracota-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracota-700 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {bookingMutation.isPending ? (
                    "Preparando pago…"
                  ) : (
                    <>
                      <CalendarDays aria-hidden="true" className="size-4" /> Pagar señal del 15 %
                    </>
                  )}
                </button>
                <p className="text-center text-xs leading-5 text-tinta-500">
                  El 85 % restante se paga en efectivo directamente al guía el día de la visita.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-crema-50 p-4 text-sm leading-6 text-tinta-600">
                <p className="inline-flex items-center gap-2 font-semibold text-tinta-800">
                  <Users aria-hidden="true" className="size-4" /> No hay fechas disponibles
                </p>
                <p className="mt-2">
                  Vuelve pronto para ver nuevas fechas de {visit.guide.displayName}.
                </p>
              </div>
            )}
            <div className="mt-5 flex items-center gap-2 border-t border-tinta-100 pt-4 text-xs text-tinta-400">
              <CheckCircle2 aria-hidden="true" className="size-4 text-oliva-600" /> Pago procesado
              de forma segura por Stripe
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
