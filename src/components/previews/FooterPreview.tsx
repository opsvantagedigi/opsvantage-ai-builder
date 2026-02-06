import React from 'react';
import { FooterContent } from '@/types/preview'
import { SectionData } from '@/lib/ai/page-generator'

function hasTextField(x: unknown): x is { text?: string } {
  return typeof x === 'object' && x !== null && 'text' in x;
}

const FooterPreview = ({ content }: { content: FooterContent | Partial<SectionData> }) => {
  const text = hasTextField(content) ? content.text : undefined;
  return (
    <footer className="p-4 bg-gray-100 rounded-md text-sm text-gray-700">
      <div>{text ?? 'Footer content'}</div>
    </footer>
  );
};

export default FooterPreview;
