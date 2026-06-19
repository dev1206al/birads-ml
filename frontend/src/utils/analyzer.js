/* ============================================================================
   analyzer.js — Lógica de análisis BI-RADS
   ----------------------------------------------------------------------------
   Llama al backend Flask (/api/predict) para obtener las predicciones
   de los modelos ML entrenados.

   Dos modos:
     'proba'  → distribución de probabilidades para BI-RADS 0-5
     'binary' → clasificación binaria (opción A o B)

   Si el backend no está disponible (desarrollo sin Flask) devuelve datos
   mock para poder revisar la UI igual.
   ============================================================================ */

// Resultados mock para modo sin backend
const MOCK_PROBA = {
  probabilities: { '0': 0, '1': 2, '2': 5, '3': 8, '4': 18, '5': 67 },
  rawScores: null,
  display: 'grid',
};
const MOCK_PROBA_LSVC = {
  probabilities: { '0': 0, '1': 18, '2': 42, '3': 11, '4': 14, '5': 15 },
  rawScores: { '1': -0.67, '2': 0.14, '3': -1.20, '4': -0.93, '5': -0.85 },
  display: 'ranking',
};
const MOCK_BINARY  = {
  A: { prediction: 1, class_name: 'Sospechoso (BR4-5)',    confidence: 81, option: 'A', recall: 69, specificity: 100, f1: 72, demo: true },
  B: { prediction: 1, class_name: 'Con hallazgos (BR3-5)', confidence: 76, option: 'B', recall: 84, specificity: 97,  f1: 70, demo: true },
};

/**
 * Llama al backend Flask y devuelve el resultado según el modo.
 *
 * @param {string} text       — Texto de observaciones radiológicas
 * @param {string} mode       — 'proba' | 'binary'
 * @param {string} option     — 'A' | 'B' (solo para binary)
 * @param {string} modelKey   — clave del modelo (undefined = recomendado)
 * @returns {Promise<object>}
 */
window.analyzeText = async function analyzeText(text, mode = 'proba', option = 'B', modelKey = undefined) {
  try {
    const base = window.API_BASE || '';
    const resp = await fetch(`${base}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode, option, model_key: modelKey || null }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${resp.status}`);
    }

    const data = await resp.json();

    if (mode === 'binary') return data;
    // { probabilities: {...}, raw_scores: {...}|null, display: 'grid'|'ranking' }
    return {
      probabilities: data.probabilities,
      rawScores:     data.raw_scores || null,
      display:       data.display    || 'grid',
    };

  } catch (e) {
    // Backend no disponible — modo demo
    console.warn('[analyzer] Backend no disponible, usando demo:', e.message);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
    if (mode === 'binary') return { ...MOCK_BINARY[option] };
    // Usar mock con scores si el modelo seleccionado es LinearSVC raw
    if (modelKey === 'lsvc_raw_1-2gramas') return { ...MOCK_PROBA_LSVC };
    return { ...MOCK_PROBA };
  }
};

/**
 * Nivel de confianza ML basado en la probabilidad top.
 * Solo se usa en modo 'proba'.
 */
window.getConfidence = function getConfidence(results, topCat) {
  const top = results[topCat];
  if (top >= 65) return { level: 'alta',  labelEs: 'Alta',  labelEn: 'High',   color: '#16a34a', pct: top };
  if (top >= 40) return { level: 'media', labelEs: 'Media', labelEn: 'Medium', color: '#d97706', pct: top };
  return              { level: 'baja',  labelEs: 'Baja',  labelEn: 'Low',    color: '#ea580c', pct: top };
};
