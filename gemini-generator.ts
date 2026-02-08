// Moved to src/lib/ai/gemini-generator.ts
// Original file content has been relocated.
// Please refer to the new file for the implementation.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WizardState } from "@/lib/types/wizard";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function generateSiteStructure(wizardState: WizardState) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    ROLE: You are OPS-ARCHITECT, an expert UI/UX Engineer and Copywriter.
    TASK: Generate a complete website structure based on the user's intent.
    
    USER CONTEXT:
    - Business: ${wizardState.businessName}
    - Industry: ${wizardState.industry}
    - Goals: ${wizardState.goals.join(", ")}
    - Vibe: ${wizardState.designVibe}
    
    OUTPUT FORMAT: JSON ONLY. No markdown, no explanations.
    
    REQUIRED JSON SCHEMA:
    {
      "siteConfig": {
        "title": "string",
        "description": "string (SEO optimized)",
        "colors": {
          "primary": "tailwind-class (e.g. bg-blue-600)",
          "secondary": "tailwind-class",
          "background": "tailwind-class",
          "text": "tailwind-class"
        }
      },
      "sections": [
        {
          "id": "hero_01",
          "type": "HERO",
          "content": {
            "headline": "High-impact H1",
            "subhead": "Persuasive H2",
            "cta": "Button Text"
          }
        },
        {
          "id": "features_01",
          "type": "FEATURES",
          "content": {
            "headline": "Why Choose Us",
            "items": [
              { "title": "Feature 1", "desc": "Benefit 1", "icon": "Zap" },
              { "title": "Feature 2", "desc": "Benefit 2", "icon": "Shield" },
              { "title": "Feature 3", "desc": "Benefit 3", "icon": "Globe" }
            ]
          }
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("MARZ Generation Error:", error);
    throw new Error("Failed to generate site structure from AI.");
  }
}