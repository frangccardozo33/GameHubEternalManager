/* =============================================================================
   LFO TV PANEL — Ajustes finos de la "televisión"
   Añade un panel flotante sobre el viewport para regular en vivo:
     desenfoque, desenfoque de movimiento, scanlines, curvatura del tubo,
     sangrado de color, ruido, bloom, viñeta, entrelazado y temblor de señal.
   Escribe en window.LFO_RETRO_CFG, que el shader lee cada frame.
   ========================================================================== */
(function (g) {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const H = (s) => { const d = document.createElement('div'); d.innerHTML = s.trim(); return d.firstElementChild; };

  const CFG_KEY = 'lfo.tv.cfg';
  const DIALS = [
    ['blur',      'Desenfoque',            0, 2.5, 0.05],
    ['motion',    'Desenf. de movimiento', 0, 0.95, 0.01],
    ['scan',      'Líneas de barrido',     0, 1.6, 0.05],
    ['curve',     'Curvatura del tubo',    0, 1.6, 0.05],
    ['chroma',    'Sangrado de color',     0, 2.2, 0.05],
    ['noise',     'Ruido / grano',         0, 2.2, 0.05],
    ['bloom',     'Brillo del fósforo',    0, 2.0, 0.05],
    ['vignette',  'Viñeta',                0, 1.8, 0.05],
    ['interlace', 'Entrelazado',           0, 1.5, 0.05],
    ['wobble',    'Temblor de señal',      0, 2.5, 0.05],
  ];

  /* Valores por defecto = preset TV 2011 · digital */
  const cfg = (g.LFO_RETRO_CFG = g.LFO_RETRO_CFG || {
    enabled: 1, blur: 0.7, motion: 0.34, scan: 0.55, curve: 0.45,
    chroma: 0.45, noise: 0.4, bloom: 0.8, vignette: 0.6, interlace: 0.35, wobble: 0.3,
  });
  try {
    const saved = JSON.parse(localStorage.getItem(CFG_KEY) || 'null');
    if (saved) Object.assign(cfg, saved);
  } catch (e) {}

  const save = () => { try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) {} };

  function push() {
    try {
      const v = g.lfoArchive && g.lfoArchive.view;
      if (v) { if (v.retroCfg) Object.assign(v.retroCfg, cfg); else v.retroCfg = cfg; }
    } catch (e) {}
    document.body.classList.toggle('lfo-crt-off', !cfg.enabled);
  }

  let panel = null, btn = null;

  function build() {
    const vp = $('viewport'); if (!vp || btn) return;

    btn = H(`<button class="lfo-tv-btn" title="Ajustes de televisión" aria-label="Ajustes de televisión">TV</button>`);
    vp.appendChild(btn);

    panel = H(`<div class="lfo-tv-panel" hidden>
      <div class="tvp-head"><b>SEÑAL DE TELEVISIÓN</b><button class="tvp-x" aria-label="Cerrar">✕</button></div>
      <label class="tvp-row tvp-switch">
        <span>Filtro de TV</span>
        <input type="checkbox" id="lfo-tv-on">
      </label>
      <div class="tvp-presets">
        <button data-p="tv2004">2004</button>
        <button data-p="tv2011">2011</button>
        <button data-p="vhs">VHS</button>
        <button data-p="clean">Limpia</button>
      </div>
      <div class="tvp-dials">${DIALS.map(([k, lbl, mn, mx, st]) => `
        <label class="tvp-row">
          <span>${lbl}<i data-v="${k}">${(cfg[k] ?? 1).toFixed(2)}</i></span>
          <input type="range" data-k="${k}" min="${mn}" max="${mx}" step="${st}" value="${cfg[k] ?? 1}">
        </label>`).join('')}</div>
      <p class="tvp-note">Los valores se guardan en este navegador. El paquete gráfico se elige
      en “SEÑAL DE ARCHIVO”, debajo de la cancha.</p>
    </div>`);
    vp.appendChild(panel);

    const onBox = panel.querySelector('#lfo-tv-on');
    onBox.checked = !!cfg.enabled;
    onBox.addEventListener('change', () => { cfg.enabled = onBox.checked ? 1 : 0; push(); save(); });

    panel.querySelectorAll('.tvp-presets button').forEach((b) => {
      b.addEventListener('click', () => {
        if (g.LFOBroadcast) g.LFOBroadcast.setRetro(b.dataset.p);
        // refleja los nuevos valores en los deslizadores
        panel.querySelectorAll('input[type=range]').forEach((r) => {
          r.value = cfg[r.dataset.k] ?? 1;
          const out = panel.querySelector(`i[data-v="${r.dataset.k}"]`);
          if (out) out.textContent = Number(r.value).toFixed(2);
        });
        onBox.checked = !!cfg.enabled;
        const sel = $('archive-style'); if (sel) sel.value = b.dataset.p;
      });
    });

    panel.querySelectorAll('input[type=range]').forEach((r) => {
      r.addEventListener('input', () => {
        cfg[r.dataset.k] = Number(r.value);
        const out = panel.querySelector(`i[data-v="${r.dataset.k}"]`);
        if (out) out.textContent = Number(r.value).toFixed(2);
        push(); save();
      });
    });

    const toggle = () => { panel.hidden = !panel.hidden; };
    btn.addEventListener('click', toggle);
    panel.querySelector('.tvp-x').addEventListener('click', () => { panel.hidden = true; });

    push();
  }

  /* --- estilos del panel (inline para no depender de otro archivo) --- */
  const css = `
  .lfo-tv-btn{
    position:absolute;right:20px;bottom:152px;z-index:32;
    width:34px;height:26px;border-radius:3px;
    background:linear-gradient(180deg,#fff 0%,#e4e9ef 18%,#b9c2cc 48%,#8e99a5 52%,#cdd5de 78%,#fff 100%);
    color:#01274c;border:1px solid #fff;cursor:pointer;
    font:800 12px/1 "Barlow Condensed","Arial Narrow",sans-serif;letter-spacing:1px;
    box-shadow:0 3px 9px #0009;
  }
  .lfo-tv-btn:hover{box-shadow:0 0 14px #7fb2e5aa,0 3px 9px #0009}
  .lfo-tv-panel{
    position:absolute;right:20px;bottom:186px;z-index:33;
    width:252px;max-height:calc(100% - 210px);overflow-y:auto;
    background:linear-gradient(170deg,#0f3157f7,#061727f7);
    border:1px solid #2f6096;border-radius:5px;
    padding:10px 12px 12px;
    font-family:"Barlow Condensed","Arial Narrow",sans-serif;
    color:#dceaf8;box-shadow:0 14px 34px #000c;
    -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);
    pointer-events:auto;
  }
  .lfo-tv-panel[hidden]{display:none!important}
  .lfo-tv-panel .tvp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
  .lfo-tv-panel .tvp-head b{
    font-size:11px;letter-spacing:.2em;font-weight:800;color:#01274c;
    background:linear-gradient(180deg,#fff,#c9d2db 50%,#fff);padding:3px 8px;border-radius:2px;
  }
  .lfo-tv-panel .tvp-x{background:none;border:0;color:#9dc0e0;cursor:pointer;font-size:14px;padding:0 2px}
  .lfo-tv-panel .tvp-x:hover{color:#fff}
  .lfo-tv-panel .tvp-presets{display:flex;gap:4px;margin-bottom:10px}
  .lfo-tv-panel .tvp-presets button{
    flex:1;font:700 10px/1 inherit;letter-spacing:.08em;text-transform:uppercase;
    background:linear-gradient(180deg,#0f4275,#02203d);color:#dceaf8;
    border:1px solid #3b6e9f;border-radius:3px;padding:5px 0;cursor:pointer;
  }
  .lfo-tv-panel .tvp-presets button:hover{
    background:linear-gradient(180deg,#fff,#c9d2db 50%,#fff);color:#01274c;border-color:#fff;
  }
  .lfo-tv-panel .tvp-row{display:block;margin-bottom:7px}
  .lfo-tv-panel .tvp-row > span{
    display:flex;justify-content:space-between;align-items:baseline;
    font-size:11px;letter-spacing:.04em;color:#b6d7f6;margin-bottom:2px;
  }
  .lfo-tv-panel .tvp-row > span i{font-style:normal;color:#fff;font-weight:700;font-variant-numeric:tabular-nums}
  .lfo-tv-panel input[type=range]{
    width:100%;height:4px;appearance:none;-webkit-appearance:none;
    background:#062440;border:1px solid #3b6e9f;border-radius:2px;outline:none;
  }
  .lfo-tv-panel input[type=range]::-webkit-slider-thumb{
    -webkit-appearance:none;width:12px;height:16px;border-radius:2px;cursor:pointer;
    background:linear-gradient(180deg,#fff,#c9d2db 50%,#fff);border:1px solid #fff;
    box-shadow:0 1px 4px #0009;
  }
  .lfo-tv-panel input[type=range]::-moz-range-thumb{
    width:12px;height:16px;border-radius:2px;cursor:pointer;
    background:linear-gradient(180deg,#fff,#c9d2db 50%,#fff);border:1px solid #fff;
  }
  .lfo-tv-panel .tvp-switch{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
  .lfo-tv-panel .tvp-switch > span{margin:0;font-size:12px;color:#fff;font-weight:700;letter-spacing:.1em}
  .lfo-tv-panel .tvp-switch input{accent-color:#7fb2e5;width:16px;height:16px;cursor:pointer}
  .lfo-tv-panel .tvp-note{
    margin:10px 0 0;font-size:10px;line-height:1.5;color:#8fb0cd;
    border-top:1px dashed #2f6096;padding-top:7px;
  }
  @media(max-width:640px){
    .lfo-tv-btn{right:14px;bottom:118px}
    .lfo-tv-panel{right:10px;left:10px;width:auto;bottom:152px}
  }`;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  g.LFOTvPanel = { cfg, push, open() { panel && (panel.hidden = false); } };

  function boot() { build(); setTimeout(push, 500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
