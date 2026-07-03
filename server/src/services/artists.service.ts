import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/AppError.js";
import type { Artist } from "../types/index.js";

const ARTIST_SELECT = "id, name, image_url, bio";

export async function getAllArtists(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from("artists")
    .select(ARTIST_SELECT)
    .order("name", { ascending: true });

  if (error) throw new AppError(error.message, 500);
  return data as Artist[];
}

export async function searchArtists(query: string): Promise<Artist[]> {
  const { data, error } = await supabase
    .from("artists")
    .select(ARTIST_SELECT)
    .ilike("name", `%${query}%`)
    .limit(20);

  if (error) throw new AppError(error.message, 500);
  return data as Artist[];
}
