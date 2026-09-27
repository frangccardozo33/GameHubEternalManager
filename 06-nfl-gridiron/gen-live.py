"""Genera live.html y src/live-main.js (transmisión online) a partir de index.html y src/main.js,
para que la pantalla de partido online sea exactamente la del modo local. Ejecutar tras tocar index.html o main.js:
    python gen-live.py && npx vite build -c vite.live.config.js
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))


def rep(s, old, new, count=1):
    assert old in s, 'no encontrado: ' + old[:70]
    return s.replace(old, new, count)


# ---------------------------------------------------------------- live.html
h = open(os.path.join(HERE, 'index.html'), encoding='utf8').read()
h = rep(h, '<body data-page="dashboard" data-tab="live">', '<body data-page="match" data-tab="live">')
h = rep(h, '<div id="page-match" class="hidden">', '<div id="page-match">')
h = rep(h, '<div id="prematch" class="mroot"></div>', '<div id="prematch" class="mroot hidden"></div>')
h = rep(h, '<div id="match-live" class="hidden">', '<div id="match-live">')
h = rep(h, '<script src="../../assets/common/em-mobile.js"></script>', '<script>window.EM_ONLINE=true</script><script src="../../assets/common/em-mobile.js"></script>')
h = rep(h, '<script type="module" src="./src/main.js"></script>', '<script type="module" src="./src/live-main.js"></script>')
h = rep(h, '</head>', '<style>#sidebar,#topbar,#manager-root{display:none!important}.shell{display:block!important}#next-play,#sim-rest,#exhibition-button,#play-pause,[data-speed],#export-button,#start-match{display:none!important}#lfo-hide,.lfo-ad .ad-skip,.bc-intro button,.bc-studio button{display:none!important}#live-status{position:fixed;left:50%;transform:translateX(-50%);bottom:10px;background:#0b1118e6;color:#e8eef5;padding:5px 14px;border-radius:14px;font:600 12px system-ui;z-index:50;display:none}</style></head>')
h = rep(h, '<div id="toast"', '<div id="live-status"></div><div id="toast"')
open(os.path.join(HERE, 'live.html'), 'w', encoding='utf8').write(h)

# ---------------------------------------------------------------- live-main.js
m = open(os.path.join(HERE, 'src', 'main.js'), encoding='utf8').read()
m = rep(m, "import {MatchSimulator,FIXED_DT} from './sim/match.js';", "import {FIXED_DT} from './sim/match.js';\nimport {RemoteSim} from './remote.js';\nimport './ui/manager.css';\nimport {slider,select} from './ui/kit.js';")
m = rep(m, 'let sim=new MatchSimulator(),paused=true,speed=1,', 'let sim=new RemoteSim(),paused=false,speed=1,')
m = rep(m, 'let managerCtx=null,hooks={},finalHandled=false,userIdx=0,matchLoaded=false;', "let managerCtx={fixture:{type:'regular'}},hooks={},finalHandled=false,userIdx=0,matchLoaded=true;")
old_tick = "else if(sim.started&&!paused&&!$('settings-dialog').open){accumulator+=dt*speed;let iterations=0;while(accumulator>=FIXED_DT&&iterations++<30){advance();accumulator-=FIXED_DT;}if(sim.state==='FINAL')paused=true;}"
m = rep(m, old_tick, '')
m = rep(m, "import './ui/app.js';\n", '')
m = rep(m, "sim.forcedPlay=$('forced-play').value||null;", "sim.forcedPlay=$('forced-play').value||null;LIVE.send({type:'force',play:sim.forcedPlay});")
m = rep(m, "sim.forcedCoverage=$('forced-defense').value||null;", "sim.forcedCoverage=$('forced-defense').value||null;LIVE.send({type:'force',coverage:sim.forcedCoverage});")
m = rep(m, "}catch(e){console.warn('Transmisión no disponible',e);}}", "wrapAds();}catch(e){console.warn('Transmisión no disponible',e);}}")
m = m.rstrip() + "\n" + open(os.path.join(HERE, 'live-extra.js'), encoding='utf8').read()
open(os.path.join(HERE, 'src', 'live-main.js'), 'w', encoding='utf8').write(m)
print('ok')
