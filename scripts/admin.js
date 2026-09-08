#!/usr/bin/env node
/**
 * scripts/admin.js — a local control panel for the site.
 *
 * Run `npm run admin`, open the URL, and you can manage ad settings and write
 * posts without touching a text editor. It writes to the same files you would
 * have edited by hand: .env for settings, src/content/blog/*.js for posts.
 *
 * Two deliberate constraints:
 *
 *   1. This is a LOCAL tool. It is never deployed — dist/ contains only static
 *      files, and nothing here is part of the published site. Ad snippets and
 *      settings stay on your machine, in a gitignored .env.
 *
 *   2. It binds to localhost by default. Ad snippets contain your account ID,
 *      and this panel has no authentication, so it must not be exposed. Set
 *      ADMIN_HOST=0.0.0.0 to override when you know the network is private.
 *
 * Zero dependencies, like the rest of the project.
 */

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const envLib = require("../src/lib/env.js");

const ROOT = path.join(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const TOOLS_DIR = path.join(ROOT, "src", "pages", "tools");
const ENV_FILE = path.join(ROOT, ".env");

const PORT = Number(process.env.ADMIN_PORT) || 8081;
const HOST = process.env.ADMIN_HOST || "127.0.0.1";

/* ------------------------------------------------------------------ *
 * Settings schema
 * ------------------------------------------------------------------ */

const SETTINGS = [
  {
    group: "Site",
    fields: [
      { key: "SITE_URL", label: "Site URL", type: "text",
        placeholder: "https://yourname.github.io",
        help: "No trailing slash. Drives canonical URLs, the sitemap and RSS." },
      { key: "CONTACT_EMAIL", label: "Contact email", type: "text",
        placeholder: "you@example.com",
        help: "Shown on the Contact page. Ad networks email this during review." },
      { key: "PUBLISHER_NAME", label: "Publisher name", type: "text",
        placeholder: "ToolPeak",
        help: "Used in the copyright line and structured data." }
    ]
  },
  {
    group: "Adsterra",
    note: "Paste each snippet exactly as the dashboard gives it, including the " +
          "script tags. Leave one empty to disable that unit. The house limit " +
          "is one popunder, one social bar and one banner — there is no fourth.",
    fields: [
      { key: "ADS_POPUNDER", label: "Popunder", type: "textarea", secret: true,
        help: "Fires once on load. Needs no page space." },
      { key: "ADS_SOCIAL_BAR", label: "Social Bar", type: "textarea", secret: true,
        help: "The mobile unit." },
      { key: "ADS_BANNER", label: "Banner", type: "textarea", secret: true,
        help: "One in-content banner. 728x90, 468x60 or 320x50." },
      { key: "ADS_TXT", label: "ads.txt line", type: "textarea", secret: true,
        placeholder: "adsterra.com, 1234567, DIRECT",
        help: "From Adsterra → Websites → ads.txt. Served at /ads.txt." }
    ]
  },
  {
    group: "Analytics and verification",
    fields: [
      { key: "CF_BEACON_TOKEN", label: "Cloudflare Analytics token", type: "text", secret: true },
      { key: "GOOGLE_SITE_VERIFICATION", label: "Google verification", type: "text" },
      { key: "BING_SITE_VERIFICATION", label: "Bing verification", type: "text" },
      { key: "PINTEREST_SITE_VERIFICATION", label: "Pinterest verification", type: "text" }
    ]
  }
];

const ALL_KEYS = SETTINGS.flatMap(g => g.fields.map(f => f.key));

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      // A settings payload is never large; refuse anything suspicious.
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error("payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/** Escapes a value for embedding in a JS single-backtick template. */
function forTemplate(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

/** Escapes a value for a double-quoted JS string. */
function forString(value) {
  return JSON.stringify(String(value));
}

function toolSlugs() {
  return fs.readdirSync(TOOLS_DIR)
    .filter(f => f.endsWith(".js"))
    .map(f => f.replace(/\.js$/, ""))
    .sort();
}

function listPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith(".js"))
    .map(file => {
      const full = path.join(BLOG_DIR, file);
      try {
        delete require.cache[require.resolve(full)];
        const post = require(full);
        return {
          file,
          slug: post.slug,
          title: post.title,
          date: post.date,
          description: post.description || "",
          draft: Boolean(post.draft),
          faqs: (post.faqs || []).length,
          words: String(post.body || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length
        };
      } catch (err) {
        return { file, slug: file.replace(/\.js$/, ""), title: `(cannot read: ${err.message})`, broken: true };
      }
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function loadPost(slug) {
  const full = path.join(BLOG_DIR, `${slugify(slug)}.js`);
  if (!fs.existsSync(full)) return null;
  delete require.cache[require.resolve(full)];
  return require(full);
}

/** Writes a post module. Mirrors the shape the build and scaffolder expect. */
function writePost(post) {
  const slug = slugify(post.slug || post.title);
  if (!slug) throw new Error("a title or slug is required");

  const faqs = (post.faqs || [])
    .filter(f => f && String(f.q).trim() && String(f.a).trim())
    .map(f => {
      const answer = String(f.a).trim();
      // Wrap a bare answer in a paragraph so the FAQ markup stays consistent.
      const html = /^\s*</.test(answer) ? answer : `<p>${answer}</p>`;
      return `    {\n      q: ${forString(String(f.q).trim())},\n      a: ${forString(html)}\n    }`;
    });

  const related = (post.related || []).filter(Boolean);

  const lines = [
    "module.exports = {",
    `  slug: ${forString(slug)},`,
    `  title: ${forString(String(post.title || "").trim())},`,
    "",
    "  description:",
    `    ${forString(String(post.description || "").trim())},`,
    "",
    `  keywords: ${forString(String(post.keywords || "").trim())},`,
    "",
    `  date: ${forString(String(post.date || new Date().toISOString().slice(0, 10)))},`,
    `  readingTime: ${Number(post.readingTime) || estimateReadingTime(post.body)},`
  ];

  if (related.length) lines.push(`  related: ${JSON.stringify(related)},`);
  if (post.draft) lines.push("  draft: true,");

  lines.push(
    "",
    "  body: `",
    forTemplate(String(post.body || "").trim()),
    "`,",
    ""
  );

  if (faqs.length) {
    lines.push("  faqs: [", faqs.join(",\n"), "  ]");
  } else {
    lines.push("  faqs: []");
  }

  lines.push("};", "");

  const file = path.join(BLOG_DIR, `${slug}.js`);
  fs.writeFileSync(file, lines.join("\n"));
  return { slug, file: path.relative(ROOT, file) };
}

function estimateReadingTime(body) {
  const words = String(body || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Runs a npm script and captures its output. */
function run(script) {
  return new Promise(resolve => {
    execFile("npm", ["run", script], { cwd: ROOT, timeout: 180000 }, (err, stdout, stderr) => {
      resolve({
        ok: !err,
        output: [stdout, stderr].filter(Boolean).join("\n").trim() || (err ? String(err.message) : "")
      });
    });
  });
}

/* ------------------------------------------------------------------ *
 * API
 * ------------------------------------------------------------------ */

async function handleApi(req, res, url) {
  const route = url.pathname.replace(/^\/api\//, "");

  // --- settings ---

  if (route === "settings" && req.method === "GET") {
    const stored = envLib.read(ENV_FILE);
    const values = {};
    const fromEnvironment = [];

    for (const key of ALL_KEYS) {
      values[key] = stored[key] || "";
      // Flag anything set in the real environment: the panel cannot change it,
      // and showing it as editable would be a lie.
      if (process.env[key] !== undefined && stored[key] === undefined) {
        fromEnvironment.push(key);
      }
    }

    return json(res, 200, { schema: SETTINGS, values, fromEnvironment, envFileExists: fs.existsSync(ENV_FILE) });
  }

  if (route === "settings" && req.method === "POST") {
    const body = await readBody(req);
    const existing = envLib.read(ENV_FILE);
    const next = { ...existing };

    for (const key of ALL_KEYS) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        next[key] = String(body[key] ?? "").trim();
      }
    }

    const header = [
      "# Written by the admin panel (npm run admin).",
      "# Gitignored: ad snippets and tokens must never be committed.",
      "# For a live deploy, set these in Cloudflare Pages or GitHub Actions secrets."
    ].join("\n");

    fs.writeFileSync(ENV_FILE, envLib.stringify(next, { header }));
    return json(res, 200, { saved: true, keys: Object.keys(next).length });
  }

  // --- posts ---

  if (route === "posts" && req.method === "GET") {
    return json(res, 200, { posts: listPosts(), tools: toolSlugs() });
  }

  if (route === "post" && req.method === "GET") {
    const slug = url.searchParams.get("slug");
    const post = loadPost(slug);
    if (!post) return json(res, 404, { error: "not found" });
    return json(res, 200, { post });
  }

  if (route === "post" && req.method === "POST") {
    const body = await readBody(req);
    if (!String(body.title || "").trim()) {
      return json(res, 400, { error: "A title is required." });
    }
    if (!String(body.body || "").trim()) {
      return json(res, 400, { error: "The article body is empty." });
    }

    const slug = slugify(body.slug || body.title);
    const existing = fs.existsSync(path.join(BLOG_DIR, `${slug}.js`));
    if (existing && !body.overwrite) {
      return json(res, 409, { error: `A post with the slug "${slug}" already exists.`, slug });
    }

    try {
      const result = writePost(body);
      // Prove the file we just wrote actually parses.
      delete require.cache[require.resolve(path.join(ROOT, result.file))];
      require(path.join(ROOT, result.file));
      return json(res, 200, { saved: true, ...result, updated: existing });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  if (route === "post" && req.method === "DELETE") {
    const slug = slugify(url.searchParams.get("slug") || "");
    const file = path.join(BLOG_DIR, `${slug}.js`);
    if (!fs.existsSync(file)) return json(res, 404, { error: "not found" });
    fs.unlinkSync(file);
    return json(res, 200, { deleted: slug });
  }

  // --- actions ---

  if (route === "build" && req.method === "POST") {
    return json(res, 200, await run("build"));
  }

  if (route === "test" && req.method === "POST") {
    return json(res, 200, await run("test"));
  }

  if (route === "status" && req.method === "GET") {
    const stored = envLib.read(ENV_FILE);
    const configured = ["ADS_POPUNDER", "ADS_SOCIAL_BAR", "ADS_BANNER"]
      .filter(k => (stored[k] || process.env[k] || "").trim());

    return json(res, 200, {
      posts: listPosts().length,
      tools: toolSlugs().length,
      adsConfigured: configured,
      adsTxtSet: Boolean((stored.ADS_TXT || process.env.ADS_TXT || "").trim()),
      siteUrl: stored.SITE_URL || process.env.SITE_URL || "https://toolpeak.com",
      distBuilt: fs.existsSync(path.join(ROOT, "dist", "index.html"))
    });
  }

  return json(res, 404, { error: "unknown endpoint" });
}

/* ------------------------------------------------------------------ *
 * Server
 * ------------------------------------------------------------------ */

const server = http.createServer(async (req, res) => {
  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  } catch {
    return json(res, 400, { error: "bad request" });
  }

  if (url.pathname.startsWith("/api/")) {
    try {
      return await handleApi(req, res, url);
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    const html = fs.readFileSync(path.join(__dirname, "admin-ui.html"), "utf8");
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    });
    return res.end(html);
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, HOST, () => {
  const shown = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`
  ToolPeak admin panel

  http://${shown}:${PORT}

  Settings are written to .env, which is gitignored.
  For a live site, set the same values in Cloudflare Pages or GitHub secrets.
`);
  if (HOST === "0.0.0.0") {
    console.log("  Note: bound to all interfaces. There is no login — keep the network private.\n");
  }
});
