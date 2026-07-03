import { httpClient } from "@/services/httpClient";
import { MOCK_MASTER } from "@/components/roster/constants";
import type { RosterMaster } from "@/components/roster/types";

const USE_MOCK =
  process.env.NEXT_PUBLIC_AUTH_STRATEGY === "mock" ||
  process.env.NEXT_PUBLIC_USE_MOCK === "true";

/**
 * Adapter: mock (offline) vs real. The real path goes through the gateway to the simulated
 * master-data endpoint in apiintegración (front → gateway → apiintegración/rest/roster/master),
 * exercising the full chain even though the backend serves fixtures (no CPI/SAP yet).
 */
export const rosterService = {
  async master(): Promise<RosterMaster> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 420)); // let the skeleton show
      return MOCK_MASTER;
    }
    const res = await httpClient.get<Partial<RosterMaster>>(
      "dest-apigateway/api/compuesto/apiintegracion/rest/roster/master",
    );
    const d = res.data || {};
    return {
      team: d.team ?? MOCK_MASTER.team,
      roles: d.roles ?? MOCK_MASTER.roles,
      codes: d.codes ?? MOCK_MASTER.codes,
      legend: d.legend ?? MOCK_MASTER.legend,
      holidays: d.holidays ?? MOCK_MASTER.holidays,
      overrides: d.overrides ?? MOCK_MASTER.overrides,
    };
  },
};
