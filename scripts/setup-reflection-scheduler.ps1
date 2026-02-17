param(
  [Parameter(Mandatory = $false)]
  [string]$ProjectId = "opsvantage-ai-builder",

  [Parameter(Mandatory = $false)]
  [string]$SchedulerLocation = "us-central1",

  [Parameter(Mandatory = $false)]
  [string]$JobName = "marz-reflection-trigger",

  [Parameter(Mandatory = $false)]
  [string]$Schedule = "0 * * * *",

  [Parameter(Mandatory = $false)]
  [string]$MarzNeuralCoreUrl = "https://marz-neural-core-1018462465472.europe-west4.run.app",

  [Parameter(Mandatory = $false)]
  [string]$MessageBody = "{}"
)

$ErrorActionPreference = "Stop"

function Invoke-GCloud {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments,

    [Parameter(Mandatory = $true)]
    [int]$ExitCode
  )

  try {
    & gcloud @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "gcloud exited with code $LASTEXITCODE"
    }
  }
  catch {
    Write-Error "gcloud command failed: gcloud $($Arguments -join ' ')"
    exit $ExitCode
  }
}

function Test-SchedulerJobExists {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Project,

    [Parameter(Mandatory = $true)]
    [string]$Location
  )

  try {
    & gcloud scheduler jobs describe $Name --project $Project --location $Location | Out-Null
    return ($LASTEXITCODE -eq 0)
  }
  catch {
    return $false
  }
}

function New-LegacySchedulerJob {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Project,

    [Parameter(Mandatory = $true)]
    [string]$Location,

    [Parameter(Mandatory = $true)]
    [string]$Cron,

    [Parameter(Mandatory = $true)]
    [string]$TargetUrl,

    [Parameter(Mandatory = $true)]
    [string]$Body
  )

  $exists = Test-SchedulerJobExists -Name $Name -Project $Project -Location $Location
  $action = if ($exists) { "update" } else { "create" }

  $commandArgs = @(
    "scheduler",
    "jobs",
    $action,
    "http",
    $Name,
    "--project",
    $Project,
    "--location",
    $Location,
    "--schedule",
    $Cron,
    "--http-method",
    "POST",
    "--uri",
    $TargetUrl,
    "--description",
    "MARZ hourly reflection trigger",
    "--message-body",
    $Body,
    "--headers",
    "Content-Type=application/json"
  )

  Write-Host "$(if ($exists) { 'Updating' } else { 'Creating' }) scheduler job: $Name"
  Invoke-GCloud -Arguments $commandArgs -ExitCode 31
}

try {
  Write-Host "Enabling Cloud Scheduler API..."
  Invoke-GCloud -Arguments @("services", "enable", "cloudscheduler.googleapis.com", "--project", $ProjectId) -ExitCode 11

  $normalizedCoreUrl = $MarzNeuralCoreUrl.TrimEnd("/")
  $targetUrl = "$normalizedCoreUrl/api/reflection/trigger"

  New-LegacySchedulerJob `
    -Name $JobName `
    -Project $ProjectId `
    -Location $SchedulerLocation `
    -Cron $Schedule `
    -TargetUrl $targetUrl `
    -Body $MessageBody

  Write-Host "Scheduler reconstruction complete."
  Write-Host "Job: $JobName"
  Write-Host "Schedule: $Schedule"
  Write-Host "Target: $targetUrl"
  exit 0
}
catch {
  Write-Error "Unhandled scheduler reconstruction error: $($_.Exception.Message)"
  exit 99
}
