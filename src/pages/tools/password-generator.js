module.exports = {
  slug: "password-generator",
  title: "Strong Password Generator",
  h1: "Password Generator",
  description:
    "Generate strong random passwords and memorable passphrases using your browser's cryptographic randomness. See real entropy in bits and an offline crack-time estimate.",
  keywords: "password generator, strong password generator, random password, passphrase generator, secure password, password strength checker",

  tool: `
<div class="card">
  <label class="lbl" for="pw-out">Generated password</label>
  <div class="pw-line">
    <input type="text" id="pw-out" class="mono" readonly spellcheck="false" aria-live="polite">
    <button class="btn" type="button" data-pw="generate">Regenerate</button>
    <button class="btn ghost" type="button" data-pw="copy">Copy</button>
  </div>

  <div class="statgrid" style="margin-top:1rem">
    <div class="stat hero"><b id="pw-label">&mdash;</b><span>Strength</span></div>
    <div class="stat"><b id="pw-entropy">&mdash;</b><span>Entropy</span></div>
    <div class="stat"><b id="pw-length-out">&mdash;</b><span>Characters</span></div>
  </div>
  <div class="meter"><i id="pw-bar" style="width:0"></i></div>
  <p class="hint">Time to crack offline at 100 billion guesses per second: <strong id="pw-crack">&mdash;</strong></p>

  <hr>

  <div class="checks" role="radiogroup" aria-label="Password type">
    <label><input type="radio" name="pw-type" value="random" checked> Random characters</label>
    <label><input type="radio" name="pw-type" value="passphrase"> Memorable passphrase</label>
  </div>

  <div id="pw-random-opts">
    <label class="lbl" for="pw-length">Length: <span id="pw-length-v">20</span> characters</label>
    <input type="range" id="pw-length" min="8" max="64" step="1" value="20">
    <div class="checks" style="margin-top:.8rem">
      <label><input type="checkbox" id="pw-lower" checked> Lowercase (a&ndash;z)</label>
      <label><input type="checkbox" id="pw-upper" checked> Uppercase (A&ndash;Z)</label>
      <label><input type="checkbox" id="pw-digits" checked> Digits (0&ndash;9)</label>
      <label><input type="checkbox" id="pw-symbols" checked> Symbols (!@#$)</label>
      <label><input type="checkbox" id="pw-noamb"> Avoid look-alikes (l, 1, O, 0)</label>
    </div>
  </div>

  <div id="pw-phrase-opts" hidden>
    <label class="lbl" for="pw-words">Words: <span id="pw-words-v">4</span></label>
    <input type="range" id="pw-words" min="3" max="8" step="1" value="4">
    <div class="fields" style="margin-top:.8rem">
      <div>
        <label class="lbl" for="pw-sep">Separator</label>
        <select id="pw-sep">
          <option value="-">Hyphen ( - )</option>
          <option value=".">Period ( . )</option>
          <option value="_">Underscore ( _ )</option>
          <option value=" ">Space</option>
          <option value="">None</option>
        </select>
      </div>
    </div>
    <div class="checks">
      <label><input type="checkbox" id="pw-caps" checked> Capitalize words</label>
      <label><input type="checkbox" id="pw-num" checked> Add digits</label>
    </div>
  </div>
</div>

<div class="card">
  <h2 style="margin-top:0">Check a password you already use</h2>
  <label class="lbl" for="pw-check">Type or paste a password</label>
  <input type="text" id="pw-check" class="mono" spellcheck="false" autocomplete="off" placeholder="Nothing typed here is sent anywhere">
  <div class="statgrid" style="margin-top:.9rem">
    <div class="stat"><b id="pw-check-label">&mdash;</b><span>Strength</span></div>
    <div class="stat"><b id="pw-check-entropy">&mdash;</b><span>Entropy</span></div>
  </div>
  <div class="meter"><i id="pw-check-bar" style="width:0"></i></div>
  <p class="hint" id="pw-check-crack"></p>
</div>`,

  intro: `
<p class="lede">Generate a password that is genuinely random, using the cryptographic randomness built into your browser. Choose raw character strings for password managers, or a memorable passphrase for the handful of passwords you have to type by hand.</p>`,

  content: `
<h2>How to use the password generator</h2>
<ol class="steps">
  <li><strong>Pick a type.</strong> Random characters for anything stored in a password manager; a passphrase for logins you type manually, such as your device or your manager's master password.</li>
  <li><strong>Set the length.</strong> Twenty characters is a sensible default. Longer is always better and costs you nothing when a manager does the typing.</li>
  <li><strong>Copy it straight into your password manager.</strong> Never write it down in a note or a spreadsheet.</li>
</ol>

<h2>What "entropy" actually tells you</h2>
<p>Entropy, measured in bits, is the honest measure of password strength: it counts how many guesses an attacker would need. Each additional bit doubles that number. The formula is <code>length &times; log&#8322;(size of character pool)</code>, so a 12-character password drawn from 95 printable ASCII characters carries about 79 bits.</p>
<div class="table-scroll">
<table>
  <thead><tr><th>Entropy</th><th>Verdict</th><th>Realistic use</th></tr></thead>
  <tbody>
    <tr><td class="num">Under 28 bits</td><td>Very weak</td><td>Cracked instantly</td></tr>
    <tr><td class="num">28&ndash;40 bits</td><td>Weak</td><td>Minutes to hours</td></tr>
    <tr><td class="num">40&ndash;60 bits</td><td>Fair</td><td>Acceptable only with rate limiting and 2FA</td></tr>
    <tr><td class="num">60&ndash;80 bits</td><td>Strong</td><td>Fine for ordinary accounts</td></tr>
    <tr><td class="num">80+ bits</td><td>Very strong</td><td>Email, banking, password manager master key</td></tr>
  </tbody>
</table>
</div>
<p>The crack-time figure on this page assumes an offline attack at 100 billion guesses per second — a realistic rate for rented GPUs against a fast hash. It is deliberately pessimistic: a site that hashes properly with bcrypt or Argon2 would be far slower to attack, but you should never bet on that.</p>

<h2>Why substitutions like P@ssw0rd do not work</h2>
<p>Replacing letters with look-alike symbols feels clever, and attackers have known about it for twenty years. Every serious cracking tool applies these substitution rules automatically to a dictionary, so <code>P@ssw0rd!</code> falls in roughly the same time as <code>password</code>. The same is true of appending a year, capitalizing the first letter, or adding an exclamation mark at the end.</p>
<p>Real strength comes from unpredictability, not from looking complicated. A password chosen by a computer from a large space beats any pattern a human invents, which is exactly what the generator above does.</p>

<h2>Passphrases: strong and typeable</h2>
<p>A passphrase strings together several randomly chosen words. Because the words are picked at random by the machine rather than composed by you, the entropy is real: with a 256-word list, each word contributes 8 bits, so a four-word phrase plus digits lands around 38&ndash;40 bits, and adding words scales it up linearly.</p>
<p>The value of a passphrase is that you can actually remember and type it. Reserve them for the two or three passwords you must enter by hand — your computer login, your phone, and your password manager's master key. Everything else should be a long random string you never see.</p>

<h2>Practical rules that matter more than complexity</h2>
<ul>
  <li><strong>Never reuse a password.</strong> Reuse is what turns one company's breach into a compromise of your email, and from there everything else.</li>
  <li><strong>Use a password manager.</strong> Bitwarden, 1Password and KeePassXC all work well. It is the single change that most improves real-world security.</li>
  <li><strong>Turn on two-factor authentication</strong> on email, banking and your password manager. An app-based code or a hardware key beats SMS.</li>
  <li><strong>Stop rotating passwords on a schedule.</strong> NIST dropped that advice years ago; forced rotation pushes people toward predictable patterns. Change a password when there is a reason to.</li>
  <li><strong>Length beats symbols.</strong> Adding four characters helps far more than sprinkling punctuation into a short password.</li>
</ul>

<h2>Where the randomness comes from</h2>
<p>This generator uses <code>crypto.getRandomValues()</code>, the cryptographically secure random number generator built into every modern browser. It is not the ordinary <code>Math.random()</code>, which is predictable and unsuitable for anything security related. The code also applies rejection sampling so that no character is even slightly more likely than another — a subtle bias that weakens naive implementations.</p>
<p>Generation happens entirely on your device. No password is sent over the network, logged, or stored, including anything you paste into the strength checker.</p>`,

  faqs: [
    {
      q: "How long should a password be?",
      a: "<p>At least 16 characters for anything you care about, and 20 or more for email, banking and your password manager's master key. Since a password manager does the typing, there is no practical cost to making stored passwords longer.</p>"
    },
    {
      q: "Are these passwords sent to a server?",
      a: "<p>No. Everything is generated in your browser with <code>crypto.getRandomValues()</code>. Nothing is transmitted, logged or stored — including whatever you type into the strength checker. The page works with the network disconnected.</p>"
    },
    {
      q: "Is a passphrase safer than a random password?",
      a: "<p>At the same entropy they are equally safe; the difference is usability. A random 20-character string has more entropy than a typical four-word passphrase, but you cannot memorize it. Use random strings for everything stored in a manager, and a passphrase for the few passwords you type by hand.</p>"
    },
    {
      q: "Should I change my passwords every 90 days?",
      a: "<p>No. NIST removed that recommendation because scheduled rotation pushes people toward predictable variations like Summer2024 becoming Autumn2024. Use a long unique password per site, enable two-factor authentication, and change a password when there is an actual reason such as a breach notification.</p>"
    }
  ],

  related: ["qr-code-generator", "case-converter", "word-counter"]
};
