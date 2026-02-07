'use client';

import React, { useEffect, useState } from 'react';

interface BillingData {
    plan: string;
    stripeCurrentPeriodEnd: string | null;
}

interface BillingManagerProps {
    workspaceId: string;
}

export function BillingManager({ workspaceId }: BillingManagerProps) {
    const [billing, setBilling] = useState<BillingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBilling = async () => {
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/billing`);
                if (!res.ok) throw new Error('Failed to fetch billing info');
                const data = await res.json();
                setBilling(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBilling();
    }, [workspaceId]);

    if (loading) return <div className="p-4 text-slate-500">Loading billing...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Billing & Subscription</h3>
                    <p className="text-sm text-slate-500">Manage your workspace plan and payment methods.</p>
                </div>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {billing?.plan || 'FREE'}
                </span>
            </div>

            <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Period Ends</p>
                    <p className="text-sm text-slate-900 font-medium">
                        {billing?.stripeCurrentPeriodEnd
                            ? new Date(billing.stripeCurrentPeriodEnd).toLocaleDateString()
                            : 'N/A'}
                    </p>
                </div>

                <button className="w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    <span>Manage Subscription</span>
                    <span className="text-lg">↗</span>
                </button>

                <p className="text-[10px] text-center text-slate-400">
                    Invoices and receipts are sent to the workspace owner's email address.
                </p>
            </div>
        </div>
    );
}
