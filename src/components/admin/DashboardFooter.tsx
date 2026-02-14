import Link from "next/link";

export function DashboardFooter() {
  return (
    <footer className="border-t border-amber-500/20 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-2">
        <p className="text-xs text-slate-400">© 2026 Sovereign OS v1.0</p>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/docs" className="text-slate-300 transition hover:text-amber-200">
            API Docs
          </Link>
          <Link href="/admin/dashboard" className="text-slate-300 transition hover:text-amber-200">
            System Logs
          </Link>
          <Link href="/legacy" className="text-slate-300 transition hover:text-amber-200">
            Legacy Archive
          </Link>
        </div>
      </div>
    </footer>
  );
}
