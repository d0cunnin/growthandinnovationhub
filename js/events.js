/* Growth and Innovation Hub — renders events from js/events-data.js. */
(function () {
  "use strict";
  var list = document.getElementById("event-list");
  var empty = document.getElementById("events-empty");
  var filterWrap = document.querySelector(".event-filter");
  var filter = document.getElementById("event-focus");
  if (!list) return;

  var FOCUS = {
    "ai-education": "AI Education & Integration",
    "organizational-preparedness": "Organizational Preparedness",
    "leadership-development": "Leadership Development",
    "community-impact": "Community Impact",
    "entrepreneurship-development": "Entrepreneurship Development"
  };
  var STATUS = { open: "Registration open", closed: "Registration closed", full: "Event full" };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function safeUrl(u) { return /^(https?:\/\/|[a-z0-9-]+\.html)/i.test(u || "") ? u : ""; }
  function endOf(ev) { return new Date(ev.end || ev.start); }
  function fmt(date, opts, tz) {
    try { return new Intl.DateTimeFormat("en-US", Object.assign({}, opts, tz ? { timeZone: tz } : {})).format(date); }
    catch (e) { return new Intl.DateTimeFormat("en-US", opts).format(date); }
  }

  var now = new Date();
  var events = (window.GIH_EVENTS || []).filter(function (ev) {
    return ev && ev.title && ev.start && !isNaN(new Date(ev.start)) && endOf(ev) >= now;
  }).sort(function (a, b) { return new Date(a.start) - new Date(b.start); });

  function render() {
    var key = filter ? filter.value : "";
    var shown = events.filter(function (ev) { return !key || ev.focusArea === key; });
    list.innerHTML = "";
    if (!events.length) { empty.hidden = false; if (filterWrap) filterWrap.hidden = true; return; }
    empty.hidden = true;
    if (filterWrap) filterWrap.hidden = false;
    if (!shown.length) { list.appendChild(el("p", "note", "No upcoming events in this focus area yet.")); return; }

    shown.forEach(function (ev) {
      var start = new Date(ev.start);
      var card = el("article", "event");
      var date = el("div", "event-date");
      date.appendChild(el("span", "m", fmt(start, { month: "short" })));
      date.appendChild(el("span", "d", fmt(start, { day: "numeric" })));
      card.appendChild(date);

      var body = el("div");
      if (FOCUS[ev.focusArea]) body.appendChild(el("span", "tag", FOCUS[ev.focusArea]));
      var h = el("h3", null, ev.title);
      if (STATUS[ev.status]) h.appendChild(el("span", "status status-" + ev.status, STATUS[ev.status]));
      body.appendChild(h);
      if (ev.description) body.appendChild(el("p", null, ev.description));

      var det = el("ul", "event-details");
      function add(label, value) {
        if (!value) return;
        var li = el("li"); li.appendChild(el("strong", null, label + ": ")); li.appendChild(document.createTextNode(value)); det.appendChild(li);
      }
      var when = fmt(start, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) + ", " +
        fmt(start, { hour: "numeric", minute: "2-digit" }) +
        (ev.end ? "–" + fmt(new Date(ev.end), { hour: "numeric", minute: "2-digit" }) : "");
      add("When", when);
      add("Time zone", ev.timeZone ? ev.timeZone.replace(/_/g, " ") : "");
      add("Format", ev.format);
      add("Location", ev.location);
      add("Register by", ev.registrationDeadline ? fmt(new Date(ev.registrationDeadline + "T12:00"), { month: "long", day: "numeric", year: "numeric" }) : "");
      add("Fee", ev.fee);
      body.appendChild(det);
      card.appendChild(body);

      var url = safeUrl(ev.registrationUrl);
      if (url && ev.status === "open") {
        var a = el("a", "btn btn-primary", "Register");
        a.href = url;
        if (/^https?:/.test(url)) { a.target = "_blank"; a.rel = "noopener"; }
        a.setAttribute("aria-label", "Register for " + ev.title + (a.target ? " (opens in a new tab)" : ""));
        card.appendChild(a);
      } else if (ev.status === "open") {
        var c = el("a", "btn btn-secondary", "Express interest");
        c.href = "contact.html?type=training";
        c.setAttribute("aria-label", "Express interest in " + ev.title);
        card.appendChild(c);
      }
      list.appendChild(card);
    });
  }

  if (filter) filter.addEventListener("change", render);
  render();
})();
