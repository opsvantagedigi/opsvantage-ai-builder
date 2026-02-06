import { Onboarding, Page, SectionType } from '@prisma/client';
import { getGenerativeModel } from './gemini';
import { GeneratedSection } from './page-generator';

function buildSectionPrompt(onboardingData: Onboarding, page: Page, sectionType: SectionType): string {
  const { businessName, description, brandVoice, targetAudience } = onboardingData;

  return `
    You are an expert web designer and copywriter. Based on the business information, generate the content for a single new webpage section.

    Business Information:
    - Business Name: ${businessName}
    - Description: ${description}
    - Brand Voice: ${brandVoice}
    - Target Audience: ${targetAudience}

    Page Details:
    - Page Title: "${page.title}"
    - Page Type: ${page.type}

    Generate a single section of type: ${sectionType}.

    Return the response as a single valid JSON object, inside a single JSON code block. Do not include any other text.
    The JSON object must be a "GeneratedSection" with these properties:
    - "type": string (must be "${sectionType}")
    - "variant": string (e.g., "default", "image_right")
    - "data": object (A "SectionData" object. This object should also include optional "imageSuggestions", "colorRecommendations", and "typographyRecommendations" properties. The "imageSuggestions" should be an array of 1-2 strings, each a detailed prompt for an image generation AI. The "colorRecommendations" should be an array of color objects with a name and hex code. The "typographyRecommendations" should be an array of typography objects with element, fontFamily, and fontWeight.)

    Example for a FEATURES section:
    {
      "type": "FEATURES",
      "variant": "grid_3_col",
      "data": {
        "headline": "Explore Our Powerful Features",
        "items": [
          { "title": "AI-Powered Insights", "description": "Leverage AI to get deep insights into your data." },
          { "title": "Seamless Integration", "description": "Integrate with all your favorite tools effortlessly." },
          { "title": "24/7 Support", "description": "Our support team is here to help you around the clock." }
        ],
        "imageSuggestions": ["A photorealistic image of a brain made of glowing neural networks, on a dark background."],
        "colorRecommendations": [
          { "name": "Primary", "hex": "#4F46E5" },
          { "name": "Background", "hex": "#F9FAFB" }
        ],
        "typographyRecommendations": [
          { "element": "Headline", "fontFamily": "Inter", "fontWeight": 700 },
          { "element": "Body", "fontFamily": "Inter", "fontWeight": 400 }
        ]
      }
    }
  `;
}

function parseSectionResponse(responseText: string): GeneratedSection {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for section: missing JSON code block.');
  }

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    // TODO: Add Zod validation here to ensure the structure is correct.
    return parsed as GeneratedSection;
  } catch (error) {
    throw new Error('Failed to parse section from AI response.');
  }
}

export async function generateSection(onboardingData: Onboarding, page: Page, sectionType: SectionType): Promise<GeneratedSection> {
  const prompt = buildSectionPrompt(onboardingData, page, sectionType);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseSectionResponse(text);
}