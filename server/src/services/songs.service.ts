import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/AppError.js";
import type { Song } from "../types/index.js";

const SONG_SELECT =
  "id, title, artist_id, album_id, cover_url, audio_url, duration_seconds, created_at, artists ( name ), albums ( title )";

interface SongRow {
  id: string;
  title: string;
  artist_id: string;
  album_id: string | null;
  cover_url: string | null;
  audio_url: string;
  duration_seconds: number;
  created_at: string;
  artists: { name: string } | { name: string }[] | null;
  albums: { title: string } | { title: string }[] | null;
}

function first<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapSong(row: SongRow): Song {
  return {
    id: row.id,
    title: row.title,
    artist_id: row.artist_id,
    artist_name: first(row.artists)?.name ?? "Unknown Artist",
    album_id: row.album_id,
    album_name: first(row.albums)?.title ?? null,
    cover_url: row.cover_url,
    audio_url: row.audio_url,
    duration_seconds: row.duration_seconds,
    created_at: row.created_at,
  };
}

export async function getAllSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new AppError(error.message, 500);
  return (data as unknown as SongRow[]).map(mapSong);
}

export async function searchSongs(query: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .ilike("title", `%${query}%`)
    .limit(20);

  if (error) throw new AppError(error.message, 500);
  return (data as unknown as SongRow[]).map(mapSong);
}
export async function getOrCreateArtist(name: string): Promise<string> {
  const { data: existing } = await supabase
    .from("artists")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("artists")
    .insert({ name })
    .select("id")
    .single();

  if (error) throw new AppError(error.message, 500);
  return data.id;
}

export async function getOrCreateAlbum(
  title: string,
  artistId: string,
  coverUrl?: string
): Promise<string> {
  const { data: existing } = await supabase
    .from("albums")
    .select("id")
    .eq("title", title)
    .eq("artist_id", artistId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("albums")
    .insert({ title, artist_id: artistId, cover_url: coverUrl ?? null })
    .select("id")
    .single();

  if (error) throw new AppError(error.message, 500);
  return data.id;
}

export async function createSong(payload: {
  title: string;
  artistId: string;
  albumId: string | null;
  coverUrl: string | null;
  audioUrl: string;
  durationSeconds: number;
}) {
  const { data, error } = await supabase
    .from("songs")
    .insert({
      title: payload.title,
      artist_id: payload.artistId,
      album_id: payload.albumId,
      cover_url: payload.coverUrl,
      audio_url: payload.audioUrl,
      duration_seconds: payload.durationSeconds,
    })
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function getSongById(id: string) {
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError("Song not found", 404);
  return mapSong(data as unknown as SongRow);
}

export async function updateSong(
  id: string,
  updates: {
    title?: string;
    albumTitle?: string | null; // null explicitly clears the album
    coverUrl?: string | null;
  }
): Promise<Song> {
  // Confirm the song exists first, and grab its artist_id — we need it to
  // resolve/create the album under the same artist.
  const { data: existing, error: fetchError } = await supabase
    .from("songs")
    .select("id, artist_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw new AppError(fetchError.message, 500);
  if (!existing) throw new AppError("Song not found", 404);

  const patch: Record<string, unknown> = {};

  if (updates.title !== undefined) {
    if (!updates.title.trim()) {
      throw new AppError("title cannot be empty", 400);
    }
    patch.title = updates.title;
  }

  if (updates.coverUrl !== undefined) {
    patch.cover_url = updates.coverUrl;
  }

  if (updates.albumTitle !== undefined) {
    if (updates.albumTitle === null || updates.albumTitle.trim() === "") {
      patch.album_id = null;
    } else {
      const albumId = await getOrCreateAlbum(
        updates.albumTitle,
        existing.artist_id,
        updates.coverUrl ?? undefined
      );
      patch.album_id = albumId;
    }
  }

  if (Object.keys(patch).length === 0) {
    return getSongById(id);
  }

  const { error: updateError } = await supabase.from("songs").update(patch).eq("id", id);

  if (updateError) throw new AppError(updateError.message, 500);

  return getSongById(id);
}
export async function deleteSong(
  id: string
): Promise<{ coverUrl: string | null; audioUrl: string }> {
  const { data: existing, error: fetchError } = await supabase
    .from("songs")
    .select("id, cover_url, audio_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw new AppError(fetchError.message, 500);
  if (!existing) throw new AppError("Song not found", 404);

  const { error: deleteError } = await supabase.from("songs").delete().eq("id", id);
  if (deleteError) throw new AppError(deleteError.message, 500);

  return { coverUrl: existing.cover_url, audioUrl: existing.audio_url };
}
