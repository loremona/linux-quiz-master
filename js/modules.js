/* ═══════════ Registro moduli LPIC-1 ═══════════
   I moduli senza card risultano "🔒 in arrivo" nella home.
   Ogni checkpoint aggiunge un file js/data/moduleNN.js e lo registra qui. */
'use strict';

const MODULES = [
  { id: 'm01', icon: '🧠', title: 'Com\'è fatto Linux',      sub: 'Kernel, boot, systemd, processi',      cards: (typeof MODULE01 !== 'undefined') ? MODULE01 : [], extra: (typeof MODULE01_QUIZ !== 'undefined') ? MODULE01_QUIZ : [] },
  { id: 'm02', icon: '📦', title: 'Pacchetti & installazione', sub: 'pacman, AUR, apt, dnf, GRUB',         cards: (typeof MODULE02 !== 'undefined') ? MODULE02 : [] },
  { id: 'm03', icon: '⌨️', title: 'Comandi GNU & Unix',      sub: 'File, pipe, grep, regex, vi',          cards: (typeof MODULE03 !== 'undefined') ? MODULE03 : [] },
  { id: 'm04', icon: '💾', title: 'Dischi & filesystem',     sub: 'Partizioni, mount, permessi, FHS',     cards: (typeof MODULE04 !== 'undefined') ? MODULE04 : [] },
  { id: 'm05', icon: '🐚', title: 'Shell & scripting',       sub: 'Bash, variabili, script',              cards: (typeof MODULE05 !== 'undefined') ? MODULE05 : [] },
  { id: 'm06', icon: '🖥️', title: 'Interfacce grafiche',     sub: 'X11, Wayland, desktop',                cards: (typeof MODULE06 !== 'undefined') ? MODULE06 : [] },
  { id: 'm07', icon: '👥', title: 'Amministrazione',         sub: 'Utenti, gruppi, cron',                 cards: (typeof MODULE07 !== 'undefined') ? MODULE07 : [] },
  { id: 'm08', icon: '⚙️', title: 'Servizi di sistema',      sub: 'NTP, log, mail, stampa',               cards: (typeof MODULE08 !== 'undefined') ? MODULE08 : [] },
  { id: 'm09', icon: '🌐', title: 'Networking',              sub: 'IP, porte, DNS, troubleshooting',      cards: (typeof MODULE09 !== 'undefined') ? MODULE09 : [] },
  { id: 'm10', icon: '🔐', title: 'Sicurezza',               sub: 'sudo, SSH, GPG, permessi speciali',    cards: (typeof MODULE10 !== 'undefined') ? MODULE10 : [] },
];
