"use client";

import { useTranslation } from "@/context/I18nContext";
import type { Locale } from "@/i18n/types";

const LOCALES: Locale[] = ["en", "es"];

export default function LocaleSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div
      className="inline-flex items-center rounded-lg border border-[var(--card-border)] overflow-hidden"
      role="group"
      aria-label={t("locale.label")}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`px-2.5 py-1 text-xs font-semibold ${
            locale === l
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
