/* ============================================================================
   exporter.js — Funciones de exportación e interoperabilidad
   ----------------------------------------------------------------------------
   · exportToPDF(opts)  — PDF clínico A4 del resultado actual (binario o proba)
   · copyResults()      — Copia resumen en texto plano al portapapeles
   ============================================================================ */

window.exportToPDF = function exportToPDF(opts) {
  const {
    text         = '',
    mode         = 'proba',
    binaryOption = 'B',
    modelKey     = 'mlp_1-2gramas',
    binaryResult = null,
    results      = null,
    rawScores    = null,
    probaDisplay = 'grid',
    topCat       = null,
    confidence   = null,
    lang         = 'es',
  } = opts || {};

  const BIRADS = window.BIRADS;
  const es = lang === 'es';

  // ── ID de reporte (6 dígitos) ──────────────────────────────────────────────
  const reportId = Math.floor(100000 + Math.random() * 900000).toString();

  const date = new Date().toLocaleDateString(
    es ? 'es-MX' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  // ── Etiquetas modelo / configuración ──────────────────────────────────────
  const isLinearSVC = mode === 'proba' && (modelKey === 'lsvc_raw_1-2gramas' || probaDisplay === 'ranking');

  let modeLabel, modelLabel;
  if (mode === 'binary') {
    const optLabel = binaryOption === 'A' ? 'BR1-2-3 vs BR4-5' : 'BR1-2 vs BR3-4-5';
    modeLabel  = `${es ? 'Clasificación Binaria · Opción' : 'Binary Classification · Option'} ${binaryOption} (${optLabel})`;
    modelLabel = binaryOption === 'A' ? 'LinearSVC · 1-2gramas' : 'LinearSVC · 1-grama';
  } else {
    modeLabel  = es ? 'Distribución BI-RADS' : 'BI-RADS Distribution';
    modelLabel = isLinearSVC ? 'LinearSVC · scores (1-2gramas)' : 'MLP · 1-2gramas';
  }

  // ── Helper: formatear score con signo ─────────────────────────────────────
  function fmtScore(s) {
    if (s === null || s === undefined) return '—';
    return (s > 0 ? '+' : '') + Number(s).toFixed(3);
  }

  // ── Sección resultado ─────────────────────────────────────────────────────
  let resultHtml = '';

  // ── Modo binario ───────────────────────────────────────────────────────────
  if (mode === 'binary' && binaryResult) {
    const r = binaryResult;
    const isPos = r.prediction === 1;
    const color = isPos ? '#ea580c' : '#16a34a';
    const optLabel = r.option === 'A' ? 'BR1-2-3 vs BR4-5' : 'BR1-2 vs BR3-4-5';

    const metricCards = [
      ['recall',      es ? 'Sensibilidad'  : 'Sensitivity',  '#6366f1'],
      ['specificity', es ? 'Especificidad' : 'Specificity',  '#0891b2'],
      ['f1',          'F1-score',                            '#7c3aed'],
    ].map(([k, label, mc]) => {
      const val = r[k];
      return `<div style="text-align:center;padding:11px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:9px">
        <div style="font-size:22px;font-weight:800;color:${mc};font-family:'IBM Plex Mono',monospace;line-height:1">${val != null ? val : '—'}<span style="font-size:12px;font-weight:400">${val != null ? '%' : ''}</span></div>
        <div style="font-size:10px;color:#64748b;margin-top:4px;font-weight:600">${label}</div>
        <div style="font-size:9px;color:#94a3b8;margin-top:2px">${es ? 'en prueba' : 'on test set'}</div>
      </div>`;
    }).join('');

    resultHtml = `
      <div style="display:flex;align-items:center;gap:16px;padding:16px 20px;background:${color}0d;border:1px solid ${color}33;border-radius:10px;margin-bottom:14px">
        <div>
          <div style="font-size:9.5px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">
            ${es ? 'Clasificación binaria · Opción' : 'Binary classification · Option'} ${r.option} · ${optLabel}
          </div>
          <div style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-.4px">${r.class_name || '—'}</div>
        </div>
        <div style="margin-left:auto;text-align:right">
          <div style="font-size:10px;color:#64748b;margin-bottom:2px">${es ? 'Confianza' : 'Confidence'}</div>
          <div style="font-size:28px;font-weight:800;color:${color};font-family:'IBM Plex Mono',monospace;line-height:1">${r.confidence != null ? r.confidence : '—'}%</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${metricCards}</div>`;

  // ── Modo proba ─────────────────────────────────────────────────────────────
  } else if (mode === 'proba' && results && topCat !== null && BIRADS) {
    const d = BIRADS[topCat];
    if (d) {

      // ── LinearSVC: ranking por score, % solo como referencia ─────────────
      if (isLinearSVC && rawScores) {
        const topScore = rawScores[String(topCat)] ?? 0;
        const maxAbsScore = Math.max(...[1,2,3,4,5].map(c => Math.abs(rawScores[String(c)] ?? 0)), 1);

        const ranked = [1,2,3,4,5]
          .map(cat => ({ cat, score: rawScores[String(cat)] ?? null, pct: results[cat] || 0 }))
          .sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));

        const rows = ranked.map(({ cat, score, pct }, idx) => {
          const bd = BIRADS[cat];
          if (!bd) return '';
          const isTop = cat === topCat;
          const barW = score !== null ? Math.round((Math.max(score, 0) / maxAbsScore) * 100) : 0;
          const scoreNeg = score !== null && score < 0;
          return `<tr style="background:${isTop ? bd.color + '0d' : 'transparent'}">
            <td style="padding:7px 10px;font-weight:700;color:${isTop ? bd.color : '#94a3b8'};font-size:10px">#${idx + 1}</td>
            <td style="padding:7px 10px">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${bd.color};margin-right:6px;vertical-align:middle;box-shadow:${isTop ? '0 0 6px ' + bd.color : 'none'}"></span>
              <span style="font-weight:${isTop ? 700 : 500};color:${isTop ? '#0f172a' : '#475569'};font-size:11.5px">${bd.label} · ${es ? bd.es : bd.en}</span>
            </td>
            <td style="padding:7px 14px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:${isTop ? 800 : 400};color:${scoreNeg ? '#94a3b8' : (isTop ? bd.color : '#475569')}">${fmtScore(score)}</td>
            <td style="padding:7px 16px;min-width:100px">
              <div style="height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden">
                <div style="height:100%;background:${bd.color};width:${barW}%;border-radius:3px"></div>
              </div>
            </td>
            <td style="padding:7px 10px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:#94a3b8">${pct}%*</td>
          </tr>`;
        }).join('');

        resultHtml = `
          <div style="display:flex;align-items:center;gap:16px;padding:16px 20px;background:${d.color}0d;border:1px solid ${d.color}33;border-radius:10px;margin-bottom:14px">
            <div>
              <div style="font-size:9.5px;font-weight:700;color:${d.color};text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">
                ${es ? 'Categoría con mayor score · LinearSVC' : 'Top score category · LinearSVC'}
              </div>
              <div style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-.4px">${d.label} · ${es ? d.es : d.en}</div>
            </div>
            <div style="margin-left:auto;text-align:right">
              <div style="font-size:10px;color:#64748b;margin-bottom:4px">Score</div>
              <div style="font-size:32px;font-weight:800;font-family:'IBM Plex Mono',monospace;color:${d.color};line-height:1;letter-spacing:-1px">${fmtScore(topScore)}</div>
            </div>
          </div>
          <div style="font-size:9.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">
            ${es ? 'Ranking del clasificador' : 'Classifier ranking'}
          </div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
            <thead>
              <tr style="background:#f8fafc">
                <th style="padding:7px 10px;text-align:left;font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.5px">#</th>
                <th style="padding:7px 10px;text-align:left;font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.5px">${es ? 'Categoría' : 'Category'}</th>
                <th style="padding:7px 14px;text-align:right;font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Score</th>
                <th style="padding:7px 10px;min-width:100px"></th>
                <th style="padding:7px 10px;text-align:right;font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.5px">%*</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="font-size:9.5px;color:#94a3b8;margin-top:8px;line-height:1.55">
            ${es
              ? '* Los porcentajes son softmax normalizados sobre los scores — <strong style="color:#64748b">no son probabilidades calibradas</strong>. El score refleja la distancia al hiperplano de decisión: positivo = favorece la clase, negativo = la rechaza.'
              : '* Percentages are softmax-normalized scores — <strong style="color:#64748b">not calibrated probabilities</strong>. Score reflects distance to the decision hyperplane: positive = favors the class, negative = rejects it.'}
          </p>`;

      // ── MLP: distribución completa (grid) + tabla de ranking ─────────────
      } else {
        const pct = results[topCat];

        const confBar = confidence
          ? `<div style="display:flex;align-items:center;gap:12px;padding:9px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:14px">
              <span style="font-size:9.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px;min-width:80px">${es ? 'Confianza ML' : 'ML Confidence'}</span>
              <div style="flex:1;height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden"><div style="height:100%;background:${confidence.color};width:${confidence.pct}%;border-radius:3px"></div></div>
              <span style="font-size:12px;font-weight:700;color:${confidence.color};min-width:70px;text-align:right">${es ? confidence.labelEs : confidence.labelEn} (${confidence.pct}%)</span>
            </div>`
          : '';

        const cards = [0, 1, 2, 3, 4, 5].map((cat) => {
          const bd = BIRADS[cat];
          if (!bd) return '';
          const p = results[cat];
          const isTop = cat === topCat;
          return `<div style="border-radius:9px;padding:12px 14px;border:1px solid ${isTop ? bd.color + '55' : '#e2e8f0'};background:${isTop ? bd.color + '10' : '#f8fafc'}">
            <div style="font-size:11.5px;font-weight:700;color:${isTop ? bd.color : '#475569'};margin-bottom:4px">${bd.label}</div>
            <div style="font-size:28px;font-weight:800;font-family:'IBM Plex Mono',monospace;color:${isTop ? bd.color : '#1e293b'};line-height:1;letter-spacing:-1px">${p}<span style="font-size:12px;font-weight:400">%</span></div>
            <div style="font-size:10.5px;color:#64748b;margin:4px 0 8px">${es ? bd.es : bd.en}</div>
            <div style="height:3px;background:#e9ecef;border-radius:2px;overflow:hidden">
              <div style="height:100%;background:${bd.color};width:${p}%;border-radius:2px"></div>
            </div>
          </div>`;
        }).join('');

        const ranked = [1, 2, 3, 4, 5]
          .map(cat => ({ cat, pct: results[cat] || 0 }))
          .sort((a, b) => b.pct - a.pct);

        const rankRows = ranked.map(({ cat, pct: p }, idx) => {
          const bd = BIRADS[cat];
          if (!bd) return '';
          const isTop = cat === topCat;
          return `<tr style="background:${isTop ? bd.color + '0d' : 'transparent'}">
            <td style="padding:7px 10px;font-weight:700;color:${isTop ? bd.color : '#94a3b8'};font-size:10px">#${idx + 1}</td>
            <td style="padding:7px 10px">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${bd.color};margin-right:6px;vertical-align:middle;box-shadow:${isTop ? '0 0 6px ' + bd.color : 'none'}"></span>
              <span style="font-weight:${isTop ? 700 : 500};color:${isTop ? '#0f172a' : '#475569'};font-size:11.5px">${bd.label} · ${es ? bd.es : bd.en}</span>
            </td>
            <td style="padding:7px 14px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:${isTop ? 800 : 400};color:${isTop ? bd.color : '#475569'}">${p}%</td>
            <td style="padding:7px 16px;min-width:110px">
              <div style="height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden">
                <div style="height:100%;background:${bd.color};width:${p}%;border-radius:3px"></div>
              </div>
            </td>
          </tr>`;
        }).join('');

        resultHtml = `
          <div style="display:flex;align-items:center;gap:16px;padding:16px 20px;background:${d.color}0d;border:1px solid ${d.color}33;border-radius:10px;margin-bottom:14px">
            <div>
              <div style="font-size:9.5px;font-weight:700;color:${d.color};text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">
                ${es ? 'Categoría con mayor probabilidad' : 'Highest probability category'}
              </div>
              <div style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-.4px">${d.label} · ${es ? d.es : d.en}</div>
            </div>
            <div style="margin-left:auto;text-align:right">
              <div style="font-size:36px;font-weight:800;font-family:'IBM Plex Mono',monospace;color:${d.color};line-height:1;letter-spacing:-2px">${pct}<span style="font-size:16px;font-weight:400">%</span></div>
              <div style="font-size:10px;color:#64748b;margin-top:2px">${es ? 'probabilidad' : 'probability'}</div>
            </div>
          </div>
          ${confBar}
          <div style="font-size:9.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px">
            ${es ? 'Distribución completa de probabilidades' : 'Full probability distribution'}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">${cards}</div>
          <div style="font-size:9.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">
            ${es ? 'Ranking del clasificador (BI-RADS 1–5)' : 'Classifier ranking (BI-RADS 1–5)'}
          </div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
            <thead>
              <tr style="background:#f8fafc">
                <th style="padding:7px 10px;text-align:left;font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.5px">#</th>
                <th style="padding:7px 10px;text-align:left;font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.5px">${es ? 'Categoría' : 'Category'}</th>
                <th style="padding:7px 14px;text-align:right;font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.5px">${es ? 'Probabilidad' : 'Probability'}</th>
                <th style="padding:7px 10px;min-width:110px"></th>
              </tr>
            </thead>
            <tbody>${rankRows}</tbody>
          </table>`;
      }
    }
  }

  if (!resultHtml) {
    resultHtml = `<p style="color:#94a3b8;font-style:italic">${es ? 'Sin resultado disponible.' : 'No result available.'}</p>`;
  }

  // ── Texto analizado (sin max-height — muestra completo) ───────────────────
  const escapedText = (text || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const textSection = escapedText.trim()
    ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;font-size:12px;line-height:1.7;color:#334155;white-space:pre-wrap;word-break:break-word;font-family:'IBM Plex Mono',monospace">${escapedText}</div>`
    : `<p style="color:#94a3b8;font-style:italic">${es ? 'Sin texto ingresado.' : 'No text entered.'}</p>`;

  // ── HTML completo ──────────────────────────────────────────────────────────
  const logoSrc = (window.location.origin || '') + '/assets/logos/logo-pdf.png';

  const html = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8">
  <title>${es ? 'Reporte BI-RADS' : 'BI-RADS Report'} #${reportId}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Helvetica,sans-serif;color:#0f172a;padding:36px 44px;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:13px}
    @page{size:A4;margin:18mm}
    @media print{body{padding:0}}
    .sec-label{font-size:9.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;display:flex;align-items:center;gap:8px}
    .sec-label::after{content:'';flex:1;height:1px;background:#e2e8f0}
    .section{margin-bottom:20px;padding-bottom:18px;border-bottom:1px solid #f1f5f9}
    .section:last-child{border-bottom:none}
    table tr:not(:last-child) td{border-bottom:1px solid #f1f5f9}
  </style></head><body>

  <!-- § Encabezado -->
  <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:16px;border-bottom:2px solid #1a3a6e;margin-bottom:14px">
    <div style="display:flex;align-items:center;gap:12px">
      <img src="${logoSrc}" width="36" height="36" alt="Logo"
        style="display:block;flex-shrink:0;border-radius:8px"
        onerror="this.style.display='none';var f=document.getElementById('logo-fb');if(f)f.style.display='flex'">
      <div id="logo-fb" style="display:none;width:36px;height:36px;background:#1a3a6e;border-radius:8px;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M3 14V7l6-4 6 4v7" stroke="white" stroke-width="1.5" stroke-linejoin="round"/><rect x="6.5" y="9" width="5" height="5" rx="0.5" stroke="white" stroke-width="1.3"/></svg>
      </div>
      <div>
        <div style="font-weight:800;font-size:15px;color:#0f172a">${es ? 'Sistema ML de Apoyo BI-RADS' : 'BI-RADS ML Support System'}</div>
        <div style="font-size:11.5px;color:#64748b;margin-top:2px">${es ? 'Reporte de Clasificación Asistida por IA' : 'AI-Assisted Classification Report'}</div>
      </div>
    </div>
    <div style="text-align:right">
      <div style="font-size:11px;color:#64748b;font-weight:600">${date}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:3px">${es ? 'Reporte' : 'Report'} #${reportId}</div>
    </div>
  </div>

  <!-- § Barra modelo / configuración -->
  <div style="display:flex;gap:20px;padding:8px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:16px;font-size:10.5px;flex-wrap:wrap;align-items:center">
    <div><span style="color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.4px;font-size:9px;margin-right:5px">${es ? 'MODO' : 'MODE'}</span><span style="color:#1e293b;font-weight:600">${modeLabel}</span></div>
    <span style="color:#e2e8f0">|</span>
    <div><span style="color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.4px;font-size:9px;margin-right:5px">${es ? 'MODELO' : 'MODEL'}</span><span style="color:#1e293b;font-weight:600">${modelLabel}</span></div>
  </div>

  <!-- § Advertencia clínica -->
  <div style="display:flex;gap:10px;align-items:flex-start;padding:10px 14px;background:rgba(217,119,6,0.06);border:1px solid rgba(217,119,6,0.28);border-radius:9px;margin-bottom:20px">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:1px"><path d="M8 2L14 13H2L8 2Z" stroke="#b45309" stroke-width="1.4" stroke-linejoin="round"/><line x1="8" y1="7" x2="8" y2="10" stroke="#b45309" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="12" r="0.8" fill="#b45309"/></svg>
    <p style="font-size:11px;color:#92400e;line-height:1.55">${
      es
        ? 'Herramienta de apoyo clínico. El diagnóstico final debe ser emitido por un médico radiólogo certificado. No reemplaza el juicio del especialista.'
        : 'Clinical decision support tool. Final diagnosis must be issued by a certified radiologist. This does not replace specialist judgment.'
    }</p>
  </div>

  <!-- § Resultado -->
  <div class="section">
    <div class="sec-label">${es ? '1 · Resultado del modelo' : '1 · Model result'}</div>
    ${resultHtml}
  </div>

  <!-- § Texto analizado -->
  <div class="section">
    <div class="sec-label">${es ? '2 · Texto analizado' : '2 · Analyzed text'}</div>
    ${textSection}
  </div>

  <!-- § Pie -->
  <div style="padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
    <p style="font-size:10px;color:#94a3b8">${es ? 'Sistema ML de Apoyo BI-RADS · Solo referencia clínica' : 'BI-RADS ML Support System · Clinical reference only'}</p>
    <p style="font-size:10px;color:#94a3b8">#${reportId}</p>
  </div>

  <script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script>
  </body></html>`;

  try {
    const win = window.open('', '_blank');
    if (!win) throw new Error('blocked');
    win.document.write(html);
    win.document.close();
  } catch (_) {
    alert(es
      ? 'No se pudo abrir el PDF. Permite las ventanas emergentes para este sitio e intenta de nuevo.'
      : 'Could not open the PDF. Allow popups for this site and try again.');
  }
};

/**
 * Copia un resumen en texto plano al portapapeles.
 */
window.copyResults = function copyResults(data, topCat, lang) {
  const BIRADS = window.BIRADS;
  const es = lang === 'es';
  const date = new Date().toLocaleDateString(
    es ? 'es-MX' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const header = [
    es ? 'Sistema ML de Apoyo BI-RADS' : 'BI-RADS ML Support System',
    `${es ? 'Fecha' : 'Date'}: ${date}`,
    '',
  ];

  let body = [];

  if (data && data.prediction !== undefined) {
    const r = data;
    body = [
      `${es ? 'Clasificación binaria · Opción' : 'Binary classification · Option'} ${r.option}`,
      `${es ? 'Resultado' : 'Result'}: ${r.class_name}`,
      `${es ? 'Confianza' : 'Confidence'}: ${r.confidence ?? '—'}%`,
      ...(r.recall      != null ? [`${es ? 'Sensibilidad'  : 'Sensitivity'}: ${r.recall}%`]      : []),
      ...(r.specificity != null ? [`${es ? 'Especificidad' : 'Specificity'}: ${r.specificity}%`] : []),
      ...(r.f1          != null ? [`F1-score: ${r.f1}%`]                                          : []),
    ];
  } else if (data && topCat !== null && BIRADS) {
    const d = BIRADS[topCat];
    body = [
      `${es ? 'Categoría con mayor probabilidad' : 'Most probable category'}: ${d?.label} — ${es ? d?.es : d?.en} (${data[topCat]}%)`,
      '',
      `${es ? 'Distribución de probabilidades' : 'Probability distribution'}:`,
      ...[0, 1, 2, 3, 4, 5].map(
        (c) => `  ${BIRADS[c]?.label} (${es ? BIRADS[c]?.es : BIRADS[c]?.en}): ${data[c]}%`
      ),
    ];
  } else {
    body = [es ? 'Sin resultado disponible.' : 'No result available.'];
  }

  const footer = [
    '',
    es
      ? 'Aviso: Sistema de apoyo a la decisión. El diagnóstico final debe ser emitido por un radiólogo certificado.'
      : 'Notice: Decision support system. Final diagnosis must be issued by a certified radiologist.',
  ];

  navigator.clipboard.writeText([...header, ...body, ...footer].join('\n')).catch(() => {});
};
