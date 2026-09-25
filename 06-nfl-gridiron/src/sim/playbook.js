// Routes are spatial data relative to the receiver's formation origin, not animations.
export const ROUTES = {
  slant: [[0, 3], [-5, 8], [-12, 15]], curl: [[0, 11], [0, 8]],
  out: [[0, 8], [7, 8]], comeback: [[0, 14], [4, 11]],
  post: [[0, 12], [-9, 26], [-15, 38]], corner: [[0, 11], [8, 24]],
  streak: [[0, 16], [0, 38], [0, 60]], mesh: [[0, 4], [-22, 5]],
  shallow: [[0, 2], [-25, 3]], screen: [[2, -1], [5, -2]],
  check: [[3, 0], [5, 4], [5, 7]], seam: [[-1, 10], [-2, 25]],
};
const pass = (id, name, routes, personnel = '11', extra = {}) => ({ id, name, type: 'pass', routes, personnel, formation: 'Shotgun', ...extra });
export const PLAYBOOK = [
  ...['inside-zone','outside-zone','power','counter'].map((id, i) => ({ id, name: ['Inside zone','Outside zone','Power right','Counter left'][i], type: 'run', personnel: i > 1 ? '21' : '12', formation: i > 1 ? 'I-Form' : 'Singleback', gap: [0, 6, 3, -4][i] })),
  pass('slant','Quick slants',['slant','slant','out','seam','check']),
  pass('curl','Curl flat',['curl','out','curl','seam','check']),
  pass('out','Double out',['out','out','streak','seam','check']),
  pass('comeback','Comeback',['comeback','curl','streak','out','check']),
  pass('post','Post dig',['post','curl','out','seam','check']),
  pass('corner','Smash corner',['corner','curl','post','out','check'],'12'),
  pass('streak','Four verticals',['streak','streak','seam','seam','check']),
  pass('mesh','Mesh concept',['mesh','mesh','corner','seam','check']),
  pass('shallow','Shallow cross',['shallow','post','curl','out','check']),
  pass('screen','RB screen',['streak','streak','out','seam','screen'],'11',{ screen: true }),
  pass('play-action','PA cross',['post','shallow','corner','seam','check'],'12',{ playAction: true }),
  pass('rpo','Zone / slant RPO',['slant','out','streak','seam','check'],'11',{ rpo: true, gap: 1 }),
];
export const DEFENSES = ['Man', 'Cover 1', 'Cover 2', 'Cover 3', 'Cover 4', 'Blitz', 'Zone blitz'];
export function choosePlay(drive, clock, team, rng) {
  const { down, distance, spot, score, offense } = drive;
  const losing = score[offense] < score[1 - offense];
  const urgency = clock.quarter === 4 && clock.remaining < 120 && losing;
  if (down === 4) {
    if (spot > 57 && !(urgency && score[1-offense] - score[offense] > 3)) return { id:'field-goal', name:'Field goal', type:'field-goal', personnel:'12', formation:'Special teams' };
    if (!(distance < 2 && spot > 43) && !urgency) return { id:'punt', name:'Punt', type:'punt', personnel:'12', formation:'Punt unit' };
  }
  let runChance = { 'RUN HEAVY': .66, 'PASS HEAVY': .28, BALANCED: .46, 'DEEP PASS': .29, 'QUICK PASS': .3 }[team.style];
  if (distance <= 3) runChance += .22;
  if (down >= 3 && distance > 6) runChance -= .3;
  if (urgency) runChance = .08;
  if (clock.quarter === 4 && clock.remaining < 120 && !losing) runChance += .25;
  if (spot > 95) runChance += .12;
  if (rng.chance(runChance)) return { ...rng.pick(PLAYBOOK.filter(p => p.type === 'run')) };
  let options = PLAYBOOK.filter(p => p.type === 'pass');
  if (distance <= 4 || spot > 92 || team.style === 'QUICK PASS') options = options.filter(p => ['slant','mesh','out','screen','rpo'].includes(p.id));
  else if (distance >= 12 || team.style === 'DEEP PASS') options = options.filter(p => ['post','corner','streak','comeback','play-action'].includes(p.id));
  return { ...rng.pick(options) };
}
export function chooseDefense(drive, style, rng) {
  let choices = ['Cover 1', 'Cover 2', 'Cover 3', 'Man'];
  if (style === 'PRESSURE') choices.push('Blitz','Zone blitz','Blitz');
  if (style === 'COVERAGE' || drive.distance > 10) choices.push('Cover 4','Cover 3','Cover 2');
  if (drive.distance < 3 || style === 'RUN STOP') choices.push('Blitz','Cover 1');
  return rng.pick(choices);
}
export function routePoints(name, start) {
  const side = start.x <= 0 ? -1 : 1;
  return (ROUTES[name] || ROUTES.check).map(([x,z]) => ({ x: Math.max(-25.5, Math.min(25.5, start.x + x * side)), z: Math.min(108, start.z + z) }));
}
