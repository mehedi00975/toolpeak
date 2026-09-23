module.exports = {
  slug: "compress-image-to-200kb",
  title: "How to Compress an Image to 200 KB",
  description:
    "Government portals and job applications often cap uploads at 200 KB. Here is the exact order of operations to hit that limit without your photo turning to mush.",
  keywords: "compress image to 200kb for online form, reduce photo size 200kb, image size reducer, passport photo file size",
  date: "2026-09-05",
  readingTime: 6,
  related: ["image-compressor", "unit-converter"],

  body: `
<p>You have filled in twelve fields, uploaded your photo, hit submit, and the form says <em>"File must be less than 200 KB"</em>. Your phone took a 4.2 MB picture. You need to lose 95 percent of the file and still look like yourself in the result.</p>

<p>This is entirely doable, and the order you do things in matters more than any single setting.</p>

<h2>The short version</h2>
<ol class="steps">
  <li>Crop to what actually needs to be in frame.</li>
  <li>Resize the longest edge to 1000&ndash;1200 pixels.</li>
  <li>Save as JPG at quality 75&ndash;85.</li>
  <li>Check the size, and only then push quality lower if you must.</li>
</ol>
<p>Our <a href="/tools/image-compressor.html">image compressor</a> does all four steps in one pass — set the target to 200 KB and it searches for the highest quality that fits. But it is worth understanding why that order works, because it applies to any tool you use.</p>

<h2>Why resizing beats compressing</h2>
<p>File size is driven by two independent things: how many pixels there are, and how precisely each one is stored.</p>
<p>Pixel count scales with area, not width. Halving a photo from 4000 px wide to 2000 px does not halve the file — it quarters it, because you also halved the height. Going from 4000 px to 1200 px removes about 91 percent of the pixels before compression does any work at all.</p>
<p>Here is roughly what a typical 12-megapixel phone photo looks like at JPEG quality 80:</p>

<div class="table-scroll">
<table>
  <thead><tr><th>Longest edge</th><th>Approximate size</th><th>Good enough for</th></tr></thead>
  <tbody>
    <tr><td class="num">4000 px</td><td class="num">3&ndash;5 MB</td><td>Large prints, heavy cropping</td></tr>
    <tr><td class="num">2000 px</td><td class="num">800 KB &ndash; 1.2 MB</td><td>Full-screen display on a laptop</td></tr>
    <tr><td class="num">1200 px</td><td class="num">250&ndash;400 KB</td><td>Any web form, email, most uploads</td></tr>
    <tr><td class="num">1000 px</td><td class="num">180&ndash;280 KB</td><td>Comfortably under a 200 KB cap after tuning</td></tr>
    <tr><td class="num">600 px</td><td class="num">70&ndash;120 KB</td><td>Thumbnails, tight limits like 100 KB</td></tr>
  </tbody>
</table>
</div>

<p>Notice that a 1000&ndash;1200 px image is already close to 200 KB. From there you only need a modest quality reduction, and modest quality reductions are invisible. If instead you keep 4000 px and force the file down to 200 KB with quality alone, you land somewhere around quality 20, which looks exactly as bad as it sounds.</p>

<h2>What JPEG quality actually does</h2>
<p>JPEG quality is not a linear dial. The relationship between the number and the file size is steep at the top and shallow at the bottom.</p>
<ul>
  <li><strong>100 to 90:</strong> file roughly halves. No visible difference to the naked eye.</li>
  <li><strong>90 to 80:</strong> another 30&ndash;40 percent off. Still essentially invisible on a photo.</li>
  <li><strong>80 to 70:</strong> modest savings. Faint softening in fine detail.</li>
  <li><strong>70 to 50:</strong> small savings, visible damage. Blocky artifacts appear around sharp edges and in smooth gradients like skies and skin.</li>
  <li><strong>Below 50:</strong> obvious degradation for very little further gain.</li>
</ul>
<p>The sweet spot for almost everything is <strong>75 to 85</strong>. That is where you get the majority of the compression benefit before the visible cost starts.</p>

<h2>Passport and ID photos have extra rules</h2>
<p>If the 200 KB limit is on a passport, visa or ID application, the file size is usually the least demanding requirement. Check the specification for:</p>
<ul>
  <li><strong>Exact pixel dimensions.</strong> US passport photos are 2&times;2 inches, commonly 600&times;600 px at 300 DPI. UK and Schengen applications use 35&times;45 mm.</li>
  <li><strong>A minimum size as well as a maximum.</strong> Some portals reject anything under 20 KB as too low quality.</li>
  <li><strong>Format.</strong> JPG is nearly always required. WebP is usually rejected outright.</li>
  <li><strong>Background and framing.</strong> Plain light background, face occupying a specified proportion of the frame.</li>
</ul>
<p>A 600&times;600 px photo at quality 85 typically comes out around 80&ndash;120 KB, which is comfortably inside a 200 KB cap without any aggressive compression at all.</p>

<h2>Do not re-save the same JPEG repeatedly</h2>
<p>JPEG is lossy, and the loss compounds. Every time you open a JPEG and save it again, the encoder throws away a little more detail — even if you pick a high quality setting. Do it five or six times and you get visible blockiness and color banding that no amount of quality can restore.</p>
<p>Always compress from the original file. If you have already saved a compressed copy and it came out too small or too soft, go back to the source photo rather than re-processing the copy.</p>

<h2>Choosing a format</h2>
<p><strong>JPG</strong> for photographs and scanned documents. Universally accepted, and the format every "maximum 200 KB" rule was written with in mind.</p>
<p><strong>PNG</strong> for screenshots, logos and line art, or anything needing transparency. PNG is lossless, so it has no quality dial — the only way to shrink a PNG is to reduce its dimensions or its color palette. A photo saved as PNG will typically be five to ten times larger than the same photo as JPG, which is why a screenshot of a photo sometimes fails a size limit that the photo itself would pass.</p>
<p><strong>WebP</strong> is 25&ndash;35 percent smaller than JPG at matched quality, and it is excellent for your own website. Do not use it for form uploads: plenty of government portals and older enterprise systems still reject it.</p>

<h2>When 200 KB is genuinely not enough</h2>
<p>Occasionally the content and the limit are simply incompatible — a detailed landscape or a dense multi-column document scan. Your options, in order of how much quality they cost:</p>
<ol>
  <li><strong>Crop harder.</strong> Fewer pixels of content is free size reduction, and forms rarely need the whole scene.</li>
  <li><strong>Drop the dimensions further</strong>, to 800 px on the longest edge.</li>
  <li><strong>Convert a scanned document to grayscale.</strong> Removing color information can cut 20&ndash;30 percent from a text scan with no readability loss.</li>
  <li><strong>Only then</strong> push quality below 70.</li>
</ol>

<h2>Do it without uploading your photo</h2>
<p>Most "compress image online" sites upload your file to a server. For a holiday snap that is fine. For a passport scan, a signed contract or a medical document, you are handing a copy of sensitive identification to a third party with an unknown retention policy.</p>
<p>Our <a href="/tools/image-compressor.html">image compressor</a> runs entirely in your browser using the canvas API. Set the target to 200 KB, add your photo, and it binary-searches the quality settings to find the largest file that fits underneath your limit — automatically reducing dimensions if quality alone cannot get there. The image never crosses the network. You can verify that by loading the page, switching off your connection, and compressing anyway.</p>`,

  faqs: [
    {
      q: "What size should a photo be to fit under 200 KB?",
      a: "<p>Around 1000 to 1200 pixels on the longest edge, saved as JPG at quality 75 to 85. That combination lands between roughly 150 and 250 KB for a typical photo, so a small quality adjustment gets you comfortably under the cap.</p>"
    },
    {
      q: "Will compressing to 200 KB ruin the quality?",
      a: "<p>Not if you resize first. The visible damage comes from forcing a full-resolution image down with quality alone. Reduce the dimensions to what is actually needed, then compress at quality 75 to 85, and the result is essentially indistinguishable at normal viewing size.</p>"
    },
    {
      q: "Is it safe to compress a passport photo on a website?",
      a: "<p>Only if the tool processes it locally in your browser. Most online compressors upload your file to their servers. Use a browser-based tool for anything containing identification, and check that it still works with your connection switched off — that is proof nothing is being uploaded.</p>"
    },
    {
      q: "Why is my PNG so much larger than a JPG?",
      a: "<p>PNG is lossless, storing every pixel exactly, which makes it ideal for screenshots and logos but very inefficient for photographs. The same photo can be five to ten times larger as a PNG. For a size-limited form upload, convert photos to JPG.</p>"
    }
  ]
};
