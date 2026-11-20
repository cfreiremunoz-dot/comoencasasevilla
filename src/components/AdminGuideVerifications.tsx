import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock3, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/guide-api";

type AdminGuideProfile = {
  id: string;
  displayName: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  verificationStatus: "pending" | "approved" | "rejected";
  verificationNotes: string | null;
  verifiedAt: string | null;
};

type ReviewInput = {
  guideId: string;
  status: "approved" | "rejected";
  notes: string;
};

const statusLabels = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Requiere cambios",
} as const;

const reviewedAt = (value: string) =>
  new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(value));

export function AdminGuideVerifications() {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const profilesQuery = useQuery({
    queryKey: ["admin-guide-verifications"],
    queryFn: () => apiRequest<{ profiles: AdminGuideProfile[] }>("/api/admin/guides"),
  });
  const reviewMutation = useMutation({
    mutationFn: (input: ReviewInput) =>
      apiRequest<{ profile: AdminGuideProfile }>("/api/admin/guides", {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: ({ profile }) => {
      toast.success(
        profile.verificationStatus === "approved" ? "Guía aprobada" : "Revisión guardada",
      );
      void queryClient.invalidateQueries({ queryKey: ["admin-guide-verifications"] });
    },
    onError: (error) => toast.error(error.message || "No se pudo guardar la revisión."),
  });

  const profiles = profilesQuery.data?.profiles ?? [];
  const pendingCount = profiles.filter(
    (profile) => profile.verificationStatus === "pending",
  ).length;

  return (
    <section
      className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-crema-300"
      aria-labelledby="guide-verification-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="guide-verification-title"
            className="font-serif text-2xl font-semibold text-tinta-800"
          >
            Verificación de guías
          </h2>
          <p className="mt-1 text-sm text-tinta-500">
            Revisa los perfiles antes de que sus visitas aparezcan en el catálogo.
          </p>
        </div>
        <span
          className="rounded-full bg-crema-100 px-3 py-1 text-xs font-semibold text-tinta-700"
          aria-label={`${pendingCount} perfiles pendientes`}
        >
          {pendingCount} pendientes
        </span>
      </div>

      {profilesQuery.isPending ? (
        <p className="mt-5 text-sm text-tinta-500" role="status">
          Cargando perfiles…
        </p>
      ) : profilesQuery.isError ? (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">
          {profilesQuery.error.message}
        </p>
      ) : profiles.length === 0 ? (
        <p className="mt-5 rounded-xl bg-crema-50 p-4 text-sm text-tinta-600">
          Todavía no hay perfiles de guía para revisar.
        </p>
      ) : (
        <ul className="mt-5 grid gap-4">
          {profiles.map((profile) => {
            const isPending = profile.verificationStatus === "pending";
            const noteValue = notes[profile.id] ?? profile.verificationNotes ?? "";
            return (
              <li key={profile.id} className="rounded-xl border border-crema-200 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-tinta-800">{profile.displayName}</h3>
                    <p className="mt-1 text-xs text-tinta-400">
                      Solicitud del {reviewedAt(profile.createdAt)}
                      {profile.verifiedAt ? ` · Revisado el ${reviewedAt(profile.verifiedAt)}` : ""}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      profile.verificationStatus === "approved"
                        ? "bg-oliva-100 text-oliva-800"
                        : profile.verificationStatus === "rejected"
                          ? "bg-red-50 text-red-800"
                          : "bg-crema-100 text-tinta-700"
                    }`}
                  >
                    {profile.verificationStatus === "approved" ? (
                      <ShieldCheck aria-hidden="true" className="size-3.5" />
                    ) : (
                      <Clock3 aria-hidden="true" className="size-3.5" />
                    )}
                    {statusLabels[profile.verificationStatus]}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-tinta-600">
                  {profile.bio}
                </p>

                {isPending ? (
                  <div className="mt-4 grid gap-3">
                    <div>
                      <label
                        htmlFor={`guide-review-notes-${profile.id}`}
                        className="mb-1.5 block text-sm font-medium text-tinta-700"
                      >
                        Observaciones para la guía
                      </label>
                      <textarea
                        id={`guide-review-notes-${profile.id}`}
                        value={noteValue}
                        onChange={(event) =>
                          setNotes((current) => ({ ...current, [profile.id]: event.target.value }))
                        }
                        maxLength={2000}
                        rows={3}
                        className="w-full resize-y rounded-xl border border-crema-300 px-3 py-2 text-sm text-tinta-700 outline-none focus:border-terracota-500 focus:ring-2 focus:ring-terracota-500/20"
                        placeholder="Opcional al aprobar; explica los cambios necesarios si rechazas el perfil."
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={reviewMutation.isPending}
                        onClick={() =>
                          reviewMutation.mutate({
                            guideId: profile.id,
                            status: "approved",
                            notes: noteValue,
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-oliva-700 px-4 py-2 text-sm font-semibold text-white hover:bg-oliva-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Check aria-hidden="true" className="size-4" /> Aprobar guía
                      </button>
                      <button
                        type="button"
                        disabled={reviewMutation.isPending || noteValue.trim().length === 0}
                        onClick={() =>
                          reviewMutation.mutate({
                            guideId: profile.id,
                            status: "rejected",
                            notes: noteValue,
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X aria-hidden="true" className="size-4" /> Solicitar cambios
                      </button>
                    </div>
                  </div>
                ) : profile.verificationNotes ? (
                  <p className="mt-4 rounded-xl bg-crema-50 p-3 text-sm leading-6 text-tinta-600">
                    <span className="font-semibold text-tinta-800">Observaciones: </span>
                    {profile.verificationNotes}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
