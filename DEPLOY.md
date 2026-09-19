# Going live on a free subdomain

This is the whole path from here to a working public site, on
`toolpeak.pages.dev`, at no cost and with no domain purchase.

Everything the build needs is already committed. There are no values to fill
in before the first deploy — the contact email and the site URL are baked in
as defaults, so a fresh clone builds the finished site.

---

## Why Cloudflare Pages and not GitHub Pages

Both are free. Cloudflare is the better choice here for one specific reason,
and it is worth understanding before you pick.

The site serves an `ads.txt` file at its root. Ad networks read that file to
confirm you are allowed to sell ads on the domain, and crawlers look for it at
the **registrable root** of the address — not in a subfolder.

| Host | Address | `ads.txt` reachable? |
|---|---|---|
| Cloudflare Pages | `toolpeak.pages.dev/` | yes |
| GitHub Pages, repo named `mehedi00975.github.io` | `mehedi00975.github.io/` | yes |
| GitHub Pages, repo named `toolpeak` | `mehedi00975.github.io/toolpeak/` | **no** |

Your repository is called `toolpeak`, so GitHub Pages would serve it from a
subfolder — the third row. Every link on the site would 404 and `ads.txt`
would be unreachable. Fixing that means creating a second repository named
exactly `mehedi00975.github.io`, which I do not have permission to do from
here.

Cloudflare Pages has no such rule: it gives every project its own subdomain,
so the site lands at the root either way. It also supports `_headers` and
`_redirects`, which this site ships and GitHub Pages ignores.

Use Cloudflare. It is about five minutes of clicking.

---

## Deploying

### 1. Create the project

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) — free, no
   card needed.
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorize GitHub and pick the **`mehedi00975/toolpeak`** repository.

### 2. Build settings

| Field | Value |
|---|---|
| Production branch | `main` |
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(leave empty)* |

Nothing else. No environment variables are needed for the first deploy.

### 3. Save and Deploy

The first build takes about a minute. When it finishes the site is live at
`https://toolpeak.pages.dev` — or at `https://<something>.pages.dev` if that
name was taken, in which case Cloudflare tells you the name it used.

**If your address is not `toolpeak.pages.dev`,** set it so links and the
sitemap point at the right place: Pages project → **Settings** →
**Variables and Secrets** → add `SITE_URL` with your actual address (no
trailing slash), then **Deployments** → **Retry deployment**.

### 4. Check it worked

Open these and confirm each one loads:

- `https://toolpeak.pages.dev/` — the home page
- `https://toolpeak.pages.dev/tools/word-counter.html` — type in it; the count
  should update as you type
- `https://toolpeak.pages.dev/ads.txt` — a comment placeholder for now, which
  is correct until Adsterra approves you
- `https://toolpeak.pages.dev/sitemap.xml` — 29 URLs

A cookie bar appears on the first visit. Accept and Decline both work; no ads
load either way, because no ad code is configured yet.

---

## After it is live

### Submit to search engines, the same day

Indexing takes weeks, so this is the one thing worth doing immediately.

**Google Search Console** — [search.google.com/search-console](https://search.google.com/search-console)

1. Add property → **URL prefix** → `https://toolpeak.pages.dev`
2. Verify with the **HTML tag** method. Copy the `content="..."` value.
3. Put it in Cloudflare: **Settings** → **Variables and Secrets** →
   `GOOGLE_SITE_VERIFICATION` = that value. Retry the deployment, then press
   Verify.
4. **Sitemaps** → submit `sitemap.xml`.

**Bing Webmaster Tools** — [bing.com/webmasters](https://www.bing.com/webmasters)

You can import straight from Search Console, which is fastest. Otherwise the
same flow with `BING_SITE_VERIFICATION`. Bing also feeds DuckDuckGo and Yahoo.

### Then write

The site has 22 pages. The plan calls for 60 within three months — 38 more
articles, roughly one a week. `npm run admin` → **Write** is the easiest way;
it saves a correctly shaped file and warns if you have fewer than four FAQs.

### Applying to Adsterra

Not yet. Wait until:

- the site has been live **4–6 weeks** (Adsterra prefers 1–3 months of age)
- Google has indexed it — check `site:toolpeak.pages.dev` in Google
- there are **25–30 pages**, so roughly 8–12 more articles

Adsterra does accept free subdomains, but a `.com` reads as more credible to a
reviewer. If the site is getting real visitors by then, a domain costs about
$10 a year and is worth it. Moving is one variable change plus a DNS record —
nothing in the repository needs editing.

When you are approved, `ADSTERRA.md` covers the ad setup, including the
`document.write` trap in their banner code.

---

## Changing the email or the site name later

They are defaults in `site.config.js`, and any environment variable overrides
a default without touching the code:

| Variable | Changes |
|---|---|
| `SITE_URL` | canonical links, sitemap, RSS, Open Graph |
| `CONTACT_EMAIL` | the Contact page and the Privacy Policy |
| `PUBLISHER_NAME` | the copyright line and structured data |

Set them in Cloudflare → **Settings** → **Variables and Secrets**, then retry
the deployment. Locally, `npm run admin` → **Settings** does the same thing
for your own machine only.
