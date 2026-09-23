module.exports = {
  slug: "us-passport-photo-size",
  title: "US Passport Photo Size Requirements",
  description:
    "A US passport photo must be 2x2 inches, 600x600 pixels minimum, in color on a plain white background. Full specification, file size limits and common rejection reasons.",
  keywords: "us passport photo size, passport photo dimensions, 2x2 passport photo pixels, passport photo requirements, passport photo file size",
  date: "2026-08-22",
  readingTime: 6,
  related: ["image-compressor", "unit-converter"],

  body: `
<p>A US passport photo must be <strong>2 &times; 2 inches</strong> (51 &times; 51 mm). For a digital submission that means <strong>at least 600 &times; 600 pixels</strong>, and no larger than 1200 &times; 1200 pixels, saved as a JPEG under 240 KB.</p>
<p>Those numbers are the easy part. Most rejections are not about dimensions at all — they are about head size, shadows and expression. Here is the complete specification, and what actually gets photos sent back.</p>

<h2>The specification at a glance</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Requirement</th><th>Specification</th></tr></thead>
  <tbody>
    <tr><td>Printed size</td><td>2 &times; 2 inches (51 &times; 51 mm), square</td></tr>
    <tr><td>Digital dimensions</td><td>600 &times; 600 px minimum, 1200 &times; 1200 px maximum</td></tr>
    <tr><td>File format</td><td>JPEG (.jpg) only</td></tr>
    <tr><td>File size</td><td>Under 240 KB</td></tr>
    <tr><td>Resolution</td><td>300 DPI or higher</td></tr>
    <tr><td>Color</td><td>Full color, 24-bit. Not grayscale</td></tr>
    <tr><td>Head height</td><td>1 to 1&#8532; inches (25&ndash;35 mm), chin to crown</td></tr>
    <tr><td>Eye height</td><td>1&frac18; to 1&#8531; inches (28&ndash;35 mm) from the bottom</td></tr>
    <tr><td>Background</td><td>Plain white or off-white, no pattern, no shadow</td></tr>
    <tr><td>Age of photo</td><td>Taken within the last 6 months</td></tr>
  </tbody>
</table>
</div>

<h2>Head size is the most-failed requirement</h2>
<p>In a 2 &times; 2 inch photo, your head must measure between 1 and 1&#8532; inches from the bottom of the chin to the top of the head — including hair. That is roughly <strong>50 to 69 percent of the frame height</strong>.</p>
<p>In pixels, for a 600 &times; 600 px image, the head should be between 300 and 415 pixels tall, and your eyes should sit between 337 and 412 pixels from the bottom edge (equivalently 188 to 263 pixels from the top).</p>
<p>The two failure modes are equally common: standing too far from the camera so the head is too small, and cropping too tightly so the crown is cut off. When in doubt, leave a little space above the head — you can crop in afterwards, but you cannot add back what was never captured.</p>

<h2>Digital submission versus printed</h2>
<p>If you are applying online through Form DS-11 or renewing by mail with a digital upload, the file requirements above apply. If you are submitting a printed photo, you need two identical 2 &times; 2 inch prints on photo-quality paper, unmounted and uncut beyond the square.</p>
<p>Note that a photo taken at the correct 600 &times; 600 px resolution and printed at 300 DPI comes out at exactly 2 &times; 2 inches. That is not a coincidence — 600 pixels &divide; 300 DPI = 2 inches.</p>

<h2>Getting under the 240 KB limit</h2>
<p>A 600 &times; 600 px JPEG at quality 85 typically lands between 80 and 130 KB, comfortably inside the limit. A 1200 &times; 1200 px version at the same quality runs 250&ndash;400 KB and will usually need compressing.</p>
<p>The safe approach is to submit at 600 &times; 600 px. It meets the minimum exactly, keeps the file small, and there is no advantage to a larger image — the State Department's system does not reward extra resolution.</p>
<p>If your file is over 240 KB, resize to 600 &times; 600 first and only then reduce quality. Our <a href="/tools/image-compressor.html">image compressor</a> does both in one step and runs entirely in your browser, which matters here: a passport photo is identification, and uploading it to an unknown server to save 100 KB is a poor trade.</p>

<h2>What gets photos rejected</h2>

<h3>Shadows</h3>
<p>The single most common reason. Shadows on your face or behind you on the wall both fail. Face a window during daylight, or use two light sources at 45 degrees. Never use a direct on-camera flash — it creates a hard shadow outline behind your head.</p>

<h3>Expression</h3>
<p>A neutral expression or a natural smile is acceptable, but both eyes must be open and clearly visible, and your mouth should be closed. Wide grins that squint the eyes get rejected. Look directly at the camera with your head square, not tilted.</p>

<h3>Glasses</h3>
<p>Eyeglasses have not been permitted in US passport photos since November 2016. Remove them entirely. Rare medical exceptions require a signed doctor's statement.</p>

<h3>Head coverings</h3>
<p>Hats and headwear are not allowed unless worn daily for religious purposes or medical reasons, and even then the full face must be visible from the bottom of the chin to the top of the forehead, with no shadow cast across the face. Religious headwear requires a signed statement; medical requires a doctor's note.</p>

<h3>Background problems</h3>
<p>Plain white or off-white only. No patterns, no furniture, no doorframes, no other people, no pets. A white wall works if it is evenly lit; a white bedsheet works if it is smooth and taut, since creases read as pattern.</p>

<h3>Clothing</h3>
<p>Everyday clothing. No uniforms, nothing resembling a uniform, and no camouflage. Avoid white or very pale tops, which blend into the white background and blur your outline.</p>

<h3>Digital alterations</h3>
<p>No filters, no beauty modes, no retouching. Many phones apply skin smoothing automatically in portrait mode — turn it off. Detected alterations are grounds for rejection.</p>

<h2>Taking it yourself</h2>
<p>A phone camera is perfectly adequate if you set it up properly:</p>
<ol class="steps">
  <li>Stand about 4 feet from a plain, evenly lit white wall, with the camera roughly 4 feet from you at eye level.</li>
  <li>Have someone else take the photo. Selfies fail because arm's length distorts facial proportions.</li>
  <li>Use the rear camera, not the front one — it has better resolution and less distortion.</li>
  <li>Turn off portrait mode, beauty filters and flash. Use natural daylight from the front.</li>
  <li>Take several. Blinks and small head tilts are easy to miss until you review them at full size.</li>
  <li>Crop square to 2 &times; 2 proportions with the head filling 50&ndash;69 percent of the height.</li>
  <li>Export at 600 &times; 600 px as JPEG, then check the file is under 240 KB.</li>
</ol>

<h2>Other countries differ</h2>
<p>The US 2 &times; 2 inch square is unusual. Most of the world uses a 35 &times; 45 mm portrait format:</p>
<div class="table-scroll">
<table>
  <thead><tr><th>Country</th><th>Photo size</th><th>Head height</th></tr></thead>
  <tbody>
    <tr><td>United States</td><td>2 &times; 2 in (51 &times; 51 mm)</td><td>25&ndash;35 mm</td></tr>
    <tr><td>United Kingdom</td><td>35 &times; 45 mm</td><td>29&ndash;34 mm</td></tr>
    <tr><td>Schengen / EU</td><td>35 &times; 45 mm</td><td>32&ndash;36 mm</td></tr>
    <tr><td>Canada</td><td>50 &times; 70 mm</td><td>31&ndash;36 mm</td></tr>
    <tr><td>Australia</td><td>35 &times; 45 mm</td><td>32&ndash;36 mm</td></tr>
    <tr><td>India</td><td>51 &times; 51 mm</td><td>25&ndash;35 mm</td></tr>
  </tbody>
</table>
</div>
<p>Never reuse a US passport photo for a Schengen visa application, or vice versa. The aspect ratios are different and a cropped square will not satisfy a 35 &times; 45 mm requirement.</p>

<p class="note">Requirements are set by the US Department of State and can change. Confirm the current specification at travel.state.gov before submitting.</p>`,

  faqs: [
    {
      q: "What size is a US passport photo in pixels?",
      a: "<p>At least 600 &times; 600 pixels and no more than 1200 &times; 1200 pixels, square. 600 &times; 600 px at 300 DPI prints at exactly 2 &times; 2 inches, which is the required physical size, and keeps the file comfortably under the 240 KB limit.</p>"
    },
    {
      q: "What is the maximum file size for a US passport photo?",
      a: "<p>240 KB for digital submission, in JPEG format. A 600 &times; 600 px photo at quality 85 is typically 80 to 130 KB, so you rarely need aggressive compression — resize to 600 &times; 600 first and the file size usually takes care of itself.</p>"
    },
    {
      q: "Can I wear glasses in a US passport photo?",
      a: "<p>No. Eyeglasses have been prohibited since November 2016, with rare medical exceptions that require a signed doctor's statement. Remove glasses entirely before taking the photo.</p>"
    },
    {
      q: "Can I take my own passport photo with a phone?",
      a: "<p>Yes, provided you meet the specification. Use the rear camera, have someone else take it from about 4 feet away at eye level, use even natural light against a plain white wall, and turn off flash, portrait mode and any beauty filters. Selfies are rejected because arm's length distorts facial proportions.</p>"
    }
  ]
};
