import { useArtists } from "@/hooks/useMusicData";
import { ArtistCard } from "@/components/common/EntityCards";

export default function Artists() {
  const { data: artists, loading } = useArtists();

  return (
    <div className="pb-6">
      <h1 className="text-xl font-bold tracking-tight mt-1 mb-4">Artists</h1>

      {loading && (
        <p className="text-sm text-ahmedify-text-secondary">Loading...</p>
      )}
      {!loading && artists.length === 0 && (
        <p className="text-sm text-ahmedify-text-secondary">
          No artists yet.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  );
}