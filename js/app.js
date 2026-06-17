/* ═══════════ LINUX DOJO — motore ═══════════ */
'use strict';

// ── Stato persistente ────────────────────────────────────────────────────────
const STORE_KEY = 'linux-dojo-v1';

const defaultState = () => ({
  xp: 0,
  streak: 0,
  lastDay: null,
  modules: {},   // id -> { card: ultimaCardVista, done: bool, quizOk: n, quizTot: n }
  seen: {},      // "modId:cardIdx" -> true (XP già assegnata)
  wrong: {},     // "modId:cardIdx" -> true (quiz sbagliati al primo tentativo)
});

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch (e) { /* storage corrotto: si riparte */ }
  return defaultState();
}

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
}

// ── Streak giornaliero ───────────────────────────────────────────────────────
function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastDay === today) return;
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  state.streak = (state.lastDay === yesterday) ? state.streak + 1 : 1;
  state.lastDay = today;
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

// ── DOM refs ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const homeEl = $('home'), feedEl = $('feed'), cardsEl = $('cards');

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

  // Card simulatore esame — sempre visibile in fondo alla lista
  const examEl = document.createElement('div');
  examEl.className = 'module-card exam-card';
  examEl.innerHTML = `
    <div class="module-icon">📋</div>
    <div class="module-meta">
      <div class="module-title">Simulatore Esame LPIC-1</div>
      <div class="module-sub">60 domande random · 90 min · punteggio 200–800 · soglia 500</div>
    </div>
    <div class="module-badge">🎓</div>`;
  examEl.onclick = startExam;
  list.appendChild(examEl);

  MODULES.forEach((mod, i) => {
    const prog = state.modules[mod.id] || {};
    const tot = mod.cards.length;
    const at = Math.min(prog.card || 0, tot);
    const pct = prog.done ? 100 : Math.round(at / tot * 100);
    const locked = !mod.cards.length;

    const el = document.createElement('div');
    el.className = 'module-card' + (prog.done ? ' done' : '') + (locked ? ' locked' : '');
    el.innerHTML = `
      <div class="module-icon">${mod.icon}</div>
      <div class="module-meta">
        <div class="module-title">${mod.title}</div>
        <div class="module-sub">${locked ? '🔒 In arrivo al prossimo checkpoint' : mod.sub + ' · ' + tot + ' card'}</div>
        ${locked ? '' : `<div class="module-progress"><div class="module-progress-fill" style="width:${pct}%"></div></div>`}
      </div>
      <div class="module-badge">${prog.done ? '🏆' : pct > 0 ? pct + '%' : ''}</div>`;
    if (!locked) el.onclick = () => openModule(mod);
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

function openModule(mod) {
  curMod = mod;
  reviewMode = false;
  state.modules[mod.id] = state.modules[mod.id] || { card: 0, done: false, quizOk: 0, quizTot: 0 };
  homeEl.classList.add('hidden');
  feedEl.classList.remove('hidden');
  renderCards(mod);
  renderFeedXp();
  // riprendi da dove eri
  const at = state.modules[mod.id].done ? 0 : (state.modules[mod.id].card || 0);
  requestAnimationFrame(() => {
    cardsEl.scrollTo({ top: at * cardsEl.clientHeight, behavior: 'instant' });
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

  reviewMode = true;
  curMod = { id: 'review', icon: '🔁', title: 'Ripasso errori', cards };
  homeEl.classList.add('hidden');
  feedEl.classList.remove('hidden');
  renderCards(curMod);
  renderFeedXp();
}

function exitFeed() {
  if (examTimerInterval) { clearInterval(examTimerInterval); examTimerInterval = null; }
  reviewMode = false;
  reviewOrigKeys = [];
  examMode = false;
  examQuestions = [];
  examAnswers = [];
  examTimerSec = 0;
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
  mod.cards.forEach((c, i) => cardsEl.appendChild(buildCard(mod, c, i)));
  cardsEl.appendChild(examMode ? buildExamFinale() : buildFinale(mod));
  cardsEl.onscroll = onFeedScroll;
  updateFeedProgress(0);
}

function cardIndex() {
  return Math.round(cardsEl.scrollTop / cardsEl.clientHeight);
}

let scrollT = null;
function onFeedScroll() {
  clearTimeout(scrollT);
  scrollT = setTimeout(() => {
    const i = cardIndex();
    updateFeedProgress(i);
    if (!reviewMode && !examMode) {
      const prog = state.modules[curMod.id];
      if (i > (prog.card || 0) && !prog.done) { prog.card = i; saveState(); }
      // XP lettura per card non-quiz mai viste
      const c = curMod.cards[i];
      const key = curMod.id + ':' + i;
      if (c && c.type !== 'quiz' && c.type !== 'input' && c.type !== 'mission' && !state.seen[key]) {
        state.seen[key] = true;
        gainXp(XP_LESSON, '📖');
      }
    }
    $('swipeHint').style.display = i === 0 ? '' : 'none';
  }, 120);
}

function updateFeedProgress(i) {
  const tot = curMod.cards.length + 1;
  $('feedProgressFill').style.width = Math.min(100, (i / (tot - 1)) * 100) + '%';
}

// ── Costruzione card ─────────────────────────────────────────────────────────
function buildCard(mod, c, i) {
  const el = document.createElement('div');
  el.className = 'card' + (c.type === 'fact' ? ' fact' : '');
  const kicker = examMode
    ? `<div class="card-kicker exam-kicker">📋 Esame LPIC-1 · ${i + 1}/${mod.cards.length}</div>`
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
    el.innerHTML = `${kicker}
      <div class="card-emoji">❓</div>
      <div class="card-title">${c.q}</div>
      <div class="quiz-options"></div>
      <div class="quiz-zone"></div>`;
    const box = el.querySelector('.quiz-options');
    const zone = el.querySelector('.quiz-zone');
    c.opts.forEach((opt, oi) => {
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.onclick = examMode
        ? () => answerExamQuiz(i, c, oi, box, zone)
        : reviewMode
          ? () => answerReviewQuiz(i, c, oi, box, zone)
          : () => answerQuiz(mod, c, i, oi, box, zone);
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

function buildFinale(mod) {
  const el = document.createElement('div');
  el.className = 'card finale';

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

// ── Simulatore Esame (CP10) ──────────────────────────────────────────────────
function startExam() {
  const pool = [];
  for (const mod of MODULES) {
    mod.cards.forEach((card, idx) => {
      if (card.type === 'quiz' || card.type === 'input')
        pool.push({ card, modId: mod.id, origIdx: idx });
    });
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  examQuestions = pool.slice(0, Math.min(EXAM_COUNT, pool.length));
  examAnswers = new Array(examQuestions.length).fill(null);
  examMode = true;
  examTimerSec = EXAM_DURATION;
  curMod = { id: 'exam', icon: '📋', title: 'Esame LPIC-1', cards: examQuestions.map(q => q.card) };
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

// ── Avvio ────────────────────────────────────────────────────────────────────
$('btnExit').onclick = exitFeed;
renderHome();
