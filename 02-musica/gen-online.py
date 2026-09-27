"""Genera musica-online.html: el juego de música de siempre, pero el estado y el reloj los maneja el servidor (liga online).
El juego original se guarda como texto y se ejecuta recién cuando llega el estado del sello (online/boot.js). Ejecutar tras tocar el juego:
    python -X utf8 gen-online.py
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
h = open(os.path.join(HERE, 'musica-mejorada.html'), encoding='utf8').read()
ov = open(os.path.join(HERE, 'online', 'overrides.js'), encoding='utf8').read()


def rep(s, old, new):
    assert s.count(old) == 1, ('no encontrado o repetido: ' + old[:70], s.count(old))
    return s.replace(old, new)


h = rep(h, '<script src="../touchline-bridge.js"></script>', '<script>window.EM_ONLINE=true</script>')
i0 = h.index("<script>\n'use strict';")
i1 = h.index('</script>', i0)
game = h[i0 + len('<script>'):i1]
# el estado viene del servidor
game = rep(game, "try{const stored=JSON.parse(localStorage.getItem(STORE));if(validSave(stored))state=stored;else fresh()}catch(e){fresh()}", 'state=window.EM_STATE;')
game = rep(game, "['market','globe','Mercado']];", "['market','globe','Mercado'],['ranking','chart','Ranking de sellos']];")
game = rep(game, 'market:marketPage,log:logPage}', 'market:marketPage,log:logPage,ranking:(typeof rankingPage==="function"?rankingPage:dashboard)}')
game = game.replace('Guardado automático local', 'Guardado en el servidor')
assert '</script' not in game
css = '<style>#play-btn,[data-speed]{display:none!important}</style>'
loader = ('<script type="text/plain" id="game-src">' + game + '\n' + ov + '</script>'
          '<script>(async()=>{const Q=new URLSearchParams(location.search),API=(Q.get("api")||"http://localhost:8787").replace(/\\/+$/,""),L=Q.get("league");'
          'try{const r=await fetch(API+"/api/league/"+encodeURIComponent(L)+"/career",{credentials:"include"}),d=await r.json();if(!d.state)throw new Error(d.error||"No se pudo cargar la liga");'
          'window.EM_STATE=d.state;window.EM_REV=d.rev;const s=document.createElement("script");s.textContent=document.getElementById("game-src").textContent;document.body.appendChild(s)}'
          'catch(e){document.body.insertAdjacentHTML("afterbegin","<p style=\\"padding:30px;color:#fff;font:16px system-ui\\">"+String(e.message||e)+"</p>")}})()</script>')
h = h[:i0] + loader + h[i1 + len('</script>'):]
h = rep(h, '</head>', css + '</head>')
open(os.path.join(HERE, 'musica-online.html'), 'w', encoding='utf8').write(h)
print('ok', len(h))
