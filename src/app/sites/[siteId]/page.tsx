'use client';

import { useEffect, useState } from 'react';
import { RenderEngine } from '@/components/builder/render-engine';
import { Loader2 } from 'lucide-react';

interface SitePageProps {
  params: Promise<{
    siteId: string;
  }>;
}

interface Section {
  id: string;
  type: string;
  content: Record<string, any>;
}

interface Page {
  id: string;
  name: string;
  sections: Section[];
}

interface SiteData {
  siteConfig: {
    title: string;
    description: string;
    theme: string;
  };
  pages: Page[];
}

/**
 * 🌍 PUBLIC STAGE: Renders live websites from published projects
 *
 * This page receives rewritten requests from middleware:
 * - nexus.opsvantagedigital.online → /sites/nexus
 * - my-bakery.com → /sites/my-bakery.com
 *
 * Features:
 * - Loads published project data
 * - Renders via RenderEngine (read-only mode)
 * - Handles unpublished/non-existent projects
 * - SEO metadata support
 */
export default function SitePage({ params }: SitePageProps) {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    const loadSiteData = async () => {
      try {
        const resolvedParams = await params;
        setSiteId(resolvedParams.siteId);
        setIsLoading(true);
        setError(null);

        // Fetch the published project from the API
        // The siteId could be either a subdomain (nexus) or a custom domain (my-bakery.com)
        const response = await fetch(`/api/sites/${encodeURIComponent(resolvedParams.siteId)}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Site not found or not published');
          } else if (response.status === 403) {
            setError('This site is not yet published');
          } else {
            setError('Failed to load site');
          }
          setSiteData(null);
          return;
        }

        const data = await response.json() as SiteData;
        setSiteData(data);
        console.log('[MARZ] Public stage loaded for:', resolvedParams.siteId);
      } catch (err) {
        console.error('[MARZ] Failed to load site:', err);
        setError('Failed to load site data');
        setSiteData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSiteData();
  }, [siteId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading site...</p>
        </div>
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'This site is not yet published'
              ? 'Site Not Published'
              : 'Site Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error ||
              'The site you are looking for does not exist or has not been published yet.'}
          </p>
          <div className="text-sm text-gray-500">
            <p>Site ID: {siteId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Next.js Head equivalent - metadata would be set via Next.js metadata API in production */}
      <title>{siteData.siteConfig.title}</title>
      <meta name="description" content={siteData.siteConfig.description} />

      {/* Render the first page's sections */}
      <RenderEngine
        sections={siteData.pages[0]?.sections || []}
      />
    </>
  );
}
