# 🐧 LINUX DOJO — La palestra per la certificazione LPIC-1

> Impara Linux come se fosse TikTok: card a schermo intero, swipe, quiz istantanei,
> XP, streak, livelli e coriandoli. Zero noia, massima dopamina. 🧠⚡

**Certificazione target: LPIC-1** (esami **101-500** + **102-500**) — la certificazione
Linux vendor-neutral più riconosciuta in Europa. Contenuti in italiano, spiegati in modo
semplicissimo, con esempi pratici su **Arch Linux / CachyOS** (la distro dell'utente)
e note su Debian/Red Hat dove l'esame le richiede.

---

## 🚀 Come si usa

### Dal PC
Apri `index.html` nel browser. Fine. Niente server, niente build, niente dipendenze.

### Dal telefono (senza PC acceso!) 📱
Il progetto vive ormai nel suo repo dedicato **`loremona/linux-quiz-master`** (pubblico).
1. Su GitHub (una tantum): **Settings → Pages → Deploy from branch → main → / (root)** → Save
2. Dopo ~1 minuto l'app è live su `https://loremona.github.io/linux-quiz-master/`
3. Dal telefono: menu del browser → **"Aggiungi a schermata Home"**

I progressi (XP, streak, moduli, quiz) si salvano in localStorage.
In più c'è il **profilo cloud opzionale** (👤 Accedi in home): nome + codice, senza password,
e i progressi si sincronizzano su Supabase tra PC e telefono (merge locale+remoto, mai last-write-wins).

---

## ✅ STATO ATTUALE

| Checkpoint | Contenuto | Stato |
|---|---|---|
| **CP0** | Motore app (feed, card, quiz, XP, livelli, streak, coriandoli, salvataggio) + **Modulo 1** | ✅ Fatto |
| **CP1** | **Modulo 2** | ✅ Fatto |
| **CP2** | **Modulo 3** + upgrade motore: quiz a risposta scritta (tipo `input`) | ✅ Fatto |
| **CP3** | **Modulo 4** + upgrade motore: card "🎯 Missione" | ✅ Fatto |
| **CP4** | **Modulo 5** + upgrade motore: mazzo "Ripasso errori 🔁" in home | ✅ Fatto |
| **CP5** | **Modulo 6** (corto!) + retrofit: missioni e quiz `input` nei Moduli 1–2 | ✅ Fatto |
| **CP6** | **Modulo 7** | ✅ Fatto |
| **CP7** | **Modulo 8** | ✅ Fatto |
| **CP8** | **Modulo 9** | ✅ Fatto |
| **CP9** | **Modulo 10** | ✅ Fatto |
| **CP10** | Simulatore Esame 101 + Esame 102 (60 domande, timer, punteggio LPI 200–800, soglia 500) | ✅ Fatto |
| **CP11** | Cheatsheet per modulo + PWA offline (manifest + service worker) | ✅ Fatto |
| **CP12** | Migrazione in repo dedicato `linux-quiz-master` + GitHub Pages | ✅ Fatto (anticipato) |
| **CP13** | Statistiche dettagliate · Flashcard mode · Esami 101/102 separati · Tema chiaro/scuro | ✅ Fatto |
| **CP14** | Ricerca globale tra le card · Quiz Drill mode per modulo (solo quiz, senza XP) | ✅ Fatto |
| **CP15** | Note contestuali (📝 pin su ogni card + hub note) · Ripasso attivo di fine modulo (checklist + deck mirato + badge "da ripassare") | ✅ Fatto |
| **CP16** | Login profilo cloud: nome+codice, sync progressi su Supabase, local-first con merge anti data-loss (`js/sync.js`, test gjs) | ✅ Fatto |
| **CP17** | Banca domande extra: `js/data/moduleNN_quiz.js` per tutti i 10 moduli — alimentano drill+esami ma non il feed. **Pool totale: 387 domande** (214 inline + 173 extra) via `js/quiz-core.js` | ✅ Fatto |

### I 10 moduli (= programma d'esame LPIC-1 completo)

Conteggi reali al 2026-07-02. "Quiz feed" = domande `quiz`+`input` dentro le lezioni;
"extra" = banca `moduleNN_quiz.js` che alimenta solo drill ed esami.

| # | Modulo | Obiettivi LPI coperti | Card | Quiz feed | Extra |
|---|--------|----------------------|------|-----------|-------|
| 1 | 🧠 Com'è fatto Linux | 101.1, 101.2, 101.3 | 58 | 22 (1 `input`) + 2 missioni | 24 |
| 2 | 📦 Pacchetti & installazione | 102.1–102.6 (+ pacman/AUR extra) | 53 | 22 (1 `input`) + 2 missioni | 16 |
| 3 | ⌨️ Comandi GNU & Unix | 103.1–103.8 (cd/ls/cp, pipe, redirect, grep, regex, sort/cut/wc/tr, ps/kill/nice, vi) | 73 | 34 (4 `input`) | 18 |
| 4 | 💾 Dischi & filesystem | 104.1–104.7 (mkfs, fsck, mount/umount, df/du, permessi, chmod/chown, link, FHS, find/locate) | 64 | 28 (2 `input`) + 3 missioni | 16 |
| 5 | 🐚 Shell & scripting | 105.1, 105.2 (variabili, PATH, alias, .bashrc, script, if/for/while, test) | 53 | 19 (1 `input`) + 3 missioni | 16 |
| 6 | 🖥️ Interfacce grafiche | 106.1–106.3 (X11, Wayland, display manager, accessibilità: sticky/slow/bounce/mouse keys, contrasto, Orca, braille) | 27 | 11 (1 `input`) + 1 missione | 15 |
| 7 | 👥 Amministrazione | 107.1–107.3 (useradd/usermod, /etc/passwd /shadow /group, cron, at, systemd timer, locale) | 51 | 20 (2 `input`) + 3 missioni | 16 |
| 8 | ⚙️ Servizi di sistema | 108.1–108.4 (date/timedatectl/NTP/chrony/SNTP, fuso orario, journald/rsyslog, MTA/mail/MUA, CUPS lpr/IPP 631) | 45 | 17 (1 `input`) + 3 missioni | 16 |
| 9 | 🌐 Networking | 109.1–109.4 (IP/CIDR, TCP/UDP/ICMP, porte note, naming interfacce, ip/ss/ping/traceroute, net-tools↔iproute2, /etc/network/interfaces, DNS) | 51 | 18 (1 `input`) + 3 missioni | 17 |
| 10 | 🔐 Sicurezza | 110.1–110.3 (sudo/su, SUID/SGID, ulimit, ssh + chiavi, gpg, last/who/w) | 57 | 23 (2 `input`) + 3 missioni | 19 |

**Totale pool drill/esami: 387 domande** (214 nel feed + 173 extra).

---

## 📐 GUIDA PER CHI SVILUPPA (sessioni Claude future: leggi TUTTO prima di scrivere codice)

### Regole d'oro
1. Il progetto vive nel repo dedicato **`loremona/linux-quiz-master`**: i file stanno nella ROOT del repo
2. Branch di lavoro: **`main`** (commit + push diretti; l'app va live su GitHub Pages a ogni push)
3. **Niente build tool, niente framework, niente npm**: vanilla HTML/CSS/JS, deve girare aprendo `index.html` da file e su GitHub Pages
4. Fai UN checkpoint per volta, poi committa, pusha e aggiorna le tabelle di stato in questo README
5. Prima di committare: `node --check` su ogni file JS toccato (se `node` manca sul sistema, vale un parse-check equivalente, es. `gjs` + `new Function(src)`)

### Architettura
```
(root del repo)
├── index.html        # SPA: home + feed. I moduli si caricano con <script> in fondo
├── css/style.css     # Tema scuro neon. Variabili CSS in :root
├── sw.js             # Service worker cache-first. BUMPA `CACHE` a ogni modifica di file!
├── js/app.js         # Motore: stato/localStorage, XP/livelli, feed, builder card, confetti
├── js/modules.js     # Registro MODULES: aggancia MODULE01..MODULE10 + banche extra
├── js/quiz-core.js       # UMD puro: quizPool/drillCount (pool inline+extra per drill/esami)
├── js/notes-core.js      # UMD puro: note contestuali + concetti da ripassare
├── js/sync.js            # UMD puro: profilo cloud Supabase, mergeStates anti data-loss
├── js/config.js          # URL + chiave publishable Supabase (pubblica by design, RLS attiva)
├── js/vendor/supabase.min.js # supabase-js v2.108.2 self-hostato (offline totale, no CDN)
├── js/data/moduleNN.js       # Un file per modulo: const MODULENN = [ ...card ]
├── js/data/moduleNN_quiz.js  # Banca extra: const MODULENN_QUIZ = [ ...quiz ] (solo drill/esami)
└── test/             # Test dei moduli puri, girano con gjs: `gjs test/sync-test.js` ecc.
```

### Come si aggiunge un modulo (3 passi)
1. Crea `js/data/moduleNN.js` con `const MODULENN = [ ... ]` (vedi schema card sotto)
2. Aggiungi `<script src="js/data/moduleNN.js"></script>` in `index.html` (PRIMA di modules.js)
3. Stop. `modules.js` lo aggancia da solo (controlla `typeof MODULENN !== 'undefined'`)

### Schema delle card (5 tipi esistenti)
```js
// LEZIONE — analogy è OBBLIGATORIA (tranne card di ripasso): è la firma del Dojo
{ type: 'lesson', emoji: '🧠', title: 'Titolo corto',
  text: `HTML consentito: <strong>, <code>, <br>. Concetto in max ~120 parole.`,
  analogy: `Analogia stupida ma memorabile. Il prefisso "🐒 Per la scimmia:" lo mette il CSS.` },

// FUN FACT — curiosità/aneddoto, 1-2 per modulo
{ type: 'fact', emoji: '🇫🇮', title: 'Titolo', text: `...` },

// TERMINALE — output REALISTICO di un comando (l'utente preme "▶ Esegui")
{ type: 'terminal', emoji: '🔍', title: 'Titolo', text: `(opzionale) intro`,
  cmd: 'lsblk', out: `output multilinea realistico` },

// QUIZ — 4 opzioni, a = indice risposta giusta (0-3), explain OBBLIGATORIA
{ type: 'quiz', q: 'Domanda in stile esame LPIC-1?',
  opts: ['...', '...', '...', '...'], a: 1,
  explain: `Perché è giusta E perché le altre sono sbagliate. Chiudi con emoji.` },

// QUIZ A RISPOSTA SCRITTA (fill-in-the-blank, come all'esame LPI) — da CP2
// Confronto: trim + case-insensitive + spazi multipli collassati. Invio = verifica.
// XP: +35. Sbagliato → mostra accept[0] come risposta. accept[0] = la forma "canonica".
{ type: 'input', q: 'Quale comando carica un modulo kernel con le dipendenze?',
  accept: ['modprobe', 'sudo modprobe'], placeholder: 'scrivi il comando...',
  explain: `...` },
```

### Nuovi tipi da implementare (specifica concordata con l'utente)
```js
// CP3 — MISSIONE (esercizio sul terminale VERO dell'utente, 2-3 a fine modulo)
{ type: 'mission', emoji: '🎯', title: 'Missione: chi comanda?',
  text: `Sul TUO CachyOS scopri quale target di avvio è impostato.`,
  solution: `systemctl get-default\n→ probabilmente graphical.target` },
// Bottone "Mostra soluzione" + bottone "Fatta! ✅" (+20 XP, una sola volta)

// CP4 — RIPASSO ERRORI: in app.js salva i quiz sbagliati in state.wrong
// (chiave "modId:cardIdx"); in home una card "🔁 Ripasso (N)" apre un feed
// con i soli quiz sbagliati; rispondi giusto → esce dal mazzo.
```

### Struttura di un modulo (la ricetta che funziona)
- **25–35 card** totali, di cui **12–18 quiz** (Modulo 6 fa eccezione: ~15 card)
- Apertura: 1 card benvenuto con l'elenco di cosa si impara
- Corpo: blocchi `lezione → (terminale) → quiz` — il quiz arriva SUBITO dopo il concetto
- 1–2 fun fact a metà (pausa dopamina)
- Chiusura: card "🧩 RIPASSO LAMPO" (tutto il modulo in 6 righe) + 2–3 quiz finali misti
- Le **trappole d'esame** (es. start/enable, update/upgrade) meritano una card dedicata col tag "TRAPPOLA!"

### La voce del Dojo (stile contenuti — NON derogare)
- Italiano, tono da amico sveglio, MAI accademico. Paroloni vietati senza spiegazione immediata
- Ogni lezione = UN concetto solo. Se servono due concetti, fai due card
- Analogie concrete e quotidiane (ristorante, supermercato, condominio...) — coerenti tra loro dentro al modulo se possibile
- Emoji come segnaletica (1 per riga di elenco), non come coriandoli
- Comandi sempre in `<code>`, mai parafrasati: l'esame chiede la sintassi esatta
- Quiz: distrattori PLAUSIBILI (comandi veri usati male, opzioni simili), mai risposte palesemente assurde; le `explain` spiegano anche perché i distrattori sono sbagliati
- Dove Arch/CachyOS differisce da Debian/RedHat, dillo SEMPRE (l'esame è distro-neutral ma l'utente vive su Arch)

### Attenzione al salvataggio utente
- `STORE_KEY = 'linux-dojo-v1'` — lo stato salvato indicizza le card per posizione (`modId:cardIdx`)
- **Aggiungere card IN CODA a un modulo è sicuro; inserirle in mezzo sposta gli indici** e
  falsa XP/ripasso già registrati. Se devi riordinare un modulo già pubblicato, accetta la
  perdita di quel progresso parziale (non bumpare STORE_KEY: azzererebbe TUTTO)

### Checklist di fine checkpoint
- [ ] `node --check` su tutti i JS toccati
- [ ] Nuovo modulo registrato in `index.html` (tag `<script>`)
- [ ] Conteggio card/quiz aggiornato nelle tabelle di questo README
- [ ] Riga checkpoint marcata ✅ in questo README
- [ ] Commit con messaggio `Linux Dojo CPn: ...` + push sul branch di sessione
- [ ] Nel messaggio finale all'utente: cosa è stato fatto, cosa manca, come continuare

---

## 📦 Migrazione in repo dedicato (CP12) — ✅ FATTA

Il progetto è stato migrato da `aws-quiz-master` (branch `claude/aws-quiz-master-mobile-yqibg2`,
cartella `linux-dojo/`) alla **root** di questo repo dedicato il 2026-06-12.
GitHub Pages è **attiva**: l'app è live su https://loremona.github.io/linux-quiz-master/ a ogni push su `main`.

---

## 🗣️ Per l'utente: come continuare

Apri una nuova sessione Claude su questo repo e scrivi:

> **"Continua il Linux Dojo dal checkpoint successivo (leggi il README.md nella root)"**

La sessione troverà qui dentro tutto: stato, roadmap, schema delle card, stile e checklist.
