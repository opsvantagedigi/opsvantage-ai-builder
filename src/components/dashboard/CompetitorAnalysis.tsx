'use client';

import React, { useState } from 'react';
import { CompetitorAnalysis as AnalysisType } from '@/lib/ai/design-assistant';

interface CompetitorAnalysisProps {
    workspaceId: string;
}

export function CompetitorAnalysis({ workspaceId }: CompetitorAnalysisProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisType | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const res = await fetch('/api/ai/competitor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ competitorUrl: url, workspaceId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Analysis failed');
            }

            const data = await res.json();
            setAnalysis(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Competitor Analysis</h3>
                <p className="text-sm text-slate-500 mb-6">
                    Enter a competitor's URL to analyze their strategy, tone, and site structure.
                </p>

                <form onSubmit={handleAnalyze} className="flex gap-3">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://competitor.com"
                        required
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}
            </div>

            {analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Tone & Audience */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Tone & Voice</h4>
                            <p className="text-lg text-slate-900 font-medium">{analysis.tone}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Target Audience</h4>
                            <p className="text-slate-700">{analysis.targetAudience}</p>
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Market Positioning</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Strengths</span>
                                <ul className="text-xs text-slate-600 space-y-2">
                                    {analysis.strengths.map((s, i) => <li key={i} className="flex gap-2"><span>•</span>{s}</li>)}
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">Gaps</span>
                                <ul className="text-xs text-slate-600 space-y-2">
                                    {analysis.weaknesses.map((w, i) => <li key={i} className="flex gap-2"><span>•</span>{w}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Site Structure */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:col-span-2">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Competitor Site Structure</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {analysis.structure.map((s, i) => (
                                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-xs font-bold text-slate-500 block mb-1">{s.type}</span>
                                    <p className="text-xs text-slate-700 leading-relaxed">{s.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 md:col-span-2 text-white">
                        <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <span className="text-2xl">💡</span> AI Suggestions for You
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {analysis.suggestions.map((s, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                    <p className="text-sm leading-relaxed">{s}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
