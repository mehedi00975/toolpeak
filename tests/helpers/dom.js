/**
 * Shared jsdom harness for the integration tests.
 *
 * These tests load the *built* pages from dist/ and run their real inline
 * scripts, so they exercise the same code a visitor gets. Two things matter:
 *
 *  1. Nothing is asserted until DOMContentLoaded has fired — jsdom returns from
 *     its constructor before the page scripts have run, so asserting straight
 *     away sees an empty document.
 *  2. `resources` is deliberately left off. If jsdom were allowed to fetch
 *     subresources, an accepted-consent test would make real network requests
 *     to the ad network.
 */

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.join(__dirname, "..", "..");
const DIST = path.join(ROOT, "dist");

// dist/ is git-ignored, so a fresh clone has nothing to test against. Build it
// rather than skipping: a suite that silently reports success because it found
// no pages is worse than one that takes an extra second.
if (!fs.existsSync(path.join(DIST, "index.html"))) {
  execFileSync(process.execPath, ["build.js"], { cwd: ROOT, stdio: "pipe" });
}

const distExists = fs.existsSync(path.join(DIST, "index.html"));

/**
 * Loads a built page and returns the JSDOM instance once its scripts have run.
 *
 * @param {string} rel        path relative to the dist root, e.g. "tools/word-counter.html"
 * @param {object} [options]
 * @param {string} [options.consent]  preset "accept" | "decline" in localStorage
 * @param {boolean} [options.trackScripts]  record injected <script src> values
 * @param {string} [options.dist]  alternative dist root (see helpers/fixture.js)
 */
async function loadPage(rel, options = {}) {
  const root = options.dist || DIST;
  const html = fs.readFileSync(path.join(root, rel), "utf8");
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", () => {}); // suppress expected load failures

  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "https://toolpeak.com/" + rel.replace(/index\.html$/, ""),
    virtualConsole,
    beforeParse(window) {
      if (options.consent) {
        window.localStorage.setItem("tp-consent", options.consent + ":1");
      }
      if (options.trackScripts) {
        window.__injected = [];
        const append = window.Node.prototype.appendChild;
        window.Node.prototype.appendChild = function (node) {
          if (node && node.tagName === "SCRIPT" && node.src) {
            window.__injected.push(node.src);
          }
          return append.call(this, node);
        };
      }
    },
  });

  await tick(150); // let DOMContentLoaded handlers run
  return dom;
}

/** Waits `ms` milliseconds. */
const tick = ms => new Promise(resolve => setTimeout(resolve, ms));

/** Dispatches a bubbling event of `type` on `el`. */
function fire(el, type) {
  el.dispatchEvent(new el.ownerDocument.defaultView.Event(type, { bubbles: true }));
}

/** Sets an input's value and fires the matching event. */
function setValue(el, value, type = "input") {
  el.value = value;
  fire(el, type);
}

/** Clicks the first button inside `root` whose text matches `re`. */
function clickButton(root, re) {
  const button = [...root.querySelectorAll("button")].find(b => re.test(b.textContent));
  if (!button) throw new Error(`no button matching ${re}`);
  button.click();
  return button;
}

/** Every ad-network script URL either present in the DOM or injected at runtime. */
function adScripts(dom) {
  const isAd = src => /adsterra|profitab|highperformanceformat/i.test(src);
  const inDom = [...dom.window.document.querySelectorAll("script[src]")]
    .map(s => s.src)
    .filter(isAd);
  const injected = (dom.window.__injected || []).filter(isAd);
  return [...new Set([...inDom, ...injected])];
}

/** Reads the trimmed text of a selector. */
const text = (doc, sel) => doc.querySelector(sel).textContent.trim();

module.exports = {
  DIST, distExists, loadPage, tick, fire, setValue, clickButton, adScripts, text,
  skip: distExists ? false : "run `npm run build` first",
};
