# 🐧 Linux Dojo

Mi sto preparando per la **LPIC-1** (esami 101-500 e 102-500) e studiare solo sui PDF mi
annoiava a morte. Così mi sono fatto un'app: card a schermo intero da scorrere come sul
telefono, quiz subito dopo ogni concetto, XP, livelli e streak per avere un motivo in più
per aprirla tutti i giorni.

È tutta in italiano. Uso CachyOS (Arch), quindi gli esempi sono su Arch, ma dove l'esame
vuole Debian o Red Hat lo dico sempre.

**👉 Live:** https://loremona.github.io/linux-quiz-master/

---

## Cosa c'è dentro

- **10 moduli** che coprono tutti gli obiettivi LPIC-1, dal 101.1 al 110.3
- **Lezioni brevi** con un'analogia per ogni concetto, card "terminale" con output veri e
  card "missione" da fare sul proprio PC
- **Quiz** a scelta multipla e a risposta scritta (come all'esame LPI), con spiegazione anche
  delle risposte sbagliate. In totale sono **387 domande**
- **Simulatori d'esame** separati per il 101 e il 102: 60 domande, timer, punteggio 200–800
  con soglia 500
- **Ripasso errori**, **drill** per modulo (solo quiz, senza XP) e **flashcard**
- **Note** su ogni card e checklist di ripasso a fine modulo
- **Cheatsheet** per modulo, **ricerca** tra tutte le card, statistiche, tema chiaro/scuro
- Funziona **offline** (PWA) e si installa sul telefono
- **Profilo opzionale** (nome + codice) per avere gli stessi progressi su PC e telefono

## I moduli

| # | Modulo | Obiettivi |
|---|--------|-----------|
| 1 | 🧠 Com'è fatto Linux | 101.1–101.3 |
| 2 | 📦 Pacchetti & installazione | 102.1–102.6 |
| 3 | ⌨️ Comandi GNU & Unix | 103.1–103.8 |
| 4 | 💾 Dischi & filesystem | 104.1–104.7 |
| 5 | 🐚 Shell & scripting | 105.1–105.2 |
| 6 | 🖥️ Interfacce grafiche | 106.1–106.3 |
| 7 | 👥 Amministrazione | 107.1–107.3 |
| 8 | ⚙️ Servizi di sistema | 108.1–108.4 |
| 9 | 🌐 Networking | 109.1–109.4 |
| 10 | 🔐 Sicurezza | 110.1–110.3 |

## Come si usa

**Dal PC:** basta aprire `index.html` nel browser. Non serve server, build o altro.

**Dal telefono:** apri il link sopra e dal menu del browser scegli *"Aggiungi a schermata
Home"*. Da lì funziona come un'app, anche senza rete.

I progressi restano nel browser (localStorage). Se vuoi usarla su più dispositivi, dalla
home fai *Accedi* con un nome e un codice: i progressi si sincronizzano su Supabase e
vengono uniti a quelli locali, quindi non si perde niente.

Il collegamento a Supabase c'è, ma l'app la uso solo io, quindi non mi interessa tenerlo
sempre attivo. Se il progetto Supabase va in pausa l'app funziona lo stesso: i progressi
restano salvati nel browser.

---

## Com'è fatto

Volevo che restasse semplice: **HTML, CSS e JavaScript puro**, niente framework, niente npm,
niente build. Ogni push su `main` va online da solo con GitHub Pages.

```
index.html              pagina unica: home, feed, esami
css/style.css           tema scuro (variabili in :root)
sw.js                   service worker per l'offline
js/app.js               motore: stato, XP/livelli, feed, card, esami
js/modules.js           elenco dei moduli
js/quiz-core.js         pool di domande per drill ed esami
js/notes-core.js        note e concetti da ripassare
js/sync.js              sincronizzazione del profilo su Supabase
js/config.js            URL e chiave pubblica di Supabase
js/vendor/              supabase-js in locale, così va anche offline
js/data/moduleNN.js     le card di ogni modulo
js/data/moduleNN_quiz.js  domande extra (solo drill ed esami)
test/                   test delle parti logiche
```

### Le card

Ogni modulo è un array di card. I tipi sono questi:

```js
{ type: 'lesson',   emoji, title, text, analogy }   // spiegazione + analogia
{ type: 'fact',     emoji, title, text }            // curiosità
{ type: 'terminal', emoji, title, text, cmd, out }  // comando con output
{ type: 'mission',  emoji, title, text, solution }  // esercizio sul proprio PC
{ type: 'quiz',     q, opts, a, explain }           // scelta multipla
{ type: 'input',    q, accept, placeholder, explain } // risposta scritta
```

### Cose da ricordare quando ci metto mano

- Se cambio dei file, devo alzare la versione di `CACHE` in `sw.js`, altrimenti il telefono
  continua a vedere quelli vecchi.
- I progressi sono salvati per posizione della card (`modulo:indice`): le card nuove vanno
  **in fondo** al modulo, se le metto in mezzo sballo il ripasso già fatto.
- I test girano con `gjs` (non ho Node installato): `gjs test/sync-test.js`,
  `gjs test/quiz-core-test.js`, `gjs test/notes-core-test.js`.
- Prima di committare controllo che i file JS si leggano senza errori di sintassi.

### Come scrivo i contenuti

- Tono da amico, non da manuale. Un concetto per card.
- Analogie di tutti i giorni, così me le ricordo.
- I comandi sempre scritti esatti: all'esame chiedono la sintassi precisa.
- Nei quiz le risposte sbagliate devono sembrare credibili, e la spiegazione dice perché
  sono sbagliate.

---

## Crediti

È un progetto di studio, quindi per fare prima e tenere le cose semplici mi sono fatto
aiutare da Claude per la revisione e la correzione dei contenuti e del codice.
