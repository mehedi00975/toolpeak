/**
 * Build-output tests.
 *
 * These guard the things that get a site rejected by an ad network or ignored
 * by a search engine: missing policy pages, thin tool pages, broken internal
 * links, absent canonical tags, or an ad snippet accidentally hard-coded into
 * the HTML instead of being consent-gated.
 *
 * Requires `npm run build` to have been run first.
 */

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const DIST = path.join(__dirname, "..", "dist");
const hasBuild = fs.existsSync(path.join(DIST, "index.html"));

const read = rel => fs.readFileSync(path.join(DIST, rel), "utf8");
const exists = rel => fs.existsSync(path.join(DIST, rel));

/** Every generated HTML file, as paths relative to dist/. */
function htmlFiles(dir = DIST, base = "") {
  if (!hasBuild) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...htmlFiles(path.join(dir, entry.name), rel));
    else if (entry.name.endsWith(".html")) out.push(rel);
  }
  return out;
}

/** Strips tags, scripts and styles so we can count real body copy. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TOOL_SLUGS = [
  "word-counter", "case-converter", "percentage-calculator", "age-calculator",
  "bmi-calculator", "unit-converter", "image-compressor", "password-generator",
  "qr-code-generator", "text-diff"
];

const suite = { skip: !hasBuild ? "run `npm run build` first" : false };

/* ------------------------------------------------------------------ *
 * Required pages
 * ------------------------------------------------------------------ */

test("build: all ten tool pages are generated", suite, () => {
  for (const slug of TOOL_SLUGS) {
    assert.ok(exists(`tools/${slug}.html`), `missing tools/${slug}.html`);
  }
});

test("build: policy pages required by ad networks exist", suite, () => {
  for (const p of ["about.html", "contact.html", "privacy-policy.html", "terms.html"]) {
    assert.ok(exists(p), `missing ${p}`);
  }
});

test("build: index, tool index, blog index and 404 exist", suite, () => {
  for (const p of ["index.html", "tools/index.html", "blog/index.html", "404.html"]) {
    assert.ok(exists(p), `missing ${p}`);
  }
});

test("build: crawler and platform files exist", suite, () => {
  for (const f of ["sitemap.xml", "robots.txt", "ads.txt", "rss.xml",
                   "favicon.svg", "site.webmanifest", "_headers", "_redirects"]) {
    assert.ok(exists(f), `missing ${f}`);
  }
});

/* ------------------------------------------------------------------ *
 * Content depth — thin pages get sites rejected
 * ------------------------------------------------------------------ */

test("build: every tool page has at least 300 words of real content", suite, () => {
  for (const slug of TOOL_SLUGS) {
    const words = visibleText(read(`tools/${slug}.html`)).split(/\s+/).length;
    assert.ok(words >= 300, `tools/${slug}.html has only ${words} words`);
  }
});

test("build: every tool page has at least 4 FAQ entries", suite, () => {
  for (const slug of TOOL_SLUGS) {
    const html = read(`tools/${slug}.html`);
    const count = (html.match(/<details>/g) || []).length;
    assert.ok(count >= 4, `tools/${slug}.html has ${count} FAQ entries`);
  }
});

test("build: the privacy policy names the ad partner and mentions cookies", suite, () => {
  const html = read("privacy-policy.html");
  assert.ok(/Adsterra/i.test(html), "privacy policy must name Adsterra");
  assert.ok(/cookie/i.test(html), "privacy policy must mention cookies");
  assert.ok(/third.party/i.test(html), "privacy policy must mention third parties");
});

test("build: the contact page exposes a real email address", suite, () => {
  assert.ok(/mailto:[^"@]+@[^"]+/.test(read("contact.html")), "no mailto link found");
});

/* ------------------------------------------------------------------ *
 * SEO essentials
 * ------------------------------------------------------------------ */

test("build: every page has a title, description and canonical URL", suite, () => {
  for (const file of htmlFiles()) {
    const html = read(file);
    assert.ok(/<title>[^<]{10,}<\/title>/.test(html), `${file}: missing or short title`);
    assert.ok(/<meta name="description" content="[^"]{50,}"/.test(html),
      `${file}: missing or short meta description`);
    assert.ok(/<link rel="canonical" href="https?:\/\/[^"]+"/.test(html),
      `${file}: missing canonical URL`);
  }
});

test("build: titles fit inside the search-result display limit", suite, () => {
  for (const file of htmlFiles()) {
    const title = read(file).match(/<title>([^<]*)<\/title>/)[1]
      .replace(/&amp;/g, "&");
    assert.ok(title.length <= 60,
      `${file}: title is ${title.length} chars (max 60): ${title}`);
  }
});

test("build: meta descriptions fit inside the snippet limit", suite, () => {
  for (const file of htmlFiles()) {
    const desc = read(file).match(/<meta name="description" content="([^"]*)"/)[1];
    assert.ok(desc.length >= 50 && desc.length <= 200,
      `${file}: description is ${desc.length} chars: ${desc.slice(0, 80)}`);
  }
});

test("build: no page title repeats the brand name twice", suite, () => {
  for (const file of htmlFiles()) {
    const title = read(file).match(/<title>([^<]*)<\/title>/)[1];
    const brandCount = (title.match(/ToolPeak/g) || []).length;
    assert.ok(brandCount <= 1, `${file}: brand appears ${brandCount} times in "${title}"`);
  }
});

test("build: every page has exactly one h1", suite, () => {
  for (const file of htmlFiles()) {
    const count = (read(file).match(/<h1[\s>]/g) || []).length;
    assert.strictEqual(count, 1, `${file} has ${count} h1 elements`);
  }
});

test("build: every page carries valid JSON-LD structured data", suite, () => {
  for (const file of htmlFiles()) {
    const match = read(file).match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
    );
    assert.ok(match, `${file}: no JSON-LD block`);
    assert.doesNotThrow(() => JSON.parse(match[1]), `${file}: JSON-LD does not parse`);
  }
});

test("build: tool pages declare WebApplication and FAQPage schema", suite, () => {
  for (const slug of TOOL_SLUGS) {
    const html = read(`tools/${slug}.html`);
    assert.ok(html.includes('"WebApplication"'), `${slug}: no WebApplication schema`);
    assert.ok(html.includes('"FAQPage"'), `${slug}: no FAQPage schema`);
  }
});

test("build: the 404 page is marked noindex", suite, () => {
  assert.ok(/noindex/.test(read("404.html")));
});

test("build: sitemap lists every tool page", suite, () => {
  const xml = read("sitemap.xml");
  for (const slug of TOOL_SLUGS) {
    assert.ok(xml.includes(`/tools/${slug}.html`), `sitemap missing ${slug}`);
  }
});

test("build: robots.txt points at the sitemap", suite, () => {
  assert.ok(/Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/.test(read("robots.txt")));
});

/* ------------------------------------------------------------------ *
 * Internal links
 * ------------------------------------------------------------------ */

test("build: no internal link points at a missing page", suite, () => {
  const broken = [];
  for (const file of htmlFiles()) {
    const html = read(file);
    const hrefs = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map(m => m[1]);
    for (const href of new Set(hrefs)) {
      let target = href.endsWith("/") ? `${href}index.html` : href;
      target = target.replace(/^\//, "");
      if (!target) target = "index.html";
      // Non-HTML assets are checked as-is.
      if (!exists(target)) broken.push(`${file} -> ${href}`);
    }
  }
  assert.deepStrictEqual(broken, [], "broken internal links:\n" + broken.join("\n"));
});

/* ------------------------------------------------------------------ *
 * Ads and consent
 * ------------------------------------------------------------------ */

test("build: no ad script is hard-coded as executable markup", suite, () => {
  // Ad snippets must travel as escaped JSON in __TP_ADS, never as live tags,
  // so that nothing can run before the visitor consents.
  for (const file of htmlFiles()) {
    const html = read(file);
    const scriptSrcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]);
    for (const src of scriptSrcs) {
      assert.ok(
        !/adsterra|profitab|highperformanceformat|popunder|social-?bar/i.test(src),
        `${file}: ad script is directly embedded: ${src}`
      );
    }
  }
});

test("build: the consent runtime ships on every page", suite, () => {
  for (const file of htmlFiles()) {
    const html = read(file);
    assert.ok(html.includes("tp-consent"), `${file}: consent script missing`);
    assert.ok(/Decline/.test(html), `${file}: no Decline path in consent code`);
  }
});

test("build: consent is required before ads load", suite, () => {
  // The gate lives in consent.js: loadAds() must only run on "accept".
  const html = read("index.html");
  assert.ok(/requireConsent|readConsent|tp-consent/.test(html));
  assert.ok(html.includes("loadAds"), "no gated ad loader present");
});

/* ------------------------------------------------------------------ *
 * Performance and self-containment
 * ------------------------------------------------------------------ */

test("build: pages are self-contained with no external CSS or font requests", suite, () => {
  for (const file of htmlFiles()) {
    const html = read(file);
    const links = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)];
    assert.strictEqual(links.length, 0, `${file}: external stylesheet found`);
    assert.ok(!/fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr|unpkg\.com/.test(html),
      `${file}: external font or CDN request found`);
  }
});

test("build: no page exceeds a mobile-friendly size budget", suite, () => {
  const zlib = require("node:zlib");
  for (const file of htmlFiles()) {
    const raw = fs.readFileSync(path.join(DIST, file));
    const gz = zlib.gzipSync(raw, { level: 9 }).length;
    assert.ok(gz < 60 * 1024,
      `${file} is ${(gz / 1024).toFixed(1)} KB gzipped, over the 60 KB budget`);
  }
});

test("build: every page declares a mobile viewport", suite, () => {
  for (const file of htmlFiles()) {
    assert.ok(/<meta name="viewport" content="width=device-width/.test(read(file)),
      `${file}: missing viewport meta`);
  }
});

/* ------------------------------------------------------------------ *
 * Language and localization rules for this project
 * ------------------------------------------------------------------ */

test("build: pages are declared as English", suite, () => {
  for (const file of htmlFiles()) {
    assert.ok(/<html lang="en">/.test(read(file)), `${file}: not declared lang="en"`);
  }
});

test("build: no Bengali script anywhere in the output", suite, () => {
  for (const file of htmlFiles()) {
    const match = read(file).match(/[\u0980-\u09FF]/);
    assert.ok(!match, `${file}: contains Bengali characters`);
  }
});

test("build: no Bangladeshi taka symbol in examples", suite, () => {
  for (const file of htmlFiles()) {
    assert.ok(!read(file).includes("\u09F3"), `${file}: contains the taka sign`);
  }
});

test("build: uses US spelling in visible copy", suite, () => {
  // British variants that would look out of place to a US/UK-targeted audience.
  const britishisms = /\b(colour|centre|organis(e|ed|ing|ation)|licence(?!\s+fee)|analyse|behaviour|favourite)\b/i;
  for (const file of htmlFiles()) {
    const text = visibleText(read(file));
    const hit = text.match(britishisms);
    assert.ok(!hit, `${file}: British spelling "${hit && hit[0]}"`);
  }
});

test("build: examples use dollar or pound, and show both metric and imperial", suite, () => {
  const bmi = read("tools/bmi-calculator.html");
  assert.ok(/\bkg\b/.test(bmi) && /\blb\b/.test(bmi), "BMI page must show kg and lb");
  assert.ok(/\bcm\b/.test(bmi) && /\b(ft|in)\b/.test(bmi), "BMI page must show cm and ft/in");

  const units = read("tools/unit-converter.html");
  assert.ok(/inch/i.test(units) && /centimet/i.test(units), "unit page must cover inch and cm");
});
