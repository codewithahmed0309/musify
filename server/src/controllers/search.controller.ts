import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { searchAll } from "../services/search.service.js";

export const search = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query.q;

  if (typeof q !== "string" || q.trim() === "") {
    throw new AppError("Query parameter 'q' is required", 400);
  }

  const results = await searchAll(q.trim());
  res.json(results);
});
