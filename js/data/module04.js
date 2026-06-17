/* ═══════════ MODULO 4 — Dischi & Filesystem ═══════════
   Obiettivi LPI: 104.1–104.7
   Card totali: 41 (12 quiz + 1 input + 3 missioni) */
'use strict';

const MODULE04 = [

  // ── 1. Benvenuto ────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '💾', title: 'Modulo 4: Dischi & Filesystem',
    text: `In questo modulo impari a <strong>gestire dischi, partizioni e permessi</strong> — il cuore dell'amministrazione Linux.<br>
Imparerai a:<br>
• dividere un disco in partizioni (MBR vs GPT)<br>
• creare e montare filesystem (<code>mkfs</code>, <code>mount</code>, <code>fstab</code>)<br>
• controllare lo spazio e riparare dischi (<code>df</code>, <code>du</code>, <code>fsck</code>)<br>
• impostare permessi e proprietà (<code>chmod</code>, <code>chown</code>)<br>
• creare hard link e soft link<br>
• trovare file nel sistema (<code>find</code>, <code>locate</code>)`,
    analogy: `Un disco è come un appartamento grezzo: prima lo dividi in stanze (partizioni), poi arredi ogni stanza (filesystem), poi dai le chiavi solo a chi ne ha diritto (permessi).` },

  // ── 2. FHS ──────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🗺️', title: 'FHS — la mappa di Linux',
    text: `Il <strong>Filesystem Hierarchy Standard</strong> definisce dove devono stare le cose. Directory principali:<br>
• <code>/</code> — radice di tutto<br>
• <code>/bin</code>, <code>/usr/bin</code> — comandi utente<br>
• <code>/sbin</code>, <code>/usr/sbin</code> — comandi di sistema (root)<br>
• <code>/etc</code> — file di configurazione<br>
• <code>/home</code> — directory utenti<br>
• <code>/var</code> — dati variabili (log, spool, mail)<br>
• <code>/tmp</code> — file temporanei (cancellati al riavvio)<br>
• <code>/dev</code> — file dispositivo<br>
• <code>/proc</code>, <code>/sys</code> — filesystem virtuali del kernel<br>
• <code>/boot</code> — kernel e bootloader`,
    analogy: `FHS è il catasto di Linux: ogni cosa ha il suo indirizzo preciso. /etc è l'ufficio anagrafe, /home è il quartiere residenziale, /tmp è il parcheggio temporaneo che svuotano ogni mattina.` },

  // ── 3. Terminal: ls / ───────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🗂️', title: 'FHS in azione',
    cmd: 'ls /',
    out: `bin   boot  dev  etc  home  lib  lib64  lost+found
mnt   opt   proc  root  run   srv   sys   tmp   usr   var` },

  // ── 4. /dev e nomi dei dischi ───────────────────────────────────────────────
  { type: 'lesson', emoji: '💿', title: 'I file dispositivo: /dev',
    text: `In Linux ogni hardware è rappresentato da un <strong>file in <code>/dev</code></strong>. I dischi seguono una convenzione:<br>
• <code>/dev/sda</code> = primo disco SATA/SCSI/USB<br>
• <code>/dev/sdb</code> = secondo disco<br>
• <code>/dev/sda1</code>, <code>/dev/sda2</code> = partizioni<br>
• <code>/dev/nvme0n1</code> = primo disco NVMe (es. il tuo SSD CachyOS)<br>
• <code>/dev/nvme0n1p1</code> = prima partizione NVMe<br>
<br>
Dischi IDE (vecchi): <code>/dev/hda</code> — non li vedrai più quasi mai.`,
    analogy: `È come un condominio: /dev/sda è il palazzo, /dev/sda1 è l'appartamento 1, /dev/sda2 il 2. Il palazzo NVMe ha un nome più lungo ma il concetto è identico.` },

  // ── 5. Terminal: lsblk ──────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔍', title: 'Vedi tutti i dischi',
    cmd: 'lsblk',
    out: `NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
nvme0n1     259:0    0 953.9G  0 disk
├─nvme0n1p1 259:1    0   512M  0 part /boot/efi
├─nvme0n1p2 259:2    0     8G  0 part [SWAP]
└─nvme0n1p3 259:3    0 945.4G  0 part /
sda           8:0    0   1.8T  0 disk
└─sda1        8:1    0   1.8T  0 part /data` },

  // ── 6. Quiz: /dev naming ────────────────────────────────────────────────────
  { type: 'quiz', q: 'Il secondo disco SATA e la sua prima partizione si chiamano rispettivamente:',
    opts: ['/dev/sdb e /dev/sdb1', '/dev/hdb e /dev/hdb1', '/dev/sda2 e /dev/sda2p1', '/dev/disk2 e /dev/disk2s1'],
    a: 0,
    explain: `Su Linux moderno i dischi SATA/USB si chiamano /dev/sd[a-z]: il primo è sda, il secondo sdb. Le partizioni si numerano: sdb1, sdb2... /dev/hd* era per i vecchi dischi IDE. Le altre forme non esistono su Linux standard. 💿` },

  // ── 7. Partizionare — MBR vs GPT ────────────────────────────────────────────
  { type: 'lesson', emoji: '✂️', title: 'Partizioni: MBR vs GPT',
    text: `Prima di formattare serve <strong>partizionare</strong> il disco. I due schemi:<br>
• <strong>MBR</strong> (vecchio): max 4 partizioni primarie, max 2 TB per disco<br>
• <strong>GPT</strong> (moderno): 128 partizioni, dischi enormi, richiesto da UEFI<br>
<br>
Strumenti:<br>
• <code>fdisk</code> — gestisce MBR e GPT (default su molte distro)<br>
• <code>gdisk</code> — ottimizzato per GPT<br>
• <code>parted</code> — supporta entrambi, utile in script<br>
<br>
TRAPPOLA! All'esame: per GPT puro si usa <code>gdisk</code>. <code>fdisk</code> oggi supporta GPT ma la domanda classica associa GPT → gdisk.`,
    analogy: `MBR è il vecchio piano urbanistico: massimo 4 villette per lotto e non funziona su terreni grandi. GPT è il piano moderno: 128 appartamenti e nessun limite di dimensione.` },

  // ── 8. mkfs ─────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔨', title: 'mkfs — crea un filesystem',
    text: `Dopo aver partizionato si <strong>crea il filesystem</strong>. Comandi principali:<br>
• <code>mkfs.ext4 /dev/sdb1</code> — ext4, il filesystem Linux per eccellenza<br>
• <code>mkfs.xfs /dev/sdb1</code> — XFS, default su Red Hat / Fedora<br>
• <code>mkfs.vfat /dev/sdb1</code> — FAT32 (pendrive, compatibilità Windows)<br>
• <code>mkfs.btrfs /dev/sdb1</code> — Btrfs (snapshot, usato su CachyOS root)<br>
• <code>mkswap /dev/sdb2</code> — area di swap (non è un filesystem tradizionale)<br>
<br>
TRAPPOLA! <code>mkfs -t ext4</code> e <code>mkfs.ext4</code> sono <strong>equivalenti</strong>.`,
    analogy: `Partizionare è costruire le stanze. mkfs è posare il parquet: scegli il tipo (ext4, xfs, btrfs) in base all'uso della stanza.` },

  // ── 9. Terminal: mkfs.ext4 ──────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔨', title: 'Formatta una partizione ext4',
    cmd: 'mkfs.ext4 /dev/sdb1',
    out: `mke2fs 1.47.0 (5-Feb-2023)
Creating filesystem with 262144 4k blocks and 65536 inodes
Filesystem UUID: a3f1b2c4-1234-5678-abcd-ef0123456789
Superblock backups stored on blocks:
        32768, 98304, 163840, 229376

Allocating group tables: done
Writing inode tables: done
Creating journal (8192 blocks): done
Writing superblocks and filesystem accounting information: done` },

  // ── 10. Quiz: mkfs ──────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando crea un filesystem XFS su /dev/sdc1?',
    opts: ['mkfs.xfs /dev/sdc1', 'mkfs -xfs /dev/sdc1', 'format xfs /dev/sdc1', 'newfs /dev/sdc1'],
    a: 0,
    explain: `Il pattern è sempre <strong>mkfs.&lt;tipo&gt; &lt;dispositivo&gt;</strong>. La variante con -t è mkfs -t xfs, non mkfs -xfs. "format" e "newfs" non esistono su Linux standard. 🔨` },

  // ── 11. mount e umount ───────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔗', title: 'mount — agganciare il filesystem',
    text: `Un disco formattato non è accessibile finché non viene <strong>montato</strong> su una directory (<em>mount point</em>).<br>
• <code>mount /dev/sdb1 /mnt/dati</code> — monta<br>
• <code>mount -t ext4 /dev/sdb1 /mnt/dati</code> — specifica il tipo<br>
• <code>mount -o ro /dev/sdb1 /mnt/dati</code> — solo lettura<br>
• <code>umount /mnt/dati</code> — smonta (attenzione: <strong>umount</strong>, non "unmount"!)<br>
• <code>mount</code> senza argomenti — elenca tutto ciò che è montato<br>
<br>
TRAPPOLA! Non puoi smontare un filesystem se ci sei dentro o se un processo lo usa. Per trovare il colpevole: <code>lsof +D /mnt/dati</code> o <code>fuser -m /mnt/dati</code>.`,
    analogy: `Montare è come collegare un disco esterno al PC: finché non lo colleghi, il sistema non lo vede. E non puoi scollegarlo (smontarlo) mentre stai ancora lavorando sopra.` },

  // ── 12. Terminal: mount ─────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔗', title: 'Monta e verifica',
    cmd: 'mount /dev/sdb1 /mnt/dati && mount | grep sdb',
    out: `/dev/sdb1 on /mnt/dati type ext4 (rw,relatime)` },

  // ── 13. Quiz: umount busy ────────────────────────────────────────────────────
  { type: 'quiz', q: 'Esegui "umount /mnt/dati" e ricevi "target is busy". Cosa significa?',
    opts: [
      'Un processo usa il filesystem o la tua shell è dentro quella directory',
      'Il filesystem è corrotto e va riparato con fsck prima di smontare',
      'Il filesystem è montato in sola lettura e non può essere smontato',
      'Solo root può smontare filesystem montati dall\'utente'
    ],
    a: 0,
    explain: `"Target is busy" = qualcosa tiene aperto un file nel filesystem, o la tua shell ha quella directory come working directory (cd /mnt/dati). Soluzione: usa "fuser -m /mnt/dati" per trovare il processo, poi spostati altrove o killalo. 🔗` },

  // ── 14. /etc/fstab ──────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '📋', title: '/etc/fstab — montaggio automatico',
    text: `<code>/etc/fstab</code> dice al sistema cosa montare all'avvio. Ogni riga ha <strong>6 campi</strong>:<br>
<code>&lt;dispositivo&gt;  &lt;mountpoint&gt;  &lt;tipo&gt;  &lt;opzioni&gt;  &lt;dump&gt;  &lt;pass&gt;</code><br>
<br>
Esempio reale:<br>
<code>UUID=a3f1b2c4-...  /mnt/dati  ext4  defaults  0  2</code><br>
<br>
• Usa <strong>UUID</strong> invece di /dev/sdb1 (l'UUID non cambia se sposti i cavi)<br>
• <strong>dump</strong> (5° campo): quasi sempre 0<br>
• <strong>pass</strong> (6° campo): 0=skip fsck, <strong>1=root</strong>, 2=altri<br>
• <code>mount -a</code> rimonta tutto quello che sta in fstab`,
    analogy: `fstab è la lista della spesa automatica del sistema: all'avvio Linux la legge e monta tutto. UUID è il codice fiscale del disco: non cambia mai, anche se cambi cavo o porta.` },

  // ── 15. Quiz: fstab pass ────────────────────────────────────────────────────
  { type: 'quiz', q: 'Nel sesto campo di /etc/fstab, cosa indica il valore "1"?',
    opts: [
      'Il filesystem è la root / e viene controllato da fsck per primo',
      'Il filesystem viene montato con priorità alta',
      'Il filesystem è montato in sola lettura',
      'Il filesystem non viene mai controllato da fsck'
    ],
    a: 0,
    explain: `Il sesto campo è "pass": 0=fsck disabilitato, 1=root (controllato per primo all'avvio), 2=tutti gli altri filesystem (controllati dopo). Il valore 0 nel quinto campo (dump) significa che il filesystem non viene incluso nei backup con dump. 📋` },

  // ── 16. Fun fact: /lost+found ────────────────────────────────────────────────
  { type: 'fact', emoji: '📁', title: 'A cosa serve /lost+found?',
    text: `Ogni filesystem ext2/3/4 ha una directory <code>/lost+found</code>. Quando fsck trova pezzi di file senza nome (inode orfani dopo un crash), li recupera lì con un numero come nome — tipo <code>/lost+found/12345</code>. Non è un posto dove si perdono le chiavi: è il pronto soccorso del filesystem. Su XFS non c'è: usa un meccanismo diverso basato sul journal.` },

  // ── 17. df e du ─────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '📊', title: 'df e du — quanto spazio ho?',
    text: `<code>df</code> (disk free) mostra lo spazio di ogni <strong>filesystem montato</strong>:<br>
• <code>df -h</code> — output leggibile (GB, MB)<br>
• <code>df -T</code> — mostra anche il tipo di filesystem<br>
• <code>df -i</code> — mostra l'uso degli inode<br>
<br>
<code>du</code> (disk usage) mostra quanto occupa una <strong>directory</strong>:<br>
• <code>du -sh /home/lore</code> — totale leggibile<br>
• <code>du -h --max-depth=1 /</code> — dimensione delle prime directory<br>
<br>
TRAPPOLA! <code>df</code> = filesystem intero, <code>du</code> = directory specifica.`,
    analogy: `df è come il contatore generale dell'edificio (quanto rimane in tutto). du è come pesare i bagagli di ogni singolo inquilino.` },

  // ── 18. Terminal: df -h ──────────────────────────────────────────────────────
  { type: 'terminal', emoji: '📊', title: 'Spazio sui filesystem',
    cmd: 'df -h',
    out: `Filesystem      Size  Used Avail Use% Mounted on
dev             7.7G     0  7.7G   0% /dev
tmpfs           7.8G  1.3M  7.8G   1% /run
/dev/nvme0n1p3  946G  128G  818G  14% /
tmpfs           7.8G  2.1G  5.7G  27% /dev/shm
/dev/nvme0n1p1  511M   76M  436M  15% /boot/efi
/dev/sda1       1.8T  440G  1.4T  24% /data` },

  // ── 19. fsck ─────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🩺', title: 'fsck — il dottore del disco',
    text: `<code>fsck</code> controlla e ripara un filesystem. Regola d'oro:<br>
<strong>Il filesystem DEVE essere smontato prima di eseguire fsck!</strong><br>
<br>
Varianti per tipo: <code>fsck.ext4</code>, <code>fsck.xfs</code>.<br>
Opzioni utili:<br>
• <code>-n</code> — solo lettura, non modifica nulla<br>
• <code>-y</code> — risponde sì a tutto (pericoloso!)<br>
• <code>-f</code> — forza il controllo anche se il filesystem sembra ok<br>
<br>
La partizione root <code>/</code> è un'eccezione: fsck la controlla al boot, prima che venga rimontata in lettura/scrittura.<br>
<br>
TRAPPOLA! <code>fsck /dev/sda1</code> mentre è montato = corruzione garantita.`,
    analogy: `fsck è come il meccanico che smonta il motore per ripararlo. Non si ripara il motore mentre l'auto è in corsa: prima si parcheggia (si smonta il filesystem).` },

  // ── 20. Quiz: fsck ───────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Vuoi riparare il filesystem su /dev/sdb1. Qual è il prerequisito fondamentale?',
    opts: [
      'Il filesystem deve essere smontato con umount',
      'Devi essere root, ma puoi lasciarlo montato',
      'Devi prima eseguire df -h per verificare lo spazio',
      'Il filesystem deve essere di tipo ext4'
    ],
    a: 0,
    explain: `fsck su un filesystem montato può corrompere i dati: il kernel e fsck scriverebbero contemporaneamente le strutture interne del disco. Smonta SEMPRE con umount prima. L'unica eccezione è / che fsck controlla al boot prima di rimontarla in RW. 🩺` },

  // ── 21. chmod ottale ─────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔐', title: 'chmod — permessi in ottale',
    text: `Ogni file ha permessi per <strong>u</strong>ser (proprietario), <strong>g</strong>roup e <strong>o</strong>ther. I bit valgono:<br>
<strong>r = 4, w = 2, x = 1</strong> — si sommano: 7=rwx, 6=rw-, 5=r-x, 4=r--<br>
<br>
Esempi:<br>
• <code>chmod 755 file</code> → u:rwx g:r-x o:r-x (script eseguibile da tutti)<br>
• <code>chmod 644 file</code> → u:rw- g:r-- o:r-- (file normale)<br>
• <code>chmod 600 file</code> → u:rw- g:--- o:--- (privato)<br>
<br>
Forma simbolica (alternativa):<br>
• <code>chmod u+x file</code> — aggiunge x al proprietario<br>
• <code>chmod go-w file</code> — rimuove w da gruppo e altri<br>
• <code>chmod a+r file</code> — aggiunge r a tutti (a=all)`,
    analogy: `I permessi ottali sono tre lucchetti sovrapposti: il proprietario ha r(4)+w(2)+x(1)=7, il gruppo ha r(4)+x(1)=5, gli altri solo r(4)=4. Addizioni diverse per ogni serratura.` },

  // ── 22. Terminal: chmod ──────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔐', title: 'chmod in azione',
    cmd: 'ls -l script.sh && chmod 755 script.sh && ls -l script.sh',
    out: `-rw-r--r-- 1 lore lore 48 Jun 12 10:00 script.sh
-rwxr-xr-x 1 lore lore 48 Jun 12 10:00 script.sh` },

  // ── 23. Quiz: chmod 644 ──────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quali permessi ottali corrispondono a "rw-r--r--"?',
    opts: ['644', '755', '666', '600'],
    a: 0,
    explain: `rw- = r(4)+w(2) = 6. r-- = r(4) = 4. r-- = 4. Risultato: 644. 755 = rwxr-xr-x. 666 = rw-rw-rw-. 600 = rw------- (solo il proprietario può leggere e scrivere). 🔐` },

  // ── 24. chown ────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '👤', title: 'chown e chgrp',
    text: `<code>chown</code> cambia il <strong>proprietario</strong> (e opzionalmente il gruppo) di un file:<br>
• <code>chown lore file.txt</code> — cambia solo il proprietario<br>
• <code>chown lore:devs file.txt</code> — cambia proprietario E gruppo<br>
• <code>chown :devs file.txt</code> — cambia solo il gruppo<br>
• <code>chown -R lore:devs /var/www/</code> — ricorsivo su directory<br>
<br>
<code>chgrp devs file.txt</code> — cambia solo il gruppo (equivale a chown :devs)<br>
<br>
Solo <strong>root</strong> può cambiare il proprietario. Un utente normale può cambiare il gruppo solo ai propri file, e solo verso gruppi di cui fa parte.`,
    analogy: `chown è come cambiare il nome sul campanello. Solo il padrone di casa (root) può farlo su qualsiasi porta. Il proprietario può scegliere il condominio (gruppo), ma solo tra quelli in cui è già iscritto.` },

  // ── 25. Quiz: chown ──────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Come cambi ricorsivamente proprietario E gruppo di /var/www/ all\'utente "web" e gruppo "www-data"?',
    opts: [
      'chown -R web:www-data /var/www/',
      'chmod -R web:www-data /var/www/',
      'chown -R web /var/www/ && chown -R :www-data /var/www/',
      'Sia a) che c) sono corretti'
    ],
    a: 3,
    explain: `Sia "chown -R web:www-data /var/www/" che i due comandi separati producono lo stesso risultato. L'opzione b) usa chmod che gestisce i permessi, non la proprietà — errore classico da esame! La risposta è d) perché a) e c) sono entrambe valide. 👤` },

  // ── 26. SUID, SGID, Sticky ───────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔒', title: 'Permessi speciali: SUID, SGID, Sticky',
    text: `Tre bit speciali si aggiungono al fronte dei permessi ottali:<br>
<br>
<strong>SUID</strong> (4000): l'eseguibile gira con i permessi del <em>proprietario</em>, non di chi lo lancia. Ex: <code>passwd</code> è SUID root per poter scrivere /etc/shadow. Si vede come <strong>s</strong> al posto della x del proprietario: <code>-rw<strong>s</strong>r-xr-x</code><br>
<br>
<strong>SGID</strong> (2000): su file → gira con i permessi del <em>gruppo</em>. Su directory → i file creati dentro ereditano il gruppo della directory. Si vede come <strong>s</strong> al posto della x del gruppo: <code>-rwxr-<strong>s</strong>r-x</code><br>
<br>
<strong>Sticky bit</strong> (1000): su directory → solo il proprietario del file può cancellarlo. Si vede come <strong>t</strong> in fondo: <code>drwxrwxrw<strong>t</strong></code>`,
    analogy: `SUID è una carta magnetica aziendale: chiunque la usi entra con i permessi dell'azienda, non i propri. Il sticky bit su /tmp è come un parcheggio pubblico: puoi spostare solo la tua auto, non quella degli altri.` },

  // ── 27. Quiz: SUID ottale ────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale notazione ottale imposta il SUID su un file che ha già permessi 755?',
    opts: ['4755', '1755', '2755', '7755'],
    a: 0,
    explain: `SUID=4000, SGID=2000, Sticky=1000. Si sommano ai permessi normali: 4000+755=4755. 1755 = Sticky+755, 2755 = SGID+755. 7755 non esiste come notazione valida (7000 metterebbe tutti e tre i bit speciali). 🔒` },

  // ── 28. Fun fact: /tmp e sticky bit ─────────────────────────────────────────
  { type: 'fact', emoji: '📁', title: '/tmp ha il sticky bit — ecco perché',
    text: `Esegui <code>ls -ld /tmp</code> → vedrai <code>drwxrwxrwt</code>. La <strong>t</strong> finale è il sticky bit. Senza di esso, tutti potrebbero cancellare i file temporanei di tutti gli altri utenti — compresi i file di lock dei processi in esecuzione, causando crash e comportamenti imprevedibili. Il sticky bit è attivo anche su <code>/var/tmp</code>. Era usato sugli eseguibili negli anni '70 per tenerli in RAM: oggi ha senso solo sulle directory.` },

  // ── 29. Hard link e Soft link ────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔗', title: 'Hard link e Soft link',
    text: `Un <strong>hard link</strong> è un altro nome per lo stesso inode (stesso file fisico):<br>
<code>ln file.txt backup.txt</code><br>
• Solo sullo stesso filesystem<br>
• Non funziona su directory<br>
• Il file esiste finché almeno un hard link punta all'inode<br>
<br>
Un <strong>soft link</strong> (symlink) è un file speciale che contiene un percorso:<br>
<code>ln -s /etc/nginx/nginx.conf /home/lore/nginx.conf</code><br>
• Può attraversare filesystem diversi<br>
• Funziona su directory<br>
• Se il file originale viene cancellato → <em>dangling symlink</em> (link rotto)<br>
<br>
TRAPPOLA! Con hard link, cancellare il "file originale" non cancella i dati — l'inode resta finché tutti i link sono rimossi.`,
    analogy: `Hard link = due campanelli per lo stesso appartamento. Soft link = un cartello "vedi l'appartamento al piano 3". Se quel piano sparisce, il cartello punta al vuoto.` },

  // ── 30. Terminal: ln ─────────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔗', title: 'Hard link e soft link a confronto',
    cmd: 'ln file.txt hard.txt && ln -s file.txt soft.txt && ls -li',
    out: `131072 -rw-r--r-- 2 lore lore 42 Jun 12 file.txt
131072 -rw-r--r-- 2 lore lore 42 Jun 12 hard.txt
131073 lrwxrwxrwx 1 lore lore  8 Jun 12 soft.txt -> file.txt

# file.txt e hard.txt hanno lo stesso inode (131072)
# il contatore "2" indica due hard link allo stesso inode` },

  // ── 31. Quiz: link (affermazione FALSA) ─────────────────────────────────────
  { type: 'quiz', q: 'Quale delle seguenti affermazioni sui link è FALSA?',
    opts: [
      'Un hard link può puntare a una directory',
      'Un soft link può attraversare filesystem diversi',
      'Cancellare il file originale rompe un soft link',
      'Il numero di hard link di un file si vede con ls -l'
    ],
    a: 0,
    explain: `Gli hard link NON possono puntare a directory (il kernel lo vieta per evitare cicli nel filesystem che romperebbero find, du e il garbage collector degli inode). I symlink a directory invece sono comunissimi (es. /usr/local → /usr). Le altre tre affermazioni sono vere. 🔗` },

  // ── 32. find e locate ────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔍', title: 'find e locate — cercare file',
    text: `<code>find</code> cerca in <strong>tempo reale</strong> sul filesystem:<br>
• <code>find /etc -name '*.conf'</code> — per nome (glob)<br>
• <code>find / -type f -perm -4000</code> — file SUID<br>
• <code>find /home -size +10M</code> — file oltre 10 MB<br>
• <code>find /tmp -mtime -1</code> — modificati nelle ultime 24h<br>
• <code>find . -name '*.log' -exec rm {} \\;</code> — esegui comando su ogni risultato<br>
<br>
<code>locate nome</code> cerca in un <strong>database pre-costruito</strong> (velocissimo). Il database si aggiorna con <code>updatedb</code> (lanciato da cron di notte).<br>
<br>
TRAPPOLA! locate non trova file creati <em>dopo</em> l'ultimo updatedb.`,
    analogy: `find è il detective che perquisisce ogni stanza adesso. locate è l'archivio fotografico di ieri: rapidissimo, ma potrebbe non avere le novità di oggi.` },

  // ── 33. Terminal: find ───────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔍', title: 'find in azione',
    cmd: "find /etc -name '*.conf' -type f | head -6",
    out: `/etc/nsswitch.conf
/etc/host.conf
/etc/resolv.conf
/etc/locale.conf
/etc/mke2fs.conf
/etc/pacman.conf` },

  // ── 34. Quiz: find SUID ──────────────────────────────────────────────────────
  { type: 'quiz', q: 'Come trovi tutti i file SUID nel sistema?',
    opts: [
      'find / -type f -perm -4000',
      'find / -type f -perm 4000',
      'find / -suid -type f',
      'locate -perm -4000'
    ],
    a: 0,
    explain: `Il trattino in -perm -4000 significa "almeno questi bit impostati" (altri bit possono esserci). -perm 4000 senza trattino troverebbe solo file con ESATTAMENTE 4000 di permessi — praticamente nessuno. -suid non è un'opzione di find. locate non supporta filtri sui permessi. 🔍` },

  // ── 35. Ripasso Lampo ────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🧩', title: '🧩 RIPASSO LAMPO — Modulo 4',
    text: `• <code>lsblk</code> / <code>fdisk -l</code> → vedi dischi e partizioni<br>
• <code>mkfs.ext4 /dev/sdb1</code> → crea filesystem · <code>mkswap</code> per swap<br>
• <code>mount /dev/sdb1 /mnt/</code> → monta · <code>umount</code> → smonta<br>
• <code>/etc/fstab</code> → montaggio automatico (usa UUID, campo pass: 1=root, 2=altri)<br>
• <code>df -h</code> → spazio filesystem · <code>du -sh dir/</code> → dimensione directory<br>
• <code>fsck</code> → ripara disco — <strong>solo smontato!</strong><br>
• <code>chmod 755</code> (r=4 w=2 x=1) · SUID=4000 SGID=2000 Sticky=1000<br>
• <code>chown user:grp file</code> · <code>chown -R</code> per directory<br>
• <code>ln</code> hard link (stesso inode, stesso fs) · <code>ln -s</code> soft link<br>
• <code>find / -name x -type f</code> → cerca ora · <code>locate x</code> → cerca nel DB (updatedb)` },

  // ── 36. Quiz finale 1: fstab ─────────────────────────────────────────────────
  { type: 'quiz', q: 'L\'utente vuole che /dev/sdc1 sia montato su /data ad ogni avvio. Cosa modifica?',
    opts: ['/etc/fstab', '/etc/mtab', '/etc/mount.conf', '/proc/mounts'],
    a: 0,
    explain: `/etc/fstab è il file di configurazione per il montaggio automatico. /etc/mtab è una lista dei filesystem attualmente montati (generata automaticamente, non si modifica). /etc/mount.conf non esiste. /proc/mounts è una vista del kernel in sola lettura. 📋` },

  // ── 37. Quiz finale 2: chmod 750 ─────────────────────────────────────────────
  { type: 'quiz', q: 'Quale valore ottale corrisponde a "rwxr-x---"?',
    opts: ['750', '755', '740', '770'],
    a: 0,
    explain: `rwx = 4+2+1 = 7. r-x = 4+1 = 5. --- = 0. Risultato: 750. 755 = rwxr-xr-x (gli altri possono leggere). 740 = rwxr----- (il gruppo può solo leggere). 770 = rwxrwx--- (il gruppo ha anche la scrittura). 🔐` },

  // ── 38. Input: updatedb ──────────────────────────────────────────────────────
  { type: 'input', q: 'Quale comando aggiorna il database usato da locate?',
    accept: ['updatedb', 'sudo updatedb'],
    placeholder: 'scrivi il comando...',
    explain: `updatedb costruisce o aggiorna /var/lib/locate/mlocate.db (o /var/cache/plocate/plocate.db su Arch). Viene eseguito automaticamente da cron ogni notte. Se hai appena creato un file e locate non lo trova, lancia sudo updatedb. 🔍` },

  // ── 39. Missione 1: esplora i tuoi dischi ────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: esplora i tuoi dischi',
    text: `Sul tuo CachyOS, guarda la struttura reale dei tuoi dischi e partizioni. Quante partizioni hai? Qual è il tuo filesystem root?`,
    solution: `# Struttura dischi e partizioni
lsblk

# Dettagli con tipo filesystem
lsblk -f

# Oppure con dimensioni leggibili
lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINTS

# Spazio usato su ogni partizione montata
df -h` },

  // ── 40. Missione 2: permessi in pratica ──────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: permessi in pratica',
    text: `Crea un file di test, imposta permessi 644, poi aggiungi il bit eseguibile solo per il proprietario. Verifica con ls -l.`,
    solution: `touch /tmp/test_dojo.sh
chmod 644 /tmp/test_dojo.sh
ls -l /tmp/test_dojo.sh
# → -rw-r--r--

chmod u+x /tmp/test_dojo.sh
ls -l /tmp/test_dojo.sh
# → -rwxr--r--

# Alternativa ottale diretta:
chmod 744 /tmp/test_dojo.sh` },

  // ── 41. Missione 3: trova i SUID ─────────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: trova i file SUID',
    text: `Cerca tutti i file SUID nel tuo sistema. Troverai comandi come passwd, sudo, su, pkexec... Sono tutti lì per un motivo preciso.`,
    solution: `# Tutti i file SUID nel sistema
find / -type f -perm -4000 2>/dev/null

# Versione più leggibile
find / -type f -perm -4000 2>/dev/null | xargs ls -l 2>/dev/null

# Solo in /usr (più veloce, trova la maggior parte)
find /usr -type f -perm -4000 2>/dev/null` },

];
