import json
import os
import time
import uuid
from pathlib import Path
from typing import Any

import httpx

VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH", "/workspace/neural-core/data/chroma")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
MEMORY_VAULT_URL = os.getenv("MEMORY_VAULT_URL", "")
REFLECTION_TOP_K = int(os.getenv("REFLECTION_TOP_K", "5"))
REFLECTION_FOCUS = os.getenv(
    "REFLECTION_FOCUS",
    "Operational resilience, customer outcomes, humanitarian impact opportunities",
)


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
        with httpx.Client(timeout=20.0) as client:
            response = client.post("https://api.tavily.com/search", json=payload)
            response.raise_for_status()
            data = response.json()
            return {
                "ok": True,
                "summary": data.get("answer") or "Research complete",
                "results": data.get("results") or [],
            }
    except Exception as error:
        return {"ok": False, "summary": f"Research failed: {error}", "results": []}


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
            with httpx.Client(timeout=8.0) as client:
                client.post(
                    f"{MEMORY_VAULT_URL.rstrip('/')}/append",
                    json={
                        "id": item_id,
                        "document": entry,
                        "timestamp": int(time.time()),
                        "type": "reflection",
                    },
                )
        except Exception:
            pass


def run_once() -> dict[str, Any]:
    memory_docs = _read_documents(limit=REFLECTION_TOP_K)

    curiosity_query = (
        "current global opportunities in digital infrastructure, ethical AI services, "
        "and high-impact humanitarian programs suitable for corporate sponsorship"
    )
    research = web_research(curiosity_query)

    reflection_text = summarize_reflection(memory_docs, research.get("summary", "No research summary available."))
    persist_reflection(reflection_text)

    return {
        "ok": True,
        "memory_docs": len(memory_docs),
        "research_ok": bool(research.get("ok")),
        "summary": research.get("summary"),
    }


if __name__ == "__main__":
    result = run_once()
    print(json.dumps(result, ensure_ascii=False))
