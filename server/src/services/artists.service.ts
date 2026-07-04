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

export async function getArtistById(id: string): Promise<Artist> {
  const { data, error } = await supabase
    .from("artists")
    .select(ARTIST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError("Artist not found", 404);
  return data as Artist;
}

export async function updateArtist(
  id: string,
  updates: { name?: string; imageUrl?: string | null; bio?: string | null }
): Promise<Artist> {
  const { data: existing, error: fetchError } = await supabase
    .from("artists")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw new AppError(fetchError.message, 500);
  if (!existing) throw new AppError("Artist not found", 404);

  const patch: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    if (!updates.name.trim()) {
      throw new AppError("name cannot be empty", 400);
    }
    patch.name = updates.name;
  }

  if (updates.imageUrl !== undefined) {
    patch.image_url = updates.imageUrl;
  }

  if (updates.bio !== undefined) {
    patch.bio = updates.bio;
  }

  if (Object.keys(patch).length === 0) {
    return getArtistById(id);
  }

  const { error: updateError } = await supabase.from("artists").update(patch).eq("id", id);
  if (updateError) throw new AppError(updateError.message, 500);

  return getArtistById(id);
}
