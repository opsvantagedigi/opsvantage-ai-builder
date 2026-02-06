import React from 'react';

const FooterPreview = ({ content, onContentChange }: { content: any; onContentChange?: (c: any) => void }) => {
  return (
    <footer className="p-4 bg-gray-100 rounded-md text-sm text-gray-700">
      <div>{content?.text || 'Footer content'}</div>
    </footer>
  );
};

export default FooterPreview;
