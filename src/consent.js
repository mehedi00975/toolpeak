/**
 * consent.js — cookie consent bar + gated ad loading.
 *
 * Rules this file enforces, from the project brief:
 *   1. Accept and Decline are BOTH one click. No dark patterns, no "manage
 *      preferences" maze, no second confirmation step.
 *   2. The bar never locks scrolling and never covers the tool.
 *   3. Nothing ad-related touches the page until the visitor clicks Accept.
 *   4. Decline is remembered and fully respected: the tools still work, the
 *      ads simply never load.
 *
 * Ad snippets are injected by build.js into window.__TP_ADS from Cloudflare
 * environment variables, so no publisher ID is ever committed to the repo.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "tp-consent";
  var VERSION = "1"; // bump to re-ask everyone (e.g. if ad partners change)

  /* localStorage throws in Safari private mode — never let that break a tool. */
  function readConsent() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parts = raw.split(":");
      if (parts[1] !== VERSION) return null;
      return parts[0] === "accept" ? "accept" : "decline";
    } catch (e) { return null; }
  }

  function writeConsent(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value + ":" + VERSION); } catch (e) { }
  }

  /**
   * Injects a raw HTML ad snippet. Scripts inserted via innerHTML never
   * execute, so each <script> is rebuilt as a real element.
   */
  function injectSnippet(html, target) {
    if (!html || !target) return;
    var holder = document.createElement("div");
    holder.innerHTML = html;

    Array.prototype.forEach.call(holder.querySelectorAll("script"), function (old) {
      var s = document.createElement("script");
      Array.prototype.forEach.call(old.attributes, function (a) {
        s.setAttribute(a.name, a.value);
      });
      if (!old.src) s.text = old.textContent;
      s.async = true;
      old.parentNode.replaceChild(s, old);
    });

    while (holder.firstChild) target.appendChild(holder.firstChild);
  }

  var adsLoaded = false;

  function loadAds() {
    if (adsLoaded) return;
    adsLoaded = true;

    var ads = window.__TP_ADS || {};

    // One in-content banner, and only on pages that reserved a slot for it.
    if (ads.banner) {
      Array.prototype.forEach.call(document.querySelectorAll("[data-ad=banner]"), function (slot) {
        slot.removeAttribute("data-placeholder");
        slot.textContent = "";
        injectSnippet(ads.banner, slot);
      });
    }

    // One popunder and one social bar per page, appended to <body>.
    // Deferred to idle time so they can never delay the tool becoming usable.
    var deferred = function () {
      if (ads.popunder) injectSnippet(ads.popunder, document.body);
      if (ads.socialBar) injectSnippet(ads.socialBar, document.body);
      if (window.__TP_ANALYTICS && window.__TP_ANALYTICS.cloudflareToken) {
        var s = document.createElement("script");
        s.defer = true;
        s.src = "https://static.cloudflareinsights.com/beacon.min.js";
        s.setAttribute("data-cf-beacon", '{"token":"' + window.__TP_ANALYTICS.cloudflareToken + '"}');
        document.body.appendChild(s);
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(deferred, { timeout: 2600 });
    } else {
      setTimeout(deferred, 1200);
    }
  }

  /**
   * Collapses the reserved ad space when the visitor declines. The slot keeps
   * its height by default so that an accepted ad does not shove the page
   * around; once we know no ad is coming, the space is given back.
   */
  function hidePlaceholders() {
    Array.prototype.forEach.call(document.querySelectorAll(".adslot"), function (slot) {
      slot.className += " is-dismissed";
    });
  }

  function buildBar(onChoice) {
    var bar = document.createElement("aside");
    bar.className = "consent";
    bar.id = "consent-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Cookie notice");

    var inner = document.createElement("div");
    inner.className = "in";

    var text = document.createElement("p");
    text.innerHTML =
      "We use cookies for third-party advertising (Adsterra) to keep these tools free. " +
      "Decline and the tools work exactly the same \u2014 you just will not see personalized ads. " +
      '<a href="/privacy-policy.html">Privacy Policy</a>';

    var row = document.createElement("div");
    row.className = "btnrow";

    var decline = document.createElement("button");
    decline.type = "button";
    decline.className = "btn ghost";
    decline.textContent = "Decline";

    var accept = document.createElement("button");
    accept.type = "button";
    accept.className = "btn";
    accept.textContent = "Accept";

    decline.addEventListener("click", function () { onChoice("decline"); });
    accept.addEventListener("click", function () { onChoice("accept"); });

    row.appendChild(decline);
    row.appendChild(accept);
    inner.appendChild(text);
    inner.appendChild(row);
    bar.appendChild(inner);
    return bar;
  }

  function start() {
    var existing = readConsent();

    if (existing === "accept") { loadAds(); return; }
    if (existing === "decline") { hidePlaceholders(); return; }

    // No decision yet: show the bar. Ads stay unloaded until Accept is clicked.
    var bar = buildBar(function (choice) {
      writeConsent(choice);
      bar.remove();
      if (choice === "accept") loadAds(); else hidePlaceholders();
    });
    document.body.appendChild(bar);
  }

  /** Lets the Privacy Policy page offer a "change your choice" link. */
  window.tpResetConsent = function () {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { }
    window.location.reload();
  };

  window.tpConsentState = readConsent;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
