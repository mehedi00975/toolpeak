module.exports = {
  slug: "qr-code-generator",
  title: "QR Code Generator — Free PNG & SVG",
  h1: "QR Code Generator",
  description:
    "Create a free QR code for a link, Wi-Fi network, email, phone number, SMS or contact card. Download PNG or SVG. No watermark, no expiry, no tracking.",
  keywords: "qr code generator, free qr code, wifi qr code generator, qr code png download, vcard qr code, qr code svg",

  tool: `
<div class="card" id="qr-tool">
  <p class="lbl">What should the code contain?</p>
  <div class="checks" role="radiogroup" aria-label="QR code type">
    <label><input type="radio" name="qr-type" value="url" checked> Link</label>
    <label><input type="radio" name="qr-type" value="text"> Plain text</label>
    <label><input type="radio" name="qr-type" value="wifi"> Wi-Fi</label>
    <label><input type="radio" name="qr-type" value="email"> Email</label>
    <label><input type="radio" name="qr-type" value="phone"> Phone</label>
    <label><input type="radio" name="qr-type" value="sms"> SMS</label>
    <label><input type="radio" name="qr-type" value="vcard"> Contact card</label>
  </div>

  <div data-qr-panel="url">
    <label class="lbl" for="qr-url">Website address</label>
    <input type="url" id="qr-url" value="https://toolpeak.com" placeholder="https://example.com" autocomplete="off">
  </div>

  <div data-qr-panel="text" hidden>
    <label class="lbl" for="qr-text">Text</label>
    <textarea id="qr-text" style="min-height:110px" placeholder="Any text you want encoded."></textarea>
  </div>

  <div data-qr-panel="wifi" hidden>
    <div class="fields">
      <div>
        <label class="lbl" for="qr-wifi-ssid">Network name (SSID)</label>
        <input type="text" id="qr-wifi-ssid" autocomplete="off">
      </div>
      <div>
        <label class="lbl" for="qr-wifi-pass">Password</label>
        <input type="text" id="qr-wifi-pass" autocomplete="off">
      </div>
      <div>
        <label class="lbl" for="qr-wifi-enc">Security</label>
        <select id="qr-wifi-enc">
          <option value="WPA">WPA / WPA2 / WPA3</option>
          <option value="WEP">WEP (legacy)</option>
          <option value="nopass">Open (no password)</option>
        </select>
      </div>
    </div>
    <div class="checks">
      <label><input type="checkbox" id="qr-wifi-hidden"> Hidden network</label>
    </div>
  </div>

  <div data-qr-panel="email" hidden>
    <div class="fields">
      <div>
        <label class="lbl" for="qr-email">To</label>
        <input type="email" id="qr-email" placeholder="name@example.com" autocomplete="off">
      </div>
      <div>
        <label class="lbl" for="qr-email-subject">Subject</label>
        <input type="text" id="qr-email-subject" autocomplete="off">
      </div>
    </div>
    <label class="lbl" for="qr-email-body">Message</label>
    <textarea id="qr-email-body" style="min-height:80px"></textarea>
  </div>

  <div data-qr-panel="phone" hidden>
    <label class="lbl" for="qr-phone">Phone number</label>
    <input type="tel" id="qr-phone" placeholder="+1 555 123 4567" autocomplete="off">
  </div>

  <div data-qr-panel="sms" hidden>
    <div class="fields">
      <div>
        <label class="lbl" for="qr-sms">Phone number</label>
        <input type="tel" id="qr-sms" placeholder="+1 555 123 4567" autocomplete="off">
      </div>
      <div>
        <label class="lbl" for="qr-sms-msg">Message</label>
        <input type="text" id="qr-sms-msg" autocomplete="off">
      </div>
    </div>
  </div>

  <div data-qr-panel="vcard" hidden>
    <div class="fields">
      <div><label class="lbl" for="qr-vc-first">First name</label><input type="text" id="qr-vc-first" autocomplete="off"></div>
      <div><label class="lbl" for="qr-vc-last">Last name</label><input type="text" id="qr-vc-last" autocomplete="off"></div>
      <div><label class="lbl" for="qr-vc-org">Organization</label><input type="text" id="qr-vc-org" autocomplete="off"></div>
      <div><label class="lbl" for="qr-vc-title">Job title</label><input type="text" id="qr-vc-title" autocomplete="off"></div>
      <div><label class="lbl" for="qr-vc-phone">Phone</label><input type="tel" id="qr-vc-phone" autocomplete="off"></div>
      <div><label class="lbl" for="qr-vc-email">Email</label><input type="email" id="qr-vc-email" autocomplete="off"></div>
      <div><label class="lbl" for="qr-vc-url">Website</label><input type="url" id="qr-vc-url" autocomplete="off"></div>
    </div>
  </div>

  <hr>

  <div class="qr-stage" id="qr-stage" aria-live="polite">
    <p class="muted small">Your QR code will appear here.</p>
  </div>
  <p class="hint center" id="qr-meta"></p>
  <p class="note err" id="qr-error" hidden></p>

  <div class="btnrow center" style="justify-content:center">
    <button class="btn" type="button" data-qr="download-png" disabled>Download PNG</button>
    <button class="btn ghost" type="button" data-qr="download-svg" disabled>Download SVG</button>
  </div>

  <hr>

  <div class="fields">
    <div>
      <label class="lbl" for="qr-ecl">Error correction</label>
      <select id="qr-ecl">
        <option value="L">L &mdash; 7% recovery, smallest code</option>
        <option value="M" selected>M &mdash; 15% recovery (recommended)</option>
        <option value="Q">Q &mdash; 25% recovery</option>
        <option value="H">H &mdash; 30% recovery, best for print</option>
      </select>
    </div>
    <div>
      <label class="lbl" for="qr-size">Size: <span id="qr-size-v">320 px</span></label>
      <input type="range" id="qr-size" min="120" max="800" step="20" value="320">
    </div>
    <div>
      <label class="lbl" for="qr-margin">Quiet zone</label>
      <select id="qr-margin">
        <option value="4" selected>4 modules (standard)</option>
        <option value="2">2 modules (tight)</option>
        <option value="0">None</option>
      </select>
    </div>
    <div>
      <label class="lbl" for="qr-dark">Foreground</label>
      <input type="color" id="qr-dark" value="#000000" style="height:42px;padding:.2rem">
    </div>
    <div>
      <label class="lbl" for="qr-light">Background</label>
      <input type="color" id="qr-light" value="#ffffff" style="height:42px;padding:.2rem">
    </div>
  </div>
</div>`,

  intro: `
<p class="lede">Make a QR code for a link, a Wi-Fi network, an email, a phone number or a contact card. Download it as a PNG for screens or an SVG for print. No watermark, no account, no expiry date — and the code is generated on your device, so nothing you encode is ever transmitted.</p>`,

  content: `
<h2>How to make a QR code</h2>
<ol class="steps">
  <li><strong>Choose the type.</strong> A link is the most common, but Wi-Fi and contact cards save far more typing for whoever scans it.</li>
  <li><strong>Fill in the fields.</strong> The preview updates as you type.</li>
  <li><strong>Adjust if needed.</strong> Raise the error correction level for anything that will be printed, and increase the size for anything scanned from a distance.</li>
  <li><strong>Download.</strong> PNG for screens, email and social posts; SVG for print, because it stays sharp at any size.</li>
  <li><strong>Test it before you use it</strong> with at least two different phones.</li>
</ol>

<h2>Static codes never expire</h2>
<p>Every code made here is <strong>static</strong>: the data is encoded directly into the pattern. There is no redirect, no short link and no account, which means the code cannot stop working because a service shut down, and no one collects scan analytics on you. The trade-off is that a static code cannot be edited after printing — if the destination changes, you need a new code.</p>
<p>Many "free" QR generators produce dynamic codes that route through their own domain. Those can expire, start showing ads, or move behind a paywall after you have printed a thousand flyers. If a generator asks you to sign up, that is usually why.</p>

<h2>Error correction levels</h2>
<p>QR codes include Reed-Solomon error correction, so a damaged or partly obscured code still scans. You choose how much redundancy to add.</p>
<div class="table-scroll">
<table>
  <thead><tr><th>Level</th><th>Recoverable damage</th><th>Use it for</th></tr></thead>
  <tbody>
    <tr><td>L</td><td>About 7%</td><td>Clean digital display, long URLs where size matters</td></tr>
    <tr><td>M</td><td>About 15%</td><td>General purpose &mdash; the sensible default</td></tr>
    <tr><td>Q</td><td>About 25%</td><td>Business cards, packaging, anything handled often</td></tr>
    <tr><td>H</td><td>About 30%</td><td>Outdoor signage, stickers, codes with a logo overlaid</td></tr>
  </tbody>
</table>
</div>
<p>Higher correction means more modules, so the code becomes denser at the same physical size. For print, level Q or H is worth the extra density.</p>

<h2>Sizing a code for print</h2>
<p>The practical rule is that the code should be at least one tenth of the scanning distance. A code read from 30 cm away needs to be about 3 cm across; one on a poster read from 3 m needs roughly 30 cm. Below about 2 cm, phone cameras start to struggle regardless of resolution.</p>
<p>Keep the quiet zone — the blank margin around the code. Scanners use it to find the code's boundary, and cropping it off is the single most common reason a printed code fails. Four modules of margin is the standard, and it is the default here.</p>

<h2>Wi-Fi codes are the underrated one</h2>
<p>A Wi-Fi QR code lets a guest join your network by pointing a camera at a card on the counter. It works natively on iOS and Android with no app. Print one for a café, an office guest network, or a holiday rental and you will never read out a 20-character password again. Choose WPA for any modern router; WEP only exists for hardware that should have been replaced a decade ago.</p>

<h2>Contrast and color</h2>
<p>Scanners look for dark modules on a light background. You can recolor a code, but keep strong contrast and never invert it — a light pattern on a dark background fails on many older scanners. Avoid gradients across the modules, and if you overlay a logo, keep it under about 20 percent of the area and use error correction level H so the covered modules can be reconstructed.</p>`,

  faqs: [
    {
      q: "Do these QR codes expire?",
      a: "<p>No. Every code generated here is static, meaning the data is encoded directly into the pattern with no redirect service in between. It will keep working for as long as QR codes exist, whether or not this site does.</p>"
    },
    {
      q: "Can I use these QR codes commercially?",
      a: "<p>Yes. There is no watermark, no attribution requirement and no licence fee. Use them on packaging, menus, business cards, signage or anything else. The QR code specification itself is an open ISO standard.</p>"
    },
    {
      q: "Should I download PNG or SVG?",
      a: "<p>PNG for screens, email and social media. SVG for anything printed, because it is vector and stays perfectly sharp at any size — from a business card to a billboard. If your printer asks for a specific format, SVG is almost always the safer choice.</p>"
    },
    {
      q: "Why is my printed QR code not scanning?",
      a: "<p>The three usual causes are: the quiet zone (white margin) was cropped off, the code was printed too small for the scanning distance, or contrast is too low. Reprint at least 3 cm wide with the full margin, use error correction level Q or H, and keep dark modules on a light background.</p>"
    }
  ],

  related: ["password-generator", "image-compressor", "text-diff"]
};
