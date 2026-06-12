"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/features/auth/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" };

type AuthContextValue = {
  user: User | undefined;
  loading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
};

// ── Context ───────────────────────────────────────────────────────────────────

// createContext requires a default value — we use null and assert below
const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setState({ status: "unauthenticated" });
        return;
      }
      const { user } = await res.json();
      setState({ status: "authenticated", user });
    } catch {
      setState({ status: "unauthenticated" });
    }
  }, []);

  // Fetch current user once on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ status: "unauthenticated" });
    router.push("/login");
  }

  const value: AuthContextValue = {
    user: state.status === "authenticated" ? state.user : undefined,
    loading: state.status === "loading",
    logout,
    refetchUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

// Custom hook that reads from the context — throws if used outside AuthProvider
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
