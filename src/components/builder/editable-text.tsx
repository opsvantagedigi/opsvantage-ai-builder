"use client";

import { useState, useEffect } from "react";

interface EditableTextProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function EditableText({ value, onChange, className }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  if (isEditing) {
    return (
      <input
        autoFocus
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => {
          setIsEditing(false);
          onChange(localValue);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setIsEditing(false);
            onChange(localValue);
          }
        }}
        className={`bg-transparent border-b border-blue-500 outline-none text-inherit font-inherit ${className}`}
      />
    );
  }

  return (
    <span 
      onClick={() => setIsEditing(true)} 
      className={`cursor-pointer hover:bg-blue-500/10 rounded px-1 transition-colors ${className}`}
      role="button"
      tabIndex={0}
    >
      {value}
    </span>
  );
}
