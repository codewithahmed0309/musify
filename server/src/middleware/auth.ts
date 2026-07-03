import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Missing or malformed Authorization header", 401));
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    verifyToken(token);
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}
