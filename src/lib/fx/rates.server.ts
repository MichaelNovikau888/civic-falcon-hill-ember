import { normalizeErApi, normalizeFawaz, type NormalizedRates } from "./normalize.ts";
import type { RatesResult } from "./types.ts";

const PRIMARY = "https://open.er-api.com/v6/latest/USD";
const FALLBACK =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json";
const TTL_MS = 30 * 60 * 1000;

type CacheEntry = { at: number; table: NormalizedRates };

let cache: CacheEntry | null = null;

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: {
      accept: "application/json",
      "user-agent": "Meridian/1.0",
    },
  });
  if (!response.ok) throw new Error("rate-source-failed");
  return response.json() as Promise<unknown>;
}

async function fetchFresh(): Promise<NormalizedRates> {
  try {
    const payload = await fetchJson(PRIMARY);
    const table = normalizeErApi(payload);
    if (table) return table;
  } catch {
    // try the fallback source below
  }
  const payload = await fetchJson(FALLBACK);
  const table = normalizeFawaz(payload);
  if (!table) throw new Error("rate-source-failed");
  return table;
}

export async function loadRates(): Promise<RatesResult> {
  const fresh = cache && Date.now() - cache.at < TTL_MS;
  if (cache && fresh) {
    return { ok: true, ...cache.table, stale: false };
  }
  try {
    const table = await fetchFresh();
    cache = { at: Date.now(), table };
    return { ok: true, ...table, stale: false };
  } catch {
    if (cache) return { ok: true, ...cache.table, stale: true };
    return { ok: false };
  }
}
