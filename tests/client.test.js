import { test } from "node:test";
import assert from "node:assert/strict";
import { AfreumClient } from "../dist/index.js";

function makeFakeFetch(routes) {
  let calls = 0;
  const fn = async (url) => {
    calls++;
    const key = Object.keys(routes).find((k) => url.endsWith(k));
    if (!key) {
      return { ok: false, status: 404, statusText: "Not Found" };
    }
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => routes[key],
    };
  };
  fn.callCount = () => calls;
  return fn;
}

test("tokens.all() fetches and returns token list", async () => {
  const fakeFetch = makeFakeFetch({
    "afr_token_all.json": [
      { id: 1, token: "AFR", is_main: "1", is_africa: "1", active: "1" },
      { id: 2, token: "AFRX", is_main: "0", is_africa: "1", active: "1" },
    ],
  });
  const client = new AfreumClient({ fetchImpl: fakeFetch });
  const tokens = await client.tokens.all();
  assert.equal(tokens.length, 2);
  assert.equal(tokens[0].token, "AFR");
});

test("tokens.findBySymbol() is case-insensitive", async () => {
  const fakeFetch = makeFakeFetch({
    "afr_token_all.json": [{ id: 1, token: "AFR", active: "1" }],
  });
  const client = new AfreumClient({ fetchImpl: fakeFetch });
  const found = await client.tokens.findBySymbol("afr");
  assert.equal(found?.token, "AFR");
});

test("responses are cached and not re-fetched within TTL", async () => {
  const fakeFetch = makeFakeFetch({
    "afr_region.json": [{ id: 1, name: "Africa" }],
  });
  const client = new AfreumClient({ fetchImpl: fakeFetch, cacheTtlMs: 60_000 });
  await client.geo.regions();
  await client.geo.regions();
  assert.equal(fakeFetch.callCount(), 1, "second call should hit the cache, not fetch again");
});

test("cacheTtlMs: 0 disables caching", async () => {
  const fakeFetch = makeFakeFetch({
    "afr_region.json": [{ id: 1, name: "Africa" }],
  });
  const client = new AfreumClient({ fetchImpl: fakeFetch, cacheTtlMs: 0 });
  await client.geo.regions();
  await client.geo.regions();
  assert.equal(fakeFetch.callCount(), 2);
});

test("throws a descriptive error on non-ok HTTP response", async () => {
  const fakeFetch = async () => ({ ok: false, status: 500, statusText: "Server Error" });
  const client = new AfreumClient({ fetchImpl: fakeFetch });
  await assert.rejects(() => client.tokens.all(), /status 500/);
});

test("logos.afreumTokenUrl() and tokenUrl() build correct paths", () => {
  const client = new AfreumClient({ fetchImpl: async () => ({ ok: true, json: async () => [] }) });
  assert.match(client.logos.afreumTokenUrl("AFR"), /ST_Afreum_AFR\.png$/);
  assert.match(client.logos.tokenUrl("BTC"), /\/BTC\.png$/);
});

test("geo.citiesByProvince() builds the per-province filename", async () => {
  const fakeFetch = makeFakeFetch({
    "afr_city_306.json": [{ id: 1, name: "Lagos" }],
  });
  const client = new AfreumClient({ fetchImpl: fakeFetch });
  const cities = await client.geo.citiesByProvince(306);
  assert.equal(cities[0].name, "Lagos");
});

test("findBySymbol() searches native, other, then external token sources", async () => {
  const fakeFetch = makeFakeFetch({
    "afr_token_all.json": [{ id: 1, token: "AFR", active: "1" }],
    "afr_token_other.json": [{ id: 2, token: "XLM", is_native: "1", active: "1" }],
    "afr_token_external.json": [{ id: 3, token: "BTC", token_name: "Bitcoin", active: "1" }],
  });
  const client = new AfreumClient({ fetchImpl: fakeFetch });
  assert.equal((await client.tokens.findBySymbol("xlm"))?.token, "XLM");
  assert.equal((await client.tokens.findBySymbol("btc"))?.token, "BTC");
  assert.equal(await client.tokens.findBySymbol("nope"), undefined);
});

test("geo records expose real data field names (_id, translations)", async () => {
  const fakeFetch = makeFakeFetch({
    "afr_country.json": [
      { _id: { $oid: "abc" }, id: 1, iso2: "NG", is_africa: "1", timezones: [], translations: { fr: "Nigéria" } },
    ],
  });
  const client = new AfreumClient({ fetchImpl: fakeFetch });
  const ng = await client.geo.findCountryByIso("ng");
  assert.equal(ng?._id.$oid, "abc");
  assert.equal(ng?.translations.fr, "Nigéria");
});
