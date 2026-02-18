import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateBackgroundTextures } from '@/lib/ai/design-assistant';
import type { BackgroundTexturePrompt } from '@/lib/ai/design-assistant';
import type { OnboardingData } from '@/types/onboarding';

function normalizeOnboarding(raw: unknown): OnboardingData {
  const r = raw as Record<string, unknown>;
  return {
    businessName: (r.businessName as string) ?? undefined,
    businessType: (r.businessType as string) ?? undefined,
    industry: (r.industry as string) ?? undefined,
    description: (r.description as string) ?? undefined,
    brandVoice: (r.brandVoice as string) ?? undefined,
    targetAudience: (r.targetAudience as string) ?? undefined,
    goals: (r.goals as string) ?? undefined,
    competitors: Array.isArray(r.competitors) ? (r.competitors as string[]) : undefined,
    colorPalette: Array.isArray(r.colorPalette) ? (r.colorPalette as string[]) : undefined,
    designStyle: (r.designStyle as string) ?? undefined,
    fonts: Array.isArray(r.fonts) ? (r.fonts as string[]) : undefined,
    logoUrl: (r.logoUrl as string) ?? undefined,
  };
}

export async function POST(request: Request) {
  try {
    const { projectId } = (await request.json()) as { projectId: string };

    if (!projectId) {
      return NextResponse.json({ error: 'Missing required field: projectId' }, { status: 400 });
    }

    const project = await db.project.findFirst({
      where: { id: projectId, deletedAt: null },
      include: { onboarding: true },
    });

    if (!project || !project.onboarding) {
      return NextResponse.json({ error: 'Project or onboarding data not found.' }, { status: 404 });
    }

    const backgroundTexturePrompts = await generateBackgroundTextures(normalizeOnboarding(project.onboarding));

    // The Prisma client in some environments may not include the
    // `backgroundTexturePrompts` field yet. Create a narrow typed view
    // for the update call to avoid using `any` while keeping the call
    // explicit about the payload we send.
    type OnboardingUpdateCall = {
      onboarding: {
        update(args: { where: { projectId: string }; data: { backgroundTexturePrompts: BackgroundTexturePrompt[] } }): Promise<unknown>;
      };
    };

    await (db as unknown as OnboardingUpdateCall).onboarding.update({
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