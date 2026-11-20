import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert, Clock3 } from "lucide-react";
import { publicApiRequest } from "@/lib/guide-api";

export function BookingResultPage({ sessionId }: { sessionId: string | undefined }) {
  const query = useQuery({
    queryKey: ["booking-confirmation", sessionId],
    queryFn: () =>
      publicApiRequest<{ status: "paid" | "pending" | "expired" | "invalid" | "unavailable" }>(
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
            ? "Gracias por reservar una visita local en Sevilla. Stripe te enviará el recibo del pago."
            : expired
              ? "No se ha registrado ningún cargo. Vuelve a la visita para elegir otra fecha."
              : invalid
                ? "Si completaste el pago, espera un momento y revisa el correo del recibo de Stripe."
                : "Estamos verificando el estado de tu pago de forma segura."}
        </p>
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
