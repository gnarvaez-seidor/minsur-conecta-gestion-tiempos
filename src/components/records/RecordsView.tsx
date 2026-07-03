"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/context/I18nContext";
import { useRecords } from "./hooks/useRecords";
import { useRecordsFilters } from "./hooks/useRecordsFilters";
import { usePagination } from "./hooks/usePagination";
import RecordsHeader from "./components/RecordsHeader";
import StatsCards from "./components/StatsCards";
import FiltersPanel from "./components/FiltersPanel";
import RecordsTable from "./components/RecordsTable";
import MobileCards from "./components/MobileCards";
import Pagination from "./components/Pagination";
import RecordDetailModal from "./modals/RecordDetailModal";
import { SkeletonStatCards, SkeletonTable } from "@/components/ui/Skeleton";
import AlertBanner from "@/components/ui/AlertBanner";
import { PAGE_SIZE } from "./constants";
import type { RecordFilters, RecordItem } from "./types";

/**
 * Thin orchestrator (canonical decomposed-module pattern):
 *   useRecords (data) + useRecordsFilters (filter/stats) + usePagination (slice)
 *   -> sub-components (Header, StatsCards, FiltersPanel, Table, MobileCards, Pagination)
 *   -> RecordDetailModal (detail as a modal, not a route).
 * Redux (uiSlice) drives `searchQuery` (filter) and `density` (table); Context drives i18n/theme/auth.
 */
export default function RecordsView() {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useRecords();

  // `searchQuery` lives in Redux; status/from/to are local view state.
  const searchQuery = useAppSelector((s) => s.ui.searchQuery);
  const [status, setStatus] = useState<RecordFilters["status"]>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<RecordItem | null>(null);
  // Local override so the mock "delete" reflects in the UI without a backend.
  const [override, setOverride] = useState<RecordItem[] | null>(null);

  const source = override ?? data;
  const filters: RecordFilters = { search: searchQuery, status, from, to };
  const { filtered, stats, activeFilterCount } = useRecordsFilters(source, filters);
  const { safePage, setPaginaActual, totalPages, paginatedData, pageNumbers } = usePagination(filtered, PAGE_SIZE);

  // Reset to page 1 whenever the filters change.
  useEffect(() => {
    setPaginaActual(1);
  }, [searchQuery, status, from, to, setPaginaActual]);

  const patchFilters = (patch: Partial<RecordFilters>) => {
    if (patch.status !== undefined) setStatus(patch.status);
    if (patch.from !== undefined) setFrom(patch.from);
    if (patch.to !== undefined) setTo(patch.to);
  };

  const handleDelete = (r: RecordItem) =>
    setOverride((prev) => (prev ?? data).filter((x) => x.id !== r.id));

  return (
    <div className="animate-fade-in-up">
      <RecordsHeader />

      {loading ? (
        <>
          <SkeletonStatCards count={4} />
          <SkeletonTable cols={5} rows={8} />
        </>
      ) : error ? (
        <AlertBanner
          type="error"
          title={t("records.title")}
          message={t("records.error")}
          action={{ label: t("common.retry"), onClick: refetch }}
        />
      ) : (
        <>
          <StatsCards stats={stats} />
          <FiltersPanel filters={filters} onChange={patchFilters} activeFilterCount={activeFilterCount} />

          {filtered.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-10 text-center text-sm text-[var(--muted)]">
              {t("records.empty")}
            </div>
          ) : (
            <>
              <RecordsTable rows={paginatedData} onSelect={setSelected} />
              <MobileCards rows={paginatedData} onSelect={setSelected} />
              <Pagination page={safePage} totalPages={totalPages} pageNumbers={pageNumbers} onPage={setPaginaActual} />
            </>
          )}
        </>
      )}

      <RecordDetailModal record={selected} onClose={() => setSelected(null)} onDelete={handleDelete} />
    </div>
  );
}
