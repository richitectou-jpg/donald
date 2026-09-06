/* ==========================================================================
   Tat In Ou — Architecture Portfolio
   Vanilla JS, no dependencies. Everything degrades gracefully without it.
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Reveal on scroll --------------------------------------------------- */

  (function reveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    items.forEach(function (el, i) {
      // Small stagger within a row of siblings, capped so nothing lags badly.
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
      io.observe(el);
    });
  })();

  /* --- Index hover preview ------------------------------------------------ */

  (function peek() {
    var rows = document.querySelectorAll("[data-peek]");
    if (!rows.length) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    var el = document.createElement("div");
    el.className = "work__peek";
    var img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    el.appendChild(img);
    document.body.appendChild(el);

    var x = 0, y = 0, raf = null;

    function draw() {
      el.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      raf = null;
    }

    function move(e) {
      // Offset from the true cursor so the panel does not sit under the pointer.
      x = e.clientX + 40;
      y = e.clientY;
      var w = el.offsetWidth || 352;
      if (x + w / 2 > window.innerWidth - 16) x = e.clientX - 40 - w / 2;
      if (!raf) raf = requestAnimationFrame(draw);
    }

    rows.forEach(function (row) {
      var src = row.getAttribute("data-peek");
      if (!src) return;

      row.addEventListener("mouseenter", function (e) {
        img.src = src;
        el.classList.add("is-on");
        move(e);
      });
      row.addEventListener("mousemove", move);
      row.addEventListener("mouseleave", function () {
        el.classList.remove("is-on");
      });
    });
  })();

  /* --- Lightbox ----------------------------------------------------------- */

  (function lightbox() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lb]"));
    if (!triggers.length) return;

    var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var ICON_PREV  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
    var ICON_NEXT  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

    var box = document.createElement("div");
    box.className = "lb";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Media viewer");
    box.hidden = true;
    box.innerHTML =
      '<div class="lb__bar">' +
        '<span class="lb__count" data-lb-count></span>' +
        '<button type="button" class="lb__close" data-lb-close>Close ' + ICON_CLOSE + '</button>' +
      '</div>' +
      '<div class="lb__stage" data-lb-stage>' +
        '<button type="button" class="lb__nav lb__nav--prev" data-lb-prev aria-label="Previous">' + ICON_PREV + '</button>' +
        '<button type="button" class="lb__nav lb__nav--next" data-lb-next aria-label="Next">' + ICON_NEXT + '</button>' +
      '</div>' +
      '<div class="lb__cap" data-lb-cap></div>';
    document.body.appendChild(box);

    var stage   = box.querySelector("[data-lb-stage]");
    var elCount = box.querySelector("[data-lb-count]");
    var elCap   = box.querySelector("[data-lb-cap]");
    var btnPrev = box.querySelector("[data-lb-prev]");
    var btnNext = box.querySelector("[data-lb-next]");
    var btnClose= box.querySelector("[data-lb-close]");

    var group = [];
    var index = 0;
    var lastFocus = null;
    var media = null;

    function itemsInGroup(name) {
      return triggers.filter(function (t) { return t.getAttribute("data-lb") === name; });
    }

    function render() {
      var t = group[index];
      if (!t) return;

      var src  = t.getAttribute("data-src");
      var type = t.getAttribute("data-type") || "image";
      var cap  = t.getAttribute("data-caption") || "";

      if (media) media.remove();

      if (type === "pdf") {
        media = document.createElement("iframe");
        media.setAttribute("title", cap || "Drawing");
        media.src = src + "#view=FitH&navpanes=0";
      } else {
        media = document.createElement("img");
        media.alt = cap;
        media.decoding = "async";
        media.src = src;
      }
      stage.appendChild(media);

      elCap.textContent = cap;
      elCount.textContent = String(index + 1).padStart(2, "0") + " / " + String(group.length).padStart(2, "0");

      var single = group.length < 2;
      btnPrev.hidden = single;
      btnNext.hidden = single;
      btnPrev.disabled = index === 0;
      btnNext.disabled = index === group.length - 1;

      // Warm the neighbouring image so paging feels instant.
      var nxt = group[index + 1];
      if (nxt && (nxt.getAttribute("data-type") || "image") === "image") {
        new Image().src = nxt.getAttribute("data-src");
      }
    }

    function open(trigger) {
      group = itemsInGroup(trigger.getAttribute("data-lb"));
      index = group.indexOf(trigger);
      if (index < 0) index = 0;

      lastFocus = document.activeElement;
      box.hidden = false;
      // Force a frame so the transition actually runs.
      requestAnimationFrame(function () { box.classList.add("is-open"); });
      document.body.classList.add("is-locked");
      render();
      btnClose.focus();
    }

    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("is-locked");

      var done = function () {
        box.hidden = true;
        if (media) { media.remove(); media = null; }
      };
      if (reduceMotion) done(); else setTimeout(done, 350);

      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function step(delta) {
      var next = index + delta;
      if (next < 0 || next >= group.length) return;
      index = next;
      render();
    }

    triggers.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        open(t);
      });
    });

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () { step(-1); });
    btnNext.addEventListener("click", function () { step(1); });

    // Click the backdrop (but not the media itself) to dismiss.
    stage.addEventListener("click", function (e) {
      if (e.target === stage) close();
    });

    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape")     { e.preventDefault(); close(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); step(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      if (e.key === "Tab") {
        // Keep focus inside the dialog.
        var f = box.querySelectorAll("button:not([hidden]):not([disabled])");
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  })();

  /* --- Footer year -------------------------------------------------------- */

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
