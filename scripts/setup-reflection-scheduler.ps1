param(
  [string]$ProjectId = "opsvantage-ai-builder",
  [string]$RunRegion = "europe-west4",
  [string]$SchedulerLocation = "us-central1"
)

$ErrorActionPreference = "Stop"

function Invoke-GCloudCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  & gcloud @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "gcloud command failed: gcloud $($Arguments -join ' ')"
  }
}

$projectNumber = (& gcloud projects describe $ProjectId --format="value(projectNumber)").Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($projectNumber)) {
  throw "Unable to resolve project number for $ProjectId"
}

$serviceAccount = "$projectNumber-compute@developer.gserviceaccount.com"
$runJobUri = "https://run.googleapis.com/v2/projects/$ProjectId/locations/$RunRegion/jobs/marz-reflection-engine:run"

Write-Host "Enabling required APIs..."
Invoke-GCloudCommand -Arguments @("services", "enable", "cloudscheduler.googleapis.com", "run.googleapis.com", "--project", $ProjectId)

Write-Host "Granting Cloud Run job invoke role to $serviceAccount..."
Invoke-GCloudCommand -Arguments @(
  "run", "jobs", "add-iam-policy-binding", "marz-reflection-engine",
  "--project", $ProjectId,
  "--region", $RunRegion,
  "--member", "serviceAccount:$serviceAccount",
  "--role", "roles/run.invoker"
)

function Set-SchedulerJob {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Schedule,
    [Parameter(Mandatory = $true)]
    [string]$Description,
    [Parameter(Mandatory = $true)]
    [string]$MessageBody
  )

  & gcloud scheduler jobs describe $Name --project $ProjectId --location $SchedulerLocation | Out-Null
  $exists = ($LASTEXITCODE -eq 0)
  $action = "create"
  if ($exists) {
    $action = "update"
  }

  $verb = "Creating"
  if ($exists) {
    $verb = "Updating"
  }

  $baseArgs = @(
    "scheduler", "jobs", $action, "http", $Name,
    "--project", $ProjectId,
    "--location", $SchedulerLocation,
    "--schedule", $Schedule,
    "--uri", $runJobUri,
    "--http-method", "POST",
    "--oauth-service-account-email", $serviceAccount,
    "--oauth-token-scope", "https://www.googleapis.com/auth/cloud-platform",
    "--description", $Description,
    "--message-body", $MessageBody
  )

  Write-Host "$verb scheduler job: $Name"
  Invoke-GCloudCommand -Arguments $baseArgs
}

Set-SchedulerJob -Name "marz-reflection-15m" -Schedule "*/15 * * * *" -Description "MARZ reflection loop every 15 minutes" -MessageBody "{}"
Set-SchedulerJob -Name "marz-sentinel-4h" -Schedule "0 */4 * * *" -Description "MARZ sentinel pulse every 4 hours" -MessageBody "{}"

Write-Host "Cloud Scheduler jobs configured successfully."
