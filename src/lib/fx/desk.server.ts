import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { countryToCurrency, timezoneToCurrency } from "./geo.ts";
import { loadRates } from "./rates.server.ts";
import type { DeskPayload, RegionHint } from "./types.ts";

const NONE: RegionHint = { currency: null, country: null, via: "none" };

function headerValue(name: string): string | null {
  try {
    return getRequest().headers.get(name);
  } catch {
    return null;
  }
}

export function hintFromHeaders(): RegionHint {
  const raw = (
    headerValue("x-vercel-ip-country") ??
    headerValue("cf-ipcountry") ??
    ""
  )
    .trim()
    .toUpperCase();
  if (!/^[A-Z]{2}$/.test(raw) || raw === "XX" || raw === "T1") return NONE;
  const currency = countryToCurrency(raw);
  if (!currency) return NONE;
  return { currency, country: raw, via: "ip" };
}

export function hintFromTimeZone(timeZone: string): RegionHint {
  const currency = timezoneToCurrency(timeZone);
  if (!currency) return NONE;
  return { currency, country: null, via: "timezone" };
}

export async function readDesk(): Promise<DeskPayload> {
  try {
    setResponseHeader("cache-control", "private, no-store");
  } catch {
    // header helper is best-effort; the call is POST so it is not shared-cached
  }
  const rates = await loadRates();
  let hint = NONE;
  try {
    hint = hintFromHeaders();
  } catch {
    hint = NONE;
  }
  return { rates, hint };
}
