# LAUNCH DAY SCRIPT - MARZ Video Handshake Test
## Phase II-B: Viral Handshake - Staging Server Validation

**Document Version:** 1.0  
**Date:** February 18, 2026  
**Environment:** Staging (opsvantage-ai-builder-staging)  
**Purpose:** Test real-time Lip-Sync synthesis with Phi-3 model

---

## PRE-FLIGHT CHECKLIST

### 1. Deploy to Staging
```bash
# From project root
npm run gcloud:deploy:staging
```

**Expected Output:**
```
✓ Build submitted to Cloud Build
✓ Image pushed to gcr.io/opsvantage-ai-builder-staging
✓ Deployed to Cloud Run (europe-west4)
✓ Staging URL: https://opsvantage-ai-builder-staging-xxxxx.europe-west4.run.app
```

### 2. Verify Staging Environment
```bash
# Health check
curl https://opsvantage-ai-builder-staging-xxxxx.europe-west4.run.app/health

# Expected:
# {"ok":true,"idle_timeout_seconds":600,"enterprise_features":{...}}
```

### 3. Neural Core Connection
```bash
# Test WebSocket connection
npx tsx scripts/test-neural-core-handshake.ts

# Environment variables should be set:
# NEURAL_CORE_WS_URL=wss://marz-neural-core-xxxxx.europe-west4.run.app
```

---

## LAUNCH DAY VIDEO SCRIPTS (6 Scenes)

### Scene 1: "The Awakening" (5 seconds)
**Purpose:** Test basic lip-sync with short phrase

**Text:**
```
Twenty-five slots. One legacy.
```

**Test Command:**
```bash
curl -X POST "wss://marz-neural-core-xxxxx.europe-west4.run.app/ws/neural-core" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Twenty-five slots. One legacy.",
    "avatar_video_path": "/workspace/neural-core/assets/marz-face.mp4",
    "enable_video": true,
    "request_id": "launch-scene-1"
  }'
```

**Expected Response:**
- `stage: "brain_processing"` → Phi-3 processes text
- `stage: "tts_generating"` → Coqui XTTS generates audio
- `stage: "lipsync_rendering"` → Wav2Lip renders video
- `type: "result"` with `video_b64` and `audio_b64`

**Validation:**
- [ ] Lip movements match audio
- [ ] Audio quality clear (24kHz)
- [ ] Video resolution 720p+
- [ ] Total latency <500ms (with GPU)

---

### Scene 2: "The Introduction" (10 seconds)
**Purpose:** Test medium-length sentence with emotion

**Text:**
```
I am MARZ. And I'm about to change how you build websites forever.
```

**Test Command:**
```bash
curl -X POST "wss://marz-neural-core-xxxxx.europe-west4.run.app/ws/neural-core" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am MARZ. And I am about to change how you build websites forever.",
    "avatar_video_path": "/workspace/neural-core/assets/marz-face.mp4",
    "enable_video": true,
    "request_id": "launch-scene-2"
  }'
```

**Validation:**
- [ ] Emotion detected: Confident
- [ ] Natural pauses between sentences
- [ ] Lip-sync accuracy on "MARZ" and "forever"

---

### Scene 3: "The Problem" (7 seconds)
**Purpose:** Test empathetic tone

**Text:**
```
For too long, building a professional website meant expensive developers, weeks of waiting, or restrictive templates.
```

**Test Command:**
```bash
curl -X POST "wss://marz-neural-core-xxxxx.europe-west4.run.app/ws/neural-core" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "For too long, building a professional website meant expensive developers, weeks of waiting, or restrictive templates.",
    "avatar_video_path": "/workspace/neural-core/assets/marz-face.mp4",
    "enable_video": true,
    "request_id": "launch-scene-3"
  }'
```

**Validation:**
- [ ] Emotion detected: Empathetic
- [ ] Slower pace for emotional weight
- [ ] Clear enunciation of pain points

---

### Scene 4: "The Solution" (13 seconds)
**Purpose:** Test excited/energetic delivery

**Text:**
```
Not anymore. Tell me about your business. I'll generate your entire website in 60 seconds. Copy. Design. SEO. Deployed.
```

**Test Command:**
```bash
curl -X POST "wss://marz-neural-core-xxxxx.europe-west4.run.app/ws/neural-core" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Not anymore. Tell me about your business. I will generate your entire website in 60 seconds. Copy. Design. SEO. Deployed.",
    "avatar_video_path": "/workspace/neural-core/assets/marz-face.mp4",
    "enable_video": true,
    "request_id": "launch-scene-4"
  }'
```

**Validation:**
- [ ] Emotion detected: Excited
- [ ] Faster pace, energetic
- [ ] Clear emphasis on "60 seconds"

---

### Scene 5: "The Offer" (15 seconds)
**Purpose:** Test urgency and exclusivity

**Text:**
```
The first 25 founders get lifetime 50% off, priority access, and a personalized video from me on launch day. This never returns.
```

**Test Command:**
```bash
curl -X POST "wss://marz-neural-core-xxxxx.europe-west4.run.app/ws/neural-core" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The first 25 founders get lifetime 50 percent off, priority access, and a personalized video from me on launch day. This never returns.",
    "avatar_video_path": "/workspace/neural-core/assets/marz-face.mp4",
    "enable_video": true,
    "request_id": "launch-scene-5"
  }'
```

**Validation:**
- [ ] Emotion detected: Urgent
- [ ] Emphasis on "25", "50% off", "never returns"
- [ ] Scarcity conveyed in tone

---

### Scene 6: "The Call to Action" (10 seconds)
**Purpose:** Test direct, personal connection

**Text:**
```
Spin the wheel. Claim your reward. Join the Sovereign 25 before someone else takes your slot.
```

**Test Command:**
```bash
curl -X POST "wss://marz-neural-core-xxxxx.europe-west4.run.app/ws/neural-core" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Spin the wheel. Claim your reward. Join the Sovereign 25 before someone else takes your slot.",
    "avatar_video_path": "/workspace/neural-core/assets/marz-face.mp4",
    "enable_video": true,
    "request_id": "launch-scene-6"
  }'
```

**Validation:**
- [ ] Emotion detected: Personal, Direct
- [ ] Clear call-to-action tone
- [ ] Eye contact simulation (if avatar supports)

---

## FULL SCRIPT TEST (60 seconds)

Once individual scenes pass validation, test the complete script:

**Text:**
```
Twenty-five slots. One legacy. I am MARZ. And I am about to change how you build websites forever. For too long, building a professional website meant expensive developers, weeks of waiting, or restrictive templates. Not anymore. Tell me about your business. I will generate your entire website in 60 seconds. Copy. Design. SEO. Deployed. The first 25 founders get lifetime 50 percent off, priority access, and a personalized video from me on launch day. This never returns. Spin the wheel. Claim your reward. Join the Sovereign 25 before someone else takes your slot.
```

**Test Command:**
```bash
curl -X POST "wss://marz-neural-core-xxxxx.europe-west4.run.app/ws/neural-core" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Twenty-five slots. One legacy. I am MARZ. And I am about to change how you build websites forever. For too long, building a professional website meant expensive developers, weeks of waiting, or restrictive templates. Not anymore. Tell me about your business. I will generate your entire website in 60 seconds. Copy. Design. SEO. Deployed. The first 25 founders get lifetime 50 percent off, priority access, and a personalized video from me on launch day. This never returns. Spin the wheel. Claim your reward. Join the Sovereign 25 before someone else takes your slot.",
    "avatar_video_path": "/workspace/neural-core/assets/marz-face.mp4",
    "enable_video": true,
    "request_id": "launch-full-script"
  }'
```

**Validation:**
- [ ] All emotion transitions smooth
- [ ] Consistent audio quality throughout
- [ ] No lip-sync drift over 60 seconds
- [ ] Total latency acceptable (<3 seconds for full script)

---

## BROWSER-BASED TESTING

For interactive testing, use this HTML page:

```html
<!DOCTYPE html>
<html>
<head>
  <title>MARZ Launch Day Test</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 50px auto; }
    .scene { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
    button { background: #D4AF37; color: #1A1A1A; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    button:hover { background: #B8941F; }
    video { width: 100%; max-width: 400px; margin-top: 10px; }
    .status { font-size: 12px; color: #666; margin-top: 5px; }
  </style>
</head>
<body>
  <h1>MARZ Launch Day - Video Handshake Test</h1>
  <p>Staging Server: <code id="staging-url">Loading...</code></p>
  
  <div id="scenes"></div>
  
  <script>
    const WS_URL = 'wss://marz-neural-core-xxxxx.europe-west4.run.app/ws/neural-core';
    
    const scenes = [
      { id: 1, text: "Twenty-five slots. One legacy." },
      { id: 2, text: "I am MARZ. And I am about to change how you build websites forever." },
      { id: 3, text: "For too long, building a professional website meant expensive developers, weeks of waiting, or restrictive templates." },
      { id: 4, text: "Not anymore. Tell me about your business. I will generate your entire website in 60 seconds. Copy. Design. SEO. Deployed." },
      { id: 5, text: "The first 25 founders get lifetime 50 percent off, priority access, and a personalized video from me on launch day. This never returns." },
      { id: 6, text: "Spin the wheel. Claim your reward. Join the Sovereign 25 before someone else takes your slot." }
    ];
    
    const container = document.getElementById('scenes');
    
    scenes.forEach(scene => {
      const div = document.createElement('div');
      div.className = 'scene';
      div.innerHTML = `
        <h3>Scene ${scene.id}</h3>
        <p>${scene.text}</p>
        <button onclick="testScene(${scene.id}, '${scene.text.replace(/'/g, "\\'")}')">Test Scene</button>
        <div id="video-${scene.id}"></div>
        <div class="status" id="status-${scene.id}"></div>
      `;
      container.appendChild(div);
    });
    
    function testScene(id, text) {
      const statusEl = document.getElementById(`status-${id}`);
      const videoEl = document.getElementById(`video-${id}`);
      
      statusEl.textContent = 'Connecting to MARZ neural core...';
      
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        statusEl.textContent = 'Connected. Sending request...';
        ws.send(JSON.stringify({
          text: text,
          enable_video: true,
          request_id: `browser-test-${id}`
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'status') {
          statusEl.textContent = `Status: ${data.stage}`;
        }
        
        if (data.type === 'result') {
          statusEl.textContent = `Complete! Latency: ${data.performance_metrics?.total_time_ms || 'N/A'}ms`;
          
          if (data.video_b64) {
            const video = document.createElement('video');
            video.src = `data:video/mp4;base64,${data.video_b64}`;
            video.controls = true;
            video.autoplay = true;
            videoEl.innerHTML = '';
            videoEl.appendChild(video);
          }
          
          if (data.audio_b64) {
            const audio = new Audio(`data:audio/wav;base64,${data.audio_b64}`);
            audio.play();
          }
        }
        
        if (data.type === 'error') {
          statusEl.textContent = `Error: ${data.message}`;
        }
      };
      
      ws.onerror = (err) => {
        statusEl.textContent = 'Connection error';
        console.error(err);
      };
    }
  </script>
</body>
</html>
```

---

## PERFORMANCE BENCHMARKS

### Target Metrics (Staging Environment)

| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| Brain Processing (Phi-3) | <200ms | <500ms | >1000ms |
| TTS Generation | <100ms | <300ms | >500ms |
| Lip-Sync Rendering (GPU) | <200ms | <400ms | >800ms |
| Total Latency (Scene 1) | <500ms | <1000ms | >2000ms |
| Total Latency (Full Script) | <2000ms | <4000ms | >8000ms |

### Monitoring Commands

```bash
# Watch staging logs
gcloud run services logs read opsvantage-ai-builder-staging --region europe-west4 --limit 50

# Check Cloud Run metrics
gcloud run services describe opsvantage-ai-builder-staging --region europe-west4 --format="yaml(status)"
```

---

## TROUBLESHOOTING

### Issue: "Model loading failed"
**Cause:** Phi-3 model not available or HUGGINGFACE_TOKEN missing

**Fix:**
```bash
# Check environment variables in Cloud Run
gcloud run services describe opsvantage-ai-builder-staging \
  --region europe-west4 \
  --format="yaml(spec.template.spec.containers[0].env)"

# If using Meta-Llama, ensure HUGGINGFACE_TOKEN is set
gcloud run services update opsvantage-ai-builder-staging \
  --region europe-west4 \
  --set-env-vars HUGGINGFACE_TOKEN=hf_xxxxx
```

### Issue: "Wav2Lip checkpoint not found"
**Cause:** Checkpoint not mounted in container

**Fix:**
```bash
# Verify volume mount in cloudbuild.staging.yaml
# Checkpoint should be at: /opt/Wav2Lip/checkpoints/wav2lip_gan.pth
```

### Issue: "High latency (>2s)"
**Cause:** CPU-only inference or cold start

**Fix:**
```bash
# Enable GPU for staging (if budget allows)
gcloud run services update opsvantage-ai-builder-staging \
  --region europe-west4 \
  --gpu nvidia-tesla-t4 \
  --gpu-count 1

# Or increase min-instances to prevent cold starts
gcloud run services update opsvantage-ai-builder-staging \
  --region europe-west4 \
  --min-instances 1
```

### Issue: "WebSocket connection failed"
**Cause:** CORS or authentication

**Fix:**
```bash
# Check CORS settings in gateway_enterprise.py
# Ensure Origin header is allowed
```

---

## SUCCESS CRITERIA

### Phase II-B Completion Checklist

- [ ] All 6 scenes render successfully
- [ ] Lip-sync accuracy >90% (subjective review)
- [ ] Audio quality clear, no artifacts
- [ ] Total latency <500ms per scene (with GPU)
- [ ] Full 60-second script completes without errors
- [ ] Browser-based test page works
- [ ] Marketing team can generate videos on-demand
- [ ] Staging environment stable for 24 hours

### Sign-Off

**Tested By:** ________________  
**Date:** ________________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** ________________

---

## POST-TEST ACTIONS

### If All Tests Pass:
1. Deploy to production with same configuration
2. Schedule LinkedIn video post for 9:00 AM PST
3. Enable Marketing Control panel in production dashboard
4. Monitor Sovereign 25 claims in real-time

### If Tests Fail:
1. Review logs for specific errors
2. Adjust model configuration or resources
3. Re-run staging deployment
4. Re-test within 24 hours

---

**Document Generated:** February 18, 2026  
**Classification:** INTERNAL - LAUNCH CRITICAL  
**Next Review:** Post-staging deployment validation

**Legacy Guidebook Entry #126:** "The Viral Handshake is not just a test—it is the first conversation between MARZ and the world. Every frame, every word, every millisecond of latency carries the weight of our promise: Sovereignty through Technology."
