import WebSocket from "ws";

type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

type HandshakeResponse = {
  ok: boolean;
  wsUrl?: string;
  stage?: string;
  message?: string | null;
  woke?: boolean;
};

type NeuralMessage =
  | {
      type: "status";
      request_id?: string;
      stage?: string;
      state?: string;
      message?: string;
      [key: string]: unknown;
    }
  | {
      type: "error";
      request_id?: string;
      message?: string;
      [key: string]: unknown;
    }
  | {
      type: "result";
      request_id?: string;
      text?: string;
      audio_b64?: string;
      video_b64?: string;
      audio_format?: string;
      video_format?: string;
      [key: string]: unknown;
    }
  | {
      type: string;
      [key: string]: unknown;
    };

type OnboardingCreateResponse = { ok?: boolean; onboardingId?: string; projectId?: string; error?: string };

type SitemapNode = {
  id?: string;
  title?: string;
  slug?: string;
  type?: string;
  children?: SitemapNode[];
  [key: string]: unknown;
};

type SitemapGenerateResponse = {
  ok?: boolean;
  sitemap?: SitemapNode[];
  aiTaskId?: string;
  error?: string;
};

type PageGenerateResponse = {
  ok?: boolean;
  page?: Record<string, unknown>;
  aiTaskId?: string;
  error?: string;
};

function env(name: string, fallback = "") {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length ? v.trim() : fallback;
}

function resolveAppUrl(): string {
  return (
    env("APP_URL") ||
    env("NEXT_PUBLIC_APP_URL") ||
    "https://opsvantage-ai-builder-xge3xydmha-ez.a.run.app"
  ).replace(/\/$/, "");
}

function resolveNeuralWsUrl(): string {
  const explicit = env("NEURAL_CORE_WS_URL") || env("NEURAL_WS_URL") || env("NEXT_PUBLIC_NEURAL_CORE_WS_URL");
  if (explicit) return explicit;

  const base = env("NEURAL_CORE_URL") || env("NEURAL_URL") || env("NEXT_PUBLIC_NEURAL_CORE_URL") || "https://marz-neural-core-xge3xydmha-ez.a.run.app";
  const trimmed = base.replace(/\/$/, "");
  if (trimmed.startsWith("wss://") || trimmed.startsWith("ws://")) return `${trimmed}/ws/neural-core`;
  if (trimmed.startsWith("https://")) return `wss://${trimmed.slice("https://".length)}/ws/neural-core`;
  if (trimmed.startsWith("http://")) return `ws://${trimmed.slice("http://".length)}/ws/neural-core`;
  return "";
}

function toCookieHeader(): string {
  // This cookie is already treated as a sovereign session via `verifySession()`.
  // Keep it non-secret: it’s an ops lever, not an auth secret.
  return env("ZENITH_ADMIN_COOKIE", "zenith_admin_token=sovereign");
}

async function fetchJson<T extends JsonValue | Record<string, unknown>>(
  url: string,
  init: RequestInit & { label: string; requestId: string },
): Promise<T> {
  const started = Date.now();
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      "x-request-id": init.requestId,
      "cache-control": "no-store",
    },
  });
  const text = await res.text();
  const elapsed = Date.now() - started;

  if (!res.ok) {
    throw new Error(`${init.label} failed: ${res.status} ${res.statusText} (${elapsed}ms) body=${text.slice(0, 500)}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${init.label} returned non-JSON (${elapsed}ms): ${text.slice(0, 200)}`);
  }
}

function clampDescription(input: string, max = 280) {
  const normalized = input.replace(/\s+/g, " ").trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 1)}…`;
}

function flattenSitemap(nodes: SitemapNode[] = []): SitemapNode[] {
  const out: SitemapNode[] = [];
  const visit = (n: SitemapNode) => {
    out.push(n);
    if (Array.isArray(n.children)) n.children.forEach(visit);
  };
  nodes.forEach(visit);
  return out;
}

async function wsChat(params: {
  wsUrl: string;
  origin: string;
  requestId: string;
  text: string;
  timeoutMs: number;
}) {
  const { wsUrl, origin, requestId, text, timeoutMs } = params;

  return await new Promise<{
    requestId: string;
    text: string;
    audioB64Len: number;
    videoB64Len: number;
    audioFormat: string;
    videoFormat: string;
    durationMs: number;
  }>((resolve, reject) => {
    const started = Date.now();
    const ws = new WebSocket(wsUrl, { headers: { Origin: origin } });

    const timeout = setTimeout(() => {
      try {
        ws.close();
      } catch {
        // ignore
      }
      reject(new Error(`[ws] timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timeout);
      try {
        ws.close();
      } catch {
        // ignore
      }
    }

    ws.on("open", () => {
      ws.send(
        JSON.stringify({
          request_id: requestId,
          text,
          client: "opsvantage-ai-builder:first-customer-sim",
          ts: Date.now(),
        }),
      );
    });

    ws.on("message", (data) => {
      const raw = data.toString("utf-8");
      let msg: NeuralMessage;
      try {
        msg = JSON.parse(raw) as NeuralMessage;
      } catch {
        return;
      }

      if (msg.type === "status") {
        const stage = (msg as any).stage || (msg as any).state || "";
        const message = (msg as any).message || "";
        // eslint-disable-next-line no-console
        console.log(`[ws] status${stage ? `/${stage}` : ""}${message ? `: ${message}` : ""}`);
        return;
      }

      if (msg.type === "error") {
        cleanup();
        reject(new Error(`[ws] error: ${(msg as any).message || "unknown"}`));
        return;
      }

      if (msg.type === "result") {
        const audio = typeof (msg as any).audio_b64 === "string" ? ((msg as any).audio_b64 as string) : "";
        const video = typeof (msg as any).video_b64 === "string" ? ((msg as any).video_b64 as string) : "";
        const textOut = typeof (msg as any).text === "string" ? ((msg as any).text as string) : "";

        if (!audio || !video) {
          cleanup();
          reject(new Error(`[ws] FAIL: expected both audio_b64 and video_b64 (audio=${audio.length}, video=${video.length})`));
          return;
        }

        cleanup();
        resolve({
          requestId,
          text: textOut,
          audioB64Len: audio.length,
          videoB64Len: video.length,
          audioFormat: String((msg as any).audio_format || "unknown"),
          videoFormat: String((msg as any).video_format || "unknown"),
          durationMs: Date.now() - started,
        });
      }
    });

    ws.on("error", (err) => {
      cleanup();
      reject(err);
    });

    ws.on("close", () => {
      clearTimeout(timeout);
    });
  });
}

async function main() {
  const appUrl = resolveAppUrl();
  const wsUrl = resolveNeuralWsUrl();
  if (!wsUrl) throw new Error("NEURAL_WS_URL could not be resolved.");

  const requestId = env("REQUEST_ID", `first-customer-${Date.now()}`);
  const origin = env("WS_ORIGIN", appUrl);
  const cookie = toCookieHeader();

  const businessName = env("SIM_BUSINESS_NAME", "KoruOps");
  const businessType = env("SIM_BUSINESS_TYPE", "B2B SaaS");
  const industry = env("SIM_INDUSTRY", "Operations");

  // eslint-disable-next-line no-console
  console.log("[sim] targets", { appUrl, wsUrl, requestId });

  // 1) Warm handshake
  const handshake = await fetchJson<HandshakeResponse>(`${appUrl}/api/ai/handshake`, {
    label: "handshake",
    requestId,
    method: "GET",
    headers: {
      cookie,
      accept: "application/json",
    },
  });
  // eslint-disable-next-line no-console
  console.log("[sim] handshake", handshake);

  // 2) MARZ video chat (audio + video)
  const wsPrompt =
    env(
      "WS_TEXT",
      `You are MARZ. In 1 short paragraph, confirm you understand the following request and reply with a plan: Generate a full 10-page website for ${businessName} (${industry}) with pages: Home, About, Services, Pricing, Case Studies, Blog, Resources, FAQ, Contact, Book a Call. Keep under 200 words.`,
    ) + "";

  const wsResult = await wsChat({
    wsUrl,
    origin,
    requestId: `${requestId}:ws`,
    text: wsPrompt,
    timeoutMs: Number(env("WS_TIMEOUT_MS", "240000")),
  });

  // eslint-disable-next-line no-console
  console.log("[sim] ws result", {
    durationMs: wsResult.durationMs,
    audioB64Len: wsResult.audioB64Len,
    videoB64Len: wsResult.videoB64Len,
    audioFormat: wsResult.audioFormat,
    videoFormat: wsResult.videoFormat,
    textPreview: wsResult.text.slice(0, 180),
  });

  // 3) Create onboarding (so page generation has data)
  const onboardingDescription = clampDescription(
    `MARZ brief: ${wsResult.text || "Build an ops-focused 10-page site."} Website must include exactly 10 pages: Home, About, Services, Pricing, Case Studies, Blog, Resources, FAQ, Contact, Book a Call.`,
    280,
  );

  const onboardingCreate = await fetchJson<OnboardingCreateResponse>(`${appUrl}/api/onboarding`, {
    label: "onboarding:create",
    requestId: `${requestId}:onboarding:create`,
    method: "POST",
    headers: {
      cookie,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      businessName,
      businessType,
      industry,
      description: onboardingDescription,
    }),
  });

  if (!onboardingCreate.projectId) {
    throw new Error(`onboarding:create did not return projectId: ${JSON.stringify(onboardingCreate)}`);
  }

  // eslint-disable-next-line no-console
  console.log("[sim] onboarding created", onboardingCreate);

  // Patch more onboarding fields to make sitemap/pages higher quality.
  await fetchJson<Record<string, unknown>>(`${appUrl}/api/onboarding`, {
    label: "onboarding:patch",
    requestId: `${requestId}:onboarding:patch`,
    method: "PATCH",
    headers: {
      cookie,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      brandVoice: "Sovereign, calm, direct",
      targetAudience: "Founders and operators at growth-stage B2B SaaS",
      colorPalette: "Midnight",
      designStyle: "Bold",
      goals: "Generate qualified leads, pre-sell waitlist, and communicate a 10-page structure for launch readiness.",
      competitors: [],
    }),
  });

  // 4) Generate sitemap (retry once if we don't get >=10 nodes)
  let sitemapResp: SitemapGenerateResponse | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    sitemapResp = await fetchJson<SitemapGenerateResponse>(`${appUrl}/api/sitemap/generate`, {
      label: `sitemap:generate(attempt=${attempt})`,
      requestId: `${requestId}:sitemap:${attempt}`,
      method: "POST",
      headers: {
        cookie,
        accept: "application/json",
      },
    });

    const flat = flattenSitemap(sitemapResp.sitemap || []);
    const uniqueBySlug = new Map<string, SitemapNode>();
    for (const node of flat) {
      const slug = String(node.slug || "").trim();
      if (!slug) continue;
      if (!uniqueBySlug.has(slug)) uniqueBySlug.set(slug, node);
    }

    if (uniqueBySlug.size >= 10) break;

    // If too small, strengthen the goals and retry.
    await fetchJson<Record<string, unknown>>(`${appUrl}/api/onboarding`, {
      label: `onboarding:patch(for-sitemap-retry=${attempt})`,
      requestId: `${requestId}:onboarding:patch:${attempt}`,
      method: "PATCH",
      headers: {
        cookie,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        goals:
          "Return a 10-page sitemap with these pages: Home, About, Services, Pricing, Case Studies, Blog, Resources, FAQ, Contact, Book a Call. Ensure at least 10 unique slugs.",
      }),
    });
  }

  if (!sitemapResp?.sitemap) {
    throw new Error(`sitemap:generate did not return sitemap: ${JSON.stringify(sitemapResp)}`);
  }

  const sitemapNodes = (() => {
    const flat = flattenSitemap(sitemapResp?.sitemap || []);
    const uniqueBySlug = new Map<string, SitemapNode>();
    for (const node of flat) {
      const slug = String(node.slug || "").trim();
      if (!slug) continue;
      if (!uniqueBySlug.has(slug)) uniqueBySlug.set(slug, node);
    }
    return Array.from(uniqueBySlug.values());
  })();

  // eslint-disable-next-line no-console
  console.log("[sim] sitemap", { nodes: sitemapNodes.length, aiTaskId: sitemapResp.aiTaskId });

  if (sitemapNodes.length < 10) {
    throw new Error(`[sim] FAIL: sitemap returned only ${sitemapNodes.length} unique pages (need >=10).`);
  }

  // 5) Generate + save first 10 pages sequentially (avoid AI rate limiting)
  const pagesToGenerate = sitemapNodes.slice(0, 10);
  const generated: Array<{ slug: string; title: string; saved?: boolean }> = [];

  for (const node of pagesToGenerate) {
    const slug = String(node.slug || "").trim();
    const title = String(node.title || slug || "Untitled").trim();

    // eslint-disable-next-line no-console
    console.log(`[sim] generating page: ${slug}`);

    const pageResp = await fetchJson<PageGenerateResponse>(`${appUrl}/api/page/generate`, {
      label: `page:generate(${slug})`,
      requestId: `${requestId}:page:${slug}`,
      method: "POST",
      headers: {
        cookie,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sitemapNode: node,
        prompt: `Use this as the operating brief: ${wsResult.text}`,
      }),
    });

    if (!pageResp.page || typeof pageResp.page !== "object") {
      throw new Error(`[sim] page:generate(${slug}) did not return a page payload.`);
    }

    // Best-effort: save page into Sanity/DB.
    let saved = false;
    try {
      await fetchJson<Record<string, unknown>>(`${appUrl}/api/page/save`, {
        label: `page:save(${slug})`,
        requestId: `${requestId}:page:save:${slug}`,
        method: "POST",
        headers: {
          cookie,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ page: pageResp.page }),
      });
      saved = true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[sim] WARN: page:save(${slug}) failed (continuing):`, err instanceof Error ? err.message : err);
    }

    generated.push({ slug, title, saved });
  }

  // eslint-disable-next-line no-console
  console.log("\n[sim] ✅ PASS: First Customer simulation complete");
  // eslint-disable-next-line no-console
  console.log("[sim] summary", {
    appUrl,
    wsUrl,
    handshakeOk: handshake.ok,
    wsAudioB64Len: wsResult.audioB64Len,
    wsVideoB64Len: wsResult.videoB64Len,
    pagesGenerated: generated.length,
    pagesSaved: generated.filter((p) => p.saved).length,
    slugs: generated.map((p) => p.slug),
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("\n[sim] ❌ FAIL", err);
  process.exitCode = 1;
});
