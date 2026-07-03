export type { Song } from "./song";
export type { Artist } from "./artist";
export type { Album } from "./album";
export type { Playlist } from "./playlist";
export type { SearchResults } from "./search";

export type RepeatMode = "off" | "all" | "one";

export interface AuthResponse {
  token: string;
  expiresAt: number;
}
