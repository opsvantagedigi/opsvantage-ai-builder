import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative bg-slate-950/50 border-t border-white/5 py-12 px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-400 relative z-10">
        <div className="flex flex-col space-y-4">
          <Link href="/" className="text-2xl font-bold font-display tracking-tight text-white">
            Ops<span className="text-blue-400">Vantage</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed">
            Revolutionizing the web with AI-powered building and scaling tools for modern agencies.
          </p>
        </div>
        <div className="flex flex-col md:items-end space-y-6">
          <nav className="flex space-x-8 text-sm font-medium">
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/onboarding" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/onboarding" className="hover:text-white transition-colors">Docs</Link>
          </nav>
          <p className="text-xs">&copy; {new Date().getFullYear()} OpsVantage Digital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}