FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# system deps (keep minimal) and cleanup
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./

RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

# Railway provides PORT env var; default to 8080
ENV PORT=8080

EXPOSE 8080

# Start the Flask app via Gunicorn. Uses $PORT from environment.
CMD ["sh", "-c", "gunicorn -w 4 -b 0.0.0.0:${PORT} app:app"]
