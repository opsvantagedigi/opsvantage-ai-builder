import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSectionProps {
    id: string;
    children: React.ReactNode;
}

export function SortableSection({ id, children }: SortableSectionProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative">
            {/* Drag Handle - visible on hover */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-4 top-4 z-50 p-2 bg-white/90 shadow-md rounded-md cursor-grab opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50"
                title="Drag to reorder"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="12" r="1" />
                    <circle cx="9" cy="5" r="1" />
                    <circle cx="9" cy="19" r="1" />
                    <circle cx="15" cy="12" r="1" />
                    <circle cx="15" cy="5" r="1" />
                    <circle cx="15" cy="19" r="1" />
                </svg>
            </div>

            {children}
        </div>
    );
}
