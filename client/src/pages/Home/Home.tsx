import { useMemo } from "react";
import SectionHeader from "@/components/common/SectionHeader";
import HorizontalScroller from "@/components/common/HorizontalScroller";
import SongCard from "@/components/common/SongCard";
import { ArtistCard, PlaylistCard } from "@/components/common/EntityCards";
import { CardRowSkeleton } from "@/components/common/loader";
import { useSongs, useArtists, usePlaylists } from "@/hooks/useMusicData";
import { usePlayerStore } from "@/store/playerStore";

export default function Home() {
  const { data: songs, loading: songsLoading } = useSongs();
  const { data: artists, loading: artistsLoading } = useArtists();
  const { data: playlists, loading: playlistsLoading } = usePlaylists();
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

  return (
    <div className="pb-6">
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
    </div>
  );
}