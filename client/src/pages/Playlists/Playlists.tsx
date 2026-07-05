import { useParams } from "react-router-dom";
import { ListMusic } from "lucide-react";
import { usePlaylists } from "@/hooks/useMusicData";
import { PlaylistCard } from "@/components/common/EntityCards";
import { GridSkeleton } from "@/components/common/loader";
import EmptyState from "@/components/common/EmptyState";
import PlaylistDetail from "./PlaylistDetail";

function PlaylistsGrid() {
  const { data: playlists, loading } = usePlaylists();

  return (
    <div className="pb-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-ahmedify-green mb-1.5">
          Your Collection
        </p>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Playlists
        </h1>
        <p className="text-sm text-ahmedify-text-secondary mt-1.5">
          {loading
            ? "Loading..."
            : `${playlists.length} playlist${playlists.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {loading && <GridSkeleton count={10} />}

      {!loading && playlists.length === 0 && (
        <EmptyState
          icon={<ListMusic size={20} />}
          title="No playlists yet"
          description="Create one from the Add Song page by selecting songs and giving it a name."
        />
      )}

      {!loading && playlists.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Playlists() {
  const { playlistId } = useParams<{ playlistId: string }>();
  return playlistId ? <PlaylistDetail /> : <PlaylistsGrid />;
}
