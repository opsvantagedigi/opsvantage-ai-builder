import { openProvider } from "./client";

/**
 * Centralized data provider that maps OpenProvider endpoint categories.
 *
 * Important: This module returns the *data* shape that the app's services pages
 * already expect (e.g. `{ results: [...] }`), not the full OpenProvider envelope.
 */

type ResultsEnvelope<T> = { results?: T[]; total?: number };

// Domain-related endpoints
export const domainCatalog = {
  /**
   * Check domain availability (OpenProvider: POST /v1beta/domains/check)
   */
  checkDomain: async (name: string, extension: string) => {
    const response = await openProvider.checkDomain(name, extension);
    return response.data;
  },

  /**
   * Suggest domain names based on a keyword (OpenProvider: POST /v1beta/domains/suggest-name)
   */
  suggestNames: async (name: string, tlds: string[], options: { maxResults?: number } = {}) => {
    const response = await openProvider.suggestDomainNames(name, tlds, options.maxResults ?? 10);
    return response.data;
  },
};

// SSL-related endpoints
export const sslCatalog = {
  /**
   * Get SSL products catalog (OpenProvider: GET /v1beta/ssl/products)
   */
  getProducts: async (): Promise<ResultsEnvelope<Record<string, unknown>>> => {
    const response = await openProvider.getSSLProducts();
    return response.data;
  },
};

// License-related endpoints
export const licenseCatalog = {
  /**
   * Get license items (OpenProvider: GET /v1beta/licenses/items)
   */
  getItems: async (): Promise<ResultsEnvelope<Record<string, unknown>>> => {
    const response = await openProvider.getLicenseItems();
    return response.data;
  },
};

// Security-related endpoints (SpamExpert)
export const securityCatalog = {
  /**
   * Generate SpamExpert login URL (OpenProvider: POST /v1beta/spam-expert/generate-login-url)
   */
  generateLoginUrl: async (domainOrEmail: string, bundle = false) => {
    const response = await openProvider.generateSpamExpertLoginUrl(domainOrEmail, bundle);
    return response.data;
  },
};

// Combined catalog for easy access
export const catalog = {
  domains: domainCatalog,
  ssl: sslCatalog,
  licenses: licenseCatalog,
  security: securityCatalog
};

export default catalog;