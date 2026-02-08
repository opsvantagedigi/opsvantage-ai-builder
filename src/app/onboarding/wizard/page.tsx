'use client'

import { PlaceholderPage } from '../../../components/marketing/PlaceholderPage';
import { Sparkles } from 'lucide-react';

export default function OnboardingWizardPage() {
    return (
        <PlaceholderPage
            title="Neural"
            gradientTitle="Wizard."
            description="The MARZ interview process. We synthesize your vision into a production-ready digital ecosystem."
            icon={<Sparkles className="w-8 h-8 text-cyan-400" />}
        />
    );
}
