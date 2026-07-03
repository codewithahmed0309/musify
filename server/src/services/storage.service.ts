import { randomUUID } from "crypto";
import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/AppError.js";

const BUCKET = "media";

export async function uploadFile(
  file: Express.Multer.File,
  folder: "covers" | "audio"
): Promise<string> {
  const ext = file.originalname.split(".").pop() ?? "bin";
  const path = `${folder}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    if (isStorageQuotaError(error)) {
      throw new AppError(
        "Storage is full — the Supabase bucket has hit its size limit. Delete some files or upgrade your plan, then try again.",
        507 // Insufficient Storage
      );
    }
    throw new AppError(`Upload failed: ${error.message}`, 500);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Supabase Storage doesn't expose a single stable error code for "project
// storage quota exceeded" across all plans/versions, so we match on the
// wording it's known to return. This deliberately stays narrow — if it
// doesn't match, the caller still gets a real error, just a less specific
// message, which is safer than false-positively calling something a quota
// issue when it's actually a different failure.
function isStorageQuotaError(error: { message?: string; statusCode?: string }): boolean {
  const text = `${error.message ?? ""} ${error.statusCode ?? ""}`.toLowerCase();
  return (
    text.includes("quota") ||
    text.includes("insufficient storage") ||
    text.includes("507") ||
    text.includes("storage limit")
  );
}

// Best-effort deletion of a previously-uploaded file, given its public URL.
// Used when a song is removed so we don't leave orphaned audio/cover files
// sitting in storage forever. Never throws — a failed cleanup shouldn't
// block the caller from finishing (the DB row is the source of truth).
export async function deleteFileByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return;

  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return; // not a URL we recognize (e.g. external), skip

  const path = decodeURIComponent(url.slice(idx + marker.length));
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error(`[storage cleanup] failed to delete "${path}":`, error.message);
  }
}
