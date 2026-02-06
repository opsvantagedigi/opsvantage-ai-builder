'use client';

import React, { useRef, useState } from 'react';
import { RefineInstruction } from '@/lib/ai/copywriting-engine';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  projectId?: string;
}

const CopywritingMenu = ({ onRefine, isRefining }: { onRefine: (instruction: RefineInstruction) => void, isRefining: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const instructions: { label: string; value: RefineInstruction }[] = [
    { label: 'Improve Writing', value: 'IMPROVE' },
    { label: 'Make Shorter', value: 'SHORTER' },
    { label: 'Make Longer', value: 'LONGER' },
    { label: 'Optimize for SEO', value: 'SEO_OPTIMIZATION' },
    { label: 'Optimize CTA', value: 'CTA_OPTIMIZATION' },
    { label: 'To Professional', value: 'PROFESSIONAL' },
    { label: 'To Friendly', value: 'FRIENDLY' },
    { label: 'To Luxury', value: 'LUXURY' },
    { label: 'To Bold', value: 'BOLD' },
  ];

  const handleSelect = (instruction: RefineInstruction) => {
    onRefine(instruction);
    setIsOpen(false);
  };

  return (
    <div className="absolute top-0 -right-8 flex items-center h-full">
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} onBlur={() => setTimeout(() => setIsOpen(false), 200)} disabled={isRefining} className="p-1 rounded-full bg-white/50 hover:bg-white text-blue-600 shadow-sm transition-all" title="Improve with AI">
          <svg className={`h-4 w-4 ${isRefining ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9"/><path d="M12 12L7 7"/><path d="m12 12 5 5"/></svg>
        </button>
        {isOpen && (
          <div className="absolute right-full mr-2 mt-[-50%] w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {instructions.map(instr => (
                <button key={instr.value} onClick={() => handleSelect(instr.value)} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                  {instr.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EditableText: React.FC<EditableTextProps> = ({ value, onSave, className, as: Component = 'p', projectId }) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async (instruction: RefineInstruction) => {
    if (!projectId || !elementRef.current) return;
    const originalText = elementRef.current.innerText;
    setIsRefining(true);
    try {
      const response = await fetch('/api/ai/refine-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText, instruction, projectId }),
      });
      if (!response.ok) throw new Error('Failed to refine text.');
      const { refinedText } = await response.json();
      if (elementRef.current) elementRef.current.innerText = refinedText;
      onSave(refinedText);
    } catch (error) {
      console.error(error);
      if (elementRef.current) elementRef.current.innerText = originalText;
    } finally {
      setIsRefining(false);
    }
  };

  const handleBlur = () => {
    if (elementRef.current && elementRef.current.innerText !== value) onSave(elementRef.current.innerText);
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && (Component === 'h1' || Component === 'h2' || Component === 'h3' || Component === 'span')) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="relative group" onFocus={() => setIsFocused(true)} onBlur={handleBlur}>
      <Component
        ref={elementRef as any}
        contentEditable={!isRefining}
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        className={`${className} focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-blue-50/50 rounded-sm px-1 -mx-1 transition-all`}
        dangerouslySetInnerHTML={{ __html: value }}
      />
      {projectId && isFocused && (
        <CopywritingMenu onRefine={handleRefine} isRefining={isRefining} />
      )}
    </div>
  );
};

export default EditableText;