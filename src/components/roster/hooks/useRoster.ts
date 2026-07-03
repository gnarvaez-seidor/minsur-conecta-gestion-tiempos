"use client";

import { useCallback, useEffect, useState } from "react";
import { rosterService } from "@/services/rosterService";
import type { RosterMaster } from "../types";

/** Loads roster master data (mock or real via gateway). Mirrors the canonical useRecords hook. */
export function useRoster() {
  const [data, setData] = useState<RosterMaster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setData(await rosterService.master());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
