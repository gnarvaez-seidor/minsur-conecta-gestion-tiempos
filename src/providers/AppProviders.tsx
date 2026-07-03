"use client";

import { type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { WorkzoneThemeProvider } from "@/context/WorkzoneThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProvider } from "@/context/I18nContext";

/**
 * Provider composition: Redux (UI/domain state) wraps the cross-cutting Contexts
 * (theme / auth / i18n). Mirrors the SeidorApps canonical AppProviders.
 */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <WorkzoneThemeProvider>
        <AuthProvider>
          <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
      </WorkzoneThemeProvider>
    </Provider>
  );
}
