// Original joint animation tracks. Seconds are simulation time, including replay snapshots.
const TLMotion = (() => {
  const clamp = (x,a=0,b=1) => Math.max(a,Math.min(b,x));
  const ease = x => { x=clamp(x); return x*x*(3-2*x); };
  function track(t, keys) {
    if(t<=keys[0][0]) return keys[0][1];
    for(let i=1;i<keys.length;i++) if(t<=keys[i][0]) {
      const [a,x]=keys[i-1], [b,y]=keys[i]; return x+(y-x)*ease((t-a)/(b-a));
    }
    return keys[keys.length-1][1];
  }
  // backswing, follow-through, trunk, opening, lateral ankle, crouch, flight.
  const shots = {
    NORMAL_SHOT:[.85,1.05,.15,.18,0,.025,0], POWER_SHOT:[1.45,1.7,.32,.32,0,.07,.10],
    FINESSE_SHOT:[.65,.85,.08,.72,-.48,.035,0], LOW_SHOT:[.8,.9,.38,.1,0,.17,0],
    CHIP_SHOT:[.55,1.2,-.16,.08,0,.04,0], LONG_SHOT:[1.35,1.5,.22,.25,0,.035,.15],
    TRIVELA:[.8,1.1,.12,-.5,.65,.05,0], RABONA:[.85,1.0,.2,-.3,.4,.035,.18],
    VOLLEY:[1.0,1.7,-.12,.6,.18,.02,.34], HALF_VOLLEY:[.7,1.25,.28,.2,0,.12,.03],
    FIRST_TIME:[.35,.85,.15,.1,0,.025,0]
  };
  const at = (p,m) => p.tl?.t ?? m.elapsed-(p.tl?.t0??m.elapsed);
  function shot(md,p,t) {
    const k=p.tl.anim, P=shots[k], c=p.tl.contact||.14;
    const [back,follow,lean,open,ankle,low,jump]=P;
    const w=track(t,[[0,0],[c*.55,1],[c,.2],[c+.14,0],[.75,0]]);
    const strike=track(t,[[0,0],[c*.65,0],[c,.7],[c+.10,1],[.52,.45],[.75,0]]);
    const env=track(t,[[0,0],[c*.6,1],[c+.14,1],[.75,0]]);
    const left=p.preferredFoot==='left'||p.foot==='left';
    const kick=left?md.leftLeg:md.rightLeg, support=left?md.rightLeg:md.leftLeg, side=left?-1:1;
    // Negative hip X swings a downward limb forward. The old placeholder had this reversed.
    kick.pivot.rotation.set(back*w-follow*strike,ankle*env,side*.07);
    kick.lower.rotation.x=track(t,[[0,.1],[c*.55,1.75],[c,.08],[c+.12,.18],[.55,.65],[.75,0]]);
    support.pivot.rotation.set(-.12*w+.14*strike,0,-side*.09);
    support.lower.rotation.x=.25*env;
    md.body.rotation.set(-lean*w+lean*strike,side*(-open*w+open*.6*strike),-side*ankle*.16*env);
    md.body.position.y=-low*env+jump*Math.sin(Math.PI*clamp(t/.5));
    md.leftArm.pivot.rotation.set(-.5*env,0,-.18-(.55+back*.22)*env);
    md.rightArm.pivot.rotation.set(.5*w-.8*strike,0,.18+.48*env);
    md.leftArm.lower.rotation.x=-.45*env; md.rightArm.lower.rotation.x=-.8*env;
    md.head.rotation.x=.13*env;
    if(k==='RABONA') {
      kick.pivot.rotation.z=-side*.78*env;
      kick.pivot.rotation.y=-side*.55*env;
      support.pivot.rotation.z=-side*.32*env;
      md.body.rotation.z=side*.25*env;
    }
    if(k==='CHIP_SHOT') kick.lower.rotation.x=.55*w+.25*strike;
  }
  function header(md,p,t) {
    const c=p.tl.contact||.24, e=track(t,[[0,0],[c*.4,.25],[c,1],[.48,.65],[.65,0],[.75,0]]);
    const hit=track(t,[[0,0],[c*.7,-.28],[c,.28],[c+.1,.42],[.75,0]]);
    md.body.position.y=.65*e-.10*Math.sin(Math.PI*clamp((t-.55)/.2));
    md.body.rotation.x=hit; md.head.rotation.x=hit*.6;
    md.leftLeg.pivot.rotation.x=-.28*e; md.rightLeg.pivot.rotation.x=.22*e;
    md.leftLeg.lower.rotation.x=.8*e; md.rightLeg.lower.rotation.x=.65*e;
    md.leftArm.pivot.rotation.set(-.7*e,0,-.9*e-.14);
    md.rightArm.pivot.rotation.set(-.7*e,0,.9*e+.14);
    md.leftArm.lower.rotation.x=md.rightArm.lower.rotation.x=-.6*e;
  }
  function bicycle(md,p,t) {
    const c=p.tl.contact||.30;
    const spin=track(t,[[0,0],[.08,-.12],[c,-1.7],[.48,-1.53],[.72,-1.35],[1,-.6],[1.2,0]]);
    const lift=track(t,[[0,0],[.10,.25],[c,1.30],[.48,.68],[.65,.20],[.9,.15],[1.2,0]]);
    md.body.rotation.x=spin; md.body.rotation.z=track(t,[[0,0],[.5,0],[.7,.5],[1,.3],[1.2,0]]);
    md.body.position.y=lift;
    md.rightLeg.pivot.rotation.x=track(t,[[0,0],[.13,.7],[c,-1.65],[.5,-.5],[.8,-.9],[1.2,0]]);
    md.leftLeg.pivot.rotation.x=track(t,[[0,0],[.15,-1.0],[c,.65],[.5,-.3],[.85,-1.3],[1.2,0]]);
    md.leftLeg.lower.rotation.x=track(t,[[0,0],[.2,1.1],[c,.35],[.65,1.3],[1.2,0]]);
    md.rightLeg.lower.rotation.x=track(t,[[0,0],[.14,.8],[c,.06],[.65,.9],[1.2,0]]);
    const e=Math.sin(Math.PI*clamp(t/1.2));
    md.leftArm.pivot.rotation.set(-.3*e,0,-1.45*e-.14);
    md.rightArm.pivot.rotation.set(-.3*e,0,1.45*e+.14);
  }
  function skill(md,p,t) {
    const key=p.tl.anim.slice(3), s=p.tl.side||Math.sign(p.moveZ)||1;
    const e=Math.sin(Math.PI*clamp(t)), double=Math.sin(t*Math.PI*2)*e;
    md.body.position.y=-.09*e; md.body.rotation.x=.12*e;
    md.leftLeg.pivot.rotation.x=Math.sin(t*12)*.32*e;
    md.rightLeg.pivot.rotation.x=-Math.sin(t*12)*.32*e;
    md.leftLeg.lower.rotation.x=.35*e; md.rightLeg.lower.rotation.x=.4*e;
    md.leftArm.pivot.rotation.set(-.3*e,0,-.14-.6*e);
    md.rightArm.pivot.rotation.set(-.3*e,0,.14+.6*e);
    md.leftArm.lower.rotation.x=md.rightArm.lower.rotation.x=-.7*e;
    switch(key) {
      case 'roulette': md.body.rotation.y=s*ease(t)*Math.PI*2; md.rightLeg.pivot.rotation.x=-.45*e; md.rightLeg.lower.rotation.x=.7*e; break;
      case 'elastico': md.rightLeg.pivot.rotation.set(-.35*e,s*double*.85,s*double*.5); md.body.rotation.z=-s*double*.25; break;
      case 'croqueta': md.leftLeg.pivot.rotation.z=-.12+s*double*.38; md.rightLeg.pivot.rotation.z=.12+s*double*.38; md.body.rotation.z=-s*double*.18; break;
      case 'nutmeg': md.leftLeg.pivot.rotation.z=-.4*e; md.rightLeg.pivot.rotation.set(-.65*e,0,.35*e); break;
      case 'sombrero': md.rightLeg.pivot.rotation.x=-1.35*e; md.rightLeg.lower.rotation.x=.25*e; md.body.rotation.x=-.22*e; break;
      case 'heelToHeel': md.rightLeg.pivot.rotation.x=double*.8; md.rightLeg.lower.rotation.x=1.2*Math.max(0,double); md.leftLeg.pivot.rotation.x=-.65*Math.max(0,-double); break;
      case 'stepover': md.rightLeg.pivot.rotation.set(-.5*e,s*double*.85,s*double*.5); md.rightLeg.lower.rotation.x=.6*e; break;
      case 'dragBack': md.rightLeg.pivot.rotation.x=-.6*double; md.rightLeg.lower.rotation.x=.2*e; md.body.rotation.x=-.2*e; break;
      case 'ballRoll': md.rightLeg.pivot.rotation.set(-.5*e,0,s*.55*double); md.rightLeg.lower.rotation.x=.35*e; break;
    }
  }
  const slides={CLEAN_SLIDE:[1.1,1.3,.65],LATE_SLIDE:[1.3,1.1,.9],CLEARANCE_SLIDE:[.85,1.6,.55],EMERGENCY_SLIDE:[1.45,1.4,.2],LAST_DITCH_SLIDE:[1.5,1.65,2.5]};
  function slide(md,p,t) {
    const P=slides[p.tl.anim]||slides.CLEAN_SLIDE, s=p.tl.side||Math.sign(p.moveZ)||1;
    const e=track(t,[[0,0],[.10,.2],[.22,1],[.44,1],[.57,.65],[.7,0]]);
    md.body.rotation.set(-.15*e,0,s*P[0]*e);
    md.body.position.y=(.88*(1-Math.cos(P[0]*e))-.53*e);
    md.leftLeg.pivot.rotation.set(-.3*e,0,-s*P[1]*e);
    md.leftLeg.lower.rotation.x=.1*e;
    md.rightLeg.pivot.rotation.set(-.6*e,0,s*.25*e); md.rightLeg.lower.rotation.x=1.6*e;
    md.leftArm.pivot.rotation.set(-.2*e,0,-s*P[2]*e);
    md.rightArm.pivot.rotation.set(-.5*e,0,s*(P[2]>.9?1.6:.3)*e);
    const rise=track(t,[[0,0],[.45,0],[.57,1],[.7,0]]);
    md.body.rotation.x+=.45*rise;
    md.leftArm.pivot.rotation.x-=1.1*rise; md.leftArm.lower.rotation.x=-.5*rise;
    md.rightLeg.lower.rotation.x+=.2*rise;
  }
  function celebrate(md,p,t,idx) {
    const key=p.tl.anim.slice(4), e=ease(t/.35), pulse=Math.sin(t*5+idx*.4);
    md.leftLeg.pivot.rotation.z=-.1;md.rightLeg.pivot.rotation.z=.1;
    md.leftArm.lower.rotation.x=md.rightArm.lower.rotation.x=-.3*e;
    switch(key) {
      case 'knees': md.body.position.y=-.48*e;md.body.rotation.x=-.13*e; md.leftLeg.pivot.rotation.x=md.rightLeg.pivot.rotation.x=-.28*e;md.leftLeg.lower.rotation.x=md.rightLeg.lower.rotation.x=1.55*e; md.leftArm.pivot.rotation.z=-1.5*e;md.rightArm.pivot.rotation.z=1.5*e;break;
      case 'jump': {const j=Math.sin(Math.PI*clamp((t-.1)/.85)); md.body.position.y=.8*j;md.leftLeg.lower.rotation.x=.7*j;md.rightLeg.lower.rotation.x=.55*j;md.rightArm.pivot.rotation.x=-2.8*e;md.rightArm.lower.rotation.x=-.8*e;md.leftArm.pivot.rotation.z=-.75*e;break;}
      case 'sky': md.head.rotation.x=-.3*e;md.rightArm.pivot.rotation.set(-2.9*e,0,.2);md.leftArm.pivot.rotation.z=-.35*e;break;
      case 'brake': md.body.position.y=-.13*e;md.body.rotation.x=.2*e;md.rightArm.pivot.rotation.x=-1.1*e;md.rightArm.lower.rotation.x=-1.5*e;md.leftLeg.pivot.rotation.x=-.35*e;break;
      case 'hug':case 'group': md.body.rotation.x=.08*e;md.body.position.y=.025*pulse;md.leftArm.pivot.rotation.set(-1.2*e,.45*e,-.45*e);md.rightArm.pivot.rotation.set(-1.2*e,-.45*e,.45*e);md.leftArm.lower.rotation.x=md.rightArm.lower.rotation.x=-.8*e;break;
      case 'open':md.leftArm.pivot.rotation.z=-1.65*e;md.rightArm.pivot.rotation.z=1.65*e;md.head.rotation.x=-.12*e;break;
      default:md.leftArm.pivot.rotation.set(-2.7*e,0,-.3);md.rightArm.pivot.rotation.set(-2.7*e,0,.3);md.body.position.y=.06*Math.max(0,pulse)*e;
    }
  }
  function pose(p,md,elapsed,idx,m,replay) {
    md.tlActive=false; if(md.refCard) md.refCard.visible=false;
    if(p.ragdoll) return false;
    if(p.tl) {
      const t=at(p,m), k=p.tl.kind, a=p.tl.anim;
      if(t>=0) {
        if(k==='shot'&&t<(a==='BICYCLE_KICK'?1.2:.75)) {if(a==='HEADER')header(md,p,t);else if(a==='BICYCLE_KICK')bicycle(md,p,t);else if(shots[a])shot(md,p,t);else return false;md.tlActive=true;}
        else if(k==='skill'&&t<1){skill(md,p,t);md.tlActive=true;}
        else if(k==='ref'&&t<(RD[a]||1)){ref(md,p,t,a);md.tlActive=true;}
        else if(k==='slide'&&t<.7){slide(md,p,t);md.tlActive=true;}
        else if(k==='cel'&&(p.state==='Celebrate'||p.state===undefined)&&(m.phase==='goal'||replay)){celebrate(md,p,t,idx);md.tlActive=true;}
      }
    }
    if(!md.tlActive&&!replay&&m.phase==='restart'&&m.restartData) {
      const r=m.restartData;
      if(p.id===r.takerId&&/corner|free/i.test(r.kind)) {
        md.leftArm.pivot.rotation.x=-2.6; md.leftArm.lower.rotation.x=-.2;
        md.body.rotation.x=.07; md.rightLeg.pivot.rotation.x=.15;
        md.tlActive=true;
      } else if(p.role!=='REF'&&p.team!==r.team&&/free/i.test(r.kind)&&Math.hypot(p.x-r.x,p.z-r.z)<12) {
        md.leftArm.pivot.rotation.set(-.35,0,.25);md.rightArm.pivot.rotation.set(-.35,0,-.25);
        md.leftArm.lower.rotation.x=md.rightArm.lower.rotation.x=-.8;md.tlActive=true;
      }
    }
    return md.tlActive;
  }
  // Árbitro: mismas articulaciones que un jugador. Duraciones fijas (también valen en replays).
  const RD={REF_WHISTLE:.9,REF_WHISTLE_LONG:1.6,REF_YELLOW:2.6,REF_RED:2.6,REF_POINT_CENTER:1.8,REF_POINT_SPOT:1.8};
  function ref(md,p,t,a) {
    const d=RD[a], win=(i,o)=>track(t,[[0,0],[i,1],[d-o,1],[d,0]]);
    if(a==='REF_WHISTLE'||a==='REF_WHISTLE_LONG') {
      const up=win(.2,.25);
      md.rightArm.pivot.rotation.set(-1.75*up,0,.15*up); md.rightArm.lower.rotation.x=-2.1*up;
      md.body.rotation.x=-.05*up; md.head.rotation.x=-.12*up;
      if(a==='REF_WHISTLE_LONG') { md.leftArm.pivot.rotation.set(-2.9*up,0,-.2*up); md.leftArm.lower.rotation.x=-.1*up; }
    } else if(a==='REF_YELLOW'||a==='REF_RED') {
      const up=track(t,[[0,0],[.4,1],[2.1,1],[2.6,0]]);
      md.rightArm.pivot.rotation.set(-3.05*up,0,.12*up); md.rightArm.lower.rotation.x=-.1*up;
      md.leftArm.pivot.rotation.set(-.5*up,0,-.35*up); md.leftArm.lower.rotation.x=-1.0*up;
      md.body.rotation.x=-.06*up; md.head.rotation.x=.05*up;
      if(md.refCard){md.refCard.visible=up>.05;md.refCard.material.color.set(a==='REF_RED'?'#e11d1d':'#facc15');}
    } else {
      const up=win(.35,.4);
      md.rightArm.pivot.rotation.set(-1.5*up,0,.1*up); md.rightArm.lower.rotation.x=0;
      md.leftArm.pivot.rotation.set(-.2*up,0,-.2*up);
      md.body.rotation.y=(a==='REF_POINT_SPOT'?.12:-.1)*up; md.body.rotation.x=.04*up;
    }
  }
  return {pose,track,shots,slides};
})();
