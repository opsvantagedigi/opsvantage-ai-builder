import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import { MarzOperator } from "@/components/ai/MarzOperator";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpsVantage Digital | Autonomous Enterprise Web Architect",
  description: "The world's first self-healing, AI-driven website builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${inter.variable} antialiased bg-slate-950 text-white selection:bg-cyan-500/30 font-sans`}
      >
        {/* The Global "MARZ" AI Layer */}
        <MarzOperator />

        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>

        {/* Ambient Background Neural Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[140px] rounded-full mix-blend-screen animate-glow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[140px] rounded-full mix-blend-screen animate-glow [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#020617_80%)] opacity-50" />
        </div>
      </body>
    </html>
  );
}
