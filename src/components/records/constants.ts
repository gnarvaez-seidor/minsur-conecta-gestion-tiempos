import type { RecordItem, RecordStatus } from "./types";

export const STATUS_OPTIONS: RecordStatus[] = ["draft", "pending", "approved", "rejected", "archived"];

export const PAGE_SIZE = 10;

const OWNERS = ["Ana Torres", "Luis Pérez", "María Gómez", "John Smith", "Sofía Díaz", "Marco Ruiz"];
const STATUSES: RecordStatus[] = ["draft", "pending", "approved", "rejected", "archived"];
const TITLES = [
  "Quarterly inventory review",
  "Vendor onboarding request",
  "Cost center adjustment",
  "Batch release approval",
  "Quality deviation report",
  "Supplier audit follow-up",
  "Material master update",
  "Production order change",
];

/** Deterministic mock dataset (no randomness) — enough rows to exercise pagination. */
export const MOCK_RECORDS: RecordItem[] = Array.from({ length: 23 }, (_, i) => {
  const n = i + 1;
  return {
    id: `rec-${n}`,
    code: `REC-${1000 + n}`,
    title: `${TITLES[i % TITLES.length]} #${n}`,
    status: STATUSES[i % STATUSES.length],
    date: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    owner: OWNERS[i % OWNERS.length],
  };
});
