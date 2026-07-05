import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Play, Sparkles } from "lucide-react";
import SectionHeader from "@/components/common/SectionHeader";
import HorizontalScroller from "@/components/common/HorizontalScroller";
import SongCard from "@/components/common/SongCard";
import { ArtistCard, PlaylistCard } from "@/components/common/EntityCards";
import { CardRowSkeleton } from "@/components/common/loader";
import { useSongs, useArtists, usePlaylists } from "@/hooks/useMusicData";
import { usePlayerStore } from "@/store/playerStore";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function Home() {
  const { data: songs, loading: songsLoading } = useSongs();
  const { data: artists, loading: artistsLoading } = useArtists();
  const { data: playlists, loading: playlistsLoading } = usePlaylists();
  const playSong = usePlayerStore((s) => s.playSong);
  const getRecentlyPlayedIds = usePlayerStore((s) => s.getRecentlyPlayedIds);

  // Recently played / Continue listening are both derived from the same
  // locally stored list of song IDs — no playback position is ever stored.
  const recentIds = useMemo(() => getRecentlyPlayedIds(), [songs]);

  const recentlyPlayed = useMemo(
    () =>
      recentIds
        .map((id) => songs.find((s) => s.id === id))
        .filter((s): s is (typeof songs)[number] => Boolean(s)),
    [recentIds, songs]
  );

  const continueListening = recentlyPlayed.slice(0, 10);

  // Trending: most recently added tracks to the private library.
  const trending = useMemo(
    () =>
      [...songs]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 12),
    [songs]
  );

  const greeting = getGreeting();
  const hasAnyMusic = songs.length > 0;

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="relative -mx-4 md:-mx-6 px-4 md:px-6 pt-2 pb-8 mb-4 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 15% 0%, rgba(29,185,84,0.16), transparent 60%)",
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-ahmedify-green mb-2">
              <Sparkles size={13} />
              {greeting}
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-ahmedify-text-secondary mt-2">
              {hasAnyMusic
                ? `${songs.length} song${songs.length === 1 ? "" : "s"} · ${
                    artists.length
                  } artist${artists.length === 1 ? "" : "s"} · ${
                    playlists.length
                  } playlist${playlists.length === 1 ? "" : "s"}`
                : "Your library is empty — add your first song to get started."}
            </p>
          </div>

          {trending.length > 0 && (
            <button
              onClick={() => playSong(trending[0], trending)}
              className="inline-flex items-center gap-2 self-start sm:self-auto text-sm font-semibold px-5 py-2.5 rounded-full bg-ahmedify-green text-black hover:bg-ahmedify-green-hover hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(29,185,84,0.3)]"
            >
              <Play size={15} fill="black" />
              Play something new
            </button>
          )}
        </div>
      </div>

      {!hasAnyMusic && !songsLoading ? (
        <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-ahmedify-border py-16 px-6">
          <p className="text-sm font-medium text-ahmedify-text">
            No music here yet
          </p>
          <p className="text-xs text-ahmedify-text-secondary mt-1 max-w-xs">
            Head to Add Song or Bulk Upload to build out your library.
          </p>
          <Link
            to="/add-song"
            className="mt-4 text-sm font-semibold px-4 py-2 rounded-full bg-ahmedify-green text-black hover:bg-ahmedify-green-hover transition-colors"
          >
            Add your first song
          </Link>
        </div>
      ) : (
        <>
          <SectionHeader title="Recently Played" />
          {songsLoading ? (
            <CardRowSkeleton count={4} />
          ) : (
            <HorizontalScroller emptyLabel="Songs you play will show up here.">
              {recentlyPlayed.map((song) => (
                <SongCard key={song.id} song={song} queue={recentlyPlayed} />
              ))}
            </HorizontalScroller>
          )}

          <SectionHeader title="Trending" />
          {songsLoading ? (
            <CardRowSkeleton count={6} />
          ) : (
            <HorizontalScroller emptyLabel="No songs yet.">
              {trending.map((song) => (
                <SongCard key={song.id} song={song} queue={trending} />
              ))}
            </HorizontalScroller>
          )}

          <SectionHeader title="Playlists" />
          {playlistsLoading ? (
            <CardRowSkeleton count={4} />
          ) : (
            <HorizontalScroller emptyLabel="No playlists yet.">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </HorizontalScroller>
          )}

          <SectionHeader title="Artists" />
          {artistsLoading ? (
            <CardRowSkeleton count={6} round />
          ) : (
            <HorizontalScroller emptyLabel="No artists yet.">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </HorizontalScroller>
          )}

          <SectionHeader title="Continue Listening" />
          <HorizontalScroller emptyLabel="Nothing to continue yet.">
            {continueListening.map((song) => (
              <SongCard key={song.id} song={song} queue={continueListening} />
            ))}
          </HorizontalScroller>
        </>
      )}
    </div>
  );
}
