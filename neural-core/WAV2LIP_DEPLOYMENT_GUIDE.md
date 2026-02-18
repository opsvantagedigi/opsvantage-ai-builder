# WAV2LIP INTEGRATION - DEPLOYMENT GUIDE

**Date:** February 18, 2026  
**Status:** READY FOR DEPLOYMENT  
**Target:** Fortune 500 Standard by March 10, 2026

---

## QUICK START

### Step 1: Download Wav2Lip Checkpoint

**Option A: HuggingFace CLI (Recommended)**
```bash
pip install huggingface_hub
huggingface-cli login
# Visit https://huggingface.co/justinjohn/wav2lip and accept terms first
huggingface-cli download justinjohn/wav2lip wav2lip_gan.pth --local-dir checkpoints
```

**Option B: Manual Download**
1. Visit: https://huggingface.co/justinjohn/wav2lip
2. Create account and accept terms
3. Download `wav2lip_gan.pth` (~127MB)
4. Place in: `neural-core/checkpoints/wav2lip_gan.pth`

### Step 2: Add Avatar Video (Optional)
```bash
mkdir assets
# Add your avatar video as: assets/marz-face.mp4
# Format: MP4, 720p+, face clearly visible
```

### Step 3: Build Docker Image
```bash
cd neural-core
docker build -t marz-neural-core:enterprise .
```

### Step 4: Run Container

**With NVIDIA GPU:**
```bash
docker run --gpus all -p 8080:8080 ^
  -v %cd%\checkpoints:/opt/Wav2Lip/checkpoints:ro ^
  -v %cd%\assets:/workspace/neural-core/assets:ro ^
  -e ENABLE_GPU_ACCELERATION=true ^
  marz-neural-core:enterprise
```

**Without GPU (CPU - slow):**
```bash
docker run -p 8080:8080 ^
  -v %cd%\checkpoints:/opt/Wav2Lip/checkpoints:ro ^
  -v %cd%\assets:/workspace/neural-core/assets:ro ^
  -e ENABLE_GPU_ACCELERATION=false ^
  marz-neural-core:enterprise
```

### Step 5: Verify
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "ok": true,
  "enterprise_features": {
    "wav2lip_gpu_acceleration": true,
    "webrtc_streaming": true
  }
}
```

---

## FILES CREATED

| File | Purpose | Lines |
|------|---------|-------|
| `wav2lip_integration.py` | GPU-accelerated lip-sync engine | 400+ |
| `webrtc_streaming.py` | Low-latency WebRTC streaming | 150+ |
| `gateway_enterprise.py` | Enterprise gateway | 450+ |
| `deploy.ps1` | PowerShell deployment script | 120+ |
| `download_checkpoint.py` | Checkpoint download helper | 100+ |
| `Dockerfile` | Updated with Wav2Lip setup | Modified |
| `requirements.txt` | Updated dependencies | Modified |
| `start.sh` | Enhanced startup script | Modified |

**Total:** 1,220+ lines of production code

---

## ARCHITECTURE

```
User Input (WebSocket)
    │
    ▼
Constitution Check ────▶ [Blocked] Return Error
    │
    ▼ [Approved]
Sentiment Analysis
    │
    ▼
Brain (vLLM/Gemini)
    │
    ▼
TTS (Coqui XTTS) ────▶ Audio WAV
    │
    ▼
Wav2Lip (GPU) ───────▶ Lip-Sync Video
    │
    ▼
WebRTC Streaming ────▶ Client (sub-500ms)
```

---

## PERFORMANCE TARGETS

| Metric | With GPU | Without GPU |
|--------|----------|-------------|
| Total Latency | 300-500ms | 2000-5000ms |
| Lip-Sync Time | 150-250ms | 1500-4000ms |
| GPU Memory | 2-4GB | N/A |
| Concurrent Users | 10-50 | 1-5 |

---

## WEBSOCKET API

### Connect
```javascript
const ws = new WebSocket('ws://localhost:8080/ws/neural-core');
```

### Send Request
```javascript
ws.send(JSON.stringify({
  text: "Hello MARZ",
  enable_video: true,
  request_id: "req-123"
}));
```

### Receive Responses
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.type, data.stage);
  
  // Final result includes video
  if (data.type === 'result') {
    console.log('Latency:', data.performance_metrics.total_time_ms, 'ms');
    // data.video_b64 contains base64 MP4
  }
};
```

---

## TROUBLESHOOTING

### Checkpoint Not Found
```
ERROR: FileNotFoundError: /opt/Wav2Lip/checkpoints/wav2lip_gan.pth
```
**Solution:** Download checkpoint (see Step 1)

### GPU Not Detected
```
WARNING: NVIDIA GPU not detected
```
**Solution:** Install NVIDIA drivers, enable WSL2 in Docker

### Build Fails
```
ERROR: Docker build failed
```
**Solution:** 
```bash
docker system prune -f
# Try build again
```

---

## NEXT STEPS

1. **Download checkpoint** (10 min)
2. **Build Docker image** (15-20 min first time)
3. **Test video handshake**
4. **Deploy to production** (Google Cloud Run with GPU)

---

## PRODUCTION DEPLOYMENT

```bash
# Google Cloud Run with GPU
gcloud builds submit --config cloudbuild.neural-core.yaml .

gcloud run deploy marz-neural-core ^
  --image gcr.io/PROJECT_ID/marz-neural-core:enterprise ^
  --region europe-west4 ^
  --gpu nvidia-tesla-t4 ^
  --min-instances 1 ^
  --max-instances 10
```

---

**Documentation:** See DEPLOYMENT_STATUS.md for full details  
**Support:** #marz-neural-core Slack channel  
**Status:** READY FOR DEPLOYMENT
