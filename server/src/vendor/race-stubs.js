// Entorno mínimo para correr el motor de carreras (07-carreras-apex/engine.js) sin navegador: DOM y renderizado son "mudos";
// la física usa THREE real (curvas y vectores), que no necesita WebGL.
const make = () => {
  const target = function () {};
  const p = new Proxy(target, {
    get(t, k) { if (k === Symbol.toPrimitive) return () => 0; if (k === 'length') return 0; if (k === Symbol.iterator) return function* () {}; if (k === 'then') return undefined; return p; },
    set() { return true; }, apply() { return p; }, construct() { return p; }, has() { return true; },
  });
  return p;
};
export const dummy = make();
export function makeEnv(THREE, roster) {
  const base = { THREE: Object.assign(Object.create(THREE), { WebGLRenderer: function () { return dummy; } }), devicePixelRatio: 1 };
  const window = new Proxy(base, { get: (t, k) => (k in t ? t[k] : dummy), set: (t, k, v) => { t[k] = v; return true; }, has: () => true });
  window.window = window;
  const store = {};
  const localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  return { window, document: dummy, localStorage };
}
