export type MarzUserRole = "SOVEREIGN" | "CLIENT";

export const ELEVENLABS_VOICE_PROFILE = {
  voiceId: process.env.ELEVENLABS_VOICE_ID || "7ceZgj78jCCeAW93ItNk",
  modelId: "eleven_multilingual_v2",
  modelLabel: "NZ-Aria",
  settings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.2,
    use_speaker_boost: true,
  },
} as const;

export function getInitialVoicePayload(userRole: MarzUserRole): string {
  if (userRole === "SOVEREIGN") {
    return "Welcome home, Papa. The estate is secure.";
  }

  return "Hello, I'm MARZ. How can I help you build your digital infrastructure today?";
}
