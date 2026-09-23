module.exports = {
  slug: "case-converter",
  title: "Text Case Converter",
  h1: "Text Case Converter",
  description:
    "Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case and more. Instant, free, and runs in your browser.",
  keywords: "case converter, uppercase to lowercase, title case converter, camelcase converter, snake case, text case changer",

  tool: `
<div class="card">
  <label class="lbl" for="cc-input">Your text</label>
  <textarea id="cc-input" placeholder="Paste the text you want to convert." spellcheck="false" autocomplete="off" style="min-height:150px">the quick brown fox jumps over the lazy dog</textarea>
  <p class="hint" id="cc-stats"></p>

  <p class="lbl" style="margin-top:1rem">Choose a case</p>
  <div class="seg" role="group" aria-label="Case options">
    <button type="button" data-case="upper" aria-pressed="true">UPPERCASE</button>
    <button type="button" data-case="lower" aria-pressed="false">lowercase</button>
    <button type="button" data-case="title" aria-pressed="false">Title Case</button>
    <button type="button" data-case="sentence" aria-pressed="false">Sentence case</button>
    <button type="button" data-case="camel" aria-pressed="false">camelCase</button>
    <button type="button" data-case="pascal" aria-pressed="false">PascalCase</button>
    <button type="button" data-case="snake" aria-pressed="false">snake_case</button>
    <button type="button" data-case="constant" aria-pressed="false">CONSTANT_CASE</button>
    <button type="button" data-case="kebab" aria-pressed="false">kebab-case</button>
    <button type="button" data-case="dot" aria-pressed="false">dot.case</button>
    <button type="button" data-case="alternating" aria-pressed="false">aLtErNaTiNg</button>
    <button type="button" data-case="inverse" aria-pressed="false">iNVERSE</button>
  </div>

  <label class="lbl" for="cc-output">Result</label>
  <textarea id="cc-output" readonly spellcheck="false" style="min-height:150px;background:var(--surface-2)"></textarea>

  <div class="btnrow">
    <button class="btn" type="button" data-cc="copy">Copy result</button>
    <button class="btn ghost" type="button" data-cc="swap">Use result as input</button>
    <button class="btn ghost" type="button" data-cc="download">Download .txt</button>
    <button class="btn ghost" type="button" data-cc="clear">Clear</button>
  </div>
</div>`,

  intro: `
<p class="lede">Paste text, pick a case, copy the result. Twelve conversions covering everyday writing and programming naming conventions — all instant, all local to your browser.</p>`,

  content: `
<h2>How to use the case converter</h2>
<ol class="steps">
  <li><strong>Paste your text</strong> into the first box. Line breaks and paragraphs are preserved.</li>
  <li><strong>Click a case button.</strong> The result appears immediately in the second box.</li>
  <li><strong>Copy or download.</strong> "Use result as input" chains conversions — handy for going from CONSTANT_CASE to Title Case in two clicks.</li>
</ol>

<h2>Every case, with an example</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Case</th><th>"the quick brown fox" becomes</th><th>Where you use it</th></tr></thead>
  <tbody>
    <tr><td>UPPERCASE</td><td>THE QUICK BROWN FOX</td><td>Headings, acronyms, form labels</td></tr>
    <tr><td>lowercase</td><td>the quick brown fox</td><td>Email addresses, tags, URLs</td></tr>
    <tr><td>Title Case</td><td>The Quick Brown Fox</td><td>Article headlines, book titles</td></tr>
    <tr><td>Sentence case</td><td>The quick brown fox</td><td>Body copy, UI microcopy</td></tr>
    <tr><td>camelCase</td><td>theQuickBrownFox</td><td>JavaScript and Java variables</td></tr>
    <tr><td>PascalCase</td><td>TheQuickBrownFox</td><td>Class names, React components</td></tr>
    <tr><td>snake_case</td><td>the_quick_brown_fox</td><td>Python, Ruby, SQL columns</td></tr>
    <tr><td>CONSTANT_CASE</td><td>THE_QUICK_BROWN_FOX</td><td>Environment variables, constants</td></tr>
    <tr><td>kebab-case</td><td>the-quick-brown-fox</td><td>URL slugs, CSS classes, file names</td></tr>
    <tr><td>dot.case</td><td>the.quick.brown.fox</td><td>Config keys, namespaces</td></tr>
  </tbody>
</table>
</div>

<h2>Title Case is not just "capitalize everything"</h2>
<p>Real title case leaves short function words in lowercase unless they start or end the title. This converter follows that rule, keeping articles (a, an, the), coordinating conjunctions (and, but, or, nor) and short prepositions (of, in, on, to, at, by, for) lowercase in the middle of a title. So <code>the lord of the rings</code> becomes <em>The Lord of the Rings</em>, not "The Lord Of The Rings" — the version that instantly marks a headline as machine-generated.</p>
<p>The first and last words are always capitalized, even when they are minor words. That matches the AP and Chicago style guides where they overlap, which covers the vast majority of editorial writing.</p>

<h2>Fixing text that arrived in the wrong case</h2>
<p>The most common rescue job is a block of text that came in ALL CAPS — pasted from a PDF, a legacy database export, or somebody who left caps lock on. Converting straight to lowercase loses your sentence starts and proper nouns. Use <strong>Sentence case</strong> instead: it lowercases everything, then re-capitalizes the first letter after each period, question mark or exclamation mark, and after each line break. You will still need to fix names by hand, but the paragraph structure survives.</p>
<p>Going the other way — turning a prose sentence into a URL slug or a CSS class — is what kebab-case is for. It strips punctuation, collapses whitespace, and joins the remaining words with hyphens, which is exactly the format search engines prefer in a URL.</p>

<h2>Programmers: mixed input is handled</h2>
<p>The programming cases do not just split on spaces. They also split on existing capital letters and separators, so <code>getUserID</code>, <code>get_user_id</code> and <code>Get User ID</code> all convert cleanly into whichever convention you need. Acronym runs like <code>XMLHttpRequest</code> are detected as a boundary between <code>XML</code> and <code>Http</code> rather than being split letter by letter.</p>`,

  faqs: [
    {
      q: "Does the converter keep my line breaks and paragraphs?",
      a: "<p>Yes, for the writing cases: UPPERCASE, lowercase, Title Case, Sentence case, alternating and inverse all preserve your line and paragraph structure exactly. The programming cases (camelCase, snake_case, kebab-case and friends) deliberately collapse all whitespace, because those formats are single tokens by definition.</p>"
    },
    {
      q: "How do I fix text that is stuck in ALL CAPS?",
      a: "<p>Choose Sentence case. It lowercases the whole block and then capitalizes the first letter of every sentence and every new line, which restores readable prose. Proper nouns still need a manual pass — no tool can reliably tell whether \"apple\" should be a fruit or a company.</p>"
    },
    {
      q: "Why are small words lowercase in Title Case?",
      a: "<p>Because that is what standard editorial style requires. Articles, coordinating conjunctions and short prepositions stay lowercase unless they are the first or last word in the title. This matches AP and Chicago style, and it is what professional headlines look like.</p>"
    },
    {
      q: "Are accented and non-English characters supported?",
      a: "<p>Yes. Case conversion is Unicode-aware, so <code>café</code>, <code>Zürich</code> and <code>ñandú</code> convert correctly rather than being stripped. The programming cases remove diacritics and punctuation because identifiers in most languages only allow plain ASCII letters, digits and underscores.</p>"
    }
  ],

  related: ["word-counter", "text-diff", "password-generator"]
};
