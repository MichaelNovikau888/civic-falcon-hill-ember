import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { TIME_ZONE_RE } from "./geo.ts";
import type { DeskPayload, RatesResult, RegionHint } from "./types.ts";

const timeZoneInput = z.object({
  timeZone: z.string().trim().regex(TIME_ZONE_RE),
});

export const loadDesk = createServerFn({ method: "POST" }).handler(
  async (): Promise<DeskPayload> => {
    const { readDesk } = await import("./desk.server.ts");
    return readDesk();
  },
);

export const refreshRates = createServerFn({ method: "GET" }).handler(
  async (): Promise<RatesResult> => {
    const { loadRates } = await import("./rates.server.ts");
    return loadRates();
  },
);

export const refineRegion = createServerFn({ method: "POST" })
  .validator((data: unknown) => timeZoneInput.parse(data))
  .handler(async ({ data }): Promise<RegionHint> => {
    const { hintFromTimeZone } = await import("./desk.server.ts");
    return hintFromTimeZone(data.timeZone);
  });
