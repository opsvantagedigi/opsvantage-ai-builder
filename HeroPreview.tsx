import { SectionData } from '@/lib/ai/page-generator';

interface HeroPreviewProps {
  content: SectionData;
}

const HeroPreview = ({ content }: HeroPreviewProps) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md border">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Hero Section</p>
      <div className="text-center py-16 bg-gray-50 rounded-md">
        <h2 className="text-4xl font-bold text-gray-900">{content.headline}</h2>
        {content.subheadline && <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">{content.subheadline}</p>}
        {content.cta && (
          <div className="mt-8">
            <a
              href={content.cta.link}
              className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
            >
              {content.cta.text}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroPreview;