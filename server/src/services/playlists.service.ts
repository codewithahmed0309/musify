import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/AppError.js";
import type { Playlist } from "../types/index.js";

const PLAYLIST_SELECT = "id, name, description, cover_url, created_at, song_ids";

export async function getAllPlaylists(): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from("playlists")
    .select(PLAYLIST_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new AppError(error.message, 500);
  return (data ?? []).map((row: Playlist) => ({
    ...row,
    song_ids: row.song_ids ?? [],
  }));
}

export async function searchPlaylists(query: string): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from("playlists")
    .select(PLAYLIST_SELECT)
    .ilike("name", `%${query}%`)
    .limit(20);

  if (error) throw new AppError(error.message, 500);
  return (data ?? []).map((row: Playlist) => ({
    ...row,
    song_ids: row.song_ids ?? [],
  }));
}
