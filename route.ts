import { NextResponse } from 'next/server';
import { db } from './db';
import type { AiTask, Page } from '@prisma/client';
import { OnboardingStatus, TaskType } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;
  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { onboarding: true, aiTasks: { orderBy: { createdAt: 'asc' } } },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Step 1: Sitemap Generation
    let sitemapTask = project.aiTasks.find((t: AiTask) => t.type === TaskType.ONBOARDING_TO_SITEMAP);

    if (!sitemapTask && project.onboarding?.status === OnboardingStatus.COMPLETED) {
      sitemapTask = await db.aiTask.create({ data: { projectId, type: TaskType.ONBOARDING_TO_SITEMAP, status: 'PENDING', provider: 'GEMINI', payload: {} } });
      const url = new URL(`/api/generate/${projectId}/sitemap`, request.url);
      fetch(url.toString(), { method: 'POST', headers: { 'x-internal-secret': process.env.INTERNAL_API_SECRET! } });
    }

    if (!sitemapTask || sitemapTask.status === 'PENDING') {
      return NextResponse.json({ status: 'PENDING', progress: 5, message: 'Your request is in the queue...' });
    }
    if (sitemapTask.status === 'PROCESSING') {
      return NextResponse.json({ status: 'GENERATING_SITEMAP', progress: 15, message: 'Our AI is crafting the perfect sitemap...' });
    }
    if (sitemapTask.status === 'FAILED') {
      return NextResponse.json({ status: 'FAILED', progress: 0, message: sitemapTask.error || 'Sitemap generation failed.' });
    }

    // Step 2: Page Section Generation
    const pages = await db.page.findMany({ where: { projectId } });
    if (pages.length === 0 && sitemapTask.status === 'COMPLETED') {
      return NextResponse.json({ status: 'COMPLETED', progress: 100, message: 'Site structure defined. No pages to generate.', previewUrl: `/dashboard` });
    }

    const pageTasks = project.aiTasks.filter((t: AiTask) => t.type === TaskType.PAGE_TO_SECTIONS);

    if (pageTasks.length === 0 && pages.length > 0) {
      const newTasksData = pages.map((page: Page) => ({
        projectId,
        type: TaskType.PAGE_TO_SECTIONS,
        status: 'PENDING' as const,
        provider: 'GEMINI' as const,
        payload: { pageId: page.id },
      }));
      await db.aiTask.createMany({ data: newTasksData });

      const workerUrl = new URL(`/api/generate/${projectId}/page`, request.url);
      pages.forEach((page: Page) => {
        fetch(workerUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET! },
          body: JSON.stringify({ pageId: page.id }),
        }).catch(e => console.error(`Error triggering page worker for ${page.id}:`, e));
      });

      return NextResponse.json({ status: 'GENERATING_PAGES', progress: 30, message: `Generating content for ${pages.length} pages...` });
    }

    const completedPageTasks = pageTasks.filter((t: AiTask) => t.status === 'COMPLETED').length;
    const failedPageTasks = pageTasks.filter((t: AiTask) => t.status === 'FAILED').length;

    if (failedPageTasks > 0) {
      return NextResponse.json({ status: 'FAILED', progress: 0, message: 'Failed to generate content for one or more pages.' });
    }

    const sitemapProgress = 30;
    const pagesProgress = (completedPageTasks / pages.length) * (100 - sitemapProgress);
    const totalProgress = Math.floor(sitemapProgress + pagesProgress);

    if (totalProgress < 100) {
      return NextResponse.json({
        status: 'GENERATING_PAGES',
        progress: totalProgress,
        message: `Generating sections... (${completedPageTasks}/${pages.length} pages complete)`,
      });
    }

    // Step 3: All Done
    return NextResponse.json({
      status: 'COMPLETED',
      progress: 100,
      message: 'Congratulations! Your new website is ready.',
      previewUrl: `/dashboard`,
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[STATUS_ERROR] ProjectID: ${projectId}`, errMsg);
    return NextResponse.json({ error: 'Failed to get generation status.' }, { status: 500 });
  }
}