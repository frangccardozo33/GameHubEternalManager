import { ATTRIBUTES } from '../simulation/model.js';
import { CLUBS } from '../../../assets/common/clubs.mjs';
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
// Cartas de jugador: 2 bases cosméticas (libres, ilimitadas) + 10 especiales (mismo catálogo/lógica que fútbol,
// traducido a básquet). Las especiales no se compran: salen como drop de partidos brillantes (ver rollCardDrop en
// game.js), son instancias con dueño propio (el equipo) y usos limitados; cada `logic` es un efecto de juego real.
export const EDITIONS = [
  { id: 'callejera', name: 'Cancha Callejera', stars: 3 }, { id: 'bronce', name: 'Bronce', stars: 3 },
  { id: 'plata', name: 'Plata', stars: 4, special: true, uses: 20, logic: 'boost', boost: 2 },
  { id: 'oro', name: 'Oro de la Cancha', stars: 4, special: true, uses: 20, logic: 'boost', boost: 3 },
  { id: 'idolo', name: 'Ídolo de la Ciudad', stars: 4, special: true, uses: 20, logic: 'immune' },
  { id: 'debut', name: 'Primera Convocatoria', stars: 4, special: true, uses: 20, logic: 'xp' },
  { id: 'rivalidad', name: 'Noche de Rivalidad', stars: 5, special: true, uses: 5, logic: 'derby', boost: 6 },
  { id: 'apertura', name: 'Apertura de Temporada', stars: 5, special: true, uses: 5, logic: 'opener', boost: 6 },
  { id: 'capitan', name: 'Capitán Eterno', stars: 5, special: true, uses: 5, logic: 'consistency' },
  { id: 'anillo', name: 'El Anillo', stars: 5, special: true, uses: 5, logic: 'cup', boost: 6 },
  { id: 'archivo', name: 'Leyenda del Archivo', stars: 4, special: true, uses: 20, logic: 'veteran' },
  { id: 'leyenda', name: 'Última Leyenda', stars: 5, special: true, uses: 5, logic: 'legend', boost: 5 },
];
export const USAGE = { low: ['Bajo', 0.85], normal: ['Normal', 1], high: ['Alto', 1.15], star: ['Referente', 1.3] };
export const TEAM_POOL = CLUBS.slice(0, 12).map(c => [c.bkt.city, c.bkt.nick, c.bkt.short, c.color, '#e9edf0', c.logo]);
export const FIRST = 'Daniel Marcus Julian Andre Nico Luis Iker Tomas Ethan Malik Samuel Hugo Diego Kevin Ryan Omar Felix Mateo Jonas Ivan Leo Adrian Bruno Caleb Dario Elias Gabriel Isaac Jamal Kai Lucas Marco Noah Oscar Pablo Rafael Sergio Theo Victor Xavier Yusuf Zane Anton Bastian Cyrus Emil Fabian Gael Hector'.split(' ');
export const LAST = 'Vega Brooks Silva Carter Okafor Reed Martin Young Hayes Cruz Williams Sato Diallo Cole Torres Park Navarro Quinn Rivera Stone Adeyemi Bianchi Castillo Dumont Eriksen Fontaine Guzman Holt Ibarra Jensen Kovac Lang Morales Novak Ortega Pereira Quintero Rossi Salazar Tanaka Umar Valdez Weber Yildiz Zhou Alvarez Benitez Costa Duarte Escobar Ferrer Gallo Herrera Ito Jimenez Keller Lopez Mendes Nunez Ochoa Paredes'.split(' ');
