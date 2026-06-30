/* ═══════════ MODULO 1 — Banca domande extra (drill + esami) ═══════════
   Domande aggiuntive per copertura completa Topic 101. Non compaiono nel
   feed-lezione: alimentano solo il drill 🎯 e i simulatori d'esame.
   Ogni card è ancorata a una fonte verificata (commento //src). */
'use strict';

const MODULE01_QUIZ = [

  // ── Boot / firmware ──────────────────────────────────────────────────────
  { type: 'quiz',
    q: 'Con quale filesystem è formattata la partizione ESP (EFI System Partition)?',
    opts: ['ext4', 'FAT32', 'NTFS', 'Btrfs'],
    a: 1,
    explain: `La <strong>ESP</strong> è formattata <strong>FAT32</strong>: è il formato che il firmware UEFI sa leggere per trovare i file <code>.efi</code> dei bootloader. 🥾` }, //src: module01.js "BIOS vs UEFI"

  { type: 'quiz',
    q: 'Il BIOS "classico" carica il bootloader leggendo quale parte del disco?',
    opts: ['La partizione ESP', 'Il primo settore (MBR, 512 byte)', 'La cartella /boot', 'La GPT'],
    a: 1,
    explain: `Il <strong>BIOS</strong> legge il primo settore del disco, l'<strong>MBR</strong> (512 byte). L'<strong>UEFI</strong> invece legge la partizione <strong>ESP</strong> (FAT32). 👴` }, //src: module01.js "BIOS vs UEFI"

  { type: 'quiz',
    q: 'In quale file si cambiano le impostazioni di GRUB prima di rigenerare la configurazione?',
    opts: ['/boot/grub/grub.cfg', '/etc/default/grub', '/etc/grub.conf', '/boot/grub/menu.lst'],
    a: 1,
    explain: `Le impostazioni si modificano in <strong>/etc/default/grub</strong>; poi si rigenera <code>grub.cfg</code> con grub-mkconfig. <code>/boot/grub/grub.cfg</code> NON va editato a mano. ⚙️` }, //src: module01.js "Il bootloader: GRUB"

  { type: 'input',
    q: 'Quale comando rigenera la configurazione di GRUB in /boot/grub/grub.cfg?',
    accept: ['grub-mkconfig -o /boot/grub/grub.cfg'],
    placeholder: 'comando completo...',
    explain: `<code>grub-mkconfig -o /boot/grub/grub.cfg</code> legge <code>/etc/default/grub</code> e gli script in <code>/etc/grub.d/</code> e scrive la configurazione finale. 🔄` }, //src: module01.js "Il bootloader: GRUB"

  { type: 'quiz',
    q: 'Quale parametro passato al kernel al boot avvia il sistema in modalità monoutente (emergenza)?',
    opts: ['quiet', 'single', 'ro', 'verbose'],
    a: 1,
    explain: `<code>single</code> (o il numero <code>1</code>) avvia in single user mode. <code>quiet</code> nasconde i messaggi, <code>ro</code>/<code>rw</code> montano il root in sola lettura/scrittura. 📣` }, //src: module01.js "Parlare col kernel al boot"

  { type: 'quiz',
    q: 'Vuoi vedere SOLO i messaggi del kernel relativi al boot CORRENTE. Cosa usi?',
    opts: ['journalctl -k -b', 'journalctl --all', 'dmesg --old', 'cat /var/log/kernel'],
    a: 0,
    explain: `<code>journalctl -k</code> mostra i messaggi del kernel (come <code>dmesg</code>); aggiungendo <code>-b</code> li limiti al boot corrente (<code>-b -1</code> sarebbe il boot precedente). 🩺` }, //src: module01.js "dmesg" + man journalctl (--boot)

  // ── initramfs ────────────────────────────────────────────────────────────
  { type: 'input',
    q: 'Su Arch/CachyOS, quale comando rigenera l\'immagine initramfs per il kernel "linux"?',
    accept: ['mkinitcpio -p linux', 'mkinitcpio -p linux-cachyos'],
    placeholder: 'mkinitcpio ...',
    explain: `Su Arch/CachyOS si usa <code>mkinitcpio -p linux</code> (preset). Su Debian/Ubuntu è <code>mkinitramfs</code>, su Fedora/RHEL <code>dracut</code>. 🥚` }, //src: module01.js "initrd e initramfs"

  // ── systemd: unit, verbi, target ─────────────────────────────────────────
  { type: 'quiz',
    q: 'Quale estensione hanno le unit di systemd che rappresentano i servizi?',
    opts: ['.target', '.service', '.timer', '.mount'],
    a: 1,
    explain: `I servizi sono unit <code>.service</code> (es. <code>sshd.service</code>). <code>.target</code> sono gruppi/stati, <code>.timer</code> esecuzioni programmate, <code>.mount</code> punti di mount. 🤵` }, //src: module01.js "systemd: il maggiordomo"

  { type: 'quiz',
    q: 'Hai modificato a mano un file .service. Quale comando fa rileggere la configurazione a systemd?',
    opts: ['systemctl daemon-reload', 'systemctl restart all', 'systemctl reboot', 'systemctl reset-failed'],
    a: 0,
    explain: `<code>systemctl daemon-reload</code> ricarica la configurazione del manager e ricostruisce l'albero delle dipendenze. Senza, systemd continua a usare la vecchia versione del file. 🔄` }, //src: module01.js "systemctl: altri 3 verbi" + man systemctl (daemon-reload)

  { type: 'quiz',
    q: 'Vuoi rendere IMPOSSIBILE avviare un servizio, anche manualmente. Quale comando è più forte di "disable"?',
    opts: ['systemctl stop', 'systemctl mask', 'systemctl kill', 'systemctl freeze'],
    a: 1,
    explain: `<code>systemctl mask</code> collega la unit a <code>/dev/null</code>: non si può avviare in alcun modo (né manualmente né come dipendenza). È più forte di <code>disable</code>. Si annulla con <code>unmask</code>. 🚫` }, //src: module01.js "systemctl: altri 3 verbi" + man systemctl (mask)

  { type: 'input',
    q: 'Quale sottocomando di systemctl dice SOLO se un servizio partirà al boot (senza avviarlo)?',
    accept: ['is-enabled', 'systemctl is-enabled'],
    placeholder: 'systemctl ...',
    explain: `<code>systemctl is-enabled sshd</code> stampa lo stato di avvio automatico (<code>enabled</code>/<code>disabled</code>/<code>masked</code>…) senza toccare lo stato attuale del servizio. ❓` }, //src: module01.js "systemctl: altri 3 verbi" + man systemctl (is-enabled)

  { type: 'quiz',
    q: 'Il vecchio runlevel 0 corrisponde a quale target systemd?',
    opts: ['poweroff.target', 'reboot.target', 'rescue.target', 'halt.target'],
    a: 0,
    explain: `Runlevel <strong>0</strong> = <strong>poweroff.target</strong> (spegnimento). Il <strong>6</strong> = <code>reboot.target</code> (riavvio). 🎯` }, //src: module01.js "Target e runlevel"

  { type: 'input',
    q: 'Quale sottocomando di systemctl mostra il target di avvio predefinito del sistema?',
    accept: ['get-default', 'systemctl get-default'],
    placeholder: 'systemctl ...',
    explain: `<code>systemctl get-default</code> mostra il target di boot (es. <code>graphical.target</code>). Per cambiarlo: <code>set-default</code>; per saltarci subito senza riavviare: <code>isolate</code>. 🎯` }, //src: module01.js "Vedere e cambiare target"

  // ── Spegnimento ──────────────────────────────────────────────────────────
  { type: 'input',
    q: 'Quale comando invia un messaggio di testo a TUTTI gli utenti attualmente connessi al sistema?',
    accept: ['wall', 'wall "messaggio"'],
    placeholder: 'comando...',
    explain: `<code>wall</code> (write all) trasmette un messaggio a tutti i terminali degli utenti loggati. <code>shutdown</code> lo usa internamente per avvisare di uno spegnimento programmato. 📢` }, //src: module01.js "Spegnere come un pro"

  // ── Processi ─────────────────────────────────────────────────────────────
  { type: 'quiz',
    q: 'Cosa indica il PPID di un processo?',
    opts: ['Il PID del processo padre che lo ha creato', 'La priorità del processo', 'Il PID del primo processo figlio', 'Il numero di thread del processo'],
    a: 0,
    explain: `Il <strong>PPID</strong> (Parent PID) è il PID del processo <strong>padre</strong> che ha generato il processo. Ogni processo nasce da un altro: è un albero che parte da PID 1. 👨‍👦` }, //src: module01.js "I processi"

  { type: 'quiz',
    q: 'Un processo padre muore lasciando dei figli ancora attivi. Chi "adotta" gli orfani?',
    opts: ['Il kernel li termina subito', 'Il processo con PID 1 (init/systemd)', 'Il processo con PID 0', 'Restano senza padre'],
    a: 1,
    explain: `Gli orfani vengono adottati da <strong>PID 1</strong> (init/systemd), il padre di tutti. Se invece muore PID 1 stesso → kernel panic. 👑` }, //src: module01.js "PID 1: il padre di tutti"

  { type: 'input',
    q: 'Quale comando mostra i processi in forma di albero genealogico (chi ha generato chi)?',
    accept: ['pstree'],
    placeholder: 'comando...',
    explain: `<code>pstree</code> disegna l'albero dei processi a partire da systemd(1). <code>pstree -p</code> aggiunge i PID. <code>ps aux</code> invece li elenca in tabella piatta. 🌳` }, //src: module01.js "Guarda l'albero dei processi"

  // ── /dev /proc /sys, udev, moduli ────────────────────────────────────────
  { type: 'quiz',
    q: 'Quale directory virtuale rappresenta l\'hardware così come lo vede il kernel, in forma ordinata?',
    opts: ['/dev', '/proc', '/sys', '/boot'],
    a: 2,
    explain: `<code>/sys</code> espone l'hardware visto dal kernel in modo strutturato. <code>/dev</code> contiene i file dei dispositivi, <code>/proc</code> processi e info kernel. ⚙️` }, //src: module01.js "Le 3 cartelle magiche"

  { type: 'quiz',
    q: 'Dove vuole "buttare via" l\'output un comando scritto come "comando 2> /dev/null"?',
    opts: ['In un file di log temporaneo', 'Nel dispositivo che scarta tutto (/dev/null)', 'Nella RAM di swap', 'Sullo standard output'],
    a: 1,
    explain: `<code>/dev/null</code> è il "buco nero": tutto ciò che ci scrivi viene scartato. <code>2&gt; /dev/null</code> manda lì lo <em>standard error</em> (gli errori). 🕳️` }, //src: module01.js "/dev/null: il buco nero"

  { type: 'quiz',
    q: 'Vuoi osservare in diretta gli eventi hardware gestiti da udev (collegamenti/scollegamenti). Quale comando?',
    opts: ['udevadm monitor', 'udev --watch', 'lsudev -f', 'systemctl status udev'],
    a: 0,
    explain: `<code>udevadm monitor</code> stampa in tempo reale gli eventi del kernel e di udev mentre colleghi/scolleghi dispositivi. Le regole personalizzate stanno in <code>/etc/udev/rules.d/</code>. 🚪` }, //src: module01.js "udev: il buttafuori" + man udevadm (monitor)

  { type: 'input',
    q: 'Quale comando scarica (rimuove) un modulo kernel insieme alle sue dipendenze inutilizzate?',
    accept: ['modprobe -r', 'modprobe -r nome', 'sudo modprobe -r'],
    placeholder: 'modprobe ...',
    explain: `<code>modprobe -r nome</code> rimuove il modulo e le dipendenze non più usate. <code>rmmod</code> è la versione primitiva senza gestione dipendenze; all'esame preferisci <code>modprobe</code>. 🧱` }, //src: module01.js "Moduli kernel: i LEGO"

  // ── dmidecode / lshw ─────────────────────────────────────────────────────
  { type: 'quiz',
    q: 'Quale comando dà un inventario hardware compatto (un dispositivo per riga) ma RICHIEDE i privilegi di root?',
    opts: ['lshw -short', 'lsblk', 'free -h', 'lscpu'],
    a: 0,
    explain: `<code>sudo lshw -short</code> elenca l'hardware in formato compatto. Come <code>dmidecode</code>, senza root mostra dati incompleti. <code>lsblk</code>/<code>lscpu</code>/<code>free</code> funzionano anche da utente normale. 🩻` }, //src: module01.js "dmidecode e lshw"

  // ── SysVinit ─────────────────────────────────────────────────────────────
  { type: 'quiz',
    q: 'In un sistema SysVinit, quale file definisce il runlevel di default (es. "id:3:initdefault:")?',
    opts: ['/etc/inittab', '/etc/init.d/default', '/etc/rc.local', '/etc/runlevel'],
    a: 0,
    explain: `<code>/etc/inittab</code> contiene la riga <code>id:N:initdefault:</code> che fissa il runlevel di avvio. Gli script dei servizi stanno in <code>/etc/init.d/</code>. 🏛️` }, //src: module01.js "SysVinit"

  { type: 'quiz',
    q: 'In SysVinit, quale comando cambia il runlevel SUBITO, senza riavviare?',
    opts: ['telinit 3', 'runlevel 3', 'service runlevel 3', 'init.d 3'],
    a: 0,
    explain: `<code>telinit 3</code> (o <code>init 3</code>) passa al runlevel 3 immediatamente. <code>runlevel</code> invece <em>mostra soltanto</em> il runlevel precedente e quello attuale, non lo cambia. 🏛️` }, //src: module01.js "SysVinit"

];
