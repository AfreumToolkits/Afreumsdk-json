import { HttpClient } from "./http.js";
import { TOKEN_FILES } from "./constants.js";
import type {
  AfreumExternalToken,
  AfreumFiatToken,
  AfreumOtherToken,
  AfreumToken,
} from "./types.js";

/**
 * Wraps the Afreum Ecosystem token JSON endpoints:
 * https://github.com/Afreum/json#1-tokens-assets
 */
export class TokensResource {
  constructor(private readonly http: HttpClient, private readonly baseUrl: string) {}

  private url(file: string): string {
    return `${this.baseUrl}/${file}`;
  }

  /** All Afreum-native tokens: AFR, AFRX, flexible country tokens, and fiat tokens. */
  all(): Promise<AfreumToken[]> {
    return this.http.getJson<AfreumToken[]>(this.url(TOKEN_FILES.all));
  }

  /** Tokens with a flexible, market-driven price (e.g. AFR, AFRX, ANGN, AZAR). */
  flexible(): Promise<AfreumToken[]> {
    return this.http.getJson<AfreumToken[]>(this.url(TOKEN_FILES.flexible));
  }

  /** Fiat-pegged stable tokens, 1:1 with a country's currency (e.g. SNGN, SZAR). */
  stable(): Promise<AfreumFiatToken[]> {
    return this.http.getJson<AfreumFiatToken[]>(this.url(TOKEN_FILES.stable));
  }

  /** Other Stellar network assets supported by the ecosystem (e.g. XLM, USDC). */
  other(): Promise<AfreumOtherToken[]> {
    return this.http.getJson<AfreumOtherToken[]>(this.url(TOKEN_FILES.other));
  }

  /** Broader external crypto assets referenced by the ecosystem (e.g. BTC, ETH). Reduced field set. */
  external(): Promise<AfreumExternalToken[]> {
    return this.http.getJson<AfreumExternalToken[]>(this.url(TOKEN_FILES.external));
  }

  /**
   * Convenience helper: returns the entry matching `symbol` (case-insensitive) across
   * every token source — native (all), other Stellar assets, and external tokens —
   * or `undefined` if not found.
   */
  async findBySymbol(
    symbol: string
  ): Promise<AfreumToken | AfreumOtherToken | AfreumExternalToken | undefined> {
    const target = symbol.toUpperCase();
    const inNative = (await this.all()).find((t) => t.token.toUpperCase() === target);
    if (inNative) return inNative;
    const inOther = (await this.other()).find((t) => t.token.toUpperCase() === target);
    if (inOther) return inOther;
    return (await this.external()).find((t) => t.token.toUpperCase() === target);
  }

  /** Convenience helper: returns only tokens flagged `is_africa === "1"` from the full list. */
  async africanTokens(): Promise<AfreumToken[]> {
    const tokens = await this.all();
    return tokens.filter((t) => "is_africa" in t && t.is_africa === "1");
  }

  /** Convenience helper: returns only tokens flagged `active === "1"` from the full list. */
  async activeTokens(): Promise<AfreumToken[]> {
    const tokens = await this.all();
    return tokens.filter((t) => t.active === "1");
  }
}
