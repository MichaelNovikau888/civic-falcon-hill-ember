export type Lang = "ru" | "en";

export const POPULAR = [
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
  "CAD",
] as const;

export const PAIRS: Array<[string, string]> = [
  ["USD", "EUR"],
  ["USD", "RUB"],
  ["EUR", "RUB"],
  ["GBP", "USD"],
  ["USD", "KZT"],
  ["EUR", "GBP"],
  ["USD", "CNY"],
  ["USD", "TRY"],
  ["USD", "UAH"],
];

export const QUICK_AMOUNTS = [10, 100, 1000, 10000] as const;

const copy = {
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
    privacyBody:
      "Пересчёт идёт в браузере: сумма никуда не отправляется. Сервер забирает только общую таблицу курсов. Страну, если её уже указал хостинг, читаем из заголовка — сам IP не смотрим и в геосервисы не передаём. Если страны нет, один раз уходит часовой пояс, и только как ключ к валюте.",
    source: "Источник",
    updated: "Курсы",
    loading: "Загружаем курсы",
    choose: "Выбрать валюту",
    langLabel: "Язык",
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
    privacyBody:
      "Conversion runs in the browser, so the amount is never sent. The server only fetches a shared rate table. If the host already knows a country, we read that header — not your IP, and not via a geolocation vendor. When the country is missing, your time zone is sent once, and only as a key to a currency.",
    source: "Source",
    updated: "Rates",
    loading: "Loading rates",
    choose: "Choose currency",
    langLabel: "Language",
  },
} as const;

export function messages(lang: Lang) {
  return copy[lang];
}

export function localeOf(lang: Lang): string {
  return lang === "ru" ? "ru" : "en";
}

export function formatCount(amount: number, lang: Lang): string {
  const separator = lang === "ru" ? "\u00a0" : ",";
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export function currencyLabel(code: string, lang: Lang): string {
  try {
    const name = new Intl.DisplayNames([localeOf(lang)], { type: "currency" }).of(code);
    if (!name) return code;
    return name.charAt(0).toLocaleUpperCase(localeOf(lang)) + name.slice(1);
  } catch {
    return code;
  }
}

export function regionLabel(country: string, lang: Lang): string {
  try {
    return new Intl.DisplayNames([localeOf(lang)], { type: "region" }).of(country) ?? country;
  } catch {
    return country;
  }
}
