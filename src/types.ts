/** Base fields shared by AFR, AFRX, flexible country tokens, fiat tokens, and other Stellar tokens. */
export interface AfreumTokenBase {
  id: string;
  token: string;
  issuer: string;
  domain: string;
  description: string;
  is_main: "0" | "1";
  is_stable: "0" | "1";
  is_governance: "0" | "1";
  is_country_token: "0" | "1";
  is_africa: "0" | "1";
  active: "0" | "1";
  DTI: string;
  DTI_Long_Name: string;
  logo: string;
}

/** A fiat/stable token, extending the base fields with currency-peg info. */
export interface AfreumFiatToken extends AfreumTokenBase {
  currency: string;
  currency_name: string;
  currency_symbol: string;
  is_cbdc: "0" | "1";
}

/** Reduced field set used for external (non-Afreum-native) crypto assets, e.g. BTC, ETH. */
export interface AfreumExternalToken {
  id: string;
  token: string;
  logo: string;
  active: "0" | "1";
  token_name: string;
}

/** Other Stellar network assets (e.g. XLM, USDC) — use `is_native` instead of the base flag trio. */
export interface AfreumOtherToken {
  id: string;
  token: string;
  issuer: string;
  domain: string;
  description: string;
  is_native: "0" | "1";
  is_country_token: "0" | "1";
  is_africa: "0" | "1";
  active: "0" | "1";
  DTI: string | null;
  DTI_Long_Name: string;
  logo: string;
}

export type AfreumToken = AfreumTokenBase | AfreumFiatToken;

/** MongoDB ObjectID as serialized in Afreum's geo JSON exports. */
export interface AfreumObjectId {
  $oid: string;
}

export interface AfreumRegion {
  _id: AfreumObjectId;
  id: number;
  name: string;
  translations: Record<string, string>;
  wikiDataId?: string;
}

export interface AfreumSubRegion {
  _id: AfreumObjectId;
  id: number;
  name: string;
  region_id: string;
  translations: Record<string, string>;
  wikiDataId?: string;
}

export interface AfreumTimezone {
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation: string;
  tzName: string;
}

export interface AfreumCountry {
  _id: AfreumObjectId;
  id: number;
  name: string;
  iso3: string;
  iso2: string;
  numeric_code: string;
  phone_code: string;
  capital: string | null;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string | null;
  region: string | null;
  region_id: string | null;
  subregion: string | null;
  subregion_id: string | null;
  nationality: string;
  timezones: AfreumTimezone[] | null;
  translations: Record<string, string>;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
  flexible_token: string | null;
  flexible_token_issuer: string | null;
  flexible_token_supply: string | null;
  is_active: "0" | "1";
  is_africa: "0" | "1";
  stable_token: string | null;
  stable_token_issuer: string | null;
}

export interface AfreumProvince {
  _id: AfreumObjectId;
  id: number;
  name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  state_code: string;
  type: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface AfreumCity {
  _id: AfreumObjectId;
  id: number;
  name: string;
  state_id: number;
  state_code: string;
  state_name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  latitude: string;
  longitude: string;
  wikiDataId?: string;
}

/** Options accepted by the top-level AfreumClient constructor. */
export interface AfreumClientOptions {
  /** Override the IPNS/gateway base for token data. */
  tokenBaseUrl?: string;
  /** Override the IPNS/gateway base for geo data. */
  geoBaseUrl?: string;
  /** Override the IPNS/gateway base for logo images. */
  logoBaseUrl?: string;
  /** Time in ms to cache fetched JSON in memory. 0 disables caching. Default: 5 minutes. */
  cacheTtlMs?: number;
  /** Custom fetch implementation (defaults to global fetch). Useful for Node <18 or testing. */
  fetchImpl?: typeof fetch;
  /** Extra init options (headers, etc.) applied to every request. */
  requestInit?: RequestInit;
}
