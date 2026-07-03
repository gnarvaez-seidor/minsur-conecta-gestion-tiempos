"use client";

import SearchInput from "@/components/ui/SearchInput";
import { useTranslation } from "@/context/I18nContext";
import { useAppDispatch } from "@/store/hooks";
import { setSearchQuery } from "@/store/slices/uiSlice";
import { STATUS_OPTIONS } from "../constants";
import type { RecordFilters } from "../types";

interface Props {
  filters: RecordFilters;
  onChange: (patch: Partial<RecordFilters>) => void;
  activeFilterCount: number;
}

export default function FiltersPanel({ filters, onChange, activeFilterCount }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
      {/* Redux demo: search value comes from uiSlice via filters.search, dispatch updates it */}
      <SearchInput
        value={filters.search}
        onChange={(v) => dispatch(setSearchQuery(v))}
        placeholder={t("records.filters.searchPlaceholder")}
      />

      <select
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value as RecordFilters["status"] })}
        aria-label={t("records.filters.status")}
        className="h-10 px-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus-ring"
      >
        <option value="all">
          {t("records.filters.status")}: {t("common.all")}
        </option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {t(`records.estados.${s}`)}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.from}
        onChange={(e) => onChange({ from: e.target.value })}
        aria-label={t("records.filters.from")}
        className="h-10 px-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus-ring"
      />
      <input
        type="date"
        value={filters.to}
        onChange={(e) => onChange({ to: e.target.value })}
        aria-label={t("records.filters.to")}
        className="h-10 px-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus-ring"
      />

      {activeFilterCount > 0 && (
        <span className="text-xs text-[var(--muted)] whitespace-nowrap">
          {t("records.filters.active", { count: activeFilterCount })}
        </span>
      )}
    </div>
  );
}
