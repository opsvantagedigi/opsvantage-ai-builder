import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteShell } from "@/components/layout/SiteShell";
import PWARegister from "@/components/PWARegister";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  title: "OpsVantage Digital | Sovereign Enterprise AI",
  description:
    "OpsVantage Digital is an autonomous AI website builder for high-performance brands. Design, deploy, host, secure, and scale from one platform.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "OpsVantage Digital | Autonomous AI Website Builder",
    description:
      "Build and operate enterprise-grade websites with AI workflows, managed infrastructure, integrated domains, and security automation.",
    siteName: "OpsVantage Digital",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpsVantage Digital | Autonomous AI Website Builder",
    description:
      "Build and operate enterprise-grade websites with AI workflows, managed infrastructure, integrated domains, and security automation.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <ThemeProvider>
          <PWARegister />
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
