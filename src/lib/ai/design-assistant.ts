import { Onboarding } from '@prisma/client';
import { getGenerativeModel } from './gemini';

export interface ColorRecommendation {
  name: string; // e.g., "Primary", "Accent", "Background", "Text"
  hex: string;
}
export interface FontPairingRecommendation {
  heading: string; // e.g., "Inter"
  body: string; // e.g., "Roboto"
}
export interface HeroImagePrompt {
  prompt: string;
  style: string; // e.g., 'photorealistic', 'abstract', 'illustration'
}
export interface IconSetSuggestion {
  name: string; // e.g., 'user', 'settings', 'cart'
  description: string; // A brief description of the icon's appearance
}
export interface BackgroundTexturePrompt {
  prompt: string;
  style: string; // e.g., 'subtle', 'geometric', 'organic'
}

function buildColorPalettePrompt(onboardingData: Onboarding): string {
  const { businessName, description, brandVoice, designStyle } = onboardingData;

  return `
    You are an expert UI/UX designer with a deep understanding of color theory.
    Based on the following business information, generate a cohesive and accessible color palette for a website.
    Business Information:
    - Business Name: ${businessName}
    - Description: ${description}
    - Brand Voice: ${brandVoice}
    - Desired Design Style: ${designStyle}
    Generate a color palette consisting of 5 colors:
    1. Primary: The main brand color, used for key actions and highlights.
    2. Secondary: A color that complements the primary, used for less important elements.
    3. Accent: A color that stands out, used for calls-to-action or special highlights.
    4. Background: A neutral, light color for the main page background.
    5. Text: A dark, highly readable color for body text.
    Return the response as a single valid JSON array of objects, inside a single JSON code block. Do not include any other text.
    Each object in the array must have "name" and "hex" properties.

    Example output format:
    \`\`\`json
    [
      { "name": "Primary", "hex": "#4A90E2" },
      { "name": "Secondary", "hex": "#F5A623" },
      { "name": "Accent", "hex": "#BD10E0" },
      { "name": "Background", "hex": "#F8F9FA" },
      { "name": "Text", "hex": "#212529" }
    ]
    \`\`\`
  `;
}

function parseColorPaletteResponse(responseText: string): ColorRecommendation[] {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for color palette: missing JSON code block.');
  }

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    // TODO: Add Zod validation here
    return parsed as ColorRecommendation[];
  } catch {
    throw new Error('Failed to parse color palette from AI response.');
  }
}

function buildFontPairingPrompt(onboardingData: Onboarding): string {
  const { businessName, description, brandVoice, designStyle } = onboardingData;

  return `
    You are an expert UI/UX designer with a deep understanding of typography.
    Based on the following business information, recommend a font pairing for a website.

    Business Information:
    - Business Name: ${businessName}
    - Description: ${description}
    - Brand Voice: ${brandVoice}
    - Desired Design Style: ${designStyle}
    Recommend a font pairing (one font for headings, one for body text) that fits the brand. The fonts should be available on Google Fonts.
    Return the response as a single valid JSON array containing one object, inside a single JSON code block. Do not include any other text.
    The object in the array must have "heading" and "body" properties.

    Example output format:
    \`\`\`json
    [
      { "heading": "Playfair Display", "body": "Source Sans Pro" }
    ]
    \`\`\`
  `;
}


export async function generateColorPalette(onboardingData: Onboarding): Promise<ColorRecommendation[]> {
  const prompt = buildColorPalettePrompt(onboardingData);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseColorPaletteResponse(text);
}
function parseFontPairingResponse(responseText: string): FontPairingRecommendation[] {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for font pairing: missing JSON code block.');
  }
  try {
    const parsed = JSON.parse(jsonMatch[1]);
    // TODO: Add Zod validation here
    return parsed as FontPairingRecommendation[];
  } catch {
    throw new Error('Failed to parse font pairing from AI response.');
  }
}

export async function generateFontPairing(onboardingData: Onboarding): Promise<FontPairingRecommendation[]> {
  const prompt = buildFontPairingPrompt(onboardingData);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseFontPairingResponse(text);
}

function buildLayoutSuggestionsPrompt(onboardingData: Onboarding): string {
  const { businessName, description, brandVoice, designStyle } = onboardingData;

  return `
    You are an expert UI/UX designer. Based on the following business information, generate a layout suggestion for a webpage section.

    Business Information:
    - Business Name: ${businessName}
    - Description: ${description}
    - Brand Voice: ${brandVoice}
    - Desired Design Style: ${designStyle}

    Generate one layout suggestion, be descriptive and concise.
    Return the response as a single valid JSON array of objects, inside a single JSON code block. The array should contain only one object.
    Each object in the array must have "description" property.

    Example output format:
    \`\`\`json
    [
      { "description": "Full-width layout with a large image on the left and text on the right." }
    ]
    \`\`\`
  `;
}

export async function generateLayoutSuggestions(onboardingData: Onboarding): Promise<{description: string}[]> {
  const prompt = buildLayoutSuggestionsPrompt(onboardingData);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseLayoutSuggestionsResponse(text);
}
function parseLayoutSuggestionsResponse(responseText: string): { description: string }[] {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for layout suggestion: missing JSON code block.');
  }

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    // TODO: Add Zod validation here
    return parsed as { description: string }[];
  } catch {
    throw new Error('Failed to parse layout suggestion from AI response.');
  }
}

function buildHeroImagePromptsPrompt(onboardingData: Onboarding): string {
  const { businessName, description, brandVoice, designStyle } = onboardingData;

  return `
    You are a creative director and prompt engineer. Based on the following business information, generate 3 distinct and detailed prompts for a hero image for their website.

    Business Information:
    - Business Name: ${businessName}
    - Description: ${description}
    - Brand Voice: ${brandVoice}
    - Desired Design Style: ${designStyle}

    Generate 3 hero image prompts. Each prompt should be suitable for an image generation AI like DALL-E or Midjourney.
    Return the response as a single valid JSON array of objects, inside a single JSON code block. Do not include any other text.
    Each object in the array must have "prompt" and "style" properties.

    Example output format:
    \`\`\`json
    [
      { "prompt": "A wide-angle photorealistic shot of a modern, bright office with a diverse team collaborating, sun flare from the window.", "style": "photorealistic" },
      { "prompt": "An abstract digital illustration of interconnected nodes and glowing lines, representing connectivity and data flow, in brand colors.", "style": "abstract" },
      { "prompt": "A minimalist vector art piece showing a single plant growing from a circuit board, symbolizing tech growth.", "style": "illustration" }
    ]
    \`\`\`
  `;
}

function parseHeroImagePromptsResponse(responseText: string): HeroImagePrompt[] {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for hero image prompts: missing JSON code block.');
  }
  try {
    return JSON.parse(jsonMatch[1]) as HeroImagePrompt[];
  } catch {
    throw new Error('Failed to parse hero image prompts from AI response.');
  }
}

export async function generateHeroImagePrompts(onboardingData: Onboarding): Promise<HeroImagePrompt[]> {
  const prompt = buildHeroImagePromptsPrompt(onboardingData);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseHeroImagePromptsResponse(text);
}

function buildIconSetPrompt(onboardingData: Onboarding): string {
  const { businessName, description, designStyle } = onboardingData;

  return `
    You are a UI/UX icon designer. Based on the following business information, suggest a set of 5 common and relevant icons for their website.

    Business Information:
    - Business Name: ${businessName}
    - Description: ${description}
    - Desired Design Style: ${designStyle}

    Generate a set of 5 icons. For each icon, provide a common name (e.g., 'user', 'settings') and a brief visual description that matches the desired design style.
    Return the response as a single valid JSON array of objects, inside a single JSON code block. Do not include any other text.
    Each object in the array must have "name" and "description" properties.

    Example output format:
    \`\`\`json
    [
      { "name": "services", "description": "A simple, clean line-art icon of a gear or cog." },
      { "name": "about", "description": "A minimalist icon of a person's silhouette inside a circle." },
      { "name": "contact", "description": "A line-art icon of an envelope." },
      { "name": "quality", "description": "A shield icon with a checkmark inside, representing trust and quality." },
      { "name": "innovation", "description": "A lightbulb icon with a subtle glow effect." }
    ]
    \`\`\`
  `;
}

function parseIconSetResponse(responseText: string): IconSetSuggestion[] {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for icon set: missing JSON code block.');
  }
  try {
    return JSON.parse(jsonMatch[1]) as IconSetSuggestion[];
  } catch {
    throw new Error('Failed to parse icon set from AI response.');
  }
}

export async function generateIconSet(onboardingData: Onboarding): Promise<IconSetSuggestion[]> {
  const prompt = buildIconSetPrompt(onboardingData);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseIconSetResponse(text);
}

function buildBackgroundTexturePrompt(onboardingData: Onboarding): string {
  const { designStyle, colorPalette } = onboardingData;
  const colors = (colorPalette as unknown as ColorRecommendation[])?.map(c => c.hex).join(', ') || 'brand colors';

  return `
    You are a digital artist specializing in background textures. Based on the following design style, generate 3 prompts for subtle, seamless background textures for a website.

    - Desired Design Style: ${designStyle}
    - Primary Colors: ${colors}

    Generate 3 texture prompts. Each prompt should be suitable for an image generation AI like DALL-E or Midjourney and describe a tileable/seamless pattern.
    Return the response as a single valid JSON array of objects, inside a single JSON code block. Do not include any other text.
    Each object in the array must have "prompt" and "style" properties.

    Example output format:
    \`\`\`json
    [
      { "prompt": "A subtle, seamless pattern of soft, overlapping watercolor waves in light gray and pale blue, digital art.", "style": "organic" },
      { "prompt": "A minimalist, seamless geometric pattern of thin white lines forming a hexagonal grid on a light beige background.", "style": "geometric" },
      { "prompt": "A high-resolution, seamless texture of handmade recycled paper with subtle fibers and a soft, warm tint.", "style": "natural" }
    ]
    \`\`\`
  `;
}

function parseBackgroundTextureResponse(responseText: string): BackgroundTexturePrompt[] {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for background textures: missing JSON code block.');
  }
  try {
    return JSON.parse(jsonMatch[1]) as BackgroundTexturePrompt[];
  } catch {
    throw new Error('Failed to parse background textures from AI response.');
  }
}

export async function generateBackgroundTextures(onboardingData: Onboarding): Promise<BackgroundTexturePrompt[]> {
  const prompt = buildBackgroundTexturePrompt(onboardingData);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseBackgroundTextureResponse(text);
}

// Minimal image generator placeholder for route.ts
export async function generateImage(prompt: string): Promise<{ url: string }> {
  // Placeholder implementation — replace with real image provider integration
  return { url: 'https://via.placeholder.com/512?text=' + encodeURIComponent(prompt.substring(0, 40)) };
}