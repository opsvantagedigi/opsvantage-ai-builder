const BASE_URL = process.env.OPENPROVIDER_URL || "https://api.openprovider.eu/v1beta";

/**
 * 🔐 AUTHENTICATION SERVICE
 * Fetches Bearer Token. In production, consider a more persistent server-side cache.
 */
async function getAuthToken(): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.OPENPROVIDER_USERNAME,
        password: process.env.OPENPROVIDER_PASSWORD,
      }),
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`[MARZ] OpenProvider Auth Failed: ${data.desc || res.statusText}`);
    }

    return data.data.token;
  } catch (error) {
    console.error("[MARZ] OpenProvider Authentication Error:", error);
    throw error;
  }
}

/**
 * 🌐 GENERIC FETCH WRAPPER
 * Injects token and handles error parsing.
 */
async function opFetch(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    method,
    headers,
    cache: 'no-store'
  };

  let url = `${BASE_URL}${endpoint}`;

  if (method === 'GET' && body) {
    const params = new URLSearchParams(body);
    url += `?${params.toString()}`;
  } else if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      console.error(`[MARZ] OpenProvider API Error [${res.status}] ${endpoint}:`, data);
    }

    return data;
  } catch (error) {
    console.error(`[MARZ] Network Error on ${endpoint}:`, error);
    throw error;
  }
}

/**
 * 🚀 PUBLIC METHODS (Mapped to OpenProvider v1beta API)
 */
export const openProvider = {
  // 1. Domain Availability & Pricing
  checkDomain: async (name: string, extension: string) => {
    return await opFetch('/domains/check', 'POST', {
      domains: [{ name, extension }],
      with_price: true,
    });
  },

  // 2. Create Customer Handle (Required for purchase)
  createCustomer: async (customerData: any) => {
    return await opFetch('/customers', 'POST', customerData);
  },

  // 3. Register Domain
  createDomain: async (payload: any) => {
    return await opFetch('/domains', 'POST', payload);
  },

  // 4. List SSL Products
  getSSLProducts: async () => {
    return await opFetch('/ssl/products', 'GET', {
      limit: 100,
      with_price: true
    });
  }
};
