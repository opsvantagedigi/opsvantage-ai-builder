type OpenProviderLoginResponse = {
  code: number;
  data?: {
    token?: string;
  };
  desc?: string;
};

const TOKEN_TTL_MS = 47 * 60 * 60 * 1000;

let tokenCache: { token: string; expiresAt: number } | null = null;

function getConfig() {
  const username = process.env.OPENPROVIDER_USERNAME;
  const password = process.env.OPENPROVIDER_PASSWORD;
  const baseUrl = process.env.OPENPROVIDER_URL || "https://api.openprovider.eu/v1beta";

  if (!username || !password) {
    throw new Error("OpenProvider credentials are not configured.");
  }

  return { username, password, baseUrl };
}

export async function getOpenProviderToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const { username, password, baseUrl } = getConfig();
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password, ip: "0.0.0.0" }),
    cache: "no-store",
  });

  const payload = (await response.json()) as OpenProviderLoginResponse;
  const token = payload?.data?.token;

  if (!response.ok || !token || payload.code !== 0) {
    throw new Error(payload?.desc || "OpenProvider authentication failed.");
  }

  tokenCache = {
    token,
    expiresAt: now + TOKEN_TTL_MS,
  };

  return token;
}
