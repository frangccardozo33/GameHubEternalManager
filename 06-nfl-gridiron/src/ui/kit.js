import { esc, r1 } from '../manager/util.js';
export { esc };
export const ovrClass = o => o >= 85 ? 'elite' : o >= 75 ? 'good' : o >= 65 ? 'avg' : o >= 55 ? 'low' : 'poor';
export const ovrBadge = o => `<span class="ovr ${ovrClass(o)}">${o}</span>`;
export const plink = p => `<a class="plink" href="#/player/${p.id}">${esc(p.name)}</a>`;
export const posTag = pos => `<span class="pos pos-${pos}">${pos}</span>`;
export const bar = (v, max = 100, cls = '') => `<div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, v / max * 100))}%"></i></div>`;
export const chip = (t, cls = '') => `<span class="chip ${cls}">${t}</span>`;
export const record = r => `${r.w}-${r.l}${r.t ? '-' + r.t : ''}`;
export const inj = p => p.injury && p.injury.weeks > 0 ? `<span class="inj" title="${esc(p.injury.type)}">🩹 ${p.injury.weeks} sem</span>` : '';
export const tdot = t => `<span class="tdot" style="background:${t.color}"></span>`;
export const teamTag = t => `${tdot(t)}<b>${esc(t.short)}</b>`;
export const card = (title, body, { right = '', cls = '', id = '' } = {}) => `<section class="card ${cls}" ${id ? `id="${id}"` : ''}><div class="card-h"><h3>${title}</h3>${right}</div>${body}</section>`;
export const money = v => `$${r1(v).toFixed(1)}M`;
export const signed = v => (v > 0 ? '+' : '') + v;
// table({ cols:[{h, k|f, cls, sort}], rows, cls, empty })
export function table({ cols, rows, cls = '', empty = 'Sin datos' }) {
  if (!rows.length) return `<div class="empty">${empty}</div>`;
  return `<div class="tscroll"><table class="mtable ${cls}"><thead><tr>${cols.map(c => `<th class="${c.cls || ''}" ${c.sort ? `data-act="sort" data-key="${c.sort}"` : ''}>${c.h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr ${r._attr || ''}>${cols.map(c => `<td class="${c.cls || ''}">${c.f ? c.f(r) : r[c.k] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export const tabs = (items, active, act) => `<div class="mtabs">${items.map(([k, l]) => `<button class="${k === active ? 'on' : ''}" data-act="${act}" data-v="${k}">${l}</button>`).join('')}</div>`;
export const slider = ({ path, label, value, min = 0, max = 100, hint = '', lo = '', hi = '', act = 'gp-slider' }) => `<label class="slider"><span class="s-top"><b>${label}</b><em data-val="${path}">${value}</em></span><input type="range" min="${min}" max="${max}" value="${value}" data-input="${act}" data-path="${path}"><span class="s-ends"><small>${lo}</small><small>${hi}</small></span>${hint ? `<span class="s-hint">${hint}</span>` : ''}</label>`;
export const select = ({ path, label, value, options, act = 'gp-select' }) => `<label class="sel"><b>${label}</b><select data-change="${act}" data-path="${path}">${options.map(([k, l]) => `<option value="${k}" ${String(k) === String(value) ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
export const stat = (l, v, sub = '') => `<div class="stat"><span>${l}</span><strong>${v}</strong>${sub ? `<small>${sub}</small>` : ''}</div>`;
export const weekLabel = lg => { const w = lg.currentWeek(); return w ? w.label : 'Offseason'; };
