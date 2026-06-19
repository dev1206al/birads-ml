/* ============================================================================
   ThemeToggle.jsx — Botón pill para alternar entre modo oscuro y claro
   ----------------------------------------------------------------------------
   Muestra un sol (cuando estamos en modo oscuro, para sugerir cambio a claro)
   o una luna (cuando estamos en modo claro). El texto cambia en consecuencia.
   ============================================================================ */

function ThemeToggle({ dark, onToggle, T }) {
  const [hov, setHov] = React.useState(false);

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '5px 14px',
        borderRadius: 20,
        border: `1px solid ${T.navBtnBdr}`,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        color: hov ? T.navText : T.navBtnTxt,
        transition: 'all 0.2s',
        background: hov ? T.navBtnBgHov : T.navBtnBg,
      }}
    >
      {/* Si estamos en oscuro, mostramos sol (para invitar a cambiar a claro) */}
      {dark ? (
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="6.5" cy="6.5" r="2.8" />
          <line x1="6.5" y1=".5" x2="6.5" y2="2" />
          <line x1="6.5" y1="11" x2="6.5" y2="12.5" />
          <line x1=".5" y1="6.5" x2="2" y2="6.5" />
          <line x1="11" y1="6.5" x2="12.5" y2="6.5" />
          <line x1="2.2" y1="2.2" x2="3.2" y2="3.2" />
          <line x1="9.8" y1="9.8" x2="10.8" y2="10.8" />
          <line x1="10.8" y1="2.2" x2="9.8" y2="3.2" />
          <line x1="3.2" y1="9.8" x2="2.2" y2="10.8" />
        </svg>
      ) : (
        // En claro, mostramos luna (para invitar a cambiar a oscuro)
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M11.5 7A5 5 0 1 1 6 1.5a3.5 3.5 0 0 0 5.5 5.5z" />
        </svg>
      )}
      {dark ? 'Claro' : 'Oscuro'}
    </button>
  );
}

window.ThemeToggle = ThemeToggle;
