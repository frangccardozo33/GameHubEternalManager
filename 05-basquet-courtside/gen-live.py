"""Genera live.html (transmisión online) a partir de index.html: misma pantalla de partido, sin el manager.
    python gen-live.py && npx vite build -c vite.live.config.js && python inline.py courtside-live.html dist-live
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))


def rep(s, old, new):
    assert old in s, 'no encontrado: ' + old[:70]
    return s.replace(old, new, 1)


h = open(os.path.join(HERE, 'index.html'), encoding='utf8').read()
h = rep(h, '<script src="../assets/common/em-mobile.js"></script>', '<script>window.EM_ONLINE=true</script><script src="../assets/common/em-mobile.js"></script>')
h = rep(h, '<main id="app"></main>', '<main id="app" hidden></main>')
h = rep(h, '<main id="match-screen" hidden>', '<main id="match-screen">')
h = rep(h, '<script type="module" src="./src/main.js"></script>', '<script type="module" src="./src/live-main.js"></script>')
h = rep(h, '</head>', '<style>#nav,header.topbar,#play-button,.speed-control,#skip-button,#settings-button,[data-coach=save],.bc-intro button,.bc-studio button,.lfo-ad .ad-skip{display:none!important}#live-status{position:fixed;left:50%;transform:translateX(-50%);bottom:10px;background:#0b1118e6;color:#e8eef5;padding:5px 14px;border-radius:14px;font:600 12px system-ui;z-index:50;display:none}</style></head>')
h = rep(h, '</body>', '<div id="live-status"></div></body>')
open(os.path.join(HERE, 'live.html'), 'w', encoding='utf8').write(h)
open(os.path.join(HERE, 'src', 'live-main.js'), 'w', encoding='utf8').write("import './style.css';\nimport { boot } from './online/client.js';\nboot();\n")
print('ok')
