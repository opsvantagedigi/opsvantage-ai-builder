import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { EditableText } from '@/components/builder/editable-text';

interface HeroContent {
  headline?: string;
  subhead?: string;
  cta?: string;
}

interface HeroSectionProps {
  content: HeroContent;
  onUpdate: (field: keyof HeroContent, value: string) => void;
}

export function HeroSection({ content, onUpdate }: HeroSectionProps) {
  return (
    <section className="relative min-h-150 flex items-center justify-center overflow-hidden bg-slate-50 text-slate-900">
      {/* Background Decor (Simulated AI Generation) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />
      
      <div className="container relative z-10 px-6 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          {/* EDITABLE HEADLINE */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-b from-slate-900 to-slate-600">
            <EditableText 
              value={content.headline || ''} 
              onSave={(val) => onUpdate('headline', val)} 
            />
          </h1>

          {/* EDITABLE SUBHEAD */}
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            <EditableText 
              value={content.subhead || ''} 
              onSave={(val) => onUpdate('subhead', val)} 
              className="block"
            />
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white">
              {/* EDITABLE BUTTON TEXT */}
              <EditableText 
                value={content.cta || ''} 
                onSave={(val) => onUpdate('cta', val)} 
                aiEnabled={false} // No AI rewrite for short button text
              /> 
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}