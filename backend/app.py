"""
app.py — Backend Flask del Sistema ML de Apoyo BI-RADS
=======================================================

Sirve el frontend estático y expone la API REST de predicción.

Endpoints:
  GET  /             → frontend/index.html
  GET  /api/catalog  → modelos disponibles
  POST /api/predict  → predicción (binaria o distribución de probabilidades)
  GET  /api/metrics  → métricas de los modelos activos

Arranque en desarrollo:
    cd birads-ml/backend
    python app.py

Arranque en producción:
    gunicorn -w 2 -b 0.0.0.0:8000 app:app
"""

from __future__ import annotations

import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from predictor import Predictor

# ---------------------------------------------------------------------------
# Rutas — relativas a este archivo, dentro del repositorio
# ---------------------------------------------------------------------------
BASE_DIR     = Path(__file__).parent                    # birads-ml/backend/
FRONTEND_DIR = BASE_DIR.parent / "frontend"             # birads-ml/frontend/
MODELS_DIR   = BASE_DIR.parent / "models"               # birads-ml/models/

# ---------------------------------------------------------------------------
# App Flask
# ---------------------------------------------------------------------------
app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})

predictor = Predictor(MODELS_DIR)


# ---------------------------------------------------------------------------
# Rutas estáticas
# ---------------------------------------------------------------------------

@app.route("/")
def serve_index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:path>")
def serve_static(path: str):
    full = FRONTEND_DIR / path
    if full.is_file():
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")


# ---------------------------------------------------------------------------
# API
# ---------------------------------------------------------------------------

@app.route("/api/catalog", methods=["GET"])
def catalog():
    return jsonify(predictor.catalog())


@app.route("/api/metrics", methods=["GET"])
def metrics():
    return jsonify(predictor.metrics_summary())


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Body JSON:
      {
        "text":      "<observaciones radiológicas>",
        "mode":      "proba" | "binary",
        "option":    "A" | "B",         (solo mode=binary)
        "model_key": "<clave-modelo>"   (opcional)
      }
    """
    body = request.get_json(force=True, silent=True) or {}

    text      = (body.get("text") or "").strip()
    mode      = body.get("mode", "proba")
    option    = body.get("option", "B")
    model_key = body.get("model_key") or None

    if not text:
        return jsonify({"error": "text requerido"}), 400

    try:
        if mode == "binary":
            result = predictor.predict_binary(text, option=option, model_key=model_key)
            return jsonify({"mode": "binary", **result})
        else:
            result = predictor.predict_proba(text, model_key=model_key or "mlp_1-2gramas")
            return jsonify({"mode": "proba", **result})

    except KeyError as e:
        return jsonify({"error": f"modelo no encontrado: {e}"}), 404
    except Exception as e:
        app.logger.exception("Error en /api/predict")
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Arranque
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port  = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    print(f"\n  Sistema ML de Apoyo BI-RADS")
    print(f"  http://localhost:{port}")
    print(f"  Frontend : {FRONTEND_DIR}")
    print(f"  Modelos  : {MODELS_DIR}\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
