import { createFileRoute } from "@tanstack/react-router";
import { GuidePortalPage } from "@/views/GuidePortalPage";

export const Route = createFileRoute("/guia")({
  head: () => ({
    meta: [
      { title: "Publica una visita · ComoEnCasa" },
      {
        name: "description",
        content: "Crea una visita local en Sevilla, gestiona tus fechas y recibe reservas.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GuidePortalPage,
});
