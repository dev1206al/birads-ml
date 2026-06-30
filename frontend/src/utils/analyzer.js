/* ============================================================================
   analyzer.js — Lógica de análisis BI-RADS
   ----------------------------------------------------------------------------
   Llama al backend Flask (/api/predict) para obtener las predicciones
   de los modelos ML entrenados.

   Dos modos:
     'proba'  → distribución de probabilidades para BI-RADS 1-5
     'binary' → clasificación binaria (opción A o B)
   ============================================================================ */

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
  const base = window.API_BASE || '';
  let resp;

  try {
    resp = await fetch(`${base}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode, option, model_key: modelKey || null }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (e) {
    throw new Error('No se pudo conectar con el backend de predicción.');
  }

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
