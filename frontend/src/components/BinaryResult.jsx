/* ============================================================================
   BinaryResult.jsx — Vista de resultado para clasificación binaria
   ----------------------------------------------------------------------------
   Muestra el resultado de clasificación binaria (Opción A o B) con:
     · Badge grande de color (verde = sin hallazgos / rojo-naranja = con hallazgos)
     · Nombre clínico de la categoría predicha
     · Barra de confianza del modelo
     · Métricas del modelo (recall, especificidad, F1)
     · Advertencia clínica si el resultado es positivo
   ============================================================================ */

function BinaryResult({ result, lang, T, onExport }) {
  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(t);
  }, [result]);

  if (!result) return null;

  const isPositive  = result.prediction === 1;
  const isDemoMode  = !!result.demo;
  const confidence  = result.confidence || 0;
  const lowConf     = confidence < 65;
  // Falsos negativos ≈ 100 - recall. Si recall no viene, usamos 84% (valor del mejor modelo B)
  const fnRate      = Math.round(100 - (result.recall || 84));

  // Paleta según positivo/negativo
  const color = isPositive ? '#ea580c' : '#16a34a';
  const glow  = isPositive ? 'rgba(234,88,12,0.22)' : 'rgba(22,163,74,0.22)';

  const optionLabel = result.option === 'A'
    ? (lang === 'es' ? 'BI-RADS 1,2,3 vs 4,5' : 'BI-RADS 1,2,3 vs 4,5')
    : (lang === 'es' ? 'BI-RADS 1,2 vs 3,4,5' : 'BI-RADS 1,2 vs 3,4,5');

  const clinicalNote = isPositive
    ? (lang === 'es'
        ? result.option === 'A'
          ? 'Hallazgos sugestivos de sospecha (BI-RADS 4–5). Se recomienda biopsia tisular.'
          : 'Se detectaron hallazgos relevantes (BI-RADS 3–5). Se requiere seguimiento o biopsia.'
        : result.option === 'A'
          ? 'Suspicious findings detected (BI-RADS 4–5). Tissue biopsy recommended.'
          : 'Relevant findings detected (BI-RADS 3–5). Follow-up or biopsy required.')
    : (lang === 'es'
        ? result.option === 'A'
          ? 'Sin hallazgos sospechosos (BI-RADS 1–3). Seguimiento rutinario.'
          : 'Sin hallazgos significativos (BI-RADS 1–2). Seguimiento rutinario anual.'
        : result.option === 'A'
          ? 'No suspicious findings (BI-RADS 1–3). Routine follow-up.'
          : 'No significant findings (BI-RADS 1–2). Routine annual follow-up.');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp 0.3s ease' }}>

      {/* ─── Badge principal ────────────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 14,
          overflow: 'hidden',
          position: 'relative',
          border: `1px solid ${color}33`,
          background: T.card,
          boxShadow: T.dark ? `0 0 0 1px ${color}22` : `0 2px 16px ${glow}`,
        }}
      >
        {/* Gradiente sutil */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg,${color}16 0%,transparent 55%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', padding: '24px 26px' }}>
          {/* Kicker */}
          <div style={{ fontSize: 11, fontWeight: 700, color: color,
            letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
            {lang === 'es' ? 'Clasificación binaria' : 'Binary classification'}
            {' · '}{lang === 'es' ? 'Opción' : 'Option'} {result.option}
            {' · '}{optionLabel}
          </div>

          {/* Resultado grande */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Ícono */}
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: `${color}18`, border: `1px solid ${color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {isPositive
                ? /* triángulo de alerta */
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4L22 20H2L12 4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
                    <line x1="12" y1="10" x2="12" y2="15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="18" r="1" fill={color} />
                  </svg>
                : /* check */
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
                    <path d="M8 12.5l3 3 5-5" stroke={color} strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
              }
            </div>

            {/* Nombre */}
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: T.bannerText,
                letterSpacing: -0.4, lineHeight: 1.15 }}>
                {result.class_name}
              </div>
              <div style={{ fontSize: 14, color: T.textSub, marginTop: 4 }}>
                {clinicalNote}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Alertas contextuales ───────────────────────────────────────── */}

      {/* 1. Confianza baja — modelo indeciso */}
      {lowConf && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, fontSize: 13.5,
          background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.35)',
          color: '#b45309', display: 'flex', alignItems: 'flex-start', gap: 9,
          animation: 'slideIn 0.35s ease',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M8 2L14 13H2L8 2Z" stroke="#b45309" strokeWidth="1.4" strokeLinejoin="round"/>
            <line x1="8" y1="7" x2="8" y2="10" stroke="#b45309" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="12" r="0.8" fill="#b45309"/>
          </svg>
          <span>
            <strong>{lang === 'es' ? 'Confianza baja' : 'Low confidence'}</strong>
            {' — '}
            {lang === 'es'
              ? `El modelo asignó solo ${confidence}% de certeza. El resultado puede no ser confiable; se recomienda revisión manual.`
              : `Model assigned only ${confidence}% certainty. Result may be unreliable; manual review is recommended.`}
          </span>
        </div>
      )}

      {/* 2. Resultado negativo — recordatorio de falsos negativos */}
      {!isPositive && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, fontSize: 13,
          background: T.dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${T.border}`,
          color: T.textSub, display: 'flex', alignItems: 'flex-start', gap: 9,
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="7.5" cy="7.5" r="6.5" stroke={T.textMuted} strokeWidth="1.2"/>
            <line x1="7.5" y1="4.5" x2="7.5" y2="8.5" stroke={T.textMuted} strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="7.5" cy="10.5" r="0.8" fill={T.textMuted}/>
          </svg>
          <span>
            {lang === 'es'
              ? `Este modelo tiene una tasa de falsos negativos del ${fnRate}% en el conjunto de prueba. Un resultado negativo no descarta hallazgos — el diagnóstico final debe confirmarlo el radiólogo.`
              : `This model has a ${fnRate}% false-negative rate on the test set. A negative result does not rule out findings — the radiologist must confirm the final diagnosis.`}
          </span>
        </div>
      )}

      {/* 3. Resultado positivo — urgencia clínica */}
      {isPositive && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, fontSize: 13.5,
          background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.25)',
          color: '#b91c1c', display: 'flex', alignItems: 'flex-start', gap: 9,
          animation: 'slideIn 0.35s ease',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="8" cy="8" r="6.5" stroke="#b91c1c" strokeWidth="1.4"/>
            <line x1="8" y1="5" x2="8" y2="9" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11.2" r="0.9" fill="#b91c1c"/>
          </svg>
          <span>
            {lang === 'es'
              ? 'Se detectaron características que requieren evaluación clínica. Derive al especialista para confirmación y seguimiento.'
              : 'Characteristics requiring clinical evaluation were detected. Refer to a specialist for confirmation and follow-up.'}
          </span>
        </div>
      )}

      {/* ─── Confianza del modelo ───────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px', borderRadius: 10,
        background: T.confidenceBg, border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 14,
        animation: 'slideIn 0.4s ease',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted,
          textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0, minWidth: 80 }}>
          {lang === 'es' ? 'Confianza de clasificación' : 'Classification confidence'}
        </div>
        <div style={{ flex: 1, height: 5, background: T.barTrack,
          borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: color, borderRadius: 3,
            width: animated ? `${result.confidence || 0}%` : '0%',
            transition: 'width 1s cubic-bezier(0.4,0,0.2,1) 0.2s',
          }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: color,
          flexShrink: 0, minWidth: 42, textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>
          {result.confidence || '—'}%
        </div>
      </div>

      {/* ─── Resumen del grupo clasificado ─────────────────────────────── */}
      {(() => {
        const caseKey = `${result.option}${result.prediction}`;
        const groups = {
          es: {
            B0: {
              title: 'Sin hallazgos (BI-RADS 1-2)',
              desc: 'Esta clasificación agrupa textos compatibles con ausencia de hallazgos significativos o hallazgos benignos.',
              rows: [
                { cat: 'BI-RADS 1', c: '#16a34a', name: 'Negativo',      note: 'sin hallazgos sospechosos.' },
                { cat: 'BI-RADS 2', c: '#65a30d', name: 'Benigno',       note: 'hallazgos definitivamente benignos.' },
              ],
              mgmt: 'Seguimiento rutinario según criterio radiológico.',
            },
            B1: {
              title: 'Con hallazgos (BI-RADS 3-4-5)',
              desc: 'Esta clasificación agrupa textos con hallazgos que requieren seguimiento, evaluación adicional o intervención.',
              rows: [
                { cat: 'BI-RADS 3', c: '#d97706', name: 'Prob. benigno', note: 'seguimiento a corto plazo.' },
                { cat: 'BI-RADS 4', c: '#ea580c', name: 'Sospechoso',    note: 'considerar biopsia.' },
                { cat: 'BI-RADS 5', c: '#dc2626', name: 'Alt. Maligno',  note: 'requiere evaluación prioritaria.' },
              ],
              mgmt: 'Revisión por radiólogo y correlación clínica.',
            },
            A0: {
              title: 'Benigno (BI-RADS 1-2-3)',
              desc: 'Esta clasificación agrupa textos sin sospecha alta de malignidad.',
              rows: [
                { cat: 'BI-RADS 1', c: '#16a34a', name: 'Negativo',      note: 'sin hallazgos.' },
                { cat: 'BI-RADS 2', c: '#65a30d', name: 'Benigno',       note: 'hallazgos definitivamente benignos.' },
                { cat: 'BI-RADS 3', c: '#d97706', name: 'Prob. benigno', note: 'seguimiento recomendado.' },
              ],
              mgmt: 'Seguimiento rutinario o vigilancia corta según categoría final.',
            },
            A1: {
              title: 'Sospechoso (BI-RADS 4-5)',
              desc: 'Esta clasificación agrupa textos con hallazgos sospechosos o altamente sugestivos de malignidad.',
              rows: [
                { cat: 'BI-RADS 4', c: '#ea580c', name: 'Sospechoso',    note: 'biopsia a considerar.' },
                { cat: 'BI-RADS 5', c: '#dc2626', name: 'Alta sospecha', note: 'evaluación prioritaria.' },
              ],
              mgmt: 'Confirmación por especialista.',
            },
          },
          en: {
            B0: {
              title: 'No Findings (BI-RADS 1-2)',
              desc: 'This classification groups texts compatible with the absence of significant findings or benign findings.',
              rows: [
                { cat: 'BI-RADS 1', c: '#16a34a', name: 'Negative', note: 'no suspicious findings.' },
                { cat: 'BI-RADS 2', c: '#65a30d', name: 'Benign',   note: 'definitely benign findings.' },
              ],
              mgmt: 'Routine follow-up per radiological criteria.',
            },
            B1: {
              title: 'With Findings (BI-RADS 3-4-5)',
              desc: 'This classification groups texts with findings requiring follow-up, additional evaluation, or intervention.',
              rows: [
                { cat: 'BI-RADS 3', c: '#d97706', name: 'Prob. Benign',      note: 'short-term follow-up.' },
                { cat: 'BI-RADS 4', c: '#ea580c', name: 'Suspicious',        note: 'consider biopsy.' },
                { cat: 'BI-RADS 5', c: '#dc2626', name: 'Highly suspicious', note: 'priority evaluation required.' },
              ],
              mgmt: 'Radiologist review and clinical correlation.',
            },
            A0: {
              title: 'Benign (BI-RADS 1-2-3)',
              desc: 'This classification groups texts without high suspicion of malignancy.',
              rows: [
                { cat: 'BI-RADS 1', c: '#16a34a', name: 'Negative',     note: 'no findings.' },
                { cat: 'BI-RADS 2', c: '#65a30d', name: 'Benign',       note: 'definitely benign findings.' },
                { cat: 'BI-RADS 3', c: '#d97706', name: 'Prob. Benign', note: 'follow-up recommended.' },
              ],
              mgmt: 'Routine follow-up or short-term surveillance per final category.',
            },
            A1: {
              title: 'Suspicious (BI-RADS 4-5)',
              desc: 'This classification groups texts with suspicious or highly suggestive findings.',
              rows: [
                { cat: 'BI-RADS 4', c: '#ea580c', name: 'Suspicious',     note: 'biopsy to consider.' },
                { cat: 'BI-RADS 5', c: '#dc2626', name: 'High suspicion', note: 'priority evaluation.' },
              ],
              mgmt: 'Specialist confirmation.',
            },
          },
        };
        const g = groups[lang === 'es' ? 'es' : 'en'][caseKey] || groups['es']['B0'];
        return (
          <div style={{
            borderRadius: 12,
            border: `1px solid ${color}2e`,
            background: T.card,
            boxShadow: T.dark ? 'none' : '0 1px 6px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            animation: 'slideIn 0.45s ease',
          }}>
            {/* Cabecera */}
            <div style={{
              padding: '9px 16px',
              background: `${color}0a`,
              borderBottom: `1px solid ${color}20`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: color, boxShadow: `0 0 6px ${color}`,
              }} />
              <div style={{
                fontSize: 10.5, fontWeight: 700, color: T.textMuted,
                textTransform: 'uppercase', letterSpacing: 0.6,
              }}>
                {lang === 'es' ? 'Resumen del grupo clasificado' : 'Classified group summary'}
              </div>
            </div>

            {/* Cuerpo */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {/* Título del grupo + descripción */}
              <div>
                <div style={{
                  fontSize: 15, fontWeight: 800, color: color,
                  letterSpacing: -0.2, marginBottom: 5,
                }}>
                  {g.title}
                </div>
                <div style={{ fontSize: 12.5, color: T.textSub, lineHeight: 1.55 }}>
                  {g.desc}
                </div>
              </div>

              {/* Filas BI-RADS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {g.rows.map(({ cat, c, name, note }) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: 3, flexShrink: 0,
                      background: c, marginTop: 5,
                    }} />
                    <span style={{
                      fontSize: 11.5, fontWeight: 700, color: c,
                      flexShrink: 0, minWidth: 72,
                    }}>
                      {cat}
                    </span>
                    <span style={{ fontSize: 12.5, color: T.textSub }}>
                      <strong>{name}</strong>{' — '}{note}
                    </span>
                  </div>
                ))}
              </div>

              {/* Manejo sugerido */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 9,
                padding: '8px 12px', borderRadius: 8,
                background: `${color}08`, border: `1px solid ${color}1a`,
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
                  stroke={color} strokeWidth="1.4" strokeLinecap="round"
                  style={{ flexShrink: 0, marginTop: 2 }}>
                  <rect x="2" y="1" width="9" height="11" rx="1.5" />
                  <line x1="4.5" y1="4.5" x2="8.5" y2="4.5" />
                  <line x1="4.5" y1="6.5" x2="8.5" y2="6.5" />
                  <line x1="4.5" y1="8.5" x2="7"   y2="8.5" />
                </svg>
                <div>
                  <div style={{
                    fontSize: 9.5, fontWeight: 700, color: color,
                    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2,
                  }}>
                    {lang === 'es' ? 'Manejo sugerido' : 'Suggested management'}
                  </div>
                  <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5 }}>
                    {g.mgmt}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ fontSize: 11, color: T.textFaint, lineHeight: 1.55 }}>
                {lang === 'es'
                  ? 'La clasificación es una ayuda de lectura automatizada; el criterio final corresponde al radiólogo.'
                  : 'This classification is an automated reading aid; the final determination belongs to the radiologist.'}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Interpretación del resultado ─────────────────────────────── */}
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
          {(() => {
            const groupName = result.option === 'A'
              ? (isPositive
                  ? (lang === 'es' ? 'Sospechoso (BI-RADS 4-5)' : 'Suspicious (BI-RADS 4-5)')
                  : (lang === 'es' ? 'Benigno (BI-RADS 1-2-3)' : 'Benign (BI-RADS 1-2-3)'))
              : (isPositive
                  ? (lang === 'es' ? 'Con hallazgos (BI-RADS 3-4-5)' : 'With findings (BI-RADS 3-4-5)')
                  : (lang === 'es' ? 'Sin hallazgos (BI-RADS 1-2)' : 'No findings (BI-RADS 1-2)'));
            const main = lang === 'es'
              ? `El texto se clasifica dentro del grupo ${groupName} de la división seleccionada. ${
                  isPositive
                    ? 'Este resultado requiere revisión clínica y confirmación por el radiólogo.'
                    : 'Un resultado negativo no descarta hallazgos clínicamente relevantes.'}`
              : `The text is classified in the ${groupName} group of the selected split. ${
                  isPositive
                    ? 'This result requires clinical review and confirmation by the radiologist.'
                    : 'A negative result does not rule out clinically relevant findings.'}`;
            const lowConfNote = lowConf
              ? (lang === 'es'
                  ? ' La confianza de clasificación es baja; interprete el resultado con cautela.'
                  : ' Classification confidence is low; interpret the result with caution.')
              : '';
            return main + lowConfNote;
          })()}
        </p>
      </div>

      {/* ─── Nota de demo ───────────────────────────────────────────────── */}
      {isDemoMode && (
        <div style={{
          padding: '8px 13px', borderRadius: 8, fontSize: 11.5,
          background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)',
          color: '#d97706',
        }}>
          {lang === 'es'
            ? '⚠ Resultado de demostración — backend no conectado'
            : '⚠ Demo result — backend not connected'}
        </div>
      )}

      {/* ─── Exportar PDF ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <button
          onClick={onExport}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '10px 26px', borderRadius: 10,
            border: `1px solid ${T.border}`,
            background: T.dark ? 'rgba(255,255,255,0.05)' : T.card,
            color: T.textSub, fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer',
            boxShadow: T.dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'all 0.18s', fontFamily: T.fontUI,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.dark ? 'rgba(255,255,255,0.1)' : T.cardHover;
            e.currentTarget.style.color = T.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = T.dark ? 'rgba(255,255,255,0.05)' : T.card;
            e.currentTarget.style.color = T.textSub;
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
    </div>
  );
}

window.BinaryResult = BinaryResult;
