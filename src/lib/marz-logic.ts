export type MarzUserRole = "SOVEREIGN" | "CLIENT";

type SpeechResult = {
  audioBuffer: Buffer;
  engine: "alltalk";
};

export function getInitialVoicePayload(userRole: MarzUserRole): string {
  if (userRole === "SOVEREIGN") {
    return "Welcome home, Papa. The estate is secure.";
  }

  return "Hello, I'm MARZ. How can I help you build your digital infrastructure today?";
}

function decodeBase64Audio(base64Value: string) {
  const sanitized = base64Value.includes(",") ? base64Value.split(",").pop() ?? "" : base64Value;
  return Buffer.from(sanitized, "base64");
}

async function synthesizeWithAllTalk(text: string): Promise<SpeechResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const response = await fetch("http://127.0.0.1:7851/api/tts-generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "audio/mpeg, application/json",
    },
    body: JSON.stringify({
      text_input: text,
      text: text,
      model: "xttsv2",
      tts_model_name: "xttsv2",
      character_voice_gen: "NZ_Grounded_Female.wav",
      output_file_name: "marz_voice",
    }),
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });

  if (!response.ok) {
    throw new Error(`AllTalk request failed with status ${response.status}`);
  }

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("audio/")) {
    return {
      audioBuffer: Buffer.from(await response.arrayBuffer()),
      engine: "alltalk",
    };
  }

  const payload = (await response.json()) as {
    audioBase64?: string;
    audio?: string;
    url?: string;
    output_file_url?: string;
    data?: { audioBase64?: string; audio?: string; url?: string; output_file_url?: string };
  };

  const base64Audio = payload.audioBase64 || payload.audio || payload.data?.audioBase64 || payload.data?.audio;
  if (base64Audio) {
    return {
      audioBuffer: decodeBase64Audio(base64Audio),
      engine: "alltalk",
    };
  }

  const fileUrl = payload.output_file_url || payload.url || payload.data?.output_file_url || payload.data?.url;
  if (fileUrl) {
    const audioResponse = await fetch(fileUrl);
    if (!audioResponse.ok) {
      throw new Error(`AllTalk file fetch failed with status ${audioResponse.status}`);
    }

    return {
      audioBuffer: Buffer.from(await audioResponse.arrayBuffer()),
      engine: "alltalk",
    };
  }

  throw new Error("AllTalk returned an unsupported response payload.");
}

export async function generateSpeech(text: string): Promise<SpeechResult> {
  return synthesizeWithAllTalk(text);
}
