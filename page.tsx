import { DomainSearch } from '@/components/domains/DomainSearch';
import { notFound } from 'next/navigation';
import { getPageData } from '@/lib/sanity/queries';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export default function DomainsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Domain & Security Center
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your digital assets. Whitelabel domains and enterprise-grade SSL protection.
          </p>
        </header>
// Assuming a generic Section component that can render different section types
import { Section } from '@/components/builder/Section';

        <section className="mb-16">
          <DomainSearch />
        </section>
interface PageProps {
  params: { slug: string[] };
}

        <section>
          <h2 className="text-2xl font-bold mb-6">Enterprise SSL Certificates</h2>
          {/* List of SSL products fetched via Server Action from OpenProvider */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* TODO: Map through SSL products here */}
             <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/50">
                <h3 className="text-xl font-bold">RapidSSL</h3>
                <p className="text-slate-400 text-sm mt-2">Ideal for entry-level sites.</p>
                <div className="mt-4 text-2xl font-bold">$15.00 <span className="text-sm font-normal text-slate-500">/yr</span></div>
             </div>
             {/* ... more cards */}
          </div>
        </section>
      </div>
    </div>
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug?.join('/') || 'home';
  const page = await getPageData(slug);

  if (!page) {
    return {};
  }

  const headersList = headers();
  const host = headersList.get('host') || '';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const canonicalUrl = `${protocol}://${host}/${slug === 'home' ? '' : slug}`;

  const ogTitle = page.ogTitle || page.title;
  const ogDescription = page.ogDescription || page.seoDescription || '';
  const ogUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/api/og`);
  ogUrl.searchParams.set('title', ogTitle);
  ogUrl.searchParams.set('description', ogDescription);

  const metadata: Metadata = {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630 }],
    },
  };

  if (page.structuredData) {
    metadata.other = {
      'application/ld+json': JSON.stringify(page.structuredData),
    };
  }

  return metadata;
}

export default async function Page({ params }: PageProps) {
  const slug = params.slug?.join('/') || 'home';
  const page = await getPageData(slug);

  if (!page) {
    return notFound();
  }

  return (
    <>
      {page.sections?.map((section: any) => (
        <Section key={section._key} section={section} />
      ))}
    </>
  );
}