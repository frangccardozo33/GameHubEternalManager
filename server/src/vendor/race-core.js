// GENERADO por server/tools/build-race.mjs (no editar). Motor de carreras de LRO como módulo ES (sin DOM ni WebGL).
import { DM } from '../../../assets/common/dmath.mjs';
import * as THREE_NS from '../../../07-carreras-apex/vendor/three.min.js';
import { makeEnv } from './race-stubs.js';
const THREE_REAL = globalThis.THREE || THREE_NS.default || THREE_NS;
// Career: partida (JSON) que el motor lee. Sin Career solo se arma el modelo de datos (para crear una liga nueva).
export function makeRace(CareerIn) {
  const { window, document, localStorage } = makeEnv(THREE_REAL);
  const Career = CareerIn, THREE = window.THREE;
  const requestAnimationFrame = () => 0, performance = globalThis.performance || { now: () => Date.now() };
  const navigator = window.navigator, AudioContext = window.AudioContext, webkitAudioContext = window.webkitAudioContext, getComputedStyle = window.getComputedStyle, fetch = undefined, Blob = window.Blob, URL = window.URL, Image = window.Image, ResizeObserver = window.ResizeObserver, MutationObserver = window.MutationObserver, IntersectionObserver = window.IntersectionObserver, cancelAnimationFrame = () => {}, matchMedia = window.matchMedia, screen = window.screen, history = window.history, location = window.location, self = window;
  if (!Career) { let SIMT = 0, RS = 1, HALFHIT = false;
  const SRAND = () => { let t = (RS += 0x6D2B79F5) >>> 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  
  // BASE DE PILOTOS DE LRO — generada por assets/roster/tools/build_racing_roster.py (no editar a mano).
  // Índices 0-9: titulares de los 10 equipos; 10-19: segundos pilotos; el resto: mercado. n nombre, s apellido corto, num número, c nación, a edad, p personalidad, st 8 stats (punta, aceleración, frenada, curva, control, agresividad, consistencia, adelantamiento), ph retrato.
  window.LRO_ROSTER = {"version":1,"placeholder":"assets/players/placeholder.webp","drivers":[{"id":"a_bonellinicolas","n":"Nicolás Bonelli","s":"BONELLI","num":"76","c":"PER","a":39,"p":"AGGRESSIVE","st":[0.85,0.88,0.91,0.86,0.84,0.92,0.82,0.89],"ph":"assets/players/racing/a_bonellinicolas.webp","k":"actc"},{"id":"g_simonreicher","n":"Simon Reicher","s":"REICHER","num":"43","c":"MRG","a":26,"p":"AGGRESSIVE","st":[0.9,0.86,0.84,0.89,0.81,0.92,0.76,0.89],"ph":"assets/players/racing/g_simonreicher.webp","k":"gt"},{"id":"a_ardussofacundo","n":"Facundo Ardusso","s":"ARDUSSO","num":"51","c":"VAL","a":39,"p":"DEFENSIVE","st":[0.85,0.9,0.88,0.91,0.92,0.81,0.92,0.86],"ph":"assets/players/racing/a_ardussofacundo.webp","k":"actc"},{"id":"a_wernermariano","n":"Mariano Werner","s":"WERNER","num":"52","c":"VAL","a":40,"p":"AGGRESSIVE","st":[0.88,0.9,0.92,0.9,0.85,0.96,0.9,0.97],"ph":"assets/players/racing/a_wernermariano.webp","k":"actc"},{"id":"a_todinogerman","n":"Germán Todino","s":"TODINO","num":"73","c":"VAL","a":41,"p":"TYRE SAVER","st":[0.87,0.86,0.87,0.87,0.85,0.85,0.95,0.84],"ph":"assets/players/racing/a_todinogerman.webp","k":"actc"},{"id":"a_canapinoagustin","n":"Agustín Canapino","s":"A. CANAPINO","num":"01","c":"VAL","a":36,"p":"TYRE SAVER","st":[0.91,0.91,0.91,0.96,0.98,0.85,0.95,0.89],"ph":"assets/players/racing/a_canapinoagustin.webp","k":"actc"},{"id":"g_bengreen","n":"Ben Green","s":"GREEN","num":"12","c":"MRG","a":39,"p":"RISK TAKER","st":[0.89,0.85,0.87,0.9,0.84,0.94,0.83,0.86],"ph":"assets/players/racing/g_bengreen.webp","k":"gt"},{"id":"g_frederikschandorff","n":"Frederik Schandorff","s":"SCHANDORFF","num":"14","c":"OVM","a":30,"p":"RISK TAKER","st":[0.92,0.86,0.82,0.85,0.85,0.96,0.81,0.88],"ph":"assets/players/racing/g_frederikschandorff.webp","k":"gt"},{"id":"a_santerojulian","n":"Julián Santero","s":"SANTERO","num":"06","c":"PER","a":38,"p":"AGGRESSIVE","st":[0.9,0.88,0.88,0.88,0.89,0.93,0.82,0.95],"ph":"assets/players/racing/a_santerojulian.webp","k":"actc"},{"id":"g_kobepauwels","n":"Kobe Pauwels","s":"PAUWELS","num":"42","c":"MEL","a":22,"p":"AGGRESSIVE","st":[0.9,0.8,0.85,0.86,0.83,0.95,0.78,0.91],"ph":"assets/players/racing/g_kobepauwels.webp","k":"gt"},{"id":"g_maximerobin","n":"Maxime Robin","s":"ROBIN","num":"91","c":"OVM","a":26,"p":"AGGRESSIVE","st":[0.87,0.88,0.79,0.84,0.82,0.95,0.81,0.93],"ph":"assets/players/racing/g_maximerobin.webp","k":"gt"},{"id":"g_arjunmaini","n":"Arjun Maini","s":"MAINI","num":"24","c":"GRA","a":28,"p":"AGGRESSIVE","st":[0.84,0.85,0.84,0.84,0.8,0.9,0.77,0.88],"ph":"assets/players/racing/g_arjunmaini.webp","k":"gt"},{"id":"g_chrisfroggatt","n":"Chris Froggatt","s":"FROGGATT","num":"03","c":"KAI","a":33,"p":"WET SPECIALIST","st":[0.87,0.83,0.85,0.87,0.88,0.79,0.92,0.86],"ph":"assets/players/racing/g_chrisfroggatt.webp","k":"gt"},{"id":"g_gabrielrindone","n":"Gabriel Rindone","s":"RINDONE","num":"08","c":"MRG","a":54,"p":"TYRE SAVER","st":[0.84,0.8,0.86,0.8,0.82,0.82,0.88,0.88],"ph":"assets/players/racing/g_gabrielrindone.webp","k":"gt"},{"id":"a_martineztobias","n":"Tobías Martínez","s":"MARTÍNEZ","num":"95","c":"PER","a":28,"p":"WET SPECIALIST","st":[0.82,0.83,0.85,0.89,0.92,0.8,0.83,0.87],"ph":"assets/players/racing/a_martineztobias.webp","k":"actc"},{"id":"a_tetijeronimo","n":"Jerónimo Teti","s":"TETI","num":"57","c":"PER","a":34,"p":"RISK TAKER","st":[0.88,0.84,0.85,0.85,0.8,0.94,0.78,0.85],"ph":"assets/players/racing/a_tetijeronimo.webp","k":"actc"},{"id":"g_benjamingoethe","n":"Benjamin Goethe","s":"GOETHE","num":"30","c":"OVM","a":23,"p":"RISK TAKER","st":[0.88,0.87,0.82,0.84,0.81,0.94,0.76,0.87],"ph":"assets/players/racing/g_benjamingoethe.webp","k":"gt"},{"id":"a_ledesmachristian","n":"Christian Ledesma","s":"LEDESMA","num":"47","c":"PER","a":46,"p":"RISK TAKER","st":[0.86,0.8,0.85,0.86,0.81,0.9,0.84,0.89],"ph":"assets/players/racing/a_ledesmachristian.webp","k":"actc"},{"id":"a_spataroemiliano","n":"Emiliano Spataro","s":"SPATARO","num":"56","c":"VAL","a":36,"p":"RISK TAKER","st":[0.86,0.85,0.81,0.87,0.83,0.93,0.82,0.91],"ph":"assets/players/racing/a_spataroemiliano.webp","k":"actc"},{"id":"a_lambirismauricio","n":"Mauricio Lambiris","s":"LAMBIRIS","num":"20","c":"PER","a":41,"p":"QUALIFYING SPECIALIST","st":[0.89,0.85,0.85,0.9,0.88,0.78,0.86,0.8],"ph":"assets/players/racing/a_lambirismauricio.webp","k":"actc"},{"id":"g_markuswinkelhock","n":"Markus Winkelhock","s":"WINKELHOCK","num":"67","c":"MRG","a":46,"p":"DEFENSIVE","st":[0.83,0.81,0.84,0.81,0.87,0.76,0.85,0.79],"ph":"assets/players/racing/g_markuswinkelhock.webp","k":"gt"},{"id":"g_colincaresani","n":"Colin Caresani","s":"CARESANI","num":"64","c":"KAI","a":38,"p":"AGGRESSIVE","st":[0.73,0.78,0.77,0.79,0.76,0.82,0.74,0.85],"ph":"assets/players/racing/g_colincaresani.webp","k":"gt"},{"id":"g_dylanmedler","n":"Dylan Medler","s":"MEDLER","num":"74","c":"IBE","a":42,"p":"WET SPECIALIST","st":[0.78,0.8,0.83,0.87,0.9,0.81,0.81,0.84],"ph":"assets/players/racing/g_dylanmedler.webp","k":"gt"},{"id":"g_alessiopicariello","n":"Alessio Picariello","s":"PICARIELLO","num":"18","c":"MRG","a":33,"p":"WET SPECIALIST","st":[0.74,0.75,0.79,0.81,0.83,0.76,0.84,0.8],"ph":"assets/players/racing/g_alessiopicariello.webp","k":"gt"},{"id":"g_josephloake","n":"Joseph Loake","s":"LOAKE","num":"45","c":"KAI","a":41,"p":"WET SPECIALIST","st":[0.76,0.73,0.72,0.76,0.78,0.7,0.77,0.78],"ph":"assets/players/racing/g_josephloake.webp","k":"gt"},{"id":"g_bendoerr","n":"Ben Doerr","s":"B. DOERR","num":"90","c":"MRG","a":21,"p":"QUALIFYING SPECIALIST","st":[0.8,0.83,0.81,0.76,0.77,0.77,0.73,0.78],"ph":"assets/players/racing/g_bendoerr.webp","k":"gt"},{"id":"g_lorisspinelli","n":"Loris Spinelli","s":"SPINELLI","num":"54","c":"MEL","a":31,"p":"CONSISTENT","st":[0.79,0.74,0.75,0.82,0.81,0.75,0.9,0.75],"ph":"assets/players/racing/g_lorisspinelli.webp","k":"gt"},{"id":"g_jameskellett","n":"James Kellett","s":"KELLETT","num":"99","c":"MRG","a":39,"p":"CONSISTENT","st":[0.74,0.76,0.76,0.78,0.77,0.74,0.81,0.73],"ph":"assets/players/racing/g_jameskellett.webp","k":"gt"},{"id":"g_lucaengstler","n":"Luca Engstler","s":"ENGSTLER","num":"09","c":"OVM","a":31,"p":"AGGRESSIVE","st":[0.8,0.78,0.76,0.81,0.79,0.86,0.77,0.85],"ph":"assets/players/racing/g_lucaengstler.webp","k":"gt"},{"id":"g_christianhahn","n":"Christian Hahn","s":"HAHN","num":"02","c":"MRG","a":38,"p":"TYRE SAVER","st":[0.72,0.73,0.78,0.74,0.74,0.74,0.82,0.73],"ph":"assets/players/racing/g_christianhahn.webp","k":"gt"},{"id":"g_oliversoderstrom","n":"Oliver Soderstrom","s":"SODERSTROM","num":"25","c":"OVM","a":28,"p":"RISK TAKER","st":[0.84,0.8,0.82,0.8,0.81,0.86,0.77,0.86],"ph":"assets/players/racing/g_oliversoderstrom.webp","k":"gt"},{"id":"a_decarlodiego","n":"Diego De Carlo","s":"CARLO","num":"62","c":"PER","a":50,"p":"WET SPECIALIST","st":[0.75,0.79,0.8,0.83,0.88,0.73,0.79,0.82],"ph":"assets/players/racing/a_decarlodiego.webp","k":"actc"},{"id":"g_rolfineichen","n":"Rolf Ineichen","s":"INEICHEN","num":"41","c":"MRG","a":42,"p":"DEFENSIVE","st":[0.85,0.83,0.85,0.84,0.84,0.74,0.87,0.83],"ph":"assets/players/racing/g_rolfineichen.webp","k":"gt"},{"id":"a_moscardininicolas","n":"Nicolás Moscardini","s":"MOSCARDINI","num":"05","c":"VAL","a":36,"p":"AGGRESSIVE","st":[0.79,0.81,0.79,0.83,0.81,0.87,0.79,0.86],"ph":"assets/players/racing/a_moscardininicolas.webp","k":"actc"},{"id":"g_alexeynesov","n":"Alexey Nesov","s":"NESOV","num":"65","c":"KAI","a":38,"p":"QUALIFYING SPECIALIST","st":[0.81,0.84,0.85,0.84,0.84,0.82,0.77,0.8],"ph":"assets/players/racing/g_alexeynesov.webp","k":"gt"},{"id":"g_arthurdorison","n":"Arthur Dorison","s":"DORISON","num":"36","c":"IBE","a":18,"p":"DEFENSIVE","st":[0.76,0.79,0.77,0.79,0.76,0.66,0.85,0.77],"ph":"assets/players/racing/g_arthurdorison.webp","k":"gt"},{"id":"g_giacomopetrobelli","n":"Giacomo Petrobelli","s":"PETROBELLI","num":"40","c":"KAI","a":51,"p":"WET SPECIALIST","st":[0.77,0.79,0.84,0.82,0.85,0.78,0.84,0.71],"ph":"assets/players/racing/g_giacomopetrobelli.webp","k":"gt"},{"id":"a_serranomartin","n":"Martín Serrano","s":"SERRANO","num":"61","c":"PER","a":34,"p":"RISK TAKER","st":[0.79,0.81,0.74,0.82,0.74,0.85,0.71,0.79],"ph":"assets/players/racing/a_serranomartin.webp","k":"actc"},{"id":"a_risattiricardo","n":"Ricardo Risatti","s":"RISATTI","num":"78","c":"VAL","a":34,"p":"CONSISTENT","st":[0.76,0.78,0.82,0.78,0.76,0.78,0.81,0.74],"ph":"assets/players/racing/a_risattiricardo.webp","k":"actc"},{"id":"a_azardiego","n":"Diego Azar","s":"AZAR","num":"80","c":"VAL","a":34,"p":"CONSISTENT","st":[0.76,0.78,0.78,0.81,0.78,0.73,0.87,0.73],"ph":"assets/players/racing/a_azardiego.webp","k":"actc"},{"id":"g_marcosorensen","n":"Marco Sorensen","s":"SORENSEN","num":"87","c":"OVM","a":36,"p":"AGGRESSIVE","st":[0.79,0.8,0.77,0.79,0.77,0.85,0.74,0.9],"ph":"assets/players/racing/g_marcosorensen.webp","k":"gt"},{"id":"g_alexfontana","n":"Alex Fontana","s":"A. FONTANA","num":"98","c":"MRG","a":34,"p":"DEFENSIVE","st":[0.81,0.82,0.82,0.85,0.82,0.73,0.85,0.7],"ph":"assets/players/racing/g_alexfontana.webp","k":"gt"},{"id":"g_calanwilliams","n":"Calan Williams","s":"WILLIAMS","num":"81","c":"KAI","a":26,"p":"WET SPECIALIST","st":[0.7,0.74,0.76,0.81,0.82,0.68,0.75,0.75],"ph":"assets/players/racing/g_calanwilliams.webp","k":"gt"},{"id":"g_alfredohernandez","n":"Alfredo Hernandez","s":"HERNANDEZ","num":"26","c":"TAM","a":36,"p":"TYRE SAVER","st":[0.76,0.81,0.82,0.83,0.88,0.79,0.79,0.79],"ph":"assets/players/racing/g_alfredohernandez.webp","k":"gt"},{"id":"g_conradlaursen","n":"Conrad Laursen","s":"LAURSEN","num":"97","c":"GRA","a":35,"p":"DEFENSIVE","st":[0.77,0.82,0.78,0.85,0.86,0.71,0.88,0.8],"ph":"assets/players/racing/g_conradlaursen.webp","k":"gt"},{"id":"g_carrieschreiner","n":"Carrie Schreiner","s":"SCHREINER","num":"49","c":"MRG","a":28,"p":"DEFENSIVE","st":[0.85,0.85,0.86,0.78,0.83,0.77,0.83,0.8],"ph":"assets/players/racing/g_carrieschreiner.webp","k":"gt"},{"id":"a_mangonisantiago","n":"Santiago Mangoni","s":"MANGONI","num":"83","c":"PER","a":24,"p":"DEFENSIVE","st":[0.8,0.74,0.83,0.78,0.75,0.66,0.8,0.73],"ph":"assets/players/racing/a_mangonisantiago.webp","k":"actc"},{"id":"g_gillesmagnus","n":"Gilles Magnus","s":"MAGNUS","num":"29","c":"MRG","a":27,"p":"RISK TAKER","st":[0.67,0.78,0.71,0.77,0.66,0.79,0.7,0.78],"ph":"assets/players/racing/g_gillesmagnus.webp","k":"gt"},{"id":"a_impiombatonicolas","n":"Nicolás Impiombato","s":"IMPIOMBATO","num":"96","c":"PER","a":34,"p":"CONSISTENT","st":[0.78,0.76,0.81,0.82,0.82,0.77,0.88,0.76],"ph":"assets/players/racing/a_impiombatonicolas.webp","k":"actc"},{"id":"g_alfredrenauer","n":"Alfred Renauer","s":"RENAUER","num":"85","c":"MRG","a":29,"p":"QUALIFYING SPECIALIST","st":[0.85,0.88,0.81,0.83,0.78,0.82,0.81,0.77],"ph":"assets/players/racing/g_alfredrenauer.webp","k":"gt"},{"id":"g_baptistemoulin","n":"Baptiste Moulin","s":"MOULIN","num":"55","c":"MRG","a":27,"p":"DEFENSIVE","st":[0.85,0.81,0.86,0.83,0.84,0.7,0.88,0.8],"ph":"assets/players/racing/g_baptistemoulin.webp","k":"gt"},{"id":"g_harrygeorge","n":"Harry George","s":"GEORGE","num":"53","c":"OVM","a":32,"p":"DEFENSIVE","st":[0.69,0.75,0.76,0.75,0.76,0.65,0.79,0.7],"ph":"assets/players/racing/g_harrygeorge.webp","k":"gt"},{"id":"a_abdalatomas","n":"Tomás Abdala","s":"ABDALA","num":"35","c":"PER","a":24,"p":"QUALIFYING SPECIALIST","st":[0.81,0.79,0.79,0.79,0.8,0.76,0.77,0.74],"ph":"assets/players/racing/a_abdalatomas.webp","k":"actc"},{"id":"a_landamarcos","n":"Marcos Landa","s":"LANDA","num":"68","c":"PER","a":34,"p":"AGGRESSIVE","st":[0.8,0.79,0.82,0.87,0.79,0.89,0.75,0.86],"ph":"assets/players/racing/a_landamarcos.webp","k":"actc"},{"id":"g_dustinblattner","n":"Dustin Blattner","s":"BLATTNER","num":"70","c":"KAI","a":24,"p":"WET SPECIALIST","st":[0.78,0.75,0.75,0.82,0.85,0.75,0.75,0.77],"ph":"assets/players/racing/g_dustinblattner.webp","k":"gt"},{"id":"a_abellasebastian","n":"Sebastián Abella","s":"ABELLA","num":"11","c":"PER","a":36,"p":"WET SPECIALIST","st":[0.78,0.74,0.77,0.8,0.81,0.74,0.81,0.79],"ph":"assets/players/racing/a_abellasebastian.webp","k":"actc"},{"id":"a_fontananorberto","n":"Norberto Fontana","s":"N. FONTANA","num":"48","c":"VAL","a":51,"p":"AGGRESSIVE","st":[0.82,0.8,0.83,0.8,0.79,0.87,0.78,0.87],"ph":"assets/players/racing/a_fontananorberto.webp","k":"actc"},{"id":"a_olmedojeremias","n":"Jeremías Olmedo","s":"OLMEDO","num":"22","c":"PER","a":38,"p":"CONSISTENT","st":[0.83,0.79,0.85,0.82,0.81,0.78,0.86,0.81],"ph":"assets/players/racing/a_olmedojeremias.webp","k":"actc"},{"id":"g_dylanpereira","n":"Dylan Pereira","s":"PEREIRA","num":"66","c":"MRG","a":29,"p":"TYRE SAVER","st":[0.7,0.74,0.74,0.77,0.83,0.71,0.81,0.7],"ph":"assets/players/racing/g_dylanpereira.webp","k":"gt"},{"id":"g_aaronwalker","n":"Aaron Walker","s":"WALKER","num":"92","c":"MRG","a":38,"p":"CONSISTENT","st":[0.81,0.79,0.86,0.83,0.78,0.77,0.87,0.77],"ph":"assets/players/racing/g_aaronwalker.webp","k":"gt"},{"id":"a_chapurfacundo","n":"Facundo Chapur","s":"CHAPUR","num":"93","c":"PER","a":35,"p":"QUALIFYING SPECIALIST","st":[0.84,0.84,0.81,0.82,0.82,0.82,0.82,0.78],"ph":"assets/players/racing/a_chapurfacundo.webp","k":"actc"},{"id":"g_mirkobortolotti","n":"Mirko Bortolotti","s":"BORTOLOTTI","num":"17","c":"IBE","a":26,"p":"AGGRESSIVE","st":[0.77,0.77,0.74,0.75,0.74,0.79,0.71,0.81],"ph":"assets/players/racing/g_mirkobortolotti.webp","k":"gt"},{"id":"g_mattiadrudi","n":"Mattia Drudi","s":"DRUDI","num":"23","c":"MEL","a":28,"p":"DEFENSIVE","st":[0.86,0.81,0.85,0.84,0.88,0.77,0.86,0.77],"ph":"assets/players/racing/g_mattiadrudi.webp","k":"gt"},{"id":"a_vallelucas","n":"Lucas Valle","s":"VALLE","num":"07","c":"PER","a":31,"p":"AGGRESSIVE","st":[0.81,0.76,0.75,0.81,0.72,0.83,0.74,0.82],"ph":"assets/players/racing/a_vallelucas.webp","k":"actc"},{"id":"g_patrickniederhauser","n":"Patrick Niederhauser","s":"NIEDERHAUSER","num":"16","c":"TAM","a":30,"p":"QUALIFYING SPECIALIST","st":[0.83,0.84,0.86,0.8,0.83,0.84,0.83,0.72],"ph":"assets/players/racing/g_patrickniederhauser.webp","k":"gt"},{"id":"g_simonbalcaen","n":"Simon Balcaen","s":"BALCAEN","num":"04","c":"OVM","a":31,"p":"TYRE SAVER","st":[0.81,0.86,0.83,0.82,0.83,0.82,0.89,0.85],"ph":"assets/players/racing/g_simonbalcaen.webp","k":"gt"},{"id":"g_ugodewilde","n":"Ugo De Wilde","s":"WILDE","num":"72","c":"KAI","a":27,"p":"WET SPECIALIST","st":[0.78,0.78,0.83,0.86,0.86,0.75,0.86,0.85],"ph":"assets/players/racing/g_ugodewilde.webp","k":"gt"},{"id":"a_dipalmaluisjose","n":"Luis José Di Palma","s":"PALMA","num":"86","c":"PER","a":49,"p":"DEFENSIVE","st":[0.86,0.83,0.83,0.87,0.86,0.73,0.88,0.86],"ph":"assets/players/racing/a_dipalmaluisjose.webp","k":"actc"},{"id":"a_cotignolanicolas","n":"Nicolás Cotignola","s":"COTIGNOLA","num":"77","c":"VAL","a":33,"p":"QUALIFYING SPECIALIST","st":[0.84,0.85,0.8,0.89,0.82,0.74,0.78,0.77],"ph":"assets/players/racing/a_cotignolanicolas.webp","k":"actc"},{"id":"a_ferrantegaston","n":"Gaston Ferrante","s":"FERRANTE","num":"69","c":"VAL","a":34,"p":"RISK TAKER","st":[0.79,0.81,0.73,0.78,0.79,0.82,0.71,0.81],"ph":"assets/players/racing/a_ferrantegaston.webp","k":"actc"},{"id":"g_tomkalender","n":"Tom Kalender","s":"KALENDER","num":"46","c":"TAM","a":33,"p":"TYRE SAVER","st":[0.74,0.84,0.81,0.8,0.8,0.74,0.86,0.81],"ph":"assets/players/racing/g_tomkalender.webp","k":"gt"},{"id":"a_castellanojonatan","n":"Jonatan Castellano","s":"CASTELLANO","num":"37","c":"VAL","a":42,"p":"QUALIFYING SPECIALIST","st":[0.82,0.84,0.8,0.83,0.8,0.79,0.8,0.79],"ph":"assets/players/racing/a_castellanojonatan.webp","k":"actc"},{"id":"g_nickithiim","n":"Nicki Thiim","s":"THIIM","num":"13","c":"TAM","a":22,"p":"CONSISTENT","st":[0.77,0.75,0.8,0.77,0.77,0.74,0.83,0.73],"ph":"assets/players/racing/g_nickithiim.webp","k":"gt"},{"id":"a_agrelomarcelo","n":"Marcelo Agrelo","s":"AGRELO","num":"59","c":"VAL","a":34,"p":"AGGRESSIVE","st":[0.79,0.8,0.76,0.76,0.79,0.83,0.69,0.82],"ph":"assets/players/racing/a_agrelomarcelo.webp","k":"actc"},{"id":"a_candelakevin","n":"Kevin Candela","s":"CANDELA","num":"19","c":"PER","a":27,"p":"AGGRESSIVE","st":[0.78,0.81,0.77,0.82,0.76,0.87,0.76,0.9],"ph":"assets/players/racing/a_candelakevin.webp","k":"actc"},{"id":"a_carinelliaugusto","n":"Augusto Carinelli","s":"CARINELLI","num":"60","c":"PER","a":34,"p":"TYRE SAVER","st":[0.8,0.8,0.85,0.82,0.82,0.79,0.9,0.79],"ph":"assets/players/racing/a_carinelliaugusto.webp","k":"actc"},{"id":"g_timtramnitz","n":"Tim Tramnitz","s":"TRAMNITZ","num":"82","c":"MRG","a":22,"p":"QUALIFYING SPECIALIST","st":[0.86,0.86,0.86,0.82,0.84,0.77,0.82,0.81],"ph":"assets/players/racing/g_timtramnitz.webp","k":"gt"},{"id":"a_fainignacio","n":"Ignacio Fain","s":"FAIN","num":"33","c":"PER","a":25,"p":"CONSISTENT","st":[0.78,0.76,0.75,0.79,0.74,0.72,0.84,0.69],"ph":"assets/players/racing/a_fainignacio.webp","k":"actc"},{"id":"a_lugonrodrigo","n":"Rodrigo Lugon","s":"LUGON","num":"21","c":"PER","a":34,"p":"CONSISTENT","st":[0.81,0.78,0.78,0.79,0.76,0.77,0.77,0.79],"ph":"assets/players/racing/a_lugonrodrigo.webp","k":"actc"},{"id":"g_alexaka","n":"Alex Aka","s":"AKA","num":"34","c":"MRG","a":26,"p":"TYRE SAVER","st":[0.7,0.67,0.75,0.8,0.8,0.7,0.82,0.76],"ph":"assets/players/racing/g_alexaka.webp","k":"gt"},{"id":"g_roccomazzola","n":"Rocco Mazzola","s":"MAZZOLA","num":"79","c":"MEL","a":21,"p":"TYRE SAVER","st":[0.79,0.79,0.85,0.79,0.82,0.73,0.85,0.77],"ph":"assets/players/racing/g_roccomazzola.webp","k":"gt"},{"id":"g_stephanetribaudini","n":"Stephane Tribaudini","s":"TRIBAUDINI","num":"10","c":"IBE","a":43,"p":"RISK TAKER","st":[0.77,0.76,0.77,0.79,0.78,0.78,0.7,0.79],"ph":"assets/players/racing/g_stephanetribaudini.webp","k":"gt"},{"id":"a_catalanmagnijuantomas","n":"Juan Tomás Catalán Magni","s":"MAGNI","num":"58","c":"PER","a":36,"p":"AGGRESSIVE","st":[0.79,0.79,0.77,0.79,0.79,0.82,0.76,0.9],"ph":"assets/players/racing/a_catalanmagnijuantomas.webp","k":"actc"},{"id":"g_pierrelouischovet","n":"Pierre Louis Chovet","s":"CHOVET","num":"28","c":"TAM","a":26,"p":"CONSISTENT","st":[0.83,0.83,0.85,0.83,0.86,0.82,0.89,0.81],"ph":"assets/players/racing/g_pierrelouischovet.webp","k":"gt"},{"id":"g_robertdehaan","n":"Robert De Haan","s":"HAAN","num":"88","c":"MEL","a":24,"p":"RISK TAKER","st":[0.75,0.74,0.72,0.76,0.66,0.76,0.66,0.73],"ph":"assets/players/racing/g_robertdehaan.webp","k":"gt"},{"id":"a_craparoelio","n":"Elio Craparo","s":"CRAPARO","num":"94","c":"PER","a":37,"p":"CONSISTENT","st":[0.84,0.83,0.8,0.81,0.84,0.81,0.87,0.75],"ph":"assets/players/racing/a_craparoelio.webp","k":"actc"},{"id":"a_truccojuanmartin","n":"Martín Trucco Juan","s":"M. JUAN","num":"39","c":"PER","a":34,"p":"RISK TAKER","st":[0.8,0.82,0.76,0.8,0.71,0.82,0.74,0.8],"ph":"assets/players/racing/a_truccojuanmartin.webp","k":"actc"},{"id":"g_joelsturm","n":"Joel Sturm","s":"STURM","num":"71","c":"MRG","a":25,"p":"TYRE SAVER","st":[0.79,0.78,0.81,0.82,0.82,0.74,0.85,0.79],"ph":"assets/players/racing/g_joelsturm.webp","k":"gt"},{"id":"g_simonbirch","n":"Simon Birch","s":"BIRCH","num":"31","c":"OVM","a":19,"p":"QUALIFYING SPECIALIST","st":[0.81,0.75,0.79,0.78,0.8,0.79,0.75,0.77],"ph":"assets/players/racing/g_simonbirch.webp","k":"gt"},{"id":"a_trossetnicolas","n":"Nicolás Trosset","s":"TROSSET","num":"63","c":"PER","a":36,"p":"WET SPECIALIST","st":[0.79,0.81,0.87,0.88,0.84,0.82,0.87,0.83],"ph":"assets/players/racing/a_trossetnicolas.webp","k":"actc"},{"id":"g_mattcampbell","n":"Matt Campbell","s":"CAMPBELL","num":"89","c":"MEL","a":38,"p":"DEFENSIVE","st":[0.68,0.74,0.78,0.79,0.76,0.66,0.78,0.72],"ph":"assets/players/racing/g_mattcampbell.webp","k":"gt"},{"id":"g_bendoerr","n":"Ben Doerr","s":"B. DOERR","num":"15","c":"MRG","a":21,"p":"QUALIFYING SPECIALIST","st":[0.8,0.83,0.81,0.76,0.77,0.77,0.73,0.78],"ph":"assets/players/racing/g_bendoerr.webp","k":"gt"},{"id":"g_kylemarcelli","n":"Kyle Marcelli","s":"MARCELLI","num":"32","c":"KAI","a":36,"p":"AGGRESSIVE","st":[0.81,0.79,0.75,0.79,0.78,0.85,0.78,0.84],"ph":"assets/players/racing/g_kylemarcelli.webp","k":"gt"},{"id":"a_canapinomatias","n":"Matías Canapino","s":"M. CANAPINO","num":"75","c":"VAL","a":30,"p":"DEFENSIVE","st":[0.81,0.75,0.85,0.79,0.79,0.71,0.84,0.78],"ph":"assets/players/racing/a_canapinomatias.webp","k":"actc"},{"id":"g_ayhancanguven","n":"Ayhancan Guven","s":"GUVEN","num":"84","c":"NET","a":28,"p":"TYRE SAVER","st":[0.72,0.74,0.78,0.78,0.8,0.71,0.82,0.73],"ph":"assets/players/racing/g_ayhancanguven.webp","k":"gt"},{"id":"g_felixhirsiger","n":"Felix Hirsiger","s":"HIRSIGER","num":"50","c":"MRG","a":28,"p":"AGGRESSIVE","st":[0.76,0.78,0.75,0.81,0.73,0.87,0.72,0.82],"ph":"assets/players/racing/g_felixhirsiger.webp","k":"gt"},{"id":"g_axciljefferies","n":"Axcil Jefferies","s":"JEFFERIES","num":"44","c":"MRG","a":42,"p":"QUALIFYING SPECIALIST","st":[0.82,0.78,0.75,0.82,0.82,0.78,0.74,0.74],"ph":"assets/players/racing/g_axciljefferies.webp","k":"gt"},{"id":"a_gianinijuanpablo","n":"Pablo Gianini Juan","s":"P. JUAN","num":"38","c":"VAL","a":34,"p":"CONSISTENT","st":[0.76,0.79,0.79,0.8,0.77,0.71,0.83,0.79],"ph":"assets/players/racing/a_gianinijuanpablo.webp","k":"actc"},{"id":"g_javiersagrera","n":"Javier Sagrera","s":"SAGRERA","num":"100","c":"GRA","a":22,"p":"DEFENSIVE","st":[0.76,0.78,0.79,0.79,0.76,0.75,0.84,0.75],"ph":"assets/players/racing/g_javiersagrera.webp","k":"gt"},{"id":"g_christopherhaase","n":"Christopher Haase","s":"HAASE","num":"27","c":"MRG","a":39,"p":"TYRE SAVER","st":[0.65,0.73,0.77,0.77,0.71,0.71,0.71,0.71],"ph":"assets/players/racing/g_christopherhaase.webp","k":"gt"}]};
  
  'use strict';
  // ==========================================================================
  // APEX GT3 MANAGER — data model, economy, championship, save system.
  // Pure data + logic; no DOM, no THREE. Consumed by game-ui.js and engine.js.
  // ==========================================================================
  const clamp01 = (v,min=0,max=1) => Math.max(min,Math.min(max,v));
  // Shared by game-ui.js and engine.js (classic scripts share one global scope).
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mod = (n, m) => ((n % m) + m) % m;
  const $ = id => document.getElementById(id);
  
  const RARITY_INFO = {
    COMMON:{color:'#9aa08d',mult:1,dupToLevel:2,maxLevel:5},
    UNCOMMON:{color:'#5f9bd6',mult:1.15,dupToLevel:3,maxLevel:7},
    RARE:{color:'#a86bd1',mult:1.35,dupToLevel:4,maxLevel:9},
    EPIC:{color:'#d7a23a',mult:1.6,dupToLevel:5,maxLevel:11},
    LEGENDARY:{color:'#e0562f',mult:2,dupToLevel:6,maxLevel:13}
  };
  const RARITY_ORDER = ['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'];
  const PART_TYPES = ['engine','gearbox','aero','suspension','brakes','electronics','cooling','tyres'];
  const PART_LABELS = {engine:'ENGINE',gearbox:'GEARBOX',aero:'AERO',suspension:'SUSPENSION',brakes:'BRAKES',electronics:'ELECTRONICS',cooling:'COOLING',tyres:'TYRES'};
  // Weighted contribution of each part type to the five car-facing performance axes.
  const PART_AXES = {
    engine:{top:.55,accel:.35,control:.05,corner:0,brake:0},
    gearbox:{accel:.5,top:.15,control:.1,corner:0,brake:0},
    aero:{corner:.5,control:.25,top:-.1,accel:0,brake:0},
    suspension:{corner:.35,control:.4,brake:.05,top:0,accel:0},
    brakes:{brake:.55,control:.1,top:0,accel:0,corner:0},
    electronics:{control:.45,accel:.1,top:0,brake:0,corner:0},
    cooling:{top:.08,control:.08,accel:.05,brake:0,corner:0},
    tyres:{corner:.2,brake:.15,top:0,accel:0,control:0}
  };
  const AXIS_LABELS = { top:'Top speed', accel:'Aceleración', brake:'Frenada', corner:'Curva', control:'Control' };
  const BODIES = {
    classic:{name:'Camaro ZL1 TC',edition:'V8 AMERICANO · TURISMO CARRETERA',axes:{top:.05,accel:.05,brake:.05,corner:.05,control:.1},desc:'Frente ancho, capó musculoso y techo de coupé. Potencia equilibrada.'},
    touring:{name:'Alfa Romeo Giulia',edition:'BERLINA · TURISMO',axes:{brake:.1,control:.12,corner:.05},desc:'Silueta de cuatro puertas, escudo triangular y precisión de frenada.'},
    sprint:{name:'Mustang GT3',edition:'V8 · GT3',axes:{top:.22,accel:.2,corner:-.06},desc:'Fastback, capó largo y tres luces traseras por lado. Explosivo en recta.'},
    endurance:{name:'BMW M4 GT3',edition:'SEIS CILINDROS · GT3',axes:{control:.1,corner:.04,top:-.05},desc:'Doble riñón vertical, techo alto y pasos ensanchados. Consistencia.'},
    aero:{name:'Mercedes-AMG GT3',edition:'V8 · GT3',axes:{corner:.26,top:-.15},desc:'Capó extralargo, cabina retrasada y parrilla de lamas verticales.'},
    track:{name:'Audi R8 LMS',edition:'V10 CENTRAL · GT3',axes:{corner:.16,brake:.1,top:-.06},desc:'Cabina adelantada, sideblades y parrilla hexagonal. Especialista técnico.'},
    spectre:{name:'Ferrari 296 GT3',edition:'V6 CENTRAL · GT3',color:'#ed3049',axes:{top:.19,accel:.12,corner:.06,brake:-.08},desc:'Morro bajo, tomas laterales profundas y contrafuertes traseros.'},
    raijin:{name:'Nissan GT-R GT3',edition:'V6 BITURBO · GT3',color:'#29b9e5',axes:{accel:.19,control:.13,top:-.06,corner:.03},desc:'Coupé de techo alto, hombros cuadrados y cuatro pilotos circulares.'},
    mistral:{name:'Aston Martin Vantage',edition:'V8 · GT3',color:'#f9bc40',axes:{top:.16,control:.15,accel:-.07,brake:.04},desc:'Gran parrilla baja, capó curvado y cola compacta. Gran turismo.'},
    valkyr:{name:'Porsche 911 GT3 R',edition:'BÓXER TRASERO · GT3',color:'#a1e648',axes:{corner:.17,brake:.14,top:-.08,control:.04},desc:'Faros redondos, techo arqueado continuo y alerón de cuello de cisne.'},
    corsair:{name:'Corvette Z06 GT3.R',edition:'V8 CENTRAL · GT3',color:'#a78bfa',axes:{accel:.20,top:.15,corner:-.08,control:-.03},desc:'Morro en cuña, cabina adelantada y grandes entradas laterales.'}
  };
  const PACKS = {
    bronze:{name:'BRONZE PACK',icon:'📦',cost:5000,cards:3,odds:{COMMON:.65,UNCOMMON:.25,RARE:.08,EPIC:.02,LEGENDARY:0}},
    silver:{name:'SILVER PACK',icon:'🎁',cost:15000,cards:3,odds:{COMMON:.4,UNCOMMON:.35,RARE:.18,EPIC:.06,LEGENDARY:.01}},
    gold:{name:'GOLD PACK',icon:'🏆',cost:35000,cards:4,odds:{COMMON:.15,UNCOMMON:.35,RARE:.32,EPIC:.15,LEGENDARY:.03}},
    legend:{name:'LEGEND PACK',icon:'👑',cost:80000,cards:5,odds:{COMMON:0,UNCOMMON:.15,RARE:.4,EPIC:.35,LEGENDARY:.1}}
  };
  const TRACKS = [
    {id:'valleverde',name:'VALLE VERDE',country:'San Esteban, Argentina',lengthKm:1.82,corners:12,gripMod:1,brakingMod:1,aeroMod:1,wetChance:.15,tempBase:24,overtakeDiff:.5,desc:'Alta velocidad, equilibrado.'},
    {id:'autodromocentral',name:'AUTÓDROMO CENTRAL',country:'Córdoba, Argentina',lengthKm:1.82,corners:12,gripMod:.95,brakingMod:1.25,aeroMod:.9,wetChance:.2,tempBase:22,overtakeDiff:.4,desc:'Frenadas exigentes.',layout:[[-220,135], [-80,135], [100,135], [250,135], [290,90], [290,20], [240,-20], [240,-90], [200,-130], [120,-130], [90,-80], [20,-80], [-20,-130], [-110,-150], [-200,-130], [-260,-70], [-270,20], [-250,100]]},
    {id:'costasur',name:'COSTA SUR',country:'Punta del Este, Uruguay',lengthKm:1.82,corners:12,gripMod:1.05,brakingMod:.95,aeroMod:1.15,wetChance:.35,tempBase:26,overtakeDiff:.65,desc:'Técnico y cambiante.',layout:[[-220,135], [-80,135], [100,135], [240,110], [300,50], [280,-10], [200,-30], [160,-90], [200,-150], [120,-190], [20,-170], [-50,-110], [-130,-130], [-220,-100], [-290,-30], [-300,60]]},
    {id:'montrealpl',name:'MONTRÉAL PARK',country:'Quebec, Canadá',lengthKm:1.82,corners:12,gripMod:1.1,brakingMod:1.1,aeroMod:.85,wetChance:.3,tempBase:18,overtakeDiff:.35,desc:'Alta velocidad pura.',layout:[[-220,135], [-40,135], [180,135], [380,135], [450,90], [440,20], [360,-30], [240,-40], [130,-10], [20,-40], [-100,-50], [-210,-30], [-290,10], [-300,80]]},
    {id:'sierragp',name:'SIERRA GP',country:'Santiago, Chile',lengthKm:1.82,corners:12,gripMod:.92,brakingMod:1.05,aeroMod:1.05,wetChance:.25,tempBase:20,overtakeDiff:.55,desc:'Desnivel y técnica.',layout:[[-220,135], [-80,135], [100,135], [220,105], [250,40], [190,0], [240,-50], [300,-100], [240,-160], [140,-140], [110,-80], [40,-50], [-40,-90], [-70,-160], [-170,-170], [-240,-110], [-200,-40], [-270,20], [-290,90]]},
    {id:'pampacircuit',name:'PAMPA CIRCUIT',country:'La Pampa, Argentina',lengthKm:1.82,corners:12,gripMod:1,brakingMod:1,aeroMod:1,wetChance:.1,tempBase:28,overtakeDiff:.45,desc:'Rápido y abierto.',layout:[[-220,135], [-40,135], [200,135], [400,120], [470,60], [470,-60], [400,-130], [200,-150], [0,-150], [-200,-150], [-320,-100], [-350,-10], [-330,80]]},
    {id:'litoralring',name:'LITORAL RING',country:'Rosario, Argentina',lengthKm:1.82,corners:12,gripMod:.98,brakingMod:.9,aeroMod:1.1,wetChance:.4,tempBase:23,overtakeDiff:.6,desc:'Húmedo con frecuencia.',layout:[[-220,135], [-80,135], [100,135], [230,120], [290,60], [300,-30], [240,-90], [150,-90], [100,-40], [30,-30], [-30,-80], [-20,-150], [-100,-190], [-200,-160], [-260,-90], [-250,-10], [-290,60]]},
    {id:'nortespeed',name:'NORTE SPEEDWAY',country:'São Paulo, Brasil',lengthKm:1.82,corners:12,gripMod:1.08,brakingMod:1,aeroMod:.9,wetChance:.2,tempBase:30,overtakeDiff:.3,desc:'Velocidad pura.',layout:[[-220,135], [0,135], [220,135], [400,110], [460,40], [460,-40], [400,-110], [220,-135], [0,-135], [-220,-135], [-390,-110], [-450,-40], [-450,40], [-390,110]]},
    {"id": "desiertoring", "name": "DESIERTO RING", "country": "San Juan, Argentina", "lengthKm": 2, "corners": 12, "gripMod": 0.94, "brakingMod": 1.18, "aeroMod": 0.9, "wetChance": 0.04, "tempBase": 34, "overtakeDiff": 0.32, "theme": "desert", "layout": [[-220, 135], [-80, 135], [100, 135], [300, 125], [345, 45], [310, -90], [175, -145], [60, -135], [15, -65], [-75, -70], [-125, -155], [-290, -145], [-340, -40], [-300, 75]], "desc": "Rectas largas y horquillas sobre arena."},
    {"id": "patagoniapark", "name": "PATAGONIA PARK", "country": "Neuquén, Argentina", "lengthKm": 2, "corners": 13, "gripMod": 0.96, "brakingMod": 1.08, "aeroMod": 1.17, "wetChance": 0.18, "tempBase": 14, "overtakeDiff": 0.58, "theme": "mountain", "layout": [[-220, 135], [-80, 135], [100, 135], [245, 100], [280, 5], [230, -65], [140, -20], [60, -65], [85, -170], [-10, -205], [-110, -145], [-145, -45], [-260, -100], [-315, -25], [-290, 80]], "desc": "Curvas enlazadas y aire frío de montaña."},
    {"id": "atlanticospeed", "name": "ATLÁNTICO SPEED", "country": "Mar del Plata, Argentina", "lengthKm": 2, "corners": 10, "gripMod": 1.03, "brakingMod": 0.95, "aeroMod": 0.92, "wetChance": 0.32, "tempBase": 21, "overtakeDiff": 0.28, "theme": "coast", "layout": [[-220, 135], [-80, 135], [100, 135], [300, 130], [380, 65], [355, -35], [240, -95], [65, -115], [-130, -115], [-290, -65], [-340, 30], [-295, 110]], "desc": "Arcos rápidos junto a la costa."},
    {"id": "selvaverde", "name": "SELVA VERDE", "country": "Misiones, Argentina", "lengthKm": 2, "corners": 12, "gripMod": 1.08, "brakingMod": 1.12, "aeroMod": 1.2, "wetChance": 0.52, "tempBase": 29, "overtakeDiff": 0.67, "theme": "forest", "layout": [[-220, 135], [-80, 135], [100, 135], [235, 100], [265, 15], [180, -25], [225, -120], [135, -170], [45, -100], [-40, -155], [-130, -90], [-230, -155], [-310, -65], [-285, 55]], "desc": "Técnico, húmedo y rodeado de selva."},
    {"id": "puertourbano", "name": "PUERTO URBANO", "country": "Montevideo, Uruguay", "lengthKm": 2, "corners": 12, "gripMod": 0.93, "brakingMod": 1.28, "aeroMod": 0.94, "wetChance": 0.3, "tempBase": 23, "overtakeDiff": 0.72, "theme": "city", "layout": [[-220, 135], [-80, 135], [100, 135], [250, 130], [280, 75], [280, -75], [230, -120], [120, -120], [85, -65], [-15, -65], [-40, -165], [-235, -165], [-285, -105], [-285, 55]], "desc": "Calles estrechas y frenadas de noventa grados."},
    {"id": "lagunaazul", "name": "LAGUNA AZUL", "country": "Bariloche, Argentina", "lengthKm": 2, "corners": 13, "gripMod": 1.04, "brakingMod": 1.1, "aeroMod": 1.1, "wetChance": 0.38, "tempBase": 16, "overtakeDiff": 0.52, "theme": "coast", "layout": [[-220, 135], [-80, 135], [100, 135], [265, 85], [290, -15], [235, -140], [125, -180], [30, -120], [-15, -25], [-100, 15], [-165, -40], [-220, -150], [-300, -135], [-340, -35], [-285, 70]], "desc": "Una gran curva bordeando el lago."},
    {"id": "andesendurance", "name": "ANDES ENDURANCE", "country": "Mendoza, Argentina", "lengthKm": 2, "corners": 14, "gripMod": 0.95, "brakingMod": 1.2, "aeroMod": 1.05, "wetChance": 0.12, "tempBase": 19, "overtakeDiff": 0.43, "theme": "mountain", "layout": [[-220, 135], [-80, 135], [100, 135], [320, 135], [415, 70], [425, -60], [340, -145], [215, -160], [160, -80], [80, -40], [0, -115], [-100, -210], [-275, -210], [-375, -120], [-390, 5], [-310, 100]], "desc": "El trazado más largo; exige resistencia y frenos."},
    {"id": "pampavelocity", "name": "PAMPA VELOCITY", "country": "Santa Rosa, Argentina", "lengthKm": 2, "corners": 11, "gripMod": 1.02, "brakingMod": 0.92, "aeroMod": 0.86, "wetChance": 0.09, "tempBase": 31, "overtakeDiff": 0.25, "theme": "grass", "layout": [[-220, 135], [-80, 135], [100, 135], [360, 125], [420, 30], [380, -75], [215, -115], [70, -95], [-55, -155], [-255, -145], [-350, -75], [-360, 35], [-300, 110]], "desc": "Acelerador a fondo y amplias zonas de adelantamiento."},
    {"id": "santacruz", "name": "SANTA CRUZ GP", "country": "Santa Cruz, Bolivia", "lengthKm": 2, "corners": 15, "gripMod": 1.1, "brakingMod": 1.16, "aeroMod": 1.19, "wetChance": 0.44, "tempBase": 28, "overtakeDiff": 0.6, "theme": "forest", "layout": [[-220, 135], [-80, 135], [100, 135], [245, 110], [270, 25], [185, -45], [80, -20], [30, -90], [100, -155], [25, -225], [-85, -200], [-120, -90], [-215, -30], [-275, -115], [-340, -65], [-330, 35], [-280, 100]], "desc": "Doble sector técnico y curvas de radio cambiante."},
    {"id": "nocturnaring", "name": "NOCTURNA RING", "country": "Buenos Aires, Argentina", "lengthKm": 2, "corners": 13, "gripMod": 1.01, "brakingMod": 1.16, "aeroMod": 1.08, "wetChance": 0.22, "tempBase": 20, "overtakeDiff": 0.48, "theme": "night", "layout": [[-220, 135], [-80, 135], [100, 135], [265, 120], [330, 55], [305, -35], [210, -75], [135, -165], [25, -185], [-25, -100], [-120, -70], [-185, -155], [-290, -115], [-335, -25], [-290, 80]], "desc": "Luces de ciudad y una chicana decisiva."},
    {"id": "calderaring", "name": "CALDERA RING", "country": "Isla Caldera, Tamago", "lengthKm": 2, "corners": 15, "gripMod": 0.97, "brakingMod": 1.14, "aeroMod": 1.02, "wetChance": 0.2, "tempBase": 27, "overtakeDiff": 0.62, "theme": "mountain", "layout": [[-220,135], [-80,135], [100,135], [260,120], [330,50], [300,-40], [200,-70], [130,-140], [40,-190], [-60,-150], [-90,-70], [-170,-30], [-260,-70], [-330,10], [-300,100]]},
    {"id": "centenario", "name": "AUTÓDROMO DEL CENTENARIO", "country": "Buenaventura, Peronia", "lengthKm": 2, "corners": 14, "gripMod": 1.03, "brakingMod": 1.05, "aeroMod": 1.0, "wetChance": 0.18, "tempBase": 22, "overtakeDiff": 0.5, "theme": "grass", "layout": [[-220,135], [-80,135], [100,135], [280,140], [390,100], [430,20], [400,-60], [310,-100], [220,-70], [160,-110], [100,-170], [0,-180], [-90,-140], [-130,-70], [-210,-90], [-290,-80], [-340,-10], [-320,80]]}
  
  ];
  // Layout IDs remain stable so existing careers and installed bodywork survive updates.
  const DEFAULT_LAYOUT = [[-220, 135], [-80, 135], [100, 135], [245, 120], [290, 35], [250, -65], [135, -103], [88, -25], [18, -18], [-9, -119], [-106, -150], [-230, -109], [-290, -15], [-270, 95]];
  function layoutForTrack(def){ return def.layout || DEFAULT_LAYOUT; }
  function migrateCareer(career){
    if ((career.version || 2) < 3) {
      const existing = new Set(career.calendar.map(r => r.trackId));
      TRACKS.slice(8).forEach(t => {
        if (!existing.has(t.id)) career.calendar.push({round:career.calendar.length+1,trackId:t.id,completed:false,result:null,gridPenalty:false});
      });
      career.teams.forEach((team,i) => {
        if (!team.isPlayer) team.bodyType = Object.keys(BODIES)[i % Object.keys(BODIES).length];
      });
      career.version = 3;
    }
    if ((career.version || 2) < 4) {
      // temporada de 20 fechas: se suman los circuitos que faltan al calendario de las carreras guardadas
      const existing = new Set(career.calendar.map(r => r.trackId));
      TRACKS.forEach(t => {
        if (!existing.has(t.id)) career.calendar.push({round:career.calendar.length+1,trackId:t.id,completed:false,result:null,gridPenalty:false});
      });
      career.calendar.forEach((r,i) => { r.round = i + 1; });
      // nacionalidades: códigos reales -> naciones del mundo ficticio
      const NAT = {ARG:null, BOL:'SOT', BRA:'TAM', CHI:'CUN', PAR:'MOR', URU:'VAL', VEN:'MAG'};
      (career.driversPool || []).forEach(d => { if (d.nationality in NAT) d.nationality = NAT[d.nationality] || (d.id % 3 ? 'PER' : 'VAL'); });
      career.version = 4;
    }
    if ((career.version || 2) < 5) {
      // escuderías nuevas (nombres, colores y logos) y carrocerías bloqueadas: sólo queda la que ya usaba cada equipo
      career.teams.forEach((t,i) => { const d = TEAM_DEFS[i]; if (d) { t.name = d.name; t.color = d.color; t.logo = d.logo; t.profile = t.isPlayer ? t.profile : d.profile; } });
      const pt = career.teams[0]; pt.ownedBodies = [pt.bodyType];
      career.version = 5;
    }
    return career;
  }
  const WEATHER_STATES = {
    CLEAR:{grip:1,label:'DESPEJADO',icon:'☀'},
    CLOUDY:{grip:.97,label:'NUBLADO',icon:'☁'},
    LIGHT_RAIN:{grip:.82,label:'LLOVIZNA',icon:'🌦'},
    RAIN:{grip:.68,label:'LLUVIA',icon:'🌧'},
    HEAVY_RAIN:{grip:.52,label:'LLUVIA FUERTE',icon:'⛈'},
    DRYING:{grip:.85,label:'SECANDO',icon:'🌤'}
  };
  const SPONSOR_POOL = [
    {id:'surmotor',name:'SUR MOTOR OIL',base:100000,bonus:{type:'podium',amount:50000,label:'+$50.000 por podio'},duration:4,reputationReq:0},
    {id:'vertice',name:'VÉRTICE',base:60000,bonus:{type:'championship',amount:150000,label:'+$150.000 si gana el campeonato'},duration:6,reputationReq:15},
    {id:'pampaholdings',name:'PAMPA HOLDINGS',base:250000,bonus:{type:'top5',amount:15000,label:'+$15.000 por top 5'},duration:4,reputationReq:40},
    {id:'costabank',name:'COSTA ATLÁNTICA BANK',base:80000,bonus:{type:'win',amount:100000,label:'+$100.000 por victoria'},duration:5,reputationReq:10},
    {id:'litoraltech',name:'LITORAL TECH',base:120000,bonus:{type:'pole',amount:30000,label:'+$30.000 por pole'},duration:4,reputationReq:20},
    {id:'aguilaneumaticos',name:'ÁGUILA NEUMÁTICOS',base:70000,bonus:{type:'fastestlap',amount:20000,label:'+$20.000 por vuelta rápida'},duration:5,reputationReq:5}
  ];
  const TEAM_PROFILES = ['FACTORY','BALANCED','BUDGET','AGGRESSIVE','DEVELOPMENT','TYRE SPECIALIST'];
  const PERSONALITIES = ['AGGRESSIVE','DEFENSIVE','TYRE SAVER','QUALIFYING SPECIALIST','WET SPECIALIST','CONSISTENT','RISK TAKER'];
  const DEFAULT_REGULATIONS = { mandatoryPit:true, pointsSystem:[25,18,15,12,10,8,6,4,2,1], componentLimit:3, qualifyingFormat:'ONE_SHOT' };
  
  // ---- Base driver roster (10 veteran cards, one per founding team) ---------
  const DRIVERS_BASE = [
    { name:'Mateo Martín', short:'MARTÍN', number:'07', color:0xd96a32, accent:'#f4dbad', nationality:'PER', age:29, personality:'CONSISTENT', stats:[.90,.88,.86,.89,.90,.77,.91,.87] },
    { name:'Gabriel Silva', short:'SILVA', number:'22', color:0x347f92, accent:'#eee6c9', nationality:'TAM', age:31, personality:'QUALIFYING SPECIALIST', stats:[.94,.85,.85,.82,.88,.88,.83,.91] },
    { name:'Nicolás Ferraro', short:'FERRARO', number:'16', color:0xbac89c, accent:'#283a2d', nationality:'PER', age:24, personality:'RISK TAKER', stats:[.86,.88,.91,.95,.92,.72,.89,.85] },
    { name:'Lucas Kowalski', short:'KOWALSKI', number:'83', color:0xd9b752, accent:'#302b26', nationality:'VAL', age:33, personality:'AGGRESSIVE', stats:[.92,.91,.84,.84,.85,.92,.77,.89] },
    { name:'Bruno Rossi', short:'ROSSI', number:'11', color:0xa74438, accent:'#f1e6c8', nationality:'VAL', age:27, personality:'CONSISTENT', stats:[.88,.90,.89,.91,.91,.82,.88,.86] },
    { name:'Tomás Acosta', short:'ACOSTA', number:'32', color:0xe1ded0, accent:'#bd493c', nationality:'PER', age:36, personality:'TYRE SAVER', stats:[.91,.86,.90,.86,.88,.81,.90,.86] },
    { name:'Diego Méndez', short:'MÉNDEZ', number:'54', color:0x343e52, accent:'#dfbf65', nationality:'CUN', age:26, personality:'AGGRESSIVE', stats:[.95,.91,.82,.83,.84,.90,.79,.91] },
    { name:'Santiago Vega', short:'VEGA', number:'99', color:0x589580, accent:'#f1deaf', nationality:'PER', age:22, personality:'WET SPECIALIST', stats:[.86,.88,.93,.93,.94,.74,.94,.83] },
    { name:'Agustín Ríos', short:'RÍOS', number:'41', color:0xb688a1, accent:'#f0ded0', nationality:'MOR', age:30, personality:'DEFENSIVE', stats:[.90,.92,.85,.89,.86,.87,.82,.88] },
    { name:'Valentín Costa', short:'COSTA', number:'65', color:0x73a9b2, accent:'#213c40', nationality:'VAL', age:28, personality:'CONSISTENT', stats:[.92,.90,.90,.90,.89,.85,.86,.92] }
  ];
  // ---- Bench/second driver per team, plus free-agent pool for the market ----
  const DRIVERS_EXTRA = [
    { name:'Franco Aguirre', short:'AGUIRRE', number:'71', color:0xd96a32, accent:'#f4dbad', nationality:'PER', age:20, personality:'RISK TAKER', stats:[.80,.82,.78,.80,.75,.83,.68,.79] },
    { name:'Pedro Almeida', short:'ALMEIDA', number:'23', color:0x347f92, accent:'#eee6c9', nationality:'TAM', age:34, personality:'WET SPECIALIST', stats:[.83,.80,.85,.86,.84,.70,.87,.78] },
    { name:'Ezequiel Paz', short:'PAZ', number:'17', color:0xbac89c, accent:'#283a2d', nationality:'PER', age:23, personality:'CONSISTENT', stats:[.81,.83,.82,.84,.83,.66,.85,.76] },
    { name:'Rodrigo Sosa', short:'SOSA', number:'84', color:0xd9b752, accent:'#302b26', nationality:'VAL', age:38, personality:'DEFENSIVE', stats:[.79,.85,.80,.78,.79,.75,.83,.77] },
    { name:'Iván Duarte', short:'DUARTE', number:'12', color:0xa74438, accent:'#f1e6c8', nationality:'VAL', age:25, personality:'AGGRESSIVE', stats:[.84,.84,.83,.85,.82,.86,.75,.82] },
    { name:'Cristian Bou', short:'BOU', number:'33', color:0xe1ded0, accent:'#bd493c', nationality:'PER', age:31, personality:'TYRE SAVER', stats:[.82,.81,.86,.81,.83,.72,.88,.80] },
    { name:'Martín Ovalle', short:'OVALLE', number:'55', color:0x343e52, accent:'#dfbf65', nationality:'CUN', age:21, personality:'QUALIFYING SPECIALIST', stats:[.87,.85,.77,.79,.78,.79,.71,.85] },
    { name:'Facundo Ledesma', short:'LEDESMA', number:'98', color:0x589580, accent:'#f1deaf', nationality:'PER', age:35, personality:'CONSISTENT', stats:[.80,.83,.87,.85,.86,.68,.90,.77] },
    { name:'Joaquín Bracho', short:'BRACHO', number:'42', color:0xb688a1, accent:'#f0ded0', nationality:'MAG', age:27, personality:'RISK TAKER', stats:[.83,.86,.79,.82,.80,.84,.73,.83] },
    { name:'Emiliano Duval', short:'DUVAL', number:'66', color:0x73a9b2, accent:'#213c40', nationality:'VAL', age:24, personality:'AGGRESSIVE', stats:[.85,.84,.81,.83,.81,.85,.76,.84] },
    { name:'Ramiro Achával', short:'ACHÁVAL', number:'19', color:0xc9a24b, accent:'#2c2416', nationality:'PER', age:19, personality:'RISK TAKER', stats:[.78,.79,.75,.81,.74,.80,.65,.78] },
    { name:'Julián Cabrera', short:'CABRERA', number:'88', color:0x5c8e77, accent:'#eee0c4', nationality:'PER', age:32, personality:'DEFENSIVE', stats:[.81,.83,.84,.82,.85,.71,.86,.79] },
    { name:'Federico Nazar', short:'NAZAR', number:'05', color:0x8b5a44, accent:'#f2e5c9', nationality:'SOT', age:29, personality:'CONSISTENT', stats:[.82,.82,.83,.83,.84,.74,.85,.80] },
    { name:'Simón Lattuca', short:'LATTUCA', number:'77', color:0x3f5a6b, accent:'#e8dcc0', nationality:'VAL', age:37, personality:'TYRE SAVER', stats:[.80,.81,.88,.80,.87,.69,.91,.76] },
    { name:'Bautista Guzmán', short:'GUZMÁN', number:'03', color:0x9c4f3a, accent:'#f0e2c6', nationality:'PER', age:22, personality:'WET SPECIALIST', stats:[.84,.85,.86,.87,.85,.75,.89,.81] },
    { name:'Thiago Roldán', short:'ROLDÁN', number:'44', color:0x4f6d4f, accent:'#e5dcc0', nationality:'PER', age:26, personality:'AGGRESSIVE', stats:[.86,.87,.80,.81,.79,.89,.74,.86] }
  ];
  function makeDriverPool(){
    // Roster fijo (roster-lro.js): pilotos reales del TC y del GT World Challenge Europe. Índices 0-9 = titulares, 10-19 = segundos, resto = mercado.
    const R = (typeof window !== 'undefined') && window.LRO_ROSTER;
    if (R && R.drivers && R.drivers.length >= 20){
      const legacy = DRIVERS_BASE.concat(DRIVERS_EXTRA), palette = [0xd96a32,0x347f92,0xbac89c,0xd9b752,0xa74438,0xe1ded0,0x343e52,0x589580,0xb688a1,0x73a9b2,0x8b5a44,0x4f6d4f];
      return R.drivers.map((r, i) => {
        const rating = Math.round(r.st.reduce((a,b)=>a+b,0)/8*100), lg = legacy[i % legacy.length];
        return { name:r.n, short:r.s, number:r.num, color: i < 20 ? TEAM_DEFS[i % 10].color : palette[i % palette.length], accent: lg.accent, nationality:r.c, age:r.a, personality:r.p, stats:r.st.slice(),
          photo:r.ph, rosterId:r.id, id:i, rating, salary: Math.round((2000 + rating*350) / 100) * 100, marketValue: Math.round((rating*rating*30) / 1000) * 1000, contractRounds:0, teamId:null };
      });
    }
    let id = 0;
    const all = DRIVERS_BASE.concat(DRIVERS_EXTRA).map(d => {
      const rating = Math.round(d.stats.reduce((a,b)=>a+b,0)/8*100);
      return Object.assign({}, d, {
        id: id++,
        rating,
        salary: Math.round((2000 + rating*350) / 100) * 100,
        marketValue: Math.round((rating*rating*30) / 1000) * 1000,
        contractRounds: 0,
        teamId: null
      });
    });
    return all;
  }
  const TEAM_DEFS = [
    {name:'Pegasus Racing',color:0x1560b0,profile:'BALANCED',logo:'pegasusracing.jpg'},
    {name:'Valiant Racing',color:0x3aa6d8,profile:'FACTORY',logo:'valiantracing.jpg'},
    {name:'Deerson Racing Team',color:0x1f6b35,profile:'DEVELOPMENT',logo:'deersonracingteam.jpg'},
    {name:'Trax Super Touring Team',color:0x2ee62e,profile:'BUDGET',logo:'traxsupertouringteam.jpg'},
    {name:'Tyrannos Super Touring Team',color:0xf2c318,profile:'AGGRESSIVE',logo:'tyrannosupertouringteam.jpg'},
    {name:'Orbital RaceCola Racing',color:0x1d3a6e,profile:'TYRE SPECIALIST',logo:'orbitalracecolaracing.jpg'},
    {name:'Glance Performance Racing',color:0xe8782a,profile:'FACTORY',logo:'glanceperformanceracing.jpg'},
    {name:'Hashiru Racing Team',color:0xd42a2a,profile:'BALANCED',logo:'hashiruracingteam.jpg'},
    {name:'Kaiser Racing Team',color:0xd08ad8,profile:'BUDGET',logo:'kaiserracingteam.jpg'},
    {name:'EAG Valant Oil Performance',color:0xc76fd0,profile:'AGGRESSIVE',logo:'eagvalantoilperformanceracing.jpg'}
  ];
  function freshParts(){
    const parts = {};
    PART_TYPES.forEach(t => parts[t] = {rarity:'COMMON', level:1, dupes:0});
    return parts;
  }
  function makeTeam(index, def, isPlayer){
    return {
      id: index,
      name: def.name,
      logo: def.logo,
      color: def.color,
      profile: def.profile,
      isPlayer: !!isPlayer,
      credits: isPlayer ? 450000 : Math.round(150000 + Math.random()*350000),
      materials: isPlayer ? 150 : 0,
      reputation: isPlayer ? 45 : Math.round(30 + Math.random()*45),
      prestige: isPlayer ? 40 : Math.round(30 + Math.random()*45),
      development: 0,
      points: 0, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, dnfs: 0,
      driverIds: [index, 10 + index],
      activeDriverId: index,
      bodyType: Object.keys(BODIES)[index % Object.keys(BODIES).length],
      ownedBodies: isPlayer ? [Object.keys(BODIES)[index % Object.keys(BODIES).length]] : null,
      parts: isPlayer ? freshParts() : null,
      componentUsage: { engine: 0, gearbox: 0 },
      gridPenaltyNext: 0,
      sponsors: [null, null, null]
    };
  }
  function newCareer(){
    const driversPool = makeDriverPool();
    const teams = TEAM_DEFS.map((def,i) => makeTeam(i, def, i === 0));
    teams.forEach(team => team.driverIds.forEach(did => { if (driversPool[did]) driversPool[did].teamId = team.id; }));
    const shuffledTracks = [...TRACKS];
    const calendar = Array.from({length:TRACKS.length}, (_,i) => ({ round:i+1, trackId: shuffledTracks[i % shuffledTracks.length].id, completed:false, result:null, gridPenalty:false }));
    return {
      version: 5,
      season: 1,
      roundIndex: 0,
      teams,
      driversPool,
      calendar,
      regulations: JSON.parse(JSON.stringify(DEFAULT_REGULATIONS)),
      championship: { driverPoints:{}, teamPoints:{}, history:[] },
      fragments: {},
      news: [{title:'TEMPORADA 1 EN MARCHA', detail:'La Serie Nacional GT3 arranca con diez escuderías en pista.', round:1}],
      practice: { score:0, confidence:35, setup:defaultSetup(), lastRoundPracticed:-1 },
      strategy: { compound:'M', stops:1, pace:'standard', aggression:'standard', tyreMgmt:'standard', fuel:'standard' },
      qualifyingDoneRound: -1,
      voteResolved: true
    };
  }
  function defaultSetup(){
    return { downforce:50, suspension:50, gearRatio:50, brakeBias:50, tyrePressure:50, rideHeight:50, differential:50 };
  }
  // Fechas de calendario: la ronda 1 se corre el domingo 8 de marzo del año de la temporada (temporada 1 = 2026) y hay una carrera cada 14 días.
  function raceDate(season, round){ return new Date(Date.UTC(2025 + season, 2, 8 + (Math.max(1, round) - 1) * 14)); }
  function fmtRaceDate(season, round){ return raceDate(season, round).toLocaleDateString('es-ES', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
  function playerTeam(career){ return career.teams[0]; }
  function currentRound(career){ return career.calendar[career.roundIndex]; }
  function currentTrack(career){ const r = currentRound(career); return TRACKS.find(t => t.id === r.trackId) || TRACKS[0]; }
  function activeDriver(career, team){ return career.driversPool.find(d => d.id === team.activeDriverId) || career.driversPool.find(d => d.id === team.driverIds[0]); }
  function teamDrivers(career, team){ return team.driverIds.map(id => career.driversPool.find(d => d.id === id)).filter(Boolean); }
  
  const LIVERY_PATTERNS = {none:'Liso',center:'Franja central',twin:'Doble línea',side:'Cinta lateral',nose:'Trompa bicolor',dual:'Bicolor dividido',chevron:'Chevrones',checker:'Cuadros',diag:'Cortes diagonales'};
  const hexColor = n => '#' + (n >>> 0).toString(16).padStart(6,'0').slice(-6);
  function liveryFor(team){
    const pats = ['center','side','twin','nose','dual','chevron','checker','diag'];
    const base = team.livery || {primary:hexColor(team.color), secondary:'#f2f5f3', accent:'#111820', roof:null, pattern:pats[team.id % pats.length]};
    // anunciantes: los contratos del jugador; los rivales llevan dos anunciantes ficticios fijos
    const sp = team.isPlayer ? (team.sponsors||[]).filter(Boolean).map(x => x.name) : [SPONSOR_POOL[(team.id*2)%SPONSOR_POOL.length].name, SPONSOR_POOL[(team.id*2+1)%SPONSOR_POOL.length].name];
    return Object.assign({}, base, {sponsors: sp});
  }
  function computePlayerCarRating(team){
    const body = BODIES[team.bodyType] || BODIES.classic;
    const axes = { top:.5, accel:.5, brake:.5, corner:.5, control:.5 };
    Object.keys(body.axes).forEach(k => axes[k] += body.axes[k]);
    PART_TYPES.forEach(type => {
      const part = team.parts[type];
      if (!part) return;
      const info = RARITY_INFO[part.rarity];
      const power = (part.level / info.maxLevel) * info.mult * .5;
      const weights = PART_AXES[type];
      Object.keys(weights).forEach(axis => axes[axis] += weights[axis] * power);
    });
    Object.keys(axes).forEach(k => axes[k] = clamp01(axes[k], .25, 1.12));
    return axes;
  }
  function computeAiCarRating(team){
    const base = .55 + (team.prestige/100)*.3 + team.development*.02;
    const v = clamp01(base, .35, 1.05);
    return { top:v, accel:v, brake:v, corner:v, control:v };
  }
  function effectiveStats(driver, team, setupBonus){
    const rating = team.isPlayer ? computePlayerCarRating(team) : computeAiCarRating(team);
    const bonus = setupBonus || 0;
    const blend = (dv, cv) => clamp01(dv*.55 + cv*.45, .32, 1.1);
    return {
      top: blend(driver.stats[0], rating.top),
      accel: blend(driver.stats[1], rating.accel),
      brake: blend(driver.stats[2], rating.brake),
      corner: blend(driver.stats[3], rating.corner + bonus*.15),
      control: blend(driver.stats[4], rating.control + bonus*.1),
      aggression: driver.stats[5],
      consistency: clamp01(driver.stats[6] + bonus*.08, 0, 1),
      overtake: driver.stats[7]
    };
  }
  function partRatingSummary(type, part){
    const info = RARITY_INFO[part.rarity];
    const power = (part.level / info.maxLevel) * info.mult * .5;
    const weights = PART_AXES[type];
    return Object.keys(weights).filter(axis => weights[axis] !== 0).map(axis => ({axis, label: AXIS_LABELS[axis], value: Math.round(weights[axis]*power*100)}));
  }
  
  // ---- Economy ---------------------------------------------------------------
  function canAfford(team, cost){ return team.credits >= cost; }
  function spend(team, cost){ team.credits -= cost; }
  function earn(team, amount){ team.credits += Math.round(amount); }
  
  // ---- Packs -------------------------------------------------------------
  function rollRarity(odds){
    const r = Math.random();
    let acc = 0;
    for (const rarity of RARITY_ORDER){
      acc += odds[rarity] || 0;
      if (r <= acc) return rarity;
    }
    return 'COMMON';
  }
  function openPack(career, packId){
    const pack = PACKS[packId];
    const team = playerTeam(career);
    if (!canAfford(team, pack.cost)) return null;
    spend(team, pack.cost);
    const results = [];
    for (let i=0;i<pack.cards;i++){
      const rarity = rollRarity(pack.odds);
      const type = PART_TYPES[Math.floor(Math.random()*PART_TYPES.length)];
      results.push(applyFragment(career, type, rarity));
    }
    return results;
  }
  function applyFragment(career, type, rarity){
    const team = playerTeam(career);
    const part = team.parts[type];
    const rarityRank = RARITY_ORDER.indexOf(rarity);
    const currentRank = RARITY_ORDER.indexOf(part.rarity);
    let leveledUp = false, rarityUp = false;
    if (rarityRank > currentRank){
      // A higher-rarity drop replaces the part outright at level 1.
      part.rarity = rarity; part.level = 1; part.dupes = 0; rarityUp = true;
    } else {
      part.dupes++;
      const info = RARITY_INFO[part.rarity];
      if (part.dupes >= info.dupToLevel && part.level < info.maxLevel){
        part.dupes -= info.dupToLevel;
        part.level++;
        leveledUp = true;
      }
    }
    return { type, rarity, leveledUp, rarityUp, part };
  }
  function upgradePart(career, type){
    const team = playerTeam(career);
    const part = team.parts[type];
    const info = RARITY_INFO[part.rarity];
    if (part.level >= info.maxLevel) return false;
    const cost = 3000 + part.level*1500;
    const materialsCost = 5 + part.level*2;
    if (!canAfford(team, cost) || team.materials < materialsCost) return false;
    spend(team, cost);
    team.materials -= materialsCost;
    part.level++;
    return true;
  }
  
  // ---- Save system ------------------------------------------------------
  const SAVE_KEY = 'apexGT3ManagerSave';
  function saveCareer(career){
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(career)); return true; }
    catch(e){ console.warn('No se pudo guardar la partida', e); return false; }
  }
  function loadCareer(){
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.teams || !parsed.driversPool || !parsed.calendar) return null;
      if (window.LRO_ROSTER && !parsed.driversPool.some(d => d.rosterId)) return null;   // carrera con la base de pilotos anterior: se descarta (empieza una nueva con los pilotos reales)
      return migrateCareer(parsed);
    } catch(e){ console.warn('Save corrupto, se descarta.', e); return null; }
  }
  function resetSave(){ try { localStorage.removeItem(SAVE_KEY); } catch(e){} }
  
  'use strict';
  // ==========================================================================
  // CIRCUITOS DE LA SERIE NACIONAL GT3 — geografía y lore del mundo ficticio + carga de trazados externos.
  //
  // Cada circuito tiene su ficha (CIRCUIT_META): nación, región, año, historia, carácter, curvas con nombre y
  // una descripción del paisaje. El trazado (layout) y el decorado (props) de hoy son PLACEHOLDERS: para reemplazarlos
  // basta con poner circuits/<id>.json (ver CIRCUITOS_PARA_IA.md); si el archivo existe, pisa el trazado interno.
  // Las naciones son las de assets/nations/ (mundo ficticio de Eternal Manager).
  // ==========================================================================
  const CIRCUIT_META = {
   "valleverde": {
    "nation": "Peronia",
    "region": "San Esteban",
    "opened": 1961,
    "kind": "Clásico permanente de campo",
    "theme": "grass",
    "km": 1.9,
    "turns": 12,
    "silhouette": "Óvalo alargado con una horquilla al final de la recta y una zona de eses en el fondo; sentido horario.",
    "ground": "#9dcc95",
    "sky": "#b6c4bd",
    "lore": "Primer autódromo permanente de la Serie Nacional. Se trazó en 1961 sobre el camino de tierra que unía dos estancias del valle de San Esteban y todavía se corre con las tribunas de madera originales en la recta principal.",
    "character": "Rápido y equilibrado: el circuito de referencia para comparar autos y el primero al que llega un equipo nuevo.",
    "quirk": "Un molino de viento gira junto a los boxes; los pilotos lo usan como referencia de dirección del viento.",
    "corners": [
     [
      "La Horqueta",
      "derecha lenta al final de la recta principal; frenada fuerte y única zona clara de sobrepaso"
     ],
     [
      "El Alambrado",
      "izquierda-derecha rápida en tercera, sin margen en la salida"
     ],
     [
      "Puente Viejo",
      "derecha de radio constante sobre un puentecito de piedra"
     ],
     [
      "Los Álamos",
      "curva ciega de izquierda entre dos hileras de álamos"
     ]
    ],
    "landscape": "Pastizales verdes, hileras de álamos, alambrados de campo, cerros bajos al fondo, molino de viento junto a los boxes y tribunas de madera pintadas de blanco.",
    "props": "una hilera de álamos (tree round) paralela a la recta trasera, un molino (cylinder + 4 box finas), un galpón de estancia (box + cone) y alambrados (box finas y largas) a 24 m del eje."
   },
   "autodromocentral": {
    "nation": "Estovackia",
    "region": "Tellin",
    "opened": 1952,
    "kind": "Industrial mixto en talleres ferroviarios",
    "theme": "city",
    "km": 1.7,
    "turns": 13,
    "silhouette": "Rectas cortas unidas por curvas de 90° y una chicane doble; parece un plano de vías, con horquillas cerradas.",
    "ground": "#8e918c",
    "sky": "#a9adb0",
    "lore": "Autódromo levantado dentro de las antiguas naves de reparación de locomotoras de Tellin, en Estovackia. Los boxes son las naves originales de chapa y el trazado esquiva las vías que quedaron a la vista. Se lo conoce por las frenadas.",
    "character": "Técnico y duro con los frenos: cuatro de sus curvas lentas llegan después de rectas largas. Poca velocidad punta, mucho trabajo de pedal.",
    "quirk": "Cruza una vía muerta con un tren museo estacionado; las bocinas del tren suenan en la largada.",
    "corners": [
     [
      "Los Talleres",
      "izquierda de 90° tras la recta principal, muy cerrada"
     ],
     [
      "La Chimenea",
      "horquilla de derecha rodeando una chimenea de ladrillo"
     ],
     [
      "Horno Alto",
      "chicane rápida de derecha-izquierda con muros cercanos"
     ],
     [
      "Cambio de Agujas",
      "S lenta sobre un empedrado de vía"
     ]
    ],
    "landscape": "Naves industriales de ladrillo y chapa, vías oxidadas, chimeneas, vagones abandonados, silos, tribunas metálicas bajas y cielo gris de invierno.",
    "props": "chimeneas (cylinder altos), naves (box largas con techo box más finas), vagones (box 12x3x3) en fila, un silo (cylinder), una torre de agua (cylinder + cone)."
   },
   "costasur": {
    "nation": "Valurria",
    "region": "Punta Marea",
    "opened": 1974,
    "kind": "Costero con viento cruzado",
    "theme": "coast",
    "km": 1.9,
    "turns": 12,
    "silhouette": "Trazado que serpentea entre médanos: una recta de cara al mar, una S lenta en el espigón y un giro largo de derecha; sentido antihorario.",
    "ground": "#d8caa0",
    "sky": "#afcfdf",
    "lore": "Pista sobre la costa de Punta Marea, entre médanos y un faro. El viento cruzado del sur mueve la arena sobre el asfalto y cambia el agarre vuelta a vuelta; llueve seguido.",
    "character": "Técnico y cambiante. Se gana con el ajuste de alerones y la lectura del clima más que con motor.",
    "quirk": "Un faro rojo y blanco marca el punto de frenada de la curva 1.",
    "corners": [
     [
      "Faro",
      "derecha larga en bajada que acaba de cara al mar"
     ],
     [
      "La Escollera",
      "S lenta junto a un espigón de roca"
     ],
     [
      "Médano",
      "izquierda ciega sobre una duna; se ensucia con arena"
     ]
    ],
    "landscape": "Médanos con pasto duro, faro blanco y rojo, escollera de rocas, mar abierto, casas bajas de madera y cielo cambiante.",
    "props": "el faro (cylinder + cone + sphere), el mar (water enorme a un lado), la escollera (sphere achatadas grises), casas de madera (box + cone) y dunas (sphere con squash 0.3)."
   },
   "montrealpl": {
    "nation": "Kaigam",
    "region": "Monteral",
    "opened": 1978,
    "kind": "Ribera y horquillas",
    "theme": "grass",
    "km": 2.4,
    "turns": 12,
    "silhouette": "Dos rectas largas unidas por horquillas de 180° y un tramo rápido junto al río; sentido horario.",
    "ground": "#7f9578",
    "sky": "#a7b3b8",
    "lore": "Parque de carreras junto a un río que se congela en invierno. El asfalto tarda en calentar y castiga a los neumáticos duros; el muro exterior de la última chicane es famoso por su cantidad de choques.",
    "character": "Rectas largas y horquillas: velocidad punta y frenada. Alta posibilidad de sobrepaso.",
    "quirk": "Cada largada empieza con la banda del club de regatas tocando el himno junto al puente de hierro.",
    "corners": [
     [
      "Horquilla del Molino",
      "izquierda de 180° al final de la recta más larga"
     ],
     [
      "Puente Alto",
      "derecha rápida en peralte sobre el río"
     ],
     [
      "Muro de los Campeones",
      "chicane final con muro exterior a un metro"
     ]
    ],
    "landscape": "Abetos oscuros, río ancho, tribunas de acero, puente de hierro, banderas del club de regatas y taludes con nieve sucia.",
    "props": "abetos (tree pine), el río (water largo y angosto), un puente de hierro (box finas), banderas (cylinder finos) y taludes de nieve (sphere achatadas blancas)."
   },
   "sierragp": {
    "nation": "Costas Unidas",
    "region": "Villa Sierra",
    "opened": 1988,
    "kind": "De montaña, en ladera",
    "theme": "mountain",
    "km": 2.1,
    "turns": 12,
    "silhouette": "Vueltas en zigzag como una ladera: dos horquillas, una S encadenada y una cresta rápida; sentido antihorario.",
    "ground": "#a58b6c",
    "sky": "#b7c3cf",
    "lore": "Circuito de montaña abierto en 1988 sobre la ladera de Villa Sierra. Tiene 46 metros de desnivel entre el punto más alto y el más bajo y casi ninguna zona plana (en el juego la pista es plana: el desnivel vive en la ficha y en el paisaje).",
    "character": "Desnivel y técnica. Curvas ciegas en cresta y bajadas que exigen confianza en los frenos.",
    "quirk": "Un teleférico cruza sobre la horquilla más lenta y los pilotos ven las cabinas pasar arriba.",
    "corners": [
     [
      "Cresta",
      "derecha ciega en la cima de la subida"
     ],
     [
      "El Tobogán",
      "bajada en S con frenada a mitad de curva"
     ],
     [
      "La Herradura",
      "horquilla de izquierda en contra-pendiente"
     ]
    ],
    "landscape": "Ladera de cerro con matorral seco, cables de un teleférico, taludes de tierra roja, casas blancas en la parte alta y tribunas en terrazas.",
    "props": "cerros (sphere achatadas color tierra), torres de teleférico (cylinder finos + box), casas blancas (box + box techo) en terrazas, matorral (sphere pequeñas)."
   },
   "pampacircuit": {
    "nation": "Kostanay",
    "region": "Altyn Dala",
    "opened": 1957,
    "kind": "Óvalo abierto en la estepa",
    "theme": "grass",
    "km": 2.6,
    "turns": 11,
    "silhouette": "Óvalo grande y casi plano con curvas anchas y un pequeño quiebre en el fondo; sentido horario.",
    "ground": "#b9b56a",
    "sky": "#c5cfd4",
    "lore": "Óvalo enorme en la estepa de Kostanay, construido en 1957 por una cooperativa de cosmonautas retirados que probaban máquinas junto a la vieja base de lanzamientos. Se sortean sus entradas en la feria de ganado de la aldea de Altyn Dala.",
    "character": "Rápido, abierto y con poca lluvia. Gana quien mejor cuida los neumáticos y la aerodinámica; el viento de la estepa mueve la carrera.",
    "quirk": "Los cohetes oxidados del viejo campo de lanzamiento se ven de fondo en la recta trasera.",
    "corners": [
     [
      "La Manga",
      "derecha larga y ancha de 200 metros, plena en cuarta"
     ],
     [
      "El Yurta",
      "izquierda cerrada, la única frenada fuerte"
     ],
     [
      "Bebedero",
      "curva rápida de derecha con borde de pasto"
     ]
    ],
    "landscape": "Estepa dorada sin árboles, horizonte plano, yurtas y tanques de agua, un cohete oxidado y torres de lanzamiento lejanas, tribunas de chapa y un silo junto a los boxes.",
    "props": "yurtas (cylinder bajo + cone), cohete oxidado (cylinder + cone) y torre de lanzamiento (box altos finos) a 150 m del eje, silos (cylinder), tanques (cylinder)."
   },
   "litoralring": {
    "nation": "Morvicia",
    "region": "Puerto Litoral",
    "opened": 1969,
    "kind": "De ribera húmedo",
    "theme": "forest",
    "km": 2.2,
    "turns": 12,
    "silhouette": "Curvas medias encadenadas que siguen la orilla, con un rulo de horquilla en la zona más baja; sentido antihorario.",
    "ground": "#8aa27a",
    "sky": "#b8c6c3",
    "lore": "Circuito de ribera sobre un río ancho lleno de islas. La humedad no baja nunca y la niebla de la mañana retrasa las largadas con frecuencia; llueve en cuatro de cada diez fechas.",
    "character": "Fluido y húmedo. Trazado de curvas medias encadenadas donde el agarre cambia según el tramo.",
    "quirk": "Las lanchas del club náutico saludan a la carrera desde el agua con bocinas.",
    "corners": [
     [
      "Isla Larga",
      "derecha rápida junto al agua, se inunda primero"
     ],
     [
      "Camalote",
      "S lenta entre pastos altos"
     ],
     [
      "Boya",
      "izquierda de radio decreciente en la zona más baja"
     ]
    ],
    "landscape": "Río marrón con islas, sauces y juncos, muelles de madera, lanchas amarradas, niebla baja y tribunas sobre pilotes.",
    "props": "el río (water grande), sauces (tree round color verde apagado), muelles (box largas y finas sobre el agua), lanchas (box + cone) y tribunas sobre pilotes (grandstand)."
   },
   "nortespeed": {
    "nation": "Magayanes",
    "region": "Ciudad Norte",
    "opened": 1996,
    "kind": "Óvalo peraltado de estadio",
    "theme": "grass",
    "km": 2.5,
    "turns": 8,
    "silhouette": "Óvalo alargado sin curvas lentas: dos peraltes grandes unidos por rectas; sentido antihorario.",
    "ground": "#7da06e",
    "sky": "#c2cdd0",
    "lore": "Speedway con peralte levantado para la copa de estadios de Magayanes. Es el circuito más caluroso de la serie y el único donde las curvas se toman con el auto inclinado (en el juego, sin peralte real).",
    "character": "Velocidad pura sobre óvalo. Se corre en pelotón, con succión y cambios de líder.",
    "quirk": "Se corre con los mástiles de luz encendidos, incluso de día, por la tradición del estadio.",
    "corners": [
     [
      "Peralte Grande",
      "curva 1-2 peraltada, 24° de inclinación"
     ],
     [
      "El Embudo",
      "entrada estrecha en la curva 3"
     ],
     [
      "Cafetal",
      "curva final peraltada hacia la recta de boxes"
     ]
    ],
    "landscape": "Estadio cerrado con tribunas altas en todo el perímetro, mástiles de luz, calor en el aire, cafetales y montañas verdes a lo lejos.",
    "props": "tribunas altas continuas (grandstand y box largas), mástiles de luz (cylinder finos altos con box arriba), cafetales (tree round en filas) y montañas (sphere gigantes) lejos."
   },
   "desiertoring": {
    "nation": "Sahar",
    "region": "Oasis Dorado",
    "opened": 2003,
    "kind": "Desierto al atardecer",
    "theme": "desert",
    "km": 2.3,
    "turns": 12,
    "silhouette": "Trazado abierto que rodea el oasis con una recta larga trasera y una chicane entre dos muros; sentido horario.",
    "ground": "#dabc87",
    "sky": "#e6c9a0",
    "lore": "Pista abierta entre las dunas del desierto de Sahar, junto a un oasis con palmeras. Casi no llueve y el asfalto pasa de 50 °C al mediodía, por eso se corre al atardecer.",
    "character": "Calor extremo y arena. El desgaste de neumáticos y la refrigeración mandan.",
    "quirk": "El paddock es un campamento de tiendas de tela; el té se sirve entre sesiones.",
    "corners": [
     [
      "La Duna",
      "derecha larga que se cubre de arena con el viento"
     ],
     [
      "Zoco",
      "chicane lenta entre dos muros de adobe"
     ],
     [
      "Espejismo",
      "derecha rápida al final de la recta trasera"
     ]
    ],
    "landscape": "Dunas color ocre, palmeras del oasis, muros de adobe, tiendas de tela en el paddock, cielo anaranjado y sol bajo.",
    "props": "dunas (sphere achatadas ocre), el oasis (water pequeña + tree round verde oscuro), muros de adobe (box), tiendas (cone + box)."
   },
   "patagoniapark": {
    "nation": "Baikal",
    "region": "Bahía de Hielo",
    "opened": 2009,
    "kind": "Sobre lago congelado",
    "theme": "mountain",
    "km": 2.0,
    "turns": 13,
    "silhouette": "Trazado amplio sobre una bahía: una recta larga junto a la costa, una horquilla enorme y una zona de curvas ligadas; sentido antihorario.",
    "ground": "#e6eef3",
    "sky": "#c9d6df",
    "lore": "Circuito trazado sobre la bahía de un lago de aguas profundas de Baikal, en el Continente Viejo. En invierno el hielo alcanza un metro y se levanta un asfalto de emergencia con bordes de nieve compactada; sólo tres fechas por temporada tienen luz de sol suficiente.",
    "character": "Frío extremo, agarre bajo y viento lateral. Neumáticos difíciles de calentar y mucho subviraje; el error se paga con un muro de nieve.",
    "quirk": "Los boxes son cabañas de madera sobre patines que remolcan al final de cada temporada.",
    "corners": [
     [
      "Cabo Frío",
      "derecha ciega con viento lateral fuerte"
     ],
     [
      "Grieta",
      "horquilla de izquierda pegada a una fisura marcada con banderines"
     ],
     [
      "La Isla",
      "curva rápida de izquierda alrededor de un islote de rocas"
     ]
    ],
    "landscape": "Superficie blanca y azul de hielo, montañas nevadas, pinos oscuros en la costa, cabañas sobre patines, pescadores a lo lejos y cielo bajo.",
    "props": "hielo (water blanquecina o box planas), pinos (tree pine) en la costa, cabañas (box + cone rojas), un rompehielos (box + cylinder) a un costado, montañas (sphere achatadas blancas)."
   },
   "atlanticospeed": {
    "nation": "Grammes",
    "region": "Cabo Espuma",
    "opened": 1982,
    "kind": "Costero rápido",
    "theme": "coast",
    "km": 2.1,
    "turns": 10,
    "silhouette": "Rectas largas y curvas rápidas en línea con el acantilado; sólo una frenada lenta; sentido antihorario.",
    "ground": "#cfc6a2",
    "sky": "#b3d0e0",
    "lore": "Pista rápida sobre la costa de Grammes, con vista al océano abierto. El aire salado corroe todo lo metálico y los equipos lavan los autos entre sesiones.",
    "character": "Velocidad y viento. Pocas frenadas y muchos sobrepasos en la recta larga.",
    "quirk": "Los banderilleros usan chalecos naranjas para no perderse entre las gaviotas.",
    "corners": [
     [
      "Espuma",
      "derecha de alta velocidad al inicio de la vuelta"
     ],
     [
      "Rompiente",
      "izquierda lenta después de la recta trasera"
     ],
     [
      "Bahía",
      "largo giro de derecha con vista al mar"
     ]
    ],
    "landscape": "Acantilados bajos, mar azul, faros pequeños, casas encaladas de techo naranja, gaviotas y tribunas frente al agua.",
    "props": "mar (water grande), acantilado (box larga baja gris), faros (cylinder + cone), casas encaladas (box blancas + box naranjas)."
   },
   "selvaverde": {
    "nation": "Riada",
    "region": "Río Verde",
    "opened": 1999,
    "kind": "Selva húmeda cerrada",
    "theme": "forest",
    "km": 2.0,
    "turns": 12,
    "silhouette": "Circuito con muchos cambios de dirección, sin rectas largas salvo la principal; sentido horario.",
    "ground": "#5f8f5a",
    "sky": "#9db7a8",
    "lore": "Circuito dentro de la selva de Riada, abierto a machete y asfalto en 1999. Llueve más de la mitad de las fechas y la humedad deja el asfalto brillante incluso con sol.",
    "character": "Húmedo, cerrado y con poco espacio. Curvas técnicas rodeadas de vegetación.",
    "quirk": "Tucanes y monos aulladores interrumpen las prácticas; hay un equipo de cuidadores de fauna en los boxes.",
    "corners": [
     [
      "Liana",
      "derecha lenta bajo un túnel de árboles"
     ],
     [
      "Cascada",
      "izquierda rápida junto a una caída de agua"
     ],
     [
      "Curva del Caimán",
      "horquilla junto a un arroyo, con barro en la salida"
     ]
    ],
    "landscape": "Selva densa, helechos gigantes, arroyos, palmeras altas, neblina, tribunas de madera con techo de paja y cielo tapado.",
    "props": "palmeras y árboles altos (tree round de 18–30 m, verdes oscuros) muy juntos, arroyos (water finas), cascada (box alta azul clara), tribunas con techo de paja (grandstand + cone)."
   },
   "puertourbano": {
    "nation": "Iberia",
    "region": "Puerto Nuevo",
    "opened": 2011,
    "kind": "Circuito de calle en muelles",
    "theme": "city",
    "km": 2.0,
    "turns": 13,
    "silhouette": "Calles cuadriculadas entre galpones: ángulos rectos, chicanes estrechas y una recta paralela al muelle; sentido antihorario.",
    "ground": "#7e8286",
    "sky": "#b1bcc4",
    "lore": "Circuito de calle entre los muelles y galpones del puerto de Iberia. Se arma y desarma en cinco días con vallas de hormigón y las grúas de carga miran la carrera desde arriba.",
    "character": "Urbano y de frenadas fuertes. Paredes muy cerca, casi ningún margen de error.",
    "quirk": "Un buque de carga amarrado tapa la vista de la recta del muelle y se va al día siguiente.",
    "corners": [
     [
      "La Grúa",
      "derecha de 90° debajo de una grúa portacontenedores"
     ],
     [
      "Muelle 4",
      "chicane estrecha entre galpones"
     ],
     [
      "Aduana",
      "izquierda lenta con salida cerrada"
     ]
    ],
    "landscape": "Contenedores apilados, grúas portuarias, galpones de chapa, vallas de hormigón, edificios de oficinas al fondo y barcos amarrados.",
    "props": "contenedores (box 12x2.6x2.4, colores vivos, apilados), grúas (box altas + box horizontal), galpones (box), el buque (box + box), agua del puerto (water)."
   },
   "lagunaazul": {
    "nation": "Netanya",
    "region": "Orilla Baja",
    "opened": 2013,
    "kind": "Salar bajo el nivel del mar",
    "theme": "desert",
    "km": 2.3,
    "turns": 13,
    "silhouette": "Óvalo irregular junto a un lago salado: tramo rápido paralelo a la orilla, horquilla lenta y una S doble; sentido horario.",
    "ground": "#e7dfcc",
    "sky": "#d9e3ea",
    "lore": "Circuito junto al mar salado de Netanya, en el Continente Viejo: es el punto más bajo de todo el calendario, a 400 metros bajo el nivel del mar. El aire denso da más agarre y más motor, y la costra de sal brilla bajo el sol; la carrera termina antes del mediodía por el calor.",
    "character": "Calor seco, aire denso y sal en el asfalto. Frenadas estables y curvas rápidas; el desgaste de neumáticos es bajo pero el sobrecalentamiento amenaza.",
    "quirk": "Los pilotos pueden flotar en el lago tras la carrera: es una tradición y el equipo ganador se tira vestido.",
    "corners": [
     [
      "Orilla",
      "derecha larga pegada al lago salado"
     ],
     [
      "La Costra",
      "horquilla de izquierda sobre sal blanca, agarre bajo"
     ],
     [
      "Gemelas",
      "S doble de derecha-izquierda antes de la recta principal"
     ]
    ],
    "landscape": "Lago de agua celeste turquesa con costra de sal blanca, colinas ocres al fondo, palmeras datileras, tiendas de un mercado y un mirador.",
    "props": "el lago (water celeste grande), sal (box planas blancas), colinas (sphere achatadas ocre), palmeras (tree round verde), tribuna larga baja (grandstand) y toldos (box)."
   },
   "andesendurance": {
    "nation": "Sotoa",
    "region": "Alto Sotoa",
    "opened": 2005,
    "kind": "Altiplano de resistencia",
    "theme": "mountain",
    "km": 3.1,
    "turns": 14,
    "silhouette": "Circuito largo con dos rectas, una zona técnica en bajada y un giro final ancho; es el más extenso del calendario; sentido antihorario.",
    "ground": "#b09a7a",
    "sky": "#a9c8e6",
    "lore": "Circuito en el altiplano de Sotoa, a más de tres mil metros. El aire fino le quita potencia a los motores y hace trabajar más a los frenos. Es el más largo del calendario.",
    "character": "Exigente y largo, con 14 curvas. Se gana con constancia, no con una vuelta rápida.",
    "quirk": "Los equipos cargan tubos de oxígeno y las bocinas suenan en quechua-sotoano para avisar las banderas.",
    "corners": [
     [
      "Apacheta",
      "curva rápida de derecha sobre una loma con mojones de piedra"
     ],
     [
      "El Salar",
      "recta con curva ciega final sobre una costra de sal"
     ],
     [
      "Paso del Cóndor",
      "combinación lenta izquierda-derecha en la bajada"
     ]
    ],
    "landscape": "Altiplano seco, cerros pelados color tierra, salar blanco, llamas, cielo azul muy profundo, banderas de colores y casas de adobe.",
    "props": "cerros pelados (sphere achatadas), llamas (box pequeñas + box), casas de adobe (box), banderas de colores (cylinder finos), salar (box plana blanca)."
   },
   "pampavelocity": {
    "nation": "Skote",
    "region": "Karoo Ancho",
    "opened": 2000,
    "kind": "Tri-óvalo de alta velocidad",
    "theme": "grass",
    "km": 2.9,
    "turns": 11,
    "silhouette": "Tri-óvalo casi plano con tres rectas largas y curvas amplias; sentido horario.",
    "ground": "#c4b072",
    "sky": "#bcd0d8",
    "lore": "Trazado muy rápido en la sabana de Skote, construido para batir marcas. Casi no tiene frenadas y por eso los ingenieros lo llaman «la autopista con banderas»; al atardecer las acacias proyectan sombras largas sobre el asfalto.",
    "character": "Velocidad máxima y poco desgaste de frenos. Muchísima succión y adelantamientos.",
    "quirk": "Una manada de jirafas suele cruzar el fondo del paisaje durante las clasificaciones.",
    "corners": [
     [
      "Tornado",
      "derecha larga plena a fondo"
     ],
     [
      "Cuarenta",
      "curva ciega de izquierda a 40 metros de la valla"
     ],
     [
      "Meseta",
      "chicane rápida antes de la recta principal"
     ]
    ],
    "landscape": "Sabana dorada con acacias de copa plana, termiteros, cerros aislados (kopjes), cielo abierto, tribunas largas y bajas.",
    "props": "acacias (tree round de copa achatada, color oliva), kopjes (sphere achatadas grises), termiteros (cone), tribunas largas bajas (grandstand)."
   },
   "santacruz": {
    "nation": "Melonia",
    "region": "Santa Cruz",
    "opened": 1997,
    "kind": "Histórico de colinas y viñedos",
    "theme": "forest",
    "km": 2.4,
    "turns": 15,
    "silhouette": "Circuito sinuoso con muchas curvas de medio radio, dos horquillas y una subida final; sentido horario.",
    "ground": "#8fa574",
    "sky": "#b9c7d1",
    "lore": "Circuito en las colinas de Melonia, con un castillo en la cima y viñedos alrededor. Se corrió por primera vez en 1997 sobre un camino de carreta y hoy conserva el trazado original con curvas cerradas entre muros de piedra.",
    "character": "Sinuoso y técnico, con 15 curvas y muchos cambios de ritmo. Es de los más largos en tiempo de vuelta.",
    "quirk": "El público invade el borde del asfalto con mesas de vino durante la carrera (detrás de las vallas, claro).",
    "corners": [
     [
      "La Arboleda",
      "derecha rápida entre árboles pegados a la pista"
     ],
     [
      "El Claro",
      "horquilla lenta en un claro con sol"
     ],
     [
      "Cementerio",
      "izquierda ciega en subida junto a un muro de piedra"
     ]
    ],
    "landscape": "Colinas de viñedos en hileras, un castillo, cipreses, muros de piedra, campanario y tribunas de piedra.",
    "props": "viñedos (tree round bajos en hileras), castillo (box + cylinder + cone), cipreses (tree pine finos), muros de piedra (box), campanario (box + cone)."
   },
   "nocturnaring": {
    "nation": "Overmark",
    "region": "Nordhavn",
    "opened": 2015,
    "kind": "Nocturno polar con aurora",
    "theme": "night",
    "km": 2.2,
    "turns": 13,
    "silhouette": "Circuito junto a un fiordo, con recta iluminada, horquilla junto al puerto y una zona de curvas ligadas; sentido antihorario.",
    "ground": "#5d6c78",
    "sky": "#0f1a35",
    "lore": "Circuito iluminado de Overmark, en el Continente Viejo, pensado para correr en la noche polar: durante seis meses el sol no sale y la aurora boreal cubre el cielo. Tiene 640 luminarias y se ve desde el puerto; es la fecha más vista por televisión.",
    "character": "Nocturno, técnico y con frenadas fuertes. La visión importa tanto como el auto; el frío hace más difícil calentar los neumáticos.",
    "quirk": "Durante la carrera se apagan las luces de la ciudad de Nordhavn a mitad de carrera para ver la aurora.",
    "corners": [
     [
      "Luminaria",
      "derecha rápida bajo un arco de luces"
     ],
     [
      "Fiordo",
      "horquilla junto al agua oscura"
     ],
     [
      "Aurora",
      "chicane final con el cielo verde de fondo"
     ]
    ],
    "landscape": "Fiordo negro con montañas nevadas, ciudad portuaria con casas de madera de colores, luces blancas y azules, aurora verde y pista brillante.",
    "props": "casas de madera pintadas (box + cone rojas/amarillas/azules), agua del fiordo (water oscura), montañas nevadas (sphere gigantes), mástiles de luz (cylinder + box) cada 60 m."
   },
   "calderaring": {
    "nation": "Tamago",
    "region": "Isla Caldera",
    "opened": 2016,
    "kind": "Cráter de volcán apagado",
    "theme": "mountain",
    "km": 2.0,
    "turns": 15,
    "silhouette": "Trazado que baja hacia el centro de un cráter y vuelve a subir: curvas cerradas encadenadas y una espiral; sentido antihorario.",
    "ground": "#4b4b4e",
    "sky": "#c2c0be",
    "lore": "Circuito dentro de la caldera de un volcán apagado en la isla de Tamago. La pista baja hacia el centro del cráter y vuelve a subir; la grava negra es de ceniza volcánica.",
    "character": "Difícil, con curvas cerradas y desniveles. Poca velocidad pero muchos cambios de dirección.",
    "quirk": "Sale vapor de una fumarola junto a la salida de la curva 12 y a veces tapa la visión.",
    "corners": [
     [
      "Boca",
      "horquilla de derecha en el borde del cráter"
     ],
     [
      "Lava Fría",
      "S lenta sobre coladas de roca negra"
     ],
     [
      "Fumarola",
      "izquierda ciega junto a una salida de vapor"
     ]
    ],
    "landscape": "Paredes rocosas de un cráter, grava y roca negra, vapor saliendo de la tierra, vegetación escasa, lago verde en el fondo y cielo brumoso.",
    "props": "paredes del cráter (sphere achatadas grises muy grandes en círculo), lago verde (water), coladas (box bajas negras), fumarolas (cylinder finos grises), pocos árboles."
   },
   "centenario": {
    "nation": "Margin",
    "region": "Rheinau",
    "opened": 2018,
    "kind": "Moderno de gala (final del campeonato)",
    "theme": "grass",
    "km": 2.5,
    "turns": 14,
    "silhouette": "Circuito fluido con una recta larga, una sección de eses y un gran giro de radio constante hacia la recta final; sentido horario.",
    "ground": "#8fb17f",
    "sky": "#bfd0dc",
    "lore": "Autódromo inaugurado para el centenario de la federación automovilística de Margin, a orillas del río Rheinau. Es la sede de la fecha final y del acto de premiación del campeonato, con las banderas de todas las naciones.",
    "character": "Rápido y fluido, con curvas de radio amplio y buen espacio para sobrepasar. Cierra el año con el podio del campeonato.",
    "quirk": "El podio se levanta sobre la recta principal y cada campeón recibe una copa con su nación grabada.",
    "corners": [
     [
      "Monumento",
      "derecha rápida junto a un monumento de piedra"
     ],
     [
      "Las Esses",
      "cuatro curvas alternadas en tercera"
     ],
     [
      "Curva del Centenario",
      "gran izquierda de radio constante hacia la recta final"
     ]
    ],
    "landscape": "Complejo moderno con tribunas curvas de hormigón claro, banderas de todas las naciones, un monumento en el infield, césped cuidado y podio frente a la recta.",
    "props": "tribunas curvas (grandstand + box), banderas (cylinder finos altos con box), monumento (box + cylinder), césped y árboles jóvenes (tree round)."
   }
  };
  // Nombres visibles de los circuitos (los ids de archivo no cambian).
  const TRACK_NAMES = {
   "valleverde": "VALLE VERDE",
   "autodromocentral": "TELLIN RAILWORKS",
   "costasur": "COSTA SUR",
   "montrealpl": "MONTERAL PARK",
   "sierragp": "SIERRA GP",
   "pampacircuit": "ESTEPA GRANDE",
   "litoralring": "LITORAL RING",
   "nortespeed": "NORTE SPEEDWAY",
   "desiertoring": "DESIERTO RING",
   "patagoniapark": "LAGO HELADO PARK",
   "atlanticospeed": "OCÉANO SPEED",
   "selvaverde": "SELVA VERDE",
   "puertourbano": "PUERTO URBANO",
   "lagunaazul": "MAR SALADO",
   "andesendurance": "ALTIPLANO ENDURANCE",
   "pampavelocity": "SABANA VELOCITY",
   "santacruz": "SANTA CRUZ GP",
   "nocturnaring": "NOCHE POLAR",
   "calderaring": "CALDERA RING",
   "centenario": "AUTÓDROMO DEL CENTENARIO"
  };
  
  // Ajustes de juego por circuito según su carácter (agarre, frenos, aero, lluvia, temperatura, dificultad de sobrepaso). El JSON del circuito los puede pisar.
  const CIRCUIT_MODS = {
    pampacircuit: { tempBase: 22 },
    patagoniapark: { gripMod: 0.82, brakingMod: 1.1, aeroMod: 1.05, wetChance: 0.1, tempBase: -3, overtakeDiff: 0.5 },
    lagunaazul: { gripMod: 1.02, brakingMod: 1.05, aeroMod: 1.12, wetChance: 0.03, tempBase: 38, overtakeDiff: 0.45 },
    nocturnaring: { gripMod: 0.96, tempBase: 2, wetChance: 0.25 },
    santacruz: { tempBase: 24 },
    pampavelocity: { tempBase: 32 },
  };
  // Ficha visible en el juego (atlas de circuitos) y datos derivados.
  TRACKS.forEach(t => {
    const m = CIRCUIT_META[t.id];
    if (!m) return;
    t.nation = m.nation; t.region = m.region; t.opened = m.opened; t.lore = m.lore; t.character = m.character; t.cornerNames = m.corners; t.landscape = m.landscape;
    t.kind = m.kind; t.quirk = m.quirk; t.silhouette = m.silhouette; t.propsKit = m.props; t.targetKm = m.km;
    t.country = m.region + ', ' + m.nation;
    if (TRACK_NAMES[t.id]) t.name = TRACK_NAMES[t.id];
    if (m.turns) t.corners = m.turns;
    t.theme = m.theme;
    if (m.ground && !t.groundColor) t.groundColor = m.ground;
    if (m.sky && !t.skyColor) t.skyColor = m.sky;
    Object.assign(t, CIRCUIT_MODS[t.id] || {});
    t.desc = m.kind;
  });
  
  // ---- trazados y decorado externos: circuits/<id>.json, o un único circuits/circuits.json con todos ({ "<id>": {...}, ... }) — ver CIRCUITOS_PARA_IA.md ----
  const CIRCUIT_THEMES = ['grass', 'desert', 'coast', 'forest', 'city', 'night', 'mountain'];
  const CIRCUIT_NUM = { gripMod: [0.7, 1.3], brakingMod: [0.7, 1.4], aeroMod: [0.7, 1.4], overtakeDiff: [0.1, 0.95], wetChance: [0, 0.8], tempBase: [-10, 45], treeCount: [0, 320], halfWidth: [6, 14] };
  function validCircuitFile(d) {
    if (!d || typeof d !== 'object') return 'no es un objeto';
    if (d.layout != null) {
      if (!Array.isArray(d.layout) || d.layout.length < 8 || d.layout.length > 60) return 'layout debe tener entre 8 y 60 puntos';
      if (d.layout.some(p => !Array.isArray(p) || p.length !== 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || Math.abs(p[0]) > 900 || Math.abs(p[1]) > 900)) return 'cada punto de layout es [x,z] en metros, |valor| ≤ 900';
      if (d.layout.slice(0, 3).some(p => Math.abs(p[1] - 135) > 0.5)) return 'los tres primeros puntos deben estar sobre z = 135 (largada y boxes)';
    }
    for (const k in CIRCUIT_NUM) if (d[k] != null && !(d[k] >= CIRCUIT_NUM[k][0] && d[k] <= CIRCUIT_NUM[k][1])) return k + ' fuera de rango ' + CIRCUIT_NUM[k].join('–');
    if (d.theme != null && !CIRCUIT_THEMES.includes(d.theme)) return 'theme desconocido';
    if (d.props != null && (!Array.isArray(d.props) || d.props.length > 600)) return 'props: lista de hasta 600 objetos';
    return null;
  }
  function applyCircuitFile(def, d) {
    const err = validCircuitFile(d);
    if (err) { console.warn('[circuits] ' + def.id + ' ignorado: ' + err); return false; }
    ['layout', 'halfWidth', 'theme', 'props', 'groundColor', 'skyColor', 'wetChance', 'tempBase', 'gripMod', 'brakingMod', 'aeroMod', 'overtakeDiff', 'treeCount', 'hills', 'foliageColor'].forEach(k => { if (d[k] != null) def[k] = d[k]; });
    def.external = true;
    return true;
  }
  // Modelo aislado de un circuito: todo lo que hace falta para rehacerlo (y lo que el juego pone alrededor y NO se puede pisar).
  // Es el mismo formato que se carga desde circuits/<id>.json; los campos que empiezan con «_» son sólo referencia y se ignoran al cargar.
  function circuitModel(def) {
    const T = window.THREE, layout = layoutForTrack(def), r1 = v => Math.round(v * 10) / 10;
    const out = {
      _formato: 'Circuito de la Serie Nacional GT3 · ver 07-carreras-apex/CIRCUITOS_PARA_IA.md. Los campos con «_» son referencia (se ignoran al cargar).',
      id: def.id, name: def.name, nation: def.nation, region: def.region, theme: def.theme || 'grass', halfWidth: def.halfWidth || 8.5,
      groundColor: def.groundColor, skyColor: def.skyColor, wetChance: def.wetChance, tempBase: def.tempBase, gripMod: def.gripMod, brakingMod: def.brakingMod, aeroMod: def.aeroMod, overtakeDiff: def.overtakeDiff,
      layout: layout.map(p => [p[0], p[1]]), props: def.props || [],
    };
    if (def.treeCount != null) out.treeCount = def.treeCount;
    if (def.hills != null) out.hills = def.hills;
    if (!T) return out;
    const curve = new T.CatmullRomCurve3(layout.map(([x, z]) => new T.Vector3(x, 0, z)), true, 'catmullrom', .35); curve.arcLengthDivisions = 5000;
    const L = curve.getLength(), hw = out.halfWidth;
    const at = (s, lane = 0) => { const u = (((s % L) + L) % L) / L, p = curve.getPointAt(u), t = curve.getTangentAt(u).normalize(); return [r1(p.x + t.z * lane), r1(p.z - t.x * lane)]; };
    const edge = (a, b, lane) => { const pts = []; for (let s = a; s <= b; s += 15) pts.push(at(s, lane)); return pts; };
    const center = [];
    for (let s = 0; s < L; s += 20) {
      const u = s / L, tg = curve.getTangentAt(u), t2 = curve.getTangentAt(Math.min(1, u + 20 / L)), ang = DM.atan2(tg.x * t2.z - tg.z * t2.x, tg.dot(t2));
      center.push({ s: Math.round(s), p: at(s), radius: Math.abs(ang) < 1e-3 ? null : Math.round(20 / Math.abs(ang)) });
    }
    out._referencia = {
      largoMetros: Math.round(L), largoKm: r1(L / 100) / 10, sentido: 'El punto 0 es la línea de largada; el auto avanza por el orden de los puntos (hacia +x en la recta principal).',
      largada: { s: 0, punto: at(0), tangente: [+curve.getTangentAt(0).x.toFixed(3), +curve.getTangentAt(0).z.toFixed(3)] },
      parrilla: 'Diez autos en dos columnas, desde s = −8 hacia atrás cada 9 m, a ±3,2 m del eje (ver engine.js buildCircuitWorld).',
      boxes: { carrilBoxes: { desdeS: 30, hastaS: 295, ladoInterior: at(30, 10), ladoExterior: at(30, 25), borde: edge(30, 295, 24.6).slice(0, 5), nota: 'Carril lateral de 15 m (lane +10 a +25) a la IZQUIERDA del sentido de marcha (en la recta principal, hacia z menores). +lane = izquierda, -lane = derecha.' }, edificio: { s: 170, lane: 36, largo: 175, ancho: 16, alto: 7 }, entradaEnBoxes: 'Se activa entre 32 m y 55 m de vuelta; el auto va al carril lane 20 y para en s = vuelta*largo + 155 + 6*id.', guardarrielBoxes: 'lane +40 hasta s = 305; el resto de la vuelta ±20.' },
      tribunasPorDefecto: [{ s: 115, lane: -33, length: 100 }, { s: Math.round(L - 65), lane: -34, length: 58 }, { s: 555, lane: -32, length: 52 }],
      carteles: [{ s: 125, lane: -31, text: def.name }, { s: 475, lane: -27 }, { s: 830, lane: 28 }, { s: 1100, lane: -28 }],
      eje: center,
    };
    return out;
  }
  function downloadCircuitJSON(def) {
    const model = circuitModel(def), blob = new Blob([JSON.stringify(model, null, 1)], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = def.id + '.json'; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function downloadAllCircuitsJSON() {
    const all = {}; TRACKS.forEach(d => { const m = circuitModel(d); delete m._referencia; all[d.id] = m; });
    const blob = new Blob([JSON.stringify(all, null, 1)], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'circuits.json'; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  window.circuitModel = circuitModel; window.downloadCircuitJSON = downloadCircuitJSON; window.downloadAllCircuitsJSON = downloadAllCircuitsJSON;
  
  for (const def of TRACKS) { const d = {"valleverde":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[235.849,142.41],[300.951,198.291],[311.45,234.172],[298.579,259.567],[227.652,300.717],[168.937,320.7],[137.393,343.407],[96.653,403.023],[55.058,440.668],[26.88,460.143],[-43.263,466.589],[-91.867,449.979],[-152.105,436.616],[-207.609,448.931],[-250.417,466.215],[-325.573,463.285],[-362.466,444.587],[-407.139,399.982],[-428.491,345.905],[-455.974,290.018],[-459.463,228.744],[-416.502,156.03],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.15,"tempBase":24,"gripMod":1,"brakingMod":1,"aeroMod":1,"overtakeDiff":0.5,"hills":false},"autodromocentral":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[229.286,145.854],[257.572,160.074],[301.435,236.323],[298.703,264.174],[275.095,279.29],[185.551,274.531],[128.474,259.281],[68.815,242.843],[10.137,236.385],[-55.132,239.839],[-109.197,256.037],[-175.873,279.235],[-241.225,299.318],[-280.681,305.013],[-404.254,290.806],[-460.177,233.851],[-454.211,197.41],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"city","wetChance":0.2,"tempBase":22,"gripMod":0.95,"brakingMod":1.25,"aeroMod":0.9,"overtakeDiff":0.4,"hills":false},"costasur":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[242.722,113.091],[291.222,80.37],[322.268,34.113],[329.391,-23.188],[311.094,-80.303],[273.712,-116.293],[219.213,-135.879],[168.348,-132.085],[115.848,-121.786],[56.494,-132.463],[6.492,-162.964],[-41.031,-183.181],[-89.887,-185.205],[-146.71,-166.942],[-195.489,-129.515],[-239.807,-106.548],[-291.893,-101.315],[-345.246,-100.648],[-399.338,-79.324],[-445.566,-29.894],[-463.255,27.067],[-451.404,74.765],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"coast","wetChance":0.35,"tempBase":26,"gripMod":1.05,"brakingMod":0.95,"aeroMod":1.15,"overtakeDiff":0.65,"hills":false},"montrealpl":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.699,135.001],[305.252,135.556],[362.227,130.818],[421.74,133.796],[484.335,172.122],[502.116,208.873],[504.27,263.506],[491.271,295.093],[426.903,335.22],[363.737,337.416],[307.562,320.533],[248.885,319.869],[199.413,327.846],[140.651,343.112],[95.395,379.028],[51.749,413.517],[-6.139,429.222],[-57.86,438.945],[-117.229,440.077],[-174.706,445.157],[-232.296,450.865],[-289.229,455.037],[-347.039,456.526],[-398.739,435.507],[-454.916,411.013],[-500.171,379.952],[-529.972,323.821],[-536.643,273.309],[-515.233,219.012],[-473.786,180.467],[-425.929,146.14],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.3,"tempBase":18,"gripMod":1.1,"brakingMod":1.1,"aeroMod":0.85,"overtakeDiff":0.35,"hills":false},"sierragp":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.855,135.664],[306.857,111.681],[347.285,60.148],[352.491,16.473],[330.279,-30.009],[272.728,-69.546],[224.652,-72.962],[157.8,-60.644],[114.045,-67.508],[71.743,-100.964],[39.591,-159.082],[14.893,-201.947],[-35.874,-239.501],[-74.246,-262.352],[-146.79,-265.053],[-196.099,-240.912],[-210.564,-215.066],[-215.005,-122.142],[-229.507,-93.544],[-255.379,-81.997],[-344.75,-88.329],[-380.11,-84.902],[-436.128,-49.538],[-465.398,-0.367],[-465.378,47.529],[-434.886,98.764],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"mountain","wetChance":0.25,"tempBase":20,"gripMod":0.92,"brakingMod":1.05,"aeroMod":1.05,"overtakeDiff":0.55,"hills":false},"pampacircuit":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.627,134.083],[307.12,134.84],[360.247,159.318],[412.677,185.849],[460.813,215.42],[501.097,256.652],[518.686,313.91],[523.172,372.998],[500.379,426.935],[465.71,470.677],[424.842,511.521],[376.324,544.192],[318.838,552.101],[259.764,551.219],[201.776,556.76],[146.011,542.911],[95.25,508.308],[43.565,488.317],[-19.936,496.026],[-60.742,519.875],[-115.792,548.749],[-174.324,552.268],[-232.485,556.277],[-290.312,557.218],[-348.518,552.271],[-398.946,523.267],[-448.892,488.414],[-489.964,455.966],[-525.137,406.649],[-533.996,349.635],[-532.475,288.339],[-506.258,238.668],[-465.161,197.393],[-423.588,156.028],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.1,"tempBase":22,"gripMod":1,"brakingMod":1,"aeroMod":1,"overtakeDiff":0.45,"hills":false},"litoralring":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[249.42,137.154],[306.814,128.009],[355.674,92.237],[393.189,46.727],[404.967,-10.04],[387.72,-64.695],[344.677,-110.47],[295.137,-127.958],[236.389,-136.109],[182.868,-165.937],[144.582,-211.265],[100.819,-243.202],[43.767,-252.301],[-10.853,-244.013],[-69.189,-253.938],[-120.247,-286.602],[-167.424,-312.534],[-227.572,-316.689],[-282.098,-292.887],[-320.934,-245.829],[-333.164,-198.958],[-341.262,-143.923],[-375.738,-87.416],[-409.399,-59.115],[-452.042,5.06],[-456.795,57.499],[-434.2,99.22],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"forest","wetChance":0.4,"tempBase":23,"gripMod":0.98,"brakingMod":0.9,"aeroMod":1.1,"overtakeDiff":0.6,"hills":false},"nortespeed":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.236,134.923],[304.428,134.026],[360.532,130.509],[409.072,138.262],[474.808,131.665],[527.404,96.515],[558.346,41.121],[556.048,13.227],[516.88,-27.72],[435.755,-50.414],[394.512,-45.534],[335.727,-44.779],[278.585,-46.93],[221.366,-47.496],[164.13,-47.545],[106.893,-47.543],[49.656,-47.543],[-7.58,-47.543],[-64.817,-47.543],[-122.053,-47.544],[-179.29,-47.514],[-236.519,-47.164],[-293.839,-46.354],[-345.467,-50.014],[-412.089,-48.389],[-449.897,-49.443],[-533.402,-38.734],[-585.024,-1.098],[-596.419,28.5],[-585.335,73.823],[-530.143,131.118],[-484.43,143.017],[-426.491,143.518],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.2,"tempBase":30,"gripMod":1.08,"brakingMod":1,"aeroMod":0.9,"overtakeDiff":0.3,"hills":false},"desiertoring":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.513,132.517],[303.727,149.314],[347.792,187.12],[392.183,225.866],[423.764,273.88],[429.433,331.009],[413.446,387.605],[397.577,443.886],[361.194,488.33],[308.511,513.728],[253.908,534.292],[200.8,558.713],[142.66,560.911],[84.226,564.213],[26.512,564.273],[-25.576,540.831],[-69.546,499.472],[-117.353,476.385],[-172.404,478.289],[-228.482,499.71],[-281.977,504.505],[-337.074,484.425],[-389.002,457.087],[-434.937,422.627],[-461.199,371.397],[-479.611,315.25],[-483.665,257.996],[-460.928,205.159],[-422.893,159.57],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"desert","wetChance":0.04,"tempBase":34,"gripMod":0.94,"brakingMod":1.18,"aeroMod":0.9,"overtakeDiff":0.32,"hills":false},"patagoniapark":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[245.75,126.193],[298.593,104.51],[343.867,73.457],[376.761,29.115],[386.123,-21.381],[373.688,-77.316],[341.833,-120.112],[297.438,-149.803],[231.739,-164.529],[191.766,-162.851],[130.742,-147.382],[79.139,-123.614],[40.63,-110.518],[-32.865,-112.393],[-73.201,-125.576],[-125.025,-144.237],[-187.874,-151.743],[-229.487,-145.814],[-287.577,-125.514],[-334.796,-101.272],[-389.79,-75.628],[-439.208,-28.321],[-460.075,41.678],[-446.952,82.796],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"mountain","wetChance":0.1,"tempBase":-3,"gripMod":0.82,"brakingMod":1.1,"aeroMod":1.05,"overtakeDiff":0.5,"hills":false},"atlanticospeed":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.017,135.009],[303.113,131.402],[353.048,112.474],[404.385,81.133],[435.076,38.884],[444.328,-17.83],[431.606,-60.443],[388.699,-104.29],[339.81,-123.074],[280.899,-129.189],[225.35,-136.258],[169.621,-135.199],[115.708,-117.373],[63.134,-99.605],[8.027,-91.816],[-46.062,-103.61],[-99.23,-126.081],[-152.57,-143.207],[-208.245,-143.659],[-264.697,-135.484],[-320.317,-125.267],[-365.706,-109.667],[-435.887,-57.906],[-464.479,-26.917],[-473.895,7.514],[-437.507,93.209],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"coast","wetChance":0.32,"tempBase":21,"gripMod":1.03,"brakingMod":0.95,"aeroMod":0.92,"overtakeDiff":0.28,"hills":false},"selvaverde":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[243.83,146.857],[301.815,197.729],[308.632,226.692],[295.404,286.451],[271.651,344.15],[268.972,387.183],[269.607,434.769],[231.179,513.076],[201.589,529.29],[150.096,529.66],[98.298,505.497],[58.738,472.324],[-8.116,450.065],[-53.636,448.842],[-110.65,444.994],[-167.529,418.136],[-199.282,409.292],[-241.592,410.647],[-316.139,412.146],[-370.009,387.419],[-403.955,358.88],[-449.158,306.868],[-464.992,236.669],[-444.972,184.151],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"forest","wetChance":0.52,"tempBase":29,"gripMod":1.08,"brakingMod":1.12,"aeroMod":1.2,"overtakeDiff":0.67,"hills":false},"puertourbano":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[245.637,105.257],[280.825,64.289],[305.043,44.006],[357.779,-18.635],[369.078,-68.207],[355.933,-99.934],[290.899,-138.914],[213.804,-140.356],[168.139,-135.241],[115.002,-108.912],[69.183,-71.272],[12.425,-51.827],[-48.337,-50.434],[-102.207,-78.791],[-141.267,-122.452],[-188.96,-155.263],[-260.504,-162.258],[-302.314,-141.712],[-341.905,-95.662],[-366.557,-58.313],[-390.612,-36.001],[-451.95,29.614],[-460.506,64.402],[-443.934,96.124],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"city","wetChance":0.3,"tempBase":23,"gripMod":0.93,"brakingMod":1.28,"aeroMod":0.94,"overtakeDiff":0.72,"hills":false},"lagunaazul":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.595,132.051],[304.845,147.452],[351.491,184.244],[398.254,217.31],[429.409,267.455],[433.92,325.237],[425.395,385.094],[410.827,440.211],[372.007,485.471],[323.863,518.05],[265.115,524.317],[214.925,507.882],[161.7,486.498],[99.976,487.677],[50.8,507.574],[-0.717,518.992],[-51.286,508.668],[-103.373,480.148],[-158.197,470.424],[-213.225,484.208],[-267.935,502.223],[-328.115,497.44],[-374.22,470.274],[-422.668,432.578],[-452.358,383.408],[-466.99,326.017],[-475.834,268.73],[-459.603,210.379],[-426.21,162.105],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"desert","wetChance":0.03,"tempBase":38,"gripMod":1.02,"brakingMod":1.05,"aeroMod":1.12,"overtakeDiff":0.45,"hills":false},"andesendurance":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.972,135],[305.944,135.004],[363.901,134.891],[421.845,135.356],[480.184,136.58],[533.573,114.874],[574.636,73.41],[616.729,32.987],[639.197,-19.757],[635.454,-77.406],[619.356,-134.486],[580.737,-176.604],[525.235,-195.245],[465.784,-193.639],[419.275,-166.792],[378.017,-122.207],[330.281,-96.105],[272.146,-96.046],[217.324,-117.726],[168.655,-148.152],[137.012,-197.021],[110.45,-248.691],[71.765,-291.572],[18.837,-312.278],[-39.471,-322.729],[-98.13,-320.804],[-139.54,-299.254],[-187.357,-252.709],[-235.704,-230.922],[-286.799,-235.227],[-343.777,-263.35],[-393.794,-281.634],[-449.877,-276.786],[-500.058,-247.171],[-546.006,-210.438],[-587.096,-170.775],[-607.677,-117.691],[-615.483,-59.12],[-609.161,-1.942],[-577.573,45.695],[-528.623,77.525],[-480.11,109.22],[-427.941,133.758],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"mountain","wetChance":0.12,"tempBase":19,"gripMod":0.95,"brakingMod":1.2,"aeroMod":1.05,"overtakeDiff":0.43,"hills":false},"pampavelocity":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.633,135.004],[307.263,134.99],[366.014,134.652],[420.723,155.042],[471.777,182.062],[529.743,200.586],[578.458,232.312],[607.598,286.163],[611.592,338.653],[615.332,399.354],[596.411,454.236],[558.839,499.43],[521.919,544.972],[485.361,590.949],[436.189,622.293],[383.814,648.673],[331.55,675.249],[279.287,701.823],[227.168,728.765],[171.458,745.14],[113.006,750.243],[54.635,755.747],[-3.712,761.752],[-61.669,757.692],[-113.713,730.432],[-165.392,702.759],[-217.223,675.367],[-269.286,648.297],[-314.042,610.9],[-355.366,569.292],[-396.825,527.833],[-438.408,486.488],[-476.032,442.087],[-506.668,391.94],[-531.553,338.846],[-531.35,281.566],[-504.485,227.796],[-470.83,184.195],[-425.406,147.287],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.09,"tempBase":32,"gripMod":1.02,"brakingMod":0.92,"aeroMod":0.86,"overtakeDiff":0.25,"hills":false},"santacruz":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.117,132.36],[304.916,134.234],[364.629,166.71],[401.047,227.715],[398.45,267.597],[369.312,326.331],[344.882,372.847],[339.237,421.749],[344.381,477.703],[326.511,539.459],[282.47,582.184],[229.623,593.652],[171.732,574.27],[119.784,529.695],[83.868,513.042],[16.503,517.288],[-25.75,539.857],[-72.899,564.88],[-147.15,567.264],[-186.206,547.767],[-199.574,522.946],[-209.875,449.086],[-229.771,398.453],[-251.106,380.321],[-325.684,367.157],[-366.781,373.697],[-433.326,363.808],[-463.973,342.759],[-486.687,277.73],[-471.52,204.68],[-430.229,157.302],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"forest","wetChance":0.44,"tempBase":24,"gripMod":1.1,"brakingMod":1.16,"aeroMod":1.19,"overtakeDiff":0.6,"hills":false},"nocturnaring":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.849,135.963],[306.037,125.386],[357.824,95.191],[403.48,60.739],[430.546,8.165],[428.376,-49.632],[405.271,-106.585],[358.301,-145.605],[310.685,-163.372],[250.121,-162.409],[188.892,-136.084],[148.505,-127.924],[89.076,-146.557],[41.855,-189.356],[3.837,-223.865],[-51.536,-242.875],[-106.2,-234.085],[-152.554,-203.475],[-190.348,-170.015],[-253.301,-148.123],[-303.15,-151.269],[-356.575,-148.942],[-410.668,-121.317],[-443.049,-73.79],[-461.729,-15.699],[-461.286,48.027],[-425.153,107.504],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"night","wetChance":0.25,"tempBase":2,"gripMod":0.96,"brakingMod":1.16,"aeroMod":1.08,"overtakeDiff":0.48,"hills":false},"calderaring":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[246.928,127.156],[298.991,97.841],[335.473,54.583],[347.708,-7.916],[333.628,-53.916],[301.736,-110.723],[259.985,-144.59],[178.561,-160.042],[137.445,-151.463],[96.205,-130.26],[70.262,-101.979],[44.619,-44.753],[27.794,-21.906],[1.058,-6.672],[-83.44,-4.422],[-120.803,-24.717],[-169.029,-75.53],[-215.455,-101.101],[-273.241,-102.939],[-329.213,-88.237],[-386.8,-69.739],[-442.483,-11.736],[-455.737,58.383],[-436.268,96.996],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"mountain","wetChance":0.2,"tempBase":27,"gripMod":0.97,"brakingMod":1.14,"aeroMod":1.02,"overtakeDiff":0.62,"hills":false},"centenario":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.341,135.561],[304.604,133.927],[362.922,130.532],[417.778,150.323],[461.19,192.652],[497.027,233.967],[513.37,291.927],[500.869,349.459],[474.207,405.18],[428.968,439.274],[374.869,462.265],[321.74,480.481],[264.604,474.962],[211.332,448],[170.551,433.846],[107.618,441.929],[63.711,465.121],[15.066,479.712],[-34.353,473.759],[-80.088,458.462],[-145.15,460.96],[-195.276,485.957],[-238.558,507.945],[-300.821,511.85],[-349.386,493.114],[-404.72,469.178],[-443.866,428.058],[-486.95,387.548],[-520.138,339.475],[-527.766,279.839],[-514.455,224.115],[-475.217,178.957],[-426.519,144.892],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.18,"tempBase":22,"gripMod":1.03,"brakingMod":1.05,"aeroMod":1,"overtakeDiff":0.5,"hills":false}}[def.id]; if (d) applyCircuitFile(def, d); }
  'use strict';
  // Original, procedural artwork. Shared geometry powers the collection and race.
  const RacingArt = (() => {
    const T = window.THREE;
    const cache = new Map();
    // Each profile has its own bonnet, roof line, wheelbase and front/rear treatment.
    const specs = {
      classic:   {color:'#ff7c24',width:1.03,length:1.02,roof:2.02,cabin:-.35,roofLen:1.36,nose:1.24,axle:1.96,grille:'camaro',lights:'slit',rear:'square'},
      touring:   {color:'#b92035',width:.98,length:1.02,roof:2.22,cabin:.03,roofLen:1.95,nose:1.22,axle:2.02,grille:'alfa',lights:'triple',rear:'slit'},
      sprint:    {color:'#346ee7',width:1.04,length:1.05,roof:2.04,cabin:-.35,roofLen:1.5,nose:1.3,axle:2.04,grille:'mustang',lights:'triple',rear:'triple'},
      endurance: {color:'#e8edf2',width:1.04,length:1.05,roof:2.18,cabin:-.08,roofLen:1.68,nose:1.31,axle:2.03,grille:'bmw',lights:'twin',rear:'slit'},
      aero:      {color:'#13bfae',width:1.05,length:1.07,roof:1.99,cabin:-.68,roofLen:1.35,nose:1.22,axle:2.07,grille:'amg',lights:'slash',rear:'slit'},
      track:     {color:'#96a9b9',width:1.04,length:1,roof:1.93,cabin:.22,roofLen:1.45,nose:1.07,axle:1.99,grille:'audi',lights:'slash',rear:'slit',mid:true},
      spectre:   {color:'#ed3049',width:1.05,length:1,roof:1.87,cabin:.3,roofLen:1.15,nose:.97,axle:1.95,grille:'ferrari',lights:'blade',rear:'round',mid:true},
      raijin:    {color:'#4484df',width:1.07,length:1.04,roof:2.16,cabin:-.08,roofLen:1.75,nose:1.34,axle:2.01,grille:'nissan',lights:'slash',rear:'round'},
      mistral:   {color:'#78b849',width:1.04,length:1.03,roof:1.98,cabin:-.46,roofLen:1.38,nose:1.14,axle:2.04,grille:'aston',lights:'blade',rear:'bar'},
      valkyr:    {color:'#f6c743',width:1.01,length:.95,roof:2.03,cabin:.18,roofLen:1.15,nose:1.01,axle:1.88,grille:'porsche',lights:'round',rear:'bar'},
      corsair:   {color:'#ae87ee',width:1.08,length:1.03,roof:1.89,cabin:.38,roofLen:1.14,nose:1.03,axle:2.02,grille:'corvette',lights:'blade',rear:'square',mid:true}
    };
    function trackCurve(def){
      const curve = new T.CatmullRomCurve3(layoutForTrack(def).map(([x,z])=>new T.Vector3(x,0,z)),true,'catmullrom',.35);
      curve.arcLengthDivisions=5000;
      return curve;
    }
    if(T) TRACKS.forEach(def=>{def.lengthKm=trackCurve(def).getLength()/1000;});
    const mat = (c,metalness=.25,roughness=.32) => new T.MeshStandardMaterial({color:c,metalness,roughness});
    function mesh(g,geo,m,x=0,y=0,z=0){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
    function block(g,m,w,h,d,x=0,y=0,z=0){return mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);}
    function cyl(g,m,r,h,x=0,y=0,z=0,n=32){return mesh(g,new T.CylinderGeometry(r,r,h,n),m,x,y,z);}
    function ball(g,m,r,x=0,y=0,z=0){return mesh(g,new T.SphereGeometry(r,32,20),m,x,y,z);}
    function tube(g,m,points,r){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,8,false),m);}
    function shell(g,m,sections,uvf){
      const vertices=[],indices=[],uvs=[];
      sections.forEach(([z,w,base,top,tw])=>{vertices.push(-w,base,z,w,base,z,tw,top,z,-tw,top,z);if(uvf)uvf(z,w,base,top,tw).forEach(p=>uvs.push(p[0],p[1]));});
      for(let i=0;i<sections.length-1;i++)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4,c=a+4,d=b+4;indices.push(a,b,c,b,d,c);}
      indices.push(0,2,1,0,3,2);let e=(sections.length-1)*4;indices.push(e,e+1,e+2,e,e+2,e+3);
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));if(uvf)geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return mesh(g,geo,m);
    }
    // Cartel de anunciante: fondo de color según el nombre y texto ajustado al ancho (no lleva logo raster para no depender de imágenes).
    function sponsorDecal(name){
      let h=0;for(const ch of name)h=(h*31+ch.charCodeAt(0))>>>0;h%=360;
      const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');
      const g=x.createLinearGradient(0,0,512,0);g.addColorStop(0,`hsl(${h} 70% 38%)`);g.addColorStop(1,`hsl(${(h+30)%360} 75% 26%)`);x.fillStyle=g;x.fillRect(0,0,512,128);
      x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=6;x.strokeRect(3,3,506,122);
      let fs=76;x.font=`italic 900 ${fs}px Arial`;while(x.measureText(name).width>470&&fs>24){fs-=2;x.font=`italic 900 ${fs}px Arial`;}
      x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(name,256,68);
      const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
      return new T.MeshStandardMaterial({map,roughness:.4,polygonOffset:true,polygonOffsetFactor:-2,side:T.DoubleSide});
    }
    function decal(text,color='#ffffff',bg=null){
      const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
      if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);}ctx.fillStyle=color;ctx.font='italic 900 82px Arial';ctx.textAlign='center';ctx.fillText(text,256,94);
      const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
      return new T.MeshStandardMaterial({map,transparent:true,roughness:.45,side:T.DoubleSide});
    }
    function panel(g,m,points,z){
      const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
      return mesh(g,new T.ShapeGeometry(shape),m,0,0,z);
    }
    // ---------------------------------------------------------------------------------------------------------
    // LIVERY COMO TEXTURA. La carrocería (shell) lleva UV: u = posición a lo largo del auto (0 trasera … 1 trompa) y
    // v recorre el perímetro de la sección: 0 = zócalo izquierdo, .30 = línea de cintura izquierda, .70 = línea de cintura
    // derecha, 1 = zócalo derecho. Toda la decoración (franjas, números, anunciantes) se pinta en UNA textura de 1024×512,
    // así se adapta a la forma del modelo en vez de ser bloques pegados encima.
    //   franja izquierda  -> y 358..512 (arriba físico = arriba del canvas)
    //   franja superior   -> y 154..358 (capó, techo y baúl; arriba del canvas = lado derecho del auto)
    //   franja derecha    -> y   0..154 (invertida: se dibuja girada 180°)
    const LIV_KEYS = ['center', 'twin', 'side', 'nose', 'dual', 'chevron', 'checker', 'diag'];
    const livCache = new Map();
    function liveryTexture(liv, number, cabinU, roofU) {
      const key = JSON.stringify([liv.primary, liv.secondary, liv.accent, liv.roof, liv.pattern, liv.sponsors, number, cabinU.toFixed(2), roofU[0].toFixed(2), roofU[1].toFixed(2)]);
      if (livCache.has(key)) return livCache.get(key);
      const W = 1024, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      const P = liv.primary || '#e73549', S = liv.secondary || '#f2f5f3', A = liv.accent || '#111820', pat = liv.pattern || 'none';
      const TOP0 = 154, TOP1 = 358, MID = 256;
      x.fillStyle = P; x.fillRect(0, 0, W, H);
      // --- diseños (8) ---
      const topRect = (px, py, pw, ph, col) => { x.fillStyle = col; x.fillRect(px, py, pw, ph); };
      const side = (right, fn) => { x.save(); if (right) { x.translate(W, TOP0); x.rotate(Math.PI); } else x.translate(0, TOP1); x.beginPath(); x.rect(0, 0, W, 154); x.clip(); fn(right ? (f) => (1 - f) * W : (f) => f * W, right); x.restore(); };
      if (pat === 'center') {
        topRect(0, MID - 38, W, 76, S); topRect(0, MID - 52, W, 8, A); topRect(0, MID + 44, W, 8, A);
      } else if (pat === 'twin') {
        topRect(0, MID - 46, W, 22, S); topRect(0, MID + 24, W, 22, S); topRect(0, MID - 20, W, 6, A); topRect(0, MID + 14, W, 6, A);
      } else if (pat === 'side') {
        [false, true].forEach((r) => side(r, () => { x.fillStyle = S; x.beginPath(); x.moveTo(0, 96); x.lineTo(W, 60); x.lineTo(W, 96); x.lineTo(0, 132); x.closePath(); x.fill(); x.fillStyle = A; x.beginPath(); x.moveTo(0, 132); x.lineTo(W, 96); x.lineTo(W, 106); x.lineTo(0, 142); x.closePath(); x.fill(); }));
        topRect(0, TOP0, W, 14, S); topRect(0, TOP1 - 14, W, 14, S);
      } else if (pat === 'nose') {
        x.fillStyle = S; x.beginPath(); x.moveTo(W * .68, 0); x.lineTo(W, 0); x.lineTo(W, H); x.lineTo(W * .62, H); x.closePath(); x.fill();
        x.fillStyle = A; x.beginPath(); x.moveTo(W * .655, 0); x.lineTo(W * .68, 0); x.lineTo(W * .625, H); x.lineTo(W * .60, H); x.closePath(); x.fill();
      } else if (pat === 'dual') {
        x.fillStyle = S; x.fillRect(0, MID, W, H - MID); topRect(0, MID - 5, W, 10, A);
      } else if (pat === 'chevron') {
        for (let k = -1; k < 13; k++) { const px = k * 96 + 20; x.fillStyle = k % 2 ? A : S; x.beginPath(); x.moveTo(px, MID - 78); x.lineTo(px + 58, MID); x.lineTo(px, MID + 78); x.lineTo(px + 36, MID + 78); x.lineTo(px + 94, MID); x.lineTo(px + 36, MID - 78); x.closePath(); x.fill(); }
        [false, true].forEach((r) => side(r, () => { for (let k = -1; k < 24; k++) { const px = k * 52; x.fillStyle = k % 2 ? A : S; x.beginPath(); x.moveTo(px, 70); x.lineTo(px + 26, 96); x.lineTo(px, 122); x.lineTo(px + 14, 122); x.lineTo(px + 40, 96); x.lineTo(px + 14, 70); x.closePath(); x.fill(); } }));
      } else if (pat === 'checker') {
        const sq = 17;
        [false, true].forEach((r) => side(r, () => { for (let i = 0; i < W / sq; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? S : A; x.fillRect(i * sq, 84 + j * sq, sq, sq); } }));
        for (let i = 0; i < 4; i++) for (let j = 0; j < Math.ceil((TOP1 - TOP0) / sq); j++) { x.fillStyle = (i + j) % 2 ? S : A; x.fillRect(W - (i + 1) * sq, TOP0 + j * sq, sq, sq); }
        for (let i = 0; i < 4; i++) for (let j = 0; j < Math.ceil((TOP1 - TOP0) / sq); j++) { x.fillStyle = (i + j) % 2 ? S : A; x.fillRect(i * sq, TOP0 + j * sq, sq, sq); }
      } else if (pat === 'diag') {
        x.save(); x.beginPath(); x.rect(0, TOP0, W, TOP1 - TOP0); x.clip();
        for (let k = -3; k < 16; k++) { const px = k * 78; x.fillStyle = S; x.beginPath(); x.moveTo(px, TOP1); x.lineTo(px + 34, TOP1); x.lineTo(px + 34 + 110, TOP0); x.lineTo(px + 110, TOP0); x.closePath(); x.fill(); x.fillStyle = A; x.beginPath(); x.moveTo(px + 44, TOP1); x.lineTo(px + 52, TOP1); x.lineTo(px + 52 + 110, TOP0); x.lineTo(px + 44 + 110, TOP0); x.closePath(); x.fill(); }
        x.restore();
        [false, true].forEach((r) => side(r, () => { x.fillStyle = S; x.fillRect(0, 100, W, 16); x.fillStyle = A; x.fillRect(0, 120, W, 6); }));
      }
      // techo de otro color (opcional)
      if (liv.roof) { const r0 = Math.max(0, roofU[0]) * W, r1 = Math.min(1, roofU[1]) * W; x.fillStyle = liv.roof; x.fillRect(r0, MID - 78, r1 - r0, 156); }
      // zócalo oscuro (se ve en los dos costados)
      x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, H - 12, W, 12); x.fillRect(0, 0, W, 12);
      // --- cartel de anunciante ---
      const spBox = (name, bx, by, bw, bh) => {
        let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0; h %= 360;
        const g = x.createLinearGradient(bx, by, bx + bw, by); g.addColorStop(0, `hsl(${h} 70% 38%)`); g.addColorStop(1, `hsl(${(h + 30) % 360} 75% 26%)`);
        x.fillStyle = g; x.fillRect(bx, by, bw, bh); x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 3; x.strokeRect(bx + 1.5, by + 1.5, bw - 3, bh - 3);
        let fs = Math.round(bh * .62); x.font = `italic 900 ${fs}px Arial`; while (x.measureText(name).width > bw - 14 && fs > 10) { fs -= 2; x.font = `italic 900 ${fs}px Arial`; }
        x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, bx + bw / 2, by + bh / 2 + 2);
      };
      const roundel = (cx, cy, r) => { x.fillStyle = '#f4efdb'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.lineWidth = 4; x.strokeStyle = A; x.stroke(); x.fillStyle = '#111927'; x.font = `900 ${r * 1.15}px Arial`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(number, cx, cy + 3); };
      const sp = liv.sponsors || [];
      [false, true].forEach((r) => side(r, (X) => { roundel(X(.605), 78, 40); if (sp[r ? 1 : 0]) spBox(sp[r ? 1 : 0], X(.40) - 78, 54, 156, 48); }));
      // capó: número + anunciante; techo: número; baúl: anunciante
      const top = (fn) => { x.save(); x.beginPath(); x.rect(0, TOP0, W, TOP1 - TOP0); x.clip(); fn(); x.restore(); };
      top(() => {
        roundel(W * .74, MID, 46);
        if (sp[2]) spBox(sp[2], W * .90 - 75, MID - 32, 150, 64);
        if (sp[3]) spBox(sp[3], W * .10 - 90, MID - 30, 180, 60);
        roundel(cabinU * W, MID, 52);
      });
      const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
      livCache.set(key, tex); return tex;
    }
    function car(key='classic',color,number='07'){
      const liv0=color&&typeof color==='object'?color:{primary:color||(specs[key]||specs.classic).color,secondary:'#f2f5f3',accent:'#111820',pattern:'none',sponsors:[]},liv=liv0;color=liv.primary;
      const s=specs[key]||specs.classic,g=new T.Group(),body=new T.Group();g.add(body);
      g.userData.bodyType=key;g.userData.model=BODIES[key]?.name||key;
      const paint=mat(color||s.color,.48,.28),carbon=mat('#111820',.25,.5),chrome=mat('#adbdca',.8,.25),glass=mat('#122735',.65,.17),white=mat('#f2f5f3',.2,.4);
      const lamp=new T.MeshStandardMaterial({color:'#edfaff',emissive:'#c3ebff',emissiveIntensity:.8});
      const red=new T.MeshStandardMaterial({color:'#ef1631',emissive:'#ea0823',emissiveIntensity:.7});
      // A chamfered monocoque with real wheel cutouts, not the old flat prototype slab.
      const sections=[];
      for(let i=0;i<=64;i++){
        const z=-3.1+i*6.2/64;
        const end=DM.pow(Math.abs(z)/3.1,5),waist=DM.exp(-DM.pow(z/.95,2));
        const width=1.51-end*.2-waist*(s.mid?.16:.07);
        const hood=z>1?(1.36+(s.nose-1.36)*(z-1)/2.1):1.38;
        const top=z< -2.25?1.35-(Math.abs(z)-2.25)*.12:hood;
        let base=.43;
        for(const axle of [-s.axle,s.axle]){const dz=Math.abs(z-axle);if(dz<.67)base=Math.max(base,.61+Math.sqrt(.67*.67-dz*dz));}
        sections.push([z,width,Math.min(base,top-.045),top,width-.16]);
      }
      const cabinU=(s.cabin+3.1)/6.2,roofU=[(s.cabin-s.roofLen/2+3.1)/6.2,(s.cabin+s.roofLen/2+3.1)/6.2];
      const bodyMat=new T.MeshStandardMaterial({map:liveryTexture(liv,number,cabinU,roofU),metalness:.42,roughness:.3});
      shell(body,bodyMat,sections,(z,w,b,t,tw)=>{const u=(z+3.1)/6.2;return [[u,0],[u,1],[u,.7],[u,.3]];});
      block(body,carbon,2.6,.13,6.22,0,.41,0);
      // A separate greenhouse changes the actual silhouette of every model.
      const back=s.cabin-s.roofLen/2,front=s.cabin+s.roofLen/2;
      const rearFoot=key==='valkyr'?-2.65:back-(s.mid?.63:1.0);
      const cabSections=[[rearFoot,1.12,1.35,1.39,1.05],[back-.25,1.13,1.37,s.roof-.15,.96],[back,1.13,1.37,s.roof, .94],[front,1.13,1.34,s.roof-.035,.94],[front+.82,1.12,1.32,1.38,1.08]];
      shell(body,glass,cabSections);
      shell(body,bodyMat,[[back-.21,.96,s.roof-.13,s.roof-.1,.94],[back,.97,s.roof-.015,s.roof+.035,.93],[front,.97,s.roof-.04,s.roof,.93]],(z,w,b,t,tw)=>{const u=(z+3.1)/6.2,vx=x=>.5+.2*(x/1.35);return [[u,vx(-w)],[u,vx(w)],[u,vx(tw)],[u,vx(-tw)]];});
      // Windscreen frames, door seams, broad fenders and GT side skirts.
      for(const side of [-1,1]){
        tube(body,paint,[[side*1.11,1.39,front+.82],[side*.95,s.roof,front],[side*.95,s.roof+.02,back],[side*1.11,1.4,rearFoot]],.05);
        const pillar=block(body,paint,.06,s.roof-1.36,.11,side*1.075,(s.roof+1.36)/2,s.cabin-.15);pillar.rotation.z=side*.2;
        block(body,carbon,.10,.14,3.15,side*1.49,.45,0);
        block(body,white,.045,.045,2.64,side*1.51,.58,-.05);
        block(body,carbon,.21,.09,.13,side*1.44,1.18,s.cabin-.5);
        block(body,carbon,.25,.07,.23,side*1.48,1.48,front+.28);
        block(body,paint,.29,.15,.36,side*1.63,1.51,front+.29);
        if(key==='touring')block(body,carbon,.024,.5,.025,side*1.445,.96,-.6);
        if(s.mid||key==='track'){
          block(body,carbon,.06,.55,.7,side*1.46,1.06,-.95);
          const blade=block(body,key==='track'?chrome:paint,.10,.68,.12,side*1.5,1.13,-1.28);blade.rotation.x=-.35;
        }
        // Fenders arch above the tyres and follow their silhouette.
        for(const z of [-s.axle,s.axle]){
          const arch=mesh(body,new T.TorusGeometry(.68,.045,6,24,Math.PI),paint,side*1.49,.61,z);arch.rotation.y=Math.PI/2;
          for(let j=0;j<3;j++)block(body,carbon,.19,.015,.055,side*1.21,1.395,z-.13+j*.11);
        }
      }
      // Brand-specific front fascia geometry, not just a different paint color.
      const z=3.115;
      const outline=(pts)=>panel(body,carbon,pts,z);
      if(s.grille==='alfa'){
        panel(body,chrome,[[-.4,1.18],[.4,1.18],[0,.51]],z+.025);
        panel(body,carbon,[[-.32,1.13],[.32,1.13],[0,.61]],z+.03);
        for(const x of [-.85,.85])block(body,carbon,.77,.25,.07,x,.71,z);
      }else if(s.grille==='bmw'){
        for(const x of [-.31,.31]){
          block(body,chrome,.55,.82,.07,x,.92,z);
          block(body,carbon,.46,.75,.08,x,.92,z+.015);
          for(let j=0;j<5;j++)block(body,chrome,.39,.022,.025,x,.64+j*.14,z+.06);
        }
        for(const x of [-1.02,1.02])block(body,carbon,.43,.29,.07,x,.73,z);
      }else{
        const shape=s.grille==='audi'?[[-1.03,.63],[-1.15,.85],[-.87,1.15],[.87,1.15],[1.15,.85],[1.03,.63]]:
          s.grille==='aston'?[[-1.12,.6],[-1.25,.85],[-.8,1.02],[.8,1.02],[1.25,.85],[1.12,.6]]:
          s.grille==='amg'?[[-1.08,.64],[-1.18,.86],[-.93,1.16],[.93,1.16],[1.18,.86],[1.08,.64]]:
          [[-1.0,.62],[-1.15,.84],[-.8,Math.min(1.12,s.nose-.1)],[.8,Math.min(1.12,s.nose-.1)],[1.15,.84],[1,.62]];
        outline(shape);
        if(s.grille==='amg'){
          for(let j=-7;j<=7;j++)block(body,chrome,.027,.37,.025,j*.125,.88,z+.02);
          const ring=mesh(body,new T.TorusGeometry(.18,.024,8,24),chrome,0,.89,z+.05);
          for(let j=0;j<3;j++){const spoke=block(body,chrome,.025,.18,.025,DM.sin(j*2.094)*.08,.89+DM.cos(j*2.094)*.08,z+.06);spoke.rotation.z=-j*2.094;}
        }else{
          for(let j=0;j<3;j++)block(body,chrome,1.58,.018,.026,0,.72+j*.095,z+.01);
        }
        if(s.grille==='camaro')block(body,carbon,2.45,.13,.09,0,1.19,z);
        if(s.grille==='nissan'){for(const x of [-.61,.61])block(body,chrome,.06,.48,.035,x,.91,z+.02);}
      }
      for(const side of [-1,1]){
        if(s.lights==='round'){
          const housing=ball(body,carbon,.3,side*1.05,1.27,2.82);housing.scale.set(1,1.25,.42);
          const light=ball(body,lamp,.238,side*1.05,1.29,2.93);light.scale.set(1,1.24,.42);
        }else{
          const ly=s.nose-.02;
          const h=block(body,carbon,.67,.19,.09,side*.95,ly,z+.01);h.rotation.z=side*(s.lights==='slash'?.18:0);
          const l=block(body,lamp,.59,.046,.035,side*.95,ly+.035,z+.07);l.rotation.z=h.rotation.z;
          if(s.lights==='triple'||s.lights==='twin')for(let j=0;j<(s.lights==='triple'?3:2);j++)block(body,lamp,.045,.095,.03,side*(.76+j*.17),ly-.035,z+.075);
          if(s.lights==='blade'){const l=block(body,lamp,.05,.16,.04,side*1.22,ly-.05,z+.05);l.rotation.z=side*-.55;}
        }
        if(s.rear==='round')for(const x of [.72,1.1]){const tail=ball(body,red,.135,side*x,1.16,-3.1);tail.scale.z=.28;}
        else if(s.rear==='triple')for(let j=0;j<3;j++)block(body,red,.1,.25,.05,side*(.65+j*.2),1.11,-3.12);
        else block(body,red,s.rear==='bar'?1.23:.74,.065,.05,side*(s.rear==='bar'?.63:.92),1.12,-3.12);
        const support=block(body,carbon,.095,.59,.14,side*.99,1.63,-2.7);support.rotation.x=key==='valkyr'?-.35:.1;
        block(body,paint,.06,.32,.83,side*1.65,1.94,-2.75);
      }
      block(body,carbon,3.1,.09,.5,0,.42,3.02);
      block(body,carbon,3.35,.105,.77,0,1.97,-2.73);
      block(body,paint,3.3,.025,.09,0,2.04,-3.08);
      for(let j=-4;j<=4;j++)block(body,carbon,.045,.24,.48,j*.28,.5,-3.02);
      const exhausts=s.mid?[-.3,.3]:[-.97,.97];
      for(const x of exhausts){const pipe=cyl(body,chrome,.11,.22,x,.65,-3.14);pipe.rotation.x=Math.PI/2;}
      if(s.mid)for(let j=0;j<7;j++)block(body,carbon,1.45,.03,.06,0,1.43,-1.7-j*.13);
      if(key==='spectre'||key==='corsair')for(const x of [-.87,.87])shell(body,paint,[[-2.65,.08,1.32,1.4,.05],[-1.25,.10,1.33,1.68,.04],[-.95,.08,1.34,1.75,.04]]).position.x=x;
      if(key==='classic'||key==='sprint')shell(body,carbon,[[1.0,.38,1.36,1.5,.31],[1.8,.4,1.3,1.43,.32],[2.65,.32,s.nose,1.33,.25]]);
      const wheels=[],rubber=mat('#101115',.02,.95),rimMat=mat(key==='valkyr'?'#dfbd66':'#697985',.8,.28);
      for(const x of [-1.47,1.47])for(const z of [-s.axle,s.axle]){
        const w=new T.Group();w.position.set(x,.61,z);body.add(w);
        const tire=cyl(w,rubber,.61,.43,0,0,0,24);tire.rotation.z=Math.PI/2;
        const rim=cyl(w,carbon,.43,.449,0,0,0,24);rim.rotation.z=Math.PI/2;
        const disc=cyl(w,chrome,.34,.452,0,0,0,20);disc.rotation.z=Math.PI/2;
        block(w,mat('#ff4433'),.46,.28,.12,0,.19,.2);
        for(let j=0;j<10;j++){const a=j*Math.PI/5;const spoke=block(w,rimMat,.47,.035,.41,0,DM.sin(a)*.2,DM.cos(a)*.2);spoke.rotation.x=-a;}
        const hub=cyl(w,chrome,.08,.48,0,0,0,12);hub.rotation.z=Math.PI/2;wheels.push(w);
      }
      body.scale.set(s.width,1,s.length);
      return {group:g,body,wheels,paint};
    }
    function part(type,color='#40baff'){
      const g=new T.Group(),metal=mat('#afbbc8',.88,.25),dark=mat('#252d3b',.75,.32),accent=mat(color,.56,.23),rubber=mat('#111620',.05,.8);
      if(type==='engine'){
        block(g,dark,1.4,.9,1.65,0,.1,0);
        for(const x of [-.65,.65]){const head=block(g,metal,.67,.55,1.7,x,.65,0);head.rotation.z=-Math.sign(x)*.3;block(g,accent,.56,.16,1.64,x,.96,0);
          for(let j=0;j<4;j++)tube(g,metal,[[x,.5,-.6+j*.4],[x*1.6,.28,-.6+j*.4],[x*1.7,-.4,-.5+j*.4],[x*.7,-.55,.85]],.085);}
        for(const [r,y] of [[.4,.3],[.27,-.4]]){const c=cyl(g,metal,r,.16,0,y,1);c.rotation.x=Math.PI/2;const h=cyl(g,dark,r*.6,.18,0,y,1.03);h.rotation.x=Math.PI/2;}
        block(g,accent,.9,.26,.9,0,1.13,-.1);
      }else if(type==='brakes'||type==='tyres'){
        const wheel=cyl(g,type==='tyres'?rubber:metal,1,.42);wheel.rotation.x=Math.PI/2;
        const ring=mesh(g,new T.TorusGeometry(.8,.1,12,48),type==='tyres'?accent:dark,0,0,.24);
        const hub=cyl(g,dark,.4,.52);hub.rotation.x=Math.PI/2;
        for(let j=0;j<12;j++){const a=j/12*Math.PI*2;if(type==='brakes')for(const r of [.62,.82]){const hole=cyl(g,dark,.035,.02,DM.cos(a)*r,DM.sin(a)*r,.22);hole.rotation.x=Math.PI/2;}else{const spoke=block(g,metal,.09,1.4,.07,0,0,.28);spoke.rotation.z=a;}}
        if(type==='brakes')block(g,accent,.46,1.14,.5,.84,0,.2);
      }else if(type==='aero'){
        for(const x of [-.9,.9]){block(g,metal,.14,1,.23,x,-.2,0);block(g,accent,.1,.6,1.25,x*1.55,.42,0);}
        const wing=block(g,accent,2.95,.16,1.1,0,.43,0);wing.rotation.x=-.13;block(g,dark,2.85,.06,.2,0,.56,-.5);
      }else if(type==='suspension'){
        cyl(g,metal,.13,2.8);cyl(g,dark,.24,1.6,0,-.5);cyl(g,accent,.43,.13,0,-1.05);cyl(g,accent,.43,.13,0,1.05);
        const pts=Array.from({length:180},(_,i)=>{const a=i/179*Math.PI*18;return [DM.cos(a)*.34,-.9+i/179*1.8,DM.sin(a)*.34];});tube(g,accent,pts,.075);g.rotation.z=-.38;
      }else if(type==='gearbox'){
        for(let i=0;i<5;i++){const c=cyl(g,i%2?dark:metal,.7-i*.1,.4,0,0,-.7+i*.38);c.rotation.x=Math.PI/2;}
        block(g,accent,1.2,.6,1.1,0,.3,-.5);const axle=cyl(g,metal,.13,2.5);axle.rotation.z=Math.PI/2;
      }else if(type==='cooling'){
        block(g,dark,2,1.8,.4);for(let i=0;i<20;i++)block(g,metal,1.8,.035,.45,0,-.79+i*.08,0);
        for(const x of [-1,1])block(g,accent,.18,1.95,.5,x,0,0);tube(g,metal,[[-1,.8,0],[-1.3,1,0],[-1.3,1.3,0]],.12);
      }else{
        block(g,metal,1.9,.6,1.65);block(g,accent,1.75,.065,1.5,0,.34,0);for(let i=0;i<7;i++)block(g,dark,.09,.07,1.25,-.6+i*.2,.41,0);
        for(let i=0;i<4;i++){block(g,dark,.3,.23,.32,-.6+i*.4,0,.93);tube(g,i%2?accent:rubber,[[-.6+i*.4,0,1],[-.6+i*.4,-.4,1.5],[.8,-.6,1.4]],.05);}
      }
      return g;
    }
    // Original vector portraits: stable facial identity per driver, zero WebGL cost.
    function portrait(d){
      if(d && d.photo){try{return new URL('../'+d.photo,document.baseURI).href;}catch(e){}}   // retrato real del roster (assets/players/racing)
      const n=Number(d.id)||0,seed=(n*7+Number(d.number))%31;
      const skin=['#edb89a','#c98863','#e0a681','#b87a56','#f1c5a7','#9d654a'][seed%6];
      const shade=['#c88672','#9d5e44','#b3795b','#895039','#c9967d','#774630'][seed%6];
      const hair=['#25232a','#3d2c27','#6c4930','#b08a57','#181b23'][n%5];
      const color='#'+d.color.toString(16).padStart(6,'0'),accent=d.accent||'#e8e4d4';
      const jaw=47+(n%4)*3,eye=112+(n%3)*2,brow=eye-10;
      const hairstyles=[
        'M99 102Q84 47 116 38Q147 11 186 39Q210 51 204 99L192 84 184 65Q151 83 113 68Z',
        'M97 99Q81 75 97 56Q87 38 109 36Q119 16 137 28Q154 13 172 30Q195 23 203 46Q223 56 204 98L189 76Q150 58 109 82Z',
        'M99 96 96 64Q103 27 150 29Q197 30 203 67L201 97 189 72Q154 54 111 72Z',
        'M97 111Q79 60 109 41Q150 15 189 36Q220 59 200 110L190 79Q176 57 145 60L111 83 108 110Z',
        'M96 99 91 56 106 61 111 32 125 41 139 24 153 34 177 26 178 40 197 38 207 64 201 105 188 76Q144 66 111 81Z'
      ];
      const beard=d.age>=29&&n%3!==1?`<path d="M104 133Q113 175 150 182Q190 170 198 133L186 153 173 159Q152 169 127 157Z" fill="${hair}" opacity=".48"/><path d="M132 149Q150 144 168 149" fill="none" stroke="${hair}" stroke-width="3"/>`:'';
      // colores de las banderas de las naciones ficticias (assets/nations)
      const flagColors={PER:['#f4f7fb','#7fbde0','#f4f7fb'],VAL:['#3b8fdc','#fff','#f58a2a'],CUN:['#0c76a0','#fff','#0bbf0b'],GRA:['#f41b1b','#fff','#f0c030'],IBE:['#aa1000','#111','#06256d'],KAI:['#1a8fd0','#fff','#12469a'],MAG:['#fcc200','#0a1678','#a00000'],MRG:['#e87232','#fff','#000'],MEL:['#f5423f','#92b81c','#4a7a08'],MOR:['#103a68','#5397d9','#103a68'],RIA:['#f41f1b','#ffc000','#f41f1b'],SAH:['#fff','#000','#880000'],SKO:['#3f87c7','#f0c030','#000'],SOT:['#06256d','#fff','#a00000'],TAM:['#0a1678','#ffc000','#0a1678'],ZEN:['#4f174d','#fff','#4f174d']};
      const flags=flagColors[d.nationality]||flagColors.PER;
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360">
        <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#101c30"/></linearGradient><linearGradient id="face" x2="1" y2=".3"><stop stop-color="${skin}"/><stop offset=".65" stop-color="${skin}"/><stop offset="1" stop-color="${shade}"/></linearGradient><linearGradient id="suit" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#142136"/></linearGradient></defs>
        <path fill="url(#bg)" d="M0 0h300v360H0z"/>
        <path d="M-70 330 180 0h66L-5 360zm217 30L300 158v56L190 360Z" fill="${accent}" opacity=".12"/>
        <path d="M0 318 238 0M36 360 300 13" stroke="${accent}" stroke-width="2" opacity=".3"/>
        <text x="288" y="300" font-family="Arial" font-size="180" font-weight="900" text-anchor="end" fill="#fff" opacity=".06">${escape(d.number)}</text>
        <g transform="translate(${(n%3-1)*5} 29)">
        <path d="M25 339 34 228Q41 204 117 185L183 185Q259 206 266 230L278 339Z" fill="url(#suit)" stroke="#111e30" stroke-width="3"/>
        <path d="M41 221 76 210 98 339H25ZM258 222 225 211 208 339H277Z" fill="#111e30"/>
        <path d="M53 217 69 212 94 339H78Zm194 0-16-5-23 127h17Z" fill="${accent}" opacity=".85"/>
        <path d="M123 160 121 195 151 218 181 195 177 156Z" fill="${shade}"/>
        <path d="M127 167 128 190 150 203 173 188 173 162Z" fill="${skin}"/>
        <path d="M116 186 149 208 181 186 190 203 156 222 144 222 109 203Z" fill="#112034" stroke="${accent}" stroke-width="2"/>
        <path d="M150 223v112" stroke="${accent}" opacity=".65"/>
        <ellipse cx="101" cy="120" rx="10" ry="18" fill="${shade}"/><ellipse cx="199" cy="120" rx="10" ry="18" fill="${shade}"/>
        <path d="M101 82Q101 42 150 43Q200 43 200 84L${150+jaw} 139Q190 164 168 178Q151 190 133 178Q110 164 ${150-jaw} 139Z" fill="url(#face)"/>
        <path d="M102 90 115 85 108 130 119 151 110 151 103 136Z" fill="${shade}" opacity=".4"/>
        <path d="M156 104 150 128 162 135 150 138 141 135" stroke="${shade}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M113 ${brow}Q125 ${brow-5} 137 ${brow+1}M165 ${brow+1}Q180 ${brow-5} 190 ${brow}" stroke="${hair}" stroke-width="4" fill="none"/>
        <path d="M112 ${eye}Q124 ${eye-7} 138 ${eye}Q124 ${eye+5} 112 ${eye}M164 ${eye}Q178 ${eye-7} 190 ${eye}Q178 ${eye+5} 164 ${eye}" fill="#f3ece3"/>
        <g fill="${n%3===0?'#7a998b':'#67533d'}"><ellipse cx="126" cy="${eye-1}" rx="4" ry="4.5"/><ellipse cx="176" cy="${eye-1}" rx="4" ry="4.5"/></g>
        <g fill="#202733"><circle cx="126" cy="${eye-1}" r="2.2"/><circle cx="176" cy="${eye-1}" r="2.2"/></g>
        <path d="M112 ${eye-1}Q124 ${eye-7} 138 ${eye}M164 ${eye}Q177 ${eye-7} 190 ${eye-1}" fill="none" stroke="${hair}" stroke-width="1.6"/>
        <path d="M132 ${151+n%3}Q149 148 170 ${151+n%3}Q151 163 132 ${151+n%3}" fill="#a76660"/>
        <path d="M134 153Q151 155 168 152" fill="none" stroke="#70463f" stroke-width="1.5"/>
        ${beard}<path d="${hairstyles[n%5]}" fill="${hair}"/>
        <path d="M110 58Q147 36 184 49M109 65Q150 43 183 56" fill="none" stroke="${accent}" opacity=".12" stroke-width="2"/>
        <path d="M98 96 107 87 107 111 102 119ZM193 89 201 97 198 121 192 110Z" fill="${hair}"/>
        <g font-family="Arial" font-weight="900"><rect x="91" y="232" width="48" height="20" rx="3" fill="${accent}"/><text x="115" y="246" font-size="10" fill="#192132" text-anchor="middle">LRO</text><text x="185" y="245" font-size="11" fill="#fff" text-anchor="middle">GT3</text><text x="150" y="281" font-style="italic" font-size="30" fill="#f4f0e6" text-anchor="middle">MOTORSPORT</text><text x="150" y="297" font-size="7" letter-spacing="4" fill="${accent}" text-anchor="middle">RACING DIVISION</text><text x="183" y="326" font-size="25" fill="${accent}">${escape(d.number)}</text></g>
        </g>
        <g transform="translate(18 16)">${flags.map((c,i)=>`<path d="M0 ${i*6}h30v6H0z" fill="${c}"/>`).join('')}<path d="M0 0h30v18H0z" fill="none" stroke="#fff" stroke-opacity=".4"/></g>
      </svg>`;
      return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    }
    let renderer,studio,camera;
    function init(){
      if(renderer)return;
      renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setSize(800,480);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
      studio=new T.Scene();studio.add(new T.HemisphereLight(0xc5e5ff,0x334061,3));
      [[-4,7,7,0xffffff,95],[6,4,-3,0x67baff,100],[0,5,-6,0xffffff,110]].forEach(([x,y,z,c,p])=>{const light=new T.PointLight(c,p);light.position.set(x,y,z);studio.add(light);});
      camera=new T.PerspectiveCamera(34,800/480,.1,100);
    }
    function render(kind,key,color){
      const id=kind+':'+(kind==='driver'?key.id:key)+':'+(color&&typeof color==='object'?JSON.stringify(color):color);if(cache.has(id))return cache.get(id);
      if(kind==='driver'){const url=portrait(key);cache.set(id,url);return url;}
      try{
        init();let model;
        if(kind==='car'){model=car(key,color).group;camera.position.set(8.6,4.8,11);camera.lookAt(0,.7,0);}
        else {model=part(key,color);camera.position.set(3.3,2.5,4.5);camera.lookAt(0,0,0);}
        studio.add(model);renderer.render(studio,camera);const url=renderer.domElement.toDataURL('image/png');studio.remove(model);
        const geometries=new Set(),materials=new Set(),textures=new Set();model.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);if(m.map)textures.add(m.map);}}});geometries.forEach(o=>o.dispose());materials.forEach(o=>o.dispose());textures.forEach(o=>o.dispose());
        cache.set(id,url);return url;
      }catch(err){console.warn('Artwork renderer unavailable:',err.message);return 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120"><path fill="'+((color&&color.primary)||color||'#e73549')+'" d="M20 80V50l40-30h65l40 30 18 8v22H20z"/><circle cx="50" cy="80" r="18" fill="#121827"/><circle cx="145" cy="80" r="18" fill="#121827"/><path d="M65 28h52l27 24H44z" fill="#213b54"/></svg>');}
    }
    const escape = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function image(kind,key,color,cls=''){const k=kind==='driver'?key.id:key;const id=kind+':'+k+':'+(color&&typeof color==='object'?JSON.stringify(color):color);let url=cache.get(id);if(!url){url=render(kind,key,color);cache.set(id,url);}return `<img class="art-render ${cls}" src="${url}" alt="${escape(kind==='driver'?'Piloto '+key.name:kind==='car'?(BODIES[key]?.name||key):PART_LABELS[key]||key)}" draggable="false">`;}
    let packSerial=0;
    function pack(key,cls=''){
      const colors={bronze:['#895038','#edbd91'],silver:['#65869f','#e7f5fc'],gold:['#b77c1b','#ffe8a0'],legend:['#7135b6','#ddb7ff']};
      const [a,b]=colors[key]||colors.gold,id='pack-'+(++packSerial),label={bronze:'BRONZE',silver:'SILVER',gold:'GOLD',legend:'LEGEND'}[key]||'GOLD';
      // Instance-unique SVG IDs prevent invisible gradients when a hidden screen owns the first pack.
      return `<svg class="pack-art ${cls}" viewBox="0 0 240 290" role="img" aria-label="Sobre ${label}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="${b}"/><stop offset=".18" stop-color="${a}"/><stop offset=".46" stop-color="${b}"/><stop offset=".53" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><linearGradient id="${id}-dark" x2=".8" y2="1"><stop stop-color="#263750"/><stop offset="1" stop-color="#080e1c"/></linearGradient></defs>
        <ellipse cx="122" cy="269" rx="81" ry="10" fill="#000" opacity=".3"/>
        <path d="M37 14H203L209 268H31Z" fill="url(#${id})" stroke="${b}" stroke-width="1.5"/>
        <path d="M40 36h160l5 210H35Z" fill="url(#${id}-dark)"/>
        <path d="M35 214 158 36h42L63 246H35Z" fill="${a}" opacity=".22"/>
        <path d="m37 211 121-175M56 246 146 115" stroke="${b}" opacity=".4"/>
        <path d="M40 39h160M35 243h170" stroke="${b}" stroke-width="2"/>
        <g stroke="#0c1424" opacity=".4">${Array.from({length:31},(_,i)=>`<path d="M${43+i*5} 17v15m-5 219v13"/>`).join('')}</g>
        <g font-family="Arial" text-anchor="middle"><text x="120" y="68" fill="#fff" font-size="23" font-weight="900" font-style="italic">LRO</text><text x="120" y="82" fill="${b}" font-size="7" letter-spacing="3">MOTORSPORT COLLECTION</text></g>
        <path d="m120 102 52 25v42l-52 30-52-30v-42Z" fill="#102239" stroke="${b}" stroke-width="2"/>
        <path d="M84 154v-13l16-13h39l17 13v13M81 154h78v9H81Z" fill="${b}"/>
        <path d="m103 133-10 10h54l-11-10Z" fill="#152338"/><path d="M88 152h13m38 0h13" stroke="#fff" stroke-width="3"/>
        <g fill="${b}" font-family="Arial" text-anchor="middle"><text x="120" y="223" font-size="23" font-weight="900" letter-spacing="3">${label}</text><text x="120" y="236" font-size="6.5" letter-spacing="2">GT3 / PERFORMANCE SERIES</text></g>
        <path d="M42 39h5l-3 204h-6Z" fill="#fff" opacity=".17"/>
        </svg>`;
    }
    return {car,part,image,pack,specs,trackCurve,portrait};
  })();
  
  return { newCareer, TRACKS, TEAM_DEFS }; }
  let SIMT = 0, RS = 1, HALFHIT = false;
  const SRAND = () => { let t = (RS += 0x6D2B79F5) >>> 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  
  // BASE DE PILOTOS DE LRO — generada por assets/roster/tools/build_racing_roster.py (no editar a mano).
  // Índices 0-9: titulares de los 10 equipos; 10-19: segundos pilotos; el resto: mercado. n nombre, s apellido corto, num número, c nación, a edad, p personalidad, st 8 stats (punta, aceleración, frenada, curva, control, agresividad, consistencia, adelantamiento), ph retrato.
  window.LRO_ROSTER = {"version":1,"placeholder":"assets/players/placeholder.webp","drivers":[{"id":"a_bonellinicolas","n":"Nicolás Bonelli","s":"BONELLI","num":"76","c":"PER","a":39,"p":"AGGRESSIVE","st":[0.85,0.88,0.91,0.86,0.84,0.92,0.82,0.89],"ph":"assets/players/racing/a_bonellinicolas.webp","k":"actc"},{"id":"g_simonreicher","n":"Simon Reicher","s":"REICHER","num":"43","c":"MRG","a":26,"p":"AGGRESSIVE","st":[0.9,0.86,0.84,0.89,0.81,0.92,0.76,0.89],"ph":"assets/players/racing/g_simonreicher.webp","k":"gt"},{"id":"a_ardussofacundo","n":"Facundo Ardusso","s":"ARDUSSO","num":"51","c":"VAL","a":39,"p":"DEFENSIVE","st":[0.85,0.9,0.88,0.91,0.92,0.81,0.92,0.86],"ph":"assets/players/racing/a_ardussofacundo.webp","k":"actc"},{"id":"a_wernermariano","n":"Mariano Werner","s":"WERNER","num":"52","c":"VAL","a":40,"p":"AGGRESSIVE","st":[0.88,0.9,0.92,0.9,0.85,0.96,0.9,0.97],"ph":"assets/players/racing/a_wernermariano.webp","k":"actc"},{"id":"a_todinogerman","n":"Germán Todino","s":"TODINO","num":"73","c":"VAL","a":41,"p":"TYRE SAVER","st":[0.87,0.86,0.87,0.87,0.85,0.85,0.95,0.84],"ph":"assets/players/racing/a_todinogerman.webp","k":"actc"},{"id":"a_canapinoagustin","n":"Agustín Canapino","s":"A. CANAPINO","num":"01","c":"VAL","a":36,"p":"TYRE SAVER","st":[0.91,0.91,0.91,0.96,0.98,0.85,0.95,0.89],"ph":"assets/players/racing/a_canapinoagustin.webp","k":"actc"},{"id":"g_bengreen","n":"Ben Green","s":"GREEN","num":"12","c":"MRG","a":39,"p":"RISK TAKER","st":[0.89,0.85,0.87,0.9,0.84,0.94,0.83,0.86],"ph":"assets/players/racing/g_bengreen.webp","k":"gt"},{"id":"g_frederikschandorff","n":"Frederik Schandorff","s":"SCHANDORFF","num":"14","c":"OVM","a":30,"p":"RISK TAKER","st":[0.92,0.86,0.82,0.85,0.85,0.96,0.81,0.88],"ph":"assets/players/racing/g_frederikschandorff.webp","k":"gt"},{"id":"a_santerojulian","n":"Julián Santero","s":"SANTERO","num":"06","c":"PER","a":38,"p":"AGGRESSIVE","st":[0.9,0.88,0.88,0.88,0.89,0.93,0.82,0.95],"ph":"assets/players/racing/a_santerojulian.webp","k":"actc"},{"id":"g_kobepauwels","n":"Kobe Pauwels","s":"PAUWELS","num":"42","c":"MEL","a":22,"p":"AGGRESSIVE","st":[0.9,0.8,0.85,0.86,0.83,0.95,0.78,0.91],"ph":"assets/players/racing/g_kobepauwels.webp","k":"gt"},{"id":"g_maximerobin","n":"Maxime Robin","s":"ROBIN","num":"91","c":"OVM","a":26,"p":"AGGRESSIVE","st":[0.87,0.88,0.79,0.84,0.82,0.95,0.81,0.93],"ph":"assets/players/racing/g_maximerobin.webp","k":"gt"},{"id":"g_arjunmaini","n":"Arjun Maini","s":"MAINI","num":"24","c":"GRA","a":28,"p":"AGGRESSIVE","st":[0.84,0.85,0.84,0.84,0.8,0.9,0.77,0.88],"ph":"assets/players/racing/g_arjunmaini.webp","k":"gt"},{"id":"g_chrisfroggatt","n":"Chris Froggatt","s":"FROGGATT","num":"03","c":"KAI","a":33,"p":"WET SPECIALIST","st":[0.87,0.83,0.85,0.87,0.88,0.79,0.92,0.86],"ph":"assets/players/racing/g_chrisfroggatt.webp","k":"gt"},{"id":"g_gabrielrindone","n":"Gabriel Rindone","s":"RINDONE","num":"08","c":"MRG","a":54,"p":"TYRE SAVER","st":[0.84,0.8,0.86,0.8,0.82,0.82,0.88,0.88],"ph":"assets/players/racing/g_gabrielrindone.webp","k":"gt"},{"id":"a_martineztobias","n":"Tobías Martínez","s":"MARTÍNEZ","num":"95","c":"PER","a":28,"p":"WET SPECIALIST","st":[0.82,0.83,0.85,0.89,0.92,0.8,0.83,0.87],"ph":"assets/players/racing/a_martineztobias.webp","k":"actc"},{"id":"a_tetijeronimo","n":"Jerónimo Teti","s":"TETI","num":"57","c":"PER","a":34,"p":"RISK TAKER","st":[0.88,0.84,0.85,0.85,0.8,0.94,0.78,0.85],"ph":"assets/players/racing/a_tetijeronimo.webp","k":"actc"},{"id":"g_benjamingoethe","n":"Benjamin Goethe","s":"GOETHE","num":"30","c":"OVM","a":23,"p":"RISK TAKER","st":[0.88,0.87,0.82,0.84,0.81,0.94,0.76,0.87],"ph":"assets/players/racing/g_benjamingoethe.webp","k":"gt"},{"id":"a_ledesmachristian","n":"Christian Ledesma","s":"LEDESMA","num":"47","c":"PER","a":46,"p":"RISK TAKER","st":[0.86,0.8,0.85,0.86,0.81,0.9,0.84,0.89],"ph":"assets/players/racing/a_ledesmachristian.webp","k":"actc"},{"id":"a_spataroemiliano","n":"Emiliano Spataro","s":"SPATARO","num":"56","c":"VAL","a":36,"p":"RISK TAKER","st":[0.86,0.85,0.81,0.87,0.83,0.93,0.82,0.91],"ph":"assets/players/racing/a_spataroemiliano.webp","k":"actc"},{"id":"a_lambirismauricio","n":"Mauricio Lambiris","s":"LAMBIRIS","num":"20","c":"PER","a":41,"p":"QUALIFYING SPECIALIST","st":[0.89,0.85,0.85,0.9,0.88,0.78,0.86,0.8],"ph":"assets/players/racing/a_lambirismauricio.webp","k":"actc"},{"id":"g_markuswinkelhock","n":"Markus Winkelhock","s":"WINKELHOCK","num":"67","c":"MRG","a":46,"p":"DEFENSIVE","st":[0.83,0.81,0.84,0.81,0.87,0.76,0.85,0.79],"ph":"assets/players/racing/g_markuswinkelhock.webp","k":"gt"},{"id":"g_colincaresani","n":"Colin Caresani","s":"CARESANI","num":"64","c":"KAI","a":38,"p":"AGGRESSIVE","st":[0.73,0.78,0.77,0.79,0.76,0.82,0.74,0.85],"ph":"assets/players/racing/g_colincaresani.webp","k":"gt"},{"id":"g_dylanmedler","n":"Dylan Medler","s":"MEDLER","num":"74","c":"IBE","a":42,"p":"WET SPECIALIST","st":[0.78,0.8,0.83,0.87,0.9,0.81,0.81,0.84],"ph":"assets/players/racing/g_dylanmedler.webp","k":"gt"},{"id":"g_alessiopicariello","n":"Alessio Picariello","s":"PICARIELLO","num":"18","c":"MRG","a":33,"p":"WET SPECIALIST","st":[0.74,0.75,0.79,0.81,0.83,0.76,0.84,0.8],"ph":"assets/players/racing/g_alessiopicariello.webp","k":"gt"},{"id":"g_josephloake","n":"Joseph Loake","s":"LOAKE","num":"45","c":"KAI","a":41,"p":"WET SPECIALIST","st":[0.76,0.73,0.72,0.76,0.78,0.7,0.77,0.78],"ph":"assets/players/racing/g_josephloake.webp","k":"gt"},{"id":"g_bendoerr","n":"Ben Doerr","s":"B. DOERR","num":"90","c":"MRG","a":21,"p":"QUALIFYING SPECIALIST","st":[0.8,0.83,0.81,0.76,0.77,0.77,0.73,0.78],"ph":"assets/players/racing/g_bendoerr.webp","k":"gt"},{"id":"g_lorisspinelli","n":"Loris Spinelli","s":"SPINELLI","num":"54","c":"MEL","a":31,"p":"CONSISTENT","st":[0.79,0.74,0.75,0.82,0.81,0.75,0.9,0.75],"ph":"assets/players/racing/g_lorisspinelli.webp","k":"gt"},{"id":"g_jameskellett","n":"James Kellett","s":"KELLETT","num":"99","c":"MRG","a":39,"p":"CONSISTENT","st":[0.74,0.76,0.76,0.78,0.77,0.74,0.81,0.73],"ph":"assets/players/racing/g_jameskellett.webp","k":"gt"},{"id":"g_lucaengstler","n":"Luca Engstler","s":"ENGSTLER","num":"09","c":"OVM","a":31,"p":"AGGRESSIVE","st":[0.8,0.78,0.76,0.81,0.79,0.86,0.77,0.85],"ph":"assets/players/racing/g_lucaengstler.webp","k":"gt"},{"id":"g_christianhahn","n":"Christian Hahn","s":"HAHN","num":"02","c":"MRG","a":38,"p":"TYRE SAVER","st":[0.72,0.73,0.78,0.74,0.74,0.74,0.82,0.73],"ph":"assets/players/racing/g_christianhahn.webp","k":"gt"},{"id":"g_oliversoderstrom","n":"Oliver Soderstrom","s":"SODERSTROM","num":"25","c":"OVM","a":28,"p":"RISK TAKER","st":[0.84,0.8,0.82,0.8,0.81,0.86,0.77,0.86],"ph":"assets/players/racing/g_oliversoderstrom.webp","k":"gt"},{"id":"a_decarlodiego","n":"Diego De Carlo","s":"CARLO","num":"62","c":"PER","a":50,"p":"WET SPECIALIST","st":[0.75,0.79,0.8,0.83,0.88,0.73,0.79,0.82],"ph":"assets/players/racing/a_decarlodiego.webp","k":"actc"},{"id":"g_rolfineichen","n":"Rolf Ineichen","s":"INEICHEN","num":"41","c":"MRG","a":42,"p":"DEFENSIVE","st":[0.85,0.83,0.85,0.84,0.84,0.74,0.87,0.83],"ph":"assets/players/racing/g_rolfineichen.webp","k":"gt"},{"id":"a_moscardininicolas","n":"Nicolás Moscardini","s":"MOSCARDINI","num":"05","c":"VAL","a":36,"p":"AGGRESSIVE","st":[0.79,0.81,0.79,0.83,0.81,0.87,0.79,0.86],"ph":"assets/players/racing/a_moscardininicolas.webp","k":"actc"},{"id":"g_alexeynesov","n":"Alexey Nesov","s":"NESOV","num":"65","c":"KAI","a":38,"p":"QUALIFYING SPECIALIST","st":[0.81,0.84,0.85,0.84,0.84,0.82,0.77,0.8],"ph":"assets/players/racing/g_alexeynesov.webp","k":"gt"},{"id":"g_arthurdorison","n":"Arthur Dorison","s":"DORISON","num":"36","c":"IBE","a":18,"p":"DEFENSIVE","st":[0.76,0.79,0.77,0.79,0.76,0.66,0.85,0.77],"ph":"assets/players/racing/g_arthurdorison.webp","k":"gt"},{"id":"g_giacomopetrobelli","n":"Giacomo Petrobelli","s":"PETROBELLI","num":"40","c":"KAI","a":51,"p":"WET SPECIALIST","st":[0.77,0.79,0.84,0.82,0.85,0.78,0.84,0.71],"ph":"assets/players/racing/g_giacomopetrobelli.webp","k":"gt"},{"id":"a_serranomartin","n":"Martín Serrano","s":"SERRANO","num":"61","c":"PER","a":34,"p":"RISK TAKER","st":[0.79,0.81,0.74,0.82,0.74,0.85,0.71,0.79],"ph":"assets/players/racing/a_serranomartin.webp","k":"actc"},{"id":"a_risattiricardo","n":"Ricardo Risatti","s":"RISATTI","num":"78","c":"VAL","a":34,"p":"CONSISTENT","st":[0.76,0.78,0.82,0.78,0.76,0.78,0.81,0.74],"ph":"assets/players/racing/a_risattiricardo.webp","k":"actc"},{"id":"a_azardiego","n":"Diego Azar","s":"AZAR","num":"80","c":"VAL","a":34,"p":"CONSISTENT","st":[0.76,0.78,0.78,0.81,0.78,0.73,0.87,0.73],"ph":"assets/players/racing/a_azardiego.webp","k":"actc"},{"id":"g_marcosorensen","n":"Marco Sorensen","s":"SORENSEN","num":"87","c":"OVM","a":36,"p":"AGGRESSIVE","st":[0.79,0.8,0.77,0.79,0.77,0.85,0.74,0.9],"ph":"assets/players/racing/g_marcosorensen.webp","k":"gt"},{"id":"g_alexfontana","n":"Alex Fontana","s":"A. FONTANA","num":"98","c":"MRG","a":34,"p":"DEFENSIVE","st":[0.81,0.82,0.82,0.85,0.82,0.73,0.85,0.7],"ph":"assets/players/racing/g_alexfontana.webp","k":"gt"},{"id":"g_calanwilliams","n":"Calan Williams","s":"WILLIAMS","num":"81","c":"KAI","a":26,"p":"WET SPECIALIST","st":[0.7,0.74,0.76,0.81,0.82,0.68,0.75,0.75],"ph":"assets/players/racing/g_calanwilliams.webp","k":"gt"},{"id":"g_alfredohernandez","n":"Alfredo Hernandez","s":"HERNANDEZ","num":"26","c":"TAM","a":36,"p":"TYRE SAVER","st":[0.76,0.81,0.82,0.83,0.88,0.79,0.79,0.79],"ph":"assets/players/racing/g_alfredohernandez.webp","k":"gt"},{"id":"g_conradlaursen","n":"Conrad Laursen","s":"LAURSEN","num":"97","c":"GRA","a":35,"p":"DEFENSIVE","st":[0.77,0.82,0.78,0.85,0.86,0.71,0.88,0.8],"ph":"assets/players/racing/g_conradlaursen.webp","k":"gt"},{"id":"g_carrieschreiner","n":"Carrie Schreiner","s":"SCHREINER","num":"49","c":"MRG","a":28,"p":"DEFENSIVE","st":[0.85,0.85,0.86,0.78,0.83,0.77,0.83,0.8],"ph":"assets/players/racing/g_carrieschreiner.webp","k":"gt"},{"id":"a_mangonisantiago","n":"Santiago Mangoni","s":"MANGONI","num":"83","c":"PER","a":24,"p":"DEFENSIVE","st":[0.8,0.74,0.83,0.78,0.75,0.66,0.8,0.73],"ph":"assets/players/racing/a_mangonisantiago.webp","k":"actc"},{"id":"g_gillesmagnus","n":"Gilles Magnus","s":"MAGNUS","num":"29","c":"MRG","a":27,"p":"RISK TAKER","st":[0.67,0.78,0.71,0.77,0.66,0.79,0.7,0.78],"ph":"assets/players/racing/g_gillesmagnus.webp","k":"gt"},{"id":"a_impiombatonicolas","n":"Nicolás Impiombato","s":"IMPIOMBATO","num":"96","c":"PER","a":34,"p":"CONSISTENT","st":[0.78,0.76,0.81,0.82,0.82,0.77,0.88,0.76],"ph":"assets/players/racing/a_impiombatonicolas.webp","k":"actc"},{"id":"g_alfredrenauer","n":"Alfred Renauer","s":"RENAUER","num":"85","c":"MRG","a":29,"p":"QUALIFYING SPECIALIST","st":[0.85,0.88,0.81,0.83,0.78,0.82,0.81,0.77],"ph":"assets/players/racing/g_alfredrenauer.webp","k":"gt"},{"id":"g_baptistemoulin","n":"Baptiste Moulin","s":"MOULIN","num":"55","c":"MRG","a":27,"p":"DEFENSIVE","st":[0.85,0.81,0.86,0.83,0.84,0.7,0.88,0.8],"ph":"assets/players/racing/g_baptistemoulin.webp","k":"gt"},{"id":"g_harrygeorge","n":"Harry George","s":"GEORGE","num":"53","c":"OVM","a":32,"p":"DEFENSIVE","st":[0.69,0.75,0.76,0.75,0.76,0.65,0.79,0.7],"ph":"assets/players/racing/g_harrygeorge.webp","k":"gt"},{"id":"a_abdalatomas","n":"Tomás Abdala","s":"ABDALA","num":"35","c":"PER","a":24,"p":"QUALIFYING SPECIALIST","st":[0.81,0.79,0.79,0.79,0.8,0.76,0.77,0.74],"ph":"assets/players/racing/a_abdalatomas.webp","k":"actc"},{"id":"a_landamarcos","n":"Marcos Landa","s":"LANDA","num":"68","c":"PER","a":34,"p":"AGGRESSIVE","st":[0.8,0.79,0.82,0.87,0.79,0.89,0.75,0.86],"ph":"assets/players/racing/a_landamarcos.webp","k":"actc"},{"id":"g_dustinblattner","n":"Dustin Blattner","s":"BLATTNER","num":"70","c":"KAI","a":24,"p":"WET SPECIALIST","st":[0.78,0.75,0.75,0.82,0.85,0.75,0.75,0.77],"ph":"assets/players/racing/g_dustinblattner.webp","k":"gt"},{"id":"a_abellasebastian","n":"Sebastián Abella","s":"ABELLA","num":"11","c":"PER","a":36,"p":"WET SPECIALIST","st":[0.78,0.74,0.77,0.8,0.81,0.74,0.81,0.79],"ph":"assets/players/racing/a_abellasebastian.webp","k":"actc"},{"id":"a_fontananorberto","n":"Norberto Fontana","s":"N. FONTANA","num":"48","c":"VAL","a":51,"p":"AGGRESSIVE","st":[0.82,0.8,0.83,0.8,0.79,0.87,0.78,0.87],"ph":"assets/players/racing/a_fontananorberto.webp","k":"actc"},{"id":"a_olmedojeremias","n":"Jeremías Olmedo","s":"OLMEDO","num":"22","c":"PER","a":38,"p":"CONSISTENT","st":[0.83,0.79,0.85,0.82,0.81,0.78,0.86,0.81],"ph":"assets/players/racing/a_olmedojeremias.webp","k":"actc"},{"id":"g_dylanpereira","n":"Dylan Pereira","s":"PEREIRA","num":"66","c":"MRG","a":29,"p":"TYRE SAVER","st":[0.7,0.74,0.74,0.77,0.83,0.71,0.81,0.7],"ph":"assets/players/racing/g_dylanpereira.webp","k":"gt"},{"id":"g_aaronwalker","n":"Aaron Walker","s":"WALKER","num":"92","c":"MRG","a":38,"p":"CONSISTENT","st":[0.81,0.79,0.86,0.83,0.78,0.77,0.87,0.77],"ph":"assets/players/racing/g_aaronwalker.webp","k":"gt"},{"id":"a_chapurfacundo","n":"Facundo Chapur","s":"CHAPUR","num":"93","c":"PER","a":35,"p":"QUALIFYING SPECIALIST","st":[0.84,0.84,0.81,0.82,0.82,0.82,0.82,0.78],"ph":"assets/players/racing/a_chapurfacundo.webp","k":"actc"},{"id":"g_mirkobortolotti","n":"Mirko Bortolotti","s":"BORTOLOTTI","num":"17","c":"IBE","a":26,"p":"AGGRESSIVE","st":[0.77,0.77,0.74,0.75,0.74,0.79,0.71,0.81],"ph":"assets/players/racing/g_mirkobortolotti.webp","k":"gt"},{"id":"g_mattiadrudi","n":"Mattia Drudi","s":"DRUDI","num":"23","c":"MEL","a":28,"p":"DEFENSIVE","st":[0.86,0.81,0.85,0.84,0.88,0.77,0.86,0.77],"ph":"assets/players/racing/g_mattiadrudi.webp","k":"gt"},{"id":"a_vallelucas","n":"Lucas Valle","s":"VALLE","num":"07","c":"PER","a":31,"p":"AGGRESSIVE","st":[0.81,0.76,0.75,0.81,0.72,0.83,0.74,0.82],"ph":"assets/players/racing/a_vallelucas.webp","k":"actc"},{"id":"g_patrickniederhauser","n":"Patrick Niederhauser","s":"NIEDERHAUSER","num":"16","c":"TAM","a":30,"p":"QUALIFYING SPECIALIST","st":[0.83,0.84,0.86,0.8,0.83,0.84,0.83,0.72],"ph":"assets/players/racing/g_patrickniederhauser.webp","k":"gt"},{"id":"g_simonbalcaen","n":"Simon Balcaen","s":"BALCAEN","num":"04","c":"OVM","a":31,"p":"TYRE SAVER","st":[0.81,0.86,0.83,0.82,0.83,0.82,0.89,0.85],"ph":"assets/players/racing/g_simonbalcaen.webp","k":"gt"},{"id":"g_ugodewilde","n":"Ugo De Wilde","s":"WILDE","num":"72","c":"KAI","a":27,"p":"WET SPECIALIST","st":[0.78,0.78,0.83,0.86,0.86,0.75,0.86,0.85],"ph":"assets/players/racing/g_ugodewilde.webp","k":"gt"},{"id":"a_dipalmaluisjose","n":"Luis José Di Palma","s":"PALMA","num":"86","c":"PER","a":49,"p":"DEFENSIVE","st":[0.86,0.83,0.83,0.87,0.86,0.73,0.88,0.86],"ph":"assets/players/racing/a_dipalmaluisjose.webp","k":"actc"},{"id":"a_cotignolanicolas","n":"Nicolás Cotignola","s":"COTIGNOLA","num":"77","c":"VAL","a":33,"p":"QUALIFYING SPECIALIST","st":[0.84,0.85,0.8,0.89,0.82,0.74,0.78,0.77],"ph":"assets/players/racing/a_cotignolanicolas.webp","k":"actc"},{"id":"a_ferrantegaston","n":"Gaston Ferrante","s":"FERRANTE","num":"69","c":"VAL","a":34,"p":"RISK TAKER","st":[0.79,0.81,0.73,0.78,0.79,0.82,0.71,0.81],"ph":"assets/players/racing/a_ferrantegaston.webp","k":"actc"},{"id":"g_tomkalender","n":"Tom Kalender","s":"KALENDER","num":"46","c":"TAM","a":33,"p":"TYRE SAVER","st":[0.74,0.84,0.81,0.8,0.8,0.74,0.86,0.81],"ph":"assets/players/racing/g_tomkalender.webp","k":"gt"},{"id":"a_castellanojonatan","n":"Jonatan Castellano","s":"CASTELLANO","num":"37","c":"VAL","a":42,"p":"QUALIFYING SPECIALIST","st":[0.82,0.84,0.8,0.83,0.8,0.79,0.8,0.79],"ph":"assets/players/racing/a_castellanojonatan.webp","k":"actc"},{"id":"g_nickithiim","n":"Nicki Thiim","s":"THIIM","num":"13","c":"TAM","a":22,"p":"CONSISTENT","st":[0.77,0.75,0.8,0.77,0.77,0.74,0.83,0.73],"ph":"assets/players/racing/g_nickithiim.webp","k":"gt"},{"id":"a_agrelomarcelo","n":"Marcelo Agrelo","s":"AGRELO","num":"59","c":"VAL","a":34,"p":"AGGRESSIVE","st":[0.79,0.8,0.76,0.76,0.79,0.83,0.69,0.82],"ph":"assets/players/racing/a_agrelomarcelo.webp","k":"actc"},{"id":"a_candelakevin","n":"Kevin Candela","s":"CANDELA","num":"19","c":"PER","a":27,"p":"AGGRESSIVE","st":[0.78,0.81,0.77,0.82,0.76,0.87,0.76,0.9],"ph":"assets/players/racing/a_candelakevin.webp","k":"actc"},{"id":"a_carinelliaugusto","n":"Augusto Carinelli","s":"CARINELLI","num":"60","c":"PER","a":34,"p":"TYRE SAVER","st":[0.8,0.8,0.85,0.82,0.82,0.79,0.9,0.79],"ph":"assets/players/racing/a_carinelliaugusto.webp","k":"actc"},{"id":"g_timtramnitz","n":"Tim Tramnitz","s":"TRAMNITZ","num":"82","c":"MRG","a":22,"p":"QUALIFYING SPECIALIST","st":[0.86,0.86,0.86,0.82,0.84,0.77,0.82,0.81],"ph":"assets/players/racing/g_timtramnitz.webp","k":"gt"},{"id":"a_fainignacio","n":"Ignacio Fain","s":"FAIN","num":"33","c":"PER","a":25,"p":"CONSISTENT","st":[0.78,0.76,0.75,0.79,0.74,0.72,0.84,0.69],"ph":"assets/players/racing/a_fainignacio.webp","k":"actc"},{"id":"a_lugonrodrigo","n":"Rodrigo Lugon","s":"LUGON","num":"21","c":"PER","a":34,"p":"CONSISTENT","st":[0.81,0.78,0.78,0.79,0.76,0.77,0.77,0.79],"ph":"assets/players/racing/a_lugonrodrigo.webp","k":"actc"},{"id":"g_alexaka","n":"Alex Aka","s":"AKA","num":"34","c":"MRG","a":26,"p":"TYRE SAVER","st":[0.7,0.67,0.75,0.8,0.8,0.7,0.82,0.76],"ph":"assets/players/racing/g_alexaka.webp","k":"gt"},{"id":"g_roccomazzola","n":"Rocco Mazzola","s":"MAZZOLA","num":"79","c":"MEL","a":21,"p":"TYRE SAVER","st":[0.79,0.79,0.85,0.79,0.82,0.73,0.85,0.77],"ph":"assets/players/racing/g_roccomazzola.webp","k":"gt"},{"id":"g_stephanetribaudini","n":"Stephane Tribaudini","s":"TRIBAUDINI","num":"10","c":"IBE","a":43,"p":"RISK TAKER","st":[0.77,0.76,0.77,0.79,0.78,0.78,0.7,0.79],"ph":"assets/players/racing/g_stephanetribaudini.webp","k":"gt"},{"id":"a_catalanmagnijuantomas","n":"Juan Tomás Catalán Magni","s":"MAGNI","num":"58","c":"PER","a":36,"p":"AGGRESSIVE","st":[0.79,0.79,0.77,0.79,0.79,0.82,0.76,0.9],"ph":"assets/players/racing/a_catalanmagnijuantomas.webp","k":"actc"},{"id":"g_pierrelouischovet","n":"Pierre Louis Chovet","s":"CHOVET","num":"28","c":"TAM","a":26,"p":"CONSISTENT","st":[0.83,0.83,0.85,0.83,0.86,0.82,0.89,0.81],"ph":"assets/players/racing/g_pierrelouischovet.webp","k":"gt"},{"id":"g_robertdehaan","n":"Robert De Haan","s":"HAAN","num":"88","c":"MEL","a":24,"p":"RISK TAKER","st":[0.75,0.74,0.72,0.76,0.66,0.76,0.66,0.73],"ph":"assets/players/racing/g_robertdehaan.webp","k":"gt"},{"id":"a_craparoelio","n":"Elio Craparo","s":"CRAPARO","num":"94","c":"PER","a":37,"p":"CONSISTENT","st":[0.84,0.83,0.8,0.81,0.84,0.81,0.87,0.75],"ph":"assets/players/racing/a_craparoelio.webp","k":"actc"},{"id":"a_truccojuanmartin","n":"Martín Trucco Juan","s":"M. JUAN","num":"39","c":"PER","a":34,"p":"RISK TAKER","st":[0.8,0.82,0.76,0.8,0.71,0.82,0.74,0.8],"ph":"assets/players/racing/a_truccojuanmartin.webp","k":"actc"},{"id":"g_joelsturm","n":"Joel Sturm","s":"STURM","num":"71","c":"MRG","a":25,"p":"TYRE SAVER","st":[0.79,0.78,0.81,0.82,0.82,0.74,0.85,0.79],"ph":"assets/players/racing/g_joelsturm.webp","k":"gt"},{"id":"g_simonbirch","n":"Simon Birch","s":"BIRCH","num":"31","c":"OVM","a":19,"p":"QUALIFYING SPECIALIST","st":[0.81,0.75,0.79,0.78,0.8,0.79,0.75,0.77],"ph":"assets/players/racing/g_simonbirch.webp","k":"gt"},{"id":"a_trossetnicolas","n":"Nicolás Trosset","s":"TROSSET","num":"63","c":"PER","a":36,"p":"WET SPECIALIST","st":[0.79,0.81,0.87,0.88,0.84,0.82,0.87,0.83],"ph":"assets/players/racing/a_trossetnicolas.webp","k":"actc"},{"id":"g_mattcampbell","n":"Matt Campbell","s":"CAMPBELL","num":"89","c":"MEL","a":38,"p":"DEFENSIVE","st":[0.68,0.74,0.78,0.79,0.76,0.66,0.78,0.72],"ph":"assets/players/racing/g_mattcampbell.webp","k":"gt"},{"id":"g_bendoerr","n":"Ben Doerr","s":"B. DOERR","num":"15","c":"MRG","a":21,"p":"QUALIFYING SPECIALIST","st":[0.8,0.83,0.81,0.76,0.77,0.77,0.73,0.78],"ph":"assets/players/racing/g_bendoerr.webp","k":"gt"},{"id":"g_kylemarcelli","n":"Kyle Marcelli","s":"MARCELLI","num":"32","c":"KAI","a":36,"p":"AGGRESSIVE","st":[0.81,0.79,0.75,0.79,0.78,0.85,0.78,0.84],"ph":"assets/players/racing/g_kylemarcelli.webp","k":"gt"},{"id":"a_canapinomatias","n":"Matías Canapino","s":"M. CANAPINO","num":"75","c":"VAL","a":30,"p":"DEFENSIVE","st":[0.81,0.75,0.85,0.79,0.79,0.71,0.84,0.78],"ph":"assets/players/racing/a_canapinomatias.webp","k":"actc"},{"id":"g_ayhancanguven","n":"Ayhancan Guven","s":"GUVEN","num":"84","c":"NET","a":28,"p":"TYRE SAVER","st":[0.72,0.74,0.78,0.78,0.8,0.71,0.82,0.73],"ph":"assets/players/racing/g_ayhancanguven.webp","k":"gt"},{"id":"g_felixhirsiger","n":"Felix Hirsiger","s":"HIRSIGER","num":"50","c":"MRG","a":28,"p":"AGGRESSIVE","st":[0.76,0.78,0.75,0.81,0.73,0.87,0.72,0.82],"ph":"assets/players/racing/g_felixhirsiger.webp","k":"gt"},{"id":"g_axciljefferies","n":"Axcil Jefferies","s":"JEFFERIES","num":"44","c":"MRG","a":42,"p":"QUALIFYING SPECIALIST","st":[0.82,0.78,0.75,0.82,0.82,0.78,0.74,0.74],"ph":"assets/players/racing/g_axciljefferies.webp","k":"gt"},{"id":"a_gianinijuanpablo","n":"Pablo Gianini Juan","s":"P. JUAN","num":"38","c":"VAL","a":34,"p":"CONSISTENT","st":[0.76,0.79,0.79,0.8,0.77,0.71,0.83,0.79],"ph":"assets/players/racing/a_gianinijuanpablo.webp","k":"actc"},{"id":"g_javiersagrera","n":"Javier Sagrera","s":"SAGRERA","num":"100","c":"GRA","a":22,"p":"DEFENSIVE","st":[0.76,0.78,0.79,0.79,0.76,0.75,0.84,0.75],"ph":"assets/players/racing/g_javiersagrera.webp","k":"gt"},{"id":"g_christopherhaase","n":"Christopher Haase","s":"HAASE","num":"27","c":"MRG","a":39,"p":"TYRE SAVER","st":[0.65,0.73,0.77,0.77,0.71,0.71,0.71,0.71],"ph":"assets/players/racing/g_christopherhaase.webp","k":"gt"}]};
  
  'use strict';
  // ==========================================================================
  // APEX GT3 MANAGER — data model, economy, championship, save system.
  // Pure data + logic; no DOM, no THREE. Consumed by game-ui.js and engine.js.
  // ==========================================================================
  const clamp01 = (v,min=0,max=1) => Math.max(min,Math.min(max,v));
  // Shared by game-ui.js and engine.js (classic scripts share one global scope).
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mod = (n, m) => ((n % m) + m) % m;
  const $ = id => document.getElementById(id);
  
  const RARITY_INFO = {
    COMMON:{color:'#9aa08d',mult:1,dupToLevel:2,maxLevel:5},
    UNCOMMON:{color:'#5f9bd6',mult:1.15,dupToLevel:3,maxLevel:7},
    RARE:{color:'#a86bd1',mult:1.35,dupToLevel:4,maxLevel:9},
    EPIC:{color:'#d7a23a',mult:1.6,dupToLevel:5,maxLevel:11},
    LEGENDARY:{color:'#e0562f',mult:2,dupToLevel:6,maxLevel:13}
  };
  const RARITY_ORDER = ['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'];
  const PART_TYPES = ['engine','gearbox','aero','suspension','brakes','electronics','cooling','tyres'];
  const PART_LABELS = {engine:'ENGINE',gearbox:'GEARBOX',aero:'AERO',suspension:'SUSPENSION',brakes:'BRAKES',electronics:'ELECTRONICS',cooling:'COOLING',tyres:'TYRES'};
  // Weighted contribution of each part type to the five car-facing performance axes.
  const PART_AXES = {
    engine:{top:.55,accel:.35,control:.05,corner:0,brake:0},
    gearbox:{accel:.5,top:.15,control:.1,corner:0,brake:0},
    aero:{corner:.5,control:.25,top:-.1,accel:0,brake:0},
    suspension:{corner:.35,control:.4,brake:.05,top:0,accel:0},
    brakes:{brake:.55,control:.1,top:0,accel:0,corner:0},
    electronics:{control:.45,accel:.1,top:0,brake:0,corner:0},
    cooling:{top:.08,control:.08,accel:.05,brake:0,corner:0},
    tyres:{corner:.2,brake:.15,top:0,accel:0,control:0}
  };
  const AXIS_LABELS = { top:'Top speed', accel:'Aceleración', brake:'Frenada', corner:'Curva', control:'Control' };
  const BODIES = {
    classic:{name:'Camaro ZL1 TC',edition:'V8 AMERICANO · TURISMO CARRETERA',axes:{top:.05,accel:.05,brake:.05,corner:.05,control:.1},desc:'Frente ancho, capó musculoso y techo de coupé. Potencia equilibrada.'},
    touring:{name:'Alfa Romeo Giulia',edition:'BERLINA · TURISMO',axes:{brake:.1,control:.12,corner:.05},desc:'Silueta de cuatro puertas, escudo triangular y precisión de frenada.'},
    sprint:{name:'Mustang GT3',edition:'V8 · GT3',axes:{top:.22,accel:.2,corner:-.06},desc:'Fastback, capó largo y tres luces traseras por lado. Explosivo en recta.'},
    endurance:{name:'BMW M4 GT3',edition:'SEIS CILINDROS · GT3',axes:{control:.1,corner:.04,top:-.05},desc:'Doble riñón vertical, techo alto y pasos ensanchados. Consistencia.'},
    aero:{name:'Mercedes-AMG GT3',edition:'V8 · GT3',axes:{corner:.26,top:-.15},desc:'Capó extralargo, cabina retrasada y parrilla de lamas verticales.'},
    track:{name:'Audi R8 LMS',edition:'V10 CENTRAL · GT3',axes:{corner:.16,brake:.1,top:-.06},desc:'Cabina adelantada, sideblades y parrilla hexagonal. Especialista técnico.'},
    spectre:{name:'Ferrari 296 GT3',edition:'V6 CENTRAL · GT3',color:'#ed3049',axes:{top:.19,accel:.12,corner:.06,brake:-.08},desc:'Morro bajo, tomas laterales profundas y contrafuertes traseros.'},
    raijin:{name:'Nissan GT-R GT3',edition:'V6 BITURBO · GT3',color:'#29b9e5',axes:{accel:.19,control:.13,top:-.06,corner:.03},desc:'Coupé de techo alto, hombros cuadrados y cuatro pilotos circulares.'},
    mistral:{name:'Aston Martin Vantage',edition:'V8 · GT3',color:'#f9bc40',axes:{top:.16,control:.15,accel:-.07,brake:.04},desc:'Gran parrilla baja, capó curvado y cola compacta. Gran turismo.'},
    valkyr:{name:'Porsche 911 GT3 R',edition:'BÓXER TRASERO · GT3',color:'#a1e648',axes:{corner:.17,brake:.14,top:-.08,control:.04},desc:'Faros redondos, techo arqueado continuo y alerón de cuello de cisne.'},
    corsair:{name:'Corvette Z06 GT3.R',edition:'V8 CENTRAL · GT3',color:'#a78bfa',axes:{accel:.20,top:.15,corner:-.08,control:-.03},desc:'Morro en cuña, cabina adelantada y grandes entradas laterales.'}
  };
  const PACKS = {
    bronze:{name:'BRONZE PACK',icon:'📦',cost:5000,cards:3,odds:{COMMON:.65,UNCOMMON:.25,RARE:.08,EPIC:.02,LEGENDARY:0}},
    silver:{name:'SILVER PACK',icon:'🎁',cost:15000,cards:3,odds:{COMMON:.4,UNCOMMON:.35,RARE:.18,EPIC:.06,LEGENDARY:.01}},
    gold:{name:'GOLD PACK',icon:'🏆',cost:35000,cards:4,odds:{COMMON:.15,UNCOMMON:.35,RARE:.32,EPIC:.15,LEGENDARY:.03}},
    legend:{name:'LEGEND PACK',icon:'👑',cost:80000,cards:5,odds:{COMMON:0,UNCOMMON:.15,RARE:.4,EPIC:.35,LEGENDARY:.1}}
  };
  const TRACKS = [
    {id:'valleverde',name:'VALLE VERDE',country:'San Esteban, Argentina',lengthKm:1.82,corners:12,gripMod:1,brakingMod:1,aeroMod:1,wetChance:.15,tempBase:24,overtakeDiff:.5,desc:'Alta velocidad, equilibrado.'},
    {id:'autodromocentral',name:'AUTÓDROMO CENTRAL',country:'Córdoba, Argentina',lengthKm:1.82,corners:12,gripMod:.95,brakingMod:1.25,aeroMod:.9,wetChance:.2,tempBase:22,overtakeDiff:.4,desc:'Frenadas exigentes.',layout:[[-220,135], [-80,135], [100,135], [250,135], [290,90], [290,20], [240,-20], [240,-90], [200,-130], [120,-130], [90,-80], [20,-80], [-20,-130], [-110,-150], [-200,-130], [-260,-70], [-270,20], [-250,100]]},
    {id:'costasur',name:'COSTA SUR',country:'Punta del Este, Uruguay',lengthKm:1.82,corners:12,gripMod:1.05,brakingMod:.95,aeroMod:1.15,wetChance:.35,tempBase:26,overtakeDiff:.65,desc:'Técnico y cambiante.',layout:[[-220,135], [-80,135], [100,135], [240,110], [300,50], [280,-10], [200,-30], [160,-90], [200,-150], [120,-190], [20,-170], [-50,-110], [-130,-130], [-220,-100], [-290,-30], [-300,60]]},
    {id:'montrealpl',name:'MONTRÉAL PARK',country:'Quebec, Canadá',lengthKm:1.82,corners:12,gripMod:1.1,brakingMod:1.1,aeroMod:.85,wetChance:.3,tempBase:18,overtakeDiff:.35,desc:'Alta velocidad pura.',layout:[[-220,135], [-40,135], [180,135], [380,135], [450,90], [440,20], [360,-30], [240,-40], [130,-10], [20,-40], [-100,-50], [-210,-30], [-290,10], [-300,80]]},
    {id:'sierragp',name:'SIERRA GP',country:'Santiago, Chile',lengthKm:1.82,corners:12,gripMod:.92,brakingMod:1.05,aeroMod:1.05,wetChance:.25,tempBase:20,overtakeDiff:.55,desc:'Desnivel y técnica.',layout:[[-220,135], [-80,135], [100,135], [220,105], [250,40], [190,0], [240,-50], [300,-100], [240,-160], [140,-140], [110,-80], [40,-50], [-40,-90], [-70,-160], [-170,-170], [-240,-110], [-200,-40], [-270,20], [-290,90]]},
    {id:'pampacircuit',name:'PAMPA CIRCUIT',country:'La Pampa, Argentina',lengthKm:1.82,corners:12,gripMod:1,brakingMod:1,aeroMod:1,wetChance:.1,tempBase:28,overtakeDiff:.45,desc:'Rápido y abierto.',layout:[[-220,135], [-40,135], [200,135], [400,120], [470,60], [470,-60], [400,-130], [200,-150], [0,-150], [-200,-150], [-320,-100], [-350,-10], [-330,80]]},
    {id:'litoralring',name:'LITORAL RING',country:'Rosario, Argentina',lengthKm:1.82,corners:12,gripMod:.98,brakingMod:.9,aeroMod:1.1,wetChance:.4,tempBase:23,overtakeDiff:.6,desc:'Húmedo con frecuencia.',layout:[[-220,135], [-80,135], [100,135], [230,120], [290,60], [300,-30], [240,-90], [150,-90], [100,-40], [30,-30], [-30,-80], [-20,-150], [-100,-190], [-200,-160], [-260,-90], [-250,-10], [-290,60]]},
    {id:'nortespeed',name:'NORTE SPEEDWAY',country:'São Paulo, Brasil',lengthKm:1.82,corners:12,gripMod:1.08,brakingMod:1,aeroMod:.9,wetChance:.2,tempBase:30,overtakeDiff:.3,desc:'Velocidad pura.',layout:[[-220,135], [0,135], [220,135], [400,110], [460,40], [460,-40], [400,-110], [220,-135], [0,-135], [-220,-135], [-390,-110], [-450,-40], [-450,40], [-390,110]]},
    {"id": "desiertoring", "name": "DESIERTO RING", "country": "San Juan, Argentina", "lengthKm": 2, "corners": 12, "gripMod": 0.94, "brakingMod": 1.18, "aeroMod": 0.9, "wetChance": 0.04, "tempBase": 34, "overtakeDiff": 0.32, "theme": "desert", "layout": [[-220, 135], [-80, 135], [100, 135], [300, 125], [345, 45], [310, -90], [175, -145], [60, -135], [15, -65], [-75, -70], [-125, -155], [-290, -145], [-340, -40], [-300, 75]], "desc": "Rectas largas y horquillas sobre arena."},
    {"id": "patagoniapark", "name": "PATAGONIA PARK", "country": "Neuquén, Argentina", "lengthKm": 2, "corners": 13, "gripMod": 0.96, "brakingMod": 1.08, "aeroMod": 1.17, "wetChance": 0.18, "tempBase": 14, "overtakeDiff": 0.58, "theme": "mountain", "layout": [[-220, 135], [-80, 135], [100, 135], [245, 100], [280, 5], [230, -65], [140, -20], [60, -65], [85, -170], [-10, -205], [-110, -145], [-145, -45], [-260, -100], [-315, -25], [-290, 80]], "desc": "Curvas enlazadas y aire frío de montaña."},
    {"id": "atlanticospeed", "name": "ATLÁNTICO SPEED", "country": "Mar del Plata, Argentina", "lengthKm": 2, "corners": 10, "gripMod": 1.03, "brakingMod": 0.95, "aeroMod": 0.92, "wetChance": 0.32, "tempBase": 21, "overtakeDiff": 0.28, "theme": "coast", "layout": [[-220, 135], [-80, 135], [100, 135], [300, 130], [380, 65], [355, -35], [240, -95], [65, -115], [-130, -115], [-290, -65], [-340, 30], [-295, 110]], "desc": "Arcos rápidos junto a la costa."},
    {"id": "selvaverde", "name": "SELVA VERDE", "country": "Misiones, Argentina", "lengthKm": 2, "corners": 12, "gripMod": 1.08, "brakingMod": 1.12, "aeroMod": 1.2, "wetChance": 0.52, "tempBase": 29, "overtakeDiff": 0.67, "theme": "forest", "layout": [[-220, 135], [-80, 135], [100, 135], [235, 100], [265, 15], [180, -25], [225, -120], [135, -170], [45, -100], [-40, -155], [-130, -90], [-230, -155], [-310, -65], [-285, 55]], "desc": "Técnico, húmedo y rodeado de selva."},
    {"id": "puertourbano", "name": "PUERTO URBANO", "country": "Montevideo, Uruguay", "lengthKm": 2, "corners": 12, "gripMod": 0.93, "brakingMod": 1.28, "aeroMod": 0.94, "wetChance": 0.3, "tempBase": 23, "overtakeDiff": 0.72, "theme": "city", "layout": [[-220, 135], [-80, 135], [100, 135], [250, 130], [280, 75], [280, -75], [230, -120], [120, -120], [85, -65], [-15, -65], [-40, -165], [-235, -165], [-285, -105], [-285, 55]], "desc": "Calles estrechas y frenadas de noventa grados."},
    {"id": "lagunaazul", "name": "LAGUNA AZUL", "country": "Bariloche, Argentina", "lengthKm": 2, "corners": 13, "gripMod": 1.04, "brakingMod": 1.1, "aeroMod": 1.1, "wetChance": 0.38, "tempBase": 16, "overtakeDiff": 0.52, "theme": "coast", "layout": [[-220, 135], [-80, 135], [100, 135], [265, 85], [290, -15], [235, -140], [125, -180], [30, -120], [-15, -25], [-100, 15], [-165, -40], [-220, -150], [-300, -135], [-340, -35], [-285, 70]], "desc": "Una gran curva bordeando el lago."},
    {"id": "andesendurance", "name": "ANDES ENDURANCE", "country": "Mendoza, Argentina", "lengthKm": 2, "corners": 14, "gripMod": 0.95, "brakingMod": 1.2, "aeroMod": 1.05, "wetChance": 0.12, "tempBase": 19, "overtakeDiff": 0.43, "theme": "mountain", "layout": [[-220, 135], [-80, 135], [100, 135], [320, 135], [415, 70], [425, -60], [340, -145], [215, -160], [160, -80], [80, -40], [0, -115], [-100, -210], [-275, -210], [-375, -120], [-390, 5], [-310, 100]], "desc": "El trazado más largo; exige resistencia y frenos."},
    {"id": "pampavelocity", "name": "PAMPA VELOCITY", "country": "Santa Rosa, Argentina", "lengthKm": 2, "corners": 11, "gripMod": 1.02, "brakingMod": 0.92, "aeroMod": 0.86, "wetChance": 0.09, "tempBase": 31, "overtakeDiff": 0.25, "theme": "grass", "layout": [[-220, 135], [-80, 135], [100, 135], [360, 125], [420, 30], [380, -75], [215, -115], [70, -95], [-55, -155], [-255, -145], [-350, -75], [-360, 35], [-300, 110]], "desc": "Acelerador a fondo y amplias zonas de adelantamiento."},
    {"id": "santacruz", "name": "SANTA CRUZ GP", "country": "Santa Cruz, Bolivia", "lengthKm": 2, "corners": 15, "gripMod": 1.1, "brakingMod": 1.16, "aeroMod": 1.19, "wetChance": 0.44, "tempBase": 28, "overtakeDiff": 0.6, "theme": "forest", "layout": [[-220, 135], [-80, 135], [100, 135], [245, 110], [270, 25], [185, -45], [80, -20], [30, -90], [100, -155], [25, -225], [-85, -200], [-120, -90], [-215, -30], [-275, -115], [-340, -65], [-330, 35], [-280, 100]], "desc": "Doble sector técnico y curvas de radio cambiante."},
    {"id": "nocturnaring", "name": "NOCTURNA RING", "country": "Buenos Aires, Argentina", "lengthKm": 2, "corners": 13, "gripMod": 1.01, "brakingMod": 1.16, "aeroMod": 1.08, "wetChance": 0.22, "tempBase": 20, "overtakeDiff": 0.48, "theme": "night", "layout": [[-220, 135], [-80, 135], [100, 135], [265, 120], [330, 55], [305, -35], [210, -75], [135, -165], [25, -185], [-25, -100], [-120, -70], [-185, -155], [-290, -115], [-335, -25], [-290, 80]], "desc": "Luces de ciudad y una chicana decisiva."},
    {"id": "calderaring", "name": "CALDERA RING", "country": "Isla Caldera, Tamago", "lengthKm": 2, "corners": 15, "gripMod": 0.97, "brakingMod": 1.14, "aeroMod": 1.02, "wetChance": 0.2, "tempBase": 27, "overtakeDiff": 0.62, "theme": "mountain", "layout": [[-220,135], [-80,135], [100,135], [260,120], [330,50], [300,-40], [200,-70], [130,-140], [40,-190], [-60,-150], [-90,-70], [-170,-30], [-260,-70], [-330,10], [-300,100]]},
    {"id": "centenario", "name": "AUTÓDROMO DEL CENTENARIO", "country": "Buenaventura, Peronia", "lengthKm": 2, "corners": 14, "gripMod": 1.03, "brakingMod": 1.05, "aeroMod": 1.0, "wetChance": 0.18, "tempBase": 22, "overtakeDiff": 0.5, "theme": "grass", "layout": [[-220,135], [-80,135], [100,135], [280,140], [390,100], [430,20], [400,-60], [310,-100], [220,-70], [160,-110], [100,-170], [0,-180], [-90,-140], [-130,-70], [-210,-90], [-290,-80], [-340,-10], [-320,80]]}
  
  ];
  // Layout IDs remain stable so existing careers and installed bodywork survive updates.
  const DEFAULT_LAYOUT = [[-220, 135], [-80, 135], [100, 135], [245, 120], [290, 35], [250, -65], [135, -103], [88, -25], [18, -18], [-9, -119], [-106, -150], [-230, -109], [-290, -15], [-270, 95]];
  function layoutForTrack(def){ return def.layout || DEFAULT_LAYOUT; }
  function migrateCareer(career){
    if ((career.version || 2) < 3) {
      const existing = new Set(career.calendar.map(r => r.trackId));
      TRACKS.slice(8).forEach(t => {
        if (!existing.has(t.id)) career.calendar.push({round:career.calendar.length+1,trackId:t.id,completed:false,result:null,gridPenalty:false});
      });
      career.teams.forEach((team,i) => {
        if (!team.isPlayer) team.bodyType = Object.keys(BODIES)[i % Object.keys(BODIES).length];
      });
      career.version = 3;
    }
    if ((career.version || 2) < 4) {
      // temporada de 20 fechas: se suman los circuitos que faltan al calendario de las carreras guardadas
      const existing = new Set(career.calendar.map(r => r.trackId));
      TRACKS.forEach(t => {
        if (!existing.has(t.id)) career.calendar.push({round:career.calendar.length+1,trackId:t.id,completed:false,result:null,gridPenalty:false});
      });
      career.calendar.forEach((r,i) => { r.round = i + 1; });
      // nacionalidades: códigos reales -> naciones del mundo ficticio
      const NAT = {ARG:null, BOL:'SOT', BRA:'TAM', CHI:'CUN', PAR:'MOR', URU:'VAL', VEN:'MAG'};
      (career.driversPool || []).forEach(d => { if (d.nationality in NAT) d.nationality = NAT[d.nationality] || (d.id % 3 ? 'PER' : 'VAL'); });
      career.version = 4;
    }
    if ((career.version || 2) < 5) {
      // escuderías nuevas (nombres, colores y logos) y carrocerías bloqueadas: sólo queda la que ya usaba cada equipo
      career.teams.forEach((t,i) => { const d = TEAM_DEFS[i]; if (d) { t.name = d.name; t.color = d.color; t.logo = d.logo; t.profile = t.isPlayer ? t.profile : d.profile; } });
      const pt = career.teams[0]; pt.ownedBodies = [pt.bodyType];
      career.version = 5;
    }
    return career;
  }
  const WEATHER_STATES = {
    CLEAR:{grip:1,label:'DESPEJADO',icon:'☀'},
    CLOUDY:{grip:.97,label:'NUBLADO',icon:'☁'},
    LIGHT_RAIN:{grip:.82,label:'LLOVIZNA',icon:'🌦'},
    RAIN:{grip:.68,label:'LLUVIA',icon:'🌧'},
    HEAVY_RAIN:{grip:.52,label:'LLUVIA FUERTE',icon:'⛈'},
    DRYING:{grip:.85,label:'SECANDO',icon:'🌤'}
  };
  const SPONSOR_POOL = [
    {id:'surmotor',name:'SUR MOTOR OIL',base:100000,bonus:{type:'podium',amount:50000,label:'+$50.000 por podio'},duration:4,reputationReq:0},
    {id:'vertice',name:'VÉRTICE',base:60000,bonus:{type:'championship',amount:150000,label:'+$150.000 si gana el campeonato'},duration:6,reputationReq:15},
    {id:'pampaholdings',name:'PAMPA HOLDINGS',base:250000,bonus:{type:'top5',amount:15000,label:'+$15.000 por top 5'},duration:4,reputationReq:40},
    {id:'costabank',name:'COSTA ATLÁNTICA BANK',base:80000,bonus:{type:'win',amount:100000,label:'+$100.000 por victoria'},duration:5,reputationReq:10},
    {id:'litoraltech',name:'LITORAL TECH',base:120000,bonus:{type:'pole',amount:30000,label:'+$30.000 por pole'},duration:4,reputationReq:20},
    {id:'aguilaneumaticos',name:'ÁGUILA NEUMÁTICOS',base:70000,bonus:{type:'fastestlap',amount:20000,label:'+$20.000 por vuelta rápida'},duration:5,reputationReq:5}
  ];
  const TEAM_PROFILES = ['FACTORY','BALANCED','BUDGET','AGGRESSIVE','DEVELOPMENT','TYRE SPECIALIST'];
  const PERSONALITIES = ['AGGRESSIVE','DEFENSIVE','TYRE SAVER','QUALIFYING SPECIALIST','WET SPECIALIST','CONSISTENT','RISK TAKER'];
  const DEFAULT_REGULATIONS = { mandatoryPit:true, pointsSystem:[25,18,15,12,10,8,6,4,2,1], componentLimit:3, qualifyingFormat:'ONE_SHOT' };
  
  // ---- Base driver roster (10 veteran cards, one per founding team) ---------
  const DRIVERS_BASE = [
    { name:'Mateo Martín', short:'MARTÍN', number:'07', color:0xd96a32, accent:'#f4dbad', nationality:'PER', age:29, personality:'CONSISTENT', stats:[.90,.88,.86,.89,.90,.77,.91,.87] },
    { name:'Gabriel Silva', short:'SILVA', number:'22', color:0x347f92, accent:'#eee6c9', nationality:'TAM', age:31, personality:'QUALIFYING SPECIALIST', stats:[.94,.85,.85,.82,.88,.88,.83,.91] },
    { name:'Nicolás Ferraro', short:'FERRARO', number:'16', color:0xbac89c, accent:'#283a2d', nationality:'PER', age:24, personality:'RISK TAKER', stats:[.86,.88,.91,.95,.92,.72,.89,.85] },
    { name:'Lucas Kowalski', short:'KOWALSKI', number:'83', color:0xd9b752, accent:'#302b26', nationality:'VAL', age:33, personality:'AGGRESSIVE', stats:[.92,.91,.84,.84,.85,.92,.77,.89] },
    { name:'Bruno Rossi', short:'ROSSI', number:'11', color:0xa74438, accent:'#f1e6c8', nationality:'VAL', age:27, personality:'CONSISTENT', stats:[.88,.90,.89,.91,.91,.82,.88,.86] },
    { name:'Tomás Acosta', short:'ACOSTA', number:'32', color:0xe1ded0, accent:'#bd493c', nationality:'PER', age:36, personality:'TYRE SAVER', stats:[.91,.86,.90,.86,.88,.81,.90,.86] },
    { name:'Diego Méndez', short:'MÉNDEZ', number:'54', color:0x343e52, accent:'#dfbf65', nationality:'CUN', age:26, personality:'AGGRESSIVE', stats:[.95,.91,.82,.83,.84,.90,.79,.91] },
    { name:'Santiago Vega', short:'VEGA', number:'99', color:0x589580, accent:'#f1deaf', nationality:'PER', age:22, personality:'WET SPECIALIST', stats:[.86,.88,.93,.93,.94,.74,.94,.83] },
    { name:'Agustín Ríos', short:'RÍOS', number:'41', color:0xb688a1, accent:'#f0ded0', nationality:'MOR', age:30, personality:'DEFENSIVE', stats:[.90,.92,.85,.89,.86,.87,.82,.88] },
    { name:'Valentín Costa', short:'COSTA', number:'65', color:0x73a9b2, accent:'#213c40', nationality:'VAL', age:28, personality:'CONSISTENT', stats:[.92,.90,.90,.90,.89,.85,.86,.92] }
  ];
  // ---- Bench/second driver per team, plus free-agent pool for the market ----
  const DRIVERS_EXTRA = [
    { name:'Franco Aguirre', short:'AGUIRRE', number:'71', color:0xd96a32, accent:'#f4dbad', nationality:'PER', age:20, personality:'RISK TAKER', stats:[.80,.82,.78,.80,.75,.83,.68,.79] },
    { name:'Pedro Almeida', short:'ALMEIDA', number:'23', color:0x347f92, accent:'#eee6c9', nationality:'TAM', age:34, personality:'WET SPECIALIST', stats:[.83,.80,.85,.86,.84,.70,.87,.78] },
    { name:'Ezequiel Paz', short:'PAZ', number:'17', color:0xbac89c, accent:'#283a2d', nationality:'PER', age:23, personality:'CONSISTENT', stats:[.81,.83,.82,.84,.83,.66,.85,.76] },
    { name:'Rodrigo Sosa', short:'SOSA', number:'84', color:0xd9b752, accent:'#302b26', nationality:'VAL', age:38, personality:'DEFENSIVE', stats:[.79,.85,.80,.78,.79,.75,.83,.77] },
    { name:'Iván Duarte', short:'DUARTE', number:'12', color:0xa74438, accent:'#f1e6c8', nationality:'VAL', age:25, personality:'AGGRESSIVE', stats:[.84,.84,.83,.85,.82,.86,.75,.82] },
    { name:'Cristian Bou', short:'BOU', number:'33', color:0xe1ded0, accent:'#bd493c', nationality:'PER', age:31, personality:'TYRE SAVER', stats:[.82,.81,.86,.81,.83,.72,.88,.80] },
    { name:'Martín Ovalle', short:'OVALLE', number:'55', color:0x343e52, accent:'#dfbf65', nationality:'CUN', age:21, personality:'QUALIFYING SPECIALIST', stats:[.87,.85,.77,.79,.78,.79,.71,.85] },
    { name:'Facundo Ledesma', short:'LEDESMA', number:'98', color:0x589580, accent:'#f1deaf', nationality:'PER', age:35, personality:'CONSISTENT', stats:[.80,.83,.87,.85,.86,.68,.90,.77] },
    { name:'Joaquín Bracho', short:'BRACHO', number:'42', color:0xb688a1, accent:'#f0ded0', nationality:'MAG', age:27, personality:'RISK TAKER', stats:[.83,.86,.79,.82,.80,.84,.73,.83] },
    { name:'Emiliano Duval', short:'DUVAL', number:'66', color:0x73a9b2, accent:'#213c40', nationality:'VAL', age:24, personality:'AGGRESSIVE', stats:[.85,.84,.81,.83,.81,.85,.76,.84] },
    { name:'Ramiro Achával', short:'ACHÁVAL', number:'19', color:0xc9a24b, accent:'#2c2416', nationality:'PER', age:19, personality:'RISK TAKER', stats:[.78,.79,.75,.81,.74,.80,.65,.78] },
    { name:'Julián Cabrera', short:'CABRERA', number:'88', color:0x5c8e77, accent:'#eee0c4', nationality:'PER', age:32, personality:'DEFENSIVE', stats:[.81,.83,.84,.82,.85,.71,.86,.79] },
    { name:'Federico Nazar', short:'NAZAR', number:'05', color:0x8b5a44, accent:'#f2e5c9', nationality:'SOT', age:29, personality:'CONSISTENT', stats:[.82,.82,.83,.83,.84,.74,.85,.80] },
    { name:'Simón Lattuca', short:'LATTUCA', number:'77', color:0x3f5a6b, accent:'#e8dcc0', nationality:'VAL', age:37, personality:'TYRE SAVER', stats:[.80,.81,.88,.80,.87,.69,.91,.76] },
    { name:'Bautista Guzmán', short:'GUZMÁN', number:'03', color:0x9c4f3a, accent:'#f0e2c6', nationality:'PER', age:22, personality:'WET SPECIALIST', stats:[.84,.85,.86,.87,.85,.75,.89,.81] },
    { name:'Thiago Roldán', short:'ROLDÁN', number:'44', color:0x4f6d4f, accent:'#e5dcc0', nationality:'PER', age:26, personality:'AGGRESSIVE', stats:[.86,.87,.80,.81,.79,.89,.74,.86] }
  ];
  function makeDriverPool(){
    // Roster fijo (roster-lro.js): pilotos reales del TC y del GT World Challenge Europe. Índices 0-9 = titulares, 10-19 = segundos, resto = mercado.
    const R = (typeof window !== 'undefined') && window.LRO_ROSTER;
    if (R && R.drivers && R.drivers.length >= 20){
      const legacy = DRIVERS_BASE.concat(DRIVERS_EXTRA), palette = [0xd96a32,0x347f92,0xbac89c,0xd9b752,0xa74438,0xe1ded0,0x343e52,0x589580,0xb688a1,0x73a9b2,0x8b5a44,0x4f6d4f];
      return R.drivers.map((r, i) => {
        const rating = Math.round(r.st.reduce((a,b)=>a+b,0)/8*100), lg = legacy[i % legacy.length];
        return { name:r.n, short:r.s, number:r.num, color: i < 20 ? TEAM_DEFS[i % 10].color : palette[i % palette.length], accent: lg.accent, nationality:r.c, age:r.a, personality:r.p, stats:r.st.slice(),
          photo:r.ph, rosterId:r.id, id:i, rating, salary: Math.round((2000 + rating*350) / 100) * 100, marketValue: Math.round((rating*rating*30) / 1000) * 1000, contractRounds:0, teamId:null };
      });
    }
    let id = 0;
    const all = DRIVERS_BASE.concat(DRIVERS_EXTRA).map(d => {
      const rating = Math.round(d.stats.reduce((a,b)=>a+b,0)/8*100);
      return Object.assign({}, d, {
        id: id++,
        rating,
        salary: Math.round((2000 + rating*350) / 100) * 100,
        marketValue: Math.round((rating*rating*30) / 1000) * 1000,
        contractRounds: 0,
        teamId: null
      });
    });
    return all;
  }
  const TEAM_DEFS = [
    {name:'Pegasus Racing',color:0x1560b0,profile:'BALANCED',logo:'pegasusracing.jpg'},
    {name:'Valiant Racing',color:0x3aa6d8,profile:'FACTORY',logo:'valiantracing.jpg'},
    {name:'Deerson Racing Team',color:0x1f6b35,profile:'DEVELOPMENT',logo:'deersonracingteam.jpg'},
    {name:'Trax Super Touring Team',color:0x2ee62e,profile:'BUDGET',logo:'traxsupertouringteam.jpg'},
    {name:'Tyrannos Super Touring Team',color:0xf2c318,profile:'AGGRESSIVE',logo:'tyrannosupertouringteam.jpg'},
    {name:'Orbital RaceCola Racing',color:0x1d3a6e,profile:'TYRE SPECIALIST',logo:'orbitalracecolaracing.jpg'},
    {name:'Glance Performance Racing',color:0xe8782a,profile:'FACTORY',logo:'glanceperformanceracing.jpg'},
    {name:'Hashiru Racing Team',color:0xd42a2a,profile:'BALANCED',logo:'hashiruracingteam.jpg'},
    {name:'Kaiser Racing Team',color:0xd08ad8,profile:'BUDGET',logo:'kaiserracingteam.jpg'},
    {name:'EAG Valant Oil Performance',color:0xc76fd0,profile:'AGGRESSIVE',logo:'eagvalantoilperformanceracing.jpg'}
  ];
  function freshParts(){
    const parts = {};
    PART_TYPES.forEach(t => parts[t] = {rarity:'COMMON', level:1, dupes:0});
    return parts;
  }
  function makeTeam(index, def, isPlayer){
    return {
      id: index,
      name: def.name,
      logo: def.logo,
      color: def.color,
      profile: def.profile,
      isPlayer: !!isPlayer,
      credits: isPlayer ? 450000 : Math.round(150000 + Math.random()*350000),
      materials: isPlayer ? 150 : 0,
      reputation: isPlayer ? 45 : Math.round(30 + Math.random()*45),
      prestige: isPlayer ? 40 : Math.round(30 + Math.random()*45),
      development: 0,
      points: 0, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, dnfs: 0,
      driverIds: [index, 10 + index],
      activeDriverId: index,
      bodyType: Object.keys(BODIES)[index % Object.keys(BODIES).length],
      ownedBodies: isPlayer ? [Object.keys(BODIES)[index % Object.keys(BODIES).length]] : null,
      parts: isPlayer ? freshParts() : null,
      componentUsage: { engine: 0, gearbox: 0 },
      gridPenaltyNext: 0,
      sponsors: [null, null, null]
    };
  }
  function newCareer(){
    const driversPool = makeDriverPool();
    const teams = TEAM_DEFS.map((def,i) => makeTeam(i, def, i === 0));
    teams.forEach(team => team.driverIds.forEach(did => { if (driversPool[did]) driversPool[did].teamId = team.id; }));
    const shuffledTracks = [...TRACKS];
    const calendar = Array.from({length:TRACKS.length}, (_,i) => ({ round:i+1, trackId: shuffledTracks[i % shuffledTracks.length].id, completed:false, result:null, gridPenalty:false }));
    return {
      version: 5,
      season: 1,
      roundIndex: 0,
      teams,
      driversPool,
      calendar,
      regulations: JSON.parse(JSON.stringify(DEFAULT_REGULATIONS)),
      championship: { driverPoints:{}, teamPoints:{}, history:[] },
      fragments: {},
      news: [{title:'TEMPORADA 1 EN MARCHA', detail:'La Serie Nacional GT3 arranca con diez escuderías en pista.', round:1}],
      practice: { score:0, confidence:35, setup:defaultSetup(), lastRoundPracticed:-1 },
      strategy: { compound:'M', stops:1, pace:'standard', aggression:'standard', tyreMgmt:'standard', fuel:'standard' },
      qualifyingDoneRound: -1,
      voteResolved: true
    };
  }
  function defaultSetup(){
    return { downforce:50, suspension:50, gearRatio:50, brakeBias:50, tyrePressure:50, rideHeight:50, differential:50 };
  }
  // Fechas de calendario: la ronda 1 se corre el domingo 8 de marzo del año de la temporada (temporada 1 = 2026) y hay una carrera cada 14 días.
  function raceDate(season, round){ return new Date(Date.UTC(2025 + season, 2, 8 + (Math.max(1, round) - 1) * 14)); }
  function fmtRaceDate(season, round){ return raceDate(season, round).toLocaleDateString('es-ES', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
  function playerTeam(career){ return career.teams[0]; }
  function currentRound(career){ return career.calendar[career.roundIndex]; }
  function currentTrack(career){ const r = currentRound(career); return TRACKS.find(t => t.id === r.trackId) || TRACKS[0]; }
  function activeDriver(career, team){ return career.driversPool.find(d => d.id === team.activeDriverId) || career.driversPool.find(d => d.id === team.driverIds[0]); }
  function teamDrivers(career, team){ return team.driverIds.map(id => career.driversPool.find(d => d.id === id)).filter(Boolean); }
  
  const LIVERY_PATTERNS = {none:'Liso',center:'Franja central',twin:'Doble línea',side:'Cinta lateral',nose:'Trompa bicolor',dual:'Bicolor dividido',chevron:'Chevrones',checker:'Cuadros',diag:'Cortes diagonales'};
  const hexColor = n => '#' + (n >>> 0).toString(16).padStart(6,'0').slice(-6);
  function liveryFor(team){
    const pats = ['center','side','twin','nose','dual','chevron','checker','diag'];
    const base = team.livery || {primary:hexColor(team.color), secondary:'#f2f5f3', accent:'#111820', roof:null, pattern:pats[team.id % pats.length]};
    // anunciantes: los contratos del jugador; los rivales llevan dos anunciantes ficticios fijos
    const sp = team.isPlayer ? (team.sponsors||[]).filter(Boolean).map(x => x.name) : [SPONSOR_POOL[(team.id*2)%SPONSOR_POOL.length].name, SPONSOR_POOL[(team.id*2+1)%SPONSOR_POOL.length].name];
    return Object.assign({}, base, {sponsors: sp});
  }
  function computePlayerCarRating(team){
    const body = BODIES[team.bodyType] || BODIES.classic;
    const axes = { top:.5, accel:.5, brake:.5, corner:.5, control:.5 };
    Object.keys(body.axes).forEach(k => axes[k] += body.axes[k]);
    PART_TYPES.forEach(type => {
      const part = team.parts[type];
      if (!part) return;
      const info = RARITY_INFO[part.rarity];
      const power = (part.level / info.maxLevel) * info.mult * .5;
      const weights = PART_AXES[type];
      Object.keys(weights).forEach(axis => axes[axis] += weights[axis] * power);
    });
    Object.keys(axes).forEach(k => axes[k] = clamp01(axes[k], .25, 1.12));
    return axes;
  }
  function computeAiCarRating(team){
    const base = .55 + (team.prestige/100)*.3 + team.development*.02;
    const v = clamp01(base, .35, 1.05);
    return { top:v, accel:v, brake:v, corner:v, control:v };
  }
  function effectiveStats(driver, team, setupBonus){
    const rating = team.isPlayer ? computePlayerCarRating(team) : computeAiCarRating(team);
    const bonus = setupBonus || 0;
    const blend = (dv, cv) => clamp01(dv*.55 + cv*.45, .32, 1.1);
    return {
      top: blend(driver.stats[0], rating.top),
      accel: blend(driver.stats[1], rating.accel),
      brake: blend(driver.stats[2], rating.brake),
      corner: blend(driver.stats[3], rating.corner + bonus*.15),
      control: blend(driver.stats[4], rating.control + bonus*.1),
      aggression: driver.stats[5],
      consistency: clamp01(driver.stats[6] + bonus*.08, 0, 1),
      overtake: driver.stats[7]
    };
  }
  function partRatingSummary(type, part){
    const info = RARITY_INFO[part.rarity];
    const power = (part.level / info.maxLevel) * info.mult * .5;
    const weights = PART_AXES[type];
    return Object.keys(weights).filter(axis => weights[axis] !== 0).map(axis => ({axis, label: AXIS_LABELS[axis], value: Math.round(weights[axis]*power*100)}));
  }
  
  // ---- Economy ---------------------------------------------------------------
  function canAfford(team, cost){ return team.credits >= cost; }
  function spend(team, cost){ team.credits -= cost; }
  function earn(team, amount){ team.credits += Math.round(amount); }
  
  // ---- Packs -------------------------------------------------------------
  function rollRarity(odds){
    const r = Math.random();
    let acc = 0;
    for (const rarity of RARITY_ORDER){
      acc += odds[rarity] || 0;
      if (r <= acc) return rarity;
    }
    return 'COMMON';
  }
  function openPack(career, packId){
    const pack = PACKS[packId];
    const team = playerTeam(career);
    if (!canAfford(team, pack.cost)) return null;
    spend(team, pack.cost);
    const results = [];
    for (let i=0;i<pack.cards;i++){
      const rarity = rollRarity(pack.odds);
      const type = PART_TYPES[Math.floor(Math.random()*PART_TYPES.length)];
      results.push(applyFragment(career, type, rarity));
    }
    return results;
  }
  function applyFragment(career, type, rarity){
    const team = playerTeam(career);
    const part = team.parts[type];
    const rarityRank = RARITY_ORDER.indexOf(rarity);
    const currentRank = RARITY_ORDER.indexOf(part.rarity);
    let leveledUp = false, rarityUp = false;
    if (rarityRank > currentRank){
      // A higher-rarity drop replaces the part outright at level 1.
      part.rarity = rarity; part.level = 1; part.dupes = 0; rarityUp = true;
    } else {
      part.dupes++;
      const info = RARITY_INFO[part.rarity];
      if (part.dupes >= info.dupToLevel && part.level < info.maxLevel){
        part.dupes -= info.dupToLevel;
        part.level++;
        leveledUp = true;
      }
    }
    return { type, rarity, leveledUp, rarityUp, part };
  }
  function upgradePart(career, type){
    const team = playerTeam(career);
    const part = team.parts[type];
    const info = RARITY_INFO[part.rarity];
    if (part.level >= info.maxLevel) return false;
    const cost = 3000 + part.level*1500;
    const materialsCost = 5 + part.level*2;
    if (!canAfford(team, cost) || team.materials < materialsCost) return false;
    spend(team, cost);
    team.materials -= materialsCost;
    part.level++;
    return true;
  }
  
  // ---- Save system ------------------------------------------------------
  const SAVE_KEY = 'apexGT3ManagerSave';
  function saveCareer(career){
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(career)); return true; }
    catch(e){ console.warn('No se pudo guardar la partida', e); return false; }
  }
  function loadCareer(){
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.teams || !parsed.driversPool || !parsed.calendar) return null;
      if (window.LRO_ROSTER && !parsed.driversPool.some(d => d.rosterId)) return null;   // carrera con la base de pilotos anterior: se descarta (empieza una nueva con los pilotos reales)
      return migrateCareer(parsed);
    } catch(e){ console.warn('Save corrupto, se descarta.', e); return null; }
  }
  function resetSave(){ try { localStorage.removeItem(SAVE_KEY); } catch(e){} }
  
  'use strict';
  // ==========================================================================
  // CIRCUITOS DE LA SERIE NACIONAL GT3 — geografía y lore del mundo ficticio + carga de trazados externos.
  //
  // Cada circuito tiene su ficha (CIRCUIT_META): nación, región, año, historia, carácter, curvas con nombre y
  // una descripción del paisaje. El trazado (layout) y el decorado (props) de hoy son PLACEHOLDERS: para reemplazarlos
  // basta con poner circuits/<id>.json (ver CIRCUITOS_PARA_IA.md); si el archivo existe, pisa el trazado interno.
  // Las naciones son las de assets/nations/ (mundo ficticio de Eternal Manager).
  // ==========================================================================
  const CIRCUIT_META = {
   "valleverde": {
    "nation": "Peronia",
    "region": "San Esteban",
    "opened": 1961,
    "kind": "Clásico permanente de campo",
    "theme": "grass",
    "km": 1.9,
    "turns": 12,
    "silhouette": "Óvalo alargado con una horquilla al final de la recta y una zona de eses en el fondo; sentido horario.",
    "ground": "#9dcc95",
    "sky": "#b6c4bd",
    "lore": "Primer autódromo permanente de la Serie Nacional. Se trazó en 1961 sobre el camino de tierra que unía dos estancias del valle de San Esteban y todavía se corre con las tribunas de madera originales en la recta principal.",
    "character": "Rápido y equilibrado: el circuito de referencia para comparar autos y el primero al que llega un equipo nuevo.",
    "quirk": "Un molino de viento gira junto a los boxes; los pilotos lo usan como referencia de dirección del viento.",
    "corners": [
     [
      "La Horqueta",
      "derecha lenta al final de la recta principal; frenada fuerte y única zona clara de sobrepaso"
     ],
     [
      "El Alambrado",
      "izquierda-derecha rápida en tercera, sin margen en la salida"
     ],
     [
      "Puente Viejo",
      "derecha de radio constante sobre un puentecito de piedra"
     ],
     [
      "Los Álamos",
      "curva ciega de izquierda entre dos hileras de álamos"
     ]
    ],
    "landscape": "Pastizales verdes, hileras de álamos, alambrados de campo, cerros bajos al fondo, molino de viento junto a los boxes y tribunas de madera pintadas de blanco.",
    "props": "una hilera de álamos (tree round) paralela a la recta trasera, un molino (cylinder + 4 box finas), un galpón de estancia (box + cone) y alambrados (box finas y largas) a 24 m del eje."
   },
   "autodromocentral": {
    "nation": "Estovackia",
    "region": "Tellin",
    "opened": 1952,
    "kind": "Industrial mixto en talleres ferroviarios",
    "theme": "city",
    "km": 1.7,
    "turns": 13,
    "silhouette": "Rectas cortas unidas por curvas de 90° y una chicane doble; parece un plano de vías, con horquillas cerradas.",
    "ground": "#8e918c",
    "sky": "#a9adb0",
    "lore": "Autódromo levantado dentro de las antiguas naves de reparación de locomotoras de Tellin, en Estovackia. Los boxes son las naves originales de chapa y el trazado esquiva las vías que quedaron a la vista. Se lo conoce por las frenadas.",
    "character": "Técnico y duro con los frenos: cuatro de sus curvas lentas llegan después de rectas largas. Poca velocidad punta, mucho trabajo de pedal.",
    "quirk": "Cruza una vía muerta con un tren museo estacionado; las bocinas del tren suenan en la largada.",
    "corners": [
     [
      "Los Talleres",
      "izquierda de 90° tras la recta principal, muy cerrada"
     ],
     [
      "La Chimenea",
      "horquilla de derecha rodeando una chimenea de ladrillo"
     ],
     [
      "Horno Alto",
      "chicane rápida de derecha-izquierda con muros cercanos"
     ],
     [
      "Cambio de Agujas",
      "S lenta sobre un empedrado de vía"
     ]
    ],
    "landscape": "Naves industriales de ladrillo y chapa, vías oxidadas, chimeneas, vagones abandonados, silos, tribunas metálicas bajas y cielo gris de invierno.",
    "props": "chimeneas (cylinder altos), naves (box largas con techo box más finas), vagones (box 12x3x3) en fila, un silo (cylinder), una torre de agua (cylinder + cone)."
   },
   "costasur": {
    "nation": "Valurria",
    "region": "Punta Marea",
    "opened": 1974,
    "kind": "Costero con viento cruzado",
    "theme": "coast",
    "km": 1.9,
    "turns": 12,
    "silhouette": "Trazado que serpentea entre médanos: una recta de cara al mar, una S lenta en el espigón y un giro largo de derecha; sentido antihorario.",
    "ground": "#d8caa0",
    "sky": "#afcfdf",
    "lore": "Pista sobre la costa de Punta Marea, entre médanos y un faro. El viento cruzado del sur mueve la arena sobre el asfalto y cambia el agarre vuelta a vuelta; llueve seguido.",
    "character": "Técnico y cambiante. Se gana con el ajuste de alerones y la lectura del clima más que con motor.",
    "quirk": "Un faro rojo y blanco marca el punto de frenada de la curva 1.",
    "corners": [
     [
      "Faro",
      "derecha larga en bajada que acaba de cara al mar"
     ],
     [
      "La Escollera",
      "S lenta junto a un espigón de roca"
     ],
     [
      "Médano",
      "izquierda ciega sobre una duna; se ensucia con arena"
     ]
    ],
    "landscape": "Médanos con pasto duro, faro blanco y rojo, escollera de rocas, mar abierto, casas bajas de madera y cielo cambiante.",
    "props": "el faro (cylinder + cone + sphere), el mar (water enorme a un lado), la escollera (sphere achatadas grises), casas de madera (box + cone) y dunas (sphere con squash 0.3)."
   },
   "montrealpl": {
    "nation": "Kaigam",
    "region": "Monteral",
    "opened": 1978,
    "kind": "Ribera y horquillas",
    "theme": "grass",
    "km": 2.4,
    "turns": 12,
    "silhouette": "Dos rectas largas unidas por horquillas de 180° y un tramo rápido junto al río; sentido horario.",
    "ground": "#7f9578",
    "sky": "#a7b3b8",
    "lore": "Parque de carreras junto a un río que se congela en invierno. El asfalto tarda en calentar y castiga a los neumáticos duros; el muro exterior de la última chicane es famoso por su cantidad de choques.",
    "character": "Rectas largas y horquillas: velocidad punta y frenada. Alta posibilidad de sobrepaso.",
    "quirk": "Cada largada empieza con la banda del club de regatas tocando el himno junto al puente de hierro.",
    "corners": [
     [
      "Horquilla del Molino",
      "izquierda de 180° al final de la recta más larga"
     ],
     [
      "Puente Alto",
      "derecha rápida en peralte sobre el río"
     ],
     [
      "Muro de los Campeones",
      "chicane final con muro exterior a un metro"
     ]
    ],
    "landscape": "Abetos oscuros, río ancho, tribunas de acero, puente de hierro, banderas del club de regatas y taludes con nieve sucia.",
    "props": "abetos (tree pine), el río (water largo y angosto), un puente de hierro (box finas), banderas (cylinder finos) y taludes de nieve (sphere achatadas blancas)."
   },
   "sierragp": {
    "nation": "Costas Unidas",
    "region": "Villa Sierra",
    "opened": 1988,
    "kind": "De montaña, en ladera",
    "theme": "mountain",
    "km": 2.1,
    "turns": 12,
    "silhouette": "Vueltas en zigzag como una ladera: dos horquillas, una S encadenada y una cresta rápida; sentido antihorario.",
    "ground": "#a58b6c",
    "sky": "#b7c3cf",
    "lore": "Circuito de montaña abierto en 1988 sobre la ladera de Villa Sierra. Tiene 46 metros de desnivel entre el punto más alto y el más bajo y casi ninguna zona plana (en el juego la pista es plana: el desnivel vive en la ficha y en el paisaje).",
    "character": "Desnivel y técnica. Curvas ciegas en cresta y bajadas que exigen confianza en los frenos.",
    "quirk": "Un teleférico cruza sobre la horquilla más lenta y los pilotos ven las cabinas pasar arriba.",
    "corners": [
     [
      "Cresta",
      "derecha ciega en la cima de la subida"
     ],
     [
      "El Tobogán",
      "bajada en S con frenada a mitad de curva"
     ],
     [
      "La Herradura",
      "horquilla de izquierda en contra-pendiente"
     ]
    ],
    "landscape": "Ladera de cerro con matorral seco, cables de un teleférico, taludes de tierra roja, casas blancas en la parte alta y tribunas en terrazas.",
    "props": "cerros (sphere achatadas color tierra), torres de teleférico (cylinder finos + box), casas blancas (box + box techo) en terrazas, matorral (sphere pequeñas)."
   },
   "pampacircuit": {
    "nation": "Kostanay",
    "region": "Altyn Dala",
    "opened": 1957,
    "kind": "Óvalo abierto en la estepa",
    "theme": "grass",
    "km": 2.6,
    "turns": 11,
    "silhouette": "Óvalo grande y casi plano con curvas anchas y un pequeño quiebre en el fondo; sentido horario.",
    "ground": "#b9b56a",
    "sky": "#c5cfd4",
    "lore": "Óvalo enorme en la estepa de Kostanay, construido en 1957 por una cooperativa de cosmonautas retirados que probaban máquinas junto a la vieja base de lanzamientos. Se sortean sus entradas en la feria de ganado de la aldea de Altyn Dala.",
    "character": "Rápido, abierto y con poca lluvia. Gana quien mejor cuida los neumáticos y la aerodinámica; el viento de la estepa mueve la carrera.",
    "quirk": "Los cohetes oxidados del viejo campo de lanzamiento se ven de fondo en la recta trasera.",
    "corners": [
     [
      "La Manga",
      "derecha larga y ancha de 200 metros, plena en cuarta"
     ],
     [
      "El Yurta",
      "izquierda cerrada, la única frenada fuerte"
     ],
     [
      "Bebedero",
      "curva rápida de derecha con borde de pasto"
     ]
    ],
    "landscape": "Estepa dorada sin árboles, horizonte plano, yurtas y tanques de agua, un cohete oxidado y torres de lanzamiento lejanas, tribunas de chapa y un silo junto a los boxes.",
    "props": "yurtas (cylinder bajo + cone), cohete oxidado (cylinder + cone) y torre de lanzamiento (box altos finos) a 150 m del eje, silos (cylinder), tanques (cylinder)."
   },
   "litoralring": {
    "nation": "Morvicia",
    "region": "Puerto Litoral",
    "opened": 1969,
    "kind": "De ribera húmedo",
    "theme": "forest",
    "km": 2.2,
    "turns": 12,
    "silhouette": "Curvas medias encadenadas que siguen la orilla, con un rulo de horquilla en la zona más baja; sentido antihorario.",
    "ground": "#8aa27a",
    "sky": "#b8c6c3",
    "lore": "Circuito de ribera sobre un río ancho lleno de islas. La humedad no baja nunca y la niebla de la mañana retrasa las largadas con frecuencia; llueve en cuatro de cada diez fechas.",
    "character": "Fluido y húmedo. Trazado de curvas medias encadenadas donde el agarre cambia según el tramo.",
    "quirk": "Las lanchas del club náutico saludan a la carrera desde el agua con bocinas.",
    "corners": [
     [
      "Isla Larga",
      "derecha rápida junto al agua, se inunda primero"
     ],
     [
      "Camalote",
      "S lenta entre pastos altos"
     ],
     [
      "Boya",
      "izquierda de radio decreciente en la zona más baja"
     ]
    ],
    "landscape": "Río marrón con islas, sauces y juncos, muelles de madera, lanchas amarradas, niebla baja y tribunas sobre pilotes.",
    "props": "el río (water grande), sauces (tree round color verde apagado), muelles (box largas y finas sobre el agua), lanchas (box + cone) y tribunas sobre pilotes (grandstand)."
   },
   "nortespeed": {
    "nation": "Magayanes",
    "region": "Ciudad Norte",
    "opened": 1996,
    "kind": "Óvalo peraltado de estadio",
    "theme": "grass",
    "km": 2.5,
    "turns": 8,
    "silhouette": "Óvalo alargado sin curvas lentas: dos peraltes grandes unidos por rectas; sentido antihorario.",
    "ground": "#7da06e",
    "sky": "#c2cdd0",
    "lore": "Speedway con peralte levantado para la copa de estadios de Magayanes. Es el circuito más caluroso de la serie y el único donde las curvas se toman con el auto inclinado (en el juego, sin peralte real).",
    "character": "Velocidad pura sobre óvalo. Se corre en pelotón, con succión y cambios de líder.",
    "quirk": "Se corre con los mástiles de luz encendidos, incluso de día, por la tradición del estadio.",
    "corners": [
     [
      "Peralte Grande",
      "curva 1-2 peraltada, 24° de inclinación"
     ],
     [
      "El Embudo",
      "entrada estrecha en la curva 3"
     ],
     [
      "Cafetal",
      "curva final peraltada hacia la recta de boxes"
     ]
    ],
    "landscape": "Estadio cerrado con tribunas altas en todo el perímetro, mástiles de luz, calor en el aire, cafetales y montañas verdes a lo lejos.",
    "props": "tribunas altas continuas (grandstand y box largas), mástiles de luz (cylinder finos altos con box arriba), cafetales (tree round en filas) y montañas (sphere gigantes) lejos."
   },
   "desiertoring": {
    "nation": "Sahar",
    "region": "Oasis Dorado",
    "opened": 2003,
    "kind": "Desierto al atardecer",
    "theme": "desert",
    "km": 2.3,
    "turns": 12,
    "silhouette": "Trazado abierto que rodea el oasis con una recta larga trasera y una chicane entre dos muros; sentido horario.",
    "ground": "#dabc87",
    "sky": "#e6c9a0",
    "lore": "Pista abierta entre las dunas del desierto de Sahar, junto a un oasis con palmeras. Casi no llueve y el asfalto pasa de 50 °C al mediodía, por eso se corre al atardecer.",
    "character": "Calor extremo y arena. El desgaste de neumáticos y la refrigeración mandan.",
    "quirk": "El paddock es un campamento de tiendas de tela; el té se sirve entre sesiones.",
    "corners": [
     [
      "La Duna",
      "derecha larga que se cubre de arena con el viento"
     ],
     [
      "Zoco",
      "chicane lenta entre dos muros de adobe"
     ],
     [
      "Espejismo",
      "derecha rápida al final de la recta trasera"
     ]
    ],
    "landscape": "Dunas color ocre, palmeras del oasis, muros de adobe, tiendas de tela en el paddock, cielo anaranjado y sol bajo.",
    "props": "dunas (sphere achatadas ocre), el oasis (water pequeña + tree round verde oscuro), muros de adobe (box), tiendas (cone + box)."
   },
   "patagoniapark": {
    "nation": "Baikal",
    "region": "Bahía de Hielo",
    "opened": 2009,
    "kind": "Sobre lago congelado",
    "theme": "mountain",
    "km": 2.0,
    "turns": 13,
    "silhouette": "Trazado amplio sobre una bahía: una recta larga junto a la costa, una horquilla enorme y una zona de curvas ligadas; sentido antihorario.",
    "ground": "#e6eef3",
    "sky": "#c9d6df",
    "lore": "Circuito trazado sobre la bahía de un lago de aguas profundas de Baikal, en el Continente Viejo. En invierno el hielo alcanza un metro y se levanta un asfalto de emergencia con bordes de nieve compactada; sólo tres fechas por temporada tienen luz de sol suficiente.",
    "character": "Frío extremo, agarre bajo y viento lateral. Neumáticos difíciles de calentar y mucho subviraje; el error se paga con un muro de nieve.",
    "quirk": "Los boxes son cabañas de madera sobre patines que remolcan al final de cada temporada.",
    "corners": [
     [
      "Cabo Frío",
      "derecha ciega con viento lateral fuerte"
     ],
     [
      "Grieta",
      "horquilla de izquierda pegada a una fisura marcada con banderines"
     ],
     [
      "La Isla",
      "curva rápida de izquierda alrededor de un islote de rocas"
     ]
    ],
    "landscape": "Superficie blanca y azul de hielo, montañas nevadas, pinos oscuros en la costa, cabañas sobre patines, pescadores a lo lejos y cielo bajo.",
    "props": "hielo (water blanquecina o box planas), pinos (tree pine) en la costa, cabañas (box + cone rojas), un rompehielos (box + cylinder) a un costado, montañas (sphere achatadas blancas)."
   },
   "atlanticospeed": {
    "nation": "Grammes",
    "region": "Cabo Espuma",
    "opened": 1982,
    "kind": "Costero rápido",
    "theme": "coast",
    "km": 2.1,
    "turns": 10,
    "silhouette": "Rectas largas y curvas rápidas en línea con el acantilado; sólo una frenada lenta; sentido antihorario.",
    "ground": "#cfc6a2",
    "sky": "#b3d0e0",
    "lore": "Pista rápida sobre la costa de Grammes, con vista al océano abierto. El aire salado corroe todo lo metálico y los equipos lavan los autos entre sesiones.",
    "character": "Velocidad y viento. Pocas frenadas y muchos sobrepasos en la recta larga.",
    "quirk": "Los banderilleros usan chalecos naranjas para no perderse entre las gaviotas.",
    "corners": [
     [
      "Espuma",
      "derecha de alta velocidad al inicio de la vuelta"
     ],
     [
      "Rompiente",
      "izquierda lenta después de la recta trasera"
     ],
     [
      "Bahía",
      "largo giro de derecha con vista al mar"
     ]
    ],
    "landscape": "Acantilados bajos, mar azul, faros pequeños, casas encaladas de techo naranja, gaviotas y tribunas frente al agua.",
    "props": "mar (water grande), acantilado (box larga baja gris), faros (cylinder + cone), casas encaladas (box blancas + box naranjas)."
   },
   "selvaverde": {
    "nation": "Riada",
    "region": "Río Verde",
    "opened": 1999,
    "kind": "Selva húmeda cerrada",
    "theme": "forest",
    "km": 2.0,
    "turns": 12,
    "silhouette": "Circuito con muchos cambios de dirección, sin rectas largas salvo la principal; sentido horario.",
    "ground": "#5f8f5a",
    "sky": "#9db7a8",
    "lore": "Circuito dentro de la selva de Riada, abierto a machete y asfalto en 1999. Llueve más de la mitad de las fechas y la humedad deja el asfalto brillante incluso con sol.",
    "character": "Húmedo, cerrado y con poco espacio. Curvas técnicas rodeadas de vegetación.",
    "quirk": "Tucanes y monos aulladores interrumpen las prácticas; hay un equipo de cuidadores de fauna en los boxes.",
    "corners": [
     [
      "Liana",
      "derecha lenta bajo un túnel de árboles"
     ],
     [
      "Cascada",
      "izquierda rápida junto a una caída de agua"
     ],
     [
      "Curva del Caimán",
      "horquilla junto a un arroyo, con barro en la salida"
     ]
    ],
    "landscape": "Selva densa, helechos gigantes, arroyos, palmeras altas, neblina, tribunas de madera con techo de paja y cielo tapado.",
    "props": "palmeras y árboles altos (tree round de 18–30 m, verdes oscuros) muy juntos, arroyos (water finas), cascada (box alta azul clara), tribunas con techo de paja (grandstand + cone)."
   },
   "puertourbano": {
    "nation": "Iberia",
    "region": "Puerto Nuevo",
    "opened": 2011,
    "kind": "Circuito de calle en muelles",
    "theme": "city",
    "km": 2.0,
    "turns": 13,
    "silhouette": "Calles cuadriculadas entre galpones: ángulos rectos, chicanes estrechas y una recta paralela al muelle; sentido antihorario.",
    "ground": "#7e8286",
    "sky": "#b1bcc4",
    "lore": "Circuito de calle entre los muelles y galpones del puerto de Iberia. Se arma y desarma en cinco días con vallas de hormigón y las grúas de carga miran la carrera desde arriba.",
    "character": "Urbano y de frenadas fuertes. Paredes muy cerca, casi ningún margen de error.",
    "quirk": "Un buque de carga amarrado tapa la vista de la recta del muelle y se va al día siguiente.",
    "corners": [
     [
      "La Grúa",
      "derecha de 90° debajo de una grúa portacontenedores"
     ],
     [
      "Muelle 4",
      "chicane estrecha entre galpones"
     ],
     [
      "Aduana",
      "izquierda lenta con salida cerrada"
     ]
    ],
    "landscape": "Contenedores apilados, grúas portuarias, galpones de chapa, vallas de hormigón, edificios de oficinas al fondo y barcos amarrados.",
    "props": "contenedores (box 12x2.6x2.4, colores vivos, apilados), grúas (box altas + box horizontal), galpones (box), el buque (box + box), agua del puerto (water)."
   },
   "lagunaazul": {
    "nation": "Netanya",
    "region": "Orilla Baja",
    "opened": 2013,
    "kind": "Salar bajo el nivel del mar",
    "theme": "desert",
    "km": 2.3,
    "turns": 13,
    "silhouette": "Óvalo irregular junto a un lago salado: tramo rápido paralelo a la orilla, horquilla lenta y una S doble; sentido horario.",
    "ground": "#e7dfcc",
    "sky": "#d9e3ea",
    "lore": "Circuito junto al mar salado de Netanya, en el Continente Viejo: es el punto más bajo de todo el calendario, a 400 metros bajo el nivel del mar. El aire denso da más agarre y más motor, y la costra de sal brilla bajo el sol; la carrera termina antes del mediodía por el calor.",
    "character": "Calor seco, aire denso y sal en el asfalto. Frenadas estables y curvas rápidas; el desgaste de neumáticos es bajo pero el sobrecalentamiento amenaza.",
    "quirk": "Los pilotos pueden flotar en el lago tras la carrera: es una tradición y el equipo ganador se tira vestido.",
    "corners": [
     [
      "Orilla",
      "derecha larga pegada al lago salado"
     ],
     [
      "La Costra",
      "horquilla de izquierda sobre sal blanca, agarre bajo"
     ],
     [
      "Gemelas",
      "S doble de derecha-izquierda antes de la recta principal"
     ]
    ],
    "landscape": "Lago de agua celeste turquesa con costra de sal blanca, colinas ocres al fondo, palmeras datileras, tiendas de un mercado y un mirador.",
    "props": "el lago (water celeste grande), sal (box planas blancas), colinas (sphere achatadas ocre), palmeras (tree round verde), tribuna larga baja (grandstand) y toldos (box)."
   },
   "andesendurance": {
    "nation": "Sotoa",
    "region": "Alto Sotoa",
    "opened": 2005,
    "kind": "Altiplano de resistencia",
    "theme": "mountain",
    "km": 3.1,
    "turns": 14,
    "silhouette": "Circuito largo con dos rectas, una zona técnica en bajada y un giro final ancho; es el más extenso del calendario; sentido antihorario.",
    "ground": "#b09a7a",
    "sky": "#a9c8e6",
    "lore": "Circuito en el altiplano de Sotoa, a más de tres mil metros. El aire fino le quita potencia a los motores y hace trabajar más a los frenos. Es el más largo del calendario.",
    "character": "Exigente y largo, con 14 curvas. Se gana con constancia, no con una vuelta rápida.",
    "quirk": "Los equipos cargan tubos de oxígeno y las bocinas suenan en quechua-sotoano para avisar las banderas.",
    "corners": [
     [
      "Apacheta",
      "curva rápida de derecha sobre una loma con mojones de piedra"
     ],
     [
      "El Salar",
      "recta con curva ciega final sobre una costra de sal"
     ],
     [
      "Paso del Cóndor",
      "combinación lenta izquierda-derecha en la bajada"
     ]
    ],
    "landscape": "Altiplano seco, cerros pelados color tierra, salar blanco, llamas, cielo azul muy profundo, banderas de colores y casas de adobe.",
    "props": "cerros pelados (sphere achatadas), llamas (box pequeñas + box), casas de adobe (box), banderas de colores (cylinder finos), salar (box plana blanca)."
   },
   "pampavelocity": {
    "nation": "Skote",
    "region": "Karoo Ancho",
    "opened": 2000,
    "kind": "Tri-óvalo de alta velocidad",
    "theme": "grass",
    "km": 2.9,
    "turns": 11,
    "silhouette": "Tri-óvalo casi plano con tres rectas largas y curvas amplias; sentido horario.",
    "ground": "#c4b072",
    "sky": "#bcd0d8",
    "lore": "Trazado muy rápido en la sabana de Skote, construido para batir marcas. Casi no tiene frenadas y por eso los ingenieros lo llaman «la autopista con banderas»; al atardecer las acacias proyectan sombras largas sobre el asfalto.",
    "character": "Velocidad máxima y poco desgaste de frenos. Muchísima succión y adelantamientos.",
    "quirk": "Una manada de jirafas suele cruzar el fondo del paisaje durante las clasificaciones.",
    "corners": [
     [
      "Tornado",
      "derecha larga plena a fondo"
     ],
     [
      "Cuarenta",
      "curva ciega de izquierda a 40 metros de la valla"
     ],
     [
      "Meseta",
      "chicane rápida antes de la recta principal"
     ]
    ],
    "landscape": "Sabana dorada con acacias de copa plana, termiteros, cerros aislados (kopjes), cielo abierto, tribunas largas y bajas.",
    "props": "acacias (tree round de copa achatada, color oliva), kopjes (sphere achatadas grises), termiteros (cone), tribunas largas bajas (grandstand)."
   },
   "santacruz": {
    "nation": "Melonia",
    "region": "Santa Cruz",
    "opened": 1997,
    "kind": "Histórico de colinas y viñedos",
    "theme": "forest",
    "km": 2.4,
    "turns": 15,
    "silhouette": "Circuito sinuoso con muchas curvas de medio radio, dos horquillas y una subida final; sentido horario.",
    "ground": "#8fa574",
    "sky": "#b9c7d1",
    "lore": "Circuito en las colinas de Melonia, con un castillo en la cima y viñedos alrededor. Se corrió por primera vez en 1997 sobre un camino de carreta y hoy conserva el trazado original con curvas cerradas entre muros de piedra.",
    "character": "Sinuoso y técnico, con 15 curvas y muchos cambios de ritmo. Es de los más largos en tiempo de vuelta.",
    "quirk": "El público invade el borde del asfalto con mesas de vino durante la carrera (detrás de las vallas, claro).",
    "corners": [
     [
      "La Arboleda",
      "derecha rápida entre árboles pegados a la pista"
     ],
     [
      "El Claro",
      "horquilla lenta en un claro con sol"
     ],
     [
      "Cementerio",
      "izquierda ciega en subida junto a un muro de piedra"
     ]
    ],
    "landscape": "Colinas de viñedos en hileras, un castillo, cipreses, muros de piedra, campanario y tribunas de piedra.",
    "props": "viñedos (tree round bajos en hileras), castillo (box + cylinder + cone), cipreses (tree pine finos), muros de piedra (box), campanario (box + cone)."
   },
   "nocturnaring": {
    "nation": "Overmark",
    "region": "Nordhavn",
    "opened": 2015,
    "kind": "Nocturno polar con aurora",
    "theme": "night",
    "km": 2.2,
    "turns": 13,
    "silhouette": "Circuito junto a un fiordo, con recta iluminada, horquilla junto al puerto y una zona de curvas ligadas; sentido antihorario.",
    "ground": "#5d6c78",
    "sky": "#0f1a35",
    "lore": "Circuito iluminado de Overmark, en el Continente Viejo, pensado para correr en la noche polar: durante seis meses el sol no sale y la aurora boreal cubre el cielo. Tiene 640 luminarias y se ve desde el puerto; es la fecha más vista por televisión.",
    "character": "Nocturno, técnico y con frenadas fuertes. La visión importa tanto como el auto; el frío hace más difícil calentar los neumáticos.",
    "quirk": "Durante la carrera se apagan las luces de la ciudad de Nordhavn a mitad de carrera para ver la aurora.",
    "corners": [
     [
      "Luminaria",
      "derecha rápida bajo un arco de luces"
     ],
     [
      "Fiordo",
      "horquilla junto al agua oscura"
     ],
     [
      "Aurora",
      "chicane final con el cielo verde de fondo"
     ]
    ],
    "landscape": "Fiordo negro con montañas nevadas, ciudad portuaria con casas de madera de colores, luces blancas y azules, aurora verde y pista brillante.",
    "props": "casas de madera pintadas (box + cone rojas/amarillas/azules), agua del fiordo (water oscura), montañas nevadas (sphere gigantes), mástiles de luz (cylinder + box) cada 60 m."
   },
   "calderaring": {
    "nation": "Tamago",
    "region": "Isla Caldera",
    "opened": 2016,
    "kind": "Cráter de volcán apagado",
    "theme": "mountain",
    "km": 2.0,
    "turns": 15,
    "silhouette": "Trazado que baja hacia el centro de un cráter y vuelve a subir: curvas cerradas encadenadas y una espiral; sentido antihorario.",
    "ground": "#4b4b4e",
    "sky": "#c2c0be",
    "lore": "Circuito dentro de la caldera de un volcán apagado en la isla de Tamago. La pista baja hacia el centro del cráter y vuelve a subir; la grava negra es de ceniza volcánica.",
    "character": "Difícil, con curvas cerradas y desniveles. Poca velocidad pero muchos cambios de dirección.",
    "quirk": "Sale vapor de una fumarola junto a la salida de la curva 12 y a veces tapa la visión.",
    "corners": [
     [
      "Boca",
      "horquilla de derecha en el borde del cráter"
     ],
     [
      "Lava Fría",
      "S lenta sobre coladas de roca negra"
     ],
     [
      "Fumarola",
      "izquierda ciega junto a una salida de vapor"
     ]
    ],
    "landscape": "Paredes rocosas de un cráter, grava y roca negra, vapor saliendo de la tierra, vegetación escasa, lago verde en el fondo y cielo brumoso.",
    "props": "paredes del cráter (sphere achatadas grises muy grandes en círculo), lago verde (water), coladas (box bajas negras), fumarolas (cylinder finos grises), pocos árboles."
   },
   "centenario": {
    "nation": "Margin",
    "region": "Rheinau",
    "opened": 2018,
    "kind": "Moderno de gala (final del campeonato)",
    "theme": "grass",
    "km": 2.5,
    "turns": 14,
    "silhouette": "Circuito fluido con una recta larga, una sección de eses y un gran giro de radio constante hacia la recta final; sentido horario.",
    "ground": "#8fb17f",
    "sky": "#bfd0dc",
    "lore": "Autódromo inaugurado para el centenario de la federación automovilística de Margin, a orillas del río Rheinau. Es la sede de la fecha final y del acto de premiación del campeonato, con las banderas de todas las naciones.",
    "character": "Rápido y fluido, con curvas de radio amplio y buen espacio para sobrepasar. Cierra el año con el podio del campeonato.",
    "quirk": "El podio se levanta sobre la recta principal y cada campeón recibe una copa con su nación grabada.",
    "corners": [
     [
      "Monumento",
      "derecha rápida junto a un monumento de piedra"
     ],
     [
      "Las Esses",
      "cuatro curvas alternadas en tercera"
     ],
     [
      "Curva del Centenario",
      "gran izquierda de radio constante hacia la recta final"
     ]
    ],
    "landscape": "Complejo moderno con tribunas curvas de hormigón claro, banderas de todas las naciones, un monumento en el infield, césped cuidado y podio frente a la recta.",
    "props": "tribunas curvas (grandstand + box), banderas (cylinder finos altos con box), monumento (box + cylinder), césped y árboles jóvenes (tree round)."
   }
  };
  // Nombres visibles de los circuitos (los ids de archivo no cambian).
  const TRACK_NAMES = {
   "valleverde": "VALLE VERDE",
   "autodromocentral": "TELLIN RAILWORKS",
   "costasur": "COSTA SUR",
   "montrealpl": "MONTERAL PARK",
   "sierragp": "SIERRA GP",
   "pampacircuit": "ESTEPA GRANDE",
   "litoralring": "LITORAL RING",
   "nortespeed": "NORTE SPEEDWAY",
   "desiertoring": "DESIERTO RING",
   "patagoniapark": "LAGO HELADO PARK",
   "atlanticospeed": "OCÉANO SPEED",
   "selvaverde": "SELVA VERDE",
   "puertourbano": "PUERTO URBANO",
   "lagunaazul": "MAR SALADO",
   "andesendurance": "ALTIPLANO ENDURANCE",
   "pampavelocity": "SABANA VELOCITY",
   "santacruz": "SANTA CRUZ GP",
   "nocturnaring": "NOCHE POLAR",
   "calderaring": "CALDERA RING",
   "centenario": "AUTÓDROMO DEL CENTENARIO"
  };
  
  // Ajustes de juego por circuito según su carácter (agarre, frenos, aero, lluvia, temperatura, dificultad de sobrepaso). El JSON del circuito los puede pisar.
  const CIRCUIT_MODS = {
    pampacircuit: { tempBase: 22 },
    patagoniapark: { gripMod: 0.82, brakingMod: 1.1, aeroMod: 1.05, wetChance: 0.1, tempBase: -3, overtakeDiff: 0.5 },
    lagunaazul: { gripMod: 1.02, brakingMod: 1.05, aeroMod: 1.12, wetChance: 0.03, tempBase: 38, overtakeDiff: 0.45 },
    nocturnaring: { gripMod: 0.96, tempBase: 2, wetChance: 0.25 },
    santacruz: { tempBase: 24 },
    pampavelocity: { tempBase: 32 },
  };
  // Ficha visible en el juego (atlas de circuitos) y datos derivados.
  TRACKS.forEach(t => {
    const m = CIRCUIT_META[t.id];
    if (!m) return;
    t.nation = m.nation; t.region = m.region; t.opened = m.opened; t.lore = m.lore; t.character = m.character; t.cornerNames = m.corners; t.landscape = m.landscape;
    t.kind = m.kind; t.quirk = m.quirk; t.silhouette = m.silhouette; t.propsKit = m.props; t.targetKm = m.km;
    t.country = m.region + ', ' + m.nation;
    if (TRACK_NAMES[t.id]) t.name = TRACK_NAMES[t.id];
    if (m.turns) t.corners = m.turns;
    t.theme = m.theme;
    if (m.ground && !t.groundColor) t.groundColor = m.ground;
    if (m.sky && !t.skyColor) t.skyColor = m.sky;
    Object.assign(t, CIRCUIT_MODS[t.id] || {});
    t.desc = m.kind;
  });
  
  // ---- trazados y decorado externos: circuits/<id>.json, o un único circuits/circuits.json con todos ({ "<id>": {...}, ... }) — ver CIRCUITOS_PARA_IA.md ----
  const CIRCUIT_THEMES = ['grass', 'desert', 'coast', 'forest', 'city', 'night', 'mountain'];
  const CIRCUIT_NUM = { gripMod: [0.7, 1.3], brakingMod: [0.7, 1.4], aeroMod: [0.7, 1.4], overtakeDiff: [0.1, 0.95], wetChance: [0, 0.8], tempBase: [-10, 45], treeCount: [0, 320], halfWidth: [6, 14] };
  function validCircuitFile(d) {
    if (!d || typeof d !== 'object') return 'no es un objeto';
    if (d.layout != null) {
      if (!Array.isArray(d.layout) || d.layout.length < 8 || d.layout.length > 60) return 'layout debe tener entre 8 y 60 puntos';
      if (d.layout.some(p => !Array.isArray(p) || p.length !== 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || Math.abs(p[0]) > 900 || Math.abs(p[1]) > 900)) return 'cada punto de layout es [x,z] en metros, |valor| ≤ 900';
      if (d.layout.slice(0, 3).some(p => Math.abs(p[1] - 135) > 0.5)) return 'los tres primeros puntos deben estar sobre z = 135 (largada y boxes)';
    }
    for (const k in CIRCUIT_NUM) if (d[k] != null && !(d[k] >= CIRCUIT_NUM[k][0] && d[k] <= CIRCUIT_NUM[k][1])) return k + ' fuera de rango ' + CIRCUIT_NUM[k].join('–');
    if (d.theme != null && !CIRCUIT_THEMES.includes(d.theme)) return 'theme desconocido';
    if (d.props != null && (!Array.isArray(d.props) || d.props.length > 600)) return 'props: lista de hasta 600 objetos';
    return null;
  }
  function applyCircuitFile(def, d) {
    const err = validCircuitFile(d);
    if (err) { console.warn('[circuits] ' + def.id + ' ignorado: ' + err); return false; }
    ['layout', 'halfWidth', 'theme', 'props', 'groundColor', 'skyColor', 'wetChance', 'tempBase', 'gripMod', 'brakingMod', 'aeroMod', 'overtakeDiff', 'treeCount', 'hills', 'foliageColor'].forEach(k => { if (d[k] != null) def[k] = d[k]; });
    def.external = true;
    return true;
  }
  // Modelo aislado de un circuito: todo lo que hace falta para rehacerlo (y lo que el juego pone alrededor y NO se puede pisar).
  // Es el mismo formato que se carga desde circuits/<id>.json; los campos que empiezan con «_» son sólo referencia y se ignoran al cargar.
  function circuitModel(def) {
    const T = window.THREE, layout = layoutForTrack(def), r1 = v => Math.round(v * 10) / 10;
    const out = {
      _formato: 'Circuito de la Serie Nacional GT3 · ver 07-carreras-apex/CIRCUITOS_PARA_IA.md. Los campos con «_» son referencia (se ignoran al cargar).',
      id: def.id, name: def.name, nation: def.nation, region: def.region, theme: def.theme || 'grass', halfWidth: def.halfWidth || 8.5,
      groundColor: def.groundColor, skyColor: def.skyColor, wetChance: def.wetChance, tempBase: def.tempBase, gripMod: def.gripMod, brakingMod: def.brakingMod, aeroMod: def.aeroMod, overtakeDiff: def.overtakeDiff,
      layout: layout.map(p => [p[0], p[1]]), props: def.props || [],
    };
    if (def.treeCount != null) out.treeCount = def.treeCount;
    if (def.hills != null) out.hills = def.hills;
    if (!T) return out;
    const curve = new T.CatmullRomCurve3(layout.map(([x, z]) => new T.Vector3(x, 0, z)), true, 'catmullrom', .35); curve.arcLengthDivisions = 5000;
    const L = curve.getLength(), hw = out.halfWidth;
    const at = (s, lane = 0) => { const u = (((s % L) + L) % L) / L, p = curve.getPointAt(u), t = curve.getTangentAt(u).normalize(); return [r1(p.x + t.z * lane), r1(p.z - t.x * lane)]; };
    const edge = (a, b, lane) => { const pts = []; for (let s = a; s <= b; s += 15) pts.push(at(s, lane)); return pts; };
    const center = [];
    for (let s = 0; s < L; s += 20) {
      const u = s / L, tg = curve.getTangentAt(u), t2 = curve.getTangentAt(Math.min(1, u + 20 / L)), ang = DM.atan2(tg.x * t2.z - tg.z * t2.x, tg.dot(t2));
      center.push({ s: Math.round(s), p: at(s), radius: Math.abs(ang) < 1e-3 ? null : Math.round(20 / Math.abs(ang)) });
    }
    out._referencia = {
      largoMetros: Math.round(L), largoKm: r1(L / 100) / 10, sentido: 'El punto 0 es la línea de largada; el auto avanza por el orden de los puntos (hacia +x en la recta principal).',
      largada: { s: 0, punto: at(0), tangente: [+curve.getTangentAt(0).x.toFixed(3), +curve.getTangentAt(0).z.toFixed(3)] },
      parrilla: 'Diez autos en dos columnas, desde s = −8 hacia atrás cada 9 m, a ±3,2 m del eje (ver engine.js buildCircuitWorld).',
      boxes: { carrilBoxes: { desdeS: 30, hastaS: 295, ladoInterior: at(30, 10), ladoExterior: at(30, 25), borde: edge(30, 295, 24.6).slice(0, 5), nota: 'Carril lateral de 15 m (lane +10 a +25) a la IZQUIERDA del sentido de marcha (en la recta principal, hacia z menores). +lane = izquierda, -lane = derecha.' }, edificio: { s: 170, lane: 36, largo: 175, ancho: 16, alto: 7 }, entradaEnBoxes: 'Se activa entre 32 m y 55 m de vuelta; el auto va al carril lane 20 y para en s = vuelta*largo + 155 + 6*id.', guardarrielBoxes: 'lane +40 hasta s = 305; el resto de la vuelta ±20.' },
      tribunasPorDefecto: [{ s: 115, lane: -33, length: 100 }, { s: Math.round(L - 65), lane: -34, length: 58 }, { s: 555, lane: -32, length: 52 }],
      carteles: [{ s: 125, lane: -31, text: def.name }, { s: 475, lane: -27 }, { s: 830, lane: 28 }, { s: 1100, lane: -28 }],
      eje: center,
    };
    return out;
  }
  function downloadCircuitJSON(def) {
    const model = circuitModel(def), blob = new Blob([JSON.stringify(model, null, 1)], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = def.id + '.json'; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function downloadAllCircuitsJSON() {
    const all = {}; TRACKS.forEach(d => { const m = circuitModel(d); delete m._referencia; all[d.id] = m; });
    const blob = new Blob([JSON.stringify(all, null, 1)], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'circuits.json'; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  window.circuitModel = circuitModel; window.downloadCircuitJSON = downloadCircuitJSON; window.downloadAllCircuitsJSON = downloadAllCircuitsJSON;
  
  for (const def of TRACKS) { const d = {"valleverde":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[235.849,142.41],[300.951,198.291],[311.45,234.172],[298.579,259.567],[227.652,300.717],[168.937,320.7],[137.393,343.407],[96.653,403.023],[55.058,440.668],[26.88,460.143],[-43.263,466.589],[-91.867,449.979],[-152.105,436.616],[-207.609,448.931],[-250.417,466.215],[-325.573,463.285],[-362.466,444.587],[-407.139,399.982],[-428.491,345.905],[-455.974,290.018],[-459.463,228.744],[-416.502,156.03],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.15,"tempBase":24,"gripMod":1,"brakingMod":1,"aeroMod":1,"overtakeDiff":0.5,"hills":false},"autodromocentral":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[229.286,145.854],[257.572,160.074],[301.435,236.323],[298.703,264.174],[275.095,279.29],[185.551,274.531],[128.474,259.281],[68.815,242.843],[10.137,236.385],[-55.132,239.839],[-109.197,256.037],[-175.873,279.235],[-241.225,299.318],[-280.681,305.013],[-404.254,290.806],[-460.177,233.851],[-454.211,197.41],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"city","wetChance":0.2,"tempBase":22,"gripMod":0.95,"brakingMod":1.25,"aeroMod":0.9,"overtakeDiff":0.4,"hills":false},"costasur":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[242.722,113.091],[291.222,80.37],[322.268,34.113],[329.391,-23.188],[311.094,-80.303],[273.712,-116.293],[219.213,-135.879],[168.348,-132.085],[115.848,-121.786],[56.494,-132.463],[6.492,-162.964],[-41.031,-183.181],[-89.887,-185.205],[-146.71,-166.942],[-195.489,-129.515],[-239.807,-106.548],[-291.893,-101.315],[-345.246,-100.648],[-399.338,-79.324],[-445.566,-29.894],[-463.255,27.067],[-451.404,74.765],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"coast","wetChance":0.35,"tempBase":26,"gripMod":1.05,"brakingMod":0.95,"aeroMod":1.15,"overtakeDiff":0.65,"hills":false},"montrealpl":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.699,135.001],[305.252,135.556],[362.227,130.818],[421.74,133.796],[484.335,172.122],[502.116,208.873],[504.27,263.506],[491.271,295.093],[426.903,335.22],[363.737,337.416],[307.562,320.533],[248.885,319.869],[199.413,327.846],[140.651,343.112],[95.395,379.028],[51.749,413.517],[-6.139,429.222],[-57.86,438.945],[-117.229,440.077],[-174.706,445.157],[-232.296,450.865],[-289.229,455.037],[-347.039,456.526],[-398.739,435.507],[-454.916,411.013],[-500.171,379.952],[-529.972,323.821],[-536.643,273.309],[-515.233,219.012],[-473.786,180.467],[-425.929,146.14],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.3,"tempBase":18,"gripMod":1.1,"brakingMod":1.1,"aeroMod":0.85,"overtakeDiff":0.35,"hills":false},"sierragp":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.855,135.664],[306.857,111.681],[347.285,60.148],[352.491,16.473],[330.279,-30.009],[272.728,-69.546],[224.652,-72.962],[157.8,-60.644],[114.045,-67.508],[71.743,-100.964],[39.591,-159.082],[14.893,-201.947],[-35.874,-239.501],[-74.246,-262.352],[-146.79,-265.053],[-196.099,-240.912],[-210.564,-215.066],[-215.005,-122.142],[-229.507,-93.544],[-255.379,-81.997],[-344.75,-88.329],[-380.11,-84.902],[-436.128,-49.538],[-465.398,-0.367],[-465.378,47.529],[-434.886,98.764],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"mountain","wetChance":0.25,"tempBase":20,"gripMod":0.92,"brakingMod":1.05,"aeroMod":1.05,"overtakeDiff":0.55,"hills":false},"pampacircuit":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.627,134.083],[307.12,134.84],[360.247,159.318],[412.677,185.849],[460.813,215.42],[501.097,256.652],[518.686,313.91],[523.172,372.998],[500.379,426.935],[465.71,470.677],[424.842,511.521],[376.324,544.192],[318.838,552.101],[259.764,551.219],[201.776,556.76],[146.011,542.911],[95.25,508.308],[43.565,488.317],[-19.936,496.026],[-60.742,519.875],[-115.792,548.749],[-174.324,552.268],[-232.485,556.277],[-290.312,557.218],[-348.518,552.271],[-398.946,523.267],[-448.892,488.414],[-489.964,455.966],[-525.137,406.649],[-533.996,349.635],[-532.475,288.339],[-506.258,238.668],[-465.161,197.393],[-423.588,156.028],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.1,"tempBase":22,"gripMod":1,"brakingMod":1,"aeroMod":1,"overtakeDiff":0.45,"hills":false},"litoralring":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[249.42,137.154],[306.814,128.009],[355.674,92.237],[393.189,46.727],[404.967,-10.04],[387.72,-64.695],[344.677,-110.47],[295.137,-127.958],[236.389,-136.109],[182.868,-165.937],[144.582,-211.265],[100.819,-243.202],[43.767,-252.301],[-10.853,-244.013],[-69.189,-253.938],[-120.247,-286.602],[-167.424,-312.534],[-227.572,-316.689],[-282.098,-292.887],[-320.934,-245.829],[-333.164,-198.958],[-341.262,-143.923],[-375.738,-87.416],[-409.399,-59.115],[-452.042,5.06],[-456.795,57.499],[-434.2,99.22],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"forest","wetChance":0.4,"tempBase":23,"gripMod":0.98,"brakingMod":0.9,"aeroMod":1.1,"overtakeDiff":0.6,"hills":false},"nortespeed":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.236,134.923],[304.428,134.026],[360.532,130.509],[409.072,138.262],[474.808,131.665],[527.404,96.515],[558.346,41.121],[556.048,13.227],[516.88,-27.72],[435.755,-50.414],[394.512,-45.534],[335.727,-44.779],[278.585,-46.93],[221.366,-47.496],[164.13,-47.545],[106.893,-47.543],[49.656,-47.543],[-7.58,-47.543],[-64.817,-47.543],[-122.053,-47.544],[-179.29,-47.514],[-236.519,-47.164],[-293.839,-46.354],[-345.467,-50.014],[-412.089,-48.389],[-449.897,-49.443],[-533.402,-38.734],[-585.024,-1.098],[-596.419,28.5],[-585.335,73.823],[-530.143,131.118],[-484.43,143.017],[-426.491,143.518],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.2,"tempBase":30,"gripMod":1.08,"brakingMod":1,"aeroMod":0.9,"overtakeDiff":0.3,"hills":false},"desiertoring":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.513,132.517],[303.727,149.314],[347.792,187.12],[392.183,225.866],[423.764,273.88],[429.433,331.009],[413.446,387.605],[397.577,443.886],[361.194,488.33],[308.511,513.728],[253.908,534.292],[200.8,558.713],[142.66,560.911],[84.226,564.213],[26.512,564.273],[-25.576,540.831],[-69.546,499.472],[-117.353,476.385],[-172.404,478.289],[-228.482,499.71],[-281.977,504.505],[-337.074,484.425],[-389.002,457.087],[-434.937,422.627],[-461.199,371.397],[-479.611,315.25],[-483.665,257.996],[-460.928,205.159],[-422.893,159.57],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"desert","wetChance":0.04,"tempBase":34,"gripMod":0.94,"brakingMod":1.18,"aeroMod":0.9,"overtakeDiff":0.32,"hills":false},"patagoniapark":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[245.75,126.193],[298.593,104.51],[343.867,73.457],[376.761,29.115],[386.123,-21.381],[373.688,-77.316],[341.833,-120.112],[297.438,-149.803],[231.739,-164.529],[191.766,-162.851],[130.742,-147.382],[79.139,-123.614],[40.63,-110.518],[-32.865,-112.393],[-73.201,-125.576],[-125.025,-144.237],[-187.874,-151.743],[-229.487,-145.814],[-287.577,-125.514],[-334.796,-101.272],[-389.79,-75.628],[-439.208,-28.321],[-460.075,41.678],[-446.952,82.796],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"mountain","wetChance":0.1,"tempBase":-3,"gripMod":0.82,"brakingMod":1.1,"aeroMod":1.05,"overtakeDiff":0.5,"hills":false},"atlanticospeed":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.017,135.009],[303.113,131.402],[353.048,112.474],[404.385,81.133],[435.076,38.884],[444.328,-17.83],[431.606,-60.443],[388.699,-104.29],[339.81,-123.074],[280.899,-129.189],[225.35,-136.258],[169.621,-135.199],[115.708,-117.373],[63.134,-99.605],[8.027,-91.816],[-46.062,-103.61],[-99.23,-126.081],[-152.57,-143.207],[-208.245,-143.659],[-264.697,-135.484],[-320.317,-125.267],[-365.706,-109.667],[-435.887,-57.906],[-464.479,-26.917],[-473.895,7.514],[-437.507,93.209],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"coast","wetChance":0.32,"tempBase":21,"gripMod":1.03,"brakingMod":0.95,"aeroMod":0.92,"overtakeDiff":0.28,"hills":false},"selvaverde":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[243.83,146.857],[301.815,197.729],[308.632,226.692],[295.404,286.451],[271.651,344.15],[268.972,387.183],[269.607,434.769],[231.179,513.076],[201.589,529.29],[150.096,529.66],[98.298,505.497],[58.738,472.324],[-8.116,450.065],[-53.636,448.842],[-110.65,444.994],[-167.529,418.136],[-199.282,409.292],[-241.592,410.647],[-316.139,412.146],[-370.009,387.419],[-403.955,358.88],[-449.158,306.868],[-464.992,236.669],[-444.972,184.151],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"forest","wetChance":0.52,"tempBase":29,"gripMod":1.08,"brakingMod":1.12,"aeroMod":1.2,"overtakeDiff":0.67,"hills":false},"puertourbano":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[245.637,105.257],[280.825,64.289],[305.043,44.006],[357.779,-18.635],[369.078,-68.207],[355.933,-99.934],[290.899,-138.914],[213.804,-140.356],[168.139,-135.241],[115.002,-108.912],[69.183,-71.272],[12.425,-51.827],[-48.337,-50.434],[-102.207,-78.791],[-141.267,-122.452],[-188.96,-155.263],[-260.504,-162.258],[-302.314,-141.712],[-341.905,-95.662],[-366.557,-58.313],[-390.612,-36.001],[-451.95,29.614],[-460.506,64.402],[-443.934,96.124],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"city","wetChance":0.3,"tempBase":23,"gripMod":0.93,"brakingMod":1.28,"aeroMod":0.94,"overtakeDiff":0.72,"hills":false},"lagunaazul":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.595,132.051],[304.845,147.452],[351.491,184.244],[398.254,217.31],[429.409,267.455],[433.92,325.237],[425.395,385.094],[410.827,440.211],[372.007,485.471],[323.863,518.05],[265.115,524.317],[214.925,507.882],[161.7,486.498],[99.976,487.677],[50.8,507.574],[-0.717,518.992],[-51.286,508.668],[-103.373,480.148],[-158.197,470.424],[-213.225,484.208],[-267.935,502.223],[-328.115,497.44],[-374.22,470.274],[-422.668,432.578],[-452.358,383.408],[-466.99,326.017],[-475.834,268.73],[-459.603,210.379],[-426.21,162.105],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"desert","wetChance":0.03,"tempBase":38,"gripMod":1.02,"brakingMod":1.05,"aeroMod":1.12,"overtakeDiff":0.45,"hills":false},"andesendurance":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.972,135],[305.944,135.004],[363.901,134.891],[421.845,135.356],[480.184,136.58],[533.573,114.874],[574.636,73.41],[616.729,32.987],[639.197,-19.757],[635.454,-77.406],[619.356,-134.486],[580.737,-176.604],[525.235,-195.245],[465.784,-193.639],[419.275,-166.792],[378.017,-122.207],[330.281,-96.105],[272.146,-96.046],[217.324,-117.726],[168.655,-148.152],[137.012,-197.021],[110.45,-248.691],[71.765,-291.572],[18.837,-312.278],[-39.471,-322.729],[-98.13,-320.804],[-139.54,-299.254],[-187.357,-252.709],[-235.704,-230.922],[-286.799,-235.227],[-343.777,-263.35],[-393.794,-281.634],[-449.877,-276.786],[-500.058,-247.171],[-546.006,-210.438],[-587.096,-170.775],[-607.677,-117.691],[-615.483,-59.12],[-609.161,-1.942],[-577.573,45.695],[-528.623,77.525],[-480.11,109.22],[-427.941,133.758],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"mountain","wetChance":0.12,"tempBase":19,"gripMod":0.95,"brakingMod":1.2,"aeroMod":1.05,"overtakeDiff":0.43,"hills":false},"pampavelocity":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.633,135.004],[307.263,134.99],[366.014,134.652],[420.723,155.042],[471.777,182.062],[529.743,200.586],[578.458,232.312],[607.598,286.163],[611.592,338.653],[615.332,399.354],[596.411,454.236],[558.839,499.43],[521.919,544.972],[485.361,590.949],[436.189,622.293],[383.814,648.673],[331.55,675.249],[279.287,701.823],[227.168,728.765],[171.458,745.14],[113.006,750.243],[54.635,755.747],[-3.712,761.752],[-61.669,757.692],[-113.713,730.432],[-165.392,702.759],[-217.223,675.367],[-269.286,648.297],[-314.042,610.9],[-355.366,569.292],[-396.825,527.833],[-438.408,486.488],[-476.032,442.087],[-506.668,391.94],[-531.553,338.846],[-531.35,281.566],[-504.485,227.796],[-470.83,184.195],[-425.406,147.287],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.09,"tempBase":32,"gripMod":1.02,"brakingMod":0.92,"aeroMod":0.86,"overtakeDiff":0.25,"hills":false},"santacruz":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.117,132.36],[304.916,134.234],[364.629,166.71],[401.047,227.715],[398.45,267.597],[369.312,326.331],[344.882,372.847],[339.237,421.749],[344.381,477.703],[326.511,539.459],[282.47,582.184],[229.623,593.652],[171.732,574.27],[119.784,529.695],[83.868,513.042],[16.503,517.288],[-25.75,539.857],[-72.899,564.88],[-147.15,567.264],[-186.206,547.767],[-199.574,522.946],[-209.875,449.086],[-229.771,398.453],[-251.106,380.321],[-325.684,367.157],[-366.781,373.697],[-433.326,363.808],[-463.973,342.759],[-486.687,277.73],[-471.52,204.68],[-430.229,157.302],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"forest","wetChance":0.44,"tempBase":24,"gripMod":1.1,"brakingMod":1.16,"aeroMod":1.19,"overtakeDiff":0.6,"hills":false},"nocturnaring":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[248.849,135.963],[306.037,125.386],[357.824,95.191],[403.48,60.739],[430.546,8.165],[428.376,-49.632],[405.271,-106.585],[358.301,-145.605],[310.685,-163.372],[250.121,-162.409],[188.892,-136.084],[148.505,-127.924],[89.076,-146.557],[41.855,-189.356],[3.837,-223.865],[-51.536,-242.875],[-106.2,-234.085],[-152.554,-203.475],[-190.348,-170.015],[-253.301,-148.123],[-303.15,-151.269],[-356.575,-148.942],[-410.668,-121.317],[-443.049,-73.79],[-461.729,-15.699],[-461.286,48.027],[-425.153,107.504],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"night","wetChance":0.25,"tempBase":2,"gripMod":0.96,"brakingMod":1.16,"aeroMod":1.08,"overtakeDiff":0.48,"hills":false},"calderaring":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[246.928,127.156],[298.991,97.841],[335.473,54.583],[347.708,-7.916],[333.628,-53.916],[301.736,-110.723],[259.985,-144.59],[178.561,-160.042],[137.445,-151.463],[96.205,-130.26],[70.262,-101.979],[44.619,-44.753],[27.794,-21.906],[1.058,-6.672],[-83.44,-4.422],[-120.803,-24.717],[-169.029,-75.53],[-215.455,-101.101],[-273.241,-102.939],[-329.213,-88.237],[-386.8,-69.739],[-442.483,-11.736],[-455.737,58.383],[-436.268,96.996],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"mountain","wetChance":0.2,"tempBase":27,"gripMod":0.97,"brakingMod":1.14,"aeroMod":1.02,"overtakeDiff":0.62,"hills":false},"centenario":{"layout":[[-220,135],[-100,135],[20,135],[140,135],[190,135],[247.341,135.561],[304.604,133.927],[362.922,130.532],[417.778,150.323],[461.19,192.652],[497.027,233.967],[513.37,291.927],[500.869,349.459],[474.207,405.18],[428.968,439.274],[374.869,462.265],[321.74,480.481],[264.604,474.962],[211.332,448],[170.551,433.846],[107.618,441.929],[63.711,465.121],[15.066,479.712],[-34.353,473.759],[-80.088,458.462],[-145.15,460.96],[-195.276,485.957],[-238.558,507.945],[-300.821,511.85],[-349.386,493.114],[-404.72,469.178],[-443.866,428.058],[-486.95,387.548],[-520.138,339.475],[-527.766,279.839],[-514.455,224.115],[-475.217,178.957],[-426.519,144.892],[-370,135],[-310,135]],"halfWidth":8.5,"theme":"grass","wetChance":0.18,"tempBase":22,"gripMod":1.03,"brakingMod":1.05,"aeroMod":1,"overtakeDiff":0.5,"hills":false}}[def.id]; if (d) applyCircuitFile(def, d); }
  'use strict';
  // Original, procedural artwork. Shared geometry powers the collection and race.
  const RacingArt = (() => {
    const T = window.THREE;
    const cache = new Map();
    // Each profile has its own bonnet, roof line, wheelbase and front/rear treatment.
    const specs = {
      classic:   {color:'#ff7c24',width:1.03,length:1.02,roof:2.02,cabin:-.35,roofLen:1.36,nose:1.24,axle:1.96,grille:'camaro',lights:'slit',rear:'square'},
      touring:   {color:'#b92035',width:.98,length:1.02,roof:2.22,cabin:.03,roofLen:1.95,nose:1.22,axle:2.02,grille:'alfa',lights:'triple',rear:'slit'},
      sprint:    {color:'#346ee7',width:1.04,length:1.05,roof:2.04,cabin:-.35,roofLen:1.5,nose:1.3,axle:2.04,grille:'mustang',lights:'triple',rear:'triple'},
      endurance: {color:'#e8edf2',width:1.04,length:1.05,roof:2.18,cabin:-.08,roofLen:1.68,nose:1.31,axle:2.03,grille:'bmw',lights:'twin',rear:'slit'},
      aero:      {color:'#13bfae',width:1.05,length:1.07,roof:1.99,cabin:-.68,roofLen:1.35,nose:1.22,axle:2.07,grille:'amg',lights:'slash',rear:'slit'},
      track:     {color:'#96a9b9',width:1.04,length:1,roof:1.93,cabin:.22,roofLen:1.45,nose:1.07,axle:1.99,grille:'audi',lights:'slash',rear:'slit',mid:true},
      spectre:   {color:'#ed3049',width:1.05,length:1,roof:1.87,cabin:.3,roofLen:1.15,nose:.97,axle:1.95,grille:'ferrari',lights:'blade',rear:'round',mid:true},
      raijin:    {color:'#4484df',width:1.07,length:1.04,roof:2.16,cabin:-.08,roofLen:1.75,nose:1.34,axle:2.01,grille:'nissan',lights:'slash',rear:'round'},
      mistral:   {color:'#78b849',width:1.04,length:1.03,roof:1.98,cabin:-.46,roofLen:1.38,nose:1.14,axle:2.04,grille:'aston',lights:'blade',rear:'bar'},
      valkyr:    {color:'#f6c743',width:1.01,length:.95,roof:2.03,cabin:.18,roofLen:1.15,nose:1.01,axle:1.88,grille:'porsche',lights:'round',rear:'bar'},
      corsair:   {color:'#ae87ee',width:1.08,length:1.03,roof:1.89,cabin:.38,roofLen:1.14,nose:1.03,axle:2.02,grille:'corvette',lights:'blade',rear:'square',mid:true}
    };
    function trackCurve(def){
      const curve = new T.CatmullRomCurve3(layoutForTrack(def).map(([x,z])=>new T.Vector3(x,0,z)),true,'catmullrom',.35);
      curve.arcLengthDivisions=5000;
      return curve;
    }
    if(T) TRACKS.forEach(def=>{def.lengthKm=trackCurve(def).getLength()/1000;});
    const mat = (c,metalness=.25,roughness=.32) => new T.MeshStandardMaterial({color:c,metalness,roughness});
    function mesh(g,geo,m,x=0,y=0,z=0){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
    function block(g,m,w,h,d,x=0,y=0,z=0){return mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);}
    function cyl(g,m,r,h,x=0,y=0,z=0,n=32){return mesh(g,new T.CylinderGeometry(r,r,h,n),m,x,y,z);}
    function ball(g,m,r,x=0,y=0,z=0){return mesh(g,new T.SphereGeometry(r,32,20),m,x,y,z);}
    function tube(g,m,points,r){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,8,false),m);}
    function shell(g,m,sections,uvf){
      const vertices=[],indices=[],uvs=[];
      sections.forEach(([z,w,base,top,tw])=>{vertices.push(-w,base,z,w,base,z,tw,top,z,-tw,top,z);if(uvf)uvf(z,w,base,top,tw).forEach(p=>uvs.push(p[0],p[1]));});
      for(let i=0;i<sections.length-1;i++)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4,c=a+4,d=b+4;indices.push(a,b,c,b,d,c);}
      indices.push(0,2,1,0,3,2);let e=(sections.length-1)*4;indices.push(e,e+1,e+2,e,e+2,e+3);
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));if(uvf)geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return mesh(g,geo,m);
    }
    // Cartel de anunciante: fondo de color según el nombre y texto ajustado al ancho (no lleva logo raster para no depender de imágenes).
    function sponsorDecal(name){
      let h=0;for(const ch of name)h=(h*31+ch.charCodeAt(0))>>>0;h%=360;
      const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');
      const g=x.createLinearGradient(0,0,512,0);g.addColorStop(0,`hsl(${h} 70% 38%)`);g.addColorStop(1,`hsl(${(h+30)%360} 75% 26%)`);x.fillStyle=g;x.fillRect(0,0,512,128);
      x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=6;x.strokeRect(3,3,506,122);
      let fs=76;x.font=`italic 900 ${fs}px Arial`;while(x.measureText(name).width>470&&fs>24){fs-=2;x.font=`italic 900 ${fs}px Arial`;}
      x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(name,256,68);
      const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
      return new T.MeshStandardMaterial({map,roughness:.4,polygonOffset:true,polygonOffsetFactor:-2,side:T.DoubleSide});
    }
    function decal(text,color='#ffffff',bg=null){
      const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
      if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);}ctx.fillStyle=color;ctx.font='italic 900 82px Arial';ctx.textAlign='center';ctx.fillText(text,256,94);
      const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
      return new T.MeshStandardMaterial({map,transparent:true,roughness:.45,side:T.DoubleSide});
    }
    function panel(g,m,points,z){
      const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
      return mesh(g,new T.ShapeGeometry(shape),m,0,0,z);
    }
    // ---------------------------------------------------------------------------------------------------------
    // LIVERY COMO TEXTURA. La carrocería (shell) lleva UV: u = posición a lo largo del auto (0 trasera … 1 trompa) y
    // v recorre el perímetro de la sección: 0 = zócalo izquierdo, .30 = línea de cintura izquierda, .70 = línea de cintura
    // derecha, 1 = zócalo derecho. Toda la decoración (franjas, números, anunciantes) se pinta en UNA textura de 1024×512,
    // así se adapta a la forma del modelo en vez de ser bloques pegados encima.
    //   franja izquierda  -> y 358..512 (arriba físico = arriba del canvas)
    //   franja superior   -> y 154..358 (capó, techo y baúl; arriba del canvas = lado derecho del auto)
    //   franja derecha    -> y   0..154 (invertida: se dibuja girada 180°)
    const LIV_KEYS = ['center', 'twin', 'side', 'nose', 'dual', 'chevron', 'checker', 'diag'];
    const livCache = new Map();
    function liveryTexture(liv, number, cabinU, roofU) {
      const key = JSON.stringify([liv.primary, liv.secondary, liv.accent, liv.roof, liv.pattern, liv.sponsors, number, cabinU.toFixed(2), roofU[0].toFixed(2), roofU[1].toFixed(2)]);
      if (livCache.has(key)) return livCache.get(key);
      const W = 1024, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      const P = liv.primary || '#e73549', S = liv.secondary || '#f2f5f3', A = liv.accent || '#111820', pat = liv.pattern || 'none';
      const TOP0 = 154, TOP1 = 358, MID = 256;
      x.fillStyle = P; x.fillRect(0, 0, W, H);
      // --- diseños (8) ---
      const topRect = (px, py, pw, ph, col) => { x.fillStyle = col; x.fillRect(px, py, pw, ph); };
      const side = (right, fn) => { x.save(); if (right) { x.translate(W, TOP0); x.rotate(Math.PI); } else x.translate(0, TOP1); x.beginPath(); x.rect(0, 0, W, 154); x.clip(); fn(right ? (f) => (1 - f) * W : (f) => f * W, right); x.restore(); };
      if (pat === 'center') {
        topRect(0, MID - 38, W, 76, S); topRect(0, MID - 52, W, 8, A); topRect(0, MID + 44, W, 8, A);
      } else if (pat === 'twin') {
        topRect(0, MID - 46, W, 22, S); topRect(0, MID + 24, W, 22, S); topRect(0, MID - 20, W, 6, A); topRect(0, MID + 14, W, 6, A);
      } else if (pat === 'side') {
        [false, true].forEach((r) => side(r, () => { x.fillStyle = S; x.beginPath(); x.moveTo(0, 96); x.lineTo(W, 60); x.lineTo(W, 96); x.lineTo(0, 132); x.closePath(); x.fill(); x.fillStyle = A; x.beginPath(); x.moveTo(0, 132); x.lineTo(W, 96); x.lineTo(W, 106); x.lineTo(0, 142); x.closePath(); x.fill(); }));
        topRect(0, TOP0, W, 14, S); topRect(0, TOP1 - 14, W, 14, S);
      } else if (pat === 'nose') {
        x.fillStyle = S; x.beginPath(); x.moveTo(W * .68, 0); x.lineTo(W, 0); x.lineTo(W, H); x.lineTo(W * .62, H); x.closePath(); x.fill();
        x.fillStyle = A; x.beginPath(); x.moveTo(W * .655, 0); x.lineTo(W * .68, 0); x.lineTo(W * .625, H); x.lineTo(W * .60, H); x.closePath(); x.fill();
      } else if (pat === 'dual') {
        x.fillStyle = S; x.fillRect(0, MID, W, H - MID); topRect(0, MID - 5, W, 10, A);
      } else if (pat === 'chevron') {
        for (let k = -1; k < 13; k++) { const px = k * 96 + 20; x.fillStyle = k % 2 ? A : S; x.beginPath(); x.moveTo(px, MID - 78); x.lineTo(px + 58, MID); x.lineTo(px, MID + 78); x.lineTo(px + 36, MID + 78); x.lineTo(px + 94, MID); x.lineTo(px + 36, MID - 78); x.closePath(); x.fill(); }
        [false, true].forEach((r) => side(r, () => { for (let k = -1; k < 24; k++) { const px = k * 52; x.fillStyle = k % 2 ? A : S; x.beginPath(); x.moveTo(px, 70); x.lineTo(px + 26, 96); x.lineTo(px, 122); x.lineTo(px + 14, 122); x.lineTo(px + 40, 96); x.lineTo(px + 14, 70); x.closePath(); x.fill(); } }));
      } else if (pat === 'checker') {
        const sq = 17;
        [false, true].forEach((r) => side(r, () => { for (let i = 0; i < W / sq; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? S : A; x.fillRect(i * sq, 84 + j * sq, sq, sq); } }));
        for (let i = 0; i < 4; i++) for (let j = 0; j < Math.ceil((TOP1 - TOP0) / sq); j++) { x.fillStyle = (i + j) % 2 ? S : A; x.fillRect(W - (i + 1) * sq, TOP0 + j * sq, sq, sq); }
        for (let i = 0; i < 4; i++) for (let j = 0; j < Math.ceil((TOP1 - TOP0) / sq); j++) { x.fillStyle = (i + j) % 2 ? S : A; x.fillRect(i * sq, TOP0 + j * sq, sq, sq); }
      } else if (pat === 'diag') {
        x.save(); x.beginPath(); x.rect(0, TOP0, W, TOP1 - TOP0); x.clip();
        for (let k = -3; k < 16; k++) { const px = k * 78; x.fillStyle = S; x.beginPath(); x.moveTo(px, TOP1); x.lineTo(px + 34, TOP1); x.lineTo(px + 34 + 110, TOP0); x.lineTo(px + 110, TOP0); x.closePath(); x.fill(); x.fillStyle = A; x.beginPath(); x.moveTo(px + 44, TOP1); x.lineTo(px + 52, TOP1); x.lineTo(px + 52 + 110, TOP0); x.lineTo(px + 44 + 110, TOP0); x.closePath(); x.fill(); }
        x.restore();
        [false, true].forEach((r) => side(r, () => { x.fillStyle = S; x.fillRect(0, 100, W, 16); x.fillStyle = A; x.fillRect(0, 120, W, 6); }));
      }
      // techo de otro color (opcional)
      if (liv.roof) { const r0 = Math.max(0, roofU[0]) * W, r1 = Math.min(1, roofU[1]) * W; x.fillStyle = liv.roof; x.fillRect(r0, MID - 78, r1 - r0, 156); }
      // zócalo oscuro (se ve en los dos costados)
      x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, H - 12, W, 12); x.fillRect(0, 0, W, 12);
      // --- cartel de anunciante ---
      const spBox = (name, bx, by, bw, bh) => {
        let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0; h %= 360;
        const g = x.createLinearGradient(bx, by, bx + bw, by); g.addColorStop(0, `hsl(${h} 70% 38%)`); g.addColorStop(1, `hsl(${(h + 30) % 360} 75% 26%)`);
        x.fillStyle = g; x.fillRect(bx, by, bw, bh); x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 3; x.strokeRect(bx + 1.5, by + 1.5, bw - 3, bh - 3);
        let fs = Math.round(bh * .62); x.font = `italic 900 ${fs}px Arial`; while (x.measureText(name).width > bw - 14 && fs > 10) { fs -= 2; x.font = `italic 900 ${fs}px Arial`; }
        x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, bx + bw / 2, by + bh / 2 + 2);
      };
      const roundel = (cx, cy, r) => { x.fillStyle = '#f4efdb'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.lineWidth = 4; x.strokeStyle = A; x.stroke(); x.fillStyle = '#111927'; x.font = `900 ${r * 1.15}px Arial`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(number, cx, cy + 3); };
      const sp = liv.sponsors || [];
      [false, true].forEach((r) => side(r, (X) => { roundel(X(.605), 78, 40); if (sp[r ? 1 : 0]) spBox(sp[r ? 1 : 0], X(.40) - 78, 54, 156, 48); }));
      // capó: número + anunciante; techo: número; baúl: anunciante
      const top = (fn) => { x.save(); x.beginPath(); x.rect(0, TOP0, W, TOP1 - TOP0); x.clip(); fn(); x.restore(); };
      top(() => {
        roundel(W * .74, MID, 46);
        if (sp[2]) spBox(sp[2], W * .90 - 75, MID - 32, 150, 64);
        if (sp[3]) spBox(sp[3], W * .10 - 90, MID - 30, 180, 60);
        roundel(cabinU * W, MID, 52);
      });
      const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
      livCache.set(key, tex); return tex;
    }
    function car(key='classic',color,number='07'){
      const liv0=color&&typeof color==='object'?color:{primary:color||(specs[key]||specs.classic).color,secondary:'#f2f5f3',accent:'#111820',pattern:'none',sponsors:[]},liv=liv0;color=liv.primary;
      const s=specs[key]||specs.classic,g=new T.Group(),body=new T.Group();g.add(body);
      g.userData.bodyType=key;g.userData.model=BODIES[key]?.name||key;
      const paint=mat(color||s.color,.48,.28),carbon=mat('#111820',.25,.5),chrome=mat('#adbdca',.8,.25),glass=mat('#122735',.65,.17),white=mat('#f2f5f3',.2,.4);
      const lamp=new T.MeshStandardMaterial({color:'#edfaff',emissive:'#c3ebff',emissiveIntensity:.8});
      const red=new T.MeshStandardMaterial({color:'#ef1631',emissive:'#ea0823',emissiveIntensity:.7});
      // A chamfered monocoque with real wheel cutouts, not the old flat prototype slab.
      const sections=[];
      for(let i=0;i<=64;i++){
        const z=-3.1+i*6.2/64;
        const end=DM.pow(Math.abs(z)/3.1,5),waist=DM.exp(-DM.pow(z/.95,2));
        const width=1.51-end*.2-waist*(s.mid?.16:.07);
        const hood=z>1?(1.36+(s.nose-1.36)*(z-1)/2.1):1.38;
        const top=z< -2.25?1.35-(Math.abs(z)-2.25)*.12:hood;
        let base=.43;
        for(const axle of [-s.axle,s.axle]){const dz=Math.abs(z-axle);if(dz<.67)base=Math.max(base,.61+Math.sqrt(.67*.67-dz*dz));}
        sections.push([z,width,Math.min(base,top-.045),top,width-.16]);
      }
      const cabinU=(s.cabin+3.1)/6.2,roofU=[(s.cabin-s.roofLen/2+3.1)/6.2,(s.cabin+s.roofLen/2+3.1)/6.2];
      const bodyMat=new T.MeshStandardMaterial({map:liveryTexture(liv,number,cabinU,roofU),metalness:.42,roughness:.3});
      shell(body,bodyMat,sections,(z,w,b,t,tw)=>{const u=(z+3.1)/6.2;return [[u,0],[u,1],[u,.7],[u,.3]];});
      block(body,carbon,2.6,.13,6.22,0,.41,0);
      // A separate greenhouse changes the actual silhouette of every model.
      const back=s.cabin-s.roofLen/2,front=s.cabin+s.roofLen/2;
      const rearFoot=key==='valkyr'?-2.65:back-(s.mid?.63:1.0);
      const cabSections=[[rearFoot,1.12,1.35,1.39,1.05],[back-.25,1.13,1.37,s.roof-.15,.96],[back,1.13,1.37,s.roof, .94],[front,1.13,1.34,s.roof-.035,.94],[front+.82,1.12,1.32,1.38,1.08]];
      shell(body,glass,cabSections);
      shell(body,bodyMat,[[back-.21,.96,s.roof-.13,s.roof-.1,.94],[back,.97,s.roof-.015,s.roof+.035,.93],[front,.97,s.roof-.04,s.roof,.93]],(z,w,b,t,tw)=>{const u=(z+3.1)/6.2,vx=x=>.5+.2*(x/1.35);return [[u,vx(-w)],[u,vx(w)],[u,vx(tw)],[u,vx(-tw)]];});
      // Windscreen frames, door seams, broad fenders and GT side skirts.
      for(const side of [-1,1]){
        tube(body,paint,[[side*1.11,1.39,front+.82],[side*.95,s.roof,front],[side*.95,s.roof+.02,back],[side*1.11,1.4,rearFoot]],.05);
        const pillar=block(body,paint,.06,s.roof-1.36,.11,side*1.075,(s.roof+1.36)/2,s.cabin-.15);pillar.rotation.z=side*.2;
        block(body,carbon,.10,.14,3.15,side*1.49,.45,0);
        block(body,white,.045,.045,2.64,side*1.51,.58,-.05);
        block(body,carbon,.21,.09,.13,side*1.44,1.18,s.cabin-.5);
        block(body,carbon,.25,.07,.23,side*1.48,1.48,front+.28);
        block(body,paint,.29,.15,.36,side*1.63,1.51,front+.29);
        if(key==='touring')block(body,carbon,.024,.5,.025,side*1.445,.96,-.6);
        if(s.mid||key==='track'){
          block(body,carbon,.06,.55,.7,side*1.46,1.06,-.95);
          const blade=block(body,key==='track'?chrome:paint,.10,.68,.12,side*1.5,1.13,-1.28);blade.rotation.x=-.35;
        }
        // Fenders arch above the tyres and follow their silhouette.
        for(const z of [-s.axle,s.axle]){
          const arch=mesh(body,new T.TorusGeometry(.68,.045,6,24,Math.PI),paint,side*1.49,.61,z);arch.rotation.y=Math.PI/2;
          for(let j=0;j<3;j++)block(body,carbon,.19,.015,.055,side*1.21,1.395,z-.13+j*.11);
        }
      }
      // Brand-specific front fascia geometry, not just a different paint color.
      const z=3.115;
      const outline=(pts)=>panel(body,carbon,pts,z);
      if(s.grille==='alfa'){
        panel(body,chrome,[[-.4,1.18],[.4,1.18],[0,.51]],z+.025);
        panel(body,carbon,[[-.32,1.13],[.32,1.13],[0,.61]],z+.03);
        for(const x of [-.85,.85])block(body,carbon,.77,.25,.07,x,.71,z);
      }else if(s.grille==='bmw'){
        for(const x of [-.31,.31]){
          block(body,chrome,.55,.82,.07,x,.92,z);
          block(body,carbon,.46,.75,.08,x,.92,z+.015);
          for(let j=0;j<5;j++)block(body,chrome,.39,.022,.025,x,.64+j*.14,z+.06);
        }
        for(const x of [-1.02,1.02])block(body,carbon,.43,.29,.07,x,.73,z);
      }else{
        const shape=s.grille==='audi'?[[-1.03,.63],[-1.15,.85],[-.87,1.15],[.87,1.15],[1.15,.85],[1.03,.63]]:
          s.grille==='aston'?[[-1.12,.6],[-1.25,.85],[-.8,1.02],[.8,1.02],[1.25,.85],[1.12,.6]]:
          s.grille==='amg'?[[-1.08,.64],[-1.18,.86],[-.93,1.16],[.93,1.16],[1.18,.86],[1.08,.64]]:
          [[-1.0,.62],[-1.15,.84],[-.8,Math.min(1.12,s.nose-.1)],[.8,Math.min(1.12,s.nose-.1)],[1.15,.84],[1,.62]];
        outline(shape);
        if(s.grille==='amg'){
          for(let j=-7;j<=7;j++)block(body,chrome,.027,.37,.025,j*.125,.88,z+.02);
          const ring=mesh(body,new T.TorusGeometry(.18,.024,8,24),chrome,0,.89,z+.05);
          for(let j=0;j<3;j++){const spoke=block(body,chrome,.025,.18,.025,DM.sin(j*2.094)*.08,.89+DM.cos(j*2.094)*.08,z+.06);spoke.rotation.z=-j*2.094;}
        }else{
          for(let j=0;j<3;j++)block(body,chrome,1.58,.018,.026,0,.72+j*.095,z+.01);
        }
        if(s.grille==='camaro')block(body,carbon,2.45,.13,.09,0,1.19,z);
        if(s.grille==='nissan'){for(const x of [-.61,.61])block(body,chrome,.06,.48,.035,x,.91,z+.02);}
      }
      for(const side of [-1,1]){
        if(s.lights==='round'){
          const housing=ball(body,carbon,.3,side*1.05,1.27,2.82);housing.scale.set(1,1.25,.42);
          const light=ball(body,lamp,.238,side*1.05,1.29,2.93);light.scale.set(1,1.24,.42);
        }else{
          const ly=s.nose-.02;
          const h=block(body,carbon,.67,.19,.09,side*.95,ly,z+.01);h.rotation.z=side*(s.lights==='slash'?.18:0);
          const l=block(body,lamp,.59,.046,.035,side*.95,ly+.035,z+.07);l.rotation.z=h.rotation.z;
          if(s.lights==='triple'||s.lights==='twin')for(let j=0;j<(s.lights==='triple'?3:2);j++)block(body,lamp,.045,.095,.03,side*(.76+j*.17),ly-.035,z+.075);
          if(s.lights==='blade'){const l=block(body,lamp,.05,.16,.04,side*1.22,ly-.05,z+.05);l.rotation.z=side*-.55;}
        }
        if(s.rear==='round')for(const x of [.72,1.1]){const tail=ball(body,red,.135,side*x,1.16,-3.1);tail.scale.z=.28;}
        else if(s.rear==='triple')for(let j=0;j<3;j++)block(body,red,.1,.25,.05,side*(.65+j*.2),1.11,-3.12);
        else block(body,red,s.rear==='bar'?1.23:.74,.065,.05,side*(s.rear==='bar'?.63:.92),1.12,-3.12);
        const support=block(body,carbon,.095,.59,.14,side*.99,1.63,-2.7);support.rotation.x=key==='valkyr'?-.35:.1;
        block(body,paint,.06,.32,.83,side*1.65,1.94,-2.75);
      }
      block(body,carbon,3.1,.09,.5,0,.42,3.02);
      block(body,carbon,3.35,.105,.77,0,1.97,-2.73);
      block(body,paint,3.3,.025,.09,0,2.04,-3.08);
      for(let j=-4;j<=4;j++)block(body,carbon,.045,.24,.48,j*.28,.5,-3.02);
      const exhausts=s.mid?[-.3,.3]:[-.97,.97];
      for(const x of exhausts){const pipe=cyl(body,chrome,.11,.22,x,.65,-3.14);pipe.rotation.x=Math.PI/2;}
      if(s.mid)for(let j=0;j<7;j++)block(body,carbon,1.45,.03,.06,0,1.43,-1.7-j*.13);
      if(key==='spectre'||key==='corsair')for(const x of [-.87,.87])shell(body,paint,[[-2.65,.08,1.32,1.4,.05],[-1.25,.10,1.33,1.68,.04],[-.95,.08,1.34,1.75,.04]]).position.x=x;
      if(key==='classic'||key==='sprint')shell(body,carbon,[[1.0,.38,1.36,1.5,.31],[1.8,.4,1.3,1.43,.32],[2.65,.32,s.nose,1.33,.25]]);
      const wheels=[],rubber=mat('#101115',.02,.95),rimMat=mat(key==='valkyr'?'#dfbd66':'#697985',.8,.28);
      for(const x of [-1.47,1.47])for(const z of [-s.axle,s.axle]){
        const w=new T.Group();w.position.set(x,.61,z);body.add(w);
        const tire=cyl(w,rubber,.61,.43,0,0,0,24);tire.rotation.z=Math.PI/2;
        const rim=cyl(w,carbon,.43,.449,0,0,0,24);rim.rotation.z=Math.PI/2;
        const disc=cyl(w,chrome,.34,.452,0,0,0,20);disc.rotation.z=Math.PI/2;
        block(w,mat('#ff4433'),.46,.28,.12,0,.19,.2);
        for(let j=0;j<10;j++){const a=j*Math.PI/5;const spoke=block(w,rimMat,.47,.035,.41,0,DM.sin(a)*.2,DM.cos(a)*.2);spoke.rotation.x=-a;}
        const hub=cyl(w,chrome,.08,.48,0,0,0,12);hub.rotation.z=Math.PI/2;wheels.push(w);
      }
      body.scale.set(s.width,1,s.length);
      return {group:g,body,wheels,paint};
    }
    function part(type,color='#40baff'){
      const g=new T.Group(),metal=mat('#afbbc8',.88,.25),dark=mat('#252d3b',.75,.32),accent=mat(color,.56,.23),rubber=mat('#111620',.05,.8);
      if(type==='engine'){
        block(g,dark,1.4,.9,1.65,0,.1,0);
        for(const x of [-.65,.65]){const head=block(g,metal,.67,.55,1.7,x,.65,0);head.rotation.z=-Math.sign(x)*.3;block(g,accent,.56,.16,1.64,x,.96,0);
          for(let j=0;j<4;j++)tube(g,metal,[[x,.5,-.6+j*.4],[x*1.6,.28,-.6+j*.4],[x*1.7,-.4,-.5+j*.4],[x*.7,-.55,.85]],.085);}
        for(const [r,y] of [[.4,.3],[.27,-.4]]){const c=cyl(g,metal,r,.16,0,y,1);c.rotation.x=Math.PI/2;const h=cyl(g,dark,r*.6,.18,0,y,1.03);h.rotation.x=Math.PI/2;}
        block(g,accent,.9,.26,.9,0,1.13,-.1);
      }else if(type==='brakes'||type==='tyres'){
        const wheel=cyl(g,type==='tyres'?rubber:metal,1,.42);wheel.rotation.x=Math.PI/2;
        const ring=mesh(g,new T.TorusGeometry(.8,.1,12,48),type==='tyres'?accent:dark,0,0,.24);
        const hub=cyl(g,dark,.4,.52);hub.rotation.x=Math.PI/2;
        for(let j=0;j<12;j++){const a=j/12*Math.PI*2;if(type==='brakes')for(const r of [.62,.82]){const hole=cyl(g,dark,.035,.02,DM.cos(a)*r,DM.sin(a)*r,.22);hole.rotation.x=Math.PI/2;}else{const spoke=block(g,metal,.09,1.4,.07,0,0,.28);spoke.rotation.z=a;}}
        if(type==='brakes')block(g,accent,.46,1.14,.5,.84,0,.2);
      }else if(type==='aero'){
        for(const x of [-.9,.9]){block(g,metal,.14,1,.23,x,-.2,0);block(g,accent,.1,.6,1.25,x*1.55,.42,0);}
        const wing=block(g,accent,2.95,.16,1.1,0,.43,0);wing.rotation.x=-.13;block(g,dark,2.85,.06,.2,0,.56,-.5);
      }else if(type==='suspension'){
        cyl(g,metal,.13,2.8);cyl(g,dark,.24,1.6,0,-.5);cyl(g,accent,.43,.13,0,-1.05);cyl(g,accent,.43,.13,0,1.05);
        const pts=Array.from({length:180},(_,i)=>{const a=i/179*Math.PI*18;return [DM.cos(a)*.34,-.9+i/179*1.8,DM.sin(a)*.34];});tube(g,accent,pts,.075);g.rotation.z=-.38;
      }else if(type==='gearbox'){
        for(let i=0;i<5;i++){const c=cyl(g,i%2?dark:metal,.7-i*.1,.4,0,0,-.7+i*.38);c.rotation.x=Math.PI/2;}
        block(g,accent,1.2,.6,1.1,0,.3,-.5);const axle=cyl(g,metal,.13,2.5);axle.rotation.z=Math.PI/2;
      }else if(type==='cooling'){
        block(g,dark,2,1.8,.4);for(let i=0;i<20;i++)block(g,metal,1.8,.035,.45,0,-.79+i*.08,0);
        for(const x of [-1,1])block(g,accent,.18,1.95,.5,x,0,0);tube(g,metal,[[-1,.8,0],[-1.3,1,0],[-1.3,1.3,0]],.12);
      }else{
        block(g,metal,1.9,.6,1.65);block(g,accent,1.75,.065,1.5,0,.34,0);for(let i=0;i<7;i++)block(g,dark,.09,.07,1.25,-.6+i*.2,.41,0);
        for(let i=0;i<4;i++){block(g,dark,.3,.23,.32,-.6+i*.4,0,.93);tube(g,i%2?accent:rubber,[[-.6+i*.4,0,1],[-.6+i*.4,-.4,1.5],[.8,-.6,1.4]],.05);}
      }
      return g;
    }
    // Original vector portraits: stable facial identity per driver, zero WebGL cost.
    function portrait(d){
      if(d && d.photo){try{return new URL('../'+d.photo,document.baseURI).href;}catch(e){}}   // retrato real del roster (assets/players/racing)
      const n=Number(d.id)||0,seed=(n*7+Number(d.number))%31;
      const skin=['#edb89a','#c98863','#e0a681','#b87a56','#f1c5a7','#9d654a'][seed%6];
      const shade=['#c88672','#9d5e44','#b3795b','#895039','#c9967d','#774630'][seed%6];
      const hair=['#25232a','#3d2c27','#6c4930','#b08a57','#181b23'][n%5];
      const color='#'+d.color.toString(16).padStart(6,'0'),accent=d.accent||'#e8e4d4';
      const jaw=47+(n%4)*3,eye=112+(n%3)*2,brow=eye-10;
      const hairstyles=[
        'M99 102Q84 47 116 38Q147 11 186 39Q210 51 204 99L192 84 184 65Q151 83 113 68Z',
        'M97 99Q81 75 97 56Q87 38 109 36Q119 16 137 28Q154 13 172 30Q195 23 203 46Q223 56 204 98L189 76Q150 58 109 82Z',
        'M99 96 96 64Q103 27 150 29Q197 30 203 67L201 97 189 72Q154 54 111 72Z',
        'M97 111Q79 60 109 41Q150 15 189 36Q220 59 200 110L190 79Q176 57 145 60L111 83 108 110Z',
        'M96 99 91 56 106 61 111 32 125 41 139 24 153 34 177 26 178 40 197 38 207 64 201 105 188 76Q144 66 111 81Z'
      ];
      const beard=d.age>=29&&n%3!==1?`<path d="M104 133Q113 175 150 182Q190 170 198 133L186 153 173 159Q152 169 127 157Z" fill="${hair}" opacity=".48"/><path d="M132 149Q150 144 168 149" fill="none" stroke="${hair}" stroke-width="3"/>`:'';
      // colores de las banderas de las naciones ficticias (assets/nations)
      const flagColors={PER:['#f4f7fb','#7fbde0','#f4f7fb'],VAL:['#3b8fdc','#fff','#f58a2a'],CUN:['#0c76a0','#fff','#0bbf0b'],GRA:['#f41b1b','#fff','#f0c030'],IBE:['#aa1000','#111','#06256d'],KAI:['#1a8fd0','#fff','#12469a'],MAG:['#fcc200','#0a1678','#a00000'],MRG:['#e87232','#fff','#000'],MEL:['#f5423f','#92b81c','#4a7a08'],MOR:['#103a68','#5397d9','#103a68'],RIA:['#f41f1b','#ffc000','#f41f1b'],SAH:['#fff','#000','#880000'],SKO:['#3f87c7','#f0c030','#000'],SOT:['#06256d','#fff','#a00000'],TAM:['#0a1678','#ffc000','#0a1678'],ZEN:['#4f174d','#fff','#4f174d']};
      const flags=flagColors[d.nationality]||flagColors.PER;
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360">
        <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#101c30"/></linearGradient><linearGradient id="face" x2="1" y2=".3"><stop stop-color="${skin}"/><stop offset=".65" stop-color="${skin}"/><stop offset="1" stop-color="${shade}"/></linearGradient><linearGradient id="suit" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#142136"/></linearGradient></defs>
        <path fill="url(#bg)" d="M0 0h300v360H0z"/>
        <path d="M-70 330 180 0h66L-5 360zm217 30L300 158v56L190 360Z" fill="${accent}" opacity=".12"/>
        <path d="M0 318 238 0M36 360 300 13" stroke="${accent}" stroke-width="2" opacity=".3"/>
        <text x="288" y="300" font-family="Arial" font-size="180" font-weight="900" text-anchor="end" fill="#fff" opacity=".06">${escape(d.number)}</text>
        <g transform="translate(${(n%3-1)*5} 29)">
        <path d="M25 339 34 228Q41 204 117 185L183 185Q259 206 266 230L278 339Z" fill="url(#suit)" stroke="#111e30" stroke-width="3"/>
        <path d="M41 221 76 210 98 339H25ZM258 222 225 211 208 339H277Z" fill="#111e30"/>
        <path d="M53 217 69 212 94 339H78Zm194 0-16-5-23 127h17Z" fill="${accent}" opacity=".85"/>
        <path d="M123 160 121 195 151 218 181 195 177 156Z" fill="${shade}"/>
        <path d="M127 167 128 190 150 203 173 188 173 162Z" fill="${skin}"/>
        <path d="M116 186 149 208 181 186 190 203 156 222 144 222 109 203Z" fill="#112034" stroke="${accent}" stroke-width="2"/>
        <path d="M150 223v112" stroke="${accent}" opacity=".65"/>
        <ellipse cx="101" cy="120" rx="10" ry="18" fill="${shade}"/><ellipse cx="199" cy="120" rx="10" ry="18" fill="${shade}"/>
        <path d="M101 82Q101 42 150 43Q200 43 200 84L${150+jaw} 139Q190 164 168 178Q151 190 133 178Q110 164 ${150-jaw} 139Z" fill="url(#face)"/>
        <path d="M102 90 115 85 108 130 119 151 110 151 103 136Z" fill="${shade}" opacity=".4"/>
        <path d="M156 104 150 128 162 135 150 138 141 135" stroke="${shade}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M113 ${brow}Q125 ${brow-5} 137 ${brow+1}M165 ${brow+1}Q180 ${brow-5} 190 ${brow}" stroke="${hair}" stroke-width="4" fill="none"/>
        <path d="M112 ${eye}Q124 ${eye-7} 138 ${eye}Q124 ${eye+5} 112 ${eye}M164 ${eye}Q178 ${eye-7} 190 ${eye}Q178 ${eye+5} 164 ${eye}" fill="#f3ece3"/>
        <g fill="${n%3===0?'#7a998b':'#67533d'}"><ellipse cx="126" cy="${eye-1}" rx="4" ry="4.5"/><ellipse cx="176" cy="${eye-1}" rx="4" ry="4.5"/></g>
        <g fill="#202733"><circle cx="126" cy="${eye-1}" r="2.2"/><circle cx="176" cy="${eye-1}" r="2.2"/></g>
        <path d="M112 ${eye-1}Q124 ${eye-7} 138 ${eye}M164 ${eye}Q177 ${eye-7} 190 ${eye-1}" fill="none" stroke="${hair}" stroke-width="1.6"/>
        <path d="M132 ${151+n%3}Q149 148 170 ${151+n%3}Q151 163 132 ${151+n%3}" fill="#a76660"/>
        <path d="M134 153Q151 155 168 152" fill="none" stroke="#70463f" stroke-width="1.5"/>
        ${beard}<path d="${hairstyles[n%5]}" fill="${hair}"/>
        <path d="M110 58Q147 36 184 49M109 65Q150 43 183 56" fill="none" stroke="${accent}" opacity=".12" stroke-width="2"/>
        <path d="M98 96 107 87 107 111 102 119ZM193 89 201 97 198 121 192 110Z" fill="${hair}"/>
        <g font-family="Arial" font-weight="900"><rect x="91" y="232" width="48" height="20" rx="3" fill="${accent}"/><text x="115" y="246" font-size="10" fill="#192132" text-anchor="middle">LRO</text><text x="185" y="245" font-size="11" fill="#fff" text-anchor="middle">GT3</text><text x="150" y="281" font-style="italic" font-size="30" fill="#f4f0e6" text-anchor="middle">MOTORSPORT</text><text x="150" y="297" font-size="7" letter-spacing="4" fill="${accent}" text-anchor="middle">RACING DIVISION</text><text x="183" y="326" font-size="25" fill="${accent}">${escape(d.number)}</text></g>
        </g>
        <g transform="translate(18 16)">${flags.map((c,i)=>`<path d="M0 ${i*6}h30v6H0z" fill="${c}"/>`).join('')}<path d="M0 0h30v18H0z" fill="none" stroke="#fff" stroke-opacity=".4"/></g>
      </svg>`;
      return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    }
    let renderer,studio,camera;
    function init(){
      if(renderer)return;
      renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setSize(800,480);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
      studio=new T.Scene();studio.add(new T.HemisphereLight(0xc5e5ff,0x334061,3));
      [[-4,7,7,0xffffff,95],[6,4,-3,0x67baff,100],[0,5,-6,0xffffff,110]].forEach(([x,y,z,c,p])=>{const light=new T.PointLight(c,p);light.position.set(x,y,z);studio.add(light);});
      camera=new T.PerspectiveCamera(34,800/480,.1,100);
    }
    function render(kind,key,color){
      const id=kind+':'+(kind==='driver'?key.id:key)+':'+(color&&typeof color==='object'?JSON.stringify(color):color);if(cache.has(id))return cache.get(id);
      if(kind==='driver'){const url=portrait(key);cache.set(id,url);return url;}
      try{
        init();let model;
        if(kind==='car'){model=car(key,color).group;camera.position.set(8.6,4.8,11);camera.lookAt(0,.7,0);}
        else {model=part(key,color);camera.position.set(3.3,2.5,4.5);camera.lookAt(0,0,0);}
        studio.add(model);renderer.render(studio,camera);const url=renderer.domElement.toDataURL('image/png');studio.remove(model);
        const geometries=new Set(),materials=new Set(),textures=new Set();model.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);if(m.map)textures.add(m.map);}}});geometries.forEach(o=>o.dispose());materials.forEach(o=>o.dispose());textures.forEach(o=>o.dispose());
        cache.set(id,url);return url;
      }catch(err){console.warn('Artwork renderer unavailable:',err.message);return 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120"><path fill="'+((color&&color.primary)||color||'#e73549')+'" d="M20 80V50l40-30h65l40 30 18 8v22H20z"/><circle cx="50" cy="80" r="18" fill="#121827"/><circle cx="145" cy="80" r="18" fill="#121827"/><path d="M65 28h52l27 24H44z" fill="#213b54"/></svg>');}
    }
    const escape = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function image(kind,key,color,cls=''){const k=kind==='driver'?key.id:key;const id=kind+':'+k+':'+(color&&typeof color==='object'?JSON.stringify(color):color);let url=cache.get(id);if(!url){url=render(kind,key,color);cache.set(id,url);}return `<img class="art-render ${cls}" src="${url}" alt="${escape(kind==='driver'?'Piloto '+key.name:kind==='car'?(BODIES[key]?.name||key):PART_LABELS[key]||key)}" draggable="false">`;}
    let packSerial=0;
    function pack(key,cls=''){
      const colors={bronze:['#895038','#edbd91'],silver:['#65869f','#e7f5fc'],gold:['#b77c1b','#ffe8a0'],legend:['#7135b6','#ddb7ff']};
      const [a,b]=colors[key]||colors.gold,id='pack-'+(++packSerial),label={bronze:'BRONZE',silver:'SILVER',gold:'GOLD',legend:'LEGEND'}[key]||'GOLD';
      // Instance-unique SVG IDs prevent invisible gradients when a hidden screen owns the first pack.
      return `<svg class="pack-art ${cls}" viewBox="0 0 240 290" role="img" aria-label="Sobre ${label}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="${b}"/><stop offset=".18" stop-color="${a}"/><stop offset=".46" stop-color="${b}"/><stop offset=".53" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><linearGradient id="${id}-dark" x2=".8" y2="1"><stop stop-color="#263750"/><stop offset="1" stop-color="#080e1c"/></linearGradient></defs>
        <ellipse cx="122" cy="269" rx="81" ry="10" fill="#000" opacity=".3"/>
        <path d="M37 14H203L209 268H31Z" fill="url(#${id})" stroke="${b}" stroke-width="1.5"/>
        <path d="M40 36h160l5 210H35Z" fill="url(#${id}-dark)"/>
        <path d="M35 214 158 36h42L63 246H35Z" fill="${a}" opacity=".22"/>
        <path d="m37 211 121-175M56 246 146 115" stroke="${b}" opacity=".4"/>
        <path d="M40 39h160M35 243h170" stroke="${b}" stroke-width="2"/>
        <g stroke="#0c1424" opacity=".4">${Array.from({length:31},(_,i)=>`<path d="M${43+i*5} 17v15m-5 219v13"/>`).join('')}</g>
        <g font-family="Arial" text-anchor="middle"><text x="120" y="68" fill="#fff" font-size="23" font-weight="900" font-style="italic">LRO</text><text x="120" y="82" fill="${b}" font-size="7" letter-spacing="3">MOTORSPORT COLLECTION</text></g>
        <path d="m120 102 52 25v42l-52 30-52-30v-42Z" fill="#102239" stroke="${b}" stroke-width="2"/>
        <path d="M84 154v-13l16-13h39l17 13v13M81 154h78v9H81Z" fill="${b}"/>
        <path d="m103 133-10 10h54l-11-10Z" fill="#152338"/><path d="M88 152h13m38 0h13" stroke="#fff" stroke-width="3"/>
        <g fill="${b}" font-family="Arial" text-anchor="middle"><text x="120" y="223" font-size="23" font-weight="900" letter-spacing="3">${label}</text><text x="120" y="236" font-size="6.5" letter-spacing="2">GT3 / PERFORMANCE SERIES</text></g>
        <path d="M42 39h5l-3 204h-6Z" fill="#fff" opacity=".17"/>
        </svg>`;
    }
    return {car,part,image,pack,specs,trackCurve,portrait};
  })();
  
  'use strict';
  // ==========================================================================
  // APEX GT3 MANAGER — race engine. World units = metres, time = seconds.
  // Physics core is the original Autódromo engine; hooks below read the grid,
  // track and weather from Career (game-data.js) instead of static arrays.
  // ==========================================================================
  if (!window.THREE) {
    document.getElementById('loading').textContent = 'No se pudo cargar Three.js. Revisá la conexión y recargá la página.';
    throw new Error('Three.js dependency unavailable');
  }
  const V3 = THREE.Vector3;
  const CONFIG = { laps:24, carCount:10, trackWidth:17, fixedStep:1/60, strategy:'sprint' };
  const TIRES = {
    S:{ name:'Soft', class:'soft', grip:1.045, wear:0.125 },
    M:{ name:'Medium', class:'medium', grip:1, wear:0.073 },
    H:{ name:'Hard', class:'hard', grip:0.978, wear:0.042 }
  };
  let CURRENT_TRACK = currentTrack(Career);
  let CURRENT_WEATHER_KEY = 'CLEAR';
  let CURRENT_WEATHER_GRIP = 1;
  const state = { phase:'grid', elapsed:0, countdown:0, speed:1, paused:false, cars:[], order:[], grid:[], cameraMode:'auto', cameraShot:0, cameraTimer:0, focus:0, focusLocked:false, excitement:0, events:[], eventUntil:0, fastest:Infinity, fastestCarId:-1, finishes:[], dnfCars:[], lastBattle:-20, lastContact:-20, finishAt:0, poleCarId:-1, safetyCar:false, safetyCarEndsAt:0, vsc:false, vscEndsAt:0, redFlag:false, redFlagRealEndsAt:0 };
  
  // --- Renderer and warm, late-afternoon atmosphere --------------------------
  const renderer = new THREE.WebGLRenderer({ canvas:$('scene'), antialias:true, alpha:false, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb6c4bd);
  scene.fog = new THREE.FogExp2(0xc3cbbb, .00075);
  const camera = new THREE.PerspectiveCamera(46, 1, .3, 2400);
  const hemi = new THREE.HemisphereLight(0xdde6e4, 0x747044, 2.2);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe5bc, 3.1);
  sun.position.set(-160, 240, 110);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left:-130, right:130, top:130, bottom:-130, near:1, far:650 });
  sun.shadow.bias = -.0004;
  sun.shadow.normalBias = .08;
  scene.add(sun, sun.target);
  
  // Procedural texture generators keep assets original and the app portable.
  let scenerySeed = 5721;
  function sceneryRandom() { scenerySeed = (scenerySeed * 1664525 + 1013904223) >>> 0; return scenerySeed / 4294967296; }
  function textureFromCanvas(width, height, draw) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    draw(canvas.getContext('2d'), width, height);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }
  function noiseTexture(base, grain, size=256) {
    return textureFromCanvas(size, size, (ctx,w,h) => {
      ctx.fillStyle=base; ctx.fillRect(0,0,w,h);
      for(let i=0;i<22000;i++) {
        const light=sceneryRandom()>.52;
        ctx.fillStyle=light ? `rgba(255,244,205,${sceneryRandom()*grain})` : `rgba(13,25,16,${sceneryRandom()*grain})`;
        const r=sceneryRandom()*2+.5; ctx.fillRect(sceneryRandom()*w,sceneryRandom()*h,r,r);
      }
    });
  }
  const grassTexture=noiseTexture('#73794d',.30);
  grassTexture.wrapS=grassTexture.wrapT=THREE.RepeatWrapping; grassTexture.repeat.set(110,110);
  const asphaltTexture=noiseTexture('#575b57',.30);
  asphaltTexture.wrapS=asphaltTexture.wrapT=THREE.RepeatWrapping; asphaltTexture.repeat.set(2,120);
  const gravelTexture=noiseTexture('#b6ad8d',.42);
  gravelTexture.wrapS=gravelTexture.wrapT=THREE.RepeatWrapping; gravelTexture.repeat.set(2,90);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000,3000), new THREE.MeshStandardMaterial({map:grassTexture,roughness:1}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-.09; ground.receiveShadow=true; scene.add(ground);
  const material = (color, extra={}) => new THREE.MeshStandardMaterial({color,roughness:.72,...extra});
  const mats={ concrete:material(0xb0b1a0), dark:material(0x282d27), cream:material(0xe5dec2), red:material(0xba4c32), steel:material(0x7a857e,{metalness:.5,roughness:.45}), roof:material(0x6b756a) };
  let circuitWorld=new THREE.Group();scene.add(circuitWorld);
  function box(w,h,d,mat,x=0,y=0,z=0,parent=circuitWorld) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
  }
  
  // --- Track: distance lookup table, tangents and curvature ------------------
  let curve,trackLength=0,builtTrackId=null;
  const SAMPLES=2400;
  const track=[];
  let mapBounds={cx:0,cz:0,scale:.25};
  function setCircuit(def){
    if(builtTrackId===def.id)return;
    curve=RacingArt.trackCurve(def);
    trackLength=curve.getLength();
    track.length=0;
    for(let i=0;i<=SAMPLES;i++) {
      const t=i/SAMPLES,p=curve.getPointAt(t),tangent=curve.getTangentAt(t).normalize();
      const normal=new V3(tangent.z,0,-tangent.x);
      const before=curve.getTangentAt(mod(t-.001,1)),after=curve.getTangentAt(mod(t+.001,1));
      const signed=DM.atan2(before.x*after.z-before.z*after.x,before.dot(after))/(trackLength*.002);
      track.push({p,tangent,normal,curvature:signed});
    }
    const bounds=new THREE.Box3().setFromPoints(track.map(f=>f.p)),size=bounds.getSize(new V3()),center=bounds.getCenter(new V3());
    mapBounds={cx:center.x,cz:center.z,scale:Math.min(174/size.x,106/size.z)};
    buildCircuitWorld(def);
    builtTrackId=def.id;
  }
  function sample(distance,lane=0) {
    const index=mod(distance,trackLength)/trackLength*SAMPLES;
    const i=Math.floor(index), f=index-i, a=track[i], b=track[i+1];
    const tangent=a.tangent.clone().lerp(b.tangent,f).normalize();
    const normal=new V3(tangent.z,0,-tangent.x);
    return {p:a.p.clone().lerp(b.p,f).addScaledVector(normal,lane),tangent,normal,curvature:lerp(a.curvature,b.curvature,f)};
  }
  function ribbon(inner,outer,height,mat,start=0,end=trackLength,segments=800) {
    const positions=[],uvs=[],indices=[];
    for(let i=0;i<=segments;i++) {
      const s=start+(end-start)*i/segments;
      for(const [j,offset] of [inner,outer].entries()) { const p=sample(s,offset).p; positions.push(p.x,height,p.z); uvs.push(j,i/segments); }
      if(i<segments) { const a=i*2; indices.push(a,a+1,a+2,a+1,a+3,a+2); }
    }
    const geometry=new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3)); geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); geometry.setIndex(indices); geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,mat); mesh.receiveShadow=true; circuitWorld.add(mesh); return mesh;
  }
  function buildCircuitWorld(def){
    // Dispose only per-circuit resources; persistent shared textures/materials stay alive.
    const shared=new Set(Object.values(mats)),textures=new Set([grassTexture,asphaltTexture,gravelTexture]);
    const geometries=new Set(),materials=new Set(),maps=new Set();
    circuitWorld.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])if(!shared.has(m)){materials.add(m);if(m.map&&!textures.has(m.map))maps.add(m.map);}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());maps.forEach(t=>t.dispose());
    scene.remove(circuitWorld);circuitWorld=new THREE.Group();circuitWorld.name='circuit-'+def.id;scene.add(circuitWorld);
    scenerySeed=5721+TRACKS.indexOf(def)*419;
    const night=def.theme==='night';
    scene.background.set(night?'#111e37':def.theme==='desert'?'#dfcba4':def.theme==='coast'?'#afcfdf':'#b6c4bd');
    scene.fog.color.copy(scene.background);
    hemi.intensity=night?1.5:2.2;sun.intensity=night?1.4:3.1;sun.color.set(night?'#9cc7ff':'#ffe5bc');
    ground.material.color.set(def.theme==='desert'?'#dabc87':def.theme==='forest'?'#9dcc95':night?'#677b85':'#ffffff');
  const hw=def.halfWidth||8.5;   // semiancho del asfalto (circuits/<id>.json puede cambiarlo)
  ribbon(-(hw+5.5),hw+5.5,.005,new THREE.MeshStandardMaterial({map:gravelTexture,roughness:1,side:THREE.DoubleSide}));
  ribbon(-hw,hw,.025,new THREE.MeshStandardMaterial({map:asphaltTexture,roughness:.94,side:THREE.DoubleSide}));
  const lineMat=material(0xebe7cd,{side:THREE.DoubleSide});
  ribbon(-(hw-.25),-(hw-.41),.045,lineMat); ribbon(hw-.41,hw-.25,.045,lineMat);
  for(let s=0;s<trackLength;s+=5) {
    if(Math.abs(sample(s).curvature)>.003) {
      const kerbMat=Math.floor(s/5)%2 ? mats.cream:mats.red;
      ribbon(-(hw+.75),-hw,.07,kerbMat,s,s+5,3); ribbon(hw,hw+.75,.07,kerbMat,s,s+5,3);
    }
  }
  ribbon(10,25,.035,new THREE.MeshStandardMaterial({map:asphaltTexture,roughness:1,side:THREE.DoubleSide}),30,295,130);
  ribbon(24.5,24.7,.05,lineMat,30,295,100);
  ribbon(10,10.3,.05,lineMat,55,260,90);
  for(let s=68;s<260;s+=12) {
    const p=sample(s,10.5); const m=box(.55,.72,10,mats.concrete,p.p.x,.4,p.p.z); m.rotation.y=DM.atan2(p.tangent.x,p.tangent.z);
  }
  const startTexture=textureFromCanvas(256,64,(ctx,w,h)=>{ for(let x=0;x<16;x++) for(let y=0;y<4;y++){ctx.fillStyle=(x+y)%2?'#ebe9d4':'#222a24';ctx.fillRect(x*w/16,y*h/4,w/16,h/4);} });
  const startMark=new THREE.Mesh(new THREE.PlaneGeometry(hw*2,2.5),new THREE.MeshStandardMaterial({map:startTexture}));
  const startFrame=sample(0); startMark.rotation.x=-Math.PI/2; startMark.rotation.z=-DM.atan2(startFrame.tangent.x,startFrame.tangent.z); startMark.position.copy(startFrame.p).y=.08; circuitWorld.add(startMark);
  for(let i=0;i<10;i++) {
    const s=-8-Math.floor(i/2)*9, lane=i%2?3.2:-3.2;
    const p=sample(s,lane), group=new THREE.Group(); group.position.copy(p.p); group.rotation.y=DM.atan2(p.tangent.x,p.tangent.z); circuitWorld.add(group);
    box(3.2,.025,.13,lineMat,0,.065,-3.7,group); box(.13,.025,2.2,lineMat,-1.6,.065,-2.65,group); box(.13,.025,2.2,lineMat,1.6,.065,-2.65,group);
  }
  const railGeometry=new THREE.BoxGeometry(.4,.7,7.5);
  const railCount=Math.ceil(trackLength/8)*2;
  const rails=new THREE.InstancedMesh(railGeometry,mats.steel,railCount);
  const dummy=new THREE.Object3D(); let railIndex=0;
  for(let s=0;s<trackLength;s+=8) for(const side of [-1,1]) {
    const lane=side===1&&s<305?40:side*20;
    const p=sample(s,lane); dummy.position.copy(p.p).y=.7; dummy.rotation.set(0,DM.atan2(p.tangent.x,p.tangent.z),0); dummy.updateMatrix(); rails.setMatrixAt(railIndex++,dummy.matrix);
  }
  rails.count=railIndex; rails.receiveShadow=true; circuitWorld.add(rails);
  
  // --- Scenery: paddock, grandstands, billboards, trees and distant hills -----
  function signTexture(title,subtitle,bg='#23382d',fg='#eee7ce') {
    return textureFromCanvas(1024,256,(ctx,w,h)=>{
      ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.fillStyle=fg;ctx.fillRect(20,20,w-40,3);ctx.fillRect(20,h-23,w-40,3);
      ctx.textAlign='center';ctx.font='italic 900 112px Arial';ctx.fillText(title,w/2,143);ctx.font='bold 23px monospace';ctx.fillText(subtitle,w/2,195);
      for(let i=0;i<1300;i++){ctx.fillStyle=`rgba(0,0,0,${sceneryRandom()*.10})`;ctx.fillRect(sceneryRandom()*w,sceneryRandom()*h,2,2);}
    });
  }
  function sign(title,subtitle,s,lane,width=28,bg,fg) {
    const frame=sample(s,lane), group=new THREE.Group();group.position.copy(frame.p);group.rotation.y=DM.atan2(frame.tangent.x,frame.tangent.z);circuitWorld.add(group);
    const texture=signTexture(title,subtitle,bg,fg);
    const face=new THREE.Mesh(new THREE.PlaneGeometry(width,6),new THREE.MeshStandardMaterial({map:texture,side:THREE.DoubleSide,roughness:.7}));face.position.y=5;group.add(face);
    box(.4,7,.4,mats.steel,-width*.38,3.5,0,group);box(.4,7,.4,mats.steel,width*.38,3.5,0,group);
    return group;
  }
  sign(def.name,'LIGA RACING ONLINE',125,-31,38,'#e8dfc6','#283e30');
  sign('SUR','MOTOR OIL',475,-27,30,'#bc5032','#f6e3b8');
  sign('PAMPA','AGRO',830,28,25,'#e6d9b8','#2b4936');
  sign('VÉRTICE','SEGUROS',1100,-28,27,'#263d38','#e7d69e');
  const gantry=new THREE.Group();gantry.position.copy(startFrame.p);gantry.rotation.y=DM.atan2(startFrame.tangent.x,startFrame.tangent.z);circuitWorld.add(gantry);
  box(.6,9,.6,mats.steel,-10,4.5,0,gantry);box(.6,9,.6,mats.steel,10,4.5,0,gantry);
  const gantryFace=new THREE.Mesh(new THREE.BoxGeometry(21,2.4,1.2),[mats.dark,mats.dark,mats.dark,mats.dark,new THREE.MeshStandardMaterial({map:signTexture('SERIE NACIONAL','CAMPEONATO GT3')}),mats.dark]);gantryFace.position.y=8.3;gantry.add(gantryFace);
  function localGroup(s,lane) { const f=sample(s,lane),g=new THREE.Group();g.position.copy(f.p);g.rotation.y=DM.atan2(f.tangent.x,f.tangent.z);circuitWorld.add(g);return g; }
  const pitBuilding=localGroup(170,36);
  box(16,7,175,material(0xc0bfa8),0,3.5,0,pitBuilding);
  box(18,.6,180,mats.roof,0,7.25,0,pitBuilding);
  box(14,3.5,55,material(0xddd9c1),0,9,40,pitBuilding);
  box(15,.4,57,mats.dark,0,10.9,40,pitBuilding);
  const windowMat=material(0x506963,{metalness:.55,roughness:.25});
  for(let z=-75;z<80;z+=13) {
    box(.07,4.5,9,mats.dark,-8.04,2.7,z,pitBuilding);
    box(.1,.5,9,mats.red,-8.09,5.1,z,pitBuilding);
    box(.1,1.1,8,windowMat,-8.08,6.1,z,pitBuilding);
  }
  for(let z=20;z<66;z+=8)box(.1,2,6,windowMat,-7.08,9,z,pitBuilding);
  const crowdPositions=[];
  function grandstand(s,lane,length,reverse=false) {
    const g=localGroup(s,lane);if(reverse)g.rotation.y+=Math.PI;
    for(let step=0;step<5;step++) {
      box(2.7,.7,length,mats.concrete,step*2.3,step*.85+.4,0,g);
      box(.2,1.3,length,mats.steel,step*2.3+1.3,step*.85+1.1,0,g);
      for(let z=-length/2+1;z<length/2;z+=1.3) {
        if(sceneryRandom()>.12) {const v=new V3(step*2.3,step*.85+1.1,z);g.localToWorld(v);crowdPositions.push(v);}
      }
    }
    for(let z=-length/2;z<=length/2;z+=12)box(.28,8,.28,mats.steel,10,4,z,g);
    const roof=box(16,.35,length+4,mats.roof,4.5,8.3,0,g);roof.rotation.z=-.08;
    box(.3,1.3,length+4,mats.red,-3.5,7.7,0,g);
  }
  grandstand(115,-33,100,true);grandstand(trackLength-65,-34,58,true);grandstand(555,-32,52,true);
  const audience=new THREE.InstancedMesh(new THREE.BoxGeometry(.48,.85,.4),material(0xffffff),crowdPositions.length);
  crowdPositions.forEach((p,i)=>{dummy.position.copy(p);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();audience.setMatrixAt(i,dummy.matrix);audience.setColorAt(i,new THREE.Color([0xc6b78b,0x546f78,0x984a36,0xd0d1b8,0x34493b][i%5]));});circuitWorld.add(audience);
  const trees=[];
  for(let attempt=0;attempt<1700&&trees.length<(Number.isFinite(def.treeCount)?Math.max(0,Math.min(320,def.treeCount)):def.theme==='desert'?24:210);attempt++) {
    const x=(sceneryRandom()-.5)*1400,z=(sceneryRandom()-.5)*1100;
    if(track.some((f,i)=>i%24===0&&DM.hypot(f.p.x-x,f.p.z-z)<55))continue;
    if(z>145&&z<200&&x>-250&&x<160)continue;
    trees.push([x,z,7+sceneryRandom()*9]);
  }
  const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.35,.6,1,6),material(0x665842),trees.length);
  const foliage=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),material(/^#[0-9a-f]{6}$/i.test(def.foliageColor||'')?parseInt(def.foliageColor.slice(1),16):def.theme==='forest'?0x275942:0x4d6342),trees.length*2);
  trees.forEach(([x,z,h],i)=>{
    dummy.position.set(x,h*.35,z);dummy.rotation.set(0,0,0);dummy.scale.set(1,h*.7,1);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
    for(let k=0;k<2;k++){dummy.position.set(x+k*1.6,h*.72+k*h*.13,z);dummy.scale.set(h*.35,h*.42,h*.32);dummy.updateMatrix();foliage.setMatrixAt(i*2+k,dummy.matrix);foliage.setColorAt(i*2+k,new THREE.Color().setHSL(.23+sceneryRandom()*.04,.19,.25+sceneryRandom()*.11));}
  });foliage.castShadow=true;circuitWorld.add(trunks,foliage);
  if(def.hills!==false)for(let i=0;i<16;i++){const hill=new THREE.Mesh(new THREE.SphereGeometry(1,24,12),material(0x849076));const angle=i/16*Math.PI*2;hill.position.set(DM.cos(angle)*1100,-40,DM.sin(angle)*1000);hill.scale.set(220+sceneryRandom()*200,120+sceneryRandom()*90,200);circuitWorld.add(hill);}
  for(let s=100;s<trackLength;s+=160){const g=localGroup(s,-22);box(.18,12,.18,mats.steel,0,6,0,g);box(4,.2,.2,mats.steel,1.7,12,0,g);box(1.2,.2,.8,mats.cream,3.3,11.8,0,g);}
  for(const s of [350,380,410,670,700])sign(String((Math.round(s/30)%3+1)*50),'',s,-12,2,'#eee6ca','#25382a');
  
  
    if(def.theme==='coast'){
      const water=new THREE.Mesh(new THREE.PlaneGeometry(1400,450),material(0x4698b1,{metalness:.5,roughness:.23}));
      water.rotation.x=-Math.PI/2;water.position.set(0,-.025,-520);circuitWorld.add(water);
    }
    if(def.theme==='city'||night){
      for(let i=0;i<22;i++){
        const a=i/22*Math.PI*2,x=DM.cos(a)*650,z=DM.sin(a)*460,h=25+(i*19%65);
        box(35,h,30,material(night?0x243c5b:0x8d9da5),x,h/2,z);
        if(night)for(let j=0;j<6;j++)box(27,.8,.1,new THREE.MeshBasicMaterial({color:j%2?0x8ed2fa:0xffe6a8}),x,5+j*h/7,z+15.1);
      }
    }
    if(night)for(let i=0;i<16;i++){
      const p=sample(i*trackLength/16,-23).p;
      const light=new THREE.PointLight(0xb9dfff,90,95,1.3);light.position.copy(p).y=12;circuitWorld.add(light);
    }
    if(def.skyColor&&/^#[0-9a-f]{6}$/i.test(def.skyColor)){scene.background.set(def.skyColor);scene.fog.color.copy(scene.background);}
    if(def.groundColor&&/^#[0-9a-f]{6}$/i.test(def.groundColor))ground.material.color.set(def.groundColor);
    // Decorado que trae circuits/<id>.json (placeholders de la IA de circuitos): primitivas simples por tipo.
    if(Array.isArray(def.props))for(const pr of def.props.slice(0,600)){
      try{
        const n=(v,a,b,d)=>Number.isFinite(+v)?Math.max(a,Math.min(b,+v)):d;
        const col=/^#[0-9a-f]{6}$/i.test(pr.color||'')?parseInt(pr.color.slice(1),16):0x8a8f86;
        const x=n(pr.x,-1500,1500,0),z=n(pr.z,-1500,1500,0),y=n(pr.y,-50,200,0),rot=n(pr.rot,-360,360,0)*Math.PI/180;
        let m=null;
        if(pr.type==='box'){const w=n(pr.w,.1,400,4),h=n(pr.h,.1,250,4),d=n(pr.d,.1,400,4);m=box(w,h,d,material(col),x,y+h/2,z);}
        else if(pr.type==='cylinder'||pr.type==='cone'){const r=n(pr.r,.1,120,2),h=n(pr.h,.1,250,6);m=new THREE.Mesh(new THREE.CylinderGeometry(pr.type==='cone'?0:r,r,h,16),material(col));m.position.set(x,y+h/2,z);circuitWorld.add(m);}
        else if(pr.type==='sphere'){const r=n(pr.r,.1,200,3);m=new THREE.Mesh(new THREE.SphereGeometry(r,18,12),material(col));m.scale.y=n(pr.squash,.1,3,1);m.position.set(x,y+r*m.scale.y,z);circuitWorld.add(m);}
        else if(pr.type==='tree'){const h=n(pr.h,2,60,10),g=new THREE.Group();const tr=new THREE.Mesh(new THREE.CylinderGeometry(.3,.5,h*.45,6),material(0x665842));tr.position.y=h*.22;const top=new THREE.Mesh(pr.shape==='pine'?new THREE.ConeGeometry(h*.28,h*.75,8):new THREE.IcosahedronGeometry(h*.34,1),material(col));top.position.y=h*(pr.shape==='pine'?.65:.66);g.add(tr,top);g.position.set(x,y,z);circuitWorld.add(g);m=g;}
        else if(pr.type==='water'){const w=n(pr.w,1,2500,100),d=n(pr.d,1,2500,100);m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),material(col,{metalness:.5,roughness:.23}));m.rotation.x=-Math.PI/2;m.position.set(x,y-.02,z);circuitWorld.add(m);}
        else if(pr.type==='grandstand'){grandstand(n(pr.s,0,trackLength,0),n(pr.lane,-120,120,-33),n(pr.length,10,300,60),!!pr.reverse);}
        else if(pr.type==='sign'){sign(String(pr.text||'').slice(0,18),String(pr.sub||'').slice(0,34),n(pr.s,0,trackLength,0),n(pr.lane,-120,120,-27),n(pr.width,4,60,26),pr.bg,pr.fg);}
        if(m&&pr.type!=='grandstand'&&pr.type!=='sign'&&pr.type!=='water')m.rotation.y=rot;
      }catch(e){console.warn('[circuits] prop ignorado',pr,e);}
    }
  }
  
  // One vehicle factory: the exact same body, proportions and details as the garage.
  const tireMat=material(0x171b18,{roughness:.93});
  const glassMat=material(0x273e3c,{metalness:.5,roughness:.18});
  function createCar(driver,index,team){
    const model=RacingArt.car(team.bodyType,liveryFor(team),driver.number);
    scene.add(model.group);
    return model;
  }
  window.isRaceBusy=()=>state.phase==='race'||state.phase==='countdown';
  window.refreshPlayerBody=()=>{if(!window.isRaceBusy())resetRace();};
  
  // --- Particle pool: dust, lockup smoke, contact sparks ---------------------
  const particleCount=180;
  const particlePositions=new Float32Array(particleCount*3);
  const particleColors=new Float32Array(particleCount*3);
  const particles=Array.from({length:particleCount},()=>({life:0,max:1,v:new V3()}));
  particlePositions.fill(-1000);
  const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));particleGeo.setAttribute('color',new THREE.BufferAttribute(particleColors,3));
  const smokeTexture=textureFromCanvas(64,64,(ctx)=>{const grad=ctx.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'#fff9');grad.addColorStop(.4,'#fff4');grad.addColorStop(1,'#fff0');ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);});
  const particleCloud=new THREE.Points(particleGeo,new THREE.PointsMaterial({size:3.5,map:smokeTexture,transparent:true,depthWrite:false,vertexColors:true,opacity:.65}));scene.add(particleCloud);
  let particleCursor=0;
  function emit(car,type,count=5) {
    for(let k=0;k<count;k++) {
      const i=particleCursor++%particleCount,p=particles[i];p.life=p.max=type==='spark'?.35:1.5+Math.random();
      const point=car.mesh.group.position;particlePositions.set([point.x+(Math.random()-.5)*2,.35,point.z+(Math.random()-.5)*2],i*3);
      p.v.set((Math.random()-.5)*4,1+Math.random()*2,(Math.random()-.5)*4);
      const color=new THREE.Color(type==='spark'?0xffbc4a:type==='dust'?0xb5a47a:0xc9cdc2);particleColors.set([color.r,color.g,color.b],i*3);
    }
  }
  function updateParticles(dt) {
    particles.forEach((p,i)=>{if(p.life>0){p.life-=dt;particlePositions[i*3]+=p.v.x*dt;particlePositions[i*3+1]+=p.v.y*dt;particlePositions[i*3+2]+=p.v.z*dt;if(p.life<=0)particlePositions[i*3+1]=-1000;}});
    particleGeo.attributes.position.needsUpdate=true;particleGeo.attributes.color.needsUpdate=true;
  }
  
  // --- Weather engine: rolls off the current track's rain chance, can drift ---
  const WEATHER_ORDER=['CLEAR','CLOUDY','LIGHT_RAIN','RAIN','HEAVY_RAIN','DRYING'];
  function rollInitialWeather(trackDef){
    const r=SRAND();
    if(r<trackDef.wetChance*.4) return 'RAIN';
    if(r<trackDef.wetChance) return 'LIGHT_RAIN';
    if(r<trackDef.wetChance+.25) return 'CLOUDY';
    return 'CLEAR';
  }
  function setWeather(key){
    CURRENT_WEATHER_KEY=key;
    CURRENT_WEATHER_GRIP=WEATHER_STATES[key].grip;
    const info=WEATHER_STATES[key];
    $('rc-weather-icon').textContent=info.icon;$('rc-weather-label').textContent=info.label;
    $('rc-weather-detail').textContent=`PISTA ${Math.round(CURRENT_TRACK.tempBase+(key==='CLEAR'?4:key.includes('RAIN')?-3:0))}°C`;
  }
  function maybeShiftWeather(dt){
    if(SRAND()>=dt*.01)return;
    const idx=WEATHER_ORDER.indexOf(CURRENT_WEATHER_KEY);
    const wetBias=CURRENT_TRACK.wetChance;
    let next=CURRENT_WEATHER_KEY;
    if(CURRENT_WEATHER_KEY==='CLEAR')next=SRAND()<wetBias*.5?'CLOUDY':'CLEAR';
    else if(CURRENT_WEATHER_KEY==='CLOUDY')next=SRAND()<wetBias?'LIGHT_RAIN':(SRAND()<.3?'CLEAR':'CLOUDY');
    else if(CURRENT_WEATHER_KEY==='LIGHT_RAIN')next=SRAND()<.4?'RAIN':(SRAND()<.3?'DRYING':'LIGHT_RAIN');
    else if(CURRENT_WEATHER_KEY==='RAIN')next=SRAND()<.25?'HEAVY_RAIN':(SRAND()<.25?'LIGHT_RAIN':'RAIN');
    else if(CURRENT_WEATHER_KEY==='HEAVY_RAIN')next=SRAND()<.3?'RAIN':'HEAVY_RAIN';
    else if(CURRENT_WEATHER_KEY==='DRYING')next=SRAND()<.4?'CLEAR':(SRAND()<.2?'CLOUDY':'DRYING');
    if(next!==CURRENT_WEATHER_KEY){setWeather(next);addEvent('CAMBIO DE CLIMA',`El tiempo pasa a ${WEATHER_STATES[next].label}.`,null,60);}
  }
  
  // --- Racing simulation ------------------------------------------------------
  function qualiPace(driver,team){
    const setupBonus=team.isPlayer?(Career.practice.score/100)*(Career.practice.confidence/100):0;
    const eff=effectiveStats(driver,team,setupBonus);
    const rnd=(SRAND()-.5)*.06;
    return 100-(eff.top*30+eff.corner*35+eff.brake*15+eff.control*10+driver.stats[1]*10)+rnd*40;
  }
  function runQualifying(){
    if(Career.qualifyingDoneRound===currentRound(Career).round)return;
    const grid=buildGrid();
    const timed=grid.map(entry=>({entry,pace:qualiPace(entry.driver,entry.team)})).sort((a,b)=>a.pace-b.pace);
    state.grid=timed.map(t=>t.entry);
    state.poleTeamId=state.grid[0].team.id;
    Career.qualifyingDoneRound=currentRound(Career).round;
    if(state.grid[0].team.isPlayer)playerTeam(Career).poles=(playerTeam(Career).poles||0);
    saveCareer(Career);
    addEvent('CLASIFICACIÓN','La grilla queda definida para la carrera.',null,40);
    resetRace();
    GameUI.openModal(`<div class="eyebrow">CLASIFICACIÓN · VUELTA ÚNICA</div><h2 id="modal-title">GRILLA DE SALIDA</h2><table class="roster"><thead><tr><th>POS</th><th>EQUIPO</th><th>PILOTO</th></tr></thead><tbody>${timed.map((t,i)=>`<tr><td>${i+1}</td><td>${t.entry.team.name}</td><td>${t.entry.driver.name.toUpperCase()}</td></tr>`).join('')}</tbody></table>`);
  }
  function buildGrid(){
    return Career.teams.map(team=>({team,driver:activeDriver(Career,team)}));
  }
  function resetRace() {
    state.cars.forEach(c=>{scene.remove(c.mesh.group);c.mesh.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const all=Array.isArray(o.material)?o.material:[o.material];all.forEach(m=>{if(m!==tireMat&&m!==glassMat&&!Object.values(mats).includes(m)){if(m.map)m.map.dispose();m.dispose();}});}});});
    Object.assign(state,{phase:'grid',elapsed:0,countdown:0,paused:false,cameraTimer:0,cameraShot:0,focus:0,focusLocked:false,excitement:0,events:[],eventUntil:0,fastest:Infinity,fastestCarId:-1,finishes:[],dnfCars:[],lastBattle:-20,lastContact:-20,finishAt:0,safetyCar:false,vsc:false,redFlag:false});
    CURRENT_TRACK=currentTrack(Career);
    setCircuit(CURRENT_TRACK);
    setWeather(rollInitialWeather(CURRENT_TRACK));
    CONFIG.strategy=Career.regulations.mandatoryPit?'pit':'sprint';
    const grid=state.grid&&state.grid.length===10?state.grid:buildGrid();
    state.grid=grid;
    state.cars=grid.map((entry,i)=>{
      const {driver,team}=entry;
      let startSlot=i;
      if(team.isPlayer&&team.gridPenaltyNext)startSlot=Math.min(9,i+5);
      const setupBonus=team.isPlayer?(Career.practice.score/100)*(Career.practice.confidence/100):0;
      const eff=effectiveStats(driver,team,setupBonus);
      return {id:i,driver,team,top:eff.top,accel:eff.accel,brake:eff.brake,corner:eff.corner,control:eff.control,aggression:eff.aggression,consistency:eff.consistency,overtake:eff.overtake,mesh:createCar(driver,i,team),s:-8-Math.floor(startSlot/2)*9,v:0,lane:startSlot%2?3.2:-3.2,lateralV:0,targetLane:startSlot%2?3.2:-3.2,state:'Grid',lap:1,lapStart:0,lastLap:0,tire:team.isPlayer?Career.strategy.compound:(i%3===0?'S':i%3===1?'M':'H'),wear:100,damage:0,dnf:false,fuel:100,commands:{pace:'standard',tyres:'standard',pit:'stay',overtake:'standard',fuel:'standard'},errorTimer:0,errorCooldown:12+SRAND()*20,spin:0,spinDirection:1,pitLap:team.isPlayer?Math.max(2,Math.floor(CONFIG.laps/2)):Math.max(2,Math.floor(CONFIG.laps*(.3+((i*7)%10)/10*.4))),pitDone:false,pitStage:0,pitTimer:0,pitStopS:0,finished:false,finishTime:0,rank:i+1,previousRank:i+1,decisionTimer:SRAND()*.4,attackCooldown:0,pace:.97+SRAND()*.06,slipstream:false,lastEvent:-20,position:new V3(),yaw:0,speedHistory:[]};
    });
    state.order=[...state.cars];buildStandings();buildMap();updateCarsVisual(0);updateUI();updateRaceMeta();
    $('intro').style.display='block';$('start-lights').style.display='none';$('event-overlay').classList.remove('show');$('modal-backdrop').classList.remove('open');$('safety-badge').classList.remove('show');
    $('event-log').innerHTML='<div class="log-item"><span class="log-time">—</span><div><strong>El silencio antes de la largada.</strong><br>Diez escuderías. Una sola bandera a cuadros.</div></div>';
    camera.position.copy(sample(-48,-38).p).add(new V3(0,17,0));camera.lookAt(sample(-14).p.clone().add(new V3(0,1,0)));
    cameraAim.copy(sample(-14).p);state.cameraTimer=0;
    particles.forEach((p,i)=>{p.life=0;particlePositions[i*3+1]=-1000;});
    $('commands-panel').style.display='none';
  }
  function updateRaceMeta(){
    const round=currentRound(Career);
    $('rc-round-label').textContent='FECHA '+String(round.round).padStart(2,'0');
    $('rc-title').textContent=CURRENT_TRACK.name+' · '+CURRENT_TRACK.desc.toUpperCase();
    $('rc-track-name').textContent=CURRENT_TRACK.name;
    $('rc-track-country').textContent=CURRENT_TRACK.country;
    $('rc-circuit-name').innerHTML=CURRENT_TRACK.name.replace(' ','<br>');
    $('rc-track-tag').textContent='CIRCUITO Nº '+String((Career.calendar.indexOf(round)%TRACKS.length)+1).padStart(2,'0');
    $('quali-button').disabled=Career.qualifyingDoneRound===round.round;
  }
  function addEvent(title,detail,car=null,intensity=20) {
    const event={title,detail,time:state.elapsed};state.events.unshift(event);window.LROcast&&window.LROcast(title,detail);state.events=state.events.slice(0,40);
    state.excitement=Math.max(state.excitement,intensity);state.eventUntil=performance.now()+4300;
    $('event-title').textContent=title;$('event-detail').textContent=detail;$('event-overlay').classList.add('show');
    $('event-log').innerHTML=state.events.slice(0,10).map(e=>`<div class="log-item"><span class="log-time">${formatTime(e.time)}</span><div><strong>${e.title}</strong><br>${e.detail}</div></div>`).join('');
    if(car&&state.cameraMode==='auto'&&!state.focusLocked&&state.phase==='race') {state.focus=car.id;if(intensity>=35){state.cameraTimer=0;state.cameraShot=car.state==='Spin'?3:1;}}
  }
  function startRace() {
    if(state.phase==='grid'&&window.LROstudio&&!startRace._go){window.LROstudio.pre(CURRENT_TRACK,()=>{startRace._go=true;startRace();startRace._go=false;});return;}
    if(state.phase==='grid') {
      state.phase='countdown';state.countdown=0;$('intro').style.display='none';$('start-lights').style.display='flex';
      addEvent('MOTORES ENCENDIDOS',CURRENT_TRACK.name+' espera la largada.',null,0);
      audio.init();
      $('commands-panel').style.display='block';renderCommandPanel();
    } else if(state.phase==='race'||state.phase==='countdown') {state.paused=!state.paused;}
    else {showRoundResults();}
    updateUI();
  }
  function targetCornerSpeed(car,distance) {
    const curvature=Math.abs(sample(distance).curvature);
    const wearGrip=.88+.12*car.wear/100;
    const trackGrip=CURRENT_TRACK.gripMod*CURRENT_WEATHER_GRIP;
    const cmdGrip=car.commands&&car.commands.tyres==='push'?1.03:car.commands&&car.commands.tyres==='save'?.97:1;
    return Math.min(64+car.top*10,Math.sqrt((17+car.corner*8*CURRENT_TRACK.aeroMod)*TIRES[car.tire].grip*wearGrip*trackGrip*cmdGrip/Math.max(.0007,curvature)));
  }
  function decide(car) {
    const curvature=sample(car.s+20).curvature;
    const front=state.cars.filter(other=>other!==car&&!other.finished&&!other.pitStage&&other.s>car.s&&other.s-car.s<65).sort((a,b)=>a.s-b.s)[0];
    const behind=state.cars.find(other=>other!==car&&!other.pitStage&&car.s-other.s>0&&car.s-other.s<15&&Math.abs(other.lane)>2.3);
    const baseLane=clamp(-Math.sign(curvature)*Math.min(2.2,Math.abs(curvature)*150),-2.2,2.2);
    car.targetLane=baseLane;car.state=Math.abs(curvature)>.008?'Cornering':'Racing';
    let aggression=car.aggression;
    if(car.commands){if(car.commands.overtake==='attack')aggression=Math.min(1,aggression+.15);else if(car.commands.overtake==='defend')aggression=Math.max(0,aggression-.15);}
    if(front) {
      const distance=front.s-car.s;
      if(distance<29&&(car.v>front.v-.6||aggression>.82)) {
        const preferred=car.attackCooldown>0?Math.sign(car.lane||1):Math.sign(curvature||1)*(SRAND()<car.overtake?1:-1);
        let lane=front.lane+preferred*3.8;
        if(Math.abs(lane)>6)lane=front.lane-preferred*3.8;
        const blocked=state.cars.some(o=>o!==car&&o!==front&&Math.abs(o.s-car.s)<9&&Math.abs(o.lane-lane)<2.9);
        if(!blocked) {car.targetLane=clamp(lane,-6.15,6.15);car.state='Overtaking';car.attackCooldown=3;}
      }
      if(distance<16&&state.elapsed-state.lastBattle>18) {
        const pack=state.cars.filter(o=>Math.abs(o.s-car.s)<23&&!o.pitStage);
        if(pack.length>=3&&state.elapsed>8) {state.lastBattle=state.elapsed;addEvent('BATALLA A TRES',`${car.driver.short}, ${front.driver.short} y una posición en juego.`,car,65);}
      }
    }
    if(behind&&car.state!=='Overtaking'&&aggression>.78&&Math.abs(behind.lane-baseLane)>2) {
      car.targetLane=clamp(behind.lane*.7,-3.7,3.7);car.state='Defending';
    }
    if(car.pitStage)car.targetLane=PIT_FAST;
  }
  const PIT_BOX=14,PIT_FAST=21;
  // en el pit lane los autos hacen cola: nadie atraviesa a otro (se limita la velocidad al del que va adelante en el mismo carril)
  function pitQueueLimit(car,wanted){
    for(const o of state.cars){
      if(o===car||!o.pitStage||o.finished)continue;
      const gap=o.s-car.s;
      if(gap>0&&gap<13&&Math.abs(o.lane-car.lane)<3.2)wanted=Math.min(wanted,gap<8?0:Math.max(0,o.v));
    }
    return wanted;
  }
  function updateCar(car,dt) {
    if(car.finished){car.v=Math.max(0,car.v-dt*8);car.s+=car.v*dt;return;}
    car.errorCooldown-=dt;car.attackCooldown-=dt;car.decisionTimer-=dt;
    if(car.decisionTimer<=0){decide(car);car.decisionTimer=.22+SRAND()*.16;}
    const lapDistance=mod(car.s,trackLength);
    if(CONFIG.strategy==='pit'&&!car.pitDone&&car.lap>=car.pitLap&&lapDistance>32&&lapDistance<55&&car.s>0){car.pitStage=1;car.pitStopS=Math.floor(car.s/trackLength)*trackLength+155+car.id*9;car.state='PitEntry';addEvent('PIT ENTRY',`${car.driver.short} toma el camino de boxes.`,car,20);}
    if(car.commands&&car.commands.pit==='now'&&!car.pitStage&&!car.pitDone){car.pitStage=1;car.pitStopS=Math.floor(car.s/trackLength)*trackLength+155+car.id*9;car.state='PitEntry';addEvent('PIT NOW',`${car.driver.short} entra por orden del equipo.`,car,30);}
    const paceCmd=car.commands?car.commands.pace:'standard';
    const fuelCmd=car.commands?car.commands.fuel:'standard';
    let maxSpeed=(64+car.top*10)*car.pace*(1-car.damage*.08)*(paceCmd==='push'?1.03:paceCmd==='conserve'?.95:1)*(fuelCmd==='save'?.97:fuelCmd==='push'?1.015:1);
    if(car.fuel<=8)maxSpeed*=.85;
    car.slipstream=false;
    const front=state.cars.filter(other=>other!==car&&!other.finished&&Math.abs(other.lane-car.lane)<2.9&&other.s>car.s&&other.s-car.s<55).sort((a,b)=>a.s-b.s)[0];
    if(front&&!car.pitStage&&car.v>35&&Math.abs(sample(car.s).curvature)<.004) {car.slipstream=true;maxSpeed*=1.065;}
    const braking=(15+car.brake*9)*(.82+.18*car.wear/100)*CURRENT_TRACK.brakingMod*CURRENT_WEATHER_GRIP;
    let wanted=maxSpeed;
    for(const distance of [0,20,45,75,110]) {const cornerSpeed=targetCornerSpeed(car,car.s+distance);wanted=Math.min(wanted,Math.sqrt(cornerSpeed*cornerSpeed+2*braking*distance));}
    wanted*=.93+.07*car.wear/100;
    if(car.state==='Overtaking')wanted*=1.008+car.overtake*.009;
    if(state.safetyCar&&!car.pitStage)wanted=Math.min(wanted,30);
    else if(state.vsc&&!car.pitStage)wanted=Math.min(wanted,42);
    if(front&&!car.pitStage) {
      const gap=front.s-car.s;
      if(gap<10+car.v*.14&&Math.abs(front.lane-car.lane)<2.9)wanted=Math.min(wanted,Math.max(0,front.v+(gap-7)*1.5));
    }
    if(car.pitStage===1) {
      car.targetLane=(car.pitStopS-car.s<30)?PIT_BOX:PIT_FAST;car.state='PitEntry';wanted=Math.min(16,Math.sqrt(Math.max(0,2*braking*(car.pitStopS-car.s))));
      if(car.pitStopS-car.s<.8&&car.v<3){car.pitStage=2;car.pitTimer=(4.5+SRAND()*2)*(state.safetyCar?.55:1);car.v=0;addEvent('PARADA EN BOXES',`${car.driver.short} · neumáticos nuevos.`,car,35);}
    }
    if(car.pitStage===2) {
      car.state='PitStop';car.v=0;car.pitTimer-=dt;
      if(car.pitTimer<=0){car.pitStage=3;car.wear=100;car.tire=car.lap>=CONFIG.laps-6?'S':(SRAND()<.5?'M':'H');car.pitDone=true;if(car.commands)car.commands.pit='stay';addEvent('SALE DE BOXES',`${car.driver.short} vuelve a la pelea.`,car,25);}
      return;
    }
    if(car.pitStage===3){car.state='PitExit';wanted=17;car.targetLane=lapDistance<265?(car.s-car.pitStopS<7?PIT_BOX:PIT_FAST):0;if(lapDistance>292){car.pitStage=0;car.targetLane=0;}}
    if(car.pitStage===1||car.pitStage===3)wanted=pitQueueLimit(car,wanted);
    const curvature=Math.abs(sample(car.s).curvature);
    const weatherRisk=2-CURRENT_WEATHER_GRIP;
    if(car.errorCooldown<=0&&!car.pitStage&&car.v>25&&curvature>.008) {
      const risk=(1-car.consistency)*.042*(1+(100-car.wear)/65)*weatherRisk;
      if(SRAND()<risk*dt) {
        const close=state.cars.some(o=>o!==car&&Math.abs(o.s-car.s)<10);
        const spins=SRAND()<(close?.24:.10)*(1.2-car.control*.3);
        car.errorTimer=spins?2.8:1.7;car.spin=spins?Math.PI*2:0;car.spinDirection=SRAND()<.5?-1:1;
        car.targetLane=(Math.sign(car.lane)||1)*10.3;car.state=spins?'Spin':'Recovering';car.errorCooldown=30+SRAND()*25;
        addEvent(spins?'SPIN':'BLOQUEO DE FRENOS',`${car.driver.short} ${spins?'pierde el auto.':'se pasa en la frenada.'}`,car,spins?80:45);audio.effect(spins?'skid':'brake');
      }
    }
    if(car.errorTimer>0) {
      car.errorTimer-=dt;car.state=car.spin?'Spin':'Recovering';wanted*=car.spin?.18:.65;car.targetLane=(Math.sign(car.lane)||1)*10;
      if(SRAND()<dt*15)emit(car,Math.abs(car.lane)>8.5?'dust':'smoke',2);
      if(car.errorTimer<=0){car.spin=0;car.targetLane=0;car.state='Recovering';}
    }
    if(Math.abs(car.lane)>8.5&&!car.pitStage)wanted*=.68;
    if(car.v>wanted+2&&car.state==='Racing')car.state='Braking';
    else if(car.v<wanted-5&&car.state==='Racing')car.state='Accelerating';
    const acceleration=car.v<wanted?(7+car.accel*5)*(1-car.v/115): -braking;
    car.v=Math.max(0,car.v+clamp(wanted-car.v,Math.min(0,acceleration*dt),Math.max(0,acceleration*dt)));
    const lateralAccel=clamp((car.targetLane-car.lane)*4.5-car.lateralV*4,-6-car.control*3,6+car.control*3);
    car.lateralV=clamp(car.lateralV+lateralAccel*dt,-3.2,3.2);car.lane+=car.lateralV*dt;
    car.s+=car.v*dt;
    const tyreCmdWear=car.commands&&car.commands.tyres==='push'?1.3:car.commands&&car.commands.tyres==='save'?.72:1;
    car.wear=Math.max(8,car.wear-dt*TIRES[car.tire].wear*(car.state==='Overtaking'?1.4:1)*tyreCmdWear*(2-CURRENT_WEATHER_GRIP*.4));
    const fuelBurn=(paceCmd==='push'||fuelCmd==='push'?1.35:fuelCmd==='save'?.68:1)*(car.v/95);
    car.fuel=Math.max(0,car.fuel-dt*fuelBurn*(100/(CONFIG.laps*70)));
    car.speedHistory.push(car.v*3.6);if(car.speedHistory.length>60)car.speedHistory.shift();
    // Mechanical reliability ties directly to the team's accumulated engine usage.
    const reliability=1-clamp((car.team.componentUsage.engine)/(Career.regulations.componentLimit*2.4),0,.22);
    if(state.elapsed>15&&!car.dnf&&SRAND()<dt*(1-reliability)*.0022) {
      car.dnf=true;car.finished=true;car.finishTime=state.elapsed;car.v=0;
      addEvent('ABANDONO MECÁNICO',`${car.driver.short} se detiene en pista. Problema de fiabilidad.`,car,85);
    }
    const newLap=Math.floor(Math.max(0,car.s)/trackLength)+1;
    if(newLap>car.lap) {
      car.lastLap=state.elapsed-car.lapStart;car.lapStart=state.elapsed;car.lap=newLap;
      if(car.lastLap<state.fastest&&car.lap>2&&!car.pitStage){state.fastest=car.lastLap;state.fastestCarId=car.id;addEvent('VUELTA RÁPIDA',`${car.driver.short} · ${formatLap(car.lastLap)}`,car,35);}
      if(newLap===Math.floor(CONFIG.laps/2)+1&&state.order[0]===car&&window.LROstudio)HALFHIT=true;
      if(newLap===CONFIG.laps&&state.order[0]===car)addEvent('ÚLTIMA VUELTA','Una vuelta. Todo por decidir.',car,85);
      if(newLap>CONFIG.laps) {
        car.finished=true;car.finishTime=state.elapsed;car.rank=state.finishes.length+1;state.finishes.push(car);
        if(state.finishes.length===1){state.finishAt=state.elapsed;addEvent('BANDERA A CUADROS',`${car.team.name.toUpperCase()} GANA EN ${CURRENT_TRACK.name}.`,car,100);}
      }
    }
  }
  function resolveContacts(dt) {
    for(let i=0;i<state.cars.length;i++)for(let j=i+1;j<state.cars.length;j++) {
      const a=state.cars[i],b=state.cars[j];if(a.finished||b.finished)continue;
      const ds=b.s-a.s,dl=b.lane-a.lane;
      if(Math.abs(ds)<5.8&&Math.abs(dl)<2.78) {
        const lateralOverlap=2.78-Math.abs(dl), longitudinalOverlap=5.8-Math.abs(ds);
        const impact=Math.abs(a.v-b.v)+Math.abs(a.lateralV-b.lateralV);
        if(lateralOverlap<longitudinalOverlap) {
          const sign=Math.sign(dl)||1; a.lane-=sign*lateralOverlap*.5;b.lane+=sign*lateralOverlap*.5;
          a.lateralV-=sign*.5;b.lateralV+=sign*.5;a.v*=1-.018*dt;b.v*=1-.018*dt;
        } else {
          const rear=ds>0?a:b,front=ds>0?b:a;
          rear.s-=longitudinalOverlap*.65;front.s+=longitudinalOverlap*.35;
          const shared=(rear.v+front.v)/2;rear.v=Math.min(rear.v,shared-.2);front.v=Math.max(front.v,shared);
        }
        if(impact>4&&!a.pitStage&&!b.pitStage&&state.elapsed-state.lastContact>12&&state.elapsed>4) {
          state.lastContact=state.elapsed;a.damage=Math.min(1,a.damage+.07);b.damage=Math.min(1,b.damage+.07);
          a.mesh.paint.color.multiplyScalar(.98);emit(a,'spark',10);audio.effect('contact');
          addEvent('CONTACTO',`${a.driver.short} y ${b.driver.short} se rozan. Ambos continúan.`,a,65);
          if(impact>10&&SRAND()<(a.aggression-.6)*.2){a.errorTimer=2.6;a.spin=Math.PI*2;a.state='Spin';addEvent('SPIN',`${a.driver.short} pierde adherencia después del contacto.`,a,80);}
          if(impact>13&&SRAND()<.08&&!state.redFlag&&!state.safetyCar){
            state.redFlag=true;state.redFlagRealEndsAt=SIMT+7000;state.paused=true;
            state.cars.forEach(c=>{c.wear=100;c.damage=Math.max(0,c.damage-.3);});
            addEvent('BANDERA ROJA','Incidente grave. La carrera se detiene brevemente.',a,100);
          }
        }
      }
    }
  }
  function maybeTriggerIncidentEvents(dt){
    if(state.safetyCar){if(state.elapsed>state.safetyCarEndsAt){state.safetyCar=false;addEvent('SE APAGA EL SAFETY CAR','Pista libre. Vuelve la competencia real.',null,50);}return;}
    if(state.vsc){if(state.elapsed>state.vscEndsAt){state.vsc=false;addEvent('FIN DEL VSC','Los pilotos recuperan el ritmo total.',null,35);}return;}
    if(state.redFlag)return;
    const severeCount=state.cars.filter(c=>c.damage>.4&&!c.finished).length;
    const spinCount=state.cars.filter(c=>c.state==='Spin').length;
    const risk=dt*(.0012+severeCount*.004+spinCount*.01+(CURRENT_WEATHER_GRIP<.8?.002:0));
    if(state.elapsed>10&&SRAND()<risk){
      if(severeCount>=2||SRAND()<.35){state.safetyCar=true;state.safetyCarEndsAt=state.elapsed+22+SRAND()*10;addEvent('SAFETY CAR','El coche de seguridad sale a pista. Se abre la ventana de boxes.',null,90);}
      else{state.vsc=true;state.vscEndsAt=state.elapsed+12+SRAND()*8;addEvent('SAFETY CAR VIRTUAL','Velocidad controlada en toda la pista.',null,70);}
    }
  }
  function updateRace(dt) {
    if(state.paused)return;
    if(state.phase==='countdown') {
      const previous=Math.floor(state.countdown);state.countdown+=dt;
      document.querySelectorAll('#start-lights i').forEach((light,i)=>light.classList.toggle('on',state.countdown>=i*.75+.3));
      if(Math.floor(state.countdown)!==previous)audio.effect('beep');
      if(state.countdown>4.9){state.phase='race';$('start-lights').style.display='none';addEvent('¡LARGARON!','Comienza la carrera.',null,45);audio.effect('start');}
      return;
    }
    if(state.phase!=='race')return;
    state.elapsed+=dt;state.excitement=Math.max(0,state.excitement-dt*4);
    maybeShiftWeather(dt);maybeTriggerIncidentEvents(dt);
    state.cars.forEach(car=>updateCar(car,dt));resolveContacts(dt);
    const unfinished=state.cars.filter(c=>!c.finished).sort((a,b)=>b.s-a.s);
    const dnfCars=state.cars.filter(c=>c.finished&&c.dnf).sort((a,b)=>b.s-a.s);
    state.dnfCars=dnfCars;
    state.order=[...state.finishes,...unfinished,...dnfCars];
    state.order.forEach((car,index)=>{
      car.previousRank=car.rank;car.rank=index+1;
      if(car.rank<car.previousRank&&state.elapsed>8&&!car.finished&&state.elapsed-car.lastEvent>6) {
        car.lastEvent=state.elapsed;
        const passed=state.order.find(o=>o!==car&&o.previousRank===car.rank);
        addEvent(car.rank===1?'CAMBIO DE LÍDER':'ADELANTAMIENTO',`${car.driver.short} ${passed?'supera a '+passed.driver.short:'avanza'} · P${car.rank}`,car,car.rank===1?90:55);
      }
    });
    if((state.finishes.length+dnfCars.length)===CONFIG.carCount||(state.finishAt&&state.elapsed-state.finishAt>40)) {
      state.phase='finished';state.paused=false;(window.LROstudio&&window.LROstudio.post(showRoundResults))||setTimeout(showRoundResults,1300);
    }
  }
  function updateCarsVisual(dt) {
    state.cars.forEach(car=>{
      const f=sample(car.s,car.lane);car.position.copy(f.p);car.mesh.group.position.copy(f.p);
      const spinAngle=car.spin?car.spin*(1-car.errorTimer/2.8)*car.spinDirection:0;
      car.yaw=DM.atan2(f.tangent.x,f.tangent.z);
      car.mesh.group.rotation.y=car.yaw+spinAngle+clamp(car.lateralV/Math.max(12,car.v),-.15,.15);
      car.mesh.body.rotation.z=lerp(car.mesh.body.rotation.z,clamp(-f.curvature*car.v*car.v*.0015,-.07,.07),.1);
      car.mesh.body.rotation.x=lerp(car.mesh.body.rotation.x,car.state==='Braking'?.022:car.state==='Accelerating'?-.012:0,.1);
      car.mesh.body.position.y=car.v>1?DM.sin(car.s*1.8)*.012*(Math.abs(car.lane)>8?.9:.3):0;
      car.mesh.wheels.forEach(wheel=>{wheel.rotation.x+=car.v*dt/.6;});
    });
  }
  
  // --- TV director: position-aware cameras with event and battle priority -----
  const cameraAim=new V3();
  function selectInterestingCar() {
    if(state.focusLocked)return state.cars[state.focus];
    if(state.finishes.length)return state.finishes[0];
    let best=state.order[0],score=-Infinity;
    state.cars.forEach(car=>{
      let interest=car.rank===1?14:0;
      const neighbours=state.cars.filter(o=>o!==car&&Math.abs(o.s-car.s)<22&&!o.pitStage);
      interest+=neighbours.length*20;
      if(car.state==='Overtaking')interest+=25;
      if(car.state==='Spin')interest+=65;
      if(car.state==='PitStop')interest+=15;
      if(car.lap===CONFIG.laps)interest+=car.rank<=2?40:0;
      if(interest>score){score=interest;best=car;}
    });
    state.excitement=Math.max(state.excitement,Math.min(100,score));return best;
  }
  function updateCamera(dt) {
    if(state.phase==='grid') {
      const t=performance.now()*.00006;
      const f=sample(-16); const desired=f.p.clone().addScaledVector(f.tangent,-34).addScaledVector(f.normal,-33).add(new V3(0,17+DM.sin(t)*2,0));
      camera.position.lerp(desired,.03);cameraAim.lerp(f.p.clone().addScaledVector(f.tangent,6),.03);camera.lookAt(cameraAim);return;
    }
    state.cameraTimer-=dt;
    if(state.cameraMode==='auto'&&state.cameraTimer<=0) {
      const car=selectInterestingCar();state.focus=car.id;
      state.cameraShot=(state.cameraShot+1)%4;state.cameraTimer=state.excitement>55?6:9;
    }
    const car=state.cars[state.focus]||state.order[0],f=sample(car.s,car.lane);
    let mode=state.cameraMode,shot=state.cameraShot;
    if(mode==='auto')mode=['track','chase','side','corner'][shot];
    let pos,aim=f.p.clone().add(new V3(0,1.1,0)),fov=46;
    if(mode==='onboard') {pos=f.p.clone().addScaledVector(f.tangent,.35).add(new V3(0,2.22,0));aim=f.p.clone().addScaledVector(f.tangent,65).add(new V3(0,1.5,0));fov=74;}
    else if(mode==='chase') {pos=f.p.clone().addScaledVector(f.tangent,-16).addScaledVector(f.normal,-5).add(new V3(0,7,0));aim.addScaledVector(f.tangent,10);fov=52;}
    else if(mode==='side') {pos=f.p.clone().addScaledVector(f.tangent,9).addScaledVector(f.normal,-23).add(new V3(0,5.4,0));aim.addScaledVector(f.tangent,2);fov=48;}
    else if(mode==='corner') {const station=sample(car.s+42,-29);pos=station.p.add(new V3(0,11,0));aim.addScaledVector(f.tangent,4);fov=43;}
    else {pos=f.p.clone().addScaledVector(f.tangent,30).addScaledVector(f.normal,-40).add(new V3(0,25,0));aim.addScaledVector(f.tangent,-6);fov=46;}
    if(mode==='onboard'){camera.position.copy(pos);cameraAim.copy(aim);}else{const smooth=1-DM.exp(-dt*3.8);camera.position.lerp(pos,smooth);cameraAim.lerp(aim,smooth);}
    camera.fov=lerp(camera.fov,fov,.06);camera.updateProjectionMatrix();camera.lookAt(cameraAim);
    const names={track:'PANORÁMICA',chase:'PERSECUCIÓN',side:'BATALLA',corner:'CURVA',onboard:'A BORDO'};
    $('camera-label').textContent=`CAM 0${shot+1} · ${names[mode]}`;
    $('onboard-hud').style.display=mode==='onboard'?'block':'none';
    sun.position.copy(f.p).add(new V3(-160,240,110));sun.target.position.copy(f.p);
  }
  
  // --- Web Audio: layered engine harmonics, air, tyres and transient impacts --
  const audio={ctx:null,muted:true,engines:[],master:null,noiseGain:null,lastGear:0,
    init(){
      if(this.ctx){this.ctx.resume();return;}
      const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
      this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:.38;this.master.connect(this.ctx.destination);
      const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=850;filter.Q.value=.6;filter.connect(this.master);this.filter=filter;
      for(let i=0;i<4;i++){const oscillator=this.ctx.createOscillator(),gain=this.ctx.createGain();oscillator.type=i===0?'sawtooth':'triangle';oscillator.frequency.value=45+i*10;gain.gain.value=i===0?.09:.035;oscillator.connect(gain);gain.connect(filter);oscillator.start();this.engines.push({oscillator,gain});}
      const buffer=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=SRAND()*2-1;
      this.noiseBuffer=buffer;const noise=this.ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;
      const noiseFilter=this.ctx.createBiquadFilter();noiseFilter.type='lowpass';noiseFilter.frequency.value=450;
      this.noiseGain=this.ctx.createGain();this.noiseGain.gain.value=.015;noise.connect(noiseFilter);noiseFilter.connect(this.noiseGain);this.noiseGain.connect(this.master);noise.start();
    },
    toggle(){this.init();this.muted=!this.muted;this.master?.gain.setTargetAtTime(this.muted?0:.38,this.ctx.currentTime,.08);$('sound-icon').setAttribute('d',this.muted?'M11 4 5 9H2v6h3l6 5ZM16 9l6 6m0-6-6 6':'M11 4 5 9H2v6h3l6 5ZM16 7a7 7 0 0 1 0 10M19 4a11 11 0 0 1 0 16');$('sound-button').title=this.muted?'Activar sonido':'Silenciar';$('sound-button').setAttribute('aria-label',$('sound-button').title);},
    update(){if(!this.ctx)return;const car=state.cars[state.focus];if(!car)return;const time=this.ctx.currentTime;const active=state.phase==='race'&&!state.paused;const gear=clamp(Math.floor(car.v/14)+1,1,5);const rpm=active?65+(car.v%14)*5:32;
      if(gear!==this.lastGear&&active){this.lastGear=gear;this.engines[0].gain.gain.setTargetAtTime(.025,time,.02);}
      this.engines.forEach((e,i)=>{e.oscillator.frequency.setTargetAtTime(rpm*(i===0?1:i*.52+1),time,.08);e.gain.gain.setTargetAtTime(state.paused?0:(i===0?.085:.025),time,.1);});
      this.filter.frequency.setTargetAtTime(350+car.v*14,time,.1);this.noiseGain.gain.setTargetAtTime(state.paused?0:.006+car.v*.0005,time,.1);
    },
    effect(type){if(!this.ctx||this.muted)return;const t=this.ctx.currentTime,gain=this.ctx.createGain();gain.connect(this.master);
      if(['contact','skid','brake'].includes(type)){const source=this.ctx.createBufferSource();source.buffer=this.noiseBuffer;const filter=this.ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=type==='contact'?200:2100;filter.Q.value=type==='contact'?.7:4;source.connect(filter);filter.connect(gain);gain.gain.setValueAtTime(type==='contact'?.5:.12,t);gain.gain.exponentialRampToValueAtTime(.001,t+.55);source.start();source.stop(t+.6);}
      else {const oscillator=this.ctx.createOscillator();oscillator.frequency.value=type==='start'?880:440;oscillator.connect(gain);gain.gain.setValueAtTime(.12,t);gain.gain.exponentialRampToValueAtTime(.001,t+.2);oscillator.start();oscillator.stop(t+.25);}
    }
  };
  
  // --- Broadcast UI and accessible controls -----------------------------------
  function formatTime(seconds){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;}
  function formatLap(seconds){return `${Math.floor(seconds/60)}:${(seconds%60).toFixed(3).padStart(6,'0')}`;}
  function buildStandings() {
    $('standings').innerHTML=state.cars.map(car=>`<div class="driver-row" data-driver="${car.id}" role="button" tabindex="0" aria-label="Seguir a ${car.driver.name}"><span class="pos">${car.rank}</span><i class="stripe" style="background:#${car.team.color.toString(16).padStart(6,'0')}"></i><span class="name">${car.driver.short}</span><span class="gap">—</span><span class="compound ${TIRES[car.tire].class}">${car.tire}</span></div>`).join('');
    document.querySelectorAll('.driver-row').forEach(row=>{const select=()=>{state.focus=Number(row.dataset.driver);state.focusLocked=true;state.cameraTimer=5;updateUI();};row.onclick=select;row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}};});
  }
  const mapXY=p=>[100+(p.x-mapBounds.cx)*mapBounds.scale,69+(p.z-mapBounds.cz)*mapBounds.scale];
  function buildMap() {
    const path=track.filter((_,i)=>i%12===0).map((f,i)=>{const [x,y]=mapXY(f.p);return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ')+' Z';
    $('minimap').innerHTML=`<path d="${path}" class="map-edge"/><path d="${path}" class="map-track"/>`+state.cars.map(c=>`<circle id="map-car-${c.id}" class="map-car" r="3.2" fill="#${c.team.color.toString(16).padStart(6,'0')}"/>`).join('');
    $('circuit-preview').innerHTML=`<path d="${path}" fill="none" stroke="#354939" stroke-width="5"/><path d="M37 110h18" stroke="#d2683b" stroke-width="5"/><circle cx="45" cy="116" r="3" fill="#d2683b"/>`;
    $('track-length').textContent=(trackLength/1000).toFixed(2);
  }
  const stateNames={Grid:'EN PARRILLA',Racing:'EN CARRERA',Braking:'FRENANDO',Cornering:'EN CURVA',Accelerating:'ACELERANDO',Overtaking:'AL ATAQUE',Defending:'DEFENDIENDO',Recovering:'RECUPERANDO',Spin:'TROMPO',PitEntry:'ENTRA A BOXES',PitStop:'EN BOXES',PitExit:'SALE DE BOXES'};
  function updateUI() {
    const running=state.phase==='race',leader=state.order[0],car=state.cars[state.focus];if(!leader||!car)return;
    const lap=state.phase==='grid'||state.phase==='countdown'?0:Math.min(CONFIG.laps,leader.lap);
    $('session-label').textContent=state.phase==='finished'?'RESULTADO FINAL':state.finishes.length?'BANDERA A CUADROS':lap===CONFIG.laps?'ÚLTIMA VUELTA':running?'CLASIFICACIÓN':'PARRILLA DE SALIDA';
    $('lap-display').textContent=`V ${lap} / ${CONFIG.laps}`;$('race-clock').textContent=formatTime(state.elapsed);
    $('start-label').textContent=state.phase==='grid'?'START RACE':state.phase==='finished'?'VER RESULTADOS':state.paused?'RESUME':'PAUSE';
    $('start-button').querySelector('.play').textContent=state.phase==='grid'||state.paused?'▶':state.phase==='finished'?'▤':'Ⅱ';
    $('status-label').textContent=state.redFlag?'BANDERA ROJA':state.safetyCar?'SAFETY CAR':state.vsc?'VIRTUAL SAFETY CAR':state.paused?'TRANSMISIÓN EN PAUSA':state.phase==='grid'?'TODO LISTO EN LA PARRILLA':state.phase==='countdown'?'SE APAGAN LOS SEMÁFOROS…':state.phase==='finished'?'TENEMOS UN GANADOR':state.finishes.length?'BANDERA A CUADROS':lap===CONFIG.laps?'LA ÚLTIMA VUELTA':'LA CARRERA ESTÁ VIVA';
    $('status-detail').textContent=state.phase==='grid'?`${Career.regulations.mandatoryPit?'Una parada obligatoria':'Sin parada obligatoria'} · ${WEATHER_STATES[CURRENT_WEATHER_KEY].label}`:`${formatTime(state.elapsed)} · ${state.finishes.length?state.finishes.length+' / 10 en meta':'Vuelta '+lap+' de '+CONFIG.laps} · ${state.speed}×`;
    $('flag-label').textContent=state.finishes.length?'CHEQUERED FLAG':state.safetyCar?'SAFETY CAR':state.phase==='race'?'GREEN FLAG · PISTA LIBRE':'10 EQUIPOS';
    const badge=$('safety-badge');
    if(state.redFlag){badge.textContent='BANDERA ROJA';badge.className='safety-badge show red';}
    else if(state.safetyCar){badge.textContent='SAFETY CAR';badge.className='safety-badge show sc';}
    else if(state.vsc){badge.textContent='VIRTUAL SAFETY CAR';badge.className='safety-badge show vsc';}
    else badge.className='safety-badge';
    const rowHeight=window.innerWidth<=700?29:33;
    document.querySelectorAll('.driver-row').forEach(row=>{
      const c=state.cars[Number(row.dataset.driver)],ahead=state.order[c.rank-2];
      row.style.transform=`translateY(${(c.rank-1)*rowHeight}px)`;row.classList.toggle('selected',c.id===state.focus);row.querySelector('.pos').textContent=c.rank;
      let gap='—';
      if(c.dnf)gap='DNF';
      else if(c.finished)gap=c.rank===1?'WIN':`+${(c.finishTime-state.finishes[0].finishTime).toFixed(1)}`;
      else if(running&&c.rank===1)gap='LÍDER';
      else if(running&&ahead)gap=`+${Math.max(0,(ahead.s-c.s)/Math.max(22,c.v)).toFixed(2)}`;
      if(c.pitStage===2)gap='PIT';row.querySelector('.gap').textContent=gap;
      const tire=row.querySelector('.compound');tire.className=`compound ${TIRES[c.tire].class}`;tire.textContent=c.tire;
      const [x,y]=mapXY(c.position),marker=$('map-car-'+c.id);marker.setAttribute('cx',x);marker.setAttribute('cy',y);marker.setAttribute('r',c.id===state.focus?'4.5':'3');
    });
    $('focus-number').textContent=car.driver.number;$('focus-number').style.color='#'+car.team.color.toString(16).padStart(6,'0');$('focus-number').style.borderColor='#'+car.team.color.toString(16).padStart(6,'0');
    $('focus-name').textContent=car.driver.name.toUpperCase();$('focus-team').textContent=car.team.name.toUpperCase();$('focus-position').textContent=`POS. ${String(car.rank).padStart(2,'0')}`;
    $('focus-speed').textContent=Math.round(car.v*3.6);$('focus-tire').textContent=`${car.tire} · ${Math.round(car.wear)}%`;$('tire-bar-fill').style.width=car.wear+'%';$('focus-state').textContent=car.dnf?'ABANDONÓ':car.finished?'EN META':stateNames[car.state]||'EN CARRERA';
    $('focus-fuel').textContent=Math.round(car.fuel);$('focus-damage').textContent=Math.round(car.damage*100)+'%';
    $('focus-delta').textContent=state.fastest<Infinity&&car.lastLap?(car.lastLap-state.fastest>=0?'+':'')+(car.lastLap-state.fastest).toFixed(2):'—';
    $('hud-speed').textContent=Math.round(car.v*3.6);$('hud-state').textContent=car.slipstream?'REBUFO ACTIVO':car.state.toUpperCase();
    $('director-label').textContent=state.focusLocked?`SIGUIENDO A ${car.driver.short}`:`DIRECTOR IA · ${state.excitement>65?'BATALLA EN PISTA':'SEÑAL AUTOMÁTICA'}`;
    if(performance.now()>state.eventUntil)$('event-overlay').classList.remove('show');
  }
  function renderCommandPanel(){
    const playerCar=state.cars.find(c=>c.team.isPlayer);
    $('command-car-toggle').innerHTML=playerCar?`<button class="active" style="flex:2">DIRIGIENDO A ${playerCar.driver.name.toUpperCase()} · P${playerCar.rank}</button>`:'';
    if(!playerCar)return;
    document.querySelectorAll('#commands-panel [data-cmd]').forEach(group=>{
      const cmd=group.dataset.cmd;
      group.querySelectorAll('button').forEach(btn=>{
        btn.classList.toggle('active',playerCar.commands[cmd]===btn.dataset.val);
        btn.onclick=()=>{
          if(cmd==='pit'&&btn.dataset.val==='now'){playerCar.commands.pit='now';}
          else if(cmd==='pit'&&btn.dataset.val==='next'){playerCar.pitLap=playerCar.lap+1;playerCar.commands.pit='next';}
          else playerCar.commands[cmd]=btn.dataset.val;
          group.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));
        };
      });
    });
  }
  function showRoundResults() {
    if(state.phase!=='finished')return;
    const order=state.order;
    const summary=onRaceFinished(order,state.poleTeamId?order.find(c=>c.team.id===state.poleTeamId)?.id:-1,state.fastestCarId);
    const podiumHtml=order.slice(0,3).map((c,i)=>`<div class="podium-step" style="border-color:#${c.team.color.toString(16).padStart(6,'0')}"><b>${i+1}º</b><strong>${c.driver.short}</strong><small>${c.team.name.toUpperCase()}</small></div>`).join('');
    const rowsHtml=order.map((c,i)=>`<tr><td>${i+1}</td><td>${c.team.name.toUpperCase()}</td><td>${c.driver.name.toUpperCase()}</td><td>${c.dnf?'DNF':(c.finished?(i===0?formatLap(c.finishTime):'+'+(c.finishTime-order[0].finishTime).toFixed(3)):'NO FINALIZÓ')}</td></tr>`).join('');
    GameUI.openModal(`<div class="eyebrow">${CURRENT_TRACK.name} · RESULTADO OFICIAL</div><h2 id="modal-title">LA GLORIA TIENE NOMBRE.</h2><div class="podium">${podiumHtml}</div><table class="roster"><thead><tr><th>POS</th><th>EQUIPO</th><th>PILOTO</th><th>TIEMPO / DIF.</th></tr></thead><tbody>${rowsHtml}</tbody></table><p>Ingreso de la fecha: <b>${GameUI.money(summary.sponsorIncome+summary.prize)}</b>${summary.penalty?' · <b style="color:#c93a2e">Penalización de grilla la próxima fecha por límite de motor.</b>':''}</p><button class="primary" id="round-continue">CONTINUAR A LA SIGUIENTE FECHA &nbsp; ↗</button>`);
    $('round-continue').onclick=()=>{GameUI.closeModal();GameUI.advanceToNextRound();};
  }
  $('start-button').onclick=startRace;$('restart-button').onclick=resetRace;$('sound-button').onclick=()=>audio.toggle();
  $('quali-button').onclick=runQualifying;
  $('strategy-button').onclick=openStrategyModal;
  function openStrategyModal(){
    const s=Career.strategy;
    const presets={ATTACK:{pace:'push',aggression:'attack',tyreMgmt:'push',fuel:'push',stops:1},BALANCED:{pace:'standard',aggression:'standard',tyreMgmt:'standard',fuel:'standard',stops:1},CONSERVE:{pace:'conserve',aggression:'defend',tyreMgmt:'save',fuel:'save',stops:1}};
    GameUI.openModal(`<div class="eyebrow">ESTRATEGIA DE CARRERA</div><h2 id="modal-title">${CURRENT_TRACK.name}</h2>
      <div class="strategy-choice">${Object.keys(presets).map(p=>`<button data-preset="${p}">${p}</button>`).join('')}</div>
      <div class="slider-row"><label><span>COMPUESTO INICIAL</span></label><div class="strategy-choice">${['S','M','H'].map(t=>`<button data-compound="${t}" class="${s.compound===t?'active':''}">${TIRES[t].name.toUpperCase()}</button>`).join('')}</div></div>
      <p>El formato de temporada exige ${Career.regulations.mandatoryPit?'una parada obligatoria':'ninguna parada obligatoria'} en boxes. Ajustá el compuesto y el enfoque general; podés seguir dando órdenes en vivo desde DIRECCIÓN DE CARRERA una vez arrancada la carrera.</p>
      <button class="primary" id="strategy-close">LISTO</button>`);
    document.querySelectorAll('[data-preset]').forEach(btn=>btn.onclick=()=>{Object.assign(Career.strategy,presets[btn.dataset.preset]);saveCareer(Career);openStrategyModal();});
    document.querySelectorAll('[data-compound]').forEach(btn=>btn.onclick=()=>{Career.strategy.compound=btn.dataset.compound;saveCareer(Career);openStrategyModal();});
    $('strategy-close').onclick=()=>GameUI.closeModal();
  }
  $('fullscreen-button').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){addEvent('PANTALLA COMPLETA','Tu navegador no permite este modo.');}};
  document.querySelectorAll('[data-speed]').forEach(button=>button.onclick=()=>{state.speed=Number(button.dataset.speed);document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',b===button));updateUI();});
  document.querySelectorAll('[data-camera]').forEach(button=>button.onclick=()=>{state.cameraMode=button.dataset.camera;if(state.cameraMode==='auto')state.focusLocked=false;state.cameraTimer=0;document.querySelectorAll('[data-camera]').forEach(b=>b.classList.toggle('active',b===button));});
  document.addEventListener('keydown',e=>{
    if($('modal-backdrop').classList.contains('open'))return;
    if(currentActiveScreen()!=='race')return;
    if(['BUTTON','SELECT','INPUT'].includes(document.activeElement.tagName))return;
    if(e.code==='Space'){e.preventDefault();startRace();}
    if(e.key.toLowerCase()==='m')audio.toggle();
    if(e.key.toLowerCase()==='c'){const buttons=[...document.querySelectorAll('[data-camera]')],index=buttons.findIndex(b=>b.classList.contains('active'));buttons[(index+1)%buttons.length].click();}
  });
  function resize(){const rect=$('scene').getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();updateUI();}
  new ResizeObserver(resize).observe(document.querySelector('.broadcast'));
  window.onRaceScreenShown=()=>{resize();updateRaceMeta();};
  
  // Fixed physics timestep independent of rendering or selected playback speed.
  let lastFrame=performance.now(),accumulator=0,lastUI=0;
  
  function qualify(){ // igual que runQualifying() sin ventanas ni guardado
    const grid=buildGrid();
    const timed=grid.map(entry=>({entry,pace:qualiPace(entry.driver,entry.team)})).sort((a,b)=>a.pace-b.pace);
    state.grid=timed.map(t=>t.entry); state.poleTeamId=state.grid[0].team.id; Career.qualifyingDoneRound=currentRound(Career).round; resetRace();
  }
  function stepSim(){ // un paso fijo de 1/60 s (igual que el bucle de frame())
    SIMT+=1000/60;
    if(state.redFlag&&SIMT>state.redFlagRealEndsAt){state.redFlag=false;state.paused=false;addEvent('SE REANUDA LA CARRERA','Vuelve la acción en pista.',null,60);}
    if(!state.paused){updateRace(CONFIG.fixedStep);updateParticles(CONFIG.fixedStep);}
  }
  function beginRace(){ if(state.phase==='grid'){state.phase='countdown';state.countdown=0;addEvent('MOTORES ENCENDIDOS',CURRENT_TRACK.name+' espera la largada.',null,0);} }
  resetRace();
  return { state, CONFIG, resetRace, qualify, stepSim, beginRace, takeHalf(){ const h=HALFHIT; HALFHIT=false; return h; }, seedRng(s){ RS=s>>>0; }, setSimT(v){ SIMT=v; }, vars(){ return { RS, SIMT, wk:CURRENT_WEATHER_KEY, wg:CURRENT_WEATHER_GRIP }; }, setVars(o){ RS=o.RS; SIMT=o.SIMT; CURRENT_WEATHER_KEY=o.wk; CURRENT_WEATHER_GRIP=o.wg; }, get trackLength(){ return trackLength; }, currentRound, currentTrack, TRACKS, effectiveStats, activeDriver, TEAM_DEFS, newCareer, migrateCareer };
  
}
