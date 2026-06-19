/* ═══════════ MODULO 2 — Pacchetti & installazione (LPIC-1 Topic 102) ═══════════ */
'use strict';

const MODULE02 = [

{ type: 'lesson', emoji: '📦', title: 'Modulo 2: si fa sul serio',
  text: `Qui impari come si <strong>installa</strong> Linux e come si <strong>installano i programmi</strong>:<br><br>
  💾 come si divide un disco (partizioni, swap, LVM)<br>
  🍞 come si piazza il bootloader<br>
  📚 le librerie condivise<br>
  📦 i gestori di pacchetti: <strong>pacman</strong> (casa tua!), <strong>apt</strong> (Debian/Ubuntu) e <strong>rpm/dnf</strong> (Red Hat)<br><br>
  ⚠️ L'esame LPIC-1 chiede apt e rpm. Pacman no, ma lo metto perché è la tua distro!`,
  analogy: `Finora hai conosciuto il personale del ristorante. Ora impari come si costruisce il locale e come si riforniscono le dispense. 🏗️` },

// ── Layout disco ─────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🍰', title: 'Partizioni: il disco a fette',
  text: `Un disco si divide in <strong>partizioni</strong>: fette indipendenti, ognuna col suo scopo.<br><br>
  Layout tipico moderno (UEFI):<br>
  1️⃣ <strong>ESP</strong> (~512 MB, FAT32, montata su <code>/boot</code> o <code>/boot/efi</code>) — qui vive il bootloader<br>
  2️⃣ <strong>/</strong> (root) — il sistema<br>
  3️⃣ <strong>swap</strong> — la "RAM di riserva"<br>
  4️⃣ <em>(opzionale)</em> <strong>/home</strong> separata — i tuoi file sopravvivono alle reinstallazioni!`,
  analogy: `Il disco è una torta. Non la mangi intera a morsi: la tagli a fette con scopi diversi. Una fettina per il bootloader, una maxi per il sistema, una per gli ospiti (/home). 🎂` },

{ type: 'lesson', emoji: '🛟', title: 'Swap: il salvagente della RAM',
  text: `La <strong>swap</strong> è spazio su disco usato quando la RAM è piena: il kernel ci parcheggia i dati meno usati.<br><br>
  📏 Può essere una <strong>partizione</strong> o un <strong>file</strong> (swapfile)<br>
  💤 Serve anche per l'<strong>ibernazione</strong> (suspend-to-disk)<br>
  🐌 È molto più lenta della RAM: se il PC "swappa" tanto, rallenta<br><br>
  Comandi: <code>mkswap</code> (crea), <code>swapon</code> (attiva), <code>swapoff</code> (disattiva), <code>free -h</code> (controlla).`,
  analogy: `La RAM è la tua scrivania, la swap è lo scaffale dietro di te. Quando la scrivania è piena sposti le carte che usi meno sullo scaffale: ci metti di più a riprenderle, ma non le butti. 🗄️` },

{ type: 'quiz',
  q: 'In un sistema UEFI, come dev\'essere formattata la partizione ESP?',
  opts: ['ext4', 'FAT32 (vfat)', 'btrfs', 'NTFS'],
  a: 1,
  explain: `La <strong>EFI System Partition dev'essere FAT32</strong>: è l'unico filesystem che il firmware UEFI sa leggere per legge (specifica UEFI). Il resto del sistema può essere ext4/btrfs/quello che vuoi, ma l'ESP è FAT32 e basta. 🥾` },

{ type: 'lesson', emoji: '🧙‍♂️', title: 'LVM: le partizioni elastiche',
  text: `<strong>LVM</strong> (Logical Volume Manager) aggiunge uno strato magico sopra le partizioni:<br><br>
  🧱 <strong>PV</strong> (Physical Volume) — i dischi/partizioni reali<br>
  🏊 <strong>VG</strong> (Volume Group) — la piscina che li unisce<br>
  🧊 <strong>LV</strong> (Logical Volume) — le "partizioni" elastiche che peschi dalla piscina<br><br>
  Vantaggio enorme: puoi <strong>ridimensionare</strong> i volumi al volo, aggiungere dischi alla piscina, fare snapshot. Le partizioni classiche invece sono scolpite nella pietra.`,
  analogy: `Le partizioni normali sono muri in cemento: spostarli = ristrutturazione. LVM sono pareti mobili da ufficio: la stanza è piccola? Sposti la parete in 5 secondi. 🧱➡️🪟` },

{ type: 'quiz',
  q: 'In LVM, qual è l\'ordine giusto degli strati (dal basso verso l\'alto)?',
  opts: [
    'LV → VG → PV',
    'PV → VG → LV',
    'VG → PV → LV',
    'PV → LV → VG',
  ],
  a: 1,
  explain: `<strong>PV → VG → LV</strong>: i dischi fisici (PV) si uniscono in una piscina (VG), dalla quale ritagli i volumi logici (LV) dove crei i filesystem. Mattoni → piscina → fette elastiche. 🧱🏊🧊` },

// ── LVM: comandi operativi (102.1) ───────────────────────────────────────────
{ type: 'lesson', emoji: '🧙‍♂️', title: 'LVM: creare lo stack da zero',
  text: `I comandi per costruire l'infrastruttura LVM (richiede root):<br><br>
  <code>pvcreate /dev/sdb</code> — inizializza /dev/sdb come Physical Volume<br>
  <code>pvcreate /dev/sdb /dev/sdc</code> — inizializza più dischi insieme<br>
  <code>vgcreate vg_dati /dev/sdb /dev/sdc</code> — crea il Volume Group dalla piscina<br>
  <code>lvcreate -L 50G -n lv_home vg_dati</code> — crea un Logical Volume da 50 GB<br>
  <code>lvcreate -l 100%FREE -n lv_home vg_dati</code> — usa tutto lo spazio disponibile<br>
  <br>
  Poi formatta e monta come un disco normale:<br>
  <code>mkfs.ext4 /dev/vg_dati/lv_home</code>`,
  analogy: `pvcreate prepara i mattoni, vgcreate versa il calcestruzzo nella vasca, lvcreate taglia le fette dalla vasca. L'ordine non si può invertire: mattoni → vasca → fette. 🧱🏊🧊` },

{ type: 'lesson', emoji: '📊', title: 'LVM: visualizzare e modificare',
  text: `<strong>Visualizzare lo stato LVM:</strong><br>
  <code>pvs</code> — riepilogo PV · <code>pvdisplay</code> — dettaglio completo<br>
  <code>vgs</code> — riepilogo VG · <code>vgdisplay</code> — dettaglio VG<br>
  <code>lvs</code> — riepilogo LV · <code>lvdisplay</code> — dettaglio LV<br>
  <br>
  <strong>Estendere un volume (senza perdita dati):</strong><br>
  <code>vgextend vg_dati /dev/sdd</code> — aggiungi /dev/sdd alla piscina<br>
  <code>lvextend -L +20G /dev/vg_dati/lv_home</code> — allarga l'LV di 20 GB<br>
  <code>resize2fs /dev/vg_dati/lv_home</code> — fai sapere al filesystem ext4 che è più grande<br>
  (<code>xfs_growfs /home</code> — equivalente per XFS)<br>
  <br>
  TRAPPOLA! <code>lvextend</code> allarga solo il volume logico: il <strong>filesystem</strong> non sa ancora niente — devi fare anche <code>resize2fs</code>!`,
  analogy: `lvextend è come ampliare la stanza abbattendo un muro. resize2fs è avvisare i coinquilini: "hey, la stanza è più grande, potete usare quello spazio!". Senza l'avviso, mettono ancora i mobili nella stanza vecchia. 🏠` },

{ type: 'terminal', emoji: '📊', title: 'LVM: vgs e lvs in azione',
  cmd: 'vgs && echo "---" && lvs',
  out: `  VG       #PV #LV #SN Attr   VSize   VFree
  vg_dati    2   2   0 wz--n- 1.82t 200.00g
---
  LV       VG       Attr       LSize  Pool Origin Snap%  Move Log
  lv_home  vg_dati  -wi-ao---- 200.00g
  lv_root  vg_dati  -wi-ao---- <1.63t` },

{ type: 'quiz',
  q: 'Qual è l\'ordine CORRETTO per creare lo stack LVM su un disco nuovo?',
  opts: [
    'lvcreate → vgcreate → pvcreate',
    'pvcreate → vgcreate → lvcreate',
    'vgcreate → pvcreate → lvcreate',
    'pvcreate → lvcreate → vgcreate',
  ],
  a: 1,
  explain: `<strong>PV → VG → LV</strong>: prima inizializzi il disco fisico come PV, poi crei il Volume Group dalla piscina, infine tagli i Logical Volume dalla piscina. È lo stesso ordine della struttura concettuale: mattoni → vasca → fette. 🧱🏊🧊` },

{ type: 'quiz',
  q: 'Hai esteso un LV con "lvextend -L +10G /dev/vg0/home". Il sistema segnala ancora lo spazio vecchio. Perché?',
  opts: [
    'Manca il reboot: lvextend richiede riavvio',
    'Bisogna eseguire resize2fs (o xfs_growfs) per far crescere il filesystem',
    'Serve prima smontare /home e poi estendere',
    'lvextend non può crescere più di 5G alla volta',
  ],
  a: 1,
  explain: `<code>lvextend</code> allarga il blocco logico ma il filesystem (ext4, xfs...) non lo sa ancora. Serve <code>resize2fs /dev/vg0/home</code> (ext4) o <code>xfs_growfs /home</code> (xfs). Con <code>lvextend -r</code> (resize) puoi fare entrambi in un colpo. Nessun riavvio richiesto. 📊` },

{ type: 'quiz',
  q: 'Quale comando mostra un riepilogo SINTETICO di tutti i Volume Group del sistema?',
  opts: ['vgdisplay', 'vgs', 'pvs', 'lvdisplay --vg'],
  a: 1,
  explain: `<code>vgs</code> mostra una riga per VG con nome, numero PV/LV, dimensione totale e spazio libero. <code>vgdisplay</code> è il dettaglio completo (molte righe per VG). <code>pvs</code> è per i Physical Volume. <code>lvdisplay --vg</code> non esiste come opzione. 📊` },

// ── Bootloader install ───────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🔧', title: 'Installare GRUB (sul serio)',
  text: `Due comandi, due ruoli — non confonderli:<br><br>
  1️⃣ <code>grub-install /dev/sda</code> — <strong>installa</strong> GRUB sul disco (su BIOS scrive nell'MBR, su UEFI mette il file .efi nell'ESP)<br>
  2️⃣ <code>grub-mkconfig -o /boot/grub/grub.cfg</code> — <strong>genera</strong> il menu leggendo <code>/etc/default/grub</code><br><br>
  Su Debian/Ubuntu il secondo si chiama anche <code>update-grub</code> (stessa cosa).`,
  analogy: `grub-install monta il campanello alla porta. grub-mkconfig scrive la lista dei nomi sui pulsanti. Sono due lavori diversi: montare ≠ scrivere le etichette. 🔔` },

{ type: 'quiz',
  q: 'Hai modificato /etc/default/grub. E adesso?',
  opts: [
    'Riavvii e basta, GRUB lo rilegge da solo',
    'grub-install /dev/sda',
    'grub-mkconfig -o /boot/grub/grub.cfg',
    'systemctl restart grub',
  ],
  a: 2,
  explain: `GRUB <strong>non legge</strong> /etc/default/grub al boot: legge solo grub.cfg. Quindi dopo ogni modifica devi <strong>rigenerare</strong> con <code>grub-mkconfig -o /boot/grub/grub.cfg</code> (o <code>update-grub</code> su Debian). grub-install serve solo per (re)installare il bootloader. 🍞` },

// ── Librerie condivise ───────────────────────────────────────────────────────
{ type: 'lesson', emoji: '📚', title: 'Librerie condivise (.so)',
  text: `I programmi non reinventano tutto: usano <strong>librerie condivise</strong> — file <code>.so</code> (shared object) pieni di funzioni pronte.<br><br>
  📍 Vivono in <code>/lib</code>, <code>/usr/lib</code>, ecc.<br>
  🔗 Quando lanci un programma, il <strong>linker dinamico</strong> (<code>ld.so</code>) trova e collega le librerie giuste<br>
  💥 Libreria mancante = il programma non parte ("error while loading shared libraries...")`,
  analogy: `Le librerie sono gli attrezzi nel garage condominiale. Ogni famiglia (programma) non compra il suo trapano: lo prende dal garage comune. Se qualcuno ruba il trapano (.so mancante), nessuno appende più quadri. 🔨` },

{ type: 'terminal', emoji: '🔗', title: 'ldd: di che librerie ha bisogno?',
  text: `<code>ldd</code> mostra le librerie che un programma usa e dove le trova:`,
  cmd: 'ldd /usr/bin/ls',
  out: `linux-vdso.so.1 (0x00007fff3c5e2000)
libcap.so.2 => /usr/lib/libcap.so.2 (0x00007f8a1b2c4000)
libc.so.6 => /usr/lib/libc.so.6 (0x00007f8a1b0d0000)
/lib64/ld-linux-x86-64.so.2 (0x00007f8a1b330000)` },

{ type: 'lesson', emoji: '🗺️', title: 'ldconfig: aggiorna la mappa',
  text: `Il linker non cerca le librerie a caso ogni volta: usa una <strong>cache</strong> (<code>/etc/ld.so.cache</code>).<br><br>
  📜 I percorsi dove cercare stanno in <code>/etc/ld.so.conf</code> (+ <code>/etc/ld.so.conf.d/</code>)<br>
  🔄 <code>ldconfig</code> rigenera la cache (da lanciare dopo aver installato librerie a mano)<br>
  🩹 <code>LD_LIBRARY_PATH</code> — variabile per aggiungere percorsi extra al volo (trucco temporaneo, non soluzione)`,
  analogy: `ld.so.conf è l'elenco delle vie della città, ld.so.cache è il navigatore già calcolato. Costruisci una via nuova? Devi aggiornare il navigatore: ldconfig. 🗺️` },

{ type: 'quiz',
  q: 'Hai installato una libreria a mano in /usr/local/lib ma il programma non la trova. Che fai?',
  opts: [
    'Riavvii il PC',
    'ldconfig',
    'ldd --rebuild',
    'modprobe libreria',
  ],
  a: 1,
  explain: `<code>ldconfig</code> rigenera la cache del linker (/etc/ld.so.cache) scandagliando i percorsi configurati. <code>ldd</code> mostra solo le dipendenze, non ricostruisce niente; modprobe è per i moduli del KERNEL, non per le librerie. 🗺️` },

// ── Pacchetti: concetto ──────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🛒', title: 'Gestori di pacchetti: il supermercato',
  text: `Un <strong>pacchetto</strong> = programma + file + metadati (versione, dipendenze).<br>
  Un <strong>repository</strong> = magazzino online di pacchetti fidati.<br>
  Il <strong>gestore di pacchetti</strong> = il software che scarica, installa, aggiorna e rimuove risolvendo le dipendenze.<br><br>
  Le 3 grandi famiglie:<br>
  🏹 <strong>Arch</strong> (tu!): pacman — pacchetti <code>.pkg.tar.zst</code><br>
  🌀 <strong>Debian/Ubuntu</strong>: dpkg + apt — pacchetti <code>.deb</code><br>
  🎩 <strong>Red Hat/Fedora/SUSE</strong>: rpm + dnf/zypper — pacchetti <code>.rpm</code>`,
  analogy: `Il pacchetto è il prodotto col codice a barre, il repository è il supermercato, il gestore pacchetti è il maggiordomo che fa la spesa, controlla le scadenze e butta il vecchio. Tu dici solo cosa vuoi. 🛒` },

// ── pacman ───────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🏹', title: 'pacman: il TUO gestore',
  text: `Su Arch/CachyOS comanda <strong>pacman</strong>. Le mosse fondamentali:<br><br>
  <code>pacman -S firefox</code> — installa<br>
  <code>pacman -Syu</code> — <strong>aggiorna TUTTO</strong> (il rito quotidiano di Arch)<br>
  <code>pacman -R firefox</code> — rimuove (<code>-Rns</code> = anche config e dipendenze orfane)<br>
  <code>pacman -Ss parola</code> — cerca nei repo<br>
  <code>pacman -Qi firefox</code> — info su un pacchetto installato<br>
  <code>pacman -Qo /usr/bin/ls</code> — "questo file di chi è?"`,
  analogy: `S = Sync (scarico dal supermercato), Q = Query (guardo nella MIA dispensa), R = Remove (butto). Maiuscola = operazione, minuscole dopo = dettagli. Una volta capito il codice, pacman è uno yo-yo. 🪀` },

{ type: 'terminal', emoji: '🏹', title: 'Il rito quotidiano di Arch',
  cmd: 'sudo pacman -Syu',
  out: `:: Synchronizing package databases...
 core is up to date
 extra                 8.5 MiB  12.3 MiB/s 00:01
:: Starting full system upgrade...
Packages (3) firefox-139.0-1  linux-cachyos-6.12.5-1  mesa-25.1.0-1

Total Download Size:   312.44 MiB
:: Proceed with installation? [Y/n]` },

{ type: 'fact', emoji: '🧪', title: 'AUR: il mercato nero (legale)',
  text: `L'<strong>AUR</strong> (Arch User Repository) è il motivo per cui la gente sceglie Arch: <strong>87.000+ pacchetti</strong> creati dagli utenti. Qualsiasi software esista, nell'AUR c'è.<br><br>Si usa con un helper come <code>yay</code> o <code>paru</code>: <code>yay -S spotify</code> e via.<br><br>⚠️ Sono script di sconosciuti: dai sempre un'occhiata al PKGBUILD prima di installare! (Non è nell'esame LPIC-1, ma è casa tua. 🏠)` },

{ type: 'quiz',
  q: 'Su CachyOS vuoi aggiornare TUTTO il sistema. Quale comando?',
  opts: [
    'pacman -S update',
    'pacman -Syu',
    'pacman -Qu --all',
    'apt upgrade',
  ],
  a: 1,
  explain: `<code>pacman -Syu</code>: <strong>S</strong>ync + <strong>y</strong> (aggiorna i database dei repo) + <strong>u</strong> (upgrade dei pacchetti). È IL comando di Arch, da lanciare spesso. apt su Arch non esiste proprio. 🏹` },

// ── Debian: dpkg/apt ─────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🌀', title: 'Mondo Debian: dpkg + apt',
  text: `Due livelli (l'esame li distingue!):<br><br>
  🔩 <strong>dpkg</strong> — basso livello, lavora su file .deb locali, <strong>NON risolve dipendenze</strong>:<br>
  <code>dpkg -i pacchetto.deb</code> (installa), <code>dpkg -l</code> (lista tutto), <code>dpkg -L nome</code> (file di un pacchetto), <code>dpkg -S /percorso/file</code> (file di chi è?)<br><br>
  🧠 <strong>apt</strong> — alto livello, scarica dai repo e <strong>risolve le dipendenze</strong>:<br>
  <code>apt install nginx</code>, <code>apt update</code> (aggiorna la LISTA), <code>apt upgrade</code> (aggiorna i PACCHETTI), <code>apt remove</code>, <code>apt-cache search parola</code>`,
  analogy: `dpkg è il magazziniere: mette sullo scaffale solo la scatola che gli porti tu, e se mancano pezzi sono problemi tuoi. apt è il personal shopper: gli dici "voglio nginx" e lui compra anche tutto quello che serve. 🛍️` },

{ type: 'lesson', emoji: '⚠️', title: 'apt update vs apt upgrade (TRAPPOLA!)',
  text: `Identica alla trappola start/enable di systemd:<br><br>
  📋 <code>apt update</code> — aggiorna <strong>solo la lista</strong> dei pacchetti disponibili (il volantino del supermercato)<br>
  📦 <code>apt upgrade</code> — <strong>installa davvero</strong> gli aggiornamenti<br><br>
  La sequenza giusta è sempre: <code>apt update && apt upgrade</code>.<br>
  (pacman -Syu fa entrambe le cose insieme: y = update, u = upgrade.)`,
  analogy: `update = ritirare il volantino con le offerte nuove. upgrade = andare davvero a fare la spesa. Se fai solo update, la dispensa resta vecchia! 📋` },

{ type: 'quiz',
  q: 'Su Debian, quale comando installa un .deb scaricato a mano (senza repo)?',
  opts: [
    'apt download pacchetto.deb',
    'dpkg -i pacchetto.deb',
    'dpkg -l pacchetto.deb',
    'deb install pacchetto.deb',
  ],
  a: 1,
  explain: `<code>dpkg -i</code> (<strong>i</strong>nstall) installa un file .deb locale. Occhio: non risolve le dipendenze — se mancano, si sistema con <code>apt -f install</code>. <code>dpkg -l</code> elenca i pacchetti installati. 🌀` },

{ type: 'quiz',
  q: 'Su Ubuntu vuoi sapere QUALE pacchetto ha installato /etc/nginx/nginx.conf',
  opts: [
    'dpkg -S /etc/nginx/nginx.conf',
    'dpkg -L /etc/nginx/nginx.conf',
    'apt show /etc/nginx/nginx.conf',
    'apt-cache search nginx.conf',
  ],
  a: 0,
  explain: `<code>dpkg -S</code> (<strong>S</strong>earch) = "questo file di chi è?" — dal file risali al pacchetto. <code>dpkg -L</code> fa l'inverso: dal pacchetto elenca i suoi file. Su Arch l'equivalente è <code>pacman -Qo</code>. 🔍` },

// ── RPM/dnf ──────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🎩', title: 'Mondo Red Hat: rpm + dnf',
  text: `Stessa logica a due livelli:<br><br>
  🔩 <strong>rpm</strong> — basso livello, no dipendenze:<br>
  <code>rpm -i pacchetto.rpm</code> (installa), <code>rpm -qa</code> (lista tutto), <code>rpm -ql nome</code> (file del pacchetto), <code>rpm -qf /file</code> (di chi è?)<br><br>
  🧠 <strong>dnf</strong> (erede di yum) — alto livello con repo e dipendenze:<br>
  <code>dnf install nginx</code>, <code>dnf upgrade</code>, <code>dnf search parola</code>, <code>dnf remove</code><br><br>
  🦎 Su openSUSE: <strong>zypper</strong> (<code>zypper install</code>, <code>zypper update</code>).`,
  analogy: `Stessi ruoli, altra città: rpm è il magazziniere, dnf il personal shopper. Cambiano i nomi ma il film è identico a dpkg/apt. Impari uno schema, li sai tutti. 🎬` },

{ type: 'quiz',
  q: 'Su Fedora vuoi la lista di TUTTI i pacchetti installati. Quale comando?',
  opts: ['rpm -i --all', 'rpm -qa', 'dnf -l', 'rpm --list'],
  a: 1,
  explain: `<code>rpm -qa</code>: <strong>q</strong>uery + <strong>a</strong>ll = interroga tutto il database dei pacchetti installati. È il gemello di <code>dpkg -l</code> (Debian) e <code>pacman -Q</code> (Arch). 🎩` },

{ type: 'lesson', emoji: '🗺️', title: 'La stele di Rosetta dei pacchetti',
  text: `La tabella da stamparti nel cervello:<br><br>
  <strong>Installa dai repo</strong><br>
  🏹 <code>pacman -S x</code> · 🌀 <code>apt install x</code> · 🎩 <code>dnf install x</code><br><br>
  <strong>Aggiorna tutto</strong><br>
  🏹 <code>pacman -Syu</code> · 🌀 <code>apt update && apt upgrade</code> · 🎩 <code>dnf upgrade</code><br><br>
  <strong>Cerca</strong><br>
  🏹 <code>pacman -Ss x</code> · 🌀 <code>apt-cache search x</code> · 🎩 <code>dnf search x</code><br><br>
  <strong>Lista installati</strong><br>
  🏹 <code>pacman -Q</code> · 🌀 <code>dpkg -l</code> · 🎩 <code>rpm -qa</code><br><br>
  <strong>"Questo file di chi è?"</strong><br>
  🏹 <code>pacman -Qo</code> · 🌀 <code>dpkg -S</code> · 🎩 <code>rpm -qf</code>`,
  analogy: `Stessa grammatica, tre dialetti. Tu parli già l'arco-iano fluente: ora sai ordinare la pizza anche a Roma (apt) e a New York (dnf). 🍕` },

// ── Virtualizzazione ─────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '👻', title: 'Linux come ospite virtuale',
  text: `L'esame tocca anche Linux dentro le <strong>macchine virtuali</strong> e il cloud:<br><br>
  💻 <strong>VM</strong> — un computer finto dentro al tuo (hypervisor: KVM, VirtualBox)<br>
  📦 <strong>Container</strong> — più leggeri: condividono il kernel dell'host (Docker, LXC)<br>
  ☁️ <strong>cloud-init</strong> — lo standard per configurare una VM cloud al primo avvio (hostname, utenti, chiavi SSH)<br><br>
  ⚠️ Se cloni una VM, rigenera le cose uniche: machine-id, chiavi SSH host... altrimenti hai due "gemelli" identici che fanno casino in rete.`,
  analogy: `La VM è una casa completa costruita dentro un capannone (con le sue fondamenta = kernel suo). Il container è una stanza in affitto: condivide fondamenta e impianti col padrone di casa (kernel dell'host). 🏠` },

{ type: 'quiz',
  q: 'Differenza chiave tra container e macchina virtuale?',
  opts: [
    'I container hanno un loro kernel separato',
    'I container condividono il kernel dell\'host',
    'Le VM non hanno kernel',
    'Nessuna: sono sinonimi',
  ],
  a: 1,
  explain: `Il <strong>container condivide il kernel dell'host</strong> (per questo è leggero e parte in millisecondi). La VM emula un computer intero con il SUO kernel (più pesante ma più isolata). Casa completa vs stanza in affitto. 👻` },

// ── 102.6 extra: hypervisor tipo 1 vs tipo 2 ────────────────────────────────
{ type: 'lesson', emoji: '🖥️', title: 'Hypervisor Tipo 1 vs Tipo 2',
  text: `Un <strong>hypervisor</strong> è il software che crea e gestisce le macchine virtuali.<br>
<br>
<strong>Tipo 1 — Bare-metal</strong> (gira direttamente sull'hardware):<br>
• <code>KVM</code> (Kernel-based Virtual Machine) — integrato nel kernel Linux<br>
• <code>Xen</code> — usato da AWS, Citrix<br>
• VMware ESXi, Microsoft Hyper-V<br>
Più performante: nessun OS intermedio tra hardware e VM.<br>
<br>
<strong>Tipo 2 — Hosted</strong> (gira su un OS normale):<br>
• <code>VirtualBox</code> · VMware Workstation · QEMU<br>
Più comodo per sviluppo locale: installi come un'app normale.<br>
<br>
<strong>KVM su Linux</strong>:<br>
<code>lsmod | grep kvm</code> — verifica se KVM è caricato<br>
<code>virsh list --all</code> — lista VM (via libvirt)<br>
<code>virt-manager</code> — GUI per gestire VM KVM<br>
<br>
<strong>/etc/machine-id</strong> — identificativo unico della macchina (128 bit).<br>
Quando cloni una VM: <code>systemd-machine-id-setup</code> rigenera l'ID.`,
  analogy: `Tipo 1 è il direttore che lavora direttamente in fabbrica. Tipo 2 è il consulente che lavora dall'ufficio del cliente: ci riesce, ma ha uno strato in più di burocrazia tra lui e i macchinari. 🏭` },

{ type: 'quiz',
  q: 'KVM (Kernel-based Virtual Machine) è un hypervisor di quale tipo?',
  opts: [
    'Tipo 1 (bare-metal): usa il kernel Linux come hypervisor',
    'Tipo 2 (hosted): gira sopra il kernel Linux come applicazione',
    'Tipo 3 (paravirtualization): richiede kernel modificato',
    'Non è un hypervisor, è un emulatore'
  ],
  a: 0,
  explain: `KVM è un modulo del kernel Linux (<code>kvm.ko</code>): questo fa sì che il kernel stesso diventi l'hypervisor, quindi è <strong>Tipo 1</strong>. VirtualBox è Tipo 2 (gira sopra un OS). Xen è Tipo 1 (con le VM Linux che girano senza kernel modificato: HVM). 🖥️` },

{ type: 'fact', emoji: '😱', title: 'rm -rf giù dal palco',
  text: `Nel mondo dei pacchetti la regola d'oro è: <strong>mai mischiare i dialetti</strong>. Installare .deb su Arch o forzare .rpm su Ubuntu con conversioni strane = sistema zombie. 🧟<br><br>Ogni distro ha il suo gestore, e il gestore deve sapere TUTTO quello che è installato. Se gli installi roba alle spalle, perde il controllo e agli aggiornamenti succede il patatrac.` },

// ── Ripasso ──────────────────────────────────────────────────────────────────
{ type: 'lesson', emoji: '🧩', title: 'RIPASSO LAMPO',
  text: `Modulo 2 in 6 righe:<br><br>
  🍰 Disco: ESP (FAT32) + / + swap, /home separata = furbo<br>
  🧙 LVM: PV → VG → LV (elastico!)<br>
  🍞 grub-install installa, grub-mkconfig genera il menu<br>
  📚 Librerie .so: ldd mostra, ldconfig aggiorna la cache<br>
  🛒 pacman (-Syu!) · dpkg/apt · rpm/dnf<br>
  👻 Container = kernel condiviso · VM = kernel proprio<br>
  🖥️ Hypervisor Tipo 1 (KVM, Xen) = bare-metal · Tipo 2 (VirtualBox) = hosted<br><br>
  Ultimi 2 quiz e hai chiuso anche questo. 🔥`,
  analogy: null },

{ type: 'quiz',
  q: 'Comando per vedere le librerie condivise usate da /usr/bin/vim?',
  opts: ['ldconfig /usr/bin/vim', 'ldd /usr/bin/vim', 'lsmod vim', 'libs vim'],
  a: 1,
  explain: `<code>ldd</code> = "list dynamic dependencies": elenca le .so che il programma carica e da dove. <code>ldconfig</code> rigenera la cache (non interroga), <code>lsmod</code> è per i moduli kernel. 📚` },

{ type: 'quiz',
  q: 'Su Debian: "apt update" cosa fa ESATTAMENTE?',
  opts: [
    'Installa gli aggiornamenti disponibili',
    'Aggiorna solo la lista dei pacchetti disponibili',
    'Aggiorna il kernel',
    'È un alias di apt upgrade',
  ],
  a: 1,
  explain: `<code>apt update</code> scarica solo il "volantino": l'elenco aggiornato di ciò che i repo offrono. Per installare davvero gli aggiornamenti serve <code>apt upgrade</code>. Trappola d'esame classica, ora sei vaccinato. 💉` },

// ── RETROFIT CP5: input + missioni ───────────────────────────────────────────

{ type: 'input', q: 'Con dpkg, quale opzione (short) mostra lo stato e i dettagli di un pacchetto installato?',
  accept: ['dpkg -s', 'dpkg --status'],
  placeholder: 'dpkg ...',
  explain: `<code>dpkg -s nomepacchetto</code> (o --status) mostra stato, versione, dipendenze e descrizione. Diverso da <code>dpkg -l</code> che elenca tutti i pacchetti in formato corto. L'esame li chiede entrambi — -s per un pacchetto, -l per tutti. 📦` },

{ type: 'mission', emoji: '🎯', title: 'Missione: caccia al pacchetto',
  text: `Scopri a quale pacchetto appartiene il comando <code>/usr/bin/python3</code> sul tuo sistema.`,
  solution: `# Su Arch/CachyOS con pacman:
pacman -Qo /usr/bin/python3

# Su Debian/Ubuntu con dpkg:
dpkg -S /usr/bin/python3

# Alternativa: vedi se è un symlink
ls -la /usr/bin/python3

# Con apt-file (richiede install):
# apt-file search /usr/bin/python3` },

{ type: 'mission', emoji: '🎯', title: 'Missione: pacchetti orfani',
  text: `Trova i pacchetti installati come dipendenze ma non più necessari sul tuo sistema.`,
  solution: `# Su Arch/CachyOS — orfani (dipendenze non più richieste):
pacman -Qdt

# Rimuoverli (dopo review!):
pacman -Rns $(pacman -Qdtq)

# Pacchetti installati esplicitamente (non come dipendenze):
pacman -Qe

# Su Debian/Ubuntu:
apt autoremove --dry-run    # simula prima
apt autoremove              # poi esegui` },

];
