module.exports = {
  slug: "unit-converter",
  title: "Unit Converter — Length, Weight & More",
  h1: "Unit Converter",
  description:
    "Free unit converter for length, weight, temperature, volume, area, speed, time and digital storage. Inches to cm, kg to lb, Celsius to Fahrenheit, MB to GB.",
  keywords: "unit converter, inches to cm, cm to inches, kg to lbs, celsius to fahrenheit, mb to gb, mm to inches calculator",

  tool: `
<div class="card">
  <div class="fields">
    <div>
      <label class="lbl" for="uc-group">Category</label>
      <select id="uc-group">
        <option value="length">Length &amp; distance</option>
        <option value="mass">Weight &amp; mass</option>
        <option value="temperature">Temperature</option>
        <option value="data">Digital storage</option>
        <option value="volume">Volume</option>
        <option value="area">Area</option>
        <option value="speed">Speed</option>
        <option value="time">Time</option>
      </select>
    </div>
    <div>
      <label class="lbl" for="uc-value">Value</label>
      <input type="number" id="uc-value" value="1" step="any" inputmode="decimal">
    </div>
  </div>

  <div class="fields">
    <div>
      <label class="lbl" for="uc-from">From</label>
      <select id="uc-from"></select>
    </div>
    <div>
      <label class="lbl" for="uc-to">To</label>
      <select id="uc-to"></select>
    </div>
  </div>

  <div class="btnrow" style="margin-top:0">
    <button class="btn ghost sm" type="button" data-uc="swap">Swap units</button>
  </div>

  <div class="result-box">
    <span class="lbl" style="margin:0">Result</span>
    <span class="out out-lg" id="uc-out">&mdash;</span>
    <p class="hint" id="uc-formula" style="margin-bottom:0"></p>
  </div>

  <p class="lbl" style="margin-top:1.2rem">Common conversions</p>
  <div class="seg">
    <button type="button" data-uc-preset="length:in:cm">inch &rarr; cm</button>
    <button type="button" data-uc-preset="length:cm:in">cm &rarr; inch</button>
    <button type="button" data-uc-preset="length:mm:in">mm &rarr; inch</button>
    <button type="button" data-uc-preset="length:ft:m">feet &rarr; m</button>
    <button type="button" data-uc-preset="length:mi:km">miles &rarr; km</button>
    <button type="button" data-uc-preset="mass:kg:lb">kg &rarr; lb</button>
    <button type="button" data-uc-preset="mass:lb:kg">lb &rarr; kg</button>
    <button type="button" data-uc-preset="mass:g:oz">g &rarr; oz</button>
    <button type="button" data-uc-preset="temperature:C:F">&deg;C &rarr; &deg;F</button>
    <button type="button" data-uc-preset="temperature:F:C">&deg;F &rarr; &deg;C</button>
    <button type="button" data-uc-preset="data:MB:GB">MB &rarr; GB</button>
    <button type="button" data-uc-preset="data:GB:MB">GB &rarr; MB</button>
  </div>
</div>`,

  intro: `
<p class="lede">Convert between metric and imperial units across eight categories — length, weight, temperature, volume, area, speed, time and digital storage. Pick a category, type a number, get the answer instantly.</p>`,

  content: `
<h2>How to use the unit converter</h2>
<ol class="steps">
  <li><strong>Choose a category</strong> such as length or weight. The unit menus update to match.</li>
  <li><strong>Type a value</strong> and select the units to convert from and to.</li>
  <li><strong>Read the result</strong> along with the base conversion factor, so you can reuse it later.</li>
  <li><strong>Use the shortcut buttons</strong> for the conversions people search for most.</li>
</ol>

<h2>Conversions worth memorizing</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Conversion</th><th>Exact factor</th><th>Quick mental version</th></tr></thead>
  <tbody>
    <tr><td>Inches to centimeters</td><td class="num">&times; 2.54</td><td>Double it and add a quarter</td></tr>
    <tr><td>Centimeters to inches</td><td class="num">&times; 0.3937</td><td>Divide by 2.5</td></tr>
    <tr><td>Millimeters to inches</td><td class="num">&divide; 25.4</td><td>25 mm is about 1 inch</td></tr>
    <tr><td>Feet to meters</td><td class="num">&times; 0.3048</td><td>Divide by 3, subtract a little</td></tr>
    <tr><td>Miles to kilometers</td><td class="num">&times; 1.609</td><td>Add 60 percent</td></tr>
    <tr><td>Kilograms to pounds</td><td class="num">&times; 2.2046</td><td>Double it and add 10 percent</td></tr>
    <tr><td>Pounds to kilograms</td><td class="num">&times; 0.4536</td><td>Halve it and take off 10 percent</td></tr>
    <tr><td>Celsius to Fahrenheit</td><td class="num">&times; 9/5 + 32</td><td>Double it and add 30</td></tr>
    <tr><td>Fahrenheit to Celsius</td><td class="num">(&minus;32) &times; 5/9</td><td>Subtract 30 and halve</td></tr>
    <tr><td>Liters to US gallons</td><td class="num">&divide; 3.785</td><td>Divide by 4, add a bit</td></tr>
  </tbody>
</table>
</div>

<h2>Temperature is not a simple multiplication</h2>
<p>Every other conversion here is a single multiply, because zero means the same thing in both units — zero meters is zero feet. Temperature scales have different zero points, so they need an offset as well as a scale factor. That is why <code>&deg;F = &deg;C &times; 9/5 + 32</code> rather than just a factor.</p>
<p>Two anchor points make Celsius and Fahrenheit easy to sanity-check: they meet at &minus;40&deg; (the same number on both scales), and 16&deg;C is almost exactly 61&deg;F — a digit-reversal coincidence that is easy to remember. Body temperature is 37&deg;C or 98.6&deg;F, and a comfortable room is 20&ndash;22&deg;C or 68&ndash;72&deg;F.</p>

<h2>Megabytes and gigabytes: the 1024 versus 1000 problem</h2>
<p>Digital storage has two competing definitions and both are in daily use. Operating systems and RAM specifications use binary units where 1 GB = 1024 MB. Drive manufacturers use decimal units where 1 GB = 1000 MB. This converter uses the binary convention (1024), because that is what Windows, macOS and file managers report.</p>
<p>The gap compounds with size: a drive sold as "1 TB" holds 1,000,000,000,000 bytes, which your operating system displays as about 931 GB. Nothing is missing — the two systems are simply counting differently. Strictly speaking the binary units should be written KiB, MiB and GiB, but almost nobody does outside of technical documentation.</p>

<h2>US gallons versus imperial gallons</h2>
<p>A US gallon is 3.785 liters; an imperial (UK) gallon is 4.546 liters — about 20 percent larger. The same split affects fluid ounces, pints and quarts, which is why British and American recipes with identical numbers can produce very different results. This converter lists both gallon types explicitly under Volume. Cups are worse still: a US cup is 236.6 ml, a metric cup is 250 ml, and a UK recipe cup can be either. For baking, weight in grams is always safer than volume.</p>

<h2>Precision and rounding</h2>
<p>Results are shown to a sensible number of significant figures rather than a fixed number of decimals, so a small conversion does not lose meaningful digits and a large one is not padded with noise. The conversion factors themselves are exact where an exact definition exists: an inch is defined as exactly 25.4 mm, a pound as exactly 0.45359237 kg, and a mile as exactly 1609.344 m.</p>`,

  faqs: [
    {
      q: "How many centimeters are in an inch?",
      a: "<p>Exactly 2.54 cm. This is a defined value, not a measurement, so it never changes. To go the other way, one centimeter is about 0.3937 inches, and dividing by 2.5 is close enough for most everyday purposes.</p>"
    },
    {
      q: "How do I convert kilograms to pounds in my head?",
      a: "<p>Double the kilograms and add ten percent. For 70 kg: double is 140, ten percent of that is 14, giving 154 lb. The exact factor is 2.2046, so the shortcut is accurate to within a fraction of a pound at normal body weights.</p>"
    },
    {
      q: "Why does my 1 TB drive show as 931 GB?",
      a: "<p>Because manufacturers count in decimal units (1 TB = 1,000,000,000,000 bytes) while your operating system counts in binary units (1 TB = 1,099,511,627,776 bytes). No storage is lost; the two systems just use different definitions of the same prefix.</p>"
    },
    {
      q: "Is a US gallon the same as a UK gallon?",
      a: "<p>No. A US gallon is 3.785 liters and an imperial gallon is 4.546 liters, roughly 20 percent larger. The same difference applies to pints, quarts and fluid ounces, so always check which system a recipe or fuel figure is using. Both are listed separately in the Volume category.</p>"
    }
  ],

  related: ["percentage-calculator", "bmi-calculator", "image-compressor"]
};
