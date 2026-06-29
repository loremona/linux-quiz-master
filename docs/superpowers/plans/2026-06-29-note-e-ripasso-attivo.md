# Note + Ripasso attivo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere note contestuali (pin su ogni card) e un recap-checklist di fine modulo con ripasso mirato dei concetti non spuntati.

**Architecture:** La logica pura e testabile (merge sync, essenza concetti, chiavi, conteggi) vive in moduli standalone (`js/sync.js` esistente + nuovo `js/notes-core.js`) testati con `gjs`, come già fa `test/sync-test.js`. Il cablaggio DOM vive in `js/app.js` e si verifica manualmente nel browser. Stato persistente in `localStorage` + sync Supabase non distruttivo.

**Tech Stack:** Vanilla JS (no build, no Node), PWA con Service Worker, test runner `gjs` (GNOME JS), Supabase per il sync.

## Global Constraints

- Nessuna dipendenza nuova, nessun build step: solo file statici.
- I test di logica pura si eseguono con `gjs test/<file>.js` dalla root; exit 0 = pass.
- Chiavi card sempre nel formato `"modId:cardIdx"` (come `state.seen`/`state.wrong`).
- Ogni nuovo asset JS va aggiunto a `index.html` E all'array `ASSETS` di `sw.js`.
- Ogni modifica a file in cache va accompagnata dal bump del cache name in `sw.js` (attuale: `linux-dojo-sw-v7`).
- Merge sync: per `notes`/`recall` vince il `ts` più recente per-chiave; una chiave presente da un solo lato non si cancella mai.
- "Svuotare" una nota = `text:""` con `ts` nuovo; "togliere spunta" = `val:false` con `ts` nuovo. Mai cancellare la chiave (il merge a unione la farebbe resuscitare).
- Concetti = solo card di tipo `lesson` e `fact`.

---

### Task 1: Merge sync per `notes` e `recall`

**Files:**
- Modify: `js/sync.js:46-57` (funzione `mergeStates`), `js/sync.js:130` e `js/sync.js:138` (export)
- Test: `test/sync-test.js` (aggiunta test)

**Interfaces:**
- Produces: `Sync.mergeByTimestamp(a, b)` → oggetto unito per-chiave (newest `ts` wins); `mergeStates` ora include `notes` e `recall` nell'output.

- [ ] **Step 1: Write the failing test**

In fondo a `test/sync-test.js`, prima del blocco di esecuzione finale, aggiungi:

```js
test('mergeByTimestamp: chiave da un solo lato sopravvive', () => {
  const out = Sync.mergeByTimestamp({ 'm01:1': { text: 'a', ts: '2026-01-01' } }, {});
  deepEq(out, { 'm01:1': { text: 'a', ts: '2026-01-01' } });
});
test('mergeByTimestamp: vince il ts più recente', () => {
  const a = { 'm01:1': { text: 'vecchia', ts: '2026-01-01T00:00:00Z' } };
  const b = { 'm01:1': { text: 'nuova',   ts: '2026-02-01T00:00:00Z' } };
  eq(Sync.mergeByTimestamp(a, b)['m01:1'].text, 'nuova');
  eq(Sync.mergeByTimestamp(b, a)['m01:1'].text, 'nuova');
});
test('mergeStates: include notes e recall uniti', () => {
  const a = { notes: { 'm01:1': { text: 'x', ts: '2026-02-01' } }, recall: {} };
  const b = { notes: {}, recall: { 'm01:2': { val: true, ts: '2026-01-01' } } };
  const out = Sync.mergeStates(a, b);
  eq(out.notes['m01:1'].text, 'x');
  eq(out.recall['m01:2'].val, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `gjs test/sync-test.js`
Expected: FAIL — `Sync.mergeByTimestamp is not a function` / `out.notes` undefined.

- [ ] **Step 3: Write minimal implementation**

In `js/sync.js`, dopo `pickNewest` (riga ~26) aggiungi:

```js
  function mergeByTimestamp(a, b) {
    a = a || {}; b = b || {};
    const out = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const x = a[k], y = b[k];
      if (!x) { out[k] = y; continue; }
      if (!y) { out[k] = x; continue; }
      const xt = Date.parse(x.ts || '') || -Infinity;
      const yt = Date.parse(y.ts || '') || -Infinity;
      out[k] = yt > xt ? y : x;
    }
    return out;
  }
```

In `mergeStates` (riga ~48-56), aggiungi due righe prima di `modules:`:

```js
      notes: mergeByTimestamp(a.notes, b.notes),
      recall: mergeByTimestamp(a.recall, b.recall),
```

In entrambi gli export (riga ~130 e ~138) aggiungi `mergeByTimestamp` all'elenco.

- [ ] **Step 4: Run test to verify it passes**

Run: `gjs test/sync-test.js`
Expected: PASS (tutti i test, vecchi e nuovi).

- [ ] **Step 5: Commit**

```bash
git add js/sync.js test/sync-test.js
git commit -m "feat(sync): merge per-chiave di notes e recall (newest-ts-wins)"
```

---

### Task 2: Modulo logico puro `notes-core.js`

**Files:**
- Create: `js/notes-core.js`
- Test: `test/notes-core-test.js`

**Interfaces:**
- Produces (global `NotesCore`):
  - `key(modId, i)` → `"modId:i"` (string)
  - `isConcept(card)` → bool (`type` è `lesson` o `fact`)
  - `concepts(mod)` → `[{ card, i }]` solo concetti, con indice originale
  - `essenceOf(card)` → string (per `lesson`: `card.analogy`; per `fact`: prima frase di `text` senza HTML)
  - `toReview(mod, recall)` → `[{ card, i }]` concetti con `recall[key]?.val` non true
  - `reviewCount(mod, recall)` → number

- [ ] **Step 1: Write the failing test**

Crea `test/notes-core-test.js`:

```js
'use strict';
/* Test di js/notes-core.js — eseguibile con: gjs test/notes-core-test.js */
const GLib = imports.gi.GLib;
const System = imports.system;
const [, bytes] = GLib.file_get_contents('js/notes-core.js');
(0, eval)(new TextDecoder().decode(bytes));

let failures = 0;
function test(name, fn) {
  try { fn(); print('  ok  ' + name); }
  catch (e) { failures++; print('FAIL  ' + name + ' :: ' + e.message); }
}
function eq(a, b, m) { if (a !== b) throw new Error((m||'eq')+`: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }

const mod = { id: 'm01', cards: [
  { type: 'lesson', title: 'Kernel', analogy: 'Il kernel è il cuoco.' },
  { type: 'quiz', q: '?' },
  { type: 'fact', title: 'Storia', text: '<strong>Nel 1991</strong> Linus scrisse. Oggi domina.' },
]};

test('key formatta modId:idx', () => eq(NotesCore.key('m01', 2), 'm01:2'));
test('concepts esclude i quiz', () => eq(NotesCore.concepts(mod).length, 2));
test('concepts mantiene indice originale', () => eq(NotesCore.concepts(mod)[1].i, 2));
test('essenceOf lesson usa analogy', () => eq(NotesCore.essenceOf(mod.cards[0]), 'Il kernel è il cuoco.'));
test('essenceOf fact: prima frase senza HTML', () => eq(NotesCore.essenceOf(mod.cards[2]), 'Nel 1991 Linus scrisse.'));
test('toReview esclude gli spuntati', () => {
  const recall = { 'm01:0': { val: true, ts: 'x' } };
  const r = NotesCore.toReview(mod, recall);
  eq(r.length, 1); eq(r[0].i, 2);
});
test('reviewCount conta i non spuntati', () => eq(NotesCore.reviewCount(mod, {}), 2));

print(failures ? `\n${failures} FALLITI` : '\nTUTTI PASSATI');
System.exit(failures ? 1 : 0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `gjs test/notes-core-test.js`
Expected: FAIL — `notes-core.js` non esiste (file_get_contents error) o `NotesCore is not defined`.

- [ ] **Step 3: Write minimal implementation**

Crea `js/notes-core.js`:

```js
/* ═══════════ Linux Dojo — logica pura note/ripasso (testabile) ═══════════ */
'use strict';

(function (root) {
  function key(modId, i) { return modId + ':' + i; }

  function isConcept(card) { return !!card && (card.type === 'lesson' || card.type === 'fact'); }

  function concepts(mod) {
    const out = [];
    (mod.cards || []).forEach((card, i) => { if (isConcept(card)) out.push({ card, i }); });
    return out;
  }

  function stripHtml(s) { return String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); }

  function essenceOf(card) {
    if (!card) return '';
    if (card.type === 'lesson' && card.analogy) return stripHtml(card.analogy);
    const text = stripHtml(card.text);
    const m = text.match(/^[^.!?]*[.!?]/);
    return m ? m[0].trim() : text;
  }

  function toReview(mod, recall) {
    recall = recall || {};
    return concepts(mod).filter(({ i }) => {
      const r = recall[key(mod.id, i)];
      return !(r && r.val);
    });
  }

  function reviewCount(mod, recall) { return toReview(mod, recall).length; }

  root.NotesCore = { key, isConcept, concepts, essenceOf, toReview, reviewCount };
})(typeof globalThis !== 'undefined' ? globalThis : this);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `gjs test/notes-core-test.js`
Expected: `TUTTI PASSATI`, exit 0.

- [ ] **Step 5: Commit**

```bash
git add js/notes-core.js test/notes-core-test.js
git commit -m "feat(notes): modulo logico puro NotesCore (concepts, essenza, toReview)"
```

---

### Task 3: Cablaggio stato + caricamento modulo

**Files:**
- Modify: `js/app.js:7-14` (`defaultState`)
- Modify: `index.html` (riga ~50, prima di `js/app.js`)
- Modify: `sw.js:6` (cache bump) e `sw.js:8-29` (ASSETS)

**Interfaces:**
- Consumes: `NotesCore` (Task 2), `Sync.mergeStates` esteso (Task 1).
- Produces: `state.notes` e `state.recall` esistono sempre (default `{}`).

- [ ] **Step 1: Estendi `defaultState`**

In `js/app.js`, dentro l'oggetto ritornato da `defaultState` (dopo `wrong: {},`):

```js
  notes: {},     // "modId:cardIdx" -> { text, title, ts }
  recall: {},    // "modId:cardIdx" -> { val, ts }  (concetto "lo ricordo")
```

- [ ] **Step 2: Carica `notes-core.js` prima di `app.js`**

In `index.html`, nella sezione script, aggiungi PRIMA del tag `js/app.js`:

```html
<script src="js/notes-core.js"></script>
```

- [ ] **Step 3: Aggiungi l'asset e bumpa la cache nel Service Worker**

In `sw.js`: cambia `const CACHE = 'linux-dojo-sw-v7';` → `'linux-dojo-sw-v8';`
e aggiungi `'./js/notes-core.js',` all'array `ASSETS` (dopo `'./js/config.js',`).

- [ ] **Step 4: Verifica manuale**

Apri la pagina con DevTools → Console:
```
JSON.stringify(Object.keys(JSON.parse(localStorage.getItem('linux-dojo-v1'))))
```
Expected: l'array delle chiavi include `"notes"` e `"recall"`. `typeof NotesCore` → `"object"`.

- [ ] **Step 5: Commit**

```bash
git add js/app.js index.html sw.js
git commit -m "feat(notes): stato notes/recall + carica NotesCore + cache v8"
```

---

### Task 4: Pin note su ogni card (apertura sheet + stato contestuale)

**Files:**
- Modify: `index.html:54-62` (dentro `#feed`)
- Modify: `css/style.css` (nuove regole, in fondo prima delle media query)
- Modify: `js/app.js` — `cardIndex()` riga ~440, `onFeedScroll` riga ~445-463, `renderCards` riga ~395-407

**Interfaces:**
- Consumes: `cardIndex()`, `feedOffset`, `curMod`, `state.notes`, `NotesCore.key`.
- Produces: `noteCtx()` → `{ modId, i, card }|null` (card centrata reale, non sintetica); `refreshPin()` aggiorna l'aspetto del pin; `openNoteSheet(modId, i, card)` (definita in Task 5, qui solo richiamata — vedi Step 3 che la stubba).

- [ ] **Step 1: Aggiungi il pulsante pin in `index.html`**

Dentro `#feed`, dopo `<div id="cards" ...>`:

```html
  <button class="note-pin" id="notePin" aria-label="Nota su questa card">📝</button>
```

- [ ] **Step 2: Stili del pin in `css/style.css`**

```css
.note-pin {
  position: fixed; right: 16px;
  bottom: calc(18px + env(safe-area-inset-bottom));
  width: 50px; height: 50px; border-radius: 50%;
  background: rgba(255,255,255,.08); border: 1px solid #3a4070;
  color: var(--text); font-size: 1.35rem; cursor: pointer; z-index: 16;
  display: none; align-items: center; justify-content: center;
  transition: transform .12s, background .15s;
}
.note-pin.visible { display: flex; }
.note-pin:active { transform: scale(.9); }
.note-pin.has-note { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 0 4px rgba(124,92,255,.18); }
```

- [ ] **Step 3: Logica del pin in `js/app.js`**

Dopo `cardIndex()` (riga ~442) aggiungi:

```js
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
```

Nota: `recallMode` è dichiarato in Task 7; per ora aggiungi accanto agli altri flag (riga ~299) `let recallMode = false;` come parte di questo task.

In fondo a `onFeedScroll` (dentro il `setTimeout`, dopo la riga di `swipeHint`) aggiungi:

```js
    refreshPin();
```

In `renderCards`, dopo `updateFeedProgress(0);` aggiungi:

```js
  refreshPin();
```

Aggiungi l'handler del pin una volta sola (vicino agli altri listener globali di init, es. dopo la definizione di `exitFeed`):

```js
$('notePin').onclick = () => {
  const ctx = noteCtx();
  if (ctx) openNoteSheet(ctx.modId, ctx.i, ctx.card);
};
```

Per sbloccare questo task prima di Task 5, aggiungi uno stub temporaneo (verrà sostituito):

```js
function openNoteSheet(modId, i, card) { console.log('TODO sheet', modId, i, card.title); }
```

- [ ] **Step 4: Verifica manuale**

Apri un modulo, scorri: il pin appare in basso a destra sulle card reali, sparisce sulla card di ripasso-lampo iniziale e sulla finale. Tap → in console compare `TODO sheet …` col titolo della card centrata.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "feat(notes): pin contestuale su ogni card (stato + apertura)"
```

---

### Task 5: Bottom-sheet nota + hub note

**Files:**
- Modify: `index.html` (markup sheet + overlay hub, dopo `#feed`)
- Modify: `css/style.css` (stili sheet/hub)
- Modify: `js/app.js` (sostituisci lo stub `openNoteSheet`; aggiungi `saveNote`, `openNotesHub`; icona hub in topbar)

**Interfaces:**
- Consumes: `state.notes`, `NotesCore.key`, `saveState()`, `MODULES`, `openModuleAt` (riga ~964).
- Produces: `openNoteSheet(modId, i, card)`, `saveNote(modId, i, title, text)`, `openNotesHub()`.

- [ ] **Step 1: Markup in `index.html`**

In `.feed-topbar`, dopo `#feedXp`, aggiungi un bottone:

```html
    <button class="btn-icon" id="btnNotesHub" aria-label="Le tue note">📝</button>
```

Dopo `#feed`:

```html
<div id="note-sheet" class="note-sheet hidden">
  <div class="note-sheet-inner">
    <div class="note-sheet-title" id="noteSheetTitle"></div>
    <textarea id="noteSheetText" class="note-sheet-text" placeholder="Scrivi con parole tue: cosa hai capito, un dubbio, un collegamento…"></textarea>
    <div class="note-sheet-actions">
      <button class="btn-solution" id="noteSheetCancel">Chiudi</button>
      <button class="btn-done" id="noteSheetSave" style="flex:1">Salva</button>
    </div>
  </div>
</div>

<div id="notes-hub" class="hidden">
  <div class="cs-header"><div class="cs-title">📝 Le tue note</div><button class="btn-icon" id="btnNotesHubClose">✕</button></div>
  <div id="notesHubList" class="notes-hub-list"></div>
</div>
```

- [ ] **Step 2: Stili in `css/style.css`**

```css
.note-sheet { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,.55); display: flex; align-items: flex-end; }
.note-sheet.hidden { display: none; }
.note-sheet-inner { width: 100%; background: var(--card); border-radius: 20px 20px 0 0; padding: 20px 18px calc(20px + env(safe-area-inset-bottom)); animation: slideUp .25s ease; }
.note-sheet-title { font-weight: 800; font-size: .95rem; margin-bottom: 12px; color: var(--accent2); }
.note-sheet-text { width: 100%; min-height: 130px; resize: vertical; background: #0a0d18; border: 1px solid #2a3158; border-radius: 12px; color: var(--text); font: inherit; padding: 12px; }
.note-sheet-actions { display: flex; gap: 10px; margin-top: 14px; }
#notes-hub { position: fixed; inset: 0; z-index: 200; background: var(--bg); overflow-y: auto; padding: env(safe-area-inset-top) 16px env(safe-area-inset-bottom); }
.notes-hub-list { display: flex; flex-direction: column; gap: 10px; padding-bottom: 24px; }
.notes-hub-mod { font-size: .72rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin: 14px 2px 4px; }
.notes-hub-item { background: var(--card); border: 1px solid #232a55; border-radius: 12px; padding: 12px 14px; cursor: pointer; }
.notes-hub-item .nh-card { font-weight: 700; font-size: .9rem; margin-bottom: 4px; }
.notes-hub-item .nh-text { font-size: .88rem; color: #c9cdf0; white-space: pre-wrap; }
.notes-hub-empty { color: var(--muted); text-align: center; margin-top: 40px; }
```

- [ ] **Step 3: Logica in `js/app.js` (sostituisci lo stub di Task 4)**

```js
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
      item.innerHTML = `<div class="nh-card">${n.title || ('Card ' + i)}</div><div class="nh-text"></div>`;
      item.querySelector('.nh-text').textContent = n.text;
      item.onclick = () => { $('notes-hub').classList.add('hidden'); openModuleAt(modId, i); };
      list.appendChild(item);
    });
  }
  $('notes-hub').classList.remove('hidden');
}
```

Aggiungi i listener una volta sola (init):

```js
$('btnNotesHub').onclick = openNotesHub;
$('btnNotesHubClose').onclick = () => $('notes-hub').classList.add('hidden');
$('noteSheetCancel').onclick = () => $('note-sheet').classList.add('hidden');
```

- [ ] **Step 4: Verifica manuale**

1. Tap pin su una card → sheet con titolo corretto. Scrivi, Salva → pin diventa "acceso". Ricarica → la nota è ancora lì (pin acceso).
2. Tap 📝 in topbar → hub elenca la nota sotto il modulo giusto; tap → salta a quella card.
3. Svuota il testo e salva → pin spento; dopo reload resta spento.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "feat(notes): bottom-sheet nota + hub note"
```

---

### Task 6: Recap-checklist di fine modulo

**Files:**
- Modify: `js/app.js` — `renderCards` riga ~403-404 (append della card recap), nuova funzione `buildRecapChecklist`
- Modify: `css/style.css` (stili checklist)

**Interfaces:**
- Consumes: `NotesCore.concepts`, `NotesCore.essenceOf`, `NotesCore.key`, `NotesCore.reviewCount`, `state.recall`, `saveState()`, `openRecallReview` (Task 7 — qui stubbata).
- Produces: `buildRecapChecklist(mod)` → elemento `.card.recap-check` o `null`.

- [ ] **Step 1: Append in `renderCards`**

In `renderCards`, sostituisci la riga che aggiunge la finale:

```js
  cardsEl.appendChild(examMode ? buildExamFinale() : buildFinale(mod));
```

con:

```js
  cardsEl.appendChild(examMode ? buildExamFinale() : buildFinale(mod));
  if (!reviewMode && !examMode && !flashMode && !quizDrillMode && !recallMode) {
    const rc = buildRecapChecklist(mod);
    if (rc) cardsEl.appendChild(rc);
  }
```

- [ ] **Step 2: Funzione `buildRecapChecklist`**

Aggiungi dopo `buildFinale` (riga ~804):

```js
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
```

Stub temporaneo (sostituito in Task 7), accanto alle altre `open*`:

```js
function openRecallReview(mod) { console.log('TODO ripasso', NotesCore.reviewCount(mod, state.recall)); }
```

- [ ] **Step 3: Stili in `css/style.css`**

```css
.card.recap-check { justify-content: flex-start; }
.rc-list { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
.rc-item { display: flex; align-items: flex-start; gap: 10px; background: #11152b; border: 1px solid #232a55; border-radius: 12px; padding: 11px 12px; cursor: pointer; }
.rc-item.checked { opacity: .55; border-color: var(--accent2); }
.rc-item input { margin-top: 3px; width: 18px; height: 18px; flex-shrink: 0; accent-color: var(--accent2); }
.rc-ico { font-size: 1.15rem; flex-shrink: 0; }
.rc-title { font-weight: 700; font-size: .92rem; display: block; }
.rc-essence { font-size: .82rem; color: var(--muted); display: block; margin-top: 2px; }
```

- [ ] **Step 4: Verifica manuale**

Apri un modulo e scorri fino in fondo (oltre la finale 🏆): appare "Cosa ti ricordi?" con tutti i concetti, emoji+titolo+essenza. Spunta alcuni → il contatore del bottone cala; ricarica → le spunte persistono. Spunta tutti → il bottone "Ripassa" sparisce.

- [ ] **Step 5: Commit**

```bash
git add js/app.js css/style.css
git commit -m "feat(recap): checklist active-recall di fine modulo"
```

---

### Task 7: Deck di ripasso mirato (recallMode)

**Files:**
- Modify: `js/app.js` — flag `recallMode` (già aggiunto in Task 4), `openRecallReview` (sostituisce lo stub), `renderCards` (builder + finale per recall), nuova `buildRecallCard`, `buildFinale` (ramo recall), reset flag in `exitFeed`/`openModule`/`openFlash`/`openQuizDrill`/`openReview`
- Modify: `css/style.css` (stili card ripasso)

**Interfaces:**
- Consumes: `NotesCore.toReview`, `NotesCore.essenceOf`, `NotesCore.key`, `state.recall`, `saveState()`, `cardsEl`, `feedEl`, `homeEl`, `renderCards`, `renderFeedXp`, `exitFeed`.
- Produces: `openRecallReview(mod)`, `buildRecallCard(mod, card, i)`.

- [ ] **Step 1: `openRecallReview` (sostituisci lo stub di Task 6)**

```js
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
```

- [ ] **Step 2: Builder dedicato + uso in `renderCards`**

In `renderCards`, cambia la riga del forEach:

```js
  mod.cards.forEach((c, i) => cardsEl.appendChild(buildCard(mod, c, i)));
```

in:

```js
  const builder = recallMode ? buildRecallCard : buildCard;
  mod.cards.forEach((c, i) => cardsEl.appendChild(builder(mod, c, i)));
```

Aggiungi `buildRecallCard` (dopo `buildRecapChecklist`):

```js
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
```

- [ ] **Step 3: Ramo recall in `buildFinale`**

In `buildFinale`, all'inizio (dopo la creazione di `el`), aggiungi prima del ramo `flashMode`:

```js
  if (recallMode) {
    el.innerHTML = `
      <div class="card-emoji">🎉</div>
      <div class="card-title">Ripasso completato!</div>
      <div class="card-text">Hai ripreso in mano i concetti che ti erano sfuggiti. Tornaci quando vuoi.</div>
      <button class="btn-big" style="margin-top:1.2rem">Torna al Dojo 🐧</button>`;
    el.querySelector('.btn-big').onclick = exitFeed;
    return el;
  }
```

- [ ] **Step 4: Reset del flag `recallMode`**

In `exitFeed` (riga ~367-371) aggiungi `recallMode = false;` accanto agli altri reset.
In `openModule`, `openReview`, `openFlash`, `openQuizDrill` aggiungi `recallMode = false;` dove gli altri flag vengono azzerati.

Stili in `css/style.css`:

```css
.card.recall-card { justify-content: center; }
.recall-essence { margin-top: 16px; font-size: 1.05rem; line-height: 1.6; color: #d6d9f5; animation: slideUp .25s ease; }
.recall-actions { display: flex; gap: 10px; margin-top: 20px; }
.recall-card.recall-done { opacity: .4; }
```

- [ ] **Step 5: Verifica manuale + commit**

Verifica: dal recap (Task 6) tap "Ripassa i N…" → parte il deck solo coi non spuntati. "Mostra" rivela l'essenza; "Ora la ricordo ✓" spunta (in `state.recall`) e avanza; "Ancora no" rimanda la card in fondo. A fine deck "Ripasso completato!". Riapri il recap del modulo: i concetti marcati risultano spuntati.

```bash
git add js/app.js css/style.css
git commit -m "feat(ripasso): deck di ripasso mirato dei concetti non spuntati"
```

---

### Task 8: Badge "📌 N da ripassare" in home

**Files:**
- Modify: `js/app.js` — `renderHome`, blocco `module-card` riga ~260-284

**Interfaces:**
- Consumes: `NotesCore.reviewCount`, `state.recall`, `openRecallReview`, `MODULES`.
- Produces: badge cliccabile sulle `module-card` di moduli `done` con concetti non spuntati.

- [ ] **Step 1: Calcola e mostra il badge**

In `renderHome`, dentro il `forEach` dei moduli, dopo `const drillCount = …`:

```js
    const toReview = prog.done ? NotesCore.reviewCount(mod, state.recall) : 0;
```

Nel template, dentro `.module-badge-area`, dopo il bottone `drill`:

```js
        ${toReview > 0 ? `<button class="btn-cheatsheet btn-review" data-action="recall">📌 ${toReview} ripasso</button>` : ''}
```

- [ ] **Step 2: Aggancia l'azione**

Nel blocco `el.querySelectorAll('.btn-cheatsheet').forEach(...)`, aggiungi nel gestore:

```js
          else if (action === 'recall') openRecallReview(mod);
```

- [ ] **Step 3: Stile (opzionale) in `css/style.css`**

```css
.btn-review { border-color: var(--gold) !important; color: var(--gold) !important; }
```

- [ ] **Step 4: Verifica manuale**

Completa un modulo, lascia alcuni concetti non spuntati nel recap → in home la sua card mostra "📌 N ripasso". Tap → apre il deck di ripasso. Spunta tutto → ricarica home → il badge sparisce.

- [ ] **Step 5: Commit**

```bash
git add js/app.js css/style.css
git commit -m "feat(ripasso): badge 'da ripassare' sulle module-card in home"
```

---

## Note finali di deploy

- Il bump cache è già in Task 3 (`v8`). Se altri task modificano file in cache dopo, ribumpare prima del deploy finale.
- Il sito fa deploy da `main` (GitHub Pages). Sul telefono ricaricare due volte per aggiornare il Service Worker.
