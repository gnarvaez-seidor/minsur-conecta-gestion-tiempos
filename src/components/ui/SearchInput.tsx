"use client";

import { FiSearch } from "react-icons/fi";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={`relative ${className ?? "flex-1"}`}>
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus-ring"
      />
    </div>
  );
}
