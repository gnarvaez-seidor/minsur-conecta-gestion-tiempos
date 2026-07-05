"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHashRoute } from "@/hooks/useHashRoute";
import { useTranslation } from "@/context/I18nContext";
import Header from "@/components/shell/Header";
import Sidebar from "@/components/shell/Sidebar";
import MobileNavDrawer from "@/components/shell/MobileNavDrawer";
import LoginView from "@/components/shell/LoginView";
import RosterView from "@/components/roster/RosterView";
import ProfileView from "@/components/profile/ProfileView";
import DemoView from "@/components/demo/DemoView";

/**
 * The ONLY real route (static export emits a single index.html). Navigation between views
 * is hash-based (useHashRoute) so deep links never hit the Workzone host as real paths.
 */
export default function Page() {
  const { loading, isAuthenticated } = useAuth();
  const { route } = useHashRoute();
  const { t } = useTranslation();
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile drawer on every route change (belt-and-braces with its own onClose).
  useEffect(() => {
    setNavOpen(false);
  }, [route.name]);

  // Auth bootstrap gate (the one sanctioned non-skeleton spinner).
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-sm text-[var(--muted)] animate-pulse">{t("auth.sessionCheck")}</div>
      </div>
    );
  }

  if (route.name === "login" || !isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Header onMenuClick={() => setNavOpen(true)} />
      <MobileNavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          {route.name === "demo" ? (
            <DemoView />
          ) : route.name === "profile" ? (
            <ProfileView />
          ) : (
            <RosterView />
          )}
        </main>
      </div>
    </div>
  );
}
