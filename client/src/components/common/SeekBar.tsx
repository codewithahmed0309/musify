import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  className?: string;
  /** Slightly bigger thumb + track for the full-screen player. */
  size?: "sm" | "lg";
}

/**
 * A fully custom, pointer-driven seek bar.
 *
 * The previous implementation used a native <input type="range"> whose
 * `value` was bound directly to the live `currentTime` coming from the
 * <audio> element's `timeupdate` event. While the user was dragging, that
 * same event kept firing and snapping the thumb back to the last known
 * playback position — a classic "controlled input fighting external state"
 * bug that made the thumb feel broken/unresponsive to the pointer.
 *
 * This component tracks its own `isDragging` / `dragValue` state so the
 * thumb always reflects exactly where the pointer is while dragging, and
 * only commits the seek (and hands control back to the live `currentTime`)
 * on pointer release. `setPointerCapture` also means dragging keeps working
 * even if the cursor moves outside the track's bounds mid-drag.
 */
export default function SeekBar({
  currentTime,
  duration,
  onSeek,
  className = "",
  size = "sm",
}: SeekBarProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const displayTime = isDragging ? dragValue : Math.min(currentTime, safeDuration || currentTime);
  const progress = safeDuration > 0 ? Math.min(1, Math.max(0, displayTime / safeDuration)) : 0;

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || safeDuration <= 0) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
      return Math.min(1, Math.max(0, ratio)) * safeDuration;
    },
    [safeDuration]
  );

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (safeDuration <= 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragValue(valueFromClientX(e.clientX));
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setDragValue(valueFromClientX(e.clientX));
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const value = valueFromClientX(e.clientX);
    setIsDragging(false);
    onSeek(value);
  };

  const handlePointerCancel = () => setIsDragging(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (safeDuration <= 0) return;
    const step = e.shiftKey ? 10 : 5;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onSeek(Math.min(safeDuration, currentTime + step));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onSeek(Math.max(0, currentTime - step));
    } else if (e.key === "Home") {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSeek(safeDuration);
    }
  };

  const trackHeight = size === "lg" ? "h-2" : "h-1.5";
  const thumbSize = size === "lg" ? "h-4 w-4" : "h-3 w-3";
  const hitAreaHeight = size === "lg" ? "h-6" : "h-5";

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={safeDuration}
      aria-valuenow={displayTime}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      className={`group relative flex w-full items-center touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-ahmedify-green/60 rounded-full ${hitAreaHeight} ${
        safeDuration > 0 ? "cursor-pointer" : "cursor-default opacity-70"
      } ${className}`}
    >
      <div className={`relative w-full rounded-full bg-white/15 overflow-hidden ${trackHeight}`}>
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-ahmedify-green"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div
        className={`absolute -translate-x-1/2 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.5)] ring-2 ring-ahmedify-green/30 transition-transform duration-100 ease-out ${thumbSize} ${
          isDragging
            ? "scale-125"
            : "scale-100 group-hover:scale-110 group-focus-visible:scale-110"
        } ${safeDuration > 0 ? "" : "opacity-0"}`}
        style={{ left: `${progress * 100}%` }}
      />
    </div>
  );
}
