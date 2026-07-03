import type { InternalAxiosRequestConfig } from "axios";

/** The authenticated session shape (matches the ported medifarma AuthToken). */
export interface Session {
  token: string;
  usuario: string;
  correo: string;
  nombre: string;
  apellido: string;
}

/**
 * Swappable auth model. The rest of the app depends on THIS, not on sToken/XSUAA specifics.
 * Pick the active one via NEXT_PUBLIC_AUTH_STRATEGY (see src/auth/index.ts).
 */
export interface AuthStrategy {
  readonly name: string;
  /** Establish a session (no-op for strategies that don't exchange tokens). */
  bootstrap(): Promise<Session | null>;
  /** Inject whatever headers the backend needs. Receives the current session (may be null). */
  decorateRequest(
    config: InternalAxiosRequestConfig,
    session: Session | null,
  ): InternalAxiosRequestConfig;
  /** Called on a 401 (non-/useridp). */
  onUnauthorized(): void;
}
