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

## No money for a domain yet? Start on GitHub Pages

**Adsterra accepts free subdomains.** Their own blog states that they verify
and accept Blogger and WordPress subdomains, which is unusual — AdSense does
not. So `yourname.github.io` is a legitimate starting point, and it costs
nothing.

There is one hard requirement, and getting it wrong breaks everything.

### Name the repository `yourname.github.io`

GitHub Pages serves two kinds of repository:

| Repository name | Site URL | Works here? |
|---|---|---|
| `yourname.github.io` | `https://yourname.github.io/` | **Yes** |
| anything else | `https://yourname.github.io/reponame/` | **No** |

The second form puts the site in a subdirectory. Every internal link on this
site is root-relative (`/tools/word-counter.html`), so on a project repository
all 1,100 of them point outside the site and 404. Worse, `ads.txt` would live
at `/reponame/ads.txt`, and ad networks only ever read `/ads.txt` at the root —
so Adsterra could never verify you.

`github.io` is on the Public Suffix List, which means `yourname.github.io` is
treated as its own root domain. Name the repository correctly and `ads.txt`
lands exactly where the crawler looks. Tested and confirmed: every page,
`ads.txt`, `sitemap.xml` and `robots.txt` return 200 with no code changes.

### Setting it up

1. Create a repository named exactly `yourname.github.io`, public.
2. Push this code to `main`.
3. **Settings → Pages → Source: GitHub Actions.**
4. **Settings → Secrets and variables → Actions → Variables** tab:
   - `SITE_URL` = `https://yourname.github.io`
   - `CONTACT_EMAIL` = your email
   - `PUBLISHER_NAME` = your name
5. Push. `.github/workflows/deploy.yml` runs the tests, builds, and publishes.

Ad snippets go in the **Secrets** tab, not Variables, once Adsterra approves
you. Same protection as Cloudflare environment variables: they never enter the
repository.

### What you give up

- **`_redirects` and `_headers` do not work.** Extensionless URLs
  (`/tools/word-counter`) will not resolve, and the security headers are not
  applied. The site is built so that neither matters — every link already
  includes `.html`, and a test enforces that.
- **A `.github.io` address looks less professional**, and Adsterra says so
  plainly: free subdomains "don't seem credible", like an email ending in
  @gmail. It is a real disadvantage at review time, not a fake one.
- **You cannot move the domain later without losing rankings.** Redirects from
  `github.io` are not possible; you would start the SEO over.

### The honest recommendation

Deploy to GitHub Pages now, publish articles, get indexed, build traffic. Buy
the `.com` when you can afford it — around $10 for the first year — and move
before you apply to Adsterra, or shortly after. A domain plus a month of real
traffic converts far better at review than a fresh `.github.io`.

If money is genuinely tight, applying from `yourname.github.io` is still worth
doing. Adsterra's own documentation says they accept subdomains, and the
downside of a rejection is that you reapply later from the paid domain.

---

## What you have to do

### 1. Before applying

**Deploy the site.** Adsterra reviews a live site, not a repository. Either
GitHub Pages (free, see above) or Cloudflare Pages with build command
`npm run build` and output directory `dist`.

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
**Banner** (728×90, or 320×50 if you prefer mobile-first).

The easiest way to handle the snippets is `npm run admin` → the **Ads** tab.
It checks each one as you paste, tells you which unit it thinks the code is
for, and shows what the built site would actually serve. Then copy the same
values into the Cloudflare environment variables — the panel writes a local
`.env`, which the live build does not read:

```
ADS_POPUNDER     the Popunder snippet
ADS_SOCIAL_BAR   the Social Bar snippet
ADS_BANNER       the Banner snippet
ADS_TXT          the line from Websites → ads.txt
```

#### If the banner code contains `document.write`

Adsterra still hands out banner code in this older form:

```
document.write('<scr' + 'ipt src="http' + (...) + '://.../invoke.js"></scr' + 'ipt>');
```

Do not paste that as-is. Ads here load only after a visitor clicks Accept,
which is always after the page has finished loading — and `document.write` on
a finished page implicitly calls `document.open()`, which **erases the entire
page**. The visitor sees a blank screen where the tool used to be.

The admin panel detects this and offers a rewritten version that loads the
same ad safely. If you are setting the variable by hand instead, convert it
yourself: keep the `atOptions` block exactly as it is, delete the
`document.write(...)` line, and add the script tag it was building:

```html
<script async src="//www.example-host.com/YOUR_KEY/invoke.js"></script>
```

Order matters — `atOptions` has to run before `invoke.js` reads it. Leave the
protocol off (`//`) so it follows the page instead of forcing `http`.

Redeploy. Then verify:

1. Open the site in a private window. The consent bar appears and **no ad
   loads**.
2. Click **Decline**. Nothing loads; every tool still works.
3. Open another private window, click **Accept**. The banner fills its slot,
   and the popunder and Social Bar arrive a couple of seconds later.
4. Visit `https://yourdomain.com/ads.txt` and confirm it shows your real line,
   not the placeholder comment.

Locally, `npm run admin` → **Ads** → *What the built site serves* answers the
same questions against `dist/` without a deploy. It is worth checking there
first: the most common failure is saving a snippet and forgetting to rebuild,
which looks identical to everything working.

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
