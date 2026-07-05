"use client";

import { FiBox, FiLogOut, FiMenu } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/I18nContext";
import ThemeToggle from "./ThemeToggle";
import LocaleSwitcher from "./LocaleSwitcher";
import NotificationsBell from "@/components/notifications/NotificationsBell";

interface HeaderProps {
  /** Opens the mobile nav drawer (hamburger is only shown <lg). */
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { session, logout } = useAuth();
  const { t } = useTranslation();
  const initial = (session?.nombre || session?.usuario || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-[var(--card)] border-b border-[var(--card-border)]">
      <div className="h-14 px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onMenuClick}
            aria-label={t("common.menu")}
            className="lg:hidden p-2 -ml-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] row-hover"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-lg seidor-gradient flex items-center justify-center text-white flex-shrink-0">
            <FiBox className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">{t("app.name")}</p>
            <p className="text-[11px] text-[var(--muted)] truncate hidden sm:block">{t("app.tagline")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session && <NotificationsBell />}
          <LocaleSwitcher />
          <ThemeToggle />
          {session && (
            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-[var(--card-border)]">
              <div
                className="w-7 h-7 rounded-full seidor-orb flex items-center justify-center text-white text-xs font-semibold"
                title={session.correo || session.usuario}
              >
                {initial}
              </div>
              <button
                onClick={logout}
                aria-label={t("common.logout")}
                title={t("common.logout")}
                className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] row-hover"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
