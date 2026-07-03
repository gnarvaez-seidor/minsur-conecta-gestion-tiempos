"use client";

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-shimmer rounded-xl ${className || ""}`} />;
}

export function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-10 h-10 rounded-xl" />
        <div>
          <SkeletonBlock className="h-5 w-36 mb-1.5" />
          <SkeletonBlock className="h-3 w-48" />
        </div>
      </div>
      <SkeletonBlock className="h-9 w-32 rounded-lg" />
    </div>
  );
}

export function SkeletonSearch() {
  return (
    <div className="flex gap-3 mb-4">
      <SkeletonBlock className="h-10 flex-1 rounded-lg" />
      <SkeletonBlock className="h-10 w-36 rounded-lg" />
    </div>
  );
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 ${count <= 3 ? "lg:grid-cols-3" : count >= 5 ? "sm:grid-cols-3 lg:grid-cols-5" : "lg:grid-cols-4"} gap-3 mb-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 flex items-center gap-3">
          <SkeletonBlock className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <SkeletonBlock className="h-6 w-16 mb-1.5" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTableRow({ cols }: { cols: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--card-border)]">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={`h-3.5 rounded ${i === 0 ? "w-32" : i === cols - 1 ? "w-16" : "w-20"} ${i === 0 ? "" : "flex-shrink-0"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ cols = 5, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--card-border)] bg-[var(--card)]">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className={`h-3 rounded ${i === 0 ? "w-24" : "w-16"}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </div>
  );
}

export function SkeletonDetailCard({ lines = 4 }: { lines?: number }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
      <SkeletonBlock className="h-4 w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
