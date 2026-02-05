"use client"

import { useEffect, useState } from "react"
import { SitemapPage as SitemapPageType } from "@/lib/sitemap-schema"

type SitemapResponse = {
  sitemap: SitemapPageType[]
  aiTaskId?: string
}

export default function GenerateSitemapPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sitemap, setSitemap] = useState<SitemapPageType[] | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/sitemap/generate", { method: "POST" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as any).error || "Failed to generate sitemap")
      }
      const data: SitemapResponse = await res.json()
      setSitemap(data.sitemap)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // No-op: could prefetch existing sitemap in future
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Generate AI Sitemap</h1>
        <p className="text-sm text-gray-600">We’ll use your onboarding data to create a sitemap optimized for SEO, clarity, and conversion.</p>
      </header>

      <section className="space-y-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Generating sitemap…" : "✨ Generate Sitemap with AI"}
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {sitemap && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-medium">Proposed Sitemap</h2>
            <SitemapTree nodes={sitemap} />
            <div className="flex gap-3 pt-4">
              <button onClick={handleGenerate} disabled={loading} className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm">🔁 Regenerate</button>
              <a href="/generate/pages" className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white">Continue to Page Generation →</a>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

function SitemapTree({ nodes }: { nodes: SitemapPageType[] }) {
  if (!nodes?.length) return <p className="text-sm text-gray-500">No pages generated yet.</p>

  return (
    <ul className="space-y-2 rounded-md border bg-white p-4 text-sm">
      {nodes.map((node) => (
        <li key={node.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {node.title}{" "}
              <span className="text-xs uppercase text-gray-500">({node.type.toLowerCase()})</span>
            </span>
            <span className="text-xs text-gray-500">/{node.slug}</span>
          </div>
          {node.children && node.children.length > 0 && (
            <div className="ml-4 border-l pl-4">
              <SitemapTree nodes={node.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
