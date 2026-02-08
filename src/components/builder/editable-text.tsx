'use client'

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  aiEnabled?: boolean;
}

export function EditableText({ value, onSave, className, aiEnabled = true }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state if external prop changes (e.g. AI regeneration)
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue);
    }
  };

  return (
    <div className="relative group inline-block w-full">
      {/* HOVER UI: The "Edit" border */}
      {!isEditing && (
        <div className="absolute -inset-2 border border-dashed border-transparent group-hover:border-cyan-500/50 rounded-lg pointer-events-none transition-all" />
      )}

      {/* AI TOOLBAR (Appears on Hover) */}
      {aiEnabled && !isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute -top-8 right-0 z-50 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button className="bg-slate-900 text-cyan-400 text-[10px] px-2 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1 hover:bg-slate-800">
            <Sparkles className="w-3 h-3" /> Rewrite
          </button>
        </motion.div>
      )}

      {/* THE INPUT AREA */}
      <div
        ref={containerRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        onInput={(e) => setCurrentValue(e.currentTarget.textContent || "")}
        className={cn(
          "outline-none min-w-5 relative z-10 cursor-text",
          isEditing ? "bg-blue-50/50 ring-2 ring-blue-500/20 rounded px-1" : "",
          className
        )}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}