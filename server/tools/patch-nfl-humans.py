"""Hace que el núcleo de NFL (06-nfl-gridiron/src/manager) sepa que puede haber varios DT humanos (liga online): la CPU no los toca,
el draft los espera, la copa los incluye y las operaciones del cliente quedan enganchadas (league.onOp) para mandarlas al servidor.
Idempotente: se puede correr de nuevo."""
import os, re
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '06-nfl-gridiron', 'src')


def edit(path, pairs):
    p = os.path.join(R, path); s = open(p, encoding='utf8').read(); ch = False
    for old, new in pairs:
        if new in s: continue
        assert old in s, (path, old[:80])
        s = s.replace(old, new, 1); ch = True
    if ch: open(p, 'w', encoding='utf8').write(s)
    print(path, 'cambiado' if ch else 'ya estaba')


HUM = "(league.data.humans || [])"
edit('manager/economy.js', [
    ("export function signFreeAgent(league, teamId, pid, offer) {", "export const signFreeAgent = (league, ...a) => hook(league, 'signFreeAgent', a, _signFreeAgent(league, ...a));\nfunction _signFreeAgent(league, teamId, pid, offer) {"),
    ("export function renewPlayer(league, teamId, pid, offer) {", "export const renewPlayer = (league, ...a) => hook(league, 'renewPlayer', a, _renewPlayer(league, ...a));\nfunction _renewPlayer(league, teamId, pid, offer) {"),
    ("export function releasePlayer(league, teamId, pid, { silent = false } = {}) {", "export const releasePlayer = (league, ...a) => hook(league, 'releasePlayer', a, _releasePlayer(league, ...a));\nfunction _releasePlayer(league, teamId, pid, { silent = false } = {}) {"),
    ("export function executeTrade(league, { teamA, teamB, giveA, giveB }) {", "export const executeTrade = (league, ...a) => { const r = _executeTrade(league, ...a); hook(league, 'executeTrade', a, r); return r; };\nfunction _executeTrade(league, { teamA, teamB, giveA, giveB }) {"),
    ("export function cpuMaintain(league) {\n  const d = league.data, P = d.players;\n  for (const t of Object.values(d.teams)) {\n    if (t.id === d.userTeam) continue;",
     "export function cpuMaintain(league) {\n  const d = league.data, P = d.players;\n  for (const t of Object.values(d.teams)) {\n    if (t.id === d.userTeam || (d.humans || []).includes(t.id)) continue;"),
    ("    if (t.id === user.id || !rng.chance(.09) || d.offers.length >= 3) continue;", "    if (t.id === user.id || (d.humans || []).includes(t.id) || !rng.chance(.09) || d.offers.length >= 3) continue;"),
    ("// ---------- Needs & trades", "// Liga online: el cliente engancha league.onOp(nombre, args, resultado) para mandar al servidor lo que el DT hace en el mercado.\nconst hook = (league, name, args, r) => { if (league.onOp && !(r && r.ok === false)) league.onOp(name, args, r); return r; };\n// ---------- Needs & trades"),
])
edit('manager/league.js', [
    ("      } else autoDepth(this, t);\n    }\n    cpuMaintain(this); generateOffers(this);", "      } else if (!(d.humans || []).includes(t.id)) autoDepth(this, t);\n    }\n    cpuMaintain(this); generateOffers(this);"),
    ("const d = this.data; while (d.draft && !d.draft.done) { const cur = this.draftCurrent(); if (cur.teamId === d.userTeam) return; this._draftCpuPick(); }", "const d = this.data; while (d.draft && !d.draft.done) { const cur = this.draftCurrent(); if (cur.teamId === d.userTeam || (d.humans || []).includes(cur.teamId)) return; this._draftCpuPick(); }"),
    ("  draftPick(pid) {\n    const d = this.data, dr = d.draft, cur = this.draftCurrent();\n    if (!cur || cur.teamId !== d.userTeam)", "  draftPick(pid) {\n    const d = this.data, dr = d.draft, cur = this.draftCurrent();\n    if (this.onOp && cur && cur.teamId === d.userTeam && dr.pool.includes(pid)) this.onOp('draftPick', [pid]);\n    if (!cur || cur.teamId !== d.userTeam)"),
])
edit('manager/cup.js', [
    ("  if (!seeds.includes(d.userTeam)) seeds[size - 1] = d.userTeam;", "  for (const h of [d.userTeam, ...(d.humans || [])]) if (!seeds.includes(h)) { const i = seeds.map((x, j) => j).reverse().find((j) => ![d.userTeam, ...(d.humans || [])].includes(seeds[j])); if (i != null) seeds[i] = h; }"),
    ("const pay = (lg, id, m, why) => { if (id !== lg.data.userTeam || !m) return;", "const pay = (lg, id, m, why) => { if ((id !== lg.data.userTeam && !(lg.data.humans || []).includes(id)) || !m) return;"),
])
edit('manager/store.js', [
    ("export function save(league) { try {", "export function save(league) { if (typeof window !== 'undefined' && window.EM_MGR) { window.EM_MGR.changed(league); return true; } try {"),
])
edit('ui/app.js', [
    ("const loaded = store.hasSave() ? store.load() : null;", "const loaded = window.EM_MGR ? window.EM_MGR.league() : store.hasSave() ? store.load() : null;"),
    ("const pageHandlers = () =>", "if (window.EM_MGR) window.EM_MGR.lock(GLOBAL, PAGES); // gestión online: las jornadas las maneja el servidor\nconst pageHandlers = () =>"),
])
