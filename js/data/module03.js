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

// ── Here document e here string (103.4) ──────────────────────────────────────
{ type: 'lesson', emoji: '📄', title: 'Here document e here string',
  text: `Per passare input multi-riga senza creare file temporanei:<br>
<br>
<strong>Here document</strong> (<code>&lt;&lt;DELIM</code>):<br>
<code>cat &lt;&lt;EOF</code><br>
<code>Ciao $USER</code><br>
<code>Oggi è $(date)</code><br>
<code>EOF</code><br>
Il testo tra la prima e l'ultima riga (EOF) viene passato come stdin. Le variabili vengono espanse.<br>
Con virgolette singole <code>&lt;&lt;'EOF'</code>: nessuna espansione (tutto letterale).<br>
<br>
<strong>Here string</strong> (<code>&lt;&lt;&lt;</code>):<br>
<code>grep "root" &lt;&lt;&lt; "root:x:0:0:/root:/bin/bash"</code><br>
Passa una singola stringa come stdin al comando.`,
  analogy: `Here document è come dettare un testo: lo detti direttamente invece di scriverlo su foglio e poi consegnarlo. EOF è il "punto fermo" che segna la fine. 📝` },

{ type: 'quiz',
  q: 'Cosa fa il costrutto "cat <<EOF ... EOF"?',
  opts: [
    'Legge il contenuto di un file chiamato EOF',
    'Passa il testo tra <<EOF e EOF come stdin a cat',
    'Redirige l\'output di cat verso un file chiamato EOF',
    'Crea una variabile d\'ambiente chiamata EOF',
  ],
  a: 1,
  explain: `<code>&lt;&lt;EOF</code> è un "here document": il testo fino alla riga terminatrice (EOF) viene passato come stdin al comando. Non crea file, non legge file. Usato per passare blocchi multi-riga a cat, ssh, mysql, sudo tee, ecc. Le variabili vengono espanse (a meno di usare &lt;&lt;'EOF' con singole). 📄` },

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

// ── sed (103.7) ──────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '✂️', title: 'sed: il bisturi del testo',
  text: `<code>sed</code> (Stream Editor) elabora e trasforma il testo riga per riga.<br>
Comando più usato: la <strong>sostituzione</strong>:<br>
<br>
<code>sed 's/vecchio/nuovo/' file</code> — sostituisce la <strong>prima</strong> occorrenza per riga<br>
<code>sed 's/vecchio/nuovo/<strong>g</strong>' file</code> — <strong>g</strong>lobal: TUTTE le occorrenze<br>
<code>sed <strong>-i</strong> 's/vecchio/nuovo/g' file</code> — <strong>in-place</strong>: modifica il file direttamente<br>
<code>sed -i.bak 's/vecchio/nuovo/g' file</code> — in-place + crea backup (file.bak)<br>
<br>
TRAPPOLA! Senza <code>-i</code>, sed NON modifica il file: stampa solo su stdout.`,
  analogy: `sed senza -i è il correttore che ti restituisce la copia corretta ma lascia l'originale intatto. Con -i firma direttamente sul foglio originale. ✍️` },

{ type: 'lesson', emoji: '✂️', title: 'sed: filtrare, cancellare, indirizzi',
  text: `Altre operazioni di sed:<br>
<br>
<code>sed -n '/root/p' /etc/passwd</code> — <code>-n</code> sopprime l'output, <code>p</code> stampa solo le righe che matchano (= grep)<br>
<code>sed '2,5d' file</code> — cancella le righe da 2 a 5 (<code>d</code> = delete)<br>
<code>sed '/^#/d' file</code> — cancella le righe che iniziano con #<br>
<code>sed -e 's/foo/bar/' -e 's/baz/qux/' file</code> — più espressioni (<code>-e</code>)<br>
<br>
Struttura generale: <code>sed '[indirizzo][comando]'</code><br>
L'indirizzo è opzionale: numero riga, range (2,5), o regex (/pattern/).`,
  analogy: `sed con indirizzi è il chirurgo che opera solo su certe pagine: "righe 2-5: cancella" oppure "solo dove c'è '#': togli". Senza indirizzo opera su tutto. ✂️` },

{ type: 'quiz',
  q: 'Vuoi sostituire TUTTE le occorrenze di "http" con "https" in config.txt. Comando?',
  opts: [
    'sed "s/http/https/" config.txt',
    'sed "s/http/https/g" config.txt',
    'sed -i "s/http/https/" config.txt',
    'sed "g/http/https/" config.txt',
  ],
  a: 1,
  explain: `<code>s/vecchio/nuovo/<strong>g</strong></code>: la <code>g</code> finale = <strong>g</strong>lobal, sostituisce ogni occorrenza in ogni riga (senza g, solo la prima per riga). <code>-i</code> modifica il file sul disco (invece di stampare), ma anche con -i senza g prenderebbe solo la prima per riga. La forma "g/x/y/" non è corretta per sed. ✂️` },

{ type: 'quiz',
  q: 'Quale opzione di sed modifica il FILE DIRETTAMENTE invece di stampare su stdout?',
  opts: ['-g', '-i', '-n', '-e'],
  a: 1,
  explain: `<code>sed -i</code> = <strong>i</strong>n-place: il file viene riscritto con le modifiche. Senza -i, sed stampa il risultato ma non tocca il file originale. <code>-n</code> sopprime l'output automatico. <code>-e</code> aggiunge un'espressione. <code>-g</code> non esiste come opzione principale di sed. ✂️` },

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

// ── Tmux & GNU Screen (103.5) ────────────────────────────────────────────────
{ type: 'lesson', emoji: '🖥️', title: 'Terminal multiplexer: sessioni immortali',
  text: `<strong>GNU Screen</strong> e <strong>tmux</strong> permettono di:<br>
• Aprire più finestre in un unico terminale<br>
• <strong>Distaccarsi dalla sessione</strong> e ritrovarla esatta al ritorno (anche dopo disconnessione SSH)<br>
• I processi continuano a girare in background anche se chiudi il laptop<br>
<br>
Scenario tipico: lanci una compilazione via SSH → chiudi il laptop → torni il giorno dopo → riagganciala → il processo è ancora lì.`,
  analogy: `screen e tmux sono il "pausa" del videogioco: salvi lo stato esatto e riprendi da dove eri rimasto, anche se hai spento la console (chiuso il terminale). 🎮` },

{ type: 'lesson', emoji: '📺', title: 'GNU Screen: comandi essenziali',
  text: `<strong>Da riga di comando:</strong><br>
<code>screen -S lavoro</code> — crea sessione di nome "lavoro"<br>
<code>screen -ls</code> — lista le sessioni esistenti<br>
<code>screen -r lavoro</code> — riagganciati a "lavoro" (reattach)<br>
<code>screen -d lavoro</code> — detacha una sessione remota<br>
<code>screen -dr lavoro</code> — detacha e poi riagganciati<br>
<br>
<strong>Inside screen — prefisso <code>Ctrl+a</code>:</strong><br>
<code>Ctrl+a d</code> — <strong>d</strong>etach (lascia la sessione in background)<br>
<code>Ctrl+a c</code> — <strong>c</strong>rea una nuova finestra<br>
<code>Ctrl+a n</code> / <code>Ctrl+a p</code> — <strong>n</strong>ext / <strong>p</strong>rev finestra<br>
<code>Ctrl+a "</code> — lista le finestre della sessione`,
  analogy: `Ctrl+a è il prefisso segreto di screen: come un maggiordomo che aspetta il segnale prima di eseguire. Dopo Ctrl+a, premi la lettera del comando. ✋` },

{ type: 'lesson', emoji: '🔲', title: 'tmux: la versione moderna',
  text: `<strong>Da riga di comando:</strong><br>
<code>tmux new -s lavoro</code> — crea sessione di nome "lavoro"<br>
<code>tmux ls</code> — lista le sessioni<br>
<code>tmux attach -t lavoro</code> (o <code>tmux a -t lavoro</code>) — riagganciati<br>
<code>tmux kill-session -t lavoro</code> — elimina una sessione<br>
<br>
<strong>Inside tmux — prefisso <code>Ctrl+b</code>:</strong><br>
<code>Ctrl+b d</code> — <strong>d</strong>etach<br>
<code>Ctrl+b c</code> — nuova finestra<br>
<code>Ctrl+b %</code> — split verticale · <code>Ctrl+b "</code> — split orizzontale<br>
<code>Ctrl+b n</code> / <code>Ctrl+b p</code> — finestra successiva/precedente<br>
<code>Ctrl+b s</code> — lista sessioni interattiva<br>
<br>
TRAPPOLA! screen usa <code>Ctrl+a</code>, tmux usa <code>Ctrl+b</code>. Non confonderli all'esame!`,
  analogy: `tmux è il successore moderno di screen: stesse idee, interfaccia più potente. Ctrl+b è il suo prefisso — dopo di esso ogni lettera è un comando. 🎛️` },

{ type: 'quiz',
  q: 'Dentro GNU Screen, come ti distacchi dalla sessione SENZA terminarla?',
  opts: ['Ctrl+a d', 'Ctrl+b d', 'Ctrl+c', 'exit'],
  a: 0,
  explain: `<code>Ctrl+a d</code> = detach in screen: la sessione rimane viva in background. <code>Ctrl+b d</code> è il detach di tmux (prefisso diverso!). <code>Ctrl+c</code> manda SIGINT al processo corrente. <code>exit</code> chiude la shell e TERMINA la sessione. 📺` },

{ type: 'quiz',
  q: 'Hai una sessione screen chiamata "build" in esecuzione. Come ti ri-agganci?',
  opts: ['screen -r build', 'screen -a build', 'tmux attach build', 'screen -S build'],
  a: 0,
  explain: `<code>screen -r build</code> = <strong>r</strong>eattach alla sessione "build". <code>-a</code> non esiste con quel significato in screen. <code>tmux attach</code> è per tmux, non screen. <code>-S build</code> CREA una nuova sessione con quel nome. 📺` },

{ type: 'quiz',
  q: 'Vuoi creare una sessione tmux di nome "deploy". Comando?',
  opts: ['tmux new -s deploy', 'tmux -S deploy', 'screen -S deploy', 'tmux create deploy'],
  a: 0,
  explain: `<code>tmux new -s deploy</code> crea e apre una nuova sessione tmux di nome "deploy". <code>screen -S deploy</code> è screen, non tmux! <code>tmux -S</code> specifica un socket, non crea sessioni. "tmux create" non esiste. 🔲` },

{ type: 'quiz',
  q: 'Qual è il prefisso di tastiera per i comandi di tmux?',
  opts: ['Ctrl+a', 'Ctrl+b', 'Ctrl+t', 'Alt+b'],
  a: 1,
  explain: `tmux usa <code>Ctrl+b</code> come prefisso (screen usa Ctrl+a — TRAPPOLA d'esame!). Dopo Ctrl+b, premi la lettera del comando: d=detach, c=nuova finestra, %=split verticale, "=split orizzontale, s=lista sessioni. 🔲` },

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
  📄 Here doc: <code>&lt;&lt;EOF...EOF</code> stdin multi-riga · Here string: <code>&lt;&lt;&lt; "stringa"</code><br>
  ✂️ <code>sed 's/x/y/g'</code> · <code>-i</code> in-place · <code>-n '/p/p'</code> filtra · <code>'/^#/d'</code> cancella<br>
  🔪 <code>awk -F: '{print $1,$7}'</code> · <code>NR</code>=riga <code>NF</code>=campi · <code>END {print sum}</code> · <code>/pattern/</code> filtra<br>
  🖥️ screen: <code>-S nome -ls -r</code> · Ctrl+a = prefisso · tmux: <code>new -s -ls attach -t</code> · Ctrl+b = prefisso<br>
  📝 vi: <code>i</code> scrivi, Esc, <code>:wq</code> salva ed esci<br>
  📖 <code>man cmd</code> · <code>apropos parola</code> cerca nelle man · <code>type cmd</code> = builtin/binary/alias · <code>which cmd</code> = percorso<br>
  ⏱️ <code>history</code> · <code>!NUM</code> riesegui · <code>!!</code> ultimo · quote: <code>'</code>=letterale <code>"</code>=espande <code>\</code>=escape<br>
  🏷️ <code>uname -r</code> kernel release · <code>uname -a</code> tutto · <code>uname -m</code> arch · <code>uname -n</code> hostname<br>
  🌍 <code>export VAR=val</code> · <code>printenv</code>/<code>env</code> mostra ambiente · <code>unset VAR</code> · senza export = variabile locale<br>
  📎 <code>paste -d, f1 f2</code> affianca righe · <code>join -1 N -2 N f1 f2</code> su campo chiave (ordinare prima!)<br>
  🔬 <code>od -c file</code> mostra \n \t \r leggibili · <code>od -x</code> hex · <code>od -t x1</code> hex a byte<br>
  🔢 <code>nl file</code> numera righe non vuote · <code>nl -ba</code> tutte · <code>cat -n</code> = nl -ba<br>
  🃏 Wildcards: <code>*</code> tutto · <code>?</code> un char · <code>[abc]</code> uno dei tre · <code>[!abc]</code> NOT · <code>{a,b}</code> brace expansion<br>
  ♻️ <code>$(comando)</code> sostituzione comandi (preferita a backtick) · cattura solo stdout<br><br>
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

// ── 103.1 extra: man/apropos/type/which/history/quoting ──────────────────────
{ type: 'lesson', emoji: '📖', title: 'man, apropos, type, which: trovare aiuto',
  text: `<strong>Documentazione sui comandi:</strong><br>
<code>man ls</code> — apre la pagina di manuale (q = esci, / = cerca)<br>
<code>man -k parola</code> — cerca tra tutte le man page per parola chiave<br>
<code>apropos parola</code> — identico a man -k (cerca per descrizione)<br>
<br>
<strong>Dove vive un comando?</strong><br>
<code>which ls</code> — stampa il percorso assoluto: <code>/usr/bin/ls</code><br>
<code>type ls</code> — dice il TIPO: binary, alias, builtin, function, hashed<br>
Es: <code>type kill</code> → <em>kill is a shell builtin</em><br>
Es: <code>type cp</code> → <em>cp is /usr/bin/cp</em><br>
<br>
TRAPPOLA! <code>which kill</code> restituisce vuoto (è builtin, non un file) — solo <code>type</code> lo sa.`,
  analogy: `man è la libreria, apropos è il motore di ricerca. which ti dice in quale scaffale sta il libro, type ti dice se il libro è fisico (binary) o se esiste solo in testa alla bibliotecaria (builtin). 📖` },

{ type: 'lesson', emoji: '⏱️', title: 'history: i comandi che hai già fatto',
  text: `<code>history</code> — elenca i comandi eseguiti con numero progressivo<br>
<code>history 20</code> — solo gli ultimi 20<br>
<code>!315</code> — riesegue il comando numero 315<br>
<code>!!</code> — riesegue l'ULTIMO comando (utile: <code>sudo !!</code>)<br>
<code>!ls</code> — riesegue l'ultimo comando che inizia con "ls"<br>
<code>history | grep ssh</code> — trova tutti i comandi SSH usati<br>
Salvato in: <code>~/.bash_history</code> (scritto all'uscita della sessione)<br>
<br>
<strong>Virgolettato (quoting):</strong><br>
<code>'single'</code> — tutto letterale, nessuna espansione (<code>$VAR</code> NON espansa)<br>
<code>"double"</code> — espande <code>$VAR</code>, backtick, <code>\</code><br>
<code>\</code> — escape di un singolo carattere (<code>my\ file</code> = file con spazio)`,
  analogy: `history è il tuo quaderno degli appunti automatico. !! è la gomma da cancellare che riscrive l'ultima cosa. Single quote è una bolla trasparente: niente può entrare ad espandersi dentro. ⏱️` },

{ type: 'quiz',
  q: 'Vuoi sapere se "kill" è un comando esterno o una funzione builtin della shell. Quale comando usi?',
  opts: [
    'type kill',
    'which kill',
    'man kill',
    'apropos kill'
  ],
  a: 0,
  explain: `<code>type kill</code> risponde "kill is a shell builtin" — ti dice il tipo del comando. <code>which kill</code> cerca solo i file eseguibili nel PATH e stampa niente per i builtin. <code>man</code> e <code>apropos</code> danno documentazione, non il tipo. 📖` },

{ type: 'quiz',
  q: 'Cosa stampa: echo \'Il prezzo è $PREZZO\' (con virgolette SINGOLE)?',
  opts: [
    'Il prezzo è $PREZZO  (letterale, $ non espanso)',
    'Il prezzo è 0  (PREZZO non definita → 0)',
    'Il prezzo è   (PREZZO non definita → stringa vuota)',
    'Errore di sintassi'
  ],
  a: 0,
  explain: `Le <strong>virgolette singole</strong> rendono tutto letterale: <code>$PREZZO</code> NON viene espanso. Stampa esattamente <code>Il prezzo è $PREZZO</code>. Con le doppie virgolette <code>"$PREZZO"</code> verrebbe espanso (stamperebbe il valore o stringa vuota se non definita). ⏱️` },

// ── 103.3 extra: tar + compressione ──────────────────────────────────────────
{ type: 'lesson', emoji: '📦', title: 'tar: impacchetta e comprimi',
  text: `<code>tar</code> è il coltellino svizzero degli archivi Linux. La logica: <strong>operazione + opzioni + file</strong>.<br>
<br>
<strong>Creare un archivio:</strong><br>
<code>tar -cvf archivio.tar dir/</code> — <strong>c</strong>reate + <strong>v</strong>erbose + <strong>f</strong>ile<br>
<code>tar -czf archivio.tar.gz dir/</code> — + comprimi con <strong>gzip</strong> (.gz)<br>
<code>tar -cjf archivio.tar.bz2 dir/</code> — + comprimi con <strong>bzip2</strong> (.bz2)<br>
<code>tar -cJf archivio.tar.xz dir/</code> — + comprimi con <strong>xz</strong> (.xz, J maiuscola)<br>
<br>
<strong>Estrarre:</strong><br>
<code>tar -xvf archivio.tar</code> — e<strong>x</strong>tract<br>
<code>tar -xzf archivio.tar.gz</code> — estrai + decomprimi gzip<br>
<code>tar -xjf archivio.tar.bz2</code> — estrai + decomprimi bzip2<br>
<br>
<strong>Elencare contenuto (senza estrarre):</strong><br>
<code>tar -tvf archivio.tar</code> — lis<strong>t</strong>`,
  analogy: `tar è il traslocatore: impacchetta tutto in scatole. Le lettere dopo il trattino sono come le istruzioni del trasloco: -c = metti in scatola, -x = togli dalla scatola, -t = guarda cosa c'è, -z/-j/-J = usa il cassetto sotto-vuoto. 📦` },

{ type: 'lesson', emoji: '🗜️', title: 'Compressione: gzip, bzip2, xz e come leggerli',
  text: `Tre standard di compressione per file singoli:<br>
<br>
<code>gzip file</code> → <code>file.gz</code> · <code>gunzip file.gz</code> → <code>file</code><br>
<code>bzip2 file</code> → <code>file.bz2</code> · <code>bunzip2 file.bz2</code><br>
<code>xz file</code> → <code>file.xz</code> · <code>unxz file.xz</code><br>
<br>
<strong>Leggere file compressi SENZA decomprimere:</strong><br>
<code>zcat file.gz</code> — come cat ma per .gz<br>
<code>bzcat file.bz2</code> — come cat ma per .bz2<br>
<code>xzcat file.xz</code> — come cat ma per .xz<br>
<br>
<strong>Checksum (integrità file):</strong><br>
<code>md5sum file</code> — 128-bit (veloce, meno sicuro)<br>
<code>sha256sum file</code> — 256-bit (standard moderno)<br>
<code>sha512sum file</code> — 512-bit (più sicuro)<br>
<code>md5sum -c file.md5</code> — verifica i checksum di un file .md5`,
  analogy: `gzip è il sacco dell'aspirapolvere: schiaccia il volume ma devi aprirlo per leggere. zcat è una finestrina sul sacco: guardi dentro senza aprire. Il checksum è il sigillo di garanzia sul pacco: se è rotto, qualcuno ha manomesso i dati. 🗜️` },

{ type: 'quiz',
  q: 'Vuoi creare un archivio tar compresso con gzip della directory /etc. Quale comando?',
  opts: [
    'tar -czf backup.tar.gz /etc',
    'tar -cjf backup.tar.gz /etc',
    'tar -xzf backup.tar.gz /etc',
    'gzip -c /etc > backup.tar.gz'
  ],
  a: 0,
  explain: `<code>-c</code> = create, <code>-z</code> = gzip, <code>-f</code> = nome file. Insieme: <code>tar -czf</code>. L'estensione <code>.tar.gz</code> (o <code>.tgz</code>) è la convenzione. <code>-j</code> sarebbe bzip2 (produce .tar.bz2). <code>-x</code> è extract (decomprime, non crea). 📦` },

{ type: 'quiz',
  q: 'Quale comando verifica l\'integrità di un file scaricato confrontandolo con il suo SHA256?',
  opts: [
    'sha256sum -c checksums.sha256',
    'md5sum -v file.iso',
    'sha256sum --verify file.iso',
    'checksum file.iso'
  ],
  a: 0,
  explain: `<code>sha256sum -c checksums.sha256</code> legge il file di checksum (formato: "hash  nomefile") e verifica ogni file elencato. Risposta <code>OK</code> = file integro. <code>md5sum -v</code> non esiste. <code>sha256sum --verify</code> non è la sintassi corretta. 🗜️` },

// ── awk (103.2) ───────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🔪', title: 'awk: elaborazione testo a colonne',
  text: `<strong>awk</strong> elabora il testo riga per riga, dividendola in campi separati da spazio (o delimitatore personalizzato).<br>
<br>
<strong>Sintassi base:</strong> <code>awk 'condizione { azione }' file</code><br>
<br>
<strong>Variabili automatiche:</strong><br>
• <code>$0</code> — riga intera · <code>$1</code>, <code>$2</code>... — primo, secondo campo...<br>
• <code>NF</code> — numero di campi · <code>NR</code> — numero di riga corrente<br>
• <code>FS</code> — separatore campo (default: spazio)<br>
<br>
<strong>Esempi chiave:</strong><br>
<code>awk '{print $1}' file</code> — stampa prima colonna<br>
<code>awk -F: '{print $1, $7}' /etc/passwd</code> — separatore : → login e shell<br>
<code>awk '/root/ {print $0}' /etc/passwd</code> — filtra righe che contengono "root"<br>
<code>awk '{sum += $3} END {print sum}' file</code> — somma la terza colonna<br>
<code>awk 'NR==1 {print}'</code> — solo prima riga<br>
<code>awk 'NR%2==0 {print}'</code> — solo righe pari<br>
<code>awk '{print NR, $0}' file</code> — aggiunge numeri di riga<br>
<br>
TRAPPOLA! <code>awk 'END {print NR}'</code> conta le righe come <code>wc -l</code>. La differenza con sed: sed elabora il testo come pattern, awk lo elabora come tabella strutturata.`,
  analogy: `awk è come Excel in riga di comando: ogni riga è un record, ogni campo è una cella. Con poche espressioni puoi filtrare, calcolare e trasformare tabelle di testo senza aprire nessun programma grafico.` },

{ type: 'terminal', emoji: '🔪', title: 'awk in azione',
  cmd: 'awk -F: \'{print $1, $3}\' /etc/passwd | head -5',
  out: `root 0
daemon 1
bin 2
sys 3
sync 4`,
  explain: `<code>-F:</code> imposta il separatore a <code>:</code>. <code>$1</code> = nome utente, <code>$3</code> = UID. Per sommare tutti gli UID: <code>awk -F: '{sum+=$3} END {print "Totale:", sum}' /etc/passwd</code>` },

{ type: 'quiz',
  q: 'Quale comando awk estrae username e shell predefinita da /etc/passwd (separatore ":")? ',
  opts: [
    "awk -F: '{print $1, $7}' /etc/passwd",
    "awk '{print $1, $7}' /etc/passwd",
    "awk -d: '{print $1, $7}' /etc/passwd",
    "awk -F: '{print $0}' /etc/passwd"
  ],
  a: 0,
  explain: `<code>-F:</code> imposta il separatore a <code>:</code>. In /etc/passwd: $1=username, $2=password(x), $3=UID, $4=GID, $5=GECOS, $6=home, $7=shell. Senza <code>-F:</code> awk tratterebbe ogni riga come un unico campo. <code>-d</code> non è un'opzione valida di awk. 🔪` },

// ── uname (103.1) ─────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🏷️', title: 'uname: chi sei, kernel?',
  text: `<code>uname</code> — stampa informazioni sul sistema e sul kernel.<br><br>
<code>uname -a</code> — <strong>tutto</strong>: kernel, hostname, release, versione, arch<br>
<code>uname -r</code> — solo la <strong>release</strong> del kernel: es. <code>6.12.9-2-cachyos</code><br>
<code>uname -s</code> — nome OS: <code>Linux</code><br>
<code>uname -n</code> — nodename (hostname): <code>mymachine</code><br>
<code>uname -m</code> — architettura macchina: <code>x86_64</code><br>
<code>uname -p</code> — tipo processore<br>
<code>uname -o</code> — sistema operativo: <code>GNU/Linux</code><br><br>
Alternativa moderna: <code>hostnamectl</code> (systemd) — mostra kernel, hostname e arch in un colpo.<br><br>
TRAPPOLA! <code>uname -r</code> = versione del kernel in esecuzione. <code>uname -v</code> = versione di build (data/ora di compilazione) — non confonderle.`,
  analogy: `uname è il cartellino d'identità del kernel: nome, cognome, data di nascita (versione), nazionalità (architettura). -a è il passaporto completo, -r è solo il codice fiscale. 🏷️` },

{ type: 'quiz',
  q: 'Quale comando stampa SOLO la versione (release) del kernel in esecuzione?',
  opts: [
    'uname -r',
    'uname -v',
    'uname -a',
    'kernel --version'
  ],
  a: 0,
  explain: `<code>uname -r</code> stampa solo la release del kernel (es. <code>6.12.9-2-cachyos</code>). <code>uname -v</code> stampa la versione di build (data e ora di compilazione). <code>uname -a</code> stampa tutto. <code>kernel --version</code> non esiste. 🏷️` },

// ── Variabili d'ambiente (103.1 L2) ──────────────────────────────────────────
{ type: 'lesson', emoji: '🌍', title: 'Variabili d\'ambiente: export, env, unset',
  text: `Le <strong>variabili d'ambiente</strong> sono coppie chiave=valore visibili ai processi figli.<br><br>
<code>export VAR=valore</code> — crea e <strong>esporta</strong> la variabile (visibile ai figli)<br>
<code>VAR=valore</code> — crea variabile <strong>locale</strong> alla shell (NON visibile ai figli)<br>
<code>printenv</code> — mostra tutte le variabili esportate<br>
<code>printenv PATH</code> — mostra il valore di PATH<br>
<code>env</code> — identico a printenv (mostra l'ambiente)<br>
<code>env VAR=val comando</code> — esegue comando con variabile temporanea<br>
<code>set</code> — mostra variabili locali + esportate + funzioni shell<br>
<code>unset VAR</code> — rimuove la variabile<br><br>
Variabili importanti:<br>
<code>PATH</code> — directory degli eseguibili · <code>HOME</code> — home utente<br>
<code>USER</code>/<code>LOGNAME</code> — username · <code>SHELL</code> — shell corrente<br>
<code>LANG</code>/<code>LC_ALL</code> — localizzazione<br><br>
TRAPPOLA! <code>VAR=valore comando</code> passa la variabile SOLO a quel comando senza modificare l'ambiente corrente.`,
  analogy: `L'ambiente è il tabellone dei messaggi in ufficio: export appende un foglio, unset lo stacca, printenv fotografa il tabellone. I processi figli nascono con una copia del tabellone. 🌍` },

{ type: 'quiz',
  q: 'Hai eseguito "NOME=Mario". Un processo figlio può vedere NOME?',
  opts: [
    'No: senza export la variabile è locale alla shell corrente',
    'Sì: tutte le variabili shell sono automaticamente nell\'ambiente',
    'Dipende dalla shell (bash vs sh)',
    'Sì, ma solo per la sessione corrente'
  ],
  a: 0,
  explain: `<code>NOME=Mario</code> crea una variabile <strong>locale</strong>: i processi figli NON la vedono. Con <code>export NOME=Mario</code> viene aggiunta all'ambiente e i figli ne ricevono una copia. Verifica con <code>printenv NOME</code> dopo la sola assegnazione: nessun output = non esportata. 🌍` },

// ── paste / join (103.2) ──────────────────────────────────────────────────────
{ type: 'lesson', emoji: '📎', title: 'paste e join: unire file a colonne',
  text: `<strong>paste</strong> — affianca file riga per riga (unione orizzontale):<br>
<code>paste file1 file2</code> — unisce colonne con TAB come separatore<br>
<code>paste -d, file1 file2</code> — usa <code>,</code> come separatore<br>
<code>paste -s file</code> — trasforma righe in una riga sola (traspone)<br><br>
Esempio:<br>
file1: <code>Alice</code>/<code>Bob</code> | file2: <code>30</code>/<code>25</code><br>
→ <code>paste file1 file2</code>: <code>Alice&nbsp;&nbsp;30</code> / <code>Bob&nbsp;&nbsp;25</code><br><br>
<strong>join</strong> — unisce file su un campo comune (come JOIN SQL):<br>
<code>join file1 file2</code> — unisce sulla prima colonna (deve essere <strong>ordinata!</strong>)<br>
<code>join -1 2 -2 1 file1 file2</code> — campo 2 di file1 = campo 1 di file2<br>
<code>join -t: file1 file2</code> — delimitatore <code>:</code><br><br>
TRAPPOLA! <code>join</code> funziona solo se i file sono <strong>ordinati sul campo chiave</strong>. Usa <code>sort</code> prima!`,
  analogy: `paste è come mettere due fogli fianco a fianco — le righe si affiancano. join è come VLOOKUP in Excel: mette insieme righe che hanno la stessa chiave. 📎` },

{ type: 'quiz',
  q: 'Vuoi affiancare le righe di nomi.txt e telefoni.txt separate da virgola. Quale comando?',
  opts: [
    'paste -d, nomi.txt telefoni.txt',
    'join -d, nomi.txt telefoni.txt',
    'cat -d, nomi.txt telefoni.txt',
    'cut -d, nomi.txt telefoni.txt'
  ],
  a: 0,
  explain: `<code>paste -d,</code> affianca le righe dei due file usando <code>,</code> come delimitatore. <code>join</code> fa una join su campo comune (non un semplice affiancamento). <code>cat</code> concatena verticalmente. <code>cut</code> rimuove colonne, non le aggiunge. 📎` },

// ── od (103.2) ────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🔬', title: 'od: dump ottale/esadecimale',
  text: `<strong>od</strong> (Octal Dump) — mostra il contenuto di un file in formato numerico.<br><br>
<code>od file</code> — dump in ottale (default)<br>
<code>od -c file</code> — caratteri leggibili: mostra <code>\\n</code>, <code>\\t</code>, <code>\\r</code>, <code>\\0</code><br>
<code>od -x file</code> — esadecimale a 2 byte<br>
<code>od -t x1 file</code> — hex a 1 byte (più chiaro)<br>
<code>od -An -t x1 file</code> — hex senza indirizzi<br><br>
Utile per:<br>
• Trovare <strong>caratteri nascosti</strong> (es. <code>\\r</code> Windows vs <code>\\n</code> Unix)<br>
• Ispezionare <strong>file binari</strong> o corrotti<br>
• Verificare <strong>byte null</strong> (<code>\\0</code>) o BOM UTF-8<br><br>
Alternativa: <code>xxd file</code> — formato hex/ASCII più leggibile (quando disponibile).`,
  analogy: `od è il microscopio del filesystem: mentre cat mostra il testo, od mostra i byte grezzi. Trovi quel \\r nascosto che fa impazzire gli script shell. 🔬` },

{ type: 'quiz',
  q: 'Con quale opzione di od si vedono i caratteri come \\n, \\t, \\r in forma leggibile?',
  opts: [
    'od -c',
    'od -x',
    'od -o',
    'od -b'
  ],
  a: 0,
  explain: `<code>od -c</code> mostra i byte come caratteri: le sequenze di escape (<code>\\n</code>, <code>\\t</code>, <code>\\r</code>, <code>\\0</code>) appaiono esplicitamente. <code>od -x</code> è hex a 2 byte, <code>od -o</code> è ottale (default), <code>od -b</code> è ottale a byte singolo. 🔬` },

// ── nl (103.2) ────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🔢', title: 'nl: numerare le righe',
  text: `<strong>nl</strong> (Number Lines) — numera le righe di un file.<br><br>
<code>nl file</code> — numera le righe <strong>non vuote</strong> (default)<br>
<code>nl -ba file</code> — numera <strong>tutte</strong> le righe (<strong>b</strong>ody <strong>a</strong>ll), incluse le vuote<br>
<code>nl -v 10 file</code> — inizia a numerare da 10<br>
<code>nl -s ': ' file</code> — separatore dopo il numero: <code>1: riga</code><br><br>
Alternativa rapida: <code>cat -n file</code> — numera tutte le righe (equivalente a <code>nl -ba</code>)<br><br>
<strong>Differenza:</strong><br>
• <code>nl</code> salta le righe vuote per default<br>
• <code>cat -n</code> numera <em>tutte</em> le righe, incluse le vuote<br><br>
TRAPPOLA! <code>nl</code> di default numera solo il "body" non vuoto. Per numerare tutto come <code>cat -n</code>, usa <code>nl -ba</code>.`,
  analogy: `nl è il segretario che mette il numero di paragrafo solo sui blocchi scritti. cat -n invece numera ogni riga del documento, anche quelle bianche. 🔢` },

{ type: 'quiz',
  q: 'Differenza tra "nl file" e "cat -n file"?',
  opts: [
    'nl salta le righe vuote per default; cat -n le numera tutte',
    'cat -n numera solo le prime 100 righe; nl non ha limiti',
    'Sono identici: nl è un alias di cat -n',
    'nl usa numerazione ottale; cat -n usa decimale'
  ],
  a: 0,
  explain: `<code>nl</code> di default numera solo le righe non vuote. <code>cat -n</code> numera tutte le righe incluse le vuote. Per far comportare nl come cat -n usa <code>nl -ba</code> (body all). 🔢` },

// ── Wildcards/glob (103.3) ────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🃏', title: 'Wildcards e globbing: i jolly della shell',
  text: `Il <strong>globbing</strong> è l'espansione dei jolly da parte della shell — avviene <em>prima</em> che il comando venga eseguito.<br><br>
<strong>Wildcards principali:</strong><br>
<code>*</code> — qualsiasi stringa (anche vuota): <code>*.log</code>, <code>file*</code><br>
<code>?</code> — esattamente <strong>un</strong> carattere qualsiasi: <code>file?.txt</code><br>
<code>[abc]</code> — uno dei caratteri tra parentesi: <code>[aeiou]*</code><br>
<code>[a-z]</code> — un carattere nell'intervallo: <code>[0-9]*</code><br>
<code>[!abc]</code> o <code>[^abc]</code> — NOT: qualsiasi carattere eccetto a,b,c<br><br>
<strong>Brace expansion</strong> (non globbing vero, ma simile):<br>
<code>{a,b,c}</code> — espande in tutte le combinazioni: <code>file{1,2,3}.txt</code><br>
<code>{1..5}</code> — sequenza: <code>file{1..5}</code> → file1 file2 file3 file4 file5<br><br>
TRAPPOLA! <code>*</code> non espande i file nascosti (iniziano con <code>.</code>). Usa <code>.*</code> per includerli.`,
  analogy: `I wildcard sono le carte jolly a scala 40: * vale tutto, ? vale un solo valore, [abc] vale uno dei tre semi. La shell distribuisce le carte prima che il gioco inizi. 🃏` },

{ type: 'quiz',
  q: 'Quale pattern glob seleziona TUTTI i file .log e .txt nella directory corrente?',
  opts: [
    '*.{log,txt}',
    '*.log|*.txt',
    '*.[log|txt]',
    '*(log|txt)'
  ],
  a: 0,
  explain: `<code>*.{log,txt}</code> usa la brace expansion: la shell espande in <code>*.log *.txt</code>. <code>*.log|*.txt</code> è sintassi pipe, non glob. <code>*.[log|txt]</code> matcherebbe file che finiscono con uno dei caratteri l,o,g,|,t,x — non il risultato voluto. 🃏` },

// ── Command substitution (103.4) ──────────────────────────────────────────────
{ type: 'lesson', emoji: '♻️', title: 'Sostituzione di comandi: $() e backtick',
  text: `La <strong>sostituzione di comandi</strong> esegue un comando e inserisce il suo output nel punto in cui è scritto.<br><br>
Sintassi moderna: <code>$(comando)</code> — <strong>raccomandata</strong><br>
Sintassi classica: <code>\`comando\`</code> — backtick (funziona, ma più difficile da annidare)<br><br>
<strong>Esempi:</strong><br>
<code>echo "Oggi è $(date)"</code> — inserisce la data nell'echo<br>
<code>ls -l $(which python3)</code> — trova python3 e passa il percorso a ls<br>
<code>FILE=$(ls -t | head -1)</code> — salva il file più recente in una variabile<br>
<code>mkdir $(date +%Y-%m-%d)</code> — directory con la data odierna<br><br>
<strong>Annidamento:</strong><br>
<code>$(comando $(altro))</code> — con <code>$()</code> si annida facilmente<br>
Con backtick serve il backslash: <code>\`comando \\\`altro\\\`\`</code> — più difficile<br><br>
TRAPPOLA! La sostituzione cattura solo <strong>stdout</strong>. Gli errori vanno su stderr e non vengono catturati a meno che non aggiungi <code>2>&amp;1</code>.`,
  analogy: `$() è la parentesi graffa del falegname: metti dentro un comando e ottieni il suo risultato al volo. Il backtick è il vecchio chiodo — funziona ma si storce quando si annida. ♻️` },

{ type: 'quiz',
  q: 'Vuoi creare una directory con il nome della data odierna. Quale sintassi è preferita?',
  opts: [
    'mkdir $(date +%Y-%m-%d)',
    'mkdir `date +%Y-%m-%d`',
    'mkdir {date +%Y-%m-%d}',
    'mkdir $(date) è sbagliato: date non si può sostituire'
  ],
  a: 0,
  explain: `<code>$(date +%Y-%m-%d)</code> è la forma moderna raccomandata per la sostituzione di comandi. Anche il backtick <code>\`date +%Y-%m-%d\`</code> funzionerebbe (e l'esame lo accetta), ma <code>$()</code> è preferita perché più leggibile e annidabile. <code>{}</code> è brace expansion, non esegue comandi. ♻️` },

];
