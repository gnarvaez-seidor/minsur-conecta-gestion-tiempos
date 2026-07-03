import type { InternalAxiosRequestConfig } from "axios";
import type { AuthStrategy, Session } from "../AuthStrategy";
import { httpClient } from "@/services/httpClient";
import { parseJwt } from "@/services/authService";

const APLICACION = process.env.NEXT_PUBLIC_APLICACION || "seidor.template.app";

/**
 * Solo en dev local: reenvía el sToken como `Authorization: Bearer` para que el
 * gateway (que valida el JWT de xsuaa-central) acepte las llamadas. En cloud el
 * approuter gestionado inyecta el Authorization, y `process.env.NODE_ENV` es
 * "production" en el export estático → esta rama se elimina del bundle.
 */
const DEV_FORWARD_AUTH =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_FORWARD_AUTH !== "false";

/**
 * idTransaccion + fechatransaccion in the exact UI5 utilHttp format:
 * idTransaccion = ISO string stripped of separators + a random 1..1_000_000;
 * fechatransaccion = the raw ISO string. Both from the SAME Date.
 */
function generarIdTransaccionFecha(): { idTransaccion: string; fechatransaccion: string } {
  const fecha = new Date();
  const fechaIso = fecha.toISOString();
  const fechaString = fechaIso
    .replace(/:/g, "")
    .replace(/-/g, "")
    .replace(".", "")
    .replace("Z", "")
    .replace("T", "");
  const random = Math.floor(Math.random() * 1_000_000 + 1);
  return { idTransaccion: `${fechaString}${random}`, fechatransaccion: fechaIso };
}

/**
 * SEIDOR API Gateway model (ported from medifarma). Exchanges the XSUAA session for an
 * internal sToken via /useridp, then injects the dual Path A/B header set on calls.
 */
export const seidorStrategy: AuthStrategy = {
  name: "seidor",

  async bootstrap(): Promise<Session | null> {
    if (typeof window === "undefined") return null;
    try {
      // Path B endpoint (full headers minus token, since we have no session yet).
      const res = await httpClient.get<Record<string, unknown>>("dest-apiseguridad/useridp");
      const body = res.data as Record<string, unknown>;
      const data = (body?.results || body?.oDataResponse || body) as Record<string, unknown>;
      const sToken = (data?.sToken as string) || "";
      if (!sToken) {
        console.warn("[auth:seidor] /useridp returned no sToken:", data);
        return null;
      }
      const info = (data?.oInfoUsuario as Record<string, unknown>) || {};
      const jwt = parseJwt(sToken) as Record<string, string>;
      return {
        token: sToken,
        usuario: jwt["Usuario"] || jwt["usuario"] || "",
        correo:
          (info.Email as string) ||
          (info.email as string) ||
          jwt["Email"] ||
          jwt["email"] ||
          "",
        nombre: (info.Nombre as string) || jwt["Nombre"] || "",
        apellido: (info.Apellido as string) || jwt["Apellido"] || "",
      };
    } catch (err) {
      console.error("[auth:seidor] /useridp request failed:", err);
      return null;
    }
  },

  decorateRequest(config: InternalAxiosRequestConfig, session: Session | null): InternalAxiosRequestConfig {
    const url = (config.url || "").toLowerCase();
    // Dev local: el gateway valida Authorization: Bearer <jwt xsuaa-central>.
    if (DEV_FORWARD_AUTH && session && !config.headers.has("Authorization")) {
      config.headers.set("Authorization", `Bearer ${session.token}`);
    }
    // Path A — pure OData (ODataModel.read): ONLY the `token` header.
    // (The backend's `aplicacion` guard returns 0 results if `aplicacion` is sent here.)
    const isPureOData = url.includes("/api/base/") || url.includes("/api/integracion/saperp/");
    if (isPureOData) {
      if (session) config.headers.set("token", session.token);
    } else {
      // Path B — composite/custom endpoints + /useridp: the FULL header set.
      const audit = generarIdTransaccionFecha();
      config.headers.set("idtransaccion", audit.idTransaccion);
      config.headers.set("fechatransaccion", audit.fechatransaccion);
      config.headers.set("aplicacion", APLICACION);
      if (session) {
        config.headers.set("token", session.token);
        config.headers.set("usuario", session.usuario);
      }
    }
    return config;
  },

  onUnauthorized(): void {
    if (typeof window !== "undefined") window.location.hash = "#/login";
  },
};
