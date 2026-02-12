# ISO 27001 Evidence Appendix (Zenith)

This appendix is the single source of truth for aligning OpsVantage AI Builder with ISO 27001 controls during the stealth-to-launch window. Keep it versioned, update when controls change, and attach citations when audits occur.

## Control Mappings

| Control ID | Strategic Purpose | Evidence Implementation |
| --- | --- | --- |
| A.9.4.1 | Information Access Restriction | `src/middleware.ts` (pre-launch redirects and allowlist gating) |
| A.12.1.2 | Change Management | `prisma/migrations` (immutable DB history) + Cloud Build logs |
| A.14.2.1 | Secure Development | `Dockerfile` (multi-stage build, `SKIP_DB_CHECK` guard) |
| A.12.4.1 | Event Logging | `scripts/weekly-health-report.ts` (diagnostics, uptime signals) |
| A.18.1.3 | Protection of Records | `scripts/export-leads.ts` (controlled CSV extraction) |

## Evidence Collection Playbook

- **Code provenance:** Use git commit SHAs and Cloud Build IDs to tie releases to reviewed changes.
- **Database change traceability:** Reference `prisma/migrations/*` folders and migration timestamps; avoid ad-hoc DDL.
- **Access control:** Confirm middleware gating is active when `NEXT_PUBLIC_LAUNCH_MODE` is not released; document exceptions.
- **Operational signals:** Archive outputs from `scripts/weekly-health-report.ts` and `src/app/api/marz/heartbeat/route.ts` for availability evidence.
- **Data handling:** When exporting leads, store CSV artifacts in a restricted bucket and note requester/approver.

## Audit Readiness Checklist

- Current release tag, Cloud Build ID, and deployment timestamp recorded.
- Last successful heartbeat and health report archived within the last 24 hours.
- Migrations applied match `prisma/migrations` and have no drift in production.
- Resend blast dry-run logs retained before live sends.
- Exceptions/waivers documented with expiry dates.

## Change and Release Controls

- All production changes must flow through PR review plus Cloud Build; emergency changes require a post-incident PR.
- Keep `Dockerfile` and environment guards (`SKIP_DB_CHECK`, `NEXT_PUBLIC_LAUNCH_MODE`) aligned with runbook states.
- Maintain a short release note per deployment: scope, risk, rollback, and owner.

## Contacts

- Security and compliance owner: **ops@opsvantage.ai** (rotating on-call).
- Engineering lead on duty: see current on-call in team calendar; include build ID and SHA in escalations.
