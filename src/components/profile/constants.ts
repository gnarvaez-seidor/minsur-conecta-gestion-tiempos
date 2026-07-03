// Local data + bilingual dictionary for the "Mi Perfil" module.
// Keeps the strict global i18n typing untouched (see roster/constants.ts for the same pattern):
// the module reads only `locale` from I18nContext and resolves its own strings from `L` below.

import type { Locale } from "@/i18n/types";
import type { Override, OverrideStatus } from "@/components/roster/types";
import { MOCK_MASTER, MONTHS } from "@/components/roster/constants";

/** Profile of the signed-in user. `employeeId` links to MOCK_MASTER (roster) for "my requests". */
export interface ProfileData {
  employeeId: string;
  name: string;
  initials: string;
  cargo: string;
  code: string;
  guardia: string;
  sistema: string;
  rol: string;
  subdiv: string;
  area: string;
  /** Vacation days already taken / annual entitlement. */
  vacTaken: number;
  vacTotal: number;
  /** Next payroll cutoff for the period. */
  cutoff: { day: number; month: number; time: string };
}

export const PROFILE: ProfileData = {
  employeeId: "cuag", // maps to MOCK_MASTER.overrides for "Mis solicitudes"
  name: "Anthony Castillo Vega",
  initials: "AC",
  cargo: "Especialista Gestión Social",
  code: "101945",
  guardia: "9X5ST1-B",
  sistema: "9X5",
  rol: "Colaborador",
  subdiv: "1012",
  area: "ST",
  vacTaken: 8,
  vacTotal: 22,
  cutoff: { day: 28, month: 4, time: "18:00" }, // 28 may 18:00
};

/** All roster overrides that belong to the profile user, newest change first. */
export function getMyRequests(employeeId: string = PROFILE.employeeId): Override[] {
  return MOCK_MASTER.overrides.filter((o) => o.employeeId === employeeId);
}

/** Human-readable name for an override code, from the roster master (VAC → Vacaciones). */
export function codeLabel(code: string | undefined): string {
  if (!code) return "";
  return MOCK_MASTER.codes[code] ?? code;
}

/** Abbreviated, locale-aware date range for a request (e.g. "9–22 may"). */
export function requestRange(ov: Override, locale: Locale): string {
  if (!ov.from && !ov.to) return "—";
  const mon = (MONTHS[locale] ?? MONTHS.es)[PROFILE.cutoff.month].slice(0, 3);
  return ov.from === ov.to ? `${ov.from} ${mon}` : `${ov.from}–${ov.to} ${mon}`;
}

/** Maps a domain override status to a StatusBadge tone key (its `status` prop = tone selector). */
export const STATUS_TONE: Record<OverrideStatus, string> = {
  approved: "approved",
  pending: "pending",
  rejected: "rejected",
  failed: "rejected", // reuse the rose tone to flag a replication error
};

type Dict = Record<string, string>;

/** Module-local bilingual dictionary (NOT added to the typed global i18n). */
export const L: Record<Locale, Dict> = {
  es: {
    title: "Mi Perfil",
    sub: "Tus datos laborales, indicadores y solicitudes — sincronizados con S/4HANA",
    // hero
    role: "Rol",
    system: "Sistema",
    guard: "Guardia",
    // labor data
    laborTitle: "Datos laborales",
    laborSub: "Información maestra del colaborador",
    f_code: "Código",
    f_cargo: "Cargo",
    f_guard: "Guardia / Sistema",
    f_org: "Subdivisión / Área",
    // kpis
    kpiTitle: "Mis indicadores",
    k_vacTaken: "Vacaciones tomadas",
    k_vacOf: "de {n} días",
    k_vacBal: "Saldo disponible",
    k_vacDays: "días",
    k_pending: "Solicitudes pendientes",
    k_cutoff: "Próximo cierre",
    // requests
    reqTitle: "Mis solicitudes",
    reqSub: "Presencias, ausencias y suplencias del período",
    reqEmpty: "No tienes solicitudes registradas.",
    it: "Infotipo",
    updated: "Actualizado",
    // request types
    t_absence: "Ausencia",
    t_presence: "Presencia",
    t_substitute: "Suplencia",
    t_replication_fail: "Réplica fallida",
    // statuses
    st_approved: "Aprobada",
    st_pending: "Pendiente",
    st_rejected: "Rechazada",
    st_failed: "Réplica fallida",
    // preferences
    prefTitle: "Preferencias",
    prefSub: "Idioma y apariencia de la aplicación",
    prefLang: "Idioma",
    prefTheme: "Tema",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeManaged: "Gestionado por Work Zone",
  },
  en: {
    title: "My Profile",
    sub: "Your HR data, indicators and requests — synced with S/4HANA",
    role: "Role",
    system: "System",
    guard: "Guard",
    laborTitle: "Employment data",
    laborSub: "Employee master information",
    f_code: "Code",
    f_cargo: "Position",
    f_guard: "Guard / System",
    f_org: "Subdivision / Area",
    kpiTitle: "My indicators",
    k_vacTaken: "Vacation taken",
    k_vacOf: "of {n} days",
    k_vacBal: "Available balance",
    k_vacDays: "days",
    k_pending: "Pending requests",
    k_cutoff: "Next cutoff",
    reqTitle: "My requests",
    reqSub: "Presences, absences and substitutions for the period",
    reqEmpty: "You have no requests on record.",
    it: "Infotype",
    updated: "Updated",
    t_absence: "Absence",
    t_presence: "Presence",
    t_substitute: "Substitution",
    t_replication_fail: "Replication failure",
    st_approved: "Approved",
    st_pending: "Pending",
    st_rejected: "Rejected",
    st_failed: "Replication failed",
    prefTitle: "Preferences",
    prefSub: "Application language and appearance",
    prefLang: "Language",
    prefTheme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeManaged: "Managed by Work Zone",
  },
};
