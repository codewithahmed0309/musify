import { api } from "@/lib/api";
import type { Album, Artist, Playlist, Song } from "@/types";

// Thin, typed wrappers around the mutation endpoints so pages don't have to
// juggle raw axios calls and response shapes inline.

export function updateSongCover(id: string, coverUrl: string) {
  return api.patch<Song>(`/songs/${id}`, { coverUrl }).then((r) => r.data);
}

export function updateAlbumCover(id: string, coverUrl: string) {
  return api.patch<Album>(`/albums/${id}`, { coverUrl }).then((r) => r.data);
}

export function updateArtistImage(id: string, imageUrl: string) {
  return api.patch<Artist>(`/artists/${id}`, { imageUrl }).then((r) => r.data);
}

export function createPlaylist(payload: {
  name: string;
  description?: string;
  coverUrl?: string;
  songIds?: string[];
}) {
  return api.post<Playlist>("/playlists", payload).then((r) => r.data);
}

export function updatePlaylist(
  id: string,
  payload: {
    name?: string;
    description?: string | null;
    coverUrl?: string | null;
    songIds?: string[];
  }
) {
  return api.patch<Playlist>(`/playlists/${id}`, payload).then((r) => r.data);
}

export function deletePlaylist(id: string) {
  return api.delete(`/playlists/${id}`);
}

export function addSongsToPlaylist(playlistId: string, songIds: string[]) {
  return api
    .post<Playlist>(`/playlists/${playlistId}/songs`, { songIds })
    .then((r) => r.data);
}

export function removeSongsFromPlaylist(playlistId: string, songIds: string[]) {
  return api
    .delete<Playlist>(`/playlists/${playlistId}/songs`, { data: { songIds } })
    .then((r) => r.data);
}
