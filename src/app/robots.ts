import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not defined');
  }

  return {
    rules: { userAgent: '*' },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}