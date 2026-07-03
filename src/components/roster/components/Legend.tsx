"use client";

import { useState } from "react";
import CodeChip from "./CodeChip";
import type { RosterMaster } from "../types";
import { L } from "../constants";

type Tab = "horario" | "pres" | "aus";

export default function Legend({ master, locale }: { master: RosterMaster; locale: string }) {
  const [tab, setTab] = useState<Tab>("horario");
  const T = L[locale] || L.es;
  const tabs: [Tab, string][] = [["horario", T.sch], ["pres", T.pres], ["aus", T.abs]];

  return (
    <aside className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden self-start">
      <div className="flex border-b border-[var(--card-border)]">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 py-2.5 text-[11.5px] font-bold border-b-2 transition-colors ${
              tab === k
                ? "text-[var(--accent)] border-[var(--accent)] bg-[var(--accent-light)]"
                : "text-[var(--muted)] border-transparent hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="p-3.5 flex flex-col gap-2">
        {master.legend[tab].map((it) => (
          <div key={it.code} className="flex items-center gap-2.5 text-xs text-[var(--foreground)]">
            <CodeChip code={it.code} className="min-w-[38px]" />
            <span>{it.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
