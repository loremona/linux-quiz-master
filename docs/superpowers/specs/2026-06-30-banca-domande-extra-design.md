# Banca domande extra — copertura completa LPIC-1

**Data:** 2026-06-30
**Progetto:** linux-quiz-master
**Stato:** design approvato, in attesa di piano d'implementazione

## Problema

Il quiz ha oggi **198 domande** `type:'quiz'`/`type:'input'` sparse inline nei 10
moduli (10-30 per modulo). I simulatori d'esame (`startExamWith`) e il drill
(`openQuizDrill`) costruiscono un pool da tutte le card quiz/input dei moduli
rilevanti, lo mescolano e ne pescano 30 (Esame 101/102) o 60 (Completo).

Con pool piccoli, l'utente rischia di trovare all'esame reale una domanda mai
vista — perché il pool non copre l'intera superficie degli obiettivi LPIC-1.
Obiettivo: **arrivare al 100% di copertura degli obiettivi** così che nessuna
domanda d'esame risulti "fuori dal preparato".

## Obiettivo

Aumentare numero e varietà delle domande fino a coprire **tutti gli obiettivi
ufficiali LPIC-1** (101-500 per i moduli 1-5, 102-500 per i 6-10), senza
appesantire il feed di apprendimento lineare e senza introdurre dettagli tecnici
inventati.

## Vincolo non negoziabile

**Mai dettagli d'esame inventati** (flag, porte, sintassi, comandi). Decisione
storica del progetto: un contenuto non verificato sui dettagli è peggio di
nessun contenuto. La verifica è parte del processo di authoring, non un passo
opzionale.

## Approccio: banca extra separata

### Modello dati

Ogni modulo guadagna un file gemello `js/data/moduleNN_quiz.js` che definisce un
array di sole card `type:'quiz'`/`type:'input'`:

```js
/* ═══════════ MODULO 1 — Banca domande extra ═══════════ */
'use strict';
const MODULE01_QUIZ = [
  { type: 'quiz',
    q: '...',
    opts: ['...', '...', '...', '...'],
    a: 2,
    explain: '...' }, //src: module01.js card "Il boot" / obj 101.2
  // ...
];
```

Le card extra usano **lo stesso schema** delle card quiz/input esistenti:
- `quiz`: `q`, `opts` (array), `a` (indice corretto), `explain`
- `input`: `q`, `accept` (array di risposte valide), `placeholder`, `explain`

così tutta la macchina di rendering, scoring e finale le tratta senza modifiche.

In `js/modules.js`, ogni modulo guadagna una proprietà `extra`:

```js
{ id: 'm01', icon: '🧠', title: '...', sub: '...',
  cards: (typeof MODULE01 !== 'undefined') ? MODULE01 : [],
  extra: (typeof MODULE01_QUIZ !== 'undefined') ? MODULE01_QUIZ : [] },
```

Un modulo senza file `_quiz.js` ha `extra: []` → nessuna regressione.

### Wiring nel codice (modifiche isolate)

| Punto | File | Modifica |
|---|---|---|
| Feed-lezione (`openModule`, `renderCards`) | `js/app.js` | **Nessuna** — usa solo `mod.cards`; la banca NON compare nello scorrimento didattico |
| Drill (`openQuizDrill`, ~riga 371) | `js/app.js` | pool = card quiz/input di `mod.cards` **+** `mod.extra` |
| Simulatori (`startExamWith`, ~riga 1018) | `js/app.js` | il loop sul pool aggiunge anche `mod.extra` |
| Conteggio quiz home (~riga 270) | `js/app.js` | `drillCount` include anche `mod.extra` per coerenza del bottone 🎯 |
| Caricamento script | `index.html` | aggiungere `<script src="js/data/moduleNN_quiz.js">` prima di `modules.js` |
| Cache offline | `sw.js` | bump `CACHE` + aggiungere i nuovi file alla precache list |

Helper unico consigliato per evitare duplicazione della logica di pool:

```js
function quizPool(mod) {
  const inline = mod.cards.filter(c => c.type === 'quiz' || c.type === 'input');
  return inline.concat(mod.extra || []);
}
```

usato da `openQuizDrill`, `startExamWith` e dal conteggio in home.

### Card di apprendimento mancanti

Se un concetto richiesto dagli obiettivi **non è insegnato** in nessuna card del
modulo, si aggiunge una card `lesson`/`fact` **inline** in `moduleNN.js` (così
entra nel feed didattico) oltre alle relative domande nella banca extra. La
banca extra contiene SOLO domande, mai materiale didattico nuovo non insegnato
altrove.

## Completezza e verifica

### Metro di completezza

Gli **obiettivi ufficiali LPIC-1**, secondo il raggruppamento dell'app:
- Moduli 1-5 → simulatore esame **101-500**
- Moduli 6-10 → simulatore esame **102-500**

Ogni modulo va mappato ai sotto-obiettivi LPIC pertinenti al suo argomento
(il titolo/`sub` del modulo indica l'area). Criterio "modulo completo": ogni
*Key Knowledge Area* e ogni comando/file elencato in quegli obiettivi ha
**≥1 domanda** nel pool combinato (card inline esistenti + banca extra).

### Volume

Indicativo **+15-25 domande per modulo** (totale da ~198 a ~400). Il numero
esatto lo detta la copertura degli obiettivi, non un tetto fisso.

### Processo di verifica (automatico, dentro l'authoring)

1. Ogni domanda è **ancorata a una fonte verificata**: una card esistente del
   modulo, una card dei deck Anki dell'utente (lpic-flashcard, topic 105-110),
   o un obiettivo LPIC ufficiale.
2. Ogni **dettaglio tecnico nuovo** (flag, porta, sintassi) viene controllato
   contro la **man page reale** sul sistema (CachyOS) prima di scriverlo.
3. Ogni card extra porta un commento `//src:` con il riferimento → tracciabilità
   e spot-check possibile, senza gate di revisione obbligatorio.

Nessun gate di revisione manuale bloccante: l'utente si fida dell'esecuzione
automatica, la sicurezza è garantita dall'ancoraggio + verifica man page.

## Decomposizione

Lo scope è grande (10 moduli) → si decompone in unità indipendenti, una per
modulo. Ogni `moduleNN_quiz.js` è un file a sé, testabile da solo via drill/esame.

- **Iterazione 1 — fondazione + Modulo 1**: implementa il meccanismo banca-extra
  (helper `quizPool`, wiring drill/esame/conteggio, script tag, sw bump) e scrive
  `module01_quiz.js` come template. Verifica end-to-end che drill ed esame
  peschino le card extra.
- **Iterazioni 2-10 — un modulo ciascuno**: scrive `moduleNN_quiz.js` fino alla
  copertura completa degli obiettivi del modulo, più eventuali card lesson/fact
  inline per i concetti non insegnati. File indipendenti → eseguibili in
  sequenza o in parallelo.

## Test

- **Manuale/funzionale**: aprire drill ed esame di un modulo con banca extra e
  verificare che il conteggio domande aumenti e che le card extra compaiano nel
  pool (scorrere, controllare scoring e finale).
- **Coerenza schema**: ogni card extra ha i campi richiesti dal suo `type`
  (`quiz`: `q`/`opts`/`a`/`explain`; `input`: `q` + validazione). Una card
  malformata romperebbe il rendering → controllo a vista / lint leggero.
- **Nessuna regressione**: feed-lezione invariato (la banca non vi compare),
  recall/recap/note/sync intatti.
- Il progetto gira con **gjs** (Node assente): eventuali test di `quizPool`
  vanno scritti per gjs come gli esistenti in `test/`.

## Out of scope

- Generazione automatica via LLM a runtime nell'app (resta la decisione storica:
  niente chatbot/LLM dentro la PWA).
- Ristrutturazione del feed di apprendimento o del sistema di scoring.
- Modifiche ai deck Anki di lpic-flashcard (sono solo una *fonte* di domande,
  non vengono toccati).
