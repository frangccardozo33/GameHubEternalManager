import re, sys, pathlib
dist = pathlib.Path('dist')
html = (dist / 'index.html').read_text()
def css(m):
    return '<style>' + (dist / m.group(1).lstrip('/')).read_text() + '</style>'
def js(m):
    code = (dist / m.group(1).lstrip('/')).read_text().replace('</script', '<\\/script')
    return '<script type="module">' + code + '</script>'
html = re.sub(r'<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', css, html)
html = re.sub(r'<script type="module"[^>]*src="([^"]+)"[^>]*></script>', js, html)
# el script debe ir al final del body para que el DOM exista (los módulos inline no se difieren)
m = re.search(r'<script type="module">.*?</script>', html, re.S)
script = m.group(0); html = html.replace(script, '')
html = html.replace('</body>', script + '\n</body>')
pathlib.Path(sys.argv[1]).write_text(html)
print('ok', len(html))
