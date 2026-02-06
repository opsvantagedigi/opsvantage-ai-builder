'use client';

import { useEffect, useState } from 'react';
import { Page, Project, Section } from '@prisma/client';
import Link from 'next/link';
import HeroPreview from '@/components/previews/HeroPreview';
import FeaturesPreview from '@/components/previews/FeaturesPreview';
import DefaultPreview from '@/components/previews/DefaultPreview';
import { SectionData } from '@/lib/ai/page-generator';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// Add `order` to the Section type for sorting
type SectionWithOrder = Section & { order: number | null };

type ProjectWithPagesAndSections = Omit<Project, 'pages'> & {
  pages: (Page & {
    sections: SectionWithOrder[];
  })[];
};

interface ProjectClientPageProps {
  project: ProjectWithPagesAndSections;
}

const SectionPreview = ({ section }: { section: Section }) => {
  const content = section.data as unknown as SectionData;

  switch (section.type) {
    case 'HERO':
      return <HeroPreview content={content} />;
    case 'FEATURES':
      return <FeaturesPreview content={content} />;
    default:
      return <DefaultPreview type={section.type} content={content} />;
  }
};

const SortableSection = ({
  section,
  onDuplicate,
  onDelete,
}: {
  section: Section;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="relative group">
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {/* Action Menu */}
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} onBlur={() => setTimeout(() => setIsMenuOpen(false), 150)} className="p-2 bg-white border rounded-md hover:bg-gray-100">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <ul className="py-1">
                  <li><button onClick={() => onDuplicate(section.id)} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Duplicate</button></li>
                  <li><button onClick={() => onDelete(section.id)} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</button></li>
                </ul>
              </div>
            )}
          </div>
          {/* Drag Handle */}
          <div {...listeners} className="p-2 cursor-grab bg-white border rounded-md hover:bg-gray-100 active:cursor-grabbing">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 4.5C5.5 4.77614 5.27614 5 5 5C4.72386 5 4.5 4.77614 4.5 4.5C4.5 4.22386 4.72386 4 5 4C5.27614 4 5.5 4.22386 5.5 4.5ZM10.5 4.5C10.5 4.77614 10.2761 5 10 5C9.72386 5 9.5 4.77614 9.5 4.5C9.5 4.22386 9.72386 4 10 4C10.2761 4 10.5 4.22386 10.5 4.5ZM5.5 7.5C5.5 7.77614 5.27614 8 5 8C4.72386 8 4.5 7.77614 4.5 7.5C4.5 7.22386 4.72386 7 5 7C5.27614 7 5.5 7.22386 5.5 7.5ZM10.5 7.5C10.5 7.77614 10.2761 8 10 8C9.72386 8 9.5 7.77614 9.5 7.5C9.5 7.22386 9.72386 7 10 7C10.2761 7 10.5 7.22386 10.5 7.5ZM5.5 10.5C5.5 10.7761 5.27614 11 5 11C4.72386 11 4.5 10.7761 4.5 10.5C4.5 10.2239 4.72386 10 5 10C5.27614 10 5.5 10.2239 5.5 10.5ZM10.5 10.5C10.5 10.7761 10.2761 11 10 11C9.72386 11 9.5 10.7761 9.5 10.5C9.5 10.2239 9.72386 10 10 10C10.2761 10 10.5 10.2239 10.5 10.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </div>
        </div>
        <SectionPreview section={section} />
      </div>
    </div>
  );
};

export default function ProjectClientPage({ project }: ProjectClientPageProps) {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(
    project.pages[0]?.id || null
  );
  const [sections, setSections] = useState<SectionWithOrder[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPage = project.pages.find((p) => p.id === selectedPageId);

  useEffect(() => {
    if (selectedPage) {
      const sortedSections = [...selectedPage.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
      setSections(sortedSections);
    } else {
      setSections([]);
    }
  }, [selectedPage]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(sections, oldIndex, newIndex);
      setSections(newOrder);

      setIsSavingOrder(true);
      try {
        const sectionIds = newOrder.map(s => s.id);
        const response = await fetch('/api/sections/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionIds }),
        });
        if (!response.ok) throw new Error('Failed to save new section order.');
      } catch (error) {
        console.error(error);
        setSections(sections); // Revert on failure
      } finally {
        setIsSavingOrder(false);
      }
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    const originalSections = [...sections];
    // Optimistic update
    setSections(sections.filter((s) => s.id !== sectionId));

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete section.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not delete section. Please try again.');
      setSections(originalSections); // Revert on failure
    }
  };

  const handleDuplicateSection = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/sections/${sectionId}/duplicate`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to duplicate section.');
      }
      const newSection = await response.json();

      // Insert the new section into the state at the correct position
      const originalIndex = sections.findIndex((s) => s.id === sectionId);
      const newSections = [...sections];
      newSections.splice(originalIndex + 1, 0, newSection);
      setSections(newSections.map((s, i) => ({ ...s, order: i })));
    } catch (err) {
      console.error(err);
      setError('Could not duplicate section. Please try again.');
    }
  };

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={sections} strategy={verticalListSortingStrategy}>
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-gray-800">{selectedPage.title}</h2>
                  <Link href={selectedPage.slug} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Live Preview
                  </Link>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {isSavingOrder && <p className="text-sm text-gray-500 animate-pulse">Saving new order...</p>}
                {sections.length > 0 ? (
                  sections.map((section) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      onDuplicate={handleDuplicateSection}
                      onDelete={handleDeleteSection}
                    />
                  ))
                ) : (
                  <p className="text-gray-500">No sections generated for this page yet.</p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex items-center justify-center h-full"><p className="text-gray-500">Select a page to view its content.</p></div>
        )}
      </main>
    </div>
  );
}