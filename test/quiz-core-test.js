'use strict';
/* Test di js/quiz-core.js — eseguibile con: gjs test/quiz-core-test.js */
const GLib = imports.gi.GLib;
const System = imports.system;
const [, bytes] = GLib.file_get_contents('js/quiz-core.js');
(0, eval)(new TextDecoder().decode(bytes));

let failures = 0;
function test(name, fn) {
  try { fn(); print('  ok  ' + name); }
  catch (e) { failures++; print('FAIL  ' + name + ' :: ' + e.message); }
}
function eq(a, b, m) { if (a !== b) throw new Error((m||'eq')+`: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }

const mod = { id: 'm01', cards: [
  { type: 'lesson', title: 'Kernel' },
  { type: 'quiz', q: 'A?' },
  { type: 'input', q: 'B?' },
  { type: 'fact', title: 'Storia' },
], extra: [
  { type: 'quiz', q: 'X?' },
  { type: 'input', q: 'Y?' },
]};

test('quizPool prende quiz/input inline ed esclude lesson/fact', () => {
  const inlineOnly = QuizCore.quizPool({ id: 'm', cards: mod.cards });
  eq(inlineOnly.length, 2);
});
test('quizPool concatena mod.extra', () => eq(QuizCore.quizPool(mod).length, 4));
test('quizPool ordine: prima inline poi extra', () => {
  const p = QuizCore.quizPool(mod);
  eq(p[0].q, 'A?'); eq(p[2].q, 'X?');
});
test('quizPool senza extra non rompe', () => eq(QuizCore.quizPool({ id: 'm', cards: [{type:'quiz'}] }).length, 1));
test('quizPool modulo vuoto → []', () => eq(QuizCore.quizPool({ id: 'm' }).length, 0));
test('drillCount = lunghezza pool', () => eq(QuizCore.drillCount(mod), 4));

print(failures ? `\n${failures} FALLITI` : '\nTUTTI PASSATI');
System.exit(failures ? 1 : 0);
