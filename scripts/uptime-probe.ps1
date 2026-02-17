param(
  [Parameter(Mandatory = $false)]
  [string]$ProbeUrl = "https://opsvantage-ai-builder-1018462465472.europe-west4.run.app/api/diagnostics/neural-cross-region-latency",

  [Parameter(Mandatory = $false)]
  [int]$SloMs = 50,

  [Parameter(Mandatory = $false)]
  [int]$IntervalSeconds = 15,

  [Parameter(Mandatory = $false)]
  [int]$MaxConsecutiveBreaches = 3,

  [Parameter(Mandatory = $false)]
  [int]$Iterations = 0
)

$ErrorActionPreference = "Stop"

function Invoke-UptimeProbe {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [Parameter(Mandatory = $true)]
    [int]$ThresholdMs
  )

  $sampleUrl = "$Url?ts=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())&rnd=$([Guid]::NewGuid().ToString('N'))"
  $started = Get-Date
  $response = Invoke-WebRequest -Uri $sampleUrl -UseBasicParsing -TimeoutSec 60
  $elapsed = [int]((Get-Date) - $started).TotalMilliseconds
  $payload = $response.Content | ConvertFrom-Json

  $reportedMs = if ($null -ne $payload.elapsedMs) { [int]$payload.elapsedMs } else { $elapsed }
  $underSlo = $reportedMs -le $ThresholdMs

  return [PSCustomObject]@{
    measuredAt = (Get-Date).ToString("o")
    target = $payload.target
    ok = [bool]$payload.ok
    elapsedMs = $reportedMs
    underSlo = $underSlo
    httpStatus = [int]$response.StatusCode
  }
}

$consecutiveBreaches = 0
$sampleCount = 0

Write-Host "Starting uptime probe. SLO: <$SloMs ms, interval: ${IntervalSeconds}s, max consecutive breaches: $MaxConsecutiveBreaches"

while ($true) {
  $sampleCount += 1

  try {
    $result = Invoke-UptimeProbe -Url $ProbeUrl -ThresholdMs $SloMs

    if (-not $result.underSlo -or -not $result.ok) {
      $consecutiveBreaches += 1
      Write-Host ("[BREACH] {0} elapsed={1}ms ok={2} consecutive={3}" -f $result.measuredAt, $result.elapsedMs, $result.ok, $consecutiveBreaches)
    } else {
      $consecutiveBreaches = 0
      Write-Host ("[PASS]   {0} elapsed={1}ms ok={2}" -f $result.measuredAt, $result.elapsedMs, $result.ok)
    }

    if ($consecutiveBreaches -ge $MaxConsecutiveBreaches) {
      Write-Host "SLO enforcement failed: reached $consecutiveBreaches consecutive breaches."
      exit 2
    }
  }
  catch {
    $consecutiveBreaches += 1
    Write-Host ("[ERROR]  {0} {1} consecutive={2}" -f (Get-Date).ToString("o"), $_.Exception.Message, $consecutiveBreaches)
    if ($consecutiveBreaches -ge $MaxConsecutiveBreaches) {
      Write-Host "SLO enforcement failed due to repeated probe errors."
      exit 3
    }
  }

  if ($Iterations -gt 0 -and $sampleCount -ge $Iterations) {
    Write-Host "Probe completed $sampleCount iterations with no enforcement breach."
    exit 0
  }

  Start-Sleep -Seconds $IntervalSeconds
}
