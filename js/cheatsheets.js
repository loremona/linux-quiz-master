/* ═══════════ LINUX DOJO — Cheatsheet per modulo ═══════════
   Ogni voce è un oggetto { title, sections[] }
   section: { h: 'titolo', items: ['<code>cmd</code> — descrizione', ...] } */
'use strict';

const CHEATSHEETS = {

  m01: { title: '🧠 Com\'è fatto Linux',
    sections: [
      { h: 'Kernel & moduli', items: [
        '<code>dmesg</code> — messaggi kernel al boot',
        '<code>lsmod</code> — moduli kernel caricati',
        '<code>modprobe &lt;mod&gt;</code> — carica modulo e dipendenze',
        '<code>rmmod &lt;mod&gt;</code> — rimuovi modulo',
        '<code>modinfo &lt;mod&gt;</code> — info su un modulo',
        '<code>/proc/</code> — filesystem virtuale kernel (processi, info HW)',
        '<code>/sys/</code> — interfaccia sysfs ai dispositivi',
      ]},
      { h: 'Hardware', items: [
        '<code>lspci</code> — dispositivi PCI/PCIe',
        '<code>lsusb</code> — dispositivi USB',
        '<code>lscpu</code> — info CPU',
        '<code>udevadm info /dev/sda</code> — info udev su dispositivo',
        '<code>udevadm monitor</code> — eventi udev in tempo reale',
      ]},
      { h: 'systemd & boot', items: [
        '<code>systemctl start/stop/restart &lt;svc&gt;</code>',
        '<code>systemctl enable/disable &lt;svc&gt;</code>',
        '<code>systemctl enable --now &lt;svc&gt;</code> — abilita + avvia',
        '<code>systemctl status &lt;svc&gt;</code>',
        '<code>systemctl list-units --type=service</code>',
        '<code>systemctl get-default</code> — target di avvio',
        '<code>systemctl set-default graphical.target</code>',
        '<code>journalctl -b</code> — log boot corrente',
        '<code>journalctl -b -1</code> — boot precedente',
      ]},
      { h: 'Processi & segnali', items: [
        '<code>ps aux</code> — tutti i processi',
        '<code>kill -9 &lt;pid&gt;</code> — SIGKILL (forza)',
        '<code>kill -15 &lt;pid&gt;</code> — SIGTERM (gentile)',
        '<code>kill -1 &lt;pid&gt;</code> — SIGHUP (ricarica config)',
        '<code>pkill &lt;nome&gt;</code> — kill per nome processo',
      ]},
    ]
  },

  m02: { title: '📦 Pacchetti & installazione',
    sections: [
      { h: 'pacman (Arch/CachyOS)', items: [
        '<code>pacman -S &lt;pkg&gt;</code> — installa',
        '<code>pacman -R &lt;pkg&gt;</code> — rimuovi',
        '<code>pacman -Rs &lt;pkg&gt;</code> — rimuovi + dipendenze orfane',
        '<code>pacman -Ss &lt;termine&gt;</code> — cerca nei repo',
        '<code>pacman -Qs &lt;termine&gt;</code> — cerca nei pacchetti installati',
        '<code>pacman -Qe</code> — installati esplicitamente',
        '<code>pacman -Qdt</code> — dipendenze orfane',
        '<code>pacman -Qo /path/file</code> — quale pacchetto contiene il file',
        '<code>pacman -Syu</code> — aggiorna tutto il sistema',
      ]},
      { h: 'apt (Debian/Ubuntu)', items: [
        '<code>apt install &lt;pkg&gt;</code>',
        '<code>apt remove &lt;pkg&gt;</code> / <code>apt purge &lt;pkg&gt;</code>',
        '<code>apt search &lt;termine&gt;</code>',
        '<code>apt update</code> — aggiorna lista pacchetti (NON installa!)',
        '<code>apt upgrade</code> — installa aggiornamenti',
        '<code>dpkg -l</code> — lista pacchetti installati',
        '<code>dpkg -s &lt;pkg&gt;</code> — dettagli pacchetto',
        '<code>dpkg -S /path/file</code> — quale pacchetto contiene il file',
      ]},
      { h: 'rpm / dnf (RHEL)', items: [
        '<code>dnf install &lt;pkg&gt;</code>',
        '<code>dnf remove &lt;pkg&gt;</code>',
        '<code>rpm -q &lt;pkg&gt;</code> — è installato?',
        '<code>rpm -qi &lt;pkg&gt;</code> — info pacchetto',
        '<code>rpm -ql &lt;pkg&gt;</code> — file del pacchetto',
        '<code>rpm -qf /path/file</code> — quale pacchetto possiede il file',
      ]},
    ]
  },

  m03: { title: '⌨️ Comandi GNU & Unix',
    sections: [
      { h: 'File & directory', items: [
        '<code>ls -la</code> · <code>ls -lh</code> · <code>ls -lt</code> (per data)',
        '<code>cp -r src/ dst/</code> · <code>mv</code> · <code>rm -rf</code>',
        '<code>find . -name "*.log"</code> — cerca per nome',
        '<code>find . -type f -mtime -7</code> — modificati negli ultimi 7 giorni',
        '<code>find . -perm -4000</code> — file con SUID',
      ]},
      { h: 'Testo & filtri', items: [
        '<code>grep -r "pattern" dir/</code> — ricerca ricorsiva',
        '<code>grep -n -i "pattern" file</code> — con numero riga, case-insensitive',
        '<code>grep -v "pattern"</code> — righe che NON contengono',
        '<code>sed \'s/old/new/g\' file</code> — sostituisci tutto',
        '<code>awk \'{print $1, $3}\' file</code> — stampa colonne 1 e 3',
        '<code>sort -r -n file</code> — ordine inverso numerico',
        '<code>cut -d: -f1 /etc/passwd</code> — primo campo separato da :',
        '<code>wc -l file</code> — conta righe',
        '<code>tr \'a-z\' \'A-Z\'</code> — converti minuscolo→maiuscolo',
        '<code>head -n 20</code> · <code>tail -n 20</code> · <code>tail -f</code>',
      ]},
      { h: 'Pipe & redirect', items: [
        '<code>cmd &gt; file</code> — stdout su file (sovrascrive)',
        '<code>cmd &gt;&gt; file</code> — stdout su file (appende)',
        '<code>cmd 2&gt; err.log</code> — stderr su file',
        '<code>cmd 2&gt;&amp;1</code> — stderr → stdout',
        '<code>cmd1 | cmd2</code> — pipe',
        '<code>cmd &amp;</code> — esegui in background',
        '<code>jobs</code> · <code>fg %1</code> · <code>bg %1</code>',
      ]},
      { h: 'Processi', items: [
        '<code>ps aux | grep nome</code>',
        '<code>nice -n 10 cmd</code> — bassa priorità',
        '<code>renice -n -5 -p &lt;pid&gt;</code> — cambia priorità in corsa',
        '<code>nohup cmd &amp;</code> — sopravvive alla chiusura del terminale',
      ]},
      { h: 'vi / vim', items: [
        '<code>i</code> inserisci · <code>Esc</code> normal · <code>:wq</code> salva+esci',
        '<code>:q!</code> esci senza salvare · <code>/pattern</code> cerca · <code>n</code> prossimo',
        '<code>dd</code> cancella riga · <code>yy</code> copia · <code>p</code> incolla',
      ]},
    ]
  },

  m04: { title: '💾 Dischi & filesystem',
    sections: [
      { h: 'Disco & partizioni', items: [
        '<code>lsblk</code> — struttura dischi/partizioni',
        '<code>fdisk /dev/sda</code> — partiziona (MBR)',
        '<code>gdisk /dev/sda</code> — partiziona (GPT)',
        '<code>mkfs.ext4 /dev/sda1</code> — formatta',
        '<code>mkfs.xfs /dev/sda1</code> — formato XFS',
        '<code>blkid</code> — UUID e tipo filesystem',
      ]},
      { h: 'Mount & fstab', items: [
        '<code>mount /dev/sda1 /mnt</code>',
        '<code>mount -t ext4 /dev/sda1 /mnt</code>',
        '<code>umount /mnt</code>',
        '<code>mount -a</code> — monta tutto /etc/fstab',
        '<code>/etc/fstab</code>: UUID · mountpoint · fs · opzioni · dump · pass',
      ]},
      { h: 'Spazio & integrità', items: [
        '<code>df -h</code> — spazio filesystem',
        '<code>du -sh dir/</code> — spazio directory',
        '<code>fsck /dev/sda1</code> — controlla filesystem (unmounted!)',
        '<code>e2fsck -f /dev/sda1</code> — check ext forzato',
      ]},
      { h: 'Permessi', items: [
        '<code>chmod 755 file</code> / <code>chmod u+x file</code>',
        '<code>chown user:group file</code>',
        '<code>chmod 4755 file</code> — SUID',
        '<code>chmod 2755 dir/</code> — SGID',
        '<code>chmod 1777 /tmp</code> — sticky bit',
        'SUID=4 · SGID=2 · Sticky=1',
      ]},
      { h: 'Link', items: [
        '<code>ln file link</code> — hard link',
        '<code>ln -s /path/to/orig link</code> — symlink',
        '<code>readlink -f symlink</code> — percorso reale',
      ]},
    ]
  },

  m05: { title: '🐚 Shell & scripting',
    sections: [
      { h: 'Variabili', items: [
        '<code>VAR="valore"</code> — assegna (no spazi!)',
        '<code>echo $VAR</code> · <code>echo "${VAR}"</code>',
        '<code>export VAR</code> — rendi disponibile ai figli',
        '<code>unset VAR</code> — rimuovi variabile',
        '<code>readonly VAR</code> — variabile di sola lettura',
        '<code>$0</code>=script · <code>$1..$9</code>=argomenti · <code>$#</code>=numero argomenti',
        '<code>$?</code>=exit code · <code>$$</code>=PID script · <code>$@</code>=tutti gli argomenti',
      ]},
      { h: 'Quoting & espansioni', items: [
        '<code>"..."</code> — preserva spazi, espande $VAR e `cmd`',
        '<code>\'...\'</code> — preserva tutto letteralmente',
        '<code>$(cmd)</code> — command substitution',
        '<code>${VAR:-default}</code> — usa default se VAR vuota',
      ]},
      { h: 'Bash startup', items: [
        '<code>~/.bashrc</code> — eseguito per shell interattive non-login',
        '<code>~/.bash_profile</code> — eseguito per shell di login',
        '<code>/etc/profile</code> — globale login shell',
        '<code>/etc/bash.bashrc</code> — globale non-login (Debian)',
        '<code>alias ll=\'ls -la\'</code> — definisci alias',
        '<code>source ~/.bashrc</code> / <code>. ~/.bashrc</code> — ricarica',
      ]},
      { h: 'Controllo di flusso', items: [
        '<code>if [ cond ]; then ... elif ...; else ...; fi</code>',
        '<code>for i in 1 2 3; do echo $i; done</code>',
        '<code>for f in *.log; do rm "$f"; done</code>',
        '<code>while [ cond ]; do ...; done</code>',
        '<code>until [ cond ]; do ...; done</code>',
        '<code>case $VAR in a) ... ;; b) ... ;; *) ... ;; esac</code>',
      ]},
      { h: 'Test & operatori', items: [
        '<code>[ -f file ]</code> esiste ed è file · <code>[ -d dir ]</code> è directory',
        '<code>[ -z "$VAR" ]</code> stringa vuota · <code>[ -n "$VAR" ]</code> non vuota',
        '<code>[ "$a" -eq "$b" ]</code> numeri uguali · <code>-ne -lt -gt -le -ge</code>',
        '<code>[ "$a" = "$b" ]</code> stringhe uguali · <code>!=</code>',
        '<code>&amp;&amp;</code> AND corto · <code>||</code> OR corto',
        '<code>set -e</code> esci al primo errore · <code>set -u</code> errore su var undef',
      ]},
    ]
  },

  m06: { title: '🖥️ Interfacce grafiche',
    sections: [
      { h: 'X11', items: [
        '<code>$DISPLAY</code> — dove connettono le app X (es. :0)',
        'Server X = controlla schermo/tastiera/mouse (NON le app!)',
        'Client X = l\'app (Firefox, terminale)',
        '<code>xdpyinfo</code> — info display',
        '<code>ssh -X user@host</code> — X forwarding remoto',
        '<code>xhost +localhost</code> — permetti connessioni locali',
      ]},
      { h: 'Wayland', items: [
        '<code>$WAYLAND_DISPLAY</code> — es. wayland-1',
        'Compositor unico (KWin, Mutter, sway) gestisce tutto',
        '<code>XWayland</code> — app X11 legacy in sessione Wayland',
        'Più sicuro di X11 (no intercettazione input tra app)',
      ]},
      { h: 'Display manager', items: [
        '<code>GDM</code> — GNOME Display Manager',
        '<code>SDDM</code> — KDE Plasma',
        '<code>LightDM</code> — XFCE, LXDE, leggero',
        '<code>XDM</code> — originale X (vecchio)',
        '<code>systemctl enable --now sddm</code>',
      ]},
      { h: 'WM vs DE', items: [
        'WM (Window Manager): solo finestre — i3, Openbox, Fluxbox',
        'DE (Desktop Environment): WM + file manager + pannelli',
        'KDE Plasma · GNOME · XFCE · LXDE/LXQt',
      ]},
      { h: 'Accessibilità', items: [
        '<code>AT-SPI</code> — framework accessibilità Linux',
        '<code>Orca</code> — screen reader (non NVDA, non JAWS!)',
        'Magnifier, tastiera virtuale (onboard)',
        'eSpeak/Festival = motori TTS usati da Orca',
      ]},
    ]
  },

  m07: { title: '👥 Amministrazione',
    sections: [
      { h: '/etc/passwd & shadow', items: [
        '<code>/etc/passwd</code>: user:x:UID:GID:GECOS:home:shell',
        '<code>x</code> nel campo password = password reale è in /etc/shadow',
        '<code>/etc/shadow</code>: hash $6$=SHA-512, $5$=SHA-256, ! =bloccato',
        '<code>/etc/group</code>: nome:x:GID:membri',
        '<code>id</code> — UID, GID, tutti i gruppi',
        '<code>getent passwd &lt;user&gt;</code> — info utente',
      ]},
      { h: 'Gestione utenti', items: [
        '<code>useradd -m -s /bin/bash -G wheel mario</code>',
        '<code>usermod -aG docker mario</code> — aggiunge gruppo (SEMPRE -a!)',
        '<code>usermod -L mario</code> — blocca account',
        '<code>usermod -U mario</code> — sblocca',
        '<code>userdel -r mario</code> — rimuovi utente + home',
        '<code>passwd mario</code> — cambia password',
        '<code>visudo</code> — modifica /etc/sudoers (sempre con visudo!)',
      ]},
      { h: 'cron', items: [
        '<code>crontab -e</code> · <code>-l</code> lista · <code>-r</code> rimuovi tutto',
        'Formato: <code>min ora dom mese dow comando</code>',
        '<code>* = qualsiasi · */5 = ogni 5 · 1,15 = lista</code>',
        'dow: 0=domenica, 1=lunedì … 7=domenica',
        '<code>/etc/cron.d/</code> · <code>/etc/cron.daily/</code>',
      ]},
      { h: 'at & systemd timer', items: [
        '<code>at 14:30</code> — una tantum (at vs cron = uno vs ripetitivo)',
        '<code>atq</code> — coda · <code>atrm N</code> — rimuovi',
        '<code>systemctl list-timers</code> — timer attivi con NEXT',
        '<code>anacron</code> — cron per macchine non sempre accese',
      ]},
      { h: 'Locale & timezone', items: [
        '<code>locale</code> — variabili locale correnti',
        '<code>LC_ALL</code> sovrascrive tutto · <code>LANG</code> = default',
        '<code>timedatectl</code> — ora, timezone, NTP',
        '<code>timedatectl set-timezone Europe/Rome</code>',
        '<code>/etc/localtime</code> → symlink a /usr/share/zoneinfo/...',
        '<code>localectl set-locale LANG=it_IT.UTF-8</code>',
      ]},
    ]
  },

  m08: { title: '⚙️ Servizi di sistema',
    sections: [
      { h: 'Ora & NTP', items: [
        '<code>date "+%Y-%m-%d %H:%M"</code> — formatta data',
        '<code>hwclock --show</code> — leggi RTC',
        '<code>hwclock --systohc</code> — sistema → hardware',
        '<code>hwclock --hctosys</code> — hardware → sistema',
        '<code>timedatectl set-ntp true</code> — abilita NTP',
        '<code>chronyc tracking</code> · <code>chronyc sources</code>',
      ]},
      { h: 'Log (journald)', items: [
        '<code>journalctl -b</code> — boot corrente',
        '<code>journalctl -b -1</code> — boot precedente',
        '<code>journalctl -u nginx</code> — log servizio',
        '<code>journalctl -p err</code> — err e più gravi',
        '<code>journalctl -f</code> — follow (real-time)',
        '<code>journalctl -n 50</code> — ultime 50 righe',
        '<code>journalctl --since "1 hour ago"</code>',
      ]},
      { h: 'Livelli syslog', items: [
        '0 emerg · 1 alert · 2 crit · 3 err',
        '4 warning · 5 notice · 6 info · 7 debug',
        '0 = più grave, 7 = meno grave!',
      ]},
      { h: '/var/log', items: [
        'Debian: <code>/var/log/syslog</code> · <code>/var/log/auth.log</code>',
        'RHEL: <code>/var/log/messages</code> · <code>/var/log/secure</code>',
        '<code>/var/log/wtmp</code> → <code>last</code> · <code>/var/log/btmp</code> → <code>lastb</code>',
        '<code>logrotate -f /etc/logrotate.conf</code> — forza rotazione',
      ]},
      { h: 'MTA & CUPS', items: [
        '<code>newaliases</code> dopo ogni modifica a /etc/aliases!',
        '<code>mailq</code> — coda di posta',
        '<code>lp file.txt</code> — stampa · <code>lp -d stampante file</code>',
        '<code>lpstat -p</code> — stampanti · <code>lpq</code> — coda · <code>lprm N</code> — cancella',
      ]},
    ]
  },

  m09: { title: '🌐 Networking',
    sections: [
      { h: 'IP & subnet', items: [
        'IPv4 = 32 bit, 4 ottetti (0-255)',
        'RFC1918: <code>10/8</code> · <code>172.16/12</code> · <code>192.168/16</code>',
        '/24 = 254 host · /25 = 126 · /16 = 65534 · /32 = 1 host',
        'Host = 2^(32-prefisso) − 2',
        '<code>127.0.0.1</code> = loopback · <code>::1</code> = loopback IPv6',
      ]},
      { h: 'Porte da ricordare', items: [
        '20/21 FTP · 22 SSH · 23 Telnet · 25 SMTP · 53 DNS',
        '67/68 DHCP · 80 HTTP · 110 POP3 · 123 NTP · 143 IMAP',
        '443 HTTPS · 587 SMTP-submission · 993 IMAPS · 995 POP3S',
      ]},
      { h: 'ip command', items: [
        '<code>ip addr show</code> — indirizzi interfacce',
        '<code>ip link set eth0 up/down</code>',
        '<code>ip route show</code> — tabella di routing',
        '<code>ip route get 8.8.8.8</code> — quale route per questo IP?',
        '<code>ip addr add 192.168.1.200/24 dev eth0</code> (temporaneo!)',
      ]},
      { h: 'DNS & hosts', items: [
        '<code>/etc/hosts</code>: IP nome alias (ha priorità sul DNS)',
        '<code>/etc/resolv.conf</code>: nameserver, search, domain',
        '<code>/etc/nsswitch.conf</code>: <code>hosts: files dns</code> = hosts prima',
        '<code>dig dominio [TIPO]</code> · <code>dig +short</code> · <code>dig @8.8.8.8</code>',
        '<code>dig -x 8.8.8.8</code> — reverse DNS',
        '<code>host google.com</code> · <code>nslookup google.com</code>',
      ]},
      { h: 'Diagnostica', items: [
        '<code>ping -c 4 8.8.8.8</code>',
        '<code>traceroute -n 8.8.8.8</code> · <code>mtr 8.8.8.8</code>',
        '<code>ss -tlnp</code> — TCP in ascolto con processi',
        '<code>ss -tnp</code> — connessioni TCP attive',
        '<code>ss -s</code> — statistiche socket',
      ]},
    ]
  },

  m10: { title: '🔐 Sicurezza',
    sections: [
      { h: 'sudo & su', items: [
        '<code>visudo</code> — SEMPRE per modificare /etc/sudoers',
        '<code>sudo -l</code> — cosa posso fare con sudo',
        '<code>sudo -i</code> — shell root (login shell)',
        '<code>su -</code> — diventa root con ambiente completo',
        '<code>su - mario</code> — diventa mario con il suo ambiente',
      ]},
      { h: 'Bit speciali', items: [
        'SUID: <code>-rw<strong>s</strong>r-xr-x</code> · esegue come proprietario del file',
        'SGID: <code>-rwxr-<strong>s</strong>r-x</code> · su dir: figli ereditano il gruppo',
        'Sticky: <code>drwxrwxrw<strong>t</strong></code> · solo proprietario elimina file (/tmp)',
        '<code>chmod 4755</code> SUID · <code>chmod 2755</code> SGID · <code>chmod 1777</code> sticky',
        '<code>find / -perm -4000</code> — file con SUID',
        'S maiuscola = bit impostato ma x non presente (inattivo!)',
      ]},
      { h: 'ulimit & monitoraggio', items: [
        '<code>ulimit -a</code> — tutti i limiti',
        '<code>ulimit -n 4096</code> — max file aperti',
        '<code>/etc/security/limits.conf</code> — limiti persistenti',
        '<code>who</code> · <code>w</code> — sessioni attive',
        '<code>last</code> — storico login (da /var/log/wtmp)',
        '<code>lastb</code> — login falliti (da /var/log/btmp)',
        '<code>lastlog</code> — ultimo login di ogni utente',
      ]},
      { h: 'TCP wrappers', items: [
        '<code>/etc/hosts.allow</code> → <code>/etc/hosts.deny</code> → default = ALLOW!',
        '<code>ALL: ALL</code> in deny per bloccare tutto di default',
        'Formato: <code>servizio: host/rete</code>',
      ]},
      { h: 'SSH', items: [
        '<code>ssh-keygen -t ed25519 -C "me@host"</code>',
        'Privata: <code>~/.ssh/id_ed25519</code> (chmod 600!)',
        'Pubblica: <code>~/.ssh/id_ed25519.pub</code>',
        '<code>ssh-copy-id user@server</code> — copia pubblica su server',
        '<code>~/.ssh/authorized_keys</code> — chiavi autorizzate (chmod 600)',
        '<code>/etc/ssh/sshd_config</code>: PermitRootLogin no, PasswordAuthentication no',
        '<code>systemctl reload sshd</code> dopo ogni modifica',
      ]},
      { h: 'GPG', items: [
        '<code>gpg --gen-key</code> — genera coppia',
        '<code>gpg --list-keys</code> / <code>--list-secret-keys</code>',
        '<code>gpg --encrypt --recipient mario file</code> — cifra',
        '<code>gpg --decrypt file.gpg</code> — decifra',
        '<code>gpg --sign file</code> — firma (contenuto cifrato)',
        '<code>gpg --clearsign file</code> — firma in chiaro',
        '<code>gpg --verify file.gpg</code> — verifica firma',
      ]},
    ]
  },

};
