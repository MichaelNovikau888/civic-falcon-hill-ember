import type { PairOrigin, Side } from "./types.ts";

const CODE = /^[A-Z]{3}$/;

const digitsCache = new Map<string, number>();

export function decimalSep(locale: string): "," | "." {
  return locale.toLowerCase().startsWith("ru") ? "," : ".";
}

export function fractionDigits(currency: string): number {
  const hit = digitsCache.get(currency);
  if (hit != null) return hit;
  let digits = 2;
  try {
    const resolved = new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits;
    if (typeof resolved === "number" && resolved >= 0 && resolved <= 6) {
      digits = resolved;
    }
  } catch {
    digits = 2;
  }
  digitsCache.set(currency, digits);
  return digits;
}

export function crossRate(
  rates: Record<string, number>,
  from: string,
  to: string,
): number | null {
  if (from === to) return 1;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!(fromRate > 0) || !(toRate > 0)) return null;
  return toRate / fromRate;
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/[\s\u00a0\u202f]/g, "");
  if (!cleaned || cleaned === "." || cleaned === ",") return null;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized = cleaned;

  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = cleaned.replace(/,/g, "");
    }
  } else if (lastComma >= 0) {
    if (/^\d{1,3}(,\d{3})+$/.test(cleaned)) normalized = cleaned.replace(/,/g, "");
    else normalized = cleaned.replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  }

  if (/^\d+\.$/.test(normalized)) normalized = normalized.slice(0, -1);
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const value = Number(normalized);
  if (!Number.isFinite(value) || value > 1e12) return null;
  return value;
}

export function formatMoneyInput(amount: number, currency: string, locale: string): string {
  if (!Number.isFinite(amount) || amount < 0) return "";
  const digits = fractionDigits(currency);
  const sep = decimalSep(locale);
  const fixed = amount.toFixed(digits);
  if (Number(fixed) === 0 && amount > 0) {
    let extra = digits + 1;
    while (extra < 8 && Number(amount.toFixed(extra)) === 0) extra += 1;
    return amount.toFixed(extra).replace(".", sep);
  }
  return fixed.replace(".", sep);
}

export function formatRate(amount: number, locale: string): string {
  if (!Number.isFinite(amount) || amount <= 0) return "—";
  const abs = Math.abs(amount);
  const digits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
  let text = amount.toFixed(digits);
  if (digits > 2) {
    text = text.replace(/0+$/, "").replace(/\.$/, "");
    const fraction = text.split(".")[1] ?? "";
    if (!text.includes(".") || fraction.length < 2) text = amount.toFixed(2);
  }
  return text.replace(".", decimalSep(locale));
}

export function formatStamp(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  if (locale.toLowerCase().startsWith("ru")) {
    return `${day}.${month}.${year}, ${hours}:${minutes} UTC`;
  }
  return `${year}-${month}-${day}, ${hours}:${minutes} UTC`;
}

export function fillQuote(input: {
  active: Side;
  text: string;
  base: string;
  quote: string;
  rates: Record<string, number> | null;
  locale: string;
}): { baseText: string; quoteText: string; rate: number | null } {
  const rate = input.rates ? crossRate(input.rates, input.base, input.quote) : null;
  const amount = parseAmount(input.text);
  if (input.active === "base") {
    const quoteText =
      amount == null || rate == null
        ? ""
        : formatMoneyInput(amount * rate, input.quote, input.locale);
    return { baseText: input.text, quoteText, rate };
  }
  const baseText =
    amount == null || rate == null
      ? ""
      : formatMoneyInput(amount / rate, input.base, input.locale);
  return { baseText, quoteText: input.text, rate };
}

export function reformatPair(input: {
  active: Side;
  text: string;
  base: string;
  quote: string;
  rates: Record<string, number> | null;
  locale: string;
}): { baseText: string; quoteText: string; rate: number | null } {
  const amount = parseAmount(input.text);
  if (amount == null) return fillQuote(input);
  const currency = input.active === "base" ? input.base : input.quote;
  return fillQuote({
    ...input,
    text: formatMoneyInput(amount, currency, input.locale),
  });
}

export function resolveInitialPair(input: {
  saved: { base: string; quote: string } | null;
  detected: string | null;
  available: ReadonlySet<string> | null;
}): { base: string; quote: string; origin: PairOrigin } {
  const ok = (code: string) =>
    CODE.test(code) && (input.available == null || input.available.has(code));

  if (input.saved && ok(input.saved.base) && ok(input.saved.quote)) {
    return { base: input.saved.base, quote: input.saved.quote, origin: "saved" };
  }

  const usd = ok("USD") ? "USD" : null;
  const eur = ok("EUR") ? "EUR" : null;
  const gbp = ok("GBP") ? "GBP" : null;
  const detected = input.detected && ok(input.detected) ? input.detected : null;

  if (detected) {
    const quote =
      detected === "USD" ? (eur ?? gbp ?? detected) : (usd ?? eur ?? detected);
    return { base: detected, quote, origin: "geo" };
  }

  return {
    base: usd ?? "USD",
    quote: eur ?? gbp ?? "EUR",
    origin: "fallback",
  };
}

export function swapPair<T extends { base: string; quote: string; baseText: string; quoteText: string; active: Side }>(
  model: T,
): T {
  return {
    ...model,
    base: model.quote,
    quote: model.base,
    baseText: model.quoteText,
    quoteText: model.baseText,
    active: model.active === "base" ? "quote" : "base",
  };
}
