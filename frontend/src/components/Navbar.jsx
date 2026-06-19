/* ============================================================================
   Navbar.jsx — Barra de navegación superior
   ============================================================================ */

function Navbar({ T, dark, lang, demoMode, activeView, onViewChange, onToggleDark, onToggleLang, vw, navH }) {
  const ThemeToggle = window.ThemeToggle;

  // Breakpoints internos de la navbar
  const isCompact = vw < 1100;   // tablet landscape + portrait
  const isSmall   = vw < 900;    // portrait tablet (744–899)

  const logoSize      = isCompact ? 32 : 42;
  const brandFontSize = isCompact ? 13 : 15;
  const hPadding      = isCompact ? '0 16px' : '0 26px';

  const brandText = isSmall
    ? (lang === 'es' ? 'Apoyo BI-RADS ML' : 'BI-RADS ML')
    : (lang === 'es' ? 'Sistema ML de Apoyo BI-RADS' : 'BI-RADS ML Support System');

  const ViewTab = ({ id, labelEs, labelEn, shortEs, shortEn }) => {
    const active = activeView === id;
    const label  = isSmall
      ? (lang === 'es' ? shortEs : shortEn)
      : (lang === 'es' ? labelEs : labelEn);
    return (
      <button
        onClick={() => onViewChange(id)}
        style={{
          padding: isCompact ? '4px 10px' : '5px 14px',
          borderRadius: 7,
          border: active
            ? `1px solid ${T.navTabActiveBdr}`
            : '1px solid transparent',
          background: active ? T.navTabActiveBg : 'transparent',
          color: active ? T.navTabActiveTxt : T.navTabInactiveTxt,
          fontSize: isCompact ? 12.5 : 14,
          fontWeight: active ? 700 : 500,
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
        {label}
      </button>
    );
  };

  return (
    <nav style={{
      height: navH,
      borderBottom: `1px solid ${T.navBorder}`,
      display: 'flex', alignItems: 'center',
      padding: hPadding,
      flexShrink: 0,
      background: T.nav,
      position: 'sticky', top: 0, zIndex: 10,
      transition: 'background 0.3s, border-color 0.3s',
      boxShadow: '0 2px 14px rgba(0,0,0,0.22)',
      fontFamily: T.fontUI,
      overflow: 'hidden',
    }}>

      {/* ─── Izquierda: logo + nombre ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: isCompact ? 8 : 11, minWidth: 0 }}>
        <img
          src="assets/logos/logo-transparente-v2.svg"
          width={logoSize} height={logoSize}
          alt="Logo"
          style={{
            display: 'block', flexShrink: 0,
            filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.35))',
          }}
        />
        <span style={{
          fontWeight: 700, fontSize: brandFontSize,
          color: T.navText, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {brandText}
        </span>
      </div>

      {/* ─── Centro: tabs de vista ──────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        padding: isCompact ? '2px' : '3px',
        borderRadius: 9,
        background: 'rgba(0,0,0,0.18)',
        border: '1px solid rgba(255,255,255,0.12)',
        flexShrink: 0, margin: isCompact ? '0 10px' : '0 16px',
      }}>
        <ViewTab
          id="analysis"
          labelEs="Análisis" labelEn="Analysis"
          shortEs="Análisis" shortEn="Analysis"
        />
        <ViewTab
          id="reference"
          labelEs="Referencia BI-RADS" labelEn="BI-RADS Guide"
          shortEs="Referencia" shortEn="Reference"
        />
      </div>

      {/* ─── Derecha: estado + toggles ──────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: isCompact ? 6 : 10 }}>
        {/* Badge ML status — ocultar texto en portrait muy compacto */}
        {demoMode ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
            borderRadius: 20, background: 'rgba(217,119,6,0.22)', border: '1px solid rgba(217,119,6,0.50)',
            flexShrink: 0,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }} />
            {!isSmall && (
              <span style={{ fontSize: 11, color: '#fef3c7', fontWeight: 700, letterSpacing: 0.5 }}>
                {lang === 'es' ? 'MODO DEMO' : 'DEMO MODE'}
              </span>
            )}
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: isSmall ? '4px 8px' : '4px 11px',
            borderRadius: 20, background: 'rgba(22,163,74,0.18)', border: '1px solid rgba(34,197,94,0.38)',
            flexShrink: 0,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            {!isSmall && (
              <span style={{ fontSize: 11.5, color: '#86efac', fontWeight: 600, letterSpacing: 0.3 }}>
                ML Online
              </span>
            )}
          </div>
        )}

        <ThemeToggle dark={dark} onToggle={onToggleDark} T={T} />

        <button
          onClick={onToggleLang}
          style={{
            padding: isCompact ? '4px 10px' : '5px 14px',
            borderRadius: 20,
            border: `1px solid ${T.navBtnBdr}`,
            background: T.navBtnBg,
            color: T.navBtnTxt,
            fontSize: isCompact ? 12 : 13,
            cursor: 'pointer',
            fontWeight: 600, transition: 'all 0.15s', fontFamily: T.fontUI,
            flexShrink: 0,
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
