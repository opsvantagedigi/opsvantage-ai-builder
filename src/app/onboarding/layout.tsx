import { GeistSans } from "geist/font/sans";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${GeistSans.className} section-shell py-8`}>
      <div className="surface-glass overflow-hidden rounded-2xl">
        <div className="h-1 w-full bg-slate-200 dark:bg-slate-800">
          <div
            id="wizard-progress"
            className="h-full w-[20%] bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
          />
        </div>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
