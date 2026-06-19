/* ============================================================================
   birads.js — Datos del sistema BI-RADS
   ----------------------------------------------------------------------------
   Catálogo completo de categorías BI-RADS (0–5). Cada categoría incluye:
     · color / glow — tokens visuales
     · label / es / en — nomenclatura
     · short_xx — descripción de una línea (guía de referencia rápida)
     · desc_xx — descripción clínica completa (modal de info)
     · risk_label_xx — etiqueta de riesgo de malignidad
     · risk_bar_pct — valor visual de la barra de riesgo (0-100)
     · management_xx — recomendación clínica de manejo
     · findings_xx — hallazgos radiológicos típicos
     · subcats_xx — subcategorías (solo BI-RADS 4)
   ============================================================================ */

window.BIRADS = {
  0: {
    color: '#64748b',
    glow: 'rgba(100,116,139,0.22)',
    label: 'BI-RADS 0',
    es: 'Incompleto',
    en: 'Incomplete',
    short_es: 'Evaluación incompleta. Se requieren imágenes adicionales.',
    short_en: 'Incomplete assessment. Additional imaging needed.',
    desc_es:
      'Evaluación incompleta. Se requieren imágenes adicionales o comparación con estudios previos para establecer el diagnóstico definitivo.',
    desc_en:
      'Incomplete assessment. Additional imaging or prior study comparison is required to establish a definitive diagnosis.',
    risk_label_es: 'N/A',
    risk_label_en: 'N/A',
    risk_bar_pct: null,
    management_es: 'Completar estudio',
    management_en: 'Complete study',
    findings_es:
      'Imágenes insuficientes o técnicamente inadecuadas. Puede requerir proyecciones adicionales (compresión, magnificación), ecografía complementaria o comparación con mamografías previas para emitir un diagnóstico definitivo.',
    findings_en:
      'Insufficient or technically inadequate imaging. May require additional projections (compression, magnification), complementary ultrasound, or comparison with prior mammograms to issue a definitive diagnosis.',
  },

  1: {
    color: '#16a34a',
    glow: 'rgba(22,163,74,0.22)',
    label: 'BI-RADS 1',
    es: 'Negativo',
    en: 'Negative',
    short_es: 'Sin hallazgos. Seguimiento rutinario anual.',
    short_en: 'No findings. Routine annual follow-up.',
    desc_es:
      'Negativo. Sin hallazgos mamográficos. Las mamas son simétricas, sin masas, distorsión arquitectural ni calcificaciones sospechosas. Seguimiento rutinario anual.',
    desc_en:
      'Negative. No mammographic findings. Symmetric breasts without masses or suspicious calcifications. Routine annual follow-up.',
    risk_label_es: '~0%',
    risk_label_en: '~0%',
    risk_bar_pct: 1,
    management_es: 'Control anual',
    management_en: 'Annual follow-up',
    findings_es:
      'Mamas simétricas con arquitectura conservada, sin masas, distorsión arquitectural, asimetrías ni calcificaciones sospechosas. El tejido fibroglandular puede ser heterogéneo dentro de rangos normales.',
    findings_en:
      'Symmetric breasts with preserved architecture, without masses, architectural distortion, asymmetries, or suspicious calcifications. Fibroglandular tissue may be heterogeneous within normal ranges.',
  },

  2: {
    color: '#65a30d',
    glow: 'rgba(101,163,13,0.22)',
    label: 'BI-RADS 2',
    es: 'Benigno',
    en: 'Benign',
    short_es: 'Hallazgo definitivamente benigno. Sin malignidad.',
    short_en: 'Definitely benign finding. No malignancy.',
    desc_es:
      'Hallazgo definitivamente benigno. Sin evidencia de malignidad. Se puede describir el hallazgo para documentación. Seguimiento rutinario.',
    desc_en:
      'Definitely benign finding. No evidence of malignancy. Routine follow-up recommended.',
    risk_label_es: '~0%',
    risk_label_en: '~0%',
    risk_bar_pct: 1,
    management_es: 'Control anual',
    management_en: 'Annual follow-up',
    findings_es:
      'Puede incluir: ganglios linfáticos intramamarios, fibroadenomas calcificados, quistes simples, lipomas, hamartomas, calcificaciones vasculares o dérmicas, implantes mamarios. Todos los hallazgos presentan características definitivamente benignas.',
    findings_en:
      'May include: intramammary lymph nodes, calcified fibroadenomas, simple cysts, lipomas, hamartomas, vascular or dermal calcifications, breast implants. All findings have definitely benign characteristics.',
  },

  3: {
    color: '#d97706',
    glow: 'rgba(217,119,6,0.22)',
    label: 'BI-RADS 3',
    es: 'Prob. Benigno',
    en: 'Prob. Benign',
    short_es: 'Prob. benigno (<2% malignidad). Seguimiento 6 meses.',
    short_en: 'Prob. benign (<2% malignancy). 6-month follow-up.',
    desc_es:
      'Hallazgo probablemente benigno. Riesgo de malignidad <2%. Se recomienda seguimiento a corto plazo (6 meses) para demostrar estabilidad.',
    desc_en:
      'Probably benign finding. Malignancy risk <2%. Short-term follow-up (6 months) recommended to demonstrate stability.',
    risk_label_es: '<2%',
    risk_label_en: '<2%',
    risk_bar_pct: 10,
    management_es: 'Control a 6 meses',
    management_en: '6-month follow-up',
    findings_es:
      'Masa circunscrita no calcificada (probablemente quiste o fibroadenoma), asimetría focal sin masa asociada, grupo de microcalcificaciones puntiformes redondas o amorfas. No se recomienda biopsia de inicio; se documentan cambios en el seguimiento.',
    findings_en:
      'Non-calcified circumscribed mass (likely cyst or fibroadenoma), focal asymmetry without associated mass, cluster of round or amorphous punctate microcalcifications. Biopsy not initially recommended; changes documented at follow-up.',
  },

  4: {
    color: '#ea580c',
    glow: 'rgba(234,88,12,0.22)',
    label: 'BI-RADS 4',
    es: 'Sospechoso',
    en: 'Suspicious',
    short_es: 'Sospechoso (2–95% malignidad). Biopsia recomendada.',
    short_en: 'Suspicious (2–95% malignancy). Biopsy recommended.',
    desc_es:
      'Hallazgo sospechoso. Riesgo de malignidad 2–95%. Se recomienda biopsia tisular. Subclasificación: 4A (baja), 4B (moderada), 4C (alta sospecha).',
    desc_en:
      'Suspicious finding. Malignancy risk 2–95%. Tissue biopsy recommended. Subclassification: 4A (low), 4B (moderate), 4C (high).',
    risk_label_es: '2–95%',
    risk_label_en: '2–95%',
    risk_bar_pct: 52,
    management_es: 'Biopsia recomendada',
    management_en: 'Biopsy recommended',
    findings_es:
      'Masa con márgenes parcialmente definidos o microlobulados, asimetría con márgenes irregulares, calcificaciones pleomórficas agrupadas o lineales. La subcategoría determina el nivel de urgencia.',
    findings_en:
      'Mass with partially defined or microlobulated margins, asymmetry with irregular margins, grouped pleomorphic or linear calcifications. The subcategory determines the urgency level.',
    subcats_es: [
      { id: '4A', risk: '2–10%',  desc: 'Sospecha baja. Biopsia con aguja gruesa (BAG) o aspiración de contenido quístico. Seguimiento post-biopsia estándar.' },
      { id: '4B', risk: '10–50%', desc: 'Sospecha intermedia. Correlación radiológico-patológica obligatoria tras la biopsia.' },
      { id: '4C', risk: '50–95%', desc: 'Sospecha moderada-alta. Hallazgos preocupantes que no son clásicamente malignos pero requieren manejo agresivo.' },
    ],
    subcats_en: [
      { id: '4A', risk: '2–10%',  desc: 'Low suspicion. Core needle biopsy (CNB) or cyst aspiration. Standard post-biopsy follow-up.' },
      { id: '4B', risk: '10–50%', desc: 'Moderate suspicion. Mandatory radiological-pathological correlation after biopsy.' },
      { id: '4C', risk: '50–95%', desc: 'Moderate-high suspicion. Concerning findings that are not classically malignant but require aggressive management.' },
    ],
  },

  5: {
    color: '#dc2626',
    glow: 'rgba(220,38,38,0.28)',
    label: 'BI-RADS 5',
    es: 'Alt. Maligno',
    en: 'Highly Suspicious',
    short_es: 'Alt. sugestivo de malignidad (>95%). Biopsia inmediata.',
    short_en: 'Highly suggestive of malignancy (>95%). Immediate biopsy.',
    desc_es:
      'Hallazgo altamente sugestivo de malignidad. Riesgo >95%. Biopsia inmediata y acción clínica apropiada requeridas.',
    desc_en:
      'Highly suggestive of malignancy. Risk >95%. Immediate biopsy and appropriate clinical action required.',
    risk_label_es: '>95%',
    risk_label_en: '>95%',
    risk_bar_pct: 97,
    management_es: 'Biopsia inmediata',
    management_en: 'Immediate biopsy',
    findings_es:
      'Masa espiculada de alta densidad, calcificaciones pleomórficas lineales o ramificadas agrupadas, distorsión arquitectural con centro denso, engrosamiento cutáneo focal, retracción del pezón, adenopatías axilares sospechosas. Hallazgos altamente sugestivos de carcinoma infiltrante.',
    findings_en:
      'High-density spiculated mass, grouped linear or branching pleomorphic calcifications, architectural distortion with dense center, focal skin thickening, nipple retraction, suspicious axillary lymph nodes. Findings highly suggestive of infiltrating carcinoma.',
  },
};

// Texto de ejemplo que usamos cuando el usuario pulsa el botón "Ejemplo".
window.SAMPLE_OBS = `Mama derecha: Se identifica nódulo de morfología irregular, bordes espiculados, densidad incrementada, de aproximadamente 14mm en cuadrante superior externo (CSE), a 3cm del pezón. Asociado a microcalcificaciones pleomórficas agrupadas en región retroareolar. Retracción cutánea focal y engrosamiento dérmico ipsilateral. Distorsión arquitectural adyacente al nódulo.

Mama izquierda: Sin hallazgos significativos. Arquitectura conservada. Sin adenopatías axilares evidentes.`;
