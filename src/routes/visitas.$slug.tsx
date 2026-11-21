import { createFileRoute } from "@tanstack/react-router";
import { GuidedVisitDetailPage } from "@/views/GuidedVisitDetailPage";

export const Route = createFileRoute("/visitas/$slug")({
  head: () => ({
    meta: [
      { title: "Visita local en Sevilla · ComoEnCasa" },
      {
        name: "description",
        content: "Reserva una experiencia auténtica con un guía local de Sevilla.",
      },
    ],
  }),
  component: GuidedVisitDetailPage,
});
