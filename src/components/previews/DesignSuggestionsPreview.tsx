import { SectionData } from '@/lib/ai/page-generator';

interface DesignSuggestionsPreviewProps {
  content: SectionData;
}

const DesignSuggestionsPreview = ({ content }: DesignSuggestionsPreviewProps) => {
  const { colorRecommendations, typographyRecommendations, layoutRecommendations, fontPairingRecommendations } = content;

  if (!colorRecommendations?.length && !typographyRecommendations?.length && !layoutRecommendations?.length && !fontPairingRecommendations?.length) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-600 mb-4 text-center">AI Design Suggestions</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Color Recommendations */}
        {colorRecommendations && colorRecommendations.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Colors</h5>
            <div className="flex flex-wrap gap-2">
              {colorRecommendations.map((color, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
                  <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: color.hex }}></div>
                  <span className="text-xs font-medium text-gray-700">{color.name}</span>
                  <span className="text-xs text-gray-500">{color.hex}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Typography Recommendations */}
        {typographyRecommendations && typographyRecommendations.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Typography</h5>
            <div className="space-y-2">
              {typographyRecommendations.map((typo, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded-md">
                  <span className="text-xs font-medium text-gray-700">{typo.element}: </span>
                  <span className="text-xs text-gray-500">{typo.fontFamily}, {typo.fontWeight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layout Recommendations */}
        {layoutRecommendations && layoutRecommendations.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Layout</h5>
            <div className="space-y-2">
              {layoutRecommendations.map((layout, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded-md">
                  <p className="text-xs text-gray-600">{layout.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Font Pairing Recommendations */}
        {fontPairingRecommendations && fontPairingRecommendations.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Font Pairing</h5>
            {fontPairingRecommendations.map((font, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded-md text-xs text-gray-600"><b>H:</b> {font.heading} / <b>B:</b> {font.body}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignSuggestionsPreview;