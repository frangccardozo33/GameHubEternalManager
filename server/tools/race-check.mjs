import { makeRace } from '../src/vendor/race-core.js';
const t0 = Date.now(); const D = makeRace(null); const c = D.newCareer(); console.log('newCareer', Object.keys(c).length, c.teams.length, D.TRACKS.length, Date.now() - t0, 'ms');
const run = (seed, actions = []) => {
  const t1 = Date.now(); const R = makeRace(JSON.parse(JSON.stringify(c))); console.log('init', Date.now() - t1, 'ms');
  R.seedRng(seed); R.setSimT(0); R.qualify(); R.beginRace();
  const st = R.state; let n = 0;
  const t2 = Date.now();
  while (st.phase !== 'finished' && n < 60 * 3000) { for (const a of actions) if (a.step === n) st.cars[a.car].commands[a.cmd] = a.val; R.stepSim(); n++; }
  console.log('steps', n, 'sec', (n / 60).toFixed(0), 'cpu ms', Date.now() - t2, st.order.slice(0, 3).map((k) => k.driver.short + ':' + (k.finishTime || 0).toFixed(3)).join(' '));
  return st.order.map((k) => k.id).join(',');
};
console.log(run(5)); console.log(run(5)); console.log(run(6));
