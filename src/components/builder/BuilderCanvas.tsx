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
    workspaceId?: string;
}

export function BuilderCanvas({ initialSections, onReorder, onUpdateSection, workspaceId }: BuilderCanvasProps) {
    const [sections, setSections] = useState(initialSections);
    const [aiInstruction, setAiInstruction] = useState('');
    const [isRefactoring, setIsRefactoring] = useState(false);

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

    async function handleAiRefactor() {
        if (!aiInstruction.trim()) return;
        setIsRefactoring(true);
        try {
            const res = await fetch('/api/ai/refactor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sections: sections,
                    instruction: aiInstruction,
                    workspaceId: workspaceId
                })
            });

            if (!res.ok) throw new Error('Refactoring failed');

            const data = await res.json();
            const newSections = data.sections.map((s: any, i: number) => ({
                ...s,
                id: s.id || `refactor-${Date.now()}-${i}`
            }));

            setSections(newSections);
            onReorder(newSections);
            setAiInstruction('');
        } catch (err) {
            console.error(err);
            alert('AI Refactor failed. Please try again.');
        } finally {
            setIsRefactoring(false);
        }
    }

    return (
        <div className="bg-white min-h-screen pb-20 relative">
            {/* AI Assistant Bar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 shadow-sm">
                <div className="max-w-4xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={aiInstruction}
                        onChange={(e) => setAiInstruction(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiRefactor()}
                        placeholder="✨ Ask AI to refactor (e.g. 'Make it more modern', 'Add a features section')"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={isRefactoring}
                    />
                    <button
                        onClick={handleAiRefactor}
                        disabled={isRefactoring || !aiInstruction.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {isRefactoring ? 'Processing...' : 'Refactor'}
                    </button>
                </div>
            </div>

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
