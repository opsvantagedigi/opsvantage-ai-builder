import React from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: replace `any` usages with proper types

const DefaultPreview = ({ type, content }: { type: string; content: any }) => {
	return (
		<section className="p-4 bg-white rounded-md shadow-sm">
			<h4 className="font-medium">{type}</h4>
			<pre className="text-xs mt-2 text-gray-700">{JSON.stringify(content, null, 2)}</pre>
		</section>
	);
};

export default DefaultPreview;
