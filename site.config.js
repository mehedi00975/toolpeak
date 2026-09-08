/**
 * site.config.js — the only file you normally need to edit.
 *
 * Everything ad-related is read from ENVIRONMENT VARIABLES at build time, so no
 * Adsterra key, publisher ID or script snippet ever lives in this repository.
 * Set them in Cloudflare Pages → Settings → Environment variables.
 */

// Load .env first, so values saved from the admin panel reach the build.
// Real environment variables are never overwritten, which keeps Cloudflare
// Pages and GitHub Actions behaving exactly as before.
require("./src/lib/env.js").load();

const env = process.env;

/** Read an env var, trimming stray quotes people paste in by accident. */
function read(name, fallback = "") {
  const raw = env[name];
  if (raw === undefined || raw === null) return fallback;
  const value = String(raw).trim();
  if (!value) return fallback;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

const siteUrl = read("SITE_URL", "https://toolpeak.com").replace(/\/+$/, "");

module.exports = {
  /* ------------------------------------------------------------------ *
   * Identity
   * ------------------------------------------------------------------ */
  name: "ToolPeak",
  // Shown in <title> after the page name, e.g. "Word Counter — ToolPeak".
  tagline: "Free online tools that run in your browser",
  // Used for canonical URLs, sitemap.xml, RSS and Open Graph.
  url: siteUrl,
  locale: "en_US",
  lang: "en",
  // CHANGE THIS to a mailbox you actually read. Adsterra and Google both check it.
  email: read("CONTACT_EMAIL", "hello@toolpeak.com"),
  // Optional: public social/profile URL shown on the About page. Leave blank to hide.
  publisher: read("PUBLISHER_NAME", "ToolPeak"),
  themeColor: "#1d4ed8",
  founded: 2026,

  /* ------------------------------------------------------------------ *
   * Ads — values come from Cloudflare environment variables only.
   *
   *   ADS_POPUNDER    full <script> snippet from Adsterra (Popunder)
   *   ADS_SOCIAL_BAR  full <script> snippet from Adsterra (Social Bar)
   *   ADS_BANNER      full snippet from Adsterra (728x90 / 468x60 / 320x50 banner)
   *   ADS_TXT         the exact line(s) Adsterra tells you to put in ads.txt
   *
   * Anything left empty is simply not rendered — the site works fine without ads.
   * House rule from the brief: ONE popunder + ONE social bar + ONE in-content
   * banner. There is deliberately no way to configure more than that.
   * ------------------------------------------------------------------ */
  ads: {
    popunder: read("ADS_POPUNDER"),
    socialBar: read("ADS_SOCIAL_BAR"),
    banner: read("ADS_BANNER"),
    adsTxt: read("ADS_TXT"),
    // Ads only load after the visitor clicks Accept. Never change this to false:
    // it is what keeps the site legal for UK/EU visitors and honest for everyone.
    requireConsent: true,
  },

  /* ------------------------------------------------------------------ *
   * Optional privacy-friendly analytics (Cloudflare Web Analytics token).
   * Loads only after consent, like the ads. Leave empty to ship zero trackers.
   * ------------------------------------------------------------------ */
  analytics: {
    cloudflareToken: read("CF_BEACON_TOKEN"),
  },

  /* ------------------------------------------------------------------ *
   * Search engine verification meta tags (optional, one-time setup).
   * ------------------------------------------------------------------ */
  verification: {
    google: read("GOOGLE_SITE_VERIFICATION"),
    bing: read("BING_SITE_VERIFICATION"),
    pinterest: read("PINTEREST_SITE_VERIFICATION"),
  },
};
