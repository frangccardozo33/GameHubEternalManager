import { askFor, evaluateOffer, signFreeAgent, renewPlayer, canSign, offerValue, capSpace, payroll } from '../manager/economy.js';
import { marketValue, capHit, fmtM, SALARY_CAP } from '../manager/constants.js';
import { esc, ovrBadge, posTag } from './kit.js';
import { r1 } from '../manager/util.js';

// Contract negotiation modal used for free agents and renewals.
export function openNegotiation(app, pid, mode = 'sign') {
  const lg = app.lg, p = lg.player(pid), t = lg.user, ask = askFor(lg, p, t.id);
  const st = { salary: ask.salary, years: ask.years, bonus: ask.bonus, msg: '', tone: '' };
  const view = () => {
    const o = { salary: +st.salary || 0, years: Math.max(1, Math.min(5, Math.round(+st.years) || 1)), bonus: +st.bonus || 0 }, hit = offerValue(o), replacing = mode === 'renew' ? p : null;
    const delta = hit - (replacing ? capHit(replacing) : 0), after = capSpace(lg, t) - delta;
    return `<div class="mm neg"><h3>${mode === 'renew' ? 'Renovar contrato' : 'Negociar fichaje'}</h3>
     <div class="neg-p">${posTag(p.pos)} <b>${esc(p.name)}</b> ${ovrBadge(p.ovr)} <small>${p.age} años · pot. ${p.potential}</small></div>
     <div class="neg-facts"><span>Valor de mercado <b>${fmtM(marketValue(p))}</b></span><span>Pide <b>${fmtM(offerValue(ask))}</b>/año</span><span>Moral <b>${Math.round(p.morale)}</b></span></div>
     <div class="neg-grid"><label>Salario anual (M$)<input type="number" step="0.1" min="0.7" data-input="neg-input" data-k="salary" value="${st.salary}"></label>
      <label>Años (1-5)<input type="number" step="1" min="1" max="5" data-input="neg-input" data-k="years" value="${st.years}"></label>
      <label>Bonus de firma total (M$)<input type="number" step="0.1" min="0" data-input="neg-input" data-k="bonus" value="${st.bonus}"></label></div>
     <div class="neg-sum"><span>Costo anual: <b>${fmtM(hit)}</b></span><span>Coste total: <b>${fmtM(o.salary * o.years + o.bonus)}</b></span></div>
     <div class="neg-msg ${st.tone}">${esc(st.msg)}</div>
     <div class="mm-actions"><button class="btn" data-act="modal-close">Cancelar</button><button class="btn primary" data-act="neg-offer">Hacer oferta</button></div></div>`;
  };
  const paint = () => app.modal(view());
  app.modalHandlers = {
    'neg-offer'() {
      const o = { salary: +st.salary, years: Math.max(1, Math.min(5, Math.round(+st.years))), bonus: +st.bonus || 0 };
      const res = mode === 'renew' ? renewPlayer(lg, t.id, pid, o) : signFreeAgent(lg, t.id, pid, o);
      if (res.ok) { app.closeModal(); app.toast(res.message); app.commit(); app.refresh(); return; }
      if (res.status === 'counter') { st.salary = res.counter.salary; st.bonus = res.counter.bonus; st.years = res.counter.years; st.tone = 'warn'; st.msg = res.message + ' Contraoferta cargada: puedes aceptarla pulsando "Hacer oferta".'; }
      else { st.tone = 'bad'; st.msg = res.message; }
      paint();
    },
  };
  app.modalInputs = { input: { 'neg-input'(a, el) { st[el.dataset.k] = el.value; st.msg = ''; const sums = document.querySelector('.neg-sum'); if (sums) { const o = { salary: +st.salary || 0, years: Math.max(1, Math.round(+st.years) || 1), bonus: +st.bonus || 0 }, hit = offerValue(o), delta = hit - (mode === 'renew' ? capHit(p) : 0), after = capSpace(lg, t) - delta; sums.innerHTML = `<span>Costo anual: <b>${fmtM(hit)}</b></span><span>Coste total: <b>${fmtM(o.salary * o.years + o.bonus)}</b></span>`; } } }, change: {} };
  paint();
}
