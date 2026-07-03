import { useNavigate } from "react-router-dom";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function Header() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-16 bg-ahmedify-bg/85 backdrop-blur-md border-b border-ahmedify-border">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="h-8 w-8 flex items-center justify-center rounded-full bg-ahmedify-card hover:bg-ahmedify-card-hover transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => navigate(1)}
          aria-label="Go forward"
          className="h-8 w-8 flex items-center justify-center rounded-full bg-ahmedify-card hover:bg-ahmedify-card-hover transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 text-sm font-medium text-ahmedify-text-secondary hover:text-ahmedify-text transition-colors px-3 py-1.5 rounded-full hover:bg-ahmedify-card"
      >
        <LogOut size={16} />
        Log out
      </button>
    </header>
  );
}