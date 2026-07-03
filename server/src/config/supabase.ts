import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Service-role key bypasses RLS — this client must NEVER be exposed to the
// browser. It is only ever imported by server-side services.
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
