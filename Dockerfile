FROM python:3.9-slim-bullseye AS builder
WORKDIR /app
COPY requirements.txt .
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && pip wheel --no-cache-dir --wheel-dir=/wheels -r requirements.txt && \
    apt-get purge -y --auto-remove gcc && \
    rm -rf /var/lib/apt/lists/* /wheels/*.whl

FROM python:3.9-slim-bullseye
WORKDIR /app
COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --find-links=/wheels -r requirements.txt && \
    find /usr/local -name '*.so' | xargs strip -s 2>/dev/null || true && \
    find /usr/local -name '*.c' -delete && \
    find /usr/local -name '*.pyc' -delete && \
    find /usr/local/lib/python3.9 -name __pycache__ -prune -exec rm -rf {} \; 2>/dev/null || true && \
    rm -rf /wheels

COPY main.py .
COPY download_model.py .
COPY static/ ./static/
COPY start.sh .
RUN chmod +x /app/start.sh && mkdir -p /app/models

EXPOSE 8000
CMD ["/app/start.sh"]
