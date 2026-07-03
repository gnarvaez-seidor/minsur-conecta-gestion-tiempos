import type { IconType } from "react-icons";
import { FiCheckSquare, FiActivity, FiCalendar, FiRefreshCw } from "react-icons/fi";
import type { NotificationCategory, CategoryFilter } from "@/services/notificationsService";

/** Page size for the panel list (matches the backend default). */
export const PAGE_SIZE = 8;
/** Lightweight badge polling interval. */
export const POLL_MS = 45_000;

/** Icon per category (react-icons/fi, per CLAUDE.md). */
export const CATEGORY_ICON: Record<NotificationCategory, IconType> = {
  approval: FiCheckSquare,
  status: FiActivity,
  cutoff: FiCalendar,
  replication: FiRefreshCw,
};

/**
 * Accent per category. approval/status ride the teal tokens; cutoff/replication use amber/red
 * (same hex convention as the roster CodeChip legend — no token exists for those states).
 */
export const CATEGORY_ACCENT: Record<NotificationCategory, string> = {
  approval: "var(--accent)",
  status: "var(--mint)",
  cutoff: "#f59e0b",
  replication: "#ef4444",
};

/** Tab order — "" is the "all categories" tab. */
export const TAB_ORDER: CategoryFilter[] = ["", "approval", "status", "cutoff", "replication"];

// ── Local bilingual dictionary (keeps the strict global i18n typing untouched) ──

export type Lang = "en" | "es";

export const L: Record<Lang, Record<string, string>> = {
  es: {
    title: "Notificaciones",
    unreadOne: "1 sin leer",
    unreadMany: "{n} sin leer",
    markAll: "Marcar todo como leído",
    close: "Cerrar",
    open: "Abrir notificaciones",
    tab_all: "Todas",
    tab_approval: "Por aprobar",
    tab_status: "Mis solicitudes",
    tab_cutoff: "Cierre",
    tab_replication: "Réplica",
    emptyTitle: "Sin notificaciones",
    emptySub: "Estás al día. No hay nada por revisar aquí.",
    errTitle: "No se pudieron cargar",
    errSub: "Ocurrió un error al obtener tus notificaciones.",
    retry: "Reintentar",
    prev: "Anterior",
    next: "Siguiente",
    pageOf: "{page}/{total}",
    now: "ahora",
    minute: "hace {n} min",
    hour: "hace {n} h",
    day: "hace {n} d",
  },
  en: {
    title: "Notifications",
    unreadOne: "1 unread",
    unreadMany: "{n} unread",
    markAll: "Mark all as read",
    close: "Close",
    open: "Open notifications",
    tab_all: "All",
    tab_approval: "To approve",
    tab_status: "My requests",
    tab_cutoff: "Cutoff",
    tab_replication: "Replication",
    emptyTitle: "No notifications",
    emptySub: "You're all caught up. Nothing to review here.",
    errTitle: "Couldn't load",
    errSub: "Something went wrong fetching your notifications.",
    retry: "Retry",
    prev: "Previous",
    next: "Next",
    pageOf: "{page}/{total}",
    now: "now",
    minute: "{n}m ago",
    hour: "{n}h ago",
    day: "{n}d ago",
  },
};

/** Local translate: resolves a key against the dictionary and interpolates {vars}. */
export function tt(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let out = L[lang][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return out;
}

/** Narrow the global Locale ("en" | "es") to the local Lang without coupling to the i18n types. */
export function toLang(locale: string): Lang {
  return locale === "en" ? "en" : "es";
}

export function tabLabel(lang: Lang, cat: CategoryFilter): string {
  switch (cat) {
    case "":
      return tt(lang, "tab_all");
    case "approval":
      return tt(lang, "tab_approval");
    case "status":
      return tt(lang, "tab_status");
    case "cutoff":
      return tt(lang, "tab_cutoff");
    case "replication":
      return tt(lang, "tab_replication");
  }
}

/** Bilingual relative time from an ISO date. */
export function relativeTime(iso: string, lang: Lang): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMin = Math.max(0, Math.round((Date.now() - then) / 60_000));
  if (diffMin < 1) return tt(lang, "now");
  if (diffMin < 60) return tt(lang, "minute", { n: diffMin });
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return tt(lang, "hour", { n: hours });
  const days = Math.floor(hours / 24);
  return tt(lang, "day", { n: days });
}
