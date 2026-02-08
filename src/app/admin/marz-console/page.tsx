'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal, Activity, ShieldCheck, DollarSign,
    Globe, Server, Cpu, AlertTriangle, Lock, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering for this auth-protected page
export const dynamic = 'force-dynamic';

const AUTHORIZED_EMAIL = "ajay.sidal@opsvantagedigital.online";

export default function MarzCommandConsole() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // CLIENT-SIDE AUTH GUARD
    useEffect(() => {
        const checkAuth = async () => {
            // In production, replace with real session check via useSession()
            // For MVP/Demo, we allow access in development mode
            const isDev = process.env.NODE_ENV === 'development';
            setIsAuthorized(isDev); // Allow in dev, block in prod until NextAuth is configured
            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    // STATE MANAGEMENT
    const [logs, setLogs] = useState<string[]>([]);
    const [systemHealth, setSystemHealth] = useState(98);
    const [activeUsers, setActiveUsers] = useState(142);
    const [revenueToday, setRevenueToday] = useState(1250);

    // SIMULATE MARZ \"THINKING\" STREAM
    useEffect(() => {
        if (!isAuthorized) return;

        const interval = setInterval(() => {
            const messages = [
                "[MARZ]: Scanning Vercel Edge Network... Latency 24ms.",
                "[MARZ]: Optimization complete for User #8821 (Dental Clinic).",
                "[MARZ]: OpenProvider API Handshake successful. Token refreshed.",
                "[MARZ]: Detecting slight anomaly in US-East-1. Re-routing...",
                "[MARZ]: New subscription detected: PRO Plan ($49/mo).",
                "[MARZ]: Database backup to Neon.tech encrypted and stored."
            ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${randomMsg}`, ...prev.slice(0, 15)]);
    }, 2500);
    return () => clearInterval(interval);
}, [isAuthorized]);

if (isLoading) {
    return (
        <div className=\"min-h-screen bg-[#020617] flex items-center justify-center\">
            < div className =\"flex flex-col items-center gap-4\">
                < Loader2 className =\"w-12 h-12 text-cyan-500 animate-spin\" />
                    < span className =\"text-cyan-400 font-mono text-sm tracking-widest uppercase animate-pulse\">Establishing Secure Uplink...</span>
                </div >
            </div >
        );
}

if (!isAuthorized) {
    return (
        <div className=\"min-h-screen bg-[#020617] flex flex-col items-center justify-center text-red-500 font-mono\">
            < Lock className =\"w-16 h-16 mb-4\" />
                < h1 className =\"text-2xl font-bold\">ACCESS DENIED</h1>
                    < p className =\"text-slate-500 mt-2\">Neural Link Rejected. Authorization Protocol Failed.</p>
                        < button
    onClick = {() => router.push('/')
}
className =\"mt-6 px-6 py-2 border border-red-500/30 hover:bg-red-500/10 rounded transition-colors\"
    >
    Return to Safety
                </button >
            </div >
        );
    }

return (
    <div className=\"min-h-screen bg-[#020617] text-white font-mono overflow-hidden relative\">

{/* BACKGROUND AMBIENCE */ }
<div className=\"absolute inset-0 z-0 pointer-events-none\">
    < div className =\"absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50\" />
        < div className =\"absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[100px] rounded-full\" />
            </div >

    {/* HEADER: COMMAND STATUS */ }
    < header className =\"relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md p-6 flex justify-between items-center\">
        < div className =\"flex items-center gap-4\">
            < div className =\"relative\">
                < div className =\"w-3 h-3 bg-green-500 rounded-full animate-ping absolute\" />
                    < div className =\"w-3 h-3 bg-green-500 rounded-full relative\" />
                    </div >
    <h1 className=\"text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400\">
MARZ_OPERATOR // <span className=\"text-white text-base font-normal uppercase\">GOD_MODE</span>
                    </h1 >
                </div >
    <div className=\"flex items-center gap-6 text-sm text-slate-400\">
        < span className =\"flex items-center gap-2 font-bold\"><Lock className=\"w-4 h-4 text-green-500\" /> SECURE CONN: {AUTHORIZED_EMAIL}</span>
            < span className =\"flex items-center gap-2\"><Server className=\"w-4 h-4\" /> VERCEL: ONLINE</span>
                < span className =\"flex items-center gap-2\"><Globe className=\"w-4 h-4\" /> OPENPROVIDER: CONNECTED</span>
                </div >
            </header >

    {/* MAIN GRID */ }
    < main className =\"relative z-10 p-6 grid grid-cols-12 gap-6 h-[calc(100vh-80px)]\">

{/* COL 1: REAL-TIME METRICS (3 COLS) */ }
<div className=\"col-span-3 flex flex-col gap-6\">
    < MetricCard
icon = {< Activity className =\"text-green-400\" />}
label =\"SYSTEM INTEGRITY\"
value = {`${systemHealth}%`}
trend =\"+0.2%\"
    />
    <MetricCard
        icon={<Cpu className=\"text-blue-400\" />}
label =\"ACTIVE NODES (USERS)\"
value = { activeUsers.toString() }
trend =\"+12 this hour\"
    />
    <MetricCard
        icon={<DollarSign className=\"text-yellow-400\" />}
label =\"REVENUE (24H)\"
value = {`$${revenueToday}`}
trend =\"Stripe Webhook Active\"
    />

    <div className=\"bg-white/5 border border-white/10 rounded-xl p-4 mt-auto\">
        < h3 className =\"text-xs text-slate-500 mb-4 uppercase tracking-wider\">Emergency Overrides</h3>
            < div className =\"space-y-2\">
                < button className =\"w-full text-left px-4 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded transition-colors flex items-center gap-2 font-bold uppercase tracking-tighter\">
                    < AlertTriangle className =\"w-4 h-4\" /> PURGE CACHE (ALL)
                            </button >
    <button className=\"w-full text-left px-4 py-2 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded transition-colors flex items-center gap-2 font-bold uppercase tracking-tighter\">
        < ShieldCheck className =\"w-4 h-4\" /> ROTATE API KEYS
                            </button >
                        </div >
                    </div >
                </div >

    {/* COL 2: THE NEURAL STREAM (6 COLS) */ }
    < div className =\"col-span-6 flex flex-col\">
        < div className =\"flex-1 bg-black/60 border border-white/10 rounded-xl overflow-hidden flex flex-col relative shadow-[0_0_50px_-10px_rgba(6,182,212,0.15)]\">
            < div className =\"bg-white/5 p-3 border-b border-white/5 flex justify-between items-center\">
                < span className =\"text-xs text-cyan-400 flex items-center gap-2 font-bold tracking-widest uppercase\">
                    < Terminal className =\"w-4 h-4\" /> LIVE NEURAL LOGS
                            </span >
    <div className=\"flex gap-1\">
        < div className =\"w-2 h-2 rounded-full bg-red-500/50\" />
            < div className =\"w-2 h-2 rounded-full bg-yellow-500/50\" />
                < div className =\"w-2 h-2 rounded-full bg-green-500/50\" />
                            </div >
                        </div >

    <div className=\"flex-1 p-4 overflow-y-auto font-mono text-sm space-y-3 custom-scrollbar\">
        <AnimatePresence>
{
    logs.map((log, i) => (
        <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`border-l-2 pl-3 ${log.includes(\"Anomaly\") ? \"border-red-500 text-red-300\" :
                                                log.includes(\"subscription\") ? \"border-yellow-500 text-yellow-300\" :
                \"border-blue-500 text-blue-100\"
                                            }`}
        >
            {log}
        </motion.div>
    ))
}
                            </AnimatePresence >
    <div className=\"animate-pulse text-cyan-500\">_</div>
                        </div >

    <div className=\"p-4 bg-white/5 border-t border-white/10\">
        < input
type =\"text\"
placeholder =\"Command MARZ (e.g., 'Run diagnostics on OpenProvider endpoint')...\"
className =\"w-full bg-transparent border-none outline-none text-white placeholder-slate-600 font-bold\"
    />
                        </div >
                    </div >
                </div >

    {/* COL 3: GLOBAL MAP / DOMAINS (3 COLS) */ }
    < div className =\"col-span-3 flex flex-col gap-6\">
        < div className =\"bg-white/5 border border-white/10 rounded-xl p-4 h-1/2 relative overflow-hidden\">
            < h3 className =\"text-xs text-slate-400 mb-2 flex items-center gap-2 font-bold uppercase tracking-widest\">
                < Globe className =\"w-4 h-4\" /> GLOBAL TRAFFIC
                        </h3 >
    <div className=\"absolute inset-0 flex items-center justify-center opacity-30\">
        < div className =\"w-32 h-32 border-4 border-cyan-500/30 rounded-full animate-ping\" />
                        </div >
    <div className=\"relative z-10 text-center mt-12\">
        < div className =\"text-2xl font-bold text-white tracking-widest uppercase\">NZ, AU, US</div>
            < div className =\"text-xs text-slate-500 uppercase tracking-widest font-bold\">Top Regions Active</div>
                        </div >
                    </div >

    <div className=\"bg-gradient-to-b from-blue-900/20 to-black border border-blue-500/20 rounded-xl p-4 h-1/2\">
        < h3 className =\"text-xs text-blue-400 mb-4 flex items-center gap-2 font-bold uppercase tracking-widest\">
            < Server className =\"w-4 h-4\" /> RECENT DOMAINS
                        </h3 >
    <ul className=\"space-y-3 text-sm\">
        < li className =\"flex justify-between text-slate-300 font-bold\">
            < span > crypto - safe.nz</span >
                <span className=\"text-green-400\">ACTIVE</span>
                            </li >
    <li className=\"flex justify-between text-slate-300 font-bold\">
        < span > dental - pro.com</span >
            <span className=\"text-yellow-400\">PENDING</span>
                            </li >
    <li className=\"flex justify-between text-slate-300 font-bold\">
        < span > agency - flow.io</span >
            <span className=\"text-green-400\">ACTIVE</span>
                            </li >
                        </ul >
                    </div >
                </div >

            </main >
        </div >
    );
}

function MetricCard({ icon, label, value, trend }: any) {
    return (
        <div className=\"bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-colors\">
            < div className =\"flex justify-between items-start mb-2\">
    { icon }
    <span className=\"text-xs text-slate-500 font-bold uppercase\">{trend}</span>
            </div >
        <div className=\"text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold\">{label}</div>
            < div className =\"text-3xl font-bold text-white font-sans tracking-tighter\">{value}</div>
        </div >
    );
}
