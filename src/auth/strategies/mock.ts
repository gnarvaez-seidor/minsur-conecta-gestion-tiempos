import type { InternalAxiosRequestConfig } from "axios";
import type { AuthStrategy, Session } from "../AuthStrategy";

/** Offline dev model: seeds a fake session, injects nothing, never bounces to login. */
export const mockStrategy: AuthStrategy = {
  name: "mock",

  async bootstrap(): Promise<Session | null> {
    return {
      token: "mock-token",
      usuario: "dev-local",
      correo: "dev@local.test",
      nombre: "Dev",
      apellido: "Local",
    };
  },

  decorateRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    return config;
  },

  onUnauthorized(): void {
    // no-op offline
  },
};
