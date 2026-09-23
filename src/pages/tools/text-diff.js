module.exports = {
  slug: "text-diff",
  title: "Text Compare — Diff Checker",
  h1: "Text Compare (Diff Checker)",
  description:
    "Compare two blocks of text and see every added, removed and changed line highlighted word by word. Free online diff checker that runs in your browser.",
  keywords: "text compare, diff checker, compare two texts, text difference tool, find changes between documents, online diff",

  tool: `
<div class="card">
  <div class="fields fields-2">
    <div>
      <label class="lbl" for="df-left">Original text</label>
      <textarea id="df-left" class="mono" spellcheck="false" placeholder="Paste the first version here.">The quick brown fox jumps over the lazy dog.
Contracts should be reviewed annually.
Payment is due within 30 days.
This line is unchanged.</textarea>
    </div>
    <div>
      <label class="lbl" for="df-right">Changed text</label>
      <textarea id="df-right" class="mono" spellcheck="false" placeholder="Paste the second version here.">The quick brown fox leaps over the lazy dog.
Contracts should be reviewed annually.
Payment is due within 14 days.
This line is unchanged.
A brand new closing line.</textarea>
    </div>
  </div>

  <div class="checks">
    <label><input type="checkbox" id="df-case"> Ignore capitalization</label>
    <label><input type="checkbox" id="df-ws"> Ignore whitespace</label>
    <label><input type="checkbox" id="df-punct"> Ignore punctuation</label>
  </div>

  <div class="seg" role="group" aria-label="View mode">
    <button type="button" data-df-view="split" aria-pressed="true">Side by side</button>
    <button type="button" data-df-view="unified" aria-pressed="false">Unified diff</button>
  </div>

  <div class="btnrow" style="margin-top:0">
    <button class="btn ghost sm" type="button" data-df="swap">Swap sides</button>
    <button class="btn ghost sm" type="button" data-df="copy-unified">Copy unified diff</button>
    <button class="btn ghost sm" type="button" data-df="clear">Clear both</button>
  </div>

  <div class="statgrid">
    <div class="stat"><b id="df-added">0</b><span>Lines added</span></div>
    <div class="stat"><b id="df-removed">0</b><span>Lines removed</span></div>
    <div class="stat"><b id="df-modified">0</b><span>Lines changed</span></div>
    <div class="stat hero"><b id="df-similarity">100%</b><span>Similarity</span></div>
  </div>

  <p class="note info" id="df-verdict"></p>

  <div id="df-output"></div>

  <div class="diff-legend">
    <span><i style="background:#dcfce7"></i>Added</span>
    <span><i style="background:#fee2e2"></i>Removed</span>
    <span><i style="background:#fef9c3"></i>Changed</span>
    <span><i style="background:#f8fafc;border:1px solid #e2e8f0"></i>Unchanged</span>
  </div>
</div>`,

  intro: `
<p class="lede">Paste two versions of anything — a contract, an email draft, a config file, a chunk of code — and see exactly what changed. Modified lines are highlighted word by word, so you can spot a single altered number in a wall of text.</p>`,

  content: `
<h2>How to compare two texts</h2>
<ol class="steps">
  <li><strong>Paste the original</strong> into the left box and the newer version into the right box.</li>
  <li><strong>Read the highlights.</strong> Green means added, red means removed, yellow means the line exists in both but changed. Inside a changed line, the specific words that differ are marked.</li>
  <li><strong>Use the ignore options</strong> when reformatting is creating noise — ignoring whitespace is especially useful for code and for text copied out of a PDF.</li>
  <li><strong>Switch to unified view</strong> to get the standard <code>+</code>/<code>-</code> diff format that pastes cleanly into a ticket, an email or a pull request comment.</li>
</ol>

<h2>What the similarity score means</h2>
<p>Similarity is the share of lines that came through completely unchanged. It is a quick sanity check rather than a precise metric: 100% means the two texts are identical, and a low number tells you the documents diverged substantially. For a fine-grained view, look at the word-level highlighting inside each changed line — a contract where one clause was rewritten can still show high line similarity while containing a change that matters enormously.</p>

<h2>Practical uses</h2>
<ul>
  <li><strong>Contracts and agreements.</strong> Compare the version you sent with the version that came back signed. Altered payment terms, dates and liability caps are exactly the kind of single-word change this tool surfaces.</li>
  <li><strong>Editing and proofreading.</strong> See what an editor actually changed rather than re-reading the whole piece.</li>
  <li><strong>Code and configuration.</strong> Find the one line that differs between a working config and a broken one.</li>
  <li><strong>Academic writing.</strong> Check what moved between drafts, or verify that a citation block was updated consistently.</li>
  <li><strong>Translations and localization.</strong> Confirm that a revised source string was carried through everywhere.</li>
  <li><strong>Data cleanup.</strong> Compare two exported lists to find records that were added or dropped.</li>
</ul>

<h2>How the comparison works</h2>
<p>Under the hood this uses Myers' diff algorithm, the same approach Git uses. Rather than comparing line 1 to line 1 and line 2 to line 2, it searches for the longest common subsequence between the two texts. That is what lets it recognize that you inserted a paragraph in the middle without reporting every subsequent line as changed — a naive comparison would show the whole rest of the document as different.</p>
<p>When a deleted line is immediately followed by an inserted one, the tool treats that pair as an edit rather than a delete plus an add, and runs a second word-level diff inside it. That is where the inline word highlighting comes from.</p>

<h2>The ignore options, and when to use them</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Option</th><th>What it does</th><th>Use it when</th></tr></thead>
  <tbody>
    <tr><td>Ignore capitalization</td><td>Treats "Payment" and "payment" as the same</td><td>Comparing text where only styling changed</td></tr>
    <tr><td>Ignore whitespace</td><td>Collapses runs of spaces and tabs, trims line ends</td><td>Code reindented, or text copied out of a PDF</td></tr>
    <tr><td>Ignore punctuation</td><td>Strips commas, periods, quotes and dashes</td><td>Checking whether wording changed, not typography</td></tr>
  </tbody>
</table>
</div>
<p>Note that these options change how lines are <em>matched</em>, but the original text is always what gets displayed. You will never lose your formatting by turning one on.</p>

<h2>Privacy: this matters here more than anywhere</h2>
<p>People paste genuinely sensitive material into diff tools — unsigned contracts, medical records, unreleased code, private correspondence. Many online diff checkers upload both texts to a server to process them, and some retain them.</p>
<p>This one does not. The entire algorithm runs in your browser as part of the page you already downloaded. Nothing is transmitted, nothing is stored, and there is no server that could log it. Load the page, go offline, and it still works — which is the simplest proof available.</p>`,

  faqs: [
    {
      q: "How do I compare two documents for differences?",
      a: "<p>Paste the original into the left box and the revised version into the right box. Added lines are green, removed lines are red, and lines that exist in both but changed are yellow with the specific differing words highlighted inside them.</p>"
    },
    {
      q: "Is my text uploaded anywhere?",
      a: "<p>No. The comparison runs entirely in your browser using JavaScript that is part of this page. Neither text is transmitted, logged or stored, which is why the tool continues to work if you disconnect from the internet.</p>"
    },
    {
      q: "Can it compare Word documents or PDFs?",
      a: "<p>Not directly — it works on plain text. Open the document, select all, copy, and paste into the boxes. For PDFs it also helps to enable \"Ignore whitespace\", because PDF copy-paste often inserts inconsistent spacing and line breaks.</p>"
    },
    {
      q: "What is a unified diff?",
      a: "<p>It is the standard format used by Git and most code review tools: removed lines are prefixed with a minus sign, added lines with a plus sign, and unchanged context lines with a space. Switch to the unified view and click \"Copy unified diff\" to paste it into a ticket or pull request.</p>"
    }
  ],

  related: ["word-counter", "case-converter", "qr-code-generator"]
};
