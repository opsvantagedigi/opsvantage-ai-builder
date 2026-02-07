'use client';

import React, { useEffect, useState } from 'react';
import { AnalyticsInsight } from '@/lib/ai/design-assistant';

interface AnalyticsInsightsProps {
    workspaceId: string;
}

export function AnalyticsInsights({ workspaceId }: AnalyticsInsightsProps) {
    const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ai/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId }),
            });

            if (!res.ok) throw new Error('Failed to fetch insights');

            const data = await res.json();
            setInsights(data.insights);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [workspaceId]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 animate-pulse">Generating your strategic insights...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                <p className="text-sm text-red-600">Failed to load insights: {error}</p>
                <button onClick={fetchInsights} className="text-sm font-medium text-blue-600 hover:text-blue-700">Retry</button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-slate-900">Optimization Insights</h3>
                <button
                    onClick={fetchInsights}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{insight.metric}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${insight.impact === 'HIGH' ? 'bg-orange-50 text-orange-600' :
                                    insight.impact === 'MEDIUM' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                                }`}>
                                {insight.impact} IMPACT
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 mb-2">{insight.finding}</p>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">{insight.recommendation}</p>
                        <div className="pt-3 border-t border-slate-50">
                            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                Take Action <span>→</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {insights.length === 0 && (
                <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-12 text-center">
                    <p className="text-sm text-slate-500">Not enough data yet. Complete more actions to see insights.</p>
                </div>
            )}
        </div>
    );
}
