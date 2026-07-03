import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/AppError.js";
import type { Album } from "../types/index.js";

const ALBUM_SELECT =
  "id, title, artist_id, cover_url, release_year, artists ( name )";

interface AlbumRow {
  id: string;
  title: string;
  artist_id: string;
  cover_url: string | null;
  release_year: number | null;
  artists: { name: string } | { name: string }[] | null;
}

function first<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapAlbum(row: AlbumRow): Album {
  return {
    id: row.id,
    title: row.title,
    artist_id: row.artist_id,
    artist_name: first(row.artists)?.name ?? "Unknown Artist",
    cover_url: row.cover_url,
    release_year: row.release_year,
  };
}

export async function getAllAlbums(): Promise<Album[]> {
  const { data, error } = await supabase
    .from("albums")
    .select(ALBUM_SELECT)
    .order("release_year", { ascending: false });

  if (error) throw new AppError(error.message, 500);
  return (data as unknown as AlbumRow[]).map(mapAlbum);
}

export async function searchAlbums(query: string): Promise<Album[]> {
  const { data, error } = await supabase
    .from("albums")
    .select(ALBUM_SELECT)
    .ilike("title", `%${query}%`)
    .limit(20);

  if (error) throw new AppError(error.message, 500);
  return (data as unknown as AlbumRow[]).map(mapAlbum);
}

export async function getAlbumById(id: string): Promise<Album> {
  const { data, error } = await supabase
    .from("albums")
    .select(ALBUM_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError("Album not found", 404);
  return mapAlbum(data as unknown as AlbumRow);
}

export async function updateAlbum(
  id: string,
  updates: { title?: string; coverUrl?: string | null }
): Promise<Album> {
  const { data: existing, error: fetchError } = await supabase
    .from("albums")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw new AppError(fetchError.message, 500);
  if (!existing) throw new AppError("Album not found", 404);

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

  if (Object.keys(patch).length === 0) {
    return getAlbumById(id);
  }

  const { error: updateError } = await supabase.from("albums").update(patch).eq("id", id);

  if (updateError) throw new AppError(updateError.message, 500);

  return getAlbumById(id);
}
