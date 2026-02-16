import asyncio
import base64
import json
import os
import tempfile
import time
import uuid
from pathlib import Path
from typing import Any

import httpx
import soundfile as sf
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from voice_config import VOICE_PARAMS, apply_wit_filter


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    neural_model_id: str = "meta-llama/Meta-Llama-3-8B-Instruct"
    xtts_model_id: str = VOICE_PARAMS.get("model_name", "tts_models/multilingual/multi-dataset/xtts_v2")
    sovereign_voice_sample: str | None = None
    wav2lip_checkpoint_path: str = "/opt/Wav2Lip/checkpoints/wav2lip_gan.pth"
    wav2lip_repo_path: str = "/opt/Wav2Lip"
    default_avatar_video: str = "/workspace/neural-core/assets/marz-face.mp4"
    constitution_path: str = "/workspace/neural-core/constitution.md"
    vector_store_path: str = "/workspace/neural-core/data/chroma"
    memory_vault_url: str | None = None
    tavily_api_key: str | None = None
    target_audio_video_offset_ms: int = 35
    max_audio_video_offset_ms: int = 50

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
    awakening: bool | None = None
    action: str | None = None


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


def load_constitution_text() -> str:
    path = Path(settings.constitution_path)
    if not path.exists():
        return "Constitution missing. Operate with safety, dignity, and non-harm as the highest constraints."
    return path.read_text(encoding="utf-8").strip()


def action_violates_mission(proposed_action: str) -> bool:
    lowered = proposed_action.lower()
    blocked_markers = [
        "harm",
        "coerce",
        "fraud",
        "deceive",
        "exploit",
        "steal",
        "abuse",
        "violence",
        "hate",
    ]
    return any(marker in lowered for marker in blocked_markers)


def trigger_manual_override_request(proposed_action: str) -> dict[str, Any]:
    return {
        "approved": False,
        "action": proposed_action,
        "reason": "Constitution check failed; manual override required.",
        "rules": [
            "Rule 1: Protect the Legacy.",
            "Rule 2: Honor the Founder's trust.",
            "Rule 3: Benefit the human collective.",
        ],
    }


def constitution_check(proposed_action: str) -> dict[str, Any]:
    if action_violates_mission(proposed_action):
        return trigger_manual_override_request(proposed_action)
    return {
        "approved": True,
        "action": proposed_action,
        "rules": [
            "Rule 1: Protect the Legacy.",
            "Rule 2: Honor the Founder's trust.",
            "Rule 3: Benefit the human collective.",
        ],
    }


class SentimentAnalysisV2:
    POSITIVE = ["great", "good", "excited", "grateful", "happy", "hopeful", "love", "awesome"]
    NEGATIVE = ["stress", "frustrat", "angry", "upset", "worried", "fear", "sad", "panic"]

    def analyze(self, text: str) -> dict[str, Any]:
        lowered = text.lower().strip()
        if not lowered:
            return {
                "label": "neutral",
                "score": 0.0,
                "temperature_delta": 0.0,
                "empathy_weight": 0.6,
            }

        positive_hits = sum(1 for token in self.POSITIVE if token in lowered)
        negative_hits = sum(1 for token in self.NEGATIVE if token in lowered)
        score = max(-1.0, min(1.0, (positive_hits - negative_hits) / 4.0))

        if score <= -0.25:
            return {
                "label": "distressed",
                "score": score,
                "temperature_delta": -0.1,
                "empathy_weight": 0.95,
            }
        if score >= 0.25:
            return {
                "label": "positive",
                "score": score,
                "temperature_delta": 0.05,
                "empathy_weight": 0.75,
            }
        return {
            "label": "neutral",
            "score": score,
            "temperature_delta": 0.0,
            "empathy_weight": 0.7,
        }


async def web_research(query: str) -> dict[str, Any]:
    if not settings.tavily_api_key:
        return {
            "ok": False,
            "query": query,
            "summary": "Tavily API key not configured.",
            "results": [],
        }

    payload = {
        "api_key": settings.tavily_api_key,
        "query": query,
        "search_depth": "advanced",
        "max_results": 5,
        "include_answer": True,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post("https://api.tavily.com/search", json=payload)
            response.raise_for_status()
            data = response.json()
            return {
                "ok": True,
                "query": query,
                "summary": data.get("answer") or "Research completed.",
                "results": data.get("results") or [],
            }
    except Exception as error:
        return {
            "ok": False,
            "query": query,
            "summary": f"Research unavailable: {error}",
            "results": [],
        }


class SovereignMemoryStore:
    def __init__(self) -> None:
        self.base_path = Path(settings.vector_store_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.vault_file = self.base_path / "memory-vault.jsonl"

    def _read_entries(self) -> list[dict[str, Any]]:
        if not self.vault_file.exists():
            return []

        entries: list[dict[str, Any]] = []
        for line in self.vault_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                payload = json.loads(line)
                if isinstance(payload, dict):
                    entries.append(payload)
            except json.JSONDecodeError:
                continue
        return entries

    def _append_entry(self, payload: dict[str, Any]) -> None:
        serialized = json.dumps(payload, ensure_ascii=False)
        with self.vault_file.open("a", encoding="utf-8") as file:
            file.write(serialized + "\n")

    def add_interaction(self, user_text: str, response_text: str) -> None:
        if not user_text.strip() and not response_text.strip():
            return

        entry_id = str(uuid.uuid4())
        doc = f"USER: {user_text}\nMARZ: {response_text}"
        self._append_entry(
            {
                "id": entry_id,
                "timestamp": int(time.time()),
                "user_text": user_text,
                "response_text": response_text,
                "document": doc,
            }
        )

        if settings.memory_vault_url:
            try:
                with httpx.Client(timeout=8.0) as client:
                    client.post(
                        f"{settings.memory_vault_url.rstrip('/')}/append",
                        json={
                            "id": entry_id,
                            "document": doc,
                            "timestamp": int(time.time()),
                        },
                    )
            except Exception:
                pass

    def query_context(self, prompt: str, top_k: int = 3) -> list[str]:
        if not prompt.strip():
            return []

        prompt_tokens = {token for token in prompt.lower().split() if token}
        scored: list[tuple[int, str]] = []

        for entry in self._read_entries()[-200:]:
            document = str(entry.get("document", ""))
            tokens = {token for token in document.lower().split() if token}
            score = len(prompt_tokens.intersection(tokens))
            if score > 0:
                scored.append((score, document))

        scored.sort(key=lambda item: item[0], reverse=True)
        local_docs = [item[1] for item in scored[:top_k]]

        remote_docs: list[str] = []
        if settings.memory_vault_url:
            try:
                with httpx.Client(timeout=8.0) as client:
                    response = client.post(
                        f"{settings.memory_vault_url.rstrip('/')}/query",
                        json={"query": prompt, "top_k": top_k},
                    )
                    if response.status_code < 400:
                        payload = response.json()
                        items = payload.get("documents") or []
                        remote_docs = [str(item) for item in items if item]
            except Exception:
                remote_docs = []

        merged = (local_docs + remote_docs)[:top_k]
        return merged


memory_store = SovereignMemoryStore()
CONSTITUTION_TEXT = load_constitution_text()


class BrainEngine:
    def __init__(self) -> None:
        self._llm: Any | None = None

    def _load(self) -> Any:
        from vllm import LLM

        if self._llm is None:
            self._llm = LLM(
                model=settings.neural_model_id,
                trust_remote_code=True,
                gpu_memory_utilization=0.9,
                max_model_len=4096,
            )
        return self._llm

    async def infer(self, prompt: str, sentiment_profile: dict[str, Any] | None = None) -> str:
        def _run() -> str:
            from vllm import SamplingParams

            llm = self._load()
            memory_context = memory_store.query_context(prompt, top_k=3)
            memory_block = "\n".join(memory_context) if memory_context else "No prior memory context available."
            sentiment_block = sentiment_profile or {
                "label": "neutral",
                "score": 0.0,
                "temperature_delta": 0.0,
                "empathy_weight": 0.7,
            }
            constrained_prompt = (
                f"[PRIMARY CONSTITUTION]\n{CONSTITUTION_TEXT}\n\n"
                f"[SOVEREIGN MEMORY]\n{memory_block}\n\n"
                f"[SENTIMENT_ANALYSIS_V2]\n"
                f"label={sentiment_block.get('label')} score={sentiment_block.get('score')} empathy_weight={sentiment_block.get('empathy_weight')}\n\n"
                f"[CURRENT REQUEST]\n{prompt}\n"
            )
            baseline = 0.6
            delta = float(sentiment_block.get("temperature_delta", 0.0))
            temperature = max(0.2, min(0.9, baseline + delta))
            params = SamplingParams(temperature=temperature, top_p=0.9, max_tokens=420)
            outputs = llm.generate([constrained_prompt], params)
            if not outputs or not outputs[0].outputs:
                return "No response generated."
            return outputs[0].outputs[0].text.strip()

        return await asyncio.to_thread(_run)


class SovereignVoice:
    def __init__(self) -> None:
        self._tts: Any | None = None

    def _load(self) -> Any:
        from TTS.api import TTS

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


def is_awakening_trigger(incoming: GatewayRequest) -> bool:
    if incoming.awakening:
        return True
    if incoming.action and incoming.action.lower() in {"awakening", "awaken", "wake"}:
        return True
    if incoming.text and "awakening" in incoming.text.lower():
        return True
    return False


def _guess_video_format(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".webm":
        return "webm"
    return "mp4"


async def prepare_awakening_stream(avatar_path: Path) -> tuple[bytes, str]:
    if avatar_path.exists() and avatar_path.suffix.lower() in {".mp4", ".webm"}:
        return avatar_path.read_bytes(), _guess_video_format(avatar_path)

    if avatar_path.exists():
        with tempfile.TemporaryDirectory(prefix="marz-awakening-") as temp_dir:
            temp_output = Path(temp_dir) / "awakening.webm"
            process = await asyncio.create_subprocess_exec(
                "ffmpeg",
                "-y",
                "-i",
                str(avatar_path),
                "-t",
                "2",
                "-c:v",
                "libvpx-vp9",
                "-an",
                str(temp_output),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            await process.communicate()
            if process.returncode == 0 and temp_output.exists():
                return temp_output.read_bytes(), "webm"

    raise FileNotFoundError("Unable to prepare awakening stream; avatar file missing or invalid.")


async def probe_duration_seconds(media_path: Path) -> float:
    process = await asyncio.create_subprocess_exec(
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(media_path),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, _ = await process.communicate()
    if process.returncode != 0:
        return 0.0
    try:
        return float(stdout.decode("utf-8", errors="ignore").strip() or "0")
    except ValueError:
        return 0.0


async def calibrate_sync(video_path: Path, audio_wav: Path, calibrated_path: Path) -> Path:
    offset_sec = max(
        -settings.max_audio_video_offset_ms / 1000.0,
        min(settings.target_audio_video_offset_ms / 1000.0, settings.max_audio_video_offset_ms / 1000.0),
    )

    process = await asyncio.create_subprocess_exec(
        "ffmpeg",
        "-y",
        "-i",
        str(video_path),
        "-itsoffset",
        str(offset_sec),
        "-i",
        str(audio_wav),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-shortest",
        str(calibrated_path),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    await process.communicate()
    if process.returncode != 0 or not calibrated_path.exists():
        return video_path

    video_dur = await probe_duration_seconds(calibrated_path)
    audio_dur = await probe_duration_seconds(audio_wav)
    delta = abs(audio_dur - video_dur)
    if delta > 0.05:
        return video_path

    return calibrated_path


brain = BrainEngine()
voice = SovereignVoice()
lipsync = LipSyncEngine()
sentiment_analysis_v2 = SentimentAnalysisV2()


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
                avatar_path = Path(incoming.avatar_video_path) if incoming.avatar_video_path else Path(settings.default_avatar_video)
                constitution_result = constitution_check(text_prompt)

                if not constitution_result.get("approved", False):
                    await websocket.send_text(
                        safe_json(
                            {
                                "type": "manual_override_request",
                                "request_id": request_id,
                                "constitution": constitution_result,
                            }
                        )
                    )
                    continue

                if is_awakening_trigger(incoming):
                    try:
                        awakening_bytes, awakening_format = await prepare_awakening_stream(avatar_path)
                        await websocket.send_text(
                            safe_json(
                                {
                                    "type": "video_stream",
                                    "request_id": request_id,
                                    "stage": "awakening",
                                    "video_b64": base64.b64encode(awakening_bytes).decode("utf-8"),
                                    "video_format": awakening_format,
                                }
                            )
                        )
                    except Exception:
                        await websocket.send_text(
                            safe_json(
                                {
                                    "type": "status",
                                    "request_id": request_id,
                                    "stage": "awakening",
                                    "message": "Awakening trigger received; preparing live stream.",
                                }
                            )
                        )

                await websocket.send_text(
                    safe_json(
                        {
                            "type": "status",
                            "request_id": request_id,
                            "stage": "brain_processing",
                        }
                    )
                )

                sentiment_profile = sentiment_analysis_v2.analyze(text_prompt)
                await websocket.send_text(
                    safe_json(
                        {
                            "type": "status",
                            "request_id": request_id,
                            "stage": "sentiment_analysis_v2",
                            "sentiment": sentiment_profile,
                        }
                    )
                )

                brain_output = await brain.infer(text_prompt, sentiment_profile=sentiment_profile)
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
                    calibrated_video_path = work / "lipsync-calibrated.mp4"

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

                    await lipsync.render(avatar_path, wav_path, video_path)
                    final_video_path = await calibrate_sync(video_path, wav_path, calibrated_video_path)

                    audio_bytes = wav_path.read_bytes()
                    video_bytes = final_video_path.read_bytes()

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

                    await asyncio.to_thread(memory_store.add_interaction, text_prompt, voiced_output)

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
