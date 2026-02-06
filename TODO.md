# ✅ VS CODE AGENT — MASTER TODO LIST FOR BUILDING A NEXT‑GEN AI WEBSITE BUILDER (10Web‑Level SaaS)

## PHASE 1 — CORE PLATFORM STABILITY & DX

### 1. Improve Developer Experience
- [x] Add clear error boundaries for all API routes (global wrapper + UI error boundaries).
- [x] Add structured logging (server + client) using Pino.
- [x] Add a global error handler for Prisma + Neon connection issues.
- [x] Add rate‑limiting middleware for AI endpoints.

### 2. Strengthen Prisma + Neon Integration
- [x] Add connection monitoring logs (dev only).
- [x] Add retry logic for transient Neon serverless disconnects.
- [x] Add a health‑check endpoint: `/api/health/db`.

### 3. Sanity CMS Hardening
- [x] Add schema validation for all generated content (Project schema).
- [x] Add a “draft vs published” workflow for generated pages (Project status).
- [x] Add a Sanity webhook to auto‑revalidate Next.js routes.

---

## PHASE 2 — AI WEBSITE GENERATION ENGINE (10Web‑Level)

### 4. AI Onboarding Wizard (Gemini‑powered)
Implement a multi‑step onboarding flow:
- [x] Business type
- [x] Industry
- [x] Brand voice
- [x] Color palette
- [x] Target audience
- [x] Competitors
- [x] Website goals
- [x] Store results in `Onboarding` table (Prisma Schema updated).
- [x] Build Onboarding UI (Multi-step form).
- [x] Connect to `/api/onboarding` endpoints.
- [x] Create a status page for website generation.

### 5. AI Sitemap Generator
- [x] Convert onboarding data → sitemap structure.
- [x] Support:
  - [x] Home
  - [x] About
  - [x] Services
  - [x] Contact
  - [x] Blog
  - [x] Custom pages

### 6. AI Page Generator
For each page:
- [x] Generate SEO‑optimized title + meta
- [x] Generate hero section
- [x] Generate features section
- [x] Generate testimonials
- [x] Generate CTA blocks
- [x] Generate FAQ
- [ ] Generate footer
- [x] Generate footer

### 7. AI Section Generator
- [ ] Build a library of reusable AI‑generated sections.
- [ ] Each section should include:
  - Layout variant
  - Copy
  - Imagery suggestions
  - Color + typography recommendations

### 8. AI Copywriting Engine
- [ ] Add Gemini prompts for:
  - Brand voice adaptation
  - SEO optimization
  - Tone transformation (professional, friendly, bold, luxury)
  - CTA optimization

---

## PHASE 3 — VISUAL WEBSITE BUILDER (10Web‑Level or Better)

### 9. Drag‑and‑Drop Editor (MVP)
Implement:
- [x] Section reordering
- [x] Section duplication
- [x] Section deletion
- [ ] Inline text editing
- [x] Live preview

### 10. AI Design Assistant
Add tools that generate:
- [ ] Color palettes
- [ ] Font pairings
- [ ] Layout suggestions
- [ ] Hero image prompts
- [ ] Icon sets

### 11. AI Image Generation Integration
Add support for:
- [ ] Hero images
- [ ] Background textures
- [ ] Illustrations
- [ ] Icons
- [ ] Product mockups

---

## PHASE 4 — MULTI‑TENANT SAAS INFRASTRUCTURE

### 12. Workspace & Team System
Add models:
- [ ] Workspace
- [ ] WorkspaceMember
- [ ] Roles: Owner, Admin, Editor

### 13. Client Management (Agency Mode)
Agencies can:
- [ ] Create client accounts
- [ ] Manage multiple websites
- [ ] Assign team members per client

### 14. Billing & Subscription System
Integrate Stripe:
- [ ] Free tier
- [ ] Pro tier
- [ ] Agency tier
- [ ] Usage‑based billing for AI tokens

### 15. Custom Domains
- [ ] Add domain verification
- [ ] Add SSL provisioning
- [ ] Add automatic DNS instructions

---

## PHASE 5 — PERFORMANCE, SEO & MARKETING

### 16. SEO Enhancements
- [ ] Auto‑generate OpenGraph images
- [ ] Auto‑generate structured data (JSON‑LD)
- [ ] Add sitemap.xml + robots.txt
- [ ] Add canonical URLs

### 17. Performance Optimization
- [ ] Add image optimization pipeline
- [ ] Add caching for AI responses
- [ ] Add incremental static regeneration (ISR)

### 18. Marketing Website for Your SaaS
Create:
- [ ] Landing page
- [ ] Pricing page
- [ ] Features page
- [ ] Blog
- [ ] Documentation

---

## PHASE 6 — QUALITY, TESTING & OBSERVABILITY

### 19. Automated Testing
Add:
- [ ] Unit tests for AI pipelines
- [ ] Integration tests for Prisma
- [ ] E2E tests for onboarding → publish flow

### 20. Observability
Add:
- [ ] Request tracing
- [ ] Error monitoring
- [ ] Performance metrics
- [ ] AI usage analytics

---

## PHASE 7 — ENTERPRISE FEATURES

### 21. White‑Label Mode
Agencies can:
- [ ] Add their logo
- [ ] Use custom domain for dashboard
- [ ] Customize email templates

### 22. Audit Logs
Track:
- [ ] Page edits
- [ ] AI generations
- [ ] User logins
- [ ] Domain changes

### 23. Role‑Based Access Control
Granular permissions:
- [ ] Edit content
- [ ] Publish content
- [ ] Manage billing
- [ ] Manage team

---

## PHASE 8 — FUTURE AI SUPERPOWERS

### 24. AI Website Refactoring
Let users ask:
- [ ] “Make my website more modern”
- [ ] “Improve my SEO”
- [ ] “Rewrite my homepage in a luxury tone”
- [ ] “Add a new section for testimonials”

### 25. AI Competitor Analysis
- [ ] Crawl competitor sites
- [ ] Extract structure + tone
- [ ] Suggest improvements

### 26. AI Analytics Insights
- [ ] Analyze traffic
- [ ] Suggest improvements
- [ ] Auto‑optimize CTAs
