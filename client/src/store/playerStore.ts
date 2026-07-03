import { create } from "zustand";
import type { RepeatMode, Song } from "@/types";

const RECENT_KEY = "ahmedify_recently_played";
const RECENT_LIMIT = 20;

function readRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Only the song id is stored — never a playback position or timestamp.
function pushRecentId(id: string) {
  const existing = readRecentIds().filter((existingId) => existingId !== id);
  existing.unshift(id);
  const trimmed = existing.slice(0, RECENT_LIMIT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed));
}

interface PlayerState {
  queue: Song[];
  originalQueue: Song[];
  currentIndex: number;
  currentSong: Song | null;
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  volume: number;
  isFullPlayerOpen: boolean;

  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (v: number) => void;
  setFullPlayerOpen: (open: boolean) => void;
  addToQueue: (song: Song) => void;
  getRecentlyPlayedIds: () => string[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  currentSong: null,
  isPlaying: false,
  isShuffled: false,
  repeatMode: "off",
  volume: 0.8,
  isFullPlayerOpen: false,

  playSong: (song, queue) => {
    const baseQueue = queue && queue.length > 0 ? queue : [song];
    const index = baseQueue.findIndex((s) => s.id === song.id);
    pushRecentId(song.id);
    set({
      originalQueue: baseQueue,
      queue: get().isShuffled ? shuffleArray(baseQueue) : baseQueue,
      currentIndex: index >= 0 ? index : 0,
      currentSong: song,
      isPlaying: true,
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  playNext: () => {
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }
    const nextSong = queue[nextIndex];
    pushRecentId(nextSong.id);
    set({ currentIndex: nextIndex, currentSong: nextSong, isPlaying: true });
  },

  playPrevious: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;
    const prevIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
    const prevSong = queue[prevIndex];
    set({ currentIndex: prevIndex, currentSong: prevSong, isPlaying: true });
  },

  toggleShuffle: () => {
    const { isShuffled, originalQueue, currentSong } = get();
    if (!isShuffled) {
      const shuffled = shuffleArray(originalQueue);
      const idx = currentSong
        ? shuffled.findIndex((s) => s.id === currentSong.id)
        : 0;
      set({ isShuffled: true, queue: shuffled, currentIndex: idx });
    } else {
      const idx = currentSong
        ? originalQueue.findIndex((s) => s.id === currentSong.id)
        : 0;
      set({ isShuffled: false, queue: originalQueue, currentIndex: idx });
    }
  },

  cycleRepeat: () => {
    const order: RepeatMode[] = ["off", "all", "one"];
    const next = order[(order.indexOf(get().repeatMode) + 1) % order.length];
    set({ repeatMode: next });
  },

  setVolume: (v) => set({ volume: Math.min(1, Math.max(0, v)) }),

  setFullPlayerOpen: (open) => set({ isFullPlayerOpen: open }),

  addToQueue: (song) =>
    set((state) => ({
      queue: [...state.queue, song],
      originalQueue: [...state.originalQueue, song],
    })),

  getRecentlyPlayedIds: () => readRecentIds(),
}));