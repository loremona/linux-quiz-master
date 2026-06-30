# Banca domande extra — Iterazione 1 (meccanismo + Modulo 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introdurre il meccanismo "banca domande extra" (file `moduleNN_quiz.js` che alimentano drill ed esami senza comparire nel feed-lezione) e popolarlo per il Modulo 1 fino alla copertura completa degli obiettivi.

**Architecture:** Una funzione pura `quizPool(mod)` in un nuovo modulo UMD `js/quiz-core.js` (stesso pattern di `js/notes-core.js`), unico punto che combina le card quiz/input inline di `mod.cards` con l'array `mod.extra`. Drill, simulatori e conteggio home la consumano. Le domande extra vivono in `js/data/moduleNN_quiz.js`, registrate come `extra` in `js/modules.js`.

**Tech Stack:** Vanilla JS (no build), UMD per la logica pura, test eseguiti con **gjs** (Node assente sul sistema), service worker per offline.

## Global Constraints

- **Nessun build step / nessun npm**: solo file statici, script tag in `index.html`.
- **Test con gjs**: `gjs test/<file>-test.js` (vedi `test/notes-core-test.js` come modello). Node non è installato.
- **Vincolo anti-invenzione**: nessun dettaglio d'esame (flag, porte, sintassi, comandi) non verificato. Ogni card extra porta un commento `//src:` con la fonte (card esistente / deck Anki / obiettivo LPIC); ogni dettaglio tecnico nuovo va confrontato con la man page reale prima di scriverlo.
- **Schema card invariato**: `quiz` = `{type, q, opts[], a, explain}`; `input` = `{type, q, accept[], placeholder, explain}`.
- **Service worker cache-first**: ad ogni nuovo file o modifica servita, bumpare `CACHE` in `sw.js` e aggiungere il file ad `ASSETS`, altrimenti viene servita la versione vecchia.

---

### Task 1: Modulo `quiz-core.js` con `quizPool` (logica pura, testata)

**Files:**
- Create: `js/quiz-core.js`
- Test: `test/quiz-core-test.js`

**Interfaces:**
- Consumes: niente (logica pura).
- Produces: globale `QuizCore` con `quizPool(mod) -> Array<card>` e `drillCount(mod) -> number`.
  - `quizPool(mod)`: ritorna le card di `mod.cards` con `type` `'quiz'`/`'input'`, concatenate con `mod.extra` (default `[]`).
  - `drillCount(mod)`: `quizPool(mod).length`.

- [ ] **Step 1: Scrivi il test che fallisce**

Create `test/quiz-core-test.js`:

```js
'use strict';
/* Test di js/quiz-core.js — eseguibile con: gjs test/quiz-core-test.js */
const GLib = imports.gi.GLib;
const System = imports.system;
const [, bytes] = GLib.file_get_contents('js/quiz-core.js');
(0, eval)(new TextDecoder().decode(bytes));

let failures = 0;
function test(name, fn) {
  try { fn(); print('  ok  ' + name); }
  catch (e) { failures++; print('FAIL  ' + name + ' :: ' + e.message); }
}
function eq(a, b, m) { if (a !== b) throw new Error((m||'eq')+`: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }

const mod = { id: 'm01', cards: [
  { type: 'lesson', title: 'Kernel' },
  { type: 'quiz', q: 'A?' },
  { type: 'input', q: 'B?' },
  { type: 'fact', title: 'Storia' },
], extra: [
  { type: 'quiz', q: 'X?' },
  { type: 'input', q: 'Y?' },
]};

test('quizPool prende quiz/input inline ed esclude lesson/fact', () => {
  const inlineOnly = QuizCore.quizPool({ id: 'm', cards: mod.cards });
  eq(inlineOnly.length, 2);
});
test('quizPool concatena mod.extra', () => eq(QuizCore.quizPool(mod).length, 4));
test('quizPool ordine: prima inline poi extra', () => {
  const p = QuizCore.quizPool(mod);
  eq(p[0].q, 'A?'); eq(p[2].q, 'X?');
});
test('quizPool senza extra non rompe', () => eq(QuizCore.quizPool({ id: 'm', cards: [{type:'quiz'}] }).length, 1));
test('quizPool modulo vuoto → []', () => eq(QuizCore.quizPool({ id: 'm' }).length, 0));
test('drillCount = lunghezza pool', () => eq(QuizCore.drillCount(mod), 4));

print(failures ? `\n${failures} FALLITI` : '\nTUTTI PASSATI');
System.exit(failures ? 1 : 0);
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `gjs test/quiz-core-test.js`
Expected: errore tipo `QuizCore is not defined` / impossibile leggere `js/quiz-core.js` (file inesistente).

- [ ] **Step 3: Implementa il minimo per far passare**

Create `js/quiz-core.js`:

```js
/* ═══════════ Linux Dojo — logica pura pool quiz (testabile) ═══════════ */
'use strict';

(function (root) {
  function isQuizCard(card) {
    return !!card && (card.type === 'quiz' || card.type === 'input');
  }

  function quizPool(mod) {
    const inline = (mod.cards || []).filter(isQuizCard);
    return inline.concat(mod.extra || []);
  }

  function drillCount(mod) { return quizPool(mod).length; }

  root.QuizCore = { isQuizCard, quizPool, drillCount };
})(typeof globalThis !== 'undefined' ? globalThis : this);
```

- [ ] **Step 4: Esegui il test e verifica che passi**

Run: `gjs test/quiz-core-test.js`
Expected: tutte le righe `ok`, ultima riga `TUTTI PASSATI`, exit 0.

- [ ] **Step 5: Commit**

```bash
git add js/quiz-core.js test/quiz-core-test.js
git commit -m "feat(quiz): QuizCore.quizPool — pool quiz inline + banca extra"
```

---

### Task 2: Cablaggio di `QuizCore` in drill, esami e conteggio home

**Files:**
- Modify: `index.html` (script tag di `quiz-core.js`)
- Modify: `js/app.js` (3 punti: conteggio home ~270, `openQuizDrill` ~371, `startExamWith` ~1018)
- Modify: `sw.js` (aggiungi `quiz-core.js` ad ASSETS, bump CACHE)

**Interfaces:**
- Consumes: `QuizCore.quizPool`, `QuizCore.drillCount` da Task 1.
- Produces: nessuna nuova interfaccia; il comportamento resta identico finché i moduli non hanno `extra` (retro-compatibile).

- [ ] **Step 1: Carica `quiz-core.js` prima di `app.js`**

In `index.html`, dopo la riga `<script src="js/notes-core.js"></script>` (riga 146) aggiungi:

```html
<script src="js/quiz-core.js"></script>
```

(Va dopo `modules.js`/`notes-core.js` e prima di `app.js` riga 147, così `QuizCore` esiste quando `app.js` gira.)

- [ ] **Step 2: Usa `QuizCore.drillCount` nel conteggio home**

In `js/app.js` riga ~270, sostituisci:

```js
    const drillCount = mod.cards.filter(c => c.type === 'quiz' || c.type === 'input').length;
```

con:

```js
    const drillCount = QuizCore.drillCount(mod);
```

- [ ] **Step 3: Usa `QuizCore.quizPool` nel drill**

In `js/app.js`, in `openQuizDrill` (riga ~371), sostituisci:

```js
  const drillCards = mod.cards.filter(c => c.type === 'quiz' || c.type === 'input');
```

con:

```js
  const drillCards = QuizCore.quizPool(mod);
```

- [ ] **Step 4: Usa `QuizCore.quizPool` nel pool d'esame**

In `js/app.js`, in `startExamWith` (righe ~1017-1023), sostituisci:

```js
  const pool = [];
  for (const mod of mods) {
    mod.cards.forEach((card, idx) => {
      if (card.type === 'quiz' || card.type === 'input')
        pool.push({ card, modId: mod.id, origIdx: idx });
    });
  }
```

con:

```js
  const pool = [];
  for (const mod of mods) {
    QuizCore.quizPool(mod).forEach((card, idx) => {
      pool.push({ card, modId: mod.id, origIdx: idx });
    });
  }
```

(`origIdx`/`modId` non vengono letti nel flusso d'esame — solo `q.card` e `examQuestions.length` — quindi le card extra senza indice in `mod.cards` non causano problemi.)

- [ ] **Step 5: Aggiorna il service worker**

In `sw.js` riga 6, bump:

```js
const CACHE = 'linux-dojo-sw-v11';
```

In `sw.js`, dentro `ASSETS`, dopo `'./js/notes-core.js',` aggiungi:

```js
  './js/quiz-core.js',
```

- [ ] **Step 6: Verifica funzionale (nessuna regressione)**

Run: `gjs test/quiz-core-test.js && gjs test/notes-core-test.js && gjs test/sync-test.js`
Expected: tutti `TUTTI PASSATI`.

Verifica manuale (apri `index.html` in browser, hard-reload per saltare la cache SW):
- La home mostra ancora il bottone `🎯 quiz` sui moduli con domande.
- Aprendo il drill di un modulo, il numero di domande è invariato (nessun `extra` ancora).
- Apri un simulatore: parte e mostra le domande come prima.
- Console senza errori `QuizCore is not defined`.

- [ ] **Step 7: Commit**

```bash
git add index.html js/app.js sw.js
git commit -m "refactor(quiz): drill/esami/conteggio usano QuizCore.quizPool"
```

---

### Task 3: Banca extra Modulo 1 fino a copertura completa obiettivi 101

**Files:**
- Create: `js/data/module01_quiz.js`
- Modify: `js/modules.js` (proprietà `extra` su `m01`)
- Modify: `index.html` (script tag di `module01_quiz.js`)
- Modify: `sw.js` (aggiungi il file ad ASSETS, bump CACHE)

**Interfaces:**
- Consumes: `QuizCore.quizPool` (Task 1) legge `mod.extra`.
- Produces: globale `MODULE01_QUIZ` (array di card `quiz`/`input`).

**Procedura di authoring verificato (vale per ogni card aggiunta):**
1. Leggi `js/data/module01.js` e annota i concetti già insegnati (boot, BIOS/UEFI, GRUB, kernel, moduli, runlevel/target, dmesg, ecc.).
2. Confronta con gli obiettivi LPIC-1 pertinenti al Modulo 1 ("Com'è fatto Linux": Topic 101 — architettura hardware, boot, init/SysVinit/systemd, runlevel/boot target, shutdown). Elenca le *Key Knowledge Area* e ogni comando/file citato.
3. Per ogni nozione non ancora coperta da una domanda, scrivi una card `quiz` o `input`. Se la nozione non è proprio insegnata in `module01.js`, aggiungi prima una card `lesson`/`fact` **inline** in `module01.js` (commit separato) e poi la domanda.
4. **Verifica ogni dettaglio tecnico nuovo** (flag, file, percorso, sintassi) contro la man page reale sul sistema, es. `man systemctl`, `man grub-mkconfig`, `man init`, prima di scriverlo.
5. Aggiungi a ogni card un commento `//src:` con il riferimento.

- [ ] **Step 1: Crea il file banca con card seed (template verificato)**

Create `js/data/module01_quiz.js` con almeno queste card ancorate a `module01.js`, poi continua secondo la procedura fino alla copertura completa:

```js
/* ═══════════ MODULO 1 — Banca domande extra (drill + esami) ═══════════ */
'use strict';

const MODULE01_QUIZ = [

  { type: 'quiz',
    q: 'Con che filesystem è formattata la partizione ESP (EFI System Partition)?',
    opts: ['ext4', 'FAT32', 'NTFS', 'Btrfs'],
    a: 1,
    explain: `La <strong>ESP</strong> è formattata <strong>FAT32</strong>: è lo standard che il firmware UEFI sa leggere per trovare i bootloader (file .efi). 🥾` }, //src: module01.js card "BIOS vs UEFI"

  { type: 'quiz',
    q: 'In quale file si modificano le impostazioni di GRUB prima di rigenerare la config?',
    opts: ['/boot/grub/grub.cfg', '/etc/default/grub', '/etc/grub.conf', '/boot/grub/menu.lst'],
    a: 1,
    explain: `Le impostazioni si cambiano in <strong>/etc/default/grub</strong>, poi si rigenera <code>grub.cfg</code> con grub-mkconfig. <code>/boot/grub/grub.cfg</code> NON si edita a mano. ⚙️` }, //src: module01.js card "Il bootloader: GRUB"

  { type: 'input',
    q: 'Quale comando rigenera la configurazione di GRUB in /boot/grub/grub.cfg?',
    accept: ['grub-mkconfig -o /boot/grub/grub.cfg', 'grub-mkconfig -o /boot/grub/grub.cfg '],
    placeholder: 'comando completo...',
    explain: `<code>grub-mkconfig -o /boot/grub/grub.cfg</code> legge <code>/etc/default/grub</code> e gli script in <code>/etc/grub.d/</code> e scrive la config finale. 🔄` }, //src: module01.js card "Il bootloader: GRUB"

  // … continua: init/systemd target, isolate, dmesg/journalctl -k, lsmod/modprobe,
  //    poweroff/halt/reboot/shutdown, lspci/lsusb, /proc — una card per ogni
  //    Key Knowledge Area dell'obiettivo non già coperta (procedura sopra).
];
```

- [ ] **Step 2: Verifica i dettagli nuovi contro le man page**

Per ogni comando/flag introdotto oltre ai seed (es. `systemctl isolate`, `modprobe`, `journalctl -k`), esegui la man page e conferma sintassi/opzione prima di committare. Esempi:

Run: `man systemctl | grep -A2 "isolate"`
Run: `man grub-mkconfig | head -20`
Expected: l'opzione/sintassi citata nella card compare nella man page.

- [ ] **Step 3: Registra `extra` sul modulo m01**

In `js/modules.js`, nella riga di `m01`, aggiungi la proprietà `extra`:

```js
  { id: 'm01', icon: '🧠', title: 'Com\'è fatto Linux',      sub: 'Kernel, boot, systemd, processi',      cards: (typeof MODULE01 !== 'undefined') ? MODULE01 : [], extra: (typeof MODULE01_QUIZ !== 'undefined') ? MODULE01_QUIZ : [] },
```

- [ ] **Step 4: Carica il file e aggiorna il service worker**

In `index.html`, dopo `<script src="js/data/module01.js"></script>` (riga 127) aggiungi:

```html
<script src="js/data/module01_quiz.js"></script>
```

In `sw.js` bump:

```js
const CACHE = 'linux-dojo-sw-v12';
```

In `sw.js`, dentro `ASSETS`, dopo `'./js/data/module01.js',` aggiungi:

```js
  './js/data/module01_quiz.js',
```

- [ ] **Step 5: Verifica funzionale che il pool del Modulo 1 cresca**

Apri `index.html` in browser (hard-reload). Sul Modulo 1:
- Apri il drill `🎯 quiz`: il numero totale di domande deve essere aumentato del numero di card in `MODULE01_QUIZ` (es. da 21 a 21+N).
- Scorri fino in fondo al drill: le domande extra compaiono, rispondono e contano nel punteggio finale.
- Apri il simulatore **Esame 101**: parte senza errori (le card extra sono nel pool).
- Verifica che il **feed-lezione** del Modulo 1 (aprendo il modulo normalmente) NON mostri le domande extra — solo le card di `module01.js`.

- [ ] **Step 6: Commit**

```bash
git add js/data/module01_quiz.js js/modules.js index.html sw.js
git commit -m "feat(quiz): banca extra Modulo 1 — copertura obiettivi 101"
```

---

## Note per le iterazioni successive (2-10)

Ogni modulo ripete **solo il Task 3** con `moduleNN`/`MODULENN_QUIZ`: creare `js/data/moduleNN_quiz.js`, registrare `extra` su `mNN` in `modules.js`, aggiungere script tag + ASSETS in `sw.js` (bump CACHE), authoring verificato fino a copertura completa degli obiettivi del modulo. Il meccanismo (Task 1-2) è già in piedi. I file sono indipendenti → eseguibili in parallelo.
