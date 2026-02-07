import type { OnboardingData as Onboarding } from '@/types/onboarding';
import type { GeneratedSection, PageType } from './page-generator';
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

export async function generateLayoutSuggestions(onboardingData: Onboarding): Promise<{ description: string }[]> {
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


// Real image generator using OpenAI DALL-E 3
import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable.');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function generateImage(prompt: string): Promise<{ url: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is missing. Returning placeholder.');
      return { url: 'https://via.placeholder.com/1024x1024?text=' + encodeURIComponent(prompt.substring(0, 40)) };
    }

    console.time("OpenAI Image Gen");
    const client = getOpenAIClient();
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    console.timeEnd("OpenAI Image Gen");

    if (!response.data || !response.data[0]) throw new Error("No data returned from OpenAI");

    const url = response.data[0].url;
    if (!url) throw new Error("No image URL returned from OpenAI");

    return { url };
  } catch (error) {
    console.error("Image Generation Failed:", error);
    // Fallback to placeholder on error to prevent app crash
    return { url: 'https://via.placeholder.com/1024x1024?text=Generation+Failed' };
  }
}

// =========================
// AI REFACTORING LOGIC
// =========================

function buildRefactorPrompt(sections: GeneratedSection[], instruction: string, onboarding?: Onboarding): string {
  const context = onboarding
    ? `Business Context: ${onboarding.businessName} - ${onboarding.description}. Brand Voice: ${onboarding.brandVoice}.`
    : '';

  return `
    You are an expert UI/UX designer and web developer. 
    You are given a JSON array representing the current sections of a website page.
    Your task is to refactor/transform this JSON based on the user's instructions.

    ${context}

    Current Sections JSON:
    ${JSON.stringify(sections, null, 2)}

    User Instruction: "${instruction}"

    Requirements:
    1. Return ONLY the updated JSON array of sections.
    2. Maintain the "type", "variant", and "data" structure for each section.
    3. You can modify existing sections (rewrite text, change variants), add new sections, or remove sections if the instruction implies it.
    4. Valid section types are: "HERO", "FEATURES", "TESTIMONIALS", "FAQ", "CUSTOM".
    5. Each section's "data" must follow the SectionData schema (headlines, subheadlines, body, items with titles/descriptions, etc.).
    6. Respond ONLY with valid JSON inside a single JSON code block.

    Example output:
    \`\`\`json
    [
      { "type": "HERO", "variant": "modern", "data": { ... } },
      ...
    ]
    \`\`\`
  `;
}

function parseRefactorResponse(responseText: string): GeneratedSection[] {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for refactoring: missing JSON code block.');
  }

  try {
    return JSON.parse(jsonMatch[1]) as GeneratedSection[];
  } catch (err: any) {
    throw new Error('Failed to parse refactored sections: ' + err.message);
  }
}

/**
 * Refactors page sections based on natural language instructions.
 */
export async function refactorPageData(
  sections: GeneratedSection[],
  instruction: string,
  onboarding?: Onboarding
): Promise<GeneratedSection[]> {
  const prompt = buildRefactorPrompt(sections, instruction, onboarding);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseRefactorResponse(text);
}

// =============================
// AI COMPETITOR ANALYSIS LOGIC
// =============================

export interface CompetitorAnalysis {
  tone: string;
  targetAudience: string;
  strengths: string[];
  weaknesses: string[];
  structure: {
    type: string;
    description: string;
  }[];
  suggestions: string[];
}

function buildCompetitorAnalysisPrompt(rawContent: string): string {
  return `
    You are a strategic marketing consultant and expert UI/UX analyst.
    I will provide you with the raw text content from a competitor's website.
    Your task is to analyze this content and provide a structured analysis to help our user improve their own website.

    Raw Competitor Content:
    ${rawContent.substring(0, 10000)}

    Requirements:
    1. Identify the brand's "Tone" (e.g., Professional, Playful, Luxury).
    2. Identify the likely "Target Audience".
    3. List 3-4 "Strengths" of their content/messaging.
    4. List 3-4 "Weaknesses" or gaps.
    5. Outline their site "Structure" (the types of sections they seem to use).
    6. Provide 3-4 actionable "Suggestions" for our user.
    7. Respond ONLY with a valid JSON object inside a single JSON code block.

    JSON Structure:
    {
      "tone": "...",
      "targetAudience": "...",
      "strengths": ["...", "..."],
      "weaknesses": ["...", "..."],
      "structure": [
        { "type": "...", "description": "..." }
      ],
      "suggestions": ["...", "..."]
    }
  `;
}

function parseCompetitorAnalysisResponse(responseText: string): CompetitorAnalysis {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for competitor analysis: missing JSON code block.');
  }

  try {
    return JSON.parse(jsonMatch[1]) as CompetitorAnalysis;
  } catch (err: any) {
    throw new Error('Failed to parse competitor analysis: ' + err.message);
  }
}

/**
 * Analyzes raw content from a competitor website.
 */
export async function analyzeCompetitor(rawContent: string): Promise<CompetitorAnalysis> {
  const prompt = buildCompetitorAnalysisPrompt(rawContent);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseCompetitorAnalysisResponse(text);
}

// =============================
// AI ANALYTICS INSIGHTS LOGIC
// =============================

export interface AnalyticsInsight {
  metric: string;
  finding: string;
  recommendation: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

function buildAnalyticsInsightsPrompt(data: any): string {
  return `
    You are a data scientist and conversion rate optimization (CRO) expert.
    I will provide you with workspace usage data and site activity logs.
    Your task is to analyze this data and provide 3-4 actionable "Analytics Insights" to help the user grow their business.

    Input Data:
    ${JSON.stringify(data, null, 2)}

    Requirements:
    1. Analyze the relationship between pages generated, published actions, and overall activity.
    2. Provide 3-4 insights, each with:
       - "metric": The data point being analyzed.
       - "finding": What the data reveals.
       - "recommendation": A specific action the user should take (e.g., "Refactor your Hero section").
       - "impact": How significant this change would be (HIGH, MEDIUM, LOW).
    3. Respond ONLY with a valid JSON array of objects inside a single JSON code block.

    Example output:
    \`\`\`json
    [
      {
        "metric": "AI Refactor Usage",
        "finding": "You haven't used the AI Refactor tool on your most visited page yet.",
        "recommendation": "Try the 'Modernize' instruction on your landing page to improve engagement.",
        "impact": "HIGH"
      }
    ]
    \`\`\`
  `;
}

function parseAnalyticsInsightsResponse(responseText: string): AnalyticsInsight[] {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('Invalid AI response format for analytics: missing JSON code block.');
  }

  try {
    return JSON.parse(jsonMatch[1]) as AnalyticsInsight[];
  } catch (err: any) {
    throw new Error('Failed to parse analytics insights: ' + err.message);
  }
}

/**
 * Generates actionable insights based on workspace usage and activity.
 */
export async function generateAnalyticsInsights(data: any): Promise<AnalyticsInsight[]> {
  const prompt = buildAnalyticsInsightsPrompt(data);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseAnalyticsInsightsResponse(text);
}