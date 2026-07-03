import { usePlaylists } from "@/hooks/useMusicData";
import { PlaylistCard } from "@/components/common/EntityCards";

export default function Playlists() {
  const { data: playlists, loading } = usePlaylists();

  return (
    <div className="pb-6">
      <h1 className="text-xl font-bold tracking-tight mt-1 mb-4">
        Playlists
      </h1>

      {loading && (
        <p className="text-sm text-ahmedify-text-secondary">Loading...</p>
      )}
      {!loading && playlists.length === 0 && (
        <p className="text-sm text-ahmedify-text-secondary">
          No playlists yet.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
}