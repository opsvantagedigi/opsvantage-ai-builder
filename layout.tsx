import { GeistSans } from 'geist/font/sans';
import { 
  LayoutDashboard, Globe, Zap, Settings, 
  CreditCard, LogOut, Command 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen bg-[#020617] text-white ${GeistSans.className} flex`}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl flex flex-col fixed h-full z-50">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
            <Command className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg">OpsVantage</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2">
          <NavItem href="/dashboard" icon={<LayoutDashboard />} label="Projects" active />
          <NavItem href="/services/domains" icon={<Globe />} label="Domains & SSL" />
          <NavItem href="/admin/marz-console" icon={<Zap />} label="MARZ Console" />
          <div className="pt-4 pb-2">
            <p className="text-xs font-mono text-slate-500 uppercase px-4">System</p>
          </div>
          <NavItem href="/dashboard/billing" icon={<CreditCard />} label="Billing" />
          <NavItem href="/dashboard/settings" icon={<Settings />} label="Settings" />
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 min-h-screen">
        {children}
      </main>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}
function NavItem({ href, icon, label, active = false }: NavItemProps) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        active 
          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)]" 
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}