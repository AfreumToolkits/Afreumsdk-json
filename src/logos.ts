/**
 * Wraps the Afreum Ecosystem logo asset endpoint:
 * https://github.com/Afreum/json#3-logos-supported-asset-logos
 *
 * This resource is URL-building only (no fetch) since logos are typically consumed
 * directly as <img> src values.
 */
export class LogosResource {
  constructor(private readonly baseUrl: string) {}

  /** Logo URL for a token native to the Afreum Ecosystem (e.g. AFR, AFRX, ANGN, SNGN). */
  afreumTokenUrl(symbol: string): string {
    return `${this.baseUrl}/ST_Afreum_${symbol}.png`;
  }

  /** Logo URL for any other supported token (other Stellar assets or external crypto, e.g. XLM, BTC). */
  tokenUrl(symbol: string): string {
    return `${this.baseUrl}/${symbol}.png`;
  }

  /**
   * Convenience helper: builds the correct logo URL given an `is_main`/`is_country_token`-style
   * flag. Pass `isAfreumNative: true` for AFR/AFRX/flexible or fiat country tokens.
   */
  urlFor(symbol: string, isAfreumNative: boolean): string {
    return isAfreumNative ? this.afreumTokenUrl(symbol) : this.tokenUrl(symbol);
  }
}
