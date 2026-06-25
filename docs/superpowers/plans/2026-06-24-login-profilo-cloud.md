# Login a profilo leggero con salvataggio cloud — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettere all'utente di ritrovare i propri progressi (XP, streak, moduli, errori) da qualunque link/dispositivo accedendo con un profilo leggero (nome + codice, senza password), con salvataggio su Supabase.

**Architecture:** Local-first. `localStorage` resta la copia di lavoro; un sottile strato `Sync` (in `js/sync.js`) spinge/recupera l'intero oggetto `state` da Supabase quando un profilo è attivo. Il motore esistente non viene riscritto: l'unica scrittura locale (`saveState()`) viene estesa per inoltrare al cloud.

**Tech Stack:** HTML/CSS/JS vanilla (nessun build), client `@supabase/supabase-js@2` via CDN, Postgres gestito da Supabase. Test: runner integrato di Node (`node --test`, `node:assert`) — zero dipendenze.

## Global Constraints

- Niente build, niente npm, niente framework: l'app deve girare aprendo `index.html` da file e su GitHub Pages.
- Vanilla HTML/CSS/JS. Nuovi file JS caricati con `<script>`.
- Prima di ogni commit: `node --check` su ogni file JS toccato.
- `js/sync.js` deve essere caricabile sia nel browser (`window.Sync`) sia in Node (`require`) senza eseguire codice di rete al load (pattern UMD).
- L'anon key Supabase è pubblica per progetto: si può committare. RLS abilitata con policy permissive (modello leggero scelto).
- Preservare il funzionamento offline-first: se il cloud non è raggiungibile o non configurato, l'app funziona identica sul solo `localStorage`.
- Lavorare su un branch dedicato `feat/login-profilo` (non committare direttamente su `main`).
- I valori in `js/config.js` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) sono configurazione utente: restano con placeholder finché l'utente non crea il progetto Supabase; il codice deve degradare a "local-only" finché non sono valorizzati.

---

### Task 0: Branch di lavoro

**Files:** nessuno (solo git).

- [ ] **Step 1: Crea il branch**

```bash
cd /home/lore/linux-quiz-master
git checkout -b feat/login-profilo
```

- [ ] **Step 2: Verifica**

Run: `git branch --show-current`
Expected: `feat/login-profilo`

---

### Task 1: Helper puri in `js/sync.js`

Funzioni pure e testabili: normalizzazione id, validazione credenziali, scelta "il più recente vince".

**Files:**
- Create: `js/sync.js`
- Test: `js/sync.test.js`

**Interfaces:**
- Produces:
  - `normalizeId(name, code) -> string` (es. `"lorenzo:4821"`, trim + minuscolo)
  - `validateCredentials(name, code) -> { ok: true, name, code } | { ok: false, error: string }`
  - `pickNewest(local, remote) -> { state, updatedAt, source: 'local'|'remote' }` dove `local`/`remote` sono `{ state, updatedAt }` (o `null`)
  - In Node: `module.exports = { normalizeId, validateCredentials, pickNewest, Sync }`
  - Nel browser: `window.Sync`, e gli helper anche come `Sync.normalizeId`, `Sync.validateCredentials`, `Sync.pickNewest`

- [ ] **Step 1: Scrivi i test che falliscono**

Create `js/sync.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { normalizeId, validateCredentials, pickNewest } = require('./sync.js');

test('normalizeId combina nome e codice in minuscolo, con trim', () => {
  assert.strictEqual(normalizeId('  Lorenzo ', 'AB12'), 'lorenzo:ab12');
});

test('validateCredentials rifiuta nome troppo corto', () => {
  assert.strictEqual(validateCredentials('a', 'abc').ok, false);
});

test('validateCredentials rifiuta codice troppo corto', () => {
  assert.strictEqual(validateCredentials('lori', 'ab').ok, false);
});

test('validateCredentials accetta input validi e normalizza', () => {
  assert.deepStrictEqual(validateCredentials(' Lori ', ' 4821 '),
    { ok: true, name: 'lori', code: '4821' });
});

test('pickNewest sceglie il remoto se piu recente', () => {
  const local = { state: { xp: 1 }, updatedAt: '2026-01-01T00:00:00Z' };
  const remote = { state: { xp: 9 }, updatedAt: '2026-02-01T00:00:00Z' };
  assert.strictEqual(pickNewest(local, remote).source, 'remote');
  assert.strictEqual(pickNewest(local, remote).state.xp, 9);
});

test('pickNewest sceglie il locale se il remoto manca', () => {
  const local = { state: { xp: 1 }, updatedAt: '2026-01-01T00:00:00Z' };
  assert.strictEqual(pickNewest(local, null).source, 'local');
});

test('pickNewest sceglie il locale se piu recente del remoto', () => {
  const local = { state: { xp: 5 }, updatedAt: '2026-03-01T00:00:00Z' };
  const remote = { state: { xp: 2 }, updatedAt: '2026-02-01T00:00:00Z' };
  assert.strictEqual(pickNewest(local, remote).source, 'local');
});
```

- [ ] **Step 2: Esegui i test per verificarne il fallimento**

Run: `node --test js/sync.test.js`
Expected: FAIL — `Cannot find module './sync.js'`

- [ ] **Step 3: Crea `js/sync.js` con gli helper (implementazione minima)**

```js
'use strict';
/* Linux Dojo — strato di sincronizzazione cloud (profilo leggero).
   Caricabile nel browser (window.Sync) e in Node (require), senza
   eseguire codice di rete al load. */
(function (global) {

  function normalizeId(name, code) {
    return `${String(name == null ? '' : name).trim().toLowerCase()}:` +
           `${String(code == null ? '' : code).trim().toLowerCase()}`;
  }

  function validateCredentials(name, code) {
    const n = String(name == null ? '' : name).trim();
    const c = String(code == null ? '' : code).trim();
    if (n.length < 2) return { ok: false, error: 'Il nome deve avere almeno 2 caratteri.' };
    if (c.length < 3) return { ok: false, error: 'Il codice deve avere almeno 3 caratteri.' };
    return { ok: true, name: n.toLowerCase(), code: c.toLowerCase() };
  }

  function pickNewest(local, remote) {
    const lt = local && local.updatedAt ? Date.parse(local.updatedAt) : -Infinity;
    const rt = remote && remote.updatedAt ? Date.parse(remote.updatedAt) : -Infinity;
    return rt > lt
      ? { state: remote.state, updatedAt: remote.updatedAt, source: 'remote' }
      : { state: local ? local.state : null, updatedAt: local ? local.updatedAt : null, source: 'local' };
  }

  const Sync = { normalizeId, validateCredentials, pickNewest };

  global.Sync = Sync;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeId, validateCredentials, pickNewest, Sync };
  }

})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: Esegui i test per verificarne il successo**

Run: `node --test js/sync.test.js`
Expected: PASS — 7 test passati.

- [ ] **Step 5: Parse-check**

Run: `node --check js/sync.js`
Expected: nessun output (OK).

- [ ] **Step 6: Commit**

```bash
git add js/sync.js js/sync.test.js
git commit -m "feat(sync): helper puri normalizeId/validateCredentials/pickNewest"
```

---

### Task 2: Operazioni cloud in `Sync` (login/pull/push)

Aggiunge a `Sync` lo stato del profilo attivo e le operazioni verso Supabase, con client iniettabile per i test.

**Files:**
- Modify: `js/sync.js`
- Modify: `js/sync.test.js`

**Interfaces:**
- Consumes: `normalizeId`, `validateCredentials` (Task 1); un "client" con la forma minima di Supabase:
  - `client.from(table).select(cols).eq(col, val).maybeSingle() -> Promise<{ data, error }>`
  - `client.from(table).upsert(row, { onConflict }) -> Promise<{ data, error }>`
- Produces:
  - `Sync.init(client) -> void`
  - `Sync.activeProfile() -> { id, name } | null`
  - `Sync.logout() -> void`
  - `Sync.login(name, code, localState) -> Promise<{ ok, exists?, id?, name?, remote?, error? }>` dove `remote` è `{ state, updatedAt } | null`
  - `Sync.pull() -> Promise<{ state, updatedAt } | null>`
  - `Sync.push(state) -> void` (debounced ~1500ms; no-op senza profilo/client)
  - `Sync._client` (proprietà; usata da `app.js` per capire se il cloud è attivo)

- [ ] **Step 1: Aggiungi i test che falliscono in coda a `js/sync.test.js`**

```js
// ── Operazioni cloud ──────────────────────────────────────────────
const { Sync } = require('./sync.js');

// localStorage finto in-memory per i test Node
global.localStorage = (() => {
  let store = {};
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    _reset: () => { store = {}; },
  };
})();

// client Supabase finto: opera su un oggetto `rows` condiviso
function fakeClient(rows) {
  return {
    from() {
      const b = {
        _id: null,
        select() { return b; },
        eq(_col, id) { b._id = id; return b; },
        async maybeSingle() { return { data: rows[b._id] || null, error: null }; },
        async upsert(row) {
          rows[row.id] = { state: row.state, updated_at: row.updated_at };
          return { data: row, error: null };
        },
      };
      return b;
    },
  };
}

test('login con profilo esistente ritorna lo stato remoto e lo segna attivo', async () => {
  global.localStorage._reset();
  const rows = { 'lori:4821': { state: { xp: 99 }, updated_at: '2026-03-01T00:00:00Z' } };
  Sync.init(fakeClient(rows));
  const res = await Sync.login('Lori', '4821', { xp: 0 });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.exists, true);
  assert.strictEqual(res.remote.state.xp, 99);
  assert.deepStrictEqual(Sync.activeProfile(), { id: 'lori:4821', name: 'lori' });
});

test('login con profilo nuovo crea la riga dallo stato locale', async () => {
  global.localStorage._reset();
  const rows = {};
  Sync.init(fakeClient(rows));
  const res = await Sync.login('nuovo', 'abcd', { xp: 7 });
  assert.strictEqual(res.exists, false);
  assert.strictEqual(rows['nuovo:abcd'].state.xp, 7);
});

test('login rifiuta credenziali non valide', async () => {
  global.localStorage._reset();
  Sync.init(fakeClient({}));
  const res = await Sync.login('x', 'y', { xp: 0 });
  assert.strictEqual(res.ok, false);
  assert.ok(res.error);
});

test('pull ritorna lo stato remoto del profilo attivo', async () => {
  global.localStorage._reset();
  const rows = { 'lori:4821': { state: { xp: 42 }, updated_at: '2026-03-01T00:00:00Z' } };
  Sync.init(fakeClient(rows));
  await Sync.login('lori', '4821', { xp: 0 });
  const remote = await Sync.pull();
  assert.strictEqual(remote.state.xp, 42);
});

test('logout azzera il profilo attivo', async () => {
  global.localStorage._reset();
  Sync.init(fakeClient({}));
  await Sync.login('lori', '4821', { xp: 0 });
  Sync.logout();
  assert.strictEqual(Sync.activeProfile(), null);
});
```

- [ ] **Step 2: Esegui i test per verificarne il fallimento**

Run: `node --test js/sync.test.js`
Expected: FAIL — `Sync.init is not a function` (e altri).

- [ ] **Step 3: Estendi `js/sync.js` con le operazioni cloud**

Dentro la IIFE, **subito prima** della riga `const Sync = { normalizeId, validateCredentials, pickNewest };`, aggiungi le funzioni e poi sostituisci la definizione di `Sync` con quella estesa:

```js
  const PROFILE_KEY = 'linux-dojo-profile';
  const TABLE = 'profiles';
  const DEBOUNCE_MS = 1500;
  let _client = null;
  let _timer = null;

  function activeProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function setActiveProfile(p) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }
  function clearActiveProfile() { localStorage.removeItem(PROFILE_KEY); }

  async function _fetch(id) {
    try {
      const { data, error } = await _client
        .from(TABLE).select('state, updated_at').eq('id', id).maybeSingle();
      if (error || !data) return null;
      return { state: data.state, updatedAt: data.updated_at };
    } catch (e) { return null; }
  }
  async function _upsert(id, name, state, updatedAt) {
    return _client.from(TABLE)
      .upsert({ id, name, state, updated_at: updatedAt }, { onConflict: 'id' });
  }

  async function login(name, code, localState) {
    const v = validateCredentials(name, code);
    if (!v.ok) return { ok: false, error: v.error };
    const id = normalizeId(v.name, v.code);
    const remote = await _fetch(id);
    if (remote) {
      setActiveProfile({ id, name: v.name });
      return { ok: true, exists: true, id, name: v.name, remote };
    }
    const updatedAt = new Date().toISOString();
    try { await _upsert(id, v.name, localState, updatedAt); } catch (e) { /* offline: resta local */ }
    setActiveProfile({ id, name: v.name });
    return { ok: true, exists: false, id, name: v.name, remote: null };
  }

  function logout() { clearActiveProfile(); }

  async function pull() {
    const p = activeProfile();
    if (!p || !_client) return null;
    return _fetch(p.id);
  }

  function push(state) {
    const p = activeProfile();
    if (!p || !_client) return;
    clearTimeout(_timer);
    _timer = setTimeout(() => {
      _upsert(p.id, p.name, state, new Date().toISOString()).catch(() => {});
    }, DEBOUNCE_MS);
  }
```

Poi sostituisci la riga della definizione di `Sync` con:

```js
  const Sync = {
    normalizeId, validateCredentials, pickNewest,
    init(client) { _client = client; },
    get _client() { return _client; },
    activeProfile, logout, login, pull, push,
  };
```

- [ ] **Step 4: Esegui i test per verificarne il successo**

Run: `node --test js/sync.test.js`
Expected: PASS — tutti i test (Task 1 + Task 2) passati.

- [ ] **Step 5: Parse-check**

Run: `node --check js/sync.js`
Expected: nessun output (OK).

- [ ] **Step 6: Commit**

```bash
git add js/sync.js js/sync.test.js
git commit -m "feat(sync): login/pull/push verso Supabase con client iniettabile"
```

---

### Task 3: Configurazione, inclusione script e backend Supabase

Crea `js/config.js`, carica gli script in `index.html`, aggiorna il service worker, e prepara la tabella su Supabase.

**Files:**
- Create: `js/config.js`
- Modify: `index.html` (script includes, prima della riga `<script src="js/app.js"></script>`)
- Modify: `sw.js` (lista `ASSETS` e nome cache)

**Interfaces:**
- Produces: globali `SUPABASE_URL`, `SUPABASE_ANON_KEY`; tag script che espongono `window.supabase` (UMD) e `window.Sync`.

- [ ] **Step 1: Crea `js/config.js`**

```js
'use strict';
/* Valori del TUO progetto Supabase: Project Settings → API.
   L'anon key è pubblica per progetto: è sicuro committarla (con RLS attiva).
   Finché contengono "INSERISCI", l'app gira in modalità solo-locale. */
const SUPABASE_URL = 'https://INSERISCI-IL-TUO-PROGETTO.supabase.co';
const SUPABASE_ANON_KEY = 'INSERISCI-LA-TUA-ANON-KEY';
```

- [ ] **Step 2: Aggiungi gli script in `index.html`**

Inserisci queste righe **immediatamente prima** di `<script src="js/app.js"></script>` (riga 99). Per sicurezza (Subresource Integrity) si **pinna una versione esatta** e si aggiunge `integrity` + `crossorigin`, così una compromissione della CDN non può iniettare codice arbitrario:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"
        integrity="sha384-SOSTITUISCI-CON-HASH-REALE"
        crossorigin="anonymous"></script>
<script src="js/config.js"></script>
<script src="js/sync.js"></script>
```

Ottieni l'hash reale per la versione scelta (sostituisci poi il valore `integrity`):

```bash
curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Anteponi `sha384-` al risultato. (In alternativa, dalla pagina del file su jsdelivr c'è il bottone "Copy SRI".) Se cambi versione, rigenera l'hash.

- [ ] **Step 3: Aggiorna il service worker**

In `sw.js`, cambia il nome cache (riga 6) per forzare l'aggiornamento:

```js
const CACHE = 'linux-dojo-sw-v2';
```

e aggiungi i due nuovi asset locali nell'array `ASSETS` (dopo `'./js/app.js',`):

```js
  './js/config.js',
  './js/sync.js',
```

(Il client Supabase via CDN è cross-origin: non viene cachato e offline degrada a solo-locale — comportamento voluto.)

- [ ] **Step 4: Parse-check**

Run: `node --check js/config.js && node --check sw.js`
Expected: nessun output (OK).

- [ ] **Step 5: Verifica che la pagina carichi senza errori (non configurato = solo-locale)**

Apri `index.html` nel browser. In console esegui:

```js
typeof Sync !== 'undefined' && typeof Sync.login === 'function'
```

Expected: `true`. L'app funziona come prima (nessun profilo, solo localStorage), perché `SUPABASE_URL` contiene ancora `INSERISCI`.

- [ ] **Step 6: Setup Supabase (una tantum, lato utente)**

1. Crea un progetto gratuito su https://supabase.com.
2. SQL Editor → esegui:

```sql
create table profiles (
  id          text primary key,
  name        text not null,
  state       jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "anon read"   on profiles for select using (true);
create policy "anon insert" on profiles for insert with check (true);
create policy "anon update" on profiles for update using (true) with check (true);
```

3. Project Settings → API: copia **Project URL** e **anon public key** in `js/config.js`.

- [ ] **Step 7: Commit**

```bash
git add js/config.js index.html sw.js
git commit -m "feat(sync): config, inclusione client Supabase e cache SW"
```

---

### Task 4: Integrazione nel motore (`js/app.js`)

Collega `Sync` al ciclo di vita: salvataggio, avvio, login/logout. Nessun framework di test in `app.js`: si verifica con `node --check` + QA manuale (Task 6).

**Files:**
- Modify: `js/app.js` (`saveState()` ~righe 27-29; blocco "Avvio" ~righe 1031-1035)

**Interfaces:**
- Consumes: `Sync.activeProfile`, `Sync.pull`, `Sync.push`, `Sync.login`, `Sync.logout`, `Sync.pickNewest`, `Sync._client`, `Sync.init`; globali `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `window.supabase`.
- Produces: `UPDATED_KEY`, `syncOnStartup()`, `loginProfilo(name, code)`, `logoutProfilo()`, `showProfileError(msg)` (riempita davvero in Task 5; qui stub no-op sicuro).

- [ ] **Step 1: Aggiungi `UPDATED_KEY` e aggiorna `saveState()`**

In `js/app.js`, sostituisci il blocco (righe ~27-29):

```js
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
}
```

con:

```js
const UPDATED_KEY = 'linux-dojo-updated';

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    localStorage.setItem(UPDATED_KEY, new Date().toISOString());
  } catch (e) {}
  if (typeof Sync !== 'undefined') Sync.push(state);
}
```

- [ ] **Step 2: Aggiungi le funzioni di sync prima del blocco "Avvio"**

In `js/app.js`, **subito prima** del commento `// ── Avvio ──` (riga ~1031), inserisci:

```js
// ── Sync cloud (profilo) ──────────────────────────────────────────────────────
function showProfileError(msg) {            // sovrascritta in Task 5 (UI)
  const el = $('profile-error'); if (el) el.textContent = msg || '';
}

async function syncOnStartup() {
  if (typeof Sync === 'undefined' || !Sync._client || !Sync.activeProfile()) return;
  const remote = await Sync.pull();
  if (!remote) return;
  const local = { state, updatedAt: localStorage.getItem(UPDATED_KEY) };
  const chosen = Sync.pickNewest(local, remote);
  if (chosen.source === 'remote') {
    localStorage.setItem(STORE_KEY, JSON.stringify(remote.state));
    localStorage.setItem(UPDATED_KEY, remote.updatedAt);
    location.reload();
  } else {
    Sync.push(state);
  }
}

async function loginProfilo(name, code) {
  if (typeof Sync === 'undefined' || !Sync._client) {
    showProfileError('Cloud non configurato (manca js/config.js).');
    return;
  }
  const res = await Sync.login(name, code, state);
  if (!res.ok) { showProfileError(res.error); return; }
  if (res.exists && res.remote) {
    const local = { state, updatedAt: localStorage.getItem(UPDATED_KEY) };
    const chosen = Sync.pickNewest(local, res.remote);
    if (chosen.source === 'remote') {
      localStorage.setItem(STORE_KEY, JSON.stringify(res.remote.state));
      localStorage.setItem(UPDATED_KEY, res.remote.updatedAt);
    } else {
      Sync.push(state);
    }
  }
  location.reload();
}

function logoutProfilo() {
  if (typeof Sync !== 'undefined') Sync.logout();
  location.reload();
}
```

- [ ] **Step 3: Inizializza `Sync` e avvia la sync nel blocco "Avvio"**

In fondo a `js/app.js`, **dopo** `renderHome();` (riga ~1035), aggiungi:

```js
// Sync cloud: attiva solo se config valorizzata
if (typeof Sync !== 'undefined' && typeof SUPABASE_URL !== 'undefined'
    && window.supabase && /^https?:\/\//.test(SUPABASE_URL)
    && !SUPABASE_URL.includes('INSERISCI')) {
  Sync.init(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
}
syncOnStartup();
```

- [ ] **Step 4: Parse-check**

Run: `node --check js/app.js`
Expected: nessun output (OK).

- [ ] **Step 5: Smoke test (non configurato)**

Apri `index.html`. L'app deve comportarsi come prima (nessun errore in console, niente reload-loop). In console: `typeof loginProfilo === 'function'` → `true`.

- [ ] **Step 6: Commit**

```bash
git add js/app.js
git commit -m "feat(sync): integra login/pull/push nel motore (saveState, avvio)"
```

---

### Task 5: UI del profilo (bottone + modale)

Aggiunge il bottone in header, il modale di login/logout, lo stile, e il render del nome profilo.

**Files:**
- Modify: `index.html` (header ~righe 21-25; nuovo overlay dopo `cheatsheet-overlay`, riga ~85)
- Modify: `css/style.css` (append in fondo)
- Modify: `js/app.js` (funzioni UI + chiamata `renderProfileButton()` all'avvio; sostituisce lo stub `showProfileError`)

**Interfaces:**
- Consumes: `Sync.activeProfile`, `Sync._client`, `loginProfilo`, `logoutProfilo` (Task 4).
- Produces: `renderProfileButton()`, `openProfile()`, `closeProfile()`, `submitProfile()`, `showProfileError(msg)`.

- [ ] **Step 1: Aggiungi il bottone profilo in `index.html`**

Dentro `<div class="header-actions">`, **prima** di `<div class="streak-pill" ...>` (riga 24), inserisci:

```html
      <button class="btn-header-icon" id="btnProfile" onclick="openProfile()" title="Profilo">👤 Accedi</button>
```

- [ ] **Step 2: Aggiungi il modale in `index.html`**

**Dopo** il blocco `cheatsheet-overlay` (dopo la riga 85, `</div>`), inserisci:

```html
<!-- ════════ Profilo modale ════════ -->
<div id="profile-overlay" class="hidden">
  <div class="cs-header">
    <div class="cs-title">👤 Il tuo profilo</div>
    <button class="cs-close" onclick="closeProfile()">✕</button>
  </div>
  <div class="profile-body">
    <p class="profile-hint">Accedi con un <strong>nome</strong> e un <strong>codice</strong> per ritrovare i tuoi progressi su qualsiasi dispositivo.</p>
    <div id="profile-form">
      <input id="profile-name" class="profile-input" type="text" placeholder="nome (es. lorenzo)" autocomplete="off" autocapitalize="off" spellcheck="false">
      <input id="profile-code" class="profile-input" type="text" placeholder="codice (es. 4821)" autocomplete="off" autocapitalize="off" spellcheck="false">
      <button class="profile-btn" onclick="submitProfile()">Entra / Crea</button>
      <div id="profile-error" class="profile-error"></div>
    </div>
    <div id="profile-logged" class="hidden">
      <p>Sei dentro come <strong id="profile-current"></strong>. I progressi si salvano in cloud. ✅</p>
      <button class="profile-btn profile-btn-ghost" onclick="logoutProfilo()">Esci</button>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Aggiungi lo stile in coda a `css/style.css`**

```css
/* ── Profilo ── */
#profile-overlay {
  position: fixed; inset: 0; z-index: 60;
  background: var(--bg, #14161B); color: var(--fg, #E6E3DC);
  display: flex; flex-direction: column;
  padding: 18px; overflow-y: auto;
}
#profile-overlay.hidden { display: none; }
.profile-body { max-width: 480px; margin: 0 auto; width: 100%; }
.profile-hint { opacity: .8; line-height: 1.5; margin: 8px 0 18px; }
.profile-input {
  display: block; width: 100%; box-sizing: border-box; margin-bottom: 12px;
  padding: 14px 16px; font-size: 16px; border-radius: 12px;
  border: 1px solid #2C3743; background: #1F2733; color: #FFD79A;
}
.profile-btn {
  width: 100%; padding: 14px; font-size: 16px; font-weight: 700;
  border: none; border-radius: 12px; cursor: pointer;
  background: #E8A33D; color: #14161B;
}
.profile-btn-ghost { background: transparent; color: #E6E3DC; border: 1px solid #2C3743; }
.profile-error { color: #ff6b6b; min-height: 20px; margin-top: 10px; font-size: 14px; }
```

- [ ] **Step 4: Sostituisci lo stub `showProfileError` e aggiungi le funzioni UI in `js/app.js`**

Nel blocco "Sync cloud (profilo)" (Task 4), **sostituisci** la funzione `showProfileError` con questa versione e le altre funzioni UI:

```js
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
```

- [ ] **Step 5: Chiama `renderProfileButton()` all'avvio**

In fondo a `js/app.js`, nel blocco "Avvio", **dopo** `renderHome();` e **prima** del blocco `if (typeof Sync ... Sync.init ...)`, aggiungi:

```js
renderProfileButton();
```

- [ ] **Step 6: Parse-check**

Run: `node --check js/app.js`
Expected: nessun output (OK).

- [ ] **Step 7: QA visivo**

Apri `index.html`: in header compare `👤 Accedi`; cliccandolo si apre il modale con i due campi; la ✕ lo chiude. (Senza Supabase configurato, "Entra / Crea" mostra "Cloud non configurato".)

- [ ] **Step 8: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "feat(sync): UI profilo (bottone header + modale login/logout)"
```

---

### Task 6: QA end-to-end con Supabase reale

Verifica il flusso completo con `js/config.js` valorizzato (Task 3, Step 6).

**Files:** nessuno (solo verifica). Se emergono fix, committarli con messaggio dedicato.

- [ ] **Step 1: Suite di test unitari verde**

Run: `node --test js/sync.test.js`
Expected: PASS — tutti i test.

- [ ] **Step 2: Checklist QA manuale (browser, con config valorizzata)**

- [ ] Apri l'app, clicca `👤 Accedi`, crea profilo `lorenzo` / `4821`. L'header mostra `👤 lorenzo`.
- [ ] Studia qualcosa → guadagna XP. Ricarica la pagina (F5): i progressi restano.
- [ ] In Supabase → Table editor → `profiles`: esiste la riga `lorenzo:4821` con `state` aggiornato.
- [ ] Apri l'app in un **altro browser** (o finestra in incognito / telefono), accedi con `lorenzo` / `4821`: ritrovi XP e progressi.
- [ ] Attiva la **modalità aereo**, studia (XP sale localmente, nessun errore bloccante), poi torna online e fai un'altra azione: la riga su Supabase si aggiorna.
- [ ] Accedi con `amico` / `9999`: dati completamente separati (XP riparte, non tocca quelli di `lorenzo`).
- [ ] Logout dal modale: l'app resta utilizzabile; ri-accesso con `lorenzo`/`4821` riallinea dal cloud.

- [ ] **Step 3 (se servono fix): Commit**

```bash
git add -A
git commit -m "fix(sync): correzioni emerse in QA end-to-end"
```

---

## Note finali

- Per usarlo da telefono e PC tenendo i dati allineati, accedi sempre con lo **stesso nome+codice** e usa preferibilmente l'**URL stabile** di GitHub Pages.
- Estensione futura (fuori scope): login Google con Supabase Auth + RLS per-utente, riusando lo stesso strato `Sync`.
