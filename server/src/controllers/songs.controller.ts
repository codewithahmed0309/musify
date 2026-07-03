import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import {
  getAllSongs,
  getOrCreateArtist,
  getOrCreateAlbum,
  createSong,
  updateSong,
  deleteSong,
} from "../services/songs.service.js";
import { deleteFileByUrl } from "../services/storage.service.js";

export const listSongs = asyncHandler(async (_req: Request, res: Response) => {
  const songs = await getAllSongs();
  res.json(songs);
});
export const addSong = asyncHandler(async (req: Request, res: Response) => {
  const { title, artistName, albumTitle, coverUrl, audioUrl, durationSeconds } = req.body as {
    title?: string;
    artistName?: string;
    albumTitle?: string;
    coverUrl?: string;
    audioUrl?: string;
    durationSeconds?: number;
  };

  if (!title || !artistName || !audioUrl) {
    throw new AppError("title, artistName, and audioUrl are required", 400);
  }

  const artistId = await getOrCreateArtist(artistName);

  let albumId: string | null = null;
  if (albumTitle) {
    albumId = await getOrCreateAlbum(albumTitle, artistId, coverUrl);
  }

  const song = await createSong({
    title,
    artistId,
    albumId,
    coverUrl: coverUrl ?? null,
    audioUrl,
    durationSeconds: durationSeconds ?? 0,
  });

  res.status(201).json(song);
});
export const updateSongHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, albumTitle, coverUrl } = req.body as {
    title?: string;
    albumTitle?: string | null;
    coverUrl?: string | null;
  };

  if (title === undefined && albumTitle === undefined && coverUrl === undefined) {
    throw new AppError("Provide at least one of: title, albumTitle, coverUrl", 400);
  }

  const song = await updateSong(id, { title, albumTitle, coverUrl });
  res.json(song);
});

export const deleteSongHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { coverUrl, audioUrl } = await deleteSong(id);

  // Best-effort — storage cleanup failures are logged server-side but never
  // block the response, since the DB row is already gone.
  await Promise.all([deleteFileByUrl(coverUrl), deleteFileByUrl(audioUrl)]);

  res.status(204).send();
});
