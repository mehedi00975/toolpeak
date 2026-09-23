/**
 * Configuration and documentation tests.
 *
 * Deployment fails in boring ways: an environment variable documented under
 * one name and read under another, a secret accidentally committed, an
 * npm script referenced in the README that does not exist. These are cheap
 * to check and expensive to debug at 2am against a live domain.
 */

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = rel => fs.existsSync(path.join(ROOT, rel));

/** Every NAME= key documented in .env.example. */
function documentedVars() {
  return [...read(".env.example").matchAll(/^([A-Z_][A-Z0-9_]*)=/gm)].map(m => m[1]);
}

/** Every variable site.config.js actually reads. */
function consumedVars() {
  return [...read("site.config.js").matchAll(/read\(\s*"([A-Z_][A-Z0-9_]*)"/g)].map(m => m[1]);
}

/* ------------------------------------------------------------------ *
 * Environment variables
 * ------------------------------------------------------------------ */

test("config: every documented variable is actually read by the build", () => {
  const consumed = new Set(consumedVars());
  const orphans = documentedVars().filter(v => !consumed.has(v));

  assert.deepStrictEqual(orphans, [],
    `.env.example documents variables nothing reads: ${orphans.join(", ")}`);
});

test("config: every variable the build reads is documented", () => {
  const documented = new Set(documentedVars());
  const undocumented = consumedVars().filter(v => !documented.has(v));

  assert.deepStrictEqual(undocumented, [],
    `site.config.js reads undocumented variables: ${undocumented.join(", ")}`);
});

test("config: .env.example carries no real secrets", () => {
  // Every ad and token value must ship empty. A populated one means someone
  // pasted a live snippet into a committed file.
  const secrets = ["ADS_POPUNDER", "ADS_SOCIAL_BAR", "ADS_BANNER", "ADS_TXT",
                   "CF_BEACON_TOKEN"];
  for (const name of secrets) {
    const match = read(".env.example").match(new RegExp(`^${name}=(.*)$`, "m"));
    assert.ok(match, `${name} should be listed in .env.example`);
    assert.strictEqual(match[1].trim(), "",
      `${name} must ship empty — a real value would leak into the repository`);
  }
});

test("config: ad snippets are never hard-coded in tracked source", () => {
  // What leaks an account is a real ad tag: a serving URL carrying a publisher
  // key, or an atOptions block with one. A bare hostname is not that — the
  // snippet checker in src/lib/adsnippet.js has to name these domains in order
  // to recognize them, and a rule that banned the word would ban the defense
  // along with the problem.
  const suspicious = new RegExp(
    [
      // A serving URL with a key in it.
      "//[a-z0-9.-]*(highperformanceformat|profitableratecpm|topcreativeformat|" +
        "effectivecreativeformat|profitabledisplay\\w*)\\.com/[a-f0-9]{12,}",
      // An atOptions block with a key that is not an obvious placeholder.
      "atOptions[\\s\\S]{0,80}['\"]key['\"]\\s*:\\s*['\"][a-f0-9]{16,}"
    ].join("|"),
    "i"
  );
  const roots = ["site.config.js", "build.js", "src"];

  const walk = rel => {
    const full = path.join(ROOT, rel);
    if (fs.statSync(full).isDirectory()) {
      return fs.readdirSync(full).flatMap(child => walk(path.join(rel, child)));
    }
    return /\.(js|css|html|txt)$/.test(rel) ? [rel] : [];
  };

  for (const file of roots.flatMap(walk)) {
    assert.ok(!suspicious.test(read(file)),
      `${file} appears to contain a live ad snippet; it belongs in an env var`);
  }
});

test("config: .gitignore keeps .env and build output out of the repository", () => {
  const ignored = read(".gitignore");
  for (const entry of [".env", "node_modules", "dist"]) {
    assert.ok(new RegExp(`^/?${entry.replace(".", "\\.")}/?$`, "m").test(ignored),
      `.gitignore should list ${entry}`);
  }
});

/* ------------------------------------------------------------------ *
 * Consent cannot be disabled by configuration
 * ------------------------------------------------------------------ */

test("config: consent stays required", () => {
  // This one is not a preference. Flipping it would serve ads to UK and EU
  // visitors before they agree.
  const site = require("../site.config.js");
  assert.strictEqual(site.ads.requireConsent, true,
    "ads.requireConsent must stay true");
});

test("config: the house ad limit has exactly three slots", () => {
  const site = require("../site.config.js");
  const adKeys = Object.keys(site.ads).filter(k => /^(banner|popunder|socialBar)$/.test(k));
  assert.strictEqual(adKeys.length, 3,
    "there should be exactly three ad slots: banner, popunder, socialBar");
});

/* ------------------------------------------------------------------ *
 * Scripts and documentation
 * ------------------------------------------------------------------ */

test("config: package.json declares the expected scripts", () => {
  const pkg = JSON.parse(read("package.json"));
  for (const script of ["build", "dev", "serve", "test", "check", "new-post"]) {
    assert.ok(pkg.scripts[script], `missing npm script: ${script}`);
  }
});

test("config: the shipped site has no runtime dependencies", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.deepStrictEqual(pkg.dependencies || {}, {},
    "the site must stay dependency-free; test tools belong in devDependencies");
});

test("config: every npm script referenced in the README exists", { skip: !exists("README.md") }, () => {
  const pkg = JSON.parse(read("package.json"));
  const referenced = [...read("README.md").matchAll(/npm run ([a-z-]+)/g)].map(m => m[1]);

  for (const script of new Set(referenced)) {
    assert.ok(pkg.scripts[script], `README references a missing script: npm run ${script}`);
  }
});

test("config: the integration suites cannot silently skip themselves", () => {
  // Every integration suite builds dist/ on demand. If one ever reverts to
  // skipping when dist/ is absent, a wiped build directory would turn the
  // whole suite green while testing nothing.
  const { distExists } = require("./helpers/dom");
  assert.strictEqual(distExists, true,
    "helpers/dom.js should have built dist/ rather than leaving it missing");
});

test("config: the post scaffolder exists and is runnable", () => {
  assert.ok(exists("scripts/new-post.js"), "scripts/new-post.js is missing");
  assert.doesNotThrow(() => {
    require("node:child_process").execFileSync(
      process.execPath, ["scripts/new-post.js", "--help"], { cwd: ROOT, stdio: "pipe" }
    );
  }, "new-post.js --help should exit cleanly");
});
