import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import axios from "axios";
import { api, UPLOAD_TIMEOUT_MS } from "@/lib/api";

type ItemStatus = "pending" | "uploading" | "done" | "error";

interface BulkItem {
  id: string;
  file: File;
  title: string;
  status: ItemStatus;
  errorMessage?: string;
}

// "01 - Some Song Name.mp3" / "Some_Song_Name.mp3" -> "Some Song Name"
function titleFromFilename(name: string): string {
  const withoutExt = name.replace(/\.[^./]+$/, "");
  const withoutLeadingTrackNumber = withoutExt.replace(/^\s*\d+[\s.\-_]+/, "");
  return withoutLeadingTrackNumber.replace(/[_-]+/g, " ").trim() || withoutExt;
}

async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      resolve(Math.round(audio.duration));
      URL.revokeObjectURL(audio.src);
    };
    audio.onerror = () => resolve(0);
    audio.src = URL.createObjectURL(file);
  });
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

export default function BulkUpload() {
  const [artistName, setArtistName] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [items, setItems] = useState<BulkItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const doneCount = items.filter((i) => i.status === "done").length;

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const newItems: BulkItem[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      title: titleFromFilename(file.name),
      status: "pending",
    }));
    setItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id));
      return [...prev, ...newItems.filter((i) => !existingIds.has(i.id))];
    });
    if (audioInputRef.current) audioInputRef.current.value = "";
  }

  function updateItem(id: string, patch: Partial<BulkItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function processItem(item: BulkItem, sharedCoverUrl: string | undefined) {
    updateItem(item.id, { status: "uploading", errorMessage: undefined });
    try {
      const audioUrl = await uploadFile(item.file, "audio");
      const durationSeconds = await getAudioDuration(item.file);

      await api.post("/songs", {
        title: item.title,
        artistName,
        albumTitle: albumTitle || undefined,
        coverUrl: sharedCoverUrl,
        audioUrl,
        durationSeconds,
      });

      updateItem(item.id, { status: "done" });
    } catch (err) {
      const backendMessage = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      const message = backendMessage ?? "Upload failed. Check console for details.";
      updateItem(item.id, { status: "error", errorMessage: message });
      console.error(`Bulk upload failed for "${item.file.name}":`, err);
      // A full storage bucket will fail every remaining item the same way —
      // surface it once and stop, rather than burning through the whole
      // queue with the same error.
      if (axios.isAxiosError(err) && err.response?.status === 507) {
        throw err;
      }
    }
  }

  async function handleUploadAll() {
    if (!artistName.trim()) return;
    const pendingOrFailed = items.filter(
      (i) => i.status === "pending" || i.status === "error"
    );
    if (pendingOrFailed.length === 0) return;

    setIsProcessing(true);
    setBatchError(null);
    try {
      // The cover, if provided, is shared across the whole batch — upload it
      // once up front rather than re-uploading per song.
      let sharedCoverUrl: string | undefined;
      if (coverFile) {
        sharedCoverUrl = await uploadFile(coverFile, "covers");
      }

      // Sequential on purpose: keeps memory/network usage predictable for
      // large batches and makes per-item progress easy to follow.
      for (const item of pendingOrFailed) {
        await processItem(item, sharedCoverUrl);
      }
    } catch (err) {
      const backendMessage = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      setBatchError(backendMessage ?? "Bulk upload stopped due to an error. Check console for details.");
      console.error("Bulk upload: batch stopped", err);
    } finally {
      setIsProcessing(false);
    }
  }

  const canUpload =
    !isProcessing &&
    artistName.trim().length > 0 &&
    items.some((i) => i.status === "pending" || i.status === "error");

  return (
  <div className="min-h-screen w-full flex items-start justify-center bg-ahmedify-bg px-4 py-10">
    <div className="w-full max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Bulk Upload Songs</h1>

        <Link
          to="/add-song"
          className="text-xs font-medium text-ahmedify-text-secondary hover:text-ahmedify-text underline underline-offset-2"
        >
          Add single song / Manage songs
        </Link>
      </div>

      <div className="bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ahmedify-text-secondary">
            Artist Name (applies to all songs below)
          </label>
          <input
            type="text"
            required
            disabled={isProcessing}
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className="bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ahmedify-green disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ahmedify-text-secondary">
            Album Title (optional, applies to all songs below)
          </label>
          <input
            type="text"
            disabled={isProcessing}
            value={albumTitle}
            onChange={(e) => setAlbumTitle(e.target.value)}
            className="bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ahmedify-green disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ahmedify-text-secondary">
            Shared Cover Image (optional, applies to all songs below)
          </label>
          <input
            type="file"
            ref={coverInputRef}
            disabled={isProcessing}
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ahmedify-text-secondary">
            Audio Files
          </label>
          <input
            type="file"
            ref={audioInputRef}
            multiple
            disabled={isProcessing}
            accept="audio/mpeg,audio/mp4,audio/wav,audio/x-wav,audio/flac,.m4a"
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="text-sm"
          />
          <p className="text-[11px] text-ahmedify-text-secondary">
            Select multiple files at once — you can add more before uploading.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-ahmedify-card rounded-xl px-3 py-2"
              >
                <input
                  type="text"
                  value={item.title}
                  disabled={isProcessing || item.status === "done"}
                  onChange={(e) =>
                    updateItem(item.id, { title: e.target.value })
                  }
                  className="flex-1 min-w-0 bg-transparent text-sm outline-none disabled:opacity-70"
                />

                <span
                  className={`text-[11px] font-medium shrink-0 ${
                    item.status === "done"
                      ? "text-ahmedify-green"
                      : item.status === "error"
                      ? "text-red-400"
                      : "text-ahmedify-text-secondary"
                  }`}
                  title={item.errorMessage}
                >
                  {item.status === "pending" && "Pending"}
                  {item.status === "uploading" && "Uploading..."}
                  {item.status === "done" && "Done"}
                  {item.status === "error" && "Failed — will retry"}
                </span>

                {item.status !== "uploading" &&
                  item.status !== "done" && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={isProcessing}
                      className="text-[11px] text-ahmedify-text-secondary hover:text-red-400 shrink-0"
                    >
                      Remove
                    </button>
                  )}
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <p className="text-xs text-ahmedify-text-secondary">
            {doneCount} of {items.length} uploaded
          </p>
        )}

        {batchError && (
          <p role="alert" className="text-xs text-red-400">
            {batchError}
          </p>
        )}

        <button
          type="button"
          onClick={handleUploadAll}
          disabled={!canUpload}
          className="mt-2 bg-ahmedify-green hover:bg-ahmedify-green-hover disabled:opacity-60 text-black font-semibold text-sm rounded-full py-2.5 transition-colors"
        >
          {isProcessing ? "Uploading..." : "Upload All"}
        </button>
      </div>
    </div>
  </div>
);}