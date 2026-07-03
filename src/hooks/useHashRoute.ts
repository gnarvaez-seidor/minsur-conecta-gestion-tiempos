"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Tiny hash router for the Workzone iframe constraint: the html5 runtime has no SPA fallback,
 * so deep links must never reach the server as real paths. Everything after `#` is client-only,
 * so a single physical index.html serves every route — no host config, no 404 on reload.
 */
export type RouteName = "roster" | "profile" | "records" | "login" | "demo";
export interface HashRoute {
  name: RouteName;
}

function parseHash(): HashRoute {
  if (typeof window === "undefined") return { name: "roster" };
  const head = window.location.hash.replace(/^#\/?/, "").split(/[/?]/)[0];
  if (head === "login") return { name: "login" };
  if (head === "demo") return { name: "demo" };
  if (head === "profile") return { name: "profile" };
  if (head === "records") return { name: "records" };
  return { name: "roster" };
}

export function useHashRoute() {
  // Deterministic initial value for hydration; synced to the real hash on mount.
  const [route, setRoute] = useState<HashRoute>({ name: "roster" });

  useEffect(() => {
    if (!window.location.hash) window.location.hash = "#/roster";
    const sync = () => setRoute(parseHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const navigate = useCallback((name: RouteName) => {
    window.location.hash = `#/${name}`;
  }, []);

  return { route, navigate };
}
