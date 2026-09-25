/* LFO MANAGER — utilidades base: RNG con estado serializable, hash determinista, helpers.
   Todo el núcleo TLM es JS puro (sin DOM) para poder probarlo en Node y reutilizarlo en el navegador. */
(function (g) {
  'use strict';
  const TLM = (g.TLM = g.TLM || {});

  // mulberry32 con estado serializable (state.rngState) — misma semilla + mismas acciones = mismo mundo.
  class RNG {
    constructor(seed) { this.s = seed >>> 0; }
    next() {
      let t = (this.s += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    range(a, b) { return a + this.next() * (b - a); }
    int(a, b) { return Math.floor(this.range(a, b + 1)); }
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
    chance(p) { return this.next() < p; }
    gauss() { let u = 0, v = 0; while (!u) u = this.next(); while (!v) v = this.next(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    weighted(items, w) {
      let tot = 0; for (const x of items) tot += w(x);
      if (tot <= 0) return items[0];
      let r = this.next() * tot;
      for (const x of items) { r -= w(x); if (r <= 0) return x; }
      return items[items.length - 1];
    }
    shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  }

  // Hash FNV-1a → [0,1). Sirve para ruido DETERMINISTA por (jugador, club, temporada...) sin consumir el RNG global:
  // las negociaciones son "deterministas + variables": el mismo caso da la misma respuesta, casos distintos varían.
  function hash01(...parts) {
    let h = 2166136261;
    const s = parts.join('|');
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const round = (v) => Math.round(v);
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const clone = (o) => (typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));
  const money = (v) => {
    const a = Math.abs(v), s = v < 0 ? '-' : '';
    if (a >= 1e6) return s + '€' + (a / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.?0+$/, '') + 'M';
    if (a >= 1e3) return s + '€' + Math.round(a / 1e3) + 'K';
    return s + '€' + Math.round(a);
  };
  const roundMoney = (v) => (v >= 5e6 ? Math.round(v / 1e5) * 1e5 : v >= 1e6 ? Math.round(v / 5e4) * 5e4 : v >= 1e5 ? Math.round(v / 1e4) * 1e4 : Math.round(v / 1e3) * 1e3);

  // Contadores de ID por tipo: los IDs de jugador son globales y nunca se reutilizan.
  function nextId(state, kind, prefix) {
    state.counters[kind] = (state.counters[kind] || 0) + 1;
    return (prefix || kind) + '_' + (state.counters[kind] + (kind === 'player' ? 1000 : 0));
  }

  // Bus de eventos mínimo (Career → UI / Broadcast). No hay estado global oculto: cada Career tiene el suyo.
  class Bus {
    constructor() { this.h = {}; }
    on(t, f) { (this.h[t] = this.h[t] || []).push(f); return () => { this.h[t] = this.h[t].filter((x) => x !== f); }; }
    emit(t, p) { for (const f of this.h[t] || []) { try { f(p); } catch (e) { if (g.console) console.error('[TLM bus]', t, e); } } for (const f of this.h['*'] || []) { try { f(t, p); } catch (e) {} } }
  }

  Object.assign(TLM, { RNG, hash01, clamp, round, avg, clone, money, roundMoney, nextId, Bus });
})(typeof globalThis !== 'undefined' ? globalThis : this);
