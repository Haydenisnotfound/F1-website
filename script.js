/* ============================================================
   F1 RUSH — script.js
   Full game engine: Game, PlayerCar, AICar, PowerUp classes
   Light theme, canvas-rendered, no dependencies
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   CONSTANTS & CONFIG
════════════════════════════════════════════════════════════ */
const CANVAS_W   = 420;
const CANVAS_H   = 700;
const TRACK_LEFT = 60;
const TRACK_W    = 300;
const LANE_COUNT = 4;
const LANE_W     = TRACK_W / LANE_COUNT;  // 75px each
const NUM_LIVES  = 3;
const TURBO_MAX  = 100;
const TURBO_DRAIN= 1.8;   // per frame while active
const TURBO_REGEN= 0.25;  // per frame idle

const CIRCUITS = [
  { name: 'SILVERSTONE',  theme: { asphalt: '#D6D0C8', line: '#E10600',  grass: '#7DC67A', barrier: '#E10600' } },
  { name: 'MONACO',       theme: { asphalt: '#C8C4BC', line: '#111111',  grass: '#5DAF5A', barrier: '#FF6B35' } },
  { name: 'SUZUKA',       theme: { asphalt: '#CCCBC4', line: '#E10600',  grass: '#6BBF68', barrier: '#E10600' } },
];

const WEATHER_TYPES = ['DRY', 'WET', 'STORM'];

// Points
const PTS_OVERTAKE  = 15;
const PTS_METER     = 1;   // per 100 scroll meters
const PTS_POWERUP   = 50;

/* ════════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════════ */
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx &&
         ay < by + bh && ay + ah > by;
}

/* ════════════════════════════════════════════════════════════
   AUDIO ENGINE (Web Audio API — no files needed)
════════════════════════════════════════════════════════════ */
class AudioEngine {
  constructor() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);
      this.engineNode = null;
      this.engineGain = null;
      this.ready = true;
    } catch(e) { this.ready = false; }
  }

  resume() {
    if (this.ready && this.ctx.state === 'suspended') this.ctx.resume();
  }

  /* Simple beep / synth tones */
  _beep(freq, dur, type='square', vol=0.3, startTime=null) {
    if (!this.ready) return;
    const t = startTime || this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g   = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  startEngine() {
    if (!this.ready || this.engineNode) return;
    this.engineNode = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();
    this.engineNode.type = 'sawtooth';
    this.engineNode.frequency.value = 90;
    this.engineGain.gain.value = 0.06;
    this.engineNode.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);
    this.engineNode.start();
  }
  setEngineRPM(speed) { /* speed 0-1 */
    if (!this.ready || !this.engineNode) return;
    this.engineNode.frequency.value = 80 + speed * 160;
    this.engineGain.gain.value = 0.04 + speed * 0.05;
  }
  stopEngine() {
    if (!this.ready || !this.engineNode) return;
    this.engineNode.stop();
    this.engineNode = null;
    this.engineGain = null;
  }

  playCrash() {
    if (!this.ready) return;
    // White noise burst
    const buf  = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.6, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.9;
    const src = this.ctx.createBufferSource();
    const g   = this.ctx.createGain();
    g.gain.setValueAtTime(0.7, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
    src.buffer = buf;
    src.connect(g);
    g.connect(this.masterGain);
    src.start();
    // Low thud
    this._beep(50, 0.4, 'triangle', 0.5);
  }

  playPowerUp(type) {
    if (!this.ready) return;
    if (type === 'turbo') {
      this._beep(400, 0.08, 'square', 0.3);
      this._beep(600, 0.12, 'square', 0.3, this.ctx.currentTime + 0.08);
      this._beep(900, 0.18, 'square', 0.3, this.ctx.currentTime + 0.2);
    } else if (type === 'shield') {
      this._beep(500, 0.15, 'sine', 0.3);
      this._beep(700, 0.15, 'sine', 0.3, this.ctx.currentTime + 0.15);
    } else {
      this._beep(800, 0.1, 'sine', 0.25);
      this._beep(1000, 0.1, 'sine', 0.25, this.ctx.currentTime + 0.1);
      this._beep(1200, 0.15, 'sine', 0.25, this.ctx.currentTime + 0.2);
    }
  }

  playTurboActivate() {
    if (!this.ready) return;
    this._beep(200, 0.05, 'sawtooth', 0.4);
    this._beep(300, 0.05, 'sawtooth', 0.4, this.ctx.currentTime + 0.05);
    this._beep(500, 0.2,  'sawtooth', 0.4, this.ctx.currentTime + 0.1);
  }

  playOvertake() {
    if (!this.ready) return;
    this._beep(600, 0.05, 'square', 0.2);
    this._beep(900, 0.1,  'square', 0.2, this.ctx.currentTime + 0.05);
  }

  playMenuClick() {
    if (!this.ready) return;
    this._beep(440, 0.08, 'square', 0.2);
  }
}

/* ════════════════════════════════════════════════════════════
   PLAYER CAR
════════════════════════════════════════════════════════════ */
class PlayerCar {
  constructor(canvas) {
    this.w = 34;
    this.h = 62;
    this.x = TRACK_LEFT + TRACK_W / 2 - this.w / 2;
    this.y = CANVAS_H - 140;
    this.targetX = this.x;
    this.speed   = 0;         // current scroll speed (px/frame)
    this.baseSpeed = 3;
    this.maxSpeed  = 12;
    this.accel   = 0.06;
    this.decel   = 0.09;
    this.lateralSpeed = 0;
    this.maxLateral   = 5;
    this.lateralAccel = 0.8;
    this.lives    = NUM_LIVES;
    this.turbo    = TURBO_MAX;
    this.turboOn  = false;
    this.invincible  = false;
    this.invTimer    = 0;
    this.shielded    = false;
    this.shieldTimer = 0;
    this.multiplier  = 1;
    this.multTimer   = 0;
    this.flashTimer  = 0;
    this.exploding   = false;
    this.explodeTimer= 0;
    this.explodeParticles = [];
    this.canvas  = canvas;
    // Wheel animation
    this.wheelAngle = 0;
  }

  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }

  update(keys, dt) {
    if (this.exploding) {
      this.explodeTimer--;
      this.explodeParticles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.94; p.vy *= 0.94;
        p.life--;
      });
      this.explodeParticles = this.explodeParticles.filter(p => p.life > 0);
      return;
    }

    /* Vertical speed */
    const wantFast = keys['ArrowUp'] || keys['w'] || keys['W'];
    const wantSlow = keys['ArrowDown'] || keys['s'] || keys['S'];
    const turboActive = this.turboOn && this.turbo > 0;
    const topSpeed = this.maxSpeed * (turboActive ? 1.7 : 1);

    if (wantFast) {
      this.speed = Math.min(this.speed + this.accel * dt, topSpeed);
    } else if (wantSlow) {
      this.speed = Math.max(this.speed - this.decel * dt, this.baseSpeed * 0.4);
    } else {
      this.speed = lerp(this.speed, this.baseSpeed, 0.04);
    }

    /* Turbo meter */
    if (turboActive) {
      this.turbo = Math.max(0, this.turbo - TURBO_DRAIN);
      if (this.turbo === 0) this.turboOn = false;
    } else {
      this.turbo = Math.min(TURBO_MAX, this.turbo + TURBO_REGEN);
    }

    /* Lateral movement */
    const goLeft  = keys['ArrowLeft']  || keys['a'] || keys['A'];
    const goRight = keys['ArrowRight'] || keys['d'] || keys['D'];
    if (goLeft) {
      this.lateralSpeed = Math.max(-this.maxLateral, this.lateralSpeed - this.lateralAccel);
    } else if (goRight) {
      this.lateralSpeed = Math.min(this.maxLateral, this.lateralSpeed + this.lateralAccel);
    } else {
      this.lateralSpeed *= 0.75;
    }
    this.x = clamp(this.x + this.lateralSpeed, TRACK_LEFT + 2, TRACK_LEFT + TRACK_W - this.w - 2);

    /* Timers */
    if (this.invincible) { this.invTimer--; if (this.invTimer <= 0) this.invincible = false; }
    if (this.shielded)   { this.shieldTimer--; if (this.shieldTimer <= 0) { this.shielded = false; } }
    if (this.multiplier > 1) { this.multTimer--; if (this.multTimer <= 0) this.multiplier = 1; }
    if (this.flashTimer > 0) this.flashTimer--;

    /* Wheel spin */
    this.wheelAngle += this.speed * 0.25;
  }

  activateTurbo(audio) {
    if (this.turbo < 15) return false;
    this.turboOn = true;
    if (audio) audio.playTurboActivate();
    return true;
  }

  applyShield(duration) {
    this.shielded   = true;
    this.shieldTimer = duration;
    this.invincible  = true;
    this.invTimer    = duration;
  }

  applyMultiplier(mul, duration) {
    this.multiplier = mul;
    this.multTimer  = duration;
  }

  takeDamage() {
    if (this.invincible || this.shielded) return false;
    this.lives--;
    this.invincible = true;
    this.invTimer   = 120; // 2s invincibility after hit
    this.flashTimer = 120;
    if (this.lives <= 0) {
      this.explode();
      return true; // dead
    }
    return false;
  }

  explode() {
    this.exploding = true;
    this.explodeTimer = 80;
    for (let i = 0; i < 28; i++) {
      const angle = (Math.PI * 2 * i) / 28 + rand(-0.3, 0.3);
      const speed = rand(1.5, 6);
      this.explodeParticles.push({
        x: this.centerX, y: this.centerY,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        r: rand(3, 10),
        color: ['#E10600','#FF6B35','#FFD700','#fff','#333'][randInt(0,4)],
        life: randInt(30, 70)
      });
    }
  }

  draw(ctx, weather) {
    if (this.exploding) {
      this._drawExplosion(ctx);
      return;
    }

    /* Flash when invincible */
    if (this.flashTimer > 0 && Math.floor(this.flashTimer / 6) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

    /* Shield ring */
    if (this.shielded) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150);
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, this.w * 0.85 + pulse * 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 + pulse * 0.4})`;
      ctx.lineWidth = 4;
      ctx.shadowColor = '#3B82F6';
      ctx.shadowBlur  = 14 * pulse;
      ctx.stroke();
      ctx.restore();
    }

    /* Turbo glow */
    if (this.turboOn) {
      ctx.save();
      const tpulse = 0.5 + 0.5 * Math.sin(Date.now() / 80);
      ctx.shadowColor = '#FF6B35';
      ctx.shadowBlur  = 24 * tpulse;
      ctx.restore();
    }

    /* Rain effect smear */
    if (weather === 'WET' || weather === 'STORM') {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.ellipse(0, -this.h * 0.1, this.w * 0.55, this.h * 0.38, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100,160,255,0.4)';
      ctx.fill();
      ctx.restore();
    }

    this._drawF1Car(ctx);
    ctx.restore();
  }

  _drawF1Car(ctx) {
    const W = this.w, H = this.h;
    const hw = W / 2, hh = H / 2;

    /* Shadow */
    ctx.save();
    ctx.translate(4, 6);
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(0, 0, hw, hh * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();

    /* === REAR WING === */
    ctx.fillStyle = '#B30500';
    ctx.beginPath();
    ctx.rect(-hw - 4, hh - 10, W + 8, 5);
    ctx.fill();
    // end plates
    ctx.fillRect(-hw - 4, hh - 14, 5, 9);
    ctx.fillRect(hw - 1, hh - 14, 5, 9);

    /* === BODY — main pod === */
    ctx.fillStyle = '#E10600';
    ctx.beginPath();
    ctx.moveTo(-9, hh - 14);
    ctx.lineTo(-11, 0);
    ctx.lineTo(-8, -hh + 8);
    ctx.lineTo(0, -hh + 2);
    ctx.lineTo(8, -hh + 8);
    ctx.lineTo(11, 0);
    ctx.lineTo(9, hh - 14);
    ctx.closePath();
    ctx.fill();

    /* === COCKPIT === */
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(0, -hh * 0.15, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    /* === COCKPIT VISOR === */
    ctx.fillStyle = 'rgba(80,180,255,0.75)';
    ctx.beginPath();
    ctx.ellipse(0, -hh * 0.22, 4.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    /* === FRONT NOSE === */
    ctx.fillStyle = '#B30500';
    ctx.beginPath();
    ctx.moveTo(-6, -hh + 10);
    ctx.lineTo(-3, -hh - 4);
    ctx.lineTo(3,  -hh - 4);
    ctx.lineTo(6,  -hh + 10);
    ctx.closePath();
    ctx.fill();

    /* === FRONT WING === */
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.rect(-hw + 2, -hh + 2, W - 4, 7);
    ctx.fill();
    // end plates
    ctx.fillRect(-hw - 3, -hh - 2, 5, 12);
    ctx.fillRect(hw - 2,  -hh - 2, 5, 12);

    /* === SIDEPODS === */
    ctx.fillStyle = '#CC0500';
    // left
    ctx.beginPath();
    ctx.moveTo(-hw, hh * 0.1);
    ctx.lineTo(-hw - 2, -hh * 0.25);
    ctx.lineTo(-7, -hh * 0.35);
    ctx.lineTo(-7, hh * 0.15);
    ctx.closePath();
    ctx.fill();
    // right
    ctx.beginPath();
    ctx.moveTo(hw, hh * 0.1);
    ctx.lineTo(hw + 2, -hh * 0.25);
    ctx.lineTo(7, -hh * 0.35);
    ctx.lineTo(7, hh * 0.15);
    ctx.closePath();
    ctx.fill();

    /* === WHEELS === */
    const wRadius = 8, wW = 5;
    const wheelPositions = [
      { x: -hw - 1, y: -hh * 0.45 },  // FL
      { x:  hw - wW + 1, y: -hh * 0.45 },  // FR
      { x: -hw - 1, y:  hh * 0.35 },  // RL
      { x:  hw - wW + 1, y:  hh * 0.35 },  // RR
    ];
    wheelPositions.forEach(({ x, y }) => {
      ctx.save();
      ctx.translate(x + wW / 2, y);
      ctx.rotate(this.wheelAngle);
      // tyre
      ctx.beginPath();
      ctx.arc(0, 0, wRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#222';
      ctx.fill();
      // rim
      ctx.beginPath();
      ctx.arc(0, 0, wRadius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = '#ddd';
      ctx.fill();
      // spokes
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1.2;
      for (let s = 0; s < 5; s++) {
        const a = (s / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * wRadius * 0.48, Math.sin(a) * wRadius * 0.48);
        ctx.stroke();
      }
      ctx.restore();
    });

    /* === TURBO EXHAUST FLAME === */
    if (this.turboOn && this.turbo > 0) {
      ctx.save();
      const ft = Date.now() / 60;
      const fx = 0, fy = hh + 6 + Math.sin(ft) * 3;
      const flameH = 14 + Math.sin(ft * 2.5) * 6;
      const grad = ctx.createLinearGradient(fx, fy, fx, fy + flameH);
      grad.addColorStop(0, 'rgba(255,180,30,0.95)');
      grad.addColorStop(0.5, 'rgba(255,80,0,0.7)');
      grad.addColorStop(1, 'rgba(255,50,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-4, fy); ctx.lineTo(4, fy);
      ctx.lineTo(2 + Math.sin(ft) * 1.5, fy + flameH);
      ctx.lineTo(-2 + Math.sin(ft + 1) * 1.5, fy + flameH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    /* === NUMBER DECAL === */
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Barlow Condensed, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('01', 0, hh * 0.62);
  }

  _drawExplosion(ctx) {
    this.explodeParticles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life / 60;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    // Central flash
    const alpha = Math.min(1, this.explodeTimer / 20);
    ctx.save();
    ctx.globalAlpha = alpha;
    const grad = ctx.createRadialGradient(
      this.explodeParticles[0]?.x || CANVAS_W/2, this.explodeParticles[0]?.y || CANVAS_H/2, 0,
      this.explodeParticles[0]?.x || CANVAS_W/2, this.explodeParticles[0]?.y || CANVAS_H/2, 40
    );
    grad.addColorStop(0, 'rgba(255,220,50,0.9)');
    grad.addColorStop(0.4, 'rgba(255,80,0,0.6)');
    grad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(
      this.explodeParticles[0]?.x || CANVAS_W/2,
      this.explodeParticles[0]?.y || CANVAS_H/2,
      40, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
}

/* ════════════════════════════════════════════════════════════
   AI CAR
════════════════════════════════════════════════════════════ */
class AICar {
  constructor(lane, speed, gameSpeed, circuitIdx) {
    this.w  = 32;
    this.h  = 58;
    this.lane = lane;
    this.x  = TRACK_LEFT + lane * LANE_W + (LANE_W - this.w) / 2;
    this.y  = -this.h - rand(0, 80);
    this.speed = speed;
    this.passed  = false;
    this.counted = false;
    this.wobble  = 0;
    this.wobbleDir = 1;
    // Visual variety
    const COLORS = ['#1565C0','#2E7D32','#F57F17','#6A1B9A','#00838F','#4E342E'];
    this.bodyColor  = COLORS[randInt(0, COLORS.length - 1)];
    this.numLabel   = String(randInt(2, 99));
    this.wheelAngle = 0;
    this.circuitIdx = circuitIdx;
  }

  update(gameSpeed) {
    this.y += this.speed + gameSpeed;
    // Slight random lateral wobble
    this.wobble += 0.04 * this.wobbleDir;
    if (Math.abs(this.wobble) > 1.5) this.wobbleDir *= -1;
    this.x = TRACK_LEFT + this.lane * LANE_W + (LANE_W - this.w) / 2 + this.wobble;
    this.wheelAngle += (this.speed + gameSpeed) * 0.22;
  }

  isOffScreen() { return this.y > CANVAS_H + 20; }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    this._drawF1Car(ctx);
    ctx.restore();
  }

  _drawF1Car(ctx) {
    const W = this.w, H = this.h;
    const hw = W / 2, hh = H / 2;
    const col = this.bodyColor;

    /* Shadow */
    ctx.save(); ctx.globalAlpha = 0.15;
    ctx.beginPath(); ctx.ellipse(3, 5, hw * 0.8, hh * 0.55, 0, 0, Math.PI*2);
    ctx.fillStyle = '#000'; ctx.fill();
    ctx.restore();

    /* Rear wing */
    ctx.fillStyle = col;
    ctx.fillRect(-hw - 3, hh - 10, W + 6, 4);
    ctx.fillRect(-hw - 3, hh - 14, 4, 8);
    ctx.fillRect(hw - 1, hh - 14, 4, 8);

    /* Body */
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(-8, hh - 12); ctx.lineTo(-10, 0);
    ctx.lineTo(-7, -hh + 8); ctx.lineTo(0, -hh + 2);
    ctx.lineTo(7, -hh + 8);  ctx.lineTo(10, 0);
    ctx.lineTo(8, hh - 12); ctx.closePath();
    ctx.fill();

    /* Sidepods */
    ctx.fillStyle = this._darken(col, 0.15);
    ctx.beginPath();
    ctx.moveTo(-hw, hh * 0.1); ctx.lineTo(-hw, -hh * 0.28);
    ctx.lineTo(-6, -hh * 0.38); ctx.lineTo(-6, hh * 0.14);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hw, hh * 0.1); ctx.lineTo(hw, -hh * 0.28);
    ctx.lineTo(6, -hh * 0.38); ctx.lineTo(6, hh * 0.14);
    ctx.closePath(); ctx.fill();

    /* Cockpit */
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(0, -hh * 0.1, 5.5, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(80,180,255,0.6)';
    ctx.beginPath(); ctx.ellipse(0, -hh * 0.18, 4, 7, 0, 0, Math.PI * 2); ctx.fill();

    /* Front nose */
    ctx.fillStyle = this._darken(col, 0.2);
    ctx.beginPath();
    ctx.moveTo(-5, -hh + 10); ctx.lineTo(-3, -hh - 3);
    ctx.lineTo(3, -hh - 3); ctx.lineTo(5, -hh + 10);
    ctx.closePath(); ctx.fill();

    /* Front wing */
    ctx.fillStyle = '#111';
    ctx.fillRect(-hw + 2, -hh + 2, W - 4, 6);
    ctx.fillRect(-hw - 2, -hh - 1, 4, 10);
    ctx.fillRect(hw - 2, -hh - 1, 4, 10);

    /* Wheels */
    [{ x: -hw - 1, y: -hh * 0.42 }, { x: hw - 5, y: -hh * 0.42 },
     { x: -hw - 1, y:  hh * 0.32 }, { x: hw - 5, y:  hh * 0.32 }
    ].forEach(({ x, y }) => {
      ctx.save();
      ctx.translate(x + 4, y);
      ctx.rotate(this.wheelAngle);
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#222'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ccc'; ctx.fill();
      ctx.restore();
    });

    /* Number */
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Barlow Condensed, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.numLabel, 0, hh * 0.58);
  }

  _darken(hex, factor) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgb(${Math.floor(r*(1-factor))},${Math.floor(g*(1-factor))},${Math.floor(b*(1-factor))})`;
  }
}

/* ════════════════════════════════════════════════════════════
   POWER-UP
════════════════════════════════════════════════════════════ */
class PowerUp {
  constructor(lane) {
    this.w     = 32;
    this.h     = 32;
    this.lane  = lane;
    this.x     = TRACK_LEFT + lane * LANE_W + (LANE_W - this.w) / 2;
    this.y     = -this.h;
    this.speed = 2.5;
    const types = ['turbo', 'shield', 'multiplier'];
    this.type  = types[randInt(0, 2)];
    this.bob   = 0;
    this.spin  = 0;
    this.collected = false;
    this.collectAnim = 0;
  }

  get color() {
    return { turbo:'#FF6B35', shield:'#3B82F6', multiplier:'#10B981' }[this.type];
  }
  get label() {
    return { turbo:'T', shield:'S', multiplier:'×2' }[this.type];
  }

  update(gameSpeed) {
    if (this.collected) { this.collectAnim++; return; }
    this.y += this.speed + gameSpeed * 0.4;
    this.bob  = Math.sin(Date.now() / 300) * 4;
    this.spin += 0.04;
  }

  isOffScreen() { return this.y > CANVAS_H + 20; }

  collect() { this.collected = true; }

  draw(ctx) {
    if (this.collected) {
      const a = 1 - this.collectAnim / 25;
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(this.x + this.w / 2, this.y - this.collectAnim * 2);
      ctx.fillStyle = this.color;
      ctx.font = 'bold 14px Barlow Condensed';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+' + (this.type === 'turbo' ? 'TURBO' : this.type === 'shield' ? 'SHIELD' : '×2'), 0, 0);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2 + this.bob);
    ctx.rotate(this.spin);

    // Glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = 16;

    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    // Icon
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 13px Barlow Condensed, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 0, 0);

    ctx.restore();
  }
}

/* ════════════════════════════════════════════════════════════
   GAME CLASS (main orchestrator)
════════════════════════════════════════════════════════════ */
class Game {
  constructor() {
    this.canvas  = document.getElementById('gameCanvas');
    this.ctx     = this.canvas.getContext('2d');
    this.audio   = new AudioEngine();
    this.state   = 'menu'; // menu | playing | paused | gameover
    this.raf     = null;

    /* Circuit / environment */
    this.circuitIdx  = 0;
    this.circuitDist = 0;  // scroll meters
    this.lapDist     = 4000;
    this.lap         = 1;
    this.weather     = 'DRY';
    this.weatherTimer= 0;
    this.rainDrops   = [];

    /* Scrolling road */
    this.roadOffset  = 0;
    this.dashOffset  = 0;
    this.grassOffset = 0;

    /* Game progression */
    this.gameSpeed   = 3;       // base scroll speed
    this.speedTarget = 3;
    this.score       = 0;
    this.scoreAccum  = 0;       // accumulator for per-meter points
    this.multiplier  = 1;

    /* Objects */
    this.player     = null;
    this.aiCars     = [];
    this.powerUps   = [];
    this.particles  = [];       // road sparks etc.

    /* Spawn timers */
    this.aiSpawnTimer  = 0;
    this.aiSpawnRate   = 90;    // frames between spawns
    this.puSpawnTimer  = 0;
    this.puSpawnRate   = 300;

    /* Input */
    this.keys       = {};
    this.touchState = { left: false, right: false, boost: false };

    /* Stats */
    this.bestScore  = parseInt(localStorage.getItem('f1rush_best') || '0');
    this.highScores = JSON.parse(localStorage.getItem('f1rush_scores') || '[]');

    /* Speed lines (decorative) */
    this.speedLines = Array.from({length: 20}, () => ({
      x: rand(0, CANVAS_W), y: rand(0, CANVAS_H),
      len: rand(20, 60), speed: rand(8, 18)
    }));

    this._bindEvents();
    this._initMenuUI();
    this._drawPreviewCar();
    this._showScreen('mainMenu');
  }

  /* ── BIND EVENTS ── */
  _bindEvents() {
    window.addEventListener('keydown', e => {
      this.keys[e.key] = true;
      this.audio.resume();

      if (this.state === 'playing') {
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          if (this.player) this.player.activateTurbo(this.audio);
        }
        if (e.key === 'p' || e.key === 'P') this._pause();
        if (e.key === 'r' || e.key === 'R') { if (this.state !== 'playing') this._restart(); }
      } else if (this.state === 'paused') {
        if (e.key === 'p' || e.key === 'P') this._resume();
      } else if (this.state === 'gameover') {
        if (e.key === 'r' || e.key === 'R') this._restart();
      }
    });
    window.addEventListener('keyup', e => { this.keys[e.key] = false; });

    /* Touch controls */
    const bindTouch = (id, stateKey) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', e => { e.preventDefault(); this.touchState[stateKey] = true; this.audio.resume(); }, { passive: false });
      btn.addEventListener('touchend', e => { e.preventDefault(); this.touchState[stateKey] = false; });
    };
    bindTouch('tLeft', 'left');
    bindTouch('tRight', 'right');
    bindTouch('tBoost', 'boost');
  }

  _initMenuUI() {
    /* Menu buttons */
    document.getElementById('btnStart').addEventListener('click', () => { this.audio.resume(); this.audio.playMenuClick(); this._startGame(); });
    document.getElementById('btnInstructions').addEventListener('click', () => { this.audio.playMenuClick(); this._showScreen('instructionsScreen'); });
    document.getElementById('btnHighScores').addEventListener('click', () => { this.audio.playMenuClick(); this._renderHighScores(); this._showScreen('highScoresScreen'); });
    document.getElementById('btnBackInst').addEventListener('click', () => { this.audio.playMenuClick(); this._showScreen('mainMenu'); });
    document.getElementById('btnBackScores').addEventListener('click', () => { this.audio.playMenuClick(); this._showScreen('mainMenu'); });
    document.getElementById('btnClearScores').addEventListener('click', () => {
      this.audio.playMenuClick();
      this.highScores = [];
      localStorage.removeItem('f1rush_scores');
      this._renderHighScores();
    });
    document.getElementById('btnResume').addEventListener('click', () => { this.audio.playMenuClick(); this._resume(); });
    document.getElementById('btnPauseMenu').addEventListener('click', () => { this.audio.playMenuClick(); this._goMenu(); });
    document.getElementById('btnRestart').addEventListener('click', () => { this.audio.playMenuClick(); this._restart(); });
    document.getElementById('btnGoMenu').addEventListener('click', () => { this.audio.playMenuClick(); this._goMenu(); });
  }

  _showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  _drawPreviewCar() {
    const cv = document.getElementById('previewCanvas');
    if (!cv) return;
    const cx = cv.getContext('2d');
    // Temp player car just for preview
    const tmp = new PlayerCar(cv);
    cx.clearRect(0, 0, cv.width, cv.height);
    cx.translate(cv.width / 2, cv.height / 2);
    tmp._drawF1Car(cx);
  }

  /* ── GAME LIFECYCLE ── */
  _startGame() {
    this.state       = 'playing';
    this.circuitIdx  = 0;
    this.circuitDist = 0;
    this.lap         = 1;
    this.score       = 0;
    this.scoreAccum  = 0;
    this.gameSpeed   = 3;
    this.speedTarget = 3;
    this.aiCars      = [];
    this.powerUps    = [];
    this.particles   = [];
    this.weather     = 'DRY';
    this.weatherTimer= 0;
    this.rainDrops   = [];
    this.aiSpawnTimer= 0;
    this.aiSpawnRate = 90;
    this.puSpawnTimer= 0;
    this.roadOffset  = 0;

    this.player = new PlayerCar(this.canvas);

    this._showScreen('gameScreen');
    document.getElementById('pauseOverlay').classList.add('hidden');
    document.getElementById('gameOverOverlay').classList.add('hidden');

    this._updateHUD();
    this._flashCircuit();

    this.audio.startEngine();

    if (this.raf) cancelAnimationFrame(this.raf);
    this._loop();
  }

  _pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    document.getElementById('pauseOverlay').classList.remove('hidden');
    this.audio.stopEngine();
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  }

  _resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    document.getElementById('pauseOverlay').classList.add('hidden');
    this.audio.startEngine();
    this._loop();
  }

  _gameOver() {
    this.state = 'gameover';
    this.audio.stopEngine();
    this.audio.playCrash();

    /* Save score */
    const isNew = this.score > this.bestScore;
    if (isNew) {
      this.bestScore = this.score;
      localStorage.setItem('f1rush_best', this.bestScore);
    }
    this.highScores.push({ score: this.score, date: new Date().toLocaleDateString() });
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 10);
    localStorage.setItem('f1rush_scores', JSON.stringify(this.highScores));

    /* Show game over screen after explosion */
    setTimeout(() => {
      document.getElementById('goScore').textContent = this.score;
      document.getElementById('goBest').textContent  = this.bestScore;
      document.getElementById('menuBest').textContent = this.bestScore;
      const nr = document.getElementById('newRecord');
      if (isNew) nr.classList.remove('hidden');
      else       nr.classList.add('hidden');
      document.getElementById('gameOverOverlay').classList.remove('hidden');
    }, 1200);
  }

  _restart() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this._startGame();
  }

  _goMenu() {
    this.state = 'menu';
    this.audio.stopEngine();
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    document.getElementById('menuBest').textContent = this.bestScore;
    this._showScreen('mainMenu');
  }

  /* ── MAIN LOOP ── */
  _loop() {
    this.raf = requestAnimationFrame(() => this._loop());
    if (this.state !== 'playing') return;
    this._update();
    this._draw();
  }

  /* ── UPDATE ── */
  _update() {
    const p = this.player;

    /* Sync touch to keys */
    this.keys['ArrowLeft']  = this.keys['ArrowLeft']  || this.touchState.left;
    this.keys['ArrowRight'] = this.keys['ArrowRight'] || this.touchState.right;
    if (this.touchState.boost && p) p.activateTurbo(this.audio);

    /* Ramp up game speed over time */
    this.speedTarget = 3 + Math.min(this.circuitDist / 1200, 9);
    this.gameSpeed   = lerp(this.gameSpeed, this.speedTarget, 0.004);

    /* Scroll offsets */
    const scrollRate = this.gameSpeed + (p ? p.speed : 0);
    this.roadOffset  = (this.roadOffset  + scrollRate)  % 80;
    this.grassOffset = (this.grassOffset + scrollRate * 0.6) % 60;

    /* Distance & laps */
    this.circuitDist += scrollRate * 0.15;
    if (this.circuitDist >= this.lapDist) {
      this.circuitDist -= this.lapDist;
      this.lap++;
      // Change circuit every 3 laps
      const newCircuit = ((this.lap - 1) % (CIRCUITS.length * 3)) < 3 ? 0
        : ((this.lap - 1) % (CIRCUITS.length * 3)) < 6 ? 1 : 2;
      if (newCircuit !== this.circuitIdx) {
        this.circuitIdx = newCircuit;
        this._flashCircuit();
      }
      // Random weather change
      if (Math.random() < 0.4) {
        this.weather = WEATHER_TYPES[randInt(0, WEATHER_TYPES.length - 1)];
      }
    }

    /* Score per distance */
    this.scoreAccum += scrollRate;
    if (this.scoreAccum >= 100) {
      const gained = Math.floor(this.scoreAccum / 100) * PTS_METER;
      this.score += gained * (p ? p.multiplier : 1);
      this.scoreAccum %= 100;
    }

    /* Rain */
    if (this.weather !== 'DRY') {
      const count = this.weather === 'STORM' ? 6 : 3;
      for (let i = 0; i < count; i++) {
        this.rainDrops.push({
          x: rand(0, CANVAS_W), y: -10,
          vx: rand(-1, 1), vy: rand(10, 18),
          len: rand(8, 18), alpha: rand(0.3, 0.7), life: 1
        });
      }
      this.rainDrops.forEach(d => { d.x += d.vx; d.y += d.vy; d.life -= 0.04; });
      this.rainDrops = this.rainDrops.filter(d => d.life > 0 && d.y < CANVAS_H + 20);
    } else {
      this.rainDrops = [];
    }

    /* Player update */
    if (p && !p.exploding) {
      p.update(this.keys, 60);
    }

    /* Spawn AI */
    this.aiSpawnTimer++;
    this.aiSpawnRate = Math.max(25, 90 - this.lap * 5);
    if (this.aiSpawnTimer >= this.aiSpawnRate) {
      this.aiSpawnTimer = 0;
      const occupiedLanes = new Set(this.aiCars.filter(c => c.y < 200).map(c => c.lane));
      const freeLanes = [0,1,2,3].filter(l => !occupiedLanes.has(l));
      if (freeLanes.length > 0) {
        const lane  = freeLanes[randInt(0, freeLanes.length - 1)];
        const speed = rand(1.5, 3 + this.lap * 0.25);
        this.aiCars.push(new AICar(lane, speed, this.gameSpeed, this.circuitIdx));
      }
    }

    /* Update AI */
    this.aiCars.forEach(c => c.update(this.gameSpeed));
    this.aiCars = this.aiCars.filter(c => !c.isOffScreen());

    /* Overtake scoring */
    this.aiCars.forEach(c => {
      if (!c.counted && p && c.y > p.y + p.h) {
        c.counted = true;
        this.score += PTS_OVERTAKE * (p.multiplier);
        this.audio.playOvertake();
      }
    });

    /* Spawn power-ups */
    this.puSpawnTimer++;
    if (this.puSpawnTimer >= this.puSpawnRate) {
      this.puSpawnTimer = 0;
      this.puSpawnRate  = randInt(200, 400);
      const lane = randInt(0, 3);
      this.powerUps.push(new PowerUp(lane));
    }

    /* Update power-ups */
    this.powerUps.forEach(pu => pu.update(this.gameSpeed));
    this.powerUps = this.powerUps.filter(pu => !pu.isOffScreen() && pu.collectAnim < 30);

    /* Collision: player vs AI */
    if (p && !p.exploding && !p.invincible) {
      this.aiCars.forEach(c => {
        if (rectOverlap(p.x + 3, p.y + 4, p.w - 6, p.h - 8, c.x + 3, c.y + 4, c.w - 6, c.h - 8)) {
          const dead = p.takeDamage();
          if (dead) {
            this.audio.playCrash();
            setTimeout(() => this._gameOver(), 900);
          } else {
            this.audio.playCrash();
          }
          // Nudge AI out
          c.y -= 20;
        }
      });
    }

    /* Collision: player vs power-up */
    if (p && !p.exploding) {
      this.powerUps.forEach(pu => {
        if (pu.collected) return;
        if (rectOverlap(p.x, p.y, p.w, p.h, pu.x, pu.y, pu.w, pu.h)) {
          pu.collect();
          this.score += PTS_POWERUP * p.multiplier;
          this.audio.playPowerUp(pu.type);
          if (pu.type === 'turbo') {
            p.turbo = TURBO_MAX;
            p.activateTurbo(this.audio);
          } else if (pu.type === 'shield') {
            p.applyShield(300);
          } else {
            p.applyMultiplier(2, 480);
          }
          this._updateActivePowerup(pu.type);
        }
      });
    }

    /* Speed lines */
    this.speedLines.forEach(l => {
      l.y += l.speed * (this.gameSpeed / 3);
      if (l.y > CANVAS_H) { l.y = -l.len; l.x = rand(0, CANVAS_W); }
    });

    /* Engine audio feedback */
    if (p) {
      this.audio.setEngineRPM(p.speed / p.maxSpeed);
    }

    this._updateHUD();
  }

  /* ── DRAW ── */
  _draw() {
    const ctx = this.ctx;
    const circuit = CIRCUITS[this.circuitIdx];
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    this._drawTrack(ctx, circuit);
    this._drawSpeedLines(ctx);
    if (this.weather !== 'DRY') this._drawRain(ctx);

    // Power-ups (below cars)
    this.powerUps.forEach(pu => pu.draw(ctx));

    // AI cars
    this.aiCars.forEach(c => c.draw(ctx));

    // Player
    if (this.player) {
      this.player.draw(ctx, this.weather);
    }
  }

  /* ── DRAW TRACK ── */
  _drawTrack(ctx, circuit) {
    const t = circuit.theme;

    /* Grass left */
    ctx.fillStyle = t.grass;
    ctx.fillRect(0, 0, TRACK_LEFT, CANVAS_H);

    /* Grass right */
    ctx.fillRect(TRACK_LEFT + TRACK_W, 0, CANVAS_W - TRACK_LEFT - TRACK_W, CANVAS_H);

    /* Grass texture stripes */
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let y = -60 + (this.grassOffset % 60); y < CANVAS_H; y += 60) {
      ctx.fillRect(0, y, TRACK_LEFT, 30);
      ctx.fillRect(TRACK_LEFT + TRACK_W, y, CANVAS_W - TRACK_LEFT - TRACK_W, 30);
    }

    /* Asphalt */
    ctx.fillStyle = t.asphalt;
    ctx.fillRect(TRACK_LEFT, 0, TRACK_W, CANVAS_H);

    /* Track vignette */
    const tvg = ctx.createLinearGradient(TRACK_LEFT, 0, TRACK_LEFT + TRACK_W, 0);
    tvg.addColorStop(0, 'rgba(0,0,0,0.08)');
    tvg.addColorStop(0.08, 'rgba(0,0,0,0)');
    tvg.addColorStop(0.92, 'rgba(0,0,0,0)');
    tvg.addColorStop(1, 'rgba(0,0,0,0.08)');
    ctx.fillStyle = tvg;
    ctx.fillRect(TRACK_LEFT, 0, TRACK_W, CANVAS_H);

    /* Animated centre dashes */
    ctx.strokeStyle = t.line;
    ctx.lineWidth   = 3;
    ctx.setLineDash([40, 40]);
    ctx.lineDashOffset = -this.roadOffset;
    ctx.beginPath();
    ctx.moveTo(TRACK_LEFT + TRACK_W / 2, 0);
    ctx.lineTo(TRACK_LEFT + TRACK_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    /* Lane dividers (thin dashes) */
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([20, 30]);
    ctx.lineDashOffset = -this.roadOffset;
    for (let l = 1; l < LANE_COUNT; l++) {
      if (l === LANE_COUNT / 2) continue;
      const lx = TRACK_LEFT + l * LANE_W;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, CANVAS_H);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    /* Track borders */
    ctx.fillStyle = '#333';
    ctx.fillRect(TRACK_LEFT - 2, 0, 2, CANVAS_H);
    ctx.fillRect(TRACK_LEFT + TRACK_W, 0, 2, CANVAS_H);

    /* Kerb stripes */
    this._drawKerbs(ctx, t.barrier);

    /* Armco barriers */
    ctx.fillStyle = '#BBBBBB';
    ctx.fillRect(TRACK_LEFT - 10, 0, 8, CANVAS_H);
    ctx.fillRect(TRACK_LEFT + TRACK_W + 2, 0, 8, CANVAS_H);
    // Barrier red/white stripes
    ctx.fillStyle = t.barrier;
    for (let ky = -(this.roadOffset % 40); ky < CANVAS_H; ky += 40) {
      ctx.fillRect(TRACK_LEFT - 10, ky, 8, 20);
      ctx.fillRect(TRACK_LEFT + TRACK_W + 2, ky + 20, 8, 20);
    }
  }

  _drawKerbs(ctx, color) {
    const kw = 10;
    const stripeH = 18;
    for (let ky = -(this.roadOffset % (stripeH * 2)); ky < CANVAS_H; ky += stripeH * 2) {
      ctx.fillStyle = color;
      ctx.fillRect(TRACK_LEFT - kw - 2, ky, kw, stripeH);
      ctx.fillStyle = '#fff';
      ctx.fillRect(TRACK_LEFT - kw - 2, ky + stripeH, kw, stripeH);
      ctx.fillStyle = color;
      ctx.fillRect(TRACK_LEFT + TRACK_W + 2, ky + stripeH, kw, stripeH);
      ctx.fillStyle = '#fff';
      ctx.fillRect(TRACK_LEFT + TRACK_W + 2, ky, kw, stripeH);
    }
  }

  _drawSpeedLines(ctx) {
    if (!this.player) return;
    const speedFactor = this.player.speed / this.player.maxSpeed;
    if (speedFactor < 0.45) return;
    ctx.save();
    ctx.globalAlpha = (speedFactor - 0.45) * 0.35;
    ctx.strokeStyle = 'rgba(80,80,80,0.25)';
    ctx.lineWidth = 1;
    this.speedLines.forEach(l => {
      const alpha = (speedFactor - 0.45) * 0.4;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x, l.y + l.len * speedFactor);
      ctx.stroke();
    });
    ctx.restore();
  }

  _drawRain(ctx) {
    ctx.save();
    ctx.strokeStyle = this.weather === 'STORM' ? 'rgba(180,210,255,0.7)' : 'rgba(180,210,255,0.45)';
    ctx.lineWidth = 1;
    this.rainDrops.forEach(d => {
      ctx.globalAlpha = d.alpha * d.life;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.vx * 2, d.y + d.len);
      ctx.stroke();
    });
    ctx.restore();
  }

  /* ── HUD UPDATE ── */
  _updateHUD() {
    const p = this.player;
    if (!p) return;

    document.getElementById('hudScore').textContent  = this.score;
    document.getElementById('hudBest').textContent   = Math.max(this.score, this.bestScore);
    document.getElementById('hudLap').textContent    = this.lap;
    document.getElementById('hudSpeed').textContent  = Math.round(180 + p.speed * 28);
    document.getElementById('hudCircuit').textContent= CIRCUITS[this.circuitIdx].name;
    document.getElementById('hudWeather').textContent= (this.weather === 'DRY' ? '☀' : this.weather === 'WET' ? '🌧' : '⛈') + ' ' + this.weather;

    /* Turbo bar */
    const pct = p.turbo / TURBO_MAX;
    document.getElementById('turboFill').style.width = (pct * 100) + '%';
    const turboStatus = document.getElementById('turboStatus');
    if (p.turboOn) {
      turboStatus.textContent = 'ACTIVE';
      turboStatus.style.color = '#FF6B35';
    } else if (pct >= 0.15) {
      turboStatus.textContent = 'READY';
      turboStatus.style.color = '#E10600';
    } else {
      turboStatus.textContent = 'CHARGING';
      turboStatus.style.color = '#aaa';
    }

    /* Lives */
    const livesEl = document.getElementById('hudLives');
    livesEl.innerHTML = '';
    for (let i = 0; i < NUM_LIVES; i++) {
      const heart = document.createElement('span');
      heart.className = 'life-heart';
      heart.textContent = i < p.lives ? '❤' : '🖤';
      livesEl.appendChild(heart);
    }
  }

  _updateActivePowerup(type) {
    const el = document.getElementById('activePowerup');
    if (!el) return;
    const labels = { turbo:'⚡ TURBO', shield:'🛡 SHIELD', multiplier:'×2 MULTI' };
    const colors = { turbo:'#FF6B35', shield:'#3B82F6', multiplier:'#10B981' };
    el.textContent  = labels[type] || '—';
    el.style.color  = colors[type] || '#333';
    el.style.borderColor = colors[type] || '#ddd';
    setTimeout(() => {
      if (el) { el.textContent = '—'; el.style.color = ''; el.style.borderColor = ''; }
    }, 8000);
  }

  _flashCircuit() {
    const el   = document.getElementById('circuitFlash');
    const name = document.getElementById('cfName');
    if (!el || !name) return;
    name.textContent = CIRCUITS[this.circuitIdx].name;
    el.classList.remove('hidden');
    el.style.animation = 'none';
    void el.offsetWidth; // reflow
    el.style.animation = '';
    setTimeout(() => el.classList.add('hidden'), 2600);
    document.getElementById('hudCircuit').textContent = CIRCUITS[this.circuitIdx].name;
  }

  _renderHighScores() {
    const list = document.getElementById('scoresList');
    if (!list) return;
    if (!this.highScores.length) {
      list.innerHTML = '<div class="no-scores">No races yet. Hit the track!</div>';
      return;
    }
    list.innerHTML = this.highScores.map((s, i) =>
      `<div class="score-entry">
        <span class="score-rank">#${i+1}</span>
        <span class="score-pts">${s.score} PTS</span>
        <span class="score-date">${s.date}</span>
      </div>`
    ).join('');
    document.getElementById('menuBest').textContent = this.bestScore;
  }
}

/* ════════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
