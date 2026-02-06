import { Onboarding, Page, PageType, SectionType } from '@prisma/client';
import { getGenerativeModel } from '../../../gemini';

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
    You are an expert web designer and copywriter. Based on the business information and the specific page details, generate the content for all sections of a webpage.

    Business Information:
    - Business Name: ${businessName}
    - Description: ${description}
    - Brand Voice: ${brandVoice}
    - Target Audience: ${targetAudience}

    Page to Generate:
    - Page Title: "${page.title}"
    - Page Type: ${page.type}

    Generate the following sections: ${requestedSections.join(', ')}.
    For each section, provide a type, a variant (e.g., "default", "centered_text"), and the data for the content. The data should include a headline, and may include a subheadline, body text, and a call-to-action (CTA).

    Return the response as a valid JSON array of objects, inside a single JSON code block. Do not include any other text.
    Each object in the array must be a "GeneratedSection" with these properties:
    - "type": string (one of "HERO", "FEATURES", "TESTIMONIALS", "FAQ", "CUSTOM")
    - "variant": string (e.g., "default", "image_right")
    - "data": object (A "SectionData" object with "headline", optional "subheadline", "body", "cta", and "items" array for features/faq)

    Example for a HERO section:
    {
      "type": "HERO",
      "variant": "image_right",
      "data": {
        "headline": "Welcome to ${businessName}",
        "subheadline": "Your one-stop solution for amazing things.",
        "cta": { "text": "Get Started", "link": "/contact" }
      }
    }
  `;
}

function parsePageSectionsResponse(responseText: string): GeneratedSection[] {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for page sections: missing JSON code block.');
  }

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    // TODO: Add Zod validation here to ensure the structure is correct.
    return parsed as GeneratedSection[];
  } catch (error) {
    throw new Error('Failed to parse page sections from AI response.');
  }
}

export async function generatePageSections(onboardingData: Onboarding, page: Page): Promise<GeneratedSection[]> {
  const prompt = buildPagePrompt(onboardingData, page);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parsePageSectionsResponse(text);
}