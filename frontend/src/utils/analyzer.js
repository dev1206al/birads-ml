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
 * Valida que el texto parezca observaciones radiológicas mamográficas.
 * Primera línea de defensa (no hace round-trip al backend).
 *
 * @param {string} text — Texto a validar
 * @returns {{ valid: boolean, reason?: string }}
 */
window.validateRadiologicalText = function validateRadiologicalText(text) {
  const TERMS = new Set([
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
  ]);

  function normalize(s) {
    return s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (text.length < 80)  return { valid: false, reason: 'short' };

  const words = normalize(text).split(' ').filter(Boolean);

  if (words.length < 10) return { valid: false, reason: 'few_words' };

  const unique = new Set(words);
  if (unique.size < 6)   return { valid: false, reason: 'repetitive' };

  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  if (Math.max(...Object.values(freq)) / words.length > 0.5)
    return { valid: false, reason: 'repetitive' };

  if ([...unique].filter(w => TERMS.has(w)).length < 2)
    return { valid: false, reason: 'no_medical_terms' };

  return { valid: true };
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
