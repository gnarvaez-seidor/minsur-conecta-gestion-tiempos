"use client";

import { FiMoon, FiSun } from "react-icons/fi";
import { useWorkzoneTheme } from "@/context/WorkzoneThemeContext";
import { useTranslation } from "@/context/I18nContext";

export default function ThemeToggle() {
  const { mode, toggle, canToggle } = useWorkzoneTheme();
  const { t } = useTranslation();

  // Inside Workzone the theme is driven by the launchpad (postMessage) — hide the manual toggle.
  if (!canToggle) return null;

  return (
    <button
      onClick={toggle}
      aria-label={t("theme.toggle")}
      title={t("theme.toggle")}
      className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] row-hover"
    >
      {mode === "dark" ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
    </button>
  );
}
