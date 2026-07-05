"use client";

import { useHashRoute } from "@/hooks/useHashRoute";
import { useTranslation } from "@/context/I18nContext";
import { NAV_LINKS } from "./navLinks";

export default function Sidebar() {
  const { route, navigate } = useHashRoute();
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-64 border-r border-[var(--card-border)] bg-[var(--card)] p-3 shrink-0">
      <nav className="flex flex-col gap-1 animate-stagger">
        {NAV_LINKS.map(({ name, labelKey, Icon }) => {
          const active = route.name === name;
          return (
            <button
              key={name}
              onClick={() => navigate(name)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--accent-light)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] row-hover"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {t(labelKey)}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
