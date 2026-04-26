"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { fetchMe, logout as apiLogout, type AuthUser } from "@/lib/auth-api";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "guest"; user: null }
  | { status: "authed"; user: AuthUser };

type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  const refresh = useCallback(async () => {
    setState({ status: "loading", user: null });
    try {
      const me = await fetchMe();
      if (me?.user) {
        setState({ status: "authed", user: me.user });
      } else {
        setState({ status: "guest", user: null });
      }
    } catch {
      setState({ status: "guest", user: null });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setState({ status: "guest", user: null });
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      refresh,
      logout,
    }),
    [state, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth должен вызываться внутри AuthProvider");
  }
  return ctx;
}
