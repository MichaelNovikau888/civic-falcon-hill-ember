import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { t as TIME_ZONE_RE } from "./geo-CnsN-BmS.mjs";
import { i as string, r as object } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk.functions-DAlH__j7.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var timeZoneInput = object({ timeZone: string().trim().regex(TIME_ZONE_RE) });
var loadDesk_createServerFn_handler = createServerRpc({
	id: "6b80e9b6fb1fb9bee03436abf8253a4fa2a3f52450309a8815156d76d4367116",
	name: "loadDesk",
	filename: "src/lib/fx/desk.functions.ts"
}, (opts) => loadDesk.__executeServer(opts));
var loadDesk = createServerFn({ method: "POST" }).handler(loadDesk_createServerFn_handler, async () => {
	const { readDesk } = await import("./desk.server-D3G6wy4r.mjs");
	return readDesk();
});
var refreshRates_createServerFn_handler = createServerRpc({
	id: "4aaed46ac042440b5b30824ed9b54391cc90ff495d400c1b218e91bc4cf12bfa",
	name: "refreshRates",
	filename: "src/lib/fx/desk.functions.ts"
}, (opts) => refreshRates.__executeServer(opts));
var refreshRates = createServerFn({ method: "GET" }).handler(refreshRates_createServerFn_handler, async () => {
	const { loadRates } = await import("./rates.server-CzRcVSi_.mjs");
	return loadRates();
});
var refineRegion_createServerFn_handler = createServerRpc({
	id: "b5dc48d7d1ea012e63b57a8652a219b44e588c01884b34e446ab2de82f1efb21",
	name: "refineRegion",
	filename: "src/lib/fx/desk.functions.ts"
}, (opts) => refineRegion.__executeServer(opts));
var refineRegion = createServerFn({ method: "POST" }).validator((data) => timeZoneInput.parse(data)).handler(refineRegion_createServerFn_handler, async ({ data }) => {
	const { hintFromTimeZone } = await import("./desk.server-D3G6wy4r.mjs");
	return hintFromTimeZone(data.timeZone);
});
//#endregion
export { loadDesk_createServerFn_handler, refineRegion_createServerFn_handler, refreshRates_createServerFn_handler };
