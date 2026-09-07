module.exports = {
  slug: "strong-password-guide",
  title: "What Makes a Password Strong",
  description:
    "Length beats complexity, P@ssw0rd is not clever, and forced 90-day rotation makes things worse. What actually protects an account, according to current NIST guidance.",
  keywords: "strong password, how long should a password be, password entropy, passphrase vs password, nist password guidelines",
  date: "2026-08-08",
  readingTime: 7,
  related: ["password-generator", "qr-code-generator"],

  body: `
<p>Most password advice is a decade out of date. The rules many organizations still enforce — mixed character classes, a symbol somewhere, a change every 90 days — were dropped from official guidance years ago, because measurement showed they made real-world security <em>worse</em>.</p>
<p>Here is what the evidence actually supports.</p>

<h2>Length beats complexity, by a wide margin</h2>
<p>Password strength is measured in bits of entropy: how many guesses an attacker needs. The formula is <code>length &times; log&#8322;(character pool size)</code>.</p>
<p>Adding character types grows the pool, but only inside a logarithm — so the returns are small. Adding length multiplies. Compare:</p>
<div class="table-scroll">
<table>
  <thead><tr><th>Password</th><th>Pool</th><th>Length</th><th>Entropy</th></tr></thead>
  <tbody>
    <tr><td><code>Tr0ub4&amp;</code></td><td class="num">95</td><td class="num">8</td><td class="num">52 bits</td></tr>
    <tr><td><code>abcdefghijklmnop</code></td><td class="num">26</td><td class="num">16</td><td class="num">75 bits</td></tr>
    <tr><td><code>correcthorsebatterystaple</code></td><td class="num">26</td><td class="num">25</td><td class="num">117 bits</td></tr>
  </tbody>
</table>
</div>
<p>The all-lowercase 16-character string beats the "complex" 8-character one by a factor of over 8 million, despite using no symbols, no digits and no capitals. Four extra characters is worth far more than sprinkling in punctuation.</p>
<p><em>One important caveat:</em> this arithmetic only holds when the characters are chosen randomly. <code>abcdefghijklmnop</code> has 75 bits of theoretical entropy and roughly zero real entropy, because it is an obvious pattern that any cracking tool tries immediately. Entropy measures unpredictability, not length alone.</p>

<h2>Why P@ssw0rd fails instantly</h2>
<p>Character substitution feels clever and is completely transparent to attackers. Every serious cracking tool — Hashcat, John the Ripper — applies substitution rules to dictionary words automatically. The transformation <code>a&rarr;@</code>, <code>o&rarr;0</code>, <code>i&rarr;1</code>, <code>e&rarr;3</code> is built into the default rule sets.</p>
<p>So <code>P@ssw0rd!</code> is not meaningfully harder than <code>password</code>. The same applies to:</p>
<ul>
  <li>Capitalizing the first letter (almost everyone does)</li>
  <li>Appending a year, especially the current one</li>
  <li>Adding <code>!</code> or <code>123</code> at the end</li>
  <li>Keyboard walks like <code>qwerty</code>, <code>1qaz2wsx</code> or <code>zxcvbnm</code></li>
  <li>Names, teams, birthdays, pet names — anything findable on social media</li>
</ul>
<p>Attackers do not start with brute force. They start with leaked password lists sorted by frequency, then apply mutation rules to those. A password that looks complicated but follows a common human pattern falls in the first few seconds of that process.</p>

<h2>How long is long enough?</h2>
<p>Assume an offline attack at 100 billion guesses per second — realistic for rented GPUs against a fast hash. For a randomly generated password:</p>
<div class="table-scroll">
<table>
  <thead><tr><th>Length</th><th>Lowercase only</th><th>Mixed case + digits</th><th>All printable ASCII</th></tr></thead>
  <tbody>
    <tr><td class="num">8</td><td>Under a second</td><td>2 minutes</td><td>1 hour</td></tr>
    <tr><td class="num">10</td><td>2 minutes</td><td>2 days</td><td>3 months</td></tr>
    <tr><td class="num">12</td><td>1 day</td><td>17 years</td><td>2,000 years</td></tr>
    <tr><td class="num">16</td><td>7,000 years</td><td>10 billion years</td><td>Beyond the age of the universe</td></tr>
    <tr><td class="num">20</td><td>Beyond the universe</td><td>Beyond the universe</td><td>Beyond the universe</td></tr>
  </tbody>
</table>
</div>
<p><strong>Practical minimum: 16 characters</strong> for anything you care about, and 20 or more for email, banking and your password manager's master key. Since a manager types them for you, longer costs nothing.</p>

<h2>Passphrases: the memorable option</h2>
<p>You cannot memorize twenty random characters, and you should not try. But you can memorize four random words.</p>
<p>The critical word is <em>random</em>. A phrase you compose yourself carries far less entropy than it appears to, because human word choice is heavily patterned. Words picked by a machine from a defined list give you calculable strength: with a 7,776-word Diceware list, each word contributes 12.9 bits, so six words gives 77 bits — strong enough for a master password you can actually remember.</p>
<p>Reserve passphrases for the two or three passwords you must type by hand: your device login, your phone, and your password manager. Everything else should be a long random string you never see.</p>

<h2>Stop rotating passwords on a schedule</h2>
<p>NIST removed the periodic-rotation recommendation from its Digital Identity Guidelines (SP 800-63B), and other standards bodies followed. The reasoning is behavioral: forced rotation does not produce new strong passwords, it produces predictable variations. <code>Summer2024!</code> becomes <code>Autumn2024!</code> becomes <code>Winter2025!</code>. Attackers know this pattern and exploit it.</p>
<p>Rotation also encourages weaker choices overall, because people optimize for what they can remember through repeated changes.</p>
<p><strong>Change a password when there is a reason:</strong> a breach notification, a shared password that needs revoking, a device you no longer control, or any suspicion of compromise. Otherwise leave a strong unique password alone.</p>

<h2>What matters more than the password itself</h2>

<h3>Never reuse</h3>
<p>This is the big one. Credential stuffing — taking usernames and passwords from one breach and trying them everywhere else — is the most common account takeover method there is. One reused password turns a forum breach into a compromise of your email, and from your email an attacker can reset everything else.</p>

<h3>Use a password manager</h3>
<p>It is the single change that most improves real security, because it makes unique long passwords effortless. Bitwarden, 1Password and KeePassXC are all solid. The common objection — "putting all my eggs in one basket" — misunderstands the alternative, which is reusing three passwords across ninety accounts.</p>

<h3>Turn on two-factor authentication</h3>
<p>Even a perfect password fails if the site is breached or you are phished. Two-factor authentication means a stolen password alone is not enough. In order of strength: hardware keys (YubiKey, passkeys) beat authenticator apps, which beat SMS codes. SMS is vulnerable to SIM swapping, but it is still far better than nothing.</p>

<h3>Protect your email above everything</h3>
<p>Your email account is the master key to every other account, because password resets go there. Give it your longest password and your strongest second factor.</p>

<h2>Where randomness comes from</h2>
<p>A generator is only as good as its source of randomness. <code>Math.random()</code> in a browser is a fast pseudo-random generator that is predictable given enough output — fine for shuffling a playlist, unsuitable for a password.</p>
<p>Our <a href="/tools/password-generator.html">password generator</a> uses <code>crypto.getRandomValues()</code>, the cryptographically secure generator built into every modern browser, with rejection sampling so no character is even slightly more likely than another. Generation happens entirely on your device — nothing is transmitted, logged or stored, including anything you paste into the strength checker.</p>

<h2>The short version</h2>
<ol class="steps">
  <li>Use a password manager and let it generate 20-character random passwords.</li>
  <li>Never reuse a password anywhere.</li>
  <li>Use a six-word random passphrase for the few passwords you type by hand.</li>
  <li>Turn on two-factor authentication, starting with email and banking.</li>
  <li>Stop scheduled rotation; change passwords when something actually happens.</li>
  <li>Length beats symbols. Randomness beats cleverness.</li>
</ol>`,

  faqs: [
    {
      q: "How long should a password be in 2026?",
      a: "<p>At least 16 characters for ordinary accounts, and 20 or more for email, banking and a password manager's master key. Because a password manager does the typing, there is no practical cost to making stored passwords longer.</p>"
    },
    {
      q: "Is a passphrase more secure than a random password?",
      a: "<p>At equal entropy they are equally secure; the difference is usability. A random 20-character string has more entropy than a typical four-word passphrase, but you cannot memorize it. Use random strings in a manager and a six-word passphrase for the handful you type by hand.</p>"
    },
    {
      q: "Should I change my passwords every 90 days?",
      a: "<p>No. NIST removed that recommendation because scheduled rotation produces predictable variations like Summer2024 becoming Autumn2024. Change a password when there is a real reason — a breach notice, a shared credential, or a suspected compromise.</p>"
    },
    {
      q: "Are password managers safe?",
      a: "<p>Yes, and they are substantially safer than the realistic alternative of reusing a few memorable passwords everywhere. Reputable managers encrypt your vault locally with a key derived from your master password, so the provider cannot read it. Protect the master password with a long passphrase and enable two-factor authentication on the account.</p>"
    }
  ]
};
