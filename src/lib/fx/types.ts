export type RatesOk = {
  ok: true;
  rates: Record<string, number>;
  updatedAt: string;
  source: string;
  sourceUrl: string;
  stale: boolean;
};

export type RatesResult = RatesOk | { ok: false };

export type RegionHint = {
  currency: string | null;
  country: string | null;
  via: "ip" | "timezone" | "none";
};

export type DeskPayload = {
  rates: RatesResult;
  hint: RegionHint;
};

export type Side = "base" | "quote";

export type PairOrigin = "saved" | "geo" | "fallback";
