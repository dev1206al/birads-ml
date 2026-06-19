/* ============================================================================
   InputPanel.jsx — Panel izquierdo de entrada y selección de modo
   ============================================================================ */

function InputPanel({
  T, lang, text, setText, loading, error,
  canAnalyze, demoMode,
  mode, onModeChange,
  binaryOption, onBinaryOptionChange,
  modelKey, onModelKeyChange,
  onAnalyze, onRunDemo, onLoadExample, onClear,
  isVertical, sidebarW,
}) {
  const handleKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') onAnalyze();
  };

  // ── Pill de modo ──────────────────────────────────────────────────
  const ModeTab = ({ id, labelEs, labelEn }) => {
    const active = mode === id;
    return (
      <button
        onClick={() => onModeChange(id)}
        style={{
          flex: 1, padding: '7px 10px', borderRadius: 7,
          border: 'none', fontWeight: active ? 700 : 500,
          fontSize: 13.5, cursor: 'pointer', letterSpacing: 0.1,
          background: active
            ? (T.dark ? 'rgba(8,145,178,0.18)' : 'rgba(26,58,110,0.07)')
            : 'transparent',
          color: active ? (T.dark ? '#38bdf8' : '#1A3A6E') : T.textMuted,
          boxShadow: active ? `inset 0 0 0 1px ${T.dark ? 'rgba(8,145,178,0.4)' : 'rgba(26,58,110,0.25)'}` : 'none',
          transition: 'all 0.15s',
        }}
      >
        {lang === 'es' ? labelEs : labelEn}
      </button>
    );
  };

  // ── Pill de opción binaria ────────────────────────────────────────
  const OptionPill = ({ id, labelEs, labelEn }) => {
    const active = binaryOption === id;
    const accent = active ? '#0891b2' : T.textMuted;
    return (
      <button
        onClick={() => onBinaryOptionChange(id)}
        style={{
          flex: 1, padding: '6px 8px', borderRadius: 7,
          border: `1px solid ${active ? 'rgba(8,145,178,0.4)' : T.border}`,
          fontWeight: active ? 700 : 500, fontSize: 11.5,
          cursor: 'pointer', letterSpacing: 0.1,
          background: active
            ? (T.dark ? 'rgba(8,145,178,0.15)' : 'rgba(8,145,178,0.07)')
            : 'transparent',
          color: accent, transition: 'all 0.15s', textAlign: 'center',
        }}
      >
        {lang === 'es' ? labelEs : labelEn}
      </button>
    );
  };

  return (
    <div style={{
      width: isVertical ? '100%' : sidebarW,
      flexShrink: 0,
      borderRight:  isVertical ? 'none'                     : `1px solid ${T.panelBorder}`,
      borderBottom: isVertical ? `1px solid ${T.panelBorder}` : 'none',
      display: 'flex', flexDirection: 'column',
      padding: isVertical ? '16px 16px 14px' : '22px 26px 20px',
      background: T.panel, transition: 'background 0.3s, border-color 0.3s',
      boxShadow: isVertical ? 'none' : (T.dark ? 'none' : '2px 0 8px rgba(0,0,0,0.03)'),
      fontFamily: T.fontUI,
    }}>

      {/* ─── Cabecera ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: T.text,
          letterSpacing: -0.5, marginBottom: 4 }}>
          {lang === 'es' ? 'Análisis BI-RADS' : 'BI-RADS Analysis'}
        </h1>
        <p style={{ fontSize: 13.5, color: T.textSub, lineHeight: 1.5 }}>
          {lang === 'es'
            ? 'Ingrese las observaciones del reporte de mamografía.'
            : 'Enter the Observations from the mammography report.'}
        </p>
      </div>

      {/* ─── Selector de modo ────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 3, marginBottom: 10,
        background: T.dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        borderRadius: 9, padding: 3,
        border: `1px solid ${T.border}`,
      }}>
        <ModeTab id="binary" labelEs="Clasificación binaria"  labelEn="Binary classification" />
        <ModeTab id="proba"  labelEs="Distribución BI-RADS"   labelEn="BI-RADS distribution" />
      </div>

      {/* ─── Sub-opciones modo binario ───────────────────────────────── */}
      {mode === 'binary' && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textFaint,
            textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
            {lang === 'es' ? 'División' : 'Split'}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <OptionPill
              id="B"
              labelEs="BR1-2 vs BR3-4-5"
              labelEn="BR1-2 vs BR3-4-5"
            />
            <OptionPill
              id="A"
              labelEs="BR1-2-3 vs BR4-5"
              labelEn="BR1-2-3 vs BR4-5"
            />
          </div>
          <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 5, lineHeight: 1.5 }}>
            {binaryOption === 'B'
              ? (lang === 'es'
                  ? 'Sin hallazgos (BR1-2) vs Con hallazgos (BR3-4-5) · Modelo: LinearSVC'
                  : 'No findings (BR1-2) vs Findings (BR3-4-5) · Model: LinearSVC')
              : (lang === 'es'
                  ? 'Benigno (BR1-2-3) vs Sospechoso (BR4-5) · Modelo: LinearSVC'
                  : 'Benign (BR1-2-3) vs Suspicious (BR4-5) · Model: LinearSVC')
            }
          </div>
        </div>
      )}

      {/* ─── Selector de modelo (modo probabilidades) ───────────────── */}
      {mode === 'proba' && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textFaint,
            textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
            {lang === 'es' ? 'Modelo' : 'Model'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              { key: 'mlp_1-2gramas',      labelEs: 'MLP · 1-2gramas',         badge: 'F1 66.7%', rec: true  },
              { key: 'lsvc_raw_1-2gramas', labelEs: 'LinearSVC · scores',       badge: 'F1 79.4% ★', rec: false },
            ].map(({ key, labelEs, badge, rec }) => {
              const active = (modelKey || 'mlp_1-2gramas') === key;
              const isLsvc = key === 'lsvc_raw_1-2gramas';
              const accent = isLsvc ? '#1A3A6E' : '#0891B2';
              return (
                <button
                  key={key}
                  onClick={() => onModelKeyChange(key)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '6px 10px', borderRadius: 7,
                    border: `1px solid ${active ? accent + '55' : T.border}`,
                    background: active
                      ? (T.dark ? `${accent}18` : `${accent}0d`)
                      : 'transparent',
                    color: active ? accent : T.textSub,
                    fontSize: 11.5, fontWeight: active ? 700 : 500,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>{labelEs}{rec && <span style={{ marginLeft: 5, fontSize: 9.5, color: T.textFaint }}>{lang === 'es' ? '(rec.)' : '(rec.)'}</span>}</span>
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, padding: '1px 5px',
                    borderRadius: 4, marginLeft: 6, flexShrink: 0,
                    background: active ? `${accent}22` : (T.dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
                    color: active ? accent : T.textFaint,
                  }}>{badge}</span>
                </button>
              );
            })}
          </div>
          {(modelKey === 'lsvc_raw_1-2gramas') && (
            <div style={{ fontSize: 10, color: T.textFaint, marginTop: 5, lineHeight: 1.4 }}>
              {lang === 'es'
                ? 'Muestra scores del hiperplano. La rejilla de % queda oculta.'
                : 'Shows hyperplane scores. The % grid is hidden.'}
            </div>
          )}
        </div>
      )}

      {/* ─── Textarea ────────────────────────────────────────────────── */}
      <div style={{ flex: isVertical ? undefined : 1, display: 'flex', flexDirection: 'column' }}>
        <label style={{
          fontSize: 11, fontWeight: 700, color: T.labelColor,
          textTransform: 'uppercase', letterSpacing: 0.7,
          marginBottom: 7, display: 'block',
        }}>
          {lang === 'es' ? 'Observaciones radiológicas' : 'Radiological observations'}
        </label>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKey}
          placeholder={lang === 'es'
            ? 'Ingrese o pegue aquí el contenido del apartado Observaciones…'
            : 'Enter or paste the full Observations section here…'}
          style={{
            flex: isVertical ? undefined : 1,
            height: isVertical ? 140 : undefined,
            resize: 'none', width: '100%',
            background: T.inputBg, border: `1px solid ${T.border}`,
            borderRadius: 10, padding: '13px 15px',
            fontSize: 14.5, lineHeight: 1.65, color: T.text,
            minHeight: isVertical ? undefined : 160,
            transition: 'border-color 0.2s, box-shadow 0.2s, background 0.3s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = T.inputFocus;
            e.target.style.boxShadow = `0 0 0 3px ${T.inputGlow}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = T.border;
            e.target.style.boxShadow = 'none';
          }}
        />
        <div style={{ fontSize: 11, color: T.textFaint, marginTop: 5, textAlign: 'right' }}>
          {text.length > 0 && `${text.length} ${lang === 'es' ? 'caracteres' : 'chars'} · `}
          {lang === 'es' ? 'Ctrl+Enter para analizar' : 'Ctrl+Enter to analyze'}
        </div>
      </div>

      {/* ─── Botonera ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
        {/* Ejemplo */}
        <button
          onClick={onLoadExample}
          style={{
            padding: '9px 14px', borderRadius: 9,
            border: `1px solid ${T.border}`,
            background: T.dark ? 'rgba(255,255,255,0.04)' : T.cardHover,
            color: T.textSub, fontSize: 13, cursor: 'pointer', fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
            e.currentTarget.style.color = T.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = T.dark ? 'rgba(255,255,255,0.04)' : T.cardHover;
            e.currentTarget.style.color = T.textSub;
          }}
        >
          {lang === 'es' ? 'Ejemplo' : 'Example'}
        </button>

        {/* Limpiar */}
        {text && (
          <button
            onClick={onClear}
            style={{
              padding: '9px 11px', borderRadius: 9,
              border: `1px solid ${T.border}`, background: 'transparent',
              color: T.textMuted, fontSize: 14, cursor: 'pointer', transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
          >✕</button>
        )}

        {/* Analizar */}
        <button
          onClick={() => onAnalyze()}
          disabled={!canAnalyze}
          style={{
            flex: 1, padding: '9px 18px', borderRadius: 9,
            border: 'none', fontWeight: 700, fontSize: 14,
            cursor: canAnalyze ? 'pointer' : 'not-allowed', letterSpacing: 0.2,
            background: canAnalyze ? T.analyzeBtn : T.analyzeBtnDisabled,
            color: canAnalyze ? '#fff' : T.analyzeBtnDisabledText,
            boxShadow: canAnalyze ? T.analyzeBtnShadow : 'none',
            transition: 'all 0.2s', fontSize: 15,
          }}
          onMouseEnter={(e) => {
            if (canAnalyze) e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{
                width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: 7, display: 'inline-block',
                animation: 'spin 0.75s linear infinite',
              }} />
              {lang === 'es' ? 'Analizando…' : 'Analyzing…'}
            </span>
          ) : lang === 'es' ? 'Analizar' : 'Analyze'}
        </button>
      </div>

      {/* ─── Error ───────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          marginTop: 10, padding: '9px 13px', borderRadius: 8, fontSize: 13,
          background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
          color: '#dc2626',
        }}>{error}</div>
      )}

      {/* ─── Disclaimer ──────────────────────────────────────────────── */}
      <div style={{
        marginTop: 12, padding: '10px 13px', borderRadius: 9,
        background: T.disclaimerBg, border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'flex-start', gap: 9,
        transition: 'background 0.3s',
      }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
          style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="7.5" cy="7.5" r="6.5" stroke={T.textMuted} strokeWidth="1.2" />
          <line x1="7.5" y1="4.5" x2="7.5" y2="8.5" stroke={T.textMuted} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="7.5" cy="10.5" r="0.8" fill={T.textMuted} />
        </svg>
        <p style={{ fontSize: 12, color: T.disclaimerText, lineHeight: 1.5 }}>
          {lang === 'es'
            ? 'Sistema de apoyo a la decisión. El diagnóstico final debe ser emitido por un radiólogo certificado.'
            : 'Decision support system. Final diagnosis must be issued by a certified radiologist.'}
        </p>
      </div>
    </div>
  );
}

window.InputPanel = InputPanel;
