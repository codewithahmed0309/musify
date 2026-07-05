import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  UploadCloud,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsDownUp,
  ChevronsUpDown,
  Trash2,
  X,
  GripVertical,
  Music2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  FolderPlus,
} from "lucide-react";
import { api, UPLOAD_TIMEOUT_MS } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import ImageUploadButton from "@/components/common/ImageUploadButton";

// Local-only field — there's no `genre` column on the songs table yet, so
// this is collected for the admin's own organization but isn't sent with
// the upload. Adding it here doesn't touch the API or DB, as requested.
const GENRES = [
  "Pop",
  "Hip-Hop",
  "R&B",
  "Rock",
  "Electronic",
  "Indie",
  "Classical",
  "Jazz",
  "Folk",
  "Bollywood",
  "Other",
];

type ItemStatus = "ready" | "uploading" | "done" | "error";

interface QueueItem {
  id: string;
  file: File;
  title: string;
  artist: string;
  album: string;
  genre: string;
  coverUrl: string | null;
  duration: number | null;
  status: ItemStatus;
  progress: number;
  errorMessage?: string;
  expanded: boolean;
}

// "01 - shape_of_you.mp3" / "Shape_Of_You.mp3" -> "Shape Of You"
function titleFromFilename(name: string): string {
  const withoutExt = name.replace(/\.[^./]+$/, "");
  const withoutTrackNumber = withoutExt.replace(/^\s*\d+[\s.\-_]+/, "");
  const spaced = withoutTrackNumber.replace(/[_-]+/g, " ").trim();
  const words = (spaced || withoutExt).split(" ");
  return words
    .map((w) => (w.length > 1 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(" ");
}

function titleCaseFolderName(name: string): string {
  return name
    .replace(/[_-]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.length > 1 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(" ");
}

// Dropped/selected folders arrive as relative paths like
// "Drake/Views/Hotline Bling.mp3" or "Drake/Hotline Bling.mp3". The nearest
// enclosing folder is treated as the album, and the one above that (if any)
// as the artist — matching how most people actually organize a music
// library on disk ("Artist/Album/Track.mp3"). A single enclosing folder
// with no grandparent is treated as the artist, since that's the far more
// common shape for a casually-organized folder ("Drake/Hotline Bling.mp3").
function inferFromRelativePath(relativePath: string): {
  artist: string;
  album: string;
} {
  const parts = relativePath.split("/").filter(Boolean);
  // Drop the filename itself — only folder segments matter here.
  const folders = parts.slice(0, -1);

  if (folders.length >= 2) {
    return {
      artist: titleCaseFolderName(folders[folders.length - 2]),
      album: titleCaseFolderName(folders[folders.length - 1]),
    };
  }
  if (folders.length === 1) {
    return { artist: titleCaseFolderName(folders[0]), album: "" };
  }
  return { artist: "", album: "" };
}

// Recursively walks a dropped DataTransferItemList (which may contain whole
// folders, not just files) using the webkitGetAsEntry API, returning every
// audio file found along with its path relative to the folder it was
// dropped in. Falls back to flat files (relativePath === file.name) when
// the browser doesn't expose entries (e.g. dragging from some OS file
// pickers), so plain file drops keep working exactly as before.
function readEntry(
  entry: FileSystemEntry,
  path: string
): Promise<{ file: File; relativePath: string }[]> {
  return new Promise((resolve) => {
    if (entry.isFile) {
      (entry as FileSystemFileEntry).file(
        (file) => resolve([{ file, relativePath: `${path}${file.name}` }]),
        () => resolve([])
      );
      return;
    }
    if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const reader = dirEntry.createReader();
      const allEntries: FileSystemEntry[] = [];
      const readBatch = () => {
        reader.readEntries(
          (batch) => {
            if (batch.length === 0) {
              Promise.all(
                allEntries.map((child) =>
                  readEntry(child, `${path}${entry.name}/`)
                )
              ).then((results) => resolve(results.flat()));
              return;
            }
            allEntries.push(...batch);
            readBatch();
          },
          () => resolve([])
        );
      };
      readBatch();
      return;
    }
    resolve([]);
  });
}

async function collectFilesFromDataTransfer(
  dataTransfer: DataTransfer
): Promise<{ file: File; relativePath: string }[]> {
  const items = Array.from(dataTransfer.items ?? []);
  const supportsEntries = items.some(
    (item) => typeof item.webkitGetAsEntry === "function"
  );

  if (!supportsEntries) {
    return Array.from(dataTransfer.files).map((file) => ({
      file,
      relativePath: file.name,
    }));
  }

  const entries = items
    .map((item) => item.webkitGetAsEntry?.())
    .filter((entry): entry is FileSystemEntry => Boolean(entry));

  if (entries.length === 0) {
    return Array.from(dataTransfer.files).map((file) => ({
      file,
      relativePath: file.name,
    }));
  }

  const results = await Promise.all(entries.map((entry) => readEntry(entry, "")));
  return results.flat();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      resolve(audio.duration || 0);
      URL.revokeObjectURL(audio.src);
    };
    audio.onerror = () => resolve(0);
    audio.src = URL.createObjectURL(file);
  });
}

async function uploadToServer(
  file: File,
  folder: "audio" | "covers",
  onProgress?: (pct: number) => void
): Promise<string> {
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

function extractErrorMessage(err: unknown, fallback: string): string {
  return axios.isAxiosError(err)
    ? (err.response?.data as { message?: string } | undefined)?.message ??
        fallback
    : fallback;
}

const STATUS_META: Record<
  ItemStatus,
  { label: string; classes: string; icon: typeof CheckCircle2 }
> = {
  ready: {
    label: "Ready",
    classes: "bg-white/5 text-slate-300 border-white/10",
    icon: Music2,
  },
  uploading: {
    label: "Uploading",
    classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: Loader2,
  },
  done: {
    label: "Uploaded",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  error: {
    label: "Error",
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: AlertCircle,
  },
};

export default function BulkUpload() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadingAll, setIsUploadingAll] = useState(false);
  const [overall, setOverall] = useState<{ done: number; total: number } | null>(
    null
  );
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragItemId = useRef<string | null>(null);

  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.artist.toLowerCase().includes(q) ||
        i.file.name.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const readyCount = items.filter((i) => i.status === "ready" || i.status === "error").length;
  const doneCount = items.filter((i) => i.status === "done").length;
  const allExpanded = items.length > 0 && items.every((i) => i.expanded);

  function patchItem(id: string, patch: Partial<QueueItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function addFiles(
    entries: { file: File; relativePath: string }[]
  ) {
    const audioEntries = entries.filter(
      ({ file }) =>
        file.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(file.name)
    );
    if (audioEntries.length === 0) return;

    const newItems: QueueItem[] = audioEntries.map(({ file, relativePath }) => {
      const { artist, album } = inferFromRelativePath(relativePath);
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        title: titleFromFilename(file.name),
        artist,
        album,
        genre: "",
        coverUrl: null,
        duration: null,
        status: "ready",
        progress: 0,
        expanded: true,
      };
    });

    setItems((prev) => [...prev, ...newItems]);

    if (newItems.some((item) => item.artist)) {
      showToast(
        "Artist (and album, where available) filled in automatically from the folder structure.",
        "success"
      );
    }

    // Duration reads happen off the main thread of user interaction so the
    // queue renders instantly, then fills in as metadata becomes available.
    newItems.forEach((item) => {
      readAudioDuration(item.file).then((duration) => {
        patchItem(item.id, { duration });
      });
    });
  }

  function filesToEntries(fileList: FileList | File[]): { file: File; relativePath: string }[] {
    return Array.from(fileList).map((file) => ({
      // `webkitRelativePath` is populated when files come from a
      // <input webkitdirectory> folder picker, giving us the same
      // "Artist/Album/Track.mp3" shape as a dropped folder.
      file,
      relativePath:
        (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
        file.name,
    }));
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(filesToEntries(e.target.files));
    e.target.value = "";
  }

  function handleFolderInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(filesToEntries(e.target.files));
    e.target.value = "";
  }

  async function handleDrop(e: ReactDragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingFiles(false);
    if (!e.dataTransfer) return;
    const entries = await collectFilesFromDataTransfer(e.dataTransfer);
    addFiles(entries);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function removeAll() {
    if (items.length === 0) return;
    if (!window.confirm(`Remove all ${items.length} songs from the queue?`)) return;
    setItems([]);
    setSearchQuery("");
  }

  function toggleExpandAll() {
    setItems((prev) => prev.map((i) => ({ ...i, expanded: !allExpanded })));
  }

  function toggleExpanded(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, expanded: !i.expanded } : i))
    );
  }

  // Native HTML5 drag & drop reordering — no extra dependency needed.
  function handleCardDragStart(id: string) {
    dragItemId.current = id;
  }
  function handleCardDragOver(e: ReactDragEvent<HTMLDivElement>, overId: string) {
    e.preventDefault();
    const draggedId = dragItemId.current;
    if (!draggedId || draggedId === overId) return;
    setItems((prev) => {
      const fromIndex = prev.findIndex((i) => i.id === draggedId);
      const toIndex = prev.findIndex((i) => i.id === overId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }
  function handleCardDragEnd() {
    dragItemId.current = null;
  }

  const uploadSingle = useCallback(async (item: QueueItem) => {
    if (!item.title.trim()) {
      patchItem(item.id, {
        status: "error",
        errorMessage: "Song title is required.",
      });
      return false;
    }

    patchItem(item.id, { status: "uploading", progress: 0, errorMessage: undefined });
    try {
      const audioUrl = await uploadToServer(item.file, "audio", (pct) =>
        patchItem(item.id, { progress: pct })
      );
      const durationSeconds = Math.round(item.duration ?? 0);

      await api.post("/songs", {
        title: item.title.trim(),
        // Artist is optional — an empty value falls back to "Unknown
        // Artist" server-side rather than blocking the upload.
        artistName: item.artist.trim() || undefined,
        albumTitle: item.album.trim() || undefined,
        coverUrl: item.coverUrl ?? undefined,
        audioUrl,
        durationSeconds,
      });

      patchItem(item.id, { status: "done", progress: 100 });
      return true;
    } catch (err) {
      const message = extractErrorMessage(err, "Upload failed.");
      patchItem(item.id, { status: "error", errorMessage: message });
      console.error(`Bulk upload failed for "${item.file.name}":`, err);
      return false;
    }
  }, []);

  async function handleRetry(item: QueueItem) {
    await uploadSingle(item);
  }

  async function handleUploadAll() {
    const pending = items.filter((i) => i.status === "ready" || i.status === "error");
    if (pending.length === 0) return;

    setIsUploadingAll(true);
    setOverall({ done: 0, total: pending.length });

    let succeeded = 0;
    // Sequential on purpose — keeps the "N of M" counter meaningful and
    // avoids hammering the upload endpoint with dozens of parallel large
    // file streams. Each card still fails/succeeds independently: one
    // error doesn't stop the rest of the queue.
    for (let i = 0; i < pending.length; i++) {
      const ok = await uploadSingle(pending[i]);
      if (ok) succeeded++;
      setOverall({ done: i + 1, total: pending.length });
    }

    setIsUploadingAll(false);
    showToast(
      succeeded === pending.length
        ? `All ${succeeded} songs uploaded successfully.`
        : `${succeeded} of ${pending.length} songs uploaded — check the red cards for details.`,
      succeeded === pending.length ? "success" : "error"
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-[#0A0A0D] text-slate-100 px-4 sm:px-6 py-10"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingFiles(true);
      }}
      onDragLeave={() => setIsDraggingFiles(false)}
      onDrop={handleDrop}
    >
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Bulk Upload
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Every song gets its own title, artist, album, and cover — nothing here is shared across tracks.
            </p>
          </div>
          <Link
            to="/add-song"
            className="text-xs font-medium text-slate-400 hover:text-slate-200 underline underline-offset-2 mt-1"
          >
            Add a single song instead
          </Link>
        </div>

        {/* Overall progress */}
        {overall && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-slate-200">
                {isUploadingAll ? "Uploading" : "Upload finished"} — {overall.done} / {overall.total} songs
              </span>
              <span className="text-slate-400">
                {Math.round((overall.done / overall.total) * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-[width] duration-300 ease-out"
                style={{ width: `${(overall.done / overall.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold text-slate-200">Upload Queue</h2>
            <span className="text-xs text-slate-500">
              {items.length === 0
                ? "No songs selected"
                : `${items.length} song${items.length === 1 ? "" : "s"} selected`}
            </span>
          </div>

          <div className="flex-1" />

          {items.length > 3 && (
            <div className="relative w-full sm:w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queue"
                className="w-full bg-white/5 border border-white/10 rounded-full pl-8 pr-3 py-1.5 text-xs outline-none focus:border-purple-400/50 transition-colors"
              />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <Plus size={13} /> Select More
            </button>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              title="Pick a folder — song titles, and artist/album where the folder structure implies them, fill in automatically"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <FolderPlus size={13} /> Select Folder
            </button>

            {items.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={toggleExpandAll}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  {allExpanded ? (
                    <ChevronsDownUp size={13} />
                  ) : (
                    <ChevronsUpDown size={13} />
                  )}
                  {allExpanded ? "Collapse All" : "Expand All"}
                </button>
                <button
                  type="button"
                  onClick={removeAll}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                >
                  <Trash2 size={13} /> Remove All
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleUploadAll}
              disabled={readyCount === 0 || isUploadingAll}
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:brightness-110 hover:shadow-[0_0_24px_rgba(168,85,247,0.35)] disabled:opacity-40 disabled:hover:brightness-100 disabled:hover:shadow-none text-white transition-all duration-200"
            >
              {isUploadingAll ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <UploadCloud size={15} />
              )}
              {isUploadingAll
                ? "Uploading..."
                : `Upload All Songs${readyCount ? ` (${readyCount})` : ""}`}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          // @ts-expect-error -- non-standard but universally supported attribute for folder selection
          webkitdirectory="true"
          directory="true"
          className="hidden"
          onChange={handleFolderInputChange}
        />

        {/* Empty state / dropzone */}
        {items.length === 0 && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`mt-6 w-full flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-20 transition-colors cursor-pointer ${
              isDraggingFiles
                ? "border-purple-400/60 bg-purple-500/5"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
              <Music2 size={26} className="text-purple-300" />
            </div>
            <p className="text-sm font-medium text-slate-200">
              Drag audio files or a whole folder here, or click to browse
            </p>
            <p className="text-xs text-slate-500">
              Drop an "Artist/Album" folder and we'll fill in the artist and
              album for you — you can still edit every detail before anything
              uploads.
            </p>
            <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
              <UploadCloud size={14} /> Select Audio Files
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                folderInputRef.current?.click();
              }}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 underline underline-offset-2"
            >
              or select a folder instead
            </button>
          </div>
        )}

        {/* Queue */}
        {items.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            {filteredItems.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-10">
                No songs in the queue match "{searchQuery}".
              </p>
            )}

            {filteredItems.map((item) => {
              const meta = STATUS_META[item.status];
              const StatusIcon = meta.icon;

              return (
                <div
                  key={item.id}
                  draggable={!isUploadingAll}
                  onDragStart={() => handleCardDragStart(item.id)}
                  onDragOver={(e) => handleCardDragOver(e, item.id)}
                  onDragEnd={handleCardDragEnd}
                  className={`group rounded-2xl border backdrop-blur-sm transition-all duration-200 ${
                    item.status === "error"
                      ? "border-red-500/30 bg-red-500/[0.04]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.045]"
                  }`}
                >
                  {/* Collapsed summary row */}
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <span
                      className={`text-slate-600 shrink-0 ${
                        isUploadingAll ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
                      }`}
                      title="Drag to reorder"
                    >
                      <GripVertical size={15} />
                    </span>

                    <div className="h-9 w-9 rounded-lg overflow-hidden bg-white/5 shrink-0 flex items-center justify-center">
                      {item.coverUrl ? (
                        <img src={item.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Music2 size={14} className="text-slate-600" />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      className="min-w-0 flex-1 flex items-center gap-2 text-left"
                    >
                      <span className="text-sm font-medium truncate">
                        {item.title || "Untitled"}
                      </span>
                      {item.artist && (
                        <span className="text-xs text-slate-500 truncate">
                          — {item.artist}
                        </span>
                      )}
                    </button>

                    <span
                      className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border shrink-0 ${meta.classes}`}
                    >
                      <StatusIcon
                        size={11}
                        className={item.status === "uploading" ? "animate-spin" : ""}
                      />
                      {item.status === "uploading" ? `${item.progress}%` : meta.label}
                    </span>

                    {item.status === "error" && (
                      <button
                        type="button"
                        onClick={() => handleRetry(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 shrink-0 transition-colors"
                      >
                        <RotateCcw size={11} /> Retry
                      </button>
                    )}

                    {item.status !== "uploading" && item.status !== "done" && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove from queue"
                        className="text-slate-600 hover:text-red-400 shrink-0 transition-colors"
                      >
                        <X size={15} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      aria-label={item.expanded ? "Collapse" : "Expand"}
                      className="text-slate-600 hover:text-slate-300 shrink-0 transition-colors"
                    >
                      {item.expanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>

                  {/* Expanded editable body */}
                  {item.expanded && (
                    <div className="px-3 pb-3.5 flex flex-col sm:flex-row gap-4 border-t border-white/5 pt-3.5">
                      <div className="flex sm:flex-col items-center sm:items-start gap-3 shrink-0">
                        <ImageUploadButton
                          size="lg"
                          currentUrl={item.coverUrl}
                          onUploaded={(url) => patchItem(item.id, { coverUrl: url })}
                          disabled={item.status === "uploading"}
                        />
                        <span className="text-[11px] text-slate-500 sm:text-center sm:w-20">
                          Cover art
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="flex flex-col gap-1 sm:col-span-3">
                          <label className="text-[11px] font-medium text-slate-500">
                            Song title
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            disabled={item.status === "uploading"}
                            onChange={(e) => patchItem(item.id, { title: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400/50 transition-colors disabled:opacity-60"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-medium text-slate-500">
                            Artist
                          </label>
                          <input
                            type="text"
                            value={item.artist}
                            disabled={item.status === "uploading"}
                            onChange={(e) => patchItem(item.id, { artist: e.target.value })}
                            placeholder="Optional"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400/50 transition-colors disabled:opacity-60 placeholder:text-slate-600"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-medium text-slate-500">
                            Album
                          </label>
                          <input
                            type="text"
                            value={item.album}
                            disabled={item.status === "uploading"}
                            onChange={(e) => patchItem(item.id, { album: e.target.value })}
                            placeholder="Optional"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400/50 transition-colors disabled:opacity-60 placeholder:text-slate-600"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-medium text-slate-500">
                            Genre
                          </label>
                          <select
                            value={item.genre}
                            disabled={item.status === "uploading"}
                            onChange={(e) => patchItem(item.id, { genre: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400/50 transition-colors disabled:opacity-60"
                          >
                            <option value="">Select genre</option>
                            {GENRES.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3 flex items-center gap-4 text-[11px] text-slate-500 mt-1 flex-wrap">
                          <span className="truncate max-w-[220px]" title={item.file.name}>
                            {item.file.name}
                          </span>
                          <span>{formatDuration(item.duration)}</span>
                          <span>{formatFileSize(item.file.size)}</span>
                        </div>

                        {item.status === "error" && item.errorMessage && (
                          <p className="sm:col-span-3 text-[11px] text-red-400 -mt-1">
                            {item.errorMessage}
                          </p>
                        )}

                        {(item.status === "uploading" || item.status === "done") && (
                          <div className="sm:col-span-3 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-[width] duration-200 ease-out ${
                                item.status === "done"
                                  ? "bg-emerald-500"
                                  : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
