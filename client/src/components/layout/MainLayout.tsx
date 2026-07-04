import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MiniPlayer from "@/components/player/MiniPlayer";
import FullPlayer from "@/components/player/FullPlayer";
import MobileNav from "./MobileNav";
import { AudioEngineProvider } from "@/hooks/AudioEngineContext";
import { usePlayerStore } from "@/store/playerStore";

export default function MainLayout() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const location = useLocation();

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
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <MiniPlayer />
        <FullPlayer />
        <MobileNav />
      </div>
    </AudioEngineProvider>
  );
}