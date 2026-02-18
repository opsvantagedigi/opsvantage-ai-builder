"""
Wav2Lip Enterprise Integration Module
Provides GPU-accelerated lip-sync rendering with latency optimization
for MARZ's real-time video presence system.
"""

import asyncio
import base64
import os
import tempfile
import time
from pathlib import Path
from typing import Any, Optional
from dataclasses import dataclass, field
import subprocess
import aiofiles
import aiofiles.os
import torch
import numpy as np
import soundfile as sf
import ffmpeg

from pydantic import BaseModel


@dataclass
class Wav2LipConfig:
    """Configuration for Wav2Lip inference"""
    checkpoint_path: str = "/opt/Wav2Lip/checkpoints/wav2lip_gan.pth"
    repo_path: str = "/opt/Wav2Lip"
    face_resolution: tuple[int, int] = (96, 96)
    fps: int = 25
    pads: tuple[int, int, int, int] = field(default_factory=lambda: (0, 0, 0, 0))
    face_det_batch_size: int = 16
    wav2lip_batch_size: int = 128
    gpu_id: int = 0
    enable_gpu_acceleration: bool = True
    enable_face_enhancement: bool = False
    nosmooth: bool = False
    static: bool = False
    crop: tuple[int, int, int, int] = field(default_factory=lambda: (-1, -1, -1, -1))


@dataclass
class LatencyMetrics:
    """Performance metrics for lip-sync rendering"""
    preprocessing_time_ms: float = 0.0
    face_detection_time_ms: float = 0.0
    lip_sync_inference_time_ms: float = 0.0
    postprocessing_time_ms: float = 0.0
    total_time_ms: float = 0.0
    gpu_memory_used_mb: float = 0.0
    success: bool = False
    error_message: str = ""


class Wav2LipModel:
    """
    GPU-accelerated Wav2Lip model wrapper with lazy loading
    """
    _instance: Optional["Wav2LipModel"] = None
    _lock = asyncio.Lock()
    
    def __init__(self, config: Wav2LipConfig):
        self.config = config
        self._model: Any = None
        self._device: Optional[str] = None
        self._face_detector: Any = None
        self._initialized = False
    
    @classmethod
    async def get_instance(cls, config: Wav2LipConfig) -> "Wav2LipModel":
        """Singleton pattern for model instance"""
        if cls._instance is None:
            async with cls._lock:
                if cls._instance is None:
                    cls._instance = cls(config)
                    await cls._instance.initialize()
        return cls._instance
    
    async def initialize(self) -> None:
        """Lazy initialization of Wav2Lip model and face detector"""
        if self._initialized:
            return
        
        def _load_model():
            import sys
            sys.path.insert(0, self.config.repo_path)
            
            if self.config.enable_gpu_acceleration and torch.cuda.is_available():
                torch.cuda.set_device(self.config.gpu_id)
                self._device = f"cuda:{self.config.gpu_id}"
            else:
                self._device = "cpu"
            
            from models import Wav2Lip as Wav2LipModelClass
            self._model = Wav2LipModelClass()
            
            checkpoint = torch.load(self.config.checkpoint_path, map_location=self._device)
            self._model.load_state_dict(checkpoint["state_dict"])
            self._model = self._model.to(self._device)
            self._model.eval()
            
            self._face_detector = None
            self._initialized = True
        
        await asyncio.to_thread(_load_model)
    
    def _load_face_detector(self):
        """Load face detector lazily"""
        if self._face_detector is not None:
            return self._face_detector
        
        from face_detection import FaceAlignment, LandmarksType
        self._face_detector = FaceAlignment(LandmarksType._2D, flip_input=False, device=self._device)
        return self._face_detector
    
    async def get_gpu_memory_usage(self) -> float:
        """Get current GPU memory usage in MB"""
        if self._device and self._device.startswith("cuda"):
            return await asyncio.to_thread(
                lambda: torch.cuda.memory_allocated(self.config.gpu_id) / (1024 * 1024)
            )
        return 0.0
    
    async def render_lipsync(
        self,
        face_video_path: Path,
        audio_wav_path: Path,
        output_path: Path,
    ) -> LatencyMetrics:
        """Render lip-synced video with performance metrics"""
        metrics = LatencyMetrics()
        start_time = time.perf_counter()
        
        try:
            if not await aiofiles.os.path.exists(str(face_video_path)):
                raise FileNotFoundError(f"Face video not found: {face_video_path}")
            if not await aiofiles.os.path.exists(str(audio_wav_path)):
                raise FileNotFoundError(f"Audio file not found: {audio_wav_path}")
            
            preprocess_start = time.perf_counter()
            video_frames, audio_data = await self._preprocess_inputs(face_video_path, audio_wav_path)
            metrics.preprocessing_time_ms = (time.perf_counter() - preprocess_start) * 1000
            
            face_detect_start = time.perf_counter()
            face_detections = await self._detect_faces(video_frames)
            metrics.face_detection_time_ms = (time.perf_counter() - face_detect_start) * 1000
            
            inference_start = time.perf_counter()
            synced_frames = await self._run_inference(video_frames, face_detections, audio_data)
            metrics.lip_sync_inference_time_ms = (time.perf_counter() - inference_start) * 1000
            
            postprocess_start = time.perf_counter()
            await self._assemble_video(synced_frames, audio_wav_path, output_path)
            metrics.postprocessing_time_ms = (time.perf_counter() - postprocess_start) * 1000
            
            metrics.total_time_ms = (time.perf_counter() - start_time) * 1000
            metrics.gpu_memory_used_mb = await self.get_gpu_memory_usage()
            metrics.success = True
            
        except Exception as e:
            metrics.success = False
            metrics.error_message = str(e)
            metrics.total_time_ms = (time.perf_counter() - start_time) * 1000
        
        return metrics
    
    async def _preprocess_inputs(self, video_path: Path, audio_path: Path) -> tuple[list[np.ndarray], np.ndarray]:
        """Extract video frames and audio data"""
        def _extract():
            frames = []
            container = ffmpeg.input(str(video_path))
            probe = ffmpeg.probe(str(video_path))
            video_info = next(s for s in probe["streams"] if s["codec_type"] == "video")
            
            process = (
                ffmpeg.input(str(video_path))
                .output("pipe:", format="rawvideo", pix_fmt="rgb24")
                .run_async(pipe_stdout=True, pipe_stderr=True)
            )
            out, _ = process.communicate()
            
            width = int(video_info["width"])
            height = int(video_info["height"])
            frames = np.frombuffer(out, np.uint8).reshape([-1, height, width, 3])
            
            audio_data, sample_rate = sf.read(str(audio_path))
            
            return frames.tolist(), audio_data
        
        frames, audio_data = await asyncio.to_thread(_extract)
        return frames, audio_data
    
    async def _detect_faces(self, frames: list[np.ndarray]) -> list[Optional[np.ndarray]]:
        """Detect faces in video frames"""
        def _detect():
            fa = self._load_face_detector()
            detections = []
            
            for frame in frames:
                preds = fa.get_landmarks(frame)
                if len(preds) > 0:
                    detections.append(preds[0])
                else:
                    detections.append(None)
            
            return detections
        
        return await asyncio.to_thread(_detect)
    
    async def _run_inference(
        self,
        frames: list[np.ndarray],
        face_detections: list[Optional[np.ndarray]],
        audio_data: np.ndarray,
    ) -> list[np.ndarray]:
        """Run Wav2Lip inference"""
        def _inference():
            from hparams import hparams as hp
            import cv2
            
            synced_frames = []
            mel = self._audio_to_mel(audio_data)
            mel_chunks = self._create_mel_chunks(mel)
            
            for i, (frame, face, mel_chunk) in enumerate(zip(frames, face_detections, mel_chunks)):
                if face is None:
                    synced_frames.append(frame)
                    continue
                
                cropped_face = self._crop_face(frame, face)
                resized_face = cv2.resize(cropped_face, (96, 96))
                normalized_face = resized_face / 255.0
                input_tensor = torch.FloatTensor(normalized_face.transpose(2, 0, 1)).unsqueeze(0)
                input_tensor = input_tensor.to(self._device)
                
                mel_tensor = torch.FloatTensor(mel_chunk).unsqueeze(0).unsqueeze(0)
                mel_tensor = mel_tensor.to(self._device)
                
                with torch.no_grad():
                    output = self._model(mel_tensor, input_tensor)
                
                output_frame = output.squeeze().cpu().numpy().transpose(1, 2, 0)
                output_frame = (output_frame * 255).astype(np.uint8)
                
                composite = self._composite_face(frame, output_frame, face)
                synced_frames.append(composite)
            
            return synced_frames
        
        return await asyncio.to_thread(_inference)
    
    def _audio_to_mel(self, audio_data: np.ndarray) -> np.ndarray:
        """Convert audio to mel spectrogram"""
        from audio import load_wav, melspectrogram
        
        if audio_data.dtype != np.float32:
            audio_data = audio_data.astype(np.float32)
        
        audio_data = audio_data / np.max(np.abs(audio_data))
        mel = melspectrogram(audio_data)
        
        if np.isnan(mel.reshape(-1)).sum() > 0:
            raise ValueError("Mel spectrogram contained NaN values")
        
        return mel.clip(-6, 2)
    
    def _create_mel_chunks(self, mel: np.ndarray, chunk_size: int = 16) -> list[np.ndarray]:
        """Create mel spectrogram chunks for inference"""
        mel_chunks = []
        i = 0
        while i < (mel.shape[1] - chunk_size):
            mel_chunks.append(mel[:, i:i + chunk_size])
            i += 1
        return mel_chunks
    
    def _crop_face(self, frame: np.ndarray, landmarks: np.ndarray) -> np.ndarray:
        """Crop face from frame using landmarks"""
        x_min = int(np.min(landmarks[:, 0]))
        x_max = int(np.max(landmarks[:, 0]))
        y_min = int(np.min(landmarks[:, 1]))
        y_max = int(np.max(landmarks[:, 1]))
        
        pad_x = int((x_max - x_min) * 0.1)
        pad_y = int((y_max - y_min) * 0.1)
        
        x_min = max(0, x_min - pad_x)
        x_max = min(frame.shape[1], x_max + pad_x)
        y_min = max(0, y_min - pad_y)
        y_max = min(frame.shape[0], y_max + pad_y)
        
        return frame[y_min:y_max, x_min:x_max]
    
    def _composite_face(self, original: np.ndarray, generated: np.ndarray, landmarks: np.ndarray) -> np.ndarray:
        """Composite generated face back into original frame"""
        import cv2
        
        x_min = int(np.min(landmarks[:, 0]))
        x_max = int(np.max(landmarks[:, 0]))
        y_min = int(np.min(landmarks[:, 1]))
        y_max = int(np.max(landmarks[:, 1]))
        
        generated_resized = cv2.resize(generated, (x_max - x_min, y_max - y_min))
        
        mask = np.ones((y_max - y_min, x_max - x_min), dtype=np.float32)
        feather = 10
        mask[:feather, :] *= np.linspace(0, 1, feather)[:, np.newaxis]
        mask[-feather:, :] *= np.linspace(1, 0, feather)[:, np.newaxis]
        mask[:, :feather] *= np.linspace(0, 1, feather)[np.newaxis, :]
        mask[:, -feather:] *= np.linspace(1, 0, feather)[np.newaxis, :]
        
        result = original.copy()
        result[y_min:y_max, x_min:x_max] = (
            original[y_min:y_max, x_min:x_max] * (1 - mask[:, :, np.newaxis]) +
            generated_resized * mask[:, :, np.newaxis]
        )
        
        return result
    
    async def _assemble_video(self, frames: list[np.ndarray], audio_path: Path, output_path: Path) -> None:
        """Assemble frames into final video with audio"""
        def _assemble():
            import cv2
            
            if len(frames) == 0:
                raise ValueError("No frames to assemble")
            
            height, width = frames[0].shape[:2]
            
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            temp_video = output_path.with_suffix(".temp.mp4")
            out = cv2.VideoWriter(str(temp_video), fourcc, 25, (width, height))
            
            for frame in frames:
                out.write(cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
            
            out.release()
            
            (
                ffmpeg
                .input(str(temp_video))
                .input(str(audio_path))
                .output(
                    str(output_path),
                    vcodec="libx264",
                    acodec="aac",
                    audio_bitrate="192k",
                    preset="fast",
                    movflags="faststart",
                )
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            
            temp_video.unlink(missing_ok=True)
        
        await asyncio.to_thread(_assemble)


class EnterpriseLipSyncService:
    """Enterprise-grade lip-sync service with caching and optimization"""
    
    def __init__(self, config: Optional[Wav2LipConfig] = None):
        self.config = config or Wav2LipConfig()
        self._model: Optional[Wav2LipModel] = None
        self._cache: dict[str, bytes] = {}
        self._cache_max_size = 100
        self._request_count = 0
        self._total_latency_ms = 0.0
    
    async def initialize(self) -> None:
        """Initialize the service and warm up the model"""
        self._model = await Wav2LipModel.get_instance(self.config)
    
    async def render(
        self,
        face_video_path: Path,
        audio_wav_path: Path,
        output_path: Path,
        use_cache: bool = True,
    ) -> LatencyMetrics:
        """Render lip-synced video with enterprise features"""
        self._request_count += 1
        
        cache_key = f"{face_video_path}:{audio_wav_path}"
        if use_cache and cache_key in self._cache:
            output_path.write_bytes(self._cache[cache_key])
            return LatencyMetrics(
                success=True,
                total_time_ms=0.0,
                gpu_memory_used_mb=await self._model.get_gpu_memory_usage() if self._model else 0.0,
            )
        
        if self._model is None:
            raise RuntimeError("Service not initialized")
        
        metrics = await self._model.render_lipsync(face_video_path, audio_wav_path, output_path)
        
        if use_cache and metrics.success and len(self._cache) < self._cache_max_size:
            self._cache[cache_key] = output_path.read_bytes()
        
        self._total_latency_ms += metrics.total_time_ms
        return metrics
    
    def get_average_latency_ms(self) -> float:
        """Get average latency across all requests"""
        if self._request_count == 0:
            return 0.0
        return self._total_latency_ms / self._request_count
    
    def get_stats(self) -> dict[str, Any]:
        """Get service statistics"""
        return {
            "request_count": self._request_count,
            "average_latency_ms": self.get_average_latency_ms(),
            "cache_size": len(self._cache),
            "cache_max_size": self._cache_max_size,
            "gpu_acceleration_enabled": self.config.enable_gpu_acceleration,
            "gpu_id": self.config.gpu_id,
        }
    
    async def clear_cache(self) -> None:
        """Clear the result cache"""
        self._cache.clear()
