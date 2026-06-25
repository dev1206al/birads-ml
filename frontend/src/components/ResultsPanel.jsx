/* ============================================================================
   ResultsPanel.jsx — Panel derecho con los resultados del análisis
   ----------------------------------------------------------------------------
   Tres estados posibles:
     1. Sin resultados    → mostramos <BiradsReference> (guía)
     2. Cargando          → spinner + texto
     3. Con resultados    → banner top + confianza + rejilla + export

   Recibimos todo desde App.jsx para mantener este componente puro/presentacional.
   ============================================================================ */

function ResultsPanel({
  T,
  lang,
  loading,
  error,
  mode,
  results,
  rawScores,
  probaDisplay,
  binaryResult,
  topCat,
  animated,
  confidence,
  copied,
  onOpenModal,
  onCopy,
  onExport,
  isVertical,
  birads0Warning,
}) {
  // Componentes hijos que usamos aquí
  const BiradsReference = window.BiradsReference;
  const ResultCard      = window.ResultCard;
  const BinaryResult    = window.BinaryResult;
  const BIRADS          = window.BIRADS;

  const hasResults      = results && !loading;
  const hasBinaryResult = binaryResult && !loading;

  // ── Estado local para el ranking colapsable ───────────────────────────
  const [rankingOpen, setRankingOpen] = React.useState(true);

  // Resetear al llegar nuevos resultados
  React.useEffect(() => { setRankingOpen(true); }, [results]);

  // ── Cálculo de ambigüedad (sólo cuando hay resultados de probabilidad) ──
  const tiedCats = React.useMemo(() => {
    if (!results || topCat === null) return [];
    const topPct = results[topCat];
    return Object.entries(results)
      .filter(([k, v]) => v === topPct && Number(k) !== topCat && v > 0)
      .map(([k]) => Number(k));
  }, [results, topCat]);

  const isBimodal = React.useMemo(() => {
    if (!results) return false;
    const sorted = Object.entries(results)
      .map(([k, v]) => [Number(k), v])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
    const [first, second] = sorted;
    return !!(second && second[1] >= 18 && Math.abs(first[0] - second[0]) >= 3);
  }, [results]);

  const panelStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: isVertical ? '20px 16px 40px' : '26px 30px 32px',
    transition: 'background 0.3s',
  };

  return (
    <div style={isVertical ? {} : { flex: 1, overflowY: 'auto', minHeight: 0 }}>
    <div style={panelStyle}>
      {/* ─── Estado 1: vacío — guía de referencia ─────────────────────── */}
      {!results && !binaryResult && !loading && !error && (
        <BiradsReference lang={lang} T={T} onInfo={onOpenModal} />
      )}

      {/* ─── Estado 2: cargando ────────────────────────────────────────── */}
      {loading && (
        <div
          style={{
            minHeight: isVertical ? 180 : 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            color: T.loadingText,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              border: `3px solid ${
                T.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
              }`,
              borderTopColor: '#6366f1',
              borderRadius: 22,
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div style={{ fontSize: 14, animation: 'pulse 1.4s ease infinite' }}>
            {lang === 'es'
              ? 'Procesando observaciones radiológicas…'
              : 'Processing radiological observations…'}
          </div>
        </div>
      )}

      {/* ─── Alerta BI-RADS 0 (evaluación incompleta detectada) ──────── */}
      {(hasBinaryResult || hasResults) && birads0Warning && (() => {
        const hard = birads0Warning === 'hard';
        const bg     = hard ? 'rgba(220,38,38,0.07)' : 'rgba(217,119,6,0.08)';
        const border = hard ? 'rgba(220,38,38,0.30)' : 'rgba(217,119,6,0.30)';
        const color  = hard ? '#b91c1c' : '#92400e';
        const title  = lang === 'es'
          ? (hard ? 'Posible BI-RADS 0 detectado' : 'Posible evaluación incompleta')
          : (hard ? 'Possible BI-RADS 0 detected' : 'Possible incomplete evaluation');
        const body = lang === 'es'
          ? (hard
              ? 'El texto menciona explícitamente BI-RADS 0. Esta categoría no forma parte del modelo predictivo (fue excluida del entrenamiento). La distribución 1–5 mostrada es orientativa y no sustituye completar la evaluación.'
              : 'El texto contiene indicios compatibles con BI-RADS 0 (evaluación incompleta). Complete estudios adicionales o compare con estudios previos antes de interpretar la clasificación 1–5.')
          : (hard
              ? 'The text explicitly mentions BI-RADS 0. This category is not part of the predictive model (excluded from training). The 1–5 distribution shown is indicative and does not substitute completing the evaluation.'
              : 'The text contains signs compatible with BI-RADS 0 (incomplete evaluation). Complete additional studies or compare with prior studies before interpreting the 1–5 classification.');
        return (
          <div style={{
            padding: '11px 15px', borderRadius: 10, fontSize: 12.5,
            background: bg, border: `1px solid ${border}`, color,
            display: 'flex', alignItems: 'flex-start', gap: 10,
            animation: 'slideIn 0.35s ease',
          }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
              style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M8 2L14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <line x1="8" y1="7" x2="8" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="8" cy="12" r="0.8" fill="currentColor"/>
            </svg>
            <span>
              <strong>{title}</strong>{' — '}{body}
            </span>
          </div>
        );
      })()}

      {/* ─── Estado 3a: resultado binario ─────────────────────────────── */}
      {hasBinaryResult && (
        <BinaryResult
          result={binaryResult}
          lang={lang}
          T={T}
          onExport={onExport}
        />
      )}

      {/* ─── Estado 3b: distribución BI-RADS (probabilidades) ─────────── */}
      {hasResults && (
        <React.Fragment>
          {/* ─── Tira de ranking (colapsable en modo grid, principal en modo ranking) ── */}
          {topCat !== null && (() => {
            const BIRADS   = window.BIRADS;
            const isRanking = probaDisplay === 'ranking';
            const ranked = [1, 2, 3, 4, 5]
              .map((cat) => ({ cat, pct: results[cat] || 0, score: rawScores ? (rawScores[String(cat)] ?? null) : null }))
              .sort((a, b) => b.pct - a.pct);
            const maxPct = ranked[0].pct || 1;
            const hasRaw = rawScores !== null;
            const topD   = BIRADS[topCat];

            return (
              <div style={{
                borderRadius: 12,
                border: isRanking ? `1px solid ${topD.color}44` : `1px solid ${T.border}`,
                background: isRanking ? (T.dark ? `${topD.color}08` : `${topD.color}05`) : T.card,
                overflow: 'hidden',
                animation: 'slideIn 0.3s ease',
                boxShadow: isRanking ? `0 2px 20px ${topD.glow}` : 'none',
              }}>
                {/* Cabecera — con toggle en modo grid, estática en modo ranking */}
                <div
                  onClick={isRanking ? undefined : () => setRankingOpen((o) => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: isRanking ? '12px 18px' : '9px 14px',
                    cursor: isRanking ? 'default' : 'pointer',
                    background: isRanking ? 'transparent'
                      : (T.dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                    borderBottom: (isRanking || rankingOpen) ? `1px solid ${isRanking ? topD.color + '22' : T.border}` : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isRanking) e.currentTarget.style.background = T.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={(e) => { if (!isRanking) e.currentTarget.style.background = T.dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: isRanking ? 11.5 : 10.5,
                      fontWeight: 700,
                      color: isRanking ? topD.color : T.textMuted,
                      textTransform: 'uppercase', letterSpacing: 0.6,
                    }}>
                      {lang === 'es' ? 'Ranking del clasificador' : 'Classifier ranking'}
                    </span>
                  </div>
                  {!isRanking && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                      style={{ color: T.textMuted, transform: rankingOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                {/* Contenido del ranking */}
                {(isRanking || rankingOpen) && (
                  <div style={{ padding: isRanking ? '16px 18px' : '10px 14px', display: 'flex', flexDirection: 'column', gap: isRanking ? 11 : 7 }}>
                    {ranked.map(({ cat, pct, score }, idx) => {
                      const d        = BIRADS[cat];
                      const isTop    = cat === topCat;
                      const barW     = `${Math.round((pct / maxPct) * 100)}%`;
                      const scoreNeg = score !== null && score < 0;
                      const barH     = isRanking ? 6 : 4;

                      return (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: isRanking ? 13 : 10 }}>
                          {/* Número de ranking */}
                          <span style={{
                            fontSize: isRanking ? 11 : 10, fontWeight: 700,
                            color: isTop ? d.color : T.textFaint,
                            minWidth: 18, textAlign: 'right',
                          }}>#{idx + 1}</span>

                          {/* Punto de color */}
                          <div style={{
                            width: isRanking ? 10 : 8, height: isRanking ? 10 : 8,
                            borderRadius: '50%', background: d.color,
                            boxShadow: isTop ? `0 0 ${isRanking ? 10 : 6}px ${d.color}` : 'none',
                            flexShrink: 0,
                          }} />

                          {/* Label */}
                          <span style={{
                            fontSize: isRanking ? 13 : 11.5,
                            fontWeight: isTop ? 700 : 500,
                            color: isTop ? T.text : T.textSub,
                            minWidth: isRanking ? 72 : 56, flexShrink: 0,
                          }}>
                            {isRanking ? `${d.label} · ${lang === 'es' ? d.es : d.en}` : d.label}
                          </span>

                          {/* Barra */}
                          <div style={{ flex: 1, height: barH, background: T.barTrack, borderRadius: barH / 2, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', background: d.color, borderRadius: barH / 2,
                              width: animated ? barW : '0%',
                              transition: `width 0.8s cubic-bezier(0.4,0,0.2,1) ${idx * 0.09}s`,
                              boxShadow: isTop ? `0 0 ${isRanking ? 10 : 6}px ${d.color}` : 'none',
                            }} />
                          </div>

                          {/* Score crudo (siempre visible en ranking, opcional en grid) */}
                          {(isRanking || hasRaw) && (
                            <span style={{
                              fontSize: isRanking ? 13 : 10.5,
                              fontWeight: isTop ? 700 : 400,
                              fontFamily: 'DM Mono, monospace',
                              color: scoreNeg ? T.textFaint : (isTop ? d.color : T.textSub),
                              minWidth: isRanking ? 44 : 40, textAlign: 'right',
                            }}>
                              {score !== null
                                ? (score > 0 ? '+' : '') + score
                                : `${animated ? pct : 0}%`}
                            </span>
                          )}

                          {/* Porcentaje softmax (solo en modo ranking como secundario) */}
                          {isRanking && score !== null && (
                            <span style={{
                              fontSize: 10.5, color: T.textFaint,
                              fontFamily: 'DM Mono, monospace',
                              minWidth: 34, textAlign: 'right',
                            }}>
                              {animated ? pct : 0}%
                            </span>
                          )}
                        </div>
                      );
                    })}

                    <div style={{ fontSize: 10, color: T.textFaint, marginTop: isRanking ? 4 : 2, lineHeight: 1.5 }}>
                      {isRanking
                        ? (lang === 'es'
                            ? 'Scores: distancia al hiperplano de decisión. Los % son softmax normalizados — no son probabilidades calibradas.'
                            : 'Scores: distance to decision hyperplane. % are softmax-normalized — not calibrated probabilities.')
                        : hasRaw
                          ? (lang === 'es'
                              ? 'Scores: distancia al hiperplano (positivo = favorece, negativo = rechaza).'
                              : 'Scores: distance to hyperplane (positive = favors, negative = rejects).')
                          : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ─── Mapa de scores y Top 3 — solo modo ranking ──────────── */}
          {probaDisplay === 'ranking' && topCat !== null && rawScores && (() => {
            const B = window.BIRADS;
            const cats = [1, 2, 3, 4, 5];
            const scoreData = cats.map(cat => ({
              cat,
              score: Number(rawScores[String(cat)] ?? 0),
              d: B[cat],
            }));

            const allVals = [...scoreData.map(s => s.score), 0];
            const minVal  = Math.min(...allVals);
            const maxVal  = Math.max(...allVals);
            const range   = maxVal - minVal || 1;
            // Map to [6%, 94%] so edge dots never clip
            const toPos   = (v) => 6 + ((v - minVal) / range) * 88;
            const zeroPct = toPos(0);

            // Sort by position, alternate label rows to avoid collisions
            const mapped = scoreData
              .map(s => ({ ...s, posPct: toPos(s.score) }))
              .sort((a, b) => a.posPct - b.posPct)
              .map((s, i) => ({ ...s, labelRow: i % 2 }));

            const top3    = [...scoreData].sort((a, b) => b.score - a.score).slice(0, 3);
            const fmtScore = (v) => (v >= 0 ? '+' : '') + v.toFixed(2);
            const s0      = top3[0]?.score ?? 1;
            const s2      = top3[2]?.score ?? s0;
            const barSpan = s0 - s2 || 1;

            return (
              <React.Fragment>

                {/* Mapa de scores de decisión */}
                <div style={{
                  background: T.card, border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: '16px 18px 14px',
                  animation: 'slideIn 0.3s ease',
                  boxShadow: T.dark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: T.textMuted,
                    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16,
                  }}>
                    {lang === 'es' ? 'Mapa de scores de decisión' : 'Decision score map'}
                  </div>

                  {/* Área del eje */}
                  <div style={{ position: 'relative', height: 76 }}>
                    <div style={{
                      position: 'absolute', bottom: 18,
                      left: 0, right: 0, height: 2, borderRadius: 1,
                      background: T.barTrack,
                    }} />
                    <div style={{
                      position: 'absolute',
                      left: `${zeroPct}%`, bottom: 13,
                      width: 1, height: 12,
                      background: T.textMuted, opacity: 0.5,
                    }} />
                    {mapped.map(({ cat, score, d, posPct, labelRow }) => {
                      const isTop   = cat === topCat;
                      const dotSize = isTop ? 13 : 9;
                      return (
                        <React.Fragment key={cat}>
                          <div style={{
                            position: 'absolute',
                            left: `${posPct}%`,
                            bottom: 18 - dotSize / 2,
                            width: dotSize, height: dotSize, borderRadius: '50%',
                            background: d.color,
                            transform: 'translateX(-50%)',
                            boxShadow: isTop ? `0 0 10px ${d.color}` : 'none',
                            zIndex: isTop ? 2 : 1,
                          }} />
                          <div style={{
                            position: 'absolute',
                            left: `${posPct}%`,
                            bottom: 18 + dotSize / 2 + 2 + labelRow * 19,
                            transform: 'translateX(-50%)',
                            whiteSpace: 'nowrap',
                            fontSize: 9.5, fontWeight: isTop ? 700 : 400,
                            color: isTop ? d.color : T.textSub,
                            fontFamily: 'DM Mono, monospace',
                            zIndex: 3,
                          }}>
                            BR{cat} {fmtScore(score)}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Leyenda del eje */}
                  <div style={{ position: 'relative', height: 14, margin: '2px 0 8px' }}>
                    <span style={{
                      position: 'absolute', left: 0,
                      fontSize: 9.5, color: T.textFaint, fontWeight: 500,
                    }}>
                      {lang === 'es' ? 'Menor soporte' : 'Less support'}
                    </span>
                    <span style={{
                      position: 'absolute', left: `${zeroPct}%`,
                      transform: 'translateX(-50%)',
                      fontSize: 9.5, color: T.textMuted, fontWeight: 700,
                      fontFamily: 'DM Mono, monospace',
                    }}>0</span>
                    <span style={{
                      position: 'absolute', right: 0,
                      fontSize: 9.5, color: T.textFaint, fontWeight: 500,
                    }}>
                      {lang === 'es' ? 'Mayor soporte' : 'More support'}
                    </span>
                  </div>

                  <div style={{ fontSize: 10, color: T.textFaint, lineHeight: 1.4 }}>
                    {lang === 'es'
                      ? 'Más a la derecha = mayor soporte del clasificador.'
                      : 'Further right = greater classifier support.'}
                  </div>
                </div>

                {/* Top 3 por score */}
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: T.gridLabel,
                    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12,
                  }}>
                    {lang === 'es' ? 'Top 3 por score' : 'Top 3 by score'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 11 }}>
                    {top3.map(({ cat, score, d }, rank) => {
                      const barPct = Math.max(8, ((score - s2) / barSpan) * 90 + 10);
                      return (
                        <button
                          key={cat}
                          className="birads-mini-btn"
                          onClick={() => onOpenModal(cat)}
                          aria-haspopup="dialog"
                          aria-label={`${d.label} — ${lang === 'es' ? d.es : d.en}. Score ${fmtScore(score)}. ${lang === 'es' ? 'Ver descripción completa.' : 'View full description.'}`}
                          style={{
                            appearance: 'none', WebkitAppearance: 'none',
                            textAlign: 'left', fontFamily: 'DM Sans, sans-serif',
                            width: '100%', display: 'block',
                            borderRadius: 12, padding: '16px 16px 14px',
                            cursor: 'pointer', position: 'relative',
                            background: rank === 0 ? `${d.color}10` : T.card,
                            border: `1px solid ${rank === 0 ? d.color + '55' : T.border}`,
                            boxShadow: rank === 0
                              ? `0 0 22px ${d.glow}`
                              : (T.dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)'),
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${d.color}12`;
                            e.currentTarget.style.borderColor = `${d.color}55`;
                            e.currentTarget.style.boxShadow = `0 4px 18px ${d.color}1a`;
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = rank === 0 ? `${d.color}10` : T.card;
                            e.currentTarget.style.borderColor = rank === 0 ? d.color + '55' : T.border;
                            e.currentTarget.style.boxShadow = rank === 0
                              ? `0 0 22px ${d.glow}`
                              : (T.dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)');
                            e.currentTarget.style.transform = 'none';
                          }}
                        >
                          {/* Badge de ranking */}
                          <div style={{
                            position: 'absolute', top: 10, right: 10,
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}>
                            <div style={{
                              width: 6, height: 6, borderRadius: 3, background: d.color,
                              boxShadow: rank === 0 ? `0 0 8px ${d.color}` : 'none',
                            }} />
                            <span style={{
                              fontSize: 9.5, fontWeight: 700,
                              color: d.color, letterSpacing: 0.5,
                            }}>#{rank + 1}</span>
                          </div>

                          {/* Label BI-RADS */}
                          <div style={{
                            fontSize: 13, fontWeight: 700, letterSpacing: 0.2, marginBottom: 6,
                            color: rank === 0 ? d.color : T.textSub,
                          }}>
                            {d.label}
                          </div>

                          {/* Score grande */}
                          <div style={{
                            fontSize: 36, fontWeight: 800,
                            fontFamily: 'DM Mono, monospace',
                            color: rank === 0 ? d.color : (score >= 0 ? T.text : T.textMuted),
                            lineHeight: 1, letterSpacing: -1.5, marginBottom: 4,
                          }}>
                            {fmtScore(score)}
                          </div>

                          {/* Nombre clínico */}
                          <div style={{
                            fontSize: 12.5, color: T.textSub,
                            marginBottom: 10, fontWeight: 500,
                          }}>
                            {lang === 'es' ? d.es : d.en}
                          </div>

                          {/* Barra de score relativo */}
                          <div style={{
                            height: 3, background: T.barTrack,
                            borderRadius: 2, overflow: 'hidden', marginBottom: 10,
                          }}>
                            <div style={{
                              height: '100%', background: d.color, borderRadius: 2,
                              width: animated ? `${barPct}%` : '0%',
                              transition: `width 0.85s cubic-bezier(0.4,0,0.2,1) ${rank * 0.1}s`,
                              boxShadow: rank === 0 ? `0 0 8px ${d.color}` : 'none',
                            }} />
                          </div>

                          {/* CTA */}
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: 10.5, fontWeight: 700,
                            color: d.color, opacity: 0.8,
                          }}>
                            <span>{lang === 'es' ? 'Ver descripción' : 'View details'}</span>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                              <path d="M1.5 5h7M6 2.5l2.5 2.5L6 7.5"
                                stroke="currentColor" strokeWidth="1.4"
                                strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </React.Fragment>
            );
          })()}

          {/* ─── Interpretación del resultado — LinearSVC ───────────────── */}
          {probaDisplay === 'ranking' && topCat !== null && rawScores && (() => {
            const B      = window.BIRADS;
            const sorted = [1,2,3,4,5]
              .map(c => ({ cat: c, score: Number(rawScores[String(c)] ?? 0), d: B[c] }))
              .sort((a, b) => b.score - a.score);
            const top1   = sorted[0];
            const top2   = sorted[1];
            const diff   = top1.score - top2.score;
            const fmtS   = (v) => (v >= 0 ? '+' : '') + v.toFixed(2);

            let mainLine;
            if (diff >= 0.75) {
              const lbl = `${top1.d.label} · ${lang === 'es' ? top1.d.es : top1.d.en}`;
              mainLine = lang === 'es'
                ? `El ranking favorece ${lbl} sobre las demás categorías según el score de decisión.`
                : `The ranking favors ${lbl} over all other categories by decision score.`;
            } else if (diff >= 0.25) {
              const lbl1 = `${top1.d.label} · ${lang === 'es' ? top1.d.es : top1.d.en}`;
              const lbl2 = `${top2.d.label} · ${lang === 'es' ? top2.d.es : top2.d.en}`;
              mainLine = lang === 'es'
                ? `El ranking favorece ${lbl1}, aunque la separación frente a ${lbl2} es moderada.`
                : `The ranking favors ${lbl1}, though the separation from ${lbl2} is moderate.`;
            } else {
              mainLine = lang === 'es'
                ? `Los scores de las primeras categorías son cercanos (${top1.d.label} ${fmtS(top1.score)} y ${top2.d.label} ${fmtS(top2.score)}); interprete el ranking con cautela.`
                : `The scores of the top categories are close (${top1.d.label} ${fmtS(top1.score)} and ${top2.d.label} ${fmtS(top2.score)}); interpret the ranking with caution.`;
            }

            const calibNote = lang === 'es'
              ? 'Los scores indican soporte relativo del clasificador y no son probabilidades calibradas.'
              : 'Scores indicate relative classifier support and are not calibrated probabilities.';

            return (
              <div style={{
                padding: '13px 16px', borderRadius: 10,
                background: T.dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
                border: `1px solid ${T.border}`,
                animation: 'slideIn 0.5s ease',
              }}>
                <div style={{
                  fontSize: 10.5, fontWeight: 700, color: T.textMuted,
                  textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8,
                }}>
                  {lang === 'es' ? 'Interpretación del resultado' : 'Result interpretation'}
                </div>
                <p style={{ fontSize: 12.5, color: T.textSub, lineHeight: 1.65, margin: 0 }}>
                  {mainLine}{' '}{calibNote}
                </p>
              </div>
            );
          })()}

          {/* Banner top, confianza y rejilla — ocultos en modo ranking */}
          {probaDisplay !== 'ranking' && (
          <React.Fragment>

          {topCat !== null && (() => {
            const d = BIRADS[topCat];
            const pct = results[topCat];
            return (
              <div
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  position: 'relative',
                  border: `1px solid ${d.color}33`,
                  animation: 'fadeUp 0.3s ease',
                  background: T.card,
                  boxShadow: T.dark
                    ? `0 0 0 1px ${d.color}22`
                    : `0 2px 16px ${d.glow}`,
                }}
              >
                {/* Gradiente sutil sobre el banner */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg,${d.color}16 0%,transparent 55%)`,
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                  }}
                >
                  {/* Ícono coloreado a la izquierda */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: `${d.color}18`,
                      border: `1px solid ${d.color}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        background: d.color,
                        boxShadow: `0 0 14px ${d.color}`,
                      }}
                    />
                  </div>

                  {/* Textos: kicker + título */}
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: d.color,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      {lang === 'es'
                        ? 'Categoría con mayor probabilidad'
                        : 'Most probable category'}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: T.bannerText,
                        letterSpacing: -0.3,
                      }}
                    >
                      {d.label}{' '}
                      <span style={{ color: d.color }}>·</span>{' '}
                      {lang === 'es' ? d.es : d.en}
                    </div>
                  </div>

                  {/* Porcentaje grande a la derecha */}
                  <div
                    style={{
                      marginLeft: 'auto',
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 48,
                        fontWeight: 800,
                        fontFamily: 'DM Mono, monospace',
                        color: d.color,
                        lineHeight: 1,
                        letterSpacing: -3,
                      }}
                    >
                      {animated ? pct : 0}
                      <span style={{ fontSize: 20, fontWeight: 400 }}>%</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.bannerSub, marginTop: 2 }}>
                      {lang === 'es' ? 'probabilidad' : 'probability'}
                    </div>
                  </div>

                  {/* Botones laterales: info (i) y copiar */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => onOpenModal(topCat)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        background: `${d.color}18`,
                        border: `1px solid ${d.color}44`,
                        color: d.color,
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = `${d.color}30`)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = `${d.color}18`)
                      }
                    >
                      i
                    </button>
                    <button
                      onClick={onCopy}
                      title={lang === 'es' ? 'Copiar resultado' : 'Copy result'}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        background: copied
                          ? 'rgba(22,163,74,0.18)'
                          : T.exportBtnBg,
                        border: `1px solid ${
                          copied ? 'rgba(22,163,74,0.4)' : T.border
                        }`,
                        color: copied ? '#16a34a' : T.exportBtnText,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      {copied ? (
                        // ✓ visual de "copiado"
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M2 7l3 3 6-6" />
                        </svg>
                      ) : (
                        // Ícono de "copy"
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        >
                          <rect x="4" y="4" width="8" height="8" rx="1.5" />
                          <path d="M2 9V2h7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ─── Indicador de confianza ML ──────────────────────────────── */}
          {confidence && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '11px 16px',
                borderRadius: 10,
                background: T.confidenceBg,
                border: `1px solid ${T.border}`,
                animation: 'slideIn 0.4s ease',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  flexShrink: 0,
                  minWidth: 80,
                }}
              >
                {lang === 'es' ? 'Confianza de clasificación' : 'Classification confidence'}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 5,
                  background: T.barTrack,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: confidence.color,
                    borderRadius: 3,
                    width: animated ? `${confidence.pct}%` : '0%',
                    transition:
                      'width 1s cubic-bezier(0.4,0,0.2,1) 0.2s',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: confidence.color,
                  flexShrink: 0,
                  minWidth: 56,
                  textAlign: 'right',
                }}
              >
                {lang === 'es' ? confidence.labelEs : confidence.labelEn}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 400,
                    color: T.textMuted,
                    marginLeft: 5,
                  }}
                >
                  ({confidence.pct}%)
                </span>
              </div>
            </div>
          )}

          {/* ─── Rejilla de tarjetas BI-RADS 1–5 ───────────────────────── */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.gridLabel,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                marginBottom: 12,
              }}
            >
              {lang === 'es'
                ? 'Distribución de probabilidades BI-RADS 1–5'
                : 'BI-RADS 1–5 probability distribution'}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 11,
              }}
            >
              {[1, 2, 3, 4, 5].map((cat) => (
                <ResultCard
                  key={cat}
                  cat={cat}
                  pct={results[cat]}
                  isTop={cat === topCat}
                  isTied={tiedCats.includes(cat)}
                  animated={animated}
                  lang={lang}
                  T={T}
                  onInfo={() => onOpenModal(cat)}
                />
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 11,
                color: T.gridHint,
                textAlign: 'center',
              }}
            >
              {lang === 'es'
                ? 'Haz clic en cualquier tarjeta para ver la descripción clínica completa'
                : 'Click any card to view the full clinical description'}
            </div>

          </div>

          </React.Fragment>
          )}

          {/* ─── Interpretación del resultado — MLP ─────────────────────── */}
          {probaDisplay !== 'ranking' && topCat !== null && (() => {
            const B        = window.BIRADS;
            const isTie    = tiedCats.length > 0;
            const topPct   = results[topCat];
            const topD     = B[topCat];

            const sorted2  = [1,2,3,4,5]
              .map(c => ({ cat: c, pct: results[c] || 0 }))
              .sort((a, b) => b.pct - a.pct);
            const second   = sorted2[1];
            const gap      = isTie ? 0 : topPct - (second?.pct || 0);
            const narrowGap = !isTie && gap < 10 && (second?.pct || 0) > 0;

            const lines = [];

            if (isTie) {
              lines.push(lang === 'es'
                ? 'El modelo no identifica una categoría dominante: dos o más categorías comparten la mayor probabilidad. Se recomienda revisión clínica adicional.'
                : 'The model does not identify a dominant category: two or more categories share the highest probability. Additional clinical review is recommended.');
            } else if (topPct >= 65) {
              const lbl = `${topD.label} · ${lang === 'es' ? topD.es : topD.en}`;
              lines.push(lang === 'es'
                ? `El modelo concentra la mayor probabilidad en ${lbl}, con ${topPct}%. La clasificación se muestra relativamente definida.`
                : `The model concentrates the highest probability on ${lbl}, with ${topPct}%. The classification appears relatively defined.`);
            } else if (topPct >= 40) {
              const lbl = `${topD.label} · ${lang === 'es' ? topD.es : topD.en}`;
              lines.push(lang === 'es'
                ? `La categoría con mayor probabilidad es ${lbl} (${topPct}%), aunque la distribución conserva incertidumbre. Revise las categorías cercanas.`
                : `The category with the highest probability is ${lbl} (${topPct}%), though the distribution retains uncertainty. Review the nearby categories.`);
            } else {
              lines.push(lang === 'es'
                ? 'La distribución es dispersa; el modelo no favorece una categoría con claridad. Interprete el resultado con cautela.'
                : 'The distribution is dispersed; the model does not clearly favor any category. Interpret the result with caution.');
            }

            if (narrowGap && second) {
              const secD = B[second.cat];
              lines.push(lang === 'es'
                ? `La diferencia con la segunda categoría (${secD.label}, ${second.pct}%) es estrecha, por lo que ambas deben revisarse.`
                : `The gap with the second category (${secD.label}, ${second.pct}%) is narrow, so both should be reviewed.`);
            }

            return (
              <div style={{
                padding: '13px 16px', borderRadius: 10,
                background: T.dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
                border: `1px solid ${T.border}`,
                animation: 'slideIn 0.5s ease',
              }}>
                <div style={{
                  fontSize: 10.5, fontWeight: 700, color: T.textMuted,
                  textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8,
                }}>
                  {lang === 'es' ? 'Interpretación del resultado' : 'Result interpretation'}
                </div>
                <p style={{ fontSize: 12.5, color: T.textSub, lineHeight: 1.65, margin: 0 }}>
                  {lines.join(' ')}
                </p>
              </div>
            );
          })()}

          {/* Exportar PDF — siempre visible cuando hay resultados */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={onExport}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '11px 28px', borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: T.dark ? 'rgba(255,255,255,0.05)' : T.card,
                color: T.textSub, fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer',
                boxShadow: T.dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.18s', flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.dark ? 'rgba(255,255,255,0.1)' : T.cardHover;
                e.currentTarget.style.color = T.text;
                e.currentTarget.style.borderColor = T.borderHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = T.dark ? 'rgba(255,255,255,0.05)' : T.card;
                e.currentTarget.style.color = T.textSub;
                e.currentTarget.style.borderColor = T.border;
              }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10v3a1 1 0 001 1h8a1 1 0 001-1v-3" />
                <path d="M8 2v7M5 6l3 3 3-3" />
              </svg>
              {lang === 'es' ? 'Exportar como PDF' : 'Export as PDF'}
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
    </div>
  );
}

window.ResultsPanel = ResultsPanel;
