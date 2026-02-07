'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BrandingSettingsProps {
    workspaceId: string;
    initialData: {
        brandingLogo?: string | null;
        brandingColors?: any;
        customDashboardDomain?: string | null;
    };
}

export function BrandingSettings({ workspaceId, initialData }: BrandingSettingsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState(initialData.brandingLogo || '');
    const [colors, setColors] = useState(initialData.brandingColors || { primary: '#3b82f6', secondary: '#1e293b' });
    const [domain, setDomain] = useState(initialData.customDashboardDomain || '');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/workspace/${workspaceId}/branding`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandingLogo: logo,
                    brandingColors: colors,
                    customDashboardDomain: domain,
                }),
            });

            if (!res.ok) throw new Error('Failed to update branding');

            router.refresh();
            alert('Branding updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Error updating branding');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-6">White-Label Branding</h2>
            <form onSubmit={handleSave} className="space-y-6">
                {/* Logo URL */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Logo URL
                    </label>
                    <input
                        type="text"
                        value={logo}
                        onChange={(e) => setLogo(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-slate-500">Provide a URL for your agency logo.</p>
                </div>

                {/* Primary Color */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Primary Color
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="color"
                            value={colors.primary}
                            onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                            className="h-8 w-8 rounded border border-slate-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={colors.primary}
                            onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Custom Domain */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Custom Dashboard Domain
                    </label>
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="dashboard.youragency.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-slate-500">Point a CNAME record to our platform to use your own domain.</p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Branding Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
