'use client'

import { PlaceholderPage } from '../../../components/marketing/PlaceholderPage';
import { MousePointer2 } from 'lucide-react';

export default function LogoMakerPage() {
    return (
        <PlaceholderPage
            title="Neural"
            gradientTitle="Logo Synthesis."
            description="Generate high-fidelity vector identities that resonate with your brand strategy."
            icon={<MousePointer2 className="w-8 h-8 text-cyan-400" />}
        />
    );
}
