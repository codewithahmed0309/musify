import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ListMusic, Plus } from "lucide-react";
import { api, UPLOAD_TIMEOUT_MS } from "@/lib/api";
import {
  useSongs,
  useArtists,
  useAlbums,
  usePlaylists,
} from "@/hooks/useMusicData";
import {
  updateSongCover,
  updateAlbumCover,
  updateArtistImage,
  createPlaylist,
  addSongsToPlaylist,
} from "@/lib/mutations";
import { useToast } from "@/hooks/useToast";
import SongRow from "@/components/common/SongRow";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import ImageUploadButton from "@/components/common/ImageUploadButton";
import type { Song } from "@/types";

function extractErrorMessage(err: unknown, fallback: string): string {
  return axios.isAxiosError(err)
    ? (err.response?.data as { message?: string } | undefined)?.message ??
        fallback
    : fallback;
}

export default function AddSong() {
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { data: songs, loading: songsLoading, refetch: refetchSongs } =
    useSongs();
  const { data: albums, loading: albumsLoading, refetch: refetchAlbums } =
    useAlbums();
  const { data: artists, loading: artistsLoading, refetch: refetchArtists } =
    useArtists();
  const { data: playlists, refetch: refetchPlaylists } = usePlaylists();

  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(
    new Set()
  );
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistCover, setNewPlaylistCover] = useState<string | null>(
    null
  );
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [existingPlaylistId, setExistingPlaylistId] = useState("");
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);

  const { showToast } = useToast();

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  function resetFileInputs() {
    setCoverFile(null);
    setAudioFile(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
  }

  async function uploadFile(
    file: File,
    folder: "audio" | "covers",
    onProgress?: (pct: number) => void
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await api.post<{ url: string }>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: UPLOAD_TIMEOUT_MS,
      onUploadProgress: onProgress
        ? (evt) => {
            if (evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        : undefined,
    });
    return res.data.url;
  }

  async function getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration));
        URL.revokeObjectURL(audio.src);
      };
      audio.src = URL.createObjectURL(file);
    });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!audioFile) {
      showToast("Please select an audio file.", "error");
      return;
    }
    if (!title || !artistName) {
      showToast("Title and artist name are required.", "error");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      // Images go to Cloudinary, audio to Supabase Storage — both handled
      // transparently by the same /api/upload endpoint on the backend.
      let coverUrl: string | undefined;
      if (coverFile) {
        coverUrl = await uploadFile(coverFile, "covers");
      }

      // The cover upload (if any) is quick; the audio upload is the one
      // worth showing real progress for, since it can take a while on
      // larger files.
      const audioUrl = await uploadFile(audioFile, "audio", setUploadProgress);
      const durationSeconds = await getAudioDuration(audioFile);

      await api.post("/songs", {
        title,
        artistName,
        albumTitle: albumTitle || undefined,
        coverUrl,
        audioUrl,
        durationSeconds,
      });

      showToast(`"${title}" uploaded successfully.`, "success");
      setTitle("");
      setArtistName("");
      setAlbumTitle("");
      resetFileInputs();
      refetchSongs();
      refetchAlbums();
      refetchArtists();
    } catch (err) {
      showToast(
        extractErrorMessage(err, "Failed to add song. Please try again."),
        "error"
      );
      console.error(err);
      resetFileInputs();
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (song: Song) => {
    try {
      await api.delete(`/songs/${song.id}`);
      showToast(`"${song.title}" deleted.`, "success");
      setSelectedSongIds((prev) => {
        const next = new Set(prev);
        next.delete(song.id);
        return next;
      });
      refetchSongs();
    } catch (err) {
      showToast(
        extractErrorMessage(err, `Failed to delete "${song.title}".`),
        "error"
      );
      console.error(err);
    }
  };

  async function handleSongCoverChange(song: Song, coverUrl: string) {
    try {
      await updateSongCover(song.id, coverUrl);
      showToast("Song cover updated.", "success");
      refetchSongs();
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to update cover."), "error");
    }
  }

  async function handleAlbumCoverChange(albumId: string, coverUrl: string) {
    try {
      await updateAlbumCover(albumId, coverUrl);
      showToast("Album cover updated.", "success");
      refetchAlbums();
      refetchSongs();
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to update cover."), "error");
    }
  }

  async function handleArtistImageChange(artistId: string, imageUrl: string) {
    try {
      await updateArtistImage(artistId, imageUrl);
      showToast("Artist image updated.", "success");
      refetchArtists();
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to update image."), "error");
    }
  }

  function toggleSongSelected(id: string) {
    setSelectedSongIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreatePlaylist() {
    if (!newPlaylistName.trim()) {
      showToast("Give the playlist a name first.", "error");
      return;
    }
    setIsCreatingPlaylist(true);
    try {
      const playlist = await createPlaylist({
        name: newPlaylistName.trim(),
        coverUrl: newPlaylistCover ?? undefined,
        songIds: Array.from(selectedSongIds),
      });
      showToast(`Playlist "${playlist.name}" created.`, "success");
      setNewPlaylistName("");
      setNewPlaylistCover(null);
      setSelectedSongIds(new Set());
      refetchPlaylists();
    } catch (err) {
      showToast(
        extractErrorMessage(err, "Failed to create playlist."),
        "error"
      );
    } finally {
      setIsCreatingPlaylist(false);
    }
  }

  async function handleAddToExistingPlaylist() {
    if (!existingPlaylistId || selectedSongIds.size === 0) return;
    setIsAddingToPlaylist(true);
    try {
      await addSongsToPlaylist(existingPlaylistId, Array.from(selectedSongIds));
      const name =
        playlists.find((p) => p.id === existingPlaylistId)?.name ?? "playlist";
      showToast(`Added ${selectedSongIds.size} song(s) to "${name}".`, "success");
      setSelectedSongIds(new Set());
      refetchPlaylists();
    } catch (err) {
      showToast(
        extractErrorMessage(err, "Failed to add songs to playlist."),
        "error"
      );
    } finally {
      setIsAddingToPlaylist(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-ahmedify-bg px-4 py-10 gap-10">
      {/* Upload form */}
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Add Song</h1>
          <Link
            to="/bulk-upload"
            className="text-xs font-medium text-ahmedify-text-secondary hover:text-ahmedify-text underline underline-offset-2"
          >
            Bulk Upload instead
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ahmedify-text-secondary">
              Song Title
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ahmedify-green transition-colors disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ahmedify-text-secondary">
              Artist Name
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ahmedify-green transition-colors disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ahmedify-text-secondary">
              Album Title (optional)
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              className="bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ahmedify-green transition-colors disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ahmedify-text-secondary">
              Cover Image (optional — stored on Cloudinary)
            </label>
            <input
              type="file"
              ref={coverInputRef}
              disabled={isSubmitting}
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="text-sm text-ahmedify-text-secondary disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ahmedify-text-secondary">
              Audio File
            </label>
            <input
              type="file"
              ref={audioInputRef}
              required
              disabled={isSubmitting}
              accept="audio/mpeg,audio/mp4,audio/wav,audio/x-wav,audio/flac"
              onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              className="text-sm text-ahmedify-text-secondary disabled:opacity-60"
            />
          </div>

          {uploadProgress !== null && (
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-full rounded-full bg-ahmedify-card overflow-hidden">
                <div
                  className="h-full bg-ahmedify-green transition-[width] duration-200 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-ahmedify-text-secondary">
                Uploading audio — {uploadProgress}%
              </p>
            </div>
          )}

          <Button type="submit" isLoading={isSubmitting} fullWidth>
            {isSubmitting ? "Uploading..." : "Upload & Save"}
          </Button>
        </form>
      </div>

      {/* Manage Songs */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ahmedify-text-secondary">
            Manage Songs
          </h2>
          {selectedSongIds.size > 0 && (
            <span className="text-xs text-ahmedify-green font-medium">
              {selectedSongIds.size} selected
            </span>
          )}
        </div>

        {songsLoading && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-ahmedify-card animate-pulse"
              />
            ))}
          </div>
        )}

        {!songsLoading && songs.length === 0 && (
          <EmptyState
            compact
            title="No songs yet"
            description="Songs you upload will appear here, ready to edit or add to a playlist."
          />
        )}

        {!songsLoading && songs.length > 0 && (
          <div className="flex flex-col gap-1 bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-2">
            {songs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-ahmedify-card/60 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSongIds.has(song.id)}
                  onChange={() => toggleSongSelected(song.id)}
                  aria-label={`Select "${song.title}" for a playlist`}
                  className="accent-ahmedify-green h-4 w-4 shrink-0"
                />
                <ImageUploadButton
                  size="sm"
                  currentUrl={song.cover_url}
                  onUploaded={(url) => handleSongCoverChange(song, url)}
                />
                <div className="min-w-0 flex-1">
                  <SongRow song={song} onDelete={handleDelete} hideThumbnail />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playlist actions from selected songs */}
      <div className="w-full max-w-2xl">
        <h2 className="text-sm font-semibold text-ahmedify-text-secondary mb-3">
          Make a Playlist from Selected Songs
        </h2>
        <div className="bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-6 flex flex-col gap-5">
          <p className="text-xs text-ahmedify-text-secondary">
            {selectedSongIds.size === 0
              ? "Tick songs above, then create a new playlist or add them to an existing one."
              : `${selectedSongIds.size} song(s) selected.`}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ahmedify-text-secondary">
                New playlist name
              </label>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="e.g. Late Night Drive"
                className="bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ahmedify-green transition-colors"
              />
            </div>
            <ImageUploadButton
              currentUrl={newPlaylistCover}
              onUploaded={setNewPlaylistCover}
              label="Cover"
            />
            <Button
              type="button"
              onClick={handleCreatePlaylist}
              isLoading={isCreatingPlaylist}
              icon={<Plus size={15} />}
            >
              Create Playlist
            </Button>
          </div>

          {playlists.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end pt-4 border-t border-ahmedify-border">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ahmedify-text-secondary">
                  Or add to an existing playlist
                </label>
                <select
                  value={existingPlaylistId}
                  onChange={(e) => setExistingPlaylistId(e.target.value)}
                  className="bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ahmedify-green transition-colors"
                >
                  <option value="">Select a playlist…</option>
                  {playlists.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddToExistingPlaylist}
                isLoading={isAddingToPlaylist}
                disabled={!existingPlaylistId || selectedSongIds.size === 0}
                icon={<ListMusic size={15} />}
              >
                Add Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Manage Albums */}
      <div className="w-full max-w-2xl">
        <h2 className="text-sm font-semibold text-ahmedify-text-secondary mb-3">
          Manage Album Covers
        </h2>
        {albumsLoading && (
          <div className="h-14 rounded-xl bg-ahmedify-card animate-pulse" />
        )}
        {!albumsLoading && albums.length === 0 && (
          <EmptyState
            compact
            title="No albums yet"
            description="Albums are created automatically when you add a song with an album title."
          />
        )}
        {!albumsLoading && albums.length > 0 && (
          <div className="flex flex-col gap-1 bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-2">
            {albums.map((album) => (
              <div
                key={album.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-ahmedify-card/60 transition-colors"
              >
                <ImageUploadButton
                  size="sm"
                  currentUrl={album.cover_url}
                  onUploaded={(url) => handleAlbumCoverChange(album.id, url)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{album.title}</p>
                  <p className="text-xs text-ahmedify-text-secondary truncate">
                    {album.artist_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manage Artists */}
      <div className="w-full max-w-2xl">
        <h2 className="text-sm font-semibold text-ahmedify-text-secondary mb-3">
          Manage Artist Images
        </h2>
        {artistsLoading && (
          <div className="h-14 rounded-xl bg-ahmedify-card animate-pulse" />
        )}
        {!artistsLoading && artists.length === 0 && (
          <EmptyState
            compact
            title="No artists yet"
            description="Artists are created automatically when you add a song."
          />
        )}
        {!artistsLoading && artists.length > 0 && (
          <div className="flex flex-col gap-1 bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-2">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-ahmedify-card/60 transition-colors"
              >
                <ImageUploadButton
                  size="sm"
                  shape="circle"
                  currentUrl={artist.image_url}
                  onUploaded={(url) => handleArtistImageChange(artist.id, url)}
                />
                <p className="text-sm font-medium truncate flex-1 min-w-0">
                  {artist.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
