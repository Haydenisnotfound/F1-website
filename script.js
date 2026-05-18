'use strict';

/* ── Cache busting ───────────────────────────────────────────
   Every time we update the site, we bump this number.
   That wipes the old saved data so fresh data gets loaded. */
const CACHE_VERSION = '8'; /*current version number */
if (localStorage.getItem('f1hub-version') !== CACHE_VERSION) { /* local storage finds the website version and if not cache version number 8, */
  ['f1-schedule','f1-results','f1-drivers','f1-constructors'].forEach(k => /*we get the results, schedule, drivers, constuctors info and remove it */
    localStorage.removeItem(k)); /* removes all the infor */
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
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch(_) {} //in the local storage, we it a key, turn the data into a text string, add a timestamp. If it fails, ignore it
}
function cacheGet(key) { //gets the keyname to fetch with the API
  try {
    const raw = localStorage.getItem(key); //looks in the local storage to find any available data saved under the key name
    if (!raw) return null; //if no data, return nothing
    const obj = JSON.parse(raw); //convert the text string to usable data
    // If the saved data is older than CACHE_TTL, throw it away
    if (Date.now() - obj.ts > CACHE_TTL) { localStorage.removeItem(key); return null; } //current time minus saved time, if older than 5 mins, delete it and return nothing
    return obj.data; //returns the new data
  } catch(_) { return null; } //if failed, return nothing
}

//── apiFetch ────────────────────────────────────────────────
   
async function apiFetch(url, cacheKey) { //get the URL to fetch and the key name to save it under
  const cached = cacheGet(cacheKey); //check if we have data
  if (cached) return cached; //if we do, return it and skip API call

 
  for (let attempt = 1; attempt <= 3; attempt++) {  // try up to 3 times in case the API is slow or briefly down. Starts at 1 attempt and add till 3
    try {
      const controller = new AbortController();  // create a cancel controller for the fetch request
      const timer = setTimeout(() => controller.abort(), 15000); //timer for 15 seconds, if longer, cancel the request
      const res = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } }); // call the API, attach the cancel controller, tell the API to receive JSON back
      clearTimeout(timer); //clear timer if we receive a response
      if (!res.ok) throw new Error(`HTTP ${res.status}`); //if the API returned an error code, treat it as a failure
      const json = await res.json(); //converts API response to data
      cacheSet(cacheKey, json); // save so next visit is instant
      return json; //return data
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
  return new Date(`${race.date}T${time}`); //combine the timer and date into a js date object
}


function formatDate(date) { //format the date day, month, year
  return date.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }); //format the date (8 Mar 2026)
}


function formatDay(date) { //formats the weekday, day, month
  return date.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' }); //format the date (Sun 8 Mar)
}

// Returns days/hours/minutes/seconds until a target date
function timeDiff(target) { //creates the countdown
  const diff = target - Date.now(); //the day and time of the race subracted by the date and time right now to get the time difference
  if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0, past:true }; //if the time hits 0, past is true
  const s = Math.floor(diff / 1000); //converts milliseconds to seconds
  return {
    days:    Math.floor(s / 86400), //divide by 86400 (seconds in a day) to get days, round down
    hours:   Math.floor((s % 86400) / 3600), // leftover seconds after removing days (divide by 3600 to get hours)
    minutes: Math.floor((s % 3600) / 60), // leftover seconds after removing hours (divide by 60 to get minutes)
    seconds: s % 60, //left over seconds
    past: false, //race has not happened, past is false
  };
}

// Pads a number to always be 2 digits e.g. 5 → "05"
function pad(n) { return String(n).padStart(2, '0'); } //turn the number into strings, pad(n) makes it always 2 digits

/* ── Small utility helpers ───────────────────────────────────*/
function getFlag(country) { return COUNTRY_FLAGS[country] || '🏁'; } //gets the flag of the country in the flag list, if cannot find, we put a chequred flag
function getImg(name)     { return CIRCUIT_IMAGES[name]   || DEFAULT_IMG; } //gets the img of the circuit in the circuit image list, if we cannot find, we put a default img
function teamColor(name) { //gets team name
  for (const [k,v] of Object.entries(TEAM_COLORS)) { //loop through the teams (k=key/team name, v=value/the color)
    if (name && name.includes(k)) return v; //if list contains the team name, we return the color
  }
  return '#888'; //return the color gray
}
function errorHTML(msg) { //receive an error message string
  return `<div class="error-state"><div class="error-icon">⚠️</div><p>${msg}</p></div>`; //DOM with the error message
}

// ── Navbar ──────────────────────────────────────────────────
function initNavbar() { //setup the navbar
  const navbar = document.getElementById('navbar'); //connects the element with the navbar
  const links  = document.querySelectorAll('.nav-link'); //connects all nav-links 

  window.addEventListener('scroll', () => { //listens or waits for the user to scroll
    navbar.classList.toggle('scrolled', window.scrollY > 20);  // add a shadow to the navbar once the user scrolls down more than 2-0px
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400); //if the user scrolls more than 400px, show the back to the top button
    let current = '';   //variable to store which section is on screen
    ['hero','countdown','upcoming','results','standings','past'].forEach(id => { //loops every section
      const el = document.getElementById(id); //finds the section element with the id
      if (el && window.scrollY >= el.offsetTop - 100) current = id; //if the section and how much the user scrolls down iks greater than the top of the page minus 100px, this is where the user is
    });
    links.forEach(l => { //loops the nav links
      const href = l.getAttribute('href').replace('#',''); //gets the href and remove the #
      l.classList.toggle('active', href === current); //if the link matches the current section, highlight it in the navbar
    });
  }, { passive: true }); //tells the browsaer to not block the scrolling

  // Hamburger open/close
  const ham = document.getElementById('hamburger'); //sets the hamburger element
  const nav = document.getElementById('navLinks'); //sets the navbar/mobile nav menu
  ham.addEventListener('click', () => { //listens for a click
    ham.classList.toggle('open'); //add or remove "open" on the hamburger icon to make it look like an x
    nav.classList.toggle('open'); //add or remove "open" to show the menu/hide menu (the menu shows up after you click the hamburger)
  });
  // Close menu when a link is tapped
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { // add a click listener to each to every link in the menu
    ham.classList.remove('open'); //turns x back to a hamburger
    nav.classList.remove('open'); //remove or hide mobile menu
  }));

  // Back to top button scrolls the page to the very top
  document.getElementById('backToTop').addEventListener('click', () =>  //listens when back to top button is clicked
    window.scrollTo({ top:0, behavior:'smooth' })); //scroll page to the top
}

// ── Dark mode ───────────────────────────────────────────────
   
function initTheme() { //set up light and dark mode
  const toggle = document.getElementById('themeToggle'); //set the element themeToggle
  const saved  = localStorage.getItem('f1hub-theme') || 'light'; //gets the save theme for the local storage, white is default
  document.documentElement.dataset.theme = saved; //apply the save theme to the page
  toggle.addEventListener('click', () => { //listens for a click on the toggle button
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; //interchanges between the 2 themes
    document.documentElement.dataset.theme = next; //applies the theme to the whole page
    localStorage.setItem('f1hub-theme', next); //sets it in the local storage
  });
}

/* ── Refresh button ──────────────────────────────────────────
   Clears saved data and re-fetches everything from the API */
function initRefresh() {
  document.getElementById('refreshBtn').addEventListener('click', () => { //add an event listener to the element "refreshBTn" and waits for a click
    ['f1-schedule','f1-results','f1-drivers','f1-constructors'].forEach(k => //loops through the schedule,e results, driver, and constructors
      localStorage.removeItem(k)); //removes the results, schedule, driver, and constructors from the local storage
    loadAll(); //retch from the api again
  });
}

/* ── Standings tabs ──────────────────────────────────────────
   Switches between Drivers and Constructors tables */
function initTabs() { //setsup the standings
  document.querySelectorAll('.tab-btn').forEach(btn => { //selects all the tab buttons
    btn.addEventListener('click', () => { //add a event listener to the button, listens for click
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); //remove active from all btns
      btn.classList.add('active'); //add active to all btns
      currentTab = btn.dataset.tab; //save which tab is active to either the drivers or constructors
      renderStandings(); //shows the standings
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

   
  /* creates the dom for the race card*/
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

  // Only start the ticking countdown when there's actually a future race
  if (!seasonOver) startMainCountdown(dt); //if season is not over, start the countdown
}

// Builds one countdown box (the dark square showing e.g. "12 DAYS")
function countdownBoxHTML(val, unit) { //creates the countdown box (val=the number, unit=the text shown below the number, ex. days, months)
  return `<div class="countdown-box">
    <span class="countdown-num">${val}</span>
    <span class="countdown-unit">${unit}</span>
  </div>`;
}

// Updates the countdown numbers every second
function startMainCountdown(target) { //countdown date
  if (countdownInterval) clearInterval(countdownInterval); //if countdown running, clear it
  function tick() { //function runs every sec
    const boxes = document.querySelectorAll('#mainCountdown .countdown-num'); //gets all 4 elements in the countdown (the days, hrs, mins, seconds)
    if (!boxes.length) { clearInterval(countdownInterval); return; } //if there are 0 boxes, clear the timer
    const t = timeDiff(target); //t = remaining days, minuts, hours, seconds
    const vals = [pad(t.days), pad(t.hours), pad(t.minutes), pad(t.seconds)]; //arrays of values (ex ["1","16","35","22"]
    boxes.forEach((box, i) => { //loops the boxes
      if (box.textContent !== vals[i]) { //updates if the numbers changes
        box.textContent = vals[i]; //updates the number shown
        box.classList.remove('flip'); //reset flip animation
        void box.offsetWidth; // forces the browser to restart the animation
        box.classList.add('flip'); //plays the animation
      }
    });
  }
  tick(); //runs immediately so numbers show
  countdownInterval = setInterval(tick, 1000); //repeats every one second
}

/* ── Upcoming race cards ─────────────────────────────────────
   Builds the grid of cards for races that haven't happened yet */
function renderRaceCards(races) { //gets the race list
  const grid = document.getElementById('racesGrid'); //create variable "grid" to set the racesGrid container 
  // Clear any old mini timers first
  Object.values(miniTimers).forEach(id => clearInterval(id)); //clears all the old mini timers
  miniTimers = {}; //resets the mini timers object to be empty

  // Only show future races
  const upcoming = races.filter(r => raceDateTime(r) > Date.now()); //create variable upcoming to go through the race arrays and filter and keep the old races

  if (!upcoming.length) { //if no races,
    grid.innerHTML = '<p style="color:var(--gray);padding:32px;text-align:center">No upcoming races this season.</p>';
    return; //show message and stop here
  }

  grid.innerHTML = upcoming.map((race, idx) => { //loops through each upcoming races and index number
    const dt   = raceDateTime(race); //variable to get race date and time
    const flag = getFlag(race.Circuit.Location.country); //variable to get the flag of the country
    const img  = getImg(race.Circuit.circuitName); //variable to image of the circuit
    const isNext = idx === 0; //if index 0, it is the next race

    return `
      <div class="race-card" data-race-idx="${idx}"> 
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
        </div>
      </div>`;
  }).join(''); //joins all card stings into a html string

  // Start mini countdown timers on each card
  upcoming.forEach(race => { //loops through each upcoming race
    const el = document.getElementById(`mini-${race.round}`); //variable to get the countdown element
    if (!el) return; //if no element or races, skip it
    const dt = raceDateTime(race); //variable to get race date and time
    const update = () => { //function to update mini timer and text
      const t = timeDiff(dt); //variable to calculate time remaining
      if (t.past) { el.textContent = 'Race day!'; clearInterval(miniTimers[race.round]); return; } //if time past, show "Race day!" and clear the timer
      el.textContent = t.days > 0 ? `${t.days}d ${pad(t.hours)}h` : `${pad(t.hours)}h ${pad(t.minutes)}m`; //if more than 1 day away, show days+hours, if not show hours+minutes
    };
    update(); //runs and updates immediately
    miniTimers[race.round] = setInterval(update, 30000); //repeats every 30 seconds
  });
}

/* ── Latest race results ─────────────────────────────────────
   Shows the podium + top 10 from the most recently completed race */
function renderResults(data) { //function, gets the API response
  const container = document.getElementById('resultsContainer'); //variable to get the resultsContainer id
  const races = data?.MRData?.RaceTable?.Races; //going through the response to get the arrays (MRData=Motor Racing Data, outer layer for response   ?="if this exists)
  if (!races || !races.length) { //if no races and no how many races away
    container.innerHTML = errorHTML('No race results available yet.'); //show an error message in the container
    return; //stop
  }

  const race    = races[0]; //variable to get first race
  const results = race.Results || []; //variable to get the driver results, or empty array if none
  const top10   = results.slice(0, 10); //variable to take the first 10 results
  const podium  = results.slice(0, 3); //variable to take the first 3 results
  const flResult = results.find(r => r.FastestLap?.rank === '1'); //variable to go the driver results, find who is the fastest lap, and check the rank is equal to 1

  container.innerHTML = `
    <div class="results-wrapper">
      <div class="podium-section">
        <div class="podium-title">🏆 Podium</div>
        <div class="podium-grid">
          ${podium.map((r, i) => {
            const cls   = ['podium-1st','podium-2nd','podium-3rd'][i]; //picks the css class based on location
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
              const pos = parseInt(r.position, 10); //converts text number (ex. ten to 10)
              const cls = pos===1?'p1':pos===2?'p2':pos===3?'p3':''; //gives first gold, 2nd silver, 3rd bronze
              const fl  = r.FastestLap?.rank === '1'; //variable is true if the driver sets. the fastest lap
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
  else renderConstructorStandings(container); //else, just show the constructor standing
}

function renderDriverStandings(container) { //function to get the container to put the table in
  if (!driverStandings.length) { //if no drivers standings
    container.innerHTML = errorHTML('No driver standings available.'); //print the error
    return; //stop
  }
  const maxPts = parseFloat(driverStandings[0]?.points || 1); //variable to get the leaders point as a decimal number (parseFloat). This is used to calculate the bar width
  container.innerHTML = `
    <div class="standings-table-wrap">
      <table class="standings-table">
        <thead><tr><th>Pos</th><th>Driver</th><th>Nationality</th><th style="text-align:right">Points</th></tr></thead>
        <tbody>
          ${driverStandings.slice(0,10).map(d => {
            const pos  = parseInt(d.position, 10); //converts the position into number
            const barW = Math.max(4, Math.round((parseFloat(d.points) / maxPts) * 100)); //divide the driver's points by leader's points, multiply by 100 to get percentage with the minimum as 4 so bar is always visible
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
  const maxPts = parseFloat(constructorStandings[0]?.points || 1); //max point is turned into decimal to calculate the bars length
  container.innerHTML = `
    <div class="standings-table-wrap">
      <table class="standings-table">
        <thead><tr><th>Pos</th><th>Constructor</th><th>Nationality</th><th style="text-align:right">Points</th></tr></thead>
        <tbody>
          ${constructorStandings.slice(0,10).map(c => { //takes the top 10 constructors an loop them
            const pos = parseInt(c.position, 10); //converts position into number
            const col = teamColor(c.Constructor.name); //gets the team colors
            const barW = Math.max(4, Math.round((parseFloat(c.points) / maxPts) * 100)); //divide the constructors's points by leader's points, multiply by 100 to get percentage with the minimum as 4 so bar is always visible
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
  const past = races.filter(r => raceDateTime(r) <= Date.now()); //filters the past races by having the race date less than today (the difference)

  if (!past.length) { //if no past races
    grid.innerHTML = '<p style="color:var(--gray);padding:32px;text-align:center">No completed races yet this season.</p>'; //puts a message that no races have been completed this year
    return; //stop
  }


  const reversed = [...past].reverse(); // Reverse so most recent is first

  grid.innerHTML = reversed.map(race => { //loops through the past races
    const dt   = raceDateTime(race); //variable to get the race date and time
    const flag = getFlag(race.Circuit.Location.country); //variable to get the countrys flag
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
  }).join(''); //joins all cards into a string

  // Attach click listeners — tapping a card opens the results popup
  grid.querySelectorAll('.past-card').forEach(card => { //finds every past race card and loop through them
    card.addEventListener('click', () => openModal(card.dataset.round)); //add an event listener to the race card to wait a click, then open the popup using the round number stored on the card
  });
}

/* ── Modal popup ─────────────────────────────────────────────
   Opens when you tap a past race card and shows that race's results */
async function openModal(round) { //get the round number that was clicked 
  const overlay = document.getElementById('modalOverlay'); //variable to get the dark background overlay
  const content = document.getElementById('modalContent'); //variable to get the white popup box content area

  // Show a spinner while results load
  content.innerHTML = `<div class="grid-loading"><div class="spinner"></div><p>Loading results…</p></div>`;
  overlay.classList.add('open');          // make popup visible
  document.body.style.overflow = 'hidden'; // stop page scrolling behind popup

  try {
    // Fetch results for this specific round number
    const res  = await fetch(`${API_BASE}/current/${round}/results.json`); //variable to fetch results for this specific round number
    const data = await res.json(); //converts response into usable data
    const race    = data?.MRData?.RaceTable?.Races?.[0]; //goes through the response to get the race object
    const results = race?.Results || []; //gets all drivers results, empty array if none

    if (!race || !results.length) { //if no races
      content.innerHTML = '<p style="padding:32px;text-align:center;color:var(--gray)">No results available yet.</p>'; //add message "No results available"
      return; //stops
    }

    const flDriver = results.find(r => r.FastestLap?.rank === '1'); //finds the driver who has the fast3est lap

    // Build the podium boxes for 1st, 2nd, 3rd
    const podiumHTML = results.slice(0, 3).map((r, i) => /*takes to p3 and loop through them*/`
      <div class="modal-podium-item">
        <div class="modal-podium-medal">${['🥇','🥈','🥉'][i]}</div>
        <div class="modal-podium-name">${r.Driver.givenName} ${r.Driver.familyName}</div>
        <div class="modal-podium-team" style="color:${teamColor(r.Constructor.name)}">${r.Constructor.name}</div>
      </div>`).join('');

    // Build each row of the top-10 results table
    const rowsHTML = results.slice(0, 10).map(r => {
      const pos = parseInt(r.position, 10);
      const cls = pos===1?'p1':pos===2?'p2':pos===3?'p3':'';
      const fl  = r.FastestLap?.rank === '1';
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
  } catch(err) {
    content.innerHTML = '<p style="padding:32px;text-align:center;color:var(--gray)">Could not load results. Please try again.</p>';
    console.error('Modal error:', err);
  }
}

// Closes the popup and re-enables page scrolling
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Sets up all the ways to close the modal
function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ── Data loading functions ──────────────────────────────────
   These fetch from the API and call the render functions above */

async function loadSchedule() {
  try {
    const data = await apiFetch(`${API_BASE}/current.json`, 'f1-schedule');
    allRaces = data?.MRData?.RaceTable?.Races || [];

    const now  = Date.now();
    const next = allRaces.find(r => raceDateTime(r) > now);   // next future race
    const last = [...allRaces].reverse().find(r => raceDateTime(r) <= now); // most recent past race

    if (next) {
      renderNextRace(next, false); // countdown to next race
    } else if (last) {
      renderNextRace(last, true);  // when season over, show last race
    } else {
      document.getElementById('nextRaceCard').innerHTML = errorHTML('No race data available.');
    }

    renderRaceCards(allRaces);     // renders upcoming races grid
    renderPastRaceCards(allRaces); // renders past races grid
  } catch(err) { //if error,
    console.error('Schedule failed:', err); //console.log schedule failed
    document.getElementById('nextRaceCard').innerHTML = errorHTML('Could not load race data. Please try refreshing.'); //Puts a error message in dom for the "Big race card with countdown" section
    document.getElementById('racesGrid').innerHTML    = errorHTML('Could not load race schedule.'); //Puts a error message in dom for the "race schedule" section
    document.getElementById('pastRacesGrid').innerHTML = errorHTML('Could not load past races.'); //Puts a error message in dom for the "past Race" section
  }
}

async function loadResults() {
  try {
    const data = await apiFetch(`${API_BASE}/current/last/results.json`, 'f1-results');
    renderResults(data);
  } catch(err) {
    console.error('Results failed:', err);
    document.getElementById('resultsContainer').innerHTML = errorHTML('Could not load race results.');
  }
}

async function loadStandings() { //fetches the driver+constructor standings from API
  try {
    const [drData, csData] = await Promise.all([ //fetch the driver and constructor data at the same time, promise all means to wait for both to finsih
      apiFetch(`${API_BASE}/current/driverStandings.json`, 'f1-drivers'), //fetches the driver standing
      apiFetch(`${API_BASE}/current/constructorStandings.json`, 'f1-constructors'), //fetches the constructor standings
    ]);
    driverStandings      = drData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || []; //goes through the response to get the drivers standings array
    constructorStandings = csData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || []; //goes through the response to get the constructor standings array
    renderStandings(); //renders the standings that are currently active
  } catch(err) { //if there is an error,
    console.error('Standings failed:', err); //console.log the error
    document.getElementById('standingsContainer').innerHTML = errorHTML('Could not load standings.'); //print the error in the dom
  }
}

async function loadAll() { //loads data one at a time
  await loadSchedule(); //fetches schedule and waits for it to finish
  await new Promise(r => setTimeout(r, 600)); //wait .6 seconds before next call
  await loadResults(); //fetch results and wait
  await new Promise(r => setTimeout(r, 600)); //wait .6 seconds before next call
  await loadStandings(); //fetch standing and wait
}

/* ── Start everything when the page is ready ─────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  initNavbar(); //setup navbar
  initTheme(); //set up the dark/light mode
  initRefresh(); //set up refresh button
  initTabs(); //set up standing tabs
  initModal(); //set up past rice
  loadAll(); //fetch all data from API
});
