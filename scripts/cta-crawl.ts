import { JSDOM } from 'jsdom';

type LinkCheck = {
  pageUrl: string;
  text: string;
  href: string;
  kind: CtaAnchor['kind'];
  needsFinalCheck: boolean;
  httpStatus?: number | null;
};

type Report = {
  startedAt: string;
  finishedAt: string;
  baseUrl: string;
  pagesVisited: number;
  needsFinalCheck: LinkCheck[];
};

function resolveBaseUrl(): string {
  const argBase = process.argv.find((arg) => arg.startsWith('--base='))?.split('=')[1];
  const base = (argBase || process.env.UAT_BASE_URL || process.env.APP_URL || '').trim();
  if (!base) {
    throw new Error('Missing base URL. Provide --base=https://... or set UAT_BASE_URL');
  }
  return base.replace(/\/$/, '');
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} for ${url}`);
  }
  return await res.text();
}

function parseSitemapUrls(xml: string): string[] {
  const urls: string[] = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml))) {
    const u = match[1]?.trim();
    if (u) urls.push(u);
  }
  return Array.from(new Set(urls));
}

type CtaAnchor = {
  pageUrl: string;
  text: string;
  href: string;
  kind: 'internal' | 'external' | 'mailto' | 'tel' | 'hash' | 'javascript' | 'unknown';
};

function classifyHref(origin: string, rawHref: string): { hrefAbs: string; kind: CtaAnchor['kind'] } {
  const href = (rawHref || '').trim();
  const lower = href.toLowerCase();
  if (!href) return { hrefAbs: '', kind: 'unknown' };
  if (lower.startsWith('mailto:')) return { hrefAbs: href, kind: 'mailto' };
  if (lower.startsWith('tel:')) return { hrefAbs: href, kind: 'tel' };
  if (lower.startsWith('javascript:')) return { hrefAbs: href, kind: 'javascript' };
  if (lower.startsWith('#')) return { hrefAbs: href, kind: 'hash' };

  try {
    const u = new URL(href, origin);
    if (u.origin === origin) {
      u.hash = '';
      return { hrefAbs: u.toString(), kind: 'internal' };
    }
    return { hrefAbs: u.toString(), kind: 'external' };
  } catch {
    return { hrefAbs: href, kind: 'unknown' };
  }
}

async function checkInternalStatus(url: string): Promise<{ status: number | null; ok: boolean }> {
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store', redirect: 'manual' });
    const status = res.status;
    return { status, ok: status >= 200 && status < 400 };
  } catch {
    return { status: null, ok: false };
  }
}

function normalizeText(value: string): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function extractCtasFromHtml(pageUrl: string, html: string): {
  anchors: Array<{ text: string; href: string }>;
  buttons: Array<{ text: string; type: string; hasForm: boolean }>;
} {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const anchors: Array<{ text: string; href: string }> = [];
  for (const a of Array.from(doc.querySelectorAll('a'))) {
    const href = (a.getAttribute('href') || '').trim();
    const text =
      normalizeText((a as unknown as HTMLElement).textContent || '') ||
      normalizeText(a.getAttribute('aria-label') || '') ||
      normalizeText(a.getAttribute('title') || '');

    if (!text) continue;
    if (!href) continue;
    anchors.push({ text, href });
  }

  const buttons: Array<{ text: string; type: string; hasForm: boolean }> = [];
  for (const b of Array.from(doc.querySelectorAll('button'))) {
    const text =
      normalizeText((b as unknown as HTMLElement).textContent || '') ||
      normalizeText(b.getAttribute('aria-label') || '') ||
      normalizeText(b.getAttribute('title') || '');
    if (!text) continue;

    const type = (b.getAttribute('type') || '').toLowerCase();
    const hasForm = Boolean((b as any).form);
    buttons.push({ text, type, hasForm });
  }

  return { anchors, buttons };
}

async function main() {
  const startedAt = new Date().toISOString();
  const baseUrl = resolveBaseUrl();
  const origin = new URL(baseUrl).origin;

  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const sitemapXml = await fetchText(sitemapUrl);
  const pageUrls = parseSitemapUrls(sitemapXml)
    // Do not filter by origin: many deploys emit canonical domain locs.
    .map((u) => u.replace(/\/$/, ''))
    .sort();

  const needsFinalCheck: LinkCheck[] = [];

  for (const pageUrl of pageUrls) {
    let html = '';
    try {
      html = await fetchText(pageUrl);
    } catch {
      // If a page doesn't load, it must be checked.
      needsFinalCheck.push({
        pageUrl,
        text: 'PAGE_LOAD_FAILED',
        href: pageUrl,
        kind: 'internal',
        needsFinalCheck: true,
        httpStatus: null,
      });
      continue;
    }

    const pageOrigin = new URL(pageUrl).origin;
    const { anchors, buttons } = extractCtasFromHtml(pageUrl, html);

    for (const a of anchors) {
      const { hrefAbs, kind } = classifyHref(pageOrigin, a.href);
      if (!hrefAbs) continue;

      if (kind !== 'internal') {
        needsFinalCheck.push({ pageUrl, text: a.text, href: hrefAbs, kind, needsFinalCheck: true });
        continue;
      }

      // Internal: check status best-effort.
      const result = await checkInternalStatus(hrefAbs);
      if (!result.ok) {
        needsFinalCheck.push({
          pageUrl,
          text: a.text,
          href: hrefAbs,
          kind,
          needsFinalCheck: true,
          httpStatus: result.status,
        });
      }
    }

    for (const b of buttons) {
      const isSubmit = b.type === 'submit' || (b.type === '' && b.hasForm);
      if (isSubmit) continue;
      // Buttons have no href target in static HTML; they require manual verification.
      needsFinalCheck.push({
        pageUrl,
        text: b.text,
        href: '<button>',
        kind: 'unknown',
        needsFinalCheck: true,
      });
    }
  }

  // Deduplicate by (pageUrl,text,href)
  const seen = new Set<string>();
  const deduped: LinkCheck[] = [];
  for (const item of needsFinalCheck) {
    const key = `${item.pageUrl}|||${item.text}|||${item.href}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  const finishedAt = new Date().toISOString();
  const report: Report = {
    startedAt,
    finishedAt,
    baseUrl,
    pagesVisited: pageUrls.length,
    needsFinalCheck: deduped,
  };

  const outPath = 'reports/cta-link-checks.json';
  await (await import('node:fs/promises')).mkdir('reports', { recursive: true });
  await (await import('node:fs/promises')).writeFile(outPath, JSON.stringify(report, null, 2) + '\n', 'utf-8');

  // Print a concise list to stdout (sorted)
  const sorted = [...deduped].sort((a, b) => a.pageUrl.localeCompare(b.pageUrl) || a.text.localeCompare(b.text));
  console.log(`CTA link-check list written to ${outPath}`);
  console.log(`Pages visited: ${pageUrls.length}`);
  console.log(`CTAs needing final link check: ${sorted.length}`);
  for (const item of sorted) {
    const status = typeof item.httpStatus === 'number' ? ` status=${item.httpStatus}` : '';
    console.log(`- [${item.pageUrl}] ${item.text} -> ${item.href}${status}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
