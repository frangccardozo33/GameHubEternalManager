import { LeagueDO } from './league-do.js';
import { ChatDO } from './chat-do.js';
export { LeagueDO, ChatDO };

const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const json = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', ...h } });

async function sign(secret, data) {
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
}
async function makeSession(env, uid) {
  const p = b64(enc.encode(JSON.stringify({ uid, exp: Date.now() + 30 * 864e5 })));
  return p + '.' + (await sign(env.SESSION_SECRET, p));
}
async function readSession(env, req) {
  const m = /(?:^|; )sid=([^;]+)/.exec(req.headers.get('cookie') || '');
  if (!m) return null;
  const [p, s] = m[1].split('.');
  if (!p || s !== (await sign(env.SESSION_SECRET, p))) return null;
  try {
    const o = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
    return o.exp > Date.now() ? o.uid : null;
  } catch { return null; }
}

const bytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function hashPw(pw, salt) {
  const k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, k, 256);
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}
const cookie = (v, age) => `sid=${v}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${age}`;

async function auth(req, env, action) {
  if (action === 'logout') return json({ ok: true }, 200, { 'set-cookie': cookie('', 0) });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const { name, password } = await req.json().catch(() => ({}));
  if (typeof name !== 'string' || typeof password !== 'string') return json({ error: 'datos' }, 400);
  const n = name.trim();
  if (!/^[\w.\-]{3,20}$/.test(n)) return json({ error: 'Usuario: 3-20 letras, numeros, . _ -' }, 400);
  if (password.length < 8 || password.length > 100) return json({ error: 'Contrasena: minimo 8 caracteres' }, 400);

  if (action === 'register') {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const uid = crypto.randomUUID();
    try {
      await env.DB.prepare('INSERT INTO users (id,name,salt,hash,created) VALUES (?,?,?,?,?)').bind(uid, n, btoa(String.fromCharCode(...salt)), await hashPw(password, salt), Date.now()).run();
    } catch { return json({ error: 'Ese usuario ya existe' }, 409); }
    return json({ uid, name: n }, 200, { 'set-cookie': cookie(await makeSession(env, uid), 2592000) });
  }
  if (action === 'login') {
    const now = Date.now();
    const at = await env.DB.prepare('SELECT n,since FROM attempts WHERE name=?').bind(n.toLowerCase()).first();
    if (at && now - at.since < 15 * 60e3 && at.n >= 5) return json({ error: 'Demasiados intentos, espera 15 min' }, 429);
    const u = await env.DB.prepare('SELECT id,salt,hash FROM users WHERE name=?').bind(n).first();
    const ok = u && (await hashPw(password, bytes(u.salt))) === u.hash;
    if (!ok) {
      const fresh = !at || now - at.since >= 15 * 60e3;
      await env.DB.prepare('INSERT INTO attempts (name,n,since) VALUES (?,1,?) ON CONFLICT(name) DO UPDATE SET n=?, since=?').bind(n.toLowerCase(), now, fresh ? 1 : at.n + 1, fresh ? now : at.since).run();
      return json({ error: 'Usuario o contrasena incorrectos' }, 401);
    }
    await env.DB.prepare('DELETE FROM attempts WHERE name=?').bind(n.toLowerCase()).run();
    return json({ uid: u.id, name: n }, 200, { 'set-cookie': cookie(await makeSession(env, u.id), 2592000) });
  }
  return json({ error: 'not-found' }, 404);
}

const cors = (env, req) => {
  const o = req.headers.get('origin');
  const ok = o && (env.APP_ORIGIN || '').split(',').map((x) => x.trim()).includes(o);
  return ok ? { 'access-control-allow-origin': o, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,POST,OPTIONS', vary: 'origin' } : {};
};

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env, req) });
    const res = await this.route(req, env);
    if (res.status === 101) return res;
    const h = new Headers(res.headers);
    for (const [k, v] of Object.entries(cors(env, req))) h.set(k, v);
    return new Response(res.body, { status: res.status, headers: h });
  },
  async route(req, env) {
    const url = new URL(req.url);
    const m = /^\/auth\/(register|login|logout)$/.exec(url.pathname);
    if (m) return auth(req, env, m[1]);
    const uid = await readSession(env, req);
    if (url.pathname === '/api/me') {
      if (!uid) return json({ error: 'no-session' }, 401);
      const u = await env.DB.prepare('SELECT name FROM users WHERE id=?').bind(uid).first();
      return u ? json({ uid, name: u.name }) : json({ error: 'no-session' }, 401);
    }
    if (!uid) return json({ error: 'no-session' }, 401);

    if (url.pathname === '/api/chat/ws') {
      if (req.headers.get('upgrade') !== 'websocket') return json({ error: 'ws' }, 426);
      if (!(env.APP_ORIGIN || '').split(',').map((x) => x.trim()).includes(req.headers.get('origin'))) return json({ error: 'origin' }, 403);
      const u = await env.DB.prepare('SELECT name FROM users WHERE id=?').bind(uid).first();
      const stub = env.CHAT.get(env.CHAT.idFromName('global'));
      const h = new Headers(req.headers); h.set('x-uid', uid); h.set('x-name', (u && u.name) || 'Jugador');
      return stub.fetch(new Request('https://do/ws', { method: 'GET', headers: h }));
    }

    if (url.pathname === '/api/leagues' && req.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT l.id,l.module,l.code,l.owner,m.club FROM leagues l JOIN memberships m ON m.league=l.id WHERE m.user=? ORDER BY l.created DESC').bind(uid).all();
      return json({ leagues: results });
    }
    if (url.pathname === '/api/leagues/join' && req.method === 'POST') {
      const { code, club } = await req.json().catch(() => ({}));
      const l = await env.DB.prepare('SELECT id,module FROM leagues WHERE code=?').bind(String(code || '').toUpperCase()).first();
      if (!l) return json({ error: 'Codigo inexistente' }, 404);
      await env.DB.prepare('INSERT OR IGNORE INTO memberships (league,user,club) VALUES (?,?,?)').bind(l.id, uid, club || null).run();
      return json({ id: l.id, module: l.module });
    }
    if (url.pathname === '/api/leagues' && req.method === 'POST') {
      const { module, firstKickoff, everyMin, fast, preMs } = await req.json().catch(() => ({}));
      if (!['nfl', 'basquet', 'futbol', 'mma', 'carreras', 'musica'].includes(module)) return json({ error: 'Ese modulo todavia no esta disponible online' }, 400);
      // el modulo se pasa al Durable Object en init
      const t0 = Number(firstKickoff) || Date.now() + 10 * 60e3;
      const id = crypto.randomUUID(), code = id.slice(0, 6).toUpperCase();
      await env.DB.prepare('INSERT INTO leagues (id,module,code,owner,created) VALUES (?,?,?,?,?)').bind(id, module, code, uid, Date.now()).run();
      await env.DB.prepare('INSERT INTO memberships (league,user,club) VALUES (?,?,?)').bind(id, uid, null).run();
      const r = await env.LEAGUE.get(env.LEAGUE.idFromName(id)).fetch('https://do/init', { method: 'POST', body: JSON.stringify({ module, firstKickoff: t0, everyMs: Math.max(1, Number(everyMin) || 1440) * 60e3, fast: !!fast && String(env.APP_ORIGIN || '').startsWith('http://localhost'), preMs: fast ? Number(preMs) || undefined : undefined }) });
      if (!r.ok) return json({ error: 'No se pudo crear la liga' }, 500);
      return json({ id, code });
    }
    const cm = /^\/api\/league\/([\w-]+)\/claim$/.exec(url.pathname);
    if (cm && req.method === 'POST') {
      const { club } = await req.json().catch(() => ({}));
      const mem = await env.DB.prepare('SELECT 1 FROM memberships WHERE league=? AND user=?').bind(cm[1], uid).first();
      if (!mem) return json({ error: 'not-member' }, 403);
      const stub = env.LEAGUE.get(env.LEAGUE.idFromName(cm[1]));
      const { clubs } = await (await stub.fetch('https://do/clubs')).json();
      if (!clubs.includes(club)) return json({ error: 'Club inexistente' }, 400);
      const taken = await env.DB.prepare('SELECT 1 FROM memberships WHERE league=? AND club=? AND user!=?').bind(cm[1], club, uid).first();
      if (taken) return json({ error: 'Ese club ya tiene DT' }, 409);
      await env.DB.prepare('UPDATE memberships SET club=? WHERE league=? AND user=?').bind(club, cm[1], uid).run();
      const { results } = await env.DB.prepare('SELECT m.club, u.name FROM memberships m JOIN users u ON u.id=m.user WHERE m.league=? AND m.club IS NOT NULL').bind(cm[1]).all();
      await stub.fetch('https://do/humans', { method: 'POST', body: JSON.stringify(Object.fromEntries(results.map((r) => [r.club, r.name]))) });
      return json({ ok: true, club });
    }
    const lm = /^\/api\/league\/([\w-]+)\/(.*)$/.exec(url.pathname);
    if (lm) {
      const ok = await env.DB.prepare('SELECT club FROM memberships WHERE league=? AND user=?').bind(lm[1], uid).first();
      if (!ok) return json({ error: 'not-member' }, 403);
      const stub = env.LEAGUE.get(env.LEAGUE.idFromName(lm[1]));
      if (req.headers.get('upgrade') === 'websocket' && !(env.APP_ORIGIN || '').split(',').map((x) => x.trim()).includes(req.headers.get('origin'))) return json({ error: 'origin' }, 403);
      const h = new Headers(req.headers); h.set('x-uid', uid); h.set('x-club', ok.club || '');
      const r = new Request(`https://do/${lm[2]}${url.search}`, { method: req.method, body: req.method === 'GET' ? undefined : req.body, headers: h });
      return stub.fetch(r);
    }
    return json({ error: 'not-found' }, 404);
  },
};
