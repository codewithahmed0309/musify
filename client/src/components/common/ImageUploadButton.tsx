import { useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil } from "lucide-react";
import axios from "axios";
import { api, UPLOAD_TIMEOUT_MS } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

interface Props {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  size?: "sm" | "md" | "lg";
  shape?: "square" | "circle";
  label?: string;
  disabled?: boolean;
}

/**
 * Small, reusable "click the thumbnail to replace it" control. Uploads
 * straight to Cloudinary via POST /api/upload (folder=covers) and hands the
 * resulting URL back to the caller, which is responsible for persisting it
 * (e.g. PATCH /songs/:id, PATCH /albums/:id, PATCH /artists/:id).
 */
export default function ImageUploadButton({
  currentUrl,
  onUploaded,
  size = "md",
  shape = "square",
  label,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  async function handleFile(file: File) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "covers");
      const res = await api.post<{ url: string }>("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: UPLOAD_TIMEOUT_MS,
      });
      onUploaded(res.data.url);
      showToast("Image uploaded.", "success");
    } catch (err) {
      const backendMessage = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      showToast(
        backendMessage ?? "Image upload failed. Please try again.",
        "error"
      );
      console.error(err);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const dims = size === "sm" ? "h-10 w-10" : size === "lg" ? "h-20 w-20" : "h-14 w-14";
  const iconSize = size === "sm" ? 13 : size === "lg" ? 20 : 16;
  const radius = shape === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => !disabled && inputRef.current?.click()}
        disabled={disabled || isUploading}
        title="Change image"
        className={`group relative ${dims} ${radius} overflow-hidden bg-ahmedify-card shrink-0 disabled:opacity-60 focus-visible:outline-none`}
      >
        {currentUrl ? (
          <img src={currentUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-ahmedify-text-secondary">
            <ImagePlus size={iconSize} />
          </div>
        )}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${
            isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {isUploading ? (
            <Loader2 size={iconSize} className="animate-spin text-white" />
          ) : (
            <Pencil size={iconSize} className="text-white" />
          )}
        </div>
      </button>
      {label && (
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled || isUploading}
          className="text-xs font-medium text-ahmedify-text-secondary hover:text-ahmedify-text underline underline-offset-2 disabled:opacity-60"
        >
          {isUploading ? "Uploading…" : label}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
