import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';
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

    await db.onboarding.update({
      where: { projectId },
      data: {
        backgroundTexturePrompts: backgroundTexturePrompts as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ backgroundTexturePrompts });
  } catch (err: unknown) {
    const e = err as Error;
    console.error('[GENERATE_TEXTURES_ERROR]', e);
    return NextResponse.json({ error: 'Failed to generate background textures.' }, { status: 500 });
  }
}