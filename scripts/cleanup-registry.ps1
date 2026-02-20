param(
  [int]$Hours = 24,
  [string]$ProjectId = $env:GOOGLE_CLOUD_PROJECT,
  [string[]]$Repositories = @()
)

$ErrorActionPreference = 'Stop'

function Resolve-ProjectId {
  param([string]$Value)
  if ($Value -and $Value.Trim()) { return $Value.Trim() }
  try {
    $p = (gcloud config get-value project 2>$null).Trim()
    if ($p) { return $p }
  } catch {}
  throw 'ProjectId is required (set GOOGLE_CLOUD_PROJECT or pass -ProjectId)'
}

$ProjectId = Resolve-ProjectId -Value $ProjectId

if (-not $Repositories -or $Repositories.Count -eq 0) {
  $Repositories = @(
    "gcr.io/$ProjectId/opsvantage-ai-builder",
    "gcr.io/$ProjectId/marz-neural-core"
  )
}

$cutoff = (Get-Date).ToUniversalTime().AddHours(-1 * [Math]::Abs($Hours))
Write-Host "[cleanup-registry] Project: $ProjectId" -ForegroundColor Cyan
Write-Host "[cleanup-registry] Cutoff (UTC): $($cutoff.ToString('o'))" -ForegroundColor Cyan

foreach ($repo in $Repositories) {
  Write-Host "[cleanup-registry] Scanning $repo" -ForegroundColor Yellow

  $json = gcloud container images list-tags $repo --limit=999999 --format=json 2>$null
  if (-not $json) {
    Write-Host "[cleanup-registry] No tags returned for $repo (or repo missing)." -ForegroundColor DarkYellow
    continue
  }

  $items = $json | ConvertFrom-Json
  if (-not $items) {
    Write-Host "[cleanup-registry] No items for $repo." -ForegroundColor DarkYellow
    continue
  }

  $digestsToDelete = New-Object System.Collections.Generic.HashSet[string]

  foreach ($item in $items) {
    $digest = [string]$item.digest
    if (-not $digest) { continue }

    $ts = $null
    try {
      # list-tags returns timestamp.datetime (RFC3339) in many cases
      $dt = $item.timestamp.datetime
      if ($dt) { $ts = [DateTime]::Parse($dt).ToUniversalTime() }
    } catch {}

    if (-not $ts) {
      # If we can't parse timestamp, skip (avoid deleting unknown)
      continue
    }

    if ($ts -lt $cutoff) {
      [void]$digestsToDelete.Add($digest)
    }
  }

  if ($digestsToDelete.Count -eq 0) {
    Write-Host "[cleanup-registry] No digests older than $Hours hours for $repo." -ForegroundColor Green
    continue
  }

  foreach ($digest in $digestsToDelete) {
    $ref = "$repo@$digest"
    Write-Host "[cleanup-registry] Deleting $ref" -ForegroundColor Magenta
    try {
      gcloud container images delete $ref --force-delete-tags --quiet | Out-Null
    } catch {
      Write-Host "[cleanup-registry] Delete failed for $ref: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
  }
}

Write-Host "[cleanup-registry] Complete." -ForegroundColor Cyan
