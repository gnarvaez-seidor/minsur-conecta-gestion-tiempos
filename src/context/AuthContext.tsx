"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { activeStrategy, installAuthStrategy, sessionStore, type Session } from "@/auth";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  /** Used by the /login view to set a session manually (paste a token in dev). */
  login: (session: Session) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    installAuthStrategy(); // wire the active strategy into httpClient before any call

    // Safety net: never let the auth gate hang the UI. In Workzone, the xsuaa-protected
    // /useridp call can stall behind an IdP redirect that cannot complete inside the iframe;
    // without this, the app is stuck on "Verifying session…" forever. After the timeout we
    // resolve the gate (falling through to login) and log WHY for diagnosis.
    const BOOTSTRAP_TIMEOUT_MS = 8000;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`auth bootstrap timed out after ${BOOTSTRAP_TIMEOUT_MS}ms`)),
        BOOTSTRAP_TIMEOUT_MS,
      );
    });

    (async () => {
      try {
        const s = await Promise.race([activeStrategy.bootstrap(), timeout]);
        if (cancelled) return;
        if (s) {
          sessionStore.set(s);
          setSession(s);
        }
      } catch (err) {
        // Surfaced in the browser console to diagnose Workzone auth issues
        // (Role Collection, trusted domains / IdP, or missing destinations).
        console.error("[auth] bootstrap failed:", err);
      } finally {
        if (timer) clearTimeout(timer);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const login = (s: Session) => {
    sessionStore.set(s);
    setSession(s);
  };

  const logout = () => {
    sessionStore.clear();
    setSession(null);
    if (typeof window !== "undefined") window.location.hash = "#/login";
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, isAuthenticated: !!session, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
