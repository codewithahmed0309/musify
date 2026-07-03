export interface Song {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  album_id: string | null;
  album_name: string | null;
  cover_url: string | null;
  audio_url: string;
  duration_seconds: number;
  created_at: string;
}

export interface Artist {
  id: string;
  name: string;
  image_url: string | null;
  bio: string | null;
}

export interface Album {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  cover_url: string | null;
  release_year: number | null;
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
  song_ids: string[];
}

export interface SearchResults {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface AuthResponse {
  token: string;
  expiresAt: number;
}

export interface JwtPayload {
  sub: string; // username
  iat: number;
  exp: number;
}
