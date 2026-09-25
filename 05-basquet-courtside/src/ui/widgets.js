import { ATTR_LABELS, ATTR_GROUPS, ATTRIBUTES } from '../manager/data.js';
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const money = v => `${(+v).toFixed(1).replace('.', ',')} M€`;
export const signed = (v, d = 0) => (v > 0 ? '+' : '') + v.toFixed(d);
export const cls = v => (v > 0 ? 'pos' : v < 0 ? 'neg' : '');
export const meter = v => `<span class="meter ${v < 45 ? 'low' : v < 65 ? 'mid' : ''}"><i style="width:${Math.max(3, Math.min(100, v))}%"></i></span>${Math.round(v)}`;
export const pill = (t, k = '') => `<span class="pill ${k}">${esc(t)}</span>`;
export const dot = c => `<span class="dot" style="background:${c}"></span>`;
export const ovrColor = o => (o >= 85 ? '#86e0a4' : o >= 78 ? '#c8dc8a' : o >= 70 ? '#e9dfc7' : '#c99a8a');
export const link = (screen, arg, text) => `<a class="lnk" data-go="${screen}" data-arg="${esc(arg)}">${esc(text)}</a>`;
// Tabla ordenable. cols: {k,label,val(row)->valor ordenable,html(row)->celda,l:izquierda}
export function table(cols, rows, { sort, key, meId, rowAttrs, cut } = {}) {
  let list = [...rows]; const cur = sort?.[key];
  if (cur) { const c = cols.find(x => x.k === cur.k); if (c) list.sort((a, b) => { const x = c.val(a), y = c.val(b); return (typeof x === 'string' ? x.localeCompare(y) : x - y) * (cur.dir === 'asc' ? 1 : -1); }); }
  const head = cols.map(c => `<th class="${cur?.k === c.k ? 'sorted ' : ''}${c.l ? 'l' : ''}" ${c.val ? `data-sort="${c.k}" data-key="${key}"` : ''}>${c.label}${cur?.k === c.k ? (cur.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>`).join('');
  const body = list.map((r, i) => `<tr class="${meId != null && r.id === meId ? 'me' : ''} ${rowAttrs ? 'click' : ''} ${cut === i ? 'sep' : ''}" ${rowAttrs ? rowAttrs(r) : ''}>${cols.map(c => `<td${c.l ? ' class="l"' : ''}>${c.html ? c.html(r) : c.val(r)}</td>`).join('')}</tr>`).join('');
  return `<div class="scroll"><table class="tbl"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
export function radar(a, size = 210) {
  const ax = [['Tiro', (a.shooting + a.two + a.three) / 3], ['Interior', (a.finishing + a.physical) / 2], ['Creación', (a.handling + a.passing + a.vision) / 3], ['Defensa', (a.defense + a.interiorDefense) / 2], ['Rebote', a.rebounding], ['Atletismo', (a.speed + a.acceleration + a.stamina) / 3]];
  const c = size / 2, r = size / 2 - 34, pt = (i, v) => { const ang = -Math.PI / 2 + i * 2 * Math.PI / ax.length, k = (Math.max(30, v) - 30) / 70 * r; return [c + Math.cos(ang) * k, c + Math.sin(ang) * k]; };
  const rings = [0.33, 0.66, 1].map(f => `<polygon points="${ax.map((_, i) => pt(i, 30 + 70 * f).join(',')).join(' ')}" fill="none" stroke="#2f3d44"/>`).join('');
  const shape = ax.map(([, v], i) => pt(i, v).join(',')).join(' ');
  const labels = ax.map(([l, v], i) => { const [x, y] = pt(i, 108); return `<text x="${x}" y="${y}" fill="#9fb0b4" font-size="9" text-anchor="middle" dominant-baseline="middle">${l} ${Math.round(v)}</text>`; }).join('');
  return `<svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:${size + 40}px">${rings}<polygon points="${shape}" fill="rgba(237,128,80,.28)" stroke="#ed8050" stroke-width="2"/>${labels}</svg>`;
}
export function lineChart(points, { w = 320, h = 110, keys = ['ovr', 'pot'] } = {}) {
  if (points.length < 2) return '<p class="muted" style="font-size:11px">Se necesitan al menos dos temporadas para ver la evolución.</p>';
  const all = points.flatMap(p => keys.map(k => p[k])), lo = Math.min(...all) - 2, hi = Math.max(...all) + 2, x = i => 24 + i * (w - 40) / (points.length - 1), y = v => h - 18 - (v - lo) / (hi - lo || 1) * (h - 34);
  const colors = ['#ed8050', '#69b7b5'];
  const lines = keys.map((k, j) => `<polyline points="${points.map((p, i) => `${x(i)},${y(p[k])}`).join(' ')}" fill="none" stroke="${colors[j]}" stroke-width="2" ${j ? 'stroke-dasharray="4 3"' : ''}/>${points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p[k])}" r="2.5" fill="${colors[j]}"/>`).join('')}`).join('');
  const lab = points.map((p, i) => `<text x="${x(i)}" y="${h - 4}" fill="#7c898e" font-size="8" text-anchor="middle">T${p.s}</text><text x="${x(i)}" y="${y(p.ovr) - 6}" fill="#e9dfc7" font-size="9" text-anchor="middle">${p.ovr}</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%">${lines}${lab}</svg><div class="muted" style="font-size:9px"><span style="color:#ed8050">— OVR</span> &nbsp; <span style="color:#69b7b5">- - Potencial</span></div>`;
}
export function attrBars(a) {
  const mean = ATTRIBUTES.reduce((s, k) => s + a[k], 0) / ATTRIBUTES.length;
  return Object.entries(ATTR_GROUPS).map(([g, ks]) => `<div style="margin-bottom:10px"><div class="panel-title" style="margin-bottom:4px">${g}</div>${ks.map(k => `<div class="attr"><span>${ATTR_LABELS[k]}</span><div class="b"><i class="${a[k] >= mean + 6 ? 'hi' : a[k] <= mean - 8 ? 'lo' : ''}" style="width:${Math.max(4, a[k])}%"></i></div><b>${Math.round(a[k])}</b></div>`).join('')}</div>`).join('');
}
export const cmpRow = (label, a, b, fmtA = a, fmtB = b, lowerBetter = false) => { const t = (a + b) || 1, best = lowerBetter ? a < b : a > b; return `<div class="cmp"><b style="color:${best ? 'var(--home)' : ''}">${fmtA}</b><div><span>${label}</span><div class="bars"><i style="flex:${a / t || 0.5};background:var(--home)"></i><i style="flex:${b / t || 0.5};background:var(--away)"></i></div></div><b style="color:${!best && a !== b ? 'var(--away)' : ''}">${fmtB}</b></div>`; };
export const tabs = (list, cur, key) => `<div class="tabs">${list.map(([id, l]) => `<button class="${cur === id ? 'active' : ''}" data-set="${key}:${id}">${l}</button>`).join('')}</div>`;
