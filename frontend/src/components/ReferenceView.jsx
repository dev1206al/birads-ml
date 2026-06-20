/* ============================================================================
   ReferenceView.jsx — Pestaña de referencia clínica BI-RADS (vista completa)
   ----------------------------------------------------------------------------
   Vista de página completa accesible desde la pestaña "Referencia" del navbar.
   Muestra las 6 categorías BI-RADS con:
     · Escala de riesgo visual (BR1–BR5)
     · Tarjetas expandibles con descripción clínica, hallazgos y manejo
     · Subcategorías para BI-RADS 4 (4A / 4B / 4C)
   ============================================================================ */

function ReferenceView({ lang, T }) {
  const [expandedCats, setExpandedCats] = React.useState(new Set());

  const toggleCat = (cat) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const B = window.BIRADS;
  const CATS = [0, 1, 2, 3, 4, 5, 6];
  const OUT_OF_SCOPE = new Set([0, 6]);

  // ── Escala de riesgo visual (solo categorías 1–5 en el gradiente) ──────────
  const RiskScale = () => {
    const scalePoints = [1, 2, 3, 4, 5];
    const positions = { 1: 2, 2: 12, 3: 30, 4: 62, 5: 97 };
    return (
      <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 14, padding: '20px 26px 18px', marginBottom: 28,
        boxShadow: T.dark ? 'none' : '0 1px 6px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted,
          textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14 }}>
          {lang === 'es' ? 'Espectro de riesgo de malignidad · BI-RADS 1–5' : 'Malignancy risk spectrum · BI-RADS 1–5'}
        </div>

        {/* Barra de gradiente */}
        <div style={{ position: 'relative', height: 10, borderRadius: 5,
          background: 'linear-gradient(to right,#16a34a,#65a30d 18%,#d97706 38%,#ea580c 68%,#dc2626)',
          marginBottom: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>

          {/* Marcadores de cada categoría */}
          {scalePoints.map((cat) => (
            <div key={cat} style={{
              position: 'absolute', top: -2,
              left: `${positions[cat]}%`,
              transform: 'translateX(-50%)',
              width: 14, height: 14, borderRadius: 7,
              background: B[cat].color,
              border: `2px solid ${T.card}`,
              boxShadow: `0 0 0 2px ${B[cat].color}55`,
            }} />
          ))}
        </div>

        {/* Etiquetas debajo */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {scalePoints.map((cat) => (
            <div key={cat} style={{ textAlign: 'center', width: '20%' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: B[cat].color }}>
                {B[cat].label}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>
                {lang === 'es' ? B[cat].risk_label_es : B[cat].risk_label_en}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Tarjeta individual ─────────────────────────────────────────────────────
  const RefCard = ({ cat }) => {
    const d = B[cat];
    if (!d) return null;
    const isExpanded = expandedCats.has(cat);
    const isOutOfScope = OUT_OF_SCOPE.has(cat);
    const subcats = lang === 'es' ? d.subcats_es : d.subcats_en;
    const isNa = d.risk_bar_pct === null;

    return (
      <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 14, overflow: 'hidden',
        boxShadow: T.dark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        opacity: isOutOfScope ? 0.88 : 1,
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${d.color}55`;
          e.currentTarget.style.boxShadow = `0 4px 20px ${d.glow}`;
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.boxShadow = T.dark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)';
          e.currentTarget.style.opacity = isOutOfScope ? '0.88' : '1';
        }}
      >
        {/* ── Encabezado de tarjeta ────────────────────────────────────── */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: `1px solid ${T.border}`,
          background: isOutOfScope
            ? (T.dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)')
            : `${d.color}08`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Número grande */}
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: `${d.color}18`, border: `1.5px solid ${d.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 22, fontWeight: 900, color: d.color,
                  fontFamily: 'DM Mono, monospace', letterSpacing: -1,
                }}>
                  {cat}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: -0.2 }}>
                  {d.label}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: d.color, marginTop: 2 }}>
                  {lang === 'es' ? d.es : d.en}
                </div>
              </div>
            </div>
            {/* Chip: fuera del modelo o riesgo */}
            {isOutOfScope ? (
              <div style={{
                flexShrink: 0, padding: '3px 9px', borderRadius: 20,
                background: 'rgba(100,116,139,0.1)',
                border: '1px solid rgba(100,116,139,0.28)',
                fontSize: 11, fontWeight: 700, color: '#64748b',
                letterSpacing: 0.2,
              }}>
                {lang === 'es' ? 'Fuera del modelo' : 'Outside model'}
              </div>
            ) : (
              <div style={{
                flexShrink: 0, padding: '3px 9px', borderRadius: 20,
                background: isNa
                  ? (T.dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')
                  : `${d.color}18`,
                border: `1px solid ${isNa ? T.border : d.color + '44'}`,
                fontSize: 11, fontWeight: 700,
                color: isNa ? T.textMuted : d.color,
                letterSpacing: 0.2,
              }}>
                {lang === 'es' ? d.risk_label_es : d.risk_label_en}
              </div>
            )}
          </div>

          {/* Barra de riesgo */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: T.textFaint, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              {lang === 'es' ? 'Riesgo de malignidad' : 'Malignancy risk'}
            </div>
            <div style={{
              height: 6, borderRadius: 3, overflow: 'hidden',
              background: T.barTrack,
            }}>
              {isNa ? (
                <div style={{
                  height: '100%', width: '100%',
                  background: `repeating-linear-gradient(45deg,${T.border},${T.border} 4px,transparent 4px,transparent 8px)`,
                }} />
              ) : (
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${d.risk_bar_pct}%`,
                  background: cat === 4
                    ? `linear-gradient(to right, ${d.color}88, ${d.color})`
                    : d.color,
                  transition: 'width 0.6s ease',
                }} />
              )}
            </div>
          </div>
        </div>

        {/* ── Cuerpo: descripción + manejo ────────────────────────────── */}
        <div style={{ padding: '14px 20px', flex: 1 }}>
          {/* Nota de alcance para categorías fuera del modelo */}
          {isOutOfScope && (d.scope_note_es || d.scope_note_en) && (
            <div style={{
              marginBottom: 12, padding: '8px 12px', borderRadius: 8,
              background: 'rgba(100,116,139,0.08)',
              border: '1px solid rgba(100,116,139,0.2)',
              fontSize: 12, color: T.textSub, lineHeight: 1.55,
              fontStyle: 'italic',
            }}>
              {lang === 'es' ? d.scope_note_es : d.scope_note_en}
            </div>
          )}
          <p style={{ fontSize: 12.5, color: T.textSub, lineHeight: 1.6, marginBottom: 14 }}>
            {lang === 'es' ? d.desc_es : d.desc_en}
          </p>

          {/* Chip de manejo */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 11px', borderRadius: 20,
            background: `${d.color}12`,
            border: `1px solid ${d.color}33`,
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke={d.color} strokeWidth="1.4" />
              <path d="M3 5l1.5 1.5L7 3.5" stroke={d.color} strokeWidth="1.3"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>
              {lang === 'es' ? d.management_es : d.management_en}
            </span>
          </div>
        </div>

        {/* ── Toggle: hallazgos típicos ────────────────────────────────── */}
        <button
          onClick={() => toggleCat(cat)}
          style={{
            width: '100%', padding: '10px 20px',
            borderTop: `1px solid ${T.border}`,
            background: 'transparent', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', color: T.textMuted, fontSize: 11.5,
            fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.dark
              ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
            e.currentTarget.style.color = d.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = T.textMuted;
          }}
        >
          <span>{lang === 'es' ? 'Hallazgos típicos' : 'Typical findings'}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s' }}>
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* ── Sección expandida ────────────────────────────────────────── */}
        {isExpanded && (
          <div style={{
            padding: '14px 20px 18px',
            borderTop: `1px solid ${T.border}`,
            background: T.dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
            animation: 'fadeIn 0.18s ease',
          }}>
            <p style={{ fontSize: 12, color: T.textSub, lineHeight: 1.65, marginBottom: subcats ? 14 : 0 }}>
              {lang === 'es' ? d.findings_es : d.findings_en}
            </p>

            {/* Subcategorías BI-RADS 4 */}
            {subcats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {subcats.map((sub) => (
                  <div key={sub.id} style={{
                    padding: '9px 12px', borderRadius: 9,
                    background: `${d.color}0d`,
                    border: `1px solid ${d.color}28`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 800, color: d.color,
                        background: `${d.color}20`, border: `1px solid ${d.color}44`,
                        padding: '1px 7px', borderRadius: 5,
                      }}>{sub.id}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.textSub }}>
                        {lang === 'es' ? 'Riesgo' : 'Risk'}: {sub.risk}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>
                      {sub.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      background: T.bg, padding: '28px 36px 48px',
    }}>
      {/* ── Encabezado de página ──────────────────────────────────────── */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5, marginBottom: 5 }}>
            {lang === 'es' ? 'Guía de Referencia BI-RADS' : 'BI-RADS Reference Guide'}
          </h2>
          <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5 }}>
            {lang === 'es'
              ? 'ACR Breast Imaging Reporting and Data System · 5ª Edición · Categorías 0–6 · El modelo predice BI-RADS 1–5'
              : 'ACR Breast Imaging Reporting and Data System · 5th Edition · Categories 0–6 · Model predicts BI-RADS 1–5'}
          </p>
        </div>
        <div style={{
          padding: '5px 12px', borderRadius: 20, flexShrink: 0,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
          fontSize: 11, fontWeight: 700, color: '#6366f1',
        }}>
          {lang === 'es' ? 'Solo referencia académica' : 'Academic reference only'}
        </div>
      </div>

      {/* ── Escala de riesgo ──────────────────────────────────────────── */}
      <RiskScale />

      {/* ── Sección 1: categorías del modelo (1–5) ───────────────────── */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ height: 1, flex: 1, background: T.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: 9.5,
            background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 700,
          }}>
            {lang === 'es' ? 'Cubierto por el modelo' : 'Covered by model'}
          </span>
          <span style={{ fontSize: 10.5, color: T.textFaint, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: 0.5 }}>
            BI-RADS 1–5
          </span>
        </div>
        <div style={{ height: 1, flex: 1, background: T.border }} />
      </div>

      <div className="ref-grid" style={{ marginBottom: 28 }}>
        {[1, 2, 3, 4, 5].map((cat) => <RefCard key={cat} cat={cat} />)}
      </div>

      {/* ── Sección 2: fuera del alcance del modelo (0 y 6) ──────────── */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ height: 1, flex: 1, background: T.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: 9.5,
            background: 'rgba(100,116,139,0.1)', color: '#64748b', fontWeight: 700,
          }}>
            {lang === 'es' ? 'Fuera del alcance del modelo' : 'Outside model scope'}
          </span>
          <span style={{ fontSize: 10.5, color: T.textFaint, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: 0.5 }}>
            BI-RADS 0 · 6
          </span>
        </div>
        <div style={{ height: 1, flex: 1, background: T.border }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {[0, 6].map((cat) => <RefCard key={cat} cat={cat} />)}
      </div>

      {/* ── Pie de página ─────────────────────────────────────────────── */}
      <div style={{
        marginTop: 36, padding: '16px 20px', borderRadius: 12,
        background: T.disclaimerBg, border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="7.5" cy="7.5" r="6.5" stroke={T.textMuted} strokeWidth="1.2" />
          <line x1="7.5" y1="4.5" x2="7.5" y2="8.5" stroke={T.textMuted} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="7.5" cy="10.5" r="0.8" fill={T.textMuted} />
        </svg>
        <div>
          <p style={{ fontSize: 11.5, color: T.disclaimerText, lineHeight: 1.6 }}>
            {lang === 'es'
              ? 'Esta guía es un material de referencia académica basado en el sistema ACR BI-RADS 5ª Edición. No reemplaza el criterio diagnóstico de un radiólogo certificado. El diagnóstico definitivo debe ser emitido por un especialista con acceso al estudio completo.'
              : 'This guide is academic reference material based on the ACR BI-RADS 5th Edition system. It does not replace the diagnostic judgment of a certified radiologist. The definitive diagnosis must be issued by a specialist with access to the complete study.'}
          </p>
          <p style={{ fontSize: 10.5, color: T.textFaint, marginTop: 6 }}>
            {lang === 'es' ? 'Fuente: ACR BI-RADS Atlas, 5ª Edición (2013). American College of Radiology.' : 'Source: ACR BI-RADS Atlas, 5th Edition (2013). American College of Radiology.'}
          </p>
        </div>
      </div>
    </div>
  );
}

window.ReferenceView = ReferenceView;
