/* ============================================================================
   Navbar.jsx — Barra de navegación superior
   ============================================================================ */

function Navbar({ T, dark, lang, demoMode, activeView, onViewChange, onToggleDark, onToggleLang }) {
  const ThemeToggle = window.ThemeToggle;

  const ViewTab = ({ id, labelEs, labelEn }) => {
    const active = activeView === id;
    return (
      <button
        onClick={() => onViewChange(id)}
        style={{
          padding: '5px 14px', borderRadius: 7,
          border: active
            ? `1px solid ${T.navTabActiveBdr}`
            : '1px solid transparent',
          background: active ? T.navTabActiveBg : 'transparent',
          color: active ? T.navTabActiveTxt : T.navTabInactiveTxt,
          fontSize: 14, fontWeight: active ? 700 : 500,
          cursor: 'pointer', letterSpacing: 0.1,
          transition: 'all 0.15s', fontFamily: T.fontUI,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.color = T.navTextSub;
            e.currentTarget.style.background = T.navTabHoverBg;
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.color = T.navTabInactiveTxt;
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {lang === 'es' ? labelEs : labelEn}
      </button>
    );
  };

  return (
    <nav style={{
      height: 74, borderBottom: `1px solid ${T.navBorder}`,
      display: 'flex', alignItems: 'center', padding: '0 26px',
      flexShrink: 0, background: T.nav,
      position: 'sticky', top: 0, zIndex: 10,
      transition: 'background 0.3s, border-color 0.3s',
      boxShadow: '0 2px 14px rgba(0,0,0,0.22)',
      fontFamily: T.fontUI,
    }}>

      {/* ─── Izquierda: logo + nombre ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        <img
          src="assets/logos/logo-transparente-v2.svg"
          width="45" height="45"
          alt="Logo"
          style={{
            display: 'block', flexShrink: 0,
            filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.35))',
          }}
        />
        <div style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 15.5, color: T.navText, whiteSpace: 'nowrap' }}>
            {lang === 'es' ? 'Sistema ML de Apoyo BI-RADS' : 'BI-RADS ML Support System'}
          </span>
        </div>
      </div>

      {/* ─── Centro: tabs de vista ──────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        padding: '3px', borderRadius: 9,
        background: 'rgba(0,0,0,0.18)',
        border: '1px solid rgba(255,255,255,0.12)',
        flexShrink: 0, margin: '0 16px',
      }}>
        <ViewTab id="analysis"  labelEs="Análisis"           labelEn="Analysis" />
        <ViewTab id="reference" labelEs="Referencia BI-RADS" labelEn="BI-RADS Guide" />
      </div>

      {/* ─── Derecha: estado + toggles ──────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
        {demoMode ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
            borderRadius: 20, background: 'rgba(217,119,6,0.22)', border: '1px solid rgba(217,119,6,0.50)',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }} />
            <span style={{ fontSize: 12, color: '#fef3c7', fontWeight: 700, letterSpacing: 0.5 }}>
              {lang === 'es' ? 'MODO DEMO' : 'DEMO MODE'}
            </span>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 11px',
            borderRadius: 20, background: 'rgba(22,163,74,0.18)', border: '1px solid rgba(34,197,94,0.38)',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: 12, color: '#86efac', fontWeight: 600, letterSpacing: 0.3 }}>
              ML Online
            </span>
          </div>
        )}

        <ThemeToggle dark={dark} onToggle={onToggleDark} T={T} />

        <button
          onClick={onToggleLang}
          style={{
            padding: '5px 14px', borderRadius: 20,
            border: `1px solid ${T.navBtnBdr}`,
            background: T.navBtnBg,
            color: T.navBtnTxt, fontSize: 13, cursor: 'pointer',
            fontWeight: 600, transition: 'all 0.15s', fontFamily: T.fontUI,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = T.navText;
            e.currentTarget.style.background = T.navBtnBgHov;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = T.navBtnTxt;
            e.currentTarget.style.background = T.navBtnBg;
          }}
        >
          {lang === 'es' ? 'EN' : 'ES'}
        </button>
      </div>
    </nav>
  );
}

window.Navbar = Navbar;
