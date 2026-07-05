"use client";

import { useEffect, useRef } from "react";
import { FiBox, FiX } from "react-icons/fi";
import { useHashRoute } from "@/hooks/useHashRoute";
import { useTranslation } from "@/context/I18nContext";
import Portal from "@/components/ui/Portal";
import { NAV_LINKS, type NavLink } from "./navLinks";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Off-canvas navigation for <lg viewports (the desktop `Sidebar` is `hidden lg:flex`).
 * Slides in from the left over a backdrop; closes on Esc, backdrop tap, or navigation.
 * Reuses `NAV_LINKS` so it never drifts from the sidebar. Kept mounted for the slide
 * transition, but `inert` while closed so its controls leave the tab order.
 */
export default function MobileNavDrawer({ open, onClose }: Props) {
  const { route, navigate } = useHashRoute();
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  // While open: Esc closes, Tab is trapped, body scroll is locked, focus moves in and
  // is restored to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const lastFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusId = window.setTimeout(() => focusables()[0]?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusId);
      lastFocused?.focus?.();
    };
  }, [open, onClose]);

  const go = (name: NavLink["name"]) => {
    navigate(name);
    onClose();
  };

  return (
    <Portal>
    <div className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("app.name")}
        inert={!open}
        className={`absolute left-0 top-0 h-full w-72 max-w-[80%] flex flex-col bg-[var(--card)] border-r border-[var(--card-border)] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg seidor-gradient flex items-center justify-center text-white flex-shrink-0">
              <FiBox className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)] truncate">{t("app.name")}</p>
              <p className="text-[11px] text-[var(--muted)] truncate">{t("app.tagline")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t("common.close")}
            className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] row-hover"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {NAV_LINKS.map(({ name, labelKey, Icon }) => {
            const active = route.name === name;
            return (
              <button
                key={name}
                onClick={() => go(name)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
      </div>
    </div>
    </Portal>
  );
}
