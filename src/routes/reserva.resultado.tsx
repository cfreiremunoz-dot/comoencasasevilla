import { createFileRoute } from "@tanstack/react-router";
import { BookingResultPage } from "@/views/BookingResultPage";

export const Route = createFileRoute("/reserva/resultado")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
  }),
  head: () => ({
    meta: [{ title: "Reserva · ComoEnCasa" }, { name: "robots", content: "noindex" }],
  }),
  component: ReservationResultRoute,
});

function ReservationResultRoute() {
  const { session_id: sessionId } = Route.useSearch();
  return <BookingResultPage sessionId={sessionId} />;
}
