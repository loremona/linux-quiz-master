/* ═══════════ Linux Dojo — logica pura note/ripasso (testabile) ═══════════ */
'use strict';

(function (root) {
  function key(modId, i) { return modId + ':' + i; }

  function isConcept(card) { return !!card && (card.type === 'lesson' || card.type === 'fact'); }

  function concepts(mod) {
    const out = [];
    (mod.cards || []).forEach((card, i) => { if (isConcept(card)) out.push({ card, i }); });
    return out;
  }

  function stripHtml(s) { return String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); }

  function essenceOf(card) {
    if (!card) return '';
    if (card.type === 'lesson' && card.analogy) return stripHtml(card.analogy);
    const text = stripHtml(card.text);
    const m = text.match(/^[^.!?]*[.!?]/);
    return m ? m[0].trim() : text;
  }

  function toReview(mod, recall) {
    recall = recall || {};
    return concepts(mod).filter(({ i }) => {
      const r = recall[key(mod.id, i)];
      return !(r && r.val);
    });
  }

  function reviewCount(mod, recall) { return toReview(mod, recall).length; }

  root.NotesCore = { key, isConcept, concepts, essenceOf, toReview, reviewCount };
})(typeof globalThis !== 'undefined' ? globalThis : this);
