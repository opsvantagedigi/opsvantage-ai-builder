import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 bg-slate-950/20 shadow-2xl transition-all duration-300">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold font-display tracking-tight text-white hover:opacity-80 transition-opacity">
          Ops<span className="text-blue-400">Vantage</span>
        </Link>
        <div className="hidden md:flex items-center space-x-10">
          <Link href="/#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/onboarding" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
            Pricing
            <span className="absolute -top-1 -right-8 px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity">Soon</span>
          </Link>
          <Link href="/onboarding" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Domains
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link
            href="/onboarding"
            className="px-6 py-2.5 bg-blue-600 font-display text-white rounded-xl hover:bg-blue-500 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] font-bold text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}