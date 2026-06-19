/* ═══════════ MODULO 9 — Networking ═══════════
   Obiettivi LPI: 109.1–109.4
   ~35 card · 14 quiz (di cui 1 input, 3 missioni) */
'use strict';

const MODULE09 = [

  // ── 1. Benvenuto ─────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🌐', title: 'Modulo 9: Networking',
    text: `Il modulo più pratico dell'esame. Quattro topic:<br>
• <strong>109.1</strong> — Protocolli: IPv4, CIDR, TCP/UDP, porte<br>
• <strong>109.2</strong> — Configurazione: ip, ifconfig, hostname, NetworkManager<br>
• <strong>109.3</strong> — Troubleshooting: ping, traceroute, ss, netstat<br>
• <strong>109.4</strong> — DNS client: /etc/hosts, resolv.conf, nsswitch.conf, dig<br>
<br>
Questo è il modulo dove la teoria diventa pratica sul tuo CachyOS.`,
    analogy: `Il networking è come la rete postale della città: ogni casa ha un indirizzo (IP), le strade sono i cavi (instradamento), il codice postale è la subnet, e il centralino DNS è l'elenco telefonico che traduce nomi in indirizzi.` },

  // ── 2. IPv4 ───────────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔢', title: 'IPv4: 32 bit, 4 ottetti',
    text: `Un indirizzo IPv4 è composto da <strong>32 bit</strong> scritti come 4 ottetti decimali separati da punti:<br>
<code>192.168.1.105</code> → <code>11000000.10101000.00000001.01101001</code><br>
<br>
Ogni ottetto va da 0 a 255.<br>
<br>
Indirizzi speciali:<br>
• <code>127.0.0.1</code> — loopback (la macchina parla con se stessa)<br>
• <code>0.0.0.0</code> — "qualsiasi interfaccia" (wildcard)<br>
• <code>255.255.255.255</code> — broadcast limitato<br>
<br>
<strong>Indirizzi privati RFC 1918</strong> (non instradabili su Internet):<br>
• <code>10.0.0.0/8</code> — Classe A privata<br>
• <code>172.16.0.0/12</code> — Classe B privata (172.16–172.31)<br>
• <code>192.168.0.0/16</code> — Classe C privata<br>
<br>
TRAPPOLA! 172.16.0.0/12 copre 172.16.x.x fino a 172.31.x.x, non solo 172.16.x.x.`,
    analogy: `Un IP è come un numero civico completo: nazione (ottetto 1) + città (ottetto 2) + quartiere (ottetto 3) + numero casa (ottetto 4). RFC1918 sono i numeri civici degli appartamenti privati: reali dentro casa, invisibili dall'esterno.` },

  // ── 3. CIDR e subnet mask ─────────────────────────────────────────────────────
  { type: 'lesson', emoji: '✂️', title: 'CIDR: il /24 che tutti usano',
    text: `La notazione <strong>CIDR</strong> indica quanti bit sono la parte "rete":<br>
<br>
<code>/8</code> → mask <code>255.0.0.0</code> → 16.777.214 host<br>
<code>/16</code> → mask <code>255.255.0.0</code> → 65.534 host<br>
<code>/24</code> → mask <code>255.255.255.0</code> → 254 host<br>
<code>/25</code> → mask <code>255.255.255.128</code> → 126 host<br>
<code>/32</code> → mask <code>255.255.255.255</code> → 1 solo host<br>
<br>
In una subnet /24 (es. 192.168.1.0/24):<br>
• Indirizzo di rete: <code>192.168.1.0</code> (non assegnabile)<br>
• Primo host: <code>192.168.1.1</code><br>
• Ultimo host: <code>192.168.1.254</code><br>
• Broadcast: <code>192.168.1.255</code> (non assegnabile)<br>
<br>
TRAPPOLA! Host utilizzabili = 2^(32-prefisso) - 2 (togli rete e broadcast).`,
    analogy: `Il prefisso CIDR è come il codice postale: /24 = stessa via (tutti i 192.168.1.x), /16 = stesso quartiere (192.168.x.x), /8 = stessa città (10.x.x.x). Più è piccolo il numero, più è grande il quartiere.` },

  // ── 4. Quiz: CIDR ─────────────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quanti host utilizzabili ci sono in una subnet /24?',
    opts: ['254', '256', '255', '253'],
    a: 0,
    explain: `/24 → 2^8 = 256 indirizzi totali. Togli l'indirizzo di rete (.0) e il broadcast (.255): restano <strong>254</strong> host utilizzabili. La formula è sempre 2^(32-prefisso) - 2. ✂️` },

  // ── 5. TCP, UDP e porte ───────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🚪', title: 'TCP, UDP e le porte',
    text: `I due protocolli di trasporto principali:<br>
<br>
<strong>TCP</strong> — affidabile, con connessione, ordine garantito<br>
Usa handshake a 3 vie: SYN → SYN-ACK → ACK<br>
Usato da: HTTP, HTTPS, SSH, FTP, SMTP<br>
<br>
<strong>UDP</strong> — veloce, senza connessione, no garanzie d'ordine<br>
Usato da: DNS, DHCP, NTP, streaming, gaming<br>
<br>
Le <strong>porte</strong> identificano il servizio sul host (0–65535):<br>
• <code>0–1023</code> — Well-known (root per aprirle)<br>
• <code>1024–49151</code> — Registered<br>
• <code>49152–65535</code> — Dynamic/ephemeral<br>
<br>
Il file <code>/etc/services</code> mappa nome → porta/protocollo:<br>
<code>ssh     22/tcp</code><br>
<code>domain  53/tcp  # DNS usa anche TCP per risposte grandi</code>`,
    analogy: `IP è l'indirizzo del palazzo, la porta è il numero dell'appartamento. TCP è il corriere che suona e aspetta la firma; UDP è quello che lascia il pacco davanti alla porta senza aspettare.` },

  // ── 6. Porte note ─────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '📋', title: 'Le porte che l\'esame chiede SEMPRE',
    text: `Memorizza queste porte — sono la classica lista dell'esame LPIC-1:<br>
<br>
<code>20/21</code> — FTP (dati/controllo)<br>
<code>22</code> — SSH<br>
<code>23</code> — Telnet (non sicuro!)<br>
<code>25</code> — SMTP (invio email)<br>
<code>53</code> — DNS (TCP + UDP)<br>
<code>67/68</code> — DHCP (server/client)<br>
<code>80</code> — HTTP<br>
<code>110</code> — POP3<br>
<code>123</code> — NTP<br>
<code>143</code> — IMAP<br>
<code>161/162</code> — SNMP<br>
<code>443</code> — HTTPS<br>
<code>587</code> — SMTP submission (con auth)<br>
<code>993</code> — IMAPS<br>
<code>995</code> — POP3S<br>
<code>3306</code> — MySQL<br>
<code>5432</code> — PostgreSQL<br>
<br>
TRAPPOLA! DNS usa 53 sia TCP che UDP. FTP ha due porte diverse (20 dati, 21 controllo).` },

  // ── 7. Quiz: porte note ───────────────────────────────────────────────────────
  { type: 'quiz', q: 'Su quale porta lavora il protocollo SSH?',
    opts: ['22', '23', '21', '443'],
    a: 0,
    explain: `SSH = porta <strong>22</strong>. Telnet (non sicuro, da non usare) = 23. FTP controllo = 21. HTTPS = 443. Se un esaminatore chiede "quale servizio usa la porta 23?", la risposta è Telnet — ed è una domanda trabocchetto perché tutti pensano a SSH. 🚪` },

  // ── 8. ip command: interfacce ─────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔧', title: 'ip: lo strumento moderno per la rete',
    text: `Il comando <code>ip</code> (da iproute2) ha sostituito i vecchi <code>ifconfig</code>, <code>route</code>, <code>arp</code>.<br>
<br>
Gestione indirizzi:<br>
<code>ip addr show</code> — mostra indirizzi di tutte le interfacce<br>
<code>ip addr show eth0</code> — solo eth0<br>
<code>ip addr add 192.168.1.200/24 dev eth0</code> — aggiungi IP (temporaneo!)<br>
<code>ip addr del 192.168.1.200/24 dev eth0</code> — rimuovi IP<br>
<br>
Gestione link (interfacce):<br>
<code>ip link show</code> — mostra interfacce (UP/DOWN, MAC)<br>
<code>ip link set eth0 up</code> — attiva interfaccia<br>
<code>ip link set eth0 down</code> — disattiva<br>
<br>
TRAPPOLA! Le modifiche con <code>ip addr add</code> sono <strong>temporanee</strong>: si perdono al riavvio. Per la persistenza serve NetworkManager o i file di configurazione della distro.`,
    analogy: `<code>ip</code> è il pannello di controllo della rete: puoi vedere, accendere, spegnere e configurare ogni "presa di corrente" (interfaccia) del palazzo. Ma se stacchi la corrente (riavvio), le impostazioni temporanee scompaiono.` },

  // ── 9. Terminal: ip addr ──────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔧', title: 'ip addr show',
    cmd: 'ip addr show',
    out: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether aa:bb:cc:dd:ee:ff brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.105/24 brd 192.168.1.255 scope global eth0
    inet6 fe80::a8bb:ccff:fedd:eeff/64 scope link` },

  // ── 10. ip route ─────────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🗺️', title: 'ip route: dove mando i pacchetti',
    text: `La tabella di routing decide dove inviare ogni pacchetto.<br>
<br>
<code>ip route show</code> — mostra la tabella di routing<br>
<code>ip route add default via 192.168.1.1</code> — imposta il gateway di default<br>
<code>ip route add 10.0.0.0/8 via 192.168.1.254</code> — route statica<br>
<code>ip route del default</code> — rimuovi il default gateway<br>
<code>ip route get 8.8.8.8</code> — quale route viene usata per raggiungere 8.8.8.8?<br>
<br>
Output tipico di <code>ip route show</code>:<br>
<code>default via 192.168.1.1 dev eth0</code> → gateway di default<br>
<code>192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.105</code> → rete locale` },

  // ── 11. Terminal: ip route ────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🗺️', title: 'Tabella di routing',
    cmd: 'ip route show && echo "---" && ip route get 8.8.8.8',
    out: `default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.105 metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.105 metric 100
---
8.8.8.8 via 192.168.1.1 dev eth0 src 192.168.1.105 uid 1000
    cache` },

  // ── 12. Quiz: ip vs ifconfig ──────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando MODERNO mostra gli indirizzi IP di tutte le interfacce?',
    opts: ['ip addr show', 'ifconfig -a', 'netstat -i', 'ipconfig /all'],
    a: 0,
    explain: `<code>ip addr show</code> è il comando moderno (iproute2). <code>ifconfig -a</code> è il vecchio net-tools (ancora funziona ma deprecato). <code>netstat -i</code> mostra statistiche interfacce, non indirizzi. <code>ipconfig /all</code> è Windows. L'esame accetta entrambi ip e ifconfig ma preferisce ip. 🔧` },

  // ── 109.2 extra: NetworkManager / nmcli ─────────────────────────────────────
  { type: 'lesson', emoji: '📡', title: 'NetworkManager e nmcli',
    text: `<strong>NetworkManager</strong> è il demone che gestisce le connessioni di rete su molte distro.<br>
<code>nmcli</code> — interfaccia CLI · <code>nmtui</code> — interfaccia testuale (TUI)<br>
<br>
Comandi nmcli essenziali:<br>
<code>nmcli device status</code> — mostra tutte le interfacce e il loro stato<br>
<code>nmcli connection show</code> — lista le connessioni configurate<br>
<code>nmcli connection up "Nome WiFi"</code> — attiva una connessione<br>
<code>nmcli connection down eth0</code> — disattiva<br>
<code>nmcli device wifi list</code> — scansiona reti WiFi<br>
<code>nmcli device wifi connect "SSID" password "pass"</code> — connetti a WiFi<br>
<br>
I file di configurazione stanno in <code>/etc/NetworkManager/system-connections/</code><br>
<br>
TRAPPOLA! Su sistemi con NetworkManager, modificare <code>/etc/network/interfaces</code> o i file in <code>/etc/sysconfig/network-scripts/</code> potrebbe essere ignorato — NM gestisce tutto lui.`,
    analogy: `NetworkManager è il gestore automatico degli appartamenti: appena entri con il laptop, lui trova la rete, si connette e ti assegna l'IP. nmcli è il telefono per dargli ordini a voce. nmtui è il pannello di controllo sul muro. 📡` },

  { type: 'quiz', q: 'Quale comando nmcli mostra lo stato di tutte le interfacce di rete?',
    opts: [
      'nmcli device status',
      'nmcli connection list',
      'nmcli show all',
      'nmcli interface status'
    ],
    a: 0,
    explain: `<code>nmcli device status</code> mostra dispositivi, tipo, stato (connected/disconnected/unmanaged) e la connessione attiva. <code>nmcli connection show</code> mostra le connessioni salvate, non i device. <code>nmcli show all</code> e <code>nmcli interface status</code> non esistono come sintassi valida. 📡` },

  // ── 13. hostname e hostnamectl ───────────────────────────────────────────────
  { type: 'lesson', emoji: '🏷️', title: 'hostname: il nome della macchina',
    text: `Il <strong>hostname</strong> è il nome con cui il sistema si identifica in rete.<br>
<br>
<code>hostname</code> — mostra il nome corrente<br>
<code>hostname -f</code> — FQDN (fully qualified domain name: nome.dominio.tld)<br>
<code>hostname -i</code> — indirizzo IP associato<br>
<br>
Con systemd:<br>
<code>hostnamectl</code> — mostra hostname, kernel, architettura<br>
<code>hostnamectl set-hostname cachyos-lore</code> — imposta permanentemente<br>
<br>
File coinvolti:<br>
• <code>/etc/hostname</code> — contiene il nome della macchina (persistente)<br>
• <code>/etc/hosts</code> — mappa nome↔IP locale (vedi prossima card)<br>
<br>
Tipi di hostname su systemd:<br>
• <strong>static</strong>: salvato in /etc/hostname<br>
• <strong>pretty</strong>: con spazi e caratteri speciali (solo per display)<br>
• <strong>transient</strong>: impostato dal DHCP, va via al riavvio` },

  // ── 14. /etc/hosts ───────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '📖', title: '/etc/hosts: il DNS locale',
    text: `<code>/etc/hosts</code> risolve nomi in indirizzi IP <strong>senza passare dal DNS</strong>.<br>
<br>
Formato: <code>indirizzo-IP   nome-host   [alias...]</code><br>
<br>
Contenuto tipico:<br>
<code>127.0.0.1   localhost</code><br>
<code>127.0.1.1   cachyos-lore</code><br>
<code>192.168.1.10   server   server.lan</code><br>
<br>
Uso pratico:<br>
• Bloccare siti: <code>0.0.0.0   ads.example.com</code><br>
• Testare siti in sviluppo: <code>127.0.0.1   myapp.local</code><br>
• Risolvere host interni senza DNS<br>
<br>
TRAPPOLA! /etc/hosts ha priorità sul DNS <em>solo se</em> <code>/etc/nsswitch.conf</code> lo dice (di default è così: <code>hosts: files dns</code>). E la riga <code>127.0.1.1 hostname</code> deve combaciare con quello in /etc/hostname.`,
    analogy: `/etc/hosts è la rubrica cartacea personale: cerchi prima lì, e solo se non trovi chiami l'elenco telefonico (DNS).` },

  // ── 15. Terminal: /etc/hosts ─────────────────────────────────────────────────
  { type: 'terminal', emoji: '📖', title: 'Leggi /etc/hosts',
    cmd: 'cat /etc/hosts',
    out: `# Static table lookup for hostnames.
# See hosts(5) for details.
127.0.0.1   localhost
127.0.1.1   cachyos-lore
::1         localhost ip6-localhost ip6-loopback
ff02::1     ip6-allnodes
ff02::2     ip6-allrouters
192.168.1.10  nas  nas.lan` },

  // ── 16. Quiz: /etc/hosts ──────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale file usi per far risolvere "myapp.local" a 127.0.0.1 SENZA modificare il DNS?',
    opts: ['/etc/hosts', '/etc/resolv.conf', '/etc/hostname', '/etc/nsswitch.conf'],
    a: 0,
    explain: `<code>/etc/hosts</code> risolve localmente prima del DNS (per default). Aggiungi <code>127.0.0.1 myapp.local</code> e il sistema non consulterà mai il DNS per quel nome. /etc/resolv.conf indica i server DNS da consultare. /etc/nsswitch.conf controlla l'ordine, ma non contiene le mappature. 📖` },

  // ── 17. /etc/resolv.conf ─────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔍', title: '/etc/resolv.conf: i tuoi server DNS',
    text: `<code>/etc/resolv.conf</code> configura il client DNS del sistema.<br>
<br>
Direttive principali:<br>
<code>nameserver 8.8.8.8</code> — server DNS primario (max 3)<br>
<code>nameserver 1.1.1.1</code> — server DNS secondario<br>
<code>search lan.local</code> — dominio di ricerca (prova "host.lan.local" se "host" non risolve)<br>
<code>domain casa.lan</code> — dominio locale di default<br>
<br>
TRAPPOLA! Su sistemi con NetworkManager o systemd-resolved, <strong>non modificare /etc/resolv.conf a mano</strong>: viene rigenerato automaticamente e le modifiche si perdono.<br>
Su Arch/CachyOS con NetworkManager: il DNS si imposta in NetworkManager.<br>
<code>resolvectl status</code> — mostra i DNS in uso con systemd-resolved.` },

  // ── 18. Terminal: resolv.conf ────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔍', title: 'DNS configurati',
    cmd: 'cat /etc/resolv.conf',
    out: `# Generated by NetworkManager
search lan
nameserver 192.168.1.1
nameserver 8.8.8.8` },

  // ── 19. /etc/nsswitch.conf ───────────────────────────────────────────────────
  { type: 'lesson', emoji: '⚖️', title: '/etc/nsswitch.conf: chi ha la priorità?',
    text: `<code>/etc/nsswitch.conf</code> (Name Service Switch) definisce <strong>l'ordine</strong> in cui il sistema cerca informazioni.<br>
<br>
Riga più importante per la rete:<br>
<code>hosts: files dns</code> — prima /etc/hosts, poi DNS<br>
<code>hosts: dns files</code> — prima DNS, poi /etc/hosts<br>
<code>hosts: files mdns4_minimal [NOTFOUND=return] dns</code> — con mDNS (Bonjour)<br>
<br>
Altre righe:<br>
<code>passwd: files</code> — utenti da /etc/passwd<br>
<code>group:  files</code> — gruppi da /etc/group<br>
<code>shadow: files</code> — password da /etc/shadow<br>
<br>
TRAPPOLA! Se la riga hosts è <code>files dns</code> (il default), /etc/hosts ha SEMPRE la precedenza sul DNS. Se vuoi il DNS prima, devi cambiare l'ordine.`,
    analogy: `nsswitch.conf è l'arbitro: "Prima chiedi a casa (/etc/hosts), poi chiama il centralino (DNS)". Se vuoi cambiare le priorità, devi convincere l'arbitro.` },

  // ── 20. Quiz: nsswitch.conf ───────────────────────────────────────────────────
  { type: 'quiz', q: 'Con "hosts: files dns" in nsswitch.conf, in quale ordine il sistema risolve i nomi?',
    opts: [
      'Prima /etc/hosts, poi i server DNS in /etc/resolv.conf',
      'Prima i server DNS, poi /etc/hosts',
      'Solo /etc/hosts, DNS non viene mai consultato',
      'Solo DNS, /etc/hosts è ignorato'
    ],
    a: 0,
    explain: `<code>files</code> = /etc/hosts, <code>dns</code> = server in /etc/resolv.conf. L'ordine è sinistro→destra: prima files, poi dns. Vuoi invertire? Cambia in <code>dns files</code>. Questo spiega perché bloccare un sito in /etc/hosts funziona anche se il DNS punta all'IP corretto. ⚖️` },

  // ── 21. ping e traceroute ────────────────────────────────────────────────────
  { type: 'lesson', emoji: '📡', title: 'ping e traceroute: diagnosi di rete',
    text: `<strong>ping</strong> — verifica la raggiungibilità di un host via ICMP:<br>
<code>ping 8.8.8.8</code> — ping continuo (Ctrl+C per fermare)<br>
<code>ping -c 4 8.8.8.8</code> — solo 4 pacchetti<br>
<code>ping -i 2 8.8.8.8</code> — intervallo di 2 secondi<br>
<code>ping -s 1400 8.8.8.8</code> — pacchetti da 1400 byte (test MTU)<br>
<br>
<strong>traceroute</strong> — mostra il percorso dei pacchetti hop per hop:<br>
<code>traceroute 8.8.8.8</code><br>
<code>traceroute -n 8.8.8.8</code> — senza risoluzione DNS (più veloce)<br>
<code>tracepath 8.8.8.8</code> — simile, senza root, con MTU path discovery<br>
<code>mtr 8.8.8.8</code> — ping + traceroute in tempo reale (più completo)<br>
<br>
TRAPPOLA! I firewall possono bloccare ICMP: un ping fallito non significa che l'host è spento — potrebbe solo bloccare i ping.`,
    analogy: `ping è come bussare alla porta e aspettare risposta. traceroute è come seguire fisicamente il corriere: vedi ogni ufficio postale che tocca prima di arrivare a destinazione.` },

  // ── 22. Terminal: ping ────────────────────────────────────────────────────────
  { type: 'terminal', emoji: '📡', title: 'ping e traceroute',
    cmd: 'ping -c 3 8.8.8.8',
    out: `PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=12.4 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=11.8 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=118 time=12.1 ms

--- 8.8.8.8 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 11.8/12.1/12.4/0.248 ms` },

  // ── 23. Quiz: ping opzioni ────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale opzione di ping limita il numero di pacchetti inviati?',
    opts: ['-c', '-n', '-t', '-s'],
    a: 0,
    explain: `<code>-c N</code> = count, invia esattamente N pacchetti poi si ferma. <code>-n</code> su alcuni sistemi è "no DNS resolution" (oppure -n in netstat/ss). <code>-t</code> imposta il TTL. <code>-s</code> imposta la dimensione del payload. Senza -c, ping gira all'infinito fino a Ctrl+C. 📡` },

  // ── 24. ss: socket statistics ────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔌', title: 'ss: chi sta ascoltando su quale porta',
    text: `<strong>ss</strong> (Socket Statistics) è il sostituto moderno di <code>netstat</code>.<br>
<br>
Opzioni principali:<br>
<code>-t</code> — TCP<br>
<code>-u</code> — UDP<br>
<code>-l</code> — solo socket in ascolto (LISTEN)<br>
<code>-n</code> — numeri invece di nomi (porta 22, non "ssh")<br>
<code>-p</code> — mostra il processo che usa il socket<br>
<code>-4</code> / <code>-6</code> — solo IPv4 o IPv6<br>
<br>
Combinazioni tipiche:<br>
<code>ss -tlnp</code> — TCP + listen + numeri + processo (il più utile!)<br>
<code>ss -ulnp</code> — UDP in ascolto<br>
<code>ss -tnp</code> — connessioni TCP attive con processo<br>
<code>ss -s</code> — statistiche riassuntive<br>
<br>
TRAPPOLA! <code>-p</code> mostra i processi solo se sei root (o per i tuoi processi). Come utente normale vedi solo i tuoi.`,
    analogy: `ss è il "centralino del palazzo": vedi tutte le porte aperte (chi sta aspettando chiamate) e tutte le chiamate in corso (connessioni attive).` },

  // ── 25. Terminal: ss ─────────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔌', title: 'Porte in ascolto',
    cmd: 'ss -tlnp',
    out: `State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process
LISTEN  0       128     0.0.0.0:22          0.0.0.0:*      users:(("sshd",pid=892,fd=3))
LISTEN  0       128     127.0.0.1:631       0.0.0.0:*      users:(("cupsd",pid=1203,fd=7))
LISTEN  0       4096    0.0.0.0:5355        0.0.0.0:*      users:(("systemd-resolve",pid=480,fd=12))
LISTEN  0       128     [::]:22             [::]:*         users:(("sshd",pid=892,fd=4))` },

  // ── 26. Quiz: ss opzioni ──────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando mostra le porte TCP in ascolto con i relativi processi, usando numeri?',
    opts: ['ss -tlnp', 'ss -tup', 'netstat -r', 'ss -a'],
    a: 0,
    explain: `<code>ss -tlnp</code>: t=TCP, l=listen, n=numerici, p=processi. È la combinazione più usata per "chi sta ascoltando su quale porta". <code>-a</code> mostra tutto (listen + connessioni). <code>netstat -r</code> mostra la tabella di routing, non i socket. 🔌` },

  // ── 109.3 extra: netcat / nc ─────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔌', title: 'netcat (nc): il coltellino svizzero del networking',
    text: `<code>nc</code> (netcat) apre connessioni TCP/UDP grezze — fondamentale per diagnosi e test:<br>
<br>
<strong>Test connettività a una porta:</strong><br>
<code>nc -zv 192.168.1.1 22</code> — testa se la porta 22 è aperta (-z = no dati, -v = verbose)<br>
<code>nc -zv google.com 443</code> — testa HTTPS<br>
<code>nc -zv host 20-80</code> — scansiona range di porte<br>
<br>
<strong>Server e client semplici:</strong><br>
<code>nc -l 1234</code> — ascolta sulla porta 1234 (server)<br>
<code>nc 192.168.1.5 1234</code> — connette al server (client)<br>
<br>
<strong>Trasferimento file:</strong><br>
<code>nc -l 9999 &gt; ricevuto.tar.gz</code> (destinazione)<br>
<code>nc 192.168.1.5 9999 &lt; file.tar.gz</code> (sorgente)<br>
<br>
TRAPPOLA! Su alcune distro il comando si chiama <code>ncat</code> (variante nmap). Le opzioni principali restano uguali.`,
    analogy: `nc è il cavo diretto tra due computer: niente protocolli, niente header — solo byte grezzi da A a B. Se vuoi sapere se una porta è "viva", nc è il primo strumento da usare. 🔌` },

  { type: 'quiz', q: 'Quale comando nc testa se la porta 443 di example.com è raggiungibile senza inviare dati?',
    opts: [
      'nc -zv example.com 443',
      'nc -l example.com 443',
      'nc --test example.com 443',
      'nc -p 443 example.com'
    ],
    a: 0,
    explain: `<code>-z</code> (zero I/O mode) apre la connessione TCP e la chiude subito senza inviare dati — perfetto per testare se una porta è aperta. <code>-v</code> stampa il risultato ("Connection to ... succeeded!"). <code>-l</code> mette nc in ascolto (server mode). <code>-p</code> specifica la porta sorgente, non la destinazione. 🔌` },

  // ── 27. dig, host, nslookup ──────────────────────────────────────────────────
  { type: 'lesson', emoji: '🔎', title: 'dig, host, nslookup: interroga il DNS',
    text: `Tre strumenti per fare query DNS:<br>
<br>
<strong>dig</strong> — il più potente e dettagliato:<br>
<code>dig google.com</code> — record A (IPv4)<br>
<code>dig google.com MX</code> — record MX (mail)<br>
<code>dig google.com AAAA</code> — record AAAA (IPv6)<br>
<code>dig +short google.com</code> — solo l'IP, senza dettagli<br>
<code>dig @8.8.8.8 google.com</code> — usa un DNS specifico<br>
<code>dig -x 8.8.8.8</code> — reverse DNS (IP → nome)<br>
<br>
<strong>host</strong> — semplice e diretto:<br>
<code>host google.com</code> — risolve A, AAAA, MX<br>
<code>host -t MX google.com</code> — solo MX<br>
<br>
<strong>nslookup</strong> — interattivo o one-shot:<br>
<code>nslookup google.com</code> — risolve con il DNS di sistema<br>
<code>nslookup google.com 8.8.8.8</code> — usa DNS specifico<br>
<br>
TRAPPOLA! dig e host usano il DNS configurato in /etc/resolv.conf, ma possono essere forzati con @server.` },

  // ── 28. Terminal: dig ────────────────────────────────────────────────────────
  { type: 'terminal', emoji: '🔎', title: 'Query DNS con dig',
    cmd: 'dig +short google.com && echo "---" && dig +short google.com MX',
    out: `142.250.180.46
---
10 smtp.google.com.` },

  // ── 29. Quiz: tipo record DNS ────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando dig interroga i record MX (mail server) di example.com?',
    opts: [
      'dig example.com MX',
      'dig example.com -m mail',
      'dig MX @example.com',
      'nslookup -type=A example.com'
    ],
    a: 0,
    explain: `La sintassi dig è: <code>dig [opzioni] nome [tipo]</code>. Il tipo di record (MX, A, AAAA, NS, TXT, CNAME) va alla fine senza flag. <code>dig example.com MX</code> è corretto. <code>dig MX @example.com</code> userebbe example.com come server DNS, non come dominio da interrogare! 🔎` },

  // ── 30. Input: ss listen ─────────────────────────────────────────────────────
  { type: 'input', q: 'Quale opzione di ss mostra SOLO le socket in stato di ascolto (LISTEN)?',
    accept: ['-l', '--listening'],
    placeholder: 'ss ...',
    explain: `<code>ss -l</code> (o --listening) filtra solo i socket in LISTEN. Senza -l vedi anche le connessioni attive (ESTABLISHED) e le connessioni in chiusura. Combinato: <code>ss -tlnp</code> = TCP listen, numeri, processi. 🔌` },

  // ── 31. IPv6 accenno ─────────────────────────────────────────────────────────
  { type: 'fact', emoji: '6️⃣', title: 'IPv6: il futuro (già presente)',
    text: `IPv6 usa <strong>128 bit</strong>, scritti come 8 gruppi di 4 hex separati da <code>:</code>:<br>
<code>2001:0db8:85a3:0000:0000:8a2e:0370:7334</code><br>
Si abbrevia omettendo zeri: <code>2001:db8:85a3::8a2e:370:7334</code><br>
<br>
Indirizzi speciali IPv6:<br>
• <code>::1</code> — loopback (= 127.0.0.1 in IPv4)<br>
• <code>fe80::/10</code> — link-local (solo sulla rete locale)<br>
• <code>fc00::/7</code> — unique local (= RFC1918 di IPv6)<br>
<br>
L'esame LPIC-1 chiede i fondamentali IPv6, non il subnetting avanzato.` },

  // ── 32. Ripasso Lampo ─────────────────────────────────────────────────────────
  { type: 'lesson', emoji: '🧩', title: '🧩 RIPASSO LAMPO — Modulo 9',
    text: `• IPv4: 32 bit · RFC1918: 10/8, 172.16/12, 192.168/16 · /24 = 254 host<br>
• Porte: 22 SSH · 25 SMTP · 53 DNS · 80 HTTP · 443 HTTPS · 110 POP3 · 143 IMAP<br>
• <code>ip addr show</code> interfacce · <code>ip route show</code> routing · <code>ip link set eth0 up</code><br>
• <code>nmcli device status</code> · <code>nmcli connection up "Nome"</code> · <code>nmtui</code><br>
• <code>/etc/hosts</code>: IP → nome locale · <code>/etc/resolv.conf</code>: server DNS<br>
• <code>/etc/nsswitch.conf</code>: <code>hosts: files dns</code> → prima /etc/hosts poi DNS<br>
• <code>ping -c N</code> · <code>traceroute -n</code> · <code>ss -tlnp</code>: TCP listen<br>
• <code>nc -zv host porta</code>: test connettività · <code>nc -l 1234</code>: server grezzo<br>
• <code>dig dominio TIPO</code> · <code>dig +short</code> · <code>dig @8.8.8.8</code> · <code>dig -x IP</code>` },

  // ── 33. Quiz: finale routing ─────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale comando mostra quale route viene usata per raggiungere 1.1.1.1?',
    opts: [
      'ip route get 1.1.1.1',
      'traceroute 1.1.1.1',
      'ip route show 1.1.1.1',
      'route -n get 1.1.1.1'
    ],
    a: 0,
    explain: `<code>ip route get 1.1.1.1</code> mostra esattamente quale entry della tabella di routing viene usata e tramite quale interfaccia/gateway. <code>traceroute</code> mostra gli hop ma non la decisione di routing locale. <code>ip route show</code> mostra tutta la tabella. 🗺️` },

  // ── 34. Quiz: finale DNS ──────────────────────────────────────────────────────
  { type: 'quiz', q: 'Quale file devi modificare per far risolvere "devserver" a 192.168.50.10 su tutta la macchina, senza DNS?',
    opts: ['/etc/hosts', '/etc/resolv.conf', '/etc/nsswitch.conf', '/etc/hostname'],
    a: 0,
    explain: `<code>/etc/hosts</code>: aggiungi <code>192.168.50.10 devserver</code>. Con il default <code>hosts: files dns</code> in nsswitch.conf, questa mappatura ha priorità sul DNS. /etc/resolv.conf configura i server DNS da usare, non le mappature. 📖` },

  // ── 35. Missione: esplora la rete locale ──────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: mappa la tua rete',
    text: `Esplora la configurazione di rete del tuo CachyOS: indirizzo IP, gateway, DNS, tabella di routing.`,
    solution: `# Indirizzi IP e interfacce
ip addr show

# Tabella di routing (incluso gateway di default)
ip route show

# Quale route per raggiungere Internet?
ip route get 8.8.8.8

# DNS configurati
cat /etc/resolv.conf
# oppure con systemd-resolved:
resolvectl status

# Statistiche interfacce
ip -s link show eth0

# ARP cache (MAC address dei vicini)
ip neigh show` },

  // ── 36. Missione: DNS e hosts ────────────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: gioca con il DNS',
    text: `Usa dig, host e nslookup per interrogare i DNS. Poi aggiungi un alias in /etc/hosts e verifica che funzioni.`,
    solution: `# Query A record con dig
dig google.com
dig +short google.com

# Record MX (mail server)
dig google.com MX +short

# Reverse DNS (IP → nome)
dig -x 8.8.8.8 +short

# Interroga un DNS specifico
dig @1.1.1.1 github.com +short

# Con host (più semplice)
host google.com
host -t MX google.com

# Con nslookup
nslookup google.com

# Aggiungi alias in /etc/hosts (richiede root)
echo "127.0.0.1 mioserver.local" | sudo tee -a /etc/hosts

# Verifica che risolva
ping -c 1 mioserver.local

# Rimuovi l'alias dopo il test
sudo sed -i '/mioserver.local/d' /etc/hosts` },

  // ── 37. Missione: porte e connessioni ────────────────────────────────────────
  { type: 'mission', emoji: '🎯', title: 'Missione: scanner delle porte locali',
    text: `Usa ss per vedere quali servizi sono in ascolto sul tuo sistema e quali connessioni sono attive.`,
    solution: `# Tutte le porte TCP in ascolto (con processi)
sudo ss -tlnp

# Tutte le porte UDP in ascolto
sudo ss -ulnp

# Connessioni TCP attive (stabilite)
ss -tnp

# Statistiche riassuntive
ss -s

# Cerca una porta specifica (es. SSH su 22)
ss -tlnp | grep :22

# Controlla se una porta è aperta su un host remoto
# (se nc è disponibile)
nc -zv 8.8.8.8 53 && echo "porta 53 aperta"

# Visualizza i file aperti dalla rete
sudo lsof -i -P -n | head -20` },

];
