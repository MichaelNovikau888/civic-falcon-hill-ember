import { a as setResponseHeader, i as getRequest } from "./ssr.mjs";
import { n as countryToCurrency, r as timezoneToCurrency } from "./geo-CnsN-BmS.mjs";
import { loadRates } from "./rates.server-CzRcVSi_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk.server-D3G6wy4r.js
var NONE = {
	currency: null,
	country: null,
	via: "none"
};
function headerValue(name) {
	try {
		return getRequest().headers.get(name);
	} catch {
		return null;
	}
}
function hintFromHeaders() {
	const raw = (headerValue("x-vercel-ip-country") ?? headerValue("cf-ipcountry") ?? "").trim().toUpperCase();
	if (!/^[A-Z]{2}$/.test(raw) || raw === "XX" || raw === "T1") return NONE;
	const currency = countryToCurrency(raw);
	if (!currency) return NONE;
	return {
		currency,
		country: raw,
		via: "ip"
	};
}
function hintFromTimeZone(timeZone) {
	const currency = timezoneToCurrency(timeZone);
	if (!currency) return NONE;
	return {
		currency,
		country: null,
		via: "timezone"
	};
}
async function readDesk() {
	try {
		setResponseHeader("cache-control", "private, no-store");
	} catch {}
	const rates = await loadRates();
	let hint = NONE;
	try {
		hint = hintFromHeaders();
	} catch {
		hint = NONE;
	}
	return {
		rates,
		hint
	};
}
//#endregion
export { hintFromTimeZone, readDesk };
