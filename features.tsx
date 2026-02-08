import { motion } from 'framer-motion';
import { Zap, Shield, Globe, Cpu, Layers, Activity, LucideProps } from 'lucide-react';
import React from 'react';

const ICON_MAP: { [key: string]: React.ComponentType<LucideProps> } = { Zap, Shield, Globe, Cpu, Layers, Activity };

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

interface FeaturesContent {
  headline: string;
  items?: FeatureItem[];
}

export function FeaturesSection({ content }: { content: FeaturesContent }) {
  return (
    <section className="py-24 bg-white">
      <div className="container px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{content.headline}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.items?.map((item, i) => {
            const Icon = ICON_MAP[item.icon] || Zap;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}