import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import Button from "@/components/common/Button";
import { LogoMark } from "@/components/brand/Logo";
import type { AuthResponse } from "@/types";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await api.post<AuthResponse>("/auth/login", {
        username,
        password,
      });
      login(res.data.token, res.data.expiresAt);
      const redirectTo = (location.state as { from?: string })?.from ?? "/";
      navigate(redirectTo, { replace: true });
    } catch {
      setError("Incorrect username or password.");
      showToast("Login failed. Check your username and password.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // `text-ahmedify-text` here is the actual fix for the "letters aren't
    // visible" bug: this page renders outside <MainLayout>, which is the
    // only place a text color was ever set globally, so every input/heading
    // here was inheriting the browser's default black text on a near-black
    // background.
    <div className="relative min-h-screen w-full flex items-center justify-center bg-ahmedify-bg text-ahmedify-text px-4 overflow-hidden">
      {/* Ambient background glow — pure decoration, sits behind everything */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-ahmedify-green/25 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-emerald-400/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative w-full max-w-sm animate-fadeIn">
        <div className="flex flex-col items-center mb-8">
          <LogoMark size={68} glow className="mb-4" />
          <h1 className="text-3xl font-extrabold tracking-tight text-ahmedify-text">
            Mus<span className="text-ahmedify-green">ify</span>
          </h1>
          <p className="text-sm text-ahmedify-text-secondary mt-1.5 text-center">
            Your private music, wherever you are.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ahmedify-bg-secondary/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col gap-4 shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-xs font-medium text-ahmedify-text-secondary"
            >
              Username
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ahmedify-text-muted pointer-events-none"
              />
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                disabled={isSubmitting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-ahmedify-card text-ahmedify-text placeholder:text-ahmedify-text-muted caret-ahmedify-green border border-ahmedify-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-ahmedify-green focus:ring-1 focus:ring-ahmedify-green/40 transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium text-ahmedify-text-secondary"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ahmedify-text-muted pointer-events-none"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-ahmedify-card text-ahmedify-text placeholder:text-ahmedify-text-muted caret-ahmedify-green border border-ahmedify-border rounded-xl pl-10 pr-11 py-2.5 text-sm font-medium outline-none focus:border-ahmedify-green focus:ring-1 focus:ring-ahmedify-green/40 transition-colors disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ahmedify-text-secondary hover:text-ahmedify-text transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting}
            icon={<Lock size={14} />}
            fullWidth
            size="lg"
            className="mt-2"
          >
            {isSubmitting ? "Signing in..." : "Log in"}
          </Button>
        </form>

        <p className="text-center text-xs text-ahmedify-text-muted mt-6">
          Private access only. No public registration.
        </p>
      </div>
    </div>
  );
}
