import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useSearch } from "@/hooks/useMusicData";
import SongRow from "@/components/common/SongRow";
import { ArtistCard, PlaylistCard } from "@/components/common/EntityCards";
import SectionHeader from "@/components/common/SectionHeader";
import HorizontalScroller from "@/components/common/HorizontalScroller";


export default function Search() {
  const [query, setQuery] = useState("");
  const { results, loading } = useSearch(query);

  const hasResults =
    results.songs.length +
      results.artists.length +
      results.albums.length +
      results.playlists.length >
    0;

  return (
    <div className="pb-6">
      <div className="relative max-w-xl mb-6 mt-1">
        <SearchIcon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ahmedify-text-secondary"
        />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums, playlists"
          className="w-full bg-ahmedify-card border border-ahmedify-border rounded-full pl-11 pr-4 py-3 text-sm outline-none focus:border-ahmedify-green transition-colors"
        />
      </div>

      {!query.trim() && (
        <p className="text-sm text-ahmedify-text-secondary">
          Start typing to search your entire library.
        </p>
      )}

      {query.trim() && loading && (
        <p className="text-sm text-ahmedify-text-secondary">Searching...</p>
      )}

      {query.trim() && !loading && !hasResults && (
        <p className="text-sm text-ahmedify-text-secondary">
          No results for "{query}".
        </p>
      )}

      {results.songs.length > 0 && (
        <>
          <SectionHeader title="Songs" />
          <div className="flex flex-col">
            {results.songs.map((song) => (
              <SongRow key={song.id} song={song} queue={results.songs} />
            ))}
          </div>
        </>
      )}

      {results.artists.length > 0 && (
        <>
          <SectionHeader title="Artists" />
          <HorizontalScroller emptyLabel="">
            {results.artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </HorizontalScroller>
        </>
      )}

      {results.albums.length > 0 && (
        <>
          <SectionHeader title="Albums" />
          <HorizontalScroller emptyLabel="">
            {results.albums.map((album) => (
              <div
                key={album.id}
                className="w-40 shrink-0 rounded-xl p-3 bg-ahmedify-card"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-ahmedify-bg-secondary mb-3">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <p className="text-sm font-medium truncate">{album.title}</p>
                <p className="text-xs text-ahmedify-text-secondary truncate">
                  {album.artist_name}
                </p>
              </div>
            ))}
          </HorizontalScroller>
        </>
      )}

      {results.playlists.length > 0 && (
        <>
          <SectionHeader title="Playlists" />
          <HorizontalScroller emptyLabel="">
            {results.playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </HorizontalScroller>
        </>
      )}

    </div>
  );
}