# Note + Ripasso attivo di fine modulo — Design

Data: 2026-06-29
Stato: approvato, pronto per il piano di implementazione

## Obiettivo

Aggiungere a Linux Dojo due funzionalità collegate per consolidare lo studio:

1. **Note contestuali** — un punto di accesso costante (un "pin") su ogni card del
   feed per annotare con parole proprie il concetto su cui si sta lavorando.
2. **Recap attivo di fine modulo** — al termine di un modulo, una checklist
   dettagliata ("lista della spesa") di tutti i concetti; l'utente spunta ciò che
   ricorda, e i concetti non spuntati vengono riproposti in un deck di ripasso
   mirato finché non li padroneggia.

Razionale didattico: trasforma il ripasso da lettura passiva ad **active recall**,
in linea con l'obiettivo di studio dell'utente (LPIC-1 → percorso Cloud/SRE).

## Contesto tecnico attuale

- **App**: PWA statica, vanilla JS. Feed verticale di card (`#cards.cards`) tipo
  TikTok con scroll-snap. Card di tipo `lesson`, `fact`, `quiz`, `mission`, `term`,
  ecc., definite negli array `MODULE01..MODULE10` (`js/data/moduleNN.js`).
- **Stato persistente** (`js/app.js`): oggetto `state` in `localStorage`
  (`linux-dojo-v1`), forma:
  ```js
  { xp, streak, bestStreak, lastDay,
    modules: { id -> { card, done, quizOk, quizTot } },
    seen:  { "modId:cardIdx" -> true },   // XP già assegnata
    wrong: { "modId:cardIdx" -> true } }  // quiz sbagliati al 1° tentativo
  ```
- **Salvataggio**: `saveState()` scrive in `localStorage` e chiama `Sync.push(state)`.
- **Sync cloud** (`js/sync.js`, Supabase): merge **non distruttivo** tra stato
  locale e remoto (commit `31aecbf`) — non si perde mai progresso di nessun lato.
- **Recap esistente**: `buildRecap(mod)` genera la card "Dove eri rimasto" (solo
  titoli dei concetti visti). Questa feature ne è l'evoluzione.
- **Convenzione chiavi**: le card si identificano con `"modId:cardIdx"`
  (vedi `seen`/`wrong`). Le nuove strutture seguono la stessa convenzione.

## Modello dati

Due nuovi campi in `defaultState()`, entrambi chiave `"modId:cardIdx"`:

```js
notes:  { "modId:cardIdx" -> { text: string, title: string, ts: ISOString } }
recall: { "modId:cardIdx" -> { val: true, ts: ISOString } }   // "questo lo ricordo"
```

- `notes.title` è memorizzato per poter mostrare la nota nell'hub e nel recap anche
  senza ricaricare il modulo.
- `recall`: `val:true` = concetto spuntato come "ricordato"; `val:false` o assenza
  = da ripassare. **Togliere la spunta imposta `val:false` con `ts` aggiornato (non
  cancella la chiave)**, così il merge LWW propaga correttamente l'annullamento.
- Allo stesso modo, **svuotare una nota imposta `text:""` con `ts` aggiornato (non
  cancella la chiave)**: il pin tratta `text:""` come "senza nota", ma la chiave
  resta perché il merge gestisca la cancellazione cross-device via `ts`.

### Regole di merge nel sync

Estendere il merge non distruttivo di `sync.js` per `notes` e `recall`:

- Unione per chiave: una chiave presente da un solo lato **non si cancella mai**.
- Per chiavi presenti su entrambi i lati: **vince il `ts` più recente**
  (last-write-wins per-chiave, non per-oggetto).

Questo permette di togliere la spunta o modificare/“svuotare” una nota da un
dispositivo senza che un push più vecchio la ripristini.

## Componente A — Note (pin contestuale)

### UI

- **Pin**: pulsante `📝` fisso, angolo **basso-destra** del feed, sopra la
  safe-area (`env(safe-area-inset-bottom)`). Non deve collidere con
  `.feed-scroll-hint` (centrato in basso) né con `.feed-topbar`.
- **Stato visivo**: outline/spento se la card centrata **non** ha nota; pieno/acceso
  (con dot) se ce l'ha.
- Il pin agisce sulla **card attualmente centrata** nel feed. Il feed traccia già
  l'indice corrente durante lo scroll (vedi aggiornamento di `prog.card`,
  `js/app.js:453`); il pin legge quell'indice.

### Interazione

- Tap sul pin → **bottom-sheet** con:
  - titolo della card corrente (contesto, sola lettura),
  - `textarea` precompilata con la nota esistente (se presente),
  - pulsanti **Salva** e **Chiudi**.
- Salva → scrive `state.notes["modId:cardIdx"] = { text, title, ts: now }`
  (se `text` è vuoto: `text:""` con `ts` aggiornato — vedi regola di cancellazione
  nel Modello dati) e chiama `saveState()`.
- Alla chiusura il pin si aggiorna (acceso/spento) in base alla presenza nota.
- Editor semplice: testo libero, nessuna formattazione ricca.

### Hub "Note"

- Icona `📝` nella `.feed-topbar` → schermata che elenca **tutte le note**
  raggruppate per modulo, ognuna con il titolo della card a cui è agganciata e un
  link per saltare a quella card nel feed.

## Componente B — Recap fine modulo (checklist active recall)

### Quando appare

- Card "Recap modulo" in **coda al modulo** quando il modulo è completato
  (`state.modules[id].done`), e **ri-accessibile** (es. riaprendo un modulo già
  finito, o da un punto dedicato).

### Contenuto

- Lista dettagliata di **tutti i concetti** del modulo = card di tipo `lesson` e
  `fact` (i `quiz`/`mission` sono già test e hanno il loro "ripasso errori":
  esclusi dalla checklist).
- Ogni voce mostra: **emoji + titolo + essenza**, dove l'essenza è:
  - per `lesson`: la riga `analogy` ("🐒 Per la scimmia…"), già un riassunto
    memorabile;
  - per `fact`: la prima frase del campo `text` (HTML strippato/troncato).
- Ogni voce ha una **spunta "questo lo ricordo" ✓** che fa il toggle di
  `state.recall["modId:cardIdx"]` (con `ts`) e salva.
- Le voci già spuntate appaiono in stato "ricordato"; le non spuntate evidenziate.
- In fondo alla card: CTA **"Ripassa gli N che non hai spuntato ⬇️"** (N = numero di
  concetti `lesson`/`fact` del modulo senza `recall`). Se N = 0, mostra uno stato
  "tutto ripassato 🎉" e nasconde la CTA.

## Componente C — Ripasso mirato (re-proposal dei non spuntati)

Metodo scelto: **deck flashcard self-paced** (riusa la UI delle modalità
flash/drill già presenti).

### Sorgente

- I concetti del modulo (`lesson`/`fact`) **senza** `state.recall` = coda di
  ripasso del modulo.

### Interazione

- Per ogni concetto: prompt con **emoji + titolo** → pulsante **"Mostra"** → rivela
  l'**essenza** (stessa logica di essenza del recap) →
  - **"Ora la ricordo ✓"** → setta `state.recall` per quella chiave, esce dal deck;
  - **"Ancora no"** → resta nella coda, spostato **in fondo**.
- Il deck gira finché la coda è vuota. A fine deck: messaggio di completamento.
- Nessun intervallo temporale, nessun algoritmo SM-2 (self-paced, coerente col
  ritmo di studio dell'utente).
- Durante il ripasso il **pin note** resta disponibile per annotare.

### Ingaggio / visibilità

- In **home**, sulla `module-card`, badge **"📌 N da ripassare"** quando il modulo è
  `done` e ci sono concetti senza `recall`. Tap → apre il deck di ripasso mirato.
- La CTA del recap (Componente B) apre lo stesso deck.

## Confini / scelte separate

- **Feed normale** = solo prima lettura. Il ripasso vive nel deck dedicato → due
  flussi separati e puliti.
- **Quiz sbagliati**: già gestiti dal "ripasso errori" esistente (`state.wrong`).
  Nessuna sovrapposizione con la checklist (che riguarda solo `lesson`/`fact`).
- Recap a **livello modulo** (non sotto-sezione): nessuna marcatura di sezione nei
  dati richiesta.

## Fuori scope (YAGNI)

- Nessuna generazione AI: recap ed essenze nascono dai dati già presenti.
- Nessuna ripetizione spaziata a intervalli (SM-2/Leitner temporizzato).
- Nessun recap di sotto-sezione tematica.
- Nessun editor di note ricco (solo testo).

## Test / criteri di accettazione

1. **Persistenza note**: creo una nota su una card, ricarico la PWA → la nota è
   ancora lì e il pin risulta acceso su quella card.
2. **Svuotamento nota**: cancello il testo e salvo → la nota risulta vuota
   (`text:""`), il pin torna spento; dopo reload resta spento (non riappare).
3. **Merge sync note**: nota creata su device A, non presente su B; un push da B non
   la cancella. Modifica più recente vince.
4. **Pin contestuale**: scorrendo il feed, lo stato acceso/spento del pin riflette la
   card centrata.
5. **Checklist recap**: il recap di un modulo completato elenca tutti i concetti
   `lesson`/`fact` con emoji+titolo+essenza; spuntare aggiorna `recall` e persiste.
6. **Conteggio N**: la CTA "Ripassa gli N…" mostra il numero corretto di non
   spuntati; a N=0 mostra lo stato "tutto ripassato".
7. **Deck ripasso**: "Ancora no" rimette il concetto in fondo; "Ora la ricordo"
   lo spunta e lo rimuove; il deck termina quando la coda è vuota.
8. **Badge home**: il modulo `done` con concetti non spuntati mostra "📌 N da
   ripassare"; il badge sparisce quando N=0.
