export interface Album {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  cover_url: string | null;
  release_year: number | null;
}
