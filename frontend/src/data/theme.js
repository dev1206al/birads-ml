/* ============================================================================
   theme.js — Tokens de color y tipografía (dark / light)
   ----------------------------------------------------------------------------
   Paleta médica sobria:
     · Primario: #1A3A6E (azul médico)
     · Acento:   #0891B2 (cian clínico)
     · UI base:  escala slate (Tailwind)
   ============================================================================ */

window.makeTheme = function makeTheme(dark) {

  // ── Fuente base ────────────────────────────────────────────────────────────
  const fontUI   = "'Inter', 'DM Sans', sans-serif";
  const fontMono = "'IBM Plex Mono', 'DM Mono', monospace";

  // ── Tema oscuro ────────────────────────────────────────────────────────────
  if (dark) {
    return {
      dark: true, fontUI, fontMono,

      bg:          '#0b0f17',
      nav:         '#1A3A6E',
      navBorder:   '#152f5e',

      // Colores internos de la navbar (fondo #1A3A6E en ambos modos)
      navText:           '#FFFFFF',
      navTextSub:        'rgba(255,255,255,0.72)',
      navTabActiveTxt:   '#FFFFFF',
      navTabActiveBg:    'rgba(255,255,255,0.14)',
      navTabActiveBdr:   'rgba(255,255,255,0.30)',
      navTabHoverBg:     'rgba(255,255,255,0.08)',
      navTabInactiveTxt: 'rgba(255,255,255,0.62)',
      navBtnBg:          'rgba(255,255,255,0.10)',
      navBtnBgHov:       'rgba(255,255,255,0.18)',
      navBtnBdr:         'rgba(255,255,255,0.22)',
      navBtnTxt:         'rgba(255,255,255,0.82)',
      panel:       '#0d1320',
      panelBorder: 'rgba(255,255,255,0.07)',
      card:        '#161d2c',
      cardHover:   'rgba(255,255,255,0.04)',

      border:      'rgba(255,255,255,0.08)',
      borderHover: 'rgba(255,255,255,0.16)',

      text:        '#f1f5f9',
      textSub:     'rgba(255,255,255,0.52)',
      textMuted:   'rgba(255,255,255,0.32)',
      textFaint:   'rgba(255,255,255,0.16)',

      inputBg:     '#161d2c',
      inputFocus:  'rgba(8,145,178,0.55)',
      inputGlow:   'rgba(8,145,178,0.09)',
      labelColor:  'rgba(255,255,255,0.35)',

      disclaimerBg:   'rgba(255,255,255,0.02)',
      disclaimerText: 'rgba(255,255,255,0.25)',

      modalBg:   '#151e2d',
      modalText: '#94a3b8',

      emptyBg:      'rgba(255,255,255,0.03)',
      emptyBorder:  'rgba(255,255,255,0.06)',
      emptyText:    'rgba(255,255,255,0.42)',
      emptySubtext: 'rgba(255,255,255,0.22)',

      loadingText: 'rgba(255,255,255,0.26)',
      barTrack:    'rgba(255,255,255,0.08)',
      hintText:    'rgba(255,255,255,0.20)',
      tweaksBg:    '#151e2d',

      gridLabel: 'rgba(255,255,255,0.26)',
      gridHint:  'rgba(255,255,255,0.20)',

      bannerText: '#f1f5f9',
      bannerSub:  'rgba(255,255,255,0.32)',

      analyzeBtn:             'linear-gradient(135deg,#1a3a6e,#0891b2)',
      analyzeBtnShadow:       '0 4px 20px rgba(8,145,178,0.28)',
      analyzeBtnDisabled:     'rgba(255,255,255,0.07)',
      analyzeBtnDisabledText: 'rgba(255,255,255,0.25)',

      cardNumColor:   (isTop, catColor) => isTop ? catColor : 'rgba(255,255,255,0.82)',
      cardLabelColor: (isTop, catColor) => isTop ? catColor : 'rgba(255,255,255,0.45)',
      cardNameColor:  'rgba(255,255,255,0.45)',

      confidenceBg: 'rgba(255,255,255,0.04)',
      exportBtnBg:  'rgba(255,255,255,0.06)',
      exportBtnText:'rgba(255,255,255,0.5)',
    };
  }

  // ── Tema claro ─────────────────────────────────────────────────────────────
  return {
    dark: false, fontUI, fontMono,

    bg:          '#F6F8FB',
    nav:         '#1A3A6E',
    navBorder:   '#152f5e',

    // Colores internos de la navbar (fondo azul oscuro → texto claro)
    navText:           '#FFFFFF',
    navTextSub:        'rgba(255,255,255,0.72)',
    navTabActiveTxt:   '#FFFFFF',
    navTabActiveBg:    'rgba(255,255,255,0.14)',
    navTabActiveBdr:   'rgba(255,255,255,0.30)',
    navTabHoverBg:     'rgba(255,255,255,0.08)',
    navTabInactiveTxt: 'rgba(255,255,255,0.62)',
    navBtnBg:          'rgba(255,255,255,0.10)',
    navBtnBgHov:       'rgba(255,255,255,0.18)',
    navBtnBdr:         'rgba(255,255,255,0.22)',
    navBtnTxt:         'rgba(255,255,255,0.82)',
    panel:       '#FFFFFF',
    panelBorder: '#E2E8F0',
    card:        '#FFFFFF',
    cardHover:   '#F8FAFC',

    border:      '#E2E8F0',
    borderHover: '#CBD5E1',

    text:        '#0F172A',
    textSub:     '#475569',
    textMuted:   '#64748B',
    textFaint:   '#94A3B8',

    inputBg:     '#FFFFFF',
    inputFocus:  '#0891B2',
    inputGlow:   'rgba(8,145,178,0.08)',
    labelColor:  '#64748B',

    disclaimerBg:   '#F8FAFC',
    disclaimerText: '#94A3B8',

    modalBg:   '#FFFFFF',
    modalText: '#475569',

    emptyBg:      'rgba(0,0,0,0.025)',
    emptyBorder:  '#E2E8F0',
    emptyText:    '#475569',
    emptySubtext: '#94A3B8',

    loadingText: '#94A3B8',
    barTrack:    '#E2E8F0',
    hintText:    '#94A3B8',
    tweaksBg:    '#FFFFFF',

    gridLabel: '#94A3B8',
    gridHint:  '#94A3B8',

    bannerText: '#0F172A',
    bannerSub:  '#475569',

    analyzeBtn:             'linear-gradient(135deg,#1A3A6E,#0891B2)',
    analyzeBtnShadow:       '0 4px 20px rgba(8,145,178,0.22)',
    analyzeBtnDisabled:     '#E2E8F0',
    analyzeBtnDisabledText: '#94A3B8',

    cardNumColor:   (isTop, catColor) => isTop ? catColor : '#1E293B',
    cardLabelColor: (isTop, catColor) => isTop ? catColor : '#475569',
    cardNameColor:  '#64748B',

    confidenceBg: '#F8FAFC',
    exportBtnBg:  '#F1F5F9',
    exportBtnText:'#475569',
  };
};
