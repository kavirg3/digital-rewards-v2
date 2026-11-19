/* Digital Rewards v2 – extra behaviour on top of site.js */
(function () {
  var $all = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var num = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
  var rand = function (n) { return "R" + num(n); };

  /* ROI calculator: monthly customers x % retained x spend x extra visits */
  $all("[data-roi]").forEach(function (box) {
    var ins = $all("[data-roi-in]", box);
    var fee = Number(box.getAttribute("data-roi-fee")) || 4995;
    var run = function () {
      var v = {};
      ins.forEach(function (i) { v[i.getAttribute("data-roi-in")] = Number(i.value); });
      var kept = Math.round(v.cust * v.share / 100);
      var month = kept * v.spend * v.visits;
      var out = {
        cust: num(v.cust), spend: rand(v.spend), visits: String(v.visits), share: v.share + "%",
        kept: num(kept), month: rand(month), year: rand(month * 12), extra: num(kept * v.visits),
        visitWord: v.visits === 1 ? "additional visit" : "additional visits",
        times: month >= fee ? (month / fee).toFixed(1).replace(/\.0$/, "") + "x" : "under 1x"
      };
      $all("[data-roi-out]", box).forEach(function (el) { el.textContent = out[el.getAttribute("data-roi-out")]; });
      var max = Math.max(month, fee) || 1;
      $all("[data-roi-bar]", box).forEach(function (el) {
        var k = el.getAttribute("data-roi-bar");
        el.style.width = Math.max(2, Math.round((k === "fee" ? fee : month) / max * 100)) + "%";
      });
    };
    ins.forEach(function (i) { i.addEventListener("input", run); });
    run();
  });

  /* Lead form: the proxy keeps only known fields, so fold "what do you want" into the challenge note */
  $all("form[data-lead-form]").forEach(function (form) {
    var interest = form.querySelector('[name="interest"]');
    var note = form.querySelector('[name="challenge_note"]');
    var hidden = form.querySelector('input[name="challenge"]');
    if (!interest || !hidden) return;
    var sync = function () {
      var parts = [];
      if (interest.value) parts.push("Wants: " + interest.value);
      if (note && note.value.trim()) parts.push(note.value.trim());
      hidden.value = parts.join(". ");
    };
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    sync();
  });

  /* Mark the current page in the main nav */
  var here = location.pathname.replace(/\.html$/, "").split("/").pop();
  $all('header nav a.pill').forEach(function (a) {
    var h = (a.getAttribute("href") || "").split("#")[0];
    if (h && h === here) a.classList.add("on");
  });
})();
