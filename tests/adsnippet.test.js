/**
 * Tests for the ad snippet checker.
 *
 * A note on what is and is not verified here. The headline problem this module
 * solves is that `document.write` blanks the page when it runs after the
 * document has closed — which is always, for us, because ads wait for a
 * consent click. That behavior cannot be demonstrated in jsdom: jsdom treats a
 * late document.write as an inline insertion and leaves the page standing,
 * where a real browser performs an implicit document.open() and clears
 * everything. So these tests verify the transformation instead: that the
 * document.write call is gone, that what replaces it requests the same script,
 * and that the remaining inline JavaScript still parses and still sets
 * atOptions. The browser behavior itself is a documented platform rule, not
 * something this suite can observe.
 */

const test = require("node:test");
const assert = require("node:assert");
const vm = require("node:vm");

const ads = require("../src/lib/adsnippet.js");

/* Real shapes the Adsterra dashboard hands out. ------------------------- */

const LEGACY_BANNER = `<script type="text/javascript">
atOptions = {'key':'5f51499447a3ee41e0dd09f11ce139c7','format':'iframe','height':90,'width':728,'params':{}};
document.write('<scr' + 'ipt type="text/javascript" src="http' + (location.protocol === 'https:' ? 's' : '') + '://www.highperformanceformat.com/5f51499447a3ee41e0dd09f11ce139c7/invoke.js"></scr' + 'ipt>');
</script>`;

const MODERN_BANNER = `<script type="text/javascript">
	atOptions = {'key' : 'e3a5c97f12bd48d0aa48f9136d0b72ce','format' : 'iframe','height' : 90,'width' : 728,'params' : {}};
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/e3a5c97f12bd48d0aa48f9136d0b72ce/invoke.js"></script>`;

const POPUNDER = `<script type='text/javascript' src='//pl26717001.profitableratecpm.com/9c/1f/23/9c1f2334ab56cd78ef90.js'></script>`;

/* ------------------------------------------------------------------ *
 * document.write
 * ------------------------------------------------------------------ */

test("detects document.write in real Adsterra banner code", () => {
  const report = ads.analyze(LEGACY_BANNER, "banner");

  assert.strictEqual(report.errors.length, 0, "it is fixable, so not an error");
  assert.ok(
    report.warnings.some(w => /document\.write/.test(w)),
    "the visitor should be told why it was changed"
  );
  assert.ok(report.rewritten, "a safe replacement should be offered");
});

test("the rewrite removes the document.write call entirely", () => {
  const { rewritten } = ads.analyze(LEGACY_BANNER, "banner");
  assert.ok(!/document\s*\.\s*write/i.test(rewritten));
});

test("the rewrite keeps requesting the same script", () => {
  const { rewritten } = ads.analyze(LEGACY_BANNER, "banner");
  const sources = ads.scriptSources(rewritten);

  assert.ok(
    sources.some(s => s.endsWith(
      "//www.highperformanceformat.com/5f51499447a3ee41e0dd09f11ce139c7/invoke.js"
    )),
    "the ad would not load if the URL were lost: " + JSON.stringify(sources)
  );
});

test("the rewrite drops the protocol so the page's own is used", () => {
  // The original picks http or https at run time. A rewrite that hardcoded
  // http:// would be blocked as mixed content and the ad would never appear.
  const { rewritten } = ads.analyze(LEGACY_BANNER, "banner");
  assert.ok(!/src=["']http:/i.test(rewritten));
  assert.match(rewritten, /src="\/\//);
});

test("the inline JavaScript left behind is still valid and still sets atOptions", () => {
  // The most likely way to break this rewrite is to cut the document.write out
  // with a lazy regex, which stops at the first ")" — inside the protocol
  // ternary — and leaves a fragment that is a syntax error. Then atOptions
  // never runs, and invoke.js renders nothing.
  const { rewritten } = ads.analyze(LEGACY_BANNER, "banner");

  const inline = [...rewritten.matchAll(/<script(?![^>]*\bsrc)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(m => m[1])
    .join("\n");

  assert.doesNotThrow(() => new vm.Script(inline), "the leftover script must parse");

  const context = {
    location: { protocol: "https:" },
    document: { write() { throw new Error("document.write was still called"); } }
  };
  vm.createContext(context);
  new vm.Script(inline).runInContext(context);

  assert.strictEqual(context.atOptions.key, "5f51499447a3ee41e0dd09f11ce139c7");
  assert.strictEqual(context.atOptions.width, 728);
});

test("a document.write with no recoverable URL is reported, not mangled", () => {
  const report = ads.analyze(`<script>document.write("<b>hello</b>");</script>`, "banner");
  assert.ok(report.errors.length > 0);
  assert.strictEqual(report.rewritten, null);
});

/* ------------------------------------------------------------------ *
 * Snippets that are already fine
 * ------------------------------------------------------------------ */

test("modern two-part banner code passes cleanly", () => {
  const report = ads.analyze(MODERN_BANNER, "banner");
  assert.deepStrictEqual(report.errors, []);
  assert.deepStrictEqual(report.warnings, []);
  assert.strictEqual(report.rewritten, null);
});

test("reads the key, size and host so the panel can confirm the paste", () => {
  const report = ads.analyze(MODERN_BANNER, "banner");
  assert.ok(report.keys.includes("e3a5c97f12bd48d0aa48f9136d0b72ce"));
  assert.deepStrictEqual(report.size, { width: 728, height: 90 });
  assert.deepStrictEqual(report.hosts, ["www.highperformanceformat.com"]);
});

test("a single-script popunder passes cleanly", () => {
  const report = ads.analyze(POPUNDER, "popunder");
  assert.deepStrictEqual(report.errors, []);
  assert.deepStrictEqual(report.warnings, []);
});

test("an empty box is not an error", () => {
  const report = ads.analyze("", "banner");
  assert.ok(report.empty);
  assert.deepStrictEqual(report.errors, []);
});

/* ------------------------------------------------------------------ *
 * Wrong box
 * ------------------------------------------------------------------ */

test("banner code pasted into the popunder box is caught", () => {
  const report = ads.analyze(MODERN_BANNER, "popunder");
  assert.ok(
    report.errors.some(e => /Banner code, not Popunder/.test(e)),
    "the three units look alike; this is the easiest mistake to make"
  );
});

test("a bare script tag is not misreported as a banner", () => {
  // invoke.js appears in several formats, so it is not enough on its own to
  // call something a banner. Only atOptions is decisive.
  const report = ads.analyze(
    `<script src="//www.highperformanceformat.com/abc123def456abc1/invoke.js"></script>`,
    "popunder"
  );
  assert.ok(!report.errors.some(e => /Banner code/.test(e)));
});

test("identify distinguishes a banner from a space-free unit", () => {
  assert.strictEqual(ads.identify(MODERN_BANNER).unit, "banner");
  assert.strictEqual(ads.identify(POPUNDER).confidence, "ambiguous");
});

/* ------------------------------------------------------------------ *
 * Things that silently earn nothing
 * ------------------------------------------------------------------ */

test("http:// is rejected as mixed content", () => {
  const report = ads.analyze(
    `<script src="http://www.highperformanceformat.com/abc123abc123abc1/invoke.js"></script>`,
    "popunder"
  );
  assert.ok(report.errors.some(e => /http:\/\//.test(e)));
});

test("a pasted URL instead of a tag is explained", () => {
  const report = ads.analyze("https://adsterra.com/my-unit", "banner");
  assert.ok(report.errors.some(e => /bare URL/i.test(e)));
});

test("text with no script tag at all is rejected", () => {
  const report = ads.analyze("paste your code here", "banner");
  assert.ok(report.errors.some(e => /No <script> tag/.test(e)));
});

test("the same key in two units is caught across the whole form", () => {
  const one = `<script src="//pl1.profitableratecpm.com/abc123abc123abc1.js"></script>`;
  const report = ads.analyzeAll({ popunder: one, socialBar: one, banner: "" });

  assert.strictEqual(report.shared.length, 1);
  assert.match(report.shared[0], /same ad key/);
});

test("different keys in different units are fine", () => {
  const report = ads.analyzeAll({
    popunder: `<script src="//pl1.profitableratecpm.com/aaa111aaa111aaa1.js"></script>`,
    socialBar: `<script src="//pl1.profitableratecpm.com/bbb222bbb222bbb2.js"></script>`,
    banner: MODERN_BANNER
  });

  assert.deepStrictEqual(report.shared, []);
  assert.deepStrictEqual(report.configured, ["popunder", "socialBar", "banner"]);
  assert.strictEqual(report.errors, 0);
});

test("an oversized banner is flagged before it breaks mobile layout", () => {
  const skyscraper = `<script>atOptions={'key':'fff000fff000fff0','format':'iframe','height':600,'width':160,'params':{}};</script>
<script src="//www.topcreativeformat.com/fff000fff000fff0/invoke.js"></script>`;

  const report = ads.analyze(skyscraper, "banner");
  assert.ok(report.warnings.some(w => /overflow/.test(w)));
});

test("standard banner sizes are not flagged", () => {
  for (const [w, h] of [[728, 90], [468, 60], [320, 50], [300, 250]]) {
    const snippet = `<script>atOptions={'key':'aaa111aaa111aaa1','format':'iframe','height':${h},'width':${w},'params':{}};</script>
<script src="//www.highperformanceformat.com/aaa111aaa111aaa1/invoke.js"></script>`;
    const report = ads.analyze(snippet, "banner");
    assert.deepStrictEqual(report.warnings, [], `${w}x${h} should be accepted`);
    assert.deepStrictEqual(report.notes, [], `${w}x${h} should not be remarked on`);
  }
});

/* ------------------------------------------------------------------ *
 * ads.txt
 * ------------------------------------------------------------------ */

test("a valid ads.txt record passes", () => {
  const report = ads.analyzeAdsTxt("adsterra.com, 1234567, DIRECT");
  assert.deepStrictEqual(report.errors, []);
  assert.deepStrictEqual(report.warnings, []);
});

test("missing commas are caught", () => {
  const report = ads.analyzeAdsTxt("adsterra.com 1234567 DIRECT");
  assert.ok(report.errors.some(e => /not a valid record/.test(e)));
});

test("a relationship other than DIRECT or RESELLER is caught", () => {
  const report = ads.analyzeAdsTxt("adsterra.com, 1234567, PARTNER");
  assert.ok(report.errors.some(e => /DIRECT or RESELLER/.test(e)));
});

test("a record for another network warns that Adsterra is missing", () => {
  const report = ads.analyzeAdsTxt("google.com, pub-123456, DIRECT");
  assert.deepStrictEqual(report.errors, []);
  assert.ok(report.warnings.some(w => /No Adsterra record/.test(w)));
});

test("multiple records and comments are handled", () => {
  const report = ads.analyzeAdsTxt(
    "# my ads.txt\nadsterra.com, 1234567, DIRECT\ngoogle.com, pub-9, RESELLER"
  );
  assert.deepStrictEqual(report.errors, []);
  assert.strictEqual(report.lines.length, 2);
});

test("an empty ads.txt is reported as empty, not broken", () => {
  assert.ok(ads.analyzeAdsTxt("").empty);
  assert.ok(ads.analyzeAdsTxt("   ").empty);
});

/* ------------------------------------------------------------------ *
 * The rewrite has to survive the real pipeline
 * ------------------------------------------------------------------ */

test("a rewritten snippet survives .env encoding unchanged", () => {
  // The panel saves the rewrite to .env, so a quoting bug there would undo
  // all of this. The snippet contains quotes, newlines and backslashes.
  const envLib = require("../src/lib/env.js");
  const { rewritten } = ads.analyze(LEGACY_BANNER, "banner");

  const round = envLib.parse(envLib.stringify({ ADS_BANNER: rewritten }));
  assert.strictEqual(round.ADS_BANNER, rewritten);
});

test("a rewritten snippet is still two parts, in the order invoke.js needs", () => {
  // invoke.js reads atOptions when it executes, so the inline block must come
  // first. The injector preserves document order, so the rewrite has to too.
  const { rewritten } = ads.analyze(LEGACY_BANNER, "banner");

  const atOptionsAt = rewritten.indexOf("atOptions");
  const invokeAt = rewritten.indexOf("invoke.js");

  assert.ok(atOptionsAt !== -1 && invokeAt !== -1);
  assert.ok(atOptionsAt < invokeAt, "atOptions must execute before invoke.js");
});
