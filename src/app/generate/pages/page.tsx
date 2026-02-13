"use client"

import { useEffect, useState } from "react"
import HeroPreview from "@/components/generator/hero-preview"

type SitemapNode = { id: string; title?: string; slug?: string }
type GeneratedPage = { title?: string; slug?: string; sections?: Array<Record<string, unknown>> }

export default function GeneratePagesPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageJson, setPageJson] = useState<GeneratedPage | null>(null)
  const [prompt, setPrompt] = useState("")
  const [sitemap, setSitemap] = useState<SitemapNode[] | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  async function loadSitemap() {
    setError(null)
    try {
      const res = await fetch("/api/sitemap/generate", { method: "POST", headers: { "Content-Type": "application/json" } })
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as Record<string, unknown>))
        const maybeError = (body as Record<string, unknown>)["error"]
        throw new Error(typeof maybeError === 'string' ? maybeError : "Failed to load sitemap")
      }
      const data = await res.json()
      setSitemap(data.sitemap || [])
      if (Array.isArray(data.sitemap) && data.sitemap.length > 0) setSelectedNodeId(data.sitemap[0].id)
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || "Could not load sitemap")
    }
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setPageJson(null)
    try {
      const selected = sitemap?.find((s) => s.id === selectedNodeId) ?? null
      const res = await fetch("/api/page/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt || null, sitemapNode: selected }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as Record<string, unknown>))
        const maybeError = (body as Record<string, unknown>)["error"]
        throw new Error(typeof maybeError === 'string' ? maybeError : "Generation failed")
      }
      const data = await res.json()
      setPageJson(data.page)
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // Optionally pre-load sitemap on mount
  useEffect(() => {
    // don't auto-run in case auth isn't set up; user can click
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Generate Page</h1>
        <p className="text-sm text-gray-600">Create a full page definition from your sitemap node or a custom prompt.</p>
      </header>

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <button onClick={loadSitemap} className="bg-gray-100 px-3 py-1 rounded">Load sitemap</button>
          <span className="text-sm text-gray-500">or provide a custom prompt</span>
        </div>

        {sitemap && (
          <div className="mt-2">
            <label className="text-sm block mb-1">Sitemap node:</label>
            <select value={selectedNodeId ?? ""} onChange={(e) => setSelectedNodeId(e.target.value)} className="w-full border rounded p-2">
              {sitemap.map((node) => (
                  <option key={node.id} value={node.id}>{node.title} — {node.slug}</option>
                ))}
            </select>
          </div>
        )}

        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Enter a prompt or leave blank to use sitemap node" className="w-full border p-3 rounded h-32" />

        <div>
          <button onClick={handleGenerate} disabled={loading} className="bg-black text-white px-4 py-2 rounded">
            {loading ? "Generating…" : "✨ Generate Page"}
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </section>

      {pageJson && (
        <section>
          <h2 className="text-lg font-medium mb-2">Generated Page</h2>
          <div className="mb-4">
            <strong className="block">Title:</strong> {pageJson.title}
            <p className="text-sm text-gray-600">Slug: {pageJson.slug}</p>
          </div>

          {/* Hero preview: map the first HERO section if present */}
            {Array.isArray(pageJson.sections) && (
            (() => {
              const hero = pageJson.sections.find((s) => (s as Record<string, unknown>)['type'] === "HERO")
              if (hero) {
                const heroObj = hero as Record<string, unknown>
                const rawTheme = (heroObj['theme'] as string) || "minimal"
                const theme = ["minimal", "futuristic", "corporate"].includes(rawTheme) ? (rawTheme as "minimal" | "futuristic" | "corporate") : "minimal"
                const content = {
                  headline: (heroObj['heading'] ?? heroObj['title'] ?? pageJson.title ?? "") as string,
                  subhead: (heroObj['body'] as string) || "",
                  ctaLabel: ((heroObj['cta'] as Record<string, unknown> | undefined)?.['label'] as string) || "Get started",
                  theme,
                }
                return (
                  <div className="space-y-3">
                    <HeroPreview content={content} />
                    <div className="flex gap-2 mt-2">
                      <button onClick={async () => {
                        try {
                          const res = await fetch('/api/page/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: pageJson }) })
                          const body = await res.json().catch(() => ({} as Record<string, unknown>))
                          const maybeError = (body as Record<string, unknown>)["error"]
                          if (!res.ok) throw new Error(typeof maybeError === 'string' ? maybeError : 'Save failed')
                          if (typeof window !== 'undefined') {
                            window.alert('Page saved: ' + (body.pageId ?? ''))
                          }
                        } catch (e: unknown) {
                          const ex = e as Error
                          if (typeof window !== 'undefined') {
                            window.alert('Save failed: ' + (ex.message || String(ex)))
                          }
                        }
                      }} className="bg-green-600 text-white px-4 py-2 rounded">Save page</button>
                      <button onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          void navigator.clipboard.writeText(JSON.stringify(pageJson, null, 2))
                        }
                      }} className="bg-gray-100 px-4 py-2 rounded">Copy JSON</button>
                    </div>
                  </div>
                )
              }
              return <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{JSON.stringify(pageJson, null, 2)}</pre>
            })()
          )}
        </section>
      )}
    </main>
  )
}
