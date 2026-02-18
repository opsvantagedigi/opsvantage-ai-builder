# MARZ Neural Core - Deployment Script
# PowerShell script for Windows deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MARZ Neural Core - Enterprise Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$NEURAL_CORE_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$CHECKPOINT_DIR = Join-Path $NEURAL_CORE_DIR "checkpoints"
$CHECKPOINT_PATH = Join-Path $CHECKPOINT_DIR "wav2lip_gan.pth"
$ASSETS_DIR = Join-Path $NEURAL_CORE_DIR "assets"

# Step 1: Create directories
Write-Host "[Step 1/5] Creating directories..." -ForegroundColor Yellow
if (!(Test-Path $CHECKPOINT_DIR)) {
    New-Item -ItemType Directory -Path $CHECKPOINT_DIR | Out-Null
    Write-Host "  Created: $CHECKPOINT_DIR" -ForegroundColor Green
}
if (!(Test-Path $ASSETS_DIR)) {
    New-Item -ItemType Directory -Path $ASSETS_DIR | Out-Null
    Write-Host "  Created: $ASSETS_DIR" -ForegroundColor Green
}

# Step 2: Check for checkpoint
Write-Host ""
Write-Host "[Step 2/5] Checking Wav2Lip checkpoint..." -ForegroundColor Yellow
if (Test-Path $CHECKPOINT_PATH) {
    $size = (Get-Item $CHECKPOINT_PATH).Length / 1MB
    Write-Host "  Found: $CHECKPOINT_PATH ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "  NOT FOUND: $CHECKPOINT_PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "  To download the checkpoint manually:" -ForegroundColor Yellow
    Write-Host "  1. Visit: https://huggingface.co/justinjohn/wav2lip" -ForegroundColor White
    Write-Host "  2. Accept terms and download wav2lip_gan.pth" -ForegroundColor White
    Write-Host "  3. Place it in: $CHECKPOINT_DIR" -ForegroundColor White
    Write-Host ""
    Write-Host "  OR use HuggingFace CLI (if installed):" -ForegroundColor Yellow
    Write-Host "  pip install huggingface_hub" -ForegroundColor White
    Write-Host "  huggingface-cli download justinjohn/wav2lip wav2lip_gan.pth --local-dir $CHECKPOINT_DIR" -ForegroundColor White
}

# Step 3: Check for avatar video
Write-Host ""
Write-Host "[Step 3/5] Checking avatar video..." -ForegroundColor Yellow
$AVATAR_PATH = Join-Path $ASSETS_DIR "marz-face.mp4"
if (Test-Path $AVATAR_PATH) {
    Write-Host "  Found: $AVATAR_PATH" -ForegroundColor Green
} else {
    Write-Host "  NOT FOUND: $AVATAR_PATH" -ForegroundColor Yellow
    Write-Host "  Note: You can add an avatar video later" -ForegroundColor Gray
}

# Step 4: Check Docker
Write-Host ""
Write-Host "[Step 4/5] Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "  $dockerVersion" -ForegroundColor Green
    
    # Check for NVIDIA GPU support
    $nvidiaSmi = Get-Command nvidia-smi -ErrorAction SilentlyContinue
    if ($nvidiaSmi) {
        Write-Host "  NVIDIA GPU detected!" -ForegroundColor Green
        & nvidia-smi --query-gpu=name,memory.total --format=csv,noheader | ForEach-Object {
            Write-Host "    GPU: $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "  WARNING: No NVIDIA GPU detected - Wav2Lip will use CPU (slow)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERROR: Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Step 5: Build Docker image
Write-Host ""
Write-Host "[Step 5/5] Building Docker image..." -ForegroundColor Yellow
Write-Host "  This may take 10-20 minutes on first build..." -ForegroundColor Gray

Set-Location $NEURAL_CORE_DIR
docker build -t marz-neural-core:enterprise .

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "To run the container:" -ForegroundColor Cyan
    Write-Host ""
    
    if ($nvidiaSmi) {
        Write-Host "  With GPU:" -ForegroundColor Yellow
        Write-Host "  docker run --gpus all -p 8080:8080 ^" -ForegroundColor White
        Write-Host "    -v `${env:NEURAL_CORE_DIR}\checkpoints:/opt/Wav2Lip/checkpoints:ro ^" -ForegroundColor White
        Write-Host "    -v `${env:NEURAL_CORE_DIR}\assets:/workspace/neural-core/assets:ro ^" -ForegroundColor White
        Write-Host "    marz-neural-core:enterprise" -ForegroundColor White
    } else {
        Write-Host "  Without GPU (CPU only - slow):" -ForegroundColor Yellow
        Write-Host "  docker run -p 8080:8080 ^" -ForegroundColor White
        Write-Host "    -v `${env:NEURAL_CORE_DIR}\checkpoints:/opt/Wav2Lip/checkpoints:ro ^" -ForegroundColor White
        Write-Host "    -v `${env:NEURAL_CORE_DIR}\assets:/workspace/neural-core/assets:ro ^" -ForegroundColor White
        Write-Host "    -e ENABLE_GPU_ACCELERATION=false ^" -ForegroundColor White
        Write-Host "    marz-neural-core:enterprise" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "To verify deployment:" -ForegroundColor Cyan
    Write-Host "  curl http://localhost:8080/health" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "BUILD FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above and try:" -ForegroundColor Yellow
    Write-Host "  1. Ensure Docker Desktop is running" -ForegroundColor White
    Write-Host "  2. Check Docker has enough resources (4GB+ RAM)" -ForegroundColor White
    Write-Host "  3. Try: docker system prune -f" -ForegroundColor White
}
