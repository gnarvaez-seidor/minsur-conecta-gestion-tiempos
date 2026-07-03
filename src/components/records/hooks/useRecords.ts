"use client";

import { useCallback, useEffect, useState } from "react";
import { recordsService } from "@/services/recordsService";
import type { RecordItem } from "../types";

export function useRecords() {
  const [data, setData] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await recordsService.list());
    } catch {
      setError("load_failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { data, loading, error, refetch: fetchRecords };
}
