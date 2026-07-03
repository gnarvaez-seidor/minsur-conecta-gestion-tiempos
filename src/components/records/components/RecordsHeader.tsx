"use client";

import { FiColumns, FiPlus } from "react-icons/fi";
import { useTranslation } from "@/context/I18nContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleDensity } from "@/store/slices/uiSlice";

export default function RecordsHeader() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const density = useAppSelector((s) => s.ui.density);

  return (
    <div className="flex items-start sm:items-center justify-between gap-3 mb-6 flex-col sm:flex-row">
      <div>
        <h1 className="text-xl font-semibold text-[var(--foreground)]">{t("records.title")}</h1>
        <p className="text-sm text-[var(--muted)]">{t("records.subtitle")}</p>
      </div>
      <div className="flex items-center gap-2">
        {/* Redux demo: density toggle reads/writes uiSlice */}
        <button
          onClick={() => dispatch(toggleDensity())}
          title={t("records.densityLabel")}
          className="px-3 py-2 text-sm rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] row-hover inline-flex items-center gap-2"
        >
          <FiColumns className="w-4 h-4" />
          <span className="hidden sm:inline">
            {density === "compact" ? t("records.densityCompact") : t("records.densityComfortable")}
          </span>
        </button>
        <button className="px-3 py-2 text-sm rounded-lg text-white seidor-gradient seidor-glow btn-press inline-flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> {t("records.newRecord")}
        </button>
      </div>
    </div>
  );
}
