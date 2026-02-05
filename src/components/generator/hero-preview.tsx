"use client"

interface HeroPreviewProps {
  content: {
    headline: string
    subhead?: string
    ctaLabel?: string
    theme?: "minimal" | "futuristic" | "corporate"
  }
}

export default function HeroPreview({ content }: HeroPreviewProps) {
  return (
    <section className={`relative min-h-55 flex items-center justify-center overflow-hidden ${content.theme === 'futuristic' ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'} rounded-lg shadow-sm p-8`}>
      <div className="max-w-3xl text-center">
        <h2 className="text-3xl font-bold mb-3">{content.headline}</h2>
        {content.subhead && <p className="text-lg text-slate-500 mb-4">{content.subhead}</p>}
        <div className="flex justify-center">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full">{content.ctaLabel || 'Get started'}</button>
        </div>
      </div>
    </section>
  )
}
