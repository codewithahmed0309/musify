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
