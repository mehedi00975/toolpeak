#!/usr/bin/env node
/**
 * build.js — turns src/ into a static dist/ folder for Cloudflare Pages.
 *
 * Design goals:
 *   - zero dependencies (npm install is never required to deploy)
 *   - one HTML file per page with CSS and JS inlined, so a page is one request
 *   - the same tool logic shared by every page and by the Node test suite
 *
 * Run: npm run build
 */

"use strict";

const fs = require("fs");
const path = require("path");

const site = require("./site.config.js");
const T = require("./src/templates.js");
const { page, esc, stripTags, adSlot, breadcrumbLd, faqLd, TOOLS } = T;

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
// DIST_DIR lets the test suite build a throwaway copy of the site (for example
// one with ad snippets configured) without touching the real dist/ folder.
const DIST = process.env.DIST_DIR
  ? path.resolve(ROOT, process.env.DIST_DIR)
  : path.join(ROOT, "dist");

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

function read(...parts) {
  return fs.readFileSync(path.join(...parts), "utf8");
}

function write(relPath, contents) {
  const full = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
  return Buffer.byteLength(contents);
}

/**
 * Whitespace-only CSS minifier. Deliberately conservative: it only removes
 * comments and collapses runs of whitespace, so it cannot corrupt a value.
 */
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

/**
 * Very conservative JS minifier: strips full-line comments and leading indent
 * only. It never touches string contents, regex literals or line structure, so
 * it cannot break the code. Real savings come from gzip, which Cloudflare does.
 */
function minifyJs(js) {
  return js
    .split("\n")
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//")) return "";
      return trimmed;
    })
    .filter(Boolean)
    .join("\n")
    // Block comments are safe to remove because none of our source uses
    // a `/*` sequence inside a string or regex literal.
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return `${d} ${months[m - 1]} ${y}`;
}

/* ------------------------------------------------------------------ *
 * Assets
 * ------------------------------------------------------------------ */

const CSS = minifyCss(read(SRC, "styles.css"));

const JS_CORE = read(SRC, "lib", "tools-core.js");
const JS_QR = read(SRC, "lib", "qr.js");
const JS_DIFF = read(SRC, "lib", "diff.js");
const JS_APP = read(SRC, "app.js");
const JS_CONSENT = read(SRC, "consent.js");

/**
 * Only ship the libraries a page actually needs. The QR encoder is 9 KB and
 * the diff engine 5 KB; there is no reason for the BMI page to carry them.
 */
function bundleFor(slug) {
  const parts = [JS_CORE];
  if (slug === "qr-code-generator") parts.push(JS_QR);
  if (slug === "text-diff") parts.push(JS_DIFF);
  parts.push(JS_APP, JS_CONSENT);
  return minifyJs(parts.join("\n;\n"));
}

// Pages with no tool still need consent handling and the mobile nav.
const JS_BASE = minifyJs([JS_APP, JS_CONSENT].join("\n;\n"));

/* ------------------------------------------------------------------ *
 * Content loading
 * ------------------------------------------------------------------ */

function loadTools() {
  const dir = path.join(SRC, "pages", "tools");
  // Keep the order defined in templates.js rather than alphabetical on disk.
  return TOOLS.map(meta => {
    const mod = require(path.join(dir, meta.slug + ".js"));
    return Object.assign({}, meta, mod);
  });
}

function loadPosts() {
  const dir = path.join(SRC, "content", "blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".js"))
    .map(f => require(path.join(dir, f)))
    .filter(p => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ------------------------------------------------------------------ *
 * Shared page fragments
 * ------------------------------------------------------------------ */

function faqHtml(faqs) {
  return `<h2>Frequently asked questions</h2>
${faqs.map(f => `<details>
  <summary>${esc(f.q)}</summary>
  <div class="body">${f.a}</div>
</details>`).join("\n")}`;
}

function relatedHtml(slugs, allTools) {
  const links = slugs
    .map(s => allTools.find(t => t.slug === s))
    .filter(Boolean)
    .map(t => `<a href="/tools/${t.slug}.html">${esc(t.name)}</a>`);
  if (!links.length) return "";
  return `<h2>Related tools</h2><div class="related">${links.join("")}</div>`;
}

function breadcrumbHtml(trail) {
  const parts = trail.map((item, i) =>
    i === trail.length - 1
      ? `<span aria-current="page">${esc(item.name)}</span>`
      : `<a href="${item.href}">${esc(item.name)}</a>`
  );
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${parts.join(" &rsaquo; ")}</nav>`;
}

/* ------------------------------------------------------------------ *
 * Builders
 * ------------------------------------------------------------------ */

function buildHome(tools, posts) {
  const tiles = tools.map(t => `<a class="tile" href="/tools/${t.slug}.html">
  <span class="tile-ico" aria-hidden="true">${t.icon}</span>
  <b>${esc(t.name)}</b>
  <span>${esc(t.blurb)}</span>
</a>`).join("\n");

  const recent = posts.slice(0, 4).map(p => `<article class="post-item">
  <h3><a href="/blog/${p.slug}.html">${esc(p.title)}</a></h3>
  <p>${esc(p.description)}</p>
  <p class="post-meta">${formatDate(p.date)} &middot; ${p.readingTime || 5} min read</p>
</article>`).join("\n");

  const body = `
<section>
  <h1>Free online tools that run in your browser</h1>
  <p class="lede lede-lg">Ten everyday utilities that work instantly, without an account and without uploading anything. Your text, photos and passwords never leave your device.</p>
  <div class="grid">
${tiles}
  </div>
</section>

${adSlot()}

<section class="card">
  <h2>Why these tools are different</h2>
  <div class="fields fields-2" style="margin-top:1rem">
    <div>
      <h3 style="margin-top:0">Nothing is uploaded</h3>
      <p class="muted">Every calculation happens in your browser. Compress a passport scan or compare a confidential contract without it touching a server &mdash; because there is no server to touch.</p>
    </div>
    <div>
      <h3 style="margin-top:0">Instant results</h3>
      <p class="muted">No round trip means no spinner. Numbers update as you type, and each page is a single self-contained file that loads in under a second on mobile data.</p>
    </div>
    <div>
      <h3 style="margin-top:0">No account, ever</h3>
      <p class="muted">No sign-up, no email wall, no free tier with a hidden limit, no watermark on your output. Open the page, use the tool, close the tab.</p>
    </div>
    <div>
      <h3 style="margin-top:0">Works offline</h3>
      <p class="muted">Once a page has loaded you can disconnect completely and keep working. It is the simplest possible proof that your data is staying put.</p>
    </div>
  </div>
</section>

${posts.length ? `<section>
  <h2>Guides &amp; explainers</h2>
  <div class="post-list">
${recent}
  </div>
  <p style="margin-top:1rem"><a href="/blog/">Read all guides &rarr;</a></p>
</section>` : ""}`;

  return page({
    title: `${site.name} — ${site.tagline}`,
    description:
      "Ten free tools that run entirely in your browser: word counter, case converter, percentage and BMI calculators, unit converter, image compressor, password and QR generators, and text compare.",
    path: "/",
    keywords: "free online tools, browser tools, word counter, image compressor, unit converter, qr code generator, password generator",
    body,
    css: CSS,
    js: JS_BASE,
    structuredData: [{
      "@type": "ItemList",
      name: "Free online tools",
      itemListElement: tools.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        url: `${site.url}/tools/${t.slug}.html`
      }))
    }]
  });
}

function buildToolPage(tool, allTools) {
  const trail = [
    { name: "Home", href: "/" },
    { name: "Tools", href: "/tools/" },
    { name: tool.name, href: `/tools/${tool.slug}.html` }
  ];

  const body = `
${breadcrumbHtml(trail)}
<h1>${esc(tool.h1)}</h1>
${tool.intro}
${tool.tool}
${adSlot()}
<section class="prose">
${tool.content}
</section>
<section>
${faqHtml(tool.faqs)}
</section>
${relatedHtml(tool.related, allTools)}`;

  return page({
    title: tool.title,
    description: tool.description,
    path: `/tools/${tool.slug}.html`,
    keywords: tool.keywords,
    body,
    css: CSS,
    js: bundleFor(tool.slug),
    structuredData: [
      {
        "@type": "WebApplication",
        name: tool.name,
        url: `${site.url}/tools/${tool.slug}.html`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: tool.description
      },
      breadcrumbLd(trail),
      faqLd(tool.faqs)
    ]
  });
}

function buildToolsIndex(tools) {
  const trail = [
    { name: "Home", href: "/" },
    { name: "Tools", href: "/tools/" }
  ];

  const tiles = tools.map(t => `<a class="tile" href="/tools/${t.slug}.html">
  <span class="tile-ico" aria-hidden="true">${t.icon}</span>
  <b>${esc(t.name)}</b>
  <span>${esc(t.blurb)}</span>
</a>`).join("\n");

  const body = `
${breadcrumbHtml(trail)}
<h1>All tools</h1>
<p class="lede">Every tool on ${esc(site.name)}. All free, all browser-based, none of them requiring an account.</p>
<div class="grid">
${tiles}
</div>
${adSlot()}`;

  return page({
    title: "All Tools",
    description: `Every free tool on ${site.name}: word counter, case converter, percentage and age calculators, BMI, unit converter, image compressor, password and QR generators, text compare.`,
    path: "/tools/",
    body,
    css: CSS,
    js: JS_BASE,
    structuredData: [breadcrumbLd(trail)]
  });
}

function buildPost(post, tools) {
  const trail = [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/blog/" },
    { name: post.title, href: `/blog/${post.slug}.html` }
  ];

  const body = `
${breadcrumbHtml(trail)}
<article>
  <h1>${esc(post.title)}</h1>
  <p class="post-meta">Published ${formatDate(post.date)}${post.updated ? ` &middot; updated ${formatDate(post.updated)}` : ""} &middot; ${post.readingTime || 5} min read</p>
  <p class="lede">${esc(post.description)}</p>
  ${adSlot()}
  <div class="prose">
${post.body}
  </div>
  ${post.faqs && post.faqs.length ? `<section>${faqHtml(post.faqs)}</section>` : ""}
  ${post.related ? relatedHtml(post.related, tools) : ""}
</article>`;

  const sd = [
    {
      "@type": "Article",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      author: { "@type": "Organization", name: site.name, url: site.url + "/" },
      publisher: { "@id": site.url + "/#org" },
      mainEntityOfPage: `${site.url}/blog/${post.slug}.html`
    },
    breadcrumbLd(trail)
  ];
  if (post.faqs && post.faqs.length) sd.push(faqLd(post.faqs));

  return page({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}.html`,
    keywords: post.keywords || "",
    body,
    css: CSS,
    js: JS_BASE,
    ogType: "article",
    published: post.date,
    modified: post.updated || post.date,
    structuredData: sd
  });
}

function buildBlogIndex(posts) {
  const trail = [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/blog/" }
  ];

  const items = posts.map(p => `<article class="post-item">
  <h3><a href="/blog/${p.slug}.html">${esc(p.title)}</a></h3>
  <p>${esc(p.description)}</p>
  <p class="post-meta">${formatDate(p.date)} &middot; ${p.readingTime || 5} min read</p>
</article>`).join("\n");

  const body = `
${breadcrumbHtml(trail)}
<h1>Guides &amp; explainers</h1>
<p class="lede">Practical answers to the questions people actually search for, written to be useful rather than long.</p>
${posts.length ? `<div class="post-list">${items}</div>` : "<p>New guides are on the way.</p>"}
${adSlot()}`;

  return page({
    title: "Guides & Explainers",
    description: `Practical guides from ${site.name}: image sizes, word counts, unit conversions, password security and more. Straight answers, no filler.`,
    path: "/blog/",
    body,
    css: CSS,
    js: JS_BASE,
    structuredData: [breadcrumbLd(trail)]
  });
}

function buildLegalPage(def) {
  const trail = [
    { name: "Home", href: "/" },
    { name: def.h1, href: `/${def.slug}.html` }
  ];

  const body = `
${breadcrumbHtml(trail)}
<h1>${esc(def.h1)}</h1>
<div class="prose">
${def.body}
</div>`;

  return page({
    title: def.title,
    description: def.description,
    path: `/${def.slug}.html`,
    body,
    css: CSS,
    js: JS_BASE,
    structuredData: [breadcrumbLd(trail)]
  });
}

function build404() {
  const body = `
<div class="card center" style="padding:3rem 1.5rem">
  <h1>Page not found</h1>
  <p class="lede" style="margin-inline:auto">That page does not exist &mdash; it may have been moved or the link may be mistyped.</p>
  <div class="btnrow" style="justify-content:center">
    <a class="btn" href="/">Go to the home page</a>
    <a class="btn ghost" href="/tools/">Browse all tools</a>
  </div>
</div>`;

  return page({
    title: "Page not found",
    description:
      "That page could not be found on " + site.name +
      ". Browse the full set of free browser-based tools, or head back to the home page.",
    path: "/404.html",
    body,
    css: CSS,
    js: JS_BASE,
    noindex: true
  });
}

/* ------------------------------------------------------------------ *
 * Non-HTML output
 * ------------------------------------------------------------------ */

function buildSitemap(urls) {
  const entries = urls.map(u => `  <url>
    <loc>${site.url}${u.path}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function buildRobots() {
  return `User-agent: *
Allow: /

# No crawl-delay: every page is a single small static file.
Sitemap: ${site.url}/sitemap.xml
`;
}

function buildRss(posts) {
  const items = posts.slice(0, 20).map(p => `    <item>
      <title>${esc(p.title)}</title>
      <link>${site.url}/blog/${p.slug}.html</link>
      <guid isPermaLink="true">${site.url}/blog/${p.slug}.html</guid>
      <pubDate>${new Date(p.date + "T12:00:00Z").toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(site.name)} — Guides</title>
    <link>${site.url}/blog/</link>
    <description>${esc(site.tagline)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

function buildManifest() {
  return JSON.stringify({
    name: site.name,
    short_name: site.name,
    description: site.tagline,
    start_url: "/",
    display: "browser",
    background_color: "#f8fafc",
    theme_color: site.themeColor,
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  }, null, 2);
}

function buildFavicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#1d4ed8"/>
  <path d="M8 20.5 13 25.5 24 8.5" fill="none" stroke="#fff" stroke-width="3.2"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
}

/**
 * ads.txt is served verbatim from the ADS_TXT environment variable. Adsterra
 * gives you the exact line; putting it in an env var keeps the publisher ID
 * out of the public repository.
 */
function buildAdsTxt() {
  if (site.ads.adsTxt) return site.ads.adsTxt.replace(/\\n/g, "\n").trim() + "\n";
  return `# ads.txt — add your Adsterra line here.
#
# Set the ADS_TXT environment variable in Cloudflare Pages
# (Settings -> Environment variables) to the exact line Adsterra gives you.
# It looks like:
#
#   adsterra.com, 1234567, DIRECT
#
# Until then this file is a placeholder so the URL returns 200 rather than 404.
`;
}

/** Cloudflare Pages headers file: caching plus sane security defaults. */
function buildHeaders() {
  return `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), interest-cohort=()

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/favicon.svg
  Cache-Control: public, max-age=604800

/apple-touch-icon.png
  Cache-Control: public, max-age=604800

/ads.txt
  Cache-Control: public, max-age=3600
  Content-Type: text/plain; charset=utf-8
`;
}

/** Pretty URLs: /tools/word-counter also serves the .html file. */
function buildRedirects(tools) {
  const lines = [
    "# Extensionless URLs -> the generated .html files",
    ...tools.map(t => `/tools/${t.slug}  /tools/${t.slug}.html  200`),
    "/about        /about.html         200",
    "/contact      /contact.html       200",
    "/privacy      /privacy-policy.html 301",
    "/privacy-policy /privacy-policy.html 200",
    "/terms        /terms.html         200"
  ];
  return lines.join("\n") + "\n";
}

/**
 * A 1x1 blue PNG stand-in for apple-touch-icon so the link never 404s.
 * Replace dist-time by dropping a real 180x180 PNG into src/static/.
 */
function fallbackTouchIcon() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64"
  );
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

function main() {
  const started = Date.now();

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const tools = loadTools();
  const posts = loadPosts();
  const legal = require("./src/pages/legal.js");
  const today = new Date().toISOString().slice(0, 10);

  let files = 0;
  let bytes = 0;
  const record = (p, c) => { bytes += write(p, c); files++; };

  // Pages
  record("index.html", buildHome(tools, posts));
  record("tools/index.html", buildToolsIndex(tools));
  tools.forEach(t => record(`tools/${t.slug}.html`, buildToolPage(t, tools)));
  record("blog/index.html", buildBlogIndex(posts));
  posts.forEach(p => record(`blog/${p.slug}.html`, buildPost(p, tools)));
  legal.forEach(l => record(`${l.slug}.html`, buildLegalPage(l)));
  record("404.html", build404());

  // Sitemap
  const urls = [
    { path: "/", lastmod: today, changefreq: "weekly", priority: "1.0" },
    { path: "/tools/", lastmod: today, changefreq: "weekly", priority: "0.9" },
    ...tools.map(t => ({
      path: `/tools/${t.slug}.html`, lastmod: today, changefreq: "monthly", priority: "0.9"
    })),
    { path: "/blog/", lastmod: today, changefreq: "weekly", priority: "0.7" },
    ...posts.map(p => ({
      path: `/blog/${p.slug}.html`,
      lastmod: p.updated || p.date,
      changefreq: "monthly",
      priority: "0.7"
    })),
    ...legal.map(l => ({
      path: `/${l.slug}.html`, lastmod: today, changefreq: "yearly", priority: "0.4"
    }))
  ];

  record("sitemap.xml", buildSitemap(urls));
  record("robots.txt", buildRobots());
  record("rss.xml", buildRss(posts));
  record("site.webmanifest", buildManifest());
  record("favicon.svg", buildFavicon());
  record("ads.txt", buildAdsTxt());
  record("_headers", buildHeaders());
  record("_redirects", buildRedirects(tools));

  // Static passthrough (real icons, images, verification files)
  const staticDir = path.join(SRC, "static");
  if (fs.existsSync(staticDir)) {
    for (const name of fs.readdirSync(staticDir)) {
      const from = path.join(staticDir, name);
      if (fs.statSync(from).isFile()) {
        fs.copyFileSync(from, path.join(DIST, name));
        files++;
      }
    }
  }
  if (!fs.existsSync(path.join(DIST, "apple-touch-icon.png"))) {
    fs.writeFileSync(path.join(DIST, "apple-touch-icon.png"), fallbackTouchIcon());
    files++;
  }

  /* ---------------- report ---------------- */
  const adsOn = [
    site.ads.popunder && "popunder",
    site.ads.socialBar && "social bar",
    site.ads.banner && "banner"
  ].filter(Boolean);

  console.log(`\n  ${site.name} build complete`);
  console.log(`  ${files} files, ${(bytes / 1024).toFixed(0)} KB, ${Date.now() - started} ms`);
  console.log(`  ${tools.length} tools, ${posts.length} guides, ${legal.length} policy pages`);
  console.log(`  site URL: ${site.url}`);
  console.log(`  ads: ${adsOn.length ? adsOn.join(", ") + " (consent-gated)" : "none configured — set ADS_* env vars"}`);
  if (!site.ads.adsTxt) console.log(`  note: ADS_TXT is unset, ads.txt is a placeholder`);
  console.log("");
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("\n  Build failed:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

module.exports = { main };
