import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'OpsVantage Digital';
    const description = searchParams.get('description') || 'The AI-powered website builder for modern businesses.';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#020617', // slate-950
            color: 'white',
            padding: '48px',
          }}
        >
          <h1 style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
            {title}
          </h1>
          <p style={{ fontSize: 30, textAlign: 'center', color: '#94a3b8' /* slate-400 */ }}>
            {description}
          </p>
          <div style={{ position: 'absolute', bottom: 40, fontSize: 20, color: '#475569' /* slate-600 */ }}>
            Powered by OpsVantage Digital
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    if (e instanceof Error) {
      console.log(`${e.message}`);
    } else {
      console.log(e);
    }
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}