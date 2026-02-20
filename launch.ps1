# OpsVantage Launch Day Master Script - March 10, 2026
Write-Host "Initializing Launch Day Protocol for OpsVantage Digital..." -ForegroundColor Cyan

# 1. Disable "Coming Soon" Gatekeeper
Write-Host "Disabling 'Coming Soon' mode..." -ForegroundColor Yellow
gcloud run services update opsvantage-ai-builder `
  --update-env-vars "NEXT_PUBLIC_LAUNCH_MODE=RELEASE" `
  --region us-central1

# 2. Scale Infrastructure for Traffic
Write-Host "Scaling infrastructure..." -ForegroundColor Yellow
gcloud run services update opsvantage-ai-builder `
  --min-instances 0 `
  --max-instances 10 `
  --cpu-boost `
  --region us-central1

# 3. Final Health Check
Write-Host "Running Final Zenith Pulse..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "https://opsvantagedigital.online/api/marz/heartbeat"
if ($response.status -eq "ZENITH_ACTIVE") {
  Write-Host "SYSTEM ONLINE: OpsVantage is LIVE." -ForegroundColor Green
} else {
  Write-Host "ALERT: Heartbeat failed post-launch." -ForegroundColor Red
}
