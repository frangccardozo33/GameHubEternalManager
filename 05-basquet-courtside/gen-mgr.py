"""Genera mgr.html (gestión online del club) a partir de index.html: el manager de siempre sobre la liga del servidor.
    python gen-mgr.py && npx vite build -c vite.mgr.config.js && python -X utf8 inline.py courtside-manager.html dist-mgr mgr.html
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))


def rep(s, old, new):
    assert old in s, 'no encontrado: ' + old[:70]
    return s.replace(old, new, 1)


h = open(os.path.join(HERE, 'index.html'), encoding='utf8').read()
h = rep(h, '<script src="../touchline-bridge.js"></script>', '<script>window.EM_ONLINE=true</script>')
h = rep(h, '<script type="module" src="./src/main.js"></script>', '<script type="module" src="./src/mgr-main.js"></script>')
open(os.path.join(HERE, 'mgr.html'), 'w', encoding='utf8').write(h)
open(os.path.join(HERE, 'src', 'mgr-main.js'), 'w', encoding='utf8').write("import './style.css';\nimport './online/manager.js';\nimport './ui/app.js';\n")
print('ok')
