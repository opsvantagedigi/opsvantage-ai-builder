import { test, expect } from '@playwright/test';
import { spawn } from 'child_process';

test.describe('Generate + Save flow (script)', () => {
  test('runs scripts/test-save-flow.ts and saves a page', async () => {
    test.setTimeout(120000);

    const proc = spawn('npx', ['tsx', 'scripts/test-save-flow.ts'], { shell: true });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      // also log to Playwright output for debugging
      console.log(data.toString());
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(data.toString());
    });

    const exitCode: number = await new Promise((resolve) => {
      proc.on('close', (code) => resolve(code ?? 0));
    });

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Saved page:');
    // If there was any stderr, fail with it for visibility
    expect(stderr).toBe('');
  });
});
