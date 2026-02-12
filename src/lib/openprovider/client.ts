import { getOpenProviderToken } from "@/lib/openprovider/auth";

interface DomainCreationPayload {
  domain: { name: string; extension: string };
  period: number;
  owner_handle: string;
  admin_handle: string;
  tech_handle: string;
  name_servers: { name: string }[];
}

type OpenProviderResponse<T> = {
  code: number;
  data: T;
  desc?: string;
};

const OPENPROVIDER_BASE_URL = process.env.OPENPROVIDER_URL || "https://api.openprovider.eu/v1beta";

async function requestOpenProvider<T>(path: string, init: RequestInit = {}, retry = true): Promise<OpenProviderResponse<T>> {
  const token = await getOpenProviderToken();
  const response = await fetch(`${OPENPROVIDER_BASE_URL}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (response.status === 401 && retry) {
    const refreshedToken = await getOpenProviderToken(true);
    const retryResponse = await fetch(`${OPENPROVIDER_BASE_URL}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${refreshedToken}`,
        "content-type": "application/json",
        ...(init.headers || {}),
      },
      cache: "no-store",
    });
    const retryPayload = (await retryResponse.json()) as OpenProviderResponse<T>;
    if (!retryResponse.ok || retryPayload.code !== 0) {
      throw new Error(retryPayload?.desc || "OpenProvider request failed.");
    }
    return retryPayload;
  }

  const payload = (await response.json()) as OpenProviderResponse<T>;
  if (!response.ok || payload.code !== 0) {
    throw new Error(payload?.desc || "OpenProvider request failed.");
  }

  return payload;
}

export const openProvider = {
  async getSSLProducts() {
    return requestOpenProvider<{ results: Array<Record<string, unknown>> }>(
      "/ssl/products?limit=20&offset=0&with_price=true&with_supported_software=true&with_description=true",
      { method: "GET" }
    );
  },

  async getLicenseItems() {
    return requestOpenProvider<{ results: Array<Record<string, unknown>>; total?: number }>(
      "/licenses/items?limit=50&offset=0",
      { method: "GET" }
    );
  },

  async listLicenses() {
    return requestOpenProvider<{ results: Array<Record<string, unknown>>; total?: number }>(
      "/licenses?limit=20&offset=0",
      { method: "GET" }
    );
  },

  async checkDomain(name: string, ext: string) {
    return requestOpenProvider<{
      results: Array<{
        status: string;
        domain: string;
        reason?: string;
        is_premium?: boolean;
        price?: {
          reseller?: { price?: number; currency?: string };
          product?: { price?: number; currency?: string };
        };
      }>;
    }>("/domains/check", {
      method: "POST",
      body: JSON.stringify({ domains: [{ name, extension: ext }], with_price: true }),
    });
  },

  async suggestDomainNames(name: string, tlds: string[], limit = 8) {
    return requestOpenProvider<{
      results: Array<{ domain?: string; name?: string; extension?: string }>;
    }>("/domains/suggest-name", {
      method: "POST",
      body: JSON.stringify({
        name,
        tlds,
        limit,
        language: "eng",
        provider: "namestudio",
        sensitive: true,
      }),
    });
  },

  async generateSpamExpertLoginUrl(domainOrEmail: string, bundle = false) {
    return requestOpenProvider<{ url?: string }>("/spam-expert/generate-login-url", {
      method: "POST",
      body: JSON.stringify({ domain_or_email: domainOrEmail, bundle }),
    });
  },

  async createDomain(payload: DomainCreationPayload) {
    return requestOpenProvider<{ id: string | number }>("/domains", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async createCustomer(data: unknown) {
    return requestOpenProvider<{ handle: string }>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
