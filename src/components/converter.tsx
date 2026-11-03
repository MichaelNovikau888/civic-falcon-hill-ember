import { ArrowLeftRight, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CurrencyDialog } from "@/components/currency-dialog";
import { loadDesk, refineRegion, refreshRates } from "@/lib/fx/desk.functions";
import { TIME_ZONE_RE } from "@/lib/fx/geo";
import {
  currencyLabel,
  formatCount,
  localeOf,
  messages,
  PAIRS,
  QUICK_AMOUNTS,
  regionLabel,
  type Lang,
} from "@/lib/fx/i18n";
import {
  fillQuote,
  formatRate,
  formatStamp,
  parseAmount,
  reformatPair,
  resolveInitialPair,
  swapPair,
} from "@/lib/fx/money";
import { readLang, readPair, readRates, writeLang, writePair, writeRates } from "@/lib/fx/storage";
import type { PairOrigin, RatesResult, RegionHint, Side } from "@/lib/fx/types";
import { cn } from "@/lib/utils";

type Memory = "fresh" | "saved" | "user";

type Model = {
  base: string;
  quote: string;
  baseText: string;
  quoteText: string;
  rate: number | null;
  active: Side;
  origin: PairOrigin;
  phase: "checking" | "done";
};

function project(
  pair: { base: string; quote: string },
  active: Side,
  text: string,
  rates: RatesResult,
  locale: string,
) {
  return fillQuote({
    active,
    text,
    base: pair.base,
    quote: pair.quote,
    rates: rates.ok ? rates.rates : null,
    locale,
  });
}

function initialModel(rates: RatesResult, hint: RegionHint): Model {
  const available = rates.ok ? new Set(Object.keys(rates.rates)) : null;
  const pair = resolveInitialPair({ saved: null, detected: hint.currency, available });
  const filled = project(pair, "base", "1", rates, "ru");
  return {
    ...pair,
    ...filled,
    active: "base",
    phase: hint.currency ? "done" : "checking",
  };
}

function amountClass(text: string): string {
  if (text.length > 12) return "text-2xl";
  if (text.length > 8) return "text-3xl";
  return "text-4xl sm:text-5xl";
}

export function DeskPending() {
  const copy = messages("ru");
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="h-1 bg-pine" />
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:py-14">
        <p className="text-xs tracking-widest text-muted uppercase">{copy.kicker}</p>
        <h1 className="mt-2 font-display text-5xl leading-none">Meridian</h1>
        <p className="mt-3 max-w-sm text-pretty text-muted">{copy.loading}</p>
        <div className="mt-8 h-72 animate-pulse rounded-sheet border border-line bg-sheet motion-reduce:animate-none" />
      </div>
    </div>
  );
}

export function Converter({
  data,
}: {
  data: Awaited<ReturnType<typeof loadDesk>>;
}) {
  const baseId = useId();
  const quoteId = useId();
  const touched = useRef(false);
  const [lang, setLang] = useState<Lang>("ru");
  const [rates, setRates] = useState<RatesResult>(data.rates);
  const [hint, setHint] = useState<RegionHint>(data.hint);
  const [memory, setMemory] = useState<Memory>("fresh");
  const [named, setNamed] = useState(false);
  const [booted, setBooted] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [picker, setPicker] = useState<Side | null>(null);
  const [model, setModel] = useState<Model>(() => initialModel(data.rates, data.hint));

  const copy = messages(lang);
  const locale = localeOf(lang);
  const codes = rates.ok ? Object.keys(rates.rates).sort() : [];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!booted) return;
    if (memory === "fresh" && model.phase === "checking") return;
    writePair({ base: model.base, quote: model.quote });
  }, [booted, memory, model.base, model.quote, model.phase]);

  useEffect(() => {
    let cancel = false;
    const savedLang = readLang();
    const nextLocale = localeOf(savedLang ?? "ru");
    if (savedLang) setLang(savedLang);

    const cached = data.rates.ok ? null : readRates();
    const table: RatesResult = data.rates.ok ? data.rates : (cached ?? { ok: false });
    if (data.rates.ok) writeRates(data.rates);
    if (cached) setRates(cached);

    const available = table.ok ? new Set(Object.keys(table.rates)) : null;
    const saved = readPair();
    const savedOk =
      !!saved && (!available || (available.has(saved.base) && available.has(saved.quote)));

    function paint(pair: { base: string; quote: string }, origin: PairOrigin) {
      const filled = project(pair, "base", "1", table, nextLocale);
      setModel({
        base: pair.base,
        quote: pair.quote,
        ...filled,
        active: "base",
        origin,
        phase: "done",
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
        void refineRegion({ data: { timeZone: zone } })
          .then((refined) => {
            if (cancel || touched.current) return;
            const pair = resolveInitialPair({
              saved: null,
              detected: refined.currency,
              available,
            });
            setHint(refined);
            paint(pair, pair.origin);
            setMemory("fresh");
          })
          .catch(() => {
            if (cancel || touched.current) return;
            setModel((current) => ({ ...current, phase: "done", origin: "fallback" }));
          })
          .finally(() => {
            if (cancel) return;
            setNamed(true);
            setBooted(true);
          });
        return () => {
          cancel = true;
        };
      }
      setModel((current) => ({ ...current, phase: "done", origin: "fallback" }));
    } else if (savedLang === "en") {
      setModel((current) => {
        const filled = reformatPair({
          active: current.active,
          text: current.active === "base" ? current.baseText : current.quoteText,
          base: current.base,
          quote: current.quote,
          rates: table.ok ? table.rates : null,
          locale: nextLocale,
        });
        return { ...current, ...filled };
      });
    }

    setNamed(true);
    setBooted(true);
    return () => {
      cancel = true;
    };
    // First visit only: saved pair, then region. Later edits are explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function edit(side: Side, text: string) {
    touched.current = true;
    setMemory("user");
    setModel((current) => {
      const filled = fillQuote({
        active: side,
        text,
        base: current.base,
        quote: current.quote,
        rates: rates.ok ? rates.rates : null,
        locale,
      });
      return { ...current, ...filled, active: side, phase: "done" };
    });
  }

  function changeLang(next: Lang) {
    setLang(next);
    writeLang(next);
    setModel((current) => {
      const filled = reformatPair({
        active: current.active,
        text: current.active === "base" ? current.baseText : current.quoteText,
        base: current.base,
        quote: current.quote,
        rates: rates.ok ? rates.rates : null,
        locale: localeOf(next),
      });
      return { ...current, ...filled };
    });
  }

  function choose(side: Side, code: string) {
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
        locale,
      });
      return { ...current, base, quote, ...filled, phase: "done" };
    });
  }

  function swap() {
    touched.current = true;
    setMemory("user");
    setFlipped((value) => !value);
    setModel((current) => ({ ...swapPair(current), phase: "done" }));
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
      const stamped: RatesResult = next.ok ? next : { ...resolved, stale: true };
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
          locale,
        });
        return { ...current, ...filled };
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
    const place = hint.country ? (named ? regionLabel(hint.country, lang) : hint.country) : "";
    const name = named ? currencyLabel(hint.currency, lang) : hint.currency;
    region = place ? `${copy.geo}: ${place} · ${name}` : `${copy.geo}: ${name}`;
  }

  const baseName = named ? currencyLabel(model.base, lang) : model.base;
  const quoteName = named ? currencyLabel(model.quote, lang) : model.quote;
  const visiblePairs = PAIRS.filter(
    ([base, quote]) => !rates.ok || (rates.rates[base] && rates.rates[quote]),
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="h-1 bg-pine" />
      <div className="mx-auto flex w-full max-w-xl flex-col px-4 py-8 sm:py-14">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-muted uppercase">{copy.kicker}</p>
            <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">Meridian</h1>
          </div>
          <div
            className="mt-1 flex rounded-full border border-line p-1"
            role="group"
            aria-label={copy.langLabel}
          >
            {(["ru", "en"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={cn(
                  "h-11 rounded-full px-3 text-sm font-medium",
                  lang === item ? "bg-ink text-paper" : "text-muted",
                )}
                aria-pressed={lang === item}
                onClick={() => changeLang(item)}
              >
                {item === "ru" ? "RU" : "EN"}
              </button>
            ))}
          </div>
        </header>
        <p className="mt-4 max-w-sm text-pretty text-muted">{copy.lede}</p>

        <section className="mt-8 rounded-sheet border border-line bg-sheet px-4 py-5 sm:px-6 sm:py-6">
          {rates.ok && rates.stale ? (
            <p className="mb-4 text-sm text-muted">{copy.stale}</p>
          ) : null}

          {rates.ok ? (
            <div>
              <AmountRow
                id={baseId}
                label={copy.pay}
                text={model.baseText}
                code={model.base}
                name={baseName}
                invalid={baseInvalid}
                invalidText={copy.invalid}
                chooseLabel={`${copy.choose} ${model.base}`}
                onText={(value) => edit("base", value)}
                onPick={() => setPicker("base")}
              />
              <div className="relative z-10 -my-4 flex justify-center">
                <Button
                  variant="solid"
                  size="icon"
                  aria-label={copy.swap}
                  onClick={swap}
                  className="border border-sheet"
                >
                  <ArrowLeftRight
                    className={cn(
                      "size-4 transition-transform duration-200 motion-reduce:transition-none",
                      flipped && "rotate-180",
                    )}
                  />
                </Button>
              </div>
              <AmountRow
                id={quoteId}
                label={copy.receive}
                text={model.quoteText}
                code={model.quote}
                name={quoteName}
                invalid={quoteInvalid}
                invalidText={copy.invalid}
                chooseLabel={`${copy.choose} ${model.quote}`}
                onText={(value) => edit("quote", value)}
                onPick={() => setPicker("quote")}
              />

              <div className="mt-5 border-t border-line pt-4" aria-live="polite">
                {missing ? (
                  <p className="text-sm text-danger">{copy.missing}</p>
                ) : model.rate ? (
                  <div className="space-y-1">
                    <p className="font-display text-lg tabular-nums">
                      1 {model.base} = {formatRate(model.rate, locale)} {model.quote}
                    </p>
                    {inverse ? (
                      <p className="text-sm text-muted tabular-nums">
                        1 {model.quote} = {formatRate(inverse, locale)} {model.base}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="mt-5">
                <p className="text-xs tracking-widest text-muted uppercase">{copy.quick}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant="chip"
                      onClick={() => edit("base", String(amount))}
                    >
                      {formatCount(amount, lang)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-danger">{copy.error}</p>
              <Button className="mt-4" onClick={onRefresh} disabled={refreshing}>
                {refreshing ? copy.refreshing : copy.retry}
              </Button>
            </div>
          )}
        </section>

        {rates.ok ? (
          <div className="mt-4">
            <p className="text-xs tracking-widest text-muted uppercase">{copy.pairs}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {visiblePairs.map(([base, quote]) => {
                const active = model.base === base && model.quote === quote;
                return (
                  <Button
                    key={`${base}-${quote}`}
                    variant="chip"
                    aria-pressed={active}
                    className={active ? "border-ink" : undefined}
                    onClick={() => {
                      touched.current = true;
                      setMemory("user");
                      setModel((current) => {
                        const text = parseAmount(current.baseText) == null ? "1" : current.baseText;
                        const filled = fillQuote({
                          active: "base",
                          text,
                          base,
                          quote,
                          rates: rates.rates,
                          locale,
                        });
                        return {
                          ...current,
                          base,
                          quote,
                          ...filled,
                          active: "base",
                          phase: "done",
                        };
                      });
                    }}
                  >
                    {base}/{quote}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}

        <footer className="mt-6 space-y-3 text-sm text-muted">
          {region ? <p>{region}</p> : null}
          {rates.ok ? (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="tabular-nums">
                {copy.updated}: {formatStamp(rates.updatedAt, locale)}
              </span>
              <a
                className="underline decoration-line underline-offset-4 hover:text-ink"
                href={rates.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                {copy.source}: {rates.source}
              </a>
              <Button
                variant="quiet"
                className="h-11 px-2"
                onClick={onRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={cn("size-4", refreshing && "animate-spin motion-reduce:animate-none")}
                  aria-hidden="true"
                />
                {refreshing ? copy.refreshing : copy.refresh}
              </Button>
            </p>
          ) : null}
          <details className="group">
            <summary className="flex h-11 cursor-pointer list-none items-center gap-2 text-ink">
              <ShieldCheck className="size-4 text-pine" aria-hidden="true" />
              {copy.privacy}
            </summary>
            <p className="pb-2 text-pretty">{copy.privacyBody}</p>
          </details>
        </footer>
      </div>

      <CurrencyDialog
        open={picker != null}
        lang={lang}
        codes={codes}
        selected={picker === "quote" ? model.quote : model.base}
        onOpenChange={(open) => {
          if (!open) setPicker(null);
        }}
        onSelect={(code) => {
          if (picker) choose(picker, code);
        }}
      />
    </div>
  );
}

function AmountRow({
  id,
  label,
  text,
  code,
  name,
  invalid,
  invalidText,
  chooseLabel,
  onText,
  onPick,
}: {
  id: string;
  label: string;
  text: string;
  code: string;
  name: string;
  invalid: boolean;
  invalidText: string;
  chooseLabel: string;
  onText: (value: string) => void;
  onPick: () => void;
}) {
  return (
    <div className="rounded-2xl px-1 py-3 focus-within:bg-ink/5">
      <div className="flex items-end justify-between gap-3">
        <label className="min-w-0 flex-1" htmlFor={id}>
          <span className="text-xs tracking-widest text-muted uppercase">{label}</span>
          <input
            id={id}
            value={text}
            onChange={(event) => onText(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={invalid}
            placeholder="0"
            className={cn(
              "mt-2 w-full min-w-0 bg-transparent font-display leading-none text-ink tabular-nums outline-none placeholder:text-muted/40",
              amountClass(text),
            )}
          />
        </label>
        <button
          type="button"
          className="mb-1 inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-line px-3 font-semibold hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
          aria-label={chooseLabel}
          onClick={onPick}
        >
          {code}
        </button>
      </div>
      <p className="mt-2 truncate text-sm text-muted">{name}</p>
      {invalid ? <p className="mt-1 text-sm text-danger">{invalidText}</p> : null}
    </div>
  );
}
