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

export async function getPlaylistById(id: string): Promise<Playlist> {
  const { data, error } = await supabase
    .from("playlists")
    .select(PLAYLIST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError("Playlist not found", 404);
  return { ...(data as Playlist), song_ids: (data as Playlist).song_ids ?? [] };
}

export async function createPlaylist(payload: {
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  songIds?: string[];
}): Promise<Playlist> {
  const { data, error } = await supabase
    .from("playlists")
    .insert({
      name: payload.name,
      description: payload.description ?? null,
      cover_url: payload.coverUrl ?? null,
      song_ids: payload.songIds ?? [],
    })
    .select(PLAYLIST_SELECT)
    .single();

  if (error) throw new AppError(error.message, 500);
  return { ...(data as Playlist), song_ids: (data as Playlist).song_ids ?? [] };
}

export async function updatePlaylist(
  id: string,
  updates: {
    name?: string;
    description?: string | null;
    coverUrl?: string | null;
    songIds?: string[];
  }
): Promise<Playlist> {
  const { data: existing, error: fetchError } = await supabase
    .from("playlists")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw new AppError(fetchError.message, 500);
  if (!existing) throw new AppError("Playlist not found", 404);

  const patch: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    if (!updates.name.trim()) {
      throw new AppError("name cannot be empty", 400);
    }
    patch.name = updates.name;
  }
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.coverUrl !== undefined) patch.cover_url = updates.coverUrl;
  if (updates.songIds !== undefined) patch.song_ids = updates.songIds;

  if (Object.keys(patch).length === 0) {
    return getPlaylistById(id);
  }

  const { error: updateError } = await supabase.from("playlists").update(patch).eq("id", id);
  if (updateError) throw new AppError(updateError.message, 500);

  return getPlaylistById(id);
}

// Adds song ids to a playlist without duplicating ones already present —
// used by the "add these to a playlist" flow so callers don't need to fetch
// the current list first just to merge it themselves.
export async function addSongsToPlaylist(id: string, songIds: string[]): Promise<Playlist> {
  const existing = await getPlaylistById(id);
  const merged = Array.from(new Set([...existing.song_ids, ...songIds]));
  return updatePlaylist(id, { songIds: merged });
}
