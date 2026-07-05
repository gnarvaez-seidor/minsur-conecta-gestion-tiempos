import { FiCalendar, FiUser, FiShield } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { RouteName } from "@/hooks/useHashRoute";
import type { TKey } from "@/i18n/types";

/**
 * Single source of truth for the app's primary navigation. Consumed by both the desktop
 * `Sidebar` (≥lg) and the `MobileNavDrawer` (<lg) so the two never drift. Labels are i18n
 * keys resolved with `t()` at render time. Add entries here as the app grows.
 */
export interface NavLink {
  name: Exclude<RouteName, "login">;
  labelKey: TKey;
  Icon: IconType;
}

export const NAV_LINKS: NavLink[] = [
  { name: "roster", labelKey: "nav.roster", Icon: FiCalendar },
  { name: "profile", labelKey: "nav.profile", Icon: FiUser },
  { name: "demo", labelKey: "nav.demo", Icon: FiShield },
];
