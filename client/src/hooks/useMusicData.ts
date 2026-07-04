import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import type { Album, Artist, Playlist, SearchResults, Song } from "@/types";

function useFetch<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const { showToast } = useToast();
  // Skip the toast on the very first mount of the whole app (StrictMode
  // double-invokes effects too) — a transient blip while the API is still
  // warming up shouldn't greet the user with an error before anything's
  // rendered. Subsequent failures (including manual refetches) still toast.
  const hasLoadedOnce = useRef(false);

  const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get<T>(url)
      .then((res) => {
        if (active) {
          setData(res.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!active) return;
        const message =
          err?.response?.data?.message ?? err?.message ?? "Failed to load";
        setError(message);
        if (hasLoadedOnce.current) {
          showToast(`Couldn't refresh: ${message}`, "error");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          hasLoadedOnce.current = true;
        }
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
