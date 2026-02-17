'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MAX_LOGO_BYTES = 250_000; // 250KB (keeps DB payload reasonable for data URLs)

async function fileToDataUrl(file: File): Promise<string> {
    if (file.size > MAX_LOGO_BYTES) {
        throw new Error(`Logo too large. Max ${Math.round(MAX_LOGO_BYTES / 1000)}KB.`);
    }

    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : null;
            if (!result) {
                reject(new Error('Failed to encode file'));
                return;
            }
            resolve(result);
        };
        reader.readAsDataURL(file);
    });
}

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
    const [logoUploading, setLogoUploading] = useState(false);

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
                {/* Logo */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Logo
                    </label>
                    <div className="flex flex-col gap-3">
                        <input
                            type="file"
                            accept="image/*"
                            disabled={loading || logoUploading}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setLogoUploading(true);
                                try {
                                    const dataUrl = await fileToDataUrl(file);
                                    setLogo(dataUrl);
                                } catch (err) {
                                    console.error(err);
                                    alert(err instanceof Error ? err.message : 'Failed to upload logo');
                                } finally {
                                    setLogoUploading(false);
                                    e.target.value = '';
                                }
                            }}
                            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                        />

                        {logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logo} alt="Brand logo preview" className="h-12 w-auto rounded-md border border-slate-200 bg-white p-1" />
                        ) : null}
                    </div>

                    <div className="mt-3">
                    <input
                        type="text"
                        value={logo}
                        onChange={(e) => setLogo(e.target.value)}
                        placeholder="Paste a logo URL or upload above"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-slate-500">Upload a logo (stored as a compact data URL) or provide a hosted URL.</p>
                    </div>
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

                {/* Secondary Color */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Secondary Color
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="color"
                            value={colors.secondary}
                            onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                            className="h-8 w-8 rounded border border-slate-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={colors.secondary}
                            onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
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
                        disabled={loading || logoUploading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : logoUploading ? 'Uploading...' : 'Save Branding Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
