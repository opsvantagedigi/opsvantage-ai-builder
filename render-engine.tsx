import React from 'react';
import { HeroSection } from './hero';
import { FeaturesSection } from './features';

const COMPONENT_REGISTRY: Record<string, React.ElementType> = {
  'HERO': HeroSection,
  'FEATURES': FeaturesSection,
  // Add 'CONTACT', 'TESTIMONIALS' here later
};

interface Section {
  id: string;
  type: string;
  content: Record<string, unknown>;
}

export function RenderEngine({ sections, onUpdate }: { sections: Section[], onUpdate: (sectionId: string, field: string, value: string) => void }) {
  if (!sections || sections.length === 0) {
    return <div className="p-20 text-center text-slate-400">MARZ is architecting your site...</div>;
  }

  return (
    <div className="flex flex-col">
      {sections.map((section, index) => {
        const Component = COMPONENT_REGISTRY[section.type];
        if (!Component) {
          return null;
        }
        
        return (
          <div key={section.id || index} id={section.id} className="relative group">
            {/* Hover Outline for Editing (Future Feature) */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 pointer-events-none z-50 transition-colors" />
            <Component 
               content={section.content} 
               onUpdate={(field: string, val: string) => onUpdate(section.id, field, val)} 
            />
          </div>
        );
      })}
    </div>
  );
}