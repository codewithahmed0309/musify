import { LogOut, Shuffle, Repeat, Volume2, Music2, Mic2, Disc3, ListMusic } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";
import { useSongs, useArtists, useAlbums, usePlaylists } from "@/hooks/useMusicData";
import { LogoMark } from "@/components/brand/Logo";

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-ahmedify-card px-4 py-3">
      <div className="h-9 w-9 rounded-lg bg-ahmedify-green/10 text-ahmedify-green flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold leading-none tabular-nums">{value}</p>
        <p className="text-xs text-ahmedify-text-secondary mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Settings() {
  const logout = useAuthStore((s) => s.logout);
  const { repeatMode, isShuffled, volume } = usePlayerStore();

  const { data: songs } = useSongs();
  const { data: artists } = useArtists();
  const { data: albums } = useAlbums();
  const { data: playlists } = usePlaylists();

  return (
    <div className="pb-10 max-w-2xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-ahmedify-green mb-1.5">
          Preferences
        </p>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Settings
        </h1>
      </div>

      {/* Profile / account card */}
      <section className="relative overflow-hidden bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-5 mb-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, rgba(29,185,84,0.12), transparent 60%)",
          }}
        />
        <div className="relative flex items-center gap-4">
          <LogoMark size={48} />
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Private Musify instance</h2>
            <p className="text-sm text-ahmedify-text-secondary mt-0.5">
              You're signed in and ready to go.
            </p>
          </div>
          <button
            onClick={logout}
            className="ml-auto flex items-center gap-2 text-sm font-medium bg-ahmedify-card hover:bg-ahmedify-card-hover px-4 py-2 rounded-full transition-colors shrink-0"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </section>

      {/* Library stats */}
      <section className="mb-5">
        <h2 className="text-sm font-semibold text-ahmedify-text-secondary mb-3">
          Your Library
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatChip icon={<Music2 size={16} />} label="Songs" value={songs.length} />
          <StatChip icon={<Mic2 size={16} />} label="Artists" value={artists.length} />
          <StatChip icon={<Disc3 size={16} />} label="Albums" value={albums.length} />
          <StatChip
            icon={<ListMusic size={16} />}
            label="Playlists"
            value={playlists.length}
          />
        </div>
      </section>

      {/* Playback state */}
      <section className="bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-ahmedify-text-secondary mb-4">
          Playback
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-sm text-ahmedify-text-secondary">
              <Shuffle size={15} /> Shuffle
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isShuffled
                  ? "bg-ahmedify-green/15 text-ahmedify-green"
                  : "bg-ahmedify-card text-ahmedify-text-secondary"
              }`}
            >
              {isShuffled ? "On" : "Off"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-sm text-ahmedify-text-secondary">
              <Repeat size={15} /> Repeat
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                repeatMode !== "off"
                  ? "bg-ahmedify-green/15 text-ahmedify-green"
                  : "bg-ahmedify-card text-ahmedify-text-secondary"
              }`}
            >
              {repeatMode}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-sm text-ahmedify-text-secondary">
              <Volume2 size={15} /> Volume
            </span>
            <div className="flex items-center gap-2 w-32">
              <div className="h-1.5 flex-1 rounded-full bg-ahmedify-card overflow-hidden">
                <div
                  className="h-full rounded-full bg-ahmedify-green"
                  style={{ width: `${Math.round(volume * 100)}%` }}
                />
              </div>
              <span className="text-xs text-ahmedify-text-secondary tabular-nums w-9 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-ahmedify-text-secondary mb-2">
          About
        </h2>
        <p className="text-sm text-ahmedify-text-secondary">
          Musify — a private music streaming platform.
        </p>
        <p className="text-xs text-ahmedify-text-muted mt-1">Version 1.0.0</p>
      </section>
    </div>
  );
}
