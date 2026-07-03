import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-ahmedify-bg px-4">
      <div className="w-full max-w-sm animate-fadeIn">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-ahmedify-green flex items-center justify-center mb-4">
            <span className="text-black font-extrabold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Ahmedify</h1>
          <p className="text-sm text-ahmedify-text-secondary mt-1">
            Your private music, wherever you are.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ahmedify-bg-secondary border border-ahmedify-border rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-xs font-medium text-ahmedify-text-secondary"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ahmedify-green transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium text-ahmedify-text-secondary"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ahmedify-card border border-ahmedify-border rounded-xl px-4 py-2.5 pr-11 text-sm outline-none focus:border-ahmedify-green transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ahmedify-text-secondary hover:text-ahmedify-text"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex items-center justify-center gap-2 bg-ahmedify-green hover:bg-ahmedify-green-hover disabled:opacity-60 text-black font-semibold text-sm rounded-full py-2.5 transition-colors"
          >
            <Lock size={14} />
            {isSubmitting ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-xs text-ahmedify-text-muted mt-6">
          Private access only. No public registration.
        </p>
      </div>
    </div>
  );
}