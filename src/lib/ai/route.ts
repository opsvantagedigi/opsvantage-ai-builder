import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { generatePageSections } from '@/lib/ai/page-generator';
import type { Prisma } from '@prisma/client';
import { TaskType } from '@prisma/client';

// This is our "worker" route for generating sections for a single page.
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  const internalSecret = request.headers.get('x-internal-secret');

  if (internalSecret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pageId } = await request.json();
  if (!pageId) {
    return NextResponse.json({ error: 'pageId is required' }, { status: 400 });
  }

  let task;
  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { onboarding: true },
    });

    const page = await db.page.findUnique({
      where: { id: pageId },
    });

    if (!project || !project.onboarding || !page) {
      throw new Error('Project, Onboarding data, or Page not found.');
    }

    task = await db.aiTask.findFirst({
      where: { projectId, type: TaskType.PAGE_TO_SECTIONS, payload: { path: ['pageId'], equals: pageId } },
    });

    if (!task) {
      throw new Error(`Task for pageId ${pageId} not found.`);
    }

    await db.aiTask.update({ where: { id: task.id }, data: { status: 'PROCESSING' } });

    const sections = await generatePageSections(project.onboarding, page);

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.section.deleteMany({ where: { pageId } });
      await tx.section.createMany({
        data: sections.map((section) => ({
          pageId,
          type: section.type,
          variant: section.variant,
          data: section.data as unknown as Prisma.InputJsonValue,
        })),
      });
    });

    await db.aiTask.update({ where: { id: task.id }, data: { status: 'COMPLETED', result: sections as unknown as Prisma.InputJsonValue } });

    return NextResponse.json({ message: `Sections generated for page ${pageId}` });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[PAGE_GENERATION_ERROR] ProjectID: ${projectId}, PageID: ${pageId}`, errMsg);
    if (task) {
      await db.aiTask.update({ where: { id: task.id }, data: { status: 'FAILED', error: errMsg } });
    }
    return NextResponse.json({ error: 'Page section generation failed.' }, { status: 500 });
  }
}