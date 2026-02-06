import { NextResponse } from 'next/server';
import { generateImage } from '@/lib/ai/design-assistant';

export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as { prompt: string };

    if (!prompt) {
      return NextResponse.json({ error: 'Missing required field: prompt' }, { status: 400 });
    }

    // This currently uses a mock implementation that returns a placeholder.
    // In a real app, you would integrate with DALL-E, Midjourney, etc.
    const { url } = await generateImage(prompt);

    return NextResponse.json({ url });
  } catch (err: unknown) {
    const e = err as Error;
    console.error('[GENERATE_IMAGE_ERROR]', e);
    return NextResponse.json({ error: 'Failed to generate image.' }, { status: 500 });
  }
}