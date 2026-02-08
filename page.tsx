'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, Monitor, Tablet, Share2,
  Sparkles, ChevronLeft, Eye 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

export default function BuilderPage({ params }: { params: { projectId: string } }) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPublishing, setIsPublishing] = useState(false);

  // MOCK: In a real app, you would fetch project data based on params.projectId
  const siteData = {
    projectName: "Project: " + params.projectId.replace(/_/g, '-'),
    headline: "Welcome to " + params.projectId.replace(/_/g, '-'), // Proves dynamic routing
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
            <h1 className="text-sm font-bold text-white">{siteData.projectName}</h1>
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
          {/* MOCK WEBSITE CONTENT (Placeholder for User's Site) */}
          <div className="w-full h-full bg-slate-50 overflow-y-auto custom-scrollbar">
            
            {/* Nav */}
            <nav className="h-16 border-b flex items-center justify-between px-8 bg-white sticky top-0 z-10">
              <span className="font-bold text-xl">NEXUS</span>
              <div className="space-x-4 text-sm font-medium">
                <span>Services</span>
                <span>About</span>
                <span className="px-4 py-2 bg-black text-white rounded-full">Contact</span>
              </div>
            </nav>

            {/* Hero */}
            <div className="py-20 px-8 text-center bg-slate-100">
              <h1 className="text-5xl font-bold mb-6 text-slate-900">
                {siteData.headline || "Innovation for the Future."}
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                We build autonomous systems for the next generation of enterprise leaders.
              </p>
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold">
                Start Building
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-8 p-12 max-w-6xl mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse" />
              ))}
            </div>

          </div>

          {/* AI OVERLAY TOOLS */}
          <div className="absolute bottom-6 right-6 z-50">
             <Button className="h-12 w-12 rounded-full bg-black text-white shadow-2xl hover:scale-110 transition-transform flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-400" />
             </Button>
          </div>

        </motion.div>
      </div>

    </div>
  );
}

interface DeviceBtnProps {
  icon: React.ReactElement;
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