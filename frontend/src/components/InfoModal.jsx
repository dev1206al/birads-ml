/* ============================================================================
   InfoModal.jsx — Modal con la descripción clínica completa de una categoría
   ----------------------------------------------------------------------------
   Mostramos este modal cuando el usuario hace clic en una tarjeta de resultado
   o en una categoría de la guía de referencia. Incluye: descripción clínica,
   riesgo de malignidad, manejo recomendado, hallazgos típicos y (para BI-RADS 4)
   subcategorías. Lo cerramos con ESC o clic fuera del modal.
   ============================================================================ */

function InfoModal({ cat, lang, T, onClose }) {
  const d = window.BIRADS[cat];
  const subcats = lang === 'es' ? d.subcats_es : d.subcats_en;

  React.useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)', animation: 'fadeIn 0.15s ease',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.modalBg,
          border: `1px solid ${d.color}44`,
          borderRadius: 18, padding: '28px 28px 24px',
          maxWidth: 520, width: '100%',
          maxHeight: '88vh', overflowY: 'auto',
          boxShadow: `0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px ${d.color}22`,
          animation: 'fadeUp 0.2s ease',
        }}
      >
        {/* ── Encabezado ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 13, flexShrink: 0,
            background: `${d.color}18`, border: `1px solid ${d.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: d.color,
              fontFamily: 'DM Mono, monospace' }}>{cat}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: T.text, letterSpacing: -0.4 }}>
              {d.label}
            </div>
            <div style={{ fontSize: 13.5, color: d.color, fontWeight: 600, marginTop: 3 }}>
              {lang === 'es' ? d.es : d.en}
            </div>
          </div>
          {/* Chip de riesgo */}
          <div style={{
            flexShrink: 0, padding: '4px 10px', borderRadius: 20,
            background: `${d.color}15`, border: `1px solid ${d.color}44`,
            fontSize: 11.5, fontWeight: 700, color: d.color,
          }}>
            {lang === 'es' ? d.risk_label_es : d.risk_label_en}
          </div>
        </div>

        {/* ── Descripción clínica ─────────────────────────────────────── */}
        <p style={{ fontSize: 14, lineHeight: 1.7, color: T.modalText, marginBottom: 18 }}>
          {lang === 'es' ? d.desc_es : d.desc_en}
        </p>

        {/* ── Manejo recomendado ──────────────────────────────────────── */}
        {d.management_es && (
          <div style={{
            padding: '12px 15px', borderRadius: 10, marginBottom: 14,
            background: `${d.color}0d`, border: `1px solid ${d.color}2a`,
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: d.color,
              textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
              {lang === 'es' ? 'Manejo clínico' : 'Clinical management'}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: d.color }}>
              {lang === 'es' ? d.management_es : d.management_en}
            </div>
          </div>
        )}

        {/* ── Hallazgos típicos ───────────────────────────────────────── */}
        {d.findings_es && (
          <div style={{ marginBottom: subcats ? 14 : 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textMuted,
              textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 }}>
              {lang === 'es' ? 'Hallazgos típicos' : 'Typical findings'}
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: T.modalText }}>
              {lang === 'es' ? d.findings_es : d.findings_en}
            </p>
          </div>
        )}

        {/* ── Subcategorías (BI-RADS 4) ───────────────────────────────── */}
        {subcats && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textMuted,
              textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 9 }}>
              {lang === 'es' ? 'Subcategorías' : 'Subcategories'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {subcats.map((sub) => (
                <div key={sub.id} style={{
                  padding: '10px 13px', borderRadius: 9,
                  background: `${d.color}0d`, border: `1px solid ${d.color}28`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, color: d.color,
                      background: `${d.color}20`, border: `1px solid ${d.color}44`,
                      padding: '1px 7px', borderRadius: 5,
                    }}>{sub.id}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: T.modalText }}>
                      {lang === 'es' ? 'Riesgo' : 'Risk'}: {sub.risk}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
                    {sub.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Cerrar ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 24px', borderRadius: 9,
              border: `1px solid ${d.color}44`,
              background: `${d.color}15`, color: d.color,
              fontWeight: 700, cursor: 'pointer', fontSize: 14,
              transition: 'background 0.15s', fontFamily: 'DM Sans, sans-serif',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = `${d.color}28`)}
            onMouseLeave={(e) => (e.currentTarget.style.background = `${d.color}15`)}
          >
            {lang === 'es' ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

window.InfoModal = InfoModal;
