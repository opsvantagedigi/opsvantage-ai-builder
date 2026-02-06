import { SectionData } from '@/lib/ai/page-generator';

interface FeaturesPreviewProps {
  content: SectionData;
}

const FeaturesPreview = ({ content }: FeaturesPreviewProps) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md border">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Features Section</p>
      <div className="py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">{content.headline}</h2>
          {content.subheadline && <p className="mt-4 text-lg text-center text-gray-600">{content.subheadline}</p>}
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {content.items?.map((item, index) => (
              <div key={index} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        {/* Placeholder for an icon */}
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{item.title}</h3>
                    <p className="mt-5 text-base text-gray-500">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPreview;