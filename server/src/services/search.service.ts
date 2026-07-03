import { searchSongs } from "./songs.service.js";
import { searchArtists } from "./artists.service.js";
import { searchAlbums } from "./albums.service.js";
import { searchPlaylists } from "./playlists.service.js";
import type { SearchResults } from "../types/index.js";

export async function searchAll(query: string): Promise<SearchResults> {
  const [songs, artists, albums, playlists] = await Promise.all([
    searchSongs(query),
    searchArtists(query),
    searchAlbums(query),
    searchPlaylists(query),
  ]);

  return { songs, artists, albums, playlists };
}
