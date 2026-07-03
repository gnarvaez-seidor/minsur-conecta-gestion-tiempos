import { httpClient } from "@/services/httpClient";
import type { RecordItem } from "@/components/records/types";
import { MOCK_RECORDS } from "@/components/records/constants";

const USE_MOCK =
  process.env.NEXT_PUBLIC_AUTH_STRATEGY === "mock" ||
  process.env.NEXT_PUBLIC_USE_MOCK === "true";

/** Unwrap any gateway response shape: array | { oDataResponse } | { d.results } | { results }. */
function unwrap(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const d = data as Record<string, unknown> | null;
  if (Array.isArray(d?.oDataResponse)) return d!.oDataResponse as unknown[];
  return (d?.results as unknown[]) ?? ((d?.d as Record<string, unknown>)?.results as unknown[]) ?? [];
}

export const recordsService = {
  async list(): Promise<RecordItem[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 450)); // simulate latency so the skeleton shows
      return MOCK_RECORDS;
    }
    // Pure OData (Path A) — only the `token` header is injected by the seidor strategy.
    const res = await httpClient.get<unknown>(
      "dest-apigateway/api/base/template/v2/browse/RECORDS",
    );
    return unwrap(res.data) as RecordItem[];
  },
};
