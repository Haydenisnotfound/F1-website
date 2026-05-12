/* ============================================================
   F1 PULSE 2026 — app.js
   ============================================================
   SECTION 1: STATIC DATA (renders instantly, zero API needed)
   SECTION 2: UI / HELPERS / COUNTDOWN / CARDS
   SECTION 3: LIVE API LAYER (upgrades content after load)
   ============================================================ */

/* ═══════════════════════════════════════════════════════════
   SECTION 1 — STATIC DATA
   All 2026 season data lives here. The page renders from this
   the moment it loads. No network requests required.
═══════════════════════════════════════════════════════════ */

var API_BASE = 'https://api.jolpi.ca/ergast/f1';
var SEASON   = 2026;

var TEAM_COLORS = {
  mclaren:'#FF8000', mercedes:'#00D2BE', ferrari:'#E8002D',
  red_bull:'#3671C6', williams:'#64C4FF', aston_martin:'#229971',
  alpine:'#FF87BC', racing_bulls:'#6692FF', haas:'#B6BABD',
  audi:'#B5B5B5', cadillac:'#B20000'
};

var FLAGS = {
  'British':'🇬🇧','Dutch':'🇳🇱','Monegasque':'🇲🇨','Spanish':'🇪🇸',
  'Australian':'🇦🇺','Mexican':'🇲🇽','Canadian':'🇨🇦','Finnish':'🇫🇮',
  'French':'🇫🇷','German':'🇩🇪','Japanese':'🇯🇵','Chinese':'🇨🇳',
  'American':'🇺🇸','Thai':'🇹🇭','Danish':'🇩🇰','New Zealander':'🇳🇿',
  'Argentine':'🇦🇷','Brazilian':'🇧🇷','Italian':'🇮🇹','Swedish':'🇸🇪'
};

var DRIVER_IMGS = {
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
  bottas:        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Valtteri_Bottas_2022_%28cropped%29.jpg/400px-Valtteri_Bottas_2022_%28cropped%29.jpg'
};

/* Circuit emojis + Wikimedia aerial/scene photos */
var CIRCUIT_META = {
  albert_park:   { emoji:'🦘', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/2022_Australian_Grand_Prix_-_Race_Day_%2851950437316%29.jpg/800px-2022_Australian_Grand_Prix_-_Race_Day_%2851950437316%29.jpg' },
  shanghai:      { emoji:'🐉', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Shanghai_International_Circuit%2C_China%2C_aerial_photo%2C_2016.jpg/800px-Shanghai_International_Circuit%2C_China%2C_aerial_photo%2C_2016.jpg' },
  suzuka:        { emoji:'⛩',  img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Suzuka_International_Racing_Course.jpg/800px-Suzuka_International_Racing_Course.jpg' },
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
  default:       { emoji:'🏎', img:'' }
};

var DRIVERS = [
  {id:'norris',        first:'Lando',    last:'Norris',     num:'4',  nat:'British',       team:'McLaren',      teamId:'mclaren'     },
  {id:'piastri',       first:'Oscar',    last:'Piastri',    num:'81', nat:'Australian',    team:'McLaren',      teamId:'mclaren'     },
  {id:'russell',       first:'George',   last:'Russell',    num:'63', nat:'British',       team:'Mercedes',     teamId:'mercedes'    },
  {id:'antonelli',     first:'Kimi',     last:'Antonelli',  num:'12', nat:'Italian',       team:'Mercedes',     teamId:'mercedes'    },
  {id:'leclerc',       first:'Charles',  last:'Leclerc',    num:'16', nat:'Monegasque',    team:'Ferrari',      teamId:'ferrari'     },
  {id:'hamilton',      first:'Lewis',    last:'Hamilton',   num:'44', nat:'British',       team:'Ferrari',      teamId:'ferrari'     },
  {id:'max_verstappen',first:'Max',      last:'Verstappen', num:'33', nat:'Dutch',         team:'Red Bull',     teamId:'red_bull'    },
  {id:'hadjar',        first:'Isack',    last:'Hadjar',     num:'6',  nat:'French',        team:'Red Bull',     teamId:'red_bull'    },
  {id:'albon',         first:'Alex',     last:'Albon',      num:'23', nat:'Thai',          team:'Williams',     teamId:'williams'    },
  {id:'sainz',         first:'Carlos',   last:'Sainz',      num:'55', nat:'Spanish',       team:'Williams',     teamId:'williams'    },
  {id:'alonso',        first:'Fernando', last:'Alonso',     num:'14', nat:'Spanish',       team:'Aston Martin', teamId:'aston_martin'},
  {id:'stroll',        first:'Lance',    last:'Stroll',     num:'18', nat:'Canadian',      team:'Aston Martin', teamId:'aston_martin'},
  {id:'gasly',         first:'Pierre',   last:'Gasly',      num:'10', nat:'French',        team:'Alpine',       teamId:'alpine'      },
  {id:'colapinto',     first:'Franco',   last:'Colapinto',  num:'43', nat:'Argentine',     team:'Alpine',       teamId:'alpine'      },
  {id:'lawson',        first:'Liam',     last:'Lawson',     num:'30', nat:'New Zealander', team:'Racing Bulls', teamId:'racing_bulls'},
  {id:'lindblad',      first:'Arvid',    last:'Lindblad',   num:'5',  nat:'Swedish',       team:'Racing Bulls', teamId:'racing_bulls'},
  {id:'ocon',          first:'Esteban',  last:'Ocon',       num:'31', nat:'French',        team:'Haas',         teamId:'haas'        },
  {id:'bearman',       first:'Oliver',   last:'Bearman',    num:'87', nat:'British',       team:'Haas',         teamId:'haas'        },
  {id:'hulkenberg',    first:'Nico',     last:'Hulkenberg', num:'27', nat:'German',        team:'Audi',         teamId:'audi'        },
  {id:'bortoleto',     first:'Gabriel',  last:'Bortoleto',  num:'5',  nat:'Brazilian',     team:'Audi',         teamId:'audi'        },
  {id:'perez',         first:'Sergio',   last:'Perez',      num:'11', nat:'Mexican',       team:'Cadillac',     teamId:'cadillac'    },
  {id:'bottas',        first:'Valtteri', last:'Bottas',     num:'77', nat:'Finnish',       team:'Cadillac',     teamId:'cadillac'    }
];

var TEAMS = [
  {id:'mercedes',     name:'Mercedes',      country:'Germany',        color:'#00D2BE', champs:8,  pos:1,  pts:180, wins:4, drivers:['russell','antonelli']         },
  {id:'ferrari',      name:'Ferrari',       country:'Italy',          color:'#E8002D', champs:16, pos:2,  pts:110, wins:0, drivers:['leclerc','hamilton']           },
  {id:'mclaren',      name:'McLaren',       country:'United Kingdom', color:'#FF8000', champs:8,  pos:3,  pts:94,  wins:0, drivers:['norris','piastri']             },
  {id:'red_bull',     name:'Red Bull',      country:'Austria',        color:'#3671C6', champs:6,  pos:4,  pts:30,  wins:0, drivers:['max_verstappen','hadjar']      },
  {id:'alpine',       name:'Alpine',        country:'France',         color:'#FF87BC', champs:0,  pos:5,  pts:23,  wins:0, drivers:['gasly','colapinto']            },
  {id:'haas',         name:'Haas',          country:'USA',            color:'#B6BABD', champs:0,  pos:6,  pts:18,  wins:0, drivers:['ocon','bearman']               },
  {id:'racing_bulls', name:'Racing Bulls',  country:'Italy',          color:'#6692FF', champs:0,  pos:7,  pts:14,  wins:0, drivers:['lawson','lindblad']            },
  {id:'williams',     name:'Williams',      country:'United Kingdom', color:'#64C4FF', champs:9,  pos:8,  pts:5,   wins:0, drivers:['albon','sainz']                },
  {id:'audi',         name:'Audi',          country:'Germany',        color:'#B5B5B5', champs:0,  pos:9,  pts:2,   wins:0, drivers:['hulkenberg','bortoleto']       },
  {id:'aston_martin', name:'Aston Martin',  country:'United Kingdom', color:'#229971', champs:0,  pos:10, pts:0,   wins:0, drivers:['alonso','stroll']              },
  {id:'cadillac',     name:'Cadillac',      country:'USA',            color:'#B20000', champs:0,  pos:11, pts:0,   wins:0, drivers:['perez','bottas']               }
];

/* Standings after Round 5 — Canadian GP, May 24 2026 */
var DRIVER_STANDINGS = [
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
  {pos:22, name:'Lance Stroll',      team:'Aston Martin', pts:0,   wins:0}
];

var CONSTRUCTOR_STANDINGS = [
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
  {pos:11, name:'Cadillac',     color:'#B20000', pts:0,   wins:0}
];

var RACES = [
  {round:1,  name:'Australian Grand Prix',    circuit:'Albert Park Circuit',            loc:'Melbourne, Australia',   date:'2026-03-08',time:'06:00:00Z',sprint:false,cid:'albert_park'  },
  {round:2,  name:'Chinese Grand Prix',       circuit:'Shanghai International Circuit', loc:'Shanghai, China',        date:'2026-03-15',time:'07:00:00Z',sprint:true, cid:'shanghai'     },
  {round:3,  name:'Japanese Grand Prix',      circuit:'Suzuka International Racing Course',loc:'Suzuka, Japan',       date:'2026-03-29',time:'06:00:00Z',sprint:false,cid:'suzuka'       },
  {round:4,  name:'Miami Grand Prix',         circuit:'Miami International Autodrome',  loc:'Miami, USA',             date:'2026-05-03',time:'19:00:00Z',sprint:true, cid:'miami'        },
  {round:5,  name:'Canadian Grand Prix',      circuit:'Circuit Gilles Villeneuve',      loc:'Montreal, Canada',       date:'2026-05-24',time:'18:00:00Z',sprint:true, cid:'villeneuve'   },
  {round:6,  name:'Monaco Grand Prix',        circuit:'Circuit de Monaco',              loc:'Monte Carlo, Monaco',    date:'2026-06-07',time:'13:00:00Z',sprint:false,cid:'monaco'       },
  {round:7,  name:'Spanish Grand Prix',       circuit:'Circuit de Barcelona-Catalunya', loc:'Barcelona, Spain',       date:'2026-06-14',time:'13:00:00Z',sprint:false,cid:'catalunya'    },
  {round:8,  name:'Austrian Grand Prix',      circuit:'Red Bull Ring',                  loc:'Spielberg, Austria',     date:'2026-06-28',time:'13:00:00Z',sprint:false,cid:'red_bull_ring'},
  {round:9,  name:'British Grand Prix',       circuit:'Silverstone Circuit',            loc:'Silverstone, UK',        date:'2026-07-05',time:'14:00:00Z',sprint:true, cid:'silverstone'  },
  {round:10, name:'Belgian Grand Prix',       circuit:'Circuit de Spa-Francorchamps',   loc:'Spa, Belgium',           date:'2026-07-19',time:'13:00:00Z',sprint:false,cid:'spa'          },
  {round:11, name:'Hungarian Grand Prix',     circuit:'Hungaroring',                    loc:'Budapest, Hungary',      date:'2026-07-26',time:'13:00:00Z',sprint:false,cid:'hungaroring'  },
  {round:12, name:'Dutch Grand Prix',         circuit:'Circuit Zandvoort',              loc:'Zandvoort, Netherlands', date:'2026-08-23',time:'13:00:00Z',sprint:true, cid:'zandvoort'    },
  {round:13, name:'Italian Grand Prix',       circuit:'Autodromo Nazionale Monza',      loc:'Monza, Italy',           date:'2026-09-06',time:'13:00:00Z',sprint:false,cid:'monza'        },
  {round:14, name:'Madrid Grand Prix',        circuit:'Circuit de Madrid',              loc:'Madrid, Spain',          date:'2026-09-14',time:'13:00:00Z',sprint:false,cid:'madrid'       },
  {round:15, name:'Azerbaijan Grand Prix',    circuit:'Baku City Circuit',              loc:'Baku, Azerbaijan',       date:'2026-09-27',time:'11:00:00Z',sprint:false,cid:'baku'         },
  {round:16, name:'Singapore Grand Prix',     circuit:'Marina Bay Street Circuit',      loc:'Singapore',              date:'2026-10-11',time:'12:00:00Z',sprint:true, cid:'marina_bay'   },
  {round:17, name:'United States Grand Prix', circuit:'Circuit of the Americas',        loc:'Austin, USA',            date:'2026-10-25',time:'19:00:00Z',sprint:false,cid:'americas'     },
  {round:18, name:'Mexico City Grand Prix',   circuit:'Autodromo Hermanos Rodriguez',   loc:'Mexico City, Mexico',    date:'2026-11-01',time:'19:00:00Z',sprint:false,cid:'rodriguez'    },
  {round:19, name:'Sao Paulo Grand Prix',     circuit:'Autodromo Jose Carlos Pace',     loc:'Sao Paulo, Brazil',      date:'2026-11-08',time:'17:00:00Z',sprint:false,cid:'interlagos'   },
  {round:20, name:'Las Vegas Grand Prix',     circuit:'Las Vegas Strip Circuit',        loc:'Las Vegas, USA',         date:'2026-11-21',time:'06:00:00Z',sprint:false,cid:'las_vegas'    },
  {round:21, name:'Qatar Grand Prix',         circuit:'Lusail International Circuit',   loc:'Lusail, Qatar',          date:'2026-11-29',time:'17:00:00Z',sprint:false,cid:'losail'       },
  {round:22, name:'Abu Dhabi Grand Prix',     circuit:'Yas Marina Circuit',             loc:'Abu Dhabi, UAE',         date:'2026-12-06',time:'13:00:00Z',sprint:false,cid:'yas_marina'   }
];


/* ═══════════════════════════════════════════════════════════
   SECTION 2 — UI HELPERS, RENDERING & COUNTDOWN
   Pure functions. No API calls here.
═══════════════════════════════════════════════════════════ */

function tColor(id)  { return TEAM_COLORS[id] || '#E10600'; }
function getFlag(n)  { return FLAGS[n] || '🏁'; }
function getInits(n) { return n.split(/\s+/).map(function(w){return w[0];}).join('').slice(0,3).toUpperCase(); }
function posClass(p) { return p===1?'p1':p===2?'p2':p===3?'p3':''; }
function esc(s)      { return s==null?'':String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function mkAvatar(f,l,c) {
  return 'https://ui-avatars.com/api/?name='+encodeURIComponent(f+' '+l)
       +'&background=1a1a1a&color='+(c||'e10600').replace('#','')
       +'&size=200&bold=true&font-size=0.38';
}

function getCircuitMeta(cid) {
  if (!cid) return CIRCUIT_META.default;
  var s = cid.toLowerCase();
  var keys = Object.keys(CIRCUIT_META);
  for (var i=0;i<keys.length;i++) {
    if (s.indexOf(keys[i])>=0 || keys[i].indexOf(s)>=0) return CIRCUIT_META[keys[i]];
  }
  return CIRCUIT_META.default;
}

/* ── Navigation ── */
document.getElementById('ham').addEventListener('click', function() {
  document.getElementById('nav-links').classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(function(a) {
  a.addEventListener('click', function() { document.getElementById('nav-links').classList.remove('open'); });
});

if (window.IntersectionObserver) {
  var navIO = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        document.querySelectorAll('.nav-links a').forEach(function(a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, {threshold:0.3, rootMargin:'-58px 0px 0px 0px'});
  ['drivers','teams','schedule','standings'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) navIO.observe(el);
  });
}

/* ── Countdown ── */
var _cdTimer = null;

function startCountdown() {
  if (_cdTimer) { clearInterval(_cdTimer); _cdTimer = null; }
  var now = Date.now();
  var next = null;
  for (var i=0; i<RACES.length; i++) {
    if (new Date(RACES[i].date + 'T' + RACES[i].time).getTime() > now) {
      next = RACES[i]; break;
    }
  }
  if (!next) {
    document.getElementById('cd-race').textContent = 'Season Complete';
    document.getElementById('cd-meta').textContent = '2026 Formula One World Championship';
    ['cd-d','cd-h','cd-m','cd-s'].forEach(function(id) { document.getElementById(id).textContent = '00'; });
    return;
  }
  var meta   = getCircuitMeta(next.cid);
  var target = new Date(next.date + 'T' + next.time).getTime();
  document.getElementById('cd-race').textContent = meta.emoji + ' ' + next.name;
  document.getElementById('cd-meta').textContent = 'Round ' + next.round + ' \u00b7 ' + next.circuit + ' \u00b7 ' + next.loc;

  function tick() {
    var diff = target - Date.now();
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

/* ── Driver cards ── */
var _activeDrivers = DRIVERS;
var _teamMap = {}; /* driverId -> team name, filled by API */
var _conMap  = {}; /* driverId -> constructorId, filled by API */

function renderDriverCards(list) {
  var grid = document.getElementById('drivers-grid');
  if (!list.length) {
    grid.innerHTML = '<div class="no-results">NO DRIVERS MATCH YOUR FILTERS</div>';
    return;
  }
  var html = '';
  for (var i=0; i<list.length; i++) {
    var d = list[i];
    var teamId = d.teamId || _conMap[d.driverId || d.id] || '';
    var team   = d.team   || _teamMap[d.driverId || d.id] || 'Unknown';
    var color  = tColor(teamId);
    var img    = DRIVER_IMGS[d.id || d.driverId] || mkAvatar(d.first || d.givenName || '', d.last || d.familyName || '', color);
    var num    = d.num || d.permanentNumber || '?';
    var nat    = d.nat || d.nationality || '';
    var first  = d.first  || d.givenName  || '';
    var last   = d.last   || d.familyName || '';
    var fb     = mkAvatar(first, last, color);
    html +=
      '<div class="driver-card" style="--tc:' + color + '">'
    +   '<div class="driver-img">'
    +     '<img src="' + img + '" alt="' + esc(first) + ' ' + esc(last) + '" loading="lazy" onerror="this.src=\'' + fb + '\'">'
    +     '<div class="driver-img-fade"></div>'
    +     '<div class="driver-number">#' + num + '</div>'
    +     '<div class="driver-flag">' + getFlag(nat) + '</div>'
    +   '</div>'
    +   '<div class="driver-info">'
    +     '<div class="driver-name">' + esc(first) + ' <span>' + esc(last) + '</span></div>'
    +     '<div class="driver-team">' + esc(team) + '</div>'
    +     '<div class="driver-nat">'  + esc(nat)  + '</div>'
    +   '</div>'
    + '</div>';
  }
  grid.innerHTML = html;
}

function buildFilterDropdowns() {
  var tf = document.getElementById('team-filter');
  var nf = document.getElementById('nat-filter');
  while (tf.options.length > 1) tf.remove(1);
  while (nf.options.length > 1) nf.remove(1);
  var teams = [], nats = [];
  for (var i=0; i<_activeDrivers.length; i++) {
    var d = _activeDrivers[i];
    var t = d.team || _teamMap[d.driverId||d.id] || '';
    var n = d.nat  || d.nationality || '';
    if (t && teams.indexOf(t) < 0) teams.push(t);
    if (n && nats.indexOf(n)  < 0) nats.push(n);
  }
  teams.sort().forEach(function(t) { var o=document.createElement('option'); o.value=t; o.textContent=t; tf.appendChild(o); });
  nats.sort().forEach(function(n)  { var o=document.createElement('option'); o.value=n; o.textContent=getFlag(n)+' '+n; nf.appendChild(o); });
}

function applyFilter() {
  var q  = (document.getElementById('drv-search').value||'').toLowerCase();
  var tv = document.getElementById('team-filter').value;
  var nv = document.getElementById('nat-filter').value;
  var out = [];
  for (var i=0; i<_activeDrivers.length; i++) {
    var d    = _activeDrivers[i];
    var name = (d.first||d.givenName||'') + ' ' + (d.last||d.familyName||'');
    var team = d.team || _teamMap[d.driverId||d.id] || '';
    var nat  = d.nat  || d.nationality || '';
    if ((!q  || (name+' '+team).toLowerCase().indexOf(q)>=0) &&
        (!tv || team===tv) &&
        (!nv || nat===nv)) out.push(d);
  }
  renderDriverCards(out);
}

/* ── Team cards ── */
function renderTeams(teamList, standMap, topId) {
  var grid = document.getElementById('teams-grid');
  var dByTeam = {};
  for (var i=0; i<_activeDrivers.length; i++) {
    var d   = _activeDrivers[i];
    var cid = d.teamId || _conMap[d.driverId||d.id] || '';
    if (cid) {
      if (!dByTeam[cid]) dByTeam[cid] = [];
      dByTeam[cid].push((d.first||d.givenName||'') + ' ' + (d.last||d.familyName||''));
    }
  }
  var html = '';
  for (var i=0; i<teamList.length; i++) {
    var t        = teamList[i];
    var tid      = t.id || t.constructorId || '';
    var isLeader = topId ? tid===topId : t.pos===1;
    var color    = t.color || tColor(tid);
    var st       = standMap ? (standMap[tid] || {pos:t.pos||'?', pts:t.pts||0, wins:t.wins||0}) : {pos:t.pos,pts:t.pts,wins:t.wins};
    var drivers  = t.drivers ? t.drivers.map(function(id) {
      for (var j=0;j<DRIVERS.length;j++) { if(DRIVERS[j].id===id) return DRIVERS[j].first+' '+DRIVERS[j].last; }
      return id;
    }) : (dByTeam[tid] || []);
    html +=
      (isLeader
        ? '<div class="team-card leader" style="--tc:'+color+'"><div class="leader-badge">\u2605 Championship Leader</div>'
        : '<div class="team-card" style="--tc:'+color+'">')
    + '<div class="team-logo-row">'
    +   '<div class="team-logo" style="color:'+color+';border-color:'+color+'40">'+getInits(t.name)+'</div>'
    +   '<div><div class="team-name">'+esc(t.name)+'</div><div class="team-country">'+esc(t.country||t.nationality||'')+'</div></div>'
    + '</div>'
    + '<div class="team-drivers">'
    +   (drivers.length ? drivers.map(function(n){return '<span class="driver-chip">'+esc(n)+'</span>';}).join('') : '<span class="driver-chip" style="color:var(--dim)">TBA</span>')
    + '</div>'
    + '<div class="team-stats">'
    +   '<div class="team-stat"><span class="team-stat-n">'+esc(st.pos)+'</span><span class="team-stat-l">Position</span></div>'
    +   '<div class="team-stat"><span class="team-stat-n">'+esc(st.pts)+'</span><span class="team-stat-l">Points</span></div>'
    +   '<div class="team-stat"><span class="team-stat-n">'+esc(t.champs!=null?t.champs:st.wins)+'</span><span class="team-stat-l">'+(t.champs!=null?'WCC Titles':'Wins')+'</span></div>'
    + '</div>'
    + '</div>';
  }
  grid.innerHTML = html;
}

/* ── Schedule grid ── */
function renderSchedule(races) {
  var now = Date.now();
  var nextRound = null;
  var completed = 0;
  for (var i=0; i<races.length; i++) {
    var t = new Date((races[i].date||races[i].Date)+'T'+(races[i].time||races[i].Time||'14:00:00Z')).getTime();
    if (t > now) { nextRound = races[i].round; break; }
  }
  var html = '';
  for (var i=0; i<races.length; i++) {
    var r      = races[i];
    var rDate  = (r.date||r.Date) + 'T' + (r.time||r.Time||'14:00:00Z');
    var rt     = new Date(rDate).getTime();
    var isPast = rt < now;
    var isNext = r.round === nextRound;
    if (isPast && !isNext) completed++;

    var lDate = new Date(rDate).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
    var lTime = new Date(rDate).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',timeZoneName:'short'});

    /* Support both hardcoded and Ergast API formats */
    var cid      = r.cid || (r.Circuit && r.Circuit.circuitId) || '';
    var name     = r.name || r.raceName || '';
    var circuit  = r.circuit || (r.Circuit && r.Circuit.circuitName) || '';
    var loc      = r.loc || (r.Circuit && r.Circuit.Location ? r.Circuit.Location.locality+', '+r.Circuit.Location.country : '');
    var hasSprint= r.sprint || !!(r.Sprint);

    var meta = getCircuitMeta(cid);
    var tags = '';
    if (isNext)      tags += '<span class="tag tag-next">Next Race</span>';
    else if (isPast) tags += '<span class="tag tag-done">Completed</span>';
    else             tags += '<span class="tag tag-soon">Upcoming</span>';
    if (hasSprint)   tags += ' <span class="tag tag-sprint">Sprint</span>';

    html +=
      '<div class="race-card'+(isNext?' is-next':'')+(isPast&&!isNext?' is-past':'')+'"'
    + ' onclick="openModal('+r.round+')" tabindex="0" role="button" aria-label="'+esc(name)+'">'
    + '<div class="race-img">'
    +   (meta.img ? '<img src="'+meta.img+'" alt="'+esc(name)+'" loading="lazy" onerror="this.style.display=\'none\'">' : '')
    +   '<div class="race-img-overlay"></div>'
    +   '<div class="race-emoji">'+meta.emoji+'</div>'
    +   '<div class="race-round-badge">R'+r.round+'</div>'
    + '</div>'
    + '<div class="race-head">'
    +   '<div class="race-name">'+esc(name)+'</div>'
    +   '<div class="race-date">'+lDate+' \u00b7 '+lTime+'</div>'
    + '</div>'
    + '<div class="race-body">'
    +   '<div class="race-circuit">\uD83C\uDFDF '+esc(circuit)+'</div>'
    +   '<div class="race-loc">\uD83D\uDCCD '+esc(loc)+'</div>'
    +   '<div class="race-tags">'+tags+'</div>'
    + '</div>'
    + '<div class="race-hint">CLICK FOR RESULTS \u2192</div>'
    + '</div>';
  }
  document.getElementById('schedule-grid').innerHTML = html;
  document.querySelectorAll('.race-card').forEach(function(c) {
    c.addEventListener('keydown', function(e) { if(e.key==='Enter'||e.key===' ') c.click(); });
  });
  document.getElementById('hs-done').textContent = completed;
}

/* ── Standings tables ── */
function renderDriverStandings(rows) {
  var html = '<div class="standings-head drv">'
    + '<span>Pos</span><span>Driver</span>'
    + '<span style="text-align:right">Pts</span>'
    + '<span style="text-align:right">W</span></div>';
  for (var i=0; i<rows.length; i++) {
    var s = rows[i];
    var p = parseInt(s.pos||s.position)||0;
    html += '<div class="standings-row drv '+posClass(p)+'">'
      + '<span class="st-pos">'+p+'</span>'
      + '<div><div class="st-name">'+esc(s.name||(s.Driver?s.Driver.givenName+' '+s.Driver.familyName:''))+'</div>'
      + '<div class="st-sub">'+esc(s.team||(s.Constructors&&s.Constructors[0]?s.Constructors[0].name:''))+'</div></div>'
      + '<span class="st-pts">'+esc(s.pts||s.points)+'</span>'
      + '<span class="st-wins">'+esc(s.wins)+'W</span>'
      + '</div>';
  }
  document.getElementById('drv-standings').innerHTML = html;
}

function renderConstructorStandings(rows) {
  var html = '<div class="standings-head con">'
    + '<span>Pos</span><span>Team</span>'
    + '<span style="text-align:right">Pts</span></div>';
  for (var i=0; i<rows.length; i++) {
    var s     = rows[i];
    var p     = parseInt(s.pos||s.position)||0;
    var cid   = s.constructorId || '';
    var color = s.color || tColor(cid);
    var name  = s.name || (s.Constructor && s.Constructor.name) || '';
    html += '<div class="standings-row con '+posClass(p)+'">'
      + '<span class="st-pos">'+p+'</span>'
      + '<div><div class="st-name" style="color:'+color+'">'+esc(name)+'</div>'
      + '<div class="st-sub">'+esc(s.wins)+' win'+(s.wins!==1&&s.wins!=='1'?'s':'')+'</div></div>'
      + '<span class="st-pts">'+esc(s.pts||s.points)+'</span>'
      + '</div>';
  }
  document.getElementById('con-standings').innerHTML = html;
}

/* ── Modal close ── */
var _activeRound = null;
var _activeTab   = null;
var _cache       = {};

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  _activeRound = null;
}
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', function(e) { if (e.key==='Escape') closeModal(); });

/* ── Modal open ── */
function openModal(round) {
  /* Look up race — prefer API-enriched data */
  var race = null;
  for (var i=0; i<_liveRaces.length; i++) {
    if (parseInt(_liveRaces[i].round) === round) { race = _liveRaces[i]; break; }
  }
  if (!race) {
    for (var i=0; i<RACES.length; i++) {
      if (RACES[i].round === round) { race = RACES[i]; break; }
    }
  }
  if (!race) return;
  _activeRound = round;

  var now      = Date.now();
  var rDate    = (race.date||race.Date) + 'T' + (race.time||race.Time||'14:00:00Z');
  var isPast   = new Date(rDate).getTime() < now;
  var cid      = race.cid || (race.Circuit && race.Circuit.circuitId) || '';
  var meta     = getCircuitMeta(cid);
  var name     = race.name || race.raceName || '';
  var circuit  = race.circuit || (race.Circuit && race.Circuit.circuitName) || '';
  var loc      = race.loc || (race.Circuit && race.Circuit.Location ? race.Circuit.Location.locality+', '+race.Circuit.Location.country : '');
  var hasSprint= race.sprint || !!(race.Sprint);

  /* Populate hero */
  var heroImg = document.getElementById('modal-hero-img');
  heroImg.src = meta.img || '';
  heroImg.style.display = meta.img ? '' : 'none';
  heroImg.onerror = function() { heroImg.style.display='none'; };
  document.getElementById('modal-hero-emoji').textContent = meta.emoji;
  document.getElementById('modal-hero-round').textContent = 'Round '+round+' \u00b7 '+
    new Date(rDate).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'});
  document.getElementById('modal-hero-name').textContent  = name;
  document.getElementById('modal-hero-sub').textContent   = circuit + ' \u00b7 ' + loc;

  var tabBar     = document.getElementById('modal-tab-bar');
  var tabContent = document.getElementById('modal-tab-content');

  if (!isPast) {
    /* Future race: show countdown info */
    tabBar.innerHTML = '';
    var lDate = new Date(rDate).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    var lTime = new Date(rDate).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',timeZoneName:'long'});
    tabContent.innerHTML =
      '<div class="m-future">'
    +   '<span class="big-emoji">'+meta.emoji+'</span>'
    +   '<h3>'+esc(name)+'</h3>'
    +   '<div class="f-meta">'+esc(circuit)+' \u00b7 '+esc(loc)+'</div>'
    +   '<div class="date-box">'
    +     '<div class="date-lbl">Race Date</div>'
    +     '<div class="date-val">'+lDate+'</div>'
    +     '<div class="time-val">'+lTime+'</div>'
    +   '</div>'
    +   (hasSprint ? '<br><span class="tag tag-sprint" style="display:inline-block;margin-top:0.75rem">Sprint Weekend</span>' : '')
    + '</div>';
  } else {
    /* Past race: show session tabs */
    var tabs = [{id:'race',label:'Race'},{id:'quali',label:'Qualifying'},{id:'fp3',label:'FP3'},{id:'fp2',label:'FP2'},{id:'fp1',label:'FP1'}];
    if (hasSprint) tabs.splice(1,0,{id:'sprint',label:'Sprint'});
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
  if (session === _activeTab) return;
  _activeTab = session;
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  loadSession(_activeRound, session, document.getElementById('modal-tab-content'));
}

/* ── Result table builders ── */
function buildPodium(results, type) {
  if (!results || results.length < 3) return '';
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
  return '<div class="podium">'+slot(results[1],'🥈','p2','2ND')+slot(results[0],'🥇','p1','1ST')+slot(results[2],'🥉','p3','3RD')+'</div>';
}

function buildRaceTable(results) {
  var rows = '';
  for (var i=0; i<results.length; i++) {
    var r   = results[i];
    var pos = parseInt(r.position)||0;
    var fl  = r.FastestLap && r.FastestLap.rank==='1';
    var ts  = (r.Time&&r.Time.time)||(r.status&&r.status!=='Finished'?r.status:'—');
    var dId = r.Driver && r.Driver.driverId;
    var tId = r.Constructor && r.Constructor.constructorId;
    var di  = dId && DRIVER_IMGS[dId];
    var av  = di ? '<img src="'+di+'" style="width:24px;height:24px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:0.35rem;border:1px solid '+tColor(tId)+'" loading="lazy" onerror="this.remove()">' : '';
    rows += '<tr class="rp'+(pos<=3?pos:'')+'">'
      +'<td class="r-pos">'+pos+'</td>'
      +'<td>'+av+'<span class="r-drv">'+(r.Driver?esc(r.Driver.givenName)+' '+esc(r.Driver.familyName):'')+(fl?'<span class="fl-pill">\u26A1 FL</span>':'')+'</span></td>'
      +'<td><span class="r-team">'+(r.Constructor?esc(r.Constructor.name):'')+'</span></td>'
      +'<td class="r-time">'+esc(ts)+'</td>'
      +'<td class="r-pts">'+(r.points||'—')+'</td>'
      +'</tr>';
  }
  return '<div class="res-wrap"><table class="res-table"><thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Time/Gap</th><th class="right">Pts</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

function buildQualiTable(results) {
  var rows = '';
  for (var i=0;i<results.length;i++) {
    var r=results[i]; var pos=parseInt(r.position)||0;
    rows+='<tr class="rp'+(pos<=3?pos:'')+'">'
      +'<td class="r-pos">'+pos+'</td>'
      +'<td><span class="r-drv">'+(r.Driver?esc(r.Driver.givenName)+' '+esc(r.Driver.familyName):'')+'</span></td>'
      +'<td><span class="r-team">'+(r.Constructor?esc(r.Constructor.name):'')+'</span></td>'
      +'<td class="r-time">'+esc(r.Q1||'—')+'</td>'
      +'<td class="r-time">'+esc(r.Q2||'—')+'</td>'
      +'<td class="r-time">'+esc(r.Q3||'—')+'</td>'
      +'</tr>';
  }
  return '<div class="res-wrap"><table class="res-table"><thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Q1</th><th>Q2</th><th>Q3</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

function buildPracticeTable(results) {
  var rows = '';
  for (var i=0;i<results.length;i++) {
    var r=results[i]; var pos=parseInt(r.position)||0;
    rows+='<tr class="rp'+(pos<=3?pos:'')+'">'
      +'<td class="r-pos">'+pos+'</td>'
      +'<td><span class="r-drv">'+(r.Driver?esc(r.Driver.givenName)+' '+esc(r.Driver.familyName):'')+'</span></td>'
      +'<td><span class="r-team">'+(r.Constructor?esc(r.Constructor.name):'')+'</span></td>'
      +'<td class="r-time">'+(r.Time?esc(r.Time.time):'—')+'</td>'
      +'<td class="r-time" style="text-align:right">'+esc(r.Laps||r.laps||'—')+'</td>'
      +'</tr>';
  }
  return '<div class="res-wrap"><table class="res-table"><thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Best Time</th><th class="right">Laps</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}


/* ═══════════════════════════════════════════════════════════
   SECTION 3 — LIVE API LAYER
   All network requests live here. They run AFTER the page
   has already rendered from hardcoded data. If any call fails
   the page keeps working perfectly with the static data.
   API: https://api.jolpi.ca/ergast/f1 (Jolpica / Ergast F1)
═══════════════════════════════════════════════════════════ */

var _liveRaces = []; /* cache of races from API (used by openModal) */

/* Generic fetch wrapper with 8s timeout and silent error handling */
function apiFetch(path, callback) {
  var url = API_BASE + path;
  var xhr = new XMLHttpRequest();
  var done = false;
  var timer = setTimeout(function() {
    if (!done) { done = true; xhr.abort(); callback(null); }
  }, 8000);
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    if (done) return;
    done = true;
    clearTimeout(timer);
    if (xhr.status === 200) {
      try { callback(JSON.parse(xhr.responseText)); }
      catch(e) { callback(null); }
    } else {
      callback(null);
    }
  };
  xhr.send();
}

/* Show a small banner under a section header */
function showBanner(id, type, msg) {
  var el = document.getElementById(id);
  if (!el) return;
  el.className = 'api-banner ' + type;
  el.textContent = (type==='success' ? '\u2705 ' : '\u26a0 ') + msg;
  el.style.display = 'flex';
}

/* 1. Try to upgrade driver grid from API */
function apiLoadDrivers() {
  apiFetch('/'+SEASON+'/drivers/?limit=40', function(dData) {
    apiFetch('/'+SEASON+'/driverstandings/?limit=40', function(sData) {
      if (!dData || !dData.MRData || !dData.MRData.DriverTable || !dData.MRData.DriverTable.Drivers.length) {
        showBanner('api-drivers-banner','error','API unavailable for 2026 — showing hardcoded data');
        return;
      }
      var apiDrivers = dData.MRData.DriverTable.Drivers;
      if (sData && sData.MRData && sData.MRData.StandingsTable) {
        var lists = sData.MRData.StandingsTable.StandingsLists;
        if (lists && lists[0] && lists[0].DriverStandings) {
          lists[0].DriverStandings.forEach(function(s) {
            _conMap[s.Driver.driverId]  = s.Constructors&&s.Constructors[0] ? s.Constructors[0].constructorId : '';
            _teamMap[s.Driver.driverId] = s.Constructors&&s.Constructors[0] ? s.Constructors[0].name : '';
          });
        }
      }
      _activeDrivers = apiDrivers;
      buildFilterDropdowns();
      renderDriverCards(apiDrivers);
      document.getElementById('hs-drivers').textContent = apiDrivers.length;
      showBanner('api-drivers-banner','success','Drivers upgraded from Jolpica F1 API');
    });
  });
}

/* 2. Try to upgrade teams grid from API */
function apiLoadTeams() {
  apiFetch('/'+SEASON+'/constructors/?limit=20', function(cData) {
    apiFetch('/'+SEASON+'/constructorstandings/?limit=20', function(sData) {
      if (!cData || !cData.MRData || !cData.MRData.ConstructorTable || !cData.MRData.ConstructorTable.Constructors.length) {
        showBanner('api-teams-banner','error','API unavailable for 2026 — showing hardcoded data');
        return;
      }
      var cons = cData.MRData.ConstructorTable.Constructors;
      var standMap = {};
      var topId    = '';
      if (sData && sData.MRData && sData.MRData.StandingsTable) {
        var lists = sData.MRData.StandingsTable.StandingsLists;
        if (lists && lists[0] && lists[0].ConstructorStandings) {
          lists[0].ConstructorStandings.forEach(function(s,i) {
            standMap[s.Constructor.constructorId] = {pos:s.position, pts:s.points, wins:s.wins};
            if (i===0) topId = s.Constructor.constructorId;
          });
        }
      }
      cons.sort(function(a,b){
        return parseInt((standMap[a.constructorId]||{}).pos||99) - parseInt((standMap[b.constructorId]||{}).pos||99);
      });
      renderTeams(cons, standMap, topId);
      document.getElementById('hs-teams').textContent = cons.length;
      showBanner('api-teams-banner','success','Teams upgraded from Jolpica F1 API');
    });
  });
}

/* 3. Try to upgrade schedule from API */
function apiLoadSchedule() {
  apiFetch('/'+SEASON+'/?limit=30', function(data) {
    if (!data || !data.MRData || !data.MRData.RaceTable || !data.MRData.RaceTable.Races.length) {
      showBanner('api-schedule-banner','error','API unavailable for 2026 — showing hardcoded schedule');
      return;
    }
    var races = data.MRData.RaceTable.Races;
    _liveRaces = races;
    renderSchedule(races);
    document.getElementById('hs-races').textContent = races.length;
    /* Re-run countdown with live data in case dates differ */
    var now = Date.now();
    for (var i=0;i<races.length;i++) {
      var t = new Date((races[i].date||'')+'T'+(races[i].time||'14:00:00Z')).getTime();
      if (t > now) {
        var meta = getCircuitMeta(races[i].Circuit ? races[i].Circuit.circuitId : '');
        document.getElementById('cd-race').textContent = meta.emoji+' '+races[i].raceName;
        document.getElementById('cd-meta').textContent = 'Round '+races[i].round+' \u00b7 '+(races[i].Circuit?races[i].Circuit.circuitName:'')+' \u00b7 '+(races[i].Circuit&&races[i].Circuit.Location?races[i].Circuit.Location.locality+', '+races[i].Circuit.Location.country:'');
        break;
      }
    }
    showBanner('api-schedule-banner','success','Schedule upgraded from Jolpica F1 API');
  });
}

/* 4. Try to upgrade standings from API */
function apiLoadStandings() {
  apiFetch('/'+SEASON+'/driverstandings/?limit=40', function(dData) {
    if (dData && dData.MRData && dData.MRData.StandingsTable) {
      var lists = dData.MRData.StandingsTable.StandingsLists;
      if (lists && lists[0] && lists[0].DriverStandings && lists[0].DriverStandings.length) {
        renderDriverStandings(lists[0].DriverStandings);
        var pill = document.getElementById('drv-live-pill');
        if (pill) pill.style.display='inline';
        document.getElementById('drv-src').textContent = 'Live via Jolpica F1 API \u00b7 After Round '+lists[0].round;
      }
    }
  });
  apiFetch('/'+SEASON+'/constructorstandings/?limit=20', function(cData) {
    if (cData && cData.MRData && cData.MRData.StandingsTable) {
      var lists = cData.MRData.StandingsTable.StandingsLists;
      if (lists && lists[0] && lists[0].ConstructorStandings && lists[0].ConstructorStandings.length) {
        var rows = lists[0].ConstructorStandings.map(function(s) {
          return { pos:parseInt(s.position), name:s.Constructor.name, constructorId:s.Constructor.constructorId, pts:s.points, wins:s.wins };
        });
        renderConstructorStandings(rows);
        var pill = document.getElementById('con-live-pill');
        if (pill) pill.style.display='inline';
        document.getElementById('con-src').textContent = 'Live via Jolpica F1 API \u00b7 After Round '+lists[0].round;
      }
    }
  });
}

/* 5. Fetch session results for the modal */
function loadSession(round, session, el) {
  var key = SEASON+'-'+round+'-'+session;
  if (_cache[key]) { el.innerHTML='<div class="tab-pane active">'+_cache[key]+'</div>'; return; }
  el.innerHTML='<div class="tab-pane active"><div class="m-loading"><span class="spinner"></span>Loading '+session+' data\u2026</div></div>';
  var paths = {
    race:'/'+SEASON+'/'+round+'/results/',
    quali:'/'+SEASON+'/'+round+'/qualifying/',
    sprint:'/'+SEASON+'/'+round+'/sprint/',
    fp1:'/'+SEASON+'/'+round+'/practice/1/',
    fp2:'/'+SEASON+'/'+round+'/practice/2/',
    fp3:'/'+SEASON+'/'+round+'/practice/3/'
  };
  apiFetch(paths[session], function(data) {
    if (!data || !data.MRData || !data.MRData.RaceTable) {
      var h='<div class="m-error">\u26a0 Could not reach the API. Please check your internet connection.</div>';
      el.innerHTML='<div class="tab-pane active">'+h+'</div>'; return;
    }
    var races = data.MRData.RaceTable.Races;
    if (!races || !races.length) {
      var h='<div class="m-empty">\uD83D\uDCEB Session data not yet available for this event.</div>';
      _cache[key]=h; el.innerHTML='<div class="tab-pane active">'+h+'</div>'; return;
    }
    var rObj    = races[0];
    var results = rObj.Results||rObj.QualifyingResults||rObj.SprintResults||rObj.PracticeResults||[];
    if (!results.length) {
      var h='<div class="m-empty">\uD83D\uDCEB No results data for this session yet.</div>';
      _cache[key]=h; el.innerHTML='<div class="tab-pane active">'+h+'</div>'; return;
    }
    var h='';
    if (session==='race'||session==='sprint') { h+=buildPodium(results,session); h+=buildRaceTable(results); }
    else if (session==='quali')               { h+=buildPodium(results,'quali'); h+=buildQualiTable(results); }
    else                                       { h+=buildPracticeTable(results); }
    _cache[key]=h; el.innerHTML='<div class="tab-pane active">'+h+'</div>';
  });
}

/* Refresh standings every 5 minutes */
function scheduleRefresh() {
  setTimeout(function() { apiLoadStandings(); scheduleRefresh(); }, 5*60*1000);
}


/* ═══════════════════════════════════════════════════════════
   BOOT — runs on page load
   Step 1: Render everything from hardcoded data (instant)
   Step 2: Fire API calls to upgrade content silently
═══════════════════════════════════════════════════════════ */
(function boot() {

  /* ── STEP 1: Instant render from hardcoded data ── */

  startCountdown();

  buildFilterDropdowns();
  document.getElementById('drv-search').addEventListener('input',   applyFilter);
  document.getElementById('team-filter').addEventListener('change', applyFilter);
  document.getElementById('nat-filter').addEventListener('change',  applyFilter);
  renderDriverCards(DRIVERS);

  renderTeams(TEAMS, null, null);
  renderSchedule(RACES);
  renderDriverStandings(DRIVER_STANDINGS);
  renderConstructorStandings(CONSTRUCTOR_STANDINGS);

  document.getElementById('hs-drivers').textContent = DRIVERS.length;
  document.getElementById('hs-teams').textContent   = TEAMS.length;
  document.getElementById('hs-races').textContent   = RACES.length;

  /* ── STEP 2: Background API upgrades (500ms delay) ── */
  setTimeout(function() {
    apiLoadDrivers();
    apiLoadTeams();
    apiLoadSchedule();
    apiLoadStandings();
    scheduleRefresh();
  }, 500);

})();