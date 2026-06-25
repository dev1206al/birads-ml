/* ============================================================================
   ResultCard.jsx — Tarjeta individual de una categoría BI-RADS
   ----------------------------------------------------------------------------
   Renderizamos UNA tarjeta de la rejilla de resultados. Muestra:
     · Label de la categoría (BI-RADS 1..5)
     · Porcentaje grande y monoespaciado
     · Nombre clínico (Negativo / Benigno / etc.)
     · Barra de progreso animada
     · Badge "MAYOR PROB." si es la categoría top
     · CTA "Ver descripción →" siempre visible
   Al hacer clic, abre el modal de descripción clínica completa.
   ============================================================================ */

function ResultCard({ cat, pct, isTop, isTied, animated, lang, T, onInfo }) {
  const d = window.BIRADS[cat];

  const [hov, setHov] = React.useState(false);

  const highlighted = isTop || isTied;
  const numColor   = T.cardNumColor(highlighted, d.color);
  const labelColor = T.cardLabelColor(highlighted, d.color);

  return (
    <button
      className="birads-mini-btn"
      onClick={onInfo}
      aria-haspopup="dialog"
      aria-label={`${d.label} — ${lang === 'es' ? d.es : d.en} — ${pct}%. ${lang === 'es' ? 'Ver descripción completa.' : 'View full description.'}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        appearance: 'none', WebkitAppearance: 'none',
        textAlign: 'left', fontFamily: 'DM Sans, sans-serif',
        width: '100%', display: 'block',
        borderRadius: 12,
        padding: '18px 18px 14px',
        cursor: 'pointer',
        position: 'relative',
        background: highlighted ? `${d.color}13` : hov ? T.cardHover : T.card,
        border: `1px solid ${
          highlighted
            ? d.color + (isTied && !isTop ? '44' : '55')
            : hov ? T.borderHover : T.border
        }`,
        boxShadow: isTop
          ? `0 0 28px ${d.glow}`
          : isTied
          ? `0 0 14px ${d.glow}`
          : hov
          ? `0 4px 18px ${d.color}1a`
          : T.dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hov && !highlighted ? 'translateY(-1px)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Badge — top o empate */}
      {highlighted && (
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 7, height: 7, borderRadius: 3.5,
            background: d.color,
            boxShadow: `0 0 ${isTop ? 10 : 6}px ${d.color}`,
            animation: isTop ? 'pulse 2s ease infinite' : 'none',
          }} />
          <span style={{ fontSize: 9.5, color: d.color, fontWeight: 700, letterSpacing: 0.5 }}>
            {isTied && !isTop
              ? (lang === 'es' ? 'EMPATE' : 'TIED')
              : (lang === 'es' ? 'MAYOR PROB.' : 'TOP MATCH')}
          </span>
        </div>
      )}

      {/* Label + chevron (chevron visible solo en cards sin badge) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: labelColor, letterSpacing: 0.2, flex: 1 }}>
          {d.label}
        </span>
        {!highlighted && (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"
            style={{ flexShrink: 0, color: T.textFaint }}>
            <path d="M2.5 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* Porcentaje grande — animamos de 0 al valor real */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
        <span style={{
          fontSize: 42, fontWeight: 800,
          fontFamily: 'DM Mono, monospace',
          color: numColor, lineHeight: 1, letterSpacing: -2,
        }}>
          {animated ? pct : 0}
        </span>
        <span style={{ fontSize: 18, color: T.textMuted, fontWeight: 400 }}>%</span>
      </div>

      {/* Nombre clínico */}
      <div style={{ fontSize: 12.5, color: T.cardNameColor, marginBottom: 12, fontWeight: 500 }}>
        {lang === 'es' ? d.es : d.en}
      </div>

      {/* Barra de progreso */}
      <div style={{ height: 3, background: T.barTrack, borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{
          height: '100%', background: d.color, borderRadius: 2,
          width: animated ? `${pct}%` : '0%',
          transition: `width 0.85s cubic-bezier(0.4,0,0.2,1) ${cat * 0.05}s`,
          boxShadow: isTop ? `0 0 8px ${d.color}` : 'none',
        }} />
      </div>

      {/* CTA — siempre visible, refuerza en hover */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 10.5, fontWeight: 700,
        color: highlighted ? d.color : T.hintText,
        opacity: hov ? 1 : 0.65,
        transition: 'opacity 0.15s',
      }}>
        <span>{lang === 'es' ? 'Ver descripción' : 'View details'}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1.5 5h7M6 2.5l2.5 2.5L6 7.5" stroke="currentColor" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  );
}

window.ResultCard = ResultCard;
