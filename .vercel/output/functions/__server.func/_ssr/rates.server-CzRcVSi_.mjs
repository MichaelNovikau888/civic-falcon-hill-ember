//#region node_modules/.nitro/vite/services/ssr/assets/rates.server-CzRcVSi_.js
var CODE = /^[a-zA-Z]{3}$/;
function takeRates(raw) {
	if (!raw || typeof raw !== "object") return null;
	const rates = {};
	for (const [key, value] of Object.entries(raw)) {
		if (!CODE.test(key)) continue;
		if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) continue;
		rates[key.toUpperCase()] = value;
	}
	rates.USD = 1;
	if (Object.keys(rates).length < 10) return null;
	return rates;
}
function normalizeErApi(payload, now = Date.now()) {
	if (!payload || typeof payload !== "object") return null;
	const record = payload;
	if (record.result !== "success") return null;
	const rates = takeRates(record.rates);
	if (!rates) return null;
	const unix = record.time_last_update_unix;
	return {
		rates,
		updatedAt: typeof unix === "number" && Number.isFinite(unix) ? (/* @__PURE__ */ new Date(unix * 1e3)).toISOString() : new Date(now).toISOString(),
		source: "ExchangeRate-API",
		sourceUrl: "https://www.exchangerate-api.com"
	};
}
function normalizeFawaz(payload, now = Date.now()) {
	if (!payload || typeof payload !== "object") return null;
	const record = payload;
	const rates = takeRates(record.usd);
	if (!rates) return null;
	const date = typeof record.date === "string" ? record.date : "";
	return {
		rates,
		updatedAt: /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00.000Z` : new Date(now).toISOString(),
		source: "fawazahmed0",
		sourceUrl: "https://github.com/fawazahmed0/exchange-api"
	};
}
var PRIMARY = "https://open.er-api.com/v6/latest/USD";
var FALLBACK = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json";
var TTL_MS = 18e5;
var cache = null;
async function fetchJson(url) {
	const response = await fetch(url, {
		signal: AbortSignal.timeout(8e3),
		headers: {
			accept: "application/json",
			"user-agent": "Meridian/1.0"
		}
	});
	if (!response.ok) throw new Error("rate-source-failed");
	return response.json();
}
async function fetchFresh() {
	try {
		const table = normalizeErApi(await fetchJson(PRIMARY));
		if (table) return table;
	} catch {}
	const table = normalizeFawaz(await fetchJson(FALLBACK));
	if (!table) throw new Error("rate-source-failed");
	return table;
}
async function loadRates() {
	const fresh = cache && Date.now() - cache.at < TTL_MS;
	if (cache && fresh) return {
		ok: true,
		...cache.table,
		stale: false
	};
	try {
		const table = await fetchFresh();
		cache = {
			at: Date.now(),
			table
		};
		return {
			ok: true,
			...table,
			stale: false
		};
	} catch {
		if (cache) return {
			ok: true,
			...cache.table,
			stale: true
		};
		return { ok: false };
	}
}
//#endregion
export { loadRates };
