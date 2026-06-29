'use strict';
/* Test di js/notes-core.js — eseguibile con: gjs test/notes-core-test.js */
const GLib = imports.gi.GLib;
const System = imports.system;
const [, bytes] = GLib.file_get_contents('js/notes-core.js');
(0, eval)(new TextDecoder().decode(bytes));

let failures = 0;
function test(name, fn) {
  try { fn(); print('  ok  ' + name); }
  catch (e) { failures++; print('FAIL  ' + name + ' :: ' + e.message); }
}
function eq(a, b, m) { if (a !== b) throw new Error((m||'eq')+`: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }

const mod = { id: 'm01', cards: [
  { type: 'lesson', title: 'Kernel', analogy: 'Il kernel è il cuoco.' },
  { type: 'quiz', q: '?' },
  { type: 'fact', title: 'Storia', text: '<strong>Nel 1991</strong> Linus scrisse. Oggi domina.' },
]};

test('key formatta modId:idx', () => eq(NotesCore.key('m01', 2), 'm01:2'));
test('concepts esclude i quiz', () => eq(NotesCore.concepts(mod).length, 2));
test('concepts mantiene indice originale', () => eq(NotesCore.concepts(mod)[1].i, 2));
test('essenceOf lesson usa analogy', () => eq(NotesCore.essenceOf(mod.cards[0]), 'Il kernel è il cuoco.'));
test('essenceOf fact: prima frase senza HTML', () => eq(NotesCore.essenceOf(mod.cards[2]), 'Nel 1991 Linus scrisse.'));
test('toReview esclude gli spuntati', () => {
  const recall = { 'm01:0': { val: true, ts: 'x' } };
  const r = NotesCore.toReview(mod, recall);
  eq(r.length, 1); eq(r[0].i, 2);
});
test('reviewCount conta i non spuntati', () => eq(NotesCore.reviewCount(mod, {}), 2));

print(failures ? `\n${failures} FALLITI` : '\nTUTTI PASSATI');
System.exit(failures ? 1 : 0);
