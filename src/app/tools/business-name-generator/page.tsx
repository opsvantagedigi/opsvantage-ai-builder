'use client'

import { PlaceholderPage } from '../../../components/marketing/PlaceholderPage';
import { Zap } from 'lucide-react';

export default function BusinessNameGeneratorPage() {
    return (
        <PlaceholderPage
            title="Brand"
            gradientTitle="Naming AI."
            description="Synthesize the perfect identity for your digital ecosystem. Powered by direct OpenProvider API handshakes."
            icon={<Zap className="w-8 h-8 text-yellow-400" />}
        />
    );
}
