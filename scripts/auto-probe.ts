#!/usr/bin/env ts-node
/**
 * Auto-probe: Polls Cloud Build status and triggers neural core handshake when ready.
 */

import { execSync } from 'child_process';

const DASHBOARD_BUILD_ID = '739663bc-e8e8-4488-92a2-687d69597930';
const NEURAL_CORE_BUILD_ID = 'ab70ff24-d239-42c0-a4bd-9194266e5db7';
const POLL_INTERVAL_MS = 15000; // 15 seconds
const MAX_POLL_ATTEMPTS = 40; // 10 minutes max

function runGcloud(args: string[]): string {
  const fullArgs = [...args, '--format=json', '--project=opsvantage-ai-builder'];
  const cmd = `gcloud ${fullArgs.join(' ')}`;
  return execSync(cmd, { encoding: 'utf-8' });
}

function getBuildStatus(buildId: string): { status: string; detail?: string } {
  try {
    const output = runGcloud(['builds', 'describe', buildId]);
    const build = JSON.parse(output);
    return {
      status: build.status || 'UNKNOWN',
      detail: build.statusDetail || build.error?.message,
    };
  } catch (error) {
    return { status: 'ERROR', detail: (error as Error).message };
  }
}

function triggerHandshake(): void {
  console.log('\n🚀 Triggering neural core handshake...\n');
  try {
    const result = execSync('npx ts-node scripts/test-neural-core-handshake.ts', {
      encoding: 'utf-8',
      stdio: 'inherit',
      env: { ...process.env, WS_TIMEOUT_MS: '30000' },
    });
    console.log('\n✅ Handshake completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Handshake failed:', (error as Error).message);
    process.exitCode = 1;
  }
}

async function main() {
  console.log('🔍 Starting auto-probe monitor...\n');
  console.log(`   Dashboard Build: ${DASHBOARD_BUILD_ID}`);
  console.log(`   Neural Core Build: ${NEURAL_CORE_BUILD_ID}`);
  console.log(`   Poll interval: ${POLL_INTERVAL_MS}ms\n`);

  let attempts = 0;

  while (attempts < MAX_POLL_ATTEMPTS) {
    attempts++;
    const timestamp = new Date().toISOString();

    const dashboardStatus = getBuildStatus(DASHBOARD_BUILD_ID);
    const neuralCoreStatus = getBuildStatus(NEURAL_CORE_BUILD_ID);

    console.log(`[${timestamp}] Attempt ${attempts}/${MAX_POLL_ATTEMPTS}`);
    console.log(`   Dashboard: ${dashboardStatus.status}${dashboardStatus.detail ? ` - ${dashboardStatus.detail}` : ''}`);
    console.log(`   Neural Core: ${neuralCoreStatus.status}${neuralCoreStatus.detail ? ` - ${neuralCoreStatus.detail}` : ''}`);

    const bothSuccess = dashboardStatus.status === 'SUCCESS' && neuralCoreStatus.status === 'SUCCESS';
    const eitherFailed = ['FAILURE', 'CANCELLED', 'INTERNAL_ERROR', 'TIMEOUT'].includes(dashboardStatus.status) ||
                         ['FAILURE', 'CANCELLED', 'INTERNAL_ERROR', 'TIMEOUT'].includes(neuralCoreStatus.status);

    if (bothSuccess) {
      console.log('\n✅ Both builds are SUCCESS! Ready to probe.\n');
      triggerHandshake();
      return;
    }

    if (eitherFailed) {
      console.error('\n❌ One or both builds failed. Aborting probe.\n');
      process.exit(1);
    }

    console.log(`   Waiting ${POLL_INTERVAL_MS}ms before next check...\n`);
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  console.error(`\n⏱️  Max poll attempts (${MAX_POLL_ATTEMPTS}) reached. Builds still not ready.\n`);
  process.exit(1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
