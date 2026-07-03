import { NavLink } from "react-router-dom";
import { Home, Search, Library, Settings } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";

const ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const currentSong = usePlayerStore((s) => s.currentSong);

  return (
    <nav
      className="md:hidden fixed left-0 right-0 z-30 bg-ahmedify-bg-secondary border-t border-ahmedify-border flex items-center justify-around h-14"
      style={{ bottom: currentSong ? "5rem" : 0 }}
    >
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] ${
              isActive ? "text-ahmedify-green" : "text-ahmedify-text-secondary"
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}