#!/usr/bin/env node
/**
 * new-post.js — scaffolds a blog post module.
 *
 *   npm run new-post -- "How to Compress a PDF Under 1 MB"
 *   npm run new-post -- "mm to inches" --slug mm-to-inches --tools unit-converter
 *
 * The plan is one genuinely useful article per week, so the friction of
 * starting one should be near zero. This writes a file with the right shape,
 * today's date, and the four FAQ stubs already in place — then gets out of the
 * way. It never overwrites an existing post.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const BLOG_DIR = path.join(__dirname, "..", "src", "content", "blog");
const TOOLS_DIR = path.join(__dirname, "..", "src", "pages", "tools");

/* ------------------------------------------------------------------ *
 * Arguments
 * ------------------------------------------------------------------ */

const argv = process.argv.slice(2);
const flags = {};
const positional = [];

// Boolean flags take no value; everything else consumes the next argument.
const BOOLEAN_FLAGS = new Set(["draft", "help"]);

for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) {
    const name = argv[i].slice(2);
    flags[name] = BOOLEAN_FLAGS.has(name) ? true : argv[++i];
  } else {
    positional.push(argv[i]);
  }
}

const title = positional.join(" ").trim();
const wantsHelp = flags.help !== undefined;

if (!title || wantsHelp) {
  console.log(`
  Create a new blog post.

    npm run new-post -- "Your Article Title"

  Options
    --slug   <slug>            URL slug (default: derived from the title)
    --tools  <a,b>             related tool slugs shown at the foot of the post
    --draft                    mark as a draft so the build skips it

  Example
    npm run new-post -- "How to Compress a PDF Under 1 MB" --tools image-compressor
`);
  // Asking for help succeeded; forgetting the title did not.
  process.exit(wantsHelp ? 0 : 1);
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/** Reads the real tool slugs so --tools can be validated rather than guessed. */
function knownTools() {
  return fs.readdirSync(TOOLS_DIR)
    .filter(f => f.endsWith(".js"))
    .map(f => f.replace(/\.js$/, ""));
}

const slug = flags.slug ? slugify(flags.slug) : slugify(title);
const file = path.join(BLOG_DIR, `${slug}.js`);

if (fs.existsSync(file)) {
  console.error(`\n  A post already exists at src/content/blog/${slug}.js\n`);
  process.exit(1);
}

const available = knownTools();
const related = (flags.tools || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const unknown = related.filter(t => !available.includes(t));
if (unknown.length) {
  console.error(`\n  Unknown tool slug: ${unknown.join(", ")}`);
  console.error(`  Available: ${available.join(", ")}\n`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ *
 * Template
 * ------------------------------------------------------------------ */

const template = `module.exports = {
  slug: ${JSON.stringify(slug)},
  title: ${JSON.stringify(title)},

  // Aim for 120-160 characters. This is the snippet people decide on in the
  // search results, so lead with the answer rather than a preamble.
  description:
    "TODO: one or two sentences that answer the search query directly.",

  // Comma-separated, lowercase. The phrases a person would actually type.
  keywords: "TODO",

  date: "${today}",
  readingTime: 5,
${related.length ? `  related: ${JSON.stringify(related)},\n` : `  // related: ["unit-converter"],  // tool slugs shown at the foot of the post\n`}${flags.draft !== undefined ? "  draft: true,\n" : ""}
  body: \`
<p><strong>TODO: answer the question in the first sentence.</strong> Someone who
reads nothing else should already have what they came for.</p>

<h2>TODO: the first real section</h2>
<p>TODO. Write from something you have actually checked. Concrete numbers,
worked examples, and the edge case everyone hits belong here.</p>

<div class="note">
  <p><strong>Tip:</strong> TODO, or delete this block.</p>
</div>

<h2>TODO: a worked example</h2>
<ol class="steps">
  <li>TODO first step.</li>
  <li>TODO second step.</li>
  <li>TODO third step.</li>
</ol>

<h2>TODO: the thing people get wrong</h2>
<p>TODO. This section is usually why the page earns links.</p>
\`,

  // Exactly four. Answer the questions the search results actually show, and
  // keep each answer self-contained: they are also emitted as FAQ structured
  // data, where they appear without the surrounding article.
  faqs: [
    { q: "TODO question one?", a: "<p>TODO.</p>" },
    { q: "TODO question two?", a: "<p>TODO.</p>" },
    { q: "TODO question three?", a: "<p>TODO.</p>" },
    { q: "TODO question four?", a: "<p>TODO.</p>" }
  ]
};
`;

fs.writeFileSync(file, template);

console.log(`
  Created src/content/blog/${slug}.js

  Next
    1. Replace every TODO. Keep the units both metric and imperial, and the
       money in $ or £.
    2. npm run dev   then open http://localhost:8080/blog/${slug}.html
    3. npm run check to confirm the build and the whole test suite stay green.
`);
