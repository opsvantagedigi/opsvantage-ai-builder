# MARZ Standalone Neural Core

This directory provides a standalone GPU container for MARZ neural processing.

## Stack
- Base image: `runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04`
- LLM engine: `vLLM` (Llama 3 class models)
- TTS engine: `Coqui XTTS v2`
- Lip-sync engine: `Wav2Lip + FFmpeg`
- Bridge API: `FastAPI WebSocket` (`/ws/neural-core`)

## Build
```bash
docker build -t marz-neural-core ./neural-core
```

## Run
```bash
docker run --gpus all --rm -p 8080:8080 --env-file ./neural-core/.env.example marz-neural-core
```

## WebSocket Payload
Send JSON to `ws://localhost:8080/ws/neural-core`:

```json
{
  "request_id": "req-123",
  "text": "Summarize current domain operations and propose next move.",
  "avatar_video_path": "/workspace/neural-core/assets/marz-face.mp4"
}
```

Optional fields:
- `voice_text`: pre-transcribed text from upstream voice capture.
- `voice_b64`: accepted for compatibility; provide `voice_text` until STT module is attached.

## Output Events
The socket emits status stages and final result:
- `accepted`
- `brain_processing`
- `tts_generating`
- `lipsync_rendering`
- `result` containing:
  - `text`
  - `audio_b64` (wav)
  - `video_b64` (mp4)

## Auto-Idle Hibernate
A background monitor checks WebSocket activity every 30s.
- If no activity for 10 minutes (`IDLE_TIMEOUT_SECONDS=600`), it sends:
  - `signal: "Hibernate"`
  - to `HIBERNATE_WEBHOOK_URL`
- This is intended to let your GCP orchestrator stop or scale-to-zero billing resources.

## Notes
- Provide `WAV2LIP_CHECKPOINT_PATH` in the image runtime.
- Provide an avatar face video at `DEFAULT_AVATAR_VIDEO`.
- Large base64 media responses are intended for direct dashboard piping; if payload size is too high, switch to object storage URLs.
