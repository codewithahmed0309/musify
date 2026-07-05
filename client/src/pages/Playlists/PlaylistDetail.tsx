import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ListMusic, Pause, Play, Shuffle, Trash2 } from "lucide-react";
import { usePlaylist, useSongs } from "@/hooks/useMusicData";
import { deletePlaylist, removeSongsFromPlaylist } from "@/lib/mutations";
import { usePlayerStore } from "@/store/playerStore";
import { useToast } from "@/hooks/useToast";
import SongRow from "@/components/common/SongRow";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";
import { Skeleton } from "@/components/common/loader";
import type { Song } from "@/types";

export default function PlaylistDetail() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    data: playlist,
    loading: playlistLoading,
    refetch: refetchPlaylist,
  } = usePlaylist(playlistId);
  const { data: allSongs, loading: songsLoading } = useSongs();

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();

  // Songs in the exact order stored on the playlist, hydrated with full
  // song details from the library (the playlist itself only stores ids).
  const songs = useMemo<Song[]>(() => {
    if (!playlist) return [];
    const byId = new Map(allSongs.map((s) => [s.id, s]));
    return playlist.song_ids
      .map((id) => byId.get(id))
      .filter((s): s is Song => Boolean(s));
  }, [playlist, allSongs]);

  const loading = playlistLoading || songsLoading;
  const isThisPlaylistPlaying =
    isPlaying && currentSong && songs.some((s) => s.id === currentSong.id);

  function handlePlayAll() {
    if (songs.length === 0) return;
    if (isThisPlaylistPlaying) {
      togglePlay();
      return;
    }
    playSong(songs[0], songs);
  }

  function handleShufflePlay() {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playSong(shuffled[0], shuffled);
  }

  async function handleRemoveSong(song: Song) {
    if (!playlist) return;
    try {
      await removeSongsFromPlaylist(playlist.id, [song.id]);
      showToast(`Removed "${song.title}" from playlist`, "success");
      refetchPlaylist();
    } catch {
      showToast("Couldn't remove that song. Try again.", "error");
    }
  }

  async function handleDeletePlaylist() {
    if (!playlist) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      await deletePlaylist(playlist.id);
      showToast("Playlist deleted", "success");
      navigate("/playlists", { replace: true });
    } catch {
      showToast("Couldn't delete this playlist. Try again.", "error");
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="pb-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 mb-8">
          <Skeleton className="h-40 w-40 rounded-2xl shrink-0" />
          <div className="flex flex-col gap-3 w-full">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full mb-2" />
        ))}
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="pb-6">
        <button
          onClick={() => navigate("/playlists")}
          className="flex items-center gap-2 text-sm text-ahmedify-text-secondary hover:text-ahmedify-text mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Playlists
        </button>
        <EmptyState
          icon={<ListMusic size={20} />}
          title="Playlist not found"
          description="It may have been deleted, or the link is no longer valid."
        />
      </div>
    );
  }

  return (
    <div className="pb-6">
      <button
        onClick={() => navigate("/playlists")}
        className="flex items-center gap-2 text-sm text-ahmedify-text-secondary hover:text-ahmedify-text mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Playlists
      </button>

      {/* Header */}
      <div className="relative -mx-4 md:-mx-6 px-4 md:px-6 pb-8 pt-2 mb-2 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(180deg, rgba(29,185,84,0.18) 0%, rgba(18,18,18,0) 70%)",
          }}
        />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="h-40 w-40 md:h-48 md:w-48 rounded-2xl overflow-hidden bg-ahmedify-card shadow-[0_8px_32px_rgba(0,0,0,0.5)] shrink-0 flex items-center justify-center">
            {playlist.cover_url ? (
              <img
                src={playlist.cover_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ListMusic size={40} className="text-ahmedify-text-muted" />
            )}
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-ahmedify-text-secondary mb-2">
              Playlist
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight break-words">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-sm text-ahmedify-text-secondary mt-2 max-w-md">
                {playlist.description}
              </p>
            )}
            <p className="text-sm text-ahmedify-text-secondary mt-2">
              {songs.length} {songs.length === 1 ? "song" : "songs"}
            </p>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          aria-label={isThisPlaylistPlaying ? "Pause" : "Play"}
          className="h-14 w-14 flex items-center justify-center rounded-full bg-ahmedify-green text-black hover:bg-ahmedify-green-hover hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
        >
          {isThisPlaylistPlaying ? (
            <Pause size={22} fill="black" />
          ) : (
            <Play size={22} fill="black" />
          )}
        </button>
        <button
          onClick={handleShufflePlay}
          disabled={songs.length === 0}
          aria-label="Shuffle play"
          className="h-11 w-11 flex items-center justify-center rounded-full text-ahmedify-text-secondary hover:text-ahmedify-text hover:bg-white/5 transition-colors disabled:opacity-40"
        >
          <Shuffle size={20} />
        </button>

        <div className="ml-auto">
          <Button
            variant={confirmingDelete ? "danger" : "ghost"}
            size="sm"
            icon={<Trash2 size={14} />}
            isLoading={isDeleting}
            onClick={handleDeletePlaylist}
            onBlur={() => setConfirmingDelete(false)}
          >
            {confirmingDelete ? "Confirm delete" : "Delete playlist"}
          </Button>
        </div>
      </div>

      {/* Song list */}
      {songs.length === 0 ? (
        <EmptyState
          icon={<ListMusic size={20} />}
          title="This playlist is empty"
          description="Add songs to it from the Add Song page."
        />
      ) : (
        <div className="flex flex-col gap-0.5">
          {songs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              queue={songs}
              onDelete={handleRemoveSong}
              deleteLabel="Remove from playlist"
            />
          ))}
        </div>
      )}
    </div>
  );
}
