import { test, expect } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import {
  LEGAL_LINKS,
  MARKETING_NAV,
  PRODUCT_LINKS,
  RESOURCE_LINKS,
  TOOL_LINKS,
} from '../src/lib/site-config';

type Issue =
  | {
      type: 'http_status_not_200';
      url: string;
      status: number | null;
    }
  | {
      type: 'missing_header';
      url: string;
    }
  | {
      type: 'missing_footer';
      url: string;
    }
  | {
      type: 'missing_menu_items';
      url: string;
      location: 'header' | 'footer';
      missing: string[];
    }
  | {
      type: 'invalid_click_target';
      url: string;
      tag: 'a' | 'button';
      reason: string;
      text: string;
      htmlSnippet: string;
    }
  | {
      type: 'console_error';
      url: string;
      message: string;
    }
  | {
      type: 'page_error';
      url: string;
      message: string;
    }
  | {
      type: 'missing_asset';
      url: string;
      assetUrl: string;
      status: number;
      resourceType: string;
    };

type PageResult = {
  url: string;
  ok: boolean;
  status: number | null;
  issues: Issue[];
};

type Report = {
  startedAt: string;
  finishedAt: string;
  baseUrl: string;
  homepage: string;
  urlsDiscovered: number;
  urlsVisited: number;
  pages: PageResult[];
  issues: Issue[];
};

function resolveBaseUrl(): string {
  const base =
    process.env.UAT_BASE_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  return base.replace(/\/$/, '');
}

function normalizeInternalUrl(origin: string, href: string): string | null {
  const trimmed = (href || '').trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('javascript:')) return null;
  if (lower.startsWith('#')) return null;

  try {
    const u = new URL(trimmed, origin);
    if (u.origin !== origin) return null;

    // Ignore API routes and obvious non-pages
    if (u.pathname.startsWith('/api/')) return null;

    u.hash = '';
    return u.toString().replace(/\/$/, '') || origin;
  } catch {
    return null;
  }
}

function expectedHeaderLabels(): string[] {
  return [...MARKETING_NAV.map((i) => i.label), 'Book a Consultation'];
}

function expectedFooterLabels(): string[] {
  return [
    ...PRODUCT_LINKS.map((i) => i.label),
    ...RESOURCE_LINKS.map((i) => i.label),
    ...TOOL_LINKS.map((i) => i.label),
    ...LEGAL_LINKS.map((i) => i.label),
    'ISO 27001 Aligned',
  ];
}

async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeJson(filePath: string, payload: unknown) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
}

test.describe('UAT crawler (homepage internal links)', () => {
  test('crawls and validates all internal URLs discovered from homepage', async ({ page, browser }) => {
    test.setTimeout(20 * 60 * 1000);

    const startedAt = new Date().toISOString();
    const baseUrl = resolveBaseUrl();
    const origin = new URL(baseUrl).origin;
    const homepage = `${baseUrl}/`;

    const reportPath = path.resolve('reports/uat-audit-results.json');

    const pageResults: PageResult[] = [];
    const allIssues: Issue[] = [];

    try {
      // 1) Start from homepage; collect internal <a> URLs
      await page.goto(homepage, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);

      const hrefs = await page.$$eval('a', (anchors) => anchors.map((a) => (a as HTMLAnchorElement).getAttribute('href') || ''));
      const discovered = new Set<string>();
      for (const href of hrefs) {
        const normalized = normalizeInternalUrl(origin, href);
        if (normalized) discovered.add(normalized);
      }
      // Always include homepage itself
      discovered.add(homepage.replace(/\/$/, ''));

      const urls = Array.from(discovered.values()).sort();

      // 2) Visit each URL and validate
      for (const url of urls) {
        const p = await browser.newPage();

        // Detect real click handlers (React attaches via addEventListener, not inline attributes).
        await p.addInitScript(() => {
          const w = window as any;
          if (w.__uatClickHookInstalled) return;
          w.__uatClickHookInstalled = true;

          const original = EventTarget.prototype.addEventListener;
          EventTarget.prototype.addEventListener = function (type: any, listener: any, options: any) {
            try {
              if (type === 'click' && this && (this as any).nodeType === 1) {
                (this as any).__uatHasClickListener = true;
              }
            } catch {
              // ignore
            }
            return original.call(this, type, listener, options);
          };
        });

        const issues: Issue[] = [];
        const consoleErrors: string[] = [];
        const pageErrors: string[] = [];
        const missingAssets: Array<{ assetUrl: string; status: number; resourceType: string }> = [];

        p.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        p.on('pageerror', (err) => {
          pageErrors.push(String(err));
        });

        p.on('response', (resp) => {
          const status = resp.status();
          if (status < 400) return;

          const request = resp.request();
          const resourceType = request.resourceType();
          const assetUrl = resp.url();

          // Only flag internal assets to keep signal high
          if (!assetUrl.startsWith(origin)) return;
          if (resourceType === 'document') return;

          missingAssets.push({ assetUrl, status, resourceType });
        });

        let status: number | null = null;
        try {
          const resp = await p.goto(url, { waitUntil: 'domcontentloaded' });
          status = resp?.status() ?? null;

          if (status !== 200) {
            issues.push({ type: 'http_status_not_200', url, status });
          }

          await p.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);

          // Header / Footer visibility
          const header = p.locator('header').first();
          const footer = p.locator('footer').first();

          const headerVisible = await header.isVisible().catch(() => false);
          const footerVisible = await footer.isVisible().catch(() => false);

          if (!headerVisible) issues.push({ type: 'missing_header', url });
          if (!footerVisible) issues.push({ type: 'missing_footer', url });

          if (headerVisible) {
            await header.scrollIntoViewIfNeeded().catch(() => undefined);
            const headerText = (await header.innerText().catch(() => '')).toLowerCase();
            const missing = expectedHeaderLabels().filter((label) => !headerText.includes(label.toLowerCase()));
            if (missing.length) issues.push({ type: 'missing_menu_items', url, location: 'header', missing });
          }

          if (footerVisible) {
            await footer.scrollIntoViewIfNeeded().catch(() => undefined);
            const footerText = (await footer.innerText().catch(() => '')).toLowerCase();
            const missing = expectedFooterLabels().filter((label) => !footerText.includes(label.toLowerCase()));
            if (missing.length) issues.push({ type: 'missing_menu_items', url, location: 'footer', missing });
          }

          // Validate every <a> and <button>
          const invalidTargets = await p.evaluate(() => {
            const maxSnippetLen = 220;
            const normalizeText = (t: string) => (t || '').replace(/\s+/g, ' ').trim();
            const snippet = (el: Element) => {
              const html = (el as HTMLElement).outerHTML || '';
              const oneLine = html.replace(/\s+/g, ' ').trim();
              return oneLine.length <= maxSnippetLen ? oneLine : oneLine.slice(0, maxSnippetLen - 1) + '…';
            };

            const hasClickHandler = (el: any) => {
              // Inline attribute
              const onclickAttr = el.getAttribute?.('onclick') || el.getAttribute?.('onClick');
              if (onclickAttr && String(onclickAttr).trim()) return true;

              // Direct property (rare in React)
              if (typeof el.onclick === 'function') return true;

              // Instrumented addEventListener hook
              if (el.__uatHasClickListener) return true;

              return false;
            };

            const results: Array<{ tag: 'a' | 'button'; reason: string; text: string; htmlSnippet: string }> = [];

            const anchors = Array.from(document.querySelectorAll('a'));
            for (const a of anchors) {
              const href = a.getAttribute('href');
              const text = normalizeText((a as HTMLElement).innerText || (a as HTMLElement).textContent || '');

              const hasRealHref = Boolean(href && href.trim() && href.trim() !== '#' && !href.trim().toLowerCase().startsWith('javascript:'));
              const hasOnclick = hasClickHandler(a as any);

              if (!hasRealHref && !hasOnclick) {
                results.push({ tag: 'a', reason: 'missing href and onClick', text, htmlSnippet: snippet(a) });
              }
            }

            const buttons = Array.from(document.querySelectorAll('button'));
            for (const b of buttons) {
              const typeAttr = (b.getAttribute('type') || '').toLowerCase();
              const text = normalizeText((b as HTMLElement).innerText || (b as HTMLElement).textContent || '');

              const hasOnclick = hasClickHandler(b as any);
              const isSubmit = typeAttr === 'submit' || (typeAttr === '' && Boolean((b as HTMLButtonElement).form));

              if (!hasOnclick && !isSubmit) {
                results.push({ tag: 'button', reason: 'missing onClick (and not a submit button)', text, htmlSnippet: snippet(b) });
              }
            }

            return results;
          });

          for (const target of invalidTargets) {
            issues.push({
              type: 'invalid_click_target',
              url,
              tag: target.tag,
              reason: target.reason,
              text: target.text,
              htmlSnippet: target.htmlSnippet,
            });
          }

          for (const msg of consoleErrors) {
            issues.push({ type: 'console_error', url, message: msg });
          }

          for (const msg of pageErrors) {
            issues.push({ type: 'page_error', url, message: msg });
          }

          for (const asset of missingAssets) {
            issues.push({
              type: 'missing_asset',
              url,
              assetUrl: asset.assetUrl,
              status: asset.status,
              resourceType: asset.resourceType,
            });
          }
        } catch (err) {
          issues.push({ type: 'page_error', url, message: String(err) });
        } finally {
          await p.close().catch(() => undefined);
        }

        const ok = issues.length === 0 && status === 200;
        pageResults.push({ url, ok, status, issues });
        allIssues.push(...issues);
      }

      const finishedAt = new Date().toISOString();
      const report: Report = {
        startedAt,
        finishedAt,
        baseUrl,
        homepage,
        urlsDiscovered: pageResults.length,
        urlsVisited: pageResults.length,
        pages: pageResults,
        issues: allIssues,
      };

      await writeJson(reportPath, report);

      // Fail the test if anything broke.
      expect(allIssues, `UAT audit found ${allIssues.length} issue(s). See reports/uat-audit-results.json`).toEqual([]);
    } finally {
      // Best-effort: always emit a report even if the test fails mid-run.
      const finishedAt = new Date().toISOString();
      const report: Report = {
        startedAt,
        finishedAt,
        baseUrl,
        homepage,
        urlsDiscovered: pageResults.length,
        urlsVisited: pageResults.length,
        pages: pageResults,
        issues: allIssues,
      };
      await writeJson(reportPath, report).catch(() => undefined);
    }
  });
});
