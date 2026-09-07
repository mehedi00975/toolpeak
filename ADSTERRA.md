# Adsterra: getting approved and staying approved

Everything the site already does, what you still have to do by hand, and the
things that get accounts closed.

---

## Where the site stands

These are checked automatically by `npm test`, so they cannot quietly regress.

| Requirement | Status | Enforced by |
|---|---|---|
| Site is functional, no dead links | 30 pages, every internal link resolves | `build.test.js` |
| Substantial original content | 30 pages, 318–1,442 words each | `build.test.js` |
| At least 15–20 real pages | 10 tools + 12 guides + 4 policy + index pages | `build.test.js` |
| Privacy Policy naming the ad partner | Names Adsterra, cookies, GDPR, CCPA, COPPA | `build.test.js` |
| About page | Who runs it and why it is free | `build.test.js` |
| Contact page with a working email | `mailto:` link, no contact form | `build.test.js` |
| Terms of Use | Present | `build.test.js` |
| Not an ad farm | Hard ceiling of 3 units per page | `consent.test.js`, `ad-integration.test.js` |
| No interstitials, no sound | Neither exists in the codebase | `consent.test.js` |
| Mobile responsive | Viewport meta on every page, mobile-first CSS | `build.test.js` |
| Fast loading | 17–33 KB gzipped per page, no external requests | `build.test.js` |
| Cookie consent for UK/EU | Accept and Decline, one click, no scroll lock | `consent.test.js` |
| `ads.txt` reachable | Always generated, valid IAB format | `ad-integration.test.js` |
| Ad snippets not in the repo | Injected from environment variables | `config.test.js` |

The three ad formats are wired and tested against the exact snippet shapes the
Adsterra dashboard emits, including the banner's two-part
`atOptions` + `invoke.js` pattern that fails silently if the inline script is
not executed properly.

---

## What you have to do

### 1. Before applying

**Buy the domain and deploy.** Adsterra reviews a live site, not a repository.
Cloudflare Pages, build command `npm run build`, output directory `dist`.

**Set these environment variables** in the Pages dashboard:

```
SITE_URL         https://yourdomain.com
CONTACT_EMAIL    an address you actually read
PUBLISHER_NAME   your name or business name
```

Leave the `ADS_*` variables empty for now. The site builds and runs perfectly
without them — no ad code, no empty slots, no broken layout.

**Use an email on your own domain.** `you@yourdomain.com` reads as more
credible during review than a free mailbox, and Cloudflare Email Routing
forwards it to Gmail for free. This is a small thing that costs nothing.

**Let the site sit for a few weeks.** Approval odds improve markedly for
domains that are not brand new and that already have some real visitors.
Submitting to Search Console the day you deploy and applying to Adsterra a
month later is a better sequence than applying immediately.

### 2. Applying

Register at `publishers.adsterra.com`. When it asks for traffic numbers, give
your real ones. There is no minimum, and inflated figures are checked against
actual performance later.

Describe the site accurately: free browser-based utilities, English language,
mostly US and UK visitors, traffic from organic search.

Review usually takes 1–2 business days.

### 3. After approval

Create three ad units in the dashboard: **Popunder**, **Social Bar**, and one
**Banner** (728×90, or 320×50 if you prefer mobile-first). Copy each snippet
verbatim, including the `<script>` tags, into the Cloudflare environment
variables:

```
ADS_POPUNDER     the Popunder snippet
ADS_SOCIAL_BAR   the Social Bar snippet
ADS_BANNER       the Banner snippet
ADS_TXT          the line from Websites → ads.txt
```

Redeploy. Then verify:

1. Open the site in a private window. The consent bar appears and **no ad
   loads**.
2. Click **Decline**. Nothing loads; every tool still works.
3. Open another private window, click **Accept**. The banner fills its slot,
   and the popunder and Social Bar arrive a couple of seconds later.
4. Visit `https://yourdomain.com/ads.txt` and confirm it shows your real line,
   not the placeholder comment.

### 4. Getting indexed

- **Google Search Console** — add the property, verify by DNS, submit
  `https://yourdomain.com/sitemap.xml`.
- **Bing Webmaster Tools** — same, and it feeds DuckDuckGo and Yahoo too.
- **Pinterest** — claim the domain before you start pinning. Claimed domains
  put your logo on every pin that links back.

---

## Things that will close the account

Adsterra withholds the balance when it catches these, so the cost is not just
the account.

- **Clicking your own ads.** Including "just to check it works". Verify with the
  steps above instead, which never involve clicking an ad.
- **Asking anyone else to click.** Friends, family, groups.
- **Traffic exchanges, paid-to-click, autosurf, bots.** All detectable, all
  fatal.
- **Buying traffic** from anywhere that cannot show you real referrers.
- **Republishing other people's writing.** Every page here must stay original.
- **Adding more ad units** than the three configured. The build cannot produce a
  fourth, and that limit is deliberate.

The pattern that works is slow and boring: pages that answer real questions,
indexed properly, shared where the audience already is.

---

## Traffic, realistically

The first three months are about existing at all. New domains sit in a
sandbox — pages get indexed but rank poorly regardless of quality, and there is
nothing to do about it except keep publishing.

A sensible rhythm:

- **One article a week.** `npm run new-post -- "Title"` scaffolds it.
- **Target phrases people actually type.** `mm to inches`,
  `what is 20 percent of 150`, `how many words in a 5 minute speech`. Long,
  specific, low-competition. Not `best calculator`.
- **Every article links to the tool that does the job.** That is what turns a
  reader into a returning user.
- **5–10 Pinterest pins per article**, spread over weeks rather than posted at
  once. Pinterest sends cheap US and UK traffic and, unlike social feeds,
  keeps sending it for months.

Twelve guides exist. Forty more over the next year is roughly one a week.

---

## Diagnosing a problem

**Ads do not appear after accepting.** Check the environment variables are set
in the right Pages environment (Production, not Preview), and that you
redeployed after setting them. The build log prints which ad units it found.

**The banner slot is empty but the popunder works.** The banner's inline
`atOptions` script did not run, or `invoke.js` loaded before it. This is tested
in `ad-integration.test.js`; run `npm test` and check that suite.

**`ads.txt` shows the placeholder.** `ADS_TXT` is unset or set in the wrong
environment.

**Revenue is near zero despite traffic.** Look at where the traffic is from.
US, UK, Canada and Australia pay several times what other regions do. This is
also why the content targets US and UK searches specifically.
