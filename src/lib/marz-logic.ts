export type MarzUserRole = "SOVEREIGN" | "CLIENT";

export function getInitialVoicePayload(userRole: MarzUserRole): string {
  if (userRole === "SOVEREIGN") {
    return "Welcome home, Papa. The estate is secure.";
  }

  return "Hello, I'm MARZ. How can I help you build your digital infrastructure today?";
}
