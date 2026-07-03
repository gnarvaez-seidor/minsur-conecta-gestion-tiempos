// Domain types for the Roster / Gestión de Tiempos module.
// Mirrors the backend contract GET /rest/roster/master (apiintegración).

export type OverrideType = "absence" | "presence" | "substitute" | "replication-fail";
export type OverrideStatus = "approved" | "pending" | "rejected" | "failed";

export interface Employee {
  id: string;
  code: string;
  initials: string;
  color: string; // avatar color (from `face` in the source)
  name: string;
  cargo: string;
  guardia: string; // 9X5ST1-A | 9X5ST1-B | 5X2STEM1
  sistema: string;
  subdiv: string;
  area: string;
}

export interface Override {
  id: string;
  employeeId: string;
  type: OverrideType;
  code?: string;
  subcode?: string;
  swapFrom?: string;
  swapTo?: string;
  from: number;
  to: number;
  status: OverrideStatus;
  notes?: string;
  infotipo?: string;
  lastChange?: string;
}

export interface CodeDef {
  code: string;
  name: string;
}

export interface RosterMaster {
  team: Employee[];
  roles: string[];
  codes: Record<string, string>;
  legend: { horario: CodeDef[]; pres: CodeDef[]; aus: CodeDef[] };
  holidays: Record<string, string>;
  overrides: Override[];
}

export interface DayCell {
  code: string;
  overrides: Override[];
}
export type DayLookup = Record<string, DayCell>;

export type RosterViewMode = "detail" | "summary";
