param(
  [string]$ProjectId = "opsvantage-ai-builder",
  [string]$Region = "europe-west4"
)

$ErrorActionPreference = "Stop"

$projectNumber = gcloud projects describe $ProjectId --format="value(projectNumber)"
$serviceAccount = "$projectNumber-compute@developer.gserviceaccount.com"
$runJobUri = "https://run.googleapis.com/v2/projects/$ProjectId/locations/$Region/jobs/marz-reflection-engine:run"

Write-Host "Enabling required APIs..."
gcloud services enable cloudscheduler.googleapis.com run.googleapis.com --project $ProjectId | Out-Null

Write-Host "Granting Cloud Run job invoke role to $serviceAccount..."
gcloud run jobs add-iam-policy-binding marz-reflection-engine `
  --region $Region `
  --member "serviceAccount:$serviceAccount" `
  --role roles/run.invoker | Out-Null

function Set-SchedulerJob {
  param(
    [string]$Name,
    [string]$Schedule,
    [string]$Description,
    [string]$MessageBody
  )

  $exists = $false
  try {
    gcloud scheduler jobs describe $Name --location $Region --project $ProjectId | Out-Null
    $exists = $true
  } catch {
    $exists = $false
  }

  if ($exists) {
    Write-Host "Updating scheduler job: $Name"
    gcloud scheduler jobs update http $Name `
      --project $ProjectId `
      --location $Region `
      --schedule $Schedule `
      --uri $runJobUri `
      --http-method POST `
      --oauth-service-account-email $serviceAccount `
      --oauth-token-scope "https://www.googleapis.com/auth/cloud-platform" `
      --description $Description `
      --message-body $MessageBody | Out-Null
  } else {
    Write-Host "Creating scheduler job: $Name"
    gcloud scheduler jobs create http $Name `
      --project $ProjectId `
      --location $Region `
      --schedule $Schedule `
      --uri $runJobUri `
      --http-method POST `
      --oauth-service-account-email $serviceAccount `
      --oauth-token-scope "https://www.googleapis.com/auth/cloud-platform" `
      --description $Description `
      --message-body $MessageBody | Out-Null
  }
}

# Every 15 minutes, proactive reflections
Set-SchedulerJob `
  -Name "marz-reflection-15m" `
  -Schedule "*/15 * * * *" `
  -Description "MARZ reflection loop every 15 minutes" `
  -MessageBody "{}"

# Every 4 hours, Sentinel pulse cadence
Set-SchedulerJob `
  -Name "marz-sentinel-4h" `
  -Schedule "0 */4 * * *" `
  -Description "MARZ sentinel pulse every 4 hours" `
  -MessageBody "{}"

Write-Host "Cloud Scheduler jobs configured successfully."
