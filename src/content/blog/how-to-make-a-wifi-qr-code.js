module.exports = {
  slug: "how-to-make-a-wifi-qr-code",
  title: "How to Make a Wi-Fi QR Code",

  description:
    "A Wi-Fi QR code lets guests join your network by pointing a camera at it. Here is the exact format, how to build one without an app, and why it is safer than reading a password aloud.",

  keywords: "wifi qr code, how to make a wifi qr code, guest wifi qr code, wifi password qr code, share wifi without password",

  date: "2026-10-03",
  readingTime: 5,
  related: ["qr-code-generator", "password-generator", "image-compressor"],

  body: `
<p><strong>A Wi-Fi QR code is just a short line of text in a specific
format.</strong> Encode it as a QR code, and every modern phone camera offers to
join the network when it sees it. No app, no typing, no reading a 20-character
password across a room.</p>

<p>The text looks like this:</p>

<pre><code>WIFI:T:WPA;S:MyNetwork;P:mypassword;;</code></pre>

<p>Four parts, and the semicolons matter:</p>

<ul>
  <li><strong>T</strong> &mdash; security type: <code>WPA</code> covers
  WPA, WPA2 and WPA3. Use <code>WEP</code> only for genuinely old hardware, and
  <code>nopass</code> for an open network.</li>
  <li><strong>S</strong> &mdash; the network name, exactly as it is broadcast,
  including capitals and spaces.</li>
  <li><strong>P</strong> &mdash; the password. Omitted entirely for an open
  network.</li>
  <li><strong>H</strong> &mdash; optional. Add <code>H:true;</code> if the
  network is hidden.</li>
</ul>

<h2>Characters that need escaping</h2>

<p>This is where hand-written Wi-Fi codes usually fail. If your network name or
password contains a semicolon, comma, colon, backslash or double quote, it must
be escaped with a backslash. Otherwise the parser reads it as the end of a field
and the code silently joins the wrong network, or nothing at all.</p>

<div class="table-scroll">
<table>
  <thead><tr><th>Character in your password</th><th>Written in the QR text as</th></tr></thead>
  <tbody>
    <tr><td><code>;</code></td><td><code>\\;</code></td></tr>
    <tr><td><code>,</code></td><td><code>\\,</code></td></tr>
    <tr><td><code>:</code></td><td><code>\\:</code></td></tr>
    <tr><td><code>\\</code></td><td><code>\\\\</code></td></tr>
    <tr><td><code>"</code></td><td><code>\\"</code></td></tr>
  </tbody>
</table>
</div>

<p>A generator handles this for you. If you are typing the payload by hand,
check each special character.</p>

<h2>Making one</h2>

<ol class="steps">
  <li>Find your exact network name. Read it from the router's admin page or from
  your phone's Wi-Fi settings &mdash; not from memory, because
  <code>Smith_Home</code> and <code>Smith Home</code> are different networks.</li>
  <li>Choose the security type. Almost every router made since 2006 uses WPA2 or
  WPA3, both of which take <code>WPA</code>.</li>
  <li>Enter the password exactly, including capitals.</li>
  <li>Generate the code and <strong>test it with a phone that is not already on
  the network</strong>. A phone that has already joined will connect regardless,
  so it proves nothing.</li>
  <li>Download the SVG if you plan to print it. SVG stays sharp at any size;
  a small PNG blown up to poster size will not scan.</li>
</ol>

<div class="note">
  <p><strong>Test properly:</strong> turn Wi-Fi off on the test phone, or use
  someone else's, before scanning. This is the single most common reason a
  printed Wi-Fi code fails in front of guests.</p>
</div>

<h2>Why this is better than a password on a card</h2>

<p>Reading a strong password aloud is miserable, so people choose weak ones that
are easy to dictate. A QR code removes that pressure entirely: the password can
be 30 random characters because nobody will ever type it.</p>

<p>For a cafe, a rental or an office, the sensible pattern is a separate guest
network with its own long password and its own printed code. Rotating it is then
a five-minute job &mdash; change the password, regenerate the code, reprint the
card &mdash; and it never touches the network your own devices use.</p>

<h2>Printing it so it actually scans</h2>

<p>Three things break printed QR codes:</p>

<ul>
  <li><strong>Too small.</strong> Keep the printed code at least 2 cm (0.8 in)
  square for a card someone holds, and 10 cm (4 in) for anything read from
  across a room. The rough rule is that scanning distance is about ten times the
  code's width.</li>
  <li><strong>No quiet zone.</strong> QR codes need a clear margin of about four
  modules on every side. A border or graphic pressed up against the pattern
  stops it being recognized.</li>
  <li><strong>Inverted colors.</strong> Scanners expect dark modules on a light
  background. Light-on-dark works on some phones and fails on others, which is
  the worst outcome because you will not notice during testing.</li>
</ul>

<p>If the code will be laminated or displayed behind glass, raise the error
correction level. Level H tolerates about 30 percent damage, so scratches,
smudges and glare are much less likely to make it unreadable.</p>
`,

  faqs: [
    {
      q: "How do I make a QR code for my Wi-Fi?",
      a: "<p>Encode the text <code>WIFI:T:WPA;S:YourNetwork;P:YourPassword;;</code> as a QR code. Use your exact network name and password, and pick <code>nopass</code> instead of <code>WPA</code> if the network is open. A generator will build the payload and escape special characters for you.</p>"
    },
    {
      q: "Do Wi-Fi QR codes work on iPhone and Android?",
      a: "<p>Yes, on both, using the built-in camera app. iOS has supported it since iOS 11 and Android since version 10, with earlier Android versions handling it through Google Lens. No separate scanning app is needed on any current phone.</p>"
    },
    {
      q: "Is a Wi-Fi QR code safe to display?",
      a: "<p>Anyone who can see the code can join the network, exactly as if they could see the password written down. That is fine for a guest network, and unwise for the network your own devices are on. Use a separate guest network for anything on public display.</p>"
    },
    {
      q: "Why does my Wi-Fi QR code not connect?",
      a: "<p>Usually a mismatch in the network name or an unescaped special character in the password. Check capitalisation, check for a trailing space, and confirm the security type &mdash; a WPA3 network still uses <code>WPA</code>, but selecting <code>WEP</code> by mistake will fail every time.</p>"
    }
  ]
};
