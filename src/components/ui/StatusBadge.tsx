"use client";

interface StatusBadgeProps {
  /** Status key (e.g. a RecordStatus). Drives the color tone. */
  status: string;
  /** Display text — pass a translated label; falls back to the status key. */
  label?: string;
  size?: "sm" | "md";
}

type Tone = { dot: string; text: string; bg: string };

const tones: Record<string, Tone> = {
  // Record lifecycle
  draft: { dot: "bg-slate-400 shadow-[0_0_4px] shadow-slate-400/40", text: "text-slate-600 dark:text-slate-300", bg: "bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/40" },
  pending: { dot: "bg-amber-500 shadow-[0_0_4px] shadow-amber-500/40", text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40" },
  approved: { dot: "bg-emerald-500 shadow-[0_0_4px] shadow-emerald-500/40", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40" },
  rejected: { dot: "bg-rose-500 shadow-[0_0_4px] shadow-rose-500/40", text: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40" },
  archived: { dot: "bg-[var(--muted)] shadow-[0_0_4px] shadow-black/10", text: "text-[var(--muted)]", bg: "bg-[var(--card)] border border-[var(--card-border)]" },
  // Generic fallbacks reusable across apps
  active: { dot: "bg-emerald-500 shadow-[0_0_4px] shadow-emerald-500/40", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40" },
  inactive: { dot: "bg-[var(--muted)] shadow-[0_0_4px] shadow-black/10", text: "text-[var(--muted)]", bg: "bg-[var(--card)] border border-[var(--card-border)]" },
};

export default function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const tone = tones[status] || tones.archived;
  const sizeClass = size === "sm" ? "text-xs px-2.5 py-0.5 gap-1.5" : "text-xs px-3 py-1 gap-2";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <span className={`inline-flex items-center rounded-full font-medium tracking-wide ${tone.bg} ${tone.text} ${sizeClass}`}>
      <span className={`${dotSize} rounded-full ${tone.dot}`} />
      {label ?? status}
    </span>
  );
}
