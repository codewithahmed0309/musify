import { Play, Pause } from "lucide-react";
import type { Song } from "@/types";
import { usePlayerStore } from "@/store/playerStore";

interface Props {
  song: Song;
  queue?: Song[];
}

export default function SongCard({ song, queue }: Props) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const isCurrent = currentSong?.id === song.id;

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group flex flex-col text-left w-40 md:w-44 shrink-0 rounded-xl p-3 bg-ahmedify-card hover:bg-ahmedify-card-hover hover:-translate-y-0.5 hover:shadow-card transition-all duration-200"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-ahmedify-bg-secondary mb-3">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
            isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <span className="h-9 w-9 rounded-full bg-ahmedify-green flex items-center justify-center">
            {isCurrent && isPlaying ? (
              <Pause size={16} fill="black" className="text-black" />
            ) : (
              <Play size={16} fill="black" className="text-black" />
            )}
          </span>
        </div>
      </div>
      <p
        className={`text-sm font-medium truncate ${
          isCurrent ? "text-ahmedify-green" : "text-ahmedify-text"
        }`}
      >
        {song.title}
      </p>
      <p className="text-xs text-ahmedify-text-secondary truncate mt-0.5">
        {song.artist_name}
      </p>
    </button>
  );
}