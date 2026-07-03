import { httpClient } from "@/services/httpClient";
import { MOCK_DEMO } from "@/components/demo/constants";
import type { DemoResponse } from "@/components/demo/types";

const USE_MOCK =
  process.env.NEXT_PUBLIC_AUTH_STRATEGY === "mock" ||
  process.env.NEXT_PUBLIC_USE_MOCK === "true";

/**
 * Servicio de ejemplo end-to-end: llama al gateway, que valida el JWT xsuaa-central
 * y proxea a apiintegracion-compuesto (/rest/demo/whoami), que hace ECO del token.
 * Ruta compuesta (Path B en la estrategia seidor → headers completos + Authorization en dev).
 */
export const demoService = {
  async whoami(): Promise<DemoResponse> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400)); // deja ver el skeleton
      return MOCK_DEMO;
    }
    const res = await httpClient.get<DemoResponse>(
      "dest-apigateway/api/compuesto/apiintegracion/rest/demo/whoami",
    );
    return res.data;
  },
};
