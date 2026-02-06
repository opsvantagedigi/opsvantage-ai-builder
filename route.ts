import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Input validation schema for the CTA optimization request.
 */
const optimizeCtaRequestSchema = z.object({
  originalText: z.string().min(3, 'Original text must be at least 3 characters.'),
  context: z.string().min(10, 'Context must be at least 10 characters.'),
  goal: z.enum(['increase-clicks', 'build-trust', 'create-urgency']),
});

/**
 * Persona-based instructions for the AI to adopt for CTA optimization.
 */
const ctaInstructions: Record<string, string> = {
  'increase-clicks':
    'Focus on action-oriented language. Use strong verbs and highlight the immediate benefit to the user. Make it sound easy and rewarding.',
  'build-trust':
    'Focus on reducing user anxiety. Use words that imply security, support, and no commitment, like "free," "no-risk," or "guided."',
  'create-urgency':
    'Focus on scarcity or time-sensitivity. Use words like "now," "limited-time," "today," or "before it\'s gone" to encourage immediate action.',
};

/**
 * Initializes the Google Generative AI client.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Server is missing GEMINI_API_KEY' }, { status: 500 });
    }

    const body = await request.json();
    const validation = optimizeCtaRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { originalText, context, goal } = validation.data;
    const instruction = ctaInstructions[goal];

    const prompt = `
      **Role:** You are a world-class Conversion Rate Optimization (CRO) expert specializing in copywriting.

      **Goal:** Generate 3 alternative versions for a call-to-action (CTA) button or link.

      **Optimization Goal:** ${instruction}

      **Context:** The CTA is placed within this section of a webpage:
      """
      ${context}
      """

      **Original CTA Text:** "${originalText}"

      **Task:**
      1.  Generate three new, improved CTA text options based on the optimization goal.
      2.  For each option, provide a brief, one-sentence rationale explaining why it is effective.
      3.  Return the response as a valid JSON array of objects, where each object has a "text" and "rationale" property.

      **JSON Output Example:**
      [
        { "text": "Get Started for Free", "rationale": "This reduces friction by highlighting that there is no cost to begin." },
        { "text": "Claim Your Spot", "rationale": "This creates a sense of ownership and urgency." }
      ]
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // The model should return a JSON string, so we parse it.
    const ctaVariations = JSON.parse(responseText);

    return NextResponse.json({ ctaVariations });

  } catch (error) {
    console.error('Error optimizing CTA:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while optimizing the CTA.' }, { status: 500 });
  }
}