import { getAllDocSlugs, getDocData } from '@/lib/docs';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return getAllDocSlugs();
}

interface DocPageProps {
  params: {
    slug: string;
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const docData = await getDocData(params.slug);
  if (!docData) {
    notFound();
  }
  return (
    <article>
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{docData.title}</h1>
      </header>
      <div
        className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-400 hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: docData.contentHtml }}
      />
    </article>
  );
}