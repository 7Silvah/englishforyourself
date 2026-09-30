/* English for Yourself — standalone interactive tense card
   Renders ONE Tense Lab card inside <div class="tense-card" data-tense="...">.
   Used by the individual verb-tense lesson pages (replaces the static
   "Structure" table). Shares data + rendering with the index Tense Lab.
   Requires assets/js/tense-data.js loaded before this script.
   Works from file:// — no fetch, no build step. */
(function () {
  "use strict";

  function cardHTML(tense) {
    return '<div class="tense-card-header">' +
        '<h2 class="tense-name">' + window.EFY_TENSE_RENDER.esc(tense.name) + "</h2>" +
        window.EFY_TENSE_RENDER.switchHTML(tense) +
      "</div>" +
      '<div class="tense-card-body">' +
        window.EFY_TENSE_RENDER.moodsHTML(tense.groups[0]) +
      "</div>";
  }

  function wire(card, tense) {
    var sw = card.querySelector(".subject-switch");
    if (!sw) return;
    sw.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn || btn.classList.contains("active")) return;
      sw.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var group = tense.groups.filter(function (g) { return g.id === btn.dataset.group; })[0];
      if (!group) return;
      window.EFY_TENSE_RENDER.renderGroupAnimated(card, group);
    });
  }

  function init() {
    if (!window.EFY_TENSES || !window.EFY_TENSE_RENDER) return;
    document.querySelectorAll(".tense-card[data-tense]").forEach(function (slot) {
      var tense = window.EFY_TENSE_BY_ID(slot.getAttribute("data-tense"));
      if (!tense) return;
      slot.innerHTML = cardHTML(tense);
      wire(slot, tense);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
