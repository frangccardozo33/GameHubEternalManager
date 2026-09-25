// servidor estático mínimo para revisar fulbo.html en el navegador (node bench/serve.cjs [puerto])
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), port = +(process.argv[2] || 8123);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".json": "application/json" };
http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "fulbo.html");
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end("404"); }
  res.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(res);
}).listen(port, () => console.log("http://localhost:" + port + "/fulbo.html"));
