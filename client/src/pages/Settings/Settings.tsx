import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";

export default function Settings() {
  const logout = useAuthStore((s) => s.logout);
  const { repeatMode, isShuffled, volume } = usePlayerStore();

  return (
    <div className="pb-6 max-w-lg">
      <h1 className="text-xl font-bold tracking-tight mt-1 mb-6">Settings</h1>

      <section className="bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-ahmedify-text-secondary mb-3">
          Account
        </h2>
        <p className="text-sm text-ahmedify-text-secondary mb-4">
          You're signed in to this private Ahmedify instance.
        </p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium bg-ahmedify-card hover:bg-ahmedify-card-hover px-4 py-2 rounded-full transition-colors"
        >
          <LogOut size={15} />
          Log out
        </button>
      </section>

      <section className="bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-ahmedify-text-secondary mb-3">
          Playback
        </h2>
        <dl className="text-sm flex flex-col gap-2">
          <div className="flex justify-between">
            <dt className="text-ahmedify-text-secondary">Shuffle</dt>
            <dd>{isShuffled ? "On" : "Off"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ahmedify-text-secondary">Repeat</dt>
            <dd className="capitalize">{repeatMode}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ahmedify-text-secondary">Volume</dt>
            <dd>{Math.round(volume * 100)}%</dd>
          </div>
        </dl>
      </section>

      <section className="bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-ahmedify-text-secondary mb-3">
          About
        </h2>
        <p className="text-sm text-ahmedify-text-secondary">
          Ahmedify — a private music streaming platform. Version 1.0.0
        </p>
      </section>
    </div>
  );
}