import type { InternalAxiosRequestConfig } from "axios";
import type { AuthStrategy, Session } from "../AuthStrategy";

const MUTATING = new Set(["post", "put", "patch", "delete"]);

/**
 * BTP-native model for CAP backends bound to the SAME XSUAA: no token exchange — the managed
 * approuter authenticates the user and forwards the JWT (we ride on withCredentials). This is
 * the "ideal" greenfield model (no double token). Optionally fetch a profile in bootstrap().
 */
export const xsuaaStrategy: AuthStrategy = {
  name: "xsuaa",

  async bootstrap(): Promise<Session | null> {
    // No exchange. Wire a real profile fetch here (e.g. GET /me) if you need user info.
    return null;
  },

  decorateRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const method = (config.method || "get").toLowerCase();
    if (MUTATING.has(method)) {
      // OData v4 / CAP expects a CSRF token on mutations. Replace "fetch" with a real
      // x-csrf-token obtained via a GET with header `x-csrf-token: fetch` per backend.
      config.headers.set("x-csrf-token", "fetch");
    }
    return config;
  },

  onUnauthorized(): void {
    if (typeof window !== "undefined") window.location.hash = "#/login";
  },
};
