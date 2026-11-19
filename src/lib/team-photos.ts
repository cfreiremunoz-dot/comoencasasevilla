import { supabase } from "@/integrations/supabase/client";

const TEAM_PHOTO_BUCKET = "about-team-photos";
const MAX_TEAM_PHOTO_SIZE = 5 * 1024 * 1024;
const EXTENSIONS_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadTeamPhoto(file: File): Promise<string> {
  const extension = EXTENSIONS_BY_MIME_TYPE[file.type];
  if (!extension) throw new Error("Elige una foto JPG, PNG o WebP.");
  if (file.size > MAX_TEAM_PHOTO_SIZE) throw new Error("La foto no puede superar los 5 MB.");

  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(TEAM_PHOTO_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error("No se pudo subir la foto. Inténtalo de nuevo.");

  return supabase.storage.from(TEAM_PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}
