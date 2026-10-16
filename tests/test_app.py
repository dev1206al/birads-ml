"""Pruebas de integración básicas para la API de BI-RADS-ML."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app import app  # noqa: E402
from predictor import _preprocess_regex  # noqa: E402


VALID_REPORT = (
    "Mamografía bilateral con tejido fibroglandular. Se observa un nódulo "
    "circunscrito en la mama derecha, sin calcificaciones sospechosas ni "
    "distorsión arquitectural. Las axilas no muestran ganglios anormales y "
    "la piel no presenta retracción."
)


class PreprocessingTests(unittest.TestCase):
    def test_removes_explicit_birads_label_and_normalizes_accents(self):
        cleaned = _preprocess_regex(
            "MAMOGRAFÍA BILATERAL\nCategoría BI-RADS 4: Nódulo mamario."
        )

        self.assertNotIn("bi rads", cleaned)
        self.assertNotIn("birads", cleaned)
        self.assertEqual(cleaned, "nodulo mamario")


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config.update(TESTING=True)
        cls.client = app.test_client()

    def test_serves_frontend(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Sistema ML de Apoyo BI-RADS", response.data)
        response.close()

    def test_exposes_model_catalog(self):
        response = self.client.get("/api/catalog")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            set(response.get_json()),
            {"proba", "binary_A", "binary_B", "defaults"},
        )

    def test_exposes_model_metrics(self):
        response = self.client.get("/api/metrics")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(response.get_json()), {"proba", "binary"})

    def test_rejects_missing_text(self):
        response = self.client.post("/api/predict", json={})

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())

    def test_rejects_short_text(self):
        response = self.client.post("/api/predict", json={"text": "Nódulo mamario"})

        self.assertEqual(response.status_code, 400)
        self.assertIn("demasiado corto", response.get_json()["error"])

    def test_returns_five_class_distribution(self):
        response = self.client.post(
            "/api/predict",
            json={"text": VALID_REPORT, "mode": "proba"},
        )
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["mode"], "proba")
        self.assertEqual(set(payload["probabilities"]), {"1", "2", "3", "4", "5"})
        self.assertEqual(sum(payload["probabilities"].values()), 100)

    def test_returns_binary_classification(self):
        response = self.client.post(
            "/api/predict",
            json={"text": VALID_REPORT, "mode": "binary", "option": "B"},
        )
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["mode"], "binary")
        self.assertEqual(payload["option"], "B")
        self.assertIn(payload["prediction"], (0, 1))
        self.assertGreaterEqual(payload["confidence"], 0)
        self.assertLessEqual(payload["confidence"], 100)


if __name__ == "__main__":
    unittest.main()
