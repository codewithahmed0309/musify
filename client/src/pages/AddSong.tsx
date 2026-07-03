import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { api, UPLOAD_TIMEOUT_MS } from "@/lib/api";
import { useSongs } from "@/hooks/useMusicData";
import SongRow from "@/components/common/SongRow";
import type { Song } from "@/types";

export default function AddSong() {
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: songs, loading: songsLoading, refetch } = useSongs();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  function resetFileInputs() {
    setCoverFile(null);
    setAudioFile(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
  }

  async function uploadFile(file: File, folder: "audio" | "covers") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await api.post<{ url: string }>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: UPLOAD_TIMEOUT_MS,
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
    setError(null);
    setMessage(null);

    if (!audioFile) {
      setError("Please select an audio file.");
      return;
    }
    if (!title || !artistName) {
      setError("Title and artist name are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      let coverUrl: string | undefined;
      if (coverFile) {
        coverUrl = await uploadFile(coverFile, "covers");
      }

      const audioUrl = await uploadFile(audioFile, "audio");
      const durationSeconds = await getAudioDuration(audioFile);

      await api.post("/songs", {
        title,
        artistName,
        albumTitle: albumTitle || undefined,
        coverUrl,
        audioUrl,
        durationSeconds,
      });

      setMessage("Song added successfully.");
      setTitle("");
      setArtistName("");
      setAlbumTitle("");
      resetFileInputs();
      refetch();
    } catch (err) {
      const backendMessage = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      setError(backendMessage ?? "Failed to add song. Check console for details.");
      console.error(err);
      resetFileInputs();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (song: Song) => {
    setDeleteError(null);
    try {
      await api.delete(`/songs/${song.id}`);
      refetch();
    } catch (err) {
      setDeleteError(`Failed to delete "${song.title}". Please try again.`);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-ahmedify-bg px-4 py-10 gap-8">
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ahmedify-green"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ahmedify-text-secondary">
              Artist Name
            </label>
            <input
              type="text"
              required
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ahmedify-green"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ahmedify-text-secondary">
              Album Title (optional)
            </label>
            <input
              type="text"
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              className="bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ahmedify-green"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ahmedify-text-secondary">
              Cover Image (optional)
            </label>
            <input
              type="file"
              ref={coverInputRef}
              disabled={isSubmitting}
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="text-sm"
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
              className="text-sm"
            />
          </div>

          {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
          {message && <p className="text-xs text-ahmedify-green">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-ahmedify-green hover:bg-ahmedify-green-hover disabled:opacity-60 text-black font-semibold text-sm rounded-full py-2.5 transition-colors"
          >
            {isSubmitting ? "Uploading..." : "Upload & Save"}
          </button>
        </form>
      </div>

      <div className="w-full max-w-sm">
        <h2 className="text-sm font-semibold mb-3 text-ahmedify-text-secondary">
          Manage Songs
        </h2>

        {deleteError && (
          <p role="alert" className="text-xs text-red-400 mb-2">
            {deleteError}
          </p>
        )}

        {songsLoading && (
          <p className="text-sm text-ahmedify-text-secondary">Loading...</p>
        )}

        {!songsLoading && songs.length === 0 && (
          <p className="text-sm text-ahmedify-text-secondary">
            No songs yet.
          </p>
        )}

        <div className="flex flex-col bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-2">
          {songs.map((song) => (
            <SongRow key={song.id} song={song} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}