"use client"

import { useEffect, useState } from "react"
import { BuilderCanvas } from "@/components/builder/BuilderCanvas"
import type { GeneratedSection } from "@/lib/ai/page-generator"

type SitemapNode = { id: string; title?: string; slug?: string }
type GeneratedPage = { title?: string; slug?: string; sections?: GeneratedSection[] }

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

          {/* Builder Canvas Integration */}
          {Array.isArray(pageJson.sections) ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <BuilderCanvas
                initialSections={pageJson.sections.map((s, i) => ({
                  ...s,
                  id: (s as any).id || `section-${i}`
                }))}
                onReorder={(newSections) => {
                  setPageJson({ ...pageJson, sections: newSections });
                }}
                onUpdateSection={(id, data) => {
                  setPageJson({
                    ...pageJson,
                    sections: pageJson.sections?.map((s, i) => {
                      const currentId = (s as any).id || `section-${i}`;
                      if (currentId === id) return { ...s, data };
                      return s;
                    })
                  });
                }}
              />
              <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                <button onClick={async () => {
                  try {
                    const res = await fetch('/api/page/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: pageJson }) })
                    const body = await res.json().catch(() => ({} as Record<string, unknown>))
                    const maybeError = (body as Record<string, unknown>)["error"]
                    if (!res.ok) throw new Error(typeof maybeError === 'string' ? maybeError : 'Save failed')
                    alert('Page saved: ' + (body.pageId ?? ''))
                  } catch (e: unknown) {
                    const ex = e as Error
                    alert('Save failed: ' + (ex.message || String(ex)))
                  }
                }} className="bg-green-600 text-white px-4 py-2 rounded">
                  Save Page
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No sections generated.</p>
          )}
        </section>
      )}
    </main>
  )
}
