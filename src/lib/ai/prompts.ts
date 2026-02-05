export const SYSTEM_PROMPT = `You are OPS-VANTAGE-CORE, an expert web architect. You output ONLY valid JSON. You do not explain yourself. You analyze user intent and map it to specific visual component structures.`;

export const GENERATE_SITEMAP_PROMPT = (businessProfile: string) => `
Task: Generate a sitemap for: "${businessProfile}"
Output Format:
{
  "pages": [
    { "title": "Home", "slug": "/", "purpose": "Conversion" },
    { "title": "Services", "slug": "/services", "purpose": "Information" },
    { "title": "Book Appointment", "slug": "/book", "purpose": "Action" }
  ]
}`;

export const GENERATE_SECTION_PROMPT = (sectionType: string, context: string) => `
Task: Generate a "${sectionType}" for context: "${context}"
Output Format:
{
  "_type": "${sectionType.toLowerCase()}",
  "layout": "split-screen-glass",
  "headline": "Example Headline",
  "subhead": "Example Subhead",
  "cta": { "label": "Start Now", "link": "/signup" },
  "visualPrompt": "Abstract blue glass geometric shapes, 8k render, unreal engine style"
}`;
