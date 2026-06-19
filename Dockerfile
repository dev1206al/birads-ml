# ── Stage 1: dependencias ────────────────────────────────────────────────────
FROM python:3.11-slim AS deps

WORKDIR /app

# Instalar dependencias primero (capa cacheada; solo se re-ejecuta si cambia requirements.txt)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 2: imagen final ─────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Copiar paquetes instalados desde stage anterior
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin/gunicorn /usr/local/bin/gunicorn

# Copiar código fuente y modelos
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY models/   ./models/

# Puerto que expone Gunicorn
EXPOSE 8001

# Arrancar con Gunicorn desde la carpeta backend
# -w 2  → 2 workers (adecuado para i7-11390H con 16GB)
# --timeout 120 → tiempo extra para carga de modelos .pkl al arrancar
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:8001", "--timeout", "120", "--chdir", "/app/backend", "app:app"]
