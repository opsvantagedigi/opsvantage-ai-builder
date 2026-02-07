import Link from 'next/link';

export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 py-6 px-4 sm:px-6 lg:px-8">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">
          OpsVantage
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/#features" className="text-slate-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">
            Pricing
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/onboarding" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold">
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}