// types/ai.d.ts
declare module 'ai' {
  export interface StreamTextResult {
    textStream: AsyncIterable<string>;
    usage: Promise<{
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }>;
    finishReason: Promise<string>;
  }

  export function streamText(options: {
    model: string;
    prompt: string;
  }): StreamTextResult;
}