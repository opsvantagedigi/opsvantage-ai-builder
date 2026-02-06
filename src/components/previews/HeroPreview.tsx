import React from 'react';

const HeroPreview = ({ content, onContentChange, projectId }: { content: any; onContentChange?: (c: any) => void; projectId?: string }) => {
	return (
		<section className="p-6 bg-white rounded-md shadow-sm">
			<h1 className="text-2xl font-bold mb-2">{content?.headline || 'Headline'}</h1>
			{content?.subheadline && <p className="text-sm text-gray-600 mb-2">{content.subheadline}</p>}
			{content?.cta && (
				<a href={content.cta.link} className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded">{content.cta.text}</a>
			)}
		</section>
	);
};

export default HeroPreview;
