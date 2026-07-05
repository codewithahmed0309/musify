import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import {
  getAllPlaylists,
  createPlaylist,
  updatePlaylist,
  addSongsToPlaylist,
  removeSongsFromPlaylist,
  getPlaylistById,
  deletePlaylist,
} from "../services/playlists.service.js";
import { deleteFileByUrl } from "../services/storage.service.js";

export const listPlaylists = asyncHandler(async (_req: Request, res: Response) => {
  const playlists = await getAllPlaylists();
  res.json(playlists);
});

// Single-playlist lookup — powers the playlist detail page so opening a
// playlist actually loads its own data instead of falling back to the list.
export const getPlaylistHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const playlist = await getPlaylistById(id);
  res.json(playlist);
});

export const deletePlaylistHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { coverUrl } = await deletePlaylist(id);
  await deleteFileByUrl(coverUrl);
  res.status(204).send();
});

export const removeSongsFromPlaylistHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { songIds } = req.body as { songIds?: string[] };

  if (!songIds || songIds.length === 0) {
    throw new AppError("songIds must be a non-empty array", 400);
  }

  const playlist = await removeSongsFromPlaylist(id, songIds);
  res.json(playlist);
});

export const createPlaylistHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, coverUrl, songIds } = req.body as {
    name?: string;
    description?: string | null;
    coverUrl?: string | null;
    songIds?: string[];
  };

  if (!name || !name.trim()) {
    throw new AppError("name is required", 400);
  }

  const playlist = await createPlaylist({ name, description, coverUrl, songIds });
  res.status(201).json(playlist);
});

export const updatePlaylistHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, coverUrl, songIds } = req.body as {
    name?: string;
    description?: string | null;
    coverUrl?: string | null;
    songIds?: string[];
  };

  if (
    name === undefined &&
    description === undefined &&
    coverUrl === undefined &&
    songIds === undefined
  ) {
    throw new AppError("Provide at least one of: name, description, coverUrl, songIds", 400);
  }

  const previous = coverUrl !== undefined ? await getPlaylistById(id) : null;

  const playlist = await updatePlaylist(id, { name, description, coverUrl, songIds });

  if (previous && previous.cover_url && previous.cover_url !== coverUrl) {
    await deleteFileByUrl(previous.cover_url);
  }

  res.json(playlist);
});

// Add one or more songs to an existing playlist (dedupes automatically) —
// used by the "add to playlist" action on the Add Song page.
export const addSongsToPlaylistHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { songIds } = req.body as { songIds?: string[] };

  if (!songIds || songIds.length === 0) {
    throw new AppError("songIds must be a non-empty array", 400);
  }

  const playlist = await addSongsToPlaylist(id, songIds);
  res.json(playlist);
});
