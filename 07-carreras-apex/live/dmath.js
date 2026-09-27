// Math determinista para el motor de fútbol en vivo (lockstep). Math.hypot/sin/cos/atan/atan2/exp/pow no dan el mismo resultado
// bit a bit en todos los motores de JavaScript (Node, Chrome, Firefox, Safari, Workers), y el motor de partido es caótico: una diferencia
// de 1 ulp se amplifica hasta que servidor y clientes juegan partidos distintos. Acá esas funciones se calculan solo con + - * / y
// Math.sqrt/floor/abs (exactas por IEEE-754), con los algoritmos de fdlibm, así que dan lo mismo en todos lados.
// El resto de Math (abs, min, max, sign, round, floor, ceil, sqrt, imul, PI...) ya es exacto y se reutiliza.
const f64 = new Float64Array(1), u32 = new Uint32Array(f64.buffer);
const PI = 3.141592653589793, PIO2 = 1.5707963267948966, PI_LO = 1.2246467991473532e-16;

const PIO2_1 = 1.57079632673412561417e+00, PIO2_1T = 6.07710050650619224932e-11, TWO_OVER_PI = 6.36619772367581382433e-01;
const S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03, S3 = -1.98412698298579493134e-04, S4 = 2.75573137070700676789e-06, S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;
const C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03, C3 = 2.48015872894767294178e-05, C4 = -2.75573143513906633035e-07, C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;
const kSin = (x) => { const z = x * x, r = S2 + z * (S3 + z * (S4 + z * (S5 + z * S6))), v = z * x; return x + v * (S1 + z * r); };
const kCos = (x) => { const z = x * x, r = z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6))))), hz = 0.5 * z, w = 1.0 - hz; return w + (((1.0 - w) - hz) + (z * r)); };
function reduce(x) { const n = Math.round(x * TWO_OVER_PI); return [n, (x - n * PIO2_1) - n * PIO2_1T]; }
function sin(x) {
  if (!Number.isFinite(x)) return NaN;
  const [n, r] = reduce(x), q = ((n % 4) + 4) % 4;
  return q === 0 ? kSin(r) : q === 1 ? kCos(r) : q === 2 ? -kSin(r) : -kCos(r);
}
function cos(x) {
  if (!Number.isFinite(x)) return NaN;
  const [n, r] = reduce(x), q = ((n % 4) + 4) % 4;
  return q === 0 ? kCos(r) : q === 1 ? -kSin(r) : q === 2 ? -kCos(r) : kSin(r);
}

const ATANHI = [4.63647609000806093515e-01, 7.85398163397448278999e-01, 9.82793723247329054082e-01, 1.57079632679489655800e+00];
const ATANLO = [2.26987774529616870924e-17, 3.06161699786838301793e-17, 1.39033110312309984516e-17, 6.12323399573676603587e-17];
const AT = [3.33333333333329318027e-01, -1.99999999998764832476e-01, 1.42857142725034663711e-01, -1.11111104054623557880e-01, 9.09088713343650656196e-02, -7.69187620504482999495e-02, 6.66107313738753120669e-02, -5.83357013379057348645e-02, 4.97687799461593236017e-02, -3.65315727442169155270e-02, 1.62858201153657823623e-02];
function atan(x) {
  if (x !== x) return x;
  const neg = x < 0, ax = neg ? -x : x;
  if (ax >= 4.4e15) { const z = ATANHI[3] + ATANLO[3]; return neg ? -z : z; }
  let id, t;
  if (ax < 0.4375) { id = -1; t = x; }
  else if (ax < 1.1875) { if (ax < 0.6875) { id = 0; t = (2.0 * ax - 1.0) / (2.0 + ax); } else { id = 1; t = (ax - 1.0) / (ax + 1.0); } }
  else if (ax < 2.4375) { id = 2; t = (ax - 1.5) / (1.0 + 1.5 * ax); }
  else { id = 3; t = -1.0 / ax; }
  const z = t * t, w = z * z;
  const s1 = z * (AT[0] + w * (AT[2] + w * (AT[4] + w * (AT[6] + w * (AT[8] + w * AT[10]))))), s2 = w * (AT[1] + w * (AT[3] + w * (AT[5] + w * (AT[7] + w * AT[9]))));
  if (id < 0) return t - t * (s1 + s2);
  const r = ATANHI[id] - ((t * (s1 + s2) - ATANLO[id]) - t);
  return neg ? -r : r;
}
function atan2(y, x) {
  if (x !== x || y !== y) return NaN;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return Math.atan2(y, x); // casos con infinitos: no ocurren en el juego
  if (x === 1) return atan(y);
  const m = (x < 0 ? 2 : 0) | (y < 0 ? 1 : 0);
  if (y === 0) return m === 0 || m === 1 ? y : m === 2 ? PI : -PI;
  if (x === 0) return y < 0 ? -PIO2 : PIO2;
  const z = atan(Math.abs(y / x));
  return m === 0 ? z : m === 1 ? -z : m === 2 ? PI - (z - PI_LO) : (z - PI_LO) - PI;
}

const LN2HI = 6.93147180369123816490e-01, LN2LO = 1.90821492927058770002e-10, INVLN2 = 1.44269504088896338700e+00;
const EP1 = 1.66666666666666019037e-01, EP2 = -2.77777777770155933842e-03, EP3 = 6.61375632143793436117e-05, EP4 = -1.65339022054652515390e-06, EP5 = 4.13813679705723846039e-08;
function pow2(k) { // 2^k exacto (k entero en el rango normal)
  if (k > 1023) return Infinity; if (k < -1022) { let v = 2.2250738585072014e-308; for (let i = -1022; i > k; i--) v *= 0.5; return v; }
  u32[0] = 0; u32[1] = ((k + 1023) & 0x7ff) << 20; return f64[0];
}
function exp(x) {
  if (x !== x) return x; if (x > 709.782712893384) return Infinity; if (x < -745.1332191019411) return 0;
  const ax = x < 0 ? -x : x; let hi = x, lo = 0, k = 0;
  if (ax > 0.34657359027997264) { // 0.5 ln2
    if (ax < 1.0397207708399179) { k = x < 0 ? -1 : 1; hi = x - k * LN2HI; lo = k * LN2LO; }
    else { k = Math.trunc(INVLN2 * x + (x < 0 ? -0.5 : 0.5)); hi = x - k * LN2HI; lo = k * LN2LO; }
    x = hi - lo;
  } else if (ax < 3.725290298461914e-9) return 1 + x;
  const t = x * x, c = x - t * (EP1 + t * (EP2 + t * (EP3 + t * (EP4 + t * EP5))));
  if (k === 0) return 1 - ((x * c) / (c - 2.0) - x);
  const y = 1 - ((lo - (x * c) / (2.0 - c)) - hi);
  return y * pow2(k);
}
const LG1 = 6.666666666666735130e-01, LG2 = 3.999999999940941908e-01, LG3 = 2.857142874366239149e-01, LG4 = 2.222219843214978396e-01, LG5 = 1.818357216161805012e-01, LG6 = 1.531383769920937332e-01, LG7 = 1.479819860511658591e-01;
function log(x) {
  if (x !== x || x < 0) return NaN; if (x === 0) return -Infinity; if (x === Infinity) return x;
  let k = 0; if (x < 2.2250738585072014e-308) { x *= 18014398509481984; k -= 54; } // 2^54
  f64[0] = x; let hx = u32[1]; const lx = u32[0];
  k += (hx >> 20) - 1023; hx &= 0x000fffff;
  const i = (hx + 0x95f64) & 0x100000;
  u32[1] = hx | (i ^ 0x3ff00000); u32[0] = lx; const m = f64[0];
  k += i >> 20;
  const f = m - 1.0, s = f / (2.0 + f), z = s * s, w = z * z;
  const t1 = w * (LG2 + w * (LG4 + w * LG6)), t2 = z * (LG1 + w * (LG3 + w * (LG5 + w * LG7))), R = t2 + t1, hfsq = 0.5 * f * f;
  return k * LN2HI - ((hfsq - (s * (hfsq + R) + k * LN2LO)) - f);
}
function pow(x, y) {
  if (y === 0) return 1; if (y === 1) return x; if (x !== x || y !== y) return NaN;
  if (y === 2) return x * x; if (y === 0.5 && x >= 0) return Math.sqrt(x);
  if (Number.isInteger(y) && Math.abs(y) <= 64) { // multiplicación por cuadrados, en orden fijo
    let r = 1, b = x, e = Math.abs(y); while (e > 0) { if (e & 1) r *= b; b *= b; e = Math.floor(e / 2); }
    return y < 0 ? 1 / r : r;
  }
  if (x > 0) return exp(y * log(x));
  if (x === 0) return y > 0 ? 0 : Infinity;
  return Number.isInteger(y) ? (y % 2 === 0 ? 1 : -1) * exp(y * log(-x)) : NaN;
}
function hypot(...v) { let s = 0; for (let i = 0; i < v.length; i++) s += v[i] * v[i]; return Math.sqrt(s); }

const DM = {};
for (const k of Object.getOwnPropertyNames(Math)) DM[k] = Math[k];
Object.assign(DM, {
  sin, cos, tan: (x) => sin(x) / cos(x), atan, atan2, exp, log, pow, hypot,
  asin: (x) => atan2(x, Math.sqrt((1 - x) * (1 + x))), acos: (x) => atan2(Math.sqrt((1 - x) * (1 + x)), x),
  log2: (x) => log(x) * INVLN2, log10: (x) => log(x) * 0.4342944819032518, cbrt: (x) => (x < 0 ? -exp(log(-x) / 3) : x === 0 ? 0 : exp(log(x) / 3)),
  sinh: (x) => (exp(x) - exp(-x)) / 2, cosh: (x) => (exp(x) + exp(-x)) / 2, tanh: (x) => { const a = exp(x), b = exp(-x); return (a - b) / (a + b); },
  expm1: (x) => exp(x) - 1, log1p: (x) => log(1 + x),
});

window.DM = DM;
