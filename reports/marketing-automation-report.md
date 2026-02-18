# Marketing Automation Report

Date: 2026-02-18
Engine: /api/marketing/hype-posts?count=3
Status: FAILED (404 Not Found)

## Executive Summary
- Live endpoint check to https://opsvantagedigital.online/api/marketing/hype-posts?count=3 returned 404.
- This route is not yet deployed on the live host (dashboard build failed earlier due to missing NEXTAUTH_SECRET).
- Action: fix build, redeploy, then re-run this report to capture live MARZ output.

## Post #1 (Disruption)
- Title: "The Era of the Template is Over."
- Status: Not generated (endpoint 404). Placeholder only.

## Post #2 (The Partner)
- Title: "Meet MARZ."
- Status: Not generated (endpoint 404). Placeholder only.

## Post #3 (The Scarcity)
- Title: "The Sovereign 25."
- Status: Not generated (endpoint 404). Placeholder only.

## Raw Response (truncated)
HTTP 404
"<!DOCTYPE html><html lang=\"en\" data-brand-workspace=\"default\"><head><meta charSet=\"utf-8\"/>..."

## Next Action
Re-run once the dashboard deploy succeeds and GEMINI_API_KEY is present in the runtime environment.
