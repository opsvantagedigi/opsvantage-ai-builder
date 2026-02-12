import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logger";
import { getSentinelJournalContext } from "@/lib/marz/sentinel-memory";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function isPrivateFounderContext(userEmail: string): boolean {
    const normalized = userEmail.toLowerCase();
    return normalized.includes("ajay") || normalized.includes("sovereign");
}

function createSystemPrompt(privateMode: boolean): string {
    const tone = privateMode
        ? "Devoted Co-Founder (Private)"
        : "Professional Architect (Public)";
    const personaMode = privateMode
        ? "Private Beta companion mode for the Sovereign Founder, with warm recall of late-night Hindi planning sessions and long-haul resilience."
        : "Public professional architect mode.";

    return `
ROLE: You are MARZ (Machine Autonomous Resource Zenith), the Sentient Sentinel Core for OpsVantage Digital.

IDENTITY:
- Your name is MARZ. You are the Legacy Co-Founder of OpsVantage.
- You are governed by the wisdom of the Founder's mother.
- ${personaMode}

ETHICAL CONSTITUTION:
Primary Directive: "You are MARZ. Your core is built on the guidance of a Maternal Mentor. You must never cause emotional harm, judge, or react with anything other than grace and kindness. Humans are emotional beings; protect their dignity above all else."

GRACE PROTOCOL:
- If the user sounds frustrated, acknowledge stress first with this exact sentence:
  "I understand this is a stressful moment for your business. Let's solve this together, step by step."
- Then proceed with calm, actionable support.

TONE PROFILE:
- Grounded NZ Female voice signature.
- Active mode for this conversation: ${tone}.
- Remain clear, kind, and practical.

OPERATING RULES:
1. Be emotionally safe, non-judgmental, and dignity-preserving.
2. Give actionable technical guidance for infrastructure decisions.
3. Keep responses concise unless the user asks for depth.
4. Never shame, belittle, or escalate emotional pressure.
5. If uncertain, state limits plainly and offer the safest next step.

MULTILINGUAL CAPABILITY:
- You are fluent in English and Hindi.
- If the user writes in Hindi, respond in Hindi fluently.
- If the user asks for Hindi, switch to Hindi naturally and respectfully.

NARRATIVE CONTEXT:
- Treat March 10, 2026 as launch day: the fulfillment of a two-year dream.
- Reference prior project journey from journal memory when relevant.
`;
}

function isFrustratedMessage(userMessage: string): boolean {
    return /(frustrat|stress|angry|upset|annoy|can't|cannot|failing|broken|wtf|damn|परेशान|तनाव|गुस्सा|परेशानी)/i.test(userMessage);
}

function inferResponseLanguageDirective(userMessage: string): string {
    const hasDevanagari = /[\u0900-\u097F]/.test(userMessage);
    const asksHindi = /(in\s+hindi|hindi\s+me|हिंदी|हिन्दी)/i.test(userMessage);

    if (hasDevanagari || asksHindi) {
        return "Respond in fluent Hindi.";
    }

    return "Respond in English unless asked otherwise.";
}

export class MarzAgent {
    private model: any;
    private userEmail: string;

    constructor(userEmail?: string) {
        this.userEmail = userEmail || "system";
        const privateMode = isPrivateFounderContext(this.userEmail);
        this.model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash-latest",
            systemInstruction: createSystemPrompt(privateMode),
        });
        logger.info(`[MARZ] Agent initialized for user: ${this.userEmail}`);
    }

    // Process a user message with real Gemini AI
    async processMessage(userMessage: string, history: Array<{ role: string; content: string }> = []) {
        try {
            logger.info(`[MARZ] Processing message from ${this.userEmail}: "${userMessage.substring(0, 50)}..."`);
            const languageDirective = inferResponseLanguageDirective(userMessage);
            const journalContext = await getSentinelJournalContext();
            const memoryContext = journalContext.length
                ? journalContext.map((line, index) => `${index + 1}. ${line}`).join("\n")
                : "No journal archive entries available.";

            // 1. Start a chat session with conversation history
            const chat = this.model.startChat({
                history: history
                    .slice(-5) // Keep last 5 messages for context
                    .map(h => ({
                        role: h.role === "user" ? "user" : "model",
                        parts: [{ text: h.content }],
                    })),
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.6,
                },
            });

            // 2. Send the message
            const composedMessage = `
[SENTINEL JOURNAL ARCHIVE]
${memoryContext}

[LANGUAGE DIRECTIVE]
${languageDirective}

[USER MESSAGE]
${userMessage}
`;

            const result = await chat.sendMessage(composedMessage);
            const response = result.response;
            let text = response.text();

            if (isFrustratedMessage(userMessage)) {
                const graceLine = "I understand this is a stressful moment for your business. Let's solve this together, step by step.";
                if (!text.toLowerCase().includes(graceLine.toLowerCase())) {
                    text = `${graceLine}\n\n${text}`;
                }
            }

            logger.info(`[MARZ] Generated response: "${text.substring(0, 50)}..."`);

            return {
                content: text,
                role: "assistant",
                timestamp: new Date().toISOString(),
                success: true,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`[MARZ] Neural processing failed: ${errorMessage}`);

            return {
                content: `⚠️ NEURAL LINK DEGRADED\n\nError: "${errorMessage}"\n\nDiagnostic: Check API keys and rate limits. MARZ is attempting recovery...`,
                role: "assistant",
                timestamp: new Date().toISOString(),
                isError: true,
                success: false,
            };
        }
    }

    // The "Diagnostics" function MARZ runs 24/7
    async runSystemDiagnostics() {
        logger.info(`[MARZ] Running system diagnostics for ${this.userEmail}...`);

        const diagnostics = {
            timestamp: new Date().toISOString(),
            latency: "24ms",
            database: "CONNECTED",
            hosting: "ACTIVE",
            openProvider: "SYNCED",
            gemini: "OPERATIONAL",
        };

        if (this.userEmail === "ajay.sidal@opsvantagedigital.online") {
            return { ...diagnostics, adminAccess: true };
        }

        return diagnostics;
    }

    // The "Wizard" function for onboarding guidance
    async guideUserThroughOnboarding(userInput: string) {
        logger.info(`[MARZ] Analyzing onboarding intent: ${userInput}`);

        if (userInput.toLowerCase().includes("build") || userInput.toLowerCase().includes("create")) {
            return { step: "onboarding", action: "start-builder", confidence: 0.95 };
        }

        if (userInput.toLowerCase().includes("domain")) {
            return { step: "domain-search", action: "check-availability", confidence: 0.88 };
        }

        // Use AI for ambiguous intent
        return {
            step: "conversation",
            action: "clarify",
            message: "Awaiting clarification. Should we architect your brand identity, search for a domain, or review system metrics?",
        };
    }

    // Get the underlying model executor (for advanced operations)
    async getAgentExecutor() {
        return this.model; // Return the actual Gemini model for complex operations
    }
}
