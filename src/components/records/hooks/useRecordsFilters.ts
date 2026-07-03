"use client";

import { useMemo } from "react";
import type { RecordFilters, RecordItem } from "../types";

export interface RecordStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export function useRecordsFilters(data: RecordItem[], filters: RecordFilters) {
  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return data.filter((r) => {
      if (q && !r.code.toLowerCase().includes(q) && !r.title.toLowerCase().includes(q)) return false;
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.from && r.date < filters.from) return false;
      if (filters.to && r.date > filters.to) return false;
      return true;
    });
  }, [data, filters]);

  const stats = useMemo<RecordStats>(
    () => ({
      total: data.length,
      approved: data.filter((r) => r.status === "approved").length,
      pending: data.filter((r) => r.status === "pending").length,
      rejected: data.filter((r) => r.status === "rejected").length,
    }),
    [data],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.search.trim()) n++;
    if (filters.status !== "all") n++;
    if (filters.from) n++;
    if (filters.to) n++;
    return n;
  }, [filters]);

  return { filtered, stats, activeFilterCount };
}
