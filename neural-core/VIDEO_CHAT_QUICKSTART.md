# MARZ Video Chat - Quick Start Guide

## 🚀 Get MARZ Talking in 5 Minutes

### Problem Solved ✅

The previous error was caused by trying to use `meta-llama/Meta-Llama-3-8B-Instruct` without authentication.

**Solution:** 
- Default model changed to `microsoft/Phi-3-mini-4k-instruct` (no auth required)
- Added graceful fallback to mock responses if model loading fails
- Added support for HUGGINGFACE_TOKEN if you want to use gated models

---

## Option 1: Quick Start (No Configuration)

This works immediately with mock responses - perfect for testing video chat:

```bash
cd neural-core

# Build Docker image
docker build -t marz-neural-core:enterprise .

# Run container
docker run --gpus all -p 8080:8080 ^
  -v %cd%\checkpoints:/opt/Wav2Lip/checkpoints:ro ^
  -v %cd%\assets:/workspace/neural-core/assets:ro ^
  marz-neural-core:enterprise
```

**Expected output:**
```
[BrainEngine] No HUGGINGFACE_TOKEN, using mock responses
[BrainEngine] Using mock responses for development
```

MARZ will respond with contextual mock responses (good for testing).

---

## Option 2: Use Open Model (Recommended for Production)

```bash
# No HuggingFace token needed!
NEURAL_MODEL_ID=microsoft/Phi-3-mini-4k-instruct
```

This model is:
- ✅ Open access (no authentication)
- ✅ High quality responses
- ✅ Fast inference
- ✅ Commercial use allowed

---

## Option 3: Use Meta-Llama Models (Requires Auth)

If you want to use `meta-llama/Meta-Llama-3-8B-Instruct`:

### Step 1: Accept Terms
Visit: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
Click "Accept terms"

### Step 2: Get Token
1. Go to: https://huggingface.co/settings/tokens
2. Create a new token (Read access)
3. Copy the token

### Step 3: Set Environment Variable
```bash
# In .env file or docker run
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEURAL_MODEL_ID=meta-llama/Meta-Llama-3-8B-Instruct
```

---

## Test Video Chat

### 1. Start Neural Core
```bash
docker run --gpus all -p 8080:8080 ^
  -v %cd%\checkpoints:/opt/Wav2Lip/checkpoints:ro ^
  -v %cd%\assets:/workspace/neural-core/assets:ro ^
  marz-neural-core:enterprise
```

### 2. Test Connection
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

### 3. Test WebSocket Video Chat

**Using the test script:**
```bash
cd ..
npx tsx scripts/test-neural-core-handshake.ts
```

**Or using browser JavaScript:**
```javascript
const ws = new WebSocket('ws://localhost:8080/ws/neural-core');

ws.onopen = () => {
  console.log('Connected to MARZ!');
  ws.send(JSON.stringify({
    text: 'Hello MARZ, can you see me?',
    enable_video: true,
    request_id: 'test-1'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('MARZ says:', data);
  
  if (data.type === 'result') {
    // Play audio
    const audio = new Audio('data:audio/wav;base64,' + data.audio_b64);
    audio.play();
    
    // Show video (if available)
    if (data.video_b64) {
      const video = document.createElement('video');
      video.src = 'data:video/mp4;base64,' + data.video_b64;
      video.play();
    }
  }
};
```

---

## Troubleshooting

### Error: "Access to model ... is restricted"

**Cause:** Using gated model without token

**Fix:**
```bash
# Option A: Use open model (recommended)
NEURAL_MODEL_ID=microsoft/Phi-3-mini-4k-instruct

# Option B: Add HUGGINGFACE_TOKEN
HUGGINGFACE_TOKEN=hf_xxxxx
```

### Error: "Wav2Lip checkpoint not found"

**Fix:**
```bash
# Download checkpoint
cd neural-core
python download_checkpoint.py
# Or manually download from HuggingFace
```

### Error: "Avatar video not found"

**Fix:**
```bash
# Add a video file
cp /path/to/face-video.mp4 assets/marz-face.mp4
```

### Mock responses only

**Cause:** No model loaded (expected in development)

**Fix:** This is normal! Mock responses work for testing. For real AI:
```bash
# Set open model
NEURAL_MODEL_ID=microsoft/Phi-3-mini-4k-instruct
```

---

## Environment Variables Reference

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `NEURAL_MODEL_ID` | `microsoft/Phi-3-mini-4k-instruct` | No | LLM model to use |
| `HUGGINGFACE_TOKEN` | `None` | For gated models | HF access token |
| `WAV2LIP_CHECKPOINT_PATH` | `/opt/Wav2Lip/checkpoints/wav2lip_gan.pth` | Yes | Wav2Lip model |
| `DEFAULT_AVATAR_VIDEO` | `/workspace/neural-core/assets/marz-face.mp4` | Yes | Face video |
| `PORT` | `8080` | No | API port |
| `ENABLE_GPU_ACCELERATION` | `true` | No | Use GPU |

---

## Next Steps

1. ✅ **Test mock responses** - Verify WebSocket connection works
2. ✅ **Add Wav2Lip checkpoint** - Enable lip-sync rendering
3. ✅ **Add avatar video** - Enable video output
4. ✅ **Deploy open model** - Get real AI responses
5. 🎯 **Production** - Add HUGGINGFACE_TOKEN for Meta-Llama models

---

**Status:** Ready for video chat! 🚀

**Support:** See `WAV2LIP_DEPLOYMENT_GUIDE.md` for full deployment instructions
