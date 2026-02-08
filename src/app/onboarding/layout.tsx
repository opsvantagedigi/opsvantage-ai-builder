import { GeistSans } from 'geist/font/sans';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen bg-slate-950 text-white ${GeistSans.className} flex flex-col`}>
      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-900">
        <div className="h-full bg-linear-to-r from-blue-500 to-cyan-400 w-[20%] transition-all duration-500" id="wizard-progress" />
      </div>
      
      <main className="grow flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
