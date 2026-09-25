import { ATTRIBUTES } from '../simulation/model.js';
export { ATTRIBUTES };
export const ROLES = ['PG', 'SG', 'SF', 'PF', 'C'];
export const ATTR_LABELS = { speed: 'Velocidad', acceleration: 'Aceleración', handling: 'Manejo', passing: 'Pase', shooting: 'Tiro', two: 'Media distancia', three: 'Triple', finishing: 'Finalización', defense: 'Defensa exterior', interiorDefense: 'Defensa interior', rebounding: 'Rebote', vision: 'Visión', decisions: 'Decisiones', physical: 'Físico', stamina: 'Resistencia' };
export const ATTR_GROUPS = { 'Físico': ['speed', 'acceleration', 'physical', 'stamina'], 'Ataque': ['shooting', 'two', 'three', 'finishing', 'handling'], 'Creación': ['passing', 'vision', 'decisions'], 'Defensa': ['defense', 'interiorDefense', 'rebounding'] };
// Pesos para calcular el OVR según la posición (orden de ATTRIBUTES).
const W = {
  PG: [.8, .7, 1.5, 1.4, .8, .7, 1.0, .6, .8, .1, .1, 1.3, 1.2, .2, .7], SG: [.8, .7, 1.0, .7, 1.2, 1.1, 1.4, .9, .8, .1, .2, .6, .8, .3, .7],
  SF: [.8, .7, .6, .6, .9, 1.0, 1.0, 1.0, 1.0, .4, .5, .6, .8, .7, .7], PF: [.5, .5, .3, .5, .6, .9, .6, 1.1, .9, 1.1, 1.2, .5, .8, 1.0, .6],
  C: [.3, .3, .2, .4, .3, .7, .2, 1.2, .8, 1.5, 1.5, .4, .7, 1.3, .5],
};
export const OVR_W = Object.fromEntries(Object.entries(W).map(([k, v]) => { const t = v.reduce((a, b) => a + b, 0); return [k, v.map(x => x / t)]; }));
export const POS_NAMES = { PG: 'Base', SG: 'Escolta', SF: 'Alero', PF: 'Ala-pívot', C: 'Pívot' };
export const TEAM_ROLES = { star: ['Estrella', 0.78], starter: ['Titular', 0.68], sixth: ['Sexto hombre', 0.5], rotation: ['Rotación', 0.32], bench: ['Reserva', 0.1], prospect: ['Prospecto', 0.05] };
export const USAGE = { low: ['Bajo', 0.85], normal: ['Normal', 1], high: ['Alto', 1.15], star: ['Referente', 1.3] };
export const TEAM_POOL = [
  ['Metro', 'Foxes', 'FOX', '#ed743e', '#22313a'], ['Coastal', 'Waves', 'WAV', '#62b9b8', '#e9edf0'], ['Harbor', 'Kings', 'HAR', '#d9b44a', '#1c2a4a'],
  ['Summit', 'Wolves', 'SUM', '#7d8fc9', '#e9edf0'], ['Desert', 'Vipers', 'DES', '#c9524a', '#e9edf0'], ['Bay', 'Falcons', 'BAY', '#5aa66f', '#e9edf0'],
  ['Iron City', 'Forge', 'IRO', '#8c95a3', '#1d2330'], ['Northern', 'Storm', 'NOR', '#a56fd0', '#e9edf0'], ['Lakeside', 'Herons', 'LAK', '#4fb3d9', '#1d2330'],
  ['Capital', 'Stags', 'CAP', '#b5754a', '#e9edf0'], ['Valley', 'Rangers', 'VAL', '#3f8f8b', '#f0e6c8'], ['Sunset', 'Coyotes', 'SUN', '#d64f8b', '#e9edf0'],
];
export const FIRST = 'Daniel Marcus Julian Andre Nico Luis Iker Tomas Ethan Malik Samuel Hugo Diego Kevin Ryan Omar Felix Mateo Jonas Ivan Leo Adrian Bruno Caleb Dario Elias Gabriel Isaac Jamal Kai Lucas Marco Noah Oscar Pablo Rafael Sergio Theo Victor Xavier Yusuf Zane Anton Bastian Cyrus Emil Fabian Gael Hector'.split(' ');
export const LAST = 'Vega Brooks Silva Carter Okafor Reed Martin Young Hayes Cruz Williams Sato Diallo Cole Torres Park Navarro Quinn Rivera Stone Adeyemi Bianchi Castillo Dumont Eriksen Fontaine Guzman Holt Ibarra Jensen Kovac Lang Morales Novak Ortega Pereira Quintero Rossi Salazar Tanaka Umar Valdez Weber Yildiz Zhou Alvarez Benitez Costa Duarte Escobar Ferrer Gallo Herrera Ito Jimenez Keller Lopez Mendes Nunez Ochoa Paredes'.split(' ');
