# Login a profilo leggero con salvataggio cloud — Design

**Progetto:** linux-quiz-master (Linux Dojo)
**Data:** 2026-06-24
**Stato:** approvato in brainstorming, pronto per il piano di implementazione

## Problema

I progressi (XP, streak, moduli, errori) sono salvati in `localStorage`, che è legato
all'esatto *origin* del browser. Aprendo un link diverso, un file locale, o un altro
dispositivo, i dati non seguono l'utente: l'app "riparte da zero". Inoltre più persone
(l'utente + un amico) usano l'app sullo stesso o su browser diversi senza un modo per
tenere separati e recuperabili i rispettivi progressi.

## Obiettivo

Permettere all'utente di **recuperare i propri progressi da qualunque link/dispositivo**
identificandosi con un **profilo leggero (nome + codice, senza password)**, con i dati
salvati su un backend cloud gratuito. Mantenere intatto il funzionamento offline e il
vincolo del progetto: niente build, niente npm, l'app gira aprendo `index.html` e su
GitHub Pages.

### Non-obiettivi (YAGNI)

- Niente autenticazione con password/email in questa fase (modello leggero scelto).
- Niente sync in tempo reale o merge fine dei dati: vale "ultimo salvataggio vince".
- Niente multi-profilo simultaneo: un profilo attivo per volta.
- Login Google resta una **estensione futura** possibile, non in scope ora.

## Architettura: local-first + strato di sync

`localStorage` resta la copia di lavoro: l'app continua a funzionare identica e offline.
Si aggiunge un sottile **strato di sincronizzazione** che, quando un profilo è attivo,
spinge e recupera l'oggetto `state` da Supabase. Il motore esistente non viene riscritto.

```
[ UI motore esistente ]
        | saveState()  <- unico choke point delle scritture
        v
[ localStorage ] --(se profilo attivo, debounce)--> [ Sync ] --> [ Supabase: profiles ]
        ^                                                               |
        +------------- all'apertura/login: pull, il piu recente vince <-+
```

Proprietà chiave: si sincronizza **l'intero snapshot** dello `state`, non delta. Questo
elimina la necessità di una coda offline: il primo `push` riuscito dopo un periodo offline
contiene già lo stato completo e aggiornato.

## Componenti

### `js/config.js` (nuovo)
Contiene `SUPABASE_URL` e `SUPABASE_ANON_KEY`. L'anon key è pubblica per progetto (pensata
per l'uso lato client) e può essere committata senza rischi, in combinazione con RLS.

### `js/sync.js` (nuovo)
Strato cloud isolato e testabile. Dipende solo dal client Supabase e da `config.js`.
API:

- `Sync.init(url, anonKey)` — inizializza il client.
- `Sync.activeProfile()` — restituisce `{ id, name }` del profilo attivo da `localStorage`
  (chiave `linux-dojo-profile`), o `null`.
- `Sync.login(nome, codice)` — normalizza (`trim`, minuscolo), calcola `id = "<nome>:<codice>"`;
  legge la riga: se esiste restituisce lo `state` remoto con il suo `updatedAt`, altrimenti la
  crea con lo `state` locale corrente; salva il profilo attivo in `localStorage`. Ritorna
  `{ state, updatedAt, exists }`. La decisione su quale stato adottare (remoto vs locale) è
  presa dal chiamante con la regola "il più recente vince" (vedi sotto), non dentro `login`.
- `Sync.logout()` — rimuove il profilo attivo (lo `state` locale resta invariato).
- `Sync.push(state)` — upsert dell'intero `state` per il profilo attivo, **debounced ~1,5s**.
  No-op se nessun profilo attivo. Fallisce in silenzio se offline.
- `Sync.pull()` — legge lo `state` remoto del profilo attivo; ritorna `{ state, updatedAt }`
  o `null` se assente/irraggiungibile.

### `index.html`
- `<script>` da CDN del client `@supabase/supabase-js`.
- Inclusione di `js/config.js` e `js/sync.js` **prima** di `js/app.js`.
- **Bottone profilo** nell'header della home (mostra il nome attivo oppure "Accedi").
- **Modale profilo**: campi *nome* e *codice*, bottoni *Entra/Crea* ed *Esci*, e un
  **mini-indicatore di stato** ("✓ salvato in cloud" / "offline").

### `js/app.js` (modifiche minime)
- In fondo a `saveState()`: chiamata a `Sync.push(state)` (no-op senza profilo attivo).
- All'avvio: se esiste un profilo attivo, `Sync.pull()`; se il remoto è più recente del
  locale (confronto `updated_at`), **adotta lo `state` remoto** e ri-renderizza la UI.
- Funzioni `loginProfilo()` / `logoutProfilo()` collegate al modale; dopo il login,
  sostituiscono `state`, salvano in locale e ri-renderizzano.

Per il confronto di freschezza, lo `state` locale tiene un timestamp `updated_at`
(salvato accanto allo stato in `localStorage`), aggiornato a ogni `saveState()`.

## Modello dati (Supabase)

```sql
create table profiles (
  id          text primary key,        -- "<nome>:<codice>" normalizzato (minuscolo)
  name        text not null,
  state       jsonb not null,          -- l'intero oggetto state dell'app
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

-- Modello leggero: accesso anonimo a lettura e upsert (nessun dato sensibile).
create policy "anon read"   on profiles for select using (true);
create policy "anon insert" on profiles for insert with check (true);
create policy "anon update" on profiles for update using (true) with check (true);
```

Il `codice` accanto al nome evita sovrascritture accidentali tra utenti che scelgono lo
stesso nome. Non è una password: è una barriera blanda, coerente col modello scelto.

## Flusso dati

1. **Crea/Entra profilo** — l'utente apre il modale e inserisce `nome` + `codice` →
   `Sync.login`. Se la riga esiste, l'app applica la regola "il più recente vince" tra lo
   `state` remoto e quello locale (di norma adotta il remoto e ri-renderizza → recupero
   "dove ero"; tiene il locale solo se più recente, e in tal caso lo ripush​a in cloud);
   se la riga non esiste, la crea con i progressi locali. Il profilo attivo resta salvato
   in `localStorage`, quindi l'utente resta loggato.
2. **Durante lo studio** — ogni `saveState()` scrive subito in `localStorage` e programma
   un `Sync.push` con debounce. Si spinge lo snapshot completo.
3. **Riapertura / link nuovo** — all'avvio, con profilo attivo, `Sync.pull()`; vince
   `updated_at` più recente tra locale e remoto. Risolve il "riparte da zero".
4. **Conflitto tra dispositivi** — last-write-wins. Trascurabile per un singolo utente.

## Offline (PWA)

L'app continua a funzionare offline su `localStorage`. I `push` falliscono in silenzio
quando non c'è rete; poiché si spinge uno snapshot completo, al primo salvataggio online
lo stato torna allineato senza alcuna coda. Un `pull` offline ricade sul locale.

## Gestione errori

- Rete assente / Supabase irraggiungibile → fallback silenzioso al locale + indicatore
  "offline" discreto; nessun blocco dell'app.
- Riga remota corrotta o illeggibile → si mantiene lo `state` locale.
- Validazione input: `nome` e `codice` non vuoti, lunghezza minima (≥2 e ≥3), `trim` e
  minuscolo; in caso di invalidità il modale mostra un messaggio e non procede.

## Sicurezza / privacy

Modello leggero: con l'anon key la tabella è accessibile a chi usa l'app; `nome+codice`
è una barriera debole, non sicurezza vera. Accettabile per l'uso previsto (utente + amico).
RLS è abilitata con policy permissive per igiene. Estensione futura: login Google con
Supabase Auth e policy RLS per-utente, senza rifare lo strato di sync.

## Testing

Coerente col vincolo "niente build":

- `node --check` su `js/config.js`, `js/sync.js`, `js/app.js`.
- Checklist QA manuale:
  1. Crea profilo → guadagna XP → ricarica la pagina → i progressi restano.
  2. Apri da un altro browser/dispositivo con stesso `nome`+`codice` → ritrova i progressi.
  3. Modalità aereo: l'app funziona; tornando online lo stato risincronizza.
  4. `nome`+`codice` diversi → dati completamente separati.
  5. Logout → lo stato locale resta; login di nuovo → riallinea dal cloud.

## Setup una tantum

1. Creare un progetto Supabase gratuito.
2. Eseguire lo SQL della tabella `profiles` e delle policy.
3. Copiare `SUPABASE_URL` e `SUPABASE_ANON_KEY` in `js/config.js`.

## Nota operativa

Il login fa seguire i dati alla persona da qualunque link, ma conviene usare un URL
stabile (la GitHub Pages del progetto) come riferimento principale.
