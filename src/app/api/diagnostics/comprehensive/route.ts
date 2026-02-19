import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

type DiagnosticResult = {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  details?: Record<string, unknown>;
};

async function checkDatabase(): Promise<DiagnosticResult> {
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    return { name: 'Database', status: 'pass', message: 'PostgreSQL connection OK' };
  } catch (error) {
    return {
      name: 'Database',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

async function checkNeuralCore(): Promise<DiagnosticResult> {
  const neuralCoreUrl = process.env.NEXT_PUBLIC_NEURAL_CORE_URL;
  if (!neuralCoreUrl) {
    return { name: 'Neural Core', status: 'fail', message: 'NEXT_PUBLIC_NEURAL_CORE_URL not configured' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${neuralCoreUrl}/health`, { 
      signal: controller.signal,
      cache: 'no-store' 
    });
    clearTimeout(timeout);

    if (response.ok) {
      return { name: 'Neural Core', status: 'pass', message: `Health check OK (${response.status})` };
    }

    return { name: 'Neural Core', status: 'warn', message: `Health check returned ${response.status}` };
  } catch (error) {
    return {
      name: 'Neural Core',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function checkNextAuth(): Promise<DiagnosticResult> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return { name: 'NextAuth', status: 'fail', message: 'NEXTAUTH_SECRET not configured' };
  }

  if (secret.length < 32) {
    return { name: 'NextAuth', status: 'warn', message: 'NEXTAUTH_SECRET is less than 32 characters' };
  }

  return { name: 'NextAuth', status: 'pass', message: 'Secret configured (length: ' + secret.length + ')' };
}

async function checkMarzAgent(): Promise<DiagnosticResult> {
  try {
    const { MarzAgent } = await import('@/lib/marz/agent-core');
    const agent = new MarzAgent('system-diagnostic');
    const diagnostics = await agent.runSystemDiagnostics();
    return {
      name: 'MARZ Agent',
      status: 'pass',
      message: 'Agent initialized successfully',
      details: diagnostics,
    };
  } catch (error) {
    return {
      name: 'MARZ Agent',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Agent initialization failed',
    };
  }
}

function checkEnvironment(): DiagnosticResult {
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXT_PUBLIC_NEURAL_CORE_URL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return {
      name: 'Environment',
      status: 'fail',
      message: `Missing env vars: ${missing.join(', ')}`,
    };
  }

  return { name: 'Environment', status: 'pass', message: 'All required variables present' };
}

export async function GET(req: NextRequest) {
  const includeDetails = req.nextUrl.searchParams.get('details') === 'true';

  const checks = [
    checkEnvironment(),
    await checkNextAuth(),
    await checkDatabase(),
    await checkNeuralCore(),
    await checkMarzAgent(),
  ];

  const allPass = checks.every(c => c.status === 'pass');
  const hasFailures = checks.some(c => c.status === 'fail');

  const summary = {
    timestamp: new Date().toISOString(),
    status: allPass ? 'healthy' : hasFailures ? 'unhealthy' : 'degraded',
    total: checks.length,
    passed: checks.filter(c => c.status === 'pass').length,
    warnings: checks.filter(c => c.status === 'warn').length,
    failures: checks.filter(c => c.status === 'fail').length,
  };

  const response = {
    ...summary,
    checks: includeDetails
      ? checks.map(c => ({
          ...c,
          details: c.details || undefined,
        }))
      : checks.map(({ details, ...rest }) => rest),
  };

  return NextResponse.json(response, {
    status: allPass ? 200 : hasFailures ? 503 : 200,
    headers: {
      'cache-control': 'no-store',
    },
  });
}
