import React from 'react';
import { FooterContent } from '@/types/preview'
import { SectionData } from '@/lib/ai/page-generator'

const FooterPreview = ({ content, onContentChange }: { content: FooterContent | Partial<SectionData>; onContentChange?: (c: FooterContent | Partial<SectionData>) => void }) => {
  return (
    <footer className="p-4 bg-gray-100 rounded-md text-sm text-gray-700">
      <div>{(content as any)?.text ?? 'Footer content'}</div>
    </footer>
  );
};

export default FooterPreview;
