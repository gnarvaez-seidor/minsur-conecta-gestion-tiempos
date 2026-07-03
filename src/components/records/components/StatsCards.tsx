"use client";

import { FiLayers, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import type { IconType } from "react-icons";
import { useTranslation } from "@/context/I18nContext";
import type { RecordStats } from "../hooks/useRecordsFilters";

export default function StatsCards({ stats }: { stats: RecordStats }) {
  const { t } = useTranslation();

  const cards: { label: string; value: number; Icon: IconType; color: string }[] = [
    { label: t("records.stats.total"), value: stats.total, Icon: FiLayers, color: "text-[var(--seidor-blue)]" },
    { label: t("records.stats.approved"), value: stats.approved, Icon: FiCheckCircle, color: "text-emerald-500" },
    { label: t("records.stats.pending"), value: stats.pending, Icon: FiClock, color: "text-amber-500" },
    { label: t("records.stats.rejected"), value: stats.rejected, Icon: FiXCircle, color: "text-rose-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-stagger">
      {cards.map(({ label, value, Icon, color }) => (
        <div
          key={label}
          className="stat-card bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-semibold text-[var(--foreground)]">{value}</p>
            <p className="text-xs text-[var(--muted)]">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
