#!/usr/bin/env bash
set -euo pipefail

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8080}"
WORKERS="${UVICORN_WORKERS:-1}"

exec uvicorn gateway:app --host "${HOST}" --port "${PORT}" --workers "${WORKERS}"
