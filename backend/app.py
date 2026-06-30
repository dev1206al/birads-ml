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

import mimetypes
import os
import re
import unicodedata
from collections import Counter
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

mimetypes.add_type("application/manifest+json", ".webmanifest")

from predictor import Predictor

# ---------------------------------------------------------------------------
# Validación de entrada — términos radiológicos mínimos requeridos
# ---------------------------------------------------------------------------
_MEDICAL_TERMS = frozenset({
    'mamografia', 'mama', 'mamario', 'mamaria', 'mamarias',
    'bilateral', 'craneal', 'craneo', 'caudal', 'oblicua',
    'tejido', 'fibroglandular', 'densidad',
    'nodulo', 'nodulos', 'masa', 'masas',
    'calcificacion', 'calcificaciones',
    'microcalcificacion', 'microcalcificaciones',
    'asimetria', 'distorsion', 'arquitectural',
    'ganglio', 'axila', 'piel', 'pezon',
    'lesion', 'lesiones', 'quiste', 'quistes',
    'benigno', 'benigna', 'sospechoso', 'sospechosa',
    'hallazgo', 'hallazgos', 'parenquima', 'glandular',
    'areola', 'espiculado', 'espiculada', 'maligno', 'maligna',
    'retraccion',
})


def _validate_text(text: str):
    """Devuelve (ok: bool, error: str | None)."""
    if len(text) < 80:
        return False, (
            "El texto es demasiado corto. "
            "Ingresa las observaciones completas del reporte mamográfico."
        )

    t = text.lower()
    t = unicodedata.normalize("NFKD", t)
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    words = t.split()

    if len(words) < 10:
        return False, (
            "El texto tiene muy pocas palabras. "
            "Ingresa las observaciones completas del reporte mamográfico."
        )

    unique = set(words)
    if len(unique) < 6:
        return False, (
            "El texto es repetitivo y no contiene vocabulario suficiente "
            "para generar una predicción confiable."
        )

    most_freq = Counter(words).most_common(1)[0][1]
    if most_freq / len(words) > 0.5:
        return False, (
            "El texto contiene repeticiones excesivas. "
            "Ingresa las observaciones reales del reporte mamográfico."
        )

    if sum(1 for w in unique if w in _MEDICAL_TERMS) < 2:
        return False, (
            "El texto no contiene suficiente vocabulario radiológico "
            "para generar una predicción confiable."
        )

    return True, None

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

    ok, err_msg = _validate_text(text)
    if not ok:
        return jsonify({"error": err_msg}), 400

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
