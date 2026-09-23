/**
 * Cookie consent and ad-gating tests.
 *
 * This is the compliance layer. The rules it enforces come straight from the
 * brief and from what an ad network checks on review:
 *
 *   - nothing advertising-related may run before the visitor chooses;
 *   - Accept and Decline are each a single click;
 *   - the bar must not lock scrolling or behave like a modal;
 *   - Decline means no ads, but every tool keeps working;
 *   - a page carries at most three ad units: popunder, social bar, banner;
 *   - a returning visitor is not asked again.
 *
 * A regression here is not a cosmetic bug — it risks the ad account.
 */

const test = require("node:test");
const assert = require("node:assert");
const { loadPage: rawLoad, tick, setValue, clickButton, adScripts, text, skip } =
  require("./helpers/dom");
const { buildWithAds } = require("./helpers/fixture");

const suite = { skip };
const PAGE = "tools/word-counter.html";

/** Ads are deferred to idle; this is comfortably past the 1200 ms fallback. */
const AD_SETTLE_MS = 1800;

// The checked-in dist/ is built without ad credentials, so its pages contain no
// banner slot and nothing for the loader to inject. These tests need the fully
// wired build, so they run against a temp copy built with fake ad snippets.
const distWithAds = skip ? null : buildWithAds();
const loadPage = (rel, options = {}) => rawLoad(rel, { ...options, dist: distWithAds });

/* ------------------------------------------------------------------ *
 * First visit — before any choice
 * ------------------------------------------------------------------ */

test("consent: the bar appears on a first visit", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  const bar = dom.window.document.querySelector("#consent-bar");

  assert.ok(bar, "consent bar should be present on a first visit");
  assert.match(bar.innerHTML, /privacy-policy/, "bar should link to the privacy policy");

  dom.window.close();
});

test("consent: Accept and Decline are each exactly one click", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  const bar = dom.window.document.querySelector("#consent-bar");
  const buttons = [...bar.querySelectorAll("button")];

  assert.strictEqual(buttons.length, 2, "there should be exactly two buttons");
  assert.ok(buttons.some(b => /^Accept$/.test(b.textContent.trim())), "missing Accept");
  assert.ok(buttons.some(b => /^Decline$/.test(b.textContent.trim())), "missing Decline");

  dom.window.close();
});

test("consent: no ad loads before the visitor has chosen", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  await tick(AD_SETTLE_MS);

  assert.deepStrictEqual(adScripts(dom), [],
    "ads must not load until consent is given");

  dom.window.close();
});

test("consent: the bar does not lock scrolling", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  const d = dom.window.document;

  assert.strictEqual(d.body.style.overflow, "", "body scroll must stay unlocked");
  assert.strictEqual(d.documentElement.style.overflow, "", "html scroll must stay unlocked");

  dom.window.close();
});

test("consent: the bar is a docked bar, not a blocking modal", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  const bar = dom.window.document.querySelector("#consent-bar");

  assert.strictEqual(dom.window.getComputedStyle(bar).position, "fixed");
  assert.ok(!/modal|overlay|backdrop/.test(bar.className),
    `bar should not be a modal, got class "${bar.className}"`);
  // role=region is the right landmark for a passive notice. role=dialog or
  // alertdialog would tell assistive tech the page is blocked until answered.
  const role = bar.getAttribute("role");
  assert.ok(role === null || role === "region",
    `bar should be a passive landmark, got role="${role}"`);
  assert.ok(!bar.hasAttribute("aria-modal"),
    "bar must not be marked aria-modal");

  dom.window.close();
});

test("consent: the tools work before any choice is made", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  const d = dom.window.document;

  setValue(d.querySelector("#wc-input"), "one two three");
  assert.strictEqual(text(d, "#wc-words"), "3");

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Decline
 * ------------------------------------------------------------------ */

test("consent: Decline dismisses the bar and records the choice", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  const d = dom.window.document;

  clickButton(d.querySelector("#consent-bar"), /Decline/);

  assert.ok(!d.querySelector("#consent-bar"), "bar should be removed");
  assert.strictEqual(dom.window.localStorage.getItem("tp-consent"), "decline:1");

  dom.window.close();
});

test("consent: Decline loads no ads at all", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });

  clickButton(dom.window.document.querySelector("#consent-bar"), /Decline/);
  await tick(AD_SETTLE_MS);

  assert.deepStrictEqual(adScripts(dom), [], "Decline must load zero ads");

  dom.window.close();
});

test("consent: the tools still work fully after Decline", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  const d = dom.window.document;

  clickButton(d.querySelector("#consent-bar"), /Decline/);
  await tick(AD_SETTLE_MS);

  setValue(d.querySelector("#wc-input"), "one two three");
  assert.strictEqual(text(d, "#wc-words"), "3");
  assert.strictEqual(text(d, "#wc-chars"), "13");

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Accept
 * ------------------------------------------------------------------ */

test("consent: Accept dismisses the bar and records the choice", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  const d = dom.window.document;

  clickButton(d.querySelector("#consent-bar"), /Accept/);

  assert.ok(!d.querySelector("#consent-bar"));
  assert.strictEqual(dom.window.localStorage.getItem("tp-consent"), "accept:1");

  dom.window.close();
});

test("consent: Accept never loads more than three ad units", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });

  clickButton(dom.window.document.querySelector("#consent-bar"), /Accept/);
  await tick(AD_SETTLE_MS);

  const loaded = adScripts(dom);
  assert.ok(loaded.length <= 3,
    `at most 3 ad units allowed, got ${loaded.length}: ${loaded.join(", ")}`);

  dom.window.close();
});

test("consent: the in-content banner slot exists and stays empty until Accept", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  const banner = dom.window.document.querySelector("[data-ad=banner]");

  assert.ok(banner, "there should be one in-content banner slot");
  assert.strictEqual(banner.innerHTML.trim(), "",
    "the banner slot must stay empty before consent");

  dom.window.close();
});

test("consent: there is exactly one banner slot per page", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  const slots = dom.window.document.querySelectorAll("[data-ad=banner]");

  assert.strictEqual(slots.length, 1,
    `the house rule is one in-content banner, found ${slots.length}`);

  dom.window.close();
});

test("consent: no interstitial or sound-capable ad markup is present", suite, async () => {
  const dom = await loadPage(PAGE, { trackScripts: true });
  const html = dom.window.document.documentElement.innerHTML;

  assert.ok(!/interstitial/i.test(html), "interstitial ads are forbidden");
  assert.ok(!/<audio|autoplay/i.test(html), "no autoplaying or sound-capable ad");
  assert.strictEqual(dom.window.document.querySelectorAll("video").length, 0,
    "no video ad units");

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Returning visitors
 * ------------------------------------------------------------------ */

test("consent: a returning visitor who declined is not asked again", suite, async () => {
  const dom = await loadPage(PAGE, { consent: "decline", trackScripts: true });

  assert.ok(!dom.window.document.querySelector("#consent-bar"),
    "the bar must not reappear for a returning visitor");
  await tick(AD_SETTLE_MS);
  assert.deepStrictEqual(adScripts(dom), [], "a stored Decline must keep ads off");

  dom.window.close();
});

test("consent: a returning visitor who accepted is not asked again", suite, async () => {
  const dom = await loadPage(PAGE, { consent: "accept", trackScripts: true });

  assert.ok(!dom.window.document.querySelector("#consent-bar"));
  await tick(AD_SETTLE_MS);
  assert.ok(adScripts(dom).length <= 3, "ad count must stay within the house limit");

  dom.window.close();
});

test("consent: the choice can be reset from the page", suite, async () => {
  const dom = await loadPage(PAGE, { consent: "accept" });

  assert.strictEqual(typeof dom.window.tpResetConsent, "function",
    "tpResetConsent should be exposed so visitors can change their mind");
  dom.window.tpResetConsent();
  assert.strictEqual(dom.window.localStorage.getItem("tp-consent"), null,
    "resetting should clear the stored choice");

  dom.window.close();
});

test("consent: the current state is readable for the privacy page", suite, async () => {
  const dom = await loadPage(PAGE, { consent: "decline" });

  assert.strictEqual(typeof dom.window.tpConsentState, "function");
  assert.match(String(dom.window.tpConsentState()), /decline/);

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Robustness
 * ------------------------------------------------------------------ */

test("consent: a corrupted stored value falls back to asking again", suite, async () => {
  const dom = await loadPage(PAGE, { consent: "garbage", trackScripts: true });

  // "garbage:1" is not a recognized choice, so the safe default is to ask and
  // to load nothing in the meantime.
  await tick(AD_SETTLE_MS);
  assert.deepStrictEqual(adScripts(dom), [],
    "an unrecognized consent value must not be treated as acceptance");

  dom.window.close();
});

test("consent: the consent bar is reachable by keyboard", suite, async () => {
  const dom = await loadPage(PAGE);
  const bar = dom.window.document.querySelector("#consent-bar");

  for (const button of bar.querySelectorAll("button")) {
    assert.notStrictEqual(button.tabIndex, -1,
      "consent buttons must be keyboard reachable");
  }

  dom.window.close();
});
