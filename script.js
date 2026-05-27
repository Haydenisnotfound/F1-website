'use strict';

/* ── Cache busting ───────────────────────────────────────────
   Every time we update the site, we bump this number.
   That wipes the old saved data so fresh data gets loaded. */
const CACHE_VERSION = '9'; /*current version number */
if (localStorage.getItem('f1hub-version') !== CACHE_VERSION) { /* local storage finds the website version and if not cache version number 9, */
  ['f1-schedule','f1-results','f1-drivers','f1-constructors'].forEach(k => /*we get the results, schedule, drivers, constuctors info and remove it */
    localStorage.removeItem(k)); /* removes all the info */
  localStorage.setItem('f1hub-version', CACHE_VERSION); /* saves the current version number into the local storage */
}

/* ── API base URL ──────────────────────────────────────────── */
const API_BASE  = 'https://api.jolpi.ca/ergast/f1'; /*API Websites (calls the API) */
const CACHE_TTL = 5 * 60 * 1000; // how long to keep saved data (5 minutes)

// ── Circuit background images ───────────────────────────────
const CIRCUIT_IMAGES = {
  'Albert Park Grand Prix Circuit':  'https://media.formula1.com/image/upload/c_lfill,w_3392/q_auto/v1740000001/fom-website/campaign/support-promoter/australia/FAQ%2025%20SD_2024_Australia_Helicopter_200%20169.webp',
  'Bahrain International Circuit':   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOmdM1tP08Qirxndg2rI-xGSfSZor0tZafCQ&s',
  'Jeddah Corniche Circuit':         'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN04upqm5siYabk9TbFXNT5bR5aeEV74JbeA&s',
  'Suzuka Circuit':                  'https://media.formula1.com/image/upload/t_16by9South/c_lfill,w_3392/q_auto/v1740000001/trackside-images/2024/F1_Grand_Prix_of_Japan/2147405986.webp',
  'Shanghai International Circuit':  'https://media.formula1.com/image/upload/t_16by9South/c_lfill,w_3392/q_auto/v1740000001/fom-website/2025/China/GettyImages-2147970664.webp',
  'Miami International Autodrome':   'https://images.unsplash.com/photo-1589083130544-0d6a2926e519?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWlhbWl8ZW58MHx8MHx8fDA%3D',
  'Autodromo Enzo e Dino Ferrari':   'https://images.unsplash.com/photo-1551801841-ecad875a5142?w=600&q=70',
  'Circuit de Monaco':               'https://media.formula1.com/image/upload/t_16by9Centre/c_lfill,w_3392/q_auto/v1740000001/fom-website/2025/Monaco/GettyImages-2217000310.webp',
  'Circuit de Barcelona-Catalunya':  'https://www.lrs-formula.com/c/57-pdt_1920/barcelona-catalunya-circuit.jpg',
  'Circuit Gilles Villeneuve':       'https://media.formula1.com/image/upload/t_16by9South/c_lfill,w_3392/q_auto/v1740000001/trackside-images/2025/F1_Grand_Prix_of_Canada/2220284738.webp',
  'Red Bull Ring':                   'https://media.formula1.com/image/upload/t_16by9Centre/c_lfill,w_2048/q_auto/v1740000001/fom-website/2025/Austria/NEED%20TO%20KNOW%20V1%20(2).webp',
  'Silverstone Circuit':             'https://media.formula1.com/image/upload/c_lfill,w_3392/q_auto/v1740000001/content/dam/fom-website/sutton/2021/GreatBritain/Sunday/1329376119.webp',
  'Hungaroring':                     'https://media.formula1.com/image/upload/t_16by9South/c_lfill,w_3392/q_auto/v1740000001/fom-website/2025/Miscellaneous/GettyImages-2162887615.webp',
  'Circuit de Spa-Francorchamps':    'https://media.formula1.com/image/upload/t_16by9Centre/c_lfill,w_3392/q_auto/v1740000001/trackside-images/2024/F1_Grand_Prix_of_Belgium/2164083565.webp',
  'Circuit Park Zandvoort':          'https://www.circuitzandvoort.nl/images/backgrounds/background-the-circuit-mobile.jpg',
  'Autodromo Nazionale di Monza':    'https://media.formula1.com/image/upload/c_lfill,w_3392/q_auto/v1740000001/trackside-images/2024/F1_Grand_Prix_of_Italy/2169742960.webp',
  'Baku City Circuit':               'https://www.f1-fansite.com/wp-content/uploads/2024/09/ALPINE_00002125_0416.jpg',
  'Marina Bay Street Circuit':       'https://corp.formula1.com/wp-content/uploads/2022/01/JPG-RGB-72-DPI-455849740-scaled.jpg',
  'Circuit of the Americas':         'https://images.unsplash.com/photo-1716408703120-16c0cad5195f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE5fHx8ZW58MHx8fHx8',
  'Autódromo Hermanos Rodríguez':    'https://media.formula1.com/image/upload/t_16by9Centre/c_lfill,w_3392/q_auto/v1740000001/trackside-images/2024/F1_Grand_Prix_of_Mexico/2181405883.webp',
  'Autódromo José Carlos Pace':      'https://media.formula1.com/image/upload/t_16by9South/c_lfill,w_3392/q_auto/v1740000001/fom-website/2023/Brazil/GettyImages-1441228783.webp',
  'Las Vegas Strip Street Circuit':  'https://images.unsplash.com/photo-1664020361093-79cdc912cfb2?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGxhcyUyMHZlZ2FzfGVufDB8fDB8fHww',
  'Losail International Circuit':    'https://images.unsplash.com/photo-1700901742651-6b353164caf3?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZG9oYXxlbnwwfHwwfHx8MA%3D%3D',
  'Yas Marina Circuit':              'https://media.formula1.com/image/upload/t_16by9South/c_lfill,w_3392/q_auto/v1740000001/fom-website/campaign/1019441640-SUT-20221120-GP22EAA_124524_GHZ8825.webp',
  'Madring':                         'https://images.unsplash.com/photo-1543783207-ec64e4d95325?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFkcmlkfGVufDB8fDB8fHww',
};
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1541773367336-d3f9f1d312b4?w=600&q=70'; //default image if track does not match with the array

/* ── Country flags ───────────────────────────────────────────
   country names to emoji flags */
const COUNTRY_FLAGS = {
  'Australia':'🇦🇺','Bahrain':'🇧🇭','Saudi Arabia':'🇸🇦','Japan':'🇯🇵',
  'China':'🇨🇳','USA':'🇺🇸','United States':'🇺🇸','Italy':'🇮🇹',
  'Monaco':'🇲🇨','Spain':'🇪🇸','Canada':'🇨🇦','Austria':'🇦🇹',
  'UK':'🇬🇧','United Kingdom':'🇬🇧','Hungary':'🇭🇺','Belgium':'🇧🇪',
  'Netherlands':'🇳🇱','Azerbaijan':'🇦🇿','Singapore':'🇸🇬',
  'Mexico':'🇲🇽','Brazil':'🇧🇷','Qatar':'🇶🇦','UAE':'🇦🇪',
  'Abu Dhabi':'🇦🇪','Las Vegas':'🇺🇸',
};

/* ── City timezones ──────────────────────────────────────────
   maps each race city to its timezone string
   used to show the live local time in that city on the popup */
const CITY_TIMEZONES = {
  'Melbourne':   'Australia/Melbourne', //australia
  'Sakhir':      'Asia/Bahrain',        //bahrain
  'Jeddah':      'Asia/Riyadh',         //saudi arabia
  'Suzuka':      'Asia/Tokyo',          //japan
  'Shanghai':    'Asia/Shanghai',       //china
  'Miami':       'America/New_York',    //usa (miami uses eastern time)
  'Imola':       'Europe/Rome',         //italy
  'Monaco':      'Europe/Monaco',       //monaco
  'Barcelona':   'Europe/Madrid',       //spain
  'Montreal':    'America/Toronto',     //canada
  'Spielberg':   'Europe/Vienna',       //austria
  'Silverstone': 'Europe/London',       //uk
  'Budapest':    'Europe/Budapest',     //hungary
  'Spa':         'Europe/Brussels',     //belgium
  'Zandvoort':   'Europe/Amsterdam',    //netherlands
  'Monza':       'Europe/Rome',         //italy
  'Baku':        'Asia/Baku',           //azerbaijan
  'Singapore':   'Asia/Singapore',      //singapore
  'Austin':      'America/Chicago',     //usa (austin uses central time)
  'Mexico City': 'America/Mexico_City', //mexico
  'São Paulo':   'America/Sao_Paulo',   //brazil
  'Las Vegas':   'America/Los_Angeles', //usa (las vegas uses pacific time)
  'Lusail':      'Asia/Qatar',          //qatar
  'Abu Dhabi':   'Asia/Dubai',          //uae
  'Madrid':      'Europe/Madrid',       //spain
};

/* ── Team colours ────────────────────────────────────────────
   color team names throughout the site */
const TEAM_COLORS = {
  'Red Bull':'#3671C6','McLaren':'#FF8000','Ferrari':'#E8002D',
  'Mercedes':'#27F4D2','Aston Martin':'#358C75','Alpine':'#FF87BC',
  'Williams':'#64C4FF','Racing Bulls':'#6692FF','Kick Sauber':'#52E252',
  'Haas':'#B6BABD',
};

/* ── App state ───────────────────────────────────────────────
   variables that hold data */
let allRaces             = [];   // every race in the season
let countdownInterval    = null; // the timer ticking every second
let miniTimers           = {};   // mini timers on each race card
let currentTab           = 'drivers'; // which standings tab is active
let driverStandings      = []; //driver standings
let constructorStandings = []; //constructor standings

/* ── localStorage cache helpers ─────────────────────────────
   Saves API responses so we don't fetch the same data twice */
function cacheSet(key, data) { //gets the keys name and the data
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch(_) {} //in the local storage, we give it a key, turn the data into a text string, add a timestamp. If it fails, ignore it
}
function cacheGet(key) { //gets the keyname to look up in the browser's memory
  try {
    const raw = localStorage.getItem(key); //looks in the local storage to find any available data saved under the key name
    if (!raw) return null; //if no data, return nothing
    const obj = JSON.parse(raw); //convert the text string to usable data
    if (Date.now() - obj.ts > CACHE_TTL) { localStorage.removeItem(key); return null; } //current time minus saved time, if older than 5 mins, delete it and return nothing
    return obj.data; //returns the fresh data
  } catch(_) { return null; } //if failed, return nothing
}

// ── apiFetch ────────────────────────────────────────────────
async function apiFetch(url, cacheKey) { //get the URL to fetch and the key name to save it under
  const cached = cacheGet(cacheKey); //check if we already have saved data
  if (cached) return cached; //if we do, return it and skip the API call

  for (let attempt = 1; attempt <= 3; attempt++) { // try up to 3 times in case the API is slow or briefly down. Starts at 1 attempt and adds till 3
    try {
      const controller = new AbortController(); // create a cancel controller for the fetch request
      const timer = setTimeout(() => controller.abort(), 15000); //timer for 15 seconds, if longer, cancel the request
      const res = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } }); // call the API, attach the cancel controller, tell the API to receive JSON back
      clearTimeout(timer); //clear timer if we receive a response
      if (!res.ok) throw new Error(`HTTP ${res.status}`); //if the API returned an error code, treat it as a failure
      const json = await res.json(); //converts API response to usable data
      cacheSet(cacheKey, json); // save so next visit is instant
      return json; //return the data
    } catch (err) { //if error,
      console.warn(`Attempt ${attempt} failed for ${url}:`, err.message); //console.log the warning that the API failed
      if (attempt === 3) throw err; // all 3 tries failed, give up
      await new Promise(r => setTimeout(r, attempt * 2000)); //wait 2s after 1st fail, 4s after 2nd fail
    }
  }
}

/* ── Date/time helpers ───────────────────────────────────────*/

function raceDateTime(race) { //get race object
  const time = race.time || '14:00:00Z'; //set the race time or 2 pm if no time was given
  return new Date(`${race.date}T${time}`); //combine the time and date into a js date object
}

function formatDate(date) { //format the date — day, month, year
  return date.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }); //format the date (8 Mar 2026)
}

function formatDay(date) { //formats the weekday, day, month
  return date.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' }); //format the date (Sun 8 Mar)
}

function timeDiff(target) { //creates the countdown
  const diff = target - Date.now(); //the day and time of the race subtracted by the date and time right now to get the time difference
  if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0, past:true }; //if the time hits 0, past is true
  const s = Math.floor(diff / 1000); //converts milliseconds to seconds
  return {
    days:    Math.floor(s / 86400), //divide by 86400 (seconds in a day) to get days, round down
    hours:   Math.floor((s % 86400) / 3600), // leftover seconds after removing days (divide by 3600 to get hours)
    minutes: Math.floor((s % 3600) / 60), // leftover seconds after removing hours (divide by 60 to get minutes)
    seconds: s % 60, //leftover seconds
    past: false, //race has not happened, past is false
  };
}

function pad(n) { return String(n).padStart(2, '0'); } //turn the number into a string, pad(n) makes it always 2 digits

/* ── Small utility helpers ───────────────────────────────────*/
function getFlag(country) { return COUNTRY_FLAGS[country] || '🏁'; } //gets the flag of the country in the flag list, if cannot find, we put a chequered flag
function getImg(name)     { return CIRCUIT_IMAGES[name]   || DEFAULT_IMG; } //gets the img of the circuit in the circuit image list, if we cannot find, we put a default img
function teamColor(name) { //gets team name
  for (const [k,v] of Object.entries(TEAM_COLORS)) { //loop through the teams (k=key/team name, v=value/the color)
    if (name && name.includes(k)) return v; //if list contains the team name, we return the color
  }
  return '#888'; //return the color gray if team not found
}
function errorHTML(msg) { //receive an error message string
  return `<div class="error-state"><div class="error-icon">⚠️</div><p>${msg}</p></div>`; //wrap it in HTML with a warning emoji and return it
}

/* ── NEW: Format a UTC time into the user's local time ───────
   takes a date string "2026-06-01" and time "13:00:00Z"
   and converts it to the user's local time e.g. "13:00" */
function formatLocalTime(dateStr, timeStr) {
  if (!timeStr) return 'TBA'; //if no time given by the API, show TBA (to be announced)
  const dt = new Date(`${dateStr}T${timeStr}`); //combine date and time into one Date object
  return dt.toLocaleTimeString('en-GB', { //format it as a readable time string
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, //use 24-hour format
  });
}

/* ── NEW: Get the current live time in a race city ───────────
   uses JavaScript's built-in Intl — no external API needed */
function getCityTime(locality) {
  const tz = CITY_TIMEZONES[locality]; //look up the timezone for this city
  if (!tz) return null; //if city not in our list, return nothing
  return new Intl.DateTimeFormat('en-GB', { //format the current time in that city's timezone
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
  }).format(new Date()); //format right now in that city's timezone
}

/* ── NEW: Build the race weekend schedule HTML ───────────────
   takes a race object from the API and builds a list of all
   session times (FP1, FP2, FP3, Quali, Sprint, Race)
   converted to the user's local timezone */
function buildWeekendSchedule(race) {
  const sessions = [ //list of all possible sessions in a race weekend
    { key: 'FirstPractice',    label: '🔧 Practice 1',         icon: 'fp' },
    { key: 'SecondPractice',   label: '🔧 Practice 2',         icon: 'fp' },
    { key: 'ThirdPractice',    label: '🔧 Practice 3',         icon: 'fp' },
    { key: 'Sprint',           label: '⚡ Sprint Race',         icon: 'sprint' },
    { key: 'SprintQualifying', label: '⚡ Sprint Qualifying',   icon: 'sprint' },
    { key: 'Qualifying',       label: '🏁 Qualifying',          icon: 'quali' },
    { key: 'date',             label: '🏆 Race',                icon: 'race', isRace: true },
  ];

  let rows = ''; //we will build up the HTML rows here one by one

  sessions.forEach(session => { //loop through each session
    let dateStr, timeStr;

    if (session.isRace) { //the race date and time sit at the top level of the race object
      dateStr = race.date;
      timeStr = race.time || null;
    } else {
      const s = race[session.key]; //other sessions are nested inside e.g. race.FirstPractice
      if (!s) return; //if this session doesn't exist (e.g. no sprint this weekend), skip it
      dateStr = s.date;
      timeStr = s.time || null;
    }

    const dayLabel = new Date(dateStr).toLocaleDateString('en-GB', { //convert session date into a readable day e.g. "Fri 12 Jun"
      weekday: 'short', day: 'numeric', month: 'short'
    });

    const localTime = formatLocalTime(dateStr, timeStr); //convert the session time to the user's local time

    rows += ` //add this session as a row in the schedule
      <div class="ws-row ws-${session.icon}">
        <div class="ws-session-name">${session.label}</div>
        <div class="ws-session-day">${dayLabel}</div>
        <div class="ws-session-time">${localTime}</div>
      </div>`;
  });

  return rows; //return all session rows as one HTML string
}

/* ── NEW: Open the race weekend popup ────────────────────────
   called when an upcoming race card is tapped
   shows the live local time in the race city + full weekend schedule */
function openRaceWeekendModal(race) { //gets the race object that was tapped
  const overlay  = document.getElementById('modalOverlay'); //variable to get the dark background overlay
  const content  = document.getElementById('modalContent'); //variable to get the white popup box content area

  const flag     = getFlag(race.Circuit.Location.country); //gets the country emoji flag
  const img      = getImg(race.Circuit.circuitName); //gets the circuit background image
  const locality = race.Circuit.Location.locality; //city name e.g. "Montreal"
  const country  = race.Circuit.Location.country; //country name e.g. "Canada"
  const cityTime = getCityTime(locality); //gets the current live time in that city

  const scheduleHTML = buildWeekendSchedule(race); //build the weekend schedule HTML rows

  content.innerHTML = ` //build and insert the popup content
    <div class="rw-header">
      <img class="rw-img" src="${img}" alt="${race.raceName}" loading="lazy"/> <!-- circuit background photo -->
      <div class="rw-img-overlay"></div> <!-- dark gradient so text is readable -->
      <div class="rw-header-text">
        <div class="rw-round">Round ${race.round} · ${race.season}</div> <!-- e.g. "Round 5 · 2026" -->
        <div class="rw-name">${race.raceName.replace(' Grand Prix', '')}<br/>Grand Prix</div> <!-- race name split across two lines -->
        <div class="rw-location">${flag} ${race.Circuit.circuitName} — ${country}</div> <!-- flag, circuit, country -->
      </div>
    </div>

    <div class="rw-body">
      ${cityTime ? ` //only show the city clock if we have a timezone for this city
      <div class="rw-city-time">
        <span class="rw-city-time-label">🕐 Local time in ${locality}</span> <!-- label showing which city -->
        <span class="rw-city-time-value" id="cityTimeLive">${cityTime}</span> <!-- live clock — updates every second -->
      </div>` : ''}

      <div class="rw-schedule-title">📅 Race Weekend Schedule <span class="rw-tz-note">(your local time)</span></div> <!-- section title -->
      <div class="rw-schedule">
        ${scheduleHTML || '<p style="color:var(--gray);padding:16px">Schedule not yet available.</p>'} <!-- all session rows, or a message if none -->
      </div>
    </div>`;

  overlay.classList.add('open'); //add "open" class to make the popup visible
  document.body.style.overflow = 'hidden'; //stop the page from scrolling behind the popup

  const tz = CITY_TIMEZONES[locality]; //look up the timezone for this city
  if (tz) { //if we have a timezone, start a live clock
    overlay._cityClockInterval = setInterval(() => { //store the interval on the overlay so we can clear it when closed
      const el = document.getElementById('cityTimeLive'); //find the live clock element
      if (!el) { clearInterval(overlay._cityClockInterval); return; } //if popup was closed, stop the clock
      el.textContent = new Intl.DateTimeFormat('en-GB', { //update the clock with current time in that city
        timeZone: tz,
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, weekday: 'short',
      }).format(new Date()); //format right now in that timezone
    }, 1000); //update every second
  }
}

// ── Navbar ──────────────────────────────────────────────────
function initNavbar() { //setup the navbar
  const navbar = document.getElementById('navbar'); //connects the element with the navbar
  const links  = document.querySelectorAll('.nav-link'); //connects all nav-links

  window.addEventListener('scroll', () => { //listens or waits for the user to scroll
    navbar.classList.toggle('scrolled', window.scrollY > 20); // add a shadow to the navbar once the user scrolls down more than 20px
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400); //if the user scrolls more than 400px, show the back to the top button
    let current = ''; //variable to store which section is on screen
    ['hero','countdown','upcoming','results','standings','past'].forEach(id => { //loops every section
      const el = document.getElementById(id); //finds the section element with the id
      if (el && window.scrollY >= el.offsetTop - 100) current = id; //if the section and how much the user scrolls down is greater than the top of the page minus 100px, this is where the user is
    });
    links.forEach(l => { //loops the nav links
      const href = l.getAttribute('href').replace('#',''); //gets the href and remove the #
      l.classList.toggle('active', href === current); //if the link matches the current section, highlight it in the navbar
    });
  }, { passive: true }); //tells the browser to not block the scrolling

  const ham = document.getElementById('hamburger'); //sets the hamburger element
  const nav = document.getElementById('navLinks'); //sets the navbar/mobile nav menu
  ham.addEventListener('click', () => { //listens for a click
    ham.classList.toggle('open'); //add or remove "open" on the hamburger icon to make it look like an x
    nav.classList.toggle('open'); //add or remove "open" to show the menu/hide menu
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { // add a click listener to every link in the menu
    ham.classList.remove('open'); //turns x back to a hamburger
    nav.classList.remove('open'); //remove or hide mobile menu
  }));

  document.getElementById('backToTop').addEventListener('click', () => //listens when back to top button is clicked
    window.scrollTo({ top:0, behavior:'smooth' })); //scroll page smoothly to the top
}

// ── Dark mode ───────────────────────────────────────────────
function initTheme() { //set up light and dark mode
  const toggle = document.getElementById('themeToggle'); //set the element themeToggle
  const saved  = localStorage.getItem('f1hub-theme') || 'light'; //gets the saved theme from local storage, light is default
  document.documentElement.dataset.theme = saved; //apply the saved theme to the page
  toggle.addEventListener('click', () => { //listens for a click on the toggle button
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; //interchanges between the 2 themes
    document.documentElement.dataset.theme = next; //applies the theme to the whole page
    localStorage.setItem('f1hub-theme', next); //saves it in the local storage
  });
}

/* ── Refresh button ──────────────────────────────────────────
   Clears saved data and re-fetches everything from the API */
function initRefresh() {
  document.getElementById('refreshBtn').addEventListener('click', () => { //add an event listener to the element "refreshBtn" and waits for a click
    ['f1-schedule','f1-results','f1-drivers','f1-constructors'].forEach(k => //loops through the schedule, results, driver, and constructors
      localStorage.removeItem(k)); //removes them all from the local storage
    loadAll(); //fetch from the api again
  });
}

/* ── Standings tabs ──────────────────────────────────────────
   Switches between Drivers and Constructors tables */
function initTabs() { //sets up the standings tabs
  document.querySelectorAll('.tab-btn').forEach(btn => { //selects all the tab buttons
    btn.addEventListener('click', () => { //add an event listener to the button, listens for click
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); //remove active from all btns
      btn.classList.add('active'); //add active to the clicked btn
      currentTab = btn.dataset.tab; //save which tab is active — either drivers or constructors
      renderStandings(); //shows the correct standings table
    });
  });
}

/* ── Next race / season complete card ────────────────────────
   Shows either a countdown to the next race, or the last race
   if the season is over */
function renderNextRace(race, seasonOver) { //gets the race data and whether the season is over yet
  const card = document.getElementById('nextRaceCard'); //gets the nextRaceCard element
  const dt   = raceDateTime(race); //gets race date and time
  const flag = getFlag(race.Circuit.Location.country); //gets country flag
  const img  = getImg(race.Circuit.circuitName); //gets circuit image

  /* creates the DOM for the race card */
  card.innerHTML = `
    <div class="nrc-hero">
      <img class="nrc-hero-img" src="${img}" alt="${race.raceName}" loading="lazy"/>
      <div class="nrc-hero-overlay"></div>
      <div class="nrc-hero-text">
        <div class="nrc-round">Round ${race.round} · ${race.season}</div>
        <div class="nrc-name">${race.raceName.replace(' Grand Prix','')}<br/>Grand Prix</div>
        <div class="nrc-circuit">
          <span class="nrc-flag">${flag}</span>
          ${race.Circuit.circuitName} — ${race.Circuit.Location.country}
        </div>
      </div>
    </div>
    <div class="nrc-body">
      <div class="nrc-info">
        <div class="nrc-info-item">
          <span class="nrc-info-label">Date</span>
          <span class="nrc-info-value">${formatDate(dt)}</span>
        </div>
        <div class="nrc-info-item">
          <span class="nrc-info-label">Circuit</span>
          <span class="nrc-info-value">${race.Circuit.circuitName}</span>
        </div>
        <div class="nrc-info-item">
          <span class="nrc-info-label">Location</span>
          <span class="nrc-info-value">${race.Circuit.Location.locality}, ${race.Circuit.Location.country}</span>
        </div>
      </div>
      <div class="nrc-countdown">
        ${seasonOver
          ? '<span class="nrc-countdown-label" style="font-size:1.2rem">Season complete — see you in 2027! 🏁</span>'
          : `<span class="nrc-countdown-label">Lights out in</span>
             <div class="countdown-boxes" id="mainCountdown">
               ${countdownBoxHTML('00','DAYS')}
               <span class="countdown-sep">:</span>
               ${countdownBoxHTML('00','HRS')}
               <span class="countdown-sep">:</span>
               ${countdownBoxHTML('00','MIN')}
               <span class="countdown-sep">:</span>
               ${countdownBoxHTML('00','SEC')}
             </div>`
        }
      </div>
    </div>`;

  if (!seasonOver) startMainCountdown(dt); //if season is not over, start the countdown
}

// Builds one countdown box (the dark square showing e.g. "12 DAYS")
function countdownBoxHTML(val, unit) { //creates the countdown box (val=the number, unit=the text shown below the number e.g. DAYS)
  return `<div class="countdown-box">
    <span class="countdown-num">${val}</span>
    <span class="countdown-unit">${unit}</span>
  </div>`;
}

// Updates the countdown numbers every second
function startMainCountdown(target) { //gets the countdown target date
  if (countdownInterval) clearInterval(countdownInterval); //if countdown already running, clear it first
  function tick() { //this function runs every second
    const boxes = document.querySelectorAll('#mainCountdown .countdown-num'); //gets all 4 number elements in the countdown (days, hrs, mins, seconds)
    if (!boxes.length) { clearInterval(countdownInterval); return; } //if there are 0 boxes on the page, clear the timer
    const t = timeDiff(target); //t = remaining days, minutes, hours, seconds
    const vals = [pad(t.days), pad(t.hours), pad(t.minutes), pad(t.seconds)]; //array of padded values e.g. ["09","16","35","22"]
    boxes.forEach((box, i) => { //loops through each of the 4 boxes
      if (box.textContent !== vals[i]) { //only update if the number has actually changed
        box.textContent = vals[i]; //updates the number shown
        box.classList.remove('flip'); //reset flip animation
        void box.offsetWidth; // forces the browser to restart the animation
        box.classList.add('flip'); //plays the flip animation
      }
    });
  }
  tick(); //runs immediately so numbers show straight away
  countdownInterval = setInterval(tick, 1000); //repeats every one second
}

/* ── Upcoming race cards ─────────────────────────────────────
   Builds the grid of cards for races that haven't happened yet
   NEW: tapping a card opens the race weekend schedule popup */
function renderRaceCards(races) { //gets the race list
  const grid = document.getElementById('racesGrid'); //create variable "grid" to set the racesGrid container
  Object.values(miniTimers).forEach(id => clearInterval(id)); //clears all the old mini timers
  miniTimers = {}; //resets the mini timers object to be empty

  const upcoming = races.filter(r => raceDateTime(r) > Date.now()); //create variable upcoming — filters and keeps only future races

  if (!upcoming.length) { //if no upcoming races
    grid.innerHTML = '<p style="color:var(--gray);padding:32px;text-align:center">No upcoming races this season.</p>';
    return; //show message and stop here
  }

  grid.innerHTML = upcoming.map((race, idx) => { //loops through each upcoming race and its index number
    const dt     = raceDateTime(race); //variable to get race date and time
    const flag   = getFlag(race.Circuit.Location.country); //variable to get the flag of the country
    const img    = getImg(race.Circuit.circuitName); //variable to get the image of the circuit
    const isNext = idx === 0; //if index 0, it is the very next race

    return `
      <div class="race-card upcoming-card" data-race-idx="${idx}" style="cursor:pointer">
        <div class="rc-img-wrap">
          <img class="rc-img" src="${img}" alt="${race.raceName}" loading="lazy"/>
          <div class="rc-img-overlay"></div>
          <span class="rc-flag-big">${flag}</span>
          <span class="rc-round-badge">R${race.round}</span>
          ${isNext ? '<span class="rc-next-badge">▶ Next Race</span>' : ''}
        </div>
        <div class="rc-body">
          <div class="rc-name">${race.raceName.replace(' Grand Prix','')} GP</div>
          <div class="rc-circuit">📍 ${race.Circuit.circuitName}</div>
          <div class="rc-meta">
            <span class="rc-date">${formatDay(dt)}</span>
            <span class="rc-mini-countdown" id="mini-${race.round}">—</span>
          </div>
          <div class="rc-click-hint">Tap for weekend schedule →</div> <!-- hint telling user to tap -->
        </div>
      </div>`;
  }).join(''); //joins all card strings into one big HTML string

  // NEW: attach a click listener to each upcoming card to open the weekend popup
  upcoming.forEach((race, idx) => { //loops through each upcoming race
    const card = grid.querySelectorAll('.upcoming-card')[idx]; //find the card for this race by its index
    if (card) {
      card.addEventListener('click', () => openRaceWeekendModal(race)); //when tapped, open the weekend popup for this race
    }
  });

  // Start mini countdown timers on each card
  upcoming.forEach(race => { //loops through each upcoming race
    const el = document.getElementById(`mini-${race.round}`); //variable to get the mini countdown element
    if (!el) return; //if no element found, skip it
    const dt = raceDateTime(race); //variable to get race date and time
    const update = () => { //function to update the mini timer text
      const t = timeDiff(dt); //variable to calculate time remaining
      if (t.past) { el.textContent = 'Race day!'; clearInterval(miniTimers[race.round]); return; } //if time past, show "Race day!" and clear the timer
      el.textContent = t.days > 0 ? `${t.days}d ${pad(t.hours)}h` : `${pad(t.hours)}h ${pad(t.minutes)}m`; //if more than 1 day away, show days+hours, otherwise show hours+minutes
    };
    update(); //runs and updates immediately
    miniTimers[race.round] = setInterval(update, 30000); //repeats every 30 seconds
  });
}

/* ── Latest race results ─────────────────────────────────────
   Shows the podium + top 10 from the most recently completed race */
function renderResults(data) { //function, gets the API response
  const container = document.getElementById('resultsContainer'); //variable to get the resultsContainer id
  const races = data?.MRData?.RaceTable?.Races; //going through the response to get the arrays (MRData=Motor Racing Data, outer layer for response, ?="if this exists")
  if (!races || !races.length) { //if no races found
    container.innerHTML = errorHTML('No race results available yet.'); //show an error message in the container
    return; //stop
  }

  const race     = races[0]; //variable to get the first (most recent) race
  const results  = race.Results || []; //variable to get the driver results, or empty array if none
  const top10    = results.slice(0, 10); //variable to take the first 10 results
  const podium   = results.slice(0, 3); //variable to take the first 3 results for the podium
  const flResult = results.find(r => r.FastestLap?.rank === '1'); //variable to find who set the fastest lap — they have rank "1"

  container.innerHTML = `
    <div class="results-wrapper">
      <div class="podium-section">
        <div class="podium-title">🏆 Podium</div>
        <div class="podium-grid">
          ${podium.map((r, i) => {
            const cls   = ['podium-1st','podium-2nd','podium-3rd'][i]; //picks the css class based on position
            const order = [1, 0, 2][i]; // 2nd on left, 1st centre, 3rd right
            return `
              <div class="podium-item" style="order:${order}">
                <div class="podium-info">
                  <div class="podium-pos">${['1st','2nd','3rd'][i]}</div>
                  <div class="podium-driver-name">${r.Driver.givenName} ${r.Driver.familyName}</div>
                  <div class="podium-team-name" style="color:${teamColor(r.Constructor.name)}">${r.Constructor.name}</div>
                </div>
                <div class="podium-platform ${cls}">${['🥇','🥈','🥉'][i]}</div>
              </div>`;
          }).join('')}
        </div>
        ${flResult ? `
        <div class="fastest-lap">
          <span class="fl-icon">⚡</span>
          <div>
            <div class="fl-label">Fastest Lap</div>
            <div class="fl-driver">${flResult.Driver.givenName} ${flResult.Driver.familyName} — ${flResult.FastestLap.Time?.time || ''}</div>
          </div>
        </div>` : ''}
      </div>
      <div class="results-table-wrap">
        <div class="results-race-name">${race.raceName}</div>
        <table class="results-table">
          <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Pts</th></tr></thead>
          <tbody>
            ${top10.map(r => { //loops through the 10 drivers
              const pos = parseInt(r.position, 10); //converts text position to a number
              const cls = pos===1?'p1':pos===2?'p2':pos===3?'p3':''; //gives 1st gold, 2nd silver, 3rd bronze colour class
              const fl  = r.FastestLap?.rank === '1'; //variable is true if the driver set the fastest lap
              return `<tr>
                <td><span class="result-pos ${cls}">${r.position}</span></td>
                <td>
                  <div class="result-driver-name">${r.Driver.givenName} ${r.Driver.familyName}${fl?'<span class="result-fl-badge">FL</span>':''}</div>
                  <div class="result-team" style="color:${teamColor(r.Constructor.name)}">${r.Constructor.name}</div>
                </td>
                <td style="font-size:0.78rem;color:var(--gray)">${r.Constructor.name}</td>
                <td style="font-weight:700">${r.points}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

/* ── Standings ───────────────────────────────────────────────
   Decides which standings table to show based on the active tab */
function renderStandings() { //function to decide which table to show
  const container = document.getElementById('standingsContainer'); //variable to get the standingsContainer id
  if (currentTab === 'drivers') renderDriverStandings(container); //if the current tab is drivers, render the driver standings
  else renderConstructorStandings(container); //else, just show the constructor standings
}

function renderDriverStandings(container) { //function to get the container to put the table in
  if (!driverStandings.length) { //if no driver standings
    container.innerHTML = errorHTML('No driver standings available.'); //print the error
    return; //stop
  }
  const maxPts = parseFloat(driverStandings[0]?.points || 1); //variable to get the leader's points as a decimal number (parseFloat). This is used to calculate the bar width
  container.innerHTML = `
    <div class="standings-table-wrap">
      <table class="standings-table">
        <thead><tr><th>Pos</th><th>Driver</th><th>Nationality</th><th style="text-align:right">Points</th></tr></thead>
        <tbody>
          ${driverStandings.slice(0,10).map(d => {
            const pos  = parseInt(d.position, 10); //converts the position into a number
            const barW = Math.max(4, Math.round((parseFloat(d.points) / maxPts) * 100)); //divide the driver's points by leader's points, multiply by 100 to get percentage — minimum 4 so bar is always visible
            return `<tr>
              <td><span class="st-pos ${pos===1?'p1':''}">${d.position}</span></td>
              <td>
                <div class="st-driver-name">${d.Driver.givenName} ${d.Driver.familyName}</div>
                <div class="st-team" style="color:${teamColor(d.Constructors[0]?.name||'')}">${d.Constructors[0]?.name||'—'}</div>
                <div class="points-bar-wrap"><div class="points-bar" style="width:${barW}%"></div></div>
              </td>
              <td class="st-nationality">${d.Driver.nationality}</td>
              <td><div class="st-points">${d.points}</div><div class="st-pts-label">pts</div></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderConstructorStandings(container) { //function to render the constructor standings
  if (!constructorStandings.length) { //if no constructor standings
    container.innerHTML = errorHTML('No constructor standings available.'); //show an error message
    return; //stop
  }
  const maxPts = parseFloat(constructorStandings[0]?.points || 1); //max points turned into decimal to calculate the bar length
  container.innerHTML = `
    <div class="standings-table-wrap">
      <table class="standings-table">
        <thead><tr><th>Pos</th><th>Constructor</th><th>Nationality</th><th style="text-align:right">Points</th></tr></thead>
        <tbody>
          ${constructorStandings.slice(0,10).map(c => { //takes the top 10 constructors and loops through them
            const pos = parseInt(c.position, 10); //converts position into a number
            const col = teamColor(c.Constructor.name); //gets the team colour
            const barW = Math.max(4, Math.round((parseFloat(c.points) / maxPts) * 100)); //divide the constructor's points by leader's points, multiply by 100 to get percentage — minimum 4 so bar is always visible
            return `<tr>
              <td><span class="st-pos ${pos===1?'p1':''}">${c.position}</span></td>
              <td>
                <div class="st-driver-name" style="color:${col}">${c.Constructor.name}</div>
                <div class="st-team">${c.Constructor.nationality}</div>
                <div class="points-bar-wrap"><div class="points-bar" style="width:${barW}%;background:${col}"></div></div>
              </td>
              <td class="st-nationality">${c.Constructor.nationality}</td>
              <td><div class="st-points">${c.points}</div><div class="st-pts-label">pts</div></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ── Past race cards ─────────────────────────────────────────
   Builds the grid of completed races, most recent first */
function renderPastRaceCards(races) { //function to render the past races
  const grid = document.getElementById('pastRacesGrid'); //variable to get the pastRacesGrid ID
  const past = races.filter(r => raceDateTime(r) <= Date.now()); //filters the past races — keeps only races whose date has already passed

  if (!past.length) { //if no past races yet
    grid.innerHTML = '<p style="color:var(--gray);padding:32px;text-align:center">No completed races yet this season.</p>'; //puts a message that no races have been completed yet
    return; //stop
  }

  const reversed = [...past].reverse(); // copy and reverse so most recent race is first

  grid.innerHTML = reversed.map(race => { //loops through the past races
    const dt   = raceDateTime(race); //variable to get the race date and time
    const flag = getFlag(race.Circuit.Location.country); //variable to get the country's flag
    const img  = getImg(race.Circuit.circuitName); //variable to get the image of the circuit
    return `
      <div class="race-card past-card" data-round="${race.round}">
        <div class="rc-img-wrap">
          <img class="rc-img" src="${img}" alt="${race.raceName}" loading="lazy"/>
          <div class="rc-img-overlay"></div>
          <span class="rc-flag-big">${flag}</span>
          <span class="rc-round-badge">R${race.round}</span>
          <span class="rc-done-badge">✓ Completed</span>
        </div>
        <div class="rc-body">
          <div class="rc-name">${race.raceName.replace(' Grand Prix','')} GP</div>
          <div class="rc-circuit">📍 ${race.Circuit.circuitName}</div>
          <div class="rc-meta">
            <span class="rc-date">${formatDate(dt)}</span>
          </div>
          <div class="rc-click-hint">Tap for results →</div>
        </div>
      </div>`;
  }).join(''); //joins all cards into one string

  grid.querySelectorAll('.past-card').forEach(card => { //finds every past race card and loops through them
    card.addEventListener('click', () => openModal(card.dataset.round)); //add an event listener — when tapped, open the popup using the round number stored on the card
  });
}

/* ── Modal popup (past races) ────────────────────────────────
   Opens when you tap a past race card and shows that race's results */
async function openModal(round) { //gets the round number that was clicked
  const overlay = document.getElementById('modalOverlay'); //variable to get the dark background overlay
  const content = document.getElementById('modalContent'); //variable to get the white popup box content area

  content.innerHTML = `<div class="grid-loading"><div class="spinner"></div><p>Loading results…</p></div>`; //show a loading spinner while we fetch
  overlay.classList.add('open'); // make popup visible
  document.body.style.overflow = 'hidden'; // stop page scrolling behind popup

  try {
    const res  = await fetch(`${API_BASE}/current/${round}/results.json`); //variable to fetch results for this specific round number
    const data = await res.json(); //converts response into usable data
    const race    = data?.MRData?.RaceTable?.Races?.[0]; //goes through the response to get the race object
    const results = race?.Results || []; //gets all driver results, empty array if none

    if (!race || !results.length) { //if no race data found
      content.innerHTML = '<p style="padding:32px;text-align:center;color:var(--gray)">No results available yet.</p>'; //add message
      return; //stop
    }

    const flDriver = results.find(r => r.FastestLap?.rank === '1'); //finds the driver who set the fastest lap

    const podiumHTML = results.slice(0, 3).map((r, i) => /*takes top 3 and loops through them*/`
      <div class="modal-podium-item">
        <div class="modal-podium-medal">${['🥇','🥈','🥉'][i]}</div>
        <div class="modal-podium-name">${r.Driver.givenName} ${r.Driver.familyName}</div>
        <div class="modal-podium-team" style="color:${teamColor(r.Constructor.name)}">${r.Constructor.name}</div>
      </div>`).join('');

    const rowsHTML = results.slice(0, 10).map(r => { //variable to take the top 10 and loop through them
      const pos = parseInt(r.position, 10); //variable to convert positions into numbers
      const cls = pos===1?'p1':pos===2?'p2':pos===3?'p3':''; //gives the top 3 a special colour class
      const fl  = r.FastestLap?.rank === '1'; //true if driver set the fastest lap
      return `<tr>
        <td><span class="result-pos ${cls}">${r.position}</span></td>
        <td>
          <div class="result-driver-name">${r.Driver.givenName} ${r.Driver.familyName}${fl?'<span class="result-fl-badge">FL</span>':''}</div>
          <div class="result-team" style="color:${teamColor(r.Constructor.name)}">${r.Constructor.name}</div>
        </td>
        <td style="font-weight:700">${r.points}</td>
      </tr>`;
    }).join('');

    content.innerHTML = `
      <div class="modal-race-title">${race.raceName}</div>
      <div class="modal-race-sub">📅 ${formatDate(raceDateTime(race))} &nbsp;·&nbsp; 📍 ${race.Circuit.circuitName}</div>
      <div class="modal-podium">${podiumHTML}</div>
      ${flDriver ? `<div class="modal-fl">⚡ Fastest Lap: ${flDriver.Driver.givenName} ${flDriver.Driver.familyName} — ${flDriver.FastestLap.Time?.time||''}</div>` : ''}
      <table class="modal-table">
        <thead><tr><th>Pos</th><th>Driver</th><th>Pts</th></tr></thead>
        <tbody>${rowsHTML}</tbody>
      </table>`;
  } catch(err) { //if there is an error
    content.innerHTML = '<p style="padding:32px;text-align:center;color:var(--gray)">Could not load results. Please try again.</p>'; //add the error message into the popup
    console.error('Modal error:', err); //console.log the error
  }
}

// Closes the popup and re-enables page scrolling
function closeModal() { //function to close the popup
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open'); //removes the "open" class to hide the popup
  document.body.style.overflow = ''; //re-enables page scrolling
  if (overlay._cityClockInterval) { //if the city clock is running (from the weekend popup)
    clearInterval(overlay._cityClockInterval); //stop the city clock so it doesn't keep running in the background
    overlay._cityClockInterval = null; //reset it to null
  }
}

// Sets up all the ways to close the modal
function initModal() { //function to setup all the ways to close the modal
  document.getElementById('modalClose').addEventListener('click', closeModal); //adds an event listener to close when X is clicked
  document.getElementById('modalOverlay').addEventListener('click', e => { //adds an event listener when anything in the overlay is clicked
    if (e.target === document.getElementById('modalOverlay')) closeModal(); //closes if you clicked the dark background around the popup (not the white box)
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); }); //adds an event listener — if Escape key is pressed, close the popup
}

/* ── Data loading functions ──────────────────────────────────
   These fetch from the API and call the render functions above */

async function loadSchedule() { //function to fetch race calendar from API
  try {
    const data = await apiFetch(`${API_BASE}/current.json`, 'f1-schedule'); //fetch current season schedule, save under key "f1-schedule"
    allRaces = data?.MRData?.RaceTable?.Races || []; //goes through the response to get race arrays, empty array if nothing found

    const now  = Date.now(); //variable for current time in milliseconds
    const next = allRaces.find(r => raceDateTime(r) > now); // finds the next future race
    const last = [...allRaces].reverse().find(r => raceDateTime(r) <= now); // finds the most recent past race

    if (next) {
      renderNextRace(next, false); // countdown to next race
    } else if (last) {
      renderNextRace(last, true); // when season over, show last race
    } else {
      document.getElementById('nextRaceCard').innerHTML = errorHTML('No race data available.');
    }

    renderRaceCards(allRaces); // renders upcoming races grid
    renderPastRaceCards(allRaces); // renders past races grid
  } catch(err) { //if error
    console.error('Schedule failed:', err); //console.log schedule failed
    document.getElementById('nextRaceCard').innerHTML = errorHTML('Could not load race data. Please try refreshing.'); //puts an error message in the countdown section
    document.getElementById('racesGrid').innerHTML    = errorHTML('Could not load race schedule.'); //puts an error message in the race schedule section
    document.getElementById('pastRacesGrid').innerHTML = errorHTML('Could not load past races.'); //puts an error message in the past races section
  }
}

async function loadResults() { //function to fetch the latest race results
  try {
    const data = await apiFetch(`${API_BASE}/current/last/results.json`, 'f1-results'); //fetch last race results, save under key "f1-results"
    renderResults(data); //pass data to the render function
  } catch(err) {
    console.error('Results failed:', err);
    document.getElementById('resultsContainer').innerHTML = errorHTML('Could not load race results.');
  }
}

async function loadStandings() { //fetches the driver + constructor standings from API
  try {
    const [drData, csData] = await Promise.all([ //fetch the driver and constructor data at the same time — Promise.all means wait for both to finish
      apiFetch(`${API_BASE}/current/driverStandings.json`, 'f1-drivers'), //fetches the driver standings
      apiFetch(`${API_BASE}/current/constructorStandings.json`, 'f1-constructors'), //fetches the constructor standings
    ]);
    driverStandings      = drData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || []; //goes through the response to get the driver standings array
    constructorStandings = csData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || []; //goes through the response to get the constructor standings array
    renderStandings(); //renders whichever standings tab is currently active
  } catch(err) { //if there is an error
    console.error('Standings failed:', err); //console.log the error
    document.getElementById('standingsContainer').innerHTML = errorHTML('Could not load standings.'); //print the error in the DOM
  }
}

async function loadAll() { //loads data one at a time
  await loadSchedule(); //fetches schedule and waits for it to finish
  await new Promise(r => setTimeout(r, 600)); //wait 0.6 seconds before next call so the API doesn't rate limit us
  await loadResults(); //fetch results and wait
  await new Promise(r => setTimeout(r, 600)); //wait 0.6 seconds before next call
  await loadStandings(); //fetch standings and wait
}

/* ── Start everything when the page is ready ─────────────────*/
document.addEventListener('DOMContentLoaded', () => { //when the page has fully loaded, run this
  initNavbar(); //setup navbar
  initTheme(); //set up the dark/light mode
  initRefresh(); //set up refresh button
  initTabs(); //set up standings tabs
  initModal(); //set up popup close buttons
  loadAll(); //fetch all data from API
});
