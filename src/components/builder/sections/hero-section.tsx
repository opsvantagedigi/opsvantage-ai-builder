import { cn } from "@/lib/utils";
import { EditableText } from "@/components/builder/editable-text";

interface HeroProps {
  content: {
    headline: string;
    subhead: string;
    ctaLabel: string;
    theme: "minimal" | "futuristic" | "corporate";
  };
  onUpdate: (field: string, value: string) => void; // Handle manual edits
}

export function HeroSection({ content, onUpdate }: HeroProps) {
  return (
    <section className={cn(
      "relative min-h-[600px] flex items-center justify-center overflow-hidden",
      content.theme === "futuristic" && "bg-slate-950 text-white"
    )}>
      
      {/* Dynamic Background */}
      {content.theme === "futuristic" && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950" />
      )}

      <div className="container relative z-10 text-center max-w-4xl">
        
        {/* Magic "AI Rewrite" Button (Visible on Hover) */}
        <div className="absolute -top-12 right-0 group-hover:opacity-100 opacity-0 transition-opacity">
           <button className="text-xs bg-blue-600 px-2 py-1 rounded flex items-center gap-1">
             ✨ Rewrite
           </button>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          <EditableText 
            value={content.headline} 
            onChange={(val) => onUpdate('headline', val)} 
          />
        </h1>

        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          <EditableText 
            value={content.subhead} 
            onChange={(val) => onUpdate('subhead', val)} 
          />
        </p>

        <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-medium transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]">
          {content.ctaLabel}
        </button>
      </div>
    </section>
  );
}
