/* ═══════════ MODULO 3 — Comandi GNU & Unix (LPIC-1 Topic 103) ═══════════ */
'use strict';

const MODULE03 = [

{ type: 'lesson', emoji: '⌨️', title: 'Modulo 3: la sala macchine',
  text: `Questo è il modulo dei <strong>comandi veri</strong> — il blocco che pesa di più all'esame 101:<br><br>
  🚶 muoversi e gestire file: <code>cd</code>, <code>ls</code>, <code>cp</code>, <code>mv</code>, <code>rm</code><br>
  🔀 pipe e redirect: <code>|</code>, <code>&gt;</code>, <code>&gt;&gt;</code>, <code>2&gt;</code>, <code>tee</code><br>
  ✂️ elaborare testo: <code>sort</code>, <code>cut</code>, <code>wc</code>, <code>tr</code>, <code>uniq</code><br>
  🔍 cercare: <code>grep</code> + regex, <code>find</code><br>
  👨‍🍳 processi: <code>ps</code>, <code>kill</code>, <code>nice</code>, <code>bg</code>/<code>fg</code><br>
  📝 sopravvivere a <code>vi</code><br><br>
  ⚠️ Novità: in questo modulo alcuni quiz si rispondono <strong>SCRIVENDO il comando</strong>, come all'esame LPI. +35 XP l'uno!`,
  analogy: `Finora hai visitato il ristorante da cliente. Da oggi entri in cucina: coltelli veri, fornelli veri. Il terminale è la tua postazione. 👨‍🍳` },

// ── Navigazione ──────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🧭', title: 'Muoversi: pwd, cd, ls',
  text: `I tre comandi che usi 500 volte al giorno:<br><br>
  📍 <code>pwd</code> — "dove sono?" (print working directory)<br>
  🚶 <code>cd cartella</code> — entra · <code>cd ..</code> — sali · <code>cd</code> (da solo) — vai a casa (~) · <code>cd -</code> — torna dov'eri prima<br>
  👀 <code>ls</code> — elenca · <code>ls -l</code> — dettagli · <code>ls -a</code> — anche i file nascosti (quelli che iniziano con <code>.</code>) · <code>ls -h</code> — dimensioni leggibili · <code>ls -t</code> — ordina per data`,
  analogy: `pwd è guardare la targhetta sulla porta della stanza, cd è camminare tra le stanze, ls è accendere la luce per vedere cosa c'è dentro. 💡` },

{ type: 'terminal', emoji: '👀', title: 'ls -lah: la radiografia',
  text: `<code>-l</code> dettagli, <code>-a</code> anche i nascosti, <code>-h</code> dimensioni umane:`,
  cmd: 'ls -lah',
  out: `totale 48K
drwxr-xr-x  5 lore lore 4,0K 12 giu 09:15 .
drwxr-xr-x 18 lore lore 4,0K 10 giu 18:02 ..
-rw-r--r--  1 lore lore  220  3 mar 11:40 .bashrc
drwxr-xr-x  2 lore lore 4,0K 11 giu 22:31 Documenti
-rw-r--r--  1 lore lore  12K 12 giu 09:15 appunti.txt` },

{ type: 'lesson', emoji: '📦', title: 'cp, mv, rm: sposta, copia, butta',
  text: `🪄 <code>cp origine dest</code> — copia · per le cartelle serve <code>cp -r</code> (ricorsivo), altrimenti si rifiuta!<br>
  🚚 <code>mv vecchio nuovo</code> — sposta… e <strong>rinomina</strong>: in Linux sono la stessa operazione (e non serve -r)<br>
  🗑️ <code>rm file</code> — cancella · <code>rm -r cartella</code> — cancella ricorsivo · <code>rm -i</code> — chiede conferma<br>
  🏗️ <code>mkdir -p a/b/c</code> — crea l'albero intero · <code>touch file</code> — crea un file vuoto<br><br>
  ⚠️ <code>rm</code> non ha cestino: cancellato = SPARITO.`,
  analogy: `cp fotocopia la ricetta, mv la sposta in un altro raccoglitore (o le cambia nome), rm la butta nell'inceneritore — non nel cestino della carta: NELL'INCENERITORE. 🔥` },

{ type: 'quiz',
  q: 'Vuoi copiare l\'intera cartella progetti/ dentro backup/. Quale comando?',
  opts: [
    'cp progetti/ backup/',
    'cp -r progetti/ backup/',
    'mv -r progetti/ backup/',
    'copy progetti/ backup/',
  ],
  a: 1,
  explain: `Per copiare una directory serve <code>cp -r</code> (ricorsivo): senza, cp risponde "omitting directory" e non fa nulla. <code>mv</code> non vuole -r (sposta, non copia), e <code>copy</code> è roba di Windows. 📦` },

{ type: 'input',
  q: 'Sei perso nel filesystem. Scrivi il comando che stampa la directory in cui ti trovi:',
  accept: ['pwd', 'echo $pwd', '/bin/pwd'],
  placeholder: 'scrivi il comando...',
  explain: `<code>pwd</code> = <strong>p</strong>rint <strong>w</strong>orking <strong>d</strong>irectory. Tre lettere che ti salvano ogni volta che il prompt non ti dice dove sei. (Funziona anche <code>echo $PWD</code>, la variabile della shell.) 📍` },

// ── Redirect e pipe ──────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🚰', title: 'I 3 canali di ogni comando',
  text: `Ogni programma Linux nasce con <strong>tre tubi</strong> collegati, numerati:<br><br>
  0️⃣ <strong>stdin</strong> — l'ingresso (di solito la tastiera)<br>
  1️⃣ <strong>stdout</strong> — l'uscita normale (di solito lo schermo)<br>
  2️⃣ <strong>stderr</strong> — l'uscita degli <strong>errori</strong> (anche lei sullo schermo, ma è un tubo SEPARATO)<br><br>
  I numeri 0, 1, 2 sono <strong>materia d'esame</strong>: imparali. Tutta la magia di redirect e pipe è "riattaccare questi tubi altrove".`,
  analogy: `Ogni postazione della cucina ha: il passavivande in entrata (stdin), il passavivande dei piatti pronti (stdout) e lo scarico dei piatti bruciati (stderr). Tre condotti diversi. 🍽️` },

{ type: 'lesson', emoji: '↪️', title: 'Redirect: riattacca i tubi',
  text: `📝 <code>comando &gt; file</code> — stdout su file (<strong>SOVRASCRIVE</strong>!)<br>
  ➕ <code>comando &gt;&gt; file</code> — stdout su file, <strong>in coda</strong> (append)<br>
  💥 <code>comando 2&gt; file</code> — solo gli ERRORI su file<br>
  🌀 <code>comando &gt; file 2&gt;&amp;1</code> — tutto insieme nel file (anche: <code>&amp;&gt; file</code>)<br>
  📥 <code>comando &lt; file</code> — legge l'input dal file<br>
  🕳️ <code>2&gt; /dev/null</code> — gli errori nel buco nero (spariscono)<br><br>
  ⚠️ TRAPPOLA: <code>&gt;</code> azzera il file PRIMA di scriverci. Se volevi aggiungere, era <code>&gt;&gt;</code>.`,
  analogy: `&gt; svuota il barattolo e ci versa la salsa nuova. &gt;&gt; aggiunge sopra senza buttare niente. Sbagliare verso = addio ragù della nonna. 🫙` },

{ type: 'quiz',
  q: 'Vuoi salvare in errori.log SOLO i messaggi di errore di uno script. Come?',
  opts: [
    './script.sh > errori.log',
    './script.sh 2> errori.log',
    './script.sh &> errori.log',
    './script.sh < errori.log',
  ],
  a: 1,
  explain: `Il canale degli errori è il numero <strong>2</strong> (stderr), quindi <code>2&gt;</code>. Il semplice <code>&gt;</code> redirige stdout (canale 1), <code>&amp;&gt;</code> li butta dentro ENTRAMBI, e <code>&lt;</code> è l'ingresso, non l'uscita. 💥` },

{ type: 'lesson', emoji: '🔗', title: 'La pipe: | (la regina di Unix)',
  text: `<code>comando1 | comando2</code> — l'uscita del primo diventa l'<strong>ingresso</strong> del secondo. Si incatenano quanti ne vuoi:<br><br>
  <code>ls /etc | wc -l</code> — quanti file ci sono in /etc?<br><br>
  Due aiutanti speciali:<br>
  🪞 <code>tee file</code> — scrive su file <strong>E</strong> fa passare avanti l'output (lo vedi a schermo)<br>
  🦾 <code>xargs</code> — trasforma l'input in <strong>argomenti</strong> per un altro comando: <code>find . -name "*.tmp" | xargs rm</code>`,
  analogy: `La pipe è la catena di montaggio: lo chef passa il piatto al guarnitore che lo passa al cameriere. tee è il bivio con la fotocopiatrice: una copia in archivio, una prosegue. 🏭` },

{ type: 'quiz',
  q: 'Vuoi vedere l\'output di un comando A SCHERMO e salvarlo anche su file. Cosa usi?',
  opts: [
    'comando > file',
    'comando | tee file',
    'comando 2> file',
    'comando | xargs file',
  ],
  a: 1,
  explain: `<code>tee</code> fa il doppio gioco: scrive su file E lascia scorrere l'output verso lo schermo (o la pipe successiva). Con <code>&gt;</code> l'output finisce SOLO nel file e lo schermo resta muto. <code>xargs</code> trasforma input in argomenti, tutt'altro mestiere. 🪞` },

{ type: 'fact', emoji: '🧪', title: 'La pipe ha 50 anni (e non li dimostra)',
  text: `La pipe nasce nel <strong>1973</strong> ai Bell Labs: Doug McIlroy tormentava il team da anni con l'idea di "avvitare i programmi tra loro come tubi". Una sera Ken Thompson la implementò <strong>in una notte</strong>.<br><br>È il cuore della filosofia Unix: <strong>ogni programma fa UNA cosa sola e la fa bene</strong> — la potenza nasce combinandoli. Mezzo secolo dopo, la usi identica sul tuo CachyOS. 🐧` },

// ── Elaborazione testo ───────────────────────────────────────────────────────
{ type: 'lesson', emoji: '📜', title: 'Leggere file: cat, head, tail, wc',
  text: `📖 <code>cat file</code> — stampa tutto (e <code>tac</code> lo stampa al contrario!)<br>
  🔝 <code>head -n 5 file</code> — le prime 5 righe<br>
  🔚 <code>tail -n 5 file</code> — le ultime 5<br>
  📡 <code>tail -f file</code> — resta in ascolto e mostra le righe NUOVE in tempo reale (il comando dei log!)<br>
  🔢 <code>wc -l</code> righe · <code>wc -w</code> parole · <code>wc -c</code> byte`,
  analogy: `cat rovescia tutto il quaderno sul tavolo, head legge solo l'inizio, tail solo il fondo, tail -f resta lì a guardare mentre qualcuno continua a scrivere. wc conta le righe come un notaio. 📓` },

{ type: 'input',
  q: 'Scrivi il comando per seguire IN DIRETTA le nuove righe di /var/log/app.log:',
  accept: ['tail -f /var/log/app.log', 'tail -F /var/log/app.log', 'sudo tail -f /var/log/app.log', 'tail --follow /var/log/app.log'],
  placeholder: 'scrivi il comando...',
  explain: `<code>tail -f</code> (<strong>f</strong>ollow) non esce: resta agganciato al file e stampa ogni riga nuova appena arriva. Il maiuscolo <code>-F</code> fa lo stesso ma sopravvive anche se il log viene ruotato. È IL comando del sysadmin che osserva. 📡` },

{ type: 'lesson', emoji: '✂️', title: 'Il coltellino svizzero: sort, uniq, cut, tr',
  text: `🔤 <code>sort</code> — ordina le righe (<code>-n</code> numerico, <code>-r</code> inverso, <code>-h</code> dimensioni umane)<br>
  🎯 <code>uniq</code> — elimina i duplicati… ma SOLO se <strong>adiacenti</strong>! Quindi quasi sempre: <code>sort | uniq</code> (<code>-c</code> conta le occorrenze)<br>
  🔪 <code>cut -d: -f1</code> — taglia colonne: delimitatore <code>:</code>, campo 1<br>
  🔁 <code>tr 'a-z' 'A-Z'</code> — traduce caratteri (qui: tutto maiuscolo) · <code>tr -d</code> li elimina`,
  analogy: `sort mette in fila i clienti per altezza, uniq caccia i gemelli ma solo se sono in fila VICINI, cut affetta la tabella a colonne come carote, tr traveste le lettere. 🥕` },

{ type: 'terminal', emoji: '🏭', title: 'Catena di montaggio completa',
  text: `I primi 3 utenti del sistema in ordine alfabetico — tre attrezzi, una pipe:`,
  cmd: 'cut -d: -f1 /etc/passwd | sort | head -n 3',
  out: `avahi
bin
daemon` },

{ type: 'quiz',
  q: 'uniq non sta eliminando i duplicati dal tuo file. Perché?',
  opts: [
    'Serve sort prima: uniq confronta solo righe ADIACENTI',
    'uniq funziona solo con i numeri',
    'Manca l\'opzione -d',
    'Il file è troppo grande per uniq',
  ],
  a: 0,
  explain: `<code>uniq</code> guarda solo la riga PRECEDENTE: se i doppioni sono sparsi nel file non li vede. La ricetta d'esame è <code>sort file | uniq</code>. L'opzione <code>-d</code> fa l'opposto di quel che pensi (mostra SOLO i duplicati), e la dimensione non c'entra nulla. 🎯` },

// ── grep e regex ─────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🔦', title: 'grep: il metal detector',
  text: `<code>grep parola file</code> — stampa le righe che contengono "parola".<br><br>
  Le opzioni che l'esame ama:<br>
  🔠 <code>-i</code> — ignora maiuscole/minuscole<br>
  🚫 <code>-v</code> — INVERTI: righe che NON contengono<br>
  🔢 <code>-n</code> — mostra il numero di riga<br>
  📂 <code>-r</code> — cerca ricorsivo in tutta la cartella<br>
  🧮 <code>-c</code> — conta le righe trovate (non le stampa)<br><br>
  E in pipe è devastante: <code>ps aux | grep firefox</code>.`,
  analogy: `grep è il metal detector in spiaggia: passa su tutta la sabbia (il file) e suona solo dove c'è la monetina (il testo cercato). Con -v suona dove NON c'è. 🏖️` },

{ type: 'quiz',
  q: 'Vuoi tutte le righe di config.txt che NON contengono "#". Comando?',
  opts: [
    'grep -n "#" config.txt',
    'grep -v "#" config.txt',
    'grep -i "#" config.txt',
    'grep -c "#" config.txt',
  ],
  a: 1,
  explain: `<code>-v</code> = in<strong>v</strong>erti la selezione: passa solo ciò che NON matcha. È il trucco classico per leggere i config senza commenti. <code>-n</code> numera, <code>-i</code> ignora il case, <code>-c</code> conta soltanto. 🚫` },

{ type: 'lesson', emoji: '🧩', title: 'Regex: i jolly potenziati',
  text: `Le <strong>espressioni regolari</strong> sono i superpoteri di grep:<br><br>
  ⬅️ <code>^root</code> — righe che INIZIANO con root<br>
  ➡️ <code>bash$</code> — righe che FINISCONO con bash<br>
  ❓ <code>.</code> — un carattere qualsiasi (uno solo)<br>
  ♾️ <code>*</code> — il carattere precedente ripetuto 0+ volte<br>
  🎰 <code>[abc]</code> — uno tra a, b, c · <code>[0-9]</code> — una cifra<br><br>
  Con <code>grep -E</code> (Extended) si sbloccano anche <code>+</code> (1+ volte), <code>?</code> (0 o 1), <code>|</code> (oppure).`,
  analogy: `La regex è la descrizione per l'identikit: "inizia per R, ha una cifra in mezzo, finisce per T". grep è il poliziotto che ferma solo chi corrisponde. 👮` },

{ type: 'quiz',
  q: 'Quale comando trova le righe che INIZIANO con "root" in /etc/passwd?',
  opts: [
    'grep "root^" /etc/passwd',
    'grep "^root" /etc/passwd',
    'grep "root$" /etc/passwd',
    'grep "*root" /etc/passwd',
  ],
  a: 1,
  explain: `<code>^</code> àncora all'INIZIO riga e va PRIMA del testo: <code>^root</code>. Al contrario <code>$</code> àncora alla fine (e va dopo: <code>root$</code>). <code>root^</code> non ha senso, e <code>*</code> da solo all'inizio non è una regex valida (ripete il "niente"). ⬅️` },

// ── find ─────────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🛰️', title: 'find: il segugio del filesystem',
  text: `<code>find dove condizioni</code> — esplora l'albero VERO, file per file, in tempo reale:<br><br>
  📛 <code>find /etc -name "*.conf"</code> — per nome (virgolette sui jolly!)<br>
  📁 <code>-type f</code> file · <code>-type d</code> directory<br>
  ⚖️ <code>-size +100M</code> — più grandi di 100 MB<br>
  🕐 <code>-mtime -7</code> — modificati negli ultimi 7 giorni<br>
  ⚡ <code>-exec comando {} \\;</code> — esegui un comando su ogni risultato: <code>find . -name "*.tmp" -exec rm {} \\;</code><br><br>
  grep cerca DENTRO i file, find cerca I file. Non confonderli!`,
  analogy: `find è il cane da tartufo: gira davvero per tutto il bosco annusando ogni albero secondo le istruzioni ("solo tartufi sopra i 100 grammi, freschi di settimana"). 🐕` },

{ type: 'quiz',
  q: 'Trovare tutti i file .log più grandi di 100 MB sotto /var. Comando?',
  opts: [
    'find /var -name "*.log" -size +100M',
    'find /var -name *.log -bigger 100M',
    'grep -r "*.log" /var -size 100M',
    'ls -R /var | grep 100M',
  ],
  a: 0,
  explain: `Sintassi find: percorso + condizioni. <code>-size +100M</code> = "più di 100 MB" (il + conta!). L'opzione <code>-bigger</code> non esiste, <code>grep</code> cerca DENTRO i file non I file, e <code>ls -R | grep</code> matcherebbe solo nomi contenenti "100M". 🛰️` },

// ── Processi ─────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '📋', title: 'ps e top: chi sta lavorando?',
  text: `🧾 <code>ps aux</code> — la foto di TUTTI i processi: <code>a</code> di tutti gli utenti, <code>u</code> formato dettagliato, <code>x</code> anche quelli senza terminale<br>
  📺 <code>top</code> — la diretta live, aggiornata ogni 3 secondi (<code>htop</code> è la versione bella, ma l'esame chiede top)<br><br>
  Colonne chiave: <strong>PID</strong> (il numero di matricola), <strong>%CPU</strong>, <strong>%MEM</strong>.<br>
  Il combo immortale: <code>ps aux | grep nome</code> per trovare il PID di qualcosa.`,
  analogy: `ps aux è la foto di gruppo del personale a fine turno, top è la telecamera di sorveglianza in diretta sulla cucina. Il PID è il numero sulla divisa. 📸` },

{ type: 'lesson', emoji: '🛑', title: 'kill: licenziare un processo',
  text: `<code>kill PID</code> non "uccide": <strong>manda un segnale</strong>. I tre da sapere:<br><br>
  🕊️ <strong>15 / SIGTERM</strong> (default) — "per favore chiudi": il processo salva e esce con dignità<br>
  🔨 <strong>9 / SIGKILL</strong> — esecuzione immediata, il processo non può rifiutare (né salvare!)<br>
  🔄 <strong>1 / SIGHUP</strong> — per i demoni: "rileggi la configurazione"<br><br>
  Per nome invece che per PID: <code>killall firefox</code>, <code>pkill firef</code> (match parziale), e <code>pgrep firefox</code> ti dà solo il PID.<br>
  Regola: prima <code>kill</code> gentile, <code>-9</code> solo se ignora.`,
  analogy: `SIGTERM è il licenziamento con preavviso: svuoti la scrivania e saluti. SIGKILL è la security che ti trascina fuori SUBITO: la scrivania resta nel caos (file temporanei, lock...). 🏢` },

{ type: 'input',
  q: 'Il processo 4242 è bloccato e ignora tutto. Scrivi il comando per terminarlo SENZA APPELLO:',
  accept: ['kill -9 4242', 'sudo kill -9 4242', 'kill -kill 4242', 'kill -sigkill 4242', 'kill -s sigkill 4242'],
  placeholder: 'scrivi il comando...',
  explain: `<code>kill -9 4242</code> manda SIGKILL: il kernel elimina il processo direttamente, senza nemmeno avvisarlo — non può essere ignorato né bloccato. Equivalenti: <code>kill -KILL</code> o <code>kill -SIGKILL</code>. Ricorda: il 9 è l'ultima spiaggia, prima prova il kill semplice (15). 🔨` },

{ type: 'lesson', emoji: '🎛️', title: 'Job control: pausa e background',
  text: `Per gestire i comandi nel TUO terminale:<br><br>
  🌙 <code>comando &amp;</code> — parte direttamente in background<br>
  ⏸️ <code>Ctrl+Z</code> — SOSPENDE il processo in corso (congelato, non morto)<br>
  📋 <code>jobs</code> — la lista dei tuoi job con i numeri [1], [2]...<br>
  ▶️ <code>bg</code> — il sospeso riparte in background · <code>fg</code> — lo riporti in primo piano<br>
  🛡️ <code>nohup comando &amp;</code> — sopravvive anche se chiudi il terminale<br><br>
  ⚠️ <code>Ctrl+C</code> invece TERMINA (manda SIGINT): non confonderlo con Ctrl+Z!`,
  analogy: `Ctrl+Z mette il cuoco in sala pausa (congelato), bg lo rimanda a lavorare nel retro, fg lo richiama al bancone. Ctrl+C lo licenzia in tronco. nohup gli dà le chiavi: lavora anche quando chiudi il locale. 🔑` },

{ type: 'quiz',
  q: 'Hai lanciato un comando lungo SENZA &. Come lo mandi in background senza ucciderlo?',
  opts: [
    'Ctrl+C e poi bg',
    'Ctrl+Z e poi bg',
    'Ctrl+D e poi fg',
    'kill -bg sul suo PID',
  ],
  a: 1,
  explain: `<code>Ctrl+Z</code> sospende (il processo resta vivo, congelato), poi <code>bg</code> lo fa ripartire in background. <code>Ctrl+C</code> lo TERMINA (game over), <code>Ctrl+D</code> chiude l'input (EOF), e <code>kill -bg</code> non esiste. ⏸️▶️` },

{ type: 'lesson', emoji: '🎚️', title: 'nice: la scala delle priorità (TRAPPOLA!)',
  text: `Ogni processo ha una priorità detta <strong>niceness</strong>, da <strong>-20</strong> a <strong>19</strong>:<br><br>
  ⚠️ CONTROINTUITIVO: numero <strong>BASSO = priorità ALTA</strong>. -20 è il VIP, 19 è l'ultimo della fila. Default: 0.<br><br>
  🚀 <code>nice -n 10 comando</code> — lancia con priorità abbassata (educato: cede la CPU)<br>
  🔧 <code>renice 5 -p PID</code> — cambia la priorità a un processo già in corsa<br>
  👑 Solo <strong>root</strong> può ALZARE la priorità (valori negativi); i comuni mortali possono solo abbassarla.`,
  analogy: `Più sei "nice" (gentile), più lasci passare gli altri: il santo a niceness 19 fa passare tutti, il maleducato a -20 taglia la fila. Per tagliare la fila però serve il permesso del boss (root). 🚶‍♂️🚶‍♀️` },

{ type: 'quiz',
  q: 'Quale processo ha la priorità PIÙ ALTA sulla CPU?',
  opts: [
    'niceness 19',
    'niceness 0',
    'niceness -20',
    'niceness 10',
  ],
  a: 2,
  explain: `Scala al contrario: <strong>-20 = massima priorità</strong>, 19 = minima, 0 = default. "Più nice" = più gentile = cede il passo. È la trappola d'esame più amata del Topic 103.6: stampatela. 🎚️` },

// ── vi ───────────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '📝', title: 'vi: l\'editor che c\'è SEMPRE',
  text: `Su un server minimale senza interfaccia grafica, <code>vi</code> c'è sempre. L'esame lo pretende (Topic 103.8). Ha <strong>modi</strong> diversi:<br><br>
  🧭 <strong>Normale</strong> (all'avvio): i tasti sono COMANDI — <code>dd</code> taglia la riga, <code>yy</code> la copia, <code>p</code> incolla, <code>/testo</code> cerca, <code>n</code> = trova successivo<br>
  ✏️ <strong>Inserimento</strong>: premi <code>i</code> e scrivi normalmente. <code>Esc</code> per uscirne<br>
  🎯 <strong>Comando</strong>: premi <code>:</code> — <code>:w</code> salva, <code>:q</code> esce, <code>:q!</code> esce SENZA salvare, <code>:wq</code> salva ed esce (= <code>:x</code> = <code>ZZ</code>)`,
  analogy: `vi è una macchina con due pedaliere: in modo normale i tasti guidano, in modo inserimento i tasti scrivono. Il 90% del panico da vi è non sapere in che modo sei: nel dubbio, pesta Esc. 🚗` },

{ type: 'input',
  q: 'Sei in vi, hai finito di scrivere e premuto Esc. Salva ed esci (scrivi il comando):',
  accept: [':wq', ':x', 'zz', ':wq!'],
  placeholder: ':...',
  explain: `<code>:wq</code> = <strong>w</strong>rite + <strong>q</strong>uit. Gemelli validi: <code>:x</code> (scrive solo se serve) e <code>ZZ</code> (dal modo normale, senza i due punti). Se invece vuoi scappare BUTTANDO le modifiche: <code>:q!</code>. Congratulazioni: ora sai uscire da vi. 🏆` },

// ── Ripasso ──────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🧩', title: 'RIPASSO LAMPO',
  text: `Modulo 3 in 6 righe:<br><br>
  🧭 <code>pwd</code>/<code>cd</code>/<code>ls -lah</code> · <code>cp -r</code> · <code>mv</code> rinomina · <code>rm</code> = inceneritore<br>
  🚰 0=stdin 1=stdout 2=stderr · <code>&gt;</code> sovrascrive, <code>&gt;&gt;</code> appende, <code>2&gt;</code> errori, <code>|</code> incatena, <code>tee</code> sdoppia<br>
  ✂️ <code>sort | uniq</code> (adiacenti!) · <code>cut -d -f</code> · <code>wc -l</code> · <code>tr</code><br>
  🔦 <code>grep -i -v -r -c</code> + regex <code>^inizio</code> <code>fine$</code> · <code>find -name -size -mtime -exec</code><br>
  👨‍🍳 <code>ps aux</code> · <code>kill</code> 15 gentile / 9 brutale · nice: BASSO = forte · Ctrl+Z → <code>bg</code><br>
  📝 vi: <code>i</code> scrivi, Esc, <code>:wq</code> salva ed esci<br><br>
  Due quiz finali e il modulo è tuo. 🔥`,
  analogy: null },

{ type: 'quiz',
  q: 'Cosa fa ESATTAMENTE "comando > out.log 2>&1"?',
  opts: [
    'Manda stdout su out.log e poi anche stderr nello stesso posto',
    'Manda stdout su out.log e stderr su un file chiamato 1',
    'Manda solo stderr su out.log',
    'Duplica out.log in un file chiamato 2',
  ],
  a: 0,
  explain: `<code>&gt; out.log</code> aggancia stdout al file, poi <code>2&gt;&amp;1</code> dice "il canale 2 segua il canale 1": tutto (output + errori) finisce in out.log. La forma corta moderna è <code>&amp;&gt; out.log</code>. L'ordine conta: <code>2&gt;&amp;1 &gt; out.log</code> NON fa la stessa cosa! 🌀` },

{ type: 'quiz',
  q: 'Quanti utenti hanno bash come shell? Quale pipeline lo conta?',
  opts: [
    'grep "bash$" /etc/passwd | wc -l',
    'grep "^bash" /etc/passwd | wc -c',
    'find /etc/passwd -name bash | wc -l',
    'cat /etc/passwd > grep bash > wc -l',
  ],
  a: 0,
  explain: `La shell è l'ULTIMO campo di /etc/passwd, quindi regex <code>bash$</code> (finisce per bash), poi <code>wc -l</code> conta le righe. <code>^bash</code> cercherebbe all'inizio riga, <code>wc -c</code> conta byte, find cerca FILE non testo, e <code>&gt;</code> non incatena comandi: quello è il lavoro della pipe. 🔗` },

];
