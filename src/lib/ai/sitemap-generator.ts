import type { OnboardingData as Onboarding } from '@/types/onboarding';
import { getGenerativeModel } from './gemini';

export interface SitemapPage {
  title: string;
  slug: string;
  type: 'HOME' | 'LANDING' | 'CUSTOM';
  isHome: boolean;
}

function buildSitemapPrompt(onboardingData: Onboarding): string {
  const {
    businessName,
    businessType,
    industry,
    description,
    targetAudience,
    goals,
    competitors,
  } = onboardingData;

  const competitorsList = Array.isArray(competitors) ? competitors.join(', ') : 'None';

  return `
    Based on the following business information, generate a sitemap for their website.
    - Business Name: ${businessName}
    - Business Type: ${businessType}
    - Industry: ${industry}
    - Description: ${description}
    - Target Audience: ${targetAudience}
    - Website Goals: ${goals}
    - Competitors: ${competitorsList}

    The sitemap should include standard pages like Home, About, Contact, and Services if applicable.
    Also suggest 1-2 custom pages that are highly relevant to this specific business.
    The home page slug must be "/". All other slugs must start with a "/".

    Return the sitemap as a valid JSON array of objects, inside a single JSON code block. Do not include any other text outside the code block.
    Each object in the array must have the following properties:
    - "title": string (e.g., "Home", "About Us")
    - "slug": string (e.g., "/", "/about")
    - "type": string (one of "HOME", "LANDING", "CUSTOM")
    - "isHome": boolean (must be true for exactly one page with slug "/")

    Example output format:
    \`\`\`json
    [
      { "title": "Home", "slug": "/", "type": "HOME", "isHome": true },
      { "title": "About Us", "slug": "/about", "type": "CUSTOM", "isHome": false },
      { "title": "Our Services", "slug": "/services", "type": "CUSTOM", "isHome": false },
      { "title": "Contact Us", "slug": "/contact", "type": "CUSTOM", "isHome": false }
    ]
    \`\`\`
  `;
}

function parseSitemapResponse(responseText: string): SitemapPage[] {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format: missing JSON code block.');
  }

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    // TODO: Add Zod validation here to ensure the structure is correct.
    return parsed as SitemapPage[];
  } catch (error) {
    throw new Error('Failed to parse sitemap from AI response.');
  }
}

export async function generateSitemap(onboardingData: Onboarding): Promise<SitemapPage[]> {
  const prompt = buildSitemapPrompt(onboardingData);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseSitemapResponse(text);
}