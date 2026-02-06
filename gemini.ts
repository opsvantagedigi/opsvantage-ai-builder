export function getGenerativeModel() {
	return {
		async generateContent(_prompt: string) {
			return {
				response: {
					text: () => '```json\n[]\n```',
				},
			};
		},
	};
}
