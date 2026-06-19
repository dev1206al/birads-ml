/* ============================================================================
   App.jsx — Componente raíz que orquesta toda la aplicación
   ============================================================================ */

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

  // ─── Estados base ──────────────────────────────────────────────────
  const [activeView, setActiveView] = React.useState('analysis');  // 'analysis' | 'reference'
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
  // mode: 'binary' (Opción 1, default) | 'proba' (Opción 2)
  const [mode, setMode]             = React.useState('binary');
  const [binaryOption, setBinaryOption] = React.useState('B');  // 'A' | 'B'
  const [modelKey, setModelKey]     = React.useState(undefined);

  // results: probabilidades 5 clases  { '0':x, '1':x, ..., '5':x }
  const [results, setResults]       = React.useState(null);
  // rawScores: scores del hiperplano LinearSVC { '1':float, ..., '5':float } | null
  const [rawScores, setRawScores]   = React.useState(null);
  // probaDisplay: 'grid' | 'ranking' — controla si se muestra la rejilla o sólo el ranking
  const [probaDisplay, setProbaDisplay] = React.useState('grid');
  // binaryResult: resultado binario  { prediction, class_name, confidence, ... }
  const [binaryResult, setBinaryResult] = React.useState(null);
  const [animated, setAnimated]     = React.useState(false);

  const T = makeTheme(dark);

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
        // r = { probabilities: {...}, rawScores: {...}|null, display: 'grid'|'ranking' }
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
    setText(window.SAMPLE_OBS);
    setResults(null);
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
    ? Number(Object.entries(results).sort((a, b) => b[1] - a[1])[0][0])
    : null;

  const canAnalyze = text.trim() && !loading;

  const confidence =
    results && !loading && topCat !== null
      ? window.getConfidence(results, topCat)
      : null;

  const handleExport = () => {
    window.exportToPDF({
      text,
      mode,
      binaryOption,
      modelKey: modelKey || 'mlp_1-2gramas',
      binaryResult,
      results,
      topCat,
      confidence,
      lang,
    });
  };

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
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
      />

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {activeView === 'reference' ? (
          <ReferenceView T={T} lang={lang} onInfo={setModal} />
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
