/* ═══════════ MODULO 7 — Amministrazione ═══════════
   Obiettivi LPI: 107.1–107.3
   ~32 card · 13 quiz (di cui 2 input, 3 missioni) */
'use strict';

const MODULE07 = [

  // ── 1. Benvenuto ─────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '👥', title: 'Modulo 7: Amministrazione',
    text: `Qui diventi l'amministratore di sistema. I tre topic dell'esame:<br>
• <strong>107.1</strong> — Utenti e gruppi: useradd, usermod, /etc/passwd, /etc/shadow<br>
• <strong>107.2</strong> — Pianificazione job: cron, at, anacron, systemd timer<br>
• <strong>107.3</strong> — Localizzazione: LANG, LC_ALL, timedatectl, timezone<br>
<br>
Modulo denso: molti comandi con opzioni simili, molte trappole d'esame.`,
    analogy: `L'amministratore di sistema è come il portiere di un condominio: decide chi entra (utenti), chi ha le chiavi di cosa (gruppi e permessi), a che ora si spengono le luci (cron), e mette l'orologio all'ora giusta (timezone).` },

  // ── 2. /etc/passwd: la rubrica ────────────────────────────────────────────────
  { type: 'lesson', emoji: '📋', title: '/etc/passwd: la rubrica degli utenti',
    text: `Ogni riga di <code>/etc/passwd</code> descrive un utente con 7 campi separati da <code>:</code>:<br>
<br>
<code>lore:x:1000:1000:Lorenzo Monaco:/home/lore:/bin/bash</code><br>
<br>
1. <strong>username</strong><br>
2. <strong>password</strong> — sempre <code>x</code>: la vera password è in /etc/shadow<br>
3. <strong>UID</strong> — User ID numerico (root=0, utenti=1000+)<br>
4. <strong>GID</strong> — Group ID primario<br>
5. <strong>GECOS</strong> — nome completo / commento (campo libero)<br>
6. <strong>home</strong> — directory home<br>
7. <strong>shell</strong> — shell di login (<code>/bin/bash</code>, <code>/sbin/nologin</code> per servizi)<br>
<br>
TRAPPOLA! La password non è in /etc/passwd — c'è solo una <code>x</code> segnaposto.`,
    analogy: `/etc/passwd è la rubrica del condominio: nome, numero appartamento, cassetta della posta. La chiave vera (password) la custodisce il portiere in cassaforte (/etc/shadow).` },

  // ── 3. Terminal: /etc/passwd ──────────────────────────────────────────────────
  { type: 'terminal', emoji: '📋', title: 'Leggi /etc/passwd',
    cmd: 'getent passwd lore && echo "---" && grep -c ":" /etc/passwd',
    out: `lore:x:1000:1000:Lorenzo Monaco:/home/lore:/bin/bash
---
42` },

  // ── 4. /etc/shadow: le password vere ─────────────────────────────────────────
  { type: 'lesson', emoji: '🔒', title: '/etc/shadow: i segreti dell\'amministratore',
    text: `<code>/etc/shadow</code> contiene gli hash delle password — leggibile solo da root.<br>
<br>
Formato (9 campi):<br>
<code>lore:$6$salt$hash...:19500:0:99999:7:::</code><br>
<br>
1. username<br>
2. hash della password (o <code>!</code> = bloccato, <code>*</code> = nessun login)<br>
3. data ultimo cambio password (giorni dal 1970-01-01)<br>
4. giorni minimi prima del prossimo cambio<br>
5. giorni massimi di validità<br>
6. giorni di preavviso scadenza<br>
7–9. campi scadenza account<br>
<br>
Il prefisso <code>$6$</code> identifica l'algoritmo hash: $6$ = SHA-512, $5$ = SHA-256, $1$ = MD5 (obsoleto).`,
    analogy: `/etc/shadow è la cassaforte del portiere: solo lui (root) la può aprire. Dentro non c'è la password in chiaro ma il suo "impronte digitali" (hash).` },

  // ── 5. Quiz: passwd vs shadow ─────────────────────────────────────────────────
  { type: 'quiz', q: 'In /etc/shadow, cosa indica il carattere "!" come secondo campo?',
    opts: [
      'L\'account è bloccato (nessun login con password)',
      'La password non è mai stata impostata',
      'L\'account è scaduto',
      'La password è in chiaro (non hashata)'
    ],
    a: 0,
    explain: `<code>!</code> davanti all'hash (o come unico valore) significa che l'account è bloccato: il login con password fallisce. Si usa con <code>usermod -L</code>. Il <code>*</code> indica invece un account di sistema senza possibilità di login. 🔒` },

  // ── 6. /etc/group ─────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '👥', title: '/etc/group e i gruppi',
    text: `<code>/etc/group</code>: 4 campi per riga.<br>
<code>wheel:x:998:lore,alice</code><br>
<br>
1. nome gruppo<br>
2. password gruppo (quasi sempre <code>x</code>)<br>
3. GID<br>
4. lista utenti membri secondari (separati da virgola)<br>
<br>
Ogni utente ha un <strong>gruppo primario</strong> (in /etc/passwd, campo 4) e zero o più <strong>gruppi secondari</strong> (in /etc/group).<br>
<br>
Comandi utili:<br>
• <code>id</code> — UID, GID primario, tutti i gruppi<br>
• <code>groups nomeutente</code> — solo i gruppi<br>
• <code>getent group wheel</code> — interroga il database dei gruppi`,
    analogy: `/etc/group è la lista dei club del condominio: il gruppo "piscina" ha i suoi membri, il gruppo "palestra" i suoi. Un utente può essere in più club contemporaneamente.` },

  // ── 7. Terminal: id ───────────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🪪', title: 'Chi sono?',
    cmd: 'id',
    out: `uid=1000(lore) gid=1000(lore) groups=1000(lore),998(wheel),985(users),968(docker)` },

  // ── 8. Quiz: id ───────────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando mostra UID, GID primario e tutti i gruppi dell\'utente corrente?',
    opts: ['id', 'whoami', 'groups', 'getent passwd'],
    a: 0,
    explain: `<code>id</code> mostra tutto: UID, GID primario e lista completa dei gruppi. <code>whoami</code> mostra solo il nome utente. <code>groups</code> elenca solo i gruppi (senza UID/GID). <code>getent passwd</code> legge /etc/passwd per un utente. 🪪` },

  // ── 9. useradd ────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '➕', title: 'useradd: creare utenti',
    text: `<code>useradd [opzioni] nomeutente</code><br>
<br>
Opzioni principali:<br>
• <code>-m</code> — crea la home directory (non è automatico su tutte le distro!)<br>
• <code>-s /bin/bash</code> — imposta la shell di login<br>
• <code>-G wheel,docker</code> — aggiunge a gruppi secondari<br>
• <code>-c "Nome Cognome"</code> — imposta il campo GECOS<br>
• <code>-d /home/custom</code> — home directory personalizzata<br>
• <code>-u 1500</code> — UID specifico<br>
• <code>-e 2026-12-31</code> — data scadenza account<br>
<br>
TRAPPOLA! <code>useradd</code> senza <code>-m</code> NON crea la home su alcune distro (come Arch). Su Debian/Ubuntu, /etc/adduser.conf ha <code>CREATE_HOME=yes</code> di default, ma l'esame chiede il comportamento di useradd puro.`,
    analogy: `<code>useradd -m</code> è come assegnare un appartamento a un nuovo inquilino e arredarci il minimo indispensabile (file da /etc/skel). Senza -m consegni solo le chiavi di un appartamento che non esiste ancora.` },

  // ── 10. Terminal: useradd ────────────────────────────────────────────────────
  { type: 'terminal', emoji: '➕', title: 'Crea utente completo',
    cmd: 'sudo useradd -m -s /bin/bash -G wheel -c "Mario Rossi" mario\nsudo passwd mario',
    out: `Nuova password:
Reinserisci nuova password:
passwd: password aggiornata correttamente` },

  // ── 11. Quiz: useradd -m ─────────────────────────────────────────────────────
  { type: 'quiz', q: 'Cosa fa "useradd -m -G docker alice"?',
    opts: [
      'Crea alice, crea /home/alice, la aggiunge al gruppo docker',
      'Crea alice, la aggiunge a docker, non crea la home',
      'Modifica alice aggiungendola a docker e creando la home',
      'Crea alice solo nel gruppo docker senza home'
    ],
    a: 0,
    explain: `<code>-m</code> crea la home (copiando /etc/skel), <code>-G docker</code> aggiunge al gruppo secondario docker. Senza <code>-m</code> su Arch la home non verrebbe creata. <code>-G</code> NON rimuove i gruppi precedenti (per quello si usa <code>-G</code> con <code>usermod</code>). ➕` },

  // ── 12. usermod e userdel ────────────────────────────────────────────────────
  { type: 'lesson', emoji: '✏️', title: 'usermod e userdel',
    text: `<strong>usermod</strong> — modifica un utente esistente:<br>
• <code>usermod -aG docker mario</code> — aggiunge mario a docker (<code>-a</code> = append, FONDAMENTALE!)<br>
• <code>usermod -s /bin/zsh mario</code> — cambia shell<br>
• <code>usermod -L mario</code> — blocca l'account (lock)<br>
• <code>usermod -U mario</code> — sblocca l'account (unlock)<br>
• <code>usermod -d /home/nuovo -m mario</code> — sposta la home<br>
<br>
TRAPPOLA! <code>usermod -G docker mario</code> SENZA <code>-a</code> sostituisce tutti i gruppi con solo "docker" — mario perde tutti gli altri gruppi secondari!<br>
<br>
<strong>userdel</strong> — elimina un utente:<br>
• <code>userdel mario</code> — rimuove utente ma lascia /home/mario<br>
• <code>userdel -r mario</code> — rimuove utente E la home directory`,
    analogy: `<code>-a</code> di append è come aggiungere un piano in un palazzo senza demolire quelli sotto. Senza -a, stai sostituendo tutto l'edificio con un monolocale.` },

  // ── 13. Quiz: usermod -aG ────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando aggiunge mario al gruppo "video" SENZA rimuoverlo dagli altri gruppi?',
    opts: [
      'usermod -aG video mario',
      'usermod -G video mario',
      'groupmod -a mario video',
      'addgroup mario video'
    ],
    a: 0,
    explain: `TRAPPOLA classica! <code>usermod -G video mario</code> SENZA <code>-a</code> RIMUOVE mario da tutti gli altri gruppi. <code>-a</code> (append) è obbligatorio per aggiungere senza perdere. <code>groupmod</code> modifica il gruppo, non l'appartenenza. ✏️` },

  // ── 14. input: useradd ────────────────────────────────────────────────────────
  { type: 'input', q: 'Con useradd, quale opzione crea la home directory dell\'utente?',
    accept: ['-m', '--create-home'],
    placeholder: 'opzione...',
    explain: `<code>-m</code> (o --create-home) dice a useradd di creare la home. Il contenuto iniziale viene copiato da <code>/etc/skel</code>. Su Arch/CachyOS è essenziale specificarla perché non è il default del comando puro. 📁` },

  // ── 107.1 extra: /etc/skel e /etc/login.defs ────────────────────────────────
  { type: 'lesson', emoji: '🏗️', title: '/etc/skel e /etc/login.defs',
    text: `<strong>/etc/skel</strong> — il "kit di benvenuto" per i nuovi utenti:<br>
Quando <code>useradd -m</code> crea la home, copia qui dentro tutto ciò che c'è in <code>/etc/skel/</code>. Di solito ci sono <code>.bashrc</code>, <code>.bash_profile</code>, <code>.bash_logout</code>.<br>
<br>
<strong>/etc/login.defs</strong> — policy di sistema per gli account:<br>
• <code>PASS_MAX_DAYS 99999</code> — giorni max validità password<br>
• <code>PASS_MIN_LEN 8</code> — lunghezza minima password<br>
• <code>UID_MIN 1000</code> e <code>UID_MAX 60000</code> — range UID per utenti normali<br>
• <code>CREATE_HOME yes</code> — default per la home (varia per distro)<br>
<br>
TRAPPOLA! Le policy in <code>/etc/login.defs</code> valgono per i nuovi account creati <em>dopo</em> la modifica, non per quelli esistenti.`,
    analogy: `/etc/skel è come l'arredamento di serie di un appartamento nuovo: tavolo, sedia, cucina base. Ogni nuovo inquilino (useradd -m) troverà già questi mobili di partenza. 🏗️` },

  // ── 107.1 extra: groupadd/groupmod/groupdel ──────────────────────────────────
  { type: 'lesson', emoji: '👥', title: 'groupadd, groupmod, groupdel',
    text: `Come useradd/usermod/userdel, ma per i gruppi:<br>
<br>
<code>groupadd sviluppatori</code> — crea un nuovo gruppo<br>
<code>groupadd -g 1500 sviluppatori</code> — crea con GID specifico<br>
<code>groupmod -n devs sviluppatori</code> — rinomina il gruppo<br>
<code>groupmod -g 1600 devs</code> — cambia il GID<br>
<code>groupdel sviluppatori</code> — elimina il gruppo<br>
<br>
TRAPPOLA! Non puoi eliminare un gruppo se è il <strong>gruppo primario</strong> di un utente. Devi prima cambiare il gruppo primario dell'utente (<code>usermod -g altrogruppo utente</code>).<br>
<br>
<strong>/etc/gshadow</strong> — le password dei gruppi (raramente usate):<br>
Formato: <code>nome:!:admin:membro1,membro2</code><br>
• <code>!</code> o <code>*</code> = nessun login con password di gruppo<br>
• <code>gpasswd gruppo</code> — imposta password di gruppo<br>
• <code>gpasswd -a utente gruppo</code> — alternativa a <code>usermod -aG</code>`,
    analogy: `groupdel è come chiudere un club del condominio. Ma non puoi chiuderlo se qualcuno lo usa come residenza principale (gruppo primario) — prima devi cambiare la sua residenza. 👥` },

  // ── 107.1 extra: passwd, lock/unlock ─────────────────────────────────────────
  { type: 'lesson', emoji: '🔑', title: 'passwd: gestire le password di sistema',
    text: `<code>passwd</code> — comandi fondamentali:<br>
<br>
<code>passwd mario</code> — cambia la password di mario (solo root)<br>
<code>passwd</code> — cambia la propria password<br>
<code>passwd -l mario</code> — <strong>blocca</strong> l'account (lock): aggiunge <code>!</code> in /etc/shadow<br>
<code>passwd -u mario</code> — <strong>sblocca</strong> l'account (unlock)<br>
<code>passwd -e mario</code> — <strong>scade subito</strong> la password: al prossimo login mario è costretto a cambiarla<br>
<code>passwd -S mario</code> — mostra lo <strong>status</strong> dell'account<br>
<br>
Equivalenza con usermod:<br>
• <code>passwd -l</code> ≡ <code>usermod -L</code><br>
• <code>passwd -u</code> ≡ <code>usermod -U</code>`,
    analogy: `passwd -e è come scadere la tessera palestra di un utente: al prossimo accesso il sistema lo ferma e gli chiede di rinnovare prima di lasciar passare. 🔑` },

  // ── Quiz: /etc/skel ──────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Da dove vengono copiati i file nella home di un utente appena creato con "useradd -m"?',
    opts: ['/etc/skel', '/etc/default/useradd', '/etc/login.defs', '/root/.skel'],
    a: 0,
    explain: `<code>/etc/skel</code> (skeleton = scheletro) è la template di ogni nuova home. Contiene i file dot di default (.bashrc, .bash_profile ecc.). <code>/etc/login.defs</code> ha le policy numeriche, non i file da copiare. 🏗️` },

  // ── Quiz: groupdel primario ───────────────────────────────────────────────────
  { type: 'quiz', q: 'Cosa succede se provi a eliminare con groupdel un gruppo che è il gruppo primario di un utente?',
    opts: [
      'Il comando fallisce con errore: non puoi eliminare un gruppo primario',
      'Il gruppo viene eliminato e l\'utente perde il gruppo primario',
      'L\'utente viene eliminato insieme al gruppo',
      'Il gruppo viene rinominato in "deleted_GID"'
    ],
    a: 0,
    explain: `<code>groupdel</code> rifiuta di eliminare un gruppo che è ancora il gruppo primario di qualche utente. Devi prima cambiare il gruppo primario dell'utente con <code>usermod -g altrogruppo utente</code>. 👥` },

  // ── Quiz: passwd -e ───────────────────────────────────────────────────────────
  { type: 'quiz', q: 'L\'amministratore vuole forzare mario a cambiare la password al prossimo login. Quale comando usa?',
    opts: ['passwd -e mario', 'passwd -l mario', 'passwd -S mario', 'usermod -e mario'],
    a: 0,
    explain: `<code>passwd -e mario</code> (expire) fa scadere immediatamente la password. Al prossimo login il sistema blocca mario e lo obbliga a impostarne una nuova. <code>-l</code> blocca l'account (lock), <code>-S</code> mostra lo stato, <code>usermod -e</code> imposta una data di scadenza dell'account (non della password). 🔑` },

  // ── 15. Cron: introduzione ───────────────────────────────────────────────────
  { type: 'lesson', emoji: '⏰', title: 'cron: l\'orologiaio dei job',
    text: `<strong>cron</strong> esegue comandi a orari prestabiliti, in modo ripetitivo.<br>
<br>
Ogni utente ha la sua crontab: <code>crontab -e</code> per modificarla.<br>
• <code>crontab -l</code> — lista i job dell'utente corrente<br>
• <code>crontab -r</code> — rimuove tutta la crontab (DISTRUTTIVO!)<br>
• <code>crontab -u mario -l</code> — lista i job di mario (solo root)<br>
<br>
File di sistema:<br>
• <code>/etc/crontab</code> — crontab di sistema (ha colonna "utente" extra)<br>
• <code>/etc/cron.d/</code> — directory per crontab di servizi<br>
• <code>/etc/cron.daily/</code>, <code>/etc/cron.weekly/</code>, <code>/etc/cron.monthly/</code> — script con frequenza fissa`,
    analogy: `cron è l'orologio a cucù del server: scatta puntuale all'ora giusta ed esegue il comando. Tu imposti i minuti, le ore, i giorni — lui non dimentica mai.` },

  // ── 16. Sintassi crontab ─────────────────────────────────────────────────────
  { type: 'lesson', emoji: '📅', title: 'La sintassi crontab: 5 campi + comando',
    text: `<code>minuto  ora  giorno-del-mese  mese  giorno-della-settimana  comando</code><br>
<br>
Valori possibili per ogni campo:<br>
• <code>*</code> = qualsiasi<br>
• <code>5</code> = esatto<br>
• <code>1-5</code> = intervallo<br>
• <code>*/15</code> = ogni 15<br>
• <code>1,15,30</code> = lista<br>
<br>
Esempi:<br>
<code>0 2 * * *    /usr/bin/backup.sh</code> — ogni giorno alle 02:00<br>
<code>*/5 * * * *  /check.sh</code> — ogni 5 minuti<br>
<code>0 9 * * 1    /weekly.sh</code> — ogni lunedì alle 09:00<br>
<code>30 4 1 * *   /monthly.sh</code> — il 1° di ogni mese alle 04:30<br>
<br>
TRAPPOLA! Il giorno della settimana: 0 = domenica, 1 = lunedì, …, 7 = domenica (sì, 0 e 7 sono entrambi domenica).`,
    analogy: `I 5 campi crontab sono come le lancette di 5 orologi annidati: minuto dentro l'ora dentro il giorno dentro il mese dentro la settimana. Tutti <code>*</code> = sempre. Un valore specifico = solo in quel momento.` },

  // ── 17. Terminal: crontab ────────────────────────────────────────────────────
  { type: 'terminal', emoji: '⏰', title: 'Lista e aggiungi job cron',
    cmd: 'crontab -l',
    out: `# m h  dom mon dow   command
0 2 * * *     /home/lore/backup.sh
*/10 * * * *  /home/lore/check_disk.sh
0 9 * * 1     /home/lore/weekly_report.sh` },

  // ── 18. Quiz: crontab syntax ─────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale riga crontab esegue uno script ogni lunedì alle 08:30?',
    opts: [
      '30 8 * * 1   /script.sh',
      '8 30 * * 1   /script.sh',
      '30 8 * * 0   /script.sh',
      '* * * * 1-8:30 /script.sh'
    ],
    a: 0,
    explain: `Ordine: <strong>minuto ora dom mese dow</strong>. 30 minuti, ora 8, qualsiasi giorno del mese, qualsiasi mese, lunedì (1). Il giorno 0 è domenica! La seconda riga ha i campi invertiti (ora=8, minuto=30 sarebbe le 08:00+30 min letti al contrario). ⏰` },

  // ── 19. at: job una tantum ───────────────────────────────────────────────────
  { type: 'lesson', emoji: '🎯', title: 'at: esegui UNA volta a un\'ora precisa',
    text: `<code>at</code> pianifica l'esecuzione di un comando <strong>una sola volta</strong>.<br>
<br>
<code>at 14:30</code> → prompt interattivo → scrivi comandi → Ctrl+D<br>
<code>echo "/script.sh" | at 14:30</code> — versione non interattiva<br>
<code>at now + 2 hours</code> — tra 2 ore<br>
<code>at midnight</code> — a mezzanotte<br>
<code>at 09:00 tomorrow</code> — domani alle 9<br>
<br>
Gestione code:<br>
• <code>atq</code> — lista i job in attesa<br>
• <code>atrm N</code> — rimuove il job numero N<br>
<br>
Il demone che esegue i job at si chiama <strong>atd</strong>.<br>
TRAPPOLA! cron = ripetitivo, at = una tantum. L'esame li contrappone sempre.`,
    analogy: `cron è l'abbonamento alla palestra (ci vai ogni settimana). at è la prenotazione di un singolo appuntamento: si esegue una volta, poi sparisce.` },

  // ── 20. Terminal: at ─────────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🎯', title: 'Pianifica un job con at',
    cmd: 'echo "systemctl restart nginx" | at now + 10 minutes\natq',
    out: `job 5 at Wed Jun 17 15:42:00 2026
5	Wed Jun 17 15:42:00 2026 a lore` },

  // ── 21. Quiz: cron vs at ─────────────────────────────────────────────────────
  { type: 'quiz', q: 'Devi inviare un report automatico ogni venerdì alle 18:00. Quale strumento usi?',
    opts: ['cron', 'at', 'anacron', 'systemd-run'],
    a: 0,
    explain: `Ripetitivo → cron. Una tantum → at. Anacron serve per macchine non sempre accese (salta i job persi). systemd-run può pianificare job ma non è lo strumento standard per job ricorrenti settimanali nell'esame LPIC-1. 📅` },

  // ── 107.2 extra: cron.allow, cron.deny, at.allow, at.deny ───────────────────
  { type: 'lesson', emoji: '🚦', title: 'Chi può usare cron e at?',
    text: `cron e at hanno un sistema di controllo accessi basato su file allow/deny:<br>
<br>
<strong>/etc/cron.allow</strong> — lista utenti autorizzati a usare crontab<br>
<strong>/etc/cron.deny</strong> — lista utenti che NON possono usare crontab<br>
<strong>/etc/at.allow</strong> — lista utenti autorizzati a usare at<br>
<strong>/etc/at.deny</strong> — lista utenti che NON possono usare at<br>
<br>
Logica di precedenza (uguale per cron e at):<br>
1. Se esiste <code>*.allow</code> → SOLO gli utenti in quel file possono usarlo<br>
2. Se non esiste <code>*.allow</code> ma esiste <code>*.deny</code> → tutti tranne quelli in deny<br>
3. Se nessuno dei due esiste → solo root può usarlo (comportamento dipende dalla distro)<br>
<br>
TRAPPOLA! Se <code>cron.allow</code> esiste, <code>cron.deny</code> viene <strong>ignorato completamente</strong> — vince sempre allow.`,
    analogy: `allow è la lista degli invitati VIP: se esiste, tutti gli altri rimangono fuori, lista nera o meno. deny è il buttafuori che blocca i nomi scritti. Se c'è la lista VIP, il buttafuori va in pausa. 🚦` },

  // ── Quiz: cron.allow vs cron.deny ────────────────────────────────────────────
  { type: 'quiz', q: 'Sul sistema esistono sia /etc/cron.allow che /etc/cron.deny. L\'utente "bob" non è in nessuno dei due. Può usare crontab?',
    opts: [
      'No: esiste cron.allow quindi solo chi è in quella lista può usare crontab',
      'Sì: non è in cron.deny quindi può usare crontab',
      'Sì: cron.allow sovrascrive cron.deny quindi tutti gli altri sono ammessi',
      'Dipende dalla shell di login di bob'
    ],
    a: 0,
    explain: `Se <code>cron.allow</code> esiste, ha la precedenza assoluta: solo gli utenti elencati in quel file possono usare <code>crontab</code>. Bob non è nella lista VIP → accesso negato. <code>cron.deny</code> viene ignorato quando esiste <code>cron.allow</code>. 🚦` },

  // ── 22. anacron ──────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔄', title: 'anacron: cron per chi spegne il PC',
    text: `<strong>anacron</strong> esegue job periodici anche se il sistema non era acceso all'orario previsto.<br>
<br>
Differenza chiave: cron salta il job se la macchina è spenta in quel momento. anacron lo esegue alla prossima accensione, se è passato il periodo minimo.<br>
<br>
Configurazione: <code>/etc/anacrontab</code><br>
Formato: <code>periodo  ritardo  job-id  comando</code><br>
<code>7   5   weekly.test   /etc/cron.weekly/test</code><br>
(ogni 7 giorni, con 5 minuti di ritardo, esegui il job)<br>
<br>
TRAPPOLA! anacron non gestisce job a orari specifici (non ha colonne ora/minuto). Lo usi per "ogni N giorni", non per "ogni giorno alle 02:00".`,
    analogy: `anacron è come un post-it sul frigorifero: "se non l'ho fatto negli ultimi 7 giorni, fallo appena posso". cron è l'allarme che suona all'ora esatta — se dormi, lo perdi.` },

  // ── 23. systemd timer ────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '⚙️', title: 'systemd timer: il cron moderno',
    text: `I <strong>systemd timer</strong> sono un'alternativa moderna a cron, integrata in systemd.<br>
<br>
Ogni timer ha due file: un <code>.timer</code> e un <code>.service</code> associato.<br>
<br>
Esempio <code>backup.timer</code>:<br>
<code>[Timer]<br>
OnCalendar=Mon 02:00<br>
Persistent=true<br>
[Install]<br>
WantedBy=timers.target</code><br>
<br>
Comandi:<br>
• <code>systemctl list-timers</code> — lista tutti i timer attivi con prossima esecuzione<br>
• <code>systemctl enable --now backup.timer</code> — abilita e avvia il timer<br>
• <code>Persistent=true</code> — come anacron: esegue al boot se il momento è passato<br>
<br>
TRAPPOLA! Un timer da solo non fa nulla: deve esistere il .service associato con lo stesso nome.`,
    analogy: `Il timer systemd è come programmare Alexa: "ogni lunedì alle 2 avvia il robot aspirapolvere (il .service)". Il robot senza il programma non parte mai.` },

  // ── 24. Quiz: systemd timer ───────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando mostra tutti i systemd timer attivi con l\'orario della prossima esecuzione?',
    opts: [
      'systemctl list-timers',
      'systemctl list-units --type=timer',
      'journalctl --timers',
      'crontab -l --systemd'
    ],
    a: 0,
    explain: `<code>systemctl list-timers</code> mostra NEXT (prossima esecuzione), LAST (ultima) e il nome del timer. <code>list-units --type=timer</code> lista i timer ma senza le colonne NEXT/LAST. <code>journalctl</code> mostra i log, non i timer pianificati. ⚙️` },

  // ── 25. locale ────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🌍', title: 'locale: lingua e formato regionale',
    text: `Le variabili <strong>locale</strong> controllano lingua, formato date, separatori decimali, ordinamento...<br>
<br>
Variabili principali:<br>
• <code>LANG</code> — locale di default per tutto<br>
• <code>LC_ALL</code> — sovrascrive TUTTO (priorità massima)<br>
• <code>LC_TIME</code> — formato data/ora<br>
• <code>LC_NUMERIC</code> — separatori numerici<br>
• <code>LC_MESSAGES</code> — lingua dei messaggi di sistema<br>
• <code>LC_CTYPE</code> — classificazione caratteri (UTF-8 o meno)<br>
<br>
Formato: <code>it_IT.UTF-8</code> = italiano Italia, codifica UTF-8<br>
<br>
Comandi:<br>
• <code>locale</code> — mostra le variabili attuali<br>
• <code>localectl</code> — imposta la locale di sistema (con systemd)<br>
• <code>localectl set-locale LANG=it_IT.UTF-8</code>`,
    analogy: `Le variabili locale sono come le impostazioni regionali del tuo telefono: stessa applicazione, ma la data appare "17 giugno 2026" o "June 17, 2026" a seconda di dove vivi.` },

  // ── 26. Terminal: locale ─────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🌍', title: 'Le tue variabili locale',
    cmd: 'locale',
    out: `LANG=it_IT.UTF-8
LC_CTYPE="it_IT.UTF-8"
LC_NUMERIC="it_IT.UTF-8"
LC_TIME="it_IT.UTF-8"
LC_COLLATE="it_IT.UTF-8"
LC_MONETARY="it_IT.UTF-8"
LC_MESSAGES="it_IT.UTF-8"
LC_ALL=` },

  // ── 27. Quiz: LANG vs LC_ALL ──────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale variabile locale ha la priorità MASSIMA e sovrascrive tutte le altre?',
    opts: ['LC_ALL', 'LANG', 'LC_MESSAGES', 'LANGUAGE'],
    a: 0,
    explain: `Gerarchia: <strong>LC_ALL</strong> > singole LC_* > LANG. Se LC_ALL è impostata, sovrascrive ogni altra variabile locale senza eccezioni. LANG è il default per tutte le categorie non impostate singolarmente. LANGUAGE è usata da gettext per i messaggi (non standard POSIX). 🌍` },

  // ── 28. Timezone ──────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🕐', title: 'Timezone: imposta il fuso orario',
    text: `Il fuso orario di sistema si gestisce con <code>timedatectl</code>:<br>
<br>
• <code>timedatectl</code> — mostra data/ora, timezone, NTP<br>
• <code>timedatectl list-timezones | grep Europe</code> — cerca timezone<br>
• <code>timedatectl set-timezone Europe/Rome</code> — imposta il fuso<br>
<br>
Sotto il cofano: crea un symlink <code>/etc/localtime → /usr/share/zoneinfo/Europe/Rome</code><br>
<br>
File coinvolti:<br>
• <code>/etc/localtime</code> — symlink al timezone attivo<br>
• <code>/usr/share/zoneinfo/</code> — database di tutti i timezone<br>
• <code>/etc/timezone</code> — su Debian/Ubuntu: contiene il nome del timezone come testo<br>
<br>
TRAPPOLA! Modificare solo /etc/localtime non persiste su tutte le distro. Usa sempre <code>timedatectl</code>.`,
    analogy: `<code>/etc/localtime</code> è come l'orologio da parete del condominio: <code>timedatectl</code> è il telecomando ufficiale per cambiare l'ora, aggiornando sia l'orologio che l'etichetta con il fuso.` },

  // ── 29. Quiz: timedatectl ─────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale file è un symlink che punta al timezone attivo del sistema?',
    opts: ['/etc/localtime', '/etc/timezone', '/usr/share/zoneinfo/current', '/etc/timedatectl'],
    a: 0,
    explain: `<code>/etc/localtime</code> è il symlink standard: punta a qualcosa tipo <code>/usr/share/zoneinfo/Europe/Rome</code>. <code>/etc/timezone</code> esiste su Debian/Ubuntu come file di testo con il nome del timezone. <code>/usr/share/zoneinfo/</code> è la directory con tutti i dati, non il timezone attivo. 🕐` },

  // ── 30. Fun fact: iconv ───────────────────────────────────────────────────────
  { type: 'fact', emoji: '🔤', title: 'iconv: traduci tra codifiche',
    text: `<code>iconv</code> converte file tra codifiche di caratteri.<br>
<code>iconv -f ISO-8859-1 -t UTF-8 file_vecchio.txt > file_nuovo.txt</code><br>
<code>iconv -l</code> — lista tutte le codifiche supportate<br>
<br>
Nel 2026 quasi tutto è già UTF-8, ma l'esame LPIC-1 chiede ancora iconv per convertire file legacy (Windows-1252, ISO-8859-1, Big5...). Sappi che esiste e sai usarlo.` },

  // ── 31. Ripasso Lampo ─────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🧩', title: '🧩 RIPASSO LAMPO — Modulo 7',
    text: `• <code>/etc/passwd</code>: 7 campi, password è sempre <code>x</code> · <code>/etc/shadow</code>: hash veri, solo root<br>
• <code>/etc/group</code>: 4 campi · <code>id</code> mostra UID+GID+gruppi<br>
• <code>useradd -m -s /bin/bash -G wheel nome</code> · <code>usermod -aG docker nome</code> (mai senza -a!)<br>
• <code>userdel -r nome</code> rimuove utente + home · <code>usermod -L/-U</code> blocca/sblocca<br>
• cron = ripetitivo (<code>crontab -e</code>) · at = una tantum (<code>atq</code>, <code>atrm</code>)<br>
• crontab: min ora dom mese dow · dom=0 domenica (anche 7!) · <code>*/5</code> = ogni 5<br>
• anacron = cron per macchine non sempre accese · systemd timer = alternativa moderna<br>
• <code>LC_ALL</code> sovrascrive tutto · <code>LANG</code> = default generale<br>
• <code>timedatectl set-timezone Europe/Rome</code> · <code>/etc/localtime</code> = symlink attivo` },

  // ── 32. Quiz: finale utenti ──────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando rimuove l\'utente "bob" E la sua home directory?',
    opts: ['userdel -r bob', 'userdel bob', 'usermod -d /dev/null bob', 'rmuser -home bob'],
    a: 0,
    explain: `<code>userdel -r bob</code>: <strong>-r</strong> rimuove anche la home e la mail spool. Senza <strong>-r</strong>, la home rimane su disco. <code>usermod</code> modifica, non elimina. <code>rmuser</code> non esiste in Linux (è BSD). 🗑️` },

  // ── 33. input: crontab ────────────────────────────────────────────────────────
  { type: 'input', q: 'Quale opzione di crontab apre l\'editor per modificare i job dell\'utente corrente?',
    accept: ['crontab -e', '-e'],
    placeholder: 'crontab ...',
    explain: `<code>crontab -e</code> apre l'editor (di solito vi o nano). <code>-l</code> lista, <code>-r</code> rimuove tutta la crontab. <code>-u nome</code> specifica l'utente (solo root). Ricorda: <code>-r</code> senza conferma distrugge tutto — trappola classica! ⏰` },

  // ── 34. Missione: gestione utenti ────────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: crea e gestisci un utente di test',
    text: `Crea un utente temporaneo, aggiungilo a un gruppo, blocca l'account, poi eliminalo con la sua home.`,
    solution: `# 1. Crea utente con home e bash
sudo useradd -m -s /bin/bash -c "Utente Test" testuser

# 2. Imposta password
sudo passwd testuser

# 3. Aggiungi al gruppo wheel (senza rimuovere altri gruppi)
sudo usermod -aG wheel testuser

# 4. Verifica
id testuser
getent passwd testuser

# 5. Blocca l'account
sudo usermod -L testuser
# La voce in /etc/shadow avrà ! davanti all'hash

# 6. Sblocca
sudo usermod -U testuser

# 7. Rimuovi utente e home
sudo userdel -r testuser` },

  // ── 35. Missione: job pianificati ────────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: programma e ispeziona job',
    text: `Crea un job cron che scrive la data corrente in un file ogni 2 minuti, poi pianifica un job at tra 5 minuti.`,
    solution: `# 1. Apri il tuo crontab
crontab -e

# Aggiungi questa riga (ogni 2 minuti):
*/2 * * * * date >> /tmp/crontest.log

# 2. Verifica che sia salvato
crontab -l

# 3. Pianifica un job at tra 5 minuti
echo "echo 'ciao da at' >> /tmp/attest.log" | at now + 5 minutes

# 4. Controlla la coda at
atq

# 5. Dopo i 5 minuti, verifica i log
cat /tmp/crontest.log
cat /tmp/attest.log

# 6. Rimuovi il job cron quando vuoi
crontab -r    # ATTENZIONE: rimuove TUTTA la crontab
# oppure crontab -e e cancella solo quella riga` },

  // ── 36. Missione: locale e timezone ──────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: esplora locale e timezone',
    text: `Ispeziona le impostazioni di localizzazione del tuo CachyOS e prova a vedere come cambia l'output con una locale diversa.`,
    solution: `# Variabili locale correnti
locale

# Timezone e ora di sistema
timedatectl

# Lista timezone europei
timedatectl list-timezones | grep Europe

# Symlink timezone attivo
ls -la /etc/localtime

# Prova una locale diversa TEMPORANEAMENTE (solo per il comando)
LANG=en_US.UTF-8 date
LANG=it_IT.UTF-8 date

# Lista locali generate sul sistema
locale -a

# Converti un file di testo da latin1 a utf-8 (esempio)
# echo "tèst" | iconv -f UTF-8 -t ISO-8859-1 | iconv -f ISO-8859-1 -t UTF-8` },

];
