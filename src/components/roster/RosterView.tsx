"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiPlus, FiRepeat, FiChevronLeft, FiChevronRight, FiSearch, FiClock } from "react-icons/fi";
import { useTranslation } from "@/context/I18nContext";
import { useRoster } from "./hooks/useRoster";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/ui/Pagination";
import Portal from "@/components/ui/Portal";
import RosterStats from "./components/RosterStats";
import RosterCalendar from "./components/RosterCalendar";
import RosterSummary from "./components/RosterSummary";
import Legend from "./components/Legend";
import RequestModal from "./modals/RequestModal";
import { SkeletonStatCards, SkeletonTable } from "@/components/ui/Skeleton";
import AlertBanner from "@/components/ui/AlertBanner";
import { buildLookup, daysInMonth, MONTHS, TODAY, L, PAGE_SIZE } from "./constants";
import type { OverrideType, RosterViewMode } from "./types";

/**
 * Roster orchestrator (canonical decomposed-module pattern):
 * useRoster (data) + memoized day-lookup + usePagination (team slice)
 * -> RosterStats / RosterCalendar / RosterSummary / Legend + RequestModal (detail as modal).
 */
export default function RosterView() {
  const { locale } = useTranslation();
  const T = L[locale] || L.es;
  const { data, loading, error, refetch } = useRoster();

  const [year, setYear] = useState(TODAY.y);
  const [month, setMonth] = useState(TODAY.m);
  const [mode, setMode] = useState<RosterViewMode>("detail");
  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; type: OverrideType; emp?: string }>({ open: false, type: "absence" });
  const [toast, setToast] = useState("");

  // Debounced worker search (~220ms) — the mejora funcional requested.
  useEffect(() => {
    const id = setTimeout(() => setSearch(rawSearch.toLowerCase().trim()), 220);
    return () => clearTimeout(id);
  }, [rawSearch]);

  const team = useMemo(
    () => (data ? data.team.filter((e) => e.name.toLowerCase().includes(search)) : []),
    [data, search],
  );
  const { safePage, setPaginaActual, totalPages, paginatedData, pageNumbers } = usePagination(team, PAGE_SIZE);
  useEffect(() => { setPaginaActual(1); }, [search, month, year, setPaginaActual]);

  const lookup = useMemo(() => (data ? buildLookup(data, year, month) : {}), [data, year, month]);
  const days = daysInMonth(year, month);
  const monthLabel = `${(MONTHS[locale] || MONTHS.es)[month]} ${year}`;

  const changeMonth = useCallback((delta: number) => {
    setMonth((m) => {
      let nm = m + delta;
      if (nm < 0) { nm = 11; setYear((y) => y - 1); }
      else if (nm > 11) { nm = 0; setYear((y) => y + 1); }
      return nm;
    });
  }, []);

  const openReq = (type: OverrideType, emp?: string) => setModal({ open: true, type, emp });
  const submitReq = () => { setModal((s) => ({ ...s, open: false })); showToast(T.sent); };
  const showToast = (m: string) => { setToast(m); window.clearTimeout((window as unknown as { _rt?: number })._rt); (window as unknown as { _rt?: number })._rt = window.setTimeout(() => setToast(""), 2600); };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--foreground)] flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl grid place-items-center text-white shadow-md" style={{ background: "var(--grad-accent)" }}>
              <FiClock className="w-5 h-5" />
            </span>
            {T.title}
          </h1>
          <p className="text-[13px] text-[var(--muted)] mt-1">{T.sub}</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button onClick={() => openReq("presence")} className="btn-outline"><FiPlus /> {T.presence}</button>
          <button onClick={() => openReq("substitute")} className="btn-outline"><FiRepeat /> {T.substitute}</button>
          <button onClick={() => openReq("absence")} className="btn-primary"><FiPlus /> {T.absence}</button>
        </div>
      </div>

      {loading ? (
        <>
          <SkeletonStatCards count={6} />
          <SkeletonTable cols={8} rows={8} />
        </>
      ) : error || !data ? (
        <AlertBanner type="error" title={T.title} message={T.loadErr} action={{ label: T.retry, onClick: refetch }} />
      ) : (
        <>
          <RosterStats master={data} locale={locale} />

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-2.5 mb-4 shadow-sm">
            <div className="flex items-center gap-1.5">
              <button onClick={() => changeMonth(-1)} aria-label="prev" className="w-9 h-9 rounded-lg grid place-items-center text-[var(--accent)] border border-[var(--card-border)] hover:bg-[var(--accent-light)] transition-colors"><FiChevronLeft /></button>
              <button onClick={() => { setYear(TODAY.y); setMonth(TODAY.m); }} className="px-3 py-2 rounded-lg text-[12.5px] font-bold text-[var(--accent)] border border-[var(--card-border)] hover:bg-[var(--accent-light)] transition-colors">{T.today}</button>
              <button onClick={() => changeMonth(1)} aria-label="next" className="w-9 h-9 rounded-lg grid place-items-center text-[var(--accent)] border border-[var(--card-border)] hover:bg-[var(--accent-light)] transition-colors"><FiChevronRight /></button>
              <span className="font-extrabold text-[15px] capitalize ml-1 min-w-[120px] text-center text-[var(--foreground)]">{monthLabel}</span>
            </div>
            <div className="relative flex items-center flex-1 min-w-[180px]">
              <FiSearch className="absolute left-3 w-4 h-4 text-[var(--muted)]" />
              <input value={rawSearch} onChange={(e) => setRawSearch(e.target.value)} placeholder={T.search} aria-label={T.search}
                className="w-full border border-[var(--card-border)] bg-[color-mix(in_srgb,var(--card)_92%,var(--accent-light))] text-[var(--foreground)] rounded-lg pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[var(--accent)]" />
            </div>
            <div className="flex border border-[var(--card-border)] rounded-lg overflow-hidden">
              <button onClick={() => setMode("detail")} className={`px-3.5 py-2 text-[12.5px] font-bold transition-colors ${mode === "detail" ? "text-white" : "text-[var(--muted)]"}`} style={mode === "detail" ? { background: "var(--grad-accent)" } : undefined}>{T.detail}</button>
              <button onClick={() => setMode("summary")} className={`px-3.5 py-2 text-[12.5px] font-bold transition-colors ${mode === "summary" ? "text-white" : "text-[var(--muted)]"}`} style={mode === "summary" ? { background: "var(--grad-accent)" } : undefined}>{T.summary}</button>
            </div>
            <div className="ml-auto inline-flex items-center gap-2 text-[12px] font-bold px-3 py-2 rounded-full text-[#b45309] bg-[#fef3c7] border border-[#f59e0b]/30">
              <FiClock className="w-3.5 h-3.5" /> {T.cutoff} · <span className="tabular-nums">2</span> {T.days}
            </div>
          </div>

          {mode === "detail" ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_232px] gap-4 items-start">
              <div>
                <RosterCalendar team={paginatedData} days={days} year={year} month={month} lookup={lookup} locale={locale} onCell={(emp) => openReq("absence", emp)} />
                <Pagination page={safePage} totalPages={totalPages} pageNumbers={pageNumbers} onPage={setPaginaActual} />
              </div>
              <Legend master={data} locale={locale} />
            </div>
          ) : (
            <>
              <RosterSummary master={data} locale={locale} team={paginatedData} />
              <Pagination page={safePage} totalPages={totalPages} pageNumbers={pageNumbers} onPage={setPaginaActual} />
            </>
          )}
        </>
      )}

      <RequestModal open={modal.open} team={data?.team || []} initialType={modal.type} initialEmployeeId={modal.emp} locale={locale} onClose={() => setModal((s) => ({ ...s, open: false }))} onSubmit={submitReq} />

      {toast && (
        <Portal>
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2.5 px-5 py-3 rounded-xl text-white text-[13.5px] font-semibold shadow-2xl animate-fade-in-up" style={{ background: "var(--teal-deep,#0f3940)", borderLeft: "4px solid var(--mint,#02c39a)" }} role="status" aria-live="polite">
            {toast}
          </div>
        </Portal>
      )}

      <style jsx>{`
        .btn-outline{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--card-border);background:var(--card);color:var(--foreground);font-weight:700;font-size:13px;padding:9px 15px;border-radius:10px;box-shadow:var(--sh-md);transition:all .2s}
        .btn-outline:hover{transform:translateY(-1px);border-color:var(--accent)}
        .btn-primary{display:inline-flex;align-items:center;gap:8px;color:#fff;font-weight:700;font-size:13px;padding:9px 15px;border-radius:10px;background:var(--grad-accent);box-shadow:var(--sh-md);transition:all .2s}
        .btn-primary:hover{filter:brightness(1.05);transform:translateY(-1px)}
      `}</style>
    </div>
  );
}
