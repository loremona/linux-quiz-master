'use strict';
/* Linux Dojo — strato di sincronizzazione cloud (profilo leggero).
   Caricabile nel browser (window.Sync) e in gjs/Node (globalThis.Sync),
   senza eseguire codice di rete al load (pattern UMD). */
(function (global) {

  function normalizeId(name, code) {
    return `${String(name == null ? '' : name).trim().toLowerCase()}:` +
           `${String(code == null ? '' : code).trim().toLowerCase()}`;
  }

  function validateCredentials(name, code) {
    const n = String(name == null ? '' : name).trim();
    const c = String(code == null ? '' : code).trim();
    if (n.length < 2) return { ok: false, error: 'Il nome deve avere almeno 2 caratteri.' };
    if (c.length < 3) return { ok: false, error: 'Il codice deve avere almeno 3 caratteri.' };
    return { ok: true, name: n.toLowerCase(), code: c.toLowerCase() };
  }

  function pickNewest(local, remote) {
    const lt = local && local.updatedAt ? Date.parse(local.updatedAt) : -Infinity;
    const rt = remote && remote.updatedAt ? Date.parse(remote.updatedAt) : -Infinity;
    return rt > lt
      ? { state: remote.state, updatedAt: remote.updatedAt, source: 'remote' }
      : { state: local ? local.state : null, updatedAt: local ? local.updatedAt : null, source: 'local' };
  }

  function mergeModules(a, b) {
    a = a || {}; b = b || {};
    const out = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const x = a[k] || {}, y = b[k] || {};
      out[k] = {
        card: Math.max(x.card || 0, y.card || 0),
        done: !!(x.done || y.done),
        quizOk: Math.max(x.quizOk || 0, y.quizOk || 0),
        quizTot: Math.max(x.quizTot || 0, y.quizTot || 0),
      };
    }
    return out;
  }

  // Unione NON distruttiva di due stati. Il progresso è monotòno (XP e card viste
  // possono solo aumentare): unendo non si perde mai nulla. Sostituisce il
  // "last-write-wins" che poteva azzerare i progressi.
  function mergeStates(a, b) {
    a = a || {}; b = b || {};
    return {
      xp: Math.max(a.xp || 0, b.xp || 0),
      streak: Math.max(a.streak || 0, b.streak || 0),
      bestStreak: Math.max(a.bestStreak || 0, b.bestStreak || 0),
      lastDay: (a.lastDay || '') >= (b.lastDay || '') ? (a.lastDay || null) : (b.lastDay || null),
      seen: { ...(b.seen || {}), ...(a.seen || {}) },
      wrong: { ...(b.wrong || {}), ...(a.wrong || {}) },
      modules: mergeModules(a.modules, b.modules),
    };
  }

  // ── Operazioni cloud ──────────────────────────────────────────────
  const PROFILE_KEY = 'linux-dojo-profile';
  const TABLE = 'profiles';
  const DEBOUNCE_MS = 1500;
  let _client = null;
  let _timer = null;

  function activeProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function setActiveProfile(p) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }
  function clearActiveProfile() { localStorage.removeItem(PROFILE_KEY); }

  async function _fetch(id) {
    try {
      const { data, error } = await _client
        .from(TABLE).select('state, updated_at').eq('id', id).maybeSingle();
      if (error || !data) return null;
      return { state: data.state, updatedAt: data.updated_at };
    } catch (e) { return null; }
  }
  async function _upsert(id, name, state, updatedAt) {
    return _client.from(TABLE)
      .upsert({ id, name, state, updated_at: updatedAt }, { onConflict: 'id' });
  }

  async function login(name, code, localState) {
    const v = validateCredentials(name, code);
    if (!v.ok) return { ok: false, error: v.error };
    const id = normalizeId(v.name, v.code);
    const remote = await _fetch(id);
    if (remote) {
      setActiveProfile({ id, name: v.name });
      return { ok: true, exists: true, id, name: v.name, remote };
    }
    const updatedAt = new Date().toISOString();
    try { await _upsert(id, v.name, localState, updatedAt); } catch (e) { /* offline: resta local */ }
    setActiveProfile({ id, name: v.name });
    return { ok: true, exists: false, id, name: v.name, remote: null };
  }

  function logout() { clearActiveProfile(); }

  async function pull() {
    const p = activeProfile();
    if (!p || !_client) return null;
    return _fetch(p.id);
  }

  function push(state) {
    const p = activeProfile();
    if (!p || !_client) return;
    clearTimeout(_timer);
    _timer = setTimeout(() => {
      _upsert(p.id, p.name, state, new Date().toISOString()).catch(() => {});
    }, DEBOUNCE_MS);
  }

  // Salvataggio immediato e atteso (per i casi in cui la pagina sta per ricaricarsi
  // e non si può attendere il debounce di push).
  async function saveNow(state) {
    const p = activeProfile();
    if (!p || !_client) return;
    clearTimeout(_timer);
    return _upsert(p.id, p.name, state, new Date().toISOString());
  }

  const Sync = {
    normalizeId, validateCredentials, pickNewest, mergeStates, mergeModules,
    init(client) { _client = client; },
    get _client() { return _client; },
    activeProfile, logout, login, pull, push, saveNow,
  };

  global.Sync = Sync;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeId, validateCredentials, pickNewest, mergeStates, mergeModules, Sync };
  }

})(typeof window !== 'undefined' ? window : globalThis);
