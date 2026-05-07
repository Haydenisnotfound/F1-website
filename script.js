/* ═══════════════════════════════════════════════════════════
   F1 PULSE — 2026 Live Dashboard  |  app.js
   ═══════════════════════════════════════════════════════════
   All 2026 season data is hardcoded so the site renders
   instantly regardless of API availability. The Jolpica API
   is attempted silently in the background for session results
   inside the race-weekend modal only.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── CONFIG ── */
const API_BASE = 'https://api.jolpi.ca/ergast/f1';
const SEASON   = 2026;

/* ── TEAM COLOURS ── */
const TC = {
  mclaren:'#FF8000', mercedes:'#00D2BE', ferrari:'#E8002D',
  red_bull:'#3671C6', williams:'#64C4FF', aston_martin:'#229971',
  alpine:'#FF87BC', racing_bulls:'#6692FF', haas:'#B6BABD',
  audi:'#B5B5B5', cadillac:'#B20000',
};

/* ── FLAGS ── */
const FL = {
  British:'🇬🇧', Dutch:'🇳🇱', Monegasque:'🇲🇨', Spanish:'🇪🇸',
  Australian:'🇦🇺', Mexican:'🇲🇽', Canadian:'🇨🇦', Finnish:'🇫🇮',
  French:'🇫🇷', German:'🇩🇪', Japanese:'🇯🇵', Chinese:'🇨🇳',
  American:'🇺🇸', Thai:'🇹🇭', Danish:'🇩🇰', 'New Zealander':'🇳🇿',
  Argentine:'🇦🇷', Brazilian:'🇧🇷', Italian:'🇮🇹', Swedish:'🇸🇪',
  Swiss:'🇨🇭', Austrian:'🇦🇹', Polish:'🇵🇱', Belgian:'🇧🇪',
};

/* ── DRIVER HEADSHOTS ── */
const DI = {
  norris:     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Lando_Norris_2024_%28cropped%29.jpg/400px-Lando_Norris_2024_%28cropped%29.jpg',
  piastri:    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Oscar_Piastri_2024_%28cropped%29.jpg/400px-Oscar_Piastri_2024_%28cropped%29.jpg',
  russell:    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/George_Russell_2023_%28cropped%29.jpg/400px-George_Russell_2023_%28cropped%29.jpg',
  antonelli:  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Kimi_Antonelli_2024_%28cropped%29.jpg/400px-Kimi_Antonelli_2024_%28cropped%29.jpg',
  leclerc:    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Charles_Leclerc_2024_%28cropped%29.jpg/400px-Charles_Leclerc_2024_%28cropped%29.jpg',
  hamilton:   'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Lewis_Hamilton_2016_Malaysia_2.jpg/400px-Lewis_Hamilton_2016_Malaysia_2.jpg',
  max_verstappen:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Max_Verstappen_2023_%28cropped%29.jpg/400px-Max_Verstappen_2023_%28cropped%29.jpg',
  hadjar:     'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Isack_Hadjar_2024_%28cropped%29.jpg/400px-Isack_Hadjar_2024_%28cropped%29.jpg',
  albon:      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Alexander_Albon_2023_%28cropped%29.jpg/400px-Alexander_Albon_2023_%28cropped%29.jpg',
  sainz:      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Carlos_Sainz_Jr%2C_2023_%28cropped%29.jpg/400px-Carlos_Sainz_Jr%2C_2023_%28cropped%29.jpg',
  alonso:     'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Fernando_Alonso_2023_%28cropped%29.jpg/400px-Fernando_Alonso_2023_%28cropped%29.jpg',
  stroll:     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Lance_Stroll_2023_%28cropped%29.jpg/400px-Lance_Stroll_2023_%28cropped%29.jpg',
  gasly:      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Pierre_Gasly_2024_%28cropped%29.jpg/400px-Pierre_Gasly_2024_%28cropped%29.jpg',
  colapinto:  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Franco_Colapinto_2024_%28cropped%29.jpg/400px-Franco_Colapinto_2024_%28cropped%29.jpg',
  lawson:     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Liam_Lawson_2023_%28cropped%29.jpg/400px-Liam_Lawson_2023_%28cropped%29.jpg',
  lindblad:   'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Arvid_Lindblad_2024_%28cropped%29.jpg/400px-Arvid_Lindblad_2024_%28cropped%29.jpg',
  ocon:       'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Esteban_Ocon_2023_%28cropped%29.jpg/400px-Esteban_Ocon_2023_%28cropped%29.jpg',
  bearman:    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Oliver_Bearman_2024_%28cropped%29.jpg/400px-Oliver_Bearman_2024_%28cropped%29.jpg',
  hulkenberg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Nico_H%C3%BClkenberg_2023_%28cropped%29.jpg/400px-Nico_H%C3%BClkenberg_2023_%28cropped%29.jpg',
  bortoleto:  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Gabriel_Bortoleto_2024_%28cropped%29.jpg/400px-Gabriel_Bortoleto_2024_%28cropped%29.jpg',
  perez:      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Sergio_P%C3%A9rez_2023_%28cropped%29.jpg/400px-Sergio_P%C3%A9rez_2023_%28cropped%29.jpg',
  bottas:     'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Valtteri_Bottas_2022_%28cropped%29.jpg/400px-Valtteri_Bottas_2022_%28cropped%29.jpg',
};

/* ── CIRCUIT META: emoji + photo ── */
const CM = {
  albert_park:   { emoji:'🦘', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/2022_Australian_Grand_Prix_-_Race_Day_%2851950437316%29.jpg/800px-2022_Australian_Grand_Prix_-_Race_Day_%2851950437316%29.jpg' },
  shanghai:      { emoji:'🐉', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Shanghai_International_Circuit%2C_China%2C_aerial_photo%2C_2016.jpg/800px-Shanghai_International_Circuit%2C_China%2C_aerial_photo%2C_2016.jpg' },
  suzuka:        { emoji:'⛩️',  img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Suzuka_International_Racing_Course.jpg/800px-Suzuka_International_Racing_Course.jpg' },
  miami:         { emoji:'🌴', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/2022_Miami_Grand_Prix.jpg/800px-2022_Miami_Grand_Prix.jpg' },
  villeneuve:    { emoji:'🍁', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Circuit_Gilles_Villeneuve%2C_aerial_view.jpg/800px-Circuit_Gilles_Villeneuve%2C_aerial_view.jpg' },
  monaco:        { emoji:'🏰', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Monaco_Formula_1_Grand_Prix_2022.jpg/800px-Monaco_Formula_1_Grand_Prix_2022.jpg' },
  catalunya:     { emoji:'🐂', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Circuit_de_Barcelona-Catalunya%2C_aerial_view_%282016%29.jpg/800px-Circuit_de_Barcelona-Catalunya%2C_aerial_view_%282016%29.jpg' },
  red_bull_ring: { emoji:'🏔️', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Red_Bull_Ring%2C_aerial_view.jpg/800px-Red_Bull_Ring%2C_aerial_view.jpg' },
  silverstone:   { emoji:'👑', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Silverstone_Circuit_aerial.jpg/800px-Silverstone_Circuit_aerial.jpg' },
  spa:           { emoji:'🌲', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Raidillon_2022.jpg/800px-Raidillon_2022.jpg' },
  hungaroring:   { emoji:'🏛️', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Hungaroring%2C_aerial_photo.jpg/800px-Hungaroring%2C_aerial_photo.jpg' },
  zandvoort:     { emoji:'🌊', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/2021_Dutch_Grand_Prix_%2851436949671%29.jpg/800px-2021_Dutch_Grand_Prix_%2851436949671%29.jpg' },
  monza:         { emoji:'🏁', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Autodromo_Nazionale_di_Monza_aerial_crop.jpg/800px-Autodromo_Nazionale_di_Monza_aerial_crop.jpg' },
  madrid:        { emoji:'💃', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Madrid_Skyline_%28152920455%29.jpg/800px-Madrid_Skyline_%28152920455%29.jpg' },
  baku:          { emoji:'🏯', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2022_Azerbaijan_Grand_Prix_%2852018665024%29.jpg/800px-2022_Azerbaijan_Grand_Prix_%2852018665024%29.jpg' },
  marina_bay:    { emoji:'🌃', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/2022_Singapore_Grand_Prix_%2852362791268%29.jpg/800px-2022_Singapore_Grand_Prix_%2852362791268%29.jpg' },
  americas:      { emoji:'🤠', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Circuit_of_the_Americas_aerial_%28cropped%29.jpg/800px-Circuit_of_the_Americas_aerial_%28cropped%29.jpg' },
  rodriguez:     { emoji:'🌵', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2022_Mexican_Grand_Prix_%2852453023093%29.jpg/800px-2022_Mexican_Grand_Prix_%2852453023093%29.jpg' },
  interlagos:    { emoji:'🌿', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace_%28aerial_view%29.jpg/800px-Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace_%28aerial_view%29.jpg' },
  las_vegas:     { emoji:'🎰', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Las_Vegas_Strip_2023.jpg/800px-Las_Vegas_Strip_2023.jpg' },
  losail:        { emoji:'🏜️', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Losail_International_Circuit_aerial.jpg/800px-Losail_International_Circuit_aerial.jpg' },
  yas_marina:    { emoji:'🌅', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Yas_Marina_Circuit%2C_Abu_Dhabi%2C_United_Arab_Emirates_-_panoramio_%2882%29.jpg/800px-Yas_Marina_Circuit%2C_Abu_Dhabi%2C_United_Arab_Emirates_-_panoramio_%2882%29.jpg' },
  default:       { emoji:'🏎️', img:'' },
};

function circuitMeta(id) {
  if (!id) return CM.default;
  const s = id.toLowerCase();
  for (const [k, v] of Object.entries(CM)) {
    if (s.includes(k) || k.includes(s)) return v;
  }
  return CM.default;
}

/* ══════════════════════════════════════════════════════
   HARDCODED 2026 SEASON DATA
   (renders immediately — no API dependency)
══════════════════════════════════════════════════════ */

const DRIVERS_2026 = [
  { id:'norris',      first:'Lando',    last:'Norris',      num:'4',  nat:'British',       team:'McLaren',      teamId:'mclaren'      },
  { id:'piastri',     first:'Oscar',    last:'Piastri',     num:'81', nat:'Australian',    team:'McLaren',      teamId:'mclaren'      },
  { id:'russell',     first:'George',   last:'Russell',     num:'63', nat:'British',       team:'Mercedes',     teamId:'mercedes'     },
  { id:'antonelli',   first:'Kimi',     last:'Antonelli',   num:'12', nat:'Italian',       team:'Mercedes',     teamId:'mercedes'     },
  { id:'leclerc',     first:'Charles',  last:'Leclerc',     num:'16', nat:'Monegasque',    team:'Ferrari',      teamId:'ferrari'      },
  { id:'hamilton',    first:'Lewis',    last:'Hamilton',    num:'44', nat:'British',       team:'Ferrari',      teamId:'ferrari'      },
  { id:'max_verstappen',first:'Max',   last:'Verstappen',  num:'33', nat:'Dutch',         team:'Red Bull',     teamId:'red_bull'     },
  { id:'hadjar',      first:'Isack',    last:'Hadjar',      num:'6',  nat:'French',        team:'Red Bull',     teamId:'red_bull'     },
  { id:'albon',       first:'Alex',     last:'Albon',       num:'23', nat:'Thai',          team:'Williams',     teamId:'williams'     },
  { id:'sainz',       first:'Carlos',   last:'Sainz',       num:'55', nat:'Spanish',       team:'Williams',     teamId:'williams'     },
  { id:'alonso',      first:'Fernando', last:'Alonso',      num:'14', nat:'Spanish',       team:'Aston Martin', teamId:'aston_martin' },
  { id:'stroll',      first:'Lance',    last:'Stroll',      num:'18', nat:'Canadian',      team:'Aston Martin', teamId:'aston_martin' },
  { id:'gasly',       first:'Pierre',   last:'Gasly',       num:'10', nat:'French',        team:'Alpine',       teamId:'alpine'       },
  { id:'colapinto',   first:'Franco',   last:'Colapinto',   num:'43', nat:'Argentine',     team:'Alpine',       teamId:'alpine'       },
  { id:'lawson',      first:'Liam',     last:'Lawson',      num:'30', nat:'New Zealander', team:'Racing Bulls', teamId:'racing_bulls' },
  { id:'lindblad',    first:'Arvid',    last:'Lindblad',    num:'5',  nat:'Swedish',       team:'Racing Bulls', teamId:'racing_bulls' },
  { id:'ocon',        first:'Esteban',  last:'Ocon',        num:'31', nat:'French',        team:'Haas',         teamId:'haas'         },
  { id:'bearman',     first:'Oliver',   last:'Bearman',     num:'87', nat:'British',       team:'Haas',         teamId:'haas'         },
  { id:'hulkenberg',  first:'Nico',     last:'Hülkenberg',  num:'27', nat:'German',        team:'Audi',         teamId:'audi'         },
  { id:'bortoleto',   first:'Gabriel',  last:'Bortoleto',   num:'5',  nat:'Brazilian',     team:'Audi',         teamId:'audi'         },
  { id:'perez',       first:'Sergio',   last:'Pérez',       num:'11', nat:'Mexican',       team:'Cadillac',     teamId:'cadillac'     },
  { id:'bottas',      first:'Valtteri', last:'Bottas',      num:'77', nat:'Finnish',       team:'Cadillac',     teamId:'cadillac'     },
];

const TEAMS_2026 = [
  { id:'mercedes',     name:'Mercedes',      country:'Germany',        color:'#00D2BE', champs:8,  drivers:['russell','antonelli'],     pos:1, pts:180, wins:4 },
  { id:'ferrari',      name:'Ferrari',       country:'Italy',          color:'#E8002D', champs:16, drivers:['leclerc','hamilton'],      pos:2, pts:110, wins:0 },
  { id:'mclaren',      name:'McLaren',       country:'United Kingdom', color:'#FF8000', champs:8,  drivers:['norris','piastri'],        pos:3, pts:94,  wins:0 },
  { id:'red_bull',     name:'Red Bull',      country:'Austria',        color:'#3671C6', champs:6,  drivers:['max_verstappen','hadjar'], pos:4, pts:30,  wins:0 },
  { id:'alpine',       name:'Alpine',        country:'France',         color:'#FF87BC', champs:0,  drivers:['gasly','colapinto'],       pos:5, pts:23,  wins:0 },
  { id:'haas',         name:'Haas',          country:'USA',            color:'#B6BABD', champs:0,  drivers:['ocon','bearman'],          pos:6, pts:18,  wins:0 },
  { id:'racing_bulls', name:'Racing Bulls',  country:'Italy',          color:'#6692FF', champs:0,  drivers:['lawson','lindblad'],       pos:7, pts:14,  wins:0 },
  { id:'williams',     name:'Williams',      country:'United Kingdom', color:'#64C4FF', champs:9,  drivers:['albon','sainz'],           pos:8, pts:5,   wins:0 },
  { id:'audi',         name:'Audi',          country:'Germany',        color:'#B5B5B5', champs:0,  drivers:['hulkenberg','bortoleto'],  pos:9, pts:2,   wins:0 },
  { id:'aston_martin', name:'Aston Martin',  country:'United Kingdom', color:'#229971', champs:0,  drivers:['alonso','stroll'],         pos:10,pts:0,   wins:0 },
  { id:'cadillac',     name:'Cadillac',      country:'USA',            color:'#B20000', champs:0,  drivers:['perez','bottas'],          pos:11,pts:0,   wins:0 },
];

/* Driver standings — confirmed after Round 5, Canadian GP (May 24 2026) */
const DRIVER_STANDINGS = [
  { pos:1,  name:'Kimi Antonelli',    team:'Mercedes',     pts:100, wins:3 },
  { pos:2,  name:'George Russell',    team:'Mercedes',     pts:80,  wins:1 },
  { pos:3,  name:'Charles Leclerc',   team:'Ferrari',      pts:59,  wins:0 },
  { pos:4,  name:'Lando Norris',      team:'McLaren',      pts:51,  wins:0 },
  { pos:5,  name:'Lewis Hamilton',    team:'Ferrari',      pts:51,  wins:0 },
  { pos:6,  name:'Oscar Piastri',     team:'McLaren',      pts:43,  wins:0 },
  { pos:7,  name:'Max Verstappen',    team:'Red Bull',     pts:26,  wins:0 },
  { pos:8,  name:'Oliver Bearman',    team:'Haas',         pts:17,  wins:0 },
  { pos:9,  name:'Pierre Gasly',      team:'Alpine',       pts:16,  wins:0 },
  { pos:10, name:'Liam Lawson',       team:'Racing Bulls', pts:10,  wins:0 },
  { pos:11, name:'Franco Colapinto',  team:'Alpine',       pts:7,   wins:0 },
  { pos:12, name:'Arvid Lindblad',    team:'Racing Bulls', pts:4,   wins:0 },
  { pos:13, name:'Isack Hadjar',      team:'Red Bull',     pts:4,   wins:0 },
  { pos:14, name:'Carlos Sainz',      team:'Williams',     pts:4,   wins:0 },
  { pos:15, name:'Gabriel Bortoleto', team:'Audi',         pts:2,   wins:0 },
  { pos:16, name:'Esteban Ocon',      team:'Haas',         pts:1,   wins:0 },
  { pos:17, name:'Alex Albon',        team:'Williams',     pts:1,   wins:0 },
  { pos:18, name:'Nico Hülkenberg',   team:'Audi',         pts:0,   wins:0 },
  { pos:19, name:'Valtteri Bottas',   team:'Cadillac',     pts:0,   wins:0 },
  { pos:20, name:'Sergio Pérez',      team:'Cadillac',     pts:0,   wins:0 },
  { pos:21, name:'Fernando Alonso',   team:'Aston Martin', pts:0,   wins:0 },
  { pos:22, name:'Lance Stroll',      team:'Aston Martin', pts:0,   wins:0 },
];

/* Constructor standings — after Round 5 */
const CONSTRUCTOR_STANDINGS = [
  { pos:1,  team:'Mercedes',     color:'#00D2BE', pts:180, wins:4 },
  { pos:2,  team:'Ferrari',      color:'#E8002D', pts:110, wins:0 },
  { pos:3,  team:'McLaren',      color:'#FF8000', pts:94,  wins:0 },
  { pos:4,  team:'Red Bull',     color:'#3671C6', pts:30,  wins:0 },
  { pos:5,  team:'Alpine',       color:'#FF87BC', pts:23,  wins:0 },
  { pos:6,  team:'Haas',         color:'#B6BABD', pts:18,  wins:0 },
  { pos:7,  team:'Racing Bulls', color:'#6692FF', pts:14,  wins:0 },
  { pos:8,  team:'Williams',     color:'#64C4FF', pts:5,   wins:0 },
  { pos:9,  team:'Audi',         color:'#B5B5B5', pts:2,   wins:0 },
  { pos:10, team:'Aston Martin', color:'#229971', pts:0,   wins:0 },
  { pos:11, team:'Cadillac',     color:'#B20000', pts:0,   wins:0 },
];

/* Full 2026 race calendar — 22 rounds */
const RACES_2026 = [
  { round:1,  name:'Australian Grand Prix',    circuit:'Albert Park Circuit',            loc:'Melbourne, Australia',    date:'2026-03-08', time:'06:00:00Z', sprint:false, circuitId:'albert_park'   },
  { round:2,  name:'Chinese Grand Prix',       circuit:'Shanghai International Circuit', loc:'Shanghai, China',         date:'2026-03-15', time:'07:00:00Z', sprint:true,  circuitId:'shanghai'      },
  { round:3,  name:'Japanese Grand Prix',      circuit:'Suzuka International Racing Course',loc:'Suzuka, Japan',        date:'2026-03-29', time:'06:00:00Z', sprint:false, circuitId:'suzuka'        },
  { round:4,  name:'Miami Grand Prix',         circuit:'Miami International Autodrome',  loc:'Miami, USA',              date:'2026-05-03', time:'19:00:00Z', sprint:true,  circuitId:'miami'         },
  { round:5,  name:'Canadian Grand Prix',      circuit:'Circuit Gilles Villeneuve',      loc:'Montréal, Canada',        date:'2026-05-24', time:'18:00:00Z', sprint:true,  circuitId:'villeneuve'    },
  { round:6,  name:'Monaco Grand Prix',        circuit:'Circuit de Monaco',              loc:'Monte Carlo, Monaco',     date:'2026-06-07', time:'13:00:00Z', sprint:false, circuitId:'monaco'        },
  { round:7,  name:'Spanish Grand Prix',       circuit:'Circuit de Barcelona-Catalunya', loc:'Barcelona, Spain',        date:'2026-06-14', time:'13:00:00Z', sprint:false, circuitId:'catalunya'     },
  { round:8,  name:'Austrian Grand Prix',      circuit:'Red Bull Ring',                  loc:'Spielberg, Austria',      date:'2026-06-28', time:'13:00:00Z', sprint:false, circuitId:'red_bull_ring' },
  { round:9,  name:'British Grand Prix',       circuit:'Silverstone Circuit',            loc:'Silverstone, UK',         date:'2026-07-05', time:'14:00:00Z', sprint:true,  circuitId:'silverstone'   },
  { round:10, name:'Belgian Grand Prix',       circuit:'Circuit de Spa-Francorchamps',   loc:'Spa, Belgium',            date:'2026-07-19', time:'13:00:00Z', sprint:false, circuitId:'spa'           },
  { round:11, name:'Hungarian Grand Prix',     circuit:'Hungaroring',                    loc:'Budapest, Hungary',       date:'2026-07-26', time:'13:00:00Z', sprint:false, circuitId:'hungaroring'   },
  { round:12, name:'Dutch Grand Prix',         circuit:'Circuit Zandvoort',              loc:'Zandvoort, Netherlands',  date:'2026-08-23', time:'13:00:00Z', sprint:true,  circuitId:'zandvoort'     },
  { round:13, name:'Italian Grand Prix',       circuit:'Autodromo Nazionale Monza',      loc:'Monza, Italy',            date:'2026-09-06', time:'13:00:00Z', sprint:false, circuitId:'monza'         },
  { round:14, name:'Madrid Grand Prix',        circuit:'Circuit de Madrid',              loc:'Madrid, Spain',           date:'2026-09-14', time:'13:00:00Z', sprint:false, circuitId:'madrid'        },
  { round:15, name:'Azerbaijan Grand Prix',    circuit:'Baku City Circuit',              loc:'Baku, Azerbaijan',        date:'2026-09-27', time:'11:00:00Z', sprint:false, circuitId:'baku'          },
  { round:16, name:'Singapore Grand Prix',     circuit:'Marina Bay Street Circuit',      loc:'Singapore',               date:'2026-10-11', time:'12:00:00Z', sprint:true,  circuitId:'marina_bay'    },
  { round:17, name:'United States Grand Prix', circuit:'Circuit of the Americas',        loc:'Austin, USA',             date:'2026-10-25', time:'19:00:00Z', sprint:false, circuitId:'americas'      },
  { round:18, name:'Mexico City Grand Prix',   circuit:'Autodromo Hermanos Rodriguez',   loc:'Mexico City, Mexico',     date:'2026-11-01', time:'19:00:00Z', sprint:false, circuitId:'rodriguez'     },
  { round:19, name:'São Paulo Grand Prix',     circuit:'Autodromo José Carlos Pace',     loc:'São Paulo, Brazil',       date:'2026-11-08', time:'17:00:00Z', sprint:false, circuitId:'interlagos'    },
  { round:20, name:'Las Vegas Grand Prix',     circuit:'Las Vegas Strip Circuit',        loc:'Las Vegas, USA',          date:'2026-11-21', time:'06:00:00Z', sprint:false, circuitId:'las_vegas'     },
  { round:21, name:'Qatar Grand Prix',         circuit:'Lusail International Circuit',   loc:'Lusail, Qatar',           date:'2026-11-29', time:'17:00:00Z', sprint:false, circuitId:'losail'        },
  { round:22, name:'Abu Dhabi Grand Prix',     circuit:'Yas Marina Circuit',             loc:'Abu Dhabi, UAE',          date:'2026-12-06', time:'13:00:00Z', sprint:false, circuitId:'yas_marina'    },
];

/* ════════════════════════════════════
   HELPERS
════════════════════════════════════ */
const flag   = n  => FL[n] || '🏁';
const tColor = id => TC[id] || '#E10600';
const inits  = n  => n.split(/\s+/).map(w => w[0]).join('').slice(0,3).toUpperCase();
const posC   = p  => p==1?'g1':p==2?'g2':p==3?'g3':'';
const esc    = s  => s == null ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fbImg  = (f, l, c='e10600') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(f+' '+l)}&background=1a1a1a&color=${c.replace('#','')}&size=200&bold=true&font-size=0.38`;

/* ════════════════════════════════════
   NAVIGATION
════════════════════════════════════ */
document.getElementById('ham').addEventListener('click', () =>
  document.getElementById('nav-links').classList.toggle('open')
);
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () =>
    document.getElementById('nav-links').classList.remove('open')
  )
);
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a =>
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)
      );
    }
  });
}, { threshold: 0.3, rootMargin: '-58px 0px 0px 0px' });
['drivers','teams','schedule','standings'].forEach(id => {
  const el = document.getElementById(id);
  if (el) navObserver.observe(el);
});

/* ════════════════════════════════════
   COUNTDOWN
════════════════════════════════════ */
let cdInterval = null;

function startCountdown(race) {
  if (cdInterval) clearInterval(cdInterval);
  const meta = circuitMeta(race.circuitId);
  const target = new Date(`${race.date}T${race.time}`).getTime();
  document.getElementById('nrb-name').textContent = meta.emoji + ' ' + race.name;
  document.getElementById('nrb-meta').textContent =
    `Round ${race.round} · ${race.circuit} · ${race.loc}`;

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      ['cd-d','cd-h','cd-m','cd-s'].forEach(id => document.getElementById(id).textContent = '00');
      clearInterval(cdInterval);
      return;
    }
    document.getElementById('cd-d').textContent = String(Math.floor(diff / 86400000)).padStart(2,'0');
    document.getElementById('cd-h').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0');
    document.getElementById('cd-m').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
    document.getElementById('cd-s').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2,'0');
  }
  tick();
  cdInterval = setInterval(tick, 1000);
}

/* ════════════════════════════════════
   DRIVERS
════════════════════════════════════ */
function renderDriverCards(list) {
  const g = document.getElementById('drivers-grid');
  if (!list.length) { g.innerHTML = '<div class="no-match">NO DRIVERS MATCH YOUR FILTERS</div>'; return; }
  g.innerHTML = list.map(d => {
    const color = tColor(d.teamId);
    const img   = DI[d.id] || fbImg(d.first, d.last, color);
    return `
      <div class="d-card" style="--tc:${color}">
        <div class="d-img">
          <img src="${img}" alt="${esc(d.first)} ${esc(d.last)}" loading="lazy"
            onerror="this.src='${fbImg(d.first,d.last,color)}'">
          <div class="d-img-fade"></div>
          <div class="d-num">#${d.num}</div>
          <div class="d-flag">${flag(d.nat)}</div>
        </div>
        <div class="d-info">
          <div class="d-name">${esc(d.first)} <span>${esc(d.last)}</span></div>
          <div class="d-team">${esc(d.team)}</div>
          <div class="d-nat">${esc(d.nat)}</div>
        </div>
      </div>`;
  }).join('');
}

function initDrivers() {
  /* populate filters */
  const tf = document.getElementById('team-filter');
  const nf = document.getElementById('nat-filter');
  [...new Set(DRIVERS_2026.map(d => d.team))].sort().forEach(t => {
    const o = document.createElement('option'); o.value = t; o.textContent = t; tf.appendChild(o);
  });
  [...new Set(DRIVERS_2026.map(d => d.nat))].sort().forEach(n => {
    const o = document.createElement('option'); o.value = n; o.textContent = `${flag(n)} ${n}`; nf.appendChild(o);
  });

  function filter() {
    const q  = document.getElementById('drv-search').value.toLowerCase();
    const tv = tf.value, nv = nf.value;
    renderDriverCards(DRIVERS_2026.filter(d =>
      (!q  || `${d.first} ${d.last} ${d.team}`.toLowerCase().includes(q)) &&
      (!tv || d.team === tv) &&
      (!nv || d.nat  === nv)
    ));
  }
  document.getElementById('drv-search').addEventListener('input', filter);
  tf.addEventListener('change', filter);
  nf.addEventListener('change', filter);

  renderDriverCards(DRIVERS_2026);
  document.getElementById('hs-drivers').textContent = DRIVERS_2026.length;
}

/* ════════════════════════════════════
   TEAMS
════════════════════════════════════ */
function initTeams() {
  const g = document.getElementById('teams-grid');
  g.innerHTML = TEAMS_2026.map(t => {
    const isTop = t.pos === 1;
    const dNames = t.drivers.map(id => {
      const d = DRIVERS_2026.find(dr => dr.id === id);
      return d ? `${d.first} ${d.last}` : id;
    });
    return `
      <div class="t-card ${isTop ? 'leader' : ''}" style="--tc:${t.color}">
        ${isTop ? '<div class="leader-badge">★ Championship Leader</div>' : ''}
        <div class="t-logo-row">
          <div class="t-logo" style="color:${t.color};border-color:${t.color}40">${inits(t.name)}</div>
          <div><div class="t-name">${esc(t.name)}</div><div class="t-country">${esc(t.country)}</div></div>
        </div>
        <div class="t-drivers">${dNames.map(n => `<span class="d-chip">${esc(n)}</span>`).join('')}</div>
        <div class="t-stats">
          <div class="t-stat"><span class="t-stat-n">${t.pos}</span><span class="t-stat-l">Position</span></div>
          <div class="t-stat"><span class="t-stat-n">${t.pts}</span><span class="t-stat-l">Points</span></div>
          <div class="t-stat"><span class="t-stat-n">${t.champs}</span><span class="t-stat-l">WCC Titles</span></div>
        </div>
      </div>`;
  }).join('');
  document.getElementById('hs-teams').textContent = TEAMS_2026.length;
}

/* ════════════════════════════════════
   SCHEDULE
════════════════════════════════════ */
function initSchedule() {
  const now      = Date.now();
  const nextRace = RACES_2026.find(r => new Date(`${r.date}T${r.time}`).getTime() > now);
  const nextRound = nextRace ? nextRace.round : null;
  let doneCt = 0;

  if (nextRace) startCountdown(nextRace);
  else {
    /* season over */
    const last = RACES_2026[RACES_2026.length - 1];
    document.getElementById('nrb-name').textContent = '🏁 Season Complete';
    document.getElementById('nrb-meta').textContent = `Final Round: ${last.name}`;
    ['cd-d','cd-h','cd-m','cd-s'].forEach(id => document.getElementById(id).textContent = '00');
  }

  const g = document.getElementById('schedule-grid');
  g.innerHTML = RACES_2026.map(r => {
    const rt     = new Date(`${r.date}T${r.time}`).getTime();
    const past   = rt < now;
    const isNext = r.round === nextRound;
    if (past && !isNext) doneCt++;

    const lDate = new Date(`${r.date}T${r.time}`)
      .toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
    const lTime = new Date(`${r.date}T${r.time}`)
      .toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit', timeZoneName:'short' });

    const meta = circuitMeta(r.circuitId);

    let tags = '';
    if (isNext)    tags += '<span class="r-tag next">Next Race</span>';
    else if (past) tags += '<span class="r-tag done">Completed</span>';
    else           tags += '<span class="r-tag soon">Upcoming</span>';
    if (r.sprint)  tags += ' <span class="r-tag sprint">Sprint</span>';

    return `
      <div class="r-card ${isNext ? 'is-next' : ''} ${past && !isNext ? 'is-past' : ''}"
        onclick="openModal(${r.round})" tabindex="0" role="button" aria-label="View ${esc(r.name)} results">
        <div class="r-img">
          ${meta.img ? `<img src="${meta.img}" alt="${esc(r.name)}" loading="lazy" onerror="this.parentElement.style.background='var(--surface3)'">` : ''}
          <div class="r-img-overlay"></div>
          <div class="r-emoji">${meta.emoji}</div>
          <div class="r-badge-round">R${r.round}</div>
        </div>
        <div class="r-head">
          <div class="r-name">${esc(r.name)}</div>
          <div class="r-date">${lDate} · ${lTime}</div>
        </div>
        <div class="r-body">
          <div class="r-circuit">🏟 ${esc(r.circuit)}</div>
          <div class="r-loc">📍 ${esc(r.loc)}</div>
          <div class="r-tags">${tags}</div>
        </div>
        <div class="r-hint">TAP FOR RESULTS →</div>
      </div>`;
  }).join('');

  document.querySelectorAll('.r-card').forEach(c =>
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') c.click(); })
  );

  document.getElementById('hs-races').textContent = RACES_2026.length;
  document.getElementById('hs-done').textContent  = doneCt;
}

/* ════════════════════════════════════
   STANDINGS
════════════════════════════════════ */
function initStandings() {
  /* Driver table */
  document.getElementById('drv-standings').innerHTML = `
    <div class="st-head drv">
      <span>Pos</span><span>Driver</span>
      <span style="text-align:right">Pts</span>
      <span style="text-align:right">W</span>
    </div>
    ${DRIVER_STANDINGS.map(s => `
      <div class="st-row drv ${posC(s.pos)}">
        <span class="st-pos">${s.pos}</span>
        <div>
          <div class="st-en">${esc(s.name)}</div>
          <div class="st-sub">${esc(s.team)}</div>
        </div>
        <span class="st-pts">${s.pts}</span>
        <span class="st-wins">${s.wins}W</span>
      </div>`).join('')}`;

  document.getElementById('st-drv-src').textContent = 'After Round 5 — Canadian Grand Prix';

  /* Constructor table */
  document.getElementById('con-standings').innerHTML = `
    <div class="st-head con">
      <span>Pos</span><span>Team</span>
      <span style="text-align:right">Pts</span>
    </div>
    ${CONSTRUCTOR_STANDINGS.map(s => `
      <div class="st-row con ${posC(s.pos)}">
        <span class="st-pos">${s.pos}</span>
        <div>
          <div class="st-en" style="color:${s.color}">${esc(s.team)}</div>
          <div class="st-sub">${s.wins} win${s.wins !== 1 ? 's' : ''}</div>
        </div>
        <span class="st-pts">${s.pts}</span>
      </div>`).join('')}`;

  document.getElementById('st-con-src').textContent = 'After Round 5 — Canadian Grand Prix';
}

/* ════════════════════════════════════
   MODAL — RACE WEEKEND
════════════════════════════════════ */
let activeTab = null, activeRound = null;
const _cache = {};

async function apiFetch(path) {
  try {
    const r = await fetch(`${API_BASE}${path}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) { return null; }
}

function openModal(round) {
  const race = RACES_2026.find(r => r.round === round);
  if (!race) return;
  activeRound = round;

  const now  = Date.now();
  const past = new Date(`${race.date}T${race.time}`).getTime() < now;
  const meta = circuitMeta(race.circuitId);

  /* hero */
  const heroImg = document.getElementById('m-hero-img');
  heroImg.src = meta.img || '';
  heroImg.style.display = meta.img ? '' : 'none';
  heroImg.onerror = () => { heroImg.style.display = 'none'; };
  document.getElementById('m-hero-emoji').textContent = meta.emoji;
  document.getElementById('m-round').textContent =
    `Round ${race.round} · ${new Date(`${race.date}T${race.time}`).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}`;
  document.getElementById('m-name').textContent = race.name;
  document.getElementById('m-sub').textContent  = `${race.circuit} · ${race.loc}`;

  const tabBar     = document.getElementById('tab-bar');
  const tabContent = document.getElementById('tab-content');

  if (!past) {
    tabBar.innerHTML = '';
    const lDate = new Date(`${race.date}T${race.time}`)
      .toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    const lTime = new Date(`${race.date}T${race.time}`)
      .toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',timeZoneName:'long'});
    tabContent.innerHTML = `
      <div class="m-future">
        <span class="big-emoji">${meta.emoji}</span>
        <h3>${esc(race.name)}</h3>
        <div class="f-meta">${esc(race.circuit)} · ${esc(race.loc)}</div>
        <div class="date-box">
          <div class="date-lbl">Race Date</div>
          <div class="date-val">${lDate}</div>
          <div class="time-val">${lTime}</div>
        </div>
        ${race.sprint ? '<br><span class="r-tag sprint" style="display:inline-block;margin-top:.75rem">Sprint Weekend</span>' : ''}
      </div>`;
  } else {
    const tabs = [
      { id:'race',  label:'Race'       },
      { id:'quali', label:'Qualifying' },
      { id:'fp3',   label:'FP3'        },
      { id:'fp2',   label:'FP2'        },
      { id:'fp1',   label:'FP1'        },
    ];
    if (race.sprint) tabs.splice(1, 0, { id:'sprint', label:'Sprint' });
    activeTab = tabs[0].id;
    tabBar.innerHTML = tabs.map((t, i) =>
      `<button class="tab-btn ${i===0?'active':''}" onclick="switchTab('${t.id}',this)">${t.label}</button>`
    ).join('');
    renderSession(round, activeTab, tabContent);
  }

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function switchTab(session, btn) {
  if (session === activeTab) return;
  activeTab = session;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSession(activeRound, session, document.getElementById('tab-content'));
}

async function renderSession(round, session, el) {
  const key = `${SEASON}-${round}-${session}`;
  if (_cache[key]) {
    el.innerHTML = `<div class="tab-pane active">${_cache[key]}</div>`;
    return;
  }

  el.innerHTML = `<div class="tab-pane active"><div class="m-loading"><span class="spin"></span>Loading ${session} data…</div></div>`;

  const pathMap = {
    race:   `/${SEASON}/${round}/results/`,
    quali:  `/${SEASON}/${round}/qualifying/`,
    sprint: `/${SEASON}/${round}/sprint/`,
    fp1:    `/${SEASON}/${round}/practice/1/`,
    fp2:    `/${SEASON}/${round}/practice/2/`,
    fp3:    `/${SEASON}/${round}/practice/3/`,
  };

  const data = await apiFetch(pathMap[session]);
  const races = data?.MRData?.RaceTable?.Races;

  if (!races?.length) {
    const html = '<div class="m-empty">📭 Session data not yet available from the API for this event.</div>';
    _cache[key] = html;
    el.innerHTML = `<div class="tab-pane active">${html}</div>`;
    return;
  }

  const raceObj = races[0];
  const results = raceObj.Results || raceObj.QualifyingResults || raceObj.SprintResults || raceObj.PracticeResults || [];

  if (!results.length) {
    const html = '<div class="m-empty">📭 No results in this session yet.</div>';
    _cache[key] = html;
    el.innerHTML = `<div class="tab-pane active">${html}</div>`;
    return;
  }

  let html = '';
  if (session === 'race' || session === 'sprint') {
    html += buildPodium(results);
    html += buildRaceTable(results);
  } else if (session === 'quali') {
    html += buildPodium(results, 'quali');
    html += buildQualiTable(results);
  } else {
    html += buildPracticeTable(results);
  }

  _cache[key] = html;
  el.innerHTML = `<div class="tab-pane active">${html}</div>`;
}

function buildPodium(results, type = 'race') {
  if (results.length < 3) return '';
  const getTime = r => type === 'quali'
    ? (r.Q3 || r.Q2 || r.Q1 || '')
    : (r.Time?.time || (r.status && r.status !== 'Finished' ? r.status : '') || '');
  const [p1, p2, p3] = results;
  const slot = (r, trophy, cls, label) => `
    <div class="podium-slot ${cls}">
      <span class="pod-trophy">${trophy}</span>
      <div class="pod-pos">${label}</div>
      <div class="pod-name">${esc(r?.Driver?.familyName || '')}</div>
      <div class="pod-team">${esc(r?.Constructor?.name || '')}</div>
      <div class="pod-time">${esc(getTime(r))}</div>
    </div>`;
  return `<div class="podium">
    ${slot(p2,'🥈','p2','2ND')}
    ${slot(p1,'🥇','p1','1ST')}
    ${slot(p3,'🥉','p3','3RD')}
  </div>`;
}

function buildRaceTable(results) {
  return `<div class="res-wrap"><table class="res-table">
    <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Time / Gap</th><th class="r">Pts</th></tr></thead>
    <tbody>${results.map(r => {
      const pos = +r.position || 0;
      const fl  = r.FastestLap?.rank === '1';
      const timeStr = r.Time?.time || (r.status && r.status !== 'Finished' ? r.status : '—');
      const dImg = DI[r.Driver?.driverId];
      const avatar = dImg
        ? `<img src="${dImg}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:.35rem;border:1px solid ${tColor(r.Constructor?.constructorId||'')}" loading="lazy" onerror="this.remove()">`
        : '';
      return `<tr class="rp${pos<=3?pos:''}">
        <td class="rpos">${pos}</td>
        <td>${avatar}<span class="rdrv">${esc(r.Driver?.givenName||'')} ${esc(r.Driver?.familyName||'')}${fl?'<span class="fl-pill">⚡ FL</span>':''}</span></td>
        <td><span class="rteam">${esc(r.Constructor?.name||'')}</span></td>
        <td class="rtime">${esc(timeStr)}</td>
        <td class="rpts">${r.points||'—'}</td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

function buildQualiTable(results) {
  return `<div class="res-wrap"><table class="res-table">
    <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Q1</th><th>Q2</th><th>Q3</th></tr></thead>
    <tbody>${results.map(r => {
      const pos = +r.position || 0;
      return `<tr class="rp${pos<=3?pos:''}">
        <td class="rpos">${pos}</td>
        <td><span class="rdrv">${esc(r.Driver?.givenName||'')} ${esc(r.Driver?.familyName||'')}</span></td>
        <td><span class="rteam">${esc(r.Constructor?.name||'')}</span></td>
        <td class="rtime">${esc(r.Q1||'—')}</td>
        <td class="rtime">${esc(r.Q2||'—')}</td>
        <td class="rtime">${esc(r.Q3||'—')}</td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

function buildPracticeTable(results) {
  return `<div class="res-wrap"><table class="res-table">
    <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Best Time</th><th class="r">Laps</th></tr></thead>
    <tbody>${results.map(r => {
      const pos = +r.position || 0;
      return `<tr class="rp${pos<=3?pos:''}">
        <td class="rpos">${pos}</td>
        <td><span class="rdrv">${esc(r.Driver?.givenName||'')} ${esc(r.Driver?.familyName||'')}</span></td>
        <td><span class="rteam">${esc(r.Constructor?.name||'')}</span></td>
        <td class="rtime">${esc(r.Time?.time||'—')}</td>
        <td class="rtime" style="text-align:right">${esc(r.Laps||r.laps||'—')}</td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  activeRound = null;
}
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ════════════════════════════════════
   BOOT — everything renders instantly
   from hardcoded data, no API wait
════════════════════════════════════ */
initDrivers();
initTeams();
initSchedule();
initStandings();