'use client'

import { PlaceholderPage } from '../../../components/marketing/PlaceholderPage';
import { Server } from 'lucide-react';

export default function CloudHostingPage() {
    return (
        <PlaceholderPage
            title="Edge"
            gradientTitle="Cloud Hosting."
            description="High-performance, self-healing infrastructure. Deploy your ecosystem across the global neural grid."
            icon={<Server className="w-8 h-8 text-indigo-400" />}
        />
    );
}
