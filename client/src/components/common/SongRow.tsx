import { Play, Pause, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Song } from "@/types";
import { usePlayerStore } from "@/store/playerStore";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  song: Song;
  index?: number;
  queue?: Song[];
  onDelete?: (song: Song) => void;
}

export default function SongRow({ song, index, queue, onDelete }: Props) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const isCurrent = currentSong?.id === song.id;
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    onDelete?.(song);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className="w-full flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-ahmedify-card transition-colors text-left group cursor-pointer"
    >
      {index !== undefined && (
        <span className="w-5 text-sm text-ahmedify-text-secondary group-hover:hidden">
          {index + 1}
        </span>
      )}
      <span
        className={`w-5 hidden group-hover:flex items-center justify-center ${
          index === undefined ? "!flex" : ""
        }`}
      >
        {isCurrent && isPlaying ? (
          <Pause size={14} />
        ) : (
          <Play size={14} />
        )}
      </span>
      <div className="h-10 w-10 rounded-md overflow-hidden bg-ahmedify-bg-secondary shrink-0">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium truncate ${
            isCurrent ? "text-ahmedify-green" : "text-ahmedify-text"
          }`}
        >
          {song.title}
        </p>
        <p className="text-xs text-ahmedify-text-secondary truncate">
          {song.artist_name}
        </p>
      </div>
      <span className="text-xs text-ahmedify-text-secondary hidden sm:block">
        {song.album_name ?? ""}
      </span>
      <span className="text-xs text-ahmedify-text-secondary w-10 text-right">
        {formatDuration(song.duration_seconds)}
      </span>
      {onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          onBlur={() => setConfirming(false)}
          title={confirming ? "Click again to confirm delete" : "Delete song"}
          className={`shrink-0 rounded-md p-1.5 transition-colors ${
            confirming
              ? "bg-red-500/20 text-red-400"
              : "opacity-0 group-hover:opacity-100 text-ahmedify-text-secondary hover:text-red-400"
          }`}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}