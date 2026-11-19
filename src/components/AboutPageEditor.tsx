import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  ABOUT_PAGE_DEFAULTS,
  aboutPageContentSchema,
  type AboutPageContent,
  type AboutSummaryIcon,
  useAboutPageContent,
} from "@/lib/about-page-content";

const buttonClass =
  "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const fieldClass =
  "mt-1.5 w-full rounded-xl border border-crema-300 bg-white px-4 py-2.5 text-sm text-tinta-800 outline-none transition focus:border-terracota-400 focus:ring-2 focus:ring-terracota-100";
const summaryIconLabels: Record<AboutSummaryIcon, string> = {
  heart: "Corazón",
  map: "Mapa",
  users: "Comunidad",
  bag: "Comercio",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-tinta-700">
      {label}
      {children}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  maxLength = 160,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <Field label={label}>
      <input
        className={fieldClass}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  maxLength = 1000,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <Field label={label}>
      <textarea
        className={fieldClass}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function ParagraphList({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-semibold text-tinta-700">Texto principal</legend>
      {values.map((value, index) => (
        <div key={index} className="rounded-xl bg-crema-50 p-3">
          <TextareaField
            label={`Párrafo ${index + 1}`}
            value={value}
            maxLength={3000}
            rows={4}
            onChange={(next) =>
              onChange(values.map((item, itemIndex) => (itemIndex === index ? next : item)))
            }
          />
          <button
            type="button"
            className={`${buttonClass} mt-2 bg-white text-terracota-700 ring-1 ring-crema-300`}
            aria-label={`Eliminar párrafo ${index + 1}`}
            onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
            disabled={values.length <= 1}
          >
            Quitar párrafo
          </button>
        </div>
      ))}
      <button
        type="button"
        className={`${buttonClass} bg-crema-200 text-tinta-700`}
        onClick={() => onChange([...values, ""])}
        disabled={values.length >= 8}
      >
        + Añadir párrafo
      </button>
    </fieldset>
  );
}

function SummaryItemsEditor({
  values,
  onChange,
}: {
  values: AboutPageContent["summaryItems"];
  onChange: (values: AboutPageContent["summaryItems"]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-semibold text-tinta-700">Ideas principales</legend>
      {values.map((item, index) => (
        <div
          key={index}
          className="grid gap-2 rounded-xl bg-crema-50 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
        >
          <Field label={`Icono · ${summaryIconLabels[item.icon]}`}>
            <input
              className={fieldClass}
              value={item.text}
              maxLength={300}
              aria-label={`Idea principal ${index + 1}`}
              onChange={(event) =>
                onChange(
                  values.map((current, itemIndex) =>
                    itemIndex === index ? { ...current, text: event.target.value } : current,
                  ),
                )
              }
            />
          </Field>
          <button
            type="button"
            className={`${buttonClass} bg-white text-terracota-700 ring-1 ring-crema-300`}
            aria-label={`Eliminar idea principal ${index + 1}`}
            onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
            disabled={values.length <= 1}
          >
            Quitar
          </button>
        </div>
      ))}
      <button
        type="button"
        className={`${buttonClass} bg-crema-200 text-tinta-700`}
        onClick={() => onChange([...values, { icon: "heart", text: "" }])}
        disabled={values.length >= 12}
      >
        + Añadir idea
      </button>
    </fieldset>
  );
}

function ValuesEditor({
  values,
  onChange,
}: {
  values: AboutPageContent["values"];
  onChange: (values: AboutPageContent["values"]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-semibold text-tinta-700">Bloques de valores</legend>
      {values.map((item, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-xl bg-crema-50 p-3">
          <TextField
            label={`Título del bloque ${index + 1}`}
            value={item.title}
            onChange={(title) =>
              onChange(
                values.map((current, itemIndex) =>
                  itemIndex === index ? { ...current, title } : current,
                ),
              )
            }
          />
          <TextareaField
            label={`Texto del bloque ${index + 1}`}
            value={item.text}
            maxLength={1000}
            onChange={(text) =>
              onChange(
                values.map((current, itemIndex) =>
                  itemIndex === index ? { ...current, text } : current,
                ),
              )
            }
          />
          <button
            type="button"
            className={`${buttonClass} bg-white text-terracota-700 ring-1 ring-crema-300`}
            aria-label={`Eliminar bloque ${index + 1}`}
            onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
            disabled={values.length <= 1}
          >
            Quitar bloque
          </button>
        </div>
      ))}
      <button
        type="button"
        className={`${buttonClass} bg-crema-200 text-tinta-700`}
        onClick={() => onChange([...values, { title: "", text: "" }])}
        disabled={values.length >= 8}
      >
        + Añadir bloque
      </button>
    </fieldset>
  );
}

export function AboutPageEditor() {
  const queryClient = useQueryClient();
  const page = useAboutPageContent();
  const [draft, setDraft] = useState<AboutPageContent>(ABOUT_PAGE_DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (page.data) setDraft(page.data);
  }, [page.data]);

  function set<K extends keyof AboutPageContent>(key: K, value: AboutPageContent[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = aboutPageContentSchema.safeParse(draft);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los campos antes de guardar");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("site_pages").upsert({
        slug: "sobre",
        content: parsed.data as unknown as Json,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        toast.error("No se pudo guardar la página");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["site_pages", "sobre"] });
      toast.success("Página «Sobre el proyecto» guardada");
    } catch {
      toast.error("No se pudo guardar la página");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-12 rounded-2xl bg-white p-6 ring-1 ring-crema-300">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracota-500">
            Página pública
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-tinta-800">
            Sobre el proyecto
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-tinta-500">
            Edita titulares, descripciones y bloques. Los cambios se publican al guardar.
          </p>
        </div>
        <a
          className={`${buttonClass} bg-crema-200 text-tinta-700`}
          href="/sobre"
          target="_blank"
          rel="noreferrer"
        >
          Ver página
        </a>
      </div>

      {page.isError && (
        <p className="mt-4 rounded-xl bg-terracota-50 p-3 text-sm text-terracota-700" role="alert">
          No se pudo cargar el contenido guardado. Revisa la conexión e inténtalo de nuevo.
        </p>
      )}
      {page.isLoading && (
        <p className="mt-4 text-sm text-tinta-500" role="status">
          Cargando contenido…
        </p>
      )}

      <form className="mt-6 flex flex-col gap-6" onSubmit={(event) => void save(event)}>
        <fieldset
          disabled={page.isLoading || page.isError || saving}
          className="flex flex-col gap-6 disabled:opacity-70"
          aria-busy={saving}
        >
          <section className="grid gap-4 rounded-2xl bg-crema-50 p-4 sm:grid-cols-2">
            <h3 className="font-serif text-lg font-semibold text-tinta-800 sm:col-span-2">
              Cabecera
            </h3>
            <TextField
              label="Antetítulo"
              value={draft.eyebrow}
              onChange={(value) => set("eyebrow", value)}
              maxLength={100}
            />
            <TextField
              label="Título"
              value={draft.title}
              onChange={(value) => set("title", value)}
              maxLength={120}
            />
            <div className="sm:col-span-2">
              <TextareaField
                label="Descripción"
                value={draft.description}
                onChange={(value) => set("description", value)}
                maxLength={1000}
                rows={3}
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl bg-crema-50 p-4">
            <h3 className="font-serif text-lg font-semibold text-tinta-800">
              Por qué existe el proyecto
            </h3>
            <TextField
              label="Título de sección"
              value={draft.missionTitle}
              onChange={(value) => set("missionTitle", value)}
            />
            <ParagraphList
              values={draft.missionParagraphs}
              onChange={(value) => set("missionParagraphs", value)}
            />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl bg-crema-50 p-4">
            <h3 className="font-serif text-lg font-semibold text-tinta-800">En pocas palabras</h3>
            <TextField
              label="Título de sección"
              value={draft.summaryTitle}
              onChange={(value) => set("summaryTitle", value)}
              maxLength={120}
            />
            <SummaryItemsEditor
              values={draft.summaryItems}
              onChange={(value) => set("summaryItems", value)}
            />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl bg-crema-50 p-4">
            <h3 className="font-serif text-lg font-semibold text-tinta-800">
              Lo que nos diferencia
            </h3>
            <TextField
              label="Título de sección"
              value={draft.valuesTitle}
              onChange={(value) => set("valuesTitle", value)}
            />
            <ValuesEditor values={draft.values} onChange={(value) => set("values", value)} />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl bg-crema-50 p-4">
            <h3 className="font-serif text-lg font-semibold text-tinta-800">
              Proyecto universitario
            </h3>
            <TextField
              label="Título de sección"
              value={draft.projectTitle}
              onChange={(value) => set("projectTitle", value)}
            />
            <TextareaField
              label="Texto"
              value={draft.projectText}
              onChange={(value) => set("projectText", value)}
              maxLength={1500}
              rows={4}
            />
          </section>

          <section className="grid gap-4 rounded-2xl bg-crema-50 p-4 sm:grid-cols-2">
            <h3 className="font-serif text-lg font-semibold text-tinta-800 sm:col-span-2">
              Llamada a la acción
            </h3>
            <div className="sm:col-span-2">
              <TextField
                label="Título"
                value={draft.ctaTitle}
                onChange={(value) => set("ctaTitle", value)}
              />
            </div>
            <TextField
              label="Botón de explorar lugares"
              value={draft.exploreLabel}
              onChange={(value) => set("exploreLabel", value)}
              maxLength={80}
            />
            <TextField
              label="Botón de rutas locales"
              value={draft.routesLabel}
              onChange={(value) => set("routesLabel", value)}
              maxLength={80}
            />
          </section>
        </fieldset>

        <button
          type="submit"
          disabled={page.isLoading || page.isError || saving}
          className={`${buttonClass} bg-terracota-500 text-white hover:bg-terracota-600`}
        >
          {saving ? "Guardando…" : "Guardar página"}
        </button>
      </form>
    </section>
  );
}
