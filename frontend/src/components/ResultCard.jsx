/* ============================================================================
   ResultCard.jsx — Tarjeta individual de una categoría BI-RADS
   ----------------------------------------------------------------------------
   Renderizamos UNA tarjeta de la rejilla de resultados. Mostramos:
     · Label de la categoría (BI-RADS 0..5)
     · Porcentaje grande y monoespaciado
     · Nombre clínico (Negativo / Benigno / etc.)
     · Barra de progreso animada
     · Badge "MAYOR PROB." si es la categoría top
   Al hacer clic, llamamos onInfo() para que el padre abra el modal.
   ============================================================================ */

function ResultCard({ cat, pct, isTop, isTied, animated, lang, T, onInfo }) {
  const d = window.BIRADS[cat];

  const [hov, setHov] = React.useState(false);

  const highlighted = isTop || isTied;
  const numColor   = T.cardNumColor(highlighted, d.color);
  const labelColor = T.cardLabelColor(highlighted, d.color);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onInfo}
      style={{
        borderRadius: 12,
        padding: '18px 18px 16px',
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
          : T.dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Badge — top o empate */}
      {highlighted && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              background: d.color,
              boxShadow: `0 0 ${isTop ? 10 : 6}px ${d.color}`,
              animation: isTop ? 'pulse 2s ease infinite' : 'none',
            }}
          />
          <span
            style={{
              fontSize: 9.5,
              color: d.color,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {isTied && !isTop
              ? (lang === 'es' ? 'EMPATE' : 'TIED')
              : (lang === 'es' ? 'MAYOR PROB.' : 'TOP MATCH')}
          </span>
        </div>
      )}

      {/* Label de la categoría — siempre visible y prominente */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: labelColor,
          letterSpacing: 0.2,
          marginBottom: 6,
        }}
      >
        {d.label}
      </div>

      {/* Porcentaje grande — animamos de 0 al valor real */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
        <span
          style={{
            fontSize: 42,
            fontWeight: 800,
            fontFamily: 'DM Mono, monospace',
            color: numColor,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {animated ? pct : 0}
        </span>
        <span style={{ fontSize: 18, color: T.textMuted, fontWeight: 400 }}>%</span>
      </div>

      {/* Nombre clínico (Negativo / Benigno / Sospechoso / etc.) */}
      <div
        style={{
          fontSize: 12.5,
          color: T.cardNameColor,
          marginBottom: 12,
          fontWeight: 500,
        }}
      >
        {lang === 'es' ? d.es : d.en}
      </div>

      {/* Barra de progreso — la animamos con stagger según el índice */}
      <div
        style={{
          height: 3,
          background: T.barTrack,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: d.color,
            borderRadius: 2,
            width: animated ? `${pct}%` : '0%',
            transition: `width 0.85s cubic-bezier(0.4,0,0.2,1) ${cat * 0.05}s`,
            boxShadow: isTop ? `0 0 8px ${d.color}` : 'none',
          }}
        />
      </div>

      {/* Hint "detalles →" — solo se ve al hacer hover */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          fontSize: 10.5,
          color: T.hintText,
          opacity: hov ? 1 : 0,
          transition: 'opacity 0.15s',
        }}
      >
        {lang === 'es' ? 'detalles →' : 'details →'}
      </div>
    </div>
  );
}

window.ResultCard = ResultCard;
