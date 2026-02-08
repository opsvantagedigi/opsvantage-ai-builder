'use client'

import { PlaceholderPage } from '../../components/marketing/PlaceholderPage';
import { Globe } from 'lucide-react';

export default function ShowcasePage() {
    return (
        <PlaceholderPage
            title="Live"
            gradientTitle="Showcase."
            description="A curated gallery of autonomous digital platforms architected by MARZ."
            icon={<Globe className="w-8 h-8 text-indigo-400" />}
        />
    );
}
