"use client";

import { FiList, FiShield, FiCalendar, FiUser } from "react-icons/fi";
import type { IconType } from "react-icons";
import { useHashRoute, type RouteName } from "@/hooks/useHashRoute";
import { useTranslation } from "@/context/I18nContext";

interface NavLink {
  name: RouteName;
  label: string;
  Icon: IconType;
}

export default function Sidebar() {
  const { route, navigate } = useHashRoute();
  const { t } = useTranslation();

  // One module in the template — add entries here as the app grows.
  const isEs = (t("nav.records") || "").toLowerCase() !== "records";
  const links: NavLink[] = [
    { name: "roster", label: isEs ? "Roster" : "Roster", Icon: FiCalendar },
    { name: "profile", label: isEs ? "Mi Perfil" : "My Profile", Icon: FiUser },
    { name: "demo", label: "Demo E2E", Icon: FiShield },
    { name: "records", label: t("nav.records"), Icon: FiList },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-64 border-r border-[var(--card-border)] bg-[var(--card)] p-3 shrink-0">
      <nav className="flex flex-col gap-1 animate-stagger">
        {links.map(({ name, label, Icon }) => {
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
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
