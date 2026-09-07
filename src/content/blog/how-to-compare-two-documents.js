module.exports = {
  slug: "how-to-compare-two-documents",
  title: "How to Compare Two Documents for Changes",

  description:
    "Find every difference between two versions of a text without installing anything. How diff tools work, what line-level and word-level comparison catch, and when each one is the right choice.",

  keywords: "compare two documents, text compare tool, find differences between two texts, diff checker, compare two versions of a document",

  date: "2026-10-10",
  readingTime: 6,
  related: ["text-diff", "word-counter", "case-converter"],

  body: `
<p><strong>Paste both versions into a comparison tool and it will highlight
every line that was added, removed or changed.</strong> No installation, no
account, and if the tool runs in your browser, the document never leaves your
machine &mdash; which matters when the thing you are comparing is a contract.</p>

<h2>What a diff actually does</h2>

<p>A comparison tool is not looking for "changes" in any human sense. It solves
a precise problem: what is the shortest sequence of insertions and deletions
that turns text A into text B?</p>

<p>The standard answer is Eugene Myers' 1986 algorithm, which finds the longest
common subsequence between the two documents and treats everything outside it as
a change. This is why diffs sometimes look odd. If you move a paragraph from the
top of a document to the bottom, a diff reports it as one deletion and one
insertion, because that genuinely is the shortest edit path. The tool has no
concept of "moved".</p>

<div class="note">
  <p><strong>Practical consequence:</strong> for a document that has been
  substantially reorganised, a diff will be noisy no matter how good the tool
  is. Compare section by section instead.</p>
</div>

<h2>Line-level versus word-level</h2>

<p>Most tools do both, and it helps to know which you are looking at.</p>

<p><strong>Line comparison</strong> asks whether each line is present in both
versions. It is fast and gives you the structural picture: three paragraphs
added, one removed. Its weakness is that changing a single word marks the whole
line as different, which tells you where to look but not what changed.</p>

<p><strong>Word comparison</strong> takes the lines that differ and works out
which words inside them changed. This is what produces the familiar
strikethrough-and-underline view, and it is what you want when the edit is
"thirty days" becoming "sixty days" in a clause.</p>

<div class="table-scroll">
<table>
  <thead><tr><th>Use case</th><th>Best view</th><th>Why</th></tr></thead>
  <tbody>
    <tr><td>Contract review</td><td>Word level</td><td>Single-word changes carry the legal weight</td></tr>
    <tr><td>Checking a rewrite</td><td>Line level</td><td>You want structure, not every reworded sentence</td></tr>
    <tr><td>Code or config files</td><td>Line level</td><td>Lines are the meaningful unit</td></tr>
    <tr><td>Proofreading two drafts</td><td>Word level</td><td>Catches typo fixes and small substitutions</td></tr>
    <tr><td>Verifying a copy-paste</td><td>Character level</td><td>Reveals invisible differences</td></tr>
  </tbody>
</table>
</div>

<h2>The invisible differences that cause the most trouble</h2>

<p>When two documents look identical but a tool insists they differ, it is
almost always one of these:</p>

<ul>
  <li><strong>Line endings.</strong> Windows ends lines with a carriage return
  and a line feed; macOS and Linux use just a line feed. A file that has crossed
  platforms can differ on every single line while looking untouched.</li>
  <li><strong>Smart quotes.</strong> Word and Google Docs silently convert
  <code>"</code> to <code>&ldquo;</code> and <code>'</code> to
  <code>&rsquo;</code>. Paste from a code editor and you get the straight
  versions. These are different characters.</li>
  <li><strong>Non-breaking spaces.</strong> A normal space is character 32; a
  non-breaking space is 160. They render identically and compare as different.</li>
  <li><strong>Trailing whitespace.</strong> Invisible by definition, and enough
  to mark a line as changed.</li>
</ul>

<p>A good comparison tool offers options to ignore whitespace, case and
punctuation. Turning on "ignore whitespace" resolves the line-ending and
trailing-space cases immediately, and is usually the right first move when a
diff looks nonsensical.</p>

<h2>A workflow that avoids surprises</h2>

<ol class="steps">
  <li>Compare with all options off first. This shows you literally everything,
  including the invisible characters.</li>
  <li>If the result is noise, enable "ignore whitespace" and look again.</li>
  <li>Read the summary counts before the detail &mdash; the number of added and
  removed lines tells you whether this is a light edit or a rewrite.</li>
  <li>For a contract or anything consequential, read the word-level view of
  every changed line rather than skimming the highlights. A negation inserted
  into a sentence is a one-word change with total meaning reversal.</li>
</ol>

<h2>Why browser-based matters here</h2>

<p>Document comparison is one of the few everyday tasks where the file is often
confidential: a draft contract, an offer letter, an unpublished manuscript,
internal policy. Uploading it to a server to find out that two words changed is
a poor trade.</p>

<p>A tool that runs entirely in the browser does the comparison locally in
JavaScript. Nothing is transmitted, so there is no copy on someone else's
infrastructure and no retention policy to read. You can verify this: load the
page, disconnect from the internet, and the comparison still works.</p>
`,

  faqs: [
    {
      q: "How do I compare two documents for differences?",
      a: "<p>Paste both versions into a text comparison tool. It will show added, removed and changed lines side by side, and highlight the specific words that differ within each changed line. For Word documents, copy the text out first &mdash; comparing the plain text avoids formatting noise.</p>"
    },
    {
      q: "Why does the tool show differences when the text looks identical?",
      a: "<p>Almost always invisible characters: Windows versus Unix line endings, smart quotes from a word processor, non-breaking spaces, or trailing spaces at the end of lines. Turning on the option to ignore whitespace usually resolves it.</p>"
    },
    {
      q: "Is it safe to compare confidential documents online?",
      a: "<p>Only with a tool that runs in your browser rather than uploading to a server. Browser-based comparison never transmits the text, which you can confirm by disconnecting from the internet and watching it still work. Tools that process server-side keep a copy, however briefly.</p>"
    },
    {
      q: "Can I compare two Word documents this way?",
      a: "<p>Yes, by copying the text from both and pasting it in. You will lose formatting differences such as bold or font changes &mdash; a plain-text comparison finds wording changes only. Word's own Compare feature covers formatting if that is what you need.</p>"
    }
  ]
};
