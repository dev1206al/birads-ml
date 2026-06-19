/* ============================================================================
   BiradsReference.jsx — Estado vacío con la guía de referencia BI-RADS
   ----------------------------------------------------------------------------
   Mostramos esta guía cuando todavía no hay resultados. Sirve para que el
   usuario entienda qué significa cada categoría antes de analizar. Cada
   tarjeta es clicable y abre el modal de información.
   ============================================================================ */

function BiradsReference({ lang, T, onInfo }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        animation: 'fadeIn 0.4s ease',
      }}
    >
      {/* Título de la sección */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginBottom: 4,
          }}
        >
          {lang === 'es' ? 'Guía de referencia BI-RADS' : 'BI-RADS Reference Guide'}
        </div>
        <div style={{ fontSize: 12.5, color: T.emptySubtext, marginBottom: 14 }}>
          {lang === 'es'
            ? 'Ingrese observaciones para iniciar el análisis. Categorías disponibles:'
            : 'Enter observations to start analysis. Available categories:'}
        </div>
      </div>

      {/* Rejilla 3×2 con las 6 categorías */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 10,
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((cat) => {
          const d = window.BIRADS[cat];
          return (
            <div
              key={cat}
              onClick={() => onInfo(cat)}
              style={{
                borderRadius: 10,
                padding: '14px 14px 12px',
                cursor: 'pointer',
                background: T.emptyBg,
                border: `1px solid ${T.emptyBorder}`,
                transition: 'all 0.18s',
              }}
              // Al hover, tintamos el fondo y el borde con el color de la categoría
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${d.color}10`;
                e.currentTarget.style.borderColor = `${d.color}44`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = T.emptyBg;
                e.currentTarget.style.borderColor = T.emptyBorder;
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  marginBottom: 7,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    background: d.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: T.emptyText }}>
                  {d.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: d.color,
                  marginBottom: 5,
                }}
              >
                {lang === 'es' ? d.es : d.en}
              </div>
              <div style={{ fontSize: 11, color: T.emptySubtext, lineHeight: 1.45 }}>
                {lang === 'es' ? d.short_es : d.short_en}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pista al usuario */}
      <div
        style={{
          fontSize: 11,
          color: T.emptySubtext,
          textAlign: 'center',
          paddingTop: 4,
        }}
      >
        {lang === 'es'
          ? 'Haz clic en una categoría para ver su descripción clínica completa'
          : 'Click a category to view its full clinical description'}
      </div>
    </div>
  );
}

window.BiradsReference = BiradsReference;
