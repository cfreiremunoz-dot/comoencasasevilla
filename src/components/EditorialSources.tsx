import { ExternalLink } from "lucide-react";
import type { EditorialSource } from "@/data/types";

export function EditorialSources({ sources }: { sources?: EditorialSource[] }) {
  if (!sources?.length) return null;

  return (
    <section
      className="mt-8 rounded-2xl border border-albero-200 bg-crema-100/70 p-5"
      aria-labelledby="editorial-sources-title"
    >
      <h2 id="editorial-sources-title" className="font-serif text-xl font-semibold text-tinta-800">
        Fuentes para planificar
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-tinta-600">
        Esta es una propuesta editorial: los tiempos y distancias son aproximados. Comprueba
        horarios, precios, reservas y accesos con cada lugar antes de ir.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-terracota-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota-700"
            >
              {source.label}
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(se abre en una pestaña nueva)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
