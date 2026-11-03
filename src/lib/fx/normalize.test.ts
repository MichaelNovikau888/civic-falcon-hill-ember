import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeErApi, normalizeFawaz } from "./normalize.ts";

describe("normalize rate payloads", () => {
  it("accepts a successful ExchangeRate-API table and drops bad rows", () => {
    const table = normalizeErApi({
      result: "success",
      time_last_update_unix: 1_700_000_000,
      rates: {
        USD: 1,
        EUR: 0.9,
        RUB: 90,
        GBP: 0.8,
        JPY: 150,
        CHF: 0.9,
        CNY: 7,
        CAD: 1.3,
        AUD: 1.5,
        NZD: 1.6,
        SEK: 10,
        BAD: -1,
        nope: "1",
        US: 1,
        EUR2: 1,
      },
    });
    assert.ok(table);
    assert.equal(table.rates.EUR, 0.9);
    assert.equal(table.rates.RUB, 90);
    assert.equal(table.rates.USD, 1);
    assert.equal(table.rates.BAD, undefined);
    assert.equal(table.source, "ExchangeRate-API");
    assert.equal(table.updatedAt, new Date(1_700_000_000 * 1000).toISOString());
  });

  it("rejects a failed or tiny payload", () => {
    assert.equal(normalizeErApi({ result: "error", rates: { USD: 1, EUR: 1 } }), null);
    assert.equal(normalizeErApi(null), null);
    assert.equal(normalizeFawaz({ usd: { eur: 1 } }), null);
  });

  it("reads the lowercase fallback table", () => {
    const rates: Record<string, number> = {
      usd: 1,
      eur: 0.8,
      gbp: 0.7,
      jpy: 150,
      chf: 0.9,
      cny: 7,
      cad: 1.3,
      aud: 1.5,
      nzd: 1.6,
      sek: 10,
      nok: 10,
      rub: 90,
    };
    const table = normalizeFawaz({ date: "2026-10-28", usd: rates });
    assert.ok(table);
    assert.equal(table.rates.EUR, 0.8);
    assert.equal(table.rates.USD, 1);
    assert.equal(table.updatedAt, "2026-10-28T00:00:00.000Z");
    assert.equal(table.sourceUrl.startsWith("https://"), true);
  });
});
