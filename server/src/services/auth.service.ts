import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export async function validateCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (username !== env.authUsername) {
    return false;
  }
  return bcrypt.compare(password, env.authPasswordHash);
}
