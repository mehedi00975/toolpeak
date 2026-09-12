/**
 * Understands the ad snippets Adsterra hands out, so the admin panel can
 * check one before it is saved instead of after it has broken the live site.
 *
 * Three things make this worth doing rather than trusting a paste.
 *
 * 1. Adsterra's dashboard still issues banner code built on `document.write`.
 *    Our ads load after the visitor clicks Accept, which is always after the
 *    document has closed, and `document.write` on a closed document implicitly
 *    calls `document.open()` — wiping the entire page. The failure is silent at
 *    paste time and total at run time, so we detect it and rewrite it.
 *
 * 2. The three units look alike. A popunder and a social bar are both a lone
 *    script tag; pasting one into the other's box produces a site that loads
 *    two popunders and no social bar, which is both a policy problem and a
 *    revenue problem.
 *
 * 3. `http://` in a snippet is a mixed-content error on an https site. The
 *    browser blocks it and the ad silently never appears.
 *
 * Everything here is pure string work: no DOM, no network, so it runs in the
 * panel, in the build and in tests identically.
 */

"use strict";

/** Hosts Adsterra serves creatives from. The list rotates; treat as a hint. */
const KNOWN_HOSTS = [
  "highperformanceformat.com",
  "profitableratecpm.com",
  "effectivecreativeformat.com",
  "profitabledisplaynetwork.com",
  "profitablecreativeformat.com",
  "topcreativeformat.com",
  "profitabledisplayformat.com",
  "highperformancedformats.com",
  "bnserving.com",
  "pl26717001.profitableratecpm.com"
];

const UNITS = {
  popunder: "Popunder",
  socialBar: "Social Bar",
  banner: "Banner"
};

/* ------------------------------------------------------------------ *
 * Small parsers
 * ------------------------------------------------------------------ */

/** Every `src` on a script tag in the snippet. */
function scriptSources(html) {
  const out = [];
  const re = /<script\b[^>]*\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let m;
  while ((m = re.exec(html))) out.push(m[2] || m[3] || m[4] || "");
  return out;
}

/**
 * Sources that a `document.write` builds by string concatenation.
 *
 * The real snippets never contain the URL as one literal. Adsterra splits the
 * tag name to slip past HTML parsers and picks the protocol at run time:
 *
 *   document.write('<scr' + 'ipt src="http' +
 *     (location.protocol === 'https:' ? 's' : '') +
 *     '://www.example.com/KEY/invoke.js"></scr' + 'ipt>');
 *
 * So the only reliable approach is to evaluate the concatenation the way the
 * browser would: drop the JavaScript glue between the quoted pieces, join the
 * string literals, and read the URL out of the resulting markup.
 */
function writtenSources(html) {
  const out = [];

  for (const call of html.matchAll(/document\s*\.\s*write\s*\(([\s\S]*?)\)\s*;/gi)) {
    const body = call[1];

    // Every single- or double-quoted literal, in order.
    const pieces = [];
    for (const lit of body.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)) {
      pieces.push(lit[1] !== undefined ? lit[1] : lit[2]);
    }

    // The protocol is chosen by a ternary, so both branches are present as
    // literals and a plain join produces nonsense like "httphttps:s://host".
    // The protocol does not matter to us — we always want the page's own — so
    // rather than trying to evaluate the ternary, take the part that is
    // unambiguous: everything from "//" to the ".js".
    const assembled = pieces.join("");

    const m = assembled.match(/(\/\/[a-z0-9.-]+\/[^"'\s>]*\.js)/i);
    if (m) out.push(m[1]);
  }

  return out;
}

/** The host part of a src, protocol-relative or absolute. */
function hostOf(src) {
  const m = String(src).match(/^(?:https?:)?\/\/([^/]+)/i);
  return m ? m[1].toLowerCase() : "";
}

/** Adsterra keys are the 32-hex path segment before /invoke.js. */
function keysIn(html) {
  const keys = new Set();

  for (const m of html.matchAll(/\/([a-f0-9]{16,64})\/invoke\.js/gi)) keys.add(m[1]);
  for (const m of html.matchAll(/['"]key['"]\s*:\s*['"]([^'"]+)['"]/gi)) keys.add(m[1]);
  // Social Bar and some popunder tags carry the id in the filename itself.
  for (const m of html.matchAll(/\/([a-f0-9]{16,64})\.js/gi)) keys.add(m[1]);

  return [...keys];
}

/** The banner size declared in atOptions, if there is one. */
function bannerSize(html) {
  const w = html.match(/['"]width['"]\s*:\s*['"]?(\d+)/i);
  const h = html.match(/['"]height['"]\s*:\s*['"]?(\d+)/i);
  return w && h ? { width: Number(w[1]), height: Number(h[1]) } : null;
}

/* ------------------------------------------------------------------ *
 * Rewriting document.write
 * ------------------------------------------------------------------ */

/**
 * Turns `document.write('<scr'+'ipt src="...">')` into a real script tag.
 *
 * The atOptions assignment above it has to survive and has to keep running
 * first, because invoke.js reads it. So we keep the inline script, strip only
 * the document.write call out of it, and append a separate <script src>.
 * That is the two-part form our injector already handles correctly.
 */
function rewriteDocumentWrite(html) {
  if (!/document\s*\.\s*write/i.test(html)) return { changed: false, html };

  const found = writtenSources(html);
  if (!found.length) return { changed: false, html, unfixable: true };

  // Drop the document.write statement, keeping whatever else the script does
  // (the atOptions assignment above it must survive and must still run first).
  //
  // A regex cannot do this: the argument contains parentheses of its own, in
  // the protocol ternary, so any non-greedy match stops at the wrong one and
  // leaves a fragment behind that is a syntax error. Scan and count instead,
  // ignoring parentheses that sit inside string literals.
  let cleaned = html;
  for (;;) {
    const start = cleaned.search(/document\s*\.\s*write\s*\(/i);
    if (start === -1) break;

    let i = cleaned.indexOf("(", start);
    let depth = 0;
    let quote = null;
    let end = -1;

    for (; i < cleaned.length; i++) {
      const ch = cleaned[i];

      if (quote) {
        if (ch === "\\") i++;
        else if (ch === quote) quote = null;
        continue;
      }

      if (ch === "'" || ch === '"') { quote = ch; continue; }
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }

    if (end === -1) break; // unbalanced; leave it alone rather than mangle it

    // Swallow a trailing semicolon so no empty statement is left.
    let after = end + 1;
    while (after < cleaned.length && /[\s;]/.test(cleaned[after])) after++;

    cleaned = cleaned.slice(0, start) + cleaned.slice(after);
  }

  // If that emptied an inline script, remove the husk.
  cleaned = cleaned.replace(
    /<script\b[^>]*>\s*<\/script\s*>/gi,
    ""
  );

  const tags = found
    .map(src => `<script async src="${src}"></script>`)
    .join("\n");

  return {
    changed: true,
    html: (cleaned.trim() + "\n" + tags).trim(),
    sources: found
  };
}

/* ------------------------------------------------------------------ *
 * Identification
 * ------------------------------------------------------------------ */

/**
 * Guesses which unit a snippet is, from its shape.
 *
 * A banner is unmistakable: it configures atOptions with a width and height,
 * because it has to reserve space. The other two do not take space, so they
 * are a bare script tag and can only be told apart by hints in the URL.
 */
function identify(html) {
  const text = String(html || "");
  if (!text.trim()) return { unit: null, confidence: "none" };

  // atOptions is the giveaway: only a unit that occupies space needs to
  // declare a width and height. invoke.js alone is not enough — Adsterra uses
  // that filename for several formats — so on its own it stays ambiguous
  // rather than being misreported as a banner.
  if (/atOptions/i.test(text)) {
    return { unit: "banner", confidence: bannerSize(text) ? "high" : "medium" };
  }

  if (/\b(pop|pu)[-_]?under\b/i.test(text)) return { unit: "popunder", confidence: "medium" };
  if (/social[-_]?bar|sb\.js/i.test(text)) return { unit: "socialBar", confidence: "medium" };

  // A single script tag with no size and no atOptions: one of the two
  // space-free units, but the URL alone cannot say which.
  if (scriptSources(text).length === 1) {
    return { unit: null, confidence: "ambiguous" };
  }

  return { unit: null, confidence: "none" };
}

/* ------------------------------------------------------------------ *
 * The check the panel runs
 * ------------------------------------------------------------------ */

/**
 * Inspects one snippet destined for one slot.
 *
 * Returns problems at two levels. An `error` means the snippet will not work
 * and should not be saved as-is. A `warning` means it will probably work but
 * something looks wrong enough to mention.
 */
function analyze(html, expectedUnit) {
  const text = String(html || "").trim();

  const result = {
    unit: expectedUnit,
    empty: !text,
    errors: [],
    warnings: [],
    notes: [],
    keys: [],
    hosts: [],
    size: null,
    rewritten: null
  };

  if (!text) return result;

  /* -- Is it even ad code? -- */

  if (!/<script/i.test(text)) {
    if (/^https?:\/\/\S+$/i.test(text)) {
      result.errors.push(
        "That is a bare URL, not an ad tag. Use the code Adsterra shows under " +
        "the unit, which starts with <script."
      );
    } else {
      result.errors.push("No <script> tag found. Paste the whole snippet, tags included.");
    }
    return result;
  }

  /* -- document.write: the page-wiping one -- */

  if (/document\s*\.\s*write/i.test(text)) {
    const fix = rewriteDocumentWrite(text);
    if (fix.changed) {
      result.rewritten = fix.html;
      result.warnings.push(
        "This snippet uses document.write, which blanks the page when an ad " +
        "loads after the page has finished loading — which is always the case " +
        "here, because ads wait for consent. It has been rewritten to a plain " +
        "script tag that does the same job safely."
      );
    } else {
      result.errors.push(
        "This snippet calls document.write but no script URL could be found " +
        "inside it, so it cannot be rewritten automatically. Ask Adsterra for " +
        "the async version of the tag."
      );
      return result;
    }
  }

  const effective = result.rewritten || text;

  /* -- Where it loads from -- */

  const sources = scriptSources(effective);
  result.hosts = [...new Set(sources.map(hostOf).filter(Boolean))];
  result.keys = keysIn(effective);
  result.size = bannerSize(effective);

  if (/src\s*=\s*["']http:\/\//i.test(effective)) {
    result.errors.push(
      "The script loads over http://, which a browser blocks on an https site. " +
      "Change it to https:// or to a leading // so it follows the page."
    );
  }

  if (sources.length === 0 && !/atOptions/i.test(effective)) {
    result.warnings.push("No script src found. Check the snippet copied completely.");
  }

  const unknown = result.hosts.filter(
    h => !KNOWN_HOSTS.some(known => h === known || h.endsWith("." + known))
  );
  if (unknown.length) {
    result.notes.push(
      "Serving host " + unknown.join(", ") + " is not one we recognize. That is " +
      "normal — Adsterra rotates domains — but make sure it came from your own " +
      "dashboard."
    );
  }

  /* -- Is it in the right box? -- */

  const guess = identify(effective);

  if (guess.unit && expectedUnit && guess.unit !== expectedUnit) {
    result.errors.push(
      "This looks like " + UNITS[guess.unit] + " code, not " + UNITS[expectedUnit] +
      ". Banner code sets atOptions with a width and height; popunder and " +
      "social bar are a single script tag. Paste it in the " + UNITS[guess.unit] +
      " box instead."
    );
  }

  if (expectedUnit === "banner" && !/atOptions/i.test(effective)) {
    result.warnings.push(
      "Banner code normally sets atOptions with a width and height. Without " +
      "it the slot may collapse."
    );
  }

  /* -- Banner sizing against our slot -- */

  if (expectedUnit === "banner" && result.size) {
    const { width, height } = result.size;
    const fits = [
      [728, 90], [468, 60], [320, 50], [300, 250], [336, 280], [300, 100]
    ].some(([w, h]) => w === width && h === height);

    if (!fits) {
      result.notes.push(
        `Size ${width}x${height} is unusual for an in-content slot. 728x90 for ` +
        "desktop or 320x50 for mobile fit the reserved space best."
      );
    }
    if (width > 970 || height > 280) {
      result.warnings.push(
        `At ${width}x${height} this banner is larger than the content column ` +
        "and will overflow on mobile."
      );
    }
  }

  if (expectedUnit !== "banner" && result.size) {
    result.notes.push(
      "This snippet declares a size, which usually means it is banner code."
    );
  }

  return result;
}

/**
 * Checks the three units together, for problems no single snippet reveals.
 */
function analyzeAll(values) {
  const units = ["popunder", "socialBar", "banner"];
  const per = {};
  const shared = [];

  for (const unit of units) per[unit] = analyze(values[unit], unit);

  // The same key in two slots means one unit was pasted twice. Adsterra bills
  // per placement, so the duplicate earns nothing and the missing unit is lost.
  const seen = new Map();
  for (const unit of units) {
    for (const key of per[unit].keys) {
      if (seen.has(key)) {
        shared.push(
          `${UNITS[seen.get(key)]} and ${UNITS[unit]} use the same ad key ` +
          `(${key.slice(0, 10)}…). Each unit needs its own code from the ` +
          "dashboard, or one of them will not report any earnings."
        );
      } else {
        seen.set(key, unit);
      }
    }
  }

  const configured = units.filter(u => !per[u].empty);

  return {
    per,
    shared,
    configured,
    errors: units.reduce((n, u) => n + per[u].errors.length, 0),
    warnings: units.reduce((n, u) => n + per[u].warnings.length, 0)
  };
}

/* ------------------------------------------------------------------ *
 * ads.txt
 * ------------------------------------------------------------------ */

/**
 * Validates the ads.txt line. Getting this wrong costs real money quietly:
 * advertisers who verify ads.txt simply stop bidding, and nothing on the site
 * looks broken.
 */
function analyzeAdsTxt(text) {
  const result = { empty: false, errors: [], warnings: [], notes: [], lines: [] };
  const raw = String(text || "").trim();

  if (!raw) {
    result.empty = true;
    return result;
  }

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  if (!lines.length) {
    result.warnings.push("Only comments here — no actual ads.txt record.");
    return result;
  }

  for (const line of lines) {
    const fields = line.split(",").map(f => f.trim());
    const entry = { line, ok: true };

    if (fields.length < 3) {
      result.errors.push(
        `"${line}" is not a valid record. The format is: exchange domain, ` +
        "publisher id, DIRECT or RESELLER."
      );
      entry.ok = false;
      result.lines.push(entry);
      continue;
    }

    const [domain, publisherId, relationship] = fields;

    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
      result.errors.push(`"${domain}" does not look like an exchange domain.`);
      entry.ok = false;
    }
    if (!publisherId) {
      result.errors.push(`"${line}" has an empty publisher id.`);
      entry.ok = false;
    }
    if (!/^(DIRECT|RESELLER)$/i.test(relationship)) {
      result.errors.push(
        `"${relationship}" must be DIRECT or RESELLER (uppercase is conventional).`
      );
      entry.ok = false;
    }
    if (/^(DIRECT|RESELLER)$/.test(relationship) === false &&
        /^(direct|reseller)$/i.test(relationship)) {
      result.notes.push("DIRECT and RESELLER are conventionally uppercase.");
    }

    result.lines.push(entry);
  }

  if (!lines.some(l => /adsterra|admaven|monetag/i.test(l))) {
    result.warnings.push(
      "No Adsterra record here. Copy the line from Adsterra → Websites → ads.txt."
    );
  }

  return result;
}

module.exports = {
  analyze,
  analyzeAll,
  analyzeAdsTxt,
  identify,
  rewriteDocumentWrite,
  scriptSources,
  keysIn,
  bannerSize,
  hostOf,
  KNOWN_HOSTS,
  UNITS
};
