"use client";

import { useState } from "react";
import { FiBox } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/I18nContext";
import { activeStrategy } from "@/auth";
import { parseJwt } from "@/services/authService";
import AlertBanner from "@/components/ui/AlertBanner";

/**
 * Minimal dev login: paste a raw JWT or the full /useridp JSON response. In `mock` mode the
 * user is signed in automatically by the strategy, so this view only shows an info notice.
 */
export default function LoginView() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isMock = activeStrategy.name === "mock";

  const submit = () => {
    setError(null);
    try {
      const trimmed = raw.trim();
      let sToken = trimmed;
      if (trimmed.startsWith("{")) {
        const obj = JSON.parse(trimmed);
        const data = obj.results || obj.oDataResponse || obj;
        sToken = data.sToken || "";
      }
      if (!sToken) throw new Error("no token");
      const jwt = parseJwt(sToken) as Record<string, string>;
      login({
        token: sToken,
        usuario: jwt.Usuario || jwt.usuario || "user",
        correo: jwt.Email || jwt.email || "",
        nombre: jwt.Nombre || "",
        apellido: jwt.Apellido || "",
      });
      window.location.hash = "#/records";
    } catch {
      setError(t("auth.invalidToken"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-xl p-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl seidor-gradient flex items-center justify-center text-white">
            <FiBox className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--foreground)]">{t("auth.title")}</h1>
            <p className="text-xs text-[var(--muted)]">{t("app.name")}</p>
          </div>
        </div>

        {isMock ? (
          <AlertBanner type="info" title={t("app.name")} message={t("auth.mockNotice")} />
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--foreground)]">{t("auth.tokenLabel")}</span>
              <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={t("auth.tokenPlaceholder")}
                rows={5}
                className="mt-1.5 w-full rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-3 text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--muted)] focus-ring resize-none"
              />
            </label>
            {error && <AlertBanner type="error" title={t("auth.title")} message={error} />}
            <button
              onClick={submit}
              disabled={!raw.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white seidor-gradient seidor-glow btn-press disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("auth.signIn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
