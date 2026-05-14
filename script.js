'use strict';

/* ── Cache busting ───────────────────────────────────────────
   Every time we update the site, we bump this number.
   That wipes the old saved data so fresh data gets loaded. */
const CACHE_VERSION = '7';
if (localStorage.getItem('f1hub-version') !== CACHE_VERSION) {
  ['f1-schedule','f1-results','f1-drivers','f1-constructors'].forEach(k =>
    localStorage.removeItem(k));
  localStorage.setItem('f1hub-version', CACHE_VERSION);
}

/* ── API base URL ────────────────────────────────────────────
   All API calls start with this address */
const API_BASE  = 'https://api.jolpi.ca/ergast/f1';
const CACHE_TTL = 5 * 60 * 1000; // how long to keep saved data (5 minutes)

/* ── Circuit background images ───────────────────────────────
   Maps each circuit name to a nice Unsplash photo */
const CIRCUIT_IMAGES = {
  'Albert Park Grand Prix Circuit':  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=70',
  'Bahrain International Circuit':   'https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=70',
  'Jeddah Corniche Circuit':         'https://images.unsplash.com/photo-1565073624497-7144969e5d3d?w=600&q=70',
  'Suzuka Circuit':                  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=70',
  'Shanghai International Circuit':  'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&q=70',
  'Miami International Autodrome':   'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=600&q=70',
  'Autodromo Enzo e Dino Ferrari':   'https://images.unsplash.com/photo-1551801841-ecad875a5142?w=600&q=70',
  'Circuit de Monaco':               'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=70',
  'Circuit de Barcelona-Catalunya':  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70',
  'Circuit Gilles Villeneuve':       'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=70',
  'Red Bull Ring':                   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=70',
  'Silverstone Circuit':             'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&q=70',
  'Hungaroring':                     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70',
  'Circuit de Spa-Francorchamps':    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=70',
  'Circuit Park Zandvoort':          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=70',
  'Autodromo Nazionale di Monza':    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=70',
  'Baku City Circuit':               'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=600&q=70',
  'Marina Bay Street Circuit':       'https://images.unsplash.com/photo-1559564058-6f0b6ddf5e57?w=600&q=70',
  'Circuit of the Americas':         'https://images.unsplash.com/photo-1516546453174-5e1098a4b4af?w=600&q=70',
  'Autodromo Hermanos Rodriguez':    'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&q=70',
  'Autodromo Hermanos Rodríguez':    'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&q=70',
  'Autodromo José Carlos Pace':      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=70',
  'Las Vegas Strip Street Circuit':  'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=600&q=70',
  'Losail International Circuit':    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=70',
  'Yas Marina Circuit':              'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=70',
  'Madring':                         'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70',
};
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1541773367336-d3f9f1d312b4?w=600&q=70';

/* ── Country flags ───────────────────────────────────────────
   Maps country names to emoji flags */
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
   Used to colour team names throughout the site */
const TEAM_COLORS = {
  'Red Bull':'#3671C6','McLaren':'#FF8000','Ferrari':'#E8002D',
  'Mercedes':'#27F4D2','Aston Martin':'#358C75','Alpine':'#FF87BC',
  'Williams':'#64C4FF','Racing Bulls':'#6692FF','Kick Sauber':'#52E252',
  'Haas':'#B6BABD',
};

/* ── App state ───────────────────────────────────────────────
   Variables that hold data while the page is open */
let allRaces             = [];   // every race in the season
let countdownInterval    = null; // the timer ticking every second
let miniTimers           = {};   // mini timers on each race card
let currentTab           = 'drivers'; // which standings tab is active
let driverStandings      = [];
let constructorStandings = [];

/* ── localStorage cache helpers ─────────────────────────────
   Saves API responses so we don't fetch the same data twice */
function cacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch(_) {}
}
function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    // If the saved data is older than CACHE_TTL, throw it away
    if (Date.now() - obj.ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return obj.data;
  } catch(_) { return null; }
}

/* ── apiFetch ────────────────────────────────────────────────
   Fetches a URL, with caching and up to 3 retries if it fails */
async function apiFetch(url, cacheKey) {
  // Return saved data straight away if it's still fresh
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  // Try up to 3 times in case the API is slow or briefly down
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Give the API 15 seconds to respond before giving up on this attempt
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      cacheSet(cacheKey, json); // save so next visit is instant
      return json;
    } catch (err) {
      console.warn(`Attempt ${attempt} failed for ${url}:`, err.message);
      if (attempt === 3) throw err; // all 3 tries failed — give up
      // Wait before retrying (2s on first failure, 4s on second)
      await new Promise(r => setTimeout(r, attempt * 2000));
    }
  }
}

/* ── Date/time helpers ───────────────────────────────────────*/

// Combines a race's date + time into a single JavaScript Date object
function raceDateTime(race) {
  const time = race.time || '14:00:00Z';
  return new Date(`${race.date}T${time}`);
}

// Formats a date like "8 Mar 2026"
function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

// Formats a date like "Sun 8 Mar"
function formatDay(date) {
  return date.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
}

// Returns days/hours/minutes/seconds until a target date
function timeDiff(target) {
  const diff = target - Date.now();
  if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0, past:true };
  const s = Math.floor(diff / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    past: false,
  };
}

// Pads a number to always be 2 digits e.g. 5 → "05"
function pad(n) { return String(n).padStart(2, '0'); }

/* ── Small utility helpers ───────────────────────────────────*/
function getFlag(country) { return COUNTRY_FLAGS[country] || '🏁'; }
function getImg(name)     { return CIRCUIT_IMAGES[name]   || DEFAULT_IMG; }
function teamColor(name) {
  for (const [k,v] of Object.entries(TEAM_COLORS)) {
    if (name && name.includes(k)) return v;
  }
  return '#888';
}
function errorHTML(msg) {
  return `<div class="error-state"><div class="error-icon">⚠️</div><p>${msg}</p></div>`;
}

/* ── Navbar ──────────────────────────────────────────────────
   Makes the navbar sticky, highlights the active section link,
   and handles the hamburger menu on mobile */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const links  = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // Add a shadow to the navbar once the user scrolls down
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    // Show/hide the back-to-top button
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
    // Highlight the nav link for whichever section is on screen
    let current = '';
    ['hero','countdown','upcoming','results','standings','past'].forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) current = id;
    });
    links.forEach(l => {
      const href = l.getAttribute('href').replace('#','');
      l.classList.toggle('active', href === current);
    });
  }, { passive: true });

  // Hamburger open/close
  const ham = document.getElementById('hamburger');
  const nav = document.getElementById('navLinks');
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    nav.classList.toggle('open');
  });
  // Close menu when a link is tapped
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    ham.classList.remove('open');
    nav.classList.remove('open');
  }));

  // Back to top button scrolls the page to the very top
  document.getElementById('backToTop').addEventListener('click', () =>
    window.scrollTo({ top:0, behavior:'smooth' }));
}

/* ── Dark mode ───────────────────────────────────────────────
   Toggles between light and dark, and remembers the choice */
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const saved  = localStorage.getItem('f1hub-theme') || 'light';
  document.documentElement.dataset.theme = saved;
  toggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('f1hub-theme', next);
  });
}

/* ── Refresh button ──────────────────────────────────────────
   Clears saved data and re-fetches everything from the API */
function initRefresh() {
  document.getElementById('refreshBtn').addEventListener('click', () => {
    ['f1-schedule','f1-results','f1-drivers','f1-constructors'].forEach(k =>
      localStorage.removeItem(k));
    loadAll();
  });
}

/* ── Standings tabs ──────────────────────────────────────────
   Switches between Drivers and Constructors tables */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      renderStandings();
    });
  });
}

/* ── Next race / season complete card ────────────────────────
   Shows either a countdown to the next race, or the last race
   if the season is over */
function renderNextRace(race, seasonOver) {
  const card = document.getElementById('nextRaceCard');
  const dt   = raceDateTime(race);
  const flag = getFlag(race.Circuit.Location.country);
  const img  = getImg(race.Circuit.circuitName);

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
          : `<span class="nrc-countdown-label">Race starts in</span>
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
  if (!seasonOver) startMainCountdown(dt);
}

// Builds one countdown box (the dark square showing e.g. "12 DAYS")
function countdownBoxHTML(val, unit) {
  return `<div class="countdown-box">
    <span class="countdown-num">${val}</span>
    <span class="countdown-unit">${unit}</span>
  </div>`;
}

// Updates the countdown numbers every second
function startMainCountdown(target) {
  if (countdownInterval) clearInterval(countdownInterval);
  function tick() {
    const boxes = document.querySelectorAll('#mainCountdown .countdown-num');
    if (!boxes.length) { clearInterval(countdownInterval); return; }
    const t = timeDiff(target);
    const vals = [pad(t.days), pad(t.hours), pad(t.minutes), pad(t.seconds)];
    boxes.forEach((box, i) => {
      if (box.textContent !== vals[i]) {
        box.textContent = vals[i];
        box.classList.remove('flip');
        void box.offsetWidth; // forces the browser to restart the animation
        box.classList.add('flip');
      }
    });
  }
  tick();
  countdownInterval = setInterval(tick, 1000);
}

/* ── Upcoming race cards ─────────────────────────────────────
   Builds the grid of cards for races that haven't happened yet */
function renderRaceCards(races) {
  const grid = document.getElementById('racesGrid');
  // Clear any old mini timers first
  Object.values(miniTimers).forEach(id => clearInterval(id));
  miniTimers = {};

  // Only show future races
  const upcoming = races.filter(r => raceDateTime(r) > Date.now());

  if (!upcoming.length) {
    grid.innerHTML = '<p style="color:var(--gray);padding:32px;text-align:center">No upcoming races this season.</p>';
    return;
  }

  grid.innerHTML = upcoming.map((race, idx) => {
    const dt   = raceDateTime(race);
    const flag = getFlag(race.Circuit.Location.country);
    const img  = getImg(race.Circuit.circuitName);
    const isNext = idx === 0; // the first card is the very next race

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
  }).join('');

  // Start mini countdown timers on each card
  upcoming.forEach(race => {
    const el = document.getElementById(`mini-${race.round}`);
    if (!el) return;
    const dt = raceDateTime(race);
    const update = () => {
      const t = timeDiff(dt);
      if (t.past) { el.textContent = 'Race day!'; clearInterval(miniTimers[race.round]); return; }
      el.textContent = t.days > 0 ? `${t.days}d ${pad(t.hours)}h` : `${pad(t.hours)}h ${pad(t.minutes)}m`;
    };
    update();
    miniTimers[race.round] = setInterval(update, 30000);
  });
}

/* ── Latest race results ─────────────────────────────────────
   Shows the podium + top 10 from the most recently completed race */
function renderResults(data) {
  const container = document.getElementById('resultsContainer');
  const races = data?.MRData?.RaceTable?.Races;
  if (!races || !races.length) {
    container.innerHTML = errorHTML('No race results available yet.');
    return;
  }

  const race    = races[0];
  const results = race.Results || [];
  const top10   = results.slice(0, 10);
  const podium  = results.slice(0, 3);
  const flResult = results.find(r => r.FastestLap?.rank === '1');

  container.innerHTML = `
    <div class="results-wrapper">
      <div class="podium-section">
        <div class="podium-title">🏆 Podium</div>
        <div class="podium-grid">
          ${podium.map((r, i) => {
            const cls   = ['podium-1st','podium-2nd','podium-3rd'][i];
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
            ${top10.map(r => {
              const pos = parseInt(r.position, 10);
              const cls = pos===1?'p1':pos===2?'p2':pos===3?'p3':'';
              const fl  = r.FastestLap?.rank === '1';
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
function renderStandings() {
  const container = document.getElementById('standingsContainer');
  if (currentTab === 'drivers') renderDriverStandings(container);
  else renderConstructorStandings(container);
}

function renderDriverStandings(container) {
  if (!driverStandings.length) {
    container.innerHTML = errorHTML('No driver standings available.');
    return;
  }
  const maxPts = parseFloat(driverStandings[0]?.points || 1);
  container.innerHTML = `
    <div class="standings-table-wrap">
      <table class="standings-table">
        <thead><tr><th>Pos</th><th>Driver</th><th>Nationality</th><th style="text-align:right">Points</th></tr></thead>
        <tbody>
          ${driverStandings.slice(0,10).map(d => {
            const pos  = parseInt(d.position, 10);
            const barW = Math.max(4, Math.round((parseFloat(d.points) / maxPts) * 100));
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

function renderConstructorStandings(container) {
  if (!constructorStandings.length) {
    container.innerHTML = errorHTML('No constructor standings available.');
    return;
  }
  const maxPts = parseFloat(constructorStandings[0]?.points || 1);
  container.innerHTML = `
    <div class="standings-table-wrap">
      <table class="standings-table">
        <thead><tr><th>Pos</th><th>Constructor</th><th>Nationality</th><th style="text-align:right">Points</th></tr></thead>
        <tbody>
          ${constructorStandings.slice(0,10).map(c => {
            const pos = parseInt(c.position, 10);
            const col = teamColor(c.Constructor.name);
            const barW = Math.max(4, Math.round((parseFloat(c.points) / maxPts) * 100));
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
function renderPastRaceCards(races) {
  const grid = document.getElementById('pastRacesGrid');
  const past = races.filter(r => raceDateTime(r) <= Date.now());

  if (!past.length) {
    grid.innerHTML = '<p style="color:var(--gray);padding:32px;text-align:center">No completed races yet this season.</p>';
    return;
  }

  // Reverse so most recent is first
  const reversed = [...past].reverse();

  grid.innerHTML = reversed.map(race => {
    const dt   = raceDateTime(race);
    const flag = getFlag(race.Circuit.Location.country);
    const img  = getImg(race.Circuit.circuitName);
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
  }).join('');

  // Attach click listeners — tapping a card opens the results popup
  grid.querySelectorAll('.past-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.round));
  });
}

/* ── Modal popup ─────────────────────────────────────────────
   Opens when you tap a past race card and shows that race's results */
async function openModal(round) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  // Show a spinner while results load
  content.innerHTML = `<div class="grid-loading"><div class="spinner"></div><p>Loading results…</p></div>`;
  overlay.classList.add('open');          // make popup visible
  document.body.style.overflow = 'hidden'; // stop page scrolling behind popup

  try {
    // Fetch results for this specific round number
    const res  = await fetch(`${API_BASE}/current/${round}/results.json`);
    const data = await res.json();
    const race    = data?.MRData?.RaceTable?.Races?.[0];
    const results = race?.Results || [];

    if (!race || !results.length) {
      content.innerHTML = '<p style="padding:32px;text-align:center;color:var(--gray)">No results available yet.</p>';
      return;
    }

    const flDriver = results.find(r => r.FastestLap?.rank === '1');

    // Build the podium boxes for 1st, 2nd, 3rd
    const podiumHTML = results.slice(0, 3).map((r, i) => `
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
      renderNextRace(next, false); // show countdown to next race
    } else if (last) {
      renderNextRace(last, true);  // season over — show last race
    } else {
      document.getElementById('nextRaceCard').innerHTML = errorHTML('No race data available.');
    }

    renderRaceCards(allRaces);     // upcoming races grid
    renderPastRaceCards(allRaces); // past races grid
  } catch(err) {
    console.error('Schedule failed:', err);
    document.getElementById('nextRaceCard').innerHTML = errorHTML('Could not load race data. Please try refreshing.');
    document.getElementById('racesGrid').innerHTML    = errorHTML('Could not load race schedule.');
    document.getElementById('pastRacesGrid').innerHTML = errorHTML('Could not load past races.');
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

async function loadStandings() {
  try {
    const [drData, csData] = await Promise.all([
      apiFetch(`${API_BASE}/current/driverStandings.json`, 'f1-drivers'),
      apiFetch(`${API_BASE}/current/constructorStandings.json`, 'f1-constructors'),
    ]);
    driverStandings      = drData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
    constructorStandings = csData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
    renderStandings();
  } catch(err) {
    console.error('Standings failed:', err);
    document.getElementById('standingsContainer').innerHTML = errorHTML('Could not load standings.');
  }
}

// Loads everything at once when the page opens
async function loadAll() {
  await loadSchedule();
  await new Promise(r => setTimeout(r, 600));
  await loadResults();
  await new Promise(r => setTimeout(r, 600));
  await loadStandings();
}

/* ── Start everything when the page is ready ─────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTheme();
  initRefresh();
  initTabs();
  initModal();
  loadAll();
});
