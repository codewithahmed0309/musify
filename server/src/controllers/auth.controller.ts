import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { validateCredentials } from "../services/auth.service.js";
import { signToken } from "../utils/jwt.js";
import type { AuthResponse } from "../types/index.js";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    throw new AppError("Username and password are required", 400);
  }

  const isValid = await validateCredentials(username, password);
  if (!isValid) {
    throw new AppError("Incorrect username or password", 401);
  }

  const { token, expiresAt } = signToken(username);
  const response: AuthResponse = { token, expiresAt };
  res.json(response);
});
