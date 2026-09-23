module.exports = {
  slug: "mm-to-inches-conversion",
  title: "mm to Inches: Conversion Chart",
  description:
    "Millimeters to inches conversion chart, the exact formula, and quick mental shortcuts. Includes common sizes for screws, screens, paper and pipe fittings.",
  keywords: "mm to inches calculator, millimeters to inches, mm to inch conversion chart, 25mm in inches, how many mm in an inch",
  date: "2026-08-15",
  readingTime: 5,
  related: ["unit-converter", "percentage-calculator"],

  body: `
<p><strong>To convert millimeters to inches, divide by 25.4.</strong> To go the other way, multiply inches by 25.4.</p>
<p>That factor is exact, not an approximation. Since the international yard and pound agreement of 1959, one inch has been <em>defined</em> as precisely 25.4 millimeters, which means the conversion never drifts and never needs more decimal places.</p>

<h2>Conversion chart</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Millimeters</th><th>Inches (decimal)</th><th>Inches (nearest fraction)</th></tr></thead>
  <tbody>
    <tr><td class="num">1 mm</td><td class="num">0.0394"</td><td class="num">&#8531;&#8320;"</td></tr>
    <tr><td class="num">2 mm</td><td class="num">0.0787"</td><td class="num">&#8541;&#8320;"</td></tr>
    <tr><td class="num">3 mm</td><td class="num">0.1181"</td><td class="num">&#8539;"</td></tr>
    <tr><td class="num">5 mm</td><td class="num">0.1969"</td><td class="num">&#8541;&#8320;"</td></tr>
    <tr><td class="num">6 mm</td><td class="num">0.2362"</td><td class="num">&frac14;"</td></tr>
    <tr><td class="num">10 mm</td><td class="num">0.3937"</td><td class="num">&#8541;&#8320;"</td></tr>
    <tr><td class="num">12 mm</td><td class="num">0.4724"</td><td class="num">&frac12;"</td></tr>
    <tr><td class="num">15 mm</td><td class="num">0.5906"</td><td class="num">&#8541;&#8328;"</td></tr>
    <tr><td class="num">20 mm</td><td class="num">0.7874"</td><td class="num">&#8542;&#8324;"</td></tr>
    <tr><td class="num">25 mm</td><td class="num">0.9843"</td><td class="num">1"</td></tr>
    <tr><td class="num">25.4 mm</td><td class="num">1.0000"</td><td class="num">1" exactly</td></tr>
    <tr><td class="num">30 mm</td><td class="num">1.1811"</td><td class="num">1&#8539;"</td></tr>
    <tr><td class="num">50 mm</td><td class="num">1.9685"</td><td class="num">2"</td></tr>
    <tr><td class="num">100 mm</td><td class="num">3.9370"</td><td class="num">3&#8541;&#8328;"</td></tr>
    <tr><td class="num">150 mm</td><td class="num">5.9055"</td><td class="num">5&#8542;&#8328;"</td></tr>
    <tr><td class="num">200 mm</td><td class="num">7.8740"</td><td class="num">7&#8542;&#8328;"</td></tr>
    <tr><td class="num">250 mm</td><td class="num">9.8425"</td><td class="num">9&#8542;&#8328;"</td></tr>
    <tr><td class="num">300 mm</td><td class="num">11.8110"</td><td class="num">11&#8541;&#8320;"</td></tr>
    <tr><td class="num">500 mm</td><td class="num">19.6850"</td><td class="num">19&#8542;&#8328;"</td></tr>
    <tr><td class="num">1000 mm</td><td class="num">39.3701"</td><td class="num">39&#8542;&#8328;"</td></tr>
  </tbody>
</table>
</div>

<h2>Mental shortcuts</h2>
<p>You rarely need four decimal places in your head. These get you close enough to pick the right drill bit:</p>
<ul>
  <li><strong>25 mm is almost exactly 1 inch</strong> (off by 1.6 percent). This is the anchor to remember.</li>
  <li><strong>Divide by 25 and subtract a little.</strong> 150 mm &divide; 25 = 6, so slightly under 6 inches. The true answer is 5.91.</li>
  <li><strong>3 mm is about &#8539; inch</strong>, 6 mm is about &frac14;, 12 mm is about &frac12;, 19 mm is about &frac34;.</li>
  <li><strong>10 mm is about &#8541;&#8320; inch</strong> (0.394 versus 0.375 — close but noticeably different in precision work).</li>
</ul>

<h2>Where the confusion usually bites</h2>

<h3>Screws and fasteners</h3>
<p>Metric and imperial fasteners are not interchangeable even when they look identical. An M6 bolt has a 6 mm shank, which is 0.236 inches — close to &frac14; inch (0.25) but not the same, and the thread pitch differs entirely. Forcing an imperial nut onto a metric bolt strips both.</p>

<h3>Screen sizes</h3>
<p>Displays are measured diagonally in inches, but their bezels and mounting holes are specified in millimeters. A 27-inch monitor has a 685.8 mm diagonal, and its VESA mount will be 100 &times; 100 mm regardless of what the screen size is quoted in.</p>

<h3>Paper sizes</h3>
<p>A4 is 210 &times; 297 mm, which is 8.27 &times; 11.69 inches. US Letter is 8.5 &times; 11 inches, or 215.9 &times; 279.4 mm. A4 is narrower and taller. Printing a US Letter document on A4 without scaling clips the sides; printing A4 on Letter leaves a gap at the bottom. This is the single most common international printing annoyance.</p>

<h3>Pipe and plumbing</h3>
<p>Pipe sizes are the worst offender, because "nominal" sizes correspond to neither system exactly. A &frac12; inch pipe does not measure half an inch anywhere — the designation refers to a historical bore dimension. Never convert a nominal pipe size arithmetically; look it up in a fitting chart.</p>

<h3>Camera and lens specs</h3>
<p>Focal length is always in millimeters (50 mm, 200 mm), while filter threads are also in millimeters (77 mm) but sensor sizes are quoted in fractional inches (1/2.3", 1"). Those inch figures are a legacy of video camera tube diameters and do not describe the sensor's actual size at all — a 1-inch sensor has a diagonal of about 16 mm, not 25.4 mm.</p>

<h2>Precision and rounding</h2>
<p>For machining and engineering, keep four decimal places: 0.0394 inches per millimeter. For woodworking, three is plenty. For a rough sanity check, "divide by 25" is fine.</p>
<p>Watch out for compounding error. Converting a chain of measurements one at a time and rounding each step can accumulate a visible discrepancy. Convert once at the end wherever you can, and keep the full precision in between.</p>

<h2>Why 25.4 exactly?</h2>
<p>Before 1959 the inch varied slightly between countries — the US inch and the British imperial inch were defined differently, differing by about two parts per million. That was irrelevant for carpentry and unacceptable for aerospace manufacturing, where parts made on two continents had to fit together.</p>
<p>The 1959 international yard and pound agreement settled it by defining the yard as exactly 0.9144 meters. Divide by 36 and you get an inch of exactly 0.0254 meters, or 25.4 millimeters. Every inch measurement in the world has been anchored to the metric system ever since — including in the countries that do not use it.</p>

<p>For any conversion not in the table above, our <a href="/tools/unit-converter.html">unit converter</a> handles millimeters, centimeters, meters, inches, feet, yards and miles, along with weight, temperature, volume, area, speed and digital storage.</p>`,

  faqs: [
    {
      q: "How many millimeters are in an inch?",
      a: "<p>Exactly 25.4 millimeters. This is a defined value from the 1959 international yard and pound agreement, not a measured approximation, so it is precise to unlimited decimal places.</p>"
    },
    {
      q: "How do I convert mm to inches quickly in my head?",
      a: "<p>Divide by 25 and subtract a little. 25 mm is almost exactly 1 inch, so 150 mm is slightly under 6 inches (the exact answer is 5.91). For precision work use the full factor of 25.4.</p>"
    },
    {
      q: "Is 25 mm the same as 1 inch?",
      a: "<p>Almost, but not exactly. 25 mm is 0.9843 inches — about 1.6 percent short. One inch is 25.4 mm. The difference is negligible for rough measuring but matters for fasteners, machining and anything that needs to fit.</p>"
    },
    {
      q: "What is 10 mm in inches?",
      a: "<p>0.3937 inches, which is just over &#8541;&#8320; of an inch (0.375). For most practical purposes 10 mm and &#8541;&#8320; inch are interchangeable, but they are not identical and the gap shows up in precision work.</p>"
    }
  ]
};
