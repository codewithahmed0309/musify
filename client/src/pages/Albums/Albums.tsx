import { useAlbums } from "@/hooks/useMusicData";

export default function Albums() {
  const { data: albums, loading } = useAlbums();

  return (
    <div className="pb-6">
      <h1 className="text-xl font-bold tracking-tight mt-1 mb-4">Albums</h1>

      {loading && (
        <p className="text-sm text-ahmedify-text-secondary">Loading...</p>
      )}
      {!loading && albums.length === 0 && (
        <p className="text-sm text-ahmedify-text-secondary">No albums yet.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {albums.map((album) => (
          <div
            key={album.id}
            className="rounded-xl p-3 bg-ahmedify-card hover:bg-ahmedify-card-hover transition-colors"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-ahmedify-bg-secondary mb-3">
              {album.cover_url ? (
                <img
                  src={album.cover_url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <p className="text-sm font-medium truncate">{album.title}</p>
            <p className="text-xs text-ahmedify-text-secondary truncate mt-0.5">
              {album.artist_name}
              {album.release_year ? ` · ${album.release_year}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}