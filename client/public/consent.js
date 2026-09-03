/**
 * MineTrans cookie consent — Google Consent Mode v2.
 *
 * The defaults (everything except security_storage denied) are set by a small
 * inline snippet in each page's <head>, before the GTM container loads, so no
 * tag can fire ahead of a choice. This file only renders the banner and sends
 * the 'update' once the visitor decides.
 *
 * POPIA: consent is opt-in, refusing is as easy as accepting, and the choice
 * can be changed at any time through the footer link this script adds.
 */
(function () {
  "use strict";

  var STORE = "mt_consent_v1";
  var SIGNALS = [
    "ad_storage",
    "ad_user_data",
    "ad_personalization",
    "analytics_storage",
    "functionality_storage",
    "personalization_storage"
  ];

  // Visitor-facing categories, each mapping to the Google signals it controls.
  var CATEGORIES = [
    {
      id: "necessary",
      name: "Strictly necessary",
      always: true,
      signals: [],
      desc: "Required for the site to work — page delivery, security and remembering this choice. These cannot be switched off."
    },
    {
      id: "analytics",
      name: "Analytics",
      signals: ["analytics_storage"],
      desc: "Anonymous statistics on which pages are read and how people arrive, so we can improve the site."
    },
    {
      id: "functional",
      name: "Functional",
      signals: ["functionality_storage", "personalization_storage"],
      desc: "Remembers preferences such as previously viewed content, so the site behaves consistently between visits."
    },
    {
      id: "marketing",
      name: "Marketing",
      signals: ["ad_storage", "ad_user_data", "ad_personalization"],
      desc: "Measures the performance of advertising and allows relevant campaigns to be shown on other platforms."
    }
  ];

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function read() {
    try {
      var raw = window.localStorage.getItem(STORE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function write(prefs) {
    try {
      window.localStorage.setItem(STORE, JSON.stringify(prefs));
    } catch (e) {
      /* private mode or storage disabled — the banner simply reappears */
    }
  }

  /** Build a consent object from a map of {categoryId: boolean}. */
  function toSignals(choices) {
    var out = {};
    SIGNALS.forEach(function (s) { out[s] = "denied"; });
    CATEGORIES.forEach(function (cat) {
      if (cat.always || !choices[cat.id]) return;
      cat.signals.forEach(function (s) { out[s] = "granted"; });
    });
    return out;
  }

  function toChoices(prefs) {
    var choices = {};
    CATEGORIES.forEach(function (cat) {
      if (cat.always) { choices[cat.id] = true; return; }
      choices[cat.id] = cat.signals.every(function (s) {
        return prefs && prefs[s] === "granted";
      });
    });
    return choices;
  }

  function apply(choices) {
    var signals = toSignals(choices);
    gtag("consent", "update", signals);
    // Redact ad identifiers in requests while advertising consent is withheld.
    gtag("set", "ads_data_redaction", signals.ad_storage !== "granted");

    var record = {};
    SIGNALS.forEach(function (s) { record[s] = signals[s]; });
    record.v = 1;
    record.ts = new Date().toISOString();
    write(record);

    window.dataLayer.push({
      event: "consent_update",
      consent_analytics: signals.analytics_storage,
      consent_marketing: signals.ad_storage,
      consent_functional: signals.functionality_storage
    });
  }

  /* ---------------------------------------------------------------- styles */

  var CSS = [
    '.mtc,.mtc *{box-sizing:border-box}',
    '.mtc{position:fixed;z-index:2147483000;left:0;right:0;bottom:0;',
    'font-family:\'Inter\',system-ui,-apple-system,"Segoe UI",sans-serif;',
    'background:#111013;border-top:1px solid #3A383D;color:#C9CACE;',
    'box-shadow:0 -18px 48px rgba(0,0,0,.55)}',
    '.mtc-in{max-width:1100px;margin:0 auto;padding:20px 22px;',
    'display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}',
    '.mtc-copy{flex:1 1 380px;min-width:0}',
    '.mtc-h{margin:0 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;',
    'color:#C9854F;font-weight:600}',
    '.mtc-p{margin:0;font-size:13.5px;line-height:1.65;color:#C9CACE}',
    '.mtc-p a{color:#C9854F;text-decoration:underline;text-underline-offset:2px}',
    '.mtc-acts{display:flex;gap:10px;flex-wrap:wrap;align-items:center;flex:0 0 auto}',
    '.mtc-btn{font:inherit;font-size:13px;font-weight:500;min-height:44px;padding:0 20px;',
    'border-radius:3px;cursor:pointer;border:1px solid #3A383D;background:transparent;',
    'color:#C9CACE;transition:border-color .2s,color .2s,background .2s;',
    'display:inline-flex;align-items:center;justify-content:center}',
    '.mtc-btn:hover{border-color:#AD6A3D;color:#F7F5F1}',
    '.mtc-btn:focus-visible{outline:2px solid #C9854F;outline-offset:2px}',
    '.mtc-btn.pri{background:#AD6A3D;border-color:#AD6A3D;color:#0A0A0B;font-weight:600}',
    '.mtc-btn.pri:hover{background:#C9854F;border-color:#C9854F;color:#0A0A0B}',
    '.mtc-btn.link{border-color:transparent;padding:0 8px;text-decoration:underline;',
    'text-underline-offset:3px;color:#9A9AA0}',
    '.mtc-btn.link:hover{color:#F7F5F1;border-color:transparent}',
    /* preferences panel */
    '.mtc-panel{border-top:1px solid #3A383D;background:#0A0A0B;max-height:60vh;overflow:auto}',
    '.mtc-panel-in{max-width:1100px;margin:0 auto;padding:6px 22px 20px}',
    '.mtc-cat{padding:16px 0;border-bottom:1px solid #232227;display:flex;gap:16px;',
    'align-items:flex-start}',
    '.mtc-cat:last-child{border-bottom:0}',
    '.mtc-cat-txt{flex:1 1 auto;min-width:0}',
    '.mtc-cat-n{font-size:13.5px;font-weight:600;color:#F7F5F1;margin:0 0 4px}',
    '.mtc-cat-d{font-size:12.5px;line-height:1.6;color:#9A9AA0;margin:0}',
    '.mtc-sw{flex:0 0 auto;display:inline-flex;align-items:center;gap:10px;',
    'min-height:44px;cursor:pointer;user-select:none}',
    '.mtc-sw input{position:absolute;opacity:0;width:0;height:0}',
    '.mtc-track{width:44px;height:24px;border-radius:12px;background:#2A2930;',
    'border:1px solid #3A383D;position:relative;transition:background .2s,border-color .2s;',
    'flex:0 0 auto}',
    '.mtc-track::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;',
    'border-radius:50%;background:#6E6C70;transition:transform .2s,background .2s}',
    '.mtc-sw input:checked+.mtc-track{background:#AD6A3D;border-color:#AD6A3D}',
    '.mtc-sw input:checked+.mtc-track::after{transform:translateX(20px);background:#0A0A0B}',
    '.mtc-sw input:focus-visible+.mtc-track{outline:2px solid #C9854F;outline-offset:2px}',
    '.mtc-sw input:disabled+.mtc-track{opacity:.5;cursor:not-allowed}',
    '.mtc-sw-l{font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:#9A9AA0;',
    'min-width:66px}',
    /* footer re-open link */
    '.mtc-reopen{background:none;border:0;padding:0;font:inherit;color:inherit;',
    'cursor:pointer;text-decoration:underline;text-underline-offset:2px;opacity:.8;',
    'min-height:44px;display:inline-flex;align-items:center}',
    '.mtc-reopen:hover{opacity:1}',
    '@media(max-width:760px){',
    '.mtc-in{padding:18px 16px;gap:16px}',
    '.mtc-acts{width:100%}',
    '.mtc-acts .mtc-btn{flex:1 1 auto}',
    '.mtc-acts .mtc-btn.link{flex:1 1 100%;order:3}',
    '.mtc-panel-in{padding:6px 16px 18px}',
    '.mtc-cat{flex-direction:column;gap:10px}',
    '}',
    '@media(prefers-reduced-motion:reduce){.mtc *{transition:none!important}}'
  ].join("");

  /* ------------------------------------------------------------------- DOM */

  var root = null;
  var lastFocus = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function close() {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); lastFocus = null; }
  }

  function onKey(e) {
    if (e.key !== "Escape" || !root) return;
    // Esc only dismisses the expanded panel, never the choice itself.
    var panel = root.querySelector(".mtc-panel");
    if (panel) { panel.parentNode.removeChild(panel); }
  }

  function decide(choices) {
    apply(choices);
    close();
  }

  function allTrue(v) {
    var c = {};
    CATEGORIES.forEach(function (cat) { c[cat.id] = cat.always ? true : v; });
    return c;
  }

  function buildPanel(current) {
    var panel = el("div", "mtc-panel");
    var inner = el("div", "mtc-panel-in");
    var state = {};

    CATEGORIES.forEach(function (cat) {
      state[cat.id] = cat.always ? true : !!current[cat.id];

      var row = el("div", "mtc-cat");
      var txt = el("div", "mtc-cat-txt");
      txt.appendChild(el("p", "mtc-cat-n", cat.name));
      txt.appendChild(el("p", "mtc-cat-d", cat.desc));

      var label = el("label", "mtc-sw");
      var input = document.createElement("input");
      input.type = "checkbox";
      input.checked = state[cat.id];
      input.disabled = !!cat.always;
      input.setAttribute("aria-label", cat.name);

      var track = el("span", "mtc-track");
      var lbl = el("span", "mtc-sw-l", cat.always ? "Always on" : (state[cat.id] ? "On" : "Off"));

      input.addEventListener("change", function () {
        state[cat.id] = input.checked;
        lbl.textContent = input.checked ? "On" : "Off";
      });

      label.appendChild(input);
      label.appendChild(track);
      label.appendChild(lbl);
      row.appendChild(txt);
      row.appendChild(label);
      inner.appendChild(row);
    });

    var save = el("div", "mtc-acts");
    save.style.paddingTop = "16px";
    var saveBtn = el("button", "mtc-btn pri", "Save preferences");
    saveBtn.type = "button";
    saveBtn.addEventListener("click", function () { decide(state); });
    save.appendChild(saveBtn);
    inner.appendChild(save);

    panel.appendChild(inner);
    return panel;
  }

  function render(opts) {
    if (root) close();
    lastFocus = document.activeElement;

    var current = toChoices(read() || {});

    root = el("div", "mtc");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-live", "polite");
    root.setAttribute("aria-label", "Cookie preferences");

    var bar = el("div", "mtc-in");
    var copy = el("div", "mtc-copy");
    copy.appendChild(el("p", "mtc-h", "Cookies on this site"));

    var p = el("p", "mtc-p");
    p.appendChild(document.createTextNode(
      "We use cookies to keep the site working and, with your permission, to measure how it is used. " +
      "Nothing beyond what is strictly necessary is set until you choose. You can change this at any time. "
    ));
    var link = el("a", null, "Ask us about your data");
    link.href = "contact.html";
    p.appendChild(link);
    p.appendChild(document.createTextNode("."));
    copy.appendChild(p);

    var acts = el("div", "mtc-acts");

    var prefsBtn = el("button", "mtc-btn link", "Manage preferences");
    prefsBtn.type = "button";
    prefsBtn.addEventListener("click", function () {
      var existing = root.querySelector(".mtc-panel");
      if (existing) { existing.parentNode.removeChild(existing); return; }
      root.appendChild(buildPanel(current));
    });

    var rejectBtn = el("button", "mtc-btn", "Reject non-essential");
    rejectBtn.type = "button";
    rejectBtn.addEventListener("click", function () { decide(allTrue(false)); });

    var acceptBtn = el("button", "mtc-btn pri", "Accept all");
    acceptBtn.type = "button";
    acceptBtn.addEventListener("click", function () { decide(allTrue(true)); });

    acts.appendChild(prefsBtn);
    acts.appendChild(rejectBtn);
    acts.appendChild(acceptBtn);

    bar.appendChild(copy);
    bar.appendChild(acts);
    root.appendChild(bar);
    document.body.appendChild(root);

    if (opts && opts.openPanel) root.appendChild(buildPanel(current));

    document.addEventListener("keydown", onKey);
    acceptBtn.focus();
  }

  /* --------------------------------------------------------- footer re-open */

  function addFooterLink() {
    var footers = document.querySelectorAll("footer");
    if (!footers.length) return;
    var footer = footers[footers.length - 1];
    if (footer.querySelector(".mtc-reopen")) return;

    var btn = el("button", "mtc-reopen", "Cookie preferences");
    btn.type = "button";
    btn.addEventListener("click", function () { render({ openPanel: true }); });

    var host = footer.querySelector(".footbottom") || footer.querySelector(".inner") || footer;
    var wrap = el("div");
    wrap.style.marginTop = "10px";
    wrap.style.fontSize = "12px";
    wrap.appendChild(btn);
    host.appendChild(wrap);
  }

  function init() {
    addFooterLink();
    // No stored decision yet — ask. A stored one was already applied as the
    // Consent Mode default by the inline snippet, so nothing to re-send.
    if (!read()) render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  var style = document.createElement("style");
  style.appendChild(document.createTextNode(CSS));
  (document.head || document.documentElement).appendChild(style);

  window.MineTransConsent = {
    open: function () { render({ openPanel: true }); },
    get: read
  };
})();
