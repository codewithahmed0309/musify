import { useNavigate } from "react-router-dom";
import type { Artist, Playlist } from "@/types";

export function ArtistCard({ artist }: { artist: Artist }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/artists/${artist.id}`)}
      className="flex flex-col items-center text-center w-32 md:w-36 shrink-0 rounded-xl p-3 bg-ahmedify-card hover:bg-ahmedify-card-hover transition-colors"
    >
      <div className="h-24 w-24 rounded-full overflow-hidden bg-ahmedify-bg-secondary mb-3">
        {artist.image_url ? (
          <img
            src={artist.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <p className="text-sm font-medium truncate w-full">{artist.name}</p>
      <p className="text-xs text-ahmedify-text-secondary mt-0.5">Artist</p>
    </button>
  );
}

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/playlists/${playlist.id}`)}
      className="flex flex-col text-left w-40 md:w-44 shrink-0 rounded-xl p-3 bg-ahmedify-card hover:bg-ahmedify-card-hover transition-colors"
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-ahmedify-bg-secondary mb-3">
        {playlist.cover_url ? (
          <img
            src={playlist.cover_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <p className="text-sm font-medium truncate">{playlist.name}</p>
      <p className="text-xs text-ahmedify-text-secondary truncate mt-0.5">
        {playlist.song_ids.length} songs
      </p>
    </button>
  );
}