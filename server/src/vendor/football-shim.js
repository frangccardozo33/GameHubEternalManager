// Entorno mínimo que esperan los scripts clásicos del fútbol (window, localStorage, eventos).
const g = globalThis;
if (!g.window) g.window = g;
const store = {};
if (!g.localStorage) g.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
if (typeof g.dispatchEvent !== 'function') g.dispatchEvent = () => true;
if (typeof g.CustomEvent !== 'function') g.CustomEvent = class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } };
