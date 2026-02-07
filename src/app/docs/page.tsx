"use client";

import Link from 'next/link';
import { Header } from '../../../Header';
import { Footer } from '../../../Footer';
import { Book, FileText, Activity, ArrowLeft, ChevronRight } from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="mesh-gradient min-h-screen flex flex-col selection:bg-blue-500/30 overflow-hidden">
            <Header />

            <main className="grow pt-40 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Universe</span>
                    </Link>

                    <header className="mb-24">
                        <h1 className="text-6xl md:text-8xl font-display font-black text-white mb-8 tracking-tighter">
                            Neural <span className="text-gradient-deep">Knowledge.</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                            Everything you need to build, deploy, and scale with OpsVantage AI. Explore our technical blueprints and strategic guides.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <DocCard
                            icon={<Book className="w-6 h-6 text-blue-400" />}
                            title="Getting Started"
                            desc="The essential guide to launching your first AI-generated project."
                            href="https://github.com/opsvantagedigi/opsvantage-ai-builder/blob/main/getting-started.md"
                        />
                        <DocCard
                            icon={<FileText className="w-6 h-6 text-emerald-400" />}
                            title="Deployment Guide"
                            desc="Advanced strategies for edge deployment and domain management."
                            href="https://github.com/opsvantagedigi/opsvantage-ai-builder/blob/main/docs/deployment_guide.md"
                        />
                        <DocCard
                            icon={<Activity className="w-6 h-6 text-purple-400" />}
                            title="API Reference"
                            desc="Deep dive into our neural endpoints and integration patterns."
                            href="/onboarding"
                        />
                        <DocCard
                            icon={<FileText className="w-6 h-6 text-orange-400" />}
                            title="Brand Identity"
                            desc="Maintaining visual precision with our design system."
                            href="/onboarding"
                        />
                    </div>

                    <div className="mt-24 p-12 glass rounded-[32px] border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-600/20 transition-colors" />
                        <h3 className="text-2xl font-display font-bold text-white mb-4 tracking-tight">Need technical support?</h3>
                        <p className="text-slate-400 mb-8 max-w-lg">Our neural engineers are standing by to help you solve complex deployment architecture challenges.</p>
                        <Link href="/onboarding" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-premium">
                            Contact Ops Support <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function DocCard({ icon, title, desc, href }: { icon: React.ReactNode, title: string, desc: string, href: string }) {
    return (
        <Link href={href} className="glass p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-premium group">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{desc}</p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
                Read Spec <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
}
