(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) n(s);
  new MutationObserver((s) => {
    for (const r of s)
      if (r.type === "childList")
        for (const a of r.addedNodes)
          a.tagName === "LINK" && a.rel === "modulepreload" && n(a);
  }).observe(document, { childList: !0, subtree: !0 });
  function e(s) {
    const r = {};
    return (
      s.integrity && (r.integrity = s.integrity),
      s.referrerPolicy && (r.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === "use-credentials"
        ? (r.credentials = "include")
        : s.crossOrigin === "anonymous"
          ? (r.credentials = "omit")
          : (r.credentials = "same-origin"),
      r
    );
  }
  function n(s) {
    if (s.ep) return;
    s.ep = !0;
    const r = e(s);
    fetch(s.href, r);
  }
})();
class La {
  constructor(t = 1) {
    this.seed = t >>> 0;
  }
  next() {
    let t = (this.seed += 1831565813);
    return (
      (t = Math.imul(t ^ (t >>> 15), t | 1)),
      (t ^= t + Math.imul(t ^ (t >>> 7), t | 61)),
      ((t ^ (t >>> 14)) >>> 0) / 4294967296
    );
  }
  range(t, e) {
    return t + this.next() * (e - t);
  }
  int(t, e) {
    return Math.floor(this.range(t, e + 1));
  }
  pick(t) {
    return t[Math.floor(this.next() * t.length)];
  }
  chance(t) {
    return this.next() < Math.max(0, Math.min(1, t));
  }
}
const te = (i, t = 0, e = 100) => Math.max(t, Math.min(e, i)),
  qi = (i, t) => Math.hypot(i.x - t.x, i.z - t.z),
  Ke = [
    { id: "feather", name: "Peso pluma", limit: 65.8 },
    { id: "light", name: "Peso ligero", limit: 70.3 },
    { id: "welter", name: "Peso wélter", limit: 77.1 },
  ],
  Pe = {
    pressure: {
      name: "Pressure striker",
      range: 1.28,
      attack: 0.76,
      takedown: 0.06,
      counter: 0.12,
      submit: 0.15,
    },
    counter: {
      name: "Counter striker",
      range: 1.65,
      attack: 0.43,
      takedown: 0.05,
      counter: 0.85,
      submit: 0.12,
    },
    wrestler: {
      name: "Wrestler",
      range: 1.15,
      attack: 0.5,
      takedown: 0.48,
      counter: 0.25,
      submit: 0.35,
    },
    grappler: {
      name: "BJJ / Grappler",
      range: 1.25,
      attack: 0.42,
      takedown: 0.38,
      counter: 0.3,
      submit: 0.82,
    },
  },
  ks = {
    accuracy: "Precisión",
    defense: "Defensa",
    power: "Potencia",
    speed: "Velocidad",
    wrestling: "Wrestling",
    grappling: "Grappling",
    cardio: "Cardio",
    initiative: "Iniciativa",
    intelligence: "Inteligencia",
    chin: "Resistencia",
  },
  xc = {
    focus: "balanced",
    pace: 50,
    distance: 50,
    target: "mixed",
    takedowns: 35,
    aggression: 55,
    conservation: 50,
  },
  kr = {
    boxing: {
      name: "Boxeo",
      attributes: ["accuracy", "speed"],
      cost: 1600,
      load: 12,
    },
    wrestling: {
      name: "Wrestling",
      attributes: ["wrestling", "defense"],
      cost: 1900,
      load: 15,
    },
    bjj: {
      name: "Jiu-jitsu",
      attributes: ["grappling", "intelligence"],
      cost: 1800,
      load: 11,
    },
    cardio: {
      name: "Cardio",
      attributes: ["cardio", "initiative"],
      cost: 1200,
      load: 9,
    },
    strength: {
      name: "Fuerza",
      attributes: ["power", "chin"],
      cost: 1500,
      load: 14,
    },
    recovery: { name: "Recuperación", attributes: [], cost: 700, load: -32 },
    strategy: {
      name: "Estrategia",
      attributes: ["intelligence", "defense"],
      cost: 1e3,
      load: 5,
    },
  },
  ll = [
    ["Mateo", "Vega", "EL LOBO", "GRA"],
    ["Rafael", "Costa", "FURACÃO", "VAL"],
    ["Adam", "Novak", "THE SILENT", "ZEN"],
    ["Idris", "Diallo", "BLACK STAR", "RIA"],
    ["Diego", "Salazar", "EL FILO", "MAG"],
    ["Kenji", "Mori", "RONIN", "TAM"],
    ["Luca", "Romano", "GLADIATOR", "MEL"],
    ["Noah", "Brooks", "OUTLAW", "KAI"],
    ["Yusuf", "Kaya", "THE WOLF", "SAH"],
    ["Bruno", "Alves", "PEDRA", "VAL"],
    ["Hugo", "Martín", "TEMPEST", "GRA"],
    ["Elias", "Berg", "NORTH", "MRG"],
    ["Amir", "Haddad", "SANDSTORM", "SAH"],
    ["Liam", "Walsh", "IRON", "KAI"],
    ["Alex", "Petrov", "HAMMER", "ZEN"],
    ["Santiago", "Cruz", "CONDOR", "PER"],
    ["Jun", "Park", "DYNAMO", "SOT"],
    ["Malik", "Johnson", "THE ENGINE", "KAI"],
  ];
function Mc(i, t, e = "light", n = "pressure", s = 1) {
  const r = new La(s),
    a = {};
  return (
    Object.keys(ks).forEach((o) => (a[o] = r.int(53, 79))),
    n === "wrestler" && (a.wrestling += 12),
    n === "grappler" && (a.grappling += 13),
    n === "counter" && (a.defense += 11),
    n === "pressure" && (a.power += 10),
    {
      id: i,
      firstName: t[0],
      lastName: t[1],
      nickname: t[2],
      country: t[3],
      age: r.int(22, 32),
      division: e,
      style: n,
      attributes: a,
      personality: {
        aggression: r.int(40, 85),
        patience: r.int(35, 80),
        courage: r.int(40, 85),
        conservatism: r.int(25, 75),
        finish: r.int(40, 90),
        discipline: r.int(45, 90),
      },
      record: { wins: r.int(5, 14), losses: r.int(1, 4), draws: 0 },
      rating: r.int(1050, 1450),
      popularity: r.int(20, 45),
      morale: 80,
      condition: 100,
      potential: r.int(85, 98),
      history: [],
      streak: 0,
      lastFightDay: 0,
      injuryUntil: 0,
      retired: !1,
      defenses: 0,
      career: "Prospecto",
      skin: ["#c18b68", "#ad704e", "#d6a580", "#6b4331"][s % 4],
      tactics: { ...xc },
      contract: null,
      sponsor: null,
      training: [],
    }
  );
}
// Países reales de guardados viejos -> naciones del mundo ficticio (assets/nations)
const LLO_NAT = {ESP: "GRA", BRA: "VAL", CZE: "ZEN", SEN: "RIA", MEX: "MAG", JPN: "TAM", ITA: "MEL", USA: "KAI", TUR: "SAH", SWE: "MRG", MAR: "SAH", IRL: "KAI", BUL: "ZEN", ARG: "PER", KOR: "SOT", POL: "MRG", NGA: "RIA", GER: "MRG", CHI: "CUN"};
const natFlag = (code) => { const N = window.LFONations, n = N && N.list.find((x) => x.code === code); return n ? `<img class="nat-flag" src="${n.flag}" alt="${n.name}" title="${n.name}">` : ""; };
function dl() {
  return ll.map((i, t) =>
    Mc(
      `f${t}`,
      i,
      Ke[Math.floor(t / 6)].id,
      Object.keys(Pe)[t % 4],
      81 + t * 57,
    ),
  );
}
const $t = (i) => `${i.firstName} ${i.lastName}`,
  zs = (i) =>
    Math.round(
      Object.values(i.attributes).reduce((t, e) => t + e) /
        Object.keys(i.attributes).length,
    ),
  hl = Object.freeze({
    STANCE: "stance",
    MOVING: "moving",
    ATTACKING: "attacking",
    DEFENDING: "defending",
    HIT: "hit-reaction",
    ROCKED: "rocked",
    CLINCH: "clinch",
    TAKEDOWN: "takedown-attempt",
    TOP: "ground-top",
    BOTTOM: "ground-bottom",
    GETTING_UP: "getting-up",
    KNOCKDOWN: "knockdown",
    STUNNED: "stunned",
    KO: "KO",
    ROUND_END: "round-end",
  });
function Hr() {
  return {
    thrown: 0,
    landed: 0,
    head: 0,
    body: 0,
    leg: 0,
    blocked: 0,
    missed: 0,
    grazed: 0,
    takedownAttempts: 0,
    takedowns: 0,
    control: 0,
    submissions: 0,
    knockdowns: 0,
    damage: 0,
    rounds: [],
  };
}
class ul {
  constructor(t, e) {
    ((this.profile = structuredClone(t)),
      (this.id = t.id),
      (this.side = e),
      (this.attributes = { ...t.attributes }),
      (this.tactics = { ...t.tactics }),
      (this.stamina = te(t.condition, 45)),
      (this.health = 100),
      (this.damage = { head: 0, body: 0, leg: 0 }),
      (this.fatigue = (100 - t.condition) * 0.2),
      (this.balance = 100),
      (this.distance = 3.2),
      (this.position = { x: e === 0 ? -1.6 : 1.6, z: 0 }),
      (this.velocity = { x: 0, z: 0 }),
      (this.state = hl.STANCE),
      (this.stateTime = 0),
      (this.stateDuration = 0),
      (this.action = null),
      (this.cooldown = 0.5 + e * 0.23),
      (this.combo = []),
      (this.defenseType = "high"),
      (this.groundPosition = "guard"),
      (this.stats = Hr()),
      (this.roundStats = Hr()),
      (this.memory = {
        takedownsSeen: 0,
        retreats: 0,
        lastAttack: "",
        repeated: 0,
      }),
      (this.control = 0),
      (this.unanswered = 0),
      (this.decisionTime = 0),
      (this.order = ""));
  }
  effective(t) {
    const e = 1 - this.fatigue * 0.004 - Math.max(0, 45 - this.stamina) * 0.006,
      n =
        t === "speed"
          ? this.damage.leg * 0.004
          : t === "accuracy" || t === "defense"
            ? this.damage.head * 0.0025
            : this.damage.body * 0.0014,
      s = 0.9 + this.profile.morale * 0.001;
    return te(this.attributes[t] * (e - n) * s, 12, 99);
  }
  setState(t, e = 0.7) {
    ((this.state = t), (this.stateTime = 0), (this.stateDuration = e));
  }
  spend(t) {
    ((this.stamina = te(this.stamina - t)),
      (this.fatigue = te(this.fatigue + t * 0.018)));
  }
  count(t, e = 1) {
    ((this.stats[t] += e), (this.roundStats[t] += e));
  }
  recover(t, e = !1) {
    const n = [
        "attacking",
        "takedown-attempt",
        "ground-top",
        "ground-bottom",
        "clinch",
      ].includes(this.state),
      s =
        (e ? 4.3 : n ? 0.2 : 1.6) *
        (0.5 + this.attributes.cardio / 100) *
        (1 - this.damage.body * 0.006);
    ((this.stamina = te(
      this.stamina + s * t,
      0,
      100 - this.fatigue * 0.38 - this.damage.body * 0.19,
    )),
      (this.balance = te(this.balance + t * (e ? 14 : 3.5))),
      e ||
        (this.fatigue = te(
          this.fatigue + t * (100 - this.attributes.cardio) * 45e-5,
        )));
  }
}
const Jn = {
    jab: {
      label: "Jab",
      zone: "head",
      limb: "leftHand",
      range: 1.62,
      damage: 2.7,
      cost: 2.7,
      duration: 0.66,
      impact: 0.34,
    },
    cross: {
      label: "Cross",
      zone: "head",
      limb: "rightHand",
      range: 1.68,
      damage: 4.7,
      cost: 4.2,
      duration: 0.82,
      impact: 0.4,
    },
    hook: {
      label: "Hook",
      zone: "head",
      limb: "leftHand",
      range: 1.32,
      damage: 5.1,
      cost: 4.8,
      duration: 0.84,
      impact: 0.43,
    },
    uppercut: {
      label: "Uppercut",
      zone: "head",
      limb: "rightHand",
      range: 1.15,
      damage: 5.7,
      cost: 5,
      duration: 0.88,
      impact: 0.44,
    },
    bodyShot: {
      label: "Gancho al cuerpo",
      zone: "body",
      limb: "leftHand",
      range: 1.32,
      damage: 4.5,
      cost: 4,
      duration: 0.78,
      impact: 0.41,
    },
    lowKick: {
      label: "Low kick",
      zone: "leg",
      limb: "rightFoot",
      range: 1.95,
      damage: 4.3,
      cost: 5.6,
      duration: 1.08,
      impact: 0.53,
    },
    bodyKick: {
      label: "Body kick",
      zone: "body",
      limb: "rightFoot",
      range: 1.92,
      damage: 5.8,
      cost: 6.5,
      duration: 1.2,
      impact: 0.53,
    },
    knee: {
      label: "Rodilla",
      zone: "body",
      limb: "rightKnee",
      range: 0.97,
      damage: 5.1,
      cost: 4.6,
      duration: 0.85,
      impact: 0.45,
    },
    groundPunch: {
      label: "Ground & pound",
      zone: "head",
      limb: "rightHand",
      range: 1.4,
      damage: 3.8,
      cost: 4.2,
      duration: 0.88,
      impact: 0.46,
    },
  },
  eo = {
    jab: [["cross"], ["hook"], ["cross", "lowKick"]],
    cross: [["lowKick"], ["takedown"]],
    bodyShot: [["hook"], ["uppercut"]],
    lowKick: [["cross"]],
    bodyKick: [["jab"]],
    hook: [["takedown"]],
  },
  fl = ["high", "body", "parry", "slip", "duck", "backstep", "lateral"];
class pl {
  constructor(t) {
    this.rng = t;
  }
  desiredRange(t, e) {
    const n = Pe[t.profile.style];
    return te(
      n.range +
        (t.tactics.distance - 50) * 0.008 +
        (t.stamina < 28 ? 0.6 : 0) +
        (t.damage.head > 65 && t.profile.personality.courage < 70 ? 0.3 : 0) -
        (e.memory.retreats > 8 && t.effective("intelligence") > 55 ? 0.2 : 0),
      0.85,
      2.2,
    );
  }
  defend(t, e) {
    var r, a;
    const s =
      ((a = Jn[(r = e.action) == null ? void 0 : r.type]) == null
        ? void 0
        : a.zone) === "body"
        ? ["body", "backstep", "lateral"]
        : ["high", "parry", "slip", "duck", "backstep"];
    return t.effective("intelligence") > 48
      ? this.rng.pick(s)
      : this.rng.pick(fl);
  }
  decide(t, e) {
    var p;
    const n = this.rng,
      s = Pe[t.profile.style],
      r = t.tactics,
      a = t.profile.personality;
    if (
      e.action &&
      !e.action.resolved &&
      n.chance(t.effective("defense") / 110)
    )
      return { type: "defend", defense: this.defend(t, e) };
    const o = 14 + r.conservation * 0.24 + a.conservatism * 0.07;
    if (t.stamina < o) return { type: "move", mode: "retreat" };
    if (t.distance > this.desiredRange(t, e) + 0.25)
      return { type: "move", mode: "advance" };
    if (t.distance < 0.78 && n.chance(0.4)) return { type: "clinch" };
    const l = e.damage.head > 65 || e.stamina < 25,
      c =
        s.attack +
        (r.aggression - 50) * 0.003 +
        (a.aggression - 50) * 0.002 +
        (l ? a.finish * 0.003 : 0) -
        (a.patience - 50) * 0.001;
    if ((p = e.action) != null && p.resolved && n.chance(s.counter))
      return {
        type: "strike",
        action: n.pick(["cross", "hook", "bodyShot"]),
        counter: !0,
      };
    if (
      t.combo.length &&
      t.stamina > o + 8 &&
      e.state !== "defending" &&
      n.chance(0.75)
    ) {
      const _ = t.combo.shift();
      if (_ === "takedown") return { type: _ };
      if (t.distance <= Jn[_].range + 0.1) return { type: "strike", action: _ };
    } else t.combo = [];
    const h =
      s.takedown * (r.takedowns / 35) + (r.focus === "wrestling" ? 0.2 : 0);
    if (
      t.distance < 1.5 &&
      t.stamina > 38 &&
      n.chance(h * (e.stamina < 30 ? 1.6 : 1))
    )
      return { type: "takedown" };
    if (t.distance < 1 && n.chance(0.17)) return { type: "clinch" };
    if (!n.chance(c))
      return { type: "move", mode: n.chance(0.45) ? "circle" : "wait" };
    let u = [
      "jab",
      "jab",
      "cross",
      "hook",
      "uppercut",
      "bodyShot",
      "lowKick",
      "bodyKick",
    ];
    if (
      (t.distance < 1 && u.push("knee"),
      (r.target === "body" ||
        (e.stamina < 45 && t.effective("intelligence") > 60)) &&
        u.push("bodyShot", "bodyKick", "bodyShot"),
      (r.target === "leg" || e.damage.leg > 45) &&
        u.push("lowKick", "lowKick", "lowKick"),
      (r.target === "head" || l) && u.push("cross", "hook", "uppercut"),
      r.focus === "boxing" && u.push("jab", "cross", "hook"),
      (u = u.filter(
        (_) =>
          Jn[_].range + 0.12 >= t.distance &&
          !(_.includes("Kick") && t.damage.leg > 65),
      )),
      t.memory.repeated >= 2 &&
        (u = u.filter((_) => _ !== t.memory.lastAttack)),
      !u.length)
    )
      return { type: "move", mode: "advance" };
    const f = n.pick(u);
    return (
      eo[f] &&
        n.chance((t.effective("intelligence") + r.pace) / 220) &&
        (t.combo = [...n.pick(eo[f])]),
      { type: "strike", action: f }
    );
  }
}
class ml {
  constructor(t) {
    this.sim = t;
  }
  resolve(t, e, n) {
    var _;
    const s = this.sim,
      r = s.rng,
      a = Jn[n.type],
      o = qi(t.position, e.position);
    let l = "clean";
    const c =
        e.state === "defending" &&
        ["slip", "duck", "backstep", "lateral"].includes(e.defenseType),
      h =
        0.65 +
        (t.effective("accuracy") - e.effective("defense")) * 0.005 +
        (n.counter ? 0.16 : 0);
    if (
      (o > a.range + 0.14 || !r.chance(h - (c ? 0.28 : 0))
        ? (l = "miss")
        : e.state === "defending"
          ? ((e.defenseType === "high" && a.zone === "head") ||
              (e.defenseType === "body" && a.zone === "body") ||
              e.defenseType === "parry") &&
            r.chance(0.58 + e.effective("defense") * 0.003)
            ? (l = "block")
            : r.chance(0.38) && (l = "graze")
          : r.chance(0.18) && (l = "graze"),
      l === "miss")
    ) {
      (t.count("missed"),
        (t.balance = te(t.balance - (n.type.includes("Kick") ? 7 : 2))),
        s.emit("miss", { actor: t.side, action: n.type }));
      return;
    }
    l === "block"
      ? (e.count("blocked"), e.spend(1.4))
      : (t.count("landed"),
        t.count(a.zone),
        l === "graze" && t.count("grazed"));
    const u = l === "block" ? 0.08 : l === "graze" ? 0.32 : 1,
      f = ["rocked", "stunned", "knockdown"].includes(e.state) ? 1.4 : 1,
      p =
        a.damage *
        (0.5 + t.effective("power") / 100) *
        r.range(0.65, 1.3) *
        u *
        f *
        (n.counter ? 1.2 : 1) *
        0.64;
    if (
      ((e.damage[a.zone] = te(e.damage[a.zone] + p)),
      (e.health = te(
        100 - e.damage.head * 0.58 - e.damage.body * 0.26 - e.damage.leg * 0.16,
      )),
      t.count("damage", p),
      (e.balance = te(e.balance - p * (a.zone === "head" ? 3.3 : 1.3))),
      a.zone === "body" && e.spend(p * 1.3),
      (t.unanswered = 0),
      l === "clean")
    ) {
      (e.unanswered++,
        e.action &&
          e.action.elapsed < e.action.duration * 0.2 &&
          p > 3 &&
          (e.action = null),
        !s.grappling.session &&
          !["knockdown", "KO"].includes(e.state) &&
          e.setState("hit-reaction", 0.28));
      const x = (e.position.x - t.position.x) / Math.max(0.1, o),
        m = (e.position.z - t.position.z) / Math.max(0.1, o);
      ((e.velocity.x += x * p * 0.05), (e.velocity.z += m * p * 0.05));
    }
    if (
      (s.emit("impact", {
        actor: t.side,
        target: e.side,
        action: n.type,
        zone: a.zone,
        outcome: l,
        damage: p,
      }),
      a.zone === "head" && l === "clean")
    ) {
      const x =
        e.damage.head + (100 - e.balance) * 0.35 - e.attributes.chin * 0.28;
      if (e.damage.head >= 99 || (x > 80 && p > 3.2 && r.chance(0.12))) {
        ((e.action = null), e.setState("KO", 1 / 0), s.finish(t.side, "KO"));
        return;
      }
      if (
        (e.unanswered >= 10 && e.damage.head > 78) ||
        (((_ = s.grappling.session) == null ? void 0 : _.mode) === "ground" &&
          e.unanswered >= 7 &&
          e.damage.head > 68)
      ) {
        s.finish(t.side, "TKO");
        return;
      }
      !s.grappling.session &&
      e.state !== "knockdown" &&
      x > 47 &&
      p > 2.4 &&
      r.chance(0.12 + p * 0.015)
        ? (t.count("knockdowns"),
          (e.action = null),
          e.setState("knockdown", r.range(3.2, 5.4)),
          s.emit("knockdown", { actor: t.side, target: e.side }))
        : !s.grappling.session &&
          e.state !== "knockdown" &&
          e.damage.head > 62 &&
          p > 2.8 &&
          r.chance(0.3) &&
          e.setState(e.balance < 25 ? "stunned" : "rocked", r.range(0.8, 1.8));
    }
    e.damage.leg > 96 && r.chance(0.07) && s.finish(t.side, "TKO · lesión");
  }
}
class gl {
  constructor(t) {
    ((this.sim = t), (this.session = null));
  }
  start(t, e = "attempt") {
    if (this.session) return;
    const n = this.sim.fighters[1 - t.side];
    qi(t.position, n.position) > (e === "clinch" ? 1.2 : 1.65) ||
      t.stamina < 12 ||
      ((this.session = {
        mode: e,
        top: t.side,
        time: 0,
        exchange: 0,
        control: 50,
        position: "guard",
        progress: 0,
      }),
      this.sim.fighters.forEach((s) => {
        ((s.action = null), (s.combo = []), (s.velocity = { x: 0, z: 0 }));
      }),
      e === "attempt"
        ? (t.count("takedownAttempts"),
          t.spend(9),
          n.memory.takedownsSeen++,
          t.setState("takedown-attempt", 1.4),
          (n.defenseType = "sprawl"),
          n.setState("defending", 1.4))
        : ((this.session.cage = Math.hypot(t.position.x, t.position.z) > 3),
          this.sim.fighters.forEach((s) => s.setState("clinch", 5))),
      this.sim.emit(e === "attempt" ? "takedown-attempt" : "clinch", {
        actor: t.side,
        cage: this.session.cage,
      }));
  }
  ground(t, e = "guard") {
    ((this.session = {
      mode: "ground",
      top: t,
      time: 0,
      exchange: 1,
      control: 52,
      position: e,
      progress: 0,
    }),
      this.syncGround(),
      this.sim.emit("ground", { actor: t, position: e }));
  }
  syncGround() {
    const t = this.session;
    this.sim.fighters.forEach((e) => {
      ((e.action = null),
        e.setState(e.side === t.top ? "ground-top" : "ground-bottom", 1 / 0),
        (e.groundPosition = t.position));
    });
  }
  release() {
    ((this.session = null),
      this.sim.fighters.forEach((t) => {
        ((t.action = null), t.setState("getting-up", 1.5), (t.cooldown = 1.7));
      }),
      this.sim.emit("standup"));
  }
  tick(t) {
    const e = this.session;
    if (!e) return;
    const n = this.sim,
      s = n.rng,
      r = n.fighters[e.top],
      a = n.fighters[1 - e.top];
    if (
      ((e.time += t), (e.exchange -= t), e.mode === "attempt" && e.time >= 1.4)
    ) {
      const h = r.effective("wrestling") + r.stamina * 0.25,
        u =
          a.effective("wrestling") +
          a.stamina * 0.2 +
          Math.min(14, a.memory.takedownsSeen * 2);
      s.chance(te(0.5 + (h - u) * 0.009, 0.15, 0.85))
        ? (r.count("takedowns"),
          a.spend(6),
          this.ground(r.side),
          n.emit("takedown", { actor: r.side }))
        : (n.emit("sprawl", { actor: a.side }), this.release());
      return;
    }
    if (e.mode === "clinch") {
      if ((r.spend(t * 0.8), a.spend(t * 0.7), e.exchange <= 0 && !r.action)) {
        if (
          ((e.exchange = s.range(2, 3.5)),
          s.chance(Pe[r.profile.style].takedown + 0.15))
        ) {
          ((this.session = null), this.start(r));
          return;
        }
        n.strike(r, "knee");
      }
      (e.time > 5 + r.effective("wrestling") * 0.06 || r.stamina < 15) &&
        this.release();
      return;
    }
    if (e.mode === "submission") {
      this.updateSubmission(t, r, a);
      return;
    }
    if (
      e.mode !== "ground" ||
      (r.count("control", t),
      r.spend(t * 0.32),
      a.spend(t * 0.4),
      (e.control = te(
        e.control +
          (r.effective("grappling") - a.effective("grappling")) * t * 0.045,
        8,
        92,
      )),
      e.exchange > 0 || r.action || a.action)
    )
      return;
    e.exchange = s.range(2.4, 4.8);
    const o =
      0.16 +
      (a.effective("wrestling") - r.effective("grappling")) * 0.004 +
      (50 - e.control) * 0.004;
    if (s.chance(o) && a.stamina > 14) {
      if ((a.spend(6), (e.control -= 16), e.control < 34 || e.time > 28)) {
        this.release();
        return;
      }
      if (s.chance(0.4)) {
        ((e.top = a.side),
          (e.position = "guard"),
          (e.control = 50),
          this.syncGround(),
          n.emit("scramble", { actor: a.side }));
        return;
      }
    }
    if (e.time > 65) {
      this.release();
      return;
    }
    const l =
      e.position === "guard" &&
      Pe[a.profile.style].submit > 0.5 &&
      s.chance(0.42)
        ? a
        : r;
    if (
      (l === a || e.position !== "guard") &&
      l.stamina > 28 &&
      s.chance(
        Pe[l.profile.style].submit * 0.55 +
          (l.tactics.focus === "grappling" ? 0.22 : 0),
      )
    ) {
      ((e.mode = "submission"),
        (e.attacker = l.side),
        (e.subName =
          l === a
            ? "Triangle"
            : e.position === "back"
              ? "Rear naked choke"
              : "Armbar"),
        (e.progress = 12),
        (e.escape = 0),
        (e.subTime = 0),
        l.count("submissions"),
        n.emit("submission-attempt", { actor: l.side, name: e.subName }));
      return;
    }
    if (s.chance(0.32) && r.stamina > 18) {
      const h = ["guard", "side", "mount", "back"];
      ((e.position = h[Math.min(3, h.indexOf(e.position) + 1)]),
        (e.control += 6),
        r.spend(4),
        this.syncGround(),
        n.emit("ground", { actor: r.side, position: e.position }));
    } else r.stamina > 12 && n.strike(r, "groundPunch");
  }
  updateSubmission(t) {
    const e = this.session,
      n = this.sim.fighters[e.attacker],
      s = this.sim.fighters[1 - e.attacker];
    ((e.subTime += t), n.spend(t * 1.6), s.spend(t * 2));
    const r = e.position === "back" ? 7 : e.position === "mount" ? 5 : 0,
      a =
        (n.effective("grappling") - s.effective("grappling")) * 0.17 +
        (n.stamina - s.stamina) * 0.08;
    if (
      ((e.progress = te(e.progress + t * (3.5 + r + a + e.control * 0.025))),
      (e.escape += t * Math.max(1.8, 5.3 - a + (100 - e.control) * 0.025)),
      e.progress >= 100 && e.subTime >= 6)
    ) {
      this.sim.finish(n.side, `Sumisión · ${e.subName}`);
      return;
    }
    (e.escape >= 100 || n.stamina < 8 || e.subTime > 24) &&
      (this.sim.emit("submission-escape", { actor: s.side }),
      (e.mode = "ground"),
      (e.position = "guard"),
      (e.control = 38),
      (e.exchange = 3),
      this.syncGround());
  }
}
const sr = 1 / 30,
  _l = 3.8,
  rr = new Set([
    "hit-reaction",
    "rocked",
    "stunned",
    "knockdown",
    "getting-up",
    "KO",
  ]);
class Hs {
  constructor(t, e = {}) {
    ((this.seed = e.seed ?? 42),
      (this.rng = new La(this.seed)),
      (this.options = { rounds: 3, roundSeconds: 300, ...e }),
      (this.fighters = t.map((n, s) => new ul(n, s))),
      (this.ai = new pl(this.rng)),
      (this.damage = new ml(this)),
      (this.grappling = new gl(this)),
      (this.round = 1),
      (this.clock = this.options.roundSeconds),
      (this.elapsed = 0),
      (this.phase = "fighting"),
      (this.breakTime = 0),
      (this.result = null),
      (this.events = []),
      (this.listeners = new Set()),
      (this.cards = [[], [], []]),
      (this.tickCount = 0),
      (this.accumulator = 0),
      (this.orderLog = []),
      (this.roundRecorded = !1),
      this.emit("bell", { round: 1 }));
  }
  subscribe(t) {
    return (this.listeners.add(t), () => this.listeners.delete(t));
  }
  emit(t, e = {}) {
    const n = {
      type: t,
      round: this.round,
      clock: this.clock,
      elapsed: this.elapsed,
      ...e,
    };
    (this.events.push(n),
      this.events.length > 600 && this.events.shift(),
      this.listeners.forEach((s) => s(n)));
  }
  advance(t) {
    for (
      this.accumulator += Math.min(t, 1);
      this.accumulator >= sr && !this.result;
    )
      (this.step(), (this.accumulator -= sr));
  }
  step() {
    if (this.result) return;
    const t = sr;
    if (((this.elapsed += t), this.tickCount++, this.phase === "break")) {
      ((this.breakTime -= t),
        this.fighters.forEach((e) => e.recover(t, !0)),
        this.breakTime <= 0 && this.startRound());
      return;
    }
    this.clock = Math.max(0, this.clock - t);
    for (const e of this.fighters) {
      if (
        ((e.stateTime += t),
        (e.cooldown -= t),
        e.recover(t),
        (e.distance = qi(e.position, this.fighters[1 - e.side].position)),
        e.action)
      ) {
        const n = e.action;
        if (
          ((n.elapsed += t),
          !n.resolved &&
            n.elapsed >= n.duration * Jn[n.type].impact &&
            ((n.resolved = !0),
            this.damage.resolve(e, this.fighters[1 - e.side], n),
            this.result))
        )
          return;
        e.action &&
          n.elapsed >= n.duration &&
          ((e.action = null),
          !this.grappling.session && !rr.has(e.state) && e.setState("stance"));
      }
      rr.has(e.state) &&
        e.stateTime >= e.stateDuration &&
        !this.grappling.session &&
        (e.state === "knockdown"
          ? ((e.balance = Math.max(35, e.balance)),
            e.setState("getting-up", 1.6))
          : (e.setState("stance"), (e.cooldown = 0.4)));
    }
    if ((this.grappling.tick(t), !this.result)) {
      if (this.grappling.session) this.alignGrappling(t);
      else {
        const e =
          this.tickCount % 2 ? this.fighters : [...this.fighters].reverse();
        for (const n of e) this.updateStanding(n, this.fighters[1 - n.side], t);
      }
      (this.resolveSpacing(), this.clock <= 1e-5 && this.endRound());
    }
  }
  updateStanding(t, e, n) {
    if (t.state !== "KO") {
      if (
        (t.state === "defending" &&
          t.stateTime > t.stateDuration &&
          t.setState("stance"),
        rr.has(t.state))
      )
        ((t.velocity.x *= 0.86), (t.velocity.z *= 0.86));
      else if (!t.action && t.cooldown <= 0) {
        if (e.state === "knockdown") {
          if (t.distance < 1.35) {
            this.grappling.ground(t.side, "mount");
            return;
          }
          this.move(t, e, "advance");
        } else {
          const r = this.ai.decide(t, e);
          (r.type === "strike" && this.strike(t, r.action, r.counter),
            r.type === "move" && this.move(t, e, r.mode),
            r.type === "defend" &&
              ((t.defenseType = r.defense),
              t.setState("defending", 0.65),
              t.spend(0.5),
              r.defense === "backstep"
                ? this.move(t, e, "retreat", !0)
                : r.defense === "lateral"
                  ? this.move(t, e, "circle", !0)
                  : (t.velocity = { x: 0, z: 0 })),
            r.type === "takedown" && this.grappling.start(t),
            r.type === "clinch" && this.grappling.start(t, "clinch"));
        }
        const s = t.effective("initiative") / 100;
        t.cooldown =
          this.rng.range(0.65, 1.55) *
          (1.3 - s * 0.35) *
          (1.35 - t.tactics.pace * 0.007);
      }
      (t.action && ((t.velocity.x *= 0.8), (t.velocity.z *= 0.8)),
        (t.position.x += t.velocity.x * n),
        (t.position.z += t.velocity.z * n),
        t.state === "moving" &&
          this.tickCount % 16 === t.side * 8 &&
          this.emit("step", { actor: t.side }));
    }
  }
  move(t, e, n, s = !1) {
    const r = Math.max(0.1, t.distance),
      a = (e.position.x - t.position.x) / r,
      o = (e.position.z - t.position.z) / r,
      l = (0.45 + t.effective("speed") * 0.005) * (1 - t.damage.leg * 0.004);
    let c = n === "advance" ? 1 : n === "retreat" ? -0.8 : 0;
    r < 0.9 && c > 0 && (c = 0);
    const h =
      n === "circle"
        ? this.rng.chance(0.5)
          ? 0.7
          : -0.7
        : this.rng.range(-0.22, 0.22);
    ((t.velocity = { x: (a * c - o * h) * l, z: (o * c + a * h) * l }),
      n === "retreat" && t.memory.retreats++,
      s || t.setState(n === "wait" ? "stance" : "moving", 1));
  }
  strike(t, e, n = !1) {
    const s = Jn[e];
    if (!s || t.action || t.stamina < s.cost) return;
    (t.spend(s.cost), t.count("thrown"));
    const r =
      s.duration *
      (1.35 - t.effective("speed") * 0.005) *
      this.rng.range(0.91, 1.09);
    ((t.action = {
      type: e,
      elapsed: 0,
      duration: r,
      resolved: !1,
      counter: n,
      variation: this.rng.next(),
    }),
      this.grappling.session || t.setState("attacking", r),
      (t.memory.repeated =
        t.memory.lastAttack === e ? t.memory.repeated + 1 : 0),
      (t.memory.lastAttack = e),
      this.emit("attack", { actor: t.side, action: e }));
  }
  alignGrappling(t) {
    const e = this.grappling.session,
      n = this.fighters[e.top],
      s = this.fighters[1 - e.top],
      r = Math.max(0.01, qi(n.position, s.position)),
      a = ["ground", "submission"].includes(e.mode) ? 0.56 : 0.7,
      o = (r - a) * Math.min(1, t * 5) * 0.5,
      l = (s.position.x - n.position.x) / r,
      c = (s.position.z - n.position.z) / r;
    ((n.position.x += l * o),
      (n.position.z += c * o),
      (s.position.x -= l * o),
      (s.position.z -= c * o));
  }
  resolveSpacing() {
    const [t, e] = this.fighters,
      n = this.grappling.session ? 0.52 : 0.83;
    let s = qi(t.position, e.position);
    if (s < n) {
      const r = s < 0.001 ? 1 : (e.position.x - t.position.x) / s,
        a = s < 0.001 ? 0 : (e.position.z - t.position.z) / s,
        o = (n - s) * 0.5;
      ((t.position.x -= r * o),
        (t.position.z -= a * o),
        (e.position.x += r * o),
        (e.position.z += a * o));
    }
    for (const r of this.fighters)
      for (let a = 0; a < 8; a++) {
        const o = (a * Math.PI) / 4,
          l = Math.cos(o),
          c = Math.sin(o),
          h = r.position.x * l + r.position.z * c - _l;
        h > 0 &&
          ((r.position.x -= h * l),
          (r.position.z -= h * c),
          (r.velocity.x *= 0.25),
          (r.velocity.z *= 0.25));
      }
  }
  recordRound() {
    if (this.roundRecorded) return;
    ((this.roundRecorded = !0),
      this.fighters.forEach((n) =>
        n.stats.rounds.push(structuredClone(n.roundStats)),
      ));
    const [t, e] = this.fighters.map((n) => n.roundStats);
    for (let n = 0; n < 3; n++) {
      const s = (o) =>
          o.damage * (1 + n * 0.07) +
          o.knockdowns * 12 +
          o.control * (0.045 + n * 0.035) +
          o.takedowns * 2 +
          o.landed * 0.15,
        r = s(t) - s(e) + this.rng.range(-6, 6),
        a =
          Math.abs(r) < 1.6
            ? [10, 10]
            : r > 0
              ? [10, Math.abs(r) > 33 ? 8 : 9]
              : [Math.abs(r) > 33 ? 8 : 9, 10];
      this.cards[n].push(a);
    }
  }
  endRound() {
    if (
      (this.recordRound(),
      this.emit("bell", { round: this.round }),
      this.round >= this.options.rounds)
    ) {
      this.decision();
      return;
    }
    ((this.phase = "break"),
      (this.breakTime = 12),
      (this.grappling.session = null),
      this.fighters.forEach((t) => {
        ((t.action = null),
          (t.velocity = { x: 0, z: 0 }),
          t.setState("round-end", 12));
      }),
      this.emit("round-end"));
  }
  startRound() {
    (this.round++,
      (this.clock = this.options.roundSeconds),
      (this.roundRecorded = !1),
      (this.phase = "fighting"),
      this.fighters.forEach((t) => {
        ((t.position = { x: t.side === 0 ? -1.6 : 1.6, z: 0 }),
          t.setState("stance"),
          (t.roundStats = Hr()),
          (t.combo = []),
          (t.cooldown = 0.6),
          (t.unanswered = 0));
      }),
      this.emit("bell", { round: this.round }));
  }
  decision() {
    const e = this.cards
        .map((a) => a.reduce((o, l) => [o[0] + l[0], o[1] + l[1]], [0, 0]))
        .map((a) => Math.sign(a[0] - a[1])),
      n = e.filter((a) => a > 0).length,
      s = e.filter((a) => a < 0).length,
      r = n >= 2 ? 0 : s >= 2 ? 1 : null;
    this.finish(
      r,
      r === null
        ? "Empate"
        : e.every((a) => a === e[0])
          ? "Decisión unánime"
          : n && s
            ? "Decisión dividida"
            : "Decisión mayoritaria",
    );
  }
  finish(t, e) {
    this.result ||
      (this.recordRound(),
      (this.phase = "finished"),
      this.fighters.forEach((n) => {
        ((n.action = null), (n.velocity = { x: 0, z: 0 }));
      }),
      (this.result = {
        winner: t,
        winnerId: t === null ? null : this.fighters[t].id,
        method: e,
        round: this.round,
        time: this.options.roundSeconds - this.clock,
        seed: this.seed,
        cards: structuredClone(this.cards),
        stats: this.fighters.map((n) => structuredClone(n.stats)),
        damage: this.fighters.map((n) => ({ ...n.damage })),
        fatigue: this.fighters.map((n) => n.fatigue),
        fighterIds: this.fighters.map((n) => n.id),
        orders: [...this.orderLog],
      }),
      this.emit("finish", { winner: t, method: e }));
  }
  order(t, e) {
    if (this.result) return;
    const n = this.fighters[t],
      s = 0.35 + n.profile.personality.discipline * 0.0065,
      a = {
        pressure: { aggression: 90, pace: 80, distance: 25 },
        slow: { pace: 20, conservation: 90 },
        takedown: { focus: "wrestling", takedowns: 95 },
        body: { target: "body" },
        leg: { target: "leg" },
        protect: { aggression: 20, conservation: 90, distance: 85 },
        finish: { aggression: 100, pace: 90, conservation: 15 },
        decision: {
          aggression: 38,
          pace: 35,
          conservation: 85,
          focus: "balanced",
        },
      }[e];
    if (a) {
      for (const [o, l] of Object.entries(a))
        n.tactics[o] =
          typeof l == "number" ? n.tactics[o] + (l - n.tactics[o]) * s : l;
      ((n.order = e),
        this.orderLog.push({ tick: this.tickCount, side: t, command: e }),
        this.emit("order", { actor: t, command: e }));
    }
  }
  runToEnd(t = 6e4) {
    let e = 0;
    for (; !this.result && e++ < t;) this.step();
    if (!this.result)
      throw new Error("La simulación excedió el límite de seguridad.");
    return this.result;
  }
}
const no = "llo-mma-v1",
  De = (i) =>
    new Date(Date.UTC(2026, 8, 18 + i)).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }),
  Te = (i) =>
    (i < 0 ? "-$" : "$") + Math.abs(Math.round(i)).toLocaleString("en-US"),
  Is = (i, t) => ({
    remaining: 4,
    duration: 365,
    signedDay: t,
    purse: Math.round(6500 + i.rating * 5),
    bonus: 4e3,
    sponsorShare: 0,
    commission: 0,
    clause: "Bonus por victoria. Mínimo 60% de condición para competir.",
  }),
  GYMS = [
    "Dragon Team",
    "Hierro Norte",
    "Iron Coast",
    "Lobos Gym",
    "Team Tempest",
    "Fénix MMA",
    "Casa Roja",
    "Vértice",
  ],
  PICK = (i) => i[Math.floor(Math.random() * i.length)],
  RND = (i, t) => i + Math.floor(Math.random() * (t - i + 1));
function vl() {
  const i = dl(),
    t = ["f0", "f6"];
  return (
    t.forEach(
      (e) =>
        (i.find((n) => n.id === e).contract = Is(
          i.find((n) => n.id === e),
          0,
        )),
    ),
    {
      version: 1,
      day: 0,
      money: 65e3,
      roster: t,
      fighters: i,
      selected: "f0",
      nextId: 1,
      champions: Object.fromEntries(
        Ke.map((e) => [
          e.id,
          [...i.filter((n) => n.division === e.id)].sort(
            (n, s) => s.rating - n.rating,
          )[0].id,
        ]),
      ),
      booking: null,
      results: [],
      events: [],
      offers: [],
      ledger: [],
      news: [
        {
          day: 0,
          title: "Comienza la temporada",
          text: "Reserva un combate en Matchmaking y prepara el campamento.",
        },
      ],
    }
  );
}
class xl {
  constructor(t = null) {
    ((this.storage = t), (this.warning = ""), (this.state = vl()));
    try {
      const e = t == null ? void 0 : t.getItem(no);
      e && (this.state = io(JSON.parse(e)));
    } catch {
      this.warning =
        "No se pudo leer el guardado. Se abrió una partida nueva sin sobrescribir el archivo anterior.";
    }
  }
  save() {
    var t;
    try {
      (t = this.storage) == null || t.setItem(no, JSON.stringify(this.state));
    } catch {
      this.warning =
        "Almacenamiento no disponible o lleno. Exporta tu partida para conservarla.";
    }
  }
  fighter(t = this.state.selected) {
    return this.state.fighters.find((e) => e.id === t);
  }
  roster() {
    return this.state.roster.map((t) => this.fighter(t));
  }
  select(t) {
    if (!this.state.roster.includes(t))
      throw new Error("Elige un peleador de tu equipo.");
    ((this.state.selected = t), this.save());
  }
  ranking(t) {
    return this.state.fighters
      .filter((e) => e.division === t && !e.retired)
      .sort((e, n) => this.rankScore(n) - this.rankScore(e));
  }
  rankScore(t) {
    const e = t.history
      .slice(-5)
      .reduce(
        (n, s) => n + (s.outcome === "W" ? 5 : s.outcome === "L" ? -3 : 0),
        0,
      );
    return (
      t.rating +
      Math.max(-3, Math.min(5, t.streak)) * 4 +
      e -
      Math.max(0, this.state.day - t.lastFightDay - 90) * 0.08
    );
  }
  rank(t) {
    return this.ranking(t.division).findIndex((e) => e.id === t.id) + 1;
  }
  available(t) {
    return !t.retired && t.injuryUntil <= this.state.day && t.condition >= 60;
  }
  contractActive(t) {
    return (
      t.contract &&
      t.contract.remaining > 0 &&
      t.contract.signedDay + t.contract.duration > this.state.day
    );
  }
  opponents(t = this.fighter()) {
    return this.ranking(t.division).filter(
      (e) => e.id !== t.id && !this.state.roster.includes(e.id),
    );
  }
  offer(t, e = this.fighter()) {
    var s;
    const n = zs(t) - zs(e);
    return {
      risk: n > 4 ? "Alto" : n < -4 ? "Bajo" : "Medio",
      reward: Math.round(
        (((s = e.contract) == null ? void 0 : s.purse) ?? 12e3) +
          Math.max(0, t.rating - e.rating) * 7,
      ),
      rivalry: e.history.filter((r) => r.rivalId === t.id).length,
      compatibility:
        t.style === "wrestler" && e.style === "pressure"
          ? "Amenaza de derribo"
          : t.style === "grappler"
            ? "Peligro en el suelo"
            : "Duelo de estilos",
    };
  }
  transact(t, e, n) {
    if (!Number.isFinite(t) || this.state.money + t < 0)
      throw new Error("No hay fondos suficientes.");
    ((this.state.money += t),
      this.state.ledger.push({
        day: this.state.day,
        amount: t,
        category: e,
        note: n,
      }),
      this.onMoney && this.onMoney(t));
  }
  news(t, e) {
    (this.state.news.unshift({ day: this.state.day, title: t, text: e }),
      (this.state.news = this.state.news.slice(0, 80)));
  }
  book(t) {
    if (this.state.booking) throw new Error("Ya tienes un combate reservado.");
    const e = this.fighter(),
      n = this.fighter(t);
    if (!n || !this.opponents(e).includes(n))
      throw new Error("Rival incompatible con esta división.");
    if (!this.available(e) || !this.available(n))
      throw new Error(
        "Uno de los peleadores está lesionado o no está en condiciones.",
      );
    if (!this.contractActive(e))
      throw new Error("Renueva el contrato antes de aceptar una pelea.");
    const s = this.state.nextId++,
      r = this.state.champions[e.division],
      a = (this.rank(e) <= 3 && n.id === r) || r === e.id,
      o = {
        id: `event-${s}`,
        name: `LLO ${String(s).padStart(2, "0")}`,
        venue: [
          "T-Mobile Arena · Las Vegas",
          "Palacio Vistalegre · Madrid",
          "Accor Arena · París",
        ][s % 3],
        date: this.state.day + 42,
        title: a,
        bouts: [{ ids: [e.id, n.id], slot: "Estelar" }],
        completed: !1,
      },
      l = this.state.fighters.filter(
        (c) =>
          !this.state.roster.includes(c.id) &&
          c.id !== n.id &&
          this.available(c),
      );
    for (const c of Ke) {
      const h = l.filter((u) => u.division === c.id).slice(0, 2);
      h.length === 2 &&
        o.bouts.push({
          ids: h.map((u) => u.id),
          slot: o.bouts.length === 1 ? "Coestelar" : "Preliminar",
        });
    }
    (this.state.events.push(o),
      (this.state.booking = {
        id: o.id,
        fighterId: e.id,
        rivalId: t,
        date: o.date,
        purse: this.offer(n, e).reward,
        title: a,
        seed: 7001 + s * 7919,
        rounds: a ? 5 : 3,
        prepared: !1,
      }),
      this.news(
        a ? "La llamada al título" : "Combate confirmado",
        `${$t(e)} vs ${$t(n)}. ${o.name}.`,
      ),
      this.save());
  }
  cancelBooking() {
    const t = this.state.booking;
    if (!t || t.prepared) throw new Error("No se puede cancelar este combate.");
    (this.transact(-1e3, "Cancelación", "Gastos de organización"),
      (this.state.events = this.state.events.filter((e) => e.id !== t.id)),
      (this.state.booking = null),
      this.save());
  }
  advanceDays(t, e = !1) {
    var r;
    if (!Number.isInteger(t) || t < 0 || t > 365)
      throw new Error("Periodo inválido.");
    const n = this.state;
    if (n.booking && !e && n.day + t > n.booking.date)
      throw new Error("Primero disputa el combate pendiente.");
    const s = n.day;
    n.day += t;
    for (let w = Math.floor(n.day / 7) - Math.floor(s / 7); w > 0; w--)
      this.cpuWeek();
    for (const a of n.fighters) {
      ((a.condition = te(a.condition + t * 1.4)),
        (a.morale = te(a.morale + t * 0.06)),
        a.injuryUntil > s &&
          a.injuryUntil <= n.day &&
          this.news(
            "Regreso al campamento",
            `${$t(a)} recibe el alta médica.`,
          ));
      const o = Math.floor(n.day / 365) - Math.floor(s / 365);
      ((a.age += o),
        a.age >= 34 &&
          o &&
          (["speed", "cardio", "power"].forEach(
            (l) =>
              (a.attributes[l] = te(
                a.attributes[l] - o * (a.age - 32) * 0.7,
                25,
                99,
              )),
          ),
          (a.career = "Declive")),
        a.age >= 40 &&
          !a.retired &&
          ((a.retired = !0),
          (a.career = "Retiro"),
          (this.news("Retiro", `${$t(a)} se retira del circuito.`),
          a.gym && (a.gym = null),
          n.roster.includes(a.id) ||
            this.spawnProspect(a.division))));
    }
    for (let y = Math.floor(n.day / 365) - Math.floor(s / 365); y > 0; y--)
      for (const a of Ke) this.spawnProspect(a.id);
    for (const a of Ke)
      (r = this.fighter(n.champions[a.id])) != null &&
        r.retired &&
        (n.champions[a.id] = null);
    this.save();
  }
  spawnProspect(t) {
    const e = this.state;
    if (e.fighters.length >= 60) return null;
    const n = e.nextId++,
      s = Mc(
        `p${n}`,
        [
          PICK(["Tomás", "Darío", "Iván", "Marco", "Leo", "Omar", "Kai", "Nico", "Sami", "André", "Félix", "Rubén"]),
          PICK(["Ríos", "Fontana", "Kowalski", "Ibrahim", "Sato", "Duarte", "Mendes", "Keller", "Ortega", "Lindqvist", "Bauer", "Osei"]),
          PICK(["EL TANQUE", "VIPER", "COBRA", "RELÁMPAGO", "MARTILLO", "ZORRO", "HALCÓN", "BRUJO"]),
          PICK(["PER", "VAL", "GRA", "MAG", "MRG", "RIA", "TAM", "KAI", "MEL", "CUN", "SAH", "ZEN"]),
        ],
        t,
        PICK(Object.keys(Pe)),
        n * 31 + 7,
      );
    ((s.age = RND(19, 22)),
      (s.record = { wins: RND(0, 3), losses: RND(0, 1), draws: 0 }),
      (s.rating = RND(1000, 1090)),
      (s.popularity = 10),
      (s.potential = RND(80, 97)),
      Object.keys(s.attributes).forEach(
        (a) => (s.attributes[a] = te(s.attributes[a] - 6, 1, 100)),
      ),
      e.fighters.push(s));
    return s;
  }
  askFor(t, e) {
    return t === "sign"
      ? Math.round(e.rating * 9)
      : Math.round((1200 + e.rating * 0.9) / 100) * 100;
  }
  negotiate(t, e, n) {
    const s = this.fighter(e),
      r = this.askFor(t, s),
      a = (s.morale - 50) / 500,
      o = n / r;
    return o >= 0.98 - a * 0.5
      ? { status: "accepted", price: Math.round(n) }
      : o >= 0.85 - a
        ? {
            status: "counter",
            price: Math.min(r, Math.round((n + r) / 2 / 50) * 50),
          }
        : { status: "rejected" };
  }
  cpuWeek() {
    const t = this.state;
    t.offers || (t.offers = []);
    const e = t.booking ? [t.booking.rivalId, t.booking.fighterId] : [],
      n = t.fighters.filter(
        (a) =>
          !a.retired && !t.roster.includes(a.id) && !a.gym && !e.includes(a.id),
      );
    if (n.length > 8 && Math.random() < 0.4) {
      const a = PICK(n);
      ((a.gym = PICK(GYMS)),
        this.news("Movimiento en el mercado", `${$t(a)} firma con ${a.gym}.`));
    }
    const s = t.fighters.filter((a) => a.gym && !a.retired && !e.includes(a.id));
    if (s.length && Math.random() < 0.3) {
      const a = PICK(s);
      ((a.gym = null),
        this.news("Nuevo agente libre", `${$t(a)} queda libre y está en el mercado.`));
    }
    t.offers = t.offers.filter(
      (a) => a.expires > t.day && t.roster.includes(a.fighterId),
    );
    for (const a of t.roster) {
      const o = this.fighter(a);
      if (
        !o ||
        o.retired ||
        t.roster.length <= 1 ||
        t.offers.some((l) => l.fighterId === a) ||
        (t.booking && t.booking.fighterId === a)
      )
        continue;
      if (Math.random() < 0.06 + Math.max(0, o.rating - 1150) / 4000) {
        const l = {
          id: `o${t.day}-${a}`,
          fighterId: a,
          gym: PICK(GYMS),
          amount: Math.round((o.rating * 9 * (0.9 + Math.random() * 0.5)) / 50) * 50,
          expires: t.day + 21,
        };
        (t.offers.push(l),
          this.news("Oferta recibida", `${l.gym} ofrece ${Te(l.amount)} por ${$t(o)}.`));
      }
    }
  }
  acceptOffer(t, e = 1) {
    const n = this.state,
      s = (n.offers || []).find((o) => o.id === t);
    if (!s) throw new Error("La oferta ya no está disponible.");
    const r = this.fighter(s.fighterId);
    if (n.roster.length <= 1)
      throw new Error("Necesitas al menos un peleador en el club.");
    if (n.booking && n.booking.fighterId === r.id)
      throw new Error("Tiene un combate reservado; cancélalo primero.");
    const a = Math.round(s.amount * e);
    (this.transact(a, "Traspaso", `Venta de ${$t(r)} a ${s.gym}`),
      (n.roster = n.roster.filter((o) => o !== r.id)),
      (r.gym = s.gym),
      n.selected === r.id && (n.selected = n.roster[0]),
      (n.offers = n.offers.filter((o) => o.id !== t)),
      this.news("Peleador vendido", `${$t(r)} pasa a ${s.gym} por ${Te(a)}.`),
      this.save());
  }
  counterOffer(t) {
    const e = (this.state.offers || []).find((n) => n.id === t);
    if (!e) throw new Error("La oferta ya no está disponible.");
    if (Math.random() < 0.5) return (this.acceptOffer(t, 1.15), !0);
    return (
      (this.state.offers = this.state.offers.filter((n) => n.id !== t)),
      this.news("Oferta retirada", `${e.gym} rechaza tu contraoferta.`),
      this.save(),
      !1
    );
  }
  rejectOffer(t) {
    ((this.state.offers = (this.state.offers || []).filter((e) => e.id !== t)),
      this.save());
  }
  train(t, e = this.state.selected) {
    var o;
    const n = this.fighter(e),
      s = kr[t];
    if (!s || !this.state.roster.includes(e) || n.retired)
      throw new Error("Campamento no disponible.");
    if ((o = this.state.booking) != null && o.prepared)
      throw new Error(
        "El combate ya está preparado; no puedes modificar el campamento.",
      );
    if (
      t !== "recovery" &&
      (n.injuryUntil > this.state.day || n.condition < 40)
    )
      throw new Error("El peleador necesita recuperación.");
    if (this.state.booking && this.state.day + 7 > this.state.booking.date)
      throw new Error("No queda una semana antes del combate.");
    this.transact(-s.cost, "Campamento", `${$t(n)} · ${s.name}`);
    const r = n.condition;
    this.advanceDays(7);
    const a = {};
    for (const l of s.attributes) {
      const c =
          Math.max(0.1, (n.potential - n.attributes[l]) / 22) *
          (n.age > 33 ? 0.5 : 1),
        h = n.attributes[l];
      ((n.attributes[l] = te(h + c, 1, n.potential)),
        (a[l] = n.attributes[l] - h));
    }
    return (
      (n.condition = te(r - s.load + 5)),
      (n.morale = te(n.morale + 2)),
      t === "recovery"
        ? (n.injuryUntil = Math.max(this.state.day, n.injuryUntil - 7))
        : n.condition < 32 &&
          ((n.injuryUntil = this.state.day + 14),
          this.news(
            "Lesión de entrenamiento",
            `${$t(n)}: sobrecarga. Dos semanas de recuperación.`,
          )),
      n.training.push({ day: this.state.day, type: t, gains: a }),
      this.save(),
      a
    );
  }
  setTactics(t, e = this.state.selected) {
    const n = this.fighter(e);
    if (!n || !this.state.roster.includes(e))
      throw new Error("Peleador no válido.");
    for (const s of [
      "pace",
      "distance",
      "takedowns",
      "aggression",
      "conservation",
    ]) {
      if (!Number.isFinite(Number(t[s])))
        throw new Error("Valor táctico inválido.");
      n.tactics[s] = te(Number(t[s]));
    }
    if (
      !["balanced", "boxing", "wrestling", "grappling"].includes(t.focus) ||
      !["mixed", "head", "body", "leg"].includes(t.target)
    )
      throw new Error("Estrategia inválida.");
    ((n.tactics.focus = t.focus), (n.tactics.target = t.target), this.save());
  }
  prepareFight() {
    const t = this.state.booking;
    if (!t) throw new Error("Acepta primero un combate.");
    const e = this.fighter(t.fighterId),
      n = this.fighter(t.rivalId);
    if (
      e.injuryUntil > t.date ||
      n.injuryUntil > t.date ||
      e.retired ||
      n.retired
    )
      throw new Error(
        "Un peleador no puede competir en la fecha prevista. Cancela el evento.",
      );
    if (
      (this.advanceDays(Math.max(0, t.date - this.state.day), !0),
      !this.available(e) || !this.contractActive(e))
    )
      throw new Error("Revisa condición y contrato antes del combate.");
    return (
      (t.prepared = !0),
      t.profiles ?? (t.profiles = structuredClone([e, n])),
      this.save(),
      new Hs(t.profiles, { seed: t.seed, rounds: t.rounds })
    );
  }
  applyResult(t) {
    const e = this.state.booking;
    if (!e || this.state.results.some((h) => h.id === e.id)) return null;
    if (
      t.seed !== e.seed ||
      t.fighterIds.join() !== [e.fighterId, e.rivalId].join()
    )
      throw new Error("El resultado no corresponde al combate reservado.");
    const n = this.state.events.find((h) => h.id === e.id),
      s = this.fighter(e.fighterId),
      r = {
        ...structuredClone(t),
        id: e.id,
        day: this.state.day,
        title: e.title,
        profiles: e.profiles,
      };
    (this.updateRecords(r, e.title),
      this.state.results.unshift(r),
      (n.bouts[0].result = r),
      (n.completed = !0));
    const a = t.winner === 0,
      l = e.purse + (a ? s.contract.bonus : 0);
    (this.transact(l, "Bolsa", `${n.name}${a ? " + bonus por victoria" : ""}`),
      s.contract.remaining--);
    for (let h = 1; h < n.bouts.length; h++) {
      const u = n.bouts[h],
        f = u.ids.map((_) => this.fighter(_)),
        p = new Hs(f, { seed: e.seed + h, rounds: 3 }).runToEnd();
      ((u.result = { ...p, day: this.state.day }),
        this.updateRecords(u.result, !1));
    }
    return (
      (r.netIncome = l),
      (this.state.booking = null),
      this.save(),
      r
    );
  }
  updateRecords(t, e) {
    const n = t.fighterIds.map((a) => this.fighter(a)),
      s = n.map((a) => a.rating),
      r = n.map((a) => this.rank(a));
    n.forEach((a, o) => {
      const l = n[1 - o],
        c = t.winner === o,
        h = t.winner === null;
      a.record[h ? "draws" : c ? "wins" : "losses"]++;
      const u = 1 / (1 + 10 ** ((s[1 - o] - s[o]) / 400));
      ((a.rating += Math.round((e ? 64 : 40) * ((h ? 0.5 : c ? 1 : 0) - u))),
        (a.streak = h
          ? 0
          : c
            ? Math.max(0, a.streak) + 1
            : Math.min(0, a.streak) - 1),
        (a.popularity = te(a.popularity + (c ? (e ? 12 : 5) : -1))),
        (a.morale = te(a.morale + (c ? 8 : -8))),
        a.history.push({
          day: this.state.day,
          rivalId: l.id,
          outcome: h ? "D" : c ? "W" : "L",
          method: t.method,
          eventId: t.id,
        }));
      const f = t.damage[o];
      if (
        ((a.condition = te(
          100 - f.head * 0.4 - f.body * 0.2 - f.leg * 0.3 - t.fatigue[o] * 0.2,
          20,
        )),
        (a.injuryUntil =
          this.state.day + (Math.max(...Object.values(f)) > 72 ? 35 : 14)),
        (a.lastFightDay = this.state.day),
        e && c)
      ) {
        const p = this.state.champions[a.division] === a.id;
        ((this.state.champions[a.division] = a.id),
          (a.defenses = p ? a.defenses + 1 : 0));
      }
      ((a.career =
        a.age >= 34
          ? "Declive"
          : this.state.champions[a.division] === a.id
            ? a.defenses
              ? "Defensas"
              : "Campeón"
            : this.rank(a) <= 2
              ? "Title shot"
              : this.rank(a) <= 4
                ? "Contendiente"
                : "Prospecto"),
        this.state.roster.includes(a.id) &&
          (this.news(
            c
              ? `${a.lastName} levanta la mano`
              : h
                ? "No hubo vencedor"
                : `Una noche difícil para ${a.lastName}`,
            `${t.method}. ${c && s[1 - o] > s[o] + 120 ? "Victoria contra pronóstico. " : ""}${a.streak >= 3 ? `Racha de ${a.streak} victorias. ` : ""}Suspensión médica hasta ${De(a.injuryUntil)}.`,
          ),
          a.history.filter((p) => p.rivalId === l.id).length > 1 &&
            this.news(
              "La rivalidad continúa",
              `${a.lastName} y ${l.lastName} vuelven a cruzar sus caminos.`,
            ),
          this.rank(a) > r[o] &&
            this.news(
              "Movimiento en el ranking",
              `${a.lastName} cae al puesto #${this.rank(a)}.`,
            ),
          a.career === "Title shot" &&
            this.news(
              "A un paso del oro",
              `${a.lastName} está en posición de disputar el cinturón.`,
            )));
    });
  }
  sign(t, price) {
    var n;
    const e = this.fighter(t);
    if (!e || e.retired || this.state.roster.includes(t))
      throw new Error("No se puede fichar a este peleador.");
    if (e.gym) throw new Error(`${$t(e)} tiene contrato con ${e.gym}.`);
    if (((n = this.state.booking) == null ? void 0 : n.rivalId) === t)
      throw new Error("No puedes fichar al rival de una pelea reservada.");
    (this.transact(-Math.round(price ?? e.rating * 9), "Fichaje", $t(e)),
      this.state.roster.push(t),
      (e.contract = Is(e, this.state.day)),
      this.news("Nuevo fichaje", `${$t(e)} se une al equipo.`),
      this.save());
  }
  renew(t, price) {
    var n;
    const e = this.fighter(t);
    if (!e || !this.state.roster.includes(t) || e.retired)
      throw new Error("Contrato no disponible.");
    if (
      ((n = this.state.booking) == null ? void 0 : n.fighterId) === t &&
      this.state.booking.prepared
    )
      throw new Error("No se puede renegociar una pelea en curso.");
    (this.transact(-Math.round(price ?? this.askFor("renew", e)), "Contrato", `Renovación · ${$t(e)}`),
      (e.contract = Is(e, this.state.day)),
      this.save());
  }
  export() {
    return JSON.stringify(this.state, null, 2);
  }
  import(t) {
    const e = io(JSON.parse(t));
    ((this.state = e), this.save());
  }
}
function io(i) {
  const t = () => {
      throw new Error("Archivo de partida inválido o versión incompatible.");
    },
    e = (s) => typeof s == "number" && Number.isFinite(s);
  ((!i ||
    i.version !== 1 ||
    !e(i.money) ||
    i.money < 0 ||
    !Number.isInteger(i.day) ||
    i.day < 0 ||
    !Number.isInteger(i.nextId) ||
    !Array.isArray(i.fighters) ||
    i.fighters.length > 500 ||
    !i.fighters.length) &&
    t(),
    ["roster", "results", "events", "ledger", "news"].every((s) =>
      Array.isArray(i[s]),
    ) || t());
  const n = new Set();
  for (const s of i.fighters) {
    ((!s ||
      typeof s.id != "string" ||
      n.has(s.id) ||
      !["firstName", "lastName", "nickname", "country", "skin", "career"].every(
        (r) => typeof s[r] == "string" && s[r].length < 100,
      )) &&
      t(),
      n.add(s.id),
      LLO_NAT[s.country] && (s.country = LLO_NAT[s.country]),
      (!Pe[s.style] ||
        !Ke.some((r) => r.id === s.division) ||
        !s.attributes ||
        !s.personality ||
        !s.tactics ||
        !s.record ||
        !Array.isArray(s.history) ||
        !Array.isArray(s.training)) &&
        t());
    for (const r of [
      "age",
      "rating",
      "popularity",
      "morale",
      "condition",
      "potential",
      "injuryUntil",
      "lastFightDay",
      "streak",
      "defenses",
    ])
      e(s[r]) || t();
    for (const r of [
      "accuracy",
      "defense",
      "power",
      "speed",
      "wrestling",
      "grappling",
      "cardio",
      "initiative",
      "intelligence",
      "chin",
    ])
      (!e(s.attributes[r]) || s.attributes[r] < 1 || s.attributes[r] > 100) &&
        t();
    for (const r of [
      "aggression",
      "patience",
      "courage",
      "conservatism",
      "finish",
      "discipline",
    ])
      (!e(s.personality[r]) ||
        s.personality[r] < 0 ||
        s.personality[r] > 100) &&
        t();
    for (const r of Object.keys(xc).filter(
      (a) => !["focus", "target"].includes(a),
    ))
      (!e(s.tactics[r]) || s.tactics[r] < 0 || s.tactics[r] > 100) && t();
    ((!["balanced", "boxing", "wrestling", "grappling"].includes(
      s.tactics.focus,
    ) ||
      !["mixed", "head", "body", "leg"].includes(s.tactics.target)) &&
      t(),
      s.contract &&
        ![
          "remaining",
          "duration",
          "signedDay",
          "purse",
          "bonus",
          "sponsorShare",
          "commission",
        ].every((r) => e(s.contract[r]) && s.contract[r] >= 0) &&
        t(),
      ["wins", "losses", "draws"].every(
        (r) => Number.isInteger(s.record[r]) && s.record[r] >= 0,
      ) || t());
  }
  return (
    Array.isArray(i.offers) || (i.offers = []),
    (!i.roster.length ||
      !i.roster.every((s) => n.has(s)) ||
      !i.roster.includes(i.selected) ||
      !i.champions) &&
      t(),
    i.booking &&
      (!n.has(i.booking.fighterId) ||
        !n.has(i.booking.rivalId) ||
        !e(i.booking.seed) ||
        !e(i.booking.date) ||
        ![3, 5].includes(i.booking.rounds)) &&
      t(),
    i.ledger.every(
      (s) =>
        e(s.amount) &&
        e(s.day) &&
        typeof s.category == "string" &&
        typeof s.note == "string",
    ) || t(),
    i.news.every(
      (s) =>
        e(s.day) && typeof s.title == "string" && typeof s.text == "string",
    ) || t(),
    structuredClone(i)
  );
}
const Ml = (i) =>
    String(i ?? "").replace(
      /[&<>"']/g,
      (t) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[t],
    ),
  xt = Ml,
  so = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    users:
      '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2"/>',
    trophy:
      '<path d="M8 3h8v6a4 4 0 0 1-8 0V3ZM8 5H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4M12 13v7m-4 1h8"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
    activity: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
    target:
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    market:
      '<path d="M3 8h18l-2-5H5L3 8Zm1 0v13h16V8M9 21v-7h6v7M3 8a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
    contract: '<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    history: '<path d="M3 11a9 9 0 1 1 2.2 7M3 4v7h7m2-5v6l4 2"/>',
    wallet:
      '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M16 11h5v5h-5a2.5 2.5 0 0 1 0-5M3 7V4l14-2v3"/>',
    settings:
      '<path d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8M5.6 18.4l2.8-2.8m7.2-7.2 2.8-2.8"/><circle cx="12" cy="12" r="5"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    play: '<path d="m8 4 13 8-13 8V4Z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6"/>',
    shield:
      '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6"/>',
    volume:
      '<path d="m11 4-5 5H3v6h3l5 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    camera:
      '<rect x="3" y="6" width="18" height="15" rx="2"/><path d="m7 6 2-3h6l2 3"/><circle cx="12" cy="13" r="4"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  },
  zt = (i, t = "") =>
    `<svg class="icon ${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${so[i] || so.target}</svg>`,
  jt = (i, t, e = "primary", n = "") =>
    `<button class="btn ${e}" data-action="${t}" ${n}>${i}</button>`,
  en = (i, t, e = "text") =>
    jt(`${i} ${zt("arrow")}`, "nav", e, `data-page="${t}"`),
  Ce = (i, t = "") => `<span class="badge ${t}">${xt(i)}</span>`,
  Qn = (i) => {
    var t;
    return ((t = Ke.find((e) => e.id === i)) == null ? void 0 : t.name) || i;
  },
  In = (i) => `${i.record.wins}–${i.record.losses}–${i.record.draws}`,
  Yi = (i, t = "") =>
    `<span class="meter ${t}"><i style="width:${Math.max(0, Math.min(100, Number(i)))}%"></i></span>`,
  Vs = (i) =>
    `${Math.floor(Math.max(0, i) / 60)}:${String(Math.floor(Math.max(0, i) % 60)).padStart(2, "0")}`,
  We = (i, t, e, n = "") =>
    `<div class="page-heading"><div><div class="eyebrow">${i}</div><h1>${t}</h1><p>${e}</p></div><div class="heading-actions">${n}</div></div>`,
  Zs = (i, t, e = "") =>
    `<div class="empty">${zt("target")}<h3>${i}</h3><p>${t}</p>${e}</div>`;
function ts(i, t = "", e = "#bfe75b") {
  const n = /^#[a-f0-9]{6}$/i.test(i.skin) ? i.skin : "#ad704e";
  return `<div class="portrait ${t}" style="--portrait-accent:${e}"><svg viewBox="0 0 200 220" role="img" aria-label="Retrato de ${xt($t(i))}"><path fill="${e}" opacity=".14" d="M5 210 120 5h55L60 220Z"/><path fill="${n}" d="M83 96v18L48 127c-14 6-22 20-26 47l-9 46h174l-11-48c-5-28-10-39-25-45l-34-13V94Z"/><path fill="#000" opacity=".18" d="m100 112-5 34-34-9 7 53 27 30h24l15-45 11-39-28 8Z"/><path fill="${n}" d="M70 52q3-32 31-32 34 0 33 35l-5 34-13 21H91L76 91Z"/><path fill="#17191b" d="M71 62 68 40q2-23 31-23 35 0 35 28l-4 16-7-16-20-8-24 10Z"/><path fill="#222" opacity=".85" d="m77 77 9 13 16 7 16-9 11-12-6 21-12 13H93L80 96Z"/><path stroke="#352a24" stroke-width="3" d="m80 61 12-1m16 0 13 1m-23 2-3 17h9m-11 7h13" fill="none"/><path stroke="#fff" opacity=".1" stroke-width="2" d="m48 133 36 12m31 0 30-12M102 151v52"/><path fill="#171b20" d="m19 199 31-7 9 28H13Zm133-7 30 7 5 21h-39Z"/><path fill="${e}" d="m19 198 31-7 3 10-36 7Zm133-7 30 7 2 10-36-7Z"/></svg></div>`;
}
function Sl(i, t) {
  return `<tr><td><button class="fighter-name" data-action="profile" data-id="${xt(i.id)}">${ts(i, "avatar")}<span><strong>${xt($t(i))}</strong><small>${xt(Pe[i.style].name)}</small></span></button></td><td>${Qn(i.division)}</td><td><b>${In(i)}</b></td><td>#${t.rank(i)}</td><td><div class="condition">${Yi(i.condition)}<span>${Math.round(i.condition)}%</span></div></td><td>${Ce(t.available(i) ? "Disponible" : "Recuperación", t.available(i) ? "green" : "amber")}</td><td><button class="icon-btn" aria-label="Ver ficha de ${xt($t(i))}" data-action="profile" data-id="${xt(i.id)}">${zt("chevron")}</button></td></tr>`;
}
const es = (i, t) =>
  `<div class="table-scroll"><table><thead><tr>${i.map((e) => `<th>${e}</th>`).join("")}</tr></thead><tbody>${t}</tbody></table></div>`;
function ro(i) {
  const t = i.state,
    e = i.fighter(),
    n = t.booking,
    s = n ? i.fighter(n.rivalId) : i.opponents(e).find((o) => i.available(o)),
    r = Math.round(
      i.roster().reduce((o, l) => o + l.condition, 0) / t.roster.length,
    ),
    a = t.results.filter((o) => o.winner === 0).length;
  return `${We("PANEL", "Panel del club", "Resumen de tu gimnasio.", jt(`${zt("calendar")} Avanzar 7 días`, "advance", "secondary"))}
    ${(t.offers || []).length ? `<div class="notice">${zt("bell")} Tienes ${t.offers.length} oferta(s) por tus peleadores. ${en("Ver ofertas", "market")}</div>` : ""}
    <section class="hero">
      <div id="arena" class="hero-arena"></div><div class="hero-shade"></div>
      <div class="hero-copy"><span class="hero-kicker"><i></i> ${n ? "COMBATE CONFIRMADO" : "SIN COMBATE RESERVADO"}</span><h2>${n ? `${De(n.date)}<br><em>${xt(Qn(e.division))}</em>` : "PRÓXIMO<br><em>COMBATE</em>"}</h2><p>${n ? `Faltan ${Math.max(0, n.date - t.day)} días.` : "Elige un rival en Matchmaking."}</p><div class="hero-actions">${n ? jt(`Ir al combate ${zt("arrow")}`, "start-booked") : en("Elegir rival", "matchmaking", "primary")}${jt(`${zt("play")} Ver exhibición 3D`, "exhibition", "ghost")}</div></div>
      <div class="hero-match"><div><small>ESQUINA ROJA</small><b>${xt((n ? i.fighter(n.fighterId) : e).lastName).toUpperCase()}</b><span>${In(n ? i.fighter(n.fighterId) : e)}</span></div><i>VS</i><div><small>ESQUINA AZUL</small><b>${xt((s == null ? void 0 : s.lastName) || "RIVAL").toUpperCase()}</b><span>${s ? In(s) : "Por confirmar"}</span></div><div class="hero-match-label">${Qn(e.division)}<small>${n ? De(n.date) : "Exhibición · sin impacto en carrera"}</small></div></div>
    </section>
    <div class="metrics">
      ${cs("wallet", "Balance del club", Te(t.money), "Plata compartida con el hub", "finances")}
      ${cs("users", "Peleadores activos", String(i.roster().filter((o) => !o.retired).length).padStart(2, "0"), `${i.roster().filter((o) => i.available(o)).length} listos para competir`, "roster")}
      ${cs("activity", "Condición del equipo", `${r}<small>%</small>`, r > 80 ? "En plena forma" : "Necesitan recuperación", "camp")}
      ${cs("trophy", "Victorias", String(a).padStart(2, "0"), `${t.results.length} combates disputados`, "history")}
    </div>
    <div class="dashboard-columns"><section class="panel roster-panel"><div class="section-heading"><div><span class="eyebrow">PLANTEL</span><h2>Tu roster</h2></div>${en("Ver equipo", "roster")}</div>${es(
      ["Peleador", "División", "Récord", "Rank", "Condición", "Estado", ""],
      i
        .roster()
        .map((o) => Sl(o, i))
        .join(""),
    )}<div class="panel-bottom">${zt("shield")} Hay peleadores libres en el mercado. ${en("Ver mercado", "market")}</div></section>
    <section class="panel next-step"><div class="eyebrow">PRÓXIMO PASO</div><div class="step-icon">${zt(n ? "activity" : "target")}</div><h2>${n ? "Campamento" : "Sin combate reservado"}</h2><p>${n ? `${Math.max(0, n.date - t.day)} días para el combate.` : "Elige un rival en Matchmaking para reservar un combate."}</p>${en(n ? "Ir al campamento" : "Ver rivales", n ? "camp" : "matchmaking", "dark")}</section></div>
    <div class="dashboard-columns lower"><section class="panel"><div class="section-heading"><h2>Noticias</h2>${Ce("CLUB")}</div><div class="news-list">${t.news
      .slice(0, 3)
      .map(
        (o, l) =>
          `<article class="news-item"><span class="news-symbol">${zt(l ? "activity" : "star")}</span><div><small>${De(o.day)}</small><h3>${xt(o.title)}</h3><p>${xt(o.text)}</p></div></article>`,
      )
      .join(
        "",
      )}</div></section></div>`;
}
function cs(i, t, e, n, s) {
  return `<button class="metric" data-action="nav" data-page="${s}"><div class="metric-top"><span>${t}</span>${zt(i)}</div><strong>${e}</strong><small><i></i>${n}</small></button>`;
}
function offersPanel(i) {
  const t = i.state.offers || [];
  return t.length
    ? `<section class="panel padded spaced"><div class="section-heading"><h2>Ofertas por tus peleadores</h2>${Ce(`${t.length} PENDIENTES`)}</div>${es(
        ["Peleador", "Gimnasio", "Oferta", "Vence", ""],
        t
          .map((e) => {
            const n = i.fighter(e.fighterId);
            return `<tr><td><strong>${xt($t(n))}</strong></td><td>${xt(e.gym)}</td><td><b>${Te(e.amount)}</b></td><td>${De(e.expires)}</td><td>${jt("Aceptar", "offer-yes", "dark small", `data-id="${xt(e.id)}"`)} ${jt("Contraofertar +15%", "offer-counter", "secondary small", `data-id="${xt(e.id)}"`)} ${jt("Rechazar", "offer-no", "text small", `data-id="${xt(e.id)}"`)}</td></tr>`;
          })
          .join(""),
      )}</section>`
    : "";
}
function ao(i, t = !1) {
  const e = t
    ? i.state.fighters.filter(
        (n) => !i.state.roster.includes(n.id) && !n.retired && !n.gym,
      )
    : i.roster();
  return `${We(t ? "MERCADO" : "PLANTEL", t ? "Peleadores disponibles" : "Mi equipo", t ? "Agentes libres que puedes fichar y ofertas por tus peleadores." : "Peleadores de tu club.")}
    ${t ? offersPanel(i) : ""}
    <div class="filter-row"><label>División <select id="roster-filter"><option value="all">Todas las divisiones</option>${Ke.map((n) => `<option value="${n.id}">${n.name}</option>`).join("")}</select></label><span>${e.length} peleadores ${t ? "en el mercado" : "en tu club"}</span></div>
    <div class="fighter-grid">${e.map((n, s) => `<article class="fighter-card" data-division="${n.division}"><div class="fighter-card-visual"><span class="rating">${zs(n)}<small>OVR</small></span>${ts(n, "", s % 2 ? "#b7c3d1" : "#c2df75")}<span class="card-rank">#${i.rank(n)} ${i.state.champions[n.division] === n.id ? " · CAMPEÓN" : ""}</span></div><div class="fighter-card-body"><div class="eyebrow">${natFlag(n.country)} ${xt(n.country)} · ${Qn(n.division)}</div><h2>${xt($t(n))}</h2><p>“${xt(n.nickname)}”</p><div class="card-info"><span>${Pe[n.style].name}</span><b>${In(n)}</b></div><div class="card-attributes"><span>Potencia <b>${Math.round(n.attributes.power)}</b></span><span>Wrestling <b>${Math.round(n.attributes.wrestling)}</b></span><span>Cardio <b>${Math.round(n.attributes.cardio)}</b></span></div><div class="card-actions">${jt(`Ver ficha ${zt("arrow")}`, "profile", "secondary", `data-id="${xt(n.id)}"`)}${t ? jt(`Fichar · ${Te(Math.round(n.rating * 9))}`, "sign-dialog", "primary", `data-id="${xt(n.id)}"`) : jt(n.id === i.state.selected ? "Seleccionado" : "Gestionar", "select", n.id === i.state.selected ? "selected" : "dark", `data-id="${xt(n.id)}"`)}</div></div></article>`).join("")}</div>`;
}
function yl(i, t) {
  const e = i.fighter(t) || i.fighter(),
    n = i.state.roster.includes(e.id);
  return `${We("FICHA DEL PELEADOR", xt($t(e)), `${Qn(e.division)} · ${e.age} años · ${natFlag(e.country)} ${xt(e.country)}`, en("Volver al roster", "roster", "secondary"))}
    <div class="profile-layout"><section class="profile-identity panel"><div class="profile-portrait llo-cardslot" data-fid="${xt(e.id)}">${ts(e)}<span class="profile-ovr">${zs(e)}<small>OVERALL</small></span></div><h2>“${xt(e.nickname)}”</h2><p>${Pe[e.style].name}</p>${Ce(e.career, "green")}<div class="profile-numbers"><div><strong>${In(e)}</strong><small>RÉCORD</small></div><div><strong>#${i.rank(e)}</strong><small>RANKING</small></div><div><strong>${e.potential}</strong><small>POTENCIAL</small></div></div>${n ? jt("Gestionar peleador", "select", "dark", `data-id="${xt(e.id)}"`) : e.gym ? Ce(`Contrato con ${e.gym}`, "amber") : jt(`Fichar · ${Te(Math.round(e.rating * 9))}`, "sign-dialog", "primary", `data-id="${xt(e.id)}"`)}</section>
    <div><section class="panel padded"><div class="section-heading"><h2>Atributos</h2>${Ce("COMBATE")}</div><div class="attribute-grid">${Object.entries(
      ks,
    )
      .map(
        ([s, r]) =>
          `<div class="attribute"><span>${r}<b>${Math.round(e.attributes[s])}</b></span>${Yi(e.attributes[s])}</div>`,
      )
      .join(
        "",
      )}</div></section><section class="panel padded spaced"><h2>Estado & personalidad</h2><div class="attribute-grid">${[
      ["condition", "Condición"],
      ["morale", "Moral"],
      ["popularity", "Popularidad"],
    ]
      .map(
        ([s, r]) =>
          `<div class="attribute"><span>${r}<b>${Math.round(e[s])}%</b></span>${Yi(e[s])}</div>`,
      )
      .join("")}${Object.entries({
      aggression: "Agresividad",
      patience: "Paciencia",
      courage: "Valentía",
      conservatism: "Conservadurismo",
      finish: "Instinto finalizador",
      discipline: "Disciplina",
    })
      .map(
        ([s, r]) =>
          `<div class="attribute"><span>${r}<b>${e.personality[s]}</b></span>${Yi(e.personality[s], "muted-meter")}</div>`,
      )
      .join(
        "",
      )}</div><p class="note">${e.injuryUntil > i.state.day ? `Baja médica hasta ${De(e.injuryUntil)}.` : "Sin lesiones activas."} ${e.defenses} defensas de título. La fatiga y el daño modifican estos atributos durante el combate.</p></section></div></div>
    <section class="panel spaced"><div class="section-heading"><h2>Historial de carrera</h2>${Ce(`${e.history.length} COMBATES REGISTRADOS`)}</div>${
      e.history.length
        ? es(
            ["Fecha", "Rival", "Resultado", "Método"],
            [...e.history]
              .reverse()
              .map(
                (s) =>
                  `<tr><td>${De(s.day)}</td><td>${xt($t(i.fighter(s.rivalId)))}</td><td>${Ce(s.outcome, s.outcome === "W" ? "green" : "amber")}</td><td>${xt(s.method)}</td></tr>`,
              )
              .join(""),
          )
        : Zs(
            "Sin combates registrados",
            "Sus combates aparecerán aquí. El récord inicial corresponde a su carrera previa.",
          )
    }</section>`;
}
function El(i, t) {
  const e = Ke.find((s) => s.id === t) || Ke[0],
    n = i.fighter(i.state.champions[e.id]);
  return `${We("RANKINGS", "Rankings por división", "Ranking dinámico: resultados, calidad del rival, racha, forma y actividad.")}
    <div class="tabs">${Ke.map((s) => jt(`${s.name} <small>${s.limit} kg</small>`, "division", s.id === e.id ? "tab active" : "tab", `data-id="${s.id}"`)).join("")}</div>
    <div class="champion-banner"><div class="champion-icon">${zt("trophy")}</div><div><div class="eyebrow">CAMPEÓN · ${e.name.toUpperCase()}</div><h2>${n ? xt($t(n)) : "Cinturón vacante"}</h2><p>${n ? `${In(n)} · ${n.defenses} defensas del título` : "La próxima pelea titular decidirá al campeón."}</p></div>${n ? jt("Ver campeón", "profile", "ghost", `data-id="${xt(n.id)}"`) : ""}</div>
    <section class="panel spaced">${es(
      [
        "Pos.",
        "Peleador",
        "Estilo",
        "Récord",
        "Puntuación",
        "Racha",
        "Actividad",
      ],
      i
        .ranking(e.id)
        .map(
          (s, r) =>
            `<tr class="${i.state.roster.includes(s.id) ? "own-row" : ""}"><td><strong class="rank-number">${String(r + 1).padStart(2, "0")}</strong></td><td><button class="fighter-name" data-action="profile" data-id="${xt(s.id)}">${ts(s, "avatar")}<span><strong>${xt($t(s))} ${i.state.roster.includes(s.id) ? '<span class="tiny-dot"></span>' : ""}</strong><small>${natFlag(s.country)} ${xt(s.country)} · ${s.age} años</small></span></button></td><td>${Pe[s.style].name}</td><td><b>${In(s)}</b></td><td>${Math.round(i.rankScore(s))}</td><td>${Ce(s.streak > 0 ? `${s.streak} W` : s.streak < 0 ? `${Math.abs(s.streak)} L` : "—", s.streak > 0 ? "green" : "")}</td><td>${i.available(s) ? "Disponible" : `Baja hasta ${De(s.injuryUntil)}`}</td></tr>`,
        )
        .join(""),
    )}</section>`;
}
function bl(i) {
  const t = i.fighter(),
    e = i.state.booking;
  return `${We("MATCHMAKING", "Elegir rival", `Peleador seleccionado: ${xt($t(t))} · #${i.rank(t)} ${Qn(t.division)}`, jt(`${zt("play")} Exhibición libre`, "exhibition", "secondary"))}
    ${e ? `<div class="notice">${zt("calendar")} Ya tienes un combate confirmado para ${De(e.date)}. ${en("Ver evento", "events")}</div>` : ""}
    <div class="opponent-list">${i
      .opponents(t)
      .map((n) => {
        const s = i.offer(n, t);
        return `<article class="opponent-card panel">${ts(n, "opponent-portrait", "#bcc9d8")}<div class="opponent-main"><div class="eyebrow">#${i.rank(n)} · ${Qn(n.division)}</div><h2>${xt($t(n))}</h2><p>${Pe[n.style].name} <span class="separator">/</span> ${In(n)}</p><div class="tag-row">${Ce(s.compatibility)}${s.rivalry ? Ce(`Revancha · ${s.rivalry} encuentros`, "amber") : ""}${Ce(i.available(n) ? "Disponible" : `Baja hasta ${De(n.injuryUntil)}`, i.available(n) ? "green" : "amber")}</div></div><div class="opponent-risk"><small>RIESGO</small><b>${s.risk}</b><small>BOLSA GARANTIZADA</small><strong>${Te(s.reward)}</strong></div>${jt(`Negociar pelea ${zt("arrow")}`, "book-dialog", "dark", `data-id="${xt(n.id)}" ${e || !i.available(n) || !i.available(t) || !i.contractActive(t) ? "disabled" : ""}`)}</article>`;
      })
      .join(
        "",
      )}</div><p class="note">Los rivales deben estar disponibles y pertenecer a la misma división. Necesitas un contrato vigente. El campamento comienza 6 semanas antes del evento.</p>`;
}
function Tl(i) {
  return `${We("FIGHT NIGHTS", "Eventos", "Carteleras con estelar, coestelar y preliminares.", en("Reservar combate", "matchmaking", "dark"))}
    ${
      i.state.events.length
        ? [...i.state.events]
            .reverse()
            .map((t) => {
              var e;
              return `<section class="panel event-card"><div class="event-header"><div><span class="eyebrow">${t.completed ? "EVENTO FINALIZADO" : "PRÓXIMAMENTE"} · ${De(t.date)}</span><h2>${xt(t.name)}</h2><p>${xt(t.venue)}</p></div>${t.completed ? Ce("RESULTADOS OFICIALES", "green") : jt(`${zt("play")} Observar combate`, "start-booked", "primary")}</div><div class="event-bouts">${t.bouts.map((n) => `<div class="bout-row"><span class="eyebrow">${n.slot}</span><strong>${xt($t(i.fighter(n.ids[0])))}</strong><i>VS</i><strong>${xt($t(i.fighter(n.ids[1])))}</strong><span>${n.result ? xt(n.result.method) : Qn(i.fighter(n.ids[0]).division)}</span></div>`).join("")}</div>${t.completed ? "" : `<div class="panel-bottom">${t.title ? "Pelea por el título · 5 rounds de 5 minutos" : "3 rounds de 5 minutos"}${jt(`Cancelar · ${Te(1e3)}`, "cancel-dialog", "text", (e = i.state.booking) != null && e.prepared ? "disabled" : "")}</div>`}</section>`;
            })
            .join("")
        : Zs(
            "Sin eventos",
            "Reserva un combate para crear una cartelera con estelar, coestelar y preliminares.",
            en("Elegir rival", "matchmaking", "primary"),
          )
    }`;
}
// ---- CALENDARIO: las próximas 16 semanas (combate reservado, pesaje, contratos, lesiones, ranking) y las fight nights ya jugadas ----
function llocal(i) {
  const st = i.state, day = st.day, wk = 16, b = st.booking, me = i.fighter();
  const ev = b ? st.events.find((e) => e.id === b.id) : null;
  const items = []; // { d: día, k: tipo, t: texto }
  if (b) {
    const rival = i.fighter(b.rivalId), f = i.fighter(b.fighterId);
    items.push({ d: b.date, k: "fight", t: `${ev ? xt(ev.name) : "Combate"} · ${xt($t(f))} vs ${xt($t(rival))} · ${b.rounds} rounds${b.title ? " · TÍTULO" : ""}` });
    items.push({ d: b.date - 1, k: "weigh", t: `Pesaje oficial · ${xt($t(f))}` });
    if (b.date - 7 > day) items.push({ d: b.date - 7, k: "camp", t: "Última semana de campamento" });
    if (ev && ev.venue) items[0].t += ` · ${xt(ev.venue)}`;
  } else {
    items.push({ d: day + 42, k: "free", t: "Primera fecha posible si reservás un combate hoy (la cartelera se arma con 42 días de anticipación)" });
  }
  for (const id of st.roster) {
    const f = i.fighter(id); if (!f) continue;
    if (f.contract) items.push({ d: f.contract.signedDay + f.contract.duration, k: "contract", t: `Vence el contrato de ${xt($t(f))}${f.contract.remaining > 0 ? ` (${f.contract.remaining} pelea${f.contract.remaining > 1 ? "s" : ""} restantes)` : ""}` });
    if (f.injuryUntil > day) items.push({ d: f.injuryUntil, k: "injury", t: `${xt($t(f))} recibe el alta médica` });
  }
  for (let w = 0; w < wk; w++) items.push({ d: (Math.floor(day / 7) + w + 1) * 7, k: "world", t: "Actualización semanal de rankings y de la cartelera del mundo" });
  const weeks = Array.from({ length: wk }, (_, w) => {
    const d0 = day + w * 7, d1 = d0 + 6, rows = items.filter((x) => x.d >= d0 && x.d <= d1).sort((a, c) => a.d - c.d || (a.k === "world") - (c.k === "world"));
    return `<article class="panel cal-week ${w === 0 ? "now" : ""} ${rows.some((x) => x.k === "fight") ? "has-fight" : ""}"><header><b>${w === 0 ? "ESTA SEMANA" : `SEMANA +${w}`}</b><small>${De(d0)} — ${De(d1)}</small></header><ul>${rows.map((x) => `<li class="cal-${x.k}"><span>${De(x.d)}</span>${x.t}</li>`).join("") || '<li class="cal-none">Sin eventos.</li>'}</ul></article>`;
  }).join("");
  const past = st.events.filter((e) => e.completed).slice(-6).reverse();
  return `${We("CALENDARIO", "Próximas fechas", `Hoy es ${De(day)} · ${b ? `combate en ${Math.max(0, b.date - day)} días (${De(b.date)})` : "sin combate reservado"} · ${xt($t(me))}`, b ? "" : en("Reservar combate", "matchmaking", "dark"))}
    <div class="cal-grid">${weeks}</div>
    <section class="panel spaced"><div class="section-heading"><h2>Fight nights anteriores</h2></div>${past.length ? es(["Fecha", "Evento", "Sede"], past.map((e) => `<tr><td>${De(e.date)}</td><td>${xt(e.name)}</td><td>${xt(e.venue)}</td></tr>`).join("")) : '<p class="muted">Todavía no se jugó ningún evento.</p>'}</section>`;
}
function Al(i) {
  const t = i.fighter(),
    e = i.state.booking;
  return `${We("CAMPAMENTO", "Entrenamiento", `${xt($t(t))} · Condición ${Math.round(t.condition)}% · Potencial ${t.potential}`, en("Configurar táctica", "tactics", "secondary"))}
    <div class="camp-status panel"><div>${zt("activity")} <span><b>${Math.round(t.condition)}%</b><small>CONDICIÓN FÍSICA</small></span>${Yi(t.condition)}</div><div>${zt("calendar")} <span><b>${e ? `${Math.max(0, e.date - i.state.day)} días` : "Pretemporada"}</b><small>${e ? "PARA EL COMBATE" : "SIN COMBATE RESERVADO"}</small></span></div><div>${zt("shield")}<span><b>${t.injuryUntil > i.state.day ? "Recuperación" : "Apto para entrenar"}</b><small>${t.injuryUntil > i.state.day ? De(t.injuryUntil) : "SIN LESIONES ACTIVAS"}</small></span></div></div>
    <div class="camp-grid">${Object.entries(kr)
      .map(
        ([n, s], r) =>
          `<article class="panel camp-card"><div class="camp-number">0${r + 1}</div><div class="camp-symbol">${zt(["target", "shield", "users", "activity", "trophy", "history", "grid"][r])}</div><h2>${s.name}</h2><p>${s.attributes.length ? s.attributes.map((a) => ks[a]).join(" + ") : "Recupera condición y acorta la baja médica"}</p><div class="camp-effect">${Ce(s.load < 0 ? "RECUPERACIÓN +37" : `CARGA ${s.load - 5}`, s.load < 0 ? "green" : "")}<span>7 días</span></div><div class="camp-footer"><b>${Te(s.cost)}</b>${jt("Entrenar", "train", "dark", `data-id="${n}"`)}</div></article>`,
      )
      .join("")}</div>
    <section class="panel spaced"><div class="section-heading"><h2>Diario de entrenamiento</h2></div>${
      t.training.length
        ? es(
            ["Semana", "Disciplina", "Mejora real"],
            [...t.training]
              .reverse()
              .slice(0, 12)
              .map((n) => {
                var s;
                return `<tr><td>${De(n.day)}</td><td>${((s = kr[n.type]) == null ? void 0 : s.name) || xt(n.type)}</td><td>${
                  Object.entries(n.gains)
                    .map(([r, a]) => `${ks[r]} +${a.toFixed(1)}`)
                    .join(" · ") || "Recuperación física"
                }</td></tr>`;
              })
              .join(""),
          )
        : Zs(
            "Sin entrenamientos",
            "Cada sesión mejora atributos, consume presupuesto y avanza una semana.",
          )
    }</section>`;
}
function wl(i) {
  const t = i.fighter(),
    e = t.tactics,
    n = (s, r, a, o, l) =>
      `<label class="tactic-slider"><span>${r}<output>${Math.round(e[s])}</output></span><input type="range" name="${s}" min="0" max="100" value="${e[s]}"><small><span>${a}</span><span>${o}</span></small><p>${l}</p></label>`;
  return `${We("TÁCTICA", "Plan de pelea", `${xt($t(t))} · ${Pe[t.style].name}. Las órdenes se aplican a su IA, no a controles de acción.`)}
    <form id="tactics-form" class="tactics-layout"><section class="panel padded"><div class="section-heading"><h2>Identidad táctica</h2>${Ce("PRECOMBATE")}</div><div class="form-row"><label>Enfoque principal<select name="focus">${Object.entries(
      {
        balanced: "Equilibrado",
        boxing: "Boxeo / striking",
        wrestling: "Wrestling",
        grappling: "Grappling / sumisión",
      },
    )
      .map(
        ([s, r]) =>
          `<option value="${s}" ${e.focus === s ? "selected" : ""}>${r}</option>`,
      )
      .join(
        "",
      )}</select></label><label>Objetivo prioritario<select name="target">${Object.entries(
      { mixed: "Variar zonas", head: "Cabeza", body: "Cuerpo", leg: "Piernas" },
    )
      .map(
        ([s, r]) =>
          `<option value="${s}" ${e.target === s ? "selected" : ""}>${r}</option>`,
      )
      .join("")}</select></label></div>
    ${n("pace", "Ritmo de combate", "Pausado", "Intenso", "Modifica la frecuencia de decisiones y la continuidad de combinaciones.")}
    ${n("distance", "Distancia preferida", "Corta", "Larga", "La IA busca esta distancia según estilo, daño y cansancio.")}
    ${n("takedowns", "Frecuencia de derribos", "Ocasional", "Constante", "Se combina con el wrestling, la oportunidad y la defensa del rival.")}
    </section><section class="panel padded"><h2>Riesgo & energía</h2>${n("aggression", "Agresividad", "Paciente", "Presión máxima", "Aumenta la iniciativa ofensiva, sin ignorar el alcance ni las reservas.")}${n("conservation", "Gestión de stamina", "Gastarlo todo", "Conservar", "Establece el nivel de energía que dispara retirada y recuperación.")}<div class="tactic-note">${zt("activity")}<p>Un plan no es una garantía. La disciplina, el cardio y la situación del combate influyen en cómo se ejecuta.</p></div><button class="btn primary wide" type="submit">Guardar plan de pelea ${zt("arrow")}</button></section></form>`;
}
function Rl(i) {
  return `${We("PLANTEL", "Contratos", "Duración, bolsa y bonus de cada peleador. Renovar se negocia.")}
  <div class="contract-grid">${i
    .roster()
    .map((t) => {
      const e = t.contract;
      return `<section class="panel padded"><div class="section-heading"><div><span class="eyebrow">${i.contractActive(t) ? "CONTRATO ACTIVO" : "RENOVACIÓN NECESARIA"}</span><h2>${xt($t(t))}</h2></div>${zt("contract")}</div><div class="contract-value">${Te(e.purse)}<small>BOLSA BASE POR COMBATE</small></div><dl class="detail-list"><div><dt>Combates restantes</dt><dd>${e.remaining} / 4</dd></div><div><dt>Vencimiento</dt><dd>${De(e.signedDay + e.duration)}</dd></div><div><dt>Bonus por victoria</dt><dd>${Te(e.bonus)}</dd></div></dl><p class="note">${xt(e.clause)}</p>${jt(`Renovar 4 peleas · ${Te(i.askFor("renew", t))}`, "renew-dialog", "dark wide", `data-id="${xt(t.id)}"`)}</section>`;
    })
    .join("")}</div>`;
}
function Pl(i) {
  const t = i.state.ledger,
    e = t
      .filter((s) => s.amount > 0 && s.category !== "Capital")
      .reduce((s, r) => s + r.amount, 0),
    n = -t.filter((s) => s.amount < 0).reduce((s, r) => s + r.amount, 0);
  return `${We("CLUB", "Finanzas", "Movimientos del club. El saldo es la Plata compartida del hub.", jt(`${zt("download")} Exportar movimientos`, "ledger-export", "secondary"))}
  <div class="finance-summary"><section class="finance-total"><span class="eyebrow">BALANCE DISPONIBLE</span><strong>${Te(i.state.money)}</strong><small>Plata de Eternal Manager</small></section><section class="panel padded"><div class="eyebrow">INGRESOS</div><strong class="big-number">${Te(e)}</strong><p>Bolsas, bonus y ventas</p></section><section class="panel padded"><div class="eyebrow">GASTOS</div><strong class="big-number">${Te(n)}</strong><p>Campamentos, fichajes y contratos</p></section></div>
  <section class="panel spaced"><div class="section-heading"><h2>Libro de movimientos</h2>${Ce(`${t.length} OPERACIONES`)}</div>${es(
    ["Fecha", "Categoría", "Concepto", "Importe"],
    [...t]
      .reverse()
      .map(
        (s) =>
          `<tr><td>${De(s.day)}</td><td>${Ce(s.category)}</td><td>${xt(s.note)}</td><td class="${s.amount >= 0 ? "positive" : "negative"}"><b>${s.amount > 0 ? "+" : ""}${Te(s.amount)}</b></td></tr>`,
      )
      .join(""),
  )}</section>`;
}
function Dl(i) {
  return `${We("HISTORIAL", "Historial de combates", "Resultados, estadísticas por round y repeticiones.")}
    ${i.state.results.length ? i.state.results.map((t) => `<section class="panel history-card"><div class="result-mark ${t.winner === 0 ? "win" : "loss"}">${t.winner === null ? "D" : t.winner === 0 ? "W" : "L"}</div><div><span class="eyebrow">${De(t.day)} · ROUND ${t.round}</span><h2>${t.fighterIds.map((e) => xt(i.fighter(e).lastName)).join(' <span class="versus">vs</span> ')}</h2><p>${xt(t.method)} ${t.title ? "· Por el título" : ""}</p></div><div class="history-income"><small>INGRESO NETO</small><strong>+ ${Te(t.netIncome || 0)}</strong></div>${jt("Estadísticas", "result-details", "secondary", `data-id="${xt(t.id)}"`)}${jt(`${zt("play")} Repetición`, "replay", "dark", `data-id="${xt(t.id)}"`)}</section>`).join("") : Zs("Sin combates", "Los resultados de tus combates de carrera aparecerán aquí.", en("Elegir rival", "matchmaking", "primary"))}`;
}
function Ll(i) {
  return `${We("AJUSTES", "Partida", "Guardado local en este navegador. Exporta una copia antes de cambiar de dispositivo.")}
    <div class="contract-grid"><section class="panel padded"><h2>Persistencia local</h2><p>Los cambios se guardan automáticamente. Durante una pelea de carrera se conserva la semilla, las órdenes y el punto de simulación.</p><dl class="detail-list"><div><dt>Versión del guardado</dt><dd>1</dd></div><div><dt>Tiempo de carrera</dt><dd>${i.state.day} días</dd></div><div><dt>Combates gestionados</dt><dd>${i.state.results.length}</dd></div></dl>${jt(`${zt("download")} Exportar partida JSON`, "export", "dark wide")}<label class="btn secondary wide import-label">Importar partida<input id="import-file" type="file" accept="application/json,.json"></label><p class="note">Importar sustituye la partida actual después de validar el archivo. Exporta primero tu copia.</p></section>
    <section class="panel padded"><h2>Simulador</h2><p>Motor de combate determinista con física propia.</p><ul class="about-list"><li>30 pasos por segundo de simulación.</li><li>3 rounds; 5 en peleas por el título.</li><li>Los resultados no dependen de los FPS.</li><li>Audio procedural opcional.</li></ul>${jt("Reiniciar carrera", "reset-dialog", "danger")}</section></div>`;
}
/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */ const Ia = "180",
  Il = 0,
  oo = 1,
  Ul = 2,
  Sc = 1,
  yc = 2,
  Mn = 3,
  Un = 0,
  Ne = 1,
  Sn = 2,
  Dn = 0,
  Si = 1,
  co = 2,
  lo = 3,
  ho = 4,
  Nl = 5,
  Xn = 100,
  Fl = 101,
  Ol = 102,
  Bl = 103,
  kl = 104,
  zl = 200,
  Hl = 201,
  Vl = 202,
  Gl = 203,
  Vr = 204,
  Gr = 205,
  Wl = 206,
  $l = 207,
  Xl = 208,
  ql = 209,
  Yl = 210,
  jl = 211,
  Kl = 212,
  Zl = 213,
  Jl = 214,
  Wr = 0,
  $r = 1,
  Xr = 2,
  Ei = 3,
  qr = 4,
  Yr = 5,
  jr = 6,
  Kr = 7,
  Ec = 0,
  Ql = 1,
  td = 2,
  Ln = 0,
  ed = 1,
  nd = 2,
  id = 3,
  bc = 4,
  sd = 5,
  rd = 6,
  ad = 7,
  Tc = 300,
  bi = 301,
  Ti = 302,
  Zr = 303,
  Jr = 304,
  Js = 306,
  Qr = 1e3,
  Yn = 1001,
  ta = 1002,
  Ge = 1003,
  od = 1004,
  ls = 1005,
  cn = 1006,
  ar = 1007,
  jn = 1008,
  un = 1009,
  Ac = 1010,
  wc = 1011,
  ji = 1012,
  Ua = 1013,
  ti = 1014,
  ln = 1015,
  ns = 1016,
  Na = 1017,
  Fa = 1018,
  Ki = 1020,
  Rc = 35902,
  Cc = 35899,
  Pc = 1021,
  Dc = 1022,
  sn = 1023,
  Zi = 1026,
  Ji = 1027,
  Oa = 1028,
  Ba = 1029,
  Lc = 1030,
  ka = 1031,
  za = 1033,
  Us = 33776,
  Ns = 33777,
  Fs = 33778,
  Os = 33779,
  ea = 35840,
  na = 35841,
  ia = 35842,
  sa = 35843,
  ra = 36196,
  aa = 37492,
  oa = 37496,
  ca = 37808,
  la = 37809,
  da = 37810,
  ha = 37811,
  ua = 37812,
  fa = 37813,
  pa = 37814,
  ma = 37815,
  ga = 37816,
  _a = 37817,
  va = 37818,
  xa = 37819,
  Ma = 37820,
  Sa = 37821,
  ya = 36492,
  Ea = 36494,
  ba = 36495,
  Ta = 36283,
  Aa = 36284,
  wa = 36285,
  Ra = 36286,
  cd = 3200,
  ld = 3201,
  Ic = 0,
  dd = 1,
  Cn = "",
  He = "srgb",
  Ai = "srgb-linear",
  Gs = "linear",
  Qt = "srgb",
  ri = 7680,
  uo = 519,
  hd = 512,
  ud = 513,
  fd = 514,
  Uc = 515,
  pd = 516,
  md = 517,
  gd = 518,
  _d = 519,
  fo = 35044,
  po = "300 es",
  dn = 2e3,
  Ws = 2001;
class Ci {
  addEventListener(t, e) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    (n[t] === void 0 && (n[t] = []), n[t].indexOf(e) === -1 && n[t].push(e));
  }
  hasEventListener(t, e) {
    const n = this._listeners;
    return n === void 0 ? !1 : n[t] !== void 0 && n[t].indexOf(e) !== -1;
  }
  removeEventListener(t, e) {
    const n = this._listeners;
    if (n === void 0) return;
    const s = n[t];
    if (s !== void 0) {
      const r = s.indexOf(e);
      r !== -1 && s.splice(r, 1);
    }
  }
  dispatchEvent(t) {
    const e = this._listeners;
    if (e === void 0) return;
    const n = e[t.type];
    if (n !== void 0) {
      t.target = this;
      const s = n.slice(0);
      for (let r = 0, a = s.length; r < a; r++) s[r].call(this, t);
      t.target = null;
    }
  }
}
const Ee = [
    "00",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "0a",
    "0b",
    "0c",
    "0d",
    "0e",
    "0f",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "1a",
    "1b",
    "1c",
    "1d",
    "1e",
    "1f",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "2a",
    "2b",
    "2c",
    "2d",
    "2e",
    "2f",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "39",
    "3a",
    "3b",
    "3c",
    "3d",
    "3e",
    "3f",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
    "49",
    "4a",
    "4b",
    "4c",
    "4d",
    "4e",
    "4f",
    "50",
    "51",
    "52",
    "53",
    "54",
    "55",
    "56",
    "57",
    "58",
    "59",
    "5a",
    "5b",
    "5c",
    "5d",
    "5e",
    "5f",
    "60",
    "61",
    "62",
    "63",
    "64",
    "65",
    "66",
    "67",
    "68",
    "69",
    "6a",
    "6b",
    "6c",
    "6d",
    "6e",
    "6f",
    "70",
    "71",
    "72",
    "73",
    "74",
    "75",
    "76",
    "77",
    "78",
    "79",
    "7a",
    "7b",
    "7c",
    "7d",
    "7e",
    "7f",
    "80",
    "81",
    "82",
    "83",
    "84",
    "85",
    "86",
    "87",
    "88",
    "89",
    "8a",
    "8b",
    "8c",
    "8d",
    "8e",
    "8f",
    "90",
    "91",
    "92",
    "93",
    "94",
    "95",
    "96",
    "97",
    "98",
    "99",
    "9a",
    "9b",
    "9c",
    "9d",
    "9e",
    "9f",
    "a0",
    "a1",
    "a2",
    "a3",
    "a4",
    "a5",
    "a6",
    "a7",
    "a8",
    "a9",
    "aa",
    "ab",
    "ac",
    "ad",
    "ae",
    "af",
    "b0",
    "b1",
    "b2",
    "b3",
    "b4",
    "b5",
    "b6",
    "b7",
    "b8",
    "b9",
    "ba",
    "bb",
    "bc",
    "bd",
    "be",
    "bf",
    "c0",
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "ca",
    "cb",
    "cc",
    "cd",
    "ce",
    "cf",
    "d0",
    "d1",
    "d2",
    "d3",
    "d4",
    "d5",
    "d6",
    "d7",
    "d8",
    "d9",
    "da",
    "db",
    "dc",
    "dd",
    "de",
    "df",
    "e0",
    "e1",
    "e2",
    "e3",
    "e4",
    "e5",
    "e6",
    "e7",
    "e8",
    "e9",
    "ea",
    "eb",
    "ec",
    "ed",
    "ee",
    "ef",
    "f0",
    "f1",
    "f2",
    "f3",
    "f4",
    "f5",
    "f6",
    "f7",
    "f8",
    "f9",
    "fa",
    "fb",
    "fc",
    "fd",
    "fe",
    "ff",
  ],
  or = Math.PI / 180,
  Ca = 180 / Math.PI;
function is() {
  const i = (Math.random() * 4294967295) | 0,
    t = (Math.random() * 4294967295) | 0,
    e = (Math.random() * 4294967295) | 0,
    n = (Math.random() * 4294967295) | 0;
  return (
    Ee[i & 255] +
    Ee[(i >> 8) & 255] +
    Ee[(i >> 16) & 255] +
    Ee[(i >> 24) & 255] +
    "-" +
    Ee[t & 255] +
    Ee[(t >> 8) & 255] +
    "-" +
    Ee[((t >> 16) & 15) | 64] +
    Ee[(t >> 24) & 255] +
    "-" +
    Ee[(e & 63) | 128] +
    Ee[(e >> 8) & 255] +
    "-" +
    Ee[(e >> 16) & 255] +
    Ee[(e >> 24) & 255] +
    Ee[n & 255] +
    Ee[(n >> 8) & 255] +
    Ee[(n >> 16) & 255] +
    Ee[(n >> 24) & 255]
  ).toLowerCase();
}
function Gt(i, t, e) {
  return Math.max(t, Math.min(e, i));
}
function vd(i, t) {
  return ((i % t) + t) % t;
}
function cr(i, t, e) {
  return (1 - e) * i + e * t;
}
function Oi(i, t) {
  switch (t.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return i / 4294967295;
    case Uint16Array:
      return i / 65535;
    case Uint8Array:
      return i / 255;
    case Int32Array:
      return Math.max(i / 2147483647, -1);
    case Int16Array:
      return Math.max(i / 32767, -1);
    case Int8Array:
      return Math.max(i / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function Ie(i, t) {
  switch (t.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return Math.round(i * 4294967295);
    case Uint16Array:
      return Math.round(i * 65535);
    case Uint8Array:
      return Math.round(i * 255);
    case Int32Array:
      return Math.round(i * 2147483647);
    case Int16Array:
      return Math.round(i * 32767);
    case Int8Array:
      return Math.round(i * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
class Xt {
  constructor(t = 0, e = 0) {
    ((Xt.prototype.isVector2 = !0), (this.x = t), (this.y = e));
  }
  get width() {
    return this.x;
  }
  set width(t) {
    this.x = t;
  }
  get height() {
    return this.y;
  }
  set height(t) {
    this.y = t;
  }
  set(t, e) {
    return ((this.x = t), (this.y = e), this);
  }
  setScalar(t) {
    return ((this.x = t), (this.y = t), this);
  }
  setX(t) {
    return ((this.x = t), this);
  }
  setY(t) {
    return ((this.y = t), this);
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(t) {
    return ((this.x = t.x), (this.y = t.y), this);
  }
  add(t) {
    return ((this.x += t.x), (this.y += t.y), this);
  }
  addScalar(t) {
    return ((this.x += t), (this.y += t), this);
  }
  addVectors(t, e) {
    return ((this.x = t.x + e.x), (this.y = t.y + e.y), this);
  }
  addScaledVector(t, e) {
    return ((this.x += t.x * e), (this.y += t.y * e), this);
  }
  sub(t) {
    return ((this.x -= t.x), (this.y -= t.y), this);
  }
  subScalar(t) {
    return ((this.x -= t), (this.y -= t), this);
  }
  subVectors(t, e) {
    return ((this.x = t.x - e.x), (this.y = t.y - e.y), this);
  }
  multiply(t) {
    return ((this.x *= t.x), (this.y *= t.y), this);
  }
  multiplyScalar(t) {
    return ((this.x *= t), (this.y *= t), this);
  }
  divide(t) {
    return ((this.x /= t.x), (this.y /= t.y), this);
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  applyMatrix3(t) {
    const e = this.x,
      n = this.y,
      s = t.elements;
    return (
      (this.x = s[0] * e + s[3] * n + s[6]),
      (this.y = s[1] * e + s[4] * n + s[7]),
      this
    );
  }
  min(t) {
    return (
      (this.x = Math.min(this.x, t.x)),
      (this.y = Math.min(this.y, t.y)),
      this
    );
  }
  max(t) {
    return (
      (this.x = Math.max(this.x, t.x)),
      (this.y = Math.max(this.y, t.y)),
      this
    );
  }
  clamp(t, e) {
    return (
      (this.x = Gt(this.x, t.x, e.x)),
      (this.y = Gt(this.y, t.y, e.y)),
      this
    );
  }
  clampScalar(t, e) {
    return ((this.x = Gt(this.x, t, e)), (this.y = Gt(this.y, t, e)), this);
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Gt(n, t, e));
  }
  floor() {
    return ((this.x = Math.floor(this.x)), (this.y = Math.floor(this.y)), this);
  }
  ceil() {
    return ((this.x = Math.ceil(this.x)), (this.y = Math.ceil(this.y)), this);
  }
  round() {
    return ((this.x = Math.round(this.x)), (this.y = Math.round(this.y)), this);
  }
  roundToZero() {
    return ((this.x = Math.trunc(this.x)), (this.y = Math.trunc(this.y)), this);
  }
  negate() {
    return ((this.x = -this.x), (this.y = -this.y), this);
  }
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  cross(t) {
    return this.x * t.y - this.y * t.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  angleTo(t) {
    const e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0) return Math.PI / 2;
    const n = this.dot(t) / e;
    return Math.acos(Gt(n, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    const e = this.x - t.x,
      n = this.y - t.y;
    return e * e + n * n;
  }
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return (
      (this.x += (t.x - this.x) * e),
      (this.y += (t.y - this.y) * e),
      this
    );
  }
  lerpVectors(t, e, n) {
    return (
      (this.x = t.x + (e.x - t.x) * n),
      (this.y = t.y + (e.y - t.y) * n),
      this
    );
  }
  equals(t) {
    return t.x === this.x && t.y === this.y;
  }
  fromArray(t, e = 0) {
    return ((this.x = t[e]), (this.y = t[e + 1]), this);
  }
  toArray(t = [], e = 0) {
    return ((t[e] = this.x), (t[e + 1] = this.y), t);
  }
  fromBufferAttribute(t, e) {
    return ((this.x = t.getX(e)), (this.y = t.getY(e)), this);
  }
  rotateAround(t, e) {
    const n = Math.cos(e),
      s = Math.sin(e),
      r = this.x - t.x,
      a = this.y - t.y;
    return (
      (this.x = r * n - a * s + t.x),
      (this.y = r * s + a * n + t.y),
      this
    );
  }
  random() {
    return ((this.x = Math.random()), (this.y = Math.random()), this);
  }
  *[Symbol.iterator]() {
    (yield this.x, yield this.y);
  }
}
class Pi {
  constructor(t = 0, e = 0, n = 0, s = 1) {
    ((this.isQuaternion = !0),
      (this._x = t),
      (this._y = e),
      (this._z = n),
      (this._w = s));
  }
  static slerpFlat(t, e, n, s, r, a, o) {
    let l = n[s + 0],
      c = n[s + 1],
      h = n[s + 2],
      u = n[s + 3];
    const f = r[a + 0],
      p = r[a + 1],
      _ = r[a + 2],
      x = r[a + 3];
    if (o === 0) {
      ((t[e + 0] = l), (t[e + 1] = c), (t[e + 2] = h), (t[e + 3] = u));
      return;
    }
    if (o === 1) {
      ((t[e + 0] = f), (t[e + 1] = p), (t[e + 2] = _), (t[e + 3] = x));
      return;
    }
    if (u !== x || l !== f || c !== p || h !== _) {
      let m = 1 - o;
      const d = l * f + c * p + h * _ + u * x,
        b = d >= 0 ? 1 : -1,
        T = 1 - d * d;
      if (T > Number.EPSILON) {
        const R = Math.sqrt(T),
          w = Math.atan2(R, d * b);
        ((m = Math.sin(m * w) / R), (o = Math.sin(o * w) / R));
      }
      const y = o * b;
      if (
        ((l = l * m + f * y),
        (c = c * m + p * y),
        (h = h * m + _ * y),
        (u = u * m + x * y),
        m === 1 - o)
      ) {
        const R = 1 / Math.sqrt(l * l + c * c + h * h + u * u);
        ((l *= R), (c *= R), (h *= R), (u *= R));
      }
    }
    ((t[e] = l), (t[e + 1] = c), (t[e + 2] = h), (t[e + 3] = u));
  }
  static multiplyQuaternionsFlat(t, e, n, s, r, a) {
    const o = n[s],
      l = n[s + 1],
      c = n[s + 2],
      h = n[s + 3],
      u = r[a],
      f = r[a + 1],
      p = r[a + 2],
      _ = r[a + 3];
    return (
      (t[e] = o * _ + h * u + l * p - c * f),
      (t[e + 1] = l * _ + h * f + c * u - o * p),
      (t[e + 2] = c * _ + h * p + o * f - l * u),
      (t[e + 3] = h * _ - o * u - l * f - c * p),
      t
    );
  }
  get x() {
    return this._x;
  }
  set x(t) {
    ((this._x = t), this._onChangeCallback());
  }
  get y() {
    return this._y;
  }
  set y(t) {
    ((this._y = t), this._onChangeCallback());
  }
  get z() {
    return this._z;
  }
  set z(t) {
    ((this._z = t), this._onChangeCallback());
  }
  get w() {
    return this._w;
  }
  set w(t) {
    ((this._w = t), this._onChangeCallback());
  }
  set(t, e, n, s) {
    return (
      (this._x = t),
      (this._y = e),
      (this._z = n),
      (this._w = s),
      this._onChangeCallback(),
      this
    );
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(t) {
    return (
      (this._x = t.x),
      (this._y = t.y),
      (this._z = t.z),
      (this._w = t.w),
      this._onChangeCallback(),
      this
    );
  }
  setFromEuler(t, e = !0) {
    const n = t._x,
      s = t._y,
      r = t._z,
      a = t._order,
      o = Math.cos,
      l = Math.sin,
      c = o(n / 2),
      h = o(s / 2),
      u = o(r / 2),
      f = l(n / 2),
      p = l(s / 2),
      _ = l(r / 2);
    switch (a) {
      case "XYZ":
        ((this._x = f * h * u + c * p * _),
          (this._y = c * p * u - f * h * _),
          (this._z = c * h * _ + f * p * u),
          (this._w = c * h * u - f * p * _));
        break;
      case "YXZ":
        ((this._x = f * h * u + c * p * _),
          (this._y = c * p * u - f * h * _),
          (this._z = c * h * _ - f * p * u),
          (this._w = c * h * u + f * p * _));
        break;
      case "ZXY":
        ((this._x = f * h * u - c * p * _),
          (this._y = c * p * u + f * h * _),
          (this._z = c * h * _ + f * p * u),
          (this._w = c * h * u - f * p * _));
        break;
      case "ZYX":
        ((this._x = f * h * u - c * p * _),
          (this._y = c * p * u + f * h * _),
          (this._z = c * h * _ - f * p * u),
          (this._w = c * h * u + f * p * _));
        break;
      case "YZX":
        ((this._x = f * h * u + c * p * _),
          (this._y = c * p * u + f * h * _),
          (this._z = c * h * _ - f * p * u),
          (this._w = c * h * u - f * p * _));
        break;
      case "XZY":
        ((this._x = f * h * u - c * p * _),
          (this._y = c * p * u - f * h * _),
          (this._z = c * h * _ + f * p * u),
          (this._w = c * h * u + f * p * _));
        break;
      default:
        console.warn(
          "THREE.Quaternion: .setFromEuler() encountered an unknown order: " +
            a,
        );
    }
    return (e === !0 && this._onChangeCallback(), this);
  }
  setFromAxisAngle(t, e) {
    const n = e / 2,
      s = Math.sin(n);
    return (
      (this._x = t.x * s),
      (this._y = t.y * s),
      (this._z = t.z * s),
      (this._w = Math.cos(n)),
      this._onChangeCallback(),
      this
    );
  }
  setFromRotationMatrix(t) {
    const e = t.elements,
      n = e[0],
      s = e[4],
      r = e[8],
      a = e[1],
      o = e[5],
      l = e[9],
      c = e[2],
      h = e[6],
      u = e[10],
      f = n + o + u;
    if (f > 0) {
      const p = 0.5 / Math.sqrt(f + 1);
      ((this._w = 0.25 / p),
        (this._x = (h - l) * p),
        (this._y = (r - c) * p),
        (this._z = (a - s) * p));
    } else if (n > o && n > u) {
      const p = 2 * Math.sqrt(1 + n - o - u);
      ((this._w = (h - l) / p),
        (this._x = 0.25 * p),
        (this._y = (s + a) / p),
        (this._z = (r + c) / p));
    } else if (o > u) {
      const p = 2 * Math.sqrt(1 + o - n - u);
      ((this._w = (r - c) / p),
        (this._x = (s + a) / p),
        (this._y = 0.25 * p),
        (this._z = (l + h) / p));
    } else {
      const p = 2 * Math.sqrt(1 + u - n - o);
      ((this._w = (a - s) / p),
        (this._x = (r + c) / p),
        (this._y = (l + h) / p),
        (this._z = 0.25 * p));
    }
    return (this._onChangeCallback(), this);
  }
  setFromUnitVectors(t, e) {
    let n = t.dot(e) + 1;
    return (
      n < 1e-8
        ? ((n = 0),
          Math.abs(t.x) > Math.abs(t.z)
            ? ((this._x = -t.y), (this._y = t.x), (this._z = 0), (this._w = n))
            : ((this._x = 0), (this._y = -t.z), (this._z = t.y), (this._w = n)))
        : ((this._x = t.y * e.z - t.z * e.y),
          (this._y = t.z * e.x - t.x * e.z),
          (this._z = t.x * e.y - t.y * e.x),
          (this._w = n)),
      this.normalize()
    );
  }
  angleTo(t) {
    return 2 * Math.acos(Math.abs(Gt(this.dot(t), -1, 1)));
  }
  rotateTowards(t, e) {
    const n = this.angleTo(t);
    if (n === 0) return this;
    const s = Math.min(1, e / n);
    return (this.slerp(t, s), this);
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return (
      (this._x *= -1),
      (this._y *= -1),
      (this._z *= -1),
      this._onChangeCallback(),
      this
    );
  }
  dot(t) {
    return this._x * t._x + this._y * t._y + this._z * t._z + this._w * t._w;
  }
  lengthSq() {
    return (
      this._x * this._x +
      this._y * this._y +
      this._z * this._z +
      this._w * this._w
    );
  }
  length() {
    return Math.sqrt(
      this._x * this._x +
        this._y * this._y +
        this._z * this._z +
        this._w * this._w,
    );
  }
  normalize() {
    let t = this.length();
    return (
      t === 0
        ? ((this._x = 0), (this._y = 0), (this._z = 0), (this._w = 1))
        : ((t = 1 / t),
          (this._x = this._x * t),
          (this._y = this._y * t),
          (this._z = this._z * t),
          (this._w = this._w * t)),
      this._onChangeCallback(),
      this
    );
  }
  multiply(t) {
    return this.multiplyQuaternions(this, t);
  }
  premultiply(t) {
    return this.multiplyQuaternions(t, this);
  }
  multiplyQuaternions(t, e) {
    const n = t._x,
      s = t._y,
      r = t._z,
      a = t._w,
      o = e._x,
      l = e._y,
      c = e._z,
      h = e._w;
    return (
      (this._x = n * h + a * o + s * c - r * l),
      (this._y = s * h + a * l + r * o - n * c),
      (this._z = r * h + a * c + n * l - s * o),
      (this._w = a * h - n * o - s * l - r * c),
      this._onChangeCallback(),
      this
    );
  }
  slerp(t, e) {
    if (e === 0) return this;
    if (e === 1) return this.copy(t);
    const n = this._x,
      s = this._y,
      r = this._z,
      a = this._w;
    let o = a * t._w + n * t._x + s * t._y + r * t._z;
    if (
      (o < 0
        ? ((this._w = -t._w),
          (this._x = -t._x),
          (this._y = -t._y),
          (this._z = -t._z),
          (o = -o))
        : this.copy(t),
      o >= 1)
    )
      return ((this._w = a), (this._x = n), (this._y = s), (this._z = r), this);
    const l = 1 - o * o;
    if (l <= Number.EPSILON) {
      const p = 1 - e;
      return (
        (this._w = p * a + e * this._w),
        (this._x = p * n + e * this._x),
        (this._y = p * s + e * this._y),
        (this._z = p * r + e * this._z),
        this.normalize(),
        this
      );
    }
    const c = Math.sqrt(l),
      h = Math.atan2(c, o),
      u = Math.sin((1 - e) * h) / c,
      f = Math.sin(e * h) / c;
    return (
      (this._w = a * u + this._w * f),
      (this._x = n * u + this._x * f),
      (this._y = s * u + this._y * f),
      (this._z = r * u + this._z * f),
      this._onChangeCallback(),
      this
    );
  }
  slerpQuaternions(t, e, n) {
    return this.copy(t).slerp(e, n);
  }
  random() {
    const t = 2 * Math.PI * Math.random(),
      e = 2 * Math.PI * Math.random(),
      n = Math.random(),
      s = Math.sqrt(1 - n),
      r = Math.sqrt(n);
    return this.set(
      s * Math.sin(t),
      s * Math.cos(t),
      r * Math.sin(e),
      r * Math.cos(e),
    );
  }
  equals(t) {
    return (
      t._x === this._x &&
      t._y === this._y &&
      t._z === this._z &&
      t._w === this._w
    );
  }
  fromArray(t, e = 0) {
    return (
      (this._x = t[e]),
      (this._y = t[e + 1]),
      (this._z = t[e + 2]),
      (this._w = t[e + 3]),
      this._onChangeCallback(),
      this
    );
  }
  toArray(t = [], e = 0) {
    return (
      (t[e] = this._x),
      (t[e + 1] = this._y),
      (t[e + 2] = this._z),
      (t[e + 3] = this._w),
      t
    );
  }
  fromBufferAttribute(t, e) {
    return (
      (this._x = t.getX(e)),
      (this._y = t.getY(e)),
      (this._z = t.getZ(e)),
      (this._w = t.getW(e)),
      this._onChangeCallback(),
      this
    );
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(t) {
    return ((this._onChangeCallback = t), this);
  }
  _onChangeCallback() {}
  *[Symbol.iterator]() {
    (yield this._x, yield this._y, yield this._z, yield this._w);
  }
}
class F {
  constructor(t = 0, e = 0, n = 0) {
    ((F.prototype.isVector3 = !0), (this.x = t), (this.y = e), (this.z = n));
  }
  set(t, e, n) {
    return (
      n === void 0 && (n = this.z),
      (this.x = t),
      (this.y = e),
      (this.z = n),
      this
    );
  }
  setScalar(t) {
    return ((this.x = t), (this.y = t), (this.z = t), this);
  }
  setX(t) {
    return ((this.x = t), this);
  }
  setY(t) {
    return ((this.y = t), this);
  }
  setZ(t) {
    return ((this.z = t), this);
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      case 2:
        this.z = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(t) {
    return ((this.x = t.x), (this.y = t.y), (this.z = t.z), this);
  }
  add(t) {
    return ((this.x += t.x), (this.y += t.y), (this.z += t.z), this);
  }
  addScalar(t) {
    return ((this.x += t), (this.y += t), (this.z += t), this);
  }
  addVectors(t, e) {
    return (
      (this.x = t.x + e.x),
      (this.y = t.y + e.y),
      (this.z = t.z + e.z),
      this
    );
  }
  addScaledVector(t, e) {
    return (
      (this.x += t.x * e),
      (this.y += t.y * e),
      (this.z += t.z * e),
      this
    );
  }
  sub(t) {
    return ((this.x -= t.x), (this.y -= t.y), (this.z -= t.z), this);
  }
  subScalar(t) {
    return ((this.x -= t), (this.y -= t), (this.z -= t), this);
  }
  subVectors(t, e) {
    return (
      (this.x = t.x - e.x),
      (this.y = t.y - e.y),
      (this.z = t.z - e.z),
      this
    );
  }
  multiply(t) {
    return ((this.x *= t.x), (this.y *= t.y), (this.z *= t.z), this);
  }
  multiplyScalar(t) {
    return ((this.x *= t), (this.y *= t), (this.z *= t), this);
  }
  multiplyVectors(t, e) {
    return (
      (this.x = t.x * e.x),
      (this.y = t.y * e.y),
      (this.z = t.z * e.z),
      this
    );
  }
  applyEuler(t) {
    return this.applyQuaternion(mo.setFromEuler(t));
  }
  applyAxisAngle(t, e) {
    return this.applyQuaternion(mo.setFromAxisAngle(t, e));
  }
  applyMatrix3(t) {
    const e = this.x,
      n = this.y,
      s = this.z,
      r = t.elements;
    return (
      (this.x = r[0] * e + r[3] * n + r[6] * s),
      (this.y = r[1] * e + r[4] * n + r[7] * s),
      (this.z = r[2] * e + r[5] * n + r[8] * s),
      this
    );
  }
  applyNormalMatrix(t) {
    return this.applyMatrix3(t).normalize();
  }
  applyMatrix4(t) {
    const e = this.x,
      n = this.y,
      s = this.z,
      r = t.elements,
      a = 1 / (r[3] * e + r[7] * n + r[11] * s + r[15]);
    return (
      (this.x = (r[0] * e + r[4] * n + r[8] * s + r[12]) * a),
      (this.y = (r[1] * e + r[5] * n + r[9] * s + r[13]) * a),
      (this.z = (r[2] * e + r[6] * n + r[10] * s + r[14]) * a),
      this
    );
  }
  applyQuaternion(t) {
    const e = this.x,
      n = this.y,
      s = this.z,
      r = t.x,
      a = t.y,
      o = t.z,
      l = t.w,
      c = 2 * (a * s - o * n),
      h = 2 * (o * e - r * s),
      u = 2 * (r * n - a * e);
    return (
      (this.x = e + l * c + a * u - o * h),
      (this.y = n + l * h + o * c - r * u),
      (this.z = s + l * u + r * h - a * c),
      this
    );
  }
  project(t) {
    return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(
      t.projectionMatrix,
    );
  }
  unproject(t) {
    return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(
      t.matrixWorld,
    );
  }
  transformDirection(t) {
    const e = this.x,
      n = this.y,
      s = this.z,
      r = t.elements;
    return (
      (this.x = r[0] * e + r[4] * n + r[8] * s),
      (this.y = r[1] * e + r[5] * n + r[9] * s),
      (this.z = r[2] * e + r[6] * n + r[10] * s),
      this.normalize()
    );
  }
  divide(t) {
    return ((this.x /= t.x), (this.y /= t.y), (this.z /= t.z), this);
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  min(t) {
    return (
      (this.x = Math.min(this.x, t.x)),
      (this.y = Math.min(this.y, t.y)),
      (this.z = Math.min(this.z, t.z)),
      this
    );
  }
  max(t) {
    return (
      (this.x = Math.max(this.x, t.x)),
      (this.y = Math.max(this.y, t.y)),
      (this.z = Math.max(this.z, t.z)),
      this
    );
  }
  clamp(t, e) {
    return (
      (this.x = Gt(this.x, t.x, e.x)),
      (this.y = Gt(this.y, t.y, e.y)),
      (this.z = Gt(this.z, t.z, e.z)),
      this
    );
  }
  clampScalar(t, e) {
    return (
      (this.x = Gt(this.x, t, e)),
      (this.y = Gt(this.y, t, e)),
      (this.z = Gt(this.z, t, e)),
      this
    );
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Gt(n, t, e));
  }
  floor() {
    return (
      (this.x = Math.floor(this.x)),
      (this.y = Math.floor(this.y)),
      (this.z = Math.floor(this.z)),
      this
    );
  }
  ceil() {
    return (
      (this.x = Math.ceil(this.x)),
      (this.y = Math.ceil(this.y)),
      (this.z = Math.ceil(this.z)),
      this
    );
  }
  round() {
    return (
      (this.x = Math.round(this.x)),
      (this.y = Math.round(this.y)),
      (this.z = Math.round(this.z)),
      this
    );
  }
  roundToZero() {
    return (
      (this.x = Math.trunc(this.x)),
      (this.y = Math.trunc(this.y)),
      (this.z = Math.trunc(this.z)),
      this
    );
  }
  negate() {
    return ((this.x = -this.x), (this.y = -this.y), (this.z = -this.z), this);
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return (
      (this.x += (t.x - this.x) * e),
      (this.y += (t.y - this.y) * e),
      (this.z += (t.z - this.z) * e),
      this
    );
  }
  lerpVectors(t, e, n) {
    return (
      (this.x = t.x + (e.x - t.x) * n),
      (this.y = t.y + (e.y - t.y) * n),
      (this.z = t.z + (e.z - t.z) * n),
      this
    );
  }
  cross(t) {
    return this.crossVectors(this, t);
  }
  crossVectors(t, e) {
    const n = t.x,
      s = t.y,
      r = t.z,
      a = e.x,
      o = e.y,
      l = e.z;
    return (
      (this.x = s * l - r * o),
      (this.y = r * a - n * l),
      (this.z = n * o - s * a),
      this
    );
  }
  projectOnVector(t) {
    const e = t.lengthSq();
    if (e === 0) return this.set(0, 0, 0);
    const n = t.dot(this) / e;
    return this.copy(t).multiplyScalar(n);
  }
  projectOnPlane(t) {
    return (lr.copy(this).projectOnVector(t), this.sub(lr));
  }
  reflect(t) {
    return this.sub(lr.copy(t).multiplyScalar(2 * this.dot(t)));
  }
  angleTo(t) {
    const e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0) return Math.PI / 2;
    const n = this.dot(t) / e;
    return Math.acos(Gt(n, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    const e = this.x - t.x,
      n = this.y - t.y,
      s = this.z - t.z;
    return e * e + n * n + s * s;
  }
  manhattanDistanceTo(t) {
    return (
      Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z)
    );
  }
  setFromSpherical(t) {
    return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
  }
  setFromSphericalCoords(t, e, n) {
    const s = Math.sin(e) * t;
    return (
      (this.x = s * Math.sin(n)),
      (this.y = Math.cos(e) * t),
      (this.z = s * Math.cos(n)),
      this
    );
  }
  setFromCylindrical(t) {
    return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
  }
  setFromCylindricalCoords(t, e, n) {
    return (
      (this.x = t * Math.sin(e)),
      (this.y = n),
      (this.z = t * Math.cos(e)),
      this
    );
  }
  setFromMatrixPosition(t) {
    const e = t.elements;
    return ((this.x = e[12]), (this.y = e[13]), (this.z = e[14]), this);
  }
  setFromMatrixScale(t) {
    const e = this.setFromMatrixColumn(t, 0).length(),
      n = this.setFromMatrixColumn(t, 1).length(),
      s = this.setFromMatrixColumn(t, 2).length();
    return ((this.x = e), (this.y = n), (this.z = s), this);
  }
  setFromMatrixColumn(t, e) {
    return this.fromArray(t.elements, e * 4);
  }
  setFromMatrix3Column(t, e) {
    return this.fromArray(t.elements, e * 3);
  }
  setFromEuler(t) {
    return ((this.x = t._x), (this.y = t._y), (this.z = t._z), this);
  }
  setFromColor(t) {
    return ((this.x = t.r), (this.y = t.g), (this.z = t.b), this);
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z;
  }
  fromArray(t, e = 0) {
    return ((this.x = t[e]), (this.y = t[e + 1]), (this.z = t[e + 2]), this);
  }
  toArray(t = [], e = 0) {
    return ((t[e] = this.x), (t[e + 1] = this.y), (t[e + 2] = this.z), t);
  }
  fromBufferAttribute(t, e) {
    return (
      (this.x = t.getX(e)),
      (this.y = t.getY(e)),
      (this.z = t.getZ(e)),
      this
    );
  }
  random() {
    return (
      (this.x = Math.random()),
      (this.y = Math.random()),
      (this.z = Math.random()),
      this
    );
  }
  randomDirection() {
    const t = Math.random() * Math.PI * 2,
      e = Math.random() * 2 - 1,
      n = Math.sqrt(1 - e * e);
    return (
      (this.x = n * Math.cos(t)),
      (this.y = e),
      (this.z = n * Math.sin(t)),
      this
    );
  }
  *[Symbol.iterator]() {
    (yield this.x, yield this.y, yield this.z);
  }
}
const lr = new F(),
  mo = new Pi();
class Ft {
  constructor(t, e, n, s, r, a, o, l, c) {
    ((Ft.prototype.isMatrix3 = !0),
      (this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1]),
      t !== void 0 && this.set(t, e, n, s, r, a, o, l, c));
  }
  set(t, e, n, s, r, a, o, l, c) {
    const h = this.elements;
    return (
      (h[0] = t),
      (h[1] = s),
      (h[2] = o),
      (h[3] = e),
      (h[4] = r),
      (h[5] = l),
      (h[6] = n),
      (h[7] = a),
      (h[8] = c),
      this
    );
  }
  identity() {
    return (this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this);
  }
  copy(t) {
    const e = this.elements,
      n = t.elements;
    return (
      (e[0] = n[0]),
      (e[1] = n[1]),
      (e[2] = n[2]),
      (e[3] = n[3]),
      (e[4] = n[4]),
      (e[5] = n[5]),
      (e[6] = n[6]),
      (e[7] = n[7]),
      (e[8] = n[8]),
      this
    );
  }
  extractBasis(t, e, n) {
    return (
      t.setFromMatrix3Column(this, 0),
      e.setFromMatrix3Column(this, 1),
      n.setFromMatrix3Column(this, 2),
      this
    );
  }
  setFromMatrix4(t) {
    const e = t.elements;
    return (
      this.set(e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]),
      this
    );
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, e) {
    const n = t.elements,
      s = e.elements,
      r = this.elements,
      a = n[0],
      o = n[3],
      l = n[6],
      c = n[1],
      h = n[4],
      u = n[7],
      f = n[2],
      p = n[5],
      _ = n[8],
      x = s[0],
      m = s[3],
      d = s[6],
      b = s[1],
      T = s[4],
      y = s[7],
      R = s[2],
      w = s[5],
      C = s[8];
    return (
      (r[0] = a * x + o * b + l * R),
      (r[3] = a * m + o * T + l * w),
      (r[6] = a * d + o * y + l * C),
      (r[1] = c * x + h * b + u * R),
      (r[4] = c * m + h * T + u * w),
      (r[7] = c * d + h * y + u * C),
      (r[2] = f * x + p * b + _ * R),
      (r[5] = f * m + p * T + _ * w),
      (r[8] = f * d + p * y + _ * C),
      this
    );
  }
  multiplyScalar(t) {
    const e = this.elements;
    return (
      (e[0] *= t),
      (e[3] *= t),
      (e[6] *= t),
      (e[1] *= t),
      (e[4] *= t),
      (e[7] *= t),
      (e[2] *= t),
      (e[5] *= t),
      (e[8] *= t),
      this
    );
  }
  determinant() {
    const t = this.elements,
      e = t[0],
      n = t[1],
      s = t[2],
      r = t[3],
      a = t[4],
      o = t[5],
      l = t[6],
      c = t[7],
      h = t[8];
    return (
      e * a * h - e * o * c - n * r * h + n * o * l + s * r * c - s * a * l
    );
  }
  invert() {
    const t = this.elements,
      e = t[0],
      n = t[1],
      s = t[2],
      r = t[3],
      a = t[4],
      o = t[5],
      l = t[6],
      c = t[7],
      h = t[8],
      u = h * a - o * c,
      f = o * l - h * r,
      p = c * r - a * l,
      _ = e * u + n * f + s * p;
    if (_ === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const x = 1 / _;
    return (
      (t[0] = u * x),
      (t[1] = (s * c - h * n) * x),
      (t[2] = (o * n - s * a) * x),
      (t[3] = f * x),
      (t[4] = (h * e - s * l) * x),
      (t[5] = (s * r - o * e) * x),
      (t[6] = p * x),
      (t[7] = (n * l - c * e) * x),
      (t[8] = (a * e - n * r) * x),
      this
    );
  }
  transpose() {
    let t;
    const e = this.elements;
    return (
      (t = e[1]),
      (e[1] = e[3]),
      (e[3] = t),
      (t = e[2]),
      (e[2] = e[6]),
      (e[6] = t),
      (t = e[5]),
      (e[5] = e[7]),
      (e[7] = t),
      this
    );
  }
  getNormalMatrix(t) {
    return this.setFromMatrix4(t).invert().transpose();
  }
  transposeIntoArray(t) {
    const e = this.elements;
    return (
      (t[0] = e[0]),
      (t[1] = e[3]),
      (t[2] = e[6]),
      (t[3] = e[1]),
      (t[4] = e[4]),
      (t[5] = e[7]),
      (t[6] = e[2]),
      (t[7] = e[5]),
      (t[8] = e[8]),
      this
    );
  }
  setUvTransform(t, e, n, s, r, a, o) {
    const l = Math.cos(r),
      c = Math.sin(r);
    return (
      this.set(
        n * l,
        n * c,
        -n * (l * a + c * o) + a + t,
        -s * c,
        s * l,
        -s * (-c * a + l * o) + o + e,
        0,
        0,
        1,
      ),
      this
    );
  }
  scale(t, e) {
    return (this.premultiply(dr.makeScale(t, e)), this);
  }
  rotate(t) {
    return (this.premultiply(dr.makeRotation(-t)), this);
  }
  translate(t, e) {
    return (this.premultiply(dr.makeTranslation(t, e)), this);
  }
  makeTranslation(t, e) {
    return (
      t.isVector2
        ? this.set(1, 0, t.x, 0, 1, t.y, 0, 0, 1)
        : this.set(1, 0, t, 0, 1, e, 0, 0, 1),
      this
    );
  }
  makeRotation(t) {
    const e = Math.cos(t),
      n = Math.sin(t);
    return (this.set(e, -n, 0, n, e, 0, 0, 0, 1), this);
  }
  makeScale(t, e) {
    return (this.set(t, 0, 0, 0, e, 0, 0, 0, 1), this);
  }
  equals(t) {
    const e = this.elements,
      n = t.elements;
    for (let s = 0; s < 9; s++) if (e[s] !== n[s]) return !1;
    return !0;
  }
  fromArray(t, e = 0) {
    for (let n = 0; n < 9; n++) this.elements[n] = t[n + e];
    return this;
  }
  toArray(t = [], e = 0) {
    const n = this.elements;
    return (
      (t[e] = n[0]),
      (t[e + 1] = n[1]),
      (t[e + 2] = n[2]),
      (t[e + 3] = n[3]),
      (t[e + 4] = n[4]),
      (t[e + 5] = n[5]),
      (t[e + 6] = n[6]),
      (t[e + 7] = n[7]),
      (t[e + 8] = n[8]),
      t
    );
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}
const dr = new Ft();
function Nc(i) {
  for (let t = i.length - 1; t >= 0; --t) if (i[t] >= 65535) return !0;
  return !1;
}
function $s(i) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", i);
}
function xd() {
  const i = $s("canvas");
  return ((i.style.display = "block"), i);
}
const go = {};
function Qi(i) {
  i in go || ((go[i] = !0), console.warn(i));
}
function Md(i, t, e) {
  return new Promise(function (n, s) {
    function r() {
      switch (i.clientWaitSync(t, i.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case i.WAIT_FAILED:
          s();
          break;
        case i.TIMEOUT_EXPIRED:
          setTimeout(r, e);
          break;
        default:
          n();
      }
    }
    setTimeout(r, e);
  });
}
const _o = new Ft().set(
    0.4123908,
    0.3575843,
    0.1804808,
    0.212639,
    0.7151687,
    0.0721923,
    0.0193308,
    0.1191948,
    0.9505322,
  ),
  vo = new Ft().set(
    3.2409699,
    -1.5373832,
    -0.4986108,
    -0.9692436,
    1.8759675,
    0.0415551,
    0.0556301,
    -0.203977,
    1.0569715,
  );
function Sd() {
  const i = {
      enabled: !0,
      workingColorSpace: Ai,
      spaces: {},
      convert: function (s, r, a) {
        return (
          this.enabled === !1 ||
            r === a ||
            !r ||
            !a ||
            (this.spaces[r].transfer === Qt &&
              ((s.r = yn(s.r)), (s.g = yn(s.g)), (s.b = yn(s.b))),
            this.spaces[r].primaries !== this.spaces[a].primaries &&
              (s.applyMatrix3(this.spaces[r].toXYZ),
              s.applyMatrix3(this.spaces[a].fromXYZ)),
            this.spaces[a].transfer === Qt &&
              ((s.r = yi(s.r)), (s.g = yi(s.g)), (s.b = yi(s.b)))),
          s
        );
      },
      workingToColorSpace: function (s, r) {
        return this.convert(s, this.workingColorSpace, r);
      },
      colorSpaceToWorking: function (s, r) {
        return this.convert(s, r, this.workingColorSpace);
      },
      getPrimaries: function (s) {
        return this.spaces[s].primaries;
      },
      getTransfer: function (s) {
        return s === Cn ? Gs : this.spaces[s].transfer;
      },
      getToneMappingMode: function (s) {
        return (
          this.spaces[s].outputColorSpaceConfig.toneMappingMode || "standard"
        );
      },
      getLuminanceCoefficients: function (s, r = this.workingColorSpace) {
        return s.fromArray(this.spaces[r].luminanceCoefficients);
      },
      define: function (s) {
        Object.assign(this.spaces, s);
      },
      _getMatrix: function (s, r, a) {
        return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ);
      },
      _getDrawingBufferColorSpace: function (s) {
        return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace;
      },
      _getUnpackColorSpace: function (s = this.workingColorSpace) {
        return this.spaces[s].workingColorSpaceConfig.unpackColorSpace;
      },
      fromWorkingColorSpace: function (s, r) {
        return (
          Qi(
            "THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().",
          ),
          i.workingToColorSpace(s, r)
        );
      },
      toWorkingColorSpace: function (s, r) {
        return (
          Qi(
            "THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().",
          ),
          i.colorSpaceToWorking(s, r)
        );
      },
    },
    t = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06],
    e = [0.2126, 0.7152, 0.0722],
    n = [0.3127, 0.329];
  return (
    i.define({
      [Ai]: {
        primaries: t,
        whitePoint: n,
        transfer: Gs,
        toXYZ: _o,
        fromXYZ: vo,
        luminanceCoefficients: e,
        workingColorSpaceConfig: { unpackColorSpace: He },
        outputColorSpaceConfig: { drawingBufferColorSpace: He },
      },
      [He]: {
        primaries: t,
        whitePoint: n,
        transfer: Qt,
        toXYZ: _o,
        fromXYZ: vo,
        luminanceCoefficients: e,
        outputColorSpaceConfig: { drawingBufferColorSpace: He },
      },
    }),
    i
  );
}
const Yt = Sd();
function yn(i) {
  return i < 0.04045
    ? i * 0.0773993808
    : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function yi(i) {
  return i < 0.0031308 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
let ai;
class yd {
  static getDataURL(t, e = "image/png") {
    if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u") return t.src;
    let n;
    if (t instanceof HTMLCanvasElement) n = t;
    else {
      (ai === void 0 && (ai = $s("canvas")),
        (ai.width = t.width),
        (ai.height = t.height));
      const s = ai.getContext("2d");
      (t instanceof ImageData
        ? s.putImageData(t, 0, 0)
        : s.drawImage(t, 0, 0, t.width, t.height),
        (n = ai));
    }
    return n.toDataURL(e);
  }
  static sRGBToLinear(t) {
    if (
      (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement) ||
      (typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement) ||
      (typeof ImageBitmap < "u" && t instanceof ImageBitmap)
    ) {
      const e = $s("canvas");
      ((e.width = t.width), (e.height = t.height));
      const n = e.getContext("2d");
      n.drawImage(t, 0, 0, t.width, t.height);
      const s = n.getImageData(0, 0, t.width, t.height),
        r = s.data;
      for (let a = 0; a < r.length; a++) r[a] = yn(r[a] / 255) * 255;
      return (n.putImageData(s, 0, 0), e);
    } else if (t.data) {
      const e = t.data.slice(0);
      for (let n = 0; n < e.length; n++)
        e instanceof Uint8Array || e instanceof Uint8ClampedArray
          ? (e[n] = Math.floor(yn(e[n] / 255) * 255))
          : (e[n] = yn(e[n]));
      return { data: e, width: t.width, height: t.height };
    } else
      return (
        console.warn(
          "THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.",
        ),
        t
      );
  }
}
let Ed = 0;
class Ha {
  constructor(t = null) {
    ((this.isSource = !0),
      Object.defineProperty(this, "id", { value: Ed++ }),
      (this.uuid = is()),
      (this.data = t),
      (this.dataReady = !0),
      (this.version = 0));
  }
  getSize(t) {
    const e = this.data;
    return (
      typeof HTMLVideoElement < "u" && e instanceof HTMLVideoElement
        ? t.set(e.videoWidth, e.videoHeight, 0)
        : e instanceof VideoFrame
          ? t.set(e.displayHeight, e.displayWidth, 0)
          : e !== null
            ? t.set(e.width, e.height, e.depth || 0)
            : t.set(0, 0, 0),
      t
    );
  }
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    if (!e && t.images[this.uuid] !== void 0) return t.images[this.uuid];
    const n = { uuid: this.uuid, url: "" },
      s = this.data;
    if (s !== null) {
      let r;
      if (Array.isArray(s)) {
        r = [];
        for (let a = 0, o = s.length; a < o; a++)
          s[a].isDataTexture ? r.push(hr(s[a].image)) : r.push(hr(s[a]));
      } else r = hr(s);
      n.url = r;
    }
    return (e || (t.images[this.uuid] = n), n);
  }
}
function hr(i) {
  return (typeof HTMLImageElement < "u" && i instanceof HTMLImageElement) ||
    (typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement) ||
    (typeof ImageBitmap < "u" && i instanceof ImageBitmap)
    ? yd.getDataURL(i)
    : i.data
      ? {
          data: Array.from(i.data),
          width: i.width,
          height: i.height,
          type: i.data.constructor.name,
        }
      : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let bd = 0;
const ur = new F();
class Ae extends Ci {
  constructor(
    t = Ae.DEFAULT_IMAGE,
    e = Ae.DEFAULT_MAPPING,
    n = Yn,
    s = Yn,
    r = cn,
    a = jn,
    o = sn,
    l = un,
    c = Ae.DEFAULT_ANISOTROPY,
    h = Cn,
  ) {
    (super(),
      (this.isTexture = !0),
      Object.defineProperty(this, "id", { value: bd++ }),
      (this.uuid = is()),
      (this.name = ""),
      (this.source = new Ha(t)),
      (this.mipmaps = []),
      (this.mapping = e),
      (this.channel = 0),
      (this.wrapS = n),
      (this.wrapT = s),
      (this.magFilter = r),
      (this.minFilter = a),
      (this.anisotropy = c),
      (this.format = o),
      (this.internalFormat = null),
      (this.type = l),
      (this.offset = new Xt(0, 0)),
      (this.repeat = new Xt(1, 1)),
      (this.center = new Xt(0, 0)),
      (this.rotation = 0),
      (this.matrixAutoUpdate = !0),
      (this.matrix = new Ft()),
      (this.generateMipmaps = !0),
      (this.premultiplyAlpha = !1),
      (this.flipY = !0),
      (this.unpackAlignment = 4),
      (this.colorSpace = h),
      (this.userData = {}),
      (this.updateRanges = []),
      (this.version = 0),
      (this.onUpdate = null),
      (this.renderTarget = null),
      (this.isRenderTargetTexture = !1),
      (this.isArrayTexture = !!(t && t.depth && t.depth > 1)),
      (this.pmremVersion = 0));
  }
  get width() {
    return this.source.getSize(ur).x;
  }
  get height() {
    return this.source.getSize(ur).y;
  }
  get depth() {
    return this.source.getSize(ur).z;
  }
  get image() {
    return this.source.data;
  }
  set image(t = null) {
    this.source.data = t;
  }
  updateMatrix() {
    this.matrix.setUvTransform(
      this.offset.x,
      this.offset.y,
      this.repeat.x,
      this.repeat.y,
      this.rotation,
      this.center.x,
      this.center.y,
    );
  }
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return (
      (this.name = t.name),
      (this.source = t.source),
      (this.mipmaps = t.mipmaps.slice(0)),
      (this.mapping = t.mapping),
      (this.channel = t.channel),
      (this.wrapS = t.wrapS),
      (this.wrapT = t.wrapT),
      (this.magFilter = t.magFilter),
      (this.minFilter = t.minFilter),
      (this.anisotropy = t.anisotropy),
      (this.format = t.format),
      (this.internalFormat = t.internalFormat),
      (this.type = t.type),
      this.offset.copy(t.offset),
      this.repeat.copy(t.repeat),
      this.center.copy(t.center),
      (this.rotation = t.rotation),
      (this.matrixAutoUpdate = t.matrixAutoUpdate),
      this.matrix.copy(t.matrix),
      (this.generateMipmaps = t.generateMipmaps),
      (this.premultiplyAlpha = t.premultiplyAlpha),
      (this.flipY = t.flipY),
      (this.unpackAlignment = t.unpackAlignment),
      (this.colorSpace = t.colorSpace),
      (this.renderTarget = t.renderTarget),
      (this.isRenderTargetTexture = t.isRenderTargetTexture),
      (this.isArrayTexture = t.isArrayTexture),
      (this.userData = JSON.parse(JSON.stringify(t.userData))),
      (this.needsUpdate = !0),
      this
    );
  }
  setValues(t) {
    for (const e in t) {
      const n = t[e];
      if (n === void 0) {
        console.warn(
          `THREE.Texture.setValues(): parameter '${e}' has value of undefined.`,
        );
        continue;
      }
      const s = this[e];
      if (s === void 0) {
        console.warn(
          `THREE.Texture.setValues(): property '${e}' does not exist.`,
        );
        continue;
      }
      (s && n && s.isVector2 && n.isVector2) ||
      (s && n && s.isVector3 && n.isVector3) ||
      (s && n && s.isMatrix3 && n.isMatrix3)
        ? s.copy(n)
        : (this[e] = n);
    }
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    if (!e && t.textures[this.uuid] !== void 0) return t.textures[this.uuid];
    const n = {
      metadata: { version: 4.7, type: "Texture", generator: "Texture.toJSON" },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(t).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment,
    };
    return (
      Object.keys(this.userData).length > 0 && (n.userData = this.userData),
      e || (t.textures[this.uuid] = n),
      n
    );
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  transformUv(t) {
    if (this.mapping !== Tc) return t;
    if ((t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1))
      switch (this.wrapS) {
        case Qr:
          t.x = t.x - Math.floor(t.x);
          break;
        case Yn:
          t.x = t.x < 0 ? 0 : 1;
          break;
        case ta:
          Math.abs(Math.floor(t.x) % 2) === 1
            ? (t.x = Math.ceil(t.x) - t.x)
            : (t.x = t.x - Math.floor(t.x));
          break;
      }
    if (t.y < 0 || t.y > 1)
      switch (this.wrapT) {
        case Qr:
          t.y = t.y - Math.floor(t.y);
          break;
        case Yn:
          t.y = t.y < 0 ? 0 : 1;
          break;
        case ta:
          Math.abs(Math.floor(t.y) % 2) === 1
            ? (t.y = Math.ceil(t.y) - t.y)
            : (t.y = t.y - Math.floor(t.y));
          break;
      }
    return (this.flipY && (t.y = 1 - t.y), t);
  }
  set needsUpdate(t) {
    t === !0 && (this.version++, (this.source.needsUpdate = !0));
  }
  set needsPMREMUpdate(t) {
    t === !0 && this.pmremVersion++;
  }
}
Ae.DEFAULT_IMAGE = null;
Ae.DEFAULT_MAPPING = Tc;
Ae.DEFAULT_ANISOTROPY = 1;
class ue {
  constructor(t = 0, e = 0, n = 0, s = 1) {
    ((ue.prototype.isVector4 = !0),
      (this.x = t),
      (this.y = e),
      (this.z = n),
      (this.w = s));
  }
  get width() {
    return this.z;
  }
  set width(t) {
    this.z = t;
  }
  get height() {
    return this.w;
  }
  set height(t) {
    this.w = t;
  }
  set(t, e, n, s) {
    return ((this.x = t), (this.y = e), (this.z = n), (this.w = s), this);
  }
  setScalar(t) {
    return ((this.x = t), (this.y = t), (this.z = t), (this.w = t), this);
  }
  setX(t) {
    return ((this.x = t), this);
  }
  setY(t) {
    return ((this.y = t), this);
  }
  setZ(t) {
    return ((this.z = t), this);
  }
  setW(t) {
    return ((this.w = t), this);
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      case 2:
        this.z = e;
        break;
      case 3:
        this.w = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(t) {
    return (
      (this.x = t.x),
      (this.y = t.y),
      (this.z = t.z),
      (this.w = t.w !== void 0 ? t.w : 1),
      this
    );
  }
  add(t) {
    return (
      (this.x += t.x),
      (this.y += t.y),
      (this.z += t.z),
      (this.w += t.w),
      this
    );
  }
  addScalar(t) {
    return ((this.x += t), (this.y += t), (this.z += t), (this.w += t), this);
  }
  addVectors(t, e) {
    return (
      (this.x = t.x + e.x),
      (this.y = t.y + e.y),
      (this.z = t.z + e.z),
      (this.w = t.w + e.w),
      this
    );
  }
  addScaledVector(t, e) {
    return (
      (this.x += t.x * e),
      (this.y += t.y * e),
      (this.z += t.z * e),
      (this.w += t.w * e),
      this
    );
  }
  sub(t) {
    return (
      (this.x -= t.x),
      (this.y -= t.y),
      (this.z -= t.z),
      (this.w -= t.w),
      this
    );
  }
  subScalar(t) {
    return ((this.x -= t), (this.y -= t), (this.z -= t), (this.w -= t), this);
  }
  subVectors(t, e) {
    return (
      (this.x = t.x - e.x),
      (this.y = t.y - e.y),
      (this.z = t.z - e.z),
      (this.w = t.w - e.w),
      this
    );
  }
  multiply(t) {
    return (
      (this.x *= t.x),
      (this.y *= t.y),
      (this.z *= t.z),
      (this.w *= t.w),
      this
    );
  }
  multiplyScalar(t) {
    return ((this.x *= t), (this.y *= t), (this.z *= t), (this.w *= t), this);
  }
  applyMatrix4(t) {
    const e = this.x,
      n = this.y,
      s = this.z,
      r = this.w,
      a = t.elements;
    return (
      (this.x = a[0] * e + a[4] * n + a[8] * s + a[12] * r),
      (this.y = a[1] * e + a[5] * n + a[9] * s + a[13] * r),
      (this.z = a[2] * e + a[6] * n + a[10] * s + a[14] * r),
      (this.w = a[3] * e + a[7] * n + a[11] * s + a[15] * r),
      this
    );
  }
  divide(t) {
    return (
      (this.x /= t.x),
      (this.y /= t.y),
      (this.z /= t.z),
      (this.w /= t.w),
      this
    );
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  setAxisAngleFromQuaternion(t) {
    this.w = 2 * Math.acos(t.w);
    const e = Math.sqrt(1 - t.w * t.w);
    return (
      e < 1e-4
        ? ((this.x = 1), (this.y = 0), (this.z = 0))
        : ((this.x = t.x / e), (this.y = t.y / e), (this.z = t.z / e)),
      this
    );
  }
  setAxisAngleFromRotationMatrix(t) {
    let e, n, s, r;
    const l = t.elements,
      c = l[0],
      h = l[4],
      u = l[8],
      f = l[1],
      p = l[5],
      _ = l[9],
      x = l[2],
      m = l[6],
      d = l[10];
    if (
      Math.abs(h - f) < 0.01 &&
      Math.abs(u - x) < 0.01 &&
      Math.abs(_ - m) < 0.01
    ) {
      if (
        Math.abs(h + f) < 0.1 &&
        Math.abs(u + x) < 0.1 &&
        Math.abs(_ + m) < 0.1 &&
        Math.abs(c + p + d - 3) < 0.1
      )
        return (this.set(1, 0, 0, 0), this);
      e = Math.PI;
      const T = (c + 1) / 2,
        y = (p + 1) / 2,
        R = (d + 1) / 2,
        w = (h + f) / 4,
        C = (u + x) / 4,
        U = (_ + m) / 4;
      return (
        T > y && T > R
          ? T < 0.01
            ? ((n = 0), (s = 0.707106781), (r = 0.707106781))
            : ((n = Math.sqrt(T)), (s = w / n), (r = C / n))
          : y > R
            ? y < 0.01
              ? ((n = 0.707106781), (s = 0), (r = 0.707106781))
              : ((s = Math.sqrt(y)), (n = w / s), (r = U / s))
            : R < 0.01
              ? ((n = 0.707106781), (s = 0.707106781), (r = 0))
              : ((r = Math.sqrt(R)), (n = C / r), (s = U / r)),
        this.set(n, s, r, e),
        this
      );
    }
    let b = Math.sqrt(
      (m - _) * (m - _) + (u - x) * (u - x) + (f - h) * (f - h),
    );
    return (
      Math.abs(b) < 0.001 && (b = 1),
      (this.x = (m - _) / b),
      (this.y = (u - x) / b),
      (this.z = (f - h) / b),
      (this.w = Math.acos((c + p + d - 1) / 2)),
      this
    );
  }
  setFromMatrixPosition(t) {
    const e = t.elements;
    return (
      (this.x = e[12]),
      (this.y = e[13]),
      (this.z = e[14]),
      (this.w = e[15]),
      this
    );
  }
  min(t) {
    return (
      (this.x = Math.min(this.x, t.x)),
      (this.y = Math.min(this.y, t.y)),
      (this.z = Math.min(this.z, t.z)),
      (this.w = Math.min(this.w, t.w)),
      this
    );
  }
  max(t) {
    return (
      (this.x = Math.max(this.x, t.x)),
      (this.y = Math.max(this.y, t.y)),
      (this.z = Math.max(this.z, t.z)),
      (this.w = Math.max(this.w, t.w)),
      this
    );
  }
  clamp(t, e) {
    return (
      (this.x = Gt(this.x, t.x, e.x)),
      (this.y = Gt(this.y, t.y, e.y)),
      (this.z = Gt(this.z, t.z, e.z)),
      (this.w = Gt(this.w, t.w, e.w)),
      this
    );
  }
  clampScalar(t, e) {
    return (
      (this.x = Gt(this.x, t, e)),
      (this.y = Gt(this.y, t, e)),
      (this.z = Gt(this.z, t, e)),
      (this.w = Gt(this.w, t, e)),
      this
    );
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Gt(n, t, e));
  }
  floor() {
    return (
      (this.x = Math.floor(this.x)),
      (this.y = Math.floor(this.y)),
      (this.z = Math.floor(this.z)),
      (this.w = Math.floor(this.w)),
      this
    );
  }
  ceil() {
    return (
      (this.x = Math.ceil(this.x)),
      (this.y = Math.ceil(this.y)),
      (this.z = Math.ceil(this.z)),
      (this.w = Math.ceil(this.w)),
      this
    );
  }
  round() {
    return (
      (this.x = Math.round(this.x)),
      (this.y = Math.round(this.y)),
      (this.z = Math.round(this.z)),
      (this.w = Math.round(this.w)),
      this
    );
  }
  roundToZero() {
    return (
      (this.x = Math.trunc(this.x)),
      (this.y = Math.trunc(this.y)),
      (this.z = Math.trunc(this.z)),
      (this.w = Math.trunc(this.w)),
      this
    );
  }
  negate() {
    return (
      (this.x = -this.x),
      (this.y = -this.y),
      (this.z = -this.z),
      (this.w = -this.w),
      this
    );
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w;
  }
  lengthSq() {
    return (
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
  }
  length() {
    return Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w,
    );
  }
  manhattanLength() {
    return (
      Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w)
    );
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return (
      (this.x += (t.x - this.x) * e),
      (this.y += (t.y - this.y) * e),
      (this.z += (t.z - this.z) * e),
      (this.w += (t.w - this.w) * e),
      this
    );
  }
  lerpVectors(t, e, n) {
    return (
      (this.x = t.x + (e.x - t.x) * n),
      (this.y = t.y + (e.y - t.y) * n),
      (this.z = t.z + (e.z - t.z) * n),
      (this.w = t.w + (e.w - t.w) * n),
      this
    );
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w;
  }
  fromArray(t, e = 0) {
    return (
      (this.x = t[e]),
      (this.y = t[e + 1]),
      (this.z = t[e + 2]),
      (this.w = t[e + 3]),
      this
    );
  }
  toArray(t = [], e = 0) {
    return (
      (t[e] = this.x),
      (t[e + 1] = this.y),
      (t[e + 2] = this.z),
      (t[e + 3] = this.w),
      t
    );
  }
  fromBufferAttribute(t, e) {
    return (
      (this.x = t.getX(e)),
      (this.y = t.getY(e)),
      (this.z = t.getZ(e)),
      (this.w = t.getW(e)),
      this
    );
  }
  random() {
    return (
      (this.x = Math.random()),
      (this.y = Math.random()),
      (this.z = Math.random()),
      (this.w = Math.random()),
      this
    );
  }
  *[Symbol.iterator]() {
    (yield this.x, yield this.y, yield this.z, yield this.w);
  }
}
class Td extends Ci {
  constructor(t = 1, e = 1, n = {}) {
    (super(),
      (n = Object.assign(
        {
          generateMipmaps: !1,
          internalFormat: null,
          minFilter: cn,
          depthBuffer: !0,
          stencilBuffer: !1,
          resolveDepthBuffer: !0,
          resolveStencilBuffer: !0,
          depthTexture: null,
          samples: 0,
          count: 1,
          depth: 1,
          multiview: !1,
        },
        n,
      )),
      (this.isRenderTarget = !0),
      (this.width = t),
      (this.height = e),
      (this.depth = n.depth),
      (this.scissor = new ue(0, 0, t, e)),
      (this.scissorTest = !1),
      (this.viewport = new ue(0, 0, t, e)));
    const s = { width: t, height: e, depth: n.depth },
      r = new Ae(s);
    this.textures = [];
    const a = n.count;
    for (let o = 0; o < a; o++)
      ((this.textures[o] = r.clone()),
        (this.textures[o].isRenderTargetTexture = !0),
        (this.textures[o].renderTarget = this));
    (this._setTextureOptions(n),
      (this.depthBuffer = n.depthBuffer),
      (this.stencilBuffer = n.stencilBuffer),
      (this.resolveDepthBuffer = n.resolveDepthBuffer),
      (this.resolveStencilBuffer = n.resolveStencilBuffer),
      (this._depthTexture = null),
      (this.depthTexture = n.depthTexture),
      (this.samples = n.samples),
      (this.multiview = n.multiview));
  }
  _setTextureOptions(t = {}) {
    const e = {
      minFilter: cn,
      generateMipmaps: !1,
      flipY: !1,
      internalFormat: null,
    };
    (t.mapping !== void 0 && (e.mapping = t.mapping),
      t.wrapS !== void 0 && (e.wrapS = t.wrapS),
      t.wrapT !== void 0 && (e.wrapT = t.wrapT),
      t.wrapR !== void 0 && (e.wrapR = t.wrapR),
      t.magFilter !== void 0 && (e.magFilter = t.magFilter),
      t.minFilter !== void 0 && (e.minFilter = t.minFilter),
      t.format !== void 0 && (e.format = t.format),
      t.type !== void 0 && (e.type = t.type),
      t.anisotropy !== void 0 && (e.anisotropy = t.anisotropy),
      t.colorSpace !== void 0 && (e.colorSpace = t.colorSpace),
      t.flipY !== void 0 && (e.flipY = t.flipY),
      t.generateMipmaps !== void 0 && (e.generateMipmaps = t.generateMipmaps),
      t.internalFormat !== void 0 && (e.internalFormat = t.internalFormat));
    for (let n = 0; n < this.textures.length; n++)
      this.textures[n].setValues(e);
  }
  get texture() {
    return this.textures[0];
  }
  set texture(t) {
    this.textures[0] = t;
  }
  set depthTexture(t) {
    (this._depthTexture !== null && (this._depthTexture.renderTarget = null),
      t !== null && (t.renderTarget = this),
      (this._depthTexture = t));
  }
  get depthTexture() {
    return this._depthTexture;
  }
  setSize(t, e, n = 1) {
    if (this.width !== t || this.height !== e || this.depth !== n) {
      ((this.width = t), (this.height = e), (this.depth = n));
      for (let s = 0, r = this.textures.length; s < r; s++)
        ((this.textures[s].image.width = t),
          (this.textures[s].image.height = e),
          (this.textures[s].image.depth = n),
          (this.textures[s].isArrayTexture = this.textures[s].image.depth > 1));
      this.dispose();
    }
    (this.viewport.set(0, 0, t, e), this.scissor.set(0, 0, t, e));
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    ((this.width = t.width),
      (this.height = t.height),
      (this.depth = t.depth),
      this.scissor.copy(t.scissor),
      (this.scissorTest = t.scissorTest),
      this.viewport.copy(t.viewport),
      (this.textures.length = 0));
    for (let e = 0, n = t.textures.length; e < n; e++) {
      ((this.textures[e] = t.textures[e].clone()),
        (this.textures[e].isRenderTargetTexture = !0),
        (this.textures[e].renderTarget = this));
      const s = Object.assign({}, t.textures[e].image);
      this.textures[e].source = new Ha(s);
    }
    return (
      (this.depthBuffer = t.depthBuffer),
      (this.stencilBuffer = t.stencilBuffer),
      (this.resolveDepthBuffer = t.resolveDepthBuffer),
      (this.resolveStencilBuffer = t.resolveStencilBuffer),
      t.depthTexture !== null && (this.depthTexture = t.depthTexture.clone()),
      (this.samples = t.samples),
      this
    );
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class ei extends Td {
  constructor(t = 1, e = 1, n = {}) {
    (super(t, e, n), (this.isWebGLRenderTarget = !0));
  }
}
class Fc extends Ae {
  constructor(t = null, e = 1, n = 1, s = 1) {
    (super(null),
      (this.isDataArrayTexture = !0),
      (this.image = { data: t, width: e, height: n, depth: s }),
      (this.magFilter = Ge),
      (this.minFilter = Ge),
      (this.wrapR = Yn),
      (this.generateMipmaps = !1),
      (this.flipY = !1),
      (this.unpackAlignment = 1),
      (this.layerUpdates = new Set()));
  }
  addLayerUpdate(t) {
    this.layerUpdates.add(t);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class Ad extends Ae {
  constructor(t = null, e = 1, n = 1, s = 1) {
    (super(null),
      (this.isData3DTexture = !0),
      (this.image = { data: t, width: e, height: n, depth: s }),
      (this.magFilter = Ge),
      (this.minFilter = Ge),
      (this.wrapR = Yn),
      (this.generateMipmaps = !1),
      (this.flipY = !1),
      (this.unpackAlignment = 1));
  }
}
class ii {
  constructor(
    t = new F(1 / 0, 1 / 0, 1 / 0),
    e = new F(-1 / 0, -1 / 0, -1 / 0),
  ) {
    ((this.isBox3 = !0), (this.min = t), (this.max = e));
  }
  set(t, e) {
    return (this.min.copy(t), this.max.copy(e), this);
  }
  setFromArray(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e += 3)
      this.expandByPoint(Je.fromArray(t, e));
    return this;
  }
  setFromBufferAttribute(t) {
    this.makeEmpty();
    for (let e = 0, n = t.count; e < n; e++)
      this.expandByPoint(Je.fromBufferAttribute(t, e));
    return this;
  }
  setFromPoints(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e++) this.expandByPoint(t[e]);
    return this;
  }
  setFromCenterAndSize(t, e) {
    const n = Je.copy(e).multiplyScalar(0.5);
    return (this.min.copy(t).sub(n), this.max.copy(t).add(n), this);
  }
  setFromObject(t, e = !1) {
    return (this.makeEmpty(), this.expandByObject(t, e));
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return (this.min.copy(t.min), this.max.copy(t.max), this);
  }
  makeEmpty() {
    return (
      (this.min.x = this.min.y = this.min.z = 1 / 0),
      (this.max.x = this.max.y = this.max.z = -1 / 0),
      this
    );
  }
  isEmpty() {
    return (
      this.max.x < this.min.x ||
      this.max.y < this.min.y ||
      this.max.z < this.min.z
    );
  }
  getCenter(t) {
    return this.isEmpty()
      ? t.set(0, 0, 0)
      : t.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(t) {
    return this.isEmpty() ? t.set(0, 0, 0) : t.subVectors(this.max, this.min);
  }
  expandByPoint(t) {
    return (this.min.min(t), this.max.max(t), this);
  }
  expandByVector(t) {
    return (this.min.sub(t), this.max.add(t), this);
  }
  expandByScalar(t) {
    return (this.min.addScalar(-t), this.max.addScalar(t), this);
  }
  expandByObject(t, e = !1) {
    t.updateWorldMatrix(!1, !1);
    const n = t.geometry;
    if (n !== void 0) {
      const r = n.getAttribute("position");
      if (e === !0 && r !== void 0 && t.isInstancedMesh !== !0)
        for (let a = 0, o = r.count; a < o; a++)
          (t.isMesh === !0
            ? t.getVertexPosition(a, Je)
            : Je.fromBufferAttribute(r, a),
            Je.applyMatrix4(t.matrixWorld),
            this.expandByPoint(Je));
      else
        (t.boundingBox !== void 0
          ? (t.boundingBox === null && t.computeBoundingBox(),
            ds.copy(t.boundingBox))
          : (n.boundingBox === null && n.computeBoundingBox(),
            ds.copy(n.boundingBox)),
          ds.applyMatrix4(t.matrixWorld),
          this.union(ds));
    }
    const s = t.children;
    for (let r = 0, a = s.length; r < a; r++) this.expandByObject(s[r], e);
    return this;
  }
  containsPoint(t) {
    return (
      t.x >= this.min.x &&
      t.x <= this.max.x &&
      t.y >= this.min.y &&
      t.y <= this.max.y &&
      t.z >= this.min.z &&
      t.z <= this.max.z
    );
  }
  containsBox(t) {
    return (
      this.min.x <= t.min.x &&
      t.max.x <= this.max.x &&
      this.min.y <= t.min.y &&
      t.max.y <= this.max.y &&
      this.min.z <= t.min.z &&
      t.max.z <= this.max.z
    );
  }
  getParameter(t, e) {
    return e.set(
      (t.x - this.min.x) / (this.max.x - this.min.x),
      (t.y - this.min.y) / (this.max.y - this.min.y),
      (t.z - this.min.z) / (this.max.z - this.min.z),
    );
  }
  intersectsBox(t) {
    return (
      t.max.x >= this.min.x &&
      t.min.x <= this.max.x &&
      t.max.y >= this.min.y &&
      t.min.y <= this.max.y &&
      t.max.z >= this.min.z &&
      t.min.z <= this.max.z
    );
  }
  intersectsSphere(t) {
    return (
      this.clampPoint(t.center, Je),
      Je.distanceToSquared(t.center) <= t.radius * t.radius
    );
  }
  intersectsPlane(t) {
    let e, n;
    return (
      t.normal.x > 0
        ? ((e = t.normal.x * this.min.x), (n = t.normal.x * this.max.x))
        : ((e = t.normal.x * this.max.x), (n = t.normal.x * this.min.x)),
      t.normal.y > 0
        ? ((e += t.normal.y * this.min.y), (n += t.normal.y * this.max.y))
        : ((e += t.normal.y * this.max.y), (n += t.normal.y * this.min.y)),
      t.normal.z > 0
        ? ((e += t.normal.z * this.min.z), (n += t.normal.z * this.max.z))
        : ((e += t.normal.z * this.max.z), (n += t.normal.z * this.min.z)),
      e <= -t.constant && n >= -t.constant
    );
  }
  intersectsTriangle(t) {
    if (this.isEmpty()) return !1;
    (this.getCenter(Bi),
      hs.subVectors(this.max, Bi),
      oi.subVectors(t.a, Bi),
      ci.subVectors(t.b, Bi),
      li.subVectors(t.c, Bi),
      En.subVectors(ci, oi),
      bn.subVectors(li, ci),
      Bn.subVectors(oi, li));
    let e = [
      0,
      -En.z,
      En.y,
      0,
      -bn.z,
      bn.y,
      0,
      -Bn.z,
      Bn.y,
      En.z,
      0,
      -En.x,
      bn.z,
      0,
      -bn.x,
      Bn.z,
      0,
      -Bn.x,
      -En.y,
      En.x,
      0,
      -bn.y,
      bn.x,
      0,
      -Bn.y,
      Bn.x,
      0,
    ];
    return !fr(e, oi, ci, li, hs) ||
      ((e = [1, 0, 0, 0, 1, 0, 0, 0, 1]), !fr(e, oi, ci, li, hs))
      ? !1
      : (us.crossVectors(En, bn),
        (e = [us.x, us.y, us.z]),
        fr(e, oi, ci, li, hs));
  }
  clampPoint(t, e) {
    return e.copy(t).clamp(this.min, this.max);
  }
  distanceToPoint(t) {
    return this.clampPoint(t, Je).distanceTo(t);
  }
  getBoundingSphere(t) {
    return (
      this.isEmpty()
        ? t.makeEmpty()
        : (this.getCenter(t.center),
          (t.radius = this.getSize(Je).length() * 0.5)),
      t
    );
  }
  intersect(t) {
    return (
      this.min.max(t.min),
      this.max.min(t.max),
      this.isEmpty() && this.makeEmpty(),
      this
    );
  }
  union(t) {
    return (this.min.min(t.min), this.max.max(t.max), this);
  }
  applyMatrix4(t) {
    return this.isEmpty()
      ? this
      : (mn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t),
        mn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t),
        mn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t),
        mn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t),
        mn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t),
        mn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t),
        mn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t),
        mn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t),
        this.setFromPoints(mn),
        this);
  }
  translate(t) {
    return (this.min.add(t), this.max.add(t), this);
  }
  equals(t) {
    return t.min.equals(this.min) && t.max.equals(this.max);
  }
  toJSON() {
    return { min: this.min.toArray(), max: this.max.toArray() };
  }
  fromJSON(t) {
    return (this.min.fromArray(t.min), this.max.fromArray(t.max), this);
  }
}
const mn = [
    new F(),
    new F(),
    new F(),
    new F(),
    new F(),
    new F(),
    new F(),
    new F(),
  ],
  Je = new F(),
  ds = new ii(),
  oi = new F(),
  ci = new F(),
  li = new F(),
  En = new F(),
  bn = new F(),
  Bn = new F(),
  Bi = new F(),
  hs = new F(),
  us = new F(),
  kn = new F();
function fr(i, t, e, n, s) {
  for (let r = 0, a = i.length - 3; r <= a; r += 3) {
    kn.fromArray(i, r);
    const o =
        s.x * Math.abs(kn.x) + s.y * Math.abs(kn.y) + s.z * Math.abs(kn.z),
      l = t.dot(kn),
      c = e.dot(kn),
      h = n.dot(kn);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > o) return !1;
  }
  return !0;
}
const wd = new ii(),
  ki = new F(),
  pr = new F();
class Di {
  constructor(t = new F(), e = -1) {
    ((this.isSphere = !0), (this.center = t), (this.radius = e));
  }
  set(t, e) {
    return (this.center.copy(t), (this.radius = e), this);
  }
  setFromPoints(t, e) {
    const n = this.center;
    e !== void 0 ? n.copy(e) : wd.setFromPoints(t).getCenter(n);
    let s = 0;
    for (let r = 0, a = t.length; r < a; r++)
      s = Math.max(s, n.distanceToSquared(t[r]));
    return ((this.radius = Math.sqrt(s)), this);
  }
  copy(t) {
    return (this.center.copy(t.center), (this.radius = t.radius), this);
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return (this.center.set(0, 0, 0), (this.radius = -1), this);
  }
  containsPoint(t) {
    return t.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(t) {
    return t.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(t) {
    const e = this.radius + t.radius;
    return t.center.distanceToSquared(this.center) <= e * e;
  }
  intersectsBox(t) {
    return t.intersectsSphere(this);
  }
  intersectsPlane(t) {
    return Math.abs(t.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(t, e) {
    const n = this.center.distanceToSquared(t);
    return (
      e.copy(t),
      n > this.radius * this.radius &&
        (e.sub(this.center).normalize(),
        e.multiplyScalar(this.radius).add(this.center)),
      e
    );
  }
  getBoundingBox(t) {
    return this.isEmpty()
      ? (t.makeEmpty(), t)
      : (t.set(this.center, this.center), t.expandByScalar(this.radius), t);
  }
  applyMatrix4(t) {
    return (
      this.center.applyMatrix4(t),
      (this.radius = this.radius * t.getMaxScaleOnAxis()),
      this
    );
  }
  translate(t) {
    return (this.center.add(t), this);
  }
  expandByPoint(t) {
    if (this.isEmpty()) return (this.center.copy(t), (this.radius = 0), this);
    ki.subVectors(t, this.center);
    const e = ki.lengthSq();
    if (e > this.radius * this.radius) {
      const n = Math.sqrt(e),
        s = (n - this.radius) * 0.5;
      (this.center.addScaledVector(ki, s / n), (this.radius += s));
    }
    return this;
  }
  union(t) {
    return t.isEmpty()
      ? this
      : this.isEmpty()
        ? (this.copy(t), this)
        : (this.center.equals(t.center) === !0
            ? (this.radius = Math.max(this.radius, t.radius))
            : (pr.subVectors(t.center, this.center).setLength(t.radius),
              this.expandByPoint(ki.copy(t.center).add(pr)),
              this.expandByPoint(ki.copy(t.center).sub(pr))),
          this);
  }
  equals(t) {
    return t.center.equals(this.center) && t.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    return { radius: this.radius, center: this.center.toArray() };
  }
  fromJSON(t) {
    return ((this.radius = t.radius), this.center.fromArray(t.center), this);
  }
}
const gn = new F(),
  mr = new F(),
  fs = new F(),
  Tn = new F(),
  gr = new F(),
  ps = new F(),
  _r = new F();
class Oc {
  constructor(t = new F(), e = new F(0, 0, -1)) {
    ((this.origin = t), (this.direction = e));
  }
  set(t, e) {
    return (this.origin.copy(t), this.direction.copy(e), this);
  }
  copy(t) {
    return (this.origin.copy(t.origin), this.direction.copy(t.direction), this);
  }
  at(t, e) {
    return e.copy(this.origin).addScaledVector(this.direction, t);
  }
  lookAt(t) {
    return (this.direction.copy(t).sub(this.origin).normalize(), this);
  }
  recast(t) {
    return (this.origin.copy(this.at(t, gn)), this);
  }
  closestPointToPoint(t, e) {
    e.subVectors(t, this.origin);
    const n = e.dot(this.direction);
    return n < 0
      ? e.copy(this.origin)
      : e.copy(this.origin).addScaledVector(this.direction, n);
  }
  distanceToPoint(t) {
    return Math.sqrt(this.distanceSqToPoint(t));
  }
  distanceSqToPoint(t) {
    const e = gn.subVectors(t, this.origin).dot(this.direction);
    return e < 0
      ? this.origin.distanceToSquared(t)
      : (gn.copy(this.origin).addScaledVector(this.direction, e),
        gn.distanceToSquared(t));
  }
  distanceSqToSegment(t, e, n, s) {
    (mr.copy(t).add(e).multiplyScalar(0.5),
      fs.copy(e).sub(t).normalize(),
      Tn.copy(this.origin).sub(mr));
    const r = t.distanceTo(e) * 0.5,
      a = -this.direction.dot(fs),
      o = Tn.dot(this.direction),
      l = -Tn.dot(fs),
      c = Tn.lengthSq(),
      h = Math.abs(1 - a * a);
    let u, f, p, _;
    if (h > 0)
      if (((u = a * l - o), (f = a * o - l), (_ = r * h), u >= 0))
        if (f >= -_)
          if (f <= _) {
            const x = 1 / h;
            ((u *= x),
              (f *= x),
              (p = u * (u + a * f + 2 * o) + f * (a * u + f + 2 * l) + c));
          } else
            ((f = r),
              (u = Math.max(0, -(a * f + o))),
              (p = -u * u + f * (f + 2 * l) + c));
        else
          ((f = -r),
            (u = Math.max(0, -(a * f + o))),
            (p = -u * u + f * (f + 2 * l) + c));
      else
        f <= -_
          ? ((u = Math.max(0, -(-a * r + o))),
            (f = u > 0 ? -r : Math.min(Math.max(-r, -l), r)),
            (p = -u * u + f * (f + 2 * l) + c))
          : f <= _
            ? ((u = 0),
              (f = Math.min(Math.max(-r, -l), r)),
              (p = f * (f + 2 * l) + c))
            : ((u = Math.max(0, -(a * r + o))),
              (f = u > 0 ? r : Math.min(Math.max(-r, -l), r)),
              (p = -u * u + f * (f + 2 * l) + c));
    else
      ((f = a > 0 ? -r : r),
        (u = Math.max(0, -(a * f + o))),
        (p = -u * u + f * (f + 2 * l) + c));
    return (
      n && n.copy(this.origin).addScaledVector(this.direction, u),
      s && s.copy(mr).addScaledVector(fs, f),
      p
    );
  }
  intersectSphere(t, e) {
    gn.subVectors(t.center, this.origin);
    const n = gn.dot(this.direction),
      s = gn.dot(gn) - n * n,
      r = t.radius * t.radius;
    if (s > r) return null;
    const a = Math.sqrt(r - s),
      o = n - a,
      l = n + a;
    return l < 0 ? null : o < 0 ? this.at(l, e) : this.at(o, e);
  }
  intersectsSphere(t) {
    return t.radius < 0
      ? !1
      : this.distanceSqToPoint(t.center) <= t.radius * t.radius;
  }
  distanceToPlane(t) {
    const e = t.normal.dot(this.direction);
    if (e === 0) return t.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(t.normal) + t.constant) / e;
    return n >= 0 ? n : null;
  }
  intersectPlane(t, e) {
    const n = this.distanceToPlane(t);
    return n === null ? null : this.at(n, e);
  }
  intersectsPlane(t) {
    const e = t.distanceToPoint(this.origin);
    return e === 0 || t.normal.dot(this.direction) * e < 0;
  }
  intersectBox(t, e) {
    let n, s, r, a, o, l;
    const c = 1 / this.direction.x,
      h = 1 / this.direction.y,
      u = 1 / this.direction.z,
      f = this.origin;
    return (
      c >= 0
        ? ((n = (t.min.x - f.x) * c), (s = (t.max.x - f.x) * c))
        : ((n = (t.max.x - f.x) * c), (s = (t.min.x - f.x) * c)),
      h >= 0
        ? ((r = (t.min.y - f.y) * h), (a = (t.max.y - f.y) * h))
        : ((r = (t.max.y - f.y) * h), (a = (t.min.y - f.y) * h)),
      n > a ||
      r > s ||
      ((r > n || isNaN(n)) && (n = r),
      (a < s || isNaN(s)) && (s = a),
      u >= 0
        ? ((o = (t.min.z - f.z) * u), (l = (t.max.z - f.z) * u))
        : ((o = (t.max.z - f.z) * u), (l = (t.min.z - f.z) * u)),
      n > l || o > s) ||
      ((o > n || n !== n) && (n = o), (l < s || s !== s) && (s = l), s < 0)
        ? null
        : this.at(n >= 0 ? n : s, e)
    );
  }
  intersectsBox(t) {
    return this.intersectBox(t, gn) !== null;
  }
  intersectTriangle(t, e, n, s, r) {
    (gr.subVectors(e, t), ps.subVectors(n, t), _r.crossVectors(gr, ps));
    let a = this.direction.dot(_r),
      o;
    if (a > 0) {
      if (s) return null;
      o = 1;
    } else if (a < 0) ((o = -1), (a = -a));
    else return null;
    Tn.subVectors(this.origin, t);
    const l = o * this.direction.dot(ps.crossVectors(Tn, ps));
    if (l < 0) return null;
    const c = o * this.direction.dot(gr.cross(Tn));
    if (c < 0 || l + c > a) return null;
    const h = -o * Tn.dot(_r);
    return h < 0 ? null : this.at(h / a, r);
  }
  applyMatrix4(t) {
    return (
      this.origin.applyMatrix4(t),
      this.direction.transformDirection(t),
      this
    );
  }
  equals(t) {
    return t.origin.equals(this.origin) && t.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class re {
  constructor(t, e, n, s, r, a, o, l, c, h, u, f, p, _, x, m) {
    ((re.prototype.isMatrix4 = !0),
      (this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
      t !== void 0 && this.set(t, e, n, s, r, a, o, l, c, h, u, f, p, _, x, m));
  }
  set(t, e, n, s, r, a, o, l, c, h, u, f, p, _, x, m) {
    const d = this.elements;
    return (
      (d[0] = t),
      (d[4] = e),
      (d[8] = n),
      (d[12] = s),
      (d[1] = r),
      (d[5] = a),
      (d[9] = o),
      (d[13] = l),
      (d[2] = c),
      (d[6] = h),
      (d[10] = u),
      (d[14] = f),
      (d[3] = p),
      (d[7] = _),
      (d[11] = x),
      (d[15] = m),
      this
    );
  }
  identity() {
    return (this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this);
  }
  clone() {
    return new re().fromArray(this.elements);
  }
  copy(t) {
    const e = this.elements,
      n = t.elements;
    return (
      (e[0] = n[0]),
      (e[1] = n[1]),
      (e[2] = n[2]),
      (e[3] = n[3]),
      (e[4] = n[4]),
      (e[5] = n[5]),
      (e[6] = n[6]),
      (e[7] = n[7]),
      (e[8] = n[8]),
      (e[9] = n[9]),
      (e[10] = n[10]),
      (e[11] = n[11]),
      (e[12] = n[12]),
      (e[13] = n[13]),
      (e[14] = n[14]),
      (e[15] = n[15]),
      this
    );
  }
  copyPosition(t) {
    const e = this.elements,
      n = t.elements;
    return ((e[12] = n[12]), (e[13] = n[13]), (e[14] = n[14]), this);
  }
  setFromMatrix3(t) {
    const e = t.elements;
    return (
      this.set(
        e[0],
        e[3],
        e[6],
        0,
        e[1],
        e[4],
        e[7],
        0,
        e[2],
        e[5],
        e[8],
        0,
        0,
        0,
        0,
        1,
      ),
      this
    );
  }
  extractBasis(t, e, n) {
    return (
      t.setFromMatrixColumn(this, 0),
      e.setFromMatrixColumn(this, 1),
      n.setFromMatrixColumn(this, 2),
      this
    );
  }
  makeBasis(t, e, n) {
    return (
      this.set(
        t.x,
        e.x,
        n.x,
        0,
        t.y,
        e.y,
        n.y,
        0,
        t.z,
        e.z,
        n.z,
        0,
        0,
        0,
        0,
        1,
      ),
      this
    );
  }
  extractRotation(t) {
    const e = this.elements,
      n = t.elements,
      s = 1 / di.setFromMatrixColumn(t, 0).length(),
      r = 1 / di.setFromMatrixColumn(t, 1).length(),
      a = 1 / di.setFromMatrixColumn(t, 2).length();
    return (
      (e[0] = n[0] * s),
      (e[1] = n[1] * s),
      (e[2] = n[2] * s),
      (e[3] = 0),
      (e[4] = n[4] * r),
      (e[5] = n[5] * r),
      (e[6] = n[6] * r),
      (e[7] = 0),
      (e[8] = n[8] * a),
      (e[9] = n[9] * a),
      (e[10] = n[10] * a),
      (e[11] = 0),
      (e[12] = 0),
      (e[13] = 0),
      (e[14] = 0),
      (e[15] = 1),
      this
    );
  }
  makeRotationFromEuler(t) {
    const e = this.elements,
      n = t.x,
      s = t.y,
      r = t.z,
      a = Math.cos(n),
      o = Math.sin(n),
      l = Math.cos(s),
      c = Math.sin(s),
      h = Math.cos(r),
      u = Math.sin(r);
    if (t.order === "XYZ") {
      const f = a * h,
        p = a * u,
        _ = o * h,
        x = o * u;
      ((e[0] = l * h),
        (e[4] = -l * u),
        (e[8] = c),
        (e[1] = p + _ * c),
        (e[5] = f - x * c),
        (e[9] = -o * l),
        (e[2] = x - f * c),
        (e[6] = _ + p * c),
        (e[10] = a * l));
    } else if (t.order === "YXZ") {
      const f = l * h,
        p = l * u,
        _ = c * h,
        x = c * u;
      ((e[0] = f + x * o),
        (e[4] = _ * o - p),
        (e[8] = a * c),
        (e[1] = a * u),
        (e[5] = a * h),
        (e[9] = -o),
        (e[2] = p * o - _),
        (e[6] = x + f * o),
        (e[10] = a * l));
    } else if (t.order === "ZXY") {
      const f = l * h,
        p = l * u,
        _ = c * h,
        x = c * u;
      ((e[0] = f - x * o),
        (e[4] = -a * u),
        (e[8] = _ + p * o),
        (e[1] = p + _ * o),
        (e[5] = a * h),
        (e[9] = x - f * o),
        (e[2] = -a * c),
        (e[6] = o),
        (e[10] = a * l));
    } else if (t.order === "ZYX") {
      const f = a * h,
        p = a * u,
        _ = o * h,
        x = o * u;
      ((e[0] = l * h),
        (e[4] = _ * c - p),
        (e[8] = f * c + x),
        (e[1] = l * u),
        (e[5] = x * c + f),
        (e[9] = p * c - _),
        (e[2] = -c),
        (e[6] = o * l),
        (e[10] = a * l));
    } else if (t.order === "YZX") {
      const f = a * l,
        p = a * c,
        _ = o * l,
        x = o * c;
      ((e[0] = l * h),
        (e[4] = x - f * u),
        (e[8] = _ * u + p),
        (e[1] = u),
        (e[5] = a * h),
        (e[9] = -o * h),
        (e[2] = -c * h),
        (e[6] = p * u + _),
        (e[10] = f - x * u));
    } else if (t.order === "XZY") {
      const f = a * l,
        p = a * c,
        _ = o * l,
        x = o * c;
      ((e[0] = l * h),
        (e[4] = -u),
        (e[8] = c * h),
        (e[1] = f * u + x),
        (e[5] = a * h),
        (e[9] = p * u - _),
        (e[2] = _ * u - p),
        (e[6] = o * h),
        (e[10] = x * u + f));
    }
    return (
      (e[3] = 0),
      (e[7] = 0),
      (e[11] = 0),
      (e[12] = 0),
      (e[13] = 0),
      (e[14] = 0),
      (e[15] = 1),
      this
    );
  }
  makeRotationFromQuaternion(t) {
    return this.compose(Rd, t, Cd);
  }
  lookAt(t, e, n) {
    const s = this.elements;
    return (
      Be.subVectors(t, e),
      Be.lengthSq() === 0 && (Be.z = 1),
      Be.normalize(),
      An.crossVectors(n, Be),
      An.lengthSq() === 0 &&
        (Math.abs(n.z) === 1 ? (Be.x += 1e-4) : (Be.z += 1e-4),
        Be.normalize(),
        An.crossVectors(n, Be)),
      An.normalize(),
      ms.crossVectors(Be, An),
      (s[0] = An.x),
      (s[4] = ms.x),
      (s[8] = Be.x),
      (s[1] = An.y),
      (s[5] = ms.y),
      (s[9] = Be.y),
      (s[2] = An.z),
      (s[6] = ms.z),
      (s[10] = Be.z),
      this
    );
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, e) {
    const n = t.elements,
      s = e.elements,
      r = this.elements,
      a = n[0],
      o = n[4],
      l = n[8],
      c = n[12],
      h = n[1],
      u = n[5],
      f = n[9],
      p = n[13],
      _ = n[2],
      x = n[6],
      m = n[10],
      d = n[14],
      b = n[3],
      T = n[7],
      y = n[11],
      R = n[15],
      w = s[0],
      C = s[4],
      U = s[8],
      S = s[12],
      M = s[1],
      P = s[5],
      N = s[9],
      B = s[13],
      W = s[2],
      G = s[6],
      X = s[10],
      j = s[14],
      H = s[3],
      rt = s[7],
      lt = s[11],
      bt = s[15];
    return (
      (r[0] = a * w + o * M + l * W + c * H),
      (r[4] = a * C + o * P + l * G + c * rt),
      (r[8] = a * U + o * N + l * X + c * lt),
      (r[12] = a * S + o * B + l * j + c * bt),
      (r[1] = h * w + u * M + f * W + p * H),
      (r[5] = h * C + u * P + f * G + p * rt),
      (r[9] = h * U + u * N + f * X + p * lt),
      (r[13] = h * S + u * B + f * j + p * bt),
      (r[2] = _ * w + x * M + m * W + d * H),
      (r[6] = _ * C + x * P + m * G + d * rt),
      (r[10] = _ * U + x * N + m * X + d * lt),
      (r[14] = _ * S + x * B + m * j + d * bt),
      (r[3] = b * w + T * M + y * W + R * H),
      (r[7] = b * C + T * P + y * G + R * rt),
      (r[11] = b * U + T * N + y * X + R * lt),
      (r[15] = b * S + T * B + y * j + R * bt),
      this
    );
  }
  multiplyScalar(t) {
    const e = this.elements;
    return (
      (e[0] *= t),
      (e[4] *= t),
      (e[8] *= t),
      (e[12] *= t),
      (e[1] *= t),
      (e[5] *= t),
      (e[9] *= t),
      (e[13] *= t),
      (e[2] *= t),
      (e[6] *= t),
      (e[10] *= t),
      (e[14] *= t),
      (e[3] *= t),
      (e[7] *= t),
      (e[11] *= t),
      (e[15] *= t),
      this
    );
  }
  determinant() {
    const t = this.elements,
      e = t[0],
      n = t[4],
      s = t[8],
      r = t[12],
      a = t[1],
      o = t[5],
      l = t[9],
      c = t[13],
      h = t[2],
      u = t[6],
      f = t[10],
      p = t[14],
      _ = t[3],
      x = t[7],
      m = t[11],
      d = t[15];
    return (
      _ *
        (+r * l * u -
          s * c * u -
          r * o * f +
          n * c * f +
          s * o * p -
          n * l * p) +
      x *
        (+e * l * p -
          e * c * f +
          r * a * f -
          s * a * p +
          s * c * h -
          r * l * h) +
      m *
        (+e * c * u -
          e * o * p -
          r * a * u +
          n * a * p +
          r * o * h -
          n * c * h) +
      d *
        (-s * o * h - e * l * u + e * o * f + s * a * u - n * a * f + n * l * h)
    );
  }
  transpose() {
    const t = this.elements;
    let e;
    return (
      (e = t[1]),
      (t[1] = t[4]),
      (t[4] = e),
      (e = t[2]),
      (t[2] = t[8]),
      (t[8] = e),
      (e = t[6]),
      (t[6] = t[9]),
      (t[9] = e),
      (e = t[3]),
      (t[3] = t[12]),
      (t[12] = e),
      (e = t[7]),
      (t[7] = t[13]),
      (t[13] = e),
      (e = t[11]),
      (t[11] = t[14]),
      (t[14] = e),
      this
    );
  }
  setPosition(t, e, n) {
    const s = this.elements;
    return (
      t.isVector3
        ? ((s[12] = t.x), (s[13] = t.y), (s[14] = t.z))
        : ((s[12] = t), (s[13] = e), (s[14] = n)),
      this
    );
  }
  invert() {
    const t = this.elements,
      e = t[0],
      n = t[1],
      s = t[2],
      r = t[3],
      a = t[4],
      o = t[5],
      l = t[6],
      c = t[7],
      h = t[8],
      u = t[9],
      f = t[10],
      p = t[11],
      _ = t[12],
      x = t[13],
      m = t[14],
      d = t[15],
      b = u * m * c - x * f * c + x * l * p - o * m * p - u * l * d + o * f * d,
      T = _ * f * c - h * m * c - _ * l * p + a * m * p + h * l * d - a * f * d,
      y = h * x * c - _ * u * c + _ * o * p - a * x * p - h * o * d + a * u * d,
      R = _ * u * l - h * x * l - _ * o * f + a * x * f + h * o * m - a * u * m,
      w = e * b + n * T + s * y + r * R;
    if (w === 0)
      return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const C = 1 / w;
    return (
      (t[0] = b * C),
      (t[1] =
        (x * f * r -
          u * m * r -
          x * s * p +
          n * m * p +
          u * s * d -
          n * f * d) *
        C),
      (t[2] =
        (o * m * r -
          x * l * r +
          x * s * c -
          n * m * c -
          o * s * d +
          n * l * d) *
        C),
      (t[3] =
        (u * l * r -
          o * f * r -
          u * s * c +
          n * f * c +
          o * s * p -
          n * l * p) *
        C),
      (t[4] = T * C),
      (t[5] =
        (h * m * r -
          _ * f * r +
          _ * s * p -
          e * m * p -
          h * s * d +
          e * f * d) *
        C),
      (t[6] =
        (_ * l * r -
          a * m * r -
          _ * s * c +
          e * m * c +
          a * s * d -
          e * l * d) *
        C),
      (t[7] =
        (a * f * r -
          h * l * r +
          h * s * c -
          e * f * c -
          a * s * p +
          e * l * p) *
        C),
      (t[8] = y * C),
      (t[9] =
        (_ * u * r -
          h * x * r -
          _ * n * p +
          e * x * p +
          h * n * d -
          e * u * d) *
        C),
      (t[10] =
        (a * x * r -
          _ * o * r +
          _ * n * c -
          e * x * c -
          a * n * d +
          e * o * d) *
        C),
      (t[11] =
        (h * o * r -
          a * u * r -
          h * n * c +
          e * u * c +
          a * n * p -
          e * o * p) *
        C),
      (t[12] = R * C),
      (t[13] =
        (h * x * s -
          _ * u * s +
          _ * n * f -
          e * x * f -
          h * n * m +
          e * u * m) *
        C),
      (t[14] =
        (_ * o * s -
          a * x * s -
          _ * n * l +
          e * x * l +
          a * n * m -
          e * o * m) *
        C),
      (t[15] =
        (a * u * s -
          h * o * s +
          h * n * l -
          e * u * l -
          a * n * f +
          e * o * f) *
        C),
      this
    );
  }
  scale(t) {
    const e = this.elements,
      n = t.x,
      s = t.y,
      r = t.z;
    return (
      (e[0] *= n),
      (e[4] *= s),
      (e[8] *= r),
      (e[1] *= n),
      (e[5] *= s),
      (e[9] *= r),
      (e[2] *= n),
      (e[6] *= s),
      (e[10] *= r),
      (e[3] *= n),
      (e[7] *= s),
      (e[11] *= r),
      this
    );
  }
  getMaxScaleOnAxis() {
    const t = this.elements,
      e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2],
      n = t[4] * t[4] + t[5] * t[5] + t[6] * t[6],
      s = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
    return Math.sqrt(Math.max(e, n, s));
  }
  makeTranslation(t, e, n) {
    return (
      t.isVector3
        ? this.set(1, 0, 0, t.x, 0, 1, 0, t.y, 0, 0, 1, t.z, 0, 0, 0, 1)
        : this.set(1, 0, 0, t, 0, 1, 0, e, 0, 0, 1, n, 0, 0, 0, 1),
      this
    );
  }
  makeRotationX(t) {
    const e = Math.cos(t),
      n = Math.sin(t);
    return (this.set(1, 0, 0, 0, 0, e, -n, 0, 0, n, e, 0, 0, 0, 0, 1), this);
  }
  makeRotationY(t) {
    const e = Math.cos(t),
      n = Math.sin(t);
    return (this.set(e, 0, n, 0, 0, 1, 0, 0, -n, 0, e, 0, 0, 0, 0, 1), this);
  }
  makeRotationZ(t) {
    const e = Math.cos(t),
      n = Math.sin(t);
    return (this.set(e, -n, 0, 0, n, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this);
  }
  makeRotationAxis(t, e) {
    const n = Math.cos(e),
      s = Math.sin(e),
      r = 1 - n,
      a = t.x,
      o = t.y,
      l = t.z,
      c = r * a,
      h = r * o;
    return (
      this.set(
        c * a + n,
        c * o - s * l,
        c * l + s * o,
        0,
        c * o + s * l,
        h * o + n,
        h * l - s * a,
        0,
        c * l - s * o,
        h * l + s * a,
        r * l * l + n,
        0,
        0,
        0,
        0,
        1,
      ),
      this
    );
  }
  makeScale(t, e, n) {
    return (this.set(t, 0, 0, 0, 0, e, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this);
  }
  makeShear(t, e, n, s, r, a) {
    return (this.set(1, n, r, 0, t, 1, a, 0, e, s, 1, 0, 0, 0, 0, 1), this);
  }
  compose(t, e, n) {
    const s = this.elements,
      r = e._x,
      a = e._y,
      o = e._z,
      l = e._w,
      c = r + r,
      h = a + a,
      u = o + o,
      f = r * c,
      p = r * h,
      _ = r * u,
      x = a * h,
      m = a * u,
      d = o * u,
      b = l * c,
      T = l * h,
      y = l * u,
      R = n.x,
      w = n.y,
      C = n.z;
    return (
      (s[0] = (1 - (x + d)) * R),
      (s[1] = (p + y) * R),
      (s[2] = (_ - T) * R),
      (s[3] = 0),
      (s[4] = (p - y) * w),
      (s[5] = (1 - (f + d)) * w),
      (s[6] = (m + b) * w),
      (s[7] = 0),
      (s[8] = (_ + T) * C),
      (s[9] = (m - b) * C),
      (s[10] = (1 - (f + x)) * C),
      (s[11] = 0),
      (s[12] = t.x),
      (s[13] = t.y),
      (s[14] = t.z),
      (s[15] = 1),
      this
    );
  }
  decompose(t, e, n) {
    const s = this.elements;
    let r = di.set(s[0], s[1], s[2]).length();
    const a = di.set(s[4], s[5], s[6]).length(),
      o = di.set(s[8], s[9], s[10]).length();
    (this.determinant() < 0 && (r = -r),
      (t.x = s[12]),
      (t.y = s[13]),
      (t.z = s[14]),
      Qe.copy(this));
    const c = 1 / r,
      h = 1 / a,
      u = 1 / o;
    return (
      (Qe.elements[0] *= c),
      (Qe.elements[1] *= c),
      (Qe.elements[2] *= c),
      (Qe.elements[4] *= h),
      (Qe.elements[5] *= h),
      (Qe.elements[6] *= h),
      (Qe.elements[8] *= u),
      (Qe.elements[9] *= u),
      (Qe.elements[10] *= u),
      e.setFromRotationMatrix(Qe),
      (n.x = r),
      (n.y = a),
      (n.z = o),
      this
    );
  }
  makePerspective(t, e, n, s, r, a, o = dn, l = !1) {
    const c = this.elements,
      h = (2 * r) / (e - t),
      u = (2 * r) / (n - s),
      f = (e + t) / (e - t),
      p = (n + s) / (n - s);
    let _, x;
    if (l) ((_ = r / (a - r)), (x = (a * r) / (a - r)));
    else if (o === dn) ((_ = -(a + r) / (a - r)), (x = (-2 * a * r) / (a - r)));
    else if (o === Ws) ((_ = -a / (a - r)), (x = (-a * r) / (a - r)));
    else
      throw new Error(
        "THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o,
      );
    return (
      (c[0] = h),
      (c[4] = 0),
      (c[8] = f),
      (c[12] = 0),
      (c[1] = 0),
      (c[5] = u),
      (c[9] = p),
      (c[13] = 0),
      (c[2] = 0),
      (c[6] = 0),
      (c[10] = _),
      (c[14] = x),
      (c[3] = 0),
      (c[7] = 0),
      (c[11] = -1),
      (c[15] = 0),
      this
    );
  }
  makeOrthographic(t, e, n, s, r, a, o = dn, l = !1) {
    const c = this.elements,
      h = 2 / (e - t),
      u = 2 / (n - s),
      f = -(e + t) / (e - t),
      p = -(n + s) / (n - s);
    let _, x;
    if (l) ((_ = 1 / (a - r)), (x = a / (a - r)));
    else if (o === dn) ((_ = -2 / (a - r)), (x = -(a + r) / (a - r)));
    else if (o === Ws) ((_ = -1 / (a - r)), (x = -r / (a - r)));
    else
      throw new Error(
        "THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o,
      );
    return (
      (c[0] = h),
      (c[4] = 0),
      (c[8] = 0),
      (c[12] = f),
      (c[1] = 0),
      (c[5] = u),
      (c[9] = 0),
      (c[13] = p),
      (c[2] = 0),
      (c[6] = 0),
      (c[10] = _),
      (c[14] = x),
      (c[3] = 0),
      (c[7] = 0),
      (c[11] = 0),
      (c[15] = 1),
      this
    );
  }
  equals(t) {
    const e = this.elements,
      n = t.elements;
    for (let s = 0; s < 16; s++) if (e[s] !== n[s]) return !1;
    return !0;
  }
  fromArray(t, e = 0) {
    for (let n = 0; n < 16; n++) this.elements[n] = t[n + e];
    return this;
  }
  toArray(t = [], e = 0) {
    const n = this.elements;
    return (
      (t[e] = n[0]),
      (t[e + 1] = n[1]),
      (t[e + 2] = n[2]),
      (t[e + 3] = n[3]),
      (t[e + 4] = n[4]),
      (t[e + 5] = n[5]),
      (t[e + 6] = n[6]),
      (t[e + 7] = n[7]),
      (t[e + 8] = n[8]),
      (t[e + 9] = n[9]),
      (t[e + 10] = n[10]),
      (t[e + 11] = n[11]),
      (t[e + 12] = n[12]),
      (t[e + 13] = n[13]),
      (t[e + 14] = n[14]),
      (t[e + 15] = n[15]),
      t
    );
  }
}
const di = new F(),
  Qe = new re(),
  Rd = new F(0, 0, 0),
  Cd = new F(1, 1, 1),
  An = new F(),
  ms = new F(),
  Be = new F(),
  xo = new re(),
  Mo = new Pi();
class fn {
  constructor(t = 0, e = 0, n = 0, s = fn.DEFAULT_ORDER) {
    ((this.isEuler = !0),
      (this._x = t),
      (this._y = e),
      (this._z = n),
      (this._order = s));
  }
  get x() {
    return this._x;
  }
  set x(t) {
    ((this._x = t), this._onChangeCallback());
  }
  get y() {
    return this._y;
  }
  set y(t) {
    ((this._y = t), this._onChangeCallback());
  }
  get z() {
    return this._z;
  }
  set z(t) {
    ((this._z = t), this._onChangeCallback());
  }
  get order() {
    return this._order;
  }
  set order(t) {
    ((this._order = t), this._onChangeCallback());
  }
  set(t, e, n, s = this._order) {
    return (
      (this._x = t),
      (this._y = e),
      (this._z = n),
      (this._order = s),
      this._onChangeCallback(),
      this
    );
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(t) {
    return (
      (this._x = t._x),
      (this._y = t._y),
      (this._z = t._z),
      (this._order = t._order),
      this._onChangeCallback(),
      this
    );
  }
  setFromRotationMatrix(t, e = this._order, n = !0) {
    const s = t.elements,
      r = s[0],
      a = s[4],
      o = s[8],
      l = s[1],
      c = s[5],
      h = s[9],
      u = s[2],
      f = s[6],
      p = s[10];
    switch (e) {
      case "XYZ":
        ((this._y = Math.asin(Gt(o, -1, 1))),
          Math.abs(o) < 0.9999999
            ? ((this._x = Math.atan2(-h, p)), (this._z = Math.atan2(-a, r)))
            : ((this._x = Math.atan2(f, c)), (this._z = 0)));
        break;
      case "YXZ":
        ((this._x = Math.asin(-Gt(h, -1, 1))),
          Math.abs(h) < 0.9999999
            ? ((this._y = Math.atan2(o, p)), (this._z = Math.atan2(l, c)))
            : ((this._y = Math.atan2(-u, r)), (this._z = 0)));
        break;
      case "ZXY":
        ((this._x = Math.asin(Gt(f, -1, 1))),
          Math.abs(f) < 0.9999999
            ? ((this._y = Math.atan2(-u, p)), (this._z = Math.atan2(-a, c)))
            : ((this._y = 0), (this._z = Math.atan2(l, r))));
        break;
      case "ZYX":
        ((this._y = Math.asin(-Gt(u, -1, 1))),
          Math.abs(u) < 0.9999999
            ? ((this._x = Math.atan2(f, p)), (this._z = Math.atan2(l, r)))
            : ((this._x = 0), (this._z = Math.atan2(-a, c))));
        break;
      case "YZX":
        ((this._z = Math.asin(Gt(l, -1, 1))),
          Math.abs(l) < 0.9999999
            ? ((this._x = Math.atan2(-h, c)), (this._y = Math.atan2(-u, r)))
            : ((this._x = 0), (this._y = Math.atan2(o, p))));
        break;
      case "XZY":
        ((this._z = Math.asin(-Gt(a, -1, 1))),
          Math.abs(a) < 0.9999999
            ? ((this._x = Math.atan2(f, c)), (this._y = Math.atan2(o, r)))
            : ((this._x = Math.atan2(-h, p)), (this._y = 0)));
        break;
      default:
        console.warn(
          "THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " +
            e,
        );
    }
    return ((this._order = e), n === !0 && this._onChangeCallback(), this);
  }
  setFromQuaternion(t, e, n) {
    return (
      xo.makeRotationFromQuaternion(t),
      this.setFromRotationMatrix(xo, e, n)
    );
  }
  setFromVector3(t, e = this._order) {
    return this.set(t.x, t.y, t.z, e);
  }
  reorder(t) {
    return (Mo.setFromEuler(this), this.setFromQuaternion(Mo, t));
  }
  equals(t) {
    return (
      t._x === this._x &&
      t._y === this._y &&
      t._z === this._z &&
      t._order === this._order
    );
  }
  fromArray(t) {
    return (
      (this._x = t[0]),
      (this._y = t[1]),
      (this._z = t[2]),
      t[3] !== void 0 && (this._order = t[3]),
      this._onChangeCallback(),
      this
    );
  }
  toArray(t = [], e = 0) {
    return (
      (t[e] = this._x),
      (t[e + 1] = this._y),
      (t[e + 2] = this._z),
      (t[e + 3] = this._order),
      t
    );
  }
  _onChange(t) {
    return ((this._onChangeCallback = t), this);
  }
  _onChangeCallback() {}
  *[Symbol.iterator]() {
    (yield this._x, yield this._y, yield this._z, yield this._order);
  }
}
fn.DEFAULT_ORDER = "XYZ";
class Bc {
  constructor() {
    this.mask = 1;
  }
  set(t) {
    this.mask = ((1 << t) | 0) >>> 0;
  }
  enable(t) {
    this.mask |= (1 << t) | 0;
  }
  enableAll() {
    this.mask = -1;
  }
  toggle(t) {
    this.mask ^= (1 << t) | 0;
  }
  disable(t) {
    this.mask &= ~((1 << t) | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(t) {
    return (this.mask & t.mask) !== 0;
  }
  isEnabled(t) {
    return (this.mask & ((1 << t) | 0)) !== 0;
  }
}
let Pd = 0;
const So = new F(),
  hi = new Pi(),
  _n = new re(),
  gs = new F(),
  zi = new F(),
  Dd = new F(),
  Ld = new Pi(),
  yo = new F(1, 0, 0),
  Eo = new F(0, 1, 0),
  bo = new F(0, 0, 1),
  To = { type: "added" },
  Id = { type: "removed" },
  ui = { type: "childadded", child: null },
  vr = { type: "childremoved", child: null };
class ge extends Ci {
  constructor() {
    (super(),
      (this.isObject3D = !0),
      Object.defineProperty(this, "id", { value: Pd++ }),
      (this.uuid = is()),
      (this.name = ""),
      (this.type = "Object3D"),
      (this.parent = null),
      (this.children = []),
      (this.up = ge.DEFAULT_UP.clone()));
    const t = new F(),
      e = new fn(),
      n = new Pi(),
      s = new F(1, 1, 1);
    function r() {
      n.setFromEuler(e, !1);
    }
    function a() {
      e.setFromQuaternion(n, void 0, !1);
    }
    (e._onChange(r),
      n._onChange(a),
      Object.defineProperties(this, {
        position: { configurable: !0, enumerable: !0, value: t },
        rotation: { configurable: !0, enumerable: !0, value: e },
        quaternion: { configurable: !0, enumerable: !0, value: n },
        scale: { configurable: !0, enumerable: !0, value: s },
        modelViewMatrix: { value: new re() },
        normalMatrix: { value: new Ft() },
      }),
      (this.matrix = new re()),
      (this.matrixWorld = new re()),
      (this.matrixAutoUpdate = ge.DEFAULT_MATRIX_AUTO_UPDATE),
      (this.matrixWorldAutoUpdate = ge.DEFAULT_MATRIX_WORLD_AUTO_UPDATE),
      (this.matrixWorldNeedsUpdate = !1),
      (this.layers = new Bc()),
      (this.visible = !0),
      (this.castShadow = !1),
      (this.receiveShadow = !1),
      (this.frustumCulled = !0),
      (this.renderOrder = 0),
      (this.animations = []),
      (this.customDepthMaterial = void 0),
      (this.customDistanceMaterial = void 0),
      (this.userData = {}));
  }
  onBeforeShadow() {}
  onAfterShadow() {}
  onBeforeRender() {}
  onAfterRender() {}
  applyMatrix4(t) {
    (this.matrixAutoUpdate && this.updateMatrix(),
      this.matrix.premultiply(t),
      this.matrix.decompose(this.position, this.quaternion, this.scale));
  }
  applyQuaternion(t) {
    return (this.quaternion.premultiply(t), this);
  }
  setRotationFromAxisAngle(t, e) {
    this.quaternion.setFromAxisAngle(t, e);
  }
  setRotationFromEuler(t) {
    this.quaternion.setFromEuler(t, !0);
  }
  setRotationFromMatrix(t) {
    this.quaternion.setFromRotationMatrix(t);
  }
  setRotationFromQuaternion(t) {
    this.quaternion.copy(t);
  }
  rotateOnAxis(t, e) {
    return (hi.setFromAxisAngle(t, e), this.quaternion.multiply(hi), this);
  }
  rotateOnWorldAxis(t, e) {
    return (hi.setFromAxisAngle(t, e), this.quaternion.premultiply(hi), this);
  }
  rotateX(t) {
    return this.rotateOnAxis(yo, t);
  }
  rotateY(t) {
    return this.rotateOnAxis(Eo, t);
  }
  rotateZ(t) {
    return this.rotateOnAxis(bo, t);
  }
  translateOnAxis(t, e) {
    return (
      So.copy(t).applyQuaternion(this.quaternion),
      this.position.add(So.multiplyScalar(e)),
      this
    );
  }
  translateX(t) {
    return this.translateOnAxis(yo, t);
  }
  translateY(t) {
    return this.translateOnAxis(Eo, t);
  }
  translateZ(t) {
    return this.translateOnAxis(bo, t);
  }
  localToWorld(t) {
    return (this.updateWorldMatrix(!0, !1), t.applyMatrix4(this.matrixWorld));
  }
  worldToLocal(t) {
    return (
      this.updateWorldMatrix(!0, !1),
      t.applyMatrix4(_n.copy(this.matrixWorld).invert())
    );
  }
  lookAt(t, e, n) {
    t.isVector3 ? gs.copy(t) : gs.set(t, e, n);
    const s = this.parent;
    (this.updateWorldMatrix(!0, !1),
      zi.setFromMatrixPosition(this.matrixWorld),
      this.isCamera || this.isLight
        ? _n.lookAt(zi, gs, this.up)
        : _n.lookAt(gs, zi, this.up),
      this.quaternion.setFromRotationMatrix(_n),
      s &&
        (_n.extractRotation(s.matrixWorld),
        hi.setFromRotationMatrix(_n),
        this.quaternion.premultiply(hi.invert())));
  }
  add(t) {
    if (arguments.length > 1) {
      for (let e = 0; e < arguments.length; e++) this.add(arguments[e]);
      return this;
    }
    return t === this
      ? (console.error(
          "THREE.Object3D.add: object can't be added as a child of itself.",
          t,
        ),
        this)
      : (t && t.isObject3D
          ? (t.removeFromParent(),
            (t.parent = this),
            this.children.push(t),
            t.dispatchEvent(To),
            (ui.child = t),
            this.dispatchEvent(ui),
            (ui.child = null))
          : console.error(
              "THREE.Object3D.add: object not an instance of THREE.Object3D.",
              t,
            ),
        this);
  }
  remove(t) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++) this.remove(arguments[n]);
      return this;
    }
    const e = this.children.indexOf(t);
    return (
      e !== -1 &&
        ((t.parent = null),
        this.children.splice(e, 1),
        t.dispatchEvent(Id),
        (vr.child = t),
        this.dispatchEvent(vr),
        (vr.child = null)),
      this
    );
  }
  removeFromParent() {
    const t = this.parent;
    return (t !== null && t.remove(this), this);
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(t) {
    return (
      this.updateWorldMatrix(!0, !1),
      _n.copy(this.matrixWorld).invert(),
      t.parent !== null &&
        (t.parent.updateWorldMatrix(!0, !1), _n.multiply(t.parent.matrixWorld)),
      t.applyMatrix4(_n),
      t.removeFromParent(),
      (t.parent = this),
      this.children.push(t),
      t.updateWorldMatrix(!1, !0),
      t.dispatchEvent(To),
      (ui.child = t),
      this.dispatchEvent(ui),
      (ui.child = null),
      this
    );
  }
  getObjectById(t) {
    return this.getObjectByProperty("id", t);
  }
  getObjectByName(t) {
    return this.getObjectByProperty("name", t);
  }
  getObjectByProperty(t, e) {
    if (this[t] === e) return this;
    for (let n = 0, s = this.children.length; n < s; n++) {
      const a = this.children[n].getObjectByProperty(t, e);
      if (a !== void 0) return a;
    }
  }
  getObjectsByProperty(t, e, n = []) {
    this[t] === e && n.push(this);
    const s = this.children;
    for (let r = 0, a = s.length; r < a; r++)
      s[r].getObjectsByProperty(t, e, n);
    return n;
  }
  getWorldPosition(t) {
    return (
      this.updateWorldMatrix(!0, !1),
      t.setFromMatrixPosition(this.matrixWorld)
    );
  }
  getWorldQuaternion(t) {
    return (
      this.updateWorldMatrix(!0, !1),
      this.matrixWorld.decompose(zi, t, Dd),
      t
    );
  }
  getWorldScale(t) {
    return (
      this.updateWorldMatrix(!0, !1),
      this.matrixWorld.decompose(zi, Ld, t),
      t
    );
  }
  getWorldDirection(t) {
    this.updateWorldMatrix(!0, !1);
    const e = this.matrixWorld.elements;
    return t.set(e[8], e[9], e[10]).normalize();
  }
  raycast() {}
  traverse(t) {
    t(this);
    const e = this.children;
    for (let n = 0, s = e.length; n < s; n++) e[n].traverse(t);
  }
  traverseVisible(t) {
    if (this.visible === !1) return;
    t(this);
    const e = this.children;
    for (let n = 0, s = e.length; n < s; n++) e[n].traverseVisible(t);
  }
  traverseAncestors(t) {
    const e = this.parent;
    e !== null && (t(e), e.traverseAncestors(t));
  }
  updateMatrix() {
    (this.matrix.compose(this.position, this.quaternion, this.scale),
      (this.matrixWorldNeedsUpdate = !0));
  }
  updateMatrixWorld(t) {
    (this.matrixAutoUpdate && this.updateMatrix(),
      (this.matrixWorldNeedsUpdate || t) &&
        (this.matrixWorldAutoUpdate === !0 &&
          (this.parent === null
            ? this.matrixWorld.copy(this.matrix)
            : this.matrixWorld.multiplyMatrices(
                this.parent.matrixWorld,
                this.matrix,
              )),
        (this.matrixWorldNeedsUpdate = !1),
        (t = !0)));
    const e = this.children;
    for (let n = 0, s = e.length; n < s; n++) e[n].updateMatrixWorld(t);
  }
  updateWorldMatrix(t, e) {
    const n = this.parent;
    if (
      (t === !0 && n !== null && n.updateWorldMatrix(!0, !1),
      this.matrixAutoUpdate && this.updateMatrix(),
      this.matrixWorldAutoUpdate === !0 &&
        (this.parent === null
          ? this.matrixWorld.copy(this.matrix)
          : this.matrixWorld.multiplyMatrices(
              this.parent.matrixWorld,
              this.matrix,
            )),
      e === !0)
    ) {
      const s = this.children;
      for (let r = 0, a = s.length; r < a; r++) s[r].updateWorldMatrix(!1, !0);
    }
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string",
      n = {};
    e &&
      ((t = {
        geometries: {},
        materials: {},
        textures: {},
        images: {},
        shapes: {},
        skeletons: {},
        animations: {},
        nodes: {},
      }),
      (n.metadata = {
        version: 4.7,
        type: "Object",
        generator: "Object3D.toJSON",
      }));
    const s = {};
    ((s.uuid = this.uuid),
      (s.type = this.type),
      this.name !== "" && (s.name = this.name),
      this.castShadow === !0 && (s.castShadow = !0),
      this.receiveShadow === !0 && (s.receiveShadow = !0),
      this.visible === !1 && (s.visible = !1),
      this.frustumCulled === !1 && (s.frustumCulled = !1),
      this.renderOrder !== 0 && (s.renderOrder = this.renderOrder),
      Object.keys(this.userData).length > 0 && (s.userData = this.userData),
      (s.layers = this.layers.mask),
      (s.matrix = this.matrix.toArray()),
      (s.up = this.up.toArray()),
      this.matrixAutoUpdate === !1 && (s.matrixAutoUpdate = !1),
      this.isInstancedMesh &&
        ((s.type = "InstancedMesh"),
        (s.count = this.count),
        (s.instanceMatrix = this.instanceMatrix.toJSON()),
        this.instanceColor !== null &&
          (s.instanceColor = this.instanceColor.toJSON())),
      this.isBatchedMesh &&
        ((s.type = "BatchedMesh"),
        (s.perObjectFrustumCulled = this.perObjectFrustumCulled),
        (s.sortObjects = this.sortObjects),
        (s.drawRanges = this._drawRanges),
        (s.reservedRanges = this._reservedRanges),
        (s.geometryInfo = this._geometryInfo.map((o) => ({
          ...o,
          boundingBox: o.boundingBox ? o.boundingBox.toJSON() : void 0,
          boundingSphere: o.boundingSphere ? o.boundingSphere.toJSON() : void 0,
        }))),
        (s.instanceInfo = this._instanceInfo.map((o) => ({ ...o }))),
        (s.availableInstanceIds = this._availableInstanceIds.slice()),
        (s.availableGeometryIds = this._availableGeometryIds.slice()),
        (s.nextIndexStart = this._nextIndexStart),
        (s.nextVertexStart = this._nextVertexStart),
        (s.geometryCount = this._geometryCount),
        (s.maxInstanceCount = this._maxInstanceCount),
        (s.maxVertexCount = this._maxVertexCount),
        (s.maxIndexCount = this._maxIndexCount),
        (s.geometryInitialized = this._geometryInitialized),
        (s.matricesTexture = this._matricesTexture.toJSON(t)),
        (s.indirectTexture = this._indirectTexture.toJSON(t)),
        this._colorsTexture !== null &&
          (s.colorsTexture = this._colorsTexture.toJSON(t)),
        this.boundingSphere !== null &&
          (s.boundingSphere = this.boundingSphere.toJSON()),
        this.boundingBox !== null &&
          (s.boundingBox = this.boundingBox.toJSON())));
    function r(o, l) {
      return (o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(t)), l.uuid);
    }
    if (this.isScene)
      (this.background &&
        (this.background.isColor
          ? (s.background = this.background.toJSON())
          : this.background.isTexture &&
            (s.background = this.background.toJSON(t).uuid)),
        this.environment &&
          this.environment.isTexture &&
          this.environment.isRenderTargetTexture !== !0 &&
          (s.environment = this.environment.toJSON(t).uuid));
    else if (this.isMesh || this.isLine || this.isPoints) {
      s.geometry = r(t.geometries, this.geometry);
      const o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        const l = o.shapes;
        if (Array.isArray(l))
          for (let c = 0, h = l.length; c < h; c++) {
            const u = l[c];
            r(t.shapes, u);
          }
        else r(t.shapes, l);
      }
    }
    if (
      (this.isSkinnedMesh &&
        ((s.bindMode = this.bindMode),
        (s.bindMatrix = this.bindMatrix.toArray()),
        this.skeleton !== void 0 &&
          (r(t.skeletons, this.skeleton), (s.skeleton = this.skeleton.uuid))),
      this.material !== void 0)
    )
      if (Array.isArray(this.material)) {
        const o = [];
        for (let l = 0, c = this.material.length; l < c; l++)
          o.push(r(t.materials, this.material[l]));
        s.material = o;
      } else s.material = r(t.materials, this.material);
    if (this.children.length > 0) {
      s.children = [];
      for (let o = 0; o < this.children.length; o++)
        s.children.push(this.children[o].toJSON(t).object);
    }
    if (this.animations.length > 0) {
      s.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        const l = this.animations[o];
        s.animations.push(r(t.animations, l));
      }
    }
    if (e) {
      const o = a(t.geometries),
        l = a(t.materials),
        c = a(t.textures),
        h = a(t.images),
        u = a(t.shapes),
        f = a(t.skeletons),
        p = a(t.animations),
        _ = a(t.nodes);
      (o.length > 0 && (n.geometries = o),
        l.length > 0 && (n.materials = l),
        c.length > 0 && (n.textures = c),
        h.length > 0 && (n.images = h),
        u.length > 0 && (n.shapes = u),
        f.length > 0 && (n.skeletons = f),
        p.length > 0 && (n.animations = p),
        _.length > 0 && (n.nodes = _));
    }
    return ((n.object = s), n);
    function a(o) {
      const l = [];
      for (const c in o) {
        const h = o[c];
        (delete h.metadata, l.push(h));
      }
      return l;
    }
  }
  clone(t) {
    return new this.constructor().copy(this, t);
  }
  copy(t, e = !0) {
    if (
      ((this.name = t.name),
      this.up.copy(t.up),
      this.position.copy(t.position),
      (this.rotation.order = t.rotation.order),
      this.quaternion.copy(t.quaternion),
      this.scale.copy(t.scale),
      this.matrix.copy(t.matrix),
      this.matrixWorld.copy(t.matrixWorld),
      (this.matrixAutoUpdate = t.matrixAutoUpdate),
      (this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate),
      (this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate),
      (this.layers.mask = t.layers.mask),
      (this.visible = t.visible),
      (this.castShadow = t.castShadow),
      (this.receiveShadow = t.receiveShadow),
      (this.frustumCulled = t.frustumCulled),
      (this.renderOrder = t.renderOrder),
      (this.animations = t.animations.slice()),
      (this.userData = JSON.parse(JSON.stringify(t.userData))),
      e === !0)
    )
      for (let n = 0; n < t.children.length; n++) {
        const s = t.children[n];
        this.add(s.clone());
      }
    return this;
  }
}
ge.DEFAULT_UP = new F(0, 1, 0);
ge.DEFAULT_MATRIX_AUTO_UPDATE = !0;
ge.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const tn = new F(),
  vn = new F(),
  xr = new F(),
  xn = new F(),
  fi = new F(),
  pi = new F(),
  Ao = new F(),
  Mr = new F(),
  Sr = new F(),
  yr = new F(),
  Er = new ue(),
  br = new ue(),
  Tr = new ue();
class nn {
  constructor(t = new F(), e = new F(), n = new F()) {
    ((this.a = t), (this.b = e), (this.c = n));
  }
  static getNormal(t, e, n, s) {
    (s.subVectors(n, e), tn.subVectors(t, e), s.cross(tn));
    const r = s.lengthSq();
    return r > 0 ? s.multiplyScalar(1 / Math.sqrt(r)) : s.set(0, 0, 0);
  }
  static getBarycoord(t, e, n, s, r) {
    (tn.subVectors(s, e), vn.subVectors(n, e), xr.subVectors(t, e));
    const a = tn.dot(tn),
      o = tn.dot(vn),
      l = tn.dot(xr),
      c = vn.dot(vn),
      h = vn.dot(xr),
      u = a * c - o * o;
    if (u === 0) return (r.set(0, 0, 0), null);
    const f = 1 / u,
      p = (c * l - o * h) * f,
      _ = (a * h - o * l) * f;
    return r.set(1 - p - _, _, p);
  }
  static containsPoint(t, e, n, s) {
    return this.getBarycoord(t, e, n, s, xn) === null
      ? !1
      : xn.x >= 0 && xn.y >= 0 && xn.x + xn.y <= 1;
  }
  static getInterpolation(t, e, n, s, r, a, o, l) {
    return this.getBarycoord(t, e, n, s, xn) === null
      ? ((l.x = 0),
        (l.y = 0),
        "z" in l && (l.z = 0),
        "w" in l && (l.w = 0),
        null)
      : (l.setScalar(0),
        l.addScaledVector(r, xn.x),
        l.addScaledVector(a, xn.y),
        l.addScaledVector(o, xn.z),
        l);
  }
  static getInterpolatedAttribute(t, e, n, s, r, a) {
    return (
      Er.setScalar(0),
      br.setScalar(0),
      Tr.setScalar(0),
      Er.fromBufferAttribute(t, e),
      br.fromBufferAttribute(t, n),
      Tr.fromBufferAttribute(t, s),
      a.setScalar(0),
      a.addScaledVector(Er, r.x),
      a.addScaledVector(br, r.y),
      a.addScaledVector(Tr, r.z),
      a
    );
  }
  static isFrontFacing(t, e, n, s) {
    return (tn.subVectors(n, e), vn.subVectors(t, e), tn.cross(vn).dot(s) < 0);
  }
  set(t, e, n) {
    return (this.a.copy(t), this.b.copy(e), this.c.copy(n), this);
  }
  setFromPointsAndIndices(t, e, n, s) {
    return (this.a.copy(t[e]), this.b.copy(t[n]), this.c.copy(t[s]), this);
  }
  setFromAttributeAndIndices(t, e, n, s) {
    return (
      this.a.fromBufferAttribute(t, e),
      this.b.fromBufferAttribute(t, n),
      this.c.fromBufferAttribute(t, s),
      this
    );
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return (this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this);
  }
  getArea() {
    return (
      tn.subVectors(this.c, this.b),
      vn.subVectors(this.a, this.b),
      tn.cross(vn).length() * 0.5
    );
  }
  getMidpoint(t) {
    return t
      .addVectors(this.a, this.b)
      .add(this.c)
      .multiplyScalar(1 / 3);
  }
  getNormal(t) {
    return nn.getNormal(this.a, this.b, this.c, t);
  }
  getPlane(t) {
    return t.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(t, e) {
    return nn.getBarycoord(t, this.a, this.b, this.c, e);
  }
  getInterpolation(t, e, n, s, r) {
    return nn.getInterpolation(t, this.a, this.b, this.c, e, n, s, r);
  }
  containsPoint(t) {
    return nn.containsPoint(t, this.a, this.b, this.c);
  }
  isFrontFacing(t) {
    return nn.isFrontFacing(this.a, this.b, this.c, t);
  }
  intersectsBox(t) {
    return t.intersectsTriangle(this);
  }
  closestPointToPoint(t, e) {
    const n = this.a,
      s = this.b,
      r = this.c;
    let a, o;
    (fi.subVectors(s, n), pi.subVectors(r, n), Mr.subVectors(t, n));
    const l = fi.dot(Mr),
      c = pi.dot(Mr);
    if (l <= 0 && c <= 0) return e.copy(n);
    Sr.subVectors(t, s);
    const h = fi.dot(Sr),
      u = pi.dot(Sr);
    if (h >= 0 && u <= h) return e.copy(s);
    const f = l * u - h * c;
    if (f <= 0 && l >= 0 && h <= 0)
      return ((a = l / (l - h)), e.copy(n).addScaledVector(fi, a));
    yr.subVectors(t, r);
    const p = fi.dot(yr),
      _ = pi.dot(yr);
    if (_ >= 0 && p <= _) return e.copy(r);
    const x = p * c - l * _;
    if (x <= 0 && c >= 0 && _ <= 0)
      return ((o = c / (c - _)), e.copy(n).addScaledVector(pi, o));
    const m = h * _ - p * u;
    if (m <= 0 && u - h >= 0 && p - _ >= 0)
      return (
        Ao.subVectors(r, s),
        (o = (u - h) / (u - h + (p - _))),
        e.copy(s).addScaledVector(Ao, o)
      );
    const d = 1 / (m + x + f);
    return (
      (a = x * d),
      (o = f * d),
      e.copy(n).addScaledVector(fi, a).addScaledVector(pi, o)
    );
  }
  equals(t) {
    return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
  }
}
const kc = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074,
  },
  wn = { h: 0, s: 0, l: 0 },
  _s = { h: 0, s: 0, l: 0 };
function Ar(i, t, e) {
  return (
    e < 0 && (e += 1),
    e > 1 && (e -= 1),
    e < 1 / 6
      ? i + (t - i) * 6 * e
      : e < 1 / 2
        ? t
        : e < 2 / 3
          ? i + (t - i) * 6 * (2 / 3 - e)
          : i
  );
}
class Ht {
  constructor(t, e, n) {
    return (
      (this.isColor = !0),
      (this.r = 1),
      (this.g = 1),
      (this.b = 1),
      this.set(t, e, n)
    );
  }
  set(t, e, n) {
    if (e === void 0 && n === void 0) {
      const s = t;
      s && s.isColor
        ? this.copy(s)
        : typeof s == "number"
          ? this.setHex(s)
          : typeof s == "string" && this.setStyle(s);
    } else this.setRGB(t, e, n);
    return this;
  }
  setScalar(t) {
    return ((this.r = t), (this.g = t), (this.b = t), this);
  }
  setHex(t, e = He) {
    return (
      (t = Math.floor(t)),
      (this.r = ((t >> 16) & 255) / 255),
      (this.g = ((t >> 8) & 255) / 255),
      (this.b = (t & 255) / 255),
      Yt.colorSpaceToWorking(this, e),
      this
    );
  }
  setRGB(t, e, n, s = Yt.workingColorSpace) {
    return (
      (this.r = t),
      (this.g = e),
      (this.b = n),
      Yt.colorSpaceToWorking(this, s),
      this
    );
  }
  setHSL(t, e, n, s = Yt.workingColorSpace) {
    if (((t = vd(t, 1)), (e = Gt(e, 0, 1)), (n = Gt(n, 0, 1)), e === 0))
      this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + e) : n + e - n * e,
        a = 2 * n - r;
      ((this.r = Ar(a, r, t + 1 / 3)),
        (this.g = Ar(a, r, t)),
        (this.b = Ar(a, r, t - 1 / 3)));
    }
    return (Yt.colorSpaceToWorking(this, s), this);
  }
  setStyle(t, e = He) {
    function n(r) {
      r !== void 0 &&
        parseFloat(r) < 1 &&
        console.warn(
          "THREE.Color: Alpha component of " + t + " will be ignored.",
        );
    }
    let s;
    if ((s = /^(\w+)\(([^\)]*)\)/.exec(t))) {
      let r;
      const a = s[1],
        o = s[2];
      switch (a) {
        case "rgb":
        case "rgba":
          if (
            (r =
              /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                o,
              ))
          )
            return (
              n(r[4]),
              this.setRGB(
                Math.min(255, parseInt(r[1], 10)) / 255,
                Math.min(255, parseInt(r[2], 10)) / 255,
                Math.min(255, parseInt(r[3], 10)) / 255,
                e,
              )
            );
          if (
            (r =
              /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                o,
              ))
          )
            return (
              n(r[4]),
              this.setRGB(
                Math.min(100, parseInt(r[1], 10)) / 100,
                Math.min(100, parseInt(r[2], 10)) / 100,
                Math.min(100, parseInt(r[3], 10)) / 100,
                e,
              )
            );
          break;
        case "hsl":
        case "hsla":
          if (
            (r =
              /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                o,
              ))
          )
            return (
              n(r[4]),
              this.setHSL(
                parseFloat(r[1]) / 360,
                parseFloat(r[2]) / 100,
                parseFloat(r[3]) / 100,
                e,
              )
            );
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + t);
      }
    } else if ((s = /^\#([A-Fa-f\d]+)$/.exec(t))) {
      const r = s[1],
        a = r.length;
      if (a === 3)
        return this.setRGB(
          parseInt(r.charAt(0), 16) / 15,
          parseInt(r.charAt(1), 16) / 15,
          parseInt(r.charAt(2), 16) / 15,
          e,
        );
      if (a === 6) return this.setHex(parseInt(r, 16), e);
      console.warn("THREE.Color: Invalid hex color " + t);
    } else if (t && t.length > 0) return this.setColorName(t, e);
    return this;
  }
  setColorName(t, e = He) {
    const n = kc[t.toLowerCase()];
    return (
      n !== void 0
        ? this.setHex(n, e)
        : console.warn("THREE.Color: Unknown color " + t),
      this
    );
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(t) {
    return ((this.r = t.r), (this.g = t.g), (this.b = t.b), this);
  }
  copySRGBToLinear(t) {
    return ((this.r = yn(t.r)), (this.g = yn(t.g)), (this.b = yn(t.b)), this);
  }
  copyLinearToSRGB(t) {
    return ((this.r = yi(t.r)), (this.g = yi(t.g)), (this.b = yi(t.b)), this);
  }
  convertSRGBToLinear() {
    return (this.copySRGBToLinear(this), this);
  }
  convertLinearToSRGB() {
    return (this.copyLinearToSRGB(this), this);
  }
  getHex(t = He) {
    return (
      Yt.workingToColorSpace(be.copy(this), t),
      Math.round(Gt(be.r * 255, 0, 255)) * 65536 +
        Math.round(Gt(be.g * 255, 0, 255)) * 256 +
        Math.round(Gt(be.b * 255, 0, 255))
    );
  }
  getHexString(t = He) {
    return ("000000" + this.getHex(t).toString(16)).slice(-6);
  }
  getHSL(t, e = Yt.workingColorSpace) {
    Yt.workingToColorSpace(be.copy(this), e);
    const n = be.r,
      s = be.g,
      r = be.b,
      a = Math.max(n, s, r),
      o = Math.min(n, s, r);
    let l, c;
    const h = (o + a) / 2;
    if (o === a) ((l = 0), (c = 0));
    else {
      const u = a - o;
      switch (((c = h <= 0.5 ? u / (a + o) : u / (2 - a - o)), a)) {
        case n:
          l = (s - r) / u + (s < r ? 6 : 0);
          break;
        case s:
          l = (r - n) / u + 2;
          break;
        case r:
          l = (n - s) / u + 4;
          break;
      }
      l /= 6;
    }
    return ((t.h = l), (t.s = c), (t.l = h), t);
  }
  getRGB(t, e = Yt.workingColorSpace) {
    return (
      Yt.workingToColorSpace(be.copy(this), e),
      (t.r = be.r),
      (t.g = be.g),
      (t.b = be.b),
      t
    );
  }
  getStyle(t = He) {
    Yt.workingToColorSpace(be.copy(this), t);
    const e = be.r,
      n = be.g,
      s = be.b;
    return t !== He
      ? `color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`
      : `rgb(${Math.round(e * 255)},${Math.round(n * 255)},${Math.round(s * 255)})`;
  }
  offsetHSL(t, e, n) {
    return (this.getHSL(wn), this.setHSL(wn.h + t, wn.s + e, wn.l + n));
  }
  add(t) {
    return ((this.r += t.r), (this.g += t.g), (this.b += t.b), this);
  }
  addColors(t, e) {
    return (
      (this.r = t.r + e.r),
      (this.g = t.g + e.g),
      (this.b = t.b + e.b),
      this
    );
  }
  addScalar(t) {
    return ((this.r += t), (this.g += t), (this.b += t), this);
  }
  sub(t) {
    return (
      (this.r = Math.max(0, this.r - t.r)),
      (this.g = Math.max(0, this.g - t.g)),
      (this.b = Math.max(0, this.b - t.b)),
      this
    );
  }
  multiply(t) {
    return ((this.r *= t.r), (this.g *= t.g), (this.b *= t.b), this);
  }
  multiplyScalar(t) {
    return ((this.r *= t), (this.g *= t), (this.b *= t), this);
  }
  lerp(t, e) {
    return (
      (this.r += (t.r - this.r) * e),
      (this.g += (t.g - this.g) * e),
      (this.b += (t.b - this.b) * e),
      this
    );
  }
  lerpColors(t, e, n) {
    return (
      (this.r = t.r + (e.r - t.r) * n),
      (this.g = t.g + (e.g - t.g) * n),
      (this.b = t.b + (e.b - t.b) * n),
      this
    );
  }
  lerpHSL(t, e) {
    (this.getHSL(wn), t.getHSL(_s));
    const n = cr(wn.h, _s.h, e),
      s = cr(wn.s, _s.s, e),
      r = cr(wn.l, _s.l, e);
    return (this.setHSL(n, s, r), this);
  }
  setFromVector3(t) {
    return ((this.r = t.x), (this.g = t.y), (this.b = t.z), this);
  }
  applyMatrix3(t) {
    const e = this.r,
      n = this.g,
      s = this.b,
      r = t.elements;
    return (
      (this.r = r[0] * e + r[3] * n + r[6] * s),
      (this.g = r[1] * e + r[4] * n + r[7] * s),
      (this.b = r[2] * e + r[5] * n + r[8] * s),
      this
    );
  }
  equals(t) {
    return t.r === this.r && t.g === this.g && t.b === this.b;
  }
  fromArray(t, e = 0) {
    return ((this.r = t[e]), (this.g = t[e + 1]), (this.b = t[e + 2]), this);
  }
  toArray(t = [], e = 0) {
    return ((t[e] = this.r), (t[e + 1] = this.g), (t[e + 2] = this.b), t);
  }
  fromBufferAttribute(t, e) {
    return (
      (this.r = t.getX(e)),
      (this.g = t.getY(e)),
      (this.b = t.getZ(e)),
      this
    );
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    (yield this.r, yield this.g, yield this.b);
  }
}
const be = new Ht();
Ht.NAMES = kc;
let Ud = 0;
class Li extends Ci {
  constructor() {
    (super(),
      (this.isMaterial = !0),
      Object.defineProperty(this, "id", { value: Ud++ }),
      (this.uuid = is()),
      (this.name = ""),
      (this.type = "Material"),
      (this.blending = Si),
      (this.side = Un),
      (this.vertexColors = !1),
      (this.opacity = 1),
      (this.transparent = !1),
      (this.alphaHash = !1),
      (this.blendSrc = Vr),
      (this.blendDst = Gr),
      (this.blendEquation = Xn),
      (this.blendSrcAlpha = null),
      (this.blendDstAlpha = null),
      (this.blendEquationAlpha = null),
      (this.blendColor = new Ht(0, 0, 0)),
      (this.blendAlpha = 0),
      (this.depthFunc = Ei),
      (this.depthTest = !0),
      (this.depthWrite = !0),
      (this.stencilWriteMask = 255),
      (this.stencilFunc = uo),
      (this.stencilRef = 0),
      (this.stencilFuncMask = 255),
      (this.stencilFail = ri),
      (this.stencilZFail = ri),
      (this.stencilZPass = ri),
      (this.stencilWrite = !1),
      (this.clippingPlanes = null),
      (this.clipIntersection = !1),
      (this.clipShadows = !1),
      (this.shadowSide = null),
      (this.colorWrite = !0),
      (this.precision = null),
      (this.polygonOffset = !1),
      (this.polygonOffsetFactor = 0),
      (this.polygonOffsetUnits = 0),
      (this.dithering = !1),
      (this.alphaToCoverage = !1),
      (this.premultipliedAlpha = !1),
      (this.forceSinglePass = !1),
      (this.allowOverride = !0),
      (this.visible = !0),
      (this.toneMapped = !0),
      (this.userData = {}),
      (this.version = 0),
      (this._alphaTest = 0));
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(t) {
    (this._alphaTest > 0 != t > 0 && this.version++, (this._alphaTest = t));
  }
  onBeforeRender() {}
  onBeforeCompile() {}
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(t) {
    if (t !== void 0)
      for (const e in t) {
        const n = t[e];
        if (n === void 0) {
          console.warn(
            `THREE.Material: parameter '${e}' has value of undefined.`,
          );
          continue;
        }
        const s = this[e];
        if (s === void 0) {
          console.warn(
            `THREE.Material: '${e}' is not a property of THREE.${this.type}.`,
          );
          continue;
        }
        s && s.isColor
          ? s.set(n)
          : s && s.isVector3 && n && n.isVector3
            ? s.copy(n)
            : (this[e] = n);
      }
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    e && (t = { textures: {}, images: {} });
    const n = {
      metadata: {
        version: 4.7,
        type: "Material",
        generator: "Material.toJSON",
      },
    };
    ((n.uuid = this.uuid),
      (n.type = this.type),
      this.name !== "" && (n.name = this.name),
      this.color && this.color.isColor && (n.color = this.color.getHex()),
      this.roughness !== void 0 && (n.roughness = this.roughness),
      this.metalness !== void 0 && (n.metalness = this.metalness),
      this.sheen !== void 0 && (n.sheen = this.sheen),
      this.sheenColor &&
        this.sheenColor.isColor &&
        (n.sheenColor = this.sheenColor.getHex()),
      this.sheenRoughness !== void 0 &&
        (n.sheenRoughness = this.sheenRoughness),
      this.emissive &&
        this.emissive.isColor &&
        (n.emissive = this.emissive.getHex()),
      this.emissiveIntensity !== void 0 &&
        this.emissiveIntensity !== 1 &&
        (n.emissiveIntensity = this.emissiveIntensity),
      this.specular &&
        this.specular.isColor &&
        (n.specular = this.specular.getHex()),
      this.specularIntensity !== void 0 &&
        (n.specularIntensity = this.specularIntensity),
      this.specularColor &&
        this.specularColor.isColor &&
        (n.specularColor = this.specularColor.getHex()),
      this.shininess !== void 0 && (n.shininess = this.shininess),
      this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat),
      this.clearcoatRoughness !== void 0 &&
        (n.clearcoatRoughness = this.clearcoatRoughness),
      this.clearcoatMap &&
        this.clearcoatMap.isTexture &&
        (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid),
      this.clearcoatRoughnessMap &&
        this.clearcoatRoughnessMap.isTexture &&
        (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid),
      this.clearcoatNormalMap &&
        this.clearcoatNormalMap.isTexture &&
        ((n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid),
        (n.clearcoatNormalScale = this.clearcoatNormalScale.toArray())),
      this.sheenColorMap &&
        this.sheenColorMap.isTexture &&
        (n.sheenColorMap = this.sheenColorMap.toJSON(t).uuid),
      this.sheenRoughnessMap &&
        this.sheenRoughnessMap.isTexture &&
        (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(t).uuid),
      this.dispersion !== void 0 && (n.dispersion = this.dispersion),
      this.iridescence !== void 0 && (n.iridescence = this.iridescence),
      this.iridescenceIOR !== void 0 &&
        (n.iridescenceIOR = this.iridescenceIOR),
      this.iridescenceThicknessRange !== void 0 &&
        (n.iridescenceThicknessRange = this.iridescenceThicknessRange),
      this.iridescenceMap &&
        this.iridescenceMap.isTexture &&
        (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid),
      this.iridescenceThicknessMap &&
        this.iridescenceThicknessMap.isTexture &&
        (n.iridescenceThicknessMap =
          this.iridescenceThicknessMap.toJSON(t).uuid),
      this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy),
      this.anisotropyRotation !== void 0 &&
        (n.anisotropyRotation = this.anisotropyRotation),
      this.anisotropyMap &&
        this.anisotropyMap.isTexture &&
        (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid),
      this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid),
      this.matcap &&
        this.matcap.isTexture &&
        (n.matcap = this.matcap.toJSON(t).uuid),
      this.alphaMap &&
        this.alphaMap.isTexture &&
        (n.alphaMap = this.alphaMap.toJSON(t).uuid),
      this.lightMap &&
        this.lightMap.isTexture &&
        ((n.lightMap = this.lightMap.toJSON(t).uuid),
        (n.lightMapIntensity = this.lightMapIntensity)),
      this.aoMap &&
        this.aoMap.isTexture &&
        ((n.aoMap = this.aoMap.toJSON(t).uuid),
        (n.aoMapIntensity = this.aoMapIntensity)),
      this.bumpMap &&
        this.bumpMap.isTexture &&
        ((n.bumpMap = this.bumpMap.toJSON(t).uuid),
        (n.bumpScale = this.bumpScale)),
      this.normalMap &&
        this.normalMap.isTexture &&
        ((n.normalMap = this.normalMap.toJSON(t).uuid),
        (n.normalMapType = this.normalMapType),
        (n.normalScale = this.normalScale.toArray())),
      this.displacementMap &&
        this.displacementMap.isTexture &&
        ((n.displacementMap = this.displacementMap.toJSON(t).uuid),
        (n.displacementScale = this.displacementScale),
        (n.displacementBias = this.displacementBias)),
      this.roughnessMap &&
        this.roughnessMap.isTexture &&
        (n.roughnessMap = this.roughnessMap.toJSON(t).uuid),
      this.metalnessMap &&
        this.metalnessMap.isTexture &&
        (n.metalnessMap = this.metalnessMap.toJSON(t).uuid),
      this.emissiveMap &&
        this.emissiveMap.isTexture &&
        (n.emissiveMap = this.emissiveMap.toJSON(t).uuid),
      this.specularMap &&
        this.specularMap.isTexture &&
        (n.specularMap = this.specularMap.toJSON(t).uuid),
      this.specularIntensityMap &&
        this.specularIntensityMap.isTexture &&
        (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid),
      this.specularColorMap &&
        this.specularColorMap.isTexture &&
        (n.specularColorMap = this.specularColorMap.toJSON(t).uuid),
      this.envMap &&
        this.envMap.isTexture &&
        ((n.envMap = this.envMap.toJSON(t).uuid),
        this.combine !== void 0 && (n.combine = this.combine)),
      this.envMapRotation !== void 0 &&
        (n.envMapRotation = this.envMapRotation.toArray()),
      this.envMapIntensity !== void 0 &&
        (n.envMapIntensity = this.envMapIntensity),
      this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity),
      this.refractionRatio !== void 0 &&
        (n.refractionRatio = this.refractionRatio),
      this.gradientMap &&
        this.gradientMap.isTexture &&
        (n.gradientMap = this.gradientMap.toJSON(t).uuid),
      this.transmission !== void 0 && (n.transmission = this.transmission),
      this.transmissionMap &&
        this.transmissionMap.isTexture &&
        (n.transmissionMap = this.transmissionMap.toJSON(t).uuid),
      this.thickness !== void 0 && (n.thickness = this.thickness),
      this.thicknessMap &&
        this.thicknessMap.isTexture &&
        (n.thicknessMap = this.thicknessMap.toJSON(t).uuid),
      this.attenuationDistance !== void 0 &&
        this.attenuationDistance !== 1 / 0 &&
        (n.attenuationDistance = this.attenuationDistance),
      this.attenuationColor !== void 0 &&
        (n.attenuationColor = this.attenuationColor.getHex()),
      this.size !== void 0 && (n.size = this.size),
      this.shadowSide !== null && (n.shadowSide = this.shadowSide),
      this.sizeAttenuation !== void 0 &&
        (n.sizeAttenuation = this.sizeAttenuation),
      this.blending !== Si && (n.blending = this.blending),
      this.side !== Un && (n.side = this.side),
      this.vertexColors === !0 && (n.vertexColors = !0),
      this.opacity < 1 && (n.opacity = this.opacity),
      this.transparent === !0 && (n.transparent = !0),
      this.blendSrc !== Vr && (n.blendSrc = this.blendSrc),
      this.blendDst !== Gr && (n.blendDst = this.blendDst),
      this.blendEquation !== Xn && (n.blendEquation = this.blendEquation),
      this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha),
      this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha),
      this.blendEquationAlpha !== null &&
        (n.blendEquationAlpha = this.blendEquationAlpha),
      this.blendColor &&
        this.blendColor.isColor &&
        (n.blendColor = this.blendColor.getHex()),
      this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha),
      this.depthFunc !== Ei && (n.depthFunc = this.depthFunc),
      this.depthTest === !1 && (n.depthTest = this.depthTest),
      this.depthWrite === !1 && (n.depthWrite = this.depthWrite),
      this.colorWrite === !1 && (n.colorWrite = this.colorWrite),
      this.stencilWriteMask !== 255 &&
        (n.stencilWriteMask = this.stencilWriteMask),
      this.stencilFunc !== uo && (n.stencilFunc = this.stencilFunc),
      this.stencilRef !== 0 && (n.stencilRef = this.stencilRef),
      this.stencilFuncMask !== 255 &&
        (n.stencilFuncMask = this.stencilFuncMask),
      this.stencilFail !== ri && (n.stencilFail = this.stencilFail),
      this.stencilZFail !== ri && (n.stencilZFail = this.stencilZFail),
      this.stencilZPass !== ri && (n.stencilZPass = this.stencilZPass),
      this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite),
      this.rotation !== void 0 &&
        this.rotation !== 0 &&
        (n.rotation = this.rotation),
      this.polygonOffset === !0 && (n.polygonOffset = !0),
      this.polygonOffsetFactor !== 0 &&
        (n.polygonOffsetFactor = this.polygonOffsetFactor),
      this.polygonOffsetUnits !== 0 &&
        (n.polygonOffsetUnits = this.polygonOffsetUnits),
      this.linewidth !== void 0 &&
        this.linewidth !== 1 &&
        (n.linewidth = this.linewidth),
      this.dashSize !== void 0 && (n.dashSize = this.dashSize),
      this.gapSize !== void 0 && (n.gapSize = this.gapSize),
      this.scale !== void 0 && (n.scale = this.scale),
      this.dithering === !0 && (n.dithering = !0),
      this.alphaTest > 0 && (n.alphaTest = this.alphaTest),
      this.alphaHash === !0 && (n.alphaHash = !0),
      this.alphaToCoverage === !0 && (n.alphaToCoverage = !0),
      this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0),
      this.forceSinglePass === !0 && (n.forceSinglePass = !0),
      this.wireframe === !0 && (n.wireframe = !0),
      this.wireframeLinewidth > 1 &&
        (n.wireframeLinewidth = this.wireframeLinewidth),
      this.wireframeLinecap !== "round" &&
        (n.wireframeLinecap = this.wireframeLinecap),
      this.wireframeLinejoin !== "round" &&
        (n.wireframeLinejoin = this.wireframeLinejoin),
      this.flatShading === !0 && (n.flatShading = !0),
      this.visible === !1 && (n.visible = !1),
      this.toneMapped === !1 && (n.toneMapped = !1),
      this.fog === !1 && (n.fog = !1),
      Object.keys(this.userData).length > 0 && (n.userData = this.userData));
    function s(r) {
      const a = [];
      for (const o in r) {
        const l = r[o];
        (delete l.metadata, a.push(l));
      }
      return a;
    }
    if (e) {
      const r = s(t.textures),
        a = s(t.images);
      (r.length > 0 && (n.textures = r), a.length > 0 && (n.images = a));
    }
    return n;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    ((this.name = t.name),
      (this.blending = t.blending),
      (this.side = t.side),
      (this.vertexColors = t.vertexColors),
      (this.opacity = t.opacity),
      (this.transparent = t.transparent),
      (this.blendSrc = t.blendSrc),
      (this.blendDst = t.blendDst),
      (this.blendEquation = t.blendEquation),
      (this.blendSrcAlpha = t.blendSrcAlpha),
      (this.blendDstAlpha = t.blendDstAlpha),
      (this.blendEquationAlpha = t.blendEquationAlpha),
      this.blendColor.copy(t.blendColor),
      (this.blendAlpha = t.blendAlpha),
      (this.depthFunc = t.depthFunc),
      (this.depthTest = t.depthTest),
      (this.depthWrite = t.depthWrite),
      (this.stencilWriteMask = t.stencilWriteMask),
      (this.stencilFunc = t.stencilFunc),
      (this.stencilRef = t.stencilRef),
      (this.stencilFuncMask = t.stencilFuncMask),
      (this.stencilFail = t.stencilFail),
      (this.stencilZFail = t.stencilZFail),
      (this.stencilZPass = t.stencilZPass),
      (this.stencilWrite = t.stencilWrite));
    const e = t.clippingPlanes;
    let n = null;
    if (e !== null) {
      const s = e.length;
      n = new Array(s);
      for (let r = 0; r !== s; ++r) n[r] = e[r].clone();
    }
    return (
      (this.clippingPlanes = n),
      (this.clipIntersection = t.clipIntersection),
      (this.clipShadows = t.clipShadows),
      (this.shadowSide = t.shadowSide),
      (this.colorWrite = t.colorWrite),
      (this.precision = t.precision),
      (this.polygonOffset = t.polygonOffset),
      (this.polygonOffsetFactor = t.polygonOffsetFactor),
      (this.polygonOffsetUnits = t.polygonOffsetUnits),
      (this.dithering = t.dithering),
      (this.alphaTest = t.alphaTest),
      (this.alphaHash = t.alphaHash),
      (this.alphaToCoverage = t.alphaToCoverage),
      (this.premultipliedAlpha = t.premultipliedAlpha),
      (this.forceSinglePass = t.forceSinglePass),
      (this.visible = t.visible),
      (this.toneMapped = t.toneMapped),
      (this.userData = JSON.parse(JSON.stringify(t.userData))),
      this
    );
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
}
class Va extends Li {
  constructor(t) {
    (super(),
      (this.isMeshBasicMaterial = !0),
      (this.type = "MeshBasicMaterial"),
      (this.color = new Ht(16777215)),
      (this.map = null),
      (this.lightMap = null),
      (this.lightMapIntensity = 1),
      (this.aoMap = null),
      (this.aoMapIntensity = 1),
      (this.specularMap = null),
      (this.alphaMap = null),
      (this.envMap = null),
      (this.envMapRotation = new fn()),
      (this.combine = Ec),
      (this.reflectivity = 1),
      (this.refractionRatio = 0.98),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      (this.wireframeLinecap = "round"),
      (this.wireframeLinejoin = "round"),
      (this.fog = !0),
      this.setValues(t));
  }
  copy(t) {
    return (
      super.copy(t),
      this.color.copy(t.color),
      (this.map = t.map),
      (this.lightMap = t.lightMap),
      (this.lightMapIntensity = t.lightMapIntensity),
      (this.aoMap = t.aoMap),
      (this.aoMapIntensity = t.aoMapIntensity),
      (this.specularMap = t.specularMap),
      (this.alphaMap = t.alphaMap),
      (this.envMap = t.envMap),
      this.envMapRotation.copy(t.envMapRotation),
      (this.combine = t.combine),
      (this.reflectivity = t.reflectivity),
      (this.refractionRatio = t.refractionRatio),
      (this.wireframe = t.wireframe),
      (this.wireframeLinewidth = t.wireframeLinewidth),
      (this.wireframeLinecap = t.wireframeLinecap),
      (this.wireframeLinejoin = t.wireframeLinejoin),
      (this.fog = t.fog),
      this
    );
  }
}
const pe = new F(),
  vs = new Xt();
let Nd = 0;
class rn {
  constructor(t, e, n = !1) {
    if (Array.isArray(t))
      throw new TypeError(
        "THREE.BufferAttribute: array should be a Typed Array.",
      );
    ((this.isBufferAttribute = !0),
      Object.defineProperty(this, "id", { value: Nd++ }),
      (this.name = ""),
      (this.array = t),
      (this.itemSize = e),
      (this.count = t !== void 0 ? t.length / e : 0),
      (this.normalized = n),
      (this.usage = fo),
      (this.updateRanges = []),
      (this.gpuType = ln),
      (this.version = 0));
  }
  onUploadCallback() {}
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
  setUsage(t) {
    return ((this.usage = t), this);
  }
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(t) {
    return (
      (this.name = t.name),
      (this.array = new t.array.constructor(t.array)),
      (this.itemSize = t.itemSize),
      (this.count = t.count),
      (this.normalized = t.normalized),
      (this.usage = t.usage),
      (this.gpuType = t.gpuType),
      this
    );
  }
  copyAt(t, e, n) {
    ((t *= this.itemSize), (n *= e.itemSize));
    for (let s = 0, r = this.itemSize; s < r; s++)
      this.array[t + s] = e.array[n + s];
    return this;
  }
  copyArray(t) {
    return (this.array.set(t), this);
  }
  applyMatrix3(t) {
    if (this.itemSize === 2)
      for (let e = 0, n = this.count; e < n; e++)
        (vs.fromBufferAttribute(this, e),
          vs.applyMatrix3(t),
          this.setXY(e, vs.x, vs.y));
    else if (this.itemSize === 3)
      for (let e = 0, n = this.count; e < n; e++)
        (pe.fromBufferAttribute(this, e),
          pe.applyMatrix3(t),
          this.setXYZ(e, pe.x, pe.y, pe.z));
    return this;
  }
  applyMatrix4(t) {
    for (let e = 0, n = this.count; e < n; e++)
      (pe.fromBufferAttribute(this, e),
        pe.applyMatrix4(t),
        this.setXYZ(e, pe.x, pe.y, pe.z));
    return this;
  }
  applyNormalMatrix(t) {
    for (let e = 0, n = this.count; e < n; e++)
      (pe.fromBufferAttribute(this, e),
        pe.applyNormalMatrix(t),
        this.setXYZ(e, pe.x, pe.y, pe.z));
    return this;
  }
  transformDirection(t) {
    for (let e = 0, n = this.count; e < n; e++)
      (pe.fromBufferAttribute(this, e),
        pe.transformDirection(t),
        this.setXYZ(e, pe.x, pe.y, pe.z));
    return this;
  }
  set(t, e = 0) {
    return (this.array.set(t, e), this);
  }
  getComponent(t, e) {
    let n = this.array[t * this.itemSize + e];
    return (this.normalized && (n = Oi(n, this.array)), n);
  }
  setComponent(t, e, n) {
    return (
      this.normalized && (n = Ie(n, this.array)),
      (this.array[t * this.itemSize + e] = n),
      this
    );
  }
  getX(t) {
    let e = this.array[t * this.itemSize];
    return (this.normalized && (e = Oi(e, this.array)), e);
  }
  setX(t, e) {
    return (
      this.normalized && (e = Ie(e, this.array)),
      (this.array[t * this.itemSize] = e),
      this
    );
  }
  getY(t) {
    let e = this.array[t * this.itemSize + 1];
    return (this.normalized && (e = Oi(e, this.array)), e);
  }
  setY(t, e) {
    return (
      this.normalized && (e = Ie(e, this.array)),
      (this.array[t * this.itemSize + 1] = e),
      this
    );
  }
  getZ(t) {
    let e = this.array[t * this.itemSize + 2];
    return (this.normalized && (e = Oi(e, this.array)), e);
  }
  setZ(t, e) {
    return (
      this.normalized && (e = Ie(e, this.array)),
      (this.array[t * this.itemSize + 2] = e),
      this
    );
  }
  getW(t) {
    let e = this.array[t * this.itemSize + 3];
    return (this.normalized && (e = Oi(e, this.array)), e);
  }
  setW(t, e) {
    return (
      this.normalized && (e = Ie(e, this.array)),
      (this.array[t * this.itemSize + 3] = e),
      this
    );
  }
  setXY(t, e, n) {
    return (
      (t *= this.itemSize),
      this.normalized && ((e = Ie(e, this.array)), (n = Ie(n, this.array))),
      (this.array[t + 0] = e),
      (this.array[t + 1] = n),
      this
    );
  }
  setXYZ(t, e, n, s) {
    return (
      (t *= this.itemSize),
      this.normalized &&
        ((e = Ie(e, this.array)),
        (n = Ie(n, this.array)),
        (s = Ie(s, this.array))),
      (this.array[t + 0] = e),
      (this.array[t + 1] = n),
      (this.array[t + 2] = s),
      this
    );
  }
  setXYZW(t, e, n, s, r) {
    return (
      (t *= this.itemSize),
      this.normalized &&
        ((e = Ie(e, this.array)),
        (n = Ie(n, this.array)),
        (s = Ie(s, this.array)),
        (r = Ie(r, this.array))),
      (this.array[t + 0] = e),
      (this.array[t + 1] = n),
      (this.array[t + 2] = s),
      (this.array[t + 3] = r),
      this
    );
  }
  onUpload(t) {
    return ((this.onUploadCallback = t), this);
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const t = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized,
    };
    return (
      this.name !== "" && (t.name = this.name),
      this.usage !== fo && (t.usage = this.usage),
      t
    );
  }
}
class zc extends rn {
  constructor(t, e, n) {
    super(new Uint16Array(t), e, n);
  }
}
class Hc extends rn {
  constructor(t, e, n) {
    super(new Uint32Array(t), e, n);
  }
}
class _e extends rn {
  constructor(t, e, n) {
    super(new Float32Array(t), e, n);
  }
}
let Fd = 0;
const qe = new re(),
  wr = new ge(),
  mi = new F(),
  ke = new ii(),
  Hi = new ii(),
  Se = new F();
class Ze extends Ci {
  constructor() {
    (super(),
      (this.isBufferGeometry = !0),
      Object.defineProperty(this, "id", { value: Fd++ }),
      (this.uuid = is()),
      (this.name = ""),
      (this.type = "BufferGeometry"),
      (this.index = null),
      (this.indirect = null),
      (this.attributes = {}),
      (this.morphAttributes = {}),
      (this.morphTargetsRelative = !1),
      (this.groups = []),
      (this.boundingBox = null),
      (this.boundingSphere = null),
      (this.drawRange = { start: 0, count: 1 / 0 }),
      (this.userData = {}));
  }
  getIndex() {
    return this.index;
  }
  setIndex(t) {
    return (
      Array.isArray(t)
        ? (this.index = new (Nc(t) ? Hc : zc)(t, 1))
        : (this.index = t),
      this
    );
  }
  setIndirect(t) {
    return ((this.indirect = t), this);
  }
  getIndirect() {
    return this.indirect;
  }
  getAttribute(t) {
    return this.attributes[t];
  }
  setAttribute(t, e) {
    return ((this.attributes[t] = e), this);
  }
  deleteAttribute(t) {
    return (delete this.attributes[t], this);
  }
  hasAttribute(t) {
    return this.attributes[t] !== void 0;
  }
  addGroup(t, e, n = 0) {
    this.groups.push({ start: t, count: e, materialIndex: n });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(t, e) {
    ((this.drawRange.start = t), (this.drawRange.count = e));
  }
  applyMatrix4(t) {
    const e = this.attributes.position;
    e !== void 0 && (e.applyMatrix4(t), (e.needsUpdate = !0));
    const n = this.attributes.normal;
    if (n !== void 0) {
      const r = new Ft().getNormalMatrix(t);
      (n.applyNormalMatrix(r), (n.needsUpdate = !0));
    }
    const s = this.attributes.tangent;
    return (
      s !== void 0 && (s.transformDirection(t), (s.needsUpdate = !0)),
      this.boundingBox !== null && this.computeBoundingBox(),
      this.boundingSphere !== null && this.computeBoundingSphere(),
      this
    );
  }
  applyQuaternion(t) {
    return (qe.makeRotationFromQuaternion(t), this.applyMatrix4(qe), this);
  }
  rotateX(t) {
    return (qe.makeRotationX(t), this.applyMatrix4(qe), this);
  }
  rotateY(t) {
    return (qe.makeRotationY(t), this.applyMatrix4(qe), this);
  }
  rotateZ(t) {
    return (qe.makeRotationZ(t), this.applyMatrix4(qe), this);
  }
  translate(t, e, n) {
    return (qe.makeTranslation(t, e, n), this.applyMatrix4(qe), this);
  }
  scale(t, e, n) {
    return (qe.makeScale(t, e, n), this.applyMatrix4(qe), this);
  }
  lookAt(t) {
    return (
      wr.lookAt(t),
      wr.updateMatrix(),
      this.applyMatrix4(wr.matrix),
      this
    );
  }
  center() {
    return (
      this.computeBoundingBox(),
      this.boundingBox.getCenter(mi).negate(),
      this.translate(mi.x, mi.y, mi.z),
      this
    );
  }
  setFromPoints(t) {
    const e = this.getAttribute("position");
    if (e === void 0) {
      const n = [];
      for (let s = 0, r = t.length; s < r; s++) {
        const a = t[s];
        n.push(a.x, a.y, a.z || 0);
      }
      this.setAttribute("position", new _e(n, 3));
    } else {
      const n = Math.min(t.length, e.count);
      for (let s = 0; s < n; s++) {
        const r = t[s];
        e.setXYZ(s, r.x, r.y, r.z || 0);
      }
      (t.length > e.count &&
        console.warn(
          "THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.",
        ),
        (e.needsUpdate = !0));
    }
    return this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new ii());
    const t = this.attributes.position,
      e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      (console.error(
        "THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",
        this,
      ),
        this.boundingBox.set(
          new F(-1 / 0, -1 / 0, -1 / 0),
          new F(1 / 0, 1 / 0, 1 / 0),
        ));
      return;
    }
    if (t !== void 0) {
      if ((this.boundingBox.setFromBufferAttribute(t), e))
        for (let n = 0, s = e.length; n < s; n++) {
          const r = e[n];
          (ke.setFromBufferAttribute(r),
            this.morphTargetsRelative
              ? (Se.addVectors(this.boundingBox.min, ke.min),
                this.boundingBox.expandByPoint(Se),
                Se.addVectors(this.boundingBox.max, ke.max),
                this.boundingBox.expandByPoint(Se))
              : (this.boundingBox.expandByPoint(ke.min),
                this.boundingBox.expandByPoint(ke.max)));
        }
    } else this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) ||
      isNaN(this.boundingBox.min.y) ||
      isNaN(this.boundingBox.min.z)) &&
      console.error(
        'THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',
        this,
      );
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Di());
    const t = this.attributes.position,
      e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      (console.error(
        "THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",
        this,
      ),
        this.boundingSphere.set(new F(), 1 / 0));
      return;
    }
    if (t) {
      const n = this.boundingSphere.center;
      if ((ke.setFromBufferAttribute(t), e))
        for (let r = 0, a = e.length; r < a; r++) {
          const o = e[r];
          (Hi.setFromBufferAttribute(o),
            this.morphTargetsRelative
              ? (Se.addVectors(ke.min, Hi.min),
                ke.expandByPoint(Se),
                Se.addVectors(ke.max, Hi.max),
                ke.expandByPoint(Se))
              : (ke.expandByPoint(Hi.min), ke.expandByPoint(Hi.max)));
        }
      ke.getCenter(n);
      let s = 0;
      for (let r = 0, a = t.count; r < a; r++)
        (Se.fromBufferAttribute(t, r),
          (s = Math.max(s, n.distanceToSquared(Se))));
      if (e)
        for (let r = 0, a = e.length; r < a; r++) {
          const o = e[r],
            l = this.morphTargetsRelative;
          for (let c = 0, h = o.count; c < h; c++)
            (Se.fromBufferAttribute(o, c),
              l && (mi.fromBufferAttribute(t, c), Se.add(mi)),
              (s = Math.max(s, n.distanceToSquared(Se))));
        }
      ((this.boundingSphere.radius = Math.sqrt(s)),
        isNaN(this.boundingSphere.radius) &&
          console.error(
            'THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',
            this,
          ));
    }
  }
  computeTangents() {
    const t = this.index,
      e = this.attributes;
    if (
      t === null ||
      e.position === void 0 ||
      e.normal === void 0 ||
      e.uv === void 0
    ) {
      console.error(
        "THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)",
      );
      return;
    }
    const n = e.position,
      s = e.normal,
      r = e.uv;
    this.hasAttribute("tangent") === !1 &&
      this.setAttribute("tangent", new rn(new Float32Array(4 * n.count), 4));
    const a = this.getAttribute("tangent"),
      o = [],
      l = [];
    for (let U = 0; U < n.count; U++) ((o[U] = new F()), (l[U] = new F()));
    const c = new F(),
      h = new F(),
      u = new F(),
      f = new Xt(),
      p = new Xt(),
      _ = new Xt(),
      x = new F(),
      m = new F();
    function d(U, S, M) {
      (c.fromBufferAttribute(n, U),
        h.fromBufferAttribute(n, S),
        u.fromBufferAttribute(n, M),
        f.fromBufferAttribute(r, U),
        p.fromBufferAttribute(r, S),
        _.fromBufferAttribute(r, M),
        h.sub(c),
        u.sub(c),
        p.sub(f),
        _.sub(f));
      const P = 1 / (p.x * _.y - _.x * p.y);
      isFinite(P) &&
        (x
          .copy(h)
          .multiplyScalar(_.y)
          .addScaledVector(u, -p.y)
          .multiplyScalar(P),
        m
          .copy(u)
          .multiplyScalar(p.x)
          .addScaledVector(h, -_.x)
          .multiplyScalar(P),
        o[U].add(x),
        o[S].add(x),
        o[M].add(x),
        l[U].add(m),
        l[S].add(m),
        l[M].add(m));
    }
    let b = this.groups;
    b.length === 0 && (b = [{ start: 0, count: t.count }]);
    for (let U = 0, S = b.length; U < S; ++U) {
      const M = b[U],
        P = M.start,
        N = M.count;
      for (let B = P, W = P + N; B < W; B += 3)
        d(t.getX(B + 0), t.getX(B + 1), t.getX(B + 2));
    }
    const T = new F(),
      y = new F(),
      R = new F(),
      w = new F();
    function C(U) {
      (R.fromBufferAttribute(s, U), w.copy(R));
      const S = o[U];
      (T.copy(S),
        T.sub(R.multiplyScalar(R.dot(S))).normalize(),
        y.crossVectors(w, S));
      const P = y.dot(l[U]) < 0 ? -1 : 1;
      a.setXYZW(U, T.x, T.y, T.z, P);
    }
    for (let U = 0, S = b.length; U < S; ++U) {
      const M = b[U],
        P = M.start,
        N = M.count;
      for (let B = P, W = P + N; B < W; B += 3)
        (C(t.getX(B + 0)), C(t.getX(B + 1)), C(t.getX(B + 2)));
    }
  }
  computeVertexNormals() {
    const t = this.index,
      e = this.getAttribute("position");
    if (e !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0)
        ((n = new rn(new Float32Array(e.count * 3), 3)),
          this.setAttribute("normal", n));
      else for (let f = 0, p = n.count; f < p; f++) n.setXYZ(f, 0, 0, 0);
      const s = new F(),
        r = new F(),
        a = new F(),
        o = new F(),
        l = new F(),
        c = new F(),
        h = new F(),
        u = new F();
      if (t)
        for (let f = 0, p = t.count; f < p; f += 3) {
          const _ = t.getX(f + 0),
            x = t.getX(f + 1),
            m = t.getX(f + 2);
          (s.fromBufferAttribute(e, _),
            r.fromBufferAttribute(e, x),
            a.fromBufferAttribute(e, m),
            h.subVectors(a, r),
            u.subVectors(s, r),
            h.cross(u),
            o.fromBufferAttribute(n, _),
            l.fromBufferAttribute(n, x),
            c.fromBufferAttribute(n, m),
            o.add(h),
            l.add(h),
            c.add(h),
            n.setXYZ(_, o.x, o.y, o.z),
            n.setXYZ(x, l.x, l.y, l.z),
            n.setXYZ(m, c.x, c.y, c.z));
        }
      else
        for (let f = 0, p = e.count; f < p; f += 3)
          (s.fromBufferAttribute(e, f + 0),
            r.fromBufferAttribute(e, f + 1),
            a.fromBufferAttribute(e, f + 2),
            h.subVectors(a, r),
            u.subVectors(s, r),
            h.cross(u),
            n.setXYZ(f + 0, h.x, h.y, h.z),
            n.setXYZ(f + 1, h.x, h.y, h.z),
            n.setXYZ(f + 2, h.x, h.y, h.z));
      (this.normalizeNormals(), (n.needsUpdate = !0));
    }
  }
  normalizeNormals() {
    const t = this.attributes.normal;
    for (let e = 0, n = t.count; e < n; e++)
      (Se.fromBufferAttribute(t, e),
        Se.normalize(),
        t.setXYZ(e, Se.x, Se.y, Se.z));
  }
  toNonIndexed() {
    function t(o, l) {
      const c = o.array,
        h = o.itemSize,
        u = o.normalized,
        f = new c.constructor(l.length * h);
      let p = 0,
        _ = 0;
      for (let x = 0, m = l.length; x < m; x++) {
        o.isInterleavedBufferAttribute
          ? (p = l[x] * o.data.stride + o.offset)
          : (p = l[x] * h);
        for (let d = 0; d < h; d++) f[_++] = c[p++];
      }
      return new rn(f, h, u);
    }
    if (this.index === null)
      return (
        console.warn(
          "THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.",
        ),
        this
      );
    const e = new Ze(),
      n = this.index.array,
      s = this.attributes;
    for (const o in s) {
      const l = s[o],
        c = t(l, n);
      e.setAttribute(o, c);
    }
    const r = this.morphAttributes;
    for (const o in r) {
      const l = [],
        c = r[o];
      for (let h = 0, u = c.length; h < u; h++) {
        const f = c[h],
          p = t(f, n);
        l.push(p);
      }
      e.morphAttributes[o] = l;
    }
    e.morphTargetsRelative = this.morphTargetsRelative;
    const a = this.groups;
    for (let o = 0, l = a.length; o < l; o++) {
      const c = a[o];
      e.addGroup(c.start, c.count, c.materialIndex);
    }
    return e;
  }
  toJSON() {
    const t = {
      metadata: {
        version: 4.7,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON",
      },
    };
    if (
      ((t.uuid = this.uuid),
      (t.type = this.type),
      this.name !== "" && (t.name = this.name),
      Object.keys(this.userData).length > 0 && (t.userData = this.userData),
      this.parameters !== void 0)
    ) {
      const l = this.parameters;
      for (const c in l) l[c] !== void 0 && (t[c] = l[c]);
      return t;
    }
    t.data = { attributes: {} };
    const e = this.index;
    e !== null &&
      (t.data.index = {
        type: e.array.constructor.name,
        array: Array.prototype.slice.call(e.array),
      });
    const n = this.attributes;
    for (const l in n) {
      const c = n[l];
      t.data.attributes[l] = c.toJSON(t.data);
    }
    const s = {};
    let r = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l],
        h = [];
      for (let u = 0, f = c.length; u < f; u++) {
        const p = c[u];
        h.push(p.toJSON(t.data));
      }
      h.length > 0 && ((s[l] = h), (r = !0));
    }
    r &&
      ((t.data.morphAttributes = s),
      (t.data.morphTargetsRelative = this.morphTargetsRelative));
    const a = this.groups;
    a.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(a)));
    const o = this.boundingSphere;
    return (o !== null && (t.data.boundingSphere = o.toJSON()), t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    ((this.index = null),
      (this.attributes = {}),
      (this.morphAttributes = {}),
      (this.groups = []),
      (this.boundingBox = null),
      (this.boundingSphere = null));
    const e = {};
    this.name = t.name;
    const n = t.index;
    n !== null && this.setIndex(n.clone());
    const s = t.attributes;
    for (const c in s) {
      const h = s[c];
      this.setAttribute(c, h.clone(e));
    }
    const r = t.morphAttributes;
    for (const c in r) {
      const h = [],
        u = r[c];
      for (let f = 0, p = u.length; f < p; f++) h.push(u[f].clone(e));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = t.morphTargetsRelative;
    const a = t.groups;
    for (let c = 0, h = a.length; c < h; c++) {
      const u = a[c];
      this.addGroup(u.start, u.count, u.materialIndex);
    }
    const o = t.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    const l = t.boundingSphere;
    return (
      l !== null && (this.boundingSphere = l.clone()),
      (this.drawRange.start = t.drawRange.start),
      (this.drawRange.count = t.drawRange.count),
      (this.userData = t.userData),
      this
    );
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
const wo = new re(),
  zn = new Oc(),
  xs = new Di(),
  Ro = new F(),
  Ms = new F(),
  Ss = new F(),
  ys = new F(),
  Rr = new F(),
  Es = new F(),
  Co = new F(),
  bs = new F();
class me extends ge {
  constructor(t = new Ze(), e = new Va()) {
    (super(),
      (this.isMesh = !0),
      (this.type = "Mesh"),
      (this.geometry = t),
      (this.material = e),
      (this.morphTargetDictionary = void 0),
      (this.morphTargetInfluences = void 0),
      (this.count = 1),
      this.updateMorphTargets());
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      t.morphTargetInfluences !== void 0 &&
        (this.morphTargetInfluences = t.morphTargetInfluences.slice()),
      t.morphTargetDictionary !== void 0 &&
        (this.morphTargetDictionary = Object.assign(
          {},
          t.morphTargetDictionary,
        )),
      (this.material = Array.isArray(t.material)
        ? t.material.slice()
        : t.material),
      (this.geometry = t.geometry),
      this
    );
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes,
      n = Object.keys(e);
    if (n.length > 0) {
      const s = e[n[0]];
      if (s !== void 0) {
        ((this.morphTargetInfluences = []), (this.morphTargetDictionary = {}));
        for (let r = 0, a = s.length; r < a; r++) {
          const o = s[r].name || String(r);
          (this.morphTargetInfluences.push(0),
            (this.morphTargetDictionary[o] = r));
        }
      }
    }
  }
  getVertexPosition(t, e) {
    const n = this.geometry,
      s = n.attributes.position,
      r = n.morphAttributes.position,
      a = n.morphTargetsRelative;
    e.fromBufferAttribute(s, t);
    const o = this.morphTargetInfluences;
    if (r && o) {
      Es.set(0, 0, 0);
      for (let l = 0, c = r.length; l < c; l++) {
        const h = o[l],
          u = r[l];
        h !== 0 &&
          (Rr.fromBufferAttribute(u, t),
          a ? Es.addScaledVector(Rr, h) : Es.addScaledVector(Rr.sub(e), h));
      }
      e.add(Es);
    }
    return e;
  }
  raycast(t, e) {
    const n = this.geometry,
      s = this.material,
      r = this.matrixWorld;
    s !== void 0 &&
      (n.boundingSphere === null && n.computeBoundingSphere(),
      xs.copy(n.boundingSphere),
      xs.applyMatrix4(r),
      zn.copy(t.ray).recast(t.near),
      !(
        xs.containsPoint(zn.origin) === !1 &&
        (zn.intersectSphere(xs, Ro) === null ||
          zn.origin.distanceToSquared(Ro) > (t.far - t.near) ** 2)
      ) &&
        (wo.copy(r).invert(),
        zn.copy(t.ray).applyMatrix4(wo),
        !(n.boundingBox !== null && zn.intersectsBox(n.boundingBox) === !1) &&
          this._computeIntersections(t, e, zn)));
  }
  _computeIntersections(t, e, n) {
    let s;
    const r = this.geometry,
      a = this.material,
      o = r.index,
      l = r.attributes.position,
      c = r.attributes.uv,
      h = r.attributes.uv1,
      u = r.attributes.normal,
      f = r.groups,
      p = r.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let _ = 0, x = f.length; _ < x; _++) {
          const m = f[_],
            d = a[m.materialIndex],
            b = Math.max(m.start, p.start),
            T = Math.min(
              o.count,
              Math.min(m.start + m.count, p.start + p.count),
            );
          for (let y = b, R = T; y < R; y += 3) {
            const w = o.getX(y),
              C = o.getX(y + 1),
              U = o.getX(y + 2);
            ((s = Ts(this, d, t, n, c, h, u, w, C, U)),
              s &&
                ((s.faceIndex = Math.floor(y / 3)),
                (s.face.materialIndex = m.materialIndex),
                e.push(s)));
          }
        }
      else {
        const _ = Math.max(0, p.start),
          x = Math.min(o.count, p.start + p.count);
        for (let m = _, d = x; m < d; m += 3) {
          const b = o.getX(m),
            T = o.getX(m + 1),
            y = o.getX(m + 2);
          ((s = Ts(this, a, t, n, c, h, u, b, T, y)),
            s && ((s.faceIndex = Math.floor(m / 3)), e.push(s)));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(a))
        for (let _ = 0, x = f.length; _ < x; _++) {
          const m = f[_],
            d = a[m.materialIndex],
            b = Math.max(m.start, p.start),
            T = Math.min(
              l.count,
              Math.min(m.start + m.count, p.start + p.count),
            );
          for (let y = b, R = T; y < R; y += 3) {
            const w = y,
              C = y + 1,
              U = y + 2;
            ((s = Ts(this, d, t, n, c, h, u, w, C, U)),
              s &&
                ((s.faceIndex = Math.floor(y / 3)),
                (s.face.materialIndex = m.materialIndex),
                e.push(s)));
          }
        }
      else {
        const _ = Math.max(0, p.start),
          x = Math.min(l.count, p.start + p.count);
        for (let m = _, d = x; m < d; m += 3) {
          const b = m,
            T = m + 1,
            y = m + 2;
          ((s = Ts(this, a, t, n, c, h, u, b, T, y)),
            s && ((s.faceIndex = Math.floor(m / 3)), e.push(s)));
        }
      }
  }
}
function Od(i, t, e, n, s, r, a, o) {
  let l;
  if (
    (t.side === Ne
      ? (l = n.intersectTriangle(a, r, s, !0, o))
      : (l = n.intersectTriangle(s, r, a, t.side === Un, o)),
    l === null)
  )
    return null;
  (bs.copy(o), bs.applyMatrix4(i.matrixWorld));
  const c = e.ray.origin.distanceTo(bs);
  return c < e.near || c > e.far
    ? null
    : { distance: c, point: bs.clone(), object: i };
}
function Ts(i, t, e, n, s, r, a, o, l, c) {
  (i.getVertexPosition(o, Ms),
    i.getVertexPosition(l, Ss),
    i.getVertexPosition(c, ys));
  const h = Od(i, t, e, n, Ms, Ss, ys, Co);
  if (h) {
    const u = new F();
    (nn.getBarycoord(Co, Ms, Ss, ys, u),
      s && (h.uv = nn.getInterpolatedAttribute(s, o, l, c, u, new Xt())),
      r && (h.uv1 = nn.getInterpolatedAttribute(r, o, l, c, u, new Xt())),
      a &&
        ((h.normal = nn.getInterpolatedAttribute(a, o, l, c, u, new F())),
        h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1)));
    const f = { a: o, b: l, c, normal: new F(), materialIndex: 0 };
    (nn.getNormal(Ms, Ss, ys, f.normal), (h.face = f), (h.barycoord = u));
  }
  return h;
}
class Ii extends Ze {
  constructor(t = 1, e = 1, n = 1, s = 1, r = 1, a = 1) {
    (super(),
      (this.type = "BoxGeometry"),
      (this.parameters = {
        width: t,
        height: e,
        depth: n,
        widthSegments: s,
        heightSegments: r,
        depthSegments: a,
      }));
    const o = this;
    ((s = Math.floor(s)), (r = Math.floor(r)), (a = Math.floor(a)));
    const l = [],
      c = [],
      h = [],
      u = [];
    let f = 0,
      p = 0;
    (_("z", "y", "x", -1, -1, n, e, t, a, r, 0),
      _("z", "y", "x", 1, -1, n, e, -t, a, r, 1),
      _("x", "z", "y", 1, 1, t, n, e, s, a, 2),
      _("x", "z", "y", 1, -1, t, n, -e, s, a, 3),
      _("x", "y", "z", 1, -1, t, e, n, s, r, 4),
      _("x", "y", "z", -1, -1, t, e, -n, s, r, 5),
      this.setIndex(l),
      this.setAttribute("position", new _e(c, 3)),
      this.setAttribute("normal", new _e(h, 3)),
      this.setAttribute("uv", new _e(u, 2)));
    function _(x, m, d, b, T, y, R, w, C, U, S) {
      const M = y / C,
        P = R / U,
        N = y / 2,
        B = R / 2,
        W = w / 2,
        G = C + 1,
        X = U + 1;
      let j = 0,
        H = 0;
      const rt = new F();
      for (let lt = 0; lt < X; lt++) {
        const bt = lt * P - B;
        for (let kt = 0; kt < G; kt++) {
          const ne = kt * M - N;
          ((rt[x] = ne * b),
            (rt[m] = bt * T),
            (rt[d] = W),
            c.push(rt.x, rt.y, rt.z),
            (rt[x] = 0),
            (rt[m] = 0),
            (rt[d] = w > 0 ? 1 : -1),
            h.push(rt.x, rt.y, rt.z),
            u.push(kt / C),
            u.push(1 - lt / U),
            (j += 1));
        }
      }
      for (let lt = 0; lt < U; lt++)
        for (let bt = 0; bt < C; bt++) {
          const kt = f + bt + G * lt,
            ne = f + bt + G * (lt + 1),
            ae = f + (bt + 1) + G * (lt + 1),
            Kt = f + (bt + 1) + G * lt;
          (l.push(kt, ne, Kt), l.push(ne, ae, Kt), (H += 6));
        }
      (o.addGroup(p, H, S), (p += H), (f += j));
    }
  }
  copy(t) {
    return (
      super.copy(t),
      (this.parameters = Object.assign({}, t.parameters)),
      this
    );
  }
  static fromJSON(t) {
    return new Ii(
      t.width,
      t.height,
      t.depth,
      t.widthSegments,
      t.heightSegments,
      t.depthSegments,
    );
  }
}
function wi(i) {
  const t = {};
  for (const e in i) {
    t[e] = {};
    for (const n in i[e]) {
      const s = i[e][n];
      s &&
      (s.isColor ||
        s.isMatrix3 ||
        s.isMatrix4 ||
        s.isVector2 ||
        s.isVector3 ||
        s.isVector4 ||
        s.isTexture ||
        s.isQuaternion)
        ? s.isRenderTargetTexture
          ? (console.warn(
              "UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().",
            ),
            (t[e][n] = null))
          : (t[e][n] = s.clone())
        : Array.isArray(s)
          ? (t[e][n] = s.slice())
          : (t[e][n] = s);
    }
  }
  return t;
}
function Re(i) {
  const t = {};
  for (let e = 0; e < i.length; e++) {
    const n = wi(i[e]);
    for (const s in n) t[s] = n[s];
  }
  return t;
}
function Bd(i) {
  const t = [];
  for (let e = 0; e < i.length; e++) t.push(i[e].clone());
  return t;
}
function Vc(i) {
  const t = i.getRenderTarget();
  return t === null
    ? i.outputColorSpace
    : t.isXRRenderTarget === !0
      ? t.texture.colorSpace
      : Yt.workingColorSpace;
}
const kd = { clone: wi, merge: Re };
var zd = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
  Hd = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class Nn extends Li {
  constructor(t) {
    (super(),
      (this.isShaderMaterial = !0),
      (this.type = "ShaderMaterial"),
      (this.defines = {}),
      (this.uniforms = {}),
      (this.uniformsGroups = []),
      (this.vertexShader = zd),
      (this.fragmentShader = Hd),
      (this.linewidth = 1),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      (this.fog = !1),
      (this.lights = !1),
      (this.clipping = !1),
      (this.forceSinglePass = !0),
      (this.extensions = { clipCullDistance: !1, multiDraw: !1 }),
      (this.defaultAttributeValues = {
        color: [1, 1, 1],
        uv: [0, 0],
        uv1: [0, 0],
      }),
      (this.index0AttributeName = void 0),
      (this.uniformsNeedUpdate = !1),
      (this.glslVersion = null),
      t !== void 0 && this.setValues(t));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.fragmentShader = t.fragmentShader),
      (this.vertexShader = t.vertexShader),
      (this.uniforms = wi(t.uniforms)),
      (this.uniformsGroups = Bd(t.uniformsGroups)),
      (this.defines = Object.assign({}, t.defines)),
      (this.wireframe = t.wireframe),
      (this.wireframeLinewidth = t.wireframeLinewidth),
      (this.fog = t.fog),
      (this.lights = t.lights),
      (this.clipping = t.clipping),
      (this.extensions = Object.assign({}, t.extensions)),
      (this.glslVersion = t.glslVersion),
      this
    );
  }
  toJSON(t) {
    const e = super.toJSON(t);
    ((e.glslVersion = this.glslVersion), (e.uniforms = {}));
    for (const s in this.uniforms) {
      const a = this.uniforms[s].value;
      a && a.isTexture
        ? (e.uniforms[s] = { type: "t", value: a.toJSON(t).uuid })
        : a && a.isColor
          ? (e.uniforms[s] = { type: "c", value: a.getHex() })
          : a && a.isVector2
            ? (e.uniforms[s] = { type: "v2", value: a.toArray() })
            : a && a.isVector3
              ? (e.uniforms[s] = { type: "v3", value: a.toArray() })
              : a && a.isVector4
                ? (e.uniforms[s] = { type: "v4", value: a.toArray() })
                : a && a.isMatrix3
                  ? (e.uniforms[s] = { type: "m3", value: a.toArray() })
                  : a && a.isMatrix4
                    ? (e.uniforms[s] = { type: "m4", value: a.toArray() })
                    : (e.uniforms[s] = { value: a });
    }
    (Object.keys(this.defines).length > 0 && (e.defines = this.defines),
      (e.vertexShader = this.vertexShader),
      (e.fragmentShader = this.fragmentShader),
      (e.lights = this.lights),
      (e.clipping = this.clipping));
    const n = {};
    for (const s in this.extensions) this.extensions[s] === !0 && (n[s] = !0);
    return (Object.keys(n).length > 0 && (e.extensions = n), e);
  }
}
class Gc extends ge {
  constructor() {
    (super(),
      (this.isCamera = !0),
      (this.type = "Camera"),
      (this.matrixWorldInverse = new re()),
      (this.projectionMatrix = new re()),
      (this.projectionMatrixInverse = new re()),
      (this.coordinateSystem = dn),
      (this._reversedDepth = !1));
  }
  get reversedDepth() {
    return this._reversedDepth;
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      this.matrixWorldInverse.copy(t.matrixWorldInverse),
      this.projectionMatrix.copy(t.projectionMatrix),
      this.projectionMatrixInverse.copy(t.projectionMatrixInverse),
      (this.coordinateSystem = t.coordinateSystem),
      this
    );
  }
  getWorldDirection(t) {
    return super.getWorldDirection(t).negate();
  }
  updateMatrixWorld(t) {
    (super.updateMatrixWorld(t),
      this.matrixWorldInverse.copy(this.matrixWorld).invert());
  }
  updateWorldMatrix(t, e) {
    (super.updateWorldMatrix(t, e),
      this.matrixWorldInverse.copy(this.matrixWorld).invert());
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Rn = new F(),
  Po = new Xt(),
  Do = new Xt();
class je extends Gc {
  constructor(t = 50, e = 1, n = 0.1, s = 2e3) {
    (super(),
      (this.isPerspectiveCamera = !0),
      (this.type = "PerspectiveCamera"),
      (this.fov = t),
      (this.zoom = 1),
      (this.near = n),
      (this.far = s),
      (this.focus = 10),
      (this.aspect = e),
      (this.view = null),
      (this.filmGauge = 35),
      (this.filmOffset = 0),
      this.updateProjectionMatrix());
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      (this.fov = t.fov),
      (this.zoom = t.zoom),
      (this.near = t.near),
      (this.far = t.far),
      (this.focus = t.focus),
      (this.aspect = t.aspect),
      (this.view = t.view === null ? null : Object.assign({}, t.view)),
      (this.filmGauge = t.filmGauge),
      (this.filmOffset = t.filmOffset),
      this
    );
  }
  setFocalLength(t) {
    const e = (0.5 * this.getFilmHeight()) / t;
    ((this.fov = Ca * 2 * Math.atan(e)), this.updateProjectionMatrix());
  }
  getFocalLength() {
    const t = Math.tan(or * 0.5 * this.fov);
    return (0.5 * this.getFilmHeight()) / t;
  }
  getEffectiveFOV() {
    return Ca * 2 * Math.atan(Math.tan(or * 0.5 * this.fov) / this.zoom);
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  getViewBounds(t, e, n) {
    (Rn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse),
      e.set(Rn.x, Rn.y).multiplyScalar(-t / Rn.z),
      Rn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse),
      n.set(Rn.x, Rn.y).multiplyScalar(-t / Rn.z));
  }
  getViewSize(t, e) {
    return (this.getViewBounds(t, Po, Do), e.subVectors(Do, Po));
  }
  setViewOffset(t, e, n, s, r, a) {
    ((this.aspect = t / e),
      this.view === null &&
        (this.view = {
          enabled: !0,
          fullWidth: 1,
          fullHeight: 1,
          offsetX: 0,
          offsetY: 0,
          width: 1,
          height: 1,
        }),
      (this.view.enabled = !0),
      (this.view.fullWidth = t),
      (this.view.fullHeight = e),
      (this.view.offsetX = n),
      (this.view.offsetY = s),
      (this.view.width = r),
      (this.view.height = a),
      this.updateProjectionMatrix());
  }
  clearViewOffset() {
    (this.view !== null && (this.view.enabled = !1),
      this.updateProjectionMatrix());
  }
  updateProjectionMatrix() {
    const t = this.near;
    let e = (t * Math.tan(or * 0.5 * this.fov)) / this.zoom,
      n = 2 * e,
      s = this.aspect * n,
      r = -0.5 * s;
    const a = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = a.fullWidth,
        c = a.fullHeight;
      ((r += (a.offsetX * s) / l),
        (e -= (a.offsetY * n) / c),
        (s *= a.width / l),
        (n *= a.height / c));
    }
    const o = this.filmOffset;
    (o !== 0 && (r += (t * o) / this.getFilmWidth()),
      this.projectionMatrix.makePerspective(
        r,
        r + s,
        e,
        e - n,
        t,
        this.far,
        this.coordinateSystem,
        this.reversedDepth,
      ),
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert());
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return (
      (e.object.fov = this.fov),
      (e.object.zoom = this.zoom),
      (e.object.near = this.near),
      (e.object.far = this.far),
      (e.object.focus = this.focus),
      (e.object.aspect = this.aspect),
      this.view !== null && (e.object.view = Object.assign({}, this.view)),
      (e.object.filmGauge = this.filmGauge),
      (e.object.filmOffset = this.filmOffset),
      e
    );
  }
}
const gi = -90,
  _i = 1;
class Vd extends ge {
  constructor(t, e, n) {
    (super(),
      (this.type = "CubeCamera"),
      (this.renderTarget = n),
      (this.coordinateSystem = null),
      (this.activeMipmapLevel = 0));
    const s = new je(gi, _i, t, e);
    ((s.layers = this.layers), this.add(s));
    const r = new je(gi, _i, t, e);
    ((r.layers = this.layers), this.add(r));
    const a = new je(gi, _i, t, e);
    ((a.layers = this.layers), this.add(a));
    const o = new je(gi, _i, t, e);
    ((o.layers = this.layers), this.add(o));
    const l = new je(gi, _i, t, e);
    ((l.layers = this.layers), this.add(l));
    const c = new je(gi, _i, t, e);
    ((c.layers = this.layers), this.add(c));
  }
  updateCoordinateSystem() {
    const t = this.coordinateSystem,
      e = this.children.concat(),
      [n, s, r, a, o, l] = e;
    for (const c of e) this.remove(c);
    if (t === dn)
      (n.up.set(0, 1, 0),
        n.lookAt(1, 0, 0),
        s.up.set(0, 1, 0),
        s.lookAt(-1, 0, 0),
        r.up.set(0, 0, -1),
        r.lookAt(0, 1, 0),
        a.up.set(0, 0, 1),
        a.lookAt(0, -1, 0),
        o.up.set(0, 1, 0),
        o.lookAt(0, 0, 1),
        l.up.set(0, 1, 0),
        l.lookAt(0, 0, -1));
    else if (t === Ws)
      (n.up.set(0, -1, 0),
        n.lookAt(-1, 0, 0),
        s.up.set(0, -1, 0),
        s.lookAt(1, 0, 0),
        r.up.set(0, 0, 1),
        r.lookAt(0, 1, 0),
        a.up.set(0, 0, -1),
        a.lookAt(0, -1, 0),
        o.up.set(0, -1, 0),
        o.lookAt(0, 0, 1),
        l.up.set(0, -1, 0),
        l.lookAt(0, 0, -1));
    else
      throw new Error(
        "THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " +
          t,
      );
    for (const c of e) (this.add(c), c.updateMatrixWorld());
  }
  update(t, e) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: s } = this;
    this.coordinateSystem !== t.coordinateSystem &&
      ((this.coordinateSystem = t.coordinateSystem),
      this.updateCoordinateSystem());
    const [r, a, o, l, c, h] = this.children,
      u = t.getRenderTarget(),
      f = t.getActiveCubeFace(),
      p = t.getActiveMipmapLevel(),
      _ = t.xr.enabled;
    t.xr.enabled = !1;
    const x = n.texture.generateMipmaps;
    ((n.texture.generateMipmaps = !1),
      t.setRenderTarget(n, 0, s),
      t.render(e, r),
      t.setRenderTarget(n, 1, s),
      t.render(e, a),
      t.setRenderTarget(n, 2, s),
      t.render(e, o),
      t.setRenderTarget(n, 3, s),
      t.render(e, l),
      t.setRenderTarget(n, 4, s),
      t.render(e, c),
      (n.texture.generateMipmaps = x),
      t.setRenderTarget(n, 5, s),
      t.render(e, h),
      t.setRenderTarget(u, f, p),
      (t.xr.enabled = _),
      (n.texture.needsPMREMUpdate = !0));
  }
}
class Wc extends Ae {
  constructor(t = [], e = bi, n, s, r, a, o, l, c, h) {
    (super(t, e, n, s, r, a, o, l, c, h),
      (this.isCubeTexture = !0),
      (this.flipY = !1));
  }
  get images() {
    return this.image;
  }
  set images(t) {
    this.image = t;
  }
}
class Gd extends ei {
  constructor(t = 1, e = {}) {
    (super(t, t, e), (this.isWebGLCubeRenderTarget = !0));
    const n = { width: t, height: t, depth: 1 },
      s = [n, n, n, n, n, n];
    ((this.texture = new Wc(s)),
      this._setTextureOptions(e),
      (this.texture.isRenderTargetTexture = !0));
  }
  fromEquirectangularTexture(t, e) {
    ((this.texture.type = e.type),
      (this.texture.colorSpace = e.colorSpace),
      (this.texture.generateMipmaps = e.generateMipmaps),
      (this.texture.minFilter = e.minFilter),
      (this.texture.magFilter = e.magFilter));
    const n = {
        uniforms: { tEquirect: { value: null } },
        vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
        fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`,
      },
      s = new Ii(5, 5, 5),
      r = new Nn({
        name: "CubemapFromEquirect",
        uniforms: wi(n.uniforms),
        vertexShader: n.vertexShader,
        fragmentShader: n.fragmentShader,
        side: Ne,
        blending: Dn,
      });
    r.uniforms.tEquirect.value = e;
    const a = new me(s, r),
      o = e.minFilter;
    return (
      e.minFilter === jn && (e.minFilter = cn),
      new Vd(1, 10, this).update(t, a),
      (e.minFilter = o),
      a.geometry.dispose(),
      a.material.dispose(),
      this
    );
  }
  clear(t, e = !0, n = !0, s = !0) {
    const r = t.getRenderTarget();
    for (let a = 0; a < 6; a++) (t.setRenderTarget(this, a), t.clear(e, n, s));
    t.setRenderTarget(r);
  }
}
class Kn extends ge {
  constructor() {
    (super(), (this.isGroup = !0), (this.type = "Group"));
  }
}
const Wd = { type: "move" };
class Cr {
  constructor() {
    ((this._targetRay = null), (this._grip = null), (this._hand = null));
  }
  getHandSpace() {
    return (
      this._hand === null &&
        ((this._hand = new Kn()),
        (this._hand.matrixAutoUpdate = !1),
        (this._hand.visible = !1),
        (this._hand.joints = {}),
        (this._hand.inputState = { pinching: !1 })),
      this._hand
    );
  }
  getTargetRaySpace() {
    return (
      this._targetRay === null &&
        ((this._targetRay = new Kn()),
        (this._targetRay.matrixAutoUpdate = !1),
        (this._targetRay.visible = !1),
        (this._targetRay.hasLinearVelocity = !1),
        (this._targetRay.linearVelocity = new F()),
        (this._targetRay.hasAngularVelocity = !1),
        (this._targetRay.angularVelocity = new F())),
      this._targetRay
    );
  }
  getGripSpace() {
    return (
      this._grip === null &&
        ((this._grip = new Kn()),
        (this._grip.matrixAutoUpdate = !1),
        (this._grip.visible = !1),
        (this._grip.hasLinearVelocity = !1),
        (this._grip.linearVelocity = new F()),
        (this._grip.hasAngularVelocity = !1),
        (this._grip.angularVelocity = new F())),
      this._grip
    );
  }
  dispatchEvent(t) {
    return (
      this._targetRay !== null && this._targetRay.dispatchEvent(t),
      this._grip !== null && this._grip.dispatchEvent(t),
      this._hand !== null && this._hand.dispatchEvent(t),
      this
    );
  }
  connect(t) {
    if (t && t.hand) {
      const e = this._hand;
      if (e) for (const n of t.hand.values()) this._getHandJoint(e, n);
    }
    return (this.dispatchEvent({ type: "connected", data: t }), this);
  }
  disconnect(t) {
    return (
      this.dispatchEvent({ type: "disconnected", data: t }),
      this._targetRay !== null && (this._targetRay.visible = !1),
      this._grip !== null && (this._grip.visible = !1),
      this._hand !== null && (this._hand.visible = !1),
      this
    );
  }
  update(t, e, n) {
    let s = null,
      r = null,
      a = null;
    const o = this._targetRay,
      l = this._grip,
      c = this._hand;
    if (t && e.session.visibilityState !== "visible-blurred") {
      if (c && t.hand) {
        a = !0;
        for (const x of t.hand.values()) {
          const m = e.getJointPose(x, n),
            d = this._getHandJoint(c, x);
          (m !== null &&
            (d.matrix.fromArray(m.transform.matrix),
            d.matrix.decompose(d.position, d.rotation, d.scale),
            (d.matrixWorldNeedsUpdate = !0),
            (d.jointRadius = m.radius)),
            (d.visible = m !== null));
        }
        const h = c.joints["index-finger-tip"],
          u = c.joints["thumb-tip"],
          f = h.position.distanceTo(u.position),
          p = 0.02,
          _ = 0.005;
        c.inputState.pinching && f > p + _
          ? ((c.inputState.pinching = !1),
            this.dispatchEvent({
              type: "pinchend",
              handedness: t.handedness,
              target: this,
            }))
          : !c.inputState.pinching &&
            f <= p - _ &&
            ((c.inputState.pinching = !0),
            this.dispatchEvent({
              type: "pinchstart",
              handedness: t.handedness,
              target: this,
            }));
      } else
        l !== null &&
          t.gripSpace &&
          ((r = e.getPose(t.gripSpace, n)),
          r !== null &&
            (l.matrix.fromArray(r.transform.matrix),
            l.matrix.decompose(l.position, l.rotation, l.scale),
            (l.matrixWorldNeedsUpdate = !0),
            r.linearVelocity
              ? ((l.hasLinearVelocity = !0),
                l.linearVelocity.copy(r.linearVelocity))
              : (l.hasLinearVelocity = !1),
            r.angularVelocity
              ? ((l.hasAngularVelocity = !0),
                l.angularVelocity.copy(r.angularVelocity))
              : (l.hasAngularVelocity = !1)));
      o !== null &&
        ((s = e.getPose(t.targetRaySpace, n)),
        s === null && r !== null && (s = r),
        s !== null &&
          (o.matrix.fromArray(s.transform.matrix),
          o.matrix.decompose(o.position, o.rotation, o.scale),
          (o.matrixWorldNeedsUpdate = !0),
          s.linearVelocity
            ? ((o.hasLinearVelocity = !0),
              o.linearVelocity.copy(s.linearVelocity))
            : (o.hasLinearVelocity = !1),
          s.angularVelocity
            ? ((o.hasAngularVelocity = !0),
              o.angularVelocity.copy(s.angularVelocity))
            : (o.hasAngularVelocity = !1),
          this.dispatchEvent(Wd)));
    }
    return (
      o !== null && (o.visible = s !== null),
      l !== null && (l.visible = r !== null),
      c !== null && (c.visible = a !== null),
      this
    );
  }
  _getHandJoint(t, e) {
    if (t.joints[e.jointName] === void 0) {
      const n = new Kn();
      ((n.matrixAutoUpdate = !1),
        (n.visible = !1),
        (t.joints[e.jointName] = n),
        t.add(n));
    }
    return t.joints[e.jointName];
  }
}
class Ga {
  constructor(t, e = 1, n = 1e3) {
    ((this.isFog = !0),
      (this.name = ""),
      (this.color = new Ht(t)),
      (this.near = e),
      (this.far = n));
  }
  clone() {
    return new Ga(this.color, this.near, this.far);
  }
  toJSON() {
    return {
      type: "Fog",
      name: this.name,
      color: this.color.getHex(),
      near: this.near,
      far: this.far,
    };
  }
}
class $d extends ge {
  constructor() {
    (super(),
      (this.isScene = !0),
      (this.type = "Scene"),
      (this.background = null),
      (this.environment = null),
      (this.fog = null),
      (this.backgroundBlurriness = 0),
      (this.backgroundIntensity = 1),
      (this.backgroundRotation = new fn()),
      (this.environmentIntensity = 1),
      (this.environmentRotation = new fn()),
      (this.overrideMaterial = null),
      typeof __THREE_DEVTOOLS__ < "u" &&
        __THREE_DEVTOOLS__.dispatchEvent(
          new CustomEvent("observe", { detail: this }),
        ));
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      t.background !== null && (this.background = t.background.clone()),
      t.environment !== null && (this.environment = t.environment.clone()),
      t.fog !== null && (this.fog = t.fog.clone()),
      (this.backgroundBlurriness = t.backgroundBlurriness),
      (this.backgroundIntensity = t.backgroundIntensity),
      this.backgroundRotation.copy(t.backgroundRotation),
      (this.environmentIntensity = t.environmentIntensity),
      this.environmentRotation.copy(t.environmentRotation),
      t.overrideMaterial !== null &&
        (this.overrideMaterial = t.overrideMaterial.clone()),
      (this.matrixAutoUpdate = t.matrixAutoUpdate),
      this
    );
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return (
      this.fog !== null && (e.object.fog = this.fog.toJSON()),
      this.backgroundBlurriness > 0 &&
        (e.object.backgroundBlurriness = this.backgroundBlurriness),
      this.backgroundIntensity !== 1 &&
        (e.object.backgroundIntensity = this.backgroundIntensity),
      (e.object.backgroundRotation = this.backgroundRotation.toArray()),
      this.environmentIntensity !== 1 &&
        (e.object.environmentIntensity = this.environmentIntensity),
      (e.object.environmentRotation = this.environmentRotation.toArray()),
      e
    );
  }
}
class Xd extends Ae {
  constructor(t = null, e = 1, n = 1, s, r, a, o, l, c = Ge, h = Ge, u, f) {
    (super(null, a, o, l, c, h, s, r, u, f),
      (this.isDataTexture = !0),
      (this.image = { data: t, width: e, height: n }),
      (this.generateMipmaps = !1),
      (this.flipY = !1),
      (this.unpackAlignment = 1));
  }
}
class Lo extends rn {
  constructor(t, e, n, s = 1) {
    (super(t, e, n),
      (this.isInstancedBufferAttribute = !0),
      (this.meshPerAttribute = s));
  }
  copy(t) {
    return (super.copy(t), (this.meshPerAttribute = t.meshPerAttribute), this);
  }
  toJSON() {
    const t = super.toJSON();
    return (
      (t.meshPerAttribute = this.meshPerAttribute),
      (t.isInstancedBufferAttribute = !0),
      t
    );
  }
}
const vi = new re(),
  Io = new re(),
  As = [],
  Uo = new ii(),
  qd = new re(),
  Vi = new me(),
  Gi = new Di();
class Yd extends me {
  constructor(t, e, n) {
    (super(t, e),
      (this.isInstancedMesh = !0),
      (this.instanceMatrix = new Lo(new Float32Array(n * 16), 16)),
      (this.instanceColor = null),
      (this.morphTexture = null),
      (this.count = n),
      (this.boundingBox = null),
      (this.boundingSphere = null));
    for (let s = 0; s < n; s++) this.setMatrixAt(s, qd);
  }
  computeBoundingBox() {
    const t = this.geometry,
      e = this.count;
    (this.boundingBox === null && (this.boundingBox = new ii()),
      t.boundingBox === null && t.computeBoundingBox(),
      this.boundingBox.makeEmpty());
    for (let n = 0; n < e; n++)
      (this.getMatrixAt(n, vi),
        Uo.copy(t.boundingBox).applyMatrix4(vi),
        this.boundingBox.union(Uo));
  }
  computeBoundingSphere() {
    const t = this.geometry,
      e = this.count;
    (this.boundingSphere === null && (this.boundingSphere = new Di()),
      t.boundingSphere === null && t.computeBoundingSphere(),
      this.boundingSphere.makeEmpty());
    for (let n = 0; n < e; n++)
      (this.getMatrixAt(n, vi),
        Gi.copy(t.boundingSphere).applyMatrix4(vi),
        this.boundingSphere.union(Gi));
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      this.instanceMatrix.copy(t.instanceMatrix),
      t.morphTexture !== null && (this.morphTexture = t.morphTexture.clone()),
      t.instanceColor !== null &&
        (this.instanceColor = t.instanceColor.clone()),
      (this.count = t.count),
      t.boundingBox !== null && (this.boundingBox = t.boundingBox.clone()),
      t.boundingSphere !== null &&
        (this.boundingSphere = t.boundingSphere.clone()),
      this
    );
  }
  getColorAt(t, e) {
    e.fromArray(this.instanceColor.array, t * 3);
  }
  getMatrixAt(t, e) {
    e.fromArray(this.instanceMatrix.array, t * 16);
  }
  getMorphAt(t, e) {
    const n = e.morphTargetInfluences,
      s = this.morphTexture.source.data.data,
      r = n.length + 1,
      a = t * r + 1;
    for (let o = 0; o < n.length; o++) n[o] = s[a + o];
  }
  raycast(t, e) {
    const n = this.matrixWorld,
      s = this.count;
    if (
      ((Vi.geometry = this.geometry),
      (Vi.material = this.material),
      Vi.material !== void 0 &&
        (this.boundingSphere === null && this.computeBoundingSphere(),
        Gi.copy(this.boundingSphere),
        Gi.applyMatrix4(n),
        t.ray.intersectsSphere(Gi) !== !1))
    )
      for (let r = 0; r < s; r++) {
        (this.getMatrixAt(r, vi),
          Io.multiplyMatrices(n, vi),
          (Vi.matrixWorld = Io),
          Vi.raycast(t, As));
        for (let a = 0, o = As.length; a < o; a++) {
          const l = As[a];
          ((l.instanceId = r), (l.object = this), e.push(l));
        }
        As.length = 0;
      }
  }
  setColorAt(t, e) {
    (this.instanceColor === null &&
      (this.instanceColor = new Lo(
        new Float32Array(this.instanceMatrix.count * 3).fill(1),
        3,
      )),
      e.toArray(this.instanceColor.array, t * 3));
  }
  setMatrixAt(t, e) {
    e.toArray(this.instanceMatrix.array, t * 16);
  }
  setMorphAt(t, e) {
    const n = e.morphTargetInfluences,
      s = n.length + 1;
    this.morphTexture === null &&
      (this.morphTexture = new Xd(
        new Float32Array(s * this.count),
        s,
        this.count,
        Oa,
        ln,
      ));
    const r = this.morphTexture.source.data.data;
    let a = 0;
    for (let c = 0; c < n.length; c++) a += n[c];
    const o = this.geometry.morphTargetsRelative ? 1 : 1 - a,
      l = s * t;
    ((r[l] = o), r.set(n, l + 1));
  }
  updateMorphTargets() {}
  dispose() {
    (this.dispatchEvent({ type: "dispose" }),
      this.morphTexture !== null &&
        (this.morphTexture.dispose(), (this.morphTexture = null)));
  }
}
const Pr = new F(),
  jd = new F(),
  Kd = new Ft();
class Wn {
  constructor(t = new F(1, 0, 0), e = 0) {
    ((this.isPlane = !0), (this.normal = t), (this.constant = e));
  }
  set(t, e) {
    return (this.normal.copy(t), (this.constant = e), this);
  }
  setComponents(t, e, n, s) {
    return (this.normal.set(t, e, n), (this.constant = s), this);
  }
  setFromNormalAndCoplanarPoint(t, e) {
    return (this.normal.copy(t), (this.constant = -e.dot(this.normal)), this);
  }
  setFromCoplanarPoints(t, e, n) {
    const s = Pr.subVectors(n, e).cross(jd.subVectors(t, e)).normalize();
    return (this.setFromNormalAndCoplanarPoint(s, t), this);
  }
  copy(t) {
    return (this.normal.copy(t.normal), (this.constant = t.constant), this);
  }
  normalize() {
    const t = 1 / this.normal.length();
    return (this.normal.multiplyScalar(t), (this.constant *= t), this);
  }
  negate() {
    return ((this.constant *= -1), this.normal.negate(), this);
  }
  distanceToPoint(t) {
    return this.normal.dot(t) + this.constant;
  }
  distanceToSphere(t) {
    return this.distanceToPoint(t.center) - t.radius;
  }
  projectPoint(t, e) {
    return e.copy(t).addScaledVector(this.normal, -this.distanceToPoint(t));
  }
  intersectLine(t, e) {
    const n = t.delta(Pr),
      s = this.normal.dot(n);
    if (s === 0)
      return this.distanceToPoint(t.start) === 0 ? e.copy(t.start) : null;
    const r = -(t.start.dot(this.normal) + this.constant) / s;
    return r < 0 || r > 1 ? null : e.copy(t.start).addScaledVector(n, r);
  }
  intersectsLine(t) {
    const e = this.distanceToPoint(t.start),
      n = this.distanceToPoint(t.end);
    return (e < 0 && n > 0) || (n < 0 && e > 0);
  }
  intersectsBox(t) {
    return t.intersectsPlane(this);
  }
  intersectsSphere(t) {
    return t.intersectsPlane(this);
  }
  coplanarPoint(t) {
    return t.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(t, e) {
    const n = e || Kd.getNormalMatrix(t),
      s = this.coplanarPoint(Pr).applyMatrix4(t),
      r = this.normal.applyMatrix3(n).normalize();
    return ((this.constant = -s.dot(r)), this);
  }
  translate(t) {
    return ((this.constant -= t.dot(this.normal)), this);
  }
  equals(t) {
    return t.normal.equals(this.normal) && t.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Hn = new Di(),
  Zd = new Xt(0.5, 0.5),
  ws = new F();
class Wa {
  constructor(
    t = new Wn(),
    e = new Wn(),
    n = new Wn(),
    s = new Wn(),
    r = new Wn(),
    a = new Wn(),
  ) {
    this.planes = [t, e, n, s, r, a];
  }
  set(t, e, n, s, r, a) {
    const o = this.planes;
    return (
      o[0].copy(t),
      o[1].copy(e),
      o[2].copy(n),
      o[3].copy(s),
      o[4].copy(r),
      o[5].copy(a),
      this
    );
  }
  copy(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++) e[n].copy(t.planes[n]);
    return this;
  }
  setFromProjectionMatrix(t, e = dn, n = !1) {
    const s = this.planes,
      r = t.elements,
      a = r[0],
      o = r[1],
      l = r[2],
      c = r[3],
      h = r[4],
      u = r[5],
      f = r[6],
      p = r[7],
      _ = r[8],
      x = r[9],
      m = r[10],
      d = r[11],
      b = r[12],
      T = r[13],
      y = r[14],
      R = r[15];
    if (
      (s[0].setComponents(c - a, p - h, d - _, R - b).normalize(),
      s[1].setComponents(c + a, p + h, d + _, R + b).normalize(),
      s[2].setComponents(c + o, p + u, d + x, R + T).normalize(),
      s[3].setComponents(c - o, p - u, d - x, R - T).normalize(),
      n)
    )
      (s[4].setComponents(l, f, m, y).normalize(),
        s[5].setComponents(c - l, p - f, d - m, R - y).normalize());
    else if (
      (s[4].setComponents(c - l, p - f, d - m, R - y).normalize(), e === dn)
    )
      s[5].setComponents(c + l, p + f, d + m, R + y).normalize();
    else if (e === Ws) s[5].setComponents(l, f, m, y).normalize();
    else
      throw new Error(
        "THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " +
          e,
      );
    return this;
  }
  intersectsObject(t) {
    if (t.boundingSphere !== void 0)
      (t.boundingSphere === null && t.computeBoundingSphere(),
        Hn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld));
    else {
      const e = t.geometry;
      (e.boundingSphere === null && e.computeBoundingSphere(),
        Hn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld));
    }
    return this.intersectsSphere(Hn);
  }
  intersectsSprite(t) {
    Hn.center.set(0, 0, 0);
    const e = Zd.distanceTo(t.center);
    return (
      (Hn.radius = 0.7071067811865476 + e),
      Hn.applyMatrix4(t.matrixWorld),
      this.intersectsSphere(Hn)
    );
  }
  intersectsSphere(t) {
    const e = this.planes,
      n = t.center,
      s = -t.radius;
    for (let r = 0; r < 6; r++) if (e[r].distanceToPoint(n) < s) return !1;
    return !0;
  }
  intersectsBox(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++) {
      const s = e[n];
      if (
        ((ws.x = s.normal.x > 0 ? t.max.x : t.min.x),
        (ws.y = s.normal.y > 0 ? t.max.y : t.min.y),
        (ws.z = s.normal.z > 0 ? t.max.z : t.min.z),
        s.distanceToPoint(ws) < 0)
      )
        return !1;
    }
    return !0;
  }
  containsPoint(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++) if (e[n].distanceToPoint(t) < 0) return !1;
    return !0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class $c extends Li {
  constructor(t) {
    (super(),
      (this.isLineBasicMaterial = !0),
      (this.type = "LineBasicMaterial"),
      (this.color = new Ht(16777215)),
      (this.map = null),
      (this.linewidth = 1),
      (this.linecap = "round"),
      (this.linejoin = "round"),
      (this.fog = !0),
      this.setValues(t));
  }
  copy(t) {
    return (
      super.copy(t),
      this.color.copy(t.color),
      (this.map = t.map),
      (this.linewidth = t.linewidth),
      (this.linecap = t.linecap),
      (this.linejoin = t.linejoin),
      (this.fog = t.fog),
      this
    );
  }
}
const Xs = new F(),
  qs = new F(),
  No = new re(),
  Wi = new Oc(),
  Rs = new Di(),
  Dr = new F(),
  Fo = new F();
class Jd extends ge {
  constructor(t = new Ze(), e = new $c()) {
    (super(),
      (this.isLine = !0),
      (this.type = "Line"),
      (this.geometry = t),
      (this.material = e),
      (this.morphTargetDictionary = void 0),
      (this.morphTargetInfluences = void 0),
      this.updateMorphTargets());
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      (this.material = Array.isArray(t.material)
        ? t.material.slice()
        : t.material),
      (this.geometry = t.geometry),
      this
    );
  }
  computeLineDistances() {
    const t = this.geometry;
    if (t.index === null) {
      const e = t.attributes.position,
        n = [0];
      for (let s = 1, r = e.count; s < r; s++)
        (Xs.fromBufferAttribute(e, s - 1),
          qs.fromBufferAttribute(e, s),
          (n[s] = n[s - 1]),
          (n[s] += Xs.distanceTo(qs)));
      t.setAttribute("lineDistance", new _e(n, 1));
    } else
      console.warn(
        "THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.",
      );
    return this;
  }
  raycast(t, e) {
    const n = this.geometry,
      s = this.matrixWorld,
      r = t.params.Line.threshold,
      a = n.drawRange;
    if (
      (n.boundingSphere === null && n.computeBoundingSphere(),
      Rs.copy(n.boundingSphere),
      Rs.applyMatrix4(s),
      (Rs.radius += r),
      t.ray.intersectsSphere(Rs) === !1)
    )
      return;
    (No.copy(s).invert(), Wi.copy(t.ray).applyMatrix4(No));
    const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3),
      l = o * o,
      c = this.isLineSegments ? 2 : 1,
      h = n.index,
      f = n.attributes.position;
    if (h !== null) {
      const p = Math.max(0, a.start),
        _ = Math.min(h.count, a.start + a.count);
      for (let x = p, m = _ - 1; x < m; x += c) {
        const d = h.getX(x),
          b = h.getX(x + 1),
          T = Cs(this, t, Wi, l, d, b, x);
        T && e.push(T);
      }
      if (this.isLineLoop) {
        const x = h.getX(_ - 1),
          m = h.getX(p),
          d = Cs(this, t, Wi, l, x, m, _ - 1);
        d && e.push(d);
      }
    } else {
      const p = Math.max(0, a.start),
        _ = Math.min(f.count, a.start + a.count);
      for (let x = p, m = _ - 1; x < m; x += c) {
        const d = Cs(this, t, Wi, l, x, x + 1, x);
        d && e.push(d);
      }
      if (this.isLineLoop) {
        const x = Cs(this, t, Wi, l, _ - 1, p, _ - 1);
        x && e.push(x);
      }
    }
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes,
      n = Object.keys(e);
    if (n.length > 0) {
      const s = e[n[0]];
      if (s !== void 0) {
        ((this.morphTargetInfluences = []), (this.morphTargetDictionary = {}));
        for (let r = 0, a = s.length; r < a; r++) {
          const o = s[r].name || String(r);
          (this.morphTargetInfluences.push(0),
            (this.morphTargetDictionary[o] = r));
        }
      }
    }
  }
}
function Cs(i, t, e, n, s, r, a) {
  const o = i.geometry.attributes.position;
  if (
    (Xs.fromBufferAttribute(o, s),
    qs.fromBufferAttribute(o, r),
    e.distanceSqToSegment(Xs, qs, Dr, Fo) > n)
  )
    return;
  Dr.applyMatrix4(i.matrixWorld);
  const c = t.ray.origin.distanceTo(Dr);
  if (!(c < t.near || c > t.far))
    return {
      distance: c,
      point: Fo.clone().applyMatrix4(i.matrixWorld),
      index: a,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: i,
    };
}
const Oo = new F(),
  Bo = new F();
class Qd extends Jd {
  constructor(t, e) {
    (super(t, e), (this.isLineSegments = !0), (this.type = "LineSegments"));
  }
  computeLineDistances() {
    const t = this.geometry;
    if (t.index === null) {
      const e = t.attributes.position,
        n = [];
      for (let s = 0, r = e.count; s < r; s += 2)
        (Oo.fromBufferAttribute(e, s),
          Bo.fromBufferAttribute(e, s + 1),
          (n[s] = s === 0 ? 0 : n[s - 1]),
          (n[s + 1] = n[s] + Oo.distanceTo(Bo)));
      t.setAttribute("lineDistance", new _e(n, 1));
    } else
      console.warn(
        "THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.",
      );
    return this;
  }
}
class Xc extends Ae {
  constructor(t, e, n, s, r, a, o, l, c) {
    (super(t, e, n, s, r, a, o, l, c),
      (this.isCanvasTexture = !0),
      (this.needsUpdate = !0));
  }
}
class qc extends Ae {
  constructor(t, e, n = ti, s, r, a, o = Ge, l = Ge, c, h = Zi, u = 1) {
    if (h !== Zi && h !== Ji)
      throw new Error(
        "DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat",
      );
    const f = { width: t, height: e, depth: u };
    (super(f, s, r, a, o, l, h, n, c),
      (this.isDepthTexture = !0),
      (this.flipY = !1),
      (this.generateMipmaps = !1),
      (this.compareFunction = null));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.source = new Ha(Object.assign({}, t.image))),
      (this.compareFunction = t.compareFunction),
      this
    );
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return (
      this.compareFunction !== null &&
        (e.compareFunction = this.compareFunction),
      e
    );
  }
}
class Yc extends Ae {
  constructor(t = null) {
    (super(), (this.sourceTexture = t), (this.isExternalTexture = !0));
  }
  copy(t) {
    return (super.copy(t), (this.sourceTexture = t.sourceTexture), this);
  }
}
class $a extends Ze {
  constructor(t = 1, e = 32, n = 0, s = Math.PI * 2) {
    (super(),
      (this.type = "CircleGeometry"),
      (this.parameters = {
        radius: t,
        segments: e,
        thetaStart: n,
        thetaLength: s,
      }),
      (e = Math.max(3, e)));
    const r = [],
      a = [],
      o = [],
      l = [],
      c = new F(),
      h = new Xt();
    (a.push(0, 0, 0), o.push(0, 0, 1), l.push(0.5, 0.5));
    for (let u = 0, f = 3; u <= e; u++, f += 3) {
      const p = n + (u / e) * s;
      ((c.x = t * Math.cos(p)),
        (c.y = t * Math.sin(p)),
        a.push(c.x, c.y, c.z),
        o.push(0, 0, 1),
        (h.x = (a[f] / t + 1) / 2),
        (h.y = (a[f + 1] / t + 1) / 2),
        l.push(h.x, h.y));
    }
    for (let u = 1; u <= e; u++) r.push(u, u + 1, 0);
    (this.setIndex(r),
      this.setAttribute("position", new _e(a, 3)),
      this.setAttribute("normal", new _e(o, 3)),
      this.setAttribute("uv", new _e(l, 2)));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.parameters = Object.assign({}, t.parameters)),
      this
    );
  }
  static fromJSON(t) {
    return new $a(t.radius, t.segments, t.thetaStart, t.thetaLength);
  }
}
class ss extends Ze {
  constructor(
    t = 1,
    e = 1,
    n = 1,
    s = 32,
    r = 1,
    a = !1,
    o = 0,
    l = Math.PI * 2,
  ) {
    (super(),
      (this.type = "CylinderGeometry"),
      (this.parameters = {
        radiusTop: t,
        radiusBottom: e,
        height: n,
        radialSegments: s,
        heightSegments: r,
        openEnded: a,
        thetaStart: o,
        thetaLength: l,
      }));
    const c = this;
    ((s = Math.floor(s)), (r = Math.floor(r)));
    const h = [],
      u = [],
      f = [],
      p = [];
    let _ = 0;
    const x = [],
      m = n / 2;
    let d = 0;
    (b(),
      a === !1 && (t > 0 && T(!0), e > 0 && T(!1)),
      this.setIndex(h),
      this.setAttribute("position", new _e(u, 3)),
      this.setAttribute("normal", new _e(f, 3)),
      this.setAttribute("uv", new _e(p, 2)));
    function b() {
      const y = new F(),
        R = new F();
      let w = 0;
      const C = (e - t) / n;
      for (let U = 0; U <= r; U++) {
        const S = [],
          M = U / r,
          P = M * (e - t) + t;
        for (let N = 0; N <= s; N++) {
          const B = N / s,
            W = B * l + o,
            G = Math.sin(W),
            X = Math.cos(W);
          ((R.x = P * G),
            (R.y = -M * n + m),
            (R.z = P * X),
            u.push(R.x, R.y, R.z),
            y.set(G, C, X).normalize(),
            f.push(y.x, y.y, y.z),
            p.push(B, 1 - M),
            S.push(_++));
        }
        x.push(S);
      }
      for (let U = 0; U < s; U++)
        for (let S = 0; S < r; S++) {
          const M = x[S][U],
            P = x[S + 1][U],
            N = x[S + 1][U + 1],
            B = x[S][U + 1];
          ((t > 0 || S !== 0) && (h.push(M, P, B), (w += 3)),
            (e > 0 || S !== r - 1) && (h.push(P, N, B), (w += 3)));
        }
      (c.addGroup(d, w, 0), (d += w));
    }
    function T(y) {
      const R = _,
        w = new Xt(),
        C = new F();
      let U = 0;
      const S = y === !0 ? t : e,
        M = y === !0 ? 1 : -1;
      for (let N = 1; N <= s; N++)
        (u.push(0, m * M, 0), f.push(0, M, 0), p.push(0.5, 0.5), _++);
      const P = _;
      for (let N = 0; N <= s; N++) {
        const W = (N / s) * l + o,
          G = Math.cos(W),
          X = Math.sin(W);
        ((C.x = S * X),
          (C.y = m * M),
          (C.z = S * G),
          u.push(C.x, C.y, C.z),
          f.push(0, M, 0),
          (w.x = G * 0.5 + 0.5),
          (w.y = X * 0.5 * M + 0.5),
          p.push(w.x, w.y),
          _++);
      }
      for (let N = 0; N < s; N++) {
        const B = R + N,
          W = P + N;
        (y === !0 ? h.push(W, W + 1, B) : h.push(W + 1, W, B), (U += 3));
      }
      (c.addGroup(d, U, y === !0 ? 1 : 2), (d += U));
    }
  }
  copy(t) {
    return (
      super.copy(t),
      (this.parameters = Object.assign({}, t.parameters)),
      this
    );
  }
  static fromJSON(t) {
    return new ss(
      t.radiusTop,
      t.radiusBottom,
      t.height,
      t.radialSegments,
      t.heightSegments,
      t.openEnded,
      t.thetaStart,
      t.thetaLength,
    );
  }
}
class Ui extends Ze {
  constructor(t = 1, e = 1, n = 1, s = 1) {
    (super(),
      (this.type = "PlaneGeometry"),
      (this.parameters = {
        width: t,
        height: e,
        widthSegments: n,
        heightSegments: s,
      }));
    const r = t / 2,
      a = e / 2,
      o = Math.floor(n),
      l = Math.floor(s),
      c = o + 1,
      h = l + 1,
      u = t / o,
      f = e / l,
      p = [],
      _ = [],
      x = [],
      m = [];
    for (let d = 0; d < h; d++) {
      const b = d * f - a;
      for (let T = 0; T < c; T++) {
        const y = T * u - r;
        (_.push(y, -b, 0), x.push(0, 0, 1), m.push(T / o), m.push(1 - d / l));
      }
    }
    for (let d = 0; d < l; d++)
      for (let b = 0; b < o; b++) {
        const T = b + c * d,
          y = b + c * (d + 1),
          R = b + 1 + c * (d + 1),
          w = b + 1 + c * d;
        (p.push(T, y, w), p.push(y, R, w));
      }
    (this.setIndex(p),
      this.setAttribute("position", new _e(_, 3)),
      this.setAttribute("normal", new _e(x, 3)),
      this.setAttribute("uv", new _e(m, 2)));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.parameters = Object.assign({}, t.parameters)),
      this
    );
  }
  static fromJSON(t) {
    return new Ui(t.width, t.height, t.widthSegments, t.heightSegments);
  }
}
class Qs extends Ze {
  constructor(
    t = 1,
    e = 32,
    n = 16,
    s = 0,
    r = Math.PI * 2,
    a = 0,
    o = Math.PI,
  ) {
    (super(),
      (this.type = "SphereGeometry"),
      (this.parameters = {
        radius: t,
        widthSegments: e,
        heightSegments: n,
        phiStart: s,
        phiLength: r,
        thetaStart: a,
        thetaLength: o,
      }),
      (e = Math.max(3, Math.floor(e))),
      (n = Math.max(2, Math.floor(n))));
    const l = Math.min(a + o, Math.PI);
    let c = 0;
    const h = [],
      u = new F(),
      f = new F(),
      p = [],
      _ = [],
      x = [],
      m = [];
    for (let d = 0; d <= n; d++) {
      const b = [],
        T = d / n;
      let y = 0;
      d === 0 && a === 0
        ? (y = 0.5 / e)
        : d === n && l === Math.PI && (y = -0.5 / e);
      for (let R = 0; R <= e; R++) {
        const w = R / e;
        ((u.x = -t * Math.cos(s + w * r) * Math.sin(a + T * o)),
          (u.y = t * Math.cos(a + T * o)),
          (u.z = t * Math.sin(s + w * r) * Math.sin(a + T * o)),
          _.push(u.x, u.y, u.z),
          f.copy(u).normalize(),
          x.push(f.x, f.y, f.z),
          m.push(w + y, 1 - T),
          b.push(c++));
      }
      h.push(b);
    }
    for (let d = 0; d < n; d++)
      for (let b = 0; b < e; b++) {
        const T = h[d][b + 1],
          y = h[d][b],
          R = h[d + 1][b],
          w = h[d + 1][b + 1];
        ((d !== 0 || a > 0) && p.push(T, y, w),
          (d !== n - 1 || l < Math.PI) && p.push(y, R, w));
      }
    (this.setIndex(p),
      this.setAttribute("position", new _e(_, 3)),
      this.setAttribute("normal", new _e(x, 3)),
      this.setAttribute("uv", new _e(m, 2)));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.parameters = Object.assign({}, t.parameters)),
      this
    );
  }
  static fromJSON(t) {
    return new Qs(
      t.radius,
      t.widthSegments,
      t.heightSegments,
      t.phiStart,
      t.phiLength,
      t.thetaStart,
      t.thetaLength,
    );
  }
}
class Ve extends Li {
  constructor(t) {
    (super(),
      (this.isMeshStandardMaterial = !0),
      (this.type = "MeshStandardMaterial"),
      (this.defines = { STANDARD: "" }),
      (this.color = new Ht(16777215)),
      (this.roughness = 1),
      (this.metalness = 0),
      (this.map = null),
      (this.lightMap = null),
      (this.lightMapIntensity = 1),
      (this.aoMap = null),
      (this.aoMapIntensity = 1),
      (this.emissive = new Ht(0)),
      (this.emissiveIntensity = 1),
      (this.emissiveMap = null),
      (this.bumpMap = null),
      (this.bumpScale = 1),
      (this.normalMap = null),
      (this.normalMapType = Ic),
      (this.normalScale = new Xt(1, 1)),
      (this.displacementMap = null),
      (this.displacementScale = 1),
      (this.displacementBias = 0),
      (this.roughnessMap = null),
      (this.metalnessMap = null),
      (this.alphaMap = null),
      (this.envMap = null),
      (this.envMapRotation = new fn()),
      (this.envMapIntensity = 1),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      (this.wireframeLinecap = "round"),
      (this.wireframeLinejoin = "round"),
      (this.flatShading = !1),
      (this.fog = !0),
      this.setValues(t));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.defines = { STANDARD: "" }),
      this.color.copy(t.color),
      (this.roughness = t.roughness),
      (this.metalness = t.metalness),
      (this.map = t.map),
      (this.lightMap = t.lightMap),
      (this.lightMapIntensity = t.lightMapIntensity),
      (this.aoMap = t.aoMap),
      (this.aoMapIntensity = t.aoMapIntensity),
      this.emissive.copy(t.emissive),
      (this.emissiveMap = t.emissiveMap),
      (this.emissiveIntensity = t.emissiveIntensity),
      (this.bumpMap = t.bumpMap),
      (this.bumpScale = t.bumpScale),
      (this.normalMap = t.normalMap),
      (this.normalMapType = t.normalMapType),
      this.normalScale.copy(t.normalScale),
      (this.displacementMap = t.displacementMap),
      (this.displacementScale = t.displacementScale),
      (this.displacementBias = t.displacementBias),
      (this.roughnessMap = t.roughnessMap),
      (this.metalnessMap = t.metalnessMap),
      (this.alphaMap = t.alphaMap),
      (this.envMap = t.envMap),
      this.envMapRotation.copy(t.envMapRotation),
      (this.envMapIntensity = t.envMapIntensity),
      (this.wireframe = t.wireframe),
      (this.wireframeLinewidth = t.wireframeLinewidth),
      (this.wireframeLinecap = t.wireframeLinecap),
      (this.wireframeLinejoin = t.wireframeLinejoin),
      (this.flatShading = t.flatShading),
      (this.fog = t.fog),
      this
    );
  }
}
class th extends Li {
  constructor(t) {
    (super(),
      (this.isMeshDepthMaterial = !0),
      (this.type = "MeshDepthMaterial"),
      (this.depthPacking = cd),
      (this.map = null),
      (this.alphaMap = null),
      (this.displacementMap = null),
      (this.displacementScale = 1),
      (this.displacementBias = 0),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      this.setValues(t));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.depthPacking = t.depthPacking),
      (this.map = t.map),
      (this.alphaMap = t.alphaMap),
      (this.displacementMap = t.displacementMap),
      (this.displacementScale = t.displacementScale),
      (this.displacementBias = t.displacementBias),
      (this.wireframe = t.wireframe),
      (this.wireframeLinewidth = t.wireframeLinewidth),
      this
    );
  }
}
class eh extends Li {
  constructor(t) {
    (super(),
      (this.isMeshDistanceMaterial = !0),
      (this.type = "MeshDistanceMaterial"),
      (this.map = null),
      (this.alphaMap = null),
      (this.displacementMap = null),
      (this.displacementScale = 1),
      (this.displacementBias = 0),
      this.setValues(t));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.map = t.map),
      (this.alphaMap = t.alphaMap),
      (this.displacementMap = t.displacementMap),
      (this.displacementScale = t.displacementScale),
      (this.displacementBias = t.displacementBias),
      this
    );
  }
}
class jc extends ge {
  constructor(t, e = 1) {
    (super(),
      (this.isLight = !0),
      (this.type = "Light"),
      (this.color = new Ht(t)),
      (this.intensity = e));
  }
  dispose() {}
  copy(t, e) {
    return (
      super.copy(t, e),
      this.color.copy(t.color),
      (this.intensity = t.intensity),
      this
    );
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return (
      (e.object.color = this.color.getHex()),
      (e.object.intensity = this.intensity),
      this.groundColor !== void 0 &&
        (e.object.groundColor = this.groundColor.getHex()),
      this.distance !== void 0 && (e.object.distance = this.distance),
      this.angle !== void 0 && (e.object.angle = this.angle),
      this.decay !== void 0 && (e.object.decay = this.decay),
      this.penumbra !== void 0 && (e.object.penumbra = this.penumbra),
      this.shadow !== void 0 && (e.object.shadow = this.shadow.toJSON()),
      this.target !== void 0 && (e.object.target = this.target.uuid),
      e
    );
  }
}
class nh extends jc {
  constructor(t, e, n) {
    (super(t, n),
      (this.isHemisphereLight = !0),
      (this.type = "HemisphereLight"),
      this.position.copy(ge.DEFAULT_UP),
      this.updateMatrix(),
      (this.groundColor = new Ht(e)));
  }
  copy(t, e) {
    return (super.copy(t, e), this.groundColor.copy(t.groundColor), this);
  }
}
const Lr = new re(),
  ko = new F(),
  zo = new F();
class ih {
  constructor(t) {
    ((this.camera = t),
      (this.intensity = 1),
      (this.bias = 0),
      (this.normalBias = 0),
      (this.radius = 1),
      (this.blurSamples = 8),
      (this.mapSize = new Xt(512, 512)),
      (this.mapType = un),
      (this.map = null),
      (this.mapPass = null),
      (this.matrix = new re()),
      (this.autoUpdate = !0),
      (this.needsUpdate = !1),
      (this._frustum = new Wa()),
      (this._frameExtents = new Xt(1, 1)),
      (this._viewportCount = 1),
      (this._viewports = [new ue(0, 0, 1, 1)]));
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(t) {
    const e = this.camera,
      n = this.matrix;
    (ko.setFromMatrixPosition(t.matrixWorld),
      e.position.copy(ko),
      zo.setFromMatrixPosition(t.target.matrixWorld),
      e.lookAt(zo),
      e.updateMatrixWorld(),
      Lr.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse),
      this._frustum.setFromProjectionMatrix(
        Lr,
        e.coordinateSystem,
        e.reversedDepth,
      ),
      e.reversedDepth
        ? n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 1, 0, 0, 0, 0, 1)
        : n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1),
      n.multiply(Lr));
  }
  getViewport(t) {
    return this._viewports[t];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    (this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose());
  }
  copy(t) {
    return (
      (this.camera = t.camera.clone()),
      (this.intensity = t.intensity),
      (this.bias = t.bias),
      (this.radius = t.radius),
      (this.autoUpdate = t.autoUpdate),
      (this.needsUpdate = t.needsUpdate),
      (this.normalBias = t.normalBias),
      (this.blurSamples = t.blurSamples),
      this.mapSize.copy(t.mapSize),
      this
    );
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const t = {};
    return (
      this.intensity !== 1 && (t.intensity = this.intensity),
      this.bias !== 0 && (t.bias = this.bias),
      this.normalBias !== 0 && (t.normalBias = this.normalBias),
      this.radius !== 1 && (t.radius = this.radius),
      (this.mapSize.x !== 512 || this.mapSize.y !== 512) &&
        (t.mapSize = this.mapSize.toArray()),
      (t.camera = this.camera.toJSON(!1).object),
      delete t.camera.matrix,
      t
    );
  }
}
class Kc extends Gc {
  constructor(t = -1, e = 1, n = 1, s = -1, r = 0.1, a = 2e3) {
    (super(),
      (this.isOrthographicCamera = !0),
      (this.type = "OrthographicCamera"),
      (this.zoom = 1),
      (this.view = null),
      (this.left = t),
      (this.right = e),
      (this.top = n),
      (this.bottom = s),
      (this.near = r),
      (this.far = a),
      this.updateProjectionMatrix());
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      (this.left = t.left),
      (this.right = t.right),
      (this.top = t.top),
      (this.bottom = t.bottom),
      (this.near = t.near),
      (this.far = t.far),
      (this.zoom = t.zoom),
      (this.view = t.view === null ? null : Object.assign({}, t.view)),
      this
    );
  }
  setViewOffset(t, e, n, s, r, a) {
    (this.view === null &&
      (this.view = {
        enabled: !0,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1,
      }),
      (this.view.enabled = !0),
      (this.view.fullWidth = t),
      (this.view.fullHeight = e),
      (this.view.offsetX = n),
      (this.view.offsetY = s),
      (this.view.width = r),
      (this.view.height = a),
      this.updateProjectionMatrix());
  }
  clearViewOffset() {
    (this.view !== null && (this.view.enabled = !1),
      this.updateProjectionMatrix());
  }
  updateProjectionMatrix() {
    const t = (this.right - this.left) / (2 * this.zoom),
      e = (this.top - this.bottom) / (2 * this.zoom),
      n = (this.right + this.left) / 2,
      s = (this.top + this.bottom) / 2;
    let r = n - t,
      a = n + t,
      o = s + e,
      l = s - e;
    if (this.view !== null && this.view.enabled) {
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom,
        h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      ((r += c * this.view.offsetX),
        (a = r + c * this.view.width),
        (o -= h * this.view.offsetY),
        (l = o - h * this.view.height));
    }
    (this.projectionMatrix.makeOrthographic(
      r,
      a,
      o,
      l,
      this.near,
      this.far,
      this.coordinateSystem,
      this.reversedDepth,
    ),
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert());
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return (
      (e.object.zoom = this.zoom),
      (e.object.left = this.left),
      (e.object.right = this.right),
      (e.object.top = this.top),
      (e.object.bottom = this.bottom),
      (e.object.near = this.near),
      (e.object.far = this.far),
      this.view !== null && (e.object.view = Object.assign({}, this.view)),
      e
    );
  }
}
class sh extends ih {
  constructor() {
    (super(new Kc(-5, 5, 5, -5, 0.5, 500)),
      (this.isDirectionalLightShadow = !0));
  }
}
class Ho extends jc {
  constructor(t, e) {
    (super(t, e),
      (this.isDirectionalLight = !0),
      (this.type = "DirectionalLight"),
      this.position.copy(ge.DEFAULT_UP),
      this.updateMatrix(),
      (this.target = new ge()),
      (this.shadow = new sh()));
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(t) {
    return (
      super.copy(t),
      (this.target = t.target.clone()),
      (this.shadow = t.shadow.clone()),
      this
    );
  }
}
class rh extends je {
  constructor(t = []) {
    (super(),
      (this.isArrayCamera = !0),
      (this.isMultiViewCamera = !1),
      (this.cameras = t));
  }
}
function Vo(i, t, e, n) {
  const s = ah(n);
  switch (e) {
    case Pc:
      return i * t;
    case Oa:
      return ((i * t) / s.components) * s.byteLength;
    case Ba:
      return ((i * t) / s.components) * s.byteLength;
    case Lc:
      return ((i * t * 2) / s.components) * s.byteLength;
    case ka:
      return ((i * t * 2) / s.components) * s.byteLength;
    case Dc:
      return ((i * t * 3) / s.components) * s.byteLength;
    case sn:
      return ((i * t * 4) / s.components) * s.byteLength;
    case za:
      return ((i * t * 4) / s.components) * s.byteLength;
    case Us:
    case Ns:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Fs:
    case Os:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case na:
    case sa:
      return (Math.max(i, 16) * Math.max(t, 8)) / 4;
    case ea:
    case ia:
      return (Math.max(i, 8) * Math.max(t, 8)) / 2;
    case ra:
    case aa:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case oa:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case ca:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case la:
      return Math.floor((i + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case da:
      return Math.floor((i + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case ha:
      return Math.floor((i + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case ua:
      return Math.floor((i + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case fa:
      return Math.floor((i + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case pa:
      return Math.floor((i + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case ma:
      return Math.floor((i + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case ga:
      return Math.floor((i + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case _a:
      return Math.floor((i + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case va:
      return Math.floor((i + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case xa:
      return Math.floor((i + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case Ma:
      return Math.floor((i + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case Sa:
      return Math.floor((i + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    case ya:
    case Ea:
    case ba:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
    case Ta:
    case Aa:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 8;
    case wa:
    case Ra:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(`Unable to determine texture byte length for ${e} format.`);
}
function ah(i) {
  switch (i) {
    case un:
    case Ac:
      return { byteLength: 1, components: 1 };
    case ji:
    case wc:
    case ns:
      return { byteLength: 2, components: 1 };
    case Na:
    case Fa:
      return { byteLength: 2, components: 4 };
    case ti:
    case Ua:
    case ln:
      return { byteLength: 4, components: 1 };
    case Rc:
    case Cc:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${i}.`);
}
typeof __THREE_DEVTOOLS__ < "u" &&
  __THREE_DEVTOOLS__.dispatchEvent(
    new CustomEvent("register", { detail: { revision: Ia } }),
  );
typeof window < "u" &&
  (window.__THREE__
    ? console.warn("WARNING: Multiple instances of Three.js being imported.")
    : (window.__THREE__ = Ia));
/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */ function Zc() {
  let i = null,
    t = !1,
    e = null,
    n = null;
  function s(r, a) {
    (e(r, a), (n = i.requestAnimationFrame(s)));
  }
  return {
    start: function () {
      t !== !0 && e !== null && ((n = i.requestAnimationFrame(s)), (t = !0));
    },
    stop: function () {
      (i.cancelAnimationFrame(n), (t = !1));
    },
    setAnimationLoop: function (r) {
      e = r;
    },
    setContext: function (r) {
      i = r;
    },
  };
}
function oh(i) {
  const t = new WeakMap();
  function e(o, l) {
    const c = o.array,
      h = o.usage,
      u = c.byteLength,
      f = i.createBuffer();
    (i.bindBuffer(l, f), i.bufferData(l, c, h), o.onUploadCallback());
    let p;
    if (c instanceof Float32Array) p = i.FLOAT;
    else if (typeof Float16Array < "u" && c instanceof Float16Array)
      p = i.HALF_FLOAT;
    else if (c instanceof Uint16Array)
      o.isFloat16BufferAttribute ? (p = i.HALF_FLOAT) : (p = i.UNSIGNED_SHORT);
    else if (c instanceof Int16Array) p = i.SHORT;
    else if (c instanceof Uint32Array) p = i.UNSIGNED_INT;
    else if (c instanceof Int32Array) p = i.INT;
    else if (c instanceof Int8Array) p = i.BYTE;
    else if (c instanceof Uint8Array) p = i.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray) p = i.UNSIGNED_BYTE;
    else
      throw new Error(
        "THREE.WebGLAttributes: Unsupported buffer data format: " + c,
      );
    return {
      buffer: f,
      type: p,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: o.version,
      size: u,
    };
  }
  function n(o, l, c) {
    const h = l.array,
      u = l.updateRanges;
    if ((i.bindBuffer(c, o), u.length === 0)) i.bufferSubData(c, 0, h);
    else {
      u.sort((p, _) => p.start - _.start);
      let f = 0;
      for (let p = 1; p < u.length; p++) {
        const _ = u[f],
          x = u[p];
        x.start <= _.start + _.count + 1
          ? (_.count = Math.max(_.count, x.start + x.count - _.start))
          : (++f, (u[f] = x));
      }
      u.length = f + 1;
      for (let p = 0, _ = u.length; p < _; p++) {
        const x = u[p];
        i.bufferSubData(c, x.start * h.BYTES_PER_ELEMENT, h, x.start, x.count);
      }
      l.clearUpdateRanges();
    }
    l.onUploadCallback();
  }
  function s(o) {
    return (o.isInterleavedBufferAttribute && (o = o.data), t.get(o));
  }
  function r(o) {
    o.isInterleavedBufferAttribute && (o = o.data);
    const l = t.get(o);
    l && (i.deleteBuffer(l.buffer), t.delete(o));
  }
  function a(o, l) {
    if (
      (o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute)
    ) {
      const h = t.get(o);
      (!h || h.version < o.version) &&
        t.set(o, {
          buffer: o.buffer,
          type: o.type,
          bytesPerElement: o.elementSize,
          version: o.version,
        });
      return;
    }
    const c = t.get(o);
    if (c === void 0) t.set(o, e(o, l));
    else if (c.version < o.version) {
      if (c.size !== o.array.byteLength)
        throw new Error(
          "THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.",
        );
      (n(c.buffer, o, l), (c.version = o.version));
    }
  }
  return { get: s, remove: r, update: a };
}
var ch = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,
  lh = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,
  dh = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,
  hh = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  uh = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,
  fh = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,
  ph = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,
  mh = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,
  gh = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,
  _h = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,
  vh = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,
  xh = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,
  Mh = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,
  Sh = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,
  yh = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,
  Eh = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,
  bh = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,
  Th = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,
  Ah = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,
  wh = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,
  Rh = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,
  Ch = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,
  Ph = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,
  Dh = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,
  Lh = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,
  Ih = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,
  Uh = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,
  Nh = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,
  Fh = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,
  Oh = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,
  Bh = "gl_FragColor = linearToOutputTexel( gl_FragColor );",
  kh = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,
  zh = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,
  Hh = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,
  Vh = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,
  Gh = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,
  Wh = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,
  $h = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,
  Xh = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`,
  qh = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,
  Yh = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,
  jh = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,
  Kh = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,
  Zh = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,
  Jh = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,
  Qh = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,
  tu = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,
  eu = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,
  nu = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,
  iu = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,
  su = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,
  ru = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,
  au = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,
  ou = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,
  cu = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,
  lu = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,
  du = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,
  hu = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  uu = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  fu = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,
  pu = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,
  mu = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`,
  gu = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,
  _u = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  vu = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,
  xu = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,
  Mu = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,
  Su = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,
  yu = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  Eu = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,
  bu = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  Tu = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,
  Au = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,
  wu = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  Ru = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  Cu = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,
  Pu = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,
  Du = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,
  Lu = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,
  Iu = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,
  Uu = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,
  Nu = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
  Fu = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,
  Ou = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,
  Bu = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
  ku = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,
  zu = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,
  Hu = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,
  Vu = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,
  Gu = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,
  Wu = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,
  $u = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,
  Xu = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,
  qu = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,
  Yu = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,
  ju = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,
  Ku = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,
  Zu = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,
  Ju = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,
  Qu = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,
  tf = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,
  ef = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,
  nf = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,
  sf = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  rf = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  af = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,
  of = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const cf = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,
  lf = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  df = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  hf = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  uf = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  ff = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  pf = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,
  mf = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,
  gf = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,
  _f = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,
  vf = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,
  xf = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  Mf = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  Sf = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  yf = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,
  Ef = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  bf = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Tf = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Af = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,
  wf = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Rf = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,
  Cf = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,
  Pf = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Df = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Lf = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,
  If = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Uf = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Nf = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Ff = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,
  Of = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  Bf = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  kf = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
  zf = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  Hf = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
  Bt = {
    alphahash_fragment: ch,
    alphahash_pars_fragment: lh,
    alphamap_fragment: dh,
    alphamap_pars_fragment: hh,
    alphatest_fragment: uh,
    alphatest_pars_fragment: fh,
    aomap_fragment: ph,
    aomap_pars_fragment: mh,
    batching_pars_vertex: gh,
    batching_vertex: _h,
    begin_vertex: vh,
    beginnormal_vertex: xh,
    bsdfs: Mh,
    iridescence_fragment: Sh,
    bumpmap_pars_fragment: yh,
    clipping_planes_fragment: Eh,
    clipping_planes_pars_fragment: bh,
    clipping_planes_pars_vertex: Th,
    clipping_planes_vertex: Ah,
    color_fragment: wh,
    color_pars_fragment: Rh,
    color_pars_vertex: Ch,
    color_vertex: Ph,
    common: Dh,
    cube_uv_reflection_fragment: Lh,
    defaultnormal_vertex: Ih,
    displacementmap_pars_vertex: Uh,
    displacementmap_vertex: Nh,
    emissivemap_fragment: Fh,
    emissivemap_pars_fragment: Oh,
    colorspace_fragment: Bh,
    colorspace_pars_fragment: kh,
    envmap_fragment: zh,
    envmap_common_pars_fragment: Hh,
    envmap_pars_fragment: Vh,
    envmap_pars_vertex: Gh,
    envmap_physical_pars_fragment: tu,
    envmap_vertex: Wh,
    fog_vertex: $h,
    fog_pars_vertex: Xh,
    fog_fragment: qh,
    fog_pars_fragment: Yh,
    gradientmap_pars_fragment: jh,
    lightmap_pars_fragment: Kh,
    lights_lambert_fragment: Zh,
    lights_lambert_pars_fragment: Jh,
    lights_pars_begin: Qh,
    lights_toon_fragment: eu,
    lights_toon_pars_fragment: nu,
    lights_phong_fragment: iu,
    lights_phong_pars_fragment: su,
    lights_physical_fragment: ru,
    lights_physical_pars_fragment: au,
    lights_fragment_begin: ou,
    lights_fragment_maps: cu,
    lights_fragment_end: lu,
    logdepthbuf_fragment: du,
    logdepthbuf_pars_fragment: hu,
    logdepthbuf_pars_vertex: uu,
    logdepthbuf_vertex: fu,
    map_fragment: pu,
    map_pars_fragment: mu,
    map_particle_fragment: gu,
    map_particle_pars_fragment: _u,
    metalnessmap_fragment: vu,
    metalnessmap_pars_fragment: xu,
    morphinstance_vertex: Mu,
    morphcolor_vertex: Su,
    morphnormal_vertex: yu,
    morphtarget_pars_vertex: Eu,
    morphtarget_vertex: bu,
    normal_fragment_begin: Tu,
    normal_fragment_maps: Au,
    normal_pars_fragment: wu,
    normal_pars_vertex: Ru,
    normal_vertex: Cu,
    normalmap_pars_fragment: Pu,
    clearcoat_normal_fragment_begin: Du,
    clearcoat_normal_fragment_maps: Lu,
    clearcoat_pars_fragment: Iu,
    iridescence_pars_fragment: Uu,
    opaque_fragment: Nu,
    packing: Fu,
    premultiplied_alpha_fragment: Ou,
    project_vertex: Bu,
    dithering_fragment: ku,
    dithering_pars_fragment: zu,
    roughnessmap_fragment: Hu,
    roughnessmap_pars_fragment: Vu,
    shadowmap_pars_fragment: Gu,
    shadowmap_pars_vertex: Wu,
    shadowmap_vertex: $u,
    shadowmask_pars_fragment: Xu,
    skinbase_vertex: qu,
    skinning_pars_vertex: Yu,
    skinning_vertex: ju,
    skinnormal_vertex: Ku,
    specularmap_fragment: Zu,
    specularmap_pars_fragment: Ju,
    tonemapping_fragment: Qu,
    tonemapping_pars_fragment: tf,
    transmission_fragment: ef,
    transmission_pars_fragment: nf,
    uv_pars_fragment: sf,
    uv_pars_vertex: rf,
    uv_vertex: af,
    worldpos_vertex: of,
    background_vert: cf,
    background_frag: lf,
    backgroundCube_vert: df,
    backgroundCube_frag: hf,
    cube_vert: uf,
    cube_frag: ff,
    depth_vert: pf,
    depth_frag: mf,
    distanceRGBA_vert: gf,
    distanceRGBA_frag: _f,
    equirect_vert: vf,
    equirect_frag: xf,
    linedashed_vert: Mf,
    linedashed_frag: Sf,
    meshbasic_vert: yf,
    meshbasic_frag: Ef,
    meshlambert_vert: bf,
    meshlambert_frag: Tf,
    meshmatcap_vert: Af,
    meshmatcap_frag: wf,
    meshnormal_vert: Rf,
    meshnormal_frag: Cf,
    meshphong_vert: Pf,
    meshphong_frag: Df,
    meshphysical_vert: Lf,
    meshphysical_frag: If,
    meshtoon_vert: Uf,
    meshtoon_frag: Nf,
    points_vert: Ff,
    points_frag: Of,
    shadow_vert: Bf,
    shadow_frag: kf,
    sprite_vert: zf,
    sprite_frag: Hf,
  },
  st = {
    common: {
      diffuse: { value: new Ht(16777215) },
      opacity: { value: 1 },
      map: { value: null },
      mapTransform: { value: new Ft() },
      alphaMap: { value: null },
      alphaMapTransform: { value: new Ft() },
      alphaTest: { value: 0 },
    },
    specularmap: {
      specularMap: { value: null },
      specularMapTransform: { value: new Ft() },
    },
    envmap: {
      envMap: { value: null },
      envMapRotation: { value: new Ft() },
      flipEnvMap: { value: -1 },
      reflectivity: { value: 1 },
      ior: { value: 1.5 },
      refractionRatio: { value: 0.98 },
    },
    aomap: {
      aoMap: { value: null },
      aoMapIntensity: { value: 1 },
      aoMapTransform: { value: new Ft() },
    },
    lightmap: {
      lightMap: { value: null },
      lightMapIntensity: { value: 1 },
      lightMapTransform: { value: new Ft() },
    },
    bumpmap: {
      bumpMap: { value: null },
      bumpMapTransform: { value: new Ft() },
      bumpScale: { value: 1 },
    },
    normalmap: {
      normalMap: { value: null },
      normalMapTransform: { value: new Ft() },
      normalScale: { value: new Xt(1, 1) },
    },
    displacementmap: {
      displacementMap: { value: null },
      displacementMapTransform: { value: new Ft() },
      displacementScale: { value: 1 },
      displacementBias: { value: 0 },
    },
    emissivemap: {
      emissiveMap: { value: null },
      emissiveMapTransform: { value: new Ft() },
    },
    metalnessmap: {
      metalnessMap: { value: null },
      metalnessMapTransform: { value: new Ft() },
    },
    roughnessmap: {
      roughnessMap: { value: null },
      roughnessMapTransform: { value: new Ft() },
    },
    gradientmap: { gradientMap: { value: null } },
    fog: {
      fogDensity: { value: 25e-5 },
      fogNear: { value: 1 },
      fogFar: { value: 2e3 },
      fogColor: { value: new Ht(16777215) },
    },
    lights: {
      ambientLightColor: { value: [] },
      lightProbe: { value: [] },
      directionalLights: {
        value: [],
        properties: { direction: {}, color: {} },
      },
      directionalLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
        },
      },
      directionalShadowMap: { value: [] },
      directionalShadowMatrix: { value: [] },
      spotLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          direction: {},
          distance: {},
          coneCos: {},
          penumbraCos: {},
          decay: {},
        },
      },
      spotLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
        },
      },
      spotLightMap: { value: [] },
      spotShadowMap: { value: [] },
      spotLightMatrix: { value: [] },
      pointLights: {
        value: [],
        properties: { color: {}, position: {}, decay: {}, distance: {} },
      },
      pointLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
          shadowCameraNear: {},
          shadowCameraFar: {},
        },
      },
      pointShadowMap: { value: [] },
      pointShadowMatrix: { value: [] },
      hemisphereLights: {
        value: [],
        properties: { direction: {}, skyColor: {}, groundColor: {} },
      },
      rectAreaLights: {
        value: [],
        properties: { color: {}, position: {}, width: {}, height: {} },
      },
      ltc_1: { value: null },
      ltc_2: { value: null },
    },
    points: {
      diffuse: { value: new Ht(16777215) },
      opacity: { value: 1 },
      size: { value: 1 },
      scale: { value: 1 },
      map: { value: null },
      alphaMap: { value: null },
      alphaMapTransform: { value: new Ft() },
      alphaTest: { value: 0 },
      uvTransform: { value: new Ft() },
    },
    sprite: {
      diffuse: { value: new Ht(16777215) },
      opacity: { value: 1 },
      center: { value: new Xt(0.5, 0.5) },
      rotation: { value: 0 },
      map: { value: null },
      mapTransform: { value: new Ft() },
      alphaMap: { value: null },
      alphaMapTransform: { value: new Ft() },
      alphaTest: { value: 0 },
    },
  },
  on = {
    basic: {
      uniforms: Re([
        st.common,
        st.specularmap,
        st.envmap,
        st.aomap,
        st.lightmap,
        st.fog,
      ]),
      vertexShader: Bt.meshbasic_vert,
      fragmentShader: Bt.meshbasic_frag,
    },
    lambert: {
      uniforms: Re([
        st.common,
        st.specularmap,
        st.envmap,
        st.aomap,
        st.lightmap,
        st.emissivemap,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        st.fog,
        st.lights,
        { emissive: { value: new Ht(0) } },
      ]),
      vertexShader: Bt.meshlambert_vert,
      fragmentShader: Bt.meshlambert_frag,
    },
    phong: {
      uniforms: Re([
        st.common,
        st.specularmap,
        st.envmap,
        st.aomap,
        st.lightmap,
        st.emissivemap,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        st.fog,
        st.lights,
        {
          emissive: { value: new Ht(0) },
          specular: { value: new Ht(1118481) },
          shininess: { value: 30 },
        },
      ]),
      vertexShader: Bt.meshphong_vert,
      fragmentShader: Bt.meshphong_frag,
    },
    standard: {
      uniforms: Re([
        st.common,
        st.envmap,
        st.aomap,
        st.lightmap,
        st.emissivemap,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        st.roughnessmap,
        st.metalnessmap,
        st.fog,
        st.lights,
        {
          emissive: { value: new Ht(0) },
          roughness: { value: 1 },
          metalness: { value: 0 },
          envMapIntensity: { value: 1 },
        },
      ]),
      vertexShader: Bt.meshphysical_vert,
      fragmentShader: Bt.meshphysical_frag,
    },
    toon: {
      uniforms: Re([
        st.common,
        st.aomap,
        st.lightmap,
        st.emissivemap,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        st.gradientmap,
        st.fog,
        st.lights,
        { emissive: { value: new Ht(0) } },
      ]),
      vertexShader: Bt.meshtoon_vert,
      fragmentShader: Bt.meshtoon_frag,
    },
    matcap: {
      uniforms: Re([
        st.common,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        st.fog,
        { matcap: { value: null } },
      ]),
      vertexShader: Bt.meshmatcap_vert,
      fragmentShader: Bt.meshmatcap_frag,
    },
    points: {
      uniforms: Re([st.points, st.fog]),
      vertexShader: Bt.points_vert,
      fragmentShader: Bt.points_frag,
    },
    dashed: {
      uniforms: Re([
        st.common,
        st.fog,
        {
          scale: { value: 1 },
          dashSize: { value: 1 },
          totalSize: { value: 2 },
        },
      ]),
      vertexShader: Bt.linedashed_vert,
      fragmentShader: Bt.linedashed_frag,
    },
    depth: {
      uniforms: Re([st.common, st.displacementmap]),
      vertexShader: Bt.depth_vert,
      fragmentShader: Bt.depth_frag,
    },
    normal: {
      uniforms: Re([
        st.common,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        { opacity: { value: 1 } },
      ]),
      vertexShader: Bt.meshnormal_vert,
      fragmentShader: Bt.meshnormal_frag,
    },
    sprite: {
      uniforms: Re([st.sprite, st.fog]),
      vertexShader: Bt.sprite_vert,
      fragmentShader: Bt.sprite_frag,
    },
    background: {
      uniforms: {
        uvTransform: { value: new Ft() },
        t2D: { value: null },
        backgroundIntensity: { value: 1 },
      },
      vertexShader: Bt.background_vert,
      fragmentShader: Bt.background_frag,
    },
    backgroundCube: {
      uniforms: {
        envMap: { value: null },
        flipEnvMap: { value: -1 },
        backgroundBlurriness: { value: 0 },
        backgroundIntensity: { value: 1 },
        backgroundRotation: { value: new Ft() },
      },
      vertexShader: Bt.backgroundCube_vert,
      fragmentShader: Bt.backgroundCube_frag,
    },
    cube: {
      uniforms: {
        tCube: { value: null },
        tFlip: { value: -1 },
        opacity: { value: 1 },
      },
      vertexShader: Bt.cube_vert,
      fragmentShader: Bt.cube_frag,
    },
    equirect: {
      uniforms: { tEquirect: { value: null } },
      vertexShader: Bt.equirect_vert,
      fragmentShader: Bt.equirect_frag,
    },
    distanceRGBA: {
      uniforms: Re([
        st.common,
        st.displacementmap,
        {
          referencePosition: { value: new F() },
          nearDistance: { value: 1 },
          farDistance: { value: 1e3 },
        },
      ]),
      vertexShader: Bt.distanceRGBA_vert,
      fragmentShader: Bt.distanceRGBA_frag,
    },
    shadow: {
      uniforms: Re([
        st.lights,
        st.fog,
        { color: { value: new Ht(0) }, opacity: { value: 1 } },
      ]),
      vertexShader: Bt.shadow_vert,
      fragmentShader: Bt.shadow_frag,
    },
  };
on.physical = {
  uniforms: Re([
    on.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: new Ft() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: new Ft() },
      clearcoatNormalScale: { value: new Xt(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: new Ft() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: new Ft() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: new Ft() },
      sheen: { value: 0 },
      sheenColor: { value: new Ht(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: new Ft() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: new Ft() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: new Ft() },
      transmissionSamplerSize: { value: new Xt() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: new Ft() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: new Ht(0) },
      specularColor: { value: new Ht(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: new Ft() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: new Ft() },
      anisotropyVector: { value: new Xt() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: new Ft() },
    },
  ]),
  vertexShader: Bt.meshphysical_vert,
  fragmentShader: Bt.meshphysical_frag,
};
const Ps = { r: 0, b: 0, g: 0 },
  Vn = new fn(),
  Vf = new re();
function Gf(i, t, e, n, s, r, a) {
  const o = new Ht(0);
  let l = r === !0 ? 0 : 1,
    c,
    h,
    u = null,
    f = 0,
    p = null;
  function _(T) {
    let y = T.isScene === !0 ? T.background : null;
    return (
      y && y.isTexture && (y = (T.backgroundBlurriness > 0 ? e : t).get(y)),
      y
    );
  }
  function x(T) {
    let y = !1;
    const R = _(T);
    R === null ? d(o, l) : R && R.isColor && (d(R, 1), (y = !0));
    const w = i.xr.getEnvironmentBlendMode();
    (w === "additive"
      ? n.buffers.color.setClear(0, 0, 0, 1, a)
      : w === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a),
      (i.autoClear || y) &&
        (n.buffers.depth.setTest(!0),
        n.buffers.depth.setMask(!0),
        n.buffers.color.setMask(!0),
        i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil)));
  }
  function m(T, y) {
    const R = _(y);
    R && (R.isCubeTexture || R.mapping === Js)
      ? (h === void 0 &&
          ((h = new me(
            new Ii(1, 1, 1),
            new Nn({
              name: "BackgroundCubeMaterial",
              uniforms: wi(on.backgroundCube.uniforms),
              vertexShader: on.backgroundCube.vertexShader,
              fragmentShader: on.backgroundCube.fragmentShader,
              side: Ne,
              depthTest: !1,
              depthWrite: !1,
              fog: !1,
              allowOverride: !1,
            }),
          )),
          h.geometry.deleteAttribute("normal"),
          h.geometry.deleteAttribute("uv"),
          (h.onBeforeRender = function (w, C, U) {
            this.matrixWorld.copyPosition(U.matrixWorld);
          }),
          Object.defineProperty(h.material, "envMap", {
            get: function () {
              return this.uniforms.envMap.value;
            },
          }),
          s.update(h)),
        Vn.copy(y.backgroundRotation),
        (Vn.x *= -1),
        (Vn.y *= -1),
        (Vn.z *= -1),
        R.isCubeTexture &&
          R.isRenderTargetTexture === !1 &&
          ((Vn.y *= -1), (Vn.z *= -1)),
        (h.material.uniforms.envMap.value = R),
        (h.material.uniforms.flipEnvMap.value =
          R.isCubeTexture && R.isRenderTargetTexture === !1 ? -1 : 1),
        (h.material.uniforms.backgroundBlurriness.value =
          y.backgroundBlurriness),
        (h.material.uniforms.backgroundIntensity.value = y.backgroundIntensity),
        h.material.uniforms.backgroundRotation.value.setFromMatrix4(
          Vf.makeRotationFromEuler(Vn),
        ),
        (h.material.toneMapped = Yt.getTransfer(R.colorSpace) !== Qt),
        (u !== R || f !== R.version || p !== i.toneMapping) &&
          ((h.material.needsUpdate = !0),
          (u = R),
          (f = R.version),
          (p = i.toneMapping)),
        h.layers.enableAll(),
        T.unshift(h, h.geometry, h.material, 0, 0, null))
      : R &&
        R.isTexture &&
        (c === void 0 &&
          ((c = new me(
            new Ui(2, 2),
            new Nn({
              name: "BackgroundMaterial",
              uniforms: wi(on.background.uniforms),
              vertexShader: on.background.vertexShader,
              fragmentShader: on.background.fragmentShader,
              side: Un,
              depthTest: !1,
              depthWrite: !1,
              fog: !1,
              allowOverride: !1,
            }),
          )),
          c.geometry.deleteAttribute("normal"),
          Object.defineProperty(c.material, "map", {
            get: function () {
              return this.uniforms.t2D.value;
            },
          }),
          s.update(c)),
        (c.material.uniforms.t2D.value = R),
        (c.material.uniforms.backgroundIntensity.value = y.backgroundIntensity),
        (c.material.toneMapped = Yt.getTransfer(R.colorSpace) !== Qt),
        R.matrixAutoUpdate === !0 && R.updateMatrix(),
        c.material.uniforms.uvTransform.value.copy(R.matrix),
        (u !== R || f !== R.version || p !== i.toneMapping) &&
          ((c.material.needsUpdate = !0),
          (u = R),
          (f = R.version),
          (p = i.toneMapping)),
        c.layers.enableAll(),
        T.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function d(T, y) {
    (T.getRGB(Ps, Vc(i)), n.buffers.color.setClear(Ps.r, Ps.g, Ps.b, y, a));
  }
  function b() {
    (h !== void 0 && (h.geometry.dispose(), h.material.dispose(), (h = void 0)),
      c !== void 0 &&
        (c.geometry.dispose(), c.material.dispose(), (c = void 0)));
  }
  return {
    getClearColor: function () {
      return o;
    },
    setClearColor: function (T, y = 1) {
      (o.set(T), (l = y), d(o, l));
    },
    getClearAlpha: function () {
      return l;
    },
    setClearAlpha: function (T) {
      ((l = T), d(o, l));
    },
    render: x,
    addToRenderList: m,
    dispose: b,
  };
}
function Wf(i, t) {
  const e = i.getParameter(i.MAX_VERTEX_ATTRIBS),
    n = {},
    s = f(null);
  let r = s,
    a = !1;
  function o(M, P, N, B, W) {
    let G = !1;
    const X = u(B, N, P);
    (r !== X && ((r = X), c(r.object)),
      (G = p(M, B, N, W)),
      G && _(M, B, N, W),
      W !== null && t.update(W, i.ELEMENT_ARRAY_BUFFER),
      (G || a) &&
        ((a = !1),
        y(M, P, N, B),
        W !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, t.get(W).buffer)));
  }
  function l() {
    return i.createVertexArray();
  }
  function c(M) {
    return i.bindVertexArray(M);
  }
  function h(M) {
    return i.deleteVertexArray(M);
  }
  function u(M, P, N) {
    const B = N.wireframe === !0;
    let W = n[M.id];
    W === void 0 && ((W = {}), (n[M.id] = W));
    let G = W[P.id];
    G === void 0 && ((G = {}), (W[P.id] = G));
    let X = G[B];
    return (X === void 0 && ((X = f(l())), (G[B] = X)), X);
  }
  function f(M) {
    const P = [],
      N = [],
      B = [];
    for (let W = 0; W < e; W++) ((P[W] = 0), (N[W] = 0), (B[W] = 0));
    return {
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: P,
      enabledAttributes: N,
      attributeDivisors: B,
      object: M,
      attributes: {},
      index: null,
    };
  }
  function p(M, P, N, B) {
    const W = r.attributes,
      G = P.attributes;
    let X = 0;
    const j = N.getAttributes();
    for (const H in j)
      if (j[H].location >= 0) {
        const lt = W[H];
        let bt = G[H];
        if (
          (bt === void 0 &&
            (H === "instanceMatrix" &&
              M.instanceMatrix &&
              (bt = M.instanceMatrix),
            H === "instanceColor" && M.instanceColor && (bt = M.instanceColor)),
          lt === void 0 || lt.attribute !== bt || (bt && lt.data !== bt.data))
        )
          return !0;
        X++;
      }
    return r.attributesNum !== X || r.index !== B;
  }
  function _(M, P, N, B) {
    const W = {},
      G = P.attributes;
    let X = 0;
    const j = N.getAttributes();
    for (const H in j)
      if (j[H].location >= 0) {
        let lt = G[H];
        lt === void 0 &&
          (H === "instanceMatrix" &&
            M.instanceMatrix &&
            (lt = M.instanceMatrix),
          H === "instanceColor" && M.instanceColor && (lt = M.instanceColor));
        const bt = {};
        ((bt.attribute = lt),
          lt && lt.data && (bt.data = lt.data),
          (W[H] = bt),
          X++);
      }
    ((r.attributes = W), (r.attributesNum = X), (r.index = B));
  }
  function x() {
    const M = r.newAttributes;
    for (let P = 0, N = M.length; P < N; P++) M[P] = 0;
  }
  function m(M) {
    d(M, 0);
  }
  function d(M, P) {
    const N = r.newAttributes,
      B = r.enabledAttributes,
      W = r.attributeDivisors;
    ((N[M] = 1),
      B[M] === 0 && (i.enableVertexAttribArray(M), (B[M] = 1)),
      W[M] !== P && (i.vertexAttribDivisor(M, P), (W[M] = P)));
  }
  function b() {
    const M = r.newAttributes,
      P = r.enabledAttributes;
    for (let N = 0, B = P.length; N < B; N++)
      P[N] !== M[N] && (i.disableVertexAttribArray(N), (P[N] = 0));
  }
  function T(M, P, N, B, W, G, X) {
    X === !0
      ? i.vertexAttribIPointer(M, P, N, W, G)
      : i.vertexAttribPointer(M, P, N, B, W, G);
  }
  function y(M, P, N, B) {
    x();
    const W = B.attributes,
      G = N.getAttributes(),
      X = P.defaultAttributeValues;
    for (const j in G) {
      const H = G[j];
      if (H.location >= 0) {
        let rt = W[j];
        if (
          (rt === void 0 &&
            (j === "instanceMatrix" &&
              M.instanceMatrix &&
              (rt = M.instanceMatrix),
            j === "instanceColor" && M.instanceColor && (rt = M.instanceColor)),
          rt !== void 0)
        ) {
          const lt = rt.normalized,
            bt = rt.itemSize,
            kt = t.get(rt);
          if (kt === void 0) continue;
          const ne = kt.buffer,
            ae = kt.type,
            Kt = kt.bytesPerElement,
            q = ae === i.INT || ae === i.UNSIGNED_INT || rt.gpuType === Ua;
          if (rt.isInterleavedBufferAttribute) {
            const Z = rt.data,
              ut = Z.stride,
              Lt = rt.offset;
            if (Z.isInstancedInterleavedBuffer) {
              for (let Et = 0; Et < H.locationSize; Et++)
                d(H.location + Et, Z.meshPerAttribute);
              M.isInstancedMesh !== !0 &&
                B._maxInstanceCount === void 0 &&
                (B._maxInstanceCount = Z.meshPerAttribute * Z.count);
            } else
              for (let Et = 0; Et < H.locationSize; Et++) m(H.location + Et);
            i.bindBuffer(i.ARRAY_BUFFER, ne);
            for (let Et = 0; Et < H.locationSize; Et++)
              T(
                H.location + Et,
                bt / H.locationSize,
                ae,
                lt,
                ut * Kt,
                (Lt + (bt / H.locationSize) * Et) * Kt,
                q,
              );
          } else {
            if (rt.isInstancedBufferAttribute) {
              for (let Z = 0; Z < H.locationSize; Z++)
                d(H.location + Z, rt.meshPerAttribute);
              M.isInstancedMesh !== !0 &&
                B._maxInstanceCount === void 0 &&
                (B._maxInstanceCount = rt.meshPerAttribute * rt.count);
            } else for (let Z = 0; Z < H.locationSize; Z++) m(H.location + Z);
            i.bindBuffer(i.ARRAY_BUFFER, ne);
            for (let Z = 0; Z < H.locationSize; Z++)
              T(
                H.location + Z,
                bt / H.locationSize,
                ae,
                lt,
                bt * Kt,
                (bt / H.locationSize) * Z * Kt,
                q,
              );
          }
        } else if (X !== void 0) {
          const lt = X[j];
          if (lt !== void 0)
            switch (lt.length) {
              case 2:
                i.vertexAttrib2fv(H.location, lt);
                break;
              case 3:
                i.vertexAttrib3fv(H.location, lt);
                break;
              case 4:
                i.vertexAttrib4fv(H.location, lt);
                break;
              default:
                i.vertexAttrib1fv(H.location, lt);
            }
        }
      }
    }
    b();
  }
  function R() {
    U();
    for (const M in n) {
      const P = n[M];
      for (const N in P) {
        const B = P[N];
        for (const W in B) (h(B[W].object), delete B[W]);
        delete P[N];
      }
      delete n[M];
    }
  }
  function w(M) {
    if (n[M.id] === void 0) return;
    const P = n[M.id];
    for (const N in P) {
      const B = P[N];
      for (const W in B) (h(B[W].object), delete B[W]);
      delete P[N];
    }
    delete n[M.id];
  }
  function C(M) {
    for (const P in n) {
      const N = n[P];
      if (N[M.id] === void 0) continue;
      const B = N[M.id];
      for (const W in B) (h(B[W].object), delete B[W]);
      delete N[M.id];
    }
  }
  function U() {
    (S(), (a = !0), r !== s && ((r = s), c(r.object)));
  }
  function S() {
    ((s.geometry = null), (s.program = null), (s.wireframe = !1));
  }
  return {
    setup: o,
    reset: U,
    resetDefaultState: S,
    dispose: R,
    releaseStatesOfGeometry: w,
    releaseStatesOfProgram: C,
    initAttributes: x,
    enableAttribute: m,
    disableUnusedAttributes: b,
  };
}
function $f(i, t, e) {
  let n;
  function s(c) {
    n = c;
  }
  function r(c, h) {
    (i.drawArrays(n, c, h), e.update(h, n, 1));
  }
  function a(c, h, u) {
    u !== 0 && (i.drawArraysInstanced(n, c, h, u), e.update(h, n, u));
  }
  function o(c, h, u) {
    if (u === 0) return;
    t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, h, 0, u);
    let p = 0;
    for (let _ = 0; _ < u; _++) p += h[_];
    e.update(p, n, 1);
  }
  function l(c, h, u, f) {
    if (u === 0) return;
    const p = t.get("WEBGL_multi_draw");
    if (p === null) for (let _ = 0; _ < c.length; _++) a(c[_], h[_], f[_]);
    else {
      p.multiDrawArraysInstancedWEBGL(n, c, 0, h, 0, f, 0, u);
      let _ = 0;
      for (let x = 0; x < u; x++) _ += h[x] * f[x];
      e.update(_, n, 1);
    }
  }
  ((this.setMode = s),
    (this.render = r),
    (this.renderInstances = a),
    (this.renderMultiDraw = o),
    (this.renderMultiDrawInstances = l));
}
function Xf(i, t, e, n) {
  let s;
  function r() {
    if (s !== void 0) return s;
    if (t.has("EXT_texture_filter_anisotropic") === !0) {
      const C = t.get("EXT_texture_filter_anisotropic");
      s = i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else s = 0;
    return s;
  }
  function a(C) {
    return !(
      C !== sn &&
      n.convert(C) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT)
    );
  }
  function o(C) {
    const U =
      C === ns &&
      (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
    return !(
      C !== un &&
      n.convert(C) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) &&
      C !== ln &&
      !U
    );
  }
  function l(C) {
    if (C === "highp") {
      if (
        i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision >
          0 &&
        i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision >
          0
      )
        return "highp";
      C = "mediump";
    }
    return C === "mediump" &&
      i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision >
        0 &&
      i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision >
        0
      ? "mediump"
      : "lowp";
  }
  let c = e.precision !== void 0 ? e.precision : "highp";
  const h = l(c);
  h !== c &&
    (console.warn(
      "THREE.WebGLRenderer:",
      c,
      "not supported, using",
      h,
      "instead.",
    ),
    (c = h));
  const u = e.logarithmicDepthBuffer === !0,
    f = e.reversedDepthBuffer === !0 && t.has("EXT_clip_control"),
    p = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),
    _ = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    x = i.getParameter(i.MAX_TEXTURE_SIZE),
    m = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),
    d = i.getParameter(i.MAX_VERTEX_ATTRIBS),
    b = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),
    T = i.getParameter(i.MAX_VARYING_VECTORS),
    y = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),
    R = _ > 0,
    w = i.getParameter(i.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    getMaxAnisotropy: r,
    getMaxPrecision: l,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: c,
    logarithmicDepthBuffer: u,
    reversedDepthBuffer: f,
    maxTextures: p,
    maxVertexTextures: _,
    maxTextureSize: x,
    maxCubemapSize: m,
    maxAttributes: d,
    maxVertexUniforms: b,
    maxVaryings: T,
    maxFragmentUniforms: y,
    vertexTextures: R,
    maxSamples: w,
  };
}
function qf(i) {
  const t = this;
  let e = null,
    n = 0,
    s = !1,
    r = !1;
  const a = new Wn(),
    o = new Ft(),
    l = { value: null, needsUpdate: !1 };
  ((this.uniform = l),
    (this.numPlanes = 0),
    (this.numIntersection = 0),
    (this.init = function (u, f) {
      const p = u.length !== 0 || f || n !== 0 || s;
      return ((s = f), (n = u.length), p);
    }),
    (this.beginShadows = function () {
      ((r = !0), h(null));
    }),
    (this.endShadows = function () {
      r = !1;
    }),
    (this.setGlobalState = function (u, f) {
      e = h(u, f, 0);
    }),
    (this.setState = function (u, f, p) {
      const _ = u.clippingPlanes,
        x = u.clipIntersection,
        m = u.clipShadows,
        d = i.get(u);
      if (!s || _ === null || _.length === 0 || (r && !m)) r ? h(null) : c();
      else {
        const b = r ? 0 : n,
          T = b * 4;
        let y = d.clippingState || null;
        ((l.value = y), (y = h(_, f, T, p)));
        for (let R = 0; R !== T; ++R) y[R] = e[R];
        ((d.clippingState = y),
          (this.numIntersection = x ? this.numPlanes : 0),
          (this.numPlanes += b));
      }
    }));
  function c() {
    (l.value !== e && ((l.value = e), (l.needsUpdate = n > 0)),
      (t.numPlanes = n),
      (t.numIntersection = 0));
  }
  function h(u, f, p, _) {
    const x = u !== null ? u.length : 0;
    let m = null;
    if (x !== 0) {
      if (((m = l.value), _ !== !0 || m === null)) {
        const d = p + x * 4,
          b = f.matrixWorldInverse;
        (o.getNormalMatrix(b),
          (m === null || m.length < d) && (m = new Float32Array(d)));
        for (let T = 0, y = p; T !== x; ++T, y += 4)
          (a.copy(u[T]).applyMatrix4(b, o),
            a.normal.toArray(m, y),
            (m[y + 3] = a.constant));
      }
      ((l.value = m), (l.needsUpdate = !0));
    }
    return ((t.numPlanes = x), (t.numIntersection = 0), m);
  }
}
function Yf(i) {
  let t = new WeakMap();
  function e(a, o) {
    return (o === Zr ? (a.mapping = bi) : o === Jr && (a.mapping = Ti), a);
  }
  function n(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === Zr || o === Jr)
        if (t.has(a)) {
          const l = t.get(a).texture;
          return e(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const c = new Gd(l.height);
            return (
              c.fromEquirectangularTexture(i, a),
              t.set(a, c),
              a.addEventListener("dispose", s),
              e(c.texture, a.mapping)
            );
          } else return null;
        }
    }
    return a;
  }
  function s(a) {
    const o = a.target;
    o.removeEventListener("dispose", s);
    const l = t.get(o);
    l !== void 0 && (t.delete(o), l.dispose());
  }
  function r() {
    t = new WeakMap();
  }
  return { get: n, dispose: r };
}
const Mi = 4,
  Go = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582],
  qn = 20,
  Ir = new Kc(),
  Wo = new Ht();
let Ur = null,
  Nr = 0,
  Fr = 0,
  Or = !1;
const $n = (1 + Math.sqrt(5)) / 2,
  xi = 1 / $n,
  $o = [
    new F(-$n, xi, 0),
    new F($n, xi, 0),
    new F(-xi, 0, $n),
    new F(xi, 0, $n),
    new F(0, $n, -xi),
    new F(0, $n, xi),
    new F(-1, 1, -1),
    new F(1, 1, -1),
    new F(-1, 1, 1),
    new F(1, 1, 1),
  ],
  jf = new F();
class Xo {
  constructor(t) {
    ((this._renderer = t),
      (this._pingPongRenderTarget = null),
      (this._lodMax = 0),
      (this._cubeSize = 0),
      (this._lodPlanes = []),
      (this._sizeLods = []),
      (this._sigmas = []),
      (this._blurMaterial = null),
      (this._cubemapMaterial = null),
      (this._equirectMaterial = null),
      this._compileMaterial(this._blurMaterial));
  }
  fromScene(t, e = 0, n = 0.1, s = 100, r = {}) {
    const { size: a = 256, position: o = jf } = r;
    ((Ur = this._renderer.getRenderTarget()),
      (Nr = this._renderer.getActiveCubeFace()),
      (Fr = this._renderer.getActiveMipmapLevel()),
      (Or = this._renderer.xr.enabled),
      (this._renderer.xr.enabled = !1),
      this._setSize(a));
    const l = this._allocateTargets();
    return (
      (l.depthBuffer = !0),
      this._sceneToCubeUV(t, n, s, l, o),
      e > 0 && this._blur(l, 0, 0, e),
      this._applyPMREM(l),
      this._cleanup(l),
      l
    );
  }
  fromEquirectangular(t, e = null) {
    return this._fromTexture(t, e);
  }
  fromCubemap(t, e = null) {
    return this._fromTexture(t, e);
  }
  compileCubemapShader() {
    this._cubemapMaterial === null &&
      ((this._cubemapMaterial = jo()),
      this._compileMaterial(this._cubemapMaterial));
  }
  compileEquirectangularShader() {
    this._equirectMaterial === null &&
      ((this._equirectMaterial = Yo()),
      this._compileMaterial(this._equirectMaterial));
  }
  dispose() {
    (this._dispose(),
      this._cubemapMaterial !== null && this._cubemapMaterial.dispose(),
      this._equirectMaterial !== null && this._equirectMaterial.dispose());
  }
  _setSize(t) {
    ((this._lodMax = Math.floor(Math.log2(t))),
      (this._cubeSize = Math.pow(2, this._lodMax)));
  }
  _dispose() {
    (this._blurMaterial !== null && this._blurMaterial.dispose(),
      this._pingPongRenderTarget !== null &&
        this._pingPongRenderTarget.dispose());
    for (let t = 0; t < this._lodPlanes.length; t++)
      this._lodPlanes[t].dispose();
  }
  _cleanup(t) {
    (this._renderer.setRenderTarget(Ur, Nr, Fr),
      (this._renderer.xr.enabled = Or),
      (t.scissorTest = !1),
      Ds(t, 0, 0, t.width, t.height));
  }
  _fromTexture(t, e) {
    (t.mapping === bi || t.mapping === Ti
      ? this._setSize(
          t.image.length === 0
            ? 16
            : t.image[0].width || t.image[0].image.width,
        )
      : this._setSize(t.image.width / 4),
      (Ur = this._renderer.getRenderTarget()),
      (Nr = this._renderer.getActiveCubeFace()),
      (Fr = this._renderer.getActiveMipmapLevel()),
      (Or = this._renderer.xr.enabled),
      (this._renderer.xr.enabled = !1));
    const n = e || this._allocateTargets();
    return (
      this._textureToCubeUV(t, n),
      this._applyPMREM(n),
      this._cleanup(n),
      n
    );
  }
  _allocateTargets() {
    const t = 3 * Math.max(this._cubeSize, 112),
      e = 4 * this._cubeSize,
      n = {
        magFilter: cn,
        minFilter: cn,
        generateMipmaps: !1,
        type: ns,
        format: sn,
        colorSpace: Ai,
        depthBuffer: !1,
      },
      s = qo(t, e, n);
    if (
      this._pingPongRenderTarget === null ||
      this._pingPongRenderTarget.width !== t ||
      this._pingPongRenderTarget.height !== e
    ) {
      (this._pingPongRenderTarget !== null && this._dispose(),
        (this._pingPongRenderTarget = qo(t, e, n)));
      const { _lodMax: r } = this;
      (({
        sizeLods: this._sizeLods,
        lodPlanes: this._lodPlanes,
        sigmas: this._sigmas,
      } = Kf(r)),
        (this._blurMaterial = Zf(r, t, e)));
    }
    return s;
  }
  _compileMaterial(t) {
    const e = new me(this._lodPlanes[0], t);
    this._renderer.compile(e, Ir);
  }
  _sceneToCubeUV(t, e, n, s, r) {
    const l = new je(90, 1, e, n),
      c = [1, -1, 1, 1, 1, 1],
      h = [1, 1, 1, -1, -1, -1],
      u = this._renderer,
      f = u.autoClear,
      p = u.toneMapping;
    (u.getClearColor(Wo),
      (u.toneMapping = Ln),
      (u.autoClear = !1),
      u.state.buffers.depth.getReversed() &&
        (u.setRenderTarget(s), u.clearDepth(), u.setRenderTarget(null)));
    const x = new Va({
        name: "PMREM.Background",
        side: Ne,
        depthWrite: !1,
        depthTest: !1,
      }),
      m = new me(new Ii(), x);
    let d = !1;
    const b = t.background;
    b
      ? b.isColor && (x.color.copy(b), (t.background = null), (d = !0))
      : (x.color.copy(Wo), (d = !0));
    for (let T = 0; T < 6; T++) {
      const y = T % 3;
      y === 0
        ? (l.up.set(0, c[T], 0),
          l.position.set(r.x, r.y, r.z),
          l.lookAt(r.x + h[T], r.y, r.z))
        : y === 1
          ? (l.up.set(0, 0, c[T]),
            l.position.set(r.x, r.y, r.z),
            l.lookAt(r.x, r.y + h[T], r.z))
          : (l.up.set(0, c[T], 0),
            l.position.set(r.x, r.y, r.z),
            l.lookAt(r.x, r.y, r.z + h[T]));
      const R = this._cubeSize;
      (Ds(s, y * R, T > 2 ? R : 0, R, R),
        u.setRenderTarget(s),
        d && u.render(m, l),
        u.render(t, l));
    }
    (m.geometry.dispose(),
      m.material.dispose(),
      (u.toneMapping = p),
      (u.autoClear = f),
      (t.background = b));
  }
  _textureToCubeUV(t, e) {
    const n = this._renderer,
      s = t.mapping === bi || t.mapping === Ti;
    s
      ? (this._cubemapMaterial === null && (this._cubemapMaterial = jo()),
        (this._cubemapMaterial.uniforms.flipEnvMap.value =
          t.isRenderTargetTexture === !1 ? -1 : 1))
      : this._equirectMaterial === null && (this._equirectMaterial = Yo());
    const r = s ? this._cubemapMaterial : this._equirectMaterial,
      a = new me(this._lodPlanes[0], r),
      o = r.uniforms;
    o.envMap.value = t;
    const l = this._cubeSize;
    (Ds(e, 0, 0, 3 * l, 2 * l), n.setRenderTarget(e), n.render(a, Ir));
  }
  _applyPMREM(t) {
    const e = this._renderer,
      n = e.autoClear;
    e.autoClear = !1;
    const s = this._lodPlanes.length;
    for (let r = 1; r < s; r++) {
      const a = Math.sqrt(
          this._sigmas[r] * this._sigmas[r] -
            this._sigmas[r - 1] * this._sigmas[r - 1],
        ),
        o = $o[(s - r - 1) % $o.length];
      this._blur(t, r - 1, r, a, o);
    }
    e.autoClear = n;
  }
  _blur(t, e, n, s, r) {
    const a = this._pingPongRenderTarget;
    (this._halfBlur(t, a, e, n, s, "latitudinal", r),
      this._halfBlur(a, t, n, n, s, "longitudinal", r));
  }
  _halfBlur(t, e, n, s, r, a, o) {
    const l = this._renderer,
      c = this._blurMaterial;
    a !== "latitudinal" &&
      a !== "longitudinal" &&
      console.error(
        "blur direction must be either latitudinal or longitudinal!",
      );
    const h = 3,
      u = new me(this._lodPlanes[s], c),
      f = c.uniforms,
      p = this._sizeLods[n] - 1,
      _ = isFinite(r) ? Math.PI / (2 * p) : (2 * Math.PI) / (2 * qn - 1),
      x = r / _,
      m = isFinite(r) ? 1 + Math.floor(h * x) : qn;
    m > qn &&
      console.warn(
        `sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${qn}`,
      );
    const d = [];
    let b = 0;
    for (let C = 0; C < qn; ++C) {
      const U = C / x,
        S = Math.exp((-U * U) / 2);
      (d.push(S), C === 0 ? (b += S) : C < m && (b += 2 * S));
    }
    for (let C = 0; C < d.length; C++) d[C] = d[C] / b;
    ((f.envMap.value = t.texture),
      (f.samples.value = m),
      (f.weights.value = d),
      (f.latitudinal.value = a === "latitudinal"),
      o && (f.poleAxis.value = o));
    const { _lodMax: T } = this;
    ((f.dTheta.value = _), (f.mipInt.value = T - n));
    const y = this._sizeLods[s],
      R = 3 * y * (s > T - Mi ? s - T + Mi : 0),
      w = 4 * (this._cubeSize - y);
    (Ds(e, R, w, 3 * y, 2 * y), l.setRenderTarget(e), l.render(u, Ir));
  }
}
function Kf(i) {
  const t = [],
    e = [],
    n = [];
  let s = i;
  const r = i - Mi + 1 + Go.length;
  for (let a = 0; a < r; a++) {
    const o = Math.pow(2, s);
    e.push(o);
    let l = 1 / o;
    (a > i - Mi ? (l = Go[a - i + Mi - 1]) : a === 0 && (l = 0), n.push(l));
    const c = 1 / (o - 2),
      h = -c,
      u = 1 + c,
      f = [h, h, u, h, u, u, h, h, u, u, h, u],
      p = 6,
      _ = 6,
      x = 3,
      m = 2,
      d = 1,
      b = new Float32Array(x * _ * p),
      T = new Float32Array(m * _ * p),
      y = new Float32Array(d * _ * p);
    for (let w = 0; w < p; w++) {
      const C = ((w % 3) * 2) / 3 - 1,
        U = w > 2 ? 0 : -1,
        S = [
          C,
          U,
          0,
          C + 2 / 3,
          U,
          0,
          C + 2 / 3,
          U + 1,
          0,
          C,
          U,
          0,
          C + 2 / 3,
          U + 1,
          0,
          C,
          U + 1,
          0,
        ];
      (b.set(S, x * _ * w), T.set(f, m * _ * w));
      const M = [w, w, w, w, w, w];
      y.set(M, d * _ * w);
    }
    const R = new Ze();
    (R.setAttribute("position", new rn(b, x)),
      R.setAttribute("uv", new rn(T, m)),
      R.setAttribute("faceIndex", new rn(y, d)),
      t.push(R),
      s > Mi && s--);
  }
  return { lodPlanes: t, sizeLods: e, sigmas: n };
}
function qo(i, t, e) {
  const n = new ei(i, t, e);
  return (
    (n.texture.mapping = Js),
    (n.texture.name = "PMREM.cubeUv"),
    (n.scissorTest = !0),
    n
  );
}
function Ds(i, t, e, n, s) {
  (i.viewport.set(t, e, n, s), i.scissor.set(t, e, n, s));
}
function Zf(i, t, e) {
  const n = new Float32Array(qn),
    s = new F(0, 1, 0);
  return new Nn({
    name: "SphericalGaussianBlur",
    defines: {
      n: qn,
      CUBEUV_TEXEL_WIDTH: 1 / t,
      CUBEUV_TEXEL_HEIGHT: 1 / e,
      CUBEUV_MAX_MIP: `${i}.0`,
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: n },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: s },
    },
    vertexShader: Xa(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
    blending: Dn,
    depthTest: !1,
    depthWrite: !1,
  });
}
function Yo() {
  return new Nn({
    name: "EquirectangularToCubeUV",
    uniforms: { envMap: { value: null } },
    vertexShader: Xa(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
    blending: Dn,
    depthTest: !1,
    depthWrite: !1,
  });
}
function jo() {
  return new Nn({
    name: "CubemapToCubeUV",
    uniforms: { envMap: { value: null }, flipEnvMap: { value: -1 } },
    vertexShader: Xa(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
    blending: Dn,
    depthTest: !1,
    depthWrite: !1,
  });
}
function Xa() {
  return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;
}
function Jf(i) {
  let t = new WeakMap(),
    e = null;
  function n(o) {
    if (o && o.isTexture) {
      const l = o.mapping,
        c = l === Zr || l === Jr,
        h = l === bi || l === Ti;
      if (c || h) {
        let u = t.get(o);
        const f = u !== void 0 ? u.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== f)
          return (
            e === null && (e = new Xo(i)),
            (u = c ? e.fromEquirectangular(o, u) : e.fromCubemap(o, u)),
            (u.texture.pmremVersion = o.pmremVersion),
            t.set(o, u),
            u.texture
          );
        if (u !== void 0) return u.texture;
        {
          const p = o.image;
          return (c && p && p.height > 0) || (h && p && s(p))
            ? (e === null && (e = new Xo(i)),
              (u = c ? e.fromEquirectangular(o) : e.fromCubemap(o)),
              (u.texture.pmremVersion = o.pmremVersion),
              t.set(o, u),
              o.addEventListener("dispose", r),
              u.texture)
            : null;
        }
      }
    }
    return o;
  }
  function s(o) {
    let l = 0;
    const c = 6;
    for (let h = 0; h < c; h++) o[h] !== void 0 && l++;
    return l === c;
  }
  function r(o) {
    const l = o.target;
    l.removeEventListener("dispose", r);
    const c = t.get(l);
    c !== void 0 && (t.delete(l), c.dispose());
  }
  function a() {
    ((t = new WeakMap()), e !== null && (e.dispose(), (e = null)));
  }
  return { get: n, dispose: a };
}
function Qf(i) {
  const t = {};
  function e(n) {
    if (t[n] !== void 0) return t[n];
    let s;
    switch (n) {
      case "WEBGL_depth_texture":
        s =
          i.getExtension("WEBGL_depth_texture") ||
          i.getExtension("MOZ_WEBGL_depth_texture") ||
          i.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        s =
          i.getExtension("EXT_texture_filter_anisotropic") ||
          i.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
          i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        s =
          i.getExtension("WEBGL_compressed_texture_s3tc") ||
          i.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
          i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        s =
          i.getExtension("WEBGL_compressed_texture_pvrtc") ||
          i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        s = i.getExtension(n);
    }
    return ((t[n] = s), s);
  }
  return {
    has: function (n) {
      return e(n) !== null;
    },
    init: function () {
      (e("EXT_color_buffer_float"),
        e("WEBGL_clip_cull_distance"),
        e("OES_texture_float_linear"),
        e("EXT_color_buffer_half_float"),
        e("WEBGL_multisampled_render_to_texture"),
        e("WEBGL_render_shared_exponent"));
    },
    get: function (n) {
      const s = e(n);
      return (
        s === null &&
          Qi("THREE.WebGLRenderer: " + n + " extension not supported."),
        s
      );
    },
  };
}
function tp(i, t, e, n) {
  const s = {},
    r = new WeakMap();
  function a(u) {
    const f = u.target;
    f.index !== null && t.remove(f.index);
    for (const _ in f.attributes) t.remove(f.attributes[_]);
    (f.removeEventListener("dispose", a), delete s[f.id]);
    const p = r.get(f);
    (p && (t.remove(p), r.delete(f)),
      n.releaseStatesOfGeometry(f),
      f.isInstancedBufferGeometry === !0 && delete f._maxInstanceCount,
      e.memory.geometries--);
  }
  function o(u, f) {
    return (
      s[f.id] === !0 ||
        (f.addEventListener("dispose", a),
        (s[f.id] = !0),
        e.memory.geometries++),
      f
    );
  }
  function l(u) {
    const f = u.attributes;
    for (const p in f) t.update(f[p], i.ARRAY_BUFFER);
  }
  function c(u) {
    const f = [],
      p = u.index,
      _ = u.attributes.position;
    let x = 0;
    if (p !== null) {
      const b = p.array;
      x = p.version;
      for (let T = 0, y = b.length; T < y; T += 3) {
        const R = b[T + 0],
          w = b[T + 1],
          C = b[T + 2];
        f.push(R, w, w, C, C, R);
      }
    } else if (_ !== void 0) {
      const b = _.array;
      x = _.version;
      for (let T = 0, y = b.length / 3 - 1; T < y; T += 3) {
        const R = T + 0,
          w = T + 1,
          C = T + 2;
        f.push(R, w, w, C, C, R);
      }
    } else return;
    const m = new (Nc(f) ? Hc : zc)(f, 1);
    m.version = x;
    const d = r.get(u);
    (d && t.remove(d), r.set(u, m));
  }
  function h(u) {
    const f = r.get(u);
    if (f) {
      const p = u.index;
      p !== null && f.version < p.version && c(u);
    } else c(u);
    return r.get(u);
  }
  return { get: o, update: l, getWireframeAttribute: h };
}
function ep(i, t, e) {
  let n;
  function s(f) {
    n = f;
  }
  let r, a;
  function o(f) {
    ((r = f.type), (a = f.bytesPerElement));
  }
  function l(f, p) {
    (i.drawElements(n, p, r, f * a), e.update(p, n, 1));
  }
  function c(f, p, _) {
    _ !== 0 && (i.drawElementsInstanced(n, p, r, f * a, _), e.update(p, n, _));
  }
  function h(f, p, _) {
    if (_ === 0) return;
    t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, p, 0, r, f, 0, _);
    let m = 0;
    for (let d = 0; d < _; d++) m += p[d];
    e.update(m, n, 1);
  }
  function u(f, p, _, x) {
    if (_ === 0) return;
    const m = t.get("WEBGL_multi_draw");
    if (m === null) for (let d = 0; d < f.length; d++) c(f[d] / a, p[d], x[d]);
    else {
      m.multiDrawElementsInstancedWEBGL(n, p, 0, r, f, 0, x, 0, _);
      let d = 0;
      for (let b = 0; b < _; b++) d += p[b] * x[b];
      e.update(d, n, 1);
    }
  }
  ((this.setMode = s),
    (this.setIndex = o),
    (this.render = l),
    (this.renderInstances = c),
    (this.renderMultiDraw = h),
    (this.renderMultiDrawInstances = u));
}
function np(i) {
  const t = { geometries: 0, textures: 0 },
    e = { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 };
  function n(r, a, o) {
    switch ((e.calls++, a)) {
      case i.TRIANGLES:
        e.triangles += o * (r / 3);
        break;
      case i.LINES:
        e.lines += o * (r / 2);
        break;
      case i.LINE_STRIP:
        e.lines += o * (r - 1);
        break;
      case i.LINE_LOOP:
        e.lines += o * r;
        break;
      case i.POINTS:
        e.points += o * r;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", a);
        break;
    }
  }
  function s() {
    ((e.calls = 0), (e.triangles = 0), (e.points = 0), (e.lines = 0));
  }
  return {
    memory: t,
    render: e,
    programs: null,
    autoReset: !0,
    reset: s,
    update: n,
  };
}
function ip(i, t, e) {
  const n = new WeakMap(),
    s = new ue();
  function r(a, o, l) {
    const c = a.morphTargetInfluences,
      h =
        o.morphAttributes.position ||
        o.morphAttributes.normal ||
        o.morphAttributes.color,
      u = h !== void 0 ? h.length : 0;
    let f = n.get(o);
    if (f === void 0 || f.count !== u) {
      let M = function () {
        (U.dispose(), n.delete(o), o.removeEventListener("dispose", M));
      };
      var p = M;
      f !== void 0 && f.texture.dispose();
      const _ = o.morphAttributes.position !== void 0,
        x = o.morphAttributes.normal !== void 0,
        m = o.morphAttributes.color !== void 0,
        d = o.morphAttributes.position || [],
        b = o.morphAttributes.normal || [],
        T = o.morphAttributes.color || [];
      let y = 0;
      (_ === !0 && (y = 1), x === !0 && (y = 2), m === !0 && (y = 3));
      let R = o.attributes.position.count * y,
        w = 1;
      R > t.maxTextureSize &&
        ((w = Math.ceil(R / t.maxTextureSize)), (R = t.maxTextureSize));
      const C = new Float32Array(R * w * 4 * u),
        U = new Fc(C, R, w, u);
      ((U.type = ln), (U.needsUpdate = !0));
      const S = y * 4;
      for (let P = 0; P < u; P++) {
        const N = d[P],
          B = b[P],
          W = T[P],
          G = R * w * 4 * P;
        for (let X = 0; X < N.count; X++) {
          const j = X * S;
          (_ === !0 &&
            (s.fromBufferAttribute(N, X),
            (C[G + j + 0] = s.x),
            (C[G + j + 1] = s.y),
            (C[G + j + 2] = s.z),
            (C[G + j + 3] = 0)),
            x === !0 &&
              (s.fromBufferAttribute(B, X),
              (C[G + j + 4] = s.x),
              (C[G + j + 5] = s.y),
              (C[G + j + 6] = s.z),
              (C[G + j + 7] = 0)),
            m === !0 &&
              (s.fromBufferAttribute(W, X),
              (C[G + j + 8] = s.x),
              (C[G + j + 9] = s.y),
              (C[G + j + 10] = s.z),
              (C[G + j + 11] = W.itemSize === 4 ? s.w : 1)));
        }
      }
      ((f = { count: u, texture: U, size: new Xt(R, w) }),
        n.set(o, f),
        o.addEventListener("dispose", M));
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null)
      l.getUniforms().setValue(i, "morphTexture", a.morphTexture, e);
    else {
      let _ = 0;
      for (let m = 0; m < c.length; m++) _ += c[m];
      const x = o.morphTargetsRelative ? 1 : 1 - _;
      (l.getUniforms().setValue(i, "morphTargetBaseInfluence", x),
        l.getUniforms().setValue(i, "morphTargetInfluences", c));
    }
    (l.getUniforms().setValue(i, "morphTargetsTexture", f.texture, e),
      l.getUniforms().setValue(i, "morphTargetsTextureSize", f.size));
  }
  return { update: r };
}
function sp(i, t, e, n) {
  let s = new WeakMap();
  function r(l) {
    const c = n.render.frame,
      h = l.geometry,
      u = t.get(l, h);
    if (
      (s.get(u) !== c && (t.update(u), s.set(u, c)),
      l.isInstancedMesh &&
        (l.hasEventListener("dispose", o) === !1 &&
          l.addEventListener("dispose", o),
        s.get(l) !== c &&
          (e.update(l.instanceMatrix, i.ARRAY_BUFFER),
          l.instanceColor !== null && e.update(l.instanceColor, i.ARRAY_BUFFER),
          s.set(l, c))),
      l.isSkinnedMesh)
    ) {
      const f = l.skeleton;
      s.get(f) !== c && (f.update(), s.set(f, c));
    }
    return u;
  }
  function a() {
    s = new WeakMap();
  }
  function o(l) {
    const c = l.target;
    (c.removeEventListener("dispose", o),
      e.remove(c.instanceMatrix),
      c.instanceColor !== null && e.remove(c.instanceColor));
  }
  return { update: r, dispose: a };
}
const Jc = new Ae(),
  Ko = new qc(1, 1),
  Qc = new Fc(),
  tl = new Ad(),
  el = new Wc(),
  Zo = [],
  Jo = [],
  Qo = new Float32Array(16),
  tc = new Float32Array(9),
  ec = new Float32Array(4);
function Ni(i, t, e) {
  const n = i[0];
  if (n <= 0 || n > 0) return i;
  const s = t * e;
  let r = Zo[s];
  if ((r === void 0 && ((r = new Float32Array(s)), (Zo[s] = r)), t !== 0)) {
    n.toArray(r, 0);
    for (let a = 1, o = 0; a !== t; ++a) ((o += e), i[a].toArray(r, o));
  }
  return r;
}
function ve(i, t) {
  if (i.length !== t.length) return !1;
  for (let e = 0, n = i.length; e < n; e++) if (i[e] !== t[e]) return !1;
  return !0;
}
function xe(i, t) {
  for (let e = 0, n = t.length; e < n; e++) i[e] = t[e];
}
function tr(i, t) {
  let e = Jo[t];
  e === void 0 && ((e = new Int32Array(t)), (Jo[t] = e));
  for (let n = 0; n !== t; ++n) e[n] = i.allocateTextureUnit();
  return e;
}
function rp(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1f(this.addr, t), (e[0] = t));
}
function ap(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) &&
      (i.uniform2f(this.addr, t.x, t.y), (e[0] = t.x), (e[1] = t.y));
  else {
    if (ve(e, t)) return;
    (i.uniform2fv(this.addr, t), xe(e, t));
  }
}
function op(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) &&
      (i.uniform3f(this.addr, t.x, t.y, t.z),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z));
  else if (t.r !== void 0)
    (e[0] !== t.r || e[1] !== t.g || e[2] !== t.b) &&
      (i.uniform3f(this.addr, t.r, t.g, t.b),
      (e[0] = t.r),
      (e[1] = t.g),
      (e[2] = t.b));
  else {
    if (ve(e, t)) return;
    (i.uniform3fv(this.addr, t), xe(e, t));
  }
}
function cp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) &&
      (i.uniform4f(this.addr, t.x, t.y, t.z, t.w),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z),
      (e[3] = t.w));
  else {
    if (ve(e, t)) return;
    (i.uniform4fv(this.addr, t), xe(e, t));
  }
}
function lp(i, t) {
  const e = this.cache,
    n = t.elements;
  if (n === void 0) {
    if (ve(e, t)) return;
    (i.uniformMatrix2fv(this.addr, !1, t), xe(e, t));
  } else {
    if (ve(e, n)) return;
    (ec.set(n), i.uniformMatrix2fv(this.addr, !1, ec), xe(e, n));
  }
}
function dp(i, t) {
  const e = this.cache,
    n = t.elements;
  if (n === void 0) {
    if (ve(e, t)) return;
    (i.uniformMatrix3fv(this.addr, !1, t), xe(e, t));
  } else {
    if (ve(e, n)) return;
    (tc.set(n), i.uniformMatrix3fv(this.addr, !1, tc), xe(e, n));
  }
}
function hp(i, t) {
  const e = this.cache,
    n = t.elements;
  if (n === void 0) {
    if (ve(e, t)) return;
    (i.uniformMatrix4fv(this.addr, !1, t), xe(e, t));
  } else {
    if (ve(e, n)) return;
    (Qo.set(n), i.uniformMatrix4fv(this.addr, !1, Qo), xe(e, n));
  }
}
function up(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1i(this.addr, t), (e[0] = t));
}
function fp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) &&
      (i.uniform2i(this.addr, t.x, t.y), (e[0] = t.x), (e[1] = t.y));
  else {
    if (ve(e, t)) return;
    (i.uniform2iv(this.addr, t), xe(e, t));
  }
}
function pp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) &&
      (i.uniform3i(this.addr, t.x, t.y, t.z),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z));
  else {
    if (ve(e, t)) return;
    (i.uniform3iv(this.addr, t), xe(e, t));
  }
}
function mp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) &&
      (i.uniform4i(this.addr, t.x, t.y, t.z, t.w),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z),
      (e[3] = t.w));
  else {
    if (ve(e, t)) return;
    (i.uniform4iv(this.addr, t), xe(e, t));
  }
}
function gp(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1ui(this.addr, t), (e[0] = t));
}
function _p(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) &&
      (i.uniform2ui(this.addr, t.x, t.y), (e[0] = t.x), (e[1] = t.y));
  else {
    if (ve(e, t)) return;
    (i.uniform2uiv(this.addr, t), xe(e, t));
  }
}
function vp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) &&
      (i.uniform3ui(this.addr, t.x, t.y, t.z),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z));
  else {
    if (ve(e, t)) return;
    (i.uniform3uiv(this.addr, t), xe(e, t));
  }
}
function xp(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) &&
      (i.uniform4ui(this.addr, t.x, t.y, t.z, t.w),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z),
      (e[3] = t.w));
  else {
    if (ve(e, t)) return;
    (i.uniform4uiv(this.addr, t), xe(e, t));
  }
}
function Mp(i, t, e) {
  const n = this.cache,
    s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s));
  let r;
  (this.type === i.SAMPLER_2D_SHADOW
    ? ((Ko.compareFunction = Uc), (r = Ko))
    : (r = Jc),
    e.setTexture2D(t || r, s));
}
function Sp(i, t, e) {
  const n = this.cache,
    s = e.allocateTextureUnit();
  (n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s)),
    e.setTexture3D(t || tl, s));
}
function yp(i, t, e) {
  const n = this.cache,
    s = e.allocateTextureUnit();
  (n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s)),
    e.setTextureCube(t || el, s));
}
function Ep(i, t, e) {
  const n = this.cache,
    s = e.allocateTextureUnit();
  (n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s)),
    e.setTexture2DArray(t || Qc, s));
}
function bp(i) {
  switch (i) {
    case 5126:
      return rp;
    case 35664:
      return ap;
    case 35665:
      return op;
    case 35666:
      return cp;
    case 35674:
      return lp;
    case 35675:
      return dp;
    case 35676:
      return hp;
    case 5124:
    case 35670:
      return up;
    case 35667:
    case 35671:
      return fp;
    case 35668:
    case 35672:
      return pp;
    case 35669:
    case 35673:
      return mp;
    case 5125:
      return gp;
    case 36294:
      return _p;
    case 36295:
      return vp;
    case 36296:
      return xp;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Mp;
    case 35679:
    case 36299:
    case 36307:
      return Sp;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return yp;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Ep;
  }
}
function Tp(i, t) {
  i.uniform1fv(this.addr, t);
}
function Ap(i, t) {
  const e = Ni(t, this.size, 2);
  i.uniform2fv(this.addr, e);
}
function wp(i, t) {
  const e = Ni(t, this.size, 3);
  i.uniform3fv(this.addr, e);
}
function Rp(i, t) {
  const e = Ni(t, this.size, 4);
  i.uniform4fv(this.addr, e);
}
function Cp(i, t) {
  const e = Ni(t, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, e);
}
function Pp(i, t) {
  const e = Ni(t, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, e);
}
function Dp(i, t) {
  const e = Ni(t, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, e);
}
function Lp(i, t) {
  i.uniform1iv(this.addr, t);
}
function Ip(i, t) {
  i.uniform2iv(this.addr, t);
}
function Up(i, t) {
  i.uniform3iv(this.addr, t);
}
function Np(i, t) {
  i.uniform4iv(this.addr, t);
}
function Fp(i, t) {
  i.uniform1uiv(this.addr, t);
}
function Op(i, t) {
  i.uniform2uiv(this.addr, t);
}
function Bp(i, t) {
  i.uniform3uiv(this.addr, t);
}
function kp(i, t) {
  i.uniform4uiv(this.addr, t);
}
function zp(i, t, e) {
  const n = this.cache,
    s = t.length,
    r = tr(e, s);
  ve(n, r) || (i.uniform1iv(this.addr, r), xe(n, r));
  for (let a = 0; a !== s; ++a) e.setTexture2D(t[a] || Jc, r[a]);
}
function Hp(i, t, e) {
  const n = this.cache,
    s = t.length,
    r = tr(e, s);
  ve(n, r) || (i.uniform1iv(this.addr, r), xe(n, r));
  for (let a = 0; a !== s; ++a) e.setTexture3D(t[a] || tl, r[a]);
}
function Vp(i, t, e) {
  const n = this.cache,
    s = t.length,
    r = tr(e, s);
  ve(n, r) || (i.uniform1iv(this.addr, r), xe(n, r));
  for (let a = 0; a !== s; ++a) e.setTextureCube(t[a] || el, r[a]);
}
function Gp(i, t, e) {
  const n = this.cache,
    s = t.length,
    r = tr(e, s);
  ve(n, r) || (i.uniform1iv(this.addr, r), xe(n, r));
  for (let a = 0; a !== s; ++a) e.setTexture2DArray(t[a] || Qc, r[a]);
}
function Wp(i) {
  switch (i) {
    case 5126:
      return Tp;
    case 35664:
      return Ap;
    case 35665:
      return wp;
    case 35666:
      return Rp;
    case 35674:
      return Cp;
    case 35675:
      return Pp;
    case 35676:
      return Dp;
    case 5124:
    case 35670:
      return Lp;
    case 35667:
    case 35671:
      return Ip;
    case 35668:
    case 35672:
      return Up;
    case 35669:
    case 35673:
      return Np;
    case 5125:
      return Fp;
    case 36294:
      return Op;
    case 36295:
      return Bp;
    case 36296:
      return kp;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return zp;
    case 35679:
    case 36299:
    case 36307:
      return Hp;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Vp;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Gp;
  }
}
class $p {
  constructor(t, e, n) {
    ((this.id = t),
      (this.addr = n),
      (this.cache = []),
      (this.type = e.type),
      (this.setValue = bp(e.type)));
  }
}
class Xp {
  constructor(t, e, n) {
    ((this.id = t),
      (this.addr = n),
      (this.cache = []),
      (this.type = e.type),
      (this.size = e.size),
      (this.setValue = Wp(e.type)));
  }
}
class qp {
  constructor(t) {
    ((this.id = t), (this.seq = []), (this.map = {}));
  }
  setValue(t, e, n) {
    const s = this.seq;
    for (let r = 0, a = s.length; r !== a; ++r) {
      const o = s[r];
      o.setValue(t, e[o.id], n);
    }
  }
}
const Br = /(\w+)(\])?(\[|\.)?/g;
function nc(i, t) {
  (i.seq.push(t), (i.map[t.id] = t));
}
function Yp(i, t, e) {
  const n = i.name,
    s = n.length;
  for (Br.lastIndex = 0; ;) {
    const r = Br.exec(n),
      a = Br.lastIndex;
    let o = r[1];
    const l = r[2] === "]",
      c = r[3];
    if ((l && (o = o | 0), c === void 0 || (c === "[" && a + 2 === s))) {
      nc(e, c === void 0 ? new $p(o, i, t) : new Xp(o, i, t));
      break;
    } else {
      let u = e.map[o];
      (u === void 0 && ((u = new qp(o)), nc(e, u)), (e = u));
    }
  }
}
class Bs {
  constructor(t, e) {
    ((this.seq = []), (this.map = {}));
    const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
    for (let s = 0; s < n; ++s) {
      const r = t.getActiveUniform(e, s),
        a = t.getUniformLocation(e, r.name);
      Yp(r, a, this);
    }
  }
  setValue(t, e, n, s) {
    const r = this.map[e];
    r !== void 0 && r.setValue(t, n, s);
  }
  setOptional(t, e, n) {
    const s = e[n];
    s !== void 0 && this.setValue(t, n, s);
  }
  static upload(t, e, n, s) {
    for (let r = 0, a = e.length; r !== a; ++r) {
      const o = e[r],
        l = n[o.id];
      l.needsUpdate !== !1 && o.setValue(t, l.value, s);
    }
  }
  static seqWithValue(t, e) {
    const n = [];
    for (let s = 0, r = t.length; s !== r; ++s) {
      const a = t[s];
      a.id in e && n.push(a);
    }
    return n;
  }
}
function ic(i, t, e) {
  const n = i.createShader(t);
  return (i.shaderSource(n, e), i.compileShader(n), n);
}
const jp = 37297;
let Kp = 0;
function Zp(i, t) {
  const e = i.split(`
`),
    n = [],
    s = Math.max(t - 6, 0),
    r = Math.min(t + 6, e.length);
  for (let a = s; a < r; a++) {
    const o = a + 1;
    n.push(`${o === t ? ">" : " "} ${o}: ${e[a]}`);
  }
  return n.join(`
`);
}
const sc = new Ft();
function Jp(i) {
  Yt._getMatrix(sc, Yt.workingColorSpace, i);
  const t = `mat3( ${sc.elements.map((e) => e.toFixed(4))} )`;
  switch (Yt.getTransfer(i)) {
    case Gs:
      return [t, "LinearTransferOETF"];
    case Qt:
      return [t, "sRGBTransferOETF"];
    default:
      return (
        console.warn("THREE.WebGLProgram: Unsupported color space: ", i),
        [t, "LinearTransferOETF"]
      );
  }
}
function rc(i, t, e) {
  const n = i.getShaderParameter(t, i.COMPILE_STATUS),
    r = (i.getShaderInfoLog(t) || "").trim();
  if (n && r === "") return "";
  const a = /ERROR: 0:(\d+)/.exec(r);
  if (a) {
    const o = parseInt(a[1]);
    return (
      e.toUpperCase() +
      `

` +
      r +
      `

` +
      Zp(i.getShaderSource(t), o)
    );
  } else return r;
}
function Qp(i, t) {
  const e = Jp(t);
  return [
    `vec4 ${i}( vec4 value ) {`,
    `	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,
    "}",
  ].join(`
`);
}
function tm(i, t) {
  let e;
  switch (t) {
    case ed:
      e = "Linear";
      break;
    case nd:
      e = "Reinhard";
      break;
    case id:
      e = "Cineon";
      break;
    case bc:
      e = "ACESFilmic";
      break;
    case rd:
      e = "AgX";
      break;
    case ad:
      e = "Neutral";
      break;
    case sd:
      e = "Custom";
      break;
    default:
      (console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t),
        (e = "Linear"));
  }
  return (
    "vec3 " + i + "( vec3 color ) { return " + e + "ToneMapping( color ); }"
  );
}
const Ls = new F();
function em() {
  Yt.getLuminanceCoefficients(Ls);
  const i = Ls.x.toFixed(4),
    t = Ls.y.toFixed(4),
    e = Ls.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,
    "	return dot( weights, rgb );",
    "}",
  ].join(`
`);
}
function nm(i) {
  return [
    i.extensionClipCullDistance
      ? "#extension GL_ANGLE_clip_cull_distance : require"
      : "",
    i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : "",
  ].filter(Xi).join(`
`);
}
function im(i) {
  const t = [];
  for (const e in i) {
    const n = i[e];
    n !== !1 && t.push("#define " + e + " " + n);
  }
  return t.join(`
`);
}
function sm(i, t) {
  const e = {},
    n = i.getProgramParameter(t, i.ACTIVE_ATTRIBUTES);
  for (let s = 0; s < n; s++) {
    const r = i.getActiveAttrib(t, s),
      a = r.name;
    let o = 1;
    (r.type === i.FLOAT_MAT2 && (o = 2),
      r.type === i.FLOAT_MAT3 && (o = 3),
      r.type === i.FLOAT_MAT4 && (o = 4),
      (e[a] = {
        type: r.type,
        location: i.getAttribLocation(t, a),
        locationSize: o,
      }));
  }
  return e;
}
function Xi(i) {
  return i !== "";
}
function ac(i, t) {
  const e =
    t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
  return i
    .replace(/NUM_DIR_LIGHTS/g, t.numDirLights)
    .replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights)
    .replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps)
    .replace(/NUM_SPOT_LIGHT_COORDS/g, e)
    .replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights)
    .replace(/NUM_POINT_LIGHTS/g, t.numPointLights)
    .replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights)
    .replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows)
    .replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps)
    .replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows)
    .replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function oc(i, t) {
  return i
    .replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes)
    .replace(
      /UNION_CLIPPING_PLANES/g,
      t.numClippingPlanes - t.numClipIntersection,
    );
}
const rm = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Pa(i) {
  return i.replace(rm, om);
}
const am = new Map();
function om(i, t) {
  let e = Bt[t];
  if (e === void 0) {
    const n = am.get(t);
    if (n !== void 0)
      ((e = Bt[n]),
        console.warn(
          'THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',
          t,
          n,
        ));
    else throw new Error("Can not resolve #include <" + t + ">");
  }
  return Pa(e);
}
const cm =
  /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function cc(i) {
  return i.replace(cm, lm);
}
function lm(i, t, e, n) {
  let s = "";
  for (let r = parseInt(t); r < parseInt(e); r++)
    s += n
      .replace(/\[\s*i\s*\]/g, "[ " + r + " ]")
      .replace(/UNROLLED_LOOP_INDEX/g, r);
  return s;
}
function lc(i) {
  let t = `precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;
  return (
    i.precision === "highp"
      ? (t += `
#define HIGH_PRECISION`)
      : i.precision === "mediump"
        ? (t += `
#define MEDIUM_PRECISION`)
        : i.precision === "lowp" &&
          (t += `
#define LOW_PRECISION`),
    t
  );
}
function dm(i) {
  let t = "SHADOWMAP_TYPE_BASIC";
  return (
    i.shadowMapType === Sc
      ? (t = "SHADOWMAP_TYPE_PCF")
      : i.shadowMapType === yc
        ? (t = "SHADOWMAP_TYPE_PCF_SOFT")
        : i.shadowMapType === Mn && (t = "SHADOWMAP_TYPE_VSM"),
    t
  );
}
function hm(i) {
  let t = "ENVMAP_TYPE_CUBE";
  if (i.envMap)
    switch (i.envMapMode) {
      case bi:
      case Ti:
        t = "ENVMAP_TYPE_CUBE";
        break;
      case Js:
        t = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return t;
}
function um(i) {
  let t = "ENVMAP_MODE_REFLECTION";
  if (i.envMap)
    switch (i.envMapMode) {
      case Ti:
        t = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return t;
}
function fm(i) {
  let t = "ENVMAP_BLENDING_NONE";
  if (i.envMap)
    switch (i.combine) {
      case Ec:
        t = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case Ql:
        t = "ENVMAP_BLENDING_MIX";
        break;
      case td:
        t = "ENVMAP_BLENDING_ADD";
        break;
    }
  return t;
}
function pm(i) {
  const t = i.envMapCubeUVHeight;
  if (t === null) return null;
  const e = Math.log2(t) - 2,
    n = 1 / t;
  return {
    texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 112)),
    texelHeight: n,
    maxMip: e,
  };
}
function mm(i, t, e, n) {
  const s = i.getContext(),
    r = e.defines;
  let a = e.vertexShader,
    o = e.fragmentShader;
  const l = dm(e),
    c = hm(e),
    h = um(e),
    u = fm(e),
    f = pm(e),
    p = nm(e),
    _ = im(r),
    x = s.createProgram();
  let m,
    d,
    b = e.glslVersion
      ? "#version " +
        e.glslVersion +
        `
`
      : "";
  (e.isRawShaderMaterial
    ? ((m = [
        "#define SHADER_TYPE " + e.shaderType,
        "#define SHADER_NAME " + e.shaderName,
        _,
      ].filter(Xi).join(`
`)),
      m.length > 0 &&
        (m += `
`),
      (d = [
        "#define SHADER_TYPE " + e.shaderType,
        "#define SHADER_NAME " + e.shaderName,
        _,
      ].filter(Xi).join(`
`)),
      d.length > 0 &&
        (d += `
`))
    : ((m = [
        lc(e),
        "#define SHADER_TYPE " + e.shaderType,
        "#define SHADER_NAME " + e.shaderName,
        _,
        e.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
        e.batching ? "#define USE_BATCHING" : "",
        e.batchingColor ? "#define USE_BATCHING_COLOR" : "",
        e.instancing ? "#define USE_INSTANCING" : "",
        e.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
        e.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
        e.useFog && e.fog ? "#define USE_FOG" : "",
        e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "",
        e.map ? "#define USE_MAP" : "",
        e.envMap ? "#define USE_ENVMAP" : "",
        e.envMap ? "#define " + h : "",
        e.lightMap ? "#define USE_LIGHTMAP" : "",
        e.aoMap ? "#define USE_AOMAP" : "",
        e.bumpMap ? "#define USE_BUMPMAP" : "",
        e.normalMap ? "#define USE_NORMALMAP" : "",
        e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
        e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
        e.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
        e.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
        e.anisotropy ? "#define USE_ANISOTROPY" : "",
        e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
        e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
        e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
        e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
        e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
        e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
        e.specularMap ? "#define USE_SPECULARMAP" : "",
        e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
        e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
        e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
        e.metalnessMap ? "#define USE_METALNESSMAP" : "",
        e.alphaMap ? "#define USE_ALPHAMAP" : "",
        e.alphaHash ? "#define USE_ALPHAHASH" : "",
        e.transmission ? "#define USE_TRANSMISSION" : "",
        e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
        e.thicknessMap ? "#define USE_THICKNESSMAP" : "",
        e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
        e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
        e.mapUv ? "#define MAP_UV " + e.mapUv : "",
        e.alphaMapUv ? "#define ALPHAMAP_UV " + e.alphaMapUv : "",
        e.lightMapUv ? "#define LIGHTMAP_UV " + e.lightMapUv : "",
        e.aoMapUv ? "#define AOMAP_UV " + e.aoMapUv : "",
        e.emissiveMapUv ? "#define EMISSIVEMAP_UV " + e.emissiveMapUv : "",
        e.bumpMapUv ? "#define BUMPMAP_UV " + e.bumpMapUv : "",
        e.normalMapUv ? "#define NORMALMAP_UV " + e.normalMapUv : "",
        e.displacementMapUv
          ? "#define DISPLACEMENTMAP_UV " + e.displacementMapUv
          : "",
        e.metalnessMapUv ? "#define METALNESSMAP_UV " + e.metalnessMapUv : "",
        e.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + e.roughnessMapUv : "",
        e.anisotropyMapUv
          ? "#define ANISOTROPYMAP_UV " + e.anisotropyMapUv
          : "",
        e.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + e.clearcoatMapUv : "",
        e.clearcoatNormalMapUv
          ? "#define CLEARCOAT_NORMALMAP_UV " + e.clearcoatNormalMapUv
          : "",
        e.clearcoatRoughnessMapUv
          ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + e.clearcoatRoughnessMapUv
          : "",
        e.iridescenceMapUv
          ? "#define IRIDESCENCEMAP_UV " + e.iridescenceMapUv
          : "",
        e.iridescenceThicknessMapUv
          ? "#define IRIDESCENCE_THICKNESSMAP_UV " + e.iridescenceThicknessMapUv
          : "",
        e.sheenColorMapUv
          ? "#define SHEEN_COLORMAP_UV " + e.sheenColorMapUv
          : "",
        e.sheenRoughnessMapUv
          ? "#define SHEEN_ROUGHNESSMAP_UV " + e.sheenRoughnessMapUv
          : "",
        e.specularMapUv ? "#define SPECULARMAP_UV " + e.specularMapUv : "",
        e.specularColorMapUv
          ? "#define SPECULAR_COLORMAP_UV " + e.specularColorMapUv
          : "",
        e.specularIntensityMapUv
          ? "#define SPECULAR_INTENSITYMAP_UV " + e.specularIntensityMapUv
          : "",
        e.transmissionMapUv
          ? "#define TRANSMISSIONMAP_UV " + e.transmissionMapUv
          : "",
        e.thicknessMapUv ? "#define THICKNESSMAP_UV " + e.thicknessMapUv : "",
        e.vertexTangents && e.flatShading === !1 ? "#define USE_TANGENT" : "",
        e.vertexColors ? "#define USE_COLOR" : "",
        e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
        e.vertexUv1s ? "#define USE_UV1" : "",
        e.vertexUv2s ? "#define USE_UV2" : "",
        e.vertexUv3s ? "#define USE_UV3" : "",
        e.pointsUvs ? "#define USE_POINTS_UV" : "",
        e.flatShading ? "#define FLAT_SHADED" : "",
        e.skinning ? "#define USE_SKINNING" : "",
        e.morphTargets ? "#define USE_MORPHTARGETS" : "",
        e.morphNormals && e.flatShading === !1
          ? "#define USE_MORPHNORMALS"
          : "",
        e.morphColors ? "#define USE_MORPHCOLORS" : "",
        e.morphTargetsCount > 0
          ? "#define MORPHTARGETS_TEXTURE_STRIDE " + e.morphTextureStride
          : "",
        e.morphTargetsCount > 0
          ? "#define MORPHTARGETS_COUNT " + e.morphTargetsCount
          : "",
        e.doubleSided ? "#define DOUBLE_SIDED" : "",
        e.flipSided ? "#define FLIP_SIDED" : "",
        e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
        e.shadowMapEnabled ? "#define " + l : "",
        e.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
        e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
        e.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
        e.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
        "uniform mat4 modelMatrix;",
        "uniform mat4 modelViewMatrix;",
        "uniform mat4 projectionMatrix;",
        "uniform mat4 viewMatrix;",
        "uniform mat3 normalMatrix;",
        "uniform vec3 cameraPosition;",
        "uniform bool isOrthographic;",
        "#ifdef USE_INSTANCING",
        "	attribute mat4 instanceMatrix;",
        "#endif",
        "#ifdef USE_INSTANCING_COLOR",
        "	attribute vec3 instanceColor;",
        "#endif",
        "#ifdef USE_INSTANCING_MORPH",
        "	uniform sampler2D morphTexture;",
        "#endif",
        "attribute vec3 position;",
        "attribute vec3 normal;",
        "attribute vec2 uv;",
        "#ifdef USE_UV1",
        "	attribute vec2 uv1;",
        "#endif",
        "#ifdef USE_UV2",
        "	attribute vec2 uv2;",
        "#endif",
        "#ifdef USE_UV3",
        "	attribute vec2 uv3;",
        "#endif",
        "#ifdef USE_TANGENT",
        "	attribute vec4 tangent;",
        "#endif",
        "#if defined( USE_COLOR_ALPHA )",
        "	attribute vec4 color;",
        "#elif defined( USE_COLOR )",
        "	attribute vec3 color;",
        "#endif",
        "#ifdef USE_SKINNING",
        "	attribute vec4 skinIndex;",
        "	attribute vec4 skinWeight;",
        "#endif",
        `
`,
      ].filter(Xi).join(`
`)),
      (d = [
        lc(e),
        "#define SHADER_TYPE " + e.shaderType,
        "#define SHADER_NAME " + e.shaderName,
        _,
        e.useFog && e.fog ? "#define USE_FOG" : "",
        e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "",
        e.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
        e.map ? "#define USE_MAP" : "",
        e.matcap ? "#define USE_MATCAP" : "",
        e.envMap ? "#define USE_ENVMAP" : "",
        e.envMap ? "#define " + c : "",
        e.envMap ? "#define " + h : "",
        e.envMap ? "#define " + u : "",
        f ? "#define CUBEUV_TEXEL_WIDTH " + f.texelWidth : "",
        f ? "#define CUBEUV_TEXEL_HEIGHT " + f.texelHeight : "",
        f ? "#define CUBEUV_MAX_MIP " + f.maxMip + ".0" : "",
        e.lightMap ? "#define USE_LIGHTMAP" : "",
        e.aoMap ? "#define USE_AOMAP" : "",
        e.bumpMap ? "#define USE_BUMPMAP" : "",
        e.normalMap ? "#define USE_NORMALMAP" : "",
        e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
        e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
        e.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
        e.anisotropy ? "#define USE_ANISOTROPY" : "",
        e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
        e.clearcoat ? "#define USE_CLEARCOAT" : "",
        e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
        e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
        e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
        e.dispersion ? "#define USE_DISPERSION" : "",
        e.iridescence ? "#define USE_IRIDESCENCE" : "",
        e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
        e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
        e.specularMap ? "#define USE_SPECULARMAP" : "",
        e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
        e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
        e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
        e.metalnessMap ? "#define USE_METALNESSMAP" : "",
        e.alphaMap ? "#define USE_ALPHAMAP" : "",
        e.alphaTest ? "#define USE_ALPHATEST" : "",
        e.alphaHash ? "#define USE_ALPHAHASH" : "",
        e.sheen ? "#define USE_SHEEN" : "",
        e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
        e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
        e.transmission ? "#define USE_TRANSMISSION" : "",
        e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
        e.thicknessMap ? "#define USE_THICKNESSMAP" : "",
        e.vertexTangents && e.flatShading === !1 ? "#define USE_TANGENT" : "",
        e.vertexColors || e.instancingColor || e.batchingColor
          ? "#define USE_COLOR"
          : "",
        e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
        e.vertexUv1s ? "#define USE_UV1" : "",
        e.vertexUv2s ? "#define USE_UV2" : "",
        e.vertexUv3s ? "#define USE_UV3" : "",
        e.pointsUvs ? "#define USE_POINTS_UV" : "",
        e.gradientMap ? "#define USE_GRADIENTMAP" : "",
        e.flatShading ? "#define FLAT_SHADED" : "",
        e.doubleSided ? "#define DOUBLE_SIDED" : "",
        e.flipSided ? "#define FLIP_SIDED" : "",
        e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
        e.shadowMapEnabled ? "#define " + l : "",
        e.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
        e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
        e.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
        e.decodeVideoTextureEmissive
          ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE"
          : "",
        e.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
        e.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
        "uniform mat4 viewMatrix;",
        "uniform vec3 cameraPosition;",
        "uniform bool isOrthographic;",
        e.toneMapping !== Ln ? "#define TONE_MAPPING" : "",
        e.toneMapping !== Ln ? Bt.tonemapping_pars_fragment : "",
        e.toneMapping !== Ln ? tm("toneMapping", e.toneMapping) : "",
        e.dithering ? "#define DITHERING" : "",
        e.opaque ? "#define OPAQUE" : "",
        Bt.colorspace_pars_fragment,
        Qp("linearToOutputTexel", e.outputColorSpace),
        em(),
        e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "",
        `
`,
      ].filter(Xi).join(`
`))),
    (a = Pa(a)),
    (a = ac(a, e)),
    (a = oc(a, e)),
    (o = Pa(o)),
    (o = ac(o, e)),
    (o = oc(o, e)),
    (a = cc(a)),
    (o = cc(o)),
    e.isRawShaderMaterial !== !0 &&
      ((b = `#version 300 es
`),
      (m =
        [
          p,
          "#define attribute in",
          "#define varying out",
          "#define texture2D texture",
        ].join(`
`) +
        `
` +
        m),
      (d =
        [
          "#define varying in",
          e.glslVersion === po
            ? ""
            : "layout(location = 0) out highp vec4 pc_fragColor;",
          e.glslVersion === po ? "" : "#define gl_FragColor pc_fragColor",
          "#define gl_FragDepthEXT gl_FragDepth",
          "#define texture2D texture",
          "#define textureCube texture",
          "#define texture2DProj textureProj",
          "#define texture2DLodEXT textureLod",
          "#define texture2DProjLodEXT textureProjLod",
          "#define textureCubeLodEXT textureLod",
          "#define texture2DGradEXT textureGrad",
          "#define texture2DProjGradEXT textureProjGrad",
          "#define textureCubeGradEXT textureGrad",
        ].join(`
`) +
        `
` +
        d)));
  const T = b + m + a,
    y = b + d + o,
    R = ic(s, s.VERTEX_SHADER, T),
    w = ic(s, s.FRAGMENT_SHADER, y);
  (s.attachShader(x, R),
    s.attachShader(x, w),
    e.index0AttributeName !== void 0
      ? s.bindAttribLocation(x, 0, e.index0AttributeName)
      : e.morphTargets === !0 && s.bindAttribLocation(x, 0, "position"),
    s.linkProgram(x));
  function C(P) {
    if (i.debug.checkShaderErrors) {
      const N = s.getProgramInfoLog(x) || "",
        B = s.getShaderInfoLog(R) || "",
        W = s.getShaderInfoLog(w) || "",
        G = N.trim(),
        X = B.trim(),
        j = W.trim();
      let H = !0,
        rt = !0;
      if (s.getProgramParameter(x, s.LINK_STATUS) === !1)
        if (((H = !1), typeof i.debug.onShaderError == "function"))
          i.debug.onShaderError(s, x, R, w);
        else {
          const lt = rc(s, R, "vertex"),
            bt = rc(s, w, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " +
              s.getError() +
              " - VALIDATE_STATUS " +
              s.getProgramParameter(x, s.VALIDATE_STATUS) +
              `

Material Name: ` +
              P.name +
              `
Material Type: ` +
              P.type +
              `

Program Info Log: ` +
              G +
              `
` +
              lt +
              `
` +
              bt,
          );
        }
      else
        G !== ""
          ? console.warn("THREE.WebGLProgram: Program Info Log:", G)
          : (X === "" || j === "") && (rt = !1);
      rt &&
        (P.diagnostics = {
          runnable: H,
          programLog: G,
          vertexShader: { log: X, prefix: m },
          fragmentShader: { log: j, prefix: d },
        });
    }
    (s.deleteShader(R), s.deleteShader(w), (U = new Bs(s, x)), (S = sm(s, x)));
  }
  let U;
  this.getUniforms = function () {
    return (U === void 0 && C(this), U);
  };
  let S;
  this.getAttributes = function () {
    return (S === void 0 && C(this), S);
  };
  let M = e.rendererExtensionParallelShaderCompile === !1;
  return (
    (this.isReady = function () {
      return (M === !1 && (M = s.getProgramParameter(x, jp)), M);
    }),
    (this.destroy = function () {
      (n.releaseStatesOfProgram(this),
        s.deleteProgram(x),
        (this.program = void 0));
    }),
    (this.type = e.shaderType),
    (this.name = e.shaderName),
    (this.id = Kp++),
    (this.cacheKey = t),
    (this.usedTimes = 1),
    (this.program = x),
    (this.vertexShader = R),
    (this.fragmentShader = w),
    this
  );
}
let gm = 0;
class _m {
  constructor() {
    ((this.shaderCache = new Map()), (this.materialCache = new Map()));
  }
  update(t) {
    const e = t.vertexShader,
      n = t.fragmentShader,
      s = this._getShaderStage(e),
      r = this._getShaderStage(n),
      a = this._getShaderCacheForMaterial(t);
    return (
      a.has(s) === !1 && (a.add(s), s.usedTimes++),
      a.has(r) === !1 && (a.add(r), r.usedTimes++),
      this
    );
  }
  remove(t) {
    const e = this.materialCache.get(t);
    for (const n of e)
      (n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code));
    return (this.materialCache.delete(t), this);
  }
  getVertexShaderID(t) {
    return this._getShaderStage(t.vertexShader).id;
  }
  getFragmentShaderID(t) {
    return this._getShaderStage(t.fragmentShader).id;
  }
  dispose() {
    (this.shaderCache.clear(), this.materialCache.clear());
  }
  _getShaderCacheForMaterial(t) {
    const e = this.materialCache;
    let n = e.get(t);
    return (n === void 0 && ((n = new Set()), e.set(t, n)), n);
  }
  _getShaderStage(t) {
    const e = this.shaderCache;
    let n = e.get(t);
    return (n === void 0 && ((n = new vm(t)), e.set(t, n)), n);
  }
}
class vm {
  constructor(t) {
    ((this.id = gm++), (this.code = t), (this.usedTimes = 0));
  }
}
function xm(i, t, e, n, s, r, a) {
  const o = new Bc(),
    l = new _m(),
    c = new Set(),
    h = [],
    u = s.logarithmicDepthBuffer,
    f = s.vertexTextures;
  let p = s.precision;
  const _ = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshToonMaterial: "toon",
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    MeshMatcapMaterial: "matcap",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite",
  };
  function x(S) {
    return (c.add(S), S === 0 ? "uv" : `uv${S}`);
  }
  function m(S, M, P, N, B) {
    const W = N.fog,
      G = B.geometry,
      X = S.isMeshStandardMaterial ? N.environment : null,
      j = (S.isMeshStandardMaterial ? e : t).get(S.envMap || X),
      H = j && j.mapping === Js ? j.image.height : null,
      rt = _[S.type];
    S.precision !== null &&
      ((p = s.getMaxPrecision(S.precision)),
      p !== S.precision &&
        console.warn(
          "THREE.WebGLProgram.getParameters:",
          S.precision,
          "not supported, using",
          p,
          "instead.",
        ));
    const lt =
        G.morphAttributes.position ||
        G.morphAttributes.normal ||
        G.morphAttributes.color,
      bt = lt !== void 0 ? lt.length : 0;
    let kt = 0;
    (G.morphAttributes.position !== void 0 && (kt = 1),
      G.morphAttributes.normal !== void 0 && (kt = 2),
      G.morphAttributes.color !== void 0 && (kt = 3));
    let ne, ae, Kt, q;
    if (rt) {
      const Zt = on[rt];
      ((ne = Zt.vertexShader), (ae = Zt.fragmentShader));
    } else
      ((ne = S.vertexShader),
        (ae = S.fragmentShader),
        l.update(S),
        (Kt = l.getVertexShaderID(S)),
        (q = l.getFragmentShaderID(S)));
    const Z = i.getRenderTarget(),
      ut = i.state.buffers.depth.getReversed(),
      Lt = B.isInstancedMesh === !0,
      Et = B.isBatchedMesh === !0,
      Wt = !!S.map,
      ye = !!S.matcap,
      A = !!j,
      oe = !!S.aoMap,
      Ut = !!S.lightMap,
      Ct = !!S.bumpMap,
      mt = !!S.normalMap,
      ce = !!S.displacementMap,
      gt = !!S.emissiveMap,
      Ot = !!S.metalnessMap,
      Me = !!S.roughnessMap,
      fe = S.anisotropy > 0,
      E = S.clearcoat > 0,
      g = S.dispersion > 0,
      O = S.iridescence > 0,
      $ = S.sheen > 0,
      K = S.transmission > 0,
      V = fe && !!S.anisotropyMap,
      yt = E && !!S.clearcoatMap,
      nt = E && !!S.clearcoatNormalMap,
      _t = E && !!S.clearcoatRoughnessMap,
      Mt = O && !!S.iridescenceMap,
      tt = O && !!S.iridescenceThicknessMap,
      ct = $ && !!S.sheenColorMap,
      Rt = $ && !!S.sheenRoughnessMap,
      St = !!S.specularMap,
      at = !!S.specularColorMap,
      Nt = !!S.specularIntensityMap,
      D = K && !!S.transmissionMap,
      et = K && !!S.thicknessMap,
      it = !!S.gradientMap,
      ht = !!S.alphaMap,
      J = S.alphaTest > 0,
      Y = !!S.alphaHash,
      pt = !!S.extensions;
    let It = Ln;
    S.toneMapped &&
      (Z === null || Z.isXRRenderTarget === !0) &&
      (It = i.toneMapping);
    const ie = {
      shaderID: rt,
      shaderType: S.type,
      shaderName: S.name,
      vertexShader: ne,
      fragmentShader: ae,
      defines: S.defines,
      customVertexShaderID: Kt,
      customFragmentShaderID: q,
      isRawShaderMaterial: S.isRawShaderMaterial === !0,
      glslVersion: S.glslVersion,
      precision: p,
      batching: Et,
      batchingColor: Et && B._colorsTexture !== null,
      instancing: Lt,
      instancingColor: Lt && B.instanceColor !== null,
      instancingMorph: Lt && B.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace:
        Z === null
          ? i.outputColorSpace
          : Z.isXRRenderTarget === !0
            ? Z.texture.colorSpace
            : Ai,
      alphaToCoverage: !!S.alphaToCoverage,
      map: Wt,
      matcap: ye,
      envMap: A,
      envMapMode: A && j.mapping,
      envMapCubeUVHeight: H,
      aoMap: oe,
      lightMap: Ut,
      bumpMap: Ct,
      normalMap: mt,
      displacementMap: f && ce,
      emissiveMap: gt,
      normalMapObjectSpace: mt && S.normalMapType === dd,
      normalMapTangentSpace: mt && S.normalMapType === Ic,
      metalnessMap: Ot,
      roughnessMap: Me,
      anisotropy: fe,
      anisotropyMap: V,
      clearcoat: E,
      clearcoatMap: yt,
      clearcoatNormalMap: nt,
      clearcoatRoughnessMap: _t,
      dispersion: g,
      iridescence: O,
      iridescenceMap: Mt,
      iridescenceThicknessMap: tt,
      sheen: $,
      sheenColorMap: ct,
      sheenRoughnessMap: Rt,
      specularMap: St,
      specularColorMap: at,
      specularIntensityMap: Nt,
      transmission: K,
      transmissionMap: D,
      thicknessMap: et,
      gradientMap: it,
      opaque:
        S.transparent === !1 && S.blending === Si && S.alphaToCoverage === !1,
      alphaMap: ht,
      alphaTest: J,
      alphaHash: Y,
      combine: S.combine,
      mapUv: Wt && x(S.map.channel),
      aoMapUv: oe && x(S.aoMap.channel),
      lightMapUv: Ut && x(S.lightMap.channel),
      bumpMapUv: Ct && x(S.bumpMap.channel),
      normalMapUv: mt && x(S.normalMap.channel),
      displacementMapUv: ce && x(S.displacementMap.channel),
      emissiveMapUv: gt && x(S.emissiveMap.channel),
      metalnessMapUv: Ot && x(S.metalnessMap.channel),
      roughnessMapUv: Me && x(S.roughnessMap.channel),
      anisotropyMapUv: V && x(S.anisotropyMap.channel),
      clearcoatMapUv: yt && x(S.clearcoatMap.channel),
      clearcoatNormalMapUv: nt && x(S.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: _t && x(S.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Mt && x(S.iridescenceMap.channel),
      iridescenceThicknessMapUv: tt && x(S.iridescenceThicknessMap.channel),
      sheenColorMapUv: ct && x(S.sheenColorMap.channel),
      sheenRoughnessMapUv: Rt && x(S.sheenRoughnessMap.channel),
      specularMapUv: St && x(S.specularMap.channel),
      specularColorMapUv: at && x(S.specularColorMap.channel),
      specularIntensityMapUv: Nt && x(S.specularIntensityMap.channel),
      transmissionMapUv: D && x(S.transmissionMap.channel),
      thicknessMapUv: et && x(S.thicknessMap.channel),
      alphaMapUv: ht && x(S.alphaMap.channel),
      vertexTangents: !!G.attributes.tangent && (mt || fe),
      vertexColors: S.vertexColors,
      vertexAlphas:
        S.vertexColors === !0 &&
        !!G.attributes.color &&
        G.attributes.color.itemSize === 4,
      pointsUvs: B.isPoints === !0 && !!G.attributes.uv && (Wt || ht),
      fog: !!W,
      useFog: S.fog === !0,
      fogExp2: !!W && W.isFogExp2,
      flatShading: S.flatShading === !0 && S.wireframe === !1,
      sizeAttenuation: S.sizeAttenuation === !0,
      logarithmicDepthBuffer: u,
      reversedDepthBuffer: ut,
      skinning: B.isSkinnedMesh === !0,
      morphTargets: G.morphAttributes.position !== void 0,
      morphNormals: G.morphAttributes.normal !== void 0,
      morphColors: G.morphAttributes.color !== void 0,
      morphTargetsCount: bt,
      morphTextureStride: kt,
      numDirLights: M.directional.length,
      numPointLights: M.point.length,
      numSpotLights: M.spot.length,
      numSpotLightMaps: M.spotLightMap.length,
      numRectAreaLights: M.rectArea.length,
      numHemiLights: M.hemi.length,
      numDirLightShadows: M.directionalShadowMap.length,
      numPointLightShadows: M.pointShadowMap.length,
      numSpotLightShadows: M.spotShadowMap.length,
      numSpotLightShadowsWithMaps: M.numSpotLightShadowsWithMaps,
      numLightProbes: M.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: S.dithering,
      shadowMapEnabled: i.shadowMap.enabled && P.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: It,
      decodeVideoTexture:
        Wt &&
        S.map.isVideoTexture === !0 &&
        Yt.getTransfer(S.map.colorSpace) === Qt,
      decodeVideoTextureEmissive:
        gt &&
        S.emissiveMap.isVideoTexture === !0 &&
        Yt.getTransfer(S.emissiveMap.colorSpace) === Qt,
      premultipliedAlpha: S.premultipliedAlpha,
      doubleSided: S.side === Sn,
      flipSided: S.side === Ne,
      useDepthPacking: S.depthPacking >= 0,
      depthPacking: S.depthPacking || 0,
      index0AttributeName: S.index0AttributeName,
      extensionClipCullDistance:
        pt &&
        S.extensions.clipCullDistance === !0 &&
        n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw:
        ((pt && S.extensions.multiDraw === !0) || Et) &&
        n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has(
        "KHR_parallel_shader_compile",
      ),
      customProgramCacheKey: S.customProgramCacheKey(),
    };
    return (
      (ie.vertexUv1s = c.has(1)),
      (ie.vertexUv2s = c.has(2)),
      (ie.vertexUv3s = c.has(3)),
      c.clear(),
      ie
    );
  }
  function d(S) {
    const M = [];
    if (
      (S.shaderID
        ? M.push(S.shaderID)
        : (M.push(S.customVertexShaderID), M.push(S.customFragmentShaderID)),
      S.defines !== void 0)
    )
      for (const P in S.defines) (M.push(P), M.push(S.defines[P]));
    return (
      S.isRawShaderMaterial === !1 &&
        (b(M, S), T(M, S), M.push(i.outputColorSpace)),
      M.push(S.customProgramCacheKey),
      M.join()
    );
  }
  function b(S, M) {
    (S.push(M.precision),
      S.push(M.outputColorSpace),
      S.push(M.envMapMode),
      S.push(M.envMapCubeUVHeight),
      S.push(M.mapUv),
      S.push(M.alphaMapUv),
      S.push(M.lightMapUv),
      S.push(M.aoMapUv),
      S.push(M.bumpMapUv),
      S.push(M.normalMapUv),
      S.push(M.displacementMapUv),
      S.push(M.emissiveMapUv),
      S.push(M.metalnessMapUv),
      S.push(M.roughnessMapUv),
      S.push(M.anisotropyMapUv),
      S.push(M.clearcoatMapUv),
      S.push(M.clearcoatNormalMapUv),
      S.push(M.clearcoatRoughnessMapUv),
      S.push(M.iridescenceMapUv),
      S.push(M.iridescenceThicknessMapUv),
      S.push(M.sheenColorMapUv),
      S.push(M.sheenRoughnessMapUv),
      S.push(M.specularMapUv),
      S.push(M.specularColorMapUv),
      S.push(M.specularIntensityMapUv),
      S.push(M.transmissionMapUv),
      S.push(M.thicknessMapUv),
      S.push(M.combine),
      S.push(M.fogExp2),
      S.push(M.sizeAttenuation),
      S.push(M.morphTargetsCount),
      S.push(M.morphAttributeCount),
      S.push(M.numDirLights),
      S.push(M.numPointLights),
      S.push(M.numSpotLights),
      S.push(M.numSpotLightMaps),
      S.push(M.numHemiLights),
      S.push(M.numRectAreaLights),
      S.push(M.numDirLightShadows),
      S.push(M.numPointLightShadows),
      S.push(M.numSpotLightShadows),
      S.push(M.numSpotLightShadowsWithMaps),
      S.push(M.numLightProbes),
      S.push(M.shadowMapType),
      S.push(M.toneMapping),
      S.push(M.numClippingPlanes),
      S.push(M.numClipIntersection),
      S.push(M.depthPacking));
  }
  function T(S, M) {
    (o.disableAll(),
      M.supportsVertexTextures && o.enable(0),
      M.instancing && o.enable(1),
      M.instancingColor && o.enable(2),
      M.instancingMorph && o.enable(3),
      M.matcap && o.enable(4),
      M.envMap && o.enable(5),
      M.normalMapObjectSpace && o.enable(6),
      M.normalMapTangentSpace && o.enable(7),
      M.clearcoat && o.enable(8),
      M.iridescence && o.enable(9),
      M.alphaTest && o.enable(10),
      M.vertexColors && o.enable(11),
      M.vertexAlphas && o.enable(12),
      M.vertexUv1s && o.enable(13),
      M.vertexUv2s && o.enable(14),
      M.vertexUv3s && o.enable(15),
      M.vertexTangents && o.enable(16),
      M.anisotropy && o.enable(17),
      M.alphaHash && o.enable(18),
      M.batching && o.enable(19),
      M.dispersion && o.enable(20),
      M.batchingColor && o.enable(21),
      M.gradientMap && o.enable(22),
      S.push(o.mask),
      o.disableAll(),
      M.fog && o.enable(0),
      M.useFog && o.enable(1),
      M.flatShading && o.enable(2),
      M.logarithmicDepthBuffer && o.enable(3),
      M.reversedDepthBuffer && o.enable(4),
      M.skinning && o.enable(5),
      M.morphTargets && o.enable(6),
      M.morphNormals && o.enable(7),
      M.morphColors && o.enable(8),
      M.premultipliedAlpha && o.enable(9),
      M.shadowMapEnabled && o.enable(10),
      M.doubleSided && o.enable(11),
      M.flipSided && o.enable(12),
      M.useDepthPacking && o.enable(13),
      M.dithering && o.enable(14),
      M.transmission && o.enable(15),
      M.sheen && o.enable(16),
      M.opaque && o.enable(17),
      M.pointsUvs && o.enable(18),
      M.decodeVideoTexture && o.enable(19),
      M.decodeVideoTextureEmissive && o.enable(20),
      M.alphaToCoverage && o.enable(21),
      S.push(o.mask));
  }
  function y(S) {
    const M = _[S.type];
    let P;
    if (M) {
      const N = on[M];
      P = kd.clone(N.uniforms);
    } else P = S.uniforms;
    return P;
  }
  function R(S, M) {
    let P;
    for (let N = 0, B = h.length; N < B; N++) {
      const W = h[N];
      if (W.cacheKey === M) {
        ((P = W), ++P.usedTimes);
        break;
      }
    }
    return (P === void 0 && ((P = new mm(i, M, S, r)), h.push(P)), P);
  }
  function w(S) {
    if (--S.usedTimes === 0) {
      const M = h.indexOf(S);
      ((h[M] = h[h.length - 1]), h.pop(), S.destroy());
    }
  }
  function C(S) {
    l.remove(S);
  }
  function U() {
    l.dispose();
  }
  return {
    getParameters: m,
    getProgramCacheKey: d,
    getUniforms: y,
    acquireProgram: R,
    releaseProgram: w,
    releaseShaderCache: C,
    programs: h,
    dispose: U,
  };
}
function Mm() {
  let i = new WeakMap();
  function t(a) {
    return i.has(a);
  }
  function e(a) {
    let o = i.get(a);
    return (o === void 0 && ((o = {}), i.set(a, o)), o);
  }
  function n(a) {
    i.delete(a);
  }
  function s(a, o, l) {
    i.get(a)[o] = l;
  }
  function r() {
    i = new WeakMap();
  }
  return { has: t, get: e, remove: n, update: s, dispose: r };
}
function Sm(i, t) {
  return i.groupOrder !== t.groupOrder
    ? i.groupOrder - t.groupOrder
    : i.renderOrder !== t.renderOrder
      ? i.renderOrder - t.renderOrder
      : i.material.id !== t.material.id
        ? i.material.id - t.material.id
        : i.z !== t.z
          ? i.z - t.z
          : i.id - t.id;
}
function dc(i, t) {
  return i.groupOrder !== t.groupOrder
    ? i.groupOrder - t.groupOrder
    : i.renderOrder !== t.renderOrder
      ? i.renderOrder - t.renderOrder
      : i.z !== t.z
        ? t.z - i.z
        : i.id - t.id;
}
function hc() {
  const i = [];
  let t = 0;
  const e = [],
    n = [],
    s = [];
  function r() {
    ((t = 0), (e.length = 0), (n.length = 0), (s.length = 0));
  }
  function a(u, f, p, _, x, m) {
    let d = i[t];
    return (
      d === void 0
        ? ((d = {
            id: u.id,
            object: u,
            geometry: f,
            material: p,
            groupOrder: _,
            renderOrder: u.renderOrder,
            z: x,
            group: m,
          }),
          (i[t] = d))
        : ((d.id = u.id),
          (d.object = u),
          (d.geometry = f),
          (d.material = p),
          (d.groupOrder = _),
          (d.renderOrder = u.renderOrder),
          (d.z = x),
          (d.group = m)),
      t++,
      d
    );
  }
  function o(u, f, p, _, x, m) {
    const d = a(u, f, p, _, x, m);
    p.transmission > 0
      ? n.push(d)
      : p.transparent === !0
        ? s.push(d)
        : e.push(d);
  }
  function l(u, f, p, _, x, m) {
    const d = a(u, f, p, _, x, m);
    p.transmission > 0
      ? n.unshift(d)
      : p.transparent === !0
        ? s.unshift(d)
        : e.unshift(d);
  }
  function c(u, f) {
    (e.length > 1 && e.sort(u || Sm),
      n.length > 1 && n.sort(f || dc),
      s.length > 1 && s.sort(f || dc));
  }
  function h() {
    for (let u = t, f = i.length; u < f; u++) {
      const p = i[u];
      if (p.id === null) break;
      ((p.id = null),
        (p.object = null),
        (p.geometry = null),
        (p.material = null),
        (p.group = null));
    }
  }
  return {
    opaque: e,
    transmissive: n,
    transparent: s,
    init: r,
    push: o,
    unshift: l,
    finish: h,
    sort: c,
  };
}
function ym() {
  let i = new WeakMap();
  function t(n, s) {
    const r = i.get(n);
    let a;
    return (
      r === void 0
        ? ((a = new hc()), i.set(n, [a]))
        : s >= r.length
          ? ((a = new hc()), r.push(a))
          : (a = r[s]),
      a
    );
  }
  function e() {
    i = new WeakMap();
  }
  return { get: t, dispose: e };
}
function Em() {
  const i = {};
  return {
    get: function (t) {
      if (i[t.id] !== void 0) return i[t.id];
      let e;
      switch (t.type) {
        case "DirectionalLight":
          e = { direction: new F(), color: new Ht() };
          break;
        case "SpotLight":
          e = {
            position: new F(),
            direction: new F(),
            color: new Ht(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0,
          };
          break;
        case "PointLight":
          e = { position: new F(), color: new Ht(), distance: 0, decay: 0 };
          break;
        case "HemisphereLight":
          e = { direction: new F(), skyColor: new Ht(), groundColor: new Ht() };
          break;
        case "RectAreaLight":
          e = {
            color: new Ht(),
            position: new F(),
            halfWidth: new F(),
            halfHeight: new F(),
          };
          break;
      }
      return ((i[t.id] = e), e);
    },
  };
}
function bm() {
  const i = {};
  return {
    get: function (t) {
      if (i[t.id] !== void 0) return i[t.id];
      let e;
      switch (t.type) {
        case "DirectionalLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Xt(),
          };
          break;
        case "SpotLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Xt(),
          };
          break;
        case "PointLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Xt(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3,
          };
          break;
      }
      return ((i[t.id] = e), e);
    },
  };
}
let Tm = 0;
function Am(i, t) {
  return (
    (t.castShadow ? 2 : 0) -
    (i.castShadow ? 2 : 0) +
    (t.map ? 1 : 0) -
    (i.map ? 1 : 0)
  );
}
function wm(i) {
  const t = new Em(),
    e = bm(),
    n = {
      version: 0,
      hash: {
        directionalLength: -1,
        pointLength: -1,
        spotLength: -1,
        rectAreaLength: -1,
        hemiLength: -1,
        numDirectionalShadows: -1,
        numPointShadows: -1,
        numSpotShadows: -1,
        numSpotMaps: -1,
        numLightProbes: -1,
      },
      ambient: [0, 0, 0],
      probe: [],
      directional: [],
      directionalShadow: [],
      directionalShadowMap: [],
      directionalShadowMatrix: [],
      spot: [],
      spotLightMap: [],
      spotShadow: [],
      spotShadowMap: [],
      spotLightMatrix: [],
      rectArea: [],
      rectAreaLTC1: null,
      rectAreaLTC2: null,
      point: [],
      pointShadow: [],
      pointShadowMap: [],
      pointShadowMatrix: [],
      hemi: [],
      numSpotLightShadowsWithMaps: 0,
      numLightProbes: 0,
    };
  for (let c = 0; c < 9; c++) n.probe.push(new F());
  const s = new F(),
    r = new re(),
    a = new re();
  function o(c) {
    let h = 0,
      u = 0,
      f = 0;
    for (let S = 0; S < 9; S++) n.probe[S].set(0, 0, 0);
    let p = 0,
      _ = 0,
      x = 0,
      m = 0,
      d = 0,
      b = 0,
      T = 0,
      y = 0,
      R = 0,
      w = 0,
      C = 0;
    c.sort(Am);
    for (let S = 0, M = c.length; S < M; S++) {
      const P = c[S],
        N = P.color,
        B = P.intensity,
        W = P.distance,
        G = P.shadow && P.shadow.map ? P.shadow.map.texture : null;
      if (P.isAmbientLight) ((h += N.r * B), (u += N.g * B), (f += N.b * B));
      else if (P.isLightProbe) {
        for (let X = 0; X < 9; X++)
          n.probe[X].addScaledVector(P.sh.coefficients[X], B);
        C++;
      } else if (P.isDirectionalLight) {
        const X = t.get(P);
        if ((X.color.copy(P.color).multiplyScalar(P.intensity), P.castShadow)) {
          const j = P.shadow,
            H = e.get(P);
          ((H.shadowIntensity = j.intensity),
            (H.shadowBias = j.bias),
            (H.shadowNormalBias = j.normalBias),
            (H.shadowRadius = j.radius),
            (H.shadowMapSize = j.mapSize),
            (n.directionalShadow[p] = H),
            (n.directionalShadowMap[p] = G),
            (n.directionalShadowMatrix[p] = P.shadow.matrix),
            b++);
        }
        ((n.directional[p] = X), p++);
      } else if (P.isSpotLight) {
        const X = t.get(P);
        (X.position.setFromMatrixPosition(P.matrixWorld),
          X.color.copy(N).multiplyScalar(B),
          (X.distance = W),
          (X.coneCos = Math.cos(P.angle)),
          (X.penumbraCos = Math.cos(P.angle * (1 - P.penumbra))),
          (X.decay = P.decay),
          (n.spot[x] = X));
        const j = P.shadow;
        if (
          (P.map &&
            ((n.spotLightMap[R] = P.map),
            R++,
            j.updateMatrices(P),
            P.castShadow && w++),
          (n.spotLightMatrix[x] = j.matrix),
          P.castShadow)
        ) {
          const H = e.get(P);
          ((H.shadowIntensity = j.intensity),
            (H.shadowBias = j.bias),
            (H.shadowNormalBias = j.normalBias),
            (H.shadowRadius = j.radius),
            (H.shadowMapSize = j.mapSize),
            (n.spotShadow[x] = H),
            (n.spotShadowMap[x] = G),
            y++);
        }
        x++;
      } else if (P.isRectAreaLight) {
        const X = t.get(P);
        (X.color.copy(N).multiplyScalar(B),
          X.halfWidth.set(P.width * 0.5, 0, 0),
          X.halfHeight.set(0, P.height * 0.5, 0),
          (n.rectArea[m] = X),
          m++);
      } else if (P.isPointLight) {
        const X = t.get(P);
        if (
          (X.color.copy(P.color).multiplyScalar(P.intensity),
          (X.distance = P.distance),
          (X.decay = P.decay),
          P.castShadow)
        ) {
          const j = P.shadow,
            H = e.get(P);
          ((H.shadowIntensity = j.intensity),
            (H.shadowBias = j.bias),
            (H.shadowNormalBias = j.normalBias),
            (H.shadowRadius = j.radius),
            (H.shadowMapSize = j.mapSize),
            (H.shadowCameraNear = j.camera.near),
            (H.shadowCameraFar = j.camera.far),
            (n.pointShadow[_] = H),
            (n.pointShadowMap[_] = G),
            (n.pointShadowMatrix[_] = P.shadow.matrix),
            T++);
        }
        ((n.point[_] = X), _++);
      } else if (P.isHemisphereLight) {
        const X = t.get(P);
        (X.skyColor.copy(P.color).multiplyScalar(B),
          X.groundColor.copy(P.groundColor).multiplyScalar(B),
          (n.hemi[d] = X),
          d++);
      }
    }
    (m > 0 &&
      (i.has("OES_texture_float_linear") === !0
        ? ((n.rectAreaLTC1 = st.LTC_FLOAT_1), (n.rectAreaLTC2 = st.LTC_FLOAT_2))
        : ((n.rectAreaLTC1 = st.LTC_HALF_1), (n.rectAreaLTC2 = st.LTC_HALF_2))),
      (n.ambient[0] = h),
      (n.ambient[1] = u),
      (n.ambient[2] = f));
    const U = n.hash;
    (U.directionalLength !== p ||
      U.pointLength !== _ ||
      U.spotLength !== x ||
      U.rectAreaLength !== m ||
      U.hemiLength !== d ||
      U.numDirectionalShadows !== b ||
      U.numPointShadows !== T ||
      U.numSpotShadows !== y ||
      U.numSpotMaps !== R ||
      U.numLightProbes !== C) &&
      ((n.directional.length = p),
      (n.spot.length = x),
      (n.rectArea.length = m),
      (n.point.length = _),
      (n.hemi.length = d),
      (n.directionalShadow.length = b),
      (n.directionalShadowMap.length = b),
      (n.pointShadow.length = T),
      (n.pointShadowMap.length = T),
      (n.spotShadow.length = y),
      (n.spotShadowMap.length = y),
      (n.directionalShadowMatrix.length = b),
      (n.pointShadowMatrix.length = T),
      (n.spotLightMatrix.length = y + R - w),
      (n.spotLightMap.length = R),
      (n.numSpotLightShadowsWithMaps = w),
      (n.numLightProbes = C),
      (U.directionalLength = p),
      (U.pointLength = _),
      (U.spotLength = x),
      (U.rectAreaLength = m),
      (U.hemiLength = d),
      (U.numDirectionalShadows = b),
      (U.numPointShadows = T),
      (U.numSpotShadows = y),
      (U.numSpotMaps = R),
      (U.numLightProbes = C),
      (n.version = Tm++));
  }
  function l(c, h) {
    let u = 0,
      f = 0,
      p = 0,
      _ = 0,
      x = 0;
    const m = h.matrixWorldInverse;
    for (let d = 0, b = c.length; d < b; d++) {
      const T = c[d];
      if (T.isDirectionalLight) {
        const y = n.directional[u];
        (y.direction.setFromMatrixPosition(T.matrixWorld),
          s.setFromMatrixPosition(T.target.matrixWorld),
          y.direction.sub(s),
          y.direction.transformDirection(m),
          u++);
      } else if (T.isSpotLight) {
        const y = n.spot[p];
        (y.position.setFromMatrixPosition(T.matrixWorld),
          y.position.applyMatrix4(m),
          y.direction.setFromMatrixPosition(T.matrixWorld),
          s.setFromMatrixPosition(T.target.matrixWorld),
          y.direction.sub(s),
          y.direction.transformDirection(m),
          p++);
      } else if (T.isRectAreaLight) {
        const y = n.rectArea[_];
        (y.position.setFromMatrixPosition(T.matrixWorld),
          y.position.applyMatrix4(m),
          a.identity(),
          r.copy(T.matrixWorld),
          r.premultiply(m),
          a.extractRotation(r),
          y.halfWidth.set(T.width * 0.5, 0, 0),
          y.halfHeight.set(0, T.height * 0.5, 0),
          y.halfWidth.applyMatrix4(a),
          y.halfHeight.applyMatrix4(a),
          _++);
      } else if (T.isPointLight) {
        const y = n.point[f];
        (y.position.setFromMatrixPosition(T.matrixWorld),
          y.position.applyMatrix4(m),
          f++);
      } else if (T.isHemisphereLight) {
        const y = n.hemi[x];
        (y.direction.setFromMatrixPosition(T.matrixWorld),
          y.direction.transformDirection(m),
          x++);
      }
    }
  }
  return { setup: o, setupView: l, state: n };
}
function uc(i) {
  const t = new wm(i),
    e = [],
    n = [];
  function s(h) {
    ((c.camera = h), (e.length = 0), (n.length = 0));
  }
  function r(h) {
    e.push(h);
  }
  function a(h) {
    n.push(h);
  }
  function o() {
    t.setup(e);
  }
  function l(h) {
    t.setupView(e, h);
  }
  const c = {
    lightsArray: e,
    shadowsArray: n,
    camera: null,
    lights: t,
    transmissionRenderTarget: {},
  };
  return {
    init: s,
    state: c,
    setupLights: o,
    setupLightsView: l,
    pushLight: r,
    pushShadow: a,
  };
}
function Rm(i) {
  let t = new WeakMap();
  function e(s, r = 0) {
    const a = t.get(s);
    let o;
    return (
      a === void 0
        ? ((o = new uc(i)), t.set(s, [o]))
        : r >= a.length
          ? ((o = new uc(i)), a.push(o))
          : (o = a[r]),
      o
    );
  }
  function n() {
    t = new WeakMap();
  }
  return { get: e, dispose: n };
}
const Cm = `void main() {
	gl_Position = vec4( position, 1.0 );
}`,
  Pm = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function Dm(i, t, e) {
  let n = new Wa();
  const s = new Xt(),
    r = new Xt(),
    a = new ue(),
    o = new th({ depthPacking: ld }),
    l = new eh(),
    c = {},
    h = e.maxTextureSize,
    u = { [Un]: Ne, [Ne]: Un, [Sn]: Sn },
    f = new Nn({
      defines: { VSM_SAMPLES: 8 },
      uniforms: {
        shadow_pass: { value: null },
        resolution: { value: new Xt() },
        radius: { value: 4 },
      },
      vertexShader: Cm,
      fragmentShader: Pm,
    }),
    p = f.clone();
  p.defines.HORIZONTAL_PASS = 1;
  const _ = new Ze();
  _.setAttribute(
    "position",
    new rn(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3),
  );
  const x = new me(_, f),
    m = this;
  ((this.enabled = !1),
    (this.autoUpdate = !0),
    (this.needsUpdate = !1),
    (this.type = Sc));
  let d = this.type;
  this.render = function (w, C, U) {
    if (
      m.enabled === !1 ||
      (m.autoUpdate === !1 && m.needsUpdate === !1) ||
      w.length === 0
    )
      return;
    const S = i.getRenderTarget(),
      M = i.getActiveCubeFace(),
      P = i.getActiveMipmapLevel(),
      N = i.state;
    (N.setBlending(Dn),
      N.buffers.depth.getReversed() === !0
        ? N.buffers.color.setClear(0, 0, 0, 0)
        : N.buffers.color.setClear(1, 1, 1, 1),
      N.buffers.depth.setTest(!0),
      N.setScissorTest(!1));
    const B = d !== Mn && this.type === Mn,
      W = d === Mn && this.type !== Mn;
    for (let G = 0, X = w.length; G < X; G++) {
      const j = w[G],
        H = j.shadow;
      if (H === void 0) {
        console.warn("THREE.WebGLShadowMap:", j, "has no shadow.");
        continue;
      }
      if (H.autoUpdate === !1 && H.needsUpdate === !1) continue;
      s.copy(H.mapSize);
      const rt = H.getFrameExtents();
      if (
        (s.multiply(rt),
        r.copy(H.mapSize),
        (s.x > h || s.y > h) &&
          (s.x > h &&
            ((r.x = Math.floor(h / rt.x)),
            (s.x = r.x * rt.x),
            (H.mapSize.x = r.x)),
          s.y > h &&
            ((r.y = Math.floor(h / rt.y)),
            (s.y = r.y * rt.y),
            (H.mapSize.y = r.y))),
        H.map === null || B === !0 || W === !0)
      ) {
        const bt = this.type !== Mn ? { minFilter: Ge, magFilter: Ge } : {};
        (H.map !== null && H.map.dispose(),
          (H.map = new ei(s.x, s.y, bt)),
          (H.map.texture.name = j.name + ".shadowMap"),
          H.camera.updateProjectionMatrix());
      }
      (i.setRenderTarget(H.map), i.clear());
      const lt = H.getViewportCount();
      for (let bt = 0; bt < lt; bt++) {
        const kt = H.getViewport(bt);
        (a.set(r.x * kt.x, r.y * kt.y, r.x * kt.z, r.y * kt.w),
          N.viewport(a),
          H.updateMatrices(j, bt),
          (n = H.getFrustum()),
          y(C, U, H.camera, j, this.type));
      }
      (H.isPointLightShadow !== !0 && this.type === Mn && b(H, U),
        (H.needsUpdate = !1));
    }
    ((d = this.type), (m.needsUpdate = !1), i.setRenderTarget(S, M, P));
  };
  function b(w, C) {
    const U = t.update(x);
    (f.defines.VSM_SAMPLES !== w.blurSamples &&
      ((f.defines.VSM_SAMPLES = w.blurSamples),
      (p.defines.VSM_SAMPLES = w.blurSamples),
      (f.needsUpdate = !0),
      (p.needsUpdate = !0)),
      w.mapPass === null && (w.mapPass = new ei(s.x, s.y)),
      (f.uniforms.shadow_pass.value = w.map.texture),
      (f.uniforms.resolution.value = w.mapSize),
      (f.uniforms.radius.value = w.radius),
      i.setRenderTarget(w.mapPass),
      i.clear(),
      i.renderBufferDirect(C, null, U, f, x, null),
      (p.uniforms.shadow_pass.value = w.mapPass.texture),
      (p.uniforms.resolution.value = w.mapSize),
      (p.uniforms.radius.value = w.radius),
      i.setRenderTarget(w.map),
      i.clear(),
      i.renderBufferDirect(C, null, U, p, x, null));
  }
  function T(w, C, U, S) {
    let M = null;
    const P =
      U.isPointLight === !0 ? w.customDistanceMaterial : w.customDepthMaterial;
    if (P !== void 0) M = P;
    else if (
      ((M = U.isPointLight === !0 ? l : o),
      (i.localClippingEnabled &&
        C.clipShadows === !0 &&
        Array.isArray(C.clippingPlanes) &&
        C.clippingPlanes.length !== 0) ||
        (C.displacementMap && C.displacementScale !== 0) ||
        (C.alphaMap && C.alphaTest > 0) ||
        (C.map && C.alphaTest > 0) ||
        C.alphaToCoverage === !0)
    ) {
      const N = M.uuid,
        B = C.uuid;
      let W = c[N];
      W === void 0 && ((W = {}), (c[N] = W));
      let G = W[B];
      (G === void 0 &&
        ((G = M.clone()), (W[B] = G), C.addEventListener("dispose", R)),
        (M = G));
    }
    if (
      ((M.visible = C.visible),
      (M.wireframe = C.wireframe),
      S === Mn
        ? (M.side = C.shadowSide !== null ? C.shadowSide : C.side)
        : (M.side = C.shadowSide !== null ? C.shadowSide : u[C.side]),
      (M.alphaMap = C.alphaMap),
      (M.alphaTest = C.alphaToCoverage === !0 ? 0.5 : C.alphaTest),
      (M.map = C.map),
      (M.clipShadows = C.clipShadows),
      (M.clippingPlanes = C.clippingPlanes),
      (M.clipIntersection = C.clipIntersection),
      (M.displacementMap = C.displacementMap),
      (M.displacementScale = C.displacementScale),
      (M.displacementBias = C.displacementBias),
      (M.wireframeLinewidth = C.wireframeLinewidth),
      (M.linewidth = C.linewidth),
      U.isPointLight === !0 && M.isMeshDistanceMaterial === !0)
    ) {
      const N = i.properties.get(M);
      N.light = U;
    }
    return M;
  }
  function y(w, C, U, S, M) {
    if (w.visible === !1) return;
    if (
      w.layers.test(C.layers) &&
      (w.isMesh || w.isLine || w.isPoints) &&
      (w.castShadow || (w.receiveShadow && M === Mn)) &&
      (!w.frustumCulled || n.intersectsObject(w))
    ) {
      w.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse, w.matrixWorld);
      const B = t.update(w),
        W = w.material;
      if (Array.isArray(W)) {
        const G = B.groups;
        for (let X = 0, j = G.length; X < j; X++) {
          const H = G[X],
            rt = W[H.materialIndex];
          if (rt && rt.visible) {
            const lt = T(w, rt, S, M);
            (w.onBeforeShadow(i, w, C, U, B, lt, H),
              i.renderBufferDirect(U, null, B, lt, w, H),
              w.onAfterShadow(i, w, C, U, B, lt, H));
          }
        }
      } else if (W.visible) {
        const G = T(w, W, S, M);
        (w.onBeforeShadow(i, w, C, U, B, G, null),
          i.renderBufferDirect(U, null, B, G, w, null),
          w.onAfterShadow(i, w, C, U, B, G, null));
      }
    }
    const N = w.children;
    for (let B = 0, W = N.length; B < W; B++) y(N[B], C, U, S, M);
  }
  function R(w) {
    w.target.removeEventListener("dispose", R);
    for (const U in c) {
      const S = c[U],
        M = w.target.uuid;
      M in S && (S[M].dispose(), delete S[M]);
    }
  }
}
const Lm = {
  [Wr]: $r,
  [Xr]: jr,
  [qr]: Kr,
  [Ei]: Yr,
  [$r]: Wr,
  [jr]: Xr,
  [Kr]: qr,
  [Yr]: Ei,
};
function Im(i, t) {
  function e() {
    let D = !1;
    const et = new ue();
    let it = null;
    const ht = new ue(0, 0, 0, 0);
    return {
      setMask: function (J) {
        it !== J && !D && (i.colorMask(J, J, J, J), (it = J));
      },
      setLocked: function (J) {
        D = J;
      },
      setClear: function (J, Y, pt, It, ie) {
        (ie === !0 && ((J *= It), (Y *= It), (pt *= It)),
          et.set(J, Y, pt, It),
          ht.equals(et) === !1 && (i.clearColor(J, Y, pt, It), ht.copy(et)));
      },
      reset: function () {
        ((D = !1), (it = null), ht.set(-1, 0, 0, 0));
      },
    };
  }
  function n() {
    let D = !1,
      et = !1,
      it = null,
      ht = null,
      J = null;
    return {
      setReversed: function (Y) {
        if (et !== Y) {
          const pt = t.get("EXT_clip_control");
          (Y
            ? pt.clipControlEXT(pt.LOWER_LEFT_EXT, pt.ZERO_TO_ONE_EXT)
            : pt.clipControlEXT(pt.LOWER_LEFT_EXT, pt.NEGATIVE_ONE_TO_ONE_EXT),
            (et = Y));
          const It = J;
          ((J = null), this.setClear(It));
        }
      },
      getReversed: function () {
        return et;
      },
      setTest: function (Y) {
        Y ? Z(i.DEPTH_TEST) : ut(i.DEPTH_TEST);
      },
      setMask: function (Y) {
        it !== Y && !D && (i.depthMask(Y), (it = Y));
      },
      setFunc: function (Y) {
        if ((et && (Y = Lm[Y]), ht !== Y)) {
          switch (Y) {
            case Wr:
              i.depthFunc(i.NEVER);
              break;
            case $r:
              i.depthFunc(i.ALWAYS);
              break;
            case Xr:
              i.depthFunc(i.LESS);
              break;
            case Ei:
              i.depthFunc(i.LEQUAL);
              break;
            case qr:
              i.depthFunc(i.EQUAL);
              break;
            case Yr:
              i.depthFunc(i.GEQUAL);
              break;
            case jr:
              i.depthFunc(i.GREATER);
              break;
            case Kr:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          ht = Y;
        }
      },
      setLocked: function (Y) {
        D = Y;
      },
      setClear: function (Y) {
        J !== Y && (et && (Y = 1 - Y), i.clearDepth(Y), (J = Y));
      },
      reset: function () {
        ((D = !1), (it = null), (ht = null), (J = null), (et = !1));
      },
    };
  }
  function s() {
    let D = !1,
      et = null,
      it = null,
      ht = null,
      J = null,
      Y = null,
      pt = null,
      It = null,
      ie = null;
    return {
      setTest: function (Zt) {
        D || (Zt ? Z(i.STENCIL_TEST) : ut(i.STENCIL_TEST));
      },
      setMask: function (Zt) {
        et !== Zt && !D && (i.stencilMask(Zt), (et = Zt));
      },
      setFunc: function (Zt, pn, an) {
        (it !== Zt || ht !== pn || J !== an) &&
          (i.stencilFunc(Zt, pn, an), (it = Zt), (ht = pn), (J = an));
      },
      setOp: function (Zt, pn, an) {
        (Y !== Zt || pt !== pn || It !== an) &&
          (i.stencilOp(Zt, pn, an), (Y = Zt), (pt = pn), (It = an));
      },
      setLocked: function (Zt) {
        D = Zt;
      },
      setClear: function (Zt) {
        ie !== Zt && (i.clearStencil(Zt), (ie = Zt));
      },
      reset: function () {
        ((D = !1),
          (et = null),
          (it = null),
          (ht = null),
          (J = null),
          (Y = null),
          (pt = null),
          (It = null),
          (ie = null));
      },
    };
  }
  const r = new e(),
    a = new n(),
    o = new s(),
    l = new WeakMap(),
    c = new WeakMap();
  let h = {},
    u = {},
    f = new WeakMap(),
    p = [],
    _ = null,
    x = !1,
    m = null,
    d = null,
    b = null,
    T = null,
    y = null,
    R = null,
    w = null,
    C = new Ht(0, 0, 0),
    U = 0,
    S = !1,
    M = null,
    P = null,
    N = null,
    B = null,
    W = null;
  const G = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let X = !1,
    j = 0;
  const H = i.getParameter(i.VERSION);
  H.indexOf("WebGL") !== -1
    ? ((j = parseFloat(/^WebGL (\d)/.exec(H)[1])), (X = j >= 1))
    : H.indexOf("OpenGL ES") !== -1 &&
      ((j = parseFloat(/^OpenGL ES (\d)/.exec(H)[1])), (X = j >= 2));
  let rt = null,
    lt = {};
  const bt = i.getParameter(i.SCISSOR_BOX),
    kt = i.getParameter(i.VIEWPORT),
    ne = new ue().fromArray(bt),
    ae = new ue().fromArray(kt);
  function Kt(D, et, it, ht) {
    const J = new Uint8Array(4),
      Y = i.createTexture();
    (i.bindTexture(D, Y),
      i.texParameteri(D, i.TEXTURE_MIN_FILTER, i.NEAREST),
      i.texParameteri(D, i.TEXTURE_MAG_FILTER, i.NEAREST));
    for (let pt = 0; pt < it; pt++)
      D === i.TEXTURE_3D || D === i.TEXTURE_2D_ARRAY
        ? i.texImage3D(et, 0, i.RGBA, 1, 1, ht, 0, i.RGBA, i.UNSIGNED_BYTE, J)
        : i.texImage2D(et + pt, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, J);
    return Y;
  }
  const q = {};
  ((q[i.TEXTURE_2D] = Kt(i.TEXTURE_2D, i.TEXTURE_2D, 1)),
    (q[i.TEXTURE_CUBE_MAP] = Kt(
      i.TEXTURE_CUBE_MAP,
      i.TEXTURE_CUBE_MAP_POSITIVE_X,
      6,
    )),
    (q[i.TEXTURE_2D_ARRAY] = Kt(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1)),
    (q[i.TEXTURE_3D] = Kt(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1)),
    r.setClear(0, 0, 0, 1),
    a.setClear(1),
    o.setClear(0),
    Z(i.DEPTH_TEST),
    a.setFunc(Ei),
    Ct(!1),
    mt(oo),
    Z(i.CULL_FACE),
    oe(Dn));
  function Z(D) {
    h[D] !== !0 && (i.enable(D), (h[D] = !0));
  }
  function ut(D) {
    h[D] !== !1 && (i.disable(D), (h[D] = !1));
  }
  function Lt(D, et) {
    return u[D] !== et
      ? (i.bindFramebuffer(D, et),
        (u[D] = et),
        D === i.DRAW_FRAMEBUFFER && (u[i.FRAMEBUFFER] = et),
        D === i.FRAMEBUFFER && (u[i.DRAW_FRAMEBUFFER] = et),
        !0)
      : !1;
  }
  function Et(D, et) {
    let it = p,
      ht = !1;
    if (D) {
      ((it = f.get(et)), it === void 0 && ((it = []), f.set(et, it)));
      const J = D.textures;
      if (it.length !== J.length || it[0] !== i.COLOR_ATTACHMENT0) {
        for (let Y = 0, pt = J.length; Y < pt; Y++)
          it[Y] = i.COLOR_ATTACHMENT0 + Y;
        ((it.length = J.length), (ht = !0));
      }
    } else it[0] !== i.BACK && ((it[0] = i.BACK), (ht = !0));
    ht && i.drawBuffers(it);
  }
  function Wt(D) {
    return _ !== D ? (i.useProgram(D), (_ = D), !0) : !1;
  }
  const ye = {
    [Xn]: i.FUNC_ADD,
    [Fl]: i.FUNC_SUBTRACT,
    [Ol]: i.FUNC_REVERSE_SUBTRACT,
  };
  ((ye[Bl] = i.MIN), (ye[kl] = i.MAX));
  const A = {
    [zl]: i.ZERO,
    [Hl]: i.ONE,
    [Vl]: i.SRC_COLOR,
    [Vr]: i.SRC_ALPHA,
    [Yl]: i.SRC_ALPHA_SATURATE,
    [Xl]: i.DST_COLOR,
    [Wl]: i.DST_ALPHA,
    [Gl]: i.ONE_MINUS_SRC_COLOR,
    [Gr]: i.ONE_MINUS_SRC_ALPHA,
    [ql]: i.ONE_MINUS_DST_COLOR,
    [$l]: i.ONE_MINUS_DST_ALPHA,
    [jl]: i.CONSTANT_COLOR,
    [Kl]: i.ONE_MINUS_CONSTANT_COLOR,
    [Zl]: i.CONSTANT_ALPHA,
    [Jl]: i.ONE_MINUS_CONSTANT_ALPHA,
  };
  function oe(D, et, it, ht, J, Y, pt, It, ie, Zt) {
    if (D === Dn) {
      x === !0 && (ut(i.BLEND), (x = !1));
      return;
    }
    if ((x === !1 && (Z(i.BLEND), (x = !0)), D !== Nl)) {
      if (D !== m || Zt !== S) {
        if (
          ((d !== Xn || y !== Xn) &&
            (i.blendEquation(i.FUNC_ADD), (d = Xn), (y = Xn)),
          Zt)
        )
          switch (D) {
            case Si:
              i.blendFuncSeparate(
                i.ONE,
                i.ONE_MINUS_SRC_ALPHA,
                i.ONE,
                i.ONE_MINUS_SRC_ALPHA,
              );
              break;
            case co:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case lo:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case ho:
              i.blendFuncSeparate(
                i.DST_COLOR,
                i.ONE_MINUS_SRC_ALPHA,
                i.ZERO,
                i.ONE,
              );
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", D);
              break;
          }
        else
          switch (D) {
            case Si:
              i.blendFuncSeparate(
                i.SRC_ALPHA,
                i.ONE_MINUS_SRC_ALPHA,
                i.ONE,
                i.ONE_MINUS_SRC_ALPHA,
              );
              break;
            case co:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE, i.ONE, i.ONE);
              break;
            case lo:
              console.error(
                "THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true",
              );
              break;
            case ho:
              console.error(
                "THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true",
              );
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", D);
              break;
          }
        ((b = null),
          (T = null),
          (R = null),
          (w = null),
          C.set(0, 0, 0),
          (U = 0),
          (m = D),
          (S = Zt));
      }
      return;
    }
    ((J = J || et),
      (Y = Y || it),
      (pt = pt || ht),
      (et !== d || J !== y) &&
        (i.blendEquationSeparate(ye[et], ye[J]), (d = et), (y = J)),
      (it !== b || ht !== T || Y !== R || pt !== w) &&
        (i.blendFuncSeparate(A[it], A[ht], A[Y], A[pt]),
        (b = it),
        (T = ht),
        (R = Y),
        (w = pt)),
      (It.equals(C) === !1 || ie !== U) &&
        (i.blendColor(It.r, It.g, It.b, ie), C.copy(It), (U = ie)),
      (m = D),
      (S = !1));
  }
  function Ut(D, et) {
    D.side === Sn ? ut(i.CULL_FACE) : Z(i.CULL_FACE);
    let it = D.side === Ne;
    (et && (it = !it),
      Ct(it),
      D.blending === Si && D.transparent === !1
        ? oe(Dn)
        : oe(
            D.blending,
            D.blendEquation,
            D.blendSrc,
            D.blendDst,
            D.blendEquationAlpha,
            D.blendSrcAlpha,
            D.blendDstAlpha,
            D.blendColor,
            D.blendAlpha,
            D.premultipliedAlpha,
          ),
      a.setFunc(D.depthFunc),
      a.setTest(D.depthTest),
      a.setMask(D.depthWrite),
      r.setMask(D.colorWrite));
    const ht = D.stencilWrite;
    (o.setTest(ht),
      ht &&
        (o.setMask(D.stencilWriteMask),
        o.setFunc(D.stencilFunc, D.stencilRef, D.stencilFuncMask),
        o.setOp(D.stencilFail, D.stencilZFail, D.stencilZPass)),
      gt(D.polygonOffset, D.polygonOffsetFactor, D.polygonOffsetUnits),
      D.alphaToCoverage === !0
        ? Z(i.SAMPLE_ALPHA_TO_COVERAGE)
        : ut(i.SAMPLE_ALPHA_TO_COVERAGE));
  }
  function Ct(D) {
    M !== D && (D ? i.frontFace(i.CW) : i.frontFace(i.CCW), (M = D));
  }
  function mt(D) {
    (D !== Il
      ? (Z(i.CULL_FACE),
        D !== P &&
          (D === oo
            ? i.cullFace(i.BACK)
            : D === Ul
              ? i.cullFace(i.FRONT)
              : i.cullFace(i.FRONT_AND_BACK)))
      : ut(i.CULL_FACE),
      (P = D));
  }
  function ce(D) {
    D !== N && (X && i.lineWidth(D), (N = D));
  }
  function gt(D, et, it) {
    D
      ? (Z(i.POLYGON_OFFSET_FILL),
        (B !== et || W !== it) && (i.polygonOffset(et, it), (B = et), (W = it)))
      : ut(i.POLYGON_OFFSET_FILL);
  }
  function Ot(D) {
    D ? Z(i.SCISSOR_TEST) : ut(i.SCISSOR_TEST);
  }
  function Me(D) {
    (D === void 0 && (D = i.TEXTURE0 + G - 1),
      rt !== D && (i.activeTexture(D), (rt = D)));
  }
  function fe(D, et, it) {
    it === void 0 && (rt === null ? (it = i.TEXTURE0 + G - 1) : (it = rt));
    let ht = lt[it];
    (ht === void 0 && ((ht = { type: void 0, texture: void 0 }), (lt[it] = ht)),
      (ht.type !== D || ht.texture !== et) &&
        (rt !== it && (i.activeTexture(it), (rt = it)),
        i.bindTexture(D, et || q[D]),
        (ht.type = D),
        (ht.texture = et)));
  }
  function E() {
    const D = lt[rt];
    D !== void 0 &&
      D.type !== void 0 &&
      (i.bindTexture(D.type, null), (D.type = void 0), (D.texture = void 0));
  }
  function g() {
    try {
      i.compressedTexImage2D(...arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function O() {
    try {
      i.compressedTexImage3D(...arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function $() {
    try {
      i.texSubImage2D(...arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function K() {
    try {
      i.texSubImage3D(...arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function V() {
    try {
      i.compressedTexSubImage2D(...arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function yt() {
    try {
      i.compressedTexSubImage3D(...arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function nt() {
    try {
      i.texStorage2D(...arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function _t() {
    try {
      i.texStorage3D(...arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function Mt() {
    try {
      i.texImage2D(...arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function tt() {
    try {
      i.texImage3D(...arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function ct(D) {
    ne.equals(D) === !1 && (i.scissor(D.x, D.y, D.z, D.w), ne.copy(D));
  }
  function Rt(D) {
    ae.equals(D) === !1 && (i.viewport(D.x, D.y, D.z, D.w), ae.copy(D));
  }
  function St(D, et) {
    let it = c.get(et);
    it === void 0 && ((it = new WeakMap()), c.set(et, it));
    let ht = it.get(D);
    ht === void 0 && ((ht = i.getUniformBlockIndex(et, D.name)), it.set(D, ht));
  }
  function at(D, et) {
    const ht = c.get(et).get(D);
    l.get(et) !== ht &&
      (i.uniformBlockBinding(et, ht, D.__bindingPointIndex), l.set(et, ht));
  }
  function Nt() {
    (i.disable(i.BLEND),
      i.disable(i.CULL_FACE),
      i.disable(i.DEPTH_TEST),
      i.disable(i.POLYGON_OFFSET_FILL),
      i.disable(i.SCISSOR_TEST),
      i.disable(i.STENCIL_TEST),
      i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),
      i.blendEquation(i.FUNC_ADD),
      i.blendFunc(i.ONE, i.ZERO),
      i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO),
      i.blendColor(0, 0, 0, 0),
      i.colorMask(!0, !0, !0, !0),
      i.clearColor(0, 0, 0, 0),
      i.depthMask(!0),
      i.depthFunc(i.LESS),
      a.setReversed(!1),
      i.clearDepth(1),
      i.stencilMask(4294967295),
      i.stencilFunc(i.ALWAYS, 0, 4294967295),
      i.stencilOp(i.KEEP, i.KEEP, i.KEEP),
      i.clearStencil(0),
      i.cullFace(i.BACK),
      i.frontFace(i.CCW),
      i.polygonOffset(0, 0),
      i.activeTexture(i.TEXTURE0),
      i.bindFramebuffer(i.FRAMEBUFFER, null),
      i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null),
      i.bindFramebuffer(i.READ_FRAMEBUFFER, null),
      i.useProgram(null),
      i.lineWidth(1),
      i.scissor(0, 0, i.canvas.width, i.canvas.height),
      i.viewport(0, 0, i.canvas.width, i.canvas.height),
      (h = {}),
      (rt = null),
      (lt = {}),
      (u = {}),
      (f = new WeakMap()),
      (p = []),
      (_ = null),
      (x = !1),
      (m = null),
      (d = null),
      (b = null),
      (T = null),
      (y = null),
      (R = null),
      (w = null),
      (C = new Ht(0, 0, 0)),
      (U = 0),
      (S = !1),
      (M = null),
      (P = null),
      (N = null),
      (B = null),
      (W = null),
      ne.set(0, 0, i.canvas.width, i.canvas.height),
      ae.set(0, 0, i.canvas.width, i.canvas.height),
      r.reset(),
      a.reset(),
      o.reset());
  }
  return {
    buffers: { color: r, depth: a, stencil: o },
    enable: Z,
    disable: ut,
    bindFramebuffer: Lt,
    drawBuffers: Et,
    useProgram: Wt,
    setBlending: oe,
    setMaterial: Ut,
    setFlipSided: Ct,
    setCullFace: mt,
    setLineWidth: ce,
    setPolygonOffset: gt,
    setScissorTest: Ot,
    activeTexture: Me,
    bindTexture: fe,
    unbindTexture: E,
    compressedTexImage2D: g,
    compressedTexImage3D: O,
    texImage2D: Mt,
    texImage3D: tt,
    updateUBOMapping: St,
    uniformBlockBinding: at,
    texStorage2D: nt,
    texStorage3D: _t,
    texSubImage2D: $,
    texSubImage3D: K,
    compressedTexSubImage2D: V,
    compressedTexSubImage3D: yt,
    scissor: ct,
    viewport: Rt,
    reset: Nt,
  };
}
function Um(i, t, e, n, s, r, a) {
  const o = t.has("WEBGL_multisampled_render_to_texture")
      ? t.get("WEBGL_multisampled_render_to_texture")
      : null,
    l =
      typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent),
    c = new Xt(),
    h = new WeakMap();
  let u;
  const f = new WeakMap();
  let p = !1;
  try {
    p =
      typeof OffscreenCanvas < "u" &&
      new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {}
  function _(E, g) {
    return p ? new OffscreenCanvas(E, g) : $s("canvas");
  }
  function x(E, g, O) {
    let $ = 1;
    const K = fe(E);
    if (
      ((K.width > O || K.height > O) && ($ = O / Math.max(K.width, K.height)),
      $ < 1)
    )
      if (
        (typeof HTMLImageElement < "u" && E instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement < "u" && E instanceof HTMLCanvasElement) ||
        (typeof ImageBitmap < "u" && E instanceof ImageBitmap) ||
        (typeof VideoFrame < "u" && E instanceof VideoFrame)
      ) {
        const V = Math.floor($ * K.width),
          yt = Math.floor($ * K.height);
        u === void 0 && (u = _(V, yt));
        const nt = g ? _(V, yt) : u;
        return (
          (nt.width = V),
          (nt.height = yt),
          nt.getContext("2d").drawImage(E, 0, 0, V, yt),
          console.warn(
            "THREE.WebGLRenderer: Texture has been resized from (" +
              K.width +
              "x" +
              K.height +
              ") to (" +
              V +
              "x" +
              yt +
              ").",
          ),
          nt
        );
      } else
        return (
          "data" in E &&
            console.warn(
              "THREE.WebGLRenderer: Image in DataTexture is too big (" +
                K.width +
                "x" +
                K.height +
                ").",
            ),
          E
        );
    return E;
  }
  function m(E) {
    return E.generateMipmaps;
  }
  function d(E) {
    i.generateMipmap(E);
  }
  function b(E) {
    return E.isWebGLCubeRenderTarget
      ? i.TEXTURE_CUBE_MAP
      : E.isWebGL3DRenderTarget
        ? i.TEXTURE_3D
        : E.isWebGLArrayRenderTarget || E.isCompressedArrayTexture
          ? i.TEXTURE_2D_ARRAY
          : i.TEXTURE_2D;
  }
  function T(E, g, O, $, K = !1) {
    if (E !== null) {
      if (i[E] !== void 0) return i[E];
      console.warn(
        "THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" +
          E +
          "'",
      );
    }
    let V = g;
    if (
      (g === i.RED &&
        (O === i.FLOAT && (V = i.R32F),
        O === i.HALF_FLOAT && (V = i.R16F),
        O === i.UNSIGNED_BYTE && (V = i.R8)),
      g === i.RED_INTEGER &&
        (O === i.UNSIGNED_BYTE && (V = i.R8UI),
        O === i.UNSIGNED_SHORT && (V = i.R16UI),
        O === i.UNSIGNED_INT && (V = i.R32UI),
        O === i.BYTE && (V = i.R8I),
        O === i.SHORT && (V = i.R16I),
        O === i.INT && (V = i.R32I)),
      g === i.RG &&
        (O === i.FLOAT && (V = i.RG32F),
        O === i.HALF_FLOAT && (V = i.RG16F),
        O === i.UNSIGNED_BYTE && (V = i.RG8)),
      g === i.RG_INTEGER &&
        (O === i.UNSIGNED_BYTE && (V = i.RG8UI),
        O === i.UNSIGNED_SHORT && (V = i.RG16UI),
        O === i.UNSIGNED_INT && (V = i.RG32UI),
        O === i.BYTE && (V = i.RG8I),
        O === i.SHORT && (V = i.RG16I),
        O === i.INT && (V = i.RG32I)),
      g === i.RGB_INTEGER &&
        (O === i.UNSIGNED_BYTE && (V = i.RGB8UI),
        O === i.UNSIGNED_SHORT && (V = i.RGB16UI),
        O === i.UNSIGNED_INT && (V = i.RGB32UI),
        O === i.BYTE && (V = i.RGB8I),
        O === i.SHORT && (V = i.RGB16I),
        O === i.INT && (V = i.RGB32I)),
      g === i.RGBA_INTEGER &&
        (O === i.UNSIGNED_BYTE && (V = i.RGBA8UI),
        O === i.UNSIGNED_SHORT && (V = i.RGBA16UI),
        O === i.UNSIGNED_INT && (V = i.RGBA32UI),
        O === i.BYTE && (V = i.RGBA8I),
        O === i.SHORT && (V = i.RGBA16I),
        O === i.INT && (V = i.RGBA32I)),
      g === i.RGB &&
        (O === i.UNSIGNED_INT_5_9_9_9_REV && (V = i.RGB9_E5),
        O === i.UNSIGNED_INT_10F_11F_11F_REV && (V = i.R11F_G11F_B10F)),
      g === i.RGBA)
    ) {
      const yt = K ? Gs : Yt.getTransfer($);
      (O === i.FLOAT && (V = i.RGBA32F),
        O === i.HALF_FLOAT && (V = i.RGBA16F),
        O === i.UNSIGNED_BYTE && (V = yt === Qt ? i.SRGB8_ALPHA8 : i.RGBA8),
        O === i.UNSIGNED_SHORT_4_4_4_4 && (V = i.RGBA4),
        O === i.UNSIGNED_SHORT_5_5_5_1 && (V = i.RGB5_A1));
    }
    return (
      (V === i.R16F ||
        V === i.R32F ||
        V === i.RG16F ||
        V === i.RG32F ||
        V === i.RGBA16F ||
        V === i.RGBA32F) &&
        t.get("EXT_color_buffer_float"),
      V
    );
  }
  function y(E, g) {
    let O;
    return (
      E
        ? g === null || g === ti || g === Ki
          ? (O = i.DEPTH24_STENCIL8)
          : g === ln
            ? (O = i.DEPTH32F_STENCIL8)
            : g === ji &&
              ((O = i.DEPTH24_STENCIL8),
              console.warn(
                "DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.",
              ))
        : g === null || g === ti || g === Ki
          ? (O = i.DEPTH_COMPONENT24)
          : g === ln
            ? (O = i.DEPTH_COMPONENT32F)
            : g === ji && (O = i.DEPTH_COMPONENT16),
      O
    );
  }
  function R(E, g) {
    return m(E) === !0 ||
      (E.isFramebufferTexture && E.minFilter !== Ge && E.minFilter !== cn)
      ? Math.log2(Math.max(g.width, g.height)) + 1
      : E.mipmaps !== void 0 && E.mipmaps.length > 0
        ? E.mipmaps.length
        : E.isCompressedTexture && Array.isArray(E.image)
          ? g.mipmaps.length
          : 1;
  }
  function w(E) {
    const g = E.target;
    (g.removeEventListener("dispose", w),
      U(g),
      g.isVideoTexture && h.delete(g));
  }
  function C(E) {
    const g = E.target;
    (g.removeEventListener("dispose", C), M(g));
  }
  function U(E) {
    const g = n.get(E);
    if (g.__webglInit === void 0) return;
    const O = E.source,
      $ = f.get(O);
    if ($) {
      const K = $[g.__cacheKey];
      (K.usedTimes--,
        K.usedTimes === 0 && S(E),
        Object.keys($).length === 0 && f.delete(O));
    }
    n.remove(E);
  }
  function S(E) {
    const g = n.get(E);
    i.deleteTexture(g.__webglTexture);
    const O = E.source,
      $ = f.get(O);
    (delete $[g.__cacheKey], a.memory.textures--);
  }
  function M(E) {
    const g = n.get(E);
    if (
      (E.depthTexture && (E.depthTexture.dispose(), n.remove(E.depthTexture)),
      E.isWebGLCubeRenderTarget)
    )
      for (let $ = 0; $ < 6; $++) {
        if (Array.isArray(g.__webglFramebuffer[$]))
          for (let K = 0; K < g.__webglFramebuffer[$].length; K++)
            i.deleteFramebuffer(g.__webglFramebuffer[$][K]);
        else i.deleteFramebuffer(g.__webglFramebuffer[$]);
        g.__webglDepthbuffer && i.deleteRenderbuffer(g.__webglDepthbuffer[$]);
      }
    else {
      if (Array.isArray(g.__webglFramebuffer))
        for (let $ = 0; $ < g.__webglFramebuffer.length; $++)
          i.deleteFramebuffer(g.__webglFramebuffer[$]);
      else i.deleteFramebuffer(g.__webglFramebuffer);
      if (
        (g.__webglDepthbuffer && i.deleteRenderbuffer(g.__webglDepthbuffer),
        g.__webglMultisampledFramebuffer &&
          i.deleteFramebuffer(g.__webglMultisampledFramebuffer),
        g.__webglColorRenderbuffer)
      )
        for (let $ = 0; $ < g.__webglColorRenderbuffer.length; $++)
          g.__webglColorRenderbuffer[$] &&
            i.deleteRenderbuffer(g.__webglColorRenderbuffer[$]);
      g.__webglDepthRenderbuffer &&
        i.deleteRenderbuffer(g.__webglDepthRenderbuffer);
    }
    const O = E.textures;
    for (let $ = 0, K = O.length; $ < K; $++) {
      const V = n.get(O[$]);
      (V.__webglTexture &&
        (i.deleteTexture(V.__webglTexture), a.memory.textures--),
        n.remove(O[$]));
    }
    n.remove(E);
  }
  let P = 0;
  function N() {
    P = 0;
  }
  function B() {
    const E = P;
    return (
      E >= s.maxTextures &&
        console.warn(
          "THREE.WebGLTextures: Trying to use " +
            E +
            " texture units while this GPU supports only " +
            s.maxTextures,
        ),
      (P += 1),
      E
    );
  }
  function W(E) {
    const g = [];
    return (
      g.push(E.wrapS),
      g.push(E.wrapT),
      g.push(E.wrapR || 0),
      g.push(E.magFilter),
      g.push(E.minFilter),
      g.push(E.anisotropy),
      g.push(E.internalFormat),
      g.push(E.format),
      g.push(E.type),
      g.push(E.generateMipmaps),
      g.push(E.premultiplyAlpha),
      g.push(E.flipY),
      g.push(E.unpackAlignment),
      g.push(E.colorSpace),
      g.join()
    );
  }
  function G(E, g) {
    const O = n.get(E);
    if (
      (E.isVideoTexture && Ot(E),
      E.isRenderTargetTexture === !1 &&
        E.isExternalTexture !== !0 &&
        E.version > 0 &&
        O.__version !== E.version)
    ) {
      const $ = E.image;
      if ($ === null)
        console.warn(
          "THREE.WebGLRenderer: Texture marked for update but no image data found.",
        );
      else if ($.complete === !1)
        console.warn(
          "THREE.WebGLRenderer: Texture marked for update but image is incomplete",
        );
      else {
        q(O, E, g);
        return;
      }
    } else
      E.isExternalTexture &&
        (O.__webglTexture = E.sourceTexture ? E.sourceTexture : null);
    e.bindTexture(i.TEXTURE_2D, O.__webglTexture, i.TEXTURE0 + g);
  }
  function X(E, g) {
    const O = n.get(E);
    if (
      E.isRenderTargetTexture === !1 &&
      E.version > 0 &&
      O.__version !== E.version
    ) {
      q(O, E, g);
      return;
    }
    e.bindTexture(i.TEXTURE_2D_ARRAY, O.__webglTexture, i.TEXTURE0 + g);
  }
  function j(E, g) {
    const O = n.get(E);
    if (
      E.isRenderTargetTexture === !1 &&
      E.version > 0 &&
      O.__version !== E.version
    ) {
      q(O, E, g);
      return;
    }
    e.bindTexture(i.TEXTURE_3D, O.__webglTexture, i.TEXTURE0 + g);
  }
  function H(E, g) {
    const O = n.get(E);
    if (E.version > 0 && O.__version !== E.version) {
      Z(O, E, g);
      return;
    }
    e.bindTexture(i.TEXTURE_CUBE_MAP, O.__webglTexture, i.TEXTURE0 + g);
  }
  const rt = { [Qr]: i.REPEAT, [Yn]: i.CLAMP_TO_EDGE, [ta]: i.MIRRORED_REPEAT },
    lt = {
      [Ge]: i.NEAREST,
      [od]: i.NEAREST_MIPMAP_NEAREST,
      [ls]: i.NEAREST_MIPMAP_LINEAR,
      [cn]: i.LINEAR,
      [ar]: i.LINEAR_MIPMAP_NEAREST,
      [jn]: i.LINEAR_MIPMAP_LINEAR,
    },
    bt = {
      [hd]: i.NEVER,
      [_d]: i.ALWAYS,
      [ud]: i.LESS,
      [Uc]: i.LEQUAL,
      [fd]: i.EQUAL,
      [gd]: i.GEQUAL,
      [pd]: i.GREATER,
      [md]: i.NOTEQUAL,
    };
  function kt(E, g) {
    if (
      (g.type === ln &&
        t.has("OES_texture_float_linear") === !1 &&
        (g.magFilter === cn ||
          g.magFilter === ar ||
          g.magFilter === ls ||
          g.magFilter === jn ||
          g.minFilter === cn ||
          g.minFilter === ar ||
          g.minFilter === ls ||
          g.minFilter === jn) &&
        console.warn(
          "THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.",
        ),
      i.texParameteri(E, i.TEXTURE_WRAP_S, rt[g.wrapS]),
      i.texParameteri(E, i.TEXTURE_WRAP_T, rt[g.wrapT]),
      (E === i.TEXTURE_3D || E === i.TEXTURE_2D_ARRAY) &&
        i.texParameteri(E, i.TEXTURE_WRAP_R, rt[g.wrapR]),
      i.texParameteri(E, i.TEXTURE_MAG_FILTER, lt[g.magFilter]),
      i.texParameteri(E, i.TEXTURE_MIN_FILTER, lt[g.minFilter]),
      g.compareFunction &&
        (i.texParameteri(E, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE),
        i.texParameteri(E, i.TEXTURE_COMPARE_FUNC, bt[g.compareFunction])),
      t.has("EXT_texture_filter_anisotropic") === !0)
    ) {
      if (
        g.magFilter === Ge ||
        (g.minFilter !== ls && g.minFilter !== jn) ||
        (g.type === ln && t.has("OES_texture_float_linear") === !1)
      )
        return;
      if (g.anisotropy > 1 || n.get(g).__currentAnisotropy) {
        const O = t.get("EXT_texture_filter_anisotropic");
        (i.texParameterf(
          E,
          O.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(g.anisotropy, s.getMaxAnisotropy()),
        ),
          (n.get(g).__currentAnisotropy = g.anisotropy));
      }
    }
  }
  function ne(E, g) {
    let O = !1;
    E.__webglInit === void 0 &&
      ((E.__webglInit = !0), g.addEventListener("dispose", w));
    const $ = g.source;
    let K = f.get($);
    K === void 0 && ((K = {}), f.set($, K));
    const V = W(g);
    if (V !== E.__cacheKey) {
      (K[V] === void 0 &&
        ((K[V] = { texture: i.createTexture(), usedTimes: 0 }),
        a.memory.textures++,
        (O = !0)),
        K[V].usedTimes++);
      const yt = K[E.__cacheKey];
      (yt !== void 0 &&
        (K[E.__cacheKey].usedTimes--, yt.usedTimes === 0 && S(g)),
        (E.__cacheKey = V),
        (E.__webglTexture = K[V].texture));
    }
    return O;
  }
  function ae(E, g, O) {
    return Math.floor(Math.floor(E / O) / g);
  }
  function Kt(E, g, O, $) {
    const V = E.updateRanges;
    if (V.length === 0)
      e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, g.width, g.height, O, $, g.data);
    else {
      V.sort((tt, ct) => tt.start - ct.start);
      let yt = 0;
      for (let tt = 1; tt < V.length; tt++) {
        const ct = V[yt],
          Rt = V[tt],
          St = ct.start + ct.count,
          at = ae(Rt.start, g.width, 4),
          Nt = ae(ct.start, g.width, 4);
        Rt.start <= St + 1 &&
        at === Nt &&
        ae(Rt.start + Rt.count - 1, g.width, 4) === at
          ? (ct.count = Math.max(ct.count, Rt.start + Rt.count - ct.start))
          : (++yt, (V[yt] = Rt));
      }
      V.length = yt + 1;
      const nt = i.getParameter(i.UNPACK_ROW_LENGTH),
        _t = i.getParameter(i.UNPACK_SKIP_PIXELS),
        Mt = i.getParameter(i.UNPACK_SKIP_ROWS);
      i.pixelStorei(i.UNPACK_ROW_LENGTH, g.width);
      for (let tt = 0, ct = V.length; tt < ct; tt++) {
        const Rt = V[tt],
          St = Math.floor(Rt.start / 4),
          at = Math.ceil(Rt.count / 4),
          Nt = St % g.width,
          D = Math.floor(St / g.width),
          et = at,
          it = 1;
        (i.pixelStorei(i.UNPACK_SKIP_PIXELS, Nt),
          i.pixelStorei(i.UNPACK_SKIP_ROWS, D),
          e.texSubImage2D(i.TEXTURE_2D, 0, Nt, D, et, it, O, $, g.data));
      }
      (E.clearUpdateRanges(),
        i.pixelStorei(i.UNPACK_ROW_LENGTH, nt),
        i.pixelStorei(i.UNPACK_SKIP_PIXELS, _t),
        i.pixelStorei(i.UNPACK_SKIP_ROWS, Mt));
    }
  }
  function q(E, g, O) {
    let $ = i.TEXTURE_2D;
    ((g.isDataArrayTexture || g.isCompressedArrayTexture) &&
      ($ = i.TEXTURE_2D_ARRAY),
      g.isData3DTexture && ($ = i.TEXTURE_3D));
    const K = ne(E, g),
      V = g.source;
    e.bindTexture($, E.__webglTexture, i.TEXTURE0 + O);
    const yt = n.get(V);
    if (V.version !== yt.__version || K === !0) {
      e.activeTexture(i.TEXTURE0 + O);
      const nt = Yt.getPrimaries(Yt.workingColorSpace),
        _t = g.colorSpace === Cn ? null : Yt.getPrimaries(g.colorSpace),
        Mt =
          g.colorSpace === Cn || nt === _t ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      (i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, g.flipY),
        i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha),
        i.pixelStorei(i.UNPACK_ALIGNMENT, g.unpackAlignment),
        i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Mt));
      let tt = x(g.image, !1, s.maxTextureSize);
      tt = Me(g, tt);
      const ct = r.convert(g.format, g.colorSpace),
        Rt = r.convert(g.type);
      let St = T(g.internalFormat, ct, Rt, g.colorSpace, g.isVideoTexture);
      kt($, g);
      let at;
      const Nt = g.mipmaps,
        D = g.isVideoTexture !== !0,
        et = yt.__version === void 0 || K === !0,
        it = V.dataReady,
        ht = R(g, tt);
      if (g.isDepthTexture)
        ((St = y(g.format === Ji, g.type)),
          et &&
            (D
              ? e.texStorage2D(i.TEXTURE_2D, 1, St, tt.width, tt.height)
              : e.texImage2D(
                  i.TEXTURE_2D,
                  0,
                  St,
                  tt.width,
                  tt.height,
                  0,
                  ct,
                  Rt,
                  null,
                )));
      else if (g.isDataTexture)
        if (Nt.length > 0) {
          D &&
            et &&
            e.texStorage2D(i.TEXTURE_2D, ht, St, Nt[0].width, Nt[0].height);
          for (let J = 0, Y = Nt.length; J < Y; J++)
            ((at = Nt[J]),
              D
                ? it &&
                  e.texSubImage2D(
                    i.TEXTURE_2D,
                    J,
                    0,
                    0,
                    at.width,
                    at.height,
                    ct,
                    Rt,
                    at.data,
                  )
                : e.texImage2D(
                    i.TEXTURE_2D,
                    J,
                    St,
                    at.width,
                    at.height,
                    0,
                    ct,
                    Rt,
                    at.data,
                  ));
          g.generateMipmaps = !1;
        } else
          D
            ? (et && e.texStorage2D(i.TEXTURE_2D, ht, St, tt.width, tt.height),
              it && Kt(g, tt, ct, Rt))
            : e.texImage2D(
                i.TEXTURE_2D,
                0,
                St,
                tt.width,
                tt.height,
                0,
                ct,
                Rt,
                tt.data,
              );
      else if (g.isCompressedTexture)
        if (g.isCompressedArrayTexture) {
          D &&
            et &&
            e.texStorage3D(
              i.TEXTURE_2D_ARRAY,
              ht,
              St,
              Nt[0].width,
              Nt[0].height,
              tt.depth,
            );
          for (let J = 0, Y = Nt.length; J < Y; J++)
            if (((at = Nt[J]), g.format !== sn))
              if (ct !== null)
                if (D) {
                  if (it)
                    if (g.layerUpdates.size > 0) {
                      const pt = Vo(at.width, at.height, g.format, g.type);
                      for (const It of g.layerUpdates) {
                        const ie = at.data.subarray(
                          (It * pt) / at.data.BYTES_PER_ELEMENT,
                          ((It + 1) * pt) / at.data.BYTES_PER_ELEMENT,
                        );
                        e.compressedTexSubImage3D(
                          i.TEXTURE_2D_ARRAY,
                          J,
                          0,
                          0,
                          It,
                          at.width,
                          at.height,
                          1,
                          ct,
                          ie,
                        );
                      }
                      g.clearLayerUpdates();
                    } else
                      e.compressedTexSubImage3D(
                        i.TEXTURE_2D_ARRAY,
                        J,
                        0,
                        0,
                        0,
                        at.width,
                        at.height,
                        tt.depth,
                        ct,
                        at.data,
                      );
                } else
                  e.compressedTexImage3D(
                    i.TEXTURE_2D_ARRAY,
                    J,
                    St,
                    at.width,
                    at.height,
                    tt.depth,
                    0,
                    at.data,
                    0,
                    0,
                  );
              else
                console.warn(
                  "THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()",
                );
            else
              D
                ? it &&
                  e.texSubImage3D(
                    i.TEXTURE_2D_ARRAY,
                    J,
                    0,
                    0,
                    0,
                    at.width,
                    at.height,
                    tt.depth,
                    ct,
                    Rt,
                    at.data,
                  )
                : e.texImage3D(
                    i.TEXTURE_2D_ARRAY,
                    J,
                    St,
                    at.width,
                    at.height,
                    tt.depth,
                    0,
                    ct,
                    Rt,
                    at.data,
                  );
        } else {
          D &&
            et &&
            e.texStorage2D(i.TEXTURE_2D, ht, St, Nt[0].width, Nt[0].height);
          for (let J = 0, Y = Nt.length; J < Y; J++)
            ((at = Nt[J]),
              g.format !== sn
                ? ct !== null
                  ? D
                    ? it &&
                      e.compressedTexSubImage2D(
                        i.TEXTURE_2D,
                        J,
                        0,
                        0,
                        at.width,
                        at.height,
                        ct,
                        at.data,
                      )
                    : e.compressedTexImage2D(
                        i.TEXTURE_2D,
                        J,
                        St,
                        at.width,
                        at.height,
                        0,
                        at.data,
                      )
                  : console.warn(
                      "THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()",
                    )
                : D
                  ? it &&
                    e.texSubImage2D(
                      i.TEXTURE_2D,
                      J,
                      0,
                      0,
                      at.width,
                      at.height,
                      ct,
                      Rt,
                      at.data,
                    )
                  : e.texImage2D(
                      i.TEXTURE_2D,
                      J,
                      St,
                      at.width,
                      at.height,
                      0,
                      ct,
                      Rt,
                      at.data,
                    ));
        }
      else if (g.isDataArrayTexture)
        if (D) {
          if (
            (et &&
              e.texStorage3D(
                i.TEXTURE_2D_ARRAY,
                ht,
                St,
                tt.width,
                tt.height,
                tt.depth,
              ),
            it)
          )
            if (g.layerUpdates.size > 0) {
              const J = Vo(tt.width, tt.height, g.format, g.type);
              for (const Y of g.layerUpdates) {
                const pt = tt.data.subarray(
                  (Y * J) / tt.data.BYTES_PER_ELEMENT,
                  ((Y + 1) * J) / tt.data.BYTES_PER_ELEMENT,
                );
                e.texSubImage3D(
                  i.TEXTURE_2D_ARRAY,
                  0,
                  0,
                  0,
                  Y,
                  tt.width,
                  tt.height,
                  1,
                  ct,
                  Rt,
                  pt,
                );
              }
              g.clearLayerUpdates();
            } else
              e.texSubImage3D(
                i.TEXTURE_2D_ARRAY,
                0,
                0,
                0,
                0,
                tt.width,
                tt.height,
                tt.depth,
                ct,
                Rt,
                tt.data,
              );
        } else
          e.texImage3D(
            i.TEXTURE_2D_ARRAY,
            0,
            St,
            tt.width,
            tt.height,
            tt.depth,
            0,
            ct,
            Rt,
            tt.data,
          );
      else if (g.isData3DTexture)
        D
          ? (et &&
              e.texStorage3D(
                i.TEXTURE_3D,
                ht,
                St,
                tt.width,
                tt.height,
                tt.depth,
              ),
            it &&
              e.texSubImage3D(
                i.TEXTURE_3D,
                0,
                0,
                0,
                0,
                tt.width,
                tt.height,
                tt.depth,
                ct,
                Rt,
                tt.data,
              ))
          : e.texImage3D(
              i.TEXTURE_3D,
              0,
              St,
              tt.width,
              tt.height,
              tt.depth,
              0,
              ct,
              Rt,
              tt.data,
            );
      else if (g.isFramebufferTexture) {
        if (et)
          if (D) e.texStorage2D(i.TEXTURE_2D, ht, St, tt.width, tt.height);
          else {
            let J = tt.width,
              Y = tt.height;
            for (let pt = 0; pt < ht; pt++)
              (e.texImage2D(i.TEXTURE_2D, pt, St, J, Y, 0, ct, Rt, null),
                (J >>= 1),
                (Y >>= 1));
          }
      } else if (Nt.length > 0) {
        if (D && et) {
          const J = fe(Nt[0]);
          e.texStorage2D(i.TEXTURE_2D, ht, St, J.width, J.height);
        }
        for (let J = 0, Y = Nt.length; J < Y; J++)
          ((at = Nt[J]),
            D
              ? it && e.texSubImage2D(i.TEXTURE_2D, J, 0, 0, ct, Rt, at)
              : e.texImage2D(i.TEXTURE_2D, J, St, ct, Rt, at));
        g.generateMipmaps = !1;
      } else if (D) {
        if (et) {
          const J = fe(tt);
          e.texStorage2D(i.TEXTURE_2D, ht, St, J.width, J.height);
        }
        it && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, ct, Rt, tt);
      } else e.texImage2D(i.TEXTURE_2D, 0, St, ct, Rt, tt);
      (m(g) && d($), (yt.__version = V.version), g.onUpdate && g.onUpdate(g));
    }
    E.__version = g.version;
  }
  function Z(E, g, O) {
    if (g.image.length !== 6) return;
    const $ = ne(E, g),
      K = g.source;
    e.bindTexture(i.TEXTURE_CUBE_MAP, E.__webglTexture, i.TEXTURE0 + O);
    const V = n.get(K);
    if (K.version !== V.__version || $ === !0) {
      e.activeTexture(i.TEXTURE0 + O);
      const yt = Yt.getPrimaries(Yt.workingColorSpace),
        nt = g.colorSpace === Cn ? null : Yt.getPrimaries(g.colorSpace),
        _t =
          g.colorSpace === Cn || yt === nt ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      (i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, g.flipY),
        i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha),
        i.pixelStorei(i.UNPACK_ALIGNMENT, g.unpackAlignment),
        i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, _t));
      const Mt = g.isCompressedTexture || g.image[0].isCompressedTexture,
        tt = g.image[0] && g.image[0].isDataTexture,
        ct = [];
      for (let Y = 0; Y < 6; Y++)
        (!Mt && !tt
          ? (ct[Y] = x(g.image[Y], !0, s.maxCubemapSize))
          : (ct[Y] = tt ? g.image[Y].image : g.image[Y]),
          (ct[Y] = Me(g, ct[Y])));
      const Rt = ct[0],
        St = r.convert(g.format, g.colorSpace),
        at = r.convert(g.type),
        Nt = T(g.internalFormat, St, at, g.colorSpace),
        D = g.isVideoTexture !== !0,
        et = V.__version === void 0 || $ === !0,
        it = K.dataReady;
      let ht = R(g, Rt);
      kt(i.TEXTURE_CUBE_MAP, g);
      let J;
      if (Mt) {
        D &&
          et &&
          e.texStorage2D(i.TEXTURE_CUBE_MAP, ht, Nt, Rt.width, Rt.height);
        for (let Y = 0; Y < 6; Y++) {
          J = ct[Y].mipmaps;
          for (let pt = 0; pt < J.length; pt++) {
            const It = J[pt];
            g.format !== sn
              ? St !== null
                ? D
                  ? it &&
                    e.compressedTexSubImage2D(
                      i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                      pt,
                      0,
                      0,
                      It.width,
                      It.height,
                      St,
                      It.data,
                    )
                  : e.compressedTexImage2D(
                      i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                      pt,
                      Nt,
                      It.width,
                      It.height,
                      0,
                      It.data,
                    )
                : console.warn(
                    "THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()",
                  )
              : D
                ? it &&
                  e.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                    pt,
                    0,
                    0,
                    It.width,
                    It.height,
                    St,
                    at,
                    It.data,
                  )
                : e.texImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                    pt,
                    Nt,
                    It.width,
                    It.height,
                    0,
                    St,
                    at,
                    It.data,
                  );
          }
        }
      } else {
        if (((J = g.mipmaps), D && et)) {
          J.length > 0 && ht++;
          const Y = fe(ct[0]);
          e.texStorage2D(i.TEXTURE_CUBE_MAP, ht, Nt, Y.width, Y.height);
        }
        for (let Y = 0; Y < 6; Y++)
          if (tt) {
            D
              ? it &&
                e.texSubImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                  0,
                  0,
                  0,
                  ct[Y].width,
                  ct[Y].height,
                  St,
                  at,
                  ct[Y].data,
                )
              : e.texImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                  0,
                  Nt,
                  ct[Y].width,
                  ct[Y].height,
                  0,
                  St,
                  at,
                  ct[Y].data,
                );
            for (let pt = 0; pt < J.length; pt++) {
              const ie = J[pt].image[Y].image;
              D
                ? it &&
                  e.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                    pt + 1,
                    0,
                    0,
                    ie.width,
                    ie.height,
                    St,
                    at,
                    ie.data,
                  )
                : e.texImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                    pt + 1,
                    Nt,
                    ie.width,
                    ie.height,
                    0,
                    St,
                    at,
                    ie.data,
                  );
            }
          } else {
            D
              ? it &&
                e.texSubImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                  0,
                  0,
                  0,
                  St,
                  at,
                  ct[Y],
                )
              : e.texImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                  0,
                  Nt,
                  St,
                  at,
                  ct[Y],
                );
            for (let pt = 0; pt < J.length; pt++) {
              const It = J[pt];
              D
                ? it &&
                  e.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                    pt + 1,
                    0,
                    0,
                    St,
                    at,
                    It.image[Y],
                  )
                : e.texImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + Y,
                    pt + 1,
                    Nt,
                    St,
                    at,
                    It.image[Y],
                  );
            }
          }
      }
      (m(g) && d(i.TEXTURE_CUBE_MAP),
        (V.__version = K.version),
        g.onUpdate && g.onUpdate(g));
    }
    E.__version = g.version;
  }
  function ut(E, g, O, $, K, V) {
    const yt = r.convert(O.format, O.colorSpace),
      nt = r.convert(O.type),
      _t = T(O.internalFormat, yt, nt, O.colorSpace),
      Mt = n.get(g),
      tt = n.get(O);
    if (((tt.__renderTarget = g), !Mt.__hasExternalTextures)) {
      const ct = Math.max(1, g.width >> V),
        Rt = Math.max(1, g.height >> V);
      K === i.TEXTURE_3D || K === i.TEXTURE_2D_ARRAY
        ? e.texImage3D(K, V, _t, ct, Rt, g.depth, 0, yt, nt, null)
        : e.texImage2D(K, V, _t, ct, Rt, 0, yt, nt, null);
    }
    (e.bindFramebuffer(i.FRAMEBUFFER, E),
      gt(g)
        ? o.framebufferTexture2DMultisampleEXT(
            i.FRAMEBUFFER,
            $,
            K,
            tt.__webglTexture,
            0,
            ce(g),
          )
        : (K === i.TEXTURE_2D ||
            (K >= i.TEXTURE_CUBE_MAP_POSITIVE_X &&
              K <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z)) &&
          i.framebufferTexture2D(i.FRAMEBUFFER, $, K, tt.__webglTexture, V),
      e.bindFramebuffer(i.FRAMEBUFFER, null));
  }
  function Lt(E, g, O) {
    if ((i.bindRenderbuffer(i.RENDERBUFFER, E), g.depthBuffer)) {
      const $ = g.depthTexture,
        K = $ && $.isDepthTexture ? $.type : null,
        V = y(g.stencilBuffer, K),
        yt = g.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
        nt = ce(g);
      (gt(g)
        ? o.renderbufferStorageMultisampleEXT(
            i.RENDERBUFFER,
            nt,
            V,
            g.width,
            g.height,
          )
        : O
          ? i.renderbufferStorageMultisample(
              i.RENDERBUFFER,
              nt,
              V,
              g.width,
              g.height,
            )
          : i.renderbufferStorage(i.RENDERBUFFER, V, g.width, g.height),
        i.framebufferRenderbuffer(i.FRAMEBUFFER, yt, i.RENDERBUFFER, E));
    } else {
      const $ = g.textures;
      for (let K = 0; K < $.length; K++) {
        const V = $[K],
          yt = r.convert(V.format, V.colorSpace),
          nt = r.convert(V.type),
          _t = T(V.internalFormat, yt, nt, V.colorSpace),
          Mt = ce(g);
        O && gt(g) === !1
          ? i.renderbufferStorageMultisample(
              i.RENDERBUFFER,
              Mt,
              _t,
              g.width,
              g.height,
            )
          : gt(g)
            ? o.renderbufferStorageMultisampleEXT(
                i.RENDERBUFFER,
                Mt,
                _t,
                g.width,
                g.height,
              )
            : i.renderbufferStorage(i.RENDERBUFFER, _t, g.width, g.height);
      }
    }
    i.bindRenderbuffer(i.RENDERBUFFER, null);
  }
  function Et(E, g) {
    if (g && g.isWebGLCubeRenderTarget)
      throw new Error(
        "Depth Texture with cube render targets is not supported",
      );
    if (
      (e.bindFramebuffer(i.FRAMEBUFFER, E),
      !(g.depthTexture && g.depthTexture.isDepthTexture))
    )
      throw new Error(
        "renderTarget.depthTexture must be an instance of THREE.DepthTexture",
      );
    const $ = n.get(g.depthTexture);
    (($.__renderTarget = g),
      (!$.__webglTexture ||
        g.depthTexture.image.width !== g.width ||
        g.depthTexture.image.height !== g.height) &&
        ((g.depthTexture.image.width = g.width),
        (g.depthTexture.image.height = g.height),
        (g.depthTexture.needsUpdate = !0)),
      G(g.depthTexture, 0));
    const K = $.__webglTexture,
      V = ce(g);
    if (g.depthTexture.format === Zi)
      gt(g)
        ? o.framebufferTexture2DMultisampleEXT(
            i.FRAMEBUFFER,
            i.DEPTH_ATTACHMENT,
            i.TEXTURE_2D,
            K,
            0,
            V,
          )
        : i.framebufferTexture2D(
            i.FRAMEBUFFER,
            i.DEPTH_ATTACHMENT,
            i.TEXTURE_2D,
            K,
            0,
          );
    else if (g.depthTexture.format === Ji)
      gt(g)
        ? o.framebufferTexture2DMultisampleEXT(
            i.FRAMEBUFFER,
            i.DEPTH_STENCIL_ATTACHMENT,
            i.TEXTURE_2D,
            K,
            0,
            V,
          )
        : i.framebufferTexture2D(
            i.FRAMEBUFFER,
            i.DEPTH_STENCIL_ATTACHMENT,
            i.TEXTURE_2D,
            K,
            0,
          );
    else throw new Error("Unknown depthTexture format");
  }
  function Wt(E) {
    const g = n.get(E),
      O = E.isWebGLCubeRenderTarget === !0;
    if (g.__boundDepthTexture !== E.depthTexture) {
      const $ = E.depthTexture;
      if ((g.__depthDisposeCallback && g.__depthDisposeCallback(), $)) {
        const K = () => {
          (delete g.__boundDepthTexture,
            delete g.__depthDisposeCallback,
            $.removeEventListener("dispose", K));
        };
        ($.addEventListener("dispose", K), (g.__depthDisposeCallback = K));
      }
      g.__boundDepthTexture = $;
    }
    if (E.depthTexture && !g.__autoAllocateDepthBuffer) {
      if (O)
        throw new Error(
          "target.depthTexture not supported in Cube render targets",
        );
      const $ = E.texture.mipmaps;
      $ && $.length > 0
        ? Et(g.__webglFramebuffer[0], E)
        : Et(g.__webglFramebuffer, E);
    } else if (O) {
      g.__webglDepthbuffer = [];
      for (let $ = 0; $ < 6; $++)
        if (
          (e.bindFramebuffer(i.FRAMEBUFFER, g.__webglFramebuffer[$]),
          g.__webglDepthbuffer[$] === void 0)
        )
          ((g.__webglDepthbuffer[$] = i.createRenderbuffer()),
            Lt(g.__webglDepthbuffer[$], E, !1));
        else {
          const K = E.stencilBuffer
              ? i.DEPTH_STENCIL_ATTACHMENT
              : i.DEPTH_ATTACHMENT,
            V = g.__webglDepthbuffer[$];
          (i.bindRenderbuffer(i.RENDERBUFFER, V),
            i.framebufferRenderbuffer(i.FRAMEBUFFER, K, i.RENDERBUFFER, V));
        }
    } else {
      const $ = E.texture.mipmaps;
      if (
        ($ && $.length > 0
          ? e.bindFramebuffer(i.FRAMEBUFFER, g.__webglFramebuffer[0])
          : e.bindFramebuffer(i.FRAMEBUFFER, g.__webglFramebuffer),
        g.__webglDepthbuffer === void 0)
      )
        ((g.__webglDepthbuffer = i.createRenderbuffer()),
          Lt(g.__webglDepthbuffer, E, !1));
      else {
        const K = E.stencilBuffer
            ? i.DEPTH_STENCIL_ATTACHMENT
            : i.DEPTH_ATTACHMENT,
          V = g.__webglDepthbuffer;
        (i.bindRenderbuffer(i.RENDERBUFFER, V),
          i.framebufferRenderbuffer(i.FRAMEBUFFER, K, i.RENDERBUFFER, V));
      }
    }
    e.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function ye(E, g, O) {
    const $ = n.get(E);
    (g !== void 0 &&
      ut(
        $.__webglFramebuffer,
        E,
        E.texture,
        i.COLOR_ATTACHMENT0,
        i.TEXTURE_2D,
        0,
      ),
      O !== void 0 && Wt(E));
  }
  function A(E) {
    const g = E.texture,
      O = n.get(E),
      $ = n.get(g);
    E.addEventListener("dispose", C);
    const K = E.textures,
      V = E.isWebGLCubeRenderTarget === !0,
      yt = K.length > 1;
    if (
      (yt ||
        ($.__webglTexture === void 0 && ($.__webglTexture = i.createTexture()),
        ($.__version = g.version),
        a.memory.textures++),
      V)
    ) {
      O.__webglFramebuffer = [];
      for (let nt = 0; nt < 6; nt++)
        if (g.mipmaps && g.mipmaps.length > 0) {
          O.__webglFramebuffer[nt] = [];
          for (let _t = 0; _t < g.mipmaps.length; _t++)
            O.__webglFramebuffer[nt][_t] = i.createFramebuffer();
        } else O.__webglFramebuffer[nt] = i.createFramebuffer();
    } else {
      if (g.mipmaps && g.mipmaps.length > 0) {
        O.__webglFramebuffer = [];
        for (let nt = 0; nt < g.mipmaps.length; nt++)
          O.__webglFramebuffer[nt] = i.createFramebuffer();
      } else O.__webglFramebuffer = i.createFramebuffer();
      if (yt)
        for (let nt = 0, _t = K.length; nt < _t; nt++) {
          const Mt = n.get(K[nt]);
          Mt.__webglTexture === void 0 &&
            ((Mt.__webglTexture = i.createTexture()), a.memory.textures++);
        }
      if (E.samples > 0 && gt(E) === !1) {
        ((O.__webglMultisampledFramebuffer = i.createFramebuffer()),
          (O.__webglColorRenderbuffer = []),
          e.bindFramebuffer(i.FRAMEBUFFER, O.__webglMultisampledFramebuffer));
        for (let nt = 0; nt < K.length; nt++) {
          const _t = K[nt];
          ((O.__webglColorRenderbuffer[nt] = i.createRenderbuffer()),
            i.bindRenderbuffer(i.RENDERBUFFER, O.__webglColorRenderbuffer[nt]));
          const Mt = r.convert(_t.format, _t.colorSpace),
            tt = r.convert(_t.type),
            ct = T(
              _t.internalFormat,
              Mt,
              tt,
              _t.colorSpace,
              E.isXRRenderTarget === !0,
            ),
            Rt = ce(E);
          (i.renderbufferStorageMultisample(
            i.RENDERBUFFER,
            Rt,
            ct,
            E.width,
            E.height,
          ),
            i.framebufferRenderbuffer(
              i.FRAMEBUFFER,
              i.COLOR_ATTACHMENT0 + nt,
              i.RENDERBUFFER,
              O.__webglColorRenderbuffer[nt],
            ));
        }
        (i.bindRenderbuffer(i.RENDERBUFFER, null),
          E.depthBuffer &&
            ((O.__webglDepthRenderbuffer = i.createRenderbuffer()),
            Lt(O.__webglDepthRenderbuffer, E, !0)),
          e.bindFramebuffer(i.FRAMEBUFFER, null));
      }
    }
    if (V) {
      (e.bindTexture(i.TEXTURE_CUBE_MAP, $.__webglTexture),
        kt(i.TEXTURE_CUBE_MAP, g));
      for (let nt = 0; nt < 6; nt++)
        if (g.mipmaps && g.mipmaps.length > 0)
          for (let _t = 0; _t < g.mipmaps.length; _t++)
            ut(
              O.__webglFramebuffer[nt][_t],
              E,
              g,
              i.COLOR_ATTACHMENT0,
              i.TEXTURE_CUBE_MAP_POSITIVE_X + nt,
              _t,
            );
        else
          ut(
            O.__webglFramebuffer[nt],
            E,
            g,
            i.COLOR_ATTACHMENT0,
            i.TEXTURE_CUBE_MAP_POSITIVE_X + nt,
            0,
          );
      (m(g) && d(i.TEXTURE_CUBE_MAP), e.unbindTexture());
    } else if (yt) {
      for (let nt = 0, _t = K.length; nt < _t; nt++) {
        const Mt = K[nt],
          tt = n.get(Mt);
        let ct = i.TEXTURE_2D;
        ((E.isWebGL3DRenderTarget || E.isWebGLArrayRenderTarget) &&
          (ct = E.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY),
          e.bindTexture(ct, tt.__webglTexture),
          kt(ct, Mt),
          ut(O.__webglFramebuffer, E, Mt, i.COLOR_ATTACHMENT0 + nt, ct, 0),
          m(Mt) && d(ct));
      }
      e.unbindTexture();
    } else {
      let nt = i.TEXTURE_2D;
      if (
        ((E.isWebGL3DRenderTarget || E.isWebGLArrayRenderTarget) &&
          (nt = E.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY),
        e.bindTexture(nt, $.__webglTexture),
        kt(nt, g),
        g.mipmaps && g.mipmaps.length > 0)
      )
        for (let _t = 0; _t < g.mipmaps.length; _t++)
          ut(O.__webglFramebuffer[_t], E, g, i.COLOR_ATTACHMENT0, nt, _t);
      else ut(O.__webglFramebuffer, E, g, i.COLOR_ATTACHMENT0, nt, 0);
      (m(g) && d(nt), e.unbindTexture());
    }
    E.depthBuffer && Wt(E);
  }
  function oe(E) {
    const g = E.textures;
    for (let O = 0, $ = g.length; O < $; O++) {
      const K = g[O];
      if (m(K)) {
        const V = b(E),
          yt = n.get(K).__webglTexture;
        (e.bindTexture(V, yt), d(V), e.unbindTexture());
      }
    }
  }
  const Ut = [],
    Ct = [];
  function mt(E) {
    if (E.samples > 0) {
      if (gt(E) === !1) {
        const g = E.textures,
          O = E.width,
          $ = E.height;
        let K = i.COLOR_BUFFER_BIT;
        const V = E.stencilBuffer
            ? i.DEPTH_STENCIL_ATTACHMENT
            : i.DEPTH_ATTACHMENT,
          yt = n.get(E),
          nt = g.length > 1;
        if (nt)
          for (let Mt = 0; Mt < g.length; Mt++)
            (e.bindFramebuffer(
              i.FRAMEBUFFER,
              yt.__webglMultisampledFramebuffer,
            ),
              i.framebufferRenderbuffer(
                i.FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + Mt,
                i.RENDERBUFFER,
                null,
              ),
              e.bindFramebuffer(i.FRAMEBUFFER, yt.__webglFramebuffer),
              i.framebufferTexture2D(
                i.DRAW_FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + Mt,
                i.TEXTURE_2D,
                null,
                0,
              ));
        e.bindFramebuffer(
          i.READ_FRAMEBUFFER,
          yt.__webglMultisampledFramebuffer,
        );
        const _t = E.texture.mipmaps;
        _t && _t.length > 0
          ? e.bindFramebuffer(i.DRAW_FRAMEBUFFER, yt.__webglFramebuffer[0])
          : e.bindFramebuffer(i.DRAW_FRAMEBUFFER, yt.__webglFramebuffer);
        for (let Mt = 0; Mt < g.length; Mt++) {
          if (
            (E.resolveDepthBuffer &&
              (E.depthBuffer && (K |= i.DEPTH_BUFFER_BIT),
              E.stencilBuffer &&
                E.resolveStencilBuffer &&
                (K |= i.STENCIL_BUFFER_BIT)),
            nt)
          ) {
            i.framebufferRenderbuffer(
              i.READ_FRAMEBUFFER,
              i.COLOR_ATTACHMENT0,
              i.RENDERBUFFER,
              yt.__webglColorRenderbuffer[Mt],
            );
            const tt = n.get(g[Mt]).__webglTexture;
            i.framebufferTexture2D(
              i.DRAW_FRAMEBUFFER,
              i.COLOR_ATTACHMENT0,
              i.TEXTURE_2D,
              tt,
              0,
            );
          }
          (i.blitFramebuffer(0, 0, O, $, 0, 0, O, $, K, i.NEAREST),
            l === !0 &&
              ((Ut.length = 0),
              (Ct.length = 0),
              Ut.push(i.COLOR_ATTACHMENT0 + Mt),
              E.depthBuffer &&
                E.resolveDepthBuffer === !1 &&
                (Ut.push(V),
                Ct.push(V),
                i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, Ct)),
              i.invalidateFramebuffer(i.READ_FRAMEBUFFER, Ut)));
        }
        if (
          (e.bindFramebuffer(i.READ_FRAMEBUFFER, null),
          e.bindFramebuffer(i.DRAW_FRAMEBUFFER, null),
          nt)
        )
          for (let Mt = 0; Mt < g.length; Mt++) {
            (e.bindFramebuffer(
              i.FRAMEBUFFER,
              yt.__webglMultisampledFramebuffer,
            ),
              i.framebufferRenderbuffer(
                i.FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + Mt,
                i.RENDERBUFFER,
                yt.__webglColorRenderbuffer[Mt],
              ));
            const tt = n.get(g[Mt]).__webglTexture;
            (e.bindFramebuffer(i.FRAMEBUFFER, yt.__webglFramebuffer),
              i.framebufferTexture2D(
                i.DRAW_FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + Mt,
                i.TEXTURE_2D,
                tt,
                0,
              ));
          }
        e.bindFramebuffer(
          i.DRAW_FRAMEBUFFER,
          yt.__webglMultisampledFramebuffer,
        );
      } else if (E.depthBuffer && E.resolveDepthBuffer === !1 && l) {
        const g = E.stencilBuffer
          ? i.DEPTH_STENCIL_ATTACHMENT
          : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [g]);
      }
    }
  }
  function ce(E) {
    return Math.min(s.maxSamples, E.samples);
  }
  function gt(E) {
    const g = n.get(E);
    return (
      E.samples > 0 &&
      t.has("WEBGL_multisampled_render_to_texture") === !0 &&
      g.__useRenderToTexture !== !1
    );
  }
  function Ot(E) {
    const g = a.render.frame;
    h.get(E) !== g && (h.set(E, g), E.update());
  }
  function Me(E, g) {
    const O = E.colorSpace,
      $ = E.format,
      K = E.type;
    return (
      E.isCompressedTexture === !0 ||
        E.isVideoTexture === !0 ||
        (O !== Ai &&
          O !== Cn &&
          (Yt.getTransfer(O) === Qt
            ? ($ !== sn || K !== un) &&
              console.warn(
                "THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.",
              )
            : console.error(
                "THREE.WebGLTextures: Unsupported texture color space:",
                O,
              ))),
      g
    );
  }
  function fe(E) {
    return (
      typeof HTMLImageElement < "u" && E instanceof HTMLImageElement
        ? ((c.width = E.naturalWidth || E.width),
          (c.height = E.naturalHeight || E.height))
        : typeof VideoFrame < "u" && E instanceof VideoFrame
          ? ((c.width = E.displayWidth), (c.height = E.displayHeight))
          : ((c.width = E.width), (c.height = E.height)),
      c
    );
  }
  ((this.allocateTextureUnit = B),
    (this.resetTextureUnits = N),
    (this.setTexture2D = G),
    (this.setTexture2DArray = X),
    (this.setTexture3D = j),
    (this.setTextureCube = H),
    (this.rebindTextures = ye),
    (this.setupRenderTarget = A),
    (this.updateRenderTargetMipmap = oe),
    (this.updateMultisampleRenderTarget = mt),
    (this.setupDepthRenderbuffer = Wt),
    (this.setupFrameBufferTexture = ut),
    (this.useMultisampledRTT = gt));
}
function Nm(i, t) {
  function e(n, s = Cn) {
    let r;
    const a = Yt.getTransfer(s);
    if (n === un) return i.UNSIGNED_BYTE;
    if (n === Na) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === Fa) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === Rc) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === Cc) return i.UNSIGNED_INT_10F_11F_11F_REV;
    if (n === Ac) return i.BYTE;
    if (n === wc) return i.SHORT;
    if (n === ji) return i.UNSIGNED_SHORT;
    if (n === Ua) return i.INT;
    if (n === ti) return i.UNSIGNED_INT;
    if (n === ln) return i.FLOAT;
    if (n === ns) return i.HALF_FLOAT;
    if (n === Pc) return i.ALPHA;
    if (n === Dc) return i.RGB;
    if (n === sn) return i.RGBA;
    if (n === Zi) return i.DEPTH_COMPONENT;
    if (n === Ji) return i.DEPTH_STENCIL;
    if (n === Oa) return i.RED;
    if (n === Ba) return i.RED_INTEGER;
    if (n === Lc) return i.RG;
    if (n === ka) return i.RG_INTEGER;
    if (n === za) return i.RGBA_INTEGER;
    if (n === Us || n === Ns || n === Fs || n === Os)
      if (a === Qt)
        if (((r = t.get("WEBGL_compressed_texture_s3tc_srgb")), r !== null)) {
          if (n === Us) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === Ns) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === Fs) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === Os) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else return null;
      else if (((r = t.get("WEBGL_compressed_texture_s3tc")), r !== null)) {
        if (n === Us) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === Ns) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === Fs) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === Os) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else return null;
    if (n === ea || n === na || n === ia || n === sa)
      if (((r = t.get("WEBGL_compressed_texture_pvrtc")), r !== null)) {
        if (n === ea) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === na) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === ia) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === sa) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else return null;
    if (n === ra || n === aa || n === oa)
      if (((r = t.get("WEBGL_compressed_texture_etc")), r !== null)) {
        if (n === ra || n === aa)
          return a === Qt ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === oa)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC
            : r.COMPRESSED_RGBA8_ETC2_EAC;
      } else return null;
    if (
      n === ca ||
      n === la ||
      n === da ||
      n === ha ||
      n === ua ||
      n === fa ||
      n === pa ||
      n === ma ||
      n === ga ||
      n === _a ||
      n === va ||
      n === xa ||
      n === Ma ||
      n === Sa
    )
      if (((r = t.get("WEBGL_compressed_texture_astc")), r !== null)) {
        if (n === ca)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR
            : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === la)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR
            : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === da)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR
            : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === ha)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR
            : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === ua)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR
            : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === fa)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR
            : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === pa)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR
            : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === ma)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR
            : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === ga)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR
            : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === _a)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR
            : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === va)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR
            : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === xa)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR
            : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === Ma)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR
            : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === Sa)
          return a === Qt
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR
            : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else return null;
    if (n === ya || n === Ea || n === ba)
      if (((r = t.get("EXT_texture_compression_bptc")), r !== null)) {
        if (n === ya)
          return a === Qt
            ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT
            : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === Ea) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === ba) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else return null;
    if (n === Ta || n === Aa || n === wa || n === Ra)
      if (((r = t.get("EXT_texture_compression_rgtc")), r !== null)) {
        if (n === Ta) return r.COMPRESSED_RED_RGTC1_EXT;
        if (n === Aa) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === wa) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === Ra) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else return null;
    return n === Ki ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: e };
}
const Fm = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`,
  Om = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class Bm {
  constructor() {
    ((this.texture = null),
      (this.mesh = null),
      (this.depthNear = 0),
      (this.depthFar = 0));
  }
  init(t, e) {
    if (this.texture === null) {
      const n = new Yc(t.texture);
      ((t.depthNear !== e.depthNear || t.depthFar !== e.depthFar) &&
        ((this.depthNear = t.depthNear), (this.depthFar = t.depthFar)),
        (this.texture = n));
    }
  }
  getMesh(t) {
    if (this.texture !== null && this.mesh === null) {
      const e = t.cameras[0].viewport,
        n = new Nn({
          vertexShader: Fm,
          fragmentShader: Om,
          uniforms: {
            depthColor: { value: this.texture },
            depthWidth: { value: e.z },
            depthHeight: { value: e.w },
          },
        });
      this.mesh = new me(new Ui(20, 20), n);
    }
    return this.mesh;
  }
  reset() {
    ((this.texture = null), (this.mesh = null));
  }
  getDepthTexture() {
    return this.texture;
  }
}
class km extends Ci {
  constructor(t, e) {
    super();
    const n = this;
    let s = null,
      r = 1,
      a = null,
      o = "local-floor",
      l = 1,
      c = null,
      h = null,
      u = null,
      f = null,
      p = null,
      _ = null;
    const x = typeof XRWebGLBinding < "u",
      m = new Bm(),
      d = {},
      b = e.getContextAttributes();
    let T = null,
      y = null;
    const R = [],
      w = [],
      C = new Xt();
    let U = null;
    const S = new je();
    S.viewport = new ue();
    const M = new je();
    M.viewport = new ue();
    const P = [S, M],
      N = new rh();
    let B = null,
      W = null;
    ((this.cameraAutoUpdate = !0),
      (this.enabled = !1),
      (this.isPresenting = !1),
      (this.getController = function (q) {
        let Z = R[q];
        return (
          Z === void 0 && ((Z = new Cr()), (R[q] = Z)),
          Z.getTargetRaySpace()
        );
      }),
      (this.getControllerGrip = function (q) {
        let Z = R[q];
        return (Z === void 0 && ((Z = new Cr()), (R[q] = Z)), Z.getGripSpace());
      }),
      (this.getHand = function (q) {
        let Z = R[q];
        return (Z === void 0 && ((Z = new Cr()), (R[q] = Z)), Z.getHandSpace());
      }));
    function G(q) {
      const Z = w.indexOf(q.inputSource);
      if (Z === -1) return;
      const ut = R[Z];
      ut !== void 0 &&
        (ut.update(q.inputSource, q.frame, c || a),
        ut.dispatchEvent({ type: q.type, data: q.inputSource }));
    }
    function X() {
      (s.removeEventListener("select", G),
        s.removeEventListener("selectstart", G),
        s.removeEventListener("selectend", G),
        s.removeEventListener("squeeze", G),
        s.removeEventListener("squeezestart", G),
        s.removeEventListener("squeezeend", G),
        s.removeEventListener("end", X),
        s.removeEventListener("inputsourceschange", j));
      for (let q = 0; q < R.length; q++) {
        const Z = w[q];
        Z !== null && ((w[q] = null), R[q].disconnect(Z));
      }
      ((B = null), (W = null), m.reset());
      for (const q in d) delete d[q];
      (t.setRenderTarget(T),
        (p = null),
        (f = null),
        (u = null),
        (s = null),
        (y = null),
        Kt.stop(),
        (n.isPresenting = !1),
        t.setPixelRatio(U),
        t.setSize(C.width, C.height, !1),
        n.dispatchEvent({ type: "sessionend" }));
    }
    ((this.setFramebufferScaleFactor = function (q) {
      ((r = q),
        n.isPresenting === !0 &&
          console.warn(
            "THREE.WebXRManager: Cannot change framebuffer scale while presenting.",
          ));
    }),
      (this.setReferenceSpaceType = function (q) {
        ((o = q),
          n.isPresenting === !0 &&
            console.warn(
              "THREE.WebXRManager: Cannot change reference space type while presenting.",
            ));
      }),
      (this.getReferenceSpace = function () {
        return c || a;
      }),
      (this.setReferenceSpace = function (q) {
        c = q;
      }),
      (this.getBaseLayer = function () {
        return f !== null ? f : p;
      }),
      (this.getBinding = function () {
        return (u === null && x && (u = new XRWebGLBinding(s, e)), u);
      }),
      (this.getFrame = function () {
        return _;
      }),
      (this.getSession = function () {
        return s;
      }),
      (this.setSession = async function (q) {
        if (((s = q), s !== null)) {
          if (
            ((T = t.getRenderTarget()),
            s.addEventListener("select", G),
            s.addEventListener("selectstart", G),
            s.addEventListener("selectend", G),
            s.addEventListener("squeeze", G),
            s.addEventListener("squeezestart", G),
            s.addEventListener("squeezeend", G),
            s.addEventListener("end", X),
            s.addEventListener("inputsourceschange", j),
            b.xrCompatible !== !0 && (await e.makeXRCompatible()),
            (U = t.getPixelRatio()),
            t.getSize(C),
            x && "createProjectionLayer" in XRWebGLBinding.prototype)
          ) {
            let ut = null,
              Lt = null,
              Et = null;
            b.depth &&
              ((Et = b.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24),
              (ut = b.stencil ? Ji : Zi),
              (Lt = b.stencil ? Ki : ti));
            const Wt = {
              colorFormat: e.RGBA8,
              depthFormat: Et,
              scaleFactor: r,
            };
            ((u = this.getBinding()),
              (f = u.createProjectionLayer(Wt)),
              s.updateRenderState({ layers: [f] }),
              t.setPixelRatio(1),
              t.setSize(f.textureWidth, f.textureHeight, !1),
              (y = new ei(f.textureWidth, f.textureHeight, {
                format: sn,
                type: un,
                depthTexture: new qc(
                  f.textureWidth,
                  f.textureHeight,
                  Lt,
                  void 0,
                  void 0,
                  void 0,
                  void 0,
                  void 0,
                  void 0,
                  ut,
                ),
                stencilBuffer: b.stencil,
                colorSpace: t.outputColorSpace,
                samples: b.antialias ? 4 : 0,
                resolveDepthBuffer: f.ignoreDepthValues === !1,
                resolveStencilBuffer: f.ignoreDepthValues === !1,
              })));
          } else {
            const ut = {
              antialias: b.antialias,
              alpha: !0,
              depth: b.depth,
              stencil: b.stencil,
              framebufferScaleFactor: r,
            };
            ((p = new XRWebGLLayer(s, e, ut)),
              s.updateRenderState({ baseLayer: p }),
              t.setPixelRatio(1),
              t.setSize(p.framebufferWidth, p.framebufferHeight, !1),
              (y = new ei(p.framebufferWidth, p.framebufferHeight, {
                format: sn,
                type: un,
                colorSpace: t.outputColorSpace,
                stencilBuffer: b.stencil,
                resolveDepthBuffer: p.ignoreDepthValues === !1,
                resolveStencilBuffer: p.ignoreDepthValues === !1,
              })));
          }
          ((y.isXRRenderTarget = !0),
            this.setFoveation(l),
            (c = null),
            (a = await s.requestReferenceSpace(o)),
            Kt.setContext(s),
            Kt.start(),
            (n.isPresenting = !0),
            n.dispatchEvent({ type: "sessionstart" }));
        }
      }),
      (this.getEnvironmentBlendMode = function () {
        if (s !== null) return s.environmentBlendMode;
      }),
      (this.getDepthTexture = function () {
        return m.getDepthTexture();
      }));
    function j(q) {
      for (let Z = 0; Z < q.removed.length; Z++) {
        const ut = q.removed[Z],
          Lt = w.indexOf(ut);
        Lt >= 0 && ((w[Lt] = null), R[Lt].disconnect(ut));
      }
      for (let Z = 0; Z < q.added.length; Z++) {
        const ut = q.added[Z];
        let Lt = w.indexOf(ut);
        if (Lt === -1) {
          for (let Wt = 0; Wt < R.length; Wt++)
            if (Wt >= w.length) {
              (w.push(ut), (Lt = Wt));
              break;
            } else if (w[Wt] === null) {
              ((w[Wt] = ut), (Lt = Wt));
              break;
            }
          if (Lt === -1) break;
        }
        const Et = R[Lt];
        Et && Et.connect(ut);
      }
    }
    const H = new F(),
      rt = new F();
    function lt(q, Z, ut) {
      (H.setFromMatrixPosition(Z.matrixWorld),
        rt.setFromMatrixPosition(ut.matrixWorld));
      const Lt = H.distanceTo(rt),
        Et = Z.projectionMatrix.elements,
        Wt = ut.projectionMatrix.elements,
        ye = Et[14] / (Et[10] - 1),
        A = Et[14] / (Et[10] + 1),
        oe = (Et[9] + 1) / Et[5],
        Ut = (Et[9] - 1) / Et[5],
        Ct = (Et[8] - 1) / Et[0],
        mt = (Wt[8] + 1) / Wt[0],
        ce = ye * Ct,
        gt = ye * mt,
        Ot = Lt / (-Ct + mt),
        Me = Ot * -Ct;
      if (
        (Z.matrixWorld.decompose(q.position, q.quaternion, q.scale),
        q.translateX(Me),
        q.translateZ(Ot),
        q.matrixWorld.compose(q.position, q.quaternion, q.scale),
        q.matrixWorldInverse.copy(q.matrixWorld).invert(),
        Et[10] === -1)
      )
        (q.projectionMatrix.copy(Z.projectionMatrix),
          q.projectionMatrixInverse.copy(Z.projectionMatrixInverse));
      else {
        const fe = ye + Ot,
          E = A + Ot,
          g = ce - Me,
          O = gt + (Lt - Me),
          $ = ((oe * A) / E) * fe,
          K = ((Ut * A) / E) * fe;
        (q.projectionMatrix.makePerspective(g, O, $, K, fe, E),
          q.projectionMatrixInverse.copy(q.projectionMatrix).invert());
      }
    }
    function bt(q, Z) {
      (Z === null
        ? q.matrixWorld.copy(q.matrix)
        : q.matrixWorld.multiplyMatrices(Z.matrixWorld, q.matrix),
        q.matrixWorldInverse.copy(q.matrixWorld).invert());
    }
    this.updateCamera = function (q) {
      if (s === null) return;
      let Z = q.near,
        ut = q.far;
      (m.texture !== null &&
        (m.depthNear > 0 && (Z = m.depthNear),
        m.depthFar > 0 && (ut = m.depthFar)),
        (N.near = M.near = S.near = Z),
        (N.far = M.far = S.far = ut),
        (B !== N.near || W !== N.far) &&
          (s.updateRenderState({ depthNear: N.near, depthFar: N.far }),
          (B = N.near),
          (W = N.far)),
        (N.layers.mask = q.layers.mask | 6),
        (S.layers.mask = N.layers.mask & 3),
        (M.layers.mask = N.layers.mask & 5));
      const Lt = q.parent,
        Et = N.cameras;
      bt(N, Lt);
      for (let Wt = 0; Wt < Et.length; Wt++) bt(Et[Wt], Lt);
      (Et.length === 2
        ? lt(N, S, M)
        : N.projectionMatrix.copy(S.projectionMatrix),
        kt(q, N, Lt));
    };
    function kt(q, Z, ut) {
      (ut === null
        ? q.matrix.copy(Z.matrixWorld)
        : (q.matrix.copy(ut.matrixWorld),
          q.matrix.invert(),
          q.matrix.multiply(Z.matrixWorld)),
        q.matrix.decompose(q.position, q.quaternion, q.scale),
        q.updateMatrixWorld(!0),
        q.projectionMatrix.copy(Z.projectionMatrix),
        q.projectionMatrixInverse.copy(Z.projectionMatrixInverse),
        q.isPerspectiveCamera &&
          ((q.fov = Ca * 2 * Math.atan(1 / q.projectionMatrix.elements[5])),
          (q.zoom = 1)));
    }
    ((this.getCamera = function () {
      return N;
    }),
      (this.getFoveation = function () {
        if (!(f === null && p === null)) return l;
      }),
      (this.setFoveation = function (q) {
        ((l = q),
          f !== null && (f.fixedFoveation = q),
          p !== null && p.fixedFoveation !== void 0 && (p.fixedFoveation = q));
      }),
      (this.hasDepthSensing = function () {
        return m.texture !== null;
      }),
      (this.getDepthSensingMesh = function () {
        return m.getMesh(N);
      }),
      (this.getCameraTexture = function (q) {
        return d[q];
      }));
    let ne = null;
    function ae(q, Z) {
      if (((h = Z.getViewerPose(c || a)), (_ = Z), h !== null)) {
        const ut = h.views;
        p !== null &&
          (t.setRenderTargetFramebuffer(y, p.framebuffer),
          t.setRenderTarget(y));
        let Lt = !1;
        ut.length !== N.cameras.length && ((N.cameras.length = 0), (Lt = !0));
        for (let A = 0; A < ut.length; A++) {
          const oe = ut[A];
          let Ut = null;
          if (p !== null) Ut = p.getViewport(oe);
          else {
            const mt = u.getViewSubImage(f, oe);
            ((Ut = mt.viewport),
              A === 0 &&
                (t.setRenderTargetTextures(
                  y,
                  mt.colorTexture,
                  mt.depthStencilTexture,
                ),
                t.setRenderTarget(y)));
          }
          let Ct = P[A];
          (Ct === void 0 &&
            ((Ct = new je()),
            Ct.layers.enable(A),
            (Ct.viewport = new ue()),
            (P[A] = Ct)),
            Ct.matrix.fromArray(oe.transform.matrix),
            Ct.matrix.decompose(Ct.position, Ct.quaternion, Ct.scale),
            Ct.projectionMatrix.fromArray(oe.projectionMatrix),
            Ct.projectionMatrixInverse.copy(Ct.projectionMatrix).invert(),
            Ct.viewport.set(Ut.x, Ut.y, Ut.width, Ut.height),
            A === 0 &&
              (N.matrix.copy(Ct.matrix),
              N.matrix.decompose(N.position, N.quaternion, N.scale)),
            Lt === !0 && N.cameras.push(Ct));
        }
        const Et = s.enabledFeatures;
        if (
          Et &&
          Et.includes("depth-sensing") &&
          s.depthUsage == "gpu-optimized" &&
          x
        ) {
          u = n.getBinding();
          const A = u.getDepthInformation(ut[0]);
          A && A.isValid && A.texture && m.init(A, s.renderState);
        }
        if (Et && Et.includes("camera-access") && x) {
          (t.state.unbindTexture(), (u = n.getBinding()));
          for (let A = 0; A < ut.length; A++) {
            const oe = ut[A].camera;
            if (oe) {
              let Ut = d[oe];
              Ut || ((Ut = new Yc()), (d[oe] = Ut));
              const Ct = u.getCameraImage(oe);
              Ut.sourceTexture = Ct;
            }
          }
        }
      }
      for (let ut = 0; ut < R.length; ut++) {
        const Lt = w[ut],
          Et = R[ut];
        Lt !== null && Et !== void 0 && Et.update(Lt, Z, c || a);
      }
      (ne && ne(q, Z),
        Z.detectedPlanes &&
          n.dispatchEvent({ type: "planesdetected", data: Z }),
        (_ = null));
    }
    const Kt = new Zc();
    (Kt.setAnimationLoop(ae),
      (this.setAnimationLoop = function (q) {
        ne = q;
      }),
      (this.dispose = function () {}));
  }
}
const Gn = new fn(),
  zm = new re();
function Hm(i, t) {
  function e(m, d) {
    (m.matrixAutoUpdate === !0 && m.updateMatrix(), d.value.copy(m.matrix));
  }
  function n(m, d) {
    (d.color.getRGB(m.fogColor.value, Vc(i)),
      d.isFog
        ? ((m.fogNear.value = d.near), (m.fogFar.value = d.far))
        : d.isFogExp2 && (m.fogDensity.value = d.density));
  }
  function s(m, d, b, T, y) {
    d.isMeshBasicMaterial || d.isMeshLambertMaterial
      ? r(m, d)
      : d.isMeshToonMaterial
        ? (r(m, d), u(m, d))
        : d.isMeshPhongMaterial
          ? (r(m, d), h(m, d))
          : d.isMeshStandardMaterial
            ? (r(m, d), f(m, d), d.isMeshPhysicalMaterial && p(m, d, y))
            : d.isMeshMatcapMaterial
              ? (r(m, d), _(m, d))
              : d.isMeshDepthMaterial
                ? r(m, d)
                : d.isMeshDistanceMaterial
                  ? (r(m, d), x(m, d))
                  : d.isMeshNormalMaterial
                    ? r(m, d)
                    : d.isLineBasicMaterial
                      ? (a(m, d), d.isLineDashedMaterial && o(m, d))
                      : d.isPointsMaterial
                        ? l(m, d, b, T)
                        : d.isSpriteMaterial
                          ? c(m, d)
                          : d.isShadowMaterial
                            ? (m.color.value.copy(d.color),
                              (m.opacity.value = d.opacity))
                            : d.isShaderMaterial && (d.uniformsNeedUpdate = !1);
  }
  function r(m, d) {
    ((m.opacity.value = d.opacity),
      d.color && m.diffuse.value.copy(d.color),
      d.emissive &&
        m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),
      d.map && ((m.map.value = d.map), e(d.map, m.mapTransform)),
      d.alphaMap &&
        ((m.alphaMap.value = d.alphaMap), e(d.alphaMap, m.alphaMapTransform)),
      d.bumpMap &&
        ((m.bumpMap.value = d.bumpMap),
        e(d.bumpMap, m.bumpMapTransform),
        (m.bumpScale.value = d.bumpScale),
        d.side === Ne && (m.bumpScale.value *= -1)),
      d.normalMap &&
        ((m.normalMap.value = d.normalMap),
        e(d.normalMap, m.normalMapTransform),
        m.normalScale.value.copy(d.normalScale),
        d.side === Ne && m.normalScale.value.negate()),
      d.displacementMap &&
        ((m.displacementMap.value = d.displacementMap),
        e(d.displacementMap, m.displacementMapTransform),
        (m.displacementScale.value = d.displacementScale),
        (m.displacementBias.value = d.displacementBias)),
      d.emissiveMap &&
        ((m.emissiveMap.value = d.emissiveMap),
        e(d.emissiveMap, m.emissiveMapTransform)),
      d.specularMap &&
        ((m.specularMap.value = d.specularMap),
        e(d.specularMap, m.specularMapTransform)),
      d.alphaTest > 0 && (m.alphaTest.value = d.alphaTest));
    const b = t.get(d),
      T = b.envMap,
      y = b.envMapRotation;
    (T &&
      ((m.envMap.value = T),
      Gn.copy(y),
      (Gn.x *= -1),
      (Gn.y *= -1),
      (Gn.z *= -1),
      T.isCubeTexture &&
        T.isRenderTargetTexture === !1 &&
        ((Gn.y *= -1), (Gn.z *= -1)),
      m.envMapRotation.value.setFromMatrix4(zm.makeRotationFromEuler(Gn)),
      (m.flipEnvMap.value =
        T.isCubeTexture && T.isRenderTargetTexture === !1 ? -1 : 1),
      (m.reflectivity.value = d.reflectivity),
      (m.ior.value = d.ior),
      (m.refractionRatio.value = d.refractionRatio)),
      d.lightMap &&
        ((m.lightMap.value = d.lightMap),
        (m.lightMapIntensity.value = d.lightMapIntensity),
        e(d.lightMap, m.lightMapTransform)),
      d.aoMap &&
        ((m.aoMap.value = d.aoMap),
        (m.aoMapIntensity.value = d.aoMapIntensity),
        e(d.aoMap, m.aoMapTransform)));
  }
  function a(m, d) {
    (m.diffuse.value.copy(d.color),
      (m.opacity.value = d.opacity),
      d.map && ((m.map.value = d.map), e(d.map, m.mapTransform)));
  }
  function o(m, d) {
    ((m.dashSize.value = d.dashSize),
      (m.totalSize.value = d.dashSize + d.gapSize),
      (m.scale.value = d.scale));
  }
  function l(m, d, b, T) {
    (m.diffuse.value.copy(d.color),
      (m.opacity.value = d.opacity),
      (m.size.value = d.size * b),
      (m.scale.value = T * 0.5),
      d.map && ((m.map.value = d.map), e(d.map, m.uvTransform)),
      d.alphaMap &&
        ((m.alphaMap.value = d.alphaMap), e(d.alphaMap, m.alphaMapTransform)),
      d.alphaTest > 0 && (m.alphaTest.value = d.alphaTest));
  }
  function c(m, d) {
    (m.diffuse.value.copy(d.color),
      (m.opacity.value = d.opacity),
      (m.rotation.value = d.rotation),
      d.map && ((m.map.value = d.map), e(d.map, m.mapTransform)),
      d.alphaMap &&
        ((m.alphaMap.value = d.alphaMap), e(d.alphaMap, m.alphaMapTransform)),
      d.alphaTest > 0 && (m.alphaTest.value = d.alphaTest));
  }
  function h(m, d) {
    (m.specular.value.copy(d.specular),
      (m.shininess.value = Math.max(d.shininess, 1e-4)));
  }
  function u(m, d) {
    d.gradientMap && (m.gradientMap.value = d.gradientMap);
  }
  function f(m, d) {
    ((m.metalness.value = d.metalness),
      d.metalnessMap &&
        ((m.metalnessMap.value = d.metalnessMap),
        e(d.metalnessMap, m.metalnessMapTransform)),
      (m.roughness.value = d.roughness),
      d.roughnessMap &&
        ((m.roughnessMap.value = d.roughnessMap),
        e(d.roughnessMap, m.roughnessMapTransform)),
      d.envMap && (m.envMapIntensity.value = d.envMapIntensity));
  }
  function p(m, d, b) {
    ((m.ior.value = d.ior),
      d.sheen > 0 &&
        (m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),
        (m.sheenRoughness.value = d.sheenRoughness),
        d.sheenColorMap &&
          ((m.sheenColorMap.value = d.sheenColorMap),
          e(d.sheenColorMap, m.sheenColorMapTransform)),
        d.sheenRoughnessMap &&
          ((m.sheenRoughnessMap.value = d.sheenRoughnessMap),
          e(d.sheenRoughnessMap, m.sheenRoughnessMapTransform))),
      d.clearcoat > 0 &&
        ((m.clearcoat.value = d.clearcoat),
        (m.clearcoatRoughness.value = d.clearcoatRoughness),
        d.clearcoatMap &&
          ((m.clearcoatMap.value = d.clearcoatMap),
          e(d.clearcoatMap, m.clearcoatMapTransform)),
        d.clearcoatRoughnessMap &&
          ((m.clearcoatRoughnessMap.value = d.clearcoatRoughnessMap),
          e(d.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)),
        d.clearcoatNormalMap &&
          ((m.clearcoatNormalMap.value = d.clearcoatNormalMap),
          e(d.clearcoatNormalMap, m.clearcoatNormalMapTransform),
          m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),
          d.side === Ne && m.clearcoatNormalScale.value.negate())),
      d.dispersion > 0 && (m.dispersion.value = d.dispersion),
      d.iridescence > 0 &&
        ((m.iridescence.value = d.iridescence),
        (m.iridescenceIOR.value = d.iridescenceIOR),
        (m.iridescenceThicknessMinimum.value = d.iridescenceThicknessRange[0]),
        (m.iridescenceThicknessMaximum.value = d.iridescenceThicknessRange[1]),
        d.iridescenceMap &&
          ((m.iridescenceMap.value = d.iridescenceMap),
          e(d.iridescenceMap, m.iridescenceMapTransform)),
        d.iridescenceThicknessMap &&
          ((m.iridescenceThicknessMap.value = d.iridescenceThicknessMap),
          e(d.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))),
      d.transmission > 0 &&
        ((m.transmission.value = d.transmission),
        (m.transmissionSamplerMap.value = b.texture),
        m.transmissionSamplerSize.value.set(b.width, b.height),
        d.transmissionMap &&
          ((m.transmissionMap.value = d.transmissionMap),
          e(d.transmissionMap, m.transmissionMapTransform)),
        (m.thickness.value = d.thickness),
        d.thicknessMap &&
          ((m.thicknessMap.value = d.thicknessMap),
          e(d.thicknessMap, m.thicknessMapTransform)),
        (m.attenuationDistance.value = d.attenuationDistance),
        m.attenuationColor.value.copy(d.attenuationColor)),
      d.anisotropy > 0 &&
        (m.anisotropyVector.value.set(
          d.anisotropy * Math.cos(d.anisotropyRotation),
          d.anisotropy * Math.sin(d.anisotropyRotation),
        ),
        d.anisotropyMap &&
          ((m.anisotropyMap.value = d.anisotropyMap),
          e(d.anisotropyMap, m.anisotropyMapTransform))),
      (m.specularIntensity.value = d.specularIntensity),
      m.specularColor.value.copy(d.specularColor),
      d.specularColorMap &&
        ((m.specularColorMap.value = d.specularColorMap),
        e(d.specularColorMap, m.specularColorMapTransform)),
      d.specularIntensityMap &&
        ((m.specularIntensityMap.value = d.specularIntensityMap),
        e(d.specularIntensityMap, m.specularIntensityMapTransform)));
  }
  function _(m, d) {
    d.matcap && (m.matcap.value = d.matcap);
  }
  function x(m, d) {
    const b = t.get(d).light;
    (m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),
      (m.nearDistance.value = b.shadow.camera.near),
      (m.farDistance.value = b.shadow.camera.far));
  }
  return { refreshFogUniforms: n, refreshMaterialUniforms: s };
}
function Vm(i, t, e, n) {
  let s = {},
    r = {},
    a = [];
  const o = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(b, T) {
    const y = T.program;
    n.uniformBlockBinding(b, y);
  }
  function c(b, T) {
    let y = s[b.id];
    y === void 0 &&
      (_(b), (y = h(b)), (s[b.id] = y), b.addEventListener("dispose", m));
    const R = T.program;
    n.updateUBOMapping(b, R);
    const w = t.render.frame;
    r[b.id] !== w && (f(b), (r[b.id] = w));
  }
  function h(b) {
    const T = u();
    b.__bindingPointIndex = T;
    const y = i.createBuffer(),
      R = b.__size,
      w = b.usage;
    return (
      i.bindBuffer(i.UNIFORM_BUFFER, y),
      i.bufferData(i.UNIFORM_BUFFER, R, w),
      i.bindBuffer(i.UNIFORM_BUFFER, null),
      i.bindBufferBase(i.UNIFORM_BUFFER, T, y),
      y
    );
  }
  function u() {
    for (let b = 0; b < o; b++) if (a.indexOf(b) === -1) return (a.push(b), b);
    return (
      console.error(
        "THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.",
      ),
      0
    );
  }
  function f(b) {
    const T = s[b.id],
      y = b.uniforms,
      R = b.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, T);
    for (let w = 0, C = y.length; w < C; w++) {
      const U = Array.isArray(y[w]) ? y[w] : [y[w]];
      for (let S = 0, M = U.length; S < M; S++) {
        const P = U[S];
        if (p(P, w, S, R) === !0) {
          const N = P.__offset,
            B = Array.isArray(P.value) ? P.value : [P.value];
          let W = 0;
          for (let G = 0; G < B.length; G++) {
            const X = B[G],
              j = x(X);
            typeof X == "number" || typeof X == "boolean"
              ? ((P.__data[0] = X),
                i.bufferSubData(i.UNIFORM_BUFFER, N + W, P.__data))
              : X.isMatrix3
                ? ((P.__data[0] = X.elements[0]),
                  (P.__data[1] = X.elements[1]),
                  (P.__data[2] = X.elements[2]),
                  (P.__data[3] = 0),
                  (P.__data[4] = X.elements[3]),
                  (P.__data[5] = X.elements[4]),
                  (P.__data[6] = X.elements[5]),
                  (P.__data[7] = 0),
                  (P.__data[8] = X.elements[6]),
                  (P.__data[9] = X.elements[7]),
                  (P.__data[10] = X.elements[8]),
                  (P.__data[11] = 0))
                : (X.toArray(P.__data, W),
                  (W += j.storage / Float32Array.BYTES_PER_ELEMENT));
          }
          i.bufferSubData(i.UNIFORM_BUFFER, N, P.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function p(b, T, y, R) {
    const w = b.value,
      C = T + "_" + y;
    if (R[C] === void 0)
      return (
        typeof w == "number" || typeof w == "boolean"
          ? (R[C] = w)
          : (R[C] = w.clone()),
        !0
      );
    {
      const U = R[C];
      if (typeof w == "number" || typeof w == "boolean") {
        if (U !== w) return ((R[C] = w), !0);
      } else if (U.equals(w) === !1) return (U.copy(w), !0);
    }
    return !1;
  }
  function _(b) {
    const T = b.uniforms;
    let y = 0;
    const R = 16;
    for (let C = 0, U = T.length; C < U; C++) {
      const S = Array.isArray(T[C]) ? T[C] : [T[C]];
      for (let M = 0, P = S.length; M < P; M++) {
        const N = S[M],
          B = Array.isArray(N.value) ? N.value : [N.value];
        for (let W = 0, G = B.length; W < G; W++) {
          const X = B[W],
            j = x(X),
            H = y % R,
            rt = H % j.boundary,
            lt = H + rt;
          ((y += rt),
            lt !== 0 && R - lt < j.storage && (y += R - lt),
            (N.__data = new Float32Array(
              j.storage / Float32Array.BYTES_PER_ELEMENT,
            )),
            (N.__offset = y),
            (y += j.storage));
        }
      }
    }
    const w = y % R;
    return (w > 0 && (y += R - w), (b.__size = y), (b.__cache = {}), this);
  }
  function x(b) {
    const T = { boundary: 0, storage: 0 };
    return (
      typeof b == "number" || typeof b == "boolean"
        ? ((T.boundary = 4), (T.storage = 4))
        : b.isVector2
          ? ((T.boundary = 8), (T.storage = 8))
          : b.isVector3 || b.isColor
            ? ((T.boundary = 16), (T.storage = 12))
            : b.isVector4
              ? ((T.boundary = 16), (T.storage = 16))
              : b.isMatrix3
                ? ((T.boundary = 48), (T.storage = 48))
                : b.isMatrix4
                  ? ((T.boundary = 64), (T.storage = 64))
                  : b.isTexture
                    ? console.warn(
                        "THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.",
                      )
                    : console.warn(
                        "THREE.WebGLRenderer: Unsupported uniform value type.",
                        b,
                      ),
      T
    );
  }
  function m(b) {
    const T = b.target;
    T.removeEventListener("dispose", m);
    const y = a.indexOf(T.__bindingPointIndex);
    (a.splice(y, 1), i.deleteBuffer(s[T.id]), delete s[T.id], delete r[T.id]);
  }
  function d() {
    for (const b in s) i.deleteBuffer(s[b]);
    ((a = []), (s = {}), (r = {}));
  }
  return { bind: l, update: c, dispose: d };
}
class Gm {
  constructor(t = {}) {
    const {
      canvas: e = xd(),
      context: n = null,
      depth: s = !0,
      stencil: r = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: h = "default",
      failIfMajorPerformanceCaveat: u = !1,
      reversedDepthBuffer: f = !1,
    } = t;
    this.isWebGLRenderer = !0;
    let p;
    if (n !== null) {
      if (
        typeof WebGLRenderingContext < "u" &&
        n instanceof WebGLRenderingContext
      )
        throw new Error(
          "THREE.WebGLRenderer: WebGL 1 is not supported since r163.",
        );
      p = n.getContextAttributes().alpha;
    } else p = a;
    const _ = new Uint32Array(4),
      x = new Int32Array(4);
    let m = null,
      d = null;
    const b = [],
      T = [];
    ((this.domElement = e),
      (this.debug = { checkShaderErrors: !0, onShaderError: null }),
      (this.autoClear = !0),
      (this.autoClearColor = !0),
      (this.autoClearDepth = !0),
      (this.autoClearStencil = !0),
      (this.sortObjects = !0),
      (this.clippingPlanes = []),
      (this.localClippingEnabled = !1),
      (this.toneMapping = Ln),
      (this.toneMappingExposure = 1),
      (this.transmissionResolutionScale = 1));
    const y = this;
    let R = !1;
    this._outputColorSpace = He;
    let w = 0,
      C = 0,
      U = null,
      S = -1,
      M = null;
    const P = new ue(),
      N = new ue();
    let B = null;
    const W = new Ht(0);
    let G = 0,
      X = e.width,
      j = e.height,
      H = 1,
      rt = null,
      lt = null;
    const bt = new ue(0, 0, X, j),
      kt = new ue(0, 0, X, j);
    let ne = !1;
    const ae = new Wa();
    let Kt = !1,
      q = !1;
    const Z = new re(),
      ut = new F(),
      Lt = new ue(),
      Et = {
        background: null,
        fog: null,
        environment: null,
        overrideMaterial: null,
        isScene: !0,
      };
    let Wt = !1;
    function ye() {
      return U === null ? H : 1;
    }
    let A = n;
    function oe(v, L) {
      return e.getContext(v, L);
    }
    try {
      const v = {
        alpha: !0,
        depth: s,
        stencil: r,
        antialias: o,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: h,
        failIfMajorPerformanceCaveat: u,
      };
      if (
        ("setAttribute" in e &&
          e.setAttribute("data-engine", `three.js r${Ia}`),
        e.addEventListener("webglcontextlost", it, !1),
        e.addEventListener("webglcontextrestored", ht, !1),
        e.addEventListener("webglcontextcreationerror", J, !1),
        A === null)
      ) {
        const L = "webgl2";
        if (((A = oe(L, v)), A === null))
          throw oe(L)
            ? new Error(
                "Error creating WebGL context with your selected attributes.",
              )
            : new Error("Error creating WebGL context.");
      }
    } catch (v) {
      throw (console.error("THREE.WebGLRenderer: " + v.message), v);
    }
    let Ut,
      Ct,
      mt,
      ce,
      gt,
      Ot,
      Me,
      fe,
      E,
      g,
      O,
      $,
      K,
      V,
      yt,
      nt,
      _t,
      Mt,
      tt,
      ct,
      Rt,
      St,
      at,
      Nt;
    function D() {
      ((Ut = new Qf(A)),
        Ut.init(),
        (St = new Nm(A, Ut)),
        (Ct = new Xf(A, Ut, t, St)),
        (mt = new Im(A, Ut)),
        Ct.reversedDepthBuffer && f && mt.buffers.depth.setReversed(!0),
        (ce = new np(A)),
        (gt = new Mm()),
        (Ot = new Um(A, Ut, mt, gt, Ct, St, ce)),
        (Me = new Yf(y)),
        (fe = new Jf(y)),
        (E = new oh(A)),
        (at = new Wf(A, E)),
        (g = new tp(A, E, ce, at)),
        (O = new sp(A, g, E, ce)),
        (tt = new ip(A, Ct, Ot)),
        (nt = new qf(gt)),
        ($ = new xm(y, Me, fe, Ut, Ct, at, nt)),
        (K = new Hm(y, gt)),
        (V = new ym()),
        (yt = new Rm(Ut)),
        (Mt = new Gf(y, Me, fe, mt, O, p, l)),
        (_t = new Dm(y, O, Ct)),
        (Nt = new Vm(A, ce, Ct, mt)),
        (ct = new $f(A, Ut, ce)),
        (Rt = new ep(A, Ut, ce)),
        (ce.programs = $.programs),
        (y.capabilities = Ct),
        (y.extensions = Ut),
        (y.properties = gt),
        (y.renderLists = V),
        (y.shadowMap = _t),
        (y.state = mt),
        (y.info = ce));
    }
    D();
    const et = new km(y, A);
    ((this.xr = et),
      (this.getContext = function () {
        return A;
      }),
      (this.getContextAttributes = function () {
        return A.getContextAttributes();
      }),
      (this.forceContextLoss = function () {
        const v = Ut.get("WEBGL_lose_context");
        v && v.loseContext();
      }),
      (this.forceContextRestore = function () {
        const v = Ut.get("WEBGL_lose_context");
        v && v.restoreContext();
      }),
      (this.getPixelRatio = function () {
        return H;
      }),
      (this.setPixelRatio = function (v) {
        v !== void 0 && ((H = v), this.setSize(X, j, !1));
      }),
      (this.getSize = function (v) {
        return v.set(X, j);
      }),
      (this.setSize = function (v, L, k = !0) {
        if (et.isPresenting) {
          console.warn(
            "THREE.WebGLRenderer: Can't change size while VR device is presenting.",
          );
          return;
        }
        ((X = v),
          (j = L),
          (e.width = Math.floor(v * H)),
          (e.height = Math.floor(L * H)),
          k === !0 && ((e.style.width = v + "px"), (e.style.height = L + "px")),
          this.setViewport(0, 0, v, L));
      }),
      (this.getDrawingBufferSize = function (v) {
        return v.set(X * H, j * H).floor();
      }),
      (this.setDrawingBufferSize = function (v, L, k) {
        ((X = v),
          (j = L),
          (H = k),
          (e.width = Math.floor(v * k)),
          (e.height = Math.floor(L * k)),
          this.setViewport(0, 0, v, L));
      }),
      (this.getCurrentViewport = function (v) {
        return v.copy(P);
      }),
      (this.getViewport = function (v) {
        return v.copy(bt);
      }),
      (this.setViewport = function (v, L, k, z) {
        (v.isVector4 ? bt.set(v.x, v.y, v.z, v.w) : bt.set(v, L, k, z),
          mt.viewport(P.copy(bt).multiplyScalar(H).round()));
      }),
      (this.getScissor = function (v) {
        return v.copy(kt);
      }),
      (this.setScissor = function (v, L, k, z) {
        (v.isVector4 ? kt.set(v.x, v.y, v.z, v.w) : kt.set(v, L, k, z),
          mt.scissor(N.copy(kt).multiplyScalar(H).round()));
      }),
      (this.getScissorTest = function () {
        return ne;
      }),
      (this.setScissorTest = function (v) {
        mt.setScissorTest((ne = v));
      }),
      (this.setOpaqueSort = function (v) {
        rt = v;
      }),
      (this.setTransparentSort = function (v) {
        lt = v;
      }),
      (this.getClearColor = function (v) {
        return v.copy(Mt.getClearColor());
      }),
      (this.setClearColor = function () {
        Mt.setClearColor(...arguments);
      }),
      (this.getClearAlpha = function () {
        return Mt.getClearAlpha();
      }),
      (this.setClearAlpha = function () {
        Mt.setClearAlpha(...arguments);
      }),
      (this.clear = function (v = !0, L = !0, k = !0) {
        let z = 0;
        if (v) {
          let I = !1;
          if (U !== null) {
            const Q = U.texture.format;
            I = Q === za || Q === ka || Q === Ba;
          }
          if (I) {
            const Q = U.texture.type,
              ot =
                Q === un ||
                Q === ti ||
                Q === ji ||
                Q === Ki ||
                Q === Na ||
                Q === Fa,
              ft = Mt.getClearColor(),
              dt = Mt.getClearAlpha(),
              wt = ft.r,
              Pt = ft.g,
              Tt = ft.b;
            ot
              ? ((_[0] = wt),
                (_[1] = Pt),
                (_[2] = Tt),
                (_[3] = dt),
                A.clearBufferuiv(A.COLOR, 0, _))
              : ((x[0] = wt),
                (x[1] = Pt),
                (x[2] = Tt),
                (x[3] = dt),
                A.clearBufferiv(A.COLOR, 0, x));
          } else z |= A.COLOR_BUFFER_BIT;
        }
        (L && (z |= A.DEPTH_BUFFER_BIT),
          k &&
            ((z |= A.STENCIL_BUFFER_BIT),
            this.state.buffers.stencil.setMask(4294967295)),
          A.clear(z));
      }),
      (this.clearColor = function () {
        this.clear(!0, !1, !1);
      }),
      (this.clearDepth = function () {
        this.clear(!1, !0, !1);
      }),
      (this.clearStencil = function () {
        this.clear(!1, !1, !0);
      }),
      (this.dispose = function () {
        (e.removeEventListener("webglcontextlost", it, !1),
          e.removeEventListener("webglcontextrestored", ht, !1),
          e.removeEventListener("webglcontextcreationerror", J, !1),
          Mt.dispose(),
          V.dispose(),
          yt.dispose(),
          gt.dispose(),
          Me.dispose(),
          fe.dispose(),
          O.dispose(),
          at.dispose(),
          Nt.dispose(),
          $.dispose(),
          et.dispose(),
          et.removeEventListener("sessionstart", an),
          et.removeEventListener("sessionend", ja),
          Fn.stop());
      }));
    function it(v) {
      (v.preventDefault(),
        console.log("THREE.WebGLRenderer: Context Lost."),
        (R = !0));
    }
    function ht() {
      (console.log("THREE.WebGLRenderer: Context Restored."), (R = !1));
      const v = ce.autoReset,
        L = _t.enabled,
        k = _t.autoUpdate,
        z = _t.needsUpdate,
        I = _t.type;
      (D(),
        (ce.autoReset = v),
        (_t.enabled = L),
        (_t.autoUpdate = k),
        (_t.needsUpdate = z),
        (_t.type = I));
    }
    function J(v) {
      console.error(
        "THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",
        v.statusMessage,
      );
    }
    function Y(v) {
      const L = v.target;
      (L.removeEventListener("dispose", Y), pt(L));
    }
    function pt(v) {
      (It(v), gt.remove(v));
    }
    function It(v) {
      const L = gt.get(v).programs;
      L !== void 0 &&
        (L.forEach(function (k) {
          $.releaseProgram(k);
        }),
        v.isShaderMaterial && $.releaseShaderCache(v));
    }
    this.renderBufferDirect = function (v, L, k, z, I, Q) {
      L === null && (L = Et);
      const ot = I.isMesh && I.matrixWorld.determinant() < 0,
        ft = il(v, L, k, z, I);
      mt.setMaterial(z, ot);
      let dt = k.index,
        wt = 1;
      if (z.wireframe === !0) {
        if (((dt = g.getWireframeAttribute(k)), dt === void 0)) return;
        wt = 2;
      }
      const Pt = k.drawRange,
        Tt = k.attributes.position;
      let Vt = Pt.start * wt,
        Jt = (Pt.start + Pt.count) * wt;
      (Q !== null &&
        ((Vt = Math.max(Vt, Q.start * wt)),
        (Jt = Math.min(Jt, (Q.start + Q.count) * wt))),
        dt !== null
          ? ((Vt = Math.max(Vt, 0)), (Jt = Math.min(Jt, dt.count)))
          : Tt != null &&
            ((Vt = Math.max(Vt, 0)), (Jt = Math.min(Jt, Tt.count))));
      const he = Jt - Vt;
      if (he < 0 || he === 1 / 0) return;
      at.setup(I, z, ft, k, dt);
      let se,
        ee = ct;
      if (
        (dt !== null && ((se = E.get(dt)), (ee = Rt), ee.setIndex(se)),
        I.isMesh)
      )
        z.wireframe === !0
          ? (mt.setLineWidth(z.wireframeLinewidth * ye()), ee.setMode(A.LINES))
          : ee.setMode(A.TRIANGLES);
      else if (I.isLine) {
        let At = z.linewidth;
        (At === void 0 && (At = 1),
          mt.setLineWidth(At * ye()),
          I.isLineSegments
            ? ee.setMode(A.LINES)
            : I.isLineLoop
              ? ee.setMode(A.LINE_LOOP)
              : ee.setMode(A.LINE_STRIP));
      } else
        I.isPoints
          ? ee.setMode(A.POINTS)
          : I.isSprite && ee.setMode(A.TRIANGLES);
      if (I.isBatchedMesh)
        if (I._multiDrawInstances !== null)
          (Qi(
            "THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.",
          ),
            ee.renderMultiDrawInstances(
              I._multiDrawStarts,
              I._multiDrawCounts,
              I._multiDrawCount,
              I._multiDrawInstances,
            ));
        else if (Ut.get("WEBGL_multi_draw"))
          ee.renderMultiDraw(
            I._multiDrawStarts,
            I._multiDrawCounts,
            I._multiDrawCount,
          );
        else {
          const At = I._multiDrawStarts,
            le = I._multiDrawCounts,
            qt = I._multiDrawCount,
            Fe = dt ? E.get(dt).bytesPerElement : 1,
            si = gt.get(z).currentProgram.getUniforms();
          for (let Oe = 0; Oe < qt; Oe++)
            (si.setValue(A, "_gl_DrawID", Oe), ee.render(At[Oe] / Fe, le[Oe]));
        }
      else if (I.isInstancedMesh) ee.renderInstances(Vt, he, I.count);
      else if (k.isInstancedBufferGeometry) {
        const At = k._maxInstanceCount !== void 0 ? k._maxInstanceCount : 1 / 0,
          le = Math.min(k.instanceCount, At);
        ee.renderInstances(Vt, he, le);
      } else ee.render(Vt, he);
    };
    function ie(v, L, k) {
      v.transparent === !0 && v.side === Sn && v.forceSinglePass === !1
        ? ((v.side = Ne),
          (v.needsUpdate = !0),
          os(v, L, k),
          (v.side = Un),
          (v.needsUpdate = !0),
          os(v, L, k),
          (v.side = Sn))
        : os(v, L, k);
    }
    ((this.compile = function (v, L, k = null) {
      (k === null && (k = v),
        (d = yt.get(k)),
        d.init(L),
        T.push(d),
        k.traverseVisible(function (I) {
          I.isLight &&
            I.layers.test(L.layers) &&
            (d.pushLight(I), I.castShadow && d.pushShadow(I));
        }),
        v !== k &&
          v.traverseVisible(function (I) {
            I.isLight &&
              I.layers.test(L.layers) &&
              (d.pushLight(I), I.castShadow && d.pushShadow(I));
          }),
        d.setupLights());
      const z = new Set();
      return (
        v.traverse(function (I) {
          if (!(I.isMesh || I.isPoints || I.isLine || I.isSprite)) return;
          const Q = I.material;
          if (Q)
            if (Array.isArray(Q))
              for (let ot = 0; ot < Q.length; ot++) {
                const ft = Q[ot];
                (ie(ft, k, I), z.add(ft));
              }
            else (ie(Q, k, I), z.add(Q));
        }),
        (d = T.pop()),
        z
      );
    }),
      (this.compileAsync = function (v, L, k = null) {
        const z = this.compile(v, L, k);
        return new Promise((I) => {
          function Q() {
            if (
              (z.forEach(function (ot) {
                gt.get(ot).currentProgram.isReady() && z.delete(ot);
              }),
              z.size === 0)
            ) {
              I(v);
              return;
            }
            setTimeout(Q, 10);
          }
          Ut.get("KHR_parallel_shader_compile") !== null
            ? Q()
            : setTimeout(Q, 10);
        });
      }));
    let Zt = null;
    function pn(v) {
      Zt && Zt(v);
    }
    function an() {
      Fn.stop();
    }
    function ja() {
      Fn.start();
    }
    const Fn = new Zc();
    (Fn.setAnimationLoop(pn),
      typeof self < "u" && Fn.setContext(self),
      (this.setAnimationLoop = function (v) {
        ((Zt = v), et.setAnimationLoop(v), v === null ? Fn.stop() : Fn.start());
      }),
      et.addEventListener("sessionstart", an),
      et.addEventListener("sessionend", ja),
      (this.render = function (v, L) {
        if (L !== void 0 && L.isCamera !== !0) {
          console.error(
            "THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.",
          );
          return;
        }
        if (R === !0) return;
        if (
          (v.matrixWorldAutoUpdate === !0 && v.updateMatrixWorld(),
          L.parent === null &&
            L.matrixWorldAutoUpdate === !0 &&
            L.updateMatrixWorld(),
          et.enabled === !0 &&
            et.isPresenting === !0 &&
            (et.cameraAutoUpdate === !0 && et.updateCamera(L),
            (L = et.getCamera())),
          v.isScene === !0 && v.onBeforeRender(y, v, L, U),
          (d = yt.get(v, T.length)),
          d.init(L),
          T.push(d),
          Z.multiplyMatrices(L.projectionMatrix, L.matrixWorldInverse),
          ae.setFromProjectionMatrix(Z, dn, L.reversedDepth),
          (q = this.localClippingEnabled),
          (Kt = nt.init(this.clippingPlanes, q)),
          (m = V.get(v, b.length)),
          m.init(),
          b.push(m),
          et.enabled === !0 && et.isPresenting === !0)
        ) {
          const Q = y.xr.getDepthSensingMesh();
          Q !== null && nr(Q, L, -1 / 0, y.sortObjects);
        }
        (nr(v, L, 0, y.sortObjects),
          m.finish(),
          y.sortObjects === !0 && m.sort(rt, lt),
          (Wt =
            et.enabled === !1 ||
            et.isPresenting === !1 ||
            et.hasDepthSensing() === !1),
          Wt && Mt.addToRenderList(m, v),
          this.info.render.frame++,
          Kt === !0 && nt.beginShadows());
        const k = d.state.shadowsArray;
        (_t.render(k, v, L),
          Kt === !0 && nt.endShadows(),
          this.info.autoReset === !0 && this.info.reset());
        const z = m.opaque,
          I = m.transmissive;
        if ((d.setupLights(), L.isArrayCamera)) {
          const Q = L.cameras;
          if (I.length > 0)
            for (let ot = 0, ft = Q.length; ot < ft; ot++) {
              const dt = Q[ot];
              Za(z, I, v, dt);
            }
          Wt && Mt.render(v);
          for (let ot = 0, ft = Q.length; ot < ft; ot++) {
            const dt = Q[ot];
            Ka(m, v, dt, dt.viewport);
          }
        } else
          (I.length > 0 && Za(z, I, v, L), Wt && Mt.render(v), Ka(m, v, L));
        (U !== null &&
          C === 0 &&
          (Ot.updateMultisampleRenderTarget(U), Ot.updateRenderTargetMipmap(U)),
          v.isScene === !0 && v.onAfterRender(y, v, L),
          at.resetDefaultState(),
          (S = -1),
          (M = null),
          T.pop(),
          T.length > 0
            ? ((d = T[T.length - 1]),
              Kt === !0 && nt.setGlobalState(y.clippingPlanes, d.state.camera))
            : (d = null),
          b.pop(),
          b.length > 0 ? (m = b[b.length - 1]) : (m = null));
      }));
    function nr(v, L, k, z) {
      if (v.visible === !1) return;
      if (v.layers.test(L.layers)) {
        if (v.isGroup) k = v.renderOrder;
        else if (v.isLOD) v.autoUpdate === !0 && v.update(L);
        else if (v.isLight) (d.pushLight(v), v.castShadow && d.pushShadow(v));
        else if (v.isSprite) {
          if (!v.frustumCulled || ae.intersectsSprite(v)) {
            z && Lt.setFromMatrixPosition(v.matrixWorld).applyMatrix4(Z);
            const ot = O.update(v),
              ft = v.material;
            ft.visible && m.push(v, ot, ft, k, Lt.z, null);
          }
        } else if (
          (v.isMesh || v.isLine || v.isPoints) &&
          (!v.frustumCulled || ae.intersectsObject(v))
        ) {
          const ot = O.update(v),
            ft = v.material;
          if (
            (z &&
              (v.boundingSphere !== void 0
                ? (v.boundingSphere === null && v.computeBoundingSphere(),
                  Lt.copy(v.boundingSphere.center))
                : (ot.boundingSphere === null && ot.computeBoundingSphere(),
                  Lt.copy(ot.boundingSphere.center)),
              Lt.applyMatrix4(v.matrixWorld).applyMatrix4(Z)),
            Array.isArray(ft))
          ) {
            const dt = ot.groups;
            for (let wt = 0, Pt = dt.length; wt < Pt; wt++) {
              const Tt = dt[wt],
                Vt = ft[Tt.materialIndex];
              Vt && Vt.visible && m.push(v, ot, Vt, k, Lt.z, Tt);
            }
          } else ft.visible && m.push(v, ot, ft, k, Lt.z, null);
        }
      }
      const Q = v.children;
      for (let ot = 0, ft = Q.length; ot < ft; ot++) nr(Q[ot], L, k, z);
    }
    function Ka(v, L, k, z) {
      const I = v.opaque,
        Q = v.transmissive,
        ot = v.transparent;
      (d.setupLightsView(k),
        Kt === !0 && nt.setGlobalState(y.clippingPlanes, k),
        z && mt.viewport(P.copy(z)),
        I.length > 0 && as(I, L, k),
        Q.length > 0 && as(Q, L, k),
        ot.length > 0 && as(ot, L, k),
        mt.buffers.depth.setTest(!0),
        mt.buffers.depth.setMask(!0),
        mt.buffers.color.setMask(!0),
        mt.setPolygonOffset(!1));
    }
    function Za(v, L, k, z) {
      if ((k.isScene === !0 ? k.overrideMaterial : null) !== null) return;
      d.state.transmissionRenderTarget[z.id] === void 0 &&
        (d.state.transmissionRenderTarget[z.id] = new ei(1, 1, {
          generateMipmaps: !0,
          type:
            Ut.has("EXT_color_buffer_half_float") ||
            Ut.has("EXT_color_buffer_float")
              ? ns
              : un,
          minFilter: jn,
          samples: 4,
          stencilBuffer: r,
          resolveDepthBuffer: !1,
          resolveStencilBuffer: !1,
          colorSpace: Yt.workingColorSpace,
        }));
      const Q = d.state.transmissionRenderTarget[z.id],
        ot = z.viewport || P;
      Q.setSize(
        ot.z * y.transmissionResolutionScale,
        ot.w * y.transmissionResolutionScale,
      );
      const ft = y.getRenderTarget(),
        dt = y.getActiveCubeFace(),
        wt = y.getActiveMipmapLevel();
      (y.setRenderTarget(Q),
        y.getClearColor(W),
        (G = y.getClearAlpha()),
        G < 1 && y.setClearColor(16777215, 0.5),
        y.clear(),
        Wt && Mt.render(k));
      const Pt = y.toneMapping;
      y.toneMapping = Ln;
      const Tt = z.viewport;
      if (
        (z.viewport !== void 0 && (z.viewport = void 0),
        d.setupLightsView(z),
        Kt === !0 && nt.setGlobalState(y.clippingPlanes, z),
        as(v, k, z),
        Ot.updateMultisampleRenderTarget(Q),
        Ot.updateRenderTargetMipmap(Q),
        Ut.has("WEBGL_multisampled_render_to_texture") === !1)
      ) {
        let Vt = !1;
        for (let Jt = 0, he = L.length; Jt < he; Jt++) {
          const se = L[Jt],
            ee = se.object,
            At = se.geometry,
            le = se.material,
            qt = se.group;
          if (le.side === Sn && ee.layers.test(z.layers)) {
            const Fe = le.side;
            ((le.side = Ne),
              (le.needsUpdate = !0),
              Ja(ee, k, z, At, le, qt),
              (le.side = Fe),
              (le.needsUpdate = !0),
              (Vt = !0));
          }
        }
        Vt === !0 &&
          (Ot.updateMultisampleRenderTarget(Q), Ot.updateRenderTargetMipmap(Q));
      }
      (y.setRenderTarget(ft, dt, wt),
        y.setClearColor(W, G),
        Tt !== void 0 && (z.viewport = Tt),
        (y.toneMapping = Pt));
    }
    function as(v, L, k) {
      const z = L.isScene === !0 ? L.overrideMaterial : null;
      for (let I = 0, Q = v.length; I < Q; I++) {
        const ot = v[I],
          ft = ot.object,
          dt = ot.geometry,
          wt = ot.group;
        let Pt = ot.material;
        (Pt.allowOverride === !0 && z !== null && (Pt = z),
          ft.layers.test(k.layers) && Ja(ft, L, k, dt, Pt, wt));
      }
    }
    function Ja(v, L, k, z, I, Q) {
      (v.onBeforeRender(y, L, k, z, I, Q),
        v.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse, v.matrixWorld),
        v.normalMatrix.getNormalMatrix(v.modelViewMatrix),
        I.onBeforeRender(y, L, k, z, v, Q),
        I.transparent === !0 && I.side === Sn && I.forceSinglePass === !1
          ? ((I.side = Ne),
            (I.needsUpdate = !0),
            y.renderBufferDirect(k, L, z, I, v, Q),
            (I.side = Un),
            (I.needsUpdate = !0),
            y.renderBufferDirect(k, L, z, I, v, Q),
            (I.side = Sn))
          : y.renderBufferDirect(k, L, z, I, v, Q),
        v.onAfterRender(y, L, k, z, I, Q));
    }
    function os(v, L, k) {
      L.isScene !== !0 && (L = Et);
      const z = gt.get(v),
        I = d.state.lights,
        Q = d.state.shadowsArray,
        ot = I.state.version,
        ft = $.getParameters(v, I.state, Q, L, k),
        dt = $.getProgramCacheKey(ft);
      let wt = z.programs;
      ((z.environment = v.isMeshStandardMaterial ? L.environment : null),
        (z.fog = L.fog),
        (z.envMap = (v.isMeshStandardMaterial ? fe : Me).get(
          v.envMap || z.environment,
        )),
        (z.envMapRotation =
          z.environment !== null && v.envMap === null
            ? L.environmentRotation
            : v.envMapRotation),
        wt === void 0 &&
          (v.addEventListener("dispose", Y),
          (wt = new Map()),
          (z.programs = wt)));
      let Pt = wt.get(dt);
      if (Pt !== void 0) {
        if (z.currentProgram === Pt && z.lightsStateVersion === ot)
          return (to(v, ft), Pt);
      } else
        ((ft.uniforms = $.getUniforms(v)),
          v.onBeforeCompile(ft, y),
          (Pt = $.acquireProgram(ft, dt)),
          wt.set(dt, Pt),
          (z.uniforms = ft.uniforms));
      const Tt = z.uniforms;
      return (
        ((!v.isShaderMaterial && !v.isRawShaderMaterial) ||
          v.clipping === !0) &&
          (Tt.clippingPlanes = nt.uniform),
        to(v, ft),
        (z.needsLights = rl(v)),
        (z.lightsStateVersion = ot),
        z.needsLights &&
          ((Tt.ambientLightColor.value = I.state.ambient),
          (Tt.lightProbe.value = I.state.probe),
          (Tt.directionalLights.value = I.state.directional),
          (Tt.directionalLightShadows.value = I.state.directionalShadow),
          (Tt.spotLights.value = I.state.spot),
          (Tt.spotLightShadows.value = I.state.spotShadow),
          (Tt.rectAreaLights.value = I.state.rectArea),
          (Tt.ltc_1.value = I.state.rectAreaLTC1),
          (Tt.ltc_2.value = I.state.rectAreaLTC2),
          (Tt.pointLights.value = I.state.point),
          (Tt.pointLightShadows.value = I.state.pointShadow),
          (Tt.hemisphereLights.value = I.state.hemi),
          (Tt.directionalShadowMap.value = I.state.directionalShadowMap),
          (Tt.directionalShadowMatrix.value = I.state.directionalShadowMatrix),
          (Tt.spotShadowMap.value = I.state.spotShadowMap),
          (Tt.spotLightMatrix.value = I.state.spotLightMatrix),
          (Tt.spotLightMap.value = I.state.spotLightMap),
          (Tt.pointShadowMap.value = I.state.pointShadowMap),
          (Tt.pointShadowMatrix.value = I.state.pointShadowMatrix)),
        (z.currentProgram = Pt),
        (z.uniformsList = null),
        Pt
      );
    }
    function Qa(v) {
      if (v.uniformsList === null) {
        const L = v.currentProgram.getUniforms();
        v.uniformsList = Bs.seqWithValue(L.seq, v.uniforms);
      }
      return v.uniformsList;
    }
    function to(v, L) {
      const k = gt.get(v);
      ((k.outputColorSpace = L.outputColorSpace),
        (k.batching = L.batching),
        (k.batchingColor = L.batchingColor),
        (k.instancing = L.instancing),
        (k.instancingColor = L.instancingColor),
        (k.instancingMorph = L.instancingMorph),
        (k.skinning = L.skinning),
        (k.morphTargets = L.morphTargets),
        (k.morphNormals = L.morphNormals),
        (k.morphColors = L.morphColors),
        (k.morphTargetsCount = L.morphTargetsCount),
        (k.numClippingPlanes = L.numClippingPlanes),
        (k.numIntersection = L.numClipIntersection),
        (k.vertexAlphas = L.vertexAlphas),
        (k.vertexTangents = L.vertexTangents),
        (k.toneMapping = L.toneMapping));
    }
    function il(v, L, k, z, I) {
      (L.isScene !== !0 && (L = Et), Ot.resetTextureUnits());
      const Q = L.fog,
        ot = z.isMeshStandardMaterial ? L.environment : null,
        ft =
          U === null
            ? y.outputColorSpace
            : U.isXRRenderTarget === !0
              ? U.texture.colorSpace
              : Ai,
        dt = (z.isMeshStandardMaterial ? fe : Me).get(z.envMap || ot),
        wt =
          z.vertexColors === !0 &&
          !!k.attributes.color &&
          k.attributes.color.itemSize === 4,
        Pt = !!k.attributes.tangent && (!!z.normalMap || z.anisotropy > 0),
        Tt = !!k.morphAttributes.position,
        Vt = !!k.morphAttributes.normal,
        Jt = !!k.morphAttributes.color;
      let he = Ln;
      z.toneMapped &&
        (U === null || U.isXRRenderTarget === !0) &&
        (he = y.toneMapping);
      const se =
          k.morphAttributes.position ||
          k.morphAttributes.normal ||
          k.morphAttributes.color,
        ee = se !== void 0 ? se.length : 0,
        At = gt.get(z),
        le = d.state.lights;
      if (Kt === !0 && (q === !0 || v !== M)) {
        const we = v === M && z.id === S;
        nt.setState(z, v, we);
      }
      let qt = !1;
      z.version === At.__version
        ? ((At.needsLights && At.lightsStateVersion !== le.state.version) ||
            At.outputColorSpace !== ft ||
            (I.isBatchedMesh && At.batching === !1) ||
            (!I.isBatchedMesh && At.batching === !0) ||
            (I.isBatchedMesh &&
              At.batchingColor === !0 &&
              I.colorTexture === null) ||
            (I.isBatchedMesh &&
              At.batchingColor === !1 &&
              I.colorTexture !== null) ||
            (I.isInstancedMesh && At.instancing === !1) ||
            (!I.isInstancedMesh && At.instancing === !0) ||
            (I.isSkinnedMesh && At.skinning === !1) ||
            (!I.isSkinnedMesh && At.skinning === !0) ||
            (I.isInstancedMesh &&
              At.instancingColor === !0 &&
              I.instanceColor === null) ||
            (I.isInstancedMesh &&
              At.instancingColor === !1 &&
              I.instanceColor !== null) ||
            (I.isInstancedMesh &&
              At.instancingMorph === !0 &&
              I.morphTexture === null) ||
            (I.isInstancedMesh &&
              At.instancingMorph === !1 &&
              I.morphTexture !== null) ||
            At.envMap !== dt ||
            (z.fog === !0 && At.fog !== Q) ||
            (At.numClippingPlanes !== void 0 &&
              (At.numClippingPlanes !== nt.numPlanes ||
                At.numIntersection !== nt.numIntersection)) ||
            At.vertexAlphas !== wt ||
            At.vertexTangents !== Pt ||
            At.morphTargets !== Tt ||
            At.morphNormals !== Vt ||
            At.morphColors !== Jt ||
            At.toneMapping !== he ||
            At.morphTargetsCount !== ee) &&
          (qt = !0)
        : ((qt = !0), (At.__version = z.version));
      let Fe = At.currentProgram;
      qt === !0 && (Fe = os(z, L, I));
      let si = !1,
        Oe = !1,
        Fi = !1;
      const de = Fe.getUniforms(),
        $e = At.uniforms;
      if (
        (mt.useProgram(Fe.program) && ((si = !0), (Oe = !0), (Fi = !0)),
        z.id !== S && ((S = z.id), (Oe = !0)),
        si || M !== v)
      ) {
        (mt.buffers.depth.getReversed() &&
          v.reversedDepth !== !0 &&
          ((v._reversedDepth = !0), v.updateProjectionMatrix()),
          de.setValue(A, "projectionMatrix", v.projectionMatrix),
          de.setValue(A, "viewMatrix", v.matrixWorldInverse));
        const Le = de.map.cameraPosition;
        (Le !== void 0 &&
          Le.setValue(A, ut.setFromMatrixPosition(v.matrixWorld)),
          Ct.logarithmicDepthBuffer &&
            de.setValue(
              A,
              "logDepthBufFC",
              2 / (Math.log(v.far + 1) / Math.LN2),
            ),
          (z.isMeshPhongMaterial ||
            z.isMeshToonMaterial ||
            z.isMeshLambertMaterial ||
            z.isMeshBasicMaterial ||
            z.isMeshStandardMaterial ||
            z.isShaderMaterial) &&
            de.setValue(A, "isOrthographic", v.isOrthographicCamera === !0),
          M !== v && ((M = v), (Oe = !0), (Fi = !0)));
      }
      if (I.isSkinnedMesh) {
        (de.setOptional(A, I, "bindMatrix"),
          de.setOptional(A, I, "bindMatrixInverse"));
        const we = I.skeleton;
        we &&
          (we.boneTexture === null && we.computeBoneTexture(),
          de.setValue(A, "boneTexture", we.boneTexture, Ot));
      }
      I.isBatchedMesh &&
        (de.setOptional(A, I, "batchingTexture"),
        de.setValue(A, "batchingTexture", I._matricesTexture, Ot),
        de.setOptional(A, I, "batchingIdTexture"),
        de.setValue(A, "batchingIdTexture", I._indirectTexture, Ot),
        de.setOptional(A, I, "batchingColorTexture"),
        I._colorsTexture !== null &&
          de.setValue(A, "batchingColorTexture", I._colorsTexture, Ot));
      const Xe = k.morphAttributes;
      if (
        ((Xe.position !== void 0 ||
          Xe.normal !== void 0 ||
          Xe.color !== void 0) &&
          tt.update(I, k, Fe),
        (Oe || At.receiveShadow !== I.receiveShadow) &&
          ((At.receiveShadow = I.receiveShadow),
          de.setValue(A, "receiveShadow", I.receiveShadow)),
        z.isMeshGouraudMaterial &&
          z.envMap !== null &&
          (($e.envMap.value = dt),
          ($e.flipEnvMap.value =
            dt.isCubeTexture && dt.isRenderTargetTexture === !1 ? -1 : 1)),
        z.isMeshStandardMaterial &&
          z.envMap === null &&
          L.environment !== null &&
          ($e.envMapIntensity.value = L.environmentIntensity),
        Oe &&
          (de.setValue(A, "toneMappingExposure", y.toneMappingExposure),
          At.needsLights && sl($e, Fi),
          Q && z.fog === !0 && K.refreshFogUniforms($e, Q),
          K.refreshMaterialUniforms(
            $e,
            z,
            H,
            j,
            d.state.transmissionRenderTarget[v.id],
          ),
          Bs.upload(A, Qa(At), $e, Ot)),
        z.isShaderMaterial &&
          z.uniformsNeedUpdate === !0 &&
          (Bs.upload(A, Qa(At), $e, Ot), (z.uniformsNeedUpdate = !1)),
        z.isSpriteMaterial && de.setValue(A, "center", I.center),
        de.setValue(A, "modelViewMatrix", I.modelViewMatrix),
        de.setValue(A, "normalMatrix", I.normalMatrix),
        de.setValue(A, "modelMatrix", I.matrixWorld),
        z.isShaderMaterial || z.isRawShaderMaterial)
      ) {
        const we = z.uniformsGroups;
        for (let Le = 0, ir = we.length; Le < ir; Le++) {
          const On = we[Le];
          (Nt.update(On, Fe), Nt.bind(On, Fe));
        }
      }
      return Fe;
    }
    function sl(v, L) {
      ((v.ambientLightColor.needsUpdate = L),
        (v.lightProbe.needsUpdate = L),
        (v.directionalLights.needsUpdate = L),
        (v.directionalLightShadows.needsUpdate = L),
        (v.pointLights.needsUpdate = L),
        (v.pointLightShadows.needsUpdate = L),
        (v.spotLights.needsUpdate = L),
        (v.spotLightShadows.needsUpdate = L),
        (v.rectAreaLights.needsUpdate = L),
        (v.hemisphereLights.needsUpdate = L));
    }
    function rl(v) {
      return (
        v.isMeshLambertMaterial ||
        v.isMeshToonMaterial ||
        v.isMeshPhongMaterial ||
        v.isMeshStandardMaterial ||
        v.isShadowMaterial ||
        (v.isShaderMaterial && v.lights === !0)
      );
    }
    ((this.getActiveCubeFace = function () {
      return w;
    }),
      (this.getActiveMipmapLevel = function () {
        return C;
      }),
      (this.getRenderTarget = function () {
        return U;
      }),
      (this.setRenderTargetTextures = function (v, L, k) {
        const z = gt.get(v);
        ((z.__autoAllocateDepthBuffer = v.resolveDepthBuffer === !1),
          z.__autoAllocateDepthBuffer === !1 && (z.__useRenderToTexture = !1),
          (gt.get(v.texture).__webglTexture = L),
          (gt.get(v.depthTexture).__webglTexture = z.__autoAllocateDepthBuffer
            ? void 0
            : k),
          (z.__hasExternalTextures = !0));
      }),
      (this.setRenderTargetFramebuffer = function (v, L) {
        const k = gt.get(v);
        ((k.__webglFramebuffer = L),
          (k.__useDefaultFramebuffer = L === void 0));
      }));
    const al = A.createFramebuffer();
    ((this.setRenderTarget = function (v, L = 0, k = 0) {
      ((U = v), (w = L), (C = k));
      let z = !0,
        I = null,
        Q = !1,
        ot = !1;
      if (v) {
        const dt = gt.get(v);
        if (dt.__useDefaultFramebuffer !== void 0)
          (mt.bindFramebuffer(A.FRAMEBUFFER, null), (z = !1));
        else if (dt.__webglFramebuffer === void 0) Ot.setupRenderTarget(v);
        else if (dt.__hasExternalTextures)
          Ot.rebindTextures(
            v,
            gt.get(v.texture).__webglTexture,
            gt.get(v.depthTexture).__webglTexture,
          );
        else if (v.depthBuffer) {
          const Tt = v.depthTexture;
          if (dt.__boundDepthTexture !== Tt) {
            if (
              Tt !== null &&
              gt.has(Tt) &&
              (v.width !== Tt.image.width || v.height !== Tt.image.height)
            )
              throw new Error(
                "WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.",
              );
            Ot.setupDepthRenderbuffer(v);
          }
        }
        const wt = v.texture;
        (wt.isData3DTexture ||
          wt.isDataArrayTexture ||
          wt.isCompressedArrayTexture) &&
          (ot = !0);
        const Pt = gt.get(v).__webglFramebuffer;
        (v.isWebGLCubeRenderTarget
          ? (Array.isArray(Pt[L]) ? (I = Pt[L][k]) : (I = Pt[L]), (Q = !0))
          : v.samples > 0 && Ot.useMultisampledRTT(v) === !1
            ? (I = gt.get(v).__webglMultisampledFramebuffer)
            : Array.isArray(Pt)
              ? (I = Pt[k])
              : (I = Pt),
          P.copy(v.viewport),
          N.copy(v.scissor),
          (B = v.scissorTest));
      } else
        (P.copy(bt).multiplyScalar(H).floor(),
          N.copy(kt).multiplyScalar(H).floor(),
          (B = ne));
      if (
        (k !== 0 && (I = al),
        mt.bindFramebuffer(A.FRAMEBUFFER, I) && z && mt.drawBuffers(v, I),
        mt.viewport(P),
        mt.scissor(N),
        mt.setScissorTest(B),
        Q)
      ) {
        const dt = gt.get(v.texture);
        A.framebufferTexture2D(
          A.FRAMEBUFFER,
          A.COLOR_ATTACHMENT0,
          A.TEXTURE_CUBE_MAP_POSITIVE_X + L,
          dt.__webglTexture,
          k,
        );
      } else if (ot) {
        const dt = L;
        for (let wt = 0; wt < v.textures.length; wt++) {
          const Pt = gt.get(v.textures[wt]);
          A.framebufferTextureLayer(
            A.FRAMEBUFFER,
            A.COLOR_ATTACHMENT0 + wt,
            Pt.__webglTexture,
            k,
            dt,
          );
        }
      } else if (v !== null && k !== 0) {
        const dt = gt.get(v.texture);
        A.framebufferTexture2D(
          A.FRAMEBUFFER,
          A.COLOR_ATTACHMENT0,
          A.TEXTURE_2D,
          dt.__webglTexture,
          k,
        );
      }
      S = -1;
    }),
      (this.readRenderTargetPixels = function (v, L, k, z, I, Q, ot, ft = 0) {
        if (!(v && v.isWebGLRenderTarget)) {
          console.error(
            "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.",
          );
          return;
        }
        let dt = gt.get(v).__webglFramebuffer;
        if ((v.isWebGLCubeRenderTarget && ot !== void 0 && (dt = dt[ot]), dt)) {
          mt.bindFramebuffer(A.FRAMEBUFFER, dt);
          try {
            const wt = v.textures[ft],
              Pt = wt.format,
              Tt = wt.type;
            if (!Ct.textureFormatReadable(Pt)) {
              console.error(
                "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.",
              );
              return;
            }
            if (!Ct.textureTypeReadable(Tt)) {
              console.error(
                "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.",
              );
              return;
            }
            L >= 0 &&
              L <= v.width - z &&
              k >= 0 &&
              k <= v.height - I &&
              (v.textures.length > 1 && A.readBuffer(A.COLOR_ATTACHMENT0 + ft),
              A.readPixels(L, k, z, I, St.convert(Pt), St.convert(Tt), Q));
          } finally {
            const wt = U !== null ? gt.get(U).__webglFramebuffer : null;
            mt.bindFramebuffer(A.FRAMEBUFFER, wt);
          }
        }
      }),
      (this.readRenderTargetPixelsAsync = async function (
        v,
        L,
        k,
        z,
        I,
        Q,
        ot,
        ft = 0,
      ) {
        if (!(v && v.isWebGLRenderTarget))
          throw new Error(
            "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.",
          );
        let dt = gt.get(v).__webglFramebuffer;
        if ((v.isWebGLCubeRenderTarget && ot !== void 0 && (dt = dt[ot]), dt))
          if (L >= 0 && L <= v.width - z && k >= 0 && k <= v.height - I) {
            mt.bindFramebuffer(A.FRAMEBUFFER, dt);
            const wt = v.textures[ft],
              Pt = wt.format,
              Tt = wt.type;
            if (!Ct.textureFormatReadable(Pt))
              throw new Error(
                "THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.",
              );
            if (!Ct.textureTypeReadable(Tt))
              throw new Error(
                "THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.",
              );
            const Vt = A.createBuffer();
            (A.bindBuffer(A.PIXEL_PACK_BUFFER, Vt),
              A.bufferData(A.PIXEL_PACK_BUFFER, Q.byteLength, A.STREAM_READ),
              v.textures.length > 1 && A.readBuffer(A.COLOR_ATTACHMENT0 + ft),
              A.readPixels(L, k, z, I, St.convert(Pt), St.convert(Tt), 0));
            const Jt = U !== null ? gt.get(U).__webglFramebuffer : null;
            mt.bindFramebuffer(A.FRAMEBUFFER, Jt);
            const he = A.fenceSync(A.SYNC_GPU_COMMANDS_COMPLETE, 0);
            return (
              A.flush(),
              await Md(A, he, 4),
              A.bindBuffer(A.PIXEL_PACK_BUFFER, Vt),
              A.getBufferSubData(A.PIXEL_PACK_BUFFER, 0, Q),
              A.deleteBuffer(Vt),
              A.deleteSync(he),
              Q
            );
          } else
            throw new Error(
              "THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.",
            );
      }),
      (this.copyFramebufferToTexture = function (v, L = null, k = 0) {
        const z = Math.pow(2, -k),
          I = Math.floor(v.image.width * z),
          Q = Math.floor(v.image.height * z),
          ot = L !== null ? L.x : 0,
          ft = L !== null ? L.y : 0;
        (Ot.setTexture2D(v, 0),
          A.copyTexSubImage2D(A.TEXTURE_2D, k, 0, 0, ot, ft, I, Q),
          mt.unbindTexture());
      }));
    const ol = A.createFramebuffer(),
      cl = A.createFramebuffer();
    ((this.copyTextureToTexture = function (
      v,
      L,
      k = null,
      z = null,
      I = 0,
      Q = null,
    ) {
      Q === null &&
        (I !== 0
          ? (Qi(
              "WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.",
            ),
            (Q = I),
            (I = 0))
          : (Q = 0));
      let ot, ft, dt, wt, Pt, Tt, Vt, Jt, he;
      const se = v.isCompressedTexture ? v.mipmaps[Q] : v.image;
      if (k !== null)
        ((ot = k.max.x - k.min.x),
          (ft = k.max.y - k.min.y),
          (dt = k.isBox3 ? k.max.z - k.min.z : 1),
          (wt = k.min.x),
          (Pt = k.min.y),
          (Tt = k.isBox3 ? k.min.z : 0));
      else {
        const Xe = Math.pow(2, -I);
        ((ot = Math.floor(se.width * Xe)),
          (ft = Math.floor(se.height * Xe)),
          v.isDataArrayTexture
            ? (dt = se.depth)
            : v.isData3DTexture
              ? (dt = Math.floor(se.depth * Xe))
              : (dt = 1),
          (wt = 0),
          (Pt = 0),
          (Tt = 0));
      }
      z !== null
        ? ((Vt = z.x), (Jt = z.y), (he = z.z))
        : ((Vt = 0), (Jt = 0), (he = 0));
      const ee = St.convert(L.format),
        At = St.convert(L.type);
      let le;
      (L.isData3DTexture
        ? (Ot.setTexture3D(L, 0), (le = A.TEXTURE_3D))
        : L.isDataArrayTexture || L.isCompressedArrayTexture
          ? (Ot.setTexture2DArray(L, 0), (le = A.TEXTURE_2D_ARRAY))
          : (Ot.setTexture2D(L, 0), (le = A.TEXTURE_2D)),
        A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL, L.flipY),
        A.pixelStorei(A.UNPACK_PREMULTIPLY_ALPHA_WEBGL, L.premultiplyAlpha),
        A.pixelStorei(A.UNPACK_ALIGNMENT, L.unpackAlignment));
      const qt = A.getParameter(A.UNPACK_ROW_LENGTH),
        Fe = A.getParameter(A.UNPACK_IMAGE_HEIGHT),
        si = A.getParameter(A.UNPACK_SKIP_PIXELS),
        Oe = A.getParameter(A.UNPACK_SKIP_ROWS),
        Fi = A.getParameter(A.UNPACK_SKIP_IMAGES);
      (A.pixelStorei(A.UNPACK_ROW_LENGTH, se.width),
        A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, se.height),
        A.pixelStorei(A.UNPACK_SKIP_PIXELS, wt),
        A.pixelStorei(A.UNPACK_SKIP_ROWS, Pt),
        A.pixelStorei(A.UNPACK_SKIP_IMAGES, Tt));
      const de = v.isDataArrayTexture || v.isData3DTexture,
        $e = L.isDataArrayTexture || L.isData3DTexture;
      if (v.isDepthTexture) {
        const Xe = gt.get(v),
          we = gt.get(L),
          Le = gt.get(Xe.__renderTarget),
          ir = gt.get(we.__renderTarget);
        (mt.bindFramebuffer(A.READ_FRAMEBUFFER, Le.__webglFramebuffer),
          mt.bindFramebuffer(A.DRAW_FRAMEBUFFER, ir.__webglFramebuffer));
        for (let On = 0; On < dt; On++)
          (de &&
            (A.framebufferTextureLayer(
              A.READ_FRAMEBUFFER,
              A.COLOR_ATTACHMENT0,
              gt.get(v).__webglTexture,
              I,
              Tt + On,
            ),
            A.framebufferTextureLayer(
              A.DRAW_FRAMEBUFFER,
              A.COLOR_ATTACHMENT0,
              gt.get(L).__webglTexture,
              Q,
              he + On,
            )),
            A.blitFramebuffer(
              wt,
              Pt,
              ot,
              ft,
              Vt,
              Jt,
              ot,
              ft,
              A.DEPTH_BUFFER_BIT,
              A.NEAREST,
            ));
        (mt.bindFramebuffer(A.READ_FRAMEBUFFER, null),
          mt.bindFramebuffer(A.DRAW_FRAMEBUFFER, null));
      } else if (I !== 0 || v.isRenderTargetTexture || gt.has(v)) {
        const Xe = gt.get(v),
          we = gt.get(L);
        (mt.bindFramebuffer(A.READ_FRAMEBUFFER, ol),
          mt.bindFramebuffer(A.DRAW_FRAMEBUFFER, cl));
        for (let Le = 0; Le < dt; Le++)
          (de
            ? A.framebufferTextureLayer(
                A.READ_FRAMEBUFFER,
                A.COLOR_ATTACHMENT0,
                Xe.__webglTexture,
                I,
                Tt + Le,
              )
            : A.framebufferTexture2D(
                A.READ_FRAMEBUFFER,
                A.COLOR_ATTACHMENT0,
                A.TEXTURE_2D,
                Xe.__webglTexture,
                I,
              ),
            $e
              ? A.framebufferTextureLayer(
                  A.DRAW_FRAMEBUFFER,
                  A.COLOR_ATTACHMENT0,
                  we.__webglTexture,
                  Q,
                  he + Le,
                )
              : A.framebufferTexture2D(
                  A.DRAW_FRAMEBUFFER,
                  A.COLOR_ATTACHMENT0,
                  A.TEXTURE_2D,
                  we.__webglTexture,
                  Q,
                ),
            I !== 0
              ? A.blitFramebuffer(
                  wt,
                  Pt,
                  ot,
                  ft,
                  Vt,
                  Jt,
                  ot,
                  ft,
                  A.COLOR_BUFFER_BIT,
                  A.NEAREST,
                )
              : $e
                ? A.copyTexSubImage3D(le, Q, Vt, Jt, he + Le, wt, Pt, ot, ft)
                : A.copyTexSubImage2D(le, Q, Vt, Jt, wt, Pt, ot, ft));
        (mt.bindFramebuffer(A.READ_FRAMEBUFFER, null),
          mt.bindFramebuffer(A.DRAW_FRAMEBUFFER, null));
      } else
        $e
          ? v.isDataTexture || v.isData3DTexture
            ? A.texSubImage3D(le, Q, Vt, Jt, he, ot, ft, dt, ee, At, se.data)
            : L.isCompressedArrayTexture
              ? A.compressedTexSubImage3D(
                  le,
                  Q,
                  Vt,
                  Jt,
                  he,
                  ot,
                  ft,
                  dt,
                  ee,
                  se.data,
                )
              : A.texSubImage3D(le, Q, Vt, Jt, he, ot, ft, dt, ee, At, se)
          : v.isDataTexture
            ? A.texSubImage2D(A.TEXTURE_2D, Q, Vt, Jt, ot, ft, ee, At, se.data)
            : v.isCompressedTexture
              ? A.compressedTexSubImage2D(
                  A.TEXTURE_2D,
                  Q,
                  Vt,
                  Jt,
                  se.width,
                  se.height,
                  ee,
                  se.data,
                )
              : A.texSubImage2D(A.TEXTURE_2D, Q, Vt, Jt, ot, ft, ee, At, se);
      (A.pixelStorei(A.UNPACK_ROW_LENGTH, qt),
        A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, Fe),
        A.pixelStorei(A.UNPACK_SKIP_PIXELS, si),
        A.pixelStorei(A.UNPACK_SKIP_ROWS, Oe),
        A.pixelStorei(A.UNPACK_SKIP_IMAGES, Fi),
        Q === 0 && L.generateMipmaps && A.generateMipmap(le),
        mt.unbindTexture());
    }),
      (this.initRenderTarget = function (v) {
        gt.get(v).__webglFramebuffer === void 0 && Ot.setupRenderTarget(v);
      }),
      (this.initTexture = function (v) {
        (v.isCubeTexture
          ? Ot.setTextureCube(v, 0)
          : v.isData3DTexture
            ? Ot.setTexture3D(v, 0)
            : v.isDataArrayTexture || v.isCompressedArrayTexture
              ? Ot.setTexture2DArray(v, 0)
              : Ot.setTexture2D(v, 0),
          mt.unbindTexture());
      }),
      (this.resetState = function () {
        ((w = 0), (C = 0), (U = null), mt.reset(), at.reset());
      }),
      typeof __THREE_DEVTOOLS__ < "u" &&
        __THREE_DEVTOOLS__.dispatchEvent(
          new CustomEvent("observe", { detail: this }),
        ));
  }
  get coordinateSystem() {
    return dn;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(t) {
    this._outputColorSpace = t;
    const e = this.getContext();
    ((e.drawingBufferColorSpace = Yt._getDrawingBufferColorSpace(t)),
      (e.unpackColorSpace = Yt._getUnpackColorSpace()));
  }
}
function fc(i, t, e) {
  const n = document.createElement("canvas");
  ((n.width = i), (n.height = t), e(n.getContext("2d"), i, t));
  const s = new Xc(n);
  return ((s.colorSpace = He), s);
}
function pc(i, t, e, n) {
  const s = t.clone().sub(i),
    r = new me(new ss(e, e, s.length(), 10), n);
  return (
    r.position.copy(i).addScaledVector(s, 0.5),
    r.quaternion.setFromUnitVectors(new F(0, 1, 0), s.normalize()),
    (r.castShadow = !0),
    r
  );
}
function Wm(i) {
  const t = new Kn();
  i.add(t);
  const e = [],
    n = fc(1024, 1024, (d, b, T) => {
      ((d.fillStyle = "#a8adb2"),
        d.fillRect(0, 0, b, T),
        (d.strokeStyle = "#8c939c"),
        (d.lineWidth = 4),
        d.strokeRect(145, 145, 734, 734),
        d.save(),
        d.translate(b / 2, T / 2),
        d.rotate(-Math.PI / 8),
        (d.fillStyle = "#20252b"),
        (d.font = "italic 900 145px Arial"),
        (d.textAlign = "center"),
        d.fillText("LLO", 0, 24),
        (d.fillStyle = "#41494e"),
        (d.font = "bold 22px Arial"),
        d.fillText("L I G A   L U C H A   O N L I N E", 0, 72),
        d.restore());
      for (let y = 0; y < 4; y++)
        (d.save(),
          d.translate(512, 512),
          d.rotate((y * Math.PI) / 2),
          (d.fillStyle = "#20252b"),
          d.fillRect(-168, -405, 336, 58),
          (d.fillStyle = "#c4ed64"),
          (d.font = "italic 900 35px Arial"),
          (d.textAlign = "center"),
          d.fillText(y % 2 ? "MMA" : "LLO", 0, -365),
          d.restore());
    }),
    s = new me(
      new ss(4.58, 4.58, 0.2, 8, 1),
      new Ve({ color: "#171a1e", roughness: 0.9 }),
    );
  ((s.rotation.y = Math.PI / 8), (s.position.y = -0.16), t.add(s));
  const r = new me(new $a(4.5, 8), new Ve({ map: n, roughness: 0.94 }));
  ((r.rotation.x = -Math.PI / 2),
    (r.rotation.z = Math.PI / 8),
    (r.position.y = -0.048),
    (r.receiveShadow = !0),
    t.add(r));
  const a = new Ve({ color: "#15181c", roughness: 0.85 }),
    o = new Ve({ color: "#222930", roughness: 0.72 }),
    l = Array.from(
      { length: 8 },
      (d, b) =>
        new F(
          Math.cos((b * Math.PI) / 4 + Math.PI / 8) * 4.5,
          0,
          Math.sin((b * Math.PI) / 4 + Math.PI / 8) * 4.5,
        ),
    );
  for (let d = 0; d < 8; d++) {
    const b = l[d],
      T = l[(d + 1) % 8];
    t.add(pc(b.clone().setY(0), b.clone().setY(2), 0.105, o));
    for (const N of [0.04, 1.94])
      t.add(pc(b.clone().setY(N), T.clone().setY(N), 0.055, a));
    const y = [],
      R = b.distanceTo(T),
      w = T.clone().sub(b).normalize();
    for (const N of [-1, 1])
      for (let B = -2; B < R + 2; B += 0.12) {
        const W = Math.max(0, N > 0 ? -B : B - R),
          G = Math.min(1.88, N > 0 ? R - B : B);
        if (G <= W) continue;
        const X = b
            .clone()
            .addScaledVector(w, B + N * W)
            .setY(W + 0.03),
          j = b
            .clone()
            .addScaledVector(w, B + N * G)
            .setY(G + 0.03);
        y.push(...X.toArray(), ...j.toArray());
      }
    const C = new Ze();
    C.setAttribute("position", new _e(y, 3));
    const U = new $c({ color: "#6b747d", transparent: !0, opacity: 0.3 }),
      S = new Qd(C, U);
    (t.add(S),
      e.push({ material: U, center: b.clone().add(T).multiplyScalar(0.5) }));
    const M = fc(128, 512, (N, B, W) => {
        ((N.fillStyle = d % 2 ? "#1a2029" : "#bdde55"),
          N.fillRect(0, 0, B, W),
          N.translate(64, 256),
          N.rotate(-Math.PI / 2),
          (N.fillStyle = d % 2 ? "#f4f4ed" : "#15181b"),
          (N.font = "italic 900 61px Arial"),
          (N.textAlign = "center"),
          N.fillText("LLO", 0, 22));
      }),
      P = new me(new Ii(0.23, 1.55, 0.21), new Ve({ map: M, roughness: 0.8 }));
    (P.position.copy(b).setY(1.02),
      (P.rotation.y = -Math.atan2(b.z, b.x)),
      t.add(P));
  }
  const c = new La(31),
    h = new ge(),
    u = new Yd(
      new Qs(1, 6, 5),
      new Ve({ color: "#36404b", roughness: 1 }),
      720,
    );
  let f = 0;
  for (let d = 0; d < 4; d++)
    for (let b = 0; b < 90; b++) {
      const T = (b / 90) * Math.PI * 2,
        y = 6 + d * 0.85;
      (h.position.set(Math.cos(T) * y, 0.44 + d * 0.48, Math.sin(T) * y),
        h.scale.set(0.21, 0.34, 0.19),
        h.updateMatrix(),
        u.setMatrixAt(f, h.matrix),
        u.setColorAt(f++, new Ht().setHSL(c.next(), 0.1, c.range(0.08, 0.22))),
        (h.position.y += 0.44),
        h.scale.set(0.105, 0.13, 0.11),
        h.updateMatrix(),
        u.setMatrixAt(f, h.matrix),
        u.setColorAt(f++, new Ht().setHSL(0.08, 0.18, c.range(0.18, 0.35))));
    }
  t.add(u);
  const p = new me(new Ui(60, 60), new Ve({ color: "#080b10", roughness: 1 }));
  ((p.rotation.x = -Math.PI / 2), (p.position.y = -0.28), t.add(p));
  const _ = new nh("#d8e4ff", "#36302a", 1.8);
  i.add(_);
  const x = new Ho("#fff0dc", 3.5);
  (x.position.set(-3, 9, 4),
    (x.castShadow = !0),
    x.shadow.mapSize.set(1024, 1024),
    Object.assign(x.shadow.camera, {
      left: -6,
      right: 6,
      top: 6,
      bottom: -6,
      near: 0.1,
      far: 25,
    }),
    (x.shadow.bias = -0.001),
    i.add(x));
  const m = new Ho("#aacaff", 2.1);
  return (m.position.set(4, 5, -5), i.add(m), { group: t, panels: e });
}
const vt = (i, t, e) => new F(i, t, e),
  mc = vt(0, 1, 0);
class $m {
  constructor(t, e = 0) {
    ((this.root = new Kn()),
      (this.joints = {}),
      (this.parts = []),
      (this.side = e));
    const n = new Ve({ color: t.skin, roughness: 0.72 }),
      s = new Ve({ color: t.skin, roughness: 0.85 });
    s.color.multiplyScalar(0.85);
    const r = new Ve({
        color: e === 0 ? "#b9d942" : "#363d69",
        roughness: 0.86,
      }),
      a = new Ve({ color: "#101115", roughness: 0.62 }),
      o = new Ve({ color: e === 0 ? "#d94c46" : "#438ae0" }),
      l = new Ve({ color: "#dadbcb" });
    ((this.materials = [n, s, r, a, o, l]),
      (this.sphere = new Qs(1, 16, 12)),
      (this.cylinder = new ss(1, 1, 1, 12)),
      this.ellipsoid("pelvis", n, [0.19, 0.14, 0.13]),
      this.ellipsoid("abdomen", n, [0.18, 0.22, 0.12]),
      this.ellipsoid("chest", n, [0.265, 0.23, 0.145]),
      this.ellipsoid("neck", n, [0.085, 0.13, 0.085]),
      (this.head = this.ellipsoid("head", n, [0.115, 0.155, 0.12])),
      (this.face = new Kn()),
      this.root.add(this.face));
    const c = (p, _, x) => {
      const m = new me(this.sphere, p);
      return (m.scale.set(..._), m.position.set(...x), this.face.add(m), m);
    };
    (c(n, [0.038, 0.028, 0.04], [0, -0.01, 0.115]),
      c(a, [0.109, 0.05, 0.107], [0, 0.12, -0.005]),
      c(s, [0.078, 0.043, 0.06], [0, -0.1, 0.075]),
      c(s, [0.045, 0.008, 0.013], [0, -0.064, 0.115]));
    for (const p of [-1, 1])
      (c(n, [0.023, 0.046, 0.024], [p * 0.118, -0.015, 0]),
        c(a, [0.026, 0.009, 0.008], [p * 0.047, 0.044, 0.111]),
        c(l, [0.022, 0.011, 0.009], [p * 0.047, 0.023, 0.113]),
        c(a, [0.008, 0.009, 0.008], [p * 0.046, 0.023, 0.119]));
    for (const p of ["left", "right"])
      (this.ellipsoid(`${p}Shoulder`, n, [0.13, 0.13, 0.13]),
        this.link(`${p}Shoulder`, `${p}Elbow`, n, 0.105, 0.92),
        this.ellipsoid(`${p}Elbow`, n, [0.078, 0.078, 0.078]),
        this.link(`${p}Elbow`, `${p}Hand`, n, 0.072, 0.9),
        this.ellipsoid(`${p}Hand`, a, [0.097, 0.094, 0.117]),
        this.ellipsoid(`${p}Wrist`, o, [0.077, 0.06, 0.075]),
        this.link(`${p}Hip`, `${p}Knee`, n, 0.129, 1),
        this.link(`${p}Hip`, `${p}Thigh`, r, 0.15, 1.07),
        this.ellipsoid(`${p}Knee`, n, [0.09, 0.087, 0.093]),
        this.link(`${p}Knee`, `${p}Foot`, n, 0.084, 1),
        this.ellipsoid(`${p}Foot`, n, [0.075, 0.06, 0.15]));
    (this.ellipsoid("belt", a, [0.202, 0.045, 0.143]),
      this.ellipsoid("shorts", r, [0.218, 0.14, 0.155]));
    for (const p of [-1, 1])
      this.ellipsoid(p === -1 ? "pecL" : "pecR", n, [0.119, 0.092, 0.041]);
    const h = document.createElement("canvas");
    ((h.width = 256), (h.height = 128));
    const u = h.getContext("2d");
    ((u.fillStyle = "#eef0e7"),
      (u.font = "italic 900 58px Arial"),
      (u.textAlign = "center"),
      u.fillText("LLO", 128, 82),
      (this.texture = new Xc(h)));
    const f = new me(
      new Ui(0.22, 0.11),
      new Va({ map: this.texture, transparent: !0, depthWrite: !1 }),
    );
    (this.parts.push({ mesh: f, joint: "trunkLogo" }),
      this.root.add(f),
      this.materials.push(f.material));
  }
  ellipsoid(t, e, n) {
    const s = new me(this.sphere, e);
    return (
      s.scale.set(...n),
      (s.castShadow = !0),
      this.parts.push({ mesh: s, joint: t }),
      this.root.add(s),
      s
    );
  }
  link(t, e, n, s, r = 1) {
    const a = new me(this.cylinder, n);
    ((a.castShadow = !0),
      this.parts.push({ mesh: a, a: t, b: e, radius: s, depth: r }),
      this.root.add(a));
  }
  apply(t, e) {
    var s;
    for (const [r, a] of Object.entries(t))
      ((s = this.joints)[r] ?? (s[r] = a.clone()), this.joints[r].lerp(a, e));
    const n = this.joints;
    for (const r of this.parts) {
      const { mesh: a } = r;
      if (r.joint) n[r.joint] && a.position.copy(n[r.joint]);
      else if (n[r.a] && n[r.b]) {
        const o = n[r.b].clone().sub(n[r.a]);
        (a.position.copy(n[r.a]).addScaledVector(o, 0.5),
          a.quaternion.setFromUnitVectors(mc, o.clone().normalize()),
          a.scale.set(r.radius, o.length(), r.radius * r.depth));
      }
    }
    if ((n.head && this.face.position.copy(n.head), n.chest && n.pelvis)) {
      const r = n.chest.clone().sub(n.pelvis).normalize(),
        a = new Pi().setFromUnitVectors(mc, r);
      for (const o of this.parts)
        ["chest", "abdomen", "pelvis", "neck", "head"].includes(o.joint) &&
          o.mesh.quaternion.copy(a);
      this.face.quaternion.copy(a);
    }
  }
  dispose() {
    (this.sphere.dispose(),
      this.cylinder.dispose(),
      this.texture.dispose(),
      this.materials.forEach((t) => t.dispose()));
  }
}
function gc(i, t, e, n, s) {
  const r = t.clone().sub(i),
    a = Math.min(r.length(), n + s - 0.001);
  r.normalize();
  const o = i.clone().addScaledVector(r, a),
    l = (n * n - s * s + a * a) / (2 * Math.max(0.001, a)),
    c = Math.sqrt(Math.max(0, n * n - l * l)),
    h = e.clone().sub(i);
  return (
    h.addScaledVector(r, -h.dot(r)).normalize(),
    { middle: i.clone().addScaledVector(r, l).addScaledVector(h, c), end: o }
  );
}
const _c = [
  ["pelvis", "chest"],
  ["chest", "neck"],
  ["neck", "head"],
  ["chest", "leftShoulder"],
  ["chest", "rightShoulder"],
  ...["left", "right"].flatMap((i) => [
    [`${i}Shoulder`, `${i}Elbow`],
    [`${i}Elbow`, `${i}Hand`],
    ["pelvis", `${i}Hip`],
    [`${i}Hip`, `${i}Knee`],
    [`${i}Knee`, `${i}Foot`],
  ]),
  ["leftShoulder", "rightShoulder"],
  ["leftHip", "rightHip"],
  ["head", "pelvis"],
];
class Xm {
  constructor(t) {
    ((this.points = {}), (this.previous = {}));
    const e = new Set(_c.flat());
    for (const n of e)
      ((this.points[n] = t[n].clone()),
        (this.previous[n] = t[n].clone().add(vt(0, -0.015, 0.06))));
    this.links = _c.map(([n, s]) => [n, s, t[n].distanceTo(t[s])]);
  }
  tick(t) {
    t = Math.min(t, 1 / 30);
    for (const [e, n] of Object.entries(this.points)) {
      const s = n.clone().sub(this.previous[e]).multiplyScalar(0.97);
      (this.previous[e].copy(n), n.add(s), (n.y -= 9.81 * t * t));
    }
    for (let e = 0; e < 6; e++) {
      for (const [n, s, r] of this.links) {
        const a = this.points[s].clone().sub(this.points[n]),
          o = a.length();
        (a.multiplyScalar(((o - r) / Math.max(0.001, o)) * 0.5),
          this.points[n].add(a),
          this.points[s].sub(a));
      }
      for (const [n, s] of Object.entries(this.points)) {
        const r = ["head", "pelvis", "chest"].includes(n) ? 0.15 : 0.07;
        s.y < r &&
          ((s.y = r),
          (this.previous[n].x += (s.x - this.previous[n].x) * 0.45),
          (this.previous[n].z += (s.z - this.previous[n].z) * 0.45));
      }
    }
    return this.points;
  }
}
class qm {
  constructor(t) {
    ((this.rig = t),
      (this.time = 0),
      (this.ragdoll = null),
      (this.lastState = ""),
      (this.recoil = 0),
      (this.lastPose = null));
  }
  impact(t) {
    this.recoil = Math.min(0.22, t * 0.027);
  }
  update(t, e, n, s, r = null) {
    this.time += s;
    const a = this.rig;
    a.root.position.lerp(
      vt(t.position.x, 0, t.position.z),
      1 - Math.exp(-s * 18),
    );
    const o = Math.atan2(
        e.position.x - t.position.x,
        e.position.z - t.position.z,
      ),
      l = Math.atan2(
        Math.sin(o - a.root.rotation.y),
        Math.cos(o - a.root.rotation.y),
      );
    a.root.rotation.y += l * (1 - Math.exp(-s * 12));
    let c = this.standing(t);
    const h = ["ground-top", "ground-bottom"].includes(t.state);
    if (
      (h && (c = this.ground(t, n)),
      t.state === "takedown-attempt" ||
        (t.state === "defending" && t.defenseType === "sprawl"))
    ) {
      const f = Math.sin(te(t.stateTime / 1.4, 0, 1) * Math.PI) * 0.4;
      (Object.values(c).forEach((p) => {
        p.y = Math.max(0.08, p.y - f);
      }),
        c.leftHand.set(-0.23, 0.75, 0.6),
        c.rightHand.set(0.23, 0.75, 0.6),
        (c.chest.z += 0.25));
    }
    if (
      (t.state === "clinch" &&
        (c.leftHand.set(-0.16, 1.68, 0.5),
        c.rightHand.set(0.25, 1.6, 0.45),
        (c.chest.z += 0.15)),
      t.state === "getting-up")
    ) {
      const f = te(t.stateTime / 1.5, 0, 1),
        p = this.ground({ ...t, state: "ground-top" }, null);
      for (const _ in c) p[_] && c[_].lerp(p[_], 1 - f);
    }
    (t.action && this.attack(c, t, h),
      t.state === "defending" && !h && this.defend(c, t),
      ["rocked", "stunned"].includes(t.state) &&
        ((c.head.x += Math.sin(this.time * 13) * 0.055),
        (c.chest.z -= 0.12),
        (c.head.z -= 0.16)));
    const u = ["knockdown", "KO"].includes(t.state);
    (u
      ? (this.ragdoll || (this.ragdoll = new Xm(this.lastPose || c)),
        Object.assign(c, this.ragdoll.tick(s)))
      : (this.ragdoll = null),
      u || this.solveLimbs(c, h),
      (this.recoil *= Math.exp(-s * 10)),
      !h && !u && ((c.head.z -= this.recoil), (c.chest.z -= this.recoil * 0.4)),
      (r == null ? void 0 : r.winner) === t.side &&
        !h &&
        (c.leftHand.set(-0.45, 2.12, 0),
        c.rightHand.set(0.45, 2.12, 0),
        this.solveLimbs(c, !1)),
      this.derived(c),
      a.apply(c, 1 - Math.exp(-s * (t.action ? 28 : 13))),
      (this.lastPose = c),
      (this.lastState = t.state));
  }
  standing(t) {
    const e = Math.hypot(t.velocity.x, t.velocity.z),
      n = this.time * 8,
      s = Math.sin(this.time * (2.8 + t.fatigue * 0.03)) * 0.009,
      r = Math.sin(n) * Math.min(0.2, e * 0.25),
      a =
        e > 0.1
          ? Math.abs(Math.sin(n)) * 0.026
          : Math.sin(this.time * 3) * 0.012;
    return {
      pelvis: vt(0, 0.94 + a, -0.025),
      abdomen: vt(0, 1.16 + a, 0),
      chest: vt(0, 1.4 + a + s, 0.055),
      neck: vt(0, 1.6 + a, 0.055),
      head: vt(0, 1.76 + a, 0.065),
      leftShoulder: vt(-0.25, 1.48 + a, 0.115),
      rightShoulder: vt(0.25, 1.47 + a, -0.035),
      leftHand: vt(-0.22, 1.61 + s, 0.46),
      rightHand: vt(0.2, 1.65 + s, 0.27),
      leftHip: vt(-0.14, 0.94 + a, 0),
      rightHip: vt(0.14, 0.94 + a, -0.08),
      leftFoot: vt(-0.25, 0.07 + Math.max(0, Math.cos(n)) * e * 0.09, 0.3 + r),
      rightFoot: vt(
        0.25,
        0.07 + Math.max(0, -Math.cos(n)) * e * 0.09,
        -0.3 - r,
      ),
    };
  }
  ground(t, e) {
    if (t.state === "ground-top") {
      const r = (e == null ? void 0 : e.position) === "side" ? 0.2 : 0;
      return {
        pelvis: vt(r, 0.58, -0.15),
        abdomen: vt(r, 0.77, 0.01),
        chest: vt(r, 0.95, 0.15),
        neck: vt(r, 1.09, 0.25),
        head: vt(r, 1.23, 0.31),
        leftShoulder: vt(-0.25 + r, 1, 0.16),
        rightShoulder: vt(0.25 + r, 1, 0.13),
        leftHand: vt(-0.22, 0.53, 0.45),
        rightHand: vt(0.2, 0.63, 0.4),
        leftHip: vt(-0.18, 0.55, -0.1),
        rightHip: vt(0.18, 0.55, -0.1),
        leftFoot: vt(-0.38, 0.07, -0.6),
        rightFoot: vt(0.38, 0.07, -0.6),
        leftKnee: vt(-0.4, 0.12, 0.04),
        rightKnee: vt(0.4, 0.12, 0.04),
      };
    }
    const s =
      (e == null ? void 0 : e.subName) === "Triangle" &&
      e.mode === "submission";
    return {
      pelvis: vt(0, 0.2, 0.15),
      abdomen: vt(0, 0.21, -0.05),
      chest: vt(0, 0.23, -0.27),
      neck: vt(0, 0.22, -0.46),
      head: vt(0, 0.21, -0.61),
      leftShoulder: vt(-0.25, 0.26, -0.3),
      rightShoulder: vt(0.25, 0.26, -0.3),
      leftHand: vt(-0.22, 0.65, -0.02),
      rightHand: vt(0.21, 0.64, -0.04),
      leftHip: vt(-0.15, 0.22, 0.15),
      rightHip: vt(0.15, 0.22, 0.15),
      leftFoot: vt(-0.32, s ? 1 : 0.3, 0.55),
      rightFoot: vt(0.32, s ? 0.9 : 0.3, 0.55),
      leftKnee: vt(-0.4, 0.6, 0.27),
      rightKnee: vt(0.4, 0.6, 0.27),
    };
  }
  attack(t, e, n) {
    const s = e.action,
      r = Jn[s.type],
      a = te(s.elapsed / s.duration, 0, 1),
      o = r.impact,
      l =
        a < o
          ? Math.sin(((a / o) * Math.PI) / 2) ** 2
          : Math.cos((((a - o) / (1 - o)) * Math.PI) / 2) ** 2,
      c = n ? 0 : Math.min(0.35, Math.max(0, e.distance - 0.96)) * l;
    for (const f of [
      "head",
      "neck",
      "chest",
      "abdomen",
      "leftShoulder",
      "rightShoulder",
    ])
      t[f].z += c;
    const h = r.limb,
      u = r.zone === "head" ? 1.72 : r.zone === "body" ? 1.13 : 0.48;
    if (h.includes("Hand")) {
      const f = vt(
        h === "leftHand" ? -0.045 : 0.045,
        n ? 0.33 : u,
        n ? 0.66 : Math.min(e.distance - 0.12, 1.23),
      );
      ((s.type === "hook" || s.type === "bodyShot") &&
        (f.x += Math.sin(a * Math.PI * 2) * 0.34),
        s.type === "uppercut" && (f.y -= Math.sin(a * Math.PI * 2) * 0.3),
        t[h].lerp(f, l),
        (t.chest.x += (h === "leftHand" ? 0.05 : -0.05) * l));
    } else
      h === "rightKnee"
        ? (t.rightFoot.lerp(vt(0.14, 0.62, 0.34), l),
          (t.rightKnee = vt(0.12, 0.55 + l * 0.6, 0.1 + l * 0.58)))
        : (t.rightFoot.lerp(
            vt(
              0.08 + Math.sin(a * Math.PI * 2) * 0.35,
              u,
              Math.min(e.distance - 0.18, 1.25),
            ),
            l,
          ),
          (t.pelvis.y -= 0.05 * l),
          (t.chest.x -= 0.16 * l),
          t.rightHand.lerp(vt(0.45, 1.16, -0.1), l));
  }
  defend(t, e) {
    const n = e.defenseType;
    if (
      (n === "high" &&
        (t.leftHand.set(-0.1, 1.79, 0.27), t.rightHand.set(0.1, 1.78, 0.25)),
      n === "body" &&
        (t.leftHand.set(-0.13, 1.19, 0.3), t.rightHand.set(0.13, 1.25, 0.27)),
      n === "parry" && t.leftHand.set(-0.08, 1.66, 0.66),
      (n === "slip" || n === "lateral") &&
        ((t.head.x -= 0.18), (t.chest.x -= 0.1)),
      n === "duck")
    )
      for (const s of [
        "head",
        "neck",
        "chest",
        "leftShoulder",
        "rightShoulder",
      ])
        t[s].y -= 0.2;
    n === "backstep" && ((t.head.z -= 0.16), (t.chest.z -= 0.09));
  }
  solveLimbs(t, e) {
    var n;
    for (const [s, r] of [
      ["left", -1],
      ["right", 1],
    ]) {
      const a = gc(
        t[`${s}Shoulder`],
        t[`${s}Hand`],
        vt(r * 0.6, 0.95, 0.17),
        0.35,
        0.34,
      );
      if (
        ((t[`${s}Elbow`] = a.middle),
        (t[`${s}Hand`] = a.end),
        !e || !t[`${s}Knee`])
      ) {
        const o = gc(
          t[`${s}Hip`],
          t[`${s}Foot`],
          vt(r * 0.3, 0.45, 0.75),
          0.46,
          0.46,
        );
        (t[(n = `${s}Knee`)] ?? (t[n] = o.middle), (t[`${s}Foot`] = o.end));
      }
    }
  }
  derived(t) {
    ((t.abdomen = t.pelvis.clone().lerp(t.chest, 0.48)),
      (t.belt = t.pelvis.clone().add(vt(0, 0.04, 0))),
      (t.shorts = t.pelvis.clone().add(vt(0, -0.06, 0))),
      (t.trunkLogo = t.shorts.clone().add(vt(0, 0, 0.15))),
      (t.pecL = t.chest.clone().add(vt(-0.105, 0.01, 0.128))),
      (t.pecR = t.chest.clone().add(vt(0.105, 0.01, 0.128))));
    for (const e of ["left", "right"])
      ((t[`${e}Wrist`] = t[`${e}Hand`].clone().lerp(t[`${e}Elbow`], 0.17)),
        (t[`${e}Thigh`] = t[`${e}Hip`].clone().lerp(t[`${e}Knee`], 0.65)));
  }
}
class Ym {
  constructor(t) {
    ((this.camera = t),
      (this.mode = "broadcast"),
      (this.target = new F(0, 0.85, 0)),
      (this.special = 0));
  }
  update(t, e, n = !1) {
    const [s, r] = t,
      a = new F(
        (s.position.x + r.position.x) / 2,
        0.85,
        (s.position.z + r.position.z) / 2,
      );
    ((s.state.includes("ground") || r.state === "KO") && (a.y = 0.45),
      this.target.lerp(a, 1 - Math.exp(-e * 3)));
    const l = Math.hypot(
        s.position.x - r.position.x,
        s.position.z - r.position.z,
      ),
      c = this.camera.aspect < 1.2 ? 1.35 : 1,
      h = Math.max(6.1, 4.6 + l * 0.8) * c,
      u =
        this.mode === "side"
          ? new F(0, 1.8, h)
          : this.mode === "elevated"
            ? new F(3, h * 0.9, h * 0.82)
            : new F(3.1, 2.7, h);
    (n && u.set(6.5, 4, 7.7),
      this.special > 0 && ((this.special -= e), u.multiplyScalar(0.88)),
      this.camera.position.lerp(
        this.target.clone().add(u),
        1 - Math.exp(-e * 2.6),
      ),
      this.camera.lookAt(this.target));
  }
}
class jm {
  constructor() {
    ((this.context = null), (this.enabled = !1));
  }
  async enable() {
    if (!this.context) {
      const t = window.AudioContext || window.webkitAudioContext;
      if (!t) return !1;
      ((this.context = new t()),
        (this.master = this.context.createGain()),
        (this.master.gain.value = 0.3),
        this.master.connect(this.context.destination));
      const e = this.context.createBuffer(
          1,
          this.context.sampleRate * 3,
          this.context.sampleRate,
        ),
        n = e.getChannelData(0);
      for (let a = 0; a < n.length; a++) n[a] = Math.random() * 2 - 1;
      this.noiseBuffer = e;
      const s = this.context.createBufferSource();
      ((s.buffer = e), (s.loop = !0));
      const r = this.context.createBiquadFilter();
      ((r.type = "bandpass"),
        (r.frequency.value = 650),
        (r.Q.value = 0.65),
        (this.crowd = this.context.createGain()),
        (this.crowd.gain.value = 0.025),
        s.connect(r),
        r.connect(this.crowd),
        this.crowd.connect(this.master),
        s.start());
    }
    return (
      await this.context.resume(),
      (this.enabled = !0),
      (this.master.gain.value = 0.3),
      !0
    );
  }
  mute() {
    ((this.enabled = !1), this.master && (this.master.gain.value = 0));
  }
  tone(t, e, n, s = "sine") {
    const r = this.context,
      a = r.createOscillator(),
      o = r.createGain();
    ((a.type = s),
      a.frequency.setValueAtTime(t, r.currentTime),
      a.frequency.exponentialRampToValueAtTime(t * 0.5, r.currentTime + e),
      o.gain.setValueAtTime(n, r.currentTime),
      o.gain.exponentialRampToValueAtTime(0.001, r.currentTime + e),
      a.connect(o),
      o.connect(this.master),
      a.start(),
      a.stop(r.currentTime + e));
  }
  noise(t, e, n) {
    const s = this.context,
      r = s.createBufferSource(),
      a = s.createBiquadFilter(),
      o = s.createGain();
    ((r.buffer = this.noiseBuffer),
      (a.type = "lowpass"),
      (a.frequency.value = n),
      o.gain.setValueAtTime(e, s.currentTime),
      o.gain.exponentialRampToValueAtTime(0.001, s.currentTime + t),
      r.connect(a),
      a.connect(o),
      o.connect(this.master),
      r.start(),
      r.stop(s.currentTime + t));
  }
  event(t) {
    this.enabled &&
      (t.type === "impact" &&
        (this.tone(
          t.outcome === "block" ? 150 : 78,
          0.12,
          t.outcome === "block" ? 0.13 : 0.35,
        ),
        this.noise(0.08, 0.22, 1500)),
      t.type === "step" && this.noise(0.055, 0.045, 650),
      t.type === "bell" &&
        [440, 880, 1320].forEach((e) => this.tone(e, 1.4, 0.12, "triangle")),
      t.type === "round-end" && this.tone(330, 0.5, 0.1, "triangle"),
      ["knockdown", "finish", "takedown"].includes(t.type) &&
        (this.noise(0.6, 0.24, 1700),
        this.tone(56, 0.4, 0.3),
        this.crowd.gain.setValueAtTime(0.12, this.context.currentTime),
        this.crowd.gain.linearRampToValueAtTime(
          0.025,
          this.context.currentTime + 3,
        )));
  }
  dispose() {
    var t;
    (t = this.context) == null || t.close();
  }
}
class Km {
  constructor(t, e, { preview: n = !1, onFrame: s = () => {} } = {}) {
    ((this.container = t),
      (this.sim = e),
      (this.preview = n),
      (this.onFrame = s),
      (this.speed = 1),
      (this.paused = n),
      (this.disposed = !1),
      (this.lastTime = 0),
      (this.audio = new jm()),
      (this.scene = new $d()),
      (this.scene.background = new Ht("#11151c")),
      (this.scene.fog = new Ga("#10141b", 10, 23)),
      (this.renderer = new Gm({
        antialias: !0,
        powerPreference: "high-performance",
      })),
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)),
      (this.renderer.shadowMap.enabled = !0),
      (this.renderer.shadowMap.type = yc),
      (this.renderer.toneMapping = bc),
      (this.renderer.toneMappingExposure = 1.05),
      t.append(this.renderer.domElement),
      this.renderer.domElement.setAttribute(
        "aria-label",
        "Octágono 3D",
      ),
      (this.camera = new je(40, 1, 0.1, 60)),
      this.camera.position.set(4, 4, 8),
      (this.cameraController = new Ym(this.camera)),
      (this.arena = Wm(this.scene)),
      (this.rigs = e.fighters.map((r, a) => {
        const o = new $m(r.profile, a);
        return (
          o.root.position.set(r.position.x, 0, r.position.z),
          this.scene.add(o.root),
          o
        );
      })),
      (this.animators = this.rigs.map((r) => new qm(r))),
      (this.unsubscribe = e.subscribe((r) => {
        (this.audio.event(r),
          r.type === "impact" && this.animators[r.target].impact(r.damage),
          ["knockdown", "finish"].includes(r.type) &&
            (this.cameraController.special = 4));
      })),
      (this.resizeObserver = new ResizeObserver(() => this.resize())),
      this.resizeObserver.observe(t),
      this.resize(),
      (this.animate = this.animate.bind(this)),
      (this.frame = requestAnimationFrame(this.animate)));
  }
  resize() {
    const t = this.container.clientWidth,
      e = this.container.clientHeight;
    !t ||
      !e ||
      (this.renderer.setSize(t, e),
      (this.camera.aspect = t / e),
      this.camera.updateProjectionMatrix());
  }
  animate(t) {
    if (this.disposed) return;
    const e = Math.min(0.05, this.lastTime ? (t - this.lastTime) / 1e3 : 0.016);
    ((this.lastTime = t),
      !this.paused && !this.preview && this.sim.advance(e * this.speed));
    const n =
      this.paused && !this.preview
        ? this.sim.result
          ? e
          : 0
        : e * (this.preview ? 1 : this.speed);
    (this.animators.forEach((s, r) =>
      s.update(
        this.sim.fighters[r],
        this.sim.fighters[1 - r],
        this.sim.grappling.session,
        n,
        this.sim.result,
      ),
    ),
      this.cameraController.update(this.sim.fighters, e, this.preview));
    for (const s of this.arena.panels)
      s.material.opacity =
        s.center.dot(this.camera.position) > 0 ? 0.035 : 0.32;
    (this.renderer.render(this.scene, this.camera),
      this.onFrame(this.sim),
      (this.frame = requestAnimationFrame(this.animate)));
  }
  dispose() {
    ((this.disposed = !0),
      cancelAnimationFrame(this.frame),
      this.resizeObserver.disconnect(),
      this.unsubscribe(),
      this.audio.dispose(),
      this.rigs.forEach((t) => t.dispose()),
      this.scene.traverse((t) => {
        var e, n;
        if (((e = t.geometry) == null || e.dispose(), t.material))
          for (const s of Array.isArray(t.material) ? t.material : [t.material])
            ((n = s.map) == null || n.dispose(), s.dispose());
      }),
      this.renderer.dispose(),
      this.renderer.forceContextLoss(),
      this.renderer.domElement.remove());
  }
}
const Zm = [
    ["dashboard", "Panel", "grid"],
    ["roster", "Mi equipo", "users"],
    ["market", "Mercado", "market"],
    ["ranking", "Rankings", "trophy"],
    ["matchmaking", "Matchmaking", "target"],
    ["events", "Fight nights", "calendar"],
    ["calendar", "Calendario", "calendar"],
    ["camp", "Campamento", "activity"],
    ["tactics", "Táctica", "settings"],
    ["contracts", "Contratos", "contract"],
    ["finances", "Finanzas", "wallet"],
    ["history", "Historial", "history"],
    ["tribuna", "Tribuna", "trophy"],
    ["settings", "Ajustes", "menu"],
  ],
  rs = document.getElementById("app"),
  Dt = new xl(window.localStorage);
window.__llo = { get career() { return Dt; },
  // retrato del módulo como imagen (lo usa la Tribuna para que la carta lleve el mismo peleador que se ve en las fichas)
  portrait(f) { const m = /<svg[\s\S]*<\/svg>/.exec(ts(f)); return m ? "data:image/svg+xml," + encodeURIComponent(m[0].replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')) : undefined; } };
let er = "dashboard",
  Ys = {},
  Ue = null,
  Pn = null,
  ni = null,
  js = !1,
  qa = null;
function Ye(i, t = {}) {
  (nl(), (er = i), (Ys = t), Zn(), window.scrollTo(0, 0));
}
function Jm() {
  switch (er) {
    case "dashboard":
      return ro(Dt);
    case "roster":
      return ao(Dt, !1);
    case "market":
      return ao(Dt, !0);
    case "profile":
      return yl(Dt, Ys.id);
    case "ranking":
      return El(Dt, Ys.division || Dt.fighter().division);
    case "matchmaking":
      return bl(Dt);
    case "events":
      return Tl(Dt);
    case "calendar":
      return llocal(Dt);
    case "camp":
      return Al(Dt);
    case "tactics":
      return wl(Dt);
    case "contracts":
      return Rl(Dt);
    case "finances":
      return Pl(Dt);
    case "history":
      return Dl(Dt);
    case "settings":
      return Ll(Dt);
    case "fight":
      return ig();
    default:
      return ro(Dt);
  }
}
function Qm() {
  return `
  <header class="topbar">
    <div class="brand"><span class="brand-mark"><img src="../assets/logos/llo-sm.png" alt=""></span><span>LLO<span class="brand-period">.</span></span><div class="brand-descriptor">LIGA LUCHA<br>ONLINE</div></div>
    <nav>${Zm.map(([i, t, e]) => `<button class="nav-item ${er === i ? "active" : ""}" data-action="nav" data-page="${i}">${zt(e)}<span>${t}</span></button>`).join("")}</nav>
    <div class="topbar-meta"><span class="topbar-money">${Te(Dt.state.money)}</span><span class="day-tag">${De(Dt.state.day)}</span></div>
  </header>
  <main id="content">${Jm()}</main>
  <dialog id="app-dialog"></dialog>
  <div id="toast" class="toast" hidden></div>`;
}
function Zn() {
  ((rs.innerHTML = Qm()), Dt.warning && (hn(Dt.warning), (Dt.warning = "")));
}
function hn(i) {
  const t = document.getElementById("toast");
  t &&
    ((t.textContent = i),
    (t.hidden = !1),
    clearTimeout(hn._t),
    (hn._t = setTimeout(() => {
      t.hidden = !0;
    }, 3200)));
}
function Da() {
  const i = document.getElementById("app-dialog");
  (i != null && i.open && i.close(), (qa = null));
}
function $i(i, t) {
  const e = document.getElementById("app-dialog");
  ((e.innerHTML = `<div class="dialog-box"><p>${xt(i)}</p><div class="dialog-actions">${jt("Cancelar", "dialog-cancel", "secondary")}${jt("Confirmar", "dialog-confirm", "dark")}</div></div>`),
    (qa = t),
    e.showModal());
}
let NEG = null;
function negDialog(i, t) {
  const e = Dt.fighter(t),
    n = Dt.askFor(i, e);
  NEG = { kind: i, id: t, ask: n };
  const s = document.getElementById("app-dialog");
  ((s.innerHTML = `<form id="neg-form" class="dialog-box">
    <h3>${i === "sign" ? "Fichaje" : "Renovación"} · ${xt($t(e))}</h3>
    <p>Pide ${Te(n)} ${i === "sign" ? "por incorporarse al club" : "por renovar 4 combates"}. Saldo disponible: ${Te(Dt.state.money)}.</p>
    <label>Tu oferta: <b id="neg-val">${Te(n)}</b><input class="neg-slider" type="range" min="70" max="130" value="100" name="pct"></label>
    <p class="note" id="neg-msg"></p>
    <div class="dialog-actions">${jt("Cancelar", "dialog-cancel", "secondary", 'type="button"')}<button class="btn dark" type="submit">Ofrecer</button></div>
  </form>`),
    s.showModal());
}
function negResult(i, t) {
  const e = Dt.fighter(NEG.id);
  try {
    (NEG.kind === "sign" ? Dt.sign(NEG.id, i) : Dt.renew(NEG.id, i),
      Da(),
      Ye(NEG.kind === "sign" ? "roster" : "contracts"),
      hn(NEG.kind === "sign" ? `${$t(e)} firmó por ${Te(i)}.` : `Contrato renovado por ${Te(i)}.`));
  } catch (n) {
    alert(n.message);
  }
}
function eg(i) {
  var s;
  const t = Dt.state.results.find((r) => r.id === i);
  if (!t) return;
  const e = t.fighterIds.map((r) => $t(Dt.fighter(r))),
    n = document.getElementById("app-dialog");
  ((n.innerHTML = `<div class="dialog-box wide-dialog">
    <h3>${xt(e[0])} vs ${xt(e[1])}</h3>
    <p>${xt(t.method)} · Round ${t.round} · ${Vs(t.time)}</p>
    <div class="result-stats-grid">${t.stats.map((r, a) => `<div class="result-stat-col"><h4>${xt(e[a])}</h4><ul><li>Golpes: <b>${r.landed}/${r.thrown}</b></li><li>Cabeza: <b>${r.head}</b></li><li>Cuerpo: <b>${r.body}</b></li><li>Pierna: <b>${r.leg}</b></li><li>Derribos: <b>${r.takedowns}/${r.takedownAttempts}</b></li><li>Sumisiones: <b>${r.submissions}</b></li><li>Caídas: <b>${r.knockdowns}</b></li></ul></div>`).join("")}</div>
    ${(s = t.cards) != null && s.length ? `<div class="judges-cards"><h4>Tarjetas de jueces</h4>${t.cards.map((r, a) => `<span>J${a + 1}: ${r.map((o) => o.join("-")).join(" / ")}</span>`).join("")}</div>` : ""}
    <div class="dialog-actions">${jt("Cerrar", "dialog-cancel", "secondary")}</div>
  </div>`),
    n.showModal());
}
function ng() {
  const i = new Blob([Dt.export()], { type: "application/json" }),
    t = URL.createObjectURL(i),
    e = document.createElement("a");
  ((e.href = t),
    (e.download = `llo-save-day${Dt.state.day}.json`),
    e.click(),
    URL.revokeObjectURL(t),
    hn("Partida exportada"));
}
function nl() {
  (Ue && (Ue.dispose(), (Ue = null)), (Pn = null), (ni = null), (js = !1));
}
function ig() {
  return `<section class="fight-page">
    <div class="page-heading"><div><div class="eyebrow">EN VIVO</div><h1 id="fight-title">Preparando combate…</h1><p id="fight-sub">Simulación 3D en tiempo real</p></div><div class="heading-actions">${jt("Salir", "fight-exit", "secondary")}</div></div>
    <div class="fight-shell">
      <div class="fight-hud">
        <div class="fighter-status left"><b id="fight-name-0">—</b><span class="meter health"><i id="fight-health-0" style="width:100%"></i></span><span class="meter stamina"><i id="fight-stamina-0" style="width:100%"></i></span></div>
        <div class="fight-clock"><span id="fight-round">Round 1</span><strong id="fight-time">5:00</strong></div>
        <div class="fighter-status right"><b id="fight-name-1">—</b><span class="meter health"><i id="fight-health-1" style="width:100%"></i></span><span class="meter stamina"><i id="fight-stamina-1" style="width:100%"></i></span></div>
      </div>
      <div id="fight-viewport" class="fight-viewport" aria-label="Octágono 3D"></div>
      <div id="fight-toast" class="fight-toast" hidden></div>
      <div id="fight-result" class="fight-result" hidden></div>
      <div class="fight-controls">
        <button class="btn secondary" data-action="fight-pause" id="fight-pause-btn">${zt("play")} Pausar</button>
        <div class="speed-group">
          <button class="btn text" data-action="fight-speed" data-value="0.5">0.5×</button>
          <button class="btn text active" data-action="fight-speed" data-value="1">1×</button>
          <button class="btn text" data-action="fight-speed" data-value="2">2×</button>
        </div>
        <button class="btn ghost" data-action="fight-sound" id="fight-sound-btn">${zt("volume")} Sonido</button>
      </div>
      <div class="fight-orders" id="fight-orders">
        <span class="fight-orders-label">Órdenes a tu esquina:</span>
        ${[
          ["pressure", "Presionar"],
          ["slow", "Ritmo lento"],
          ["takedown", "Buscar derribo"],
          ["body", "Atacar cuerpo"],
          ["leg", "Atacar pierna"],
          ["protect", "Proteger daño"],
          ["finish", "Ir a rematar"],
          ["decision", "Cuidar tarjetas"],
        ]
          .map(
            ([i, t]) =>
              `<button class="btn text small" data-action="fight-order" data-value="${i}">${t}</button>`,
          )
          .join("")}
      </div>
      <div id="fight-feed" class="fight-feed" aria-live="polite"></div>
    </div>
  </section>`;
}
// ---- transmisión (assets/broadcast): presentación, placas y relato del combate ----
let LLObc = null, llocd = {};
function llobc() {
  const m = document.getElementById("fight-viewport");
  if (!m || !window.Broadcast) return null;
  if (LLObc && LLObc.layer.parentNode === m) return LLObc;
  try {
    window.Broadcast.setBase(new URL("../assets/", location.href).href);
    LLObc = window.Broadcast.attach({ id: "llo", sport: "mma", mount: m, accent: "#d9463b", logo: "logos/llo-sm.png", league: "Liga Lucha Online" });
  } catch (e) { LLObc = null; }
  return LLObc;
}
function llocast(i, ev) {
  const b = llobc(); if (!b) return;
  const nm = (k) => Ks(i, k);
  if (ev.type === "bell") b.event("round", { plate: `ROUND ${ev.round}`, sub: ev.round === 1 ? "¡Empieza el combate!" : "" });
  else if (ev.type === "knockdown") b.event("knockdown", { p: nm(ev.target), sub: `${nm(ev.actor)} derriba a ${nm(ev.target)}` });
  else if (ev.type === "round-end" && ev.round < i.options.rounds && Ue) {
    // entretiempo: el estudio comenta el round mientras la pelea espera
    const [x, y] = i.fighters, a = x.stats.landed, c = y.stats.landed, was = Ue.paused;
    Ue.paused = true;
    b.studio({ kind: "half", onDone: () => { if (Ue) Ue.paused = was; }, lines: [
      ["A", `Terminó el round ${ev.round}.`],
      ["B", a === c ? "Round parejo: los dos conectaron lo mismo." : `${nm(a > c ? 0 : 1)} se llevó el round por volumen: ${Math.max(a, c)} golpes conectados contra ${Math.min(a, c)}.`],
      ["A", `Estado físico: ${nm(0)} ${Math.round(x.stamina)} %, ${nm(1)} ${Math.round(y.stamina)} %.`]] });
  }
}
function llofinal(i) {
  const b = llobc(); if (!b) return;
  const t = i.result, [x, y] = i.fighters;
  if (t.winner === null) b.plate("EMPATE", "", "#8a8f96");
  else b.event("final", { plate: `${Ks(i, t.winner)} GANA`, sub: t.method });
  const w = t.winner === null ? null : i.fighters[t.winner];
  setTimeout(() => b.studio({ kind: "post", lines: [
    ["A", t.winner === null ? "Las tarjetas dejan el combate empatado." : `${$t(w.profile)} gana por ${String(t.method).toLowerCase()} en el round ${t.round}, a los ${Vs(t.time)}.`],
    ["B", `Golpes conectados: ${x.stats.landed} de ${x.stats.thrown} para ${Ks(i, 0)} y ${y.stats.landed} de ${y.stats.thrown} para ${Ks(i, 1)}.`],
    ["A", "Gracias por acompañarnos."]] }), 2500);
}
function Ya(i, t) {
  (nl(), (er = "fight"), (Ys = {}), Zn(), sg(i, t));
}
function Ks(i, t) {
  return i.fighters[t].profile.lastName.toUpperCase();
}
function sg(i, t) {
  ((Pn = i), (ni = t), (js = !1));
  const e = document.getElementById("fight-viewport");
  ((document.getElementById("fight-title").textContent =
    `${$t(i.fighters[0].profile)} vs ${$t(i.fighters[1].profile)}`),
    (document.getElementById("fight-sub").textContent =
      t === "career"
        ? "Combate de carrera · el resultado es definitivo"
        : t === "replay"
          ? "Repetición determinista de un combate ya disputado"
          : "Exhibición libre · no afecta tu carrera"),
    (document.getElementById("fight-name-0").textContent = Ks(i, 0)),
    (document.getElementById("fight-name-1").textContent = Ks(i, 1)),
    (document.getElementById("fight-orders").style.display =
      t === "replay" ? "none" : ""),
    (Ue = new Km(e, i, { onFrame: rg })),
    i.subscribe(ag),
    ze("El combate comienza."));
  {
    const b = llobc();
    if (b && Ue) {
      llocd = {}; b.reset();
      const fA = i.fighters[0].profile, fB = i.fighters[1].profile, rec = (f) => (f.record ? `${f.record.wins}–${f.record.losses}–${f.record.draws}` : "");
      Ue.paused = true;
      b.intro({
        competition: t === "career" ? "Fight night · Liga Lucha Online" : t === "replay" ? "Repetición" : "Exhibición · Liga Lucha Online",
        date: `${i.options.rounds} rounds · ${Qn(fA.division)}`, venue: t === "career" ? De(Dt.state.day) : "",
        home: { name: $t(fA), short: fA.country, primary: "#b4382e", sub: `“${fA.nickname}” · ${rec(fA)}` },
        away: { name: $t(fB), short: fB.country, primary: "#2a5fa8", sub: `“${fB.nickname}” · ${rec(fB)}` },
        ms: 7000,
        onDone: () => b.studio({ kind: "pre", onDone: () => { if (Ue) Ue.paused = false; }, lines: [
          ["A", `Desde la jaula, ${$t(fA)} contra ${$t(fB)}: ${i.options.rounds} rounds.`],
          ["B", `Se enfrentan un ${Pe[fA.style].name.toLowerCase()} y un ${Pe[fB.style].name.toLowerCase()}. El estilo de cada uno va a marcar el ritmo.`],
          ["A", `Récords: ${$t(fA)} ${rec(fA)} y ${$t(fB)} ${rec(fB)}.`]] }),
      });
    }
  }
}
function rg(i) {
  const [t, e] = i.fighters,
    n = document.getElementById("fight-health-0"),
    s = document.getElementById("fight-health-1"),
    r = document.getElementById("fight-stamina-0"),
    a = document.getElementById("fight-stamina-1");
  (n && (n.style.width = `${Math.max(0, t.health)}%`),
    s && (s.style.width = `${Math.max(0, e.health)}%`),
    r && (r.style.width = `${Math.max(0, t.stamina)}%`),
    a && (a.style.width = `${Math.max(0, e.stamina)}%`));
  const o = document.getElementById("fight-round"),
    l = document.getElementById("fight-time");
  (o &&
    (o.textContent =
      i.phase === "break"
        ? `Descanso · antes del round ${i.round + 1}`
        : `Round ${i.round}/${i.options.rounds}`),
    l && (l.textContent = i.phase === "break" ? Vs(i.breakTime) : Vs(i.clock)),
    i.result && !js && ((js = !0), og(i)));
}
function Ri(i) {
  const t = document.getElementById("fight-toast");
  t &&
    ((t.textContent = i),
    (t.hidden = !1),
    clearTimeout(Ri._t),
    (Ri._t = setTimeout(() => {
      t.hidden = !0;
    }, 2200)));
}
function ze(i) {
  const t = document.getElementById("fight-feed");
  if (!t) return;
  const e = document.createElement("div");
  for (
    e.className = "fight-feed-line", e.textContent = i, t.prepend(e);
    t.children.length > 24;
  )
    t.removeChild(t.lastChild);
}
function ag(i) {
  const t = Pn;
  if (!t) return;
  const e = (n) => Ks(t, n);
  llocast(t, i);
  i.type === "bell"
    ? ze(`Suena la campana — round ${i.round}.`)
    : i.type === "knockdown"
      ? (ze(`¡${e(i.actor)} derriba a ${e(i.target)}!`), Ri("¡DERRIBADO!"))
      : i.type === "takedown"
        ? ze(`${e(i.actor)} consigue el derribo.`)
        : i.type === "takedown-attempt"
          ? ze(`${e(i.actor)} busca el derribo.`)
          : i.type === "submission-attempt"
            ? (ze(`${e(i.actor)} intenta ${i.name}.`),
              Ri("¡BUSCA LA SUMISIÓN!"))
            : i.type === "submission-escape"
              ? ze(`${e(i.actor)} escapa de la sumisión.`)
              : i.type === "clinch"
                ? ze("Los peleadores se van al clinch.")
                : i.type === "standup"
                  ? ze("El réferi los pone de pie.")
                  : i.type === "order"
                    ? ze("Orden a tu esquina aplicada.")
                    : i.type === "impact" &&
                        i.outcome === "clean" &&
                        i.damage > 4
                      ? ze(`${e(i.actor)} conecta duro.`)
                      : i.type === "round-end" &&
                        ze(`Fin del round ${i.round}.`);
}
function og(i) {
  const t = i.result;
  if (ni === "career")
    try {
      Dt.applyResult(t);
    } catch (e) {
      alert(e.message);
    }
  (Ri(t.winner === null ? "EMPATE" : `¡${Ks(i, t.winner)} GANA!`),
    ze(`Resultado: ${t.method}.`),
    llofinal(i),
    cg(i));
}
function cg(i) {
  const t = i.result,
    [e, n] = i.fighters,
    s = t.winner === null ? "Empate" : $t(i.fighters[t.winner].profile),
    r = document.getElementById("fight-result"),
    a =
      ni === "career"
        ? jt("Ver historial", "result-continue-history", "dark")
        : jt("Volver al panel", "result-continue-dashboard", "dark"),
    o =
      ni === "exhibition"
        ? jt("Nueva exhibición", "result-continue-exhibition", "secondary")
        : "";
  ((r.innerHTML = `<div class="fight-result-card">
    <div class="eyebrow">RESULTADO FINAL</div>
    <h2>${t.winner === null ? "EMPATE" : `${xt(s).toUpperCase()} GANA`}</h2>
    <p>${xt(t.method)} · Round ${t.round} · ${Vs(t.time)}</p>
    <div class="result-stats"><div><b>${e.stats.landed}/${e.stats.thrown}</b><small>${xt($t(e.profile))} golpes conectados</small></div><div><b>${n.stats.landed}/${n.stats.thrown}</b><small>${xt($t(n.profile))} golpes conectados</small></div></div>
    <div class="result-actions">${a}${o}</div>
  </div>`),
    (r.hidden = !1));
}
function vc() {
  const i = Dt.fighter(),
    t =
      Dt.opponents(i).find((n) => Dt.available(n)) ||
      Dt.state.fighters.find((n) => n.id !== i.id);
  if (!t) {
    alert("No hay rivales disponibles todavía.");
    return;
  }
  const e = new Hs([i, t], {
    seed: Math.floor(Date.now() % 1e6) + 1,
    rounds: 3,
  });
  Ya(e, "exhibition");
}
function lg() {
  let i;
  try {
    i = Dt.prepareFight();
  } catch (t) {
    alert(t.message);
    return;
  }
  Ya(i, "career");
}
function dg(i) {
  const t = Dt.state.results.find((n) => n.id === i);
  if (!t || !t.profiles) {
    alert("Esta repetición ya no está disponible.");
    return;
  }
  const e = new Hs(t.profiles, { seed: t.seed, rounds: t.title ? 5 : 3 });
  Ya(e, "replay");
}
rs.addEventListener("click", async (i) => {
  const t = i.target.closest("[data-action]");
  if (!t) return;
  const e = t.dataset.action,
    n = t.dataset.id;
  switch (e) {
    case "nav":
      t.dataset.page === "tribuna" ? window.Tribuna && window.Tribuna.open("llo") : Ye(t.dataset.page);
      break;
    case "advance":
      try {
        (Dt.advanceDays(7), hn("Han pasado 7 días."));
      } catch (s) {
        alert(s.message);
      }
      Ye("dashboard");
      break;
    case "profile":
      Ye("profile", { id: n });
      break;
    case "division":
      Ye("ranking", { division: n });
      break;
    case "select":
      try {
        Dt.select(n);
      } catch (s) {
        alert(s.message);
      }
      Zn();
      break;
    case "train":
      try {
        const s = Dt.train(n),
          r = Object.entries(s)
            .map(([a, o]) => `${a} +${o.toFixed(1)}`)
            .join(", ");
        hn(
          r
            ? `Campamento completado: ${r}`
            : "Semana de recuperación completada.",
        );
      } catch (s) {
        alert(s.message);
      }
      Zn();
      break;
    case "sign-dialog":
      negDialog("sign", n);
      break;
    case "renew-dialog":
      negDialog("renew", n);
      break;
    case "neg-accept":
      negResult(Number(t.dataset.price));
      break;
    case "offer-yes":
      try {
        (Dt.acceptOffer(n), hn("Peleador vendido."));
      } catch (s) {
        alert(s.message);
      }
      Ye("market");
      break;
    case "offer-counter":
      try {
        hn(
          Dt.counterOffer(n)
            ? "Aceptaron tu contraoferta (+15%)."
            : "Rechazaron tu contraoferta.",
        );
      } catch (s) {
        alert(s.message);
      }
      Ye("market");
      break;
    case "offer-no":
      (Dt.rejectOffer(n), Ye("market"));
      break;
    case "book-dialog": {
      const s = Dt.fighter(n);
      $i(
        `¿Confirmar el combate contra ${$t(s)}? El campamento comienza de inmediato.`,
        () => {
          try {
            (Dt.book(n), Ye("events"));
          } catch (r) {
            alert(r.message);
          }
        },
      );
      break;
    }
    case "cancel-dialog":
      $i(
        `¿Cancelar el combate reservado? Se cobrarán ${Te(1e3)} de gastos de organización.`,
        () => {
          try {
            (Dt.cancelBooking(), Ye("events"));
          } catch (s) {
            alert(s.message);
          }
        },
      );
      break;
    case "reset-dialog":
      $i(
        "¿Reiniciar la carrera por completo? Se perderá todo el progreso guardado.",
        () => {
          (window.localStorage.removeItem("llo-mma-v1"), location.reload());
        },
      );
      break;
    case "export":
    case "ledger-export":
      ng();
      break;
    case "result-details":
      eg(n);
      break;
    case "replay":
      dg(n);
      break;
    case "exhibition":
      vc();
      break;
    case "start-booked":
      lg();
      break;
    case "dialog-close":
    case "dialog-cancel":
      Da();
      break;
    case "dialog-confirm": {
      const s = qa;
      (Da(), s == null || s());
      break;
    }
    case "fight-pause": {
      if (!Ue) break;
      ((Ue.paused = !Ue.paused),
        (t.innerHTML = Ue.paused
          ? `${zt("pause")} Reanudar`
          : `${zt("play")} Pausar`));
      break;
    }
    case "fight-speed": {
      if (!Ue) break;
      ((Ue.speed = Number(t.dataset.value)),
        document
          .querySelectorAll(".speed-group .btn")
          .forEach((s) => s.classList.toggle("active", s === t)));
      break;
    }
    case "fight-sound": {
      if (!Ue) break;
      Ue.audio.enabled
        ? (Ue.audio.mute(), (t.innerHTML = `${zt("volume")} Sonido`))
        : (await Ue.audio.enable(),
          (t.innerHTML = `${zt("volume")} Silenciar`));
      break;
    }
    case "fight-order":
      Pn &&
        !Pn.result &&
        (Pn.order(0, t.dataset.value), Ri("Orden enviada a tu esquina."));
      break;
    case "fight-exit": {
      (Pn && !Pn.result ? confirm("¿Salir sin terminar el combate?") : !0) &&
        Ye(ni === "career" || ni === "replay" ? "events" : "dashboard");
      break;
    }
    case "result-continue-history":
      Ye("history");
      break;
    case "result-continue-dashboard":
      Ye("dashboard");
      break;
    case "result-continue-exhibition":
      vc();
      break;
  }
});
rs.addEventListener("submit", (i) => {
  if (i.target.id === "tactics-form") {
    i.preventDefault();
    const t = new FormData(i.target);
    try {
      (Dt.setTactics({
        focus: t.get("focus"),
        target: t.get("target"),
        pace: t.get("pace"),
        distance: t.get("distance"),
        takedowns: t.get("takedowns"),
        aggression: t.get("aggression"),
        conservation: t.get("conservation"),
      }),
        hn("Plan de pelea guardado."));
    } catch (e) {
      alert(e.message);
    }
  }
  if (i.target.id === "neg-form" && NEG) {
    i.preventDefault();
    const t = Number(new FormData(i.target).get("pct")),
      e = Math.round((NEG.ask * t) / 100),
      n = Dt.negotiate(NEG.kind, NEG.id, e),
      s = document.getElementById("neg-msg");
    if (n.status === "accepted") negResult(n.price);
    else if (n.status === "counter") {
      const r = document.getElementById("neg-form");
      r.querySelector(".dialog-actions").innerHTML =
        `${jt("Rechazar", "dialog-cancel", "secondary", 'type="button"')}${jt(`Aceptar · ${Te(n.price)}`, "neg-accept", "dark", `data-price="${n.price}" type="button"`)}`;
      s.textContent = `Contraoferta: pide ${Te(n.price)}.`;
      r.querySelector(".neg-slider").disabled = !0;
    } else s.textContent = "No acepta esa oferta. Prueba con una cifra más alta.";
  }
});
rs.addEventListener("change", async (i) => {
  if (i.target.id === "roster-filter") {
    const t = i.target.value;
    document.querySelectorAll(".fighter-card").forEach((e) => {
      e.style.display = t === "all" || e.dataset.division === t ? "" : "none";
    });
  }
  if (i.target.id === "import-file") {
    const t = i.target.files[0];
    if (!t) return;
    try {
      (Dt.import(await t.text()),
        hn("Partida importada correctamente."),
        Ye("dashboard"));
    } catch (e) {
      alert(e.message);
    }
    i.target.value = "";
  }
});
rs.addEventListener("input", (i) => {
  if (i.target.classList.contains("neg-slider") && NEG) {
    const t = document.getElementById("neg-val");
    t && (t.textContent = Te(Math.round((NEG.ask * Number(i.target.value)) / 100)));
  }
});
rs.addEventListener("input", (i) => {
  if (i.target.type === "range" && i.target.closest(".tactic-slider")) {
    const t = i.target.parentElement.querySelector("output");
    t && (t.textContent = i.target.value);
  }
});
{
  const TL = window.Touchline;
  if (TL) {
    const paint = () => {
      const t = document.querySelector(".topbar-money");
      t && (t.textContent = Te(Dt.state.money));
    };
    Dt.onMoney = (d) => {
      d > 0 ? TL.addSilver(d) : d < 0 && TL.removeSilver(-d);
    };
    TL.onBalances((b) => {
      b &&
        typeof b.silver == "number" &&
        b.silver !== Dt.state.money &&
        ((Dt.state.money = b.silver), Dt.save(), paint());
    });
    TL.getBalances().then((r) => {
      r &&
        r.ok &&
        r.balances &&
        ((Dt.state.money = r.balances.silver), Dt.save(), paint());
    });
  }
}
Zn();
