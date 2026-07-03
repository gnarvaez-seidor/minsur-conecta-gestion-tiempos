"use client";

import { FiCheckCircle, FiCalendar, FiClock, FiRepeat, FiAlertTriangle } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { RosterMaster } from "../types";
import { shiftFor, TODAY, L } from "../constants";

interface KpiCard {
  Icon: IconType;
  val: string | number;
  lbl: string;
  meter?: number;
}

export default function RosterStats({ master, locale }: { master: RosterMaster; locale: string }) {
  const T = L[locale] || L.es;
  const ov = master.overrides;
  const pend = ov.filter((o) => o.status === "pending").length;
  const abs = ov.filter((o) => o.type === "absence").length;
  const sub = ov.filter((o) => o.type === "substitute").length;
  const rep = ov.filter((o) => o.type === "replication-fail").length;
  const inShift = master.team.filter((e) => {
    const c = shiftFor(e.guardia, TODAY.y, TODAY.m, TODAY.d);
    return c === "TD" || c === "TN";
  }).length;
  const cov = master.team.length ? Math.round((inShift / master.team.length) * 100) : 0;

  const cards: KpiCard[] = [
    { Icon: FiCheckCircle, val: `${cov}%`, lbl: T.k_cov, meter: cov },
    { Icon: FiCalendar, val: abs, lbl: T.k_abs },
    { Icon: FiClock, val: pend, lbl: T.k_pend },
    { Icon: FiRepeat, val: sub, lbl: T.k_sub },
    { Icon: FiClock, val: "2d", lbl: T.k_cut },
    { Icon: FiAlertTriangle, val: rep, lbl: T.k_rep },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-5 animate-stagger">
      {cards.map((c, i) => (
        <div key={i} className="card-premium rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "var(--grad-accent)" }} />
          <div className="w-8 h-8 rounded-lg grid place-items-center bg-[var(--accent-light)] text-[var(--accent)] mb-2">
            <c.Icon className="w-[17px] h-[17px]" />
          </div>
          <div className="text-[26px] font-extrabold leading-none tabular-nums text-[var(--foreground)]">{c.val}</div>
          <div className="text-[11.5px] text-[var(--muted)] font-semibold mt-1.5">{c.lbl}</div>
          {c.meter != null && (
            <div className="h-1.5 rounded-full bg-[var(--card-border)] mt-2.5 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${c.meter}%`, background: "var(--grad-mint)" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
