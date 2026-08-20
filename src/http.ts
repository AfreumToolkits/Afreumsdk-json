import { DEFAULT_CACHE_TTL_MS } from "./constants.js";

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

/**
 * Thin fetch wrapper providing:
 *  - in-memory TTL caching (avoids re-downloading large geo/city files)
 *  - in-flight request de-duplication (parallel calls for the same URL share one fetch)
 *  - consistent error messages
 */
export class HttpClient {
  private readonly fetchImpl: typeof fetch;
  private readonly cacheTtlMs: number;
  private readonly requestInit: RequestInit;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(options: {
    fetchImpl?: typeof fetch;
    cacheTtlMs?: number;
    requestInit?: RequestInit;
  } = {}) {
    const resolvedFetch = options.fetchImpl ?? globalThis.fetch;
    if (!resolvedFetch) {
      throw new Error(
        "afreumtoolkits: no fetch implementation found. Pass `fetchImpl` in AfreumClientOptions " +
          "(e.g. from node-fetch) when running on Node < 18."
      );
    }
    this.fetchImpl = resolvedFetch;
    this.cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    this.requestInit = options.requestInit ?? {};
  }

  async getJson<T>(url: string, opts: { skipCache?: boolean } = {}): Promise<T> {
    const useCache = this.cacheTtlMs > 0 && !opts.skipCache;

    if (useCache) {
      const cached = this.cache.get(url);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value as T;
      }
    }

    const existing = this.inFlight.get(url);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = this.fetchJson<T>(url).then((value) => {
      this.inFlight.delete(url);
      if (useCache) {
        this.cache.set(url, { value, expiresAt: Date.now() + this.cacheTtlMs });
      }
      return value;
    }).catch((err) => {
      this.inFlight.delete(url);
      throw err;
    });

    this.inFlight.set(url, promise);
    return promise;
  }

  /** Clears all cached responses. */
  clearCache(): void {
    this.cache.clear();
  }

  private async fetchJson<T>(url: string): Promise<T> {
    let response: Response;
    try {
      response = await this.fetchImpl(url, this.requestInit);
    } catch (err) {
      throw new Error(`afreumtoolkits: network request to ${url} failed: ${(err as Error).message}`);
    }

    if (!response.ok) {
      throw new Error(
        `afreumtoolkits: request to ${url} failed with status ${response.status} ${response.statusText}`
      );
    }

    try {
      return (await response.json()) as T;
    } catch (err) {
      throw new Error(`afreumtoolkits: failed to parse JSON from ${url}: ${(err as Error).message}`);
    }
  }
}
