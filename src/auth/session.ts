import type { Session } from "./AuthStrategy";

/**
 * In-memory session store. The sToken lives in memory (module scope) rather than localStorage
 * to reduce XSS exposure; the XSUAA session cookie (carried by the approuter) is the durable
 * part. Cleared on logout / 401.
 */
let current: Session | null = null;

export const sessionStore = {
  get: (): Session | null => current,
  set: (s: Session | null): void => {
    current = s;
  },
  clear: (): void => {
    current = null;
  },
};
