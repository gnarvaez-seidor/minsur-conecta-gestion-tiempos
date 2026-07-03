import type { AuthStrategy } from "./AuthStrategy";
import { sessionStore } from "./session";
import { seidorStrategy } from "./strategies/seidor";
import { xsuaaStrategy } from "./strategies/xsuaa";
import { mockStrategy } from "./strategies/mock";
import { setRequestDecorator, setUnauthorizedHandler } from "@/services/httpClient";

export type { AuthStrategy, Session } from "./AuthStrategy";
export { sessionStore } from "./session";

function resolveStrategy(): AuthStrategy {
  switch (process.env.NEXT_PUBLIC_AUTH_STRATEGY) {
    case "mock":
      return mockStrategy;
    case "xsuaa":
      return xsuaaStrategy;
    case "seidor":
      return seidorStrategy;
    default:
      return seidorStrategy; // production-safe default (see .env.production)
  }
}

export const activeStrategy: AuthStrategy = resolveStrategy();

/** Wire the active strategy into the (auth-agnostic) httpClient. Call once at app start. */
export function installAuthStrategy(): void {
  setRequestDecorator((config) => activeStrategy.decorateRequest(config, sessionStore.get()));
  setUnauthorizedHandler(() => activeStrategy.onUnauthorized());
}
