import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCache, setCache } from '@/lib/cache/memory-store';

interface RouteParams {
  params: Promise<{
    siteId: string;
  }>;
}

/**
 * GET /api/sites/[siteId]
 *
 * Fetches published site data for public rendering
 * siteId can be:
 * - A subdomain: "nexus"
 * - A custom domain: "my-bakery.com"
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { siteId } = await params;

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    const cacheKey = `site:published:${siteId}`;
    const cachedContent = await getCache<any>(cacheKey);
    if (cachedContent) {
      return NextResponse.json(cachedContent, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'x-cache': 'hit',
        },
      });
    }

    // Search for project by either subdomain or custom domain
    const project = await db.project.findFirst({
      where: {
        OR: [
          { subdomain: siteId }, // Match subdomain: "nexus"
          { customDomain: siteId }, // Match custom domain: "my-bakery.com"
        ],
        published: true, // Only return published projects
      },
      select: {
        id: true,
        name: true,
        content: true,
        subdomain: true,
        customDomain: true,
      },
    });

    if (!project) {
      // Check if project exists but is not published
      const unpublished = await db.project.findFirst({
        where: {
          OR: [
            { subdomain: siteId },
            { customDomain: siteId },
          ],
        },
        select: { id: true },
      });

      if (unpublished) {
        return NextResponse.json(
          { error: 'Site not published' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Validate that content exists and is valid
    if (!project.content) {
      return NextResponse.json(
        { error: 'Site has no content' },
        { status: 400 }
      );
    }

    // Return the site content with cache headers
    await setCache(cacheKey, project.content, 300);
    return NextResponse.json(project.content, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'x-cache': 'miss',
      },
    });
  } catch (error) {
    console.error('[MARZ] Error fetching site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    );
  }
}
