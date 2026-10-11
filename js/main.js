/* Growth and Innovation Hub — site-wide interactions (no dependencies). */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  var header = document.querySelector(".site-header");
  var menuBtn = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  /* ---------- Mobile menu ---------- */
  function setMenu(open, returnFocus) {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.querySelector(".menu-label").textContent = open ? "Close" : "Menu";
    mobileNav.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
    if (open) {
      var first = mobileNav.querySelector("a");
      if (first) first.focus();
    } else if (returnFocus) {
      menuBtn.focus();
    }
  }
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    // Close when a link is chosen (including same-page anchors).
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    // Keep keyboard focus inside the open menu; Escape closes it.
    document.addEventListener("keydown", function (e) {
      if (!mobileNav.classList.contains("open")) return;
      if (e.key === "Escape") { setMenu(false, true); return; }
      if (e.key !== "Tab") return;
      var items = [menuBtn].concat(Array.prototype.slice.call(mobileNav.querySelectorAll("a")));
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    });
    // If the window grows to desktop width, reset the mobile menu.
    window.matchMedia("(min-width: 1220px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Focus Areas dropdown ---------- */
  document.querySelectorAll(".has-dropdown").forEach(function (wrap) {
    var btn = wrap.querySelector(".dropdown-toggle");
    var menu = wrap.querySelector(".dropdown");
    var links = Array.prototype.slice.call(menu.querySelectorAll("a"));
    function set(open, focusBtn) {
      btn.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("open", open);
      if (!open && focusBtn) btn.focus();
    }
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      set(open);
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); set(true); links[0].focus(); }
    });
    menu.addEventListener("keydown", function (e) {
      var i = links.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); links[(i + 1) % links.length].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
      if (e.key === "Home") { e.preventDefault(); links[0].focus(); }
      if (e.key === "End") { e.preventDefault(); links[links.length - 1].focus(); }
    });
    wrap.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") set(false, true);
    });
    wrap.addEventListener("focusout", function (e) {
      if (!wrap.contains(e.relatedTarget)) set(false);
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) set(false);
    });
  });

  /* ---------- Header shadow on scroll ---------- */
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Gentle reveal on scroll (skipped for reduced motion) ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Move focus to in-page targets (skip link, #anchors) ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    var target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    setTimeout(function () { target.focus({ preventScroll: true }); }, 0);
  });
})();
