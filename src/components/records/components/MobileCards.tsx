"use client";

import StatusBadge from "@/components/ui/StatusBadge";
import { useTranslation } from "@/context/I18nContext";
import type { RecordItem } from "../types";

interface Props {
  rows: RecordItem[];
  onSelect: (record: RecordItem) => void;
}

export default function MobileCards({ rows, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <div className="md:hidden flex flex-col gap-3">
      {rows.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r)}
          className="card-hover text-left bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono text-xs text-[var(--muted)]">{r.code}</span>
            <StatusBadge status={r.status} label={t(`records.estados.${r.status}`)} size="sm" />
          </div>
          <p className="text-sm font-medium text-[var(--foreground)]">{r.title}</p>
          <p className="text-xs text-[var(--muted)] mt-1">
            {r.date} · {r.owner}
          </p>
        </button>
      ))}
    </div>
  );
}
