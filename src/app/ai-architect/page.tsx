'use client'

import { PlaceholderPage } from '../../components/marketing/PlaceholderPage';
import { Cpu } from 'lucide-react';

export default function AIArchitectPage() {
    return (
        <PlaceholderPage
            title="AI"
            gradientTitle="Architect."
            description="Experience the visual evolution of your digital presence. Witness the synthesis of strategy and design in 3D."
            icon={<Cpu className="w-8 h-8 text-blue-400" />}
        />
    );
}
