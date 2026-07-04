import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { getAllArtists, updateArtist } from "../services/artists.service.js";
import { deleteFileByUrl } from "../services/storage.service.js";
import { getArtistById } from "../services/artists.service.js";

export const listArtists = asyncHandler(async (_req: Request, res: Response) => {
  const artists = await getAllArtists();
  res.json(artists);
});

export const updateArtistHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, imageUrl, bio } = req.body as {
    name?: string;
    imageUrl?: string | null;
    bio?: string | null;
  };

  if (name === undefined && imageUrl === undefined && bio === undefined) {
    throw new AppError("Provide at least one of: name, imageUrl, bio", 400);
  }

  // If we're replacing the image, grab the old one first so we can clean it
  // up from Cloudinary once the update succeeds.
  const previous = imageUrl !== undefined ? await getArtistById(id) : null;

  const artist = await updateArtist(id, { name, imageUrl, bio });

  if (previous && previous.image_url && previous.image_url !== imageUrl) {
    await deleteFileByUrl(previous.image_url);
  }

  res.json(artist);
});
