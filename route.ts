import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { refineText, RefineInstruction } from '@/lib/ai/copywriting-engine';

export async function POST(request: Request) {
  try {
    const { text, instruction, projectId } = (await request.json()) as {
      text: string;
      instruction: RefineInstruction;
      projectId: string;
    };

    if (!text || !instruction || !projectId) {
      return NextResponse.json({ error: 'Missing required fields: text, instruction, projectId' }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { onboarding: true },
    });

    if (!project || !project.onboarding) {
      return NextResponse.json({ error: 'Project or onboarding data not found.' }, { status: 404 });
    }

    const refinedText = await refineText(project.onboarding, text, instruction);

    return NextResponse.json({ refinedText });
  } catch (error: any) {
    console.error('[REFINE_TEXT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to refine text.' }, { status: 500 });
  }
}