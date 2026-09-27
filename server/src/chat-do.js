// Chat global del hub: una sola instancia compartida por todos los jugadores conectados (idFromName('global')).
// No hay salas de servidor: el cliente (chat/chat.js) ya filtra por sala/DM en base al campo `ch`/`room`/`to` del
// paquete; este Durable Object sólo reenvía a todos los demás sockets conectados, validando la identidad del
// remitente (no se puede mandar un mensaje con el nombre de otro jugador) y aplicando límites básicos de abuso.
import { DurableObject } from 'cloudflare:workers';

const MAX_TEXT = 300;
const MAX_ID = 80;
const MIN_GAP_MS = 250;      // separación mínima entre mensajes de un mismo socket

const json = (o, status = 200) => Response.json(o, { status });
const str = (v, n) => (typeof v === 'string' && v.length <= n ? v : null);

export class ChatDO extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.socks = new Map(); // ws -> { uid, name, avatar, last }
  }

  send(ws, msg) { try { ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg)); } catch { this.socks.delete(ws); } }
  broadcast(msg, exceptWs) {
    const str_ = JSON.stringify(msg);
    for (const [ws] of this.socks) if (ws !== exceptWs) this.send(ws, str_);
  }

  clean(a, raw) {
    let d; try { d = JSON.parse(raw); } catch { return null; }
    if (!d || typeof d !== 'object') return null;
    const from = { id: a.uid, name: a.name, avatar: str(d.from?.avatar, 24) || 'classic' };
    if (d.t === 'presence') {
      const room = d.room == null ? null : str(String(d.room), MAX_ID);
      const roomLabel = str(String(d.roomLabel || ''), MAX_ID) || '';
      return { t: 'presence', from, room, roomLabel, bye: !!d.bye, ts: Date.now() };
    }
    if (d.t !== 'msg') return null;
    const id = str(d.id, MAX_ID); if (!id) return null;
    const ch = ['global', 'room', 'dm'].includes(d.ch) ? d.ch : null; if (!ch) return null;
    const room = ch === 'room' ? str(String(d.room || ''), MAX_ID) : undefined;
    const to = ch === 'dm' ? str(String(d.to || ''), MAX_ID) : undefined;
    if (ch === 'room' && !room) return null;
    if (ch === 'dm' && !to) return null;
    const out = { t: 'msg', id, ch, room, to, from, ts: Date.now() };
    if (d.kind === 'text') { const text = str(String(d.text || ''), MAX_TEXT); if (!text || !text.trim()) return null; out.kind = 'text'; out.text = text; }
    else if (d.kind === 'sticker') { const sticker = str(d.sticker, MAX_ID); if (!sticker) return null; out.kind = 'sticker'; out.sticker = sticker; }
    else return null;
    return out;
  }

  async fetch(req) {
    const url = new URL(req.url), path = url.pathname.slice(1);
    if (path !== 'ws') return json({ error: 'not-found' }, 404);
    if (req.headers.get('upgrade') !== 'websocket') return json({ error: 'ws' }, 426);
    const uid = req.headers.get('x-uid'), name = req.headers.get('x-name') || 'Jugador';
    if (!uid) return json({ error: 'sin sesion' }, 403);
    const pair = new WebSocketPair(), [cli, srv] = [pair[0], pair[1]];
    srv.accept();
    const a = { uid, name: name.slice(0, 40), avatar: 'classic', last: 0 };
    this.socks.set(srv, a);
    srv.addEventListener('message', (ev) => {
      const now = Date.now();
      if (now - a.last < MIN_GAP_MS) return;
      const m = this.clean(a, ev.data); if (!m) return;
      a.last = now;
      this.broadcast(m, srv);
    });
    const drop = () => { this.socks.delete(srv); };
    srv.addEventListener('close', drop); srv.addEventListener('error', drop);
    return new Response(null, { status: 101, webSocket: cli });
  }
}
