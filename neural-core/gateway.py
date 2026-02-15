import asyncio
import base64
import json
import os
import subprocess
import tempfile
import time
import uuid
from pathlib import Path
from typing import Any

import httpx
import soundfile as sf
import torch
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from vllm import LLM, SamplingParams
from TTS.api import TTS
from voice_config import VOICE_PARAMS, apply_wit_filter


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    neural_model_id: str = "meta-llama/Meta-Llama-3-8B-Instruct"
    xtts_model_id: str = VOICE_PARAMS.get("model_name", "tts_models/multilingual/multi-dataset/xtts_v2")
    sovereign_voice_sample: str | None = None
    wav2lip_checkpoint_path: str = "/opt/Wav2Lip/checkpoints/wav2lip_gan.pth"
    wav2lip_repo_path: str = "/opt/Wav2Lip"
    default_avatar_video: str = "/workspace/neural-core/assets/marz-face.mp4"

    host: str = "0.0.0.0"
    port: int = 8080
    idle_timeout_seconds: int = 600

    hibernate_webhook_url: str | None = None
    hibernate_auth_token: str | None = None
    hibernate_signal_name: str = "Hibernate"
    hibernate_cooldown_seconds: int = 600


settings = Settings()

app = FastAPI(title="MARZ Neural Core", version="1.0.0")


class GatewayRequest(BaseModel):
    text: str | None = None
    voice_b64: str | None = None
    voice_text: str | None = None
    request_id: str | None = None
    avatar_video_path: str | None = None


class ActivityTracker:
    def __init__(self) -> None:
        self.last_activity = time.time()
        self.last_hibernate_signal_at = 0.0
        self._lock = asyncio.Lock()

    async def touch(self) -> None:
        async with self._lock:
            self.last_activity = time.time()

    async def should_hibernate(self) -> bool:
        async with self._lock:
            now = time.time()
            idle_for = now - self.last_activity
            cooldown_passed = (now - self.last_hibernate_signal_at) >= settings.hibernate_cooldown_seconds
            return idle_for >= settings.idle_timeout_seconds and cooldown_passed

    async def mark_hibernation_signal(self) -> None:
        async with self._lock:
            self.last_hibernate_signal_at = time.time()


activity_tracker = ActivityTracker()


class BrainEngine:
    def __init__(self) -> None:
        self._llm: LLM | None = None

    def _load(self) -> LLM:
        if self._llm is None:
            self._llm = LLM(
                model=settings.neural_model_id,
                trust_remote_code=True,
                gpu_memory_utilization=0.9,
                max_model_len=4096,
            )
        return self._llm

    async def infer(self, prompt: str) -> str:
        def _run() -> str:
            llm = self._load()
            params = SamplingParams(temperature=0.6, top_p=0.9, max_tokens=420)
            outputs = llm.generate([prompt], params)
            if not outputs or not outputs[0].outputs:
                return "No response generated."
            return outputs[0].outputs[0].text.strip()

        return await asyncio.to_thread(_run)


class SovereignVoice:
    def __init__(self) -> None:
        self._tts: TTS | None = None

    def _load(self) -> TTS:
        if self._tts is None:
            self._tts = TTS(settings.xtts_model_id)
        return self._tts

    async def synthesize(self, text: str, out_wav: Path) -> None:
        def _run() -> None:
            tts = self._load()

            tts_kwargs = {
                "temperature": VOICE_PARAMS.get("temperature"),
                "length_penalty": VOICE_PARAMS.get("length_penalty"),
                "repetition_penalty": VOICE_PARAMS.get("repetition_penalty"),
                "top_k": VOICE_PARAMS.get("top_k"),
                "top_p": VOICE_PARAMS.get("top_p"),
                "speed": VOICE_PARAMS.get("speed"),
                "emotion": VOICE_PARAMS.get("emotion"),
            }
            tts_kwargs = {key: value for key, value in tts_kwargs.items() if value is not None}

            if settings.sovereign_voice_sample and Path(settings.sovereign_voice_sample).exists():
                try:
                    tts.tts_to_file(
                        text=text,
                        file_path=str(out_wav),
                        speaker_wav=settings.sovereign_voice_sample,
                        language="en",
                        **tts_kwargs,
                    )
                except TypeError:
                    fallback_kwargs = {key: value for key, value in tts_kwargs.items() if key != "emotion"}
                    tts.tts_to_file(
                        text=text,
                        file_path=str(out_wav),
                        speaker_wav=settings.sovereign_voice_sample,
                        language="en",
                        **fallback_kwargs,
                    )
            else:
                try:
                    wav = tts.tts(text=text, **tts_kwargs)
                except TypeError:
                    fallback_kwargs = {key: value for key, value in tts_kwargs.items() if key != "emotion"}
                    wav = tts.tts(text=text, **fallback_kwargs)
                sf.write(str(out_wav), wav, 24000)

        await asyncio.to_thread(_run)


class LipSyncEngine:
    async def render(self, face_video: Path, audio_wav: Path, out_mp4: Path) -> None:
        if not face_video.exists():
            raise FileNotFoundError(f"Avatar source not found: {face_video}")

        command = [
            "python",
            str(Path(settings.wav2lip_repo_path) / "inference.py"),
            "--checkpoint_path",
            settings.wav2lip_checkpoint_path,
            "--face",
            str(face_video),
            "--audio",
            str(audio_wav),
            "--outfile",
            str(out_mp4),
        ]

        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=settings.wav2lip_repo_path,
        )
        _, stderr = await process.communicate()
        if process.returncode != 0:
            details = stderr.decode("utf-8", errors="ignore")
            raise RuntimeError(f"Wav2Lip failed: {details}")


brain = BrainEngine()
voice = SovereignVoice()
lipsync = LipSyncEngine()


def safe_json(data: dict[str, Any]) -> str:
    return json.dumps(data, ensure_ascii=False)


async def send_hibernate_signal(reason: str) -> None:
    if not settings.hibernate_webhook_url:
        return

    headers = {"content-type": "application/json"}
    if settings.hibernate_auth_token:
        headers["authorization"] = f"Bearer {settings.hibernate_auth_token}"

    payload = {
        "signal": settings.hibernate_signal_name,
        "reason": reason,
        "service": "marz-neural-core",
        "timestamp": int(time.time()),
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        await client.post(settings.hibernate_webhook_url, headers=headers, json=payload)


async def auto_idle_hibernate_monitor() -> None:
    while True:
        await asyncio.sleep(30)
        try:
            should_hibernate = await activity_tracker.should_hibernate()
            if should_hibernate:
                await send_hibernate_signal("No WebSocket activity for 10 minutes")
                await activity_tracker.mark_hibernation_signal()
        except Exception:
            pass


@app.on_event("startup")
async def startup() -> None:
    asyncio.create_task(auto_idle_hibernate_monitor())


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse(
        {
            "ok": True,
            "idle_timeout_seconds": settings.idle_timeout_seconds,
            "hibernate_configured": bool(settings.hibernate_webhook_url),
        }
    )


async def decode_voice_to_text(payload: GatewayRequest) -> str:
    if payload.text and payload.text.strip():
        return payload.text.strip()
    if payload.voice_text and payload.voice_text.strip():
        return payload.voice_text.strip()
    if payload.voice_b64:
        raise ValueError("voice_b64 provided without transcription. Provide voice_text or text.")
    raise ValueError("No input text supplied.")


@app.websocket("/ws/neural-core")
async def neural_core_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    await activity_tracker.touch()

    await websocket.send_text(
        safe_json(
            {
                "type": "status",
                "state": "connected",
                "message": "MARZ Neural Core connected",
            }
        )
    )

    try:
        while True:
            raw = await websocket.receive_text()
            await activity_tracker.touch()

            try:
                incoming = GatewayRequest.model_validate_json(raw)
            except Exception as validation_error:
                await websocket.send_text(
                    safe_json(
                        {
                            "type": "error",
                            "message": f"Invalid payload: {validation_error}",
                        }
                    )
                )
                continue

            request_id = incoming.request_id or str(uuid.uuid4())

            await websocket.send_text(
                safe_json(
                    {
                        "type": "status",
                        "request_id": request_id,
                        "stage": "accepted",
                    }
                )
            )

            try:
                text_prompt = await decode_voice_to_text(incoming)

                await websocket.send_text(
                    safe_json(
                        {
                            "type": "status",
                            "request_id": request_id,
                            "stage": "brain_processing",
                        }
                    )
                )

                brain_output = await brain.infer(text_prompt)
                voiced_output = apply_wit_filter(brain_output)

                await websocket.send_text(
                    safe_json(
                        {
                            "type": "status",
                            "request_id": request_id,
                            "stage": "tts_generating",
                        }
                    )
                )

                with tempfile.TemporaryDirectory(prefix="marz-neural-") as workdir:
                    work = Path(workdir)
                    wav_path = work / "voice.wav"
                    video_path = work / "lipsync.mp4"

                    await voice.synthesize(voiced_output, wav_path)

                    await websocket.send_text(
                        safe_json(
                            {
                                "type": "status",
                                "request_id": request_id,
                                "stage": "lipsync_rendering",
                            }
                        )
                    )

                    avatar_path = Path(incoming.avatar_video_path) if incoming.avatar_video_path else Path(settings.default_avatar_video)
                    await lipsync.render(avatar_path, wav_path, video_path)

                    audio_bytes = wav_path.read_bytes()
                    video_bytes = video_path.read_bytes()

                    await websocket.send_text(
                        safe_json(
                            {
                                "type": "result",
                                "request_id": request_id,
                                "text": voiced_output,
                                "audio_b64": base64.b64encode(audio_bytes).decode("utf-8"),
                                "video_b64": base64.b64encode(video_bytes).decode("utf-8"),
                                "audio_format": "wav",
                                "video_format": "mp4",
                            }
                        )
                    )

                await activity_tracker.touch()
            except Exception as pipeline_error:
                await websocket.send_text(
                    safe_json(
                        {
                            "type": "error",
                            "request_id": request_id,
                            "message": str(pipeline_error),
                        }
                    )
                )

    except WebSocketDisconnect:
        await activity_tracker.touch()
    except Exception:
        await activity_tracker.touch()
        try:
            await websocket.close(code=1011)
        except Exception:
            pass


@app.post("/orchestrator/hibernate")
async def local_hibernate_trigger() -> JSONResponse:
    await send_hibernate_signal("Manual trigger")
    await activity_tracker.mark_hibernation_signal()
    return JSONResponse({"ok": True, "signaled": True})
