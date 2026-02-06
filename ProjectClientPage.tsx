'use client';

import { useState } from 'react';
import { Page, Project, Section } from '@prisma/client';
import HeroPreview from '@/components/previews/HeroPreview';
import FeaturesPreview from '@/components/previews/FeaturesPreview';
import DefaultPreview from '@/components/previews/DefaultPreview';
import { SectionData } from '@/lib/ai/page-generator';

type ProjectWithPagesAndSections = Project & {
  pages: (Page & {
    sections: Section[];
  })[];
};

interface ProjectClientPageProps {
  project: ProjectWithPagesAndSections;
}

const SectionPreview = ({ section }: { section: Section }) => {
  const content = section.data as SectionData;

  switch (section.type) {
    case 'HERO':
      return <HeroPreview content={content} />;
    case 'FEATURES':
      return <FeaturesPreview content={content} />;
    default:
      return <DefaultPreview type={section.type} content={content} />;
  }
};

export default function ProjectClientPage({ project }: ProjectClientPageProps) {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(
    project.pages[0]?.id || null
  );

  const selectedPage = project.pages.find((p) => p.id === selectedPageId);

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-4 truncate">{project.name}</h1>
        <nav className="flex-1">
          <ul className="space-y-1">
            {project.pages.map((page) => (
              <li key={page.id}>
                <button
                  onClick={() => setSelectedPageId(page.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPageId === page.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {selectedPage ? (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">{selectedPage.title}</h2>
            {selectedPage.sections.length > 0 ? (
              selectedPage.sections.map((section) => <SectionPreview key={section.id} section={section} />)
            ) : (
              <p className="text-gray-500">No sections generated for this page yet.</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full"><p className="text-gray-500">Select a page to view its content.</p></div>
        )}
      </main>
    </div>
  );
}