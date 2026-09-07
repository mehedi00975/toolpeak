/**
 * Adsterra integration tests, using the snippet shapes the dashboard emits.
 *
 * consent.test.js proves the gate opens and closes. This file proves that what
 * comes through the gate actually works, because Adsterra ships two different
 * shapes and only one of them is a plain external script:
 *
 *   Banner     an inline <script> that assigns a global `atOptions` object,
 *              immediately followed by an external invoke.js that reads it.
 *   Popunder   a single external <script>.
 *   Social Bar a single external <script>.
 *
 * The banner is the fragile one. Injecting HTML with innerHTML never executes
 * its scripts, so consent.js rebuilds each <script> as a real element. If that
 * rebuild ever drops inline content, or reorders the two tags, atOptions is
 * undefined when invoke.js runs and the banner silently renders nothing — the
 * kind of failure that looks like "low fill rate" for weeks.
 *
 * The URLs below are fake and never fetched: jsdom runs with subresource
 * loading disabled.
 */

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.join(__dirname, "..");

/* Snippet shapes copied from the Adsterra dashboard, with fake identifiers. */

const BANNER_SNIPPET = `<script type="text/javascript">
	atOptions = {
		'key' : 'abc123def456',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/abc123def456/invoke.js"></script>`;

const POPUNDER_SNIPPET =
  `<script type='text/javascript' src='//pl12345678.profitableratecpm.com/aa/bb/cc/aabbcc.js'></script>`;

const SOCIAL_BAR_SNIPPET =
  `<script type='text/javascript' src='//pl87654321.profitableratecpm.com/dd/ee/ff/ddeeff.js'></script>`;

const AD_URL = /profitableratecpm|highperformanceformat/;

/** Builds the site once with realistic ad snippets configured. */
let builtDir = null;
function siteWithRealAds() {
  if (builtDir) return builtDir;
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "toolpeak-realads-"));
  execFileSync(process.execPath, ["build.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      ADS_BANNER: BANNER_SNIPPET,
      ADS_POPUNDER: POPUNDER_SNIPPET,
      ADS_SOCIAL_BAR: SOCIAL_BAR_SNIPPET,
      ADS_TXT: "adsterra.com, 1234567, DIRECT",
      DIST_DIR: out,
    },
    stdio: "pipe",
  });
  builtDir = out;
  return out;
}

/** Loads a page, optionally accepting consent, and reports what got injected. */
async function loadWithAds(rel, { accept = false, settleMs = 2200 } = {}) {
  const html = fs.readFileSync(path.join(siteWithRealAds(), rel), "utf8");
  const virtualConsole = new VirtualConsole();
  const errors = [];
  virtualConsole.on("jsdomError", e => errors.push(e.message));

  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "https://toolpeak.com/" + rel,
    virtualConsole,
    beforeParse(window) {
      window.__injected = [];
      const append = window.Node.prototype.appendChild;
      window.Node.prototype.appendChild = function (node) {
        if (node && node.tagName === "SCRIPT") {
          window.__injected.push(node.src || "[inline]");
        }
        return append.call(this, node);
      };
    },
  });

  await new Promise(r => setTimeout(r, 200));

  if (accept) {
    const bar = dom.window.document.querySelector("#consent-bar");
    [...bar.querySelectorAll("button")].find(b => /Accept/.test(b.textContent)).click();
    await new Promise(r => setTimeout(r, settleMs));
  }

  return {
    dom,
    window: dom.window,
    document: dom.window.document,
    errors,
    injected: () => dom.window.__injected,
    adScripts: () => dom.window.__injected.filter(s => AD_URL.test(s)),
  };
}

/* ------------------------------------------------------------------ *
 * The banner's two-part snippet
 * ------------------------------------------------------------------ */

test("adsterra: the banner's inline atOptions script actually executes", async () => {
  const ctx = await loadWithAds("tools/word-counter.html", { accept: true });

  // If this is undefined, invoke.js has nothing to read and the banner renders
  // blank while still counting as a page with ad code on it.
  assert.strictEqual(typeof ctx.window.atOptions, "object");
  assert.ok(ctx.window.atOptions, "atOptions should not be null");
  assert.strictEqual(ctx.window.atOptions.key, "abc123def456");
  assert.strictEqual(ctx.window.atOptions.width, 728);

  ctx.dom.window.close();
});

test("adsterra: invoke.js is loaded after the options are set", async () => {
  const ctx = await loadWithAds("tools/word-counter.html", { accept: true });
  const injected = ctx.injected();

  const inlineIndex = injected.indexOf("[inline]");
  const invokeIndex = injected.findIndex(s => /invoke\.js/.test(s));

  assert.ok(inlineIndex !== -1, "the inline atOptions script was never injected");
  assert.ok(invokeIndex !== -1, "invoke.js was never injected");
  assert.ok(inlineIndex < invokeIndex,
    "atOptions must be assigned before invoke.js runs");

  ctx.dom.window.close();
});

test("adsterra: the banner lands inside the reserved in-content slot", async () => {
  const ctx = await loadWithAds("tools/word-counter.html", { accept: true });
  const slot = ctx.document.querySelector("[data-ad=banner]");

  assert.ok(slot, "the banner slot should exist once a banner is configured");
  assert.match(slot.innerHTML, /invoke\.js/,
    "the banner belongs in the reserved slot, not appended to the body");

  ctx.dom.window.close();
});

/* ------------------------------------------------------------------ *
 * The single-script formats
 * ------------------------------------------------------------------ */

test("adsterra: the popunder and social bar both load", async () => {
  const ctx = await loadWithAds("tools/word-counter.html", { accept: true });
  const ads = ctx.adScripts();

  assert.ok(ads.some(s => /pl12345678/.test(s)), "popunder missing");
  assert.ok(ads.some(s => /pl87654321/.test(s)), "social bar missing");

  ctx.dom.window.close();
});

test("adsterra: protocol-relative URLs resolve to https, never http", async () => {
  // Adsterra emits //host/path. On an https page that must resolve to https,
  // or the browser blocks it as mixed content and the ad silently never runs.
  const ctx = await loadWithAds("tools/word-counter.html", { accept: true });

  for (const src of ctx.adScripts()) {
    assert.ok(src.startsWith("https://"),
      `ad script resolved to a non-https URL: ${src}`);
  }

  ctx.dom.window.close();
});

test("adsterra: a page loads exactly three ad units, no more", async () => {
  const ctx = await loadWithAds("tools/word-counter.html", { accept: true });

  // One banner (invoke.js) + one popunder + one social bar. The inline
  // atOptions script is configuration, not a unit.
  assert.strictEqual(ctx.adScripts().length, 3,
    `expected 3 ad units, got ${ctx.adScripts().length}: ${ctx.adScripts().join(", ")}`);

  ctx.dom.window.close();
});

/* ------------------------------------------------------------------ *
 * The gate still holds with real snippets
 * ------------------------------------------------------------------ */

test("adsterra: nothing loads and atOptions stays unset before consent", async () => {
  const ctx = await loadWithAds("tools/word-counter.html", { accept: false });
  await new Promise(r => setTimeout(r, 1800));

  assert.deepStrictEqual(ctx.adScripts(), [], "ads loaded before consent");
  assert.strictEqual(ctx.window.atOptions, undefined,
    "even the banner's configuration must not run before consent");

  ctx.dom.window.close();
});

test("adsterra: declining leaves the banner slot empty and the page working", async () => {
  const ctx = await loadWithAds("tools/word-counter.html");
  const bar = ctx.document.querySelector("#consent-bar");
  [...bar.querySelectorAll("button")].find(b => /Decline/.test(b.textContent)).click();
  await new Promise(r => setTimeout(r, 1800));

  assert.deepStrictEqual(ctx.adScripts(), []);
  const slot = ctx.document.querySelector("[data-ad=banner]");
  assert.strictEqual(slot.innerHTML.trim(), "", "the slot must stay empty after Decline");

  const input = ctx.document.querySelector("#wc-input");
  input.value = "still works fine";
  input.dispatchEvent(new ctx.window.Event("input", { bubbles: true }));
  assert.strictEqual(ctx.document.querySelector("#wc-words").textContent, "3");

  ctx.dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Ad code must not damage the page
 * ------------------------------------------------------------------ */

test("adsterra: injecting ads throws no page errors", async () => {
  const ctx = await loadWithAds("tools/word-counter.html", { accept: true });
  assert.deepStrictEqual(ctx.errors, [], `page errors: ${ctx.errors.join(" | ")}`);
  ctx.dom.window.close();
});

test("adsterra: the tool still works after ads have loaded", async () => {
  const ctx = await loadWithAds("tools/word-counter.html", { accept: true });

  const input = ctx.document.querySelector("#wc-input");
  input.value = "one two three four";
  input.dispatchEvent(new ctx.window.Event("input", { bubbles: true }));

  assert.strictEqual(ctx.document.querySelector("#wc-words").textContent, "4");

  ctx.dom.window.close();
});

test("adsterra: ad scripts are async and never block rendering", async () => {
  const ctx = await loadWithAds("tools/word-counter.html", { accept: true });
  const slot = ctx.document.querySelector("[data-ad=banner]");

  for (const script of slot.querySelectorAll("script[src]")) {
    assert.ok(script.async, `${script.src} should be async`);
  }

  ctx.dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Layout stability
 * ------------------------------------------------------------------ */

test("adsterra: the banner slot reserves its height before the ad arrives", async () => {
  // A slot that is collapsed while empty and expands when the ad lands pushes
  // the page down under the reader's cursor. That is a Core Web Vitals CLS
  // penalty on exactly the mobile searches this site is built for.
  const ctx = await loadWithAds("tools/word-counter.html");
  const slot = ctx.document.querySelector("[data-ad=banner]");
  const before = ctx.window.getComputedStyle(slot);

  assert.notStrictEqual(before.display, "none",
    "the empty slot must not be collapsed while a decision is pending");
  assert.ok(parseInt(before.minHeight, 10) >= 50,
    `the slot should reserve at least 50px, got ${before.minHeight}`);

  ctx.dom.window.close();
});

test("adsterra: accepting does not change the slot's reserved height", async () => {
  const ctx = await loadWithAds("tools/word-counter.html");
  const slot = ctx.document.querySelector("[data-ad=banner]");
  const before = ctx.window.getComputedStyle(slot).minHeight;

  const bar = ctx.document.querySelector("#consent-bar");
  [...bar.querySelectorAll("button")].find(b => /Accept/.test(b.textContent)).click();
  await new Promise(r => setTimeout(r, 1900));

  const after = ctx.window.getComputedStyle(slot).minHeight;
  assert.strictEqual(after, before,
    `the slot shifted from ${before} to ${after} when the ad loaded`);

  ctx.dom.window.close();
});

test("adsterra: declining gives the reserved space back", async () => {
  const ctx = await loadWithAds("tools/word-counter.html");
  const bar = ctx.document.querySelector("#consent-bar");
  [...bar.querySelectorAll("button")].find(b => /Decline/.test(b.textContent)).click();

  const slot = ctx.document.querySelector("[data-ad=banner]");
  assert.match(slot.className, /is-dismissed/);
  assert.strictEqual(ctx.window.getComputedStyle(slot).display, "none",
    "a declined slot should not leave a blank gap in the page");

  ctx.dom.window.close();
});

/* ------------------------------------------------------------------ *
 * ads.txt
 * ------------------------------------------------------------------ */

test("adsterra: ads.txt contains the configured line verbatim", () => {
  const contents = fs.readFileSync(path.join(siteWithRealAds(), "ads.txt"), "utf8");
  const lines = contents.split("\n").filter(l => l.trim() && !l.trim().startsWith("#"));

  assert.deepStrictEqual(lines, ["adsterra.com, 1234567, DIRECT"],
    "ads.txt must contain exactly the configured line, uncommented");
});

test("adsterra: ads.txt is valid IAB format", () => {
  const contents = fs.readFileSync(path.join(siteWithRealAds(), "ads.txt"), "utf8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // domain, publisher id, relationship [, certification authority id]
    const fields = trimmed.split(",").map(f => f.trim());
    assert.ok(fields.length >= 3 && fields.length <= 4,
      `ads.txt line has ${fields.length} fields, expected 3 or 4: ${trimmed}`);
    assert.match(fields[0], /^[a-z0-9.-]+\.[a-z]{2,}$/i, `bad domain: ${fields[0]}`);
    assert.match(fields[2], /^(DIRECT|RESELLER)$/i, `bad relationship: ${fields[2]}`);
  }
});

test("adsterra: an unset ADS_TXT still returns a 200 rather than a 404", () => {
  // The crawler checking ads.txt should find a file, not a missing page.
  const distPath = path.join(ROOT, "dist", "ads.txt");
  assert.ok(fs.existsSync(distPath), "ads.txt must always be generated");
  assert.ok(fs.readFileSync(distPath, "utf8").trim().length > 0,
    "the placeholder should explain what belongs here");
});
