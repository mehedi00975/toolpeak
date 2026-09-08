/**
 * env.js — a minimal .env loader.
 *
 * The admin panel writes settings to .env, and the build reads them. Without
 * this, saving in the panel would appear to work and change nothing, because
 * site.config.js only ever looked at process.env.
 *
 * Real environment variables always win. That way Cloudflare Pages and GitHub
 * Actions keep working exactly as before — a local .env is a development
 * convenience, never something that can override a deployment secret.
 *
 * Deliberately dependency-free, so `npm install` is still not required to
 * deploy. It handles the subset of .env syntax the panel produces:
 *
 *   KEY=value
 *   KEY="value with spaces"
 *   KEY='single quoted'
 *   KEY="line one\nline two"      (\n is expanded inside double quotes)
 *   # comments and blank lines
 */

"use strict";

const fs = require("fs");
const path = require("path");

/** Parses .env text into a plain object. Never throws on malformed input. */
function parse(text) {
  const out = {};

  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    // Tolerate the "export FOO=bar" form people paste from a shell.
    const withoutExport = line.replace(/^export\s+/, "");

    const eq = withoutExport.indexOf("=");
    if (eq === -1) continue;

    const key = withoutExport.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    let value = withoutExport.slice(eq + 1).trim();

    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      // Double quotes: expand the escapes the panel writes.
      value = value
        .slice(1, -1)
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    } else if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) {
      // Single quotes are literal.
      value = value.slice(1, -1);
    } else {
      // Unquoted: strip a trailing inline comment.
      const hash = value.indexOf(" #");
      if (hash !== -1) value = value.slice(0, hash).trim();
    }

    out[key] = value;
  }

  return out;
}

/** Serializes an object back to .env text, quoting whatever needs it. */
function stringify(values, { header = "" } = {}) {
  const lines = header ? [header.trim(), ""] : [];

  for (const [key, raw] of Object.entries(values)) {
    if (raw === undefined || raw === null) continue;
    const value = String(raw);

    if (value === "") {
      lines.push(`${key}=`);
      continue;
    }

    // Quote when the value contains anything that would not survive a
    // bare assignment.
    const needsQuotes = /[\s"'#\\\n\r\t]/.test(value);
    if (!needsQuotes) {
      lines.push(`${key}=${value}`);
      continue;
    }

    const escaped = value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");

    lines.push(`${key}="${escaped}"`);
  }

  return lines.join("\n") + "\n";
}

/**
 * Loads .env into process.env without overwriting anything already set.
 *
 * @param {string} [file] path to the .env file
 * @returns {object} the values that were applied
 */
function load(file) {
  const target = file || path.join(__dirname, "..", "..", ".env");
  if (!fs.existsSync(target)) return {};

  let parsed;
  try {
    parsed = parse(fs.readFileSync(target, "utf8"));
  } catch (err) {
    // A broken .env should never take the build down.
    console.warn(`  warning: could not read ${path.basename(target)}: ${err.message}`);
    return {};
  }

  const applied = {};
  for (const [key, value] of Object.entries(parsed)) {
    // A real environment variable is authoritative. This is what keeps
    // Cloudflare and GitHub Actions deployments unaffected by a stray file.
    if (process.env[key] === undefined) {
      process.env[key] = value;
      applied[key] = value;
    }
  }

  return applied;
}

/** Reads and parses .env without touching process.env. */
function read(file) {
  const target = file || path.join(__dirname, "..", "..", ".env");
  if (!fs.existsSync(target)) return {};
  try {
    return parse(fs.readFileSync(target, "utf8"));
  } catch {
    return {};
  }
}

module.exports = { load, read, parse, stringify };
