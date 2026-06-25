'use strict';
/* Test di js/sync.js eseguibili con gjs (Node assente sul sistema).
   Uso:  gjs test/sync-test.js   (dalla root del repo)
   Exit code 0 = tutti i test passati, 1 = almeno un fallimento. */

const GLib = imports.gi.GLib;
const System = imports.system;

// ── Stub di ambiente browser ──────────────────────────────────────
globalThis.localStorage = (() => {
  let store = {};
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    _reset: () => { store = {}; },
  };
})();

// ── Carica js/sync.js (imposta globalThis.Sync) ───────────────────
const [, bytes] = GLib.file_get_contents('js/sync.js');
const src = new TextDecoder().decode(bytes);
(0, eval)(src);
const { normalizeId, validateCredentials, pickNewest, init, activeProfile, logout, login, pull } = Sync;

// ── Mini framework di assert ──────────────────────────────────────
let failures = 0;
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function eq(a, b, msg) {
  if (a !== b) throw new Error(`${msg || 'eq'}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
}
function deepEq(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b))
    throw new Error(`${msg || 'deepEq'}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
}
function ok(v, msg) { if (!v) throw new Error(`${msg || 'ok'}: valore falsy`); }

// ── Client Supabase finto ─────────────────────────────────────────
function fakeClient(rows) {
  return {
    from() {
      const b = {
        _id: null,
        select() { return b; },
        eq(_col, id) { b._id = id; return b; },
        async maybeSingle() { return { data: rows[b._id] || null, error: null }; },
        async upsert(row) {
          rows[row.id] = { state: row.state, updated_at: row.updated_at };
          return { data: row, error: null };
        },
      };
      return b;
    },
  };
}

// ── Helper puri ───────────────────────────────────────────────────
test('normalizeId combina nome e codice in minuscolo, con trim', () => {
  eq(normalizeId('  Lorenzo ', 'AB12'), 'lorenzo:ab12');
});
test('validateCredentials rifiuta nome troppo corto', () => {
  eq(validateCredentials('a', 'abc').ok, false);
});
test('validateCredentials rifiuta codice troppo corto', () => {
  eq(validateCredentials('lori', 'ab').ok, false);
});
test('validateCredentials accetta input validi e normalizza', () => {
  deepEq(validateCredentials(' Lori ', ' 4821 '), { ok: true, name: 'lori', code: '4821' });
});
test('pickNewest sceglie il remoto se piu recente', () => {
  const local = { state: { xp: 1 }, updatedAt: '2026-01-01T00:00:00Z' };
  const remote = { state: { xp: 9 }, updatedAt: '2026-02-01T00:00:00Z' };
  eq(pickNewest(local, remote).source, 'remote');
  eq(pickNewest(local, remote).state.xp, 9);
});
test('pickNewest sceglie il locale se il remoto manca', () => {
  const local = { state: { xp: 1 }, updatedAt: '2026-01-01T00:00:00Z' };
  eq(pickNewest(local, null).source, 'local');
});
test('pickNewest sceglie il locale se piu recente del remoto', () => {
  const local = { state: { xp: 5 }, updatedAt: '2026-03-01T00:00:00Z' };
  const remote = { state: { xp: 2 }, updatedAt: '2026-02-01T00:00:00Z' };
  eq(pickNewest(local, remote).source, 'local');
});

// ── Operazioni cloud ──────────────────────────────────────────────
test('login con profilo esistente ritorna lo stato remoto e lo segna attivo', async () => {
  localStorage._reset();
  const rows = { 'lori:4821': { state: { xp: 99 }, updated_at: '2026-03-01T00:00:00Z' } };
  init(fakeClient(rows));
  const res = await login('Lori', '4821', { xp: 0 });
  eq(res.ok, true); eq(res.exists, true); eq(res.remote.state.xp, 99);
  deepEq(activeProfile(), { id: 'lori:4821', name: 'lori' });
});
test('login con profilo nuovo crea la riga dallo stato locale', async () => {
  localStorage._reset();
  const rows = {};
  init(fakeClient(rows));
  const res = await login('nuovo', 'abcd', { xp: 7 });
  eq(res.exists, false); eq(rows['nuovo:abcd'].state.xp, 7);
});
test('login rifiuta credenziali non valide', async () => {
  localStorage._reset();
  init(fakeClient({}));
  const res = await login('x', 'y', { xp: 0 });
  eq(res.ok, false); ok(res.error);
});
test('pull ritorna lo stato remoto del profilo attivo', async () => {
  localStorage._reset();
  const rows = { 'lori:4821': { state: { xp: 42 }, updated_at: '2026-03-01T00:00:00Z' } };
  init(fakeClient(rows));
  await login('lori', '4821', { xp: 0 });
  const remote = await pull();
  eq(remote.state.xp, 42);
});
test('logout azzera il profilo attivo', async () => {
  localStorage._reset();
  init(fakeClient({}));
  await login('lori', '4821', { xp: 0 });
  logout();
  eq(activeProfile(), null);
});

test('pickNewest a parità di timestamp sceglie il locale', () => {
  const ts = '2026-02-01T00:00:00Z';
  eq(pickNewest({ state: { xp: 1 }, updatedAt: ts }, { state: { xp: 2 }, updatedAt: ts }).source, 'local');
});
test('push senza profilo attivo non scrive nulla', () => {
  localStorage._reset();
  const rows = {};
  init(fakeClient(rows));
  Sync.push({ xp: 1 });            // nessun profilo attivo → no-op
  deepEq(rows, {});
});
test('saveNow scrive subito lo stato del profilo attivo', async () => {
  localStorage._reset();
  const rows = {};
  init(fakeClient(rows));
  await login('lori', '4821', { xp: 1 });
  await Sync.saveNow({ xp: 50 });
  eq(rows['lori:4821'].state.xp, 50);
});
test('login offline (upsert fallisce) registra comunque il profilo locale', async () => {
  localStorage._reset();
  init({
    from() {
      return {
        select() { return this; },
        eq() { return this; },
        async maybeSingle() { return { data: null, error: null }; },
        async upsert() { throw new Error('offline'); },
      };
    },
  });
  const res = await login('nuovo', 'abcd', { xp: 3 });
  eq(res.ok, true); eq(res.exists, false);
  deepEq(activeProfile(), { id: 'nuovo:abcd', name: 'nuovo' });
});

// ── Runner (await sequenziale, Promise via MainLoop) ──────────────
const loop = GLib.MainLoop.new(null, false);
(async () => {
  for (const t of tests) {
    try { await t.fn(); print(`  ok   ${t.name}`); }
    catch (e) { failures++; print(`  FAIL ${t.name}\n       ${e.message}`); }
  }
})().catch(e => { failures++; print('runner error: ' + e); })
    .finally(() => loop.quit());
loop.run();

print(`\n${tests.length - failures}/${tests.length} test passati`);
System.exit(failures ? 1 : 0);
