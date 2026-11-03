import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, c as Slot, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as TIME_ZONE_RE } from "./geo-CnsN-BmS.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { a as RefreshCw, i as Search, n as TriangleAlert, o as Check, r as ShieldCheck, s as ArrowLeftRight, t as X } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DBsVebi0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-BSs1SrFW.css";
var APP_NAME = "Meridian";
var Route$1 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Конвертер валют: две валюты, сумма и мгновенный пересчёт в обе стороны. Сумма остаётся в браузере."
			},
			{
				name: "theme-color",
				content: "#1F6B4A"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ru",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:pointer-events-none disabled:opacity-40", {
	variants: {
		variant: {
			solid: "bg-ink text-paper hover:bg-ink/90",
			ghost: "bg-transparent text-ink hover:bg-ink/5",
			chip: "border border-line bg-sheet text-ink hover:border-ink",
			quiet: "bg-transparent text-muted hover:text-ink"
		},
		size: {
			md: "h-11 px-4 text-sm",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "solid",
		size: "md"
	}
});
function Button({ className, variant, size, asChild = false, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		type: asChild ? void 0 : type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var POPULAR = [
	"USD",
	"EUR",
	"RUB",
	"GBP",
	"CNY",
	"JPY",
	"CHF",
	"KZT",
	"TRY",
	"UAH",
	"BYN",
	"PLN",
	"AED",
	"INR",
	"CAD"
];
var PAIRS = [
	["USD", "EUR"],
	["USD", "RUB"],
	["EUR", "RUB"],
	["GBP", "USD"],
	["USD", "KZT"],
	["EUR", "GBP"],
	["USD", "CNY"],
	["USD", "TRY"],
	["USD", "UAH"]
];
var QUICK_AMOUNTS = [
	10,
	100,
	1e3,
	1e4
];
var copy = {
	ru: {
		kicker: "Обмен валют",
		lede: "Две валюты, сумма и курс сразу — в обе стороны.",
		pay: "Отдаёте",
		receive: "Получаете",
		swap: "Поменять валюты местами",
		search: "Код или название",
		searchLabel: "Поиск валюты",
		pick: "Выбор валюты",
		popularSection: "Частые",
		all: "Все валюты",
		empty: "Такой валюты нет",
		close: "Закрыть",
		quick: "Быстрые суммы",
		pairs: "Частые пары",
		refresh: "Обновить курсы",
		refreshing: "Обновляем",
		retry: "Повторить",
		error: "Курсы сейчас не загрузились.",
		stale: "Сеть недоступна — показаны сохранённые курсы.",
		missing: "Для этой пары нет курса.",
		invalid: "Нужно число.",
		checking: "Определяем валюту по региону…",
		geo: "Валюта региона",
		fallback: "Регион не определился — оставили доллар.",
		saved: "Пара с прошлого визита.",
		privacy: "Сумма не уходит с устройства",
		privacyBody: "Пересчёт идёт в браузере: сумма никуда не отправляется. Сервер забирает только общую таблицу курсов. Страну, если её уже указал хостинг, читаем из заголовка — сам IP не смотрим и в геосервисы не передаём. Если страны нет, один раз уходит часовой пояс, и только как ключ к валюте.",
		source: "Источник",
		updated: "Курсы",
		loading: "Загружаем курсы",
		choose: "Выбрать валюту",
		langLabel: "Язык"
	},
	en: {
		kicker: "Foreign exchange",
		lede: "Two currencies, an amount, and a live rate — either way.",
		pay: "You pay",
		receive: "You get",
		swap: "Swap currencies",
		search: "Code or name",
		searchLabel: "Search currencies",
		pick: "Choose a currency",
		popularSection: "Common",
		all: "All currencies",
		empty: "No currency matches",
		close: "Close",
		quick: "Quick amounts",
		pairs: "Common pairs",
		refresh: "Refresh rates",
		refreshing: "Refreshing",
		retry: "Try again",
		error: "Rates didn't load.",
		stale: "Offline — showing saved rates.",
		missing: "No rate for this pair.",
		invalid: "Enter a number.",
		checking: "Detecting a currency for your region…",
		geo: "Regional currency",
		fallback: "Region unavailable — US dollar is the default.",
		saved: "Pair from your last visit.",
		privacy: "The amount never leaves this device",
		privacyBody: "Conversion runs in the browser, so the amount is never sent. The server only fetches a shared rate table. If the host already knows a country, we read that header — not your IP, and not via a geolocation vendor. When the country is missing, your time zone is sent once, and only as a key to a currency.",
		source: "Source",
		updated: "Rates",
		loading: "Loading rates",
		choose: "Choose currency",
		langLabel: "Language"
	}
};
function messages(lang) {
	return copy[lang];
}
function localeOf(lang) {
	return lang === "ru" ? "ru" : "en";
}
function formatCount(amount, lang) {
	const separator = lang === "ru" ? "\xA0" : ",";
	return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
function currencyLabel(code, lang) {
	try {
		const name = new Intl.DisplayNames([localeOf(lang)], { type: "currency" }).of(code);
		if (!name) return code;
		return name.charAt(0).toLocaleUpperCase(localeOf(lang)) + name.slice(1);
	} catch {
		return code;
	}
}
function regionLabel(country, lang) {
	try {
		return new Intl.DisplayNames([localeOf(lang)], { type: "region" }).of(country) ?? country;
	} catch {
		return country;
	}
}
function CurrencyDialog({ open, lang, codes, selected, onOpenChange, onSelect }) {
	const copy = messages(lang);
	const searchId = (0, import_react.useId)();
	const inputRef = (0, import_react.useRef)(null);
	const listRef = (0, import_react.useRef)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	const [cursor, setCursor] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setQuery("");
		setCursor(0);
	}, [open]);
	const filtered = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		const named = codes.map((code) => ({
			code,
			name: currencyLabel(code, lang)
		}));
		if (!needle) return named;
		return named.filter((item) => item.code.toLowerCase().includes(needle) || item.name.toLowerCase().includes(needle));
	}, [
		codes,
		lang,
		query
	]);
	const popular = (0, import_react.useMemo)(() => {
		if (query.trim()) return [];
		const have = new Set(codes);
		return POPULAR.filter((code) => have.has(code));
	}, [codes, query]);
	const flat = query.trim() ? filtered : [...popular.map((code) => ({
		code,
		name: currencyLabel(code, lang)
	})), ...filtered.filter((item) => !popular.includes(item.code))];
	(0, import_react.useEffect)(() => {
		setCursor(0);
	}, [query]);
	(0, import_react.useEffect)(() => {
		(listRef.current?.querySelector(`[data-index="${cursor}"]`))?.scrollIntoView({ block: "nearest" });
	}, [cursor, open]);
	function choose(code) {
		onSelect(code);
		onOpenChange(false);
	}
	function onKeyDown(event) {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setCursor((value) => Math.min(flat.length - 1, value + 1));
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setCursor((value) => Math.max(0, value - 1));
		} else if (event.key === "Enter") {
			event.preventDefault();
			const item = flat[cursor];
			if (item) choose(item.code);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-40 bg-ink/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "fixed inset-0 z-50 flex items-center justify-center p-4 outline-none",
			onOpenAutoFocus: (event) => {
				event.preventDefault();
				inputRef.current?.focus();
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-96 max-h-full w-full max-w-md min-h-0 flex-col overflow-hidden rounded-sheet bg-sheet text-ink",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3 border-b border-line px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "font-display text-2xl leading-none",
								children: copy.pick
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "sr-only",
								children: copy.searchLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
								className: "inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine",
								"aria-label": copy.close,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-b border-line px-4 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex h-11 items-center gap-2 rounded-full border border-line px-3 focus-within:border-ink",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									className: "size-4 text-muted",
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									id: searchId,
									children: copy.searchLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: inputRef,
									value: query,
									onChange: (event) => setQuery(event.target.value),
									onKeyDown,
									placeholder: copy.search,
									"aria-labelledby": searchId,
									className: "w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted",
									autoComplete: "off",
									spellCheck: false
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: listRef,
						className: "min-h-0 flex-1 overflow-y-auto py-1",
						role: "listbox",
						children: flat.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-4 py-8 text-center text-sm text-muted",
							children: copy.empty
						}) : flat.map((item, index) => {
							const showHeading = !query.trim() && (index === 0 || index === popular.length && popular.length > 0 && popular.length < flat.length);
							const heading = index === 0 && popular.length > 0 && !query.trim() ? copy.popularSection : index === popular.length ? copy.all : null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [showHeading && heading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-4 pt-3 pb-1 text-xs tracking-widest text-muted uppercase",
								children: heading
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "option",
								"data-index": index,
								"aria-selected": item.code === selected,
								className: cn("flex h-12 w-full items-center gap-3 px-4 text-left", cursor === index ? "bg-ink/5" : "bg-transparent"),
								onMouseEnter: () => setCursor(index),
								onClick: () => choose(item.code),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-12 shrink-0 font-semibold tabular-nums",
										children: item.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-sm text-muted",
										children: item.name
									}),
									item.code === selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "ml-auto size-4 shrink-0 text-pine",
										"aria-hidden": "true"
									}) : null
								]
							})] }, `${item.code}-${index}`);
						})
					})
				]
			})
		})] })
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var timeZoneInput = object({ timeZone: string().trim().regex(TIME_ZONE_RE) });
var loadDesk = createServerFn({ method: "POST" }).handler(createSsrRpc("6b80e9b6fb1fb9bee03436abf8253a4fa2a3f52450309a8815156d76d4367116"));
var refreshRates = createServerFn({ method: "GET" }).handler(createSsrRpc("4aaed46ac042440b5b30824ed9b54391cc90ff495d400c1b218e91bc4cf12bfa"));
var refineRegion = createServerFn({ method: "POST" }).validator((data) => timeZoneInput.parse(data)).handler(createSsrRpc("b5dc48d7d1ea012e63b57a8652a219b44e588c01884b34e446ab2de82f1efb21"));
var CODE = /^[A-Z]{3}$/;
var digitsCache = /* @__PURE__ */ new Map();
function decimalSep(locale) {
	return locale.toLowerCase().startsWith("ru") ? "," : ".";
}
function fractionDigits(currency) {
	const hit = digitsCache.get(currency);
	if (hit != null) return hit;
	let digits = 2;
	try {
		const resolved = new Intl.NumberFormat("en", {
			style: "currency",
			currency
		}).resolvedOptions().maximumFractionDigits;
		if (typeof resolved === "number" && resolved >= 0 && resolved <= 6) digits = resolved;
	} catch {
		digits = 2;
	}
	digitsCache.set(currency, digits);
	return digits;
}
function crossRate(rates, from, to) {
	if (from === to) return 1;
	const fromRate = rates[from];
	const toRate = rates[to];
	if (!(fromRate > 0) || !(toRate > 0)) return null;
	return toRate / fromRate;
}
function parseAmount(raw) {
	const cleaned = raw.trim().replace(/[\s\u00a0\u202f]/g, "");
	if (!cleaned || cleaned === "." || cleaned === ",") return null;
	const lastComma = cleaned.lastIndexOf(",");
	const lastDot = cleaned.lastIndexOf(".");
	let normalized = cleaned;
	if (lastComma >= 0 && lastDot >= 0) {
		if (lastComma > lastDot) normalized = cleaned.replace(/\./g, "").replace(",", ".");
		else normalized = cleaned.replace(/,/g, "");
	} else if (lastComma >= 0) {
		if (/^\d{1,3}(,\d{3})+$/.test(cleaned)) normalized = cleaned.replace(/,/g, "");
		else normalized = cleaned.replace(",", ".");
	} else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) normalized = cleaned.replace(/\./g, "");
	if (/^\d+\.$/.test(normalized)) normalized = normalized.slice(0, -1);
	if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
	const value = Number(normalized);
	if (!Number.isFinite(value) || value > 0xe8d4a51000) return null;
	return value;
}
function formatMoneyInput(amount, currency, locale) {
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
function formatRate(amount, locale) {
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
function formatStamp(iso, locale) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	const day = String(date.getUTCDate()).padStart(2, "0");
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const year = date.getUTCFullYear();
	const hours = String(date.getUTCHours()).padStart(2, "0");
	const minutes = String(date.getUTCMinutes()).padStart(2, "0");
	if (locale.toLowerCase().startsWith("ru")) return `${day}.${month}.${year}, ${hours}:${minutes} UTC`;
	return `${year}-${month}-${day}, ${hours}:${minutes} UTC`;
}
function fillQuote(input) {
	const rate = input.rates ? crossRate(input.rates, input.base, input.quote) : null;
	const amount = parseAmount(input.text);
	if (input.active === "base") {
		const quoteText = amount == null || rate == null ? "" : formatMoneyInput(amount * rate, input.quote, input.locale);
		return {
			baseText: input.text,
			quoteText,
			rate
		};
	}
	return {
		baseText: amount == null || rate == null ? "" : formatMoneyInput(amount / rate, input.base, input.locale),
		quoteText: input.text,
		rate
	};
}
function reformatPair(input) {
	const amount = parseAmount(input.text);
	if (amount == null) return fillQuote(input);
	const currency = input.active === "base" ? input.base : input.quote;
	return fillQuote({
		...input,
		text: formatMoneyInput(amount, currency, input.locale)
	});
}
function resolveInitialPair(input) {
	const ok = (code) => CODE.test(code) && (input.available == null || input.available.has(code));
	if (input.saved && ok(input.saved.base) && ok(input.saved.quote)) return {
		base: input.saved.base,
		quote: input.saved.quote,
		origin: "saved"
	};
	const usd = ok("USD") ? "USD" : null;
	const eur = ok("EUR") ? "EUR" : null;
	const gbp = ok("GBP") ? "GBP" : null;
	const detected = input.detected && ok(input.detected) ? input.detected : null;
	if (detected) return {
		base: detected,
		quote: detected === "USD" ? eur ?? gbp ?? detected : usd ?? eur ?? detected,
		origin: "geo"
	};
	return {
		base: usd ?? "USD",
		quote: eur ?? gbp ?? "EUR",
		origin: "fallback"
	};
}
function swapPair(model) {
	return {
		...model,
		base: model.quote,
		quote: model.base,
		baseText: model.quoteText,
		quoteText: model.baseText,
		active: model.active === "base" ? "quote" : "base"
	};
}
var PAIR = "meridian.pair.v1";
var RATES = "meridian.rates.v1";
var LANG = "meridian.lang.v1";
function read(key) {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}
function write(key, value) {
	try {
		localStorage.setItem(key, value);
	} catch {}
}
function readLang() {
	const value = read(LANG);
	return value === "ru" || value === "en" ? value : null;
}
function writeLang(lang) {
	write(LANG, lang);
}
function readPair() {
	const raw = read(PAIR);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed.base !== "string" || typeof parsed.quote !== "string") return null;
		if (!/^[A-Z]{3}$/.test(parsed.base) || !/^[A-Z]{3}$/.test(parsed.quote)) return null;
		return {
			base: parsed.base,
			quote: parsed.quote
		};
	} catch {
		return null;
	}
}
function writePair(pair) {
	write(PAIR, JSON.stringify({
		base: pair.base,
		quote: pair.quote
	}));
}
function readRates() {
	const raw = read(RATES);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed.updatedAt !== "string") return null;
		if (typeof parsed.source !== "string" || typeof parsed.sourceUrl !== "string") return null;
		if (!parsed.sourceUrl.startsWith("https://")) return null;
		if (!parsed.rates || typeof parsed.rates !== "object") return null;
		const rates = {};
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
			stale: true
		};
	} catch {
		return null;
	}
}
function writeRates(rates) {
	write(RATES, JSON.stringify({
		ok: true,
		rates: rates.rates,
		updatedAt: rates.updatedAt,
		source: rates.source,
		sourceUrl: rates.sourceUrl,
		stale: false
	}));
}
function project(pair, active, text, rates, locale) {
	return fillQuote({
		active,
		text,
		base: pair.base,
		quote: pair.quote,
		rates: rates.ok ? rates.rates : null,
		locale
	});
}
function initialModel(rates, hint) {
	const available = rates.ok ? new Set(Object.keys(rates.rates)) : null;
	const pair = resolveInitialPair({
		saved: null,
		detected: hint.currency,
		available
	});
	const filled = project(pair, "base", "1", rates, "ru");
	return {
		...pair,
		...filled,
		active: "base",
		phase: hint.currency ? "done" : "checking"
	};
}
function amountClass(text) {
	if (text.length > 12) return "text-2xl";
	if (text.length > 8) return "text-3xl";
	return "text-4xl sm:text-5xl";
}
function DeskPending() {
	const copy = messages("ru");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 bg-pine" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-xl px-4 py-8 sm:py-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-muted uppercase",
					children: copy.kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-5xl leading-none",
					children: "Meridian"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-sm text-pretty text-muted",
					children: copy.loading
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-8 h-72 animate-pulse rounded-sheet border border-line bg-sheet motion-reduce:animate-none" })
			]
		})]
	});
}
function Converter({ data }) {
	const baseId = (0, import_react.useId)();
	const quoteId = (0, import_react.useId)();
	const touched = (0, import_react.useRef)(false);
	const [lang, setLang] = (0, import_react.useState)("ru");
	const [rates, setRates] = (0, import_react.useState)(data.rates);
	const [hint, setHint] = (0, import_react.useState)(data.hint);
	const [memory, setMemory] = (0, import_react.useState)("fresh");
	const [named, setNamed] = (0, import_react.useState)(false);
	const [booted, setBooted] = (0, import_react.useState)(false);
	const [flipped, setFlipped] = (0, import_react.useState)(false);
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const [picker, setPicker] = (0, import_react.useState)(null);
	const [model, setModel] = (0, import_react.useState)(() => initialModel(data.rates, data.hint));
	const copy = messages(lang);
	const locale = localeOf(lang);
	const codes = rates.ok ? Object.keys(rates.rates).sort() : [];
	(0, import_react.useEffect)(() => {
		document.documentElement.lang = lang;
	}, [lang]);
	(0, import_react.useEffect)(() => {
		if (!booted) return;
		if (memory === "fresh" && model.phase === "checking") return;
		writePair({
			base: model.base,
			quote: model.quote
		});
	}, [
		booted,
		memory,
		model.base,
		model.quote,
		model.phase
	]);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		const savedLang = readLang();
		const nextLocale = localeOf(savedLang ?? "ru");
		if (savedLang) setLang(savedLang);
		const cached = data.rates.ok ? null : readRates();
		const table = data.rates.ok ? data.rates : cached ?? { ok: false };
		if (data.rates.ok) writeRates(data.rates);
		if (cached) setRates(cached);
		const available = table.ok ? new Set(Object.keys(table.rates)) : null;
		const saved = readPair();
		const savedOk = !!saved && (!available || available.has(saved.base) && available.has(saved.quote));
		function paint(pair, origin) {
			const filled = project(pair, "base", "1", table, nextLocale);
			setModel({
				base: pair.base,
				quote: pair.quote,
				...filled,
				active: "base",
				origin,
				phase: "done"
			});
		}
		if (!touched.current && savedOk && saved) {
			paint(saved, "saved");
			setMemory("saved");
			setNamed(true);
			setBooted(true);
			return () => {
				cancel = true;
			};
		}
		if (!data.hint.currency) {
			const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			if (TIME_ZONE_RE.test(zone)) {
				refineRegion({ data: { timeZone: zone } }).then((refined) => {
					if (cancel || touched.current) return;
					const pair = resolveInitialPair({
						saved: null,
						detected: refined.currency,
						available
					});
					setHint(refined);
					paint(pair, pair.origin);
					setMemory("fresh");
				}).catch(() => {
					if (cancel || touched.current) return;
					setModel((current) => ({
						...current,
						phase: "done",
						origin: "fallback"
					}));
				}).finally(() => {
					if (cancel) return;
					setNamed(true);
					setBooted(true);
				});
				return () => {
					cancel = true;
				};
			}
			setModel((current) => ({
				...current,
				phase: "done",
				origin: "fallback"
			}));
		} else if (savedLang === "en") setModel((current) => {
			const filled = reformatPair({
				active: current.active,
				text: current.active === "base" ? current.baseText : current.quoteText,
				base: current.base,
				quote: current.quote,
				rates: table.ok ? table.rates : null,
				locale: nextLocale
			});
			return {
				...current,
				...filled
			};
		});
		setNamed(true);
		setBooted(true);
		return () => {
			cancel = true;
		};
	}, []);
	function edit(side, text) {
		touched.current = true;
		setMemory("user");
		setModel((current) => {
			const filled = fillQuote({
				active: side,
				text,
				base: current.base,
				quote: current.quote,
				rates: rates.ok ? rates.rates : null,
				locale
			});
			return {
				...current,
				...filled,
				active: side,
				phase: "done"
			};
		});
	}
	function changeLang(next) {
		setLang(next);
		writeLang(next);
		setModel((current) => {
			const filled = reformatPair({
				active: current.active,
				text: current.active === "base" ? current.baseText : current.quoteText,
				base: current.base,
				quote: current.quote,
				rates: rates.ok ? rates.rates : null,
				locale: localeOf(next)
			});
			return {
				...current,
				...filled
			};
		});
	}
	function choose(side, code) {
		touched.current = true;
		setMemory("user");
		setModel((current) => {
			let base = current.base;
			let quote = current.quote;
			if (side === "base") {
				base = code;
				if (code === quote) quote = current.base;
			} else {
				quote = code;
				if (code === base) base = current.quote;
			}
			const text = current.active === "base" ? current.baseText : current.quoteText;
			const filled = fillQuote({
				active: current.active,
				text,
				base,
				quote,
				rates: rates.ok ? rates.rates : null,
				locale
			});
			return {
				...current,
				base,
				quote,
				...filled,
				phase: "done"
			};
		});
	}
	function swap() {
		touched.current = true;
		setMemory("user");
		setFlipped((value) => !value);
		setModel((current) => ({
			...swapPair(current),
			phase: "done"
		}));
	}
	async function onRefresh() {
		setRefreshing(true);
		try {
			const next = await refreshRates();
			const resolved = next.ok ? next : readRates();
			if (!resolved || !resolved.ok) {
				setRates({ ok: false });
				return;
			}
			const stamped = next.ok ? next : {
				...resolved,
				stale: true
			};
			if (next.ok) writeRates(next);
			setRates(stamped);
			setModel((current) => {
				const text = current.active === "base" ? current.baseText : current.quoteText;
				const filled = fillQuote({
					active: current.active,
					text,
					base: current.base,
					quote: current.quote,
					rates: stamped.ok ? stamped.rates : null,
					locale
				});
				return {
					...current,
					...filled
				};
			});
		} finally {
			setRefreshing(false);
		}
	}
	const baseInvalid = model.baseText.trim() !== "" && parseAmount(model.baseText) == null;
	const quoteInvalid = model.quoteText.trim() !== "" && parseAmount(model.quoteText) == null;
	const missing = rates.ok && model.rate == null && !baseInvalid && !quoteInvalid;
	const inverse = model.rate && model.rate > 0 ? 1 / model.rate : null;
	let region = "";
	if (memory === "saved") region = copy.saved;
	else if (memory === "fresh" && model.phase === "checking") region = copy.checking;
	else if (memory === "fresh" && (model.origin === "fallback" || !hint.currency)) region = copy.fallback;
	else if (memory === "fresh" && hint.currency) {
		const place = hint.country ? named ? regionLabel(hint.country, lang) : hint.country : "";
		const name = named ? currencyLabel(hint.currency, lang) : hint.currency;
		region = place ? `${copy.geo}: ${place} · ${name}` : `${copy.geo}: ${name}`;
	}
	const baseName = named ? currencyLabel(model.base, lang) : model.base;
	const quoteName = named ? currencyLabel(model.quote, lang) : model.quote;
	const visiblePairs = PAIRS.filter(([base, quote]) => !rates.ok || rates.rates[base] && rates.rates[quote]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 bg-pine" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-xl flex-col px-4 py-8 sm:py-14",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-start justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-widest text-muted uppercase",
							children: copy.kicker
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-5xl leading-none sm:text-6xl",
							children: "Meridian"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 flex rounded-full border border-line p-1",
							role: "group",
							"aria-label": copy.langLabel,
							children: ["ru", "en"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: cn("h-11 rounded-full px-3 text-sm font-medium", lang === item ? "bg-ink text-paper" : "text-muted"),
								"aria-pressed": lang === item,
								onClick: () => changeLang(item),
								children: item === "ru" ? "RU" : "EN"
							}, item))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-sm text-pretty text-muted",
						children: copy.lede
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-8 rounded-sheet border border-line bg-sheet px-4 py-5 sm:px-6 sm:py-6",
						children: [rates.ok && rates.stale ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-sm text-muted",
							children: copy.stale
						}) : null, rates.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountRow, {
								id: baseId,
								label: copy.pay,
								text: model.baseText,
								code: model.base,
								name: baseName,
								invalid: baseInvalid,
								invalidText: copy.invalid,
								chooseLabel: `${copy.choose} ${model.base}`,
								onText: (value) => edit("base", value),
								onPick: () => setPicker("base")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative z-10 -my-4 flex justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "solid",
									size: "icon",
									"aria-label": copy.swap,
									onClick: swap,
									className: "border border-sheet",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: cn("size-4 transition-transform duration-200 motion-reduce:transition-none", flipped && "rotate-180") })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountRow, {
								id: quoteId,
								label: copy.receive,
								text: model.quoteText,
								code: model.quote,
								name: quoteName,
								invalid: quoteInvalid,
								invalidText: copy.invalid,
								chooseLabel: `${copy.choose} ${model.quote}`,
								onText: (value) => edit("quote", value),
								onPick: () => setPicker("quote")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5 border-t border-line pt-4",
								"aria-live": "polite",
								children: missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-danger",
									children: copy.missing
								}) : model.rate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-display text-lg tabular-nums",
										children: [
											"1 ",
											model.base,
											" = ",
											formatRate(model.rate, locale),
											" ",
											model.quote
										]
									}), inverse ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted tabular-nums",
										children: [
											"1 ",
											model.quote,
											" = ",
											formatRate(inverse, locale),
											" ",
											model.base
										]
									}) : null]
								}) : null
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tracking-widest text-muted uppercase",
									children: copy.quick
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: QUICK_AMOUNTS.map((amount) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "chip",
										onClick: () => edit("base", String(amount)),
										children: formatCount(amount, lang)
									}, amount))
								})]
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-8 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-danger",
								children: copy.error
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4",
								onClick: onRefresh,
								disabled: refreshing,
								children: refreshing ? copy.refreshing : copy.retry
							})]
						})]
					}),
					rates.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-widest text-muted uppercase",
							children: copy.pairs
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: visiblePairs.map(([base, quote]) => {
								const active = model.base === base && model.quote === quote;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "chip",
									"aria-pressed": active,
									className: active ? "border-ink" : void 0,
									onClick: () => {
										touched.current = true;
										setMemory("user");
										setModel((current) => {
											const filled = fillQuote({
												active: "base",
												text: parseAmount(current.baseText) == null ? "1" : current.baseText,
												base,
												quote,
												rates: rates.rates,
												locale
											});
											return {
												...current,
												base,
												quote,
												...filled,
												active: "base",
												phase: "done"
											};
										});
									},
									children: [
										base,
										"/",
										quote
									]
								}, `${base}-${quote}`);
							})
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "mt-6 space-y-3 text-sm text-muted",
						children: [
							region ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: region }) : null,
							rates.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex flex-wrap items-center gap-x-3 gap-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tabular-nums",
										children: [
											copy.updated,
											": ",
											formatStamp(rates.updatedAt, locale)
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										className: "underline decoration-line underline-offset-4 hover:text-ink",
										href: rates.sourceUrl,
										target: "_blank",
										rel: "noreferrer noopener",
										children: [
											copy.source,
											": ",
											rates.source
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "quiet",
										className: "h-11 px-2",
										onClick: onRefresh,
										disabled: refreshing,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
											className: cn("size-4", refreshing && "animate-spin motion-reduce:animate-none"),
											"aria-hidden": "true"
										}), refreshing ? copy.refreshing : copy.refresh]
									})
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "group",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
									className: "flex h-11 cursor-pointer list-none items-center gap-2 text-ink",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
										className: "size-4 text-pine",
										"aria-hidden": "true"
									}), copy.privacy]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "pb-2 text-pretty",
									children: copy.privacyBody
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencyDialog, {
				open: picker != null,
				lang,
				codes,
				selected: picker === "quote" ? model.quote : model.base,
				onOpenChange: (open) => {
					if (!open) setPicker(null);
				},
				onSelect: (code) => {
					if (picker) choose(picker, code);
				}
			})
		]
	});
}
function AmountRow({ id, label, text, code, name, invalid, invalidText, chooseLabel, onText, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl px-1 py-3 focus-within:bg-ink/5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "min-w-0 flex-1",
					htmlFor: id,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs tracking-widest text-muted uppercase",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id,
						value: text,
						onChange: (event) => onText(event.target.value),
						onFocus: (event) => event.currentTarget.select(),
						inputMode: "decimal",
						autoComplete: "off",
						autoCorrect: "off",
						spellCheck: false,
						"aria-invalid": invalid,
						placeholder: "0",
						className: cn("mt-2 w-full min-w-0 bg-transparent font-display leading-none text-ink tabular-nums outline-none placeholder:text-muted/40", amountClass(text))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mb-1 inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-line px-3 font-semibold hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine",
					"aria-label": chooseLabel,
					onClick: onPick,
					children: code
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 truncate text-sm text-muted",
				children: name
			}),
			invalid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-danger",
				children: invalidText
			}) : null
		]
	});
}
var $$splitComponentImporter = () => import("./routes-u48Zr7US.mjs");
var Route = createFileRoute("/")({
	loader: () => loadDesk(),
	pendingComponent: DeskPending,
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = { IndexRoute: Route.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$1
}) };
var routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route as n, Converter as r, router_exports as t };
