/* ============================================================
   F1 PULSE 2026 — app.js
   ============================================================
   ARCHITECTURE:
   1. HARDCODED DATA   — renders everything instantly on load.
                         No waiting. No blank screens.
   2. API LAYER        — after render, silently calls Jolpica
                         F1 API to upgrade standings, drivers,
                         teams, and schedule with live data.
                         Shows a banner when upgraded.
   3. MODAL / SESSIONS — clicking a completed race card fetches
                         that race's session results (FP1-3,
                         Qualifying, Sprint, Race) from the API
                         with loading states and error handling.
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   SECTION 1 — CONFIGURATION & STATIC DATA
   Everything the page needs to render instantly.
───────────────────────────────────────────────────────────── */

const API_BASE = 'https://api.jolpi.ca/ergast/f1';
const SEASON   = 2026;

/* Team colours keyed by Ergast constructorId */
const TEAM_COLORS = {
  mclaren:'#FF8000', mercedes:'#00D2BE', ferrari:'#E8002D',
  red_bull:'#3671C6', williams:'#64C4FF', aston_martin:'#229971',
  alpine:'#FF87BC', racing_bulls:'#6692FF', haas:'#B6BABD',
  audi:'#B5B5B5', cadillac:'#B20000',
};

/* Nationality → flag emoji */
const FLAGS = {
  'British':'🇬🇧','Dutch':'🇳🇱','Monegasque':'🇲🇨','Spanish':'🇪🇸',
  'Australian':'🇦🇺','Mexican':'🇲🇽','Canadian':'🇨🇦','Finnish':'🇫🇮',
  'French':'🇫🇷','German':'🇩🇪','Japanese':'🇯🇵','Chinese':'🇨🇳',
  'American':'🇺🇸','Thai':'🇹🇭','Danish':'🇩🇰','New Zealander':'🇳🇿',
  'Argentine':'🇦🇷','Brazilian':'🇧🇷','Italian':'🇮🇹','Swedish':'🇸🇪',
};

/* High-quality Wikipedia driver headshots */
const DRIVER_IMGS = {
  norris:        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Lando_Norris_2024_%28cropped%29.jpg/400px-Lando_Norris_2024_%28cropped%29.jpg',
  piastri:       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Oscar_Piastri_2024_%28cropped%29.jpg/400px-Oscar_Piastri_2024_%28cropped%29.jpg',
  russell:       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/George_Russell_2023_%28cropped%29.jpg/400px-George_Russell_2023_%28cropped%29.jpg',
  antonelli:     'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Kimi_Antonelli_2024_%28cropped%29.jpg/400px-Kimi_Antonelli_2024_%28cropped%29.jpg',
  leclerc:       'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Charles_Leclerc_2024_%28cropped%29.jpg/400px-Charles_Leclerc_2024_%28cropped%29.jpg',
  hamilton:      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Lewis_Hamilton_2016_Malaysia_2.jpg/400px-Lewis_Hamilton_2016_Malaysia_2.jpg',
  max_verstappen:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Max_Verstappen_2023_%28cropped%29.jpg/400px-Max_Verstappen_2023_%28cropped%29.jpg',
  hadjar:        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Isack_Hadjar_2024_%28cropped%29.jpg/400px-Isack_Hadjar_2024_%28cropped%29.jpg',
  albon:         'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Alexander_Albon_2023_%28cropped%29.jpg/400px-Alexander_Albon_2023_%28cropped%29.jpg',
  sainz:         'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Carlos_Sainz_Jr%2C_2023_%28cropped%29.jpg/400px-Carlos_Sainz_Jr%2C_2023_%28cropped%29.jpg',
  alonso:        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Fernando_Alonso_2023_%28cropped%29.jpg/400px-Fernando_Alonso_2023_%28cropped%29.jpg',
  stroll:        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Lance_Stroll_2023_%28cropped%29.jpg/400px-Lance_Stroll_2023_%28cropped%29.jpg',
  gasly:         'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Pierre_Gasly_2024_%28cropped%29.jpg/400px-Pierre_Gasly_2024_%28cropped%29.jpg',
  colapinto:     'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Franco_Colapinto_2024_%28cropped%29.jpg/400px-Franco_Colapinto_2024_%28cropped%29.jpg',
  lawson:        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Liam_Lawson_2023_%28cropped%29.jpg/400px-Liam_Lawson_2023_%28cropped%29.jpg',
  lindblad:      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Arvid_Lindblad_2024_%28cropped%29.jpg/400px-Arvid_Lindblad_2024_%28cropped%29.jpg',
  ocon:          'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Esteban_Ocon_2023_%28cropped%29.jpg/400px-Esteban_Ocon_2023_%28cropped%29.jpg',
  bearman:       'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Oliver_Bearman_2024_%28cropped%29.jpg/400px-Oliver_Bearman_2024_%28cropped%29.jpg',
  hulkenberg:    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Nico_H%C3%BClkenberg_2023_%28cropped%29.jpg/400px-Nico_H%C3%BClkenberg_2023_%28cropped%29.jpg',
  bortoleto:     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Gabriel_Bortoleto_2024_%28cropped%29.jpg/400px-Gabriel_Bortoleto_2024_%28cropped%29.jpg',
  perez:         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Sergio_P%C3%A9rez_2023_%28cropped%29.jpg/400px-Sergio_P%C3%A9rez_2023_%28cropped%29.jpg',
  bottas:        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Valtteri_Bottas_2022_%28cropped%29.jpg/400px-Valtteri_Bottas_2022_%28cropped%29.jpg',
};

/*
  Circuit meta: themed emoji that reflects the location or environment
  of each Grand Prix, plus a high-quality Wikimedia aerial / scene photo.
*/
const CIRCUIT_META = {
  albert_park:   { emoji:'🦘', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/2022_Australian_Grand_Prix_-_Race_Day_%2851950437316%29.jpg/800px-2022_Australian_Grand_Prix_-_Race_Day_%2851950437316%29.jpg' },
  shanghai:      { emoji:'🐉', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Shanghai_International_Circuit%2C_China%2C_aerial_photo%2C_2016.jpg/800px-Shanghai_International_Circuit%2C_China%2C_aerial_photo%2C_2016.jpg' },
  suzuka:        { emoji:'⛩', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Suzuka_International_Racing_Course.jpg/800px-Suzuka_International_Racing_Course.jpg' },
  miami:         { emoji:'🌴', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/2022_Miami_Grand_Prix.jpg/800px-2022_Miami_Grand_Prix.jpg' },
  villeneuve:    { emoji:'🍁', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Circuit_Gilles_Villeneuve%2C_aerial_view.jpg/800px-Circuit_Gilles_Villeneuve%2C_aerial_view.jpg' },
  monaco:        { emoji:'🏰', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Monaco_Formula_1_Grand_Prix_2022.jpg/800px-Monaco_Formula_1_Grand_Prix_2022.jpg' },
  catalunya:     { emoji:'🐂', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Circuit_de_Barcelona-Catalunya%2C_aerial_view_%282016%29.jpg/800px-Circuit_de_Barcelona-Catalunya%2C_aerial_view_%282016%29.jpg' },
  red_bull_ring: { emoji:'🏔', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Red_Bull_Ring%2C_aerial_view.jpg/800px-Red_Bull_Ring%2C_aerial_view.jpg' },
  silverstone:   { emoji:'👑', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Silverstone_Circuit_aerial.jpg/800px-Silverstone_Circuit_aerial.jpg' },
  spa:           { emoji:'🌲', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Raidillon_2022.jpg/800px-Raidillon_2022.jpg' },
  hungaroring:   { emoji:'🏛', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Hungaroring%2C_aerial_photo.jpg/800px-Hungaroring%2C_aerial_photo.jpg' },
  zandvoort:     { emoji:'🌊', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/2021_Dutch_Grand_Prix_%2851436949671%29.jpg/800px-2021_Dutch_Grand_Prix_%2851436949671%29.jpg' },
  monza:         { emoji:'🏁', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Autodromo_Nazionale_di_Monza_aerial_crop.jpg/800px-Autodromo_Nazionale_di_Monza_aerial_crop.jpg' },
  madrid:        { emoji:'💃', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Madrid_Skyline_%28152920455%29.jpg/800px-Madrid_Skyline_%28152920455%29.jpg' },
  baku:          { emoji:'🏯', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2022_Azerbaijan_Grand_Prix_%2852018665024%29.jpg/800px-2022_Azerbaijan_Grand_Prix_%2852018665024%29.jpg' },
  marina_bay:    { emoji:'🌃', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/2022_Singapore_Grand_Prix_%2852362791268%29.jpg/800px-2022_Singapore_Grand_Prix_%2852362791268%29.jpg' },
  americas:      { emoji:'🤠', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Circuit_of_the_Americas_aerial_%28cropped%29.jpg/800px-Circuit_of_the_Americas_aerial_%28cropped%29.jpg' },
  rodriguez:     { emoji:'🌵', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2022_Mexican_Grand_Prix_%2852453023093%29.jpg/800px-2022_Mexican_Grand_Prix_%2852453023093%29.jpg' },
  interlagos:    { emoji:'🌿', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace_%28aerial_view%29.jpg/800px-Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace_%28aerial_view%29.jpg' },
  las_vegas:     { emoji:'🎰', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Las_Vegas_Strip_2023.jpg/800px-Las_Vegas_Strip_2023.jpg' },
  losail:        { emoji:'🏜', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Losail_International_Circuit_aerial.jpg/800px-Losail_International_Circuit_aerial.jpg' },
  yas_marina:    { emoji:'🌅', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Yas_Marina_Circuit%2C_Abu_Dhabi%2C_United_Arab_Emirates_-_panoramio_%2882%29.jpg/800px-Yas_Marina_Circuit%2C_Abu_Dhabi%2C_United_Arab_Emirates_-_panoramio_%2882%29.jpg' },
  default:       { emoji:'🏎', img:'' },
};

/* Hardcoded 2026 season data — renders immediately with no API */

const DRIVERS = [
  {id:'norris',        first:'Lando',    last:'Norris',     num:'4',  nat:'British',       team:'McLaren',      teamId:'mclaren'      },
  {id:'piastri',       first:'Oscar',    last:'Piastri',    num:'81', nat:'Australian',    team:'McLaren',      teamId:'mclaren'      },
  {id:'russell',       first:'George',   last:'Russell',    num:'63', nat:'British',       team:'Mercedes',     teamId:'mercedes'     },
  {id:'antonelli',     first:'Kimi',     last:'Antonelli',  num:'12', nat:'Italian',       team:'Mercedes',     teamId:'mercedes'     },
  {id:'leclerc',       first:'Charles',  last:'Leclerc',    num:'16', nat:'Monegasque',    team:'Ferrari',      teamId:'ferrari'      },
  {id:'hamilton',      first:'Lewis',    last:'Hamilton',   num:'44', nat:'British',       team:'Ferrari',      teamId:'ferrari'      },
  {id:'max_verstappen',first:'Max',      last:'Verstappen', num:'33', nat:'Dutch',         team:'Red Bull',     teamId:'red_bull'     },
  {id:'hadjar',        first:'Isack',    last:'Hadjar',     num:'6',  nat:'French',        team:'Red Bull',     teamId:'red_bull'     },
  {id:'albon',         first:'Alex',     last:'Albon',      num:'23', nat:'Thai',          team:'Williams',     teamId:'williams'     },
  {id:'sainz',         first:'Carlos',   last:'Sainz',      num:'55', nat:'Spanish',       team:'Williams',     teamId:'williams'     },
  {id:'alonso',        first:'Fernando', last:'Alonso',     num:'14', nat:'Spanish',       team:'Aston Martin', teamId:'aston_martin' },
  {id:'stroll',        first:'Lance',    last:'Stroll',     num:'18', nat:'Canadian',      team:'Aston Martin', teamId:'aston_martin' },
  {id:'gasly',         first:'Pierre',   last:'Gasly',      num:'10', nat:'French',        team:'Alpine',       teamId:'alpine'       },
  {id:'colapinto',     first:'Franco',   last:'Colapinto',  num:'43', nat:'Argentine',     team:'Alpine',       teamId:'alpine'       },
  {id:'lawson',        first:'Liam',     last:'Lawson',     num:'30', nat:'New Zealander', team:'Racing Bulls', teamId:'racing_bulls' },
  {id:'lindblad',      first:'Arvid',    last:'Lindblad',   num:'5',  nat:'Swedish',       team:'Racing Bulls', teamId:'racing_bulls' },
  {id:'ocon',          first:'Esteban',  last:'Ocon',       num:'31', nat:'French',        team:'Haas',         teamId:'haas'         },
  {id:'bearman',       first:'Oliver',   last:'Bearman',    num:'87', nat:'British',       team:'Haas',         teamId:'haas'         },
  {id:'hulkenberg',    first:'Nico',     last:'Hulkenberg', num:'27', nat:'German',        team:'Audi',         teamId:'audi'         },
  {id:'bortoleto',     first:'Gabriel',  last:'Bortoleto',  num:'5',  nat:'Brazilian',     team:'Audi',         teamId:'audi'         },
  {id:'perez',         first:'Sergio',   last:'Perez',      num:'11', nat:'Mexican',       team:'Cadillac',     teamId:'cadillac'     },
  {id:'bottas',        first:'Valtteri', last:'Bottas',     num:'77', nat:'Finnish',       team:'Cadillac',     teamId:'cadillac'     },
];

const TEAMS = [
  {id:'mercedes',     name:'Mercedes',     country:'Germany',        color:'#00D2BE', champs:8,  pos:1,  pts:180, wins:4, drivers:['russell','antonelli']         },
  {id:'ferrari',      name:'Ferrari',      country:'Italy',          color:'#E8002D', champs:16, pos:2,  pts:110, wins:0, drivers:['leclerc','hamilton']           },
  {id:'mclaren',      name:'McLaren',      country:'United Kingdom', color:'#FF8000', champs:8,  pos:3,  pts:94,  wins:0, drivers:['norris','piastri']             },
  {id:'red_bull',     name:'Red Bull',     country:'Austria',        color:'#3671C6', champs:6,  pos:4,  pts:30,  wins:0, drivers:['max_verstappen','hadjar']      },
  {id:'alpine',       name:'Alpine',       country:'France',         color:'#FF87BC', champs:0,  pos:5,  pts:23,  wins:0, drivers:['gasly','colapinto']            },
  {id:'haas',         name:'Haas',         country:'USA',            color:'#B6BABD', champs:0,  pos:6,  pts:18,  wins:0, drivers:['ocon','bearman']               },
  {id:'racing_bulls', name:'Racing Bulls', country:'Italy',          color:'#6692FF', champs:0,  pos:7,  pts:14,  wins:0, drivers:['lawson','lindblad']            },
  {id:'williams',     name:'Williams',     country:'United Kingdom', color:'#64C4FF', champs:9,  pos:8,  pts:5,   wins:0, drivers:['albon','sainz']                },
  {id:'audi',         name:'Audi',         country:'Germany',        color:'#B5B5B5', champs:0,  pos:9,  pts:2,   wins:0, drivers:['hulkenberg','bortoleto']       },
  {id:'aston_martin', name:'Aston Martin', country:'United Kingdom', color:'#229971', champs:0,  pos:10, pts:0,   wins:0, drivers:['alonso','stroll']              },
  {id:'cadillac',     name:'Cadillac',     country:'USA',            color:'#B20000', champs:0,  pos:11, pts:0,   wins:0, drivers:['perez','bottas']               },
];

/* Standings confirmed after Round 5 — Canadian GP, May 24 2026 */
const DRIVER_STANDINGS = [
  {pos:1,  name:'Kimi Antonelli',    team:'Mercedes',     pts:100, wins:3},
  {pos:2,  name:'George Russell',    team:'Mercedes',     pts:80,  wins:1},
  {pos:3,  name:'Charles Leclerc',   team:'Ferrari',      pts:59,  wins:0},
  {pos:4,  name:'Lando Norris',      team:'McLaren',      pts:51,  wins:0},
  {pos:5,  name:'Lewis Hamilton',    team:'Ferrari',      pts:51,  wins:0},
  {pos:6,  name:'Oscar Piastri',     team:'McLaren',      pts:43,  wins:0},
  {pos:7,  name:'Max Verstappen',    team:'Red Bull',     pts:26,  wins:0},
  {pos:8,  name:'Oliver Bearman',    team:'Haas',         pts:17,  wins:0},
  {pos:9,  name:'Pierre Gasly',      team:'Alpine',       pts:16,  wins:0},
  {pos:10, name:'Liam Lawson',       team:'Racing Bulls', pts:10,  wins:0},
  {pos:11, name:'Franco Colapinto',  team:'Alpine',       pts:7,   wins:0},
  {pos:12, name:'Arvid Lindblad',    team:'Racing Bulls', pts:4,   wins:0},
  {pos:13, name:'Isack Hadjar',      team:'Red Bull',     pts:4,   wins:0},
  {pos:14, name:'Carlos Sainz',      team:'Williams',     pts:4,   wins:0},
  {pos:15, name:'Gabriel Bortoleto', team:'Audi',         pts:2,   wins:0},
  {pos:16, name:'Esteban Ocon',      team:'Haas',         pts:1,   wins:0},
  {pos:17, name:'Alex Albon',        team:'Williams',     pts:1,   wins:0},
  {pos:18, name:'Nico Hulkenberg',   team:'Audi',         pts:0,   wins:0},
  {pos:19, name:'Valtteri Bottas',   team:'Cadillac',     pts:0,   wins:0},
  {pos:20, name:'Sergio Perez',      team:'Cadillac',     pts:0,   wins:0},
  {pos:21, name:'Fernando Alonso',   team:'Aston Martin', pts:0,   wins:0},
  {pos:22, name:'Lance Stroll',      team:'Aston Martin', pts:0,   wins:0},
];

const CONSTRUCTOR_STANDINGS = [
  {pos:1,  name:'Mercedes',     color:'#00D2BE', pts:180, wins:4},
  {pos:2,  name:'Ferrari',      color:'#E8002D', pts:110, wins:0},
  {pos:3,  name:'McLaren',      color:'#FF8000', pts:94,  wins:0},
  {pos:4,  name:'Red Bull',     color:'#3671C6', pts:30,  wins:0},
  {pos:5,  name:'Alpine',       color:'#FF87BC', pts:23,  wins:0},
  {pos:6,  name:'Haas',         color:'#B6BABD', pts:18,  wins:0},
  {pos:7,  name:'Racing Bulls', color:'#6692FF', pts:14,  wins:0},
  {pos:8,  name:'Williams',     color:'#64C4FF', pts:5,   wins:0},
  {pos:9,  name:'Audi',         color:'#B5B5B5', pts:2,   wins:0},
  {pos:10, name:'Aston Martin', color:'#229971', pts:0,   wins:0},
  {pos:11, name:'Cadillac',     color:'#B20000', pts:0,   wins:0},
];

/* Full 2026 race calendar — 22 rounds */
const RACES = [
  {round:1,  name:'Australian Grand Prix',    circuit:'Albert Park Circuit',           loc:'Melbourne, Australia',   date:'2026-03-08', time:'06:00:00Z', sprint:false, cid:'albert_park'   },
  {round:2,  name:'Chinese Grand Prix',       circuit:'Shanghai International Circuit', loc:'Shanghai, China',        date:'2026-03-15', time:'07:00:00Z', sprint:true,  cid:'shanghai'      },
  {round:3,  name:'Japanese Grand Prix',      circuit:'Suzuka International Racing Course', loc:'Suzuka, Japan',      date:'2026-03-29', time:'06:00:00Z', sprint:false, cid:'suzuka'        },
  {round:4,  name:'Miami Grand Prix',         circuit:'Miami International Autodrome',  loc:'Miami, USA',             date:'2026-05-03', time:'19:00:00Z', sprint:true,  cid:'miami'         },
  {round:5,  name:'Canadian Grand Prix',      circuit:'Circuit Gilles Villeneuve',      loc:'Montreal, Canada',       date:'2026-05-24', time:'18:00:00Z', sprint:true,  cid:'villeneuve'    },
  {round:6,  name:'Monaco Grand Prix',        circuit:'Circuit de Monaco',              loc:'Monte Carlo, Monaco',    date:'2026-06-07', time:'13:00:00Z', sprint:false, cid:'monaco'        },
  {round:7,  name:'Spanish Grand Prix',       circuit:'Circuit de Barcelona-Catalunya', loc:'Barcelona, Spain',       date:'2026-06-14', time:'13:00:00Z', sprint:false, cid:'catalunya'     },
  {round:8,  name:'Austrian Grand Prix',      circuit:'Red Bull Ring',                  loc:'Spielberg, Austria',     date:'2026-06-28', time:'13:00:00Z', sprint:false, cid:'red_bull_ring' },
  {round:9,  name:'British Grand Prix',       circuit:'Silverstone Circuit',            loc:'Silverstone, UK',        date:'2026-07-05', time:'14:00:00Z', sprint:true,  cid:'silverstone'   },
  {round:10, name:'Belgian Grand Prix',       circuit:'Circuit de Spa-Francorchamps',   loc:'Spa, Belgium',           date:'2026-07-19', time:'13:00:00Z', sprint:false, cid:'spa'           },
  {round:11, name:'Hungarian Grand Prix',     circuit:'Hungaroring',                    loc:'Budapest, Hungary',      date:'2026-07-26', time:'13:00:00Z', sprint:false, cid:'hungaroring'   },
  {round:12, name:'Dutch Grand Prix',         circuit:'Circuit Zandvoort',              loc:'Zandvoort, Netherlands', date:'2026-08-23', time:'13:00:00Z', sprint:true,  cid:'zandvoort'     },
  {round:13, name:'Italian Grand Prix',       circuit:'Autodromo Nazionale Monza',      loc:'Monza, Italy',           date:'2026-09-06', time:'13:00:00Z', sprint:false, cid:'monza'         },
  {round:14, name:'Madrid Grand Prix',        circuit:'Circuit de Madrid',              loc:'Madrid, Spain',          date:'2026-09-14', time:'13:00:00Z', sprint:false, cid:'madrid'        },
  {round:15, name:'Azerbaijan Grand Prix',    circuit:'Baku City Circuit',              loc:'Baku, Azerbaijan',       date:'2026-09-27', time:'11:00:00Z', sprint:false, cid:'baku'          },
  {round:16, name:'Singapore Grand Prix',     circuit:'Marina Bay Street Circuit',      loc:'Singapore',              date:'2026-10-11', time:'12:00:00Z', sprint:true,  cid:'marina_bay'    },
  {round:17, name:'United States Grand Prix', circuit:'Circuit of the Americas',        loc:'Austin, USA',            date:'2026-10-25', time:'19:00:00Z', sprint:false, cid:'americas'      },
  {round:18, name:'Mexico City Grand Prix',   circuit:'Autodromo Hermanos Rodriguez',   loc:'Mexico City, Mexico',    date:'2026-11-01', time:'19:00:00Z', sprint:false, cid:'rodriguez'     },
  {round:19, name:'Sao Paulo Grand Prix',     circuit:'Autodromo Jose Carlos Pace',     loc:'Sao Paulo, Brazil',      date:'2026-11-08', time:'17:00:00Z', sprint:false, cid:'interlagos'    },
  {round:20, name:'Las Vegas Grand Prix',     circuit:'Las Vegas Strip Circuit',        loc:'Las Vegas, USA',         date:'2026-11-21', time:'06:00:00Z', sprint:false, cid:'las_vegas'     },
  {round:21, name:'Qatar Grand Prix',         circuit:'Lusail International Circuit',   loc:'Lusail, Qatar',          date:'2026-11-29', time:'17:00:00Z', sprint:false, cid:'losail'        },
  {round:22, name:'Abu Dhabi Grand Prix',     circuit:'Yas Marina Circuit',             loc:'Abu Dhabi, UAE',         date:'2026-12-06', time:'13:00:00Z', sprint:false, cid:'yas_marina'    },
];

/* ─────────────────────────────────────────────────────────────
   SECTION 2 — HELPERS & UI UTILITIES
───────────────────────────────────────────────────────────── */

/* Small helpers */
const flag     = function(n)  { return FLAGS[n] || '🏁'; };
const tColor   = function(id) { return TEAM_COLORS[id] || '#E10600'; };
const inits    = function(n)  { return n.split(/\s+/).map(function(w){ return w[0]; }).join('').slice(0,3).toUpperCase(); };
const posClass = function(p)  { return p===1?'p1':p===2?'p2':p===3?'p3':''; };
const esc      = function(s)  { return s==null?'':String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
const mkAvatar = function(f,l,c) {
  c = c || 'e10600';
  return 'https://ui-avatars.com/api/?name='+encodeURIComponent(f+' '+l)+'&background=1a1a1a&color='+c.replace('#','')+'&size=200&bold=true&font-size=0.38';
};

/* Resolve circuit metadata from an Ergast circuitId */
function getCircuitMeta(id) {
  if (!id) return CIRCUIT_META.default;
  var s = id.toLowerCase();
  var keys = Object.keys(CIRCUIT_META);
  for (var i=0; i<keys.length; i++) {
    if (s.indexOf(keys[i]) >= 0 || keys[i].indexOf(s) >= 0) return CIRCUIT_META[keys[i]];
  }
  return CIRCUIT_META.default;
}

/* Show/hide an API banner element */
function showBanner(id, type, message) {
  var el = document.getElementById(id);
  if (!el) return;
  el.className = 'api-banner ' + type;
  el.textContent = message;
  el.style.display = 'flex';
}

/* Navigation */
document.getElementById('ham').addEventListener('click', function() {
  document.getElementById('nav-links').classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(function(a) {
  a.addEventListener('click', function() {
    document.getElementById('nav-links').classList.remove('open');
  });
});

/* Active nav highlight on scroll */
var navIO = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(function(a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
      });
    }
  });
}, { threshold: 0.3, rootMargin: '-58px 0px 0px 0px' });
['drivers','teams','schedule','standings'].forEach(function(id) {
  var el = document.getElementById(id);
  if (el) navIO.observe(el);
});

/* ── Countdown timer ── */
var _cdTimer = null;

function runCountdown(targetMs, name, circuit, loc, round) {
  var meta = getCircuitMeta('');
  document.getElementById('cd-race').textContent = name;
  document.getElementById('cd-meta').textContent = 'Round ' + round + ' \u00b7 ' + circuit + ' \u00b7 ' + loc;
  if (_cdTimer) clearInterval(_cdTimer);
  function tick() {
    var diff = targetMs - Date.now();
    if (diff <= 0) {
      ['cd-d','cd-h','cd-m','cd-s'].forEach(function(id){ document.getElementById(id).textContent='00'; });
      clearInterval(_cdTimer); return;
    }
    document.getElementById('cd-d').textContent = String(Math.floor(diff/86400000)).padStart(2,'0');
    document.getElementById('cd-h').textContent = String(Math.floor((diff%86400000)/3600000)).padStart(2,'0');
    document.getElementById('cd-m').textContent = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
    document.getElementById('cd-s').textContent = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
  }
  tick();
  _cdTimer = setInterval(tick, 1000);
}

function startCountdownFromData(races) {
  var now = Date.now();
  var next = null;
  for (var i=0; i<races.length; i++) {
    var t = new Date(races[i].date+'T'+races[i].time).getTime();
    if (t > now) { next = races[i]; break; }
  }
  if (!next) {
    var last = races[races.length-1];
    document.getElementById('cd-race').textContent = 'Season Complete';
    document.getElementById('cd-meta').textContent = '2026 Formula One World Championship';
    ['cd-d','cd-h','cd-m','cd-s'].forEach(function(id){ document.getElementById(id).textContent='00'; });
    return;
  }
  var meta = getCircuitMeta(next.cid || (next.Circuit && next.Circuit.circuitId) || '');
  runCountdown(
    new Date(next.date+'T'+next.time).getTime(),
    meta.emoji + ' ' + (next.name || next.raceName),
    next.circuit || (next.Circuit && next.Circuit.circuitName) || '',
    next.loc || ((next.Circuit && next.Circuit.Location) ? next.Circuit.Location.locality+', '+next.Circuit.Location.country : ''),
    next.round
  );
}

/* ── Driver card rendering ── */
function renderDriverCards(list, teamMap, conMap) {
  teamMap = teamMap || {};
  conMap  = conMap  || {};
  var grid = document.getElementById('drivers-grid');
  if (!list.length) { grid.innerHTML='<div class="no-results">NO DRIVERS MATCH YOUR FILTERS</div>'; return; }
  grid.innerHTML = list.map(function(d) {
    var teamId = d.teamId || conMap[d.driverId || d.id] || '';
    var team   = d.team   || teamMap[d.driverId || d.id] || 'Unknown';
    var color  = tColor(teamId);
    var img    = DRIVER_IMGS[d.id || d.driverId] || mkAvatar(d.first || d.givenName, d.last || d.familyName, color);
    var num    = d.num || d.permanentNumber || '?';
    var nat    = d.nat || d.nationality || '';
    var first  = d.first || d.givenName || '';
    var last   = d.last  || d.familyName || '';
    return '<div class="driver-card" style="--tc:'+color+'">'
      +'<div class="driver-img">'
        +'<img src="'+img+'" alt="'+esc(first)+' '+esc(last)+'" loading="lazy" onerror="this.src=\''+mkAvatar(first,last,color)+'\'">'
        +'<div class="driver-img-fade"></div>'
        +'<div class="driver-number">#'+num+'</div>'
        +'<div class="driver-flag">'+flag(nat)+'</div>'
      +'</div>'
      +'<div class="driver-info">'
        +'<div class="driver-name">'+esc(first)+' <span>'+esc(last)+'</span></div>'
        +'<div class="driver-team">'+esc(team)+'</div>'
        +'<div class="driver-nat">'+esc(nat)+'</div>'
      +'</div>'
    +'</div>';
  }).join('');
}

/* Build filter dropdowns from a flat driver list */
var _currentDrivers = DRIVERS;
var _teamMap = {};
var _conMap  = {};

function buildFilters(list) {
  var tf = document.getElementById('team-filter');
  var nf = document.getElementById('nat-filter');
  /* Clear existing options beyond first */
  while (tf.options.length > 1) tf.remove(1);
  while (nf.options.length > 1) nf.remove(1);
  var teams = [], nats = [];
  list.forEach(function(d) {
    var t = d.team || _teamMap[d.driverId||d.id] || '';
    var n = d.nat  || d.nationality || '';
    if (t && teams.indexOf(t)<0) teams.push(t);
    if (n && nats.indexOf(n)<0)  nats.push(n);
  });
  teams.sort().forEach(function(t){ var o=document.createElement('option'); o.value=t; o.textContent=t; tf.appendChild(o); });
  nats.sort().forEach(function(n){  var o=document.createElement('option'); o.value=n; o.textContent=flag(n)+' '+n; nf.appendChild(o); });
}

function applyDriverFilter() {
  var q  = (document.getElementById('drv-search').value || '').toLowerCase();
  var tv = document.getElementById('team-filter').value;
  var nv = document.getElementById('nat-filter').value;
  var filtered = _currentDrivers.filter(function(d) {
    var name = (d.first||d.givenName||'')+' '+(d.last||d.familyName||'');
    var team = d.team || _teamMap[d.driverId||d.id] || '';
    var nat  = d.nat  || d.nationality || '';
    return (!q  || (name+' '+team).toLowerCase().indexOf(q)>=0)
        && (!tv || team===tv)
        && (!nv || nat===nv);
  });
  renderDriverCards(filtered, _teamMap, _conMap);
}

/* ─────────────────────────────────────────────────────────────
   SECTION 3 — API LAYER
   Fetch live data from Jolpica F1 API, upgrade the UI,
   show status banners. All fully async. Page works without this.
───────────────────────────────────────────────────────────── */

/*
  Wrapper around fetch that returns parsed JSON or null on any error.
  Uses a timeout so a slow API doesn't hang the page.
*/
function apiFetch(path) {
  var controller = window.AbortController ? new AbortController() : null;
  var timer = controller ? setTimeout(function(){ controller.abort(); }, 8000) : null;
  var opts  = controller ? { signal: controller.signal } : {};
  return fetch(API_BASE + path, opts)
    .then(function(r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .catch(function(e) {
      if (timer) clearTimeout(timer);
      return null;
    });
}

/*
  Try to fetch live driver list + team associations from the API.
  On success: rebuild the drivers grid with any new drivers.
  On failure: silently keep the hardcoded data.
*/
function apiUpgradeDrivers() {
  return Promise.all([
    apiFetch('/' + SEASON + '/drivers/?limit=40'),
    apiFetch('/' + SEASON + '/driverstandings/?limit=40'),
  ]).then(function(results) {
    var dData = results[0];
    var sData = results[1];

    if (!dData || !dData.MRData || !dData.MRData.DriverTable) {
      showBanner('api-drivers-banner','error','Hardcoded 2026 driver data shown (API unavailable for this season)');
      return;
    }

    var apiDrivers = dData.MRData.DriverTable.Drivers;
    if (!apiDrivers || !apiDrivers.length) {
      showBanner('api-drivers-banner','error','Hardcoded 2026 driver data shown (API returned no drivers yet)');
      return;
    }

    /* Build team/constructor maps from standings */
    var newTeamMap = {};
    var newConMap  = {};
    if (sData && sData.MRData && sData.MRData.StandingsTable) {
      var lists = sData.MRData.StandingsTable.StandingsLists;
      if (lists && lists[0] && lists[0].DriverStandings) {
        lists[0].DriverStandings.forEach(function(s) {
          var cName = s.Constructors && s.Constructors[0] ? s.Constructors[0].name : '';
          var cId   = s.Constructors && s.Constructors[0] ? s.Constructors[0].constructorId : '';
          newTeamMap[s.Driver.driverId] = cName;
          newConMap[s.Driver.driverId]  = cId;
        });
      }
    }

    _currentDrivers = apiDrivers;
    _teamMap = newTeamMap;
    _conMap  = newConMap;

    buildFilters(apiDrivers);
    renderDriverCards(apiDrivers, newTeamMap, newConMap);
    document.getElementById('hs-drivers').textContent = apiDrivers.length;
    showBanner('api-drivers-banner','success','Drivers upgraded live from Jolpica F1 API');
  });
}

/*
  Try to fetch live constructor list + standings from the API.
  On success: rebuild the teams grid with live points data.
*/
function apiUpgradeTeams() {
  return Promise.all([
    apiFetch('/' + SEASON + '/constructors/?limit=20'),
    apiFetch('/' + SEASON + '/constructorstandings/?limit=20'),
  ]).then(function(results) {
    var cData = results[0];
    var sData = results[1];

    if (!cData || !cData.MRData || !cData.MRData.ConstructorTable) {
      showBanner('api-teams-banner','error','Hardcoded 2026 team data shown (API unavailable for this season)');
      return;
    }

    var cons = cData.MRData.ConstructorTable.Constructors;
    if (!cons || !cons.length) {
      showBanner('api-teams-banner','error','Hardcoded 2026 team data shown (API returned no constructors yet)');
      return;
    }

    /* Build standings map */
    var standMap = {};
    var topId    = '';
    if (sData && sData.MRData && sData.MRData.StandingsTable) {
      var lists = sData.MRData.StandingsTable.StandingsLists;
      if (lists && lists[0] && lists[0].ConstructorStandings) {
        lists[0].ConstructorStandings.forEach(function(s, i) {
          standMap[s.Constructor.constructorId] = {pos:s.position, pts:s.points, wins:s.wins};
          if (i===0) topId = s.Constructor.constructorId;
        });
      }
    }

    /* Build driver-by-team from current _currentDrivers list */
    var dByTeam = {};
    _currentDrivers.forEach(function(d) {
      var cid = d.teamId || _conMap[d.driverId||d.id] || '';
      if (cid) {
        if (!dByTeam[cid]) dByTeam[cid] = [];
        dByTeam[cid].push((d.first||d.givenName||'') + ' ' + (d.last||d.familyName||''));
      }
    });

    /* Sort by championship position */
    var sorted = cons.slice().sort(function(a,b) {
      var pa = parseInt((standMap[a.constructorId]||{}).pos) || 99;
      var pb = parseInt((standMap[b.constructorId]||{}).pos) || 99;
      return pa - pb;
    });

    var grid = document.getElementById('teams-grid');
    grid.innerHTML = sorted.map(function(c) {
      var isLeader = c.constructorId === topId;
      var color    = tColor(c.constructorId);
      var st       = standMap[c.constructorId] || {pos:'—', pts:'0', wins:'0'};
      var drvs     = dByTeam[c.constructorId]  || [];

      return (isLeader
        ? '<div class="team-card leader" style="--tc:'+color+'"><div class="leader-badge">\u2605 Championship Leader</div>'
        : '<div class="team-card" style="--tc:'+color+'">')
        +'<div class="team-logo-row">'
          +'<div class="team-logo" style="color:'+color+';border-color:'+color+'40">'+inits(c.name)+'</div>'
          +'<div><div class="team-name">'+esc(c.name)+'</div><div class="team-country">'+esc(c.nationality)+'</div></div>'
        +'</div>'
        +'<div class="team-drivers">'
          +(drvs.length
            ? drvs.map(function(n){ return '<span class="driver-chip">'+esc(n)+'</span>'; }).join('')
            : '<span class="driver-chip" style="color:var(--dim)">TBA</span>')
        +'</div>'
        +'<div class="team-stats">'
          +'<div class="team-stat"><span class="team-stat-n">'+esc(st.pos)+'</span><span class="team-stat-l">Position</span></div>'
          +'<div class="team-stat"><span class="team-stat-n">'+esc(st.pts)+'</span><span class="team-stat-l">Points</span></div>'
          +'<div class="team-stat"><span class="team-stat-n">'+esc(st.wins)+'</span><span class="team-stat-l">Wins</span></div>'
        +'</div>'
      +'</div>';
    }).join('');

    document.getElementById('hs-teams').textContent = cons.length;
    showBanner('api-teams-banner','success','Teams upgraded live from Jolpica F1 API');
  });
}

/*
  Try to fetch the live race schedule from the API.
  On success: rebuild the schedule grid and restart countdown.
*/
function apiUpgradeSchedule() {
  return apiFetch('/' + SEASON + '/?limit=30').then(function(data) {
    if (!data || !data.MRData || !data.MRData.RaceTable) {
      showBanner('api-schedule-banner','error','Hardcoded 2026 schedule shown (API unavailable for this season)');
      return;
    }

    var races = data.MRData.RaceTable.Races;
    if (!races || !races.length) {
      showBanner('api-schedule-banner','error','Hardcoded 2026 schedule shown (API returned no races yet)');
      return;
    }

    /* Rebuild schedule grid from live API data */
    var now      = Date.now();
    var nextRace = null;
    var completed = 0;

    races.forEach(function(r) {
      if (new Date(r.date+'T'+(r.time||'14:00:00Z')).getTime() > now && !nextRace) {
        nextRace = r;
      }
    });

    var nextRound = nextRace ? nextRace.round : null;

    var grid = document.getElementById('schedule-grid');
    grid.innerHTML = races.map(function(r) {
      var rt     = new Date(r.date+'T'+(r.time||'14:00:00Z')).getTime();
      var isPast = rt < now;
      var isNext = r.round === nextRound;
      if (isPast && !isNext) completed++;

      var lDate = new Date(r.date+'T'+(r.time||'14:00:00Z')).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
      var lTime = new Date(r.date+'T'+(r.time||'14:00:00Z')).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',timeZoneName:'short'});
      var cid   = r.Circuit && r.Circuit.circuitId ? r.Circuit.circuitId : '';
      var meta  = getCircuitMeta(cid);
      var hasSprint = !!(r.Sprint);

      var tags = '';
      if (isNext)      tags += '<span class="tag tag-next">Next Race</span>';
      else if (isPast) tags += '<span class="tag tag-done">Completed</span>';
      else             tags += '<span class="tag tag-soon">Upcoming</span>';
      if (hasSprint)   tags += ' <span class="tag tag-sprint">Sprint</span>';

      return '<div class="race-card'+(isNext?' is-next':'')+(isPast&&!isNext?' is-past':'')+'"'
        +' onclick="openModal('+r.round+',true)" tabindex="0" role="button">'
        +'<div class="race-img">'
          +(meta.img?'<img src="'+meta.img+'" alt="'+esc(r.raceName)+'" loading="lazy" onerror="this.style.display=\'none\'">':'')
          +'<div class="race-img-overlay"></div>'
          +'<div class="race-emoji">'+meta.emoji+'</div>'
          +'<div class="race-round-badge">R'+r.round+'</div>'
        +'</div>'
        +'<div class="race-head"><div class="race-name">'+esc(r.raceName)+'</div><div class="race-date">'+lDate+' \u00b7 '+lTime+'</div></div>'
        +'<div class="race-body">'
          +'<div class="race-circuit">\uD83C\uDFDF '+(r.Circuit?esc(r.Circuit.circuitName):'')+'</div>'
          +'<div class="race-loc">\uD83D\uDCCD '+(r.Circuit&&r.Circuit.Location?esc(r.Circuit.Location.locality)+', '+esc(r.Circuit.Location.country):'')+'</div>'
          +'<div class="race-tags">'+tags+'</div>'
        +'</div>'
        +'<div class="race-hint">TAP FOR RESULTS \u2192</div>'
      +'</div>';
    }).join('');

    document.querySelectorAll('.race-card').forEach(function(c){
      c.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' ')c.click(); });
    });

    /* Update hero stat + start live countdown from API data */
    document.getElementById('hs-races').textContent = races.length;
    document.getElementById('hs-done').textContent  = completed;

    /* Re-format races for countdown */
    var racesFmt = races.map(function(r){
      return { round:r.round, name:r.raceName, date:r.date, time:(r.time||'14:00:00Z'),
               circuit: r.Circuit?r.Circuit.circuitName:'', loc: r.Circuit&&r.Circuit.Location?r.Circuit.Location.locality+', '+r.Circuit.Location.country:'',
               cid: r.Circuit?r.Circuit.circuitId:'', sprint: !!(r.Sprint) };
    });
    startCountdownFromData(racesFmt);

    showBanner('api-schedule-banner','success','Schedule upgraded live from Jolpica F1 API');
  });
}

/*
  Try to fetch live driver and constructor standings.
  On success: rebuild both standings tables with LIVE data badge.
*/
function apiUpgradeStandings() {
  return Promise.all([
    apiFetch('/' + SEASON + '/driverstandings/?limit=40'),
    apiFetch('/' + SEASON + '/constructorstandings/?limit=20'),
  ]).then(function(results) {
    var dData = results[0];
    var cData = results[1];

    /* Driver standings */
    if (dData && dData.MRData && dData.MRData.StandingsTable) {
      var lists = dData.MRData.StandingsTable.StandingsLists;
      if (lists && lists[0] && lists[0].DriverStandings && lists[0].DriverStandings.length) {
        var ds = lists[0].DriverStandings;
        var dEl = document.getElementById('drv-standings');
        dEl.innerHTML = '<div class="standings-head drv"><span>Pos</span><span>Driver</span><span style="text-align:right">Pts</span><span style="text-align:right">W</span></div>'
          + ds.map(function(s){
            return '<div class="standings-row drv '+posClass(parseInt(s.position))+'">'
              +'<span class="st-pos">'+esc(s.position)+'</span>'
              +'<div><div class="st-name">'+esc(s.Driver.givenName)+' '+esc(s.Driver.familyName)+'</div>'
              +'<div class="st-sub">'+(s.Constructors&&s.Constructors[0]?esc(s.Constructors[0].name):'')+'</div></div>'
              +'<span class="st-pts">'+esc(s.points)+'</span>'
              +'<span class="st-wins">'+esc(s.wins)+'W</span>'
            +'</div>';
          }).join('');
        var pill = document.getElementById('drv-live-pill');
        if (pill) pill.style.display = 'inline';
        document.getElementById('drv-src').textContent = 'Live via Jolpica F1 API \u00b7 After Round '+esc(lists[0].round||'?');
      }
    }

    /* Constructor standings */
    if (cData && cData.MRData && cData.MRData.StandingsTable) {
      var clists = cData.MRData.StandingsTable.StandingsLists;
      if (clists && clists[0] && clists[0].ConstructorStandings && clists[0].ConstructorStandings.length) {
        var cs = clists[0].ConstructorStandings;
        var cEl = document.getElementById('con-standings');
        cEl.innerHTML = '<div class="standings-head con"><span>Pos</span><span>Team</span><span style="text-align:right">Pts</span></div>'
          + cs.map(function(s){
            var color = tColor(s.Constructor.constructorId);
            return '<div class="standings-row con '+posClass(parseInt(s.position))+'">'
              +'<span class="st-pos">'+esc(s.position)+'</span>'
              +'<div><div class="st-name" style="color:'+color+'">'+esc(s.Constructor.name)+'</div>'
              +'<div class="st-sub">'+esc(s.wins)+' win'+(s.wins!=='1'?'s':'')+'</div></div>'
              +'<span class="st-pts">'+esc(s.points)+'</span>'
            +'</div>';
          }).join('');
        var cpill = document.getElementById('con-live-pill');
        if (cpill) cpill.style.display = 'inline';
        document.getElementById('con-src').textContent = 'Live via Jolpica F1 API \u00b7 After Round '+esc(clists[0].round||'?');
      }
    }
  });
}

/* Refresh standings every 5 minutes */
function scheduleStandingsRefresh() {
  setTimeout(function() {
    apiUpgradeStandings().then(scheduleStandingsRefresh);
  }, 5 * 60 * 1000);
}

/* ── Race weekend modal session loader ── */
var _activeRound  = null;
var _activeTab    = null;
var _sessionCache = {};
var _apiRaces     = null; /* cache of API race objects (have Sprint key) */

function openModal(round, fromApi) {
  /* Look up race from API cache first, then hardcoded */
  var race = null;
  if (_apiRaces) {
    for (var i=0; i<_apiRaces.length; i++) {
      if (parseInt(_apiRaces[i].round) === round) { race = _apiRaces[i]; break; }
    }
  }
  if (!race) {
    for (var i=0; i<RACES.length; i++) {
      if (RACES[i].round === round) { race = RACES[i]; break; }
    }
  }
  if (!race) return;
  _activeRound = round;

  var now    = Date.now();
  var rDate  = race.date+'T'+(race.time||'14:00:00Z');
  var isPast = new Date(rDate).getTime() < now;

  /* Hero */
  var cid   = (race.Circuit && race.Circuit.circuitId) || race.cid || '';
  var meta  = getCircuitMeta(cid);
  var circuitName = (race.Circuit && race.Circuit.circuitName) || race.circuit || '';
  var raceName    = race.raceName || race.name || '';
  var loc         = (race.Circuit && race.Circuit.Location)
    ? race.Circuit.Location.locality+', '+race.Circuit.Location.country
    : race.loc || '';

  var heroImg = document.getElementById('modal-hero-img');
  heroImg.src = meta.img || '';
  heroImg.style.display = meta.img ? '' : 'none';
  heroImg.onerror = function(){ heroImg.style.display='none'; };

  document.getElementById('modal-hero-emoji').textContent = meta.emoji;
  document.getElementById('modal-hero-round').textContent = 'Round '+round+' \u00b7 '
    +new Date(rDate).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'});
  document.getElementById('modal-hero-name').textContent  = raceName;
  document.getElementById('modal-hero-sub').textContent   = circuitName+' \u00b7 '+loc;

  var tabBar     = document.getElementById('modal-tab-bar');
  var tabContent = document.getElementById('modal-tab-content');

  if (!isPast) {
    tabBar.innerHTML = '';
    var lDate = new Date(rDate).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    var lTime = new Date(rDate).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',timeZoneName:'long'});
    var hasSprint = !!(race.Sprint || race.sprint);
    tabContent.innerHTML = '<div class="m-future">'
      +'<span class="big-emoji">'+meta.emoji+'</span>'
      +'<h3>'+esc(raceName)+'</h3>'
      +'<div class="f-meta">'+esc(circuitName)+' \u00b7 '+esc(loc)+'</div>'
      +'<div class="date-box"><div class="date-lbl">Race Date</div><div class="date-val">'+lDate+'</div><div class="time-val">'+lTime+'</div></div>'
      +(hasSprint?'<br><span class="tag tag-sprint" style="display:inline-block;margin-top:0.75rem">Sprint Weekend</span>':'')
    +'</div>';
  } else {
    var hasSprint2 = !!(race.Sprint || race.sprint);
    var tabs = [
      {id:'race',  label:'Race'},
      {id:'quali', label:'Qualifying'},
      {id:'fp3',   label:'FP3'},
      {id:'fp2',   label:'FP2'},
      {id:'fp1',   label:'FP1'},
    ];
    if (hasSprint2) tabs.splice(1,0,{id:'sprint',label:'Sprint'});
    _activeTab = tabs[0].id;
    tabBar.innerHTML = tabs.map(function(t,i){
      return '<button class="tab-btn'+(i===0?' active':'')+'" onclick="switchTab(\''+t.id+'\',this)">'+t.label+'</button>';
    }).join('');
    loadSession(round, _activeTab, tabContent);
  }

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function switchTab(session, btn) {
  if (session===_activeTab) return;
  _activeTab = session;
  document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  loadSession(_activeRound, session, document.getElementById('modal-tab-content'));
}

/* Fetch a specific session from the API and render results */
function loadSession(round, session, el) {
  var key = SEASON+'-'+round+'-'+session;
  if (_sessionCache[key]) {
    el.innerHTML = '<div class="tab-pane active">'+_sessionCache[key]+'</div>';
    return;
  }
  el.innerHTML = '<div class="tab-pane active"><div class="m-loading"><span class="spinner"></span>Loading '+session+' data\u2026</div></div>';

  var paths = {
    race:   '/'+SEASON+'/'+round+'/results/',
    quali:  '/'+SEASON+'/'+round+'/qualifying/',
    sprint: '/'+SEASON+'/'+round+'/sprint/',
    fp1:    '/'+SEASON+'/'+round+'/practice/1/',
    fp2:    '/'+SEASON+'/'+round+'/practice/2/',
    fp3:    '/'+SEASON+'/'+round+'/practice/3/',
  };

  apiFetch(paths[session]).then(function(data) {
    if (!data || !data.MRData || !data.MRData.RaceTable) {
      var html = '<div class="m-error">Could not reach the API. Check your connection and try again.</div>';
      el.innerHTML = '<div class="tab-pane active">'+html+'</div>'; return;
    }
    var races = data.MRData.RaceTable.Races;
    if (!races || !races.length) {
      var html = '<div class="m-empty">\uD83D\uDCEB Session data not yet available for this event.</div>';
      _sessionCache[key]=html; el.innerHTML='<div class="tab-pane active">'+html+'</div>'; return;
    }
    var rObj    = races[0];
    var results = rObj.Results||rObj.QualifyingResults||rObj.SprintResults||rObj.PracticeResults||[];
    if (!results.length) {
      var html = '<div class="m-empty">\uD83D\uDCEB No results data for this session yet.</div>';
      _sessionCache[key]=html; el.innerHTML='<div class="tab-pane active">'+html+'</div>'; return;
    }
    var html = '';
    if (session==='race'||session==='sprint') { html+=buildPodium(results,session); html+=buildRaceTable(results); }
    else if (session==='quali')               { html+=buildPodium(results,'quali'); html+=buildQualiTable(results); }
    else                                      { html+=buildPracticeTable(results); }
    _sessionCache[key]=html;
    el.innerHTML='<div class="tab-pane active">'+html+'</div>';
  });
}

/* ── HTML result table builders ── */

function buildPodium(results, type) {
  if (results.length < 3) return '';
  function getTime(r) {
    if (type==='quali') return r.Q3||r.Q2||r.Q1||'';
    return (r.Time&&r.Time.time)||(r.status&&r.status!=='Finished'?r.status:'')||'';
  }
  function slot(r, trophy, cls, label) {
    return '<div class="podium-slot '+cls+'">'
      +'<span class="pod-trophy">'+trophy+'</span>'
      +'<div class="pod-pos">'+label+'</div>'
      +'<div class="pod-name">'+(r&&r.Driver?esc(r.Driver.familyName):'')+'</div>'
      +'<div class="pod-team">'+(r&&r.Constructor?esc(r.Constructor.name):'')+'</div>'
      +'<div class="pod-time">'+esc(getTime(r))+'</div>'
    +'</div>';
  }
  return '<div class="podium">'
    +slot(results[1],'🥈','p2','2ND')
    +slot(results[0],'🥇','p1','1ST')
    +slot(results[2],'🥉','p3','3RD')
  +'</div>';
}

function buildRaceTable(results) {
  var rows = results.map(function(r) {
    var pos  = parseInt(r.position)||0;
    var fl   = r.FastestLap && r.FastestLap.rank==='1';
    var ts   = (r.Time&&r.Time.time)||(r.status&&r.status!=='Finished'?r.status:'—');
    var dId  = r.Driver && r.Driver.driverId;
    var tId  = r.Constructor && r.Constructor.constructorId;
    var dImg = dId && DRIVER_IMGS[dId];
    var av   = dImg
      ? '<img src="'+dImg+'" style="width:24px;height:24px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:0.35rem;border:1px solid '+tColor(tId)+'" loading="lazy" onerror="this.remove()">'
      : '';
    return '<tr class="rp'+(pos<=3?pos:'')+'">'
      +'<td class="r-pos">'+pos+'</td>'
      +'<td>'+av+'<span class="r-drv">'+(r.Driver?esc(r.Driver.givenName)+' '+esc(r.Driver.familyName):'')+(fl?'<span class="fl-pill">\u26A1 FL</span>':'')+'</span></td>'
      +'<td><span class="r-team">'+(r.Constructor?esc(r.Constructor.name):'')+'</span></td>'
      +'<td class="r-time">'+esc(ts)+'</td>'
      +'<td class="r-pts">'+(r.points||'—')+'</td>'
    +'</tr>';
  }).join('');
  return '<div class="res-wrap"><table class="res-table">'
    +'<thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Time/Gap</th><th class="right">Pts</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div>';
}

function buildQualiTable(results) {
  var rows = results.map(function(r) {
    var pos=parseInt(r.position)||0;
    return '<tr class="rp'+(pos<=3?pos:'')+'">'
      +'<td class="r-pos">'+pos+'</td>'
      +'<td><span class="r-drv">'+(r.Driver?esc(r.Driver.givenName)+' '+esc(r.Driver.familyName):'')+'</span></td>'
      +'<td><span class="r-team">'+(r.Constructor?esc(r.Constructor.name):'')+'</span></td>'
      +'<td class="r-time">'+esc(r.Q1||'—')+'</td>'
      +'<td class="r-time">'+esc(r.Q2||'—')+'</td>'
      +'<td class="r-time">'+esc(r.Q3||'—')+'</td>'
    +'</tr>';
  }).join('');
  return '<div class="res-wrap"><table class="res-table">'
    +'<thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Q1</th><th>Q2</th><th>Q3</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div>';
}

function buildPracticeTable(results) {
  var rows = results.map(function(r) {
    var pos=parseInt(r.position)||0;
    return '<tr class="rp'+(pos<=3?pos:'')+'">'
      +'<td class="r-pos">'+pos+'</td>'
      +'<td><span class="r-drv">'+(r.Driver?esc(r.Driver.givenName)+' '+esc(r.Driver.familyName):'')+'</span></td>'
      +'<td><span class="r-team">'+(r.Constructor?esc(r.Constructor.name):'')+'</span></td>'
      +'<td class="r-time">'+(r.Time?esc(r.Time.time):'—')+'</td>'
      +'<td class="r-time" style="text-align:right">'+esc(r.Laps||r.laps||'—')+'</td>'
    +'</tr>';
  }).join('');
  return '<div class="res-wrap"><table class="res-table">'
    +'<thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Best Time</th><th class="right">Laps</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div>';
}

/* Modal close handlers */
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  _activeRound = null;
}
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target===document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key==='Escape') closeModal();
});

/* ─────────────────────────────────────────────────────────────
   BOOT
   1. Render everything instantly from hardcoded data.
   2. Then fire API requests in the background to upgrade.
───────────────────────────────────────────────────────────── */
(function boot() {

  /* ── Step 1: Render hardcoded data immediately ── */

  /* Drivers */
  _currentDrivers = DRIVERS;
  buildFilters(DRIVERS);
  document.getElementById('drv-search').addEventListener('input',  applyDriverFilter);
  document.getElementById('team-filter').addEventListener('change', applyDriverFilter);
  document.getElementById('nat-filter').addEventListener('change',  applyDriverFilter);
  renderDriverCards(DRIVERS, {}, {});

  /* Teams */
  var tgrid = document.getElementById('teams-grid');
  tgrid.innerHTML = TEAMS.map(function(t) {
    var isLeader = t.pos===1;
    var dNames   = t.drivers.map(function(id) {
      var d=null; for(var i=0;i<DRIVERS.length;i++){if(DRIVERS[i].id===id){d=DRIVERS[i];break;}} return d?d.first+' '+d.last:id;
    });
    return (isLeader
      ? '<div class="team-card leader" style="--tc:'+t.color+'"><div class="leader-badge">\u2605 Championship Leader</div>'
      : '<div class="team-card" style="--tc:'+t.color+'">')
      +'<div class="team-logo-row">'
        +'<div class="team-logo" style="color:'+t.color+';border-color:'+t.color+'40">'+inits(t.name)+'</div>'
        +'<div><div class="team-name">'+esc(t.name)+'</div><div class="team-country">'+esc(t.country)+'</div></div>'
      +'</div>'
      +'<div class="team-drivers">'+dNames.map(function(n){return '<span class="driver-chip">'+esc(n)+'</span>';}).join('')+'</div>'
      +'<div class="team-stats">'
        +'<div class="team-stat"><span class="team-stat-n">'+t.pos+'</span><span class="team-stat-l">Position</span></div>'
        +'<div class="team-stat"><span class="team-stat-n">'+t.pts+'</span><span class="team-stat-l">Points</span></div>'
        +'<div class="team-stat"><span class="team-stat-n">'+t.champs+'</span><span class="team-stat-l">WCC Titles</span></div>'
      +'</div>'
    +'</div>';
  }).join('');

  /* Schedule */
  var now      = Date.now();
  var nextRace = null;
  for (var i=0;i<RACES.length;i++) { if(new Date(RACES[i].date+'T'+RACES[i].time).getTime()>now){nextRace=RACES[i];break;} }
  var completed = 0;
  var sgrid = document.getElementById('schedule-grid');
  sgrid.innerHTML = RACES.map(function(r) {
    var rt=new Date(r.date+'T'+r.time).getTime(), isPast=rt<now, isNext=nextRace&&r.round===nextRace.round;
    if(isPast&&!isNext) completed++;
    var lDate=new Date(r.date+'T'+r.time).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
    var lTime=new Date(r.date+'T'+r.time).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',timeZoneName:'short'});
    var meta=getCircuitMeta(r.cid);
    var tags='';
    if(isNext) tags+='<span class="tag tag-next">Next Race</span>';
    else if(isPast) tags+='<span class="tag tag-done">Completed</span>';
    else tags+='<span class="tag tag-soon">Upcoming</span>';
    if(r.sprint) tags+=' <span class="tag tag-sprint">Sprint</span>';
    return '<div class="race-card'+(isNext?' is-next':'')+(isPast&&!isNext?' is-past':'')+'"'
      +' onclick="openModal('+r.round+',false)" tabindex="0" role="button">'
      +'<div class="race-img">'
        +(meta.img?'<img src="'+meta.img+'" alt="'+esc(r.name)+'" loading="lazy" onerror="this.style.display=\'none\'">':'')
        +'<div class="race-img-overlay"></div>'
        +'<div class="race-emoji">'+meta.emoji+'</div>'
        +'<div class="race-round-badge">R'+r.round+'</div>'
      +'</div>'
      +'<div class="race-head"><div class="race-name">'+esc(r.name)+'</div><div class="race-date">'+lDate+' \u00b7 '+lTime+'</div></div>'
      +'<div class="race-body">'
        +'<div class="race-circuit">\uD83C\uDFDF '+esc(r.circuit)+'</div>'
        +'<div class="race-loc">\uD83D\uDCCD '+esc(r.loc)+'</div>'
        +'<div class="race-tags">'+tags+'</div>'
      +'</div>'
      +'<div class="race-hint">TAP FOR RESULTS \u2192</div>'
    +'</div>';
  }).join('');
  document.querySelectorAll('.race-card').forEach(function(c){
    c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')c.click();});
  });
  startCountdownFromData(RACES);

  /* Standings */
  var dEl = document.getElementById('drv-standings');
  dEl.innerHTML='<div class="standings-head drv"><span>Pos</span><span>Driver</span><span style="text-align:right">Pts</span><span style="text-align:right">W</span></div>'
    +DRIVER_STANDINGS.map(function(s){
      return '<div class="standings-row drv '+posClass(s.pos)+'">'
        +'<span class="st-pos">'+s.pos+'</span>'
        +'<div><div class="st-name">'+esc(s.name)+'</div><div class="st-sub">'+esc(s.team)+'</div></div>'
        +'<span class="st-pts">'+s.pts+'</span>'
        +'<span class="st-wins">'+s.wins+'W</span>'
      +'</div>';
    }).join('');
  var cEl = document.getElementById('con-standings');
  cEl.innerHTML='<div class="standings-head con"><span>Pos</span><span>Team</span><span style="text-align:right">Pts</span></div>'
    +CONSTRUCTOR_STANDINGS.map(function(s){
      return '<div class="standings-row con '+posClass(s.pos)+'">'
        +'<span class="st-pos">'+s.pos+'</span>'
        +'<div><div class="st-name" style="color:'+s.color+'">'+esc(s.name)+'</div><div class="st-sub">'+s.wins+' win'+(s.wins!==1?'s':'')+'</div></div>'
        +'<span class="st-pts">'+s.pts+'</span>'
      +'</div>';
    }).join('');

  /* Update hero counters */
  document.getElementById('hs-drivers').textContent = DRIVERS.length;
  document.getElementById('hs-teams').textContent   = TEAMS.length;
  document.getElementById('hs-races').textContent   = RACES.length;
  document.getElementById('hs-done').textContent    = completed;

  /* ── Step 2: Background API upgrades ── */
  /* Run after a short delay so the page is already visible */
  setTimeout(function() {
    /* Try to upgrade each section independently — one failing won't stop others */
    apiUpgradeDrivers().catch(function(){});
    apiUpgradeTeams().catch(function(){});
    apiUpgradeSchedule().then(function(d) {
      /* Cache API race list so openModal can access Sprint keys */
      if (d && d.MRData && d.MRData.RaceTable) _apiRaces = d.MRData.RaceTable.Races;
    }).catch(function(){});
    apiUpgradeStandings().catch(function(){});
  }, 500);

  /* Refresh standings every 5 minutes */
  scheduleStandingsRefresh();

})();