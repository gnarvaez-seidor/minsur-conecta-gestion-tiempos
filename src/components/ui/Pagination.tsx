"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Props {
  page: number;
  totalPages: number;
  pageNumbers: (number | "...")[];
  onPage: (page: number) => void;
}

export default function Pagination({ page, totalPages, pageNumbers, onPage }: Props) {
  if (totalPages <= 1) return null;

  const baseBtn =
    "min-w-9 h-9 px-2 inline-flex items-center justify-center rounded-lg text-sm border border-[var(--card-border)] disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1.5 mt-5">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={`${baseBtn} text-[var(--muted)] hover:text-[var(--foreground)] row-hover`}
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>

      {pageNumbers.map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="px-1.5 text-[var(--muted)]">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${baseBtn} ${
              p === page
                ? "bg-[var(--accent)] text-white border-transparent"
                : "text-[var(--foreground)] row-hover"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={`${baseBtn} text-[var(--muted)] hover:text-[var(--foreground)] row-hover`}
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
