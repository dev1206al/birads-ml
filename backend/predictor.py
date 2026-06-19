"""
predictor.py — Motor de inferencia del Sistema ML de Apoyo BI-RADS
===================================================================

Preprocesa texto y carga modelos entrenados para realizar predicciones.
No requiere spaCy: incluye un preprocessor regex equivalente.

Rutas de modelos esperadas (relativas al repositorio):
  models/modelos_5clases/    → MLP, LinearSVC (distribución BI-RADS)
  models/modelos_binarios/   → LinearSVC binario (opción A y B)
  models/vectorizadores/     → TF-IDF vectorizadores por n-grama
"""

from __future__ import annotations

import pickle
import re
import unicodedata
from pathlib import Path
from typing import Optional

import numpy as np

# ---------------------------------------------------------------------------
# Ruta base de modelos (sobreescrita por app.py al instanciar Predictor)
# ---------------------------------------------------------------------------
_DEFAULT_MODELS_DIR = Path(__file__).parent.parent / "models"

# ---------------------------------------------------------------------------
# Modelos expuestos en la UI
# ---------------------------------------------------------------------------
PROBA_MODELS = {
    "mlp_1-2gramas":      {
        "file":    "MLP_1-2gramas.pkl",
        "label":   "MLP · 1-2gramas",
        "display": "grid",
    },
    "lsvc_raw_1-2gramas": {
        "file":    "LinearSVC_1-2gramas_raw.pkl",
        "label":   "LinearSVC · 1-2gramas (scores)",
        "display": "ranking",
    },
}

BINARY_MODELS = {
    # Opción A — BI-RADS 1,2,3 vs 4,5
    "optA_lsvc_1-2gramas": {
        "file":  "optA_LinearSVC_1-2gramas.pkl",
        "label": "LinearSVC · 1-2gramas",
    },
    # Opción B — BI-RADS 1,2 vs 3,4,5
    "optB_lsvc_1gramas": {
        "file":  "optB_LinearSVC_1gramas.pkl",
        "label": "LinearSVC · 1gramas",
    },
}

DEFAULT_PROBA_KEY = "mlp_1-2gramas"
DEFAULT_BINARY_A  = "optA_lsvc_1-2gramas"
DEFAULT_BINARY_B  = "optB_lsvc_1gramas"


# ---------------------------------------------------------------------------
# Preprocesamiento (regex — no requiere spaCy)
# ---------------------------------------------------------------------------
_HEADER_RE = re.compile(r"^MAMOGRAF[IÍ]A[^\r\n]*\r?\n", re.IGNORECASE)
_BIRADS_RE = re.compile(
    r"\b(?:categor[ií]a\s+)?bi[\s\-]?rads?\b(?:\s*[0-6])?", re.IGNORECASE
)


def _preprocess_regex(text: str) -> str:
    text = _HEADER_RE.sub("", text)
    text = _BIRADS_RE.sub(" ", text)
    text = text.lower()
    nfkd = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in nfkd if not unicodedata.combining(c))
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ---------------------------------------------------------------------------
# Clase principal
# ---------------------------------------------------------------------------

class Predictor:
    """Carga modelos y vectorizadores; expone predict_proba / predict_binary."""

    def __init__(self, models_dir: Path = _DEFAULT_MODELS_DIR) -> None:
        self.models = models_dir
        self._vectorizers: dict[str, object] = {}
        self._proba_cache: dict[str, object] = {}
        self._binary_cache: dict[str, object] = {}
        self._load_vectorizers()

    # ------------------------------------------------------------------
    # Carga
    # ------------------------------------------------------------------

    def _load_vectorizers(self) -> None:
        vec_dir = self.models / "vectorizadores"
        for p in vec_dir.glob("vectorizer-*.pkl"):
            ngram = p.stem.replace("vectorizer-", "")
            with open(p, "rb") as f:
                self._vectorizers[ngram] = pickle.load(f)
        print(f"[Predictor] Vectorizadores: {sorted(self._vectorizers.keys())}")

    def _load_proba_model(self, model_key: str) -> dict:
        if model_key not in self._proba_cache:
            info = PROBA_MODELS[model_key]
            path = self.models / "modelos_5clases" / info["file"]
            with open(path, "rb") as f:
                self._proba_cache[model_key] = pickle.load(f)
        return self._proba_cache[model_key]

    def _load_binary_model(self, model_key: str) -> dict:
        if model_key not in self._binary_cache:
            info = BINARY_MODELS[model_key]
            path = self.models / "modelos_binarios" / info["file"]
            with open(path, "rb") as f:
                self._binary_cache[model_key] = pickle.load(f)
        return self._binary_cache[model_key]

    # ------------------------------------------------------------------
    # Preprocesamiento
    # ------------------------------------------------------------------

    def preprocess(self, text: str) -> str:
        return _preprocess_regex(text)

    # ------------------------------------------------------------------
    # Inferencia — distribución de 5 categorías BI-RADS
    # ------------------------------------------------------------------

    def predict_proba(self, text: str, model_key: str = DEFAULT_PROBA_KEY) -> dict:
        if model_key not in PROBA_MODELS:
            model_key = DEFAULT_PROBA_KEY

        data    = self._load_proba_model(model_key)
        clf     = data["model"]
        ngram   = self._ngram_from_filename(PROBA_MODELS[model_key]["file"])
        vec     = self._vectorizers[ngram]
        display = PROBA_MODELS[model_key].get("display", "grid")

        cleaned = self.preprocess(text)
        X       = vec.transform([cleaned])

        if not hasattr(clf, "predict_proba") and hasattr(clf, "decision_function"):
            df_vals   = clf.decision_function(X)
            df_row    = df_vals[0] if df_vals.ndim == 2 else df_vals.ravel()
            classes   = [int(c) for c in clf.classes_]
            exp_v     = np.exp(df_row - df_row.max())
            proba_arr = exp_v / exp_v.sum()
            raw_scores: dict[str, float] | None = {
                str(cls): round(float(s), 2) for cls, s in zip(classes, df_row)
            }
        else:
            proba_arr  = clf.predict_proba(X)[0]
            classes    = [int(c) for c in clf.classes_]
            raw_scores = None
            if hasattr(clf, "decision_function"):
                try:
                    df_vals = clf.decision_function(X)
                    df_row  = df_vals[0] if df_vals.ndim == 2 else df_vals.ravel()
                    raw_scores = {
                        str(cls): round(float(s), 2)
                        for cls, s in zip(classes, df_row)
                    }
                except Exception:
                    pass

        prob_map: dict[int, float] = {0: 0.0}
        for cls, p in zip(classes, proba_arr):
            prob_map[cls] = float(p)

        pcts = {k: round(v * 100) for k, v in prob_map.items()}
        diff = 100 - sum(pcts.values())
        if diff != 0:
            max_k = max(pcts, key=lambda k: prob_map[k])
            pcts[max_k] += diff

        return {
            "probabilities": {str(k): pcts[k] for k in sorted(pcts)},
            "raw_scores":    raw_scores,
            "display":       display,
        }

    # ------------------------------------------------------------------
    # Inferencia — clasificación binaria
    # ------------------------------------------------------------------

    def predict_binary(self, text: str, option: str = "B",
                       model_key: Optional[str] = None) -> dict:
        if model_key is None:
            model_key = DEFAULT_BINARY_B if option == "B" else DEFAULT_BINARY_A
        if model_key not in BINARY_MODELS:
            model_key = DEFAULT_BINARY_B if option == "B" else DEFAULT_BINARY_A

        data  = self._load_binary_model(model_key)
        clf   = data["model"]
        ngram = self._ngram_from_filename(BINARY_MODELS[model_key]["file"])
        vec   = self._vectorizers[ngram]

        cleaned    = self.preprocess(text)
        X          = vec.transform([cleaned])
        pred       = int(clf.predict(X)[0])
        class_names = data.get("class_names", {0: "Negativo", 1: "Positivo"})
        class_name  = class_names.get(pred, str(pred))
        confidence  = self._confidence(clf, X)

        metrics = data.get("metrics", {})
        return {
            "prediction":  pred,
            "class_name":  class_name,
            "option":      option,
            "model_key":   model_key,
            "model_label": BINARY_MODELS[model_key]["label"],
            "confidence":  confidence,
            "recall":      round(metrics.get("recall", 0) * 100),
            "specificity": round(metrics.get("specificity", 0) * 100),
            "f1":          round(metrics.get("f1", 0) * 100),
        }

    # ------------------------------------------------------------------
    # Métricas (sin inferencia adicional)
    # ------------------------------------------------------------------

    def metrics_summary(self) -> dict:
        proba: dict[str, dict] = {}
        for key, info in PROBA_MODELS.items():
            try:
                data   = self._load_proba_model(key)
                m      = data.get("metrics", {})
                f1_raw = m.get("f1_macro") or m.get("f1") or 0
                proba[key] = {
                    "label":       info["label"],
                    "display":     info.get("display", "grid"),
                    "recommended": key == DEFAULT_PROBA_KEY,
                    "f1":          round(float(f1_raw) * 100, 1),
                    "recall":      round(float(m["recall"]) * 100, 1) if m.get("recall") else None,
                    "specificity": round(float(m["specificity"]) * 100, 1) if m.get("specificity") else None,
                    "accuracy":    round(float(m["accuracy"]) * 100, 1) if m.get("accuracy") else None,
                }
            except Exception:
                proba[key] = {
                    "label": info["label"], "display": info.get("display", "grid"),
                    "recommended": key == DEFAULT_PROBA_KEY,
                    "f1": None, "recall": None, "specificity": None, "accuracy": None,
                }

        binary: dict[str, dict] = {}
        for key, info in BINARY_MODELS.items():
            try:
                data = self._load_binary_model(key)
                m    = data.get("metrics", {})
                binary[key] = {
                    "label":       info["label"],
                    "option":      "A" if key.startswith("optA_") else "B",
                    "recommended": key in (DEFAULT_BINARY_A, DEFAULT_BINARY_B),
                    "f1":          round(float(m.get("f1", 0)) * 100, 1),
                    "recall":      round(float(m.get("recall", 0)) * 100, 1),
                    "specificity": round(float(m.get("specificity", 0)) * 100, 1),
                }
            except Exception:
                binary[key] = {
                    "label": info["label"],
                    "option": "A" if key.startswith("optA_") else "B",
                    "recommended": key in (DEFAULT_BINARY_A, DEFAULT_BINARY_B),
                    "f1": None, "recall": None, "specificity": None,
                }

        return {"proba": proba, "binary": binary}

    # ------------------------------------------------------------------
    # Catálogo para el frontend
    # ------------------------------------------------------------------

    def catalog(self) -> dict:
        return {
            "proba": {
                k: {
                    "label":       v["label"],
                    "recommended": k == DEFAULT_PROBA_KEY,
                    "display":     v.get("display", "grid"),
                }
                for k, v in PROBA_MODELS.items()
            },
            "binary_A": {
                k: {"label": v["label"], "recommended": k == DEFAULT_BINARY_A}
                for k, v in BINARY_MODELS.items() if k.startswith("optA_")
            },
            "binary_B": {
                k: {"label": v["label"], "recommended": k == DEFAULT_BINARY_B}
                for k, v in BINARY_MODELS.items() if k.startswith("optB_")
            },
            "defaults": {
                "proba": DEFAULT_PROBA_KEY,
                "A":     DEFAULT_BINARY_A,
                "B":     DEFAULT_BINARY_B,
            },
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _ngram_from_filename(fname: str) -> str:
        stem = fname.replace(".pkl", "")
        for ng in ("1-2-3gramas", "1-2gramas", "1gramas", "2gramas", "3gramas"):
            if ng in stem:
                return ng
        return "1-2gramas"

    @staticmethod
    def _confidence(clf, X) -> int:
        if hasattr(clf, "predict_proba"):
            return round(float(max(clf.predict_proba(X)[0])) * 100)
        if hasattr(clf, "decision_function"):
            score = float(clf.decision_function(X).ravel()[0])
            sig   = 1.0 / (1.0 + np.exp(-abs(score)))
            return round(sig * 100)
        return 0
