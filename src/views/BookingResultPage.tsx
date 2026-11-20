import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert, Clock3 } from "lucide-react";
import { publicApiRequest } from "@/lib/guide-api";

type BookingConfirmation = {
  status: "paid" | "pending" | "expired" | "invalid" | "unavailable";
  paymentModel?: "management_fee_15_cash_85" | "legacy";
  totalAmountCents?: number;
  paidOnlineCents?: number;
  cashDueCents?: number;
  guestCount?: number;
};

const money = (cents: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);

export function BookingResultPage({ sessionId }: { sessionId: string | undefined }) {
  const query = useQuery({
    queryKey: ["booking-confirmation", sessionId],
    queryFn: () =>
      publicApiRequest<BookingConfirmation>(
        `/api/bookings/confirm?session_id=${encodeURIComponent(sessionId ?? "")}`,
      ),
    enabled: Boolean(sessionId),
    refetchInterval: (state) => (state.state.data?.status === "pending" ? 2500 : false),
    retry: 1,
  });
  const status = query.data?.status;
  const paid = status === "paid";
  const expired = status === "expired";
  const invalid = !sessionId || status === "invalid" || query.isError;

  return (
    <main className="container-page flex min-h-[70vh] items-center justify-center pb-16 pt-28">
      <section className="card-surface w-full max-w-xl p-7 text-center sm:p-10" aria-live="polite">
        {paid ? (
          <CheckCircle2 aria-hidden="true" className="mx-auto size-12 text-oliva-700" />
        ) : expired || status === "invalid" || query.isError ? (
          <CircleAlert aria-hidden="true" className="mx-auto size-12 text-terracota-600" />
        ) : (
          <Clock3 aria-hidden="true" className="mx-auto size-12 text-albero-700" />
        )}
        <h1 className="mt-5 font-serif text-3xl font-semibold text-tinta-800">
          {paid
            ? "Tu plaza está confirmada"
            : expired
              ? "El enlace de pago ha caducado"
              : invalid
                ? "No pudimos confirmar el pago"
                : "Comprobando tu reserva"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-tinta-500">
          {paid
            ? query.data?.paymentModel === "management_fee_15_cash_85"
              ? "La señal de gestión del 15 % se ha cobrado online. Recuerda pagar el 85 % restante directamente al guía en efectivo el día de la visita. Stripe te enviará el recibo de la señal."
              : "Gracias por reservar una visita local en Sevilla. Stripe te enviará el recibo del pago."
            : expired
              ? "No se ha registrado ningún cargo. Vuelve a la visita para elegir otra fecha."
              : invalid
                ? "Si completaste el pago, espera un momento y revisa el correo del recibo de Stripe."
                : "Estamos verificando el estado de tu pago de forma segura."}
        </p>
        {paid && query.data?.totalAmountCents !== undefined && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl bg-crema-50 p-4 text-left text-sm">
            <p className="font-semibold text-tinta-800">Resumen del pago</p>
            <div className="mt-3 grid gap-2 text-tinta-600">
              <div className="flex items-center justify-between gap-4">
                <span>Precio total de la visita</span>
                <span>{money(query.data.totalAmountCents)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>
                  {query.data.paymentModel === "management_fee_15_cash_85"
                    ? "Pagado online · gestión (15 %)"
                    : "Pagado online"}
                </span>
                <span>{money(query.data.paidOnlineCents ?? 0)}</span>
              </div>
              {query.data.cashDueCents ? (
                <div className="flex items-center justify-between gap-4 border-t border-tinta-100 pt-2 font-semibold text-tinta-800">
                  <span>Efectivo al guía · restante (85 %)</span>
                  <span>{money(query.data.cashDueCents)}</span>
                </div>
              ) : null}
            </div>
          </div>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/experiencias"
            className="rounded-full bg-terracota-600 px-5 py-3 text-sm font-semibold text-white hover:bg-terracota-700"
          >
            Volver a experiencias
          </Link>
          <Link
            to="/"
            className="rounded-full border border-tinta-200 px-5 py-3 text-sm font-semibold text-tinta-700 hover:bg-crema-50"
          >
            Ir al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
