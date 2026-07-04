import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
} from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { useAudioEngineContext } from "@/hooks/AudioEngineContext";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    isShuffled,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    volume,
    setVolume,
    setFullPlayerOpen,
  } = usePlayerStore();

  const { currentTime, duration, seekTo } = useAudioEngineContext();

  if (!currentSong) return null;

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;
  const VolumeIcon =
    volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-20 bg-ahmedify-bg-secondary border-t border-ahmedify-border shadow-player px-3 md:px-4 flex items-center gap-4">
      {/* Track info */}
      <button
        onClick={() => setFullPlayerOpen(true)}
        className="flex items-center gap-3 min-w-0 w-1/4 text-left"
      >
        <div className="h-12 w-12 rounded-lg overflow-hidden bg-ahmedify-card shrink-0">
          {currentSong.cover_url ? (
            <img
              src={currentSong.cover_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 hidden sm:block">
          <p className="text-sm font-medium truncate">{currentSong.title}</p>
          <p className="text-xs text-ahmedify-text-secondary truncate">
            {currentSong.artist_name}
          </p>
        </div>
      </button>

      {/* Controls + seek */}
      <div className="flex-1 flex flex-col items-center gap-1.5 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            aria-pressed={isShuffled}
            aria-label="Shuffle"
            className={`transition-colors ${
              isShuffled ? "text-ahmedify-green" : "text-ahmedify-text-secondary hover:text-ahmedify-text"
            }`}
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={playPrevious}
            aria-label="Previous"
            className="text-ahmedify-text-secondary hover:text-ahmedify-text transition-colors"
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause size={16} fill="black" />
            ) : (
              <Play size={16} fill="black" />
            )}
          </button>
          <button
            onClick={playNext}
            aria-label="Next"
            className="text-ahmedify-text-secondary hover:text-ahmedify-text transition-colors"
          >
            <SkipForward size={18} />
          </button>
          <button
            onClick={cycleRepeat}
            aria-pressed={repeatMode !== "off"}
            aria-label="Repeat"
            className={`transition-colors ${
              repeatMode !== "off" ? "text-ahmedify-green" : "text-ahmedify-text-secondary hover:text-ahmedify-text"
            }`}
          >
            <RepeatIcon size={16} />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 w-full">
          <span className="text-[11px] text-ahmedify-text-secondary w-9 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="seek-bar flex-1 accent-ahmedify-green"
            style={{
              background: `linear-gradient(to right, #1DB954 ${
                duration ? (currentTime / duration) * 100 : 0
              }%, #4a4a4a ${duration ? (currentTime / duration) * 100 : 0}%)`,
            }}
            aria-label="Seek"
          />
          <span className="text-[11px] text-ahmedify-text-secondary w-9">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume + expand */}
      <div className="hidden lg:flex items-center gap-3 w-1/4 justify-end">
        <VolumeIcon size={18} className="text-ahmedify-text-secondary" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 accent-ahmedify-green"
          aria-label="Volume"
        />
        <button
          onClick={() => setFullPlayerOpen(true)}
          aria-label="Open full player"
          className="text-ahmedify-text-secondary hover:text-ahmedify-text transition-colors"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
}