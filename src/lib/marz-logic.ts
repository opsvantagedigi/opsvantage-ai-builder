export type MarzUserRole = "SOVEREIGN" | "CLIENT";

type SpeechResult = {
  audioBuffer: Buffer;
  engine: "alltalk" | "edge-tts";
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

async function synthesizeWithEdgeTts(text: string): Promise<SpeechResult> {
  const normalizedText = String(text ?? "").trim();
  if (!normalizedText) {
    throw new Error("text must be a string");
  }

  const edgeTtsModule = (await import("edge-tts-universal")) as any;
  const candidate = edgeTtsModule.default ?? edgeTtsModule;
  const UniversalEdgeTTS = edgeTtsModule.UniversalEdgeTTS ?? candidate?.UniversalEdgeTTS;
  const voice = "en-NZ-MollyNeural";

  let rawAudio: unknown;
  if (typeof UniversalEdgeTTS === "function") {
    const universal = new UniversalEdgeTTS({ voice });
    if (typeof universal.synthesize === "function") {
      try {
        rawAudio = await universal.synthesize(normalizedText, {
          voice,
          format: "audio-24khz-48kbitrate-mono-mp3",
        });
      } catch {
        rawAudio = await universal.synthesize({
          text: normalizedText,
          voice,
          format: "audio-24khz-48kbitrate-mono-mp3",
        });
      }
    } else if (typeof universal.generate === "function") {
      try {
        rawAudio = await universal.generate(normalizedText, {
          voice,
          format: "audio-24khz-48kbitrate-mono-mp3",
        });
      } catch {
        rawAudio = await universal.generate({
          text: normalizedText,
          voice,
          format: "audio-24khz-48kbitrate-mono-mp3",
        });
      }
    }
  }

  const possibleFns = [candidate.generate, candidate.synthesize, candidate.tts].filter(
    (fn) => typeof fn === "function"
  );

  if (!rawAudio) {
    for (const fn of possibleFns) {
      try {
        rawAudio = await fn(normalizedText, {
          voice,
          format: "audio-24khz-48kbitrate-mono-mp3",
        });
        if (rawAudio) break;
      } catch {
      }

      try {
        rawAudio = await fn({
          text: normalizedText,
          voice,
          format: "audio-24khz-48kbitrate-mono-mp3",
        });
        if (rawAudio) break;
      } catch {
      }
    }
  }

  if (!rawAudio) {
    throw new Error("edge-tts-universal did not return audio output.");
  }

  if (Buffer.isBuffer(rawAudio)) {
    return { audioBuffer: rawAudio, engine: "edge-tts" };
  }

  if (rawAudio instanceof Uint8Array) {
    return { audioBuffer: Buffer.from(rawAudio), engine: "edge-tts" };
  }

  if (typeof rawAudio === "string") {
    return {
      audioBuffer: decodeBase64Audio(rawAudio),
      engine: "edge-tts",
    };
  }

  const objectAudio = rawAudio as { audio?: Uint8Array | string; audioBase64?: string; data?: Uint8Array };
  if (objectAudio.audio instanceof Uint8Array) {
    return { audioBuffer: Buffer.from(objectAudio.audio), engine: "edge-tts" };
  }

  if (typeof objectAudio.audio === "string") {
    return { audioBuffer: decodeBase64Audio(objectAudio.audio), engine: "edge-tts" };
  }

  if (typeof objectAudio.audioBase64 === "string") {
    return { audioBuffer: decodeBase64Audio(objectAudio.audioBase64), engine: "edge-tts" };
  }

  if (objectAudio.data instanceof Uint8Array) {
    return { audioBuffer: Buffer.from(objectAudio.data), engine: "edge-tts" };
  }

  throw new Error("edge-tts-universal returned an unsupported payload format.");
}

export async function generateSpeech(text: string): Promise<SpeechResult> {
  try {
    return await synthesizeWithAllTalk(text);
  } catch {
    return synthesizeWithEdgeTts(text);
  }
}
