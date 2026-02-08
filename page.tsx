'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, Monitor, Tablet, Share2,
  ChevronLeft, Eye 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { RenderEngine } from './render-engine';

interface Section {
  id: string;
  type: string;
  content: {
    headline?: string;
    subhead?: string;
    cta?: string;
    items?: { title: string; desc: string; icon: string }[];
  };
}

interface SiteData {
  siteConfig: { title: string };
  sections: Section[];
}

// MOCK DATA (This replicates the JSON structure MARZ generates)
const MOCK_AI_DATA: SiteData = {
  siteConfig: { title: "Nexus Dynamics" },
  sections: [
    {
      id: "hero_01",
      type: "HERO",
      content: {
        headline: "Autonomous Intelligence for Enterprise",
        subhead: "We leverage neural networks to optimize your operational efficiency by 300%.",
        cta: "Deploy System"
      }
    },
    {
      id: "feat_01",
      type: "FEATURES",
      content: {
        headline: "Core Capabilities",
        items: [
          { title: "Neural Processing", desc: "Real-time data synthesis at the edge.", icon: "Cpu" },
          { title: "Global Security", desc: "ISO 27001 compliant infrastructure.", icon: "Shield" },
          { title: "Instant Scale", desc: "Serverless architecture that grows with you.", icon: "Zap" }
        ]
      }
    }
  ]
};

export default function BuilderPage() {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPublishing, setIsPublishing] = useState(false);
  
  // 1. LIFT STATE UP: We now manage the site data locally
  const [siteData, setSiteData] = useState<SiteData>(MOCK_AI_DATA);

  // 2. CREATE UPDATE HANDLER
  // This function finds the specific section and updates a specific key
  const handleUpdateSection = (sectionId: string, field: string, value: string) => {
    setSiteData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            content: {
              ...section.content,
              [field]: value
            }
          };
        }
        return section;
      })
    }));
    
    // TODO: Trigger "Auto-Save" indicator in header here
    console.log(`Updated ${sectionId}.${field} to:`, value);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      
      {/* 1. BUILDER TOP BAR */}
      <header className="h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 z-40">
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white">Project: Nexus Dynamics</h1>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Auto-saved
            </p>
          </div>
        </div>

        {/* Device Toggles */}
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
          <DeviceBtn icon={<Monitor />} active={device === 'desktop'} onClick={() => setDevice('desktop')} />
          <DeviceBtn icon={<Tablet />} active={device === 'tablet'} onClick={() => setDevice('tablet')} />
          <DeviceBtn icon={<Smartphone />} active={device === 'mobile'} onClick={() => setDevice('mobile')} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-slate-400">
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button 
            size="sm" 
            className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20"
            onClick={() => setIsPublishing(true)}
          >
            {isPublishing ? 'Deploying...' : 'Publish Live'} <Share2 className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      {/* 2. MAIN CANVAS AREA */}
      <div className="flex-1 relative bg-[url('https://assets.lummi.ai/assets/QmQw...grid-pattern')] bg-repeat bg-size-[50px_50px] flex items-center justify-center p-8 overflow-hidden">
        
        {/* The "Website" Container */}
        <motion.div 
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            width: device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '100%',
            height: device === 'mobile' ? '812px' : '100%'
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={`bg-white rounded-lg shadow-2xl overflow-hidden border-8 border-slate-900 relative ${
            device !== 'desktop' ? 'my-auto' : 'h-full w-full'
          }`}
        >
          {/* THE RENDER ENGINE: Replacing the hardcoded HTML */}
          <div className="w-full h-full bg-slate-50 overflow-y-auto custom-scrollbar">
            
            {/* Dynamic Navbar (Simple for now) */}
            <nav className="h-16 border-b flex items-center justify-between px-8 bg-white sticky top-0 z-50">
              <span className="font-bold text-xl tracking-tighter">OPS<span className="text-blue-600">VANTAGE</span></span>
              <div className="space-x-6 text-sm font-medium text-slate-600">
                <span>Solutions</span>
                <span>Platform</span>
                <span className="px-4 py-2 bg-slate-900 text-white rounded-full">Contact</span>
              </div>
            </nav>

            {/* INJECT THE ENGINE */}
            <RenderEngine 
              sections={siteData.sections} 
              onUpdate={handleUpdateSection} // <--- NEW PROP
            />

            {/* Dynamic Footer */}
            <footer className="py-12 bg-slate-900 text-slate-400 text-center text-sm">
              <p>© 2024 OpsVantage Digital. Powered by MARZ.</p>
            </footer>

          </div>
        </motion.div>
      </div>

    </div>
  );
}

interface DeviceBtnProps {
  icon: React.ReactElement<{ size?: number | string }>;
  active: boolean;
  onClick: () => void;
}

function DeviceBtn({ icon, active, onClick }: DeviceBtnProps) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded transition-all ${active ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
    >
      {React.cloneElement(icon, { size: 18 })}
    </button>
  );
}