import type { Request, Response } from "express";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { uploadFile } from "../services/storage.service.js";

// Browsers report .m4a (and other audio) mimetypes inconsistently —
// audio/mp4, audio/x-m4a, video/mp4 (m4a is technically an MP4 container),
// or nothing at all on some Windows setups. We check mimetype loosely and
// always fall back to file extension, since the whole file is already
// safely in memory by the time this runs (no stream to worry about).
const ALLOWED_AUDIO_EXT = new Set([".mp3", ".m4a", ".wav", ".flac", ".aac", ".ogg"]);
const ALLOWED_IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const ALLOWED_AUDIO_MIME_PREFIX = ["audio/", "video/mp4"]; // m4a often reports as video/mp4
const ALLOWED_IMAGE_MIME_PREFIX = ["image/"];

function isAllowed(file: Express.Multer.File, kind: "audio" | "covers"): boolean {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk =
    kind === "audio"
      ? ALLOWED_AUDIO_MIME_PREFIX.some((p) => file.mimetype.startsWith(p))
      : ALLOWED_IMAGE_MIME_PREFIX.some((p) => file.mimetype.startsWith(p));
  const extOk = kind === "audio" ? ALLOWED_AUDIO_EXT.has(ext) : ALLOWED_IMAGE_EXT.has(ext);

  // Accept if either signal looks right — browsers are unreliable about
  // mimetype for less common containers like .m4a, so we don't want a
  // false-negative mimetype to block a legitimate file.
  return mimeOk || extOk;
}

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const folder = req.body.folder === "audio" ? "audio" : "covers";

  if (!file) {
    throw new AppError("No file provided", 400);
  }

  if (!isAllowed(file, folder)) {
    throw new AppError(
      `Unsupported file type for ${folder}: ${file.mimetype || "unknown"} (${file.originalname})`,
      400
    );
  }

  const url = await uploadFile(file, folder);
  res.status(201).json({ url });
});
