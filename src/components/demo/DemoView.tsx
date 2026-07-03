"use client";

import { useCallback, useEffect, useState } from "react";
import { FiShield, FiCheckCircle, FiXCircle, FiRefreshCw, FiKey } from "react-icons/fi";
import { sessionStore } from "@/auth/session";
import { demoService } from "@/services/demoService";
import type { DemoResponse } from "./types";

/** first10…last10, igual que el `preview` del backend, para comparar visualmente. */
function preview(token: string | null | undefined): string | null {
  if (!token) return null;
  return `${token.slice(0, 10)}…${token.slice(-10)}`;
}

/**
 * Vista de aceptación del stack: dispara una llamada que recorre
 * front → gateway (valida xsuaa-central) → apiintegracion (eco) y PINTA el token
 * que volvió, comparándolo con el token que el front tiene en sesión.
 */
export default function DemoView() {
  const [data, setData] = useState<DemoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await demoService.whoami());
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 401
          ? "Sesión inválida o expirada (401). Vuelve a iniciar sesión con un token válido."
          : "No se pudo contactar al servicio de demo a través del gateway.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sessionToken = sessionStore.get()?.token ?? null;
  const sessionPreview = preview(sessionToken);
  const echoedPreview = data?.token.preview ?? null;
  const matches =
    Boolean(sessionPreview) && Boolean(echoedPreview) && sessionPreview === echoedPreview;

  return (
    <div className="animate-fade-in-up max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <FiShield className="w-5 h-5 text-[var(--accent)]" />
        <h1 className="text-lg font-semibold text-[var(--foreground)]">
          Demo end-to-end · token echo
        </h1>
      </div>
      <p className="text-sm text-[var(--muted)] mb-5">
        front → <strong>gateway</strong> (valida xsuaa-central) → <strong>apiintegración</strong> (eco)
      </p>

      {loading ? (
        <div className="space-y-3">
          <div className="h-24 rounded-xl bg-[var(--card)] border border-[var(--card-border)] animate-pulse" />
          <div className="h-40 rounded-xl bg-[var(--card)] border border-[var(--card-border)] animate-pulse" />
        </div>
      ) : error ? (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <div className="flex items-center gap-2 text-[var(--foreground)] font-medium">
            <FiXCircle className="w-5 h-5 text-red-500" /> {error}
          </div>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--accent-light)] text-[var(--accent)] hover:opacity-90"
          >
            <FiRefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Estado de la cadena */}
          <div
            className={`flex items-center gap-2 rounded-xl border p-4 text-sm font-medium ${
              matches
                ? "border-green-500/30 bg-green-500/10 text-green-600"
                : "border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)]"
            }`}
          >
            {matches ? (
              <FiCheckCircle className="w-5 h-5" />
            ) : (
              <FiKey className="w-5 h-5" />
            )}
            {matches
              ? "El token en sesión coincide con el que apiintegración decodificó: viajó por toda la cadena."
              : "Respuesta recibida desde apiintegración a través del gateway."}
          </div>

          {/* Usuario */}
          <section className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 card-hover">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Usuario (claims del JWT)</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Field label="Email" value={data.usuario.email} />
              <Field label="Usuario" value={data.usuario.user_name} />
              <Field label="Nombre" value={data.usuario.given_name} />
              <Field label="Apellido" value={data.usuario.family_name} />
            </dl>
          </section>

          {/* Token */}
          <section className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 card-hover">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Token</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Field label="Preview (eco de apiintegración)" value={echoedPreview} mono />
              <Field label="Preview (sesión del front)" value={sessionPreview} mono />
              <Field label="Emisor (iss)" value={data.token.iss} mono />
              <Field
                label="Expira"
                value={data.token.exp ? new Date(data.token.exp * 1000).toLocaleString() : undefined}
              />
            </dl>
          </section>

          {/* Metadatos de la request */}
          <section className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 card-hover">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Request</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Field label="Origen" value={data.origen} />
              <Field label="Instancia" value={data.instancia} />
              <Field label="idtransaccion" value={data.gateway.idtransaccion} mono />
              <Field label="aplicacion" value={data.gateway.aplicacion} />
              <Field label="Recibido en" value={data.recibidoEn} />
            </dl>
          </section>

          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--accent-light)] text-[var(--accent)] hover:opacity-90"
          >
            <FiRefreshCw className="w-4 h-4" /> Volver a probar
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className={`text-[var(--foreground)] break-all ${mono ? "font-mono text-xs" : ""}`}>
        {value ?? "—"}
      </dd>
    </div>
  );
}
