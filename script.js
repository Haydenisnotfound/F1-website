/* ============================================================
   F1 HUB — script.js
   Jolpica F1 API  |  Live countdown  |  Standings  |  Results
   ============================================================ */

'use strict';

/* Clear old cached data if the site has been updated */
const CACHE_VERSION = '3';
if (localStorage.getItem('f1hub-version') !== CACHE_VERSION) {
  ['f1-schedule','f1-results','f1-drivers','f1-constructors'].forEach(k =>
    localStorage.removeItem(k));
  localStorage.setItem('f1hub-version', CACHE_VERSION);
}

/* ── Constants ───────────────────────────────────────────── */
const API_BASE   = 'https://api.jolpi.ca/ergast/f1';
const CACHE_TTL  = 5 * 60 * 1000; // 5 minutes

/* Circuit / country image map (Unsplash) */
const CIRCUIT_IMAGES = {
  'Albert Park Grand Prix Circuit':     'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=70',
  'Bahrain International Circuit':       'https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=70',
  'Jeddah Corniche Circuit':             'https://images.unsplash.com/photo-1565073624497-7144969e5d3d?w=600&q=70',
  'Suzuka Circuit':                      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=70',
  'Shanghai International Circuit':     'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&q=70',
  'Miami International Autodrome':      'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=600&q=70',
  'Autodromo Enzo e Dino Ferrari':       'https://images.unsplash.com/photo-1551801841-ecad875a5142?w=600&q=70',
  'Circuit de Monaco':                   'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=70',
  'Circuit de Barcelona-Catalunya':      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70',
  'Circuit Gilles Villeneuve':           'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=70',
  'Red Bull Ring':                       'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=70',
  'Silverstone Circuit':                 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&q=70',
  'Hungaroring':                         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70',
  'Circuit de Spa-Francorchamps':        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=70',
  'Circuit Park Zandvoort':             'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=70',
  'Autodromo Nazionale di Monza':        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=70',
  'Baku City Circuit':                   'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=600&q=70',
  'Marina Bay Street Circuit':           'https://images.unsplash.com/photo-1559564058-6f0b6ddf5e57?w=600&q=70',
  'Circuit of the Americas':            'https://images.unsplash.com/photo-1516546453174-5e1098a4b4af?w=600&q=70',
  'Autodromo Hermanos Rodriguez':        'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&q=70',
  'Autodromo José Carlos Pace':          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=70',
  'Las Vegas Strip Street Circuit':     'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=600&q=70',
  'Losail International Circuit':       'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=70',
  'Yas Marina Circuit':                  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=70',
};
const DEFAULT_CIRCUIT_IMG = 'https://images.unsplash.com/photo-1541773367336-d3f9f1d312b4?w=600&q=70';

/* Country → emoji flag helper */
const COUNTRY_FLAGS = {
  'Australia':'🇦🇺','Bahrain':'🇧🇭','Saudi Arabia':'🇸🇦','Japan':'🇯🇵',
  'China':'🇨🇳','USA':'🇺🇸','United States':'🇺🇸','Italy':'🇮🇹',
  'Monaco':'🇲🇨','Spain':'🇪🇸','Canada':'🇨🇦','Austria':'🇦🇹',
  'UK':'🇬🇧','United Kingdom':'🇬🇧','Hungary':'🇭🇺','Belgium':'🇧🇪',
  'Netherlands':'🇳🇱','Azerbaijan':'🇦🇿','Singapore':'🇸🇬',
  'Mexico':'🇲🇽','Brazil':'🇧🇷','Qatar':'🇶🇦','UAE':'🇦🇪',
  'Abu Dhabi':'🇦🇪','Las Vegas':'🇺🇸',
};

/* Team colour accents */
const TEAM_COLORS = {
  'Red Bull': '#3671C6', 'McLaren': '#FF8000', 'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2', 'Aston Martin': '#358C75', 'Alpine': '#FF87BC',
  'Williams': '#64C4FF', 'Racing Bulls': '#6692FF', 'Kick Sauber': '#52E252',
  'Haas': '#B6BABD',
};

/* ── State ───────────────────────────────────────────────── */
let allRaces          = [];
let countdownInterval = null;
let miniTimers        = {};
let currentTab        = 'drivers';
let driverStandings   = [];
let constructorStandings = [];

/* ── Cache helpers ───────────────────────────────────────── */
function cacheSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch(_) {}
}
function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (Date.now() - obj.ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return obj.data;
  } catch(_) { return null; }
}

/* ── Fetch with cache ────────────────────────────────────── */
async function apiFetch(url, cacheKey) {
  // First check if we already have fresh data saved — if so, use it immediately
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  // Set a 10-second timeout — if the API takes longer, we give up gracefully
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer); // cancel the timeout since we got a response
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    cacheSet(cacheKey, json); // save to cache for next time
    return json;
  } catch (err) {
    clearTimeout(timer);
    // If it timed out or failed, try one more time after 2 seconds
    if (err.name === 'AbortError' || err.message.includes('fetch')) {
      await new Promise(r => setTimeout(r, 2000)); // wait 2 seconds
      const res2 = await fetch(url); // try again without timeout
      if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
      const json2 = await res2.json();
      cacheSet(cacheKey, json2);
      return json2;
    }
    throw err;
  }
}

/* ── Date helpers ────────────────────────────────────────── */
function raceDateTime(race) {
  const date = race.date;
  const time = race.time || '14:00:00Z';
  return new Date(`${date}T${time}`);
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatDay(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

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

function pad(n) { return String(n).padStart(2,'0'); }

/* ── Helpers ─────────────────────────────────────────────── */
function getFlag(country) { return COUNTRY_FLAGS[country] || '🏁'; }
function getImg(circuitName) { return CIRCUIT_IMAGES[circuitName] || DEFAULT_CIRCUIT_IMG; }
function teamColor(team) {
  for (const [k,v] of Object.entries(TEAM_COLORS)) {
    if (team.includes(k)) return v;
  }
  return '#888';
}

/* ── Navbar scroll & active ──────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const links  = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    // Back to top
    document.getElementById('backToTop')
      .classList.toggle('visible', window.scrollY > 400);

    // Active link
    let current = '';
    ['hero','countdown','upcoming','results','standings'].forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) current = id;
    });
    links.forEach(l => {
      const href = l.getAttribute('href').replace('#','');
      l.classList.toggle('active', href === current);
    });
  }, { passive: true });

  // Hamburger
  const ham = document.getElementById('hamburger');
  const nav = document.getElementById('navLinks');
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    ham.classList.remove('open');
    nav.classList.remove('open');
  }));

  // Back to top
  document.getElementById('backToTop').addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Dark mode ───────────────────────────────────────────── */
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

/* ── Search ──────────────────────────────────────────────── */
function initSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => {
    const q   = input.value.trim().toLowerCase();
    const noR = document.getElementById('searchNoResult');
    if (!q) {
      renderRaceCards(allRaces); noR.classList.add('hidden'); return;
    }
    const filtered = allRaces.filter(r =>
      r.Circuit.Location.country.toLowerCase().includes(q) ||
      r.Circuit.Location.locality.toLowerCase().includes(q) ||
      r.raceName.toLowerCase().includes(q)
    );
    if (filtered.length) { renderRaceCards(filtered); noR.classList.add('hidden'); }
    else { renderRaceCards([]); noR.classList.remove('hidden'); }
  });
}

/* ── Refresh button ──────────────────────────────────────── */
function initRefresh() {
  document.getElementById('refreshBtn').addEventListener('click', () => {
    // Clear cache and reload
    ['f1-schedule','f1-results','f1-drivers','f1-constructors'].forEach(k =>
      localStorage.removeItem(k));
    loadAll();
  });
}

/* ── Standings tabs ──────────────────────────────────────── */
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

/* ── Next race card ──────────────────────────────────────── */
function renderNextRace(race) {
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
          <span class="nrc-info-label">Local Time</span>
          <span class="nrc-info-value">${dt.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>
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
        <span class="nrc-countdown-label">Race starts in</span>
        <div class="countdown-boxes" id="mainCountdown">
          ${countdownBoxHTML('00','DAYS')}
          <span class="countdown-sep">:</span>
          ${countdownBoxHTML('00','HRS')}
          <span class="countdown-sep">:</span>
          ${countdownBoxHTML('00','MIN')}
          <span class="countdown-sep">:</span>
          ${countdownBoxHTML('00','SEC')}
        </div>
      </div>
    </div>
  `;

  startMainCountdown(dt);
}

function countdownBoxHTML(val, unit) {
  return `<div class="countdown-box">
    <span class="countdown-num">${val}</span>
    <span class="countdown-unit">${unit}</span>
  </div>`;
}

function startMainCountdown(target) {
  if (countdownInterval) clearInterval(countdownInterval);

  function tick() {
    const boxes = document.querySelectorAll('#mainCountdown .countdown-num');
    if (!boxes.length) { clearInterval(countdownInterval); return; }
    const t = timeDiff(target);
    if (t.past) {
      boxes[0].textContent = '00'; boxes[1].textContent = '00';
      boxes[2].textContent = '00'; boxes[3].textContent = '00';
      clearInterval(countdownInterval); return;
    }
    const vals = [pad(t.days), pad(t.hours), pad(t.minutes), pad(t.seconds)];
    boxes.forEach((box, i) => {
      if (box.textContent !== vals[i]) {
        box.textContent = vals[i];
        box.classList.remove('flip');
        void box.offsetWidth;
        box.classList.add('flip');
      }
    });
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

/* ── Race cards ──────────────────────────────────────────── */
function renderRaceCards(races) {
  const grid = document.getElementById('racesGrid');
  const now  = Date.now();

  // Clear old mini timers
  Object.values(miniTimers).forEach(id => clearInterval(id));
  miniTimers = {};

  if (!races.length) { grid.innerHTML = ''; return; }

  // Only upcoming
  const upcoming = races.filter(r => raceDateTime(r) > now);

  if (!upcoming.length) {
    grid.innerHTML = '<p style="color:var(--gray);padding:32px;text-align:center">No upcoming races this season.</p>';
    return;
  }

  grid.innerHTML = upcoming.map((race, idx) => {
    const dt    = raceDateTime(race);
    const flag  = getFlag(race.Circuit.Location.country);
    const img   = getImg(race.Circuit.circuitName);
    const isNext = idx === 0;

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

  // Start mini countdowns
  upcoming.forEach(race => {
    const el = document.getElementById(`mini-${race.round}`);
    if (!el) return;
    const dt = raceDateTime(race);

    const update = () => {
      const t = timeDiff(dt);
      if (t.past) { el.textContent = 'Race day!'; clearInterval(miniTimers[race.round]); return; }
      if (t.days > 0) el.textContent = `${t.days}d ${pad(t.hours)}h`;
      else el.textContent = `${pad(t.hours)}h ${pad(t.minutes)}m`;
    };
    update();
    miniTimers[race.round] = setInterval(update, 30000);
  });
}

/* ── Results ─────────────────────────────────────────────── */
function renderResults(data) {
  const container = document.getElementById('resultsContainer');
  const races = data?.MRData?.RaceTable?.Races;

  if (!races || !races.length) {
    container.innerHTML = errorHTML('No race results available yet for this season.');
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
            const order = [1,0,2][i];
            return `
              <div class="podium-item" style="order:${order}">
                <div class="podium-info">
                  <div class="podium-pos">${['1st Place','2nd Place','3rd Place'][i]}</div>
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
          <thead>
            <tr>
              <th>Pos</th>
              <th>Driver</th>
              <th>Team</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            ${top10.map(r => {
              const hasFl = r.FastestLap?.rank === '1';
              const pos   = parseInt(r.position,10);
              const posCls = pos===1?'p1':pos===2?'p2':pos===3?'p3':'';
              return `
                <tr>
                  <td><span class="result-pos ${posCls}">${r.position}</span></td>
                  <td>
                    <div class="result-driver-name">${r.Driver.givenName} ${r.Driver.familyName}${hasFl ? '<span class="result-fl-badge">FL</span>' : ''}</div>
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

/* ── Standings ───────────────────────────────────────────── */
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
        <thead>
          <tr>
            <th>Pos</th>
            <th>Driver</th>
            <th>Nationality</th>
            <th style="text-align:right">Points</th>
          </tr>
        </thead>
        <tbody>
          ${driverStandings.slice(0,10).map(d => {
            const pos = parseInt(d.position,10);
            const pts = parseFloat(d.points);
            const barW = Math.max(4, Math.round((pts / maxPts) * 100));
            return `
              <tr>
                <td><span class="st-pos ${pos===1?'p1':''}">${d.position}</span></td>
                <td>
                  <div class="st-driver-name">${d.Driver.givenName} ${d.Driver.familyName}</div>
                  <div class="st-team" style="color:${teamColor(d.Constructors[0]?.name||'')}">
                    ${d.Constructors[0]?.name || '—'}
                  </div>
                  <div class="points-bar-wrap">
                    <div class="points-bar" style="width:${barW}%"></div>
                  </div>
                </td>
                <td class="st-nationality">${d.Driver.nationality}</td>
                <td>
                  <div class="st-points">${d.points}</div>
                  <div class="st-pts-label">pts</div>
                </td>
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
        <thead>
          <tr>
            <th>Pos</th>
            <th>Constructor</th>
            <th>Nationality</th>
            <th style="text-align:right">Points</th>
          </tr>
        </thead>
        <tbody>
          ${constructorStandings.slice(0,10).map(c => {
            const pos  = parseInt(c.position,10);
            const pts  = parseFloat(c.points);
            const barW = Math.max(4, Math.round((pts / maxPts) * 100));
            const col  = teamColor(c.Constructor.name);
            return `
              <tr>
                <td><span class="st-pos ${pos===1?'p1':''}">${c.position}</span></td>
                <td>
                  <div class="st-driver-name" style="color:${col}">${c.Constructor.name}</div>
                  <div class="st-team">${c.Constructor.nationality}</div>
                  <div class="points-bar-wrap">
                    <div class="points-bar" style="width:${barW}%;background:${col}"></div>
                  </div>
                </td>
                <td class="st-nationality">${c.Constructor.nationality}</td>
                <td>
                  <div class="st-points">${c.points}</div>
                  <div class="st-pts-label">pts</div>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ── Error helper ────────────────────────────────────────── */
function errorHTML(msg) {
  return `<div class="error-state"><div class="error-icon">⚠️</div><p>${msg}</p></div>`;
}

/* ── Load all data ───────────────────────────────────────── */
async function loadAll() {
  await Promise.allSettled([
    loadSchedule(),
    loadResults(),
    loadStandings(),
  ]);
}

async function loadSchedule() {
  try {
    const data = await apiFetch(`${API_BASE}/current.json`, 'f1-schedule');
    allRaces = data?.MRData?.RaceTable?.Races || [];

    const now  = Date.now();
    const next = allRaces.find(r => raceDateTime(r) > now);

    if (next) renderNextRace(next);
    else {
      document.getElementById('nextRaceCard').innerHTML =
        errorHTML('The season is over. See you next year! 🏁');
    }

    renderRaceCards(allRaces);
  } catch (err) {
    console.error('Schedule fetch failed:', err);
    document.getElementById('nextRaceCard').innerHTML =
      errorHTML('Could not load race schedule. Please try again later.');
    document.getElementById('racesGrid').innerHTML =
      errorHTML('Could not load race schedule.');
  }
}

async function loadResults() {
  try {
    const data = await apiFetch(`${API_BASE}/current/last/results.json`, 'f1-results');
    renderResults(data);
  } catch (err) {
    console.error('Results fetch failed:', err);
    document.getElementById('resultsContainer').innerHTML =
      errorHTML('Could not load race results.');
  }
}

async function loadStandings() {
  try {
    const [drData, csData] = await Promise.all([
      apiFetch(`${API_BASE}/current/driverStandings.json`, 'f1-drivers'),
      apiFetch(`${API_BASE}/current/constructorStandings.json`, 'f1-constructors'),
    ]);

    driverStandings =
      drData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
    constructorStandings =
      csData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

    renderStandings();
  } catch (err) {
    console.error('Standings fetch failed:', err);
    document.getElementById('standingsContainer').innerHTML =
      errorHTML('Could not load standings.');
  }
}

/* ── Bootstrap ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTheme();
  initSearch();
  initRefresh();
  initTabs();
  loadAll();
});

/* ============================================================
   PAST RACES & MODAL — added code
   Everything below handles the "Past Races" grid and the
   popup that appears when you click on a past race card.
   ============================================================ */

/* --- Render Past Race Cards --------------------------------
   This function takes all the races from the API and filters
   down to only the ones that have already happened.
   It then builds a card for each one and puts them on the page. */
function renderPastRaceCards(races) {
  // Get the grid container on the page where cards will go
  const grid = document.getElementById('pastRacesGrid');

  const now = Date.now(); // the current time in milliseconds

  // Keep only races whose date is in the past
  const past = races.filter(r => raceDateTime(r) <= now);

  // If there are no past races yet (e.g. very start of season), show a message
  if (!past.length) {
    grid.innerHTML = '<p style="color:var(--gray);padding:32px;text-align:center">No completed races yet this season.</p>';
    return;
  }

  // Show the most recent race first by reversing the list
  const reversed = [...past].reverse();

  // Build one HTML card string for each past race
  grid.innerHTML = reversed.map(race => {
    const dt   = raceDateTime(race);          // the race date as a Date object
    const flag = getFlag(race.Circuit.Location.country); // country emoji flag
    const img  = getImg(race.Circuit.circuitName);       // circuit background image

    // Return the HTML for one card
    // data-round stores the round number so we know which race was clicked
    return `
      <div class="race-card past-card" data-round="${race.round}" style="cursor:pointer">
        <div class="rc-img-wrap">
          <img class="rc-img" src="${img}" alt="${race.raceName}" loading="lazy"/>
          <div class="rc-img-overlay"></div>
          <span class="rc-flag-big">${flag}</span>
          <span class="rc-round-badge">R${race.round}</span>
          <span class="rc-done-badge">✓ Completed</span>
        </div>
        <div class="rc-body">
          <div class="rc-name">${race.raceName.replace(' Grand Prix', '')} GP</div>
          <div class="rc-circuit">📍 ${race.Circuit.circuitName}</div>
          <div class="rc-meta">
            <span class="rc-date">${formatDate(dt)}</span>
          </div>
          <div class="rc-click-hint">Tap for results →</div>
        </div>
      </div>`;
  }).join(''); // joins all card strings into one big HTML string

  // After building the cards, attach a click listener to each one
  // So when you tap a card, it opens the popup with that race's results
  grid.querySelectorAll('.past-card').forEach(card => {
    card.addEventListener('click', () => {
      // Read which round number was stored on this card
      const round = card.dataset.round;
      // Open the modal and fetch results for that round
      openModal(round);
    });
  });
}

/* --- Open Modal --------------------------------------------
   Called when you click a past race card.
   Shows the popup and fetches the results for that round. */
async function openModal(round) {
  const overlay = document.getElementById('modalOverlay'); // the dark background
  const content = document.getElementById('modalContent'); // where results go

  // Show a loading spinner inside the popup while we fetch data
  content.innerHTML = `
    <div class="grid-loading">
      <div class="spinner"></div>
      <p>Loading results…</p>
    </div>`;

  // Make the overlay visible by adding the "open" CSS class
  overlay.classList.add('open');

  // Stop the page from scrolling while the popup is open
  document.body.style.overflow = 'hidden';

  try {
    // Ask the API for the results of this specific round number
    // We don't cache these so results are always fresh
    const res  = await fetch(`${API_BASE}/current/${round}/results.json`);
    const data = await res.json(); // convert the response to a JS object

    // Dig into the nested response to get the race object
    const race    = data?.MRData?.RaceTable?.Races?.[0];
    const results = race?.Results || []; // the array of driver finishes

    // If something went wrong or no data came back, show an error
    if (!race || !results.length) {
      content.innerHTML = '<p style="padding:32px;text-align:center;color:var(--gray)">No results available for this race.</p>';
      return;
    }

    // Find which driver set the fastest lap (the API marks them with rank "1")
    const flDriver = results.find(r => r.FastestLap?.rank === '1');

    // Build the podium section — top 3 finishers with medal emojis
    const podiumHTML = results.slice(0, 3).map((r, i) => `
      <div class="modal-podium-item">
        <div class="modal-podium-medal">${['🥇','🥈','🥉'][i]}</div>
        <div class="modal-podium-name">${r.Driver.givenName} ${r.Driver.familyName}</div>
        <div class="modal-podium-team" style="color:${teamColor(r.Constructor.name)}">${r.Constructor.name}</div>
      </div>`).join('');

    // Build the full top-10 results table rows
    const rowsHTML = results.slice(0, 10).map(r => {
      const pos    = parseInt(r.position, 10);
      // Give positions 1, 2, 3 a special colour class
      const posCls = pos === 1 ? 'p1' : pos === 2 ? 'p2' : pos === 3 ? 'p3' : '';
      const hasFl  = r.FastestLap?.rank === '1'; // did this driver set fastest lap?

      return `
        <tr>
          <td><span class="result-pos ${posCls}">${r.position}</span></td>
          <td>
            <div class="result-driver-name">
              ${r.Driver.givenName} ${r.Driver.familyName}
              ${hasFl ? '<span class="result-fl-badge">FL</span>' : ''}
            </div>
            <div class="result-team" style="color:${teamColor(r.Constructor.name)}">${r.Constructor.name}</div>
          </td>
          <td style="font-weight:700">${r.points}</td>
        </tr>`;
    }).join('');

    // Put it all together and drop it into the modal content area
    content.innerHTML = `
      <div class="modal-race-title">${race.raceName}</div>
      <div class="modal-race-sub">
        📅 ${formatDate(raceDateTime(race))} &nbsp;·&nbsp; 📍 ${race.Circuit.circuitName}
      </div>

      <div class="modal-podium">${podiumHTML}</div>

      ${flDriver ? `
        <div class="modal-fl">
          ⚡ Fastest Lap: ${flDriver.Driver.givenName} ${flDriver.Driver.familyName}
          — ${flDriver.FastestLap.Time?.time || ''}
        </div>` : ''}

      <table class="modal-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Driver</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>${rowsHTML}</tbody>
      </table>`;

  } catch (err) {
    // If the fetch failed for any reason, show a friendly error
    content.innerHTML = '<p style="padding:32px;text-align:center;color:var(--gray)">Could not load results. Please try again.</p>';
    console.error('Modal fetch error:', err);
  }
}

/* --- Close Modal -------------------------------------------
   Hides the popup and re-enables page scrolling. */
function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open'); // removes the "open" class → popup fades out
  document.body.style.overflow = '';  // lets the page scroll again
}

/* --- Hook up the close buttons ----------------------------
   Runs once when the page loads.
   Attaches click listeners to the X button and the dark overlay. */
function initModal() {
  // Clicking the X button closes the modal
  document.getElementById('modalClose').addEventListener('click', closeModal);

  // Clicking the dark background (outside the white box) also closes it
  document.getElementById('modalOverlay').addEventListener('click', e => {
    // e.target is whatever was actually clicked
    // We only close if you clicked the overlay itself, not the white box inside it
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Pressing the Escape key on a keyboard also closes the modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

/* --- Patch loadSchedule to also render past races ---------
   The original loadSchedule() already fetches allRaces.
   We override it here to also call renderPastRaceCards()
   after the schedule loads, and to call initModal() once. */
const _originalLoadSchedule = loadSchedule; // save the original function

// Replace loadSchedule with a new version that does everything the old one did
// plus also renders the past races grid
loadSchedule = async function() {
  await _originalLoadSchedule(); // run the original function first
  renderPastRaceCards(allRaces); // then also build the past races section
};

// Set up the modal close buttons as soon as the page is ready
document.addEventListener('DOMContentLoaded', initModal);
