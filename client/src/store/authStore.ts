import { create } from "zustand";

const STORAGE_KEY = "ahmedify_auth";

interface StoredAuth {
  token: string;
  expiresAt: number;
}

interface AuthState {
  token: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  login: (token: string, expiresAt: number) => void;
  logout: () => void;
  hydrate: () => void;
}

function readStorage(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredAuth = JSON.parse(raw);
    if (!parsed.token || Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  expiresAt: null,
  isAuthenticated: false,

  login: (token, expiresAt) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, expiresAt }));
    set({ token, expiresAt, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, expiresAt: null, isAuthenticated: false });
  },

  hydrate: () => {
    const stored = readStorage();
    if (stored) {
      set({
        token: stored.token,
        expiresAt: stored.expiresAt,
        isAuthenticated: true,
      });
    }
  },
}));