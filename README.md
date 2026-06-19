# Sistema ML de Apoyo BI-RADS

Sistema de apoyo a la clasificación de reportes de mamografía basado en modelos de aprendizaje automático. Procesa el texto del apartado *Observaciones* de un reporte radiológico y devuelve una clasificación BI-RADS estimada.

> **Aviso clínico:** Esta herramienta es un sistema de apoyo a la decisión. El diagnóstico final debe ser emitido por un médico radiólogo certificado. No reemplaza el juicio clínico del especialista.

---

## Modos de clasificación

| Modo | Descripción |
|------|-------------|
| **Distribución BI-RADS** | Probabilidad estimada para cada categoría (0–5) |
| **Clasificación binaria** | Opción A: BR1-2-3 vs BR4-5 · Opción B: BR1-2 vs BR3-4-5 |

---

## Estructura del proyecto

```
birads-ml/
├── backend/
│   ├── app.py           # Servidor Flask (API + frontend estático)
│   ├── predictor.py     # Motor de inferencia
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── src/             # Componentes React (sin build step)
│   └── assets/logos/
├── models/
│   ├── modelos_5clases/     # MLP, LinearSVC (distribución)
│   ├── modelos_binarios/    # LinearSVC opción A y B
│   └── vectorizadores/      # TF-IDF vectorizadores
└── README.md
```

---

## Requisitos

- Python 3.9+
- pip

---

## Instalación

```bash
# 1. Crear entorno virtual (recomendado)
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
.venv\Scripts\activate           # Windows

# 2. Instalar dependencias
pip install -r backend/requirements.txt
```

---

## Cómo correr

```bash
cd birads-ml/backend
python app.py
```

La app queda disponible en: **http://localhost:5000**

El servidor sirve el frontend automáticamente — no es necesario un servidor web separado.

### Puerto personalizado

```bash
PORT=8080 python app.py
```

### Modo producción (gunicorn)

```bash
gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

---

## Modelos incluidos

### Distribución BI-RADS (5 categorías)

| Modelo | Archivo | F1-macro |
|--------|---------|----------|
| MLP · 1-2gramas *(recomendado)* | `MLP_1-2gramas.pkl` | 66.7% |
| LinearSVC · scores | `LinearSVC_1-2gramas_raw.pkl` | 79.4% |

### Clasificación binaria

| Opción | Modelo | Archivo | Sensibilidad | Especificidad |
|--------|--------|---------|-------------|---------------|
| A (BR1-2-3 vs BR4-5) | LinearSVC · 1-2gramas | `optA_LinearSVC_1-2gramas.pkl` | 69% | 100% |
| B (BR1-2 vs BR3-4-5) | LinearSVC · 1gramas | `optB_LinearSVC_1gramas.pkl` | 84% | 97% |

### Vectorizadores

- `vectorizer-1-2gramas.pkl` — usado por modelos de distribución y opción A
- `vectorizer-1gramas.pkl` — usado por opción B

---

## Limitaciones

- Los modelos fueron entrenados con un corpus de reportes en español de un centro específico. El rendimiento puede variar en reportes de otras instituciones o redacciones distintas.
- El modo LinearSVC para distribución muestra *scores* de hiperplano, no probabilidades calibradas.
- El sistema no tiene acceso a imágenes; procesa únicamente texto del campo *Observaciones*.
- **No apto para diagnóstico clínico autónomo.**

---

## Clasificación asistida de reportes mamográficos

Desarrollado como herramienta de apoyo académico y clínico para la clasificación automática del sistema BI-RADS en reportes de mamografía en español.
