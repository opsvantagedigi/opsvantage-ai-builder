import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSortedDocsData } from '@/lib/docs';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const allDocs = getSortedDocsData();

  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col">
      <Header />
      <main className="grow container mx-auto px-4 py-32">
        <div className="flex">
          <aside className="w-64 shrink-0 pr-8">
            <nav className="sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Documentation</h3>
              <ul className="space-y-2">
                {allDocs.map((doc) => (
                  <li key={doc.slug}>
                    <Link
                      href={`/docs/${doc.slug}`}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}