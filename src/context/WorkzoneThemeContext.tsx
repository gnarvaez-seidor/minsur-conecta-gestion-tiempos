"use client";

/**
 * WorkzoneThemeContext — single source of truth for the app theme, synced with the theme
 * selected by the user in SAP Build Work Zone. Ported from the medifarma useWorkzoneTheme,
 * adapted for Next static export:
 *   - drives the `.dark` class on <html> (Tailwind v4 class-based dark mode) instead of MUI;
 *   - hydration-safe: initial render is deterministic ('light'); the real initial mode is
 *     read from window in a useEffect (avoids SSG/CSR mismatch).
 *
 * Initial-mode sources (priority): manual override (sessionStorage, only OUTSIDE Workzone)
 * → `?wzTheme=` query param (Component.js) → light by default (dark is opt-in via the manual
 * toggle, NOT OS-driven). Runtime changes arrive via postMessage
 * `{ source:'workzone-bridge', type:'theme-changed', theme }`.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "seidor-theme-mode-override";

export function detectModeFromTheme(themeId: string | null | undefined): ThemeMode {
  if (!themeId) return "light";
  const t = themeId.toLowerCase();
  if (t.includes("_dark") || t.includes("_hcb") || t.includes("_hcd")) return "dark";
  return "light";
}

export function isInsideWorkzone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).has("wzTheme");
  } catch {
    return false;
  }
}

function readManualOverride(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function writeManualOverride(mode: ThemeMode | null) {
  if (typeof window === "undefined") return;
  try {
    if (mode === null) window.sessionStorage.removeItem(STORAGE_KEY);
    else window.sessionStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

function readInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  if (!isInsideWorkzone()) {
    const manual = readManualOverride();
    if (manual) return manual;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const wzTheme = params.get("wzTheme");
    if (wzTheme) return detectModeFromTheme(wzTheme);
  } catch {
    /* ignore */
  }
  // Default is light regardless of the OS: dark is opt-in via the manual toggle (standalone)
  // or driven by the launchpad theme inside Workzone.
  return "light";
}

export interface WorkzoneThemeApi {
  mode: ThemeMode;
  /** Manual toggle (only effective OUTSIDE Workzone). Persists to sessionStorage. */
  toggle: () => void;
  /** true when the manual toggle is enabled (= outside Workzone). */
  canToggle: boolean;
}

const WorkzoneThemeContext = createContext<WorkzoneThemeApi | null>(null);

export const WorkzoneThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Deterministic initial render for SSG/hydration; real mode read on mount.
  const [mode, setMode] = useState<ThemeMode>("light");
  const [canToggle, setCanToggle] = useState(true);

  const setModeWithTransition = useCallback((next: ThemeMode) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("theme-transitioning");
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 450);
    }
    setMode(next);
  }, []);

  // Resolve the real initial mode + canToggle on the client (hydration-safe).
  useEffect(() => {
    setCanToggle(!isInsideWorkzone());
    setMode(readInitialMode());
  }, []);

  // Reflect mode onto the <html> class so CSS variables swap.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  // Runtime theme bridge + prefers-color-scheme fallback.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event?.data;
      if (
        data &&
        typeof data === "object" &&
        data.source === "workzone-bridge" &&
        data.type === "theme-changed"
      ) {
        writeManualOverride(null);
        setModeWithTransition(detectModeFromTheme(data.theme));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setModeWithTransition]);

  const toggle = useCallback(() => {
    if (!canToggle) return;
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    writeManualOverride(next);
    setModeWithTransition(next);
  }, [canToggle, mode, setModeWithTransition]);

  const value = useMemo<WorkzoneThemeApi>(
    () => ({ mode, toggle, canToggle }),
    [mode, toggle, canToggle],
  );

  return <WorkzoneThemeContext.Provider value={value}>{children}</WorkzoneThemeContext.Provider>;
};

export function useWorkzoneTheme(): WorkzoneThemeApi {
  const ctx = useContext(WorkzoneThemeContext);
  if (!ctx) {
    throw new Error("useWorkzoneTheme must be used inside <WorkzoneThemeProvider>.");
  }
  return ctx;
}
