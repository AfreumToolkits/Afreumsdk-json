import { HttpClient } from "./http.js";
import { GEO_FILES } from "./constants.js";
import type {
  AfreumCity,
  AfreumCountry,
  AfreumProvince,
  AfreumRegion,
  AfreumSubRegion,
} from "./types.js";

/**
 * Wraps the Afreum Ecosystem geo JSON endpoints:
 * https://github.com/Afreum/json#2-geo-country-data
 *
 * Note: the full `cities()` file is ~50MB. Prefer `citiesByProvince()` when you only
 * need cities for a specific province/state, to avoid downloading the entire dataset.
 */
export class GeoResource {
  constructor(private readonly http: HttpClient, private readonly baseUrl: string) {}

  private url(file: string): string {
    return `${this.baseUrl}/${file}`;
  }

  regions(): Promise<AfreumRegion[]> {
    return this.http.getJson<AfreumRegion[]>(this.url(GEO_FILES.region));
  }

  subregions(): Promise<AfreumSubRegion[]> {
    return this.http.getJson<AfreumSubRegion[]>(this.url(GEO_FILES.subregion));
  }

  /** Note: not filtered for sanctioned countries — apply your own compliance filters. */
  countries(): Promise<AfreumCountry[]> {
    return this.http.getJson<AfreumCountry[]>(this.url(GEO_FILES.country));
  }

  /** Note: not filtered for sanctioned countries — apply your own compliance filters. */
  provinces(): Promise<AfreumProvince[]> {
    return this.http.getJson<AfreumProvince[]>(this.url(GEO_FILES.province));
  }

  /**
   * Full city list (~50MB). Prefer `citiesByProvince(provinceId)` unless you
   * genuinely need every city in the ecosystem's dataset at once.
   */
  cities(): Promise<AfreumCity[]> {
    return this.http.getJson<AfreumCity[]>(this.url(GEO_FILES.city));
  }

  /** Cities filtered to a single province/state, fetched as a much smaller per-province file. */
  citiesByProvince(provinceId: number | string): Promise<AfreumCity[]> {
    return this.http.getJson<AfreumCity[]>(this.url(`afr_city_${provinceId}.json`));
  }

  /** Convenience helper: fetches all countries and returns the one matching an ISO2/ISO3 code. */
  async findCountryByIso(code: string): Promise<AfreumCountry | undefined> {
    const countries = await this.countries();
    const target = code.toUpperCase();
    return countries.find(
      (c) => c.iso2.toUpperCase() === target || c.iso3.toUpperCase() === target
    );
  }

  /** Convenience helper: returns only countries flagged `is_africa === "1"`. */
  async africanCountries(): Promise<AfreumCountry[]> {
    const countries = await this.countries();
    return countries.filter((c) => c.is_africa === "1");
  }
}
