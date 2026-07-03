"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  list as listNotifications,
  count as countNotifications,
  markRead as markReadService,
  readAll as readAllService,
  type NotificationItem,
  type NotificationStatus,
  type CategoryFilter,
} from "@/services/notificationsService";
import { PAGE_SIZE, POLL_MS } from "../constants";

interface UseNotificationsOptions {
  /** Fetch the full list on mount (panel). Default false — the bell only needs the count. */
  autoLoad?: boolean;
  /** Poll the unread count every POLL_MS for the badge (bell). Default false. */
  poll?: boolean;
  size?: number;
}

/**
 * Notifications state + actions. Used twice: the bell (poll:true, count only) and the panel
 * (loads the list on open). Each consumer owns its instance; the badge is best-effort and
 * re-synced when the panel closes. Client-only (setInterval is cleaned up on unmount).
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const { autoLoad = false, poll = false, size = PAGE_SIZE } = options;

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [category, setCategoryState] = useState<CategoryFilter>("");
  const [status, setStatusState] = useState<NotificationStatus>("all");

  // Latest filter values, so callbacks stay stable but read fresh state.
  const stateRef = useRef({ page, category, status });
  stateRef.current = { page, category, status };
  const itemsRef = useRef<NotificationItem[]>(items);
  itemsRef.current = items;

  const load = useCallback(
    async (opts?: { page?: number; category?: CategoryFilter; status?: NotificationStatus }) => {
      const p = opts?.page ?? stateRef.current.page;
      const cat = opts?.category ?? stateRef.current.category;
      const st = opts?.status ?? stateRef.current.status;
      setLoading(true);
      setError(false);
      try {
        const res = await listNotifications({ page: p, size, status: st, category: cat });
        setItems(res.items);
        setTotal(res.total);
        setUnread(res.unread);
        setPage(res.page);
      } catch {
        setError(true);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [size],
  );

  const refreshCount = useCallback(async () => {
    try {
      const res = await countNotifications();
      setUnread(res.unread);
    } catch {
      /* badge is best-effort — stay silent */
    }
  }, []);

  const refresh = useCallback(() => load(), [load]);

  const setCategory = useCallback(
    (cat: CategoryFilter) => {
      setCategoryState(cat);
      setPage(1);
      void load({ page: 1, category: cat });
    },
    [load],
  );

  const setStatus = useCallback(
    (st: NotificationStatus) => {
      setStatusState(st);
      setPage(1);
      void load({ page: 1, status: st });
    },
    [load],
  );

  const totalPages = Math.max(1, Math.ceil(total / size));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const nextPage = useCallback(() => {
    const next = stateRef.current.page + 1;
    setPage(next);
    void load({ page: next });
  }, [load]);

  const prevPage = useCallback(() => {
    const prev = Math.max(1, stateRef.current.page - 1);
    setPage(prev);
    void load({ page: prev });
  }, [load]);

  const markRead = useCallback(
    async (id: string) => {
      const target = itemsRef.current.find((n) => n.id === id);
      if (!target || target.read) return; // nothing to do
      // optimistic
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
      try {
        await markReadService(id);
      } catch {
        void load(); // reconcile with server on failure
      }
    },
    [load],
  );

  const readAll = useCallback(async () => {
    setItems((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
    setUnread(0);
    try {
      await readAllService();
    } catch {
      /* ignore */
    } finally {
      void load(); // resync total/unread from server
    }
  }, [load]);

  // Initial count (cheap) always; the full list only when autoLoad.
  useEffect(() => {
    void refreshCount();
    if (autoLoad) void load();
  }, [autoLoad, load, refreshCount]);

  // Lightweight badge polling.
  useEffect(() => {
    if (!poll) return;
    const id = window.setInterval(() => {
      void refreshCount();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [poll, refreshCount]);

  return {
    items,
    page,
    size,
    total,
    totalPages,
    unread,
    loading,
    error,
    category,
    status,
    hasPrev,
    hasNext,
    setCategory,
    setStatus,
    nextPage,
    prevPage,
    markRead,
    readAll,
    refresh,
    refreshCount,
    load,
  };
}
