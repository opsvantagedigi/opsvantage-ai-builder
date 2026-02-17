function parseConfiguredKeys(): string[] {
  const sources = [
    process.env.SOVEREIGN_PASSWORD,
    process.env.ADMIN_BYPASS_PASSWORD,
  ];

  return sources
    .flatMap((value) => String(value ?? "").split(/[\n,]/g))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function isValidSovereignKey(input: string): boolean {
  const normalizedInput = String(input ?? "").trim();
  if (!normalizedInput) return false;

  const configuredKeys = parseConfiguredKeys();
  if (configuredKeys.length === 0) return false;

  return configuredKeys.includes(normalizedInput);
}
