import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Album, Artist, Playlist, SearchResults, Song } from "@/types";

function useFetch<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get<T>(url)
      .then((res) => {
        if (active) setData(res.data);
      })
      .catch((err) => {
        if (active) setError(err.message ?? "Failed to load");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url, reloadToken]);

  return { data, loading, error, refetch };
}

export const useSongs = () => useFetch<Song[]>("/songs", []);
export const useArtists = () => useFetch<Artist[]>("/artists", []);
export const useAlbums = () => useFetch<Album[]>("/albums", []);
export const usePlaylists = () => useFetch<Playlist[]>("/playlists", []);

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResults>({
    songs: [],
    artists: [],
    albums: [],
    playlists: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ songs: [], artists: [], albums: [], playlists: [] });
      return;
    }
    let active = true;
    setLoading(true);
    const timeout = setTimeout(() => {
      api
        .get<SearchResults>("/search", { params: { q: query } })
        .then((res) => {
          if (active) setResults(res.data);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 200); // debounce for live filtering

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);

  return { results, loading };
}