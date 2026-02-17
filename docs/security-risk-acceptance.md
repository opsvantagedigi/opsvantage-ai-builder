# Security Risk Acceptance (Current)

Date: 2026-02-17

## Current posture
- `npm audit` reports 8 vulnerabilities.
- Severity split: 0 critical, 0 high, 8 moderate.
- CI gate is configured to fail only on high/critical via `npm run audit:ci`.

## Accepted residual risk
The remaining moderate vulnerabilities are transitive dependencies pulled by Prisma's current dev-tooling chain in the Prisma 7 line.

Observed chain:
- `prisma` -> `@prisma/dev` -> `@mrleebo/prisma-ast` / `hono` / `chevrotain` / nested `lodash`

## Rationale
- Platform is intentionally pinned to Prisma 7+ for current architecture and compatibility.
- Suggested npm remediation path attempts to move to Prisma 6.19.2, which is a major downgrade from our approved runtime stack.
- No high/critical findings remain after hardening.

## Controls in place
- Automated GitHub Action audit on push/PR and weekly schedule.
- CI fails on high/critical vulnerabilities.
- Manual periodic review of moderate findings during dependency maintenance windows.

## Exit criteria for this acceptance
This acceptance should be revisited when any of the following occurs:
1. Prisma upstream resolves the transitive moderate advisories in Prisma 7+.
2. A moderate finding in this chain is upgraded to high/critical severity.
3. A policy change requires zero moderate vulnerabilities.
