/** Decode the payload of a JWT (no verification — just claim extraction). */
export function parseJwt(jwt: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(jwt.split(".")[1] ?? ""));
  } catch {
    return {};
  }
}
