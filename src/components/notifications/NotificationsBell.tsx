"use client";

import { useCallback, useState } from "react";
import { FiBell } from "react-icons/fi";
import { useTranslation } from "@/context/I18nContext";
import { useNotifications } from "./hooks/useNotifications";
import NotificationsPanel from "./NotificationsPanel";
import { tt, toLang } from "./constants";

/**
 * Self-contained bell for the Header: owns its open state, polls the unread count for the badge,
 * and re-syncs the badge when the panel closes (the panel has its own list state).
 */
export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { locale } = useTranslation();
  const lang = toLang(locale);
  const { unread, refreshCount } = useNotifications({ poll: true });

  const close = useCallback(() => {
    setOpen(false);
    void refreshCount(); // reflect any read/read-all done inside the panel
  }, [refreshCount]);

  const badge = unread > 99 ? "99+" : String(unread);
  const label =
    unread > 0
      ? `${tt(lang, "open")} — ${
          unread === 1 ? tt(lang, "unreadOne") : tt(lang, "unreadMany", { n: unread })
        }`
      : tt(lang, "open");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] row-hover focus-ring"
      >
        <FiBell className="w-4 h-4" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold leading-4 text-white text-center animate-pulse-glow"
            style={{ background: "var(--grad-accent)" }}
          >
            {badge}
          </span>
        )}
      </button>
      <NotificationsPanel open={open} onClose={close} />
    </>
  );
}
