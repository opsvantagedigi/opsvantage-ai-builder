#!/usr/bin/env python3
"""
MARZ Neural Presence Handshake Test

Sends a tiny packet to the Cloud GPU and measures response latency.
Usage: python handshake_test.py
"""

import asyncio
import time
import os
import sys

# Fix Windows console encoding for emojis
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import httpx

NEURAL_CORE_URL = os.getenv(
    "NEXT_PUBLIC_NEURAL_CORE_URL",
    "https://marz-neural-core-1018462465472.europe-west4.run.app"
)

HEALTH_ENDPOINT = f"{NEURAL_CORE_URL.rstrip('/')}/health"
WEBSOCKET_ENDPOINT = NEURAL_CORE_URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws/neural-core"


async def test_health_endpoint() -> None:
    """Test the /health endpoint and measure latency."""
    print(f"\n{'='*60}")
    print("MARZ NEURAL PRESENCE - HANDSHAKE TEST")
    print(f"{'='*60}")
    print(f"Target: {NEURAL_CORE_URL}")
    print(f"{'='*60}\n")

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            start = time.perf_counter()
            response = await client.get(HEALTH_ENDPOINT)
            elapsed_ms = (time.perf_counter() - start) * 1000

            print(f"📡 Health Endpoint Response: {response.status_code}")
            print(f"⏱️  Latency: {elapsed_ms:.2f} ms")

            if response.status_code == 200:
                data = response.json()
                print(f"✅ Status: MARZ Neural Core is ONLINE")
                print(f"   Idle Timeout: {data.get('idle_timeout_seconds', 'N/A')}s")
                print(f"   Hibernate Configured: {data.get('hibernate_configured', False)}")
            else:
                print(f"⚠️  Unexpected response: {response.text}")

        except httpx.ConnectError as e:
            print(f"❌ Connection Failed: {e}")
            print("   MARZ Neural Core may be offline or unreachable.")
        except httpx.TimeoutException as e:
            print(f"❌ Timeout: {e}")
            print("   Request timed out waiting for MARZ response.")
        except Exception as e:
            print(f"❌ Error: {e}")


async def test_websocket_handshake() -> None:
    """Test WebSocket handshake with MARZ Neural Core."""
    print(f"\n{'='*60}")
    print("WEBSOCKET HANDSHAKE TEST")
    print(f"{'='*60}\n")

    try:
        import websockets
    except ImportError:
        print("⚠️  websockets not installed. Skipping WebSocket test.")
        print("   Install with: pip install websockets")
        return

    start = time.perf_counter()
    try:
        async with websockets.connect(WEBSOCKET_ENDPOINT, open_timeout=30) as ws:
            connect_ms = (time.perf_counter() - start) * 1000
            print(f"🔌 WebSocket Connected in {connect_ms:.2f} ms")

            # Send a minimal handshake packet
            handshake_payload = '{"text": "handshake", "request_id": "test-001"}'

            send_start = time.perf_counter()
            await ws.send(handshake_payload)
            send_ms = (time.perf_counter() - send_start) * 1000
            print(f"📤 Handshake packet sent in {send_ms:.2f} ms")

            # Wait for response
            recv_start = time.perf_counter()
            response = await asyncio.wait_for(ws.recv(), timeout=30.0)
            recv_ms = (time.perf_counter() - recv_start) * 1000
            print(f"📥 Response received in {recv_ms:.2f} ms")

            total_ms = (time.perf_counter() - start) * 1000
            print(f"\n✅ Full WebSocket Round-Trip: {total_ms:.2f} ms")
            print(f"   Response: {response[:200]}...")

    except ImportError as e:
        print(f"⚠️  websockets not available: {e}")
    except asyncio.TimeoutError:
        print("❌ WebSocket response timeout")
    except Exception as e:
        print(f"❌ WebSocket Error: {e}")


async def main() -> None:
    await test_health_endpoint()
    await test_websocket_handshake()
    print(f"\n{'='*60}")
    print("HANDSHAKE TEST COMPLETE")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    asyncio.run(main())
