/**
 * Builds a throwaway copy of the site with fake ad snippets configured.
 *
 * The real dist/ is built with no ad environment variables, which is correct
 * for local work but means the banner slot and the ad loader are absent. The
 * consent tests need the fully wired version, so this builds one into a temp
 * directory using obviously fake URLs that are never fetched (jsdom runs with
 * subresource loading off).
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..", "..");

const FAKE_ADS = {
  ADS_BANNER: '<script src="https://fake.adsterra.test/banner.js"></script>',
  ADS_POPUNDER: '<script src="https://fake.adsterra.test/popunder.js"></script>',
  ADS_SOCIAL_BAR: '<script src="https://fake.adsterra.test/socialbar.js"></script>',
  ADS_TXT: "adsterra.test, 12345, DIRECT, 0000000000000000",
};

let cached = null;

/** Builds (once per run) and returns the path to the ad-enabled dist folder. */
function buildWithAds() {
  if (cached) return cached;

  const out = fs.mkdtempSync(path.join(os.tmpdir(), "toolpeak-ads-"));
  execFileSync(process.execPath, ["build.js"], {
    cwd: ROOT,
    env: { ...process.env, ...FAKE_ADS, DIST_DIR: out },
    stdio: "pipe",
  });

  cached = out;
  return out;
}

module.exports = { buildWithAds, FAKE_ADS };
