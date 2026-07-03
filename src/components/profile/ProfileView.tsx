"use client";

/**
 * Mi Perfil — data-dense employee profile for MINSUR Conecta (Gestión de Tiempos).
 * Premium teal identity, token-driven (no hardcoded surfaces), bilingual via I18nContext
 * (reads `locale`/`setLocale` only) + a module-local dictionary. Responsive: 1 col on
 * mobile, 2 cols on desktop, with fade-in stagger on the section grid.
 */

import { useMemo } from "react";
import type { IconType } from "react-icons";
import {
  FiHash,
  FiBriefcase,
  FiClock,
  FiLayers,
  FiCalendar,
  FiRepeat,
  FiAlertTriangle,
  FiCheckSquare,
  FiSun,
  FiMoon,
  FiGlobe,
  FiSliders,
  FiTrendingUp,
} from "react-icons/fi";

import { useTranslation } from "@/context/I18nContext";
import { useWorkzoneTheme } from "@/context/WorkzoneThemeContext";
import type { Locale } from "@/i18n/types";
import type { Override, OverrideStatus } from "@/components/roster/types";
import CodeChip from "@/components/roster/components/CodeChip";
import StatusBadge from "@/components/ui/StatusBadge";
import { MONTHS } from "@/components/roster/constants";
import {
  L,
  PROFILE,
  STATUS_TONE,
  codeLabel,
  getMyRequests,
  requestRange,
} from "./constants";

/** Override type → dictionary key + icon. */
const TYPE_META: Record<Override["type"], { key: string; Icon: IconType }> = {
  absence: { key: "t_absence", Icon: FiCalendar },
  presence: { key: "t_presence", Icon: FiClock },
  substitute: { key: "t_substitute", Icon: FiRepeat },
  "replication-fail": { key: "t_replication_fail", Icon: FiAlertTriangle },
};

/** Override status → dictionary key (label). Tone comes from STATUS_TONE. */
const STATUS_KEY: Record<OverrideStatus, string> = {
  approved: "st_approved",
  pending: "st_pending",
  rejected: "st_rejected",
  failed: "st_failed",
};

interface FieldRowProps {
  Icon: IconType;
  label: string;
  value: string;
  hint?: string;
}
function FieldRow({ Icon, label, value, hint }: FieldRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--card-border)] last:border-b-0">
      <span className="w-9 h-9 shrink-0 rounded-lg grid place-items-center bg-[var(--accent-light)] text-[var(--accent)]">
        <Icon className="w-[17px] h-[17px]" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold">{label}</div>
        <div className="text-[14px] font-semibold text-[var(--foreground)] truncate">
          {value}
          {hint && <span className="ml-2 text-[12px] font-medium text-[var(--muted)]">{hint}</span>}
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  Icon: IconType;
  value: string;
  label: string;
  sub?: string;
  meter?: number;
}
function KpiCard({ Icon, value, label, sub, meter }: KpiCardProps) {
  return (
    <div className="card-premium stat-card rounded-xl p-4 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "var(--grad-accent)" }} />
      <div className="w-8 h-8 rounded-lg grid place-items-center bg-[var(--accent-light)] text-[var(--accent)] mb-2">
        <Icon className="w-[17px] h-[17px]" />
      </div>
      <div className="text-[26px] font-extrabold leading-none tabular-nums text-[var(--foreground)]">{value}</div>
      <div className="text-[11.5px] text-[var(--muted)] font-semibold mt-1.5">{label}</div>
      {sub && <div className="text-[11px] text-[var(--muted)] mt-0.5">{sub}</div>}
      {meter != null && (
        <div className="h-1.5 rounded-full bg-[var(--card-border)] mt-2.5 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, meter))}%`, background: "var(--grad-mint)" }} />
        </div>
      )}
    </div>
  );
}

export default function ProfileView() {
  const { locale, setLocale } = useTranslation();
  const { mode, toggle, canToggle } = useWorkzoneTheme();
  const T = L[locale] ?? L.es;

  const requests = useMemo(() => getMyRequests(), []);
  const pendingCount = useMemo(() => requests.filter((r) => r.status === "pending").length, [requests]);

  const vacBalance = PROFILE.vacTotal - PROFILE.vacTaken;
  const vacPct = PROFILE.vacTotal ? Math.round((PROFILE.vacTaken / PROFILE.vacTotal) * 100) : 0;
  const monthAbbr = (MONTHS[locale] ?? MONTHS.es)[PROFILE.cutoff.month].slice(0, 3);

  const langs: Locale[] = ["es", "en"];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <header className="mb-5 animate-fade-in-up">
        <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-[var(--foreground)]">{T.title}</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1">{T.sub}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-stagger">
        {/* 1 · HERO */}
        <section
          className="lg:col-span-2 relative overflow-hidden rounded-2xl p-6 sm:p-7 text-white"
          style={{ background: "var(--grad-header)", boxShadow: "var(--sh-lg)" }}
        >
          <div className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl animate-float" />
          <div className="pointer-events-none absolute bottom-[-40px] right-24 w-32 h-32 rounded-full bg-[var(--mint)]/20 blur-2xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl grid place-items-center bg-white/15 border border-white/25 backdrop-blur-sm text-[30px] sm:text-[34px] font-extrabold tracking-tight shadow-lg">
              {PROFILE.initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-[24px] sm:text-[28px] font-extrabold leading-tight">{PROFILE.name}</h2>
              <p className="text-[14px] text-white/85 font-medium mt-0.5">{PROFILE.cargo}</p>
              <p className="text-[12px] text-white/70 mt-0.5 tabular-nums">{T.f_code}: {PROFILE.code}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { l: T.guard, v: PROFILE.guardia },
                  { l: T.system, v: PROFILE.sistema },
                  { l: T.role, v: PROFILE.rol },
                ].map((c) => (
                  <span
                    key={c.l}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-[12px] font-semibold backdrop-blur-sm"
                  >
                    <span className="text-white/60 font-medium">{c.l}</span>
                    {c.v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2 · KPIs */}
        <section className="lg:col-span-2">
          <h3 className="flex items-center gap-2 text-[13px] font-bold text-[var(--foreground)] mb-3">
            <FiTrendingUp className="w-4 h-4 text-[var(--accent)]" /> {T.kpiTitle}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              Icon={FiSun}
              value={String(PROFILE.vacTaken)}
              label={T.k_vacTaken}
              sub={T.k_vacOf.replace("{n}", String(PROFILE.vacTotal))}
              meter={vacPct}
            />
            <KpiCard Icon={FiCalendar} value={String(vacBalance)} label={T.k_vacBal} sub={T.k_vacDays} />
            <KpiCard Icon={FiClock} value={String(pendingCount)} label={T.k_pending} />
            <KpiCard Icon={FiCheckSquare} value={`${PROFILE.cutoff.day} ${monthAbbr}`} label={T.k_cutoff} sub={PROFILE.cutoff.time} />
          </div>
        </section>

        {/* 3 · Datos laborales */}
        <section className="card-premium card-hover rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-9 h-9 rounded-lg grid place-items-center bg-[var(--accent-light)] text-[var(--accent)]">
              <FiBriefcase className="w-[18px] h-[18px]" />
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-[var(--foreground)]">{T.laborTitle}</h3>
              <p className="text-[12px] text-[var(--muted)]">{T.laborSub}</p>
            </div>
          </div>
          <div>
            <FieldRow Icon={FiHash} label={T.f_code} value={PROFILE.code} />
            <FieldRow Icon={FiBriefcase} label={T.f_cargo} value={PROFILE.cargo} />
            <FieldRow Icon={FiClock} label={T.f_guard} value={PROFILE.guardia} hint={PROFILE.sistema} />
            <FieldRow Icon={FiLayers} label={T.f_org} value={PROFILE.subdiv} hint={PROFILE.area} />
          </div>
        </section>

        {/* 4 · Preferencias */}
        <section className="card-premium rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-9 h-9 rounded-lg grid place-items-center bg-[var(--accent-light)] text-[var(--accent)]">
              <FiSliders className="w-[18px] h-[18px]" />
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-[var(--foreground)]">{T.prefTitle}</h3>
              <p className="text-[12px] text-[var(--muted)]">{T.prefSub}</p>
            </div>
          </div>

          {/* Language */}
          <div className="mb-5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold mb-2">
              <FiGlobe className="w-3.5 h-3.5" /> {T.prefLang}
            </div>
            <div className="inline-flex p-1 rounded-xl bg-[var(--accent-light)] border border-[var(--card-border)]">
              {langs.map((lng) => {
                const active = locale === lng;
                return (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => setLocale(lng)}
                    aria-pressed={active}
                    className={`btn-press focus-ring px-4 py-1.5 rounded-lg text-[13px] font-bold uppercase tracking-wide ${
                      active
                        ? "bg-[var(--card)] text-[var(--accent)] shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {lng}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold mb-2">
              <FiSun className="w-3.5 h-3.5" /> {T.prefTheme}
            </div>
            {canToggle ? (
              <div className="inline-flex p-1 rounded-xl bg-[var(--accent-light)] border border-[var(--card-border)]">
                {([
                  { m: "light" as const, Icon: FiSun, lbl: T.themeLight },
                  { m: "dark" as const, Icon: FiMoon, lbl: T.themeDark },
                ]).map(({ m, Icon, lbl }) => {
                  const active = mode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        if (!active) toggle();
                      }}
                      aria-pressed={active}
                      className={`btn-press focus-ring inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-bold ${
                        active
                          ? "bg-[var(--card)] text-[var(--accent)] shadow-sm"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {lbl}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--accent-light)] px-4 py-2 text-[13px] font-semibold text-[var(--muted)]">
                {mode === "dark" ? <FiMoon className="w-4 h-4" /> : <FiSun className="w-4 h-4" />}
                {T.themeManaged}
              </div>
            )}
          </div>
        </section>

        {/* 5 · Mis solicitudes */}
        <section className="lg:col-span-2 card-premium rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-9 h-9 rounded-lg grid place-items-center bg-[var(--accent-light)] text-[var(--accent)]">
              <FiLayers className="w-[18px] h-[18px]" />
            </span>
            <div className="flex-1">
              <h3 className="text-[15px] font-bold text-[var(--foreground)]">{T.reqTitle}</h3>
              <p className="text-[12px] text-[var(--muted)]">{T.reqSub}</p>
            </div>
            <span className="tabular-nums text-[13px] font-bold text-[var(--accent)] bg-[var(--accent-light)] rounded-full px-3 py-1">
              {requests.length}
            </span>
          </div>

          {requests.length === 0 ? (
            <p className="text-[13px] text-[var(--muted)] py-6 text-center">{T.reqEmpty}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {requests.map((ov) => {
                const meta = TYPE_META[ov.type];
                const chip = ov.type === "substitute" ? ov.swapTo : ov.code;
                return (
                  <li
                    key={ov.id}
                    className="row-hover flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3.5 py-3"
                  >
                    <span className="w-9 h-9 shrink-0 rounded-lg grid place-items-center bg-[var(--accent-light)] text-[var(--accent)]">
                      <meta.Icon className="w-[17px] h-[17px]" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-[13.5px] font-bold text-[var(--foreground)]">{T[meta.key]}</span>
                        {chip && <CodeChip code={chip} />}
                        {chip && <span className="text-[12px] text-[var(--muted)]">{codeLabel(chip)}</span>}
                      </div>
                      {ov.notes && <p className="text-[12px] text-[var(--muted)] mt-0.5 truncate">{ov.notes}</p>}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-[12.5px] font-semibold text-[var(--foreground)] tabular-nums">{requestRange(ov, locale)}</div>
                        <div className="text-[11px] text-[var(--muted)] tabular-nums">
                          {T.it} {ov.infotipo} · {ov.lastChange}
                        </div>
                      </div>
                      <StatusBadge status={STATUS_TONE[ov.status]} label={T[STATUS_KEY[ov.status]]} size="sm" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
