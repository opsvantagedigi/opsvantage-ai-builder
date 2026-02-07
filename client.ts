import { unstable_cache } from 'next/cache';

const BASE_URL = process.env.OPENPROVIDER_URL;

/**
 * 1. AUTHENTICATION SERVICE
 * Automatically fetches and caches the Bearer Token.
 */
async function getAuthToken() {
  // Cache token for 4 hours (OpenProvider tokens last a while)
  // In production, use Redis. For MVP, memory/Next cache works.
  return await unstable_cache(async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.OPENPROVIDER_USERNAME,
        password: process.env.OPENPROVIDER_PASSWORD,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`OpenProvider Auth Failed: ${data.desc}`);
    
    return data.data.token;
  }, ['openprovider-token'], { revalidate: 14400 })(); // 4 hours
}

/**
 * 2. GENERIC FETCH WRAPPER
 * Handles headers and token injection automatically.
 */
async function opFetch(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const config: RequestInit = { method, headers };
  if (body && method !== 'GET') config.body = JSON.stringify(body);

  // Parse query params for GET requests if body is passed as params
  let url = `${BASE_URL}${endpoint}`;
  if (method === 'GET' && body) {
    const params = new URLSearchParams(body);
    url += `?${params.toString()}`;
  }

  const res = await fetch(url, config);
  return await res.json();
}

/**
 * 3. DOMAIN SERVICES
 */
export const openProvider = {
  // Check if a domain is free
  checkDomain: async (domainName: string, extension: string) => {
    return await opFetch('/domains/check', 'POST', {
      domains: [{ name: domainName, extension: extension }],
      with_price: true, // We need the cost to calculate our markup
    });
  },

  // Create a Customer Handle (Required before buying a domain)
  createCustomer: async (customerData: any) => {
    return await opFetch('/customers', 'POST', customerData);
  },

  // Fetch SSL products
  getSSLProducts: async () => {
    return await opFetch('/ssl/products', 'GET');
  },
};