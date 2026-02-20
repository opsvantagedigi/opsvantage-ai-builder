# OpsVantage Technical Moat (Investor Notes)

## 1) Inference Economics (10-page site vs. human agency)

### What we generate
A “10-page site” in OpsVantage is not a static template swap. It’s a structured pipeline:
- Intake → business context normalization
- Sitemap generation (10+ pages)
- Per-page content generation (copy + section structure)
- Persistence (DB + optional CMS publishing)

### Cost drivers (what actually costs money)
There are only two meaningful cost buckets:
1) **LLM tokens** (text generation)
2) **Compute time** (CPU/GPU minutes while generating + persisting)

Everything else (routing, UI, caching) is noise compared to those two.

### Unit economics model (transparent + auditable)
We express cost per 10-page build as:

$$
C_{site} = C_{tokens} + C_{compute}
$$

Where:
- $C_{tokens}$ depends on total input/output tokens across the sitemap + 10 page generations.
- $C_{compute}$ depends on total CPU-seconds (and any GPU-seconds if used).

A practical way to estimate without hand-waving:
- Count **LLM calls** (1 sitemap + 10 pages + retries/fallbacks)
- Approximate **token volume** per call (prompt + completion)
- Multiply by your provider’s $/1M tokens
- Add Cloud Run time: total seconds × (vCPU $/sec + memory $/sec)

### Why OpsVantage stays cheap per site
Key architectural choices reduce runaway inference costs:
- **Deterministic fallbacks**: when AI validation fails, the system can fall back to a safe sitemap/page output to prevent multi-retry token burn.
- **Scale-to-zero services**: Cloud Run services can idle at 0 instances when not used, reducing “standing army” cost.
- **Pipeline is bounded**: the site is 10 pages by default; this caps token and compute exposure.

### Human agency comparison
A human agency’s effective cost is dominated by labor and lead time:
- Discovery + strategy + copy + design + revisions
- Typically **days to weeks** of calendar time
- Cost generally scales with stakeholders and revision loops

OpsVantage’s moat is economic:
- **Minutes instead of weeks** for first draft output
- **Marginal cost per additional site is near-linear** in tokens/compute (not linear in labor)

> Recommendation for the investor deck: present cost as a *range* with explicit assumptions (token count + compute minutes). This prevents over-claiming while still showing how quickly marginal cost collapses relative to labor.

---

## 2) Neural Latency (global response time)

### What we can substantiate today
We currently have concrete measured health-check latencies captured in an ops report:
- Health checks for Neural Core measured **542–568ms** (SLA target <1000ms)

See: [reports/marz-video-chat-test-20260219.md](../../reports/marz-video-chat-test-20260219.md)

We also expose a diagnostic endpoint that measures Neural Core health request elapsed time:
- [src/app/api/diagnostics/neural-cross-region-latency/route.ts](../../src/app/api/diagnostics/neural-cross-region-latency/route.ts)

### How to frame “609ms” in investor material
If you want to headline “609ms global response time”, ensure it is tied to a measurement run (p50/p95 and sample size). Right now, the repo’s strongest evidence is **sub-600ms** measured health latency in production-like checks.

---

## 3) Sovereign Infrastructure (checkpoints + secrets)

### Sovereign model artifacts (no brittle upstream downloads)
We host heavyweight model artifacts in GCS so deployments don’t depend on third-party rate limits or disappearing URLs.
- Wav2Lip checkpoint is referenced as a sovereign GCS object:
  - `gs://opsvantage-artifacts/checkpoints/wav2lip_gan.pth`

See: [neural-core/cloudbuild.neural-core.yaml](../../neural-core/cloudbuild.neural-core.yaml)

### Secret Manager integration (no secrets in git)
Production secrets are injected via Cloud Run Secret Manager bindings:
- App service secrets via `--set-secrets`:
  - DATABASE_URL, NEXTAUTH_SECRET, VAPID private material, service tokens

See: [cloudbuild.yaml](../../cloudbuild.yaml)

- Neural Core secrets via `--set-secrets`:
  - MEMORY_VAULT_URL, TAVILY_API_KEY, PUSH_SERVICE_TOKEN, Hugging Face tokens (when needed)

See: [neural-core/cloudbuild.neural-core.yaml](../../neural-core/cloudbuild.neural-core.yaml)

### Why this is a moat
- **Supply-chain resilience**: checkpoints are controlled, cached, and region-local.
- **Security posture**: secrets never ship with images; they are resolved at runtime.
- **Operational control**: services can be scaled to zero when inactive, reducing burn.

---

## Appendix: Ops Controls that protect unit economics
- Cloud Run deploys configured for scale-to-zero (`--min-instances 0`) to stop idle billing.
- Automated container image cleanup to limit registry storage growth.

See: [cloudbuild.yaml](../../cloudbuild.yaml) and [neural-core/cloudbuild.neural-core.yaml](../../neural-core/cloudbuild.neural-core.yaml)
