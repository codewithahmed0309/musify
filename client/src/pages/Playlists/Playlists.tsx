import { usePlaylists } from "@/hooks/useMusicData";
import { PlaylistCard } from "@/components/common/EntityCards";
import { GridSkeleton } from "@/components/common/loader";
import EmptyState from "@/components/common/EmptyState";

export default function Playlists() {
  const { data: playlists, loading } = usePlaylists();

  return (
    <div className="pb-6">
      <h1 className="text-xl font-bold tracking-tight mt-1 mb-4">
        Playlists
      </h1>

      {loading && <GridSkeleton count={10} />}

      {!loading && playlists.length === 0 && (
        <EmptyState
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
