import { GeistSans } from "geist/font/sans";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${GeistSans.className} mesh-gradient py-10 md:py-14`}>
      <div className="section-shell">
        <main className="mx-auto max-w-4xl">{children}</main>
      </div>
    </div>
  );
}