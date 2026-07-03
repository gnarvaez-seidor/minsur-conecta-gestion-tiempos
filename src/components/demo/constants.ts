import type { DemoResponse } from "./types";

/** Respuesta simulada cuando la estrategia es `mock` (sin backend). */
export const MOCK_DEMO: DemoResponse = {
  origen: "apiintegracion-compuesto",
  mensaje: "Token recibido y decodificado end-to-end (mock)",
  recibidoEn: new Date().toISOString(),
  instancia: "mock",
  gateway: { idtransaccion: "20260101000000123456", aplicacion: "seidor.template.app" },
  usuario: {
    email: "demo.user@seidor.com",
    given_name: "Demo",
    family_name: "User",
    user_name: "demo.user@seidor.com",
  },
  token: {
    preview: "eyJhbGciOi…Qssw5c",
    exp: 1893456000,
    iss: "https://mazda-dev.authentication.us10.hana.ondemand.com/oauth/token",
    azp: "sb-dealerportal-mazda!t372503",
  },
};
