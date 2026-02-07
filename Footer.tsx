import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center text-slate-400">
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="/#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} OpsVantage Digital. All rights reserved.</p>
      </div>
    </footer>
  );
}