# Security Risk Acceptance Register

Date: 2026-02-17  
Repository: opsvantage-ai-builder  
Owner: Engineering

## Scope
This register documents currently accepted vulnerabilities after remediation and major-platform upgrades (Next 16, React 19, Prisma 7.4).

## Current Security Posture
- High vulnerabilities: 0
- Critical vulnerabilities: 0
- Remaining vulnerabilities: Moderate only (transitive)

## Accepted Residual Risk
### Prisma Toolchain Transitive Moderates
The remaining moderate advisories are introduced through Prisma internal development tooling (`@prisma/dev`) and its parser chain (`@mrleebo/prisma-ast`, `chevrotain`, transitive `lodash`) plus transitive `hono` advisories from that same path.

#### Why accepted for now
1. No high/critical findings remain.
2. The vulnerable packages are transitive and not directly imported in application runtime code.
3. npm recommends a downgrade path (`prisma@6.19.2`) as the automatic fix, which conflicts with the adopted Prisma 7.4 baseline.
4. Build and runtime validations pass on the upgraded stack.

#### Mitigations in place
- CI audit gate fails on any high/critical findings (`npm run audit:strict`).
- Dependency upgrades are tracked and applied regularly.
- Runtime attack surface hardened via role checks, auth middleware/proxy, and outbound allowlists.

## Revisit Criteria
Reassess this risk immediately when one of the following occurs:
- Prisma publishes an upstream fix removing these transitive advisories in Prisma 7+.
- A moderate advisory is reclassified to high/critical.
- New exploitability evidence indicates practical runtime impact in this project context.

## Next Review Date
2026-03-17
