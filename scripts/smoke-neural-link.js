// Usage:
// node scripts/smoke-neural-link.js https://your-prod-url
// Optional env:
// - COOKIE_HEADER: existing cookie header value for authenticated calls
// - LOGIN_PAYLOAD: JSON for credentials callback (e.g. {"email":"...","password":"..."})

const [, , baseArg] = process.argv;
const BASE = (baseArg || process.env.PROD_URL || "").replace(/\/$/, "");

if (!BASE) {
  console.error("Usage: node scripts/smoke-neural-link.js https://your-prod-url");
  process.exit(1);
}

async function readBody(res) {
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    return res.json().catch(() => null);
  }
  return res.text().catch(() => "");
}

async function loginAndGetCookie() {
  const payloadText = process.env.LOGIN_PAYLOAD;
  if (!payloadText) return null;

  let payload;
  try {
    payload = JSON.parse(payloadText);
  } catch {
    console.error("Invalid LOGIN_PAYLOAD JSON");
    process.exit(2);
  }

  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const csrfBody = await csrfRes.json().catch(() => null);
  const csrfToken = csrfBody?.csrfToken || csrfBody?.csrf_token;
  if (!csrfToken) {
    console.error("Unable to fetch csrf token.");
    return null;
  }

  const form = new URLSearchParams();
  form.append("csrfToken", csrfToken);
  Object.keys(payload).forEach((key) => form.append(key, String(payload[key])));

  const callbackRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    redirect: "manual",
  });

  const rawSetCookie = callbackRes.headers.get("set-cookie");
  if (!rawSetCookie) return null;
  return rawSetCookie
    .split(/,(?=[^;]+=)/)
    .map((part) => part.split(";")[0])
    .join("; ");
}

async function callNeuralLink(cookieHeader) {
  const headers = { "content-type": "application/json" };
  if (cookieHeader) headers.cookie = cookieHeader;

  const res = await fetch(`${BASE}/api/marz/neural-link`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      text: "Neural link scripted smoke test.",
      voice: "NZ-Aria",
    }),
  });

  const body = await readBody(res);
  const contentType = res.headers.get("content-type") || "";
  const engine = res.headers.get("x-marz-engine") || "";
  const speech = res.headers.get("x-marz-text") || "";
  const auth = res.headers.get("x-zenith-authorized") || "";

  return {
    status: res.status,
    contentType,
    engine,
    speech,
    authorizedHeader: auth,
    body,
  };
}

async function main() {
  console.log(`Base: ${BASE}`);

  const health = await fetch(`${BASE}/api/health/prod-check`);
  console.log(`Health: ${health.status}`);

  const heartbeat = await fetch(`${BASE}/api/marz/heartbeat`);
  console.log(`Heartbeat: ${heartbeat.status}`);

  console.log("\n[1] Unauthenticated neural-link call");
  const unauth = await callNeuralLink(null);
  console.log(JSON.stringify(unauth, null, 2));

  const cookieFromEnv = process.env.COOKIE_HEADER || null;
  const cookieFromLogin = await loginAndGetCookie();
  const cookieHeader = cookieFromEnv || cookieFromLogin;

  if (!cookieHeader) {
    console.log("\n[2] Authenticated neural-link call skipped (no COOKIE_HEADER or usable LOGIN_PAYLOAD)");
    return;
  }

  console.log("\n[2] Authenticated neural-link call");
  const authResult = await callNeuralLink(cookieHeader);
  console.log(JSON.stringify(authResult, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(99);
});
