import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAllArtists } from "../services/artists.service.js";

export const listArtists = asyncHandler(async (_req: Request, res: Response) => {
  const artists = await getAllArtists();
  res.json(artists);
});
