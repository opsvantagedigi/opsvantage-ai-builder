import { SectionData } from '@/lib/ai/page-generator';

interface DefaultPreviewProps {
  type: string;
  content: SectionData;
}

const DefaultPreview = ({ type, content }: DefaultPreviewProps) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md border">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{type} Section</p>
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-semibold text-gray-800">{content.headline}</h3>
        {content.subheadline && <p className="text-sm text-gray-600 mt-1">{content.subheadline}</p>}
        <pre className="mt-4 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DefaultPreview;