"""Genera la transmisión online de MMA a partir de la app local: assets/app-live.js (copia parcheada de app.js + simulador con Math
determinista + lockstep + online/live-client.js) y mma-live.html. Ejecutar tras tocar app.js:   python -X utf8 gen-live.py
"""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
js = open(os.path.join(HERE, 'assets', 'app.js'), encoding='utf8').read()


def rep(old, new):
    global js
    assert js.count(old) == 1, ('no encontrado o repetido: ' + old[:70], js.count(old))
    js = js.replace(old, new)


# 0) Math determinista en el simulador (hasta el inicio de la carrera): hypot/sin/cos difieren entre navegadores y servidor
cut = js.index('const no = "llo-mma-v1"')
head = re.sub(r'\bMath\.(hypot|sin|cos|atan2|atan|exp|log|pow|tan|asin|acos)\b', r'DM.\1', js[:cut])
js = head + js[cut:]
dm = open(os.path.join(HERE, '..', 'assets', 'common', 'dmath.mjs'), encoding='utf8').read().replace('export const DM = {};', 'const DM = {};')
js = dm + '\n' + js
# 1) el guardado de la carrera local no se toca desde la transmisión
rep('const no = "llo-mma-v1"', 'const no = "llo-mma-live-v1"')
# 2) el simulador lo avanza el conductor online con el reloj del servidor (no la velocidad ni la pausa locales)
rep('!this.paused && !this.preview && this.sim.advance(e * this.speed));',
    'window.LLO_LIVE ? window.LLO_LIVE.pump() : (!this.paused && !this.preview && this.sim.advance(e * this.speed)));')
rep('(Ue = new Km(e, i, { onFrame: rg })),', '(Ue = new Km(e, i, { onFrame: rg })), (window.LLO_LIVE && Object.defineProperty(Ue, "paused", { get() { return false; }, set(v) {} })),')
# 3) órdenes: solo la esquina, y viajan por el servidor (se aplican a todos en un paso futuro)
rep('(Pn.order(0, t.dataset.value), Ri("Orden enviada a tu esquina."))', 'window.LLO_LIVE ? (window.LLO_LIVE.order(t.dataset.value), Ri("Orden enviada a tu esquina.")) : (Pn.order(0, t.dataset.value), Ri("Orden enviada a tu esquina."))')
rep('t === "replay" ? "none" : ""', 't === "replay" || (window.LLO_LIVE && window.LLO_LIVE.side < 0) ? "none" : ""')
# 4) presentación previa: sin ella si entra con el combate empezado; al terminar, avisa al conductor
rep('if (b && Ue) {\n      llocd = {}; b.reset();', 'if (b && Ue && !(window.LLO_LIVE && window.LLO_LIVE.skipIntro)) {\n      llocd = {}; b.reset();')
rep('onDone: () => { if (Ue) Ue.paused = false; }, lines: [', 'onDone: () => { if (Ue) Ue.paused = false; window.LLO_LIVE && window.LLO_LIVE.preDone(); }, lines: [')
rep('t === "replay"\n          ? "Repetición determinista de un combate ya disputado"', 't === "live"\n          ? "Transmisión en vivo · Liga Lucha Online"\n          : t === "replay"\n          ? "Repetición determinista de un combate ya disputado"')
rep('competition: t === "career" ? "Fight night · Liga Lucha Online"', 'competition: t === "career" || t === "live" ? "Fight night · Liga Lucha Online"')
# 5) simulador + lockstep + cliente en vivo (mismo módulo: ve Hs, Ya, Ue...)
fb = open(os.path.join(HERE, '..', '01-futbol', 'online', 'lockstep.mjs'), encoding='utf8').read()
snap = fb[fb.index('const NOT_DATA'):fb.index('export class Lockstep')].replace('export function', 'function')
ls = open(os.path.join(HERE, 'online', 'lockstep.mjs'), encoding='utf8').read()
ls = '\n'.join(l for l in ls.split('\n') if not l.startswith('import ') and not l.startswith('export const snapOf') and not l.startswith('export const applySnap'))
ls = ls.replace('export ', '')
ls = ls.replace('const STEP = 1 / 30, STEP_MS', 'const LSTEP = 1 / 30, STEP_MS')
cl = open(os.path.join(HERE, 'online', 'live-client.js'), encoding='utf8').read()
js += '\n;/* ---- online ---- */\n' + snap + '\n' + ls + '\n' + cl + '\n'
open(os.path.join(HERE, 'assets', 'app-live.js'), 'w', encoding='utf8').write(js)

h = open(os.path.join(HERE, 'index.html'), encoding='utf8').read()
h = h.replace('assets/app.js', 'assets/app-live.js')
css = ('<script>window.EM_ONLINE=true</script><style>.topbar,#toast,.heading-actions,.speed-group,#fight-pause-btn,.result-actions,.fight-feed{display:none!important}'
       '#live-status{position:fixed;left:50%;transform:translateX(-50%);bottom:10px;background:#0b1118e6;color:#e8eef5;padding:5px 14px;border-radius:14px;font:600 12px system-ui;z-index:2147483000;display:none}'
       '.lfo-ad .ad-skip,.bc-intro button,.bc-studio button,.bc-skip,[data-skip]{display:none!important}.bc-intro,.bc-studio{pointer-events:none!important}</style></head>')
assert '</head>' in h
h = h.replace('</head>', css, 1)
open(os.path.join(HERE, 'mma-live.html'), 'w', encoding='utf8').write(h)
print('ok', len(js))
