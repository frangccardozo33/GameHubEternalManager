"""Genera mgr.html (gestión online del club) a partir de index.html: el modo franquicia de siempre sobre la liga del servidor.
    python gen-mgr.py && npx vite build -c vite.mgr.config.js
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))


def rep(s, old, new):
    assert old in s, 'no encontrado: ' + old[:70]
    return s.replace(old, new, 1)


h = open(os.path.join(HERE, 'index.html'), encoding='utf8').read()
h = rep(h, '<script src="../../assets/common/em-mobile.js"></script>', '<script>window.EM_ONLINE=true</script><script src="../../assets/common/em-mobile.js"></script>')
h = rep(h, '<script type="module" src="./src/main.js"></script>', '<script type="module" src="./src/mgr-main.js"></script>')
open(os.path.join(HERE, 'mgr.html'), 'w', encoding='utf8').write(h)
open(os.path.join(HERE, 'src', 'mgr-main.js'), 'w', encoding='utf8').write("import './online/manager.js';\nimport './main.js';\n")
print('ok')
