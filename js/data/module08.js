/* ═══════════ MODULO 8 — Servizi di sistema ═══════════
   Obiettivi LPI: 108.1–108.4
   ~32 card · 13 quiz (di cui 1 input, 3 missioni) */
'use strict';

const MODULE08 = [

  // ── 1. Benvenuto ─────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '⚙️', title: 'Modulo 8: Servizi di sistema',
    text: `Quattro topic che ogni sysadmin deve conoscere:<br>
• <strong>108.1</strong> — Ora di sistema: date, hwclock, NTP, chrony<br>
• <strong>108.2</strong> — Log: journald, rsyslog, livelli syslog, logrotate<br>
• <strong>108.3</strong> — Mail: MTA, /etc/aliases, newaliases, mailq<br>
• <strong>108.4</strong> — Stampa: CUPS, lp, lpq, lprm<br>
<br>
Modulo ricco di <strong>trappole su comandi simili</strong> e nomi di file specifici per distro.`,
    analogy: `Il sysadmin gestisce quattro "servizi pubblici" del server: l'orologio (NTP), il registro (log), la posta (MTA) e la fotocopiatrice (CUPS). Tutti devono funzionare silenziosamente in background.` },

  // ── 2. date e hwclock ────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🕐', title: 'date e hwclock: due orologi a confronto',
    text: `Il sistema ha <strong>due orologi</strong>:<br>
• <strong>System clock</strong>: mantenuto dal kernel in RAM, perde precisione nel tempo<br>
• <strong>Hardware clock</strong> (RTC): chip fisico sulla scheda madre, mantiene l'ora anche spento<br>
<br>
<code>date</code> — legge/imposta il system clock<br>
<code>date "+%Y-%m-%d %H:%M:%S"</code> — formato personalizzato<br>
<code>date -s "2026-06-17 14:30:00"</code> — imposta data/ora (root)<br>
<br>
<code>hwclock</code> — interagisce con l'RTC<br>
<code>hwclock --show</code> — leggi l'orologio hardware<br>
<code>hwclock --systohc</code> — sincronizza: <strong>system → hardware</strong><br>
<code>hwclock --hctosys</code> — sincronizza: <strong>hardware → system</strong><br>
<br>
TRAPPOLA! Le direzioni: <strong>sys</strong>to<strong>hc</strong> = dal sistema all'hardware (hc = hardware clock). <strong>hc</strong>to<strong>sys</strong> = dall'hardware al sistema.`,
    analogy: `È come avere due orologi: quello sul polso (system clock, preciso ma dipende dalla batteria) e l'orologio atomico appeso al muro (RTC). hwclock --systohc aggiusta il muro partendo dal polso.` },

  // ── 3. Terminal: date e hwclock ───────────────────────────────────────────────
  { type: 'terminal', emoji: '🕐', title: 'Ora di sistema e hardware',
    cmd: 'date && echo "---" && hwclock --show && echo "---" && date "+Oggi è %A %d %B %Y, sono le %H:%M"',
    out: `Wed Jun 17 14:32:11 CEST 2026
---
2026-06-17 14:32:10.423104+02:00
---
Oggi è Wednesday 17 June 2026, sono le 14:32` },

  // ── 4. Quiz: hwclock direzione ────────────────────────────────────────────────
  { type: 'quiz', q: 'Il server è stato spento per ore. Al riavvio vuoi impostare il system clock basandoti sull\'RTC. Quale comando usi?',
    opts: [
      'hwclock --hctosys',
      'hwclock --systohc',
      'date --sync-hwclock',
      'timedatectl sync'
    ],
    a: 0,
    explain: `<strong>hc</strong>to<strong>sys</strong> = Hardware Clock → System clock. Prendi l'ora dall'RTC (che continua a girare anche da spento) e aggiorna il sistema. <strong>sys</strong>to<strong>hc</strong> è l'opposto: aggiorna l'RTC partendo dal sistema. 🕐` },

  // ── 5. NTP ────────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🌐', title: 'NTP: l\'orologio di rete',
    text: `<strong>NTP</strong> (Network Time Protocol) sincronizza l'orologio del sistema con server di riferimento globali.<br>
<br>
Implementazioni principali:<br>
• <strong>ntpd</strong> — il demone NTP classico (pacchetto <code>ntp</code>)<br>
• <strong>chronyd</strong> — moderno, più veloce a convergere (pacchetto <code>chrony</code>), raccomandato<br>
• <strong>systemd-timesyncd</strong> — client NTP minimale integrato in systemd<br>
<br>
Con <code>timedatectl</code>:<br>
<code>timedatectl</code> — mostra ora, timezone e stato NTP<br>
<code>timedatectl set-ntp true</code> — abilita la sincronizzazione NTP<br>
<code>timedatectl set-ntp false</code> — disabilita NTP (per impostare l'ora manualmente)<br>
<br>
Con chrony:<br>
<code>chronyc tracking</code> — stato della sincronizzazione<br>
<code>chronyc sources</code> — server NTP in uso<br>
<br>
Server NTP pubblici: <code>pool.ntp.org</code>, <code>time.google.com</code>`,
    analogy: `NTP è come il campanile del paese che ogni giorno si sincronizza con l'orologio atomico di Roma, e poi tutte le sveglie del paese si regolano sul campanile.` },

  // ── 6. Terminal: timedatectl NTP ──────────────────────────────────────────────
  { type: 'terminal', emoji: '🌐', title: 'Stato NTP con timedatectl',
    cmd: 'timedatectl',
    out: `               Local time: Wed 2026-06-17 14:32:15 CEST
           Universal time: Wed 2026-06-17 12:32:15 UTC
                 RTC time: Wed 2026-06-17 12:32:15
                Time zone: Europe/Rome (CEST, +0200)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no` },

  // ── 7. Quiz: NTP ──────────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando abilita la sincronizzazione NTP tramite systemd?',
    opts: [
      'timedatectl set-ntp true',
      'systemctl enable ntp',
      'ntpd --enable',
      'chronyd --sync'
    ],
    a: 0,
    explain: `<code>timedatectl set-ntp true</code> abilita il servizio di sincronizzazione dell'ora (systemd-timesyncd o chrony se installato). <code>systemctl enable ntp</code> funziona solo se il pacchetto ntp è installato e si chiama esattamente "ntp". L'esame chiede la via timedatectl. 🌐` },

  // ── 8. journald: introduzione ─────────────────────────────────────────────────
  { type: 'lesson', emoji: '📓', title: 'journald: il registro di systemd',
    text: `<strong>journald</strong> (parte di systemd) raccoglie i log di tutto il sistema in formato binario strutturato.<br>
<br>
Si interroga con <code>journalctl</code>:<br>
<code>journalctl</code> — tutti i log (dal più vecchio al più recente)<br>
<code>journalctl -b</code> — solo il boot corrente<br>
<code>journalctl -b -1</code> — boot precedente<br>
<code>journalctl -u ssh</code> — log del servizio ssh<br>
<code>journalctl -f</code> — segui in tempo reale (come tail -f)<br>
<code>journalctl -n 100</code> — ultime 100 righe<br>
<code>journalctl --since "2026-06-17 10:00" --until "11:00"</code> — intervallo<br>
<code>journalctl --since "1 hour ago"</code> — ultima ora<br>
<br>
I log persistono in <code>/var/log/journal/</code> se la directory esiste, altrimenti in RAM.`,
    analogy: `journald è il quaderno elettronico del palazzo: ogni evento (chi è entrato, cosa è successo, chi ha suonato l'allarme) viene registrato in ordine cronologico con timestamp precisi.` },

  // ── 9. Terminal: journalctl ───────────────────────────────────────────────────
  { type: 'terminal', emoji: '📓', title: 'journalctl in azione',
    cmd: 'journalctl -b -u NetworkManager -n 5',
    out: `Jun 17 14:01:03 cachyos NetworkManager[512]: <info>  [1750161663.0] dhcp4 (eth0): state changed new lease, address=192.168.1.105
Jun 17 14:01:03 cachyos NetworkManager[512]: <info>  [1750161663.1] device (eth0): state changed: ip-config -> activated
Jun 17 14:01:04 cachyos NetworkManager[512]: <info>  [1750161664.0] manager: startup complete
Jun 17 14:01:05 cachyos NetworkManager[512]: <info>  [1750161665.0] policy: set 'Wired' (eth0) as default
Jun 17 14:01:05 cachyos NetworkManager[512]: <info>  [1750161665.1] dns-mgr: Writing DNS configuration to /etc/resolv.conf` },

  // ── 10. Quiz: journalctl opzioni ──────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando mostra i log del servizio "nginx" solo dall\'ultimo avvio del sistema?',
    opts: [
      'journalctl -b -u nginx',
      'journalctl -u nginx --boot',
      'journalctl --service=nginx -b0',
      'journalctl -f nginx'
    ],
    a: 0,
    explain: `<code>-b</code> filtra per boot corrente, <code>-u nginx</code> filtra per unit. Combinati: log di nginx dall'ultimo boot. <code>-f</code> significa follow (aggiornamento in tempo reale), non filtra per boot. L'ordine dei flag non importa. 📓` },

  // ── 11. Livelli syslog ────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🚨', title: 'Livelli di severity syslog (0–7)',
    text: `Ogni messaggio di log ha un livello di <strong>severity</strong> numerico:<br>
<br>
<code>0 emerg</code> — sistema inutilizzabile<br>
<code>1 alert</code> — azione immediata richiesta<br>
<code>2 crit</code> — condizione critica<br>
<code>3 err</code> — errore<br>
<code>4 warning</code> — avviso<br>
<code>5 notice</code> — condizione normale ma degna di nota<br>
<code>6 info</code> — messaggio informativo<br>
<code>7 debug</code> — debug dettagliato<br>
<br>
Con journalctl: <code>journalctl -p err</code> — mostra err e più gravi (0-3)<br>
Con rsyslog: <code>*.err</code> = err e superiori · <code>*.=err</code> = solo err<br>
<br>
TRAPPOLA! 0 è il più grave (emerg), 7 è il meno grave (debug). Al contrario di quello che si potrebbe pensare!`,
    analogy: `I livelli sono come il codice colori del pronto soccorso, ma al contrario: 0 (rosso = codice rosso, muori) → 7 (bianco = vieni quando puoi). Più basso = più urgente.` },

  // ── 12. Terminal: journalctl -p ───────────────────────────────────────────────
  { type: 'terminal', emoji: '🚨', title: 'Filtra per priorità',
    cmd: 'journalctl -p err -b -n 5',
    out: `Jun 17 13:58:01 cachyos kernel: ACPI Error: AE_NOT_FOUND (20230331/psargs-330)
Jun 17 13:58:01 cachyos kernel: ACPI Error: AE_NOT_FOUND (20230331/dsfield-185)
Jun 17 14:00:12 cachyos systemd[1]: Failed to start cups.service.
Jun 17 14:01:01 cachyos kernel: usb 1-2: device not accepting address 3, error -71
Jun 17 14:01:15 cachyos sshd[1204]: error: Could not load host key: /etc/ssh/ssh_host_ed25519_key` },

  // ── 13. Quiz: livelli syslog ──────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale livello syslog ha valore numerico 0 ed è il più grave?',
    opts: ['emerg', 'alert', 'crit', 'debug'],
    a: 0,
    explain: `<code>emerg</code> (0) = sistema inutilizzabile, massima gravità. debug (7) = minima gravità. La scala è invertita rispetto all'intuito: 0 = peggio, 7 = meno grave. L'esame chiede spesso la corrispondenza numero-nome. 🚨` },

  // ── 14. rsyslog ───────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '📁', title: 'rsyslog: il logger tradizionale',
    text: `<strong>rsyslog</strong> è il logger tradizionale (usato su Debian/Ubuntu/RHEL, meno su Arch che usa solo journald).<br>
<br>
Configurazione: <code>/etc/rsyslog.conf</code> + file in <code>/etc/rsyslog.d/</code><br>
<br>
Formato regola: <code>facility.severity    destinazione</code><br>
<code>kern.*              /var/log/kern.log</code><br>
<code>auth,authpriv.*     /var/log/auth.log</code><br>
<code>*.err               /var/log/errors.log</code><br>
<code>*.=debug            @192.168.1.1</code> — invia a server remoto via UDP<br>
<br>
Facility principali: <code>kern</code>, <code>user</code>, <code>mail</code>, <code>daemon</code>, <code>auth</code>, <code>syslog</code>, <code>lpr</code>, <code>cron</code>, <code>local0</code>–<code>local7</code><br>
<br>
<code>logger "messaggio"</code> — invia un messaggio a syslog da shell`,
    analogy: `rsyslog è lo smistatore della posta del palazzo: ogni lettera (log) viene categorizzata (facility) per urgenza (severity) e consegnata nella cassetta giusta (file di log).` },

  // ── 15. File di log /var/log ──────────────────────────────────────────────────
  { type: 'lesson', emoji: '📂', title: 'I file di log in /var/log',
    text: `I file di log classici vivono in <code>/var/log/</code>:<br>
<br>
<strong>Debian/Ubuntu:</strong><br>
• <code>/var/log/syslog</code> — log generale di sistema<br>
• <code>/var/log/auth.log</code> — autenticazioni, sudo, ssh<br>
• <code>/var/log/kern.log</code> — messaggi del kernel<br>
• <code>/var/log/dpkg.log</code> — installazioni pacchetti<br>
<br>
<strong>RHEL/CentOS/Fedora:</strong><br>
• <code>/var/log/messages</code> — log generale (= syslog su Debian)<br>
• <code>/var/log/secure</code> — autenticazioni (= auth.log su Debian)<br>
<br>
<strong>Comuni a tutte:</strong><br>
• <code>/var/log/boot.log</code> — messaggi di avvio<br>
• <code>/var/log/dmesg</code> — snapshot del ring buffer kernel<br>
• <code>/var/log/wtmp</code> — storico login (binario, si legge con <code>last</code>)<br>
• <code>/var/log/btmp</code> — tentativi login falliti (si legge con <code>lastb</code>)<br>
• <code>/var/log/cups/</code> — log stampanti<br>
<br>
TRAPPOLA! Debian = syslog+auth.log, RHEL = messages+secure. L'esame li chiede entrambi.` },

  // ── 16. Quiz: log Debian vs RHEL ─────────────────────────────────────────────
  { type: 'quiz', q: 'Su un sistema RHEL/CentOS, in quale file trovi i log di autenticazione (ssh, sudo)?',
    opts: ['/var/log/secure', '/var/log/auth.log', '/var/log/syslog', '/var/log/messages'],
    a: 0,
    explain: `Su RHEL/CentOS: <strong>/var/log/secure</strong>. Su Debian/Ubuntu: <strong>/var/log/auth.log</strong>. Il log generale su RHEL è /var/log/messages, su Debian è /var/log/syslog. L'esame LPIC-1 è distro-neutral: devi saperli entrambi. 📁` },

  // ── 17. logrotate ─────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔄', title: 'logrotate: i log non crescono all\'infinito',
    text: `<strong>logrotate</strong> gestisce la rotazione dei file di log: archivia, comprime e infine elimina i log vecchi.<br>
<br>
Configurazione: <code>/etc/logrotate.conf</code> (globale) + <code>/etc/logrotate.d/</code> (per servizio)<br>
<br>
Opzioni principali:<br>
<code>daily</code> / <code>weekly</code> / <code>monthly</code> — frequenza di rotazione<br>
<code>rotate 7</code> — mantieni 7 versioni precedenti<br>
<code>compress</code> — comprimi con gzip i log vecchi<br>
<code>delaycompress</code> — comprimi dalla seconda rotazione (non l'appena ruotato)<br>
<code>missingok</code> — non dare errore se il file non esiste<br>
<code>notifempty</code> — non ruotare se il file è vuoto<br>
<code>postrotate</code> — comando da eseguire dopo la rotazione (es. ricarica il servizio)<br>
<br>
<code>logrotate -f /etc/logrotate.conf</code> — forza rotazione manuale`,
    analogy: `logrotate è come il magazziniere dell'archivio: ogni settimana prende il registro più vecchio, lo inscatola (comprime), lo mette in archivio (rotate N), e dopo 7 settimane butta via le scatole più vecchie.` },

  // ── 18. Quiz: logrotate ───────────────────────────────────────────────────────
  { type: 'quiz', q: 'In una configurazione logrotate, cosa fa l\'opzione "rotate 4"?',
    opts: [
      'Mantiene 4 versioni precedenti del log prima di eliminare',
      'Ruota il log ogni 4 giorni',
      'Comprime il log in 4 parti',
      'Ruota solo se il file supera 4 MB'
    ],
    a: 0,
    explain: `<code>rotate 4</code> = mantieni 4 versioni archiviate. Alla quinta rotazione, la più vecchia viene eliminata. La frequenza è controllata da daily/weekly/monthly, non da rotate. La dimensione si controlla con <code>size 100M</code>. 🔄` },

  // ── 19. MTA ───────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '📬', title: 'MTA: il postino del server',
    text: `<strong>MTA</strong> (Mail Transfer Agent) è il software che trasferisce email tra server.<br>
<br>
MTA principali (da conoscere per l'esame):<br>
• <strong>Postfix</strong> — il più usato oggi, sicuro e modulare<br>
• <strong>sendmail</strong> — il classico storico, complesso<br>
• <strong>Exim</strong> — usato su Debian di default<br>
• <strong>nullmailer / ssmtp</strong> — relay-only, non ricevono posta<br>
<br>
Per l'esame LPIC-1 non devi configurare un MTA completo: devi conoscere i comandi di gestione base e i file chiave.<br>
<br>
Il comando <code>sendmail</code> è disponibile su tutti gli MTA come interfaccia compatibile:<br>
<code>echo "corpo" | sendmail -v destinatario@example.com</code><br>
<code>mail -s "oggetto" destinatario@example.com</code>`,
    analogy: `L'MTA è l'ufficio postale del server: riceve le lettere (email), le smista e le consegna. Postfix è il moderno ufficio postale automatizzato; sendmail è il vecchio postino che conosce tutti i vicoli ma è difficile da istruire.` },

  // ── 20. /etc/aliases e newaliases ────────────────────────────────────────────
  { type: 'lesson', emoji: '📮', title: '/etc/aliases e newaliases: ridirigi la posta',
    text: `<code>/etc/aliases</code> definisce alias email di sistema.<br>
<br>
Formato: <code>alias: destinazione</code><br>
<code>root:     lore</code> — la posta per root va a lore<br>
<code>admin:    root,lore</code> — va a entrambi<br>
<code>devs:     :include:/etc/mail/devteam</code> — legge da file<br>
<br>
TRAPPOLA! Dopo ogni modifica a <code>/etc/aliases</code> devi eseguire:<br>
<code>newaliases</code> — ricompila il database binario <code>/etc/aliases.db</code><br>
<br>
Senza <code>newaliases</code>, le modifiche non hanno effetto! Il file .db è quello che l'MTA legge davvero.<br>
<br>
Coda di posta:<br>
<code>mailq</code> — mostra i messaggi in coda di invio<br>
<code>postfix flush</code> — prova a inviare subito i messaggi in coda`,
    analogy: `/etc/aliases è come la rubrica cartacea dell'ufficio postale: utile per il personale, ma il sistema informatico legge solo il database (aliases.db). Ogni modifica alla rubrica deve essere "importata" (newaliases).` },

  // ── 21. Terminal: mailq ───────────────────────────────────────────────────────
  { type: 'terminal', emoji: '📬', title: 'Coda di posta',
    cmd: 'mailq',
    out: `-Queue ID-  --Size-- ----Arrival Time---- -Sender/Recipient-------
A1B2C3D4E5F     478 Wed Jun 17 14:10:01  lore@cachyos
                                         admin@example.com

-- 1 Kbytes in 1 Request.` },

  // ── 22. Quiz: newaliases ──────────────────────────────────────────────────────
  { type: 'quiz', q: 'Hai aggiunto un alias in /etc/aliases. Quale comando rende effettiva la modifica?',
    opts: ['newaliases', 'postfix reload', 'sendmail -bi', 'aliases --update'],
    a: 0,
    explain: `<code>newaliases</code> ricompila /etc/aliases → /etc/aliases.db. Senza questo passaggio, l'MTA non vede la modifica. <code>sendmail -bi</code> è un modo equivalente (inizializza il database), ma newaliases è lo standard e quello che l'esame chiede. 📮` },

  // ── 22b. ~/.forward: inoltro posta per utente ────────────────────────────────
  { type: 'lesson', emoji: '✉️', title: '~/.forward: ridirigi la tua posta',
    text: `<code>~/.forward</code> è un file nella home dell'utente che dice all'MTA dove inviare la posta destinata a quell'utente.<br>
<br>
Contiene una sola riga con il destinatario (o più destinatari separati da virgola):<br>
<code>echo "lore@gmail.com" > ~/.forward</code> — inoltra tutta la posta a Gmail<br>
<code>echo "lore@gmail.com, admin@work.com" > ~/.forward</code> — inoltra a più indirizzi<br>
<code>echo "\\lore, lore@gmail.com" > ~/.forward</code> — copia locale + inoltro (il \\ mantiene la copia)<br>
<br>
TRAPPOLA! La <strong>differenza tra ~/.forward e /etc/aliases</strong>:<br>
• <code>/etc/aliases</code> — gestito da root, vale per tutto il sistema, richiede <code>newaliases</code><br>
• <code>~/.forward</code> — gestito dall'utente stesso nella propria home, effettivo immediatamente<br>
<br>
TRAPPOLA! Il <code>\\</code> prima del nome in ~/.forward è essenziale: senza di esso l'inoltro crea un loop se <code>lore</code> è anche destinatario.`,
    analogy: `~/.forward è come "l'inoltro automatico" di Gmail che ogni utente imposta da solo — senza bisogno di chiedere all'amministratore di sistema (che invece gestisce /etc/aliases).` },

  // ── 22c. Quiz: ~/.forward vs /etc/aliases ────────────────────────────────────
  { type: 'quiz', q: 'Quale file permette a un utente di reindirizzare la propria posta senza coinvolgere root?',
    opts: ['~/.forward', '/etc/aliases', '/etc/mail/forward', '/etc/postfix/virtual'],
    a: 0,
    explain: `<code>~/.forward</code> è nella home dell'utente e può essere modificato senza privilegi di root. L'MTA lo legge automaticamente. <code>/etc/aliases</code> richiede root e il comando <code>newaliases</code> per aggiornare il database. <code>/etc/postfix/virtual</code> è una funzionalità avanzata di Postfix per domini virtuali. ✉️` },

  // ── 23. CUPS ──────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🖨️', title: 'CUPS: stampa in Linux',
    text: `<strong>CUPS</strong> (Common Unix Printing System) è il sistema di stampa standard di Linux (e macOS).<br>
<br>
Demone: <code>cupsd</code> (gestito da systemd)<br>
Configurazione: <code>/etc/cups/</code><br>
Interfaccia web: <code>http://localhost:631</code><br>
<br>
Comandi di stampa (stile System V):<br>
<code>lp file.txt</code> — stampa sulla stampante di default<br>
<code>lp -d HP_LaserJet file.txt</code> — stampante specifica<br>
<code>lp -n 3 file.txt</code> — 3 copie<br>
<code>lpstat -t</code> — stato completo di tutte le stampanti<br>
<code>lpstat -p</code> — lista stampanti<br>
<code>lpstat -d</code> — stampante di default<br>
<code>lpq</code> — coda di stampa<br>
<code>lprm N</code> — rimuovi job N dalla coda<br>
<code>cancel N</code> — alternativa a lprm<br>
<code>lpadmin -p NomeStampante -E -v socket://192.168.1.10:9100</code> — aggiunge stampante`,
    analogy: `CUPS è il centralino delle fotocopiatrici del palazzo: qualsiasi applicazione manda i documenti a CUPS, che li smista alla stampante giusta nel formato giusto (PPD).` },

  // ── 24. Terminal: lpstat ─────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🖨️', title: 'Gestione stampanti',
    cmd: 'lpstat -p && echo "---" && lpq',
    out: `printer HP_LaserJet is idle.  enabled since Wed Jun 17 09:00:00 2026
---
HP_LaserJet is ready
Rank    Owner   Job  Files                Total Size
1st     lore    42   report.pdf           234560 bytes` },

  // ── 25. Quiz: CUPS comandi ────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando rimuove un job dalla coda di stampa CUPS?',
    opts: ['lprm', 'lpdel', 'lpcancel', 'cupsrm'],
    a: 0,
    explain: `<code>lprm N</code> rimuove il job numero N dalla coda. <code>cancel N</code> è un sinonimo. <code>lpdel</code>, <code>lpcancel</code> e <code>cupsrm</code> non esistono. Per vedere i numeri dei job usa prima <code>lpq</code>. 🖨️` },

  // ── 26. Input: journalctl boot ────────────────────────────────────────────────
  { type: 'input', q: 'Quale opzione di journalctl filtra i log per mostrare solo quelli del boot corrente?',
    accept: ['-b', '--boot'],
    placeholder: 'journalctl ...',
    explain: `<code>journalctl -b</code> (o --boot) mostra i log dall'ultimo avvio del sistema. <code>-b -1</code> mostra il boot precedente. <code>-b -2</code> quello prima ancora. Senza -b, journalctl mostra tutti i log storici. 📓` },

  // ── 27. Fun fact: syslog e /dev/log ──────────────────────────────────────────
  { type: 'fact', emoji: '🔌', title: 'Come i processi scrivono i log',
    text: `I programmi non scrivono direttamente in /var/log: mandano i messaggi al socket <code>/dev/log</code> (su sistemi con rsyslog) o tramite le system call di journald. rsyslog/journald li leggono e li smistano. Questo è il motivo per cui puoi usare <code>logger "messaggio"</code> da terminale: parla con il socket, come farebbero le applicazioni. Prova: <code>logger -p auth.warning "tentativo sospetto"</code> e poi cerca il messaggio in /var/log/auth.log (su Debian) o con <code>journalctl -p warning</code>.` },

  // ── 28. Ripasso Lampo ─────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🧩', title: '🧩 RIPASSO LAMPO — Modulo 8',
    text: `• <code>hwclock --hctosys</code> (hardware→sistema) · <code>--systohc</code> (sistema→hardware)<br>
• <code>timedatectl set-ntp true</code> · <code>chronyc tracking</code> · NTP: ntpd, chronyd, systemd-timesyncd<br>
• <code>ntpq -p</code> mostra server NTP e stratum · <code>ntpdate pool.ntp.org</code> sync one-shot · <code>/etc/ntp.conf</code> config<br>
• <code>journalctl -b</code> boot · <code>-u servizio</code> · <code>-p err</code> · <code>-f</code> follow · <code>-n 50</code> ultime 50<br>
• Livelli syslog: 0=emerg 1=alert 2=crit 3=err 4=warning 5=notice 6=info 7=debug<br>
• Debian: syslog + auth.log · RHEL: messages + secure<br>
• logrotate: rotate N, compress, daily/weekly, <code>logrotate -f</code><br>
• <code>newaliases</code> dopo ogni modifica a /etc/aliases (ricompila aliases.db!)<br>
• <code>~/.forward</code> — inoltro posta per utente senza root · <code>\\utente</code> mantiene copia locale<br>
• <code>mailq</code> coda · CUPS: <code>lp</code> stampa · <code>lpstat -p</code> · <code>lpq</code> coda · <code>lprm N</code> cancella` },

  // ── 29. Quiz: finale hwclock ──────────────────────────────────────────────────
  { type: 'quiz', q: 'Dopo aver impostato manualmente l\'ora con "date -s", quale comando aggiorna anche l\'orologio hardware (RTC)?',
    opts: ['hwclock --systohc', 'hwclock --hctosys', 'timedatectl sync-rtc', 'date --sync'],
    a: 0,
    explain: `Hai aggiornato il system clock con date -s. Ora vuoi che l'RTC rifletta la nuova ora: <code>hwclock --systohc</code> (system to hardware clock). Se non lo fai, al prossimo riavvio il sistema leggerà l'RTC e tornerà all'ora vecchia. 🕐` },

  // ── 30. Quiz: finale log ──────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando mostra i log di errore (err e superiori) dall\'avvio corrente in tempo reale?',
    opts: [
      'journalctl -b -p err -f',
      'journalctl -u err -b --follow',
      'journalctl --error --boot --live',
      'tail -f /var/log/errors'
    ],
    a: 0,
    explain: `<code>-b</code> = boot corrente · <code>-p err</code> = priority err e superiori (0-3) · <code>-f</code> = follow (aggiornamento real-time). Le opzioni si combinano. <code>-u</code> filtra per unit (servizio), non per priorità. <code>/var/log/errors</code> non è un file standard. 📓` },

  // ── 31. Missione: esplora i log ───────────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: detective dei log',
    text: `Usa journalctl per trovare gli ultimi errori sul tuo sistema e capire quando è avvenuto l'ultimo avvio.`,
    solution: `# Quanti avvii ha memorizzato journald?
journalctl --list-boots

# Errori dell'avvio corrente
journalctl -b -p err

# Log dell'ultimo avvio del servizio sshd
journalctl -b -u sshd

# Ultimi 20 messaggi critici del kernel
journalctl -b -p crit -k -n 20

# Log dell'ultima ora
journalctl --since "1 hour ago"

# Dimensione del journal su disco
journalctl --disk-usage` },

  // ── 32. Missione: NTP ─────────────────────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: orologio preciso',
    text: `Verifica lo stato di sincronizzazione NTP del tuo sistema e controlla l'orologio hardware.`,
    solution: `# Stato NTP e timezone
timedatectl

# Se chronyd è installato: stato della sync
chronyc tracking
chronyc sources -v

# Se systemd-timesyncd è in uso
timedatectl show-timesync

# Orologio hardware
hwclock --show

# Abilita NTP se non attivo
sudo timedatectl set-ntp true

# Sincronizza hardware clock dal sistema
sudo hwclock --systohc` },

  // ── 33. ntpq e ntpdate ───────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔭', title: 'ntpq e ntpdate: monitorare e sincronizzare NTP',
    text: `<strong>ntpq -p</strong> — interroga il demone ntpd e mostra lo stato dei server NTP in uso:<br>
<code>ntpq -p</code><br>
Output: <code>remote  refid  st  t  when  poll  reach  delay  offset  jitter</code><br>
• <code>st</code> = stratum (1=vicino all'orologio atomico, 2=server pubblici, ...)<br>
• <code>offset</code> = differenza in ms tra orologio locale e server NTP<br>
• <code>*</code> davanti al server = sorgente selezionata attualmente<br>
• <code>+</code> davanti al server = candidato alternativo<br>
<br>
<strong>ntpdate</strong> — sincronizzazione one-shot (utile prima di avviare ntpd):<br>
<code>sudo ntpdate pool.ntp.org</code> — forza sync immediata<br>
TRAPPOLA! Se l'offset è &gt;17 min, ntpd non corregge automaticamente: fermalo con <code>systemctl stop ntpd</code>, poi usa ntpdate, poi riavvia ntpd.<br>
<br>
<strong>/etc/ntp.conf</strong> — configura i server NTP per ntpd:<br>
<code>server 0.pool.ntp.org iburst</code><br>
<code>server 1.pool.ntp.org iburst</code>`,
    analogy: `ntpq -p è come guardare il display di un GPS: vedi quanti satelliti (server NTP) stai usando e quanto è precisa la tua posizione (offset). ntpdate è il reset manuale quando l'orologio è troppo indietro per correggersi da solo.` },

  // ── 34. Quiz: ntpq ───────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando mostra i server NTP attivi e il loro stratum con il demone ntpd?',
    opts: ['ntpq -p', 'chronyc sources', 'timedatectl show-timesync', 'ntpdate -q'],
    a: 0,
    explain: `<code>ntpq -p</code> ("peers") interroga il demone ntpd e mostra i server NTP selezionati, il loro stratum, offset e jitter. <code>chronyc sources</code> è l'equivalente per chronyd. <code>ntpdate -q</code> esegue una query senza aggiornare il clock. Il simbolo * nell'output di ntpq -p indica il server correntemente selezionato. 🔭` },

  // ── 35. Missione: log e rotazione ─────────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: ispeziona i log di sistema',
    text: `Esplora /var/log, vedi la configurazione di logrotate e prova a scrivere un log manualmente.`,
    solution: `# Cosa c'è in /var/log?
ls -lh /var/log/

# Leggi il syslog (Debian) o messages (RHEL)
sudo tail -50 /var/log/syslog 2>/dev/null || sudo journalctl -n 50

# Configurazione logrotate
cat /etc/logrotate.conf
ls /etc/logrotate.d/

# Scrivi un messaggio di test nel log di sistema
logger -p user.info "Test messaggio da missione modulo 8"

# Verifica che sia arrivato
journalctl -n 5
# oppure: sudo tail -5 /var/log/syslog

# Forza logrotate (dry-run: simula senza fare nulla)
sudo logrotate -d /etc/logrotate.conf` },

];
