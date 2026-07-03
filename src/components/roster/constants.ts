import type { RosterMaster, Override, DayLookup } from "./types";

export const PAGE_SIZE = 8;

/** Status-code colors (bg, fg) — inherited from the SAP/Excel legend of the source of truth. */
export const CHIP: Record<string, [string, string, boolean?]> = {
  TD: ["#ffffff", "#0f172a", true], TN: ["#0070c0", "#ffffff"], L: ["#ffc7ce", "#9c0006"],
  F: ["#111827", "#ffffff"], OS: ["#a6a6a6", "#ffffff"], VAC: ["#ffd400", "#000000"],
  DM: ["#ed7d31", "#ffffff"], LCG: ["#ffe699", "#000000"], LP: ["#c6efce", "#006100"],
  LSG: ["#ff0000", "#ffff00"], LF: ["#111827", "#ffffff"], LM: ["#e59ae2", "#000000"],
  CA: ["#b4c6e7", "#000000"], CT: ["#4ca64c", "#ffffff"], TT: ["#8b5cf6", "#ffffff"],
  EMO: ["#06b6d4", "#ffffff"], FL: ["#fbbf24", "#422006"], FNL: ["#fcd34d", "#422006"],
  VT: ["#14b8a6", "#ffffff"], SUB: ["#ed7d31", "#ffffff"], TDD: ["#ff0000", "#ffffff"],
};

/** Deterministic shift for a guard pattern on a given day (ported from the source `shiftFor`). */
export function shiftFor(guardia: string, year: number, month: number, day: number): string {
  const dt = new Date(year, month, day);
  const dow = dt.getDay();
  if (guardia === "5X2STEM1") return dow === 0 || dow === 6 ? "L" : "TD";
  const ref = new Date(2026, 0, guardia === "9X5ST1-A" ? 1 : 8);
  const diff = Math.floor((dt.getTime() - ref.getTime()) / 86400000);
  const phase = ((diff % 15) + 15) % 15;
  return phase < 10 ? "TD" : "L";
}

export function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

/** Build the per-employee/day lookup applying approved overrides. Pure — memoize in the view. */
export function buildLookup(master: RosterMaster, year: number, month: number): DayLookup {
  const map: DayLookup = {};
  const total = daysInMonth(year, month);
  master.team.forEach((emp) => {
    for (let d = 1; d <= total; d++) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      let code = shiftFor(emp.guardia, year, month, d);
      if (master.holidays[key]) code = "F";
      map[`${emp.id}_${d}`] = { code, overrides: [] };
    }
  });
  master.overrides.forEach((ov) => {
    if (ov.type === "replication-fail") return;
    for (let d = ov.from; d <= ov.to; d++) {
      const k = `${ov.employeeId}_${d}`;
      if (!map[k]) continue;
      if (ov.status === "approved") {
        if (ov.type === "absence" || ov.type === "presence") map[k].code = ov.code || map[k].code;
        if (ov.type === "substitute") map[k].code = ov.swapTo || map[k].code;
      }
      map[k].overrides.push(ov);
    }
  });
  return map;
}

export const MONTHS: Record<string, string[]> = {
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
export const DOW: Record<string, string[]> = {
  es: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  en: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
};

export const TODAY = { y: 2026, m: 4, d: 26 };

/** Local bilingual dictionary for the roster module (keeps the strict global i18n typing untouched). */
export const L: Record<string, Record<string, string>> = {
  es: {
    title: "Roster de Turnos", sub: "Presencias · Ausencias · Suplencias — replica al infotipo en S/4HANA",
    presence: "Presencia", substitute: "Suplencia", absence: "Ausencia", today: "Hoy", search: "Buscar trabajador…",
    detail: "Detallada", summary: "Resumen", cutoff: "Cierre 28 may", days: "días",
    sch: "Horario", pres: "Presencias", abs: "Ausencias",
    k_cov: "Cobertura hoy", k_abs: "Ausencias del mes", k_pend: "Pendientes", k_sub: "Suplencias", k_cut: "Cierre en", k_rep: "Réplicas fallidas",
    c_emp: "Colaborador", c_guard: "Guardia", c_pos: "Cargo", c_pres: "Presencias", c_abs: "Ausencias", c_sub: "Suplencias", c_st: "Estado",
    approved: "Aprobado", pending: "Pendiente", empty: "Sin resultados", loadErr: "No se pudo cargar el roster", retry: "Reintentar",
    newReq: "Nueva solicitud", emp: "Colaborador", type: "Tipo", from: "Desde", to: "Hasta", notes: "Motivo / Observaciones",
    cancel: "Cancelar", send: "Enviar solicitud", sent: "Solicitud enviada — pendiente de aprobación", origFrom: "PHTD original", newTo: "Nuevo PHTD",
  },
  en: {
    title: "Shift Roster", sub: "Presences · Absences · Substitutions — replicates to the S/4HANA infotype",
    presence: "Presence", substitute: "Substitution", absence: "Absence", today: "Today", search: "Search worker…",
    detail: "Detailed", summary: "Summary", cutoff: "Cutoff May 28", days: "days",
    sch: "Schedule", pres: "Presences", abs: "Absences",
    k_cov: "Coverage today", k_abs: "Absences this month", k_pend: "Pending", k_sub: "Substitutions", k_cut: "Cutoff in", k_rep: "Failed replications",
    c_emp: "Employee", c_guard: "Guard", c_pos: "Position", c_pres: "Presences", c_abs: "Absences", c_sub: "Substitutions", c_st: "Status",
    approved: "Approved", pending: "Pending", empty: "No results", loadErr: "Could not load the roster", retry: "Retry",
    newReq: "New request", emp: "Employee", type: "Type", from: "From", to: "To", notes: "Reason / Notes",
    cancel: "Cancel", send: "Submit request", sent: "Request submitted — pending approval", origFrom: "Original PHTD", newTo: "New PHTD",
  },
};

/** Mock master data (fallback for NEXT_PUBLIC_AUTH_STRATEGY=mock) — mirrors the backend fixtures. */
const team = [
  ["cuag", "101945", "CA", "#02c39a", "CUBA AGUIRRE GABRIEL", "Especialista Gestión Social", "9X5ST1-B"],
  ["leem", "102560", "LE", "#0891b2", "LEON ESCOBEDO MARCO", "Especialista Gestión Social", "9X5ST1-B"],
  ["avfl", "102570", "AF", "#c026d3", "AVILA FERNANDEZ LUCIA", "Gerente de Gestión Social", "5X2STEM1"],
  ["esml", "102790", "EM", "#2563eb", "ESPINOZA MARIÑO LEIDY", "Coord. Sistema Gestión Social", "5X2STEM1"],
  ["guvp", "102870", "GV", "#f59e0b", "GUTIERREZ VARGAS PEDRO", "Superintendente Cont. Local", "9X5ST1-B"],
  ["morj", "102884", "MR", "#db2777", "MORALES RIVERO JUAN", "Supervisor Negocios Locales", "9X5ST1-B"],
  ["pufb", "103325", "PF", "#16a34a", "PUYEN FIESTAS BRIAN", "Coord. de Contenido Local", "9X5ST1-B"],
  ["maqn", "103361", "MQ", "#7c3aed", "MAMANI QUISPE NOE", "Asistente de Comunicaciones", "5X2STEM1"],
  ["repl", "103369", "RP", "#0e7490", "REYMER PIZARRO LUDGARDO", "Supervisor Negocios Locales", "9X5ST1-A"],
  ["raam", "103376", "RA", "#02c39a", "RAMOS ATAMARI MARCO", "Asistente de Comunicaciones", "5X2STEM1"],
  ["gava", "103406", "GV", "#0891b2", "GAVIDIA VILLANUEVA ALEXANDRA", "Asistente Administrativo", "5X2STEM1"],
  ["llrm", "103409", "LR", "#c026d3", "LLAQUE RAMOS MONICA", "Especialista Gestión Social", "9X5ST1-A"],
].map(([id, code, initials, color, name, cargo, guardia]) => ({
  id, code, initials, color, name, cargo, guardia, sistema: guardia.slice(0, 3), subdiv: "1012", area: "ST",
}));

const overrides: Override[] = [
  { id: "o1", employeeId: "cuag", type: "absence", code: "VAC", subcode: "1000", from: 9, to: 22, status: "approved", notes: "Vacaciones", infotipo: "2001", lastChange: "12/05/2026 09:14" },
  { id: "o2", employeeId: "leem", type: "absence", code: "VAC", subcode: "1000", from: 16, to: 29, status: "approved", notes: "Vacaciones", infotipo: "2001", lastChange: "14/05/2026 11:32" },
  { id: "o3", employeeId: "esml", type: "absence", code: "DM", subcode: "1100", from: 6, to: 7, status: "approved", notes: "Cert. médico EsSalud", infotipo: "2001", lastChange: "06/05/2026 08:02" },
  { id: "o4", employeeId: "morj", type: "absence", code: "LP", subcode: "1202", from: 11, to: 20, status: "approved", notes: "Lic. paternidad", infotipo: "2001", lastChange: "10/05/2026 16:45" },
  { id: "p1", employeeId: "guvp", type: "presence", code: "CT", subcode: "0150", from: 5, to: 5, status: "approved", notes: "Comisión de trabajo", infotipo: "2002", lastChange: "04/05/2026 14:21" },
  { id: "p2", employeeId: "avfl", type: "presence", code: "CA", subcode: "0180", from: 13, to: 13, status: "approved", notes: "Capacitación", infotipo: "2002", lastChange: "13/05/2026 09:00" },
  { id: "p3", employeeId: "maqn", type: "presence", code: "TT", subcode: "206", from: 7, to: 8, status: "approved", notes: "Teletrabajo", infotipo: "2002", lastChange: "07/05/2026 07:12" },
  { id: "p5", employeeId: "llrm", type: "presence", code: "EMO", subcode: "203", from: 21, to: 21, status: "pending", notes: "EMO programado", infotipo: "2002", lastChange: "24/05/2026 17:55" },
  { id: "o5", employeeId: "gava", type: "absence", code: "CA", subcode: "0180", from: 14, to: 15, status: "pending", notes: "Capacitación virtual", infotipo: "2001", lastChange: "25/05/2026 10:18" },
  { id: "o6", employeeId: "llrm", type: "absence", code: "VAC", subcode: "1000", from: 25, to: 29, status: "pending", notes: "Vacaciones fin de mes", infotipo: "2001", lastChange: "25/05/2026 14:02" },
  { id: "s1", employeeId: "repl", type: "substitute", swapFrom: "TD", swapTo: "TN", from: 18, to: 20, status: "approved", notes: "Cambio día → noche", infotipo: "2003", lastChange: "17/05/2026 12:30" },
  { id: "s2", employeeId: "raam", type: "substitute", swapFrom: "L", swapTo: "TD", from: 9, to: 9, status: "pending", notes: "Cubrir sábado", infotipo: "2003", lastChange: "25/05/2026 18:30" },
  { id: "f1", employeeId: "cuag", type: "replication-fail", from: 0, to: 0, status: "failed", notes: "Error de réplica IT 2001", infotipo: "2001", lastChange: "26/05/2026 02:25" },
  { id: "f2", employeeId: "leem", type: "replication-fail", from: 0, to: 0, status: "failed", notes: "Error de réplica IT 2001", infotipo: "2001", lastChange: "26/05/2026 02:25" },
];

export const MOCK_MASTER: RosterMaster = {
  team,
  roles: ["Colaborador", "Líder", "ADP", "Superadministrador"],
  codes: {
    TD: "Turno Día", TN: "Turno Noche", L: "Libre", F: "Feriado", OS: "On Site", VAC: "Vacaciones",
    DM: "Descanso médico", LCG: "Lic. con goce", LP: "Lic. paternidad", LSG: "Lic. sin goce",
    CA: "Capacitación", CT: "Comisión de trabajo", TT: "Teletrabajo", EMO: "Examen médico", FL: "Feriado laborado", VT: "Viaje de trabajo",
  },
  legend: {
    horario: [{ code: "TD", name: "Turno Día" }, { code: "TN", name: "Turno Noche" }, { code: "L", name: "Libre" }, { code: "F", name: "Feriado" }, { code: "OS", name: "On Site" }],
    pres: [{ code: "TT", name: "Teletrabajo" }, { code: "CT", name: "Comisión de trabajo" }, { code: "CA", name: "Capacitación" }, { code: "FL", name: "Feriado laborado" }, { code: "EMO", name: "Examen médico" }, { code: "VT", name: "Viaje de trabajo" }],
    aus: [{ code: "VAC", name: "Vacaciones" }, { code: "DM", name: "Descanso médico" }, { code: "LCG", name: "Lic. con goce" }, { code: "LP", name: "Lic. paternidad" }, { code: "LSG", name: "Lic. sin goce" }],
  },
  holidays: { "2026-05-01": "Día del Trabajo" },
  overrides,
};
