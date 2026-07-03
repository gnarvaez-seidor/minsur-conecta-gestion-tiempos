export type RecordStatus = "draft" | "pending" | "approved" | "rejected" | "archived";

/** Generic, domain-neutral entity — rename per app (named RecordItem to avoid the TS `Record` utility). */
export interface RecordItem {
  id: string;
  code: string;
  title: string;
  status: RecordStatus;
  date: string; // ISO yyyy-mm-dd
  owner: string;
}

export interface RecordFilters {
  search: string;
  status: RecordStatus | "all";
  from: string; // ISO date or ""
  to: string; // ISO date or ""
}
