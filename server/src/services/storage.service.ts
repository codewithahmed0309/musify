import { randomUUID } from "crypto";
import { Readable } from "stream";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { supabase } from "../config/supabase.js";
import { cloudinary } from "../config/cloudinary.js";
import { AppError } from "../utils/AppError.js";

const BUCKET = "media";
const CLOUDINARY_FOLDER = "musify";

// Images (song covers, album covers, artist/playlist images) go to
// Cloudinary — it gives us on-the-fly transforms/CDN delivery for free and
// keeps the Supabase Storage bucket reserved for audio, which is what it's
// actually sized for. Audio keeps going through Supabase Storage exactly as
// before.
function uploadImageBuffer(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${CLOUDINARY_FOLDER}/covers`,
        resource_type: "image",
        public_id: randomUUID(),
        // Sensible ceiling so a huge phone photo doesn't get stored at full
        // resolution just to be displayed as a ~300px cover — Cloudinary
        // resizes on upload, not just on delivery.
        transformation: [{ width: 2000, height: 2000, crop: "limit" }],
      },
      (error: UploadApiErrorResponse | undefined, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

async function uploadImageToCloudinary(file: Express.Multer.File): Promise<string> {
  try {
    const result = await uploadImageBuffer(file.buffer);
    return result.secure_url;
  } catch (err) {
    throw new AppError(
      `Image upload failed: ${(err as Error).message ?? "unknown Cloudinary error"}`,
      502
    );
  }
}

async function uploadAudioToSupabase(file: Express.Multer.File): Promise<string> {
  const ext = file.originalname.split(".").pop() ?? "bin";
  const path = `audio/${randomUUID()}.${ext}`;

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

export async function uploadFile(
  file: Express.Multer.File,
  folder: "covers" | "audio"
): Promise<string> {
  if (folder === "covers") {
    return uploadImageToCloudinary(file);
  }
  return uploadAudioToSupabase(file);
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

// A Cloudinary delivery URL looks like:
//   https://res.cloudinary.com/<cloud>/image/upload/v169.../musify/covers/<public_id>.<ext>
// The public_id is everything after the optional version segment, minus the
// file extension — that's what `uploader.destroy` needs.
function extractCloudinaryPublicId(url: string): string | null {
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  let rest = url.slice(idx + marker.length);
  rest = rest.replace(/^v\d+\//, "");
  const dot = rest.lastIndexOf(".");
  return dot === -1 ? rest : rest.slice(0, dot);
}

// Best-effort deletion of a previously-uploaded file, given its public URL.
// Used when a song/album/artist/playlist is removed or has its image
// replaced, so we don't leave orphaned files sitting in storage forever.
// Never throws — a failed cleanup shouldn't block the caller from finishing
// (the DB row is the source of truth).
export async function deleteFileByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return;

  if (url.includes("res.cloudinary.com")) {
    const publicId = extractCloudinaryPublicId(url);
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (err) {
      console.error(
        `[storage cleanup] failed to delete Cloudinary asset "${publicId}":`,
        (err as Error).message
      );
    }
    return;
  }

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
