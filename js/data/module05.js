/* ═══════════ MODULO 5 — Shell & Scripting ═══════════
   Obiettivi LPI: 105.1–105.2
   Card totali: 39 (13 quiz + 1 input + 3 missioni) */
'use strict';

const MODULE05 = [

  // ── 1. Benvenuto ────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🐚', title: 'Modulo 5: Shell & Scripting',
    text: `In questo modulo impari a <strong>personalizzare la shell e scrivere script</strong> — la superpotenza di ogni sysadmin. Al termine saprai:<br>
• usare e personalizzare le variabili di shell e d'ambiente<br>
• capire PATH, alias e funzioni<br>
• configurare la shell con <code>.bashrc</code> e <code>.bash_profile</code><br>
• scrivere script bash con shebang, argomenti e variabili speciali<br>
• usare <code>if</code>, <code>for</code>, <code>while</code>, <code>test</code> e <code>read</code><br>
• fare debug con <code>set -x</code> e <code>set -e</code>`,
    analogy: `La shell è la cucina di Linux: il bash è il cuoco, le variabili sono gli ingredienti, gli script sono le ricette scritte. Una volta che sai cucinare, non torna più ai surgelati.` },

  // ── 2. Variabili di shell ────────────────────────────────────────────────────
  { type: 'lesson', emoji: '📦', title: 'Variabili di shell',
    text: `Assegnazione: <code>NOME=valore</code> (nessuno spazio attorno al <code>=</code>!)<br>
Uso: <code>$NOME</code> o <code>${'${'}NOME}</code> (le graffe sono obbligatorie in <code>${'${'}NOME}file</code>)<br>
<br>
Quoting:<br>
• <strong>Virgolette doppie</strong> <code>"..."</code> — le variabili vengono espanse<br>
• <strong>Virgolette singole</strong> <code>'...'</code> — tutto letterale, nessuna espansione<br>
<br>
Esempi:<br>
<code>NOME="Tux"</code><br>
<code>echo "Ciao $NOME"</code>  → Ciao Tux<br>
<code>echo 'Ciao $NOME'</code>  → Ciao $NOME<br>
<br>
TRAPPOLA! <code>NOME=hello world</code> → errore (bash interpreta <code>world</code> come comando). Usa sempre le virgolette se il valore ha spazi.`,
    analogy: `Le virgolette doppie sono come un traduttore: leggono il testo e convertono le variabili. Le singole sono un fotocopiatore: copiano tutto esattamente com'è.` },

  // ── 3. Terminal: env ─────────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🌍', title: 'Le variabili d\'ambiente',
    cmd: 'echo "Utente: $USER | Home: $HOME | Shell: $SHELL"',
    out: `Utente: lore | Home: /home/lore | Shell: /bin/bash` },

  // ── 4. Quiz: quoting ─────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Qual è l\'output di: NOME=Tux && echo \'Ciao $NOME\'?',
    opts: ['Ciao $NOME', 'Ciao Tux', 'Errore di sintassi', 'Ciao ${NOME}'],
    a: 0,
    explain: `Le virgolette singole disabilitano TUTTE le espansioni: $NOME viene stampato letteralmente come "$NOME". Le doppie virgolette avrebbero prodotto "Ciao Tux". Questa è una delle trappole più frequenti in bash. 📦` },

  // ── 5. export e variabili d'ambiente ─────────────────────────────────────────
  { type: 'lesson', emoji: '🌍', title: 'export — variabili d\'ambiente',
    text: `Di default una variabile è <strong>locale alla shell</strong>: i processi figli non la vedono.<br>
<code>export VARIABILE</code> → la rende disponibile ai processi figli.<br>
<code>export VARIABILE=valore</code> → assegna ed esporta in una riga.<br>
<br>
Variabili d'ambiente importanti (già esportate dal sistema):<br>
• <code>HOME</code> — directory home dell'utente<br>
• <code>USER</code> / <code>LOGNAME</code> — nome utente<br>
• <code>SHELL</code> — shell in uso<br>
• <code>PATH</code> — percorsi per trovare i comandi<br>
• <code>LANG</code> / <code>LC_ALL</code> — localizzazione<br>
• <code>PS1</code> — il prompt della shell<br>
<br>
<code>env</code> — mostra tutte le variabili d'ambiente<br>
<code>unset VARIABILE</code> — rimuove la variabile`,
    analogy: `Una variabile locale è un appunto sulla tua scrivania: lo vedi solo tu. export è come mandare un'email alla squadra: tutti i processi figli la ricevono.` },

  // ── 6. Quiz: export ──────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando rende la variabile COLORE disponibile ai processi figli?',
    opts: ['export COLORE=rosso', 'set COLORE=rosso', 'env COLORE=rosso', 'source COLORE=rosso'],
    a: 0,
    explain: `export è l'unico comando bash che aggiunge una variabile all'ambiente dei processi figli. "set" in bash mostra/imposta opzioni di shell. "env" da solo mostra l'ambiente; usato come "env VAR=val cmd" esegue cmd con quella variabile (senza esportarla permanentemente). "source" esegue un file nello scope corrente. 🌍` },

  // ── 7. PATH ──────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🛣️', title: 'PATH — dove si trovano i comandi',
    text: `<code>PATH</code> è una lista di directory separate da <code>:</code> dove la shell cerca i comandi.<br>
<br>
Aggiungere una directory al PATH:<br>
<code>PATH="$HOME/.local/bin:$PATH"</code><br>
(metti il tuo bin PRIMA per priorità, o DOPO per fallback)<br>
<br>
Comandi utili:<br>
• <code>which ls</code> — trova il percorso di un comando<br>
• <code>type ls</code> — dice se è file, alias o builtin<br>
• <code>hash -r</code> — svuota la cache dei comandi trovati<br>
<br>
TRAPPOLA! Per eseguire uno script nella directory corrente serve il prefisso <code>./</code>: la directory corrente NON è in PATH per sicurezza. <code>./script.sh</code>, non <code>script.sh</code>.`,
    analogy: `PATH è come la lista dei negozi dove vai a fare la spesa: bash li visita in ordine e compra (esegue) la prima cosa con quel nome che trova. Se il tuo negozio preferito non è in lista, bash non lo trova.` },

  // ── 8. Terminal: echo $PATH ───────────────────────────────────────────────────
  { type: 'terminal', emoji: '🛣️', title: 'PATH e which',
    cmd: 'echo $PATH && which bash && type ls',
    out: `/usr/local/sbin:/usr/local/bin:/usr/bin:/usr/sbin:/home/lore/.local/bin:/home/lore/bin
/usr/bin/bash
ls is aliased to \`ls --color=auto'` },

  // ── 9. Quiz: PATH ────────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Perché per eseguire uno script nella directory corrente serve "./script.sh" e non "script.sh"?',
    opts: [
      'La directory corrente non è nel PATH per motivi di sicurezza',
      'Il file deve avere estensione .sh per essere trovato',
      'Bisogna essere root per eseguire script locali',
      'bash cerca solo in /usr/bin e /bin'
    ],
    a: 0,
    explain: `Se la directory corrente fosse in PATH, un attaccante potrebbe mettere un file "ls" malevolo in /tmp e ingannare chiunque esegua "ls" da quella directory. Il prefisso "./" dice esplicitamente "questo file, qui". È sicurezza by design. 🛣️` },

  // ── 10. File di startup ───────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🚀', title: 'File di startup bash',
    text: `Bash carica file diversi in base al tipo di shell:<br>
<br>
<strong>Login shell</strong> (ssh, virtual console Ctrl+Alt+F2):<br>
• Carica <code>~/.bash_profile</code> oppure <code>~/.profile</code><br>
<br>
<strong>Shell interattiva non-login</strong> (nuova finestra terminale):<br>
• Carica <code>~/.bashrc</code><br>
<br>
<strong>Regola pratica</strong>: metti tutto in <code>~/.bashrc</code>. Nel <code>~/.bash_profile</code> metti solo:<br>
<code>[[ -f ~/.bashrc ]] &amp;&amp; source ~/.bashrc</code><br>
<br>
Dopo aver modificato <code>.bashrc</code>: <code>source ~/.bashrc</code> (o <code>. ~/.bashrc</code>) per applicare subito senza riaprire il terminale.`,
    analogy: `.bashrc è come il tuo set di abitudini mattutine: si ripete ogni volta che apri un terminale. .bash_profile è il checklist del primo avvio della giornata: lo fai solo quando "entri" davvero nel sistema.` },

  // ── 11. Fun fact: login vs interactive ───────────────────────────────────────
  { type: 'fact', emoji: '🐟', title: 'Su CachyOS usi fish, non bash!',
    text: `Su Arch/CachyOS la shell di default è spesso <strong>fish</strong> o <strong>zsh</strong>. Il file di configurazione equivalente è <code>~/.config/fish/config.fish</code>. L'esame LPIC-1 però chiede <strong>bash</strong> specificamente. I concetti sono gli stessi (variabili, alias, funzioni, script) ma la sintassi cambia: <code>set -x NOME valore</code> invece di <code>export NOME=valore</code>, e <code>function nome; end</code> invece di <code>function nome() { }</code>. Per i quiz e la certificazione, pensa in bash.` },

  // ── 12. alias ────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🏷️', title: 'alias e funzioni',
    text: `Un <strong>alias</strong> è un nome abbreviato per un comando:<br>
<code>alias ll='ls -la --color=auto'</code><br>
<code>alias gs='git status'</code><br>
<code>unalias ll</code> — rimuove l'alias<br>
<code>alias</code> senza argomenti — mostra tutti gli alias<br>
<br>
Per renderlo <strong>permanente</strong>: aggiungerlo a <code>~/.bashrc</code>, poi <code>source ~/.bashrc</code>.<br>
<br>
Le <strong>funzioni</strong> sono più potenti degli alias (possono usare logica):<br>
<code>mkcd() { mkdir -p "$1" &amp;&amp; cd "$1"; }</code><br>
<br>
TRAPPOLA! Un alias definito da riga di comando esiste solo per quella sessione — sparisce quando chiudi il terminale.`,
    analogy: `Un alias è come un soprannome: invece di dire "Marco Antonio Ferrari", dici "Mark". Ma se non lo scrivi sul badge (nel .bashrc), la prossima volta non ti ricorda il soprannome.` },

  // ── 13. Terminal: alias ───────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🏷️', title: 'Crea e verifica un alias',
    cmd: "alias ll='ls -la --color=auto' && alias | grep ll && type ll",
    out: `alias ll='ls -la --color=auto'
ll is aliased to \`ls -la --color=auto'` },

  // ── 14. Quiz: alias permanente ────────────────────────────────────────────────
  { type: 'quiz', q: 'Come rendi un alias permanente in bash?',
    opts: [
      'Aggiungilo a ~/.bashrc e poi esegui source ~/.bashrc',
      'Usa il comando "permanent alias ll=..."',
      'Aggiungilo a /etc/passwd',
      'Usa "export alias ll=..."'
    ],
    a: 0,
    explain: `~/.bashrc è il file letto ad ogni nuova shell interattiva. Aggiungere l'alias lì e poi fare "source ~/.bashrc" (o aprire un nuovo terminale) lo rende permanente. "permanent" e "export alias" non esistono. /etc/passwd è per gli account utente, non per la configurazione della shell. 🏷️` },

  // ── 15. Shebang e struttura script ────────────────────────────────────────────
  { type: 'lesson', emoji: '📜', title: 'Script bash — struttura base',
    text: `La <strong>prima riga</strong> (shebang) dice quale interprete usare:<br>
<code>#!/bin/bash</code> — bash diretto<br>
<code>#!/usr/bin/env bash</code> — più portabile (usa il bash trovato nel PATH)<br>
<br>
Per eseguire uno script:<br>
1. <code>chmod +x script.sh &amp;&amp; ./script.sh</code> — rendi eseguibile e lancia<br>
2. <code>bash script.sh</code> — non serve il chmod<br>
<br>
Struttura:<br>
<code># commento — tutto dopo # è ignorato</code><br>
<code>VAR=valore</code> — variabile locale<br>
<code>exit 0</code> — termina con successo (exit 1..N = errore)<br>
<br>
TRAPPOLA! Senza lo shebang, il kernel usa la shell corrente dell'utente — che potrebbe essere fish, zsh o altro.`,
    analogy: `Lo shebang è come la copertina di un libro: dice "questo testo va letto in italiano (bash), non in giapponese (zsh)". Senza copertina, il lettore indovina.` },

  // ── 16. Terminal: script hello ────────────────────────────────────────────────
  { type: 'terminal', emoji: '📜', title: 'Primo script bash',
    cmd: 'cat hello.sh && chmod +x hello.sh && ./hello.sh',
    out: `#!/bin/bash
# Saluto personalizzato
NOME="Tux"
echo "Ciao, $NOME! Sei pronto per LPIC-1?"
exit 0
---
Ciao, Tux! Sei pronto per LPIC-1?` },

  // ── 17. Variabili speciali ────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔢', title: 'Variabili speciali dello script',
    text: `Bash imposta automaticamente queste variabili in ogni script:<br>
• <code>$0</code> — nome dello script (es. <code>./myscript.sh</code>)<br>
• <code>$1</code> … <code>$9</code> — argomenti posizionali<br>
• <code>$#</code> — numero di argomenti passati<br>
• <code>$@</code> — tutti gli argomenti come lista separata (da usare nei loop)<br>
• <code>$*</code> — tutti gli argomenti come stringa unica<br>
• <code>$?</code> — exit code dell'ultimo comando (0=ok, ≠0=errore)<br>
• <code>$$</code> — PID della shell/script corrente<br>
• <code>$!</code> — PID dell'ultimo processo in background<br>
<br>
Uso tipico: <code>if [ $# -eq 0 ]; then echo "Uso: $0 &lt;file&gt;"; exit 1; fi</code>`,
    analogy: `Le variabili speciali sono come gli indicatori sul cruscotto dell'auto: $? è la spia del motore (0=tutto ok), $# è il numero di passeggeri, $0 è il nome dell'auto.` },

  // ── 18. Quiz: $? exit code ────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale variabile speciale contiene il codice di uscita dell\'ultimo comando?',
    opts: ['$?', '$0', '$#', '$$'],
    a: 0,
    explain: `$? è la variabile che bash aggiorna dopo ogni comando: 0=successo, qualsiasi altro valore=errore. Usato spesso con: "if [ $? -ne 0 ]; then echo Errore; fi" o più compatto con "command || echo Errore". $0=nome script, $#=numero argomenti, $$=PID. 🔢` },

  // ── 19. test e [ ] ───────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🧪', title: 'test e [ ] — condizioni',
    text: `<code>test ESPRESSIONE</code> oppure <code>[ ESPRESSIONE ]</code> (spazi obbligatori dentro!)<br>
<br>
<strong>File:</strong><br>
• <code>-f file</code> — è un file normale<br>
• <code>-d file</code> — è una directory<br>
• <code>-e file</code> — esiste (file o directory)<br>
• <code>-r</code> / <code>-w</code> / <code>-x</code> — leggibile/scrivibile/eseguibile<br>
<br>
<strong>Stringhe:</strong><br>
• <code>-z STR</code> — stringa vuota · <code>-n STR</code> — non vuota<br>
• <code>STR1 = STR2</code> — uguali · <code>STR1 != STR2</code> — diverse<br>
<br>
<strong>Numeri:</strong><br>
• <code>-eq</code> uguale · <code>-ne</code> diverso · <code>-lt</code> minore · <code>-gt</code> maggiore<br>
<br>
TRAPPOLA! <code>[ $VAR = "x" ]</code> crasha se VAR è vuota. Usa <code>[[ $VAR = "x" ]]</code> (bash extended) che gestisce stringhe vuote.`,
    analogy: `test è il controllore all'ingresso del club: verifica le condizioni prima di far passare il codice. [ ] sono solo parentesi graffe con un nome diverso — stesso comportamento.` },

  // ── 20. Terminal: test ────────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🧪', title: 'test in azione',
    cmd: '[ -f /etc/passwd ] && echo "esiste" || echo "non esiste"',
    out: `esiste` },

  // ── 21. Quiz: test -d ─────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Cosa verifica l\'espressione [ -d /etc ]?',
    opts: [
      '/etc è una directory',
      '/etc è un file normale',
      '/etc esiste (file o directory)',
      '/etc è leggibile dall\'utente corrente'
    ],
    a: 0,
    explain: `-d testa se il percorso è una directory. -f testa se è un file normale. -e testa se esiste (qualsiasi tipo). -r testa se è leggibile. Mnemonico: d=directory, f=file, e=exists, r=readable, w=writable, x=executable. 🧪` },

  // ── 22. if/elif/else ──────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔀', title: 'if / elif / else',
    text: `Struttura:<br>
<code>if [ condizione ]; then</code><br>
<code>&nbsp;&nbsp;comandi</code><br>
<code>elif [ altra_condizione ]; then</code><br>
<code>&nbsp;&nbsp;comandi</code><br>
<code>else</code><br>
<code>&nbsp;&nbsp;comandi</code><br>
<code>fi</code><br>
<br>
La condizione è un <strong>comando</strong>: se il suo exit code è <strong>0</strong> (successo) → ramo then.<br>
Quindi <code>if grep -q "root" /etc/passwd; then</code> è valido (grep esce con 0 se trova il pattern).<br>
<br>
TRAPPOLA! <code>if</code> si chiude con <code>fi</code> (if al contrario). Non <code>end</code>, non <code>endif</code>.`,
    analogy: `if è come un semaforo intelligente: controlla la condizione (il sensore del traffico), poi decide se andare avanti (then), deviare (elif) o fermarsi (else).` },

  // ── 23. Terminal: if script ───────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔀', title: 'if con argomenti',
    cmd: 'cat check.sh',
    out: `#!/bin/bash
if [ $# -eq 0 ]; then
  echo "Uso: $0 <percorso>"
  exit 1
elif [ -d "$1" ]; then
  echo "$1 è una directory"
elif [ -f "$1" ]; then
  echo "$1 è un file"
else
  echo "$1 non esiste"
fi` },

  // ── 24. Quiz: if si chiude con fi ────────────────────────────────────────────
  { type: 'quiz', q: 'Quale parola chiave chiude un blocco if in bash?',
    opts: ['fi', 'end', 'endif', 'done'],
    a: 0,
    explain: `fi chiude if (è "if" al contrario). done chiude for, while e until. end e endif non esistono in bash. Mnemonico: if...fi, for...done, while...done, case...esac (case al contrario). 🔀` },

  // ── 25. for loop ──────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔄', title: 'for loop',
    text: `<strong>Forma classica:</strong><br>
<code>for VAR in LISTA; do</code><br>
<code>&nbsp;&nbsp;comandi con $VAR</code><br>
<code>done</code><br>
<br>
La LISTA può essere:<br>
• valori espliciti: <code>for distro in Arch Debian Fedora</code><br>
• glob: <code>for f in *.log</code><br>
• output di comando: <code>for u in $(cat /etc/passwd | cut -d: -f1)</code><br>
• sequenza: <code>for i in {1..10}</code><br>
<br>
<strong>Forma C-style:</strong><br>
<code>for ((i=0; i&lt;10; i++)); do echo $i; done</code><br>
<br>
break → esci dal loop · continue → salta all'iterazione successiva`,
    analogy: `for è il cameriere che serve ogni cliente a turno: per ogni "distro" nella lista, esegue il "piatto" (il blocco do...done). Finita la lista, torna in cucina.` },

  // ── 26. Terminal: for loop ────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔄', title: 'for in azione',
    cmd: 'for distro in Arch Debian Fedora; do echo "Distro: $distro"; done',
    out: `Distro: Arch
Distro: Debian
Distro: Fedora` },

  // ── 27. while e until ─────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '⏳', title: 'while e until',
    text: `<strong>while</strong> — esegue finché la condizione è vera (exit 0):<br>
<code>while [ condizione ]; do</code><br>
<code>&nbsp;&nbsp;comandi</code><br>
<code>done</code><br>
<br>
<strong>until</strong> — esegue finché la condizione diventa vera (opposto di while):<br>
<code>until [ condizione ]; do ... done</code><br>
<br>
<strong>Leggere un file riga per riga</strong> (pattern fondamentale):<br>
<code>while IFS= read -r line; do echo "$line"; done &lt; file.txt</code><br>
<code>IFS=</code> preserva gli spazi iniziali/finali<br>
<code>-r</code> non interpreta i backslash<br>
<br>
break e continue funzionano come nel for.`,
    analogy: `while è come tenere premuto il pedale dell'acceleratore: continui finché c'è benzina (condizione vera). until è il freno: aspetti finché la macchina si ferma (condizione diventa vera).` },

  // ── 28. Fun fact: while true ──────────────────────────────────────────────────
  { type: 'fact', emoji: '♾️', title: 'while true — il loop infinito dei daemon',
    text: `<code>while true; do comando; sleep 5; done</code> è il pattern dei daemon scritti in bash: gira per sempre finché non riceve SIGTERM o SIGKILL. Interrompi con Ctrl+C (manda SIGINT) o <code>kill $PID</code>. Nei systemd unit file lo si mette come <code>ExecStart</code> — systemd si occupa di riavviarlo se crasha. Un loop infinito non è sempre un bug: a volte è una feature.` },

  // ── 29. Quiz: for vs while ────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quando conviene usare while invece di for?',
    opts: [
      'Quando il numero di iterazioni non è noto in anticipo',
      'Quando si vuole iterare su una lista fissa di elementi',
      'Quando si vuole usare la sintassi in stile C con (( ))',
      'while e for non sono intercambiabili in nessun caso'
    ],
    a: 0,
    explain: `while è ideale quando si itera finché una condizione cambia (leggi input, aspetta un file, ecc.) e non si sa quante volte girerà. for è ideale per liste finite. Detto questo, quasi qualsiasi while può essere riscritto come for e viceversa — è una questione di chiarezza. ⏳` },

  // ── 30. read ─────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '📥', title: 'read — input dall\'utente',
    text: `<code>read VAR</code> — legge una riga da stdin e la salva in VAR<br>
<code>read -p "Nome: " nome</code> — mostra un prompt prima di leggere<br>
<code>read -s password</code> — input nascosto (utile per password)<br>
<code>read -t 10 input</code> — timeout di 10 secondi (esce con exit code 1 se scade)<br>
<code>read -n 1 tasto</code> — legge un solo carattere<br>
<br>
Pattern per leggere un file:<br>
<code>while IFS= read -r riga; do</code><br>
<code>&nbsp;&nbsp;echo "Riga: $riga"</code><br>
<code>done &lt; /etc/hosts</code>`,
    analogy: `read è il microfono dello script: aspetta che l'utente parli (inserisca del testo) e memorizza quello che ha detto. Con -s il microfono registra in silenzio — senti ma non vedi.` },

  // ── 31. Quiz: read -s ────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale opzione di read nasconde l\'input (utile per le password)?',
    opts: ['read -s password', 'read -h password', 'read -n password', 'read -p password'],
    a: 0,
    explain: `-s (silent) sopprime l'echo dei caratteri digitati. -p specifica il prompt da mostrare ("read -p 'Password: ' pwd"). -n N legge al massimo N caratteri. -h non esiste come opzione di read. In uno script reale si usano insieme: read -sp "Password: " pwd. 📥` },

  // ── 32. Debug: set -x -e -u ───────────────────────────────────────────────────
  { type: 'lesson', emoji: '🐛', title: 'Debug: set -x, set -e, set -u',
    text: `Tre opzioni fondamentali per scrivere script robusti:<br>
<br>
<code>set -x</code> — <strong>trace mode</strong>: stampa ogni comando prima di eseguirlo (preceduto da +).<br>
<code>set +x</code> — disattiva il trace.<br>
<br>
<code>set -e</code> — <strong>exit on error</strong>: lo script si ferma al primo comando che restituisce exit code ≠ 0.<br>
<br>
<code>set -u</code> — <strong>unset error</strong>: errore se si usa una variabile non definita (protegge da typo come <code>$NEMA</code> invece di <code>$NOME</code>).<br>
<br>
Combo professionale all'inizio di ogni script:<br>
<code>set -euo pipefail</code><br>
(<code>pipefail</code>: la pipeline fallisce se uno dei comandi nella pipe fallisce)`,
    analogy: `set -x è come il registratore di volo dell'aereo: scrive ogni mossa. set -e è il pilota automatico che atterra d'emergenza al primo problema invece di continuare a volare rotto. set -u è il co-pilota che grida "quella variabile non esiste!" prima che causi danni.` },

  // ── 33. Quiz: set -e ─────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Con "set -e" attivo, cosa succede se un comando restituisce exit code ≠ 0?',
    opts: [
      'Lo script termina immediatamente',
      'Lo script stampa un avviso e continua',
      'Lo script riprova il comando 3 volte',
      'Lo script salta all\'else più vicino'
    ],
    a: 0,
    explain: `set -e (errexit) fa terminare lo script non appena un comando fallisce (exit code ≠ 0). Non c'è retry automatico né salto a else. Questo protegge da errori silenziosi dove lo script continua su dati corrotti. Eccezione: i comandi in condizioni if [ ... ] o collegati con && / || non attivano l'uscita. 🐛` },

  // ── 34. Ripasso Lampo ────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🧩', title: '🧩 RIPASSO LAMPO — Modulo 5',
    text: `• <code>VAR=valore</code> · <code>"doppie"</code> espandono · <code>'singole'</code> letterale<br>
• <code>export VAR</code> → variabile d'ambiente per i processi figli<br>
• <code>PATH</code> = lista directory per trovare comandi · <code>./</code> per script locali<br>
• <code>~/.bashrc</code> = shell interattiva · <code>~/.bash_profile</code> = login shell<br>
• <code>alias ll='ls -la'</code> → permanente in <code>.bashrc</code> · <code>unalias ll</code> rimuove<br>
• Shebang: <code>#!/bin/bash</code> · esegui con <code>./script.sh</code> o <code>bash script.sh</code><br>
• <code>$0 $1 $# $@ $? $$ </code> — variabili speciali<br>
• <code>[ -f ] [ -d ] [ -z ] -eq -lt -gt</code> — test · <code>if...fi</code> · <code>for...done</code> · <code>while...done</code><br>
• <code>read -p</code> prompt · <code>read -s</code> silenzioso<br>
• <code>set -x</code> trace · <code>set -e</code> exit on error · <code>set -u</code> unset error` },

  // ── 35. Quiz finale 1: .bashrc vs .bash_profile ───────────────────────────────
  { type: 'quiz', q: 'Quale file bash viene caricato da ogni nuova finestra del terminale (shell interattiva non-login)?',
    opts: ['~/.bashrc', '~/.bash_profile', '/etc/environment', '/etc/bash.bashrc'],
    a: 0,
    explain: `~/.bashrc è letto da ogni shell interattiva non-login (es. nuova finestra di Kitty o Alacritty). ~/.bash_profile è letto solo dalla login shell (ssh, console virtuale). /etc/environment è letto da PAM per tutti gli utenti ma non è bash-specifico. /etc/bash.bashrc è il bashrc di sistema, letto prima di quello utente. 🚀` },

  // ── 36. Quiz finale 2: eseguire script senza chmod ────────────────────────────
  { type: 'quiz', q: 'Come si esegue script.sh senza dargli il permesso eseguibile (+x)?',
    opts: ['bash script.sh', 'run script.sh', 'exec script.sh', 'source script.sh'],
    a: 0,
    explain: `"bash script.sh" passa il file come argomento all'interprete bash, che lo legge come testo — non serve il bit eseguibile. "run" non esiste. "exec" sostituisce il processo corrente con il comando (richiede comunque +x). "source script.sh" (o ". script.sh") esegue lo script nel contesto della shell corrente, ma anche lì serve lo shebang. 📜` },

  // ── 37. Input: numero argomenti ───────────────────────────────────────────────
  { type: 'input', q: 'Quale variabile speciale contiene il numero di argomenti passati a uno script bash?',
    accept: ['$#', '$# '],
    placeholder: 'scrivi la variabile...',
    explain: `$# contiene il numero di argomenti posizionali passati allo script (o a una funzione). Usato tipicamente per validare: "if [ $# -eq 0 ]; then echo 'Uso: $0 <file>'; exit 1; fi". $@ li contiene tutti come lista, $* come stringa unica, $0 è il nome dello script. 🔢` },

  // ── 38. Missione 1: alias permanente ─────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: alias permanente',
    text: `Aggiungi un alias utile al tuo ~/.bashrc (o ~/.config/fish/config.fish), poi caricalo nella sessione corrente e verificalo.`,
    solution: `# Apri .bashrc (o config.fish se usi fish)
nano ~/.bashrc

# Aggiungi in fondo (esempio):
alias ll='ls -la --color=auto'
alias ..='cd ..'
alias gs='git status'

# Salva e ricarica
source ~/.bashrc

# Verifica
alias | grep ll
type ll` },

  // ── 39. Missione 2: script if ─────────────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: script con if',
    text: `Scrivi un script che accetta un argomento e dice se è un file, una directory o non esiste.`,
    solution: `#!/bin/bash
# Salva come ~/check.sh

if [ $# -eq 0 ]; then
  echo "Uso: $0 <percorso>"
  exit 1
fi

if [ -d "$1" ]; then
  echo "$1 è una directory"
elif [ -f "$1" ]; then
  echo "$1 è un file"
else
  echo "$1 non esiste"
fi

# Esecuzione:
chmod +x ~/check.sh
~/check.sh /etc
~/check.sh /etc/passwd
~/check.sh /xyz` },

  // ── 40. Missione 3: for loop ─────────────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: for loop sui file',
    text: `Scrivi un for loop che elenca tutti i file .conf in /etc con la loro dimensione.`,
    solution: `# Opzione 1: for classico con glob
for f in /etc/*.conf; do
  [ -f "$f" ] && echo "$f: $(du -sh "$f" | cut -f1)"
done

# Opzione 2: find + while
find /etc -maxdepth 1 -name '*.conf' | while read f; do
  echo "$f: $(du -sh "$f" | cut -f1)"
done

# Opzione 3: per vedere anche dimensioni
ls -lh /etc/*.conf 2>/dev/null` },

];
