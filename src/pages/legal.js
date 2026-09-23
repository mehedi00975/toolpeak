/**
 * legal.js — About, Contact, Privacy Policy and Terms.
 *
 * Ad networks (Adsterra included) reject sites that lack these, and the
 * Privacy Policy in particular must name the ad partner and mention cookies.
 * Written as plain prose rather than boilerplate so a human reviewer can tell
 * a real person wrote it.
 */

const site = require("../../site.config.js");

const EMAIL = site.email;
const NAME = site.name;

module.exports = [
  /* ------------------------------------------------------------------ */
  {
    slug: "about",
    title: "About " + NAME,
    h1: "About " + NAME,
    description:
      "Who runs " + NAME + ", why the tools are free, and how a site with no accounts and no uploads pays for itself.",
    body: `
<p class="lede">${NAME} is a small collection of everyday web tools that do one thing each, do it immediately, and never ask you to sign up.</p>

<h2>Why this site exists</h2>
<p>Search for something as ordinary as "compress image to 200 KB" and you land on a page that wants your email address, shows six ads before the tool, uploads your photo to a server in a country you did not choose, and then watermarks the result. The actual work — resizing an image — takes about fifteen milliseconds in the browser you already have open.</p>
<p>${NAME} is the opposite of that. Every tool here runs locally in your browser. There is no account, no upload, no usage limit, no premium tier and no watermark. Open a page, use the tool, close the tab.</p>

<h2>How the tools work</h2>
<p>Each page is a single self-contained HTML file with its CSS and JavaScript inlined. When you type into the word counter, the counting happens on your device. When you compress a photo, your browser's canvas API does the encoding and the file is created in memory for you to download. When you generate a QR code, the pattern is computed from the specification right there in the page.</p>
<p>The practical consequences matter more than the technical detail:</p>
<ul>
  <li><strong>Your data stays yours.</strong> Text, photos, passwords and dates of birth never cross the network, because there is no server to send them to.</li>
  <li><strong>It is fast.</strong> No round trip means results appear as you type rather than after a spinner.</li>
  <li><strong>It works offline.</strong> Once a page has loaded, you can disconnect entirely and the tool keeps working.</li>
</ul>

<h2>How it stays free</h2>
<p>${NAME} is funded by advertising, and the whole site is built around keeping that as light as possible. Each page carries at most one banner inside the content, one popunder and one social bar — never a stack of six banners, never an interstitial that blocks the tool, never anything that plays sound.</p>
<p>Ads also load only after you agree to them. Click Decline on the cookie bar and no advertising script is loaded at all; every tool continues to work exactly the same way. That is a deliberate choice, and it costs real revenue.</p>
<p>The reason is simple self-interest as much as principle: a page that buries its tool under advertising gets abandoned, and an abandoned page earns nothing anyway.</p>

<h2>Who builds it</h2>
<p>${NAME} is an independent project, not a company. It is maintained by one developer who kept needing these tools and kept being annoyed by the available options. Tools are added when there is a genuinely better version to build, not to inflate a directory listing.</p>
<p>If a tool gives you a wrong answer, that is a bug worth reporting and it will be fixed. Email <a href="mailto:${EMAIL}">${EMAIL}</a> and include what you entered and what you expected.</p>

<h2>Accuracy and limits</h2>
<p>The calculators use standard published formulas, and the underlying logic is covered by an automated test suite that runs on every change. Even so, results are for general information only. The BMI calculator is a screening tool and not medical advice; the age calculator follows the common Western convention for February 29 birthdays, which differs by jurisdiction. For anything with legal, financial or medical consequences, confirm with a qualified professional.</p>

<h2>Get in touch</h2>
<p>Bug reports, corrections and suggestions for new tools are all welcome at <a href="mailto:${EMAIL}">${EMAIL}</a>. See the <a href="/contact.html">contact page</a> for what to include and how long a reply usually takes.</p>`
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "contact",
    title: "Contact",
    h1: "Contact",
    description:
      "Get in touch with " + NAME + " about a bug, a correction, a tool suggestion or an advertising question. Real email address, real replies.",
    body: `
<p class="lede">One inbox, read by a person. No ticket system, no chatbot.</p>

<div class="card">
  <h2 style="margin-top:0">Email</h2>
  <p style="font-size:1.2rem;font-weight:650"><a href="mailto:${EMAIL}">${EMAIL}</a></p>
  <p class="muted" style="margin-bottom:0">Replies usually go out within two to three business days. If your message needs a code change, it may take longer — but you will get an acknowledgement either way.</p>
</div>

<h2>What to write about</h2>

<h3>A tool gave a wrong answer</h3>
<p>This is the most useful email you can send. Please include the exact values you entered, the result you got, the result you expected, and your browser and device if you know them. A wrong calculation is treated as a priority fix.</p>

<h3>Suggesting a new tool</h3>
<p>Tell us what you were trying to do and what you use at the moment. The most useful suggestions describe a real task rather than just naming a tool — knowing that you need to check image dimensions before a print order is far more actionable than "add an image tool".</p>

<h3>Something is broken or unreadable</h3>
<p>Layout problems on unusual screen sizes, buttons that do not respond, text that overlaps, or anything that fails with a screen reader. Include your device and browser. Accessibility issues are treated as bugs, not enhancements.</p>

<h3>Advertising and business enquiries</h3>
<p>Advertising on ${NAME} is handled through a third-party network. Direct placement enquiries, sponsorship and partnership proposals can be sent to the same address. Note that guest posts, paid backlinks and "content collaboration" offers are declined as a matter of policy — please do not send them.</p>

<h3>Privacy requests</h3>
<p>Requests relating to your data under GDPR, UK GDPR or CCPA can be sent to the same address. As explained in the <a href="/privacy-policy.html">privacy policy</a>, the tools themselves do not collect or store personal data, so in most cases there is nothing held to export or delete. Requests are answered within 30 days.</p>

<h2>Before you email</h2>
<p>A few questions arrive often enough to answer here:</p>
<ul>
  <li><strong>"Do you store what I paste?"</strong> No. Every tool runs in your browser; nothing is transmitted or logged.</li>
  <li><strong>"Can I use these tools commercially?"</strong> Yes, including the QR codes and compressed images. No attribution required.</li>
  <li><strong>"Is there an API?"</strong> Not at present. The tools are designed to run client-side, which is precisely what makes a server API unnecessary.</li>
  <li><strong>"Why do I see an ad?"</strong> Advertising pays for hosting and development. Decline the cookie bar and you will not see personalized ads; the tools work identically either way.</li>
</ul>`
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    h1: "Privacy Policy",
    description:
      "How " + NAME + " handles data: tools run in your browser and store nothing. Third-party advertising through Adsterra may use cookies. Your choices explained.",
    body: `
<p class="muted"><strong>Last updated:</strong> <span id="pp-date">7 September 2026</span></p>

<p class="lede">Short version: the tools on this site run entirely in your browser and send nothing anywhere. The one exception is third-party advertising, which you can decline in a single click.</p>

<h2>1. Who we are</h2>
<p>${NAME} ("we", "us") operates the website at <a href="${site.url}">${site.url}</a>. For any privacy question or request, contact <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>

<h2>2. What the tools do with your data</h2>
<p>Nothing leaves your device. Every calculator, converter and generator on this site is implemented in JavaScript that is delivered as part of the page and executed by your browser.</p>
<p>Concretely, that means:</p>
<ul>
  <li>Text you paste into the word counter, case converter or text comparison tool is processed in your browser's memory and discarded when you close the tab.</li>
  <li>Images you add to the image compressor are decoded and re-encoded locally using the browser's canvas API. <strong>They are never uploaded.</strong></li>
  <li>Passwords generated or checked here are produced on your device and never transmitted.</li>
  <li>Dates of birth, heights, weights and other values you enter into calculators exist only in the page while it is open.</li>
</ul>
<p>There is no database, no file storage and no server-side logging of tool inputs, because the tools never contact a server in the first place. You can confirm this by loading a page, disconnecting from the internet, and continuing to use it.</p>

<h2>3. Cookies and local storage</h2>
<p>The site itself sets one item of browser local storage: your response to the cookie consent bar, so it does not ask again on every page. It contains only the word "accept" or "decline" and a version number. It is not a tracking identifier and it is never transmitted.</p>
<p>If you accept advertising, our advertising partner may set additional cookies as described below.</p>

<h2>4. Third-party advertising (Adsterra)</h2>
<p><strong>We use Adsterra, a third-party advertising network, to display advertisements on this site. Adsterra and its advertising partners may use cookies, web beacons and similar technologies to serve and measure ads.</strong></p>
<p>When advertising is enabled, Adsterra may collect or receive information including your IP address, browser type and version, device type and operating system, the pages you view on this site, the referring website, and general geographic location derived from your IP address. This information may be used to select which advertisements to show you, to limit how often you see the same advertisement, and to detect fraudulent clicks.</p>
<p>This data is handled by Adsterra under its own privacy policy, which is available at <a href="https://adsterra.com/privacy-policy/" rel="noopener nofollow" target="_blank">adsterra.com/privacy-policy</a>. We do not receive, store or have access to the personal data Adsterra collects, and we do not share any information with them ourselves — the exchange happens directly between your browser and their servers when their script runs.</p>
<p><strong>Advertising scripts do not load until you click Accept on the cookie bar.</strong> If you click Decline, no advertising script is loaded and no advertising cookie is set. Every tool on the site continues to work identically.</p>

<h2>5. Your choices</h2>
<ul>
  <li><strong>Decline advertising.</strong> Click Decline on the cookie bar. Your choice is remembered on this device.</li>
  <li><strong>Change your mind.</strong> Use the button below to clear your stored choice; the bar will appear again on your next page view.</li>
  <li><strong>Block cookies in your browser.</strong> Every major browser can block third-party cookies entirely. The tools here will still work.</li>
  <li><strong>Opt out of interest-based advertising</strong> across many networks at <a href="https://optout.aboutads.info/" rel="noopener nofollow" target="_blank">optout.aboutads.info</a> or <a href="https://www.youronlinechoices.com/" rel="noopener nofollow" target="_blank">youronlinechoices.com</a>.</li>
</ul>
<p><button class="btn ghost" type="button" onclick="if(window.tpResetConsent)window.tpResetConsent()">Reset my cookie choice</button></p>

<h2>6. Analytics</h2>
<p>We do not use Google Analytics. If privacy-friendly aggregate analytics are enabled, they load only after consent and record page-level counts without cookies or cross-site identifiers. No analytics product on this site attempts to identify individual visitors.</p>

<h2>7. Server logs</h2>
<p>The site is hosted on Cloudflare Pages. Like any web host, Cloudflare processes standard request data — IP address, timestamp, requested URL, user agent — for security, abuse prevention and traffic measurement. This is a normal part of serving any website and is governed by Cloudflare's own privacy policy. We do not use these logs to build profiles of visitors.</p>

<h2>8. Children</h2>
<p>This site is not directed at children under 13 and we do not knowingly collect personal information from them. Because the tools collect nothing at all, there is in practice no children's data to protect. Parents with concerns can contact <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>

<h2>9. Your rights</h2>
<p>Depending on where you live, you may have the right to access, correct, delete or port your personal data, or to object to its processing. Under GDPR and UK GDPR that includes the right to lodge a complaint with your data protection authority. Under the CCPA, California residents have the right to know what personal information is collected and to opt out of its sale; we do not sell personal information.</p>
<p>In practice we hold no personal data about you, so there is usually nothing to export or erase. Data collected by Adsterra is subject to Adsterra's own policy, and requests about it should be directed to them. Send any request to <a href="mailto:${EMAIL}">${EMAIL}</a> and we will respond within 30 days.</p>

<h2>10. External links</h2>
<p>Pages here occasionally link to other websites. We are not responsible for their content or privacy practices, and this policy does not apply to them. Advertisements displayed by Adsterra link to third-party sites we do not control or endorse.</p>

<h2>11. Security</h2>
<p>The site is served over HTTPS. Because no personal data is collected or stored on our side, the risk of a data breach exposing your information through this site is minimal by design.</p>

<h2>12. Changes to this policy</h2>
<p>If this policy changes materially — for example if an additional advertising partner is added — the date at the top will be updated and, where the change affects consent, the cookie bar will ask again. Continued use of the site after a change means you accept the revised policy.</p>

<h2>13. Contact</h2>
<p>Questions about this policy: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "terms",
    title: "Terms of Use",
    h1: "Terms of Use",
    description:
      "The terms governing use of " + NAME + ": what you may do with the tools and their output, what is not permitted, and the limits of our liability.",
    body: `
<p class="muted"><strong>Last updated:</strong> 7 September 2026</p>

<p class="lede">Plain-English terms. Use the tools, keep whatever you make with them, do not attack the site.</p>

<h2>1. Agreement</h2>
<p>By using <a href="${site.url}">${site.url}</a> ("the site") you agree to these terms. If you do not agree, please do not use the site.</p>

<h2>2. What the site provides</h2>
<p>${NAME} offers free online utilities including calculators, converters and generators. The tools are provided as-is for general use. No account is required and no fee is charged.</p>

<h2>3. Your content and output</h2>
<p>Anything you enter into a tool remains entirely yours. Because processing happens in your browser, we never receive it and could not claim rights in it even if we wanted to.</p>
<p>Output you create — compressed images, QR codes, generated passwords, converted text — is yours to use for any lawful purpose, including commercial use. No attribution is required and no licence fee applies.</p>

<h2>4. Acceptable use</h2>
<p>You agree not to:</p>
<ul>
  <li>Use the site for anything unlawful, or to produce material that infringes someone else's rights;</li>
  <li>Attempt to gain unauthorized access to the site, its hosting, or any connected system;</li>
  <li>Overwhelm the site with automated requests, scrapers or denial-of-service traffic;</li>
  <li>Generate QR codes or other output intended to deceive people, distribute malware, or facilitate fraud;</li>
  <li>Interfere with or artificially inflate the advertising on the site, including clicking your own ads or using automated traffic. This is also a violation of our advertising partner's terms.</li>
</ul>

<h2>5. No warranty</h2>
<p>The site and its tools are provided "as is" and "as available", without warranty of any kind, express or implied, including any implied warranty of merchantability, fitness for a particular purpose, accuracy or non-infringement.</p>
<p>We work to keep the calculations correct and test them automatically, but we do not warrant that results are error-free, nor that the site will be uninterrupted or available at any particular time.</p>

<h2>6. Not professional advice</h2>
<p>Nothing on this site is professional advice. In particular:</p>
<ul>
  <li>The <strong>BMI calculator</strong> is a general screening tool. It is not a diagnosis and cannot account for muscle mass, body composition or medical history. Consult a qualified healthcare professional about your health.</li>
  <li>The <strong>age calculator</strong> follows the common Western convention for 29 February birthdays. Legal age thresholds vary by jurisdiction; check the rule that applies to you.</li>
  <li>The <strong>percentage calculator</strong> performs arithmetic only. It is not financial or tax advice.</li>
  <li>The <strong>password generator</strong> produces cryptographically random values but cannot guarantee the security of any account. Security also depends on the service you use and on your own practices.</li>
</ul>
<p>Verify anything with real consequences with a qualified professional before acting on it.</p>

<h2>7. Limitation of liability</h2>
<p>To the fullest extent permitted by law, ${NAME} and its operator are not liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits, data or goodwill, arising from your use of or inability to use the site.</p>
<p>Where liability cannot be excluded by law, it is limited to the amount you have paid to use the site, which is zero.</p>

<h2>8. Advertising</h2>
<p>The site displays advertisements supplied by a third-party network. We do not select individual advertisements and do not endorse advertised products or services. Any dealing between you and an advertiser is solely between you and them. Advertising is loaded only after you consent; see the <a href="/privacy-policy.html">privacy policy</a>.</p>

<h2>9. Intellectual property</h2>
<p>The site's design, text and source code are owned by ${NAME} and protected by copyright. You may not copy substantial portions of the site's written content or reproduce it as your own. This restriction does not apply to output you generate with the tools, which is yours.</p>

<h2>10. External links</h2>
<p>Links to third-party sites are provided for convenience. We do not control them and are not responsible for their content, accuracy or practices.</p>

<h2>11. Availability and changes</h2>
<p>We may modify, suspend or discontinue any part of the site at any time without notice. Tools may be added, changed or removed. We aim not to break things people rely on, but no continuity is guaranteed.</p>

<h2>12. Changes to these terms</h2>
<p>These terms may be updated from time to time. The date at the top reflects the most recent revision, and continued use of the site after a change constitutes acceptance of the revised terms.</p>

<h2>13. Severability</h2>
<p>If any provision of these terms is found unenforceable, the remaining provisions continue in full effect.</p>

<h2>14. Contact</h2>
<p>Questions about these terms: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`
  }
];
