"use client";

import CodeChip from "./CodeChip";
import type { RosterMaster, Override } from "../types";
import { L } from "../constants";

export default function RosterSummary({ master, locale, filter }: { master: RosterMaster; locale: string; filter: string }) {
  const T = L[locale] || L.es;
  const team = master.team.filter((e) => e.name.toLowerCase().includes(filter));
  const cols = [T.c_emp, T.c_pos, T.c_guard, T.c_pres, T.c_abs, T.c_sub, T.c_st];
  const get = (id: string, ty: Override["type"]) => master.overrides.filter((o) => o.employeeId === id && o.type === ty);
  const tag = (list: Override[]) =>
    list.length ? (
      <span className="flex flex-wrap gap-1">
        {list.map((o) => <CodeChip key={o.id} code={o.type === "substitute" ? o.swapTo || "TD" : o.code || ""} className={o.status === "pending" ? "opacity-60" : ""} />)}
      </span>
    ) : (
      <span className="text-[var(--muted)]">—</span>
    );

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden overflow-x-auto shadow-sm animate-fade-in-up">
      <table className="w-full border-collapse" style={{ minWidth: 720 }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} className="text-left text-[11px] uppercase tracking-wide text-[var(--muted)] px-3.5 py-2.5 border-b border-[var(--card-border)]">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {team.map((e) => {
            const pend = [...get(e.id, "presence"), ...get(e.id, "absence"), ...get(e.id, "substitute")].some((o) => o.status === "pending");
            return (
              <tr key={e.id} className="row-hover">
                <td className="px-3.5 py-2.5 border-b border-[var(--card-border)]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full grid place-items-center text-white text-[10px] font-bold" style={{ background: e.color }}>{e.initials}</span>
                    <span className="text-[12.5px] font-semibold text-[var(--foreground)]">{e.name}</span>
                  </div>
                </td>
                <td className="px-3.5 py-2.5 border-b border-[var(--card-border)] text-[12px] text-[var(--muted)]">{e.cargo}</td>
                <td className="px-3.5 py-2.5 border-b border-[var(--card-border)] text-[12px]">{e.guardia}</td>
                <td className="px-3.5 py-2.5 border-b border-[var(--card-border)]">{tag(get(e.id, "presence"))}</td>
                <td className="px-3.5 py-2.5 border-b border-[var(--card-border)]">{tag(get(e.id, "absence"))}</td>
                <td className="px-3.5 py-2.5 border-b border-[var(--card-border)]">{tag(get(e.id, "substitute"))}</td>
                <td className="px-3.5 py-2.5 border-b border-[var(--card-border)]">
                  <span className={`text-[12px] font-bold ${pend ? "text-[#b45309]" : "text-[#15803d]"}`}>● {pend ? T.pending : T.approved}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
