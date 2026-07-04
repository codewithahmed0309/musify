import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
} from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { useAudioEngineContext } from "@/hooks/AudioEngineContext";
import { useState } from "react";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function FullPlayer() {
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
    isFullPlayerOpen,
    setFullPlayerOpen,
    queue,
    currentIndex,
  } = usePlayerStore();

  const { currentTime, duration, seekTo } = useAudioEngineContext();
  const [showQueue, setShowQueue] = useState(false);

  if (!currentSong) return null;

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

  return (
    <AnimatePresence>
      {isFullPlayerOpen && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-ahmedify-bg flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setFullPlayerOpen(false)}
              aria-label="Close full player"
              className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-ahmedify-card transition-colors"
            >
              <ChevronDown size={22} />
            </button>
            <p className="text-xs uppercase tracking-widest text-ahmedify-text-secondary">
              Now Playing
            </p>
            <button
              onClick={() => setShowQueue((v) => !v)}
              aria-pressed={showQueue}
              aria-label="Toggle queue"
              className={`h-9 w-9 flex items-center justify-center rounded-full transition-colors ${
                showQueue ? "text-ahmedify-green" : "hover:bg-ahmedify-card"
              }`}
            >
              <ListMusic size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10 px-6 md:px-16 pb-10 overflow-y-auto">
            {/* Rotating CD */}
            {/* Rotating CD */}
<div className="relative shrink-0 h-64 w-64 md:h-80 md:w-80">
  {/* The CD disc — your photo, full artwork and label included, spinning as one piece */}
  <div
    className="absolute inset-0 rounded-full shadow-card cd-spin"
    style={{
      backgroundImage: "url(/cd.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      animationPlayState: isPlaying ? "running" : "paused",
    }}
  />

  {/* Subtle glossy sweep across the disc for a "light hitting plastic" feel */}
  <div className="absolute inset-0 rounded-full pointer-events-none cd-shine" />
</div>
            {!showQueue ? (
              <div className="w-full max-w-md flex flex-col items-center md:items-start text-center md:text-left">
                <h2 className="text-2xl font-bold">{currentSong.title}</h2>
                <p className="text-ahmedify-text-secondary mt-1">
                  {currentSong.artist_name}
                </p>

                <div className="w-full mt-8">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => seekTo(Number(e.target.value))}
                    className="seek-bar w-full accent-ahmedify-green"
                    style={{
                      background: `linear-gradient(to right, #1DB954 ${
                        duration ? (currentTime / duration) * 100 : 0
                      }%, #4a4a4a ${
                        duration ? (currentTime / duration) * 100 : 0
                      }%)`,
                    }}
                    aria-label="Seek"
                  />
                  <div className="flex justify-between text-xs text-ahmedify-text-secondary mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-8">
                  <button
                    onClick={toggleShuffle}
                    aria-pressed={isShuffled}
                    className={
                      isShuffled
                        ? "text-ahmedify-green"
                        : "text-ahmedify-text-secondary hover:text-ahmedify-text"
                    }
                  >
                    <Shuffle size={20} />
                  </button>
                  <button
                    onClick={playPrevious}
                    className="text-ahmedify-text hover:scale-105 transition-transform"
                  >
                    <SkipBack size={24} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="h-14 w-14 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause size={24} fill="black" />
                    ) : (
                      <Play size={24} fill="black" />
                    )}
                  </button>
                  <button
                    onClick={playNext}
                    className="text-ahmedify-text hover:scale-105 transition-transform"
                  >
                    <SkipForward size={24} />
                  </button>
                  <button
                    onClick={cycleRepeat}
                    aria-pressed={repeatMode !== "off"}
                    className={
                      repeatMode !== "off"
                        ? "text-ahmedify-green"
                        : "text-ahmedify-text-secondary hover:text-ahmedify-text"
                    }
                  >
                    <RepeatIcon size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md max-h-[50vh] overflow-y-auto">
                <h3 className="text-sm font-semibold text-ahmedify-text-secondary mb-3">
                  Queue
                </h3>
                <ul className="flex flex-col gap-1">
                  {queue.map((song, idx) => (
                    <li
                      key={`${song.id}-${idx}`}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                        idx === currentIndex
                          ? "bg-ahmedify-card text-ahmedify-green"
                          : "text-ahmedify-text-secondary"
                      }`}
                    >
                      <span className="text-xs w-5">{idx + 1}</span>
                      <span className="truncate text-sm">{song.title}</span>
                      <span className="truncate text-xs ml-auto">
                        {song.artist_name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <style>{`
        @keyframes cd-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .cd-spin {
          animation: cd-rotate 6s linear infinite;
          /* eases the visual slow-down/speed-up when play state toggles */
          transition: filter 0.3s ease;
        }
        @keyframes cd-shine-sweep {
          0% { background-position: -150% 0; }
          100% { background-position: 250% 0; }
        }
        .cd-shine {
          background: linear-gradient(
            75deg,
            transparent 40%,
            rgba(255, 255, 255, 0.12) 48%,
            rgba(255, 255, 255, 0.25) 50%,
            rgba(255, 255, 255, 0.12) 52%,
            transparent 60%
          );
          background-size: 300% 100%;
          animation: cd-shine-sweep 4s ease-in-out infinite;
        }
      `}</style>
    </AnimatePresence>
  );
}