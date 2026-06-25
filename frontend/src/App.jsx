/* ============================================================================
   App.jsx — Componente raíz que orquesta toda la aplicación
   ============================================================================ */

// Hook para reactivar layout en resize
function useViewportWidth() {
  const [vw, setVw] = React.useState(() => window.innerWidth);
  React.useEffect(() => {
    const update = () => setVw(window.innerWidth);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return vw;
}

function App() {
  const Navbar         = window.Navbar;
  const InputPanel     = window.InputPanel;
  const ResultsPanel   = window.ResultsPanel;
  const ReferenceView  = window.ReferenceView;
  const TweaksPanel    = window.TweaksPanel;
  const InfoModal      = window.InfoModal;
  const makeTheme      = window.makeTheme;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
    defaultLang: 'es',
    darkMode: false,
    accentColor: '#6366f1',
  } /*EDITMODE-END*/;

  // ─── Viewport ──────────────────────────────────────────────────────
  const vw = useViewportWidth();
  // Breakpoints:
  //   < 744          → incompatible (bloqueado)
  //   744 – 1099     → tablet (layout apilado, la PÁGINA scrollea)
  //   >= 1100        → desktop (2 columnas, los PANELES scrollean)
  const isIncompatible = vw < 744;
  const isVertical     = vw < 1100;
  const sidebarW       = vw >= 1100 ? 420 : 360;
  const navH           = vw >= 1100 ? 60 : 44;

  // ─── Estados base ──────────────────────────────────────────────────
  const [activeView, setActiveView] = React.useState('analysis');
  const [tweaks, setTweaks]   = React.useState(TWEAK_DEFAULTS);
  const [dark, setDark]       = React.useState(TWEAK_DEFAULTS.darkMode);
  const [lang, setLang]       = React.useState(TWEAK_DEFAULTS.defaultLang);
  const [text, setText]       = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [modal, setModal]     = React.useState(null);
  const [error, setError]     = React.useState(null);
  const [tweaksVisible, setTweaksVisible] = React.useState(false);
  const [copied, setCopied]   = React.useState(false);

  // ─── Estados de modo y resultados ──────────────────────────────────
  const [mode, setMode]             = React.useState('binary');
  const [binaryOption, setBinaryOption] = React.useState('B');
  const [modelKey, setModelKey]     = React.useState(undefined);

  const [results, setResults]       = React.useState(null);
  const [rawScores, setRawScores]   = React.useState(null);
  const [probaDisplay, setProbaDisplay] = React.useState('grid');
  const [binaryResult, setBinaryResult] = React.useState(null);
  const [animated, setAnimated]     = React.useState(false);

  const T = makeTheme(dark);

  // ─── Pantalla de dispositivo incompatible ──────────────────────────
  if (isIncompatible) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: T.bg, padding: 32,
        fontFamily: T.fontUI,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <img
            src="assets/logos/logo-transparente-v2.svg"
            width="52" height="52" alt="Logo"
            style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.35))' }}
          />
          <h1 style={{
            fontSize: 20, fontWeight: 800, color: T.text,
            marginTop: 20, marginBottom: 12, letterSpacing: -0.4,
          }}>
            {lang === 'es' ? 'Dispositivo no compatible' : 'Device not supported'}
          </h1>
          <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.65 }}>
            {lang === 'es'
              ? 'Esta herramienta está optimizada para iPad, tablet o escritorio. Prueba en un dispositivo con pantalla más grande.'
              : 'This tool is optimized for iPad, tablet, or desktop. Try on a device with a larger screen.'}
          </p>
        </div>
      </div>
    );
  }

  // ─── Comunicación con el host de Tweaks ────────────────────────────
  React.useEffect(() => {
    const h = (e) => {
      if (e.data?.type === '__activate_edit_mode')   setTweaksVisible(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', h);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', h);
  }, []);

  React.useEffect(() => {
    if (tweaksVisible) {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: tweaks }, '*');
    }
  }, [tweaks, tweaksVisible]);

  // ─── Cambio de modo: limpiar siempre ────────────────────────────────
  React.useEffect(() => {
    setResults(null);
    setRawScores(null);
    setProbaDisplay('grid');
    setBinaryResult(null);
    setError(null);
    setAnimated(false);
    setModelKey(undefined);
  }, [mode]);

  // ─── Cambio de opción binaria (A↔B): re-analizar si ya hay resultado ─
  React.useEffect(() => {
    if (!text.trim() || !binaryResult) {
      setBinaryResult(null);
      setError(null);
      return;
    }
    analyze();
  }, [binaryOption]);

  // ─── Cambio de modelo proba: re-analizar si ya hay resultado ─────────
  React.useEffect(() => {
    if (!modelKey) return;
    if (!text.trim()) return;
    if (!results && !binaryResult) return;
    analyze();
  }, [modelKey]);

  // ─── Handlers ──────────────────────────────────────────────────────
  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    setTweaks((t) => ({ ...t, darkMode: next }));
  };

  const toggleLang = () => setLang((l) => (l === 'es' ? 'en' : 'es'));

  const analyze = async (overrideText) => {
    const inputText = typeof overrideText === 'string' ? overrideText : text;
    if (!inputText.trim() || loading) return;
    if (overrideText) setText(overrideText);
    setLoading(true);
    setResults(null);
    setRawScores(null);
    setBinaryResult(null);
    setAnimated(false);
    setError(null);

    try {
      const r = await window.analyzeText(inputText, mode, binaryOption, modelKey);

      if (mode === 'binary') {
        setBinaryResult(r);
      } else {
        setResults(r.probabilities || r);
        setRawScores(r.rawScores || null);
        setProbaDisplay(r.display || 'grid');
        setTimeout(() => setAnimated(true), 60);
      }
    } catch (e) {
      setError(
        lang === 'es'
          ? 'Error al procesar. Verifique la conexión e intente de nuevo.'
          : 'Processing error. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const runDemo    = () => analyze(window.SAMPLE_OBS);
  const loadExample = () => {
    const list = window.SAMPLE_OBS_LIST;
    let pick = list[Math.floor(Math.random() * list.length)];
    // Si el texto actual ya es ese ejemplo y hay otros disponibles, elegir otro
    if (pick === text && list.length > 1) {
      const others = list.filter(s => s !== text);
      pick = others[Math.floor(Math.random() * others.length)];
    }
    setText(pick);
    setResults(null);
    setRawScores(null);
    setBinaryResult(null);
    setError(null);
    setAnimated(false);
  };

  const clearAll = () => {
    setText('');
    setResults(null);
    setRawScores(null);
    setProbaDisplay('grid');
    setBinaryResult(null);
    setError(null);
    setAnimated(false);
  };

  const handleCopy = () => {
    if (!results && !binaryResult) return;
    window.copyResults(results || binaryResult, topCat, lang);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // ─── Derivados ─────────────────────────────────────────────────────
  const topCat = results
    ? Number(Object.entries(results).filter(([k]) => Number(k) >= 1 && Number(k) <= 5).sort((a, b) => b[1] - a[1])[0][0])
    : null;

  const canAnalyze = text.trim() && !loading;

  const confidence =
    results && !loading && topCat !== null
      ? window.getConfidence(results, topCat)
      : null;

  // Detecta posible BI-RADS 0 en el texto ingresado
  const birads0Warning = React.useMemo(() => {
    if (!text.trim()) return null;
    if (/bi[\s\-]?rads\s*0|birads\s*0/i.test(text)) return 'hard';
    const lower = text.toLowerCase();
    const softPhrases = [
      'estudio incompleto', 'evaluación incompleta', 'evaluacion incompleta',
      'imágenes adicionales', 'imagenes adicionales', 'proyecciones adicionales',
      'comparar con estudios previos', 'estudios previos', 'estudio previo',
      'ultrasonido complementario', 'ecografía complementaria', 'ecografia complementaria',
      'se requiere ultrasonido', 'requieren imágenes', 'requieren imagenes',
    ];
    if (softPhrases.some((p) => lower.includes(p))) return 'soft';
    return null;
  }, [text]);

  const handleExport = () => {
    window.exportToPDF({
      text,
      mode,
      binaryOption,
      modelKey: modelKey || 'mlp_1-2gramas',
      binaryResult,
      results,
      rawScores,
      probaDisplay,
      topCat,
      confidence,
      lang,
      birads0Warning,
    });
  };

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div style={{
      // Desktop: altura fija, paneles scrollean internamente
      // Tablet: altura mínima, la página entera scrollea
      ...(isVertical ? { minHeight: '100dvh' } : { height: '100dvh' }),
      display: 'flex', flexDirection: 'column',
      background: T.bg, fontFamily: T.fontUI,
      color: T.text, transition: 'background 0.3s, color 0.3s',
    }}>
      <Navbar
        T={T} dark={dark} lang={lang}
        demoMode={false}
        activeView={activeView}
        onViewChange={setActiveView}
        onToggleDark={toggleDark}
        onToggleLang={toggleLang}
        vw={vw}
        navH={navH}
      />

      <div style={isVertical
        ? { display: 'flex', flexDirection: 'column' }
        : { flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }
      }>
        {activeView === 'reference' ? (
          <ReferenceView T={T} lang={lang} onInfo={setModal} isVertical={isVertical} />
        ) : (
          <React.Fragment>
            <InputPanel
              T={T} lang={lang}
              text={text} setText={setText}
              loading={loading} error={error} canAnalyze={canAnalyze}
              mode={mode} onModeChange={(m) => setMode(m)}
              binaryOption={binaryOption} onBinaryOptionChange={(o) => setBinaryOption(o)}
              modelKey={modelKey} onModelKeyChange={(k) => setModelKey(k)}
              demoMode={false}
              onAnalyze={analyze}
              onRunDemo={runDemo}
              onLoadExample={loadExample}
              onClear={clearAll}
              isVertical={isVertical}
              sidebarW={sidebarW}
            />

            <ResultsPanel
              T={T} lang={lang}
              loading={loading} error={error}
              mode={mode}
              results={results}
              rawScores={rawScores}
              probaDisplay={probaDisplay}
              binaryResult={binaryResult}
              topCat={topCat}
              animated={animated}
              confidence={confidence}
              copied={copied}
              onOpenModal={setModal}
              onCopy={handleCopy}
              onExport={handleExport}
              isVertical={isVertical}
              birads0Warning={birads0Warning}
            />
          </React.Fragment>
        )}
      </div>

      {tweaksVisible && (
        <TweaksPanel
          T={T} dark={dark} lang={lang}
          onChangeDark={(v) => { setDark(v); setTweaks((t) => ({ ...t, darkMode: v })); }}
          onChangeLang={(v) => { setLang(v); setTweaks((t) => ({ ...t, defaultLang: v })); }}
          onClose={() => setTweaksVisible(false)}
        />
      )}

      {modal !== null && (
        <InfoModal cat={modal} lang={lang} T={T} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

window.App = App;
