import React from 'react';
import { FeaturesContent, FeatureItem } from '@/types/preview'

const FeaturesPreview = ({ content, onContentChange }: { content: FeaturesContent; onContentChange?: (c: FeaturesContent) => void }) => {
	const items: FeatureItem[] = content?.items || [];
	return (
		<section className="p-4 bg-white rounded-md shadow-sm">
			<h3 className="text-lg font-semibold mb-3">{content?.headline || 'Features'}</h3>
			<ul className="space-y-2">
				{items.map((it, idx: number) => (
					<li key={idx} className="border p-3 rounded">
						<strong className="block">{it.title}</strong>
						{it.description && <p className="text-sm text-gray-600">{it.description}</p>}
					</li>
				))}
			</ul>
		</section>
	);
};

export default FeaturesPreview;
