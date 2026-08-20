/**
 * Default IPFS/IPNS base URLs, as published by Afreum in the Afreum/json repository:
 * https://github.com/Afreum/json
 *
 * These can be overridden via AfreumClientOptions (e.g. to point at a pinned
 * IPFS gateway, a local mirror, or a CDN cache) without touching SDK code.
 */
export const DEFAULT_TOKEN_BASE_URL =
  "https://ipfs.io/ipns/k51qzi5uqu5dlr2rb6s26f4v1eezd96fia8h51e3glyuq2gw2hiwry1am28yvv";

export const DEFAULT_GEO_BASE_URL =
  "https://ipfs.io/ipns/k51qzi5uqu5dhzz4nvsr978u2ypy33ump9amdgg67xa74bpz61r520pr0m84j7";

export const DEFAULT_LOGO_BASE_URL =
  "https://ipfs.io/ipns/k51qzi5uqu5dma5c01zuk5qkycseviwr4o0efpzq0ccje691j4jxl1onfctph5";

export const TOKEN_FILES = {
  all: "afr_token_all.json",
  flexible: "afr_token_flexible.json",
  stable: "afr_token_stable.json",
  other: "afr_token_other.json",
  external: "afr_token_external.json",
} as const;

export const GEO_FILES = {
  region: "afr_region.json",
  subregion: "afr_subregion.json",
  country: "afr_country.json",
  province: "afr_province.json",
  city: "afr_city.json",
} as const;

/** Default in-memory cache TTL: 5 minutes. */
export const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
