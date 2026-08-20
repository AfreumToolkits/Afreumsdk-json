import { HttpClient } from "./http.js";
import { TokensResource } from "./tokens.js";
import { GeoResource } from "./geo.js";
import { LogosResource } from "./logos.js";
import {
  DEFAULT_GEO_BASE_URL,
  DEFAULT_LOGO_BASE_URL,
  DEFAULT_TOKEN_BASE_URL,
} from "./constants.js";
import type { AfreumClientOptions } from "./types.js";

/**
 * Entry point for afreumtoolkits. Wraps the public Afreum Ecosystem JSON data
 * (https://github.com/Afreum/json) with typed, cached, developer-friendly methods.
 *
 * @example
 * ```ts
 * import { AfreumClient } from "afreumtoolkits";
 *
 * const afreum = new AfreumClient();
 * const tokens = await afreum.tokens.flexible();
 * const nigeria = await afreum.geo.findCountryByIso("NG");
 * const logoUrl = afreum.logos.afreumTokenUrl("AFR");
 * ```
 */
export class AfreumClient {
  readonly tokens: TokensResource;
  readonly geo: GeoResource;
  readonly logos: LogosResource;
  private readonly http: HttpClient;

  constructor(options: AfreumClientOptions = {}) {
    this.http = new HttpClient({
      fetchImpl: options.fetchImpl,
      cacheTtlMs: options.cacheTtlMs,
      requestInit: options.requestInit,
    });

    this.tokens = new TokensResource(this.http, options.tokenBaseUrl ?? DEFAULT_TOKEN_BASE_URL);
    this.geo = new GeoResource(this.http, options.geoBaseUrl ?? DEFAULT_GEO_BASE_URL);
    this.logos = new LogosResource(options.logoBaseUrl ?? DEFAULT_LOGO_BASE_URL);
  }

  /** Clears the in-memory response cache shared by `tokens` and `geo`. */
  clearCache(): void {
    this.http.clearCache();
  }
}
