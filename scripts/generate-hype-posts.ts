import { GoogleGenerativeAI } from '@google/generative-ai';
import { getOfferStatus } from '@/lib/claims-counter';

async function main() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const count = Math.max(1, Math.min(10, Number(process.env.POST_COUNT || '10') || 10));
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim();

  const sovereign = await getOfferStatus('sovereign-25');
  const remaining = sovereign.remaining ?? 0;

  const launchDate = 'March 10, 2026';
  const launchTime = '10 AM NZT';

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are MARZ, a Fortune 500 launch CMO.
Generate exactly ${count} high-conversion social posts suitable for X and LinkedIn.
Constraints:
- Each post <= 260 characters.
- Mention: "Sovereign 25" scarcity (${remaining} spots remaining).
- Mention: launch time (${launchTime}) and date (${launchDate}).
- Mention MARZ as an AI agent that grows a founder's legacy (not a template builder).
- Include a CTA to join the waitlist.
- No hashtags.
- Output ONLY valid JSON: {"posts": ["..."]}
Waitlist URL: ${appUrl || '[APP_URL_NOT_SET]'}
`;

  const res = await model.generateContent(prompt);
  const text = res.response.text().trim();

  const parsed = JSON.parse(text) as { posts?: unknown };
  const posts = Array.isArray(parsed.posts) ? parsed.posts.filter((p) => typeof p === 'string') : [];

  if (posts.length !== count) {
    throw new Error(`Unexpected output: expected ${count} posts, got ${posts.length}. Raw: ${text.slice(0, 500)}`);
  }

  console.log(JSON.stringify({ ok: true, context: { remaining, launchTime, launchDate, appUrl }, posts }, null, 2));
}

main().catch((err) => {
  console.error(String(err));
  process.exitCode = 1;
});
