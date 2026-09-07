#!/usr/bin/env node
/**
 * scripts/serve.js — tiny static file server for local preview.
 *
 * Not used in production (Cloudflare Pages serves dist/ directly). It exists so
 * `npm run dev` gives you the same URL structure as the deployed site,
 * including extensionless paths and the 404 page.
 */

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "..", "dist");
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "0.0.0.0";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json"
};

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type || "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

/** Resolve a URL path to a file inside dist/, refusing to escape it. */
function resolve(urlPath) {
  let rel = decodeURIComponent(urlPath.split("?")[0]);
  if (rel.endsWith("/")) rel += "index.html";

  const candidates = [rel];
  if (!path.extname(rel)) {
    candidates.push(rel + ".html", path.join(rel, "index.html"));
  }

  for (const candidate of candidates) {
    const full = path.join(DIST, candidate);
    if (!full.startsWith(DIST)) continue; // path traversal guard
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

const server = http.createServer((req, res) => {
  const file = resolve(req.url || "/");

  if (!file) {
    const notFound = path.join(DIST, "404.html");
    if (fs.existsSync(notFound)) {
      const body = fs.readFileSync(notFound);
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(body);
      return;
    }
    send(res, 404, "404 Not Found");
    return;
  }

  const ext = path.extname(file);
  const body = fs.readFileSync(file);
  res.writeHead(200, {
    "Content-Type": TYPES[ext] || "application/octet-stream",
    "Content-Length": body.length,
    "Cache-Control": "no-store"
  });
  res.end(body);
});

server.listen(PORT, HOST, () => {
  console.log(`\n  Serving dist/ on http://${HOST}:${PORT}\n`);
});
