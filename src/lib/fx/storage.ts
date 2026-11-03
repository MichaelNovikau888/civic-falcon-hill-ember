import type { RatesOk } from "./types.ts";

const PAIR = "meridian.pair.v1";
const RATES = "meridian.rates.v1";
const LANG = "meridian.lang.v1";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode or a full disk — the converter still works for this visit
  }
}

export function readLang(): "ru" | "en" | null {
  const value = read(LANG);
  return value === "ru" || value === "en" ? value : null;
}

export function writeLang(lang: "ru" | "en") {
  write(LANG, lang);
}

export function readPair(): { base: string; quote: string } | null {
  const raw = read(PAIR);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { base?: unknown; quote?: unknown };
    if (typeof parsed.base !== "string" || typeof parsed.quote !== "string") return null;
    if (!/^[A-Z]{3}$/.test(parsed.base) || !/^[A-Z]{3}$/.test(parsed.quote)) return null;
    return { base: parsed.base, quote: parsed.quote };
  } catch {
    return null;
  }
}

export function writePair(pair: { base: string; quote: string }) {
  write(PAIR, JSON.stringify({ base: pair.base, quote: pair.quote }));
}

export function readRates(): RatesOk | null {
  const raw = read(RATES);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<RatesOk> & { rates?: unknown };
    if (typeof parsed.updatedAt !== "string") return null;
    if (typeof parsed.source !== "string" || typeof parsed.sourceUrl !== "string") return null;
    if (!parsed.sourceUrl.startsWith("https://")) return null;
    if (!parsed.rates || typeof parsed.rates !== "object") return null;
    const rates: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed.rates)) {
      if (!/^[A-Z]{3}$/.test(key)) continue;
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) continue;
      rates[key] = value;
    }
    if (!(rates.USD > 0) || Object.keys(rates).length < 10) return null;
    return {
      ok: true,
      rates,
      updatedAt: parsed.updatedAt,
      source: parsed.source,
      sourceUrl: parsed.sourceUrl,
      stale: true,
    };
  } catch {
    return null;
  }
}

export function writeRates(rates: RatesOk) {
  write(
    RATES,
    JSON.stringify({
      ok: true,
      rates: rates.rates,
      updatedAt: rates.updatedAt,
      source: rates.source,
      sourceUrl: rates.sourceUrl,
      stale: false,
    }),
  );
}
