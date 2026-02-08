'use client'

import { PlaceholderPage } from '../../components/marketing/PlaceholderPage';
import { ShieldCheck } from 'lucide-react';

export default function EnterprisePage() {
    return (
        <PlaceholderPage
            title="Enterprise"
            gradientTitle="Secure."
            description="ISO-compliant infrastructure, dedicated nodes, and cryptographically isolated environments for global scale."
            icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
        />
    );
}
