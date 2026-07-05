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
import SeekBar from "@/components/common/SeekBar";
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
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 50% -10%, rgba(29,185,84,0.16), transparent 55%), linear-gradient(180deg, #181818 0%, #121212 45%)",
          }}
        >
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <button
              onClick={() => setFullPlayerOpen(false)}
              aria-label="Close full player"
              className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-90 transition-all"
            >
              <ChevronDown size={22} />
            </button>
            <p className="text-xs font-semibold uppercase tracking-widest text-ahmedify-text-secondary">
              Now Playing
            </p>
            <button
              onClick={() => setShowQueue((v) => !v)}
              aria-pressed={showQueue}
              aria-label="Toggle queue"
              className={`h-9 w-9 flex items-center justify-center rounded-full transition-all active:scale-90 ${
                showQueue
                  ? "text-ahmedify-green bg-ahmedify-green/10"
                  : "hover:bg-white/10"
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
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {currentSong.title}
                </h2>
                <p className="text-ahmedify-text-secondary mt-1.5 text-base">
                  {currentSong.artist_name}
                </p>

                <div className="w-full mt-8">
                  <SeekBar
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={seekTo}
                    size="lg"
                  />
                  <div className="flex justify-between text-xs text-ahmedify-text-secondary mt-2 font-medium tabular-nums">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-8">
                  <button
                    onClick={toggleShuffle}
                    aria-pressed={isShuffled}
                    aria-label="Shuffle"
                    className={`transition-all active:scale-90 ${
                      isShuffled
                        ? "text-ahmedify-green"
                        : "text-ahmedify-text-secondary hover:text-ahmedify-text"
                    }`}
                  >
                    <Shuffle size={20} />
                  </button>
                  <button
                    onClick={playPrevious}
                    aria-label="Previous"
                    className="text-ahmedify-text hover:scale-110 active:scale-95 transition-transform"
                  >
                    <SkipBack size={26} />
                  </button>
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="h-16 w-16 flex items-center justify-center rounded-full bg-white text-black shadow-[0_4px_24px_rgba(29,185,84,0.35)] hover:scale-105 active:scale-95 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause size={26} fill="black" />
                    ) : (
                      <Play size={26} fill="black" />
                    )}
                  </button>
                  <button
                    onClick={playNext}
                    aria-label="Next"
                    className="text-ahmedify-text hover:scale-110 active:scale-95 transition-transform"
                  >
                    <SkipForward size={26} />
                  </button>
                  <button
                    onClick={cycleRepeat}
                    aria-pressed={repeatMode !== "off"}
                    aria-label="Repeat"
                    className={`transition-all active:scale-90 ${
                      repeatMode !== "off"
                        ? "text-ahmedify-green"
                        : "text-ahmedify-text-secondary hover:text-ahmedify-text"
                    }`}
                  >
                    <RepeatIcon size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md max-h-[50vh] overflow-y-auto">
                <h3 className="text-sm font-semibold text-ahmedify-text-secondary mb-3 uppercase tracking-widest">
                  Up Next
                </h3>
                <ul className="flex flex-col gap-1">
                  {queue.map((song, idx) => (
                    <li
                      key={`${song.id}-${idx}`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        idx === currentIndex
                          ? "bg-ahmedify-green/10 text-ahmedify-green"
                          : "text-ahmedify-text-secondary hover:bg-white/5"
                      }`}
                    >
                      <span className="text-xs w-5 tabular-nums">{idx + 1}</span>
                      <span className="truncate text-sm font-medium">
                        {song.title}
                      </span>
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