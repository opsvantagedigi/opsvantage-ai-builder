const ALLOWED_HOSTS = new Set([
  "api.tavily.com",
  "marz-neural-core-1018462465472.europe-west4.run.app",
  "opsvantage-ai-builder-1018462465472.us-central1.run.app",
]);

export function validateOutboundUrl(url: string): URL {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    throw new Error(`Blocked outbound request: protocol ${parsed.protocol} not allowed.`);
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(`Blocked outbound request: host ${parsed.hostname} is not allowlisted.`);
  }

  return parsed;
}
