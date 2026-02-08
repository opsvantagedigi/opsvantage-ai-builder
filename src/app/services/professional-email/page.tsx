'use client'

import { PlaceholderPage } from '../../../components/marketing/PlaceholderPage';
import { Mail } from 'lucide-react';

export default function ProfessionalEmailPage() {
    return (
        <PlaceholderPage
            title="Secure"
            gradientTitle="Email Synthesis."
            description="Architecting professional communication channels that resonate with your digital identity."
            icon={<Mail className="w-8 h-8 text-blue-400" />}
        />
    );
}
