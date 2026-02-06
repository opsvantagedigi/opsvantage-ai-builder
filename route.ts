import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

// 1. Get the secret from environment variables
if (!process.env.SANITY_REVALIDATE_SECRET) {
  throw new Error('Missing SANITY_REVALIDATE_SECRET environment variable');
}
const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET;

/**
 * 2. Maps a Sanity document type and slug to a Next.js path.
 * Customize this to match your frontend routing structure.
 * @param type - The Sanity document `_type`.
 * @param slug - The document's `slug.current`.
 * @returns The Next.js path to revalidate, or null if not found.
 */
function getPathForDocument(type: string, slug?: string): string | null {
  switch (type) {
    case 'home': // Example for a singleton "Home" page document
      return '/';
    case 'page': // Example for general pages like /about, /services
      return slug ? `/${slug}` : null;
    case 'post': // Example for blog posts under /blog/
      return slug ? `/blog/${slug}` : null;
    // Add more cases for your specific document types
    default:
      return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 3. Use the `next-sanity` helper to parse and verify the request
    const { body, isValidSignature } = await parseBody<{
      _type: string;
      slug?: { current: string };
    }>(req, revalidateSecret);

    if (!isValidSignature) {
      const message = 'Invalid Sanity webhook signature';
      return new Response(JSON.stringify({ message, isValidSignature, body }), { status: 401 });
    }

    if (!body?._type) {
      return new Response('Bad Request: Missing _type in webhook body', { status: 400 });
    }

    // 4. Determine the path to revalidate and trigger it
    const stalePath = getPathForDocument(body._type, body.slug?.current);
    if (stalePath) {
      revalidatePath(stalePath);
      console.log(`Revalidated path: ${stalePath}`);
      return NextResponse.json({ revalidated: true, path: stalePath, now: Date.now() });
    }

    return NextResponse.json({ revalidated: false, message: `No path found for type "${body._type}"` });

  } catch (err: any) {
    console.error('Error in /api/revalidate:', err.message);
    return new Response(err.message, { status: 500 });
  }
}