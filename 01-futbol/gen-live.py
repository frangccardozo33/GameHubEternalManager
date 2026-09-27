"""Genera fulbo-live.html (transmisión online) a partir de fulbo.html: misma pantalla, transmisión y anuncios, pero el motor lo
avanza el conductor online (online/live-client.js). Ejecutar tras tocar fulbo.html:   python gen-live.py
"""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
h = open(os.path.join(HERE, 'fulbo.html'), encoding='utf8').read()


def rep(old, new, count=1):
    global h
    assert old in h, 'no encontrado: ' + old[:80]
    h = h.replace(old, new, count)


# 0) motor con Math determinista (mismo reemplazo que server/tools/build-football.mjs): Math.hypot/sin/cos/atan/exp/pow difieren
#    entre navegadores y servidor, y el motor es caótico. El bloque del motor va de "te = (i, t, e) =>" a "// <<TLM_ENGINE_END>>".
_lines = h.split('\n')
_a = next(i for i, l in enumerate(_lines) if re.match(r'^\s{2}te = \(i, t, e\) =>', l))
_b = next((i for i, l in enumerate(_lines) if '// <<TLM_ENGINE_END>>' in l), None)
if _b is None:
    _b = next(i for i, l in enumerate(_lines) if '// <<TLB_ENGINE_END>>' in l)
for _i in range(_a, _b + 1):
    _lines[_i] = re.sub(r'\bMath\.', 'DM.', _lines[_i])
h = '\n'.join(_lines)
_dm = open(os.path.join(HERE, '..', 'assets', 'common', 'dmath.mjs'), encoding='utf8').read().replace('export const DM = {};', 'const DM = {};') + '\nwindow.DM = DM;'
# 1) bucle principal: en vivo el motor avanza con el reloj del servidor (un paso fijo de 1/60, igual que en el servidor)
m = re.search(r'\} else if \(ht\.running\) \{\n(\s+)for \(Tn = Math\.min\(Tn \+ t \* oa, 1 / 12\); Tn >= 1 / 60; \)', h)
assert m, 'bucle no encontrado'
hook = ('} else if (window.LFO_LIVE) {\n    window.LFO_LIVE.pump(() => { gr += 1 / 60; if (ht.elapsed - ca >= 1 / 15) { Fi.push(Rl()); ca = ht.elapsed; while (Fi.length > 135) Fi.shift(); } });\n  '
        + m.group(0))
h = h[:m.start()] + hook + h[m.end():]
# 2) la capa de transmisión no puede tocar el reloj del motor (el servidor no lo hace)
rep('if (cfg.celeb === "SHORT") ht.wait = Math.min(ht.wait, 4.4);', '')
rep('if (cfg.bcast) { ht.wait = 999; setTimeout(halftimeBreak, 1400); }', 'if (cfg.bcast) { setTimeout(halftimeBreak, 1400); }')
rep('S.half = false; ht.wait = 0.6; }', 'S.half = false; }')
# 3) sin pausa ni reinicio a mano
rep('? (ht.running = !ht.running)', '? (window.LFO_LIVE ? 0 : (ht.running = !ht.running))')
rep('? (Aa(), ht.start())', '? (window.LFO_LIVE ? 0 : (Aa(), ht.start()))')
rep('((ht.running = !1), bi(), wn("Partido pausado al salir de la pestaña."))', '(window.LFO_LIVE ? 0 : ((ht.running = !1), bi(), wn("Partido pausado al salir de la pestaña.")))')
# 3b) los cosméticos de la Tienda cambian el consumo del azar del motor (variante de festejo): en vivo todos usan la misma variante
rep('window.LFOCosmetics && window.LFOCosmetics.pickVariant ? window.LFOCosmetics.pickVariant(situation) : null', 'null')
# 4) cabecera, estilos y conductor
rep('</head>', '<script>window.EM_ONLINE=true</script><script>(function(){' + _dm + '})();</script><style>.tlb-pre,.tlb-half{pointer-events:none!important}.tlb-pre .tlb-skip,.tlb-half .tlb-skip,.lfo-ad .ad-skip,.tlb-gear,.tlb-panel,[data-speed],.speed-control,#reset-button,#configure-button,#start-button,.pitch-intro .button{display:none!important}#live-status{position:fixed;left:50%;transform:translateX(-50%);bottom:10px;background:#0b1118e6;color:#e8eef5;padding:5px 14px;border-radius:14px;font:600 12px system-ui;z-index:2147483000;display:none}</style></head>')
rep('</body>', '<div id="live-status"></div><script type="module" src="./online/live-client.js"></script></body>')
open(os.path.join(HERE, 'fulbo-live.html'), 'w', encoding='utf8').write(h)
print('ok', len(h))
