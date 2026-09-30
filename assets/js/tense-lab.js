/* English for Yourself — Tense Lab engine (vanilla JS, no frameworks)
   Interactive sentence builder: colored Lego-style blocks (subject / auxiliary /
   verb / object), pronoun switch re-arms every sentence live, + / - / ? rows use
   the canonical site palette (green / orange / yellow).
   Data + rendering helpers come from assets/js/tense-data.js (shared with the
   standalone tense cards). This file only wires the 13-card lab on index.html.
   Works from file:// — no fetch, no build step. */
(function () {
  "use strict";

  function cardHTML(tense, idx) {
    var R = window.EFY_TENSE_RENDER;
    return '<section class="tense-card" data-idx="' + idx + '" id="tense-' + tense.id + '">' +
      '<div class="tense-card-header">' +
        '<h2 class="tense-name">' + (idx + 1) + ". " + R.esc(tense.name) + "</h2>" +
        '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">' +
          R.switchHTML(tense) +
          '<a class="tense-lesson-link" href="' + tense.lesson + '">Full lesson \u2192</a>' +
        "</div>" +
      "</div>" +
      '<div class="tense-card-body">' + R.moodsHTML(tense.groups[0]) + "</div>" +
    "</section>";
  }

  function init() {
    if (!window.EFY_TENSES || !window.EFY_TENSE_RENDER) return;
    var lab = document.getElementById("tense-lab");
    if (!lab) return;
    var R = window.EFY_TENSE_RENDER;
    lab.innerHTML = window.EFY_TENSES.map(function (t, i) { return cardHTML(t, i); }).join("");

    lab.querySelectorAll(".subject-switch").forEach(function (sw) {
      sw.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn || btn.classList.contains("active")) return;
        sw.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var card = sw.closest(".tense-card");
        var tense = window.EFY_TENSES[parseInt(card.dataset.idx, 10)];
        var group = tense.groups.filter(function (g) { return g.id === btn.dataset.group; })[0];
        if (!group) return;
        R.renderGroupAnimated(card, group);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
