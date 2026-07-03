import type { Song } from "./song";
import type { Artist } from "./artist";
import type { Album } from "./album";
import type { Playlist } from "./playlist";

export interface SearchResults {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}
