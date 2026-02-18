"""
WebRTC Low-Latency Streaming Layer for MARZ Neural Core
Simplified implementation for enterprise video presence
"""

import asyncio
import json
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Optional
from enum import Enum


class StreamState(str, Enum):
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    STREAMING = "streaming"
    ERROR = "error"


@dataclass
class StreamConfig:
    """WebRTC stream configuration"""
    video_bitrate_kbps: int = 2500
    audio_bitrate_kbps: int = 64
    resolution: tuple[int, int] = (1280, 720)
    fps: int = 30
    enable_adaptive_bitrate: bool = True
    target_latency_ms: int = 200
    max_latency_ms: int = 500


@dataclass
class QualityMetrics:
    """Real-time quality metrics"""
    current_latency_ms: float = 0.0
    average_latency_ms: float = 0.0
    jitter_ms: float = 0.0
    packet_loss_percent: float = 0.0
    frame_drops: int = 0
    connection_quality: float = 1.0
    timestamp: float = 0.0


class LatencyMonitor:
    """Monitor stream latency metrics"""
    
    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.latency_samples: list[float] = []
        self.frame_count: int = 0
        self.dropped_frames: int = 0
        self.start_time: float = time.time()
    
    def record_frame_sent(self, frame_id: int) -> None:
        self.frame_timestamps.setdefault(frame_id, {}).sent = time.time() * 1000
    
    def record_frame_ack(self, frame_id: int) -> float:
        now = time.time() * 1000
        if frame_id not in self.frame_timestamps:
            return 0.0
        latency = now - self.frame_timestamps[frame_id].sent
        self.latency_samples.append(latency)
        if len(self.latency_samples) > self.window_size:
            self.latency_samples.pop(0)
        self.frame_count += 1
        return latency
    
    def record_frame_dropped(self) -> None:
        self.dropped_frames += 1
    
    def get_metrics(self) -> QualityMetrics:
        avg_latency = sum(self.latency_samples) / len(self.latency_samples) if self.latency_samples else 0.0
        quality = max(0.0, min(1.0, 1.0 - (self.dropped_frames / max(1, self.frame_count)) * 5))
        
        return QualityMetrics(
            current_latency_ms=self.latency_samples[-1] if self.latency_samples else 0.0,
            average_latency_ms=avg_latency,
            jitter_ms=0.0,
            packet_loss_percent=(self.dropped_frames / max(1, self.frame_count)) * 100,
            frame_drops=self.dropped_frames,
            connection_quality=quality,
            timestamp=time.time(),
        )


class WebRTCVideoStreamer:
    """WebRTC video streaming for MARZ"""
    
    def __init__(self, config: StreamConfig):
        self.config = config
        self.state = StreamState.DISCONNECTED
        self.stream_id: str = str(uuid.uuid4())
        self.monitor = LatencyMonitor()
        self._frame_id = 0
    
    async def connect(self) -> None:
        self.state = StreamState.CONNECTING
        await asyncio.sleep(0.1)
        self.state = StreamState.CONNECTED
    
    async def disconnect(self) -> None:
        self.state = StreamState.DISCONNECTED
        self.monitor = LatencyMonitor()
    
    def get_metrics(self) -> QualityMetrics:
        return self.monitor.get_metrics()
    
    def get_stats(self) -> dict[str, Any]:
        metrics = self.get_metrics()
        return {
            "stream_id": self.stream_id,
            "state": self.state.value,
            "average_latency_ms": metrics.average_latency_ms,
            "connection_quality": metrics.connection_quality,
        }


class MARZVideoPresenceService:
    """Main service coordinating MARZ video presence"""
    
    def __init__(self, config: Optional[StreamConfig] = None):
        self.config = config or StreamConfig()
        self._connected_clients: dict[str, WebRTCVideoStreamer] = {}
    
    async def initialize(self) -> None:
        pass
    
    async def create_stream_for_client(self, client_id: str) -> WebRTCVideoStreamer:
        streamer = WebRTCVideoStreamer(self.config)
        await streamer.connect()
        self._connected_clients[client_id] = streamer
        return streamer
    
    async def remove_client(self, client_id: str) -> None:
        if client_id in self._connected_clients:
            await self._connected_clients[client_id].disconnect()
            del self._connected_clients[client_id]
    
    def get_global_stats(self) -> dict[str, Any]:
        total_latency = 0.0
        total_quality = 0.0
        
        for streamer in self._connected_clients.values():
            metrics = streamer.get_metrics()
            total_latency += metrics.average_latency_ms
            total_quality += metrics.connection_quality
        
        count = len(self._connected_clients)
        return {
            "connected_clients": count,
            "average_latency_ms": total_latency / max(1, count),
            "average_quality": total_quality / max(1, count),
        }
