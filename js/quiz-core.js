/* ═══════════ Linux Dojo — logica pura pool quiz (testabile) ═══════════ */
'use strict';

(function (root) {
  function isQuizCard(card) {
    return !!card && (card.type === 'quiz' || card.type === 'input');
  }

  function quizPool(mod) {
    const inline = (mod.cards || []).filter(isQuizCard);
    return inline.concat(mod.extra || []);
  }

  function drillCount(mod) { return quizPool(mod).length; }

  root.QuizCore = { isQuizCard, quizPool, drillCount };
})(typeof globalThis !== 'undefined' ? globalThis : this);
