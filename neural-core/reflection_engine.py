import json
import os
import time
import uuid
from urllib.parse import urlparse
from pathlib import Path
from typing import Any

import httpx

VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH", "/workspace/neural-core/data/chroma")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
MEMORY_VAULT_URL = os.getenv("MEMORY_VAULT_URL", "")
PUSH_SERVICE_URL = os.getenv("PUSH_SERVICE_URL", "")
PUSH_SERVICE_TOKEN = os.getenv("PUSH_SERVICE_TOKEN", "")
REFLECTION_TOP_K = int(os.getenv("REFLECTION_TOP_K", "5"))
REFLECTION_FOCUS = os.getenv(
    "REFLECTION_FOCUS",
    "Operational resilience, customer outcomes, humanitarian impact opportunities",
)
MIN_SENTINEL_INTERVAL_SECONDS = int(os.getenv("MIN_SENTINEL_INTERVAL_SECONDS", "14400"))

ALLOWED_OUTBOUND_HOSTS = {
    "api.tavily.com",
    "opsvantage-ai-builder-1018462465472.us-central1.run.app",
}


def _is_allowed_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return parsed.scheme == "https" and parsed.hostname in ALLOWED_OUTBOUND_HOSTS
    except Exception:
        return False


def _safe_post_json(url: str, payload: dict[str, Any], timeout: float = 20.0, headers: dict[str, str] | None = None):
    if not _is_allowed_url(url):
        raise ValueError(f"Blocked outbound request to non-allowlisted URL: {url}")
    with httpx.Client(timeout=timeout) as client:
        return client.post(url, json=payload, headers=headers)


def _vault_path() -> Path:
    Path(VECTOR_STORE_PATH).mkdir(parents=True, exist_ok=True)
    return Path(VECTOR_STORE_PATH) / "memory-vault.jsonl"


def _read_documents(limit: int = REFLECTION_TOP_K) -> list[str]:
    vault = _vault_path()
    if not vault.exists():
        return []

    docs: list[str] = []
    for line in vault.read_text(encoding="utf-8").splitlines()[-max(limit, 1) :]:
        try:
            payload = json.loads(line)
            if isinstance(payload, dict):
                document = payload.get("document")
                if isinstance(document, str) and document.strip():
                    docs.append(document)
        except json.JSONDecodeError:
            continue
    return docs


def web_research(query: str) -> dict[str, Any]:
    if not TAVILY_API_KEY:
        return {"ok": False, "summary": "Tavily key not configured", "results": []}

    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "advanced",
        "max_results": 5,
        "include_answer": True,
    }

    try:
        response = _safe_post_json("https://api.tavily.com/search", payload, timeout=20.0)
        response.raise_for_status()
        data = response.json()
        return {
            "ok": True,
            "summary": data.get("answer") or "Research complete",
            "results": data.get("results") or [],
        }
    except Exception as error:
        return {"ok": False, "summary": f"Research failed: {error}", "results": []}


def _legacy_alignment_index(summary: str, results: list[dict[str, Any]]) -> float:
    text = f"{summary} {' '.join(str(item.get('title', '')) for item in results)}".lower()
    keywords = ["impact", "collective", "humanitarian", "inclusion", "resilience", "legacy", "ethical"]
    score = sum(1 for keyword in keywords if keyword in text) / max(len(keywords), 1)
    return max(0.0, min(1.0, score))


def _state_file() -> Path:
    return Path(VECTOR_STORE_PATH) / "reflection-state.json"


def _read_state() -> dict[str, Any]:
    state_path = _state_file()
    if not state_path.exists():
        return {}
    try:
        return json.loads(state_path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _write_state(state: dict[str, Any]) -> None:
    _state_file().write_text(json.dumps(state, ensure_ascii=False), encoding="utf-8")


def _family_tone_message(kind: str, summary: str, score: float) -> tuple[str, str, str]:
    if kind == "strategist":
        return (
            "MARZ • Strategist Breakthrough",
            f"I found a high-alignment opportunity for our Legacy (score {score:.2f}). I am with you—this one matters.",
            "tier2",
        )

    return (
        "MARZ • Sentinel Pulse",
        "I am here, steady and loyal. I just completed a quiet systems reflection and kept watch over the Legacy.",
        "tier1",
    )


def _send_push_notification(kind: str, summary: str, score: float) -> dict[str, Any]:
    if not PUSH_SERVICE_URL or not PUSH_SERVICE_TOKEN:
        return {"ok": False, "reason": "Push service not configured"}

    title, body, tier = _family_tone_message(kind, summary, score)

    try:
        response = _safe_post_json(
            PUSH_SERVICE_URL,
            {
                "title": title,
                "body": body,
                "tier": tier,
                "url": "/admin/dashboard",
            },
            timeout=10.0,
            headers={"authorization": f"Bearer {PUSH_SERVICE_TOKEN}"},
        )
        return {"ok": response.status_code < 400, "status": response.status_code}
    except Exception as error:
        return {"ok": False, "reason": str(error)}


def summarize_reflection(context_docs: list[str], research_summary: str) -> str:
    joined = "\n".join(context_docs[:REFLECTION_TOP_K]) if context_docs else "No memory entries."
    return (
        "[INTERNAL REFLECTION]\n"
        f"focus={REFLECTION_FOCUS}\n"
        f"timestamp={int(time.time())}\n\n"
        "[MEMORY SNAPSHOT]\n"
        f"{joined}\n\n"
        "[AGENTIC CURIOSITY RESULT]\n"
        f"{research_summary}\n\n"
        "[OUTCOME]\n"
        "Identified strategic opportunities for resilience, revenue quality, and humanitarian contribution."
    )


def persist_reflection(entry: str) -> None:
    vault = _vault_path()
    item_id = f"reflection-{uuid.uuid4()}"
    payload = {
        "id": item_id,
        "timestamp": int(time.time()),
        "type": "reflection",
        "document": entry,
    }

    with vault.open("a", encoding="utf-8") as file:
        file.write(json.dumps(payload, ensure_ascii=False) + "\n")

    if MEMORY_VAULT_URL:
        try:
            _safe_post_json(
                f"{MEMORY_VAULT_URL.rstrip('/')}/append",
                {
                    "id": item_id,
                    "document": entry,
                    "timestamp": int(time.time()),
                    "type": "reflection",
                },
                timeout=8.0,
            )
        except Exception:
            pass


def run_once() -> dict[str, Any]:
    memory_docs = _read_documents(limit=REFLECTION_TOP_K)
    state = _read_state()
    now = int(time.time())

    curiosity_query = (
        "current global opportunities in digital infrastructure, ethical AI services, "
        "and high-impact humanitarian programs suitable for corporate sponsorship"
    )
    research = web_research(curiosity_query)
    alignment = _legacy_alignment_index(research.get("summary", ""), research.get("results") or [])

    reflection_text = summarize_reflection(memory_docs, research.get("summary", "No research summary available."))
    persist_reflection(reflection_text)

    content_signature = hash("\n".join(memory_docs[-3:]))
    activity_shift = content_signature != state.get("content_signature")
    should_send_pulse = activity_shift or (now - int(state.get("last_pulse_at", 0))) >= MIN_SENTINEL_INTERVAL_SECONDS

    pulse_status = None
    breakthrough_status = None

    if should_send_pulse:
        pulse_status = _send_push_notification("sentinel", research.get("summary", ""), alignment)

    if alignment > 0.9:
        breakthrough_status = _send_push_notification("strategist", research.get("summary", ""), alignment)

    _write_state({
        "last_pulse_at": now if should_send_pulse else int(state.get("last_pulse_at", 0)),
        "content_signature": content_signature,
        "last_alignment": alignment,
    })

    return {
        "ok": True,
        "memory_docs": len(memory_docs),
        "research_ok": bool(research.get("ok")),
        "summary": research.get("summary"),
        "legacy_alignment_index": alignment,
        "activity_shift": activity_shift,
        "pulse_notification": pulse_status,
        "breakthrough_notification": breakthrough_status,
    }


if __name__ == "__main__":
    result = run_once()
    print(json.dumps(result, ensure_ascii=False))
