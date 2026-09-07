module.exports = {
  slug: "word-counter",
  title: "Word Counter — Words & Reading Time",
  h1: "Word Counter",
  description:
    "Free word counter. Count words, characters with and without spaces, sentences, paragraphs, reading time and page count as you type. Nothing is uploaded.",
  keywords: "word counter, character counter, word count tool, reading time calculator, how many pages is 1000 words",

  tool: `
<div class="card">
  <label class="lbl" for="wc-input">Paste or type your text</label>
  <textarea id="wc-input" placeholder="Start typing or paste your text here. Everything is counted instantly, on your device." spellcheck="false" autocomplete="off"></textarea>

  <div class="statgrid">
    <div class="stat hero"><b id="wc-words">0</b><span>Words</span></div>
    <div class="stat hero"><b id="wc-chars">0</b><span>Characters</span></div>
    <div class="stat"><b id="wc-chars-ns">0</b><span>No spaces</span></div>
    <div class="stat"><b id="wc-sentences">0</b><span>Sentences</span></div>
    <div class="stat"><b id="wc-paragraphs">0</b><span>Paragraphs</span></div>
    <div class="stat"><b id="wc-reading">0 sec</b><span>Reading time</span></div>
  </div>

  <div class="statgrid">
    <div class="stat"><b id="wc-speaking">0 sec</b><span>Speaking time</span></div>
    <div class="stat"><b id="wc-unique">0</b><span>Unique words</span></div>
    <div class="stat"><b id="wc-avg">0</b><span>Avg word length</span></div>
    <div class="stat"><b id="wc-pages">0.00</b><span>Pages (single)</span></div>
    <div class="stat"><b id="wc-pages-double">0.00</b><span>Pages (double)</span></div>
    <div class="stat"><b id="wc-longest">&mdash;</b><span>Longest word</span></div>
  </div>

  <div class="btnrow">
    <button class="btn" type="button" data-wc="copy">Copy statistics</button>
    <button class="btn ghost" type="button" data-wc="copy-text">Copy text</button>
    <button class="btn ghost" type="button" data-wc="clear">Clear</button>
  </div>
</div>`,

  intro: `
<p class="lede">Type or paste anything and this word counter updates instantly — words, characters, sentences, paragraphs, reading time and an estimated page count. It runs entirely inside your browser, so your draft never leaves your device.</p>`,

  content: `
<h2>How to use the word counter</h2>
<ol class="steps">
  <li><strong>Paste your text.</strong> Drop in an essay, article, cover letter, product description or social post. There is no character limit and no upload step.</li>
  <li><strong>Read the counts.</strong> Words and characters update on every keystroke. The second row adds speaking time, unique words and page estimates.</li>
  <li><strong>Check against your limit.</strong> Most applications count words the same way this tool does: any run of characters separated by a space.</li>
  <li><strong>Copy the numbers.</strong> "Copy statistics" puts a plain-text summary on your clipboard for a submission form or an email to a client.</li>
</ol>

<h2>What each number actually measures</h2>
<p>Different platforms count differently, which is why two tools can disagree about the same paragraph. Here is exactly what this one does, so you can predict the result before you paste.</p>

<div class="table-scroll">
<table>
  <thead><tr><th>Metric</th><th>Definition used here</th><th>Typical use</th></tr></thead>
  <tbody>
    <tr><td>Words</td><td>Any sequence of non-space characters. "state-of-the-art" counts as one word, the same as Microsoft Word.</td><td>Essays, assignments, article briefs</td></tr>
    <tr><td>Characters</td><td>Every character including spaces, punctuation and line breaks.</td><td>Twitter/X, SMS, meta descriptions</td></tr>
    <tr><td>Characters (no spaces)</td><td>Every visible character with all whitespace removed.</td><td>Translation quotes, typesetting</td></tr>
    <tr><td>Sentences</td><td>Runs of text ending in a period, question mark or exclamation mark.</td><td>Readability checks</td></tr>
    <tr><td>Reading time</td><td>Words &divide; 238 words per minute, the adult silent-reading average.</td><td>Blog "5 min read" labels</td></tr>
    <tr><td>Speaking time</td><td>Words &divide; 130 words per minute, an unhurried presentation pace.</td><td>Speeches, video scripts</td></tr>
    <tr><td>Pages</td><td>500 words per single-spaced page, 250 per double-spaced page (12&nbsp;pt, 1&nbsp;inch margins).</td><td>Academic page requirements</td></tr>
  </tbody>
</table>
</div>

<h2>Word limits worth memorizing</h2>
<p>If you write for the web or for school, a handful of limits come up constantly. A meta description gets cut off around 155&ndash;160 characters in Google results. A title tag has roughly 60 characters before truncation. LinkedIn headlines allow 220 characters, and an X post allows 280. College application essays commonly cap at 650 words, while the average blog post that ranks on page one of Google runs between 1,400 and 2,000 words.</p>
<p>For speaking, the arithmetic is simple: a 5-minute talk is about 650 words, a 10-minute conference session about 1,300, and a 60-second video script about 130&ndash;150 words. Aim for the lower end — nobody has ever complained that a presentation finished early.</p>

<h2>Why the count runs on your device</h2>
<p>Most word counters send your text to a server to be processed. That means an unpublished manuscript, a confidential contract or a client's copy sits in somebody else's log file. This page ships the counting logic inside the HTML you already downloaded, so the work happens locally. You can prove it: load the page, switch on airplane mode, and keep typing. The counter still works.</p>`,

  faqs: [
    {
      q: "How many pages is 1,000 words?",
      a: "<p>About 2 pages single-spaced or 4 pages double-spaced, using 12 pt Times New Roman with 1 inch margins. Switching to Arial or Calibri, or to 1.5 line spacing, moves that figure by roughly 10 percent, so treat page counts as an estimate and word counts as the real limit.</p>"
    },
    {
      q: "Does this word counter match Microsoft Word?",
      a: "<p>Yes, for normal prose. Both count any run of non-space characters as one word, so hyphenated compounds like \"long-term\" count once and numbers count as words. Small differences can appear with footnotes, text boxes and tracked changes, because Word can be configured to include or exclude them.</p>"
    },
    {
      q: "Is there a limit on how much text I can paste?",
      a: "<p>No fixed limit. The tool comfortably handles novel-length documents of several hundred thousand words. Because the counting happens in your browser rather than on a server, the only real constraint is your own device's memory.</p>"
    },
    {
      q: "Is my text stored or sent anywhere?",
      a: "<p>No. There is no upload, no database and no logging of what you type. The JavaScript that counts your words is part of the page itself, so the text never crosses the network. Close the tab and it is gone.</p>"
    }
  ],

  related: ["case-converter", "text-diff", "percentage-calculator"]
};
