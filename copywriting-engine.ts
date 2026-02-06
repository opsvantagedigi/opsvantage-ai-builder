import type { OnboardingData as Onboarding } from '@/types/onboarding';
import { getGenerativeModel } from './gemini';

export type RefineInstruction =
  | 'IMPROVE'
  | 'SHORTER'
  | 'LONGER'
  | 'PROFESSIONAL'
  | 'FRIENDLY'
  | 'LUXURY'
  | 'BOLD'
  | 'SEO_OPTIMIZATION'
  | 'CTA_OPTIMIZATION';

const instructionMap: Record<RefineInstruction, string> = {
  IMPROVE: 'Improve the following text to be more engaging and clear.',
  SHORTER: 'Make the following text shorter and more concise.',
  LONGER: 'Expand on the following text, adding more detail and description.',
  PROFESSIONAL: 'Rewrite the following text in a professional and formal tone.',
  FRIENDLY: 'Rewrite the following text in a friendly and approachable tone.',
  LUXURY: 'Rewrite the following text in a luxurious and sophisticated tone.',
  BOLD: 'Rewrite the following text in a bold, confident, and assertive tone.',
  SEO_OPTIMIZATION: 'Rewrite the following text to be SEO-friendly. Naturally incorporate relevant keywords based on the business information provided, focusing on clarity and search engine visibility.',
  CTA_OPTIMIZATION: 'Rewrite the following text to be a more compelling and action-oriented Call to Action (CTA).',
};

function buildRefineTextPrompt(
  onboardingData: Onboarding,
  textToRefine: string,
  instruction: RefineInstruction
): string {
  const { businessName, description, brandVoice, targetAudience } = onboardingData;
  const instructionText = instructionMap[instruction];

  return `
    You are an expert copywriter. Your task is to refine a piece of text based on a specific instruction, while keeping the business context in mind.

    Business Information:
    - Business Name: ${businessName}
    - Description: ${description}
    - Brand Voice: ${brandVoice}
    - Target Audience: ${targetAudience}

    Instruction: ${instructionText}

    Original Text:
    ---
    ${textToRefine}
    ---

    Return only the refined text, without any additional commentary, formatting, or quotation marks.
  `;
}

function parseRefineTextResponse(responseText: string): string {
  // The AI is instructed to return only the text, so we can just trim it.
  return responseText.trim().replace(/^"|"$/g, ''); // Also remove leading/trailing quotes
}

export async function refineText(
  onboardingData: Onboarding,
  textToRefine: string,
  instruction: RefineInstruction
): Promise<string> {
  const prompt = buildRefineTextPrompt(onboardingData, textToRefine, instruction);
  const model = await getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseRefineTextResponse(text);
}