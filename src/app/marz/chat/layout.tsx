import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  manifest: '/manifest.json',
  title: 'MARZ - Your Sovereign AI Partner',
  description: 'Your Sovereign AI Partner - Always listening, always ready',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MARZ',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: '/icons/marz-icon-192.png',
    icon: '/icons/marz-icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#06b6d4' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/marz-icon-192.png" />
        <link rel="icon" href="/icons/marz-icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MARZ" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#06b6d4" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
