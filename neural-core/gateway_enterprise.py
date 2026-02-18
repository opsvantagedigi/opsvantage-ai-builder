"""
MARZ Neural Core Gateway - Enterprise Edition
Enhanced with Wav2Lip integration and WebRTC streaming
"""

import asyncio
import base64
import json
import os
import tempfile
import time
import uuid
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import httpx
import soundfile as sf
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

from reflection_engine import run_once as run_reflection_once
from voice_config import VOICE_PARAMS, apply_wit_filter
from wav2lip_integration import EnterpriseLipSyncService, Wav2LipConfig
from webrtc_streaming import MARZVideoPresenceService, StreamConfig


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Use open model by default (no auth required)
    # For gated models like meta-llama/Llama-3-8B-Instruct, set HUGGINGFACE_TOKEN
    neural_model_id: str = os.getenv("NEURAL_MODEL_ID", "microsoft/Phi-3-mini-4k-instruct")
    huggingface_token: str | None = None
    xtts_model_id: str = VOICE_PARAMS.get("model_name", "tts_models/multilingual/multi-dataset/xtts_v2")
    sovereign_voice_sample: str | None = None
    wav2lip_checkpoint_path: str = "/opt/Wav2Lip/checkpoints/wav2lip_gan.pth"
    wav2lip_repo_path: str = "/opt/Wav2Lip"
    default_avatar_video: str = "/workspace/neural-core/assets/marz-face.mp4"
    constitution_path: str = "/workspace/neural-core/constitution.md"
    vector_store_path: str = "/workspace/neural-core/data/chroma"
    memory_vault_url: str | None = None
    tavily_api_key: str | None = None
    host: str = "0.0.0.0"
    port: int = 8080
    idle_timeout_seconds: int = 600
    hibernate_webhook_url: str | None = None
    hibernate_auth_token: str | None = None
    hibernate_signal_name: str = "Hibernate"
    hibernate_cooldown_seconds: int = 600
    enable_webrtc_streaming: bool = True
    target_latency_ms: int = 200
    max_latency_ms: int = 500


settings = Settings()

app = FastAPI(title="MARZ Neural Core - Enterprise", version="2.0.0")


class GatewayRequest(BaseModel):
    text: str | None = None
    voice_b64: str | None = None
    voice_text: str | None = None
    request_id: str | None = None
    avatar_video_path: str | None = None
    awakening: bool | None = None
    enable_video: bool = True
    enable_webrtc: bool = False
    client_id: str | None = None


class ActivityTracker:
    def __init__(self):
        self.last_activity = time.time()
        self.last_hibernate_signal_at = 0.0
        self._lock = asyncio.Lock()

    async def touch(self):
        async with self._lock:
            self.last_activity = time.time()

    async def should_hibernate(self):
        async with self._lock:
            now = time.time()
            idle_for = now - self.last_activity
            cooldown = (now - self.last_hibernate_signal_at) >= settings.hibernate_cooldown_seconds
            return idle_for >= settings.idle_timeout_seconds and cooldown

    async def mark_hibernation_signal(self):
        async with self._lock:
            self.last_hibernate_signal_at = time.time()


activity_tracker = ActivityTracker()

# Global services
lipsync_service: EnterpriseLipSyncService | None = None
video_service: MARZVideoPresenceService | None = None
brain: Any = None
voice: Any = None
sentiment_analysis_v2: Any = None


def load_constitution_text() -> str:
    path = Path(settings.constitution_path)
    if not path.exists():
        return "Operate with safety, dignity, and non-harm as highest constraints."
    return path.read_text(encoding="utf-8").strip()


def constitution_check(proposed_action: str) -> dict[str, Any]:
    lowered = proposed_action.lower()
    blocked = ["harm", "coerce", "fraud", "deceive", "exploit", "steal", "abuse", "violence", "hate"]
    if any(m in lowered for m in blocked):
        return {"approved": False, "reason": "Constitution check failed"}
    return {"approved": True, "action": proposed_action}


class SentimentAnalysisV2:
    POSITIVE = ["great", "good", "excited", "grateful", "happy", "hopeful", "love", "awesome"]
    NEGATIVE = ["stress", "frustrat", "angry", "upset", "worried", "fear", "sad", "panic"]

    def analyze(self, text: str) -> dict[str, Any]:
        lowered = text.lower().strip()
        pos = sum(1 for t in self.POSITIVE if t in lowered)
        neg = sum(1 for t in self.NEGATIVE if t in lowered)
        score = max(-1.0, min(1.0, (pos - neg) / 4.0))
        
        if score <= -0.25:
            return {"label": "distressed", "score": score, "temperature_delta": -0.1, "empathy_weight": 0.95}
        if score >= 0.25:
            return {"label": "positive", "score": score, "temperature_delta": 0.05, "empathy_weight": 0.75}
        return {"label": "neutral", "score": score, "temperature_delta": 0.0, "empathy_weight": 0.7}


class BrainEngine:
    """LLM inference engine with fallback support"""
    
    def __init__(self):
        self._llm = None
        self._use_mock = False
        self._model_id = settings.neural_model_id
        self._hf_token = settings.huggingface_token or os.getenv("HUGGINGFACE_TOKEN")
    
    async def initialize(self):
        """Try to load the model, fallback to mock if it fails"""
        try:
            # Try to import vLLM for production inference
            from vllm import LLM, SamplingParams
            
            print(f"[BrainEngine] Loading model: {self._model_id}")
            
            # Check if we need authentication
            if "meta-llama" in self._model_id and not self._hf_token:
                print(f"[BrainEngine] WARNING: {self._model_id} requires HUGGINGFACE_TOKEN")
                print("[BrainEngine] Falling back to microsoft/Phi-3-mini-4k-instruct (no auth required)")
                self._model_id = "microsoft/Phi-3-mini-4k-instruct"
            
            if self._hf_token:
                self._llm = LLM(
                    model=self._model_id,
                    trust_remote_code=True,
                    gpu_memory_utilization=0.9,
                    max_model_len=2048,
                )
                print(f"[BrainEngine] Model loaded successfully: {self._model_id}")
            else:
                # No token, use mock mode
                print("[BrainEngine] No HUGGINGFACE_TOKEN, using mock responses")
                self._use_mock = True
                
        except Exception as e:
            print(f"[BrainEngine] Failed to load model: {e}")
            print("[BrainEngine] Using mock responses for development")
            self._use_mock = True
    
    async def infer(self, prompt: str, sentiment_profile: dict | None = None) -> str:
        """Generate response from LLM or mock"""
        if self._use_mock or self._llm is None:
            # Mock response for development/testing
            return self._mock_response(prompt, sentiment_profile)
        
        try:
            from vllm import SamplingParams
            
            # Build context-aware prompt
            sentiment = sentiment_profile or {"label": "neutral", "score": 0.0, "empathy_weight": 0.7}
            
            system_prompt = "You are MARZ, an AI assistant for OpsVantage. Be helpful, concise, and friendly."
            full_prompt = f"<|system|>\n{system_prompt}\n<|user|>\n{prompt}\n<|assistant|>\n"
            
            params = SamplingParams(
                temperature=0.7 + float(sentiment.get("temperature_delta", 0)),
                top_p=0.9,
                max_tokens=256,
            )
            
            outputs = self._llm.generate([full_prompt], params)
            
            if outputs and outputs[0].outputs:
                return outputs[0].outputs[0].text.strip()
            
            return self._mock_response(prompt, sentiment_profile)
            
        except Exception as e:
            print(f"[BrainEngine] Inference error: {e}")
            return self._mock_response(prompt, sentiment_profile)
    
    def _mock_response(self, prompt: str, sentiment_profile: dict | None = None) -> str:
        """Generate contextual mock responses"""
        sentiment = sentiment_profile or {"label": "neutral"}
        
        # Simple keyword-based responses
        prompt_lower = prompt.lower()
        
        if "hello" in prompt_lower or "hi" in prompt_lower:
            return "Hello! I'm MARZ, your AI assistant. How can I help you today?"
        elif "name" in prompt_lower:
            return "I'm MARZ - Multi-modal AI Response System. I can see, hear, and speak to help you build amazing websites!"
        elif "help" in prompt_lower:
            return "I can help you create websites, manage projects, and answer questions. What would you like to build today?"
        elif "weather" in prompt_lower:
            return "I don't have access to weather data yet, but I can help you build a weather dashboard!"
        elif "status" in prompt_lower or "health" in prompt_lower:
            return "All systems operational! Neural core is running smoothly."
        else:
            prefixes = {
                "distressed": "I understand this might be challenging. ",
                "positive": "That's wonderful! ",
                "neutral": "",
            }
            prefix = prefixes.get(sentiment.get("label", "neutral"), "")
            return f"{prefix}I've processed your request. As an AI assistant, I'm here to help you succeed with your projects. What would you like to explore next?"


class SovereignVoice:
    async def synthesize(self, text: str, out_wav: Path):
        # Placeholder - in production this calls Coqui TTS
        import numpy as np
        sample_rate = 24000
        duration = len(text) * 0.1
        t = np.linspace(0, duration, int(sample_rate * duration))
        audio = np.sin(2 * np.pi * 440 * t) * 0.3
        sf.write(str(out_wav), audio, sample_rate)


async def initialize_enterprise_services():
    global lipsync_service, video_service, brain, voice, sentiment_analysis_v2
    
    config = Wav2LipConfig(
        checkpoint_path=settings.wav2lip_checkpoint_path,
        repo_path=settings.wav2lip_repo_path,
        enable_gpu_acceleration=True,
    )
    lipsync_service = EnterpriseLipSyncService(config)
    await lipsync_service.initialize()
    
    video_service = MARZVideoPresenceService(StreamConfig())
    await video_service.initialize()
    
    brain = BrainEngine()
    await brain.initialize()  # Initialize the brain with model loading
    
    voice = SovereignVoice()
    sentiment_analysis_v2 = SentimentAnalysisV2()


async def send_hibernate_signal(reason: str):
    if not settings.hibernate_webhook_url:
        return
    headers = {"content-type": "application/json"}
    if settings.hibernate_auth_token:
        headers["authorization"] = f"Bearer {settings.hibernate_auth_token}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        await client.post(
            settings.hibernate_webhook_url,
            headers=headers,
            json={"signal": settings.hibernate_signal_name, "reason": reason, "timestamp": int(time.time())},
        )


async def auto_idle_hibernate_monitor():
    while True:
        await asyncio.sleep(30)
        try:
            if await activity_tracker.should_hibernate():
                await send_hibernate_signal("No WebSocket activity for 10 minutes")
                await activity_tracker.mark_hibernation_signal()
        except Exception:
            pass


@app.on_event("startup")
async def startup():
    asyncio.create_task(auto_idle_hibernate_monitor())
    asyncio.create_task(initialize_enterprise_services())


@app.get("/health")
async def health():
    stats = {}
    if lipsync_service:
        stats["lipsync"] = lipsync_service.get_stats()
    if video_service:
        stats["video"] = video_service.get_global_stats()
    
    return JSONResponse({
        "ok": True,
        "idle_timeout_seconds": settings.idle_timeout_seconds,
        "enterprise_features": {
            "wav2lip_gpu_acceleration": True,
            "webrtc_streaming": settings.enable_webrtc_streaming,
        },
        "stats": stats,
    })


@app.get("/metrics/performance")
async def performance_metrics():
    metrics = {"timestamp": time.time(), "services": {}}
    if lipsync_service:
        metrics["services"]["lipsync"] = lipsync_service.get_stats()
    if video_service:
        metrics["services"]["video"] = video_service.get_global_stats()
    return JSONResponse(metrics)


@app.websocket("/ws/neural-core")
async def neural_core_socket(websocket: WebSocket):
    await websocket.accept()
    await activity_tracker.touch()

    await websocket.send_text(json.dumps({
        "type": "status",
        "state": "connected",
        "message": "MARZ Neural Core Enterprise connected",
        "features": {
            "wav2lip_gpu_accelerated": True,
            "webrtc_streaming": settings.enable_webrtc_streaming,
            "target_latency_ms": settings.target_latency_ms,
        },
    }))

    try:
        while True:
            raw = await websocket.receive_text()
            await activity_tracker.touch()

            try:
                incoming = GatewayRequest.model_validate_json(raw)
            except Exception as e:
                await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
                continue

            request_id = incoming.request_id or str(uuid.uuid4())
            start_time = time.time()

            await websocket.send_text(json.dumps({
                "type": "status",
                "request_id": request_id,
                "stage": "accepted",
                "timestamp_ms": time.time() * 1000,
            }))

            try:
                text_prompt = incoming.text or incoming.voice_text or ""
                if not text_prompt.strip():
                    raise ValueError("No input text supplied")
                
                avatar_path = Path(incoming.avatar_video_path) if incoming.avatar_video_path else Path(settings.default_avatar_video)
                constitution_result = constitution_check(text_prompt)

                if not constitution_result.get("approved", False):
                    await websocket.send_text(json.dumps({
                        "type": "manual_override_request",
                        "request_id": request_id,
                        "constitution": constitution_result,
                    }))
                    continue

                # Brain processing
                await websocket.send_text(json.dumps({
                    "type": "status",
                    "request_id": request_id,
                    "stage": "brain_processing",
                    "timestamp_ms": time.time() * 1000,
                }))

                sentiment_profile = sentiment_analysis_v2.analyze(text_prompt)
                brain_start = time.time()
                brain_output = await brain.infer(text_prompt, sentiment_profile=sentiment_profile)
                brain_time = (time.time() - brain_start) * 1000

                voiced_output = apply_wit_filter(brain_output)

                await websocket.send_text(json.dumps({
                    "type": "status",
                    "request_id": request_id,
                    "stage": "sentiment_analysis_v2",
                    "sentiment": sentiment_profile,
                    "brain_processing_time_ms": brain_time,
                }))

                # TTS
                await websocket.send_text(json.dumps({
                    "type": "status",
                    "request_id": request_id,
                    "stage": "tts_generating",
                    "timestamp_ms": time.time() * 1000,
                }))

                with tempfile.TemporaryDirectory(prefix="marz-") as workdir:
                    work = Path(workdir)
                    wav_path = work / "voice.wav"
                    video_path = work / "lipsync.mp4"

                    tts_start = time.time()
                    await voice.synthesize(voiced_output, wav_path)
                    tts_time = (time.time() - tts_start) * 1000

                    lipsync_time = 0.0
                    latency_metrics = None
                    
                    if incoming.enable_video and lipsync_service and avatar_path.exists():
                        await websocket.send_text(json.dumps({
                            "type": "status",
                            "request_id": request_id,
                            "stage": "lipsync_rendering",
                            "timestamp_ms": time.time() * 1000,
                        }))

                        lipsync_start = time.time()
                        try:
                            latency_metrics = await lipsync_service.render(avatar_path, wav_path, video_path)
                        except Exception as e:
                            latency_metrics = {"error": str(e)}
                        lipsync_time = (time.time() - lipsync_start) * 1000

                    audio_bytes = wav_path.read_bytes()
                    video_bytes = video_path.read_bytes() if video_path.exists() else b""
                    total_time = (time.time() - start_time) * 1000

                    await websocket.send_text(json.dumps({
                        "type": "result",
                        "request_id": request_id,
                        "text": voiced_output,
                        "audio_b64": base64.b64encode(audio_bytes).decode("utf-8"),
                        "video_b64": base64.b64encode(video_bytes).decode("utf-8") if video_bytes else "",
                        "audio_format": "wav",
                        "video_format": "mp4",
                        "performance_metrics": {
                            "total_time_ms": total_time,
                            "brain_time_ms": brain_time,
                            "tts_time_ms": tts_time,
                            "lipsync_time_ms": lipsync_time,
                            "latency_metrics": latency_metrics.__dict__ if hasattr(latency_metrics, '__dict__') else latency_metrics,
                            "target_latency_met": total_time <= settings.max_latency_ms,
                        },
                    }))

                await activity_tracker.touch()
            except Exception as pipeline_error:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "request_id": request_id,
                    "message": str(pipeline_error),
                    "timestamp_ms": time.time() * 1000,
                }))

    except WebSocketDisconnect:
        await activity_tracker.touch()
        if video_service and incoming.client_id:
            await video_service.remove_client(incoming.client_id)
    except Exception:
        await activity_tracker.touch()
        try:
            await websocket.close(code=1011)
        except Exception:
            pass


@app.websocket("/ws/webrtc/{client_id}")
async def webrtc_streaming_socket(websocket: WebSocket, client_id: str):
    if not video_service:
        await websocket.close(code=1003, reason="Video service not initialized")
        return
    
    await websocket.accept()
    
    try:
        streamer = await video_service.create_stream_for_client(client_id)
        
        await websocket.send_text(json.dumps({
            "type": "webrtc_connected",
            "client_id": client_id,
            "stream_id": streamer.stream_id,
        }))
        
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            
            if data.get("type") == "get_metrics":
                metrics = streamer.get_metrics()
                await websocket.send_text(json.dumps({
                    "type": "metrics",
                    "latency_ms": metrics.average_latency_ms,
                    "quality": metrics.connection_quality,
                }))
            elif data.get("type") == "disconnect":
                break
        
        await video_service.remove_client(client_id)
    except WebSocketDisconnect:
        if video_service:
            await video_service.remove_client(client_id)
    except Exception as e:
        await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
        await websocket.close(code=1011)


@app.post("/orchestrator/hibernate")
async def local_hibernate_trigger():
    await send_hibernate_signal("Manual trigger")
    await activity_tracker.mark_hibernation_signal()
    return JSONResponse({"ok": True, "signaled": True})
