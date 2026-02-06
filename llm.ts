// This is a mock implementation. In a real app, you would integrate
// the official SDK for Gemini, OpenAI, or another LLM provider.

class MockLLMProvider {
  async generateText(prompt: string): Promise<string> {
    console.log('--- AI PROMPT ---');
    console.log(prompt.substring(0, 500) + '...'); // Log a snippet
    console.log('-----------------');

    // Simulate a network delay for the AI response
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Return a mock JSON response that matches the expected sitemap structure
    const mockSitemap = [
      { title: 'Home', slug: '/', type: 'HOME' },
      { title: 'About Us', slug: 'about', type: 'ABOUT' },
      { title: 'Our Services', slug: 'services', type: 'SERVICES' },
      { title: 'Blog', slug: 'blog', type: 'BLOG' },
      { title: 'Contact Us', slug: 'contact', type: 'CONTACT' },
    ];

    return JSON.stringify(mockSitemap, null, 2);
  }
}

const llmProvider = new MockLLMProvider();

export const getLLMProvider = () => llmProvider;
