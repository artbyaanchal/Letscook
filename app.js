import { RECIPES, MEALS, QUICK_FILTERS, CAKE, ACTIONS, GESTURES, SAY } from './data.js';
import { loadSettings, saveSettings, resetSettings, Speaker, VoiceControl, GestureControl, chime, drawSkeleton } from './controls.js';

// ---------------------------------------------------------------- helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const photo = k => `assets/photos/${k}.jpg`;
const gimg = k => `assets/gestures/${k}.png`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const P = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  palm: '<rect x="7" y="11.5" width="10" height="10" rx="4.5"/><path d="M7.6 15.2 3.6 11.8"/><path d="M9.3 11.5 7.9 4.6"/><path d="M12 11.5V3"/><path d="M14.7 11.5 16.1 4.6"/><path d="M16.6 13.4 20.2 8.6"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  vol: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  chef: '<path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
};
const ic = (n, s = 20, c = 'currentColor', w = 2) => `<svg class="icon" width="${s}" height="${s}" style="width:${s}px;height:${s}px" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
function fmtQty(q) {
  const whole = Math.floor(q + 1e-6), frac = q - whole;
  const map = [[0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']];
  let best = map[0], d = 9;
  for (const m of map) { const dd = Math.abs(frac - m[0]); if (dd < d) { d = dd; best = m; } }
  const w = best[0] === 1 ? whole + 1 : whole;
  return (w ? String(w) : '') + best[1] || '0';
}
const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// ---------------------------------------------------------------- state
const state = {
  settings: loadSettings(),
  servings: 6,
  have: Object.fromEntries(CAKE.ingredients.map(i => [i.id, i.have])),
  order: Object.fromEntries(CAKE.ingredients.map(i => [i.id, !i.have])),
  mode: { gesture: true, voice: true },
  setup: { gesture: false, voice: false },
  prep: 0, step: 0, paused: false, help: false,
  timer: { left: 0, total: 0, running: false, done: false, step: -1 },
  touches: 0, started: 0,
  voiceState: 'off', gestureState: 'off',
};
const voice = new VoiceControl();
const gesture = new GestureControl();
voice.setSettings(state.settings); gesture.setSettings(state.settings);
Speaker.rate = 0.75 + state.settings.speechRate * 0.6;

let handler = null; // current page's command handler
function dispatch(action, source, gid) {
  if (handler) handler(action, source, gid);
}
voice.onCommand = (a, s) => { flashHeard('Got it!'); dispatch(a, s); };
voice.onHeard = t => flashHeard('“' + t + '”');
voice.onUnknown = () => { if (handler && handler.wantsUnknown) notUnderstood('voice'); };
voice.onState = s => { state.voiceState = s; updateStatus(); };
gesture.onCommand = (a, s, gid) => dispatch(a, s, gid);
gesture.onState = s => { state.gestureState = s; updateStatus(); };
gesture.onFrame = (id, p, lm) => {
  const active = id !== 'none';
  const ring = $('.mini-cam .ring');
  if (ring) ring.style.borderColor = active ? `rgba(39,132,95,${0.3 + p * 0.7})` : lm ? 'rgba(255,255,255,.6)' : 'transparent';
  drawSkeleton($('#cvs'), $('#cv'), lm, { active, progress: p });
  drawSkeleton($('#mcs'), $('#mc'), lm, { active, progress: p });
  const det = $('#det');
  if (det) {
    const g = GESTURES.find(x => x.id === id);
    det.textContent = g ? `${g.name} detected` : lm ? 'Hand detected. Show a sign' : 'Show your hand to the camera';
    det.style.background = g ? '#7BE0A8' : lm ? '#FFF4C7' : '#fff';
  }
  const mt = $('#mctext');
  if (mt) mt.textContent = active ? GESTURES.find(x => x.id === id).name : lm ? 'Hand seen' : 'No hand';
};

// ---------------------------------------------------------------- toasts
let toastT, heardT;
function toast(title, sub, kind = '') {
  const t = $('#toast');
  t.className = 'toast ' + kind;
  t.innerHTML = `<div class="badge" style="background:${kind === 'ok' ? 'var(--mint)' : 'var(--peach)'}">${ic('chat', 26, kind === 'ok' ? 'var(--green)' : 'var(--orange)')}</div><div><b>${esc(title)}</b><small>${esc(sub || '')}</small></div>`;
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.add('hide'), 4500);
}
function flashHeard(text) {
  const h = $('#heard'); h.textContent = text; h.classList.remove('hide');
  clearTimeout(heardT); heardT = setTimeout(() => h.classList.add('hide'), 1800);
}
function notUnderstood(src) {
  toast('Sorry, I didn’t catch that.', 'Try saying ‘Next’, ‘Repeat’ or ‘Help’, or show a thumbs up.');
  if (src === 'voice') Speaker.say(SAY.notUnderstood);
}
function say(t) { if (state.settings.readAloud) Speaker.say(t); }

// ---------------------------------------------------------------- shared chrome
function nav(active) {
  const L = [['#/', 'Home'], ['#/explore', 'Explore Recipes'], ['#/how', 'How It Works'], ['#/kitchen', 'My Kitchen']];
  return `<header class="nav"><div class="wrap"><a href="#/" aria-label="Let's Cook home"><img class="logo" src="assets/logo.png" alt="Let's Cook"></a>
  <nav class="links">${L.map(([h, l]) => `<a href="${h}" class="${l === active ? 'on' : ''}">${l}</a>`).join('')}</nav>
  <div class="right"><a class="icon-btn" href="#/explore" aria-label="Search">${ic('search', 18)}</a><a class="avatar" href="#/settings" aria-label="Profile & settings">A</a></div></div></header>`;
}
function footer() {
  return `<footer><div class="wrap"><div class="cols"><div><img class="logo" style="height:36px;align-self:flex-start" src="assets/logo.png" alt="Let's Cook"><span class="muted">You cook. I’ll guide.</span></div>
  <div><h4>Explore</h4>${['Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Desserts'].map(m => `<a href="#/explore?meal=${m}">${m}</a>`).join('')}</div>
  <div><h4>Cooking companion</h4><a href="#/how">How it works</a><a href="#/how">Voice commands</a><a href="#/how">Hand gestures</a></div>
  <div><h4>My Kitchen</h4><a href="#/kitchen">Saved recipes</a><a href="#/kitchen">Shopping list</a><a href="#/kitchen">Recently cooked</a></div>
  <div><h4>Help</h4><a href="#/settings">Profile & settings</a><a href="#/how">Contact us</a></div></div>
  <div class="bottom"><span>© 2026 Let’s Cook</span><span>Ingredients are ordered and paid for on Blinkit.</span></div></div></footer>`;
}
function card(r) {
  return `<a class="card" href="#/recipe/${r.id}"><div class="ph"><img src="${photo(r.photo)}" alt="${esc(r.name)}"><span class="heart" aria-hidden="true">${ic('heart', 18)}</span></div>
  <span class="chip" style="align-self:flex-start">${r.meal}</span><h3>${esc(r.name)}</h3><span class="meta">${ic('clock', 16)} ${r.time} min · ${r.level}</span></a>`;
}

// ---------------------------------------------------------------- pages
const pages = {};

pages.home = () => ({
  html: `${nav('Home')}<main class="wrap">
  <section class="hero"><div class="hero-text"><div class="top">
    <span class="eyebrow">Your personal cooking companion</span>
    <h1>You cook.<br><span>I’ll guide.</span></h1>
    <p class="muted" style="font-size:18px">Found a recipe you love? Let’s make it together.</p>
    <form class="search" id="hs"><span class="s-ic">${ic('search', 20, 'var(--muted)')}</span><input id="hq" placeholder="What would you like to cook?" aria-label="Search recipes"><button class="btn btn-green">Find my recipe</button></form>
    <button class="voice-line" id="hv">${ic('mic', 20, 'var(--orange)')} <span id="hvt">Or tell me what you’re craving</span></button></div>
    <div class="controls-strip"><div class="it"><span class="badge">${ic('mic', 22, 'var(--orange)')}</span><div><b>Voice input</b><small>Say “Next” or “Repeat”</small></div></div><span class="sep"></span>
    <div class="it"><span class="badge">${ic('palm', 22, 'var(--orange)')}</span><div><b>Gesture control</b><small>Show a hand sign</small></div></div></div></div>
    <div class="hero-visual"><img src="${photo('batter')}" alt="Whisking cake batter"><div class="step-card"><small>Eggless Vanilla Sponge Cake · Step 1 of 7</small><b>Whisk the batter until smooth</b><div class="segs">${'<i class="on"></i>' + '<i></i>'.repeat(6)}</div></div></div></section>
  <section class="section"><div class="sec-head"><h2>What are we cooking today?</h2><a class="link" href="#/explore">See all ${ic('arrow', 16)}</a></div>
    <div class="cats">${[['dosa', 'Breakfast'], ['paneer', 'Lunch'], ['pavbhaji', 'Snacks'], ['biryani', 'Dinner'], ['cake', 'Desserts'], ['idli', 'Quick & Easy']].map(([p, m]) => `<a class="cat" href="#/explore?${m === 'Quick & Easy' ? 'quick=' : 'meal='}${encodeURIComponent(m)}"><img src="${photo(p)}" alt="">${m}</a>`).join('')}</div></section>
  <section class="section"><div class="sec-head"><h2>Popular this week</h2><a class="link" href="#/explore">See all ${ic('arrow', 16)}</a></div>
    <div class="grid4">${['dosa', 'paneer', 'pavbhaji', 'cake'].map(id => card(RECIPES.find(r => r.id === id))).join('')}</div></section>
  <section class="section"><div class="panel companion"><div><h2>Your Kitchen Companion</h2><p class="muted" style="margin-bottom:24px">You give the cue. I’ll guide you through.</p><a class="btn btn-green" href="#/how">See how it works ${ic('arrow', 18)}</a></div>
    <div class="g3">${GESTURES.slice(0, 3).map(g => `<div class="gcard"><img src="${gimg(g.photo)}" alt="${g.name}"><b>${g.name}</b><small>${ACTIONS[state.settings.gestureMap[g.id]]}</small></div>`).join('')}</div></div></section>
  <section class="two"><a class="mini" href="#/check"><img src="${photo('ing-maida')}" alt=""><div><h3>Missing something?</h3><p class="muted" style="margin:6px 0 8px">Order what you need through Blinkit.</p><span class="link">Check ingredients ${ic('arrow', 16)}</span></div></a>
    <a class="mini" href="#/kitchen"><img src="${photo('biryani')}" alt=""><div><h3>My Kitchen</h3><p class="muted" style="margin:6px 0 8px">Your saved and recently cooked recipes.</p><span class="link">Explore My Kitchen ${ic('arrow', 16)}</span></div></a></section>
  <section class="closing"><h2>Ready to make something delicious?</h2><p class="muted">Pick a recipe. I’ll take it one step at a time.</p><a class="btn btn-green" href="#/recipe/cake">Let’s cook! ${ic('arrow', 18)}</a></section>
  </main>${footer()}`,
  mount() {
    $('#hs').onsubmit = e => { e.preventDefault(); location.hash = '#/explore?q=' + encodeURIComponent($('#hq').value); };
    $('#hv').onclick = () => voiceSearch($('#hvt'), q => location.hash = '#/explore?q=' + encodeURIComponent(q));
  },
});

function voiceSearch(labelEl, done) {
  if (!voice.supported) { labelEl.textContent = 'Voice search needs Chrome or Edge'; return; }
  const old = labelEl.textContent; labelEl.textContent = 'I’m listening… What would you like to make?';
  voice.listenOnce(t => { labelEl.textContent = '“' + t + '”'; done(t.replace(/[.?!]/g, '')); }, err => { if (err) labelEl.textContent = old; });
}

pages.explore = (q) => {
  const meal = q.get('meal') || 'All', quick = q.get('quick') || '', text = (q.get('q') || '').toLowerCase().trim();
  // Prototype: every search leads to the cake, the one recipe with a full cook-along.
  const list = text ? RECIPES.filter(r => r.id === 'cake') : RECIPES.filter(r => (meal === 'All' || r.meal === meal)
    && (!quick || (quick === 'Quick & Easy' ? r.time <= 35 && r.level === 'Easy' : quick === 'Vegetarian' ? r.veg : r.time < 30 + 1))
    && (!text || r.name.toLowerCase().includes(text) || r.meal.toLowerCase().includes(text) || text.split(' ').some(w => w.length > 2 && r.name.toLowerCase().includes(w))));
  const link = (k, v) => { const n = new URLSearchParams(q); if (v) n.set(k, v); else n.delete(k); return '#/explore?' + n.toString(); };
  return {
    html: `${nav('Explore Recipes')}<main class="wrap"><h1 class="page-title">Here’s what you could make</h1>
    <div style="display:flex;gap:12px;align-items:center"><form class="search" id="es" style="flex:1"><span class="s-ic">${ic('search', 20, 'var(--muted)')}</span><input id="eq" value="${esc(q.get('q') || '')}" placeholder="Search a dish, an ingredient or a cuisine" aria-label="Search"><button class="btn btn-green">Search</button></form>
    <button class="icon-btn" id="ev" style="width:52px;height:52px" aria-label="Voice search">${ic('mic', 22, 'var(--orange)')}</button></div>
    <p class="muted" id="evt" style="min-height:22px;margin-top:8px"></p>
    <div class="filters">${MEALS.map(m => `<a class="pill ${m === meal ? 'on' : ''}" href="${link('meal', m === 'All' ? '' : m)}">${m}</a>`).join('')}<span class="div"></span>
    ${QUICK_FILTERS.map(f => `<a class="pill ${f === quick ? 'on' : ''}" href="${link('quick', f === quick ? '' : f)}">${f}</a>`).join('')}</div>
    <p class="muted" style="margin:8px 0 24px">${list.length} recipe${list.length === 1 ? '' : 's'}</p>
    ${list.length ? `<div class="grid4" style="padding-bottom:64px">${list.map(card).join('')}</div>` : `<p class="empty">I couldn’t find that dish. Let’s try another name or ingredient.</p>`}
    </main>${footer()}`,
    mount() {
      $('#es').onsubmit = e => { e.preventDefault(); location.hash = link('q', $('#eq').value); };
      $('#ev').onclick = () => voiceSearch($('#evt'), t => location.hash = link('q', t));
    },
  };
};

pages.recipe = (q, id) => {
  if (id !== 'cake') {
    const r = RECIPES.find(x => x.id === id) || RECIPES[0];
    return { html: `${nav('Explore Recipes')}<main class="wrap"><div class="recipe"><div class="photo"><img src="${photo(r.photo)}" alt="${esc(r.name)}" style="height:560px"></div>
      <div><span class="eyebrow">${r.meal}</span><h1>${esc(r.name)}</h1><p class="muted">${ic('clock', 16)} ${r.time} min · ${r.level}</p>
      <div class="panel" style="padding:28px;margin-top:28px"><h3 style="font-size:22px;margin-bottom:8px">Cook-along is coming soon for this dish</h3><p class="muted" style="margin-bottom:20px">Try the full step-by-step companion with our Eggless Vanilla Sponge Cake.</p><a class="btn btn-green" href="#/recipe/cake">Open the cake recipe ${ic('arrow', 18)}</a></div></div></div></main>${footer()}` };
  }
  return {
    html: `${nav('Explore Recipes')}<main class="wrap"><div class="recipe"><div class="photo"><img src="${photo('cake')}" alt="Eggless vanilla sponge cake"></div>
    <div><span class="eyebrow">Desserts · Baking</span><h1>${CAKE.name}</h1><p class="muted" style="font-size:17px;line-height:1.6">${CAKE.intro}</p>
    <div class="stats"><div class="stat">${ic('clock')}<b>${CAKE.prep} min</b><small>Prep</small></div><div class="stat">${ic('flame')}<b>${CAKE.bake} min</b><small>Bake</small></div><div class="stat">${ic('users')}<b>${CAKE.serves}</b><small>Serves</small></div><div class="stat">${ic('chef')}<b>${CAKE.level}</b><small>Level</small></div></div>
    <h3 style="font-size:17px;color:var(--deep);margin-bottom:12px">Ingredients</h3>
    <div class="ing-list">${CAKE.ingredients.map(i => `<div><span>${i.name}</span><b>${i.fixed ? i.unit : fmtQty(i.qty) + ' ' + i.unit}</b></div>`).join('')}</div>
    <p style="color:var(--deep);font-weight:500;margin:18px 0">Let’s get everything ready before we begin.</p>
    <div style="display:flex;gap:12px"><a class="btn btn-green" style="flex:1" href="#/check">Let’s get cooking ${ic('arrow', 18)}</a><button class="btn btn-outline-green" id="save">Save for later ${ic('bookmark', 18)}</button></div></div></div></main>${footer()}`,
    mount() { $('#save').onclick = () => toast('Saved for later', 'Find it any time in My Kitchen.', 'ok'); },
  };
};

pages.check = () => {
  const k = state.servings / CAKE.serves;
  const missing = CAKE.ingredients.filter(i => !state.have[i.id]);
  return {
    html: `${nav('Explore Recipes')}<main class="wrap"><div class="check"><div>
    <span class="eyebrow">Do you have everything?</span><h1 style="font-size:40px;margin:10px 0">Let’s get everything ready.</h1>
    <p class="muted">Check off what you already have. I’ll help you organise the rest.</p>
    <div class="servings">Servings <button id="sm" aria-label="Fewer servings">−</button><b>${state.servings}</b><button id="sp" aria-label="More servings">+</button></div>
    ${CAKE.ingredients.map(i => `<div class="irow" data-id="${i.id}" role="checkbox" aria-checked="${state.have[i.id]}" tabindex="0"><span class="box ${state.have[i.id] ? 'on' : ''}">${state.have[i.id] ? ic('check', 16, '#fff', 3) : ''}</span><img src="${photo(i.photo)}" alt=""><span class="nm">${i.name}</span>${state.have[i.id] ? '' : '<span class="tag-missing">Missing</span>'}<span class="q">${i.fixed ? i.unit : fmtQty(i.qty * k) + ' ' + i.unit}</span></div>`).join('')}
    <a class="btn btn-green" style="margin-top:18px" href="#/choose">${missing.length ? 'Continue to cooking setup' : 'Great! Looks like we’re ready to prep.'} ${ic('arrow', 18)}</a></div>
    <aside class="side"><div class="count"><span>${missing.length}</span>ingredient${missing.length === 1 ? '' : 's'} still needed</div>
    ${missing.length ? `<p class="muted" style="font-size:15px">Choose what you want to order.</p>
    ${missing.map(i => `<div class="order-row" data-o="${i.id}"><span class="box ${state.order[i.id] ? 'on' : ''}">${state.order[i.id] ? ic('check', 16, '#fff', 3) : ''}</span><img src="${photo(i.photo)}" alt=""><div><b>${i.name}</b><br><small class="muted">${i.pack || ''}</small></div></div>`).join('')}
    <div class="note">Ordering and checkout happen in Blinkit. Come back here after shopping, your recipe will be waiting.<button class="btn btn-green" id="blinkit">Continue to Blinkit ${ic('ext', 18)}</button></div>`
    : `<div class="note" style="color:var(--deep);font-weight:500">${ic('check', 18, 'var(--green)')} Great! Looks like we’re ready to prep.</div>`}
    </aside></div></main>${footer()}`,
    mount() {
      $('#sm').onclick = () => { state.servings = Math.max(1, state.servings - 1); render(); };
      $('#sp').onclick = () => { state.servings = Math.min(20, state.servings + 1); render(); };
      $$('.irow').forEach(r => { const f = () => { const id = r.dataset.id; state.have[id] = !state.have[id]; render(); }; r.onclick = f; r.onkeydown = e => (e.key === ' ' || e.key === 'Enter') && f(); });
      $$('.order-row').forEach(r => r.onclick = () => { state.order[r.dataset.o] = !state.order[r.dataset.o]; render(); });
      const b = $('#blinkit'); if (b) b.onclick = () => {
        const items = CAKE.ingredients.filter(i => !state.have[i.id] && state.order[i.id]).map(i => i.name.split(' (')[0]);
        if (!items.length) return toast('Pick at least one item', 'Tick the ingredients you want to order.');
        window.open('https://blinkit.com/s/?q=' + encodeURIComponent(items[0]), '_blank', 'noopener');
      };
    },
  };
};

pages.choose = () => ({
  html: `${nav('Explore Recipes')}<main class="wrap center-page"><span class="eyebrow">${CAKE.name}</span><h1>How would you like to cook?</h1><p class="muted">Pick one or both. You can switch any time while cooking.</p>
  <div class="options"><button class="option ${state.mode.gesture ? 'on' : ''}" id="og"><div class="vis">${GESTURES.slice(0, 3).map(g => `<img src="${gimg(g.photo)}" alt="${g.name}">`).join('')}</div>
  <div class="t"><span class="badge">${ic('palm', 22, 'var(--orange)')}</span>Hand gestures<span class="tick">${ic('check', 16, '#fff', 3)}</span></div><p class="muted">I watch for simple hand signs through your camera.</p></button>
  <button class="option ${state.mode.voice ? 'on' : ''}" id="ov"><div class="vis"><span class="badge" style="width:150px;height:150px;background:var(--grey)">${ic('mic', 80, 'var(--orange)', 1.6)}</span></div>
  <div class="t"><span class="badge">${ic('mic', 22, 'var(--orange)')}</span>Voice commands<span class="tick">${ic('check', 16, '#fff', 3)}</span></div><p class="muted">I listen for short words like “Next”, “Repeat” and “Help me”.</p></button></div>
  <a class="btn btn-green" href="#/setup">Continue ${ic('arrow', 18)}</a>
  ${!voice.supported ? '<p class="supports">Voice commands need Chrome or Edge on this device.</p>' : ''}</main>`,
  mount() {
    $('#og').onclick = () => { state.mode.gesture = !state.mode.gesture || !state.mode.voice; render(); };
    $('#ov').onclick = () => { state.mode.voice = !state.mode.voice || !state.mode.gesture; render(); };
  },
});

pages.setup = () => {
  const needG = state.mode.gesture, needV = state.mode.voice && voice.supported;
  const allSet = (!needG || state.setup.gesture) && (!needV || state.setup.voice);
  const items = [];
  if (needG) items.push([state.setup.gesture, 'Allow camera access so I can recognise your hand gestures.'], [state.setup.gesture, state.setup.gesture ? 'Got it! Your gesture is ready.' : 'Show a thumbs up to test your gesture.']);
  if (needV) items.push([state.setup.voice, state.setup.voice ? 'I can hear you. Your voice is ready.' : `Say “${state.settings.wakeWord}” to test your voice.`]);
  return {
    html: `${nav('Explore Recipes')}<main class="wrap"><div class="setup">
    <div class="cam">${needG ? `<video id="cv" autoplay muted playsinline></video><canvas id="cvs" class="skel" aria-hidden="true"></canvas><span class="label"><i></i>Camera on</span><span class="det" id="det">Starting camera…</span>` : `<div class="wait">${ic('mic', 120, '#fff', 1.4)}<p style="margin-top:20px;font-size:20px">Listening…</p></div>`}</div>
    <div style="display:flex;flex-direction:column;gap:22px"><h1 style="font-size:40px">${needG ? 'Let’s try your gestures.' : 'Let’s get your voice ready.'}</h1>
    <div class="checklist">${items.map(([d, t], i) => `<div class="cl ${d ? 'done' : (items.findIndex(x => !x[0]) === i ? 'now' : '')}"><span class="n">${d ? ic('check', 16, '#fff', 3) : i + 1}</span>${t}</div>`).join('')}</div>
    ${allSet ? `<div class="panel" style="padding:24px;background:var(--mint)"><b style="font-size:22px">All set! Your hands-free controls are ready.</b></div>
    <div class="cl" style="background:var(--green);color:#fff;font-weight:600"><span class="n" style="background:#fff">${ic('check', 16, 'var(--green)', 3)}</span>${needG ? 'Show a thumbs up' : 'Say “Start”'} to start preparing</div>` : ''}
    <p class="muted" id="setmsg" style="font-size:14px">${needG ? 'Can’t see your hand? Move it into view or improve the lighting, and I’ll ask again.' : 'Too noisy? Move closer or turn down the fan.'}</p>
    <a class="link" href="#/prep">Skip the test and start preparing ${ic('arrow', 16)}</a></div></div></main>`,
    async mount() {
      handler = (a, src) => {
        if (src === 'gesture' && !state.setup.gesture) { state.setup.gesture = true; Speaker.say('Got it! Your gesture is ready.'); render(); return; }
        if (src === 'voice' && !state.setup.voice) { state.setup.voice = true; Speaker.say('I can hear you. Your voice is ready.'); render(); return; }
        if (allSet && ['next', 'ready', 'resume'].includes(a)) go('#/prep');
      };
      if (needV) {
        voice.start();
        voice.onHeard = t => { flashHeard('“' + t + '”'); if (!state.setup.voice) { state.setup.voice = true; Speaker.say('I can hear you. Your voice is ready.'); render(); } };
      }
      if (needG) {
        try { await gesture.start($('#cv')); } catch { $('#det').textContent = 'Camera blocked. Allow camera access in the browser.'; }
        if (state.gestureState === 'loading') $('#det').textContent = 'Loading gesture model…';
      }
    },
  };
};

// ---------------- cook mode chrome
function cookHead(label, n, idx) {
  return `<header class="cook-head"><img class="logo" src="assets/logo.png" alt="Let's Cook"><span class="rn">${CAKE.name}</span>
  <div class="mid"><b>${label}</b><div class="bar">${Array.from({ length: n }, (_, i) => `<i class="${i < idx ? 'done' : i === idx ? 'now' : ''}"></i>`).join('')}</div></div>
  <span class="status" id="stG"></span><span class="status" id="stV"></span>
  ${state.mode.gesture ? '<div class="mini-cam"><video id="mc" autoplay muted playsinline></video><canvas id="mcs" class="skel" aria-hidden="true"></canvas><span class="ring"></span><span class="mc-label" id="mctext">Camera</span></div>' : ''}
  <a class="exit" href="#/recipe/cake">Exit</a></header>`;
}
function cookFoot(sayText) {
  const g = state.settings.gestureMap;
  const by = a => GESTURES.find(x => g[x.id] === a && state.settings.gestureEnabled[x.id]);
  const chips = ['next', 'pause', 'resume'].map(a => by(a)).filter(Boolean);
  return `<footer class="cook-foot" style="border-top:1px solid var(--line);padding:14px 40px">
  ${state.mode.gesture ? chips.map(x => `<span class="gchip"><img src="${gimg(x.photo)}" alt="">${ACTIONS[g[x.id]]}</span>`).join('') : ''}
  ${state.mode.gesture && state.mode.voice ? '<span style="width:1px;height:36px;background:var(--line)"></span>' : ''}
  ${state.mode.voice ? ['repeat', 'previous', 'help', 'timer'].map(a => `<span class="vchip">“${state.settings.phrases[a][0].replace(/^./, c => c.toUpperCase())}”</span>`).join('') : ''}
  <span class="speaking">${ic('vol', 22, 'var(--green)')}<span class="wave"><i></i><i></i><i></i><i></i></span><span id="sayline">${esc(sayText || 'Reading aloud…')}</span></span></footer>`;
}
function updateStatus() {
  const g = $('#stG'), v = $('#stV');
  if (g) { const on = state.mode.gesture && state.gestureState === 'on'; g.className = 'status ' + (on ? 'cam-on' : 'off'); g.innerHTML = state.mode.gesture ? `<span class="dot"></span>${ic('video', 18)} ${state.gestureState === 'loading' ? 'Loading…' : on ? 'Gestures on' : 'Camera off'}` : ''; g.style.display = state.mode.gesture ? '' : 'none'; }
  if (v) { const on = state.mode.voice && state.voiceState === 'listening'; v.className = 'status ' + (on ? 'mic-on' : 'off'); v.innerHTML = state.mode.voice ? `${ic('mic', 18)} ${on ? 'Listening' : voice.supported ? 'Mic off' : 'Voice not supported'}` : ''; v.style.display = state.mode.voice ? '' : 'none'; }
}
async function startControls() {
  if (state.mode.voice && voice.supported) { voice.onHeard = t => flashHeard('“' + t + '”'); voice.start(); }
  const mc = $('#mc');
  if (state.mode.gesture && mc) {
    if (gesture.running) gesture.attach(mc);
    else { try { await gesture.start(mc); } catch {} }
  }
  updateStatus();
}
function keyNav(e) {
  if (e.target.matches('input, select, textarea')) return;
  const m = { ArrowRight: 'next', ArrowLeft: 'previous', r: 'repeat', h: 'help', t: 'timer', i: 'ingredients', Escape: 'exit' };
  if (e.key === ' ') { e.preventDefault(); dispatch(state.paused ? 'resume' : 'pause', 'key'); return; }
  if (m[e.key]) dispatch(m[e.key], 'key');
}

function showPause() {
  closeOverlay();
  const t = state.timer.running ? `&nbsp;Your timer keeps running:&nbsp;<b id="pt">${mmss(state.timer.left)}</b>&nbsp;left` : '';
  const o = document.createElement('div'); o.className = 'overlay'; o.id = 'ov';
  const resume = GESTURES.find(x => state.settings.gestureMap[x.id] === 'resume');
  o.innerHTML = `<div class="pause-card"><img src="${gimg('fist')}" alt=""><h2>No problem. Take your time.<br>I’ll wait.</h2>${t ? `<p class="chip" style="font-size:18px;padding:12px 20px">${ic('timer', 20)}${t}</p>` : ''}
  <p class="chip" style="font-size:18px;padding:10px 18px;background:var(--grey)">${resume ? `<img src="${gimg(resume.photo)}" style="width:40px;height:40px;object-fit:contain;margin-right:10px" alt="">Show an ${resume.name.toLowerCase()} or say` : 'Say'} “Resume” when you’re ready.</p></div>`;
  document.body.appendChild(o);
}
function showHelp(text) {
  closeOverlay();
  const o = document.createElement('div'); o.className = 'overlay'; o.id = 'ov';
  o.innerHTML = `<div class="help-card"><span class="eyebrow">Help</span><h2>I’ve got you. Let me explain.</h2><p>${esc(text)}</p><p class="muted" style="font-size:18px">Show a thumbs up or say “Next” to carry on.</p></div>`;
  document.body.appendChild(o); state.help = true;
}
function closeOverlay() { const o = $('#ov'); if (o) o.remove(); state.help = false; }

// ---------------- timer
let tick = null;
function startTimer(sec, stepIdx) {
  state.timer = { left: sec, total: sec, running: true, done: false, step: stepIdx };
  clearInterval(tick);
  tick = setInterval(() => {
    if (!state.timer.running) return;
    state.timer.left = Math.max(0, state.timer.left - 1);
    const el = $('#tbig'); if (el) el.textContent = mmss(state.timer.left);
    const pt = $('#pt'); if (pt) pt.textContent = mmss(state.timer.left);
    if (state.timer.left === 0) { state.timer.running = false; state.timer.done = true; clearInterval(tick); chime(); Speaker.say(SAY.timerDone); toast('Your timer is up!', 'Check your dish.', 'ok'); refreshTimer(); }
  }, 1000);
}
function refreshTimer() {
  const box = $('#tbox'); if (!box) return;
  const s = CAKE.steps[state.step]; const t = state.timer, mine = t.step === state.step;
  box.className = 'timer' + (mine && t.running ? ' run' : mine && t.done ? ' doneT' : '');
  $('#tbig').textContent = mmss(mine ? t.left : s.timer);
  $('#tstate').textContent = mine && t.running ? 'Timer running' : mine && t.done ? 'Time’s up! Check your dish.' : 'Ready to start';
}

// ---------------- prep
pages.prep = () => {
  const i = state.prep, task = CAKE.prepTasks[i], k = state.servings / CAKE.serves;
  return {
    cook: true,
    html: `<div class="cook">${cookHead(`Preparation · Task ${i + 1} of ${CAKE.prepTasks.length}`, CAKE.prepTasks.length, i)}
    <div class="prep-body"><div class="tasks"><h2 style="font-size:30px;line-height:1.2">Let’s get everything ready.</h2><p class="muted">We’ll prepare everything first, so cooking feels easier once we begin.</p>
    ${CAKE.prepTasks.map((t, j) => `<div class="task ${j < i ? 'done' : j === i ? 'now' : ''}"><span class="n">${j < i ? ic('check', 18, '#fff', 3) : j + 1}</span><div><b>${t.title}</b><small>${t.short}</small></div></div>`).join('')}
    <p class="panel" style="padding:16px;margin-top:auto;font-size:15px">After the last task, say “I’m ready to cook!” or show a thumbs up.</p></div>
    <div class="prep-main"><span class="chip" style="background:var(--yellow);font-weight:600;align-self:flex-start">Task ${i + 1} · Now</span><h1>${task.title}.</h1>
    <div class="ill"><img src="assets/ill/${task.ill}.png" alt=""></div>
    ${task.chips ? `<div class="amounts">${CAKE.ingredients.map(x => `<span>${x.name.split(' (')[0].split(',')[0]} <i>${x.fixed ? x.unit : fmtQty(x.qty * k) + ' ' + x.unit}</i></span>`).join('')}</div>` : ''}</div></div>
    ${cookFoot('Reading the task…')}</div>`,
    mount() {
      handler = cookHandler('prep'); handler.wantsUnknown = true;
      startControls();
      if (!state.started) state.started = Date.now();
      say(task.title + '. ' + task.say);
    },
  };
};

// ---------------- cook steps
pages.cook = () => {
  const i = state.step, s = CAKE.steps[i];
  const t = state.timer, mine = t.step === i;
  return {
    cook: true,
    html: `<div class="cook">${cookHead(`Step ${i + 1} of ${CAKE.steps.length}`, CAKE.steps.length, i)}
    <div class="cook-body"><div class="cook-text"><span class="eyebrow">Here’s what to do</span><h1>${s.title}</h1><p class="detail">${s.detail}</p>
    ${s.look ? `<div class="look">${ic('eye', 30, 'var(--orange)')}<div><small>Look for</small><span>${s.look}</span></div></div>` : ''}
    ${s.timer ? `<div class="timer" id="tbox"><span class="badge" style="width:62px;height:62px">${ic('timer', 32, 'var(--deep)')}</span><span class="big" id="tbig">${mmss(mine ? t.left : s.timer)}</span><div class="tt"><b id="tstate">Ready to start</b><small>Say “Start timer” or show an OK sign. I’ll tell you when it’s done.</small></div></div>` : ''}</div>
    <div class="ill"><img src="assets/ill/${s.ill}.png" alt=""></div></div>
    ${cookFoot('Reading aloud…')}</div>`,
    mount() {
      handler = cookHandler('cook'); handler.wantsUnknown = true;
      startControls();
      if (s.timer) refreshTimer();
      say(`Step ${i + 1}. ${s.title} ${s.detail.replace(/[+·]/g, ',')}${s.look ? ' Look for: ' + s.look : ''}`);
    },
  };
};

function cookHandler(kind) {
  return (a) => {
    if (state.paused && a !== 'resume' && a !== 'exit') return; // waits for resume
    if (state.help && a !== 'help') closeOverlay();
    const isPrep = kind === 'prep';
    const n = isPrep ? CAKE.prepTasks.length : CAKE.steps.length;
    const idx = isPrep ? state.prep : state.step;
    const item = isPrep ? CAKE.prepTasks[idx] : CAKE.steps[idx];
    switch (a) {
      case 'next': case 'ready': case 'skip': {
        const by = a === 'skip' ? 2 : 1;
        if (isPrep) { if (idx + by >= n || a === 'ready') { state.step = 0; Speaker.say('Ready? Let’s cook!'); go('#/cook'); } else { state.prep = idx + by; go('#/prep', true); } }
        else if (idx + by >= n) { go('#/done'); }
        else { state.step = idx + by; go('#/cook', true); }
        toast(a === 'skip' ? 'Okay, moving ahead one step.' : 'Great! Let’s move on.', '', 'ok');
        break;
      }
      case 'previous':
        if (isPrep) { if (idx > 0) { state.prep--; go('#/prep', true); } }
        else if (idx > 0) { state.step--; go('#/cook', true); } else { state.prep = CAKE.prepTasks.length - 1; go('#/prep'); }
        toast('Sure. Let’s revisit that step.', '', 'ok');
        break;
      case 'repeat': Speaker.say(isPrep ? item.title + '. ' + item.say : `${item.title} ${item.detail}`); toast('Of course. Let’s go through that again.', '', 'ok'); break;
      case 'help': { const h = isPrep ? item.say : item.help; showHelp(h); Speaker.say(SAY.help + ' ' + h); break; }
      case 'ingredients': Speaker.say(SAY.ingredients + ' ' + (isPrep ? CAKE.ingredients.map(x => x.name).join(', ') : item.ingredients)); break;
      case 'timer':
        if (!isPrep && item.timer) { startTimer(item.timer, idx); refreshTimer(); Speaker.say(SAY.timer); toast('Timer started.', 'I’ll let you know when it’s done.', 'ok'); }
        else toast('There’s no timer on this step.', 'Say “Next” when you’re done.');
        break;
      case 'stoptimer': state.timer.running = false; clearInterval(tick); refreshTimer(); Speaker.say(SAY.stoptimer); break;
      case 'pause': state.paused = true; showPause(); Speaker.say(SAY.pause); break;
      case 'resume': if (state.paused) { state.paused = false; closeOverlay(); Speaker.say(SAY.resume); } break;
      case 'exit': Speaker.say(SAY.exit); go('#/recipe/cake'); break;
      default: notUnderstood('gesture');
    }
  };
}

pages.done = () => {
  const mins = state.started ? Math.max(1, Math.round((Date.now() - state.started) / 60000)) : 0;
  return {
    cook: true,
    html: `<div class="cook">${cookHead('Done!', CAKE.steps.length, CAKE.steps.length)}<div class="done-body"><img class="hero-img" src="${photo('cake')}" alt="Finished cake">
    <div><span class="eyebrow">${CAKE.name}</span><h1 style="margin-top:12px">You made it!<br>Enjoy your meal.</h1><p class="detail muted" style="font-size:22px;margin-top:16px">Let it cool for 10 minutes, then top with whipped cream and berries.</p>
    <div class="done-stats"><div class="stat">${ic('clock')}<b>${mins} min</b><small>Total time</small></div><div class="stat">${ic('check')}<b>${CAKE.steps.length} of ${CAKE.steps.length}</b><small>Steps done</small></div><div class="stat">${ic('video')}<b>${state.touches}</b><small>Screen touches</small></div></div>
    <div class="look" style="background:var(--mint)"><img src="${gimg('thumb')}" style="width:56px;height:56px;object-fit:contain;background:#fff;border-radius:99px" alt=""><div><b style="font-size:22px">Save for later</b><br><span class="muted" style="font-size:16px">Show a thumbs up or say “Save for later”</span></div></div>
    <div class="look" style="margin-top:12px"><span class="badge">${ic('mic', 24, 'var(--orange)')}</span><div><b style="font-size:22px">Cook it again</b><br><span class="muted" style="font-size:16px">Say “Cook it again”</span></div></div></div></div>
    ${cookFoot('“You made it! Enjoy your meal.”')}</div>`,
    mount() {
      handler = a => {
        if (a === 'next' || a === 'save') { toast('Saved for later', 'Find it any time in My Kitchen.', 'ok'); Speaker.say('Saved. Find it any time in My Kitchen.'); }
        if (a === 'previous' || a === 'cookagain') { state.prep = 0; state.step = 0; state.started = 0; state.touches = 0; go('#/prep'); }
        if (a === 'exit') go('#/');
      };
      state.settings.phrases.save = ['save for later', 'save'];
      state.settings.phrases.cookagain = ['cook it again'];
      startControls(); clearInterval(tick); state.timer.running = false; chime(); Speaker.say(SAY.done);
    },
  };
};

// ---------------- how it works
pages.how = () => ({
  html: `${nav('How It Works')}<main class="wrap">
  <section class="section"><div class="panel intro"><div style="flex:1"><span class="eyebrow">How it works</span><h1>Your Kitchen Companion</h1><p class="muted" style="font-size:18px">You give the cue. I’ll guide you through. Use your voice, a hand sign, or both.</p></div>
  <div style="display:flex;gap:18px;align-items:center"><div style="text-align:center"><span class="badge" style="width:96px;height:96px">${ic('mic', 40, 'var(--orange)')}</span><b>Voice</b></div><span class="muted">or</span><div style="text-align:center"><span class="badge" style="width:96px;height:96px">${ic('palm', 40, 'var(--orange)')}</span><b>Gestures</b></div></div></div></section>
  <section><h2 style="font-size:28px;margin-bottom:20px">Three simple steps</h2><div class="steps3">${[['Pick a recipe', 'Search or browse, then check your ingredients.'], ['Choose voice, gestures or both', 'Allow the mic or camera and do a quick test.'], ['Cook one step at a time', 'I read each step and wait. Give the cue when you’re ready.']].map(([a, b], i) => `<div class="step3"><span class="n">${i + 1}</span><div><b>${a}</b><br><small class="muted">${b}</small></div></div>`).join('')}</div></section>
  <section class="section"><div class="ghead"><span class="badge" style="background:var(--grey)">${ic('palm', 22, 'var(--orange)')}</span><div><h2>Hand gestures</h2><p class="muted">Show a sign to the camera. Hold it for a second.</p></div><a class="btn btn-outline" href="#/settings">${ic('pencil', 16)} Edit gestures</a></div>
  <div class="g3" style="gap:20px">${GESTURES.map(g => `<div class="gbig"><img src="${gimg(g.photo)}" alt="${g.name}"><h3>${g.name}</h3><span class="chip chip-green" style="align-self:flex-start">${ACTIONS[state.settings.gestureMap[g.id]]}</span><div class="says">${ic('chat', 16, 'var(--green)')}${g.says}</div></div>`).join('')}</div></section>
  <section class="section"><div class="ghead"><span class="badge" style="background:var(--grey)">${ic('mic', 22, 'var(--orange)')}</span><div><h2>Voice commands</h2><p class="muted">Start with “${esc(state.settings.wakeWord)}”, then say a command. Add your own words any time.</p></div><a class="btn btn-outline" href="#/settings">${ic('pencil', 16)} Edit commands</a></div>
  <div class="v5">${[['next', 'Go to next step'], ['previous', 'Return to previous step'], ['skip', 'Skip one step'], ['repeat', 'Repeat this step'], ['help', 'Explain the technique'], ['ingredients', 'Read this step’s ingredients'], ['timer', 'Start the step’s timer'], ['stoptimer', 'Stop the timer'], ['pause', 'Wait, or carry on'], ['exit', 'Leave cook-along']].map(([a, d]) => `<div class="vcard"><span class="badge" style="width:36px;height:36px">${ic('mic', 16, 'var(--orange)')}</span><b>${state.settings.phrases[a].slice(0, 2).map(p => '“' + p.replace(/^./, c => c.toUpperCase()) + '”').join(' / ')}</b><small>${d}</small></div>`).join('')}</div>
  <div class="look" style="margin-top:20px">${ic('chat', 20, 'var(--green)')}<span style="font-size:15px">Didn’t catch that? I’ll simply ask again: “Sorry, I didn’t catch that. Try saying ‘Next’, or show a thumbs up.”</span></div></section>
  <section class="closing"><h2>Ready to try it?</h2><p class="muted">Pick a recipe and I’ll set up your voice or gestures in a minute.</p><a class="btn btn-green" href="#/recipe/cake">Find my recipe ${ic('arrow', 18)}</a></section></main>${footer()}`,
});

// ---------------- settings
pages.settings = () => {
  const s = state.settings;
  const opts = sel => Object.entries(ACTIONS).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v}</option>`).join('');
  const seg = (name, list, val) => `<div class="seg" data-seg="${name}">${list.map(x => `<button class="${String(x.v ?? x) === String(val) ? 'on' : ''}" data-v="${x.v ?? x}">${x.l ?? x}</button>`).join('')}</div>`;
  const cmdRows = [['next', 'Next step'], ['previous', 'Go back'], ['repeat', 'Repeat'], ['help', 'Ask for help'], ['ingredients', 'Ingredients'], ['timer', 'Start timer'], ['pause', 'Pause'], ['resume', 'Resume'], ['exit', 'Exit cooking']];
  return {
    html: `${nav('')}<main class="wrap"><div style="display:flex;align-items:flex-end;padding:40px 0 28px"><div style="flex:1"><p class="muted" style="font-size:14px">Profile & settings / Controls</p><h1 style="font-size:36px;margin:6px 0">Customise your controls</h1><p class="muted">Change the words and hand signs to whatever feels natural to you.</p></div>
    <div style="display:flex;gap:16px;align-items:center"><span class="saved" id="saved"></span><button class="link" style="color:var(--muted)" id="reset">${ic('reset', 16)} Reset to default</button><button class="btn btn-green" id="save">Save changes</button></div></div>
    <div class="set-cols"><section class="set-panel"><div class="set-head"><span class="badge">${ic('palm', 22, 'var(--orange)')}</span><div style="flex:1"><h2>Hand gestures</h2><small class="muted">Pick which sign does what.</small></div><button class="switch ${s.gesturesOn ? 'on' : ''}" data-sw="gesturesOn" aria-label="Gestures on"></button></div>
    ${GESTURES.map(g => `<div class="row"><img src="${gimg(g.photo)}" alt=""><span class="nm">${g.name}</span>${ic('arrow', 16, 'var(--muted)')}<select data-g="${g.id}" aria-label="Action for ${g.name}">${opts(s.gestureMap[g.id])}</select><button class="switch ${s.gestureEnabled[g.id] ? 'on' : ''}" data-ge="${g.id}" aria-label="${g.name} on"></button></div>`).join('')}
    <div class="setrow">Which hand do you use?${seg('hand', ['Left', 'Right', 'Both'], s.hand)}</div>
    <div class="setrow">Hold the sign for${seg('holdMs', [{ v: 500, l: '0.5 s' }, { v: 1000, l: '1 s' }, { v: 2000, l: '2 s' }], s.holdMs)}</div>
    <div class="setrow">Detection sensitivity<input type="range" min="0" max="1" step="0.05" value="${s.sensitivity}" data-r="sensitivity" aria-label="Detection sensitivity"></div></section>
    <section class="set-panel"><div class="set-head"><span class="badge">${ic('mic', 22, 'var(--orange)')}</span><div style="flex:1"><h2>Voice commands</h2><small class="muted">Use your own words, in your language.</small></div><button class="switch ${s.voiceOn ? 'on' : ''}" data-sw="voiceOn" aria-label="Voice on"></button></div>
    <div class="row"><div style="flex:1"><small class="muted">Wake word</small><input id="wake" value="${esc(s.wakeWord)}" style="display:block;border:0;font-weight:600;font-size:17px;width:100%;outline:none" aria-label="Wake word"></div>${ic('pencil', 18)}</div>
    <div class="setrow">Require the wake word<button class="switch ${s.requireWakeWord ? 'on' : ''}" data-sw="requireWakeWord" aria-label="Require wake word"></button></div>
    <div class="setrow">Language${seg('language', ['English', 'हिन्दी', 'Hinglish'], s.language)}</div>
    ${cmdRows.map(([a, l]) => `<div class="row"><b style="width:120px;flex:none;font-size:15px">${l}</b><div class="phr">${s.phrases[a].map((p, i) => `<span>“${esc(p)}”<button data-del="${a}:${i}" aria-label="Remove ${esc(p)}">×</button></span>`).join('')}<input data-add="${a}" placeholder="+ Add phrase" aria-label="Add phrase for ${l}"></div></div>`).join('')}
    <div class="setrow">Read each step aloud<button class="switch ${s.readAloud ? 'on' : ''}" data-sw="readAloud" aria-label="Read aloud"></button></div>
    <div class="setrow">Reading speed<input type="range" min="0" max="1" step="0.05" value="${s.speechRate}" data-r="speechRate" aria-label="Reading speed"></div></section></div></main>${footer()}`,
    mount() {
      const s2 = state.settings;
      const apply = () => { voice.setSettings(s2); gesture.setSettings(s2); Speaker.rate = 0.75 + s2.speechRate * 0.6; };
      $$('[data-sw]').forEach(b => b.onclick = () => { s2[b.dataset.sw] = !s2[b.dataset.sw]; b.classList.toggle('on'); apply(); });
      $$('[data-ge]').forEach(b => b.onclick = () => { s2.gestureEnabled[b.dataset.ge] = !s2.gestureEnabled[b.dataset.ge]; b.classList.toggle('on'); apply(); });
      $$('[data-g]').forEach(sel => sel.onchange = () => { s2.gestureMap[sel.dataset.g] = sel.value; apply(); });
      $$('[data-seg]').forEach(g => g.onclick = e => { const b = e.target.closest('button'); if (!b) return; const k = g.dataset.seg; s2[k] = k === 'holdMs' ? Number(b.dataset.v) : b.dataset.v; $$('button', g).forEach(x => x.classList.toggle('on', x === b)); apply(); });
      $$('[data-r]').forEach(r => r.oninput = () => { s2[r.dataset.r] = Number(r.value); apply(); });
      $('#wake').oninput = e => { s2.wakeWord = e.target.value; apply(); };
      $$('[data-del]').forEach(b => b.onclick = () => { const [a, i] = b.dataset.del.split(':'); s2.phrases[a].splice(Number(i), 1); render(); });
      $$('[data-add]').forEach(inp => inp.onkeydown = e => { if (e.key === 'Enter' && inp.value.trim()) { s2.phrases[inp.dataset.add].push(inp.value.trim().toLowerCase()); render(); } });
      $('#save').onclick = () => { saveSettings(s2); apply(); $('#saved').textContent = 'Saved'; toast('Changes saved', 'Your controls are ready for the next cook-along.', 'ok'); };
      $('#reset').onclick = () => { state.settings = resetSettings(); voice.setSettings(state.settings); gesture.setSettings(state.settings); render(); };
    },
  };
};

pages.kitchen = () => ({
  html: `${nav('My Kitchen')}<main class="wrap"><h1 class="page-title">My Kitchen</h1><p class="muted" style="margin-bottom:28px">Good recipes are worth keeping.</p>
  <div class="sec-head"><h2>Saved recipes</h2></div><div class="grid4" style="margin-bottom:40px">${['cake', 'paneer', 'dosa'].map(id => card(RECIPES.find(r => r.id === id))).join('')}</div>
  <div class="sec-head"><h2>Recently cooked</h2></div><div class="grid4" style="padding-bottom:64px">${['pavbhaji', 'idli'].map(id => card(RECIPES.find(r => r.id === id))).join('')}</div></main>${footer()}`,
});

// ---------------------------------------------------------------- router
function go(hash, sameRouteRerender) { if (location.hash === hash && sameRouteRerender) render(); else location.hash = hash; }
const COOK_ROUTES = ['setup', 'prep', 'cook', 'done'];
function render() {
  const [path, qs] = (location.hash.slice(1) || '/').split('?');
  const parts = path.split('/').filter(Boolean);
  const name = parts[0] || 'home';
  const q = new URLSearchParams(qs || '');
  const page = (pages[name] || pages.home)(q, parts[1]);
  handler = null; closeOverlay();
  if (!COOK_ROUTES.includes(name)) { voice.stop(); gesture.stop(); Speaker.stop(); state.paused = false; }
  if (name !== 'done') { delete state.settings.phrases.save; delete state.settings.phrases.cookagain; }
  document.body.classList.toggle('in-cook', !!page.cook);
  $('#app').innerHTML = page.html;
  if (!page.cook) window.scrollTo(0, 0);
  page.mount && page.mount();
  updateStatus();
}
window.addEventListener('hashchange', render);
document.addEventListener('keydown', e => { if (document.body.classList.contains('in-cook')) keyNav(e); });
document.addEventListener('pointerdown', e => { if (document.body.classList.contains('in-cook') && !e.target.closest('.exit')) state.touches++; });
render();
