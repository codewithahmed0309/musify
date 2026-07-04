import { NavLink } from "react-router-dom";
import {
  Home,
  Search,
  Library,
  Mic2,
  Disc3,
  ListMusic,
  Settings,
} from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
  { to: "/artists", label: "Artists", icon: Mic2 },
  { to: "/albums", label: "Albums", icon: Disc3 },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 h-full bg-ahmedify-bg-secondary border-r border-ahmedify-border px-3 py-5">
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <LogoMark size={32} />
        <span className="font-bold text-lg tracking-tight">
          Mus<span className="text-ahmedify-green">ify</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-ahmedify-card text-ahmedify-text"
                  : "text-ahmedify-text-secondary hover:text-ahmedify-text hover:bg-ahmedify-card/60"
              }`
            }
          >
            <Icon size={20} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? "bg-ahmedify-card text-ahmedify-text"
                : "text-ahmedify-text-secondary hover:text-ahmedify-text hover:bg-ahmedify-card/60"
            }`
          }
        >
          <Settings size={20} strokeWidth={2} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}