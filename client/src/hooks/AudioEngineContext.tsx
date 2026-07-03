import { createContext, useContext, type ReactNode } from "react";
import { useAudioEngine } from "./useAudioEngine";

interface AudioEngineValue {
  currentTime: number;
  duration: number;
  seekTo: (seconds: number) => void;
}

const AudioEngineContext = createContext<AudioEngineValue | null>(null);

export function AudioEngineProvider({ children }: { children: ReactNode }) {
  const engine = useAudioEngine();
  return (
    <AudioEngineContext.Provider value={engine}>
      {children}
    </AudioEngineContext.Provider>
  );
}

export function useAudioEngineContext() {
  const ctx = useContext(AudioEngineContext);
  if (!ctx) {
    throw new Error(
      "useAudioEngineContext must be used within AudioEngineProvider"
    );
  }
  return ctx;
}