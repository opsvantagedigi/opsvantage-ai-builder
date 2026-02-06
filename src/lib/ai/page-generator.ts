import { Onboarding, Page, PageType, SectionType } from '@prisma/client';
import { getGenerativeModel } from '@/gemini';

// This defines the structure of the `data` field in a Section
export interface SectionData {
  headline: string;
  subheadline?: string;
  body?: string;
  cta?: {
    text: string;
    link: string;
  };
  items?: {
    title: string;
    description: string;
    icon?: string;
  }[];
}

export interface GeneratedSection {
  type: SectionType;
  variant: string; // e.g., 'default', 'image_left', 'dark_mode'
  data: SectionData;
}

export interface GeneratedPageData {
  seoTitle: string;
  seoDescription: string;
  sections: GeneratedSection[];
}

function buildPagePrompt(onboardingData: Onboarding, page: Page): string {
  const { businessName, description, brandVoice, targetAudience } = onboardingData;

  // Define which sections to generate for each page type.
  // We use 'CUSTOM' for sections like CTAs or specific content blocks.
  const sectionTypes: Record<PageType, SectionType[]> = {
    HOME: ['HERO', 'FEATURES', 'TESTIMONIALS', 'CUSTOM'], // CUSTOM can be a CTA
    LANDING: ['HERO', 'FEATURES', 'FAQ', 'CUSTOM'],
    CUSTOM: ['HERO', 'CUSTOM', 'FAQ'],
  };

  const requestedSections = sectionTypes[page.type] || sectionTypes.CUSTOM;

  return `
    You are an expert web designer, copywriter, and SEO specialist. Based on the business information and the specific page details, generate the content for a webpage.

    Business Information:
    - Business Name: ${businessName}
    - Description: ${description}
    - Brand Voice: ${brandVoice}
    - Target Audience: ${targetAudience}

    Page to Generate:
    - Page Title: "${page.title}"
    - Page Type: ${page.type}

    Generate the following:
    1. An SEO-optimized title for the page (around 50-60 characters).
    2. An SEO-optimized meta description for the page (around 150-160 characters).
    3. The content for the following sections: ${requestedSections.join(', ')}.

    Return the response as a single valid JSON object, inside a single JSON code block. Do not include any other text.
    The JSON object must have these properties:
    - "seoTitle": string
    - "seoDescription": string
    - "sections": array of "GeneratedSection" objects.

    Each "GeneratedSection" object must have:
    - "type": string (one of "HERO", "FEATURES", "TESTIMONIALS", "FAQ", "CUSTOM")
    - "variant": string (e.g., "default", "image_right")
    - "data": object (A "SectionData" object with "headline", optional "subheadline", "body", "cta", and "items" array for features/faq)

    Example output format:
    \`\`\`json
    {
      "seoTitle": "Expert Web Design Services | ${businessName}",
      "seoDescription": "Get a stunning, high-performance website tailored to your business. ${businessName} offers professional web design and development services to help you grow.",
      "sections": [
        {
          "type": "HERO",
          "variant": "image_right",
          "data": {
            "headline": "Welcome to ${businessName}",
            "subheadline": "Your one-stop solution for amazing things.",
            "cta": { "text": "Get Started", "link": "/contact" }
          }
        }
      ]
    }
    \`\`\`
  `;
}

function parsePageGenerationResponse(responseText: string): GeneratedPageData {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for page generation: missing JSON code block.');
  }

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    // TODO: Add Zod validation here to ensure the structure is correct.
    return parsed as GeneratedPageData;
  } catch (err) {
    throw new Error('Failed to parse page data from AI response: ' + (err as Error).message);
  }
}

export async function generatePageData(onboardingData: Onboarding, page: Page): Promise<GeneratedPageData> {
  const prompt = buildPagePrompt(onboardingData, page);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parsePageGenerationResponse(text);
}