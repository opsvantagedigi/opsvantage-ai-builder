'use client';

import { useEffect, useState } from 'react';
import { Page, Project, Section } from '@prisma/client';
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

const SortableSection = ({ section }: { section: Section }) => {
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

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="relative group">
        <div {...listeners} className="absolute top-4 right-4 p-2 cursor-grab bg-gray-100 rounded-md hover:bg-gray-200 active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 4.5C5.5 4.77614 5.27614 5 5 5C4.72386 5 4.5 4.77614 4.5 4.5C4.5 4.22386 4.72386 4 5 4C5.27614 4 5.5 4.22386 5.5 4.5ZM10.5 4.5C10.5 4.77614 10.2761 5 10 5C9.72386 5 9.5 4.77614 9.5 4.5C9.5 4.22386 9.72386 4 10 4C10.2761 4 10.5 4.22386 10.5 4.5ZM5.5 7.5C5.5 7.77614 5.27614 8 5 8C4.72386 8 4.5 7.77614 4.5 7.5C4.5 7.22386 4.72386 7 5 7C5.27614 7 5.5 7.22386 5.5 7.5ZM10.5 7.5C10.5 7.77614 10.2761 8 10 8C9.72386 8 9.5 7.77614 9.5 7.5C9.5 7.22386 9.72386 7 10 7C10.2761 7 10.5 7.22386 10.5 7.5ZM5.5 10.5C5.5 10.7761 5.27614 11 5 11C4.72386 11 4.5 10.7761 4.5 10.5C4.5 10.2239 4.72386 10 5 10C5.27614 10 5.5 10.2239 5.5 10.5ZM10.5 10.5C10.5 10.7761 10.2761 11 10 11C9.72386 11 9.5 10.7761 9.5 10.5C9.5 10.2239 9.72386 10 10 10C10.2761 10 10.5 10.2239 10.5 10.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
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
                <h2 className="text-3xl font-bold text-gray-800">{selectedPage.title}</h2>
                {isSavingOrder && <p className="text-sm text-gray-500 animate-pulse">Saving new order...</p>}
                {sections.length > 0 ? (
                  sections.map((section) => <SortableSection key={section.id} section={section} />)
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