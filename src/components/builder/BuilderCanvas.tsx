'use client';

import React, { useState } from 'react';
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
} from '@dnd-kit/sortable';
import { SortableSection } from './SortableSection';

// Import your section components here
import { HeroSection } from './sections/hero-section';
// Fallback/Generic section renderer if needed
import { GeneratedSection } from '@/lib/ai/page-generator';

interface BuilderCanvasProps {
    initialSections: (GeneratedSection & { id: string })[];
    onReorder: (newSections: (GeneratedSection & { id: string })[]) => void;
    onUpdateSection: (id: string, data: any) => void;
}

export function BuilderCanvas({ initialSections, onReorder, onUpdateSection }: BuilderCanvasProps) {
    const [sections, setSections] = useState(initialSections);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Notify parent of change
                onReorder(newOrder);
                return newOrder;
            });
        }
    }

    // Helper to render specific section types
    const renderSectionContent = (section: GeneratedSection & { id: string }) => {
        // This is a simplified renderer. In a real app, you'd map section.type to components
        switch (section.type) {
            case 'HERO':
                return <HeroSection
                    content={section.data as any}
                    onUpdate={(field, val) => onUpdateSection(section.id, { ...section.data, [field]: val })}
                />;
            default:
                return (
                    <div className="p-8 border border-dashed border-gray-300 rounded-lg m-4 min-h-32 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <p className="font-semibold text-gray-500">Section Type: {section.type}</p>
                            <p className="text-gray-400 text-sm">Variant: {section.variant}</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {sections.map((section) => (
                        <SortableSection key={section.id} id={section.id}>
                            {renderSectionContent(section)}
                        </SortableSection>
                    ))}
                </SortableContext>
            </DndContext>

            {sections.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    No sections yet. Add one to get started.
                </div>
            )}
        </div>
    );
}
