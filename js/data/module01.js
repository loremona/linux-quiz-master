/* ═══════════ MODULO 1 — Com'è fatto Linux (LPIC-1 Topic 101) ═══════════ */
'use strict';

const MODULE01 = [

// ── Benvenuto ────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🥋', title: 'Benvenuto nel Dojo!',
  text: `Stai per capire <strong>come funziona Linux dentro</strong>: cosa succede quando premi il tasto di accensione, chi comanda i programmi, come il sistema parla con l'hardware.<br><br>È il <strong>Topic 101 dell'esame LPIC-1</strong>, e tu lo imparerai una card alla volta. Scorri in su. ⬆️`,
  analogy: `Linux è come un ristorante. In questo modulo conosci il personale: chi cucina, chi apre il locale la mattina, chi prende le ordinazioni.` },

// ── Kernel ───────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🧠', title: 'Il kernel: il capo di tutto',
  text: `Il <strong>kernel</strong> è il cuore di Linux. È un programma speciale che:<br><br>
  🔌 parla con l'hardware (CPU, RAM, disco, WiFi)<br>
  📋 decide quale programma usa la CPU e quando<br>
  🗂️ gestisce file e memoria<br><br>
  I programmi normali <strong>non toccano mai l'hardware direttamente</strong>: chiedono sempre al kernel.`,
  analogy: `Il kernel è il cuoco del ristorante. Tu (programma) non entri in cucina a farti la pasta: ordini al cuoco, e lui usa fornelli e pentole (hardware) per te.` },

{ type: 'lesson', emoji: '🚗', title: 'Kernel ≠ Distro',
  text: `<strong>Linux</strong>, tecnicamente, è SOLO il kernel.<br><br>
  Una <strong>distribuzione</strong> (Arch, CachyOS, Debian, Ubuntu...) è il kernel + tutto il resto: gestore pacchetti, desktop, programmi, configurazioni.<br><br>
  CachyOS = kernel Linux (ottimizzato) + pacman + KDE/altro + salsa segreta di Arch.`,
  analogy: `Il kernel è il motore. La distro è l'automobile completa: stesso motore, ma una Panda e una Ferrari sono esperienze diverse. CachyOS è l'auto sportiva con il motore truccato. 🏎️` },

{ type: 'fact', emoji: '🇫🇮', title: 'Un hobby diventato gigante',
  text: `Nel 1991 uno studente finlandese di 21 anni, <strong>Linus Torvalds</strong>, scrisse su internet: <em>"Sto facendo un sistema operativo (gratis), è solo un hobby, niente di grosso e professionale"</em>.<br><br>Oggi quel "hobby" fa girare il 100% dei top 500 supercomputer, quasi tutti i server del mondo e ogni telefono Android. 🤯` },

// ── Boot ─────────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '⏰', title: 'Il boot: la sveglia del PC',
  text: `Quando premi il tasto di accensione, succedono <strong>4 cose in fila</strong>:<br><br>
  1️⃣ <strong>BIOS/UEFI</strong> — il firmware della scheda madre si sveglia e controlla l'hardware<br>
  2️⃣ <strong>Bootloader</strong> (GRUB o systemd-boot) — trova il kernel sul disco e lo carica<br>
  3️⃣ <strong>Kernel</strong> — prende il controllo, riconosce l'hardware<br>
  4️⃣ <strong>init</strong> (oggi: <strong>systemd</strong>) — avvia tutti i servizi e arriva al login<br><br>
  Memorizza la sequenza: <strong>UEFI → bootloader → kernel → init</strong>. All'esame la chiedono SEMPRE.`,
  analogy: `La sveglia suona (UEFI), apri gli occhi (bootloader carica il kernel), il cervello si accende (kernel), poi parte la routine: caffè, doccia, vestiti (systemd avvia i servizi). ☕` },

{ type: 'quiz',
  q: 'Qual è l\'ordine corretto del boot di Linux?',
  opts: [
    'Kernel → UEFI → GRUB → systemd',
    'UEFI → GRUB → Kernel → systemd',
    'GRUB → UEFI → systemd → Kernel',
    'systemd → Kernel → GRUB → UEFI',
  ],
  a: 1,
  explain: `<strong>UEFI → bootloader (GRUB) → kernel → init (systemd)</strong>. Il firmware si sveglia per primo, il bootloader carica il kernel, il kernel avvia init/systemd che tira su tutto il resto. La sveglia → gli occhi → il cervello → la routine. ⏰` },

{ type: 'lesson', emoji: '🥾', title: 'BIOS vs UEFI',
  text: `Sono due generazioni dello stesso concetto: il <strong>firmware</strong> che parte appena accendi.<br><br>
  👴 <strong>BIOS</strong> — vecchio (anni '80), legge il primo settore del disco (<strong>MBR</strong>, 512 byte)<br>
  😎 <strong>UEFI</strong> — moderno, legge una partizione speciale chiamata <strong>ESP</strong> (EFI System Partition, formattata FAT32), supporta dischi enormi (<strong>GPT</strong>) e il Secure Boot<br><br>
  Il tuo CachyOS quasi sicuramente usa UEFI + GPT.`,
  analogy: `BIOS è il nonno che legge solo bigliettini di carta minuscoli (512 byte!). UEFI è il nipote con lo smartphone: legge una cartella intera di roba. 📱` },

{ type: 'terminal', emoji: '🔍', title: 'BIOS o UEFI? Scoprilo subito',
  text: `Se questa cartella esiste, sei in UEFI. Provalo sul tuo CachyOS:`,
  cmd: 'ls /sys/firmware/efi && echo "UEFI! 😎" || echo "BIOS 👴"',
  out: `config_table  efivars  esrt  fw_platform_size  fw_vendor
runtime  runtime-map  systab  vars
UEFI! 😎` },

{ type: 'lesson', emoji: '🍞', title: 'Il bootloader: GRUB',
  text: `Il <strong>bootloader</strong> è il programma che carica il kernel in RAM. Il più famoso è <strong>GRUB 2</strong>:<br><br>
  📜 config in <code>/boot/grub/grub.cfg</code> (NON si modifica a mano!)<br>
  ⚙️ le impostazioni si cambiano in <code>/etc/default/grub</code><br>
  🔄 poi si rigenera con <code>grub-mkconfig -o /boot/grub/grub.cfg</code><br><br>
  Alternative moderne: <strong>systemd-boot</strong> (semplice, solo UEFI — CachyOS lo usa spesso!) e rEFInd.`,
  analogy: `GRUB è il cameriere che ti porta il menu: "Quale sistema vuoi oggi? Linux normale, Linux fallback, Windows?" Tu scegli, lui va in cucina a chiamare il kernel giusto. 🍽️` },

{ type: 'lesson', emoji: '📣', title: 'Parlare col kernel al boot',
  text: `Al boot puoi passare <strong>parametri al kernel</strong> (dalla schermata di GRUB premendo <code>e</code>):<br><br>
  <code>quiet</code> — niente messaggi a schermo<br>
  <code>single</code> o <code>1</code> — modalità emergenza monoutente<br>
  <code>ro</code> / <code>rw</code> — root filesystem in sola lettura/scrittura<br><br>
  I parametri usati nell'ultimo boot sono visibili in <code>/proc/cmdline</code>.`,
  analogy: `È come bisbigliare istruzioni al cuoco prima che inizi a cucinare: "oggi niente rumore" (quiet), "cucina solo per me" (single). 🤫` },

{ type: 'quiz',
  q: 'Dove vedi i parametri passati al kernel nell\'ultimo boot?',
  opts: [
    '/etc/kernel/params',
    '/boot/grub/grub.cfg',
    '/proc/cmdline',
    'systemctl kernel-params',
  ],
  a: 2,
  explain: `<code>/proc/cmdline</code> contiene ESATTAMENTE la riga di comando con cui il kernel è stato avviato. <code>grub.cfg</code> contiene cosa GRUB <em>passerà</em> al prossimo boot, ma la prova di cosa è successo davvero sta in <code>/proc/cmdline</code>. 📣` },

{ type: 'terminal', emoji: '🩺', title: 'dmesg: il diario del kernel',
  text: `Il kernel scrive tutto quello che gli succede in un buffer. Si legge con <code>dmesg</code> (o <code>journalctl -k</code>):`,
  cmd: 'dmesg | head -5',
  out: `[0.000000] Linux version 6.12.4-cachyos (linux@cachyos)
[0.000000] Command line: BOOT_IMAGE=/vmlinuz-linux-cachyos quiet
[0.000000] BIOS-provided physical RAM map:
[0.001234] DMI: ASUS ROG STRIX...
[0.002456] tsc: Detected 3800.000 MHz processor` },

{ type: 'quiz',
  q: 'Vuoi vedere i messaggi del kernel del boot. Quali DUE comandi funzionano?',
  opts: [
    'dmesg — e anche journalctl -k',
    'bootlog — e anche kernellog',
    'cat /var/kernel.log — e anche klog',
    'systemctl boot-log — e anche initlog',
  ],
  a: 0,
  explain: `<strong>dmesg</strong> legge il ring buffer del kernel; <strong>journalctl -k</strong> mostra gli stessi messaggi presi dal journal di systemd (e con <code>-b</code> scegli quale boot). Gli altri comandi non esistono. 🩺` },

// ── systemd ──────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🤵', title: 'systemd: il maggiordomo',
  text: `Dopo il kernel parte <strong>init</strong>: il primo processo, il padre di tutti. Nelle distro moderne init è <strong>systemd</strong>.<br><br>systemd gestisce le <strong>unit</strong>:<br><br>
  🔧 <code>.service</code> — servizi (es. sshd, NetworkManager)<br>
  🎯 <code>.target</code> — gruppi di unit (stati del sistema)<br>
  ⏱️ <code>.timer</code> — cose programmate nel tempo<br>
  💾 <code>.mount</code> — punti di mount`,
  analogy: `systemd è il maggiordomo della villa: appena il padrone (kernel) si sveglia, lui accende le luci, apre le tende, avvia la macchina del caffè... ognuna è una "unit". 🏰` },

{ type: 'terminal', emoji: '🎛️', title: 'systemctl: il telecomando',
  text: `Tutti i servizi si comandano con <code>systemctl</code>. I 6 verbi da sapere a memoria: <code>start</code>, <code>stop</code>, <code>restart</code>, <code>status</code>, <code>enable</code>, <code>disable</code>.`,
  cmd: 'systemctl status sshd',
  out: `● sshd.service - OpenSSH Daemon
     Loaded: loaded (/usr/lib/systemd/system/sshd.service; enabled)
     Active: active (running) since Wed 2026-06-10 09:12:33
   Main PID: 812 (sshd)
      Tasks: 1
     Memory: 4.2M` },

{ type: 'lesson', emoji: '🔛', title: 'start vs enable (TRAPPOLA d\'esame!)',
  text: `Questa distinzione frega tutti:<br><br>
  ▶️ <code>systemctl start sshd</code> — lo avvia <strong>ADESSO</strong> (ma al riavvio non riparte)<br>
  🔁 <code>systemctl enable sshd</code> — lo avvia <strong>AD OGNI BOOT</strong> (ma non adesso)<br>
  ⚡ <code>systemctl enable --now sshd</code> — entrambe le cose!`,
  analogy: `start = accendere la luce ora. enable = mettere il timer che la accende ogni mattina. Sono due cose diverse: puoi avere la luce accesa senza timer, o il timer con la luce spenta. 💡` },

{ type: 'quiz',
  q: 'Vuoi che nginx parta SUBITO e anche ad ogni avvio. Cosa digiti?',
  opts: [
    'systemctl start nginx',
    'systemctl enable nginx',
    'systemctl enable --now nginx',
    'systemctl restart --boot nginx',
  ],
  a: 2,
  explain: `<code>enable --now</code> = enable (parte ad ogni boot) + start (parte subito) in un colpo solo. Solo <code>start</code> non sopravvive al riavvio; solo <code>enable</code> non lo avvia adesso. ⚡` },

// ── Target / runlevel ────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🎯', title: 'Target e runlevel: gli "stati" del sistema',
  text: `Il sistema può trovarsi in diversi <strong>stati</strong>. Una volta si chiamavano <strong>runlevel</strong> (numeri), oggi systemd usa i <strong>target</strong>. L'esame vuole la tabella di conversione:<br><br>
  <code>0</code> → <code>poweroff.target</code> 🔌 spento<br>
  <code>1</code> → <code>rescue.target</code> 🚑 emergenza monoutente<br>
  <code>3</code> → <code>multi-user.target</code> 💻 tutto attivo, NO grafica<br>
  <code>5</code> → <code>graphical.target</code> 🖥️ tutto + grafica<br>
  <code>6</code> → <code>reboot.target</code> 🔄 riavvio`,
  analogy: `Sono le modalità del ristorante: chiuso (0), solo il proprietario dentro a fare i conti (1), aperto ma solo asporto (3), aperto con sala e camerieri (5), "chiudiamo e riapriamo" (6). 🍕` },

{ type: 'terminal', emoji: '🎯', title: 'Vedere e cambiare target',
  text: `<code>get-default</code> mostra il target di avvio, <code>set-default</code> lo cambia, <code>isolate</code> ci salta SUBITO senza riavviare:`,
  cmd: 'systemctl get-default',
  out: `graphical.target

# per cambiare il default:
#   sudo systemctl set-default multi-user.target
# per saltarci ORA:
#   sudo systemctl isolate multi-user.target` },

{ type: 'quiz',
  q: 'Il vecchio "runlevel 5" in systemd corrisponde a...',
  opts: [
    'multi-user.target',
    'graphical.target',
    'rescue.target',
    'desktop.target',
  ],
  a: 1,
  explain: `Runlevel <strong>5</strong> = <strong>graphical.target</strong> (sistema completo CON interfaccia grafica). Il 3 è multi-user.target (senza grafica), l'1 è rescue.target. <code>desktop.target</code> non esiste: è un'esca. 🎣` },

{ type: 'quiz',
  q: 'Devi riparare il sistema da solo, senza altri utenti né servizi. Quale target?',
  opts: [
    'graphical.target',
    'multi-user.target',
    'rescue.target',
    'poweroff.target',
  ],
  a: 2,
  explain: `<strong>rescue.target</strong> (ex runlevel 1, "single user mode"): shell di root, servizi minimi, niente rete, niente altri utenti. È la modalità ambulanza. 🚑` },

// ── Spegnimento ──────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🛑', title: 'Spegnere come un pro',
  text: `Tutti i modi per spegnere/riavviare (l'esame li chiede!):<br><br>
  <code>shutdown -h now</code> — spegni adesso<br>
  <code>shutdown -h +10</code> — spegni tra 10 minuti (avvisa gli utenti!)<br>
  <code>shutdown -r now</code> — riavvia adesso<br>
  <code>shutdown -c</code> — annulla uno shutdown programmato<br>
  <code>systemctl poweroff</code> / <code>systemctl reboot</code> — equivalenti moderni<br><br>
  E per urlare a tutti gli utenti connessi: <code>wall "messaggio"</code> 📢`,
  analogy: `shutdown +10 è il "ragazzi, il locale chiude tra 10 minuti!" del barista. wall è il megafono. shutdown -c è il barista che cambia idea: "ok ok, un altro giro!" 🍻` },

{ type: 'quiz',
  q: 'Hai lanciato "shutdown -h +30" ma ti sei pentito. Come lo annulli?',
  opts: [
    'shutdown -c',
    'shutdown --undo',
    'systemctl stop shutdown',
    'kill shutdown',
  ],
  a: 0,
  explain: `<code>shutdown -c</code> = <strong>cancel</strong>. Annulla lo spegnimento programmato e avvisa pure gli utenti che è stato annullato. Gli altri comandi non esistono in quella forma. 😮‍💨` },

// ── Processi ─────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🏃', title: 'I processi: programmi in azione',
  text: `Un <strong>processo</strong> è un programma <strong>in esecuzione</strong>. Ogni processo ha:<br><br>
  🆔 un <strong>PID</strong> (Process ID) — numero unico<br>
  👨‍👦 un <strong>PPID</strong> — il PID del processo padre che l'ha creato<br><br>
  Ogni processo nasce da un altro processo. È un albero genealogico gigante.`,
  analogy: `Il programma è la ricetta scritta sul libro. Il processo è TU che stai cucinando quella ricetta adesso. Puoi cucinare la stessa ricetta in 3 pentole = 3 processi dello stesso programma. 🍝` },

{ type: 'lesson', emoji: '👑', title: 'PID 1: il padre di tutti',
  text: `Il primo processo che il kernel avvia è <strong>init</strong> (= systemd) e ha sempre <strong>PID 1</strong>.<br><br>
  Tutti gli altri processi discendono da lui. Se un processo padre muore, gli orfani vengono <strong>adottati da PID 1</strong>.<br><br>
  Se PID 1 muore → kernel panic → tutto crolla. 💀`,
  analogy: `PID 1 è il capostipite della famiglia. Tutti discendono da lui e quando un genitore sparisce, il nonno adotta i nipoti. Se muore il capostipite... game over. 👴` },

{ type: 'terminal', emoji: '🌳', title: 'Guarda l\'albero dei processi',
  text: `<code>ps aux</code> li elenca tutti, <code>pstree</code> mostra l'albero genealogico:`,
  cmd: 'pstree -p | head -8',
  out: `systemd(1)─┬─NetworkManager(623)
           ├─sddm(745)───Hyprland(1043)─┬─kitty(2381)───zsh(2382)
           ├─sshd(812)
           ├─systemd-journal(389)
           ├─systemd-logind(601)
           └─systemd-udevd(412)` },

{ type: 'quiz',
  q: 'Che PID ha SEMPRE init/systemd?',
  opts: ['0', '1', '100', 'Dipende dal boot'],
  a: 1,
  explain: `<strong>PID 1</strong>, sempre e per sempre. È il primo processo in userspace, avviato direttamente dal kernel, e tutti gli altri ne discendono. (Il "PID 0" è interno al kernel, non un processo normale.) 👑` },

// ── Hardware: /dev /proc /sys ────────────────────────────────────────────────
{ type: 'lesson', emoji: '🗂️', title: 'Le 3 cartelle magiche',
  text: `In Linux <strong>tutto è un file</strong>, anche l'hardware! Tre directory speciali (virtuali, vivono in RAM):<br><br>
  📦 <code>/dev</code> — i <strong>dispositivi</strong>: <code>/dev/sda</code> (disco), <code>/dev/null</code> (cestino infinito)<br>
  🧠 <code>/proc</code> — finestre sui <strong>processi</strong> e sul kernel: <code>/proc/cpuinfo</code>, <code>/proc/meminfo</code><br>
  ⚙️ <code>/sys</code> — l'<strong>hardware</strong> visto dal kernel, in versione ordinata`,
  analogy: `Casa tua: /dev è il quadro elettrico (interruttori per ogni dispositivo), /proc è la bacheca con i post-it su chi sta facendo cosa, /sys è il manuale tecnico ordinato di ogni elettrodomestico. 🏠` },

{ type: 'terminal', emoji: '🕵️', title: 'Spia il tuo hardware',
  text: `I comandi-detective dell'hardware: <code>lsblk</code> (dischi), <code>lscpu</code> (CPU), <code>lspci</code> (schede), <code>lsusb</code> (USB), <code>free -h</code> (RAM):`,
  cmd: 'lsblk',
  out: `NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
nvme0n1     259:0    0 931.5G  0 disk
├─nvme0n1p1 259:1    0   512M  0 part /boot
├─nvme0n1p2 259:2    0   900G  0 part /
└─nvme0n1p3 259:3    0    31G  0 part [SWAP]` },

{ type: 'quiz',
  q: 'Dove leggi le informazioni sulla CPU "alla vecchia maniera", senza comandi?',
  opts: [
    'cat /dev/cpu',
    'cat /proc/cpuinfo',
    'cat /sys/cpu/info',
    'cat /etc/cpuinfo',
  ],
  a: 1,
  explain: `<code>/proc/cpuinfo</code> è il file virtuale con tutti i dettagli della CPU (il comando <code>lscpu</code> legge in gran parte da lì). /proc è la bacheca del kernel: anche <code>/proc/meminfo</code> per la RAM funziona così. 🧠` },

// ── Hardware: lspci e lsusb (101.1) ─────────────────────────────────────────
{ type: 'lesson', emoji: '🖥️', title: 'lspci e lsusb: radiografia dell\'hardware',
  text: `Due comandi fondamentali per inventariare l'hardware del sistema:<br><br>
  <strong>lspci</strong> — elenca i dispositivi sul bus PCI:<br>
  <code>lspci</code> — lista compatta di tutti i dispositivi PCI<br>
  <code>lspci -v</code> — dettagli estesi · <code>lspci -vv</code> — ancora più dettagli<br>
  <code>lspci -k</code> — mostra il modulo kernel usato per ogni dispositivo<br>
  <code>lspci -n</code> — mostra vendor ID:device ID numerici (utile per identificare l'hardware sconosciuto)<br>
  <br>
  <strong>lsusb</strong> — elenca i dispositivi USB:<br>
  <code>lsusb</code> — lista di tutti i dispositivi USB<br>
  <code>lsusb -v</code> — dettagli estesi<br>
  <code>lsusb -t</code> — albero gerarchico bus USB (hub e dispositivi collegati)<br>
  <br>
  Entrambi leggono da <code>/sys</code> e <code>/proc</code>. Richiedono il pacchetto <code>pciutils</code> (lspci) e <code>usbutils</code> (lsusb).`,
  analogy: `lspci è come aprire il cofano della macchina e leggere le etichette di ogni componente. lsusb è il pannello delle prese USB: vedi in quale slot è inserita ogni chiavetta, ogni mouse, ogni hub. 🖥️` },

{ type: 'terminal', emoji: '🖥️', title: 'lspci e lsusb in azione',
  cmd: 'lspci | head -5 && echo "---" && lsusb',
  out: `00:00.0 Host bridge: Advanced Micro Devices, Inc. [AMD] Renoir/Cezanne Root Complex
00:00.2 IOMMU: Advanced Micro Devices, Inc. [AMD] Renoir/Cezanne IOMMU
00:01.0 Host bridge: Advanced Micro Devices, Inc. [AMD] Renoir PCIe Dummy Host Bridge
00:08.0 Host bridge: Advanced Micro Devices, Inc. [AMD] Renoir PCIe Dummy Host Bridge
00:14.0 SMBus: Advanced Micro Devices, Inc. [AMD] FCH SMBus Controller
---
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 001 Device 002: ID 046d:c52b Logitech, Inc. Unifying Receiver
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub` },

{ type: 'quiz',
  q: 'Quale comando mostra l\'elenco dei dispositivi PCI e il modulo kernel utilizzato da ciascuno?',
  opts: ['lspci -k', 'lsmod -pci', 'lspci -m', 'modinfo --pci'],
  a: 0,
  explain: `<code>lspci -k</code> mostra per ogni dispositivo PCI il driver kernel (<em>Kernel driver in use</em>) e i moduli caricati. Perfetto per verificare che una scheda di rete o video stia usando il driver corretto. <code>lsmod</code> lista i moduli caricati ma non li associa ai dispositivi PCI. 🖥️` },

{ type: 'quiz',
  q: 'Quale opzione di lsusb mostra la struttura ad albero del bus USB con gli hub e i dispositivi?',
  opts: ['lsusb -t', 'lsusb -v', 'lsusb --tree', 'lsusb -a'],
  a: 0,
  explain: `<code>lsusb -t</code> stampa un albero gerarchico: root hub → hub → dispositivi. Utile per capire quanta banda è condivisa e a quale hub è collegato ogni dispositivo. <code>-v</code> mostra i dettagli estesi di ogni dispositivo (molte righe). <code>--tree</code> e <code>-a</code> non esistono come opzioni valide. 🖥️` },

// ── Moduli kernel ────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🧱', title: 'Moduli kernel: i LEGO',
  text: `Il kernel non carica tutto subito: i driver sono <strong>moduli</strong> caricabili al volo (file <code>.ko</code> = kernel object).<br><br>
  🔍 <code>lsmod</code> — lista moduli caricati<br>
  ➕ <code>modprobe nome</code> — carica un modulo (con le sue dipendenze!)<br>
  ➖ <code>modprobe -r nome</code> — lo scarica<br>
  ℹ️ <code>modinfo nome</code> — info su un modulo<br><br>
  (<code>insmod</code>/<code>rmmod</code> sono le versioni primitive senza gestione dipendenze: all'esame preferisci <code>modprobe</code>.)`,
  analogy: `Il kernel è la base LEGO. Colleghi una webcam? CLICK, si aggancia il mattoncino-driver. La stacchi? Il mattoncino si può togliere. Non devi ricostruire tutto il castello ogni volta. 🧱` },

{ type: 'terminal', emoji: '🧱', title: 'I tuoi moduli, dal vivo',
  cmd: 'lsmod | head -6',
  out: `Module                  Size  Used by
amdgpu              12345678  14
btusb                  77824  0
iwlwifi               434176  1 iwlmvm
snd_hda_intel          61440  3
nvme                   49152  2` },

{ type: 'quiz',
  q: 'Vuoi caricare il modulo "btusb" CON tutte le sue dipendenze. Quale comando?',
  opts: [
    'insmod btusb',
    'modprobe btusb',
    'lsmod btusb',
    'loadmod btusb',
  ],
  a: 1,
  explain: `<strong>modprobe</strong> è quello intelligente: risolve e carica anche le dipendenze. <code>insmod</code> carica solo il singolo file .ko e fallisce se mancano dipendenze. <code>lsmod</code> elenca soltanto, <code>loadmod</code> non esiste. 🧱` },

{ type: 'lesson', emoji: '🚪', title: 'udev: il buttafuori dell\'hardware',
  text: `Quando colleghi una chiavetta USB, chi crea <code>/dev/sdb</code> al volo? <strong>udev</strong>!<br><br>
  È il demone (<code>systemd-udevd</code>) che:<br>
  👀 ascolta gli eventi hardware dal kernel<br>
  📛 crea/rimuove i file in <code>/dev</code> dinamicamente<br>
  📜 applica regole personalizzate da <code>/etc/udev/rules.d/</code><br><br>
  Per spiare gli eventi in diretta: <code>udevadm monitor</code>`,
  analogy: `udev è il buttafuori del club /dev: ogni dispositivo che arriva viene registrato, gli si dà un badge col nome (/dev/sdb) e quando se ne va il badge viene ritirato. 🕶️` },

{ type: 'quiz',
  q: 'Colleghi una USB e appare /dev/sdb. Chi ha creato quel file?',
  opts: ['GRUB', 'udev (systemd-udevd)', 'pacman', 'cron'],
  a: 1,
  explain: `<strong>udev</strong> riceve l'evento dal kernel ("ehi, nuovo dispositivo!") e crea il file device in /dev seguendo le sue regole. GRUB lavora solo al boot, pacman installa pacchetti, cron programma task. 🚪` },

{ type: 'fact', emoji: '🕳️', title: '/dev/null: il buco nero',
  text: `<code>/dev/null</code> è un dispositivo speciale che <strong>inghiotte qualsiasi cosa</strong> ci scrivi dentro, per sempre. <br><br><code>comando 2&gt; /dev/null</code> = "butta gli errori nel buco nero". <br><br>È così famoso che i programmatori lo usano come insulto: <em>"manda le tue opinioni a /dev/null"</em>. 🕳️✨` },

// ── Ripasso finale ───────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🧩', title: 'RIPASSO LAMPO',
  text: `Tutto il modulo in 6 righe:<br><br>
  🥾 Boot: <strong>UEFI → GRUB → kernel → systemd</strong><br>
  🤵 systemd = PID 1, gestisce le <strong>unit</strong> con <code>systemctl</code><br>
  🎯 Target: 1=rescue, 3=multi-user, 5=graphical<br>
  🗂️ /dev=dispositivi, /proc=kernel+processi, /sys=hardware<br>
  🧱 Moduli: <code>lsmod</code>, <code>modprobe</code>, <code>modinfo</code><br>
  🚪 udev crea i device al volo<br><br>
  Ora gli ultimi 3 quiz. Niente paura. 💪`,
  analogy: null },

{ type: 'quiz',
  q: 'Il sistema non deve più avviare la grafica ad OGNI boot. Cosa usi?',
  opts: [
    'systemctl isolate multi-user.target',
    'systemctl set-default multi-user.target',
    'systemctl disable graphical',
    'shutdown -g off',
  ],
  a: 1,
  explain: `<code>set-default</code> cambia il target <strong>di avvio permanente</strong>. <code>isolate</code> ci salta solo ORA (al riavvio torna come prima) — è la stessa trappola di start vs enable! 🎯` },

{ type: 'quiz',
  q: 'Quale file system virtuale contiene info su processi E kernel?',
  opts: ['/dev', '/proc', '/sys', '/etc'],
  a: 1,
  explain: `<code>/proc</code>: dentro trovi una cartella numerata per ogni processo (/proc/1234) più i file informativi del kernel (cpuinfo, meminfo, cmdline...). /etc invece sta su disco: contiene configurazioni, non è virtuale. 🧠` },

{ type: 'quiz',
  q: 'Riavviare il PC tra 5 minuti avvisando gli utenti. Quale comando?',
  opts: [
    'reboot +5',
    'shutdown -r +5',
    'systemctl reboot --wait 5',
    'restart in 5',
  ],
  a: 1,
  explain: `<code>shutdown -r +5</code>: <strong>-r</strong> = reboot, <strong>+5</strong> = tra 5 minuti, e shutdown manda in automatico l'avviso a tutti gli utenti loggati. È il comando "educato". 📢` },

// ── RETROFIT CP5: input + missioni ───────────────────────────────────────────

{ type: 'input', q: 'Quale comando systemd avvia un servizio E lo abilita all\'avvio permanente in un\'unica operazione?',
  accept: ['systemctl enable --now', 'sudo systemctl enable --now'],
  placeholder: 'systemctl ...',
  explain: `<code>systemctl enable --now nomedelservizio</code> fa due cose in una: aggiunge il collegamento di avvio automatico (enable) e avvia il servizio subito (come start). Senza <strong>--now</strong> saresti costretto a fare enable + start separati. ⚡` },

{ type: 'mission', emoji: '🎯', title: 'Missione: servizi systemd attivi',
  text: `Sul tuo CachyOS elenca tutti i servizi systemd in stato "attivo in esecuzione" e cerca quello con più dipendenze.`,
  solution: `# Lista servizi attivi (running)
systemctl list-units --type=service --state=running

# Dettaglio e dipendenze di un servizio specifico:
systemctl status NetworkManager
systemctl list-dependencies NetworkManager

# PID del processo principale di un servizio:
systemctl show NetworkManager --property=MainPID` },

{ type: 'mission', emoji: '🎯', title: 'Missione: esplora /proc',
  text: `Naviga nel filesystem virtuale <code>/proc</code> e scopri il cmdline del processo con PID 1 (systemd sul tuo sistema).`,
  solution: `# Cmdline del PID 1 (systemd o init)
cat /proc/1/cmdline | tr '\\0' ' '
# oppure
cat /proc/1/comm

# Tutte le info sul processo 1:
ls /proc/1/

# Info sul kernel in esecuzione:
cat /proc/version
cat /proc/cpuinfo | head -20
cat /proc/meminfo | head -10` },

];
