import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('host');

  if (!host) {
    return [];
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not defined');
  }

  // Find the project associated with the current hostname
  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { domains: { some: { hostname: host } } },
        { subdomain: host.split('.')[0] }, // Simple subdomain check
      ],
    },
    include: {
      pages: {
        select: { slug: true, updatedAt: true },
      },
    },
  });

  if (!project) {
    return [];
  }

  return project.pages.map((page) => ({
    url: `${appUrl}/${page.slug === 'home' ? '' : page.slug}`,
    lastModified: page.updatedAt,
  }));
}