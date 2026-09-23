module.exports = {
  slug: "image-compressor",
  title: "Image Compressor — Photo Under 200 KB",
  h1: "Image Compressor",
  description:
    "Compress a photo to an exact size such as 200 KB for an online form. Runs entirely in your browser — your image is never uploaded. Free, no sign-up, no watermark.",
  keywords: "image compressor, compress image to 200kb, reduce image size, compress jpeg online, resize photo for form upload, photo size reducer",

  tool: `
<div class="card">
  <div class="ic-drop" id="ic-drop" tabindex="0" role="button" aria-label="Choose an image to compress">
    <p style="margin:0 0 .4rem;font-size:1.6rem" aria-hidden="true">&#128247;</p>
    <p style="margin:0;font-weight:600">Drop an image here, click to browse, or paste from the clipboard</p>
    <p class="hint" style="margin:.3rem 0 0">JPG, PNG, WebP or GIF &middot; nothing is uploaded</p>
    <input type="file" id="ic-file" accept="image/*" hidden>
  </div>

  <div class="fields" style="margin-top:1.1rem">
    <div>
      <p class="lbl">Compression mode</p>
      <div class="checks" role="radiogroup" aria-label="Compression mode">
        <label><input type="radio" name="ic-mode" value="target" checked> Target file size</label>
        <label><input type="radio" name="ic-mode" value="quality"> Manual quality</label>
      </div>
    </div>
    <div>
      <label class="lbl" for="ic-format">Output format</label>
      <select id="ic-format">
        <option value="image/jpeg" selected>JPG (smallest, best for photos)</option>
        <option value="image/webp">WebP (smaller still, modern browsers)</option>
        <option value="image/png">PNG (lossless, best for graphics)</option>
      </select>
    </div>
  </div>

  <div id="ic-target-wrap">
    <label class="lbl" for="ic-target">Target file size</label>
    <input type="text" id="ic-target" value="200 KB" inputmode="text" autocomplete="off">
    <div class="seg" style="margin-top:.5rem">
      <button type="button" data-ic-preset="50 KB">50 KB</button>
      <button type="button" data-ic-preset="100 KB">100 KB</button>
      <button type="button" data-ic-preset="200 KB">200 KB</button>
      <button type="button" data-ic-preset="500 KB">500 KB</button>
      <button type="button" data-ic-preset="1 MB">1 MB</button>
    </div>
  </div>

  <div id="ic-quality-wrap" hidden>
    <label class="lbl" for="ic-quality">Quality: <span id="ic-quality-v">80%</span></label>
    <input type="range" id="ic-quality" min="0.1" max="1" step="0.05" value="0.8">
  </div>

  <label class="lbl" for="ic-maxdim" style="margin-top:1rem">
    Maximum width or height: <span id="ic-maxdim-v">1600</span> px
  </label>
  <input type="range" id="ic-maxdim" min="200" max="4000" step="100" value="1600">
  <p class="hint">Resizing is the single most effective way to cut file size. 1600 px is plenty for any web form or email.</p>

  <p class="note info" id="ic-status" hidden></p>

  <div class="ic-grid" id="ic-info" hidden>
    <div>
      <img id="ic-preview" class="ic-preview" alt="Compressed image preview" hidden>
    </div>
    <div>
      <div class="kv"><span>File</span><b id="ic-orig-name">&mdash;</b></div>
      <div class="kv"><span>Original size</span><b id="ic-orig-size">&mdash;</b></div>
      <div class="kv"><span>Original dimensions</span><b id="ic-orig-dim">&mdash;</b></div>
      <div class="kv"><span>New size</span><b id="ic-new-size">&mdash;</b></div>
      <div class="kv"><span>New dimensions</span><b id="ic-new-dim">&mdash;</b></div>
      <div class="kv"><span>Reduction</span><b id="ic-saved">&mdash;</b></div>
      <div class="btnrow">
        <button class="btn" type="button" id="ic-download" disabled>Download</button>
      </div>
    </div>
  </div>
</div>`,

  intro: `
<p class="lede">Upload forms that reject your photo for being "too large" are the most common reason people compress an image. Set a target such as 200 KB and this tool finds the highest quality that fits underneath it — entirely inside your browser, with no upload and no watermark.</p>`,

  content: `
<h2>How to compress an image to a size limit</h2>
<ol class="steps">
  <li><strong>Add your photo.</strong> Drag it onto the box, click to browse, or paste directly from the clipboard with Ctrl+V.</li>
  <li><strong>Set the target size.</strong> Type the exact limit the form asks for, such as <code>200 KB</code>, or tap one of the presets.</li>
  <li><strong>Let it search.</strong> The tool tries a sequence of quality settings and keeps the best one that lands under your limit. If quality alone is not enough, it reduces the dimensions and tries again.</li>
  <li><strong>Check the preview, then download.</strong> The result opens at its real size so you can confirm it still looks acceptable.</li>
</ol>

<h2>Why your photo is too big in the first place</h2>
<p>A modern phone camera produces 12 to 50 megapixel images, typically 4 to 12 MB each. A passport photo box on a government form often accepts 200 KB. That is a reduction of 95 percent or more, and it is achievable because almost none of that data is needed at the size the image will actually be viewed.</p>
<p>Two things drive file size, and they are not equally important:</p>
<ul>
  <li><strong>Dimensions.</strong> Halving the width and height quarters the pixel count. This is the biggest single lever, and it is usually free of visible cost — a 4000 px wide photo displayed in a 600 px box is throwing away 85 percent of its detail regardless.</li>
  <li><strong>Quality (compression level).</strong> JPEG quality is a dial from roughly 10 to 100. Between 100 and 80 the file shrinks dramatically with almost no visible change. Below about 60, blocky artifacts start appearing around edges and in smooth gradients like skies.</li>
</ul>
<p>The right order is always: resize first, then compress. Compressing a 4000 px image to 200 KB produces visible mush; resizing it to 1200 px and then compressing to 200 KB usually looks fine.</p>

<h2>Choosing a format</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Format</th><th>Best for</th><th>Watch out for</th></tr></thead>
  <tbody>
    <tr><td>JPG</td><td>Photographs, scanned documents, anything with gradients</td><td>No transparency; repeated re-saving degrades quality</td></tr>
    <tr><td>WebP</td><td>The same content as JPG, typically 25&ndash;35% smaller</td><td>A few older systems and some government portals still reject it</td></tr>
    <tr><td>PNG</td><td>Logos, screenshots, line art, anything needing transparency</td><td>Lossless, so it has no quality dial and stays large for photos</td></tr>
  </tbody>
</table>
</div>
<p>If a form does not specify, choose JPG. It is universally accepted and it is what almost every "maximum 200 KB" rule was written for.</p>

<h2>Common size limits you will meet</h2>
<ul>
  <li><strong>Government and visa portals:</strong> 100&ndash;300 KB for photos, sometimes 50 KB for signatures.</li>
  <li><strong>Job application systems:</strong> 1&ndash;2 MB per attachment.</li>
  <li><strong>Email attachments:</strong> 25 MB total for Gmail and Outlook, though anything over 10 MB is inconsiderate.</li>
  <li><strong>Website hero images:</strong> aim under 200 KB; every extra 100 KB is measurable in load time on mobile.</li>
  <li><strong>Forum and marketplace uploads:</strong> commonly 500 KB to 2 MB.</li>
</ul>

<h2>Nothing leaves your device</h2>
<p>This compressor uses the HTML canvas API that is already in your browser. Your image is decoded, resized and re-encoded locally, and the resulting file is created in memory for you to download. No image is transmitted to any server, which matters when the photo is a passport scan, a medical document or an ID card. You can verify it: load this page, disconnect from the internet, and compress an image — it still works.</p>

<h2>When the target cannot be reached</h2>
<p>Occasionally a limit is simply too small for the content, for example 20 KB for a detailed landscape. In that case reduce the maximum dimension slider — going from 1600 px to 800 px cuts the pixel count by 75 percent and will almost always get you there. Cropping tightly before compressing also helps, since fewer pixels means fewer bytes.</p>`,

  faqs: [
    {
      q: "How do I compress an image to exactly 200 KB?",
      a: "<p>Add your photo, leave the mode on \"Target file size\", and set the target to 200 KB (or tap the preset). The tool runs a binary search across JPEG quality levels and keeps the highest quality result that still fits under 200 KB. If quality alone cannot get there, it automatically steps the dimensions down and tries again.</p>"
    },
    {
      q: "Is my photo uploaded to a server?",
      a: "<p>No. All processing happens in your browser using the canvas API. The file never crosses the network, there is no temporary storage, and nothing is logged. This is why the tool keeps working when you are offline.</p>"
    },
    {
      q: "Will compressing make my photo look bad?",
      a: "<p>Usually not noticeably. Between quality 100 and 80 a JPEG loses more than half its size with almost no visible change. Problems appear below roughly quality 60, or when a very large image is squeezed into a very small limit without resizing first — which is why this tool reduces dimensions before pushing quality down that far.</p>"
    },
    {
      q: "What is the difference between resizing and compressing?",
      a: "<p>Resizing changes the pixel dimensions of the image, for example 4000 px wide down to 1200 px. Compressing keeps the dimensions and stores the same pixels less precisely. Resizing is the more powerful lever and costs less visible quality, so the best results come from resizing first and compressing second.</p>"
    }
  ],

  related: ["unit-converter", "qr-code-generator", "word-counter"]
};
