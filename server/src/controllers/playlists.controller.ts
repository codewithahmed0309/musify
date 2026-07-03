import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAllPlaylists } from "../services/playlists.service.js";

export const listPlaylists = asyncHandler(async (_req: Request, res: Response) => {
  const playlists = await getAllPlaylists();
  res.json(playlists);
});
