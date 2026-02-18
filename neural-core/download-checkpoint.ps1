# Downloads the Wav2Lip checkpoint into ./checkpoints using HuggingFace Hub.
# Requires: a HuggingFace access token in $env:HF_TOKEN (or $env:HUGGINGFACE_HUB_TOKEN)

$ErrorActionPreference = 'Stop'

$NEURAL_CORE_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$CHECKPOINT_DIR = Join-Path $NEURAL_CORE_DIR 'checkpoints'
$CHECKPOINT_PATH = Join-Path $CHECKPOINT_DIR 'wav2lip_gan.pth'

if (!(Test-Path $CHECKPOINT_DIR)) {
  New-Item -ItemType Directory -Path $CHECKPOINT_DIR | Out-Null
}

if (Test-Path $CHECKPOINT_PATH) {
  Write-Host "Checkpoint already present: $CHECKPOINT_PATH" -ForegroundColor Green
  exit 0
}

$token = $env:HF_TOKEN
if (-not $token) { $token = $env:HUGGINGFACE_HUB_TOKEN }

if (-not $token) {
  Write-Host "HF_TOKEN is not set." -ForegroundColor Red
  Write-Host "Set it to your HuggingFace access token, then re-run:" -ForegroundColor Yellow
  Write-Host "  `$env:HF_TOKEN = '<your_token>'" -ForegroundColor White
  Write-Host "  .\\neural-core\\download-checkpoint.ps1" -ForegroundColor White
  exit 1
}

Write-Host "Installing huggingface_hub (user scope)..." -ForegroundColor Yellow
python -m pip install --user --quiet huggingface_hub

Write-Host "Downloading checkpoint from HuggingFace..." -ForegroundColor Yellow
python -c "import os; from huggingface_hub import hf_hub_download; repo_id='justinjohn/wav2lip'; filename='wav2lip_gan.pth'; local_dir=os.path.join(os.path.dirname(__file__), 'checkpoints'); token=os.environ.get('HF_TOKEN') or os.environ.get('HUGGINGFACE_HUB_TOKEN'); path=hf_hub_download(repo_id=repo_id, filename=filename, local_dir=local_dir, local_dir_use_symlinks=False, token=token); print(path)"

if (!(Test-Path $CHECKPOINT_PATH)) {
  Write-Host "Download completed but checkpoint not found at expected path: $CHECKPOINT_PATH" -ForegroundColor Red
  exit 1
}

$size = (Get-Item $CHECKPOINT_PATH).Length / 1MB
Write-Host "Downloaded: $CHECKPOINT_PATH ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
