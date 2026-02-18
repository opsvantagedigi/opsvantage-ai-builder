import process from 'node:process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { SignJWT } from 'jose';
import { Plan, PrismaClient } from '@prisma/client';

type Result = {
  name: string;
  passed: boolean;
  details: string;
};

const prisma = new PrismaClient();
const results: Result[] = [];
const cookieJar = new Map<string, string>();

const baseUrl = (process.env.INTERNAL_LOGIC_BASE_URL || 'http://127.0.0.1:4010').replace(/\/$/, '');
const timestamp = Date.now();
const testEmail = `zenith.internal.${timestamp}@opsvantagedigital.online`;
const testPassword = 'Passw0rd!';
const workspaceName = `Zenith Workspace ${timestamp}`;
const REQUEST_TIMEOUT_MS = Number(process.env.INTERNAL_LOGIC_TIMEOUT_MS || 20000);
const logPath = process.env.INTERNAL_LOGIC_LOG_PATH || 'internal-logic-pass.log';

function logLine(message: string) {
  appendFileSync(logPath, `${new Date().toISOString()} ${message}\n`);
}

function record(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${name} - ${details}`);
  logLine(`[${status}] ${name} - ${details}`);
}

function getSetCookies(headers: Headers): string[] {
  const typedHeaders = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof typedHeaders.getSetCookie === 'function') {
    return typedHeaders.getSetCookie();
  }

  const cookieHeader = headers.get('set-cookie');
  if (!cookieHeader) {
    return [];
  }

  return cookieHeader.split(/,(?=[^;]+=)/);
}

function storeCookies(headers: Headers) {
  for (const cookie of getSetCookies(headers)) {
    const [pair] = cookie.split(';');
    const separator = pair.indexOf('=');
    if (separator <= 0) {
      continue;
    }
    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    cookieJar.set(name, value);
  }
}

function getCookieHeader() {
  return [...cookieJar.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
}

async function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const cookie = getCookieHeader();
  if (cookie) {
    headers.set('cookie', cookie);
  }

  const response = await fetchWithTimeout(`${baseUrl}${path}`, {
    redirect: 'manual',
    ...init,
    headers,
  });

  storeCookies(response.headers);
  return response;
}

async function parseJson(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text) as any;
  } catch {
    return { raw: text };
  }
}

function sessionCookiePresent() {
  return [...cookieJar.keys()].some((name) => name.includes('session-token'));
}

async function fetchWithTimeout(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function run() {
  writeFileSync(logPath, '');
  logLine('Starting internal logic pass');
  console.log(`\n[Zenith Internal Logic] Base URL: ${baseUrl}`);
  console.log(`[Zenith Internal Logic] Test user: ${testEmail}\n`);

  let projectId: string | null = null;
  let subdomain: string | null = null;

  const unauthDashboard = await fetchWithTimeout(`${baseUrl}/dashboard`, { redirect: 'manual' });
  const unauthLocation = unauthDashboard.headers.get('location') || '';
  const unauthRedirectPass =
    [302, 303, 307, 308].includes(unauthDashboard.status) &&
    (unauthLocation.includes('/login') || unauthLocation.includes('/api/auth/signin') || unauthLocation.includes('/auth/signin'));
  record('Protected route redirect (/dashboard)', unauthRedirectPass, `status=${unauthDashboard.status}, location=${unauthLocation || 'none'}`);

  const registerResponse = await request('/api/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const registerBody = await parseJson(registerResponse);
  record('First-in registration', registerResponse.status === 200 && registerBody.ok === true, `status=${registerResponse.status}`);

  const registeredUser = await prisma.user.findFirst({
    where: { email: testEmail, deletedAt: null },
    select: { id: true },
  });

  if (!registeredUser) {
    throw new Error('Registered user not found in database');
  }

  const csrfResponse = await request('/api/auth/csrf');
  const csrfBody = await parseJson(csrfResponse);
  const csrfToken = csrfBody?.csrfToken;
  record('CSRF handshake', csrfResponse.status === 200 && !!csrfToken, `status=${csrfResponse.status}`);

  if (!csrfToken) {
    throw new Error('Unable to continue without CSRF token');
  }

  const loginForm = new URLSearchParams({
    csrfToken,
    email: testEmail,
    password: testPassword,
    callbackUrl: `${baseUrl}/dashboard`,
    json: 'true',
  });

  const loginResponse = await request('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: loginForm.toString(),
  });
  const loginBody = await parseJson(loginResponse);
  record(
    'Credentials login',
    sessionCookiePresent() && [200, 302].includes(loginResponse.status),
    `status=${loginResponse.status}, sessionCookie=${sessionCookiePresent()}, url=${loginBody?.url || 'n/a'}`,
  );

  const sessionResponse = await request('/api/auth/session');
  const sessionBody = await parseJson(sessionResponse);
  record(
    'Session persistence API (/api/auth/session)',
    sessionResponse.status === 200 && sessionBody?.user?.email === testEmail,
    `status=${sessionResponse.status}, email=${sessionBody?.user?.email || 'none'}`,
  );

  const dashboardFirst = await request('/dashboard');
  const dashboardSecond = await request('/dashboard');
  const dashboardSessionPass = dashboardFirst.status === 200 && dashboardSecond.status === 200;
  record('Session persistence on refresh (/dashboard twice)', dashboardSessionPass, `first=${dashboardFirst.status}, second=${dashboardSecond.status}`);

  if (!dashboardSessionPass) {
    // Compatibility bridge for code paths that verify plain HS256 JWT via jwtVerify.
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret');
    const compatibilityToken = await new SignJWT({ email: testEmail })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(registeredUser.id)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);

    cookieJar.set('next-auth.session-token', compatibilityToken);

    const bridgedDashboard = await request('/dashboard');
    record(
      'Auth bridge token for custom jwtVerify paths',
      bridgedDashboard.status === 200,
      `status=${bridgedDashboard.status}`,
    );
  }

  const createWorkspaceResponse = await request('/api/workspaces', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: workspaceName }),
  });
  const workspaceBody = await parseJson(createWorkspaceResponse);
  const workspaceId = workspaceBody?.id as string | undefined;
  record(
    'Workspace initialization POST (/api/workspaces)',
    createWorkspaceResponse.status === 201 && !!workspaceId,
    `status=${createWorkspaceResponse.status}, workspaceId=${workspaceId || 'none'}`,
  );

  const listWorkspaceResponse = await request('/api/workspaces');
  const listWorkspaceBody = await parseJson(listWorkspaceResponse);
  const workspaceVisible = Array.isArray(listWorkspaceBody) && listWorkspaceBody.some((item: any) => item.id === workspaceId);
  record(
    'Workspace listing reflects new workspace',
    listWorkspaceResponse.status === 200 && workspaceVisible,
    `status=${listWorkspaceResponse.status}, visible=${workspaceVisible}`,
  );

  if (workspaceId) {
    const workspaceSettingsResponse = await request(`/${workspaceId}/settings`);
    record(
      'Workspace redirect target loads (/{workspaceId}/settings)',
      workspaceSettingsResponse.status === 200,
      `status=${workspaceSettingsResponse.status}`,
    );
  }

  await prisma.workspace.updateMany({
    where: {
      members: {
        some: {
          userId: registeredUser.id,
        },
      },
    },
    data: {
      plan: Plan.PRO,
      stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const onboardingPayload = {
    businessName: `Zenith Internal ${timestamp}`,
    businessType: 'SaaS',
    industry: 'Technology',
    description: 'Internal logic pass onboarding flow',
  };

  const onboardingResponse = await request('/api/onboarding', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(onboardingPayload),
  });
  const onboardingBody = await parseJson(onboardingResponse);
  const onboardingProjectId = onboardingBody?.projectId as string | undefined;
  record(
    'Big Bang onboarding POST (/api/onboarding)',
    onboardingResponse.status === 200 && !!onboardingProjectId,
    `status=${onboardingResponse.status}, projectId=${onboardingProjectId || 'none'}`,
  );

  if (onboardingProjectId) {
    projectId = onboardingProjectId;
  } else {
    const fallbackProject = await prisma.project.findFirst({
      where: {
        workspace: {
          members: {
            some: {
              userId: registeredUser.id,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    projectId = fallbackProject?.id || null;
  }

  if (!projectId) {
    throw new Error('No project available for publish flow validation');
  }

  const proPrice = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || 'price_1SyXuBRD8J1UDSoidBgW5Ifn';
  subdomain = `zenith-${timestamp}`;

  await prisma.user.update({
    where: { id: registeredUser.id },
    data: {
      subscriptionStatus: 'active',
      stripePriceId: proPrice,
      stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sitesPublished: 0,
      aiGenerationsUsed: 0,
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: {
      subdomain,
      published: false,
      publishedAt: null,
      content: {
        siteConfig: {
          title: 'Zenith Internal Site',
          description: 'Publish flow verification',
          theme: 'futuristic',
        },
        pages: [
          {
            id: 'home',
            name: 'Home',
            sections: [
              {
                id: 'hero-1',
                type: 'hero',
                content: {
                  headline: 'Zenith Publish Validation',
                  subheadline: 'End-to-end publish check for Cloud Run runtime.',
                  ctaText: 'Start',
                  ctaLink: '#',
                  image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1600&auto=format&fit=crop',
                },
              },
            ],
          },
        ],
      },
    },
  });

  const browser = await chromium.launch({ headless: true });
  logLine('Playwright browser launched');
  const context = await browser.newContext();
  try {
    const host = new URL(baseUrl).hostname;
    const browserSessionCookie = cookieJar.get('next-auth.session-token') || cookieJar.get('__Secure-next-auth.session-token');

    if (!browserSessionCookie) {
      throw new Error('No session token available for browser context');
    }

    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: browserSessionCookie,
        domain: host,
        path: '/',
        secure: false,
        httpOnly: false,
        sameSite: 'Lax',
      },
    ]);

    const page = await context.newPage();
    logLine('Opening builder page');
    await page.goto(`${baseUrl}/dashboard/${projectId}/builder`, { waitUntil: 'networkidle' });
    logLine('Builder page loaded');

    const publishButton = page.getByRole('button', { name: 'Publish' });
    const upgradeButton = page.getByRole('button', { name: 'Upgrade to Publish' });

    let publishAvailable = false;
    try {
      await publishButton.waitFor({ timeout: 20000 });
      publishAvailable = await publishButton.isVisible();
    } catch {
      publishAvailable = false;
    }

    const upgradeVisible = await upgradeButton.isVisible().catch(() => false);
    record(
      'Publish CTA state in builder',
      publishAvailable && !upgradeVisible,
      `publishVisible=${publishAvailable}, upgradeVisible=${upgradeVisible}`,
    );

    let dialogMessage = '';
    if (publishAvailable) {
      const dialogPromise = page.waitForEvent('dialog', { timeout: 20000 }).catch(() => null);
      await publishButton.click();
      const dialog = await dialogPromise;
      if (dialog) {
        dialogMessage = dialog.message();
        await dialog.accept();
      }
    }

    const publishedProject = await prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      select: { published: true, publishedAt: true, subdomain: true },
    });

    const publishStatePass = Boolean(publishedProject?.published && publishedProject.publishedAt);
    record(
      'Publish flow updates database state',
      publishStatePass,
      `published=${publishedProject?.published}, publishedAt=${publishedProject?.publishedAt ? 'set' : 'none'}, dialog=${dialogMessage || 'none'}`,
    );

    const publicSiteId = publishedProject?.subdomain || subdomain;
    const publicResponse = await fetchWithTimeout(`${baseUrl}/api/sites/${encodeURIComponent(publicSiteId || '')}`);
    record(
      'Published site exposed via public API',
      publicResponse.status === 200,
      `status=${publicResponse.status}, siteId=${publicSiteId}`,
    );

    const adminResponse = await fetchWithTimeout(`${baseUrl}/admin/marz-console`, { redirect: 'manual' });
    record(
      'Admin route server-side protection',
      [302, 303, 307, 308, 401, 403].includes(adminResponse.status),
      `status=${adminResponse.status}`,
    );

    const adminPage = await context.newPage();
    await adminPage.goto(`${baseUrl}/admin/marz-console`, { waitUntil: 'networkidle' });
    const deniedVisible = await adminPage.getByText('ACCESS DENIED').isVisible().catch(() => false);
    record('Admin UI denies non-admin session by default', deniedVisible, `deniedVisible=${deniedVisible}`);

    await adminPage.addInitScript((email) => {
      window.localStorage.setItem('user_email', email);
    }, 'ajay.sidal@opsvantagedigital.online');
    await adminPage.goto(`${baseUrl}/admin/marz-console`, { waitUntil: 'networkidle' });
    const bypassVisible = await adminPage.getByText('MARZ_OPERATOR').isVisible().catch(() => false);
    record('Admin UI resists localStorage spoofing', !bypassVisible, `bypassVisible=${bypassVisible}`);
  } finally {
    await context.close();
    await browser.close();
  }

  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;

  console.log(`\n[Zenith Internal Logic] Summary: ${passed}/${results.length} checks passed.`);
  if (failed > 0) {
    console.log('[Zenith Internal Logic] Failed checks:');
    for (const result of results.filter((result) => !result.passed)) {
      console.log(` - ${result.name}: ${result.details}`);
    }
    process.exitCode = 1;
  }
}

run()
  .catch((error) => {
    console.error('[Zenith Internal Logic] Fatal error', error);
    logLine(`[FATAL] ${String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
