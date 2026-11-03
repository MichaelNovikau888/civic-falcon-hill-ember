import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  crossRate,
  fillQuote,
  formatMoneyInput,
  formatRate,
  parseAmount,
  resolveInitialPair,
  swapPair,
} from "./money.ts";

const rates = { USD: 1, EUR: 0.5, RUB: 100, JPY: 150 };

describe("parseAmount", () => {
  it("reads both decimal separators and grouped thousands", () => {
    assert.equal(parseAmount("1"), 1);
    assert.equal(parseAmount("1,5"), 1.5);
    assert.equal(parseAmount("1.5"), 1.5);
    assert.equal(parseAmount("1 000"), 1000);
    assert.equal(parseAmount("1 000,50"), 1000.5);
    assert.equal(parseAmount("1,000.50"), 1000.5);
    assert.equal(parseAmount("1.000,50"), 1000.5);
    assert.equal(parseAmount("1,000"), 1000);
    assert.equal(parseAmount("12,50"), 12.5);
    assert.equal(parseAmount("1,"), 1);
    assert.equal(parseAmount(""), null);
    assert.equal(parseAmount("abc"), null);
    assert.equal(parseAmount("-5"), null);
    assert.equal(parseAmount("1e6"), null);
    assert.equal(parseAmount("1e12"), null);
    assert.equal(parseAmount(String(1e13)), null);
  });
});

describe("crossRate and fill", () => {
  it("quotes any pair from a USD table, both directions", () => {
    assert.equal(crossRate(rates, "USD", "EUR"), 0.5);
    assert.equal(crossRate(rates, "EUR", "USD"), 2);
    assert.equal(crossRate(rates, "EUR", "RUB"), 200);
    assert.equal(crossRate(rates, "USD", "USD"), 1);
    assert.equal(crossRate(rates, "USD", "GBP"), null);

    const forward = fillQuote({
      active: "base",
      text: "100",
      base: "USD",
      quote: "EUR",
      rates,
      locale: "en",
    });
    assert.equal(forward.baseText, "100");
    assert.equal(forward.quoteText, "50.00");

    const back = fillQuote({
      active: "quote",
      text: "50",
      base: "USD",
      quote: "EUR",
      rates,
      locale: "en",
    });
    assert.equal(back.baseText, "100.00");
    assert.equal(back.quoteText, "50");
  });

  it("keeps the value when the pair is swapped", () => {
    const filled = fillQuote({
      active: "base",
      text: "2",
      base: "EUR",
      quote: "RUB",
      rates,
      locale: "ru",
    });
    const swapped = swapPair({ ...filled, base: "EUR", quote: "RUB", active: "base" as const });
    assert.deepEqual(
      { base: swapped.base, quote: swapped.quote, baseText: swapped.baseText, quoteText: swapped.quoteText },
      { base: "RUB", quote: "EUR", baseText: filled.quoteText, quoteText: filled.baseText },
    );
    const rate = crossRate(rates, swapped.base, swapped.quote);
    assert.ok(rate);
    const restored = parseAmount(swapped.baseText)! * rate;
    assert.ok(Math.abs(restored - parseAmount(swapped.quoteText)!) < 1e-9);
  });

  it("does not collapse a tiny amount to zero", () => {
    assert.equal(formatMoneyInput(0.004, "USD", "en"), "0.004");
    assert.notEqual(formatRate(0.897215, "ru"), "—");
    assert.match(formatRate(0.897215, "ru"), /0,8972/);
  });
});

describe("resolveInitialPair", () => {
  const available = new Set(["USD", "EUR", "RUB"]);

  it("prefers a saved pair, then region, then dollars", () => {
    assert.deepEqual(
      resolveInitialPair({
        saved: { base: "EUR", quote: "RUB" },
        detected: "USD",
        available,
      }),
      { base: "EUR", quote: "RUB", origin: "saved" },
    );
    assert.deepEqual(
      resolveInitialPair({ saved: null, detected: "RUB", available }),
      { base: "RUB", quote: "USD", origin: "geo" },
    );
    assert.deepEqual(
      resolveInitialPair({ saved: null, detected: "USD", available }),
      { base: "USD", quote: "EUR", origin: "geo" },
    );
    assert.equal(
      resolveInitialPair({ saved: null, detected: null, available }).origin,
      "fallback",
    );
    assert.equal(
      resolveInitialPair({ saved: null, detected: null, available }).base,
      "USD",
    );
    assert.equal(
      resolveInitialPair({
        saved: null,
        detected: "BTC",
        available,
      }).origin,
      "fallback",
    );
  });
});
