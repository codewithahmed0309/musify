import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function multerErrorMessage(err: MulterError): string {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return "File is too large. Maximum upload size is 25MB.";
    case "LIMIT_UNEXPECTED_FILE":
      return "Unexpected file field in upload.";
    default:
      return `Upload error: ${err.message}`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof MulterError) {
    res.status(400).json({ success: false, message: multerErrorMessage(err) });
    return;
  }

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : "Internal server error";

  if (!isAppError) {
    // Unexpected errors are worth logging with full detail server-side.
    console.error("[unhandled error]", err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && env.nodeEnv === "production"
      ? "Internal server error"
      : message,
  });
}
