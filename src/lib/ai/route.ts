import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateBackgroundTextures } from '@/lib/ai/design-assistant';

export async function POST(request: Request) {
  try {
    const { projectId } = (await request.json()) as { projectId: string };

    if (!projectId) {
      return NextResponse.json({ error: 'Missing required field: projectId' }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { onboarding: true },
    });

    if (!project || !project.onboarding) {
      return NextResponse.json({ error: 'Project or onboarding data not found.' }, { status: 404 });
    }

    const backgroundTexturePrompts = await generateBackgroundTextures(project.onboarding);

    // Use `any` cast here because generated Prisma types may not have the
    // newly-added `backgroundTexturePrompts` field in some environments.
    // This is a narrow escape hatch; once Prisma client is regenerated in all
    // environments this can be reverted to a typed call.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).onboarding.update({
      where: { projectId },
      data: {
        backgroundTexturePrompts: backgroundTexturePrompts,
      },
    });

    return NextResponse.json({ backgroundTexturePrompts });
  } catch (err: unknown) {
    const e = err as Error;
    console.error('[GENERATE_TEXTURES_ERROR]', e);
    return NextResponse.json({ error: 'Failed to generate background textures.' }, { status: 500 });
  }
}