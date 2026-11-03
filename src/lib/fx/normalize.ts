const CODE = /^[a-zA-Z]{3}$/;

export type NormalizedRates = {
  rates: Record<string, number>;
  updatedAt: string;
  source: string;
  sourceUrl: string;
};

function takeRates(raw: unknown): Record<string, number> | null {
  if (!raw || typeof raw !== "object") return null;
  const rates: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!CODE.test(key)) continue;
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) continue;
    rates[key.toUpperCase()] = value;
  }
  rates.USD = 1;
  if (Object.keys(rates).length < 10) return null;
  return rates;
}

export function normalizeErApi(payload: unknown, now = Date.now()): NormalizedRates | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  if (record.result !== "success") return null;
  const rates = takeRates(record.rates);
  if (!rates) return null;
  const unix = record.time_last_update_unix;
  const updatedAt =
    typeof unix === "number" && Number.isFinite(unix)
      ? new Date(unix * 1000).toISOString()
      : new Date(now).toISOString();
  return {
    rates,
    updatedAt,
    source: "ExchangeRate-API",
    sourceUrl: "https://www.exchangerate-api.com",
  };
}

export function normalizeFawaz(payload: unknown, now = Date.now()): NormalizedRates | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const rates = takeRates(record.usd);
  if (!rates) return null;
  const date = typeof record.date === "string" ? record.date : "";
  const updatedAt = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? `${date}T00:00:00.000Z`
    : new Date(now).toISOString();
  return {
    rates,
    updatedAt,
    source: "fawazahmed0",
    sourceUrl: "https://github.com/fawazahmed0/exchange-api",
  };
}
