/* ============================================================================
   BiradsReference.jsx — Guía de referencia BI-RADS 0–6
   ----------------------------------------------------------------------------
   Estado vacío: guía educativa completa antes de que haya resultados.
   Dos secciones:
     · BI-RADS 1–5 → categorías del modelo predictivo (rejilla principal)
     · BI-RADS 0 y 6 → fuera del alcance del modelo (fila inferior)
   Cada card es un <button> accesible con chevron + CTA "Ver descripción".
   ============================================================================ */

/* SVG chevron compartido */
const ChevronDown = ({ color }) => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"
    style={{ flexShrink: 0, color: color }}>
    <path d="M2.5 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* SVG flecha derecha para el CTA */
const ArrowRight = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M1.5 5h7M6 2.5l2.5 2.5L6 7.5" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function BiradsReference({ lang, T, onInfo }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease' }}>

      {/* Título */}
      <div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: T.textMuted,
          textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4,
        }}>
          {lang === 'es' ? 'Guía de referencia BI-RADS' : 'BI-RADS Reference Guide'}
        </div>
        <div style={{ fontSize: 12.5, color: T.emptySubtext, marginBottom: 6 }}>
          {lang === 'es'
            ? 'Ingrese observaciones para iniciar el análisis. El modelo cubre BI-RADS 1–5.'
            : 'Enter observations to start the analysis. The model covers BI-RADS 1–5.'}
        </div>
      </div>

      {/* ── Sección 1: categorías del modelo (1–5) ── */}
      <div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: T.textFaint,
          textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            padding: '1px 8px', borderRadius: 4, fontSize: 9,
            background: 'rgba(99,102,241,0.12)', color: '#6366f1', fontWeight: 700,
          }}>
            {lang === 'es' ? 'Cubierto por el modelo' : 'Covered by the model'}
          </span>
          {lang === 'es' ? 'BI-RADS 1 – 5' : 'BI-RADS 1 – 5'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[1, 2, 3, 4, 5].map((cat) => {
            const d = window.BIRADS[cat];
            if (!d) return null;
            return (
              <button
                key={cat}
                className="birads-mini-btn"
                onClick={() => onInfo(cat)}
                aria-haspopup="dialog"
                aria-label={`${d.label} — ${lang === 'es' ? d.es : d.en}. ${lang === 'es' ? 'Ver descripción completa.' : 'View full description.'}`}
                style={{
                  appearance: 'none', WebkitAppearance: 'none',
                  textAlign: 'left', fontFamily: 'DM Sans, sans-serif',
                  width: '100%', display: 'block',
                  borderRadius: 10, padding: '14px 14px 12px', cursor: 'pointer',
                  background: T.emptyBg, border: `1px solid ${T.emptyBorder}`,
                  transition: 'all 0.18s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${d.color}10`;
                  e.currentTarget.style.borderColor = `${d.color}44`;
                  e.currentTarget.style.boxShadow = `0 4px 16px ${d.color}1a`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = T.emptyBg;
                  e.currentTarget.style.borderColor = T.emptyBorder;
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Fila: dot · label · chevron */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 5, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: T.emptyText, flex: 1 }}>{d.label}</span>
                  <ChevronDown color={T.textFaint} />
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: d.color, marginBottom: 5 }}>
                  {lang === 'es' ? d.es : d.en}
                </div>
                <div style={{ fontSize: 11, color: T.emptySubtext, lineHeight: 1.45, marginBottom: 9 }}>
                  {lang === 'es' ? d.short_es : d.short_en}
                </div>
                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: d.color }}>
                  <span>{lang === 'es' ? 'Ver descripción' : 'View details'}</span>
                  <ArrowRight />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sección 2: fuera del alcance (0 y 6) ── */}
      <div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: T.textFaint,
          textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            padding: '1px 8px', borderRadius: 4, fontSize: 9,
            background: 'rgba(100,116,139,0.12)', color: '#64748b', fontWeight: 700,
          }}>
            {lang === 'es' ? 'Fuera del alcance del modelo' : 'Outside model scope'}
          </span>
          {lang === 'es' ? 'BI-RADS 0 y 6' : 'BI-RADS 0 & 6'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {[0, 6].map((cat) => {
            const d = window.BIRADS[cat];
            if (!d) return null;
            const baseBg = T.dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
            return (
              <button
                key={cat}
                className="birads-mini-btn"
                onClick={() => onInfo(cat)}
                aria-haspopup="dialog"
                aria-label={`${d.label} — ${lang === 'es' ? d.es : d.en}. ${lang === 'es' ? 'Ver descripción completa.' : 'View full description.'}`}
                style={{
                  appearance: 'none', WebkitAppearance: 'none',
                  textAlign: 'left', fontFamily: 'DM Sans, sans-serif',
                  width: '100%', display: 'block',
                  borderRadius: 10, padding: '13px 14px 11px', cursor: 'pointer',
                  background: baseBg, border: `1px solid ${T.emptyBorder}`,
                  opacity: 0.85, transition: 'all 0.18s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${d.color}08`;
                  e.currentTarget.style.borderColor = `${d.color}33`;
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.boxShadow = `0 4px 16px ${d.color}14`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = baseBg;
                  e.currentTarget.style.borderColor = T.emptyBorder;
                  e.currentTarget.style.opacity = '0.85';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Fila: dot · label · badge excluido · chevron */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 4.5, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.textSub, flex: 1 }}>{d.label}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    padding: '1px 6px', borderRadius: 3,
                    background: 'rgba(100,116,139,0.1)', color: T.textFaint, flexShrink: 0,
                  }}>
                    {lang === 'es' ? 'Excluido' : 'Excluded'}
                  </span>
                  <ChevronDown color={T.textFaint} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: d.color, marginBottom: 4 }}>
                  {lang === 'es' ? d.es : d.en}
                </div>
                <div style={{ fontSize: 10.5, color: T.textFaint, lineHeight: 1.45, marginBottom: 9 }}>
                  {lang === 'es' ? d.scope_note_es : d.scope_note_en}
                </div>
                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: d.color, opacity: 0.8 }}>
                  <span>{lang === 'es' ? 'Ver descripción' : 'View details'}</span>
                  <ArrowRight />
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

window.BiradsReference = BiradsReference;
