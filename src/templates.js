/**
 * templates.js — HTML shell, navigation, ad slots, structured data.
 *
 * Deliberately plain string templates: no JSX, no template engine, nothing to
 * install. Every page ends up as one self-contained HTML file.
 */

const site = require("../site.config.js");

/** Escape for use in text nodes and quoted attributes. */
function esc(s) {
  return String(s === null || s === undefined ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Safe embedding inside a <script> block. */
function jsonScript(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/* ------------------------------------------------------------------ *
 * The ten tools — single source of truth for nav, home grid and sitemap
 * ------------------------------------------------------------------ */
const TOOLS = [
  {
    slug: "word-counter",
    name: "Word Counter",
    short: "Word Counter",
    icon: "&#128221;",
    blurb: "Count words, characters, sentences and paragraphs as you type, with reading and speaking time.",
    keywords: "word counter, character count, words to pages, reading time calculator"
  },
  {
    slug: "case-converter",
    name: "Text Case Converter",
    short: "Case Converter",
    icon: "&#127344;",
    blurb: "Switch text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case and more.",
    keywords: "case converter, uppercase to lowercase, title case converter, camelcase converter"
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    short: "Percentage",
    icon: "&#128200;",
    blurb: "Work out X% of Y, what percent one number is of another, percentage change, plus discounts and tips.",
    keywords: "percentage calculator, percent change, what is 20 percent of 150, discount calculator"
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    short: "Age",
    icon: "&#127874;",
    blurb: "Exact age in years, months and days from a date of birth, plus total weeks, hours and the next birthday.",
    keywords: "age calculator, date of birth calculator, how old am i, age in days"
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    short: "BMI",
    icon: "&#9878;",
    blurb: "Body mass index from kg and cm or pounds and feet, with your healthy weight range for that height.",
    keywords: "bmi calculator, body mass index, healthy weight range, bmi chart"
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    short: "Units",
    icon: "&#128207;",
    blurb: "Convert length, weight, temperature, volume, area, speed, time and digital storage between any units.",
    keywords: "unit converter, inches to cm, kg to lbs, celsius to fahrenheit, mb to gb"
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    short: "Image Compressor",
    icon: "&#128444;",
    blurb: "Shrink a photo to an exact size limit such as 200 KB. Runs in your browser, nothing is uploaded.",
    keywords: "image compressor, compress image to 200kb, reduce photo size, resize image online"
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    short: "Password",
    icon: "&#128273;",
    blurb: "Generate strong random passwords or memorable passphrases, with a real entropy and crack-time estimate.",
    keywords: "password generator, strong password, random password, passphrase generator"
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    short: "QR Code",
    icon: "&#128241;",
    blurb: "Make a QR code for a link, Wi-Fi network, email, phone number or contact card. Download PNG or SVG.",
    keywords: "qr code generator, free qr code, wifi qr code, qr code png download"
  },
  {
    slug: "text-diff",
    name: "Text Compare",
    short: "Text Compare",
    icon: "&#128203;",
    blurb: "Compare two blocks of text and highlight every added, removed and changed line, word by word.",
    keywords: "text compare, diff checker, compare two texts, find difference between texts"
  }
];

const LEGAL_PAGES = [
  { slug: "about", name: "About" },
  { slug: "contact", name: "Contact" },
  { slug: "privacy-policy", name: "Privacy Policy" },
  { slug: "terms", name: "Terms of Use" }
];

/* ------------------------------------------------------------------ *
 * Chrome
 * ------------------------------------------------------------------ */

const LOGO_SVG =
  '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
  '<rect width="32" height="32" rx="8" fill="#1d4ed8"/>' +
  '<path d="M8 20.5 13 25.5 24 8.5" fill="none" stroke="#fff" stroke-width="3.2" ' +
  'stroke-linecap="round" stroke-linejoin="round"/></svg>';

function header(currentPath) {
  const links = [
    { href: "/", label: "Home" },
    ...TOOLS.slice(0, 6).map(t => ({ href: `/tools/${t.slug}.html`, label: t.short })),
    { href: "/tools/", label: "All tools" },
    { href: "/blog/", label: "Guides" }
  ];

  const items = links.map(l => {
    const current = l.href === currentPath ? ' aria-current="page"' : "";
    return `<a href="${l.href}"${current}>${l.label}</a>`;
  }).join("");

  return `<a class="skip" href="#main">Skip to content</a>
<header class="masthead"><div class="wrap in">
<a class="logo" href="/">${LOGO_SVG}<span>${esc(site.name)}</span></a>
<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
<nav class="nav" id="site-nav" aria-label="Main navigation">${items}</nav>
</div></header>`;
}

function footer() {
  const toolLinks = TOOLS
    .map(t => `<a href="/tools/${t.slug}.html">${esc(t.name)}</a>`)
    .join("");
  const legalLinks = LEGAL_PAGES
    .map(p => `<a href="/${p.slug}.html">${esc(p.name)}</a>`)
    .join("");

  return `<footer><div class="wrap">
<div class="cols">
  <div>
    <strong>${esc(site.name)}</strong>
    <p>${esc(site.tagline)}. Every tool runs on your own device — no sign-up, no uploads, no limits.</p>
  </div>
  <div><b>Tools</b><nav>${toolLinks}</nav></div>
  <div><b>Site</b><nav>
    ${legalLinks}
    <a href="/blog/">Guides</a>
    <a href="/sitemap.xml">Sitemap</a>
  </nav></div>
  <div><b>Contact</b><nav>
    <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>
    <a href="/contact.html">Contact form details</a>
  </nav></div>
</div>
<div class="footer-bottom">
  <p>&copy; <span data-year>${site.founded}</span> ${esc(site.name)}. Results are provided for general information only and are not professional, financial, legal or medical advice.</p>
</div>
</div></footer>`;
}

/* ------------------------------------------------------------------ *
 * Ads
 * ------------------------------------------------------------------ */

/**
 * The in-content banner placeholder. Filled by consent.js only after the
 * visitor accepts; the reserved height stops the page from jumping.
 */
function adSlot() {
  if (!site.ads.banner) return "";
  return '<div class="adslot" data-ad="banner" aria-hidden="true"></div>';
}

/* ------------------------------------------------------------------ *
 * Structured data
 * ------------------------------------------------------------------ */

function breadcrumbLd(trail) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: site.url + item.href
    }))
  };
}

function faqLd(faqs) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.aText || stripTags(f.a) }
    }))
  };
}

function stripTags(html) {
  return String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

/* ------------------------------------------------------------------ *
 * Page shell
 * ------------------------------------------------------------------ */

/**
 * page({ title, description, path, body, ... }) -> full HTML document.
 *
 * `css` and `js` are inlined by build.js so a page needs exactly one request.
 */
function page(opts) {
  const {
    title,
    description,
    path,
    body,
    css = "",
    js = "",
    keywords = "",
    structuredData = [],
    published,
    modified,
    noindex = false,
    ogType = "website"
  } = opts;

  const canonical = site.url + path;
  // Append the brand only when it is not already in the title and the result
  // still fits inside the ~60 characters Google shows before truncating.
  const suffix = ` — ${site.name}`;
  const fullTitle =
    path === "/" || title.includes(site.name) || title.length + suffix.length > 60
      ? title
      : title + suffix;

  const graph = [
    {
      "@type": "WebSite",
      "@id": site.url + "/#website",
      url: site.url + "/",
      name: site.name,
      description: site.tagline,
      publisher: { "@id": site.url + "/#org" },
      inLanguage: "en-US"
    },
    {
      "@type": "Organization",
      "@id": site.url + "/#org",
      name: site.name,
      url: site.url + "/",
      email: site.email
    },
    ...structuredData
  ];

  const ld = { "@context": "https://schema.org", "@graph": graph };

  const verification = [
    site.verification.google
      ? `<meta name="google-site-verification" content="${esc(site.verification.google)}">`
      : "",
    site.verification.bing
      ? `<meta name="msvalidate.01" content="${esc(site.verification.bing)}">`
      : "",
    site.verification.pinterest
      ? `<meta name="p:domain_verify" content="${esc(site.verification.pinterest)}">`
      : ""
  ].filter(Boolean).join("\n");

  // Ad snippets travel as data, never as inline markup, so they can be gated.
  const adsPayload = {
    popunder: site.ads.popunder || "",
    socialBar: site.ads.socialBar || "",
    banner: site.ads.banner || ""
  };
  const hasAds = Boolean(adsPayload.popunder || adsPayload.socialBar || adsPayload.banner);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${keywords ? `<meta name="keywords" content="${esc(keywords)}">` : ""}
<link rel="canonical" href="${esc(canonical)}">
${noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">'}
<meta name="theme-color" content="${site.themeColor}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:locale" content="${site.locale}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
${published ? `<meta property="article:published_time" content="${published}">` : ""}
${modified ? `<meta property="article:modified_time" content="${modified}">` : ""}
${verification}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)} guides" href="/rss.xml">
<style>${css}</style>
<script type="application/ld+json">${jsonScript(ld)}</script>
</head>
<body>
${header(path)}
<main id="main" class="wrap">
${body}
</main>
${footer()}
${hasAds ? `<script>window.__TP_ADS=${jsonScript(adsPayload)};</script>` : ""}
${site.analytics.cloudflareToken ? `<script>window.__TP_ANALYTICS=${jsonScript({ cloudflareToken: site.analytics.cloudflareToken })};</script>` : ""}
<script>${js}</script>
</body>
</html>`;
}

module.exports = {
  page,
  header,
  footer,
  adSlot,
  esc,
  stripTags,
  breadcrumbLd,
  faqLd,
  TOOLS,
  LEGAL_PAGES,
  site
};
