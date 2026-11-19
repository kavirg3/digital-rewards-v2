/* Clean addresses: an old link like /pricing.html shows as /pricing (same page, no reload) */
(function () {
  try {
    var p = location.pathname;
    if (/\.html$/.test(p) && history.replaceState) {
      var clean = p.replace(/index\.html$/, "").replace(/\.html$/, "");
      history.replaceState(null, "", clean + location.search + location.hash);
    }
  } catch (e) {}
})();
(function () {
  "use strict";
  var C = window.DR_CONFIG || {};
  var $all = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var short = function (n) { return n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "m" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(Math.round(n)); };
  var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
  var waDigits = String(C.whatsapp || "").replace(/\D/g, "");

  /* ---------- phone menu ---------- */
  var header = document.querySelector("header");
  var nav = header && header.querySelector('nav[aria-label="Main"]');
  if (header && nav) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "edge menu-btn";
    btn.style.minHeight = "44px";
    btn.style.padding = "0 16px";
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = "Menu";
    nav.parentNode.insertBefore(btn, nav);
    btn.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { header.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- hero visual: scale the 640x600 art to its column ---------- */
  $all(".hv").forEach(function (box) {
    var art = box.querySelector(".hv-in");
    if (!art) return;
    var fit = function () { art.style.transform = "scale(" + (box.clientWidth / 640) + ")"; };
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(box);
    else window.addEventListener("resize", fit);
  });

  /* ---------- contact details from config ---------- */
  $all("[data-wa]").forEach(function (a) {
    if (waDigits) { a.href = "https://wa.me/" + waDigits; a.target = "_blank"; a.rel = "noopener"; }
    else { a.hidden = true; }
  });
  $all("[data-contact]").forEach(function (el) {
    var bits = [];
    if (waDigits) bits.push('WhatsApp: <a href="https://wa.me/' + waDigits + '">+' + waDigits + "</a>");
    if (C.phone) bits.push('Call: <a href="tel:' + String(C.phone).replace(/[^\d+]/g, "") + '">' + C.phone + "</a>");
    if (C.email) bits.push('Email: <a href="mailto:' + C.email + '">' + C.email + "</a>");
    if (C.hours) bits.push("Hours: " + C.hours);
    if (bits.length) el.innerHTML = bits.join(" · "); else el.hidden = true;
  });
  $all("[data-tel]").forEach(function (a) {
    if (!C.phone) { a.hidden = true; return; }
    a.href = "tel:" + String(C.phone).replace(/[^\d+]/g, "");
    var t = a.querySelector("[data-tel-text]");
    if (t) t.textContent = C.phone;
  });
  if (waDigits) {
    var f = document.createElement("a");
    f.className = "wa-float";
    f.href = "https://wa.me/" + waDigits;
    f.target = "_blank"; f.rel = "noopener";
    f.setAttribute("aria-label", "WhatsApp our team");
    f.innerHTML = '<svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 20.5l1.3-4.6A8.5 8.5 0 1112 20.5a8.5 8.5 0 01-4-1z"/></svg>';
    document.body.appendChild(f);
  }

  /* ---------- About: founder photo from config (monogram until it is set) ---------- */
  if (C.founderPhoto) {
    $all("[data-founder-img]").forEach(function (img) {
      var box = img.closest("[data-founder-photo]"), mono = box && box.querySelector("[data-founder-mono]");
      img.onload = function () { img.hidden = false; if (mono) mono.hidden = true; };
      img.src = C.founderPhoto;
    });
  }

  /* ---------- Results page: "one more visit" calculator (data-rc; separate from the home ROI calculator) ---------- */
  $all("[data-rc]").forEach(function (box) {
    var ins = box.querySelectorAll("[data-rc-in]");
    var rand = function (n) { return "R" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
    var num = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
    var run = function () {
      var v = {};
      ins.forEach(function (i) { v[i.getAttribute("data-rc-in")] = Number(i.value); });
      var visits = Math.round(v.cust * v.share / 100), month = visits * v.spend;
      var out = { cust: num(v.cust), spend: rand(v.spend), share: v.share + "%", visits: num(visits), month: rand(month), year: rand(month * 12) };
      box.querySelectorAll("[data-rc-out]").forEach(function (el) { el.textContent = out[el.getAttribute("data-rc-out")]; });
    };
    ins.forEach(function (i) { i.addEventListener("input", run); });
    run();
  });

  /* ---------- ROI calculator ---------- */
  var inputs = $all("[data-calc]");
  if (inputs.length) {
    var calc = function () {
      var v = {};
      inputs.forEach(function (i) { v[i.getAttribute("data-calc")] = Number(i.value); });
      var target = Math.max(v.target, v.current);
      var nowCount = v.customers * v.current / 100;
      var newCount = v.customers * target / 100;
      var extra = newCount - nowCount;
      var extraVisits = extra * v.visits;
      var revenue = extraVisits * v.avg;
      var out = {
        customersFmt: fmt(v.customers), avgFmt: fmt(v.avg), current: v.current, target: v.target, visits: v.visits,
        extraCustomers: fmt(extra), extraVisits: fmt(extraVisits), revenue: fmt(revenue), yearly: fmt(revenue * 12),
        nowCount: fmt(nowCount), newCount: fmt(newCount),
        visitsYear: fmt(extraVisits * 12), m3: fmt(revenue * 3), m6: fmt(revenue * 6),
        y1: short(revenue * 3), y2: short(revenue * 6), y3: short(revenue * 9), y4: short(revenue * 12)
      };
      $all("[data-out]").forEach(function (el) {
        var k = el.getAttribute("data-out");
        if (k in out) el.textContent = out[k];
      });
      var top = newCount || 1;
      var h = { nowH: Math.max(4, Math.round(nowCount / top * 100)) + "%", newH: (newCount ? 100 : 4) + "%" };
      $all(".cd-line").forEach(function (p) { p.style.animation = "none"; void p.getBoundingClientRect(); p.style.animation = ""; });
      $all("[data-h]").forEach(function (el) { el.style.height = h[el.getAttribute("data-h")]; });
    };
    inputs.forEach(function (i) { i.addEventListener("input", calc); });
    calc();
  }

  /* ---------- packages: visits that pay for each plan ---------- */
  var payIn = document.querySelector("[data-pay-avg]");
  if (payIn) {
    var payCalc = function () {
      var avg = Math.max(1, Number(payIn.value));
      $all("[data-pay-avgout]").forEach(function (el) { el.textContent = fmt(avg); });
      $all("[data-pay]").forEach(function (card) {
        var v = Math.ceil(Number(card.getAttribute("data-pay")) / avg);
        var q = function (s) { return card.querySelector(s); };
        q("[data-pay-visits]").textContent = fmt(v);
        q("[data-pay-word]").textContent = v === 1 ? "extra visit" : "extra visits";
        q("[data-pay-week]").textContent = v <= 4 ? "about 1" : "about " + fmt(Math.ceil(v / 4.3));
        var shown = Math.min(v, 24), html = "";
        for (var i = 0; i < shown; i++) html += "<i></i>";
        if (v > 24) html += "<small>+" + fmt(v - 24) + " more</small>";
        q("[data-pay-dots]").innerHTML = html;
      });
    };
    payIn.addEventListener("input", payCalc);
    payCalc();
  }

  /* ---------- lead form ---------- */
  $all("form[data-lead-form]").forEach(function (form) {
    var box = form.closest("[data-lead-box], .glass") || form.parentNode;
    var err = form.querySelector("[data-form-error]");
    var submit = form.querySelector('button[type="submit"]');
    var done = function () {
      $all('[data-if="notSent"]', box).forEach(function (el) { el.hidden = true; });
      $all('[data-if="sent"]', box).forEach(function (el) { el.hidden = false; el.setAttribute("tabindex", "-1"); el.focus(); });
      if (window.gtag) window.gtag("event", "generate_lead");
      if (window.fbq) window.fbq("track", "Lead");
    };
    var fail = function (msg) { if (err) { err.textContent = msg; err.hidden = false; } if (submit) submit.disabled = false; };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) err.hidden = true;
      var d = {};
      new FormData(form).forEach(function (val, key) { d[key] = String(val).trim(); });
      if (d.website) return; // honeypot
      d.page = location.pathname;
      if (submit) submit.disabled = true;
      if (C.leadEndpoint) {
        fetch(C.leadEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
          .catch(function () { fail("Sorry, that did not send. Please try again or WhatsApp us."); });
      } else if (waDigits) {
        var msg = "Hi Digital Rewards, I'd like a free growth assessment.\n" +
          "Name: " + d.name + "\nBusiness: " + d.business + "\nType: " + d.type + "\nBranches: " + d.branches +
          "\nEmail: " + d.email + "\nWhatsApp: " + d.whatsapp + (d.challenge ? "\nChallenge: " + d.challenge : "");
        window.open("https://wa.me/" + waDigits + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
        done();
      } else {
        fail("This form is not connected yet. Please check back soon.");
      }
    });
    // honeypot field for bots
    var hp = document.createElement("input");
    hp.type = "text"; hp.name = "website"; hp.tabIndex = -1; hp.autocomplete = "off";
    hp.setAttribute("aria-hidden", "true");
    hp.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0";
    form.appendChild(hp);
  });

  /* ---------- stamp-card form: one stamp per filled field, the 6th (gift) when all are in ---------- */
  $all("form[data-stamps]").forEach(function (form) {
    var fields = $all("[data-stamp]", form);
    var stamps = $all("[data-stamp-row] .stamp", form);
    var row = form.querySelector("[data-stamp-row]");
    var countEl = form.querySelector("[data-stamp-count]");
    var leftEl = form.querySelector("[data-stamp-left]");
    var paint = function () {
      var n = 0;
      fields.forEach(function (el) {
        var ok = el.value.trim() !== "" && el.checkValidity();
        el.classList.toggle("done", ok);
        if (ok) n++;
      });
      var total = stamps.length;
      stamps.forEach(function (s, i) { s.classList.toggle("on", i === total - 1 ? n >= fields.length : i < n); });
      if (countEl) countEl.textContent = n;
      if (leftEl) leftEl.textContent = n >= fields.length ? "Ready to claim" : (fields.length - n) + " to go";
      if (row) row.setAttribute("aria-label", n + " of " + fields.length + " stamps collected");
    };
    form.addEventListener("input", paint);
    form.addEventListener("change", paint);
    paint();
  });

  /* ---------- home features: light one tool + its phone message at a time ---------- */
  var fxRows = $all(".fx-list [data-fx]"), fxNotes = $all(".fx-notes [data-fx]");
  if (fxRows.length) {
    var fxI = 0, fxHold = false;
    var fxSet = function (i) {
      fxI = i;
      fxRows.concat(fxNotes).forEach(function (el) { el.classList.toggle("on", +el.getAttribute("data-fx") === i); });
    };
    fxRows.forEach(function (el) {
      el.addEventListener("mouseenter", function () { fxHold = true; fxSet(+el.getAttribute("data-fx")); });
      el.addEventListener("mouseleave", function () { fxHold = false; });
    });
    var fxStill = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fxStill) setInterval(function () { if (!fxHold && !document.hidden) fxSet((fxI + 1) % fxRows.length); }, 2600);
  }

  /* ---------- analytics, only after consent (POPIA) ---------- */
  var loadAnalytics = function () {
    if (C.ga4) {
      var s = document.createElement("script");
      s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(C.ga4);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", C.ga4);
    }
    if (C.metaPixel) {
      /* eslint-disable */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
      window.fbq("init", C.metaPixel); window.fbq("track", "PageView");
    }
  };
  if (C.ga4 || C.metaPixel) {
    var choice = null;
    try { choice = localStorage.getItem("dr-consent"); } catch (e) {}
    if (choice === "yes") loadAnalytics();
    else if (choice !== "no") {
      var bar = document.createElement("div");
      bar.className = "glass consent";
      bar.setAttribute("role", "region");
      bar.setAttribute("aria-label", "Cookie consent");
      bar.innerHTML = '<span style="flex:1 1 260px">We use analytics cookies to improve this site. <a href="privacy">Privacy policy</a></span>' +
        '<span style="display:flex;gap:8px"><button type="button" class="edge" data-c="no">Decline</button><button type="button" class="cta" data-c="yes">Accept</button></span>';
      document.body.appendChild(bar);
      bar.addEventListener("click", function (e) {
        var b = e.target.closest("[data-c]");
        if (!b) return;
        var v = b.getAttribute("data-c");
        try { localStorage.setItem("dr-consent", v); } catch (err) {}
        bar.remove();
        if (v === "yes") loadAnalytics();
      });
    }
  }
})();

/* Solutions page: phone tour tabs + goal picker (classes so-*, markup in solutions.html) */
(function () {
  var tour = document.querySelector("[data-so-tour]");
  if (tour) {
    var tabs = [].slice.call(tour.querySelectorAll('[role="tab"]'));
    var show = function (i) {
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
        document.getElementById(t.getAttribute("data-screen")).hidden = !on;
      });
    };
    tabs.forEach(function (t, i) { t.addEventListener("click", function () { show(i); }); });
    tour.querySelector('[role="tablist"]').addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0 || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      var n = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
      show(n); tabs[n].focus(); e.preventDefault();
    });
  }
  var picker = document.querySelector("[data-so-goals]");
  if (picker) {
    var goals = [].slice.call(picker.querySelectorAll("[data-goal]"));
    goals.forEach(function (b) {
      b.addEventListener("click", function () {
        var on = (b.getAttribute("data-on") + " man").split(" ");
        goals.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        [].forEach.call(picker.querySelectorAll(".so-tool"), function (t) {
          var lit = on.indexOf(t.getAttribute("data-k")) > -1;
          t.classList.toggle("on", lit); t.classList.toggle("off", !lit);
        });
        [].forEach.call(picker.querySelectorAll("[data-plan]"), function (p) { p.hidden = p.getAttribute("data-plan") !== b.getAttribute("data-goal"); });
      });
    });
  }
  var ip = document.querySelector("[data-ip]");
  if (ip) {
    var ipTabs = [].slice.call(ip.querySelectorAll('[role="tab"]'));
    var ipShow = function (n) {
      ipTabs.forEach(function (t, i) {
        var on = i === n;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    };
    ipTabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        ipShow(i);
        if (t.scrollIntoView && t.parentNode.scrollWidth > t.parentNode.clientWidth) t.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      });
    });
    ip.querySelector('[role="tablist"]').addEventListener("keydown", function (e) {
      var i = ipTabs.indexOf(document.activeElement);
      if (i < 0 || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      var n = (i + (e.key === "ArrowRight" ? 1 : ipTabs.length - 1)) % ipTabs.length;
      ipShow(n); ipTabs[n].focus(); e.preventDefault();
    });
    ipShow(0);
  }
})();

// Home "Meet Jason" video: big play button, then native controls
document.querySelectorAll('[data-mv]').forEach(function (f) {
  var v = f.querySelector('video'), b = f.querySelector('.mv-play');
  if (!v || !b) return;
  b.addEventListener('click', function () {
    f.classList.add('on'); v.controls = true; v.preload = 'auto';
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    v.focus();
  });
  v.addEventListener('play', function () { f.classList.add('on'); v.controls = true; });
});
