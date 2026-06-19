/* ═══════════ MODULO 6 — Interfacce grafiche ═══════════
   Obiettivi LPI: 106.1–106.3
   Modulo CORTO: 17 card (6 quiz + 1 input + 1 missione) */
'use strict';

const MODULE06 = [

  // ── 1. Benvenuto ─────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🖥️', title: 'Modulo 6: Interfacce grafiche',
    text: `Modulo corto ma denso di trappole! Impari come funziona la grafica in Linux:<br>
• <strong>X11</strong> e la sua architettura client/server (al contrario!)<br>
• <strong>Wayland</strong>: il successore moderno di X11<br>
• <strong>Display manager</strong>: chi ti mostra la schermata di login<br>
• <strong>Window manager</strong> vs <strong>Desktop Environment</strong><br>
• <strong>Accessibilità</strong>: Orca, AT-SPI<br>
<br>
Questo è il Topic 106 dell'esame LPIC-1.`,
    analogy: `Il sistema grafico è come un teatro. X11/Wayland è il palcoscenico (l'infrastruttura). Il display manager è il portiere all'ingresso. Il window manager è il direttore di scena. Il DE è la compagnia intera già pronta.` },

  // ── 2. X11: il server grafico ─────────────────────────────────────────────────
  { type: 'lesson', emoji: '🪟', title: 'X11: il vecchio ma robusto',
    text: `<strong>X Window System</strong> (X11, X.Org) è il sistema grafico tradizionale di Linux, in uso dal 1987.<br>
<br>
Architettura <strong>client/server</strong> — TRAPPOLA! La terminologia è invertita rispetto a come la usi normalmente:<br>
• <strong>Server X</strong> = il programma che gira sulla tua macchina e controlla schermo, tastiera, mouse<br>
• <strong>Client X</strong> = l'applicazione (Firefox, terminale, ecc.) che chiede al server di disegnarsi<br>
<br>
Il protocollo X permette ai client di girare su macchine remote e disegnarsi sul tuo schermo — la rete era nel DNA di X fin dall'inizio.`,
    analogy: `È come un ristorante al contrario: il "server" (il cuoco) è a casa tua, i "client" (le ordinazioni) arrivano da fuori. Il server X serve le applicazioni, non viceversa.` },

  // ── 3. DISPLAY e variabili X ──────────────────────────────────────────────────
  { type: 'lesson', emoji: '📺', title: 'La variabile DISPLAY',
    text: `La variabile d'ambiente <code>DISPLAY</code> dice alle applicazioni X dove connettersi.<br>
<br>
Formato: <code>host:display.screen</code><br>
• <code>:0</code> — primo display locale (il più comune)<br>
• <code>:1</code> — secondo display<br>
• <code>192.168.1.10:0</code> — display su macchina remota<br>
<br>
Comandi utili:<br>
• <code>echo $DISPLAY</code> — vedi il display corrente<br>
• <code>xdpyinfo</code> — info dettagliate sul display (risoluzione, DPI, estensioni)<br>
• <code>ssh -X user@host</code> — X forwarding: le app remote si disegnano sul tuo schermo<br>
• <code>xhost +localhost</code> — permetti connessioni locali (usa con cautela)`,
    analogy: `DISPLAY è l'indirizzo del teatro: le app X guardano questa variabile per sapere dove bussare e chiedere di essere "messe in scena".` },

  // ── 4. Terminal: DISPLAY ──────────────────────────────────────────────────────
  { type: 'terminal', emoji: '📺', title: 'Il tuo DISPLAY',
    cmd: 'echo $DISPLAY && xdpyinfo | head -6',
    out: `:1
name of display:    :1
version number:    11.0
vendor string:    The X.Org Foundation
vendor release number:    12101009
X.Org version: 21.1.9` },

  // ── 5. Quiz: server X vs client X ────────────────────────────────────────────
  { type: 'quiz', q: 'In X11, quale componente controlla fisicamente tastiera, mouse e schermo?',
    opts: [
      'Il server X, che gira sulla macchina locale',
      'Il client X, cioè ogni singola applicazione',
      'Il display manager, che avvia la sessione',
      'Il window manager, che gestisce le finestre'
    ],
    a: 0,
    explain: `TRAPPOLA classica: in X11 il "server" è il programma che controlla l'hardware grafico locale. I "client" sono le applicazioni che si connettono ad esso per disegnarsi. È l'opposto della terminologia web dove il server è remoto. 🪟` },

  // ── 6. Wayland ────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🌊', title: 'Wayland: il futuro è già qui',
    text: `<strong>Wayland</strong> è il moderno protocollo grafico di Linux (2008), progettato per sostituire X11.<br>
<br>
Differenze chiave:<br>
• In Wayland non c'è un "server X" separato: un singolo <strong>compositor</strong> gestisce tutto (display, compositing, input)<br>
• Più sicuro: le app non possono intercettare l'input delle altre (problema noto di X11)<br>
• Più semplice architetturalmente: meno overhead, latency minore<br>
<br>
Compositor Wayland noti: <strong>KWin</strong> (KDE), <strong>Mutter</strong> (GNOME), <strong>sway</strong> (i3-like)<br>
<br>
<strong>XWayland</strong>: strato di compatibilità che fa girare app X11 legacy dentro una sessione Wayland. Non è un compositor Wayland — è un server X embedded.`,
    analogy: `Wayland è come ristrutturare il teatro: invece di un palcoscenico vecchio con tanti tecnici specializzati (X11), hai un regista unico (il compositor) che fa tutto in modo coordinato.` },

  // ── 7. Fun fact: X11 e Wayland ───────────────────────────────────────────────
  { type: 'fact', emoji: '📅', title: 'X ha 40 anni e non li dimostra',
    text: `X Window System è del <strong>1984</strong>. X11 (versione 11, tuttora in uso) è del <strong>1987</strong>. Wayland è del <strong>2008</strong>. Nonostante l'età, X11 gira ancora su milioni di macchine perché il suo X forwarding via rete (SSH -X) è insostituibile in ambito server. L'esame LPIC-1 li chiede entrambi — non dare X11 per morto.` },

  // ── 8. Quiz: XWayland ────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Come girano le applicazioni X11 legacy in una sessione Wayland?',
    opts: [
      'Tramite XWayland, un server X embedded nella sessione Wayland',
      'Non possono girare: Wayland è incompatibile con X11',
      'Tramite un tunneling SSH automatico',
      'Tramite Xephyr, che emula un monitor virtuale'
    ],
    a: 0,
    explain: `XWayland è un server X11 completo che gira all'interno della sessione Wayland. Le app X11 si connettono a XWayland come farebbero con X.Org, e XWayland a sua volta si presenta come client Wayland al compositor. Trasparente per l'utente. 🌊` },

  // ── 9. Display manager ────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔐', title: 'Display manager: il portiere grafico',
    text: `Il <strong>display manager</strong> (DM) mostra la schermata di login grafico e avvia la sessione desktop.<br>
<br>
Principali display manager:<br>
• <strong>GDM</strong> (GNOME Display Manager) — usato da GNOME<br>
• <strong>SDDM</strong> (Simple Desktop Display Manager) — usato da KDE Plasma<br>
• <strong>LightDM</strong> — leggero, usato da XFCE, LXDE e altri<br>
• <strong>XDM</strong> — il display manager originale di X (obsoleto ma nell'esame)<br>
<br>
Si abilita come qualsiasi servizio systemd: <code>systemctl enable --now sddm</code><br>
<br>
TRAPPOLA! Display manager ≠ window manager. Il DM gestisce il login, il WM gestisce le finestre dopo il login.`,
    analogy: `Il display manager è il portiere del palazzo: ti verifica all'ingresso e ti porta nell'appartamento giusto (la sessione desktop che hai scelto).` },

  // ── 10. Quiz: display manager ─────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale display manager viene tipicamente usato con KDE Plasma?',
    opts: ['SDDM', 'GDM', 'LightDM', 'XDM'],
    a: 0,
    explain: `SDDM (Simple Desktop Display Manager) è il display manager di riferimento per KDE Plasma — stesso toolkit Qt. GDM è per GNOME (GTK). LightDM è DE-agnostico e usato da XFCE/LXDE. XDM è l'originale X Display Manager, vecchio e senza grafica moderna. 🔐` },

  // ── 11. WM vs DE ──────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🏗️', title: 'Window manager vs Desktop Environment',
    text: `<strong>Window Manager (WM)</strong>: gestisce SOLO le finestre (posizione, dimensione, bordi, decorazioni). È leggero e minimalista.<br>
Esempi: <strong>i3</strong>, <strong>Openbox</strong>, <strong>Fluxbox</strong>, <strong>Mutter</strong>, <strong>KWin</strong><br>
<br>
<strong>Desktop Environment (DE)</strong>: WM + file manager + pannelli + taskbar + applicazioni integrate + tema unificato.<br>
Esempi: <strong>KDE Plasma</strong>, <strong>GNOME</strong>, <strong>XFCE</strong>, <strong>LXDE/LXQt</strong><br>
<br>
Un DE <em>include</em> sempre un WM. Un WM standalone non include un DE.<br>
<br>
TRAPPOLA! I <strong>compositor</strong> (KWin, Mutter, sway) gestiscono anche la composizione delle finestre (trasparenze, ombre, animazioni). Su Wayland il compositor include anche il WM.`,
    analogy: `Il WM è il carpentiere che costruisce e sposta le stanze. Il DE è l'architetto + arredatore + portinaio + giardiniere: il pacchetto completo per vivere nel palazzo.` },

  // ── 12. Quiz: WM vs DE ────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale delle seguenti è un Window Manager standalone, non un Desktop Environment?',
    opts: ['i3', 'KDE Plasma', 'GNOME', 'XFCE'],
    a: 0,
    explain: `i3 è un tiling window manager puro: gestisce solo le finestre, nessun pannello, nessun file manager integrato, nessun tema. KDE Plasma, GNOME e XFCE sono Desktop Environment completi — includono ciascuno il proprio WM (KWin, Mutter, Xfwm4). 🏗️` },

  // ── 13. Accessibilità ─────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '♿', title: 'Accessibilità in Linux',
    text: `Linux ha un framework di accessibilità standard chiamato <strong>AT-SPI</strong> (Assistive Technology Service Provider Interface).<br>
<br>
Strumenti principali:<br>
• <strong>Orca</strong> — screen reader per non vedenti: legge il testo sullo schermo ad alta voce<br>
• <strong>Magnifier</strong> (gnome-magnifier, kmag) — lente d'ingrandimento per ipovedenti<br>
• <strong>Tastiera virtuale</strong> — per utenti con difficoltà motorie (onboard, kvkbd)<br>
• <strong>eSpeak / Festival</strong> — motori text-to-speech usati da Orca<br>
<br>
TRAPPOLA! L'esame chiede specificamente <strong>Orca</strong> come screen reader e <strong>AT-SPI</strong> come framework. Non inventarti nomi.`,
    analogy: `AT-SPI è come l'impianto di amplificazione del teatro: Orca (il microfono) si connette ad esso per amplificare il testo per chi non riesce a vederlo.` },

  // ── 14. Quiz: Orca e AT-SPI ───────────────────────────────────────────────────
  { type: 'quiz', q: 'Come si chiama lo screen reader standard del desktop Linux (GNOME)?',
    opts: ['Orca', 'NVDA', 'JAWS', 'eSpeak'],
    a: 0,
    explain: `Orca è lo screen reader open source di riferimento per GNOME/Linux. NVDA e JAWS sono screen reader per Windows. eSpeak è solo il motore text-to-speech usato da Orca, non lo screen reader in sé. Il framework sottostante è AT-SPI. ♿` },

  // ── 15. Ripasso Lampo ─────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🧩', title: '🧩 RIPASSO LAMPO — Modulo 6',
    text: `• <strong>X11</strong>: server X = controlla HW locale, client X = le applicazioni (terminologia invertita!)<br>
• <code>DISPLAY=:0</code> → variabile che dice alle app dove connettersi · <code>xdpyinfo</code> info display<br>
• <strong>Wayland</strong>: compositor unico, più sicuro · <strong>XWayland</strong> = compatibilità app X11 legacy<br>
• Display manager: <strong>GDM</strong> (GNOME) · <strong>SDDM</strong> (KDE) · <strong>LightDM</strong> · <strong>XDM</strong><br>
• <strong>WM</strong> = solo finestre (i3, Openbox) · <strong>DE</strong> = tutto il pacchetto (KDE, GNOME, XFCE)<br>
• Accessibilità: <strong>AT-SPI</strong> framework · <strong>Orca</strong> screen reader · magnifier · tastiera virtuale<br>
• <code>/etc/X11/xorg.conf</code>: sezioni Monitor/Device/Screen/ServerLayout · drop-in in <code>/etc/X11/xorg.conf.d/</code><br>
• <code>xrandr</code> risoluzione a runtime · <code>X -configure</code> genera xorg.conf di partenza` },

  // ── 16. Quiz: Wayland finale ──────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale protocollo grafico usa un singolo compositor che gestisce display, compositing e input?',
    opts: ['Wayland', 'X11', 'Mir', 'DirectFB'],
    a: 0,
    explain: `Wayland unifica tutto in un compositor unico. X11 separa il server X (display/input) dal compositor (che è un client X a parte, come Compiz o Compton). Mir era il tentativo di Canonical (Ubuntu) — abbandonato. DirectFB è un framebuffer diretto, non un display server. 🌊` },

  // ── 17. Input: DISPLAY ────────────────────────────────────────────────────────
  { type: 'input', q: 'Che valore ha tipicamente la variabile DISPLAY in una sessione grafica locale (primo display)?',
    accept: [':0', ':1', ':0.0', ':1.0'],
    placeholder: 'es. :0',
    explain: `Il formato è :display.screen. Il primo display locale è :0 (o :0.0 se si specifica anche lo schermo). Su sistemi con un solo utente grafico, :0 è quasi universale. Con Wayland la variabile DISPLAY può non essere impostata, ma WAYLAND_DISPLAY sarà impostata (es. wayland-1). 📺` },

  // ── 18. /etc/X11/xorg.conf ───────────────────────────────────────────────────
  { type: 'lesson', emoji: '⚙️', title: '/etc/X11/xorg.conf: configura il server X',
    text: `<code>/etc/X11/xorg.conf</code> è il file di configurazione principale del server X. Nei sistemi moderni X.Org rileva tutto automaticamente, quindi il file spesso non esiste — ma l'esame lo richiede.<br>
<br>
Struttura a <strong>sezioni</strong>:<br>
<code>Section "ServerLayout"</code> — collega schermi, tastiera, mouse<br>
<code>Section "Monitor"</code> — parametri del monitor (risoluzione, refresh)<br>
<code>Section "Device"</code> — driver GPU (<code>Driver "modesetting"</code>)<br>
<code>Section "Screen"</code> — combina Monitor + Device, definisce la risoluzione<br>
<code>Section "InputDevice"</code> — tastiera, mouse (spesso autogestiti)<br>
<br>
File di drop-in: <code>/etc/X11/xorg.conf.d/</code> — frammenti parziali (preferiti oggi)<br>
<code>/etc/X11/xorg.conf.d/10-keyboard.conf</code> — solo la tastiera<br>
<br>
Comandi utili:<br>
<code>X -configure</code> — genera un xorg.conf di partenza (richiede che X non sia attivo)<br>
<code>xrandr</code> — visualizza/modifica risoluzione e orientamento a runtime<br>
<code>xdpyinfo</code> — info dettagliate sul display corrente`,
    analogy: `xorg.conf è come il BIOS/UEFI della grafica: normalmente non lo tocchi perché il sistema si auto-configura, ma se qualcosa va storto (driver proprietario, monitor insolito) devi saperlo modificare.` },

  // ── 19. Quiz: xorg.conf ───────────────────────────────────────────────────────
  { type: 'quiz', q: 'In /etc/X11/xorg.conf, quale sezione collega Monitor e Device definendo la risoluzione della sessione?',
    opts: [
      'Section "Screen"',
      'Section "ServerLayout"',
      'Section "Monitor"',
      'Section "Device"'
    ],
    a: 0,
    explain: `<code>Section "Screen"</code> combina un Monitor e un Device (GPU) e definisce la profondità di colore e le risoluzioni disponibili. <code>ServerLayout</code> collega Screen, tastiera e mouse in un insieme. <code>Monitor</code> descrive solo le caratteristiche fisiche del monitor. <code>Device</code> specifica solo il driver GPU. ⚙️` },

  // ── 20. Missione: esplora il tuo ambiente grafico ────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: esplora il tuo ambiente grafico',
    text: `Scopri quale display manager, compositor e desktop environment stai usando sul tuo CachyOS.`,
    solution: `# Display manager attivo
systemctl status display-manager
# oppure
cat /etc/systemd/system/display-manager.service 2>/dev/null | grep ExecStart

# Sessione corrente (X11 o Wayland?)
echo $DISPLAY          # X11: mostra :0 o :1
echo $WAYLAND_DISPLAY  # Wayland: mostra wayland-1

# Desktop Environment
echo $XDG_CURRENT_DESKTOP
echo $DESKTOP_SESSION

# Informazioni display X11 (se in sessione X)
xdpyinfo | head -10

# Lista compositor/WM in esecuzione
ps aux | grep -E 'kwin|mutter|openbox|i3|sway' | grep -v grep` },

];
