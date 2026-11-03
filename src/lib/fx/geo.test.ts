import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TIME_ZONE_RE, countryToCurrency, timezoneToCurrency } from "./geo.ts";

describe("region to currency", () => {
  it("maps countries and ignores junk", () => {
    assert.equal(countryToCurrency("ru"), "RUB");
    assert.equal(countryToCurrency("DE"), "EUR");
    assert.equal(countryToCurrency("US"), "USD");
    assert.equal(countryToCurrency("KZ"), "KZT");
    assert.equal(countryToCurrency("XX"), null);
    assert.equal(countryToCurrency("USA"), null);
    assert.equal(countryToCurrency(" ru "), "RUB");
    assert.equal(countryToCurrency("RU\nX"), null);
  });

  it("maps time zones and refuses anything that is not a zone key", () => {
    assert.equal(timezoneToCurrency("Europe/Moscow"), "RUB");
    assert.equal(timezoneToCurrency("Europe/Berlin"), "EUR");
    assert.equal(timezoneToCurrency("America/New_York"), "USD");
    assert.equal(timezoneToCurrency("America/Sao_Paulo"), "BRL");
    assert.equal(timezoneToCurrency("Asia/Almaty"), "KZT");
    assert.equal(timezoneToCurrency("UTC"), null);
    assert.equal(timezoneToCurrency("Etc/GMT"), null);
    assert.equal(timezoneToCurrency("Not/AZone"), null);
    assert.equal(timezoneToCurrency("Europe/Moscow\nX-Ignore: 1"), null);
    assert.equal(TIME_ZONE_RE.test("Europe/Moscow\nX-Ignore: 1"), false);
    assert.equal(TIME_ZONE_RE.test("America/Port-au-Prince"), true);
    assert.equal(TIME_ZONE_RE.test("../etc/passwd"), false);
  });
});
