import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import AddSong from "@/pages/AddSong";
import BulkUpload from "@/pages/BulkUpload";
import Search from "@/pages/Search";
import Library from "@/pages/Library";
import Artists from "@/pages/Artists";
import Albums from "@/pages/Albums";
import Playlists from "@/pages/Playlists";
import SettingsPage from "@/pages/Settings";
import { useAuthStore } from "@/store/authStore";

export default function App() {
  const [isHydrating, setIsHydrating] = useState(true);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    // Brief, deliberate pause so the loading screen registers rather than
    // flashing — matches the calm, premium feel of the rest of the app.
    const timeout = setTimeout(() => setIsHydrating(false), 500);
    return () => clearTimeout(timeout);
  }, [hydrate]);

  if (isHydrating) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
  <Route element={<MainLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/search" element={<Search />} />
    <Route path="/library" element={<Library />} />
    <Route path="/artists" element={<Artists />} />
    <Route path="/artists/:artistId" element={<Artists />} />
    <Route path="/albums" element={<Albums />} />
    <Route path="/playlists" element={<Playlists />} />
    <Route path="/playlists/:playlistId" element={<Playlists />} />
    <Route path="/add-song" element={<AddSong />} />
    <Route path="/bulk-upload" element={<BulkUpload />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Route>
</Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}