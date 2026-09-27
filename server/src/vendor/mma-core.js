// GENERADO por server/tools/build-mma.mjs (no editar). Simulador de combate y plantel de LLO como módulo ES.
import { DM } from '../../../assets/common/dmath.mjs';
const window = globalThis; if (!globalThis.window) globalThis.window = globalThis;
// BASE DE PELEADORES DE LLO — generada por assets/roster/tools/build_mma_roster.py (no editar a mano).
// initial: plantel de arranque (índices 0 y 6 = peleadores del usuario); pool: reserva (prospectos y reposición). n nombre, c código de nación, a edad, d división, s estilo, o media, pt potencial, at atributos (orden de attrs), sk piel, hr pelo, hs peinado, ph retrato, k tipo.
window.LLO_ROSTER = {"version":1,"placeholder":"assets/players/placeholder.webp","attrs":["accuracy","defense","power","speed","wrestling","grappling","cardio","initiative","intelligence","chin"],"divs":["fly","bantam","feather","light","welter","middle","lightheavy","heavy"],"initial":[{"id":"x_mmaf03800001","n":"Agustín Essomba","c":"RIA","a":23,"d":"feather","s":"grappler","o":63,"pt":72,"at":[53,65,55,71,62,73,68,69,54,59],"sk":"#9e674b","hr":"#0f100c","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf03800001.webp","k":"fict"},{"id":"r_reitsuruya","n":"Rei Tsuruya","c":"TAM","a":24,"d":"fly","s":"counter","o":80,"pt":84,"at":[83,81,65,82,83,89,80,86,74,77],"sk":"#e49f7f","hr":"#191213","hs":"largo","bald":0,"ph":"assets/players/mma/r_reitsuruya.webp","k":"real"},{"id":"x_mmaf07900001","n":"Enzo Ruiz","c":"ZEN","a":34,"d":"fly","s":"grappler","o":79,"pt":80,"at":[67,79,72,87,80,90,76,79,76,85],"sk":"#be8870","hr":"#16110c","hs":"media","bald":0,"ph":"assets/players/mma/x_mmaf07900001.webp","k":"fict"},{"id":"r_alexperez","n":"Alex Perez","c":"PER","a":34,"d":"fly","s":"wrestler","o":79,"pt":79,"at":[76,70,68,79,83,85,75,85,85,85],"sk":"#cf8e72","hr":"#2d2221","hs":"corto","bald":0,"ph":"assets/players/mma/r_alexperez.webp","k":"real"},{"id":"r_tagirulanbekov","n":"Tagir Ulanbekov","c":"BAI","a":34,"d":"fly","s":"grappler","o":76,"pt":76,"at":[76,78,61,83,76,90,79,72,75,70],"sk":"#e0a088","hr":"#3e2d2a","hs":"corto","bald":0,"ph":"assets/players/mma/r_tagirulanbekov.webp","k":"real"},{"id":"r_ramazantemirov","n":"Ramazan Temirov","c":"KOS","a":29,"d":"fly","s":"grappler","o":73,"pt":74,"at":[70,69,72,83,80,74,69,75,70,69],"sk":"#cd8769","hr":"#18100f","hs":"corto","bald":0,"ph":"assets/players/mma/r_ramazantemirov.webp","k":"real"},{"id":"x_mmaf07700001","n":"Julián Pires","c":"TAM","a":21,"d":"light","s":"pressure","o":61,"pt":71,"at":[57,56,72,59,62,56,69,65,60,54],"sk":"#ad7864","hr":"#26190e","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf07700001.webp","k":"fict"},{"id":"x_mmaf04100001","n":"Khabib Dosmukhamedov","c":"KOS","a":36,"d":"fly","s":"pressure","o":73,"pt":76,"at":[71,72,67,76,66,71,80,80,73,75],"sk":"#bd8465","hr":"#2e2010","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf04100001.webp","k":"fict"},{"id":"r_bennguyen","n":"Ben Nguyen","c":"KAI","a":36,"d":"fly","s":"pressure","o":73,"pt":73,"at":[75,77,77,71,69,70,68,77,76,71],"sk":"#a8857c","hr":"#121214","hs":"corto","bald":0,"ph":"assets/players/mma/r_bennguyen.webp","k":"real"},{"id":"r_stewartnicoll","n":"Stewart Nicoll","c":"KAI","a":31,"d":"fly","s":"pressure","o":69,"pt":69,"at":[73,59,69,68,70,66,80,61,73,72],"sk":"#bd725d","hr":"#1b1414","hs":"corto","bald":0,"ph":"assets/players/mma/r_stewartnicoll.webp","k":"real"},{"id":"r_aldencoria","n":"Alden Coria","c":"MAG","a":27,"d":"fly","s":"counter","o":68,"pt":69,"at":[66,77,60,74,73,63,70,64,71,62],"sk":"#d4886b","hr":"#19100f","hs":"corto","bald":0,"ph":"assets/players/mma/r_aldencoria.webp","k":"real"},{"id":"r_codydurden","n":"Cody Durden","c":"OVM","a":32,"d":"fly","s":"wrestler","o":67,"pt":67,"at":[67,58,60,63,75,69,71,64,75,68],"sk":"#df987d","hr":"#352522","hs":"corto","bald":0,"ph":"assets/players/mma/r_codydurden.webp","k":"real"},{"id":"r_odeosbourne","n":"Ode Osbourne","c":"KAI","a":33,"d":"fly","s":"grappler","o":67,"pt":67,"at":[61,66,57,73,70,76,65,66,71,66],"sk":"#a46046","hr":"#302726","hs":"corto","bald":0,"ph":"assets/players/mma/r_odeosbourne.webp","k":"real"},{"id":"r_jeffmolina","n":"Jeff Molina","c":"SOT","a":28,"d":"fly","s":"grappler","o":67,"pt":68,"at":[69,61,52,70,65,77,76,63,71,66],"sk":"#cea381","hr":"#181719","hs":"corto","bald":0,"ph":"assets/players/mma/r_jeffmolina.webp","k":"real"},{"id":"r_bibulatovmagomed","n":"Bibulatov Magomed","c":"IBE","a":36,"d":"fly","s":"counter","o":66,"pt":66,"at":[64,77,59,73,67,65,57,66,66,65],"sk":"#ae847a","hr":"#2f2524","hs":"corto","bald":0,"ph":"assets/players/mma/r_bibulatovmagomed.webp","k":"real"},{"id":"x_mmaf03700001","n":"Khabib Bekov","c":"KOS","a":28,"d":"fly","s":"pressure","o":65,"pt":69,"at":[61,65,72,65,66,60,69,65,59,67],"sk":"#c28a72","hr":"#382215","hs":"media","bald":0,"ph":"assets/players/mma/x_mmaf03700001.webp","k":"fict"},{"id":"r_paytontalbott","n":"Payton Talbott","c":"MEL","a":27,"d":"bantam","s":"grappler","o":83,"pt":84,"at":[84,80,80,79,86,93,84,77,87,79],"sk":"#e4a684","hr":"#1a1213","hs":"corto","bald":0,"ph":"assets/players/mma/r_paytontalbott.webp","k":"real"},{"id":"r_kaiasakura","n":"Kai Asakura","c":"TAM","a":32,"d":"bantam","s":"pressure","o":82,"pt":82,"at":[83,86,92,78,80,85,87,68,80,80],"sk":"#e8a57d","hr":"#402719","hs":"corto","bald":0,"ph":"assets/players/mma/r_kaiasakura.webp","k":"real"},{"id":"r_saidnurmagomedov","n":"Said Nurmagomedov","c":"KOS","a":33,"d":"bantam","s":"counter","o":82,"pt":82,"at":[86,86,71,87,78,79,87,85,80,81],"sk":"#e29f83","hr":"#35231e","hs":"corto","bald":0,"ph":"assets/players/mma/r_saidnurmagomedov.webp","k":"real"},{"id":"r_robfont","n":"Rob Font","c":"KAI","a":38,"d":"bantam","s":"pressure","o":81,"pt":81,"at":[83,78,89,87,78,75,79,87,78,76],"sk":"#c17e62","hr":"#3a2f30","hs":"corto","bald":0,"ph":"assets/players/mma/r_robfont.webp","k":"real"},{"id":"r_codygarbrandt","n":"Cody Garbrandt","c":"KAI","a":34,"d":"bantam","s":"pressure","o":81,"pt":81,"at":[83,78,74,79,90,78,92,76,80,81],"sk":"#cb8470","hr":"#48312c","hs":"corto","bald":0,"ph":"assets/players/mma/r_codygarbrandt.webp","k":"real"},{"id":"r_kylerphillips","n":"Kyler Phillips","c":"IBE","a":30,"d":"bantam","s":"grappler","o":80,"pt":80,"at":[84,79,77,78,72,95,87,79,72,77],"sk":"#db8e73","hr":"#241715","hs":"largo","bald":0,"ph":"assets/players/mma/r_kylerphillips.webp","k":"real"},{"id":"r_zviadlazishvili","n":"Zviad Lazishvili","c":"KAI","a":33,"d":"bantam","s":"grappler","o":78,"pt":78,"at":[79,78,75,78,85,86,70,77,84,68],"sk":"#bb9187","hr":"#d8b6a4","hs":"corto","bald":0,"ph":"assets/players/mma/r_zviadlazishvili.webp","k":"real"},{"id":"r_cristianquinonez","n":"Cristian Quinonez","c":"MAG","a":27,"d":"bantam","s":"pressure","o":78,"pt":79,"at":[76,76,77,83,73,77,91,78,74,76],"sk":"#c87f60","hr":"#291a15","hs":"corto","bald":0,"ph":"assets/players/mma/r_cristianquinonez.webp","k":"real"},{"id":"r_charlesjourdain","n":"Charles Jourdain","c":"BAI","a":30,"d":"bantam","s":"grappler","o":77,"pt":77,"at":[78,77,62,84,76,84,75,79,81,74],"sk":"#d8906d","hr":"#271c18","hs":"corto","bald":0,"ph":"assets/players/mma/r_charlesjourdain.webp","k":"real"},{"id":"r_codygibson","n":"Cody Gibson","c":"MEL","a":38,"d":"bantam","s":"wrestler","o":76,"pt":76,"at":[79,79,75,71,89,76,74,72,76,69],"sk":"#e69e7f","hr":"#492e20","hs":"corto","bald":0,"ph":"assets/players/mma/r_codygibson.webp","k":"real"},{"id":"r_allanzuniga","n":"Allan Zuniga","c":"PER","a":32,"d":"bantam","s":"counter","o":73,"pt":73,"at":[72,75,68,74,75,72,79,79,67,69],"sk":"#b28179","hr":"#221f1f","hs":"corto","bald":0,"ph":"assets/players/mma/r_allanzuniga.webp","k":"real"},{"id":"x_mmaf01500001","n":"Jamal Ellison","c":"KAI","a":31,"d":"bantam","s":"pressure","o":73,"pt":78,"at":[73,77,79,77,74,65,76,72,64,75],"sk":"#b98161","hr":"#482a19","hs":"raya","bald":0,"ph":"assets/players/mma/x_mmaf01500001.webp","k":"fict"},{"id":"r_santiagoluna","n":"Santiago Luna","c":"SOT","a":21,"d":"bantam","s":"grappler","o":71,"pt":75,"at":[68,63,67,71,78,81,75,68,70,70],"sk":"#db9781","hr":"#110b09","hs":"corto","bald":0,"ph":"assets/players/mma/r_santiagoluna.webp","k":"real"},{"id":"x_mmaf00900001","n":"Emiliano Domínguez","c":"TAM","a":30,"d":"bantam","s":"counter","o":70,"pt":75,"at":[74,74,65,67,72,72,76,68,64,68],"sk":"#b98769","hr":"#1d1811","hs":"manbun","bald":0,"ph":"assets/players/mma/x_mmaf00900001.webp","k":"fict"},{"id":"r_movsarevloev","n":"Movsar Evloev","c":"BAI","a":32,"d":"feather","s":"wrestler","o":88,"pt":88,"at":[83,84,85,81,96,92,91,91,86,91],"sk":"#d7937e","hr":"#392624","hs":"corto","bald":0,"ph":"assets/players/mma/r_movsarevloev.webp","k":"real"},{"id":"r_yairrodriguez","n":"Yair Rodriguez","c":"SOT","a":33,"d":"feather","s":"counter","o":86,"pt":86,"at":[88,93,86,87,88,88,82,80,86,81],"sk":"#cb876e","hr":"#201a1c","hs":"corto","bald":0,"ph":"assets/players/mma/r_yairrodriguez.webp","k":"real"},{"id":"x_mmaf02300001","n":"Finn Schneider","c":"MEL","a":29,"d":"feather","s":"grappler","o":82,"pt":87,"at":[85,85,65,75,87,92,81,81,81,88],"sk":"#bf8b70","hr":"#332418","hs":"puas","bald":0,"ph":"assets/players/mma/x_mmaf02300001.webp","k":"fict"},{"id":"r_joshemmett","n":"Josh Emmett","c":"OVM","a":40,"d":"feather","s":"counter","o":80,"pt":80,"at":[88,88,78,76,83,77,71,81,74,83],"sk":"#db9377","hr":"#f3b69d","hs":"corto","bald":0,"ph":"assets/players/mma/r_joshemmett.webp","k":"real"},{"id":"r_milesjohns","n":"Miles Johns","c":"IBE","a":32,"d":"feather","s":"wrestler","o":79,"pt":79,"at":[83,75,72,73,90,83,83,79,77,75],"sk":"#c27a59","hr":"#d39785","hs":"corto","bald":0,"ph":"assets/players/mma/r_milesjohns.webp","k":"real"},{"id":"r_joosangyoo","n":"Joosang Yoo","c":"TAM","a":31,"d":"feather","s":"wrestler","o":79,"pt":79,"at":[79,76,79,76,90,82,75,82,76,75],"sk":"#e09b6f","hr":"#19110f","hs":"corto","bald":0,"ph":"assets/players/mma/r_joosangyoo.webp","k":"real"},{"id":"r_ryanhall","n":"Ryan Hall","c":"IBE","a":38,"d":"feather","s":"grappler","o":77,"pt":77,"at":[70,82,73,73,79,92,74,82,77,69],"sk":"#cda497","hr":"#30292a","hs":"corto","bald":0,"ph":"assets/players/mma/r_ryanhall.webp","k":"real"},{"id":"r_danige","n":"Dan Ige","c":"IBE","a":34,"d":"feather","s":"pressure","o":77,"pt":77,"at":[77,65,90,84,70,73,82,77,72,80],"sk":"#d58f71","hr":"#281f1c","hs":"corto","bald":0,"ph":"assets/players/mma/r_danige.webp","k":"real"},{"id":"x_mmaf03300001","n":"Bautista Acosta","c":"TAM","a":27,"d":"feather","s":"pressure","o":77,"pt":83,"at":[86,77,88,79,68,68,78,73,75,77],"sk":"#b88365","hr":"#141410","hs":"mullet","bald":0,"ph":"assets/players/mma/x_mmaf03300001.webp","k":"fict"},{"id":"r_shanecollins","n":"Shane Collins","c":"KAI","a":26,"d":"feather","s":"counter","o":77,"pt":78,"at":[79,79,76,83,75,82,70,70,76,80],"sk":"#cf896d","hr":"#4c3227","hs":"corto","bald":0,"ph":"assets/players/mma/r_shanecollins.webp","k":"real"},{"id":"r_yadierdelvalle","n":"Yadier Del Valle","c":"MRG","a":29,"d":"feather","s":"grappler","o":77,"pt":78,"at":[74,78,74,76,81,77,80,79,78,74],"sk":"#d69072","hr":"#1e1617","hs":"corto","bald":0,"ph":"assets/players/mma/r_yadierdelvalle.webp","k":"real"},{"id":"r_chadmendes","n":"Chad Mendes","c":"OVM","a":41,"d":"feather","s":"wrestler","o":77,"pt":77,"at":[78,86,76,67,85,82,73,77,71,74],"sk":"#9a736a","hr":"#3c3130","hs":"corto","bald":0,"ph":"assets/players/mma/r_chadmendes.webp","k":"real"},{"id":"r_malcolmwellmaker","n":"Malcolm Wellmaker","c":"KAI","a":31,"d":"feather","s":"counter","o":75,"pt":75,"at":[72,87,68,75,74,71,74,78,80,71],"sk":"#d1855d","hr":"#29201f","hs":"corto","bald":0,"ph":"assets/players/mma/r_malcolmwellmaker.webp","k":"real"},{"id":"x_mmaf06400001","n":"Tariq Etame","c":"RIA","a":24,"d":"feather","s":"pressure","o":75,"pt":82,"at":[69,74,82,79,74,71,78,81,68,74],"sk":"#885b43","hr":"#121410","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf06400001.webp","k":"fict"},{"id":"r_paddypimblett","n":"Paddy Pimblett","c":"IBE","a":31,"d":"light","s":"pressure","o":84,"pt":84,"at":[79,82,91,81,85,85,88,78,85,85],"sk":"#dfa081","hr":"#6a4a37","hs":"corto","bald":0,"ph":"assets/players/mma/r_paddypimblett.webp","k":"real"},{"id":"r_mauricioruffy","n":"Mauricio Ruffy","c":"TAM","a":29,"d":"light","s":"wrestler","o":84,"pt":85,"at":[74,84,84,81,93,80,87,88,83,88],"sk":"#d58b7d","hr":"#2d1c1c","hs":"corto","bald":0,"ph":"assets/players/mma/r_mauricioruffy.webp","k":"real"},{"id":"r_chrisduncan","n":"Chris Duncan","c":"MRG","a":33,"d":"light","s":"counter","o":79,"pt":79,"at":[88,87,74,84,76,70,74,84,74,80],"sk":"#cf8e77","hr":"#553b31","hs":"corto","bald":0,"ph":"assets/players/mma/r_chrisduncan.webp","k":"real"},{"id":"r_nazimsadykhov","n":"Nazim Sadykhov","c":"BAI","a":32,"d":"light","s":"wrestler","o":79,"pt":79,"at":[76,79,76,72,88,81,78,83,78,78],"sk":"#d1907e","hr":"#2e1c19","hs":"corto","bald":0,"ph":"assets/players/mma/r_nazimsadykhov.webp","k":"real"},{"id":"r_terrancemckinney","n":"Terrance Mckinney","c":"MAG","a":31,"d":"light","s":"wrestler","o":79,"pt":79,"at":[68,88,75,76,81,81,83,85,85,69],"sk":"#ae644b","hr":"#21191a","hs":"corto","bald":0,"ph":"assets/players/mma/r_terrancemckinney.webp","k":"real"},{"id":"r_chasehooper","n":"Chase Hooper","c":"MEL","a":26,"d":"light","s":"grappler","o":79,"pt":80,"at":[75,79,71,80,83,92,78,75,85,72],"sk":"#e09d88","hr":"#271811","hs":"corto","bald":0,"ph":"assets/players/mma/r_chasehooper.webp","k":"real"},{"id":"r_jaiherbert","n":"Jai Herbert","c":"KAI","a":37,"d":"light","s":"counter","o":76,"pt":76,"at":[82,92,81,64,70,74,72,71,75,80],"sk":"#bd7453","hr":"#4a3834","hs":"corto","bald":0,"ph":"assets/players/mma/r_jaiherbert.webp","k":"real"},{"id":"r_mitchramirez","n":"Mitch Ramirez","c":"MAG","a":33,"d":"light","s":"wrestler","o":76,"pt":76,"at":[81,70,75,63,84,72,82,74,81,77],"sk":"#da9b7e","hr":"#181314","hs":"corto","bald":0,"ph":"assets/players/mma/r_mitchramirez.webp","k":"real"},{"id":"r_diegoferreira","n":"Diego Ferreira","c":"TAM","a":40,"d":"light","s":"counter","o":74,"pt":74,"at":[83,91,69,71,71,70,64,76,74,72],"sk":"#c78062","hr":"#413735","hs":"corto","bald":0,"ph":"assets/players/mma/r_diegoferreira.webp","k":"real"},{"id":"r_romanbogatov","n":"Roman Bogatov","c":"BAI","a":36,"d":"light","s":"grappler","o":74,"pt":74,"at":[66,77,65,72,74,93,70,71,80,71],"sk":"#b88f85","hr":"#c8a69b","hs":"corto","bald":0,"ph":"assets/players/mma/r_romanbogatov.webp","k":"real"},{"id":"x_mmaf11800001","n":"Zurab Cerny","c":"ESV","a":36,"d":"light","s":"pressure","o":74,"pt":78,"at":[77,71,81,74,77,68,80,82,68,65],"sk":"#c08567","hr":"#0a0b08","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf11800001.webp","k":"fict"},{"id":"r_ismaelbonfim","n":"Ismael Bonfim","c":"TAM","a":30,"d":"light","s":"wrestler","o":73,"pt":73,"at":[66,73,69,70,84,75,80,76,68,69],"sk":"#c97f61","hr":"#302626","hs":"corto","bald":0,"ph":"assets/players/mma/r_ismaelbonfim.webp","k":"real"},{"id":"r_mikedavis","n":"Mike Davis","c":"OVM","a":32,"d":"light","s":"pressure","o":73,"pt":73,"at":[71,75,73,76,68,83,72,68,73,71],"sk":"#d38a68","hr":"#130b09","hs":"corto","bald":0,"ph":"assets/players/mma/r_mikedavis.webp","k":"real"},{"id":"r_mateuszrebecki","n":"Mateusz Rebecki","c":"ESV","a":33,"d":"light","s":"pressure","o":73,"pt":73,"at":[75,71,76,78,74,77,78,68,70,63],"sk":"#e69e83","hr":"#5f453d","hs":"corto","bald":0,"ph":"assets/players/mma/r_mateuszrebecki.webp","k":"real"},{"id":"r_ignaciobahamondes","n":"Ignacio Bahamondes","c":"MAG","a":28,"d":"welter","s":"pressure","o":80,"pt":81,"at":[81,81,92,74,73,77,90,83,81,67],"sk":"#cb8678","hr":"#0d0707","hs":"corto","bald":0,"ph":"assets/players/mma/r_ignaciobahamondes.webp","k":"real"},{"id":"r_geoffneal","n":"Geoff Neal","c":"MRG","a":35,"d":"welter","s":"grappler","o":80,"pt":80,"at":[75,81,81,81,74,86,78,76,88,80],"sk":"#945742","hr":"#4f403b","hs":"corto","bald":0,"ph":"assets/players/mma/r_geoffneal.webp","k":"real"},{"id":"r_stephenthompson","n":"Stephen Thompson","c":"IBE","a":42,"d":"welter","s":"counter","o":79,"pt":79,"at":[83,91,79,61,95,79,80,76,75,71],"sk":"#e29882","hr":"#5d4235","hs":"corto","bald":0,"ph":"assets/players/mma/r_stephenthompson.webp","k":"real"},{"id":"r_santiagoponzinibbio","n":"Santiago Ponzinibbio","c":"VAL","a":38,"d":"welter","s":"counter","o":78,"pt":78,"at":[83,84,73,80,82,88,67,75,79,70],"sk":"#bf785b","hr":"#4a372f","hs":"corto","bald":0,"ph":"assets/players/mma/r_santiagoponzinibbio.webp","k":"real"},{"id":"x_mmaf08100001","n":"Isaiah Mosquera","c":"SOT","a":30,"d":"welter","s":"pressure","o":76,"pt":79,"at":[71,71,80,75,77,78,75,80,79,76],"sk":"#be8261","hr":"#91574f","hs":"flequillo","bald":0,"ph":"assets/players/mma/x_mmaf08100001.webp","k":"fict"},{"id":"r_charlesradtke","n":"Charles Radtke","c":"KAI","a":36,"d":"welter","s":"counter","o":75,"pt":75,"at":[81,82,65,69,75,76,70,76,77,79],"sk":"#e89a7d","hr":"#4d352c","hs":"corto","bald":0,"ph":"assets/players/mma/r_charlesradtke.webp","k":"real"},{"id":"r_muslimsalikhov","n":"Muslim Salikhov","c":"KOS","a":41,"d":"welter","s":"counter","o":75,"pt":75,"at":[76,85,78,67,77,73,69,80,73,74],"sk":"#d99276","hr":"#32221f","hs":"corto","bald":0,"ph":"assets/players/mma/r_muslimsalikhov.webp","k":"real"},{"id":"r_jeremiahwells","n":"Jeremiah Wells","c":"KAI","a":39,"d":"welter","s":"counter","o":75,"pt":75,"at":[73,83,72,71,77,78,73,80,74,68],"sk":"#a66147","hr":"#2d2628","hs":"corto","bald":0,"ph":"assets/players/mma/r_jeremiahwells.webp","k":"real"},{"id":"r_niklasstolze","n":"Niklas Stolze","c":"MEL","a":33,"d":"welter","s":"grappler","o":75,"pt":75,"at":[73,76,76,74,76,83,78,74,69,73],"sk":"#e5a58c","hr":"#63463c","hs":"corto","bald":0,"ph":"assets/players/mma/r_niklasstolze.webp","k":"real"},{"id":"r_nikolayveretennikov","n":"Nikolay Veretennikov","c":"BAI","a":35,"d":"welter","s":"counter","o":74,"pt":74,"at":[79,80,72,76,67,75,71,73,71,77],"sk":"#e29576","hr":"#261b1a","hs":"corto","bald":0,"ph":"assets/players/mma/r_nikolayveretennikov.webp","k":"real"},{"id":"r_maxgriffin","n":"Max Griffin","c":"BAI","a":39,"d":"welter","s":"pressure","o":74,"pt":74,"at":[67,70,85,73,66,79,78,72,80,70],"sk":"#c67e61","hr":"#352c2a","hs":"corto","bald":0,"ph":"assets/players/mma/r_maxgriffin.webp","k":"real"},{"id":"r_wellingtonturman","n":"Wellington Turman","c":"TAM","a":27,"d":"welter","s":"grappler","o":74,"pt":75,"at":[79,75,68,71,73,81,72,73,74,74],"sk":"#e7ab99","hr":"#514445","hs":"corto","bald":0,"ph":"assets/players/mma/r_wellingtonturman.webp","k":"real"},{"id":"r_gabrielbonfim","n":"Gabriel Bonfim","c":"TAM","a":29,"d":"welter","s":"wrestler","o":73,"pt":74,"at":[75,73,72,68,84,77,72,62,77,70],"sk":"#cb8465","hr":"#382b2a","hs":"corto","bald":0,"ph":"assets/players/mma/r_gabrielbonfim.webp","k":"real"},{"id":"r_dingmeng","n":"Ding Meng","c":"TAM","a":31,"d":"welter","s":"grappler","o":73,"pt":73,"at":[76,69,66,72,70,84,73,79,66,76],"sk":"#b2938f","hr":"#0d0b0d","hs":"corto","bald":0,"ph":"assets/players/mma/r_dingmeng.webp","k":"real"},{"id":"r_baisangursusurkaev","n":"Baisangur Susurkaev","c":"BAI","a":24,"d":"middle","s":"wrestler","o":82,"pt":86,"at":[76,82,83,80,94,84,81,81,76,82],"sk":"#d1937a","hr":"#241713","hs":"corto","bald":0,"ph":"assets/players/mma/r_baisangursusurkaev.webp","k":"real"},{"id":"r_vicenteluque","n":"Vicente Luque","c":"TAM","a":34,"d":"middle","s":"pressure","o":82,"pt":82,"at":[82,77,94,81,77,83,80,80,80,84],"sk":"#d79275","hr":"#33231c","hs":"corto","bald":0,"ph":"assets/players/mma/r_vicenteluque.webp","k":"real"},{"id":"r_ismailnaurdiev","n":"Ismail Naurdiev","c":"BAI","a":29,"d":"middle","s":"counter","o":78,"pt":79,"at":[78,92,73,70,81,72,70,83,80,81],"sk":"#da937f","hr":"#3d2f2f","hs":"corto","bald":0,"ph":"assets/players/mma/r_ismailnaurdiev.webp","k":"real"},{"id":"r_rodolfovieira","n":"Rodolfo Vieira","c":"TAM","a":36,"d":"middle","s":"grappler","o":78,"pt":78,"at":[80,87,76,70,74,81,76,81,76,79],"sk":"#de9071","hr":"#3c2d28","hs":"corto","bald":0,"ph":"assets/players/mma/r_rodolfovieira.webp","k":"real"},{"id":"r_michaloleksiejczuk","n":"Michal Oleksiejczuk","c":"ESV","a":30,"d":"middle","s":"pressure","o":76,"pt":76,"at":[71,71,92,73,73,72,75,81,78,74],"sk":"#d49881","hr":"#46332c","hs":"corto","bald":0,"ph":"assets/players/mma/r_michaloleksiejczuk.webp","k":"real"},{"id":"r_andreypulyaev","n":"Andrey Pulyaev","c":"BAI","a":28,"d":"middle","s":"pressure","o":74,"pt":75,"at":[72,71,86,71,78,67,81,71,71,73],"sk":"#da9d8e","hr":"#573f38","hs":"corto","bald":0,"ph":"assets/players/mma/r_andreypulyaev.webp","k":"real"},{"id":"r_julienleblanc","n":"Julien Leblanc","c":"KAI","a":34,"d":"middle","s":"counter","o":74,"pt":74,"at":[73,75,71,75,75,70,73,75,71,81],"sk":"#d38c79","hr":"#e2aa91","hs":"corto","bald":0,"ph":"assets/players/mma/r_julienleblanc.webp","k":"real"},{"id":"r_mattbessette","n":"Matt Bessette","c":"KAI","a":33,"d":"middle","s":"pressure","o":73,"pt":73,"at":[78,69,83,70,68,69,80,71,67,75],"sk":"#b08276","hr":"#d2b1a7","hs":"buzz","bald":0,"ph":"assets/players/mma/r_mattbessette.webp","k":"real"},{"id":"r_marcandrebarriault","n":"Marc Andre Barriault","c":"MEL","a":35,"d":"middle","s":"wrestler","o":73,"pt":73,"at":[70,72,78,73,89,75,69,67,68,68],"sk":"#dc9686","hr":"#4d3633","hs":"corto","bald":0,"ph":"assets/players/mma/r_marcandrebarriault.webp","k":"real"},{"id":"r_ozzydiaz","n":"Ozzy Diaz","c":"OVM","a":35,"d":"middle","s":"pressure","o":72,"pt":72,"at":[68,81,81,67,68,68,73,74,64,76],"sk":"#d99375","hr":"#1c1513","hs":"corto","bald":0,"ph":"assets/players/mma/r_ozzydiaz.webp","k":"real"},{"id":"r_cesaralmeida","n":"Cesar Almeida","c":"TAM","a":31,"d":"middle","s":"grappler","o":72,"pt":72,"at":[70,65,75,70,70,79,70,75,73,73],"sk":"#be7a5d","hr":"#9c6f65","hs":"buzz","bald":0,"ph":"assets/players/mma/r_cesaralmeida.webp","k":"real"},{"id":"r_romankopylov","n":"Roman Kopylov","c":"BAI","a":33,"d":"middle","s":"counter","o":72,"pt":72,"at":[73,80,64,68,76,72,71,76,68,72],"sk":"#e4997b","hr":"#1a0e0b","hs":"media","bald":0,"ph":"assets/players/mma/r_romankopylov.webp","k":"real"},{"id":"r_zacharyreese","n":"Zachary Reese","c":"MRG","a":32,"d":"middle","s":"counter","o":70,"pt":70,"at":[71,82,67,67,67,69,67,66,67,76],"sk":"#de9f88","hr":"#72574e","hs":"corto","bald":0,"ph":"assets/players/mma/r_zacharyreese.webp","k":"real"},{"id":"x_mmaf05400001","n":"Khabib Osipov","c":"BAI","a":25,"d":"middle","s":"wrestler","o":69,"pt":75,"at":[74,71,64,65,79,75,66,68,65,64],"sk":"#bf8675","hr":"#25221f","hs":"trencitas","bald":0,"ph":"assets/players/mma/x_mmaf05400001.webp","k":"fict"},{"id":"r_jiriprochazka","n":"Jiri Prochazka","c":"ESV","a":33,"d":"lightheavy","s":"pressure","o":90,"pt":90,"at":[92,86,96,85,91,87,85,89,83,96],"sk":"#db9b81","hr":"#6e5245","hs":"corto","bald":0,"ph":"assets/players/mma/r_jiriprochazka.webp","k":"real"},{"id":"r_nikitakrylov","n":"Nikita Krylov","c":"ESV","a":34,"d":"lightheavy","s":"pressure","o":84,"pt":84,"at":[84,79,96,76,85,91,82,80,76,84],"sk":"#db9376","hr":"#412d25","hs":"corto","bald":0,"ph":"assets/players/mma/r_nikitakrylov.webp","k":"real"},{"id":"r_azamatmurzakanov","n":"Azamat Murzakanov","c":"KOS","a":37,"d":"lightheavy","s":"counter","o":83,"pt":83,"at":[88,91,79,69,80,78,80,95,82,87],"sk":"#d89175","hr":"#f1bd9d","hs":"corto","bald":0,"ph":"assets/players/mma/r_azamatmurzakanov.webp","k":"real"},{"id":"r_uransatybaldiev","n":"Uran Satybaldiev","c":"KOS","a":31,"d":"lightheavy","s":"pressure","o":77,"pt":77,"at":[73,77,86,67,76,85,75,83,74,74],"sk":"#e39a80","hr":"#221715","hs":"corto","bald":0,"ph":"assets/players/mma/r_uransatybaldiev.webp","k":"real"},{"id":"r_dustinjacoby","n":"Dustin Jacoby","c":"IBE","a":38,"d":"lightheavy","s":"counter","o":77,"pt":77,"at":[80,86,80,68,80,84,71,72,73,76],"sk":"#e89777","hr":"#59392b","hs":"corto","bald":0,"ph":"assets/players/mma/r_dustinjacoby.webp","k":"real"},{"id":"r_juniortafa","n":"Junior Tafa","c":"MRG","a":29,"d":"lightheavy","s":"grappler","o":76,"pt":77,"at":[65,77,76,69,76,92,73,74,79,78],"sk":"#d18764","hr":"#130f0f","hs":"corto","bald":0,"ph":"assets/players/mma/r_juniortafa.webp","k":"real"},{"id":"r_brunolopes","n":"Bruno Lopes","c":"TAM","a":32,"d":"lightheavy","s":"wrestler","o":76,"pt":76,"at":[79,75,83,67,83,79,69,70,78,77],"sk":"#d28966","hr":"#513d36","hs":"corto","bald":0,"ph":"assets/players/mma/r_brunolopes.webp","k":"real"},{"id":"r_juliuswalker","n":"Julius Walker","c":"MRG","a":26,"d":"lightheavy","s":"wrestler","o":75,"pt":76,"at":[77,72,77,58,83,83,68,74,76,80],"sk":"#cf8769","hr":"#332626","hs":"corto","bald":0,"ph":"assets/players/mma/r_juliuswalker.webp","k":"real"},{"id":"x_mmaf11000001","n":"Stefan Iskakov","c":"KOS","a":30,"d":"lightheavy","s":"pressure","o":73,"pt":74,"at":[65,69,93,62,68,71,72,75,77,76],"sk":"#b1816f","hr":"#1b1712","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf11000001.webp","k":"fict"},{"id":"r_marcinprachnio","n":"Marcin Prachnio","c":"ESV","a":37,"d":"lightheavy","s":"pressure","o":72,"pt":72,"at":[72,70,89,57,76,72,65,82,69,67],"sk":"#d49187","hr":"#6c544b","hs":"corto","bald":0,"ph":"assets/players/mma/r_marcinprachnio.webp","k":"real"},{"id":"x_mmaf01400001","n":"Matías Torres","c":"CUN","a":21,"d":"lightheavy","s":"counter","o":70,"pt":77,"at":[68,76,76,58,74,68,68,71,68,72],"sk":"#bb8363","hr":"#23170d","hs":"rastas","bald":0,"ph":"assets/players/mma/x_mmaf01400001.webp","k":"fict"},{"id":"r_rafaelcerqueira","n":"Rafael Cerqueira","c":"TAM","a":35,"d":"lightheavy","s":"counter","o":70,"pt":70,"at":[71,76,68,67,71,68,63,71,77,69],"sk":"#c8836b","hr":"#241c1c","hs":"corto","bald":0,"ph":"assets/players/mma/r_rafaelcerqueira.webp","k":"real"},{"id":"r_mauriciorua","n":"Mauricio Rua","c":"TAM","a":44,"d":"lightheavy","s":"pressure","o":70,"pt":70,"at":[71,68,88,58,74,64,69,73,68,67],"sk":"#b98e86","hr":"#363030","hs":"buzz","bald":0,"ph":"assets/players/mma/r_mauriciorua.webp","k":"real"},{"id":"r_diyarnurgozhay","n":"Diyar Nurgozhay","c":"KOS","a":28,"d":"lightheavy","s":"grappler","o":69,"pt":70,"at":[64,57,69,65,76,84,63,69,66,76],"sk":"#d1886d","hr":"#191212","hs":"corto","bald":0,"ph":"assets/players/mma/r_diyarnurgozhay.webp","k":"real"},{"id":"r_aleksandarrakic","n":"Aleksandar Rakic","c":"MEL","a":34,"d":"heavy","s":"pressure","o":84,"pt":84,"at":[83,79,96,67,76,88,84,89,86,89],"sk":"#d7927e","hr":"#1f1415","hs":"corto","bald":0,"ph":"assets/players/mma/r_aleksandarrakic.webp","k":"real"},{"id":"r_taituivasa","n":"Tai Tuivasa","c":"IBE","a":32,"d":"heavy","s":"pressure","o":82,"pt":82,"at":[79,83,95,76,74,88,77,79,84,85],"sk":"#dc8d7b","hr":"#3d2d2e","hs":"corto","bald":0,"ph":"assets/players/mma/r_taituivasa.webp","k":"real"},{"id":"r_jhonatadiniz","n":"Jhonata Diniz","c":"TAM","a":34,"d":"heavy","s":"grappler","o":80,"pt":80,"at":[80,76,89,74,76,88,87,82,74,74],"sk":"#c88374","hr":"#1b1112","hs":"corto","bald":0,"ph":"assets/players/mma/r_jhonatadiniz.webp","k":"real"},{"id":"r_ryanspann","n":"Ryan Spann","c":"MEL","a":34,"d":"heavy","s":"pressure","o":80,"pt":80,"at":[81,80,87,71,82,83,75,76,88,76],"sk":"#ad694f","hr":"#352826","hs":"corto","bald":0,"ph":"assets/players/mma/r_ryanspann.webp","k":"real"},{"id":"r_gablesteveson","n":"Gable Steveson","c":"IBE","a":26,"d":"heavy","s":"wrestler","o":80,"pt":81,"at":[76,82,93,71,93,78,70,77,81,79],"sk":"#ba7257","hr":"#312521","hs":"corto","bald":0,"ph":"assets/players/mma/r_gablesteveson.webp","k":"real"},{"id":"r_guilhermepat","n":"Guilherme Pat","c":"TAM","a":31,"d":"heavy","s":"counter","o":75,"pt":75,"at":[83,82,82,68,69,79,61,71,77,79],"sk":"#c97e5c","hr":"#302525","hs":"corto","bald":0,"ph":"assets/players/mma/r_guilhermepat.webp","k":"real"},{"id":"r_alvinhines","n":"Alvin Hines","c":"KAI","a":34,"d":"heavy","s":"counter","o":74,"pt":74,"at":[78,86,78,63,74,72,72,68,71,76],"sk":"#d78c78","hr":"#edab9b","hs":"corto","bald":0,"ph":"assets/players/mma/r_alvinhines.webp","k":"real"},{"id":"x_mmaf03600001","n":"Gustavo Coelho","c":"TAM","a":24,"d":"heavy","s":"pressure","o":73,"pt":89,"at":[65,65,89,63,74,71,71,69,84,78],"sk":"#b78069","hr":"#3c2b1e","hs":"rastas","bald":0,"ph":"assets/players/mma/x_mmaf03600001.webp","k":"fict"},{"id":"r_tyrellfortune","n":"Tyrell Fortune","c":"IBE","a":35,"d":"heavy","s":"pressure","o":72,"pt":72,"at":[63,72,84,67,69,75,74,66,73,77],"sk":"#a4634c","hr":"#805345","hs":"corto","bald":0,"ph":"assets/players/mma/r_tyrellfortune.webp","k":"real"},{"id":"r_mariopinto","n":"Mario Pinto","c":"TAM","a":28,"d":"heavy","s":"counter","o":70,"pt":71,"at":[73,68,73,64,62,72,63,68,77,81],"sk":"#ca7d62","hr":"#312424","hs":"corto","bald":0,"ph":"assets/players/mma/r_mariopinto.webp","k":"real"},{"id":"r_jovanleka","n":"Jovan Leka","c":"ESV","a":24,"d":"heavy","s":"pressure","o":67,"pt":71,"at":[63,60,85,52,67,78,64,62,68,71],"sk":"#b5a0a1","hr":"#2f2d2e","hs":"corto","bald":0,"ph":"assets/players/mma/r_jovanleka.webp","k":"real"},{"id":"x_mmaf10200001","n":"Marko Kuznetsov","c":"BAI","a":27,"d":"heavy","s":"counter","o":67,"pt":68,"at":[74,76,69,58,68,69,51,68,62,74],"sk":"#bc8b7a","hr":"#3e3228","hs":"trencitas","bald":0,"ph":"assets/players/mma/x_mmaf10200001.webp","k":"fict"},{"id":"x_mmaf10400001","n":"Lautaro Mbarga","c":"RIA","a":24,"d":"heavy","s":"pressure","o":66,"pt":79,"at":[67,60,81,58,67,67,62,61,74,65],"sk":"#bf896c","hr":"#281b11","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf10400001.webp","k":"fict"},{"id":"x_mmaf06900001","n":"Pieter Fjeld","c":"OVM","a":29,"d":"heavy","s":"grappler","o":66,"pt":68,"at":[55,63,72,61,71,76,57,65,64,75],"sk":"#c99479","hr":"#0f0d0a","hs":"rulos","bald":0,"ph":"assets/players/mma/x_mmaf06900001.webp","k":"fict"}],"pool":[{"id":"x_mmaf09200001","n":"Rohan Toledo","c":"TAM","a":30,"d":"fly","s":"counter","o":58,"pt":61,"at":[56,65,49,67,54,49,63,60,65,53],"sk":"#c39173","hr":"#241a12","hs":"flequillo","bald":0,"ph":"assets/players/mma/x_mmaf09200001.webp","k":"fict"},{"id":"x_mmaf01300001","n":"Hugo Ortega","c":"KAI","a":20,"d":"fly","s":"grappler","o":49,"pt":62,"at":[47,54,46,54,57,60,47,42,45,39],"sk":"#b88d73","hr":"#7b6d57","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf01300001.webp","k":"fict"},{"id":"x_mmaf07100001","n":"Khabib Tsereteli","c":"BAI","a":20,"d":"fly","s":"counter","o":48,"pt":64,"at":[46,46,43,58,45,52,56,40,51,43],"sk":"#bd896e","hr":"#17150d","hs":"crop","bald":0,"ph":"assets/players/mma/x_mmaf07100001.webp","k":"fict"},{"id":"r_monteljackson","n":"Montel Jackson","c":"KAI","a":34,"d":"bantam","s":"counter","o":70,"pt":70,"at":[69,75,64,70,69,73,72,67,73,69],"sk":"#8f533d","hr":"#342927","hs":"corto","bald":0,"ph":"assets/players/mma/r_monteljackson.webp","k":"real"},{"id":"r_jeanmatsumoto","n":"Jean Matsumoto","c":"TAM","a":25,"d":"bantam","s":"grappler","o":70,"pt":74,"at":[79,72,71,64,70,81,68,63,61,71],"sk":"#e8a489","hr":"#201516","hs":"corto","bald":0,"ph":"assets/players/mma/r_jeanmatsumoto.webp","k":"real"},{"id":"r_bekzatalmakhan","n":"Bekzat Almakhan","c":"KOS","a":28,"d":"bantam","s":"counter","o":70,"pt":71,"at":[71,75,65,73,65,77,71,71,67,64],"sk":"#da9581","hr":"#241a1a","hs":"corto","bald":0,"ph":"assets/players/mma/r_bekzatalmakhan.webp","k":"real"},{"id":"r_johnnymunoz","n":"Johnny Munoz","c":"MAG","a":31,"d":"bantam","s":"wrestler","o":69,"pt":69,"at":[69,69,59,71,79,63,68,65,68,79],"sk":"#e9a48e","hr":"#181112","hs":"corto","bald":0,"ph":"assets/players/mma/r_johnnymunoz.webp","k":"real"},{"id":"x_mmaf01800001","n":"Marko Kowalski","c":"ESV","a":27,"d":"bantam","s":"grappler","o":69,"pt":71,"at":[70,66,65,65,72,80,70,62,74,66],"sk":"#bf836b","hr":"#452917","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf01800001.webp","k":"fict"},{"id":"r_cristianperez","n":"Cristian Perez","c":"SOT","a":27,"d":"bantam","s":"counter","o":69,"pt":70,"at":[70,73,61,77,71,69,73,69,63,64],"sk":"#b29791","hr":"#0e0d10","hs":"corto","bald":0,"ph":"assets/players/mma/r_cristianperez.webp","k":"real"},{"id":"r_luisgurule","n":"Luis Gurule","c":"VAL","a":32,"d":"bantam","s":"pressure","o":68,"pt":68,"at":[64,68,68,70,65,70,73,64,67,71],"sk":"#cf8b68","hr":"#eca67f","hs":"corto","bald":0,"ph":"assets/players/mma/r_luisgurule.webp","k":"real"},{"id":"x_mmaf02800001","n":"Tomasz Georgiou","c":"BAI","a":32,"d":"bantam","s":"counter","o":67,"pt":68,"at":[76,79,60,71,72,65,66,55,63,63],"sk":"#b5846a","hr":"#27201a","hs":"raya","bald":0,"ph":"assets/players/mma/x_mmaf02800001.webp","k":"fict"},{"id":"r_adrianyanez","n":"Adrian Yanez","c":"MRG","a":32,"d":"bantam","s":"wrestler","o":67,"pt":67,"at":[65,64,70,67,75,70,71,66,58,64],"sk":"#cd8162","hr":"#1a1312","hs":"corto","bald":0,"ph":"assets/players/mma/r_adrianyanez.webp","k":"real"},{"id":"x_mmaf00600001","n":"Iván Farias","c":"TAM","a":25,"d":"bantam","s":"pressure","o":65,"pt":66,"at":[62,59,70,69,64,62,75,65,68,56],"sk":"#b78663","hr":"#161411","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf00600001.webp","k":"fict"},{"id":"x_mmaf05600001","n":"Brandon Marín","c":"GRA","a":30,"d":"bantam","s":"pressure","o":62,"pt":63,"at":[65,55,67,55,68,53,71,66,58,62],"sk":"#c18a69","hr":"#11110e","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf05600001.webp","k":"fict"},{"id":"x_mmaf09900001","n":"Ezequiel Magalhães","c":"TAM","a":27,"d":"bantam","s":"counter","o":62,"pt":63,"at":[68,72,53,63,62,56,69,58,57,62],"sk":"#be8f78","hr":"#451d0e","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf09900001.webp","k":"fict"},{"id":"x_mmaf00300001","n":"Anh Chen","c":"KOS","a":35,"d":"bantam","s":"pressure","o":60,"pt":64,"at":[60,52,65,61,58,72,54,62,58,57],"sk":"#ba8362","hr":"#685139","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf00300001.webp","k":"fict"},{"id":"r_jamiesiraj","n":"Jamie Siraj","c":"KAI","a":31,"d":"bantam","s":"pressure","o":60,"pt":60,"at":[61,55,63,70,63,53,60,52,60,64],"sk":"#cf8f82","hr":"#4c3630","hs":"corto","bald":0,"ph":"assets/players/mma/r_jamiesiraj.webp","k":"real"},{"id":"x_mmaf06700001","n":"Vinícius Ayala","c":"MAG","a":28,"d":"bantam","s":"pressure","o":56,"pt":60,"at":[52,50,61,62,57,53,57,55,61,52],"sk":"#bd8467","hr":"#17120d","hs":"mullet","bald":0,"ph":"assets/players/mma/x_mmaf06700001.webp","k":"fict"},{"id":"x_mmaf11400001","n":"Tua Johnson","c":"MAG","a":27,"d":"bantam","s":"pressure","o":53,"pt":55,"at":[54,58,52,54,47,45,62,49,56,52],"sk":"#a06848","hr":"#1c1b18","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf11400001.webp","k":"fict"},{"id":"r_rodrigovera","n":"Rodrigo Vera","c":"PER","a":30,"d":"feather","s":"wrestler","o":75,"pt":75,"at":[79,74,77,67,80,76,75,81,74,68],"sk":"#c0785c","hr":"#2d1e1b","hs":"corto","bald":0,"ph":"assets/players/mma/r_rodrigovera.webp","k":"real"},{"id":"r_austinspringer","n":"Austin Springer","c":"KAI","a":35,"d":"feather","s":"counter","o":74,"pt":74,"at":[74,85,67,79,75,78,69,69,79,65],"sk":"#c39789","hr":"#3a312a","hs":"corto","bald":0,"ph":"assets/players/mma/r_austinspringer.webp","k":"real"},{"id":"r_krongracie","n":"Kron Gracie","c":"TAM","a":37,"d":"feather","s":"grappler","o":74,"pt":74,"at":[81,70,68,76,69,82,66,71,78,79],"sk":"#b87256","hr":"#130f10","hs":"corto","bald":0,"ph":"assets/players/mma/r_krongracie.webp","k":"real"},{"id":"r_jesuspinedo","n":"Jesus Pinedo","c":"VAL","a":33,"d":"feather","s":"pressure","o":73,"pt":73,"at":[68,65,77,77,75,68,81,70,71,77],"sk":"#c09689","hr":"#171314","hs":"corto","bald":0,"ph":"assets/players/mma/r_jesuspinedo.webp","k":"real"},{"id":"r_stevegarcia","n":"Steve Garcia","c":"MAG","a":33,"d":"feather","s":"grappler","o":72,"pt":72,"at":[71,68,69,71,73,91,67,74,69,67],"sk":"#e39b7e","hr":"#281c1c","hs":"corto","bald":0,"ph":"assets/players/mma/r_stevegarcia.webp","k":"real"},{"id":"r_chepemariscal","n":"Chepe Mariscal","c":"SOT","a":33,"d":"feather","s":"counter","o":72,"pt":72,"at":[74,84,64,72,75,74,71,71,65,70],"sk":"#d79075","hr":"#3f2b22","hs":"corto","bald":0,"ph":"assets/players/mma/r_chepemariscal.webp","k":"real"},{"id":"r_salahdineparnasse","n":"Salahdine Parnasse","c":"KAI","a":28,"d":"feather","s":"grappler","o":72,"pt":73,"at":[66,68,72,81,66,84,72,74,69,69],"sk":"#c47149","hr":"#35231c","hs":"corto","bald":0,"ph":"assets/players/mma/r_salahdineparnasse.webp","k":"real"},{"id":"r_felipelima","n":"Felipe Lima","c":"TAM","a":28,"d":"feather","s":"grappler","o":71,"pt":72,"at":[76,74,62,69,71,81,68,65,76,69],"sk":"#d89270","hr":"#412e28","hs":"corto","bald":0,"ph":"assets/players/mma/r_felipelima.webp","k":"real"},{"id":"r_austinbashi","n":"Austin Bashi","c":"MEL","a":24,"d":"feather","s":"grappler","o":71,"pt":75,"at":[70,66,63,70,79,83,69,76,68,67],"sk":"#e19f89","hr":"#170d0a","hs":"corto","bald":0,"ph":"assets/players/mma/r_austinbashi.webp","k":"real"},{"id":"r_dennisbermudez","n":"Dennis Bermudez","c":"MRG","a":39,"d":"feather","s":"wrestler","o":71,"pt":71,"at":[68,70,75,66,90,78,61,71,69,63],"sk":"#9a736b","hr":"#191518","hs":"corto","bald":0,"ph":"assets/players/mma/r_dennisbermudez.webp","k":"real"},{"id":"r_carloshuachin","n":"Carlos Huachin","c":"MAG","a":33,"d":"feather","s":"pressure","o":71,"pt":71,"at":[67,63,70,74,79,68,70,69,71,79],"sk":"#ae8b7f","hr":"#1a1818","hs":"corto","bald":0,"ph":"assets/players/mma/r_carloshuachin.webp","k":"real"},{"id":"r_bogdangrad","n":"Bogdan Grad","c":"ESV","a":30,"d":"feather","s":"counter","o":71,"pt":71,"at":[76,80,70,80,63,67,62,66,68,78],"sk":"#e39e8a","hr":"#d4b4a9","hs":"corto","bald":0,"ph":"assets/players/mma/r_bogdangrad.webp","k":"real"},{"id":"x_mmaf08900001","n":"Trey Williams","c":"MOR","a":31,"d":"feather","s":"counter","o":70,"pt":72,"at":[73,76,70,77,68,62,73,60,70,72],"sk":"#c28665","hr":"#453e38","hs":"rastas","bald":0,"ph":"assets/players/mma/x_mmaf08900001.webp","k":"fict"},{"id":"x_mmaf09000001","n":"Agustín Barrios","c":"MAG","a":21,"d":"feather","s":"counter","o":68,"pt":79,"at":[72,73,66,66,64,76,66,69,67,61],"sk":"#c39277","hr":"#481c0b","hs":"buzz","bald":0,"ph":"assets/players/mma/x_mmaf09000001.webp","k":"fict"},{"id":"r_brendonmarotte","n":"Brendon Marotte","c":"MRG","a":38,"d":"feather","s":"counter","o":67,"pt":67,"at":[75,77,53,63,56,64,70,72,76,64],"sk":"#da9885","hr":"#38231d","hs":"corto","bald":0,"ph":"assets/players/mma/r_brendonmarotte.webp","k":"real"},{"id":"x_mmaf10700001","n":"Gabriel Sinisterra","c":"SOT","a":36,"d":"feather","s":"counter","o":66,"pt":72,"at":[73,83,61,63,65,65,60,66,60,64],"sk":"#b77c5f","hr":"#0e0f0c","hs":"media","bald":0,"ph":"assets/players/mma/x_mmaf10700001.webp","k":"fict"},{"id":"x_mmaf01100001","n":"Wilmer Cabrera","c":"TAM","a":36,"d":"feather","s":"counter","o":66,"pt":71,"at":[76,72,57,68,68,56,65,63,73,62],"sk":"#b5856d","hr":"#12120f","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf01100001.webp","k":"fict"},{"id":"x_mmaf01900001","n":"Marcos Fernández","c":"TAM","a":25,"d":"feather","s":"pressure","o":66,"pt":69,"at":[63,56,72,67,61,67,73,70,69,61],"sk":"#b1826a","hr":"#aea27c","hs":"crop","bald":0,"ph":"assets/players/mma/x_mmaf01900001.webp","k":"fict"},{"id":"r_rafaelalves","n":"Rafael Alves","c":"TAM","a":32,"d":"feather","s":"counter","o":65,"pt":65,"at":[70,75,57,67,63,67,66,57,64,65],"sk":"#d88f6f","hr":"#1f1d20","hs":"corto","bald":0,"ph":"assets/players/mma/r_rafaelalves.webp","k":"real"},{"id":"x_mmaf03000001","n":"Gustavo Sakamoto","c":"TAM","a":29,"d":"feather","s":"counter","o":65,"pt":70,"at":[70,74,52,58,70,64,70,62,67,64],"sk":"#ad7758","hr":"#503c2b","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf03000001.webp","k":"fict"},{"id":"x_mmaf05200001","n":"Pablo Walsh","c":"OVM","a":35,"d":"feather","s":"grappler","o":65,"pt":70,"at":[74,73,55,65,62,68,63,67,58,64],"sk":"#b57660","hr":"#342920","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf05200001.webp","k":"fict"},{"id":"r_sungbinjo","n":"Sung Bin Jo","c":"TAM","a":30,"d":"feather","s":"wrestler","o":65,"pt":65,"at":[65,67,67,65,72,59,64,62,66,62],"sk":"#bf9686","hr":"#151419","hs":"corto","bald":0,"ph":"assets/players/mma/r_sungbinjo.webp","k":"real"},{"id":"r_davidonama","n":"David Onama","c":"MRG","a":30,"d":"feather","s":"pressure","o":64,"pt":64,"at":[61,60,78,68,70,65,67,52,57,61],"sk":"#6b4a44","hr":"#2a2425","hs":"corto","bald":0,"ph":"assets/players/mma/r_davidonama.webp","k":"real"},{"id":"x_mmaf02600001","n":"Hugo Ferrari","c":"KAI","a":30,"d":"feather","s":"pressure","o":64,"pt":67,"at":[68,57,71,62,68,61,64,62,63,65],"sk":"#bf8975","hr":"#403121","hs":"buzz","bald":0,"ph":"assets/players/mma/x_mmaf02600001.webp","k":"fict"},{"id":"x_mmaf04900001","n":"Callum Orlando","c":"MEL","a":36,"d":"feather","s":"pressure","o":64,"pt":67,"at":[66,57,73,70,61,69,65,59,59,60],"sk":"#bd856d","hr":"#18140e","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf04900001.webp","k":"fict"},{"id":"r_muhammadnaimov","n":"Muhammad Naimov","c":"KOS","a":31,"d":"feather","s":"grappler","o":62,"pt":62,"at":[63,67,58,59,58,67,56,64,61,66],"sk":"#ce917d","hr":"#27191a","hs":"corto","bald":0,"ph":"assets/players/mma/r_muhammadnaimov.webp","k":"real"},{"id":"x_mmaf00200001","n":"Maximiliano Musso","c":"CUN","a":27,"d":"feather","s":"counter","o":61,"pt":65,"at":[61,74,52,64,59,62,56,60,64,57],"sk":"#bc8263","hr":"#695437","hs":"rulos","bald":0,"ph":"assets/players/mma/x_mmaf00200001.webp","k":"fict"},{"id":"x_mmaf07300001","n":"Lautaro Santos","c":"SOT","a":25,"d":"feather","s":"counter","o":60,"pt":63,"at":[67,70,57,59,59,55,61,55,57,59],"sk":"#b88265","hr":"#2b160b","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf07300001.webp","k":"fict"},{"id":"x_mmat200000001","n":"Nicolás Freitas","c":"TAM","a":31,"d":"feather","s":"counter","o":59,"pt":64,"at":[67,65,55,58,58,56,58,57,55,60],"sk":"#a6755d","hr":"#634f3c","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmat200000001.webp","k":"fict"},{"id":"x_mmaf05300001","n":"Pieter Bakker","c":"MRG","a":25,"d":"feather","s":"counter","o":59,"pt":63,"at":[64,61,54,62,65,56,51,61,60,56],"sk":"#b37a64","hr":"#422816","hs":"raya","bald":0,"ph":"assets/players/mma/x_mmaf05300001.webp","k":"fict"},{"id":"x_mmaf10000001","n":"Thiago Núñez","c":"TAM","a":27,"d":"feather","s":"counter","o":58,"pt":63,"at":[54,69,54,54,63,56,55,60,56,60],"sk":"#95634e","hr":"#36281b","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf10000001.webp","k":"fict"},{"id":"x_mmaf10800001","n":"Nicolás Mendoza","c":"MAG","a":25,"d":"feather","s":"counter","o":58,"pt":60,"at":[61,73,60,66,61,56,52,55,47,49],"sk":"#bd856c","hr":"#1d140d","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf10800001.webp","k":"fict"},{"id":"x_mmaf02400001","n":"Matías Benítez","c":"TAM","a":36,"d":"feather","s":"pressure","o":57,"pt":58,"at":[61,54,61,56,53,63,60,52,55,56],"sk":"#aa795b","hr":"#4f3d2a","hs":"jopo","bald":0,"ph":"assets/players/mma/x_mmaf02400001.webp","k":"fict"},{"id":"x_mmaf04800001","n":"Mason Camargo","c":"TAM","a":31,"d":"feather","s":"counter","o":57,"pt":62,"at":[56,72,48,59,53,57,56,60,49,61],"sk":"#b27352","hr":"#0a1d12","hs":"engominado","bald":0,"ph":"assets/players/mma/x_mmaf04800001.webp","k":"fict"},{"id":"x_mmaf06300001","n":"Enzo Baranov","c":"BAI","a":25,"d":"feather","s":"counter","o":56,"pt":57,"at":[57,67,50,59,47,62,56,49,56,58],"sk":"#cb9880","hr":"#71502c","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf06300001.webp","k":"fict"},{"id":"x_mmaf08600001","n":"Marcos Miranda","c":"VAL","a":31,"d":"feather","s":"counter","o":54,"pt":60,"at":[54,57,51,55,53,47,56,55,59,52],"sk":"#b07a61","hr":"#3e3326","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf08600001.webp","k":"fict"},{"id":"x_mmaf08300001","n":"Declan Sutherland","c":"KAI","a":21,"d":"feather","s":"pressure","o":52,"pt":60,"at":[54,42,50,60,57,49,57,47,55,49],"sk":"#c49579","hr":"#392e22","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf08300001.webp","k":"fict"},{"id":"r_ludovitklein","n":"Ludovit Klein","c":"ESV","a":30,"d":"light","s":"grappler","o":72,"pt":72,"at":[73,71,68,65,82,80,72,77,69,64],"sk":"#df9a7d","hr":"#5d4138","hs":"corto","bald":0,"ph":"assets/players/mma/r_ludovitklein.webp","k":"real"},{"id":"x_mmaf02100001","n":"Jalen Brooks","c":"VAL","a":28,"d":"light","s":"counter","o":71,"pt":74,"at":[81,74,71,67,67,69,69,67,74,71],"sk":"#bf9176","hr":"#785b42","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf02100001.webp","k":"fict"},{"id":"r_jimmiller","n":"Jim Miller","c":"KAI","a":42,"d":"light","s":"grappler","o":71,"pt":71,"at":[76,72,71,57,75,86,68,68,77,60],"sk":"#dd9c86","hr":"#44352f","hs":"corto","bald":0,"ph":"assets/players/mma/r_jimmiller.webp","k":"real"},{"id":"r_rosspearson","n":"Ross Pearson","c":"MRG","a":41,"d":"light","s":"grappler","o":71,"pt":71,"at":[75,73,74,66,71,82,59,71,68,71],"sk":"#b48b7e","hr":"#695550","hs":"buzz","bald":0,"ph":"assets/players/mma/r_rosspearson.webp","k":"real"},{"id":"r_richiesmullen","n":"Richie Smullen","c":"KAI","a":36,"d":"light","s":"pressure","o":71,"pt":71,"at":[73,65,75,72,70,78,61,65,76,75],"sk":"#b3837b","hr":"#221d1e","hs":"corto","bald":0,"ph":"assets/players/mma/r_richiesmullen.webp","k":"real"},{"id":"r_yilizhatimaimaitijiang","n":"Yilizhati Maimaitijiang","c":"TAM","a":30,"d":"light","s":"grappler","o":70,"pt":70,"at":[72,65,67,66,78,86,62,69,64,71],"sk":"#dea375","hr":"#0d0806","hs":"corto","bald":0,"ph":"assets/players/mma/r_yilizhatimaimaitijiang.webp","k":"real"},{"id":"r_austinhubbard","n":"Austin Hubbard","c":"MEL","a":33,"d":"light","s":"pressure","o":70,"pt":70,"at":[75,73,72,73,71,68,68,62,75,63],"sk":"#d6917c","hr":"#6b4634","hs":"corto","bald":0,"ph":"assets/players/mma/r_austinhubbard.webp","k":"real"},{"id":"r_darriusflowers","n":"Darrius Flowers","c":"MEL","a":32,"d":"light","s":"grappler","o":69,"pt":69,"at":[70,68,68,62,70,79,70,67,69,68],"sk":"#935a46","hr":"#362828","hs":"corto","bald":0,"ph":"assets/players/mma/r_darriusflowers.webp","k":"real"},{"id":"r_benjohnston","n":"Ben Johnston","c":"KAI","a":35,"d":"light","s":"counter","o":67,"pt":67,"at":[79,71,65,58,63,74,64,71,60,65],"sk":"#bb7b62","hr":"#906454","hs":"corto","bald":0,"ph":"assets/players/mma/r_benjohnston.webp","k":"real"},{"id":"r_jamalpogues","n":"Jamal Pogues","c":"OVM","a":32,"d":"light","s":"counter","o":67,"pt":67,"at":[72,73,61,70,68,73,65,60,64,64],"sk":"#a8654e","hr":"#3d2c29","hs":"corto","bald":0,"ph":"assets/players/mma/r_jamalpogues.webp","k":"real"},{"id":"x_mmaf05900001","n":"Bruno Giménez","c":"MAG","a":31,"d":"light","s":"pressure","o":66,"pt":72,"at":[65,59,78,67,63,66,67,60,66,70],"sk":"#c28d73","hr":"#754b28","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf05900001.webp","k":"fict"},{"id":"x_mmaf04000001","n":"Liam Rossi","c":"OVM","a":31,"d":"light","s":"pressure","o":65,"pt":71,"at":[60,65,72,64,65,62,68,70,59,65],"sk":"#b97d66","hr":"#413324","hs":"colita","bald":0,"ph":"assets/players/mma/x_mmaf04000001.webp","k":"fict"},{"id":"x_mmaf05000001","n":"Cody Molefe","c":"SKO","a":34,"d":"light","s":"pressure","o":64,"pt":66,"at":[61,60,72,61,73,58,73,62,51,69],"sk":"#9e6644","hr":"#522413","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf05000001.webp","k":"fict"},{"id":"r_nurulloaliev","n":"Nurullo Aliev","c":"BAI","a":25,"d":"light","s":"counter","o":64,"pt":68,"at":[72,78,55,69,63,59,63,63,61,58],"sk":"#dfa18b","hr":"#452f28","hs":"corto","bald":0,"ph":"assets/players/mma/r_nurulloaliev.webp","k":"real"},{"id":"x_mmaf07500001","n":"Rafael Escobar","c":"MAG","a":28,"d":"light","s":"counter","o":64,"pt":65,"at":[60,69,66,66,68,64,65,59,57,66],"sk":"#b9866c","hr":"#10110d","hs":"buzz","bald":0,"ph":"assets/players/mma/x_mmaf07500001.webp","k":"fict"},{"id":"r_luispena","n":"Luis Pena","c":"OVM","a":32,"d":"light","s":"pressure","o":64,"pt":64,"at":[62,61,66,74,60,59,62,64,69,63],"sk":"#dc9a85","hr":"#533021","hs":"largo","bald":0,"ph":"assets/players/mma/r_luispena.webp","k":"real"},{"id":"r_danmoret","n":"Dan Moret","c":"KAI","a":35,"d":"light","s":"counter","o":63,"pt":63,"at":[64,74,68,61,60,60,59,67,61,57],"sk":"#af8578","hr":"#3f342f","hs":"corto","bald":0,"ph":"assets/players/mma/r_danmoret.webp","k":"real"},{"id":"x_mmaf07400001","n":"Mason Macedo","c":"TAM","a":30,"d":"light","s":"pressure","o":62,"pt":68,"at":[66,50,68,64,58,60,65,68,61,60],"sk":"#b4755b","hr":"#785539","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf07400001.webp","k":"fict"},{"id":"x_mmaf01600001","n":"Lucas Rojas","c":"TAM","a":36,"d":"light","s":"pressure","o":61,"pt":64,"at":[63,63,68,58,63,61,62,50,57,65],"sk":"#af785f","hr":"#151411","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf01600001.webp","k":"fict"},{"id":"x_mmaf02000001","n":"Lautaro Dantas","c":"TAM","a":28,"d":"light","s":"grappler","o":53,"pt":54,"at":[45,53,46,51,50,73,50,58,49,56],"sk":"#ba7d62","hr":"#61472d","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf02000001.webp","k":"fict"},{"id":"x_mmaf11900001","n":"Callum Varga","c":"ESV","a":22,"d":"light","s":"grappler","o":48,"pt":63,"at":[46,42,39,50,55,54,45,53,45,52],"sk":"#cb977f","hr":"#4d3e2d","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf11900001.webp","k":"fict"},{"id":"r_levanchokheli","n":"Levan Chokheli","c":"MRG","a":29,"d":"welter","s":"counter","o":72,"pt":73,"at":[85,83,67,70,69,71,63,66,78,69],"sk":"#c07d66","hr":"#412c25","hs":"corto","bald":0,"ph":"assets/players/mma/r_levanchokheli.webp","k":"real"},{"id":"r_jonathanmicallef","n":"Jonathan Micallef","c":"KAI","a":26,"d":"welter","s":"grappler","o":71,"pt":72,"at":[70,66,71,70,73,84,65,74,63,74],"sk":"#d08569","hr":"#1c1416","hs":"corto","bald":0,"ph":"assets/players/mma/r_jonathanmicallef.webp","k":"real"},{"id":"r_jessinayari","n":"Jessin Ayari","c":"MRG","a":35,"d":"welter","s":"counter","o":71,"pt":71,"at":[72,87,70,64,66,78,58,72,71,72],"sk":"#c68f82","hr":"#352928","hs":"corto","bald":0,"ph":"assets/players/mma/r_jessinayari.webp","k":"real"},{"id":"x_mmaf08200001","n":"Brayan Gómez","c":"TAM","a":23,"d":"welter","s":"wrestler","o":70,"pt":78,"at":[73,73,66,69,81,71,66,70,72,58],"sk":"#ad7e66","hr":"#755e46","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf08200001.webp","k":"fict"},{"id":"r_islamdulatov","n":"Islam Dulatov","c":"BAI","a":27,"d":"welter","s":"counter","o":70,"pt":71,"at":[65,80,67,67,67,71,65,69,74,75],"sk":"#d19482","hr":"#110c0c","hs":"corto","bald":0,"ph":"assets/players/mma/r_islamdulatov.webp","k":"real"},{"id":"r_michelbatista","n":"Michel Batista","c":"TAM","a":35,"d":"welter","s":"counter","o":70,"pt":70,"at":[74,69,70,64,73,68,71,67,70,74],"sk":"#a37566","hr":"#684639","hs":"corto","bald":0,"ph":"assets/players/mma/r_michelbatista.webp","k":"real"},{"id":"r_franciscoprado","n":"Francisco Prado","c":"SOT","a":23,"d":"welter","s":"pressure","o":69,"pt":73,"at":[61,73,85,68,64,67,73,69,61,71],"sk":"#cf896f","hr":"#2f221e","hs":"corto","bald":0,"ph":"assets/players/mma/r_franciscoprado.webp","k":"real"},{"id":"r_obanelliott","n":"Oban Elliott","c":"IBE","a":28,"d":"welter","s":"pressure","o":69,"pt":70,"at":[72,70,74,74,67,70,75,60,65,62],"sk":"#c88577","hr":"#402c28","hs":"corto","bald":0,"ph":"assets/players/mma/r_obanelliott.webp","k":"real"},{"id":"r_alexanderyakovlev","n":"Alexander Yakovlev","c":"BAI","a":37,"d":"welter","s":"grappler","o":69,"pt":69,"at":[64,70,69,62,69,77,64,74,74,67],"sk":"#ac8a7f","hr":"#d0ae9c","hs":"corto","bald":0,"ph":"assets/players/mma/r_alexanderyakovlev.webp","k":"real"},{"id":"x_mmat100200001","n":"Ibrahim Osei","c":"SAH","a":29,"d":"welter","s":"wrestler","o":69,"pt":73,"at":[70,72,70,66,72,67,65,68,65,75],"sk":"#89583d","hr":"#4b1b15","hs":"undercut","bald":0,"ph":"assets/players/mma/x_mmat100200001.webp","k":"fict"},{"id":"r_sampatterson","n":"Sam Patterson","c":"IBE","a":29,"d":"welter","s":"pressure","o":68,"pt":69,"at":[69,73,83,67,66,60,68,66,67,60],"sk":"#d28a79","hr":"#6f4c3d","hs":"corto","bald":0,"ph":"assets/players/mma/r_sampatterson.webp","k":"real"},{"id":"r_chidinjokuani","n":"Chidi Njokuani","c":"IBE","a":36,"d":"welter","s":"counter","o":68,"pt":68,"at":[67,78,70,69,73,64,71,64,63,60],"sk":"#8c6457","hr":"#1c1b22","hs":"corto","bald":0,"ph":"assets/players/mma/r_chidinjokuani.webp","k":"real"},{"id":"x_mmaf09500001","n":"Gabriel Cardoso","c":"TAM","a":27,"d":"welter","s":"wrestler","o":68,"pt":70,"at":[63,70,72,64,74,71,68,67,63,69],"sk":"#9f6e57","hr":"#201b16","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf09500001.webp","k":"fict"},{"id":"r_michaeloliveira","n":"Michael Oliveira","c":"TAM","a":28,"d":"welter","s":"wrestler","o":68,"pt":69,"at":[71,72,62,74,78,60,61,66,65,71],"sk":"#6d5d5e","hr":"#11141a","hs":"buzz","bald":0,"ph":"assets/players/mma/r_michaeloliveira.webp","k":"real"},{"id":"r_juandiaz","n":"Juan Diaz","c":"OVM","a":27,"d":"welter","s":"pressure","o":68,"pt":69,"at":[64,69,72,72,66,69,73,65,64,66],"sk":"#cab0ad","hr":"#0c0b0f","hs":"corto","bald":0,"ph":"assets/players/mma/r_juandiaz.webp","k":"real"},{"id":"r_joshuaweems","n":"Joshua Weems","c":"MEL","a":33,"d":"welter","s":"wrestler","o":68,"pt":68,"at":[71,72,67,62,85,74,56,68,61,65],"sk":"#d8917c","hr":"#43595d","hs":"corto","bald":0,"ph":"assets/players/mma/r_joshuaweems.webp","k":"real"},{"id":"x_mmaf00400001","n":"Darius Moore","c":"SOT","a":33,"d":"welter","s":"wrestler","o":67,"pt":69,"at":[67,65,57,59,84,62,63,69,70,75],"sk":"#c08c6e","hr":"#835b3d","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf00400001.webp","k":"fict"},{"id":"x_mmaf03900001","n":"Kyle Zamora","c":"CUN","a":36,"d":"welter","s":"wrestler","o":67,"pt":68,"at":[71,63,65,63,70,74,71,66,62,64],"sk":"#c28664","hr":"#6f4d2a","hs":"mullet","bald":0,"ph":"assets/players/mma/x_mmaf03900001.webp","k":"fict"},{"id":"x_mmaf01200001","n":"Malik Carter","c":"KAI","a":34,"d":"welter","s":"pressure","o":65,"pt":71,"at":[62,63,69,63,57,76,68,61,69,61],"sk":"#b87c5c","hr":"#1a1a17","hs":"colita","bald":0,"ph":"assets/players/mma/x_mmaf01200001.webp","k":"fict"},{"id":"r_dontalemayes","n":"Dontale Mayes","c":"KAI","a":35,"d":"welter","s":"grappler","o":65,"pt":65,"at":[62,62,65,60,69,73,59,71,70,57],"sk":"#c3775c","hr":"#82584a","hs":"corto","bald":0,"ph":"assets/players/mma/r_dontalemayes.webp","k":"real"},{"id":"x_mmaf02200001","n":"Caio Mvondo","c":"RIA","a":27,"d":"welter","s":"wrestler","o":65,"pt":66,"at":[62,60,71,60,77,67,66,62,60,64],"sk":"#a9775d","hr":"#33271a","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf02200001.webp","k":"fict"},{"id":"x_mmaf03200001","n":"Takumi Sato","c":"NET","a":34,"d":"welter","s":"grappler","o":64,"pt":65,"at":[62,59,70,61,64,70,65,57,69,63],"sk":"#b48666","hr":"#3b1b0f","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf03200001.webp","k":"fict"},{"id":"x_mmaf03100001","n":"Moussa Diallo","c":"SAH","a":25,"d":"welter","s":"wrestler","o":64,"pt":67,"at":[66,60,62,55,63,70,62,62,69,71],"sk":"#976649","hr":"#231f17","hs":"undercut","bald":0,"ph":"assets/players/mma/x_mmaf03100001.webp","k":"fict"},{"id":"x_mmaf09400001","n":"Tomasz Volkov","c":"BAI","a":24,"d":"welter","s":"wrestler","o":63,"pt":71,"at":[61,59,58,61,75,66,63,60,62,64],"sk":"#b6846e","hr":"#110f0b","hs":"rastas","bald":0,"ph":"assets/players/mma/x_mmaf09400001.webp","k":"fict"},{"id":"x_mmaf10300001","n":"Darius Moura","c":"TAM","a":28,"d":"welter","s":"pressure","o":63,"pt":66,"at":[66,56,70,60,66,57,65,53,71,67],"sk":"#b57e5c","hr":"#703b1b","hs":"buzz","bald":0,"ph":"assets/players/mma/x_mmaf10300001.webp","k":"fict"},{"id":"x_mmaf09300001","n":"Yeison Alvarado","c":"SOT","a":20,"d":"welter","s":"pressure","o":63,"pt":77,"at":[61,63,75,59,62,57,66,63,64,59],"sk":"#ad775b","hr":"#7b5f3e","hs":"jopo","bald":0,"ph":"assets/players/mma/x_mmaf09300001.webp","k":"fict"},{"id":"r_carldeaton","n":"Carl Deaton","c":"OVM","a":33,"d":"welter","s":"grappler","o":63,"pt":63,"at":[72,60,67,57,58,73,57,64,58,64],"sk":"#de8f77","hr":"#805e54","hs":"corto","bald":0,"ph":"assets/players/mma/r_carldeaton.webp","k":"real"},{"id":"x_mmaf07200001","n":"Felipe Pereira","c":"TAM","a":30,"d":"welter","s":"pressure","o":63,"pt":67,"at":[58,59,83,63,62,51,70,59,62,63],"sk":"#a1765e","hr":"#1f1c15","hs":"rastas","bald":0,"ph":"assets/players/mma/x_mmaf07200001.webp","k":"fict"},{"id":"x_mmaf06800001","n":"Hugo Meijer","c":"MRG","a":22,"d":"welter","s":"grappler","o":62,"pt":71,"at":[59,64,54,58,70,69,65,65,56,60],"sk":"#d39e85","hr":"#2d1d10","hs":"puas","bald":0,"ph":"assets/players/mma/x_mmaf06800001.webp","k":"fict"},{"id":"x_mmaf06600001","n":"Jamal Reed","c":"IBE","a":34,"d":"welter","s":"wrestler","o":62,"pt":64,"at":[65,67,61,58,65,57,66,60,60,60],"sk":"#bb7a63","hr":"#8f674c","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf06600001.webp","k":"fict"},{"id":"r_farmanhasanov","n":"Farman Hasanov","c":"BAI","a":30,"d":"welter","s":"wrestler","o":62,"pt":62,"at":[58,56,70,54,74,60,61,61,63,62],"sk":"#ca8365","hr":"#271e1e","hs":"corto","bald":0,"ph":"assets/players/mma/r_farmanhasanov.webp","k":"real"},{"id":"x_mmaf01000001","n":"Brandon Thomas","c":"PER","a":27,"d":"welter","s":"counter","o":60,"pt":66,"at":[67,74,57,59,57,52,56,56,61,61],"sk":"#c69477","hr":"#1c1209","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf01000001.webp","k":"fict"},{"id":"x_mmaf08400001","n":"Stefan Horvat","c":"ZEN","a":27,"d":"welter","s":"counter","o":60,"pt":63,"at":[64,68,52,65,60,62,61,61,50,58],"sk":"#b7816a","hr":"#533e30","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf08400001.webp","k":"fict"},{"id":"x_mmaf06100001","n":"Marko Alekseev","c":"BAI","a":34,"d":"welter","s":"counter","o":60,"pt":61,"at":[58,71,66,55,56,56,68,50,67,54],"sk":"#b17d6a","hr":"#280e11","hs":"engominado","bald":0,"ph":"assets/players/mma/x_mmaf06100001.webp","k":"fict"},{"id":"x_mmaf05800001","n":"Brandon Foster","c":"GRA","a":23,"d":"welter","s":"counter","o":60,"pt":66,"at":[61,63,53,56,57,61,65,62,62,59],"sk":"#b78265","hr":"#4c3b27","hs":"raya","bald":0,"ph":"assets/players/mma/x_mmaf05800001.webp","k":"fict"},{"id":"x_mmaf07600001","n":"Brandon Haworth","c":"KAI","a":33,"d":"welter","s":"pressure","o":59,"pt":63,"at":[54,56,71,65,48,63,66,53,52,62],"sk":"#90593b","hr":"#603924","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf07600001.webp","k":"fict"},{"id":"x_mmaf09600001","n":"Tyrese Cepeda","c":"MAG","a":30,"d":"welter","s":"wrestler","o":59,"pt":60,"at":[61,58,54,56,66,57,62,54,57,65],"sk":"#805237","hr":"#13130e","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf09600001.webp","k":"fict"},{"id":"x_mmaf01700001","n":"Adrián Müller","c":"KAI","a":22,"d":"welter","s":"counter","o":58,"pt":72,"at":[56,69,60,51,61,51,57,64,53,58],"sk":"#c18c76","hr":"#7c5b41","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf01700001.webp","k":"fict"},{"id":"x_mmaf10500001","n":"Dae Brandão","c":"TAM","a":21,"d":"welter","s":"counter","o":58,"pt":68,"at":[71,62,51,58,50,57,60,55,64,51],"sk":"#bc8e74","hr":"#2f1813","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf10500001.webp","k":"fict"},{"id":"x_mmaf06000001","n":"Yeison Hayashi","c":"TAM","a":33,"d":"welter","s":"wrestler","o":57,"pt":62,"at":[51,54,58,58,74,60,54,54,54,54],"sk":"#b67c5d","hr":"#3d1f10","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf06000001.webp","k":"fict"},{"id":"x_mmaf11500001","n":"Zurab Sadykov","c":"KOS","a":24,"d":"welter","s":"pressure","o":57,"pt":63,"at":[48,55,63,57,56,52,64,53,63,57],"sk":"#c08773","hr":"#7f6c53","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf11500001.webp","k":"fict"},{"id":"x_mmat100100001","n":"Hiro Sharma","c":"KOS","a":21,"d":"welter","s":"wrestler","o":57,"pt":63,"at":[55,51,52,59,65,61,58,55,55,58],"sk":"#bb927a","hr":"#172f49","hs":"puas","bald":0,"ph":"assets/players/mma/x_mmat100100001.webp","k":"fict"},{"id":"x_mmaf10100001","n":"Jonas de Vries","c":"MEL","a":33,"d":"welter","s":"wrestler","o":56,"pt":62,"at":[60,49,61,58,70,55,53,54,57,42],"sk":"#bb7f6a","hr":"#382112","hs":"manbun","bald":0,"ph":"assets/players/mma/x_mmaf10100001.webp","k":"fict"},{"id":"x_mmat100000001","n":"Facundo Zárate","c":"VAL","a":22,"d":"welter","s":"counter","o":56,"pt":65,"at":[62,60,55,53,55,53,56,52,58,57],"sk":"#ac7d68","hr":"#411c0d","hs":"mullet","bald":0,"ph":"assets/players/mma/x_mmat100000001.webp","k":"fict"},{"id":"x_mmaf04300001","n":"Callum Bianchi","c":"OVM","a":27,"d":"welter","s":"counter","o":56,"pt":61,"at":[54,75,46,49,52,54,61,51,61,56],"sk":"#b07f66","hr":"#b1a796","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf04300001.webp","k":"fict"},{"id":"x_mmaf08800001","n":"Joaquín Yoshida","c":"TAM","a":26,"d":"welter","s":"counter","o":55,"pt":61,"at":[57,60,57,42,55,58,59,51,62,48],"sk":"#c79577","hr":"#371d0d","hs":"undercut","bald":0,"ph":"assets/players/mma/x_mmaf08800001.webp","k":"fict"},{"id":"x_mmaf11600001","n":"Zurab Tadić","c":"ZEN","a":21,"d":"welter","s":"wrestler","o":55,"pt":70,"at":[54,56,59,47,71,59,52,47,49,57],"sk":"#c38f77","hr":"#3e2a1a","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf11600001.webp","k":"fict"},{"id":"x_mmaf00800001","n":"Omar Haddad","c":"RIA","a":27,"d":"welter","s":"pressure","o":54,"pt":59,"at":[52,53,59,49,55,51,53,57,57,55],"sk":"#a16d4d","hr":"#332b20","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf00800001.webp","k":"fict"},{"id":"x_mmaf08700001","n":"Camilo Rezende","c":"TAM","a":22,"d":"welter","s":"counter","o":49,"pt":65,"at":[52,61,43,42,46,52,45,51,54,45],"sk":"#b67c5c","hr":"#2b1d13","hs":"rastas","bald":0,"ph":"assets/players/mma/x_mmaf08700001.webp","k":"fict"},{"id":"r_brunnoferreira","n":"Brunno Ferreira","c":"TAM","a":33,"d":"middle","s":"grappler","o":68,"pt":68,"at":[59,72,71,65,73,79,66,58,66,72],"sk":"#dd9783","hr":"#3b2924","hs":"corto","bald":0,"ph":"assets/players/mma/r_brunnoferreira.webp","k":"real"},{"id":"x_mmaf02900001","n":"Tyler Campbell","c":"KAI","a":24,"d":"middle","s":"wrestler","o":67,"pt":73,"at":[65,62,71,60,81,69,62,71,69,60],"sk":"#b77f5c","hr":"#4c2012","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf02900001.webp","k":"fict"},{"id":"r_thalesleites","n":"Thales Leites","c":"TAM","a":44,"d":"middle","s":"grappler","o":67,"pt":67,"at":[73,70,67,50,73,75,56,69,72,63],"sk":"#ad857a","hr":"#5e4c47","hs":"buzz","bald":0,"ph":"assets/players/mma/r_thalesleites.webp","k":"real"},{"id":"r_gilberturbina","n":"Gilbert Urbina","c":"MAG","a":30,"d":"middle","s":"pressure","o":67,"pt":67,"at":[67,64,73,61,73,66,68,68,65,64],"sk":"#d89072","hr":"#130e0f","hs":"corto","bald":0,"ph":"assets/players/mma/r_gilberturbina.webp","k":"real"},{"id":"r_ericmcconico","n":"Eric Mcconico","c":"KAI","a":35,"d":"middle","s":"wrestler","o":67,"pt":67,"at":[68,57,71,62,86,67,66,67,63,62],"sk":"#97553a","hr":"#744539","hs":"corto","bald":0,"ph":"assets/players/mma/r_ericmcconico.webp","k":"real"},{"id":"r_vlastocepo","n":"Vlasto Cepo","c":"ESV","a":31,"d":"middle","s":"grappler","o":67,"pt":67,"at":[67,61,68,68,68,81,59,73,59,66],"sk":"#cf8e7a","hr":"#1a110e","hs":"corto","bald":0,"ph":"assets/players/mma/r_vlastocepo.webp","k":"real"},{"id":"x_mmaf08500001","n":"Luka Ushakov","c":"BAI","a":27,"d":"middle","s":"wrestler","o":65,"pt":66,"at":[61,64,65,56,73,70,71,64,63,63],"sk":"#c59478","hr":"#221c15","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf08500001.webp","k":"fict"},{"id":"x_mmaf00100001","n":"Bruno Bassong","c":"RIA","a":25,"d":"middle","s":"counter","o":65,"pt":69,"at":[70,77,64,62,68,56,68,62,65,59],"sk":"#9a6a52","hr":"#1b1d16","hs":"colita","bald":0,"ph":"assets/players/mma/x_mmaf00100001.webp","k":"fict"},{"id":"x_mmaf08000001","n":"Julián Barbosa","c":"SOT","a":35,"d":"middle","s":"pressure","o":60,"pt":66,"at":[59,66,69,55,62,53,55,59,72,49],"sk":"#c28b6e","hr":"#331d0d","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf08000001.webp","k":"fict"},{"id":"x_mmaf10600001","n":"Thiago Nkembe","c":"RIA","a":32,"d":"middle","s":"wrestler","o":60,"pt":61,"at":[59,59,60,54,65,63,63,63,53,62],"sk":"#ad765a","hr":"#2d1f16","hs":"rulos","bald":0,"ph":"assets/players/mma/x_mmaf10600001.webp","k":"fict"},{"id":"x_mmaf04700001","n":"Camilo Correa","c":"CUN","a":25,"d":"middle","s":"counter","o":58,"pt":60,"at":[61,65,50,49,58,62,55,61,61,58],"sk":"#c18d6d","hr":"#2e2012","hs":"media","bald":0,"ph":"assets/players/mma/x_mmaf04700001.webp","k":"fict"},{"id":"x_mmaf07800001","n":"Adrián Turner","c":"OVM","a":29,"d":"middle","s":"wrestler","o":57,"pt":61,"at":[60,55,66,44,67,60,53,49,59,57],"sk":"#be896c","hr":"#49301c","hs":"rastas","bald":0,"ph":"assets/players/mma/x_mmaf07800001.webp","k":"fict"},{"id":"x_mmaf02700001","n":"Vinícius Souza","c":"PER","a":32,"d":"middle","s":"wrestler","o":57,"pt":59,"at":[56,58,66,50,66,59,55,55,56,48],"sk":"#ba8261","hr":"#684929","hs":"engominado","bald":0,"ph":"assets/players/mma/x_mmaf02700001.webp","k":"fict"},{"id":"x_mmat200100001","n":"Pieter Fiore","c":"MEL","a":30,"d":"middle","s":"wrestler","o":50,"pt":53,"at":[52,43,49,44,69,52,42,51,47,50],"sk":"#a96c5a","hr":"#4e3a27","hs":"engominado","bald":0,"ph":"assets/players/mma/x_mmat200100001.webp","k":"fict"},{"id":"r_bogdanguskov","n":"Bogdan Guskov","c":"BAI","a":33,"d":"lightheavy","s":"grappler","o":68,"pt":68,"at":[65,66,71,53,78,74,70,68,71,64],"sk":"#f3af92","hr":"#fdcab5","hs":"buzz","bald":0,"ph":"assets/players/mma/r_bogdanguskov.webp","k":"real"},{"id":"r_brendsonribeiro","n":"Brendson Ribeiro","c":"TAM","a":29,"d":"lightheavy","s":"wrestler","o":67,"pt":68,"at":[68,66,66,65,76,74,66,67,63,61],"sk":"#d2835f","hr":"#442f26","hs":"corto","bald":0,"ph":"assets/players/mma/r_brendsonribeiro.webp","k":"real"},{"id":"x_mmaf05700001","n":"Thiago Mekongo","c":"RIA","a":20,"d":"lightheavy","s":"pressure","o":65,"pt":79,"at":[57,57,74,58,74,60,69,61,73,66],"sk":"#a56e4f","hr":"#1b140f","hs":"puas","bald":0,"ph":"assets/players/mma/x_mmaf05700001.webp","k":"fict"},{"id":"x_mmaf06200001","n":"Julián Herrera","c":"TAM","a":33,"d":"lightheavy","s":"counter","o":63,"pt":66,"at":[70,70,70,49,63,60,64,64,58,63],"sk":"#aa775b","hr":"#191816","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf06200001.webp","k":"fict"},{"id":"x_mmaf05100001","n":"Kyle Bell","c":"IBE","a":29,"d":"lightheavy","s":"counter","o":63,"pt":64,"at":[68,72,65,56,60,65,55,66,58,65],"sk":"#c78f71","hr":"#3d2919","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf05100001.webp","k":"fict"},{"id":"x_mmaf04600001","n":"Ivan Pavlenko","c":"BAI","a":25,"d":"lightheavy","s":"counter","o":63,"pt":67,"at":[68,68,56,58,63,65,56,65,67,64],"sk":"#cd9b7e","hr":"#2a1b0f","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf04600001.webp","k":"fict"},{"id":"x_mmaf07000001","n":"Vinícius Ledesma","c":"SOT","a":36,"d":"lightheavy","s":"counter","o":62,"pt":68,"at":[69,71,64,57,60,62,60,61,58,60],"sk":"#b67d59","hr":"#986e4e","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf07000001.webp","k":"fict"},{"id":"x_mmaf11200001","n":"Cody Cisneros","c":"PER","a":23,"d":"lightheavy","s":"pressure","o":61,"pt":69,"at":[56,51,69,51,66,59,64,65,63,66],"sk":"#c2937a","hr":"#7b5f3f","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf11200001.webp","k":"fict"},{"id":"x_mmaf10900001","n":"Joaquín Suárez","c":"SOT","a":32,"d":"lightheavy","s":"pressure","o":60,"pt":62,"at":[69,54,66,51,59,57,65,64,53,62],"sk":"#b77e5e","hr":"#1c160e","hs":"rastas","bald":0,"ph":"assets/players/mma/x_mmaf10900001.webp","k":"fict"},{"id":"x_mmaf05500001","n":"Marcus Mitchell","c":"IBE","a":33,"d":"lightheavy","s":"counter","o":60,"pt":63,"at":[63,70,62,53,60,62,55,62,57,57],"sk":"#be8665","hr":"#241a0d","hs":"media","bald":0,"ph":"assets/players/mma/x_mmaf05500001.webp","k":"fict"},{"id":"x_mmaf04500001","n":"Kyle Sanders","c":"IBE","a":29,"d":"lightheavy","s":"pressure","o":59,"pt":61,"at":[66,51,77,52,51,51,62,59,57,64],"sk":"#c78d6d","hr":"#523b26","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf04500001.webp","k":"fict"},{"id":"x_mmaf04200001","n":"Zurab Novak","c":"KOS","a":28,"d":"lightheavy","s":"pressure","o":59,"pt":64,"at":[60,58,72,47,64,57,58,59,55,61],"sk":"#bd8970","hr":"#373024","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf04200001.webp","k":"fict"},{"id":"x_mmaf02500001","n":"Camilo Peralta","c":"SOT","a":20,"d":"lightheavy","s":"pressure","o":55,"pt":62,"at":[55,45,66,50,57,56,49,57,59,56],"sk":"#bd8a74","hr":"#60351f","hs":"manbun","bald":0,"ph":"assets/players/mma/x_mmaf02500001.webp","k":"fict"},{"id":"x_mmaf00500001","n":"Dmitri Jovanovic","c":"KOS","a":21,"d":"lightheavy","s":"grappler","o":54,"pt":66,"at":[55,51,54,51,54,61,54,47,55,59],"sk":"#b6886e","hr":"#110f09","hs":"raya","bald":0,"ph":"assets/players/mma/x_mmaf00500001.webp","k":"fict"},{"id":"x_mmaf03400001","n":"Tomasz Dragic","c":"KOS","a":31,"d":"lightheavy","s":"pressure","o":52,"pt":54,"at":[51,49,67,49,55,53,53,45,46,52],"sk":"#c38e77","hr":"#613e2e","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf03400001.webp","k":"fict"},{"id":"x_mmaf04400001","n":"Pieter MacDonald","c":"ZEN","a":21,"d":"lightheavy","s":"counter","o":49,"pt":61,"at":[54,54,56,45,47,36,46,55,53,42],"sk":"#be886f","hr":"#24180e","hs":"rastas","bald":0,"ph":"assets/players/mma/x_mmaf04400001.webp","k":"fict"},{"id":"r_alekseioleinik","n":"Aleksei Oleinik","c":"IBE","a":48,"d":"heavy","s":"grappler","o":65,"pt":65,"at":[60,76,73,45,74,75,45,72,71,60],"sk":"#cb9b8e","hr":"#91726a","hs":"corto","bald":0,"ph":"assets/players/mma/r_alekseioleinik.webp","k":"real"},{"id":"x_mmaf09800001","n":"Tariq Camara","c":"SAH","a":34,"d":"heavy","s":"counter","o":64,"pt":69,"at":[71,71,70,48,58,60,65,64,67,68],"sk":"#895e48","hr":"#1d1c16","hs":"media","bald":0,"ph":"assets/players/mma/x_mmaf09800001.webp","k":"fict"},{"id":"x_mmaf11100001","n":"Luka Zaitsev","c":"BAI","a":21,"d":"heavy","s":"counter","o":63,"pt":74,"at":[63,73,70,52,59,68,58,56,64,66],"sk":"#b58d79","hr":"#271f14","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf11100001.webp","k":"fict"},{"id":"x_mmaf06500001","n":"Tyrese Solano","c":"MOR","a":33,"d":"heavy","s":"pressure","o":62,"pt":68,"at":[57,63,87,57,54,58,60,57,56,71],"sk":"#ba8262","hr":"#080a08","hs":"corto","bald":0,"ph":"assets/players/mma/x_mmaf06500001.webp","k":"fict"},{"id":"x_mmaf11300001","n":"Tomasz Fomin","c":"BAI","a":20,"d":"heavy","s":"pressure","o":62,"pt":73,"at":[61,53,79,56,63,68,66,59,57,58],"sk":"#c79476","hr":"#6f543e","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf11300001.webp","k":"fict"},{"id":"x_mmaf11700001","n":"Jalen Jansen","c":"SKO","a":22,"d":"heavy","s":"pressure","o":59,"pt":70,"at":[55,58,75,51,55,61,56,57,62,60],"sk":"#b47853","hr":"#1f1d19","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf11700001.webp","k":"fict"},{"id":"x_mmaf00700001","n":"Lautaro Sosa","c":"TAM","a":26,"d":"heavy","s":"pressure","o":58,"pt":64,"at":[62,46,79,49,55,57,58,56,59,59],"sk":"#a97152","hr":"#5f4227","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf00700001.webp","k":"fict"},{"id":"x_mmaf00000001","n":"Zurab Nazarov","c":"KOS","a":35,"d":"heavy","s":"counter","o":56,"pt":61,"at":[57,74,65,46,59,55,45,53,52,54],"sk":"#c58873","hr":"#7c5e42","hs":"puas","bald":0,"ph":"assets/players/mma/x_mmaf00000001.webp","k":"fict"},{"id":"x_mmaf09700001","n":"Camilo Castro","c":"TAM","a":34,"d":"heavy","s":"counter","o":55,"pt":58,"at":[63,55,64,49,53,58,43,54,53,56],"sk":"#aa755b","hr":"#1f1b15","hs":"puas","bald":0,"ph":"assets/players/mma/x_mmaf09700001.webp","k":"fict"},{"id":"x_mmaf09100001","n":"Minjun Patel","c":"KOS","a":25,"d":"heavy","s":"counter","o":54,"pt":55,"at":[59,62,52,48,57,54,41,60,54,54],"sk":"#b78664","hr":"#422013","hs":"afro","bald":0,"ph":"assets/players/mma/x_mmaf09100001.webp","k":"fict"},{"id":"x_mmaf03500001","n":"Emeka Al-Farsi","c":"SAH","a":20,"d":"heavy","s":"counter","o":53,"pt":63,"at":[54,51,58,46,58,48,46,53,59,56],"sk":"#c19375","hr":"#6a523c","hs":"rapado","bald":1,"ph":"assets/players/mma/x_mmaf03500001.webp","k":"fict"}]};

class La { constructor(t = 1) { this.seed = t >>> 0; } next() { let t = (this.seed += 1831565813); return (t = Math.imul(t ^ (t >>> 15), t | 1)), (t ^= t + Math.imul(t ^ (t >>> 7), t | 61)), ((t ^ (t >>> 14)) >>> 0) / 4294967296; } range(t, e) { return t + this.next() * (e - t); } int(t, e) { return Math.floor(this.range(t, e + 1)); } pick(t) { return t[Math.floor(this.next() * t.length)]; } chance(t) { return this.next() < Math.max(0, Math.min(1, t)); } }
const te = (i, t = 0, e = 100) => Math.max(t, Math.min(e, i)),
  qi = (i, t) => DM.hypot(i.x - t.x, i.z - t.z),
  Ke = [
    { id: "fly", name: "Peso mosca", limit: 56.7 },
    { id: "bantam", name: "Peso gallo", limit: 61.2 },
    { id: "feather", name: "Peso pluma", limit: 65.8 },
    { id: "light", name: "Peso ligero", limit: 70.3 },
    { id: "welter", name: "Peso wélter", limit: 77.1 },
    { id: "middle", name: "Peso mediano", limit: 83.9 },
    { id: "lightheavy", name: "Peso semipesado", limit: 93 },
    { id: "heavy", name: "Peso pesado", limit: 120.2 },
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
// ---- Roster fijo (roster-llo.js): reales del UFC + ficticios con retrato. Los que faltan se generan con retrato gris. ----
const LLO_NICKS = ["EL LOBO", "VIPER", "COBRA", "RELÁMPAGO", "MARTILLO", "ZORRO", "HALCÓN", "BRUJO", "THE STORM", "IRON", "GHOST", "TITAN", "REAPER", "BLADE", "CONDOR", "TEMPEST", "SPARTAN", "NOMAD", "ROCKET", "SNIPER", "BULL", "PANTHER", "DRAGON", "ECLIPSE", "MAVERICK", "SAMURAI", "TIBURÓN", "FÉNIX", "HURRICANE", "KRAKEN", "GORILA", "TORNADO", "SILENCIO", "COMETA", "LEÓN", "GAVILÁN", "THE ANVIL", "SHADOW", "PIRANHA", "WOLVERINE"];
const lloHash = (str) => { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function fighterFromRoster(e, id) {
  const R = window.LLO_ROSTER, r = new La(lloHash(e.id)), a = {};
  R.attrs.forEach((k, j) => (a[k] = e.at[j]));
  const sp = e.n.indexOf(" "), first = sp > 0 ? e.n.slice(0, sp) : e.n, last = sp > 0 ? e.n.slice(sp + 1) : e.n, real = e.k === "real";
  return {
    id, firstName: first, lastName: last, nickname: LLO_NICKS[lloHash(e.id + "n") % LLO_NICKS.length], country: e.c, age: e.a, division: e.d, style: e.s, attributes: a,
    personality: { aggression: r.int(40, 90), patience: r.int(35, 80), courage: r.int(45, 90), conservatism: r.int(25, 75), finish: r.int(40, 92), discipline: r.int(45, 90) },
    record: real ? { wins: r.int(10, 27), losses: r.int(1, 9), draws: 0 } : { wins: r.int(4, 14), losses: r.int(0, 4), draws: 0 },
    rating: Math.round(1000 + (e.o - 55) * 18 + r.range(-25, 25)), popularity: real ? r.int(25, 65) : r.int(10, 32), morale: 80, condition: 100, potential: e.pt, history: [], streak: 0, lastFightDay: 0, injuryUntil: 0,
    retired: !1, defenses: 0, career: real ? "Contendiente" : "Prospecto", skin: e.sk, hair: e.hr, hairStyle: e.hs, photo: e.ph, rosterId: e.id, tactics: { ...xc }, contract: null, sponsor: null, training: [],
  };
}
function takeRosterFighter(division, used) {
  const R = window.LLO_ROSTER; if (!R) return null;
  let bi = -1, bd = 1e9;
  R.pool.forEach((e, j) => { if (used.has(e.id)) return; const d = (e.d === division ? 0 : 60) + (e.a > 27 ? (e.a - 27) * 3 : 0) + Math.random() * 10; if (d < bd) { bd = d; bi = j; } });
  return bi < 0 || bd > 45 ? null : R.pool[bi];
}
function dl() {
  if (window.LLO_ROSTER && window.LLO_ROSTER.initial) return window.LLO_ROSTER.initial.map((e, t) => fighterFromRoster(e, `f${t}`));
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
        : ((this.session.cage = DM.hypot(t.position.x, t.position.z) > 3),
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
          l = DM.cos(o),
          c = DM.sin(o),
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
export const STEP_SEC = sr;
export { Hs, dl, Ke, Pe, La, $t, zs, fighterFromRoster };
