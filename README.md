# Afreumsdk-json

## afreumtoolkits

An unofficial developer toolkit/SDK that wraps the [Afreum Ecosystem public JSON data](https://github.com/Afreum/json) — tokens, geo, and logos — behind a typed, cached, promise-based API.

This package does not host or modify Afreum's data; it fetches the same JSON/IPFS endpoints published in [`Afreum/json`](https://github.com/Afreum/json) and gives you convenient methods, TypeScript types, in-memory caching, and helper lookups on top.

> Not affiliated with or endorsed by Afreum. Data source, field definitions, and licensing for the underlying JSON files belong to Afreum ([GPL-3.0](https://github.com/Afreum/json/blob/main/LICENSE)). This SDK's own code is MIT-licensed.

## Install

```bash
npm install afreumtoolkits
```

Requires Node 18+ (for global `fetch`), or pass your own `fetchImpl` for older runtimes.

## Quick start

```ts
import { AfreumClient } from "afreumtoolkits";

const afreum = new AfreumClient();

// Tokens
const allTokens = await afreum.tokens.all();
const flexible = await afreum.tokens.flexible();
const afr = await afreum.tokens.findBySymbol("AFR");

// Geo
const countries = await afreum.geo.countries();
const nigeria = await afreum.geo.findCountryByIso("NG");
const lagosCities = await afreum.geo.citiesByProvince(306);

// Logos (no network call — just builds the URL)
const afrLogo = afreum.logos.afreumTokenUrl("AFR");
const btcLogo = afreum.logos.tokenUrl("BTC");
```

## Why use this instead of calling the JSON URLs directly?

- **Typed responses** — every endpoint has a matching TypeScript interface (`AfreumToken`, `AfreumCountry`, `AfreumCity`, etc.), based on the field definitions in the `Afreum/json` README.
- **In-memory caching** — repeat calls within the TTL window (default 5 minutes) reuse the previous response instead of re-downloading, which matters for the large geo/city files.
- **In-flight de-duplication** — if you call the same endpoint twice before the first response lands, both callers share one network request.
- **Convenience lookups** — `findBySymbol`, `findCountryByIso`, `africanTokens`, `activeTokens`, `africanCountries` save you from writing the same `.find()`/`.filter()` boilerplate.
- **Swappable base URLs** — point `tokenBaseUrl` / `geoBaseUrl` / `logoBaseUrl` at a different IPFS gateway, a pinned mirror, or a local cache without touching your code.

## API

### `new AfreumClient(options?)`

| Option | Type | Default | Description |
|---|---|---|---|
| `tokenBaseUrl` | `string` | Afreum's published token IPNS base | Base URL for token JSON files |
| `geoBaseUrl` | `string` | Afreum's published geo IPNS base | Base URL for geo JSON files |
| `logoBaseUrl` | `string` | Afreum's published logo IPNS base | Base URL for logo PNGs |
| `cacheTtlMs` | `number` | `300000` (5 min) | In-memory cache lifetime; `0` disables caching |
| `fetchImpl` | `typeof fetch` | global `fetch` | Custom fetch (e.g. for Node <18 or tests) |
| `requestInit` | `RequestInit` | `{}` | Extra options (headers, etc.) applied to every request |

### `afreum.tokens`

| Method | Returns |
|---|---|
| `.all()` | All Afreum-native tokens (flexible + fiat) |
| `.flexible()` | Flexible market-priced tokens |
| `.stable()` | Fiat-pegged stable tokens |
| `.other()` | Other supported Stellar assets |
| `.external()` | External crypto assets (BTC, ETH, ...) |
| `.findBySymbol(symbol)` | Single token by symbol, or `undefined` |
| `.africanTokens()` | Tokens where `is_africa === "1"` |
| `.activeTokens()` | Tokens where `active === "1"` |

### `afreum.geo`

| Method | Returns |
|---|---|
| `.regions()` | World regions |
| `.subregions()` | World sub-regions |
| `.countries()` | All countries |
| `.provinces()` | All provinces/states |
| `.cities()` | **Full** city list (~50MB — prefer `citiesByProvince`) |
| `.citiesByProvince(provinceId)` | Cities for one province only |
| `.findCountryByIso(code)` | Country by ISO2 or ISO3 code |
| `.africanCountries()` | Countries where `is_africa === "1"` |

### `afreum.logos`

| Method | Returns |
|---|---|
| `.afreumTokenUrl(symbol)` | Logo URL for an Afreum-native token |
| `.tokenUrl(symbol)` | Logo URL for any other supported token |
| `.urlFor(symbol, isAfreumNative)` | Picks the right URL builder for you |

### `afreum.clearCache()`

Clears all cached responses immediately.

## Data notes (inherited from Afreum's source data)

- Country and province lists are **not filtered for sanctioned countries** — apply your own compliance/sanctions filters before using this data in production.
- The full `geo.cities()` payload is large (~50MB). Use `geo.citiesByProvince(provinceId)` whenever you can scope to a known province.
- External token entries (`tokens.external()`) currently omit contract address/network fields — verify those independently rather than relying on this dataset.

## Development

```bash
npm install
npm run build      # compiles src/ -> dist/ with tsc
npm test           # builds, then runs the Node test-runner suite
npm run typecheck  # tsc --noEmit
```

## License

MIT for this SDK's source code. The underlying Afreum JSON data is published by Afreum under GPL-3.0 — see [Afreum/json](https://github.com/Afreum/json).
