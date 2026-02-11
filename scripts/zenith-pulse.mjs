#!/usr/bin/env node

import process from 'node:process';
import { performance } from 'node:perf_hooks';

const argBase = process.argv.find((arg) => arg.startsWith('--base='))?.split('=')[1];
const baseUrl = (argBase || process.env.ZENITH_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const timeoutMs = Number(process.env.ZENITH_TIMEOUT_MS || 12000);

const routes = [
  '/',
  '/home',
  '/coming-soon',
  '/pricing',
  '/docs',
  '/ai-architect',
  '/enterprise',
  '/showcase',
  '/services/domains',
  '/services/cloud-hosting',
  '/services/professional-email',
  '/services/ssl-security',
  '/tools/business-name-generator',
  '/tools/logo-maker',
  '/tools/slogan-ai',
  '/onboarding',
  '/onboarding/wizard',
  '/legal',
  '/privacy',
  '/terms',
  '/security',
  '/legal/privacy',
  '/legal/terms',
  '/legal/security',
  '/login',
  '/register',
];

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      redirect: 'manual',
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

console.log(`[Zenith Pulse] Starting route audit against ${baseUrl}`);

const results = [];
for (const route of routes) {
  const url = `${baseUrl}${route}`;
  const startedAt = performance.now();

  try {
    const response = await fetchWithTimeout(url);
    const duration = Math.round(performance.now() - startedAt);

    const ok = response.status >= 200 && response.status < 400;
    results.push({ route, status: response.status, ok, duration });
    console.log(`[${ok ? 'PASS' : 'FAIL'}] ${response.status} ${route} (${duration}ms)`);
  } catch (error) {
    const duration = Math.round(performance.now() - startedAt);
    results.push({ route, status: 0, ok: false, duration, error: String(error) });
    console.log(`[FAIL] ERR ${route} (${duration}ms)`);
  }
}

const failed = results.filter((result) => !result.ok);
const passCount = results.length - failed.length;

console.log(`\n[Zenith Pulse] ${passCount}/${results.length} routes healthy.`);

if (failed.length > 0) {
  console.log('[Zenith Pulse] Failed routes:');
  for (const item of failed) {
    if (item.error) {
      console.log(` - ${item.route}: ${item.error}`);
    } else {
      console.log(` - ${item.route}: HTTP ${item.status}`);
    }
  }
  process.exit(1);
}

console.log('[Zenith Pulse] All route checks passed.');
