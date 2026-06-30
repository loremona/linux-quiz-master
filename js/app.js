/* ═══════════ LINUX DOJO — motore ═══════════ */
'use strict';

// ── Stato persistente ────────────────────────────────────────────────────────
const STORE_KEY = 'linux-dojo-v1';

const defaultState = () => ({
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastDay: null,
  modules: {},   // id -> { card: ultimaCardVista, done: bool, quizOk: n, quizTot: n }
  seen: {},      // "modId:cardIdx" -> true (XP già assegnata)
  wrong: {},     // "modId:cardIdx" -> true (quiz sbagliati al primo tentativo)
  notes: {},     // "modId:cardIdx" -> { text, title, ts }
  recall: {},    // "modId:cardIdx" -> { val, ts }  (concetto "lo ricordo")
});

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch (e) { /* storage corrotto: si riparte */ }
  return defaultState();
}

const UPDATED_KEY = 'linux-dojo-updated';

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    localStorage.setItem(UPDATED_KEY, new Date().toISOString());
  } catch (e) {}
  if (typeof Sync !== 'undefined') Sync.push(state);
}

// ── Streak giornaliero ───────────────────────────────────────────────────────
function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastDay === today) return;
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  state.streak = (state.lastDay === yesterday) ? state.streak + 1 : 1;
  state.lastDay = today;
  if (state.streak > (state.bestStreak || 0)) state.bestStreak = state.streak;
  saveState();
}

// ── Livelli ──────────────────────────────────────────────────────────────────
const LEVELS = [
  { xp: 0,    emoji: '🥚', name: 'Pinguino Neonato' },
  { xp: 100,  emoji: '🐣', name: 'Pinguino Pulcino' },
  { xp: 250,  emoji: '🐧', name: 'Pinguino di Strada' },
  { xp: 500,  emoji: '🛹', name: 'Pinguino Skater' },
  { xp: 800,  emoji: '🥷', name: 'Pinguino Ninja' },
  { xp: 1200, emoji: '🧙', name: 'Mago del Terminale' },
  { xp: 1700, emoji: '🦾', name: 'Cyborg di /dev' },
  { xp: 2300, emoji: '🚀', name: 'Astro-Sysadmin' },
  { xp: 3000, emoji: '👑', name: 'Tux Supremo' },
];

function currentLevel() {
  let lvl = LEVELS[0];
  for (const l of LEVELS) if (state.xp >= l.xp) lvl = l;
  return lvl;
}
function nextLevel() {
  for (const l of LEVELS) if (state.xp < l.xp) return l;
  return null;
}

// ── XP ───────────────────────────────────────────────────────────────────────
const XP_LESSON = 5, XP_QUIZ = 25, XP_INPUT = 35, XP_MISSION = 20, XP_REVIEW = 15, XP_MODULE = 100;
const EXAM_COUNT = 60, EXAM_DURATION = 90 * 60, EXAM_PASS_SCORE = 500;

function gainXp(n, label) {
  const before = currentLevel();
  state.xp += n;
  saveState();
  toast(`+${n} XP ${label || ''}`);
  const after = currentLevel();
  if (after !== before) {
    setTimeout(() => { toast(`${after.emoji} LIVELLO SU: ${after.name}!`); confetti(120); }, 900);
  }
  renderFeedXp();
}

// ── Messaggi dopamina ────────────────────────────────────────────────────────
const PRAISE = ['GRANDE! 🔥', 'BOOM! 💥', 'Sei una macchina! 🤖', 'Esatto! ⚡', 'Cervello galattico 🧠✨', 'Tux è fiero di te 🐧'];
const ROAST  = ['Ahia! Ma ora lo sai 💪', 'Quasi! Leggi la spiegazione 👇', 'Capita ai migliori 🐒', 'Errore = imparare ×2 🧠'];
const DAILY  = [
  'Una card al giorno leva il sysadmin di torno. Anzi no, ti ci trasforma. 🐧',
  'Il kernel non si impara da solo. Swipe! ⬆️',
  'Oggi 10 minuti di Dojo = domani meno panico all\'esame. 🎯',
  'Streak attiva = cervello attivo. Non spezzare la catena! 🔥',
  'Ricorda: anche Linus Torvalds è partito da `ls`. 🚶',
];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
// Copia mescolata (Fisher-Yates), senza mutare l'originale.
const shuffled = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── DOM refs ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const homeEl = $('home'), feedEl = $('feed'), cardsEl = $('cards');

// ── TEMA chiaro/scuro ────────────────────────────────────────────────────────
function initTheme() {
  const t = localStorage.getItem('linux-dojo-theme') || 'dark';
  if (t === 'light') { document.body.classList.add('light-theme'); $('btnTheme').textContent = '🌙'; }
  else { $('btnTheme').textContent = '☀️'; }
}
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('linux-dojo-theme', isLight ? 'light' : 'dark');
  $('btnTheme').textContent = isLight ? '🌙' : '☀️';
}

// ── STATISTICHE ──────────────────────────────────────────────────────────────
function openStats() {
  renderStats();
  $('stats-overlay').classList.remove('hidden');
}
function closeStats() { $('stats-overlay').classList.add('hidden'); }

function renderStats() {
  const lvl = currentLevel(), nxt = nextLevel();
  let totalDone = 0, totalCorrect = 0, totalQuiz = 0;
  const modRows = MODULES.map(mod => {
    const prog = state.modules[mod.id] || {};
    if (prog.done) totalDone++;
    totalCorrect += (prog.quizOk || 0);
    totalQuiz += (prog.quizTot || 0);
    const tot = mod.cards.length;
    const at = prog.done ? tot : Math.min(prog.card || 0, tot);
    const pct = prog.done ? 100 : Math.round(at / tot * 100);
    const acc = prog.quizTot ? Math.round((prog.quizOk || 0) / prog.quizTot * 100) : null;
    return { mod, prog, pct, acc };
  });
  const seenCount = Object.keys(state.seen).length;
  const wrongCount = Object.keys(state.wrong).length;
  const globalAcc = totalQuiz ? Math.round(totalCorrect / totalQuiz * 100) : null;
  const best = Math.max(state.bestStreak || 0, state.streak);

  $('stats-body').innerHTML = `
    <div class="stats-hero">
      <div class="stats-emoji">${lvl.emoji}</div>
      <div>
        <div class="stats-level">${lvl.name}</div>
        <div class="stats-xp">${state.xp.toLocaleString('it')} XP${nxt ? ` · prossimo a ${nxt.xp}` : ' · MASSIMO 👑'}</div>
      </div>
    </div>
    <div class="stats-row">
      <div class="stats-kv"><div class="stats-val">🔥 ${state.streak}</div><div class="stats-key">streak<br>attuale</div></div>
      <div class="stats-kv"><div class="stats-val">🏆 ${best}</div><div class="stats-key">streak<br>record</div></div>
      <div class="stats-kv"><div class="stats-val">📖 ${seenCount}</div><div class="stats-key">card<br>studiate</div></div>
    </div>
    <div class="stats-section-title">QUIZ</div>
    <div class="stats-row">
      <div class="stats-kv"><div class="stats-val">${globalAcc !== null ? globalAcc + '%' : '—'}</div><div class="stats-key">precisione<br>globale</div></div>
      <div class="stats-kv"><div class="stats-val">${totalCorrect}/${totalQuiz}</div><div class="stats-key">corrette<br>/ totali</div></div>
      <div class="stats-kv"><div class="stats-val${wrongCount > 0 ? ' warn' : ''}">${wrongCount}</div><div class="stats-key">errori da<br>ripassare</div></div>
    </div>
    <div class="stats-section-title">MODULI · ${totalDone}/10 COMPLETATI</div>
    ${modRows.map(({ mod, prog, pct, acc }) => `
      <div class="stats-mod-row">
        <div class="stats-mod-icon">${mod.icon}</div>
        <div class="stats-mod-info">
          <div class="stats-mod-name">${mod.title}</div>
          <div class="stats-mod-bar"><div class="stats-mod-fill${prog.done ? ' done' : ''}" style="width:${pct}%"></div></div>
        </div>
        <div class="stats-mod-acc">${acc !== null ? acc + '%' : '—'}</div>
      </div>`).join('')}`;
}

// ── CHEATSHEET ───────────────────────────────────────────────────────────────
function openCheatsheet(mod) {
  const data = CHEATSHEETS[mod.id];
  if (!data) return;
  $('cs-title').textContent = data.title;
  $('cs-body').innerHTML = data.sections.map(sec => `
    <div class="cs-section">
      <div class="cs-section-title">${sec.h}</div>
      ${sec.items.map(it => `<div class="cs-item">${it}</div>`).join('')}
    </div>`).join('');
  $('cheatsheet-overlay').classList.remove('hidden');
}

function closeCheatsheet() {
  $('cheatsheet-overlay').classList.add('hidden');
}

// ── HOME ─────────────────────────────────────────────────────────────────────
function renderHome() {
  touchStreak();
  const lvl = currentLevel(), nxt = nextLevel();
  $('levelEmoji').textContent = lvl.emoji;
  $('levelName').textContent = lvl.name;
  $('xpText').textContent = nxt ? `${state.xp} XP — prossimo livello a ${nxt.xp}` : `${state.xp} XP — livello MASSIMO 👑`;
  const base = lvl.xp, top = nxt ? nxt.xp : state.xp || 1;
  $('xpFill').style.width = Math.min(100, ((state.xp - base) / (top - base)) * 100) + '%';
  const pill = $('streakPill');
  pill.textContent = `🔥 ${state.streak}`;
  pill.classList.toggle('hot', state.streak >= 3);
  $('dailyMsg').textContent = pick(DAILY);

  const list = $('moduleList');
  list.innerHTML = '';

  // Card ripasso errori (CP4) — appare in cima se ci sono quiz sbagliati
  const wrongCount = Object.keys(state.wrong).length;
  if (wrongCount > 0) {
    const rev = document.createElement('div');
    rev.className = 'module-card review-deck';
    rev.innerHTML = `
      <div class="module-icon">🔁</div>
      <div class="module-meta">
        <div class="module-title">Ripasso errori</div>
        <div class="module-sub">${wrongCount} quiz da ripassare</div>
      </div>
      <div class="module-badge"><span class="review-count">${wrongCount}</span></div>`;
    rev.onclick = openReview;
    list.appendChild(rev);
  }

  // Sezione simulatori esame (3 card: 101, 102, completo)
  const examSect = document.createElement('div');
  examSect.innerHTML = `<div class="exam-section-title">🎓 Simulatori d'esame</div>`;

  const makeExamCard = (icon, title, sub, tag, onClick, fullWidth) => {
    const d = document.createElement('div');
    d.className = 'module-card exam-card' + (fullWidth ? ' exam-full' : '');
    d.innerHTML = `
      <div class="module-icon">${icon}</div>
      <div class="module-meta">
        <div class="exam-tag">${tag}</div>
        <div class="module-title">${title}</div>
        <div class="module-sub">${sub}</div>
      </div>`;
    d.onclick = onClick;
    return d;
  };

  const examRow = document.createElement('div');
  examRow.className = 'exam-row';
  examRow.appendChild(makeExamCard('📋', 'Esame 101', '30 domande · moduli 1–5 · 90 min', '101-500', startExam101));
  examRow.appendChild(makeExamCard('📋', 'Esame 102', '30 domande · moduli 6–10 · 90 min', '102-500', startExam102));
  examSect.appendChild(examRow);
  examSect.appendChild(makeExamCard('🎓', 'Esame Completo', '60 domande da tutti i moduli · 90 min · soglia 500', 'Simulatore', startExamAll, true));
  list.appendChild(examSect);

  MODULES.forEach((mod, i) => {
    const prog = state.modules[mod.id] || {};
    const tot = mod.cards.length;
    const at = Math.min(prog.card || 0, tot);
    const pct = prog.done ? 100 : Math.round(at / tot * 100);
    const locked = !mod.cards.length;

    const el = document.createElement('div');
    el.className = 'module-card' + (prog.done ? ' done' : '') + (locked ? ' locked' : '');
    const hasCS = typeof CHEATSHEETS !== 'undefined' && !!CHEATSHEETS[mod.id];
    const flashCount = mod.cards.filter(c => c.type === 'lesson' || c.type === 'fact').length;
    const drillCount = QuizCore.drillCount(mod);
    const toReview = prog.done ? NotesCore.reviewCount(mod, state.recall) : 0;
    el.innerHTML = `
      <div class="module-icon">${mod.icon}</div>
      <div class="module-meta">
        <div class="module-title">${mod.title}</div>
        <div class="module-sub">${locked ? '🔒 In arrivo al prossimo checkpoint' : mod.sub + ' · ' + tot + ' card'}</div>
        ${locked ? '' : `<div class="module-progress"><div class="module-progress-fill" style="width:${pct}%"></div></div>`}
      </div>
      <div class="module-badge-area">
        <div class="module-badge">${prog.done ? '🏆' : pct > 0 ? pct + '%' : ''}</div>
        ${!locked && flashCount > 0 ? `<button class="btn-cheatsheet" data-action="flash">📖 flash</button>` : ''}
        ${!locked && drillCount > 0 ? `<button class="btn-cheatsheet" data-action="drill">🎯 quiz</button>` : ''}
        ${hasCS && !locked ? `<button class="btn-cheatsheet" data-action="cheat">📄 cheat</button>` : ''}
        ${toReview > 0 ? `<button class="btn-cheatsheet btn-review" data-action="recall">📌 ${toReview} ripasso</button>` : ''}
      </div>`;
    if (!locked) {
      el.onclick = () => openModule(mod);
      el.querySelectorAll('.btn-cheatsheet').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const action = btn.dataset.action;
          if (action === 'flash') openFlash(mod);
          else if (action === 'drill') openQuizDrill(mod);
          else if (action === 'cheat') openCheatsheet(mod);
          else if (action === 'recall') openRecallReview(mod);
        });
      });
    }
    list.appendChild(el);
  });
}

// ── FEED ─────────────────────────────────────────────────────────────────────
let curMod = null;
let reviewMode = false;
let reviewOrigKeys = [];
let examMode = false;
let examQuestions = [];
let examAnswers = [];
let examTimerSec = 0;
let examTimerInterval = null;
let flashMode = false;
let quizDrillMode = false;
let recallMode = false;
let feedOffset = 0;   // n. di card sintetiche prima delle card reali (es. ripasso lampo)

function openModule(mod) {
  $('searchInput').value = '';
  clearSearch();
  curMod = mod;
  reviewMode = false; recallMode = false;
  state.modules[mod.id] = state.modules[mod.id] || { card: 0, done: false, quizOk: 0, quizTot: 0 };
  homeEl.classList.add('hidden');
  feedEl.classList.remove('hidden');
  renderCards(mod);
  renderFeedXp();
  // se c'è il ripasso lampo (feedOffset>0) atterri su di esso; altrimenti riprendi da dove eri
  const at = state.modules[mod.id].done ? 0 : (state.modules[mod.id].card || 0);
  requestAnimationFrame(() => {
    cardsEl.scrollTo({ top: feedOffset ? 0 : at * cardsEl.clientHeight, behavior: 'instant' });
  });
}

function openReview() {
  const keys = Object.keys(state.wrong);
  if (!keys.length) return;

  reviewOrigKeys = [];
  const cards = [];
  for (const key of keys) {
    const colonIdx = key.lastIndexOf(':');
    const modId = key.slice(0, colonIdx);
    const cardIdx = parseInt(key.slice(colonIdx + 1), 10);
    const mod = MODULES.find(m => m.id === modId);
    if (!mod || !mod.cards[cardIdx]) continue;
    reviewOrigKeys.push(key);
    cards.push(mod.cards[cardIdx]);
  }
  if (!cards.length) return;

  reviewMode = true; recallMode = false;
  curMod = { id: 'review', icon: '🔁', title: 'Ripasso errori', cards };
  homeEl.classList.add('hidden');
  feedEl.classList.remove('hidden');
  renderCards(curMod);
  renderFeedXp();
}

function openFlash(mod) {
  const flashCards = mod.cards.filter(c => c.type === 'lesson' || c.type === 'fact');
  if (!flashCards.length) return;
  curMod = { ...mod, cards: flashCards };
  reviewMode = false; examMode = false; flashMode = true; quizDrillMode = false; recallMode = false;
  homeEl.classList.add('hidden');
  feedEl.classList.remove('hidden');
  renderCards(curMod);
  renderFeedXp();
}

function openQuizDrill(mod) {
  const drillCards = QuizCore.quizPool(mod);
  if (!drillCards.length) return;
  curMod = { ...mod, cards: drillCards };
  reviewMode = false; examMode = false; flashMode = false; quizDrillMode = true; recallMode = false;
  drillCorrect = 0; drillTotal = 0;
  homeEl.classList.add('hidden');
  feedEl.classList.remove('hidden');
  renderCards(curMod);
  renderFeedXp();
}

function openRecallReview(srcMod) {
  const items = NotesCore.toReview(srcMod, state.recall);
  if (!items.length) return;
  reviewMode = false; examMode = false; flashMode = false; quizDrillMode = false; recallMode = true;
  curMod = { id: srcMod.id, icon: srcMod.icon, title: srcMod.title,
             cards: items.map(it => it.card), _idx: items.map(it => it.i) };
  homeEl.classList.add('hidden');
  feedEl.classList.remove('hidden');
  renderCards(curMod);
  renderFeedXp();
  requestAnimationFrame(() => cardsEl.scrollTo({ top: 0, behavior: 'instant' }));
}

function exitFeed() {
  if (examTimerInterval) { clearInterval(examTimerInterval); examTimerInterval = null; }
  reviewMode = false;
  reviewOrigKeys = [];
  examMode = false;
  examQuestions = [];
  examAnswers = [];
  examTimerSec = 0;
  flashMode = false;
  quizDrillMode = false;
  recallMode = false;
  feedEl.classList.add('hidden');
  homeEl.classList.remove('hidden');
  renderHome();
}

function renderFeedXp() {
  const el = $('feedXp');
  if (examMode) {
    const m = String(Math.floor(examTimerSec / 60)).padStart(2, '0');
    const s = String(examTimerSec % 60).padStart(2, '0');
    el.textContent = `⏱ ${m}:${s}`;
    el.classList.toggle('exam-timer-warn', examTimerSec < 300);
  } else {
    el.textContent = `⚡ ${state.xp}`;
    el.classList.remove('exam-timer-warn');
  }
}

function renderCards(mod) {
  cardsEl.innerHTML = '';
  feedOffset = 0;
  // ripasso lampo: solo nella navigazione normale (non ripasso errori/esame/flash/drill)
  if (!reviewMode && !examMode && !flashMode && !quizDrillMode && !recallMode) {
    const recap = buildRecap(mod);
    if (recap) { cardsEl.appendChild(recap); feedOffset = 1; }
  }
  const builder = recallMode ? buildRecallCard : buildCard;
  mod.cards.forEach((c, i) => cardsEl.appendChild(builder(mod, c, i)));
  cardsEl.appendChild(examMode ? buildExamFinale() : buildFinale(mod));
  if (!reviewMode && !examMode && !flashMode && !quizDrillMode && !recallMode) {
    const rc = buildRecapChecklist(mod);
    if (rc) cardsEl.appendChild(rc);
  }
  cardsEl.onscroll = onFeedScroll;
  updateFeedProgress(0);
  refreshPin();
}

// ── Ripasso lampo ⚡ ──────────────────────────────────────────────────────────
// Card dinamica (non salvata in mod.cards) mostrata appena riapri un modulo
// già iniziato: rinfresca i concetti già visti in base all'avanzamento.
function buildRecap(mod) {
  const prog = state.modules[mod.id];
  if (!prog || prog.done || !prog.card) return null;       // mai iniziato o già finito → niente recap
  const resumeIdx = Math.min(prog.card, mod.cards.length - 1);
  const seen = mod.cards.slice(0, resumeIdx + 1).filter(c => c.type === 'lesson' || c.type === 'fact');
  if (seen.length < 2) return null;                         // troppo poco per un "ripasso"
  const pct = Math.round(resumeIdx / mod.cards.length * 100);
  const show = seen.slice(-6);                              // ultimi ~6 concetti, per restare "lampo"
  const more = seen.length - show.length;

  const el = document.createElement('div');
  el.className = 'card recap';
  el.innerHTML = `
    <div class="card-kicker">📍 ${mod.icon} ${mod.title} · ripasso lampo</div>
    <div class="card-emoji">⚡</div>
    <div class="card-title">Dove eri rimasto</div>
    <div class="card-text">Eri al <strong>${pct}%</strong> del modulo. Rinfresca al volo ciò che hai già visto, poi riprendi 👇</div>
    <div class="recap-list">
      ${show.map(c => `<div class="recap-item"><span class="recap-ico">${c.emoji || '•'}</span><span>${c.title}</span></div>`).join('')}
      ${more > 0 ? `<div class="recap-more">…e altri ${more} concetti prima</div>` : ''}
    </div>
    <button class="btn-big recap-btn">Riprendi da dove eri ⬇️</button>`;
  el.querySelector('.recap-btn').onclick = () => {
    cardsEl.scrollTo({ top: (resumeIdx + feedOffset) * cardsEl.clientHeight, behavior: 'smooth' });
  };
  return el;
}

function cardIndex() {
  return Math.round(cardsEl.scrollTop / cardsEl.clientHeight);
}

function noteCtx() {
  if (reviewMode || examMode || flashMode || quizDrillMode || recallMode) return null;
  if (!curMod) return null;
  const realIdx = cardIndex() - feedOffset;
  const card = curMod.cards[realIdx];
  if (realIdx < 0 || !card) return null;
  return { modId: curMod.id, i: realIdx, card };
}

function refreshPin() {
  const pin = $('notePin');
  const ctx = noteCtx();
  if (!ctx) { pin.classList.remove('visible', 'has-note'); return; }
  pin.classList.add('visible');
  const note = state.notes[NotesCore.key(ctx.modId, ctx.i)];
  pin.classList.toggle('has-note', !!(note && note.text));
}

function openNoteSheet(modId, i, card) {
  const key = NotesCore.key(modId, i);
  const existing = state.notes[key];
  $('noteSheetTitle').textContent = card.title || card.q || 'Nota';
  $('noteSheetText').value = existing ? existing.text : '';
  $('note-sheet').classList.remove('hidden');
  $('noteSheetText').focus();
  $('noteSheetSave').onclick = () => {
    saveNote(modId, i, card.title || card.q || '', $('noteSheetText').value.trim());
    $('note-sheet').classList.add('hidden');
    refreshPin();
  };
}

function saveNote(modId, i, title, text) {
  state.notes[NotesCore.key(modId, i)] = { text, title, ts: new Date().toISOString() };
  saveState();
}

function openNotesHub() {
  const list = $('notesHubList');
  list.innerHTML = '';
  const byMod = {};
  for (const [key, n] of Object.entries(state.notes)) {
    if (!n || !n.text) continue;
    const colon = key.lastIndexOf(':');
    const modId = key.slice(0, colon), i = parseInt(key.slice(colon + 1), 10);
    (byMod[modId] = byMod[modId] || []).push({ i, n });
  }
  const modIds = Object.keys(byMod);
  if (!modIds.length) { list.innerHTML = `<div class="notes-hub-empty">Nessuna nota ancora. Tocca 📝 su una card per iniziare.</div>`; }
  for (const modId of modIds) {
    const mod = MODULES.find(m => m.id === modId);
    const head = document.createElement('div');
    head.className = 'notes-hub-mod';
    head.textContent = (mod ? mod.icon + ' ' + mod.title : modId);
    list.appendChild(head);
    byMod[modId].sort((a, b) => a.i - b.i).forEach(({ i, n }) => {
      const item = document.createElement('div');
      item.className = 'notes-hub-item';
      const cardDiv = document.createElement('div');
      cardDiv.className = 'nh-card';
      cardDiv.textContent = n.title || ('Card ' + i);
      const textDiv = document.createElement('div');
      textDiv.className = 'nh-text';
      textDiv.textContent = n.text;
      item.appendChild(cardDiv);
      item.appendChild(textDiv);
      item.onclick = () => { $('notes-hub').classList.add('hidden'); openModuleAt(modId, i); };
      list.appendChild(item);
    });
  }
  $('notes-hub').classList.remove('hidden');
}

let scrollT = null;
function onFeedScroll() {
  clearTimeout(scrollT);
  scrollT = setTimeout(() => {
    const i = cardIndex();
    updateFeedProgress(i);
    const realIdx = i - feedOffset;   // scarta la card sintetica di ripasso lampo
    if (!reviewMode && !examMode && !flashMode && !quizDrillMode && realIdx >= 0) {
      const prog = state.modules[curMod.id];
      if (realIdx > (prog.card || 0) && !prog.done) { prog.card = realIdx; saveState(); }
      // XP lettura per card non-quiz mai viste
      const c = curMod.cards[realIdx];
      const key = curMod.id + ':' + realIdx;
      if (c && c.type !== 'quiz' && c.type !== 'input' && c.type !== 'mission' && !state.seen[key]) {
        state.seen[key] = true;
        gainXp(XP_LESSON, '📖');
      }
    }
    $('swipeHint').style.display = i === 0 ? '' : 'none';
    refreshPin();
  }, 120);
}

function updateFeedProgress(i) {
  const tot = curMod.cards.length + 1 + feedOffset;
  $('feedProgressFill').style.width = Math.min(100, (i / (tot - 1)) * 100) + '%';
}

// ── Costruzione card ─────────────────────────────────────────────────────────
function buildCard(mod, c, i) {
  const el = document.createElement('div');
  el.className = 'card' + (c.type === 'fact' ? ' fact' : '');
  const kicker = examMode
    ? `<div class="card-kicker exam-kicker">📋 ${curMod.title} · ${i + 1}/${mod.cards.length}</div>`
    : flashMode
      ? `<div class="card-kicker flash-kicker">📖 ${mod.icon} ${mod.title} · ${i + 1}/${mod.cards.length}</div>`
      : quizDrillMode
        ? `<div class="card-kicker drill-kicker">🎯 ${mod.icon} ${mod.title} · ${i + 1}/${mod.cards.length}</div>`
        : `<div class="card-kicker">${mod.icon} ${mod.title} · ${i + 1}/${mod.cards.length}</div>`;

  if (c.type === 'lesson') {
    el.innerHTML = `${kicker}
      <div class="card-emoji">${c.emoji}</div>
      <div class="card-title">${c.title}</div>
      <div class="card-text">${c.text}</div>
      ${c.analogy ? `<div class="analogy">${c.analogy}</div>` : ''}`;
  }
  else if (c.type === 'fact') {
    el.innerHTML = `${kicker}
      <div><span class="fact-label">💡 FUN FACT</span></div>
      <div class="card-emoji">${c.emoji}</div>
      <div class="card-title">${c.title}</div>
      <div class="card-text">${c.text}</div>`;
  }
  else if (c.type === 'terminal') {
    el.innerHTML = `${kicker}
      <div class="card-emoji">${c.emoji || '💻'}</div>
      <div class="card-title">${c.title}</div>
      <div class="card-text">${c.text || ''}</div>
      <div class="terminal">
        <div class="terminal-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
          <span class="terminal-title">tu@cachyos</span></div>
        <div class="terminal-body">
          <div class="term-cmd">${c.cmd}</div>
          <div class="term-out hidden"></div>
          <button class="term-reveal">▶ Esegui</button>
        </div>
      </div>`;
    const out = el.querySelector('.term-out'), btn = el.querySelector('.term-reveal');
    btn.onclick = () => {
      out.textContent = c.out;
      out.classList.remove('hidden');
      out.style.animation = 'slideUp .3s ease';
      btn.remove();
    };
  }
  else if (c.type === 'quiz') {
    // Mescola le opzioni a ogni render: clone con opts rimescolate e 'a' rimappato
    // alla nuova posizione corretta. Le funzioni di risposta restano invariate
    // perché confrontano sempre chosen === qc.a sulla posizione mostrata.
    const order = shuffled([...c.opts.keys()]);
    const qc = { ...c, opts: order.map(k => c.opts[k]), a: order.indexOf(c.a) };
    el.innerHTML = `${kicker}
      <div class="card-emoji">❓</div>
      <div class="card-title">${qc.q}</div>
      <div class="quiz-options"></div>
      <div class="quiz-zone"></div>`;
    const box = el.querySelector('.quiz-options');
    const zone = el.querySelector('.quiz-zone');
    qc.opts.forEach((opt, oi) => {
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.onclick = examMode
        ? () => answerExamQuiz(i, qc, oi, box, zone)
        : reviewMode
          ? () => answerReviewQuiz(i, qc, oi, box, zone)
          : quizDrillMode
            ? () => answerDrillQuiz(qc, oi, box, zone)
            : () => answerQuiz(mod, qc, i, oi, box, zone);
      box.appendChild(b);
    });
  }
  else if (c.type === 'mission') {
    el.classList.add('mission');
    const mKey = mod.id + ':' + i;
    const done = !!state.seen[mKey];
    el.innerHTML = `${kicker}
      <div class="card-emoji">${c.emoji || '🎯'}</div>
      <div><span class="mission-label">🎯 MISSIONE · +${XP_MISSION} XP</span></div>
      <div class="card-title">${c.title}</div>
      <div class="card-text">${c.text}</div>
      <div class="mission-zone">
        <button class="btn-solution">👁 Mostra soluzione</button>
        <pre class="mission-solution hidden">${c.solution}</pre>
        <button class="btn-done${done ? ' done' : ''}" ${done ? 'disabled' : ''}>
          ${done ? '✅ Già completata!' : '✅ Fatta!'}
        </button>
      </div>`;
    const solBtn = el.querySelector('.btn-solution');
    const solPre = el.querySelector('.mission-solution');
    const doneBtn = el.querySelector('.btn-done');
    solBtn.onclick = () => {
      const hidden = solPre.classList.toggle('hidden');
      solBtn.textContent = hidden ? '👁 Mostra soluzione' : '🙈 Nascondi soluzione';
    };
    if (!done) {
      doneBtn.onclick = () => {
        state.seen[mKey] = true;
        saveState();
        gainXp(XP_MISSION, '🎯');
        confetti(80);
        doneBtn.textContent = '✅ Già completata!';
        doneBtn.disabled = true;
        doneBtn.classList.add('done');
      };
    }
  }
  else if (c.type === 'input') {
    el.innerHTML = `${kicker}
      <div class="card-emoji">⌨️</div>
      <div><span class="input-label">✍️ RISPOSTA SCRITTA${examMode ? '' : ' · +' + XP_INPUT + ' XP'}</span></div>
      <div class="card-title">${c.q}</div>
      <div class="input-row">
        <input class="quiz-input" type="text" placeholder="${c.placeholder || 'scrivi qui...'}"
          autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
        <button class="btn-check">✓</button>
      </div>
      <div class="quiz-zone"></div>`;
    const inp = el.querySelector('.quiz-input');
    const btn = el.querySelector('.btn-check');
    const zone = el.querySelector('.quiz-zone');
    const submit = examMode
      ? () => answerExamInput(i, c, inp, btn, zone)
      : reviewMode
        ? () => answerReviewInput(i, c, inp, btn, zone)
        : quizDrillMode
          ? () => answerDrillInput(c, inp, btn, zone)
          : () => answerInput(mod, c, i, inp, btn, zone);
    btn.onclick = submit;
    inp.onkeydown = e => { if (e.key === 'Enter') submit(); };
  }
  return el;
}

// normalizzazione risposte scritte: trim, minuscole, spazi multipli → uno
const normAnswer = s => s.trim().toLowerCase().replace(/\s+/g, ' ');

function answerInput(mod, c, cardIdx, inp, btn, zone) {
  const given = normAnswer(inp.value);
  if (!given) { inp.focus(); return; }
  const ok = c.accept.some(a => normAnswer(a) === given);
  inp.disabled = true;
  btn.disabled = true;
  inp.classList.add(ok ? 'correct' : 'wrong');

  const prog = state.modules[mod.id];
  const key = mod.id + ':' + cardIdx;
  if (!state.seen[key]) {
    state.seen[key] = true;
    prog.quizTot++;
    if (ok) {
      prog.quizOk++;
      gainXp(XP_INPUT, '⌨️');
      confetti(60);
    } else {
      state.wrong[key] = true;
    }
    saveState();
  }

  zone.innerHTML = `
    <div class="quiz-result ${ok ? 'ok' : 'ko'}">${ok ? pick(PRAISE) : pick(ROAST)}</div>
    ${ok ? '' : `<div class="input-answer">La risposta era: <code>${c.accept[0]}</code></div>`}
    <div class="quiz-explain">${c.explain}</div>`;
}

function answerQuiz(mod, c, cardIdx, chosen, box, zone) {
  const btns = [...box.children];
  btns.forEach(b => b.disabled = true);
  const ok = chosen === c.a;
  btns[c.a].classList.add('correct');
  if (!ok) btns[chosen].classList.add('wrong');

  const prog = state.modules[mod.id];
  const key = mod.id + ':' + cardIdx;
  if (!state.seen[key]) {
    state.seen[key] = true;
    prog.quizTot++;
    if (ok) {
      prog.quizOk++;
      gainXp(XP_QUIZ, '🎯');
      confetti(40);
    } else {
      state.wrong[key] = true;
    }
    saveState();
  }

  zone.innerHTML = `
    <div class="quiz-result ${ok ? 'ok' : 'ko'}">${ok ? pick(PRAISE) : pick(ROAST)}</div>
    <div class="quiz-explain">${c.explain}</div>`;
}

// ── Ripasso errori (CP4) ─────────────────────────────────────────────────────
function answerReviewQuiz(reviewIdx, c, chosen, box, zone) {
  const btns = [...box.children];
  btns.forEach(b => b.disabled = true);
  const ok = chosen === c.a;
  btns[c.a].classList.add('correct');
  if (!ok) btns[chosen].classList.add('wrong');

  if (ok && reviewOrigKeys[reviewIdx]) {
    delete state.wrong[reviewOrigKeys[reviewIdx]];
    saveState();
    gainXp(XP_REVIEW, '🔁');
    confetti(40);
  }

  zone.innerHTML = `
    <div class="quiz-result ${ok ? 'ok' : 'ko'}">${ok ? pick(PRAISE) : pick(ROAST)}</div>
    ${ok ? '<div class="review-ok-msg">✅ Rimosso dal mazzo errori!</div>' : ''}
    <div class="quiz-explain">${c.explain}</div>`;
}

function answerReviewInput(reviewIdx, c, inp, btn, zone) {
  const given = normAnswer(inp.value);
  if (!given) { inp.focus(); return; }
  const ok = c.accept.some(a => normAnswer(a) === given);
  inp.disabled = true;
  btn.disabled = true;
  inp.classList.add(ok ? 'correct' : 'wrong');

  if (ok && reviewOrigKeys[reviewIdx]) {
    delete state.wrong[reviewOrigKeys[reviewIdx]];
    saveState();
    gainXp(XP_REVIEW, '🔁');
    confetti(60);
  }

  zone.innerHTML = `
    <div class="quiz-result ${ok ? 'ok' : 'ko'}">${ok ? pick(PRAISE) : pick(ROAST)}</div>
    ${ok ? '<div class="review-ok-msg">✅ Rimosso dal mazzo errori!</div>' : `<div class="input-answer">La risposta era: <code>${c.accept[0]}</code></div>`}
    <div class="quiz-explain">${c.explain}</div>`;
}

// ── Quiz Drill (CP14) ────────────────────────────────────────────────────────
let drillCorrect = 0, drillTotal = 0;

function answerDrillQuiz(c, chosen, box, zone) {
  const btns = [...box.children];
  btns.forEach(b => b.disabled = true);
  const ok = chosen === c.a;
  btns[c.a].classList.add('correct');
  if (!ok) btns[chosen].classList.add('wrong');
  drillTotal++;
  if (ok) drillCorrect++;
  zone.innerHTML = `
    <div class="quiz-result ${ok ? 'ok' : 'ko'}">${ok ? pick(PRAISE) : pick(ROAST)}</div>
    <div class="quiz-explain">${c.explain}</div>`;
}

function answerDrillInput(c, inp, btn, zone) {
  const given = normAnswer(inp.value);
  if (!given) { inp.focus(); return; }
  const ok = c.accept.some(a => normAnswer(a) === given);
  inp.disabled = true; btn.disabled = true;
  inp.classList.add(ok ? 'correct' : 'wrong');
  drillTotal++;
  if (ok) drillCorrect++;
  zone.innerHTML = `
    <div class="quiz-result ${ok ? 'ok' : 'ko'}">${ok ? pick(PRAISE) : pick(ROAST)}</div>
    ${ok ? '' : `<div class="input-answer">La risposta era: <code>${c.accept[0]}</code></div>`}
    <div class="quiz-explain">${c.explain}</div>`;
}

function buildFinale(mod) {
  const el = document.createElement('div');
  el.className = 'card finale';

  if (recallMode) {
    el.innerHTML = `
      <div class="card-emoji">🎉</div>
      <div class="card-title">Ripasso completato!</div>
      <div class="card-text">Hai ripreso in mano i concetti che ti erano sfuggiti. Tornaci quando vuoi.</div>
      <button class="btn-big" style="margin-top:1.2rem">Torna al Dojo 🐧</button>`;
    el.querySelector('.btn-big').onclick = exitFeed;
    return el;
  }

  if (flashMode) {
    el.innerHTML = `
      <div class="card-emoji">📖</div>
      <div class="card-title">Fine delle flashcard!</div>
      <div class="card-text">Hai rivisto <strong>${mod.cards.length}</strong> lezioni e fun fact.<br>Ora torna al feed completo per fare i quiz! 🎯</div>
      <div class="flash-finale-tip">Modalità ripasso: nessun XP, nessun progresso salvato. Per guadagnare XP usa il feed normale.</div>
      <button class="btn-big" style="margin-top:1.2rem">Torna al Dojo 🐧</button>`;
    el.querySelector('.btn-big').onclick = exitFeed;
    return el;
  }

  if (quizDrillMode) {
    const pct = drillTotal ? Math.round(drillCorrect / drillTotal * 100) : 0;
    el.innerHTML = `
      <div class="card-emoji">🎯</div>
      <div class="card-title">Sessione drill completata!</div>
      <div class="card-text">Corrette: <strong>${drillCorrect} / ${drillTotal}</strong> — precisione <strong>${pct}%</strong><br>
        ${pct >= 80 ? '🔥 Ottimo! Sei pronto per l\'esame su questo modulo.' : pct >= 60 ? '💪 Buono! Ripassaci ancora per consolidare.' : '📖 Continua a studiare, andrà meglio!'}</div>
      <div class="drill-finale-tip">Modalità drill: nessun XP assegnato. Per avanzare nel modulo usa il feed normale.</div>
      <button class="btn-big" style="margin-top:1.2rem">Torna al Dojo 🐧</button>`;
    el.querySelector('.btn-big').onclick = exitFeed;
    return el;
  }

  if (reviewMode) {
    el.innerHTML = `
      <div class="card-emoji">🔁</div>
      <div class="card-title">Fine del ripasso!</div>
      <div class="card-text" id="finaleStats"></div>
      <button class="btn-big">Torna al Dojo 🐧</button>`;
    el.querySelector('.btn-big').onclick = exitFeed;
    new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      const remaining = Object.keys(state.wrong).length;
      const statsEl = el.querySelector('#finaleStats');
      if (remaining === 0) {
        statsEl.innerHTML = `Hai azzerato tutti gli errori! 🎉<br>Cervello laser! 🧠⚡`;
        confetti(200);
      } else {
        statsEl.innerHTML = `Errori rimasti: <strong>${remaining}</strong><br>Continua a ripassare! 💪`;
      }
    }, { root: cardsEl, threshold: .6 }).observe(el);
    return el;
  }

  el.innerHTML = `
    <div class="card-emoji">🏆</div>
    <div class="card-title">Modulo completato!</div>
    <div class="card-text" id="finaleStats"></div>
    <button class="btn-big">Torna al Dojo 🐧</button>`;
  el.querySelector('.btn-big').onclick = exitFeed;

  // observer: quando la card finale entra in vista → modulo completo
  new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    const prog = state.modules[mod.id];
    el.querySelector('#finaleStats').innerHTML =
      `Quiz azzeccati: <strong>${prog.quizOk}/${prog.quizTot || mod.cards.filter(c => c.type === 'quiz').length}</strong><br>Hai un cervello sempre più kernel-compatibile. 🧠🐧`;
    if (!prog.done) {
      prog.done = true;
      saveState();
      gainXp(XP_MODULE, '🏆 modulo!');
      confetti(220);
    }
  }, { root: cardsEl, threshold: .6 }).observe(el);
  return el;
}

function buildRecapChecklist(mod) {
  const items = NotesCore.concepts(mod);
  if (items.length < 2) return null;
  const el = document.createElement('div');
  el.className = 'card recap-check';
  const rows = items.map(({ card, i }) => {
    const key = NotesCore.key(mod.id, i);
    const checked = !!(state.recall[key] && state.recall[key].val);
    return `<label class="rc-item${checked ? ' checked' : ''}" data-key="${key}">
      <input type="checkbox" ${checked ? 'checked' : ''}>
      <span class="rc-ico">${card.emoji || '•'}</span>
      <span class="rc-body"><span class="rc-title">${card.title}</span>
      <span class="rc-essence">${NotesCore.essenceOf(card)}</span></span></label>`;
  }).join('');
  el.innerHTML = `
    <div class="card-kicker">✅ ${mod.icon} ${mod.title} · recap</div>
    <div class="card-title">Cosa ti ricordi?</div>
    <div class="card-text">Spunta i concetti che padroneggi. Quelli che lasci non spuntati te li riproponiamo. 👇</div>
    <div class="rc-list">${rows}</div>
    <button class="btn-big rc-review-btn">Ripassa i <span class="rc-count"></span> non spuntati ⬇️</button>`;
  const countEl = el.querySelector('.rc-count');
  const reviewBtn = el.querySelector('.rc-review-btn');
  const refreshCount = () => {
    const n = NotesCore.reviewCount(mod, state.recall);
    countEl.textContent = n;
    reviewBtn.style.display = n === 0 ? 'none' : '';
  };
  el.querySelectorAll('.rc-item input').forEach(input => {
    input.onchange = () => {
      const key = input.closest('.rc-item').dataset.key;
      state.recall[key] = { val: input.checked, ts: new Date().toISOString() };
      input.closest('.rc-item').classList.toggle('checked', input.checked);
      saveState();
      refreshCount();
    };
  });
  reviewBtn.onclick = () => openRecallReview(mod);
  refreshCount();
  return el;
}

function buildRecallCard(mod, card, idx) {
  const origI = mod._idx ? mod._idx[idx] : idx;
  const key = NotesCore.key(mod.id, origI);
  const el = document.createElement('div');
  el.className = 'card recall-card';
  el.innerHTML = `
    <div class="card-kicker">📌 ${mod.icon} ${mod.title} · ripasso</div>
    <div class="card-emoji">${card.emoji || '🧠'}</div>
    <div class="card-title">${card.title}</div>
    <button class="btn-solution rc-show">Mostra</button>
    <div class="recall-essence hidden">${NotesCore.essenceOf(card)}</div>
    <div class="recall-actions hidden">
      <button class="btn-solution rc-still">Ancora no</button>
      <button class="btn-done rc-got" style="flex:1">Ora la ricordo ✓</button>
    </div>`;
  const essence = el.querySelector('.recall-essence');
  const actions = el.querySelector('.recall-actions');
  el.querySelector('.rc-show').onclick = (e) => {
    e.target.classList.add('hidden');
    essence.classList.remove('hidden');
    actions.classList.remove('hidden');
  };
  el.querySelector('.rc-got').onclick = () => {
    state.recall[key] = { val: true, ts: new Date().toISOString() };
    saveState();
    el.classList.add('recall-done');
    cardsEl.scrollTo({ top: (Array.prototype.indexOf.call(cardsEl.children, el) + 1) * cardsEl.clientHeight, behavior: 'smooth' });
  };
  el.querySelector('.rc-still').onclick = () => {
    const finale = cardsEl.querySelector('.card.finale');
    cardsEl.insertBefore(el, finale);   // "va in fondo": prima della finale
    cardsEl.scrollTo({ top: cardsEl.scrollTop + cardsEl.clientHeight, behavior: 'smooth' });
  };
  return el;
}

// ── Simulatore Esame (CP10 + CP13) ───────────────────────────────────────────
const EXAM_COUNT_HALF = 30;
const MODULES_101 = () => MODULES.filter(m => ['m01','m02','m03','m04','m05'].includes(m.id));
const MODULES_102 = () => MODULES.filter(m => ['m06','m07','m08','m09','m10'].includes(m.id));

function startExam101() { startExamWith(MODULES_101(), 'Esame 101', EXAM_COUNT_HALF); }
function startExam102() { startExamWith(MODULES_102(), 'Esame 102', EXAM_COUNT_HALF); }
function startExamAll() { startExamWith(MODULES, 'Esame Completo', EXAM_COUNT); }

function startExamWith(mods, label, count) {
  const pool = [];
  for (const mod of mods) {
    QuizCore.quizPool(mod).forEach((card, idx) => {
      pool.push({ card, modId: mod.id, origIdx: idx });
    });
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  examQuestions = pool.slice(0, Math.min(count, pool.length));
  examAnswers = new Array(examQuestions.length).fill(null);
  examMode = true;
  flashMode = false;
  examTimerSec = EXAM_DURATION;
  curMod = { id: 'exam', icon: '📋', title: label, cards: examQuestions.map(q => q.card) };
  homeEl.classList.add('hidden');
  feedEl.classList.remove('hidden');
  renderCards(curMod);
  renderFeedXp();
  examTimerInterval = setInterval(() => {
    examTimerSec--;
    renderFeedXp();
    if (examTimerSec <= 0) {
      clearInterval(examTimerInterval);
      examTimerInterval = null;
      cardsEl.scrollTo({ top: curMod.cards.length * cardsEl.clientHeight, behavior: 'smooth' });
    }
  }, 1000);
}

function answerExamQuiz(examIdx, c, chosen, box, zone) {
  const btns = [...box.children];
  btns.forEach(b => b.disabled = true);
  const ok = chosen === c.a;
  btns[c.a].classList.add('correct');
  if (!ok) btns[chosen].classList.add('wrong');
  if (examAnswers[examIdx] === null) examAnswers[examIdx] = ok;
  zone.innerHTML = `
    <div class="quiz-result ${ok ? 'ok' : 'ko'}">${ok ? pick(PRAISE) : pick(ROAST)}</div>
    <div class="quiz-explain">${c.explain}</div>`;
}

function answerExamInput(examIdx, c, inp, btn, zone) {
  const given = normAnswer(inp.value);
  if (!given) { inp.focus(); return; }
  const ok = c.accept.some(a => normAnswer(a) === given);
  inp.disabled = true;
  btn.disabled = true;
  inp.classList.add(ok ? 'correct' : 'wrong');
  if (examAnswers[examIdx] === null) examAnswers[examIdx] = ok;
  zone.innerHTML = `
    <div class="quiz-result ${ok ? 'ok' : 'ko'}">${ok ? pick(PRAISE) : pick(ROAST)}</div>
    ${ok ? '' : `<div class="input-answer">La risposta era: <code>${c.accept[0]}</code></div>`}
    <div class="quiz-explain">${c.explain}</div>`;
}

function buildExamFinale() {
  const el = document.createElement('div');
  el.className = 'card finale exam-finale';
  el.innerHTML = `
    <div class="card-emoji">📋</div>
    <div class="card-title">Risultati Esame</div>
    <div id="examResults"><div class="exam-loading">Calcolo in corso…</div></div>
    <button class="btn-big">Torna al Dojo 🐧</button>`;
  el.querySelector('.btn-big').onclick = exitFeed;

  new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    if (examTimerInterval) { clearInterval(examTimerInterval); examTimerInterval = null; }
    const total = examQuestions.length;
    const correct = examAnswers.filter(a => a === true).length;
    const unanswered = examAnswers.filter(a => a === null).length;
    const score = Math.round(200 + (correct / total) * 600);
    const passed = score >= EXAM_PASS_SCORE;
    const used = EXAM_DURATION - examTimerSec;
    const mu = String(Math.floor(used / 60)).padStart(2, '0');
    const su = String(used % 60).padStart(2, '0');
    const barPct = ((score - 200) / 600 * 100).toFixed(1);
    el.querySelector('#examResults').innerHTML = `
      <div class="exam-score ${passed ? 'pass' : 'fail'}">${score}</div>
      <div class="exam-score-label">${passed ? '✅ PROMOSSO!' : '❌ Non sufficiente'}</div>
      <div class="exam-stats">
        <div>Corrette: <strong>${correct} / ${total}</strong></div>
        <div>Non risposte: <strong>${unanswered}</strong></div>
        <div>Soglia: <strong>${EXAM_PASS_SCORE} / 800</strong></div>
        <div>Tempo: <strong>${mu}:${su}</strong></div>
      </div>
      <div class="exam-bar-wrap">
        <div class="exam-bar">
          <div class="exam-bar-fill ${passed ? 'pass' : 'fail'}" style="width:${barPct}%"></div>
          <div class="exam-bar-threshold"></div>
        </div>
        <div class="exam-bar-labels">
          <span>200</span><span style="color:var(--gold)">▲ 500 pass</span><span>800</span>
        </div>
      </div>
      ${passed ? '<div class="exam-tip">🎉 Ora sei pronto per il vero esame LPI!</div>' : '<div class="exam-tip">💡 Ripassare i moduli con più errori e usare il mazzo "Ripasso errori"!</div>'}`;
    if (passed) confetti(300);
  }, { root: cardsEl, threshold: .5 }).observe(el);
  return el;
}

// ── Toast ────────────────────────────────────────────────────────────────────
let toastT = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  t.style.animation = 'none';
  void t.offsetWidth; // restart animation
  t.style.animation = '';
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.add('hidden'), 1800);
}

// ── Coriandoli ───────────────────────────────────────────────────────────────
const cvs = $('confetti'), ctx = cvs.getContext('2d');
let parts = [], rafId = null;

function confetti(n) {
  cvs.width = innerWidth; cvs.height = innerHeight;
  const colors = ['#7c5cff', '#00e5a0', '#ffc83d', '#ff4d6d', '#4dc9ff'];
  for (let i = 0; i < n; i++) {
    parts.push({
      x: Math.random() * cvs.width, y: -20 - Math.random() * 80,
      vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4,
      s: 5 + Math.random() * 6, r: Math.random() * Math.PI,
      vr: (Math.random() - .5) * .3, c: pick(colors),
    });
  }
  if (!rafId) tick();
}

function tick() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  parts = parts.filter(p => p.y < cvs.height + 30);
  for (const p of parts) {
    p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vy += .05;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
    ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6);
    ctx.restore();
  }
  rafId = parts.length ? requestAnimationFrame(tick) : null;
}

// ── Ricerca globale (CP14) ────────────────────────────────────────────────────
function openModuleAt(modId, cardIdx) {
  const mod = MODULES.find(m => m.id === modId);
  if (!mod) return;
  clearSearch();
  $('searchInput').value = '';
  curMod = mod;
  reviewMode = false; examMode = false; flashMode = false; quizDrillMode = false;
  state.modules[mod.id] = state.modules[mod.id] || { card: 0, done: false, quizOk: 0, quizTot: 0 };
  homeEl.classList.add('hidden');
  feedEl.classList.remove('hidden');
  renderCards(mod);
  renderFeedXp();
  requestAnimationFrame(() => {
    cardsEl.scrollTo({ top: (cardIdx + feedOffset) * cardsEl.clientHeight, behavior: 'instant' });
  });
}

function clearSearch() {
  $('searchResults').classList.add('hidden');
  $('searchResults').innerHTML = '';
  $('moduleList').classList.remove('hidden');
}

function doSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) { clearSearch(); return; }

  const results = [];
  for (const mod of MODULES) {
    mod.cards.forEach((c, idx) => {
      const haystack = [c.title, c.q, c.text, c.analogy, c.cmd, c.out]
        .filter(Boolean).join(' ').toLowerCase();
      if (haystack.includes(q)) {
        results.push({ mod, c, idx });
      }
    });
  }

  $('moduleList').classList.add('hidden');
  const resEl = $('searchResults');
  resEl.classList.remove('hidden');

  if (!results.length) {
    resEl.innerHTML = `<div class="search-empty">Nessun risultato per "<strong>${query}</strong>"</div>`;
    return;
  }

  const typeLabel = { lesson: 'lezione', fact: 'fun fact', terminal: 'terminale', quiz: 'quiz', input: 'risposta', mission: 'missione' };
  resEl.innerHTML = results.slice(0, 30).map(({ mod, c, idx }) => {
    const title = c.title || c.q || '—';
    const type = c.type || 'lesson';
    return `<div class="search-result" data-mod="${mod.id}" data-idx="${idx}">
      <div class="sr-mod">${mod.icon} ${mod.title}</div>
      <div class="sr-title">${title}</div>
      <span class="sr-type ${type}">${typeLabel[type] || type}</span>
    </div>`;
  }).join('') + (results.length > 30 ? `<div class="search-empty">…e altri ${results.length - 30} risultati. Affina la ricerca.</div>` : '');

  resEl.querySelectorAll('.search-result').forEach(el => {
    el.addEventListener('click', () => {
      openModuleAt(el.dataset.mod, parseInt(el.dataset.idx, 10));
    });
  });
}

let searchDebounce = null;
function setupSearch() {
  $('searchInput').addEventListener('input', e => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => doSearch(e.target.value), 180);
  });
}

// ── Sync cloud (profilo) ──────────────────────────────────────────────────────
function showProfileError(msg) {
  const el = $('profile-error'); if (el) el.textContent = msg || '';
}
function renderProfileButton() {
  const btn = $('btnProfile'); if (!btn) return;
  const p = (typeof Sync !== 'undefined') ? Sync.activeProfile() : null;
  btn.textContent = p ? `👤 ${p.name}` : '👤 Accedi';
}
function openProfile() {
  const p = (typeof Sync !== 'undefined') ? Sync.activeProfile() : null;
  $('profile-logged').classList.toggle('hidden', !p);
  $('profile-form').classList.toggle('hidden', !!p);
  if (p) $('profile-current').textContent = p.name;
  showProfileError('');
  $('profile-overlay').classList.remove('hidden');
}
function closeProfile() { $('profile-overlay').classList.add('hidden'); }
function submitProfile() {
  loginProfilo($('profile-name').value, $('profile-code').value);
}

async function syncOnStartup() {
  if (typeof Sync === 'undefined' || !Sync._client || !Sync.activeProfile()) return;
  // Guardia: un solo merge-con-reload per sessione (no loop).
  if (sessionStorage.getItem('lds-adopted')) return;
  const remote = await Sync.pull();
  if (!remote) { Sync.push(state); return; }   // niente in cloud: spingi il locale
  // Unione non distruttiva: non si perde mai progresso (né locale né remoto).
  const merged = Sync.mergeStates(state, remote.state);
  if (JSON.stringify(merged) === JSON.stringify(state)) {
    Sync.push(state);   // locale già completo: allinea il cloud se serve
    return;
  }
  sessionStorage.setItem('lds-adopted', '1');
  state = { ...defaultState(), ...merged };
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  localStorage.setItem(UPDATED_KEY, new Date().toISOString());
  try { await Sync.saveNow(state); } catch (e) { /* offline: resta in locale */ }
  location.reload();
}

async function loginProfilo(name, code) {
  if (typeof Sync === 'undefined' || !Sync._client) {
    showProfileError('Cloud non configurato (manca js/config.js).');
    return;
  }
  const res = await Sync.login(name, code, state);
  if (!res.ok) { showProfileError(res.error); return; }
  if (res.exists && res.remote) {
    // Unisci progresso locale e remoto: non si perde nulla di nessuno dei due.
    const merged = Sync.mergeStates(state, res.remote.state);
    state = { ...defaultState(), ...merged };
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    localStorage.setItem(UPDATED_KEY, new Date().toISOString());
    // Spingi SUBITO il merge: il reload qui sotto ucciderebbe il debounce di push.
    try { await Sync.saveNow(state); } catch (e) { /* offline: resterà in locale */ }
  }
  location.reload();
}

function logoutProfilo() {
  if (typeof Sync !== 'undefined') Sync.logout();
  location.reload();
}

// ── Avvio ────────────────────────────────────────────────────────────────────
$('btnExit').onclick = exitFeed;
$('btnNotesHub').onclick = openNotesHub;
$('btnNotesHubClose').onclick = () => $('notes-hub').classList.add('hidden');
$('noteSheetCancel').onclick = () => $('note-sheet').classList.add('hidden');
$('notePin').onclick = () => {
  const ctx = noteCtx();
  if (ctx) openNoteSheet(ctx.modId, ctx.i, ctx.card);
};
initTheme();
setupSearch();
renderHome();
renderProfileButton();

// Sync cloud: attiva solo se config valorizzata
if (typeof Sync !== 'undefined' && typeof SUPABASE_URL !== 'undefined'
    && window.supabase && /^https?:\/\//.test(SUPABASE_URL)
    && !SUPABASE_URL.includes('INSERISCI')) {
  Sync.init(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
}
syncOnStartup();
