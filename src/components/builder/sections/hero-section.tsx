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
  const themes = ["minimal", "futuristic", "corporate"] as const;

  return (
    <section className={cn(
      "relative min-h-[60vh] flex items-center justify-center overflow-hidden transition-colors duration-500",
      content.theme === "futuristic" && "bg-slate-950 text-white",
      content.theme === "corporate" && "bg-slate-50 text-slate-900",
      content.theme === "minimal" && "bg-white text-slate-900"
    )}>

      {/* Backgrounds */}
      {content.theme === "futuristic" && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      )}
      {content.theme === "corporate" && (
        <div className="absolute inset-0 bg-grid-slate-200/50 mask-[linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
      )}

      <div className="container relative z-10 text-center max-w-4xl group/hero">

        {/* Helper Controls (Visible on Hover of section) */}
        <div className="absolute -top-16 right-0 opacity-0 group-hover/hero:opacity-100 transition-opacity flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20 shadow-xl">
          <button
            onClick={() => {
              const currentIndex = themes.indexOf(content.theme as any);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              onUpdate('theme', nextTheme);
            }}
            className="text-xs text-foreground bg-background/80 hover:bg-background px-3 py-1.5 rounded-md border border-border shadow-sm transition-all"
          >
            🎨 Theme: {content.theme}
          </button>
          <button className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md shadow-sm transition-all flex items-center gap-1">
            ✨ AI Rewrite
          </button>
        </div>

        <h1 className={cn(
          "text-5xl md:text-7xl font-bold tracking-tight mb-6",
          content.theme === "futuristic" ? "bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60" : "text-slate-900"
        )}>
          <EditableText
            value={content.headline}
            onChange={(val) => onUpdate('headline', val)}
            className={content.theme === "futuristic" ? "text-transparent" : "text-slate-900"}
          />
        </h1>

        <p className={cn(
          "text-xl mb-8 max-w-2xl mx-auto",
          content.theme === "futuristic" ? "text-slate-400" : "text-slate-600"
        )}>
          <EditableText
            value={content.subhead}
            onChange={(val) => onUpdate('subhead', val)}
          />
        </p>

        <button className={cn(
          "px-8 py-4 rounded-full font-medium transition-all hover:scale-105 shadow-lg",
          content.theme === "futuristic" && "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25",
          content.theme === "corporate" && "bg-slate-900 hover:bg-slate-800 text-white",
          content.theme === "minimal" && "bg-black hover:bg-gray-800 text-white"
        )}>
          <EditableText
            value={content.ctaLabel}
            onChange={(val) => onUpdate('ctaLabel', val)}
          />
        </button>
      </div>
    </section>
  );
}
