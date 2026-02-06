export function getGenerativeModel() {
	return {
		async generateContent(_prompt: string) {
			void _prompt;
			return {
				response: {
					text: () => '```json\n[]\n```',
				},
			};
		},
	};
}
