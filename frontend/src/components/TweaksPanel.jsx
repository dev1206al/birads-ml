/* ============================================================================
   TweaksPanel.jsx — Panel flotante de ajustes en vivo (modo edición)
   ----------------------------------------------------------------------------
   Este panel solo aparece cuando el host activa el modo "Tweaks". Permite al
   usuario cambiar el aspecto (oscuro/claro) y el idioma sin recargar la app.

   En un entorno standalone (corriendo desde tu localhost) este panel queda
   oculto a menos que pongas tweaksVisible=true a mano — está pensado más
   como herramienta de diseño que de producción.
   ============================================================================ */

function TweaksPanel({ T, dark, lang, onChangeDark, onChangeLang, onClose }) {
  // Definimos las opciones como datos para no repetir markup.
  const sections = [
    {
      label: 'Aspecto / Theme',
      opts: [
        { v: true, l: 'Oscuro' },
        { v: false, l: 'Claro' },
      ],
      val: dark,
      set: onChangeDark,
    },
    {
      label: 'Idioma / Language',
      opts: [
        { v: 'es', l: 'Español' },
        { v: 'en', l: 'English' },
      ],
      val: lang,
      set: onChangeLang,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 300,
        background: T.tweaksBg,
        borderRadius: 14,
        padding: 22,
        width: 268,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        border: `1px solid ${T.border}`,
        animation: 'fadeUp 0.2s ease',
      }}
    >
      {/* Cabecera con título y botón cerrar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Tweaks</span>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: T.textMuted,
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Listado de secciones (theme + idioma) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sections.map(({ label, opts, val, set }) => (
          <div key={label}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: T.textMuted,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {label}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {opts.map(({ v, l }) => {
                // Comparamos con String() porque mezclamos boolean y string
                const isActive = String(val) === String(v);
                return (
                  <button
                    key={String(v)}
                    onClick={() => set(v)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      border: `1px solid ${isActive ? '#6366f1' : T.border}`,
                      background: isActive
                        ? 'rgba(99,102,241,0.15)'
                        : T.dark
                        ? 'rgba(255,255,255,0.03)'
                        : '#f8fafc',
                      color: isActive ? '#818cf8' : T.textSub,
                    }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
