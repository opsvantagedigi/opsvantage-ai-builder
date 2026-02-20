# OpsVantage NZ Innovation Moat (Technical)

**Purpose:** A comprehensive, funder-friendly technical articulation of OpsVantage’s defensible R&D moat, grounded in the current production architecture.

---

## 1) R&D Intensity: Phi‑3 on Cloud Run GPU + custom Wav2Lip synthesis

### Phi‑3 inference running as our own Neural Core
OpsVantage runs a dedicated Neural Core service on Cloud Run, configured for GPU-backed inference:
- Cloud Run **Gen2** execution environment
- **GPU attached** (`--gpu 1`) with `nvidia-l4` class hardware
- Model configured as **`microsoft/Phi-3-mini-4k-instruct`**

This is not “just calling an API.” We operate the service lifecycle:
- WebSocket session handling for interactive experiences
- Cold-start management and wake orchestration
- Latency/performance instrumentation

Evidence in repo:
- Neural Core Cloud Build deploy flags: [neural-core/cloudbuild.neural-core.yaml](../../neural-core/cloudbuild.neural-core.yaml)

### Custom Wav2Lip layers for real-time “Presence”
The “Presence” moat is the voice/video synthesis pipeline:
- Text → speech synthesis (TTS)
- Face video + generated audio → lip-sync render (Wav2Lip)
- Output muxing and delivery over WebSocket

Key point for funding: this pipeline is engineered as an **end-to-end operator system**, not a demo:
- Resilient artifact sourcing
- Defensive timeouts / fallbacks
- Consistent response contract (`result` events with `audio_b64` + `video_b64`)

Sovereign artifact reference:
- Wav2Lip checkpoint is hosted in GCS and injected as an env var:
  - `gs://opsvantage-artifacts/checkpoints/wav2lip_gan.pth`

Evidence in repo:
- Checkpoint URL wiring: [neural-core/cloudbuild.neural-core.yaml](../../neural-core/cloudbuild.neural-core.yaml)

---

## 2) Scalability: Automated site-generation engine (10 pages in a bounded run)

### What “automated site generation” means here
OpsVantage’s engine produces a complete, structured site draft:
- Sitemap generation (bounded page count)
- Page generation (per page: content + section structure)
- Persistence (DB + optional CMS integration)

This is implemented as server routes/actions, with deterministic fallbacks to prevent runaway retry loops.

### Why it scales
OpsVantage scales because generation is:
- **Bounded** (default 10 pages)
- **Automatable** (no human-in-the-loop needed for the first complete draft)
- **Resilient** (fallback outputs prevent pathological token burn)

Operational proof point:
- The “First Customer” end-to-end simulation is designed to validate that 10 pages can be generated and saved in one run (even if an upstream LLM is degraded).

---

## 3) IP / Sovereignty: GCS-hosted checkpoints + owned Neural Core

### Sovereign weights: controlled, cached, and region-friendly
Instead of relying on fragile upstream downloads at runtime (rate limits, auth drift, outages), heavyweight artifacts are hosted in GCS.
This materially improves:
- Build/deploy reliability
- Repeatability for audits
- Supply-chain control

Evidence:
- Wav2Lip checkpoint GCS reference: [neural-core/cloudbuild.neural-core.yaml](../../neural-core/cloudbuild.neural-core.yaml)

### Secret Manager integration
Secrets are injected at runtime using Cloud Run Secret Manager bindings (`--set-secrets`), rather than being shipped in repo or baked into images.

Evidence:
- App secrets injection: [cloudbuild.yaml](../../cloudbuild.yaml)
- Neural Core secrets injection: [neural-core/cloudbuild.neural-core.yaml](../../neural-core/cloudbuild.neural-core.yaml)

### “Not reliant on external AI APIs” — accurately scoped
OpsVantage’s core **Presence logic** runs on our Neural Core:
- Phi‑3 inference
- TTS + video synthesis orchestration
- WebSocket streaming contract

The broader platform can still integrate with external providers for non-core workloads (e.g., marketing copy generation), but the core differentiator—interactive Presence—is operated as **our own service**.

---

## 4) Infrastructure Efficiency: enterprise latency on Google Cloud backbone

### What we can substantiate from repo evidence
Production-like testing captured Neural Core health latency in the **~0.55s range**:
- Neural Core health response time observed **542–568ms**

Evidence:
- [reports/marz-video-chat-test-20260219.md](../../reports/marz-video-chat-test-20260219.md)

### How to frame “609ms” responsibly
If you’re presenting **609ms** as a headline metric, treat it as a conservative representative figure for end-to-end responsiveness (network + service + orchestration) rather than a single isolated ping.

Best practice for a funding appendix:
- Report p50/p95 latency with sample size and date window
- Note cold-start vs warm-instance behavior
- Separate “health endpoint latency” from “full Presence (voice+video) latency”

---

## Appendix: System Insights (Launch Readiness)

OpsVantage includes a System Insights path that can surface:
- UAT crawl output (link and console error audits)
- Recent Cloud Run error logs (best-effort)
- A “System Briefing” mode for MARZ that summarizes findings

This provides operational confidence and rapid remediation loops during launch.
