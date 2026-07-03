"use client";

import { useEffect, useState } from "react";
import { FiX, FiRepeat } from "react-icons/fi";
import type { Employee, OverrideType } from "../types";
import { L } from "../constants";
import CodeChip from "../components/CodeChip";

interface Props {
  open: boolean;
  team: Employee[];
  initialType: OverrideType;
  initialEmployeeId?: string;
  locale: string;
  onClose: () => void;
  onSubmit: () => void;
}

const ABS = ["1000 · VAC — Vacaciones", "1100 · DM — Descanso médico", "1202 · LP — Lic. paternidad", "1200 · LCG — Lic. con goce", "1302 · LSG — Lic. sin goce"];
const PRES = ["206 · TT — Teletrabajo", "0150 · CT — Comisión de trabajo", "0180 · CA — Capacitación", "207 · FL — Feriado laborado", "203 · EMO — Examen médico"];

export default function RequestModal({ open, team, initialType, initialEmployeeId, locale, onClose, onSubmit }: Props) {
  const T = L[locale] || L.es;
  const [type, setType] = useState<OverrideType>(initialType);
  const [swapFrom, setSwapFrom] = useState("TD");
  const [swapTo, setSwapTo] = useState("TN");

  useEffect(() => { if (open) setType(initialType); }, [open, initialType]);

  if (!open) return null;
  const title = type === "absence" ? "IT 2001" : type === "presence" ? "IT 2002" : "IT 2003";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-5" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[rgba(6,20,23,0.55)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[560px] max-w-full max-h-[90vh] overflow-auto rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl animate-scale-in">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 text-white" style={{ background: "var(--grad-header)" }}>
          <h3 className="text-base font-extrabold">{T.newReq} · {title}</h3>
          <button onClick={onClose} aria-label="Cerrar" className="w-9 h-9 grid place-items-center rounded-lg bg-white/15 hover:bg-white/25 transition-colors"><FiX /></button>
        </div>
        <div className="p-5 space-y-3.5">
          <div className="rounded-r-lg border-l-[3px] border-[var(--accent)] bg-[var(--accent-light)] px-3.5 py-2.5 text-[12.5px] text-[var(--foreground)]">
            {locale === "en" ? "Your request starts a digital approval flow. Once approved, it replicates to the S/4HANA infotype." : "Tu solicitud inicia un flujo digital de aprobación. Al aprobarse, replica al infotipo en S/4HANA."}
          </div>
          <Field label={T.emp}><select className="fld">{team.map((e) => <option key={e.id} selected={e.id === initialEmployeeId}>{e.name}</option>)}</select></Field>
          <Field label={T.type}>
            <select className="fld" value={type} onChange={(e) => setType(e.target.value as OverrideType)}>
              <option value="absence">{T.absence} · IT 2001</option>
              <option value="presence">{T.presence} · IT 2002</option>
              <option value="substitute">{T.substitute} · IT 2003</option>
            </select>
          </Field>
          {type === "absence" && <Field label={locale === "en" ? "Absence subtype (S/4HANA)" : "Subtipo de ausencia (S/4HANA)"}><select className="fld">{ABS.map((o) => <option key={o}>{o}</option>)}</select></Field>}
          {type === "presence" && <Field label={locale === "en" ? "Presence subtype (S/4HANA)" : "Subtipo de presencia (S/4HANA)"}><select className="fld">{PRES.map((o) => <option key={o}>{o}</option>)}</select></Field>}
          {type === "substitute" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label={T.origFrom}><select className="fld" value={swapFrom} onChange={(e) => setSwapFrom(e.target.value)}><option>TD</option><option>TN</option><option>L</option></select></Field>
                <Field label={T.newTo}><select className="fld" value={swapTo} onChange={(e) => setSwapTo(e.target.value)}><option>TN</option><option>TD</option><option>L</option></select></Field>
              </div>
              <div className="flex items-center justify-center gap-4 rounded-xl border border-dashed border-[#f59e0b] bg-[var(--card)] p-3.5">
                <div className="text-center"><div className="text-[10px] uppercase text-[var(--muted)] mb-1">{T.origFrom}</div><CodeChip code={swapFrom} /></div>
                <FiRepeat className="text-[#f59e0b]" />
                <div className="text-center"><div className="text-[10px] uppercase text-[var(--muted)] mb-1">{T.newTo}</div><CodeChip code={swapTo} /></div>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label={T.from}><input type="date" defaultValue="2026-05-15" className="fld" /></Field>
            <Field label={T.to}><input type="date" defaultValue="2026-05-17" className="fld" /></Field>
          </div>
          <Field label={T.notes}><textarea rows={2} className="fld" placeholder="…" /></Field>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-2.5 border-t border-[var(--card-border)] bg-[var(--card)] px-5 py-3.5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-bold text-[var(--muted)] border border-[var(--card-border)] hover:bg-[var(--accent-light)] transition-colors">{T.cancel}</button>
          <button onClick={onSubmit} className="px-4 py-2 rounded-lg text-[13px] font-bold text-white shadow-md" style={{ background: "var(--grad-accent)" }}>{T.send}</button>
        </div>
      </div>
      <style jsx>{`.fld{width:100%;border:1px solid var(--card-border);background:color-mix(in srgb,var(--card) 92%, var(--accent-light));color:var(--foreground);border-radius:10px;padding:10px 12px;font-size:13.5px}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-extrabold uppercase tracking-wide text-[var(--muted)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}
