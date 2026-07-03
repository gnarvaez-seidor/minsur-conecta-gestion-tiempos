"use client";

import { useAuth } from "@/context/AuthContext";
import { useHashRoute } from "@/hooks/useHashRoute";
import { useTranslation } from "@/context/I18nContext";
import Header from "@/components/shell/Header";
import Sidebar from "@/components/shell/Sidebar";
import LoginView from "@/components/shell/LoginView";
import RecordsView from "@/components/records/RecordsView";
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
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          {route.name === "demo" ? (
            <DemoView />
          ) : route.name === "records" ? (
            <RecordsView />
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
