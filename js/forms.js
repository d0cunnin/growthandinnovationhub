/* Growth and Innovation Hub — inquiry form validation and submission.
   Submission behaviour is controlled by js/form-config.js. The forms never
   report success unless the configured service confirms receipt. */
(function () {
  "use strict";
  var cfg = window.GIH_FORM_CONFIG || { provider: "none" };
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var params = new URLSearchParams(window.location.search);

  function labelText(field) {
    var lab = field.closest(".field") && field.closest(".field").querySelector("label, legend");
    return lab ? lab.textContent.replace("*", "").replace("(optional)", "").trim() : field.name;
  }

  function setError(field, msg) {
    var wrap = field.closest(".field");
    var err = wrap && wrap.querySelector(".error");
    if (msg) {
      field.setAttribute("aria-invalid", "true");
      if (wrap) wrap.classList.add("has-error");
      if (err) err.textContent = msg;
    } else {
      field.removeAttribute("aria-invalid");
      if (wrap) wrap.classList.remove("has-error");
      if (err) err.textContent = "";
    }
  }

  function validateField(field) {
    var v = (field.type === "checkbox") ? field.checked : field.value.trim();
    var name = labelText(field);
    if (field.required && !v) {
      return field.type === "checkbox" ? "Please confirm to continue." :
        (field.tagName === "SELECT" ? "Please choose " + name.toLowerCase() + "." : "Please enter " + name.toLowerCase() + ".");
    }
    if (field.type === "email" && v && !EMAIL_RE.test(v)) return "Please enter a valid email address, like name@example.org.";
    if (field.type === "number" && v) {
      var n = Number(v);
      if (!Number.isFinite(n) || n < 1 || Math.floor(n) !== n) return "Please enter a whole number of 1 or more.";
    }
    if (field.type === "tel" && v && !/^[0-9+().\-\s]{7,}$/.test(v)) return "Please enter a valid phone number, or leave it blank.";
    if (field.tagName === "TEXTAREA" && v && v.length > 4000) return "Please keep this under 4,000 characters.";
    return "";
  }

  function collect(form) {
    var data = {};
    new FormData(form).forEach(function (val, key) {
      if (key === "website") return;               // honeypot
      data[key] = typeof val === "string" ? val.trim() : val;
    });
    return data;
  }

  function showStatus(form, kind, title, text) {
    var box = form.querySelector(".form-status");
    box.className = "form-status show " + kind;
    box.innerHTML = "";
    var h = document.createElement("h3"); h.textContent = title;
    var p = document.createElement("p"); p.textContent = text;
    box.appendChild(h); box.appendChild(p);
    box.focus();
  }

  function send(form, payload) {
    if (cfg.provider === "netlify") {
      // Netlify Forms: post the form's own fields (including the hidden
      // form-name) URL-encoded to the site root. Netlify answers 2xx only when
      // it has recorded the submission for a form it detected at deploy time.
      return fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "text/html" },
        body: new URLSearchParams(new FormData(form)).toString()
      });
    }
    if (cfg.provider === "endpoint" && cfg.endpoint) {
      return fetch(cfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
    }
    if (cfg.provider === "supabase" && cfg.supabaseUrl && cfg.supabaseAnonKey) {
      return fetch(cfg.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + encodeURIComponent(cfg.supabaseTable || "inquiries"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": cfg.supabaseAnonKey,
          "Authorization": "Bearer " + cfg.supabaseAnonKey,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({ form_name: payload.form, page: payload.page, fields: payload.fields })
      });
    }
    return null;   // not configured
  }

  document.querySelectorAll(".inquiry-form").forEach(function (form) {
    var summary = form.querySelector(".form-error-summary");
    var button = form.querySelector('button[type="submit"]');
    var buttonHTML = button.innerHTML;
    form.noValidate = true;   // use our accessible validation; browsers validate if JS is off

    // Pre-select inquiry type (?type=) and focus area (?focus=) from links.
    var type = params.get("type");
    if (type) {
      var radio = form.querySelector('input[name="inquiry-type"][value="' + CSS.escape(type) + '"]');
      if (radio) radio.checked = true;
    }
    var focus = params.get("focus");
    var focusSelect = form.querySelector("#focus-area");
    if (focus && focusSelect) {
      var map = {
        "ai-education": "AI Education & Integration",
        "organizational-preparedness": "Organizational Preparedness",
        "leadership-development": "Leadership Development",
        "community-impact": "Community Impact",
        "entrepreneurship-development": "Entrepreneurship Development"
      };
      if (map[focus]) focusSelect.value = map[focus];
    }

    var fields = Array.prototype.slice.call(form.querySelectorAll("input:not([type=radio]):not([name=website]), select, textarea"));
    fields.forEach(function (f) {
      f.addEventListener("blur", function () { if (f.getAttribute("aria-invalid") === "true" || f.value) setError(f, validateField(f)); });
      f.addEventListener("input", function () { if (f.getAttribute("aria-invalid") === "true") setError(f, validateField(f)); });
      f.addEventListener("change", function () { if (f.getAttribute("aria-invalid") === "true") setError(f, validateField(f)); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var problems = [];
      fields.forEach(function (f) {
        var msg = validateField(f);
        setError(f, msg);
        if (msg) problems.push({ field: f, msg: msg });
      });

      if (problems.length) {
        summary.hidden = false;
        summary.innerHTML = "";
        var p = document.createElement("p");
        p.textContent = problems.length === 1 ? "Please correct 1 field before submitting:" : "Please correct " + problems.length + " fields before submitting:";
        var ul = document.createElement("ul");
        problems.forEach(function (pr) {
          var li = document.createElement("li"), a = document.createElement("a");
          a.href = "#" + pr.field.id; a.textContent = pr.msg;
          a.addEventListener("click", function (ev) { ev.preventDefault(); pr.field.focus(); });
          li.appendChild(a); ul.appendChild(li);
        });
        summary.appendChild(p); summary.appendChild(ul);
        summary.focus();
        return;
      }
      summary.hidden = true;

      // Honeypot filled in: quietly stop (likely automated spam).
      var hp = form.querySelector('input[name="website"]');
      if (hp && hp.value) return;

      var payload = {
        form: form.getAttribute("data-form-name"),
        submittedAt: new Date().toISOString(),
        page: window.location.pathname,
        fields: collect(form)
      };

      var request = send(form, payload);
      if (!request) {
        showStatus(form, "info", "Online submission isn’t available yet",
          "This inquiry form has not been connected to a delivery service yet, so your message has not been sent. Please keep your details and check back soon. We’re setting this up now.");
        return;
      }

      button.disabled = true;
      button.textContent = "Sending…";
      request.then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        fields.forEach(function (f) { setError(f, ""); });
        showStatus(form, "success", "Thank you, your inquiry was received.",
          "We’ll review your message and follow up by email.");
      }).catch(function () {
        showStatus(form, "error", "Your inquiry could not be sent.",
          "Something went wrong while sending your message, and it was not delivered. Please try again in a few minutes.");
      }).then(function () {
        button.disabled = false;
        button.innerHTML = buttonHTML;
      });
    });
  });
})();
