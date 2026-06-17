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
| **CP9** | **Modulo 10** | ⬜ |
| **CP10** | Simulatore Esame 101 + Esame 102 (60 domande, timer, punteggio LPI 200–800, soglia 500) | ⬜ |
| **CP11** | Cheatsheet per modulo + PWA offline (manifest + service worker) | ⬜ |
| **CP12** | Migrazione in repo dedicato `linux-quiz-master` + GitHub Pages | ✅ Fatto (anticipato) |

### I 10 moduli (= programma d'esame LPIC-1 completo)

| # | Modulo | Obiettivi LPI coperti | Stato |
|---|--------|----------------------|-------|
| 1 | 🧠 Com'è fatto Linux | 101.1, 101.2, 101.3 | ✅ 36 card, 13 quiz (di cui 1 `input`, 2 missioni) |
| 2 | 📦 Pacchetti & installazione | 102.1–102.6 (+ pacman/AUR extra) | ✅ 32 card, 12 quiz (di cui 1 `input`, 2 missioni) |
| 3 | ⌨️ Comandi GNU & Unix | 103.1–103.8 (cd/ls/cp, pipe, redirect, grep, regex, sort/cut/wc/tr, ps/kill/nice, vi) | ✅ 35 card, 15 quiz (di cui 4 `input`) |
| 4 | 💾 Dischi & filesystem | 104.1–104.7 (mkfs, fsck, mount/umount, df/du, permessi, chmod/chown, link, FHS, find/locate) | ✅ 41 card, 12 quiz (di cui 1 `input`, 3 missioni) |
| 5 | 🐚 Shell & scripting | 105.1, 105.2 (variabili, PATH, alias, .bashrc, script, if/for/while, test) | ✅ 40 card, 13 quiz (di cui 1 `input`, 3 missioni) |
| 6 | 🖥️ Interfacce grafiche | 106.1–106.3 (X11, Wayland, display manager, accessibilità) | ✅ 18 card, 6 quiz (di cui 1 `input`, 1 missione) |
| 7 | 👥 Amministrazione | 107.1–107.3 (useradd/usermod, /etc/passwd /shadow /group, cron, at, systemd timer, locale) | ✅ 36 card, 13 quiz (di cui 2 `input`, 3 missioni) |
| 8 | ⚙️ Servizi di sistema | 108.1–108.4 (date/timedatectl/NTP/chrony, journald/rsyslog, MTA, CUPS) | ✅ 33 card, 13 quiz (di cui 1 `input`, 3 missioni) |
| 9 | 🌐 Networking | 109.1–109.4 (IP/CIDR, porte note, ip/ss/ping/traceroute, /etc/hosts, resolv.conf, DNS) | ✅ 37 card, 14 quiz (di cui 1 `input`, 3 missioni) |
| 10 | 🔐 Sicurezza | 110.1–110.3 (sudo/su, SUID/SGID, ulimit, ssh + chiavi, gpg, last/who/w) | ⬜ |

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
├── js/app.js         # Motore: stato/localStorage, XP/livelli, feed, builder card, confetti
├── js/modules.js     # Registro MODULES: già pronto per MODULE01..MODULE10
└── js/data/moduleNN.js  # Un file per modulo: const MODULENN = [ ...card ]
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
Resta solo da attivare GitHub Pages (una tantum): **Settings → Pages → main → / (root)**.

---

## 🗣️ Per l'utente: come continuare

Apri una nuova sessione Claude su questo repo e scrivi:

> **"Continua il Linux Dojo dal checkpoint successivo (leggi il README.md nella root)"**

La sessione troverà qui dentro tutto: stato, roadmap, schema delle card, stile e checklist.
