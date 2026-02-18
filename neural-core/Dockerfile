FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080

WORKDIR /workspace/neural-core

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    libsndfile1 \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./requirements.txt
RUN pip install --ignore-installed --use-deprecated=legacy-resolver -r requirements.txt

RUN git clone https://github.com/Rudrabha/Wav2Lip.git /opt/Wav2Lip

COPY gateway.py ./gateway.py
COPY voice_config.py ./voice_config.py
COPY constitution.md ./constitution.md
COPY assets ./assets
COPY reflection_engine.py ./reflection_engine.py
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 8080
CMD ["./start.sh"]
