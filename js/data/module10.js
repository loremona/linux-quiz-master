/* ═══════════ MODULO 10 — Sicurezza ═══════════
   Obiettivi LPI: 110.1–110.3
   ~34 card · 14 quiz (di cui 2 input, 3 missioni) */
'use strict';

const MODULE10 = [

  // ── 1. Benvenuto ─────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔐', title: 'Modulo 10: Sicurezza',
    text: `L'ultimo modulo del programma LPIC-1. Tre topic:<br>
• <strong>110.1</strong> — Amministrazione sicurezza: sudo/su, SUID/SGID/sticky, ulimit, last/who/w<br>
• <strong>110.2</strong> — Sicurezza host: TCP wrappers, /etc/hosts.allow/deny<br>
• <strong>110.3</strong> — Cifratura: SSH a chiave pubblica, GPG<br>
<br>
Completare questo modulo significa aver coperto l'intero programma LPIC-1. 🎓`,
    analogy: `La sicurezza è come il sistema di accesso di un palazzo moderno: sudo è la banca delle chiavi (usi solo la chiave che ti serve), SSH è il citofono con riconoscimento facciale, GPG è la cassaforte personale.` },

  // ── 2. sudo: il superpotere controllato ──────────────────────────────────────
  { type: 'lesson', emoji: '🦸', title: 'sudo: esegui come root senza essere root',
    text: `<strong>sudo</strong> permette a un utente normale di eseguire comandi con privilegi elevati, in modo controllato e tracciato.<br>
<br>
<code>sudo comando</code> — esegui come root<br>
<code>sudo -u mario comando</code> — esegui come utente mario<br>
<code>sudo -l</code> — lista cosa puoi fare con sudo<br>
<code>sudo -i</code> — apri una shell root (login shell)<br>
<code>sudo -s</code> — apri una shell root (senza env di root)<br>
<br>
Configurazione: <code>/etc/sudoers</code> — MODIFICARE SEMPRE CON <code>visudo</code>!<br>
<code>visudo</code> valida la sintassi prima di salvare: un errore in /etc/sudoers può bloccarti fuori dal sistema.<br>
<br>
Formato riga in /etc/sudoers:<br>
<code>lore  ALL=(ALL:ALL) ALL</code> — lore può eseguire qualsiasi comando come qualsiasi utente<br>
<code>%wheel ALL=(ALL) NOPASSWD: ALL</code> — il gruppo wheel senza password<br>
<br>
Tutti i comandi sudo vengono loggati in <code>/var/log/auth.log</code> o via journald.`,
    analogy: `sudo è come l'addetto alla cassaforte della banca: non ti dà le chiavi, ma apre lui stesso solo quello che sei autorizzato a prendere, e tiene un registro di ogni accesso.` },

  // ── 3. Terminal: sudo ─────────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🦸', title: 'sudo in azione',
    cmd: 'sudo -l',
    out: `Matching Defaults entries for lore on cachyos:
    env_reset, mail_badpass, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

User lore may run the following commands on cachyos:
    (ALL : ALL) ALL` },

  // ── 4. Quiz: sudo vs visudo ───────────────────────────────────────────────────
  { type: 'quiz', q: 'Come si modifica correttamente /etc/sudoers?',
    opts: [
      'Con visudo, che valida la sintassi prima di salvare',
      'Con sudo nano /etc/sudoers, perché ha i permessi giusti',
      'Con chmod 666 /etc/sudoers && nano /etc/sudoers',
      'Con vim /etc/sudoers come root'
    ],
    a: 0,
    explain: `<code>visudo</code> apre /etc/sudoers con un editor ma valida la sintassi PRIMA di salvare. Un errore di sintassi in sudoers può renderti impossibile usare sudo e bloccarti fuori dal sistema. Non modificare mai sudoers direttamente con un editor. 🦸` },

  // ── 5. su: cambia identità ────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🎭', title: 'su: diventa un altro utente',
    text: `<strong>su</strong> (substitute user) cambia l'identità utente nella sessione corrente.<br>
<br>
<code>su</code> — diventa root (chiede password di root)<br>
<code>su -</code> — diventa root con il suo ambiente completo (login shell)<br>
<code>su - mario</code> — diventa mario con il suo ambiente<br>
<code>su -c "comando" mario</code> — esegui un solo comando come mario<br>
<br>
TRAPPOLA! <code>su</code> vs <code>su -</code>:<br>
• <code>su</code> cambia utente ma mantiene la directory corrente e le variabili d'ambiente dell'utente originale<br>
• <code>su -</code> simula un login completo: porta la home di root, carica .bash_profile, imposta PATH di root<br>
<br>
Su Arch/CachyOS l'utente root non ha password di default (si usa sudo). Su Debian root ha password.`,
    analogy: `<code>su</code> è come indossare il badge di un altro dipendente senza cambiare scrivania. <code>su -</code> è come andare fisicamente alla sua scrivania, con il suo computer e i suoi cassetti.` },

  // ── 6. SUID e SGID ───────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🏳️', title: 'SUID e SGID: esegui come il proprietario',
    text: `I bit speciali <strong>SUID</strong> e <strong>SGID</strong> cambiano chi è l'"identità" durante l'esecuzione.<br>
<br>
<strong>SUID</strong> (Set User ID): il programma gira con i permessi del <em>proprietario</em> del file, non di chi lo esegue.<br>
Si vede come <code>-rw<strong>s</strong>r-xr-x</code> (la <code>s</code> al posto della <code>x</code> del proprietario).<br>
Esempio classico: <code>/usr/bin/passwd</code> ha SUID root → può scrivere /etc/shadow che appartiene a root.<br>
<br>
<strong>SGID</strong> (Set Group ID): il programma gira con il gruppo del file, non il gruppo di chi lo esegue.<br>
Si vede come <code>-rwxr-<strong>s</strong>r-x</code> (la <code>s</code> al posto della <code>x</code> del gruppo).<br>
Su directory: i nuovi file ereditano il gruppo della directory padre.<br>
<br>
Impostazione:<br>
<code>chmod u+s /bin/programma</code> — imposta SUID<br>
<code>chmod g+s /dir/condivisa</code> — imposta SGID su directory<br>
<code>chmod 4755 /bin/programma</code> — SUID numericamente (4 = SUID)<br>
<code>chmod 2755 /dir</code> — SGID numericamente (2 = SGID)<br>
<br>
TRAPPOLA! Se SUID è su un file senza esecuzione (<code>x</code>), la <code>s</code> diventa <code>S</code> maiuscola: il bit è impostato ma non ha effetto!`,
    analogy: `SUID è come un pass VIP allegato al documento: chiunque presenti quel documento viene trattato come il proprietario originale, non come se stesso.` },

  // ── 7. Terminal: find SUID ────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔍', title: 'Trova file con SUID',
    cmd: 'find /usr/bin -perm -4000 -ls 2>/dev/null | head -5',
    out: `   524300    52 -rwsr-xr-x   1 root root   52880 Jan 10 2026 /usr/bin/passwd
   524312    72 -rwsr-xr-x   1 root root   68208 Jan 10 2026 /usr/bin/su
   524318    36 -rwsr-xr-x   1 root root   35128 Jan 10 2026 /usr/bin/newgrp
   524322    56 -rwsr-xr-x   1 root root   54256 Jan 10 2026 /usr/bin/chsh
   524324    44 -rwsr-xr-x   1 root root   44632 Jan 10 2026 /usr/bin/chfn` },

  // ── 8. Quiz: SUID ─────────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Perché /usr/bin/passwd ha il bit SUID impostato con proprietario root?',
    opts: [
      'Per poter scrivere in /etc/shadow, che appartiene a root, anche quando eseguito da un utente normale',
      'Per impedire a utenti normali di eseguirlo',
      'Per eseguirlo con i permessi dell\'utente che lo lancia',
      'Perché tutti i programmi in /usr/bin devono avere SUID'
    ],
    a: 0,
    explain: `passwd deve modificare /etc/shadow (leggibile solo da root). Grazie al bit SUID, quando un utente normale esegue passwd, il processo gira con i privilegi di root (il proprietario del file). Senza SUID, passwd non potrebbe aggiornare le password. 🏳️` },

  // ── 9. Sticky bit ─────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '📌', title: 'Sticky bit: la protezione di /tmp',
    text: `Il <strong>sticky bit</strong> su una directory permette a tutti di creare file, ma solo al proprietario di eliminarli.<br>
<br>
Si vede come <code>drwxrwxrw<strong>t</strong></code> (la <code>t</code> al posto dell'ultima <code>x</code>).<br>
<br>
L'esempio universale: <code>/tmp</code><br>
<code>ls -ld /tmp</code> → <code>drwxrwxrwt 1 root root ...</code><br>
Tutti possono creare file in /tmp, ma solo il proprietario del file (o root) può eliminarlo — gli altri utenti non possono cancellare i file degli altri.<br>
<br>
<code>chmod +t /dir/condivisa</code> — imposta sticky bit<br>
<code>chmod 1777 /tmp</code> — 1 = sticky bit<br>
<br>
TRAPPOLA! Il significato di sticky bit sugli <em>eseguibili</em> (tenerli in RAM) è obsoleto. Oggi conta solo sulle <em>directory</em>.`,
    analogy: `Sticky bit è la regola della lavagnetta condivisa: tutti possono scrivere, ma solo chi ha scritto una nota può cancellarla. Il boss (root) può cancellare tutto.` },

  // ── 10. Quiz: sticky bit ──────────────────────────────────────────────────────
  { type: 'quiz', q: 'Cosa indica la "t" in "drwxrwxrwt" sui permessi di /tmp?',
    opts: [
      'Lo sticky bit: solo il proprietario del file (o root) può eliminarlo',
      'Il file system è montato come read-only',
      'La directory ha il SGID impostato',
      'Il file è temporaneo e verrà eliminato al reboot'
    ],
    a: 0,
    explain: `La <code>t</code> finale indica lo sticky bit. In /tmp tutti gli utenti possono creare file, ma nessuno può eliminare i file degli altri (solo il proprietario o root). Senza sticky bit chiunque con write sulla directory potrebbe cancellare i file di tutti. 📌` },

  // ── 11. ulimit ───────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '⚠️', title: 'ulimit: metti le briglie ai processi',
    text: `<strong>ulimit</strong> controlla le risorse che un processo (e i suoi figli) può consumare.<br>
<br>
<code>ulimit -a</code> — mostra tutti i limiti correnti<br>
<code>ulimit -n 4096</code> — max file aperti (open files)<br>
<code>ulimit -u 200</code> — max processi utente<br>
<code>ulimit -f 100000</code> — max dimensione file creabili (in blocchi 512B)<br>
<code>ulimit -v 1048576</code> — max memoria virtuale (in KB)<br>
<code>ulimit -c 0</code> — disabilita i core dump<br>
<br>
Limiti <strong>soft</strong> vs <strong>hard</strong>:<br>
• <code>ulimit -Sn 4096</code> — soft limit (l'utente può alzarlo fino all'hard)<br>
• <code>ulimit -Hn 8192</code> — hard limit (solo root può alzarlo)<br>
<br>
Persistenza: <code>/etc/security/limits.conf</code><br>
<code>lore  soft  nofile  4096</code><br>
<code>lore  hard  nofile  8192</code>`,
    analogy: `ulimit è il regolatore di potenza per ogni processo: impedi che un programma malfunzionante consumi tutta la RAM o apra milioni di file e metta in ginocchio il sistema.` },

  // ── 12. Terminal: ulimit ──────────────────────────────────────────────────────
  { type: 'terminal', emoji: '⚠️', title: 'Limiti risorse correnti',
    cmd: 'ulimit -a 2>&1 | head -10',
    out: `real-time non-blocking time  (microseconds, -R) unlimited
core file size              (blocks, -c) 0
data seg size               (kbytes, -d) unlimited
scheduling priority                (-e) 0
file size                   (blocks, -f) unlimited
pending signals                    (-i) 62737
max locked memory           (kbytes, -l) 8192
max memory size             (kbytes, -m) unlimited
open files                         (-n) 1024
pipe size                (512 bytes, -p) 8` },

  // ── 13. Quiz: ulimit ──────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale ulimit controlla il numero massimo di file che un processo può aprire contemporaneamente?',
    opts: ['-n', '-f', '-u', '-v'],
    a: 0,
    explain: `<code>ulimit -n</code> = numero massimo di file aperti (open files). Il default è spesso 1024, ma applicazioni come database o server web richiedono valori più alti (4096, 65536). <code>-f</code> è la dimensione massima dei file creabili, <code>-u</code> i processi, <code>-v</code> la memoria virtuale. ⚠️` },

  // ── 14. last, who, w, lastlog ─────────────────────────────────────────────────
  { type: 'lesson', emoji: '👁️', title: 'Chi è connesso? Chi si è connesso?',
    text: `Comandi per monitorare gli accessi al sistema:<br>
<br>
<code>who</code> — chi è connesso adesso (terminale, da dove, da quando)<br>
<code>w</code> — come who, ma mostra anche cosa stanno facendo (load, comando)<br>
<code>whoami</code> — mostra solo il tuo nome utente corrente<br>
<br>
<code>last</code> — storico dei login (legge <code>/var/log/wtmp</code>)<br>
<code>last -n 10</code> — ultimi 10 login<br>
<code>last mario</code> — solo i login di mario<br>
<code>last reboot</code> — quando ha riavviato il sistema<br>
<br>
<code>lastb</code> — tentativi di login FALLITI (legge <code>/var/log/btmp</code>)<br>
<code>lastlog</code> — ultimo login di TUTTI gli utenti (anche quelli mai connessi)<br>
<br>
TRAPPOLA! <code>last</code> e <code>lastb</code> leggono file binari (/var/log/wtmp e btmp). <code>lastlog</code> legge /var/log/lastlog. Sono file diversi!` },

  // ── 15. Terminal: w e last ────────────────────────────────────────────────────
  { type: 'terminal', emoji: '👁️', title: 'Monitoraggio sessioni',
    cmd: 'w && echo "---" && last -n 3',
    out: ` 14:45:02 up 3:12,  2 users,  load average: 0.42, 0.38, 0.35
USER     TTY      FROM             LOGIN@   IDLE JCPU PCPU WHAT
lore     :0       :0               11:32   ?xdm?  2:14   0.04s /usr/bin/startplasma
lore     pts/0    :0               11:35    0.00s  0.12s  0.01s w
---
lore     pts/0    :0               Wed Jun 17 11:35   still logged in
lore     :0                        Wed Jun 17 11:32   still logged in
reboot   system boot  6.9.3-1-cachyo Wed Jun 17 11:30   still running` },

  // ── 16. Quiz: last vs lastlog ─────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando mostra l\'ultimo login di TUTTI gli utenti di sistema, inclusi quelli che non si sono mai connessi?',
    opts: ['lastlog', 'last', 'lastb', 'who -a'],
    a: 0,
    explain: `<code>lastlog</code> legge /var/log/lastlog e mostra una riga per ogni account del sistema, anche quelli che mostrano "Never logged in". <code>last</code> mostra solo chi si è effettivamente connesso (da /var/log/wtmp). <code>lastb</code> mostra i tentativi falliti. 👁️` },

  // ── 17. TCP Wrappers ─────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🚧', title: 'TCP Wrappers: allow e deny',
    text: `<strong>TCP Wrappers</strong> è un sistema di controllo accessi per i servizi di rete (storico, ma nell'esame LPIC-1).<br>
<br>
Due file di configurazione:<br>
<code>/etc/hosts.allow</code> — chi è esplicitamente PERMESSO<br>
<code>/etc/hosts.deny</code> — chi è esplicitamente NEGATO<br>
<br>
Formato: <code>servizio: host/rete</code><br>
<code>sshd: 192.168.1.</code> — permetti SSH dalla rete 192.168.1.x<br>
<code>ALL: ALL</code> — nega/permetti tutto da tutti<br>
<br>
Regola di valutazione: <strong>prima allow, poi deny</strong>.<br>
1. Se c'è una regola in hosts.allow → permetti<br>
2. Se c'è una regola in hosts.deny → nega<br>
3. Se non c'è in nessuno dei due → permetti (default!)<br>
<br>
TRAPPOLA! Il default, se un host non compare in nessuno dei due file, è PERMETTI. Quindi per bloccare tutto-tranne-qualcosa devi mettere <code>ALL: ALL</code> in hosts.deny.`,
    analogy: `hosts.allow è la lista degli ospiti VIP (entrano subito), hosts.deny è la lista nera. La security guarda prima la lista VIP, poi la lista nera. Se non sei in nessuna delle due… entri lo stesso.` },

  // ── 18. Quiz: TCP wrappers ordine ────────────────────────────────────────────
  { type: 'quiz', q: 'In TCP Wrappers, se un host non compare né in hosts.allow né in hosts.deny, cosa succede?',
    opts: [
      'L\'accesso è permesso (il default è allow)',
      'L\'accesso è negato (il default è deny)',
      'Il servizio crasha',
      'L\'host viene messo in quarantena'
    ],
    a: 0,
    explain: `TRAPPOLA! Il default di TCP Wrappers è <strong>permetti</strong>. Se vuoi "nega tutto tranne la whitelist", devi mettere <code>ALL: ALL</code> in /etc/hosts.deny, poi le eccezioni in /etc/hosts.allow. L'ordine di valutazione è: allow → deny → default (allow). 🚧` },

  // ── 19. SSH: chiavi pubbliche ─────────────────────────────────────────────────
  { type: 'lesson', emoji: '🗝️', title: 'SSH: autenticazione a chiave pubblica',
    text: `L'autenticazione SSH a chiave pubblica è più sicura della password.<br>
<br>
Come funziona:<br>
1. Generi una coppia: <strong>chiave privata</strong> (sul tuo PC, segreta) + <strong>chiave pubblica</strong> (distribuibile)<br>
2. La chiave pubblica va sul server in <code>~/.ssh/authorized_keys</code><br>
3. Al login, il server sfida il client con un dato cifrato con la pubblica<br>
4. Il client risponde con la privata → accesso senza password<br>
<br>
Algoritmi (in ordine di preferenza nel 2026):<br>
• <code>ed25519</code> — il migliore: piccolo, veloce, sicuro<br>
• <code>ecdsa</code> — buono<br>
• <code>rsa</code> — vecchio ma universale, usa almeno 4096 bit<br>
<br>
File coinvolti:<br>
<code>~/.ssh/id_ed25519</code> — chiave privata (permessi 600 obbligatori!)<br>
<code>~/.ssh/id_ed25519.pub</code> — chiave pubblica<br>
<code>~/.ssh/authorized_keys</code> — chiavi pubbliche autorizzate sul server<br>
<code>~/.ssh/known_hosts</code> — fingerprint dei server conosciuti`,
    analogy: `La chiave pubblica è come un lucchetto: lo distribuisci a tutti i server. La chiave privata è l'unica chiave che lo apre: non la dai a nessuno. Chi prova ad entrare con solo il lucchetto senza la chiave non entra.` },

  // ── 20. ssh-keygen ────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔑', title: 'ssh-keygen: genera la tua coppia di chiavi',
    text: `<code>ssh-keygen</code> genera coppie di chiavi SSH.<br>
<br>
<code>ssh-keygen -t ed25519</code> — genera coppia ed25519 (raccomandato)<br>
<code>ssh-keygen -t rsa -b 4096</code> — genera RSA a 4096 bit<br>
<code>ssh-keygen -t ed25519 -C "lore@cachyos"</code> — con commento identificativo<br>
<br>
Cosa genera:<br>
• <code>~/.ssh/id_ed25519</code> — chiave <strong>privata</strong> (mai condividere!)<br>
• <code>~/.ssh/id_ed25519.pub</code> — chiave <strong>pubblica</strong><br>
<br>
Permessi obbligatori:<br>
<code>chmod 700 ~/.ssh</code><br>
<code>chmod 600 ~/.ssh/id_ed25519</code> (privata)<br>
<code>chmod 644 ~/.ssh/id_ed25519.pub</code> (pubblica)<br>
<br>
<code>ssh-keygen -l -f ~/.ssh/id_ed25519.pub</code> — mostra il fingerprint<br>
<code>ssh-keygen -p -f ~/.ssh/id_ed25519</code> — cambia la passphrase` },

  // ── 21. Terminal: ssh-keygen ──────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔑', title: 'Genera una coppia ed25519',
    cmd: 'ssh-keygen -t ed25519 -C "lore@cachyos" -f ~/.ssh/id_ed25519',
    out: `Generating public/private ed25519 key pair.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/lore/.ssh/id_ed25519
Your public key has been saved in /home/lore/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdef lore@cachyos
The key's randomart image is:
+--[ED25519 256]--+
|        .oo.     |
|       . +o+     |
+----[SHA256]-----+` },

  // ── 22. Quiz: chiavi SSH ──────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale file deve essere copiato sul server remoto per abilitare l\'accesso SSH senza password?',
    opts: [
      '~/.ssh/id_ed25519.pub (chiave PUBBLICA)',
      '~/.ssh/id_ed25519 (chiave privata)',
      '~/.ssh/known_hosts',
      '~/.ssh/config'
    ],
    a: 0,
    explain: `Sul server va la chiave <strong>pubblica</strong> (.pub). La chiave privata (senza .pub) non deve MAI lasciare la tua macchina. La pubblica va in <code>~/.ssh/authorized_keys</code> sul server. known_hosts contiene i fingerprint dei server, non le autorizzazioni. 🗝️` },

  // ── 23. ssh-copy-id e authorized_keys ────────────────────────────────────────
  { type: 'lesson', emoji: '📤', title: 'ssh-copy-id: copia la chiave sul server',
    text: `<code>ssh-copy-id</code> copia la chiave pubblica sul server in <code>~/.ssh/authorized_keys</code> automaticamente.<br>
<br>
<code>ssh-copy-id user@server</code> — copia la chiave di default (~/.ssh/id_*.pub)<br>
<code>ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server</code> — specifica il file<br>
<br>
Equivalente manuale:<br>
<code>cat ~/.ssh/id_ed25519.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"</code><br>
<br>
Sul server, il file authorized_keys deve avere permessi corretti:<br>
<code>chmod 700 ~/.ssh</code><br>
<code>chmod 600 ~/.ssh/authorized_keys</code><br>
<br>
TRAPPOLA! Se i permessi di ~/.ssh o di authorized_keys sono troppo aperti (es. world-readable), SSH rifiuta l'autenticazione a chiave e torna alla password come fallback.` },

  // ── 24. sshd_config: hardening ───────────────────────────────────────────────
  { type: 'lesson', emoji: '🛡️', title: 'sshd_config: rendi SSH più sicuro',
    text: `La configurazione del server SSH sta in <code>/etc/ssh/sshd_config</code>.<br>
Dopo ogni modifica: <code>systemctl reload sshd</code><br>
<br>
Impostazioni di hardening fondamentali:<br>
<code>PermitRootLogin no</code> — vieta il login diretto come root<br>
<code>PasswordAuthentication no</code> — solo chiavi, nessuna password<br>
<code>PubkeyAuthentication yes</code> — abilita le chiavi<br>
<code>AllowUsers lore mario</code> — solo questi utenti possono connettersi<br>
<code>Port 2222</code> — cambia la porta (oscurità, non sicurezza reale)<br>
<code>LoginGraceTime 30</code> — 30 secondi per autenticarsi<br>
<code>MaxAuthTries 3</code> — max 3 tentativi<br>
<br>
Il file di configurazione <strong>client</strong> SSH: <code>~/.ssh/config</code><br>
<code>Host mioserver<br>
  HostName 192.168.1.10<br>
  User lore<br>
  IdentityFile ~/.ssh/id_ed25519<br>
  Port 22</code>`,
    analogy: `sshd_config è il regolamento del citofono del palazzo: decidi chi può suonare (AllowUsers), se accetti solo la tessera magnetica (PubkeyAuth), e se il padrone di casa può entrare dall'esterno (PermitRootLogin).` },

  // ── 25. Quiz: PermitRootLogin ─────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale impostazione in sshd_config vieta il login SSH diretto come root?',
    opts: [
      'PermitRootLogin no',
      'AllowUsers !root',
      'RootLogin disabled',
      'DenyUsers root'
    ],
    a: 0,
    explain: `<code>PermitRootLogin no</code> è la direttiva standard. Le altre opzioni non esistono in sshd_config con quella sintassi. Dopo la modifica, ricarica con <code>systemctl reload sshd</code>. Valori possibili: no, yes, prohibit-password (solo chiavi), forced-commands-only. 🛡️` },

  // ── 26. GPG: crittografia asimmetrica ────────────────────────────────────────
  { type: 'lesson', emoji: '🔒', title: 'GPG: firma e cifratura',
    text: `<strong>GPG</strong> (GNU Privacy Guard) implementa la crittografia a chiave pubblica per file ed email.<br>
<br>
Come SSH, ha una coppia: <strong>chiave pubblica</strong> (distribuisci) e <strong>chiave privata</strong> (custodisci).<br>
<br>
Usi principali:<br>
• <strong>Cifratura</strong>: cifra con la chiave pubblica del destinatario → solo lui decifra<br>
• <strong>Firma digitale</strong>: firmi con la tua chiave privata → tutti verificano con la tua pubblica<br>
<br>
Comandi base:<br>
<code>gpg --gen-key</code> — genera la tua coppia di chiavi<br>
<code>gpg --list-keys</code> — lista le chiavi pubbliche nel tuo keyring<br>
<code>gpg --list-secret-keys</code> — lista le tue chiavi private<br>
<code>gpg --export -a "Mario" > mario.pub.asc</code> — esporta la chiave pubblica<br>
<code>gpg --import mario.pub.asc</code> — importa la chiave pubblica di qualcuno<br>
<br>
Cifra e decifra:<br>
<code>gpg --encrypt --recipient mario@example.com file.txt</code> → crea file.txt.gpg<br>
<code>gpg --decrypt file.txt.gpg > file.txt</code> — decifra (chiede passphrase della tua chiave privata)<br>
<br>
Firma e verifica:<br>
<code>gpg --sign file.txt</code> — firma (crea file.txt.gpg con contenuto + firma)<br>
<code>gpg --clearsign file.txt</code> — firma in chiaro (testo leggibile + firma)<br>
<code>gpg --verify file.txt.gpg</code> — verifica la firma`,
    analogy: `GPG con cifratura è come mandare una lettera in una cassaforte con il lucchetto del destinatario (solo lui ha la chiave). GPG con firma è come apporre il tuo sigillo di ceralacca: tutti possono vedere la lettera, ma verificano che sia tua.` },

  // ── 27. Terminal: gpg ─────────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔒', title: 'GPG: genera e gestisci chiavi',
    cmd: 'gpg --list-keys',
    out: `/home/lore/.gnupg/pubring.kbx
-------------------------------
pub   ed25519 2026-01-15 [SC]
      A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2
uid           [ultimate] Lorenzo Monaco <lore@example.com>
sub   cv25519 2026-01-15 [E]` },

  // ── 28. Quiz: gpg firma vs cifratura ─────────────────────────────────────────
  { type: 'quiz', q: 'Vuoi inviare un file a Mario garantendo che SOLO lui possa leggerlo. Quale comando usi?',
    opts: [
      'gpg --encrypt --recipient mario@example.com file.txt',
      'gpg --sign --recipient mario@example.com file.txt',
      'gpg --clearsign file.txt',
      'gpg --verify file.txt'
    ],
    a: 0,
    explain: `<code>--encrypt --recipient</code> cifra con la chiave pubblica del destinatario: solo Mario (con la sua chiave privata) può decifrarlo. <code>--sign</code> firma ma non cifra: tutti possono leggere il contenuto. <code>--clearsign</code> firma in chiaro (leggibile). <code>--verify</code> verifica una firma esistente. 🔒` },

  // ── 29. input: ssh-keygen ed25519 ────────────────────────────────────────────
  { type: 'input', q: 'Quale tipo di chiave SSH è raccomandato nel 2026 per la sua sicurezza ed efficienza?',
    accept: ['ed25519', '-t ed25519'],
    placeholder: 'algoritmo...',
    explain: `<code>ed25519</code> (Edwards-curve Digital Signature Algorithm, curva 25519) è il tipo raccomandato: chiavi piccole (256 bit = sicurezza equivalente a RSA-3072), molto veloce, resistente a timing attack. RSA è ancora usato per compatibilità con sistemi vecchi. 🔑` },

  // ── 30. input: find SUID ──────────────────────────────────────────────────────
  { type: 'input', q: 'Quale valore di -perm usare con find per trovare tutti i file con il bit SUID impostato?',
    accept: ['-4000', '-u+s', '/4000'],
    placeholder: 'find / -perm ...',
    explain: `<code>find / -perm -4000</code>: il <code>-</code> davanti a 4000 significa "tutti i file dove ALMENO questi bit sono impostati". 4000 è il bit SUID in notazione ottale. Alternativa: <code>-perm -u+s</code>. Il <code>/</code> invece di <code>-</code> cerca file con almeno uno dei bit specificati. 🔍` },

  // ── 31. Fun fact: /etc/shadow e l'algoritmo ───────────────────────────────────
  { type: 'fact', emoji: '🧂', title: 'Il sale nell\'hash della password',
    text: `Le password in <code>/etc/shadow</code> non sono mai in chiaro: sono hash con un <strong>salt</strong> casuale.<br>
Formato: <code>$6$AbCdEfGh$hash...</code> — <code>$6$</code> = SHA-512, <code>AbCdEfGh</code> = salt, il resto = hash.<br>
Il salt è diverso per ogni utente: anche se due utenti hanno la stessa password, l'hash è diverso. Questo rende inutili i <em>rainbow table attack</em>. <code>$1$</code>=MD5 (obsoleto), <code>$5$</code>=SHA-256, <code>$6$</code>=SHA-512 (standard attuale), <code>$y$</code>=yescrypt (futuro).` },

  // ── 32. Ripasso Lampo ─────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🧩', title: '🧩 RIPASSO LAMPO — Modulo 10',
    text: `• <code>visudo</code> per modificare /etc/sudoers · <code>sudo -l</code> cosa posso fare · <code>sudo -i</code> shell root<br>
• <code>su -</code> login shell root · <code>su - utente</code> con ambiente completo<br>
• SUID: <code>s</code> al posto di <code>x</code> proprietario, esegue come owner · <code>chmod 4755</code> o <code>u+s</code><br>
• SGID: <code>s</code> al posto di <code>x</code> gruppo, su dir figli ereditano il gruppo · <code>chmod 2755</code><br>
• Sticky: <code>t</code> finale, solo proprietario elimina file · <code>/tmp</code> · <code>chmod 1777</code><br>
• <code>ulimit -n</code> max file aperti · soft/hard · persistenza in /etc/security/limits.conf<br>
• <code>who</code>/<code>w</code> sessioni attive · <code>last</code> storico (wtmp) · <code>lastb</code> fail (btmp) · <code>lastlog</code> tutti<br>
• TCP wrappers: allow → deny → default allow · metti <code>ALL:ALL</code> in deny per bloccare tutto<br>
• SSH: chiave pubblica → authorized_keys sul server · <code>ssh-keygen -t ed25519</code><br>
• <code>PermitRootLogin no</code> in sshd_config · <code>PasswordAuthentication no</code><br>
• GPG: <code>--encrypt --recipient</code> cifra · <code>--sign</code> firma · <code>--verify</code> verifica · <code>--decrypt</code>` },

  // ── 33. Quiz: SUID vs SGID ────────────────────────────────────────────────────
  { type: 'quiz', q: 'Hai una directory /srv/team con SGID impostato, gruppo "devs". Cosa succede ai file creati lì dentro?',
    opts: [
      'Ereditano il gruppo "devs", indipendentemente dal gruppo primario di chi li crea',
      'Vengono eseguiti con i permessi del gruppo "devs"',
      'Solo i membri di "devs" possono creare file',
      'I file vengono eliminati solo da "devs"'
    ],
    a: 0,
    explain: `SGID su directory: i nuovi file creati al suo interno ereditano automaticamente il gruppo della directory ("devs"), non il gruppo primario dell'utente che li crea. Utilissimo per directory condivise tra team. Lo sticky bit (non SGID) gestisce invece chi può eliminare. 🏳️` },

  // ── 34. Quiz: permessi SSH ────────────────────────────────────────────────────
  { type: 'quiz', q: 'SSH rifiuta di usare la tua chiave privata. Quale causa è più probabile?',
    opts: [
      'I permessi di ~/.ssh/id_ed25519 sono 644 invece di 600',
      'La chiave è in formato ed25519 invece di rsa',
      'Il file ~/.ssh/authorized_keys non esiste in locale',
      'Il server SSH non supporta l\'autenticazione a chiave'
    ],
    a: 0,
    explain: `SSH è paranoico sui permessi: se la chiave privata è leggibile da altri (644 = world-readable), rifiuta di usarla per proteggere la sicurezza. La soluzione è <code>chmod 600 ~/.ssh/id_ed25519</code>. ed25519 è pienamente supportato. authorized_keys serve sul server, non in locale. 🔑` },

  // ── 35. Missione: permessi speciali ───────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: caccia a SUID e sticky bit',
    text: `Trova tutti i file con SUID nel sistema e verifica lo sticky bit su /tmp.`,
    solution: `# File con SUID (potenzialmente pericolosi se non necessari)
find /usr/bin /usr/sbin -perm -4000 -ls 2>/dev/null

# SUID su tutto il filesystem (più lento, richiede root)
sudo find / -perm -4000 -type f -ls 2>/dev/null | grep -v proc

# File con SGID
find /usr/bin -perm -2000 -ls 2>/dev/null

# Verifica sticky bit su /tmp
ls -ld /tmp
# Deve mostrare: drwxrwxrwt

# Sticky bit su /var/tmp anche?
ls -ld /var/tmp

# Crea una directory condivisa con SGID e sticky
sudo mkdir /srv/team
sudo chgrp devs /srv/team 2>/dev/null || echo "crea prima il gruppo: sudo groupadd devs"
sudo chmod 2775 /srv/team   # SGID
sudo chmod +t /srv/team     # sticky bit` },

  // ── 36. Missione: configura SSH a chiave ──────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: setup SSH senza password',
    text: `Genera una coppia di chiavi SSH ed25519 e preparala per l\'uso (se hai un server a disposizione, copiacela).`,
    solution: `# 1. Genera la coppia di chiavi
ssh-keygen -t ed25519 -C "lore@cachyos"
# Accetta il percorso default (~/.ssh/id_ed25519)
# Imposta una passphrase (più sicuro)

# 2. Verifica i file generati
ls -la ~/.ssh/
# id_ed25519 deve essere 600, id_ed25519.pub può essere 644

# 3. Mostra la tua chiave pubblica
cat ~/.ssh/id_ed25519.pub

# 4. Copia su server remoto (se disponibile)
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@192.168.1.10

# 5. Test connessione
ssh -i ~/.ssh/id_ed25519 user@192.168.1.10

# 6. Crea ~/.ssh/config per comodità
cat >> ~/.ssh/config << 'EOF'
Host mioserver
  HostName 192.168.1.10
  User lore
  IdentityFile ~/.ssh/id_ed25519
EOF
chmod 600 ~/.ssh/config
ssh mioserver` },

  // ── 37. Missione: GPG ─────────────────────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: cifra un file con GPG',
    text: `Genera una coppia di chiavi GPG, cifra un file e poi decifra per verificare.`,
    solution: `# 1. Genera la tua coppia di chiavi GPG
gpg --gen-key
# Inserisci nome, email, passphrase

# 2. Lista le chiavi
gpg --list-keys
gpg --list-secret-keys

# 3. Crea un file di test
echo "Questo è un segreto" > segreto.txt

# 4. Cifra il file con la TUA chiave pubblica (per te stesso)
gpg --encrypt --recipient "tua@email.com" segreto.txt
# Crea segreto.txt.gpg

# 5. Elimina l'originale e decifra
rm segreto.txt
gpg --decrypt segreto.txt.gpg > segreto_decifrato.txt
cat segreto_decifrato.txt

# 6. Prova la firma
gpg --clearsign segreto_decifrato.txt
# Crea segreto_decifrato.txt.asc (testo + firma)
cat segreto_decifrato.txt.asc

# 7. Verifica la firma
gpg --verify segreto_decifrato.txt.asc` },

];
