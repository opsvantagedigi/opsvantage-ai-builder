import { useState } from 'react';
import Image from 'next/image';
import { SectionData } from '@/lib/ai/page-generator';
import EditableText from '@/EditableText';
import DesignSuggestionsPreview from './DesignSuggestionsPreview';
import { toast } from 'sonner';

interface HeroPreviewProps {
  content: SectionData;
  onContentChange: (newContent: SectionData) => void;
  projectId: string;
}

const HeroPreview = ({ content, onContentChange, projectId }: HeroPreviewProps) => {
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleSave = (field: keyof SectionData) => (newValue: string) => {
    onContentChange({ ...content, [field]: newValue });
  };

  const handleCtaSave = (field: 'text' | 'link') => (newValue: string) => {
    onContentChange({ ...content, cta: { ...content.cta!, [field]: newValue } });
  };

  const handleGenerateImage = async (prompt: string) => {
    setGeneratingImage(prompt);
    setGeneratedImageUrl(null);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('Failed to generate image.');
      const { url } = await response.json();
      setGeneratedImageUrl(url);
      toast.success('Image generated successfully!');
    } catch (err: unknown) {
      console.error(err);
      const e = err as Error;
      toast.error(e.message || 'Could not generate image.');
    } finally {
      setGeneratingImage(null);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Hero Section</p>
      <div className="text-center py-16 bg-gray-50 rounded-md">
        <EditableText as="h2" className="text-4xl font-bold text-gray-900" value={content.headline} onSave={handleSave('headline')} projectId={projectId} />
        {content.subheadline && <EditableText as="p" className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto" value={content.subheadline} onSave={handleSave('subheadline')} projectId={projectId} />}
        {content.cta && (
          <div className="mt-8">
            <span className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition cursor-pointer">
              <EditableText as="span" value={content.cta.text} onSave={handleCtaSave('text')} projectId={projectId} />
            </span>
          </div>
        )}
        {generatedImageUrl && (
          <div className="mt-8 max-w-2xl mx-auto aspect-video relative">
            <Image src={generatedImageUrl} alt="AI generated hero image" layout="fill" objectFit="cover" className="rounded-lg" />
          </div>
        )}
        {content.imageSuggestions && content.imageSuggestions.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 max-w-2xl mx-auto">
            <h4 className="text-sm font-semibold text-gray-500">AI Image Ideas</h4>
            <ul className="mt-2 space-y-2">
              {content.imageSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span>{suggestion}</span>
                  <button onClick={() => handleGenerateImage(suggestion)} disabled={!!generatingImage} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-wait">
                    {generatingImage === suggestion ? 'Generating...' : 'Generate'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <DesignSuggestionsPreview content={content} />
      </div>
    </div>
  );
};

export default HeroPreview;
