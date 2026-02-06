/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

// TODO: replace `any` usages with proper types
const FeaturesPreview = ({ content, onContentChange }: { content: any; onContentChange?: (c: any) => void }) => {
	const items = content?.items || [];
	return (
		<section className="p-4 bg-white rounded-md shadow-sm">
			<h3 className="text-lg font-semibold mb-3">{content?.headline || 'Features'}</h3>
			<ul className="space-y-2">
				{items.map((it: any, idx: number) => (
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
