import Link from 'next/link';
import { Zap, Github, Twitter, Linkedin, Facebook, ArrowRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black border-t border-white/5 pt-24 pb-12 px-6 lg:px-8 overflow-hidden z-10 transition-premium">
      <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:rotate-6 transition-all overflow-hidden bg-white/5">
                <img src="/logo.png" alt="OpsVantage Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-black font-display tracking-tight text-white">
                Ops<span className="text-blue-400">Vantage</span>
              </span>
            </Link>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm font-medium">
              The neural operating system for modern digital agencies. Automate strategy, design, and growth with AI precision.
            </p>
            <div className="flex items-center gap-6">
              <SocialLink icon={<Twitter className="w-5 h-5" />} href="https://twitter.com/opsvantage" />
              <SocialLink icon={<Github className="w-5 h-5" />} href="https://github.com/opsvantagedigi" />
              <SocialLink icon={<Linkedin className="w-5 h-5" />} href="https://linkedin.com/company/opsvantage" />
            </div>
          </div>

          {/* Sitemaps */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Platform</h4>
            <ul className="space-y-4">
              <FooterLink href="/#features" text="AI Builder" />
              <FooterLink href="/#features" text="Domain Portal" />
              <FooterLink href="/#features" text="Enterprise" />
              <FooterLink href="/#pricing" text="Pricing" />
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Resources</h4>
            <ul className="space-y-4">
              <FooterLink href="/docs" text="Documentation" />
              <FooterLink href="/docs" text="API Reference" />
              <FooterLink href="/onboarding" text="Case Studies" />
              <FooterLink href="/onboarding" text="Changelog" />
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Company</h4>
            <ul className="space-y-4">
              <FooterLink href="/onboarding" text="About Us" />
              <FooterLink href="/onboarding" text="Privacy Policy" />
              <FooterLink href="/onboarding" text="Terms of Service" />
              <FooterLink href="/onboarding" text="Global Status" />
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:row items-center justify-between gap-6">
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            <span>&copy; {currentYear} OPSVANTAGE DIGITAL</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-slate-800" />
            <span className="hidden md:block italic">ALL SYSTEMS OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest group-hover:mr-2 transition-all">Back to top</span>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center -rotate-90 group-hover:bg-white group-hover:text-black transition-premium">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, text }: { href: string, text: string }) {
  return (
    <li>
      <Link href={href} className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block font-medium text-sm">
        {text}
      </Link>
    </li>
  );
}

function SocialLink({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <Link href={href} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-400 hover:-translate-y-1 transition-all duration-300">
      {icon}
    </Link>
  );
}