import { httpClient } from "@/services/httpClient";

/**
 * Notifications adapter: mock (offline) vs real. Same shape as rosterService — the real path
 * goes through the gateway to the "notifications" compuesto in apiintegración
 * (front → gateway → notifications/rest/notifications). In mock mode it serves ~26 in-memory
 * fixtures covering the 4 categories with client-side pagination and read/unread state.
 */
const USE_MOCK =
  process.env.NEXT_PUBLIC_AUTH_STRATEGY === "mock" ||
  process.env.NEXT_PUBLIC_USE_MOCK === "true";

/** Gateway prefix for the notifications composite service. Routes are appended verbatim. */
const GATEWAY = "dest-apigateway/api/compuesto/notifications";

// ── Types ────────────────────────────────────────────────────────────────────

export type NotificationCategory = "approval" | "status" | "cutoff" | "replication";
export type NotificationStatus = "all" | "unread";
/** '' means "every category" (no server-side filter). */
export type CategoryFilter = NotificationCategory | "";

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string; // ISO 8601
  read: boolean;
  meta?: Record<string, unknown>;
}

export interface NotificationsPage {
  origen: string;
  user: string;
  page: number;
  size: number;
  /** items matching the current filter (for pagination) */
  total: number;
  /** global unread count (for the badge) */
  unread: number;
  items: NotificationItem[];
}

export interface ListParams {
  page: number;
  size: number;
  status: NotificationStatus;
  category?: CategoryFilter;
}

export interface CountResult {
  unread: number;
}

// ── Mock ───────────────────────────────────────────────────────────────────

type Lang = "en" | "es";

interface Seed {
  id: string;
  category: NotificationCategory;
  es: { title: string; message: string };
  en: { title: string; message: string };
  /** age of the notification, in minutes, relative to now */
  minutesAgo: number;
  read: boolean;
  meta?: Record<string, unknown>;
}

/** Same locale detection the I18nContext uses, so mock content matches the UI language. */
function mockLocale(): Lang {
  if (typeof window === "undefined") return "es";
  try {
    const stored = window.localStorage.getItem("locale");
    if (stored === "en") return "en";
    if (stored === "es") return "es";
    if (navigator.language?.toLowerCase().startsWith("es")) return "es";
    return "en";
  } catch {
    return "es";
  }
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** ~26 fixtures, newest first, covering the 4 categories. Authored once, cached at module scope. */
function buildSeeds(): Seed[] {
  return [
    {
      id: "n01", category: "approval", minutesAgo: 3, read: false, meta: { employee: "Cuba Aguirre Gabriel", code: "VAC" },
      es: { title: "Vacaciones por aprobar", message: "Cuba Aguirre Gabriel solicita vacaciones del 09 al 22 de mayo." },
      en: { title: "Vacation to approve", message: "Cuba Aguirre Gabriel requests vacation from May 9 to May 22." },
    },
    {
      id: "n02", category: "replication", minutesAgo: 8, read: false, meta: { infotipo: "2001", employee: "Cuba Aguirre Gabriel" },
      es: { title: "Error de réplica al infotipo 2001", message: "Falló la réplica de la ausencia de Cuba Aguirre. Requiere reintento." },
      en: { title: "Replication error to infotype 2001", message: "Replication of Cuba Aguirre's absence failed. Retry required." },
    },
    {
      id: "n03", category: "approval", minutesAgo: 22, read: false, meta: { employee: "Gutierrez Vargas Pedro" },
      es: { title: "Horas extra por aprobar", message: "Gutierrez Vargas Pedro registró 6 h extra el 21 de mayo." },
      en: { title: "Overtime to approve", message: "Gutierrez Vargas Pedro logged 6 h of overtime on May 21." },
    },
    {
      id: "n04", category: "status", minutesAgo: 40, read: false,
      es: { title: "Tu solicitud de vacaciones fue aprobada", message: "Tu líder aprobó tus vacaciones del 16 al 29 de mayo." },
      en: { title: "Your vacation request was approved", message: "Your lead approved your vacation from May 16 to May 29." },
    },
    {
      id: "n05", category: "cutoff", minutesAgo: 55, read: false,
      es: { title: "Cierre de mayo en 3 días", message: "El periodo de mayo cierra el 28. Regulariza tus marcaciones." },
      en: { title: "May cutoff in 3 days", message: "The May period closes on the 28th. Reconcile your time entries." },
    },
    {
      id: "n06", category: "approval", minutesAgo: 70, read: false, meta: { employee: "Reymer Pizarro Ludgardo", swap: "TD→TN" },
      es: { title: "Cambio de turno por aprobar", message: "Reymer Pizarro solicita pasar de turno día a noche (18–20 may)." },
      en: { title: "Shift change to approve", message: "Reymer Pizarro requests moving from day to night shift (May 18–20)." },
    },
    {
      id: "n07", category: "replication", minutesAgo: 95, read: true, meta: { infotipo: "2002", count: 12 },
      es: { title: "Réplica exitosa a S/4HANA", message: "Se replicaron 12 registros de presencia al infotipo 2002." },
      en: { title: "Replication to S/4HANA succeeded", message: "12 presence records were replicated to infotype 2002." },
    },
    {
      id: "n08", category: "status", minutesAgo: 130, read: false,
      es: { title: "Tu solicitud de teletrabajo fue rechazada", message: "Tu solicitud de teletrabajo del 7 al 8 de mayo fue rechazada." },
      en: { title: "Your remote-work request was rejected", message: "Your remote-work request for May 7–8 was rejected." },
    },
    {
      id: "n09", category: "approval", minutesAgo: 160, read: false, meta: { employee: "Gavidia Villanueva Alexandra", code: "CA" },
      es: { title: "Capacitación por aprobar", message: "Gavidia Villanueva solicita capacitación virtual el 14–15 de mayo." },
      en: { title: "Training to approve", message: "Gavidia Villanueva requests virtual training on May 14–15." },
    },
    {
      id: "n10", category: "cutoff", minutesAgo: 200, read: false,
      es: { title: "Recordatorio: el cierre es mañana", message: "El cierre del periodo se ejecuta mañana 28 de mayo a las 23:59." },
      en: { title: "Reminder: cutoff is tomorrow", message: "The period cutoff runs tomorrow, May 28, at 23:59." },
    },
    {
      id: "n11", category: "approval", minutesAgo: 240, read: true, meta: { employee: "Espinoza Mariño Leidy", code: "DM" },
      es: { title: "Descanso médico por aprobar", message: "Espinoza Mariño registró descanso médico EsSalud (6–7 may)." },
      en: { title: "Medical leave to approve", message: "Espinoza Mariño logged EsSalud medical leave (May 6–7)." },
    },
    {
      id: "n12", category: "status", minutesAgo: 300, read: false,
      es: { title: "Tu comisión de trabajo fue aprobada", message: "Tu comisión de trabajo del 5 de mayo fue aprobada." },
      en: { title: "Your work assignment was approved", message: "Your work assignment for May 5 was approved." },
    },
    {
      id: "n13", category: "replication", minutesAgo: 360, read: false, meta: { infotipo: "2002", employee: "Gutierrez Vargas Pedro" },
      es: { title: "Error de réplica al infotipo 2002", message: "Falló la réplica de la comisión de Gutierrez Vargas." },
      en: { title: "Replication error to infotype 2002", message: "Replication of Gutierrez Vargas's assignment failed." },
    },
    {
      id: "n14", category: "approval", minutesAgo: 420, read: true, meta: { employee: "Mamani Quispe Noe", code: "TT" },
      es: { title: "Teletrabajo por aprobar", message: "Mamani Quispe solicita teletrabajo el 7 y 8 de mayo." },
      en: { title: "Remote work to approve", message: "Mamani Quispe requests remote work on May 7 and 8." },
    },
    {
      id: "n15", category: "status", minutesAgo: 500, read: true,
      es: { title: "Tu examen médico está pendiente", message: "Tu solicitud de EMO del 21 de mayo está pendiente de aprobación." },
      en: { title: "Your medical exam is pending", message: "Your medical-exam request for May 21 is pending approval." },
    },
    {
      id: "n16", category: "cutoff", minutesAgo: 600, read: false,
      es: { title: "Marcaciones bloqueadas por cierre", message: "No se aceptan nuevas marcaciones durante la ventana de cierre." },
      en: { title: "Time entries locked by cutoff", message: "New time entries are not accepted during the cutoff window." },
    },
    {
      id: "n17", category: "approval", minutesAgo: 720, read: true, meta: { employee: "Morales Rivero Juan", code: "LP" },
      es: { title: "Licencia de paternidad por aprobar", message: "Morales Rivero solicita licencia de paternidad (11–20 may)." },
      en: { title: "Paternity leave to approve", message: "Morales Rivero requests paternity leave (May 11–20)." },
    },
    {
      id: "n18", category: "replication", minutesAgo: 840, read: true, meta: { at: "02:00" },
      es: { title: "Reintento de réplica programado", message: "Los registros con error se reintentarán hoy a las 02:00." },
      en: { title: "Replication retry scheduled", message: "Failed records will be retried today at 02:00." },
    },
    {
      id: "n19", category: "status", minutesAgo: 1000, read: false,
      es: { title: "Tu cambio de turno fue aprobado", message: "Tu suplencia del 18 al 20 de mayo fue aprobada." },
      en: { title: "Your shift change was approved", message: "Your substitution for May 18–20 was approved." },
    },
    {
      id: "n20", category: "approval", minutesAgo: 1200, read: true, meta: { employee: "Leon Escobedo Marco", code: "VT" },
      es: { title: "Viaje de trabajo por aprobar", message: "Leon Escobedo solicita viaje de trabajo del 19 al 21 de mayo." },
      en: { title: "Business trip to approve", message: "Leon Escobedo requests a business trip from May 19 to 21." },
    },
    {
      id: "n21", category: "cutoff", minutesAgo: 1440, read: true,
      es: { title: "Cierre de abril completado", message: "El periodo de abril se cerró correctamente. Sin incidencias." },
      en: { title: "April cutoff completed", message: "The April period closed successfully. No incidents." },
    },
    {
      id: "n22", category: "status", minutesAgo: 1600, read: true,
      es: { title: "Tu licencia con goce fue observada", message: "Tu líder observó tu licencia con goce. Adjunta el sustento." },
      en: { title: "Your paid leave was flagged", message: "Your lead flagged your paid leave. Please attach supporting docs." },
    },
    {
      id: "n23", category: "replication", minutesAgo: 1800, read: false, meta: { infotipo: "2003" },
      es: { title: "Réplica pendiente de confirmación", message: "La réplica de suplencias al infotipo 2003 espera confirmación." },
      en: { title: "Replication awaiting confirmation", message: "Substitution replication to infotype 2003 is awaiting confirmation." },
    },
    {
      id: "n24", category: "approval", minutesAgo: 2000, read: true, meta: { employee: "Llaque Ramos Monica", code: "VAC" },
      es: { title: "Vacaciones de fin de mes por aprobar", message: "Llaque Ramos solicita vacaciones del 25 al 29 de mayo." },
      en: { title: "End-of-month vacation to approve", message: "Llaque Ramos requests vacation from May 25 to 29." },
    },
    {
      id: "n25", category: "status", minutesAgo: 2400, read: true,
      es: { title: "Tu solicitud de vacaciones está pendiente", message: "Tus vacaciones de fin de mes esperan la aprobación de tu líder." },
      en: { title: "Your vacation request is pending", message: "Your end-of-month vacation is awaiting your lead's approval." },
    },
    {
      id: "n26", category: "cutoff", minutesAgo: 2880, read: true,
      es: { title: "Ventana de cierre abierta", message: "Se abrió la ventana de regularización del periodo de mayo." },
      en: { title: "Cutoff window opened", message: "The May period reconciliation window is now open." },
    },
  ];
}

let seeds: Seed[] | null = null;
/** In-memory read/unread overrides (survives across calls in the same session). */
const readState = new Map<string, boolean>();

function ensureSeeds(): Seed[] {
  if (!seeds) {
    seeds = buildSeeds();
    for (const s of seeds) if (!readState.has(s.id)) readState.set(s.id, s.read);
  }
  return seeds;
}

function resolve(seed: Seed, lang: Lang, nowMs: number): NotificationItem {
  const content = seed[lang];
  return {
    id: seed.id,
    category: seed.category,
    title: content.title,
    message: content.message,
    createdAt: new Date(nowMs - seed.minutesAgo * 60_000).toISOString(),
    read: readState.get(seed.id) ?? seed.read,
    meta: seed.meta,
  };
}

async function mockList(p: ListParams): Promise<NotificationsPage> {
  await delay(360); // let the skeleton show
  const lang = mockLocale();
  const now = Date.now();
  const all = ensureSeeds()
    .map((s) => resolve(s, lang, now))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const unread = all.filter((n) => !n.read).length;

  let filtered = all;
  if (p.status === "unread") filtered = filtered.filter((n) => !n.read);
  if (p.category) filtered = filtered.filter((n) => n.category === p.category);

  const total = filtered.length;
  const start = Math.max(0, (p.page - 1) * p.size);
  const items = filtered.slice(start, start + p.size);
  return { origen: "mock", user: "demo", page: p.page, size: p.size, total, unread, items };
}

async function mockCount(): Promise<CountResult> {
  await delay(120);
  const unread = ensureSeeds().filter((s) => (readState.get(s.id) ?? s.read) === false).length;
  return { unread };
}

async function mockMarkRead(id: string): Promise<void> {
  await delay(120);
  ensureSeeds();
  readState.set(id, true);
}

async function mockReadAll(): Promise<void> {
  await delay(160);
  for (const s of ensureSeeds()) readState.set(s.id, true);
}

// ── Real (gateway) ─────────────────────────────────────────────────────────

async function realList(p: ListParams): Promise<NotificationsPage> {
  const res = await httpClient.get<NotificationsPage>(`${GATEWAY}/rest/notifications`, {
    params: { page: p.page, size: p.size, status: p.status, category: p.category ?? "" },
  });
  return res.data;
}

async function realCount(): Promise<CountResult> {
  const res = await httpClient.get<CountResult>(`${GATEWAY}/rest/notifications/count`, {
    params: { status: "unread" },
  });
  return res.data;
}

async function realMarkRead(id: string): Promise<void> {
  await httpClient.patch(`${GATEWAY}/rest/notifications/${encodeURIComponent(id)}/read`);
}

async function realReadAll(): Promise<void> {
  await httpClient.post(`${GATEWAY}/rest/notifications/read-all`);
}

// ── Public API ───────────────────────────────────────────────────────────────

export function list(params: ListParams): Promise<NotificationsPage> {
  return USE_MOCK ? mockList(params) : realList(params);
}
export function count(): Promise<CountResult> {
  return USE_MOCK ? mockCount() : realCount();
}
export function markRead(id: string): Promise<void> {
  return USE_MOCK ? mockMarkRead(id) : realMarkRead(id);
}
export function readAll(): Promise<void> {
  return USE_MOCK ? mockReadAll() : realReadAll();
}

export const notificationsService = { list, count, markRead, readAll };
