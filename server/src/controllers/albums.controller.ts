import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { getAllAlbums, updateAlbum, getAlbumById } from "../services/albums.service.js";
import { deleteFileByUrl } from "../services/storage.service.js";

export const listAlbums = asyncHandler(async (_req: Request, res: Response) => {
  const albums = await getAllAlbums();
  res.json(albums);
});

export const updateAlbumHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, coverUrl } = req.body as { title?: string; coverUrl?: string | null };

  if (title === undefined && coverUrl === undefined) {
    throw new AppError("Provide at least one of: title, coverUrl", 400);
  }

  const previous = coverUrl !== undefined ? await getAlbumById(id) : null;

  const album = await updateAlbum(id, { title, coverUrl });

  if (previous && previous.cover_url && previous.cover_url !== coverUrl) {
    await deleteFileByUrl(previous.cover_url);
  }

  res.json(album);
});
