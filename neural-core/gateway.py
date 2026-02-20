import asyncio
import base64
import json
import os
import tempfile
import time
import traceback
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

os.environ.setdefault("COQUI_TOS_AGREED", "1")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Default to an open-access model so Neural Core works without HuggingFace auth.
    # For gated models (e.g. meta-llama/*), set HUGGINGFACE_TOKEN.
    neural_model_id: str = os.getenv("NEURAL_MODEL_ID", "microsoft/Phi-3-mini-4k-instruct")
    huggingface_token: str | None = (
        (os.getenv("HUGGINGFACE_TOKEN") or os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_HUB_TOKEN") or "")
        .replace("\r", "")
        .replace("\n", "")
        .strip()
        or None
    )
    xtts_model_id: str = VOICE_PARAMS.get("model_name", "tts_models/multilingual/multi-dataset/xtts_v2")
    sovereign_voice_sample: str | None = None
    wav2lip_checkpoint_url: str | None = (
        (os.getenv("WAV2LIP_CHECKPOINT_URL") or "").replace("\r", "").replace("\n", "").strip() or None
    )
    wav2lip_checkpoint_path: str = "/opt/Wav2Lip/checkpoints/wav2lip_gan.pth"
    wav2lip_repo_path: str = "/opt/Wav2Lip"
    default_avatar_video: str = "/workspace/neural-core/assets/marz-face.mp4"
    constitution_path: str = "/workspace/neural-core/constitution.md"
    vector_store_path: str = "/workspace/neural-core/data/chroma"
    memory_vault_url: str | None = None
    tavily_api_key: str | None = None
    target_audio_video_offset_ms: int = 35
    max_audio_video_offset_ms: int = 50
    use_vllm: bool = os.getenv("NEURAL_USE_VLLM", "true").lower() != "false"

    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8080"))
    idle_timeout_seconds: int = 600

    hibernate_webhook_url: str | None = None
    hibernate_auth_token: str | None = None
    hibernate_signal_name: str = "Hibernate"
    hibernate_cooldown_seconds: int = 600


settings = Settings()

ALLOWED_OUTBOUND_HOSTS = {
    "api.tavily.com",
    "opsvantage-ai-builder-1018462465472.europe-west4.run.app",
    "opsvantage-ai-builder-1018462465472.us-central1.run.app",
    "opsvantage-ai-builder-xge3xydmha-ez.a.run.app",
}


def is_allowed_outbound_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return parsed.scheme == "https" and parsed.hostname in ALLOWED_OUTBOUND_HOSTS
    except Exception:
        return False

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
            tavily_url = "https://api.tavily.com/search"
            if not is_allowed_outbound_url(tavily_url):
                raise ValueError("Blocked outbound request by allowlist policy.")
            response = await client.post(tavily_url, json=payload)
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
                    append_url = f"{settings.memory_vault_url.rstrip('/')}/append"
                    if not is_allowed_outbound_url(append_url):
                        return
                    client.post(
                        append_url,
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
                    query_url = f"{settings.memory_vault_url.rstrip('/')}/query"
                    if not is_allowed_outbound_url(query_url):
                        return local_docs
                    response = client.post(
                        query_url,
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
        self._fallback_model: Any | None = None
        self._fallback_tokenizer: Any | None = None
        self._fallback_device: Any | None = None
        self._use_fallback = False

    def _load(self) -> Any:
        from vllm import LLM

        if not settings.use_vllm:
            self._use_fallback = True
            return None

        if self._llm is None:
            model_id = settings.neural_model_id
            if "meta-llama" in model_id and not (settings.huggingface_token or ""):
                print(f"[BrainEngine] WARNING: {model_id} requires HUGGINGFACE_TOKEN")
                print("[BrainEngine] Falling back to microsoft/Phi-3-mini-4k-instruct (no auth required)")
                model_id = "microsoft/Phi-3-mini-4k-instruct"

            try:
                self._llm = LLM(
                    model=model_id,
                    trust_remote_code=True,
                    gpu_memory_utilization=0.9,
                    max_model_len=4096,
                )
            except Exception as exc:
                self._use_fallback = True
                self._llm = None
                print(f"[BrainEngine] vLLM init failed; falling back to transformers. Error: {exc}")
        return self._llm

    def _load_fallback(self) -> tuple[Any, Any, Any]:
        if self._fallback_model is None or self._fallback_tokenizer is None:
            try:
                from transformers import AutoTokenizer  # type: ignore
            except Exception:
                from transformers.models.auto.tokenization_auto import AutoTokenizer  # type: ignore

            try:
                from transformers import AutoModelForCausalLM  # type: ignore
            except Exception:
                from transformers.models.auto.modeling_auto import AutoModelForCausalLM  # type: ignore
            import torch

            model_id = settings.neural_model_id
            if "meta-llama" in model_id and not (settings.huggingface_token or ""):
                model_id = "microsoft/Phi-3-mini-4k-instruct"

            tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
            if tokenizer.pad_token is None:
                tokenizer.pad_token = tokenizer.eos_token

            dtype = torch.float16 if torch.cuda.is_available() else torch.float32
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

            model = AutoModelForCausalLM.from_pretrained(
                model_id,
                torch_dtype=dtype,
                trust_remote_code=True,
            )
            model.to(device)
            model.eval()

            self._fallback_model = model
            self._fallback_tokenizer = tokenizer
            self._fallback_device = device

        return self._fallback_model, self._fallback_tokenizer, self._fallback_device

    async def infer(self, prompt: str, sentiment_profile: dict[str, Any] | None = None) -> str:
        def _run() -> str:
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
                f"[OUTPUT CONSTRAINTS]\n"
                f"Respond as MARZ in 1-2 short sentences (max 280 characters).\n"
                f"No lists. No markdown. No role tags.\n\n"
                f"[SENTIMENT_ANALYSIS_V2]\n"
                f"label={sentiment_block.get('label')} score={sentiment_block.get('score')} empathy_weight={sentiment_block.get('empathy_weight')}\n\n"
                f"[CURRENT REQUEST]\n{prompt}\n"
            )
            baseline = 0.6
            delta = float(sentiment_block.get("temperature_delta", 0.0))
            temperature = max(0.2, min(0.9, baseline + delta))
            if not self._use_fallback:
                try:
                    from vllm import SamplingParams

                    llm = self._load()
                    if llm is not None:
                        params = SamplingParams(temperature=temperature, top_p=0.9, max_tokens=420)
                        outputs = llm.generate([constrained_prompt], params)
                        if outputs and outputs[0].outputs:
                            return outputs[0].outputs[0].text.strip()
                except Exception as exc:
                    self._use_fallback = True
                    print(f"[BrainEngine] vLLM inference failed; falling back to transformers. Error: {exc}")

            model, tokenizer, device = self._load_fallback()
            import torch

            inputs = tokenizer(constrained_prompt, return_tensors="pt")
            inputs = {key: value.to(device) for key, value in inputs.items()}
            with torch.inference_mode():
                generated = model.generate(
                    **inputs,
                    max_new_tokens=420,
                    do_sample=True,
                    temperature=temperature,
                    top_p=0.9,
                    pad_token_id=tokenizer.eos_token_id,
                )
            output_ids = generated[0][inputs["input_ids"].shape[-1] :]
            text = tokenizer.decode(output_ids, skip_special_tokens=True)
            return text.strip() or "No response generated."

        return await asyncio.to_thread(_run)


class SovereignVoice:
    def __init__(self) -> None:
        self._tts: Any | None = None

    def _load(self) -> Any:
        from TTS.api import TTS

        def _force_cpu_float32(model: Any) -> None:
            try:
                import torch

                if hasattr(model, "to"):
                    model.to(torch.device("cpu"))
                if hasattr(model, "float"):
                    model.float()
            except Exception:
                return

        def _force_tts_cpu_float32(tts: Any) -> None:
            try:
                synth = getattr(tts, "synthesizer", None)
                if synth is None:
                    return

                for attr in ("tts_model", "vocoder_model", "model"):
                    m = getattr(synth, attr, None)
                    if m is not None:
                        _force_cpu_float32(m)
            except Exception:
                return

        if self._tts is None:
            try:
                import torch

                torch.set_default_dtype(torch.float32)
            except Exception:
                pass
            self._tts = TTS(settings.xtts_model_id, gpu=False)
            _force_tts_cpu_float32(self._tts)
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
                        **tts_kwargs,
                    )
                except TypeError:
                    fallback_kwargs = {key: value for key, value in tts_kwargs.items() if key != "emotion"}
                    tts.tts_to_file(
                        text=text,
                        file_path=str(out_wav),
                        speaker_wav=settings.sovereign_voice_sample,
                        **fallback_kwargs,
                    )
            else:
                speaker: str | None = None
                try:
                    speakers = getattr(tts, "speakers", None)
                    if isinstance(speakers, (list, tuple)) and speakers:
                        speaker = str(speakers[0])
                except Exception:
                    speaker = None

                # Skip language detection - model is not multi-lingual
                language: str | None = None

                base_kwargs = dict(tts_kwargs)
                if speaker:
                    base_kwargs.setdefault("speaker", speaker)

                # Prefer writing directly to a wav file when supported.
                for drop_keys in ((), ("emotion",), ("emotion", "speaker")):
                    attempt_kwargs = {k: v for k, v in base_kwargs.items() if k not in drop_keys}
                    try:
                        if hasattr(tts, "tts_to_file"):
                            tts.tts_to_file(text=text, file_path=str(out_wav), **attempt_kwargs)
                            return
                        wav = tts.tts(text=text, **attempt_kwargs)
                        sf.write(str(out_wav), wav, 24000)
                        return
                    except TypeError:
                        continue

                # Last resort: call tts() with no extras.
                wav = tts.tts(text=text)
                sf.write(str(out_wav), wav, 24000)

        await asyncio.to_thread(_run)


def clamp_tts_text(text: str, max_chars: int = 280) -> str:
    normalized = " ".join((text or "").split())
    if len(normalized) <= max_chars:
        return normalized

    cut_points = [
        normalized.rfind(".", 0, max_chars),
        normalized.rfind("!", 0, max_chars),
        normalized.rfind("?", 0, max_chars),
        normalized.rfind(" ", 0, max_chars),
    ]
    cut = max(cut_points)
    if cut < 1:
        cut = max_chars
    return normalized[:cut].rstrip() + "…"


def ensure_min_tts_text(text: str, min_chars: int = 32) -> str:
    normalized = " ".join((text or "").split()).strip()
    if len(normalized) >= min_chars:
        return normalized

    if not normalized:
        normalized = "Understood."

    suffix = " Please continue."
    combined = f"{normalized}{suffix}"
    if len(combined) >= min_chars:
        return combined

    # Last resort: pad with a short neutral phrase.
    padding = " I'm listening." * 3
    return (combined + padding).strip()


class LipSyncEngine:
    async def _ensure_checkpoint(self) -> None:
        checkpoint = Path(settings.wav2lip_checkpoint_path)
        if checkpoint.exists():
            return

        checkpoint.parent.mkdir(parents=True, exist_ok=True)

        def _download() -> None:
            token = (settings.huggingface_token or "").replace("\r", "").replace("\n", "").strip()
            auth_headers = {"authorization": f"Bearer {token}"} if token else {}

            configured_url = (settings.wav2lip_checkpoint_url or "").strip()

            urls: list[tuple[str, str, dict[str, str]]] = [
                ("sovereign", configured_url, {}),
                (
                    "sharepoint",
                    "https://iiitaphyd-my.sharepoint.com/:u:/g/personal/radrabha_m_research_iiit_ac_in/EbVZT77Xx8tMq7tV5zPqQ6wBqV8H9p4N2kL5mR3tY6wXzA?download=1",
                    {},
                ),
                (
                    "huggingface",
                    "https://huggingface.co/justinjohn/wav2lip/resolve/main/wav2lip_gan.pth",
                    auth_headers,
                ),
            ]

            tmp_path = checkpoint.parent / f".{checkpoint.name}.download"
            for label, url, headers in urls:
                if not url:
                    continue
                try:
                    print(f"[wav2lip] checkpoint missing; downloading via {label}: {url}")

                    if url.startswith("gs://"):
                        # Download from a private GCS bucket using the Cloud Run service account.
                        # Requires roles/storage.objectViewer on the object/bucket.
                        from google.cloud import storage

                        without_scheme = url[len("gs://") :]
                        bucket_name, blob_name = without_scheme.split("/", 1)
                        client = storage.Client()
                        bucket = client.bucket(bucket_name)
                        blob = bucket.blob(blob_name)
                        blob.download_to_filename(str(tmp_path))
                    else:
                        with httpx.Client(timeout=180.0, follow_redirects=True) as client:
                            with client.stream("GET", url, headers=headers) as response:
                                response.raise_for_status()
                                with tmp_path.open("wb") as handle:
                                    for chunk in response.iter_bytes():
                                        if chunk:
                                            handle.write(chunk)

                    size_mb = tmp_path.stat().st_size / 1024 / 1024
                    if size_mb < 50:
                        raise RuntimeError(f"Downloaded checkpoint too small ({size_mb:.1f}MB)")

                    tmp_path.replace(checkpoint)
                    print(f"[wav2lip] checkpoint downloaded ({size_mb:.1f}MB)")
                    return
                except Exception as error:
                    print(f"[wav2lip] checkpoint download failed via {label}: {error}")
                    try:
                        if tmp_path.exists():
                            tmp_path.unlink()
                    except Exception:
                        pass

            raise RuntimeError("Unable to download Wav2Lip checkpoint from all sources.")

        await asyncio.to_thread(_download)
        if not checkpoint.exists():
            raise FileNotFoundError(f"Wav2Lip checkpoint missing after download: {checkpoint}")

    async def render(self, face_video: Path, audio_wav: Path, out_mp4: Path) -> None:
        if not face_video.exists():
            raise FileNotFoundError(f"Avatar source not found: {face_video}")

        await self._ensure_checkpoint()

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


async def mux_audio_onto_avatar(avatar_video: Path, audio_wav: Path, out_mp4: Path) -> Path:
    if not avatar_video.exists():
        raise FileNotFoundError(f"Avatar source not found: {avatar_video}")
    if not audio_wav.exists():
        raise FileNotFoundError(f"Audio source not found: {audio_wav}")

    process = await asyncio.create_subprocess_exec(
        "ffmpeg",
        "-y",
        "-stream_loop",
        "-1",
        "-i",
        str(avatar_video),
        "-i",
        str(audio_wav),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-shortest",
        str(out_mp4),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await process.communicate()
    if process.returncode != 0 or not out_mp4.exists():
        details = stderr.decode("utf-8", errors="ignore")
        raise RuntimeError(f"ffmpeg mux failed: {details}")

    return out_mp4


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


@app.post("/api/reflection/trigger")
async def reflection_trigger(request: Request) -> JSONResponse:
    expected_token = os.getenv("REFLECTION_TRIGGER_TOKEN", "").strip()
    if expected_token:
        provided = request.headers.get("authorization", "")
        if provided != f"Bearer {expected_token}":
            return JSONResponse({"ok": False, "error": "Unauthorized"}, status_code=401)

    result = await asyncio.to_thread(run_reflection_once)
    return JSONResponse(result)


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
                tts_text = ensure_min_tts_text(clamp_tts_text(voiced_output, max_chars=280))

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

                    await voice.synthesize(tts_text, wav_path)

                    await websocket.send_text(
                        safe_json(
                            {
                                "type": "status",
                                "request_id": request_id,
                                "stage": "lipsync_rendering",
                            }
                        )
                    )

                    fallback_video_path = work / "avatar-with-audio.mp4"
                    try:
                        render_timeout_seconds = int(os.getenv("WAV2LIP_RENDER_TIMEOUT_SECONDS", "120"))
                        calibrate_timeout_seconds = int(os.getenv("WAV2LIP_CALIBRATE_TIMEOUT_SECONDS", "60"))
                        mux_timeout_seconds = int(os.getenv("WAV2LIP_MUX_TIMEOUT_SECONDS", "45"))

                        await asyncio.wait_for(
                            lipsync.render(avatar_path, wav_path, video_path),
                            timeout=render_timeout_seconds,
                        )
                        final_video_path = await asyncio.wait_for(
                            calibrate_sync(video_path, wav_path, calibrated_video_path),
                            timeout=calibrate_timeout_seconds,
                        )
                    except Exception as lipsync_error:
                        print("[wav2lip] lipsync unavailable; falling back to avatar mux", repr(lipsync_error))
                        final_video_path = await asyncio.wait_for(
                            mux_audio_onto_avatar(avatar_path, wav_path, fallback_video_path),
                            timeout=mux_timeout_seconds,
                        )

                    audio_bytes = wav_path.read_bytes()
                    video_bytes = final_video_path.read_bytes()

                    await websocket.send_text(
                        safe_json(
                            {
                                "type": "result",
                                "request_id": request_id,
                                "text": tts_text,
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
                print("[NeuralCore] pipeline_error", repr(pipeline_error))
                traceback.print_exc()
                await websocket.send_text(
                    safe_json(
                        {
                            "type": "error",
                            "request_id": request_id,
                            "message": f"{type(pipeline_error).__name__}: {pipeline_error}",
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("gateway:app", host=settings.host, port=settings.port)
