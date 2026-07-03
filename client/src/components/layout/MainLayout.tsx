import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MiniPlayer from "@/components/player/MiniPlayer";
import FullPlayer from "@/components/player/FullPlayer";
import MobileNav from "./MobileNav";
import { AudioEngineProvider } from "@/hooks/AudioEngineContext";
import { usePlayerStore } from "@/store/playerStore";

export default function MainLayout() {
  const currentSong = usePlayerStore((s) => s.currentSong);

  return (
    <AudioEngineProvider>
      <div className="flex h-screen overflow-hidden bg-ahmedify-bg text-ahmedify-text">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main
            className="flex-1 overflow-y-auto px-4 md:px-6 pt-4"
            style={{
              paddingBottom: currentSong ? "6rem" : "1.5rem",
            }}
          >
            <Outlet />
          </main>
        </div>
        <MiniPlayer />
        <FullPlayer />
        <MobileNav />
      </div>
    </AudioEngineProvider>
  );
}