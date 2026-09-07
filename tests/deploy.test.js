/**
 * Deployment portability tests.
 *
 * The site has to work on Cloudflare Pages and on GitHub Pages, which differ
 * in two ways that matter:
 *
 *   1. GitHub Pages has no _redirects support, so extensionless URLs do not
 *      resolve. Every internal link must therefore include the .html
 *      extension and work without any server rewriting.
 *
 *   2. ads.txt is only honoured at the root of a domain. github.io is on the
 *      Public Suffix List, which means username.github.io counts as its own
 *      root — but only if the repository is named username.github.io. A
 *      project repository serves from a /subpath, where every absolute link
 *      breaks and ads.txt is unreachable.
 *
 * These tests guard both properties.
 */

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

if (!fs.existsSync(path.join(DIST, "index.html"))) {
  execFileSync(process.execPath, ["build.js"], { cwd: ROOT, stdio: "pipe" });
}

function htmlFiles(dir = DIST, base = "") {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...htmlFiles(path.join(dir, entry.name), rel));
    else if (entry.name.endsWith(".html")) out.push(rel);
  }
  return out;
}

const read = rel => fs.readFileSync(path.join(DIST, rel), "utf8");

/* ------------------------------------------------------------------ *
 * Works without server-side rewriting
 * ------------------------------------------------------------------ */

test("deploy: every internal page link resolves without URL rewriting", () => {
  // On GitHub Pages there is no _redirects file, so /tools/word-counter must
  // not be relied upon — only /tools/word-counter.html actually exists.
  const broken = [];

  for (const file of htmlFiles()) {
    const hrefs = [...read(file).matchAll(/href="(\/[^"#?]*)"/g)].map(m => m[1]);
    for (const href of new Set(hrefs)) {
      let target = href.replace(/^\//, "");
      if (href.endsWith("/")) target += "index.html";
      if (!target) target = "index.html";
      if (!fs.existsSync(path.join(DIST, target))) broken.push(`${file} -> ${href}`);
    }
  }

  assert.deepStrictEqual(broken, [],
    "these links need a rewrite rule to work:\n" + broken.join("\n"));
});

test("deploy: no link depends on an extensionless rewrite", () => {
  const offenders = [];

  for (const file of htmlFiles()) {
    for (const match of read(file).matchAll(/href="(\/(?:tools|blog)\/[a-z0-9-]+)"/g)) {
      offenders.push(`${file} -> ${match[1]}`);
    }
  }

  assert.deepStrictEqual(offenders, [],
    "extensionless links only work on Cloudflare:\n" + offenders.join("\n"));
});

/* ------------------------------------------------------------------ *
 * Root-relative paths, which require a root deployment
 * ------------------------------------------------------------------ */

test("deploy: ads.txt is generated at the site root", () => {
  // Ad networks and IAB crawlers only read /ads.txt at the root of the
  // registrable domain. A file in a subdirectory is invisible to them.
  assert.ok(fs.existsSync(path.join(DIST, "ads.txt")),
    "ads.txt must exist at the root of the output");
});

test("deploy: the build respects SITE_URL for canonicals and the sitemap", () => {
  // Deploying to username.github.io means every canonical URL and sitemap
  // entry has to point there, not at a hard-coded domain.
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "toolpeak-ghpages-"));
  execFileSync(process.execPath, ["build.js"], {
    cwd: ROOT,
    env: { ...process.env, SITE_URL: "https://example.github.io", DIST_DIR: out },
    stdio: "pipe",
  });

  const index = fs.readFileSync(path.join(out, "index.html"), "utf8");
  assert.match(index, /<link rel="canonical" href="https:\/\/example\.github\.io\//);

  const sitemap = fs.readFileSync(path.join(out, "sitemap.xml"), "utf8");
  assert.match(sitemap, /<loc>https:\/\/example\.github\.io\//);
  assert.ok(!sitemap.includes("toolpeak.com"),
    "the sitemap must not leak the default domain when SITE_URL is set");

  const robots = fs.readFileSync(path.join(out, "robots.txt"), "utf8");
  assert.match(robots, /Sitemap:\s*https:\/\/example\.github\.io\/sitemap\.xml/);

  fs.rmSync(out, { recursive: true, force: true });
});

test("deploy: a custom SITE_URL does not break internal links", () => {
  // Internal links stay root-relative regardless of the domain, which is what
  // makes the same build work on both hosts.
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "toolpeak-url-"));
  execFileSync(process.execPath, ["build.js"], {
    cwd: ROOT,
    env: { ...process.env, SITE_URL: "https://example.github.io", DIST_DIR: out },
    stdio: "pipe",
  });

  const index = fs.readFileSync(path.join(out, "index.html"), "utf8");
  assert.match(index, /href="\/tools\/word-counter\.html"/,
    "internal links should stay root-relative, not absolute to the domain");

  fs.rmSync(out, { recursive: true, force: true });
});

/* ------------------------------------------------------------------ *
 * The GitHub Actions workflow
 * ------------------------------------------------------------------ */

const WORKFLOW = path.join(ROOT, ".github", "workflows", "deploy.yml");
const hasWorkflow = fs.existsSync(WORKFLOW);
const workflowSuite = { skip: hasWorkflow ? false : "no deploy workflow" };

test("deploy: the workflow injects ad snippets from secrets, not source", workflowSuite, () => {
  const yaml = fs.readFileSync(WORKFLOW, "utf8");

  for (const name of ["ADS_POPUNDER", "ADS_SOCIAL_BAR", "ADS_BANNER", "ADS_TXT"]) {
    assert.ok(yaml.includes(`${name}: \${{ secrets.${name} }}`),
      `${name} should come from a repository secret`);
  }
});

test("deploy: the workflow contains no literal ad code", workflowSuite, () => {
  const yaml = fs.readFileSync(WORKFLOW, "utf8");
  assert.ok(!/highperformanceformat\.com|profitableratecpm|<script/i.test(yaml),
    "the workflow must not embed ad snippets directly");
});

test("deploy: the workflow tests before it publishes", workflowSuite, () => {
  const yaml = fs.readFileSync(WORKFLOW, "utf8");
  const testAt = yaml.indexOf("npm test");
  const buildAt = yaml.indexOf("npm run build");
  const deployAt = yaml.indexOf("deploy-pages");

  assert.ok(testAt !== -1, "the workflow should run the test suite");
  assert.ok(testAt < buildAt, "tests should run before the build");
  assert.ok(buildAt < deployAt, "the build should happen before deployment");
});

test("deploy: the workflow disables Jekyll", workflowSuite, () => {
  // Without .nojekyll, GitHub Pages hides every file starting with an
  // underscore and runs an unnecessary build step.
  assert.match(fs.readFileSync(WORKFLOW, "utf8"), /\.nojekyll/);
});
