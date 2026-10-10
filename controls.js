// Voice + gesture control for the cooking companion.
// Voice: Web Speech API (SpeechRecognition + speechSynthesis).
// Gestures: MediaPipe Tasks Vision GestureRecognizer, running on the camera feed.

import { DEFAULT_SETTINGS } from './data.js';

const KEY = 'letscook.settings.v1';

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    const s = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_SETTINGS), ...s,
      gestureMap: { ...DEFAULT_SETTINGS.gestureMap, ...s.gestureMap },
      gestureEnabled: { ...DEFAULT_SETTINGS.gestureEnabled, ...s.gestureEnabled },
      phrases: { ...DEFAULT_SETTINGS.phrases, ...s.phrases } };
  } catch { return structuredClone(DEFAULT_SETTINGS); }
}
export function saveSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
export function resetSettings() { try { localStorage.removeItem(KEY); } catch {} return structuredClone(DEFAULT_SETTINGS); }

// ---------------- Speaker ----------------
export const Speaker = {
  speaking: false,
  quietUntil: 0,
  rate: 1,
  voice: null,
  pickVoice() {
    const vs = speechSynthesis.getVoices();
    this.voice = vs.find(v => /en-IN/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  },
  say(text, { onEnd } = {}) {
    if (!('speechSynthesis' in window)) { onEnd && onEnd(); return; }
    speechSynthesis.cancel();
    if (!this.voice) this.pickVoice();
    const u = new SpeechSynthesisUtterance(text);
    if (this.voice) u.voice = this.voice;
    u.rate = this.rate;
    u.onstart = () => { this.speaking = true; };
    u.onend = u.onerror = () => { this.speaking = false; this.quietUntil = performance.now() + 600; onEnd && onEnd(); };
    speechSynthesis.speak(u);
  },
  stop() { if ('speechSynthesis' in window) speechSynthesis.cancel(); this.speaking = false; },
  isBusy() { return this.speaking || performance.now() < this.quietUntil; },
};
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => Speaker.pickVoice();

// ---------------- Voice ----------------
const norm = s => s.toLowerCase().replace(/[’']/g, "'").replace(/[.,!?"“”]/g, ' ').replace(/\s+/g, ' ').trim();

export class VoiceControl {
  constructor() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.supported = !!SR;
    this.SR = SR;
    this.active = false;
    this.onCommand = () => {}; this.onHeard = () => {}; this.onUnknown = () => {}; this.onState = () => {};
    this.settings = loadSettings();
  }
  setSettings(s) { this.settings = s; }
  lang() { return this.settings.language === 'हिन्दी' ? 'hi-IN' : 'en-IN'; }
  match(text) {
    let t = norm(text);
    if (this.settings.requireWakeWord) {
      const w = norm(this.settings.wakeWord);
      const i = t.indexOf(w);
      if (i < 0) return { wake: false };
      t = t.slice(i + w.length).trim();
    }
    let best = null;
    for (const [action, phrases] of Object.entries(this.settings.phrases)) {
      for (const p of phrases) {
        const q = norm(p);
        if (!q) continue;
        const re = new RegExp('(^|\\s)' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\s|$)');
        if (re.test(t) && (!best || q.length > best.len)) best = { action, len: q.length };
      }
    }
    return { wake: true, action: best && best.action, text: t };
  }
  start() {
    if (!this.supported || this.active) return;
    this.active = true;
    this._spawn();
  }
  _spawn() {
    if (!this.active) return;
    const r = new this.SR();
    r.lang = this.lang();
    r.continuous = true;
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.onstart = () => this.onState('listening');
    r.onresult = e => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (!e.results[i].isFinal) continue;
        if (Speaker.isBusy()) continue; // ignore our own voice
        const alts = [...e.results[i]].map(a => a.transcript);
        this.onHeard(alts[0]);
        let hit = null;
        for (const a of alts) { const m = this.match(a); if (m.action) { hit = m.action; break; } }
        if (hit) this.onCommand(hit, 'voice');
        else if (norm(alts[0]).split(' ').length <= 5) this.onUnknown(alts[0]);
      }
    };
    r.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { this.active = false; this.onState('blocked'); } };
    r.onend = () => { if (this.active) setTimeout(() => this._spawn(), 250); else this.onState('off'); };
    this.rec = r;
    try { r.start(); } catch { setTimeout(() => this._spawn(), 500); }
  }
  stop() { this.active = false; try { this.rec && this.rec.stop(); } catch {} this.onState('off'); }
  // One-shot listen, used for voice search.
  listenOnce(onText, onEnd) {
    if (!this.supported) { onEnd && onEnd('unsupported'); return; }
    const r = new this.SR();
    r.lang = this.lang(); r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = e => onText(e.results[0][0].transcript);
    r.onend = () => onEnd && onEnd();
    r.onerror = e => onEnd && onEnd(e.error);
    try { r.start(); } catch {}
    return r;
  }
}

// ---------------- Gestures ----------------
const VISION = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';
const MP_TO_ID = { Thumb_Up: 'thumb', Closed_Fist: 'fist', Open_Palm: 'open', Pointing_Up: 'one', Victory: 'v' };

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function isOkSign(lm) {
  const palm = dist(lm[0], lm[9]);
  const touching = dist(lm[4], lm[8]) < palm * 0.3;
  const up = (tip, pip) => lm[tip].y < lm[pip].y;
  return touching && up(12, 10) && up(16, 14) && up(20, 18);
}

export class GestureControl {
  constructor() {
    this.supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    this.ready = false; this.running = false;
    this.onCommand = () => {}; this.onFrame = () => {}; this.onState = () => {};
    this.settings = loadSettings();
    this.current = 'none'; this.since = 0; this.fired = false; this.lastFire = 0;
  }
  setSettings(s) { this.settings = s; }
  async load() {
    if (this.ready) return;
    this.onState('loading');
    const { GestureRecognizer, FilesetResolver } = await import(VISION + '/vision_bundle.mjs');
    const fs = await FilesetResolver.forVisionTasks(VISION + '/wasm');
    const opts = d => ({ baseOptions: { modelAssetPath: MODEL, delegate: d }, runningMode: 'VIDEO', numHands: 1 });
    try { this.rec = await GestureRecognizer.createFromOptions(fs, opts('GPU')); }
    catch { this.rec = await GestureRecognizer.createFromOptions(fs, opts('CPU')); }
    this.ready = true;
  }
  async start(video) {
    if (!this.supported) { this.onState('unsupported'); return; }
    this.video = video;
    if (!this.stream) {
      try { this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false }); }
      catch (e) { this.onState('blocked'); throw e; }
    }
    video.srcObject = this.stream;
    video.muted = true; video.playsInline = true;
    await video.play().catch(() => {});
    await this.load();
    this.running = true;
    this.onState('on');
    this._loop();
  }
  attach(video) { // move the live feed to another <video>
    this.video = video;
    if (this.stream) { video.srcObject = this.stream; video.muted = true; video.playsInline = true; video.play().catch(() => {}); }
  }
  _loop() {
    if (!this.running) return;
    const v = this.video;
    if (v && v.readyState >= 2 && v.currentTime !== this._lastT) {
      this._lastT = v.currentTime;
      const now = performance.now();
      let id = 'none', score = 0, hand = null;
      try {
        const res = this.rec.recognizeForVideo(v, now);
        const g = res.gestures && res.gestures[0] && res.gestures[0][0];
        const lm = res.landmarks && res.landmarks[0];
        const hand = res.handednesses && res.handednesses[0] && res.handednesses[0][0] && res.handednesses[0][0].categoryName;
        const handOk = this.settings.hand === 'Both' || !hand || hand === this.settings.hand;
        const thr = 0.85 - 0.4 * this.settings.sensitivity;
        if (g && handOk && g.score >= thr && MP_TO_ID[g.categoryName]) { id = MP_TO_ID[g.categoryName]; score = g.score; }
        if (lm && handOk && isOkSign(lm)) { id = 'ok'; score = 0.9; }
        hand = lm || null;
      } catch {}
      this.landmarks = hand;
      if (id !== 'none' && !this.settings.gestureEnabled[id]) id = 'none';
      if (id !== this.current) { this.current = id; this.since = now; this.fired = false; }
      const hold = this.settings.holdMs;
      const progress = id === 'none' ? 0 : Math.min(1, (now - this.since) / hold);
      this.onFrame(id, progress, hand);
      if (id !== 'none' && !this.fired && now - this.since >= hold && now - this.lastFire > 1200) {
        this.fired = true; this.lastFire = now;
        const action = this.settings.gestureMap[id];
        if (action && action !== 'none') this.onCommand(action, 'gesture', id);
        else this.onCommand('__gesture', 'gesture', id);
      }
    }
    this.raf = requestAnimationFrame(() => this._loop());
  }
  stop() {
    this.running = false; cancelAnimationFrame(this.raf);
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
    this.onState('off');
  }
}

// Hand skeleton: 21 MediaPipe landmarks joined into fingers and palm.
const HAND_LINKS = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];
const TIPS = new Set([4, 8, 12, 16, 20]);

// Draws the hand over a mirrored, object-fit:cover <video>, matching the crop exactly.
export function drawSkeleton(canvas, video, lm, { active = false, progress = 0 } = {}) {
  if (!canvas || !video) return;
  const W = canvas.clientWidth, H = canvas.clientHeight, dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (!lm || !video.videoWidth) return;
  const vw = video.videoWidth, vh = video.videoHeight, s = Math.max(W / vw, H / vh);
  const ox = (W - vw * s) / 2, oy = (H - vh * s) / 2;
  const P = p => [W - (ox + p.x * vw * s), oy + p.y * vh * s]; // mirrored like the preview
  const small = W < 240;
  const line = active ? '#3DDC97' : 'rgba(255,255,255,0.9)';
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.lineWidth = small ? 2 : 5; ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  for (const [a, b] of HAND_LINKS) { const [x1, y1] = P(lm[a]), [x2, y2] = P(lm[b]); ctx.beginPath(); ctx.moveTo(x1, y1 + 1); ctx.lineTo(x2, y2 + 1); ctx.stroke(); }
  ctx.lineWidth = small ? 1.6 : 4; ctx.strokeStyle = line;
  for (const [a, b] of HAND_LINKS) { const [x1, y1] = P(lm[a]), [x2, y2] = P(lm[b]); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  lm.forEach((p, i) => {
    const [x, y] = P(p); const r = (small ? 2 : 5) * (TIPS.has(i) ? 1.4 : 1);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = TIPS.has(i) ? '#EF8A3C' : '#FFFFFF'; ctx.fill();
    ctx.lineWidth = small ? 1 : 2; ctx.strokeStyle = active ? '#27845F' : 'rgba(0,0,0,0.35)'; ctx.stroke();
  });
  if (active && progress > 0 && !small) { // hold-progress ring around the wrist
    const [x, y] = P(lm[0]);
    ctx.beginPath(); ctx.arc(x, y, 26, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.lineWidth = 6; ctx.strokeStyle = '#27845F'; ctx.stroke();
  }
}

// Short chime for timers.
export function chime() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach((t, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = [880, 1046, 1318][i]; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, ac.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.3, ac.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t + 0.35);
      o.connect(g).connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.4);
    });
  } catch {}
}
