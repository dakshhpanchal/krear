import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { API_BASE, tokenStore } from "./api";

interface AuthState {
  isAuthenticated: boolean;
  ready: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function decodeUsername(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as Record<string, unknown>;
    return (payload.username as string) ?? (payload.user_id ? `user #${payload.user_id}` : null);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setToken(tokenStore.access);
    sync();
    setReady(true);
    window.addEventListener("krear:auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("krear:auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      throw new Error(
        res.status === 401 ? "Invalid credentials." : `Sign in failed (${res.status}).`,
      );
    }
    const data = (await res.json()) as { access: string; refresh: string };
    tokenStore.set(data.access, data.refresh);
  }, []);

  const logout = useCallback(() => tokenStore.clear(), []);

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: Boolean(token),
      ready,
      username: decodeUsername(token),
      login,
      logout,
    }),
    [token, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
