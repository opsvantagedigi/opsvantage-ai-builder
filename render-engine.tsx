import React from 'react';
import { HeroSection } from './hero';
import { FeaturesSection } from './features';

const COMPONENT_REGISTRY: { [key: string]: React.ComponentType<any> } = {
  'HERO': HeroSection,
  'FEATURES': FeaturesSection,
  // Add 'CONTACT', 'TESTIMONIALS' here later
};

interface Section {
  id: string;
  type: string;
  content: any;
}

export function RenderEngine({ sections }: { sections: Section[] }) {
  if (!sections || sections.length === 0) {
    return <div className="p-20 text-center text-slate-400">MARZ is architecting your site...</div>;
  }

  return (
    <div className="flex flex-col">
      {sections.map((section, index) => {
        const Component = COMPONENT_REGISTRY[section.type];
        if (!Component) return null;
        
        return (
          <div key={section.id || index} id={section.id} className="relative group">
            {/* Hover Outline for Editing (Future Feature) */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 pointer-events-none z-50 transition-colors" />
            <Component content={section.content} />
          </div>
        );
      })}
    </div>
  );
}