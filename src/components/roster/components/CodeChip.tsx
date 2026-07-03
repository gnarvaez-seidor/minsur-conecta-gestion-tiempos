"use client";

import { CHIP } from "../constants";

/** Reusable status-code chip (icon+text-ready, token-safe). One source for all code colors. */
export default function CodeChip({ code, className = "" }: { code: string; className?: string }) {
  const [bg, fg, border] = CHIP[code] || ["#e2e8f0", "#334155", false];
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[30px] px-1.5 py-0.5 rounded-md text-[10px] font-extrabold tabular-nums ${className}`}
      style={{ background: bg, color: fg, border: border ? "1px solid rgba(0,0,0,0.12)" : undefined }}
      title={code}
    >
      {code}
    </span>
  );
}
