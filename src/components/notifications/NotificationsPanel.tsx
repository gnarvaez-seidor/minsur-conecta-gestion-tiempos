"use client";

import { useEffect, useRef } from "react";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiInbox,
  FiAlertTriangle,
} from "react-icons/fi";
import { useTranslation } from "@/context/I18nContext";
import type { NotificationItem } from "@/services/notificationsService";
import { useNotifications } from "./hooks/useNotifications";
import {
  CATEGORY_ICON,
  CATEGORY_ACCENT,
  TAB_ORDER,
  tt,
  toLang,
  tabLabel,
  relativeTime,
  type Lang,
} from "./constants";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Sliding right-hand panel with category tabs, paginated list and read controls. */
export default function NotificationsPanel({ open, onClose }: Props) {
  const { locale } = useTranslation();
  const lang = toLang(locale);
  const {
    items,
    loading,
    error,
    unread,
    category,
    page,
    totalPages,
    hasPrev,
    hasNext,
    setCategory,
    nextPage,
    prevPage,
    markRead,
    readAll,
    load,
  } = useNotifications();

  const panelRef = useRef<HTMLElement>(null);

  // Refresh the list each time the panel opens; move focus in for a11y.
  useEffect(() => {
    if (open) {
      void load();
      panelRef.current?.focus();
    }
  }, [open, load]);

  // Esc closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const unreadLabel =
    unread === 1 ? tt(lang, "unreadOne") : tt(lang, "unreadMany", { n: unread });

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[rgba(6,24,28,0.45)] backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* panel */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={tt(lang, "title")}
        className={`absolute top-0 right-0 h-full w-full sm:max-w-md flex flex-col bg-[var(--card)] shadow-2xl outline-none transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* header */}
        <div className="px-5 py-4 text-white" style={{ background: "var(--grad-header)" }}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate">{tt(lang, "title")}</h2>
              <p className="text-[12px] text-white/75 mt-0.5">{unreadLabel}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void readAll()}
                disabled={unread === 0}
                title={tt(lang, "markAll")}
                aria-label={tt(lang, "markAll")}
                className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg text-white/90 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <FiCheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{tt(lang, "markAll")}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label={tt(lang, "close")}
                title={tt(lang, "close")}
                className="p-2 rounded-lg text-white/90 hover:bg-white/15 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="flex gap-1.5 px-3 py-2.5 border-b border-[var(--card-border)] overflow-x-auto">
          {TAB_ORDER.map((tab) => {
            const active = category === tab;
            return (
              <button
                key={tab || "all"}
                type="button"
                onClick={() => setCategory(tab)}
                aria-pressed={active}
                className={`whitespace-nowrap text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors ${
                  active
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]"
                }`}
              >
                {tabLabel(lang, tab)}
              </button>
            );
          })}
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto" aria-live="polite" aria-busy={loading}>
          {loading ? (
            <NotificationsSkeleton />
          ) : error ? (
            <ErrorState lang={lang} onRetry={() => void load()} />
          ) : items.length === 0 ? (
            <EmptyState lang={lang} />
          ) : (
            <ul className="divide-y divide-[var(--card-border)]">
              {items.map((n) => (
                <NotificationRow key={n.id} item={n} lang={lang} onRead={markRead} />
              ))}
            </ul>
          )}
        </div>

        {/* footer / pagination */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--card-border)] bg-[var(--card)]">
          <button
            type="button"
            onClick={prevPage}
            disabled={!hasPrev || loading}
            className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg text-[var(--foreground)] row-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiChevronLeft className="w-4 h-4" />
            {tt(lang, "prev")}
          </button>
          <span className="text-[12px] text-[var(--muted)] tabular-nums">
            {tt(lang, "pageOf", { page, total: totalPages })}
          </span>
          <button
            type="button"
            onClick={nextPage}
            disabled={!hasNext || loading}
            className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg text-[var(--foreground)] row-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tt(lang, "next")}
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </div>
  );
}

function NotificationRow({
  item,
  lang,
  onRead,
}: {
  item: NotificationItem;
  lang: Lang;
  onRead: (id: string) => void;
}) {
  const Icon = CATEGORY_ICON[item.category];
  const accent = CATEGORY_ACCENT[item.category];
  const unread = !item.read;

  return (
    <li className="animate-fade-in-up">
      <button
        type="button"
        onClick={() => {
          if (unread) onRead(item.id);
        }}
        className={`w-full text-left flex gap-3 px-4 py-3.5 row-hover transition-colors ${
          unread ? "bg-[var(--accent-light)]" : ""
        }`}
      >
        <span
          className="mt-0.5 w-9 h-9 rounded-xl grid place-items-center flex-shrink-0"
          style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}
        >
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span
              className={`text-[13px] truncate ${
                unread ? "font-semibold text-[var(--foreground)]" : "font-medium text-[var(--muted)]"
              }`}
            >
              {item.title}
            </span>
            {unread && (
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "var(--accent)" }}
                aria-hidden="true"
              />
            )}
          </span>
          <span className="block text-[12px] text-[var(--muted)] mt-0.5 line-clamp-2">
            {item.message}
          </span>
          <span className="block text-[11px] text-[var(--muted)] mt-1">
            {relativeTime(item.createdAt, lang)}
          </span>
        </span>
      </button>
    </li>
  );
}

function EmptyState({ lang }: { lang: Lang }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 py-16 animate-fade-in-up">
      <span className="w-14 h-14 rounded-2xl grid place-items-center bg-[var(--accent-light)] text-[var(--accent)] mb-4">
        <FiInbox className="w-7 h-7" />
      </span>
      <p className="text-sm font-semibold text-[var(--foreground)]">{tt(lang, "emptyTitle")}</p>
      <p className="text-[12px] text-[var(--muted)] mt-1 max-w-[220px]">{tt(lang, "emptySub")}</p>
    </div>
  );
}

function ErrorState({ lang, onRetry }: { lang: Lang; onRetry: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 py-16 animate-fade-in-up">
      <span className="w-14 h-14 rounded-2xl grid place-items-center bg-[var(--accent-light)] text-[#ef4444] mb-4">
        <FiAlertTriangle className="w-7 h-7" />
      </span>
      <p className="text-sm font-semibold text-[var(--foreground)]">{tt(lang, "errTitle")}</p>
      <p className="text-[12px] text-[var(--muted)] mt-1 max-w-[220px]">{tt(lang, "errSub")}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 text-[12px] font-semibold px-4 py-2 rounded-lg text-white seidor-glow"
        style={{ background: "var(--grad-accent)" }}
      >
        {tt(lang, "retry")}
      </button>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <ul className="divide-y divide-[var(--card-border)]">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex gap-3 px-4 py-3.5">
          <div className="animate-shimmer rounded-xl w-9 h-9 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="animate-shimmer rounded h-3.5 w-2/3 mb-2" />
            <div className="animate-shimmer rounded h-3 w-full mb-1.5" />
            <div className="animate-shimmer rounded h-2.5 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}
