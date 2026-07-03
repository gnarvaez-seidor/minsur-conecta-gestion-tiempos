"use client";

import { memo } from "react";
import { FiClock, FiMapPin, FiRepeat } from "react-icons/fi";
import CodeChip from "./CodeChip";
import type { Employee, DayLookup } from "../types";
import { DOW, TODAY } from "../constants";

interface Props {
  team: Employee[];
  days: number;
  year: number;
  month: number;
  lookup: DayLookup;
  locale: string;
  onCell: (empId: string, day: number) => void;
}

function guardClass(g: string) {
  return g === "9X5ST1-A"
    ? "bg-[var(--blue-bg,#dbeafe)] text-[#1e40af]"
    : g === "9X5ST1-B"
      ? "bg-[#fce7f3] text-[#9d174d]"
      : "bg-[var(--mint-soft)] text-[#065f46]";
}

const RosterCalendar = memo(function RosterCalendar({ team, days, year, month, lookup, locale, onCell }: Props) {
  const dw = DOW[locale] || DOW.es;

  return (
    <>
      {/* Desktop grid */}
      <div className="hidden lg:block bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-0 w-full" style={{ minWidth: 1100 }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-[var(--card)] text-left text-[11px] font-bold text-[var(--muted)] px-3 py-2 border-b border-r border-[var(--card-border)]" style={{ minWidth: 220 }}>
                  {locale === "en" ? "EMPLOYEE" : "COLABORADOR"}
                </th>
                <th className="sticky z-20 bg-[var(--card)] text-left text-[11px] font-bold text-[var(--muted)] px-2 py-2 border-b border-r border-[var(--card-border)]" style={{ left: 220, minWidth: 92 }}>
                  {locale === "en" ? "GUARD" : "GUARDIA"}
                </th>
                {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
                  const dow = new Date(year, month, d).getDay();
                  const we = dow === 0 || dow === 6;
                  const today = d === TODAY.d && month === TODAY.m && year === TODAY.y;
                  return (
                    <th key={d} className={`text-[10px] font-semibold px-0 py-1 border-b border-r border-[var(--card-border)] ${today ? "bg-[var(--accent-light)] text-[var(--accent)]" : we ? "text-[var(--muted)]" : "text-[var(--muted)]"}`} style={{ minWidth: 30 }}>
                      <div className="lowercase">{dw[dow]}</div>
                      <div className="tabular-nums">{d}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {team.map((emp, ri) => (
                <tr key={emp.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(ri * 30, 400)}ms` }}>
                  <td className="sticky left-0 z-10 bg-[var(--card)] px-3 py-2 border-b border-r border-[var(--card-border)]" style={{ minWidth: 220 }}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full grid place-items-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: emp.color }}>{emp.initials}</span>
                      <div className="min-w-0">
                        <div className="text-[12px] font-bold text-[var(--foreground)] leading-tight truncate">{emp.name}</div>
                        <div className="text-[10.5px] text-[var(--muted)] tabular-nums">{emp.code} · {emp.subdiv}</div>
                      </div>
                    </div>
                  </td>
                  <td className="sticky z-10 bg-[var(--card)] px-2 py-2 border-b border-r border-[var(--card-border)]" style={{ left: 220 }}>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${guardClass(emp.guardia)}`}>{emp.guardia}</span>
                  </td>
                  {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
                    const dow = new Date(year, month, d).getDay();
                    const we = dow === 0 || dow === 6;
                    const cell = lookup[`${emp.id}_${d}`];
                    if (!cell) return <td key={d} className="border-b border-r border-[var(--card-border)]" />;
                    const sub = cell.overrides.some((o) => o.type === "substitute");
                    const pre = cell.overrides.some((o) => o.type === "presence");
                    const pend = cell.overrides.some((o) => o.status === "pending");
                    return (
                      <td key={d} className={`p-0 border-b border-r border-[var(--card-border)] ${we ? "bg-[color-mix(in_srgb,var(--muted)_7%,transparent)]" : ""}`}>
                        <button
                          onClick={() => onCell(emp.id, d)}
                          title={`${emp.name} · ${d} — ${cell.code}`}
                          className="relative w-full h-9 grid place-items-center transition-[filter] hover:brightness-95 hover:shadow-[inset_0_0_0_2px_var(--accent)] cursor-pointer"
                          style={sub ? { boxShadow: "inset 0 0 0 2px #f59e0b" } : pre ? { boxShadow: "inset 0 0 0 2px #7c3aed" } : undefined}
                        >
                          <CodeChip code={cell.code} />
                          {pend && <FiClock className="absolute bottom-0.5 left-0.5 w-2.5 h-2.5 text-[var(--blue,#2563eb)]" />}
                          {sub && <FiRepeat className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 text-[#f59e0b]" />}
                          {pre && <FiMapPin className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-[#7c3aed]" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / tablet cards */}
      <div className="lg:hidden flex flex-col gap-3">
        {team.map((emp) => {
          const start = Math.max(1, TODAY.d - 2);
          const end = Math.min(days, TODAY.d + 4);
          const strip = [];
          for (let d = start; d <= end; d++) strip.push(d);
          return (
            <div key={emp.id} className="card-premium rounded-xl p-3.5">
              <div className="flex items-center gap-3 mb-2.5">
                <span className="w-9 h-9 rounded-full grid place-items-center text-white text-[11px] font-bold flex-shrink-0" style={{ background: emp.color }}>{emp.initials}</span>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[var(--foreground)] truncate">{emp.name}</div>
                  <div className="text-[11px] text-[var(--muted)] truncate">{emp.cargo}</div>
                </div>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-extrabold ${guardClass(emp.guardia)}`}>{emp.guardia}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {strip.map((d) => {
                  const cell = lookup[`${emp.id}_${d}`];
                  return (
                    <button key={d} onClick={() => onCell(emp.id, d)} className="flex flex-col items-center gap-1 min-w-[34px]">
                      <span className="text-[9px] text-[var(--muted)] tabular-nums">{d}</span>
                      <CodeChip code={cell?.code || "TD"} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
});

export default RosterCalendar;
