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
          {/* ─── Banner de alerta contextual ──────────────────────────────── */}
          {topCat !== null && (() => {
            const tied    = tiedCats;
            const bimodal = isBimodal;
            const topPct  = results[topCat];
            const isTie   = tied.length > 0;
            const lowConf = topPct < 40 && !isTie;

            if (!isTie && !bimodal && !lowConf) return null;

            // Determinar tipo de alerta
            let icon, bg, border, textColor, title, body;

            if (isTie && bimodal) {
              icon = '⚡'; bg = 'rgba(220,38,38,0.07)'; border = 'rgba(220,38,38,0.28)';
              textColor = '#b91c1c';
              title = lang === 'es' ? 'Empate bimodal' : 'Bimodal tie';
              body  = lang === 'es'
                ? `Dos categorías no adyacentes comparten la mayor probabilidad (${topPct}%). El modelo no puede discriminar con certeza — la categoría real puede estar en cualquier extremo del espectro.`
                : `Two non-adjacent categories share the highest probability (${topPct}%). The model cannot discriminate reliably — the actual category may be at either end of the spectrum.`;
            } else if (isTie) {
              icon = '⚖'; bg = 'rgba(217,119,6,0.10)'; border = 'rgba(217,119,6,0.35)';
              textColor = '#b45309';
              title = lang === 'es' ? 'Resultado ambiguo — empate' : 'Ambiguous result — tie';
              body  = lang === 'es'
                ? `Dos categorías comparten la mayor probabilidad (${topPct}%). No hay un ganador claro. Se recomienda revisión clínica adicional.`
                : `Two categories share the highest probability (${topPct}%). No clear winner. Additional clinical review is recommended.`;
            } else if (bimodal) {
              icon = '〰'; bg = 'rgba(124,58,237,0.08)'; border = 'rgba(124,58,237,0.28)';
              textColor = '#6d28d9';
              title = lang === 'es' ? 'Distribución bimodal' : 'Bimodal distribution';
              body  = lang === 'es'
                ? `Alta probabilidad en categorías no adyacentes. El modelo detecta características de dos grupos muy distintos — el reporte requiere revisión especializada.`
                : `High probability in non-adjacent categories. The model detects features from two very different groups — the report requires specialist review.`;
            } else {
              icon = '〜'; bg = T.dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
              border = T.border; textColor = T.textSub;
              title = lang === 'es' ? 'Distribución dispersa' : 'Dispersed distribution';
              body  = lang === 'es'
                ? `El modelo no favorece ninguna categoría con certeza (máximo ${topPct}%). Los resultados deben interpretarse con precaución.`
                : `The model does not favor any category with certainty (max ${topPct}%). Results should be interpreted with caution.`;
            }

            return (
              <div style={{
                padding: '11px 15px', borderRadius: 10, fontSize: 12.5,
                background: bg, border: `1px solid ${border}`, color: textColor,
                display: 'flex', alignItems: 'flex-start', gap: 10,
                animation: 'slideIn 0.35s ease',
              }}>
                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                <span>
                  <strong>{title}</strong>{' — '}{body}
                </span>
              </div>
            );
          })()}

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
                      {isRanking
                        ? (lang === 'es' ? 'Scores del clasificador' : 'Classifier scores')
                        : (lang === 'es' ? 'Ranking del clasificador' : 'Classifier ranking')}
                    </span>
                    {hasRaw && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 700, padding: '1px 6px',
                        borderRadius: 4, letterSpacing: 0.3,
                        background: 'rgba(99,102,241,0.12)', color: '#6366f1',
                      }}>
                        LinearSVC · F1 0.794
                      </span>
                    )}
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
                {lang === 'es' ? 'Confianza ML' : 'ML Confidence'}
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

          {/* ─── Rejilla 3x2 de tarjetas ────────────────────────────────── */}
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
                ? 'Distribución completa de probabilidades'
                : 'Full probability distribution'}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 11,
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((cat) => (
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
